import { useId } from 'react'
import { GOATCOUNTER_ENDPOINT, setAnalyticsAllowed, useAnalyticsAllowed } from '../../../lib/analytics'

/** About tab: what CodeQuest counts, and a switch to turn it off on this device. */
export function PrivacyPanel() {
  const allowed = useAnalyticsAllowed()
  const id = useId()
  if (!GOATCOUNTER_ENDPOINT) return null
  return (
    <section className="cq-panel cq-privacy-panel" aria-labelledby={`${id}-title`}>
      <h2 className="cq-subtitle" id={`${id}-title`}>
        Privacy
      </h2>
      <p className="cq-muted">
        CodeQuest has no accounts and doesn&apos;t know who you are. Your progress stays on this device. To see
        which lessons people reach and where they get stuck, it sends anonymous counts (for example
        &ldquo;someone passed the Variables quiz&rdquo;) to{' '}
        <a href="https://www.goatcounter.com" target="_blank" rel="noopener noreferrer">
          GoatCounter
        </a>
        , with no cookies and nothing you type.
      </p>
      <label className="cq-privacy-toggle">
        <input type="checkbox" checked={allowed} onChange={(e) => setAnalyticsAllowed(e.target.checked)} />
        Share anonymous usage counts
      </label>
    </section>
  )
}
