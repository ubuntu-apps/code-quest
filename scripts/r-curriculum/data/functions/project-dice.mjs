// Functions and control flow, easy side quest: The dice game.
import { code, makeProject, mc, near, prints, qShort, r, snippet, task, uses } from '../_builders.mjs'

export default makeProject('easy', {
  id: 'proj_dice_game',
  title: 'The dice game',
  paragraphs: [
    'The board-game club wants a quick dice simulator. `sample(1:6, 1)` rolls one die: it picks one of the numbers 1 to 6 at random. `sample(1:6, 10, replace = TRUE)` rolls ten.',
    'Random numbers are different every run, which makes them hard to check. `set.seed()` fixes the starting point, so the same "random" rolls come out every time: `set.seed(42)` before the rolls means everyone gets the same ones.',
    code('set.seed(42)', 'sample(1:6, 10, replace = TRUE)'),
    'Build some functions and a little game. The last challenge summarises a fixed set of rolls:',
    code('Rolls: 8', 'Sixes: 3', 'Average: 4.1'),
  ],
  sandboxCode: 'set.seed(42)\nsample(1:6, 10, replace = TRUE)\nsample(1:6, 10, replace = TRUE)',
  sandboxSnippets: [snippet('Same seed, same rolls', 'set.seed(1)\nsample(1:6, 5, replace = TRUE)\nset.seed(1)\nsample(1:6, 5, replace = TRUE)')],
  challenges: [
    task('easy', 'Roll one die', {
      prompt: 'Write `roll_die()`, a function with no arguments that gives one random roll of a die.',
      hint: '`roll_die <- function() { sample(1:6, 1) }`',
      solution: 'roll_die <- function() {\n  sample(1:6, 1)\n}',
      tests: [['roll_die() always gives a whole number from 1 to 6', 'is.function(roll_die) && all(replicate(50, { x <- roll_die(); length(x) == 1 && x %in% 1:6 }))']],
    }),
    task('easy', 'Twenty rolls', {
      prompt: 'With `set.seed(42)` first, make `rolls` twenty rolls of a die.',
      hint: '`set.seed(42)` then `rolls <- sample(1:6, 20, replace = TRUE)`.',
      solution: 'set.seed(42)\nrolls <- sample(1:6, 20, replace = TRUE)',
      tests: [['rolls are the twenty rolls for seed 42', 'local({ set.seed(42); identical(rolls, sample(1:6, 20, replace = TRUE)) })']],
    }),
    task('medium', 'Count the sixes', {
      prompt: 'Make `n_six` the number of sixes in `rolls`.',
      starter: 'set.seed(42)\nrolls <- sample(1:6, 20, replace = TRUE)\n',
      hint: '`n_six <- sum(rolls == 6)`',
      solution: 'set.seed(42)\nrolls <- sample(1:6, 20, replace = TRUE)\nn_six <- sum(rolls == 6)',
      tests: [['n_six counts the sixes', 'isTRUE(all.equal(n_six, sum(rolls == 6))) && !identical(n_six, NULL)']],
    }),
    task('medium', 'Two dice', {
      prompt: 'Write `roll_two()` that gives the total of two dice.',
      hint: '`sum(sample(1:6, 2, replace = TRUE))`',
      solution: 'roll_two <- function() {\n  sum(sample(1:6, 2, replace = TRUE))\n}',
      tests: [['roll_two() gives totals from 2 to 12, and both ends happen', 'is.function(roll_two) && local({ set.seed(9); x <- replicate(500, roll_two()); all(x %in% 2:12) && any(x == 2) && any(x == 12) })']],
    }),
    task('hard', 'Race to 20', {
      prompt: 'With `set.seed(3)`, keep rolling one die and adding to `total` until it reaches at least 20. Make `turns` the number of rolls it took.',
      starter: 'set.seed(3)\ntotal <- 0\nturns <- 0\n',
      hint: 'A `while (total < 20)` loop: add `sample(1:6, 1)` to `total` and 1 to `turns`.',
      solution: 'set.seed(3)\ntotal <- 0\nturns <- 0\nwhile (total < 20) {\n  total <- total + sample(1:6, 1)\n  turns <- turns + 1\n}',
      tests: [['turns is right for seed 3', 'local({ set.seed(3); t <- 0; n <- 0; while (t < 20) { t <- t + sample(1:6, 1); n <- n + 1 }; isTRUE(all.equal(turns, n)) })'], ['Uses while', uses('while')]],
    }),
    task('expert', 'A game summary', {
      prompt: 'Write `summarise_rolls(rolls)` that shows three lines, then call it on the rolls given:\n\n```\nRolls: 8\nSixes: 3\nAverage: 4.1\n```\n\nRound the average to 1 decimal place.',
      starter: 'rolls <- c(3, 6, 2, 6, 5, 1, 6, 4)\n',
      hint: 'The body has three `cat()` lines, using `length(rolls)`, `sum(rolls == 6)` and `round(mean(rolls), 1)`.',
      solution: r`rolls <- c(3, 6, 2, 6, 5, 1, 6, 4)
summarise_rolls <- function(rolls) {
  cat("Rolls:", length(rolls), "\n")
  cat("Sixes:", sum(rolls == 6), "\n")
  cat("Average:", round(mean(rolls), 1), "\n")
}
summarise_rolls(rolls)`,
      tests: [['Shows the summary', prints('Rolls: 8', 'Sixes: 3', 'Average: 4.1')], ['summarise_rolls is a function', 'is.function(summarise_rolls)']],
    }),
  ],
  questions: [
    mc('What can `sample(1:6, 1)` give?', ['Always 1', 'Any whole number from 1 to 6', 'A decimal', 'Six numbers'], 1,
      'It picks one of the numbers at random.'),
    mc('Why use `set.seed()`?', ['To make rolls more random', 'So the same random numbers come out every time, which makes results checkable', 'To roll faster', 'To roll a six'], 1,
      'The same seed gives the same sequence.',
      { code: 'set.seed(5); a <- sample(1:6, 3, replace = TRUE)\nset.seed(5); b <- sample(1:6, 3, replace = TRUE)\nidentical(a, b)', output: '[1] TRUE' }),
    mc('Why `replace = TRUE` for many dice rolls?', ['To allow the same number more than once', 'To sort the rolls', 'To roll faster', 'It isn\'t needed'], 0,
      'Without it, `sample(1:6, 10)` fails: you can\'t pick 10 different numbers from 6.',
      { code: 'sample(1:6, 10)', error: 'cannot take a sample larger than the population' }),
    mc('What does `sum(c(3, 6, 6, 1) == 6)` give?', ['`2`', '`12`', '`16`', '`TRUE`'], 0,
      'Two sixes.',
      { code: 'sum(c(3, 6, 6, 1) == 6)', output: '[1] 2' }),
    mc('What is the smallest total `roll_two()` can give?', ['`0`', '`1`', '`2`', '`6`'], 2,
      'Two ones.'),
    qShort('Which function fixes the starting point of R\'s random numbers?', 'set.seed',
      '`set.seed(42)`'),
  ],
})
