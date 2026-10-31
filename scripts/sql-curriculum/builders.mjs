/**
 * Builders for SQL lessons: the shared ones (../course-kit/CourseBuilders.mjs) plus `query`.
 * A lesson is written like a Python one, plus the database it runs on (`database`).
 *
 * SQL challenges are graded by comparing the learner's result with the solution's:
 * the same columns, the same rows (in the same order when the solution uses ORDER BY),
 * and the same again on the database's other rows, so typing the answer in doesn't pass.
 */
import { CourseBuilders } from '../course-kit/CourseBuilders.mjs'

export class SqlBuilders extends CourseBuilders {
  /**
   * A SQL challenge. The learner's last result is compared with the solution's; rows must be
   * in the solution's order when it has ORDER BY (or `ordered: true`). `checks` are
   * [label, query] pairs run afterwards on both databases, for statements that change data.
   *
   * Name every calculated column in the prompt (`AS stock_value`): a column without a name
   * is called by its expression, so `price*2` and `price * 2` would not match.
   *
   * @param {'easy'|'medium'|'hard'|'expert'} difficulty
   * @param {string} title
   * @param {{ prompt: string, starter?: string, hint: string, solution: string, ordered?: boolean, checks?: [string, string][] }} spec
   */
  query(difficulty, title, { prompt, starter = '', hint, solution, ordered, checks = [] }) {
    return {
      title: this.challengeTitle(difficulty, title),
      promptMarkdown: prompt,
      starterCode: starter,
      hint,
      solution,
      validation: {
        mode: 'sql_tests',
        ordered: ordered ?? /\border\s+by\b/i.test(solution),
        ...(checks.length ? { tests: this._tests(checks) } : {}),
      },
    }
  }
}
