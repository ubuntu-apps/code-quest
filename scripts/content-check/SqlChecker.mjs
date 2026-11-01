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

export class SqlChecker extends LanguageChecker {
  /** @param {object} spec language.json  @param {import('./PythonEngine.mjs').PythonEngine} engine */
  constructor(spec, engine) {
    super(spec)
    this.engine = engine
  }

  async available() {
    return this.engine.available()
  }

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
    const quizRefs = []
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
      for (const q of level.test?.questions ?? []) {
        const asked = q.type === 'mcq' ? this.askedCode(q.prompt) : null
        // Only questions about a query's result can be run.
        if (!asked || !/^\s*(SELECT|WITH)\b/i.test(asked.expr)) continue
        quiz.quiz.push({ lang: 'sql', setup: level.database?.setupSql ?? '', ...asked })
        quizRefs.push({ where: { level: level.id, item: q.prompt }, q })
      }
    }

    const sql = data.cases.length || data.runs.length ? this.engine.run('run_sql', data) : { cases: [], runs: [] }
    sql.cases.forEach((res, i) => {
      const { where, starterBlank, changesData } = caseRefs[i]
      const v = res.variants
      if (!v.solution.passed) section.add(where, 'solution-fails', v.solution.detail)
      if (v.empty.passed) section.add(where, 'empty-passes')
      else if (!starterBlank && v.starter.passed) section.add(where, 'starter-passes')
      else if (v.typed?.passed) section.add(where, 'typed-passes')
      if (!changesData && res.mainRows === 0) section.add(where, 'empty-result')
      if (res.altSame) section.add(where, 'alt-same')
      if (res.ties) section.add(where, 'order-ties')
    })
    sql.runs.forEach((message, i) => {
      if (message) section.add(runRefs[i], 'sample-error', message)
    })

    const ran = quiz.quiz.length ? this.engine.run('run_quiz', quiz) : { quiz: [] }
    ran.quiz.forEach((values, i) => {
      if (values && this.wrongAnswer(quizRefs[i].q, values)) section.add(quizRefs[i].where, 'quiz-wrong-answer', `it gives ${values[0]}`)
    })
  }
}
