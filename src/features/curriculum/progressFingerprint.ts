import { loadProgress, progressKey, type LevelProgress } from './progressStorage'
import type { Challenge, LanguageBundle, Level } from './types'

/**
 * Progress is stored by challenge id, and ids follow the challenge's position in its
 * lesson (`topic_ch3`). When a lesson is rewritten, a saved "done" mark or draft would
 * otherwise land on whatever challenge now sits in that position. So each challenge's
 * progress remembers a fingerprint of the challenge (its title and how it is checked),
 * and progress for a challenge whose fingerprint has changed is dropped. A passed quiz
 * is kept, so rewritten content never locks a learner out of later lessons.
 */

/** Marks this browser's progress for a course as fingerprinted (see reconcileLanguageProgress). */
export function progressFormatKey(languageId: string): string {
  return `codequest:progress-format:${languageId}`
}

const PROGRESS_FORMAT = '2'

/** A short hash of what makes a challenge "the same challenge": its title and its checks. */
export function challengeFingerprint(challenge: Challenge): string {
  const text = JSON.stringify([challenge.title, challenge.validation])
  // FNV-1a (32-bit): fast and stable; collisions only matter between two versions of one challenge.
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(36)
}

function hasChallengeState(p: LevelProgress, id: string): boolean {
  return (
    p.challengesCompleted.includes(id) ||
    (p.answersViewed ?? []).includes(id) ||
    Object.prototype.hasOwnProperty.call(p.challengeAnswers ?? {}, id)
  )
}

/**
 * Checks one level's saved progress against its current challenges. Progress saved
 * before fingerprints existed (`trustUnstamped` false) counts as out of date.
 * Returns true when storage was changed.
 */
export function reconcileLevelProgress(languageId: string, level: Level, trustUnstamped: boolean): boolean {
  const key = progressKey(languageId, level.id)
  let raw: string | null
  try {
    raw = localStorage.getItem(key)
  } catch {
    return false
  }
  if (!raw) return false
  const prev = loadProgress(languageId, level.id)
  const stamps = prev.challengeVersions ?? {}
  const stale = new Set<string>()
  const versions: Record<string, string> = {}
  for (const ch of level.challenges) {
    const fingerprint = challengeFingerprint(ch)
    versions[ch.id] = fingerprint
    const stamp = stamps[ch.id]
    const outdated = stamp === undefined ? !trustUnstamped : stamp !== fingerprint
    if (outdated && hasChallengeState(prev, ch.id)) stale.add(ch.id)
  }
  const sameVersions =
    Object.keys(versions).length === Object.keys(stamps).length &&
    Object.entries(versions).every(([id, v]) => stamps[id] === v)
  if (stale.size === 0 && sameVersions) return false

  const answers = Object.fromEntries(
    Object.entries(prev.challengeAnswers ?? {}).filter(([id]) => !stale.has(id)),
  )
  const next: LevelProgress = {
    ...prev,
    challengesCompleted: prev.challengesCompleted.filter((id) => !stale.has(id)),
    challengeAnswers: answers,
    challengeVersions: versions,
  }
  if (prev.answersViewed) next.answersViewed = prev.answersViewed.filter((id) => !stale.has(id))
  try {
    localStorage.setItem(key, JSON.stringify(next))
  } catch {
    return false
  }
  return stale.size > 0
}

/**
 * Checks every level of a course. The first time this runs in a browser, progress
 * saved by older versions of the app (which has no fingerprints) is treated as out
 * of date; after that, progress saved without a fingerprint is new and is trusted.
 * Returns true when any challenge progress was dropped.
 */
export function reconcileLanguageProgress(languageId: string, bundle: LanguageBundle): boolean {
  let trustUnstamped: boolean
  try {
    trustUnstamped = localStorage.getItem(progressFormatKey(languageId)) === PROGRESS_FORMAT
  } catch {
    return false
  }
  let dropped = false
  for (const { file } of bundle.sections) {
    for (const level of file.levels) {
      if (reconcileLevelProgress(languageId, level, trustUnstamped)) dropped = true
    }
  }
  try {
    localStorage.setItem(progressFormatKey(languageId), PROGRESS_FORMAT)
  } catch {
    // Storage unavailable: nothing was saved either.
  }
  return dropped
}
