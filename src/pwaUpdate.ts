import { registerSW } from 'virtual:pwa-register'

// When a new version is deployed, the service worker downloads it in the
// background and waits. We ask before reloading, so a learner in the middle of
// a quiz or sandbox doesn't lose their work. If they never click Reload, the
// new version starts the next time the app is opened.
//
// Browsers only look for a new version when a page is loaded. An installed app
// that stays open (or is resumed from the background on a phone) never reloads,
// so we also check when the app comes back into view and every hour, and the
// About tab has a "Check for a new version" button.

/** Check at most this often when the app comes back into view. */
const RECHECK_ON_RESUME_MS = 5 * 60 * 1000
/** Check this often while the app stays open. */
const RECHECK_INTERVAL_MS = 60 * 60 * 1000
/** How long to wait for a new version to finish downloading after a manual check. */
const INSTALL_WAIT_MS = 60 * 1000

let updateReady = false
let applyUpdate: ((reloadPage?: boolean) => Promise<void>) | null = null
let registration: ServiceWorkerRegistration | null = null
let lastCheck = 0
const listeners = new Set<() => void>()

function markUpdateReady(): void {
  if (updateReady) return
  updateReady = true
  for (const listener of listeners) listener()
}

/** Asks the browser to look for a new service worker (a new version). */
async function updateRegistration(reg: ServiceWorkerRegistration): Promise<void> {
  lastCheck = Date.now()
  await reg.update()
}

/**
 * Looks for a new version and waits for it to download. We read the registration
 * ourselves rather than relying only on onNeedRefresh: workbox-window stops
 * listening after the first update it sees while the page is open.
 */
async function lookForUpdate(reg: ServiceWorkerRegistration): Promise<void> {
  await updateRegistration(reg)
  if (reg.installing) await waitUntilInstalled(reg.installing, INSTALL_WAIT_MS)
  if (reg.waiting) markUpdateReady()
}

function quietCheck(): void {
  if (!registration || updateReady || !navigator.onLine) return
  lookForUpdate(registration).catch(() => {
    // Offline or the server is unreachable: try again next time.
  })
}

export function initPwa(): void {
  applyUpdate = registerSW({
    immediate: true,
    onNeedRefresh: markUpdateReady,
    onRegisteredSW(_swUrl, reg) {
      if (!reg) return
      registration = reg
      lastCheck = Date.now()
      window.setInterval(quietCheck, RECHECK_INTERVAL_MS)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && Date.now() - lastCheck > RECHECK_ON_RESUME_MS) quietCheck()
      })
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

export type UpdateCheckResult = 'update-ready' | 'up-to-date' | 'offline' | 'unavailable' | 'error'

/** Resolves when `worker` has finished installing (or failed), or after `ms`. */
function waitUntilInstalled(worker: ServiceWorker, ms: number): Promise<void> {
  return new Promise((resolve) => {
    const done = () => {
      window.clearTimeout(timer)
      worker.removeEventListener('statechange', onChange)
      resolve()
    }
    const onChange = () => {
      if (worker.state === 'installed' || worker.state === 'activated' || worker.state === 'redundant') done()
    }
    const timer = window.setTimeout(done, ms)
    worker.addEventListener('statechange', onChange)
    onChange()
  })
}

/**
 * Looks for a new version now and, if there is one, waits for it to download.
 * Afterwards `isUpdateReady()` tells whether `reloadToUpdate()` will switch to it.
 */
export async function checkForUpdate(): Promise<UpdateCheckResult> {
  if (updateReady) return 'update-ready'
  const reg = registration ?? (await navigator.serviceWorker?.getRegistration().catch(() => undefined)) ?? null
  if (!reg) return 'unavailable'
  if (!navigator.onLine) return 'offline'
  try {
    await lookForUpdate(reg)
  } catch {
    return 'error'
  }
  return updateReady ? 'update-ready' : 'up-to-date'
}

/** Activates the waiting version and reloads the page. */
export function reloadToUpdate(): void {
  if (!applyUpdate) {
    window.location.reload()
    return
  }
  // Reload as soon as the new version takes over (workbox-window does this too,
  // but not for every kind of update), and after a few seconds in any case.
  navigator.serviceWorker?.addEventListener('controllerchange', () => window.location.reload(), { once: true })
  window.setTimeout(() => window.location.reload(), 5000)
  void applyUpdate(true)
}
