// Capstone: The garden's season.
import { code, isText, makeTopic, mc, near, prints, qShort, snippet, task } from '../_builders.mjs'

const RAW = 'raw <- "date,plot,crop,weight\n03/06/2026,A,Tomatoes,2.4kg\n03/06/2026,b,beans,1.1 kg\n10/06/2026,A,tomatoes,3.0kg\n10/06/2026,C,Kale,0.8kg\n17/06/2026,B,Beans,1.6kg\n17/06/2026,C,kale,\n01/07/2026,A,tomatoes,4.2kg\n01/07/2026,B,beans,2.0kg\n08/07/2026,C,kale,1.2kg\n08/07/2026,A,Tomatoes,3.8kg\n15/07/2026,b,BEANS,1.9kg\n15/07/2026,C,kale,1.5kg"\n'
const PLOTS = 'plots <- data.frame(plot = c("A", "B", "C"), family = c("Silva", "Okafor", "Li"))\n'
const READ = 'harvest <- read.csv(text = raw, na.strings = "")\n'
const TIDY = 'harvest$plot <- toupper(trimws(harvest$plot))\nharvest$crop <- tolower(trimws(harvest$crop))\n'
const KG = 'harvest$kg <- as.numeric(trimws(gsub("kg", "", harvest$weight)))\n'
const DATES = 'harvest$date <- as.Date(harvest$date, format = "%d/%m/%Y")\nharvest$month <- format(harvest$date, "%Y-%m")\n'
const READY = RAW + PLOTS + READ + TIDY + KG + DATES
const TRIAL = 'trial <- data.frame(\n  compost = rep(c("home", "leaf"), each = 6),\n  kg = c(2.1, 2.6, 1.9, 2.4, 2.2, 2.0, 2.7, 3.1, 2.5, 2.9, 3.3, 2.6)\n)\n'

