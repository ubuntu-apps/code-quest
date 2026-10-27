import { describe, expect, it } from 'vitest'
import { renameOldRankBadges, type EarnedBadge } from './badges'

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
