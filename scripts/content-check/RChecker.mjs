/**
 * Checks R stages by running them in webR, the R the app runs. The engine comes from where the
 * check runs: WebREngine in Node (CI), or the app's own WebRRuntime in the dev app's console
 * (r-curriculum/check-in-browser.mjs).
 *
 * Every sandbox sample and "Try it" block must run without an error, unless it says it shows
 * one (then it must show one). For every challenge, the solution must pass, and neither the
 * starter code nor the solution's answer typed in as fixed values may pass (unless the
 * challenge is marked `typedOk`, or has no starter data to work from). Every gate question
 * with a `check` must give the output or error it states.
 *
 * `typedOk` and the questions' checks aren't published, so they come from the stage data
 * (r-curriculum/data/course.mjs).
 */
import { LanguageChecker } from './LanguageChecker.mjs'

const DUMP_MARK = '<<cq-values>>'
/** R code that shows every variable (not functions) as R code that makes it: `x <- c(1, 2)`. */
const DUMP = `
cat("${DUMP_MARK}", paste(unlist(lapply(ls(), function(n) {
  v <- get(n)
  if (is.function(v)) NULL else paste0("\\u0060", n, "\\u0060 <- ", paste(deparse(v), collapse = " "))
})), collapse = "\\n"), "${DUMP_MARK}", sep = "")`

/**
 * What runs R: `run(code)` → { output, error } and `check(code, setup, tests)` → { passed, tests,
 * output, error }. WebREngine in Node, or the app's WebRRuntime in the browser.
 * @typedef {{ run: Function, check: Function, available?: () => Promise<boolean>, start?: () => Promise<void>, stop?: () => Promise<void> }} REngine
 */

export class RChecker extends LanguageChecker {
  /**
   * @param {object} spec language.json
   * @param {REngine} engine
   * @param {object[]} course The stage data, for `typedOk` and the questions' checks.
   * @param {(where: string) => void} [onProgress]
   */
  constructor(spec, engine, course, onProgress = () => {}) {
    super(spec, engine)
    this.onProgress = onProgress
    this.topics = new Map(course.flatMap((s) => s.topics).map((t) => [t.id, t]))
    /** Gate questions with a check that were run. */
    this.checkedQuestions = 0
  }

  /** What the code prints, then its variables written out as R code. */
  async valuesAfter(code) {
    const run = await this.engine.run(code + DUMP)
    const out = run.output ?? ''
    const from = out.indexOf(DUMP_MARK)
    const to = out.lastIndexOf(DUMP_MARK)
    if (run.error || from < 0 || to <= from) return null
    return { printed: out.slice(0, from), values: out.slice(from + DUMP_MARK.length, to).split('\n').filter(Boolean) }
  }

  /**
   * The learner's "answer typed in": the starter code, then what the solution made or changed
   * written out as fixed values, then its output shown as fixed text.
   */
  async typedInCode(challenge) {
    const done = await this.valuesAfter(challenge.solution)
    const start = await this.valuesAfter(challenge.starterCode ?? '')
    if (!done || !start) return null
    const values = done.values.filter((line) => !start.values.includes(line)).join('\n')
    return `${challenge.starterCode ?? ''}\n${values}${done.printed.trim() ? `\ncat(${JSON.stringify(done.printed)})` : ''}`
  }

  /** Lesson code must run, unless it says it shows an error (then it must show one). */
  async checkRuns(where, ownCode, code, section) {
    const run = await this.engine.run(code)
    const demo = this.rules.showsError(ownCode)
    if (run.error && !demo) section.add(where, 'sample-error', run.error.detail)
    else if (!run.error && demo) section.add(where, 'error-demo-runs')
  }

  async checkSection(file, section) {
    for (const level of file.levels) {
      const source = this.topics.get(level.id)
      for (const [item, code] of this.sandboxCode(level)) await this.checkRuns({ level: level.id, item }, code, code, section)
      for (const [i, block] of this.tryItBlocks(level).entries()) {
        await this.checkRuns({ level: level.id, item: `"Try it" block ${i + 1}` }, block.own, block.code, section)
      }
      for (const c of this.ownChallenges(level)) {
        const where = { level: level.id, item: c.title, id: c.id }
        this.onProgress(`${section.key}/${level.id} "${c.title}"`)
        const { setupCode, tests } = c.validation
        const good = await this.engine.check(c.solution, setupCode, tests)
        const why = good.error ? good.error.detail : good.tests.filter((t) => !t.passed).map((t) => `${t.label}: ${t.detail}`).join('; ')
        const starter = await this.engine.check(c.starterCode ?? '', setupCode, tests)
        // With no starter data there is nothing to work from, so the answer is the value itself.
        const typedOk = source?.challenges.find((s) => s.title === c.title)?.typedOk
        const typedCode = !typedOk && c.starterCode && !starter.passed ? await this.typedInCode(c) : null
        const typed = typedCode !== null ? await this.engine.check(typedCode, setupCode, tests) : undefined
        this.reportAnswers(section, where, { solution: { passed: good.passed, detail: `${why}. Output: ${good.output}` }, starter, typed })
      }
      for (const q of source?.questions ?? []) {
        if (q.check) await this.checkQuestion({ level: level.id, item: q.prompt }, q.check, section)
      }
    }
  }

  /** A question's check: `{ code, output }` or `{ code, error }`. */
  async checkQuestion(where, check, section) {
    this.checkedQuestions += 1
    const run = await this.engine.run(check.code)
    if (check.error !== undefined) {
      const message = run.error?.detail ?? ''
      if (!message.includes(check.error)) {
        section.add(where, 'quiz-check-fails', `expected an error with "${check.error}", got ${run.error ? `"${message}"` : `output "${run.output}"`}`)
      }
    } else if (run.error) {
      section.add(where, 'quiz-check-fails', `error ${run.error.detail}`)
    } else if (run.output.trim() !== check.output) {
      section.add(where, 'quiz-check-fails', `expected "${check.output}", got "${run.output.trim()}"`)
    }
  }
}
