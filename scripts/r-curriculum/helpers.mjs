/** @typedef {'easy'|'medium'|'hard'|'expert'} Difficulty */

import { expandTopicChallenges, expandTopicQuestions } from './data/_builders.mjs'

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
  return paragraphs.filter(Boolean).join('\n\n')
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
    intro: {
      title: topic.introTitle ?? topic.title,
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
 * @param {object} topic
 */
export function buildSection(section) {
  return {
    sectionId: section.sectionId,
    title: section.title,
    levels: section.topics.map(buildLevel),
  }
}

/**
 * @param {string} id
 * @param {string} title
 * @param {object} [opts]
 */
export function topic(id, title, opts = {}) {
  const sandbox = opts.sandbox ?? `# ${title}\nprint("Hello, R")`
  const needles = opts.needles ?? ['print']
  return {
    id,
    title,
    introTitle: opts.introTitle ?? title,
    paragraphs: opts.paragraphs ?? [
      opts.lead ?? `${title} is a core topic when learning R for data analysis, statistics, and reproducible research.`,
      opts.detail ??
        'Practicing this topic builds fluency with R syntax, data structures, and the tidyverse ecosystem.',
      'Run the sample code below, experiment in the editor, then work through the challenges.',
    ],
    sandboxCode: sandbox,
    readMore: opts.readMore,
    needles,
    regex: opts.regex,
    starterCode: opts.starterCode,
    challengePrompt: opts.challengePrompt,
    hardPrompt: opts.hardPrompt,
    mcqPrompt: opts.mcqPrompt,
    mcqChoices: opts.mcqChoices,
    mcqCorrect: opts.mcqCorrect,
    shortPrompt: opts.shortPrompt,
    shortAnswer: opts.shortAnswer,
    mcq2Prompt: opts.mcq2Prompt,
    mcq2Choices: opts.mcq2Choices,
    mcq2Correct: opts.mcq2Correct,
  }
}

/**
 * @param {object} topic
 * @param {string} sectionId
 */
export function finalizeTopic(topic, sectionId) {
  return {
    ...topic,
    challenges: expandTopicChallenges(sectionId, topic).map(challenge),
    questions: expandTopicQuestions(topic).map((q) =>
      q.type === 'mcq' ? mcq(q.prompt, q.choices, q.correct) : shortText(q.prompt, q.expected),
    ),
  }
}
