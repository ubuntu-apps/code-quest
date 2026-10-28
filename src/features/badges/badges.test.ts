import { describe, expect, it } from 'vitest'
import { badgeShownForCourse, renameOldRankBadges, type EarnedBadge } from './badges'

const badge = (id: string, title: string, kind: EarnedBadge['kind'] = 'rank'): EarnedBadge => ({
  id,
  kind,
  title,
  on: '2026-10-26T12:00:00.000Z',
})

describe('rank badges under the first rank names', () => {
  it('move to the rank in the same place, keeping when they were earned', () => {
    const out = renameOldRankBadges({
      'rank:sql:squire': badge('rank:sql:squire', 'SQL Squire'),
      'rank:python:knight': badge('rank:python:knight', 'Python Knight'),
    })
    expect(Object.keys(out).sort()).toEqual(['rank:python:engineer', 'rank:sql:builder'])
    expect(out['rank:sql:builder'].title).toBe('SQL Builder')
    expect(out['rank:python:engineer'].title).toBe('Python Engineer')
    expect(out['rank:sql:builder'].on).toBe('2026-10-26T12:00:00.000Z')
  })

  it('leave every other badge alone', () => {
    const others = {
      'section:sql:joins': badge('section:sql:joins', 'Joining tables', 'section'),
      'rank:sql:wizard': badge('rank:sql:wizard', 'SQL Wizard'),
    }
    expect(renameOldRankBadges(others)).toEqual(others)
  })
})

describe('badges on a course\'s Home', () => {
  it('show that course\'s badges and the ones for every course', () => {
    expect(badgeShownForCourse({ id: 'first-quiz:sql', kind: 'start' }, 'sql')).toBe(true)
    expect(badgeShownForCourse({ id: 'first-quiz:sql', kind: 'start' }, 'python')).toBe(false)
    expect(badgeShownForCourse({ id: 'rank:sql:builder', kind: 'rank' }, 'python')).toBe(false)
    expect(badgeShownForCourse({ id: 'streak:7', kind: 'streak' }, 'python')).toBe(true)
    expect(badgeShownForCourse({ id: 'xp:100', kind: 'xp' }, 'python')).toBe(true)
    expect(badgeShownForCourse({ id: 'section:sql:joins', kind: 'section' }, null)).toBe(true)
  })
})
