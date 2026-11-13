// Text, data and modules side quest (easy): A server log reader. Lesson, Try-it snippets, challenges and quiz.
import { makeProject, mc, prints, same, snippet, task } from '../_builders.mjs'

const LOG = 'const log = `2026-11-12 09:14:02 INFO  user=ana action=login\n2026-11-12 09:15:40 WARN  user=ben action=login slow=1200ms\n2026-11-12 09:17:05 ERROR user=kim action=pay code=card_declined\n2026-11-12 09:20:11 INFO  user=ana action=pay\n2026-11-12 09:31:59 ERROR user=ben action=upload code=too_big\n2026-11-12 09:40:00 INFO  user=kim action=logout`\n'
const LINE_RE = '/^(\\S+) (\\S+) (\\w+)\\s+(.*)$/'
const PARSE = `function parseLine(line) {\n  const m = line.match(${LINE_RE})\n  if (!m) return null\n  const fields = {}\n  for (const f of m[4].matchAll(/(\\w+)=(\\S+)/g)) fields[f[1]] = f[2]\n  return { date: m[1], time: m[2], level: m[3], ...fields }\n}\n`
const ENTRIES = LOG + PARSE + 'const entries = log.split("\\n").map(parseLine)\n'

export default makeProject('easy', {
  id: 'proj_log_reader',
  title: 'A server log reader',
  paragraphs: [
    'Servers write a line to a **log** for everything that happens. When something goes wrong, someone has to read thousands of lines. Build a small tool that reads them for you.',
    '```text\n2026-11-12 09:14:02 INFO  user=ana action=login\n2026-11-12 09:15:40 WARN  user=ben action=login slow=1200ms\n2026-11-12 09:17:05 ERROR user=kim action=pay code=card_declined\n```',
    'Each line has a date, a time, a **level** (`INFO`, `WARN` or `ERROR`), then `key=value` fields. You will count the levels, turn lines into objects with a regex, and pick out the problems.',
  ],
  sandboxCode: LOG + '\nconst lines = log.split("\\n")\nconsole.log(lines.length, "lines")\nconsole.log(lines[2].match(/(\\w+)=(\\S+)/g))',
  sandboxSnippets: [
    snippet('Fields to an object', 'const fields = {}\nfor (const m of "user=ana action=pay".matchAll(/(\\w+)=(\\S+)/g)) fields[m[1]] = m[2]\nconsole.log(fields)'),
  ],
  challenges: [
    task('easy', 'Count the errors', {
      prompt: 'Make `errorCount` the number of lines in `log` with the level `ERROR`.',
      starter: LOG,
      hint: 'Split into lines, `filter` with `/ ERROR /.test(line)`, take `.length`.',
      solution: LOG + 'const errorCount = log.split("\\n").filter((line) => / ERROR /.test(line)).length',
      tests: [['errorCount is 2', 'errorCount === 2']],
      alt: LOG.replace('INFO  user=kim action=logout', 'ERROR user=kim action=logout'),
    }),
    task('easy', 'Levels', {
      prompt: 'Make `levels` an object counting each level in `log`: `{ INFO: 3, WARN: 1, ERROR: 2 }`.',
      starter: LOG,
      hint: 'For each line, the level is the third part: `line.split(/\\s+/)[2]`.',
      solution: LOG + 'const levels = {}\nfor (const line of log.split("\\n")) {\n  const level = line.split(/\\s+/)[2]\n  levels[level] = (levels[level] ?? 0) + 1\n}',
      tests: [['levels', same('levels', '{ INFO: 3, WARN: 1, ERROR: 2 }')]],
      alt: LOG.replace('WARN  user=ben action=login', 'INFO  user=ben action=login'),
    }),
    task('medium', 'A line to an object', {
      prompt: `Write \`parseLine(line)\` that returns \`{ date, time, level, ...fields }\` for a line, with every \`key=value\` as a property; \`null\` if the line doesn't fit. Use the regex \`${LINE_RE}\` for the first part, and \`matchAll\` for the fields.`,
      hint: 'Groups 1–3 are the date, time and level; group 4 is the rest, where `matchAll(/(\\w+)=(\\S+)/g)` finds the fields.',
      solution: PARSE,
      tests: [['An ERROR line', same('parseLine("2026-11-12 09:17:05 ERROR user=kim action=pay code=card_declined")', '{ date: "2026-11-12", time: "09:17:05", level: "ERROR", user: "kim", action: "pay", code: "card_declined" }')], ['Not a log line', 'parseLine("hello") === null']],
    }),
    task('medium', 'What went wrong', {
      prompt: 'Using `entries`, show one line per error, like `09:17:05 kim pay: card_declined`.',
      starter: ENTRIES,
      hint: '`entries.filter((e) => e.level === "ERROR")`, then a template for each.',
      solution: ENTRIES + 'for (const e of entries.filter((e) => e.level === "ERROR")) {\n  console.log(`${e.time} ${e.user} ${e.action}: ${e.code}`)\n}',
      tests: [['Shows the two errors', prints('09:17:05 kim pay: card_declined', '09:31:59 ben upload: too_big')]],
      alt: ENTRIES.replace('code=too_big', 'code=no_space'),
    }),
    task('hard', 'Who had trouble', {
      prompt: 'Write `troubleByUser(entries)` that returns an object of user → the number of `WARN` and `ERROR` lines they had. Users with none are left out.',
      starter: ENTRIES,
      hint: 'Filter out `INFO`, then count by `e.user`.',
      solution: ENTRIES + 'function troubleByUser(entries) {\n  const counts = {}\n  for (const e of entries.filter((e) => e.level !== "INFO")) {\n    counts[e.user] = (counts[e.user] ?? 0) + 1\n  }\n  return counts\n}',
      tests: [['The log', same('troubleByUser(entries)', '{ ben: 2, kim: 1 }')], ['Only INFO', same('troubleByUser([{ level: "INFO", user: "x" }])', '{}')]],
    }),
    task('hard', 'Between two times', {
      prompt: 'Write `between(entries, from, to)` that returns the entries whose time is from `from` up to but not including `to` (both like `"09:15:00"`).',
      starter: ENTRIES,
      hint: 'Times written `HH:MM:SS` compare correctly as text: `e.time >= from && e.time < to`.',
      solution: ENTRIES + 'function between(entries, from, to) {\n  return entries.filter((e) => e.time >= from && e.time < to)\n}',
      tests: [['09:15 to 09:30', same('between(entries, "09:15:00", "09:30:00").map((e) => e.time)', '["09:15:40", "09:17:05", "09:20:11"]')], ['None', 'between(entries, "10:00:00", "11:00:00").length === 0']],
    }),
  ],
  questions: [
    mc('What does `/(\\w+)=(\\S+)/g` find in `"user=ana action=pay"`?', ['Each `key=value` pair, with the key and value as groups', 'Only the first word', 'The spaces', 'Nothing'], 0, '\\S+ is "not spaces".'),
    mc('Why can times like `"09:15:40"` be compared as text?', ['They have a fixed width and go from biggest unit to smallest', 'Text is always compared as numbers', 'They can\'t', 'Because of the colons'], 0, 'The same is true of YYYY-MM-DD dates.'),
    mc('What does this show?\n```\nconsole.log("a  b c".split(/\\s+/))\n```', ['`[ \'a\', \'b\', \'c\' ]`', '`[ \'a\', \'\', \'b\', \'c\' ]`', '`[ \'a  b c\' ]`', 'An error'], 0, 'Any run of spaces splits once.', { code: 'console.log("a  b c".split(/\\s+/))', output: "[ 'a', 'b', 'c' ]" }),
    mc('Why turn log lines into objects first?', ['Then filtering, counting and showing use plain property names', 'Logs must be objects', 'It saves disk space', 'Regexes need it'], 0, 'Parse once, use many times.'),
    mc('What does `parseLine` return for a line that doesn\'t fit the pattern?', ['`null`', 'An empty object', 'The line', 'It throws'], 0, 'Callers can then skip it.'),
    mc('What does `{ a: 1, ...{ b: 2 } }` give?', ['`{ a: 1, b: 2 }`', '`{ a: 1 }`', '`[ 1, 2 ]`', 'An error'], 0, 'Spread copies the properties in.', { code: 'console.log({ a: 1, ...{ b: 2 } })', output: '{ a: 1, b: 2 }' }),
  ],
})
