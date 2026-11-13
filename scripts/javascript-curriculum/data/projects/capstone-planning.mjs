// Capstone: Plan your own project. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, prints, qShort, resolvesTo, same, snippet, task, throwsWhen } from '../_builders.mjs'

const LOG = 'const log = [\n  { habit: "read", date: "2026-11-05" },\n  { habit: "read", date: "2026-11-06" },\n  { habit: "run", date: "2026-11-06" },\n  { habit: "read", date: "2026-11-08" },\n  { habit: "read", date: "2026-11-09" },\n  { habit: "read", date: "2026-11-10" },\n  { habit: "run", date: "2026-11-10" },\n]\n'
const NEXT_DAY = 'function nextDay(date) {\n  const d = new Date(date + "T00:00:00Z")\n  d.setUTCDate(d.getUTCDate() + 1)\n  return d.toISOString().slice(0, 10)\n}\n'
const STREAK = 'function streak(log, habit, today) {\n  const days = new Set(log.filter((e) => e.habit === habit).map((e) => e.date))\n  let count = 0\n  let day = today\n  while (days.has(day)) {\n    count++\n    const d = new Date(day + "T00:00:00Z")\n    d.setUTCDate(d.getUTCDate() - 1)\n    day = d.toISOString().slice(0, 10)\n  }\n  return count\n}\n'
const EXPECT = 'function expectEqual(label, actual, expected) {\n  const ok = JSON.stringify(actual) === JSON.stringify(expected)\n  return ok ? `PASS ${label}` : `FAIL ${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`\n}\n'

