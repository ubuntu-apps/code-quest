export type Platform = 'android' | 'ios' | 'desktop'

type NavigatorLike = Navigator & { vendor?: string }
type WindowLike = Window & { opera?: string }

export function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'desktop'

  const nav = navigator as NavigatorLike
  const win = window as WindowLike
  const ua = nav.userAgent || nav.vendor || win.opera || ''

  if (/android/i.test(ua)) return 'android'
  if (/iphone|ipad|ipod|ios/i.test(ua)) return 'ios'
  return 'desktop'
}

export function installInstructions(platform: Platform): string {
  if (platform === 'android') {
    return [
      'Install on Android:',
      '1. Open CodeQuest in Chrome.',
      '2. Tap the menu (⋮), then Install app or Add to Home screen.',
      '3. Confirm Install — CodeQuest opens like a native app.',
    ].join('\n')
  }

  if (platform === 'ios') {
    return [
      'Install on iPhone / iPad:',
      '1. Open CodeQuest in Safari (required for install).',
      '2. Tap Share, then Add to Home Screen.',
      '3. Tap Add — CodeQuest appears on your home screen.',
    ].join('\n')
  }

  return [
    'Install on desktop:',
    '1. Open CodeQuest in Chrome or Edge.',
    '2. Click the install icon in the address bar (or browser menu → Install).',
    '3. Launch CodeQuest from your apps list — it runs in its own window.',
  ].join('\n')
}
