import { beforeEach, describe, expect, it } from 'vitest'
import { STREAK_STORAGE_KEY } from './constants'
import { currentStreak, loadStreakState, localDateKey, recordDailyActivity } from './helpers'

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
    localStorage.removeItem(STREAK_STORAGE_KEY)
  })

  it('counts consecutive local evenings as a growing streak', () => {
    expect(recordDailyActivity(new Date(2026, 9, 16, 21, 0))).toBe(1)
    expect(recordDailyActivity(new Date(2026, 9, 17, 19, 0))).toBe(2)
    expect(loadStreakState()).toEqual({ lastDate: '2026-10-17', count: 2 })
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
