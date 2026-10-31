// Capstone: Plan your own analysis.
import { code, makeTopic, mc, near, prints, qShort, same, sameFrame, snippet, task } from '../_builders.mjs'

const VISITS = 'visits <- data.frame(\n  date = seq(as.Date("2026-09-07"), by = "day", length.out = 28),\n  visitors = c(112, 98, 105, 120, 134, 76, 41, 108, 95, -1, 118, 140, 81, 38,\n               115, 101, 99, NA, 129, 72, 45, 110, 92, 104, 116, 138, 79, 40)\n)\n'
const CHECK = 'check_visits <- function(df) {\n  problems <- character(0)\n  bad <- sum(is.na(df$visitors) | df$visitors < 0)\n  if (bad > 0) problems <- c(problems, paste(bad, "missing or negative counts"))\n  if (any(diff(df$date) != 1)) problems <- c(problems, "dates have gaps")\n  problems\n}\n'
const CLEAN = 'clean_visits <- function(df) {\n  df$visitors[!is.na(df$visitors) & df$visitors < 0] <- NA\n  df$weekday <- factor(weekdays(df$date), levels = c("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"))\n  df\n}\n'
const READY = VISITS + CHECK + CLEAN + 'clean <- clean_visits(visits)\n'
const REPORT = 'report <- function(df) {\n  per_day <- tapply(df$visitors, df$weekday, mean, na.rm = TRUE)\n  weekend <- df$weekday %in% c("Saturday", "Sunday")\n  c(\n    paste0("Days: ", nrow(df), " (", sum(is.na(df$visitors)), " not counted)"),\n    paste0("Busiest day: ", names(which.max(per_day)), " (", round(max(per_day, na.rm = TRUE), 2), " a day)"),\n    paste0("Weekdays: ", round(mean(df$visitors[!weekend], na.rm = TRUE), 1), " a day, weekends: ", round(mean(df$visitors[weekend], na.rm = TRUE), 1), " a day")\n  )\n}\n'
const OCTOBER = 'october <- data.frame(\n  date = seq(as.Date("2026-10-05"), by = "day", length.out = 7),\n  visitors = c(109, 97, NA, 121, 137, 74, 43)\n)\n'

