import { STORES } from '../../lib/stores'
import { useStore } from '../../lib/localStore'

/**
 * Admin mode unlocks every section and level, so the course can be tested
 * without working through it. The PIN is not a secret (anyone can find it in
 * the app's code); it only stops learners from switching it on by accident.
 */
export const ADMIN_PIN = '2001'

export function isAdminMode(): boolean {
  return STORES.admin.get()
}

export function subscribeAdminMode(listener: () => void): () => void {
  return STORES.admin.subscribe(listener)
}

/** Turns admin mode on or off (if storage is blocked, it lasts until the page closes). */
export function setAdminMode(on: boolean): void {
  STORES.admin.set(on)
}

/** Turns admin mode on if `pin` is right. Returns whether it worked. */
export function tryEnterAdminMode(pin: string): boolean {
  if (pin.trim() !== ADMIN_PIN) return false
  setAdminMode(true)
  return true
}

export function useAdminMode(): boolean {
  return useStore(STORES.admin)
}
