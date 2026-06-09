import type { LanguageBundle, RootIndex } from '../curriculum/types'
import type { AboutContent } from './aboutContent'
import { cloneBundle, cloneRootIndex } from './curriculumPatch'

export type EditorDraftSnapshot = {
  rootIndex: RootIndex | null
  bundles: Record<string, LanguageBundle>
  homeLead: string
  aboutContent: AboutContent
}

export function captureEditorSnapshot(
  rootIndex: RootIndex | null,
  bundles: Record<string, LanguageBundle>,
  homeLead: string,
  aboutContent: AboutContent,
): EditorDraftSnapshot {
  const bundleSnapshot: Record<string, LanguageBundle> = {}
  for (const [langId, bundle] of Object.entries(bundles)) {
    bundleSnapshot[langId] = cloneBundle(bundle)
  }
  return {
    rootIndex: rootIndex ? cloneRootIndex(rootIndex) : null,
    bundles: bundleSnapshot,
    homeLead,
    aboutContent: {
      lead: aboutContent.lead,
      installIntro: aboutContent.installIntro,
      installSteps: [...aboutContent.installSteps],
    },
  }
}
