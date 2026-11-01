/**
 * The base class for checking one language's lessons by running them. A subclass per language
 * (PythonChecker, SqlChecker, RChecker) runs the code on that language's engine; this class
 * holds what they share, starting with the language's own rules from its language.json
 * (which blocks get "Try it", which show an error on purpose), so the checks see the lessons
 * exactly as the app does.
 *
 * ContentChecker.mjs runs the checks every language gets (instructions, hints, quiz form), then
 * calls `checkSection()` with each section's published JSON.
 */
import { LanguageRules } from '../../src/features/languages/LanguageRules.ts'

/** "What does `x` give?" */
const QUESTION_WHAT = /^What (?:does|is|will) `([^`]+)`(?: (?:give|show|print|return|output|evaluate to|be|display))?\??$/
/** "After `a` (and `b`), what is `x`?" */
const QUESTION_AFTER = /^After `([^`]+)`(?:,? and (?:then )?`([^`]+)`)?, what (?:does|is|will) `([^`]+)`(?: (?:give|show|print|return|output|be|hold|contain))?\??$/

export class LanguageChecker {
  /**
   * @param {object} spec The language's language.json.
   * @param {{ available?: () => Promise<boolean>, start?: () => Promise<void>, stop?: () => Promise<void> } | null} engine
   *   What runs the code (PythonEngine, WebREngine, or the app's own runtime in the browser).
   */
  constructor(spec, engine = null) {
    this.rules = new LanguageRules(spec)
    this.engine = engine
  }

  get id() {
    return this.rules.id
  }

  /** Whether this checker can run here (its engine is installed). */
  async available() {
    return this.engine?.available ? this.engine.available() : true
  }

  /** Called before the first section, and after the last. */
  async start() {
    await this.engine?.start?.()
  }

  async stop() {
    await this.engine?.stop?.()
  }

  /**
   * Checks a section by running its code.
   * @param {object} file The section's published JSON.
   * @param {{ key: string, stats: { challenges: number }, add: Function }} section See Report.section().
   */
  async checkSection(_file, _section) {}

  // ---- Shared helpers ----

  /** The lesson text's code blocks, with their info string (```text). */
  fences(level) {
    const blocks = []
    const re = /```(?:(\w*)\n)?([\s\S]*?)```/g
    const text = (level.intro.bodyMarkdown ?? '').trim()
    let m
    while ((m = re.exec(text)) !== null) blocks.push({ content: (m[2] ?? '').trimEnd(), lang: m[1] || '' })
    return blocks
  }

  /**
   * What each "Try it" button in the lesson loads, as the app works it out: `code` is what
   * runs (with the earlier blocks, for languages that build on them), `own` is the block itself.
   */
  tryItBlocks(level) {
    const blocks = this.fences(level)
    return blocks.flatMap((block, index) =>
      this.rules.canTry(block) ? [{ index, code: this.rules.codeToTry(blocks, index), own: block.content }] : [],
    )
  }

  /** The sandbox's starting code and its sample buttons, as [label, code]. */
  sandboxCode(level) {
    return [
      ...(level.intro.sandboxCode ? [['sandbox', level.intro.sandboxCode]] : []),
      ...(level.sandboxSnippets ?? []).map((s) => [`sample "${s.label}"`, s.code]),
    ]
  }

  /** The challenges this language checks by running them. */
  ownChallenges(level) {
    return level.challenges.filter((c) => c.validation?.mode === this.rules.testMode)
  }

  /**
   * The code a quiz question asks about, as { prelude, expr }: "What does `x` give?" or
   * "After `a` (and `b`), what is `x`?". Other questions give null.
   */
  askedCode(prompt) {
    const what = QUESTION_WHAT.exec(prompt.trim())
    if (what) return { prelude: '', expr: what[1] }
    const after = QUESTION_AFTER.exec(prompt.trim())
    if (after) return { prelude: [after[1], after[2]].filter(Boolean).join('\n'), expr: after[3] }
    return null
  }

  /**
   * The quiz questions that ask what some code gives, with that code. `accept` can leave out
   * ones this language can't run (SQL runs only queries).
   */
  askedQuestions(level, accept = () => true) {
    return (level.test?.questions ?? []).flatMap((q) => {
      const asked = q.type === 'mcq' ? this.askedCode(q.prompt) : null
      return asked && accept(asked) ? [{ where: { level: level.id, item: q.prompt }, q, asked }] : []
    })
  }

  /**
   * What running a challenge's answers found: the solution must pass; empty code, the starter
   * and the answer typed in as fixed values must not. Each is `{ passed, detail? }`, or missing
   * when it wasn't run. Only the first of empty, starter and typed-in that passes is reported.
   */
  reportAnswers(section, where, { solution, empty, starter, typed }, { starterBlank = false } = {}) {
    if (solution && !solution.passed) section.add(where, 'solution-fails', solution.detail)
    if (empty?.passed) section.add(where, 'empty-passes')
    else if (!starterBlank && starter?.passed) section.add(where, 'starter-passes')
    else if (typed?.passed) section.add(where, 'typed-passes')
  }

  /** Each asked question's marked answer, against what its code gave (`values[i]`, null when it couldn't run). */
  reportQuizAnswers(section, asked, values) {
    values.forEach((given, i) => {
      if (given && this.wrongAnswer(asked[i].q, given)) section.add(asked[i].where, 'quiz-wrong-answer', `it gives ${given[0]}`)
    })
  }

  /** A choice or a result, compared loosely: no backticks, one kind of quote, single spaces. */
  normalise(text) {
    return String(text)
      .trim()
      .replace(/^`([\s\S]*)`$/, '$1')
      .replace(/"/g, "'")
      .replace(/\s+/g, ' ')
      .trim()
  }

  /** Whether a question's marked answer is wrong: another choice matches what the code gives. */
  wrongAnswer(question, values) {
    const results = new Set(values.map((v) => this.normalise(v)))
    const matching = question.choices.filter((c) => results.has(this.normalise(c.label)))
    return matching.length > 0 && !matching.some((c) => c.id === question.correctChoiceId)
  }
}
