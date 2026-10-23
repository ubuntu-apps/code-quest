import { useSyncExternalStore } from 'react'

/**
 * The browser's own "Install app" window (Chrome and Edge). The browser offers it once
 * per page load through `beforeinstallprompt`, so it is kept here and shared: the
 * install bar and the About tab both open it. Safari has no such window.
 */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export interface InstallState {
  /** The browser will show its install window when asked. */
  canInstall: boolean
  /** Running as the installed app, or installed during this visit. */
  installed: boolean
}

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const nav = navigator as Navigator & { standalone?: boolean }
  return window.matchMedia?.('(display-mode: standalone)').matches === true || nav.standalone === true
}

let deferred: BeforeInstallPromptEvent | null = null
let state: InstallState = { canInstall: false, installed: false }
const listeners = new Set<() => void>()

function update(next: Partial<InstallState>): void {
  state = { ...state, ...next }
  for (const l of listeners) l()
}

let started = false

/** Call once at start-up, before the browser sends `beforeinstallprompt`. */
export function initInstallPrompt(): void {
  if (started || typeof window === 'undefined') return
  started = true
  state = { canInstall: false, installed: isStandalone() }
  window.addEventListener('beforeinstallprompt', (event) => {
    // Keep it for our own buttons instead of the browser's mini bar.
    event.preventDefault()
    deferred = event as BeforeInstallPromptEvent
    update({ canInstall: true })
  })
  window.addEventListener('appinstalled', () => {
    deferred = null
    update({ canInstall: false, installed: true })
  })
}

export function useInstallState(): InstallState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
    () => state,
  )
}

/** Opens the browser's install window. It can only be used once per page load. */
export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  const event = deferred
  if (!event) return 'unavailable'
  deferred = null
  update({ canInstall: false })
  try {
    await event.prompt()
    const { outcome } = await event.userChoice
    if (outcome === 'accepted') update({ installed: true })
    return outcome
  } catch {
    return 'unavailable'
  }
}
