import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { hasDonationLinks, SUPPORT_CONFIG } from './supportConfig'
import { SupportLinks } from './SupportLinks'
import { SupporterCodeForm } from './SupporterCodeForm'
import type { SupporterResult } from './SupporterLanding'
import { useIsSupporter } from './supporterStorage'

/** Names of supporters who asked to be listed, from public/content/supporters.json. */
function useSupporterNames(baseUrl: string): string[] {
  const [names, setNames] = useState<string[]>([])
  useEffect(() => {
    let cancelled = false
    fetch(`${baseUrl}content/supporters.json`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: unknown) => {
        if (cancelled || !Array.isArray(data)) return
        setNames(data.filter((n): n is string => typeof n === 'string' && n.trim() !== ''))
      })
      .catch(() => {
        // Offline or no file: the list just doesn't show.
      })
    return () => {
      cancelled = true
    }
  }, [baseUrl])
  return names
}

/** About tab: ways to support CodeQuest, supporter status, and the supporters list. */
export function SupportPanel({ baseUrl }: { baseUrl: string }) {
  const supporter = useIsSupporter()
  const names = useSupporterNames(baseUrl)
  const location = useLocation()
  const arrival = (location.state as { supporterResult?: SupporterResult } | null)?.supporterResult ?? null
  const panelRef = useRef<HTMLElement>(null)

  // Arriving from the thank-you link: bring this panel into view.
  useEffect(() => {
    if (arrival) panelRef.current?.scrollIntoView({ block: 'start' })
  }, [arrival])

  const canSupport = hasDonationLinks() || Boolean(SUPPORT_CONFIG.supporterEditionUrl)
  if (!canSupport && !supporter && names.length === 0 && !arrival) return null

  return (
    <section ref={panelRef} className="cq-panel cq-support-panel" aria-labelledby="cq-support-title">
      <h2 className="cq-subtitle" id="cq-support-title">
        Support CodeQuest
      </h2>
      {arrival === 'bad-code' && !supporter ? (
        <p className="cq-error" role="alert">
          That supporter link didn&apos;t work. Enter the code from your receipt below.
        </p>
      ) : null}
      {supporter ? (
        <p className="cq-support-thanks" role={arrival === 'thanks' ? 'status' : undefined}>
          Thank you for supporting CodeQuest! The supporter edition of the course certificate is on for
          this device.
        </p>
      ) : (
        <>
          <p className="cq-muted">
            CodeQuest is free and has no ads. If it helps you, you can chip in to keep it running and to
            pay for new courses.
          </p>
          {hasDonationLinks() ? <SupportLinks /> : null}
          {SUPPORT_CONFIG.supporterEditionUrl ? (
            <details className="cq-certificate-code" open={arrival === 'bad-code'}>
              <summary>Paid for the supporter edition? Enter your code</summary>
              <SupporterCodeForm />
            </details>
          ) : null}
        </>
      )}
      {names.length > 0 ? (
        <p className="cq-muted cq-supporter-names">
          <strong>Thanks to our supporters:</strong> {names.join(', ')}
        </p>
      ) : null}
    </section>
  )
}
