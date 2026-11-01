/**
 * The content checker's findings: what each rule means, which ones fail the check, and the
 * printed report (one line per section, then the problems).
 */
export const RULES = {
  'empty-prompt': 'Challenge has no instructions',
  'no-hint': 'Challenge has no hint',
  'no-solution': 'Challenge has no solution',
  'no-tests': 'Challenge has no tests',
  'solution-fails': 'Solution does not pass its own tests',
  'starter-passes': 'Starter code already passes (pre-solved)',
  'empty-passes': 'Empty code passes (setup gives the answer away)',
  'typed-passes': 'Typing the answer in as fixed values passes (no check tries other values)',
  'text-matched': 'Challenge graded by text matching instead of running the code',
  'bad-quiz': 'Quiz question is malformed',
  'quiz-pattern': 'Every multiple-choice answer in this quiz is in the same position',
  'quiz-wrong-answer': 'The quiz answer marked correct is not what the code gives (another choice is)',
  'quiz-check-fails': "The question's check doesn't give the output or error it states",
  'empty-result': 'Solution returns no rows on the lesson data (nothing to compare)',
  'alt-same': 'Solution gives the same result on the other rows, so a typed-in answer could pass',
  'order-ties': 'Rows that tie in the ORDER BY can come in either order, so a correct answer may fail the order check (add a tie-breaker)',
  'sample-error': 'Lesson code (sandbox, sample or "Try it" block) stops with an error',
  'error-demo-runs': 'Lesson code that should show an error runs without one',
}

export class Report {
  /**
   * @param {object} config scripts/curriculum-check.json
   * @param {{ allStrict?: boolean }} [options]
   */
  constructor(config, { allStrict = false } = {}) {
    this.strictSections = new Set(config.strictSections ?? [])
    /** Languages whose typed-in answers fail the check, not only warn. */
    this.strictTypedIn = new Set(config.strictTypedIn ?? [])
    /** Challenges where typing a fixed value in is the whole task. */
    this.typedAllowed = new Set(config.typedAllowed ?? [])
    this.allStrict = allStrict
    this.issues = []
    this.sections = []
  }

  /** The rules and helpers for one section, for the checkers to add issues through. */
  section(languageId, sectionId) {
    const key = `${languageId}/${sectionId}`
    const strict = this.allStrict || this.strictSections.has(key)
    const stats = { key, challenges: 0, strict }
    this.sections.push(stats)
    return {
      key,
      stats,
      /** Adds an issue: where (level, item, challenge id), the rule, and what went wrong. */
      add: ({ level, item, id }, rule, detail = '') => {
        if ((rule === 'typed-passes' || rule === 'alt-same') && this.typedAllowed.has(id)) return
        // Typed-in answers only warn where some challenges are fixed tasks ("print 1 to 10").
        const failing = strict && (rule !== 'typed-passes' || this.strictTypedIn.has(languageId))
        this.issues.push({ section: key, level, item, rule, detail, strict: failing })
      },
    }
  }

  get problems() {
    return this.issues.filter((i) => i.strict)
  }

  /** One line per issue. */
  format(issue) {
    return `${issue.strict ? 'ERROR' : 'warn '} ${issue.section} › ${issue.level} › ${issue.item}: ${RULES[issue.rule] ?? issue.rule}${issue.detail ? ` (${issue.detail})` : ''}`
  }

  /** Prints the table of sections, then the problems (every issue with `verbose`). */
  print({ verbose = false, log = console.log } = {}) {
    const byRule = (list) =>
      Object.entries(list.reduce((acc, i) => ({ ...acc, [i.rule]: (acc[i.rule] ?? 0) + 1 }), {}))
        .map(([rule, n]) => `${n} ${rule}`)
        .join(', ')
    log('Section'.padEnd(36) + 'Challenges'.padStart(11) + 'Issues'.padStart(8) + '  Mode')
    for (const s of this.sections) {
      const found = this.issues.filter((i) => i.section === s.key)
      log(
        s.key.padEnd(36) + String(s.challenges).padStart(11) + String(found.length).padStart(8) +
          `  ${s.strict ? 'strict' : 'report'}` + (found.length ? `  (${byRule(found)})` : ''),
      )
    }
    const listed = verbose ? this.issues : this.problems
    if (listed.length) {
      log('')
      for (const issue of listed) log(this.format(issue))
    }
    log(this.problems.length ? `\n${this.problems.length} problem(s) in strict sections.` : '\nStrict sections are clean.')
  }
}
