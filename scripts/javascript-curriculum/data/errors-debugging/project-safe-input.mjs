// Errors and debugging side quest (easy): A safe number reader. Lesson, Try-it snippets, challenges and quiz.
import { is, makeProject, mc, same, snippet, task, throwsWhen } from '../_builders.mjs'

export default makeProject('easy', {
  id: 'proj_safe_input',
  title: 'A safe number reader',
  paragraphs: [
    'A fitness app asks people how many steps they walked each day. They type all sorts: `"8000"`, `" 6,500 "`, `"lots"`, or nothing at all.',
    'Build a reader that turns that text into numbers safely:',
    '- `readSteps(text)` returns a whole number of 0 or more, accepting spaces and commas (`"6,500"`), and throws a `RangeError` for anything else;\n- `tryRead(text)` uses it, giving `null` instead of throwing;\n- `weekReport(texts)` reads a week of entries, adds up the good ones, and says how many it skipped.',
    '```text\nweekReport(["8000", " 6,500 ", "lots", "", "12000"])\n→ { total: 26500, skipped: 2 }\n```',
  ],
  sandboxCode: 'const text = " 6,500 "\nconst cleaned = text.trim().replaceAll(",", "")\nconsole.log(cleaned, Number(cleaned), Number.isInteger(Number(cleaned)))',
  sandboxSnippets: [
    snippet('replaceAll', 'console.log("1,234,567".replaceAll(",", ""))'),
  ],
  challenges: [
    task('easy', 'Clean the text', {
      prompt: 'Write `clean(text)`, returning the text trimmed and with every comma removed.',
      hint: '`text.trim().replaceAll(",", "")`.',
      solution: 'function clean(text) {\n  return text.trim().replaceAll(",", "")\n}',
      tests: [['Commas and spaces', is('clean(" 6,500 ")', '6500')], ['Plain', is('clean("8000")', '8000')], ['Blank', is('clean("   ")', '')]],
    }),
    task('easy', 'Read the steps', {
      prompt: 'Write `readSteps(text)`, returning a whole number of 0 or more from the cleaned text, or throwing a `RangeError` with `Not a step count: "TEXT"`.',
      hint: 'Clean it; reject `""`; `Number`; check `Number.isInteger(n) && n >= 0`.',
      solution: 'function readSteps(text) {\n  const t = text.trim().replaceAll(",", "")\n  const n = Number(t)\n  if (t === "" || !Number.isInteger(n) || n < 0) throw new RangeError(`Not a step count: "${text}"`)\n  return n\n}',
      tests: [['"8000"', is('readSteps("8000")', 8000)], ['" 6,500 "', is('readSteps(" 6,500 ")', 6500)], ['"lots"', throwsWhen('readSteps("lots")', 'RangeError: Not a step count: "lots"')], ['""', throwsWhen('readSteps("")', 'RangeError')], ['"-5"', throwsWhen('readSteps("-5")', 'RangeError')], ['"2.5"', throwsWhen('readSteps("2.5")', 'RangeError')]],
    }),
    task('medium', 'Try to read', {
      prompt: 'Write `tryRead(text)`, which calls `readSteps` and returns its number, or `null` if it throws.',
      starter: 'function readSteps(text) {\n  const t = text.trim().replaceAll(",", "")\n  const n = Number(t)\n  if (t === "" || !Number.isInteger(n) || n < 0) throw new RangeError(`Not a step count: "${text}"`)\n  return n\n}\n',
      hint: '`try { return readSteps(text) } catch { return null }`.',
      solution: 'function readSteps(text) {\n  const t = text.trim().replaceAll(",", "")\n  const n = Number(t)\n  if (t === "" || !Number.isInteger(n) || n < 0) throw new RangeError(`Not a step count: "${text}"`)\n  return n\n}\nfunction tryRead(text) {\n  try {\n    return readSteps(text)\n  } catch {\n    return null\n  }\n}',
      tests: [['Good', is('tryRead("1,000")', 1000)], ['Bad', is('tryRead("x")', null)], ['Zero is fine', is('tryRead("0")', 0)]],
    }),
    task('medium', 'Only RangeErrors', {
      prompt: 'Make `tryRead` give `null` only for a `RangeError`, and rethrow anything else (like a `TypeError` when `text` isn\'t text at all).',
      starter: 'function readSteps(text) {\n  const t = text.trim().replaceAll(",", "")\n  const n = Number(t)\n  if (t === "" || !Number.isInteger(n) || n < 0) throw new RangeError(`Not a step count: "${text}"`)\n  return n\n}\nfunction tryRead(text) {\n  try {\n    return readSteps(text)\n  } catch {\n    return null\n  }\n}\n',
      hint: '`catch (e) { if (e instanceof RangeError) return null; throw e }`.',
      solution: 'function readSteps(text) {\n  const t = text.trim().replaceAll(",", "")\n  const n = Number(t)\n  if (t === "" || !Number.isInteger(n) || n < 0) throw new RangeError(`Not a step count: "${text}"`)\n  return n\n}\nfunction tryRead(text) {\n  try {\n    return readSteps(text)\n  } catch (e) {\n    if (e instanceof RangeError) return null\n    throw e\n  }\n}',
      tests: [['Bad text', is('tryRead("x")', null)], ['Not text', throwsWhen('tryRead(42)', 'TypeError')]],
    }),
    task('hard', 'A week', {
      prompt: 'Write `weekReport(texts)`, returning `{ total, skipped }`: the sum of the entries that read well, and how many didn\'t.',
      starter: 'const tryRead = (text) => {\n  const t = text.trim().replaceAll(",", "")\n  const n = Number(t)\n  return t === "" || !Number.isInteger(n) || n < 0 ? null : n\n}\n',
      hint: 'For each text: `const n = tryRead(t)`; if `n === null` skip it, else add it.',
      solution: 'const tryRead = (text) => {\n  const t = text.trim().replaceAll(",", "")\n  const n = Number(t)\n  return t === "" || !Number.isInteger(n) || n < 0 ? null : n\n}\nfunction weekReport(texts) {\n  let total = 0\n  let skipped = 0\n  for (const t of texts) {\n    const n = tryRead(t)\n    if (n === null) skipped++\n    else total += n\n  }\n  return { total, skipped }\n}',
      tests: [['The week', same('weekReport(["8000", " 6,500 ", "lots", "", "12000"])', '{ total: 26500, skipped: 2 }')], ['All good', same('weekReport(["1", "2"])', '{ total: 3, skipped: 0 }')], ['Empty', same('weekReport([])', '{ total: 0, skipped: 0 }')]],
    }),
    task('expert', 'Say which days', {
      prompt: 'Write `problems(days)`, where `days` is an object like `{ Mon: "8000", Tue: "lots" }`. Return a list of `DAY: "TEXT" isn\'t a number of steps` for each entry that can\'t be read.',
      starter: 'function readSteps(text) {\n  const t = text.trim().replaceAll(",", "")\n  const n = Number(t)\n  if (t === "" || !Number.isInteger(n) || n < 0) throw new RangeError(`Not a step count: "${text}"`)\n  return n\n}\n',
      hint: 'Loop over `Object.entries(days)`, calling `readSteps` in a `try`.',
      solution: 'function readSteps(text) {\n  const t = text.trim().replaceAll(",", "")\n  const n = Number(t)\n  if (t === "" || !Number.isInteger(n) || n < 0) throw new RangeError(`Not a step count: "${text}"`)\n  return n\n}\nfunction problems(days) {\n  const out = []\n  for (const [day, text] of Object.entries(days)) {\n    try {\n      readSteps(text)\n    } catch {\n      out.push(`${day}: "${text}" isn\'t a number of steps`)\n    }\n  }\n  return out\n}',
      tests: [['Two problems', same('problems({ Mon: "8000", Tue: "lots", Wed: "", Thu: "1,200" })', '[\'Tue: "lots" isn\\\'t a number of steps\', \'Wed: "" isn\\\'t a number of steps\']')], ['None', same('problems({ Mon: "1" })', '[]')]],
    }),
  ],
  questions: [
    mc('What does `"6,500".replaceAll(",", "")` give?', ['"6500"', '6500', '"6.500"', '"6 500"'], 0, 'Every comma is removed; it is still text.', { code: 'console.log("6,500".replaceAll(",", ""))', output: '6500' }),
    mc('Why check for `""` before `Number`?', ['`Number("")` is 0, not NaN', '`Number("")` throws', 'It is faster', 'You don\'t need to'], 0, 'Blank would count as 0 steps.'),
    mc('What does `Number.isInteger(Number("2.5"))` give?', ['false', 'true', '2', 'NaN'], 0, '2.5 isn\'t whole.', { code: 'console.log(Number.isInteger(Number("2.5")))', output: 'false' }),
    mc('`tryRead` returns `null` for bad text. Why is that fine here?', ['Bad entries are expected, and the report just skips them', 'null is an error', 'It throws anyway', 'It isn\'t fine'], 0, 'An expected failure.'),
    mc('What does `(42).trim()` do?', ['Throws a TypeError', 'Returns "42"', 'Returns 42', 'Returns undefined'], 0, 'Numbers have no trim.', { code: '// This shows an error\n(42).trim()', error: 'TypeError' }),
    mc('Why rethrow errors that aren\'t RangeErrors?', ['They are bugs, not bad input, and shouldn\'t be hidden', 'To count them', 'So tryRead returns null', 'It is required'], 0, 'Only handle what you expect.'),
  ],
})
