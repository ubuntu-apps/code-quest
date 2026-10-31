// Functions and control flow, hard side quest: The data checker.
import { code, makeProject, mc, prints, qShort, r, sameFrame, snippet, task } from '../_builders.mjs'

const READINGS = `readings <- data.frame(
  sensor = c("A", "A", "B", "B", "C", "C"),
  temp = c(21.4, NA, 22.0, 85.0, 21.8, -40),
  humidity = c(55, 61, NA, 58, 140, 52)
)
`

export default makeProject('hard', {
  id: 'proj_data_checker',
  title: 'The data checker',
  paragraphs: [
    'A school greenhouse sends readings from three sensors. Some are missing, and some are clearly impossible: a greenhouse isn\'t 85 °C or −40 °C, and humidity can\'t be over 100%.',
    code(...READINGS.trim().split('\n')),
    'Write a small set of functions that check any column against a sensible range, then a function that checks a whole table and reports the problems. Next week\'s data can be checked with one call. The last challenge shows:',
    code('temp: 1 missing, 2 out of range', 'humidity: 1 missing, 1 out of range'),
  ],
  sandboxCode: READINGS + 'summary(readings)',
  sandboxSnippets: [snippet('Out of range', READINGS + 'x <- readings$temp\nsum(x < 0 | x > 50, na.rm = TRUE)')],
  challenges: [
    task('easy', 'Count missing', {
      prompt: 'Write `n_missing(x)` that gives the number of NAs in a vector.',
      hint: '`sum(is.na(x))`',
      solution: 'n_missing <- function(x) {\n  sum(is.na(x))\n}',
      tests: [['n_missing(c(1, NA, NA)) is 2', 'is.function(n_missing) && isTRUE(all.equal(n_missing(c(1, NA, NA)), 2))']],
    }),
    task('medium', 'Count out of range', {
      prompt: 'Write `n_outside(x, low, high)` that gives the number of values below `low` or above `high`, ignoring NAs.',
      hint: '`sum(x < low | x > high, na.rm = TRUE)`',
      solution: 'n_outside <- function(x, low, high) {\n  sum(x < low | x > high, na.rm = TRUE)\n}',
      tests: [['n_outside(c(5, NA, 50, -1), 0, 40) is 2', 'is.function(n_outside) && isTRUE(all.equal(n_outside(c(5, NA, 50, -1), 0, 40), 2))']],
    }),
    task('medium', 'Which rows', {
      prompt: 'Write `bad_rows(x, low, high)` that gives the positions of values outside the range (not the NAs).',
      hint: '`which(x < low | x > high)`. `which()` leaves out NAs.',
      solution: 'bad_rows <- function(x, low, high) {\n  which(x < low | x > high)\n}',
      tests: [['bad_rows(c(5, NA, 50, -1), 0, 40) is 3, 4', 'is.function(bad_rows) && identical(bad_rows(c(5, NA, 50, -1), 0, 40), c(3L, 4L))']],
    }),
    task('hard', 'Check one column', {
      prompt: 'Write `check_column(x, low, high)` that gives a named vector with `missing` and `outside`, using your two counting functions.',
      starter: 'n_missing <- function(x) sum(is.na(x))\nn_outside <- function(x, low, high) sum(x < low | x > high, na.rm = TRUE)\n',
      hint: '`c(missing = n_missing(x), outside = n_outside(x, low, high))`',
      solution: 'n_missing <- function(x) sum(is.na(x))\nn_outside <- function(x, low, high) sum(x < low | x > high, na.rm = TRUE)\ncheck_column <- function(x, low, high) {\n  c(missing = n_missing(x), outside = n_outside(x, low, high))\n}',
      tests: [['check_column(c(5, NA, 50, -1), 0, 40) is missing 1, outside 2', 'is.function(check_column) && isTRUE(all.equal(check_column(c(5, NA, 50, -1), 0, 40), c(missing = 1, outside = 2)))']],
    }),
    task('hard', 'Check the table', {
      prompt: 'Write `check_table(df, limits)` where `limits` is a list like `list(temp = c(0, 50), humidity = c(0, 100))`. It gives a data frame with one row per checked column: `column`, `missing`, `outside`.',
      starter: READINGS + 'check_column <- function(x, low, high) c(missing = sum(is.na(x)), outside = sum(x < low | x > high, na.rm = TRUE))\n',
      hint: 'Loop over `names(limits)` (or use `sapply()`), calling `check_column(df[[col]], limits[[col]][1], limits[[col]][2])`, and build the data frame from the results.',
      solution: READINGS + `check_column <- function(x, low, high) c(missing = sum(is.na(x)), outside = sum(x < low | x > high, na.rm = TRUE))
check_table <- function(df, limits) {
  cols <- names(limits)
  res <- sapply(cols, function(col) check_column(df[[col]], limits[[col]][1], limits[[col]][2]))
  data.frame(column = cols, missing = unname(res["missing", ]), outside = unname(res["outside", ]))
}`,
      tests: [['check_table(readings, …) finds the problems', 'is.function(check_table) && ' + sameFrame('check_table(readings, list(temp = c(0, 50), humidity = c(0, 100)))', 'data.frame(column = c("temp", "humidity"), missing = c(1, 1), outside = c(2, 1))')]],
    }),
    task('expert', 'The checker report', {
      prompt: 'Write `report(df, limits)` that shows one line per checked column, then call it on the readings with limits 0 to 50 for temp and 0 to 100 for humidity:\n\n```\ntemp: 1 missing, 2 out of range\nhumidity: 1 missing, 1 out of range\n```',
      starter: READINGS,
      hint: 'Loop over `names(limits)`; for each column work out the two counts and `cat()` a line.',
      solution: READINGS + r`report <- function(df, limits) {
  for (col in names(limits)) {
    x <- df[[col]]
    low <- limits[[col]][1]
    high <- limits[[col]][2]
    n_na <- sum(is.na(x))
    n_out <- sum(x < low | x > high, na.rm = TRUE)
    cat(col, ": ", n_na, " missing, ", n_out, " out of range\n", sep = "")
  }
}
report(readings, list(temp = c(0, 50), humidity = c(0, 100)))`,
      tests: [['Shows the report', prints('temp: 1 missing, 2 out of range', 'humidity: 1 missing, 1 out of range')], ['report is a function', 'is.function(report)']],
    }),
  ],
  questions: [
    mc('What does `sum(c(5, NA, 50) > 40, na.rm = TRUE)` give?', ['`1`', '`NA`', '`2`', '`50`'], 0,
      'Only 50 is over 40; the NA is left out.',
      { code: 'sum(c(5, NA, 50) > 40, na.rm = TRUE)', output: '[1] 1' }),
    mc('What does `which(c(5, NA, 50, -1) < 0 | c(5, NA, 50, -1) > 40)` give?', ['`[1] 2 3 4`', '`[1] 3 4`', '`[1] 50 -1`', '`[1] NA 3 4`'], 1,
      '`which()` gives positions and skips NAs.',
      { code: 'x <- c(5, NA, 50, -1)\nwhich(x < 0 | x > 40)', output: '[1] 3 4' }),
    mc('After `limits <- list(temp = c(0, 50))`, what does `limits[["temp"]][2]` give?', ['`0`', '`50`', '`"temp"`', 'A list'], 1,
      'Take the item, then its second value.',
      { code: 'limits <- list(temp = c(0, 50))\nlimits[["temp"]][2]', output: '[1] 50' }),
    mc('What does `c(missing = 1, outside = 2)["outside"]` give?', ['`1`', '`2`, named outside', '`"outside"`', 'An error'], 1,
      'A named vector, picked by name.',
      { code: 'unname(c(missing = 1, outside = 2)["outside"])', output: '[1] 2' }),
    mc('Why split the checker into small functions?', ['R needs it', 'Each piece is easy to test and reuse, and the big function reads like a description', 'It runs faster', 'To use more memory'], 1,
      'Small, named steps are easier to check and to change.'),
    qShort('Which function gives the positions of the TRUE values in a condition, skipping NAs?', 'which',
      '`which(x < low | x > high)` gives the positions of the bad values.'),
  ],
})
