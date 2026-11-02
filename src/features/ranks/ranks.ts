import type { LanguageBundle } from '../curriculum/content/types'
import { isSectionFinished } from '../certificate/courseCompletion'

/**
 * Ranks: a title for how far a learner has come in one course, shown next to the
 * course's name: a coder's ladder from Tinkerer to Wizard. Everyone starts as a
 * Tinkerer; finishing sections (every quiz passed, or
 * the skip-ahead quiz, the same as for a section's certificate) earns the next rank.
 *
 * In a 10-section course the ranks come at 3, 6 and 9 sections, and Wizard at all 10.
 * Courses of other sizes use the same shares of their sections.
 */
export type RankId = 'tinkerer' | 'builder' | 'engineer' | 'architect' | 'wizard'

export interface RankDef {
  id: RankId
  title: string
  /** The share of the course's sections to finish for this rank (0 for the first). */
  share: number
}

export const RANKS: readonly RankDef[] = [
  { id: 'tinkerer', title: 'Tinkerer', share: 0 },
  { id: 'builder', title: 'Builder', share: 0.3 },
  { id: 'engineer', title: 'Engineer', share: 0.6 },
  { id: 'architect', title: 'Architect', share: 0.9 },
  { id: 'wizard', title: 'Wizard', share: 1 },
]

/**
 * The first ranks were Novice, Squire, Knight, Champion and Legend. Rank badges saved
 * under those names move to the rank in the same place (badges.ts).
 */
export const OLD_RANK_IDS: Readonly<Record<string, RankId>> = {
  squire: 'builder',
  knight: 'engineer',
  champion: 'architect',
  legend: 'wizard',
}

/**
 * The number of finished sections each rank needs in a course of `total` sections, in
 * rank order: [0, 3, 6, 9, 10] for 10 sections. Each rank needs at least one more
 * section than the one before, but never more than the whole course.
 */
export function rankThresholds(total: number): number[] {
  const out: number[] = []
  for (const [i, rank] of RANKS.entries()) {
    if (i === 0) {
      out.push(0)
      continue
    }
    const wanted = i === RANKS.length - 1 ? total : Math.round(total * rank.share)
    out.push(Math.min(total, Math.max(wanted, out[i - 1] + 1)))
  }
  return out
}

export interface CourseRank {
  rank: RankDef
  /** Finished sections, and how many the course has. */
  finished: number
  total: number
  /** The next rank and the number of finished sections it needs (null at the top). */
  next: { rank: RankDef; at: number } | null
}

/** The rank for `finished` sections out of `total`. */
export function rankFor(finished: number, total: number): CourseRank {
  const thresholds = rankThresholds(total)
  let index = 0
  for (let i = 0; i < RANKS.length; i += 1) {
    if (total > 0 && finished >= thresholds[i]) index = i
  }
  const nextIndex = index + 1
  return {
    rank: RANKS[index],
    finished,
    total,
    next: nextIndex < RANKS.length ? { rank: RANKS[nextIndex], at: thresholds[nextIndex] } : null,
  }
}

/** The learner's rank in a course, from the sections finished on this device. */
export function courseRank(languageId: string, bundle: LanguageBundle): CourseRank {
  const finished = bundle.sections.filter(({ sectionRef, file }) =>
    isSectionFinished(languageId, sectionRef.id, file.levels),
  ).length
  return rankFor(finished, bundle.sections.length)
}

/** "Finish 2 more sections to become an Engineer", or null at the top rank. */
export function nextRankHint(rank: CourseRank): string | null {
  if (!rank.next) return null
  const left = rank.next.at - rank.finished
  const title = rank.next.rank.title
  return `Finish ${left} more quest${left === 1 ? '' : 's'} to become ${/^[AEIOU]/.test(title) ? 'an' : 'a'} ${title}`
}

/** The rank a rank badge stands for (its id is `rank:<course>:<rank>`), or null. */
export function rankFromBadgeId(badgeId: string): RankDef | null {
  const id = badgeId.split(':')[2]
  return RANKS.find((r) => r.id === id) ?? null
}
