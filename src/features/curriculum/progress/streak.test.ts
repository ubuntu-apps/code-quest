import { beforeEach, describe, expect, it } from 'vitest'
import { STORES } from '../../../lib/stores'
import { currentStreak, loadStreakState, localDateKey, recordDailyActivity } from '../helpers'
import { streakStatus } from './streak'

describe('localDateKey', () => {
  it('uses the local calendar day, not the UTC one', () => {
    // Late evening and early morning stay on the local day in every time zone
    // (toISOString() would roll these over to the UTC day west/east of UTC).
    expect(localDateKey(new Date(2026, 9, 16, 23, 30))).toBe('2026-10-16')
    expect(localDateKey(new Date(2026, 9, 16, 0, 30))).toBe('2026-10-16')
  })
})

describe('recordDailyActivity', () => {
  beforeEach(() => {
    localStorage.removeItem(STORES.streak.key)
  })

  it('counts consecutive local evenings as a growing streak', () => {
    expect(recordDailyActivity(new Date(2026, 9, 16, 21, 0))).toBe(1)
    expect(recordDailyActivity(new Date(2026, 9, 17, 19, 0))).toBe(2)
    expect(loadStreakState()).toEqual({ lastDate: '2026-10-17', count: 2, best: 2 })
  })

  it('does not double count two sessions on the same local day', () => {
    expect(recordDailyActivity(new Date(2026, 9, 16, 8, 0))).toBe(1)
    expect(recordDailyActivity(new Date(2026, 9, 16, 23, 30))).toBe(1)
  })

  it('resets after a missed day', () => {
    recordDailyActivity(new Date(2026, 9, 14, 12, 0))
    expect(recordDailyActivity(new Date(2026, 9, 16, 12, 0))).toBe(1)
  })

  it('keeps the streak across the end of daylight saving time', () => {
    // In the US, clocks fall back on 2026-11-01 (a 25-hour day).
    expect(recordDailyActivity(new Date(2026, 10, 1, 0, 30))).toBe(1)
    expect(recordDailyActivity(new Date(2026, 10, 2, 23, 30))).toBe(2)
  })
})

describe('currentStreak', () => {
  it('shows the streak while it is alive', () => {
    expect(currentStreak({ lastDate: '2026-10-16', count: 5 }, new Date(2026, 9, 16, 20))).toBe(5)
    expect(currentStreak({ lastDate: '2026-10-15', count: 5 }, new Date(2026, 9, 16, 8))).toBe(5)
  })

  it('shows 0 once a day has been missed', () => {
    expect(currentStreak({ lastDate: '2026-10-13', count: 5 }, new Date(2026, 9, 16))).toBe(0)
  })

  it('shows 0 with no activity yet', () => {
    expect(currentStreak({ lastDate: '', count: 0 }, new Date(2026, 9, 16))).toBe(0)
  })
})

describe('streak freezes', () => {
  beforeEach(() => {
    localStorage.removeItem(STORES.streak.key)
  })

  /** A streak of `days` days ending on 2026-10-`lastDay`. */
  function buildStreak(days: number, lastDay: number) {
    for (let i = days - 1; i >= 0; i -= 1) recordDailyActivity(new Date(2026, 9, lastDay - i, 18))
  }

  it('earns a freeze at 7 days in a row, up to 2', () => {
    buildStreak(6, 10)
    expect(loadStreakState().freezes ?? 0).toBe(0)
    recordDailyActivity(new Date(2026, 9, 11, 18))
    expect(loadStreakState().freezes).toBe(1)
    buildStreak(21, 31)
    expect(loadStreakState().freezes).toBe(2)
  })

  it('uses a freeze for a missed day and carries the streak on', () => {
    buildStreak(7, 10)
    // 2026-10-11 missed.
    expect(currentStreak(loadStreakState(), new Date(2026, 9, 12, 8))).toBe(7)
    expect(recordDailyActivity(new Date(2026, 9, 12, 18))).toBe(8)
    const state = loadStreakState()
    expect(state.freezes ?? 0).toBe(0)
    expect(state.frozenDates).toEqual(['2026-10-11'])
  })

  it('resets when more days are missed than freezes cover', () => {
    buildStreak(7, 10)
    // 2026-10-11 and 2026-10-12 missed, one freeze held.
    expect(currentStreak(loadStreakState(), new Date(2026, 9, 13, 8))).toBe(0)
    expect(recordDailyActivity(new Date(2026, 9, 13, 18))).toBe(1)
    expect(loadStreakState().best).toBe(7)
  })

  it('says when the streak needs today\'s activity', () => {
    buildStreak(3, 10)
    expect(streakStatus(loadStreakState(), new Date(2026, 9, 10, 20)).atRisk).toBe(false)
    expect(streakStatus(loadStreakState(), new Date(2026, 9, 11, 9)).atRisk).toBe(true)
    expect(streakStatus(loadStreakState(), new Date(2026, 9, 12, 9)).count).toBe(0)
  })
})
