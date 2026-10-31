// Cleaning data, hard side quest: Sensor readings.
import { code, makeProject, mc, prints, qShort, snippet, task } from '../_builders.mjs'

const RAW = 'raw <- "time,sensor,temp\n2026-10-28 08:00,A,18.2\n2026-10-28 12:00,A,-999\n2026-10-28 16:00,A,21.4\n2026-10-28 08:00,B,error\n2026-10-28 12:00,B,22.9\n2026-10-28 16:00,B,23.5\n2026-10-29 08:00,A,17.6\n2026-10-29 12:00,A,20.8\n2026-10-29 16:00,A,61.0\n2026-10-29 08:00,B,17.9\n2026-10-29 12:00,B,\n2026-10-29 16:00,B,22.1"\n'
const READ = 'readings <- read.csv(text = raw, na.strings = c("", "error", "-999"))\n'
const DAY = 'readings$day <- as.Date(substr(readings$time, 1, 10))\n'
const FAULT = 'readings$temp[readings$temp > 50] <- NA\n'

export default makeProject('hard', {
  id: 'proj_sensor_readings',
  title: 'Sensor readings',
  paragraphs: [
    'Two temperature sensors in the school greenhouse log a reading three times a day. When one fails it writes `-999` or `error`, or nothing at all, and sensor A once logged 61 °C on a cool autumn afternoon.',
    code(...RAW.trim().split('\n')),
    'Turn every failure into a real NA, remove the impossible value, and build a daily summary. The last challenge shows:',
    code('2026-10-28: 4 readings, mean 21.5, max 23.5', '2026-10-29: 4 readings, mean 19.6, max 22.1'),
  ],
  sandboxCode: RAW + 'readings <- read.csv(text = raw)\nstr(readings)',
  sandboxSnippets: [snippet('Fix while reading', RAW + READ + 'summary(readings$temp)')],
  challenges: [
    task('easy', 'Failures as NA', {
      prompt: 'Read `raw` into `readings` so that empty values, `error` and `-999` all become NA, making `temp` numeric.',
      starter: RAW,
      hint: '`read.csv(text = raw, na.strings = c("", "error", "-999"))`',
      solution: RAW + READ,
      tests: [['temp is numeric with 3 NAs', 'is.data.frame(readings) && is.numeric(readings$temp) && sum(is.na(readings$temp)) == 3']],
    }),
    task('medium', 'The day', {
      prompt: 'Add a column `day`: the date part of `time`, as a real date.',
      starter: RAW + READ,
      hint: 'The first 10 characters are the date: `as.Date(substr(readings$time, 1, 10))`.',
      solution: RAW + READ + DAY,
      tests: [['day is 6 of 2026-10-28 then 6 of 2026-10-29', 'inherits(readings$day, "Date") && identical(format(readings$day), rep(c("2026-10-28", "2026-10-29"), each = 6))']],
    }),
    task('medium', 'Impossible values', {
      prompt: 'A greenhouse in October isn\'t over 50 °C. Make those temperatures NA.',
      starter: RAW + READ + DAY,
      hint: '`readings$temp[readings$temp > 50] <- NA`. The NAs already there stay NA.',
      solution: RAW + READ + DAY + FAULT,
      tests: [['temp now has 4 NAs and nothing over 50', 'sum(is.na(readings$temp)) == 4 && max(readings$temp, na.rm = TRUE) <= 50']],
    }),
    task('hard', 'Gaps per sensor', {
      prompt: 'Make `gaps` the number of missing readings per sensor.',
      starter: RAW + READ + DAY + FAULT,
      hint: '`tapply(is.na(readings$temp), readings$sensor, sum)`',
      solution: RAW + READ + DAY + FAULT + 'gaps <- tapply(is.na(readings$temp), readings$sensor, sum)',
      tests: [['gaps is A 2, B 2', 'isTRUE(all.equal(as.vector(gaps), c(2, 2))) && identical(names(gaps), c("A", "B"))']],
    }),
    task('hard', 'Daily means', {
      prompt: 'Make `daily` the mean temperature per day, leaving out the NAs, rounded to 1 decimal place.',
      starter: RAW + READ + DAY + FAULT,
      hint: '`round(tapply(readings$temp, readings$day, mean, na.rm = TRUE), 1)`',
      solution: RAW + READ + DAY + FAULT + 'daily <- round(tapply(readings$temp, readings$day, mean, na.rm = TRUE), 1)',
      tests: [['daily is 21.5, 19.6', 'isTRUE(all.equal(as.vector(daily), c(21.5, 19.6)))']],
    }),
    task('expert', 'The daily report', {
      prompt: 'Show one line per day with the number of known readings, the mean (1 decimal place) and the maximum:\n\n```\n2026-10-28: 4 readings, mean 21.5, max 23.5\n2026-10-29: 4 readings, mean 19.6, max 22.1\n```',
      starter: RAW + READ + DAY + FAULT,
      hint: 'Loop over `unique(readings$day)` (use `as.character()` so the loop keeps the text), take that day\'s known temperatures, and `cat()` a line.',
      solution: RAW + READ + DAY + FAULT + 'for (d in as.character(unique(readings$day))) {\n  t <- readings$temp[readings$day == as.Date(d) & !is.na(readings$temp)]\n  cat(d, ": ", length(t), " readings, mean ", round(mean(t), 1), ", max ", max(t), "\\n", sep = "")\n}',
      tests: [['Shows the report', prints('2026-10-28: 4 readings, mean 21.5, max 23.5', '2026-10-29: 4 readings, mean 19.6, max 22.1')]],
    }),
  ],
  questions: [
    mc('Why must `-999` become NA before taking a mean?', ['It is too long', 'Otherwise it is counted as a real, very cold temperature', 'R can\'t add negative numbers', 'It doesn\'t matter'], 1,
      'A code for "failed" dragged into a mean ruins it.',
      { code: 'mean(c(18.2, -999, 21.4))', output: '[1] -319.8' }),
    mc('What does `substr("2026-10-28 08:00", 1, 10)` give?', ['`"2026-10-28"`', '`"08:00"`', '`"2026-10-28 08:00"`', '`"2026"`'], 0,
      'Characters 1 to 10.',
      { code: 'substr("2026-10-28 08:00", 1, 10)', output: '[1] "2026-10-28"' }),
    mc('After `x <- c(18, NA, 61)` and `x[x > 50] <- NA`, what is `x`?', ['`[1] 18 NA NA`', 'An error, because of the NA', '`[1] 18 NA 61`', '`[1] 18`'], 0,
      'An NA in a logical index assigns nothing for that position, so the NA stays NA and 61 becomes NA.',
      { code: 'x <- c(18, NA, 61)\nx[x > 50] <- NA\nx', output: '[1] 18 NA NA' }),
    mc('What does `tapply(is.na(c(1, NA, NA)), c("A", "A", "B"), sum)` count?', ['Readings per sensor', 'Missing readings per sensor: A 1, B 1', 'The total', 'Known readings'], 1,
      'TRUE counts as 1, so the sum counts the NAs in each group.',
      { code: 'as.vector(tapply(is.na(c(1, NA, NA)), c("A", "A", "B"), sum))', output: '[1] 1 1' }),
    mc('Why is a value of 61 °C treated as a fault and not just dropped silently?', ['It isn\'t', 'You set it to NA and report it, so readers know a value was removed', 'R deletes it automatically', 'It is kept'], 1,
      'Cleaning decisions should be visible.'),
    qShort('Which function gives part of a text, by character positions?', 'substr',
      '`substr(x, start, stop)`'),
  ],
})
