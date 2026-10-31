// Data frames, easy side quest: The bike-share week.
import { code, isText, makeProject, mc, near, prints, qShort, r, sameFrame, snippet, task } from '../_builders.mjs'
import { TRIPS } from '../datasets.mjs'

export default makeProject('easy', {
  id: 'proj_bike_trips',
  title: 'The bike-share week',
  paragraphs: [
    'Riverside Bikes wants a short report on the eight trips from this quest. Non-members pay 1 to unlock plus 0.15 per minute; members ride free.',
    code(...TRIPS.trim().split('\n')),
    'Add the fares, find the longest trip, and show:',
    code('Trips: 8', 'Longest: 55 min from River', 'Fares taken: 21.6'),
  ],
  sandboxCode: TRIPS + 'str(trips)\nsummary(trips$minutes)',
  sandboxSnippets: [snippet('The longest trip', TRIPS + 'trips[which.max(trips$minutes), ]')],
  challenges: [
    task('easy', 'Add the fares', {
      prompt: 'Add a column `fare`: 0 for members, 1 plus 0.15 per minute for everyone else.',
      starter: TRIPS,
      hint: '`trips$fare <- ifelse(trips$member, 0, 1 + 0.15 * trips$minutes)`',
      solution: TRIPS + 'trips$fare <- ifelse(trips$member, 0, 1 + 0.15 * trips$minutes)',
      tests: [['fare is right for every trip', 'isTRUE(all.equal(trips$fare, c(0, 8.05, 0, 0, 9.25, 0, 4.3, 0)))']],
    }),
    task('easy', 'Fares taken', {
      prompt: 'Make `fares_total` the total of the fares.',
      starter: TRIPS + 'trips$fare <- ifelse(trips$member, 0, 1 + 0.15 * trips$minutes)\n',
      hint: '`fares_total <- sum(trips$fare)`',
      solution: TRIPS + 'trips$fare <- ifelse(trips$member, 0, 1 + 0.15 * trips$minutes)\nfares_total <- sum(trips$fare)',
      tests: [['fares_total is 21.6', near('fares_total', 21.6)]],
    }),
    task('medium', 'The longest trip', {
      prompt: 'Make `longest` the row of the longest trip.',
      starter: TRIPS,
      hint: '`longest <- trips[which.max(trips$minutes), ]`',
      solution: TRIPS + 'longest <- trips[which.max(trips$minutes), ]',
      tests: [['longest is trip 5', sameFrame('longest', 'trips[5, ]')]],
    }),
    task('medium', 'The busiest station', {
      alt: (s) => s.replace('station = c("Park", "River", "Park", "Market", "River", "Park", "Market", "River")', 'station = c("Market", "Market", "Park", "Market", "River", "Park", "Market", "River")'),
      prompt: 'Make `busiest` the station where most trips started.',
      starter: TRIPS,
      hint: 'Count with `table()`, then `names(which.max(...))`. Park and River both have 3; `which.max()` takes the first, Park.',
      solution: TRIPS + 'busiest <- names(which.max(table(trips$station)))',
      tests: [['busiest is "Park"', isText('busiest', 'Park')]],
    }),
    task('hard', 'Members\' long trips', {
      prompt: 'Make `member_long` the trips by members that lasted more than 20 minutes, sorted from longest to shortest.',
      starter: TRIPS,
      hint: 'Filter with `subset(trips, member & minutes > 20)`, then sort with `order(-…$minutes)`.',
      solution: TRIPS + 'member_long <- subset(trips, member & minutes > 20)\nmember_long <- member_long[order(-member_long$minutes), ]',
      tests: [['member_long is trips 8 and 3', sameFrame('member_long', 'trips[c(8, 3), ]')]],
    }),
    task('expert', 'The weekly report', {
      prompt: 'Show the report:\n\n```\nTrips: 8\nLongest: 55 min from River\nFares taken: 21.6\n```',
      starter: TRIPS,
      hint: 'Work out the longest row with `which.max()` and the fares with `ifelse()`, then three `cat()` lines.',
      solution: TRIPS + r`longest <- trips[which.max(trips$minutes), ]
fare <- ifelse(trips$member, 0, 1 + 0.15 * trips$minutes)
cat("Trips:", nrow(trips), "\n")
cat("Longest:", longest$minutes, "min from", longest$station, "\n")
cat("Fares taken:", sum(fare), "\n")`,
      tests: [['Shows the report', prints('Trips: 8', 'Longest: 55 min from River', 'Fares taken: 21.6')]],
    }),
  ],
  questions: [
    mc('What does `ifelse(c(TRUE, FALSE), 0, 5)` give?', ['`[1] 0 5`', '`[1] 5 0`', '`[1] 0 0`', '`[1] 5`'], 0,
      'TRUE gets 0, FALSE gets 5.',
      { code: 'ifelse(c(TRUE, FALSE), 0, 5)', output: '[1] 0 5' }),
    mc('After `df <- data.frame(m = c(12, 47, 30))`, what does `which.max(df$m)` give?', ['`47`', '`2`', '`3`', '`1`'], 1,
      'The largest value is in row 2.',
      { code: 'df <- data.frame(m = c(12, 47, 30))\nwhich.max(df$m)', output: '[1] 2' }),
    mc('What does `names(which.max(table(c("Park", "River", "Park"))))` give?', ['`"River"`', '`"Park"`', '`2`', '`"Park" "River"`'], 1,
      'Park appears most often.',
      { code: 'names(which.max(table(c("Park", "River", "Park"))))', output: '[1] "Park"' }),
    mc('Which keeps member trips over 20 minutes?', ['`subset(trips, member | minutes > 20)`', '`subset(trips, member & minutes > 20)`', '`trips[member, minutes > 20]`', '`subset(trips, minutes > 20)$member`'], 1,
      'Both conditions must hold, so `&`.'),
    mc('What does `1 + 0.15 * 22` give?', ['`4.3`', '`26.3`', '`3.3`', '`5.3`'], 0,
      'Multiply first: 3.3, plus 1.',
      { code: '1 + 0.15 * 22', output: '[1] 4.3' }),
    qShort('Which function gives the row number of the smallest value?', 'which.min',
      '`trips[which.min(trips$minutes), ]` is the shortest trip.'),
  ],
})
