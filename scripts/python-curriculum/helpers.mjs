/** @typedef {'easy'|'medium'|'hard'|'expert'} Difficulty */

import { existsSync, readFileSync } from 'node:fs'

/**
 * Extra checks that run a challenge's code again with other starting values, so an answer
 * typed in as a fixed value (or a comparison that only works for the given numbers) fails.
 * Made by make-variations.py; values are Python literals.
 * @type {Record<string, { set: Record<string, string>, expect: Record<string, string>, tests: { label: string, assertion: string }[] }[]>}
 */
const VARIATIONS_FILE = new URL('./data/variations.json', import.meta.url)
const VARIATIONS = existsSync(VARIATIONS_FILE) ? JSON.parse(readFileSync(VARIATIONS_FILE, 'utf8')) : {}

/** The challenge's tests plus the variation checks for it. */
function withVariations(challenge) {
  const variations = VARIATIONS[challenge.id]
  if (!variations || challenge.validation?.mode !== 'python_tests') return challenge
  const extra = variations.flatMap((variation, i) =>
    variation.tests.map((test, j) => ({ id: `v${i + 1}_${j + 1}`, label: test.label, assertion: test.assertion })),
  )
  return { ...challenge, validation: { ...challenge.validation, tests: [...challenge.validation.tests, ...extra] } }
}

/**
 * @param {string} prefix
 */
export function uid(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

/**
 * @param {string[]} paragraphs
 */
export function introBody(paragraphs) {
  return paragraphs.join('\n\n')
}

/**
 * @param {string} prompt
 * @param {{ id: string, label: string }[]} choices
 * @param {string} correctChoiceId
 * @param {string} [explanation] Why the right answer is right (shown after answering).
 */
export function mcq(prompt, choices, correctChoiceId, explanation) {
  return {
    id: uid('q'),
    type: 'mcq',
    prompt,
    choices,
    correctChoiceId,
    ...(explanation ? { explanation } : {}),
  }
}

/**
 * @param {string} prompt
 * @param {string} expected
 * @param {string} [explanation] Why the right answer is right (shown after answering).
 */
export function shortText(prompt, expected, explanation) {
  return {
    id: uid('q'),
    type: 'shortText',
    prompt,
    validation: { mode: 'equalsNormalized', expected },
    ...(explanation ? { explanation } : {}),
  }
}

/**
 * @param {Difficulty} difficulty
 * @param {string} title
 */
export function challengeTitle(difficulty, title) {
  const label =
    difficulty === 'easy'
      ? 'Easy'
      : difficulty === 'medium'
        ? 'Medium'
        : difficulty === 'hard'
          ? 'Hard'
          : 'Expert'
  return `${label}: ${title}`
}

/**
 * @param {object} spec
 */
export function challenge(spec) {
  return {
    id: uid('ch'),
    title: challengeTitle(spec.difficulty, spec.title),
    promptMarkdown: spec.prompt,
    starterCode: spec.starterCode ?? '',
    hint: spec.hint,
    solution: spec.solution,
    hints: spec.hints,
    validation: spec.validation,
  }
}

/**
 * @param {object} topic
 */
export function buildLevel(topic) {
  return {
    id: topic.id,
    title: topic.title,
    kind: topic.kind ?? 'topic',
    projectDifficulty: topic.projectDifficulty,
    sandboxSnippets: topic.sandboxSnippets,
    intro: {
      title: topic.introTitle,
      bodyMarkdown: introBody(topic.paragraphs),
      sandboxCode: topic.sandboxCode,
      readMore: topic.readMore,
    },
    // Stable IDs (topic + position) so regenerating keeps learners' saved progress.
    challenges: topic.challenges.map((c, i) => withVariations({ ...c, id: `${topic.id}_ch${i + 1}` })),
    test: {
      passingScorePercent: 70,
      questions: topic.questions.map((q, i) => ({ ...q, id: `${topic.id}_q${i + 1}` })),
    },
  }
}

/**
 * @param {object} section
 */
export function buildSection(section) {
  return {
    sectionId: section.sectionId,
    title: section.title,
    levels: section.topics.map(buildLevel),
  }
}
