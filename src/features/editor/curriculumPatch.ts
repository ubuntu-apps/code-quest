import type { LanguageBundle, Level } from '../curriculum/types'

export function cloneBundle(bundle: LanguageBundle): LanguageBundle {
  return structuredClone(bundle)
}

export function cloneRootIndex<T>(root: T): T {
  return structuredClone(root)
}

export function patchBundle(
  bundle: LanguageBundle,
  sectionId: string,
  levelId: string,
  patchLevel: (level: Level) => Level,
): LanguageBundle {
  const next = cloneBundle(bundle)
  for (const section of next.sections) {
    if (section.sectionRef.id !== sectionId) continue
    section.file.levels = section.file.levels.map((lvl) =>
      lvl.id === levelId ? patchLevel(lvl) : lvl,
    )
    const secRef = next.index.sections.find((s) => s.id === sectionId)
    if (secRef && section.file.title) {
      secRef.title = section.file.title
    }
  }
  return next
}

export function patchSectionLevels(
  bundle: LanguageBundle,
  sectionId: string,
  patchLevels: (levels: Level[]) => Level[],
): LanguageBundle | null {
  const next = cloneBundle(bundle)
  let found = false
  for (const section of next.sections) {
    if (section.sectionRef.id !== sectionId) continue
    section.file.levels = patchLevels(section.file.levels)
    found = true
  }
  return found ? next : null
}