export default makeTopic({
  id: 'capstone_garden',
  title: 'The garden\'s season',
  paragraphs: [
    'Welcome to the capstone quest. Each one is a full piece of work on data of its own, using skills from across the course: reading and cleaning, grouping and joining, a test where it helps, and a short report at the end. The challenges say what the result should look like, not how to get it, so there is usually more than one good answer; the hints show one way.',
    'The first is the Elm Street community garden. Every week the gardeners weigh what they pick and write it on a shared sheet, which has the usual problems: plot letters in either case, crops spelled three ways, weights written with "kg", and one weigh-in left blank. There is also a small table of which family looks after which plot.',
    code(...RAW.trim().split('\n'), PLOTS.trim()),
    'At the end of the season the garden committee wants to know how much each crop and each family produced, how the months compare, and whether the new leaf-mould compost was worth it. Each challenge starts from the steps before it, so you can check one step at a time.',
  ],
  sandboxCode: RAW + READ + 'str(harvest)\ntable(harvest$crop)',
  sandboxSnippets: [snippet('The cleaned table', READY + 'harvest')],
  challenges: [
    task('easy', 'Read the sheet', {
      prompt: 'Make `harvest` the sheet read from `raw`, with the blank weigh-in as NA.',
      starter: RAW + PLOTS,
      hint: '`read.csv(text = raw, na.strings = "")`',
      solution: RAW + PLOTS + READ,
      tests: [['harvest has 12 rows and 4 columns', 'is.data.frame(harvest) && identical(dim(harvest), c(12L, 4L))'], ['One weight is NA', 'sum(is.na(harvest$weight)) == 1']],
    }),
    task('easy', 'One spelling each', {
      prompt: 'Make every plot a capital letter and every crop small letters, with no spaces at the ends.',
      starter: RAW + PLOTS + READ,
      hint: '`toupper(trimws(harvest$plot))` and `tolower(trimws(harvest$crop))`.',
      solution: RAW + PLOTS + READ + TIDY,
      tests: [['plots are A, B and C only', 'setequal(harvest$plot, c("A", "B", "C"))'], ['crops are beans, kale and tomatoes only', 'setequal(harvest$crop, c("beans", "kale", "tomatoes"))']],
    }),
    task('easy', 'Weights as numbers', {
      prompt: 'Add a column `kg`: the weight as a number, without the "kg".',
      starter: RAW + PLOTS + READ + TIDY,
      hint: 'Remove the letters, then the spaces, then convert: `as.numeric(trimws(gsub("kg", "", harvest$weight)))`.',
      solution: RAW + PLOTS + READ + TIDY + KG,
      tests: [['kg is the 12 weights, one NA', 'isTRUE(all.equal(harvest$kg, c(2.4, 1.1, 3, 0.8, 1.6, NA, 4.2, 2, 1.2, 3.8, 1.9, 1.5)))']],
    }),
    task('medium', 'Real dates', {
      prompt: 'Make `date` real dates (they are day first) and add a column `month` like `"2026-06"`.',
      starter: RAW + PLOTS + READ + TIDY + KG,
      hint: '`as.Date(harvest$date, format = "%d/%m/%Y")`, then `format(harvest$date, "%Y-%m")`.',
      solution: RAW + PLOTS + READ + TIDY + KG + DATES,
      tests: [['date is a Date column', 'inherits(harvest$date, "Date") && identical(format(harvest$date[1]), "2026-06-03")'], ['month is 6 of 2026-06 then 6 of 2026-07', 'identical(harvest$month, rep(c("2026-06", "2026-07"), each = 6))']],
    }),
    task('medium', 'Per crop', {
      prompt: 'Make `per_crop` the total kg of each crop, leaving out the missing weigh-in.',
      starter: READY,
      hint: '`tapply(harvest$kg, harvest$crop, sum, na.rm = TRUE)`',
      solution: READY + 'per_crop <- tapply(harvest$kg, harvest$crop, sum, na.rm = TRUE)',
      tests: [['per_crop is beans 6.6, kale 3.5, tomatoes 13.4', 'isTRUE(all.equal(as.vector(per_crop), c(6.6, 3.5, 13.4))) && identical(names(per_crop), c("beans", "kale", "tomatoes"))']],
    }),
    task('medium', 'June against July', {
      prompt: 'Make `grid` a matrix of the kg picked of each crop (rows) in each month (columns).',
      starter: READY,
      hint: '`tapply(harvest$kg, list(harvest$crop, harvest$month), sum, na.rm = TRUE)`',
      solution: READY + 'grid <- tapply(harvest$kg, list(harvest$crop, harvest$month), sum, na.rm = TRUE)',
      tests: [['grid is beans 2.7 3.9, kale 0.8 2.7, tomatoes 5.4 8', 'is.matrix(grid) && isTRUE(all.equal(unname(grid), matrix(c(2.7, 0.8, 5.4, 3.9, 2.7, 8), nrow = 3)))']],
    }),
    task('hard', 'Per family', {
      prompt: 'Make `per_family` the total kg each family picked, using the `plots` table, sorted from most to least.',
      starter: READY,
      hint: '`merge(harvest, plots, by = "plot")`, then `sort(tapply(…$kg, …$family, sum, na.rm = TRUE), decreasing = TRUE)`.',
      solution: READY + 'with_family <- merge(harvest, plots, by = "plot")\nper_family <- sort(tapply(with_family$kg, with_family$family, sum, na.rm = TRUE), decreasing = TRUE)',
      tests: [['per_family is Silva 13.4, Okafor 6.6, Li 3.5', 'isTRUE(all.equal(as.vector(per_family), c(13.4, 6.6, 3.5))) && identical(names(per_family), c("Silva", "Okafor", "Li"))']],
    }),
    task('hard', 'The blank weigh-in', {
      prompt: 'Make `blank` a one-line description of the missing weigh-in, like `"C kale 2026-06-17"`: plot, crop and date, separated by spaces.',
      starter: READY,
      hint: 'Pick the row with `is.na(harvest$kg)`, then `paste(row$plot, row$crop, format(row$date))`.',
      solution: READY + 'row <- harvest[is.na(harvest$kg), ]\nblank <- paste(row$plot, row$crop, format(row$date))',
      tests: [['blank is "C kale 2026-06-17"', isText('blank', 'C kale 2026-06-17')]],
    }),
    task('expert', 'Was the compost worth it?', {
      prompt: 'In a side trial, 6 beds had home compost and 6 leaf mould. Make `p` the p-value of a t-test of kg by compost, rounded to 3 decimal places, and `gain` the leaf-mould mean minus the home mean, rounded to 2.',
      starter: TRIAL,
      hint: '`t.test(kg ~ compost, data = trial)$p.value`; the means are in `$estimate` (home first, alphabetically), or use `tapply()`.',
      solution: TRIAL + 'res <- t.test(kg ~ compost, data = trial)\np <- round(res$p.value, 3)\ngain <- round(unname(res$estimate[2] - res$estimate[1]), 2)',
      tests: [['p is 0.003', near('p', 0.003)], ['gain is 0.65', near('gain', 0.65)]],
    }),
    task('expert', 'The season report', {
      prompt: 'Show the committee\'s three-line report:\n\n```\nWeigh-ins: 12 (1 blank)\nTotal: 23.5 kg\nBest crop: tomatoes (13.4 kg)\n```',
      starter: READY,
      hint: '`nrow(harvest)`, `sum(is.na(harvest$kg))`, `sum(harvest$kg, na.rm = TRUE)`, and the crop totals with `which.max()`. Join each line with `cat(..., sep = "")`.',
      solution: READY + 'per_crop <- tapply(harvest$kg, harvest$crop, sum, na.rm = TRUE)\nbest <- names(which.max(per_crop))\ncat("Weigh-ins: ", nrow(harvest), " (", sum(is.na(harvest$kg)), " blank)\\n", sep = "")\ncat("Total: ", sum(harvest$kg, na.rm = TRUE), " kg\\n", sep = "")\ncat("Best crop: ", best, " (", max(per_crop), " kg)\\n", sep = "")',
      tests: [['Shows the report', prints('Weigh-ins: 12 (1 blank)', 'Total: 23.5 kg', 'Best crop: tomatoes (13.4 kg)')]],
    }),
  ],
  questions: [
    mc('Why clean the plot and crop names before any totals?', ['It looks tidier', 'Otherwise "b" and "B", or "Kale" and "kale", are counted as different groups', 'tapply() needs capitals', 'To sort them'], 1,
      'Every grouping is only as good as its labels.'),
    mc('What does `as.numeric(trimws(gsub("kg", "", "1.1 kg")))` give?', ['`1.1`', '`NA`', '`11`', 'An error'], 0,
      'The "kg" goes, then the space, then it converts.',
      { code: 'as.numeric(trimws(gsub("kg", "", "1.1 kg")))', output: '[1] 1.1' }),
    mc('Why keep the blank weigh-in as NA instead of 0?', ['0 is not allowed', 'Something was picked that day; 0 would claim nothing was', 'NA is smaller', 'R can\'t store 0'], 1,
      'NA says "not known", which is the truth here.'),
    mc('Why does every total use `na.rm = TRUE`?', ['To make it faster', 'One NA would make the whole total NA', 'To drop zeros', 'It rounds the result'], 1,
      'And the report says how many were blank.'),
    mc('Why `format = "%d/%m/%Y"` for these dates?', ['They are month first', 'They are day first, as 17/06 shows: there is no month 17', 'It is the default', 'To get the weekday'], 1,
      'Look for a value over 12 to tell which way round dates are.'),
    mc('Each plot grows one crop here. Why is the per-family total the same as the per-crop total?', ['A mistake', 'Because each family\'s plot has a single crop', 'merge() copies values', 'It isn\'t'], 1,
      'In a garden with mixed plots the two tables would differ.'),
    mc('The compost trial gives p = 0.003 and a gain of 0.65 kg. What is a fair summary?', ['Leaf mould always gives 0.65 kg more', 'Strong evidence leaf mould gave more, about 0.65 kg a bed, in this trial of 12 beds', 'No difference', 'Home compost is better'], 1,
      'Report the size of the effect as well as the p-value.'),
    mc('Why is the trial a separate table, not the season sheet?', ['It is shorter', 'In the season sheet each plot had one crop and one family, so compost would be mixed up with everything else', 'R needs two tables', 'It isn\'t needed'], 1,
      'A fair comparison changes one thing at a time.'),
    qShort('Which function joins the harvest to the plots table by plot?', 'merge',
      '`merge(harvest, plots, by = "plot")`'),
  ],
})
