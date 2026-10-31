/**
 * The building blocks every course's lesson files use: lessons, side quests, sandbox
 * samples, challenge titles and quiz questions.
 *
 * Each course has a subclass (python-curriculum/builders.mjs, sql-curriculum/builders.mjs,
 * r-curriculum/builders.mjs) that adds its own challenge builder (`task`, `query`) and test
 * helpers, and overrides what it writes differently. Its `_builders.mjs` makes one instance
 * and exports the methods the lesson files import:
 *
 *   const builders = new RBuilders()
 *   export const { makeTopic, mc, task, near } = builders.exports()
 */
export class CourseBuilders {
  /** Shown before a challenge's title: `Medium: Jump the queue`. */
  static DIFFICULTY_LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Hard', expert: 'Expert' }

  /** Shown before a side quest's title: `Easy side quest: The bike-share week`. */
  static PROJECT_LABELS = { easy: 'Easy side quest', medium: 'Medium side quest', hard: 'Hard side quest' }

  /** Ids for multiple-choice options, in the order they are given. */
  static CHOICE_IDS = 'abcdefgh'

  /**
   * Every public method, bound to this instance, so the lesson files can import them as
   * plain functions. Methods starting with `_` and the constructor are left out.
   * @returns {Record<string, Function>}
   */
  exports() {
    const out = {}
    for (let proto = Object.getPrototypeOf(this); proto && proto !== Object.prototype; proto = Object.getPrototypeOf(proto)) {
      for (const name of Object.getOwnPropertyNames(proto)) {
        if (name === 'constructor' || name === 'exports' || name.startsWith('_') || name in out) continue
        const value = this[name]
        if (typeof value === 'function') out[name] = value.bind(this)
      }
    }
    return out
  }

  /**
   * A lesson. Its fields are written to the JSON by the course's generator.
   * @param {object} config `id`, `title`, `paragraphs`, `sandboxCode`, `sandboxSnippets`, `readMore`, `challenges`, `questions`
   */
  makeTopic(config) {
    return { kind: 'topic', ...config }
  }

  /**
   * A side quest at the end of a section: a bigger task built up over several challenges.
   * Its title gets the label (`Easy side quest: …`) unless it already starts with one.
   */
  makeProject(difficulty, config) {
    const labels = Object.values(this.constructor.PROJECT_LABELS)
    const title = labels.some((label) => config.title.startsWith(label))
      ? config.title
      : `${this.constructor.PROJECT_LABELS[difficulty]}: ${config.title}`
    return { ...this.makeTopic({ ...config, title }), kind: 'project', projectDifficulty: difficulty }
  }

  /** A sample for the sandbox's buttons. */
  snippet(label, code) {
    const id = label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
    return { id: id || 'snippet', label, code }
  }

  /** `challengeTitle('medium', 'Jump the queue')` → `Medium: Jump the queue`. */
  challengeTitle(difficulty, title) {
    return `${this.constructor.DIFFICULTY_LABELS[difficulty]}: ${title}`
  }

  /** `[label, assertion]` pairs → the test objects a challenge's validation holds. */
  _tests(pairs) {
    return pairs.map(([label, assertion], i) => ({ id: `t${i + 1}`, label, assertion }))
  }

  /** Option labels → `{ id, label }` choices. */
  _choices(options) {
    return options.map((label, i) => ({ id: this.constructor.CHOICE_IDS[i], label }))
  }

  /**
   * Multiple-choice question: `correct` is the index of the right option, `explanation`
   * says why it is right.
   */
  mc(prompt, options, correct, explanation) {
    return {
      type: 'mcq',
      prompt,
      choices: this._choices(options),
      correctChoiceId: this.constructor.CHOICE_IDS[correct],
      explanation,
    }
  }

  /** Short typed answer, compared ignoring case and extra spaces. */
  qShort(prompt, expected, explanation) {
    return { type: 'shortText', prompt, validation: { mode: 'equalsNormalized', expected }, explanation }
  }

  /**
   * Short typed answer where case matters or several spellings are right: checked with a
   * regular expression. `expected` is the answer shown on reveal.
   */
  qPattern(prompt, pattern, expected, explanation) {
    return { type: 'shortText', prompt, validation: { mode: 'regex', pattern, expected }, explanation }
  }

  /** A code block for lesson text, one argument per line. */
  code(...lines) {
    return `\`\`\`\n${lines.join('\n')}\n\`\`\``
  }

  /** A block of sample output for lesson text: shown as text, with no "Try it" button. */
  output(...lines) {
    return `\`\`\`text\n${lines.join('\n')}\n\`\`\``
  }
}
