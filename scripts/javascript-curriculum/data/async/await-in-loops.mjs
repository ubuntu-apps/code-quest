// Asynchronous JavaScript: One after another, or all together. Lesson, Try-it snippets, challenges and quiz.
import { MDN, makeTopic, mc, qShort, resolvesTo, snippet, task, uses } from '../_builders.mjs'

const LATER = 'function later(value, ms) {\n  return new Promise((resolve) => setTimeout(() => resolve(value), ms))\n}\n'
const SLOW = 'function slowSquare(n) {\n  return new Promise((resolve) => setTimeout(() => resolve(n * n), 30))\n}\n'

export default makeTopic({
  id: 'await_in_loops',
  title: 'One after another, or all together',
  paragraphs: [
    'You have a list, and an async job to do for each item. There are two ways, and choosing well matters.',
    '**One after another** (in sequence): `await` inside a `for…of` loop. Each job starts only when the one before has finished. Use it when the order matters or each step needs the one before, like moving money between accounts, or not overloading a server.',
    '```\nfunction later(value, ms) {\n  return new Promise((resolve) => setTimeout(() => resolve(value), ms))\n}\n\nconst start = Date.now()\nfor (const page of ["home", "about", "shop"]) {\n  const html = await later(page + ".html", 100)\n  console.log("got", html)\n}\nconsole.log("about", Math.round((Date.now() - start) / 100) * 100, "ms")\n```',
    '**All together** (in parallel): start every job with `map`, then `await Promise.all`. It takes as long as the slowest job instead of the sum. Use it when the jobs don\'t depend on each other.',
    '```\nfunction later(value, ms) {\n  return new Promise((resolve) => setTimeout(() => resolve(value), ms))\n}\n\nconst start = Date.now()\nconst pages = await Promise.all(["home", "about", "shop"].map((p) => later(p + ".html", 100)))\nconsole.log(pages)\nconsole.log("about", Math.round((Date.now() - start) / 100) * 100, "ms")\n```',
    'A trap: **`forEach` doesn\'t wait**. `list.forEach(async (x) => { await … })` starts every job and moves on at once, so code after it runs before any job has finished, and nothing waits for them. Use `for…of` for one after another, or `map` with `Promise.all` for all together.',
    '```\nfunction later(value, ms) {\n  return new Promise((resolve) => setTimeout(() => resolve(value), ms))\n}\n\nconst done = []\n;["a", "b"].forEach(async (x) => {\n  done.push(await later(x, 50))\n})\nconsole.log("done so far:", done)\n```',
    'The same goes for `reduce` and `filter` with async callbacks: they don\'t wait either. To filter by an async check, first get all the answers with `Promise.all`, then filter by them.',
  ],
  sandboxCode: SLOW + '\nconst results = []\nfor (const n of [1, 2, 3]) {\n  results.push(await slowSquare(n))\n}\nconsole.log("one by one:", results)\nconsole.log("together:", await Promise.all([1, 2, 3].map(slowSquare)))',
  sandboxSnippets: [
    snippet('Timing both', SLOW + 'let t = Date.now()\nfor (const n of [1, 2, 3, 4]) await slowSquare(n)\nconsole.log("in sequence:", Date.now() - t >= 100)\nt = Date.now()\nawait Promise.all([1, 2, 3, 4].map(slowSquare))\nconsole.log("in parallel:", Date.now() - t < 100)'),
    snippet('forEach doesn\'t wait', 'let count = 0\n;[1, 2, 3].forEach(async () => {\n  await null\n  count++\n})\nconsole.log("count is still", count)'),
    snippet('Async filter', 'const isEven = async (n) => n % 2 === 0\nconst nums = [1, 2, 3, 4]\nconst answers = await Promise.all(nums.map(isEven))\nconsole.log(nums.filter((n, i) => answers[i]))'),
  ],
  readMore: MDN('Web/JavaScript/Reference/Statements/for-await...of', 'MDN: for await...of'),
  challenges: [
    task('easy', 'One by one', {
      prompt: 'Use a `for…of` loop with `await` to make `squares` the squares of `nums`, one after another.',
      starter: SLOW + 'const nums = [2, 3, 4]\n',
      hint: '`const squares = []`; `for (const n of nums) squares.push(await slowSquare(n))`.',
      solution: SLOW + 'const nums = [2, 3, 4]\nconst squares = []\nfor (const n of nums) {\n  squares.push(await slowSquare(n))\n}',
      tests: [['squares is 4, 9, 16', 'JSON.stringify(squares) === JSON.stringify([4, 9, 16])'], ['Uses for…of with await', '/for\\s*\\(const \\w+ of/.test(_cq_code) && _cq_code.includes("await slowSquare")']],
    }),
    task('easy', 'All together', {
      prompt: 'Make `squares` the squares of `nums`, all at once, with `map` and `Promise.all`.',
      starter: SLOW + 'const nums = [5, 6, 7]\n',
      hint: '`const squares = await Promise.all(nums.map(slowSquare))`.',
      solution: SLOW + 'const nums = [5, 6, 7]\nconst squares = await Promise.all(nums.map(slowSquare))',
      tests: [['squares is 25, 36, 49', 'JSON.stringify(squares) === JSON.stringify([25, 36, 49])'], ['Uses Promise.all', uses('Promise.all(')]],
    }),
    task('easy', 'Fix the forEach', {
      prompt: 'This code shows `Total: 0` because `forEach` doesn\'t wait. Change it to a `for…of` loop so it shows `Total: 29`.',
      starter: SLOW + 'let total = 0\n;[2, 5].forEach(async (n) => {\n  total += await slowSquare(n)\n})\nconsole.log("Total: " + total)\n',
      hint: '`for (const n of [2, 5]) { total += await slowSquare(n) }`.',
      solution: SLOW + 'let total = 0\nfor (const n of [2, 5]) {\n  total += await slowSquare(n)\n}\nconsole.log("Total: " + total)',
      tests: [['total is 29', 'total === 29'], ['Shows Total: 29', '_cq_prints("Total: 29")'], ['No forEach', '!_cq_code.includes("forEach")']],
      typedOk: true,
    }),
    task('medium', 'In order, with a log', {
      prompt: 'Write `async function runJobs(jobs)`: for each job name, in order, await `later(name, 10)` and show `done NAME`. Return how many jobs were done.',
      starter: LATER,
      hint: 'A `for…of` loop with `await later(name, 10)` and a `console.log`; count as you go.',
      solution: LATER + 'async function runJobs(jobs) {\n  let count = 0\n  for (const name of jobs) {\n    await later(name, 10)\n    console.log("done " + name)\n    count++\n  }\n  return count\n}',
      tests: [['Shows them in order', '(async () => { const lines = []; const log = console.log; console.log = (v) => lines.push(String(v)); let n; try { n = await runJobs(["wash", "dry", "fold"]) } finally { console.log = log } return n === 3 && lines.join(",") === "done wash,done dry,done fold" })()'], ['No jobs', resolvesTo('runJobs([])', '0')]],
    }),
    task('medium', 'Which is faster?', {
      prompt: 'Write `async function both(nums)` that returns `{ sequence, parallel }`: the squares worked out one by one, and again all at once. (Both lists are the same; the point is to write both ways.)',
      starter: SLOW,
      hint: 'A `for…of` loop for `sequence`; `Promise.all(nums.map(slowSquare))` for `parallel`.',
      solution: SLOW + 'async function both(nums) {\n  const sequence = []\n  for (const n of nums) {\n    sequence.push(await slowSquare(n))\n  }\n  const parallel = await Promise.all(nums.map(slowSquare))\n  return { sequence, parallel }\n}',
      tests: [['Both lists', resolvesTo('both([1, 2, 3])', '{ sequence: [1, 4, 9], parallel: [1, 4, 9] }')], ['Uses both ways', '_cq_code.includes("Promise.all(") && /for\\s*\\(const \\w+ of/.test(_cq_code)']],
    }),
    task('medium', 'Async filter', {
      prompt: 'Write `async function available(names)` that returns the names for which `isFree(name)` gives `true`, in order. Check them all at once.',
      starter: 'const TAKEN = ["ana", "ben"]\nconst isFree = (name) => new Promise((resolve) => setTimeout(() => resolve(!TAKEN.includes(name)), 10))\n',
      hint: '`const answers = await Promise.all(names.map(isFree))`; `return names.filter((n, i) => answers[i])`.',
      solution: 'const TAKEN = ["ana", "ben"]\nconst isFree = (name) => new Promise((resolve) => setTimeout(() => resolve(!TAKEN.includes(name)), 10))\nasync function available(names) {\n  const answers = await Promise.all(names.map(isFree))\n  return names.filter((name, i) => answers[i])\n}',
      tests: [['Free names', resolvesTo('available(["ana", "kim", "ben", "lee"])', '["kim", "lee"]')], ['None free', resolvesTo('available(["ana"])', '[]')]],
    }),
    task('hard', 'Each needs the one before', {
      prompt: 'Each step of a recipe gives the input of the next. Write `async function cook(start, steps)`: `steps` is a list of async functions; feed `start` into the first, its result into the second, and so on, and return the last result.',
      hint: '`let value = start`; `for (const step of steps) value = await step(value)`; `return value`.',
      solution: 'async function cook(start, steps) {\n  let value = start\n  for (const step of steps) {\n    value = await step(value)\n  }\n  return value\n}',
      tests: [['Three steps', resolvesTo('cook(2, [async (n) => n + 1, async (n) => n * 10, async (n) => n - 5])', '25')], ['No steps', resolvesTo('cook("raw", [])', '"raw"')], ['Text steps', resolvesTo('cook("egg", [async (s) => "boiled " + s, async (s) => s.toUpperCase()])', '"BOILED EGG"')]],
    }),
    task('hard', 'Stop at the first problem', {
      prompt: 'Write `async function payAll(bills, pay)`: pay each bill in order with `await pay(bill)`. If a payment fails, stop and return `Paid N, stopped at BILL`. If all work, return `Paid all N`.',
      hint: 'Count inside a `for…of` loop with `try`…`catch` around `await pay(bill)`; `return` from the catch.',
      solution: 'async function payAll(bills, pay) {\n  let paid = 0\n  for (const bill of bills) {\n    try {\n      await pay(bill)\n    } catch {\n      return `Paid ${paid}, stopped at ${bill}`\n    }\n    paid++\n  }\n  return `Paid all ${paid}`\n}',
      tests: [['All paid', resolvesTo('payAll(["gas", "water"], async () => true)', '"Paid all 2"')], ['Stops at rent', '(async () => { const tried = []; const pay = async (b) => { tried.push(b); if (b === "rent") throw new Error("declined") }; const r = await payAll(["gas", "rent", "phone"], pay); return r === "Paid 1, stopped at rent" && tried.join() === "gas,rent" })()']],
    }),
    task('expert', 'Two at a time', {
      prompt: 'Write `async function twoAtATime(items, task)` that never runs more than 2 tasks at once but starts the next as soon as one finishes, and returns the results in the order of `items`. (Hint: two "workers" each take the next item from a shared index.)',
      hint: 'Keep `let next = 0` and `const results = []`. A worker: `while (next < items.length) { const i = next++; results[i] = await task(items[i]) }`. Run two with `await Promise.all([worker(), worker()])`.',
      solution: 'async function twoAtATime(items, task) {\n  const results = []\n  let next = 0\n  async function worker() {\n    while (next < items.length) {\n      const i = next++\n      results[i] = await task(items[i])\n    }\n  }\n  await Promise.all([worker(), worker()])\n  return results\n}',
      tests: [['Results in order', resolvesTo('twoAtATime([3, 1, 2, 5], async (n) => { await new Promise((r) => setTimeout(r, n * 5)); return n * 2 })', '[6, 2, 4, 10]')], ['Two at once, never more', '(async () => { let running = 0; let most = 0; const task = async (n) => { running++; most = Math.max(most, running); await new Promise((r) => setTimeout(r, 15)); running--; return n }; await twoAtATime([1, 2, 3, 4, 5, 6], task); return most === 2 })()'], ['The next starts as soon as one finishes', '(async () => { const order = []; const task = async (n) => { order.push("start " + n); await new Promise((r) => setTimeout(r, n === 1 ? 120 : 10)); order.push("end " + n); return n }; await twoAtATime([1, 2, 3, 4], task); return order.indexOf("start 4") < order.indexOf("end 1") })()']],
    }),
    task('expert', 'First match', {
      prompt: 'Write `async function findFirst(items, test)`: check the items **one by one** with the async `test`, and return the first item it gives `true` for, without checking any after it; `undefined` if none.',
      hint: '`for (const item of items) if (await test(item)) return item`; after the loop, `return undefined`.',
      solution: 'async function findFirst(items, test) {\n  for (const item of items) {\n    if (await test(item)) return item\n  }\n  return undefined\n}',
      tests: [['Finds 9', resolvesTo('findFirst([2, 4, 9, 11], async (n) => n % 2 === 1)', '9')], ['Stops early', '(async () => { const seen = []; await findFirst([1, 2, 3, 4], async (n) => { seen.push(n); return n === 2 }); return seen.join() === "1,2" })()'], ['None', '(async () => (await findFirst([1, 3], async (n) => n > 5)) === undefined)()']],
    }),
  ],
  questions: [
    mc('`for (const x of list) await job(x)`: how do the jobs run?', ['One after another', 'All at once', 'In random order', 'Only the first runs'], 0, 'Each waits for the one before.'),
    mc('`await Promise.all(list.map(job))`: how do the jobs run?', ['All at once', 'One after another', 'Only the last runs', 'Twice each'], 0, 'map starts them all.'),
    mc('Five jobs of 100 ms each. About how long in sequence, and in parallel?', ['500 ms and 100 ms', '100 ms and 500 ms', '500 ms both', '100 ms both'], 0, 'Sum versus slowest.'),
    mc('Why is `list.forEach(async (x) => await job(x))` a trap?', ['forEach doesn\'t wait, so the code after it runs before the jobs finish', 'It is a syntax error', 'It runs jobs twice', 'It only runs the first job'], 0, 'Use for…of or Promise.all.'),
    mc('What does this show?\n```\nlet count = 0\n;[1, 2, 3].forEach(async () => {\n  await null\n  count++\n})\nconsole.log(count)\n```', ['`0`', '`3`', '`1`', 'An error'], 0, 'None of the callbacks has got past await yet.', { code: 'let count = 0\n;[1, 2, 3].forEach(async () => {\n  await null\n  count++\n})\nconsole.log(count)', output: '0' }),
    mc('When should jobs run one after another?', ['When each needs the one before, or order matters', 'Always', 'When they are independent', 'Never'], 0, 'Otherwise run them together.'),
    mc('How do you filter a list by an async check?', ['Get all the answers with `Promise.all`, then `filter` by them', '`list.filter(async (x) => await check(x))`', '`await list.filter(check)`', 'It can\'t be done'], 0, 'filter doesn\'t wait for promises.'),
    mc('What does this show?\n```\nconst isBig = async (n) => n > 2\nconsole.log([1, 5].filter(isBig).length)\n```', ['`2`: each promise counts as true', '`1`', '`0`', 'An error'], 0, 'A promise is an object, so it is truthy.', { code: 'const isBig = async (n) => n > 2\nconsole.log([1, 5].filter(isBig).length)', output: '2' }),
    qShort('Which loop works with `await` to do jobs one after another: `for…__`?', 'of', 'for (const x of list) await …'),
  ],
})
