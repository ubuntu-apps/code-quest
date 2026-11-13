// Asynchronous JavaScript: race, allSettled and any. Lesson, Try-it snippets, challenges and quiz.
import { MDN, makeTopic, mc, qShort, rejectsWhen, resolvesTo, snippet, task, uses } from '../_builders.mjs'

const LATER = 'function later(value, ms) {\n  return new Promise((resolve) => setTimeout(() => resolve(value), ms))\n}\n'
const FAIL = 'function failLater(message, ms) {\n  return new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms))\n}\n'

export default makeTopic({
  id: 'race_settled',
  title: 'race, allSettled and any',
  paragraphs: [
    '`Promise.all` waits for everything and fails if anything fails. Sometimes you want something else. JavaScript has three more ways to combine promises.',
    '**`Promise.allSettled(promises)`** waits for them all, but **never fails**. It gives one result object per promise: `{ status: "fulfilled", value }` or `{ status: "rejected", reason }`. Use it when some may fail and you still want the rest.',
    '```\nconst results = await Promise.allSettled([\n  Promise.resolve("photo 1"),\n  Promise.reject(new Error("photo 2 is missing")),\n  Promise.resolve("photo 3"),\n])\nfor (const r of results) {\n  if (r.status === "fulfilled") console.log("got", r.value)\n  else console.log("skipped:", r.reason.message)\n}\n```',
    '**`Promise.race(promises)`** settles as soon as the **first** one settles, the same way: fulfilled if the first one to finish worked, rejected if it failed. Its classic use is a **timeout**: race the real work against a timer that rejects.',
    '```\nfunction later(value, ms) {\n  return new Promise((resolve) => setTimeout(() => resolve(value), ms))\n}\nfunction timeout(ms) {\n  return new Promise((_, reject) => setTimeout(() => reject(new Error("Too slow")), ms))\n}\n\ntry {\n  const data = await Promise.race([later("data", 500), timeout(200)])\n  console.log(data)\n} catch (e) {\n  console.log(e.message)\n}\n```',
    '**`Promise.any(promises)`** gives the first one that **works**, ignoring failures, and only fails if they **all** fail. Use it to ask several servers and take whichever answers first.',
    '| Method | Settles when | Fails when |\n|---|---|---|\n| `all` | all have worked | any one fails |\n| `allSettled` | all have settled | never |\n| `race` | the first settles | the first to settle failed |\n| `any` | the first works | all have failed |',
  ],
  sandboxCode: LATER + '\nconst winner = await Promise.race([later("tortoise", 300), later("hare", 100)])\nconsole.log(winner, "wins")',
  sandboxSnippets: [
    snippet('allSettled', 'const r = await Promise.allSettled([Promise.resolve(1), Promise.reject(new Error("no"))])\nconsole.log(r.map((x) => x.status))'),
    snippet('any', 'const first = await Promise.any([Promise.reject(new Error("a")), new Promise((r) => setTimeout(() => r("b"), 50))])\nconsole.log(first)'),
    snippet('race with a failure', 'const fast = new Promise((_, reject) => setTimeout(() => reject(new Error("fast fail")), 10))\nconst slow = new Promise((r) => setTimeout(() => r("slow"), 100))\ntry {\n  await Promise.race([fast, slow])\n} catch (e) {\n  console.log("race:", e.message)\n}'),
  ],
  readMore: MDN('Web/JavaScript/Reference/Global_Objects/Promise/allSettled', 'MDN: Promise.allSettled()'),
  challenges: [
    task('easy', 'The fastest', {
      prompt: 'Make `first` the value of whichever of `a`, `b` and `c` finishes first, using `Promise.race`.',
      starter: LATER + 'const a = later("bus", 60)\nconst b = later("bike", 20)\nconst c = later("walk", 90)\n',
      hint: '`const first = await Promise.race([a, b, c])`.',
      solution: LATER + 'const a = later("bus", 60)\nconst b = later("bike", 20)\nconst c = later("walk", 90)\nconst first = await Promise.race([a, b, c])',
      tests: [['first is bike', 'first === "bike"'], ['Uses Promise.race', uses('Promise.race(')]],
      alt: LATER + 'const a = later("bus", 10)\nconst b = later("bike", 50)\nconst c = later("walk", 90)\n',
    }),
    task('easy', 'Every result', {
      prompt: 'Use `Promise.allSettled` on the three uploads, and make `statuses` the list of their `status` values.',
      starter: LATER + FAIL + 'const uploads = [later("a.jpg", 10), failLater("b.jpg too big", 20), later("c.jpg", 30)]\n',
      hint: '`const results = await Promise.allSettled(uploads)`, then `results.map((r) => r.status)`.',
      solution: LATER + FAIL + 'const uploads = [later("a.jpg", 10), failLater("b.jpg too big", 20), later("c.jpg", 30)]\nconst results = await Promise.allSettled(uploads)\nconst statuses = results.map((r) => r.status)',
      tests: [['statuses', 'JSON.stringify(statuses) === JSON.stringify(["fulfilled", "rejected", "fulfilled"])'], ['Uses Promise.allSettled', uses('Promise.allSettled(')]],
      typedOk: true,
    }),
    task('easy', 'Whichever works', {
      prompt: 'Two mirrors fail and one works. Make `file` the first result that works, using `Promise.any`.',
      starter: LATER + FAIL + 'const mirrors = [failLater("mirror 1 down", 10), later("song.mp3", 40), failLater("mirror 3 down", 20)]\n',
      hint: '`const file = await Promise.any(mirrors)`.',
      solution: LATER + FAIL + 'const mirrors = [failLater("mirror 1 down", 10), later("song.mp3", 40), failLater("mirror 3 down", 20)]\nconst file = await Promise.any(mirrors)',
      tests: [['file is song.mp3', 'file === "song.mp3"'], ['Uses Promise.any', uses('Promise.any(')]],
    }),
    task('medium', 'Only the good ones', {
      prompt: 'Write `async function goodOnes(promises)` that returns the values of the promises that worked, in order, ignoring the failures.',
      starter: LATER + FAIL,
      hint: '`(await Promise.allSettled(promises)).filter((r) => r.status === "fulfilled").map((r) => r.value)`.',
      solution: LATER + FAIL + 'async function goodOnes(promises) {\n  const results = await Promise.allSettled(promises)\n  return results.filter((r) => r.status === "fulfilled").map((r) => r.value)\n}',
      tests: [['Mixed', resolvesTo('goodOnes([later(1, 20), failLater("x", 10), later(3, 5)])', '[1, 3]')], ['All fail', resolvesTo('goodOnes([failLater("x", 5)])', '[]')]],
    }),
    task('medium', 'What went wrong', {
      prompt: 'Write `async function problems(promises)` that returns the error messages of the promises that failed, in order.',
      starter: LATER + FAIL,
      hint: 'Filter for `status === "rejected"`, then map to `r.reason.message`.',
      solution: LATER + FAIL + 'async function problems(promises) {\n  const results = await Promise.allSettled(promises)\n  return results.filter((r) => r.status === "rejected").map((r) => r.reason.message)\n}',
      tests: [['Two problems', resolvesTo('problems([failLater("disk full", 20), later("ok", 5), failLater("no access", 10)])', '["disk full", "no access"]')], ['No problems', resolvesTo('problems([later(1, 5)])', '[]')]],
    }),
    task('medium', 'A timeout', {
      prompt: 'Write `function timeout(ms)` that returns a promise rejected with `Error("Timed out")` after `ms` milliseconds.',
      hint: '`new Promise((_, reject) => setTimeout(() => reject(new Error("Timed out")), ms))`.',
      solution: 'function timeout(ms) {\n  return new Promise((_, reject) => setTimeout(() => reject(new Error("Timed out")), ms))\n}',
      tests: [['It is rejected', rejectsWhen('timeout(10)', 'Timed out')], ['Not before ms', '(async () => { const t = Date.now(); try { await timeout(50) } catch { return Date.now() - t >= 40 } return false })()']],
    }),
    task('hard', 'Load with a time limit', {
      prompt: 'Write `async function loadWithin(promise, ms)` that gives the value if it arrives within `ms`, and `"too slow"` otherwise. Use `Promise.race` and the `timeout` function.',
      starter: LATER + 'function timeout(ms) {\n  return new Promise((_, reject) => setTimeout(() => reject(new Error("Timed out")), ms))\n}\n',
      hint: '`try { return await Promise.race([promise, timeout(ms)]) } catch { return "too slow" }`.',
      solution: LATER + 'function timeout(ms) {\n  return new Promise((_, reject) => setTimeout(() => reject(new Error("Timed out")), ms))\n}\nasync function loadWithin(promise, ms) {\n  try {\n    return await Promise.race([promise, timeout(ms)])\n  } catch {\n    return "too slow"\n  }\n}',
      tests: [['In time', resolvesTo('loadWithin(later("map", 10), 80)', '"map"')], ['Too slow', resolvesTo('loadWithin(later("map", 120), 20)', '"too slow"')]],
    }),
    task('hard', 'A summary', {
      prompt: 'Write `async function summary(promises)` that returns text like `3 worked, 1 failed`.',
      starter: LATER + FAIL,
      hint: 'Count the `"fulfilled"` results from `Promise.allSettled`; the rest failed.',
      solution: LATER + FAIL + 'async function summary(promises) {\n  const results = await Promise.allSettled(promises)\n  const worked = results.filter((r) => r.status === "fulfilled").length\n  return `${worked} worked, ${results.length - worked} failed`\n}',
      tests: [['3 and 1', resolvesTo('summary([later(1, 5), later(2, 5), failLater("x", 5), later(4, 5)])', '"3 worked, 1 failed"')], ['0 and 2', resolvesTo('summary([failLater("a", 5), failLater("b", 5)])', '"0 worked, 2 failed"')]],
    }),
    task('expert', 'Ask every server', {
      prompt: 'Write `async function fastestServer(servers)`: `servers` is an object of name → promise. Return the **name** of the first server whose promise works. If they all fail, return `"all down"`.',
      starter: LATER + FAIL,
      hint: 'Turn each entry into a promise of its name: `Object.entries(servers).map(([name, p]) => p.then(() => name))`. Then `Promise.any`, inside `try`…`catch`.',
      solution: LATER + FAIL + 'async function fastestServer(servers) {\n  const named = Object.entries(servers).map(([name, p]) => p.then(() => name))\n  try {\n    return await Promise.any(named)\n  } catch {\n    return "all down"\n  }\n}',
      tests: [['eu answers first', resolvesTo('fastestServer({ us: later("ok", 50), eu: later("ok", 20), asia: failLater("down", 5) })', '"eu"')], ['All down', resolvesTo('fastestServer({ us: failLater("x", 10), eu: failLater("y", 5) })', '"all down"')]],
    }),
    task('expert', 'Your own race', {
      prompt: 'Write `function raceOf(promises)` that does what `Promise.race` does, **without** using it: return a new promise, and pass its `resolve` and `reject` to every promise\'s `.then`.',
      hint: '`return new Promise((resolve, reject) => { for (const p of promises) p.then(resolve, reject) })`. A promise settles only once, so the first one wins.',
      solution: 'function raceOf(promises) {\n  return new Promise((resolve, reject) => {\n    for (const p of promises) {\n      p.then(resolve, reject)\n    }\n  })\n}',
      tests: [['First to work', resolvesTo('raceOf([new Promise((r) => setTimeout(() => r("slow"), 50)), new Promise((r) => setTimeout(() => r("fast"), 10))])', '"fast"')], ['First to fail', rejectsWhen('raceOf([new Promise((r) => setTimeout(() => r("slow"), 50)), new Promise((_, no) => setTimeout(() => no(new Error("boom")), 10))])', 'boom')], ['Doesn\'t use Promise.race', '!_cq_code.includes("Promise.race")']],
    }),
  ],
  questions: [
    mc('Which method never fails, and reports how each promise went?', ['`Promise.allSettled`', '`Promise.all`', '`Promise.race`', '`Promise.any`'], 0, 'One result object per promise.'),
    mc('What does `Promise.race` give?', ['The result of the first promise to settle, worked or failed', 'The fastest one that worked', 'Every result', 'The slowest'], 0, 'First to finish, either way.'),
    mc('What does `Promise.any` give?', ['The first promise that works; it fails only if all fail', 'The first to settle', 'All values', 'A random one'], 0, 'Failures are ignored until all have failed.'),
    mc('What does this show?\n```\nconst r = await Promise.allSettled([Promise.resolve(1), Promise.reject(new Error("no"))])\nconsole.log(r.map((x) => x.status))\n```', ['`[ \'fulfilled\', \'rejected\' ]`', '`[ 1 ]`', 'An error', '`[ \'fulfilled\' ]`'], 0, 'One status each.', { code: 'const r = await Promise.allSettled([Promise.resolve(1), Promise.reject(new Error("no"))])\nconsole.log(r.map((x) => x.status))', output: "[ 'fulfilled', 'rejected' ]" }),
    mc('How do you give up on slow work after 2 seconds?', ['Race it against a promise that rejects after 2 seconds', 'Use Promise.all', 'Use setInterval', 'You can\'t'], 0, 'A timeout race.'),
    mc('In an `allSettled` result for a failure, where is the error?', ['`reason`', '`value`', '`error`', '`message`'], 0, '{ status: "rejected", reason }'),
    mc('What does this show?\n```\nconst a = new Promise((r) => setTimeout(() => r("a"), 50))\nconst b = new Promise((r) => setTimeout(() => r("b"), 10))\nconsole.log(await Promise.race([a, b]))\n```', ['`b`', '`a`', '`[ \'a\', \'b\' ]`', 'An error'], 0, 'b settles first.', { code: 'const a = new Promise((r) => setTimeout(() => r("a"), 50))\nconst b = new Promise((r) => setTimeout(() => r("b"), 10))\nconsole.log(await Promise.race([a, b]))', output: 'b' }),
    mc('You load 20 photos and want to show every one that loaded, even if some fail. Which method?', ['`Promise.allSettled`', '`Promise.all`', '`Promise.race`', '`Promise.any`'], 0, 'All results, never fails.'),
    qShort('In an `allSettled` result, what is the `status` of a promise that worked?', 'fulfilled', '{ status: "fulfilled", value }'),
  ],
})
