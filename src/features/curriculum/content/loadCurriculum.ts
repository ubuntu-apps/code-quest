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

const OFFLINE_LOAD_ERROR =
  "Couldn't load the quests. You may be offline: stages you've opened before work offline, but these haven't been downloaded yet. Connect to the internet and try again."

/** True for a fetch that never got a response (offline, DNS, blocked), not an HTTP error. */
function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError
}

/** The message to show a learner for a failed lesson load. */
export function lessonLoadErrorMessage(error: unknown, fallback: string): string {
  if (isNetworkError(error) || (typeof navigator !== 'undefined' && navigator.onLine === false)) {
    return OFFLINE_LOAD_ERROR
  }
  return error instanceof Error ? error.message : fallback
}

export type LoadCurriculumOptions = {
  cacheBust?: boolean
  /** Always fetch again instead of sharing an earlier request for the same course. */
  fresh?: boolean
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

async function fetchLanguageBundle(
  baseUrl: string,
  languagePath: string,
  options?: LoadCurriculumOptions,
): Promise<LanguageBundle> {
  const index = await loadLanguageIndex(baseUrl, languagePath, options)
  const languageDir = languageDirFromPath(languagePath)

  // Fetch every section at once rather than one after another.
  const results = await Promise.all(
    index.sections.map(async (sectionRef) => {
      try {
        return { sectionRef, file: await loadSectionFile(baseUrl, languageDir, sectionRef.path, options) }
      } catch (error: unknown) {
        return { sectionRef, file: null, error }
      }
    }),
  )

  // No connection is not a "missing file": report it as the network error it is.
  const networkFailure = results.find((r) => r.file === null && isNetworkError(r.error))
  if (networkFailure) throw networkFailure.error

  const missing = results.filter((r) => r.file === null).map((r) => r.sectionRef.path)
  if (missing.length > 0) {
    throw new Error(`Missing section file(s) for ${languageDir}: ${missing.join(', ')}. Regenerate the course or remove them from its index.json.`)
  }

  const sections: LoadedSection[] = results.map((r) => ({ sectionRef: r.sectionRef, file: r.file! }))
  return { index, sections }
}

/** Requests shared between callers, so a course is downloaded once per session. */
const bundleRequests = new Map<string, Promise<LanguageBundle>>()

export async function loadLanguageBundle(
  baseUrl: string,
  languagePath: string,
  options?: LoadCurriculumOptions,
): Promise<LanguageBundle> {
  const shareable = !options?.cacheBust && !options?.fresh
  const key = `${baseUrl}|${languagePath}`
  const pending = shareable ? bundleRequests.get(key) : undefined
  if (pending) return pending

  const request = fetchLanguageBundle(baseUrl, languagePath, options)
  // A fresh download (e.g. "Download for offline") replaces the shared copy, so later
  // normal loads get it too. A failed one is forgotten, so the next load tries again.
  bundleRequests.set(key, request)
  request.catch(() => {
    if (bundleRequests.get(key) === request) bundleRequests.delete(key)
  })
  return request
}
