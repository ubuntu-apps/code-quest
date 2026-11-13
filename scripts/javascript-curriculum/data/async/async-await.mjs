// Asynchronous JavaScript: async and await. Lesson, Try-it snippets, challenges and quiz.
import { MDN, makeTopic, mc, prints, qShort, resolvesTo, snippet, task, uses } from '../_builders.mjs'

const WAIT = 'function wait(ms) {\n  return new Promise((resolve) => setTimeout(resolve, ms))\n}\n'
const LATER = 'function later(value, ms) {\n  return new Promise((resolve) => setTimeout(() => resolve(value), ms))\n}\n'

export default makeTopic({
  id: 'async_await',
  title: 'async and await',
  paragraphs: [
    'Chains work, but there is an easier way to write them that reads like ordinary code, top to bottom: **`async`** and **`await`**.',
    'Put **`async`** before a function, and inside it you can write **`await`** before a promise. `await` pauses **that function** until the promise settles, then gives you its value, as if it had been there all along:',
    '```\nfunction wait(ms) {\n  return new Promise((resolve) => setTimeout(resolve, ms))\n}\n\nasync function makeTea() {\n  console.log("Kettle on")\n  await wait(300)\n  console.log("Water boiled")\n  await wait(200)\n  console.log("Tea is ready")\n}\n\nmakeTea()\n```',
    'Compare it with the same steps as a `.then` chain: no nesting and no `return` to forget. Under the hood it is still promises.',
    'Two things to know. First, an `async` function **always returns a promise**: whatever you `return` becomes that promise\'s value. So callers `await` it too, or use `.then`.',
    '```\nasync function double(n) {\n  return n * 2\n}\n\nconsole.log(double(4))\ndouble(4).then((v) => console.log(v))\n```',
    'Second, `await` only pauses the `async` function it is in. The code that **called** it carries on straight away. In these lessons your code can also use `await` at the top level, outside any function, which modern JavaScript allows in modules.',
    'Arrow functions can be async too: `const load = async (id) => { … }`.',
  ],
  sandboxCode: WAIT + '\nasync function countdown() {\n  for (let n = 3; n > 0; n--) {\n    console.log(n)\n    await wait(300)\n  }\n  console.log("Lift off!")\n}\n\ncountdown()',
  sandboxSnippets: [
    snippet('Returns a promise', 'async function hello() {\n  return "hi"\n}\nconsole.log(hello())\nhello().then((v) => console.log(v))'),
    snippet('Top-level await', 'const value = await Promise.resolve(42)\nconsole.log(value)'),
    snippet('Caller carries on', 'async function slow() {\n  await new Promise((r) => setTimeout(r, 200))\n  console.log("slow done")\n}\nslow()\nconsole.log("caller carries on")'),
    snippet('Async arrow', 'const add = async (a, b) => a + b\nadd(2, 3).then((v) => console.log(v))'),
  ],
  readMore: MDN('Web/JavaScript/Reference/Statements/async_function', 'MDN: async function'),
  challenges: [
    task('easy', 'Await it', {
      prompt: 'Use `await` to get the value of `answer` into `const value`, then show it.',
      starter: 'const answer = new Promise((resolve) => setTimeout(() => resolve(42), 30))\n',
      hint: '`const value = await answer`.',
      solution: 'const answer = new Promise((resolve) => setTimeout(() => resolve(42), 30))\nconst value = await answer\nconsole.log(value)',
      tests: [['value is 42', 'value === 42'], ['Shows 42', prints('42')], ['Uses await', uses('await answer')]],
    }),
    task('easy', 'An async function', {
      prompt: 'Write an `async` function `greet(name)` that returns `Hello, NAME!`.',
      hint: '`async function greet(name) { return `Hello, ${name}!` }`.',
      solution: 'async function greet(name) {\n  return `Hello, ${name}!`\n}',
      tests: [['greet returns a promise', 'greet("Ana") instanceof Promise'], ['It gives Hello, Ana!', resolvesTo('greet("Ana")', '"Hello, Ana!"')]],
    }),
    task('easy', 'Pause in the middle', {
      prompt: 'Write `async function brew()` that shows `Brewing…`, waits 50 ms with `await wait(50)`, then shows `Coffee!`. Call it.',
      starter: WAIT,
      hint: 'Two `console.log`s with `await wait(50)` between them, then `brew()`.',
      solution: WAIT + 'async function brew() {\n  console.log("Brewing…")\n  await wait(50)\n  console.log("Coffee!")\n}\nbrew()',
      tests: [['Shows Brewing… then Coffee!', prints('Brewing…', 'Coffee!')], ['Uses await wait', uses('await wait(')]],
      typedOk: true,
    }),
    task('medium', 'From then to await', {
      prompt: 'Rewrite `showUser` with `async`/`await` instead of `.then`, so it still shows `Ana (Lisbon)`.',
      starter: LATER + 'function showUser() {\n  return later({ name: "Ana", city: "Lisbon" }, 30).then((user) => {\n    console.log(`${user.name} (${user.city})`)\n  })\n}\nshowUser()\n',
      hint: '`async function showUser() { const user = await later(…); console.log(…) }`.',
      solution: LATER + 'async function showUser() {\n  const user = await later({ name: "Ana", city: "Lisbon" }, 30)\n  console.log(`${user.name} (${user.city})`)\n}\nshowUser()',
      tests: [['Shows Ana (Lisbon)', prints('Ana (Lisbon)')], ['Uses async and await, not .then', '_cq_code.includes("async function showUser") && _cq_code.includes("await") && !_cq_code.includes(".then")']],
      typedOk: true,
    }),
    task('medium', 'Add two later values', {
      prompt: 'Write `async function addLater(a, b)` that awaits `later(a, 20)` and `later(b, 20)` and returns their sum.',
      starter: LATER,
      hint: '`const x = await later(a, 20)`, the same for `b`, then `return x + y`.',
      solution: LATER + 'async function addLater(a, b) {\n  const x = await later(a, 20)\n  const y = await later(b, 20)\n  return x + y\n}',
      tests: [['addLater(2, 3) gives 5', resolvesTo('addLater(2, 3)', '5')], ['addLater(10, -4) gives 6', resolvesTo('addLater(10, -4)', '6')]],
    }),
    task('medium', 'Async arrow', {
      prompt: 'Make `shout` an **async arrow function** that awaits `later(text, 10)` and returns it in capitals.',
      starter: LATER,
      hint: '`const shout = async (text) => (await later(text, 10)).toUpperCase()`.',
      solution: LATER + 'const shout = async (text) => {\n  const t = await later(text, 10)\n  return t.toUpperCase()\n}',
      tests: [['shout("hey") gives HEY', resolvesTo('shout("hey")', '"HEY"')], ['It is an arrow function', 'typeof shout === "function" && /=>/.test(String(shout))'], ['It is async', 'shout("a") instanceof Promise']],
    }),
    task('hard', 'Await in a loop', {
      prompt: 'Write `async function countdown(from)` that shows `from`, `from - 1`, … `1`, waiting 20 ms after each, then shows `Lift off!`.',
      starter: WAIT,
      hint: 'A `for` loop counting down, with `console.log(n)` and `await wait(20)` inside.',
      solution: WAIT + 'async function countdown(from) {\n  for (let n = from; n > 0; n--) {\n    console.log(n)\n    await wait(20)\n  }\n  console.log("Lift off!")\n}',
      tests: [['countdown(3)', '(async () => { const lines = []; const log = console.log; console.log = (v) => lines.push(String(v)); try { await countdown(3) } finally { console.log = log } return lines.join(",") === "3,2,1,Lift off!" })()'], ['It waits between numbers', '(async () => { const log = console.log; console.log = () => {}; const t = Date.now(); try { await countdown(3) } finally { console.log = log } return Date.now() - t >= 50 })()']],
    }),
    task('hard', 'The caller carries on', {
      prompt: 'Make the output read `Order placed`, `Thanks for waiting`, `Pizza delivered`: call `deliver()` **before** showing `Thanks for waiting`, without awaiting it.',
      starter: WAIT + 'async function deliver() {\n  await wait(50)\n  console.log("Pizza delivered")\n}\nconsole.log("Order placed")\n',
      hint: '`deliver()` then `console.log("Thanks for waiting")`: the await inside `deliver` doesn\'t hold up the caller.',
      solution: WAIT + 'async function deliver() {\n  await wait(50)\n  console.log("Pizza delivered")\n}\nconsole.log("Order placed")\ndeliver()\nconsole.log("Thanks for waiting")',
      tests: [['Shows the three lines in order', prints('Order placed', 'Thanks for waiting', 'Pizza delivered')], ['Calls deliver() before the thanks', '_cq_code.indexOf("deliver()\\n") >= 0 && _cq_code.lastIndexOf("deliver()") < _cq_code.indexOf("Thanks for waiting")']],
      typedOk: true,
    }),
    task('expert', 'Total of slow prices', {
      prompt: 'Each item\'s price comes from `priceOf(item)`, which is slow. Write `async function total(items)` that awaits each price in turn and returns the sum, rounded to 2 decimal places as a number.',
      starter: 'const PRICES = { tea: 2.5, cake: 3.2, juice: 1.95 }\nfunction priceOf(item) {\n  return new Promise((resolve) => setTimeout(() => resolve(PRICES[item]), 10))\n}\n',
      hint: '`let sum = 0`; `for (const item of items) sum += await priceOf(item)`; `return Math.round(sum * 100) / 100`.',
      solution: 'const PRICES = { tea: 2.5, cake: 3.2, juice: 1.95 }\nfunction priceOf(item) {\n  return new Promise((resolve) => setTimeout(() => resolve(PRICES[item]), 10))\n}\nasync function total(items) {\n  let sum = 0\n  for (const item of items) {\n    sum += await priceOf(item)\n  }\n  return Math.round(sum * 100) / 100\n}',
      tests: [['tea, cake, juice', resolvesTo('total(["tea", "cake", "juice"])', '7.65')], ['Nothing is 0', resolvesTo('total([])', '0')], ['juice twice', resolvesTo('total(["juice", "juice"])', '3.9')]],
    }),
    task('expert', 'A typing effect', {
      prompt: 'Write `async function typeOut(text, ms)` that returns a list of what is on screen after each letter: `typeOut("hey", 5)` gives `["h", "he", "hey"]`, waiting `ms` between letters.',
      starter: WAIT,
      hint: 'Build `shown` letter by letter in a loop, push a copy into the list each time, and `await wait(ms)`.',
      solution: WAIT + 'async function typeOut(text, ms) {\n  const frames = []\n  let shown = ""\n  for (const letter of text) {\n    shown += letter\n    frames.push(shown)\n    await wait(ms)\n  }\n  return frames\n}',
      tests: [['typeOut("hey", 5)', resolvesTo('typeOut("hey", 5)', '["h", "he", "hey"]')], ['typeOut("", 5) gives []', resolvesTo('typeOut("", 5)', '[]')], ['It waits', '(async () => { const t = Date.now(); await typeOut("abcd", 20); return Date.now() - t >= 60 })()']],
    }),
  ],
  questions: [
    mc('What does `await promise` do?', ['Pauses the async function until the promise settles, then gives its value', 'Pauses the whole program', 'Makes the promise faster', 'Turns the value into a promise'], 0, 'Only the async function waits.'),
    mc('What does an `async` function always return?', ['A promise', 'undefined', 'Whatever you return, unchanged', 'A function'], 0, 'Its return value becomes the promise\'s value.'),
    mc('What does this show?\n```\nasync function f() {\n  return 5\n}\nconsole.log(f())\n```', ['`Promise { <pending> }` or similar: a promise, not 5', '`5`', 'undefined', 'An error'], 0, 'You need await or .then to get 5.'),
    mc('What does this show?\n```\nasync function f() {\n  await null\n  console.log("B")\n}\nf()\nconsole.log("A")\n```', ['A, then B', 'B, then A', 'Only A', 'Only B'], 0, 'The caller carries on while f is paused.', { code: 'async function f() {\n  await null\n  console.log("B")\n}\nf()\nconsole.log("A")', output: 'A\nB' }),
    mc('Which line is a correct async arrow function?', ['`const f = async (x) => x * 2`', '`const f = (x) async => x * 2`', '`async const f = (x) => x * 2`', '`const f = await (x) => x * 2`'], 0, '`async` goes before the parameters.'),
    mc('How do you get the value of `double(4)` if `double` is async?', ['`await double(4)` or `double(4).then(…)`', '`double(4).value`', '`double(4)()`', '`async double(4)`'], 0, 'It returns a promise.'),
    mc('What does this show?\n```\nconst v = await Promise.resolve("ok")\nconsole.log(v)\n```', ['`ok`', 'A promise', 'undefined', 'An error'], 0, 'Top-level await gives the value.', { code: 'const v = await Promise.resolve("ok")\nconsole.log(v)', output: 'ok' }),
    mc('Compared with a `.then` chain, what is the main gain of `async`/`await`?', ['The steps read top to bottom like ordinary code', 'It runs faster', 'It doesn\'t use promises', 'It never fails'], 0, 'Same promises, easier to read.'),
    qShort('Which keyword must a function have before you can use `await` inside it?', 'async', 'async function …'),
  ],
})
