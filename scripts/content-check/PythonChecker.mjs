/**
 * Checks Python lessons by running them (with PythonEngine, through the app's worker helpers).
 *
 * For every challenge graded by tests it runs the solution (must pass every test), the starter
 * code and empty code (must not pass: pre-solved, or setup that gives the answer away), and the
 * solution typed in as fixed values (must not pass, or the checks don't make the learner work
 * anything out; see python-curriculum/protection.mjs). A multiple-choice question that asks what
 * some code gives must mark what it really gives, and the lesson's "Try it" blocks must run.
 */
import { LanguageChecker } from './LanguageChecker.mjs'

export class PythonChecker extends LanguageChecker {
  /** @param {object} spec language.json  @param {import('./PythonEngine.mjs').PythonEngine} engine */
  constructor(spec, engine) {
    super(spec)
    this.engine = engine
  }

  async available() {
    return this.engine.available()
  }

  /**
   * "Try it" blocks the check can't run here: ones that read the keyboard, and ones that go
   * online (urlopen), as well as ones that show an error on purpose.
   */
  skipTry(code) {
    return this.rules.showsError(code) || /\b(input|urlopen)\s*\(/.test(code)
  }

  async checkSection(file, section) {
    const cases = []
    const caseRefs = []
    const quiz = { quiz: [], tries: [] }
    const quizRefs = []
    const tryRefs = []
    for (const level of file.levels) {
      for (const ch of this.ownChallenges(level)) {
        const where = { level: level.id, item: ch.title, id: ch.id }
        if (!ch.validation.tests?.length) {
          section.add(where, 'no-tests')
          continue
        }
        const variants = { starter: ch.starterCode ?? '', empty: '' }
        if (ch.solution?.trim()) variants.solution = ch.solution
        cases.push({ setup: ch.validation.setupCode ?? '', tests: ch.validation.tests, variants })
        caseRefs.push({ where, hasSolution: Boolean(variants.solution), starterBlank: !variants.starter.trim() })
      }
      for (const q of level.test?.questions ?? []) {
        const asked = q.type === 'mcq' ? this.askedCode(q.prompt) : null
        if (!asked) continue
        quiz.quiz.push({ lang: 'python', setup: '', ...asked })
        quizRefs.push({ where: { level: level.id, item: q.prompt }, q })
      }
      for (const block of this.tryItBlocks(level)) {
        if (this.skipTry(block.code)) continue
        quiz.tries.push({ lesson: `${section.key}/${level.id}`, code: block.code })
        tryRefs.push({ level: level.id, item: `"Try it" block: ${block.own.trim().split('\n')[0].slice(0, 50)}` })
      }
    }

    const results = cases.length ? this.engine.run('run_tests', cases) : []
    results.forEach((res, i) => {
      const { where, hasSolution, starterBlank } = caseRefs[i]
      if (hasSolution && !res.solution.passed) section.add(where, 'solution-fails', res.solution.detail)
      if (res.empty.passed) section.add(where, 'empty-passes')
      else if (!starterBlank && res.starter.passed) section.add(where, 'starter-passes')
      else if (res.typed?.passed) section.add(where, 'typed-passes')
    })

    const ran = quiz.quiz.length || quiz.tries.length ? this.engine.run('run_quiz', quiz) : { quiz: [], tries: [] }
    ran.quiz.forEach((values, i) => {
      if (values && this.wrongAnswer(quizRefs[i].q, values)) section.add(quizRefs[i].where, 'quiz-wrong-answer', `it gives ${values[0]}`)
    })
    ran.tries.forEach((message, i) => {
      if (message) section.add(tryRefs[i], 'sample-error', message)
    })
  }
}
