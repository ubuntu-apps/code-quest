import { beforeEach, describe, expect, it } from 'vitest'
import type { Challenge, LanguageBundle, Level } from './types'
import {
  challengeFingerprint,
  progressFormatKey,
  reconcileLanguageProgress,
} from './progressFingerprint'
import { loadProgress, saveProgress } from './progressStorage'

function challenge(id: string, expected: string): Challenge {
  return { id, title: `Challenge ${id}`, promptMarkdown: '', validation: { mode: 'equalsNormalized', expected } }
}

function level(challenges: Challenge[]): Level {
  return { id: 'l1', title: 'One', intro: { bodyMarkdown: '' }, challenges, test: { questions: [] } }
}

function bundle(lvl: Level): LanguageBundle {
  return {
    index: { id: 'python', title: 'Python', sections: [{ id: 's1', title: 'S', path: 's1.json' }] },
    sections: [{ sectionRef: { id: 's1', title: 'S', path: 's1.json' }, file: { sectionId: 's1', levels: [lvl] } }],
  }
}

describe('progress fingerprints', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('gives the same fingerprint for the same challenge and a new one when its checks change', () => {
    expect(challengeFingerprint(challenge('c1', 'a'))).toBe(challengeFingerprint(challenge('c1', 'a')))
    expect(challengeFingerprint(challenge('c1', 'a'))).not.toBe(challengeFingerprint(challenge('c1', 'b')))
  })

  it('drops old progress saved before fingerprints, but keeps a passed quiz', () => {
    saveProgress('python', 'l1', {
      challengesCompleted: ['c1'],
      testPassed: true,
      challengeAnswers: { c1: 'old answer' },
      answersViewed: ['c1'],
    })
    expect(reconcileLanguageProgress('python', bundle(level([challenge('c1', 'a')])))).toBe(true)
    const p = loadProgress('python', 'l1')
    expect(p.challengesCompleted).toEqual([])
    expect(p.challengeAnswers).toEqual({})
    expect(p.answersViewed).toEqual([])
    expect(p.testPassed).toBe(true)
    expect(localStorage.getItem(progressFormatKey('python'))).toBe('2')
  })

  it('keeps progress for unchanged challenges and drops it for changed ones', () => {
    localStorage.setItem(progressFormatKey('python'), '2')
    const before = level([challenge('c1', 'a'), challenge('c2', 'b')])
    saveProgress('python', 'l1', { challengesCompleted: ['c1', 'c2'], testPassed: false, challengeAnswers: {} })
    expect(reconcileLanguageProgress('python', bundle(before))).toBe(false)
    expect(loadProgress('python', 'l1').challengesCompleted).toEqual(['c1', 'c2'])

    const after = level([challenge('c1', 'a'), challenge('c2', 'changed')])
    expect(reconcileLanguageProgress('python', bundle(after))).toBe(true)
    expect(loadProgress('python', 'l1').challengesCompleted).toEqual(['c1'])
  })
})