export default makeTopic({
  id: 'capstone_planning',
  title: 'Plan your own project',
  paragraphs: [
    'The best way to keep learning is to build something **you** want: a tracker for your training, a tool for your club, a game for a younger sibling, a page that shows data you care about. This last capstone is about **how** to do that well. The challenges walk through the process on an example, a habit tracker, so you can use the same steps on your own idea.',
    '**1. Write down what it does, in a few sentences.** "I tick off habits each day. It shows my current streak for each habit and how I did this week." Anything not in those sentences waits for version 2. Small and finished beats big and half-done.',
    '**2. Decide the shape of the data first.** Most of a program follows from it. Here: a list of `{ habit, date }` entries, dates as `YYYY-MM-DD` text. Plain data can be saved as JSON and checked by eye.',
    '```\nconst log = [\n  { habit: "read", date: "2026-11-09" },\n  { habit: "read", date: "2026-11-10" },\n  { habit: "run", date: "2026-11-10" },\n]\nconsole.log(JSON.stringify(log))\n```',
    '**3. Build the core as small functions that return values**, and try each one on a tiny example you can work out by hand. **4. Write tests** that check those examples, so that when you change something later you know at once if you broke something. A test can be as simple as a function that compares what you got with what you expected.',
    '**5. Handle the bad cases**: missing data, a typo in a date, a server that is down. Decide what the user should see. **6. Add the outside world last**: the page, the buttons, saving, the network. Keep that part thin, and the core easy to test.',
    'Then take your own idea through the same steps. When you get stuck, shrink the problem: get the smallest version working, then add one thing at a time. And read the error messages: they nearly always say what is wrong and where.',
  ],
  sandboxCode: LOG + '\nconst reading = log.filter((e) => e.habit === "read").map((e) => e.date)\nconsole.log(reading)',
  sandboxSnippets: [
    snippet('A tiny test', 'function double(n) {\n  return n * 2\n}\nconsole.log(double(3) === 6 ? "PASS double(3)" : "FAIL double(3)")'),
    snippet('Yesterday', 'const d = new Date("2026-11-01T00:00:00Z")\nd.setUTCDate(d.getUTCDate() - 1)\nconsole.log(d.toISOString().slice(0, 10))'),
  ],
  challenges: [
    task('easy', 'The data', {
      prompt: 'Make `habits` the list of the different habits in `log`, each once, A to Z, and `daysLogged` the number of different dates on which anything was logged.',
      starter: LOG,
      hint: '`[...new Set(log.map((e) => e.habit))].sort()`; the dates the same way, then `.size` or `.length`.',
      solution: LOG + 'const habits = [...new Set(log.map((e) => e.habit))].sort()\nconst daysLogged = new Set(log.map((e) => e.date)).size',
      tests: [['habits', same('habits', '["read", "run"]')], ['daysLogged is 5', 'daysLogged === 5']],
      alt: (starter) => starter.replace('{ habit: "run", date: "2026-11-06" }', '{ habit: "swim", date: "2026-11-07" }'),
    }),
    task('easy', 'Tick a habit', {
      prompt: 'Write `tick(log, habit, date)` that returns a **new** log with `{ habit, date }` added, unless that habit is already ticked on that date (then return the log unchanged). Habits are stored trimmed and in small letters.',
      hint: 'Clean the name first; check with `some`; return `[...log, { habit: name, date }]`.',
      solution: 'function tick(log, habit, date) {\n  const name = habit.trim().toLowerCase()\n  if (log.some((e) => e.habit === name && e.date === date)) return log\n  return [...log, { habit: name, date }]\n}',
      tests: [['Adds', same('tick([], " Read ", "2026-11-12")', '[{ habit: "read", date: "2026-11-12" }]')], ['No doubles', '(() => { const log = [{ habit: "read", date: "2026-11-12" }]; return tick(log, "READ", "2026-11-12") === log })()'], ['New list', '(() => { const log = []; tick(log, "run", "2026-11-12"); return log.length === 0 })()']],
    }),
    task('easy', 'A test helper', {
      prompt: 'Write `expectEqual(label, actual, expected)` that compares the two values as JSON and returns `PASS LABEL`, or `FAIL LABEL: expected EXPECTED, got ACTUAL` (both written as JSON).',
      hint: '`JSON.stringify(actual) === JSON.stringify(expected)`, then one of two template strings.',
      solution: EXPECT,
      tests: [['Pass', 'expectEqual("sum", 2 + 2, 4) === "PASS sum"'], ['Fail', 'expectEqual("list", [1, 2], [1, 3]) === "FAIL list: expected [1,3], got [1,2]"'], ['Text', 'expectEqual("name", "ana", "Ana") === \'FAIL name: expected "Ana", got "ana"\'']],
    }),
    task('medium', 'Check the dates', {
      prompt: 'Write `checkEntry(entry)` that throws `Error("Bad date: DATE")` unless `entry.date` is `YYYY-MM-DD` **and** a real day (so `2026-02-30` is bad), and `Error("No habit")` if `habit` is missing or blank. It returns `true` for a good entry.',
      hint: 'A regex for the shape; then make `new Date(date + "T00:00:00Z")` and check that `toISOString().slice(0, 10)` gives the same text back.',
      solution: 'function checkEntry(entry) {\n  if (!entry.habit || entry.habit.trim() === "") throw new Error("No habit")\n  const date = entry.date\n  const real = /^\\d{4}-\\d{2}-\\d{2}$/.test(date ?? "") && !Number.isNaN(Date.parse(date)) && new Date(date + "T00:00:00Z").toISOString().slice(0, 10) === date\n  if (!real) throw new Error(`Bad date: ${date}`)\n  return true\n}',
      tests: [['Good', 'checkEntry({ habit: "read", date: "2026-11-12" }) === true'], ['Not a real day', throwsWhen('checkEntry({ habit: "read", date: "2026-02-30" })', 'Bad date: 2026-02-30')], ['Wrong shape', throwsWhen('checkEntry({ habit: "read", date: "12/11/2026" })', 'Bad date')], ['No habit', throwsWhen('checkEntry({ habit: "  ", date: "2026-11-12" })', 'No habit')]],
    }),
    task('medium', 'The next day', {
      prompt: 'Write `nextDay(date)` that gives the day after a `YYYY-MM-DD` date, as the same kind of text. Work in UTC.',
      hint: '`new Date(date + "T00:00:00Z")`, `setUTCDate(getUTCDate() + 1)`, `toISOString().slice(0, 10)`.',
      solution: NEXT_DAY,
      tests: [['Normal', 'nextDay("2026-11-12") === "2026-11-13"'], ['Month end', 'nextDay("2026-11-30") === "2026-12-01"'], ['Year end', 'nextDay("2026-12-31") === "2027-01-01"']],
    }),
    task('medium', 'The streak', {
      prompt: 'Write `streak(log, habit, today)`: the number of days in a row, ending **today**, on which the habit was ticked. If it wasn\'t ticked today, the streak is 0.',
      starter: LOG,
      hint: 'Put the habit\'s dates in a `Set`. Start at `today` and step back a day at a time (UTC) while the set has that day, counting.',
      solution: LOG + STREAK,
      tests: [['read on 10 Nov', 'streak(log, "read", "2026-11-10") === 3'], ['run on 10 Nov', 'streak(log, "run", "2026-11-10") === 1'], ['Not today', 'streak(log, "read", "2026-11-11") === 0']],
    }),
    task('hard', 'Test the streak', {
      prompt: 'Use `expectEqual` to write `testStreak()`, which returns a list of results for at least these three cases: an empty log gives 0; three days in a row ending today give 3; a gap the day before gives 1. Show each result.',
      starter: STREAK + EXPECT,
      hint: '`return [expectEqual("empty log", streak([], "read", "2026-11-12"), 0), …]`, with small logs you write by hand. Then `testStreak().forEach((r) => console.log(r))`.',
      solution: STREAK + EXPECT + 'function testStreak() {\n  const day = (date) => ({ habit: "read", date })\n  return [\n    expectEqual("empty log", streak([], "read", "2026-11-12"), 0),\n    expectEqual("three in a row", streak([day("2026-11-10"), day("2026-11-11"), day("2026-11-12")], "read", "2026-11-12"), 3),\n    expectEqual("a gap", streak([day("2026-11-10"), day("2026-11-12")], "read", "2026-11-12"), 1),\n  ]\n}\ntestStreak().forEach((r) => console.log(r))',
      tests: [['At least three, all PASS', '(() => { const r = testStreak(); return r.length >= 3 && r.every((x) => x.startsWith("PASS")) })()'], ['Shows them', '_cq_lines.filter((l) => l.startsWith("PASS")).length >= 3'], ['It catches a broken streak', '(() => { const real = streak; streak = () => 0; try { return testStreak().some((x) => x.startsWith("FAIL")) } finally { streak = real } })()']],
      typedOk: true,
    }),
    task('hard', 'This week', {
      prompt: 'Write `week(log, habit, monday)` that returns a 7-letter text for the week starting on `monday`: `x` for each day the habit was ticked, `.` for the others. For example `"xx.xx.."`.',
      starter: LOG + NEXT_DAY,
      hint: 'Put the habit\'s dates in a `Set`. Loop 7 times from `monday`, using `nextDay` to move on.',
      solution: LOG + NEXT_DAY + 'function week(log, habit, monday) {\n  const days = new Set(log.filter((e) => e.habit === habit).map((e) => e.date))\n  let text = ""\n  let day = monday\n  for (let i = 0; i < 7; i++) {\n    text += days.has(day) ? "x" : "."\n    day = nextDay(day)\n  }\n  return text\n}',
      tests: [['read, from 2 Nov', 'week(log, "read", "2026-11-02") === "...xx.x"'], ['read, from 9 Nov', 'week(log, "read", "2026-11-09") === "xx....."'], ['run, from 2 Nov', 'week(log, "run", "2026-11-02") === "....x.."']],
    }),
    task('expert', 'Save to a server', {
      prompt: 'Version 2 saves to a server. Write `async function sync(log, send)`: `send(text)` is an async function that saves JSON text and may fail. Try up to 3 times; return `"Saved N entries"` when it works, or `"Not saved: MESSAGE"` with the last error after three failures.',
      hint: 'A `for` loop of 3 attempts with `try { await send(JSON.stringify(log)); return … } catch (e) { last = e }`.',
      solution: 'async function sync(log, send) {\n  let last\n  for (let attempt = 1; attempt <= 3; attempt++) {\n    try {\n      await send(JSON.stringify(log))\n      return `Saved ${log.length} entries`\n    } catch (e) {\n      last = e\n    }\n  }\n  return `Not saved: ${last.message}`\n}',
      tests: [['Works after a failure', '(async () => { let calls = 0; let got = ""; const send = async (t) => { calls++; if (calls === 1) throw new Error("offline"); got = t }; const r = await sync([{ habit: "read", date: "2026-11-12" }], send); return r === "Saved 1 entries" && calls === 2 && JSON.parse(got)[0].habit === "read" })()'], ['Gives up', resolvesTo('sync([], async () => { throw new Error("server down") })', '"Not saved: server down"')]],
    }),
    task('expert', 'The report', {
      prompt: 'Show the weekly report for `log` and the week starting `2026-11-09`, with today being `2026-11-10`: one line per habit, A to Z, like `read  xx.....  streak 3`: the habit padded to 6, the week, two spaces, then the streak.',
      starter: LOG + NEXT_DAY + STREAK + 'function week(log, habit, monday) {\n  const days = new Set(log.filter((e) => e.habit === habit).map((e) => e.date))\n  let text = ""\n  let day = monday\n  for (let i = 0; i < 7; i++) {\n    text += days.has(day) ? "x" : "."\n    day = nextDay(day)\n  }\n  return text\n}\n',
      hint: 'Get the habits A to Z, then for each: `` `${h.padEnd(6)}${week(log, h, monday)}  streak ${streak(log, h, today)}` ``.',
      solution: LOG + NEXT_DAY + STREAK + 'function week(log, habit, monday) {\n  const days = new Set(log.filter((e) => e.habit === habit).map((e) => e.date))\n  let text = ""\n  let day = monday\n  for (let i = 0; i < 7; i++) {\n    text += days.has(day) ? "x" : "."\n    day = nextDay(day)\n  }\n  return text\n}\nconst monday = "2026-11-09"\nconst today = "2026-11-10"\nfor (const h of [...new Set(log.map((e) => e.habit))].sort()) {\n  console.log(`${h.padEnd(6)}${week(log, h, monday)}  streak ${streak(log, h, today)}`)\n}',
      tests: [['Shows the report', prints('read  xx.....  streak 3', 'run   .x.....  streak 1')]],
      alt: (starter) => starter.replace('{ habit: "run", date: "2026-11-10" },', '{ habit: "run", date: "2026-11-09" },'),
    }),
  ],
  questions: [
    mc('What should you decide first when planning a program?', ['What it does, in a few sentences, and the shape of its data', 'The colours of the page', 'Which framework is most popular', 'The name of every function'], 0, 'The rest follows from those.'),
    mc('Why keep version 1 small?', ['Small and finished beats big and half-done; you can add more later', 'Small programs run faster', 'Big programs aren\'t allowed', 'It doesn\'t matter'], 0, 'Finish, then grow.'),
    mc('Why write tests for your own project?', ['So you know at once when a later change breaks something', 'Only teachers need tests', 'They make the program faster', 'JavaScript requires them'], 0, 'A safety net for changes.'),
    mc('What does `expectEqual("x", [1], [1])` give, with the helper from this stage?', ['`PASS x`', '`FAIL x`', '`true`', 'An error'], 0, 'Compared as JSON, they match.', { code: 'function expectEqual(label, actual, expected) {\n  const ok = JSON.stringify(actual) === JSON.stringify(expected)\n  return ok ? `PASS ${label}` : `FAIL ${label}`\n}\nconsole.log(expectEqual("x", [1], [1]))', output: 'PASS x' }),
    mc('Why does `checkEntry` turn the date into a `Date` and back?', ['To catch dates with the right shape that don\'t exist, like 30 February', 'To change its time zone', 'To make it shorter', 'Dates must be objects'], 0, 'A real day survives the round trip unchanged.', { code: 'console.log(new Date("2026-02-28T00:00:00Z").toISOString().slice(0, 10))', output: '2026-02-28' }),
    mc('When you get stuck, what helps most?', ['Shrink the problem: get the smallest version working, then add one thing at a time', 'Rewrite everything from scratch', 'Add more features', 'Ignore the error message'], 0, 'And read the error message.'),
    mc('Where does the code that talks to the page or the network go?', ['At the edges, kept thin, after the core works', 'In every function', 'First, before anything else', 'Nowhere'], 0, 'The core stays easy to test.'),
    mc('What does this show?\n```\nconsole.log(new Set(["a", "b", "a"]).size)\n```', ['`2`', '`3`', '`1`', 'An error'], 0, 'A Set keeps each value once.', { code: 'console.log(new Set(["a", "b", "a"]).size)', output: '2' }),
    qShort('What do you call a small piece of code that checks another piece gives the expected answer?', 'test', 'expectEqual("sum", 2 + 2, 4)'),
  ],
})
