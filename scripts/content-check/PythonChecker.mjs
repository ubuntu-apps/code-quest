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

/** Runs on PythonEngine: `new PythonChecker(spec, engine)`. */
export class PythonChecker extends LanguageChecker {
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
    const asked = []
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
      for (const question of this.askedQuestions(level)) {
        quiz.quiz.push({ lang: 'python', setup: '', ...question.asked })
        asked.push(question)
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
      this.reportAnswers(section, where, { ...res, solution: hasSolution ? res.solution : undefined }, { starterBlank })
    })

    const ran = quiz.quiz.length || quiz.tries.length ? this.engine.run('run_quiz', quiz) : { quiz: [], tries: [] }
    this.reportQuizAnswers(section, asked, ran.quiz)
    ran.tries.forEach((message, i) => {
      if (message) section.add(tryRefs[i], 'sample-error', message)
    })
  }
}
