// Errors and debugging: Checking input. Lesson, Try-it snippets, challenges and quiz.
import { MDN, is, makeTopic, mc, qShort, same, snippet, task, throwsWhen } from '../_builders.mjs'

export default makeTopic({
  id: 'checking_input',
  title: 'Checking input',
  paragraphs: [
    'Data from people, files and other programs is often not what you expect: a name with spaces around it, a number typed as `"12"` or `"twelve"`, a missing field. Checking it **at the edge**, as soon as it comes in, means the rest of your code can trust it.',
    'Numbers are the classic trap. `Number("12")` is `12`, but `Number("twelve")` is `NaN` ("not a number"), and `NaN` quietly spreads through every calculation. **`Number.isFinite`** is the reliable test: it is `false` for `NaN`, for `Infinity`, and for anything that isn\'t a number at all.',
    '```\nfor (const text of ["12", " 7 ", "twelve", "", "1e3"]) {\n  const n = Number(text)\n  console.log(JSON.stringify(text), n, Number.isFinite(n))\n}\n```',
    'Careful with `Number("")`, which is `0`, not `NaN`. Check for empty text separately.',
    'The other checks you will use most:',
    '- `typeof x === "string"` (or `"number"`, `"boolean"`, `"function"`);\n- `Array.isArray(x)` (because `typeof []` is `"object"`);\n- `Number.isInteger(n)` for whole numbers;\n- `text.trim() !== ""` for "not blank";\n- `x === null || x === undefined`, or simply `x == null`, for "missing".',
    'Put the checks in one function that either gives back clean data or says what is wrong. Here bad input throws; in the next stages you will see other ways to report it.',
    '```\nfunction parseQuantity(text) {\n  const trimmed = text.trim()\n  if (trimmed === "") throw new Error("Please enter a quantity")\n  const n = Number(trimmed)\n  if (!Number.isInteger(n) || n < 1) throw new RangeError(`Quantity must be a whole number of 1 or more, got "${text}"`)\n  return n\n}\nconsole.log(parseQuantity(" 3 "))\n```',
  ],
  sandboxCode: 'for (const text of ["12", " 7 ", "twelve", "", "1e3"]) {\n  const n = Number(text)\n  console.log(JSON.stringify(text), n, Number.isFinite(n))\n}',
  sandboxSnippets: [
    snippet('NaN spreads', 'const price = Number("abc")\nconsole.log(price, price * 2 + 1, price === price)'),
    snippet('typeof', 'console.log(typeof "a", typeof 1, typeof [], Array.isArray([]), typeof null)'),
    snippet('Whole numbers', 'console.log(Number.isInteger(5), Number.isInteger(5.5), Number.isInteger("5"))'),
    snippet('Missing', 'const user = { name: "Kim" }\nconsole.log(user.age == null, user.name == null)'),
  ],
  readMore: MDN('Web/JavaScript/Reference/Global_Objects/Number/isFinite', 'MDN: Number.isFinite()'),
  challenges: [
    task('easy', 'Is it a number?', {
      prompt: 'Write `isNumberText(text)`, returning whether `text` (after trimming) is not blank and turns into a finite number.',
      hint: 'Trim; if it is `""` return false; else `Number.isFinite(Number(t))`.',
      solution: 'function isNumberText(text) {\n  const t = text.trim()\n  if (t === "") return false\n  return Number.isFinite(Number(t))\n}',
      tests: [['"12"', is('isNumberText("12")', true)], ['" 7 "', is('isNumberText(" 7 ")', true)], ['"twelve"', is('isNumberText("twelve")', false)], ['""', is('isNumberText("")', false)], ['"  "', is('isNumberText("  ")', false)]],
    }),
    task('easy', 'Not blank', {
      prompt: 'Write `required(text)`, returning the trimmed text, or throwing an `Error("This field is required")` if it is blank.',
      hint: 'Trim first, then check for `""`.',
      solution: 'function required(text) {\n  const t = text.trim()\n  if (t === "") throw new Error("This field is required")\n  return t\n}',
      tests: [['Trims', is('required("  Ada ")', 'Ada')], ['Blank', throwsWhen('required("   ")', 'This field is required')]],
    }),
    task('easy', 'A real list', {
      prompt: 'Write `count(list)`, returning `list.length`, but throwing a `TypeError("Expected a list")` if `list` isn\'t an array.',
      hint: '`if (!Array.isArray(list)) throw new TypeError("Expected a list")`.',
      solution: 'function count(list) {\n  if (!Array.isArray(list)) throw new TypeError("Expected a list")\n  return list.length\n}',
      tests: [['Array', is('count([1, 2])', 2)], ['Text', throwsWhen('count("12")', 'TypeError: Expected a list')], ['Object', throwsWhen('count({ length: 3 })', 'Expected a list')]],
    }),
    task('medium', 'Quantity', {
      prompt: 'Write `parseQuantity(text)`, returning a whole number of 1 or more from the text, or throwing a `RangeError` for anything else (including blank text).',
      hint: 'Trim; reject `""`; `const n = Number(t)`; reject if `!Number.isInteger(n) || n < 1`.',
      solution: 'function parseQuantity(text) {\n  const t = text.trim()\n  const n = Number(t)\n  if (t === "" || !Number.isInteger(n) || n < 1) throw new RangeError(`Bad quantity: "${text}"`)\n  return n\n}',
      tests: [['" 3 "', is('parseQuantity(" 3 ")', 3)], ['"0"', throwsWhen('parseQuantity("0")', 'RangeError')], ['"2.5"', throwsWhen('parseQuantity("2.5")', 'RangeError')], ['"lots"', throwsWhen('parseQuantity("lots")', 'RangeError')], ['""', throwsWhen('parseQuantity("")', 'RangeError')]],
    }),
    task('medium', 'An email-ish check', {
      prompt: 'Write `looksLikeEmail(text)`: `true` when the trimmed text has exactly one `@`, with something before it and a `.` somewhere after it.',
      hint: 'Split at `@`: you need exactly 2 parts, the first not empty, the second including `"."`.',
      solution: 'function looksLikeEmail(text) {\n  const parts = text.trim().split("@")\n  return parts.length === 2 && parts[0] !== "" && parts[1].includes(".")\n}',
      tests: [['Good', is('looksLikeEmail("ada@example.com")', true)], ['No @', is('looksLikeEmail("ada.example.com")', false)], ['Two @', is('looksLikeEmail("a@b@c.com")', false)], ['Nothing before', is('looksLikeEmail("@example.com")', false)], ['No dot after', is('looksLikeEmail("ada@example")', false)]],
    }),
    task('medium', 'Default for missing', {
      prompt: 'Write `pageSize(options)`, returning `options.size` if it is a whole number from 1 to 100, else 20. `options` may be missing too.',
      hint: '`const size = options?.size`; check `Number.isInteger(size) && size >= 1 && size <= 100`.',
      solution: 'function pageSize(options) {\n  const size = options?.size\n  if (Number.isInteger(size) && size >= 1 && size <= 100) return size\n  return 20\n}',
      tests: [['Given', is('pageSize({ size: 50 })', 50)], ['Too big', is('pageSize({ size: 500 })', 20)], ['Text', is('pageSize({ size: "50" })', 20)], ['Missing', is('pageSize({})', 20)], ['No options', is('pageSize()', 20)]],
    }),
    task('hard', 'Clean a signup', {
      prompt: 'Write `cleanSignup(form)`, returning `{ name, age }` with `name` trimmed and `age` a number. Throw an `Error` with `Name is required` for a blank name, and a `RangeError` with `Age must be 13 to 120` otherwise.',
      hint: 'Trim and check the name first, then `Number(form.age)` with `Number.isInteger` and the range.',
      solution: 'function cleanSignup(form) {\n  const name = String(form.name ?? "").trim()\n  if (name === "") throw new Error("Name is required")\n  const age = Number(form.age)\n  if (!Number.isInteger(age) || age < 13 || age > 120) throw new RangeError("Age must be 13 to 120")\n  return { name, age }\n}',
      tests: [['Clean', same('cleanSignup({ name: "  Kim ", age: "30" })', '{ name: "Kim", age: 30 }')], ['No name', throwsWhen('cleanSignup({ name: " ", age: "30" })', 'Name is required')], ['Young', throwsWhen('cleanSignup({ name: "Al", age: "9" })', 'RangeError: Age must be 13 to 120')], ['Not a number', throwsWhen('cleanSignup({ name: "Al", age: "old" })', 'Age must be 13 to 120')]],
    }),
    task('hard', 'Numbers only', {
      prompt: 'Write `average(values)`: throw a `TypeError("Expected a list of numbers")` unless `values` is an array whose items are all finite numbers; throw a `RangeError("Nothing to average")` for an empty list; else return the average.',
      hint: '`Array.isArray(values) && values.every(Number.isFinite)`.',
      solution: 'function average(values) {\n  if (!Array.isArray(values) || !values.every(Number.isFinite)) throw new TypeError("Expected a list of numbers")\n  if (values.length === 0) throw new RangeError("Nothing to average")\n  return values.reduce((a, b) => a + b, 0) / values.length\n}',
      tests: [['Average', is('average([2, 4, 9])', 5)], ['Text in it', throwsWhen('average([1, "2"])', 'TypeError')], ['NaN in it', throwsWhen('average([1, NaN])', 'TypeError')], ['Not a list', throwsWhen('average(5)', 'TypeError')], ['Empty', throwsWhen('average([])', 'RangeError')]],
    }),
    task('expert', 'A price from text', {
      prompt: 'Write `parsePrice(text)`: accept text like `"4.5"`, `"$4.50"` or `" 12 "` (an optional `$` at the start), returning the number rounded to 2 places. Throw a `RangeError` for anything that isn\'t a finite number of 0 or more after that.',
      hint: 'Trim; if it starts with `$`, `slice(1)`; reject blank; `Number(...)`; check; `Math.round(n * 100) / 100`.',
      solution: 'function parsePrice(text) {\n  let t = text.trim()\n  if (t.startsWith("$")) t = t.slice(1)\n  const n = Number(t)\n  if (t === "" || !Number.isFinite(n) || n < 0) throw new RangeError(`Not a price: "${text}"`)\n  return Math.round(n * 100) / 100\n}',
      tests: [['"4.5"', is('parsePrice("4.5")', 4.5)], ['"$4.50"', is('parsePrice("$4.50")', 4.5)], ['" 12 "', is('parsePrice(" 12 ")', 12)], ['Rounded', is('parsePrice("1.239")', 1.24)], ['"$"', throwsWhen('parsePrice("$")', 'RangeError')], ['"-3"', throwsWhen('parsePrice("-3")', 'RangeError')], ['"free"', throwsWhen('parsePrice("free")', 'RangeError')]],
    }),
    task('expert', 'All the problems at once', {
      prompt: 'Write `problems(form)`, returning a list of every problem, not just the first: `"Name is required"` (blank name), `"Email looks wrong"` (no `@`), `"Age must be a number"` (not a finite number). An empty list means the form is fine.',
      hint: 'Start with `[]` and push a message for each failed check.',
      solution: 'function problems(form) {\n  const out = []\n  if (String(form.name ?? "").trim() === "") out.push("Name is required")\n  if (!String(form.email ?? "").includes("@")) out.push("Email looks wrong")\n  if (!Number.isFinite(Number(form.age)) || String(form.age ?? "").trim() === "") out.push("Age must be a number")\n  return out\n}',
      tests: [['Fine', same('problems({ name: "Kim", email: "k@x.io", age: "30" })', '[]')], ['All three', same('problems({ name: "", email: "kim", age: "old" })', '["Name is required", "Email looks wrong", "Age must be a number"]')], ['Blank age', same('problems({ name: "Kim", email: "k@x.io", age: "" })', '["Age must be a number"]')]],
    }),
  ],
  questions: [
    mc('What does `Number("twelve")` give?', ['NaN', '12', 'An error', 'undefined'], 0, 'Not a number, but no error.', { code: 'console.log(Number("twelve"))', output: 'NaN' }),
    mc('What does `Number("")` give?', ['0', 'NaN', 'An error', '""'], 0, 'A trap: check for blank text yourself.', { code: 'console.log(Number(""))', output: '0' }),
    mc('Which is `false` for `NaN` and `Infinity`?', ['`Number.isFinite`', '`typeof x === "number"`', '`Number.isNaN`', '`isNumber`'], 0, 'typeof NaN is "number"!'),
    mc('What is `typeof []`?', ['"object"', '"array"', '"list"', '"undefined"'], 0, 'Use Array.isArray for arrays.', { code: 'console.log(typeof [])', output: 'object' }),
    mc('What does `Number.isInteger(5.0)` give?', ['true', 'false', '5', 'An error'], 0, '5.0 is the same number as 5.', { code: 'console.log(Number.isInteger(5.0))', output: 'true' }),
    mc('What is `NaN * 2 + 1`?', ['NaN', '1', '0', 'An error'], 0, 'NaN spreads through sums.', { code: 'console.log(NaN * 2 + 1)', output: 'NaN' }),
    mc('Where is the best place to check input?', ['At the edge, as soon as it comes in', 'Just before showing it', 'Everywhere it is used', 'Nowhere'], 0, 'Then the rest of the code can trust it.'),
    mc('What is `x == null` true for?', ['null and undefined', 'Only null', '0 and ""', 'Everything falsy'], 0, 'The one handy use of ==.', { code: 'console.log(undefined == null, 0 == null)', output: 'true false' }),
    qShort('Which function tells you whether something is an array? (Array.…)', 'isArray', 'Array.isArray(x).'),
  ],
})
