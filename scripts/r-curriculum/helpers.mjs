/** @typedef {'easy'|'medium'|'hard'} Difficulty */

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
    difficulty === 'easy' ? 'Easy' : difficulty === 'medium' ? 'Medium' : 'Hard'
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
 * @param {object} section
 */
export function buildSection(section) {
  return {
    sectionId: section.sectionId,
    title: section.title,
    levels: section.topics.map(buildLevel),
  }
}

export function includes(...needles) {
  return { mode: 'includesAll', needles }
}

export function regex(pattern) {
  return { mode: 'regex', pattern }
}

/**
 * @param {object} config
 */
export function scaffoldTopic(config) {
  const needles = config.needles ?? []
  const challenges = [
    challenge({
      difficulty: 'easy',
      title: `Recognize ${config.title}`,
      prompt: `Write R code related to **${config.title}**. Include: \`${needles[0] ?? 'print'}\`.`,
      starterCode: config.starterCode ?? '',
      validation: includes(...(needles.length ? needles : ['print'])),
    }),
    challenge({
      difficulty: 'medium',
      title: 'Complete the pattern',
      prompt: config.challengePrompt ?? `Complete code that demonstrates **${config.title}**.`,
      starterCode: config.starterCode ?? config.sandboxCode.split('\n')[0] + '\n',
      validation: config.regex
        ? regex(config.regex)
        : includes(...(needles.length > 1 ? needles.slice(0, 2) : needles.length ? needles : ['print'])),
    }),
    challenge({
      difficulty: 'hard',
      title: 'Apply the concept',
      prompt: config.hardPrompt ?? `Apply **${config.title}** in a short R snippet.`,
      starterCode: '',
      validation: includes(...needles.slice(0, Math.max(1, needles.length))),
    }),
  ]

  const questions = [
    mcq(
      config.mcqPrompt ?? `What best describes ${config.title}?`,
      config.mcqChoices ?? [
        { id: 'a', label: config.mcqA ?? 'A core R concept covered in this topic' },
        { id: 'b', label: 'Unrelated to R programming' },
        { id: 'c', label: 'Only used in compiled languages' },
      ],
      config.mcqCorrect ?? 'a',
    ),
    shortText(
      config.shortPrompt ?? `Name one R keyword or function from this topic.`,
      config.shortAnswer ?? needles[0] ?? 'print',
    ),
    mcq(
      config.mcq2Prompt ?? 'This topic is important in R because:',
      config.mcq2Choices ?? [
        { id: 'a', label: 'It supports data analysis workflows' },
        { id: 'b', label: 'It replaces the operating system' },
        { id: 'c', label: 'It disables vectorization' },
      ],
      config.mcq2Correct ?? 'a',
    ),
  ]

  return {
    id: config.id,
    title: config.title,
    introTitle: config.introTitle ?? config.title,
    paragraphs: config.paragraphs,
    sandboxCode: config.sandboxCode,
    readMore: config.readMore,
    challenges,
    questions,
  }
}
