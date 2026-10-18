import { requestPersistentStorageOnce } from './storagePersistence'

const PREFIX = 'codequest:progress:'

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
}

export function progressKey(languageId: string, levelId: string): string {
  return `${PREFIX}${languageId}:${levelId}`
}

export function loadProgress(languageId: string, levelId: string): LevelProgress {
  try {
    const raw = localStorage.getItem(progressKey(languageId, levelId))
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
    }
  } catch {
    return { challengesCompleted: [], testPassed: false, challengeAnswers: {} }
  }
}

export function saveProgress(languageId: string, levelId: string, p: LevelProgress): void {
  localStorage.setItem(progressKey(languageId, levelId), JSON.stringify(p))
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
  try {
    localStorage.setItem(progressKey(languageId, levelId), JSON.stringify(next))
  } catch {
    // Storage full or unavailable: the draft stays in memory for this session.
  }
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
