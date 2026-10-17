import '../../App.css'

import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BookOpen, ChevronLeft, Info, ListTodo, Share2 } from 'lucide-react'
import type { LanguageBundle, Level, RootIndex } from './types'
import { loadLanguageBundle, loadRootIndex } from './loadCurriculum'
import { loadProgress, notifyProgressChanged } from './progressStorage'
import { preloadWebR } from './rSandbox'
import { ReadMoreModal } from './components/ReadMoreModal'
import { BottomNav, type BottomNavItem } from '../../components/BottomNav/BottomNav'
import { shareApp, type ShareVariant } from '../../lib/shareApp'
import { ShareSheet } from '../../components/ShareSheet'
import { detectPlatform, installInstructions } from '../../platform'
import { resetInstallBannerPreference } from '../../components/installBannerStorage'
import {
  EditorHeaderButton,
  useEditorAbout,
  useEditorCatalog,
  useEditorDraft,
  useEditorGitHub,
  useEditorMode,
  useEditorConfirm,
} from '../editor'
import { mergeAboutContent } from '../editor/aboutContent'
import { LAST_LEVEL_STORAGE_KEY, type TabId } from './constants'
import { useLearnRoute } from './hooks/useLearnRoute'
import { progressPath } from './learnPaths'
import { clearSelectedLanguage, saveSelectedLanguage } from './selectedLanguageStorage'
import {
  computeLevelXp,
  isSectionUnlocked as checkSectionUnlocked,
  currentStreak,
  loadStreakState,
  recordDailyActivity,
} from './helpers'
import { useChallenges } from './hooks/useChallenges'
import { useLanguageBundles } from './hooks/useLanguageBundles'
import { useLevelTest } from './hooks/useLevelTest'
import { useSandbox } from './hooks/useSandbox'
import { useProgressVersion } from './hooks/useProgressVersion'
import { LearnHome, type ContinueTarget } from './views/LearnHome'
import { LearnSections } from './views/LearnSections'
import { LearnLevels } from './views/LearnLevels'
import { LearnLevel } from './views/LearnLevel'
import { ProgressTab } from './views/ProgressTab'
import { AboutTab } from './views/AboutTab'

