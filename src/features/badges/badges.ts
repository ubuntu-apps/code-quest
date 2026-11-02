import { STORES } from '../../lib/stores'
import type { LanguageBundle } from '../curriculum/content/types'
import { loadProgress } from '../curriculum/progress/progressStorage'
import { isSectionFinished } from '../certificate/courseCompletion'
import { OLD_RANK_IDS, RANKS, rankThresholds } from '../ranks/ranks'

export type BadgeKind = 'start' | 'section' | 'course' | 'rank' | 'streak' | 'xp'

export interface BadgeDef {
  id: string
  kind: BadgeKind
  title: string
  /** How to earn it. */
  description: string
  earned: boolean
}

export interface EarnedBadge {
  id: string
  kind: BadgeKind
  title: string
  /** When it was earned (ISO date and time). */
  on: string
}

export const STREAK_BADGE_DAYS = [3, 7, 30, 100]
export const XP_BADGE_AMOUNTS = [100, 1000, 5000]

/**
 * Every badge the learner can earn now, and whether it is earned: the first quiz, each
 * section, each rank (ranks/ranks.ts) and the whole course (for the course being
 * learned), streaks and XP.
 */
export function badgeDefinitions({
  languageId,
  bundle,
  totalXp,
  bestStreak,
}: {
  languageId: string
  bundle: LanguageBundle
  totalXp: number
  bestStreak: number
}): BadgeDef[] {
  const course = bundle.index.title
  const sections = bundle.sections.map(({ sectionRef, file }) => ({
    id: sectionRef.id,
    title: sectionRef.title,
    finished: isSectionFinished(languageId, sectionRef.id, file.levels),
  }))
  const finishedCount = sections.filter((sec) => sec.finished).length
  const thresholds = rankThresholds(sections.length)
  const anyQuizPassed = bundle.sections.some(({ file }) =>
    file.levels.some((lvl) => loadProgress(languageId, lvl.id).testPassed),
  )

  return [
    {
      id: `first-quiz:${languageId}`,
      kind: 'start',
      title: 'First gate',
      description: `Clear your first ${course} gate`,
      earned: anyQuizPassed,
    },
    ...sections.map(
      (sec): BadgeDef => ({
        id: `section:${languageId}:${sec.id}`,
        kind: 'section',
        title: sec.title,
        description: `Clear every gate in ${sec.title}, or its skip-ahead gate`,
        earned: sec.finished,
      }),
    ),
    ...RANKS.slice(1).map(
      (rank, i): BadgeDef => ({
        id: `rank:${languageId}:${rank.id}`,
        kind: 'rank',
        title: `${course} ${rank.title}`,
        description: `Finish ${thresholds[i + 1]} quest${thresholds[i + 1] === 1 ? '' : 's'} of ${course}`,
        earned: sections.length > 0 && finishedCount >= thresholds[i + 1],
      }),
    ),
    {
      id: `course:${languageId}`,
      kind: 'course',
      title: `${course} complete`,
      description: `Finish every quest of ${course}`,
      earned: sections.length > 0 && sections.every((sec) => sec.finished),
    },
    ...STREAK_BADGE_DAYS.map(
      (days): BadgeDef => ({
        id: `streak:${days}`,
        kind: 'streak',
        title: `${days}-day streak`,
        description: `Learn ${days} days in a row`,
        earned: bestStreak >= days,
      }),
    ),
    ...XP_BADGE_AMOUNTS.map(
      (xp): BadgeDef => ({
        id: `xp:${xp}`,
        kind: 'xp',
        title: `${xp.toLocaleString('en-US')} XP`,
        description: `Earn ${xp.toLocaleString('en-US')} XP`,
        earned: totalXp >= xp,
      }),
    ),
  ]
}

/**
 * Whether a saved badge belongs on the page for `languageId`: badges for a course's quizzes,
 * sections and ranks (their id holds the course: `section:sql:joins`) only there, and
 * streak and XP badges everywhere.
 */
export function badgeShownForCourse(badge: Pick<EarnedBadge, 'id' | 'kind'>, languageId: string | null): boolean {
  if (!languageId || badge.kind === 'streak' || badge.kind === 'xp') return true
  return badge.id.split(':')[1] === languageId
}

/** Badges stay earned once earned (even if content changes later), so they are saved. */

/**
 * Rank badges saved under the first rank names (`rank:sql:knight`, "SQL Knight") get the
 * id and title of the rank now in that place (`rank:sql:engineer`, "SQL Engineer"), keeping
 * the date they were earned. The next save stores them that way.
 */
export function renameOldRankBadges(badges: Record<string, EarnedBadge>): Record<string, EarnedBadge> {
  const out: Record<string, EarnedBadge> = {}
  for (const badge of Object.values(badges)) {
    const [kind, course, rankId] = badge.id.split(':')
    const renamed = kind === 'rank' ? OLD_RANK_IDS[rankId] : undefined
    const rank = renamed ? RANKS.find((r) => r.id === renamed) : undefined
    if (!rank) {
      out[badge.id] = out[badge.id] ?? badge
      continue
    }
    const id = `rank:${course}:${rank.id}`
    // "SQL Knight" → "SQL Engineer": the course's name is everything before the rank.
    const courseTitle = badge.title.replace(/\s*\S+$/, '')
    out[id] = out[id] ?? { ...badge, id, title: courseTitle ? `${courseTitle} ${rank.title}` : rank.title }
  }
  return out
}

/** The saved badges, or null before badges were first worked out on this device. */
export function loadEarnedBadges(): Record<string, EarnedBadge> | null {
  try {
    const raw = STORES.badges.get()
    if (raw === '') return null
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return renameOldRankBadges(parsed as Record<string, EarnedBadge>)
  } catch {
    return null
  }
}

export function saveEarnedBadges(badges: Record<string, EarnedBadge>): void {
  STORES.badges.set(JSON.stringify(badges))
}

/** For useSyncExternalStore: the saved badges as stored (a string, so it compares cheaply). */
export function badgesSnapshot(): string {
  return STORES.badges.get()
}

export function subscribeBadges(onChange: () => void): () => void {
  return STORES.badges.subscribe(onChange)
}

/**
 * Saves badges that are earned now but weren't saved yet, and returns them. The very
 * first time (nothing saved), everything already earned is saved quietly, so existing
 * learners don't get a pile of "badge earned" pop-ups.
 */
export function recordNewBadges(defs: BadgeDef[], now = new Date()): EarnedBadge[] {
  const saved = loadEarnedBadges()
  const earnedNow = defs.filter((d) => d.earned)
  const fresh = earnedNow.filter((d) => !saved?.[d.id])
  if (fresh.length === 0 && saved !== null) return []
  const next: Record<string, EarnedBadge> = { ...(saved ?? {}) }
  const added = fresh.map((d): EarnedBadge => ({ id: d.id, kind: d.kind, title: d.title, on: now.toISOString() }))
  for (const badge of added) next[badge.id] = badge
  saveEarnedBadges(next)
  return saved === null ? [] : added
}
