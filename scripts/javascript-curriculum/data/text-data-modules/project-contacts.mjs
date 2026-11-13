// Text, data and modules side quest (medium): Tidying a contact list. Lesson, Try-it snippets, challenges and quiz.
import { makeProject, mc, same, snippet, task } from '../_builders.mjs'

const CSV = 'const csv = `name,email,phone,joined\n  ana LIMA ,Ana.Lima@Example.com,555 014 2367,2024-03-09\nBen Okafor,ben@example.com,(555) 014-9911,2025-11-30\nkim park,KIM@example.com,555.014.2001,2023-07-15\nAna Lima,ana.lima@example.com,,2024-03-09\nZed,zed-at-example.com,12,2026-01-01`\n'
const ROWS = 'function rows(csv) {\n  const [header, ...lines] = csv.trim().split("\\n")\n  const columns = header.split(",")\n  return lines.map((line) => Object.fromEntries(line.split(",").map((v, i) => [columns[i], v])))\n}\n'
const CLEAN = 'const cleanName = (s) => s.trim().replace(/\\s+/g, " ").toLowerCase().replace(/\\b\\w/g, (c) => c.toUpperCase())\nconst cleanEmail = (s) => s.trim().toLowerCase()\nfunction cleanPhone(s) {\n  const d = s.replace(/\\D/g, "")\n  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : null\n}\nconst validEmail = (s) => /^[^\\s@]+@[^\\s@]+\\.[a-z]{2,}$/i.test(s)\n'
const CLEANED = CSV + ROWS + CLEAN + 'const contacts = rows(csv).map((r) => ({ name: cleanName(r.name), email: cleanEmail(r.email), phone: cleanPhone(r.phone), joined: r.joined }))\n'

