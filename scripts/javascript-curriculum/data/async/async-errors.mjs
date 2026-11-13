// Asynchronous JavaScript: When async code fails. Lesson, Try-it snippets, challenges and quiz.
import { MDN, makeTopic, mc, prints, qShort, rejectsWhen, resolvesTo, snippet, task, uses } from '../_builders.mjs'

const LOAD = 'const SCORES = { ana: 12, ben: 7 }\nfunction loadScore(name) {\n  return new Promise((resolve, reject) => {\n    setTimeout(() => {\n      if (name in SCORES) resolve(SCORES[name])\n      else reject(new Error(`No player called ${name}`))\n    }, 10)\n  })\n}\n'

export default makeTopic({
  id: 'async_errors',
  title: 'When async code fails',
  paragraphs: [
    'Async work fails all the time: the network drops, the server says no, the file isn\'t there. With `await`, a rejected promise behaves like a **thrown error** on the line that awaited it. So the `try`…`catch` you already know handles it:',
    '```\nfunction loadUser(id) {\n  return new Promise((resolve, reject) => {\n    setTimeout(() => {\n      if (id === 1) resolve({ name: "Ana" })\n      else reject(new Error("User not found"))\n    }, 100)\n  })\n}\n\nasync function show(id) {\n  try {\n    const user = await loadUser(id)\n    console.log("Hello,", user.name)\n  } catch (e) {\n    console.log("Could not load:", e.message)\n  }\n}\n\nshow(1)\nshow(2)\n```',
    'Inside an `async` function, a `throw` turns into a **rejected promise** for the caller. So an async function can fail in the usual way, and whoever awaits it can catch it, one level up or several.',
    '```\nasync function parsePrice(text) {\n  const n = Number(text)\n  if (Number.isNaN(n)) throw new Error("Bad price: " + text)\n  return n\n}\n\nparsePrice("abc").catch((e) => console.log(e.message))\n```',
    'Watch out for a promise nobody waits for. If you call an async function **without** `await` (or `.catch`), and it fails, the error has nowhere to go: you get an "unhandled rejection" and your `try`…`catch` around the call won\'t see it, because the call returned before the failure happened.',
    '```text\nasync function fail() {\n  throw new Error("boom")\n}\n\ntry {\n  fail()                // not awaited: nothing is thrown here\n} catch {\n  console.log("never runs")\n}\n\nfail().catch((e) => console.log("caught:", e.message))   // handled\n```',
    'Decide **where** a failure should be handled: close to where it happens if you can do something useful (use a fallback, try again), or higher up if the caller knows better (show a message to the user). `finally` works with `await` too, for code that must always run.',
  ],
  sandboxCode: 'async function risky(ok) {\n  await new Promise((r) => setTimeout(r, 100))\n  if (!ok) throw new Error("it went wrong")\n  return "it worked"\n}\n\ntry {\n  console.log(await risky(true))\n  console.log(await risky(false))\n} catch (e) {\n  console.log("Caught:", e.message)\n}',
  sandboxSnippets: [
    snippet('Throw becomes reject', 'async function f() {\n  throw new Error("nope")\n}\nf().catch((e) => console.log("rejected with", e.message))'),
    snippet('Finally with await', 'async function job() {\n  try {\n    await Promise.reject(new Error("failed"))\n  } catch (e) {\n    console.log(e.message)\n  } finally {\n    console.log("spinner hidden")\n  }\n}\njob()'),
    snippet('A fallback', 'async function load() {\n  throw new Error("offline")\n}\nlet data\ntry {\n  data = await load()\n} catch {\n  data = []\n}\nconsole.log(data)'),
  ],
  readMore: MDN('Learn_web_development/Extensions/Async_JS/Promises', 'MDN: How to use promises'),
  challenges: [
    task('easy', 'Catch the await', {
      prompt: 'Awaiting `loadScore("zed")` fails. Wrap it in `try`…`catch` so the program shows `Error: ` and the message instead of stopping.',
      starter: LOAD + 'const score = await loadScore("zed")\nconsole.log(score)\n',
      hint: '`try { … } catch (e) { console.log("Error: " + e.message) }` around the two lines.',
      solution: LOAD + 'try {\n  const score = await loadScore("zed")\n  console.log(score)\n} catch (e) {\n  console.log("Error: " + e.message)\n}',
      tests: [['Shows Error: No player called zed', prints('Error: No player called zed')], ['Uses try and catch', '_cq_code.includes("try") && _cq_code.includes("catch")']],
      typedOk: true,
    }),
    task('easy', 'Throw in async', {
      prompt: 'Write `async function withdraw(balance, amount)` that throws `Error("Not enough money")` if `amount` is more than `balance`, else returns the new balance.',
      hint: 'A guard clause with `throw`, then `return balance - amount`.',
      solution: 'async function withdraw(balance, amount) {\n  if (amount > balance) throw new Error("Not enough money")\n  return balance - amount\n}',
      tests: [['withdraw(50, 20) gives 30', resolvesTo('withdraw(50, 20)', '30')], ['withdraw(10, 20) is rejected', rejectsWhen('withdraw(10, 20)', 'Not enough money')]],
    }),
    task('easy', 'A safe score', {
      prompt: 'Write `async function safeScore(name)` that gives the player\'s score, or `0` if `loadScore` fails.',
      starter: LOAD,
      hint: '`try { return await loadScore(name) } catch { return 0 }`.',
      solution: LOAD + 'async function safeScore(name) {\n  try {\n    return await loadScore(name)\n  } catch {\n    return 0\n  }\n}',
      tests: [['safeScore("ana") gives 12', resolvesTo('safeScore("ana")', '12')], ['safeScore("zed") gives 0', resolvesTo('safeScore("zed")', '0')]],
    }),
    task('medium', 'Always hide the spinner', {
      prompt: 'Write `async function show(name)` that shows `Loading…`, then the score (or `Not found` if it fails), and **always** `Done` last, using `finally`.',
      starter: LOAD,
      hint: '`console.log("Loading…")`, then `try { console.log(await loadScore(name)) } catch { console.log("Not found") } finally { console.log("Done") }`.',
      solution: LOAD + 'async function show(name) {\n  console.log("Loading…")\n  try {\n    console.log(await loadScore(name))\n  } catch {\n    console.log("Not found")\n  } finally {\n    console.log("Done")\n  }\n}',
      tests: [['show("ben")', '(async () => { const lines = []; const log = console.log; console.log = (v) => lines.push(String(v)); try { await show("ben") } finally { console.log = log } return lines.join("|") === "Loading…|7|Done" })()'], ['show("zed")', '(async () => { const lines = []; const log = console.log; console.log = (v) => lines.push(String(v)); try { await show("zed") } finally { console.log = log } return lines.join("|") === "Loading…|Not found|Done" })()'], ['Uses finally', uses('finally')]],
    }),
    task('medium', 'Total team score', {
      prompt: 'Write `async function teamScore(names)` that adds up the scores of the players, skipping any that can\'t be loaded, and returns the total.',
      starter: LOAD,
      hint: 'Loop over `names`; inside, `try { total += await loadScore(name) } catch { }`.',
      solution: LOAD + 'async function teamScore(names) {\n  let total = 0\n  for (const name of names) {\n    try {\n      total += await loadScore(name)\n    } catch {\n      // skip players that can\'t be loaded\n    }\n  }\n  return total\n}',
      tests: [['ana and ben make 19', resolvesTo('teamScore(["ana", "ben"])', '19')], ['zed is skipped', resolvesTo('teamScore(["ana", "zed", "ben"])', '19')], ['No players is 0', resolvesTo('teamScore([])', '0')]],
    }),
    task('medium', 'Pass it on', {
      prompt: 'Write `async function doubleScore(name)` that returns the score times 2. If `loadScore` fails, **don\'t** catch it here: let the caller see the rejection.',
      starter: LOAD,
      hint: 'Just `return (await loadScore(name)) * 2`. No `try`.',
      solution: LOAD + 'async function doubleScore(name) {\n  return (await loadScore(name)) * 2\n}',
      tests: [['doubleScore("ben") gives 14', resolvesTo('doubleScore("ben")', '14')], ['doubleScore("zed") is rejected', rejectsWhen('doubleScore("zed")', 'No player called zed')]],
    }),
    task('hard', 'A better message', {
      prompt: 'Write `async function profile(name)` that returns `NAME: SCORE points`. If loading fails, throw a new `Error("Profile unavailable for NAME")` instead of the original one.',
      starter: LOAD,
      hint: '`try { const s = await loadScore(name); return … } catch { throw new Error(…) }`.',
      solution: LOAD + 'async function profile(name) {\n  try {\n    const score = await loadScore(name)\n    return `${name}: ${score} points`\n  } catch {\n    throw new Error(`Profile unavailable for ${name}`)\n  }\n}',
      tests: [['profile("ana")', resolvesTo('profile("ana")', '"ana: 12 points"')], ['profile("zed") gives the new message', rejectsWhen('profile("zed")', 'Profile unavailable for zed')]],
    }),
    task('hard', 'Find the culprit', {
      prompt: 'The `try`…`catch` below never catches the failure, because the call isn\'t awaited. Fix it so the program shows `Caught: No player called zed`.',
      starter: LOAD + 'async function main() {\n  try {\n    loadScore("zed")\n  } catch (e) {\n    console.log("Caught: " + e.message)\n  }\n}\nawait main()\n',
      hint: 'Add `await` before `loadScore("zed")`.',
      solution: LOAD + 'async function main() {\n  try {\n    await loadScore("zed")\n  } catch (e) {\n    console.log("Caught: " + e.message)\n  }\n}\nawait main()',
      tests: [['Shows Caught: No player called zed', prints('Caught: No player called zed')], ['Awaits loadScore', uses('await loadScore("zed")')]],
      typedOk: true,
    }),
    task('expert', 'Results and failures', {
      prompt: 'Write `async function report(names)` that returns `{ found, missing }`: `found` an object of name to score for the players that loaded, `missing` a list of the names that didn\'t, in order.',
      starter: LOAD,
      hint: 'Start with `{ found: {}, missing: [] }`; in the loop, `found[name] = await loadScore(name)` inside `try`, and `missing.push(name)` in `catch`.',
      solution: LOAD + 'async function report(names) {\n  const found = {}\n  const missing = []\n  for (const name of names) {\n    try {\n      found[name] = await loadScore(name)\n    } catch {\n      missing.push(name)\n    }\n  }\n  return { found, missing }\n}',
      tests: [['Mixed', resolvesTo('report(["ana", "zed", "ben", "kim"])', '{ found: { ana: 12, ben: 7 }, missing: ["zed", "kim"] }')], ['All found', resolvesTo('report(["ben"])', '{ found: { ben: 7 }, missing: [] }')]],
    }),
    task('expert', 'Give up after a time', {
      prompt: 'Write `async function within(promise, ms)` that gives the promise\'s value if it settles in time, but is rejected with `Error("Timed out")` if `ms` passes first. Use `Promise.race` with a promise that rejects after `ms`.',
      hint: 'Make `const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timed out")), ms))`, then `return Promise.race([promise, timeout])`.',
      solution: 'async function within(promise, ms) {\n  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timed out")), ms))\n  return Promise.race([promise, timeout])\n}',
      tests: [['Fast enough', resolvesTo('within(new Promise((r) => setTimeout(() => r("ok"), 10)), 100)', '"ok"')], ['Too slow', rejectsWhen('within(new Promise((r) => setTimeout(() => r("ok"), 150)), 20)', 'Timed out')]],
    }),
  ],
  questions: [
    mc('With `await`, what does a rejected promise act like?', ['An error thrown on that line', 'A value of `undefined`', 'Nothing happens', 'A `false`'], 0, 'So try…catch handles it.'),
    mc('What happens to a `throw` inside an `async` function?', ['The function\'s promise is rejected with that error', 'The whole program stops at once', 'It is ignored', 'It returns undefined'], 0, 'The caller can catch it.'),
    mc('What does this show?\n```\nasync function f() {\n  throw new Error("x")\n}\nf().catch((e) => console.log("got", e.message))\n```', ['`got x`', 'Nothing', 'An uncaught error', '`x`'], 0, 'The rejection reaches .catch.', { code: 'async function f() {\n  throw new Error("x")\n}\nf().catch((e) => console.log("got", e.message))', output: 'got x' }),
    mc('Why does `try { fail() } catch {}` not catch a failing async `fail()`?', ['Without `await`, the call returns a promise before it fails, so nothing is thrown there', 'try…catch never works with functions', 'Async errors can\'t be caught', 'You need two catch blocks'], 0, 'Await it, or add .catch.'),
    mc('When does a `finally` block run in an async function?', ['After the try (and catch), whether it worked or failed', 'Only after an error', 'Only on success', 'Before the try'], 0, 'Always, for tidying up.'),
    mc('What does this show?\n```\nasync function load() {\n  throw new Error("offline")\n}\nlet data\ntry {\n  data = await load()\n} catch {\n  data = "cached"\n}\nconsole.log(data)\n```', ['`cached`', '`offline`', 'undefined', 'An error'], 0, 'The fallback is used.', { code: 'async function load() {\n  throw new Error("offline")\n}\nlet data\ntry {\n  data = await load()\n} catch {\n  data = "cached"\n}\nconsole.log(data)', output: 'cached' }),
    mc('A function can\'t do anything useful about a failure. What should it do?', ['Let the error go up to the caller', 'Catch it and return `undefined`', 'Catch it and do nothing', 'Restart the program'], 0, 'Handle errors where you can do something about them.'),
    mc('What is an "unhandled rejection"?', ['A rejected promise that no `.catch` or `await` in a try ever handled', 'A syntax error', 'A promise that is still pending', 'A cancelled timer'], 0, 'Its error has nowhere to go.'),
    qShort('Which statement do you wrap around `await` to handle a failure?', 'try', 'try … catch'),
  ],
})
