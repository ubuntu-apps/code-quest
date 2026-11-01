import type { FriendlyCodeError } from '../languages'
import type { Level } from './types'
import {
  CHALLENGE_XP,
  CHALLENGE_XP_AFTER_ANSWER,
  LOCK_SECTIONS_BY_QUIZZES,
  TEST_XP,
} from './constants'
import { loadProgress } from './progressStorage'
import { hasTestedOut } from './testOut'

// The streak lives in streak.ts; these re-exports keep older imports working.
export {
  currentStreak,
  loadStreakState,
  localDateKey,
  recordDailyActivity,
  type StreakState,
} from './streak'

/**
 * IDs of this level's challenges that are marked complete. Saved progress can hold
 * IDs of challenges that no longer exist (after content changes); those don't count.
 */
export function completedChallengeIds(level: Level, completed: string[]): string[] {
  return level.challenges.map((c) => c.id).filter((id) => completed.includes(id))
}

export function computeLevelXp(languageId: string, level: Level): number {
  const p = loadProgress(languageId, level.id)
  const done = completedChallengeIds(level, p.challengesCompleted)
  const solvedAfterAnswer = done.filter((id) => (p.answersViewed ?? []).includes(id)).length
  const challengeXp =
    done.length * CHALLENGE_XP - solvedAfterAnswer * (CHALLENGE_XP - CHALLENGE_XP_AFTER_ANSWER)
  const testXp = p.testPassed ? TEST_XP : 0
  return challengeXp + testXp
}

export type SectionProgressStatus = 'not_started' | 'in_progress' | 'complete'

export function isLevelComplete(languageId: string, level: Level): boolean {
  const p = loadProgress(languageId, level.id)
  const challengesDone =
    level.challenges.length === 0 ||
    level.challenges.every((c) => p.challengesCompleted.includes(c.id))
  return challengesDone && p.testPassed
}

export function isLevelStarted(languageId: string, level: Level): boolean {
  const p = loadProgress(languageId, level.id)
  return completedChallengeIds(level, p.challengesCompleted).length > 0 || p.testPassed
}

export function getSectionProgressStatus(
  languageId: string,
  levels: Level[],
): SectionProgressStatus {
  if (levels.length === 0) return 'not_started'
  if (!levels.some((level) => isLevelStarted(languageId, level))) return 'not_started'
  if (levels.every((level) => isLevelComplete(languageId, level))) return 'complete'
  return 'in_progress'
}

export function computeSectionXp(languageId: string, levels: Level[]): number {
  return levels.reduce((sum, level) => sum + computeLevelXp(languageId, level), 0)
}

export function isProjectLevel(level: Level): boolean {
  return level.kind === 'project'
}

export function getProjectLevels(levels: Level[]): Level[] {
  return levels.filter(isProjectLevel)
}

export function areRequiredSectionProjectsComplete(languageId: string, levels: Level[]): boolean {
  const required = getProjectLevels(levels).filter(
    (level) => level.projectDifficulty === 'easy' || level.projectDifficulty === 'medium',
  )
  if (required.length === 0) return true
  return required.every((level) => isLevelComplete(languageId, level))
}

/** True if the section has easy or medium project levels (they gate the next section). */
export function hasRequiredProjects(levels: Level[]): boolean {
  return getProjectLevels(levels).some(
    (level) => level.projectDifficulty === 'easy' || level.projectDifficulty === 'medium',
  )
}

/**
 * A section unlocks when the previous one is finished: its easy and medium projects
 * if it has any, otherwise (when `lockByQuizzes` is on) the quiz of every topic in it.
 * Testing out of the previous section (testOut.ts) also counts as finishing it, and so
 * does passing every quiz in it, which is what earns the section certificate
 * (certificate/courseCompletion.ts): the app never says a section is complete while the
 * next one stays locked.
 */
export function isSectionUnlocked(
  languageId: string,
  sections: { sectionRef?: { id: string }; file: { levels: Level[] } }[],
  sectionIndex: number,
  { lockByQuizzes = LOCK_SECTIONS_BY_QUIZZES }: { lockByQuizzes?: boolean } = {},
): boolean {
  if (sectionIndex <= 0) return true
  const previous = sections[sectionIndex - 1]
  if (!previous) return true
  if (previous.sectionRef && hasTestedOut(languageId, previous.sectionRef.id)) return true
  const levels = previous.file.levels
  if (levels.length > 0 && levels.every((level) => loadProgress(languageId, level.id).testPassed)) return true
  if (hasRequiredProjects(levels)) return areRequiredSectionProjectsComplete(languageId, levels)
  if (!lockByQuizzes) return true
  return levels.every((level) => loadProgress(languageId, level.id).testPassed)
}

/** Shown inside a section whose prerequisite isn't met: what to do to start it. */
export function sectionStartHint(previousLevels: Level[], previousTitle: string): string {
  return hasRequiredProjects(previousLevels)
    ? `You can look around. To start this quest, complete the easy and medium side quests in ${previousTitle}.`
    : `You can look around. To start this quest, clear every gate in ${previousTitle}.`
}

/** Explains what unlocks the section that comes after `previousLevels` (titled `previousTitle`). */
export function sectionUnlockHint(previousLevels: Level[], previousTitle: string): string {
  return hasRequiredProjects(previousLevels)
    ? `Preview · complete the easy and medium side quests in ${previousTitle} to start`
    : `Preview · clear every gate in ${previousTitle} to start`
}

export function errorLinePointer(
  code: string,
  err: Pick<FriendlyCodeError, 'line' | 'column'> | null | undefined,
) {
  if (!err?.line) return null
  const lines = code.split('\n')
  const lineIndex = err.line - 1
  if (lineIndex < 0 || lineIndex >= lines.length) return null
  const text = lines[lineIndex] ?? ''
  const col = Math.max(1, err.column ?? 1)
  const caretPad = ' '.repeat(Math.max(0, col - 1))
  return {
    line: err.line,
    text,
    caret: `${caretPad}^`,
    column: err.column,
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text.trim()) return false
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
