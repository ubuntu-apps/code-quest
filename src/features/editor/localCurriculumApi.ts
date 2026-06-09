import type { LanguageBundle, RootIndex } from '../curriculum/types'
import { buildCurriculumSavePlan } from './curriculumSavePlan'

const SAVE_API = '/__codequest/api/save-curriculum'

export function canSaveCurriculumToDisk(): boolean {
  return import.meta.env.DEV
}

export async function saveCurriculumToDisk(
  rootIndex: RootIndex,
  bundles: Record<string, LanguageBundle>,
): Promise<string[]> {
  if (!import.meta.env.DEV) {
    throw new Error('Saving to public/content/ requires the dev server (npm run dev).')
  }

  const plan = buildCurriculumSavePlan(rootIndex, bundles)
  const res = await fetch(SAVE_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      files: plan.map((item) => ({ path: item.repoPath, json: item.json })),
    }),
  })

  const payload = (await res.json().catch(() => null)) as
    | { ok?: boolean; written?: string[]; error?: string }
    | null

  if (!res.ok) {
    throw new Error(payload?.error ?? `Failed to save curriculum files (${res.status})`)
  }

  return payload?.written ?? plan.map((p) => p.repoPath)
}
