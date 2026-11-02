import { notifyStorageChanged } from '../../../lib/localStore'
import { BACKUP_STORES, STORES } from '../../../lib/stores'
import { notifyProgressChanged } from './progressStorage'

/** Learner data only (the stores marked `backup` in lib/stores.ts), never this device's settings. */
export function isBackupKey(key: string): boolean {
  return BACKUP_STORES.some((store) => store.owns(key))
}

/** Entries saved as plain text rather than JSON. */
function isPlainTextKey(key: string): boolean {
  return BACKUP_STORES.some((store) => store.owns(key) && store.codec.plainText)
}

/** Entries a restore leaves as they are on this device (an older backup shouldn't take supporter status away). */
function keptOnRestore(key: string): boolean {
  return BACKUP_STORES.some((store) => store.owns(key) && store.keepOnRestore)
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
  return Object.keys(entries).filter((key) => STORES.progress.owns(key)).length
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
    if (!keptOnRestore(key)) storage.removeItem(key)
  }
  for (const [key, value] of Object.entries(backup.entries)) storage.setItem(key, value)
  notifyProgressChanged()
  // Every open screen reads its saved data again.
  notifyStorageChanged('*')
  return countLevels(backup.entries)
}
