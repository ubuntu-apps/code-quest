import type { LanguageBundle } from '../curriculum/types'
import { loadProgress } from '../curriculum/progressStorage'
import { isSectionFinished } from '../certificate/courseCompletion'

export type BadgeKind = 'start' | 'section' | 'course' | 'streak' | 'xp'

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
 * section and the whole course (for the course being learned), streaks and XP.
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
  const anyQuizPassed = bundle.sections.some(({ file }) =>
    file.levels.some((lvl) => loadProgress(languageId, lvl.id).testPassed),
  )

  return [
    {
      id: `first-quiz:${languageId}`,
      kind: 'start',
      title: 'First quiz',
      description: `Pass your first ${course} quiz`,
      earned: anyQuizPassed,
    },
    ...sections.map(
      (sec): BadgeDef => ({
        id: `section:${languageId}:${sec.id}`,
        kind: 'section',
        title: sec.title,
        description: `Pass every quiz in ${sec.title}, or test out of it`,
        earned: sec.finished,
      }),
    ),
    {
      id: `course:${languageId}`,
      kind: 'course',
      title: `${course} complete`,
      description: `Finish every section of ${course}`,
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

/** Badges stay earned once earned (even if content changes later), so they are saved. */
export const BADGES_STORAGE_KEY = 'codequest:badges'

/** The saved badges, or null before badges were first worked out on this device. */
export function loadEarnedBadges(): Record<string, EarnedBadge> | null {
  try {
    const raw = localStorage.getItem(BADGES_STORAGE_KEY)
    if (raw === null) return null
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return parsed as Record<string, EarnedBadge>
  } catch {
    return null
  }
}

const BADGES_CHANGED_EVENT = 'codequest:badges-changed'

export function saveEarnedBadges(badges: Record<string, EarnedBadge>): void {
  try {
    localStorage.setItem(BADGES_STORAGE_KEY, JSON.stringify(badges))
  } catch {
    // Storage unavailable: badges are worked out again next time.
  }
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(BADGES_CHANGED_EVENT))
}

/** For useSyncExternalStore: the saved badges as stored (a string, so it compares cheaply). */
export function badgesSnapshot(): string {
  try {
    return localStorage.getItem(BADGES_STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

export function subscribeBadges(onChange: () => void): () => void {
  window.addEventListener(BADGES_CHANGED_EVENT, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(BADGES_CHANGED_EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
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
