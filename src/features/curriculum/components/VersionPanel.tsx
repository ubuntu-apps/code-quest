import { useState, useSyncExternalStore } from 'react'
import { checkForUpdate, isUpdateReady, reloadToUpdate, subscribeUpdateReady } from '../../../pwaUpdate'
import { APP_VERSION } from '../../../version'

type Status = 'idle' | 'checking' | 'up-to-date' | 'offline' | 'unavailable' | 'error'

const MESSAGES: Record<Exclude<Status, 'idle' | 'checking'>, string> = {
  'up-to-date': 'You have the latest version.',
  offline: 'You are offline. Connect to the internet and try again.',
  unavailable: "Updates can't be checked in this browser. Reload the page to get the latest version.",
  error: "Couldn't reach the server. Try again in a moment.",
}

/** About tab: the current version, with a button to look for a newer one. */
export function VersionPanel() {
  const ready = useSyncExternalStore(subscribeUpdateReady, isUpdateReady, isUpdateReady)
  const [status, setStatus] = useState<Status>('idle')

  const check = async () => {
    setStatus('checking')
    const result = await checkForUpdate()
    setStatus(result === 'update-ready' ? 'idle' : result)
  }

  return (
    <section className="cq-panel cq-version-panel">
      <h2 className="cq-subtitle">Version {APP_VERSION}</h2>
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
    </section>
  )
}
