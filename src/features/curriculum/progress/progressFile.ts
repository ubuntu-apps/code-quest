// Keeps a copy of the learner's progress in a file they choose, so it survives the
// browser clearing its storage. Writing to a chosen file needs the File System Access
// API, which only Chrome and Edge on computers have; elsewhere the manual backup in
// ProgressBackupPanel is the way to keep progress safe.
//
// The browser's own storage stays the working copy (fast, offline, every browser);
// the file is a mirror of it, saved a moment after each change.

import { countLevels, createProgressBackup, parseProgressBackup, restoreProgressBackup } from './progressBackup'
import type { ProgressBackup } from './progressBackup'
import { BACKUP_STORES } from '../../../lib/stores'

/** The permission methods Chrome and Edge add to file handles (not yet in TypeScript's DOM types). */
interface PermissionedHandle extends FileSystemFileHandle {
  queryPermission?: (options: { mode: 'readwrite' }) => Promise<PermissionState>
  requestPermission?: (options: { mode: 'readwrite' }) => Promise<PermissionState>
}

type ShowSaveFilePicker = (options?: {
  suggestedName?: string
  startIn?: 'documents' | 'downloads' | 'desktop'
  types?: { description: string; accept: Record<string, string[]> }[]
}) => Promise<FileSystemFileHandle>

export type ProgressFileStatus =
  /** This browser can't keep a file up to date. */
  | 'unsupported'
  /** Supported, but no file is chosen. */
  | 'off'
  /** Saving to the file after each change. */
  | 'on'
  /** A file is chosen, but the browser wants the learner to allow saving again (after a restart). */
  | 'needs-permission'
  /** The file has progress this browser has lost; saving waits until the learner decides. */
  | 'file-has-more'
  /** The last save failed, e.g. the file was moved or deleted. */
  | 'error'

export interface ProgressFileState {
  status: ProgressFileStatus
  fileName: string | null
  lastSavedAt: Date | null
  /** Stages in the file and in this browser, when status is 'file-has-more'. */
  fileLevels: number
  localLevels: number
}

const DB_NAME = 'codequest-files'
const STORE = 'handles'
const HANDLE_KEY = 'progress'
const SAVE_DELAY_MS = 1500
const CHECK_EVERY_MS = 20000

let state: ProgressFileState = { status: 'unsupported', fileName: null, lastSavedAt: null, fileLevels: 0, localLevels: 0 }
const listeners = new Set<() => void>()
let handle: PermissionedHandle | null = null
let fileBackup: ProgressBackup | null = null
let lastWritten: string | null = null
let saveTimer: number | undefined
let writing: Promise<void> | null = null
let started = false

function setState(next: Partial<ProgressFileState>): void {
  state = { ...state, ...next }
  for (const listener of listeners) listener()
}

export function subscribeProgressFile(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getProgressFileState(): ProgressFileState {
  return state
}

function picker(): ShowSaveFilePicker | null {
  if (typeof window === 'undefined' || window.self !== window.top) return null
  const fn = (window as unknown as { showSaveFilePicker?: ShowSaveFilePicker }).showSaveFilePicker
  return typeof fn === 'function' && typeof indexedDB !== 'undefined' ? fn : null
}

export function isProgressFileSupported(): boolean {
  return picker() !== null
}

// --- The chosen file is remembered in IndexedDB (file handles can't go in localStorage).

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function dbRun<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb()
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = run(db.transaction(STORE, mode).objectStore(STORE))
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  } finally {
    db.close()
  }
}

const loadHandle = () => dbRun<PermissionedHandle | undefined>('readonly', (s) => s.get(HANDLE_KEY))
const storeHandle = (h: FileSystemFileHandle) => dbRun('readwrite', (s) => s.put(h, HANDLE_KEY))
const forgetHandle = () => dbRun('readwrite', (s) => s.delete(HANDLE_KEY))

// --- Reading and writing the file.

/** The learner data only, so the time stamp alone never counts as a change. */
function snapshot(): { backup: ProgressBackup; key: string; levels: number } {
  const backup = createProgressBackup()
  return { backup, key: JSON.stringify(backup.entries), levels: countLevels(backup.entries) }
}

async function readFile(h: FileSystemFileHandle): Promise<ProgressBackup | null> {
  const text = await (await h.getFile()).text()
  if (!text.trim()) return null
  try {
    return parseProgressBackup(text)
  } catch {
    return null
  }
}

