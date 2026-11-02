import { describe, expect, it } from 'vitest'
import { parseChallengeOutput } from './rHarness'

const tests = [
  { id: 'a', label: 'Makes total', assertion: 'total == 3' },
  { id: 'b', label: 'Prints it', assertion: 'TRUE' },
]

describe('parseChallengeOutput', () => {
  it('splits the learner output from the results', () => {
    const parsed = parseChallengeOutput('[1] 3\n<<codequest-tests>>\na\tPASS\t\nb\tPASS\t', tests)
    expect(parsed.output).toBe('[1] 3')
    expect(parsed.passed).toBe(true)
    expect(parsed.tests.map((t) => t.label)).toEqual(['Makes total', 'Prints it'])
  })

  it('fails a test that never reported', () => {
    const parsed = parseChallengeOutput('<<codequest-tests>>\na\tPASS\t', tests)
    expect(parsed.passed).toBe(false)
    expect(parsed.tests.find((t) => t.id === 'b')).toMatchObject({ passed: false, detail: "This check didn't run." })
  })

  it('ignores stray lines that are not results', () => {
    const parsed = parseChallengeOutput('<<codequest-tests>>\na\tFAIL\tobject not found\nsecond line of a message\nb\tPASS\t', tests)
    expect(parsed.tests).toHaveLength(2)
    expect(parsed.tests[0]).toMatchObject({ id: 'a', passed: false, detail: 'object not found' })
  })

  it('treats output without the marker as no results', () => {
    const parsed = parseChallengeOutput('a\tPASS\t\nb\tPASS\t', tests)
    expect(parsed.passed).toBe(false)
  })
})
