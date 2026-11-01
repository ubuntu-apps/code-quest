/**
 * Python's protection against typed-in answers: extra checks that run the challenge's code
 * again with other starting values, so an answer typed in as a fixed value (or a comparison
 * that only works for the given numbers) fails. make-variations.py finds the values and checks
 * them, and writes data/variations.json; values are Python literals.
 */
import { existsSync, readFileSync } from 'node:fs'
import { TypedInProtection } from '../course-kit/TypedInProtection.mjs'

const VARIATIONS_FILE = new URL('./data/variations.json', import.meta.url)

export class PythonProtection extends TypedInProtection {
  /** @param {Record<string, { tests: { label: string, assertion: string }[] }[]>} [variations] By challenge id. */
  constructor(variations = existsSync(VARIATIONS_FILE) ? JSON.parse(readFileSync(VARIATIONS_FILE, 'utf8')) : {}) {
    super()
    this.variations = variations
  }

  /** The challenge's tests plus the variation checks for it. */
  protect(challenge) {
    const variations = this.variations[challenge.id]
    if (!variations || challenge.validation?.mode !== 'python_tests') return challenge
    const extra = variations.flatMap((variation, i) =>
      variation.tests.map((test, j) => ({ id: `v${i + 1}_${j + 1}`, label: test.label, assertion: test.assertion })),
    )
    return { ...challenge, validation: { ...challenge.validation, tests: [...challenge.validation.tests, ...extra] } }
  }
}
