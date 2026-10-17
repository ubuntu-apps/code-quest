import { loadLanguageBundle, loadRootIndex } from './loadCurriculum'
import { preparePythonOffline } from './pythonSandbox'
import { prepareROffline } from './rSandbox'
import { requestPersistentStorageOnce } from './storagePersistence'
import type { LanguageBundle } from './types'

const OFFLINE_STATE_KEY = 'codequest:offline'

export interface OfflineState {
  /** When the last full download finished (ISO time). */
  downloadedAt: string
  /** Course ids whose code runtime was downloaded. */
  runtimes: string[]
}

export type OfflineStep = 'lessons' | 'python' | 'r'

export function loadOfflineState(): OfflineState | null {
  try {
    const raw = localStorage.getItem(OFFLINE_STATE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<OfflineState>
    if (typeof parsed.downloadedAt !== 'string' || !Array.isArray(parsed.runtimes)) return null
    return { downloadedAt: parsed.downloadedAt, runtimes: parsed.runtimes }
  } catch {
    return null
  }
}

function saveOfflineState(state: OfflineState): void {
  try {
    localStorage.setItem(OFFLINE_STATE_KEY, JSON.stringify(state))
  } catch {
    // Not fatal: only the "last downloaded" note is lost.
  }
}

/** True when a service worker controls this page, so fetched files land in its caches. */
export function offlineCachingAvailable(): boolean {
  return typeof navigator !== 'undefined' && Boolean(navigator.serviceWorker?.controller)
}

/** All Python code in a course, so the worker can find every package it imports. */
export function collectLessonCode(bundle: LanguageBundle): string {
  const parts: string[] = []
  for (const { file } of bundle.sections) {
    for (const level of file.levels) {
      parts.push(level.intro.sandboxCode ?? '')
      for (const snippet of level.sandboxSnippets ?? []) parts.push(snippet.code)
      for (const ch of level.challenges) {
        parts.push(ch.starterCode ?? '', ch.solution ?? '', ch.validation.setupCode ?? '')
      }
    }
  }
  return parts.filter(Boolean).join('\n')
}

/**
 * Fetches every lesson and the code runtimes for `runtimeCourses` while online.
 * The service worker caches what is fetched (see vite.config.ts), so it all works offline afterwards.
 */
export async function downloadForOffline(options: {
  baseUrl: string
  runtimeCourses: string[]
  onStep?: (step: OfflineStep) => void
}): Promise<OfflineState> {
  const { baseUrl, runtimeCourses, onStep } = options
  if (!offlineCachingAvailable()) {
    throw new Error('Offline mode is not set up in this browser yet. Reload the page and try again.')
  }
  requestPersistentStorageOnce()

  onStep?.('lessons')
  const bundles: Record<string, LanguageBundle> = {}
  try {
    const root = await loadRootIndex(baseUrl)
    for (const lang of root.languages) {
      // fresh: really fetch through the service worker so it caches the files,
      // even if this session already loaded them (possibly before it was in control).
      bundles[lang.id] = await loadLanguageBundle(baseUrl, lang.path, { fresh: true })
    }
  } catch {
    throw new Error('Could not download the lessons. Check your internet connection and try again.')
  }

  const runtimes: string[] = []
  if (runtimeCourses.includes('python') && bundles.python) {
    onStep?.('python')
    await preparePythonOffline(collectLessonCode(bundles.python))
    runtimes.push('python')
  }
  if (runtimeCourses.includes('r') && bundles.r) {
    onStep?.('r')
    try {
      await prepareROffline()
    } catch {
      throw new Error('Could not download the R runtime. Check your internet connection and try again.')
    }
    runtimes.push('r')
  }

  const state = { downloadedAt: new Date().toISOString(), runtimes }
  saveOfflineState(state)
  return state
}

/** Bytes this site stores on the device, when the browser reports it. */
export async function storageUsedBytes(): Promise<number | null> {
  try {
    const estimate = await navigator.storage?.estimate?.()
    return typeof estimate?.usage === 'number' ? estimate.usage : null
  } catch {
    return null
  }
}
