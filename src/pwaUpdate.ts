import { registerSW } from 'virtual:pwa-register'

// When a new version is deployed, the service worker downloads it in the
// background and waits. We ask before reloading, so a learner in the middle of
// a quiz or sandbox doesn't lose their work. If they never click Reload, the
// new version starts the next time the app is opened.

let updateReady = false
let applyUpdate: ((reloadPage?: boolean) => Promise<void>) | null = null
const listeners = new Set<() => void>()

export function initPwa(): void {
  applyUpdate = registerSW({
    immediate: true,
    onNeedRefresh() {
      updateReady = true
      for (const listener of listeners) listener()
    },
  })
}

export function subscribeUpdateReady(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function isUpdateReady(): boolean {
  return updateReady
}

/** Activates the waiting version and reloads the page. */
export function reloadToUpdate(): void {
  if (applyUpdate) void applyUpdate(true)
  else window.location.reload()
}