export default makeTopic({
  id: 'capstone_planning',
  title: 'Plan your own analysis',
  paragraphs: [
    'The best way to keep learning is to analyse data you care about: your sports club\'s results, your own step counts, prices you track, a school survey. This last capstone is about **how** to do that well, in small, checkable steps. The challenges walk through the process on an example, a library\'s daily visitor counts for four weeks, so you can use the same steps on your own data.',
    '**1. Write the question first.** One sentence: "Which days is the library busiest, and is the weekend really quieter?" A clear question tells you which columns matter and when you are done.',
    '**2. Look before you count.** `str()`, `summary()` and `table()` show the types, the range and the odd values. Here a count of −1 and an NA stand out straight away.',
    code(...VISITS.trim().split('\n'), 'summary(visits$visitors)'),
    '**3. Put checking and cleaning in functions.** A function like `check_visits()` that lists the problems, and `clean_visits()` that fixes them, can be run again on next month\'s data with one call, and you can test them.',
    '**4. Test on a tiny example you can work out by hand.** If `clean_visits()` turns `c(5, -1, 7)` into `c(5, NA, 7)`, you can trust it on the real data. `stopifnot()` stops with an error the moment a check is FALSE.',
    '**5. Summarise, compare, then report.** Group summaries answer most questions; a test tells you whether a difference is bigger than chance. Write the report as a function that **returns** its lines, so it can be checked and reused, and say what was left out.',
    'Then take your own data through the same steps: question, look, check, clean, test, summarise, report.',
  ],
  sandboxCode: VISITS + 'str(visits)\nsummary(visits$visitors)',
  sandboxSnippets: [snippet('A test that passes', 'double <- function(x) x * 2\nstopifnot(double(3) == 6, identical(double(c(1, 2)), c(2, 4)))\n"tests passed"'), snippet('A test that fails', 'double <- function(x) x * 2\n# Run it and read the error\nstopifnot(double(3) == 7)')],
  challenges: [
    task('easy', 'Look first', {
      prompt: 'Make `n_days` the number of days in `visits` and `n_problems` the number of counts that are missing or negative.',
      starter: VISITS,
      hint: '`nrow(visits)`; `sum(is.na(visits$visitors) | visits$visitors < 0)`. (`TRUE | NA` is TRUE, so the NA is counted.)',
      solution: VISITS + 'n_days <- nrow(visits)\nn_problems <- sum(is.na(visits$visitors) | visits$visitors < 0)',
      tests: [['n_days is 28', near('n_days', 28)], ['n_problems is 2', near('n_problems', 2)]],
    }),
    task('easy', 'A checking function', {
      prompt: 'Write `check_visits(df)` that gives a text vector of problems: `"2 missing or negative counts"` (with the right number) if there are any, and `"dates have gaps"` if any two dates in a row are not one day apart. With no problems it gives `character(0)`.',
      starter: VISITS,
      hint: 'Start with `problems <- character(0)` and add to it with `c()`. `diff(df$date)` gives the days between neighbouring dates.',
      solution: VISITS + CHECK,
      tests: [['check_visits(visits) is "2 missing or negative counts"', 'is.function(check_visits) && identical(check_visits(visits), "2 missing or negative counts")'], ['A clean table gives character(0)', 'identical(check_visits(data.frame(date = as.Date("2026-01-01") + 0:2, visitors = c(1, 2, 3))), character(0))'], ['A gap is found', 'identical(check_visits(data.frame(date = as.Date("2026-01-01") + c(0, 2), visitors = c(1, 2))), "dates have gaps")']],
    }),
    task('easy', 'A cleaning function', {
      prompt: 'Write `clean_visits(df)` that makes negative counts NA and adds a column `weekday`: the day name as a factor with the levels Monday to Sunday in order. Then make `clean` the cleaned visits.',
      starter: VISITS + CHECK,
      hint: '`df$visitors[!is.na(df$visitors) & df$visitors < 0] <- NA`; `factor(weekdays(df$date), levels = c("Monday", …, "Sunday"))`; end with `df`.',
      solution: READY,
      tests: [['clean has 2 NAs and no negatives', 'sum(is.na(clean$visitors)) == 2 && all(clean$visitors >= 0, na.rm = TRUE)'], ['weekday is a factor from Monday to Sunday', 'is.factor(clean$weekday) && identical(levels(clean$weekday), c("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")) && identical(as.character(clean$weekday[1]), "Monday")']],
    }),
    task('medium', 'Test it by hand', {
      prompt: 'Write `test_clean()` that runs `clean_visits()` on a tiny table you can check by eye, with `stopifnot()`, and gives `TRUE` at the end. Use the counts `c(5, -1, 7)` from 2026-09-07 (a Monday), and check the counts become `c(5, NA, 7)` and the first weekday is Monday.',
      starter: VISITS + CHECK + CLEAN,
      hint: 'Inside: `tiny <- data.frame(date = as.Date("2026-09-07") + 0:2, visitors = c(5, -1, 7))`, `out <- clean_visits(tiny)`, `stopifnot(identical(out$visitors, c(5, NA, 7)), out$weekday[1] == "Monday")`, then `TRUE`.',
      solution: VISITS + CHECK + CLEAN + 'test_clean <- function() {\n  tiny <- data.frame(date = as.Date("2026-09-07") + 0:2, visitors = c(5, -1, 7))\n  out <- clean_visits(tiny)\n  stopifnot(identical(out$visitors, c(5, NA, 7)), out$weekday[1] == "Monday")\n  TRUE\n}\ntest_clean()',
      tests: [['test_clean() gives TRUE', 'is.function(test_clean) && isTRUE(test_clean())'], ['It uses stopifnot()', 'grepl("stopifnot(", paste(deparse(test_clean), collapse = ""), fixed = TRUE)']],
    }),
    task('medium', 'Per weekday', {
      prompt: 'Make `per_weekday` the mean visitors on each weekday, Monday first, leaving out NAs, rounded to 2 decimal places.',
      starter: READY,
      hint: 'The factor levels keep the order: `round(tapply(clean$visitors, clean$weekday, mean, na.rm = TRUE), 2)`.',
      solution: READY + 'per_weekday <- round(tapply(clean$visitors, clean$weekday, mean, na.rm = TRUE), 2)',
      tests: [['per_weekday is 111.25, 96.5, 102.67, 118, 135.25, 77, 41', 'isTRUE(all.equal(as.vector(per_weekday), c(111.25, 96.5, 102.67, 118, 135.25, 77, 41))) && identical(names(per_weekday)[1], "Monday")']],
    }),
    task('medium', 'Week by week', {
      prompt: 'Make `weeks` a data frame with the columns `week` (1 to 4), `total` (visitors, leaving out NAs) and `missing` (days not counted).',
      starter: READY,
      hint: '`clean$week <- rep(1:4, each = 7)`, then `tapply()` twice, or split by week.',
      solution: READY + 'clean$week <- rep(1:4, each = 7)\nweeks <- data.frame(\n  week = 1:4,\n  total = as.vector(tapply(clean$visitors, clean$week, sum, na.rm = TRUE)),\n  missing = as.vector(tapply(is.na(clean$visitors), clean$week, sum))\n)',
      tests: [['weeks is totals 686, 580, 561, 679 with 0, 1, 1, 0 missing', sameFrame('weeks', 'data.frame(week = 1:4, total = c(686, 580, 561, 679), missing = c(0, 1, 1, 0))')]],
    }),
    task('hard', 'Is the weekend quieter?', {
      prompt: 'Make `weekend` TRUE for Saturdays and Sundays, `gap` the weekday mean minus the weekend mean (leaving out NAs), and `clear` TRUE if a t-test of visitors by `weekend` gives p below 0.001.',
      starter: READY,
      hint: '`weekend <- clean$weekday %in% c("Saturday", "Sunday")`; compare `mean(clean$visitors[!weekend], na.rm = TRUE)` and the weekend mean; `t.test(clean$visitors ~ weekend)$p.value`.',
      solution: READY + 'weekend <- clean$weekday %in% c("Saturday", "Sunday")\ngap <- mean(clean$visitors[!weekend], na.rm = TRUE) - mean(clean$visitors[weekend], na.rm = TRUE)\nclear <- t.test(clean$visitors ~ weekend)$p.value < 0.001',
      tests: [['gap is 54', near('gap', 54)], ['clear is TRUE', 'identical(clear, TRUE)']],
    }),
    task('hard', 'A report you can test', {
      prompt: 'Write `report(df)` that **returns** (not shows) these three lines for a cleaned table, then show them for `clean`:\n\n```\nDays: 28 (2 not counted)\nBusiest day: Friday (135.25 a day)\nWeekdays: 113 a day, weekends: 59 a day\n```',
      starter: READY,
      hint: 'Build each line with `paste0()` and return `c(line1, line2, line3)`. Use the weekday means for the busiest day, and round the weekday and weekend means to 1 decimal place. Then `cat(report(clean), sep = "\\n")`.',
      solution: READY + REPORT + 'cat(report(clean), sep = "\\n")\ncat("\\n")',
      tests: [['report(clean) gives the three lines', 'is.function(report) && identical(report(clean), c("Days: 28 (2 not counted)", "Busiest day: Friday (135.25 a day)", "Weekdays: 113 a day, weekends: 59 a day"))'], ['Shows the report', prints('Days: 28 (2 not counted)', 'Busiest day: Friday (135.25 a day)', 'Weekdays: 113 a day, weekends: 59 a day')]],
    }),
    task('expert', 'Next month in one call', {
      prompt: 'Write `analyse(df)` that cleans a raw table and gives its report, and use it on the first week of October, `october`, showing the lines.',
      starter: READY + REPORT + OCTOBER,
      hint: '`analyse <- function(df) report(clean_visits(df))`, then `cat(analyse(october), sep = "\\n")`.',
      solution: READY + REPORT + OCTOBER + 'analyse <- function(df) report(clean_visits(df))\ncat(analyse(october), sep = "\\n")\ncat("\\n")',
      tests: [['analyse(october) gives the October report', 'is.function(analyse) && identical(analyse(october), c("Days: 7 (1 not counted)", "Busiest day: Friday (137 a day)", "Weekdays: 116 a day, weekends: 58.5 a day"))']],
    }),
    task('expert', 'Stop on bad data', {
      prompt: 'Change `analyse(df)` so it first runs `check_visits(df)`: if there is a date gap, it stops with the error `"dates have gaps"`; otherwise it carries on as before. Missing counts are fine, because cleaning handles them.',
      starter: READY + REPORT + OCTOBER,
      hint: '`problems <- check_visits(df)`, then `if ("dates have gaps" %in% problems) stop("dates have gaps")`, then `report(clean_visits(df))`.',
      solution: READY + REPORT + OCTOBER + 'analyse <- function(df) {\n  problems <- check_visits(df)\n  if ("dates have gaps" %in% problems) stop("dates have gaps")\n  report(clean_visits(df))\n}',
      tests: [['analyse(october) still works', 'is.function(analyse) && identical(analyse(october)[1], "Days: 7 (1 not counted)")'], ['A gap stops it with "dates have gaps"', 'identical(tryCatch(analyse(october[-3, ]), error = function(e) conditionMessage(e)), "dates have gaps")']],
    }),
  ],
  questions: [
    mc('Why write the question down before analysing?', ['R needs it', 'It tells you which columns matter and when you have an answer', 'It makes the code faster', 'It is only for reports'], 1,
      'Without one, it is easy to make tables that answer nothing.'),
    mc('What does `TRUE | NA` give?', ['`TRUE`', '`NA`', '`FALSE`', 'An error'], 0,
      'Whatever the NA is, "TRUE or anything" is TRUE.',
      { code: 'TRUE | NA', output: '[1] TRUE' }),
    mc('What does `diff(as.Date(c("2026-09-07", "2026-09-08", "2026-09-10")))` show?', ['Gaps of 1 and 2 days', 'The dates', 'One gap of 3 days', 'An error'], 0,
      'The days between neighbouring dates; anything other than 1 is a gap.',
      { code: 'as.numeric(diff(as.Date(c("2026-09-07", "2026-09-08", "2026-09-10"))))', output: '[1] 1 2' }),
    mc('Why put the cleaning in a function?', ['Functions run faster', 'The same steps can be tested and run again on next month\'s data with one call', 'R requires it', 'To hide the code'], 1,
      'And a change to the rules is made in one place.'),
    mc('What does `stopifnot(1 + 1 == 2, 2 * 2 == 5)` do?', ['Nothing', 'Stops with an error, because the second check is FALSE', 'Gives FALSE', 'Gives TRUE'], 1,
      'Silent when everything is TRUE; an error at the first FALSE.',
      { code: 'stopifnot(1 + 1 == 2, 2 * 2 == 5)', error: '2 * 2 == 5 is not TRUE' }),
    mc('Why test `clean_visits()` on `c(5, -1, 7)` rather than only on the real data?', ['The real data is too big', 'You know the right answer for a tiny example, so a mistake shows at once', 'R can\'t test real data', 'It is faster'], 1,
      'On real data you would have to trust the result you are trying to check.'),
    mc('Weeks 2 and 3 each have a day not counted. What should a weekly report do?', ['Hide it', 'Show the totals and say how many days were missing, since those totals are too low', 'Count the missing days as 0 and say nothing', 'Drop those weeks'], 1,
      'An honest report says what is behind its numbers.'),
    mc('Why should `report()` return its lines instead of showing them with `cat()`?', ['cat() is slow', 'Returned lines can be checked by a test and reused, for example in an email', 'Functions can\'t show things', 'It is shorter'], 1,
      'Showing is then one extra line: `cat(report(clean), sep = "\\n")`.'),
    qShort('Which function stops with an error if any of its checks is FALSE?', 'stopifnot',
      '`stopifnot(identical(out, expected))`'),
  ],
})
