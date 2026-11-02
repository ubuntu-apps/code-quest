import { STORES } from '../../../lib/stores'
import { requestPersistentStorageOnce } from './storagePersistence'

export interface LevelProgress {
  challengesCompleted: string[]
  testPassed: boolean
  challengeAnswers?: Record<string, string>
  /** Challenges whose answer was revealed before they were solved (they earn less XP). */
  answersViewed?: string[]
  /**
   * Each challenge's content fingerprint when this progress was last checked against
   * the lesson (see progressFingerprint.ts). A challenge whose content has changed since
   * then loses its old completion, draft and answer-viewed marks.
   */
  challengeVersions?: Record<string, string>
  /** How many challenges lost their progress because the lesson changed (shown once, then cleared). */
  challengesReset?: number
}

/** A lesson's id in STORES.progress: `python:first_program`. */
export function progressId(languageId: string, levelId: string): string {
  return `${languageId}:${levelId}`
}

export function loadProgress(languageId: string, levelId: string): LevelProgress {
  try {
    const raw = STORES.progress.get(progressId(languageId, levelId))
    if (!raw) return { challengesCompleted: [], testPassed: false, challengeAnswers: {} }
    const parsed = JSON.parse(raw) as LevelProgress
    return {
      challengesCompleted: Array.isArray(parsed.challengesCompleted)
        ? parsed.challengesCompleted
        : [],
      testPassed: Boolean(parsed.testPassed),
      challengeAnswers:
        parsed.challengeAnswers && typeof parsed.challengeAnswers === 'object'
          ? parsed.challengeAnswers
          : {},
      ...(Array.isArray(parsed.answersViewed) ? { answersViewed: parsed.answersViewed } : {}),
      ...(parsed.challengeVersions && typeof parsed.challengeVersions === 'object'
        ? { challengeVersions: parsed.challengeVersions }
        : {}),
      ...(typeof parsed.challengesReset === 'number' && parsed.challengesReset > 0
        ? { challengesReset: parsed.challengesReset }
        : {}),
    }
  } catch {
    return { challengesCompleted: [], testPassed: false, challengeAnswers: {} }
  }
}

export function saveProgress(languageId: string, levelId: string, p: LevelProgress): void {
  STORES.progress.set(progressId(languageId, levelId), JSON.stringify(p))
  requestPersistentStorageOnce()
  notifyProgressChanged()
}

/**
 * Saves a challenge's draft answer while the learner types. Drafts don't change
 * progress, XP or unlocking, so this skips notifying listeners (which would make
 * every progress-driven view recompute on each keystroke).
 */
export function saveChallengeDraft(languageId: string, levelId: string, challengeId: string, answer: string): void {
  const prev = loadProgress(languageId, levelId)
  const next: LevelProgress = {
    ...prev,
    challengeAnswers: { ...(prev.challengeAnswers ?? {}), [challengeId]: answer },
  }
  // Storage full or unavailable: the draft stays in memory for this session.
  STORES.progress.set(progressId(languageId, levelId), JSON.stringify(next))
}

let progressVersion = 0
const progressListeners = new Set<() => void>()

export function subscribeProgress(listener: () => void): () => void {
  progressListeners.add(listener)
  return () => progressListeners.delete(listener)
}

export function getProgressSnapshot(): number {
  return progressVersion
}

/** Tells progress-driven views to re-read storage (e.g. after a backup is restored). */
export function notifyProgressChanged(): void {
  progressVersion += 1
  for (const listener of progressListeners) listener()
}
