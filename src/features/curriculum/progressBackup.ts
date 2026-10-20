import { LAST_LEVEL_STORAGE_KEY, SELECTED_LANGUAGE_STORAGE_KEY, STREAK_STORAGE_KEY } from './constants'
import { notifyProgressChanged } from './progressStorage'
import { TEST_OUT_PREFIX } from './testOut'
import { notifySupporterChanged, SUPPORTER_STORAGE_KEY } from '../support/supporterStorage'
import { CERTIFICATE_EARNED_PREFIX, CERTIFICATE_NAME_KEY } from '../certificate/certificateStorage'
import { BADGES_STORAGE_KEY } from '../badges/badges'
import { REVIEW_PREFIX } from '../review/reviewStorage'

const PROGRESS_PREFIX = 'codequest:progress:'
/**
 * Says the progress was saved with challenge fingerprints (progressFingerprint.ts). It
 * travels with the backup, so an older backup without it is checked like old progress.
 */
const PROGRESS_FORMAT_PREFIX = 'codequest:progress-format:'
const SINGLE_KEYS = [
  STREAK_STORAGE_KEY,
  LAST_LEVEL_STORAGE_KEY,
  SELECTED_LANGUAGE_STORAGE_KEY,
  // Supporter status, the certificate and badges move to a new device with the progress.
  SUPPORTER_STORAGE_KEY,
  CERTIFICATE_NAME_KEY,
  BADGES_STORAGE_KEY,
]

/** Learner data only: never editor drafts, GitHub sign-in or install-banner settings. */
export function isBackupKey(key: string): boolean {
  return (
    key.startsWith(PROGRESS_PREFIX) ||
    key.startsWith(PROGRESS_FORMAT_PREFIX) ||
    key.startsWith(TEST_OUT_PREFIX) ||
    key.startsWith(CERTIFICATE_EARNED_PREFIX) ||
    key.startsWith(REVIEW_PREFIX) ||
    SINGLE_KEYS.includes(key)
  )
}

/** Entries saved as plain text rather than JSON. */
function isPlainTextKey(key: string): boolean {
  return (
    key === SELECTED_LANGUAGE_STORAGE_KEY ||
    key === CERTIFICATE_NAME_KEY ||
    key.startsWith(CERTIFICATE_EARNED_PREFIX)
  )
}

export interface ProgressBackup {
  app: 'codequest'
  kind: 'progress-backup'
  version: 1
  exportedAt: string
  entries: Record<string, string>
}

type BackupStorage = Pick<Storage, 'length' | 'key' | 'getItem' | 'setItem' | 'removeItem'>

function backupKeysIn(storage: BackupStorage): string[] {
  const keys: string[] = []
  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i)
    if (key && isBackupKey(key)) keys.push(key)
  }
  return keys
}

export function countLevels(entries: Record<string, string>): number {
  return Object.keys(entries).filter((key) => key.startsWith(PROGRESS_PREFIX)).length
}

export function createProgressBackup(storage: BackupStorage = localStorage, now = new Date()): ProgressBackup {
  const entries: Record<string, string> = {}
  for (const key of backupKeysIn(storage)) {
    const value = storage.getItem(key)
    if (value !== null) entries[key] = value
  }
  return { app: 'codequest', kind: 'progress-backup', version: 1, exportedAt: now.toISOString(), entries }
}

export function backupFileName(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `codequest-progress-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.json`
}

/** Parses and checks a backup file. Throws an Error with a learner-friendly message. */
export function parseProgressBackup(text: string): ProgressBackup {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('This file is not a CodeQuest backup (it is not valid JSON).')
  }
  const backup = data as Partial<ProgressBackup> | null
  if (!backup || backup.app !== 'codequest' || backup.kind !== 'progress-backup') {
    throw new Error('This file is not a CodeQuest progress backup.')
  }
  if (backup.version !== 1) {
    throw new Error('This backup was made by a newer version of CodeQuest. Update the app and try again.')
  }
  if (!backup.entries || typeof backup.entries !== 'object' || Array.isArray(backup.entries)) {
    throw new Error('This backup file is damaged (no progress entries).')
  }
  const entries: Record<string, string> = {}
  for (const [key, value] of Object.entries(backup.entries)) {
    if (!isBackupKey(key) || typeof value !== 'string') continue
    // Progress, streak and last-level entries are JSON; a few others are plain text.
    if (!isPlainTextKey(key)) {
      try {
        JSON.parse(value)
      } catch {
        continue
      }
    }
    entries[key] = value
  }
  return {
    app: 'codequest',
    kind: 'progress-backup',
    version: 1,
    exportedAt: typeof backup.exportedAt === 'string' ? backup.exportedAt : '',
    entries,
  }
}

/** Replaces this device's learner progress with the backup's. Returns the number of levels restored. */
export function restoreProgressBackup(backup: ProgressBackup, storage: BackupStorage = localStorage): number {
  for (const key of backupKeysIn(storage)) {
    // An older backup made before becoming a supporter shouldn't take that away.
    if (key === SUPPORTER_STORAGE_KEY) continue
    storage.removeItem(key)
  }
  for (const [key, value] of Object.entries(backup.entries)) storage.setItem(key, value)
  notifyProgressChanged()
  notifySupporterChanged()
  return countLevels(backup.entries)
}
