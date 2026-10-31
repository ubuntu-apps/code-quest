// Vectors, medium side quest: The quiz club.
import { code, isText, isTexts, makeProject, mc, near, qShort, same, snippet, task } from '../_builders.mjs'

const DATA = 'members <- c("Ana", "Ben", "Cy", "Dee", "Eli", "Fay", "Gus", "Hal")\nscores <- c(32, 27, NA, 38, 19, 35, NA, 24)\n'

export default makeProject('medium', {
  id: 'proj_quiz_club',
  title: 'The quiz club',
  paragraphs: [
    'The Thursday quiz club has eight members. This week\'s quiz was out of **40 points**, and two members were away, so their scores are missing:',
    '| Ana | Ben | Cy | Dee | Eli | Fay | Gus | Hal |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n| 32 | 27 | NA | 38 | 19 | 35 | NA | 24 |',
    'In R, that is two matching vectors:',
    code('members <- c("Ana", "Ben", "Cy", "Dee", "Eli", "Fay", "Gus", "Hal")', 'scores <- c(32, 27, NA, 38, 19, 35, NA, 24)'),
    'Find out who took part, how the club did, who passed (25 points or more) and who made the top three. Watch the missing scores at every step.',
  ],
  sandboxCode: DATA + 'mean(scores)\nmean(scores, na.rm = TRUE)',
  sandboxSnippets: [
    snippet('As percentages', DATA + 'round(scores / 40 * 100)'),
    snippet('Sorted, NAs last', DATA + 'members[order(scores, decreasing = TRUE)]'),
  ],
  challenges: [
    task('easy', 'Who took part', {
      prompt: 'Make `n_present` the number of members who have a score.',
      starter: DATA,
      hint: 'Count the scores that are not missing: `sum(!is.na(scores))`.',
      solution: DATA + 'n_present <- sum(!is.na(scores))',
      tests: [['n_present is 6', near('n_present', 6)]],
    }),
    task('easy', 'The club average', {
      prompt: 'Make `average` the average score of those who took part, rounded to 1 decimal place.',
      starter: DATA,
      hint: '`average <- round(mean(scores, na.rm = TRUE), 1)`',
      solution: DATA + 'average <- round(mean(scores, na.rm = TRUE), 1)',
      tests: [['average is 29.2', near('average', 29.2)]],
    }),
    task('medium', 'As percentages', {
      prompt: 'Make `percent` every score as a percentage of 40, rounded to a whole number. The missing scores stay `NA`.',
      starter: DATA,
      hint: '`percent <- round(scores / 40 * 100)`. Maths with NA gives NA, which is what you want here.',
      solution: DATA + 'percent <- round(scores / 40 * 100)',
      tests: [['percent is 80, 68, NA, 95, 48, 88, NA, 60', same('percent', 'c(80, 68, NA, 95, 48, 88, NA, 60)')]],
    }),
    task('medium', 'Top of the class', {
      prompt: 'Make `winner` the name of the member with the highest score.',
      starter: DATA,
      hint: '`which.max()` skips NAs: `winner <- members[which.max(scores)]`.',
      solution: DATA + 'winner <- members[which.max(scores)]',
      tests: [['winner is "Dee"', isText('winner', 'Dee')]],
    }),
    task('hard', 'Who passed', {
      prompt: 'Make `passed` the names of the members who scored 25 or more, with no `NA` in the result.',
      starter: DATA,
      hint: 'A plain condition lets the NAs through. Use `which()`: `members[which(scores >= 25)]`.',
      solution: DATA + 'passed <- members[which(scores >= 25)]',
      tests: [['passed is Ana, Ben, Dee, Fay', isTexts('passed', 'Ana', 'Ben', 'Dee', 'Fay')]],
    }),
    task('expert', 'The top three', {
      prompt: 'Make `podium` the names of the three highest scorers, highest first.',
      starter: DATA,
      hint: 'Sort the members by score with `order(scores, decreasing = TRUE)`, then take the first three with `head(…, 3)`. `order()` puts the NAs last.',
      solution: DATA + 'podium <- head(members[order(scores, decreasing = TRUE)], 3)',
      tests: [['podium is Dee, Fay, Ana', isTexts('podium', 'Dee', 'Fay', 'Ana')]],
    }),
  ],
  questions: [
    mc('What does `mean(c(32, NA, 38))` give?', ['`35`', '`NA`', '`23.33`', '`70`'], 1,
      'Without `na.rm = TRUE`, one missing score makes the mean unknown.',
      { code: 'mean(c(32, NA, 38))', output: '[1] NA' }),
    mc('What does `sum(!is.na(c(32, NA, 38, NA)))` give?', ['`2`', '`70`', '`4`', '`NA`'], 0,
      'Two values are not missing.',
      { code: 'sum(!is.na(c(32, NA, 38, NA)))', output: '[1] 2' }),
    mc('What does `round(27 / 40 * 100)` give?', ['`67`', '`68`', '`67.5`', '`70`'], 1,
      '27 out of 40 is 67.5%, and R rounds a 5 to the even number, 68.',
      { code: 'round(27 / 40 * 100)', output: '[1] 68' }),
    mc('What does `which.max(c(32, NA, 38))` give?', ['`NA`', '`3`', '`38`', '`2`'], 1,
      '`which.max()` skips missing values: 38 is at position 3.',
      { code: 'which.max(c(32, NA, 38))', output: '[1] 3' }),
    mc('What does `order(c(32, NA, 38), decreasing = TRUE)` give?', ['`[1] 3 1 2`', '`[1] 2 3 1`', '`[1] 3 1`', '`[1] 38 32 NA`'], 0,
      'Largest first, and the NA goes last.',
      { code: 'order(c(32, NA, 38), decreasing = TRUE)', output: '[1] 3 1 2' }),
    mc('After `m <- c("A", "B", "C")` and `s <- c(30, NA, 20)`, what does `m[s >= 25]` give?', ['`[1] "A"`', '`[1] "A" NA`', '`[1] "A" "B"`', 'An error'], 1,
      '`NA >= 25` is NA, so an NA comes through. `m[which(s >= 25)]` gives just "A".',
      { code: 'm <- c("A", "B", "C")\ns <- c(30, NA, 20)\nm[s >= 25]', output: '[1] "A" NA' }),
    qShort('Which function gives the first few values of a vector, as in `__(x, 3)`?', 'head',
      '`head(x, 3)` gives the first 3 values; `tail()` gives the last ones.'),
  ],
})
