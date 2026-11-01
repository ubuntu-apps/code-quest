/**
 * Checks the published lessons of every course, the same way the app shows and runs them.
 *
 * It goes through public/content/index.json, course by course and section by section. Every
 * challenge and quiz gets the shared checks (instructions, hint, solution, quiz form, answers
 * not all in one position, code challenges not graded by text matching); then the course's
 * LanguageChecker (PythonChecker, SqlChecker, RChecker) runs its code. A course without a
 * checker, or whose engine isn't installed here, gets the shared checks only (and is noted).
 *
 * Findings go to a Report (Report.mjs), which knows the strict sections (scripts/curriculum-check.json).
 */
import { Report } from './Report.mjs'

export class ContentChecker {
  /**
   * @param {object} options
   * @param {import('./ContentSource.mjs').ContentSource} options.source
   * @param {Record<string, (spec: object) => import('./LanguageChecker.mjs').LanguageChecker>} options.checkers Language id → makes its checker.
   * @param {object} options.config scripts/curriculum-check.json
   * @param {string | null} [options.language] Check only this course.
   * @param {string | null} [options.section] Check only this section (`python/data_and_apis`).
   * @param {boolean} [options.allStrict] Treat every section as strict.
   * @param {(message: string) => void} [options.log]
   */
  constructor({ source, checkers, config, language = null, section = null, allStrict = false, log = console.log }) {
    this.source = source
    this.checkers = checkers
    this.language = language
    this.section = section
    this.log = log
    this.report = new Report(config, { allStrict })
    /** Courses whose code wasn't run here, and why. */
    this.skipped = []
  }

  async run() {
    const root = await this.source.content('index.json')
    for (const course of root.languages) {
      if (this.language && course.id !== this.language) continue
      if (this.section && !this.section.startsWith(`${course.id}/`)) continue
      await this.checkCourse(course)
    }
    return this.report
  }

  async checkCourse(course) {
    const index = await this.source.content(course.path)
    const folder = course.path.slice(0, course.path.lastIndexOf('/') + 1)
    const checker = await this.checkerFor(course.id)
    await checker?.start()
    try {
      for (const ref of index.sections) {
        if (this.section && `${course.id}/${ref.id}` !== this.section) continue
        const section = this.report.section(course.id, ref.id)
        const file = await this.source.content(`${folder}${ref.path}`)
        this.checkShared(file, section, this.hasRunnableCode(course.id))
        await checker?.checkSection(file, section)
      }
    } finally {
      await checker?.stop()
    }
  }

  /** The course's checker, if it has one and it can run here. */
  async checkerFor(id) {
    const make = this.checkers[id]
    if (!make) return null
    const checker = make(await this.source.languageSpec(id))
    if (await checker.available()) return checker
    this.skipped.push(`${id}: its engine isn't installed here, so only the shared checks ran`)
    return null
  }

  /** Whether a course's language runs code (it has a language.json), for the text-matching rule. */
  hasRunnableCode(id) {
    return id in this.checkers
  }

  /** The checks every course gets. */
  checkShared(file, section, runsCode) {
    for (const level of file.levels) {
      for (const ch of level.challenges) {
        section.stats.challenges += 1
        const where = { level: level.id, item: ch.title, id: ch.id }
        if (!ch.promptMarkdown?.trim()) section.add(where, 'empty-prompt')
        if (!(ch.hint ?? ch.hints?.[0])?.trim()) section.add(where, 'no-hint')
        if (!ch.solution?.trim()) section.add(where, 'no-solution')
        const mode = ch.validation?.mode
        if (runsCode && (mode === 'includesAll' || mode === 'regex')) section.add(where, 'text-matched', mode)
      }
      const questions = level.test?.questions ?? []
      const answers = questions.filter((q) => q.type === 'mcq').map((q) => q.correctChoiceId)
      if (answers.length >= 4 && new Set(answers).size === 1) {
        section.add({ level: level.id, item: 'quiz' }, 'quiz-pattern', `always "${answers[0]}"`)
      }
      for (const q of questions) {
        const problem = this.quizProblem(q)
        if (problem) section.add({ level: level.id, item: q.prompt }, 'bad-quiz', problem)
      }
    }
  }

  quizProblem(question) {
    if (!question.prompt?.trim()) return 'empty prompt'
    if (question.type === 'mcq') {
      if (!Array.isArray(question.choices) || question.choices.length < 2) return 'fewer than 2 choices'
      if (!question.choices.some((c) => c.id === question.correctChoiceId)) return 'correct choice missing'
    } else if (!question.validation?.expected?.trim() && question.validation?.mode === 'equalsNormalized') {
      return 'no expected answer'
    }
    return null
  }

  /** Prints the report (and the courses whose code wasn't run). */
  print(options) {
    this.report.print({ log: this.log, ...options })
    for (const note of this.skipped) this.log(`Note: ${note}.`)
  }
}
