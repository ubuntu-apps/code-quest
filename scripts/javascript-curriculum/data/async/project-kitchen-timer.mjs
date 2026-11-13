// Asynchronous JavaScript side quest (easy): A kitchen timer. Lesson, Try-it snippets, challenges and quiz.
import { makeProject, mc, prints, resolvesTo, snippet, task } from '../_builders.mjs'

const WAIT = 'function wait(ms) {\n  return new Promise((resolve) => setTimeout(resolve, ms))\n}\n'
/** Runs `run` with console.log caught, and checks what it logged. */
const logged = (run, lines) => `(async () => { const got = []; const log = console.log; console.log = (...v) => got.push(v.join(" ")); try { ${run} } finally { console.log = log } return JSON.stringify(got) === ${JSON.stringify(JSON.stringify(lines))} })()`

export default makeProject('easy', {
  id: 'proj_kitchen_timer',
  title: 'A kitchen timer',
  paragraphs: [
    'Build the brains of a kitchen timer app. In the real app a "second" is 1000 ms; here a tick is just a few milliseconds, so the checks run quickly.',
    '- `formatTime(seconds)` shows a time as `m:ss`, like `1:05`.\n- `countdown(seconds, tick)` shows each time left, from `seconds` down to `0:00`, waiting `tick` ms between, then `Ding!`.\n- `timers(list, tick)` runs several kitchen timers **at once**, and says which finished in what order.',
    '```text\n0:03\n0:02\n0:01\n0:00\nDing!\n```',
    'You will need `wait(ms)`, which you wrote in this quest, and `await` in a loop.',
  ],
  sandboxCode: WAIT + '\nfor (let s = 3; s >= 0; s--) {\n  console.log(s)\n  await wait(200)\n}\nconsole.log("Ding!")',
  sandboxSnippets: [
    snippet('Padding', 'console.log(String(5).padStart(2, "0"), Math.floor(65 / 60), 65 % 60)'),
  ],
  challenges: [
    task('easy', 'Minutes and seconds', {
      prompt: 'Write `formatTime(seconds)` that gives `m:ss`: `formatTime(65)` is `"1:05"`, `formatTime(7)` is `"0:07"`.',
      hint: '`Math.floor(seconds / 60)` minutes and `seconds % 60` seconds, padded with `padStart(2, "0")`.',
      solution: 'function formatTime(seconds) {\n  const m = Math.floor(seconds / 60)\n  const s = String(seconds % 60).padStart(2, "0")\n  return `${m}:${s}`\n}',
      tests: [['formatTime(65)', 'formatTime(65) === "1:05"'], ['formatTime(7)', 'formatTime(7) === "0:07"'], ['formatTime(600)', 'formatTime(600) === "10:00"']],
    }),
    task('easy', 'Wait', {
      prompt: 'Write `wait(ms)`, a promise that is fulfilled after `ms` milliseconds, and use it to show `Start`, then `Stop` 50 ms later.',
      hint: '`return new Promise((resolve) => setTimeout(resolve, ms))`; then `console.log("Start")`, `await wait(50)`, `console.log("Stop")`.',
      solution: WAIT + 'console.log("Start")\nawait wait(50)\nconsole.log("Stop")',
      tests: [['Shows Start, Stop', prints('Start', 'Stop')], ['wait waits', '(async () => { const t = Date.now(); await wait(40); return Date.now() - t >= 30 })()']],
      typedOk: true,
    }),
    task('medium', 'Count down', {
      prompt: 'Write `async function countdown(seconds, tick)` that shows each time left with `formatTime`, from `seconds` down to `0:00`, waiting `tick` ms between, then shows `Ding!`.',
      starter: WAIT + 'function formatTime(seconds) {\n  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`\n}\n',
      hint: '`for (let s = seconds; s >= 0; s--) { console.log(formatTime(s)); if (s > 0) await wait(tick) }`, then `Ding!`.',
      solution: WAIT + 'function formatTime(seconds) {\n  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`\n}\nasync function countdown(seconds, tick) {\n  for (let s = seconds; s >= 0; s--) {\n    console.log(formatTime(s))\n    if (s > 0) await wait(tick)\n  }\n  console.log("Ding!")\n}',
      tests: [['countdown(3, 5)', logged('await countdown(3, 5)', ['0:03', '0:02', '0:01', '0:00', 'Ding!'])], ['countdown(0, 5)', logged('await countdown(0, 5)', ['0:00', 'Ding!'])], ['It waits', '(async () => { const log = console.log; console.log = () => {}; const t = Date.now(); try { await countdown(3, 20) } finally { console.log = log } return Date.now() - t >= 50 })()']],
    }),
    task('medium', 'Pause and stop', {
      prompt: 'Write `async function countdownUntil(seconds, tick, shouldStop)` that counts down like `countdown` (returning instead of showing), but before each tick checks `shouldStop()`: if it is true, return `"Stopped at M:SS"`. If it reaches zero, return `"Ding!"`.',
      starter: WAIT + 'function formatTime(seconds) {\n  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`\n}\n',
      hint: 'In the loop over `s`: `if (shouldStop()) return `Stopped at ${formatTime(s)}``, then `await wait(tick)`.',
      solution: WAIT + 'function formatTime(seconds) {\n  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`\n}\nasync function countdownUntil(seconds, tick, shouldStop) {\n  for (let s = seconds; s > 0; s--) {\n    if (shouldStop()) return `Stopped at ${formatTime(s)}`\n    await wait(tick)\n  }\n  return "Ding!"\n}',
      tests: [['Runs out', resolvesTo('countdownUntil(3, 5, () => false)', '"Ding!"')], ['Stopped after two ticks', '(async () => { let checks = 0; return (await countdownUntil(70, 5, () => ++checks > 2)) === "Stopped at 1:08" })()']],
    }),
    task('hard', 'Several timers', {
      prompt: 'Write `async function timers(list, tick)`: `list` is like `[["eggs", 4], ["toast", 2]]`. Run every timer **at once** (each waits `seconds * tick` ms), and return the names in the order they finish.',
      starter: WAIT,
      hint: 'Keep `const done = []`. `await Promise.all(list.map(async ([name, s]) => { await wait(s * tick); done.push(name) }))`, then return `done`.',
      solution: WAIT + 'async function timers(list, tick) {\n  const done = []\n  await Promise.all(\n    list.map(async ([name, seconds]) => {\n      await wait(seconds * tick)\n      done.push(name)\n    }),\n  )\n  return done\n}',
      tests: [['Shortest first', resolvesTo('timers([["eggs", 4], ["toast", 2], ["tea", 6]], 10)', '["toast", "eggs", "tea"]')], ['At once', '(async () => { const t = Date.now(); await timers([["a", 5], ["b", 5], ["c", 5]], 10); return Date.now() - t < 120 })()']],
    }),
    task('hard', 'Announce each', {
      prompt: 'Write `async function announce(list, tick)` that runs the timers at once like `timers`, showing `NAME is ready!` the moment each finishes, and then `All done` once they all have.',
      starter: WAIT,
      hint: 'The same as `timers`, with a `console.log` instead of the `push`, and `All done` after `await Promise.all(…)`.',
      solution: WAIT + 'async function announce(list, tick) {\n  await Promise.all(\n    list.map(async ([name, seconds]) => {\n      await wait(seconds * tick)\n      console.log(`${name} is ready!`)\n    }),\n  )\n  console.log("All done")\n}',
      tests: [['Pasta and sauce', logged('await announce([["pasta", 5], ["sauce", 3]], 10)', ['sauce is ready!', 'pasta is ready!', 'All done'])], ['Nothing', logged('await announce([], 10)', ['All done'])]],
    }),
  ],
  questions: [
    mc('What does `formatTime(125)` give?', ['`2:05`', '`2:5`', '`1:25`', '`125`'], 0, '125 s is 2 min 5 s, padded.', { code: 'function formatTime(seconds) {\n  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`\n}\nconsole.log(formatTime(125))', output: '2:05' }),
    mc('Why use `await wait(tick)` in the countdown loop instead of `setTimeout` for each line?', ['Each step waits for the one before, so the loop reads in order', 'setTimeout can\'t count down', 'It is the only way to show text', 'It is faster'], 0, 'await makes a loop that pauses.'),
    mc('How do you run several timers at the same time?', ['Start them all, then `await Promise.all`', 'Await each in a for…of loop', 'Use one long wait', 'setInterval with no clear'], 0, 'In parallel.'),
    mc('Timers of 4, 2 and 6 seconds run at once. In what order do they finish?', ['2, 4, 6', '4, 2, 6', '6, 4, 2', 'All at the same moment'], 0, 'Shortest first.'),
    mc('How long do timers of 4, 2 and 6 seconds take together, run at once?', ['About 6 seconds', '12 seconds', '2 seconds', '4 seconds'], 0, 'As long as the longest.'),
    mc('What does `String(5).padStart(2, "0")` give?', ['`05`', '`50`', '`5`', '`005`'], 0, 'Padded on the left to 2 characters.', { code: 'console.log(String(5).padStart(2, "0"))', output: '05' }),
  ],
})
