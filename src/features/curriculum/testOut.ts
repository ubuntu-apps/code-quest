import { notifyProgressChanged } from './progressStorage'
import type { Level, TestQuestion } from './types'

/**
 * Testing out of a section: a learner who already knows a section takes one quiz made
 * from its lessons' quizzes. Passing marks the section as tested out, which opens every
 * lesson in it and unlocks the next section (see isSectionUnlocked). It earns no XP and
 * doesn't mark lessons as passed, so XP and progress still show the work actually done.
 */

export const TEST_OUT_PREFIX = 'codequest:testout:'
/** Higher than a lesson quiz (70%): skipping a whole section should need a clear pass. */
export const TEST_OUT_PASS_PERCENT = 80
/** Questions taken from each lesson's quiz. */
export const TEST_OUT_PER_LESSON = 2

export function testOutKey(languageId: string, sectionId: string): string {
  return `${TEST_OUT_PREFIX}${languageId}:${sectionId}`
}

export function hasTestedOut(languageId: string, sectionId: string): boolean {
  try {
    return localStorage.getItem(testOutKey(languageId, sectionId)) !== null
  } catch {
    return false
  }
}

export function markTestedOut(languageId: string, sectionId: string, now = new Date()): void {
  try {
    localStorage.setItem(testOutKey(languageId, sectionId), JSON.stringify({ passedAt: now.toISOString() }))
  } catch {
    // Storage unavailable: the section stays as it was.
  }
  notifyProgressChanged()
}

/** A random pick of `count` items, in a random order. */
function pick<T>(items: T[], count: number, random: () => number): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, count)
}

/**
 * The test-out quiz for a section: a few questions from each topic lesson's quiz (not
 * the projects), kept in lesson order so it reads like a tour of the section.
 */
export function buildTestOutQuestions(
  levels: Level[],
  perLesson = TEST_OUT_PER_LESSON,
  random: () => number = Math.random,
): TestQuestion[] {
  return levels
    .filter((level) => level.kind !== 'project')
    .flatMap((level) => pick(level.test.questions, perLesson, random))
}

/** Whether a section has enough quiz questions to offer a test-out quiz. */
export function canTestOut(levels: Level[]): boolean {
  return buildTestOutQuestions(levels, TEST_OUT_PER_LESSON, () => 0).length >= 4
}
