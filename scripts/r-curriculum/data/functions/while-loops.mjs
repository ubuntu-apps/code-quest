// Functions and control flow: while loops.
import { code, makeTopic, mc, near, prints, qShort, r, snippet, task, uses } from '../_builders.mjs'

export default makeTopic({
  id: 'while_loops',
  title: 'while loops',
  paragraphs: [
    'A `for` loop runs a known number of times. A `while` loop keeps going **as long as** a condition is TRUE, which suits questions like "how many weeks until I have saved 500?":',
    code('saved <- 0', 'weeks <- 0', 'while (saved < 500) {', '  saved <- saved + 45', '  weeks <- weeks + 1', '}', 'weeks    # 12'),
    'Each time round, R checks the condition first. When it becomes FALSE, the loop stops and the code after it runs.',
    'Something inside the loop **must** change the condition, or it runs forever. If your code seems stuck, that\'s usually why: reload the page to stop it.',
    'Two keywords control any loop. `break` stops the loop straight away. `next` skips the rest of this time round and goes on to the next:',
    code('for (t in c(22, NA, 27, 31)) {', '  if (is.na(t)) next          # skip missing readings', '  if (t > 30) break           # stop at the first very hot one', r`  cat(t, "\n")`, '}'),
  ],
  sandboxCode: 'saved <- 0\nweeks <- 0\nwhile (saved < 500) {\n  saved <- saved + 45\n  weeks <- weeks + 1\n}\nweeks\nsaved',
  sandboxSnippets: [snippet('next and break', 'for (t in c(22, NA, 27, 31, 24)) {\n  if (is.na(t)) next\n  if (t > 30) break\n  cat(t, "\\n")\n}')],
  readMore: { label: 'R documentation: Control flow', url: 'https://stat.ethz.ch/R-manual/R-devel/library/base/html/Control.html', source: 'R documentation' },
  challenges: [
    task('easy', 'Weeks to save', {
      prompt: 'Saving 45 a week from 0, how many weeks until the savings reach at least 500? Make `weeks` the answer, with a `while` loop.',
      starter: 'saved <- 0\nweeks <- 0\n',
      hint: 'While `saved < 500`: add 45 to `saved` and 1 to `weeks`.',
      solution: 'saved <- 0\nweeks <- 0\nwhile (saved < 500) {\n  saved <- saved + 45\n  weeks <- weeks + 1\n}',
      tests: [['weeks is 12', near('weeks', 12)], ['Uses while', uses('while')]],
    }),
    task('easy', 'Halving', {
      prompt: 'Start with `n <- 100` and keep halving it while it is more than 1. Make `steps` the number of halvings.',
      starter: 'n <- 100\nsteps <- 0\n',
      hint: 'While `n > 1`: `n <- n / 2` and `steps <- steps + 1`.',
      solution: 'n <- 100\nsteps <- 0\nwhile (n > 1) {\n  n <- n / 2\n  steps <- steps + 1\n}',
      tests: [['steps is 7', near('steps', 7)]],
    }),
    task('medium', 'Doubling plants', {
      prompt: 'A mint plant spreads, doubling its area every month, starting at 0.1 m². Make `months` the number of months until it covers at least 5 m².',
      starter: 'area <- 0.1\nmonths <- 0\n',
      hint: 'While `area < 5`: double `area` and add 1 to `months`.',
      solution: 'area <- 0.1\nmonths <- 0\nwhile (area < 5) {\n  area <- area * 2\n  months <- months + 1\n}',
      tests: [['months is 6', near('months', 6)]],
    }),
    task('medium', 'Skip the gaps', {
      prompt: 'Make `total` the total of the readings, skipping NAs with `next` in a `for` loop.',
      starter: 'readings <- c(2.4, NA, 5.1, NA, 1.2)\ntotal <- 0\n',
      hint: 'In the loop: `if (is.na(r)) next`, then `total <- total + r`.',
      solution: 'readings <- c(2.4, NA, 5.1, NA, 1.2)\ntotal <- 0\nfor (r in readings) {\n  if (is.na(r)) next\n  total <- total + r\n}',
      tests: [['total is 8.7', near('total', 8.7)], ['Uses next', uses('next')]],
    }),
    task('medium', 'Stop at the first', {
      prompt: 'Make `first_late` the first delivery time over 30 minutes, stopping the loop with `break` when you find it.',
      starter: 'minutes <- c(24, 19, 35, 27, 41)\nfirst_late <- NA\n',
      hint: 'In the loop: `if (m > 30) { first_late <- m; break }`.',
      solution: 'minutes <- c(24, 19, 35, 27, 41)\nfirst_late <- NA\nfor (m in minutes) {\n  if (m > 30) {\n    first_late <- m\n    break\n  }\n}',
      tests: [['first_late is 35', near('first_late', 35)], ['Uses break', uses('break')]],
    }),
    task('medium', 'Fix the counting', {
      prompt: 'This loop should show 1, 2 and 3, one per line, but it shows 2, 3 and 4. Fix the order of the two lines inside the loop.',
      starter: r`count <- 1
while (count <= 3) {
  count <- count + 1
  cat(count, "\n")
}`,
      hint: 'Show `count` first, then add 1 to it.',
      solution: r`count <- 1
while (count <= 3) {
  cat(count, "\n")
  count <- count + 1
}`,
      tests: [['Shows 1, 2, 3', prints('1', '2', '3')]],
    }),
    task('hard', 'Roll until six', {
      prompt: 'With `set.seed(7)` already set, roll a die with `sample(1:6, 1)` until it shows a 6. Make `rolls` the number of rolls it took.',
      starter: 'set.seed(7)\nrolls <- 0\nroll <- 0\n',
      hint: 'While `roll != 6`: roll again and add 1 to `rolls`.',
      solution: 'set.seed(7)\nrolls <- 0\nroll <- 0\nwhile (roll != 6) {\n  roll <- sample(1:6, 1)\n  rolls <- rolls + 1\n}',
      tests: [['rolls is right for seed 7', 'local({ set.seed(7); n <- 0; x <- 0; while (x != 6) { x <- sample(1:6, 1); n <- n + 1 }; isTRUE(all.equal(rolls, n)) })']],
    }),
    task('expert', 'Paying off a loan', {
      prompt: 'A loan of 1000 grows by 1% each month, then a payment of 120 is made. Make `months` the number of payments until the balance is 0 or less.',
      starter: 'balance <- 1000\nmonths <- 0\n',
      hint: 'While `balance > 0`: `balance <- balance * 1.01 - 120` and add 1 to `months`.',
      solution: 'balance <- 1000\nmonths <- 0\nwhile (balance > 0) {\n  balance <- balance * 1.01 - 120\n  months <- months + 1\n}',
      tests: [['months is 9', near('months', 9)]],
    }),
  ],
  questions: [
    mc('When does a `while` loop stop?', ['After 10 rounds', 'When its condition becomes FALSE', 'When it reaches the end of a vector', 'Never'], 1,
      'The condition is checked before each time round.'),
    mc('After `n <- 1; while (n < 20) n <- n * 3`, what is `n`?', ['`20`', '`27`', '`9`', '`3`'], 1,
      '1, 3, 9, 27: 27 is the first value that isn\'t under 20.',
      { code: 'n <- 1\nwhile (n < 20) n <- n * 3\nn', output: '[1] 27' }),
    mc('What happens with `x <- 1; while (x > 0) { cat(x) }`?', ['It prints 1 once', 'It runs forever: x never changes', 'An error', 'Nothing'], 1,
      'Something in the loop must make the condition FALSE.'),
    mc('What does `next` do?', ['Stops the loop', 'Skips to the next time round', 'Restarts the loop', 'Goes to the next line'], 1,
      'The rest of the current round is skipped.'),
    mc('What does `break` do?', ['Skips one round', 'Stops the loop straight away', 'Pauses R', 'Gives an error'], 1,
      'The code after the loop runs next.'),
    mc('After `s <- 0; for (v in c(1, NA, 3)) { if (is.na(v)) next; s <- s + v }`, what is `s`?', ['`NA`', '`4`', '`1`', '`3`'], 1,
      'The NA is skipped.',
      { code: 's <- 0\nfor (v in c(1, NA, 3)) { if (is.na(v)) next; s <- s + v }\ns', output: '[1] 4' }),
    mc('After `out <- 0; for (v in 1:10) { if (v > 3) break; out <- v }`, what is `out`?', ['`10`', '`3`', '`4`', '`0`'], 1,
      'The loop stops when v is 4, before `out` is changed.',
      { code: 'out <- 0\nfor (v in 1:10) { if (v > 3) break; out <- v }\nout', output: '[1] 3' }),
    mc('Which loop suits "how many weeks until I have saved 500"?', ['for', 'while', 'Neither', 'if'], 1,
      'You don\'t know the number of rounds in advance.'),
    qShort('Which keyword stops a loop straight away?', 'break',
      '`break` ends the loop; `next` skips one round.'),
  ],
})
