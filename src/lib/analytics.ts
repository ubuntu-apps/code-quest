import { useEffect, useSyncExternalStore } from 'react'
import { useLocation } from 'react-router-dom'
import { isAdminMode } from '../features/curriculum/adminMode'

/**
 * Anonymous usage counts with GoatCounter (https://www.goatcounter.com): no cookies and
 * nothing that identifies a learner. It counts screens opened and a few milestones
 * (a quiz passed, a challenge solved…), so we can see which lessons people reach and
 * where they get stuck. Learners can turn it off on the About tab.
 *
 * Set GOATCOUNTER_ENDPOINT to null to switch counting off for everyone.
 */
export const GOATCOUNTER_ENDPOINT: string | null = 'https://codequest.goatcounter.com/count'
const SCRIPT_URL = 'https://gc.zgo.at/count.js'
const OFF_KEY = 'codequest:analytics-off'

interface GoatCounterCount {
  path: string
  title?: string
  event?: boolean
}

declare global {
  interface Window {
    goatcounter?: { count?: (vars: GoatCounterCount) => void; no_onload?: boolean }
  }
}

function readOff(): boolean {
  try {
    return localStorage.getItem(OFF_KEY) === '1'
  } catch {
    return false
  }
}

let off = readOff()
const listeners = new Set<() => void>()

export function analyticsAllowed(): boolean {
  return !off
}

export function setAnalyticsAllowed(allowed: boolean): void {
  off = !allowed
  try {
    if (allowed) localStorage.removeItem(OFF_KEY)
    else localStorage.setItem(OFF_KEY, '1')
  } catch {
    // Storage unavailable: the choice lasts until the page is closed.
  }
  if (!allowed) queue.length = 0
  for (const l of listeners) l()
}

export function useAnalyticsAllowed(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    analyticsAllowed,
    () => true,
  )
}

/** Counting only happens on the live site, for learners who haven't turned it off. */
function shouldCount(): boolean {
  return Boolean(GOATCOUNTER_ENDPOINT) && !import.meta.env.DEV && !off && !isAdminMode()
}

const queue: GoatCounterCount[] = []
let scriptRequested = false

function flush(): void {
  const count = window.goatcounter?.count
  if (!count) return
  while (queue.length) {
    const vars = queue.shift()!
    try {
      count(vars)
    } catch {
      // Counting must never break the app.
    }
  }
}

function loadScript(): void {
  if (scriptRequested || typeof document === 'undefined' || !GOATCOUNTER_ENDPOINT) return
  scriptRequested = true
  // Screens are counted by hand (the app changes screens without reloading the page).
  window.goatcounter = { ...window.goatcounter, no_onload: true }
  const s = document.createElement('script')
  s.async = true
  s.src = SCRIPT_URL
  s.dataset.goatcounter = GOATCOUNTER_ENDPOINT
  s.dataset.goatcounterSettings = JSON.stringify({ no_onload: true })
  s.onload = flush
  // Offline, or blocked by an ad blocker: no counts, and nothing else changes.
  s.onerror = () => {
    queue.length = 0
  }
  document.head.appendChild(s)
}

function send(vars: GoatCounterCount): void {
  if (!shouldCount()) return
  queue.push(vars)
  // Don't let a queue pile up when the script never arrives.
  if (queue.length > 50) queue.splice(0, queue.length - 50)
  loadScript()
  flush()
}

/** Turn a route into a path for the dashboard: no query string or hash (a supporter code is never sent). */
export function screenPath(pathname: string): string {
  const clean = pathname.replace(/\/+$/, '')
  return clean === '' ? '/' : clean
}

let lastPath: string | null = null

export function countScreen(pathname: string): void {
  const path = screenPath(pathname)
  if (path === lastPath) return
  lastPath = path
  send({ path, title: document.title })
}

/**
 * A milestone, such as `quiz-passed/variables`. Names are made from course ids only,
 * never from anything a learner typed.
 */
export function countEvent(name: string, title?: string): void {
  send({ path: name, title: title ?? name, event: true })
}

const ONCE_PREFIX = 'codequest:counted:'

/**
 * A milestone counted once per device, such as finishing a lesson: the totals then show
 * roughly how many learners got that far, not how many times they retook it.
 */
export function countOnce(name: string, title?: string): void {
  if (!shouldCount()) return
  const key = ONCE_PREFIX + name
  try {
    if (localStorage.getItem(key)) return
    localStorage.setItem(key, '1')
  } catch {
    // Storage unavailable: count it anyway.
  }
  countEvent(name, title)
}

function isInstalledApp(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean }
  return window.matchMedia?.('(display-mode: standalone)').matches === true || nav.standalone === true
}

let started = false

/** Counts each screen the learner opens. Use once, inside the router. */
export function useScreenCounts(): void {
  const { pathname } = useLocation()
  useEffect(() => {
    if (!started) {
      started = true
      if (isInstalledApp()) countEvent('opened/installed-app', 'Opened the installed app')
      window.addEventListener('appinstalled', () => countEvent('app-installed', 'Installed the app'))
    }
    countScreen(pathname)
  }, [pathname])
}
