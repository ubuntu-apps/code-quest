// Errors and debugging side quest (hard): A safe calculator. Lesson, Try-it snippets, challenges and quiz.
import { is, makeProject, mc, same, snippet, task, throwsWhen } from '../_builders.mjs'

export default makeProject('hard', {
  id: 'proj_safe_calculator',
  title: 'A safe calculator',
  paragraphs: [
    'A calculator takes text like `"12 * 3"` and gives the answer. People will also type `"12 *"`, `"ten + 2"`, `"5 / 0"` and `"2 ^ 3"`, and the calculator must never crash: it should say clearly what is wrong.',
    'Each sum is a number, a space, an operator (`+ - * /`), a space and a number. Build it in layers:',
    '- `parse(text)` splits the text and checks it, throwing a `SyntaxError` for the wrong shape or an unknown operator, and a `TypeError` for something that isn\'t a number;\n- `apply(a, op, b)` does the maths, throwing a `RangeError` for dividing by zero;\n- `calculate(text)` puts them together and returns a result object, `{ ok: true, value }` or `{ ok: false, error }`, so nothing escapes.',
    '```text\ncalculate("12 * 3")  → { ok: true, value: 36 }\ncalculate("5 / 0")   → { ok: false, error: "RangeError: Cannot divide by zero" }\ncalculate("2 ^ 3")   → { ok: false, error: "SyntaxError: Unknown operator ^" }\n```',
  ],
  sandboxCode: 'const parts = " 12 * 3 ".trim().split(" ")\nconsole.log(parts, parts.length)',
  sandboxSnippets: [
    snippet('Operators as functions', 'const ops = { "+": (a, b) => a + b, "*": (a, b) => a * b }\nconsole.log(ops["*"](4, 5), "^" in ops)'),
  ],
  challenges: [
    task('easy', 'The operators', {
      prompt: 'Make `ops`, an object from each of `"+"`, `"-"`, `"*"` and `"/"` to a function of two numbers doing that sum.',
      hint: '`const ops = { "+": (a, b) => a + b, … }`.',
      solution: 'const ops = {\n  "+": (a, b) => a + b,\n  "-": (a, b) => a - b,\n  "*": (a, b) => a * b,\n  "/": (a, b) => a / b,\n}',
      tests: [['+', is('ops["+"](2, 3)', 5)], ['-', is('ops["-"](2, 3)', -1)], ['*', is('ops["*"](2, 3)', 6)], ['/', is('ops["/"](3, 2)', 1.5)]],
    }),
    task('easy', 'No dividing by zero', {
      prompt: 'Write `apply(a, op, b)` using `ops`, throwing a `RangeError("Cannot divide by zero")` for `/` by 0.',
      starter: 'const ops = {\n  "+": (a, b) => a + b,\n  "-": (a, b) => a - b,\n  "*": (a, b) => a * b,\n  "/": (a, b) => a / b,\n}\n',
      hint: 'A guard clause, then `return ops[op](a, b)`.',
      solution: 'const ops = {\n  "+": (a, b) => a + b,\n  "-": (a, b) => a - b,\n  "*": (a, b) => a * b,\n  "/": (a, b) => a / b,\n}\nfunction apply(a, op, b) {\n  if (op === "/" && b === 0) throw new RangeError("Cannot divide by zero")\n  return ops[op](a, b)\n}',
      tests: [['Times', is('apply(4, "*", 5)', 20)], ['Divide', is('apply(9, "/", 3)', 3)], ['By zero', throwsWhen('apply(5, "/", 0)', 'RangeError: Cannot divide by zero')]],
    }),
    task('medium', 'Parse the sum', {
      prompt: 'Write `parse(text)`, returning `{ a, op, b }` (with numbers). Throw a `SyntaxError("Expected: number operator number")` unless the trimmed text splits at spaces into exactly 3 parts; a `SyntaxError("Unknown operator OP")` for an operator not in `+ - * /`; a `TypeError("Not a number: PART")` for a part that isn\'t a finite number.',
      hint: 'Split; check the length; check `"+-*/".includes(op)` and `op.length === 1`; then convert and check each number.',
      solution: 'function parse(text) {\n  const parts = text.trim().split(" ")\n  if (parts.length !== 3) throw new SyntaxError("Expected: number operator number")\n  const [left, op, right] = parts\n  if (op.length !== 1 || !"+-*/".includes(op)) throw new SyntaxError(`Unknown operator ${op}`)\n  for (const part of [left, right]) {\n    if (!Number.isFinite(Number(part))) throw new TypeError(`Not a number: ${part}`)\n  }\n  return { a: Number(left), op, b: Number(right) }\n}',
      tests: [['Good', same('parse(" 12 * 3 ")', '{ a: 12, op: "*", b: 3 }')], ['Short', throwsWhen('parse("12 *")', 'SyntaxError: Expected: number operator number')], ['Operator', throwsWhen('parse("2 ^ 3")', 'SyntaxError: Unknown operator ^')], ['Number', throwsWhen('parse("ten + 2")', 'TypeError: Not a number: ten')]],
    }),
    task('medium', 'Never crash', {
      prompt: 'Write `calculate(text)`, using `parse` and `apply`, and returning `{ ok: true, value }` or `{ ok: false, error: "Name: message" }`.',
      starter: 'function parse(text) {\n  const parts = text.trim().split(" ")\n  if (parts.length !== 3) throw new SyntaxError("Expected: number operator number")\n  const [left, op, right] = parts\n  if (op.length !== 1 || !"+-*/".includes(op)) throw new SyntaxError(`Unknown operator ${op}`)\n  for (const part of [left, right]) {\n    if (!Number.isFinite(Number(part))) throw new TypeError(`Not a number: ${part}`)\n  }\n  return { a: Number(left), op, b: Number(right) }\n}\nconst ops = { "+": (a, b) => a + b, "-": (a, b) => a - b, "*": (a, b) => a * b, "/": (a, b) => a / b }\nfunction apply(a, op, b) {\n  if (op === "/" && b === 0) throw new RangeError("Cannot divide by zero")\n  return ops[op](a, b)\n}\n',
      hint: '`try { const { a, op, b } = parse(text); return { ok: true, value: apply(a, op, b) } } catch (e) { … }`.',
      solution: 'function parse(text) {\n  const parts = text.trim().split(" ")\n  if (parts.length !== 3) throw new SyntaxError("Expected: number operator number")\n  const [left, op, right] = parts\n  if (op.length !== 1 || !"+-*/".includes(op)) throw new SyntaxError(`Unknown operator ${op}`)\n  for (const part of [left, right]) {\n    if (!Number.isFinite(Number(part))) throw new TypeError(`Not a number: ${part}`)\n  }\n  return { a: Number(left), op, b: Number(right) }\n}\nconst ops = { "+": (a, b) => a + b, "-": (a, b) => a - b, "*": (a, b) => a * b, "/": (a, b) => a / b }\nfunction apply(a, op, b) {\n  if (op === "/" && b === 0) throw new RangeError("Cannot divide by zero")\n  return ops[op](a, b)\n}\nfunction calculate(text) {\n  try {\n    const { a, op, b } = parse(text)\n    return { ok: true, value: apply(a, op, b) }\n  } catch (e) {\n    return { ok: false, error: `${e.name}: ${e.message}` }\n  }\n}',
      tests: [['Works', same('calculate("12 * 3")', '{ ok: true, value: 36 }')], ['Zero', same('calculate("5 / 0")', '{ ok: false, error: "RangeError: Cannot divide by zero" }')], ['Operator', same('calculate("2 ^ 3")', '{ ok: false, error: "SyntaxError: Unknown operator ^" }')]],
    }),
    task('hard', 'Friendly words', {
      prompt: 'Write `explain(result)`: for an ok result, `= VALUE`; for errors, `Check the layout, like 2 + 3` (SyntaxError), `Use numbers, not words` (TypeError), `You can\'t divide by zero` (RangeError).',
      hint: 'Check `result.ok`, then which name the error text starts with.',
      solution: 'function explain(result) {\n  if (result.ok) return `= ${result.value}`\n  if (result.error.startsWith("SyntaxError")) return "Check the layout, like 2 + 3"\n  if (result.error.startsWith("TypeError")) return "Use numbers, not words"\n  if (result.error.startsWith("RangeError")) return "You can\'t divide by zero"\n  return "Something went wrong"\n}',
      tests: [['Value', is('explain({ ok: true, value: 36 })', '= 36')], ['Syntax', is('explain({ ok: false, error: "SyntaxError: x" })', 'Check the layout, like 2 + 3')], ['Type', is('explain({ ok: false, error: "TypeError: x" })', 'Use numbers, not words')], ['Range', is('explain({ ok: false, error: "RangeError: x" })', 'You can\'t divide by zero')]],
    }),
    task('expert', 'A tape of sums', {
      prompt: 'Write `tape(lines)`, which calculates each line and returns `{ results, total, failed }`: `results` are `LINE = VALUE` or `LINE: ERROR` (error message only), `total` adds up the good values, and `failed` counts the bad lines.',
      starter: 'const ops = { "+": (a, b) => a + b, "-": (a, b) => a - b, "*": (a, b) => a * b, "/": (a, b) => a / b }\nfunction calculate(text) {\n  const parts = text.trim().split(" ")\n  if (parts.length !== 3) return { ok: false, error: "Expected: number operator number" }\n  const [left, op, right] = parts\n  if (!(op in ops)) return { ok: false, error: `Unknown operator ${op}` }\n  const a = Number(left)\n  const b = Number(right)\n  if (!Number.isFinite(a) || !Number.isFinite(b)) return { ok: false, error: "Not a number" }\n  if (op === "/" && b === 0) return { ok: false, error: "Cannot divide by zero" }\n  return { ok: true, value: ops[op](a, b) }\n}\n',
      hint: 'Loop over the lines; check each result\'s `ok` and build the text, total and count.',
      solution: 'const ops = { "+": (a, b) => a + b, "-": (a, b) => a - b, "*": (a, b) => a * b, "/": (a, b) => a / b }\nfunction calculate(text) {\n  const parts = text.trim().split(" ")\n  if (parts.length !== 3) return { ok: false, error: "Expected: number operator number" }\n  const [left, op, right] = parts\n  if (!(op in ops)) return { ok: false, error: `Unknown operator ${op}` }\n  const a = Number(left)\n  const b = Number(right)\n  if (!Number.isFinite(a) || !Number.isFinite(b)) return { ok: false, error: "Not a number" }\n  if (op === "/" && b === 0) return { ok: false, error: "Cannot divide by zero" }\n  return { ok: true, value: ops[op](a, b) }\n}\nfunction tape(lines) {\n  const results = []\n  let total = 0\n  let failed = 0\n  for (const line of lines) {\n    const r = calculate(line)\n    if (r.ok) {\n      results.push(`${line} = ${r.value}`)\n      total += r.value\n    } else {\n      results.push(`${line}: ${r.error}`)\n      failed++\n    }\n  }\n  return { results, total, failed }\n}',
      tests: [['The tape', same('tape(["2 + 3", "5 / 0", "4 * 4"])', '{ results: ["2 + 3 = 5", "5 / 0: Cannot divide by zero", "4 * 4 = 16"], total: 21, failed: 1 }')], ['Empty', same('tape([])', '{ results: [], total: 0, failed: 0 }')]],
    }),
  ],
  questions: [
    mc('What does `"12 *".split(" ")` give?', ['`["12", "*"]`', '`["12", "*", ""]`', '`["12 *"]`', '`12`'], 0, 'Two parts, so the shape is wrong.', { code: 'console.log("12 *".split(" "))', output: "[ '12', '*' ]" }),
    mc('What does `5 / 0` give in JavaScript?', ['Infinity (no error)', 'A RangeError', '0', 'NaN'], 0, 'So the calculator must check it itself.', { code: 'console.log(5 / 0)', output: 'Infinity' }),
    mc('Which error type fits "unknown operator"?', ['SyntaxError: the text has the wrong shape', 'RangeError', 'ReferenceError', 'TypeError'], 0, 'It is about how the text is written.'),
    mc('What does `"^" in ops` check?', ['Whether ops has a "^" key', 'Whether "^" is a string', 'Whether ops is empty', 'It is an error'], 0, 'in checks for a key.', { code: 'console.log("^" in { "+": 1 })', output: 'false' }),
    mc('Why does `calculate` return a result object instead of throwing?', ['Bad sums are expected, and the screen just shows a message', 'Throwing is not allowed', 'It is faster', 'To hide bugs'], 0, 'Nothing escapes to crash the app.'),
    mc('What does `"RangeError: x".startsWith("RangeError")` give?', ['true', 'false', '"RangeError"', '0'], 0, 'It begins with that text.', { code: 'console.log("RangeError: x".startsWith("RangeError"))', output: 'true' }),
  ],
})
