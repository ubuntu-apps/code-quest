import type { Challenge, LanguageBundle, Level, RootIndex, TestQuestion } from '../curriculum/types'
import type { AboutContent } from './aboutContent'
import type { ContentSource } from './curriculumDraftStorage'

/** Everything the editor offers the app, through the hooks in editorHooks.ts. */
export interface EditorContextValue {
  canEdit: boolean
  isEditMode: boolean
  setEditMode: (value: boolean) => void
  toggleEditMode: () => void
  beginEditSession: () => void
  commitEditSession: () => Promise<void>
  discardEditSession: () => Promise<void>
  editSessionEpoch: number
  registerCatalogReload: (handler: () => void | Promise<void>) => () => void
  applyCatalogFromDisk: (root: RootIndex, loadedBundles: Record<string, LanguageBundle>) => void

  contentSource: ContentSource
  setContentSource: (source: ContentSource) => void
  githubHomeLead: string

  rootIndex: RootIndex | null
  syncRootIndex: (fetched: RootIndex) => void
  updateLanguage: (langId: string, patch: { title?: string; id?: string }) => void
  updateHomeLead: (text: string) => void
  homeLead: string

  getBundle: (langId: string) => LanguageBundle | null
  syncBundle: (langId: string, fetched: LanguageBundle) => void
  updateLanguageTitle: (langId: string, title: string) => void
  updateSectionTitle: (langId: string, sectionId: string, title: string, options?: { commit?: boolean }) => void
  updateLevelTitle: (langId: string, sectionId: string, levelId: string, title: string) => void
  updateLevelIntro: (
    langId: string,
    sectionId: string,
    levelId: string,
    patch: Partial<Level['intro']>,
  ) => void
  updateChallenge: (
    langId: string,
    sectionId: string,
    levelId: string,
    challengeId: string,
    patch: Partial<Challenge>,
  ) => void
  updateTestPassingScore: (
    langId: string,
    sectionId: string,
    levelId: string,
    score: number,
  ) => void
  updateTestQuestion: (
    langId: string,
    sectionId: string,
    levelId: string,
    questionId: string,
    question: TestQuestion,
  ) => void

  requestConfirm: (message: string) => Promise<boolean>

  addLanguage: () => string | null
  removeLanguage: (langId: string) => void
  moveLanguage: (langId: string, direction: -1 | 1) => void

  addSection: (langId: string) => string | null
  removeSection: (langId: string, sectionId: string) => void
  moveSection: (langId: string, sectionId: string, direction: -1 | 1) => void

  addLevel: (langId: string, sectionId: string) => string | null
  removeLevel: (langId: string, sectionId: string, levelId: string) => void
  moveLevel: (langId: string, sectionId: string, levelId: string, direction: -1 | 1) => void

  addChallenge: (langId: string, sectionId: string, levelId: string) => string | null
  removeChallenge: (langId: string, sectionId: string, levelId: string, challengeId: string) => void
  moveChallenge: (
    langId: string,
    sectionId: string,
    levelId: string,
    challengeId: string,
    direction: -1 | 1,
  ) => void

  addTestQuestion: (
    langId: string,
    sectionId: string,
    levelId: string,
    type: 'mcq' | 'shortText',
  ) => string | null
  removeTestQuestion: (
    langId: string,
    sectionId: string,
    levelId: string,
    questionId: string,
  ) => void
  moveTestQuestion: (
    langId: string,
    sectionId: string,
    levelId: string,
    questionId: string,
    direction: -1 | 1,
  ) => void

  addAboutInstallStep: () => void
  removeAboutInstallStep: (index: number) => void
  moveAboutInstallStep: (index: number, direction: -1 | 1) => void

  aboutContent: AboutContent
  initAboutContent: (platformSteps: string[]) => void
  updateAboutLead: (text: string) => void
  updateAboutInstallIntro: (text: string) => void
  updateAboutInstallStep: (index: number, text: string) => void

  exportRootIndex: () => void
  exportLanguageIndex: (langId: string) => void
  exportSection: (langId: string, sectionId: string) => void

  importFromGitHub: (baseUrl: string) => Promise<void>
  saveToGitHub: (onProgress?: (label: string, index: number, total: number) => void) => Promise<void>
}
