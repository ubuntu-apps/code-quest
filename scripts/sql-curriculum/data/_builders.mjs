/**
 * Builders for SQL lessons. A topic is written like a Python one (lesson paragraphs,
 * sandbox code and samples, challenges, quiz), plus the database it runs on.
 *
 * SQL challenges are graded by comparing the learner's result with the solution's:
 * the same columns, the same rows (in the same order when the solution uses ORDER BY),
 * and the same again on the database's other rows, so typing the answer in doesn't pass.
 */

/** Tag for SQL: backslashes stay exactly as written. */
export const sql = String.raw

/**
 * @param {object} config
 * @param {string} config.id Stable id (keys learners' progress).
 * @param {string} config.title
 * @param {string[]} config.paragraphs Lesson text, markdown; ``` blocks starting with SELECT get "Try it".
 * @param {{ setupSql: string, altSetupSql: string, tables: { name: string, columns: string[] }[] }} config.database
 * @param {string} config.sandboxCode
 * @param {{ id: string, label: string, code: string }[]} config.sandboxSnippets
 * @param {{ label?: string, url: string, source: string }} [config.readMore]
 * @param {object[]} config.challenges Made with `query`.
 * @param {object[]} config.questions Made with `mc` and `qShort`.
 */
export function makeTopic(config) {
  return { kind: 'topic', ...config }
}

/** A project at the end of a section: a bigger task built up over several challenges. */
export function makeProject(difficulty, config) {
  const label = difficulty === 'easy' ? 'Easy project' : difficulty === 'medium' ? 'Medium project' : 'Hard project'
  return { ...config, title: `${label}: ${config.title}`, kind: 'project', projectDifficulty: difficulty }
}

/** A sample for the sandbox's buttons. */
export function snippet(label, code) {
  const id = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
  return { id: id || 'snippet', label, code }
}

/**
 * A SQL challenge. The learner's last result is compared with the solution's; rows must be
 * in the solution's order when it has ORDER BY (or `ordered: true`). `checks` are
 * [label, query] pairs run afterwards on both databases, for statements that change data.
 *
 * Name every calculated column in the prompt (`AS stock_value`): a column without a name
 * is called by its expression, so `price*2` and `price * 2` would not match.
 *
 * @param {'easy'|'medium'|'hard'|'expert'} difficulty
 * @param {string} title
 * @param {{ prompt: string, starter?: string, hint: string, solution: string, ordered?: boolean, checks?: [string, string][] }} spec
 */
export function query(difficulty, title, { prompt, starter = '', hint, solution, ordered, checks = [] }) {
  const label = { easy: 'Easy', medium: 'Medium', hard: 'Hard', expert: 'Expert' }[difficulty]
  return {
    title: `${label}: ${title}`,
    promptMarkdown: prompt,
    starterCode: starter,
    hint,
    solution,
    validation: {
      mode: 'sql_tests',
      ordered: ordered ?? /\border\s+by\b/i.test(solution),
      ...(checks.length ? { tests: checks.map(([label, q], i) => ({ id: `t${i + 1}`, label, assertion: q })) } : {}),
    },
  }
}

/**
 * Multiple-choice question: `correct` is the index of the right option (vary it: the app
 * shows options in this order), `explanation` says why it is right.
 */
export function mc(prompt, options, correct, explanation) {
  const ids = 'abcdefgh'
  return {
    type: 'mcq',
    prompt,
    choices: options.map((label, i) => ({ id: ids[i], label })),
    correctChoiceId: ids[correct],
    explanation,
  }
}

/** Short typed answer, compared ignoring case and extra spaces. */
export function qShort(prompt, expected, explanation) {
  return { type: 'shortText', prompt, validation: { mode: 'equalsNormalized', expected }, explanation }
}

/**
 * Short typed answer where case matters (like strftime's %W and %w) or several spellings
 * are right: checked with a regular expression. `expected` is the answer shown on reveal.
 */
export function qPattern(prompt, pattern, expected, explanation) {
  return { type: 'shortText', prompt, validation: { mode: 'regex', pattern, expected }, explanation }
}
