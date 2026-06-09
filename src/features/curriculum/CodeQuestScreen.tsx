import '../../App.css'

import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import { BookOpen, ChevronLeft, ExternalLink, Info, ListTodo, X } from 'lucide-react'
import type { Challenge, LanguageBundle, Level, RootIndex } from './types'
import { loadLanguageBundle, loadRootIndex } from './loadCurriculum'
import { gradeQuestion, validateAgainst } from './validateAnswer'
import { loadProgress, saveProgress } from './progressStorage'
import { getFreePythonAiHelp, type PythonAiHelp } from './freeAiHelp'
import {
  runPythonCode,
  runPythonChallengeTests,
  type FriendlyPythonError,
  type PythonChallengeTestResult,
} from './pythonSandbox'
import { BottomNav, type BottomNavItem } from '../../components/BottomNav/BottomNav'
import { detectPlatform, installInstructions } from '../../platform'
import { resetInstallBannerPreference } from '../../components/installBannerStorage'
import {
  EditorHeaderButton,
  EditorToolbar,
  useEditorAbout,
  useEditorCatalog,
  useEditorDraft,
  useEditorGitHub,
  useEditorMode,
  useEditorConfirm,
} from '../editor'
import { mergeAboutContent } from '../editor/aboutContent'
import {
  DEFAULT_SANDBOX_CODE,
  LAST_LEVEL_STORAGE_KEY,
  PASS_DEFAULT,
  type TabId,
} from './constants'
import { useLearnRoute } from './hooks/useLearnRoute'
import {
  computeLevelXp,
  loadStreakState,
  recordDailyActivity,
} from './helpers'
import { useLanguageBundles } from './hooks/useLanguageBundles'
import { useProgressVersion } from './hooks/useProgressVersion'
import { LearnHome, type ContinueTarget } from './views/LearnHome'
import { LearnSections } from './views/LearnSections'
import { LearnLevels } from './views/LearnLevels'
import { LearnLevel } from './views/LearnLevel'
import { ProgressTab } from './views/ProgressTab'
import { AboutTab } from './views/AboutTab'

function clearChallengeAiFeedback(
  setters: {
    setErrorExpanded: Dispatch<SetStateAction<Record<string, boolean>>>
    setAiHelp: Dispatch<SetStateAction<Record<string, PythonAiHelp | null>>>
    setAiLoading: Dispatch<SetStateAction<Record<string, boolean>>>
    setFixCopied: Dispatch<SetStateAction<Record<string, boolean>>>
  },
  challengeId: string,
) {
  setters.setErrorExpanded((prev) => ({ ...prev, [challengeId]: false }))
  setters.setAiHelp((prev) => ({ ...prev, [challengeId]: null }))
  setters.setAiLoading((prev) => ({ ...prev, [challengeId]: false }))
  setters.setFixCopied((prev) => ({ ...prev, [challengeId]: false }))
}

function clearChallengeFeedback(
  setters: {
    setTestResults: Dispatch<SetStateAction<Record<string, PythonChallengeTestResult[]>>>
    setRuntimeError: Dispatch<SetStateAction<Record<string, FriendlyPythonError | null>>>
    setErrorExpanded: Dispatch<SetStateAction<Record<string, boolean>>>
    setAiHelp: Dispatch<SetStateAction<Record<string, PythonAiHelp | null>>>
    setAiLoading: Dispatch<SetStateAction<Record<string, boolean>>>
    setFixCopied: Dispatch<SetStateAction<Record<string, boolean>>>
  },
  challengeId: string,
) {
  setters.setTestResults((prev) => ({ ...prev, [challengeId]: [] }))
  setters.setRuntimeError((prev) => ({ ...prev, [challengeId]: null }))
  clearChallengeAiFeedback(setters, challengeId)
}

