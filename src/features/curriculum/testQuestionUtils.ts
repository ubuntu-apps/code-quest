import type { TestQuestion } from './types'
import { normalizeAnswer } from './validateAnswer'

export function isYesNoQuestion(q: TestQuestion): boolean {
  if (q.type !== 'shortText') return false
  if (q.validation.mode !== 'equalsNormalized') return false
  const expected = normalizeAnswer(q.validation.expected ?? '')
  return expected === 'yes' || expected === 'no'
}

export function yesNoDisplayPrompt(prompt: string): string {
  return prompt.replace(/\s*\(yes\/no\)\s*$/i, '').trim()
}

export function yesNoCorrectAnswer(q: TestQuestion): 'yes' | 'no' | null {
  if (q.type !== 'shortText') return null
  if (!isYesNoQuestion(q)) return null
  return normalizeAnswer(q.validation.expected ?? '') as 'yes' | 'no'
}
