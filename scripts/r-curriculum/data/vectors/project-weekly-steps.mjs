// Vectors, easy side quest: A week of steps.
import { code, isText, makeProject, mc, near, prints, qShort, r, snippet, task, uses } from '../_builders.mjs'

const STEPS = 'steps <- c(6200, 8400, 5100, 10300, 7600, 12100, 3900)\ndays <- c("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")\n'

export default makeProject('easy', {
  id: 'proj_weekly_steps',
  title: 'A week of steps',
  paragraphs: [
    'Maya is trying to walk 8,000 steps a day. Her phone counted these steps last week:',
    '| Mon | Tue | Wed | Thu | Fri | Sat | Sun |\n| --- | --- | --- | --- | --- | --- | --- |\n| 6200 | 8400 | 5100 | 10300 | 7600 | 12100 | 3900 |',
    'Work out how her week went, then show a short summary:',
    code('Total: 53600', 'Average: 7657', 'Goal met on 3 days', 'Best day: Sat'),
  ],
  sandboxCode: STEPS + 'sum(steps)\nsteps >= 8000',
  sandboxSnippets: [
    snippet('Best day', STEPS + 'days[which.max(steps)]'),
    snippet('Short of the goal', STEPS + '8000 - steps[steps < 8000]'),
  ],
  challenges: [
    task('easy', 'The week in R', {
      prompt: 'Make `steps` the seven step counts, Monday first, and `days` the matching day names `Mon` to `Sun`.',
      hint: 'Two vectors made with `c()`. The day names need quotes.',
      solution: STEPS.trim(),
      tests: [
        ['steps has the seven counts', near('steps', 'c(6200, 8400, 5100, 10300, 7600, 12100, 3900)')],
        ['days is Mon to Sun', 'identical(days, c("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"))'],
      ],
    }),
    task('easy', 'Total and average', {
      prompt: 'Make `total` the steps for the whole week, and `average` the average per day, rounded to a whole number.',
      starter: STEPS,
      hint: '`total <- sum(steps)` and `average <- round(mean(steps))`.',
      solution: STEPS + 'total <- sum(steps)\naverage <- round(mean(steps))',
      tests: [
        ['total is 53600', near('total', 53600)],
        ['average is 7657', near('average', 7657)],
      ],
    }),
    task('medium', 'Goal days', {
      prompt: 'Make `goal_days` the number of days with 8000 steps or more.',
      starter: STEPS,
      hint: '`goal_days <- sum(steps >= 8000)`',
      solution: STEPS + 'goal_days <- sum(steps >= 8000)',
      tests: [['goal_days is 3', near('goal_days', 3)]],
    }),
    task('medium', 'Best and worst', {
      prompt: 'Make `best` the name of the day with the most steps, and `worst` the day with the fewest.',
      starter: STEPS,
      hint: '`best <- days[which.max(steps)]` and `worst <- days[which.min(steps)]`.',
      solution: STEPS + 'best <- days[which.max(steps)]\nworst <- days[which.min(steps)]',
      tests: [
        ['best is "Sat"', isText('best', 'Sat')],
        ['worst is "Sun"', isText('worst', 'Sun')],
      ],
    }),
    task('hard', 'How far short', {
      prompt: 'For each day under the goal, how many more steps would she have needed? Make `short_by` 8000 minus the steps, for those days only.',
      starter: STEPS,
      hint: 'Pick the days under 8000 first: `short_by <- 8000 - steps[steps < 8000]`.',
      solution: STEPS + 'short_by <- 8000 - steps[steps < 8000]',
      tests: [['short_by is 1800, 2900, 400, 4100', near('short_by', 'c(1800, 2900, 400, 4100)')]],
    }),
    task('expert', 'The weekly summary', {
      prompt: 'Show the summary, letting R work out every number and the day:\n\n```\nTotal: 53600\nAverage: 7657\nGoal met on 3 days\nBest day: Sat\n```',
      starter: STEPS,
      hint: 'Four `cat()` lines, such as `cat("Goal met on", sum(steps >= 8000), "days\\n")`.',
      solution: STEPS + r`cat("Total:", sum(steps), "\n")
cat("Average:", round(mean(steps)), "\n")
cat("Goal met on", sum(steps >= 8000), "days\n")
cat("Best day:", days[which.max(steps)], "\n")`,
      tests: [
        ['Shows the summary', prints('Total: 53600', 'Average: 7657', 'Goal met on 3 days', 'Best day: Sat')],
        ['Works out the best day', uses('which.max(')],
      ],
    }),
  ],
  questions: [
    mc('What does `sum(c(6200, 8400, 5100))` give?', ['`19700`', '`6567`', '`3`', '`8400`'], 0,
      'The total of the three counts.',
      { code: 'sum(c(6200, 8400, 5100))', output: '[1] 19700' }),
    mc('What does `sum(c(6200, 8400, 10300) >= 8000)` give?', ['`18700`', '`2`', '`TRUE`', '`24900`'], 1,
      'Two of the three counts meet the goal; TRUE counts as 1.',
      { code: 'sum(c(6200, 8400, 10300) >= 8000)', output: '[1] 2' }),
    mc('After `d <- c("Mon", "Tue", "Wed")` and `s <- c(6200, 8400, 5100)`, what does `d[which.max(s)]` give?', ['`[1] 8400`', '`[1] 2`', '`[1] "Tue"`', '`[1] "Wed"`'], 2,
      'The largest count is at position 2, which is Tuesday.',
      { code: 'd <- c("Mon", "Tue", "Wed")\ns <- c(6200, 8400, 5100)\nd[which.max(s)]', output: '[1] "Tue"' }),
    mc('What does `8000 - c(6200, 7600)` give?', ['`[1] 1800  400`', '`[1] 2200`', '`[1] -1800 -400`', 'An error'], 0,
      'The 8000 is used for each value.',
      { code: '8000 - c(6200, 7600)', output: '[1] 1800  400' }),
    mc('What does `round(mean(c(6200, 8400, 5100)))` give?', ['`6567`', '`6566.667`', '`6600`', '`19700`'], 0,
      'The mean is 6566.67, rounded to a whole number.',
      { code: 'round(mean(c(6200, 8400, 5100)))', output: '[1] 6567' }),
    qShort('Which function gives the position of the largest value?', 'which.max',
      '`which.max()` gives a position; use it to look up the matching day.'),
  ],
})
