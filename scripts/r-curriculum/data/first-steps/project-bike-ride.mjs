// First steps in R, medium side quest: A bike-share ride.
import { code, isLogical, makeProject, mc, near, prints, qShort, r, snippet, task, uses } from '../_builders.mjs'

export default makeProject('medium', {
  id: 'proj_bike_ride',
  title: 'A bike-share ride',
  paragraphs: [
    'Riverside Bikes charges **1.00 to unlock** a bike, plus **0.15 per minute**. A rider unlocks a bike at 8:12 and returns it at 8:59, after riding 9.4 km.',
    'Times are easiest to work with as minutes since midnight: 8:12 is `8 * 60 + 12`, which is 492, and 8:59 is 539.',
    'Work out the ride step by step. The last challenge shows a summary:',
    code('Ride: 47 min, 9.4 km', 'Speed: 12 km/h', 'Cost: 8.05', 'Long ride: TRUE'),
  ],
  sandboxCode: 'start <- 8 * 60 + 12\nend <- 8 * 60 + 59\nend - start',
  sandboxSnippets: [
    snippet('Hours and minutes', 'minutes <- 135\nminutes %/% 60\nminutes %% 60'),
    snippet('Speed', 'km <- 9.4\nminutes <- 47\nkm / (minutes / 60)'),
  ],
  challenges: [
    task('easy', 'Minutes since midnight', {
      prompt: 'Make `start` the minutes since midnight at 8:12, and `end` at 8:59. Let R work them out from the hours and minutes.',
      hint: '`start <- 8 * 60 + 12` and `end <- 8 * 60 + 59`.',
      solution: 'start <- 8 * 60 + 12\nend <- 8 * 60 + 59',
      tests: [
        ['start is 492', near('start', 492)],
        ['end is 539', near('end', 539)],
        ['Works them out', uses('60')],
      ],
    }),
    task('easy', 'Ride length', {
      prompt: 'Make `minutes` the length of the ride.',
      starter: 'start <- 492\nend <- 539\n',
      hint: '`minutes <- end - start`',
      solution: 'start <- 492\nend <- 539\nminutes <- end - start',
      tests: [['minutes is 47', near('minutes', 47)]],
    }),
    task('medium', 'The cost', {
      prompt: 'Make `cost` the price of the ride: 1.00 to unlock plus 0.15 per minute.',
      starter: 'minutes <- 47\n',
      hint: '`cost <- 1 + 0.15 * minutes`',
      solution: 'minutes <- 47\ncost <- 1 + 0.15 * minutes',
      tests: [['cost is 8.05', near('cost', 8.05)]],
    }),
    task('medium', 'The speed', {
      prompt: 'Make `speed` the average speed in km per hour, rounded to 1 decimal place. Speed is distance divided by time in **hours**.',
      starter: 'km <- 9.4\nminutes <- 47\n',
      hint: 'The time in hours is `minutes / 60`: `speed <- round(km / (minutes / 60), 1)`.',
      solution: 'km <- 9.4\nminutes <- 47\nspeed <- round(km / (minutes / 60), 1)',
      tests: [['speed is 12', near('speed', 12)]],
    }),
    task('hard', 'A long ride?', {
      prompt: 'Rides over 45 minutes count as long. Make `long_ride` TRUE or FALSE for this ride.',
      starter: 'minutes <- 47\n',
      hint: '`long_ride <- minutes > 45`',
      solution: 'minutes <- 47\nlong_ride <- minutes > 45',
      tests: [['long_ride is TRUE', isLogical('long_ride', true)]],
    }),
    task('expert', 'The ride summary', {
      prompt: 'From the start and end times and the distance, work everything out and show:\n\n```\nRide: 47 min, 9.4 km\nSpeed: 12 km/h\nCost: 8.05\nLong ride: TRUE\n```',
      starter: 'start <- 8 * 60 + 12\nend <- 8 * 60 + 59\nkm <- 9.4\n',
      hint: 'Work out `minutes`, `speed`, `cost` and `long_ride`, then use `cat()` for each line. For the first line, `cat()` puts a space before the comma unless the comma is part of the text: `cat("Ride:", minutes, "min,", km, "km\\n")`.',
      solution: r`start <- 8 * 60 + 12
end <- 8 * 60 + 59
km <- 9.4
minutes <- end - start
speed <- round(km / (minutes / 60), 1)
cost <- 1 + 0.15 * minutes
long_ride <- minutes > 45
cat("Ride:", minutes, "min,", km, "km\n")
cat("Speed:", speed, "km/h\n")
cat("Cost:", cost, "\n")
cat("Long ride:", long_ride, "\n")`,
      tests: [
        ['cost is 8.05', near('cost', 8.05)],
        ['Shows the summary', prints('Ride: 47 min, 9.4 km', 'Speed: 12 km/h', 'Cost: 8.05', 'Long ride: TRUE')],
      ],
    }),
  ],
  questions: [
    mc('What does `8 * 60 + 12` give?', ['`492`', '`576`', '`8.12`', '`600`'], 0,
      '8 hours is 480 minutes, plus 12 is 492.',
      { code: '8 * 60 + 12', output: '[1] 492' }),
    mc('What does `135 %/% 60` give?', ['`2.25`', '`15`', '`2`', '`3`'], 2,
      'Whole-number division: 60 goes into 135 twice.',
      { code: '135 %/% 60', output: '[1] 2' }),
    mc('What does `135 %% 60` give?', ['`2`', '`15`', '`0.25`', '`75`'], 1,
      'After two hours (120 minutes), 15 minutes are left.',
      { code: '135 %% 60', output: '[1] 15' }),
    mc('What does `1 + 0.15 * 47` give?', ['`47.15`', '`7.05`', '`8.05`', '`55.05`'], 2,
      'Multiply first: 7.05, plus 1 is 8.05.',
      { code: '1 + 0.15 * 47', output: '[1] 8.05' }),
    mc('Why the brackets in `9.4 / (47 / 60)`?', ['They make no difference', 'So the minutes are turned into hours before dividing', 'R needs brackets around every division', 'To round the result'], 1,
      'Without them R works left to right: `9.4 / 47 / 60`, which is a much smaller number.',
      { code: '9.4 / 47 / 60', output: '[1] 0.003333333' }),
    mc('What does `47 > 45` give?', ['`TRUE`', '`FALSE`', '`2`', '`47`'], 0,
      'A comparison gives TRUE or FALSE.',
      { code: '47 > 45', output: '[1] TRUE' }),
    qShort('Which operator gives the whole hours in 135 minutes, as in `135 __ 60`?', '%/%',
      '`135 %/% 60` is 2; `135 %% 60` gives the 15 minutes left over.'),
  ],
})
