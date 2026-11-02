import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { STORES } from '../lib/stores'
import { useStore } from '../lib/localStore'
import { promptInstall, useInstallState } from '../lib/installPrompt'
import { parseAppPath } from '../features/curriculum/learnPaths'

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

/** A small bar offering to install the app. Closed once, it stays closed (About still has an Install button). */
export function InstallAppBanner() {
  const { canInstall, installed, justInstalled } = useInstallState()
  const { pathname } = useLocation()
  const dismissed = useStore(STORES.installBannerDismissed)
  const ios = useMemo(() => isIos(), [])

  // The About tab has its own Install button and steps.
  if (dismissed || installed || justInstalled || parseAppPath(pathname).tab === 'about') return null

  const showInstallButton = canInstall && !ios
  const showIosInstructions = ios && !canInstall
  if (!showInstallButton && !showIosInstructions) return null

  // If storage is blocked, it stays closed until the page is reloaded.
  const onDismiss = () => STORES.installBannerDismissed.set(true)

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
