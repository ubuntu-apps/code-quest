// First steps in R: Reading error messages.
import { R_INTRO, code, makeTopic, mc, near, prints, qShort, r, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: 'errors',
  title: 'Reading error messages',
  paragraphs: [
    'Everyone who writes code makes mistakes, all the time. The skill is reading what R tells you and fixing it quickly. When R can\'t run a line, it stops and shows an **error**. Nothing after that line runs.',
    'These are the errors you will meet most often:',
    '| Error | Usual cause | Example |\n| --- | --- | --- |\n| `object \'totl\' not found` | a misspelt variable, or one not made yet | `totl * 2` |\n| `could not find function "sqroot"` | a misspelt function name | `sqroot(16)` |\n| `unexpected end of input` | a bracket or quote never closed | `round(3.456, 1` |\n| `unexpected numeric constant` | a missing comma or operator | `max(3 8)` |\n| `unexpected string constant` | a missing comma before some text | `paste("a" "b")` |\n| `non-numeric argument to binary operator` | maths on text | `"12" * 2` |',
    'The message usually names the problem word. `object \'totl\' not found` points straight at `totl`. For "unexpected" errors, R shows the line with a `^` under the spot where it got confused: look just before it.',
    'A **warning** is different from an error. R still runs the line and gives an answer, but tells you something looks wrong. `sqrt(-4)` gives `NaN` ("not a number") with a warning, because negative numbers have no ordinary square root.',
    'A good routine: read the error, find the line, fix one thing, and run again. When there are several mistakes, R stops at the first, so fix them one at a time.',
    code('# Run this, read the error, and fix the typo', 'total <- 12', 'totl * 2'),
  ],
  sandboxCode: '# Run this, read the error, then fix it\ntotal <- 12\ntotl * 2',
  sandboxSnippets: [
    snippet('Misspelt function', '# Run it and read the error\nsqroot(16)'),
    snippet('Bracket never closed', '# Run it and read the error\nround(3.456, 1'),
    snippet('Missing comma', '# Run it and read the error\nmax(3 8)'),
    snippet('Maths on text', '# Run it and read the error\n"12" * 2'),
    snippet('A warning, not an error', 'sqrt(-4)\ncat("This line still runs\\n")'),
  ],
  readMore: R_INTRO('Getting-help-with-functions-and-features', 'An Introduction to R: getting help'),
  challenges: [
    task('easy', 'Typo in a name', {
      prompt: 'Fix the typo so the code shows `[1] 24`.',
      starter: 'total <- 12\ntotl * 2',
      hint: 'The error says `object \'totl\' not found`. The variable is called `total`.',
      solution: 'total <- 12\ntotal * 2',
      tests: [['Shows [1] 24', prints('[1] 24')]],
    }),
    task('easy', 'Typo in a function', {
      prompt: 'Fix the function name so the code shows `[1] 4`.',
      starter: 'sqroot(16)',
      hint: 'The square root function is `sqrt`.',
      solution: 'sqrt(16)',
      tests: [['Shows [1] 4', prints('[1] 4')]],
    }),
    task('easy', 'Close the bracket', {
      prompt: 'Fix the line so it shows `[1] 3.5`.',
      starter: 'round(3.456, 1',
      hint: '`unexpected end of input` means something was never closed. Add the `)`.',
      solution: 'round(3.456, 1)',
      tests: [['Shows [1] 3.5', prints('[1] 3.5')]],
    }),
    task('medium', 'The missing comma', {
      prompt: 'Fix the line so it shows `[1] 8`.',
      starter: 'max(3 8)',
      hint: '`unexpected numeric constant`: two numbers with nothing between them. Arguments need a comma.',
      solution: 'max(3, 8)',
      tests: [['Shows [1] 8', prints('[1] 8')]],
    }),
    task('medium', 'Numbers, not text', {
      prompt: 'This price was typed as text. Fix the first line so the code shows `[1] 24`.',
      starter: 'price <- "12"\nprice * 2',
      hint: 'Remove the quotes, so `price` is the number 12.',
      solution: 'price <- 12\nprice * 2',
      tests: [
        ['price is a number', near('price', 12)],
        ['Shows [1] 24', prints('[1] 24')],
      ],
    }),
    task('medium', 'Close the quote', {
      prompt: 'Fix the line so it shows `See you soon`.',
      starter: r`cat("See you soon\n)`,
      hint: 'The text has an opening quote but no closing one. Close it after `\\n`.',
      solution: r`cat("See you soon\n")`,
      tests: [['Shows See you soon', prints('See you soon')]],
    }),
    task('hard', 'A warning to fix', {
      prompt: 'This gives `NaN` and a warning. The distance should not be negative: wrap `-16` in `abs()` so the line shows `[1] 4`.',
      starter: 'sqrt(-16)',
      hint: '`sqrt(abs(-16))`: `abs()` first gives 16, and its square root is 4.',
      solution: 'sqrt(abs(-16))',
      tests: [['Shows [1] 4', prints('[1] 4')]],
    }),
    task('hard', 'Two mistakes', {
      prompt: 'Two lines are wrong. Fix them both so the code shows `Total: 9`.',
      starter: r`apples <- 4
pears <- 5
total <- apples + Pears
cat("Total:" total, "\n")`,
      hint: 'R stops at the first error. Fix `Pears` (capital P), run again, then add the missing comma after `"Total:"`.',
      solution: r`apples <- 4
pears <- 5
total <- apples + pears
cat("Total:", total, "\n")`,
      tests: [
        ['total is 9', near('total', 9)],
        ['Shows Total: 9', prints('Total: 9')],
      ],
    }),
    task('expert', 'Three mistakes', {
      prompt: 'This program has three mistakes. Fix them all so it shows:\n\n```\nGuests: 12\nTables: 3\n```',
      starter: r`guests <- 12
per_table <- 4
tables <- ceiling(guest / per_table
cat("Guests:", guests, "\n")
Cat("Tables:", tables, "\n")`,
      hint: 'Fix one error at a time and run again: a misspelt variable, a bracket that isn\'t closed, and a function with a capital letter.',
      solution: r`guests <- 12
per_table <- 4
tables <- ceiling(guests / per_table)
cat("Guests:", guests, "\n")
cat("Tables:", tables, "\n")`,
      tests: [
        ['tables is 3', near('tables', 3)],
        ['Shows both lines', prints('Guests: 12', 'Tables: 3')],
      ],
    }),
    task('expert', 'In the wrong order', {
      prompt: 'This program gives an error because a line uses variables before they are made. Put the lines in an order that works, so it shows `Total: 10`.',
      starter: 'total <- price * qty\nprice <- 2.5\nqty <- 4\ncat("Total:", total, "\\n")\n',
      hint: 'R runs the lines top to bottom. `price` and `qty` must exist before `total` is worked out from them.',
      solution: 'price <- 2.5\nqty <- 4\ntotal <- price * qty\ncat("Total:", total, "\\n")',
      tests: [['Shows Total: 10', prints('Total: 10')]],
    }),
  ],
  questions: [
    mc('Which error does `totl * 2` give when only `total` exists?', ['`could not find function "totl"`', '`object \'totl\' not found`', '`unexpected symbol`', 'No error'], 1,
      'A name R doesn\'t know is an "object not found". Check the spelling.',
      { code: 'total <- 12\ntotl * 2', error: "object 'totl' not found" }),
    mc('Which error does `prnt(1)` give?', ['`could not find function "prnt"`', '`object \'prnt\' not found`', '`unexpected end of input`', '`[1] 1`'], 0,
      'A name followed by brackets is a function call, so R looks for a function.',
      { code: 'prnt(1)', error: 'could not find function "prnt"' }),
    mc('Which error does `round(2.5` give?', ['`unexpected numeric constant`', '`object not found`', '`unexpected end of input`', 'No error'], 2,
      'The bracket is never closed, so R reaches the end of the code still waiting for it.',
      { code: 'round(2.5', error: 'unexpected end of input' }),
    mc('Which error does `max(3 8)` give?', ['`unexpected numeric constant`', '`unexpected end of input`', '`non-numeric argument`', '`[1] 8`'], 0,
      'R finds the number 8 where it expected a comma or an operator.',
      { code: 'max(3 8)', error: 'unexpected numeric constant' }),
    mc('Which error does `"12" * 2` give?', ['`object not found`', '`non-numeric argument to binary operator`', '`unexpected string constant`', 'None: it gives 24'], 1,
      '`"12"` is text, and `*` needs numbers.',
      { code: '"12" * 2', error: 'non-numeric argument to binary operator' }),
    mc('What does `sqrt(-4)` give?', ['An error, and nothing runs after it', '`[1] 2`', '`NaN`, with a warning', '`[1] -2`'], 2,
      'R still gives an answer, `NaN` ("not a number"), and warns you. Code after it keeps running.',
      { code: 'suppressWarnings(sqrt(-4))', output: '[1] NaN' }),
    mc('A program has two mistakes. What does R report when you run it?', ['Both mistakes', 'Only the first one; it stops there', 'Only the last one', 'Nothing until both are fixed'], 1,
      'R stops at the first error, so fix it and run again to find the next.'),
    mc('A program has three mistakes. Why fix the first one, then run it again?', ['R stops at the first error, so the lines after it haven\'t been checked yet', 'R only reports one error a day', 'The others fix themselves', 'It doesn\'t matter'], 0,
      'Each run shows the next problem; fix one thing at a time.'),
    qShort('What does R call the result of `sqrt(-1)`, which means "not a number"?', 'NaN',
      '`NaN` stands for "not a number".'),
  ],
})
