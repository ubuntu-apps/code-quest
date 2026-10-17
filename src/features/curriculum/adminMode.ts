import { useSyncExternalStore } from 'react'

/**
 * Admin mode unlocks every section and level, so the course can be tested
 * without working through it. The PIN is not a secret (anyone can find it in
 * the app's code); it only stops learners from switching it on by accident.
 */
export const ADMIN_PIN = '2001'
const ADMIN_STORAGE_KEY = 'codequest:admin'

function readStored(): boolean {
  try {
    return localStorage.getItem(ADMIN_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

let adminMode = readStored()
const listeners = new Set<() => void>()

export function isAdminMode(): boolean {
  return adminMode
}

export function subscribeAdminMode(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function setAdminMode(on: boolean): void {
  adminMode = on
  try {
    if (on) localStorage.setItem(ADMIN_STORAGE_KEY, '1')
    else localStorage.removeItem(ADMIN_STORAGE_KEY)
  } catch {
    // Storage unavailable: admin mode lasts until the page is closed.
  }
  for (const listener of listeners) listener()
}

/** Turns admin mode on if `pin` is right. Returns whether it worked. */
export function tryEnterAdminMode(pin: string): boolean {
  if (pin.trim() !== ADMIN_PIN) return false
  setAdminMode(true)
  return true
}

export function useAdminMode(): boolean {
  return useSyncExternalStore(subscribeAdminMode, isAdminMode, isAdminMode)
}
