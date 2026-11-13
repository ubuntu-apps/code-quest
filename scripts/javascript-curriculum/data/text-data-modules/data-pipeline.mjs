// Text, data and modules: From raw text to a report. Lesson, Try-it snippets, challenges and quiz.
import { MDN, makeTopic, mc, prints, qShort, same, snippet, task } from '../_builders.mjs'

const RUNS = 'const raw = `date, km, minutes\n2026-10-03, 5.2, 31\n2026-10-05, 8.0, 50\n\n2026-10-08, n/a, 20\n2026-10-10, 10.5, 61\n2026-10-12, 3.1, 19\n`\n'
const PARSE = 'function parseRuns(text) {\n  return text\n    .split("\\n")\n    .slice(1)\n    .filter((line) => line.trim() !== "")\n    .map((line) => {\n      const [date, km, minutes] = line.split(",").map((v) => v.trim())\n      return { date, km: Number(km), minutes: Number(minutes) }\n    })\n}\n'
const VALID = 'const isValid = (run) => Number.isFinite(run.km) && run.km > 0 && run.minutes > 0\n'
const READY = RUNS + PARSE + VALID + 'const runs = parseRuns(raw).filter(isValid)\n'
/** Other data, so an answer typed in as fixed values fails. */
const OTHER_RUNS = RUNS.replace('2026-10-05, 8.0, 50', '2026-10-05, x, 50').replace('3.1, 19', '6.4, 40')

