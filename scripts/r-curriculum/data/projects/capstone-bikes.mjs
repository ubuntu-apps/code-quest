// Capstone: A day at Riverside Bikes.
import { code, makeTopic, mc, near, prints, qShort, same, snippet, task } from '../_builders.mjs'

const DAY = `day <- data.frame(
  id = 1:16,
  start = c("07:45", "08:10", "08:20", "08:55", "12:05", "12:30", "13:10", "17:05",
            "17:20", "17:35", "17:50", "18:10", "18:40", "19:05", "08:05", "17:15"),
  station = c("Park", "River", "Park", "Market", "River", "Park", "Market", "Park",
              "River", "River", "Market", "Park", "River", "Market", "Market", "Park"),
  minutes = c(14, 32, 11, 9, 45, 24, 22, 16, 38, 27, 12, 26, 51, 21, 8, 15),
  km = c(3.1, 7.2, 2.6, 1.9, 9.8, 3.5, 4.8, 3.6, 8.1, 6.0, 2.4, 4.1, 10.6, 5.2, 1.7, 3.3),
  member = c(TRUE, FALSE, TRUE, TRUE, FALSE, TRUE, FALSE, TRUE, FALSE, TRUE, TRUE, TRUE, FALSE, FALSE, TRUE, TRUE)
)
`
const HOUR = 'day$hour <- as.numeric(substr(day$start, 1, 2))\n'
const FARE = 'day$fare <- ifelse(day$member, 0.10 * day$minutes, 1 + 0.20 * day$minutes)\n'
const READY = DAY + HOUR + FARE

