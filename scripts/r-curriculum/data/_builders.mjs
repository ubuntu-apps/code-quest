/**
 * Builders for R stages. A stage is written like a Python or SQL one: lesson paragraphs,
 * sandbox code and samples, challenges and a gate.
 *
 * R challenges are checked by R tests that run after the learner's code, in the same
 * environment (src/features/curriculum/rSandbox.ts). In a test:
 * - the learner's variables are there by name (`total`, `greeting`);
 * - `._cq_stdout` is what the code printed, as the R console shows it (`[1] 5`);
 * - `._cq_code` is the code itself, to check a function was used.
 * Use the helpers below (`near`, `prints`, `uses`) rather than writing tests by hand.
 *
 * Gate questions can carry a `check` that `check-in-browser.mjs` runs in R, so answers
 * that are R output are tested too. Checks are not published.
 */

/** Tag for R code: backslashes stay exactly as written. */
export const r = String.raw

/** A code block for lesson text, one line per argument: code(r`cat("Hi\n")`, 'x <- 5'). */
export const code = (...lines) => `\`\`\`\n${lines.join('\n')}\n\`\`\``

/** An R string literal. */
export const rstr = (text) => JSON.stringify(text)

/** A test that `name` is a number equal to `value` (allowing for rounding in the last digits). */
export const near = (name, value) => `is.numeric(${name}) && isTRUE(all.equal(${name}, ${value}))`

/** A test that `name` is exactly this text. */
export const isText = (name, value) => `identical(${name}, ${rstr(value)})`

/** A test that `name` is exactly TRUE or FALSE. */
export const isLogical = (name, value) => `identical(${name}, ${value ? 'TRUE' : 'FALSE'})`

/** A test that the code printed exactly these lines (spaces at line ends don't count). */
export const prints = (...lines) =>
  `identical(trimws(strsplit(._cq_stdout, "\\n", fixed = TRUE)[[1]], "right"), c(${lines.map(rstr).join(', ')}))`

/** A test that the code contains this text, e.g. `uses('round(')`. */
export const uses = (text) => `grepl(${rstr(text)}, ._cq_code, fixed = TRUE)`

/** A test that the code matches a regular expression, e.g. `matches(',\\s*cups\\s*,')`. */
export const matches = (pattern) => `grepl(${rstr(pattern)}, ._cq_code)`

/** A test that the code does not contain this text, e.g. to make sure an answer isn't typed in. */
export const avoids = (text) => `!grepl(${rstr(text)}, ._cq_code, fixed = TRUE)`

/**
 * @param {object} config
 * @param {string} config.id Stable id (keys learners' progress). Never change it once published.
 * @param {string} config.title
 * @param {string[]} config.paragraphs Lesson text, markdown.
 * @param {string} config.sandboxCode
 * @param {{ id: string, label: string, code: string }[]} config.sandboxSnippets
 * @param {{ label?: string, url: string, source: string }} [config.readMore]
 * @param {object[]} config.challenges Made with `task`.
 * @param {object[]} config.questions Made with `mc`, `qShort` and `qPattern`.
 */
export function makeTopic(config) {
  return { kind: 'topic', ...config }
}

/** A side quest at the end of a quest: a bigger task built up over several challenges. */
export function makeProject(difficulty, config) {
  const label = difficulty === 'easy' ? 'Easy side quest' : difficulty === 'medium' ? 'Medium side quest' : 'Hard side quest'
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
 * An R challenge. `tests` are [label, assertion] pairs: each assertion is R code that
 * must give TRUE after the learner's code has run. The checker makes sure the solution
 * passes and the starter code doesn't.
 *
 * @param {'easy'|'medium'|'hard'|'expert'} difficulty
 * @param {string} title
 * @param {{ prompt: string, starter?: string, hint: string, solution: string, tests: [string, string][], setup?: string }} spec
 */
export function task(difficulty, title, { prompt, starter = '', hint, solution, tests, setup = '' }) {
  const label = { easy: 'Easy', medium: 'Medium', hard: 'Hard', expert: 'Expert' }[difficulty]
  return {
    title: `${label}: ${title}`,
    promptMarkdown: prompt,
    starterCode: starter,
    hint,
    solution,
    validation: {
      mode: 'r_tests',
      setupCode: setup,
      tests: tests.map(([testLabel, assertion], i) => ({ id: `t${i + 1}`, label: testLabel, assertion })),
    },
  }
}

/**
 * Multiple-choice question: `correct` is the index of the right option (vary it: the app
 * shows options in this order), `explanation` says why it is right. `check` (optional,
 * not published): `{ code, output }` or `{ code, error }`, run in R by the checker.
 */
export function mc(prompt, options, correct, explanation, check) {
  const ids = 'abcdefgh'
  return {
    type: 'mcq',
    prompt,
    choices: options.map((label, i) => ({ id: ids[i], label })),
    correctChoiceId: ids[correct],
    explanation,
    ...(check ? { check } : {}),
  }
}

/** Short typed answer, compared ignoring case and extra spaces. */
export function qShort(prompt, expected, explanation, check) {
  return { type: 'shortText', prompt, validation: { mode: 'equalsNormalized', expected }, explanation, ...(check ? { check } : {}) }
}

/**
 * Short typed answer where case matters or several spellings are right: checked with a
 * regular expression. `expected` is the answer shown on reveal.
 */
export function qPattern(prompt, pattern, expected, explanation, check) {
  return { type: 'shortText', prompt, validation: { mode: 'regex', pattern, expected }, explanation, ...(check ? { check } : {}) }
}

/** The R manual most stages point to. */
export const R_INTRO = (section, label) => ({
  label: label ?? 'An Introduction to R',
  url: `https://cran.r-project.org/doc/manuals/r-release/R-intro.html${section ? `#${section}` : ''}`,
  source: 'R manuals',
})
