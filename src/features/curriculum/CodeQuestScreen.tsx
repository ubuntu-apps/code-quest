// The app's styles, split by feature. The order matters: later files can override earlier
// ones. Colours come from the theme variables in index.css.
import '../../styles/base.css'
import '../../styles/chrome.css'
import '../../styles/catalog.css'
import '../../styles/lesson.css'
import '../../styles/code-editor.css'
import '../../styles/challenges.css'
import '../../styles/sandbox.css'
import '../../styles/quiz.css'
import '../../styles/about.css'
import '../../styles/editor-mode.css'
import '../../styles/support.css'
import '../../styles/badges.css'

import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BookOpen, Info, Share2 } from 'lucide-react'
import type { Level } from './types'
import { useAdminMode } from './adminMode'
import { loadRootIndex } from './loadCurriculum'
import { loadProgress, notifyProgressChanged } from './progressStorage'
import { hasTestedOut } from './testOut'
import { warmUpPython } from './pythonSandbox'
import { preloadCodeEditor } from './codeEditor'
import { ReadMoreModal } from './components/ReadMoreModal'
import { LoadErrorPanel } from './components/LoadErrorPanel'
import { Breadcrumbs } from './components/Breadcrumbs'
import { AppHeader } from './components/AppHeader'
import { Notices } from './components/Notices'
import { BottomNav, type BottomNavItem } from '../../components/BottomNav/BottomNav'
import { ShareSheet } from '../../components/ShareSheet'
import { detectPlatform, installInstructions } from '../../platform'
import { resetInstallBannerPreference } from '../../components/installBannerStorage'
import {
  useEditorAbout,
  useEditorCatalog,
  useEditorDraft,
  useEditorGitHub,
  useEditorMode,
  useEditorConfirm,
} from '../editor'
import { mergeAboutContent } from '../editor/aboutContent'
import type { TabId } from './constants'
import { useLearnRoute } from './hooks/useLearnRoute'
import { useTabMemory } from './hooks/useTabMemory'
import { learnBreadcrumbs } from './learnPaths'
import { rememberLastLevel } from './lastLevel'
import { clearSelectedLanguage, saveSelectedLanguage } from './selectedLanguageStorage'
import { recordDailyActivity, sectionStartHint } from './helpers'
import { useChallenges } from './hooks/useChallenges'
import { useCourseProgress } from './hooks/useCourseProgress'
import { useCurriculum } from './hooks/useCurriculum'
import { useLevelTest } from './hooks/useLevelTest'
import { useSandbox } from './hooks/useSandbox'
import { useProgressVersion } from './hooks/useProgressVersion'
import { useBadgeToast, useShareSheet, useXpToast } from './hooks/useNotices'
import { useBadges } from '../badges/useBadges'
import { BadgesPanel } from '../badges/BadgesPanel'
import type { EarnedBadge } from '../badges/badges'
import { LearnHome, type ContinueTarget } from './views/LearnHome'
import { LearnSections } from './views/LearnSections'
import { LearnLevels } from './views/LearnLevels'
import { LearnLevel } from './views/LearnLevel'
import { AboutTab } from './views/AboutTab'

/** Editing toolbar, downloaded only when someone switches to edit mode. */
const EditorToolbar = lazy(() =>
  import('../editor/EditModeToolbar').then((m) => ({ default: m.EditorToolbar })),
)

/**
 * The whole app: header, the Learn and About pages, and the bottom bar. Loading content
 * and working out progress live in hooks (useCurriculum, useCourseProgress); each page
 * is a view in ./views.
 */
