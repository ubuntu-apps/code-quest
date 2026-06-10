import { describe, expect, it } from 'vitest'
import { isYesNoQuestion, yesNoCorrectAnswer, yesNoDisplayPrompt } from './testQuestionUtils'
import type { TestQuestion } from './types'

describe('isYesNoQuestion', () => {
  it('detects short-text questions with yes/no expected answers', () => {
    const q: TestQuestion = {
      id: 'q1',
      type: 'shortText',
      prompt: 'Are comments executed? (yes/no)',
      validation: { mode: 'equalsNormalized', expected: 'no' },
    }
    expect(isYesNoQuestion(q)).toBe(true)
    expect(yesNoCorrectAnswer(q)).toBe('no')
    expect(yesNoDisplayPrompt(q.prompt)).toBe('Are comments executed?')
  })

  it('ignores other short-text questions', () => {
    const q: TestQuestion = {
      id: 'q2',
      type: 'shortText',
      prompt: 'Keyword for function output?',
      validation: { mode: 'equalsNormalized', expected: 'return' },
    }
    expect(isYesNoQuestion(q)).toBe(false)
  })
})
