import { describe, expect, it } from 'vitest'
import { feedbackBody, feedbackMailto, feedbackSubject, type FeedbackDraft } from './feedbackEmail'

const draft: FeedbackDraft = {
  kind: 'idea',
  message: '  Add a dark mode for the editor & more R lessons?  ',
  version: '0.3.2',
  platform: 'android',
  installed: true,
}

describe('feedback email', () => {
  it('names the kind of feedback in the subject', () => {
    expect(feedbackSubject('confusing')).toBe('CodeQuest feedback: Something confusing')
  })

  it('puts the message first, then the version and device', () => {
    expect(feedbackBody(draft)).toBe(
      'Add a dark mode for the editor & more R lessons?\n\n--\nSent from CodeQuest 0.3.2 (Android, installed app)',
    )
  })

  it('encodes spaces as %20 and keeps & and ? inside the body', () => {
    const url = feedbackMailto('a@b.edu', draft)
    expect(url.startsWith('mailto:a@b.edu?subject=CodeQuest%20feedback%3A%20An%20idea&body=')).toBe(true)
    expect(url).not.toContain('+')
    const body = decodeURIComponent(url.split('&body=')[1])
    expect(body).toContain('editor & more R lessons?')
    expect(body).toContain('\r\n--\r\n')
  })
})