export default makeProject('medium', {
  id: 'proj_contacts',
  title: 'Tidying a contact list',
  paragraphs: [
    'A club exported its members from three old systems into one CSV file. Names are in odd cases, emails in mixed capitals, phone numbers written every which way, one member is in twice and one row is junk.',
    '```text\nname,email,phone,joined\n  ana LIMA ,Ana.Lima@Example.com,555 014 2367,2024-03-09\nBen Okafor,ben@example.com,(555) 014-9911,2025-11-30\nkim park,KIM@example.com,555.014.2001,2023-07-15\nAna Lima,ana.lima@example.com,,2024-03-09\nZed,zed-at-example.com,12,2026-01-01\n```',
    'Clean it step by step: read the rows, tidy each field, set aside the invalid ones, merge the duplicates (the same email is the same person), and save the result as JSON for the club\'s new app.',
  ],
  sandboxCode: CSV + '\nfor (const line of csv.split("\\n")) console.log(line.split(","))',
  sandboxSnippets: [
    snippet('Digits only', 'console.log("(555) 014-9911".replace(/\\D/g, ""))'),
  ],
  challenges: [
    task('easy', 'Read the rows', {
      prompt: 'Write `rows(csv)` that turns the CSV into a list of objects with the header\'s column names as keys (values as they are).',
      starter: CSV,
      hint: 'Split into lines; the first is the header; `Object.fromEntries` for each line.',
      solution: CSV + ROWS,
      tests: [['Five rows', 'rows(csv).length === 5'], ['Second row', same('rows(csv)[1]', '{ name: "Ben Okafor", email: "ben@example.com", phone: "(555) 014-9911", joined: "2025-11-30" }')]],
    }),
    task('easy', 'Clean each field', {
      prompt: 'Write `cleanName(s)` (trimmed, single spaces, each word with a capital first letter), `cleanEmail(s)` (trimmed, small letters) and `cleanPhone(s)` (`(555) 014-2367` style from the digits, or `null` without exactly 10 digits).',
      hint: 'Each is one chain of `trim`, `replace` and case changes; for the phone, keep `replace(/\\D/g, "")`.',
      solution: CLEAN,
      tests: [['cleanName', 'cleanName("  ana LIMA ") === "Ana Lima"'], ['cleanEmail', 'cleanEmail(" KIM@Example.com") === "kim@example.com"'], ['cleanPhone', 'cleanPhone("555.014.2001") === "(555) 014-2001" && cleanPhone("12") === null && cleanPhone("") === null']],
    }),
    task('medium', 'Valid or not', {
      prompt: 'Using `contacts` (already cleaned), make `valid` the contacts whose email passes `validEmail`, and `rejected` the names of the others.',
      starter: CLEANED,
      hint: 'Two `filter`s with `validEmail(c.email)`; map the rejected ones to `c.name`.',
      solution: CLEANED + 'const valid = contacts.filter((c) => validEmail(c.email))\nconst rejected = contacts.filter((c) => !validEmail(c.email)).map((c) => c.name)',
      tests: [['4 valid', 'valid.length === 4'], ['Zed rejected', same('rejected', '["Zed"]')]],
      alt: CLEANED.replace('KIM@example.com', 'KIM-example.com'),
    }),
    task('medium', 'Merge duplicates', {
      prompt: 'Write `merge(contacts)`: contacts with the same email are one person. Keep the first one, but fill in any field that is `null` or empty from the later ones. Keep the order of first appearance.',
      starter: CLEANED,
      hint: 'A `Map` from email to contact. For a repeat, copy each field the kept one lacks: `if (kept[k] == null || kept[k] === "") kept[k] = c[k]`.',
      solution: CLEANED + 'function merge(contacts) {\n  const byEmail = new Map()\n  for (const c of contacts) {\n    const kept = byEmail.get(c.email)\n    if (!kept) {\n      byEmail.set(c.email, { ...c })\n      continue\n    }\n    for (const k of Object.keys(c)) {\n      if (kept[k] == null || kept[k] === "") kept[k] = c[k]\n    }\n  }\n  return [...byEmail.values()]\n}',
      tests: [['Ana once', '(() => { const m = merge(contacts); return m.length === 4 && m.filter((c) => c.email === "ana.lima@example.com").length === 1 })()'], ['Fills a gap', same('merge([{ email: "a@x.io", phone: null }, { email: "a@x.io", phone: "(555) 000-0000" }])', '[{ email: "a@x.io", phone: "(555) 000-0000" }]')], ['Keeps the first value', same('merge([{ email: "a@x.io", name: "Ana" }, { email: "a@x.io", name: "Anna" }])', '[{ email: "a@x.io", name: "Ana" }]')]],
      alt: CLEANED.replace('Ben Okafor,ben@', 'Ben Oak,ben@'),
    }),
    task('hard', 'Newest members', {
      prompt: 'Write `newest(contacts, n)` that returns the names of the `n` most recently joined contacts, newest first. (`joined` is `YYYY-MM-DD` text, which sorts correctly as text.)',
      starter: CLEANED,
      hint: '`toSorted((a, b) => b.joined.localeCompare(a.joined))`, then `slice(0, n)` and map to names.',
      solution: CLEANED + 'function newest(contacts, n) {\n  return contacts\n    .toSorted((a, b) => b.joined.localeCompare(a.joined))\n    .slice(0, n)\n    .map((c) => c.name)\n}',
      tests: [['Two newest', same('newest(contacts, 2)', '["Zed", "Ben Okafor"]')], ['All', 'newest(contacts, 10).length === 5']],
      alt: CLEANED.replace('2025-11-30', '2022-02-14'),
    }),
    task('expert', 'Save for the app', {
      prompt: 'Write `exportJson(contacts)` that keeps only the contacts with a valid email, merges duplicates, sorts them by name A to Z, and returns JSON text (indented by 2) of objects with just `name`, `email` and `phone`.',
      starter: CLEANED + 'function merge(contacts) {\n  const byEmail = new Map()\n  for (const c of contacts) {\n    const kept = byEmail.get(c.email)\n    if (!kept) byEmail.set(c.email, { ...c })\n    else for (const k of Object.keys(c)) if (kept[k] == null || kept[k] === "") kept[k] = c[k]\n  }\n  return [...byEmail.values()]\n}\n',
      hint: '`merge(contacts.filter(…))`, `toSorted` by `name` with `localeCompare`, `map` to the three fields, then `JSON.stringify(…, null, 2)`.',
      solution: CLEANED + 'function merge(contacts) {\n  const byEmail = new Map()\n  for (const c of contacts) {\n    const kept = byEmail.get(c.email)\n    if (!kept) byEmail.set(c.email, { ...c })\n    else for (const k of Object.keys(c)) if (kept[k] == null || kept[k] === "") kept[k] = c[k]\n  }\n  return [...byEmail.values()]\n}\nfunction exportJson(contacts) {\n  const list = merge(contacts.filter((c) => validEmail(c.email)))\n    .toSorted((a, b) => a.name.localeCompare(b.name))\n    .map(({ name, email, phone }) => ({ name, email, phone }))\n  return JSON.stringify(list, null, 2)\n}',
      tests: [['The JSON', 'exportJson(contacts) === JSON.stringify([{ name: "Ana Lima", email: "ana.lima@example.com", phone: "(555) 014-2367" }, { name: "Ben Okafor", email: "ben@example.com", phone: "(555) 014-9911" }, { name: "Kim Park", email: "kim@example.com", phone: "(555) 014-2001" }], null, 2)']],
      alt: (starter) => starter.replace('kim park,KIM@example.com', 'kim park,KIM-example.com'),
    }),
  ],
  questions: [
    mc('Why use the email to spot duplicates rather than the name?', ['Names are written differently and can be shared; an email belongs to one person', 'Emails are shorter', 'Names can\'t be compared', 'It doesn\'t matter'], 0, 'Pick a key that really identifies the person.'),
    mc('Why clean the emails before comparing them?', ['`Ana.Lima@Example.com` and `ana.lima@example.com` should count as the same', 'Emails must be lower case to be sent', 'To make them shorter', 'They don\'t need cleaning'], 0, 'Compare cleaned keys.'),
    mc('What does `"(555) 014-9911".replace(/\\D/g, "")` give?', ['`5550149911`', '`(555) 014-9911`', '`555 014 9911`', '`""`'], 0, '\\D is "not a digit".', { code: 'console.log("(555) 014-9911".replace(/\\D/g, ""))', output: '5550149911' }),
    mc('What should happen to the junk row?', ['Set it aside and report it, not silently drop it', 'Keep it as it is', 'Guess the right values', 'Stop the whole program'], 0, 'Someone can fix it.'),
    mc('Why does `"2025-11-30" > "2024-03-09"` work for dates?', ['YYYY-MM-DD text sorts in date order', 'JavaScript turns them into dates', 'It doesn\'t', 'Because of the dashes'], 0, 'Biggest unit first, fixed width.', { code: 'console.log("2025-11-30" > "2024-03-09")', output: 'true' }),
    mc('What does `({ name, email }) => ({ name, email })` do to a contact?', ['Makes a new object with only those two fields', 'Deletes the contact', 'Copies every field', 'An error'], 0, 'Destructure, then build.'),
  ],
})
