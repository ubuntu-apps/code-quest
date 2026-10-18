import { useRef, useState, useSyncExternalStore } from 'react'
import { useAdminMode } from '../adminMode'
import { checkForUpdate, isUpdateReady, reloadToUpdate, subscribeUpdateReady } from '../../../pwaUpdate'
import { APP_VERSION } from '../../../version'

type Status = 'idle' | 'checking' | 'up-to-date' | 'offline' | 'unavailable' | 'error'

const MESSAGES: Record<Exclude<Status, 'idle' | 'checking'>, string> = {
  'up-to-date': 'You have the latest version.',
  offline: 'You are offline. Connect to the internet and try again.',
  unavailable: "Updates can't be checked in this browser. Reload the page to get the latest version.",
  error: "Couldn't reach the server. Try again in a moment.",
}

/** How this device lays the page out, to help with "the text is too small" reports. */
function screenInfo(): string {
  if (typeof window === 'undefined') return ''
  const root = parseFloat(getComputedStyle(document.documentElement).fontSize)
  const ratio = Math.round(window.devicePixelRatio * 100) / 100
  return `Screen ${window.innerWidth} × ${window.innerHeight} · pixel ratio ${ratio} · text ${Math.round(root * 10) / 10}px`
}

/** Taps on the version heading that reveal the admin panel. */
const ADMIN_REVEAL_TAPS = 7

interface VersionPanelProps {
  /** Called after the version heading is tapped ADMIN_REVEAL_TAPS times in a row. */
  onRevealAdmin?: () => void
}

/** About tab: the current version, with a button to look for a newer one. */
export function VersionPanel({ onRevealAdmin }: VersionPanelProps) {
  const ready = useSyncExternalStore(subscribeUpdateReady, isUpdateReady, isUpdateReady)
  const [status, setStatus] = useState<Status>('idle')
  const isAdmin = useAdminMode()
  const taps = useRef({ count: 0, last: 0 })

  const tapHeading = () => {
    const now = Date.now()
    // Taps more than 1.5 seconds apart start the count again.
    taps.current.count = now - taps.current.last > 1500 ? 1 : taps.current.count + 1
    taps.current.last = now
    if (taps.current.count >= ADMIN_REVEAL_TAPS) {
      taps.current.count = 0
      onRevealAdmin?.()
    }
  }

  const check = async () => {
    setStatus('checking')
    const result = await checkForUpdate()
    setStatus(result === 'update-ready' ? 'idle' : result)
  }

  return (
    <section className="cq-panel cq-version-panel">
      <h2 className="cq-subtitle" onClick={tapHeading}>
        Version {APP_VERSION}
      </h2>
      <div className="cq-row">
        {ready ? (
          <button type="button" className="cq-btn cq-btn--primary" onClick={reloadToUpdate}>
            Reload to update
          </button>
        ) : (
          <button type="button" className="cq-btn" onClick={() => void check()} disabled={status === 'checking'}>
            {status === 'checking' ? 'Checking…' : 'Check for a new version'}
          </button>
        )}
      </div>
      <p className="cq-muted" role="status" aria-live="polite">
        {ready
          ? 'A new version is ready. Your challenge answers are saved; unsubmitted quiz answers and sandbox code will be cleared.'
          : status === 'idle' || status === 'checking'
            ? ''
            : MESSAGES[status]}
      </p>
      {isAdmin ? <p className="cq-muted cq-screen-info">{screenInfo()}</p> : null}
    </section>
  )
}
