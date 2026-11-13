// Asynchronous JavaScript: Many at once with Promise.all. Lesson, Try-it snippets, challenges and quiz.
import { MDN, makeTopic, mc, prints, qShort, rejectsWhen, resolvesTo, snippet, task, uses } from '../_builders.mjs'

const LATER = 'function later(value, ms) {\n  return new Promise((resolve) => setTimeout(() => resolve(value), ms))\n}\n'
const STOCK = 'const STOCK = { apples: 12, pears: 0, plums: 30 }\nfunction stockOf(fruit) {\n  return new Promise((resolve, reject) => {\n    setTimeout(() => {\n      if (fruit in STOCK) resolve(STOCK[fruit])\n      else reject(new Error(`Unknown fruit: ${fruit}`))\n    }, 30)\n  })\n}\n'

export default makeTopic({
  id: 'promise_all',
  title: 'Many at once: Promise.all',
  paragraphs: [
    'Say a page needs three things from a server: the user, their messages and the weather. Each takes about a second. Awaiting them one after another takes three seconds, but they don\'t depend on each other. Why not ask for all three **at once**?',
    '**`Promise.all(promises)`** takes a list of promises and gives **one** promise that is fulfilled when **all** of them are, with a list of their values **in the same order** as the list you gave, whichever finished first.',
    '```\nfunction later(value, ms) {\n  return new Promise((resolve) => setTimeout(() => resolve(value), ms))\n}\n\nconst start = Date.now()\nconst [user, messages, weather] = await Promise.all([\n  later("Ana", 300),\n  later(4, 200),\n  later("sunny", 100),\n])\nconsole.log(user, messages, weather)\nconsole.log("took about", Math.round((Date.now() - start) / 100) * 100, "ms")\n```',
    'It took about as long as the **slowest** one, not the total. Destructuring (`const [a, b, c] = …`) is a neat way to name the results.',
    'The work starts when you **call** the functions, not when you await. `Promise.all` just waits for promises that are already running. So call them all first, then await them together.',
    'A very common pattern is to turn a list of things into a list of promises with **`map`**, then wait for them all:',
    '```\nfunction later(value, ms) {\n  return new Promise((resolve) => setTimeout(() => resolve(value), ms))\n}\n\nconst ids = [1, 2, 3]\nconst names = await Promise.all(ids.map((id) => later("user" + id, 100)))\nconsole.log(names)\n```',
    'One catch: if **any** promise is rejected, `Promise.all` is rejected straight away with that error, and you lose the others\' values. When some may fail and you still want the rest, use `Promise.allSettled` (next stage).',
  ],
  sandboxCode: LATER + '\nconst results = await Promise.all([later("a", 300), later("b", 100), later("c", 200)])\nconsole.log(results)',
  sandboxSnippets: [
    snippet('Order kept', 'const fast = new Promise((r) => setTimeout(() => r("fast"), 50))\nconst slow = new Promise((r) => setTimeout(() => r("slow"), 200))\nconsole.log(await Promise.all([slow, fast]))'),
    snippet('With map', 'const double = async (n) => n * 2\nconsole.log(await Promise.all([1, 2, 3].map(double)))'),
    snippet('One fails', 'try {\n  await Promise.all([Promise.resolve(1), Promise.reject(new Error("broken")), Promise.resolve(3)])\n} catch (e) {\n  console.log("All failed because:", e.message)\n}'),
    snippet('Plain values too', 'console.log(await Promise.all([1, Promise.resolve(2), 3]))'),
  ],
  readMore: MDN('Web/JavaScript/Reference/Global_Objects/Promise/all', 'MDN: Promise.all()'),
  challenges: [
    task('easy', 'All three', {
      prompt: 'Use `Promise.all` to wait for `a`, `b` and `c` together, and make `values` the list of their results.',
      starter: LATER + 'const a = later("red", 30)\nconst b = later("green", 10)\nconst c = later("blue", 20)\n',
      hint: '`const values = await Promise.all([a, b, c])`.',
      solution: LATER + 'const a = later("red", 30)\nconst b = later("green", 10)\nconst c = later("blue", 20)\nconst values = await Promise.all([a, b, c])',
      tests: [['values is red, green, blue', 'JSON.stringify(values) === JSON.stringify(["red", "green", "blue"])'], ['Uses Promise.all', uses('Promise.all(')]],
    }),
    task('easy', 'Name the results', {
      prompt: 'Wait for the user and the city together with `Promise.all`, destructure them into `user` and `city`, and show `Ana lives in Porto`.',
      starter: LATER + 'const userPromise = later("Ana", 20)\nconst cityPromise = later("Porto", 40)\n',
      hint: '`const [user, city] = await Promise.all([userPromise, cityPromise])`.',
      solution: LATER + 'const userPromise = later("Ana", 20)\nconst cityPromise = later("Porto", 40)\nconst [user, city] = await Promise.all([userPromise, cityPromise])\nconsole.log(`${user} lives in ${city}`)',
      tests: [['Shows Ana lives in Porto', prints('Ana lives in Porto')], ['Uses Promise.all', uses('Promise.all(')]],
    }),
    task('easy', 'Double them all', {
      prompt: 'Make `doubled` the result of running the async `double` on every number in `nums`, all at once, using `map` and `Promise.all`.',
      starter: 'const double = async (n) => n * 2\nconst nums = [4, 9, 15]\n',
      hint: '`const doubled = await Promise.all(nums.map(double))`.',
      solution: 'const double = async (n) => n * 2\nconst nums = [4, 9, 15]\nconst doubled = await Promise.all(nums.map(double))',
      tests: [['doubled is 8, 18, 30', 'JSON.stringify(doubled) === JSON.stringify([8, 18, 30])'], ['Uses map and Promise.all', '_cq_code.includes(".map(") && _cq_code.includes("Promise.all(")']],
    }),
    task('medium', 'Stock check', {
      prompt: 'Write `async function stockList(fruits)` that looks up every fruit\'s stock at once and returns a list of lines like `apples: 12`.',
      starter: STOCK,
      hint: '`const counts = await Promise.all(fruits.map(stockOf))`, then map each fruit with its count.',
      solution: STOCK + 'async function stockList(fruits) {\n  const counts = await Promise.all(fruits.map(stockOf))\n  return fruits.map((fruit, i) => `${fruit}: ${counts[i]}`)\n}',
      tests: [['apples and plums', resolvesTo('stockList(["apples", "plums"])', '["apples: 12", "plums: 30"]')], ['None', resolvesTo('stockList([])', '[]')], ['Uses Promise.all', uses('Promise.all(')]],
    }),
    task('medium', 'Faster together', {
      prompt: 'Write `async function loadPage()` that starts both `later("profile", 100)` and `later("news", 100)` and waits for them **together**, returning `{ profile, news }`. It should take about 100 ms, not 200.',
      starter: LATER,
      hint: '`const [profile, news] = await Promise.all([later("profile", 100), later("news", 100)])`.',
      solution: LATER + 'async function loadPage() {\n  const [profile, news] = await Promise.all([later("profile", 100), later("news", 100)])\n  return { profile, news }\n}',
      tests: [['It gives both', resolvesTo('loadPage()', '{ profile: "profile", news: "news" }')], ['It takes well under 200 ms', '(async () => { const t = Date.now(); await loadPage(); return Date.now() - t < 170 })()']],
    }),
    task('medium', 'Total stock', {
      prompt: 'Write `async function totalStock(fruits)` that returns the total stock of the fruits, looking them all up at once.',
      starter: STOCK,
      hint: 'Get the counts with `Promise.all(fruits.map(stockOf))`, then add them up with `reduce`.',
      solution: STOCK + 'async function totalStock(fruits) {\n  const counts = await Promise.all(fruits.map(stockOf))\n  return counts.reduce((sum, n) => sum + n, 0)\n}',
      tests: [['All three make 42', resolvesTo('totalStock(["apples", "pears", "plums"])', '42')], ['Just pears is 0', resolvesTo('totalStock(["pears"])', '0')]],
    }),
    task('hard', 'One bad apple', {
      prompt: 'Write `async function checkAll(fruits)`: return the counts in order, or, if any lookup fails, return the text `Could not check: ` followed by the error message.',
      starter: STOCK,
      hint: '`try { return await Promise.all(fruits.map(stockOf)) } catch (e) { return "Could not check: " + e.message }`.',
      solution: STOCK + 'async function checkAll(fruits) {\n  try {\n    return await Promise.all(fruits.map(stockOf))\n  } catch (e) {\n    return "Could not check: " + e.message\n  }\n}',
      tests: [['All good', resolvesTo('checkAll(["plums", "apples"])', '[30, 12]')], ['One unknown', resolvesTo('checkAll(["apples", "kiwis"])', '"Could not check: Unknown fruit: kiwis"')]],
    }),
    task('hard', 'Out of stock', {
      prompt: 'Write `async function outOfStock(fruits)` that returns the fruits whose stock is 0, looking them up at once.',
      starter: STOCK,
      hint: 'Get the counts with `Promise.all`, then `fruits.filter((f, i) => counts[i] === 0)`.',
      solution: STOCK + 'async function outOfStock(fruits) {\n  const counts = await Promise.all(fruits.map(stockOf))\n  return fruits.filter((fruit, i) => counts[i] === 0)\n}',
      tests: [['Pears are out', resolvesTo('outOfStock(["apples", "pears", "plums"])', '["pears"]')], ['None out', resolvesTo('outOfStock(["plums"])', '[]')]],
    }),
    task('expert', 'Your own all', {
      prompt: 'Write `async function allOf(promises)` that does what `Promise.all` does for fulfilled promises, **without** using `Promise.all`: await each one in turn and collect the values in order.',
      hint: 'They are already running, so awaiting them one by one still takes only as long as the slowest. `for (const p of promises) values.push(await p)`.',
      solution: 'async function allOf(promises) {\n  const values = []\n  for (const p of promises) {\n    values.push(await p)\n  }\n  return values\n}',
      tests: [['Keeps the order', resolvesTo('allOf([new Promise((r) => setTimeout(() => r(1), 40)), Promise.resolve(2), new Promise((r) => setTimeout(() => r(3), 10))])', '[1, 2, 3]')], ['Doesn\'t use Promise.all', '!_cq_code.includes("Promise.all")'], ['Empty list', resolvesTo('allOf([])', '[]')]],
    }),
    task('expert', 'In batches', {
      prompt: 'Sending 100 requests at once can overload a server. Write `async function inBatches(items, size, task)`: run `task(item)` for `size` items at a time with `Promise.all`, wait for that batch, then do the next, and return all the results in order.',
      hint: 'Loop `for (let i = 0; i < items.length; i += size)`: take `items.slice(i, i + size)`, `await Promise.all(batch.map(task))`, and add the results to a list.',
      solution: 'async function inBatches(items, size, task) {\n  const results = []\n  for (let i = 0; i < items.length; i += size) {\n    const batch = items.slice(i, i + size)\n    results.push(...(await Promise.all(batch.map(task))))\n  }\n  return results\n}',
      tests: [['Results in order', resolvesTo('inBatches([1, 2, 3, 4, 5], 2, async (n) => n * 10)', '[10, 20, 30, 40, 50]')], ['Never more than size at once', '(async () => { let running = 0; let most = 0; const task = async (n) => { running++; most = Math.max(most, running); await new Promise((r) => setTimeout(r, 10)); running--; return n }; await inBatches([1, 2, 3, 4, 5, 6, 7], 3, task); return most === 3 })()']],
    }),
  ],
  questions: [
    mc('When is `Promise.all([p1, p2, p3])` fulfilled?', ['When all three are fulfilled', 'When the first one is', 'Straight away', 'When any one is'], 0, 'It waits for every one.'),
    mc('In what order are the values?', ['The order of the list you gave', 'The order they finished', 'Alphabetical', 'Random'], 0, 'Position matches the input.'),
    mc('What does this show?\n```\nconst slow = new Promise((r) => setTimeout(() => r("slow"), 50))\nconsole.log(await Promise.all([slow, "fast"]))\n```', ['`[ \'slow\', \'fast\' ]`', '`[ \'fast\', \'slow\' ]`', '`slow`', 'An error'], 0, 'Same order as given; plain values are allowed.', { code: 'const slow = new Promise((r) => setTimeout(() => r("slow"), 50))\nconsole.log(await Promise.all([slow, "fast"]))', output: "[ 'slow', 'fast' ]" }),
    mc('Three tasks take 100, 200 and 300 ms. About how long does `Promise.all` of them take?', ['300 ms', '600 ms', '100 ms', '200 ms'], 0, 'As long as the slowest.'),
    mc('What happens if one of the promises is rejected?', ['`Promise.all` is rejected with that error', 'It is skipped', 'Its value is `undefined`', 'It is retried'], 0, 'One failure fails the lot.'),
    mc('When does the work start?', ['When you call the functions that make the promises', 'When `Promise.all` is called', 'When you await', 'When the page loads'], 0, 'Promise.all only waits.'),
    mc('Which line runs `load` for every id at once?', ['`await Promise.all(ids.map(load))`', '`await ids.map(load)`', '`for (const id of ids) await load(id)`', '`Promise.all(load(ids))`'], 0, 'map makes the promises; Promise.all waits for them.'),
    mc('What does this show?\n```\nconst double = async (n) => n * 2\nconsole.log(await Promise.all([1, 2].map(double)))\n```', ['`[ 2, 4 ]`', '`[ 1, 2 ]`', 'Two promises', 'An error'], 0, 'The values, in order.', { code: 'const double = async (n) => n * 2\nconsole.log(await Promise.all([1, 2].map(double)))', output: '[ 2, 4 ]' }),
    qShort('Which method waits for a whole list of promises: `Promise.____`?', 'all', 'Promise.all([…])'),
  ],
})