export function CodeQuestScreen() {
  const baseUrl = import.meta.env.BASE_URL
  const [platform] = useState(() => detectPlatform())
  const progressVersion = useProgressVersion()
  const { isEditMode, contentSource, setContentSource, githubHomeLead } = useEditorMode()
  const {
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
    goToTab,
    navigate,
    goToLanguage,
    goToSection,
    goToLevel,
    goToLevelStep,
    backFromLearn,
  } = useLearnRoute()
  const switchTab = useTabMemory({ tab, activeLanguageId, goToTab, navigate })

  const prevLevelIdRef = useRef<string | null>(null)

  const [readMoreOpen, setReadMoreOpen] = useState(false)
  const [installResetNotice, setInstallResetNotice] = useState<string | null>(null)
  const { shareNotice, shareSheetOpen, openShareSheet, closeShareSheet, handleShareSelect } = useShareSheet()

  const isAdmin = useAdminMode()
  /** The editor and admin mode can open everything. */
  const unlockAll = isEditMode || isAdmin

  const {
    rootError,
    bundleError,
    displayRootIndex,
    bundleForView,
    languageBundles,
    activeOpenableId,
    useLocalContent,
    resolveBundle,
    openLanguage,
    forgetBundle,
    replaceRootIndex,
  } = useCurriculum({ baseUrl, languageId, activeLanguageId, unlockAll, progressVersion, goToLanguage })

  useEffect(() => {
    if (languageId) saveSelectedLanguage(languageId)
  }, [languageId])

  const { streak, isLevelUnlocked, isSectionUnlockedFor, openableLanguages, totalXp, continueTarget } =
    useCourseProgress({
      progressVersion,
      unlockAll,
      displayRootIndex,
      bundleForView,
      languageBundles,
      resolveBundle,
      activeOpenableId,
    })

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

  const recordActivity = useCallback(() => {
    recordDailyActivity()
    notifyProgressChanged()
  }, [])
  const { xpToast, showXp } = useXpToast(totalXp)
  const { badgeToast, showBadges } = useBadgeToast()
  const onBadgesEarned = useCallback((badges: EarnedBadge[]) => showBadges(badges.map((b) => b.title)), [showBadges])
  // Badges follow the published course being learned (not edit-mode drafts).
  const badges = useBadges({
    progressVersion,
    languageId: activeOpenableId,
    bundle: !isEditMode && activeOpenableId ? (languageBundles[activeOpenableId] ?? null) : null,
    totalXp,
    onEarned: onBadgesEarned,
  })

  const sandbox = useSandbox(languageId)
  const challenges = useChallenges(languageId, selectedLevel, recordActivity, showXp)
  const levelTest = useLevelTest(languageId, selectedLevel, recordActivity, showXp)
  const { resetForLevel: resetSandboxForLevel } = sandbox
  const { resetForLevel: resetChallengesForLevel } = challenges
  const { resetForLevel: resetTestForLevel } = levelTest

  /** Index of the open section within the bundle, or -1. */
  const selectedSectionIndex =
    bundleForView && selectedSection
      ? bundleForView.sections.findIndex((s) => s.sectionRef.id === selectedSection.sectionRef.id)
      : -1

  // A locked level opened directly by URL goes back to its section's list.
  useEffect(() => {
    if (unlockAll || learnView !== 'level' || !languageId || !selectedSection || !levelId || !bundleForView) return
    const index = selectedSection.file.levels.findIndex((l) => l.id === levelId)
    if (index >= 0 && selectedSectionIndex >= 0 && !isLevelUnlocked(languageId, bundleForView.sections, selectedSectionIndex, index)) {
      goToSection(languageId, selectedSection.sectionRef.id)
    }
  }, [unlockAll, learnView, languageId, selectedSection, selectedSectionIndex, levelId, bundleForView, isLevelUnlocked, goToSection])

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

  const openLevelByPath = useCallback(
    async (opts: ContinueTarget) => {
      const b = await openLanguage(opts.languagePath, opts.languageId)
      if (!b) return
      const sectionIndex = b.sections.findIndex((s) => s.sectionRef.id === opts.sectionId)
      const section = b.sections[sectionIndex]
      if (!section) return
      const levelIndex = section.file.levels.findIndex((l) => l.id === opts.levelId)
      if (levelIndex < 0) return
      if (!isLevelUnlocked(opts.languageId, b.sections, sectionIndex, levelIndex)) return
      const level = section.file.levels[levelIndex]
      goToLevel(opts.languageId, opts.sectionId, level.id, 'intro')
      resetLevelWorkState(level, opts.languageId)
      rememberLastLevel(opts)
    },
    [isLevelUnlocked, openLanguage, resetLevelWorkState, goToLevel],
  )

  const back = () => {
    levelTest.dismissResult()
    backFromLearn()
  }

  /** Opens a lesson of the open course and remembers it for Continue. */
  const openLevel = useCallback(
    (secId: string, lvlId: string) => {
      if (!languageId) return
      goToLevel(languageId, secId, lvlId, 'intro')
      rememberLastLevel({
        languageId,
        languagePath: displayRootIndex?.languages.find((l) => l.id === languageId)?.path ?? '',
        sectionId: secId,
        levelId: lvlId,
      })
    },
    [languageId, goToLevel, displayRootIndex],
  )

  const goToNextLevel = useCallback(() => {
    if (!languageId || !sectionId || !nextLevel) return
    openLevel(sectionId, nextLevel.id)
  }, [languageId, sectionId, nextLevel, openLevel])

  const handleRemoveLanguage = (langId: string) => {
    removeLanguage(langId)
    if (activeLanguageId === langId) clearSelectedLanguage()
    if (languageId === langId) {
      forgetBundle()
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

  useEffect(() => {
    initAboutContent(installInstructions(platform).split('\n').slice(1))
  }, [platform, initAboutContent])

  const renderLearn = () => {
    if (rootError) return <LoadErrorPanel message={rootError} />
    if (!displayRootIndex) return <div className="cq-panel cq-muted">Loading catalog…</div>

    if (learnView === 'languages') {
      return (
        <LearnHome
          displayRootIndex={displayRootIndex}
          continueTarget={continueTarget}
          hasStarted={totalXp > 0}
          xpLevel={Math.floor(totalXp / 100)}
          xpCurrentLevel={totalXp % 100}
          totalXp={totalXp}
          streak={streak}
          badges={<BadgesPanel earned={badges.earned} toEarn={badges.toEarn} />}
          appUrl={`${window.location.origin}${baseUrl}`}
          homeLead={displayHomeLead}
          isEditMode={isEditMode}
          canOpenComingSoon={unlockAll}
          contentSource={contentSource}
          onContentSourceChange={setContentSource}
          onImportFromGitHub={() => {
            void (async () => {
              const ok = await requestConfirm(
                'Replace local drafts with content from public/content/? Unsaved local changes will be lost.',
                { title: 'Replace drafts', confirmLabel: 'Yes, replace' },
              )
              if (!ok) return
              await importFromGitHub(baseUrl)
              replaceRootIndex(await loadRootIndex(baseUrl))
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

    if (bundleError) return <LoadErrorPanel message={bundleError} />
    if (!bundleForView) return <div className="cq-panel cq-muted">Loading…</div>

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
          baseUrl={baseUrl}
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
          isLevelUnlocked={(_levels, index) =>
            bundleForView ? isLevelUnlocked(languageId, bundleForView.sections, selectedSectionIndex, index) : true
          }
          sectionLockedHint={
            bundleForView &&
            selectedSectionIndex > 0 &&
            !isSectionUnlockedFor(languageId, selectedSectionIndex) &&
            !hasTestedOut(languageId, secId)
              ? sectionStartHint(
                  bundleForView.sections[selectedSectionIndex - 1].file.levels,
                  bundleForView.sections[selectedSectionIndex - 1].sectionRef.title,
                )
              : null
          }
          nextSectionTitle={bundleForView?.sections[selectedSectionIndex + 1]?.sectionRef.title ?? null}
          onOpenLevel={(lvl) => {
            if (secId) openLevel(secId, lvl.id)
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
        ((levelTest.resultCurrent && levelTest.result?.passed === true) ||
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
          challengeChecking={challenges.checking}
          challengeRunning={challenges.running}
          challengeOutput={challenges.output}
          onRunChallenge={(ch) => void challenges.run(ch)}
          onChallengeDraftChange={challenges.changeDraft}
          onCheckChallenge={(ch) => void challenges.check(ch)}
          onStopChallengeCheck={challenges.stopCheck}
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
          testEdited={levelTest.edited}
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

  // Once a lesson is open, load the code editor, and for Python lessons Python itself in
  // the background (after the page has settled), so the first Run or Check starts straight away.
  useEffect(() => {
    if (learnView !== 'level') return
    // The code editor is small next to Python; fetch it straight away.
    preloadCodeEditor()
    if (languageId !== 'python') return
    const timer = window.setTimeout(warmUpPython, 1500)
    return () => window.clearTimeout(timer)
  }, [learnView, languageId])

  const showBack = tab === 'learn' && learnView !== 'languages'

  const breadcrumbs =
    tab === 'learn'
      ? learnBreadcrumbs({
          learnView,
          languageId,
          courseTitle: bundleForView ? bundleForView.index.title : null,
          section: selectedSection
            ? { id: selectedSection.sectionRef.id, title: selectedSection.sectionRef.title }
            : null,
        })
      : []
  const shellClassName =
    (platform === 'android'
      ? 'cq-shell cq-shell--android'
      : platform === 'ios'
        ? 'cq-shell cq-shell--ios'
        : 'cq-shell') + (isEditMode ? ' cq-shell--edit-mode' : '')

  const navItems: BottomNavItem[] = [
    { id: 'learn', label: 'Learn', icon: BookOpen },
    { id: 'about', label: 'About', icon: Info },
    { id: 'share', label: 'Share', icon: Share2, onAction: openShareSheet },
  ]

  return (
    <div className={shellClassName}>
      <AppHeader showBack={showBack} onBack={back} isAdmin={isAdmin} />

      {isEditMode ? (
        <Suspense fallback={null}>
          <EditorToolbar languageId={languageId} sectionId={sectionId} />
        </Suspense>
      ) : null}

      <main id="cq-main" className="cq-main" tabIndex={-1}>
        {tab === 'learn' ? (
          <>
            <Breadcrumbs items={breadcrumbs} onNavigate={levelTest.dismissResult} />
            {renderLearn()}
          </>
        ) : null}
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
            courses={openableLanguages}
            activeCourseId={activeLanguageId ?? null}
          />
        )}
      </main>

      <Notices xpToast={xpToast} badgeToast={badgeToast} shareNotice={shareNotice} />

      <BottomNav items={navItems} activeId={tab} onSelect={(id) => switchTab(id as TabId)} />

      {shareSheetOpen ? (
        <ShareSheet onSelect={(variant) => void handleShareSelect(variant)} onClose={closeShareSheet} />
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