async function writeFile(force = false): Promise<void> {
  if (!handle || (state.status !== 'on' && state.status !== 'error')) return
  const { backup, key, levels } = snapshot()
  if (!force && key === lastWritten) return
  // Never replace saved progress with an empty browser's nothing.
  if (levels === 0 && !force) return
  const h = handle
  const run = async () => {
    try {
      const writable = await h.createWritable()
      await writable.write(`${JSON.stringify(backup, null, 2)}\n`)
      await writable.close()
      lastWritten = key
      setState({ status: 'on', lastSavedAt: new Date() })
    } catch (error: unknown) {
      const denied = error instanceof DOMException && error.name === 'NotAllowedError'
      setState({ status: denied ? 'needs-permission' : 'error' })
    }
  }
  // One write at a time; a change during a write is picked up by the next check.
  writing = (writing ?? Promise.resolve()).then(run)
  await writing
}

function scheduleSave(): void {
  if (state.status !== 'on') return
  window.clearTimeout(saveTimer)
  saveTimer = window.setTimeout(() => void writeFile(), SAVE_DELAY_MS)
}

function startWatching(): void {
  if (started) return
  started = true
  // Everything that goes in a backup tells this when it changes, here or in another tab.
  for (const store of BACKUP_STORES) store.subscribe(scheduleSave)
  // Drafts are saved quietly while the learner types; this picks them up, and retries
  // after a write that failed.
  window.setInterval(() => void writeFile(), CHECK_EVERY_MS)
  // Save straight away when the learner switches away or closes the tab.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void writeFile()
  })
}

/**
 * With permission to the file: if it holds progress this browser has lost, wait for
 * the learner; otherwise bring the file up to date and keep saving.
 */
async function connect(h: PermissionedHandle): Promise<void> {
  handle = h
  startWatching()
  const local = snapshot()
  let inFile: ProgressBackup | null
  try {
    inFile = await readFile(h)
  } catch {
    setState({ status: 'error', fileName: h.name })
    return
  }
  const fileLevels = inFile ? countLevels(inFile.entries) : 0
  if (inFile && fileLevels > local.levels) {
    fileBackup = inFile
    setState({ status: 'file-has-more', fileName: h.name, fileLevels, localLevels: local.levels })
    return
  }
  lastWritten = inFile && JSON.stringify(inFile.entries) === local.key ? local.key : null
  setState({ status: 'on', fileName: h.name })
  await writeFile()
}

/** Called once when the app starts: picks up a file chosen in an earlier visit. */
let initialized = false

export async function initProgressFile(): Promise<void> {
  if (initialized || !isProgressFileSupported()) return
  initialized = true
  setState({ status: 'off' })
  let h: PermissionedHandle | undefined
  try {
    h = await loadHandle()
  } catch {
    return
  }
  if (!h) return
  const permission = h.queryPermission ? await h.queryPermission({ mode: 'readwrite' }).catch(() => 'prompt') : 'granted'
  if (permission === 'granted') await connect(h)
  else {
    handle = h
    setState({ status: 'needs-permission', fileName: h.name })
  }
}

/** Asks where to keep the file (must run from a click). */
export async function chooseProgressFile(): Promise<'chosen' | 'cancelled'> {
  const show = picker()
  if (!show) return 'cancelled'
  let h: FileSystemFileHandle
  try {
    h = await show({
      suggestedName: 'codequest-progress.json',
      startIn: 'documents',
      types: [{ description: 'CodeQuest progress', accept: { 'application/json': ['.json'] } }],
    })
  } catch {
    return 'cancelled'
  }
  await storeHandle(h).catch(() => undefined)
  lastWritten = null
  await connect(h)
  return 'chosen'
}

/** Asks the browser to allow saving to the chosen file again (must run from a click). */
export async function allowProgressFile(): Promise<boolean> {
  if (!handle) return false
  const permission = handle.requestPermission
    ? await handle.requestPermission({ mode: 'readwrite' }).catch(() => 'denied' as PermissionState)
    : 'granted'
  if (permission !== 'granted') return false
  await connect(handle)
  return true
}

/** The learner's answer when the file has progress this browser lost. */
export async function resolveProgressFile(choice: 'restore' | 'keep-browser'): Promise<number> {
  if (!handle) return 0
  let restored = 0
  if (choice === 'restore' && fileBackup) {
    restored = restoreProgressBackup(fileBackup)
    lastWritten = JSON.stringify(fileBackup.entries)
  }
  fileBackup = null
  setState({ status: 'on' })
  if (choice === 'keep-browser') await writeFile(true)
  return restored
}

/** Stops saving to the file. The file itself stays where it is. */
export async function stopProgressFile(): Promise<void> {
  window.clearTimeout(saveTimer)
  handle = null
  fileBackup = null
  lastWritten = null
  await forgetHandle().catch(() => undefined)
  setState({ status: 'off', fileName: null, lastSavedAt: null })
}
