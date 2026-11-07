// Functions side quest (easy): A tip calculator. Lesson, Try-it snippets, challenges and quiz.
import { is, makeProject, mc, same, snippet, task } from '../_builders.mjs'

export default makeProject('easy', {
  id: 'proj_tip_calculator',
  title: 'A tip calculator',
  paragraphs: [
    'After a meal out, the table wants to know: how much is the tip, what is the total, and what does each person pay?',
    'Build it from small functions that return values, each one doing one job:',
    '- `tip(bill, percent = 15)`: the tip;\n- `total(bill, percent = 15)`: the bill plus the tip;\n- `perPerson(bill, people, percent = 15)`: the total split evenly;\n- `money(amount)`: an amount as text like `$12.50`.',
    'For a $80 bill with a 15% tip between 4 people, each pays $23.00:',
    '```text\nBill:  $80.00\nTip:   $12.00\nTotal: $92.00\nEach:  $23.00\n```',
  ],
  sandboxCode: 'const tip = (bill, percent = 15) => bill * percent / 100\nconsole.log(tip(80), tip(80, 20))',
  sandboxSnippets: [
    snippet('Money text', 'const money = (n) => `$${n.toFixed(2)}`\nconsole.log(money(12), money(3.456))'),
  ],
  challenges: [
    task('easy', 'The tip', {
      prompt: 'Write `tip(bill, percent = 15)`, returning `percent`% of `bill`.',
      hint: '`return bill * percent / 100`.',
      solution: 'function tip(bill, percent = 15) {\n  return bill * percent / 100\n}',
      tests: [['tip(80) is 12', is('tip(80)', 12)], ['tip(50, 20) is 10', is('tip(50, 20)', 10)], ['tip(10, 0) is 0', is('tip(10, 0)', 0)]],
    }),
    task('easy', 'As money', {
      prompt: 'Write `money(amount)`, returning it as text with `$` and 2 decimal places.',
      hint: '`` return `$${amount.toFixed(2)}` ``.',
      solution: 'function money(amount) {\n  return `$${amount.toFixed(2)}`\n}',
      tests: [['money(12)', is('money(12)', '$12.00')], ['money(3.456)', is('money(3.456)', '$3.46')], ['money(0)', is('money(0)', '$0.00')]],
    }),
    task('medium', 'The total', {
      prompt: 'Write `total(bill, percent = 15)`, using `tip` to return the bill plus the tip.',
      starter: 'function tip(bill, percent = 15) {\n  return bill * percent / 100\n}\n',
      hint: '`return bill + tip(bill, percent)`.',
      solution: 'function tip(bill, percent = 15) {\n  return bill * percent / 100\n}\nfunction total(bill, percent = 15) {\n  return bill + tip(bill, percent)\n}',
      tests: [['total(80) is 92', is('total(80)', 92)], ['total(50, 20) is 60', is('total(50, 20)', 60)], ['Uses tip', '/tip\\s*\\(/.test(String(total))']],
    }),
    task('medium', 'Split it', {
      prompt: 'Write `perPerson(bill, people, percent = 15)`, returning what each person pays.',
      starter: 'const tip = (bill, percent = 15) => bill * percent / 100\nconst total = (bill, percent = 15) => bill + tip(bill, percent)\n',
      hint: '`return total(bill, percent) / people`.',
      solution: 'const tip = (bill, percent = 15) => bill * percent / 100\nconst total = (bill, percent = 15) => bill + tip(bill, percent)\nfunction perPerson(bill, people, percent = 15) {\n  return total(bill, percent) / people\n}',
      tests: [['perPerson(80, 4) is 23', is('perPerson(80, 4)', 23)], ['perPerson(100, 5, 20) is 24', is('perPerson(100, 5, 20)', 24)], ['perPerson(30, 1, 0) is 30', is('perPerson(30, 1, 0)', 30)]],
    }),
    task('hard', 'Round up', {
      prompt: 'Nobody wants to pay $23.33. Write `roundedShare(bill, people, percent = 15)`, returning each person\'s share rounded **up** to the next whole dollar.',
      hint: '`Math.ceil(total / people)`; work the total out as `bill * (1 + percent / 100)`.',
      solution: 'function roundedShare(bill, people, percent = 15) {\n  const total = bill * (1 + percent / 100)\n  return Math.ceil(total / people)\n}',
      tests: [['roundedShare(100, 3) is 39', is('roundedShare(100, 3)', 39)], ['roundedShare(80, 4) is 23', is('roundedShare(80, 4)', 23)], ['roundedShare(10, 3, 0) is 4', is('roundedShare(10, 3, 0)', 4)]],
    }),
    task('expert', 'The receipt', {
      prompt: 'Write `receipt(bill, people, percent = 15)`, returning an array of four lines like the lesson\'s: `Bill:  $80.00`, `Tip:   $12.00`, `Total: $92.00`, `Each:  $23.00`. Each label is padded to 7 characters.',
      hint: 'Make a small `money` function, then `"Bill:".padEnd(7) + money(bill)` and so on.',
      solution: 'function receipt(bill, people, percent = 15) {\n  const money = (n) => `$${n.toFixed(2)}`\n  const tip = bill * percent / 100\n  const total = bill + tip\n  return [\n    "Bill:".padEnd(7) + money(bill),\n    "Tip:".padEnd(7) + money(tip),\n    "Total:".padEnd(7) + money(total),\n    "Each:".padEnd(7) + money(total / people),\n  ]\n}',
      tests: [['$80 for 4', same('receipt(80, 4)', '["Bill:  $80.00", "Tip:   $12.00", "Total: $92.00", "Each:  $23.00"]')], ['$50 for 2 at 20%', same('receipt(50, 2, 20)', '["Bill:  $50.00", "Tip:   $10.00", "Total: $60.00", "Each:  $30.00"]')]],
    }),
  ],
  questions: [
    mc('What is 15% of 80?', ['12', '15', '8', '1.2'], 0, '80 * 15 / 100.', { code: 'console.log(80 * 15 / 100)', output: '12' }),
    mc('What does `(23.333).toFixed(2)` give?', ['"23.33"', '23.33', '"23.34"', '"23"'], 0, 'toFixed gives text.', { code: 'console.log(typeof (23.333).toFixed(2), (23.333).toFixed(2))', output: 'string 23.33' }),
    mc('What does `Math.ceil(38.33)` give?', ['39', '38', '38.4', '40'], 0, 'ceil rounds up.', { code: 'console.log(Math.ceil(38.33))', output: '39' }),
    mc('For `tip(bill, percent = 15)`, what is `tip(100)`?', ['15', '100', 'NaN', 'undefined'], 0, 'The default 15 is used.'),
    mc('Why give `total` a `percent` parameter too, instead of always using 15?', ['So callers can choose, passing it on to tip', 'JavaScript needs it', 'To make it pure', 'It doesn\'t need one'], 0, 'It passes the choice through.'),
    mc('What does `"Tip:".padEnd(7)` give?', ['"Tip:   "', '"   Tip:"', '"Tip:7"', '"Tip:"'], 0, 'Spaces are added at the end, to 7 characters.', { code: 'console.log(JSON.stringify("Tip:".padEnd(7)))', output: '"Tip:   "' }),
  ],
})
