// Functions and control flow: Checking inputs.
import { code, makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

const isFn = (name) => `is.function(${name})`
const fails = (call) => `inherits(tryCatch(${call}, error = function(e) e), "error")`

export default makeTopic({
  id: 'checking_inputs',
  title: 'Checking inputs',
  paragraphs: [
    'A function used by other people (or by you, next month) will one day get a wrong input: text instead of a number, a negative age, an empty vector. It is much better to stop with a clear message than to quietly give a wrong answer.',
    '`stop()` ends the function with an error message of your choice:',
    code('ride_cost <- function(minutes) {', '  if (minutes < 0) {', '    stop("minutes can\'t be negative")', '  }', '  1 + 0.15 * minutes', '}', 'ride_cost(-5)    # Error: minutes can\'t be negative'),
    '`stopifnot()` is a short way to check several things at once: it stops if any of them isn\'t TRUE. `stopifnot(is.numeric(minutes), all(minutes >= 0))`.',
    '`return()` gives back a value **straight away**, without running the rest of the body. It is handy for special cases at the start:',
    code('average <- function(x) {', '  if (length(x) == 0) return(NA)', '  sum(x) / length(x)', '}'),
    '`warning()` is the gentle version of `stop()`: it shows a message but carries on. Use it when the input is unusual but the function can still give a sensible answer.',
  ],
  sandboxCode: 'ride_cost <- function(minutes) {\n  if (minutes < 0) {\n    stop("minutes can\'t be negative")\n  }\n  1 + 0.15 * minutes\n}\nride_cost(20)',
  sandboxSnippets: [
    snippet('A clear error', '# Run it and read the error\nride_cost <- function(minutes) {\n  if (minutes < 0) stop("minutes can\'t be negative")\n  1 + 0.15 * minutes\n}\nride_cost(-5)'),
    snippet('stopifnot', '# Run it and read the error\nsafe_mean <- function(x) {\n  stopifnot(is.numeric(x))\n  mean(x)\n}\nsafe_mean("12")'),
  ],
  readMore: { label: 'R documentation: stop()', url: 'https://stat.ethz.ch/R-manual/R-devel/library/base/html/stop.html', source: 'R documentation' },
  challenges: [
    task('easy', 'No negative minutes', {
      prompt: 'Add a check so `ride_cost()` stops with an error when `minutes` is negative.',
      starter: 'ride_cost <- function(minutes) {\n  1 + 0.15 * minutes\n}\n',
      hint: 'At the start of the body: `if (minutes < 0) stop("minutes can\'t be negative")`.',
      solution: 'ride_cost <- function(minutes) {\n  if (minutes < 0) stop("minutes can\'t be negative")\n  1 + 0.15 * minutes\n}',
      tests: [['ride_cost(20) still works', isFn('ride_cost') + ' && isTRUE(all.equal(ride_cost(20), 4))'], ['ride_cost(-5) is an error', fails('ride_cost(-5)')]],
    }),
    task('easy', 'Numbers only', {
      prompt: 'Add `stopifnot()` so `safe_mean()` stops when `x` isn\'t numeric.',
      starter: 'safe_mean <- function(x) {\n  mean(x)\n}\n',
      hint: 'First line of the body: `stopifnot(is.numeric(x))`.',
      solution: 'safe_mean <- function(x) {\n  stopifnot(is.numeric(x))\n  mean(x)\n}',
      tests: [['safe_mean(c(2, 4)) is 3', isFn('safe_mean') + ' && isTRUE(all.equal(safe_mean(c(2, 4)), 3))'], ['safe_mean("12") is an error', fails('safe_mean("12")')]],
    }),
    task('medium', 'Empty input', {
      prompt: 'Make `average(x)` give `NA` straight away when `x` is empty, using `return()`.',
      starter: 'average <- function(x) {\n  sum(x) / length(x)\n}\n',
      hint: 'First line: `if (length(x) == 0) return(NA)`.',
      solution: 'average <- function(x) {\n  if (length(x) == 0) return(NA)\n  sum(x) / length(x)\n}',
      tests: [['average(c(2, 4)) is 3', isFn('average') + ' && isTRUE(all.equal(average(c(2, 4)), 3))'], ['average(numeric(0)) is NA', 'identical(average(numeric(0)), NA)']],
    }),
    task('medium', 'Your own message', {
      prompt: 'Write `age_band(age)` that stops with the message `"age must be between 0 and 120"` for ages outside 0 to 120, and otherwise gives `"adult"` for 18 or more and `"young"` for under 18.',
      hint: 'Check first: `if (age < 0 || age > 120) stop("age must be between 0 and 120")`. Then an `if`/`else` for the band.',
      solution: 'age_band <- function(age) {\n  if (age < 0 || age > 120) stop("age must be between 0 and 120")\n  if (age >= 18) "adult" else "young"\n}',
      tests: [['age_band(34) is "adult", age_band(12) is "young"', isFn('age_band') + ' && identical(age_band(34), "adult") && identical(age_band(12), "young")'], ['age_band(150) stops with the message', 'identical(tryCatch(age_band(150), error = function(e) conditionMessage(e)), "age must be between 0 and 120")']],
    }),
    task('medium', 'Missing value in', {
      prompt: 'Make `fine(days_late)` give `0` when `days_late` is NA, using `return()`, and otherwise `days_late * 0.25`.',
      starter: 'fine <- function(days_late) {\n  days_late * 0.25\n}\n',
      hint: 'First line: `if (is.na(days_late)) return(0)`.',
      solution: 'fine <- function(days_late) {\n  if (is.na(days_late)) return(0)\n  days_late * 0.25\n}',
      tests: [['fine(8) is 2', isFn('fine') + ' && isTRUE(all.equal(fine(8), 2))'], ['fine(NA) is 0', 'isTRUE(all.equal(fine(NA), 0))']],
    }),
    task('hard', 'Several checks at once', {
      prompt: 'Make `percent(part, whole)` stop unless both are numeric and `whole` is more than 0, using one `stopifnot()`. It gives `part / whole * 100`.',
      hint: '`stopifnot(is.numeric(part), is.numeric(whole), whole > 0)`',
      solution: 'percent <- function(part, whole) {\n  stopifnot(is.numeric(part), is.numeric(whole), whole > 0)\n  part / whole * 100\n}',
      tests: [['percent(3, 4) is 75', isFn('percent') + ' && isTRUE(all.equal(percent(3, 4), 75))'], ['percent(3, 0) is an error', fails('percent(3, 0)')], ['percent("3", 4) is an error', fails('percent("3", 4)')]],
    }),
    task('hard', 'A warning, not an error', {
      prompt: 'Make `speed(km, minutes)` give km per hour. If `minutes` is under 1, it should call `warning("very short trip")` but still give the answer.',
      hint: '`if (minutes < 1) warning("very short trip")`, then `km / (minutes / 60)`.',
      solution: 'speed <- function(km, minutes) {\n  if (minutes < 1) warning("very short trip")\n  km / (minutes / 60)\n}',
      tests: [['speed(10, 30) is 20', isFn('speed') + ' && isTRUE(all.equal(speed(10, 30), 20))'], ['speed(0.1, 0.5) warns but gives 12', 'inherits(tryCatch(speed(0.1, 0.5), warning = function(w) w), "warning") && isTRUE(all.equal(suppressWarnings(speed(0.1, 0.5)), 12))']],
    }),
    task('expert', 'A careful grade', {
      prompt: 'Write `grade(score)`: `NA` for a missing score (return early), an error for scores below 0 or above 100, then `"pass"` for 50 or more and `"fail"` otherwise.',
      hint: 'Three steps in order: `if (is.na(score)) return(NA)`, then the range check with `stop()`, then the pass/fail `if`.',
      solution: 'grade <- function(score) {\n  if (is.na(score)) return(NA)\n  if (score < 0 || score > 100) stop("score must be between 0 and 100")\n  if (score >= 50) "pass" else "fail"\n}',
      tests: [['grade(72) is "pass", grade(31) is "fail"', isFn('grade') + ' && identical(grade(72), "pass") && identical(grade(31), "fail")'], ['grade(NA) is NA', 'identical(grade(NA), NA)'], ['grade(140) is an error', fails('grade(140)')]],
    }),
  ],
  questions: [
    mc('What does `stop("too big")` do?', ['Prints a message and carries on', 'Ends with an error showing "too big"', 'Pauses R', 'Returns "too big"'], 1,
      'Nothing after it runs.',
      { code: 'stop("too big")', error: 'too big' }),
    mc('What does `stopifnot(2 > 1, 5 > 9)` do?', ['Nothing', 'Stops: 5 > 9 is not TRUE', 'Returns FALSE', 'Warns only'], 1,
      'Every condition must be TRUE.',
      { code: 'stopifnot(2 > 1, 5 > 9)', error: '5 > 9 is not TRUE' }),
    mc('After `f <- function(x) { if (x > 5) return("big"); "small" }`, what does `f(9)` give?', ['`"small"`', '`"big"`', 'Both', 'An error'], 1,
      '`return()` gives back "big" straight away; the last line never runs.',
      { code: 'f <- function(x) { if (x > 5) return("big"); "small" }\nf(9)', output: '[1] "big"' }),
    mc('What is the difference between `warning()` and `stop()`?', ['None', '`warning()` shows a message and carries on; `stop()` ends with an error', '`stop()` is quieter', '`warning()` ends the function'], 1,
      'Use `warning()` when the answer is still usable.'),
    mc('Why check inputs at the start of a function?', ['It is faster', 'A clear error now is better than a quietly wrong answer later', 'R needs it', 'To make the function shorter'], 1,
      'Wrong answers can spread through a whole analysis unnoticed.'),
    mc('What does `if (5 < 0 || 5 > 120) "bad" else "ok"` give?', ['`"bad"`', '`"ok"`', 'An error', '`TRUE`'], 1,
      'Neither condition is TRUE. `||` is the single-value "or" used in `if`.',
      { code: 'if (5 < 0 || 5 > 120) "bad" else "ok"', output: '[1] "ok"' }),
    mc('Which gives a function\'s answer early, skipping the rest of the body?', ['`stop()`', '`return()`', '`break`', '`next`'], 1,
      '`break` and `next` are for loops; `return()` is for functions.'),
    mc('What does `length(numeric(0))` give?', ['`1`', '`0`', '`NA`', 'An error'], 1,
      'An empty vector has length 0, a case worth checking for.',
      { code: 'length(numeric(0))', output: '[1] 0' }),
    qShort('Which function ends a function with an error message of your choice?', 'stop',
      '`stop("message")`'),
  ],
})
