import { beforeEach, describe, expect, it } from 'vitest'
import type { Challenge, LanguageBundle, Level, TestQuestion } from './types'
import { challengeFingerprint, progressFormatKey, reconcileLanguageProgress } from './progressFingerprint'
import { loadProgress, saveProgress } from './progressStorage'
import { migrateLevelIds, migrateReviewIds } from './idMigration'
import { REVIEW_PREFIX } from '../review/reviewStorage'

function challenge(id: string, title: string, expected = 'x'): Challenge {
  return { id, title, promptMarkdown: '', validation: { mode: 'equalsNormalized', expected } }
}

function question(id: string): TestQuestion {
  return { id, type: 'shortText', prompt: id, validation: { mode: 'equalsNormalized', expected: 'a' } } as TestQuestion
}

function level(challenges: Challenge[], questions: TestQuestion[] = []): Level {
  return { id: 'lists', title: 'Lists', intro: { bodyMarkdown: '' }, challenges, test: { questions } }
}

function bundle(lvl: Level): LanguageBundle {
  return {
    index: { id: 'python', title: 'Python', sections: [{ id: 's1', title: 'S', path: 's1.json' }] },
    sections: [{ sectionRef: { id: 's1', title: 'S', path: 's1.json' }, file: { sectionId: 's1', levels: [lvl] } }],
  }
}

const make = challenge('lists-make-a-list', 'Easy: Make a list', 'a')
const first = challenge('lists-first-and-last', 'Easy: First and last', 'b')
const queue = challenge('lists-jump-the-queue', 'Medium: Jump the queue', 'c')

describe('moving progress to permanent ids', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('follows fingerprints, so progress lands on the right challenge after an insert', () => {
    // Saved when the lesson was [make, first]; a new challenge has since been put first.
    const old = [{ ...make, id: 'lists_ch1' }, { ...first, id: 'lists_ch2' }]
    saveProgress('python', 'lists', {
      challengesCompleted: ['lists_ch2'],
      testPassed: true,
      challengeAnswers: { lists_ch1: 'draft 1', lists_ch2: 'draft 2' },
      answersViewed: ['lists_ch1'],
      challengeVersions: { lists_ch1: challengeFingerprint(old[0]), lists_ch2: challengeFingerprint(old[1]) },
    })
    expect(migrateLevelIds('python', level([queue, make, first]), challengeFingerprint)).toBe(0)
    const p = loadProgress('python', 'lists')
    expect(p.challengesCompleted).toEqual(['lists-first-and-last'])
    expect(p.challengeAnswers).toEqual({ 'lists-make-a-list': 'draft 1', 'lists-first-and-last': 'draft 2' })
    expect(p.answersViewed).toEqual(['lists-make-a-list'])
    expect(Object.keys(p.challengeVersions ?? {}).sort()).toEqual(['lists-first-and-last', 'lists-make-a-list'])
    expect(p.testPassed).toBe(true)
  })

  it('drops progress for a challenge that changed or was removed, and says so', () => {
    const old = { ...make, id: 'lists_ch1', validation: { mode: 'equalsNormalized' as const, expected: 'old' } }
    saveProgress('python', 'lists', {
      challengesCompleted: ['lists_ch1'],
      testPassed: false,
      challengeAnswers: {},
      challengeVersions: { lists_ch1: challengeFingerprint(old) },
    })
    expect(migrateLevelIds('python', level([make]), challengeFingerprint)).toBe(1)
    const p = loadProgress('python', 'lists')
    expect(p.challengesCompleted).toEqual([])
    expect(p.challengesReset).toBe(1)
  })

  it('uses the old position when there is no fingerprint', () => {
    saveProgress('python', 'lists', { challengesCompleted: ['lists_ch2'], testPassed: false, challengeAnswers: {} })
    migrateLevelIds('python', level([make, first]), challengeFingerprint)
    expect(loadProgress('python', 'lists').challengesCompleted).toEqual(['lists-first-and-last'])
  })

  it('does nothing the second time', () => {
    saveProgress('python', 'lists', { challengesCompleted: ['lists-make-a-list'], testPassed: false, challengeAnswers: {} })
    const before = localStorage.getItem('codequest:progress:python:lists')
    expect(migrateLevelIds('python', level([make]), challengeFingerprint)).toBe(0)
    expect(localStorage.getItem('codequest:progress:python:lists')).toBe(before)
  })

  it('keeps fingerprinted progress through the whole reconcile', () => {
    localStorage.setItem(progressFormatKey('python'), '2')
    saveProgress('python', 'lists', {
      challengesCompleted: ['lists_ch1'],
      testPassed: false,
      challengeAnswers: {},
      challengeVersions: { lists_ch1: challengeFingerprint({ ...first, id: 'lists_ch1' }) },
    })
    expect(reconcileLanguageProgress('python', bundle(level([make, first])))).toBe(false)
    expect(loadProgress('python', 'lists').challengesCompleted).toEqual(['lists-first-and-last'])
  })

  it('moves review history to the new question ids', () => {
    const item = { box: 2, due: '2026-10-30', right: 2, wrong: 0, seen: '2026-10-26' }
    localStorage.setItem(
      REVIEW_PREFIX + 'python',
      JSON.stringify({
        items: { lists_q1: item, lists_q2: item, lists_q9: item },
        session: { date: '2026-10-26', ids: ['lists_q2'], done: false, correct: 0, rounds: 0 },
      }),
    )
    const lvl = level([make], [question('lists-q-aaa'), question('lists-q-bbb')])
    expect(migrateReviewIds('python', bundle(lvl))).toBe(true)
    const state = JSON.parse(localStorage.getItem(REVIEW_PREFIX + 'python') ?? '{}')
    expect(Object.keys(state.items).sort()).toEqual(['lists-q-aaa', 'lists-q-bbb'])
    expect(state.session.ids).toEqual(['lists-q-bbb'])
    expect(migrateReviewIds('python', bundle(lvl))).toBe(false)
  })
})
