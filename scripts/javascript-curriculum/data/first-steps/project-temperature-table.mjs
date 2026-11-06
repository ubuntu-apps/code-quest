// First steps side quest (hard): A temperature table. Lesson, Try-it snippets, challenges and quiz.
import { is, makeProject, mc, near, prints, snippet, task, uses } from '../_builders.mjs'

export default makeProject('hard', {
  id: 'proj_temperature_table',
  title: 'A temperature table',
  paragraphs: [
    'A table that converts temperatures between Celsius and Fahrenheit, with the numbers lined up on the right:',
    '```text\n  °C     °F\n   0   32.0\n  25   77.0\n 100  212.0\n```',
    'Fahrenheit is Celsius times 9, divided by 5, plus 32. To go back, take 32 away and multiply by 5/9.',
    'Each row is the Celsius value padded to 4 characters, then the Fahrenheit value with 1 decimal padded to 7: `` `${String(c).padStart(4)}${f.toFixed(1).padStart(7)}` ``. `padStart` lines numbers up on the right, as a table needs. (`padStart` works on text, so the number is turned into a string first.)',
    'In the next quest, loops will make tables of any size. For now, there are three rows.',
  ],
  sandboxCode: 'const c = 25\nconst f = c * 9 / 5 + 32\nconsole.log(`${"°C".padStart(4)}${"°F".padStart(7)}`)\nconsole.log(`${String(c).padStart(4)}${f.toFixed(1).padStart(7)}`)',
  sandboxSnippets: [
    snippet('Right-aligned numbers', 'console.log(String(5).padStart(4))\nconsole.log(String(50).padStart(4))\nconsole.log(String(500).padStart(4))'),
    snippet('Both ways', 'const c = 100\nconst f = c * 9 / 5 + 32\nconsole.log(f, (f - 32) * 5 / 9)'),
  ],
  challenges: [
    task('easy', 'To Fahrenheit', {
      prompt: 'Set `f` to `c` in Fahrenheit.',
      starter: 'const c = 25\n',
      hint: '`c * 9 / 5 + 32`.',
      solution: 'const c = 25\nconst f = c * 9 / 5 + 32',
      tests: [['f is 77', near('f', 77)]],
    }),
    task('easy', 'Back to Celsius', {
      prompt: 'Set `c` to `f` in Celsius.',
      starter: 'const f = 212\n',
      hint: '`(f - 32) * 5 / 9`: the brackets matter.',
      solution: 'const f = 212\nconst c = (f - 32) * 5 / 9',
      tests: [['c is 100', near('c', 100)]],
    }),
    task('medium', 'The header', {
      prompt: 'Set `header` to `°C` padded to 4 characters and `°F` padded to 7, so it reads `  °C     °F`.',
      hint: '`` `${"°C".padStart(4)}${"°F".padStart(7)}` ``.',
      solution: 'const header = `${"°C".padStart(4)}${"°F".padStart(7)}`',
      tests: [['header is right', is('header', '  °C     °F')], ['Uses padStart', uses('padStart(')]],
      typedOk: true,
    }),
    task('medium', 'One row', {
      prompt: 'Set `row` to `c` padded to 4 characters and its Fahrenheit value with 1 decimal padded to 7: `  25   77.0`.',
      starter: 'const c = 25\n',
      hint: 'Work out `f` first. Then `` `${String(c).padStart(4)}${f.toFixed(1).padStart(7)}` ``.',
      solution: 'const c = 25\nconst f = c * 9 / 5 + 32\nconst row = `${String(c).padStart(4)}${f.toFixed(1).padStart(7)}`',
      tests: [['row is right', is('row', '  25   77.0')], ['row is 11 characters', 'row.length === 11']],
    }),
    task('hard', 'The table', {
      prompt: 'Show the header and a row for each of `c1`, `c2` and `c3`.',
      starter: 'const c1 = 0\nconst c2 = 25\nconst c3 = 100\n',
      hint: 'Work out `f1`, `f2` and `f3`, then show the header and three rows made the same way as in the last challenge.',
      solution: 'const c1 = 0\nconst c2 = 25\nconst c3 = 100\nconst f1 = c1 * 9 / 5 + 32\nconst f2 = c2 * 9 / 5 + 32\nconst f3 = c3 * 9 / 5 + 32\nconsole.log(`${"°C".padStart(4)}${"°F".padStart(7)}`)\nconsole.log(`${String(c1).padStart(4)}${f1.toFixed(1).padStart(7)}`)\nconsole.log(`${String(c2).padStart(4)}${f2.toFixed(1).padStart(7)}`)\nconsole.log(`${String(c3).padStart(4)}${f3.toFixed(1).padStart(7)}`)',
      tests: [['Shows the table', prints('  °C     °F', '   0   32.0', '  25   77.0', ' 100  212.0')]],
      alt: 'const c1 = -10\nconst c2 = 37\nconst c3 = 60',
    }),
    task('expert', 'Add Kelvin', {
      prompt: 'Scientists use Kelvin: Celsius plus 273.15. Show a header and one row with a third column, Kelvin with 2 decimals padded to 9: `  °C     °F        K` and then `  25   77.0   298.15`.',
      starter: 'const c = 25\n',
      hint: '`const k = c + 273.15`. Add `` ${"K".padStart(9)} `` to the header and `` ${k.toFixed(2).padStart(9)} `` to the row.',
      solution: 'const c = 25\nconst f = c * 9 / 5 + 32\nconst k = c + 273.15\nconsole.log(`${"°C".padStart(4)}${"°F".padStart(7)}${"K".padStart(9)}`)\nconsole.log(`${String(c).padStart(4)}${f.toFixed(1).padStart(7)}${k.toFixed(2).padStart(9)}`)',
      tests: [['k is 298.15', near('k', 298.15)], ['Shows the header and the row', prints('  °C     °F        K', '  25   77.0   298.15')]],
    }),
  ],
  questions: [
    mc('What does `String(7).padStart(3)` give?', ['"  7"', '"7  "', '"007"', '"7"'], 0,
      'padStart adds spaces at the start until it is 3 long.', { code: 'console.log(`[${String(7).padStart(3)}]`)', output: '[  7]' }),
    mc('What is 0 °C in Fahrenheit (`0 * 9 / 5 + 32`)?', ['32', '0', '-32', '17.8'], 0,
      '0 × 9 / 5 is 0, plus 32 is 32.', { code: 'console.log(0 * 9 / 5 + 32)', output: '32' }),
    mc('Why must the brackets stay in `(f - 32) * 5 / 9`?', ['Without them, only 32 is multiplied', 'They make it faster', 'JavaScript needs brackets around every sum', 'They turn f into text'], 0,
      '* comes before -, so without brackets it would be f - (32 * 5 / 9).'),
    mc('What does `(77).toFixed(1)` give?', ['"77.0"', '77', '"77"', '"77.00"'], 0,
      'One decimal place, as text.', { code: 'console.log((77).toFixed(1))', output: '77.0' }),
    mc('Why does a number need `String(…)` before `padStart`?', ['padStart is a string method', 'Numbers can\'t be shown', 'It rounds the number', 'It isn\'t needed for any value'], 0,
      'Numbers don\'t have padStart; turn them into text first.'),
    mc('What does `25 + 273.15` give?', ['298.15', '273.4', '"25273.15"', '298'], 0,
      'Both are numbers, so + adds.', { code: 'console.log(25 + 273.15)', output: '298.15' }),
  ],
})
