import { STORES } from '../../lib/stores'

/** The name to print on certificates (this device). */
export function loadCertificateName(): string {
  return STORES.certificateName.get()
}

export function saveCertificateName(name: string): void {
  STORES.certificateName.set(name)
}

/**
 * The day a certificate was first earned, saved the first time it is shown. `earnedKey`
 * is the course id, or "course/section" for a section certificate.
 */
export function certificateEarnedOn(earnedKey: string, now = new Date()): Date {
  const saved = STORES.certificateEarned.get(earnedKey)
  if (saved) {
    const date = new Date(saved)
    if (!Number.isNaN(date.getTime())) return date
  }
  STORES.certificateEarned.set(earnedKey, now.toISOString())
  return now
}
