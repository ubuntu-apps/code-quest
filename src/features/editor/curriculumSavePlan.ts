import type { LanguageBundle, RootIndex } from '../curriculum/types'

export interface CurriculumSaveFile {
  repoPath: string
  json: unknown
  label: string
}

export function buildCurriculumSavePlan(
  rootIndex: RootIndex,
  bundles: Record<string, LanguageBundle>,
): CurriculumSaveFile[] {
  const plan: CurriculumSaveFile[] = [{ repoPath: 'index.json', json: rootIndex, label: 'index.json' }]

  for (const [, bundle] of Object.entries(bundles)) {
    const langId = bundle.index.id
    plan.push({
      repoPath: `${langId}/index.json`,
      json: bundle.index,
      label: `${langId}/index.json`,
    })
    for (const section of bundle.sections) {
      const filename = section.sectionRef.path.split('/').pop() ?? `${section.sectionRef.id}.json`
      plan.push({
        repoPath: `${langId}/${filename}`,
        json: section.file,
        label: `${langId}/${filename}`,
      })
    }
  }

  return plan
}
