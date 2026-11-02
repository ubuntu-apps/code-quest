import type { LanguageBundle, Level } from '../content/types'
import { STORES } from '../../../lib/stores'
import { loadProgress, progressId, type LevelProgress } from './progressStorage'
import type { ReviewState } from '../../review/reviewStorage'

/**
 * Saved progress is keyed by lesson id (`codequest:progress:python:first_program`), and
 * challenge and question ids start with the lesson id (`first_program-hello`,
 * `first_program-q-1x2y3z`). When a lesson is renamed, its content lists the old id in
 * `formerIds`, and this moves everything saved under the old id to the new one: the
 * lesson's progress, its review history and the home page's Continue target.
 *
 * `scripts/check-lesson-ids.mjs` makes sure a published lesson id never disappears
 * without being listed here.
 */

/** `old-x` → `new-x`, and the older position-based `old_ch3` / `old_q3` → `new_ch3` / `new_q3`. */
export function renameItemId(id: string, oldLevelId: string, newLevelId: string): string {
  if (id.startsWith(`${oldLevelId}-`)) return newLevelId + id.slice(oldLevelId.length)
  if (new RegExp(`^${oldLevelId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}_(ch|q)\\d+$`).test(id)) {
    return newLevelId + id.slice(oldLevelId.length)
  }
  return id
}

function renameKeys<T>(record: Record<string, T> | undefined, rename: (id: string) => string): Record<string, T> {
  return Object.fromEntries(Object.entries(record ?? {}).map(([id, value]) => [rename(id), value]))
}

function union(a: string[], b: string[]): string[] {
  return [...new Set([...a, ...b])]
}

/** Moves one lesson's progress from `oldId` to `level.id`. Returns true when something moved. */
function moveLevelProgress(languageId: string, level: Level, oldId: string): boolean {
  const oldStoreId = progressId(languageId, oldId)
  const newStoreId = progressId(languageId, level.id)
  if (!STORES.progress.get(oldStoreId)) return false
  const rename = (id: string) => renameItemId(id, oldId, level.id)
  const moved = loadProgress(languageId, oldId)
  const current: LevelProgress | null = STORES.progress.get(newStoreId) ? loadProgress(languageId, level.id) : null
  const next: LevelProgress = {
    challengesCompleted: union(current?.challengesCompleted ?? [], moved.challengesCompleted.map(rename)),
    testPassed: Boolean(current?.testPassed) || moved.testPassed,
    // Answers typed under the new id are newer, so they win.
    challengeAnswers: { ...renameKeys(moved.challengeAnswers, rename), ...(current?.challengeAnswers ?? {}) },
  }
  const viewed = union(current?.answersViewed ?? [], (moved.answersViewed ?? []).map(rename))
  if (viewed.length > 0) next.answersViewed = viewed
  const versions = { ...renameKeys(moved.challengeVersions, rename), ...(current?.challengeVersions ?? {}) }
  if (Object.keys(versions).length > 0) next.challengeVersions = versions
  const reset = (current?.challengesReset ?? 0) + (moved.challengesReset ?? 0)
  if (reset > 0) next.challengesReset = reset
  if (!STORES.progress.set(newStoreId, JSON.stringify(next))) return false
  STORES.progress.remove(oldStoreId)
  return true
}

/** Renames review history entries (quiz question ids) for the renamed lessons. */
function moveReviewIds(languageId: string, renames: Map<string, string>): void {
  let state: ReviewState
  try {
    const raw = STORES.review.get(languageId)
    if (!raw) return
    state = JSON.parse(raw) as ReviewState
  } catch {
    return
  }
  if (!state || typeof state.items !== 'object' || state.items === null) return
  const rename = (id: string) => {
    for (const [oldId, newId] of renames) {
      const next = renameItemId(id, oldId, newId)
      if (next !== id) return next
    }
    return id
  }
  const ids = [...Object.keys(state.items), ...(state.session?.ids ?? [])]
  if (!ids.some((id) => rename(id) !== id)) return
  const next: ReviewState = { ...state, items: renameKeys(state.items, rename) }
  if (state.session) next.session = { ...state.session, ids: state.session.ids.map(rename) }
  STORES.review.set(languageId, JSON.stringify(next))
}

/** Points the home page's Continue button at the lesson's new id (and its section). */
function moveLastLevel(languageId: string, renames: Map<string, string>, sectionOf: Map<string, string>): void {
  try {
    const raw = STORES.lastLevel.get()
    if (!raw) return
    const target = JSON.parse(raw) as { languageId?: string; levelId?: string; sectionId?: string }
    if (target.languageId !== languageId || !target.levelId) return
    const newId = renames.get(target.levelId)
    if (!newId) return
    STORES.lastLevel.set(JSON.stringify({ ...target, levelId: newId, sectionId: sectionOf.get(newId) ?? target.sectionId }))
  } catch {
    // Unreadable or blocked storage: Continue falls back to the first open lesson.
  }
}

/**
 * Moves a course's progress saved under lessons' former ids to their current ids.
 * Returns true when anything moved.
 */
export function migrateRenamedLevels(languageId: string, bundle: LanguageBundle): boolean {
  const current = new Set<string>()
  const sectionOf = new Map<string, string>()
  for (const { file } of bundle.sections) {
    for (const level of file.levels) {
      current.add(level.id)
      sectionOf.set(level.id, file.sectionId)
    }
  }
  const renames = new Map<string, string>()
  let moved = false
  for (const { file } of bundle.sections) {
    for (const level of file.levels) {
      for (const oldId of level.formerIds ?? []) {
        // An id that is in use again belongs to that lesson now.
        if (oldId === level.id || current.has(oldId)) continue
        renames.set(oldId, level.id)
        if (moveLevelProgress(languageId, level, oldId)) moved = true
      }
    }
  }
  if (renames.size === 0) return false
  moveReviewIds(languageId, renames)
  moveLastLevel(languageId, renames, sectionOf)
  return moved
}
