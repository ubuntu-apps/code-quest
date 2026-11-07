// Decisions and loops side quest (easy): FizzBuzz. Lesson, Try-it snippets, challenges and quiz.
import { is, makeProject, mc, prints, snippet, task, uses } from '../_builders.mjs'

export default makeProject('easy', {
  id: 'proj_fizzbuzz',
  title: 'FizzBuzz',
  paragraphs: [
    'FizzBuzz is a classic programming puzzle, and a favourite in job interviews. Count from 1 to a number, but:',
    '- for numbers that divide by 3, say `Fizz` instead;\n- for numbers that divide by 5, say `Buzz`;\n- for numbers that divide by both, say `FizzBuzz`.',
    'Up to 15 it goes:',
    '```text\n1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n```',
    'The trap is the order of the checks: a number like 15 divides by 3 too, so test "both" first (or build the word up piece by piece).',
  ],
  sandboxCode: 'for (let i = 1; i <= 15; i++) {\n  console.log(i, i % 3 === 0, i % 5 === 0)\n}',
  sandboxSnippets: [
    snippet('Divides by?', 'const n = 15\nconsole.log(n % 3 === 0, n % 5 === 0, n % 15 === 0)'),
  ],
  challenges: [
    task('easy', 'Fizz or not', {
      prompt: 'Set `word` to `"Fizz"` if `n` divides by 3, otherwise to `n` as text.',
      starter: 'const n = 9\n',
      hint: '`n % 3 === 0 ? "Fizz" : String(n)`.',
      solution: 'const n = 9\nconst word = n % 3 === 0 ? "Fizz" : String(n)',
      tests: [['word is Fizz', is('word', 'Fizz')]],
      alt: 'const n = 10',
    }),
    task('easy', 'All four cases', {
      prompt: 'Set `word` for `n`: `"FizzBuzz"`, `"Fizz"`, `"Buzz"`, or `n` as text.',
      starter: 'const n = 30\n',
      hint: 'Check `n % 15 === 0` first, then 3, then 5.',
      solution: 'const n = 30\nlet word\nif (n % 15 === 0) {\n  word = "FizzBuzz"\n} else if (n % 3 === 0) {\n  word = "Fizz"\n} else if (n % 5 === 0) {\n  word = "Buzz"\n} else {\n  word = String(n)\n}',
      tests: [['word is FizzBuzz', is('word', 'FizzBuzz')]],
      alt: 'const n = 25',
    }),
    task('medium', 'FizzBuzz to 15', {
      prompt: 'Show FizzBuzz from 1 to 15, one per line.',
      hint: 'A `for` loop from 1 to 15, with the four cases inside.',
      solution: 'for (let i = 1; i <= 15; i++) {\n  if (i % 15 === 0) {\n    console.log("FizzBuzz")\n  } else if (i % 3 === 0) {\n    console.log("Fizz")\n  } else if (i % 5 === 0) {\n    console.log("Buzz")\n  } else {\n    console.log(i)\n  }\n}',
      tests: [['Shows FizzBuzz to 15', prints('1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8', 'Fizz', 'Buzz', '11', 'Fizz', '13', '14', 'FizzBuzz')], ['Uses a loop', '/\\b(for|while)\\s*\\(/.test(_cq_code)']],
      typedOk: true,
    }),
    task('medium', 'Count the Fizzes', {
      prompt: 'Set `fizzes` to how many times `Fizz` on its own (not `FizzBuzz`) comes up from 1 to `n`.',
      starter: 'const n = 50\n',
      hint: 'Count numbers that divide by 3 but not by 5: `i % 3 === 0 && i % 5 !== 0`.',
      solution: 'const n = 50\nlet fizzes = 0\nfor (let i = 1; i <= n; i++) {\n  if (i % 3 === 0 && i % 5 !== 0) {\n    fizzes++\n  }\n}',
      tests: [['fizzes is 13', is('fizzes', 13)]],
    }),
    task('hard', 'Build the word', {
      prompt: 'Show FizzBuzz from 1 to `n` without testing 15: build `word` with `+=` (add `Fizz` if it divides by 3, then `Buzz` if by 5), and show the number when `word` is still empty.',
      starter: 'const n = 15\n',
      hint: '`let word = ""`; `if (i % 3 === 0) word += "Fizz"`; `if (i % 5 === 0) word += "Buzz"`; `console.log(word || i)`.',
      solution: 'const n = 15\nfor (let i = 1; i <= n; i++) {\n  let word = ""\n  if (i % 3 === 0) word += "Fizz"\n  if (i % 5 === 0) word += "Buzz"\n  console.log(word || i)\n}',
      tests: [['Shows FizzBuzz to 15', prints('1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8', 'Fizz', 'Buzz', '11', 'Fizz', '13', '14', 'FizzBuzz')], ['Doesn\'t test 15', '!_cq_code.includes("15 ===") && !_cq_code.includes("% 15")']],
      alt: 'const n = 20',
    }),
    task('expert', 'Your own rules', {
      prompt: 'Make FizzBuzz with any two numbers and words: `a` with `wordA` and `b` with `wordB`. Show it from 1 to `n` on one line, separated by spaces.',
      starter: 'const a = 2\nconst wordA = "Ping"\nconst b = 3\nconst wordB = "Pong"\nconst n = 6\n',
      hint: 'Build each word as in the last challenge, add it (or the number) to a `line` with a space, then show `line.trim()`.',
      solution: 'const a = 2\nconst wordA = "Ping"\nconst b = 3\nconst wordB = "Pong"\nconst n = 6\nlet line = ""\nfor (let i = 1; i <= n; i++) {\n  let word = ""\n  if (i % a === 0) word += wordA\n  if (i % b === 0) word += wordB\n  line += (word || i) + " "\n}\nconsole.log(line.trim())',
      tests: [['Shows the line', prints('1 Ping Pong Ping 5 PingPong')]],
      alt: 'const a = 4\nconst wordA = "Tick"\nconst b = 5\nconst wordB = "Tock"\nconst n = 20',
    }),
  ],
  questions: [
    mc('What is FizzBuzz for 9?', ['Fizz', 'Buzz', 'FizzBuzz', '9'], 0, '9 divides by 3 but not 5.'),
    mc('What is FizzBuzz for 20?', ['Buzz', 'Fizz', 'FizzBuzz', '20'], 0, '20 divides by 5 but not 3.'),
    mc('Why test "divides by 15" before "divides by 3"?', ['15 also divides by 3, so it would stop at Fizz', 'Bigger numbers go first', 'It runs faster', 'It doesn\'t matter'], 0,
      'The first true condition wins.'),
    mc('What does `"" || 7` give?', ['7', '""', 'true', 'false'], 0,
      'An empty string is falsy, so || gives 7.', { code: 'console.log("" || 7)', output: '7' }),
    mc('How many numbers from 1 to 30 give FizzBuzz?', ['2', '1', '3', '6'], 0, '15 and 30.'),
    mc('After `let w = ""; if (6 % 3 === 0) w += "Fizz"; if (6 % 5 === 0) w += "Buzz"`, what is `w`?', ['"Fizz"', '"FizzBuzz"', '"Buzz"', '""'], 0,
      '6 divides by 3 only.', { code: 'let w = ""; if (6 % 3 === 0) w += "Fizz"; if (6 % 5 === 0) w += "Buzz"\nconsole.log(w)', output: 'Fizz' }),
  ],
})
