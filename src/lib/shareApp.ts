const SHARE_MESSAGE =
  'Learn coding with CodeQuest — a free app with lessons, challenges, and quizzes. Install it here:'

export function getAppShareUrl(): string {
  if (typeof window === 'undefined') return ''
  return new URL(import.meta.env.BASE_URL, window.location.origin).href
}

export function buildShareText(): string {
  return `${SHARE_MESSAGE}\n${getAppShareUrl()}`
}

export type ShareAppResult = 'shared' | 'copied' | 'cancelled' | 'unsupported'

export async function shareApp(): Promise<ShareAppResult> {
  const text = buildShareText()

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
