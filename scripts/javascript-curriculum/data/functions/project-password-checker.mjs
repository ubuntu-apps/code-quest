// Functions side quest (medium): A password checker. Lesson, Try-it snippets, challenges and quiz.
import { is, makeProject, mc, same, snippet, task } from '../_builders.mjs'

export default makeProject('medium', {
  id: 'proj_password_checker',
  title: 'A password checker',
  paragraphs: [
    'Sign-up forms check a new password against rules and tell you what is missing. Build one from small functions, each checking one rule and returning `true` or `false`:',
    '- `longEnough(pw, min = 8)`: at least `min` characters;\n- `hasDigit(pw)`: contains a digit 0–9;\n- `hasUpper(pw)`: contains a capital letter;\n- `hasSymbol(pw)`: contains one of `!@#$%&*?`.',
    'Then `problems(pw)` gives a list of messages for the rules it breaks, and `strength(pw)` turns the number of rules passed into a word:',
    '```text\nproblems("hello")    → ["Use at least 8 characters", "Add a digit", "Add a capital letter", "Add a symbol"]\nstrength("hello")    → "weak"\nstrength("Hello123") → "good"\nstrength("Hello12!") → "strong"\n```',
    'A letter is a capital when it isn\'t the same as its lower-case self: `ch !== ch.toLowerCase()`.',
    'Some starters use a short cut: `/[0-9]/.test(pw)` asks "is there a digit anywhere?". Patterns like `/[0-9]/` are **regular expressions**, which get their own stage in a later quest; a loop does the same job.',
  ],
  sandboxCode: 'const pw = "Hello12!"\nfor (const ch of pw) {\n  console.log(ch, "0123456789".includes(ch), ch !== ch.toLowerCase())\n}',
  sandboxSnippets: [
    snippet('Rules as functions', 'const rules = [(p) => p.length >= 8, (p) => /[0-9]/.test(p)]\nconsole.log(rules.map((r) => r("abc123456")))'),
  ],
  challenges: [
    task('easy', 'Long enough', {
      prompt: 'Write `longEnough(pw, min = 8)`, returning whether `pw` has at least `min` characters.',
      hint: '`return pw.length >= min`.',
      solution: 'function longEnough(pw, min = 8) {\n  return pw.length >= min\n}',
      tests: [['8 is enough', is('longEnough("abcdefgh")', true)], ['7 is not', is('longEnough("abcdefg")', false)], ['A custom min', is('longEnough("abc", 3)', true)]],
    }),
    task('easy', 'Has a digit', {
      prompt: 'Write `hasDigit(pw)`, returning whether `pw` contains a digit, by looping over its characters.',
      hint: 'For each `ch`: `if ("0123456789".includes(ch)) return true`; after the loop, `return false`.',
      solution: 'function hasDigit(pw) {\n  for (const ch of pw) {\n    if ("0123456789".includes(ch)) return true\n  }\n  return false\n}',
      tests: [['abc1', is('hasDigit("abc1")', true)], ['abc', is('hasDigit("abc")', false)], ['Empty', is('hasDigit("")', false)]],
    }),
    task('medium', 'Has a capital', {
      prompt: 'Write `hasUpper(pw)`, returning whether `pw` contains a capital letter.',
      hint: 'A character is a capital when `ch !== ch.toLowerCase()`.',
      solution: 'function hasUpper(pw) {\n  for (const ch of pw) {\n    if (ch !== ch.toLowerCase()) return true\n  }\n  return false\n}',
      tests: [['Hello', is('hasUpper("Hello")', true)], ['hello', is('hasUpper("hello")', false)], ['123!', is('hasUpper("123!")', false)]],
    }),
    task('medium', 'What is missing', {
      prompt: 'Write `problems(pw)`, returning the messages for the rules `pw` breaks, in this order: `"Use at least 8 characters"`, `"Add a digit"`, `"Add a capital letter"`, `"Add a symbol"`.',
      starter: 'const longEnough = (pw, min = 8) => pw.length >= min\nconst hasDigit = (pw) => /[0-9]/.test(pw)\nconst hasUpper = (pw) => pw !== pw.toLowerCase()\nconst hasSymbol = (pw) => /[!@#$%&*?]/.test(pw)\n',
      hint: 'Start with `const out = []`, then one `if (!rule(pw)) out.push(message)` per rule.',
      solution: 'const longEnough = (pw, min = 8) => pw.length >= min\nconst hasDigit = (pw) => /[0-9]/.test(pw)\nconst hasUpper = (pw) => pw !== pw.toLowerCase()\nconst hasSymbol = (pw) => /[!@#$%&*?]/.test(pw)\nfunction problems(pw) {\n  const out = []\n  if (!longEnough(pw)) out.push("Use at least 8 characters")\n  if (!hasDigit(pw)) out.push("Add a digit")\n  if (!hasUpper(pw)) out.push("Add a capital letter")\n  if (!hasSymbol(pw)) out.push("Add a symbol")\n  return out\n}',
      tests: [['hello', same('problems("hello")', '["Use at least 8 characters", "Add a digit", "Add a capital letter", "Add a symbol"]')], ['Hello123', same('problems("Hello123")', '["Add a symbol"]')], ['Hello12!', same('problems("Hello12!")', '[]')]],
    }),
    task('hard', 'How strong', {
      prompt: 'Write `strength(pw)`: count the 4 rules passed; 4 is `"strong"`, 3 is `"good"`, 2 is `"fair"`, fewer is `"weak"`.',
      starter: 'const rules = [\n  (pw) => pw.length >= 8,\n  (pw) => /[0-9]/.test(pw),\n  (pw) => pw !== pw.toLowerCase(),\n  (pw) => /[!@#$%&*?]/.test(pw),\n]\n',
      hint: 'Loop over `rules`, adding 1 when `rule(pw)` is true; then pick the word.',
      solution: 'const rules = [\n  (pw) => pw.length >= 8,\n  (pw) => /[0-9]/.test(pw),\n  (pw) => pw !== pw.toLowerCase(),\n  (pw) => /[!@#$%&*?]/.test(pw),\n]\nfunction strength(pw) {\n  let passed = 0\n  for (const rule of rules) {\n    if (rule(pw)) passed++\n  }\n  if (passed === 4) return "strong"\n  if (passed === 3) return "good"\n  if (passed === 2) return "fair"\n  return "weak"\n}',
      tests: [['hello is weak', is('strength("hello")', 'weak')], ['hello123 is fair', is('strength("hello123")', 'fair')], ['Hello123 is good', is('strength("Hello123")', 'good')], ['Hello12! is strong', is('strength("Hello12!")', 'strong')]],
    }),
    task('expert', 'A checker factory', {
      prompt: 'Write `makeChecker(min)`, returning a function that takes a password and returns `{ ok, problems }`: `problems` is the list of messages as before (using `min` for the length rule, `"Use at least N characters"`), and `ok` is `true` when there are none.',
      hint: 'Inside the returned function, build the list with four `if`s, then `return { ok: list.length === 0, problems: list }`.',
      solution: 'function makeChecker(min) {\n  return (pw) => {\n    const problems = []\n    if (pw.length < min) problems.push(`Use at least ${min} characters`)\n    if (!/[0-9]/.test(pw)) problems.push("Add a digit")\n    if (pw === pw.toLowerCase()) problems.push("Add a capital letter")\n    if (!/[!@#$%&*?]/.test(pw)) problems.push("Add a symbol")\n    return { ok: problems.length === 0, problems }\n  }\n}',
      tests: [['Min 12, too short', same('makeChecker(12)("Hello12!")', '{ ok: false, problems: ["Use at least 12 characters"] }')], ['Min 6, fine', same('makeChecker(6)("Hello12!")', '{ ok: true, problems: [] }')], ['Missing a digit', same('makeChecker(4)("Hey!")', '{ ok: false, problems: ["Add a digit"] }')]],
    }),
  ],
  questions: [
    mc('What does `"Hello" !== "Hello".toLowerCase()` give?', ['true', 'false', '"hello"', 'An error'], 0, '"Hello" and "hello" differ.', { code: 'console.log("Hello" !== "Hello".toLowerCase())', output: 'true' }),
    mc('Why can `hasDigit` `return true` inside the loop?', ['One digit is enough, so it can stop at once', 'return doesn\'t end a loop', 'It must check every character', 'It can\'t'], 0, 'return ends the function early.'),
    mc('What does `/[0-9]/.test("abc7")` give?', ['true', 'false', '7', '"7"'], 0, 'The pattern finds a digit.', { code: 'console.log(/[0-9]/.test("abc7"))', output: 'true' }),
    mc('Why keep each rule as its own function?', ['Each is easy to test and reuse, and rules can be listed in an array', 'It is shorter', 'JavaScript needs it', 'It makes passwords safer'], 0, 'Small pieces, one job each.'),
    mc('What is `[(p) => p.length > 2][0]("hey")`?', ['true', 'false', '3', 'A function'], 0, 'The first function in the array, called with "hey".', { code: 'console.log([(p) => p.length > 2][0]("hey"))', output: 'true' }),
    mc('In `makeChecker(min)`, how does the returned function know `min`?', ['It is a closure', 'min is global', 'It is passed each time', 'It doesn\'t'], 0, 'It remembers the variables where it was made.'),
  ],
})
