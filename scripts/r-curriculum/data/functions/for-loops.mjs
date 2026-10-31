// Functions and control flow: for loops.
import { code, isText, isTexts, makeTopic, mc, near, prints, qShort, r, snippet, task, uses } from '../_builders.mjs'

export default makeTopic({
  id: 'for_loops',
  title: 'for loops',
  paragraphs: [
    'A `for` loop runs the same code once for each value of a vector. The loop variable takes each value in turn:',
    code('crops <- c("kale", "beans", "mint")', 'for (crop in crops) {', r`  cat("Water the", crop, "\n")`, '}'),
    'A very common pattern is a **running total**: start with 0 before the loop, and add to it each time round:',
    code('rain <- c(2.4, 0, 5.1, 1.2)', 'total <- 0', 'for (mm in rain) {', '  total <- total + mm', '}', 'total    # 8.7'),
    'When you need the position as well as the value, loop over `seq_along(x)`, which gives 1, 2, 3, … up to the length. Then `x[i]` is the value and `i` its position:',
    code('days <- c("Mon", "Tue", "Wed")', 'for (i in seq_along(days)) {', r`  cat(i, days[i], "\n")`, '}'),
    'To collect a result per value, make an empty vector first and fill it in: `out <- numeric(length(x))`, then `out[i] <- …` inside the loop.',
    'Many loops in R can be replaced by vector maths: `sum(rain)` is the same as the running total above, and shorter. Loops shine when each step depends on the one before, or when you are doing something (printing, reading files) rather than calculating.',
  ],
  sandboxCode: r`crops <- c("kale", "beans", "mint")
for (crop in crops) {
  cat("Water the", crop, "\n")
}`,
  sandboxSnippets: [
    snippet('Running total', 'rain <- c(2.4, 0, 5.1, 1.2)\ntotal <- 0\nfor (mm in rain) {\n  total <- total + mm\n}\ntotal'),
    snippet('Position and value', r`days <- c("Mon", "Tue", "Wed")
for (i in seq_along(days)) {
  cat(i, days[i], "\n")
}`),
    snippet('Loop over positions', 'days <- c("Mon", "Tue", "Wed")\nfor (i in seq_along(days)) {\n  cat(i, days[i], "\\n")\n}'),
    snippet('Grow a balance', 'balance <- 200\nfor (year in 1:3) {\n  balance <- balance * 1.1\n  cat("Year", year, ":", balance, "\\n")\n}'),
  ],
  readMore: { label: 'R documentation: Control flow', url: 'https://stat.ethz.ch/R-manual/R-devel/library/base/html/Control.html', source: 'R documentation' },
  challenges: [
    task('easy', 'Say each name', {
      prompt: 'Use a `for` loop to show `Hello, Ana`, `Hello, Ben` and `Hello, Cy`, one per line.',
      starter: 'members <- c("Ana", "Ben", "Cy")\n',
      hint: r`for (m in members) { cat("Hello,", m, "\n") }`,
      solution: r`members <- c("Ana", "Ben", "Cy")
for (m in members) {
  cat("Hello,", m, "\n")
}`,
      tests: [['Shows the three greetings', prints('Hello, Ana', 'Hello, Ben', 'Hello, Cy')], ['Uses for', uses('for (') + ' || ' + uses('for(')]],
    }),
    task('easy', 'Count to five', {
      prompt: 'Use a `for` loop over `1:5` to show the numbers 1 to 5, one per line.',
      hint: r`for (i in 1:5) { cat(i, "\n") }`,
      solution: r`for (i in 1:5) {
  cat(i, "\n")
}`,
      tests: [['Shows 1 to 5', prints('1', '2', '3', '4', '5')], ['Uses for', uses('for')]],
    }),
    task('easy', 'A running total', {
      prompt: 'Make `total` the total rainfall, adding each value in a `for` loop.',
      starter: 'rain <- c(2.4, 0, 5.1, 1.2)\ntotal <- 0\n',
      hint: 'Inside the loop: `total <- total + mm`.',
      solution: 'rain <- c(2.4, 0, 5.1, 1.2)\ntotal <- 0\nfor (mm in rain) {\n  total <- total + mm\n}',
      tests: [['total is 8.7', near('total', 8.7)], ['Uses a loop', uses('for')]],
    }),
    task('medium', 'Numbered list', {
      prompt: 'Show the days numbered, like `1. Mon`, using `seq_along()`.',
      starter: 'days <- c("Mon", "Tue", "Wed")\n',
      hint: r`for (i in seq_along(days)) { cat(i, ". ", days[i], "\n", sep = "") }`,
      solution: r`days <- c("Mon", "Tue", "Wed")
for (i in seq_along(days)) {
  cat(i, ". ", days[i], "\n", sep = "")
}`,
      tests: [['Shows 1. Mon, 2. Tue, 3. Wed', prints('1. Mon', '2. Tue', '3. Wed')], ['Uses seq_along()', uses('seq_along(')]],
    }),
    task('medium', 'Fill a vector', {
      prompt: 'Make `lengths_of` the number of characters in each crop name, filling an empty vector in a loop.',
      starter: 'crops <- c("kale", "beans", "courgettes")\nlengths_of <- numeric(length(crops))\n',
      hint: 'Loop over `seq_along(crops)` and set `lengths_of[i] <- nchar(crops[i])`.',
      solution: 'crops <- c("kale", "beans", "courgettes")\nlengths_of <- numeric(length(crops))\nfor (i in seq_along(crops)) {\n  lengths_of[i] <- nchar(crops[i])\n}',
      tests: [['lengths_of is 4, 5, 10', near('lengths_of', 'c(4, 5, 10)')]],
    }),
    task('medium', 'Count the hot days', {
      prompt: 'Make `hot_days` the number of temperatures over 25, counting with `if` inside a `for` loop.',
      starter: 'temps <- c(22, 27, 31, 24, 26)\nhot_days <- 0\n',
      hint: 'Inside the loop: `if (t > 25) hot_days <- hot_days + 1`.',
      solution: 'temps <- c(22, 27, 31, 24, 26)\nhot_days <- 0\nfor (t in temps) {\n  if (t > 25) {\n    hot_days <- hot_days + 1\n  }\n}',
      tests: [['hot_days is 3', near('hot_days', 3)], ['Uses if in the loop', uses('if')]],
    }),
    task('hard', 'Savings plan', {
      prompt: 'Ana saves 20 in week 1, and each week she saves 5 more than the week before. Make `saved` her total after 8 weeks, with a loop.',
      starter: 'saved <- 0\nthis_week <- 20\n',
      hint: 'Loop 8 times: add `this_week` to `saved`, then add 5 to `this_week`.',
      solution: 'saved <- 0\nthis_week <- 20\nfor (week in 1:8) {\n  saved <- saved + this_week\n  this_week <- this_week + 5\n}',
      tests: [['saved is 300', near('saved', 300)]],
    }),
    task('hard', 'The longest name', {
      prompt: 'With a `for` loop, make `longest` the longest name in `members` (the first one, if two are equally long).',
      starter: 'members <- c("Ana", "Benedict", "Cy", "Dorothy")\n',
      alt: 'members <- c("Kim", "Alexandra", "Jo")\n',
      hint: 'Start with `longest <- ""`. In the loop, keep the name when `nchar(name) > nchar(longest)`.',
      solution: 'members <- c("Ana", "Benedict", "Cy", "Dorothy")\nlongest <- ""\nfor (name in members) {\n  if (nchar(name) > nchar(longest)) longest <- name\n}',
      tests: [['longest is Benedict', isText('longest', 'Benedict')], ['Uses for', uses('for')]],
    }),
    task('expert', 'Best so far', {
      prompt: 'Make `best_so_far` the highest score up to and including each game, in a loop: for scores 12, 18, 15, 22, 20 it is 12, 18, 18, 22, 22.',
      starter: 'scores <- c(12, 18, 15, 22, 20)\nbest_so_far <- numeric(length(scores))\n',
      hint: 'Start with `best_so_far[1] <- scores[1]`, then for `i` in `2:length(scores)`, take the `max()` of the previous best and `scores[i]`.',
      solution: 'scores <- c(12, 18, 15, 22, 20)\nbest_so_far <- numeric(length(scores))\nbest_so_far[1] <- scores[1]\nfor (i in 2:length(scores)) {\n  best_so_far[i] <- max(best_so_far[i - 1], scores[i])\n}',
      tests: [['best_so_far is 12, 18, 18, 22, 22', near('best_so_far', 'c(12, 18, 18, 22, 22)')]],
    }),
    task('expert', 'Growing savings', {
      prompt: 'Savings grow by `rate` each year. Make `history` the balance at the end of each of the `years`, using a loop.',
      starter: 'balance <- 200\nrate <- 0.1\nyears <- 4\n',
      hint: 'Make `history <- numeric(years)` first. Each time round: `balance <- balance * (1 + rate)`, then `history[y] <- balance`.',
      solution: 'balance <- 200\nrate <- 0.1\nyears <- 4\nhistory <- numeric(years)\nfor (y in 1:years) {\n  balance <- balance * (1 + rate)\n  history[y] <- balance\n}',
      tests: [['history is 220, 242, 266.2, 292.82', near('history', 'c(220, 242, 266.2, 292.82)')], ['Uses for', uses('for')]],
    }),
  ],
  questions: [
    mc('How many times does `for (x in c(5, 9, 2)) {…}` run?', ['1', '2', '3', '16'], 2,
      'Once for each value.',
      { code: 'n <- 0\nfor (x in c(5, 9, 2)) n <- n + 1\nn', output: '[1] 3' }),
    mc('After `t <- 0; for (v in 1:4) t <- t + v`, what is `t`?', ['`4`', '`10`', '`0`', '`24`'], 1,
      '1 + 2 + 3 + 4.',
      { code: 't <- 0\nfor (v in 1:4) t <- t + v\nt', output: '[1] 10' }),
    mc('What does `seq_along(c("a", "b", "c"))` give?', ['`[1] "a" "b" "c"`', '`[1] 1 2 3`', '`[1] 3`', '`[1] 0 1 2`'], 1,
      'The positions 1 to the length.',
      { code: 'seq_along(c("a", "b", "c"))', output: '[1] 1 2 3' }),
    mc('Inside `for (i in seq_along(x))`, what is `x[i]`?', ['The position', 'The value at that position', 'The length', 'Always the first value'], 1,
      '`i` is the position; `x[i]` the value there.'),
    mc('Why set `total <- 0` before a running-total loop?', ['R needs every loop to start at 0', 'So there is something to add the first value to', 'To stop the loop', 'It isn\'t needed'], 1,
      'Without it, `total + mm` fails the first time: total doesn\'t exist yet.'),
    mc('Why make the result with `numeric(length(x))` before the loop?', ['The vector has the right length already, and the loop fills one position each time', 'Loops need numbers', 'It makes the loop shorter to type', 'R requires it'], 0,
      '`numeric(3)` is `[1] 0 0 0`, ready to be filled.',
      { code: 'numeric(3)', output: '[1] 0 0 0' }),
    mc('Which is a simpler way to total `rain` than a loop?', ['`length(rain)`', '`sum(rain)`', '`rain + rain`', '`max(rain)`'], 1,
      'Vector functions do many loops for you.'),
    mc('After `out <- c(); for (w in c("a", "bb")) out <- c(out, nchar(w))`, what is `out`?', ['`[1] 1 2`', '`[1] 3`', '`[1] "a" "bb"`', '`NULL`'], 0,
      'Each time round adds the length of one word.',
      { code: 'out <- c()\nfor (w in c("a", "bb")) out <- c(out, nchar(w))\nout', output: '[1] 1 2' }),
    qShort('Which function gives the positions 1, 2, 3, … of a vector, for looping?', 'seq_along',
      '`for (i in seq_along(x))`'),
  ],
})
