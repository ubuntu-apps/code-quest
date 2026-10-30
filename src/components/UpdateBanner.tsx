import { useState, useSyncExternalStore } from 'react'
import { isUpdateReady, reloadToUpdate, subscribeUpdateReady } from '../pwaUpdate'

/** Offers to reload when a new version of the app has been downloaded. */
export function UpdateBanner() {
  const ready = useSyncExternalStore(subscribeUpdateReady, isUpdateReady, isUpdateReady)
  const [dismissed, setDismissed] = useState(false)
  if (!ready || dismissed) return null

  return (
    <section className="cq-install-banner cq-update-banner" aria-labelledby="cq-update-banner-title">
      <div className="cq-install-banner__content">
        <h2 id="cq-update-banner-title" className="cq-install-banner__title">
          A new version of CodeQuest is ready.
        </h2>
        <button type="button" className="cq-btn cq-btn--primary" onClick={reloadToUpdate}>
          Reload
        </button>
        <p className="cq-install-banner__hint">
          Challenge answers are saved. Unsubmitted gate answers and sandbox code will be cleared.
        </p>
      </div>
      <button
        type="button"
        className="cq-install-banner__close"
        onClick={() => setDismissed(true)}
        aria-label="Update later"
      >
        x
      </button>
    </section>
  )
}
