import { useMemo, useState } from 'react'
import { INSTALL_BANNER_DISMISS_KEY } from './installBannerStorage'
import { promptInstall, useInstallState } from '../lib/installPrompt'

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function readDismissed(): boolean {
  try {
    return localStorage.getItem(INSTALL_BANNER_DISMISS_KEY) === '1'
  } catch {
    return false
  }
}

/** A small bar offering to install the app. Closed once, it stays closed (About still has an Install button). */
export function InstallAppBanner() {
  const { canInstall, installed } = useInstallState()
  const [dismissed, setDismissed] = useState(readDismissed)
  const ios = useMemo(() => isIos(), [])

  if (dismissed || installed) return null

  const showInstallButton = canInstall && !ios
  const showIosInstructions = ios && !canInstall
  if (!showInstallButton && !showIosInstructions) return null

  const onDismiss = () => {
    try {
      localStorage.setItem(INSTALL_BANNER_DISMISS_KEY, '1')
    } catch {
      // Storage unavailable: it stays closed until the page is reloaded.
    }
    setDismissed(true)
  }

  return (
    <section className="cq-install-banner" aria-label="Install CodeQuest app">
      <div className="cq-install-banner__content">
        <p className="cq-install-banner__title">Install CodeQuest</p>
        {showInstallButton ? (
          <button type="button" className="cq-btn cq-btn--primary" onClick={() => void promptInstall()}>
            Install app
          </button>
        ) : (
          <p className="cq-install-banner__hint">
            In Safari, tap ••• next to the address bar, then Share, then Add to Home Screen.
          </p>
        )}
      </div>
      <button type="button" className="cq-install-banner__close" onClick={onDismiss} aria-label="Dismiss install prompt">
        x
      </button>
    </section>
  )
}
