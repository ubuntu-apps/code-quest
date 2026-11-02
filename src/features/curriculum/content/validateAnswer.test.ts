import { describe, expect, it } from 'vitest'
import { gradeQuestion, gradeTest, normalizeAnswer, validateAgainst } from './validateAnswer'
import type { TestQuestion } from './types'

describe('normalizeAnswer', () => {
  it('trims, collapses whitespace, and lowercases', () => {
    expect(normalizeAnswer('  Hello   World  ')).toBe('hello world')
  })
})

describe('validateAgainst', () => {
  it('equalsNormalized compares normalized strings', () => {
    expect(
      validateAgainst('  Print ', { mode: 'equalsNormalized', expected: 'print' }),
    ).toBe(true)
  })

  it('equalsNormalized accepts a name written as code', () => {
    const v = { mode: 'equalsNormalized' as const, expected: 'loads' }
    for (const answer of ['loads', 'json.loads', 'loads()', 'json.loads()', '.loads', '`loads`', ' LOADS ']) {
      expect(validateAgainst(answer, v)).toBe(true)
    }
    expect(validateAgainst('dumps', v)).toBe(false)
    expect(validateAgainst('loads(x)', v)).toBe(false)
    expect(validateAgainst('json.loadsx', v)).toBe(false)
  })

  it('identifier leniency does not apply to non-identifier answers', () => {
    expect(validateAgainst('201', { mode: 'equalsNormalized', expected: '201' })).toBe(true)
    expect(validateAgainst('x.201', { mode: 'equalsNormalized', expected: '201' })).toBe(false)
    expect(validateAgainst('group  by', { mode: 'equalsNormalized', expected: 'group by' })).toBe(true)
    expect(validateAgainst('%Y', { mode: 'equalsNormalized', expected: '%Y' })).toBe(true)
  })

  it('equalsNormalized accepts an answer typed in quotes or backticks', () => {
    const v = { mode: 'equalsNormalized' as const, expected: 'kiwi, pear' }
    for (const answer of ['kiwi, pear', '"kiwi, pear"', "'kiwi, pear'", '`kiwi, pear`']) {
      expect(validateAgainst(answer, v)).toBe(true)
    }
    expect(validateAgainst('"kiwi, pear\'', v)).toBe(false)
    expect(validateAgainst('"kiwi"', v)).toBe(false)
  })

  it('equalsNormalized compares numbers by value', () => {
    expect(validateAgainst('2.50', { mode: 'equalsNormalized', expected: '2.5' })).toBe(true)
    expect(validateAgainst('-40.0', { mode: 'equalsNormalized', expected: '-40' })).toBe(true)
    expect(validateAgainst('9', { mode: 'equalsNormalized', expected: '09' })).toBe(false)
    expect(validateAgainst('2.6', { mode: 'equalsNormalized', expected: '2.5' })).toBe(false)
    expect(validateAgainst('1e1', { mode: 'equalsNormalized', expected: '10' })).toBe(false)
  })

  it('includesAll requires every needle', () => {
    expect(
      validateAgainst('abc def', { mode: 'includesAll', needles: ['abc', 'def'] }),
    ).toBe(true)
    expect(
      validateAgainst('abc', { mode: 'includesAll', needles: ['abc', 'def'] }),
    ).toBe(false)
  })

  it('regex mode tests pattern', () => {
    expect(validateAgainst('hello', { mode: 'regex', pattern: '^hel+o$' })).toBe(true)
    expect(validateAgainst('hello', { mode: 'regex', pattern: '[' })).toBe(false)
  })

  it('python_tests and r_tests always return false synchronously', () => {
    expect(validateAgainst('x', { mode: 'python_tests', tests: [] })).toBe(false)
    expect(validateAgainst('x', { mode: 'r_tests', tests: [] })).toBe(false)
  })
})

describe('gradeQuestion', () => {
  const mcq: TestQuestion = {
    id: 'q1',
    type: 'mcq',
    prompt: 'Pick one',
    choices: [
      { id: 'a', label: 'A' },
      { id: 'b', label: 'B' },
    ],
    correctChoiceId: 'b',
  }

  it('grades mcq by selected choice', () => {
    expect(gradeQuestion(mcq, undefined, 'b')).toBe(true)
    expect(gradeQuestion(mcq, undefined, 'a')).toBe(false)
  })

  it('grades shortText via validation', () => {
    const shortText: TestQuestion = {
      id: 'q2',
      type: 'shortText',
      prompt: 'Name the function',
      validation: { mode: 'equalsNormalized', expected: 'print' },
    }
    expect(gradeQuestion(shortText, 'print', undefined)).toBe(true)
    expect(gradeQuestion(shortText, 'echo', undefined)).toBe(false)
  })
})

describe('gradeTest', () => {
  const questions: TestQuestion[] = [
    {
      id: 'q1',
      type: 'mcq',
      prompt: 'Pick one',
      choices: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
      ],
      correctChoiceId: 'b',
    },
    {
      id: 'q2',
      type: 'shortText',
      prompt: 'Name the function',
      validation: { mode: 'equalsNormalized', expected: 'print' },
    },
  ]

  it('returns per-question results and overall pass/fail', () => {
    const result = gradeTest(questions, { q2: 'print' }, { q1: 'a' }, 51)
    expect(result.correct).toBe(1)
    expect(result.total).toBe(2)
    expect(result.passed).toBe(false)
    expect(result.byQuestion).toEqual({ q1: false, q2: true })
  })
})
