import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getProgressSnapshot,
  loadProgress,
  progressKey,
  saveProgress,
  subscribeProgress,
} from './progressStorage'

describe('progressStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns defaults for missing progress', () => {
    expect(loadProgress('python', 'level-1')).toEqual({
      challengesCompleted: [],
      testPassed: false,
      challengeAnswers: {},
    })
  })

  it('round-trips progress through localStorage', () => {
    saveProgress('python', 'level-1', {
      challengesCompleted: ['c1'],
      testPassed: true,
      challengeAnswers: { c1: 'print("hi")' },
    })
    expect(loadProgress('python', 'level-1')).toEqual({
      challengesCompleted: ['c1'],
      testPassed: true,
      challengeAnswers: { c1: 'print("hi")' },
    })
    expect(localStorage.getItem(progressKey('python', 'level-1'))).toBeTruthy()
  })

  it('handles malformed JSON safely', () => {
    localStorage.setItem(progressKey('java', 'lvl'), '{not json')
    expect(loadProgress('java', 'lvl')).toEqual({
      challengesCompleted: [],
      testPassed: false,
      challengeAnswers: {},
    })
  })

  it('notifies subscribers when progress changes', () => {
    const listener = vi.fn()
    const before = getProgressSnapshot()
    const unsubscribe = subscribeProgress(listener)
    saveProgress('python', 'x', { challengesCompleted: [], testPassed: false })
    expect(listener).toHaveBeenCalledTimes(1)
    expect(getProgressSnapshot()).toBe(before + 1)
    unsubscribe()
    saveProgress('python', 'x', { challengesCompleted: ['a'], testPassed: false })
    expect(listener).toHaveBeenCalledTimes(1)
  })
})
