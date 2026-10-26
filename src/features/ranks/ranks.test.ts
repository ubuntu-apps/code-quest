import { describe, expect, it } from 'vitest'
import { nextRankHint, rankFor, rankFromBadgeId, rankThresholds } from './ranks'

describe('ranks', () => {
  it('come every three sections of ten, with Legend for all ten', () => {
    expect(rankThresholds(10)).toEqual([0, 3, 6, 9, 10])
  })

  it('scale with the size of the course, and never need more than all of it', () => {
    expect(rankThresholds(15)).toEqual([0, 5, 9, 14, 15])
    expect(rankThresholds(3)).toEqual([0, 1, 2, 3, 3])
  })

  it('start at Novice and move up as sections are finished', () => {
    expect(rankFor(0, 10).rank.title).toBe('Novice')
    expect(rankFor(2, 10).rank.title).toBe('Novice')
    expect(rankFor(3, 10).rank.title).toBe('Squire')
    expect(rankFor(8, 10).rank.title).toBe('Knight')
    expect(rankFor(9, 10).rank.title).toBe('Champion')
    expect(rankFor(10, 10).rank.title).toBe('Legend')
  })

  it('say what the next rank takes', () => {
    expect(nextRankHint(rankFor(1, 10))).toBe('Finish 2 more sections to become a Squire')
    expect(nextRankHint(rankFor(9, 10))).toBe('Finish 1 more section to become a Legend')
    expect(nextRankHint(rankFor(10, 10))).toBeNull()
  })

  it('stay at Novice in a course with no sections', () => {
    expect(rankFor(0, 0).rank.title).toBe('Novice')
  })

  it('read the rank from a rank badge id', () => {
    expect(rankFromBadgeId('rank:sql:knight')?.title).toBe('Knight')
    expect(rankFromBadgeId('section:sql:joins')).toBeNull()
  })
})