export default makeTopic({
  id: 'capstone_bikes',
  title: 'A day at Riverside Bikes',
  paragraphs: [
    'Riverside Bikes is trying out a new price list: members pay 0.10 a minute, everyone else 1.00 to unlock plus 0.20 a minute. The manager wants a report on one busy Tuesday under the new prices: when people ride, where the money comes from, whether members ride differently, and how well the distance explains the time.',
    code(...DAY.trim().split('\n')),
    'The start times are text like `"17:35"`. The challenges build on each other; the hints show one way, but any way that gives the same result is fine.',
  ],
  sandboxCode: DAY + 'str(day)\ntable(day$station)',
  sandboxSnippets: [snippet('Hours and fares', READY + 'head(day)')],
  challenges: [
    task('easy', 'The hour', {
      prompt: 'Add a column `hour`: the hour each trip started, as a number (17 for `"17:35"`).',
      starter: DAY,
      hint: 'The first two characters: `as.numeric(substr(day$start, 1, 2))`.',
      solution: DAY + HOUR,
      tests: [['hour is right for every trip', 'isTRUE(all.equal(day$hour, c(7, 8, 8, 8, 12, 12, 13, 17, 17, 17, 17, 18, 18, 19, 8, 17)))']],
    }),
    task('easy', 'The busiest hour', {
      prompt: 'Make `busiest` the hour with the most trips, as a number.',
      starter: DAY + HOUR,
      hint: '`table(day$hour)` counts trips per hour; `names(which.max(…))` gives the hour as text, so wrap it in `as.numeric()`.',
      solution: DAY + HOUR + 'busiest <- as.numeric(names(which.max(table(day$hour))))',
      tests: [['busiest is 17', near('busiest', 17)]],
    }),
    task('easy', 'The fares', {
      prompt: 'Add a column `fare` with the new prices.',
      starter: DAY + HOUR,
      hint: '`ifelse(day$member, 0.10 * day$minutes, 1 + 0.20 * day$minutes)`',
      solution: DAY + HOUR + FARE,
      tests: [['fare is right for every trip', same('day$fare', 'c(1.4, 7.4, 1.1, 0.9, 10, 2.4, 5.4, 1.6, 8.6, 2.7, 1.2, 2.6, 11.2, 5.2, 0.8, 1.5)')], ['The day\'s takings are 64', 'isTRUE(all.equal(sum(day$fare), 64))']],
    }),
    task('medium', 'Takings per station', {
      prompt: 'Make `per_station` the takings at each station, rounded to 2 decimal places.',
      starter: READY,
      hint: '`round(tapply(day$fare, day$station, sum), 2)`',
      solution: READY + 'per_station <- round(tapply(day$fare, day$station, sum), 2)',
      tests: [['per_station is Market 13.5, Park 10.6, River 39.9', 'isTRUE(all.equal(as.vector(per_station), c(13.5, 10.6, 39.9))) && identical(names(per_station), c("Market", "Park", "River"))']],
    }),
    task('medium', 'Times of day', {
      prompt: 'Add a column `part` that says `"morning"` for trips starting up to 11, `"midday"` for 12 to 15 and `"evening"` for 16 on, as a factor in that order. Then make `per_part` a count of trips in each.',
      starter: READY,
      hint: '`cut(day$hour, breaks = c(-Inf, 11, 15, Inf), labels = c("morning", "midday", "evening"))`, then `table()`.',
      solution: READY + 'day$part <- cut(day$hour, breaks = c(-Inf, 11, 15, Inf), labels = c("morning", "midday", "evening"))\nper_part <- table(day$part)',
      tests: [['part is a factor with levels morning, midday, evening', 'is.factor(day$part) && identical(levels(day$part), c("morning", "midday", "evening"))'], ['per_part is 5, 3, 8', 'identical(as.vector(per_part), c(5L, 3L, 8L))']],
    }),
    task('medium', 'Members and others', {
      prompt: 'Make `mean_minutes` the mean trip length for non-members and members, rounded to 1 decimal place.',
      starter: READY,
      hint: '`round(tapply(day$minutes, day$member, mean), 1)`: FALSE comes first.',
      solution: READY + 'mean_minutes <- round(tapply(day$minutes, day$member, mean), 1)',
      tests: [['mean_minutes is FALSE 34.8, TRUE 16.2', 'isTRUE(all.equal(as.vector(mean_minutes), c(34.8, 16.2)))']],
    }),
    task('hard', 'Is the gap real?', {
      prompt: 'Make `p` the p-value of a t-test comparing trip minutes for members and non-members, rounded to 3 decimal places.',
      starter: READY,
      hint: '`t.test(minutes ~ member, data = day)$p.value`',
      solution: READY + 'p <- round(t.test(minutes ~ member, data = day)$p.value, 3)',
      tests: [['p is 0.011', near('p', 0.011)]],
    }),
    task('hard', 'Minutes per km', {
      prompt: 'Fit `model`, minutes explained by km. Make `per_km` its slope and `r2` its R-squared, both rounded to 2 decimal places.',
      starter: READY,
      hint: '`model <- lm(minutes ~ km, data = day)`; `coef(model)[2]` and `summary(model)$r.squared`.',
      solution: READY + 'model <- lm(minutes ~ km, data = day)\nper_km <- round(unname(coef(model)[2]), 2)\nr2 <- round(summary(model)$r.squared, 2)',
      tests: [['per_km is 4.55', near('per_km', 4.55)], ['r2 is 0.95', near('r2', 0.95)]],
    }),
    task('expert', 'The slow trip', {
      prompt: 'Make `slow_trip` the `id` of the trip that took longest compared with what its distance predicts.',
      starter: READY + 'model <- lm(minutes ~ km, data = day)\n',
      hint: 'The largest positive residual: `day$id[which.max(residuals(model))]`.',
      solution: READY + 'model <- lm(minutes ~ km, data = day)\nslow_trip <- day$id[which.max(residuals(model))]',
      tests: [['slow_trip is 6', near('slow_trip', 6)]],
    }),
    task('expert', 'The manager\'s report', {
      prompt: 'Show this report, with money to 2 decimal places:\n\n```\nTrips: 16 (10 by members)\nTakings: 64.00\nBusiest hour: 17:00\nTop station: River (39.90)\n```',
      starter: READY,
      hint: 'Work out each number, then use `sprintf()` for the money, such as `sprintf("Takings: %.2f", sum(day$fare))`, and `cat(…, sep = "\\n")` to show the lines.',
      solution: READY + 'busiest <- names(which.max(table(day$hour)))\nper_station <- tapply(day$fare, day$station, sum)\ntop <- names(which.max(per_station))\ncat(sprintf("Trips: %d (%d by members)", nrow(day), sum(day$member)),\n    sprintf("Takings: %.2f", sum(day$fare)),\n    sprintf("Busiest hour: %s:00", busiest),\n    sprintf("Top station: %s (%.2f)", top, max(per_station)),\n    sep = "\\n")\ncat("\\n")',
      tests: [['Shows the report', prints('Trips: 16 (10 by members)', 'Takings: 64.00', 'Busiest hour: 17:00', 'Top station: River (39.90)')]],
    }),
  ],
  questions: [
    mc('What does `as.numeric(substr("08:55", 1, 2))` give?', ['`8`', '`"08"`', '`55`', '`NA`'], 0,
      'The text "08" becomes the number 8.',
      { code: 'as.numeric(substr("08:55", 1, 2))', output: '[1] 8' }),
    mc('Why does `names(which.max(table(x)))` give `"17"` and not `17`?', ['A bug', 'Table names are always text', 'which.max() makes text', 'Because of the colon'], 1,
      'Turn it back with `as.numeric()` if you need the number.'),
    mc('With `breaks = c(-Inf, 11, 15, Inf)`, which group does hour 15 go in?', ['morning', 'midday', 'evening', 'None'], 1,
      'Each group includes its upper break: (11, 15].',
      { code: 'as.character(cut(15, breaks = c(-Inf, 11, 15, Inf), labels = c("morning", "midday", "evening")))', output: '[1] "midday"' }),
    mc('Members\' trips average 16.2 minutes, others 34.8, with p = 0.011. What is a fair reading?', ['Membership makes people ride faster', 'Good evidence that members take shorter trips on this day, though not why', 'No difference', 'Members ride further'], 1,
      'Members may use bikes for short commutes; a difference is not a cause.'),
    mc('The slope of minutes on km is 4.55. What does it mean?', ['4.55 km per minute', 'About 4.55 more minutes for each extra km', 'Trips take 4.55 minutes', 'R² is 4.55'], 1,
      'That is roughly 13 km an hour.'),
    mc('Trip 6 has the largest positive residual. What might that show?', ['A data error, certainly', 'A trip much slower than its distance suggests, perhaps with a stop', 'The fastest trip', 'Nothing'], 1,
      'Look at the row before deciding: residuals point you to what to check.'),
    mc('Why does River take the most money with only 5 trips?', ['It has more members', 'Its trips are long and mostly by non-members, who pay more per minute', 'Its bikes cost more', 'It doesn\'t'], 1,
      'Four of River\'s five trips are by non-members, and they are the longest of the day.'),
    mc('What does `sprintf("%.2f", 64)` give?', ['`"64"`', '`"64.00"`', '`64.00`', '`"64.0"`'], 1,
      'Two decimals, as text: right for money.',
      { code: 'sprintf("%.2f", 64)', output: '[1] "64.00"' }),
    qShort('Which function sorts the start hours into morning, midday and evening groups?', 'cut',
      '`cut(hour, breaks = …, labels = …)`'),
  ],
})
