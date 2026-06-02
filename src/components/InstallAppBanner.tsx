import { useEffect, useMemo, useState } from 'react'
import { INSTALL_BANNER_DISMISS_KEY, INSTALL_BANNER_RESET_EVENT } from './installBannerStorage'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isInStandaloneMode(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (typeof (navigator as Navigator & { standalone?: boolean }).standalone === 'boolean' &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  )
}

export function InstallAppBanner() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState<boolean>(
    () => localStorage.getItem(INSTALL_BANNER_DISMISS_KEY) === '1',
  )
  const [isInstalled, setIsInstalled] = useState<boolean>(() => isInStandaloneMode())
  const ios = useMemo(() => isIos(), [])

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setIsInstalled(true)
      setInstallEvent(null)
    }
    const onResetPreference = () => {
      setDismissed(false)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onInstalled)
    window.addEventListener(INSTALL_BANNER_RESET_EVENT, onResetPreference)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onInstalled)
      window.removeEventListener(INSTALL_BANNER_RESET_EVENT, onResetPreference)
    }
  }, [])

  if (dismissed || isInstalled) return null

  const onDismiss = () => {
    localStorage.setItem(INSTALL_BANNER_DISMISS_KEY, '1')
    setDismissed(true)
  }

  const onInstall = async () => {
    if (!installEvent) return
    await installEvent.prompt()
    const choice = await installEvent.userChoice
    if (choice.outcome === 'accepted') {
      setIsInstalled(true)
      setInstallEvent(null)
    }
  }

  const showInstallButton = Boolean(installEvent) && !ios
  const showIosInstructions = ios && !installEvent

  if (!showInstallButton && !showIosInstructions) return null

  return (
    <section className="cq-install-banner" aria-label="Install CodeQuest app">
      <div className="cq-install-banner__content">
        <p className="cq-install-banner__title">Install CodeQuest</p>
        {showInstallButton ? (
          <button type="button" className="cq-btn cq-btn--primary" onClick={onInstall}>
            Install app
          </button>
        ) : (
          <p className="cq-install-banner__hint">On iPhone: tap Share, then Add to Home Screen.</p>
        )}
      </div>
      <button type="button" className="cq-install-banner__close" onClick={onDismiss} aria-label="Dismiss install prompt">
        x
      </button>
    </section>
  )
}
