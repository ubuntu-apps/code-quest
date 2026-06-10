/** @typedef {import('../helpers.mjs').*} */

/**
 * @param {object} config
 */
export function makeTopic(config) {
  return {
    id: config.id,
    title: config.title,
    introTitle: config.introTitle ?? config.title,
    paragraphs: config.paragraphs,
    sandboxCode: config.sandboxCode,
    readMore: config.readMore,
    challengeSpecs: config.challenges,
    questionSpecs: config.questions,
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
