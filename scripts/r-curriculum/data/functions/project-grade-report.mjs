// Functions and control flow, medium side quest: The grade report.
import { code, isText, isTexts, makeProject, mc, prints, qShort, r, snippet, task } from '../_builders.mjs'
import { CLASS } from '../datasets.mjs'

const GRADE = 'grade <- function(score) {\n  if (is.na(score)) return(NA)\n  if (score >= 80) "A" else if (score >= 65) "B" else if (score >= 50) "C" else "F"\n}\n'

export default makeProject('medium', {
  id: 'proj_grade_report',
  title: 'The grade report',
  paragraphs: [
    'The teacher from the Summarising quest wants letter grades for test 2: **A** for 80 or more, **B** for 65 or more, **C** for 50 or more, **F** below. One student was absent and gets no grade.',
    code(...CLASS.trim().split('\n')),
    'Build it from small functions, then a function that makes the whole report. The last challenge shows the grade counts:',
    code('A: 5', 'B: 4', 'C: 2', 'F: 0', 'Absent: 1'),
  ],
  sandboxCode: CLASS + 'class_results$test2',
  sandboxSnippets: [snippet('Grades with sapply', CLASS + GRADE + 'sapply(class_results$test2, grade)')],
  challenges: [
    task('easy', 'One grade', {
      prompt: 'Write `grade(score)` for one score: `NA` if the score is NA, otherwise `"A"`, `"B"`, `"C"` or `"F"`.',
      hint: 'Start with `if (is.na(score)) return(NA)`, then an `if`/`else if` chain from A down.',
      solution: GRADE.trim(),
      tests: [['grade() gives the right letters', 'is.function(grade) && identical(c(grade(80), grade(79), grade(65), grade(50), grade(49)), c("A", "B", "B", "C", "F"))'], ['grade(NA) is NA', 'is.na(grade(NA))']],
    }),
    task('medium', 'Everyone\'s grade', {
      prompt: 'Make `grades` the grade for every test 2 score, with `sapply()`.',
      starter: CLASS + GRADE,
      hint: '`grades <- sapply(class_results$test2, grade)`',
      solution: CLASS + GRADE + 'grades <- sapply(class_results$test2, grade)',
      tests: [['grades is right for every student', 'identical(unname(grades), c("B", "B", "A", "C", "A", NA, "A", "B", "A", "C", "B", "A"))']],
    }),
    task('medium', 'A line per student', {
      prompt: 'Write `report_line(name, score)` that gives text like `"Ana: 78 (B)"`, using `grade()`.',
      starter: GRADE,
      hint: '`paste0(name, ": ", score, " (", grade(score), ")")`',
      solution: GRADE + 'report_line <- function(name, score) {\n  paste0(name, ": ", score, " (", grade(score), ")")\n}',
      tests: [['report_line("Ana", 78) is "Ana: 78 (B)"', 'is.function(report_line) && identical(report_line("Ana", 78), "Ana: 78 (B)")']],
    }),
    task('medium', 'Add a grade column', {
      prompt: 'Write `add_grades(df)` that gives back the data frame with a new column `grade2`: the grade for `test2`.',
      starter: CLASS + GRADE,
      hint: 'Inside: `df$grade2 <- sapply(df$test2, grade)`, then `df` as the last line.',
      solution: CLASS + GRADE + 'add_grades <- function(df) {\n  df$grade2 <- sapply(df$test2, grade)\n  df\n}',
      tests: [['add_grades() adds the grade2 column', 'is.function(add_grades) && local({ g <- add_grades(class_results); identical(names(g), c(names(class_results), "grade2")) && identical(unname(g$grade2), c("B", "B", "A", "C", "A", NA, "A", "B", "A", "C", "B", "A")) })']],
    }),
    task('hard', 'Count the grades', {
      prompt: 'Make `counts` a table of how many of each grade, in the order A, B, C, F, including grades nobody got.',
      starter: CLASS + GRADE + 'grades <- sapply(class_results$test2, grade)\n',
      hint: 'Make a factor with the levels A, B, C, F first: `table(factor(grades, levels = c("A", "B", "C", "F")))`.',
      solution: CLASS + GRADE + 'grades <- sapply(class_results$test2, grade)\ncounts <- table(factor(grades, levels = c("A", "B", "C", "F")))',
      tests: [['counts is A 5, B 4, C 2, F 0', 'identical(as.vector(counts), c(5L, 4L, 2L, 0L)) && identical(names(counts), c("A", "B", "C", "F"))']],
    }),
    task('expert', 'The grade summary', {
      prompt: 'Write `grade_summary(scores)` that shows the count of each grade and the number absent, then call it on test 2:\n\n```\nA: 5\nB: 4\nC: 2\nF: 0\nAbsent: 1\n```',
      starter: CLASS + GRADE,
      hint: 'Inside: grades with `sapply()`, counts with `table(factor(…))`, then `cat(sprintf("%s: %d\\n", names(counts), counts), sep = "")` and a line for `sum(is.na(scores))`.',
      solution: CLASS + GRADE + r`grade_summary <- function(scores) {
  grades <- sapply(scores, grade)
  counts <- table(factor(grades, levels = c("A", "B", "C", "F")))
  cat(sprintf("%s: %d\n", names(counts), as.integer(counts)), sep = "")
  cat("Absent:", sum(is.na(scores)), "\n")
}
grade_summary(class_results$test2)`,
      tests: [['Shows the summary', prints('A: 5', 'B: 4', 'C: 2', 'F: 0', 'Absent: 1')], ['grade_summary is a function', 'is.function(grade_summary)']],
    }),
  ],
  questions: [
    mc('Why does `grade()` check `is.na(score)` first?', ['To be faster', '`if (NA >= 80)` would stop with an error', 'R needs it', 'To give NA a grade of F'], 1,
      '`if` can\'t decide with NA, so missing scores are handled first.'),
    mc('What does `sapply(c(85, 52), \\(s) if (s >= 80) "A" else "C")` give?', ['`[1] "A" "C"`', '`"A"`', 'An error', '`[1] "C" "A"`'], 0,
      'One answer per score.',
      { code: 'sapply(c(85, 52), \\(s) if (s >= 80) "A" else "C")', output: '[1] "A" "C"' }),
    mc('What does `paste0("Ana", ": ", 78, " (", "B", ")")` give?', ['`"Ana: 78 (B)"`', '`"Ana : 78 ( B )"`', '`"Ana:78(B)"`', 'An error'], 0,
      '`paste0()` joins with nothing in between.',
      { code: 'paste0("Ana", ": ", 78, " (", "B", ")")', output: '[1] "Ana: 78 (B)"' }),
    mc('Why use `factor(grades, levels = c("A", "B", "C", "F"))` before `table()`?', ['To sort by score', 'So the grades come out in order and F shows even with 0', 'To remove NAs', 'It isn\'t needed'], 1,
      'Every level is counted, even empty ones.'),
    mc('After `f <- function(df) { df$new <- 1; df }`, what does `ncol(f(data.frame(a = 1:2)))` give?', ['`1`', '`2`', '`3`', 'An error'], 1,
      'The returned copy has the new column.',
      { code: 'f <- function(df) { df$new <- 1; df }\nncol(f(data.frame(a = 1:2)))', output: '[1] 2' }),
    qShort('Which function gives back a value early, as in `if (is.na(score)) __(NA)`?', 'return',
      '`return()` ends the function with that value.'),
  ],
})
