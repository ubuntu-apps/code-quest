import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  Challenge,
  LanguageBundle,
  Level,
  RootIndex,
  TestQuestion,
  Validation,
} from '../curriculum/types'
import { mergeAboutContent, type AboutContent } from './aboutContent'
import {
  loadDraftAbout,
  loadDraftBundle,
  loadDraftRootIndex,
  saveDraftAbout,
  saveDraftBundle,
  saveDraftRootIndex,
} from './curriculumDraftStorage'
import { canEditContent } from './editorAuth'
import { downloadJson } from './exportCurriculum'

interface EditorContextValue {
  canEdit: boolean
  isEditMode: boolean
  setEditMode: (value: boolean) => void
  toggleEditMode: () => void

  rootIndex: RootIndex | null
  syncRootIndex: (fetched: RootIndex) => void
  updateLanguage: (langId: string, patch: { title?: string; id?: string }) => void
  updateHomeLead: (text: string) => void
  homeLead: string

  getBundle: (langId: string) => LanguageBundle | null
  syncBundle: (langId: string, fetched: LanguageBundle) => void
  updateLanguageTitle: (langId: string, title: string) => void
  updateSectionTitle: (langId: string, sectionId: string, title: string) => void
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
  updateChallengeValidation: (
    langId: string,
    sectionId: string,
    levelId: string,
    challengeId: string,
    validation: Validation,
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

  aboutContent: AboutContent
  initAboutContent: (platformSteps: string[]) => void
  updateAboutLead: (text: string) => void
  updateAboutInstallIntro: (text: string) => void
  updateAboutInstallStep: (index: number, text: string) => void

  exportRootIndex: () => void
  exportLanguageIndex: (langId: string) => void
  exportSection: (langId: string, sectionId: string) => void
}

const EditorContext = createContext<EditorContextValue | null>(null)

const DEFAULT_HOME_LEAD =
  'Pick a language. Lessons and quizzes load from JSON — edit files under `public/content/` or use Edit mode.'

function cloneBundle(bundle: LanguageBundle): LanguageBundle {
  return structuredClone(bundle)
}

function cloneRootIndex(root: RootIndex): RootIndex {
  return structuredClone(root)
}

function patchBundle(
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

export function EditorProvider({ children }: { children: ReactNode }) {
  const canEdit = canEditContent()
  const [isEditMode, setEditMode] = useState(false)
  const [rootIndex, setRootIndex] = useState<RootIndex | null>(() => loadDraftRootIndex())
  const [bundles, setBundles] = useState<Record<string, LanguageBundle>>({})
  const [homeLead, setHomeLead] = useState(DEFAULT_HOME_LEAD)
  const [aboutContent, setAboutContent] = useState<AboutContent>(() => {
    const draft = loadDraftAbout()
    return draft ?? mergeAboutContent([], null)
  })
  const [aboutInitialized, setAboutInitialized] = useState(false)

  const syncRootIndex = useCallback((fetched: RootIndex) => {
    setRootIndex((prev) => {
      if (prev) return prev
      const draft = loadDraftRootIndex()
      return draft ?? cloneRootIndex(fetched)
    })
  }, [])

  const syncBundle = useCallback((langId: string, fetched: LanguageBundle) => {
    setBundles((prev) => {
      if (prev[langId]) return prev
      const draft = loadDraftBundle(langId)
      return { ...prev, [langId]: draft ?? cloneBundle(fetched) }
    })
  }, [])

  const persistRoot = useCallback((next: RootIndex) => {
    setRootIndex(next)
    saveDraftRootIndex(next)
  }, [])

  const persistBundle = useCallback((langId: string, next: LanguageBundle) => {
    setBundles((prev) => ({ ...prev, [langId]: next }))
    saveDraftBundle(langId, next)
  }, [])

  const getBundle = useCallback((langId: string) => bundles[langId] ?? null, [bundles])

  const updateLanguage = useCallback(
    (langId: string, patch: { title?: string; id?: string }) => {
      if (!rootIndex) return
      const next = cloneRootIndex(rootIndex)
      const lang = next.languages.find((l) => l.id === langId)
      if (!lang) return
      if (patch.title !== undefined) lang.title = patch.title
      if (patch.id !== undefined) lang.id = patch.id
      persistRoot(next)
    },
    [rootIndex, persistRoot],
  )

  const updateHomeLead = useCallback((text: string) => {
    setHomeLead(text)
  }, [])

  const updateLanguageTitle = useCallback(
    (langId: string, title: string) => {
      const bundle = bundles[langId]
      if (!bundle) return
      const next = cloneBundle(bundle)
      next.index.title = title
      persistBundle(langId, next)
      updateLanguage(langId, { title })
    },
    [bundles, persistBundle, updateLanguage],
  )

  const updateSectionTitle = useCallback(
    (langId: string, sectionId: string, title: string) => {
      const bundle = bundles[langId]
      if (!bundle) return
      const next = cloneBundle(bundle)
      const secRef = next.index.sections.find((s) => s.id === sectionId)
      if (secRef) secRef.title = title
      const loaded = next.sections.find((s) => s.sectionRef.id === sectionId)
      if (loaded) {
        loaded.sectionRef.title = title
        loaded.file.title = title
      }
      persistBundle(langId, next)
    },
    [bundles, persistBundle],
  )

  const updateLevelTitle = useCallback(
    (langId: string, sectionId: string, levelId: string, title: string) => {
      const bundle = bundles[langId]
      if (!bundle) return
      const next = patchBundle(bundle, sectionId, levelId, (lvl) => ({ ...lvl, title }))
      persistBundle(langId, next)
    },
    [bundles, persistBundle],
  )

  const updateLevelIntro = useCallback(
    (
      langId: string,
      sectionId: string,
      levelId: string,
      patch: Partial<Level['intro']>,
    ) => {
      const bundle = bundles[langId]
      if (!bundle) return
      const next = patchBundle(bundle, sectionId, levelId, (lvl) => ({
        ...lvl,
        intro: { ...lvl.intro, ...patch },
      }))
      persistBundle(langId, next)
    },
    [bundles, persistBundle],
  )

  const updateChallenge = useCallback(
    (
      langId: string,
      sectionId: string,
      levelId: string,
      challengeId: string,
      patch: Partial<Challenge>,
    ) => {
      const bundle = bundles[langId]
      if (!bundle) return
      const next = patchBundle(bundle, sectionId, levelId, (lvl) => ({
        ...lvl,
        challenges: lvl.challenges.map((ch) =>
          ch.id === challengeId ? { ...ch, ...patch } : ch,
        ),
      }))
      persistBundle(langId, next)
    },
    [bundles, persistBundle],
  )

  const updateChallengeValidation = useCallback(
    (
      langId: string,
      sectionId: string,
      levelId: string,
      challengeId: string,
      validation: Validation,
    ) => {
      updateChallenge(langId, sectionId, levelId, challengeId, { validation })
    },
    [updateChallenge],
  )

  const updateTestPassingScore = useCallback(
    (langId: string, sectionId: string, levelId: string, score: number) => {
      const bundle = bundles[langId]
      if (!bundle) return
      const next = patchBundle(bundle, sectionId, levelId, (lvl) => ({
        ...lvl,
        test: { ...lvl.test, passingScorePercent: score },
      }))
      persistBundle(langId, next)
    },
    [bundles, persistBundle],
  )

  const updateTestQuestion = useCallback(
    (
      langId: string,
      sectionId: string,
      levelId: string,
      questionId: string,
      question: TestQuestion,
    ) => {
      const bundle = bundles[langId]
      if (!bundle) return
      const next = patchBundle(bundle, sectionId, levelId, (lvl) => ({
        ...lvl,
        test: {
          ...lvl.test,
          questions: lvl.test.questions.map((q) => (q.id === questionId ? question : q)),
        },
      }))
      persistBundle(langId, next)
    },
    [bundles, persistBundle],
  )

  const initAboutContent = useCallback(
    (platformSteps: string[]) => {
      if (aboutInitialized) return
      const draft = loadDraftAbout()
      setAboutContent(mergeAboutContent(platformSteps, draft))
      setAboutInitialized(true)
    },
    [aboutInitialized],
  )

  const updateAboutLead = useCallback((text: string) => {
    setAboutContent((prev) => {
      const next = { ...prev, lead: text }
      saveDraftAbout(next)
      return next
    })
  }, [])

  const updateAboutInstallIntro = useCallback((text: string) => {
    setAboutContent((prev) => {
      const next = { ...prev, installIntro: text }
      saveDraftAbout(next)
      return next
    })
  }, [])

  const updateAboutInstallStep = useCallback((index: number, text: string) => {
    setAboutContent((prev) => {
      const steps = [...prev.installSteps]
      steps[index] = text
      const next = { ...prev, installSteps: steps }
      saveDraftAbout(next)
      return next
    })
  }, [])

  const exportRootIndex = useCallback(() => {
    if (!rootIndex) return
    downloadJson('index.json', rootIndex)
  }, [rootIndex])

  const exportLanguageIndex = useCallback(
    (langId: string) => {
      const bundle = bundles[langId]
      if (!bundle) return
      downloadJson(`${langId}/index.json`, bundle.index)
    },
    [bundles],
  )

  const exportSection = useCallback(
    (langId: string, sectionId: string) => {
      const bundle = bundles[langId]
      if (!bundle) return
      const section = bundle.sections.find((s) => s.sectionRef.id === sectionId)
      if (!section) return
      const filename = section.sectionRef.path.split('/').pop() ?? `${sectionId}.json`
      downloadJson(filename, section.file)
    },
    [bundles],
  )

  const toggleEditMode = useCallback(() => {
    setEditMode((v) => !v)
  }, [])

  const value = useMemo<EditorContextValue>(
    () => ({
      canEdit,
      isEditMode,
      setEditMode,
      toggleEditMode,
      rootIndex,
      syncRootIndex,
      updateLanguage,
      updateHomeLead,
      homeLead,
      getBundle,
      syncBundle,
      updateLanguageTitle,
      updateSectionTitle,
      updateLevelTitle,
      updateLevelIntro,
      updateChallenge,
      updateChallengeValidation,
      updateTestPassingScore,
      updateTestQuestion,
      aboutContent,
      initAboutContent,
      updateAboutLead,
      updateAboutInstallIntro,
      updateAboutInstallStep,
      exportRootIndex,
      exportLanguageIndex,
      exportSection,
    }),
    [
      canEdit,
      isEditMode,
      toggleEditMode,
      rootIndex,
      syncRootIndex,
      updateLanguage,
      homeLead,
      updateHomeLead,
      getBundle,
      syncBundle,
      updateLanguageTitle,
      updateSectionTitle,
      updateLevelTitle,
      updateLevelIntro,
      updateChallenge,
      updateChallengeValidation,
      updateTestPassingScore,
      updateTestQuestion,
      aboutContent,
      initAboutContent,
      updateAboutLead,
      updateAboutInstallIntro,
      updateAboutInstallStep,
      exportRootIndex,
      exportLanguageIndex,
      exportSection,
    ],
  )

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
}

export function useEditor(): EditorContextValue {
  const ctx = useContext(EditorContext)
  if (!ctx) throw new Error('useEditor must be used within EditorProvider')
  return ctx
}
