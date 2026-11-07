// Errors and debugging side quest (medium): A form validator. Lesson, Try-it snippets, challenges and quiz.
import { is, makeProject, mc, same, snippet, task } from '../_builders.mjs'

export default makeProject('medium', {
  id: 'proj_form_validator',
  title: 'A form validator',
  paragraphs: [
    'A sign-up form has fields for a name, an email, an age and a password. When someone presses "Sign up", the app should list **every** problem at once, next to the field it belongs to, rather than one at a time.',
    'Build it from small **rules**. A rule is a function that takes a value and returns an error message, or `null` if the value is fine:',
    '```\nconst required = (value) => (String(value ?? "").trim() === "" ? "This field is required" : null)\nconsole.log(required(""), required("Kim"))\n```',
    'Each field has a list of rules. `validate(form, rules)` runs them all and returns `{ ok, errors }`, where `errors` has the first problem for each field:',
    '```text\n{ ok: false, errors: { email: "Email looks wrong", age: "Must be at least 13" } }\n```',
    'Finally, rule **factories** like `minLength(8)` make rules with settings, using a closure.',
  ],
  sandboxCode: 'const required = (value) => (String(value ?? "").trim() === "" ? "This field is required" : null)\nconsole.log(required(""), required("Kim"), required(undefined))',
  sandboxSnippets: [
    snippet('A factory', 'const minLength = (n) => (value) => (value.length < n ? `Must be at least ${n} characters` : null)\nconst atLeast8 = minLength(8)\nconsole.log(atLeast8("abc"), atLeast8("abcdefgh"))'),
  ],
  challenges: [
    task('easy', 'Required', {
      prompt: 'Write `required(value)`, returning `"This field is required"` when `value` is missing or blank text, else `null`.',
      hint: '`String(value ?? "").trim() === ""`.',
      solution: 'function required(value) {\n  return String(value ?? "").trim() === "" ? "This field is required" : null\n}',
      tests: [['Blank', is('required("  ")', 'This field is required')], ['Missing', is('required(undefined)', 'This field is required')], ['Fine', is('required("Kim")', null)]],
    }),
    task('easy', 'Email', {
      prompt: 'Write `email(value)`, returning `"Email looks wrong"` unless it has exactly one `@` with text on both sides and a `.` after it; `null` when fine.',
      hint: 'Split at `@`: two parts, first not empty, second includes `.`.',
      solution: 'function email(value) {\n  const parts = String(value).split("@")\n  const ok = parts.length === 2 && parts[0] !== "" && parts[1].includes(".")\n  return ok ? null : "Email looks wrong"\n}',
      tests: [['Good', is('email("kim@x.io")', null)], ['No @', is('email("kim")', 'Email looks wrong')], ['No dot', is('email("kim@x")', 'Email looks wrong')]],
    }),
    task('medium', 'Rule factories', {
      prompt: 'Write `minLength(n)`, returning a rule that gives `Must be at least N characters` for shorter text, and `atLeast(n)`, returning a rule that gives `Must be at least N` for a number (from the text) smaller than `n` or not a number.',
      hint: 'Each returns `(value) => … ? message : null`.',
      solution: 'function minLength(n) {\n  return (value) => (String(value).length < n ? `Must be at least ${n} characters` : null)\n}\nfunction atLeast(n) {\n  return (value) => {\n    const num = Number(value)\n    return !Number.isFinite(num) || num < n ? `Must be at least ${n}` : null\n  }\n}',
      tests: [['minLength', 'minLength(8)("abc") === "Must be at least 8 characters" && minLength(3)("abc") === null'], ['atLeast', 'atLeast(13)("9") === "Must be at least 13" && atLeast(13)("30") === null && atLeast(13)("old") === "Must be at least 13"']],
    }),
    task('medium', 'First problem', {
      prompt: 'Write `firstError(value, rules)`, running each rule in order and returning the first message, or `null` if every rule passes.',
      hint: 'Loop over `rules`; `const message = rule(value)`; if it isn\'t `null`, return it.',
      solution: 'function firstError(value, rules) {\n  for (const rule of rules) {\n    const message = rule(value)\n    if (message !== null) return message\n  }\n  return null\n}',
      tests: [['First fails', is('firstError("", [() => "A", () => "B"])', 'A')], ['Second fails', is('firstError("x", [() => null, () => "B"])', 'B')], ['All pass', is('firstError("x", [() => null])', null)], ['No rules', is('firstError("x", [])', null)]],
    }),
    task('hard', 'Validate the form', {
      prompt: 'Write `validate(form, rules)`, where `rules` maps field names to lists of rules. Return `{ ok, errors }`: `errors` has each field\'s first problem (fields with none are left out), and `ok` is `true` when there are no errors.',
      starter: 'function firstError(value, rules) {\n  for (const rule of rules) {\n    const message = rule(value)\n    if (message !== null) return message\n  }\n  return null\n}\n',
      hint: 'Loop over `Object.entries(rules)`; `const message = firstError(form[field], list)`; if not null, `errors[field] = message`.',
      solution: 'function firstError(value, rules) {\n  for (const rule of rules) {\n    const message = rule(value)\n    if (message !== null) return message\n  }\n  return null\n}\nfunction validate(form, rules) {\n  const errors = {}\n  for (const [field, list] of Object.entries(rules)) {\n    const message = firstError(form[field], list)\n    if (message !== null) errors[field] = message\n  }\n  return { ok: Object.keys(errors).length === 0, errors }\n}',
      tests: [['Problems', same('validate({ name: "Kim", age: "9" }, { name: [(v) => (v ? null : "Required")], age: [(v) => (Number(v) >= 13 ? null : "Too young")] })', '{ ok: false, errors: { age: "Too young" } }')], ['All fine', same('validate({ name: "Kim" }, { name: [(v) => (v ? null : "Required")] })', '{ ok: true, errors: {} }')]],
    }),
    task('expert', 'The sign-up form', {
      prompt: 'Write `checkSignup(form)` for fields `name` (required), `email` (required, looks like an email), `age` (required, at least 13) and `password` (required, at least 8 characters). Return `{ ok, errors }` with the first problem per field, using the messages from the earlier steps.',
      hint: 'Write the four rules (or two rules and two factories), a `rules` object, and reuse `validate`.',
      solution: 'const required = (v) => (String(v ?? "").trim() === "" ? "This field is required" : null)\nconst email = (v) => {\n  const parts = String(v).split("@")\n  return parts.length === 2 && parts[0] !== "" && parts[1].includes(".") ? null : "Email looks wrong"\n}\nconst minLength = (n) => (v) => (String(v).length < n ? `Must be at least ${n} characters` : null)\nconst atLeast = (n) => (v) => (!Number.isFinite(Number(v)) || Number(v) < n ? `Must be at least ${n}` : null)\nfunction checkSignup(form) {\n  const rules = {\n    name: [required],\n    email: [required, email],\n    age: [required, atLeast(13)],\n    password: [required, minLength(8)],\n  }\n  const errors = {}\n  for (const [field, list] of Object.entries(rules)) {\n    for (const rule of list) {\n      const message = rule(form[field])\n      if (message !== null) {\n        errors[field] = message\n        break\n      }\n    }\n  }\n  return { ok: Object.keys(errors).length === 0, errors }\n}',
      tests: [['Good form', same('checkSignup({ name: "Kim", email: "kim@x.io", age: "30", password: "secret123" })', '{ ok: true, errors: {} }')], ['Bad form', same('checkSignup({ name: " ", email: "kim", age: "9", password: "abc" })', '{ ok: false, errors: { name: "This field is required", email: "Email looks wrong", age: "Must be at least 13", password: "Must be at least 8 characters" } }')], ['Missing fields', same('checkSignup({})', '{ ok: false, errors: { name: "This field is required", email: "This field is required", age: "This field is required", password: "This field is required" } }')]],
    }),
  ],
  questions: [
    mc('What does a rule return when the value is fine?', ['null', 'true', 'An error', '"ok"'], 0, 'A message only when there is a problem.'),
    mc('Why list every problem at once?', ['So people can fix the whole form in one go', 'It is required by law', 'One at a time is faster', 'To make the form longer'], 0, 'Better for the person filling it in.'),
    mc('What does `String(undefined ?? "")` give?', ['""', '"undefined"', 'undefined', 'An error'], 0, '?? swaps undefined for "".', { code: 'console.log(JSON.stringify(String(undefined ?? "")))', output: '""' }),
    mc('What is `minLength(8)`?', ['A rule function made with a setting', 'The number 8', 'An error', 'A string'], 0, 'A factory returns a function.'),
    mc('What does `Object.keys({}).length === 0` tell you?', ['The object has no properties', 'The object is null', 'It is an array', 'Nothing'], 0, 'No errors means ok.'),
    mc('Why is a bad form not a thrown error here?', ['Mistakes in forms are expected; a result is easier to show', 'Forms can\'t throw', 'throw is slower', 'It should throw'], 0, 'Expected failures are data.'),
  ],
})
