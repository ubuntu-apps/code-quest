import { beforeEach, describe, expect, it } from 'vitest'
import type { Challenge, LanguageBundle, Level } from '../content/types'
import { migrateRenamedLevels, renameItemId } from './levelRenames'
import { challengeFingerprint, progressFormatKey, reconcileLanguageProgress } from './progressFingerprint'
import { loadProgress, saveProgress } from './progressStorage'
import { STORES } from '../../../lib/stores'

function challenge(id: string): Challenge {
  return { id, title: `Challenge ${id}`, promptMarkdown: '', validation: { mode: 'equalsNormalized', expected: 'x' } }
}

function level(id: string, challengeIds: string[], formerIds?: string[]): Level {
  return {
    id,
    title: id,
    ...(formerIds ? { formerIds } : {}),
    intro: { bodyMarkdown: '' },
    challenges: challengeIds.map(challenge),
    test: { questions: [] },
  }
}

function bundle(...levels: Level[]): LanguageBundle {
  return {
    index: { id: 'python', title: 'Python', sections: [{ id: 's1', title: 'S', path: 's1.json' }] },
    sections: [{ sectionRef: { id: 's1', title: 'S', path: 's1.json' }, file: { sectionId: 's1', levels } }],
  }
}

describe('renamed lessons', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renames challenge and question ids that start with the old lesson id', () => {
    expect(renameItemId('hello-print-it', 'hello', 'first_program')).toBe('first_program-print-it')
    expect(renameItemId('hello-q-1x2y', 'hello', 'first_program')).toBe('first_program-q-1x2y')
    expect(renameItemId('hello_ch3', 'hello', 'first_program')).toBe('first_program_ch3')
    expect(renameItemId('hello_world-x', 'hello', 'first_program')).toBe('hello_world-x')
  })

  it('moves progress, drafts, review history and the Continue target to the new id', () => {
    saveProgress('python', 'hello', {
      challengesCompleted: ['hello-a'],
      testPassed: true,
      challengeAnswers: { 'hello-a': 'print(1)', 'hello-b': 'draft' },
      answersViewed: ['hello-b'],
      challengeVersions: { 'hello-a': 'v1' },
    })
    localStorage.setItem(
      STORES.review.keyFor('python'),
      JSON.stringify({ items: { 'hello-q-abc': { box: 2 }, 'other-q-x': { box: 1 } }, session: { date: 'd', ids: ['hello-q-abc'], done: false, correct: 0, rounds: 0 } }),
    )
    localStorage.setItem(
      STORES.lastLevel.key,
      JSON.stringify({ languageId: 'python', languagePath: 'python/index.json', sectionId: 'old', levelId: 'hello' }),
    )

    expect(migrateRenamedLevels('python', bundle(level('first_program', ['first_program-a', 'first_program-b'], ['hello'])))).toBe(true)

    expect(localStorage.getItem(STORES.progress.keyFor('python:hello'))).toBeNull()
    const p = loadProgress('python', 'first_program')
    expect(p.challengesCompleted).toEqual(['first_program-a'])
    expect(p.testPassed).toBe(true)
    expect(p.challengeAnswers).toEqual({ 'first_program-a': 'print(1)', 'first_program-b': 'draft' })
    expect(p.answersViewed).toEqual(['first_program-b'])
    expect(p.challengeVersions).toEqual({ 'first_program-a': 'v1' })

    const review = JSON.parse(localStorage.getItem(STORES.review.keyFor('python')) ?? '{}')
    expect(Object.keys(review.items).sort()).toEqual(['first_program-q-abc', 'other-q-x'])
    expect(review.session.ids).toEqual(['first_program-q-abc'])

    const last = JSON.parse(localStorage.getItem(STORES.lastLevel.key) ?? '{}')
    expect(last.levelId).toBe('first_program')
    expect(last.sectionId).toBe('s1')

    // Running again changes nothing.
    expect(migrateRenamedLevels('python', bundle(level('first_program', ['first_program-a'], ['hello'])))).toBe(false)
  })

  it('merges with progress already saved under the new id', () => {
    saveProgress('python', 'hello', { challengesCompleted: ['hello-a'], testPassed: true, challengeAnswers: { 'hello-b': 'old' } })
    saveProgress('python', 'first_program', {
      challengesCompleted: ['first_program-b'],
      testPassed: false,
      challengeAnswers: { 'first_program-b': 'new' },
    })
    migrateRenamedLevels('python', bundle(level('first_program', ['first_program-a', 'first_program-b'], ['hello'])))
    const p = loadProgress('python', 'first_program')
    expect(p.challengesCompleted.sort()).toEqual(['first_program-a', 'first_program-b'])
    expect(p.testPassed).toBe(true)
    expect(p.challengeAnswers).toEqual({ 'first_program-b': 'new' })
  })

  it('leaves a former id alone when another lesson uses it again', () => {
    saveProgress('python', 'hello', { challengesCompleted: ['hello-a'], testPassed: true, challengeAnswers: {} })
    migrateRenamedLevels('python', bundle(level('hello', ['hello-a']), level('first_program', ['first_program-a'], ['hello'])))
    expect(loadProgress('python', 'hello').challengesCompleted).toEqual(['hello-a'])
    expect(localStorage.getItem(STORES.progress.keyFor('python:first_program'))).toBeNull()
  })

  it('keeps solved challenges through a rename when the course is reconciled', () => {
    localStorage.setItem(progressFormatKey('python'), '2')
    const before = level('hello', ['hello-a'])
    saveProgress('python', 'hello', {
      challengesCompleted: ['hello-a'],
      testPassed: true,
      challengeAnswers: {},
      challengeVersions: { 'hello-a': challengeFingerprint(before.challenges[0]) },
    })
    // The fingerprint is made from the title and checks, which a rename doesn't change.
    const renamed = level('first_program', [], ['hello'])
    renamed.challenges = [{ ...before.challenges[0], id: 'first_program-a' }]
    expect(reconcileLanguageProgress('python', bundle(renamed))).toBe(false)
    const p = loadProgress('python', 'first_program')
    expect(p.challengesCompleted).toEqual(['first_program-a'])
    expect(p.testPassed).toBe(true)
    expect(p.challengesReset).toBeUndefined()
  })
})
