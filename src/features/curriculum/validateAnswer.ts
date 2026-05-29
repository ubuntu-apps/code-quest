import type { TestQuestion, Validation } from './types'

export function normalizeAnswer(s: string): string {
  return s.trim().replace(/\s+/g, ' ').toLowerCase()
}

export function validateAgainst(answer: string, v: Validation): boolean {
  const raw = answer
  switch (v.mode) {
    case 'equalsNormalized':
      return normalizeAnswer(raw) === normalizeAnswer(v.expected ?? '')
    case 'includesAll':
      return (v.needles ?? []).every((n) => raw.includes(n))
    case 'regex': {
      try {
        const re = new RegExp(v.pattern ?? '', 's')
        return re.test(raw)
      } catch {
        return false
      }
    }
    case 'python_tests':
      // Runtime-backed checks are handled asynchronously in CodeQuestScreen via Pyodide.
      return false
    default:
      return false
  }
}

export function gradeQuestion(
  q: TestQuestion,
  answer: string | undefined,
  mcqSelection: string | undefined,
): boolean {
  if (q.type === 'mcq') {
    return q.correctChoiceId === mcqSelection
  }
  return validateAgainst(answer ?? '', q.validation)
}
