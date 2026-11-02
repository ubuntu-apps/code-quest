import type { LanguageBundle, Level, TestQuestion } from '../curriculum/content/types'
import { loadProgress } from '../curriculum/progress/progressStorage'

/**
 * Spaced review of past quiz questions, worked out without touching storage (see
 * reviewStorage.ts for that). Each question sits in a "box": a right answer moves it up
 * a box, so it comes back later; a wrong one sends it back to box 0, so it comes back
 * tomorrow. The daily set is the questions due today, the shakiest first.
 */

/** Questions in a daily review. */
export const REVIEW_SIZE = 5
/** Days until a question comes back, by box. */
export const REVIEW_INTERVALS = [1, 2, 4, 7, 14, 30]
const TOP_BOX = REVIEW_INTERVALS.length - 1

/** What the learner has shown about one question. Dates are local day keys (YYYY-MM-DD). */
export interface ReviewItem {
  box: number
  /** The day it is next due; "" means due now. */
  due: string
  right: number
  wrong: number
  /** The day it was last answered. */
  seen: string
}

export function addDays(dateKey: string, days: number): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey)
  const d = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + days) : new Date()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

/**
 * The items after a set of answers. A question answered again on the same day can only
 * go down, so fixing a quiz after seeing the marks doesn't count as knowing it.
 */
export function applyAnswers(
  items: Record<string, ReviewItem>,
  results: Record<string, boolean>,
  today: string,
): Record<string, ReviewItem> {
  const next = { ...items }
  for (const [id, ok] of Object.entries(results)) {
    const prev = items[id]
    if (ok) {
      if (prev?.seen === today) continue
      const box = prev ? Math.min(prev.box + 1, TOP_BOX) : 1
      next[id] = {
        box,
        due: addDays(today, REVIEW_INTERVALS[box]),
        right: (prev?.right ?? 0) + 1,
        wrong: prev?.wrong ?? 0,
        seen: today,
      }
    } else {
      if (prev?.seen === today && prev.box === 0) continue
      next[id] = {
        box: 0,
        due: addDays(today, REVIEW_INTERVALS[0]),
        right: prev?.right ?? 0,
        wrong: (prev?.wrong ?? 0) + 1,
        seen: today,
      }
    }
  }
  return next
}

/** A question that can come up in review, with the lesson it is from. */
export interface ReviewCandidate {
  question: TestQuestion
  level: Level
  item: ReviewItem
}

/**
 * Questions the learner has met: answered in a quiz before, or in a lesson whose quiz
 * was passed before answers were recorded. Project quizzes are left out (their questions
 * are about one particular program). In course order.
 */
export function reviewPool(
  languageId: string,
  bundle: LanguageBundle,
  items: Record<string, ReviewItem>,
): ReviewCandidate[] {
  const pool: ReviewCandidate[] = []
  for (const { file } of bundle.sections) {
    for (const level of file.levels) {
      if (level.kind === 'project') continue
      const passed = loadProgress(languageId, level.id).testPassed
      for (const question of level.test.questions) {
        const item = items[question.id] ?? (passed ? { box: 1, due: '', right: 0, wrong: 0, seen: '' } : null)
        if (item) pool.push({ question, level, item })
      }
    }
  }
  return pool
}

/**
 * Today's set: the questions that are due, lowest box and most often missed first. If
 * fewer are due, the rest are drawn at random, favouring ones missed before. Returned in
 * course order, so the set reads like a tour.
 */
export function pickReview(
  pool: ReviewCandidate[],
  today: string,
  size: number = REVIEW_SIZE,
  exclude: ReadonlySet<string> = new Set(),
  random: () => number = Math.random,
): string[] {
  const available = pool.filter((c) => !exclude.has(c.question.id))
  // Shuffled first, so questions that tie (same box, same misses) come up in any order.
  const shuffled = [...available]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  const due = shuffled
    .filter((c) => c.item.due <= today)
    .sort((a, b) => a.item.box - b.item.box || b.item.wrong - a.item.wrong || a.item.due.localeCompare(b.item.due))
  const picked = new Set(due.slice(0, size).map((c) => c.question.id))

  let rest = available.filter((c) => !picked.has(c.question.id))
  while (picked.size < size && rest.length > 0) {
    const weights = rest.map((c) => 1 + 2 * c.item.wrong)
    let r = random() * weights.reduce((sum, w) => sum + w, 0)
    let index = 0
    while (index < rest.length - 1 && r >= weights[index]) {
      r -= weights[index]
      index += 1
    }
    picked.add(rest[index].question.id)
    rest = rest.filter((_, i) => i !== index)
  }

  return available.filter((c) => picked.has(c.question.id)).map((c) => c.question.id)
}
