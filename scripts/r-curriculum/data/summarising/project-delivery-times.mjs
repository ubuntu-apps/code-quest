// Summarising data, hard side quest: Delivery times.
import { code, isText, makeProject, mc, near, qShort, r, sameFrame, snippet, task } from '../_builders.mjs'
import { DELIVERIES } from '../datasets.mjs'

export default makeProject('hard', {
  id: 'proj_delivery_times',
  title: 'Delivery times',
  paragraphs: [
    'The bakery promises delivery **within 30 minutes**. The owner wants to know how well they keep that promise, per rider and per area, and whether one bad day is distorting the picture.',
    code(...DELIVERIES.trim().split('\n')),
    'The last challenge prints this report:',
    code('Deliveries: 12', 'On time: 58% (7 of 12)', 'Median: 28 min, 90% within 37.7 min', 'Outlier: Ola, south, 74 min', 'Slowest area: south (median 34 min)'),
  ],
  sandboxCode: DELIVERIES + 'mean(deliveries$minutes <= 30)\ntable(deliveries$area, deliveries$minutes <= 30)',
  sandboxSnippets: [snippet('Per rider', DELIVERIES + 'aggregate(minutes ~ rider, data = deliveries, FUN = median)')],
  challenges: [
    task('easy', 'On time', {
      prompt: 'Make `on_time` the percentage of deliveries that took 30 minutes or less, rounded to a whole number.',
      starter: DELIVERIES,
      hint: '`round(mean(deliveries$minutes <= 30) * 100)`',
      solution: DELIVERIES + 'on_time <- round(mean(deliveries$minutes <= 30) * 100)',
      tests: [['on_time is 58', near('on_time', 58)]],
    }),
    task('medium', 'On time per area', {
      prompt: 'Make `area_on_time` the percentage on time in each area, rounded to whole numbers.',
      starter: DELIVERIES,
      hint: '`tapply()` with a TRUE/FALSE vector and `mean` gives the share per group: `round(tapply(deliveries$minutes <= 30, deliveries$area, mean) * 100)`.',
      solution: DELIVERIES + 'area_on_time <- round(tapply(deliveries$minutes <= 30, deliveries$area, mean) * 100)',
      tests: [['area_on_time is north 100, south 17', 'isTRUE(all.equal(as.vector(area_on_time), c(100, 17))) && identical(names(area_on_time), c("north", "south"))']],
    }),
    task('medium', 'Median per rider', {
      prompt: 'Make `rider_median` a data frame of each rider\'s median time, fastest first.',
      starter: DELIVERIES,
      hint: '`aggregate(…, FUN = median)`, then sort by the minutes column.',
      solution: DELIVERIES + 'rider_median <- aggregate(minutes ~ rider, data = deliveries, FUN = median)\nrider_median <- rider_median[order(rider_median$minutes), ]',
      tests: [['rider_median is Sam 22.5, Ola 29, Kit 34', sameFrame('rider_median', 'data.frame(rider = c("Sam", "Ola", "Kit"), minutes = c(22.5, 29, 34))')]],
    }),
    task('hard', 'Find the outlier', {
      prompt: 'Make `outlier_row` the row of the delivery that `boxplot.stats()` flags.',
      starter: DELIVERIES,
      hint: '`out <- boxplot.stats(deliveries$minutes)$out`, then `subset(deliveries, minutes %in% out)`.',
      solution: DELIVERIES + 'out <- boxplot.stats(deliveries$minutes)$out\noutlier_row <- subset(deliveries, minutes %in% out)',
      tests: [['outlier_row is Ola\'s 74-minute delivery', sameFrame('outlier_row', 'deliveries[8, ]')]],
    }),
    task('hard', 'Within 90%', {
      prompt: 'Make `p90` the time 90% of deliveries arrive within, rounded to 1 decimal place, and `p90_clean` the same without the outlier.',
      starter: DELIVERIES,
      hint: '`round(unname(quantile(m, 0.9)), 1)` for all of them, and again for `m[m < 60]`.',
      solution: DELIVERIES + 'm <- deliveries$minutes\np90 <- round(unname(quantile(m, 0.9)), 1)\np90_clean <- round(unname(quantile(m[m < 60], 0.9)), 1)',
      tests: [['p90 is 37.7', near('p90', 37.7)], ['p90_clean is right', near('p90_clean', 'round(unname(quantile(deliveries$minutes[deliveries$minutes < 60], 0.9)), 1)')]],
    }),
    task('expert', 'The owner\'s report', {
      prompt: 'Show:\n\n```\nDeliveries: 12\nOn time: 58% (7 of 12)\nMedian: 28 min, 90% within 37.7 min\nOutlier: Ola, south, 74 min\nSlowest area: south (median 34 min)\n```',
      starter: DELIVERIES,
      hint: 'One line at a time with `sprintf()`. `%.0f` shows a number without decimals; `%d` needs a whole number.',
      solution: DELIVERIES + r`m <- deliveries$minutes
n_ok <- sum(m <= 30)
out <- subset(deliveries, minutes %in% boxplot.stats(m)$out)
area_med <- tapply(m, deliveries$area, median)
cat("Deliveries:", length(m), "\n")
cat(sprintf("On time: %.0f%% (%d of %d)\n", n_ok / length(m) * 100, n_ok, length(m)))
cat(sprintf("Median: %.0f min, 90%% within %.1f min\n", median(m), quantile(m, 0.9)))
cat(sprintf("Outlier: %s, %s, %.0f min\n", out$rider, out$area, out$minutes))
cat(sprintf("Slowest area: %s (median %.0f min)\n", names(which.max(area_med)), max(area_med)))`,
      tests: [['Shows the report', 'identical(trimws(strsplit(._cq_stdout, "\\n", fixed = TRUE)[[1]], "right"), c("Deliveries: 12", "On time: 58% (7 of 12)", "Median: 28 min, 90% within 37.7 min", "Outlier: Ola, south, 74 min", "Slowest area: south (median 34 min)"))']],
    }),
  ],
  questions: [
    mc('What does `round(mean(c(24, 31, 19, 27) <= 30) * 100)` give?', ['`75`', '`25`', '`3`', '`0.75`'], 0,
      'Three of four are 30 or less.',
      { code: 'round(mean(c(24, 31, 19, 27) <= 30) * 100)', output: '[1] 75' }),
    mc('What does `tapply(c(TRUE, FALSE, TRUE, TRUE), c("n", "n", "s", "s"), mean)` give?', ['`n 0.5, s 1`', '`n 1, s 2`', '`[1] 0.75`', '`n 1, s 0.5`'], 0,
      'The share of TRUE in each group.',
      { code: 'as.vector(tapply(c(TRUE, FALSE, TRUE, TRUE), c("n", "n", "s", "s"), mean))', output: '[1] 0.5 1.0' }),
    mc('What does `sprintf("%.0f%%", 58.3)` give?', ['`"58%"`', '`"58.3%"`', '`"58%%"`', 'An error'], 0,
      '`%%` writes a real percent sign in `sprintf()`.',
      { code: 'sprintf("%.0f%%", 58.3)', output: '[1] "58%"' }),
    mc('Why report the median and the 90% time rather than the mean?', ['They are easier to calculate', 'They describe typical and slow deliveries without being skewed by one bad day', 'The mean is always wrong', 'R can\'t do means'], 1,
      'Median and quantiles resist the 74-minute outlier.'),
    mc('North deliveries are 100% on time, south 17%. What should the owner look into?', ['The north', 'The south: distance, routes or riders there', 'Nothing', 'The bakery'], 1,
      'The summary points to where the problem is.'),
    qShort('In `sprintf()`, what do you write to show a real percent sign?', '%%',
      'A single `%` starts a placeholder, so a literal one is written `%%`.'),
  ],
})
