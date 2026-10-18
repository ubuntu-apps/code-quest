import { useCallback, useMemo } from 'react'
import type { LanguageBundle, LoadedSection, RootIndex } from '../types'
import { loadProgress } from '../progressStorage'
import { hasTestedOut } from '../testOut'
import {
  computeLevelXp,
  isSectionUnlocked as checkSectionUnlocked,
  currentStreak,
  loadStreakState,
} from '../helpers'
import { loadLastLevel } from '../lastLevel'
import type { ContinueTarget } from '../views/LearnHome'

interface UseCourseProgressOptions {
  progressVersion: number
  /** Edit or admin mode: everything is open. */
  unlockAll: boolean
  displayRootIndex: RootIndex | null
  /** The open course. */
  bundleForView: LanguageBundle | null
  languageBundles: Record<string, LanguageBundle>
  resolveBundle: (langId: string, fallback: LanguageBundle | undefined) => LanguageBundle | null
  activeOpenableId: string | null
}

/**
 * What the learner's saved progress means for the app: which sections and lessons are
 * open, total XP, the streak, and the lesson the Continue button opens. Everything is
 * worked out again whenever progress changes (`progressVersion`).
 */
export function useCourseProgress({
  progressVersion,
  unlockAll,
  displayRootIndex,
  bundleForView,
  languageBundles,
  resolveBundle,
  activeOpenableId,
}: UseCourseProgressOptions) {
  // Read from storage on every progress change, so a restored backup shows its streak too.
  const streakCount = useMemo(() => {
    void progressVersion
    return currentStreak(loadStreakState())
  }, [progressVersion])

  /**
   * Every section can be opened to preview its lessons, but a section's levels
   * stay locked until its prerequisite is met (see isSectionUnlocked). Inside a
   * section, each level unlocks when the previous level's quiz is passed.
   */
  const isLevelUnlocked = useCallback(
    (langId: string, sections: LoadedSection[], sectionIndex: number, index: number): boolean => {
      void progressVersion
      if (unlockAll) return true
      // Testing out of a section opens all of its lessons, even before the section itself unlocks.
      const sectionRef = sections[sectionIndex]?.sectionRef
      if (sectionRef && hasTestedOut(langId, sectionRef.id)) return true
      if (!checkSectionUnlocked(langId, sections, sectionIndex)) return false
      if (index === 0) return true
      const prev = sections[sectionIndex]?.file.levels[index - 1]
      return prev ? loadProgress(langId, prev.id).testPassed : true
    },
    [unlockAll, progressVersion],
  )

  const isSectionUnlockedFor = useCallback(
    (langId: string, sectionIndex: number): boolean => {
      void progressVersion
      if (unlockAll || !bundleForView) return true
      return checkSectionUnlocked(langId, bundleForView.sections, sectionIndex)
    },
    [unlockAll, bundleForView, progressVersion],
  )

  /** Courses learners can open now: "coming soon" ones only in edit or admin mode. */
  const openableLanguages = useMemo(
    () => (displayRootIndex?.languages ?? []).filter((lang) => unlockAll || !lang.comingSoon),
    [displayRootIndex, unlockAll],
  )

  const catalogLanguages = useMemo(() => {
    if (!activeOpenableId) return openableLanguages
    return openableLanguages.filter((lang) => lang.id === activeOpenableId)
  }, [openableLanguages, activeOpenableId])

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

  /** The lesson opened last, or else the first open lesson whose quiz isn't passed. */
  const continueTarget = useMemo((): ContinueTarget | null => {
    void progressVersion
    if (!displayRootIndex) return null
    const last = loadLastLevel()
    if (last) {
      const openable = openableLanguages.some((lang) => lang.id === last.languageId)
      if (openable && (!activeOpenableId || last.languageId === activeOpenableId)) return last
    }
    for (const lang of catalogLanguages) {
      const b = resolveBundle(lang.id, languageBundles[lang.id]) ?? languageBundles[lang.id]
      if (!b) continue
      for (const [sectionIndex, section] of b.sections.entries()) {
        for (let i = 0; i < section.file.levels.length; i += 1) {
          const lvl = section.file.levels[i]
          if (!isLevelUnlocked(lang.id, b.sections, sectionIndex, i)) continue
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
  }, [
    displayRootIndex,
    openableLanguages,
    catalogLanguages,
    languageBundles,
    resolveBundle,
    isLevelUnlocked,
    progressVersion,
    activeOpenableId,
  ])

  return {
    streakCount,
    isLevelUnlocked,
    isSectionUnlockedFor,
    openableLanguages,
    totalXp,
    continueTarget,
  }
}
