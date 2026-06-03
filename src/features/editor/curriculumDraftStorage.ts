import type { LanguageBundle, RootIndex } from '../curriculum/types'
import type { AboutContent } from './aboutContent'

const ROOT_KEY = 'codequest:editor:rootIndex'
const BUNDLE_PREFIX = 'codequest:editor:bundle:'
const ABOUT_KEY = 'codequest:editor:about'
const HOME_LEAD_KEY = 'codequest:editor:homeLead'

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function writeJson(key: string, data: unknown): void {
  localStorage.setItem(key, JSON.stringify(data))
}

export function loadDraftRootIndex(): RootIndex | null {
  return readJson<RootIndex>(ROOT_KEY)
}

export function saveDraftRootIndex(data: RootIndex): void {
  writeJson(ROOT_KEY, data)
}

export function loadDraftBundle(langId: string): LanguageBundle | null {
  return readJson<LanguageBundle>(`${BUNDLE_PREFIX}${langId}`)
}

export function saveDraftBundle(langId: string, data: LanguageBundle): void {
  writeJson(`${BUNDLE_PREFIX}${langId}`, data)
}

export function loadDraftAbout(): AboutContent | null {
  return readJson<AboutContent>(ABOUT_KEY)
}

export function saveDraftAbout(data: AboutContent): void {
  writeJson(ABOUT_KEY, data)
}

export function loadDraftHomeLead(): string | null {
  return readJson<string>(HOME_LEAD_KEY)
}

export function saveDraftHomeLead(text: string): void {
  writeJson(HOME_LEAD_KEY, text)
}
