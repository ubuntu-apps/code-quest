// Arrays and objects side quest (medium): A gradebook. Lesson, Try-it snippets, challenges and quiz.
import { is, makeProject, mc, prints, same, snippet, task, uses } from '../_builders.mjs'

export default makeProject('medium', {
  id: 'proj_gradebook',
  title: 'A gradebook',
  paragraphs: [
    'A teacher\'s gradebook: each student has a name and a list of test scores.',
    '```\nconst students = [\n  { name: "Ana", scores: [92, 88, 95] },\n  { name: "Ben", scores: [71, 64, 80] },\n  { name: "Cal", scores: [55, 61, 48] },\n]\n```',
    'The report shows each student\'s average (rounded to 1 decimal) and grade, then the class\'s best:',
    '```text\nAna: 91.7 (A)\nBen: 71.7 (B)\nCal: 54.7 (C)\nTop of the class: Ana\n```',
    'Grades are A for 85 and up, B for 70 and up, C for 50 and up, and F below that.',
  ],
  sandboxCode: 'const scores = [92, 88, 95]\nlet total = 0\nfor (const s of scores) total += s\nconsole.log((total / scores.length).toFixed(1))',
  sandboxSnippets: [
    snippet('One student', 'const s = { name: "Ana", scores: [92, 88, 95] }\nconsole.log(s.name, s.scores.length, s.scores[0])'),
  ],
  challenges: [
    task('easy', 'One average', {
      prompt: 'Set `average` to the average of `scores`.',
      starter: 'const scores = [92, 88, 95]\n',
      hint: 'Add them up in a loop, then divide by `scores.length`.',
      solution: 'const scores = [92, 88, 95]\nlet total = 0\nfor (const s of scores) {\n  total += s\n}\nconst average = total / scores.length',
      tests: [['average is right', 'Math.abs(average - 275 / 3) < 1e-9']],
    }),
    task('easy', 'A grade', {
      prompt: 'Set `grade` for `average`: `"A"` for 85 and up, `"B"` for 70, `"C"` for 50, else `"F"`.',
      starter: 'const average = 71.7\n',
      hint: 'An `if` / `else if` chain, highest first.',
      solution: 'const average = 71.7\nlet grade\nif (average >= 85) {\n  grade = "A"\n} else if (average >= 70) {\n  grade = "B"\n} else if (average >= 50) {\n  grade = "C"\n} else {\n  grade = "F"\n}',
      tests: [['grade is B', is('grade', 'B')]],
      alt: 'const average = 49.9',
    }),
    task('medium', 'Every average', {
      prompt: 'Set `averages` to an array of each student\'s average, in order.',
      starter: 'const students = [\n  { name: "Ana", scores: [90, 80] },\n  { name: "Ben", scores: [70, 60] },\n]\n',
      hint: 'For each student, total `s.scores` with an inner loop, then push `total / s.scores.length`.',
      solution: 'const students = [\n  { name: "Ana", scores: [90, 80] },\n  { name: "Ben", scores: [70, 60] },\n]\nconst averages = []\nfor (const s of students) {\n  let total = 0\n  for (const score of s.scores) {\n    total += score\n  }\n  averages.push(total / s.scores.length)\n}',
      tests: [['averages is right', same('averages', '[85, 65]')]],
    }),
    task('medium', 'Report lines', {
      prompt: 'Show each student as `Ana: 91.7`, with the average to 1 decimal place.',
      starter: 'const students = [\n  { name: "Ana", scores: [92, 88, 95] },\n  { name: "Ben", scores: [71, 64, 80] },\n]\n',
      hint: 'Work out each average, then `` `${s.name}: ${average.toFixed(1)}` ``.',
      solution: 'const students = [\n  { name: "Ana", scores: [92, 88, 95] },\n  { name: "Ben", scores: [71, 64, 80] },\n]\nfor (const s of students) {\n  let total = 0\n  for (const score of s.scores) {\n    total += score\n  }\n  const average = total / s.scores.length\n  console.log(`${s.name}: ${average.toFixed(1)}`)\n}',
      tests: [['Shows the lines', prints('Ana: 91.7', 'Ben: 71.7')]],
    }),
    task('hard', 'Top of the class', {
      prompt: 'Set `top` to the name of the student with the highest average.',
      starter: 'const students = [\n  { name: "Ana", scores: [92, 88, 95] },\n  { name: "Ben", scores: [71, 64, 80] },\n  { name: "Cal", scores: [99, 97, 90] },\n]\n',
      hint: 'Keep the best average so far and its name, as you work out each one.',
      solution: 'const students = [\n  { name: "Ana", scores: [92, 88, 95] },\n  { name: "Ben", scores: [71, 64, 80] },\n  { name: "Cal", scores: [99, 97, 90] },\n]\nlet top = null\nlet best = -Infinity\nfor (const s of students) {\n  let total = 0\n  for (const score of s.scores) {\n    total += score\n  }\n  const average = total / s.scores.length\n  if (average > best) {\n    best = average\n    top = s.name\n  }\n}',
      tests: [['top is Cal', is('top', 'Cal')]],
    }),
    task('expert', 'The report', {
      prompt: 'Show the whole report: each student as `Ana: 91.7 (A)`, then `Top of the class: Ana`.',
      starter: 'const students = [\n  { name: "Ana", scores: [92, 88, 95] },\n  { name: "Ben", scores: [71, 64, 80] },\n  { name: "Cal", scores: [55, 61, 48] },\n]\n',
      hint: 'One loop: work out the average, the grade (with `if`/`else if`), show the line, and keep the best.',
      solution: 'const students = [\n  { name: "Ana", scores: [92, 88, 95] },\n  { name: "Ben", scores: [71, 64, 80] },\n  { name: "Cal", scores: [55, 61, 48] },\n]\nlet top = null\nlet best = -Infinity\nfor (const s of students) {\n  let total = 0\n  for (const score of s.scores) {\n    total += score\n  }\n  const average = total / s.scores.length\n  let grade\n  if (average >= 85) {\n    grade = "A"\n  } else if (average >= 70) {\n    grade = "B"\n  } else if (average >= 50) {\n    grade = "C"\n  } else {\n    grade = "F"\n  }\n  console.log(`${s.name}: ${average.toFixed(1)} (${grade})`)\n  if (average > best) {\n    best = average\n    top = s.name\n  }\n}\nconsole.log(`Top of the class: ${top}`)',
      tests: [['Shows the report', prints('Ana: 91.7 (A)', 'Ben: 71.7 (B)', 'Cal: 54.7 (C)', 'Top of the class: Ana')]],
    }),
  ],
  questions: [
    mc('What is the average of `[90, 80]`?', ['85', '170', '80', '90'], 0, '(90 + 80) / 2.', { code: 'console.log((90 + 80) / 2)', output: '85' }),
    mc('What does `(275 / 3).toFixed(1)` give?', ['"91.7"', '"91.6"', '91.7', '"92"'], 0, '91.666… rounded to 1 decimal.', { code: 'console.log((275 / 3).toFixed(1))', output: '91.7' }),
    mc('In `students[0].scores[2]`, what is `[2]` the index of?', ['A score in the first student\'s list', 'A student', 'A letter of the name', 'Nothing'], 0, 'students[0] is the student; .scores is their array.'),
    mc('Why do you need two loops for every student\'s average?', ['One over students, one over each student\'s scores', 'JavaScript needs two loops for arrays', 'To sort them', 'You don\'t'], 0, 'The data is nested, so the loops are too.'),
    mc('Why start the best average at `-Infinity`?', ['So the first student always beats it', 'To allow negative scores', 'It is required', 'To round it'], 0, 'Any average is bigger.'),
    mc('Which grade is 70 exactly?', ['B', 'A', 'C', 'F'], 0, '70 and up is a B.'),
  ],
})
