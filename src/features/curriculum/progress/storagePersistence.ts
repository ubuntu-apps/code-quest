// Browsers may clear localStorage under storage pressure, and Safari clears it
// for sites that aren't installed after about 7 days without a visit. Asking for
// persistent storage protects learners' progress where the browser allows it.

export type StoragePersistence = 'persisted' | 'not-persisted' | 'unsupported'

let requested = false

function storageManager(): StorageManager | null {
  if (typeof navigator === 'undefined') return null
  const storage = navigator.storage
  return storage && typeof storage.persist === 'function' ? storage : null
}

/**
 * Asks once per session, the first time there is progress worth keeping.
 * Chrome, Edge and Safari decide silently; Firefox may show a one-time prompt.
 */
export function requestPersistentStorageOnce(): void {
  if (requested) return
  requested = true
  const manager = storageManager()
  if (!manager) return
  void manager
    .persisted()
    .then((already) => (already ? true : manager.persist()))
    .catch(() => false)
}

export async function getStoragePersistence(): Promise<StoragePersistence> {
  const manager = storageManager()
  if (!manager || typeof manager.persisted !== 'function') return 'unsupported'
  try {
    return (await manager.persisted()) ? 'persisted' : 'not-persisted'
  } catch {
    return 'unsupported'
  }
}
