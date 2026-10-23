import { useId, useState } from 'react'
import { detectPlatform } from '../../platform'
import { APP_VERSION } from '../../version'
import { copyToClipboard } from '../curriculum/helpers'
import { countEvent } from '../../lib/analytics'
import {
  FEEDBACK_EMAIL,
  FEEDBACK_KINDS,
  feedbackBody,
  feedbackMailto,
  feedbackSubject,
  type FeedbackKind,
} from './feedbackEmail'

/** About tab: general feedback, sent from the learner's own email app. */
export function FeedbackPanel({ installed }: { installed: boolean }) {
  const [kind, setKind] = useState<FeedbackKind>('idea')
  const [message, setMessage] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const id = useId()
  if (!FEEDBACK_EMAIL) return null
  const email = FEEDBACK_EMAIL

  const draft = { kind, message, version: APP_VERSION, platform: detectPlatform(), installed }
  const empty = message.trim() === ''

  const copy = async (text: string, what: string) => {
    const ok = await copyToClipboard(text)
    setNotice(ok ? `${what} copied.` : `Could not copy. Please select the text and copy it yourself.`)
  }

  return (
    <section className="cq-panel cq-feedback-panel" aria-labelledby={`${id}-title`}>
      <h2 className="cq-subtitle" id={`${id}-title`}>
        Send feedback
      </h2>
      <p className="cq-muted">
        Tell us what you like, what was confusing, or what you&apos;d like to see next. Every message is read.
      </p>
      <fieldset className="cq-feedback-kinds">
        <legend className="cq-sr-only">What is your feedback about?</legend>
        {FEEDBACK_KINDS.map((k) => (
          <label key={k.id} className={`cq-btn cq-btn--snippet${kind === k.id ? ' cq-btn--snippet-active' : ''}`}>
            <input
              type="radio"
              name={`${id}-kind`}
              value={k.id}
              checked={kind === k.id}
              onChange={() => setKind(k.id)}
              className="cq-sr-only"
            />
            {k.label}
          </label>
        ))}
      </fieldset>
      <label className="cq-label" htmlFor={`${id}-message`}>
        Your message
      </label>
      <textarea
        id={`${id}-message`}
        className="cq-feedback-message"
        rows={5}
        value={message}
        onChange={(e) => {
          setMessage(e.target.value)
          setNotice(null)
        }}
        placeholder="Write as much or as little as you like."
      />
      <div className="cq-row">
        {empty ? (
          <button type="button" className="cq-btn cq-btn--primary" disabled>
            Open in my email app
          </button>
        ) : (
          <a
            className="cq-btn cq-btn--primary"
            href={feedbackMailto(email, draft)}
            onClick={() => {
              countEvent(`feedback-email/${kind}`, 'Opened a feedback email')
              setNotice(`Your email app should open with the message ready to send. If it didn't, copy the message and email it to ${email}.`)
            }}
          >
            Open in my email app
          </a>
        )}
        <button
          type="button"
          className="cq-btn"
          disabled={empty}
          onClick={() => void copy(`${feedbackSubject(kind)}\n\n${feedbackBody(draft)}`, 'Message')}
        >
          Copy message
        </button>
      </div>
      <p className="cq-muted cq-feedback-address">
        Or write to <strong>{email}</strong>{' '}
        <button type="button" className="cq-btn cq-btn--sm" onClick={() => void copy(email, 'Address')}>
          Copy address
        </button>
      </p>
      {notice ? (
        <p className="cq-muted" role="status" aria-live="polite">
          {notice}
        </p>
      ) : null}
    </section>
  )
}
