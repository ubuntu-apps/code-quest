// First steps side quest (medium): A shopping receipt. Lesson, Try-it snippets, challenges and quiz.
import { is, makeProject, mc, near, prints, snippet, task, uses } from '../_builders.mjs'

export default makeProject('medium', {
  id: 'proj_shopping_receipt',
  title: 'A shopping receipt',
  paragraphs: [
    'A receipt for one item, with tax. From these details:',
    '```\nconst item = "Notebook"\nconst price = 3.25\nconst quantity = 4\nconst taxRate = 0.08\n```',
    'the finished program shows:',
    '```text\n4 x Notebook\nSubtotal: $13.00\nTax (8%): $1.04\nTotal: $14.04\n```',
    'The subtotal is the price times the quantity, the tax is the subtotal times the tax rate, and the total is the two added. Money is shown with 2 decimal places, using `toFixed(2)`, and the tax rate as a percentage: `Math.round(taxRate * 100)`.',
    'Build it in steps; the last challenge puts it all together.',
  ],
  sandboxCode: 'const price = 3.25\nconst quantity = 4\nconst subtotal = price * quantity\nconsole.log(`Subtotal: $${subtotal.toFixed(2)}`)',
  sandboxSnippets: [
    snippet('Money', 'const amount = 1.04\nconsole.log(`$${amount.toFixed(2)}`)\nconsole.log(`$${(13).toFixed(2)}`)'),
    snippet('Percent', 'const taxRate = 0.08\nconsole.log(`${Math.round(taxRate * 100)}%`)'),
  ],
  challenges: [
    task('easy', 'The subtotal', {
      prompt: 'Set `subtotal` to the price times the quantity.',
      starter: 'const price = 3.25\nconst quantity = 4\n',
      hint: '`price * quantity`.',
      solution: 'const price = 3.25\nconst quantity = 4\nconst subtotal = price * quantity',
      tests: [['subtotal is 13', near('subtotal', 13)]],
    }),
    task('easy', 'The first line', {
      prompt: 'Set `first` to the quantity, ` x ` and the item: `4 x Notebook`.',
      starter: 'const item = "Notebook"\nconst quantity = 4\n',
      hint: '`` `${quantity} x ${item}` ``.',
      solution: 'const item = "Notebook"\nconst quantity = 4\nconst first = `${quantity} x ${item}`',
      tests: [['first is 4 x Notebook', is('first', '4 x Notebook')]],
    }),
    task('medium', 'Tax and total', {
      prompt: 'Set `tax` to the subtotal times the tax rate, and `total` to the subtotal plus the tax.',
      starter: 'const subtotal = 13\nconst taxRate = 0.08\n',
      hint: '`const tax = subtotal * taxRate`, then `const total = subtotal + tax`.',
      solution: 'const subtotal = 13\nconst taxRate = 0.08\nconst tax = subtotal * taxRate\nconst total = subtotal + tax',
      tests: [['tax is 1.04', near('tax', 1.04)], ['total is 14.04', near('total', 14.04)]],
    }),
    task('medium', 'The tax label', {
      prompt: 'Set `label` to `Tax (8%):` with the percentage worked out from `taxRate`.',
      starter: 'const taxRate = 0.08\n',
      hint: '`` `Tax (${Math.round(taxRate * 100)}%):` ``.',
      solution: 'const taxRate = 0.08\nconst label = `Tax (${Math.round(taxRate * 100)}%):`',
      tests: [['label is right', is('label', 'Tax (8%):')], ['Rounds the percentage', uses('Math.round')]],
    }),
    task('hard', 'Money lines', {
      prompt: 'Show `Subtotal: $13.00` and then `Total: $14.04`, with 2 decimal places.',
      starter: 'const subtotal = 13\nconst total = 14.04\n',
      hint: 'A `$` before `${…}` is just a character: `` `Subtotal: $${subtotal.toFixed(2)}` ``.',
      solution: 'const subtotal = 13\nconst total = 14.04\nconsole.log(`Subtotal: $${subtotal.toFixed(2)}`)\nconsole.log(`Total: $${total.toFixed(2)}`)',
      tests: [['Shows both lines', prints('Subtotal: $13.00', 'Total: $14.04')], ['Uses toFixed', uses('toFixed(2)')]],
    }),
    task('expert', 'The whole receipt', {
      prompt: 'Show the whole receipt from the four details: the item line, the subtotal, the tax with its percentage, and the total.',
      starter: 'const item = "Notebook"\nconst price = 3.25\nconst quantity = 4\nconst taxRate = 0.08\n',
      hint: 'Work out `subtotal`, `tax` and `total` first, then four `console.log` lines with template literals and `toFixed(2)`.',
      solution: 'const item = "Notebook"\nconst price = 3.25\nconst quantity = 4\nconst taxRate = 0.08\nconst subtotal = price * quantity\nconst tax = subtotal * taxRate\nconst total = subtotal + tax\nconsole.log(`${quantity} x ${item}`)\nconsole.log(`Subtotal: $${subtotal.toFixed(2)}`)\nconsole.log(`Tax (${Math.round(taxRate * 100)}%): $${tax.toFixed(2)}`)\nconsole.log(`Total: $${total.toFixed(2)}`)',
      tests: [['Shows the receipt', prints('4 x Notebook', 'Subtotal: $13.00', 'Tax (8%): $1.04', 'Total: $14.04')]],
      alt: 'const item = "Pen"\nconst price = 1.2\nconst quantity = 5\nconst taxRate = 0.2',
    }),
  ],
  questions: [
    mc('What does `(13).toFixed(2)` give?', ['"13.00"', '13', '"13"', '13.00'], 0,
      'toFixed gives text with exactly that many decimals.', { code: 'console.log((13).toFixed(2))', output: '13.00' }),
    mc('After `const t = 2.5`, what does `` `$${t}` `` give?', ['"$2.5"', '"$${t}"', '"2.5"', '"$t"'], 0,
      'The first $ is a character; ${t} is the gap.', { code: 'const t = 2.5\nconsole.log(`$${t}`)', output: '$2.5' }),
    mc('What does `Math.round(0.08 * 100)` give?', ['8', '0.08', '80', '8.0'], 0,
      '0.08 × 100 is 8.', { code: 'console.log(Math.round(0.08 * 100))', output: '8' }),
    mc('Why use `toFixed(2)` for money?', ['So amounts always show 2 decimals, like $13.00', 'It makes the maths exact', 'It turns text into numbers', 'It adds tax'], 0,
      'It rounds for showing; 13 would otherwise show as just 13.'),
    mc('What does `4 * 3.25` give?', ['13', '12.25', '7.25', '"43.25"'], 0,
      '4 × 3.25 is 13.', { code: 'console.log(4 * 3.25)', output: '13' }),
    mc('Is the result of `toFixed` a number or text?', ['Text', 'A number', 'A boolean', 'undefined'], 0,
      'It is text, ready to show; use the number itself for more maths.'),
  ],
})
