import { STORES } from '../../lib/stores'
import { useStore } from '../../lib/localStore'
import { SUPPORT_CONFIG } from './supportConfig'

/**
 * Supporter status is kept on this device only (there are no accounts). It travels
 * with a progress backup, so it moves to a new device with the learner's progress.
 */
export function isSupporter(): boolean {
  return STORES.supporter.get() !== ''
}

/** Whether this device has a supporter code; updates when one is redeemed. */
export function useIsSupporter(): boolean {
  return useStore(STORES.supporter) !== ''
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
  return STORES.supporter.set(JSON.stringify({ since: now.toISOString() }))
}

/**
 * The support prompt shows once each time another section of a course is finished:
 * this is how many finished sections the learner has already been asked about.
 */
export function loadNudgeSeen(languageId: string): number {
  const raw = STORES.supportNudge.get(languageId)
  const n = raw === '' ? 0 : Number(raw)
  return Number.isFinite(n) ? n : 0
}

export function saveNudgeSeen(languageId: string, finishedSections: number): void {
  STORES.supportNudge.set(languageId, String(finishedSections))
}
