import { useSyncExternalStore } from 'react'

/** The learner's choice on the About tab; "system" follows the device's light/dark setting. */
export type ThemeChoice = 'system' | 'light' | 'dark'

const THEME_STORAGE_KEY = 'codequest:theme'
/** The browser bar colour for each theme (matches --cq-bg in index.css). */
const BAR_COLOURS = { dark: '#0f172a', light: '#f1f5f9' } as const

const listeners = new Set<() => void>()

function readChoice(): ThemeChoice {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : 'system'
  } catch {
    return 'system'
  }
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
  try {
    if (next === 'system') localStorage.removeItem(THEME_STORAGE_KEY)
    else localStorage.setItem(THEME_STORAGE_KEY, next)
  } catch {
    // Storage unavailable: the choice lasts until the page is closed.
  }
  apply()
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useTheme(): ThemeChoice {
  return useSyncExternalStore(subscribe, () => choice, () => choice)
}
