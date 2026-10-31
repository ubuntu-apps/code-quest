// Summarising data, easy side quest: Class results.
import { code, isText, makeProject, mc, near, prints, qShort, r, snippet, task } from '../_builders.mjs'
import { CLASS } from '../datasets.mjs'

export default makeProject('easy', {
  id: 'proj_class_results',
  title: 'Class results',
  paragraphs: [
    'A teacher wants a quick summary of two tests for a class of twelve, split into groups A and B. One student missed test 2.',
    code(...CLASS.trim().split('\n')),
    'The last challenge shows:',
    code('Test 1: mean 71.8, sd 15.2', 'Test 2: mean 77.5, sd 12.5', 'Group A did better on test 1 by 14.3 points'),
  ],
  sandboxCode: CLASS + 'summary(class_results$test1)\nsummary(class_results$test2)',
  sandboxSnippets: [snippet('By group', CLASS + 'tapply(class_results$test1, class_results$group, mean)')],
  challenges: [
    task('easy', 'Test 1 summary', {
      prompt: 'Make `t1_mean` the mean of test 1 and `t1_sd` its standard deviation, both rounded to 1 decimal place.',
      starter: CLASS,
      hint: '`round(mean(class_results$test1), 1)` and `round(sd(class_results$test1), 1)`.',
      solution: CLASS + 't1_mean <- round(mean(class_results$test1), 1)\nt1_sd <- round(sd(class_results$test1), 1)',
      tests: [['t1_mean is 71.8', near('t1_mean', 71.8)], ['t1_sd is right', near('t1_sd', 'round(sd(class_results$test1), 1)')]],
    }),
    task('easy', 'Test 2, with a gap', {
      prompt: 'Make `t2_mean` the mean of test 2, leaving out the absent student, rounded to 1 decimal place.',
      starter: CLASS,
      hint: '`round(mean(class_results$test2, na.rm = TRUE), 1)`',
      solution: CLASS + 't2_mean <- round(mean(class_results$test2, na.rm = TRUE), 1)',
      tests: [['t2_mean is 77.5', near('t2_mean', 77.5)]],
    }),
    task('medium', 'Groups compared', {
      prompt: 'Make `by_group` the mean test 1 score of each group.',
      starter: CLASS,
      hint: '`tapply(class_results$test1, class_results$group, mean)`',
      solution: CLASS + 'by_group <- tapply(class_results$test1, class_results$group, mean)',
      tests: [['by_group is A 79, B 64.67', 'isTRUE(all.equal(as.vector(by_group), c(79, 194 / 3)))']],
    }),
    task('medium', 'Who missed test 2', {
      prompt: 'Make `absent` the name of the student with no test 2 score.',
      starter: CLASS,
      hint: '`class_results$student[is.na(class_results$test2)]`',
      solution: CLASS + 'absent <- class_results$student[is.na(class_results$test2)]',
      tests: [['absent is "Fay"', isText('absent', 'Fay')]],
    }),
    task('hard', 'Most improved', {
      prompt: 'Make `most_improved` the student whose score went up the most from test 1 to test 2.',
      starter: CLASS,
      hint: 'Make `change <- class_results$test2 - class_results$test1`, then use `which.max()` (it skips the NA).',
      solution: CLASS + 'change <- class_results$test2 - class_results$test1\nmost_improved <- class_results$student[which.max(change)]',
      tests: [['most_improved is "Dee"', isText('most_improved', 'Dee')]],
    }),
    task('expert', 'The class summary', {
      prompt: 'Show:\n\n```\nTest 1: mean 71.8, sd 15.2\nTest 2: mean 77.5, sd 12.5\nGroup A did better on test 1 by 14.3 points\n```\n\nWork out which group did better and by how much.',
      starter: CLASS,
      hint: '`sprintf()` with `%.1f` for each number. For the last line, `tapply()` the group means and use `names(which.max())` and `max() - min()`.',
      solution: CLASS + r`t1 <- class_results$test1
t2 <- class_results$test2
g <- tapply(t1, class_results$group, mean)
cat(sprintf("Test 1: mean %.1f, sd %.1f\n", mean(t1), sd(t1)))
cat(sprintf("Test 2: mean %.1f, sd %.1f\n", mean(t2, na.rm = TRUE), sd(t2, na.rm = TRUE)))
cat(sprintf("Group %s did better on test 1 by %.1f points\n", names(which.max(g)), max(g) - min(g)))`,
      tests: [['Shows the summary', 'identical(trimws(strsplit(._cq_stdout, "\\n", fixed = TRUE)[[1]]), c(sprintf("Test 1: mean %.1f, sd %.1f", mean(class_results$test1), sd(class_results$test1)), sprintf("Test 2: mean %.1f, sd %.1f", mean(class_results$test2, na.rm = TRUE), sd(class_results$test2, na.rm = TRUE)), "Group A did better on test 1 by 14.3 points"))']],
    }),
  ],
  questions: [
    mc('What does `mean(c(70, NA, 80), na.rm = TRUE)` give?', ['`NA`', '`75`', '`50`', '`150`'], 1,
      'The mean of the two known scores.',
      { code: 'mean(c(70, NA, 80), na.rm = TRUE)', output: '[1] 75' }),
    mc('What does `c(78, NA) - c(72, 47)` give?', ['`[1]  6 NA`', '`[1] 6 47`', '`[1] 6`', 'An error'], 0,
      'Maths with NA gives NA for that student.',
      { code: 'c(78, NA) - c(72, 47)', output: '[1]  6 NA' }),
    mc('What does `which.max(c(6, NA, 9))` give?', ['`NA`', '`3`', '`9`', '`2`'], 1,
      '`which.max()` skips missing values.',
      { code: 'which.max(c(6, NA, 9))', output: '[1] 3' }),
    mc('Group means are A 79.0 and B 64.7. What does `max(g) - min(g)` give?', ['`14.3`', '`143.7`', '`64.7`', '`79`'], 0,
      'The difference between the groups.',
      { code: 'g <- c(A = 79, B = 64.7)\nmax(g) - min(g)', output: '[1] 14.3' }),
    mc('Test 1 has sd 15, test 2 sd 12. What does that tell you?', ['Test 2 was easier', 'Test 2 scores were less spread out', 'Test 1 had more students', 'Nothing'], 1,
      'A smaller sd means scores were closer together.'),
    qShort('Which argument makes `mean()` leave out missing values? (write it as `name = TRUE`)', 'na.rm = TRUE',
      '`mean(x, na.rm = TRUE)`'),
  ],
})
