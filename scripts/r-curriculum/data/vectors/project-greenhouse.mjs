// Vectors, hard side quest: The greenhouse log.
import { code, makeProject, mc, near, prints, qShort, r, same, snippet, task, uses } from '../_builders.mjs'

const RAW = 'temps <- c(14.2, 15.0, -999, 17.8, 21.5, 24.9, 27.3, -999, 26.1, 22.4, 19.0, 16.6)\n'
const CLEAN = 'temps <- c(14.2, 15.0, NA, 17.8, 21.5, 24.9, 27.3, NA, 26.1, 22.4, 19.0, 16.6)\nhours <- 6:17\n'

export default makeProject('hard', {
  id: 'proj_greenhouse_log',
  title: 'The greenhouse log',
  paragraphs: [
    'A school greenhouse has a sensor that records the temperature (°C) every hour from 6:00 to 17:00. When it fails to get a reading, it writes `-999`. Yesterday\'s log:',
    code('temps <- c(14.2, 15.0, -999, 17.8, 21.5, 24.9, 27.3, -999, 26.1, 22.4, 19.0, 16.6)'),
    'Tomato plants get stressed above 25 °C. Clean up the log, then report on the day:',
    code('Readings: 10 of 12', 'Average: 20.5 C', 'Range: 14.2 to 27.3 C', 'Over 25 C at: 12 14'),
    'The last line lists the hours (on a 24-hour clock) when it was too hot for the tomatoes.',
  ],
  sandboxCode: RAW + 'mean(temps)\ntemps == -999',
  sandboxSnippets: [
    snippet('Mark the failures', RAW + 'temps[temps == -999] <- NA\ntemps'),
    snippet('Hours of the day', 'hours <- 6:17\nhours\nlength(hours)'),
  ],
  challenges: [
    task('easy', 'Hours of the day', {
      prompt: 'Make `hours` the hours of the readings: 6, 7, … 17.',
      hint: '`hours <- 6:17`',
      solution: 'hours <- 6:17',
      tests: [['hours is 6 to 17', near('hours', '6:17')]],
    }),
    task('medium', 'Mark the failures', {
      prompt: 'Replace every `-999` in `temps` with `NA`.',
      starter: RAW,
      hint: '`temps[temps == -999] <- NA`',
      solution: RAW + 'temps[temps == -999] <- NA',
      tests: [['temps has NA where the sensor failed', same('temps', 'c(14.2, 15.0, NA, 17.8, 21.5, 24.9, 27.3, NA, 26.1, 22.4, 19.0, 16.6)')]],
    }),
    task('medium', 'A fair average', {
      prompt: 'Make `n_readings` the number of real readings, and `average` the average temperature of those readings, rounded to 1 decimal place.',
      starter: CLEAN,
      hint: '`n_readings <- sum(!is.na(temps))` and `average <- round(mean(temps, na.rm = TRUE), 1)`.',
      solution: CLEAN + 'n_readings <- sum(!is.na(temps))\naverage <- round(mean(temps, na.rm = TRUE), 1)',
      tests: [
        ['n_readings is 10', near('n_readings', 10)],
        ['average is 20.5', near('average', 20.5)],
      ],
    }),
    task('medium', 'The warmest hour', {
      prompt: 'Make `warmest_hour` the hour of the highest reading.',
      starter: CLEAN,
      hint: 'The position of the highest reading picks the matching hour: `hours[which.max(temps)]`.',
      solution: CLEAN + 'warmest_hour <- hours[which.max(temps)]',
      tests: [['warmest_hour is 12', near('warmest_hour', 12)]],
    }),
    task('hard', 'Too hot for tomatoes', {
      prompt: 'Make `hot_hours` the hours when the temperature was over 25 °C, with no `NA` in the result.',
      starter: CLEAN,
      hint: '`hot_hours <- hours[which(temps > 25)]`',
      solution: CLEAN + 'hot_hours <- hours[which(temps > 25)]',
      tests: [['hot_hours is 12, 14', near('hot_hours', 'c(12, 14)')]],
    }),
    task('expert', 'The daily report', {
      prompt: 'Starting from the raw log, clean it and show the report:\n\n```\nReadings: 10 of 12\nAverage: 20.5 C\nRange: 14.2 to 27.3 C\nOver 25 C at: 12 14\n```',
      starter: RAW + 'hours <- 6:17\n',
      hint: 'Mark the `-999`s as `NA` first. `range(temps, na.rm = TRUE)` gives the lowest and highest; pick each with `[1]` and `[2]`. `cat()` shows a vector of hours with spaces between.',
      solution: RAW + r`hours <- 6:17
temps[temps == -999] <- NA
low_high <- range(temps, na.rm = TRUE)
cat("Readings:", sum(!is.na(temps)), "of", length(temps), "\n")
cat("Average:", round(mean(temps, na.rm = TRUE), 1), "C\n")
cat("Range:", low_high[1], "to", low_high[2], "C\n")
cat("Over 25 C at:", hours[which(temps > 25)], "\n")`,
      tests: [
        ['Shows the report', prints('Readings: 10 of 12', 'Average: 20.5 C', 'Range: 14.2 to 27.3 C', 'Over 25 C at: 12 14')],
        ['Cleans the -999s in R', uses('-999') + ' && ' + uses('NA')],
      ],
    }),
  ],
  questions: [
    mc('What does `mean(c(20, -999, 22))` give?', ['`21`', '`NA`', '`-319`', 'An error'], 2,
      'R treats −999 as a real temperature, which drags the mean far down. That is why it must become NA first.',
      { code: 'mean(c(20, -999, 22))', output: '[1] -319' }),
    mc('After `x <- c(20, -999, 22)` and `x[x == -999] <- NA`, what does `mean(x, na.rm = TRUE)` give?', ['`21`', '`NA`', '`14`', '`-319`'], 0,
      'Only 20 and 22 are left to average.',
      { code: 'x <- c(20, -999, 22)\nx[x == -999] <- NA\nmean(x, na.rm = TRUE)', output: '[1] 21' }),
    mc('What does `length(6:17)` give?', ['`11`', '`12`', '`17`', '`6`'], 1,
      '6 to 17 with both ends included is 12 hours.',
      { code: 'length(6:17)', output: '[1] 12' }),
    mc('What does `range(c(18, NA, 25), na.rm = TRUE)` give?', ['`[1] 7`', '`[1] 18 25`', '`[1] NA NA`', '`[1] 18 NA 25`'], 1,
      'The lowest and highest of the known values.',
      { code: 'range(c(18, NA, 25), na.rm = TRUE)', output: '[1] 18 25' }),
    mc('After `h <- 6:9` and `t <- c(20, NA, 27, 26)`, what does `h[which(t > 25)]` give?', ['`[1] 8 9`', '`[1] 3 4`', '`[1] NA  8  9`', '`[1] 27 26`'], 0,
      'Positions 3 and 4 are over 25, which are the hours 8 and 9.',
      { code: 'h <- 6:9\nt <- c(20, NA, 27, 26)\nh[which(t > 25)]', output: '[1] 8 9' }),
    mc('What does `cat("At:", c(12, 14), "\\n")` show?', ['`At: 12 14`', '`At: c(12, 14)`', '`At: [1] 12 14`', '`At: 1214`'], 0,
      '`cat()` shows every value of a vector, separated by spaces.',
      { code: r`cat("At:", c(12, 14), "\n")`, output: 'At: 12 14' }),
    qShort('A sensor writes -999 for a failed reading. What should you replace it with in R?', 'NA',
      'NA marks a missing value, so summaries can leave it out with `na.rm = TRUE`.'),
  ],
})
