// First steps in R, easy side quest: The café bill.
import { code, makeProject, mc, near, prints, qShort, r, snippet, task, uses } from '../_builders.mjs'

export default makeProject('easy', {
  id: 'proj_cafe_bill',
  title: 'The café bill',
  paragraphs: [
    'Corner Café sells lattes for 3.40 and croissants for 2.80. A table orders **two lattes and one croissant**, adds a 10% tip, and splits the bill three ways.',
    'Build the bill step by step, saving each result in a variable. The last challenge puts it all together and shows the bill:',
    code('Subtotal: 9.6', 'Tip: 0.96', 'Total: 10.56', 'Each pays: 3.52'),
    'Round money to 2 decimal places with `round(x, 2)`. Note that `cat()` shows `9.6`, not `9.60`: R drops zeros at the end of a number. A later quest shows how to format money with two decimals.',
  ],
  sandboxCode: 'latte <- 3.4\ncroissant <- 2.8\n2 * latte + croissant',
  sandboxSnippets: [
    snippet('Ten percent', 'subtotal <- 9.6\nsubtotal * 0.10\nround(subtotal * 0.10, 2)'),
    snippet('Split three ways', '10.56 / 3\nround(10.56 / 3, 2)'),
  ],
  challenges: [
    task('easy', 'The menu', {
      prompt: 'Make `latte` hold `3.4` and `croissant` hold `2.8`.',
      hint: 'Two lines: `latte <- 3.4` and `croissant <- 2.8`.',
      solution: 'latte <- 3.4\ncroissant <- 2.8',
      tests: [
        ['latte is 3.4', near('latte', 3.4)],
        ['croissant is 2.8', near('croissant', 2.8)],
      ],
    }),
    task('easy', 'The subtotal', {
      prompt: 'Make `subtotal` the cost of two lattes and one croissant, using the variables.',
      starter: 'latte <- 3.4\ncroissant <- 2.8\n',
      hint: '`subtotal <- 2 * latte + croissant`',
      solution: 'latte <- 3.4\ncroissant <- 2.8\nsubtotal <- 2 * latte + croissant',
      tests: [
        ['subtotal is 9.6', near('subtotal', 9.6)],
        ['Uses the variables', uses('latte') + ' && ' + uses('croissant')],
      ],
    }),
    task('medium', 'The tip', {
      prompt: 'Make `tip` 10% of the subtotal, rounded to 2 decimal places.',
      starter: 'subtotal <- 9.6\n',
      hint: '10% is `0.10`: `tip <- round(subtotal * 0.10, 2)`.',
      solution: 'subtotal <- 9.6\ntip <- round(subtotal * 0.10, 2)',
      tests: [['tip is 0.96', near('tip', 0.96)]],
    }),
    task('medium', 'The total', {
      prompt: 'Make `total` the subtotal plus the tip.',
      starter: 'subtotal <- 9.6\ntip <- 0.96\n',
      hint: '`total <- subtotal + tip`',
      solution: 'subtotal <- 9.6\ntip <- 0.96\ntotal <- subtotal + tip',
      tests: [['total is 10.56', near('total', 10.56)]],
    }),
    task('hard', 'Split three ways', {
      prompt: 'Make `each` what each of the three friends pays, rounded to 2 decimal places.',
      starter: 'total <- 10.56\n',
      hint: '`each <- round(total / 3, 2)`',
      solution: 'total <- 10.56\neach <- round(total / 3, 2)',
      tests: [['each is 3.52', near('each', 3.52)]],
    }),
    task('expert', 'The whole bill', {
      prompt: 'Starting from the two prices, work out the whole bill and show these four lines:\n\n```\nSubtotal: 9.6\nTip: 0.96\nTotal: 10.56\nEach pays: 3.52\n```',
      starter: 'latte <- 3.4\ncroissant <- 2.8\n',
      hint: 'Work out `subtotal`, `tip`, `total` and `each` as before, then four `cat()` lines, such as `cat("Tip:", tip, "\\n")`.',
      solution: r`latte <- 3.4
croissant <- 2.8
subtotal <- 2 * latte + croissant
tip <- round(subtotal * 0.10, 2)
total <- subtotal + tip
each <- round(total / 3, 2)
cat("Subtotal:", subtotal, "\n")
cat("Tip:", tip, "\n")
cat("Total:", total, "\n")
cat("Each pays:", each, "\n")`,
      tests: [
        ['total is 10.56', near('total', 10.56)],
        ['Shows the four lines', prints('Subtotal: 9.6', 'Tip: 0.96', 'Total: 10.56', 'Each pays: 3.52')],
      ],
    }),
  ],
  questions: [
    mc('What does `2 * 3.4 + 2.8` give?', ['`13.6`', '`9.6`', '`12.4`', '`8.6`'], 1,
      'Multiplication comes first: 6.8, plus 2.8 is 9.6.',
      { code: '2 * 3.4 + 2.8', output: '[1] 9.6' }),
    mc('What does `round(0.964, 2)` give?', ['`0.96`', '`0.97`', '`1`', '`0.9`'], 0,
      'Two decimal places: 0.964 is nearer 0.96.',
      { code: 'round(0.964, 2)', output: '[1] 0.96' }),
    mc('What does `cat("Total:", 10.50, "\\n")` show?', ['`Total: 10.50`', '`Total: 10.5`', '`Total:10.5`', '`[1] "Total: 10.5"`'], 1,
      'R drops zeros at the end of a number, so 10.50 is shown as 10.5.',
      { code: r`cat("Total:", 10.50, "\n")`, output: 'Total: 10.5' }),
    mc('Which gives 10% of `subtotal`?', ['`subtotal * 10`', '`subtotal %% 10`', '`subtotal * 0.10`', '`subtotal + 10`'], 2,
      '10% is 10/100, which is 0.10.'),
    mc('What does `round(10.56 / 3, 2)` give?', ['`3.52`', '`3.5`', '`3.53`', '`3.33`'], 0,
      '10.56 / 3 is exactly 3.52.',
      { code: 'round(10.56 / 3, 2)', output: '[1] 3.52' }),
    qShort('Which function rounds a number to a given number of decimal places?', 'round',
      '`round(x, 2)` rounds to 2 decimal places.'),
  ],
})
