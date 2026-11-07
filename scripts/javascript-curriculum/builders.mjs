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
   * Unless `typedOk` is set, the generator adds a last check, "Works with other data too", that
   * reruns the code with the starter's values changed (`alt`, else the default change; see
   * protection.mjs), so an answer typed in as fixed values fails.
   *
   * @param {'easy'|'medium'|'hard'|'expert'} difficulty
   * @param {string} title
   * @param {{ prompt: string, starter?: string, hint: string, solution: string, tests: [string, string][], setup?: string, typedOk?: boolean, alt?: string | ((starter: string) => string) }} spec
   */
  task(difficulty, title, { prompt, starter = '', hint, solution, tests, setup = '', typedOk = false, alt }) {
    return {
      ...(typedOk ? { typedOk: true } : {}),
      ...(alt !== undefined ? { alt } : {}),
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

  /**
   * Running `call` (JavaScript, e.g. `'greet("Zed")'`) logs exactly these lines. What it logs is
   * caught, so it stays out of the learner's output. Values are joined as text, so use it for
   * functions that log text and numbers.
   */
  logsWhen(call, ...lines) {
    return `((_cq_log, _cq_got) => { console.log = (...v) => { _cq_got.push(...v.map(String).join(" ").split("\\n")) }; try { ${call} } finally { console.log = _cq_log } return JSON.stringify(_cq_got) === ${jsstr(JSON.stringify(lines))} })(console.log, [])`
  }

  /**
   * Running `call` (JavaScript, e.g. `'divide(1, 0)'`) throws an error whose `name: message`
   * contains `text` (e.g. `'RangeError'` or `'Cannot divide by zero'`).
   */
  throwsWhen(call, text) {
    return `(() => { try { ${call} } catch (_cq_e) { return (String(_cq_e?.name) + ": " + String(_cq_e?.message)).includes(${jsstr(text)}) } return false })()`
  }

  /** `name` is the same as a JavaScript value, compared as JSON: `same('nums', '[2, 4, 6]')`. */
  same(name, jsValue) {
    return `JSON.stringify(${name}) === JSON.stringify(${jsValue})`
  }
}
