/** The name to print and the day each course's certificate was first earned (this device). */
export const CERTIFICATE_NAME_KEY = 'codequest:certificate-name'
export const CERTIFICATE_EARNED_PREFIX = 'codequest:certificate-earned:'

export function loadCertificateName(): string {
  try {
    return localStorage.getItem(CERTIFICATE_NAME_KEY) ?? ''
  } catch {
    return ''
  }
}

export function saveCertificateName(name: string): void {
  try {
    localStorage.setItem(CERTIFICATE_NAME_KEY, name)
  } catch {
    // Storage unavailable: the name is only kept until the page closes.
  }
}

/** The day the certificate was first earned, saved the first time it is shown. */
export function certificateEarnedOn(languageId: string, now = new Date()): Date {
  const key = CERTIFICATE_EARNED_PREFIX + languageId
  try {
    const saved = localStorage.getItem(key)
    if (saved) {
      const date = new Date(saved)
      if (!Number.isNaN(date.getTime())) return date
    }
    localStorage.setItem(key, now.toISOString())
  } catch {
    // Storage unavailable: use today.
  }
  return now
}
