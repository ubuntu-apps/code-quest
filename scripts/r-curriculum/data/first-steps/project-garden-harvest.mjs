// First steps in R, hard side quest: The garden harvest.
import { code, isLogical, isText, makeProject, mc, near, prints, qShort, r, snippet, task, uses } from '../_builders.mjs'

export default makeProject('hard', {
  id: 'proj_garden_harvest',
  title: 'The garden harvest',
  paragraphs: [
    'Five families share the Elm Street community garden. At the end of the season they weigh the harvest: **12.4 kg of tomatoes** and **8.75 kg of courgettes**. Nobody weighed the beans on the day, so for now the beans are missing.',
    'Later someone finds the note: the beans weighed **3.6 kg**. Then the families share the harvest equally and write a short report:',
    code('Harvest: 24.75 kg', 'Per family: 4.95 kg', 'More tomatoes than courgettes: TRUE', 'Top crop: TOMATOES'),
    'This side quest uses everything in the quest: variables, arithmetic, `NA`, comparisons, functions and text.',
  ],
  sandboxCode: 'tomatoes <- 12.4\nbeans <- NA\ncourgettes <- 8.75\ntomatoes + beans + courgettes',
  sandboxSnippets: [
    snippet('Known weights only', 'tomatoes <- 12.4\ncourgettes <- 8.75\ntomatoes + courgettes'),
    snippet('Capitals', 'toupper("tomatoes")'),
  ],
  challenges: [
    task('easy', 'Weigh the crops', {
      prompt: 'Make `tomatoes` hold `12.4`, `courgettes` hold `8.75`, and `beans` a missing value.',
      hint: 'A missing value is `NA`, without quotes.',
      solution: 'tomatoes <- 12.4\ncourgettes <- 8.75\nbeans <- NA',
      tests: [
        ['tomatoes is 12.4', near('tomatoes', 12.4)],
        ['courgettes is 8.75', near('courgettes', 8.75)],
        ['beans is missing', 'length(beans) == 1 && is.na(beans) && !is.character(beans)'],
      ],
    }),
    task('easy', 'Spot the gap', {
      prompt: 'Make `beans_missing` the answer to: are the beans missing?',
      starter: 'beans <- NA\n',
      hint: '`beans_missing <- is.na(beans)`',
      solution: 'beans <- NA\nbeans_missing <- is.na(beans)',
      tests: [
        ['beans_missing is TRUE', isLogical('beans_missing', true)],
        ['Uses is.na()', uses('is.na(')],
      ],
    }),
    task('medium', 'What we know so far', {
      prompt: 'Adding all three crops gives `NA`. Make `known_total` the weight of the two crops that were weighed.',
      starter: 'tomatoes <- 12.4\ncourgettes <- 8.75\nbeans <- NA\n',
      hint: 'Leave the beans out: `known_total <- tomatoes + courgettes`.',
      solution: 'tomatoes <- 12.4\ncourgettes <- 8.75\nbeans <- NA\nknown_total <- tomatoes + courgettes',
      tests: [['known_total is 21.15', near('known_total', 21.15)]],
    }),
    task('medium', 'The beans turn up', {
      prompt: 'The beans weighed 3.6 kg. Give `beans` its value, then make `total` the weight of all three crops.',
      starter: 'tomatoes <- 12.4\ncourgettes <- 8.75\nbeans <- NA\n',
      hint: '`beans <- 3.6`, then `total <- tomatoes + beans + courgettes`.',
      solution: 'tomatoes <- 12.4\ncourgettes <- 8.75\nbeans <- NA\nbeans <- 3.6\ntotal <- tomatoes + beans + courgettes',
      tests: [
        ['beans is 3.6', near('beans', 3.6)],
        ['total is 24.75', near('total', 24.75)],
      ],
    }),
    task('hard', 'A fair share', {
      prompt: 'Make `share` each family\'s share of the total, rounded to 2 decimal places. Also make `more_tomatoes` the answer to: were there more tomatoes than courgettes?',
      starter: 'tomatoes <- 12.4\ncourgettes <- 8.75\ntotal <- 24.75\nfamilies <- 5\n',
      hint: '`share <- round(total / families, 2)` and `more_tomatoes <- tomatoes > courgettes`.',
      solution: 'tomatoes <- 12.4\ncourgettes <- 8.75\ntotal <- 24.75\nfamilies <- 5\nshare <- round(total / families, 2)\nmore_tomatoes <- tomatoes > courgettes',
      tests: [
        ['share is 4.95', near('share', 4.95)],
        ['more_tomatoes is TRUE', isLogical('more_tomatoes', true)],
      ],
    }),
    task('expert', 'The harvest report', {
      prompt: 'Starting from the weights, show the report:\n\n```\nHarvest: 24.75 kg\nPer family: 4.95 kg\nMore tomatoes than courgettes: TRUE\nTop crop: TOMATOES\n```\n\nMake `top_crop` the text `"tomatoes"` in capitals with `toupper()`.',
      starter: 'tomatoes <- 12.4\ncourgettes <- 8.75\nbeans <- 3.6\nfamilies <- 5\n',
      hint: 'Work out `total`, `share` and `more_tomatoes` as before, set `top_crop <- toupper("tomatoes")`, then four `cat()` lines. The first is `cat("Harvest:", total, "kg\\n")`.',
      solution: r`tomatoes <- 12.4
courgettes <- 8.75
beans <- 3.6
families <- 5
total <- tomatoes + beans + courgettes
share <- round(total / families, 2)
more_tomatoes <- tomatoes > courgettes
top_crop <- toupper("tomatoes")
cat("Harvest:", total, "kg\n")
cat("Per family:", share, "kg\n")
cat("More tomatoes than courgettes:", more_tomatoes, "\n")
cat("Top crop:", top_crop, "\n")`,
      tests: [
        ['top_crop is "TOMATOES"', isText('top_crop', 'TOMATOES')],
        ['Shows the report', prints('Harvest: 24.75 kg', 'Per family: 4.95 kg', 'More tomatoes than courgettes: TRUE', 'Top crop: TOMATOES')],
      ],
    }),
  ],
  questions: [
    mc('What does `12.4 + NA + 8.75` give?', ['`21.15`', '`NA`', '`0`', 'An error'], 1,
      'One unknown weight makes the total unknown.',
      { code: '12.4 + NA + 8.75', output: '[1] NA' }),
    mc('What does `is.na(3.6)` give?', ['`TRUE`', '`NA`', '`FALSE`', '`3.6`'], 2,
      '3.6 is a real value, so it is not missing.',
      { code: 'is.na(3.6)', output: '[1] FALSE' }),
    mc('What does `12.4 + 8.75` give?', ['`20.15`', '`21.15`', '`21.5`', '`20.79`'], 1,
      '12.4 + 8.75 = 21.15.',
      { code: '12.4 + 8.75', output: '[1] 21.15' }),
    mc('What does `round(24.75 / 5, 2)` give?', ['`4.95`', '`5`', '`4.9`', '`123.75`'], 0,
      '24.75 / 5 is exactly 4.95.',
      { code: 'round(24.75 / 5, 2)', output: '[1] 4.95' }),
    mc('What does `toupper("tomatoes")` give?', ['`"Tomatoes"`', '`"tomatoes"`', '`TOMATOES`, without quotes', '`"TOMATOES"`'], 3,
      '`toupper()` gives text, so R shows it in quotes, all in capitals.',
      { code: 'toupper("tomatoes")', output: '[1] "TOMATOES"' }),
    mc('What does `12.4 > 8.75` give?', ['`TRUE`', '`FALSE`', '`3.65`', '`NA`'], 0,
      '12.4 is greater than 8.75.',
      { code: '12.4 > 8.75', output: '[1] TRUE' }),
    qShort('How does R write a missing value?', 'NA',
      '`NA` (no quotes) means "not available".'),
  ],
})
