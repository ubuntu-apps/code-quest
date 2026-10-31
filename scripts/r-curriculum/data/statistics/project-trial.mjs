// Statistics, medium side quest: The study-method trial.
import { code, makeProject, mc, near, prints, qShort, snippet, task } from '../_builders.mjs'

const TRIAL = 'trial <- data.frame(\n  method = rep(c("flashcards", "rereading"), each = 8),\n  score = c(78, 85, 72, 90, 81, 76, 88, 83, 70, 74, 79, 65, 72, 68, 77, 71)\n)\n'

export default makeProject('medium', {
  id: 'proj_study_trial',
  title: 'The study-method trial',
  paragraphs: [
    'Sixteen volunteers learned the same list of 100 words in another language. Eight used flashcards that tested them, and eight read the list over and over. A week later, everyone took the same test.',
    code(...TRIAL.trim().split('\n')),
    'Was the method worth it? Describe both groups, test the difference, and say how big it probably is. The last challenge shows:',
    code('flashcards 81.6 vs rereading 72, p = 0.004'),
  ],
  sandboxCode: TRIAL + 'tapply(trial$score, trial$method, summary)',
  sandboxSnippets: [snippet('The test', TRIAL + 't.test(score ~ method, data = trial)')],
  challenges: [
    task('easy', 'Group means', {
      prompt: 'Make `means` the mean score of each method, rounded to 1 decimal place.',
      starter: TRIAL,
      hint: '`round(tapply(trial$score, trial$method, mean), 1)`',
      solution: TRIAL + 'means <- round(tapply(trial$score, trial$method, mean), 1)',
      tests: [['means is flashcards 81.6, rereading 72', 'isTRUE(all.equal(as.vector(means), c(81.6, 72))) && identical(names(means), c("flashcards", "rereading"))']],
    }),
    task('easy', 'Group spreads', {
      prompt: 'Make `sds` the standard deviation of each method, rounded to 1 decimal place.',
      starter: TRIAL,
      hint: 'The same with `sd`.',
      solution: TRIAL + 'sds <- round(tapply(trial$score, trial$method, sd), 1)',
      tests: [['sds is flashcards 6.1, rereading 4.6', 'isTRUE(all.equal(as.vector(sds), c(6.1, 4.6)))']],
    }),
    task('medium', 'Test the difference', {
      prompt: 'Make `p` the p-value of a t-test of score by method, rounded to 3 decimal places.',
      starter: TRIAL,
      hint: '`round(t.test(score ~ method, data = trial)$p.value, 3)`',
      solution: TRIAL + 'p <- round(t.test(score ~ method, data = trial)$p.value, 3)',
      tests: [['p is 0.004', near('p', 0.004)]],
    }),
    task('medium', 'How big a gain', {
      prompt: 'Make `gain_ci` the 95% interval for flashcards minus rereading, rounded to 1 decimal place.',
      starter: TRIAL,
      hint: '`round(t.test(score ~ method, data = trial)$conf.int, 1)`',
      solution: TRIAL + 'gain_ci <- round(t.test(score ~ method, data = trial)$conf.int, 1)',
      tests: [['gain_ci is 3.8 to 15.5', 'isTRUE(all.equal(as.vector(gain_ci), c(3.8, 15.5)))']],
    }),
    task('hard', 'Beating the average', {
      prompt: 'Make `beat` the share of flashcard students who scored above the rereading mean.',
      starter: TRIAL,
      hint: 'Pick out each group\'s scores, then `mean(flash > mean(reread))`.',
      solution: TRIAL + 'flash <- trial$score[trial$method == "flashcards"]\nreread <- trial$score[trial$method == "rereading"]\nbeat <- mean(flash > mean(reread))',
      tests: [['beat is 0.875', near('beat', 0.875)]],
    }),
    task('expert', 'The finding', {
      prompt: 'Show the one-line finding, using the test result:\n\n```\nflashcards 81.6 vs rereading 72, p = 0.004\n```',
      starter: TRIAL,
      hint: '`res <- t.test(score ~ method, data = trial)`; `round(unname(res$estimate), 1)` and `round(res$p.value, 3)`, joined with `cat(..., sep = "")`.',
      solution: TRIAL + 'res <- t.test(score ~ method, data = trial)\nm <- round(unname(res$estimate), 1)\ncat("flashcards ", m[1], " vs rereading ", m[2], ", p = ", round(res$p.value, 3), "\\n", sep = "")',
      tests: [['Shows the finding', prints('flashcards 81.6 vs rereading 72, p = 0.004')]],
    }),
  ],
  questions: [
    mc('Why report the spreads as well as the means?', ['They look nice', 'A gap between means means more when each group is tightly packed', 'The test needs them typed in', 'It isn\'t needed'], 1,
      'A t-test weighs the gap against the spread.'),
    mc('p = 0.004. What can you say?', ['Flashcards cause higher scores in everyone', 'Strong evidence the flashcard group scored higher on average', 'No difference', 'Rereading is better'], 1,
      'With volunteers assigned to methods, it is a fair comparison, but still a small one.'),
    mc('The interval for the gain is 3.8 to 15.5 points. What does that say?', ['The gain is 15.5', 'The true average gain is probably between about 4 and 15 points', 'Some students lost points', 'Nothing'], 1,
      'A wide interval: small groups can\'t pin it down tightly.'),
    mc('What would make the interval narrower?', ['Fewer volunteers', 'More volunteers', 'A smaller p-value', 'Rounding'], 1,
      'Bigger samples, smaller standard errors.'),
    mc('Why is it important that volunteers were **split between** methods, not choosing their own?', ['It isn\'t', 'If they chose, keener students might pick flashcards, and the gap could be about them, not the method', 'For equal group sizes', 'R requires it'], 1,
      'Random assignment is what lets a trial talk about causes.'),
    qShort('In t.test(score ~ method, data = trial), what is the ~ part called?', 'formula',
      'A formula: the measurement on the left, the groups on the right.'),
  ],
})