/** Editing toolbar, downloaded only when someone switches to edit mode. */
const EditorToolbar = lazy(() =>
  import('../editor/EditModeToolbar').then((m) => ({ default: m.EditorToolbar })),
)

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
  } = useEditorAbout()
  const { importFromGitHub } = useEditorGitHub()
  const { requestConfirm } = useEditorConfirm()

  const {
    tab,
    learnView,
    languageId,
    activeLanguageId,
    sectionId,
    levelId,
    levelStep,
    navigate,
    goToTab,
    goToLanguage,
    goToSection,
    goToLevel,
    goToLevelStep,
    backFromLearn,
  } = useLearnRoute()

  const [rootIndex, setRootIndex] = useState<RootIndex | null>(null)
  const [rootError, setRootError] = useState<string | null>(null)

  const [bundle, setBundle] = useState<LanguageBundle | null>(null)
  const [bundleError, setBundleError] = useState<string | null>(null)
  const [loadedLanguageId, setLoadedLanguageId] = useState<string | null>(null)

  const prevLevelIdRef = useRef<string | null>(null)

  const [readMoreOpen, setReadMoreOpen] = useState(false)
  const [installResetNotice, setInstallResetNotice] = useState<string | null>(null)
  const [shareNotice, setShareNotice] = useState<string | null>(null)
  const [shareSheetOpen, setShareSheetOpen] = useState(false)

  const handleShareSelect = useCallback(async (variant: ShareVariant) => {
    setShareSheetOpen(false)
    const result = await shareApp(variant)
    if (result === 'copied') {
      setShareNotice('Install link copied to clipboard.')
    } else if (result === 'unsupported') {
      setShareNotice('Sharing is not available in this browser.')
    }
  }, [])

  useEffect(() => {
    if (!shareNotice) return
    const timer = window.setTimeout(() => setShareNotice(null), 3000)
    return () => window.clearTimeout(timer)
  }, [shareNotice])

  const { bundles: languageBundles, loading: bundlesLoading, error: bundlesError } = useLanguageBundles(
    rootIndex,
    baseUrl,
    syncBundle,
    getBundle,
    activeLanguageId,
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
    if (languageId) saveSelectedLanguage(languageId)
  }, [languageId])

  useEffect(() => {
    if (tab === 'progress' && activeLanguageId && !languageId) {
      navigate(progressPath(activeLanguageId), { replace: true })
    }
  }, [tab, activeLanguageId, languageId, navigate])

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

  const nextLevel = useMemo(() => {
    if (!selectedSection || !selectedLevel) return null
    const levels = selectedSection.file.levels
    const index = levels.findIndex((l) => l.id === selectedLevel.id)
    if (index < 0 || index >= levels.length - 1) return null
    return levels[index + 1]
  }, [selectedSection, selectedLevel])

  // Read from storage on every progress change, so a restored backup shows its streak too.
  const streakCount = useMemo(() => {
    void progressVersion
    return currentStreak(loadStreakState())
  }, [progressVersion])
  const recordActivity = useCallback(() => {
    recordDailyActivity()
    notifyProgressChanged()
  }, [])
  const sandbox = useSandbox(languageId)
  const challenges = useChallenges(languageId, selectedLevel, recordActivity)
  const levelTest = useLevelTest(languageId, selectedLevel, recordActivity)
  const { resetForLevel: resetSandboxForLevel } = sandbox
  const { resetForLevel: resetChallengesForLevel } = challenges
  const { resetForLevel: resetTestForLevel } = levelTest

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

  const isSectionUnlockedFor = useCallback(
    (langId: string, sectionIndex: number): boolean => {
      void progressVersion
      if (isEditMode || !bundleForView) return true
      return checkSectionUnlocked(langId, bundleForView.sections, sectionIndex)
    },
    [isEditMode, bundleForView, progressVersion],
  )

  useEffect(() => {
    if (isEditMode || !languageId || !sectionId || !bundleForView) return
    const sectionIndex = bundleForView.index.sections.findIndex((s) => s.id === sectionId)
    if (sectionIndex >= 0 && !isSectionUnlockedFor(languageId, sectionIndex)) {
      goToLanguage(languageId)
    }
  }, [isEditMode, languageId, sectionId, bundleForView, isSectionUnlockedFor, goToLanguage])

  // Same for a locked level opened directly by URL.
  useEffect(() => {
    if (isEditMode || learnView !== 'level' || !languageId || !selectedSection || !levelId) return
    const levels = selectedSection.file.levels
    const index = levels.findIndex((l) => l.id === levelId)
    if (index > 0 && !isLevelUnlocked(languageId, levels, index)) {
      goToSection(languageId, selectedSection.sectionRef.id)
    }
  }, [isEditMode, learnView, languageId, selectedSection, levelId, isLevelUnlocked, goToSection])

  const resetLevelWorkState = useCallback(
    (level: Level, langId: string | null) => {
      resetChallengesForLevel(level, langId)
      resetTestForLevel()
      resetSandboxForLevel(level, langId)
    },
    [resetChallengesForLevel, resetTestForLevel, resetSandboxForLevel],
  )

  useEffect(() => {
    if (levelId === prevLevelIdRef.current) return
    prevLevelIdRef.current = levelId
    if (!levelId || !selectedLevel) return
    void Promise.resolve().then(() => resetLevelWorkState(selectedLevel, languageId))
  }, [levelId, selectedLevel, languageId, resetLevelWorkState])

  const openLanguage = useCallback(
    async (path: string, id: string): Promise<LanguageBundle | null> => {
      goToLanguage(id)
      if (id === 'r') preloadWebR()
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
    levelTest.dismissResult()
    backFromLearn()
  }

  const goToNextLevel = useCallback(() => {
    if (!languageId || !sectionId || !nextLevel) return
    goToLevel(languageId, sectionId, nextLevel.id, 'intro')
    localStorage.setItem(
      LAST_LEVEL_STORAGE_KEY,
      JSON.stringify({
        languageId,
        languagePath: displayRootIndex?.languages.find((l) => l.id === languageId)?.path ?? '',
        sectionId,
        levelId: nextLevel.id,
      }),
    )
  }, [languageId, sectionId, nextLevel, goToLevel, displayRootIndex])

  const handleRemoveLanguage = (langId: string) => {
    removeLanguage(langId)
    if (activeLanguageId === langId) clearSelectedLanguage()
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

  const catalogLanguages = useMemo(() => {
    if (!displayRootIndex) return []
    if (!activeLanguageId) return displayRootIndex.languages
    return displayRootIndex.languages.filter((lang) => lang.id === activeLanguageId)
  }, [displayRootIndex, activeLanguageId])

  const totalXp = useMemo(() => {
    void progressVersion
    let xp = 0
    for (const lang of catalogLanguages) {
      const b = resolveBundle(lang.id, languageBundles[lang.id]) ?? languageBundles[lang.id]
      if (!b) continue
      for (const { file } of b.sections) {
        for (const lvl of file.levels) xp += computeLevelXp(lang.id, lvl)
      }
    }
    return xp
  }, [catalogLanguages, languageBundles, resolveBundle, progressVersion])

  const continueTarget = useMemo((): ContinueTarget | null => {
    void progressVersion
    if (!displayRootIndex) return null
    try {
      const raw = localStorage.getItem(LAST_LEVEL_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ContinueTarget>
        if (parsed.languageId && parsed.languagePath && parsed.sectionId && parsed.levelId) {
          if (!activeLanguageId || parsed.languageId === activeLanguageId) {
            return parsed as ContinueTarget
          }
        }
      }
    } catch {
      // ignore malformed local storage
    }
    for (const lang of catalogLanguages) {
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
  }, [displayRootIndex, catalogLanguages, languageBundles, resolveBundle, isLevelUnlocked, progressVersion, activeLanguageId])

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
          isEditMode={isEditMode}
          isSectionUnlocked={(index) => languageId ? isSectionUnlockedFor(languageId, index) : true}
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
      void progressVersion
      const prog = loadProgress(languageId, selectedLevel.id)
      const showNext =
        nextLevel !== null &&
        (levelTest.result?.passed === true ||
          (prog.testPassed && !levelTest.sessionReset && levelTest.result === null))

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
          sandboxCode={sandbox.code}
          sandboxOutput={sandbox.output}
          sandboxRunning={sandbox.running}
          sandboxError={sandbox.error}
          sandboxErrorUiEpoch={sandbox.errorUiEpoch}
          onSandboxCodeChange={sandbox.setCode}
          onSandboxRun={(stdin) => void sandbox.run(stdin)}
          onSandboxStop={sandbox.stop}
          onSandboxReset={() => sandbox.reset(selectedLevel)}
          onSandboxErrorClear={sandbox.clearError}
          challengeDrafts={challenges.drafts}
          challengeStatus={challenges.status}
          challengeTestResults={challenges.testResults}
          challengeRuntimeError={challenges.runtimeError}
          challengeErrorExpanded={challenges.errorExpanded}
          challengeErrorUiEpoch={challenges.errorUiEpoch}
          onChallengeDraftChange={challenges.changeDraft}
          onCheckChallenge={(ch) => void challenges.check(ch)}
          onRevealAnswer={challenges.revealAnswer}
          onUpdateChallenge={(chId, patch) =>
            updateChallenge(languageId, secId, selectedLevel.id, chId, patch)
          }
          onMoveChallenge={(chId, dir) => moveChallenge(languageId, secId, selectedLevel.id, chId, dir)}
          onRemoveChallenge={(chId) => removeChallenge(languageId, secId, selectedLevel.id, chId)}
          onAddChallenge={() => addChallenge(languageId, secId, selectedLevel.id)}
          onToggleChallengeErrorExpanded={challenges.toggleErrorExpanded}
          testShort={levelTest.short}
          testMcq={levelTest.mcq}
          testResult={levelTest.result}
          onTestShortChange={levelTest.changeShort}
          onTestMcqChange={levelTest.changeMcq}
          onUpdatePassingScore={(score) =>
            updateTestPassingScore(languageId, secId, selectedLevel.id, score)
          }
          onUpdateQuestion={(qId, question) =>
            updateTestQuestion(languageId, secId, selectedLevel.id, qId, question)
          }
          onMoveQuestion={(qId, dir) => moveTestQuestion(languageId, secId, selectedLevel.id, qId, dir)}
          onRemoveQuestion={(qId) => removeTestQuestion(languageId, secId, selectedLevel.id, qId)}
          onAddQuestion={(type) => addTestQuestion(languageId, secId, selectedLevel.id, type)}
          onSubmitTest={levelTest.submit}
          onRetakeTest={levelTest.retake}
          showNext={showNext}
          nextLevelTitle={nextLevel?.title ?? null}
          onGoToNextLevel={goToNextLevel}
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
    { id: 'share', label: 'Share', icon: Share2, onAction: () => setShareSheetOpen(true) },
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

      {isEditMode ? (
        <Suspense fallback={null}>
          <EditorToolbar languageId={languageId} sectionId={sectionId} />
        </Suspense>
      ) : null}

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
              languageId={activeLanguageId}
              onUpdateSectionTitle={updateSectionTitle}
              onUpdateLevelTitle={updateLevelTitle}
            />
          ))}
        {tab === 'about' && (
          <AboutTab
            aboutLead={displayAboutContent.lead}
            installResetNotice={installResetNotice}
            onUpdateLead={updateAboutLead}
            onResetInstallPrompt={() => {
              resetInstallBannerPreference()
              setInstallResetNotice('Install prompt banner reset for this device.')
            }}
            baseUrl={baseUrl}
            courses={displayRootIndex?.languages ?? []}
            activeCourseId={activeLanguageId ?? null}
          />
        )}
      </main>

      {shareNotice ? (
        <p className="cq-share-notice" role="status" aria-live="polite">
          {shareNotice}
        </p>
      ) : null}

      <BottomNav items={navItems} activeId={tab} onSelect={(id) => goToTab(id as TabId)} />

      {shareSheetOpen ? (
        <ShareSheet onSelect={(variant) => void handleShareSelect(variant)} onClose={() => setShareSheetOpen(false)} />
      ) : null}

      {readMoreOpen && selectedLevel?.intro.readMore && (
        <ReadMoreModal
          levelTitle={selectedLevel.title}
          url={selectedLevel.intro.readMore.url}
          source={selectedLevel.intro.readMore.source}
          onClose={() => setReadMoreOpen(false)}
        />
      )}
    </div>
  )
}
