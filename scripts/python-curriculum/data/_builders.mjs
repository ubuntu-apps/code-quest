/** @typedef {import('../helpers.mjs').*} */

export function makeTopic(config) {
  return {
    id: config.id,
    title: config.title,
    introTitle: config.introTitle ?? config.title,
    paragraphs: config.paragraphs,
    sandboxCode: config.sandboxCode,
    sandboxSnippets: config.sandboxSnippets,
    readMore: config.readMore,
    challengeSpecs: config.challenges,
    questionSpecs: config.questions,
  }
}

/**
 * @param {string} label
 * @param {string} code
 */
export function snippet(label, code) {
  const id = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
  return { id: id || 'snippet', label, code }
}

/**
 * @param {'easy'|'medium'|'hard'} difficulty
 * @param {object} config
 */
export function makeProject(difficulty, config) {
  const label =
    difficulty === 'easy' ? 'Easy project' : difficulty === 'medium' ? 'Medium project' : 'Hard project'
  const title =
    config.title.startsWith('Easy project') ||
    config.title.startsWith('Medium project') ||
    config.title.startsWith('Hard project')
      ? config.title
      : `${label}: ${config.title}`
  return {
    ...makeTopic({ ...config, title }),
    kind: 'project',
    projectDifficulty: difficulty,
  }
}

export function pyOut(expected) {
  return {
    mode: 'python_tests',
    tests: [{ id: 'out', label: 'Correct output', assertion: `_cq_stdout.strip() == ${JSON.stringify(expected)}` }],
  }
}

export function pyVar(name, assertion, setupCode = '') {
  return {
    mode: 'python_tests',
    setupCode,
    tests: [{ id: 'var', label: `Checks ${name}`, assertion }],
  }
}

export function regex(pattern) {
  return { mode: 'regex', pattern }
}

export function includes(...needles) {
  return { mode: 'includesAll', needles }
}

/**
 * @param {string} difficulty
 * @param {string} title
 * @param {string} prompt
 * @param {object} validation
 * @param {object} [extra]
 */
export function ch(difficulty, title, prompt, validation, extra = {}) {
  return {
    difficulty,
    title,
    prompt,
    starterCode: extra.starterCode ?? '',
    hint: extra.hint,
    solution: extra.solution,
    hints: extra.hints,
    validation,
  }
}

/**
 * @param {string} prompt
 * @param {{id:string,label:string}[]} choices
 * @param {string} correct
 */
export function qMcq(prompt, choices, correct) {
  return { type: 'mcq', prompt, choices, correct }
}

/**
 * @param {string} prompt
 * @param {string} expected
 */
export function qShort(prompt, expected) {
  return { type: 'shortText', prompt, expected }
}

/** Tag for Python code: backslashes stay exactly as written (String.raw). */
export const py = String.raw

/**
 * A Python challenge graded by running tests in the app's sandbox.
 * `tests` are [label, assertion] pairs, evaluated after the learner's code runs;
 * `_cq_stdout` holds everything it printed. Use `__import__('json')` etc. in
 * assertions so they don't depend on what the learner imported.
 *
 * @param {'easy'|'medium'|'hard'|'expert'} difficulty
 * @param {string} title
 * @param {{ prompt: string, starter?: string, hint: string, solution: string, tests: [string, string][], setup?: string }} spec
 */
export function task(difficulty, title, { prompt, starter = '', hint, solution, tests, setup = '' }) {
  return ch(
    difficulty,
    title,
    prompt,
    {
      mode: 'python_tests',
      setupCode: setup,
      tests: tests.map(([label, assertion], i) => ({ id: `t${i + 1}`, label, assertion })),
    },
    { starterCode: starter, hint, solution },
  )
}

/**
 * Setup code for challenges that read input: plays the user, so each `input()`
 * call gets the next answer, and the prompt plus answer appear in the output
 * just as they would when someone types them.
 *
 * @param {...string} answers
 */
export function typedInput(...answers) {
  return (
    `_cq_answers = [${answers.map((a) => `'${a.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`).join(', ')}]\n` +
    'def input(prompt=""):\n' +
    '    if not _cq_answers:\n' +
    `        raise EOFError("This check only types ${answers.length} answer(s): call input() fewer times.")\n` +
    '    value = _cq_answers.pop(0)\n' +
    '    print(str(prompt) + value)\n' +
    '    return value\n'
  )
}

/**
 * Multiple-choice question. `options` are labels; `correct` is the index of the right one.
 * Vary `correct` across questions: the app shows choices in this order.
 *
 * @param {string} prompt
 * @param {string[]} options
 * @param {number} correct
 */
export function mc(prompt, options, correct) {
  const ids = 'abcdefgh'
  return qMcq(
    prompt,
    options.map((label, i) => ({ id: ids[i], label })),
    ids[correct],
  )
}
