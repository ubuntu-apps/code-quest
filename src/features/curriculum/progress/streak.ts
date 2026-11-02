import { STORES } from '../../../lib/stores'

/**
 * The daily streak: days in a row with a solved challenge or a passed quiz.
 *
 * Streak freezes: every 7 days in a row earns one (holding at most 2). A freeze is used
 * up automatically for each day that is missed, so the streak carries on instead of
 * starting again. Missed days don't add to the count.
 */
export type StreakState = {
  lastDate: string
  count: number
  /** The longest streak so far (for badges). */
  best?: number
  /** Streak freezes held. */
  freezes?: number
  /** Days that were covered by a freeze, most recent last (a few are kept). */
  frozenDates?: string[]
}

export const FREEZE_EVERY_DAYS = 7
export const MAX_FREEZES = 2
const KEEP_FROZEN_DATES = 7

/** Calendar day in the learner's own time zone (toISOString() would use UTC). */
export function localDateKey(d: Date): string {
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

function parseDateKey(key: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key)
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null
}

/** Whole calendar days from `from` to `to` (rounded, so DST's 23/25-hour days count as one). */
function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / 86_400_000)
}

/** Midnight at the start of `now`'s local day. */
function startOfDay(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

/** Days missed completely between the last active day and `now` (today itself isn't missed yet). */
function missedDays(state: StreakState, now: Date): number {
  const last = parseDateKey(state.lastDate)
  if (!last) return Infinity
  return Math.max(0, daysBetween(last, startOfDay(now)) - 1)
}

export function loadStreakState(): StreakState {
  try {
    const raw = STORES.streak.get()
    if (!raw) return { lastDate: '', count: 0 }
    const parsed = JSON.parse(raw) as Partial<StreakState>
    const state: StreakState = {
      lastDate: typeof parsed.lastDate === 'string' ? parsed.lastDate : '',
      count: typeof parsed.count === 'number' ? parsed.count : 0,
    }
    if (typeof parsed.best === 'number') state.best = parsed.best
    if (typeof parsed.freezes === 'number') state.freezes = parsed.freezes
    if (Array.isArray(parsed.frozenDates)) {
      state.frozenDates = parsed.frozenDates.filter((d): d is string => typeof d === 'string')
    }
    return state
  } catch {
    return { lastDate: '', count: 0 }
  }
}

/** Records today's activity and returns the streak count after it. */
export function recordDailyActivity(now: Date = new Date()): number {
  const today = localDateKey(now)
  const curr = loadStreakState()
  if (curr.lastDate === today) return curr.count

  const missed = missedDays(curr, now)
  const freezes = curr.freezes ?? 0
  let count: number
  let freezesLeft = freezes
  let frozenDates = curr.frozenDates ?? []
  if (missed === 0) {
    count = curr.count + 1
  } else if (missed <= freezes && curr.count > 0) {
    // Each missed day uses one freeze; the streak goes on from where it was.
    count = curr.count + 1
    freezesLeft = freezes - missed
    const last = parseDateKey(curr.lastDate) as Date
    for (let i = 1; i <= missed; i += 1) {
      frozenDates = [...frozenDates, localDateKey(new Date(last.getFullYear(), last.getMonth(), last.getDate() + i))]
    }
  } else {
    count = 1
  }
  // A freeze for every 7 days in a row, up to the maximum.
  if (count % FREEZE_EVERY_DAYS === 0) freezesLeft = Math.min(MAX_FREEZES, freezesLeft + 1)

  const next: StreakState = { lastDate: today, count, best: Math.max(curr.best ?? 0, curr.count, count) }
  if (freezesLeft > 0) next.freezes = freezesLeft
  if (frozenDates.length > 0) next.frozenDates = frozenDates.slice(-KEEP_FROZEN_DATES)
  STORES.streak.set(JSON.stringify(next))
  return count
}

/**
 * The streak to show today: the stored count while it is still alive (activity today
 * or yesterday, or missed days that the freezes held can cover), otherwise 0. The
 * stored count only resets on the next activity.
 */
export function currentStreak(state: StreakState, now: Date = new Date()): number {
  if (!state.lastDate || state.count === 0) return 0
  return missedDays(state, now) <= (state.freezes ?? 0) ? state.count : 0
}

export interface StreakStatus {
  count: number
  best: number
  freezes: number
  /** Alive, but nothing done yet today: today's activity keeps it going. */
  atRisk: boolean
  /** Days missed since the last activity that freezes will cover if the learner is active today. */
  coveredByFreeze: number
}

/** Everything the home page shows about the streak. */
export function streakStatus(state: StreakState, now: Date = new Date()): StreakStatus {
  const count = currentStreak(state, now)
  const alive = count > 0
  const missed = alive ? missedDays(state, now) : 0
  return {
    count,
    best: Math.max(state.best ?? 0, state.count),
    freezes: state.freezes ?? 0,
    atRisk: alive && state.lastDate !== localDateKey(now),
    coveredByFreeze: missed,
  }
}
