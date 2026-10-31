// First steps in R: Your first R code.
import { R_INTRO, avoids, code, makeTopic, mc, prints, qShort, r, snippet, task, uses } from '../_builders.mjs'

export default makeTopic({
  id: 'first_code',
  title: 'Your first R code',
  paragraphs: [
    'R is a programming language made for working with data. Scientists, analysts, journalists and students use it to tidy data, summarise it, run statistics and make charts. In CodeQuest, R runs right here in your browser: type code, press **Run**, and the result appears underneath.',
    'The simplest R code is a calculation. R works it out and shows the answer:',
    code('2 + 3', '10 * 4'),
    'R shows `[1] 5` and `[1] 40`. The `[1]` is not part of the answer: it means "this line starts with the first value". Later you will meet results with many values, where it helps you count them. For now, read `[1] 5` as "the answer is 5".',
    'To show text, put it in quotes and give it to `print()`. R shows text with its quotes, so you can tell it is text:',
    code('print("Hello, R!")'),
    'That shows `[1] "Hello, R!"`. When you want just the words, without the `[1]` and the quotes, use `cat()`. `cat()` doesn\'t start a new line by itself, so end the text with `\\n`, which means "new line":',
    code(r`cat("Hello, R!\n")`),
    '`cat()` can show several things at once, separated by commas. It puts a space between them, and it works out any maths first: `cat("2 + 3 =", 2 + 3, "\\n")` shows `2 + 3 = 5`.',
    'A line that starts with `#` is a **comment**. R skips it: comments are notes for people reading your code. A comment can also go at the end of a line.',
    code('# the number of days in a year', '365  # not a leap year'),
    'R is **case-sensitive**: `print` works, but `Print` gives the error `could not find function "Print"`. Every challenge checks the result of your code, so read errors carefully, fix the line, and run it again.',
  ],
  sandboxCode: r`2 + 3
10 * 4
print("Hello, R!")
cat("Hello, R!\n")
cat("2 + 3 =", 2 + 3, "\n")`,
  sandboxSnippets: [
    snippet('R as a calculator', '7 + 8\n100 - 1\n6 * 7'),
    snippet('print or cat', r`print("Good morning")
cat("Good morning\n")`),
    snippet('Text and maths', r`cat("6 * 7 =", 6 * 7, "\n")
cat("6 * 7 =", "6 * 7", "\n")`),
    snippet('Comments', '# R skips this line\n1 + 1  # and this note'),
    snippet('Read an error', '# Run this, read the error, then fix the capital P.\nPrint("Hi")'),
  ],
  readMore: R_INTRO('Introduction-and-preliminaries', 'An Introduction to R: getting started'),
  challenges: [
    task('easy', 'Add two numbers', {
      prompt: 'Show the result of `17 + 25`. Let R do the sum.',
      hint: 'Type the sum on its own line and run it. R shows `[1] 42`.',
      solution: '17 + 25',
      tests: [
        ['Shows [1] 42', prints('[1] 42')],
        ['Lets R do the sum', uses('+')],
      ],
    }),
    task('easy', 'Print some text', {
      prompt: 'Use `print()` to show the text `Hello, R!`.',
      starter: 'print()',
      hint: 'Text goes in quotes inside the brackets: `print("Hello, R!")`.',
      solution: 'print("Hello, R!")',
      tests: [['Shows [1] "Hello, R!"', prints('[1] "Hello, R!"')]],
    }),
    task('easy', 'Just the words', {
      prompt: 'Show `Welcome to CodeQuest` without the `[1]` and without quotes.',
      hint: 'Use `cat()`, and end the text with `\\n`: `cat("Welcome to CodeQuest\\n")`.',
      solution: r`cat("Welcome to CodeQuest\n")`,
      tests: [
        ['Shows Welcome to CodeQuest', prints('Welcome to CodeQuest')],
        ['Uses cat()', uses('cat(')],
      ],
    }),
    task('medium', 'Minutes in a day', {
      prompt: 'How many minutes are in a day? Show 24 hours times 60 minutes, using `*` for multiplication.',
      hint: '`24 * 60`',
      solution: '24 * 60',
      tests: [
        ['Shows [1] 1440', prints('[1] 1440')],
        ['Lets R multiply', uses('*')],
      ],
    }),
    task('medium', 'Two lines', {
      prompt: 'Show `Ready` on one line and `Set` on the next, without `[1]` or quotes.',
      starter: r`cat("Ready\n")`,
      hint: 'Each `cat()` needs its own `\\n` at the end. Add a second `cat()` for `Set`.',
      solution: r`cat("Ready\n")
cat("Set\n")`,
      tests: [['Shows Ready, then Set', prints('Ready', 'Set')]],
    }),
    task('medium', 'Fix the capital letter', {
      prompt: 'This line fails. Run it, read the error, then fix it so it shows `[1] "Welcome"`.',
      starter: 'Print("Welcome")',
      hint: 'R is case-sensitive. The function is `print`, all lowercase.',
      solution: 'print("Welcome")',
      tests: [['Shows [1] "Welcome"', prints('[1] "Welcome"')]],
    }),
    task('hard', 'Fix the quotes', {
      prompt: 'This line has a missing quote. Fix it so it shows `[1] "R is fun"`.',
      starter: 'print("R is fun)',
      hint: 'Text needs a quote at both ends. One is missing before the closing bracket.',
      solution: 'print("R is fun")',
      tests: [['Shows [1] "R is fun"', prints('[1] "R is fun"')]],
    }),
    task('hard', 'Comment it out', {
      prompt: 'Turn the middle line into a comment, so only the other two lines are shown. Don\'t delete it.',
      starter: r`cat("Keep me\n")
cat("Skip me\n")
cat("Keep me too\n")`,
      hint: 'Put `#` at the start of the middle line. R skips everything after a `#`.',
      solution: r`cat("Keep me\n")
# cat("Skip me\n")
cat("Keep me too\n")`,
      tests: [
        ['Shows only the first and last lines', prints('Keep me', 'Keep me too')],
        ['Keeps the middle line as a comment', uses('Skip me')],
      ],
    }),
    task('expert', 'Text and a sum', {
      prompt: 'Show `7 + 8 = 15` with one `cat()`. Write `7 + 8 =` as text and let R work out the `15`.',
      hint: 'Give `cat()` the text, the sum and `"\\n"`, separated by commas: `cat("7 + 8 =", 7 + 8, "\\n")`.',
      solution: r`cat("7 + 8 =", 7 + 8, "\n")`,
      tests: [
        ['Shows 7 + 8 = 15', prints('7 + 8 = 15')],
        ['Lets R work out the 15', avoids('15')],
      ],
    }),
  ],
  questions: [
    mc('What does `3 + 4` show?', ['`7`', '`[1] 7`', '`3 + 4`', '`[7]`'], 1,
      'R works out the sum and shows it after `[1]`, which marks the first value of the result.',
      { code: '3 + 4', output: '[1] 7' }),
    mc('What does `print("hi")` show?', ['`hi`', '`[1] hi`', '`[1] "hi"`', '`"hi"`'], 2,
      '`print()` shows text with its quotes, after `[1]`.',
      { code: 'print("hi")', output: '[1] "hi"' }),
    mc('What does `cat("hi\\n")` show?', ['`hi`', '`[1] "hi"`', '`"hi"`', '`[1] hi`'], 0,
      '`cat()` shows just the text: no `[1]` and no quotes. `\\n` ends the line.',
      { code: r`cat("hi\n")`, output: 'hi' }),
    mc('What does `"2 + 3"` show?', ['`[1] 5`', '`[1] "2 + 3"`', '`5`', 'An error'], 1,
      'In quotes, `2 + 3` is just text, so R shows the text instead of working out the sum.',
      { code: '"2 + 3"', output: '[1] "2 + 3"' }),
    mc('What does `cat("Total:", 4 + 5, "\\n")` show?', ['`Total:9`', '`Total: 4 + 5`', '`Total: 9`', '`[1] "Total: 9"`'], 2,
      '`cat()` works out `4 + 5` first and puts a space between the things it shows.',
      { code: r`cat("Total:", 4 + 5, "\n")`, output: 'Total: 9' }),
    mc('What does R do with the line `# add the tips`?', ['Shows it', 'Gives an error', 'Ignores it: it is a comment', 'Adds the tips'], 2,
      'Everything after `#` is a comment, a note for people. R skips it.',
      { code: '# add the tips\n1', output: '[1] 1' }),
    mc('What does `Print(5)` give?', ['`[1] 5`', 'The error `could not find function "Print"`', 'The error `object \'Print\' not found`', '`5`'], 1,
      'R is case-sensitive: the function is `print`. There is no function called `Print`.',
      { code: 'Print(5)', error: 'could not find function "Print"' }),
    mc('In `[1] 40`, what is the `[1]`?', ['Part of the answer', 'An error number', 'It marks the first value of the result', 'The number of lines'], 2,
      'Results can hold many values. `[1]` says that the line starts with the first one.'),
    qShort('Which function shows text without `[1]` and quotes?', 'cat',
      '`cat()` shows just the words. `print()` shows `[1]` and the quotes.'),
  ],
})
