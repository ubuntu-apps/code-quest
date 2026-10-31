// Statistics, easy side quest: Coin flips.
import { code, makeProject, mc, near, qShort, snippet, task } from '../_builders.mjs'

export default makeProject('easy', {
  id: 'proj_coin_flips',
  title: 'Coin flips',
  paragraphs: [
    'At the school fair, a stall uses a coin to decide who wins. One student flipped it 100 times and got 61 heads. Is the coin unfair, or is that within normal luck?',
    'You will find out two ways: by simulating a fair coin many times in R, and with a proper test. Both should tell the same story.',
    code('flips <- sample(c("H", "T"), 100, replace = TRUE)    # 100 flips of a fair coin', 'sum(flips == "H")'),
  ],
  sandboxCode: 'set.seed(10)\nflips <- sample(c("H", "T"), 100, replace = TRUE)\ntable(flips)',
  sandboxSnippets: [snippet('Many experiments', 'set.seed(10)\ncounts <- replicate(1000, sum(sample(c("H", "T"), 100, replace = TRUE) == "H"))\nrange(counts)')],
  challenges: [
    task('easy', 'A hundred flips', {
      prompt: 'Set the seed to 10 and make `flips` 100 flips of a fair coin, as `"H"` and `"T"`.',
      hint: '`sample(c("H", "T"), 100, replace = TRUE)`',
      solution: 'set.seed(10)\nflips <- sample(c("H", "T"), 100, replace = TRUE)',
      tests: [['flips matches seed 10', 'identical(flips, local({ set.seed(10); sample(c("H", "T"), 100, replace = TRUE) }))']],
    }),
    task('easy', 'Count the heads', {
      prompt: 'Make `heads` the number of heads, and `share` the share of heads.',
      starter: 'set.seed(10)\nflips <- sample(c("H", "T"), 100, replace = TRUE)\n',
      hint: '`sum(flips == "H")` and `mean(flips == "H")`.',
      solution: 'set.seed(10)\nflips <- sample(c("H", "T"), 100, replace = TRUE)\nheads <- sum(flips == "H")\nshare <- mean(flips == "H")',
      tests: [['heads is the count', near('heads', 'sum(flips == "H")')], ['share is heads / 100', near('share', 'sum(flips == "H") / 100')]],
    }),
    task('medium', 'A thousand experiments', {
      prompt: 'Set the seed to 10 and make `counts` the number of heads in each of 1000 experiments of 100 flips.',
      hint: '`replicate(1000, sum(sample(c("H", "T"), 100, replace = TRUE) == "H"))`',
      solution: 'set.seed(10)\ncounts <- replicate(1000, sum(sample(c("H", "T"), 100, replace = TRUE) == "H"))',
      tests: [['counts matches seed 10', near('counts', 'local({ set.seed(10); replicate(1000, sum(sample(c("H", "T"), 100, replace = TRUE) == "H")) })')]],
    }),
    task('medium', 'How unusual is 61', {
      prompt: 'Make `as_extreme` the share of experiments with 61 or more heads, **or** 39 or fewer (just as far from 50 the other way).',
      starter: 'set.seed(10)\ncounts <- replicate(1000, sum(sample(c("H", "T"), 100, replace = TRUE) == "H"))\n',
      hint: '`mean(counts >= 61 | counts <= 39)`',
      solution: 'set.seed(10)\ncounts <- replicate(1000, sum(sample(c("H", "T"), 100, replace = TRUE) == "H"))\nas_extreme <- mean(counts >= 61 | counts <= 39)',
      tests: [['as_extreme is the share', near('as_extreme', 'mean(counts >= 61 | counts <= 39)')], ['It is small, about 0.035', 'as_extreme < 0.07']],
    }),
    task('hard', 'The proper test', {
      prompt: '`binom.test(x, n)` tests whether x successes in n tries fit a 50% chance. Make `p` the p-value for 61 heads in 100, rounded to 3 decimal places.',
      hint: '`round(binom.test(61, 100)$p.value, 3)`',
      solution: 'p <- round(binom.test(61, 100)$p.value, 3)',
      tests: [['p is 0.035', near('p', 0.035)]],
    }),
    task('expert', 'Where is the true chance', {
      prompt: 'Make `ci` the 95% confidence interval for the coin\'s true chance of heads, from `binom.test()`, rounded to 2 decimal places. Is 0.5 inside?',
      hint: '`round(binom.test(61, 100)$conf.int, 2)`',
      solution: 'ci <- round(binom.test(61, 100)$conf.int, 2)',
      tests: [['ci is 0.51 to 0.71', 'isTRUE(all.equal(as.vector(ci), c(0.51, 0.71)))']],
    }),
  ],
  questions: [
    mc('In 100 flips of a fair coin, how many heads do you expect?', ['Exactly 50', 'About 50, give or take a few', '61', '100'], 1,
      'Luck moves the count around 50 every time.'),
    mc('What does `mean(c("H", "T", "H", "H") == "H")` give?', ['`3`', '`0.75`', '`0.25`', '`"H"`'], 1,
      'The mean of TRUE/FALSE is the share TRUE.',
      { code: 'mean(c("H", "T", "H", "H") == "H")', output: '[1] 0.75' }),
    mc('The simulation found about 3.5% of fair-coin experiments as extreme as 61 heads. That is…', ['The chance the coin is fair', 'A simulated p-value', 'The share of heads', 'An error'], 1,
      'It matches what `binom.test()` works out exactly.'),
    mc('p = 0.035 for 61 heads. What can you say?', ['The coin is certainly unfair', 'Some evidence the coin favours heads; worth more flips before accusing anyone', 'The coin is fair', 'Nothing'], 1,
      'Evidence, not proof. More data would make it clearer.'),
    mc('The interval for the chance of heads is 0.51 to 0.71. What does it say about 0.5?', ['0.5 is inside', '0.5 is just outside, so a fair coin is not a good fit', '0.5 is the estimate', 'Nothing'], 1,
      'It agrees with the p-value being under 0.05.'),
    qShort('Which function tests a count of successes against a chance, like heads in coin flips?', 'binom.test',
      '`binom.test(61, 100)`'),
  ],
})
