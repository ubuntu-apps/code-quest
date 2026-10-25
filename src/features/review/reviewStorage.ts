import { useSyncExternalStore } from 'react'
import { localDateKey } from '../curriculum/streak'
import { applyAnswers, type ReviewItem } from './reviewSchedule'

/** One key per course: `codequest:review:python`. Included in progress backups. */
export const REVIEW_PREFIX = 'codequest:review:'
/** Fired when the saved review state changes, so open panels re-read it. */
export const REVIEW_CHANGED_EVENT = 'codequest:review-changed'
const CHANGED_EVENT = REVIEW_CHANGED_EVENT

/** Today's review: which questions, and how it went once checked. */
export interface ReviewSession {
  date: string
  ids: string[]
  done: boolean
  correct: number
  /** Sets finished today, counting this one once it is done. */
  rounds: number
}

export interface ReviewState {
  items: Record<string, ReviewItem>
  session?: ReviewSession
}

export function loadReviewState(languageId: string): ReviewState {
  try {
    const raw = localStorage.getItem(REVIEW_PREFIX + languageId)
    const parsed = raw ? (JSON.parse(raw) as Partial<ReviewState>) : null
    return { items: parsed?.items && typeof parsed.items === 'object' ? parsed.items : {}, session: parsed?.session }
  } catch {
    return { items: {} }
  }
}

function saveReviewState(languageId: string, state: ReviewState): void {
  try {
    localStorage.setItem(REVIEW_PREFIX + languageId, JSON.stringify(state))
  } catch {
    // Storage full or blocked: review still works, it just won't remember.
  }
  window.dispatchEvent(new Event(CHANGED_EVENT))
}

/**
 * Notes how the learner did on quiz questions (lesson quizzes, skip-ahead quizzes and
 * reviews). Only questions they actually answered count.
 */
export function recordReviewAnswers(
  languageId: string,
  results: Record<string, boolean>,
  answeredIds: Iterable<string>,
  now = new Date(),
): void {
  const answered = new Set(answeredIds)
  const counted = Object.fromEntries(Object.entries(results).filter(([id]) => answered.has(id)))
  if (Object.keys(counted).length === 0) return
  const state = loadReviewState(languageId)
  saveReviewState(languageId, { ...state, items: applyAnswers(state.items, counted, localDateKey(now)) })
}

/** The questions a quiz's answers cover: picked choices and non-blank typed answers. */
export function answeredQuestionIds(short: Record<string, string>, mcq: Record<string, string>): string[] {
  return [...Object.keys(mcq), ...Object.keys(short).filter((id) => short[id].trim() !== '')]
}

export function todaysSession(state: ReviewState, now = new Date()): ReviewSession | null {
  return state.session?.date === localDateKey(now) ? state.session : null
}

export function startReviewSession(languageId: string, ids: string[], now = new Date()): ReviewSession {
  const state = loadReviewState(languageId)
  const today = localDateKey(now)
  const rounds = state.session?.date === today ? state.session.rounds : 0
  const session: ReviewSession = { date: today, ids, done: false, correct: 0, rounds }
  saveReviewState(languageId, { ...state, session })
  return session
}

export function finishReviewSession(languageId: string, correct: number, now = new Date()): void {
  const state = loadReviewState(languageId)
  const session = todaysSession(state, now)
  if (!session || session.done) return
  saveReviewState(languageId, { ...state, session: { ...session, done: true, correct, rounds: session.rounds + 1 } })
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CHANGED_EVENT, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(CHANGED_EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}

/** The saved review state as text, so components re-render when it changes. */
export function useReviewSnapshot(languageId: string | null): string {
  return useSyncExternalStore(
    subscribe,
    () => {
      if (!languageId) return ''
      try {
        return localStorage.getItem(REVIEW_PREFIX + languageId) ?? ''
      } catch {
        return ''
      }
    },
    () => '',
  )
}
