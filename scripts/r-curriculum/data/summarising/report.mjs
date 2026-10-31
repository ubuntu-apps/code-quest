// Summarising data: A summary report.
import { code, makeTopic, mc, prints, qShort, r, snippet, task, uses } from '../_builders.mjs'
import { CLASS } from '../datasets.mjs'

export default makeTopic({
  id: 'summary_report',
  title: 'A summary report',
  paragraphs: [
    'The point of a summary is to tell someone something. A few well-formatted lines often say more than a printed table. This stage puts the quest together into short reports, using a class\'s test results:',
    code(...CLASS.trim().split('\n')),
    'Three tools do most of the formatting. `round()` keeps numbers readable. `sprintf()` gives exact control: `sprintf("%.1f", x)` always shows one decimal, and `sprintf("%5.1f", x)` lines numbers up in a column 5 wide. `cat()` puts it on the screen, and `sep = ""` stops it adding spaces.',
    code(r`m <- mean(class_results$test1)`, r`cat(sprintf("Test 1: mean %.1f, median %.1f\n", m, median(class_results$test1)))`),
    'For a line per group, compute the summaries first (with `tapply()` or `aggregate()`), then give the whole vectors to `sprintf()`: it makes one line per value. `cat(…, sep = "")` then prints them one under another.',
    code(r`avg <- tapply(class_results$test1, class_results$group, mean)`, r`cat(sprintf("Group %s: %.1f\n", names(avg), avg), sep = "")`),
    'A good report says what was measured, how many values it is based on, and anything surprising, such as missing values or an outlier.',
  ],
  sandboxCode: CLASS + r`avg <- tapply(class_results$test1, class_results$group, mean)
cat(sprintf("Group %s: %.1f\n", names(avg), avg), sep = "")`,
  sandboxSnippets: [snippet('A table with lined-up numbers', CLASS + r`cat(sprintf("%-5s %5.1f\n", class_results$student[1:4], class_results$test1[1:4]), sep = "")`)],
  readMore: { label: 'R documentation: sprintf()', url: 'https://stat.ethz.ch/R-manual/R-devel/library/base/html/sprintf.html', source: 'R documentation' },
  challenges: [
    task('easy', 'One line', {
      prompt: 'Show `Test 1 mean: 71.8`, letting R work out and round the mean.',
      starter: CLASS,
      hint: '`cat("Test 1 mean:", round(mean(class_results$test1), 1), "\\n")`',
      solution: CLASS + 'cat("Test 1 mean:", round(mean(class_results$test1), 1), "\\n")',
      tests: [['Shows Test 1 mean: 71.8', prints('Test 1 mean: 71.8')], ['Works out the mean', uses('mean(')]],
    }),
    task('easy', 'Always one decimal', {
      prompt: 'Show `Test 1 median: 70.5` using `sprintf()` with `%.1f`.',
      starter: CLASS,
      hint: '`cat(sprintf("Test 1 median: %.1f\\n", median(class_results$test1)))`',
      solution: CLASS + 'cat(sprintf("Test 1 median: %.1f\\n", median(class_results$test1)))',
      tests: [['Shows Test 1 median: 70.5', prints('Test 1 median: 70.5')], ['Uses sprintf()', uses('sprintf(')]],
    }),
    task('medium', 'How many took test 2', {
      prompt: 'Show `Test 2: 11 of 12 students` (one was absent).',
      starter: CLASS,
      hint: '`sum(!is.na(class_results$test2))` and `nrow(class_results)`.',
      solution: CLASS + 'cat("Test 2:", sum(!is.na(class_results$test2)), "of", nrow(class_results), "students\\n")',
      tests: [['Shows Test 2: 11 of 12 students', prints('Test 2: 11 of 12 students')]],
    }),
    task('medium', 'A line per group', {
      prompt: 'Show the test 1 mean of each group, one line each:\n\n```\nGroup A: 79.0\nGroup B: 64.7\n```',
      starter: CLASS,
      hint: 'Means with `tapply()`, then `cat(sprintf("Group %s: %.1f\\n", names(avg), avg), sep = "")`.',
      solution: CLASS + 'avg <- tapply(class_results$test1, class_results$group, mean)\ncat(sprintf("Group %s: %.1f\\n", names(avg), avg), sep = "")',
      tests: [['Shows both groups', prints('Group A: 79.0', 'Group B: 64.7')]],
    }),
    task('medium', 'Improvement', {
      prompt: 'Show `Average change: +3.4 points`: the mean of test 2 minus test 1 for each student, leaving out the absent one. Use `%+.1f` to show the sign.',
      starter: CLASS,
      hint: 'Make `change <- class_results$test2 - class_results$test1`, then `sprintf("Average change: %+.1f points\\n", mean(change, na.rm = TRUE))`.',
      solution: CLASS + 'change <- class_results$test2 - class_results$test1\ncat(sprintf("Average change: %+.1f points\\n", mean(change, na.rm = TRUE)))',
      tests: [['Shows Average change: +3.4 points', prints('Average change: +3.4 points')]],
    }),
    task('hard', 'The top three', {
      prompt: 'Show the three best test 1 scores with names, best first:\n\n```\n1. Lea 95\n2. Eli 91\n3. Cy 88\n```',
      starter: CLASS,
      hint: 'Sort the rows by `-test1`, keep the first 3, then `cat(sprintf("%d. %s %d\\n", 1:3, …), sep = "")`. Scores are numbers, so use `%.0f` or `as.integer()` with `%d`.',
      solution: CLASS + 'top <- head(class_results[order(-class_results$test1), ], 3)\ncat(sprintf("%d. %s %.0f\\n", 1:3, top$student, top$test1), sep = "")',
      tests: [['Shows the top three', prints('1. Lea 95', '2. Eli 91', '3. Cy 88')]],
    }),
    task('hard', 'Pass rate', {
      prompt: 'A pass is 60 or more. Show `Pass rate on test 1: 75%`.',
      starter: CLASS,
      hint: '`round(mean(class_results$test1 >= 60) * 100)`, and `sep = ""` to keep the % next to the number.',
      solution: CLASS + 'cat("Pass rate on test 1: ", round(mean(class_results$test1 >= 60) * 100), "%\\n", sep = "")',
      tests: [['Shows Pass rate on test 1: 75%', prints('Pass rate on test 1: 75%')]],
    }),
    task('expert', 'The class report', {
      prompt: 'Show this report, letting R work out every number:\n\n```\nStudents: 12\nTest 1: mean 71.8, median 70.5\nTest 2: mean 77.5 (1 absent)\nBest: Lea (95, 97)\n```\n\nThe best student has the highest test 1 score.',
      starter: CLASS,
      hint: 'Use `sprintf()` with `%.1f` for the means and median, `sum(is.na())` for the absences, and `which.max()` for the best student\'s row.',
      solution: CLASS + r`t1 <- class_results$test1
t2 <- class_results$test2
best <- class_results[which.max(t1), ]
cat("Students:", nrow(class_results), "\n")
cat(sprintf("Test 1: mean %.1f, median %.1f\n", mean(t1), median(t1)))
cat(sprintf("Test 2: mean %.1f (%d absent)\n", mean(t2, na.rm = TRUE), sum(is.na(t2))))
cat(sprintf("Best: %s (%.0f, %.0f)\n", best$student, best$test1, best$test2))`,
      tests: [['Shows the report', prints('Students: 12', 'Test 1: mean 71.8, median 70.5', 'Test 2: mean 77.5 (1 absent)', 'Best: Lea (95, 97)')]],
    }),
  ],
  questions: [
    mc('What does `sprintf("%.1f", 79)` give?', ['`"79"`', '`"79.0"`', '`79.0`', '`"79.00"`'], 1,
      '`%.1f` always shows one decimal, as text.',
      { code: 'sprintf("%.1f", 79)', output: '[1] "79.0"' }),
    mc('What does `sprintf("%+.1f", 5.42)` give?', ['`"5.4"`', '`"+5.4"`', '`"+5.42"`', '`"5.42"`'], 1,
      'The `+` flag shows the sign, even for positive numbers.',
      { code: 'sprintf("%+.1f", 5.42)', output: '[1] "+5.4"' }),
    mc('What does `sprintf("Group %s", c("A", "B"))` give?', ['`"Group A B"`', '`[1] "Group A" "Group B"`', '`"Group %s"`', 'An error'], 1,
      '`sprintf()` makes one text per value.',
      { code: 'sprintf("Group %s", c("A", "B"))', output: '[1] "Group A" "Group B"' }),
    mc('What does `cat("A", "B", sep = "")` show?', ['`A B`', '`AB`', '`"AB"`', '`A\\nB`'], 1,
      '`sep = ""` puts nothing between the pieces.',
      { code: 'cat("A", "B", sep = "")', output: 'AB' }),
    mc('What does `sprintf("%d", 95)` give?', ['`"95"`', 'An error', '`"95.0"`', '`95`'], 0,
      'A number with no decimal part is accepted by `%d`.',
      { code: 'sprintf("%d", 95)', output: '[1] "95"' }),
    mc('What does `sprintf("%5.1f", 3.14159)` give?', ['`"3.1"`', '`"  3.1"`', '`"3.14159"`', '`"00003.1"`'], 1,
      '5 characters wide, so it is padded with spaces: handy for lining up columns.',
      { code: 'sprintf("%5.1f", 3.14159)', output: '[1] "  3.1"' }),
    mc('Why give the number of values in a report?', ['It looks longer', 'An average of 3 values means much less than one of 300', 'R needs it', 'To round better'], 1,
      'Readers need to know how much data a summary rests on.'),
    mc('What does `cat(sprintf("%s\\n", c("x", "y")), sep = "")` show?', ['`x y`', 'x and y on separate lines', '`"x" "y"`', '`xy`'], 1,
      'Each text ends with a new line, and `sep = ""` adds no spaces before them.',
      { code: r`cat(sprintf("%s\n", c("x", "y")), sep = "")`, output: 'x\ny' }),
    qShort('Which `sprintf()` placeholder shows a number with exactly 2 decimals?', '%.2f',
      '`%.2f`: f for a decimal number, .2 for two places.'),
  ],
})
