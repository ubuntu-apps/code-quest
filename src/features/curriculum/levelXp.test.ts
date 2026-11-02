import { beforeEach, describe, expect, it } from 'vitest'
import { computeLevelXp } from './helpers'
import { saveProgress } from './progress/progressStorage'
import type { Level } from './content/types'

const level: Level = {
  id: 'lvl',
  title: 'Level',
  intro: { bodyMarkdown: '' },
  challenges: ['a', 'b'].map((id) => ({
    id,
    title: id,
    promptMarkdown: '',
    validation: { mode: 'equalsNormalized' as const, expected: 'x' },
  })),
  test: { questions: [] },
}

describe('computeLevelXp', () => {
  beforeEach(() => localStorage.clear())

  it('gives full XP for challenges solved without the answer', () => {
    saveProgress('python', 'lvl', { challengesCompleted: ['a', 'b'], testPassed: true })
    expect(computeLevelXp('python', level)).toBe(10 + 10 + 50)
  })

  it('gives reduced XP for challenges solved after viewing the answer', () => {
    saveProgress('python', 'lvl', {
      challengesCompleted: ['a', 'b'],
      testPassed: false,
      answersViewed: ['b'],
    })
    expect(computeLevelXp('python', level)).toBe(10 + 5)
  })

  it('does not count a viewed answer until the challenge is solved', () => {
    saveProgress('python', 'lvl', { challengesCompleted: ['a'], testPassed: false, answersViewed: ['b'] })
    expect(computeLevelXp('python', level)).toBe(10)
  })
})

describe('stale challenge IDs', () => {
  beforeEach(() => localStorage.clear())

  it('ignores completed IDs that are no longer in the level', () => {
    saveProgress('python', 'lvl', { challengesCompleted: ['a', 'old1', 'old2'], testPassed: false })
    expect(computeLevelXp('python', level)).toBe(10)
  })
})
