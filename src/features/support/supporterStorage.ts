import { useSyncExternalStore } from 'react'
import { SUPPORT_CONFIG } from './supportConfig'

/**
 * Supporter status is kept on this device only (there are no accounts). It travels
 * with a progress backup, so it moves to a new device with the learner's progress.
 */
export const SUPPORTER_STORAGE_KEY = 'codequest:supporter'
const NUDGE_PREFIX = 'codequest:support-nudge:'
const CHANGED_EVENT = 'codequest:supporter-changed'

function readKey(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function isSupporter(): boolean {
  return readKey(SUPPORTER_STORAGE_KEY) !== null
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CHANGED_EVENT, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(CHANGED_EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}

/** Tells open screens that supporter status may have changed (e.g. a restored backup). */
export function notifySupporterChanged(): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(CHANGED_EVENT))
}

/** Whether this device has a supporter code; updates when one is redeemed. */
export function useIsSupporter(): boolean {
  return useSyncExternalStore(subscribe, isSupporter, () => false)
}

/** Codes are typed by hand, so case and spaces around them don't matter. */
export function normalizeSupporterCode(code: string): string {
  return code.trim().toUpperCase()
}

export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Checks a supporter code against the configured hashes and, if it matches, turns on
 * the supporter features on this device. Resolves to whether the code was accepted.
 */
export async function redeemSupporterCode(code: string, now = new Date()): Promise<boolean> {
  const normalized = normalizeSupporterCode(code)
  if (!normalized || typeof crypto === 'undefined' || !crypto.subtle) return false
  const hash = await sha256Hex(normalized)
  if (!SUPPORT_CONFIG.supporterCodeHashes.includes(hash)) return false
  try {
    localStorage.setItem(SUPPORTER_STORAGE_KEY, JSON.stringify({ since: now.toISOString() }))
  } catch {
    return false
  }
  notifySupporterChanged()
  return true
}

/**
 * The support prompt shows once each time another section of a course is finished:
 * this is how many finished sections the learner has already been asked about.
 */
export function loadNudgeSeen(languageId: string): number {
  const raw = readKey(NUDGE_PREFIX + languageId)
  const n = raw === null ? 0 : Number(raw)
  return Number.isFinite(n) ? n : 0
}

export function saveNudgeSeen(languageId: string, finishedSections: number): void {
  try {
    localStorage.setItem(NUDGE_PREFIX + languageId, String(finishedSections))
  } catch {
    // Storage unavailable: the prompt may show again, which is harmless.
  }
}
