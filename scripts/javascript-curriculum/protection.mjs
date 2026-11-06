/**
 * JavaScript's protection against typed-in answers: a last test, "Works with other data too",
 * that reruns the learner's code with the starter's values changed and compares the results
 * with the solution's (`_cq_rerun` in src/features/languages/javascript/jsHarness.ts).
 *
 * The other data is the challenge's `alt` (text, or a function of the starter), else the
 * starter with its plain values changed: numbers in `const x = 4.5` move up a little, and texts
 * in `const name = "Alex"` get a "2" added. Challenges marked `typedOk` (the answer is a fixed
 * value by nature) and challenges with no starter values get none; a challenge can also check
 * its own way with `avoids()`.
 */
import { TypedInProtection } from '../course-kit/TypedInProtection.mjs'

const DECLARATION = /^(\s*(?:const|let|var)\s+[A-Za-z_$][\w$]*\s*=\s*)(.+?)(\s*(?:\/\/.*)?)$/

function moveNumber(tok, k) {
  const step = 1 + (k % 3)
  const dot = tok.indexOf('.')
  if (dot < 0) return String(Number(tok) + step)
  const d = tok.length - dot - 1
  return (Number(tok) + step * 10 ** -d).toFixed(d)
}

/** The starter with the values of its plain declarations changed. */
export function otherData(starter) {
  let k = 0
  return starter
    .split('\n')
    .map((line) => {
      const m = DECLARATION.exec(line)
      if (!m) return line
      const value = m[2]
        .replace(/(?<![\w$.])-?\d+(?:\.\d+)?(?![\w$.])/g, (n) => moveNumber(n, k++))
        .replace(/(["'])((?:\\.|(?!\1).)*)\1/g, (_, q, text) => `${q}${text}2${q}`)
      return m[1] + value + m[3]
    })
    .join('\n')
}

/** Names the solution declares that the tests look at. */
export function checkedVars(solution, assertions) {
  const declared = [...solution.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g)].map((m) => m[1])
  return [...new Set(declared)].filter((name) => assertions.some((a) => new RegExp(`(?<![\\w$.])${name.replace(/\$/g, '\\$')}(?![\\w$])`).test(a)))
}

export class JavaScriptProtection extends TypedInProtection {
  static LABEL = 'Works with other data too'

  /** Adds the rerun test, and removes `alt` and `typedOk`, which are only for building it. */
  protect({ alt, typedOk, ...challenge }) {
    const { starterCode: starter, solution, validation } = challenge
    if (typedOk || !starter) return challenge
    const other = typeof alt === 'function' ? alt(starter) : (alt ?? otherData(starter))
    const assertions = validation.tests.map((t) => t.assertion)
    const vars = checkedVars(solution, assertions)
    const output = assertions.some((a) => /_cq_(prints|output|lines)/.test(a))
    if (other === starter || (vars.length === 0 && !output)) return challenge
    const assertion = `_cq_rerun(${JSON.stringify(starter)}, ${JSON.stringify(other)}, ${JSON.stringify(solution)}, ${JSON.stringify(vars)}, ${output})`
    const rerun = { id: `t${validation.tests.length + 1}`, label: JavaScriptProtection.LABEL, assertion }
    return { ...challenge, validation: { ...validation, tests: [...validation.tests, rerun] } }
  }
}
