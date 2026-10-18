import { useEffect, useMemo, useSyncExternalStore } from 'react'
import type { LanguageBundle } from '../curriculum/types'
import { loadStreakState } from '../curriculum/streak'
import {
  badgeDefinitions,
  badgesSnapshot,
  loadEarnedBadges,
  recordNewBadges,
  subscribeBadges,
  type BadgeDef,
  type BadgeKind,
  type EarnedBadge,
} from './badges'

const KIND_ORDER: BadgeKind[] = ['start', 'section', 'course', 'streak', 'xp']

interface UseBadgesOptions {
  progressVersion: number
  /** The course being learned, once loaded. */
  languageId: string | null
  bundle: LanguageBundle | null
  totalXp: number
  /** Called with badges earned just now. */
  onEarned: (badges: EarnedBadge[]) => void
}

/**
 * The learner's badges: saved as they are earned (with a pop-up), and the ones still
 * to earn for the course being learned. Checked again whenever progress changes.
 */
export function useBadges({ progressVersion, languageId, bundle, totalXp, onEarned }: UseBadgesOptions) {
  const defs = useMemo((): BadgeDef[] => {
    void progressVersion
    if (!languageId || !bundle) return []
    const streak = loadStreakState()
    return badgeDefinitions({
      languageId,
      bundle,
      totalXp,
      bestStreak: Math.max(streak.best ?? 0, streak.count),
    })
  }, [progressVersion, languageId, bundle, totalXp])

  const snapshot = useSyncExternalStore(subscribeBadges, badgesSnapshot, () => '')
  const saved = useMemo(() => {
    void snapshot
    return loadEarnedBadges() ?? {}
  }, [snapshot])

  useEffect(() => {
    // Wait for the course: without it, section badges would look new on the next load.
    if (defs.length === 0) return
    const fresh = recordNewBadges(defs)
    if (fresh.length > 0) onEarned(fresh)
  }, [defs, onEarned])

  // Oldest first; badges earned together keep the course order (first quiz, sections, …).
  const earned = useMemo(
    () =>
      Object.values(saved).sort(
        (a, b) => a.on.localeCompare(b.on) || KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind),
      ),
    [saved],
  )
  const toEarn = useMemo(() => defs.filter((d) => !d.earned && !saved[d.id]), [defs, saved])

  return { earned, toEarn }
}
