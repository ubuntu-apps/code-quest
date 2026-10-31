// Capstone: The wellbeing survey.
import { code, makeTopic, mc, near, prints, qShort, sameFrame, snippet, task } from '../_builders.mjs'

const RAW = 'raw <- "id,year,breakfast,sleep,mood\n1,Y7,Yes,9h,4\n2,y7,yes,8.5,4\n3,Year 7,No,7.5 h,3\n4,7,Y,9,5\n5,Y7,yes,10h,4\n6,Y7,N,8,3\n7,Y7,,8.5h,0\n8,y7,Yes,9.5,5\n9,Y8,no,7,2\n10,Y8,Yes,8h,4\n11,Year 8,yes,7.5,3\n12,8,No,6.5h,2\n13,Y8,yes,,4\n14,Y8,N,7,3\n15,y8,Yes,8,4\n16,Y8,no,6h,2\n17,Y9,No,6.5,2\n18,Y9,yes,7h,3\n19,year 9,no,6,1\n20,9,Yes,7.5,4\n21,Y9,N,5.5h,2\n22,Y9,yes,8,3\n23,y9,no,6.5,0\n24,Y9,Y,7,3"\n'
const READ = 'survey <- read.csv(text = raw, na.strings = "")\n'
const YEAR = 'survey$year <- paste0("Y", gsub("[^0-9]", "", survey$year))\n'
const BREAKFAST = 'survey$breakfast <- unname(c(yes = TRUE, y = TRUE, no = FALSE, n = FALSE)[tolower(survey$breakfast)])\n'
const SLEEP = 'survey$sleep <- as.numeric(trimws(gsub("h", "", survey$sleep)))\n'
const MOOD = 'survey$mood[survey$mood == 0] <- NA\n'
const READY = RAW + READ + YEAR + BREAKFAST + SLEEP + MOOD

