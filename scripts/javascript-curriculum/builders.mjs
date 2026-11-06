/**
 * Builders for JavaScript stages: the shared ones (../course-kit/CourseBuilders.mjs) plus `task`
 * and the test helpers. Stage files import them from data/_builders.mjs.
 *
 * JavaScript challenges are checked by JavaScript tests that run after the learner's code, in
 * the same scope (src/features/languages/javascript/jsHarness.ts). In a test:
 * - the learner's variables are there by name (`total`, `greeting`);
 * - `_cq_output` is everything the code logged, and `_cq_lines` its lines;
 * - `_cq_code` is the code itself, to check a feature was used;
 * - `_cq_prints('a', 'b')` is true when the output is exactly these lines (a difference is shown).
 * Use the helpers below (`prints`, `uses`, `avoids`) rather than writing tests by hand.
 *
 * Gate questions can carry a `check` that the content checker runs, so answers that are
 * JavaScript output are tested too. Checks are not published.
 */
import { CourseBuilders } from '../course-kit/CourseBuilders.mjs'

/** A JavaScript string literal. */
export const jsstr = (text) => JSON.stringify(text)

export class JavaScriptBuilders extends CourseBuilders {
  /**
   * A JavaScript challenge. `tests` are [label, assertion] pairs: each assertion is a
   * JavaScript expression that must be `true` after the learner's code has run. The checker
   * makes sure the solution passes, and the starter code, empty code and the solution's output
   * typed in don't. `typedOk: true` is for challenges whose answer is a fixed value by nature
   * ("print `Hello, world!`"); the checker then doesn't try typing it in.
   *
   * @param {'easy'|'medium'|'hard'|'expert'} difficulty
   * @param {string} title
   * @param {{ prompt: string, starter?: string, hint: string, solution: string, tests: [string, string][], setup?: string, typedOk?: boolean }} spec
   */
  task(difficulty, title, { prompt, starter = '', hint, solution, tests, setup = '', typedOk = false }) {
    return {
      ...(typedOk ? { typedOk: true } : {}),
      title: this.challengeTitle(difficulty, title),
      promptMarkdown: prompt,
      starterCode: starter,
      hint,
      solution,
      validation: {
        mode: 'javascript_tests',
        setupCode: setup,
        tests: this._tests(tests),
      },
    }
  }

  /**
   * Multiple-choice question: `correct` is the index of the right option, `explanation`
   * says why it is right. The generator shuffles the options in a fixed order per prompt.
   * `check` (optional, not published): `{ code, output }` or `{ code, error }`, run by the checker.
   */
  mc(prompt, options, correct, explanation, check) {
    return { ...super.mc(prompt, options, correct, explanation), ...(check ? { check } : {}) }
  }

  /** Short typed answer, compared ignoring case and extra spaces. `check` as for `mc`. */
  qShort(prompt, expected, explanation, check) {
    return { ...super.qShort(prompt, expected, explanation), ...(check ? { check } : {}) }
  }

  /** Short typed answer checked with a regular expression. `check` as for `mc`. */
  qPattern(prompt, pattern, expected, explanation, check) {
    return { ...super.qPattern(prompt, pattern, expected, explanation), ...(check ? { check } : {}) }
  }

  // ---- Test helpers: each gives a JavaScript expression that must be true ----

  /** The code logged exactly these lines (spaces at line ends don't count). */
  prints(...lines) {
    return `_cq_prints(${lines.map(jsstr).join(', ')})`
  }

  /** The code contains this text, e.g. `uses('*')`. */
  uses(text) {
    return `_cq_code.includes(${jsstr(text)})`
  }

  /** The code does not contain this text, e.g. a result that must be worked out, not typed in. */
  avoids(text) {
    return `!_cq_code.includes(${jsstr(text)})`
  }

  /** The code matches a regular expression, e.g. `matches('\\\\blet\\\\s+total')`. */
  matches(pattern, flags = '') {
    return `new RegExp(${jsstr(pattern)}, ${jsstr(flags)}).test(_cq_code)`
  }

  /** `name` is exactly this value (a number, text, true or false), compared with Object.is. */
  is(name, value) {
    return `Object.is(${name}, ${JSON.stringify(value)})`
  }

  /** `name` is a number equal to `value`, allowing for rounding in the last digits. */
  near(name, value) {
    return `typeof ${name} === 'number' && Math.abs(${name} - ${value}) < 1e-9`
  }

  /** `name` is the same as a JavaScript value, compared as JSON: `same('nums', '[2, 4, 6]')`. */
  same(name, jsValue) {
    return `JSON.stringify(${name}) === JSON.stringify(${jsValue})`
  }
}
