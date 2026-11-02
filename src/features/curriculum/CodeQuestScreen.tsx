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
import '../../styles/support.css'
import '../../styles/badges.css'
import '../../styles/review.css'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BookOpen, Info, Settings, Share2 } from 'lucide-react'
import type { Level } from './content/types'
import { useAdminMode } from './adminMode'
import { loadProgress, notifyProgressChanged } from './progress/progressStorage'
import { hasTestedOut } from './progress/testOut'
import { languagePack } from '../languages'
import { preloadCodeEditor } from './codeEditor'
import { playSound } from '../sound/sound'
import { SectionCertificateNotice } from '../certificate/SectionCertificateNotice'
import { ReviewPanel } from '../review/ReviewPanel'
import { ReadMoreModal } from './components/ReadMoreModal'
import { LoadErrorPanel } from './components/LoadErrorPanel'
import { Breadcrumbs } from './components/Breadcrumbs'
import { AppHeader, type HeaderCourse } from './components/AppHeader'
import { courseRank } from '../ranks/ranks'
import { Notices } from './components/Notices'
import { BottomNav, type BottomNavItem } from '../../components/BottomNav/BottomNav'
import { ShareSheet } from '../../components/ShareSheet'
import { detectPlatform } from '../../platform'
import type { TabId } from './constants'
import { useLearnRoute } from './hooks/useLearnRoute'
import { useTabMemory } from './hooks/useTabMemory'
import { learnBreadcrumbs } from './learnPaths'
import { rememberLastLevel } from './progress/lastLevel'
import { saveSelectedLanguage } from './progress/selectedLanguageStorage'
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
import { SettingsTab } from './views/SettingsTab'

/**
 * The whole app: header, the Learn, Settings and About pages, and the bottom bar. Loading content
 * and working out progress live in hooks (useCurriculum, useCourseProgress); each page
 * is a view in ./views.
 */
