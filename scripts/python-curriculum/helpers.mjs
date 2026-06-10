/** @typedef {'easy'|'medium'|'hard'|'expert'} Difficulty */

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
 */
export function mcq(prompt, choices, correctChoiceId) {
  return {
    id: uid('q'),
    type: 'mcq',
    prompt,
    choices,
    correctChoiceId,
  }
}

/**
 * @param {string} prompt
 * @param {string} expected
 */
export function shortText(prompt, expected) {
  return {
    id: uid('q'),
    type: 'shortText',
    prompt,
    validation: { mode: 'equalsNormalized', expected },
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
    intro: {
      title: topic.introTitle,
      bodyMarkdown: introBody(topic.paragraphs),
      sandboxCode: topic.sandboxCode,
      readMore: topic.readMore,
    },
    challenges: topic.challenges,
    test: {
      passingScorePercent: 70,
      questions: topic.questions,
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
