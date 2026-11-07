// Arrays and objects side quest (easy): A shopping list. Lesson, Try-it snippets, challenges and quiz.
import { is, makeProject, mc, prints, same, snippet, task, uses } from '../_builders.mjs'

export default makeProject('easy', {
  id: 'proj_shopping_list',
  title: 'A shopping list',
  paragraphs: [
    'A shopping list that you add to, tick off and print. Each item is an object with a `name` and whether it is `done`:',
    '```\nconst list = [\n  { name: "milk", done: false },\n  { name: "eggs", done: true },\n  { name: "bread", done: false },\n]\n```',
    'Printed, it shows a box for each item, ticked when done, and how many are left:',
    '```text\n[ ] milk\n[x] eggs\n[ ] bread\n2 left to buy\n```',
    'Build it in steps; the last challenge does it all.',
  ],
  sandboxCode: 'const list = [{ name: "milk", done: false }, { name: "eggs", done: true }]\nfor (const item of list) {\n  console.log(item.done ? "[x]" : "[ ]", item.name)\n}',
  sandboxSnippets: [
    snippet('Add an item', 'const list = []\nlist.push({ name: "jam", done: false })\nconsole.log(list)'),
  ],
  challenges: [
    task('easy', 'Add an item', {
      prompt: 'Add `"apples"`, not done, to the end of `list`.',
      starter: 'const list = [{ name: "milk", done: false }]\n',
      hint: '`list.push({ name: "apples", done: false })`.',
      solution: 'const list = [{ name: "milk", done: false }]\nlist.push({ name: "apples", done: false })',
      tests: [['list is right', same('list', '[{ name: "milk", done: false }, { name: "apples", done: false }]')]],
      typedOk: true,
    }),
    task('easy', 'Tick one off', {
      prompt: 'Mark the item called `"eggs"` as done, finding it with a loop.',
      starter: 'const list = [\n  { name: "milk", done: false },\n  { name: "eggs", done: false },\n]\n',
      hint: '`for (const item of list) { if (item.name === "eggs") item.done = true }`.',
      solution: 'const list = [\n  { name: "milk", done: false },\n  { name: "eggs", done: false },\n]\nfor (const item of list) {\n  if (item.name === "eggs") {\n    item.done = true\n  }\n}',
      tests: [['eggs is done', 'list[1].done === true'], ['milk is not', 'list[0].done === false']],
    }),
    task('medium', 'How many left?', {
      prompt: 'Set `left` to how many items are not done.',
      starter: 'const list = [\n  { name: "milk", done: false },\n  { name: "eggs", done: true },\n  { name: "bread", done: false },\n]\n',
      hint: 'Count the items where `!item.done`.',
      solution: 'const list = [\n  { name: "milk", done: false },\n  { name: "eggs", done: true },\n  { name: "bread", done: false },\n]\nlet left = 0\nfor (const item of list) {\n  if (!item.done) {\n    left++\n  }\n}',
      tests: [['left is 2', is('left', 2)]],
    }),
    task('medium', 'Print the list', {
      prompt: 'Show each item as `[ ] milk` or `[x] eggs`.',
      starter: 'const list = [\n  { name: "milk", done: false },\n  { name: "eggs", done: true },\n]\n',
      hint: '`` `${item.done ? "[x]" : "[ ]"} ${item.name}` ``.',
      solution: 'const list = [\n  { name: "milk", done: false },\n  { name: "eggs", done: true },\n]\nfor (const item of list) {\n  console.log(`${item.done ? "[x]" : "[ ]"} ${item.name}`)\n}',
      tests: [['Shows the list', prints('[ ] milk', '[x] eggs')]],
    }),
    task('hard', 'Clear the done ones', {
      prompt: 'Set `remaining` to a new list of only the items that are not done.',
      starter: 'const list = [\n  { name: "milk", done: false },\n  { name: "eggs", done: true },\n  { name: "bread", done: false },\n]\n',
      hint: 'Push each item where `!item.done` into a new array.',
      solution: 'const list = [\n  { name: "milk", done: false },\n  { name: "eggs", done: true },\n  { name: "bread", done: false },\n]\nconst remaining = []\nfor (const item of list) {\n  if (!item.done) {\n    remaining.push(item)\n  }\n}',
      tests: [['remaining is right', same('remaining', '[{ name: "milk", done: false }, { name: "bread", done: false }]')]],
    }),
    task('expert', 'The whole list', {
      prompt: 'Add `"jam"` (not done), tick off `"bread"`, then show every item and `N left to buy` (or `All done!` when nothing is left).',
      starter: 'const list = [\n  { name: "milk", done: false },\n  { name: "eggs", done: true },\n  { name: "bread", done: false },\n]\n',
      hint: 'Push, then a loop to tick, then a loop that prints and counts, then the last line with `? :`.',
      solution: 'const list = [\n  { name: "milk", done: false },\n  { name: "eggs", done: true },\n  { name: "bread", done: false },\n]\nlist.push({ name: "jam", done: false })\nfor (const item of list) {\n  if (item.name === "bread") item.done = true\n}\nlet left = 0\nfor (const item of list) {\n  console.log(`${item.done ? "[x]" : "[ ]"} ${item.name}`)\n  if (!item.done) left++\n}\nconsole.log(left === 0 ? "All done!" : `${left} left to buy`)',
      tests: [['Shows the list', prints('[ ] milk', '[x] eggs', '[x] bread', '[ ] jam', '2 left to buy')]],
      typedOk: true,
    }),
  ],
  questions: [
    mc('After `const l = []` and `l.push({ name: "x" })`, what is `l.length`?', ['1', '0', '2', 'undefined'], 0, 'One object was pushed.'),
    mc('What does `false ? "[x]" : "[ ]"` give?', ['"[ ]"', '"[x]"', 'false', 'An error'], 0, 'The condition is false.', { code: 'console.log(false ? "[x]" : "[ ]")', output: '[ ]' }),
    mc('In `for (const item of list)`, can you change `item.done`?', ['Yes: item is the object in the list', 'No: item is a copy', 'Only with let', 'Only after the loop'], 0, 'The loop gives the objects themselves, so changes stick.'),
    mc('What does `!true` give?', ['false', 'true', 'undefined', '0'], 0, '! turns it around.', { code: 'console.log(!true)', output: 'false' }),
    mc('Which keeps the original list as it was?', ['Pushing the wanted items into a new array', 'splice in a loop', 'Setting length to 0', 'delete'], 0, 'A new array leaves the old one alone.'),
    mc('What is `[{ a: 1 }, { a: 2 }][1].a`?', ['2', '1', '{ a: 2 }', 'undefined'], 0, 'The second object\'s a.', { code: 'console.log([{ a: 1 }, { a: 2 }][1].a)', output: '2' }),
  ],
})
