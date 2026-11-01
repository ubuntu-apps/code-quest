/**
 * Checks SQL lessons by running them on SQLite (with PythonEngine, through the app's worker
 * helpers).
 *
 * For every challenge, the solution must pass; the starter code, empty code and the solution's
 * result typed in as fixed values (SELECT 'Dune' ... UNION ALL ...) must not. The solution must
 * return rows on the lesson's data and a different result on its other rows (altSetupSql), or
 * the Check can't tell a real query from a typed-in one, and rows that tie in its ORDER BY must
 * have a tie-breaker. The lesson's sandbox code, samples and "Try it" blocks must run, and a
 * question that asks what a query gives must mark what it really gives.
 */
import { LanguageChecker } from './LanguageChecker.mjs'

/** Runs on PythonEngine (SQLite through Python's sqlite3): `new SqlChecker(spec, engine)`. */
export class SqlChecker extends LanguageChecker {
  /** The lesson's runnable SQL as [label, code]: sandbox, samples and "Try it" blocks. */
  lessonSql(level) {
    return [...this.sandboxCode(level), ...this.tryItBlocks(level).map((b) => ['"Try it" block', b.code])].filter(
      ([, code]) => !this.rules.showsError(code),
    )
  }

  async checkSection(file, section) {
    const data = { cases: [], runs: [] }
    const caseRefs = []
    const runRefs = []
    const quiz = { quiz: [], tries: [] }
    const asked = []
    for (const level of file.levels) {
      if (level.database) {
        for (const [item, sql] of this.lessonSql(level)) {
          data.runs.push({ sql, setup: level.database.setupSql })
          runRefs.push({ level: level.id, item })
        }
      }
      for (const ch of this.ownChallenges(level)) {
        if (!ch.solution?.trim()) continue
        data.cases.push({
          setup: level.database?.setupSql ?? '',
          alt: level.database?.altSetupSql ?? '',
          solution: ch.solution,
          ordered: Boolean(ch.validation.ordered),
          checks: ch.validation.tests ?? [],
          variants: { solution: ch.solution, starter: ch.starterCode ?? '', empty: '' },
        })
        caseRefs.push({
          where: { level: level.id, item: ch.title, id: ch.id },
          starterBlank: !(ch.starterCode ?? '').trim(),
          changesData: Boolean(ch.validation.tests?.length),
        })
      }
      // Only questions about a query's result can be run.
      for (const question of this.askedQuestions(level, ({ expr }) => /^\s*(SELECT|WITH)\b/i.test(expr))) {
        quiz.quiz.push({ lang: 'sql', setup: level.database?.setupSql ?? '', ...question.asked })
        asked.push(question)
      }
    }

    const sql = data.cases.length || data.runs.length ? this.engine.run('run_sql', data) : { cases: [], runs: [] }
    sql.cases.forEach((res, i) => {
      const { where, starterBlank, changesData } = caseRefs[i]
      this.reportAnswers(section, where, res.variants, { starterBlank })
      if (!changesData && res.mainRows === 0) section.add(where, 'empty-result')
      if (res.altSame) section.add(where, 'alt-same')
      if (res.ties) section.add(where, 'order-ties')
    })
    sql.runs.forEach((message, i) => {
      if (message) section.add(runRefs[i], 'sample-error', message)
    })

    const ran = quiz.quiz.length ? this.engine.run('run_quiz', quiz) : { quiz: [] }
    this.reportQuizAnswers(section, asked, ran.quiz)
  }
}
