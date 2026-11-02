import { beforeEach, describe, expect, it } from 'vitest'
import type { Level, TestQuestion } from '../content/types'
import { buildTestOutQuestions, canTestOut, hasTestedOut, markTestedOut } from './testOut'
import { isSectionUnlocked } from '../helpers'
import { isBackupKey } from './progressBackup'

function mcq(id: string): TestQuestion {
  return { id, type: 'mcq', prompt: id, choices: [{ id: 'a', label: 'A' }], correctChoiceId: 'a' }
}

function level(id: string, questions: number, kind: Level['kind'] = 'topic'): Level {
  return {
    id,
    title: id,
    kind,
    intro: { bodyMarkdown: '' },
    challenges: [],
    test: { questions: Array.from({ length: questions }, (_, i) => mcq(`${id}_q${i + 1}`)) },
  }
}

describe('test-out quiz', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('takes two questions from each topic lesson, none from projects', () => {
    const levels = [level('a', 10), level('b', 10), level('p', 6, 'project')]
    const questions = buildTestOutQuestions(levels)
    expect(questions).toHaveLength(4)
    expect(questions.every((q) => q.id.startsWith('a_') || q.id.startsWith('b_'))).toBe(true)
    expect(canTestOut(levels)).toBe(true)
    expect(canTestOut([level('a', 1)])).toBe(false)
  })

  it('unlocks the next section once tested out, and is kept in backups', () => {
    const projectGate = { sectionRef: { id: 's1' }, file: { levels: [{ ...level('p', 1, 'project'), projectDifficulty: 'easy' as const }] } }
    const sections = [projectGate, { sectionRef: { id: 's2' }, file: { levels: [level('x', 3)] } }]
    expect(isSectionUnlocked('python', sections, 1)).toBe(false)
    markTestedOut('python', 's1')
    expect(hasTestedOut('python', 's1')).toBe(true)
    expect(isSectionUnlocked('python', sections, 1)).toBe(true)
    expect(isBackupKey('codequest:testout:python:s1')).toBe(true)
  })
})
