/**
 * Checks JavaScript stages by running them in Node, through the app's own harness
 * (NodeJsEngine.mjs → src/features/languages/javascript/jsHarness.ts).
 *
 * Every sandbox sample and "Try it" block must run without an error, unless it says it shows
 * one (then it must show one). For every challenge, the solution must pass, and neither empty
 * code, the starter code nor the solution's output typed in (`console.log("…")`) may pass,
 * unless the challenge is marked `typedOk`. Every gate question with a `check` must give the
 * output or error it states.
 *
 * `typedOk` and the questions' checks aren't published, so they come from the stage data
 * (javascript-curriculum/data/course.mjs).
 */
import { LanguageChecker } from './LanguageChecker.mjs'

export class JavaScriptChecker extends LanguageChecker {
  /**
   * @param {object} spec language.json
   * @param {import('./NodeJsEngine.mjs').NodeJsEngine} engine
   * @param {object[]} course The stage data, for `typedOk` and the questions' checks.
   */
  constructor(spec, engine, course) {
    super(spec, engine)
    this.topics = new Map(course.flatMap((s) => s.topics).map((t) => [t.id, t]))
    this.checkedQuestions = 0
  }

  /**
   * The learner's "answer typed in": the starter code, then what the solution made written out
   * as fixed values (`const total = 13.5`), then its output logged as fixed text.
   */
  async typedInCode(challenge) {
    const starter = challenge.starterCode ?? ''
    const declared = (code) => [...code.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g)].map((m) => m[1])
    const fresh = [...new Set(declared(challenge.solution))].filter((name) => !declared(starter).includes(name))
    const MARK = '<<cq-values>>'
    const dump = `\n;console.log(${JSON.stringify(MARK)} + JSON.stringify({ ${fresh.map((n) => `${JSON.stringify(n)}: typeof ${n} === 'function' ? undefined : ${n}`).join(', ')} }))`
    const run = await this.engine.run(challenge.solution + dump, challenge.validation.setupCode)
    if (run.error) return null
    const at = run.output.lastIndexOf(MARK)
    if (at < 0) return null
    const printed = run.output.slice(0, at).replace(/\n$/, '')
    const values = JSON.parse(run.output.slice(at + MARK.length))
    const lines = Object.entries(values).map(([name, value]) => `const ${name} = ${JSON.stringify(value)}`)
    return [starter, ...lines, ...(printed ? [`console.log(${JSON.stringify(printed)})`] : [])].filter(Boolean).join('\n')
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
        const { setupCode, tests } = c.validation
        const good = await this.engine.check(c.solution, setupCode, tests)
        const why = good.error ? good.error.detail : good.tests.filter((t) => !t.passed).map((t) => `${t.label}${t.detail ? `: ${t.detail}` : ''}`).join('; ')
        const empty = await this.engine.check('', setupCode, tests)
        const starter = await this.engine.check(c.starterCode ?? '', setupCode, tests)
        const typedOk = source?.challenges.find((s) => s.title === c.title)?.typedOk
        const typedCode = !typedOk && good.passed ? await this.typedInCode(c) : null
        const typed = typedCode !== null ? await this.engine.check(typedCode, setupCode, tests) : undefined
        this.reportAnswers(section, where, { solution: { passed: good.passed, detail: `${why}. Output: ${good.output}` }, empty, starter, typed })
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
