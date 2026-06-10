export function rOut(expected) {
  return {
    mode: 'r_tests',
    tests: [
      {
        id: 'out',
        label: 'Correct output',
        assertion: `identical(trimws(_cq_stdout), ${JSON.stringify(expected)})`,
      },
    ],
  }
}

export function rVar(name, assertion, setupCode = '') {
  return {
    mode: 'r_tests',
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

/**
 * @param {string} sectionId
 * @param {object} topic
 */
export function expandTopicChallenges(sectionId, topic) {
  const keyword = topic.needles?.[0] ?? 'print'
  const keyword2 = topic.needles?.[1] ?? keyword
  const starter = topic.starterCode ?? guessStarter(topic.sandboxCode, keyword)

  const base = [
    ch(
      'easy',
      `Use ${keyword}`,
      `Write R code that uses \`${keyword}\` related to **${topic.title}**.`,
      rOut(extractFirstPrintOutput(topic.sandboxCode) ?? 'Hello, R'),
      { starterCode: starter || `${keyword}(`, hints: [`Try ${keyword}() in R.`] },
    ),
    ch(
      'easy',
      'Print a number',
      'Print the number `100` using `print()`.',
      rOut('100'),
      { starterCode: 'print(' },
    ),
    ch(
      'easy',
      'Assign a variable',
      'Create variable `x` with `<-` and set it to `5`, then print `x`.',
      rVar('x', 'x == 5', ''),
      { starterCode: 'x <- ' },
    ),
    ch(
      'medium',
      `Apply ${topic.title}`,
      topic.challengePrompt ?? `Write code demonstrating **${topic.title}**.`,
      topic.regex
        ? regex(topic.regex)
        : rVar('ok', 'ok == TRUE', `ok <- TRUE\n# use ${keyword}`),
      { starterCode: starter },
    ),
    ch(
      'medium',
      'Two-step snippet',
      `Use \`${keyword}\` and \`${keyword2}\` in one script.`,
      includes(keyword, keyword2),
      { starterCode: '' },
    ),
    ch(
      'medium',
      'Vector basics',
      'Create `v <- c(1, 2, 3)` and print `sum(v)`.',
      rOut('6'),
      { starterCode: 'v <- c(1, 2, 3)\n' },
    ),
    ch(
      'hard',
      'Conditional output',
      'Set `n <- 10`. If `n > 0`, print `"positive"`.',
      rOut('positive'),
      { starterCode: 'n <- 10\n' },
    ),
    ch(
      'hard',
      'Function call',
      'Use `length()` on `c(4, 8, 15)` and print the result.',
      rOut('3'),
      { starterCode: 'print(length(' },
    ),
    ch(
      'expert',
      'Topic practice',
      topic.hardPrompt ?? `Combine ideas from **${topic.title}** in a short script using \`${keyword}\`.`,
      includes(keyword),
      { starterCode: '' },
    ),
    ch(
      'expert',
      'Multi-line script',
      `Write at least two lines of R related to **${topic.title}** (include \`${keyword}\`).`,
      includes(keyword),
      { starterCode: topic.sandboxCode?.split('\n')[0] ?? '' },
    ),
  ]

  if (sectionId === 'visualization') {
    base[3] = ch(
      'medium',
      'ggplot scatter',
      'Load ggplot2 and create a scatter plot of `mpg` vs `wt` from `mtcars`.',
      includes('ggplot', 'geom_point'),
      { starterCode: 'library(ggplot2)\nggplot(mtcars, aes(wt, mpg)) + ' },
    )
  }

  if (sectionId === 'data_cleaning' || sectionId === 'data_frames') {
    base[3] = ch(
      'medium',
      'dplyr pipe',
      'Use `%>%` with `filter()` on `mtcars` where `mpg > 20`.',
      includes('%>%', 'filter'),
      { starterCode: 'library(dplyr)\nmtcars %>% ' },
    )
  }

  if (topic.id === 'what_is_r') {
    return [
      ch('easy', 'Print hello R', 'Print exactly `Hello, R!`', rOut('Hello, R!'), { starterCode: 'print(' }),
      ch('easy', 'Print a number', 'Print `42` on its own line.', rOut('42'), { starterCode: 'print(' }),
      ch('easy', 'Two print lines', 'Print `Line 1` then `Line 2` on separate lines.', rOut('Line 1\nLine 2'), {
        starterCode: 'print(',
      }),
      ch('medium', 'Math in print', 'Print the result of `6 * 7`.', rOut('42'), { starterCode: 'print(' }),
      ch('medium', 'Combine text', 'Print `I am learning R.` exactly.', rOut('I am learning R.'), {
        starterCode: 'print(',
      }),
      ch('medium', 'Variable print', 'Set `name <- "Ada"` and print `name`.', rVar('name', 'name == "Ada"', ''), {
        starterCode: 'name <- ',
      }),
      ch('hard', 'Power expression', 'Print `2^10` (1024).', rOut('1024'), { starterCode: 'print(' }),
      ch('hard', 'Paste strings', 'Print `Hello World` using `paste("Hello", "World")`.', rOut('Hello World'), {
        starterCode: 'print(paste(',
      }),
      ch('expert', 'Three-line program', 'Print three lines: your language name, `2024`, and `Ready to analyze!`', includes('print'), {
        starterCode: '',
      }),
      ch('expert', 'Version info', 'Print `R` using `print("R")`.', rOut('R'), { starterCode: 'print(' }),
    ]
  }

  return base
}

/**
 * @param {object} topic
 */
export function expandTopicQuestions(topic) {
  const keyword = topic.shortAnswer ?? topic.needles?.[0] ?? 'print'
  const choices = topic.mcqChoices ?? [
    { id: 'a', label: 'A core R concept for data analysis' },
    { id: 'b', label: 'Unrelated to R' },
    { id: 'c', label: 'Only for compiled languages' },
  ]
  const correct = topic.mcqCorrect ?? 'a'

  return [
    qMcq(topic.mcqPrompt ?? `What best describes ${topic.title}?`, choices, correct),
    qShort(topic.shortPrompt ?? 'Which function prints output in R?', keyword),
    qMcq(
      topic.mcq2Prompt ?? 'R is widely used for:',
      topic.mcq2Choices ?? [
        { id: 'a', label: 'Statistics and data analysis' },
        { id: 'b', label: 'Only mobile UI' },
        { id: 'c', label: 'Only hardware drivers' },
      ],
      topic.mcq2Correct ?? 'a',
    ),
    qShort('What assignment operator is preferred in R?', '<-'),
    qMcq('Missing values in R are represented by:', [{ id: 'a', label: 'NA' }, { id: 'b', label: 'NULL' }, { id: 'c', label: 'NaN only' }], 'a'),
    qShort('Which function combines values into a vector?', 'c'),
    qMcq('Data frames are:', [{ id: 'a', label: 'Tabular structures with columns' }, { id: 'b', label: 'GPU shaders' }, { id: 'c', label: 'Browser cookies' }], 'a'),
    qShort('Type the function to get help on a topic.', '?'),
    qMcq('Expert: Vectorized operations in R:', [{ id: 'a', label: 'Apply element-wise without loops' }, { id: 'b', label: 'Require for loops always' }, { id: 'c', label: 'Disable c()' }], 'a'),
    qShort(`Expert: Name one keyword from ${topic.title}.`, keyword),
  ]
}

function extractFirstPrintOutput(sandboxCode = '') {
  const match = sandboxCode.match(/print\((["'])(.*?)\1\)/)
  return match?.[2] ?? null
}

function guessStarter(sandboxCode = '', keyword = 'print') {
  if (sandboxCode.includes(keyword)) {
    const line = sandboxCode.split('\n').find((l) => l.includes(keyword))
    if (line && !line.trim().startsWith('#')) return line.endsWith('(') ? line : `${line}\n`
  }
  if (keyword === 'print') return 'print('
  return ''
}
