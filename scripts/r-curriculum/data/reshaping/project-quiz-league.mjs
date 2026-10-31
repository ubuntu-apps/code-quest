// Reshaping and combining, easy side quest: The quiz league.
import { code, makeProject, mc, qShort, same, sameFrame, snippet, task } from '../_builders.mjs'

const POINTS = 'points <- matrix(\n  c(8, 6, 9, 7, 7, 9, 6, 8, 9, 5, 8, 10, 6, 8, 7, 9),\n  nrow = 4,\n  dimnames = list(c("Owls", "Foxes", "Hares", "Badgers"), c("R1", "R2", "R3", "R4"))\n)\n'
const R5 = 'points <- cbind(points, R5 = c(7, 9, 8, 6))\n'

export default makeProject('easy', {
  id: 'proj_quiz_league',
  title: 'The quiz league',
  paragraphs: [
    'Four teams play in the library\'s quiz league. The scorer keeps the points as a matrix: one row per team, one column per round.',
    code(...POINTS.trim().split('\n')),
    'Work out the totals, who won each round, add the fifth round when it comes in, and finish with a league table as a data frame.',
  ],
  sandboxCode: POINTS + 'points\nrowSums(points)',
  sandboxSnippets: [snippet('Round winners', POINTS + 'apply(points, 2, function(x) names(x)[which.max(x)])')],
  challenges: [
    task('easy', 'Totals', {
      prompt: 'Make `totals` each team\'s total points.',
      starter: POINTS,
      hint: '`rowSums(points)`',
      solution: POINTS + 'totals <- rowSums(points)',
      tests: [['totals is Owls 30, Foxes 28, Hares 30, Badgers 34', same('totals', 'c(Owls = 30, Foxes = 28, Hares = 30, Badgers = 34)')]],
    }),
    task('easy', 'In the lead', {
      prompt: 'Make `leader` the name of the team with the most points.',
      starter: POINTS,
      hint: '`names(which.max(rowSums(points)))`',
      solution: POINTS + 'leader <- names(which.max(rowSums(points)))',
      tests: [['leader is "Badgers"', 'identical(leader, "Badgers")']],
    }),
    task('medium', 'Round winners', {
      prompt: 'Make `winners` the team that scored most in each round.',
      starter: POINTS,
      hint: '`apply(points, 2, function(x) names(x)[which.max(x)])`',
      solution: POINTS + 'winners <- apply(points, 2, function(x) names(x)[which.max(x)])',
      tests: [['winners is Hares, Foxes, Badgers, Badgers', 'identical(unname(winners), c("Hares", "Foxes", "Badgers", "Badgers"))']],
    }),
    task('medium', 'Rounds won', {
      prompt: 'Make `rounds_won` a count of how many rounds each team won, from `winners`.',
      starter: POINTS + 'winners <- apply(points, 2, function(x) names(x)[which.max(x)])\n',
      hint: '`table(winners)`',
      solution: POINTS + 'winners <- apply(points, 2, function(x) names(x)[which.max(x)])\nrounds_won <- table(winners)',
      tests: [['rounds_won is Badgers 2, Foxes 1, Hares 1', 'identical(as.vector(rounds_won), c(2L, 1L, 1L)) && identical(names(rounds_won), c("Badgers", "Foxes", "Hares"))']],
    }),
    task('hard', 'Round five', {
      prompt: 'Round 5 scores are Owls 7, Foxes 9, Hares 8, Badgers 6. Add them as a column `R5`, then make `totals` the new totals.',
      starter: POINTS,
      hint: '`points <- cbind(points, R5 = c(7, 9, 8, 6))`, then `rowSums()`.',
      solution: POINTS + R5 + 'totals <- rowSums(points)',
      tests: [['points has 5 columns', 'ncol(points) == 5 && identical(colnames(points)[5], "R5")'], ['totals is Owls 37, Foxes 37, Hares 38, Badgers 40', same('totals', 'c(Owls = 37, Foxes = 37, Hares = 38, Badgers = 40)')]],
    }),
    task('expert', 'The league table', {
      prompt: 'Make `league` a data frame with the columns `team` and `total`, sorted by total from highest, and by team name where totals tie.',
      starter: POINTS + R5,
      hint: '`totals <- rowSums(points)`, `league <- data.frame(team = names(totals), total = unname(totals))`, then `league[order(-league$total, league$team), ]`.',
      solution: POINTS + R5 + 'totals <- rowSums(points)\nleague <- data.frame(team = names(totals), total = unname(totals))\nleague <- league[order(-league$total, league$team), ]',
      tests: [['league is Badgers 40, Hares 38, Foxes 37, Owls 37', sameFrame('league', 'data.frame(team = c("Badgers", "Hares", "Foxes", "Owls"), total = c(40, 38, 37, 37))')]],
    }),
  ],
  questions: [
    mc('Why does a matrix suit the quiz scores?', ['It can hold text and numbers', 'Every value is a number, with a team and a round as the two directions', 'It is required by rowSums()', 'It sorts itself'], 1,
      'Two categories (team, round) and one kind of value.'),
    mc('What does `rowSums(matrix(c(1, 2, 3, 4), nrow = 2))` give?', ['`[1] 4 6`', '`[1] 3 7`', '`[1] 10`', '`[1] 1 2`'], 0,
      'Rows are 1 3 and 2 4.',
      { code: 'rowSums(matrix(c(1, 2, 3, 4), nrow = 2))', output: '[1] 4 6' }),
    mc('Two teams tie for a round. Which does `which.max()` pick?', ['Both', 'The first one in the matrix', 'The last one', 'Neither: NA'], 1,
      'Ties go to the first. Worth saying in a report if it matters.',
      { code: 'names(which.max(c(Owls = 9, Hares = 9)))', output: '[1] "Owls"' }),
    mc('What does `cbind(m, R5 = c(7, 9))` do to a 2-row matrix `m`?', ['Adds a column called R5', 'Adds a row', 'Replaces the last column', 'An error'], 0,
      '`rbind()` would add a row instead.'),
    mc('In `order(-league$total, league$team)`, what does `league$team` do?', ['Sorts by team first', 'Breaks ties in total, alphabetically', 'Nothing', 'Reverses the order'], 1,
      'The second key only matters where the first ties.'),
    qShort('Which function adds up each row of a matrix?', 'rowSums',
      '`colSums()` does each column.'),
  ],
})
