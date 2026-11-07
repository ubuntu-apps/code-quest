// Decisions and loops side quest (hard): A times-table grid. Lesson, Try-it snippets, challenges and quiz.
import { is, makeProject, mc, prints, snippet, task, uses } from '../_builders.mjs'

export default makeProject('hard', {
  id: 'proj_times_grid',
  title: 'A times-table grid',
  paragraphs: [
    'A multiplication grid of any size, with headings and the numbers lined up in columns. For a size of 4:',
    '```text\n   x   1   2   3   4\n   1   1   2   3   4\n   2   2   4   6   8\n   3   3   6   9  12\n   4   4   8  12  16\n```',
    'Every cell is 4 characters wide, padded on the left with `padStart(4)`. The top row starts with `x` and lists 1 to the size; each row after it starts with its row number. Each cell is the row number times the column number.',
    'It\'s nested loops: the outer one over rows, the inner one over columns, building each line as text.',
  ],
  sandboxCode: 'let line = "x".padStart(4)\nfor (let c = 1; c <= 4; c++) {\n  line += String(c).padStart(4)\n}\nconsole.log(line)',
  sandboxSnippets: [
    snippet('Cells', 'console.log(`[${String(7).padStart(4)}]`)\nconsole.log(`[${String(12).padStart(4)}]`)'),
  ],
  challenges: [
    task('easy', 'One cell', {
      prompt: 'Set `cell` to `r * c` as text, padded to 4 characters.',
      starter: 'const r = 3\nconst c = 4\n',
      hint: '`String(r * c).padStart(4)`.',
      solution: 'const r = 3\nconst c = 4\nconst cell = String(r * c).padStart(4)',
      tests: [['cell is "  12"', is('cell', '  12')]],
    }),
    task('easy', 'One row', {
      prompt: 'Set `line` to the cells of row `r` for columns 1 to `size`, joined together: `   3   6   9  12`.',
      starter: 'const r = 3\nconst size = 4\n',
      hint: '`let line = ""`, then a loop adding `String(r * c).padStart(4)`.',
      solution: 'const r = 3\nconst size = 4\nlet line = ""\nfor (let c = 1; c <= size; c++) {\n  line += String(r * c).padStart(4)\n}',
      tests: [['line is right', is('line', '   3   6   9  12')]],
    }),
    task('medium', 'The header', {
      prompt: 'Set `header` to `x` and the numbers 1 to `size`, each padded to 4: `   x   1   2   3   4`.',
      starter: 'const size = 4\n',
      hint: 'Start with `"x".padStart(4)`, then add each column number padded.',
      solution: 'const size = 4\nlet header = "x".padStart(4)\nfor (let c = 1; c <= size; c++) {\n  header += String(c).padStart(4)\n}',
      tests: [['header is right', is('header', '   x   1   2   3   4')]],
    }),
    task('medium', 'The rows', {
      prompt: 'Show the rows of the grid without the header: each starts with its row number, then its cells.',
      starter: 'const size = 3\n',
      hint: 'Outer loop over `r`: start `line` with `String(r).padStart(4)`, inner loop adds the cells, then show it.',
      solution: 'const size = 3\nfor (let r = 1; r <= size; r++) {\n  let line = String(r).padStart(4)\n  for (let c = 1; c <= size; c++) {\n    line += String(r * c).padStart(4)\n  }\n  console.log(line)\n}',
      tests: [['Shows the rows', prints('   1   1   2   3', '   2   2   4   6', '   3   3   6   9')]],
    }),
    task('hard', 'The whole grid', {
      prompt: 'Show the whole grid, header first, for `size`.',
      starter: 'const size = 4\n',
      hint: 'The header from before, then the rows.',
      solution: 'const size = 4\nlet header = "x".padStart(4)\nfor (let c = 1; c <= size; c++) {\n  header += String(c).padStart(4)\n}\nconsole.log(header)\nfor (let r = 1; r <= size; r++) {\n  let line = String(r).padStart(4)\n  for (let c = 1; c <= size; c++) {\n    line += String(r * c).padStart(4)\n  }\n  console.log(line)\n}',
      tests: [['Shows the grid', prints('   x   1   2   3   4', '   1   1   2   3   4', '   2   2   4   6   8', '   3   3   6   9  12', '   4   4   8  12  16')]],
    }),
    task('expert', 'Mark the squares', {
      prompt: 'Show the grid again, but put the squares (where row equals column) in square brackets, as `[16]`, still padded to 4 characters in total.',
      starter: 'const size = 4\n',
      hint: 'For each cell: `const text = r === c ? `[${r * c}]` : String(r * c)`, then `text.padStart(4)`.',
      solution: 'const size = 4\nlet header = "x".padStart(4)\nfor (let c = 1; c <= size; c++) {\n  header += String(c).padStart(4)\n}\nconsole.log(header)\nfor (let r = 1; r <= size; r++) {\n  let line = String(r).padStart(4)\n  for (let c = 1; c <= size; c++) {\n    const text = r === c ? `[${r * c}]` : String(r * c)\n    line += text.padStart(4)\n  }\n  console.log(line)\n}',
      tests: [['Shows the grid', prints('   x   1   2   3   4', '   1 [1]   2   3   4', '   2   2 [4]   6   8', '   3   3   6 [9]  12', '   4   4   8  12[16]')]],
      alt: 'const size = 3',
    }),
  ],
  questions: [
    mc('What does `String(5).padStart(4)` give?', ['"   5"', '"5   "', '"0005"', '"5"'], 0,
      'Three spaces, then 5.', { code: 'console.log(`[${String(5).padStart(4)}]`)', output: '[   5]' }),
    mc('In the grid, what is the cell in row 3, column 4?', ['12', '7', '34', '1'], 0, 'Row times column.'),
    mc('Which loop goes over the columns?', ['The inner one', 'The outer one', 'Neither', 'Both'], 0,
      'Each row is built column by column.'),
    mc('How many cells (not counting headings) does a size-5 grid have?', ['25', '10', '5', '36'], 0, '5 rows of 5.'),
    mc('Why pad every cell to the same width?', ['So the columns line up', 'To make the numbers bigger', 'padStart is required for numbers', 'To sort them'], 0,
      'Equal widths keep each column straight.'),
    mc('After `let s = ""; for (let i = 1; i <= 3; i++) { s += String(i).padStart(2) }`, what is `s`?', ['" 1 2 3"', '"123"', '"1 2 3"', '"  123"'], 0,
      'Each number takes 2 characters.', { code: 'let s = ""; for (let i = 1; i <= 3; i++) { s += String(i).padStart(2) }\nconsole.log(`[${s}]`)', output: '[ 1 2 3]' }),
  ],
})
