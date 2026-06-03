import type {
  LanguageBundle,
  LanguageIndex,
  LoadedSection,
  RootIndex,
  SectionFile,
} from './types'

function languageDirFromPath(languagePath: string): string {
  const idx = languagePath.lastIndexOf('/')
  return idx >= 0 ? languagePath.slice(0, idx + 1) : ''
}

export async function loadRootIndex(baseUrl: string): Promise<RootIndex> {
  const res = await fetch(`${baseUrl}content/index.json`)
  if (!res.ok) throw new Error(`Failed to load curriculum index (${res.status})`)
  return res.json() as Promise<RootIndex>
}

async function loadLanguageIndex(baseUrl: string, languagePath: string): Promise<LanguageIndex> {
  const res = await fetch(`${baseUrl}content/${languagePath}`)
  if (!res.ok) throw new Error(`Failed to load language (${res.status})`)
  return res.json() as Promise<LanguageIndex>
}

async function loadSectionFile(
  baseUrl: string,
  languageDir: string,
  sectionPath: string,
): Promise<SectionFile> {
  const res = await fetch(`${baseUrl}content/${languageDir}${sectionPath}`)
  if (!res.ok) throw new Error(`Failed to load section (${res.status})`)
  return res.json() as Promise<SectionFile>
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
