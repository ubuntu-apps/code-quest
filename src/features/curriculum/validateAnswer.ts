import type { TestGradeResult, TestQuestion, Validation } from './types'

export function normalizeAnswer(s: string): string {
  return s.trim().replace(/\s+/g, ' ').toLowerCase()
}

/**
 * Names typed the way people write them in code still count: `json.loads`,
 * `loads()`, `.loads` and \`loads\` all match an expected answer of `loads`.
 * Only applies when the expected answer is a single identifier.
 */
function matchesIdentifier(answer: string, expected: string): boolean {
  if (!/^[a-z_][a-z0-9_]*$/.test(expected)) return false
  const cleaned = answer.replace(/^[`'"]+|[`'"]+$/g, '').replace(/\(\)$/, '').replace(/^\./, '')
  if (!/^[a-z_][a-z0-9_]*(\.[a-z_][a-z0-9_]*)*$/.test(cleaned)) return false
  return cleaned.split('.').pop() === expected
}

export function validateAgainst(answer: string, v: Validation): boolean {
  const raw = answer
  switch (v.mode) {
    case 'equalsNormalized': {
      const given = normalizeAnswer(raw)
      const expected = normalizeAnswer(v.expected ?? '')
      return given === expected || matchesIdentifier(given, expected)
    }
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
    case 'r_tests':
      // Runtime-backed checks are handled asynchronously in CodeQuestScreen.
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

export function gradeTest(
  questions: TestQuestion[],
  short: Record<string, string>,
  mcq: Record<string, string>,
  passingScorePercent: number,
): TestGradeResult {
  const byQuestion: Record<string, boolean> = {}
  let correct = 0
  for (const q of questions) {
    const ok = gradeQuestion(q, short[q.id], mcq[q.id])
    byQuestion[q.id] = ok
    if (ok) correct += 1
  }
  const total = questions.length
  const pct = total === 0 ? 100 : (correct / total) * 100
  return { correct, total, passed: pct >= passingScorePercent, byQuestion }
}
