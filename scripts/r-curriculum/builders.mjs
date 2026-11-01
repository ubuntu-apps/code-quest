/**
 * Builders for R stages: the shared ones (../course-kit/CourseBuilders.mjs) plus `task` and
 * the test helpers. Stage files import them from data/_builders.mjs.
 *
 * R challenges are checked by R tests that run after the learner's code, in the same
 * environment (src/features/curriculum/rSandbox.ts). In a test:
 * - the learner's variables are there by name (`total`, `greeting`);
 * - `._cq_stdout` is what the code printed, as the R console shows it (`[1] 5`);
 * - `._cq_code` is the code itself, to check a function was used.
 * Use the helpers below (`near`, `prints`, `uses`) rather than writing tests by hand.
 *
 * Gate questions can carry a `check` that `check-in-browser.mjs` runs in R, so answers
 * that are R output are tested too. Checks are not published.
 */
import { CourseBuilders } from '../course-kit/CourseBuilders.mjs'

/** An R string literal. */
export const rstr = (text) => JSON.stringify(text)

export class RBuilders extends CourseBuilders {
  /**
   * An R challenge. `tests` are [label, assertion] pairs: each assertion is R code that
   * must give TRUE after the learner's code has run. The checker makes sure the solution
   * passes and the starter code doesn't.
   *
   * Unless `typedOk` is set, the generator adds a last check, "Works with other data too",
   * that reruns the learner's code with the starter's data changed (`alt`, else an entry in
   * data/r-variations.mjs, else the default change; see protection.mjs), so an answer typed in
   * as fixed values fails. `typedOk: true` is for challenges whose answer is a fixed value by
   * nature ("make `latte` hold 3.4"); the checker then doesn't try typing it in.
   *
   * @param {'easy'|'medium'|'hard'|'expert'} difficulty
   * @param {string} title
   * @param {{ prompt: string, starter?: string, hint: string, solution: string, tests: [string, string][], setup?: string, alt?: string | ((starter: string) => string), typedOk?: boolean }} spec
   */
  task(difficulty, title, { prompt, starter = '', hint, solution, tests, setup = '', alt, typedOk = false }) {
    return {
      ...(typedOk ? { typedOk: true } : {}),
      ...(alt !== undefined ? { alt } : {}),
      title: this.challengeTitle(difficulty, title),
      promptMarkdown: prompt,
      starterCode: starter,
      hint,
      solution,
      validation: {
        mode: 'r_tests',
        setupCode: setup,
        tests: this._tests(tests),
      },
    }
  }

  /**
   * Multiple-choice question: `correct` is the index of the right option, `explanation`
   * says why it is right. The generator shuffles the options in a fixed order per prompt, so
   * the right answer lands in different places; write the options in whatever order reads best.
   * `check` (optional, not published): `{ code, output }` or `{ code, error }`, run in R by the checker.
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

  // ---- Test helpers: each gives an R expression that must be TRUE ----

  /** `name` is a number equal to `value` (allowing for rounding in the last digits). */
  near(name, value) {
    return `is.numeric(${name}) && isTRUE(all.equal(${name}, ${value}))`
  }

  /** `name` is exactly this text. */
  isText(name, value) {
    return `identical(${name}, ${rstr(value)})`
  }

  /** `name` is exactly these texts, in order: `isTexts('days', 'Mon', 'Tue')`. */
  isTexts(name, ...values) {
    return `identical(${name}, c(${values.map(rstr).join(', ')}))`
  }

  /** `name` is exactly TRUE or FALSE. */
  isLogical(name, value) {
    return `identical(${name}, ${value ? 'TRUE' : 'FALSE'})`
  }

  /**
   * `name` equals an R value (a vector, a named vector…), allowing for rounding in the last
   * digits: `same('x', 'c(2, 4, 6)')`. Whole numbers and decimals compare equal.
   */
  same(name, rValue) {
    return `isTRUE(all.equal(${name}, ${rValue}))`
  }

  /**
   * `name` is a data frame with the same columns, in the same order and with the same values,
   * as an R expression: `sameFrame('long', 'trips[trips$minutes > 30, ]')`. Row names are
   * ignored, so a filtered or sorted table matches however it was made.
   */
  sameFrame(name, rExpr) {
    return `is.data.frame(${name}) && identical(names(${name}), names(${rExpr})) && isTRUE(all.equal(as.list(${name}), as.list(${rExpr}), check.attributes = FALSE))`
  }

  /** The code printed exactly these lines (spaces at line ends don't count). */
  prints(...lines) {
    return `identical(trimws(strsplit(._cq_stdout, "\\n", fixed = TRUE)[[1]], "right"), c(${lines.map(rstr).join(', ')}))`
  }

  /** The code contains this text, e.g. `uses('round(')`. */
  uses(text) {
    return `grepl(${rstr(text)}, ._cq_code, fixed = TRUE)`
  }

  /** The code matches a regular expression, e.g. `matches(',\\s*cups\\s*,')`. */
  matches(pattern) {
    return `grepl(${rstr(pattern)}, ._cq_code)`
  }

  /** The code does not contain this text, e.g. to make sure an answer isn't typed in. */
  avoids(text) {
    return `!grepl(${rstr(text)}, ._cq_code, fixed = TRUE)`
  }
}
