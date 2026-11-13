// Asynchronous JavaScript: Retrying, polling and giving up. Lesson, Try-it snippets, challenges and quiz.
import { MDN, makeTopic, mc, qShort, rejectsWhen, resolvesTo, snippet, task } from '../_builders.mjs'

const WAIT = 'function wait(ms) {\n  return new Promise((resolve) => setTimeout(resolve, ms))\n}\n'
/** A task that fails `failures` times, then works: for tests. */
const FLAKY = '((failures, value) => { let calls = 0; const f = async () => { calls++; if (calls <= failures) throw new Error("blip " + calls); return value }; f.calls = () => calls; return f })'

export default makeTopic({
  id: 'retry_patterns',
  title: 'Retrying, polling and giving up',
  paragraphs: [
    'Networks are unreliable. A request that fails once often works a moment later. Good async code expects this, and has a plan: **try again** a few times, **check back** until something is ready, and know when to **give up**.',
    '**Retrying**: call the task; if it fails, wait a little and call it again, up to a limit. When the limit is reached, let the last error go up to the caller.',
    '```\nfunction wait(ms) {\n  return new Promise((resolve) => setTimeout(resolve, ms))\n}\n\nasync function retry(task, tries, delay) {\n  for (let attempt = 1; attempt <= tries; attempt++) {\n    try {\n      return await task()\n    } catch (e) {\n      console.log(`attempt ${attempt} failed: ${e.message}`)\n      if (attempt === tries) throw e\n      await wait(delay)\n    }\n  }\n}\n\nlet calls = 0\nconst flaky = async () => {\n  calls++\n  if (calls < 3) throw new Error("server busy")\n  return "it worked"\n}\nconsole.log(await retry(flaky, 5, 100))\n```',
    'Notice `return await task()` inside `try`: the `await` matters, because without it a failure would happen after the function had already returned, outside the `try`.',
    '**Backing off**: if a busy server fails, hammering it with retries makes things worse. Wait **longer** each time, often doubling: 100 ms, 200, 400, 800… This is called **exponential backoff**.',
    '**Polling**: some jobs take a while on the server (making a video, a payment being checked). You ask "is it done yet?" every so often until it is, with a limit so you don\'t ask for ever.',
    '```\nfunction wait(ms) {\n  return new Promise((resolve) => setTimeout(resolve, ms))\n}\n\nlet progress = 0\nconst checkJob = async () => {\n  progress += 40\n  return Math.min(progress, 100)\n}\n\nfor (let i = 0; i < 10; i++) {\n  const percent = await checkJob()\n  console.log(percent + "%")\n  if (percent === 100) break\n  await wait(100)\n}\n```',
    'Never retry something that can\'t work, like a `404` or a wrong password: it will fail every time. Retry **temporary** problems (timeouts, a busy server) and report the rest straight away.',
  ],
  sandboxCode: WAIT + '\nfor (const delay of [100, 200, 400]) {\n  console.log("waiting", delay, "ms")\n  await wait(delay)\n}\nconsole.log("done")',
  sandboxSnippets: [
    snippet('Doubling', 'let delay = 100\nfor (let attempt = 1; attempt <= 5; attempt++) {\n  console.log("attempt", attempt, "then wait", delay)\n  delay *= 2\n}'),
    snippet('Give up', WAIT + 'async function alwaysFails() {\n  throw new Error("down")\n}\nlet tries = 0\nwhile (tries < 3) {\n  tries++\n  try {\n    await alwaysFails()\n  } catch {\n    await wait(50)\n  }\n}\nconsole.log("gave up after", tries, "tries")'),
  ],
  readMore: MDN('Learn_web_development/Extensions/Async_JS/Implementing_a_promise-based_API', 'MDN: Implementing a promise-based API'),
  challenges: [
    task('easy', 'Try three times', {
      prompt: 'Write `async function tryThree(task)` that calls `task()` up to 3 times and returns the first value that works. If all three fail, throw the last error.',
      hint: 'A `for` loop from 1 to 3 with `try { return await task() } catch (e) { if (attempt === 3) throw e }`.',
      solution: 'async function tryThree(task) {\n  for (let attempt = 1; attempt <= 3; attempt++) {\n    try {\n      return await task()\n    } catch (e) {\n      if (attempt === 3) throw e\n    }\n  }\n}',
      tests: [['Works after 2 failures', resolvesTo(`tryThree(${FLAKY}(2, "ok"))`, '"ok"')], ['Gives up after 3', rejectsWhen(`tryThree(${FLAKY}(5, "ok"))`, 'blip 3')], ['Stops calling once it works', `(async () => { const t = ${FLAKY}(0, "ok"); await tryThree(t); return t.calls() === 1 })()`]],
    }),
    task('easy', 'Wait between tries', {
      prompt: 'Write `async function retry(task, tries, delay)` that calls `task()` up to `tries` times, waiting `delay` ms after each failure, and returns the first value that works or throws the last error.',
      starter: WAIT,
      hint: 'Like the lesson: in the `catch`, throw on the last attempt, else `await wait(delay)`.',
      solution: WAIT + 'async function retry(task, tries, delay) {\n  for (let attempt = 1; attempt <= tries; attempt++) {\n    try {\n      return await task()\n    } catch (e) {\n      if (attempt === tries) throw e\n      await wait(delay)\n    }\n  }\n}',
      tests: [['Works after 1 failure', resolvesTo(`retry(${FLAKY}(1, 7), 3, 10)`, '7')], ['Gives up', rejectsWhen(`retry(${FLAKY}(9, 7), 2, 10)`, 'blip 2')], ['Waits between tries', `(async () => { const t = Date.now(); await retry(${FLAKY}(2, 1), 3, 30); return Date.now() - t >= 50 })()`]],
    }),
    task('easy', 'The delays', {
      prompt: 'Write `function backoff(first, tries)` that returns the list of waits for exponential backoff: `backoff(100, 4)` gives `[100, 200, 400, 800]`.',
      hint: 'Start at `first` and double each time: `first * 2 ** i` for `i` from 0.',
      solution: 'function backoff(first, tries) {\n  const delays = []\n  for (let i = 0; i < tries; i++) {\n    delays.push(first * 2 ** i)\n  }\n  return delays\n}',
      tests: [['backoff(100, 4)', 'JSON.stringify(backoff(100, 4)) === "[100,200,400,800]"'], ['backoff(5, 1)', 'JSON.stringify(backoff(5, 1)) === "[5]"'], ['backoff(5, 0)', 'JSON.stringify(backoff(5, 0)) === "[]"']],
    }),
    task('medium', 'Retry with backoff', {
      prompt: 'Write `async function retryBackoff(task, tries, first)`: like `retry`, but the wait after the first failure is `first` ms, and it doubles after each failure after that.',
      starter: WAIT,
      hint: 'Keep `let delay = first`; in the `catch`, `await wait(delay)` then `delay *= 2`.',
      solution: WAIT + 'async function retryBackoff(task, tries, first) {\n  let delay = first\n  for (let attempt = 1; attempt <= tries; attempt++) {\n    try {\n      return await task()\n    } catch (e) {\n      if (attempt === tries) throw e\n      await wait(delay)\n      delay *= 2\n    }\n  }\n}',
      tests: [['Works in the end', resolvesTo(`retryBackoff(${FLAKY}(3, "yes"), 5, 5)`, '"yes"')], ['Doubles the wait', `(async () => { const t = Date.now(); await retryBackoff(${FLAKY}(3, 1), 4, 20); const took = Date.now() - t; return took >= 130 && took < 400 })()`], ['Gives up', rejectsWhen(`retryBackoff(${FLAKY}(9, 1), 2, 5)`, 'blip 2')]],
    }),
    task('medium', 'Poll until done', {
      prompt: 'Write `async function pollUntilDone(check, every)`: call the async `check()` repeatedly, waiting `every` ms between calls, until it gives `"done"`. Return how many calls it took.',
      starter: WAIT,
      hint: '`let calls = 0`; `while (true) { calls++; if ((await check()) === "done") return calls; await wait(every) }`.',
      solution: WAIT + 'async function pollUntilDone(check, every) {\n  let calls = 0\n  while (true) {\n    calls++\n    if ((await check()) === "done") return calls\n    await wait(every)\n  }\n}',
      tests: [['Done on the 4th call', '(async () => { let n = 0; const check = async () => (++n >= 4 ? "done" : "working"); return (await pollUntilDone(check, 5)) === 4 })()'], ['Done at once', resolvesTo('pollUntilDone(async () => "done", 5)', '1')]],
    }),
    task('medium', 'Poll, but not for ever', {
      prompt: 'Write `async function pollAtMost(check, every, max)`: like `pollUntilDone`, but give up after `max` calls by throwing `Error("Still not done after MAX checks")`.',
      starter: WAIT,
      hint: 'A `for` loop from 1 to `max`: return the count when done, else wait; after the loop, throw.',
      solution: WAIT + 'async function pollAtMost(check, every, max) {\n  for (let calls = 1; calls <= max; calls++) {\n    if ((await check()) === "done") return calls\n    await wait(every)\n  }\n  throw new Error(`Still not done after ${max} checks`)\n}',
      tests: [['Done on the 2nd', '(async () => { let n = 0; return (await pollAtMost(async () => (++n === 2 ? "done" : "no"), 5, 5)) === 2 })()'], ['Gives up', rejectsWhen('pollAtMost(async () => "working", 5, 3)', 'Still not done after 3 checks')]],
    }),
    task('hard', 'Only retry what can work', {
      prompt: 'Write `async function smartRetry(task, tries)`: retry like before (no wait needed), but if an error\'s message starts with `"404"`, throw it straight away without trying again.',
      hint: 'In the `catch`: `if (e.message.startsWith("404") || attempt === tries) throw e`.',
      solution: 'async function smartRetry(task, tries) {\n  for (let attempt = 1; attempt <= tries; attempt++) {\n    try {\n      return await task()\n    } catch (e) {\n      if (e.message.startsWith("404") || attempt === tries) throw e\n    }\n  }\n}',
      tests: [['Retries a busy server', resolvesTo(`smartRetry(${FLAKY}(2, "page"), 5)`, '"page"')], ['Doesn\'t retry a 404', '(async () => { let calls = 0; const t = async () => { calls++; throw new Error("404 not found") }; try { await smartRetry(t, 5) } catch (e) { return calls === 1 && e.message === "404 not found" } return false })()']],
    }),
    task('hard', 'A log of attempts', {
      prompt: 'Write `async function retryWithLog(task, tries)` that returns `{ value, log }`: the value that worked, and a list of lines like `attempt 1 failed: MESSAGE` for each failure. If all tries fail, throw the last error.',
      hint: 'Push a line into `log` in the `catch`; when the task works, `return { value, log }`.',
      solution: 'async function retryWithLog(task, tries) {\n  const log = []\n  for (let attempt = 1; attempt <= tries; attempt++) {\n    try {\n      const value = await task()\n      return { value, log }\n    } catch (e) {\n      log.push(`attempt ${attempt} failed: ${e.message}`)\n      if (attempt === tries) throw e\n    }\n  }\n}',
      tests: [['Two failures, then ok', resolvesTo(`retryWithLog(${FLAKY}(2, "ok"), 5)`, '{ value: "ok", log: ["attempt 1 failed: blip 1", "attempt 2 failed: blip 2"] }')], ['Works first time', resolvesTo(`retryWithLog(${FLAKY}(0, 1), 3)`, '{ value: 1, log: [] }')], ['All fail', rejectsWhen(`retryWithLog(${FLAKY}(9, 1), 2)`, 'blip 2')]],
    }),
    task('expert', 'Retry with a deadline', {
      prompt: 'Write `async function retryUntil(task, ms)`: keep calling `task()` (waiting 10 ms after each failure) until it works, but once `ms` milliseconds have passed since you started, stop and throw `Error("Gave up after MS ms")`.',
      starter: WAIT,
      hint: 'Note `const start = Date.now()`. Loop while `Date.now() - start < ms`; after the loop, throw.',
      solution: WAIT + 'async function retryUntil(task, ms) {\n  const start = Date.now()\n  while (Date.now() - start < ms) {\n    try {\n      return await task()\n    } catch {\n      await wait(10)\n    }\n  }\n  throw new Error(`Gave up after ${ms} ms`)\n}',
      tests: [['Works in time', resolvesTo(`retryUntil(${FLAKY}(3, "ok"), 200)`, '"ok"')], ['Gives up', rejectsWhen('retryUntil(async () => { throw new Error("down") }, 60)', 'Gave up after 60 ms')], ['Gives up on time', '(async () => { const t = Date.now(); try { await retryUntil(async () => { throw new Error("down") }, 80) } catch { const took = Date.now() - t; return took >= 70 && took < 200 } return false })()']],
    }),
    task('expert', 'Load once, share the wait', {
      prompt: 'Several parts of a page ask for the settings at the same moment. Write `once(task)`: it returns a function that, the first time it is called, calls `task()` and returns its promise; every later call returns **the same promise**, without calling `task` again. If that promise fails, the next call should try `task()` afresh.',
      hint: 'Keep `let saved = null`. In the returned function: `if (!saved) saved = task().catch((e) => { saved = null; throw e })`; `return saved`.',
      solution: 'function once(task) {\n  let saved = null\n  return () => {\n    if (!saved) {\n      saved = task().catch((e) => {\n        saved = null\n        throw e\n      })\n    }\n    return saved\n  }\n}',
      tests: [['Calls the task once', '(async () => { let calls = 0; const load = once(async () => { calls++; return { theme: "dark" } }); const [a, b] = await Promise.all([load(), load()]); return calls === 1 && a === b && a.theme === "dark" })()'], ['Tries again after a failure', `(async () => { const t = ${FLAKY}(1, "ok"); const load = once(t); try { await load() } catch { } return (await load()) === "ok" && t.calls() === 2 })()`]],
    }),
  ],
  questions: [
    mc('When is retrying a good idea?', ['For temporary problems, like a timeout or a busy server', 'For a 404 not found', 'For a wrong password', 'Always, for ever'], 0, 'Some failures will never fix themselves.'),
    mc('What is exponential backoff?', ['Waiting longer after each failed try, often doubling', 'Retrying as fast as possible', 'Giving up at once', 'Trying every server at the same time'], 0, 'It gives a busy server room to recover.'),
    mc('With a first wait of 100 ms and doubling, what is the fourth wait?', ['800 ms', '400 ms', '300 ms', '1600 ms'], 0, '100, 200, 400, 800.', { code: 'let d = 100\nfor (let i = 1; i < 4; i++) d *= 2\nconsole.log(d)', output: '800' }),
    mc('What is polling?', ['Asking "is it done yet?" every so often until it is', 'Asking many servers at once', 'Retrying after an error', 'A kind of loop that never ends'], 0, 'With a limit, so it does end.'),
    mc('In a retry loop, why write `return await task()` inside `try`, not `return task()`?', ['Without `await` a failure happens after the function returned, outside the `try`', 'It is faster', '`return` needs `await`', 'There is no difference'], 0, 'The try only sees what it awaits.'),
    mc('All tries have failed. What should a retry helper do?', ['Throw the last error so the caller knows', 'Return `undefined` quietly', 'Keep trying for ever', 'Return the first error as a value'], 0, 'Don\'t hide failures.'),
    mc('Why should polling have a limit?', ['So it gives up if the job never finishes', 'Servers count to 10 only', 'Timers stop after a minute', 'It doesn\'t need one'], 0, 'Otherwise it could run for ever.'),
    mc('What does this show?\n```\nconst delays = []\nfor (let i = 0; i < 3; i++) delays.push(50 * 2 ** i)\nconsole.log(delays)\n```', ['`[ 50, 100, 200 ]`', '`[ 50, 100, 150 ]`', '`[ 100, 200, 400 ]`', '`[ 50, 50, 50 ]`'], 0, 'Doubling from 50.', { code: 'const delays = []\nfor (let i = 0; i < 3; i++) delays.push(50 * 2 ** i)\nconsole.log(delays)', output: '[ 50, 100, 200 ]' }),
    qShort('Waiting longer after each failed try, often doubling, is called exponential ____.', 'backoff', 'Exponential backoff.'),
  ],
})
