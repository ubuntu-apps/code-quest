import { loadLanguageBundle, loadRootIndex } from './content/loadCurriculum'
import { LANGUAGE_PACKS } from '../languages'
import { requestPersistentStorageOnce } from './progress/storagePersistence'
import type { LanguageBundle } from './content/types'
import { STORES } from '../../lib/stores'


/** Thrown by downloadForOffline when its signal is aborted. */
export class OfflineDownloadCancelled extends Error {
  constructor() {
    super('Download cancelled.')
  }
}

export interface OfflineState {
  /** When the last full download finished (ISO time). */
  downloadedAt: string
  /** Course ids whose code runtime was downloaded. */
  runtimes: string[]
}

/** What a download is doing: the lessons, or a course's runtime (its language id). */
export type OfflineStep = 'lessons' | (string & {})

export function loadOfflineState(): OfflineState | null {
  try {
    const raw = STORES.offline.get()
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<OfflineState>
    if (typeof parsed.downloadedAt !== 'string' || !Array.isArray(parsed.runtimes)) return null
    return { downloadedAt: parsed.downloadedAt, runtimes: parsed.runtimes }
  } catch {
    return null
  }
}

function saveOfflineState(state: OfflineState): void {
  // Not fatal if it can't be saved: only the "last downloaded" note is lost.
  STORES.offline.set(JSON.stringify(state))
}

/** True when a service worker controls this page, so fetched files land in its caches. */
export function offlineCachingAvailable(): boolean {
  return typeof navigator !== 'undefined' && Boolean(navigator.serviceWorker?.controller)
}

/**
 * Fetches every lesson and the code runtimes for `runtimeCourses` while online.
 * The service worker caches what is fetched (see vite.config.ts), so it all works offline afterwards.
 */
export async function downloadForOffline(options: {
  baseUrl: string
  runtimeCourses: string[]
  onStep?: (step: OfflineStep) => void
  signal?: AbortSignal
}): Promise<OfflineState> {
  const { baseUrl, runtimeCourses, onStep, signal } = options
  const throwIfCancelled = () => {
    if (signal?.aborted) throw new OfflineDownloadCancelled()
  }
  if (!offlineCachingAvailable()) {
    throw new Error('Offline mode is not set up in this browser yet. Reload the page and try again.')
  }
  requestPersistentStorageOnce()

  onStep?.('lessons')
  const bundles: Record<string, LanguageBundle> = {}
  try {
    const root = await loadRootIndex(baseUrl)
    for (const lang of root.languages) {
      // fresh: really fetch through the service worker so it caches the files,
      // even if this session already loaded them (possibly before it was in control).
      bundles[lang.id] = await loadLanguageBundle(baseUrl, lang.path, { fresh: true })
    }
  } catch {
    throw new Error('Could not download the quests. Check your internet connection and try again.')
  }

  const runtimes: string[] = []
  for (const pack of LANGUAGE_PACKS) {
    const bundle = bundles[pack.id]
    if (!runtimeCourses.includes(pack.id) || !bundle) continue
    throwIfCancelled()
    onStep?.(pack.id)
    try {
      await pack.prepareOffline({ bundle, signal })
    } catch (error) {
      throwIfCancelled()
      throw error
    }
    runtimes.push(pack.id)
  }
  throwIfCancelled()

  const state = { downloadedAt: new Date().toISOString(), runtimes }
  saveOfflineState(state)
  return state
}

/** Bytes this site stores on the device, when the browser reports it. */
export async function storageUsedBytes(): Promise<number | null> {
  try {
    const estimate = await navigator.storage?.estimate?.()
    return typeof estimate?.usage === 'number' ? estimate.usage : null
  } catch {
    return null
  }
}

export type OfflineDownloadStatus =
  | { kind: 'idle' }
  | { kind: 'working'; step: OfflineStep }
  | { kind: 'done'; usedBytes: number | null }
  | { kind: 'cancelled' }
  | { kind: 'error'; message: string }

// The download lives here rather than in the Settings tab, so it keeps going (and
// keeps its progress) when the learner switches tabs, and can't be started twice.
let downloadStatus: OfflineDownloadStatus = { kind: 'idle' }
let downloadController: AbortController | null = null
const statusListeners = new Set<() => void>()

function setDownloadStatus(next: OfflineDownloadStatus): void {
  downloadStatus = next
  for (const listener of statusListeners) listener()
}

export function getOfflineDownloadStatus(): OfflineDownloadStatus {
  return downloadStatus
}

export function subscribeOfflineDownloadStatus(listener: () => void): () => void {
  statusListeners.add(listener)
  return () => statusListeners.delete(listener)
}

/** Starts "Download for offline" unless it is already running. Progress goes to the status above. */
export function startOfflineDownload(options: { baseUrl: string; runtimeCourses: string[] }): void {
  if (downloadController) return
  const controller = new AbortController()
  downloadController = controller
  setDownloadStatus({ kind: 'working', step: 'lessons' })
  void (async () => {
    try {
      await downloadForOffline({
        ...options,
        signal: controller.signal,
        onStep: (step) => setDownloadStatus({ kind: 'working', step }),
      })
      setDownloadStatus({ kind: 'done', usedBytes: await storageUsedBytes() })
    } catch (error: unknown) {
      setDownloadStatus(
        controller.signal.aborted
          ? { kind: 'cancelled' }
          : { kind: 'error', message: error instanceof Error ? error.message : 'The download failed. Try again.' },
      )
    } finally {
      downloadController = null
    }
  })()
}

/** Stops a running "Download for offline". Files already fetched stay cached. */
export function cancelOfflineDownload(): void {
  downloadController?.abort()
}
