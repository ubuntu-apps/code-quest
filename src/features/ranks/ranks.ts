import type { LanguageBundle } from '../curriculum/types'
import { isSectionFinished } from '../certificate/courseCompletion'

/**
 * Ranks: a title for how far a learner has come in one course, shown next to the
 * course's name. Everyone starts as a Novice; finishing sections (every quiz passed, or
 * the skip-ahead quiz, the same as for a section's certificate) earns the next rank.
 *
 * In a 10-section course the ranks come at 3, 6 and 9 sections, and Legend at all 10.
 * Courses of other sizes use the same shares of their sections.
 */
export type RankId = 'novice' | 'squire' | 'knight' | 'champion' | 'legend'

export interface RankDef {
  id: RankId
  title: string
  /** The share of the course's sections to finish for this rank (0 for the first). */
  share: number
}

export const RANKS: readonly RankDef[] = [
  { id: 'novice', title: 'Novice', share: 0 },
  { id: 'squire', title: 'Squire', share: 0.3 },
  { id: 'knight', title: 'Knight', share: 0.6 },
  { id: 'champion', title: 'Champion', share: 0.9 },
  { id: 'legend', title: 'Legend', share: 1 },
]

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

/** "Finish 2 more sections to become a Knight", or null at the top rank. */
export function nextRankHint(rank: CourseRank): string | null {
  if (!rank.next) return null
  const left = rank.next.at - rank.finished
  return `Finish ${left} more section${left === 1 ? '' : 's'} to become a ${rank.next.rank.title}`
}

/** The rank a rank badge stands for (its id is `rank:<course>:<rank>`), or null. */
export function rankFromBadgeId(badgeId: string): RankDef | null {
  const id = badgeId.split(':')[2]
  return RANKS.find((r) => r.id === id) ?? null
}
