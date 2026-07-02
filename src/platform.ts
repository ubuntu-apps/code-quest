export type Platform = 'android' | 'ios' | 'desktop'

export type InstallGuide = {
  platform: Platform
  title: string
  steps: string[]
}

export const INSTALL_GUIDES: InstallGuide[] = [
  {
    platform: 'android',
    title: 'Install on Android',
    steps: [
      'Open CodeQuest in Chrome.',
      'Tap the menu (⋮), then Install app or Add to Home screen.',
      'Confirm Install — CodeQuest opens like a native app.',
    ],
  },
  {
    platform: 'ios',
    title: 'Install on iPhone / iPad',
    steps: [
      'Open CodeQuest in Safari (required — other browsers cannot install PWAs on iOS).',
      'Tap the Share button at the bottom of the screen (square with an arrow pointing up).',
      'Scroll the share sheet and tap Add to Home Screen.',
      'Tap Add in the top-right corner — CodeQuest appears on your home screen.',
    ],
  },
  {
    platform: 'desktop',
    title: 'Install on desktop',
    steps: [
      'Open CodeQuest in Chrome or Edge.',
      'Click the install icon in the address bar (or browser menu → Install).',
      'Launch CodeQuest from your apps list — it runs in its own window.',
    ],
  },
]

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
  const guide = INSTALL_GUIDES.find((g) => g.platform === platform) ?? INSTALL_GUIDES[2]
  return [guide.title, ...guide.steps.map((step, i) => `${i + 1}. ${step}`)].join('\n')
}