export default makeTopic({
  id: 'capstone_survey',
  title: 'The wellbeing survey',
  paragraphs: [
    'A school asked 24 students in Years 7 to 9 three questions: did you have breakfast today, how many hours did you sleep last night, and how is your mood, from 1 (low) to 5 (great). A 0 means the student skipped the mood question. The form was a free-text sheet, and it shows:',
    code(...RAW.trim().split('\n')),
    'The year is written four ways, breakfast six ways, and sleep with and without an "h". The head of year wants percentages by year, a look at how sleep and mood go together, and a short report she can read out at a staff meeting.',
    'Be careful with the conclusions: this is one morning, 24 students, and whoever chose to answer. A survey shows what goes together, not what causes what.',
  ],
  sandboxCode: RAW + READ + 'str(survey)\ntable(survey$year)\ntable(survey$breakfast)',
  sandboxSnippets: [snippet('The cleaned table', READY + 'head(survey)')],
  challenges: [
    task('easy', 'Read the answers', {
      prompt: 'Make `survey` the sheet read from `raw`, with empty answers as NA.',
      hint: '`read.csv(text = raw, na.strings = "")`',
      starter: RAW,
      solution: RAW + READ,
      tests: [['survey has 24 rows', 'is.data.frame(survey) && nrow(survey) == 24'], ['One breakfast and one sleep answer are NA', 'sum(is.na(survey$breakfast)) == 1 && sum(is.na(survey$sleep)) == 1']],
    }),
    task('easy', 'One way to write the year', {
      prompt: 'Make every year `"Y7"`, `"Y8"` or `"Y9"`.',
      starter: RAW + READ,
      hint: 'Keep only the digit, then add a Y: `paste0("Y", gsub("[^0-9]", "", survey$year))`.',
      solution: RAW + READ + YEAR,
      tests: [['year is Y7, Y8 or Y9, 8 of each', 'identical(as.vector(table(survey$year)), c(8L, 8L, 8L)) && identical(sort(unique(survey$year)), c("Y7", "Y8", "Y9"))']],
    }),
    task('easy', 'Breakfast as TRUE or FALSE', {
      prompt: 'Make `breakfast` TRUE for yes/y, FALSE for no/n, whatever the case, and NA for no answer.',
      starter: RAW + READ + YEAR,
      hint: 'A lookup: `unname(c(yes = TRUE, y = TRUE, no = FALSE, n = FALSE)[tolower(survey$breakfast)])`.',
      solution: RAW + READ + YEAR + BREAKFAST,
      tests: [['breakfast is logical: 13 TRUE, 10 FALSE, 1 NA', 'is.logical(survey$breakfast) && sum(survey$breakfast, na.rm = TRUE) == 13 && sum(!survey$breakfast, na.rm = TRUE) == 10 && sum(is.na(survey$breakfast)) == 1']],
    }),
    task('medium', 'Hours of sleep', {
      prompt: 'Make `sleep` a number of hours, without the "h".',
      starter: RAW + READ + YEAR + BREAKFAST,
      hint: '`as.numeric(trimws(gsub("h", "", survey$sleep)))`',
      solution: RAW + READ + YEAR + BREAKFAST + SLEEP,
      tests: [['sleep is numeric, mean 7.57 without the NA', 'is.numeric(survey$sleep) && isTRUE(all.equal(round(mean(survey$sleep, na.rm = TRUE), 2), 7.57))']],
    }),
    task('medium', 'Skipped moods', {
      prompt: 'A mood of 0 means the question was skipped. Make those NA, then `avg_mood` the mean mood, rounded to 2 decimal places.',
      starter: RAW + READ + YEAR + BREAKFAST + SLEEP,
      hint: '`survey$mood[survey$mood == 0] <- NA`, then `mean(…, na.rm = TRUE)`.',
      solution: RAW + READ + YEAR + BREAKFAST + SLEEP + MOOD + 'avg_mood <- round(mean(survey$mood, na.rm = TRUE), 2)',
      tests: [['mood has 2 NAs', 'sum(is.na(survey$mood)) == 2'], ['avg_mood is 3.18', near('avg_mood', 3.18)]],
    }),
    task('medium', 'Breakfast by year', {
      prompt: 'Make `bf_pct` the percentage of each year who had breakfast, out of those who answered, rounded to whole numbers.',
      starter: READY,
      hint: 'The mean of TRUE/FALSE is the share TRUE: `round(100 * tapply(survey$breakfast, survey$year, mean, na.rm = TRUE))`.',
      solution: READY + 'bf_pct <- round(100 * tapply(survey$breakfast, survey$year, mean, na.rm = TRUE))',
      tests: [['bf_pct is Y7 71, Y8 50, Y9 50', 'isTRUE(all.equal(as.vector(bf_pct), c(71, 50, 50))) && identical(names(bf_pct), c("Y7", "Y8", "Y9"))']],
    }),
    task('hard', 'A table per year', {
      prompt: 'Make `by_year` a data frame with one row per year and the columns `year`, `n`, `sleep` and `mood`: the number of students and the mean sleep and mood (leaving out NAs), rounded to 2 decimal places.',
      starter: READY,
      hint: 'Split `survey` by year, make a one-row data frame from each part with `lapply()`, then `do.call(rbind, …)`.',
      solution: READY + 'parts <- split(survey, survey$year)\nrows <- lapply(names(parts), function(y) {\n  d <- parts[[y]]\n  data.frame(year = y, n = nrow(d), sleep = round(mean(d$sleep, na.rm = TRUE), 2), mood = round(mean(d$mood, na.rm = TRUE), 2))\n})\nby_year <- do.call(rbind, rows)',
      tests: [['by_year is Y7 8 8.75 4, Y8 8 7.14 3, Y9 8 6.75 2.57', sameFrame('by_year', 'data.frame(year = c("Y7", "Y8", "Y9"), n = c(8, 8, 8), sleep = c(8.75, 7.14, 6.75), mood = c(4, 3, 2.57))')]],
    }),
    task('hard', 'Sleep and mood', {
      prompt: 'Make `r` the correlation between sleep and mood, using only the students who answered both, rounded to 2 decimal places.',
      starter: READY,
      hint: '`cor(survey$sleep, survey$mood, use = "complete.obs")`',
      solution: READY + 'r <- round(cor(survey$sleep, survey$mood, use = "complete.obs"), 2)',
      tests: [['r is 0.86', near('r', 0.86)]],
    }),
    task('expert', 'Breakfast and mood', {
      prompt: 'Make `gap` the mean mood of those who had breakfast minus those who didn\'t (leaving out NAs), rounded to 2 decimal places, and `strong` TRUE if a t-test of mood by breakfast gives p below 0.001.',
      starter: READY,
      hint: '`m <- tapply(survey$mood, survey$breakfast, mean, na.rm = TRUE)` (FALSE first), then `t.test(mood ~ breakfast, data = survey)$p.value`.',
      solution: READY + 'm <- tapply(survey$mood, survey$breakfast, mean, na.rm = TRUE)\ngap <- round(unname(m["TRUE"] - m["FALSE"]), 2)\nstrong <- t.test(mood ~ breakfast, data = survey)$p.value < 0.001',
      tests: [['gap is 1.62', near('gap', 1.62)], ['strong is TRUE', 'identical(strong, TRUE)']],
    }),
    task('expert', 'For the staff meeting', {
      prompt: 'Show this report:\n\n```\nResponses: 24\nBreakfast: 57% of those who answered\nUnder 7 hours of sleep: 6 students\nSleep and mood: r = 0.86\n```',
      starter: READY,
      hint: '`mean(survey$breakfast, na.rm = TRUE)` for the share; `sum(survey$sleep < 7, na.rm = TRUE)` for short sleepers. `sprintf("%d%%", …)` shows a percent sign.',
      solution: READY + 'bf <- round(100 * mean(survey$breakfast, na.rm = TRUE))\nshort <- sum(survey$sleep < 7, na.rm = TRUE)\nr <- round(cor(survey$sleep, survey$mood, use = "complete.obs"), 2)\ncat(sprintf("Responses: %d", nrow(survey)),\n    sprintf("Breakfast: %d%% of those who answered", bf),\n    sprintf("Under 7 hours of sleep: %d students", short),\n    sprintf("Sleep and mood: r = %.2f", r),\n    sep = "\\n")\ncat("\\n")',
      tests: [['Shows the report', prints('Responses: 24', 'Breakfast: 57% of those who answered', 'Under 7 hours of sleep: 6 students', 'Sleep and mood: r = 0.86')]],
    }),
  ],
  questions: [
    mc('What does `gsub("[^0-9]", "", "Year 7")` give?', ['`"7"`', '`"Year"`', '`"Year 7"`', '`""`'], 0,
      '`[^0-9]` matches anything that isn\'t a digit, and each match is removed.',
      { code: 'gsub("[^0-9]", "", "Year 7")', output: '[1] "7"' }),
    mc('Why turn a mood of 0 into NA?', ['0 is too low', 'It means "skipped", so counting it as a mood would drag the mean down', 'R can\'t average 0', 'To save space'], 1,
      'A code for "no answer" is a missing value in disguise.'),
    mc('Why give breakfast percentages "of those who answered"?', ['It sounds better', 'One student left it blank, so the base is 23, not 24', 'It is always 100%', 'R rounds it'], 1,
      'Say what the percentage is out of.'),
    mc('What does `mean(c(TRUE, FALSE, NA), na.rm = TRUE)` give?', ['`0.5`', '`NA`', '`0.33`', '`1`'], 0,
      'One TRUE out of two answers.',
      { code: 'mean(c(TRUE, FALSE, NA), na.rm = TRUE)', output: '[1] 0.5' }),
    mc('What does `use = "complete.obs"` do in `cor()`?', ['Uses every value', 'Leaves out students missing either value', 'Fills NAs with the mean', 'Rounds the result'], 1,
      'Without it, any NA makes the correlation NA.',
      { code: 'cor(c(1, 2, NA, 4), c(2, 4, 6, 8), use = "complete.obs")', output: '[1] 1' }),
    mc('Sleep and mood have r = 0.86. Which conclusion is fair?', ['More sleep causes better moods', 'Students who slept more tended to report better moods on this morning', 'There is no link', 'Every student over 8 hours is happy'], 1,
      'A link, from one survey; tiredness, worries or something else could sit behind both.'),
    mc('Breakfast eaters\' mood is 1.62 higher, with p < 0.001. What should the report say?', ['Breakfast makes students happy', 'A clear difference in this survey, which is worth looking into, not proof of a cause', 'Nothing', 'Skip breakfast'], 1,
      'Students who skip breakfast may differ in other ways, such as sleep.'),
    mc('Year 9 sleeps least and has the lowest mood. Why can\'t you separate "Year 9" from "sleep" here?', ['You can', 'They go together in this data, so either could be behind the mood difference', 'Year 9 is too small', 'The test is wrong'], 1,
      'When two explanations move together, one survey can\'t tell them apart.'),
    qShort('In `cor(x, y, use = __)`, which value leaves out the pairs with a missing value?', 'complete.obs',
      '`cor(x, y, use = "complete.obs")`'),
  ],
})
