import { formatInstallGuidesText, formatInstallGuidesTextShort } from '../platform'

export type ShareVariant = 'full' | 'text'

export function getAppShareUrl(): string {
  if (typeof window === 'undefined') return ''
  return new URL(import.meta.env.BASE_URL, window.location.origin).href
}

export function buildShareText(variant: ShareVariant = 'full'): string {
  const url = getAppShareUrl()
  return variant === 'text' ? formatInstallGuidesTextShort(url) : formatInstallGuidesText(url)
}

export type ShareAppResult = 'shared' | 'copied' | 'cancelled' | 'unsupported'

export async function shareApp(variant: ShareVariant = 'full'): Promise<ShareAppResult> {
  const text = buildShareText(variant)

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: 'CodeQuest',
        text,
      })
      return 'shared'
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled'
    }
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return 'copied'
    } catch {
      return 'unsupported'
    }
  }

  return 'unsupported'
}
