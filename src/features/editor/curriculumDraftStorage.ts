import type { LanguageBundle, RootIndex } from '../curriculum/types'
import {
  safeParseHomeLead,
  safeParseLanguageBundle,
  safeParseRootIndex,
} from '../curriculum/curriculumSchemas'
import type { AboutContent } from './aboutContent'
import { z } from 'zod'

const ROOT_KEY = 'codequest:editor:rootIndex'
const BUNDLE_PREFIX = 'codequest:editor:bundle:'
const ABOUT_KEY = 'codequest:editor:about'
const HOME_LEAD_KEY = 'codequest:editor:homeLead'
const CONTENT_SOURCE_KEY = 'codequest:editor:contentSource'

export type ContentSource = 'local' | 'github'

const aboutContentSchema = z.object({
  lead: z.string(),
  installIntro: z.string(),
  installSteps: z.array(z.string()),
})

function readJson(key: string): unknown | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as unknown
  } catch {
    return null
  }
}

function writeJson(key: string, data: unknown): void {
  localStorage.setItem(key, JSON.stringify(data))
}

export function loadDraftRootIndex(): RootIndex | null {
  const data = readJson(ROOT_KEY)
  if (data === null) return null
  return safeParseRootIndex(data, ROOT_KEY)
}

export function saveDraftRootIndex(data: RootIndex): void {
  writeJson(ROOT_KEY, data)
}

export function removeDraftRootIndex(): void {
  localStorage.removeItem(ROOT_KEY)
}

export function loadDraftBundle(langId: string): LanguageBundle | null {
  const key = `${BUNDLE_PREFIX}${langId}`
  const data = readJson(key)
  if (data === null) return null
  return safeParseLanguageBundle(data, key)
}

export function saveDraftBundle(langId: string, data: LanguageBundle): void {
  writeJson(`${BUNDLE_PREFIX}${langId}`, data)
}

export function removeDraftBundle(langId: string): void {
  localStorage.removeItem(`${BUNDLE_PREFIX}${langId}`)
}

export function listDraftBundleIds(): string[] {
  const ids: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(BUNDLE_PREFIX)) {
      ids.push(key.slice(BUNDLE_PREFIX.length))
    }
  }
  return ids
}

export function loadDraftAbout(): AboutContent | null {
  const data = readJson(ABOUT_KEY)
  if (data === null) return null
  const result = aboutContentSchema.safeParse(data)
  if (!result.success) {
    console.warn(`Invalid draft in ${ABOUT_KEY}`)
    return null
  }
  return result.data
}

export function saveDraftAbout(data: AboutContent): void {
  writeJson(ABOUT_KEY, data)
}

export function loadDraftHomeLead(): string | null {
  const data = readJson(HOME_LEAD_KEY)
  if (data === null) return null
  return safeParseHomeLead(data, HOME_LEAD_KEY)
}

export function saveDraftHomeLead(text: string): void {
  writeJson(HOME_LEAD_KEY, text)
}

export function loadContentSource(): ContentSource {
  const data = readJson(CONTENT_SOURCE_KEY)
  if (data === 'local' || data === 'github') return data
  return 'local'
}

export function saveContentSource(source: ContentSource): void {
  writeJson(CONTENT_SOURCE_KEY, source)
}
