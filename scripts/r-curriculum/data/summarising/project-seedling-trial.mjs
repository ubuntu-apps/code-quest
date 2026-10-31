// Summarising data, medium side quest: The seedling trial.
import { code, isText, makeProject, mc, near, prints, qShort, r, sameFrame, snippet, task } from '../_builders.mjs'
import { SEEDLINGS } from '../datasets.mjs'

export default makeProject('medium', {
  id: 'proj_seedling_trial',
  title: 'The seedling trial',
  paragraphs: [
    'The garden club tested three composts: shop-bought peat, leaf mould, and their own home compost. Four trays each, heights measured after three weeks.',
    code(...SEEDLINGS.trim().split('\n')),
    'Which compost is best, and is the result clear-cut? Compare the groups by centre and spread, then write a summary table:',
    code('compost  mean median   sd', 'leaf     10.6   10.7  0.6', 'home      8.6    7.3  2.8', 'peat      8.2    8.1  0.7'),
  ],
  sandboxCode: SEEDLINGS + 'aggregate(height_cm ~ compost, data = seedlings, FUN = mean)',
  sandboxSnippets: [snippet('Spread per group', SEEDLINGS + 'tapply(seedlings$height_cm, seedlings$compost, sd)')],
  challenges: [
    task('easy', 'Means per compost', {
      prompt: 'Make `means` a data frame of the mean height per compost, using `aggregate()`.',
      starter: SEEDLINGS,
      hint: '`aggregate(height_cm ~ compost, data = seedlings, FUN = mean)`',
      solution: SEEDLINGS + 'means <- aggregate(height_cm ~ compost, data = seedlings, FUN = mean)',
      tests: [['means is the mean per compost', sameFrame('means', 'aggregate(height_cm ~ compost, data = seedlings, FUN = mean)')]],
    }),
    task('easy', 'Best from the table', {
      alt: (s) => s.replace('height_cm = c(8.2, 7.5, 9.1, 8.0,', 'height_cm = c(12.2, 11.5, 13.1, 12.0,'),
      prompt: 'Make `best` the compost with the highest mean height, read from the `means` data frame.',
      starter: SEEDLINGS + 'means <- aggregate(height_cm ~ compost, data = seedlings, FUN = mean)\n',
      hint: 'The row with the largest mean: `means$compost[which.max(means$height_cm)]`.',
      solution: SEEDLINGS + 'means <- aggregate(height_cm ~ compost, data = seedlings, FUN = mean)\nbest <- means$compost[which.max(means$height_cm)]',
      tests: [['best is "leaf"', isText('best', 'leaf')]],
    }),
    task('medium', 'The most uneven', {
      prompt: 'Make `uneven` the compost whose heights have the largest standard deviation.',
      starter: SEEDLINGS,
      hint: 'The same idea with `sd`.',
      solution: SEEDLINGS + 'uneven <- names(which.max(tapply(seedlings$height_cm, seedlings$compost, sd)))',
      tests: [['uneven is "home"', isText('uneven', 'home')]],
    }),
    task('medium', 'The odd tray', {
      prompt: 'One home-compost seedling grew far taller than the others and pulls that group\'s mean up. Make `odd_tray` its tray number.',
      starter: SEEDLINGS,
      hint: 'Take the home rows with `subset()`, then the tray of the tallest: `home$tray[which.max(home$height_cm)]`.',
      solution: SEEDLINGS + 'home <- subset(seedlings, compost == "home")\nodd_tray <- home$tray[which.max(home$height_cm)]',
      tests: [['odd_tray is 10', near('odd_tray', 10)]],
    }),
    task('hard', 'A summary table', {
      prompt: 'Make `summary_tab` a data frame with columns `compost`, `mean`, `median` and `sd`, each rounded to 1 decimal place, sorted by mean from highest.',
      starter: SEEDLINGS,
      hint: 'Make three `tapply()` results, put them in `data.frame(compost = names(m), mean = round(m, 1), …)`, then sort by `-mean`.',
      solution: SEEDLINGS + 'h <- seedlings$height_cm\ng <- seedlings$compost\nm <- tapply(h, g, mean)\nsummary_tab <- data.frame(compost = names(m), mean = round(as.vector(m), 1), median = round(as.vector(tapply(h, g, median)), 1), sd = round(as.vector(tapply(h, g, sd)), 1))\nsummary_tab <- summary_tab[order(-summary_tab$mean), ]',
      tests: [['summary_tab is leaf, home, peat with the right numbers', 'is.data.frame(summary_tab) && identical(names(summary_tab), c("compost", "mean", "median", "sd")) && identical(summary_tab$compost, c("leaf", "home", "peat")) && isTRUE(all.equal(unname(summary_tab$mean), round(c(10.575, 8.6, 8.2), 1))) && isTRUE(all.equal(unname(summary_tab$sd), round(c(sd(c(10.4, 11.2, 9.8, 10.9)), sd(c(7.1, 12.8, 6.9, 7.6)), sd(c(8.2, 7.5, 9.1, 8.0))), 1)))']],
    }),
    task('expert', 'Print the table', {
      prompt: 'Show the summary as lined-up text, with a header:\n\n```\ncompost  mean median   sd\nleaf     10.6   10.7  0.6\nhome      8.6    7.3  2.8\npeat      8.2    8.1  0.7\n```\n\nUse `sprintf("%-7s %5.1f %6.1f %4.1f", …)` for each row.',
      starter: SEEDLINGS,
      hint: 'Work out the three summaries per compost, sort by mean, then `cat("compost  mean median   sd\\n")` and `cat(sprintf("%-7s %5.1f %6.1f %4.1f\\n", …), sep = "")`.',
      solution: SEEDLINGS + r`h <- seedlings$height_cm
g <- seedlings$compost
m <- tapply(h, g, mean)
md <- tapply(h, g, median)
s <- tapply(h, g, sd)
o <- order(-m)
cat("compost  mean median   sd\n")
cat(sprintf("%-7s %5.1f %6.1f %4.1f\n", names(m)[o], m[o], md[o], s[o]), sep = "")`,
      tests: [['Shows the table', 'identical(trimws(strsplit(._cq_stdout, "\\n", fixed = TRUE)[[1]], "right"), c("compost  mean median   sd", sprintf("%-7s %5.1f %6.1f %4.1f", c("leaf", "home", "peat"), c(10.575, 8.6, 8.2), c(10.65, 7.35, 8.1), c(sd(c(10.4, 11.2, 9.8, 10.9)), sd(c(7.1, 12.8, 6.9, 7.6)), sd(c(8.2, 7.5, 9.1, 8.0))))))']],
    }),
  ],
  questions: [
    mc('Leaf mould has mean 10.6 and sd 0.6; home compost mean 8.6 and sd 2.8. Which is more predictable?', ['Home', 'Leaf mould', 'They are the same', 'You can\'t tell'], 1,
      'A smaller sd means the trays grew more evenly.'),
    mc('The leaf mould trays are 10.4, 11.2, 9.8 and 10.9 cm. What does `diff(range(c(10.4, 11.2, 9.8, 10.9)))` give?', ['`1.4`', '`10.6`', '`9.8 11.2`', '`0.6`'], 0,
      'The tallest tray minus the shortest: a small range, so leaf mould is even as well as tall.',
      { code: 'diff(range(c(10.4, 11.2, 9.8, 10.9)))', output: '[1] 1.4' }),
    mc('What does `sprintf("%-7s|", "leaf")` give?', ['`"leaf   |"`', '`"   leaf|"`', '`"leaf|"`', '`"-7leaf|"`'], 0,
      'The `-` means left-aligned, padded to 7 characters.',
      { code: 'sprintf("%-7s|", "leaf")', output: '[1] "leaf   |"' }),
    mc('With only 4 trays per compost, how sure can you be that leaf mould is best?', ['Completely sure', 'It looks better, but 4 trays is a small test', 'Not at all', 'It depends on R'], 1,
      'Small groups vary a lot by chance. The Statistics quest shows how to test it.'),
    mc('What does `round(c(10.575, 8.6), 1)` give?', ['`[1] 10.6  8.6`', '`[1] 10.5 8.6`', '`[1] 11  9`', '`[1] 10.575 8.6`'], 0,
      'One decimal place.',
      { code: 'round(c(10.575, 8.6), 1)', output: '[1] 10.6  8.6' }),
    qShort('Which function makes a data frame of group summaries using a formula like `height_cm ~ compost`?', 'aggregate',
      '`aggregate(height_cm ~ compost, data = seedlings, FUN = mean)`'),
  ],
})
