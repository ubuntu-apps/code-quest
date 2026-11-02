import type { Challenge, LanguageBundle, Level } from '../content/types'
import { STORES } from '../../../lib/stores'
import { loadProgress, progressId, type LevelProgress } from './progressStorage'
import type { ReviewState } from '../../review/reviewStorage'

/**
 * Challenges and quiz questions used to be numbered by their position in a lesson
 * (`lists_ch3`, `lists_q3`). They now have permanent ids made from their title or prompt
 * (scripts/curriculum-ids.mjs). This moves progress saved under the old ids over, once:
 *
 * - A challenge with a saved fingerprint (progressFingerprint.ts) goes to the current
 *   challenge with the same fingerprint, wherever it is now. That is exact, even across
 *   lessons that were reordered since the progress was saved.
 * - A challenge without a fingerprint goes to the challenge now in its old position; the
 *   fingerprint check that runs next still decides whether to trust it.
 * - Review history for a quiz question goes to the question now in its old position.
 *
 * It only acts on ids in the old format, so running it again does nothing.
 */

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** The 1-based position in an old id such as `lists_ch3`, or null for any other id. */
function oldPosition(levelId: string, kind: 'ch' | 'q', id: string): number | null {
  const m = new RegExp(`^${escapeRegExp(levelId)}_${kind}(\\d+)$`).exec(id)
  return m ? Number(m[1]) : null
}

function hasOldIds(levelId: string, p: LevelProgress): boolean {
  const ids = [
    ...p.challengesCompleted,
    ...(p.answersViewed ?? []),
    ...Object.keys(p.challengeAnswers ?? {}),
    ...Object.keys(p.challengeVersions ?? {}),
  ]
  return ids.some((id) => oldPosition(levelId, 'ch', id) !== null)
}

/**
 * Moves one lesson's saved challenge progress to the new ids. Returns the number of
 * challenges whose progress couldn't be matched and was dropped (0 when nothing changed).
 */
export function migrateLevelIds(
  languageId: string,
  level: Level,
  fingerprint: (challenge: Challenge) => string,
): number {
  const id = progressId(languageId, level.id)
  if (!STORES.progress.get(id)) return 0
  const prev = loadProgress(languageId, level.id)
  if (!hasOldIds(level.id, prev)) return 0

  // Fingerprints shared by two challenges can't say which one is meant, so they aren't used.
  const byFingerprint = new Map<string, string | null>()
  for (const ch of level.challenges) {
    const fp = fingerprint(ch)
    byFingerprint.set(fp, byFingerprint.has(fp) ? null : ch.id)
  }
  const stamps = prev.challengeVersions ?? {}
  const newId = (id: string): string | null => {
    const position = oldPosition(level.id, 'ch', id)
    if (position === null) return id
    const stamp = stamps[id]
    if (stamp !== undefined) return byFingerprint.get(stamp) ?? null
    return level.challenges[position - 1]?.id ?? null
  }

  const dropped = new Set<string>()
  const rename = (ids: string[]): string[] => {
    const out: string[] = []
    for (const id of ids) {
      const next = newId(id)
      if (next === null) dropped.add(id)
      else if (!out.includes(next)) out.push(next)
    }
    return out
  }

  const answers: Record<string, string> = {}
  for (const [id, answer] of Object.entries(prev.challengeAnswers ?? {})) {
    const next = newId(id)
    if (next === null) dropped.add(id)
    else answers[next] = answer
  }
  const versions: Record<string, string> = {}
  for (const [id, stamp] of Object.entries(stamps)) {
    const next = newId(id)
    if (next !== null) versions[next] = stamp
  }

  const next: LevelProgress = {
    ...prev,
    challengesCompleted: rename(prev.challengesCompleted),
    challengeAnswers: answers,
    challengeVersions: versions,
  }
  if (prev.answersViewed) next.answersViewed = rename(prev.answersViewed)
  if (dropped.size > 0) next.challengesReset = (prev.challengesReset ?? 0) + dropped.size
  if (!STORES.progress.set(id, JSON.stringify(next))) return 0
  return dropped.size
}

/** Moves a course's review history (spaced review of quiz questions) to the new ids. */
export function migrateReviewIds(languageId: string, bundle: LanguageBundle): boolean {
  let state: ReviewState
  try {
    const raw = STORES.review.get(languageId)
    if (!raw) return false
    state = JSON.parse(raw) as ReviewState
  } catch {
    return false
  }
  if (!state || typeof state.items !== 'object' || state.items === null) return false

  const newIds = new Map<string, string>()
  const current = new Set<string>()
  for (const { file } of bundle.sections) {
    for (const level of file.levels) {
      level.test.questions.forEach((q, i) => {
        newIds.set(`${level.id}_q${i + 1}`, q.id)
        current.add(q.id)
      })
    }
  }
  const isOld = (id: string) => /_q\d+$/.test(id) && !current.has(id)
  const ids = [...Object.keys(state.items), ...(state.session?.ids ?? [])]
  if (!ids.some(isOld)) return false

  const items: ReviewState['items'] = {}
  for (const [id, item] of Object.entries(state.items)) {
    // A question that no longer exists is left out; review only shows current questions anyway.
    const next = isOld(id) ? newIds.get(id) : id
    if (next) items[next] = item
  }
  const next: ReviewState = { ...state, items }
  if (state.session) {
    next.session = {
      ...state.session,
      ids: state.session.ids.map((id) => (isOld(id) ? newIds.get(id) : id)).filter((id): id is string => Boolean(id)),
    }
  }
  return STORES.review.set(languageId, JSON.stringify(next))
}

/**
 * Moves a course's progress and review history to the new ids. Returns true when some
 * challenge progress couldn't be matched and was dropped.
 */
export function migrateLanguageIds(
  languageId: string,
  bundle: LanguageBundle,
  fingerprint: (challenge: Challenge) => string,
): boolean {
  let dropped = 0
  for (const { file } of bundle.sections) {
    for (const level of file.levels) dropped += migrateLevelIds(languageId, level, fingerprint)
  }
  migrateReviewIds(languageId, bundle)
  return dropped > 0
}