export default makeTopic({
  id: 'data_pipeline',
  title: 'From raw text to a report',
  paragraphs: [
    'This stage puts the quest together. Most data jobs follow the same **pipeline**: **read** the raw text, **parse** it into values, **check** and clean them, **work out** what you need, and **format** a report for people. Each step is a small function, and each one\'s output is the next one\'s input.',
    'The example is a runner\'s log, as CSV text exported from an app. It has spaces after the commas, a blank line and a bad row (`n/a`):',
    '```text\ndate, km, minutes\n2026-10-03, 5.2, 31\n2026-10-05, 8.0, 50\n\n2026-10-08, n/a, 20\n2026-10-10, 10.5, 61\n2026-10-12, 3.1, 19\n```',
    '**Parse** into objects with the right types: numbers as numbers, the date as text (or a `Date`). **Check** each row: here, `km` must be a real number above 0. `Number("n/a")` is `NaN`, and `Number.isFinite` catches it. Keep the bad rows aside so you can report them rather than silently drop them.',
    '**Work out** the answers with the list tools you know: totals with `reduce`, the best run with a sort, groups by week or month. **Format** last: `toFixed`, `padStart`, `Intl`.',
    '```\nconst runs = [\n  { date: "2026-10-03", km: 5.2, minutes: 31 },\n  { date: "2026-10-05", km: 8, minutes: 50 },\n]\nconst pace = (r) => r.minutes / r.km\nconst totalKm = runs.reduce((sum, r) => sum + r.km, 0)\nconsole.log(`${runs.length} runs, ${totalKm.toFixed(1)} km`)\nfor (const r of runs) console.log(r.date, pace(r).toFixed(2), "min/km")\n```',
    'Because every step is a separate function, you can test each on a tiny example, swap the input (a different file, data from a server) without touching the rest, and add a step (say, an output as JSON) at the end.',
  ],
  sandboxCode: RUNS + '\nconst lines = raw.split("\\n")\nconsole.log(lines.length, "lines")\nconsole.log(lines[1].split(",").map((v) => v.trim()))\nconsole.log(Number("n/a"), Number.isFinite(Number("n/a")))',
  sandboxSnippets: [
    snippet('Pace as m:ss', 'const pace = 61 / 10.5\nconst m = Math.floor(pace)\nconst s = Math.round((pace - m) * 60)\nconsole.log(`${m}:${String(s).padStart(2, "0")} per km`)'),
    snippet('Bad rows aside', 'const rows = [{ km: 5 }, { km: NaN }, { km: 3 }]\nconst good = rows.filter((r) => Number.isFinite(r.km))\nconst bad = rows.filter((r) => !Number.isFinite(r.km))\nconsole.log(good.length, "good,", bad.length, "bad")'),
  ],
  readMore: MDN('Web/JavaScript/Reference/Global_Objects/Number/isFinite', 'MDN: Number.isFinite()'),
  challenges: [
    task('easy', 'Parse the log', {
      prompt: 'Write `parseRuns(text)` that skips the header and blank lines and turns each line into `{ date, km, minutes }`, with spaces trimmed and `km` and `minutes` as numbers (a bad value becomes `NaN`).',
      starter: RUNS,
      hint: '`split("\\n")`, `slice(1)`, `filter` out blank lines, then `map` each line: split at `","`, trim, and convert with `Number`.',
      solution: RUNS + PARSE,
      tests: [['Five rows', 'parseRuns(raw).length === 5'], ['First row', same('parseRuns(raw)[0]', '{ date: "2026-10-03", km: 5.2, minutes: 31 }')], ['Bad km is NaN', 'Number.isNaN(parseRuns(raw)[2].km)']],
    }),
    task('easy', 'Good and bad', {
      prompt: 'Make `good` the parsed runs that pass `isValid`, and `bad` the dates of the ones that don\'t.',
      starter: RUNS + PARSE + VALID,
      hint: '`const all = parseRuns(raw)`, then two `filter`s; map the bad ones to `r.date`.',
      solution: RUNS + PARSE + VALID + 'const all = parseRuns(raw)\nconst good = all.filter(isValid)\nconst bad = all.filter((r) => !isValid(r)).map((r) => r.date)',
      tests: [['4 good', 'good.length === 4'], ['bad', same('bad', '["2026-10-08"]')]],
      alt: OTHER_RUNS + PARSE + VALID,
    }),
    task('easy', 'Total distance', {
      prompt: 'Make `totalKm` the total distance of `runs` (the good ones), rounded to 1 decimal place as a number.',
      starter: READY,
      hint: '`Math.round(runs.reduce((s, r) => s + r.km, 0) * 10) / 10`.',
      solution: READY + 'const totalKm = Math.round(runs.reduce((s, r) => s + r.km, 0) * 10) / 10',
      tests: [['totalKm is 26.8', 'totalKm === 26.8']],
      alt: OTHER_RUNS + PARSE + VALID + 'const runs = parseRuns(raw).filter(isValid)',
    }),
    task('medium', 'Pace', {
      prompt: 'Write `paceText(run)` that gives a run\'s pace as minutes and seconds per km, like `5:58 /km`: minutes ÷ km, the whole minutes, then the rest as seconds, rounded and padded to 2 digits.',
      hint: '`const p = run.minutes / run.km`; `const m = Math.floor(p)`; `const s = Math.round((p - m) * 60)`.',
      solution: 'function paceText(run) {\n  const p = run.minutes / run.km\n  let m = Math.floor(p)\n  let s = Math.round((p - m) * 60)\n  if (s === 60) {\n    m++\n    s = 0\n  }\n  return `${m}:${String(s).padStart(2, "0")} /km`\n}',
      tests: [['5.2 km in 31', 'paceText({ km: 5.2, minutes: 31 }) === "5:58 /km"'], ['10.5 km in 61', 'paceText({ km: 10.5, minutes: 61 }) === "5:49 /km"'], ['Exact', 'paceText({ km: 2, minutes: 12 }) === "6:00 /km"']],
    }),
    task('medium', 'The longest run', {
      prompt: 'Make `longest` the date of the longest good run, and `fastest` the date of the run with the lowest minutes per km.',
      starter: READY,
      hint: 'Use `reduce` to keep the better run, or sort a copy with `toSorted`.',
      solution: READY + 'const longest = runs.reduce((best, r) => (r.km > best.km ? r : best)).date\nconst pace = (r) => r.minutes / r.km\nconst fastest = runs.reduce((best, r) => (pace(r) < pace(best) ? r : best)).date',
      tests: [['longest', 'longest === "2026-10-10"'], ['fastest', 'fastest === "2026-10-10"']],
      alt: RUNS.replace('10.5, 61', '10.5, 70') + PARSE + VALID + 'const runs = parseRuns(raw).filter(isValid)',
    }),
    task('medium', 'By week', {
      prompt: 'Write `kmByWeek(runs, firstDay)` that adds up the km per week, where week 1 is the 7 days starting `firstDay` (text `YYYY-MM-DD`), week 2 the next 7, and so on. Return an object like `{ "week 1": 13.2, "week 2": 13.6 }`, each rounded to 1 decimal place.',
      starter: READY,
      hint: 'For each run, days since `firstDay` = `Math.round((Date.parse(r.date) - Date.parse(firstDay)) / 86400000)` (both parse as UTC, so no clock change), then `Math.floor(days / 7) + 1`.',
      solution: READY + 'function kmByWeek(runs, firstDay) {\n  const weeks = {}\n  for (const r of runs) {\n    const days = Math.round((Date.parse(r.date) - Date.parse(firstDay)) / 86400000)\n    const key = `week ${Math.floor(days / 7) + 1}`\n    weeks[key] = Math.round(((weeks[key] ?? 0) + r.km) * 10) / 10\n  }\n  return weeks\n}',
      tests: [['From 3 October', same('kmByWeek(runs, "2026-10-03")', '{ "week 1": 13.2, "week 2": 13.6 }')], ['From 1 October', same('kmByWeek(runs, "2026-10-01")', '{ "week 1": 13.2, "week 2": 13.6 }')]],
    }),
    task('hard', 'The report', {
      prompt: 'Show the report below for `runs`: a line per run with the date, a space, the km to 1 decimal place padded on the left to 5, and the pace from `paceText`; then a total line.\n\n```text\n2026-10-03   5.2 km  5:58 /km\n2026-10-05   8.0 km  6:15 /km\n2026-10-10  10.5 km  5:49 /km\n2026-10-12   3.1 km  6:08 /km\nTotal: 4 runs, 26.8 km\n```',
      starter: READY + 'function paceText(run) {\n  const p = run.minutes / run.km\n  const m = Math.floor(p)\n  const s = Math.round((p - m) * 60)\n  return `${m}:${String(s).padStart(2, "0")} /km`\n}\n',
      hint: 'For each run: `` `${r.date} ${r.km.toFixed(1).padStart(5)} km  ${paceText(r)}` ``. The total km as in the earlier challenge, with `toFixed(1)`.',
      solution: READY + 'function paceText(run) {\n  const p = run.minutes / run.km\n  const m = Math.floor(p)\n  const s = Math.round((p - m) * 60)\n  return `${m}:${String(s).padStart(2, "0")} /km`\n}\nfor (const r of runs) {\n  console.log(`${r.date} ${r.km.toFixed(1).padStart(5)} km  ${paceText(r)}`)\n}\nconst total = runs.reduce((s, r) => s + r.km, 0)\nconsole.log(`Total: ${runs.length} runs, ${total.toFixed(1)} km`)',
      tests: [['Shows the report', prints('2026-10-03   5.2 km  5:58 /km', '2026-10-05   8.0 km  6:15 /km', '2026-10-10  10.5 km  5:49 /km', '2026-10-12   3.1 km  6:08 /km', 'Total: 4 runs, 26.8 km')]],
    }),
    task('hard', 'As JSON', {
      prompt: 'Write `summaryJson(runs)` that returns JSON text (indented by 2) of `{ runs, km, bestPace }`: the number of runs, the total km rounded to 1 decimal place, and the lowest minutes per km rounded to 2 decimal places.',
      starter: READY,
      hint: 'Work out the three numbers, then `JSON.stringify({ runs: …, km: …, bestPace: … }, null, 2)`.',
      solution: READY + 'function summaryJson(runs) {\n  const km = Math.round(runs.reduce((s, r) => s + r.km, 0) * 10) / 10\n  const bestPace = Math.round(Math.min(...runs.map((r) => r.minutes / r.km)) * 100) / 100\n  return JSON.stringify({ runs: runs.length, km, bestPace }, null, 2)\n}',
      tests: [['The JSON', 'summaryJson(runs) === JSON.stringify({ runs: 4, km: 26.8, bestPace: 5.81 }, null, 2)'], ['Parses back', 'JSON.parse(summaryJson(runs.slice(0, 1))).km === 5.2']],
    }),
    task('expert', 'The whole pipeline', {
      prompt: 'Write `pipeline(text)` that goes from raw text to a result in one call: parse (you may use `parseRuns`), split into good and bad with `isValid`, and return `{ ok, skipped, km }`: the number of good runs, the dates of the bad rows, and the total good km rounded to 1 decimal place.',
      starter: RUNS + PARSE + VALID,
      hint: 'Call the steps in order and build the object at the end.',
      solution: RUNS + PARSE + VALID + 'function pipeline(text) {\n  const all = parseRuns(text)\n  const good = all.filter(isValid)\n  const skipped = all.filter((r) => !isValid(r)).map((r) => r.date)\n  const km = Math.round(good.reduce((s, r) => s + r.km, 0) * 10) / 10\n  return { ok: good.length, skipped, km }\n}',
      tests: [['The log', same('pipeline(raw)', '{ ok: 4, skipped: ["2026-10-08"], km: 26.8 }')], ['Another log', same('pipeline("date,km,minutes\\n2026-01-01,0,10\\n2026-01-02,4,24\\n")', '{ ok: 1, skipped: ["2026-01-01"], km: 4 }')]],
    }),
    task('expert', 'Monthly totals', {
      prompt: 'Write `monthly(runs)` that gives a list of lines, one per month that has runs, oldest first, like `Oct 2026: 4 runs, 26.8 km`. Use `Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" })` on the first day of each month to make the name.',
      starter: READY,
      hint: 'Group by `r.date.slice(0, 7)` (`"2026-10"`). For each group, `new Date(key + "-01")` (UTC midnight) gives the date to format. Sort the keys first.',
      solution: READY + 'function monthly(runs) {\n  const groups = {}\n  for (const r of runs) {\n    const key = r.date.slice(0, 7)\n    groups[key] = [...(groups[key] ?? []), r]\n  }\n  const fmt = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" })\n  return Object.keys(groups)\n    .sort()\n    .map((key) => {\n      const list = groups[key]\n      const km = list.reduce((s, r) => s + r.km, 0)\n      return `${fmt.format(new Date(key + "-01"))}: ${list.length} runs, ${km.toFixed(1)} km`\n    })\n}',
      tests: [['October', same('monthly(runs)', '["Oct 2026: 4 runs, 26.8 km"]')], ['Two months', same('monthly([{ date: "2026-12-01", km: 2, minutes: 12 }, { date: "2026-12-05", km: 4, minutes: 25 }, { date: "2026-11-30", km: 3, minutes: 18 }, { date: "2026-11-02", km: 1.5, minutes: 9 }])', '["Nov 2026: 2 runs, 4.5 km", "Dec 2026: 2 runs, 6.0 km"]')]],
    }),
  ],
  questions: [
    mc('Which order do the steps of a data pipeline usually go in?', ['Read, parse, check, work out, format', 'Format, parse, read, check', 'Check, read, format, parse', 'Any order'], 0, 'Each step feeds the next.'),
    mc('What does `Number("n/a")` give?', ['`NaN`', '`0`', '`"n/a"`', 'An error'], 0, 'Not a number.', { code: 'console.log(Number("n/a"))', output: 'NaN' }),
    mc('Which check catches `NaN` and `Infinity` but lets real numbers through?', ['`Number.isFinite(x)`', '`typeof x === "number"`', '`x !== null`', '`Boolean(x)`'], 0, 'typeof NaN is "number" too.'),
    mc('Why keep the bad rows aside rather than drop them silently?', ['So you can report them, and someone can fix the data', 'They are needed for the totals', 'JavaScript requires it', 'There is no reason'], 0, 'Silent data loss hides problems.'),
    mc('Why make each step its own function?', ['Each can be tested alone, and swapped or added without touching the rest', 'It runs faster', 'Pipelines need exactly five functions', 'To use more memory'], 0, 'Small, testable pieces.'),
    mc('What does this show?\n```\nconsole.log("[" + (8).toFixed(1).padStart(5) + "]")\n```', ['`[  8.0]`', '`[8.0  ]`', '`[8]`', '`[    8]`'], 0, 'toFixed gives text; padStart adds spaces on the left.', { code: 'console.log("[" + (8).toFixed(1).padStart(5) + "]")', output: '[  8.0]' }),
    mc('When should numbers be formatted as text?', ['At the end, in the report step', 'While parsing', 'Before checking', 'Never'], 0, 'Calculate with numbers, show text.'),
    mc('What does this show?\n```\nconsole.log(" 8.0 ".trim(), Number(" 8.0 "))\n```', ['`8.0 8`', '`8 8`', '`8.0 8.0`', '`NaN`'], 0, 'Number() ignores spaces around a number.', { code: 'console.log(" 8.0 ".trim(), Number(" 8.0 "))', output: '8.0 8' }),
    qShort('A chain of steps where each one\'s output is the next one\'s input is called a…', 'pipeline', 'Read → parse → check → work out → format.'),
  ],
})
