import { STORES } from './lib/stores'
import { useStore } from './lib/localStore'

/** The learner's choice on the Settings tab; "system" follows the device's light/dark setting. */
export type ThemeChoice = 'system' | 'light' | 'dark'

/** The browser bar colour for each theme (matches --cq-bg in index.css). */
const BAR_COLOURS = { dark: '#0f172a', light: '#f1f5f9' } as const

function readChoice(): ThemeChoice {
  const value = STORES.theme.get()
  return value === 'light' || value === 'dark' ? value : 'system'
}

let choice: ThemeChoice = 'system'

function systemPrefersLight(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches === true
}

/** Puts the choice on <html data-theme> (index.css reads it) and recolours the browser bar. */
function apply(): void {
  const root = document.documentElement
  if (choice === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', choice)
  const light = choice === 'light' || (choice === 'system' && systemPrefersLight())
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', light ? BAR_COLOURS.light : BAR_COLOURS.dark)
}

/** Call once before the app renders, so the page never flashes the wrong theme. */
export function initTheme(): void {
  choice = readChoice()
  apply()
  // Following the device: recolour the browser bar when the device switches.
  window.matchMedia?.('(prefers-color-scheme: light)').addEventListener?.('change', () => {
    if (choice === 'system') apply()
  })
}

export function setTheme(next: ThemeChoice): void {
  choice = next
  STORES.theme.set(next === 'system' ? '' : next)
  apply()
}

export function useTheme(): ThemeChoice {
  useStore(STORES.theme)
  return choice
}