export function CodeQuestScreen() {
  const baseUrl = import.meta.env.BASE_URL
  const [platform] = useState(() => detectPlatform())
  const progressVersion = useProgressVersion()
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
    selectCourse,
  } = useLearnRoute()
  const switchTab = useTabMemory({ tab, activeLanguageId, goToTab, navigate })

  const prevLevelIdRef = useRef<string | null>(null)

  const [readMoreOpen, setReadMoreOpen] = useState(false)
  const { shareNotice, shareSheetOpen, openShareSheet, closeShareSheet, handleShareSelect } = useShareSheet()

  const isAdmin = useAdminMode()
  /** Admin mode (for testing) opens everything. */
  const unlockAll = isAdmin

  const {
    rootError,
    bundleError,
    displayRootIndex,
    bundleForView,
    languageBundles,
    activeOpenableId,
    openLanguage,
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
      activeOpenableId,
    })

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
  const onBadgesEarned = useCallback(
    (badges: EarnedBadge[]) => {
      // Badges are in course order, so the last rank badge is the highest one just earned.
      const rank = badges.filter((b) => b.kind === 'rank').at(-1)
      showBadges(
        badges.map((b) => b.title),
        rank?.title,
      )
      // Badges come with a passed check or quiz, so their sound follows that one.
      playSound('badge', 0.6)
    },
    [showBadges],
  )
  // Badges follow the course being learned.
  const badges = useBadges({
    progressVersion,
    languageId: activeOpenableId,
    bundle: activeOpenableId ? (languageBundles[activeOpenableId] ?? null) : null,
    totalXp,
    onEarned: onBadgesEarned,
  })

  // The top bar: the course being learned, the rank in it and its XP (as on Home).
  const headerBundle = activeOpenableId ? (languageBundles[activeOpenableId] ?? null) : null
  const headerCourse = useMemo((): HeaderCourse | null => {
    void progressVersion
    if (!activeOpenableId || !headerBundle) return null
    return { title: headerBundle.index.title, rank: courseRank(activeOpenableId, headerBundle).rank, xp: totalXp }
  }, [activeOpenableId, headerBundle, totalXp, progressVersion])

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

  // Load the starter code (or saved answers) when a lesson opens. On a reload or a link the
  // lesson's content arrives after its id, so it only counts as opened once both are here.
  useEffect(() => {
    if (!levelId) {
      prevLevelIdRef.current = null
      return
    }
    if (!selectedLevel || levelId === prevLevelIdRef.current) return
    prevLevelIdRef.current = levelId
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
          review={
            activeOpenableId && languageBundles[activeOpenableId] ? (
              <ReviewPanel
                languageId={activeOpenableId}
                bundle={languageBundles[activeOpenableId]}
                progressVersion={progressVersion}
                onActivity={recordActivity}
              />
            ) : null
          }
          badges={<BadgesPanel earned={badges.earned} toEarn={badges.toEarn} />}
          appUrl={`${window.location.origin}${baseUrl}`}
          canOpenComingSoon={unlockAll}
          onContinue={() => continueTarget && void openLevelByPath(continueTarget)}
          onOpenLanguage={(path, id) => void openLanguage(path, id)}
          activeCourseId={activeOpenableId}
          onSelectCourse={selectCourse}
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
          isSectionUnlocked={(index) => languageId ? isSectionUnlockedFor(languageId, index) : true}
          onSelectSection={(id) => languageId && goToSection(languageId, id)}
          baseUrl={baseUrl}
        />
      )
    }

    // "Section complete" with its certificate, once every lesson here is passed (or skipped ahead).
    const sectionCertificate =
      bundleForView && selectedSection && languageId ? (
        <SectionCertificateNotice
          languageId={languageId}
          courseTitle={bundleForView.index.title}
          section={selectedSection}
          sectionNumber={
            bundleForView.index.sections.findIndex((ref) => ref.id === selectedSection.sectionRef.id) + 1
          }
          baseUrl={baseUrl}
        />
      ) : null

    if (learnView === 'levels' && selectedSection && languageId) {
      const secId = selectedSection.sectionRef.id
      return (
        <LearnLevels
          selectedSection={selectedSection}
          languageId={languageId}
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
          certificate={sectionCertificate}
          onOpenLevel={(lvl) => {
            if (secId) openLevel(secId, lvl.id)
          }}
        />
      )
    }

    if (learnView === 'level' && selectedSection && selectedLevel && languageId) {
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
          onReadMoreOpen={() => setReadMoreOpen(true)}
          sandbox={sandbox}
          challenges={challenges}
          test={levelTest}
          nextStage={{ title: nextLevel?.title ?? null, show: showNext, go: goToNextLevel }}
          afterQuizPassed={sectionCertificate}
        />
      )
    }

    return null
  }

  // Once a lesson is open, load the code editor, and the language's runtime in the
  // background (after the page has settled), so the first Run or Check starts straight away.
  useEffect(() => {
    if (learnView !== 'level') return
    // The code editor is small next to a runtime; fetch it straight away.
    preloadCodeEditor(languageId ?? undefined)
    const pack = languagePack(languageId)
    if (!pack) return
    const timer = window.setTimeout(() => pack.warmUp(), 1500)
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
        : 'cq-shell')

  const navItems: BottomNavItem[] = [
    { id: 'learn', label: 'Learn', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'about', label: 'About', icon: Info },
    { id: 'share', label: 'Share', icon: Share2, onAction: openShareSheet },
  ]

  return (
    <div className={shellClassName}>
      <AppHeader showBack={showBack} onBack={back} isAdmin={isAdmin} course={headerCourse} />

      <main id="cq-main" className="cq-main" tabIndex={-1}>
        {tab === 'learn' ? (
          <>
            <Breadcrumbs items={breadcrumbs} onNavigate={levelTest.dismissResult} />
            {renderLearn()}
          </>
        ) : null}
        {tab === 'settings' && (
          <SettingsTab baseUrl={baseUrl} courses={openableLanguages} activeCourseId={activeLanguageId ?? null} />
        )}
        {tab === 'about' && <AboutTab baseUrl={baseUrl} />}
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
