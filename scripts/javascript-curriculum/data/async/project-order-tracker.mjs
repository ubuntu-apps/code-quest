// Asynchronous JavaScript side quest (medium): A pizza order tracker. Lesson, Try-it snippets, challenges and quiz.
import { makeProject, mc, rejectsWhen, resolvesTo, snippet, task } from '../_builders.mjs'

/** The kitchen: each stage of an order takes a while, and the oven sometimes fails. */
const KITCHEN = 'const MENU = { margherita: 9, pepperoni: 11, veggie: 10 }\nfunction wait(ms) {\n  return new Promise((resolve) => setTimeout(resolve, ms))\n}\nasync function makeDough(pizza) {\n  await wait(10)\n  if (!(pizza in MENU)) throw new Error(`No such pizza: ${pizza}`)\n  return `${pizza} dough`\n}\nasync function addToppings(base) {\n  await wait(10)\n  return base.replace("dough", "with toppings")\n}\nasync function bake(raw) {\n  await wait(20)\n  return raw.replace("with toppings", "baked")\n}\n'

export default makeProject('medium', {
  id: 'proj_order_tracker',
  title: 'A pizza order tracker',
  paragraphs: [
    'A pizza shop wants its app to show each order moving through the kitchen. The kitchen\'s steps are async functions that are already written: `makeDough(pizza)`, `addToppings(base)` and `bake(raw)`. Each takes a little while, and `makeDough` fails for a pizza that isn\'t on the `MENU`.',
    'You will write the code that drives them:',
    '- `makePizza(pizza)`: the three steps in order, each using the result of the one before;\n- `track(pizza)`: the same, with an update line after each step;\n- `order(pizzas)`: make every pizza of an order at once, and the bill;\n- `orderReport(pizzas)`: an order where some pizzas may fail, saying which.',
    '```text\nmargherita: dough ready\nmargherita: toppings on\nmargherita: baked\n```',
  ],
  sandboxCode: KITCHEN + '\nconst dough = await makeDough("veggie")\nconsole.log(dough)\nconsole.log(await addToppings(dough))',
  sandboxSnippets: [
    snippet('Not on the menu', KITCHEN + '\ntry {\n  await makeDough("pineapple")\n} catch (e) {\n  console.log(e.message)\n}'),
  ],
  challenges: [
    task('easy', 'One pizza', {
      prompt: 'Write `async function makePizza(pizza)` that runs `makeDough`, then `addToppings` on its result, then `bake` on that, and returns what `bake` gives.',
      starter: KITCHEN,
      hint: '`const dough = await makeDough(pizza)`, and so on.',
      solution: KITCHEN + 'async function makePizza(pizza) {\n  const dough = await makeDough(pizza)\n  const raw = await addToppings(dough)\n  return bake(raw)\n}',
      tests: [['makePizza("veggie")', resolvesTo('makePizza("veggie")', '"veggie baked"')], ['Not on the menu', rejectsWhen('makePizza("pineapple")', 'No such pizza: pineapple')]],
    }),
    task('easy', 'The price', {
      prompt: 'Write `function price(pizzas)` that returns the total price of a list of pizzas from `MENU`.',
      starter: KITCHEN,
      hint: '`pizzas.reduce((sum, p) => sum + MENU[p], 0)`.',
      solution: KITCHEN + 'function price(pizzas) {\n  return pizzas.reduce((sum, p) => sum + MENU[p], 0)\n}',
      tests: [['Two pizzas', 'price(["margherita", "pepperoni"]) === 20'], ['None', 'price([]) === 0']],
    }),
    task('medium', 'Track it', {
      prompt: 'Write `async function track(pizza)` that makes the pizza like `makePizza`, but returns the list of update lines: `PIZZA: dough ready`, `PIZZA: toppings on`, `PIZZA: baked`. If a step fails, the list ends with `PIZZA: problem - MESSAGE`.',
      starter: KITCHEN,
      hint: 'Push a line after each awaited step, all inside `try`; in `catch`, push the problem line. Return the list either way.',
      solution: KITCHEN + 'async function track(pizza) {\n  const updates = []\n  try {\n    const dough = await makeDough(pizza)\n    updates.push(`${pizza}: dough ready`)\n    const raw = await addToppings(dough)\n    updates.push(`${pizza}: toppings on`)\n    await bake(raw)\n    updates.push(`${pizza}: baked`)\n  } catch (e) {\n    updates.push(`${pizza}: problem - ${e.message}`)\n  }\n  return updates\n}',
      tests: [['A margherita', resolvesTo('track("margherita")', '["margherita: dough ready", "margherita: toppings on", "margherita: baked"]')], ['Not on the menu', resolvesTo('track("kebab")', '["kebab: problem - No such pizza: kebab"]')]],
    }),
    task('medium', 'A whole order', {
      prompt: 'Write `async function order(pizzas)` that makes all the pizzas **at once** and returns `{ ready, bill }`: `ready` the list of baked pizzas in order, `bill` the total price.',
      starter: KITCHEN + 'async function makePizza(pizza) {\n  return bake(await addToppings(await makeDough(pizza)))\n}\n',
      hint: '`const ready = await Promise.all(pizzas.map(makePizza))`; the bill as in `price`.',
      solution: KITCHEN + 'async function makePizza(pizza) {\n  return bake(await addToppings(await makeDough(pizza)))\n}\nasync function order(pizzas) {\n  const ready = await Promise.all(pizzas.map(makePizza))\n  const bill = pizzas.reduce((sum, p) => sum + MENU[p], 0)\n  return { ready, bill }\n}',
      tests: [['Two pizzas', resolvesTo('order(["veggie", "pepperoni"])', '{ ready: ["veggie baked", "pepperoni baked"], bill: 21 }')], ['At once', '(async () => { const t = Date.now(); await order(["veggie", "veggie", "veggie", "veggie"]); return Date.now() - t < 180 })()']],
    }),
    task('hard', 'Some fail', {
      prompt: 'Write `async function orderReport(pizzas)` that makes them all at once but doesn\'t let one bad pizza spoil the order. Return `{ ready, failed, bill }`: the baked pizzas, the names that failed, and the price of only the ones that worked.',
      starter: KITCHEN + 'async function makePizza(pizza) {\n  return bake(await addToppings(await makeDough(pizza)))\n}\n',
      hint: '`Promise.allSettled(pizzas.map(makePizza))`; go through the results with their index to sort them into ready and failed.',
      solution: KITCHEN + 'async function makePizza(pizza) {\n  return bake(await addToppings(await makeDough(pizza)))\n}\nasync function orderReport(pizzas) {\n  const results = await Promise.allSettled(pizzas.map(makePizza))\n  const ready = []\n  const failed = []\n  let bill = 0\n  results.forEach((r, i) => {\n    if (r.status === "fulfilled") {\n      ready.push(r.value)\n      bill += MENU[pizzas[i]]\n    } else {\n      failed.push(pizzas[i])\n    }\n  })\n  return { ready, failed, bill }\n}',
      tests: [['One bad', resolvesTo('orderReport(["margherita", "sushi", "veggie"])', '{ ready: ["margherita baked", "veggie baked"], failed: ["sushi"], bill: 19 }')], ['All good', resolvesTo('orderReport(["pepperoni"])', '{ ready: ["pepperoni baked"], failed: [], bill: 11 }')]],
    }),
    task('expert', 'One oven', {
      prompt: 'The shop has only **one oven**: two pizzas can\'t bake at the same time. Write `async function busyNight(pizzas)` that prepares all doughs and toppings at once, then bakes the pizzas **one after another**, in order, and returns the baked pizzas.',
      starter: KITCHEN,
      hint: 'First `const raws = await Promise.all(pizzas.map(async (p) => addToppings(await makeDough(p))))`. Then a `for…of` loop that awaits `bake` for each.',
      solution: KITCHEN + 'async function busyNight(pizzas) {\n  const raws = await Promise.all(pizzas.map(async (p) => addToppings(await makeDough(p))))\n  const baked = []\n  for (const raw of raws) {\n    baked.push(await bake(raw))\n  }\n  return baked\n}',
      tests: [['Three pizzas', resolvesTo('busyNight(["veggie", "margherita", "pepperoni"])', '["veggie baked", "margherita baked", "pepperoni baked"]')], ['One at a time in the oven', '(async () => { const real = bake; let inOven = 0; let most = 0; bake = async (raw) => { inOven++; most = Math.max(most, inOven); try { return await real(raw) } finally { inOven-- } }; try { await busyNight(["veggie", "veggie", "veggie"]) } finally { bake = real } return most === 1 })()']],
    }),
  ],
  questions: [
    mc('Why must `makeDough`, `addToppings` and `bake` run one after another for a pizza?', ['Each needs the result of the one before', 'They are too slow to run together', 'JavaScript runs only one async function at a time', 'They don\'t; any order works'], 0, 'A chain of dependent steps.'),
    mc('Why can the pizzas of one order be made at once?', ['They don\'t depend on each other', 'There are many ovens in JavaScript', 'Promise.all makes them faster', 'They can\'t'], 0, 'Independent work runs in parallel.'),
    mc('One pizza in the order isn\'t on the menu. What does `Promise.all` do?', ['Rejects, so the whole order fails', 'Skips that pizza', 'Gives undefined for it', 'Waits for ever'], 0, 'One failure fails all.'),
    mc('Which method lets the good pizzas through when one fails?', ['`Promise.allSettled`', '`Promise.all`', '`Promise.race`', '`setTimeout`'], 0, 'One result per pizza.'),
    mc('With one oven, how should the baking run?', ['One pizza after another', 'All at once', 'In random order', 'Only the first pizza'], 0, 'A shared resource means one at a time.'),
    mc('What does `"veggie dough".replace("dough", "with toppings")` give?', ['`veggie with toppings`', '`with toppings`', '`veggie dough`', 'An error'], 0, 'replace swaps the first match.', { code: 'console.log("veggie dough".replace("dough", "with toppings"))', output: 'veggie with toppings' }),
  ],
})
