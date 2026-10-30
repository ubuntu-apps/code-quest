import { describe, expect, it } from 'vitest'
import { nextRankHint, rankFor, rankFromBadgeId, rankThresholds } from './ranks'

describe('ranks', () => {
  it('come every three sections of ten, with Wizard for all ten', () => {
    expect(rankThresholds(10)).toEqual([0, 3, 6, 9, 10])
  })

  it('scale with the size of the course, and never need more than all of it', () => {
    expect(rankThresholds(15)).toEqual([0, 5, 9, 14, 15])
    expect(rankThresholds(3)).toEqual([0, 1, 2, 3, 3])
  })

  it('start as a Tinkerer and move up as sections are finished', () => {
    expect(rankFor(0, 10).rank.title).toBe('Tinkerer')
    expect(rankFor(2, 10).rank.title).toBe('Tinkerer')
    expect(rankFor(3, 10).rank.title).toBe('Builder')
    expect(rankFor(8, 10).rank.title).toBe('Engineer')
    expect(rankFor(9, 10).rank.title).toBe('Architect')
    expect(rankFor(10, 10).rank.title).toBe('Wizard')
  })

  it('say what the next rank takes', () => {
    expect(nextRankHint(rankFor(1, 10))).toBe('Finish 2 more quests to become a Builder')
    expect(nextRankHint(rankFor(9, 10))).toBe('Finish 1 more quest to become a Wizard')
    expect(nextRankHint(rankFor(4, 10))).toBe('Finish 2 more quests to become an Engineer')
    expect(nextRankHint(rankFor(10, 10))).toBeNull()
  })

  it('stay a Tinkerer in a course with no sections', () => {
    expect(rankFor(0, 0).rank.title).toBe('Tinkerer')
  })

  it('read the rank from a rank badge id', () => {
    expect(rankFromBadgeId('rank:sql:engineer')?.title).toBe('Engineer')
    expect(rankFromBadgeId('section:sql:joins')).toBeNull()
  })
})