export function CodeQuestScreen() {
  const baseUrl = import.meta.env.BASE_URL
  const [platform] = useState(() => detectPlatform())
  const progressVersion = useProgressVersion()
  const {
    isEditMode,
    contentSource,
    setContentSource,
    githubHomeLead,
    editSessionEpoch,
    registerCatalogReload,
    applyCatalogFromDisk,
  } = useEditorMode()
  const {
    rootIndex: editableRootIndex,
    syncRootIndex,
    syncBundle,
    getBundle,
    homeLead,
    updateHomeLead,
    updateLanguage,
    updateLanguageTitle,
    updateSectionTitle,
    updateLevelTitle,
    updateLevelIntro,
    updateChallenge,
    updateTestPassingScore,
    updateTestQuestion,
  } = useEditorDraft()
  const {
    addLanguage,
    removeLanguage,
    moveLanguage,
    addSection,
    removeSection,
    moveSection,
    addLevel,
    removeLevel,
    moveLevel,
    addChallenge,
    removeChallenge,
    moveChallenge,
    addTestQuestion,
    removeTestQuestion,
    moveTestQuestion,
  } = useEditorCatalog()
  const {
    aboutContent,
    initAboutContent,
    updateAboutLead,
    updateAboutInstallIntro,
    updateAboutInstallStep,
    addAboutInstallStep,
    removeAboutInstallStep,
    moveAboutInstallStep,
  } = useEditorAbout()
  const { importFromGitHub } = useEditorGitHub()
  const { requestConfirm } = useEditorConfirm()

  const {
    tab,
    learnView,
    languageId,
    sectionId,
    levelId,
    levelStep,
    goToTab,
    goToLanguage,
    goToSection,
    goToLevel,
    goToLevelStep,
    backFromLearn,
  } = useLearnRoute()

  const [rootIndex, setRootIndex] = useState<RootIndex | null>(null)
  const [rootError, setRootError] = useState<string | null>(null)
  const [streakCount, setStreakCount] = useState(() => loadStreakState().count)

  const [bundle, setBundle] = useState<LanguageBundle | null>(null)
  const [bundleError, setBundleError] = useState<string | null>(null)
  const [loadedLanguageId, setLoadedLanguageId] = useState<string | null>(null)

  const prevLevelIdRef = useRef<string | null>(null)

  const [challengeDrafts, setChallengeDrafts] = useState<Record<string, string>>({})
  const [challengeStatus, setChallengeStatus] = useState<Record<string, 'passed' | 'failed'>>({})
  const [challengeTestResults, setChallengeTestResults] = useState<Record<string, PythonChallengeTestResult[]>>({})
  const [challengeRuntimeError, setChallengeRuntimeError] = useState<Record<string, FriendlyPythonError | null>>({})
  const [challengeErrorExpanded, setChallengeErrorExpanded] = useState<Record<string, boolean>>({})
  const [testShort, setTestShort] = useState<Record<string, string>>({})
  const [testMcq, setTestMcq] = useState<Record<string, string>>({})
  const [testResult, setTestResult] = useState<{ correct: number; total: number; passed: boolean } | null>(null)
  const [readMoreOpen, setReadMoreOpen] = useState(false)
  const [sandboxCode, setSandboxCode] = useState(DEFAULT_SANDBOX_CODE)
  const [sandboxOutput, setSandboxOutput] = useState('')
  const [sandboxRunning, setSandboxRunning] = useState(false)
  const [sandboxError, setSandboxError] = useState<FriendlyPythonError | null>(null)
  const [sandboxErrorUiEpoch, setSandboxErrorUiEpoch] = useState(0)
  const [challengeErrorUiEpoch, setChallengeErrorUiEpoch] = useState<Record<string, number>>({})
  const [challengeAiHelp, setChallengeAiHelp] = useState<Record<string, PythonAiHelp | null>>({})
  const [challengeAiLoading, setChallengeAiLoading] = useState<Record<string, boolean>>({})
  const [challengeFixCopied, setChallengeFixCopied] = useState<Record<string, boolean>>({})
  const [installResetNotice, setInstallResetNotice] = useState<string | null>(null)

  const { bundles: languageBundles, loading: bundlesLoading, error: bundlesError } = useLanguageBundles(
    rootIndex,
    baseUrl,
    syncBundle,
    getBundle,
  )

  useEffect(() => {
    loadRootIndex(baseUrl)
      .then((data) => {
        setRootIndex(data)
        syncRootIndex(data)
      })
      .catch((e: unknown) => setRootError(e instanceof Error ? e.message : 'Failed to load catalog'))
  }, [baseUrl, syncRootIndex])

  useEffect(() => {
    if (!languageId || !rootIndex) return

    const lang = rootIndex.languages.find((l) => l.id === languageId)
    if (!lang) return
    if (loadedLanguageId === languageId) return

    let cancelled = false
    const useLocalContent = isEditMode && contentSource === 'local'
    const draftBundle = useLocalContent ? getBundle(languageId) : null
    if (useLocalContent && draftBundle) {
      void Promise.resolve().then(() => {
        if (cancelled) return
        setBundle(draftBundle)
        setLoadedLanguageId(languageId)
        setBundleError(null)
      })
      return () => {
        cancelled = true
      }
    }

    void loadLanguageBundle(baseUrl, lang.path, { fallbackBundle: draftBundle ?? getBundle(languageId) })
      .then((b) => {
        if (cancelled) return
        setLoadedLanguageId(languageId)
        setBundle(b)
        setBundleError(null)
        syncBundle(languageId, b)
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setLoadedLanguageId(null)
        setBundle(null)
        setBundleError(e instanceof Error ? e.message : 'Failed to load language')
      })

    return () => {
      cancelled = true
    }
  }, [
    languageId,
    rootIndex,
    baseUrl,
    syncBundle,
    loadedLanguageId,
    isEditMode,
    contentSource,
    getBundle,
    editSessionEpoch,
  ])

  useEffect(() => {
    return registerCatalogReload(async () => {
      setLoadedLanguageId(null)
      setBundleError(null)

      if (import.meta.env.DEV) {
        const root = await loadRootIndex(baseUrl, { cacheBust: true })
        const loaded: Record<string, LanguageBundle> = {}
        for (const lang of root.languages) {
          loaded[lang.id] = await loadLanguageBundle(baseUrl, lang.path, {
            cacheBust: true,
            fallbackBundle: getBundle(lang.id),
          })
        }
        applyCatalogFromDisk(root, loaded)
        setRootIndex(root)
        if (languageId && loaded[languageId]) {
          setBundle(loaded[languageId])
          setLoadedLanguageId(languageId)
          syncBundle(languageId, loaded[languageId])
        }
        return
      }

      if (editableRootIndex) setRootIndex(editableRootIndex)
      if (languageId) {
        const draft = getBundle(languageId)
        if (draft) {
          setBundle(draft)
          setLoadedLanguageId(languageId)
        }
      }
    })
  }, [
    registerCatalogReload,
    applyCatalogFromDisk,
    baseUrl,
    languageId,
    getBundle,
    syncBundle,
    editableRootIndex,
  ])

  useEffect(() => {
    if (!readMoreOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setReadMoreOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [readMoreOpen])

  const useLocalContent = isEditMode && contentSource === 'local'

  const displayRootIndex = useLocalContent ? (editableRootIndex ?? rootIndex) : rootIndex

  const displayBundle = useMemo(() => {
    if (!languageId) return bundle
    if (!useLocalContent) return languageBundles[languageId] ?? bundle
    return getBundle(languageId) ?? bundle
  }, [languageId, getBundle, bundle, useLocalContent, languageBundles])

  const bundleForView = displayBundle ?? bundle

  const displayHomeLead = useLocalContent ? homeLead : githubHomeLead

  const githubAboutContent = useMemo(
    () => mergeAboutContent(installInstructions(platform).split('\n').slice(1), null),
    [platform],
  )
  const displayAboutContent = useLocalContent ? aboutContent : githubAboutContent

  const selectedSection = useMemo(() => {
    if (!bundleForView || !sectionId) return null
    return bundleForView.sections.find((s) => s.sectionRef.id === sectionId) ?? null
  }, [bundleForView, sectionId])

  const selectedLevel = useMemo(() => {
    if (!selectedSection || !levelId) return null
    return selectedSection.file.levels.find((l) => l.id === levelId) ?? null
  }, [selectedSection, levelId])

  const resolveBundle = useCallback(
    (langId: string, fallback: LanguageBundle | undefined) => {
      if (!useLocalContent) return fallback ?? null
      return getBundle(langId) ?? fallback ?? null
    },
    [getBundle, useLocalContent],
  )

  const isLevelUnlocked = useCallback(
    (langId: string, levels: Level[], index: number): boolean => {
      void progressVersion
      if (isEditMode) return true
      if (index === 0) return true
      const prev = levels[index - 1]
      return loadProgress(langId, prev.id).testPassed
    },
    [isEditMode, progressVersion],
  )

  const resetLevelWorkState = useCallback((level: Level, langId: string | null) => {
    const drafts: Record<string, string> = {}
    const saved = langId ? loadProgress(langId, level.id).challengeAnswers ?? {} : {}
    for (const ch of level.challenges) {
      drafts[ch.id] = saved[ch.id] ?? ch.starterCode ?? ''
    }
    setChallengeDrafts(drafts)
    setChallengeStatus({})
    setChallengeTestResults({})
    setChallengeRuntimeError({})
    setChallengeErrorExpanded({})
    setChallengeAiHelp({})
    setChallengeAiLoading({})
    setChallengeFixCopied({})
    setTestShort({})
    setTestMcq({})
    setTestResult(null)
    setSandboxCode(DEFAULT_SANDBOX_CODE)
    setSandboxOutput('')
    setSandboxRunning(false)
    setSandboxError(null)
    setSandboxErrorUiEpoch(0)
    setChallengeErrorUiEpoch({})
  }, [])

  useEffect(() => {
    if (levelId === prevLevelIdRef.current) return
    prevLevelIdRef.current = levelId
    if (!levelId || !selectedLevel) return
    void Promise.resolve().then(() => resetLevelWorkState(selectedLevel, languageId))
  }, [levelId, selectedLevel, languageId, resetLevelWorkState])

  const openLanguage = useCallback(
    async (path: string, id: string): Promise<LanguageBundle | null> => {
      goToLanguage(id)
      if (loadedLanguageId === id && bundle) return bundle
      try {
        const b = await loadLanguageBundle(baseUrl, path, {
          fallbackBundle: getBundle(id),
        })
        setLoadedLanguageId(id)
        setBundle(b)
        setBundleError(null)
        syncBundle(id, b)
        return b
      } catch (e: unknown) {
        setLoadedLanguageId(null)
        setBundle(null)
        setBundleError(e instanceof Error ? e.message : 'Failed to load language')
        return null
      }
    },
    [baseUrl, syncBundle, goToLanguage, loadedLanguageId, bundle, getBundle],
  )

  const openLevelByPath = useCallback(
    async (opts: ContinueTarget) => {
      const b = await openLanguage(opts.languagePath, opts.languageId)
      if (!b) return
      const section = b.sections.find((s) => s.sectionRef.id === opts.sectionId)
      if (!section) return
      const levelIndex = section.file.levels.findIndex((l) => l.id === opts.levelId)
      if (levelIndex < 0) return
      if (!isLevelUnlocked(opts.languageId, section.file.levels, levelIndex)) return
      const level = section.file.levels[levelIndex]
      goToLevel(opts.languageId, opts.sectionId, level.id, 'intro')
      resetLevelWorkState(level, opts.languageId)
      localStorage.setItem(LAST_LEVEL_STORAGE_KEY, JSON.stringify(opts))
    },
    [isLevelUnlocked, openLanguage, resetLevelWorkState, goToLevel],
  )

  const back = () => {
    setTestResult(null)
    backFromLearn()
  }

  const challengeFeedbackSetters = useMemo(
    () => ({
      setTestResults: setChallengeTestResults,
      setRuntimeError: setChallengeRuntimeError,
      setErrorExpanded: setChallengeErrorExpanded,
      setAiHelp: setChallengeAiHelp,
      setAiLoading: setChallengeAiLoading,
      setFixCopied: setChallengeFixCopied,
    }),
    [],
  )

  const checkChallenge = async (ch: Challenge) => {
    if (!languageId || !selectedLevel || !selectedSection) return
    setChallengeErrorUiEpoch((prev) => ({ ...prev, [ch.id]: (prev[ch.id] ?? 0) + 1 }))
    const answer = challengeDrafts[ch.id] ?? ''
    const before = loadProgress(languageId, selectedLevel.id)
    saveProgress(languageId, selectedLevel.id, {
      ...before,
      challengeAnswers: { ...(before.challengeAnswers ?? {}), [ch.id]: answer },
    })

    let ok: boolean
    if (ch.validation.mode === 'python_tests') {
      const run = await runPythonChallengeTests(answer, ch.validation.setupCode, ch.validation.tests ?? [])
      setChallengeTestResults((prev) => ({ ...prev, [ch.id]: run.tests }))
      setChallengeRuntimeError((prev) => ({ ...prev, [ch.id]: run.error }))
      clearChallengeAiFeedback(challengeFeedbackSetters, ch.id)
      ok = run.passed
    } else {
      ok = validateAgainst(answer, ch.validation)
      clearChallengeFeedback(challengeFeedbackSetters, ch.id)
    }

    if (!ok) {
      setChallengeStatus((prev) => ({ ...prev, [ch.id]: 'failed' }))
      const prev = loadProgress(languageId, selectedLevel.id)
      if (prev.challengesCompleted.includes(ch.id)) {
        saveProgress(languageId, selectedLevel.id, {
          ...prev,
          challengesCompleted: prev.challengesCompleted.filter((id) => id !== ch.id),
        })
      }
      return
    }

    setChallengeStatus((prev) => ({ ...prev, [ch.id]: 'passed' }))
    const prev = loadProgress(languageId, selectedLevel.id)
    saveProgress(languageId, selectedLevel.id, {
      ...prev,
      challengesCompleted: [...new Set([...prev.challengesCompleted, ch.id])],
      challengeAnswers: { ...(prev.challengeAnswers ?? {}), [ch.id]: answer },
    })
    setStreakCount(recordDailyActivity())
  }

  const submitTest = () => {
    if (!languageId || !selectedLevel) return
    const questions = selectedLevel.test.questions
    const passing = selectedLevel.test.passingScorePercent ?? PASS_DEFAULT
    let correct = 0
    for (const q of questions) {
      if (gradeQuestion(q, testShort[q.id], testMcq[q.id])) correct += 1
    }
    const total = questions.length
    const pct = total === 0 ? 100 : (correct / total) * 100
    const passed = pct >= passing
    setTestResult({ correct, total, passed })
    const prev = loadProgress(languageId, selectedLevel.id)
    saveProgress(languageId, selectedLevel.id, { ...prev, testPassed: prev.testPassed || passed })
    setStreakCount(recordDailyActivity())
  }

  const runSandbox = async () => {
    setSandboxRunning(true)
    setSandboxError(null)
    setSandboxOutput('Running...')
    const result = await runPythonCode(sandboxCode)
    setSandboxOutput(result.output.trim() ? result.output : '[no output]')
    setSandboxError(result.error)
    setSandboxErrorUiEpoch((n) => n + 1)
    setSandboxRunning(false)
  }

  const requestChallengeAiHelp = async (
    challengeId: string,
    userCode: string,
    error: FriendlyPythonError,
  ) => {
    if (challengeAiLoading[challengeId]) return
    setChallengeAiLoading((prev) => ({ ...prev, [challengeId]: true }))
    setChallengeFixCopied((prev) => ({ ...prev, [challengeId]: false }))
    try {
      const help = await getFreePythonAiHelp({ userCode, error, context: 'challenge' })
      setChallengeAiHelp((prev) => ({ ...prev, [challengeId]: help }))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'AI Help failed. Please try again.'
      setChallengeAiHelp((prev) => ({
        ...prev,
        [challengeId]: { explanation: message, fix: '', nextStep: '', text: message },
      }))
    } finally {
      setChallengeAiLoading((prev) => ({ ...prev, [challengeId]: false }))
    }
  }

  const handleRemoveLanguage = (langId: string) => {
    removeLanguage(langId)
    if (languageId === langId) {
      setBundle(null)
      setLoadedLanguageId(null)
      backFromLearn()
    }
  }

  const handleRemoveSection = (secId: string) => {
    if (!languageId) return
    removeSection(languageId, secId)
    if (sectionId === secId) {
      goToLanguage(languageId)
    }
  }

  const handleRemoveLevel = (secId: string, lvlId: string) => {
    if (!languageId) return
    removeLevel(languageId, secId, lvlId)
    if (levelId === lvlId) {
      goToSection(languageId, secId)
    }
  }

  const totalXp = useMemo(() => {
    void progressVersion
    if (!displayRootIndex) return 0
    let xp = 0
    for (const lang of displayRootIndex.languages) {
      const b = resolveBundle(lang.id, languageBundles[lang.id]) ?? languageBundles[lang.id]
      if (!b) continue
      for (const { file } of b.sections) {
        for (const lvl of file.levels) xp += computeLevelXp(lang.id, lvl)
      }
    }
    return xp
  }, [languageBundles, displayRootIndex, resolveBundle, progressVersion])

  const continueTarget = useMemo((): ContinueTarget | null => {
    void progressVersion
    if (!displayRootIndex) return null
    try {
      const raw = localStorage.getItem(LAST_LEVEL_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ContinueTarget>
        if (parsed.languageId && parsed.languagePath && parsed.sectionId && parsed.levelId) {
          return parsed as ContinueTarget
        }
      }
    } catch {
      // ignore malformed local storage
    }
    for (const lang of displayRootIndex.languages) {
      const b = resolveBundle(lang.id, languageBundles[lang.id]) ?? languageBundles[lang.id]
      if (!b) continue
      for (const section of b.sections) {
        for (let i = 0; i < section.file.levels.length; i += 1) {
          const lvl = section.file.levels[i]
          if (!isLevelUnlocked(lang.id, section.file.levels, i)) continue
          if (!loadProgress(lang.id, lvl.id).testPassed) {
            return {
              languageId: lang.id,
              languagePath: lang.path,
              sectionId: section.sectionRef.id,
              levelId: lvl.id,
            }
          }
        }
      }
    }
    return null
  }, [displayRootIndex, languageBundles, resolveBundle, isLevelUnlocked, progressVersion])

  const installSteps = displayAboutContent.installSteps.length
    ? displayAboutContent.installSteps
    : installInstructions(platform).split('\n').slice(1)
  const installIntro =
    displayAboutContent.installIntro || installInstructions(platform).split('\n')[0]

  useEffect(() => {
    initAboutContent(installInstructions(platform).split('\n').slice(1))
  }, [platform, initAboutContent])

  const renderLearn = () => {
    if (rootError) return <div className="cq-panel cq-error">{rootError}</div>
    if (!displayRootIndex) return <div className="cq-panel cq-muted">Loading catalog…</div>

    if (learnView === 'languages') {
      return (
        <LearnHome
          displayRootIndex={displayRootIndex}
          continueTarget={continueTarget}
          xpLevel={Math.floor(totalXp / 100)}
          xpCurrentLevel={totalXp % 100}
          totalXp={totalXp}
          streakCount={streakCount}
          homeLead={displayHomeLead}
          isEditMode={isEditMode}
          contentSource={contentSource}
          onContentSourceChange={setContentSource}
          onImportFromGitHub={() => {
            void (async () => {
              const ok = await requestConfirm(
                'Replace local drafts with content from public/content/? Unsaved local changes will be lost.',
              )
              if (!ok) return
              await importFromGitHub(baseUrl)
              const data = await loadRootIndex(baseUrl)
              setRootIndex(data)
              setBundle(null)
              setLoadedLanguageId(null)
            })()
          }}
          onContinue={() => continueTarget && void openLevelByPath(continueTarget)}
          onOpenLanguage={(path, id) => void openLanguage(path, id)}
          onUpdateHomeLead={updateHomeLead}
          onUpdateLanguage={updateLanguage}
          onMoveLanguage={moveLanguage}
          onRemoveLanguage={handleRemoveLanguage}
          onAddLanguage={addLanguage}
        />
      )
    }

    if (bundleError || !bundleForView) {
      return <div className="cq-panel cq-error">{bundleError ?? 'Loading…'}</div>
    }

    if (learnView === 'sections') {
      return (
        <LearnSections
          bundle={bundleForView}
          languageId={languageId}
          onSelectSection={(id) => languageId && goToSection(languageId, id)}
          onUpdateLanguageTitle={(title) => languageId && updateLanguageTitle(languageId, title)}
          onUpdateSectionTitle={(id, title, options) =>
            languageId && updateSectionTitle(languageId, id, title, options)
          }
          onMoveSection={(id, dir) => languageId && moveSection(languageId, id, dir)}
          onRemoveSection={handleRemoveSection}
          onAddSection={() => languageId && addSection(languageId)}
        />
      )
    }

    if (learnView === 'levels' && selectedSection && languageId) {
      const secId = selectedSection.sectionRef.id
      return (
        <LearnLevels
          selectedSection={selectedSection}
          languageId={languageId}
          isEditMode={isEditMode}
          isLevelUnlocked={(levels, index) => isLevelUnlocked(languageId, levels, index)}
          onOpenLevel={(lvl) => {
            if (!languageId || !secId) return
            goToLevel(languageId, secId, lvl.id, 'intro')
            localStorage.setItem(
              LAST_LEVEL_STORAGE_KEY,
              JSON.stringify({
                languageId,
                languagePath: displayRootIndex?.languages.find((l) => l.id === languageId)?.path ?? '',
                sectionId: secId,
                levelId: lvl.id,
              }),
            )
          }}
          onUpdateSectionTitle={(title) => updateSectionTitle(languageId, secId, title)}
          onUpdateLevelTitle={(lvlId, title) => updateLevelTitle(languageId, secId, lvlId, title)}
          onMoveLevel={(lvlId, dir) => moveLevel(languageId, secId, lvlId, dir)}
          onRemoveLevel={(lvlId) => handleRemoveLevel(secId, lvlId)}
          onAddLevel={() => addLevel(languageId, secId)}
        />
      )
    }

    if (learnView === 'level' && selectedSection && selectedLevel && languageId) {
      const secId = selectedSection.sectionRef.id
      const prog = loadProgress(languageId, selectedLevel.id)

      return (
        <LearnLevel
          level={selectedLevel}
          languageId={languageId}
          levelStep={levelStep}
          prog={prog}
          onLevelStepChange={goToLevelStep}
          onUpdateLevelTitle={(title) => updateLevelTitle(languageId, secId, selectedLevel.id, title)}
          onUpdateIntro={(patch) => updateLevelIntro(languageId, secId, selectedLevel.id, patch)}
          onReadMoreOpen={() => setReadMoreOpen(true)}
          sandboxCode={sandboxCode}
          sandboxOutput={sandboxOutput}
          sandboxRunning={sandboxRunning}
          sandboxError={sandboxError}
          sandboxErrorUiEpoch={sandboxErrorUiEpoch}
          onSandboxCodeChange={setSandboxCode}
          onSandboxRun={() => void runSandbox()}
          onSandboxReset={() => {
            setSandboxCode(DEFAULT_SANDBOX_CODE)
            setSandboxOutput('')
            setSandboxError(null)
          }}
          onSandboxErrorClear={() => setSandboxError(null)}
          challengeDrafts={challengeDrafts}
          challengeStatus={challengeStatus}
          challengeTestResults={challengeTestResults}
          challengeRuntimeError={challengeRuntimeError}
          challengeErrorExpanded={challengeErrorExpanded}
          challengeErrorUiEpoch={challengeErrorUiEpoch}
          challengeAiHelp={challengeAiHelp}
          challengeAiLoading={challengeAiLoading}
          challengeFixCopied={challengeFixCopied}
          onChallengeDraftChange={(chId, value) => {
            setChallengeDrafts((prev) => ({ ...prev, [chId]: value }))
            const p = loadProgress(languageId, selectedLevel.id)
            saveProgress(languageId, selectedLevel.id, {
              ...p,
              challengeAnswers: { ...(p.challengeAnswers ?? {}), [chId]: value },
            })
          }}
          onCheckChallenge={(ch) => void checkChallenge(ch)}
          onUpdateChallenge={(chId, patch) =>
            updateChallenge(languageId, secId, selectedLevel.id, chId, patch)
          }
          onMoveChallenge={(chId, dir) => moveChallenge(languageId, secId, selectedLevel.id, chId, dir)}
          onRemoveChallenge={(chId) => removeChallenge(languageId, secId, selectedLevel.id, chId)}
          onAddChallenge={() => addChallenge(languageId, secId, selectedLevel.id)}
          onToggleChallengeErrorExpanded={(chId) =>
            setChallengeErrorExpanded((prev) => ({ ...prev, [chId]: !(prev[chId] ?? false) }))
          }
          onRequestChallengeAiHelp={requestChallengeAiHelp}
          onChallengeFixCopied={(chId, copied) =>
            setChallengeFixCopied((prev) => ({ ...prev, [chId]: copied }))
          }
          testShort={testShort}
          testMcq={testMcq}
          testResult={testResult}
          onTestShortChange={(qId, value) => setTestShort((prev) => ({ ...prev, [qId]: value }))}
          onTestMcqChange={(qId, choiceId) => setTestMcq((prev) => ({ ...prev, [qId]: choiceId }))}
          onUpdatePassingScore={(score) =>
            updateTestPassingScore(languageId, secId, selectedLevel.id, score)
          }
          onUpdateQuestion={(qId, question) =>
            updateTestQuestion(languageId, secId, selectedLevel.id, qId, question)
          }
          onMoveQuestion={(qId, dir) => moveTestQuestion(languageId, secId, selectedLevel.id, qId, dir)}
          onRemoveQuestion={(qId) => removeTestQuestion(languageId, secId, selectedLevel.id, qId)}
          onAddQuestion={(type) => addTestQuestion(languageId, secId, selectedLevel.id, type)}
          onSubmitTest={submitTest}
        />
      )
    }

    return null
  }

  const showBack = tab === 'learn' && learnView !== 'languages'
  const shellClassName =
    (platform === 'android'
      ? 'cq-shell cq-shell--android'
      : platform === 'ios'
        ? 'cq-shell cq-shell--ios'
        : 'cq-shell') + (isEditMode ? ' cq-shell--edit-mode' : '')

  const navItems: BottomNavItem[] = [
    { id: 'learn', label: 'Learn', icon: BookOpen },
    { id: 'progress', label: 'Progress', icon: ListTodo },
    { id: 'about', label: 'About', icon: Info },
  ]

  return (
    <div className={shellClassName}>
      <header className="cq-header">
        {showBack ? (
          <button type="button" className="cq-back" onClick={back} aria-label="Back">
            <ChevronLeft size={22} />
          </button>
        ) : (
          <span className="cq-header-spacer" aria-hidden />
        )}
        <div className="cq-brand">CodeQuest</div>
        <EditorHeaderButton />
      </header>

      <EditorToolbar languageId={languageId} sectionId={sectionId} />

      <main className="cq-main">
        {tab === 'learn' && renderLearn()}
        {tab === 'progress' &&
          (bundlesLoading ? (
            <div className="cq-panel cq-muted">Loading progress…</div>
          ) : bundlesError ? (
            <div className="cq-panel cq-error">{bundlesError}</div>
          ) : !displayRootIndex ? (
            <div className="cq-panel cq-muted">Open the Learn tab once to load catalog.</div>
          ) : (
            <ProgressTab
              displayRootIndex={displayRootIndex}
              bundles={languageBundles}
              resolveBundle={resolveBundle}
              onUpdateLevelTitle={updateLevelTitle}
            />
          ))}
        {tab === 'about' && (
          <AboutTab
            aboutLead={displayAboutContent.lead}
            installIntro={installIntro}
            installSteps={installSteps}
            installResetNotice={installResetNotice}
            onUpdateLead={updateAboutLead}
            onUpdateInstallIntro={updateAboutInstallIntro}
            onUpdateInstallStep={updateAboutInstallStep}
            onMoveInstallStep={moveAboutInstallStep}
            onRemoveInstallStep={removeAboutInstallStep}
            onAddInstallStep={addAboutInstallStep}
            onResetInstallPrompt={() => {
              resetInstallBannerPreference()
              setInstallResetNotice('Install prompt banner reset for this device.')
            }}
          />
        )}
      </main>

      <BottomNav items={navItems} activeId={tab} onSelect={(id) => goToTab(id as TabId)} />

      {readMoreOpen && selectedLevel?.intro.readMore && (
        <div
          className="cq-modal-backdrop"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setReadMoreOpen(false)
          }}
        >
          <div className="cq-modal" role="dialog" aria-modal="true" aria-label={`${selectedLevel.title} read more`}>
            <div className="cq-modal-header">
              <div className="cq-modal-title">Read more</div>
              <button
                type="button"
                className="cq-icon-btn"
                aria-label="Close article"
                onClick={() => setReadMoreOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="cq-modal-credit">
              Source: {selectedLevel.intro.readMore.source}
              {' · '}
              <a href={selectedLevel.intro.readMore.url} target="_blank" rel="noreferrer">
                Open original <ExternalLink size={14} />
              </a>
            </div>
            <iframe
              className="cq-modal-frame"
              title={`${selectedLevel.title} reference`}
              src={selectedLevel.intro.readMore.url}
            />
            <div className="cq-modal-actions">
              <button type="button" className="cq-btn" onClick={() => setReadMoreOpen(false)}>
                Close and return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
