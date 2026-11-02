import { STORES } from '../../../lib/stores'
import { loadProgress, progressId, type LevelProgress } from './progressStorage'
import type { Challenge, LanguageBundle, Level } from '../content/types'
import { migrateLanguageIds } from './idMigration'
import { migrateRenamedLevels } from './levelRenames'

/**
 * Progress is stored by challenge id. Ids are permanent (made from the challenge's title;
 * see scripts/curriculum-ids.mjs), but a challenge can still be rewritten under the same
 * title, and a saved "done" mark or draft would then belong to the old version. So each challenge's
 * progress remembers a fingerprint of the challenge (its title and how it is checked),
 * and progress for a challenge whose fingerprint has changed is dropped, unless the
 * content lists the old fingerprint in `acceptedFingerprints` (a fixed check). A passed quiz
 * is kept, so rewritten content never locks a learner out of later lessons.
 */

/** Marks this browser's progress for a course as fingerprinted (see reconcileLanguageProgress). */
export function progressFormatKey(languageId: string): string {
  return STORES.progressFormat.keyFor(languageId)
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
  const id = progressId(languageId, level.id)
  if (!STORES.progress.get(id)) return false
  const prev = loadProgress(languageId, level.id)
  const stamps = prev.challengeVersions ?? {}
  const stale = new Set<string>()
  const versions: Record<string, string> = {}
  for (const ch of level.challenges) {
    const fingerprint = challengeFingerprint(ch)
    versions[ch.id] = fingerprint
    const stamp = stamps[ch.id]
    // A fingerprint listed in acceptedFingerprints is an earlier version whose checks were
    // fixed rather than rewritten, so progress made against it still counts.
    const outdated =
      stamp === undefined
        ? !trustUnstamped
        : stamp !== fingerprint && !(ch.acceptedFingerprints ?? []).includes(stamp)
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
  // The lesson tells the learner once why their earlier answers are gone.
  if (stale.size > 0) next.challengesReset = (prev.challengesReset ?? 0) + stale.size
  if (!STORES.progress.set(id, JSON.stringify(next))) return false
  return stale.size > 0
}

/**
 * Checks every level of a course. The first time this runs in a browser, progress
 * saved by older versions of the app (which has no fingerprints) is treated as out
 * of date; after that, progress saved without a fingerprint is new and is trusted.
 * Returns true when any challenge progress was dropped.
 */
export function reconcileLanguageProgress(languageId: string, bundle: LanguageBundle): boolean {
  const trustUnstamped = STORES.progressFormat.get(languageId) === PROGRESS_FORMAT
  // Progress saved under a lesson's former id moves to its current id first, then
  // progress saved under the old position-based ids moves to the permanent ids.
  migrateRenamedLevels(languageId, bundle)
  let dropped = migrateLanguageIds(languageId, bundle, challengeFingerprint)
  for (const { file } of bundle.sections) {
    for (const level of file.levels) {
      if (reconcileLevelProgress(languageId, level, trustUnstamped)) dropped = true
    }
  }
  STORES.progressFormat.set(languageId, PROGRESS_FORMAT)
  return dropped
}
