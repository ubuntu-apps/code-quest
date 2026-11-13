// Asynchronous JavaScript: Chaining with then and catch. Lesson, Try-it snippets, challenges and quiz.
import { MDN, makeTopic, mc, prints, qShort, rejectsWhen, resolvesTo, snippet, task, uses } from '../_builders.mjs'

const WAIT = 'function wait(ms) {\n  return new Promise((resolve) => setTimeout(resolve, ms))\n}\n'

export default makeTopic({
  id: 'then_catch',
  title: 'Chains: then, catch and finally',
  paragraphs: [
    '`.then` does more than run a function: it **returns a new promise**, for whatever that function returns. So you can hang another `.then` on it, and another, making a **chain** where each step gets the result of the step before.',
    '```\nPromise.resolve(3)\n  .then((n) => n * 2)\n  .then((n) => n + 1)\n  .then((n) => console.log("Result:", n))\n```',
    'If a step returns a **promise**, the chain waits for it before the next step. That is how you do one slow thing after another without nesting callbacks inside callbacks:',
    '```\nfunction wait(ms) {\n  return new Promise((resolve) => setTimeout(resolve, ms))\n}\n\nwait(100)\n  .then(() => {\n    console.log("Step 1")\n    return wait(100)\n  })\n  .then(() => console.log("Step 2"))\n```',
    'A **`.catch`** at the end handles a failure in **any** step above it. When a step throws or returns a rejected promise, the chain skips the remaining `.then`s and jumps to the `.catch`. After the `.catch`, the chain carries on as normal with what it returned.',
    '```\nPromise.resolve("5x")\n  .then((text) => {\n    const n = Number(text)\n    if (Number.isNaN(n)) throw new Error("Not a number: " + text)\n    return n\n  })\n  .then((n) => console.log("Double:", n * 2))\n  .catch((e) => console.log("Problem:", e.message))\n```',
    '**`.finally(fn)`** runs `fn` whether the chain worked or failed, which is handy for tidying up, such as hiding a "Loading…" message.',
    'One mistake to watch for: forgetting `return` in a step. Without it the step gives `undefined`, and the chain doesn\'t wait for the promise you started.',
  ],
  sandboxCode: 'Promise.resolve(10)\n  .then((n) => n + 5)\n  .then((n) => n * 2)\n  .then((n) => console.log(n))',
  sandboxSnippets: [
    snippet('Skips to catch', 'Promise.resolve(1)\n  .then(() => {\n    throw new Error("broken")\n  })\n  .then(() => console.log("skipped"))\n  .catch((e) => console.log("caught", e.message))'),
    snippet('Finally', 'Promise.reject(new Error("oops"))\n  .catch((e) => console.log("caught", e.message))\n  .finally(() => console.log("tidy up"))'),
    snippet('Forgot return', 'Promise.resolve(2)\n  .then((n) => {\n    n * 10\n  })\n  .then((v) => console.log(v))'),
    snippet('Carry on after catch', 'Promise.reject(new Error("x"))\n  .catch(() => "fallback")\n  .then((v) => console.log(v))'),
  ],
  readMore: MDN('Web/JavaScript/Guide/Using_promises', 'MDN: Using promises'),
  challenges: [
    task('easy', 'A short chain', {
      prompt: 'Start from `Promise.resolve(price)`. Chain a `.then` that adds 20% (`* 1.2`), and another that shows the result.',
      starter: 'const price = 50\n',
      hint: '`Promise.resolve(price).then((p) => p * 1.2).then((p) => console.log(p))`.',
      solution: 'const price = 50\nPromise.resolve(price)\n  .then((p) => p * 1.2)\n  .then((p) => console.log(p))',
      tests: [['Shows 60', prints('60')], ['Uses .then twice', '(_cq_code.match(/\\.then\\(/g) ?? []).length >= 2']],
    }),
    task('easy', 'Catch at the end', {
      prompt: 'Add a `.catch` to the end of the chain that shows `Sorry: ` and the error\'s message.',
      starter: 'Promise.resolve("")\n  .then((name) => {\n    if (name === "") throw new Error("name is empty")\n    return name\n  })\n  .then((name) => console.log("Hello", name))\n',
      hint: '`.catch((e) => console.log("Sorry: " + e.message))` after the last `.then`.',
      solution: 'Promise.resolve("")\n  .then((name) => {\n    if (name === "") throw new Error("name is empty")\n    return name\n  })\n  .then((name) => console.log("Hello", name))\n  .catch((e) => console.log("Sorry: " + e.message))',
      tests: [['Shows Sorry: name is empty', prints('Sorry: name is empty')], ['Uses .catch', uses('.catch(')]],
      typedOk: true,
    }),
    task('easy', 'Always tidy up', {
      prompt: 'Show `Loading…` first. Then add `.finally` so `Done` shows at the end, after the chain.',
      starter: 'console.log("Loading…")\nPromise.resolve([1, 2, 3])\n  .then((items) => console.log(items.length, "items"))\n',
      hint: '`.finally(() => console.log("Done"))` at the end of the chain.',
      solution: 'console.log("Loading…")\nPromise.resolve([1, 2, 3])\n  .then((items) => console.log(items.length, "items"))\n  .finally(() => console.log("Done"))',
      tests: [['Shows Loading…, 3 items, Done', prints('Loading…', '3 items', 'Done')], ['Uses .finally', uses('.finally(')]],
    }),
    task('medium', 'Wait between steps', {
      prompt: 'Using `wait`, show `Boil water`, then 30 ms later `Add pasta`, then 30 ms later `Drain`, as one chain (return the `wait` from each step).',
      starter: WAIT,
      hint: '`wait(0).then(() => { console.log("Boil water"); return wait(30) }).then(…)`.',
      solution: WAIT + 'wait(0)\n  .then(() => {\n    console.log("Boil water")\n    return wait(30)\n  })\n  .then(() => {\n    console.log("Add pasta")\n    return wait(30)\n  })\n  .then(() => console.log("Drain"))',
      tests: [['Shows the three steps in order', prints('Boil water', 'Add pasta', 'Drain')], ['Returns wait from steps', '(_cq_code.match(/return wait\\(/g) ?? []).length >= 2']],
      typedOk: true,
    }),
    task('medium', 'Total the basket', {
      prompt: 'Write `basketTotal(pricesPromise)`: it takes a promise of a list of prices and returns a promise of their total, using `.then`.',
      hint: '`return pricesPromise.then((prices) => prices.reduce((a, b) => a + b, 0))`.',
      solution: 'function basketTotal(pricesPromise) {\n  return pricesPromise.then((prices) => prices.reduce((a, b) => a + b, 0))\n}',
      tests: [['Total of 2, 3, 5 is 10', resolvesTo('basketTotal(Promise.resolve([2, 3, 5]))', '10')], ['Empty basket is 0', resolvesTo('basketTotal(Promise.resolve([]))', '0')]],
    }),
    task('medium', 'A fallback value', {
      prompt: 'Write `withDefault(promise, fallback)`: it gives a promise of the same value, or of `fallback` if `promise` is rejected.',
      hint: '`return promise.catch(() => fallback)`: whatever `catch` returns carries on down the chain.',
      solution: 'function withDefault(promise, fallback) {\n  return promise.catch(() => fallback)\n}',
      tests: [['Keeps a good value', resolvesTo('withDefault(Promise.resolve(7), 0)', '7')], ['Uses the fallback on failure', resolvesTo('withDefault(Promise.reject(new Error("x")), 0)', '0')]],
    }),
    task('hard', 'Parse, check, use', {
      prompt: 'Write `readAge(text)` that returns a chain starting from `Promise.resolve(text)`: turn it into a number; throw `Error("Not a number")` if it isn\'t one, or `Error("Out of range")` if it is below 0 or above 130; else give the number.',
      hint: 'One `.then` to convert, one to check (throw), and return the number.',
      solution: 'function readAge(text) {\n  return Promise.resolve(text)\n    .then((t) => Number(t))\n    .then((n) => {\n      if (Number.isNaN(n)) throw new Error("Not a number")\n      if (n < 0 || n > 130) throw new Error("Out of range")\n      return n\n    })\n}',
      tests: [['readAge("42") gives 42', resolvesTo('readAge("42")', '42')], ['readAge("abc") fails', rejectsWhen('readAge("abc")', 'Not a number')], ['readAge("200") fails', rejectsWhen('readAge("200")', 'Out of range')]],
    }),
    task('hard', 'Fix the chain', {
      prompt: 'This chain should show `Saved 3 notes` after the save finishes, but it shows `Saved undefined notes`. Fix the step that forgets to give its result.',
      starter: 'function save(notes) {\n  return new Promise((resolve) => setTimeout(() => resolve(notes.length), 30))\n}\nPromise.resolve(["a", "b", "c"])\n  .then((notes) => {\n    save(notes)\n  })\n  .then((count) => console.log(`Saved ${count} notes`))\n',
      hint: 'The first step must `return save(notes)`, so the chain waits for it and passes the count on.',
      solution: 'function save(notes) {\n  return new Promise((resolve) => setTimeout(() => resolve(notes.length), 30))\n}\nPromise.resolve(["a", "b", "c"])\n  .then((notes) => {\n    return save(notes)\n  })\n  .then((count) => console.log(`Saved ${count} notes`))',
      tests: [['Shows Saved 3 notes', prints('Saved 3 notes')], ['Still calls save', uses('save(notes)')]],
    }),
    task('expert', 'Steps from a list', {
      prompt: 'Write `runSteps(steps, ms)`: show each text in `steps`, one every `ms` milliseconds, by building a chain in a loop (`chain = chain.then(…)`), and return the chain. The first shows straight away.',
      starter: WAIT,
      hint: 'Start with `let chain = Promise.resolve()`. For each step: `chain = chain.then(() => { console.log(step); return wait(ms) })`.',
      solution: WAIT + 'function runSteps(steps, ms) {\n  let chain = Promise.resolve()\n  for (const step of steps) {\n    chain = chain.then(() => {\n      console.log(step)\n      return wait(ms)\n    })\n  }\n  return chain\n}',
      tests: [['Shows each step', '(async () => { const lines = []; const log = console.log; console.log = (v) => lines.push(v); try { await runSteps(["one", "two", "three"], 10) } finally { console.log = log } return lines.join(",") === "one,two,three" })()'], ['Takes about steps × ms', '(async () => { const log = console.log; console.log = () => {}; const t = Date.now(); try { await runSteps(["a", "b", "c"], 30) } finally { console.log = log } return Date.now() - t >= 80 })()']],
    }),
    task('expert', 'Retry once', {
      prompt: 'Write `tryTwice(task)`: `task` is a function returning a promise. Call it; if that promise is rejected, call it once more and give that result (fulfilled or rejected).',
      hint: '`return task().catch(() => task())`.',
      solution: 'function tryTwice(task) {\n  return task().catch(() => task())\n}',
      tests: [['Works first time', resolvesTo('tryTwice(() => Promise.resolve("ok"))', '"ok"')], ['Works the second time', '(async () => { let calls = 0; const flaky = () => (++calls === 1 ? Promise.reject(new Error("blip")) : Promise.resolve("ok")); return (await tryTwice(flaky)) === "ok" && calls === 2 })()'], ['Fails if both fail', rejectsWhen('tryTwice(() => Promise.reject(new Error("down")))', 'down')]],
    }),
  ],
  questions: [
    mc('What does `.then(fn)` return?', ['A new promise, for what `fn` returns', 'The value itself', 'undefined', 'The same promise'], 0, 'That is what lets you chain.'),
    mc('What does this show?\n```\nPromise.resolve(3)\n  .then((n) => n * 2)\n  .then((n) => console.log(n + 1))\n```', ['`7`', '`6`', '`4`', '`3`'], 0, '3 × 2 = 6, then 6 + 1.', { code: 'Promise.resolve(3)\n  .then((n) => n * 2)\n  .then((n) => console.log(n + 1))', output: '7' }),
    mc('A step in the middle of a chain throws. What happens?', ['The rest of the `.then`s are skipped and the next `.catch` runs', 'The chain stops silently', 'The next `.then` gets the error', 'JavaScript retries the step'], 0, 'Errors jump to the nearest catch.'),
    mc('When does `.finally(fn)` run?', ['When the chain is settled, whether it worked or failed', 'Only on success', 'Only on failure', 'Before the chain starts'], 0, 'Good for tidying up.'),
    mc('What does this show?\n```\nPromise.resolve(2)\n  .then((n) => {\n    n * 10\n  })\n  .then((v) => console.log(v))\n```', ['`undefined`', '`20`', '`2`', 'An error'], 0, 'With braces and no `return`, the step gives undefined.', { code: 'Promise.resolve(2)\n  .then((n) => {\n    n * 10\n  })\n  .then((v) => console.log(v))', output: 'undefined' }),
    mc('A step returns a promise. What does the next step get?', ['That promise\'s value, once it is fulfilled', 'The promise object itself', 'undefined', 'An error'], 0, 'The chain waits for it.'),
    mc('What does this show?\n```\nPromise.reject(new Error("x"))\n  .catch(() => "saved")\n  .then((v) => console.log(v))\n```', ['`saved`', '`x`', 'Nothing', 'An error'], 0, 'After a catch, the chain carries on with what it returned.', { code: 'Promise.reject(new Error("x"))\n  .catch(() => "saved")\n  .then((v) => console.log(v))', output: 'saved' }),
    mc('Why are chains nicer than callbacks inside callbacks?', ['Each step is at the same level, and one `.catch` handles every failure', 'They are faster', 'They don\'t need functions', 'They run at the same time'], 0, 'Flat and with one place for errors.'),
    qShort('Which method do you add to a chain to handle a rejected promise?', 'catch', '.catch(fn)'),
  ],
})
