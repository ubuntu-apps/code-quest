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

export async function loadRootIndex(baseUrl: string): Promise<RootIndex> {
  const source = 'content/index.json'
  const res = await fetch(`${baseUrl}${source}`)
  if (!res.ok) throw new Error(`Failed to load curriculum index (${res.status})`)
  const data: unknown = await res.json()
  return parseRootIndex(data, source)
}

async function loadLanguageIndex(baseUrl: string, languagePath: string): Promise<LanguageIndex> {
  const source = `content/${languagePath}`
  const res = await fetch(`${baseUrl}${source}`)
  if (!res.ok) throw new Error(`Failed to load language (${res.status})`)
  const data: unknown = await res.json()
  return parseLanguageIndex(data, source)
}

async function loadSectionFile(
  baseUrl: string,
  languageDir: string,
  sectionPath: string,
): Promise<SectionFile> {
  const source = `content/${languageDir}${sectionPath}`
  const res = await fetch(`${baseUrl}${source}`)
  if (!res.ok) throw new Error(`Failed to load section (${res.status})`)
  const data: unknown = await res.json()
  return parseSectionFile(data, source)
}

export async function loadLanguageBundle(baseUrl: string, languagePath: string): Promise<LanguageBundle> {
  const index = await loadLanguageIndex(baseUrl, languagePath)
  const languageDir = languageDirFromPath(languagePath)
  const sections: LoadedSection[] = []
  for (const sectionRef of index.sections) {
    const file = await loadSectionFile(baseUrl, languageDir, sectionRef.path)
    sections.push({ sectionRef, file })
  }
  return { index, sections }
}
