import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

/**
 * Shown only on the old copy of CodeQuest (built with VITE_MOVED_TO, see
 * .github/workflows/deploy-pages.yml). Progress lives in each browser under the site's
 * address, so it can't follow the move by itself: learners back it up here, then restore
 * it at the new address in Settings.
 */
export function MovedBanner() {
  const movedTo = import.meta.env.VITE_MOVED_TO
  const { pathname } = useLocation()
  const [dismissed, setDismissed] = useState(false)
  if (!movedTo || dismissed) return null

  const newHome = movedTo.replace(/\/$/, '')
  const host = newHome.replace(/^https?:\/\//, '')
  return (
    <section className="cq-install-banner cq-update-banner" aria-labelledby="cq-moved-banner-title">
      <div className="cq-install-banner__content">
        <h2 id="cq-moved-banner-title" className="cq-install-banner__title">
          CodeQuest has moved to {host}
        </h2>
        <a className="cq-btn cq-btn--primary" href={`${newHome}${pathname}`}>
          Go to the new address
        </a>
        {pathname !== '/settings' && (
          <Link className="cq-btn" to="/settings">
            Back up my progress
          </Link>
        )}
        <p className="cq-install-banner__hint">
          Your progress is saved in this browser, at this address. To take it with you, save a backup in Settings here,
          then restore it in Settings at {host}. If you installed CodeQuest, install it again from the new address.
        </p>
      </div>
      <button type="button" className="cq-install-banner__close" onClick={() => setDismissed(true)} aria-label="Not now">
        x
      </button>
    </section>
  )
}
