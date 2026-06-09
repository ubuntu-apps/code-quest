import type {
  LanguageBundle,
  LanguageIndex,
  LoadedSection,
  RootIndex,
  SectionFile,
} from './types'
import {
  parseLanguageIndex,
  parseRootIndex,
  parseSectionFile,
} from './curriculumSchemas'

function languageDirFromPath(languagePath: string): string {
  const idx = languagePath.lastIndexOf('/')
  return idx >= 0 ? languagePath.slice(0, idx + 1) : ''
}

function curriculumUrl(baseUrl: string, source: string, cacheBust?: boolean): string {
  const url = `${baseUrl}${source}`
  if (!cacheBust) return url
  return `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`
}

export type LoadCurriculumOptions = {
  cacheBust?: boolean
}

async function parseJsonResponse(res: Response, source: string): Promise<unknown> {
  const text = await res.text()
  const trimmed = text.trimStart()
  if (!res.ok) {
    throw new Error(
      trimmed.startsWith('<')
        ? `Failed to load ${source} (${res.status}) — got HTML instead of JSON. Is the file missing under public/?`
        : `Failed to load ${source} (${res.status})`,
    )
  }
  if (trimmed.startsWith('<')) {
    throw new Error(
      `Failed to load ${source} — server returned HTML instead of JSON. The file may be missing (check public/${source}).`,
    )
  }
  try {
    return JSON.parse(text) as unknown
  } catch {
    throw new Error(`Failed to load ${source} — response is not valid JSON.`)
  }
}

export async function loadRootIndex(baseUrl: string, options?: LoadCurriculumOptions): Promise<RootIndex> {
  const source = 'content/index.json'
  const res = await fetch(curriculumUrl(baseUrl, source, options?.cacheBust))
  const data = await parseJsonResponse(res, source)
  return parseRootIndex(data, source)
}

async function loadLanguageIndex(
  baseUrl: string,
  languagePath: string,
  options?: LoadCurriculumOptions,
): Promise<LanguageIndex> {
  const source = `content/${languagePath}`
  const res = await fetch(curriculumUrl(baseUrl, source, options?.cacheBust))
  const data = await parseJsonResponse(res, source)
  return parseLanguageIndex(data, source)
}

async function loadSectionFile(
  baseUrl: string,
  languageDir: string,
  sectionPath: string,
  options?: LoadCurriculumOptions,
): Promise<SectionFile> {
  const source = `content/${languageDir}${sectionPath}`
  const res = await fetch(curriculumUrl(baseUrl, source, options?.cacheBust))
  const data = await parseJsonResponse(res, source)
  return parseSectionFile(data, source)
}

export type LoadLanguageBundleOptions = LoadCurriculumOptions & {
  /** Use section payloads from this bundle when a file is not on disk yet. */
  fallbackBundle?: LanguageBundle | null
}

export async function loadLanguageBundle(
  baseUrl: string,
  languagePath: string,
  options?: LoadLanguageBundleOptions,
): Promise<LanguageBundle> {
  const index = await loadLanguageIndex(baseUrl, languagePath, options)
  const languageDir = languageDirFromPath(languagePath)
  const fallbackSections = options?.fallbackBundle?.sections ?? []
  const sections: LoadedSection[] = []
  const missing: string[] = []

  for (const sectionRef of index.sections) {
    try {
      const file = await loadSectionFile(baseUrl, languageDir, sectionRef.path, options)
      sections.push({ sectionRef, file })
    } catch {
      const draft = fallbackSections.find((s) => s.sectionRef.id === sectionRef.id)
      if (draft) {
        sections.push({
          sectionRef,
          file: draft.file,
        })
        continue
      }
      missing.push(sectionRef.path)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing section file(s) for ${languageDir}: ${missing.join(', ')}. ` +
        'Export them from the editor or remove the entries from the language index.',
    )
  }

  return { index, sections }
}
