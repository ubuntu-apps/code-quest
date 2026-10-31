// Data frames, hard side quest: The garden plots.
import { code, isText, isTexts, makeProject, mc, near, prints, qShort, r, sameFrame, snippet, task } from '../_builders.mjs'
import { HARVEST } from '../datasets.mjs'

const LATE = 'late <- data.frame(plot = c("B", "D"), crop = c("kale", "kale"), kg = c(2.3, 3.1), family = c("Okafor", "Mensah"))\n'

export default makeProject('hard', {
  id: 'proj_garden_plots',
  title: 'The garden plots',
  paragraphs: [
    'The Elm Street garden\'s harvest table has a gap, and a late sheet has just turned up with two more rows: the Okafors\' kale (2.3 kg, which fills the gap) and the Mensahs\' kale (3.1 kg, a new row).',
    code(...(HARVEST + LATE).trim().split('\n')),
    'Bring it all together, then report per family. The last challenge shows:',
    code('Families: 4', 'Total: 55.1 kg', 'Top family: Mensah (20.2 kg)', 'Top crop: tomatoes'),
  ],
  sandboxCode: HARVEST + LATE + 'harvest\nlate',
  sandboxSnippets: [snippet('Per family', HARVEST + 'tapply(harvest$kg, harvest$family, sum, na.rm = TRUE)')],
  challenges: [
    task('easy', 'Drop the gap', {
      prompt: 'The late sheet has the Okafors\' kale, so remove the row with the missing weight from `harvest`.',
      starter: HARVEST,
      hint: '`harvest <- harvest[!is.na(harvest$kg), ]` (or `na.omit(harvest)`).',
      solution: HARVEST + 'harvest <- harvest[!is.na(harvest$kg), ]',
      tests: [['harvest has 7 rows and no NA', 'is.data.frame(harvest) && nrow(harvest) == 7 && !anyNA(harvest$kg)']],
    }),
    task('medium', 'Add the late rows', {
      prompt: 'Make `all_rows` the 7 complete rows of `harvest` followed by the 2 rows of `late`.',
      starter: HARVEST + LATE + 'harvest <- harvest[!is.na(harvest$kg), ]\n',
      hint: '`all_rows <- rbind(harvest, late)`',
      solution: HARVEST + LATE + 'harvest <- harvest[!is.na(harvest$kg), ]\nall_rows <- rbind(harvest, late)',
      tests: [['all_rows has 9 rows', 'is.data.frame(all_rows) && nrow(all_rows) == 9 && isTRUE(all.equal(sum(all_rows$kg), 55.1))']],
    }),
    task('medium', 'How many families', {
      prompt: 'Make `n_families` the number of different families.',
      starter: HARVEST,
      hint: '`n_families <- length(unique(harvest$family))`',
      solution: HARVEST + 'n_families <- length(unique(harvest$family))',
      tests: [['n_families is 4', near('n_families', 4)]],
    }),
    task('hard', 'Per family', {
      prompt: 'Make `per_family` the total kg per family, using `tapply()` on the 9 complete rows.',
      starter: HARVEST + LATE + 'all_rows <- rbind(harvest[!is.na(harvest$kg), ], late)\n',
      hint: '`per_family <- tapply(all_rows$kg, all_rows$family, sum)`',
      solution: HARVEST + LATE + 'all_rows <- rbind(harvest[!is.na(harvest$kg), ], late)\nper_family <- tapply(all_rows$kg, all_rows$family, sum)',
      tests: [['per_family is Li 6.8, Mensah 20.2, Okafor 12.1, Silva 16', 'isTRUE(all.equal(as.vector(per_family), c(6.8, 20.2, 12.1, 16))) && identical(names(per_family), c("Li", "Mensah", "Okafor", "Silva"))']],
    }),
    task('hard', 'Kale growers', {
      prompt: 'Make `kale` the `family` and `kg` of the kale rows, heaviest first.',
      starter: HARVEST + LATE + 'all_rows <- rbind(harvest[!is.na(harvest$kg), ], late)\n',
      hint: '`kale <- subset(all_rows, crop == "kale", select = c(family, kg))`, then sort by `-kale$kg`.',
      solution: HARVEST + LATE + 'all_rows <- rbind(harvest[!is.na(harvest$kg), ], late)\nkale <- subset(all_rows, crop == "kale", select = c(family, kg))\nkale <- kale[order(-kale$kg), ]',
      tests: [['kale is Mensah 3.1, Li 2.7, Okafor 2.3', sameFrame('kale', 'data.frame(family = c("Mensah", "Li", "Okafor"), kg = c(3.1, 2.7, 2.3))')]],
    }),
    task('expert', 'The garden report', {
      prompt: 'Starting from both tables, show:\n\n```\nFamilies: 4\nTotal: 55.1 kg\nTop family: Mensah (20.2 kg)\nTop crop: tomatoes\n```\n\nThe top crop is the one with the most kg in total.',
      starter: HARVEST + LATE,
      hint: 'Drop the NA row and `rbind()` the late rows. `tapply(…, sum)` per family and per crop, then `names(which.max())` and `max()`. `cat()` puts a space after `(`; use `paste0()` for "(20.2 kg)".',
      solution: HARVEST + LATE + r`all_rows <- rbind(harvest[!is.na(harvest$kg), ], late)
per_family <- tapply(all_rows$kg, all_rows$family, sum)
per_crop <- tapply(all_rows$kg, all_rows$crop, sum)
cat("Families:", length(per_family), "\n")
cat("Total:", sum(all_rows$kg), "kg\n")
cat("Top family:", names(which.max(per_family)), paste0("(", max(per_family), " kg)"), "\n")
cat("Top crop:", names(which.max(per_crop)), "\n")`,
      tests: [['Shows the report', prints('Families: 4', 'Total: 55.1 kg', 'Top family: Mensah (20.2 kg)', 'Top crop: tomatoes')]],
    }),
  ],
  questions: [
    mc('What does `length(unique(c("Li", "Silva", "Li")))` give?', ['`3`', '`2`', '`1`', '`"Li" "Silva"`'], 1,
      'Two different families.',
      { code: 'length(unique(c("Li", "Silva", "Li")))', output: '[1] 2' }),
    mc('If the late sheet had its columns in a different order, what would `rbind()` do?', ['Match the columns by name, so the rows still line up', 'Give an error', 'Put the values in the wrong columns', 'Add new columns'], 0,
      'For data frames, `rbind()` matches columns by their names.',
      { code: 'rbind(data.frame(a = 1, b = 2), data.frame(b = 4, a = 3))$a', output: '[1] 1 3' }),
    mc('After `df <- data.frame(plot = c("A", "B", "C"), kg = c(3, 9, 5))`, what does `df[order(-df$kg), "plot"][1]` give?', ['`"B"`', '`"A"`', '`"C"`', '`9`'], 0,
      'Sorted heaviest first, plot B comes first.',
      { code: 'df <- data.frame(plot = c("A", "B", "C"), kg = c(3, 9, 5))\ndf[order(-df$kg), "plot"][1]', output: '[1] "B"' }),
    mc('What does `paste0("(", 20.2, " kg)")` give?', ['`"( 20.2 kg)"`', '`"(20.2 kg)"`', '`"(20.2kg)"`', '`"20.2 kg"`'], 1,
      '`paste0()` joins with nothing in between, so only the space in " kg)" appears.',
      { code: 'paste0("(", 20.2, " kg)")', output: '[1] "(20.2 kg)"' }),
    mc('Why drop the row with the missing weight before adding the late sheet?', ['To sort the table', 'The late sheet has that row with its weight, so it would be counted twice', 'rbind() can\'t handle NA', 'It makes the table smaller'], 1,
      'Otherwise the Okafors\' kale would appear twice: once as NA and once as 2.3 kg.'),
    qShort('Which function drops every row that has a missing value, as in `__(harvest)`?', 'na.omit',
      '`na.omit(harvest)` keeps only complete rows. Check what it drops first.'),
  ],
})
