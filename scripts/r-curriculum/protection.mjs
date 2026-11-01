/**
 * R's protection against typed-in answers: a last test, "Works with other data too", that
 * reruns the learner's code with the starter's data changed and compares the results with the
 * solution's (`._cq_rerun` in src/features/curriculum/rHarness.ts). The other data is the
 * challenge's `alt` (text, or a function of the starter), else an entry in data/r-variations.mjs
 * (found by find-variations.mjs), else the default change in data/_rerun.mjs.
 *
 * Challenges marked `typedOk` (the answer is a fixed value by nature) and challenges with no
 * starter data get none.
 */
import { TypedInProtection } from '../course-kit/TypedInProtection.mjs'
import { checkedVars, otherData, variationKey } from './data/_rerun.mjs'
import { VARIATIONS } from './data/r-variations.mjs'

/** An R string literal. */
const rstr = (text) => JSON.stringify(text)

export class RProtection extends TypedInProtection {
  static LABEL = 'Works with other data too'

  /** Adds the rerun test, and removes `alt` and `typedOk`, which are only for building it. */
  protect({ alt, typedOk, ...challenge }) {
    const { starterCode: starter, solution, validation } = challenge
    if (typedOk || !starter) return challenge
    const tests = validation.tests.map((t) => [t.label, t.assertion])
    const other = (typeof alt === 'function' ? alt(starter) : alt) ?? VARIATIONS[variationKey(starter, solution)]?.alt ?? otherData(starter)
    const assertion = this.rerunAssertion(starter, other, solution, tests)
    if (!assertion) return challenge
    const rerun = { id: `t${validation.tests.length + 1}`, label: RProtection.LABEL, assertion }
    return { ...challenge, validation: { ...validation, tests: [...validation.tests, rerun] } }
  }

  /**
   * The rerun test's R code for this other data, or null when there is nothing to compare
   * (the data doesn't change, or the tests look at no variable and no output).
   * @param {[string, string][]} tests The challenge's own tests, as [label, assertion].
   */
  rerunAssertion(starter, other, solution, tests) {
    const vars = checkedVars(solution, tests)
    const output = tests.some(([, assertion]) => assertion.includes('._cq_stdout'))
    if (other === starter || (vars.length === 0 && !output)) return null
    const varList = `c(${vars.map(rstr).join(', ')})`
    return `._cq_rerun(${rstr(starter)}, ${rstr(other)}, ${rstr(solution)}, ${varList}, output = ${output ? 'TRUE' : 'FALSE'})`
  }
}
