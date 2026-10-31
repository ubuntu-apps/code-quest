// Reshaping and combining, hard side quest: Weather stations.
import { code, makeProject, mc, near, prints, qShort, sameFrame, snippet, task } from '../_builders.mjs'

const DATA = 'temps <- data.frame(\n  station = c("N1", "N2", "S1", "S2"),\n  d1 = c(11.2, 10.8, 14.1, 13.6),\n  d2 = c(12.0, NA, 14.8, 14.2),\n  d3 = c(10.5, 10.1, 13.9, NA)\n)\nstations <- data.frame(\n  station = c("N1", "N2", "S1", "S2", "S3"),\n  region = c("north", "north", "south", "south", "south"),\n  altitude = c(120, 340, 15, 60, 30)\n)\n'
const LONG = 'long <- data.frame(\n  station = rep(temps$station, times = 3),\n  day = rep(c("d1", "d2", "d3"), each = 4),\n  temp = c(temps$d1, temps$d2, temps$d3)\n)\n'
const JOINED = 'joined <- merge(long, stations, by = "station")\n'

export default makeProject('hard', {
  id: 'proj_weather_stations',
  title: 'Weather stations',
  paragraphs: [
    'A schools\' science network runs small weather stations. Each sends one noon temperature (°C) a day; the network keeps them in a wide sheet, with a separate table describing the stations. Two readings are missing, and one station hasn\'t sent anything yet.',
    code(...DATA.trim().split('\n')),
    'Make the data long, join the station details, and compare the regions. The last challenge shows:',
    code('north: 5 readings, mean 10.9', 'south: 5 readings, mean 14.1'),
  ],
  sandboxCode: DATA + 'temps\nstations',
  sandboxSnippets: [snippet('Long by hand', DATA + LONG + 'long')],
  challenges: [
    task('easy', 'One reading per row', {
      prompt: 'Make `long` the temperatures in long form, with the columns `station`, `day` and `temp`: all of day 1 first, then day 2, then day 3.',
      starter: DATA,
      hint: '`rep(temps$station, times = 3)`, `rep(c("d1", "d2", "d3"), each = 4)` and `c(temps$d1, temps$d2, temps$d3)`.',
      solution: DATA + LONG,
      tests: [['long has 12 rows: station, day, temp', 'is.data.frame(long) && identical(names(long), c("station", "day", "temp")) && nrow(long) == 12'], ['Day 2 of S1 is 14.8', 'isTRUE(all.equal(long$temp[long$station == "S1" & long$day == "d2"], 14.8))']],
    }),
    task('medium', 'The gaps', {
      prompt: 'Make `gaps` the station and day of each missing reading.',
      starter: DATA + LONG,
      hint: '`long[is.na(long$temp), c("station", "day")]`',
      solution: DATA + LONG + 'gaps <- long[is.na(long$temp), c("station", "day")]',
      tests: [['gaps is N2 d2 and S2 d3', sameFrame('gaps', 'data.frame(station = c("N2", "S2"), day = c("d2", "d3"))')]],
    }),
    task('medium', 'Station details', {
      prompt: 'Make `joined` the readings joined to the station details, and `silent` the stations that sent no readings.',
      starter: DATA + LONG,
      hint: '`merge(long, stations, by = "station")`; `setdiff(stations$station, temps$station)`.',
      solution: DATA + LONG + JOINED + 'silent <- setdiff(stations$station, temps$station)',
      tests: [['joined has 12 rows with a region column', 'is.data.frame(joined) && nrow(joined) == 12 && "region" %in% names(joined)'], ['silent is "S3"', 'identical(silent, "S3")']],
    }),
    task('hard', 'Region by day', {
      prompt: 'Make `grid` the mean temperature for each region (rows) and day (columns), leaving out the missing readings, rounded to 2 decimal places.',
      starter: DATA + LONG + JOINED,
      hint: '`round(tapply(joined$temp, list(joined$region, joined$day), mean, na.rm = TRUE), 2)`',
      solution: DATA + LONG + JOINED + 'grid <- round(tapply(joined$temp, list(joined$region, joined$day), mean, na.rm = TRUE), 2)',
      tests: [['grid is north 11, 12, 10.3 and south 13.85, 14.5, 13.9', 'is.matrix(grid) && isTRUE(all.equal(unname(grid), matrix(c(11, 13.85, 12, 14.5, 10.3, 13.9), nrow = 2)))']],
    }),
    task('hard', 'Height and warmth', {
      prompt: 'Make `station_means` each station\'s mean temperature (leaving out NAs), then `r` the correlation between those means and the stations\' altitudes, rounded to 2 decimal places.',
      starter: DATA + LONG,
      hint: '`station_means <- tapply(long$temp, long$station, mean, na.rm = TRUE)`; look up each altitude with `stations$altitude[match(names(station_means), stations$station)]`.',
      solution: DATA + LONG + 'station_means <- tapply(long$temp, long$station, mean, na.rm = TRUE)\nalt <- stations$altitude[match(names(station_means), stations$station)]\nr <- round(cor(station_means, alt), 2)',
      tests: [['r is -0.87', near('r', -0.87)]],
    }),
    task('expert', 'The region report', {
      prompt: 'Show one line per region with the number of readings (not counting NAs) and the mean, rounded to 1 decimal place:\n\n```\nnorth: 5 readings, mean 10.9\nsouth: 5 readings, mean 14.1\n```',
      starter: DATA + LONG + JOINED,
      hint: 'Loop over `split(joined$temp, joined$region)`, or over the region names; drop the NAs from each part, then `cat()` a line.',
      solution: DATA + LONG + JOINED + 'parts <- split(joined$temp, joined$region)\nfor (reg in names(parts)) {\n  t <- parts[[reg]][!is.na(parts[[reg]])]\n  cat(reg, ": ", length(t), " readings, mean ", round(mean(t), 1), "\\n", sep = "")\n}',
      tests: [['Shows the report', prints('north: 5 readings, mean 10.9', 'south: 5 readings, mean 14.1')]],
    }),
  ],
  questions: [
    mc('Why turn the wide sheet long before joining the station details?', ['It is required by merge()', 'Then each reading is a row, and region, day and station are all ordinary columns to group by', 'To remove the NAs', 'Wide data can\'t be joined'], 1,
      'Wide data could be joined too, but every summary would then work across columns.'),
    mc('What does a plain `merge()` do with station S3, which has no readings?', ['Adds it with NA readings', 'Leaves it out', 'An error', 'Gives it the mean'], 1,
      'That is why `setdiff()` is worth running: missing stations don\'t show up by themselves.'),
    mc('What does `mean(c(10.8, NA, 10.1), na.rm = TRUE)` give?', ['`NA`', '`10.45`', '`6.97`', '`20.9`'], 1,
      'The NA is left out, so it is the mean of two values.',
      { code: 'mean(c(10.8, NA, 10.1), na.rm = TRUE)', output: '[1] 10.45' }),
    mc('The correlation of station mean and altitude is −0.87. What does it suggest?', ['Higher stations are warmer', 'Higher stations tend to be cooler, though 4 stations is very few', 'No link', 'Altitude causes temperature exactly'], 1,
      'And the north stations are higher, so region and altitude are mixed together.'),
    mc('Why use `match()` to line up the altitudes with `station_means`?', ['It sorts them', 'So each mean gets its own station\'s altitude, whatever the order of the two tables', 'It is faster than cor()', 'It removes NAs'], 1,
      'Lining up by position alone would be a silent mistake if the orders differed.'),
    qShort('Which function finds the stations in the details table that sent no readings?', 'setdiff',
      '`setdiff(stations$station, temps$station)`'),
  ],
})
