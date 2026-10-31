// Types, text and factors, medium side quest: Library loans.
import { code, isText, isTexts, makeProject, mc, near, prints, qShort, r, same, snippet, task, uses } from '../_builders.mjs'

const DATA = `codes <- c("FI-104", "SC-221", "FI-350", "HI-007", "SC-118")
borrowed <- c("2026-10-01", "2026-10-03", "2026-10-07", "2026-10-10", "2026-10-12")
returned <- c("2026-10-12", "2026-10-25", "2026-10-21", "2026-10-30", "2026-10-20")
`
const DATED = `codes <- c("FI-104", "SC-221", "FI-350", "HI-007", "SC-118")
borrowed <- as.Date(c("2026-10-01", "2026-10-03", "2026-10-07", "2026-10-10", "2026-10-12"))
returned <- as.Date(c("2026-10-12", "2026-10-25", "2026-10-21", "2026-10-30", "2026-10-20"))
`

export default makeProject('medium', {
  id: 'proj_library_loans',
  title: 'Library loans',
  paragraphs: [
    'The Riverside Library lends books for **14 days**. A late book costs **0.25 per day** over the 14. Each book code starts with its shelf: `FI` fiction, `SC` science, `HI` history. Here are five loans from October, with the dates as text, the way they came out of the system:',
    code('codes <- c("FI-104", "SC-221", "FI-350", "HI-007", "SC-118")', 'borrowed <- c("2026-10-01", "2026-10-03", "2026-10-07", "2026-10-10", "2026-10-12")', 'returned <- c("2026-10-12", "2026-10-25", "2026-10-21", "2026-10-30", "2026-10-20")'),
    'Turn the dates into real dates, work out how long each loan lasted, which were late and what they owe, and count the loans per shelf. The last challenge shows:',
    code('Late: 2 of 5', 'Fines: 3.50', 'Busiest shelf: FI'),
  ],
  sandboxCode: DATA + 'as.Date(returned) - as.Date(borrowed)',
  sandboxSnippets: [
    snippet('Shelves', 'codes <- c("FI-104", "SC-221", "FI-350")\nsubstr(codes, 1, 2)'),
    snippet('Days late', 'days <- c(11, 22, 14, 20, 8)\nifelse(days > 14, days - 14, 0)'),
  ],
  challenges: [
    task('easy', 'Real dates', {
      prompt: 'Turn `borrowed` and `returned` into Dates, keeping the same names.',
      starter: DATA,
      hint: '`borrowed <- as.Date(borrowed)`, and the same for `returned`.',
      solution: DATA + 'borrowed <- as.Date(borrowed)\nreturned <- as.Date(returned)',
      tests: [['Both are Dates', 'inherits(borrowed, "Date") && inherits(returned, "Date") && length(returned) == 5']],
    }),
    task('easy', 'Days out', {
      prompt: 'Make `days` the number of days each book was out, as plain numbers.',
      starter: DATED,
      hint: '`days <- as.numeric(returned - borrowed)`',
      solution: DATED + 'days <- as.numeric(returned - borrowed)',
      tests: [['days is 11, 22, 14, 20, 8', near('days', 'c(11, 22, 14, 20, 8)')]],
    }),
    task('medium', 'Days late', {
      prompt: 'Make `days_late` the number of days over 14 for each loan, or 0 when it was on time.',
      starter: DATED + 'days <- as.numeric(returned - borrowed)\n',
      hint: '`days_late <- ifelse(days > 14, days - 14, 0)`',
      solution: DATED + 'days <- as.numeric(returned - borrowed)\ndays_late <- ifelse(days > 14, days - 14, 0)',
      tests: [['days_late is 0, 8, 0, 6, 0', near('days_late', 'c(0, 8, 0, 6, 0)')]],
    }),
    task('medium', 'The fines', {
      prompt: 'Make `fines` what each loan owes at 0.25 per day late, and `total_fines` their total.',
      starter: 'days_late <- c(0, 8, 0, 6, 0)\n',
      hint: '`fines <- days_late * 0.25` and `total_fines <- sum(fines)`.',
      solution: 'days_late <- c(0, 8, 0, 6, 0)\nfines <- days_late * 0.25\ntotal_fines <- sum(fines)',
      tests: [
        ['fines is 0, 2, 0, 1.5, 0', near('fines', 'c(0, 2, 0, 1.5, 0)')],
        ['total_fines is 3.5', near('total_fines', 3.5)],
      ],
    }),
    task('hard', 'Loans per shelf', {
      prompt: 'Make `shelf` a factor of the first two letters of each code, with the levels `FI`, `SC`, `HI`, and `per_shelf` a table counting them.',
      starter: DATED,
      hint: '`shelf <- factor(substr(codes, 1, 2), levels = c("FI", "SC", "HI"))`, then `per_shelf <- table(shelf)`.',
      solution: DATED + 'shelf <- factor(substr(codes, 1, 2), levels = c("FI", "SC", "HI"))\nper_shelf <- table(shelf)',
      tests: [
        ['shelf has levels FI, SC, HI', 'is.factor(shelf) && identical(levels(shelf), c("FI", "SC", "HI"))'],
        ['per_shelf is FI 2, SC 2, HI 1', 'identical(as.vector(per_shelf), c(2L, 2L, 1L))'],
      ],
    }),
    task('expert', 'The loans report', {
      prompt: 'Starting from the text dates, show:\n\n```\nLate: 2 of 5\nFines: 3.50\nBusiest shelf: FI\n```\n\nShow the fines with two decimals. When two shelves tie, the one that comes first in the levels (`FI`, `SC`, `HI`) wins.',
      starter: DATA,
      hint: 'Dates with `as.Date()`, days and `ifelse()` as before, `sprintf("%.2f", …)` for the fines, and `names(which.max(table(shelf)))` for the busiest shelf.',
      solution: DATA + r`days <- as.numeric(as.Date(returned) - as.Date(borrowed))
days_late <- ifelse(days > 14, days - 14, 0)
shelf <- factor(substr(codes, 1, 2), levels = c("FI", "SC", "HI"))
cat("Late:", sum(days > 14), "of", length(days), "\n")
cat("Fines:", sprintf("%.2f", sum(days_late * 0.25)), "\n")
cat("Busiest shelf:", names(which.max(table(shelf))), "\n")`,
      tests: [['Shows the report', prints('Late: 2 of 5', 'Fines: 3.50', 'Busiest shelf: FI')]],
    }),
  ],
  questions: [
    mc('What does `as.numeric(as.Date("2026-10-25") - as.Date("2026-10-03"))` give?', ['`22`', '`21`', '`"22 days"`', '`23`'], 0,
      'From the 3rd to the 25th is 22 days.',
      { code: 'as.numeric(as.Date("2026-10-25") - as.Date("2026-10-03"))', output: '[1] 22' }),
    mc('What does `ifelse(c(11, 22) > 14, c(11, 22) - 14, 0)` give?', ['`[1] 0 8`', '`[1] -3  8`', '`[1] 11 22`', '`[1] 8`'], 0,
      'Only the 22-day loan is late, by 8 days.',
      { code: 'ifelse(c(11, 22) > 14, c(11, 22) - 14, 0)', output: '[1] 0 8' }),
    mc('What does `substr("SC-221", 1, 2)` give?', ['`"SC"`', '`"SC-"`', '`"221"`', '`"S"`'], 0,
      'The first two characters.',
      { code: 'substr("SC-221", 1, 2)', output: '[1] "SC"' }),
    mc('What does `sprintf("%.2f", 3.5)` give?', ['`"3.5"`', '`"3.50"`', '`3.50`', '`"3"`'], 1,
      'Always two decimals, as text.',
      { code: 'sprintf("%.2f", 3.5)', output: '[1] "3.50"' }),
    mc('With a tie, which name does `names(which.max(table(factor(c("SC", "FI"), levels = c("FI", "SC")))))` give?', ['`"SC"`', '`"FI"`', 'Both', '`NA`'], 1,
      '`which.max()` takes the first of the tied largest values, which follows the level order.',
      { code: 'names(which.max(table(factor(c("SC", "FI"), levels = c("FI", "SC")))))', output: '[1] "FI"' }),
    mc('What does `as.Date("2026-10-01") + 14` give?', ['`2026-10-15`', '`2026-10-14`', '`2026-10-29`', 'An error'], 0,
      'Adding 14 adds fourteen days.',
      { code: 'format(as.Date("2026-10-01") + 14)', output: '[1] "2026-10-15"' }),
    qShort('Which function counts the loans per shelf in one step, as in `__(shelf)`?', 'table',
      '`table()` counts each level of the factor.'),
  ],
})
