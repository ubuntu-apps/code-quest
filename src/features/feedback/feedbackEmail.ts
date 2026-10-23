import type { Platform } from '../../platform'

/**
 * Where general feedback goes. Learners send it from their own email app, so no
 * account is needed. Set to null to hide the feedback panel.
 */
export const FEEDBACK_EMAIL: string | null = 'goran.stojanov@ctstate.edu'

export const FEEDBACK_KINDS = [
  { id: 'like', label: 'Something I like' },
  { id: 'idea', label: 'An idea' },
  { id: 'confusing', label: 'Something confusing' },
  { id: 'other', label: 'Other' },
] as const

export type FeedbackKind = (typeof FEEDBACK_KINDS)[number]['id']

const PLATFORM_LABEL: Record<Platform, string> = {
  android: 'Android',
  ios: 'iPhone / iPad',
  desktop: 'computer',
}

export interface FeedbackDraft {
  kind: FeedbackKind
  message: string
  version: string
  platform: Platform
  installed: boolean
}

export function feedbackSubject(kind: FeedbackKind): string {
  const label = FEEDBACK_KINDS.find((k) => k.id === kind)?.label ?? 'Other'
  return `CodeQuest feedback: ${label}`
}

/** The email body: the learner's words, then a line saying which version and device. */
export function feedbackBody(d: FeedbackDraft): string {
  const where = `${PLATFORM_LABEL[d.platform]}, ${d.installed ? 'installed app' : 'browser'}`
  return [d.message.trim(), '', '--', `Sent from CodeQuest ${d.version} (${where})`].join('\n')
}

/**
 * A mailto: link with the subject and body filled in. encodeURIComponent, not
 * URLSearchParams: mail apps show URLSearchParams' "+" for spaces literally.
 */
export function feedbackMailto(email: string, d: FeedbackDraft): string {
  const subject = encodeURIComponent(feedbackSubject(d.kind))
  const body = encodeURIComponent(feedbackBody(d).replace(/\r?\n/g, '\r\n'))
  return `mailto:${email}?subject=${subject}&body=${body}`
}
