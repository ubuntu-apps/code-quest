// Types, text and factors, easy side quest: The visitor survey.
import { code, isTexts, makeProject, mc, near, prints, qShort, r, snippet, task, uses } from '../_builders.mjs'

const DATA = 'answers <- c("Yes", "no", " yes", "YES", "No", NA, "yes ", "no")\n'
const CLEAN = 'answers <- c("yes", "no", "yes", "yes", "no", NA, "yes", "no")\n'

export default makeProject('easy', {
  id: 'proj_visitor_survey',
  title: 'The visitor survey',
  paragraphs: [
    'The Riverside Library asked visitors one question on a paper form: "Would you come to an evening opening?" Volunteers typed the answers in, each in their own way:',
    code('answers <- c("Yes", "no", " yes", "YES", "No", NA, "yes ", "no")'),
    'To R, `"Yes"`, `" yes"` and `"YES"` are three different answers. Clean them up, count them, and report the result:',
    code('yes: 4', 'no: 3', 'Yes share: 57%'),
    'The share is of the people who answered, leaving out the blank form.',
  ],
  sandboxCode: DATA + 'table(answers)',
  sandboxSnippets: [
    snippet('Tidy step by step', DATA + 'trimws(answers)\ntolower(trimws(answers))'),
  ],
  challenges: [
    task('easy', 'Tidy the answers', {
      prompt: 'Make `clean` the answers with the spaces trimmed and all in small letters.',
      starter: DATA,
      hint: '`clean <- tolower(trimws(answers))`',
      solution: DATA + 'clean <- tolower(trimws(answers))',
      tests: [['clean is yes no yes yes no NA yes no', 'identical(clean, c("yes", "no", "yes", "yes", "no", NA, "yes", "no"))']],
    }),
    task('easy', 'Count them', {
      prompt: 'Make `counts` a table of the cleaned answers.',
      starter: CLEAN,
      hint: '`counts <- table(answers)`',
      solution: CLEAN + 'counts <- table(answers)',
      tests: [['counts is no 3, yes 4', 'identical(as.vector(counts), c(3L, 4L)) && identical(names(counts), c("no", "yes"))']],
    }),
    task('medium', 'Yes first', {
      prompt: 'Make `answer_f` a factor of the answers with the levels in the order `yes`, `no`.',
      starter: CLEAN,
      hint: '`answer_f <- factor(answers, levels = c("yes", "no"))`',
      solution: CLEAN + 'answer_f <- factor(answers, levels = c("yes", "no"))',
      tests: [['answer_f has levels yes, no', 'is.factor(answer_f) && identical(levels(answer_f), c("yes", "no"))']],
    }),
    task('medium', 'How many answered', {
      prompt: 'Make `n_answered` the number of forms with an answer.',
      starter: CLEAN,
      hint: '`n_answered <- sum(!is.na(answers))`',
      solution: CLEAN + 'n_answered <- sum(!is.na(answers))',
      tests: [['n_answered is 7', near('n_answered', 7)]],
    }),
    task('hard', 'The yes share', {
      prompt: 'Make `yes_share` the percentage of answers that were yes, rounded to a whole number, leaving out the blank form.',
      starter: CLEAN,
      hint: 'The yeses divided by the answers: `round(sum(answers == "yes", na.rm = TRUE) / sum(!is.na(answers)) * 100)`.',
      solution: CLEAN + 'yes_share <- round(sum(answers == "yes", na.rm = TRUE) / sum(!is.na(answers)) * 100)',
      tests: [['yes_share is 57', near('yes_share', 57)]],
    }),
    task('expert', 'The survey report', {
      prompt: 'Starting from the messy answers, clean them and show:\n\n```\nyes: 4\nno: 3\nYes share: 57%\n```',
      starter: DATA,
      hint: 'Clean with `tolower(trimws())`, count with `table()`, and build each line with `cat()`. `cat("Yes share: ", share, "%\\n", sep = "")` leaves out the spaces.',
      solution: DATA + r`clean <- tolower(trimws(answers))
counts <- table(factor(clean, levels = c("yes", "no")))
share <- round(counts[["yes"]] / sum(counts) * 100)
cat("yes:", counts[["yes"]], "\n")
cat("no:", counts[["no"]], "\n")
cat("Yes share: ", share, "%\n", sep = "")`,
      tests: [
        ['Shows the report', prints('yes: 4', 'no: 3', 'Yes share: 57%')],
        ['Cleans the answers in R', uses('trimws(') + ' && ' + uses('tolower(')],
      ],
    }),
  ],
  questions: [
    mc('What does `tolower(trimws(" YES "))` give?', ['`"yes"`', '`" yes "`', '`"YES"`', '`"Yes"`'], 0,
      'Trim the spaces, then make it small letters.',
      { code: 'tolower(trimws(" YES "))', output: '[1] "yes"' }),
    mc('What does `"Yes" == "yes"` give?', ['`TRUE`', '`FALSE`', '`NA`', 'An error'], 1,
      'Capitals count, which is why answers need cleaning before counting.',
      { code: '"Yes" == "yes"', output: '[1] FALSE' }),
    mc('What does `sum(c("yes", NA, "yes") == "yes")` give?', ['`2`', '`NA`', '`3`', '`1`'], 1,
      'The NA makes the sum NA; add `na.rm = TRUE`.',
      { code: 'sum(c("yes", NA, "yes") == "yes")', output: '[1] NA' }),
    mc('What does `round(4 / 7 * 100)` give?', ['`57`', '`58`', '`0.57`', '`57.14`'], 0,
      '4 / 7 is 0.571, so 57%.',
      { code: 'round(4 / 7 * 100)', output: '[1] 57' }),
    mc('What does `cat("Share: ", 57, "%\\n", sep = "")` show?', ['`Share: 57 %`', '`Share: 57%`', '`Share:57%`', '`"Share: 57%"`'], 1,
      '`sep = ""` joins the pieces with nothing between, so the spaces come only from the text.',
      { code: r`cat("Share: ", 57, "%\n", sep = "")`, output: 'Share: 57%' }),
    qShort('Which function makes text all small letters?', 'tolower',
      '`tolower()` is the opposite of `toupper()`.'),
  ],
})
