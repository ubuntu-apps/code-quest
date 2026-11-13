// Capstone: An online shop's checkout. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, prints, qShort, rejectsWhen, resolvesTo, same, snippet, task, throwsWhen } from '../_builders.mjs'

/** A stand-in for the shop's server: products, stock, and reserving stock for an order. */
const API = 'const shop = {\n  products: {\n    mug: { id: "mug", name: "Mug", price: 8.5, stock: 5 },\n    tee: { id: "tee", name: "T-shirt", price: 19.99, stock: 2 },\n    cap: { id: "cap", name: "Cap", price: 12, stock: 0 },\n    pen: { id: "pen", name: "Pen", price: 1.25, stock: 40 },\n  },\n  async getProduct(id) {\n    await new Promise((r) => setTimeout(r, 5))\n    const p = this.products[id]\n    if (!p) throw new Error(`No product ${id}`)\n    return { ...p }\n  },\n  async reserve(id, qty) {\n    await new Promise((r) => setTimeout(r, 5))\n    const p = this.products[id]\n    if (p.stock < qty) throw new Error(`Only ${p.stock} left of ${p.name}`)\n    p.stock -= qty\n  },\n  async release(id, qty) {\n    await new Promise((r) => setTimeout(r, 5))\n    this.products[id].stock += qty\n  },\n}\n'
const CART = 'class Cart {\n  constructor() {\n    this.lines = []\n  }\n  add(product, qty = 1) {\n    const line = this.lines.find((l) => l.product.id === product.id)\n    if (line) line.qty += qty\n    else this.lines.push({ product, qty })\n    return this\n  }\n  subtotal() {\n    const sum = this.lines.reduce((s, l) => s + l.product.price * l.qty, 0)\n    return Math.round(sum * 100) / 100\n  }\n}\n'
const DISCOUNT = 'function discount(code, subtotal) {\n  const percent = code.match(/^SAVE(\\d{1,2})$/)\n  if (percent) return Math.round(subtotal * Number(percent[1])) / 100\n  const fixed = code.match(/^TAKE(\\d+)$/)\n  if (fixed) return Math.min(Number(fixed[1]), subtotal)\n  throw new Error(`Unknown code ${code}`)\n}\n'
const TOTAL = 'const FREE_SHIPPING_FROM = 50\nconst SHIPPING = 4.5\nfunction total(cart, code) {\n  const sub = cart.subtotal()\n  const off = code ? discount(code, sub) : 0\n  const afterDiscount = Math.round((sub - off) * 100) / 100\n  const shipping = afterDiscount >= FREE_SHIPPING_FROM ? 0 : SHIPPING\n  return { subtotal: sub, discount: off, shipping, total: Math.round((afterDiscount + shipping) * 100) / 100 }\n}\n'
const SAMPLE_CART = 'const cart = new Cart()\n  .add({ id: "mug", name: "Mug", price: 8.5 }, 2)\n  .add({ id: "tee", name: "T-shirt", price: 19.99 })\n  .add({ id: "pen", name: "Pen", price: 1.25 }, 4)\n'

export default makeTopic({
  id: 'capstone_shop',
  title: 'An online shop\'s checkout',
  paragraphs: [
    'The checkout is where an online shop earns its money, and where mistakes cost the most: a wrong total, a discount applied twice, or selling stock you don\'t have. Build one carefully, piece by piece.',
    'The shop\'s server is played by an object `shop` with async methods, like a real API: `getProduct(id)`, `reserve(id, qty)` (which fails if there isn\'t enough stock) and `release(id, qty)` (to give stock back). You will write:',
    '- a `Cart` class that adds products and works out the subtotal;\n- discount codes read with a regex: `SAVE10` is 10% off, `TAKE5` is 5 off;\n- the total with shipping, free from 50;\n- loading a cart from the server, checking stock, and a **checkout** that reserves every line, or none of them if one fails;\n- the receipt, with money formatted properly.',
    'The last point matters: if the third line of an order fails, the first two must be **released** again, or the shop slowly "loses" stock nobody bought. Doing several steps as all-or-nothing is called a **transaction**, and undoing the done steps is a **rollback**.',
    '```text\nMug            2 × €8.50       €17.00\nT-shirt        1 × €19.99      €19.99\nPen            4 × €1.25        €5.00\nSubtotal                       €41.99\nDiscount SAVE10                -€4.20\nShipping                        €4.50\nTotal                          €42.29\n```',
  ],
  sandboxCode: API + '\nconst mug = await shop.getProduct("mug")\nconsole.log(mug)\ntry {\n  await shop.reserve("cap", 1)\n} catch (e) {\n  console.log(e.message)\n}',
  sandboxSnippets: [
    snippet('Codes', 'for (const code of ["SAVE10", "TAKE5", "FREE"]) {\n  console.log(code, code.match(/^SAVE(\\d{1,2})$/)?.[1], code.match(/^TAKE(\\d+)$/)?.[1])\n}'),
    snippet('Euros', 'const eur = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" })\nconsole.log(eur.format(41.99), eur.format(-4.2))'),
  ],
  challenges: [
    task('easy', 'A cart', {
      prompt: 'Write `class Cart` with an empty `lines` list and `add(product, qty = 1)`: if the product (same `id`) is already in the cart, add to its `qty`; else push `{ product, qty }`. Return `this`, so calls can be chained.',
      hint: '`const line = this.lines.find((l) => l.product.id === product.id)`.',
      solution: CART.replace('  subtotal() {\n    const sum = this.lines.reduce((s, l) => s + l.product.price * l.qty, 0)\n    return Math.round(sum * 100) / 100\n  }\n', ''),
      tests: [['Adds and merges', '(() => { const c = new Cart().add({ id: "mug", price: 8.5 }, 2).add({ id: "pen", price: 1 }).add({ id: "mug", price: 8.5 }); return c.lines.length === 2 && c.lines[0].qty === 3 && c.lines[1].qty === 1 })()']],
    }),
    task('easy', 'Subtotal', {
      prompt: 'Add `subtotal()` to `Cart`: the sum of price × qty over the lines, rounded to cents.',
      starter: CART.replace('  subtotal() {\n    const sum = this.lines.reduce((s, l) => s + l.product.price * l.qty, 0)\n    return Math.round(sum * 100) / 100\n  }\n', ''),
      hint: '`reduce`, then `Math.round(sum * 100) / 100`.',
      solution: CART,
      tests: [['The sample cart', `(() => { ${SAMPLE_CART.replace(/\n/g, ' ')}; return cart.subtotal() === 41.99 })()`], ['Empty', 'new Cart().subtotal() === 0'], ['Cents', 'new Cart().add({ id: "a", price: 0.1 }, 3).subtotal() === 0.3']],
    }),
    task('easy', 'Discount codes', {
      prompt: 'Write `discount(code, subtotal)` that returns the money off: `SAVE` and 1 or 2 digits is that percent of the subtotal (rounded to cents); `TAKE` and digits is that many off, but never more than the subtotal. Any other code throws `Error("Unknown code CODE")`.',
      hint: '`code.match(/^SAVE(\\d{1,2})$/)` and `code.match(/^TAKE(\\d+)$/)`.',
      solution: DISCOUNT,
      tests: [['SAVE10', 'discount("SAVE10", 41.99) === 4.2'], ['TAKE5', 'discount("TAKE5", 41.99) === 5'], ['TAKE more than the cart', 'discount("TAKE100", 30) === 30'], ['Unknown', throwsWhen('discount("FREE", 10)', 'Unknown code FREE')], ['No 3-digit percent', throwsWhen('discount("SAVE100", 10)', 'Unknown code')]],
    }),
    task('medium', 'The total', {
      prompt: 'Write `total(cart, code)` returning `{ subtotal, discount, shipping, total }`: the discount from `code` (none if `code` is empty or missing), shipping of `SHIPPING` (4.5) unless the subtotal after the discount is at least `FREE_SHIPPING_FROM` (50), all in cents.',
      starter: CART + DISCOUNT + SAMPLE_CART,
      hint: 'Work out each part in turn, rounding with `Math.round(x * 100) / 100`. Use two constants at the top.',
      solution: CART + DISCOUNT + SAMPLE_CART + TOTAL,
      tests: [['SAVE10', same('total(cart, "SAVE10")', '{ subtotal: 41.99, discount: 4.2, shipping: 4.5, total: 42.29 }')], ['No code', same('total(cart)', '{ subtotal: 41.99, discount: 0, shipping: 4.5, total: 46.49 }')], ['Free shipping', 'total(new Cart().add({ id: "a", price: 60 }), "TAKE5").shipping === 0'], ['Just under after the discount', 'total(new Cart().add({ id: "a", price: 52 }), "TAKE5").shipping === 4.5']],
    }),
    task('medium', 'Load a cart', {
      prompt: 'Write `async function loadCart(wanted)`: `wanted` is like `{ mug: 2, pen: 4 }`. Get all the products from `shop.getProduct` **at once**, and return a `Cart` with each in the wanted quantity, in the order given.',
      starter: API + CART,
      hint: '`const entries = Object.entries(wanted)`; `await Promise.all(entries.map(([id]) => shop.getProduct(id)))`; then add each product with its qty.',
      solution: API + CART + 'async function loadCart(wanted) {\n  const entries = Object.entries(wanted)\n  const products = await Promise.all(entries.map(([id]) => shop.getProduct(id)))\n  const cart = new Cart()\n  products.forEach((p, i) => cart.add(p, entries[i][1]))\n  return cart\n}',
      tests: [['Mug and pen', '(async () => { const c = await loadCart({ mug: 2, pen: 4 }); return c instanceof Cart && c.lines.map((l) => `${l.product.name}×${l.qty}`).join() === "Mug×2,Pen×4" && c.subtotal() === 22 })()'], ['Unknown product', rejectsWhen('loadCart({ hat: 1 })', 'No product hat')]],
    }),
    task('medium', 'Enough stock?', {
      prompt: 'Write `async function stockProblems(cart)` that fetches each product\'s current stock from the server (all at once) and returns a list of messages like `Only 2 left of T-shirt` for lines that want more than there is. An empty list means all is well.',
      starter: API + CART,
      hint: '`Promise.all(cart.lines.map((l) => shop.getProduct(l.product.id)))`, then compare each `stock` with the line\'s `qty`.',
      solution: API + CART + 'async function stockProblems(cart) {\n  const fresh = await Promise.all(cart.lines.map((l) => shop.getProduct(l.product.id)))\n  return fresh\n    .filter((p, i) => p.stock < cart.lines[i].qty)\n    .map((p) => `Only ${p.stock} left of ${p.name}`)\n}',
      tests: [['Two problems', resolvesTo('stockProblems(new Cart().add(shop.products.tee, 3).add(shop.products.mug, 1).add(shop.products.cap, 1))', '["Only 2 left of T-shirt", "Only 0 left of Cap"]')], ['All fine', resolvesTo('stockProblems(new Cart().add(shop.products.pen, 10))', '[]')]],
    }),
    task('hard', 'Checkout, all or nothing', {
      prompt: 'Write `async function checkout(cart)`: reserve each line with `shop.reserve`, one after another. If one fails, **release** every line already reserved (with `shop.release`), then throw the error. On success return `"Order placed"`.',
      starter: API + CART,
      hint: 'Keep a list `done` of lines reserved so far. In a `try` around the loop, `await shop.reserve(…)` and push; in `catch`, release each line in `done`, then `throw e`.',
      solution: API + CART + 'async function checkout(cart) {\n  const done = []\n  try {\n    for (const line of cart.lines) {\n      await shop.reserve(line.product.id, line.qty)\n      done.push(line)\n    }\n  } catch (e) {\n    for (const line of done) await shop.release(line.product.id, line.qty)\n    throw e\n  }\n  return "Order placed"\n}',
      tests: [['Placed', '(async () => { const before = shop.products.pen.stock; const r = await checkout(new Cart().add(shop.products.pen, 3)); const ok = r === "Order placed" && shop.products.pen.stock === before - 3; shop.products.pen.stock = before; return ok })()'], ['Rolled back', '(async () => { const mug = shop.products.mug.stock; const pen = shop.products.pen.stock; try { await checkout(new Cart().add(shop.products.mug, 2).add(shop.products.pen, 1).add(shop.products.tee, 5)) } catch (e) { return e.message === "Only 2 left of T-shirt" && shop.products.mug.stock === mug && shop.products.pen.stock === pen } return false })()']],
    }),
    task('hard', 'The order for the server', {
      prompt: 'Write `orderJson(cart, code)` that gives the JSON text the server expects: `{ "items": [{ "id", "qty" }, …], "code": CODE or null, "total": TOTAL }`, using `total(cart, code).total`.',
      starter: CART + DISCOUNT + TOTAL + SAMPLE_CART,
      hint: 'Build the object with `cart.lines.map((l) => ({ id: l.product.id, qty: l.qty }))`, then `JSON.stringify`.',
      solution: CART + DISCOUNT + TOTAL + SAMPLE_CART + 'function orderJson(cart, code) {\n  return JSON.stringify({\n    items: cart.lines.map((l) => ({ id: l.product.id, qty: l.qty })),\n    code: code ?? null,\n    total: total(cart, code).total,\n  })\n}',
      tests: [['With a code', 'orderJson(cart, "SAVE10") === \'{"items":[{"id":"mug","qty":2},{"id":"tee","qty":1},{"id":"pen","qty":4}],"code":"SAVE10","total":42.29}\''], ['Without', 'JSON.parse(orderJson(cart)).code === null && JSON.parse(orderJson(cart)).total === 46.49']],
    }),
    task('expert', 'The receipt', {
      prompt: 'Write `receipt(cart, code)` that **returns** the receipt lines as in the lesson: each cart line as the name padded to 15, the qty, ` × `, the unit price padded to 9, then the line total padded on the left to 9 (`€` amounts from `Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" })`). Then `Subtotal`, `Discount CODE` (only with a code, as a minus amount), `Shipping` and `Total`, each a label padded to 30 with the amount padded on the left to 7. Show it for the sample cart and `SAVE10`.',
      starter: CART + DISCOUNT + TOTAL + SAMPLE_CART,
      hint: 'A `row(label, amount)` helper: `label.padEnd(30) + eur.format(amount).padStart(7)`. For the cart lines: `` `${name.padEnd(15)}${qty} × ${eur.format(price).padEnd(9)}${eur.format(lineTotal).padStart(9)}` ``.',
      solution: CART + DISCOUNT + TOTAL + SAMPLE_CART + 'const eur = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" })\nfunction receipt(cart, code) {\n  const t = total(cart, code)\n  const row = (label, amount) => label.padEnd(30) + eur.format(amount).padStart(7)\n  const lines = cart.lines.map((l) => {\n    const lineTotal = Math.round(l.product.price * l.qty * 100) / 100\n    return `${l.product.name.padEnd(15)}${l.qty} × ${eur.format(l.product.price).padEnd(9)}${eur.format(lineTotal).padStart(9)}`\n  })\n  lines.push(row("Subtotal", t.subtotal))\n  if (code) lines.push(row(`Discount ${code}`, -t.discount))\n  lines.push(row("Shipping", t.shipping), row("Total", t.total))\n  return lines\n}\nconsole.log(receipt(cart, "SAVE10").join("\\n"))',
      tests: [['Shows the receipt', prints('Mug            2 × €8.50       €17.00', 'T-shirt        1 × €19.99      €19.99', 'Pen            4 × €1.25        €5.00', 'Subtotal                       €41.99', 'Discount SAVE10                -€4.20', 'Shipping                        €4.50', 'Total                          €42.29')], ['No code, no discount line', '!receipt(cart).some((l) => l.startsWith("Discount"))']],
      alt: (starter) => starter.replace('price: 8.5 }, 2)', 'price: 8.5 }, 3)'),
    }),
    task('expert', 'The whole checkout', {
      prompt: 'Put it together in `async function placeOrder(wanted, code)`: load the cart, check the code (an unknown one gives `Sorry: Unknown code CODE`), check the stock (problems give `Sorry: ` and the messages joined with `; `), check out (a failure gives `Sorry: ` and its message), and on success give `Order placed: TOTAL` with the total in euros. It always **returns** one line of text.',
      starter: API + CART + DISCOUNT + TOTAL + 'const eur = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" })\nasync function loadCart(wanted) {\n  const entries = Object.entries(wanted)\n  const products = await Promise.all(entries.map(([id]) => shop.getProduct(id)))\n  const cart = new Cart()\n  products.forEach((p, i) => cart.add(p, entries[i][1]))\n  return cart\n}\nasync function checkout(cart) {\n  const done = []\n  try {\n    for (const line of cart.lines) {\n      await shop.reserve(line.product.id, line.qty)\n      done.push(line)\n    }\n  } catch (e) {\n    for (const line of done) await shop.release(line.product.id, line.qty)\n    throw e\n  }\n  return "Order placed"\n}\n',
      hint: 'In one `try`: `const cart = await loadCart(wanted)`, `const t = total(cart, code)` (throws for a bad code), then the stock check: compare each line with `cart.lines[i].product.stock` (just loaded), then `await checkout(cart)`. In `catch`, return `Sorry: ` + the message.',
      solution: API + CART + DISCOUNT + TOTAL + 'const eur = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" })\nasync function loadCart(wanted) {\n  const entries = Object.entries(wanted)\n  const products = await Promise.all(entries.map(([id]) => shop.getProduct(id)))\n  const cart = new Cart()\n  products.forEach((p, i) => cart.add(p, entries[i][1]))\n  return cart\n}\nasync function checkout(cart) {\n  const done = []\n  try {\n    for (const line of cart.lines) {\n      await shop.reserve(line.product.id, line.qty)\n      done.push(line)\n    }\n  } catch (e) {\n    for (const line of done) await shop.release(line.product.id, line.qty)\n    throw e\n  }\n  return "Order placed"\n}\nasync function placeOrder(wanted, code) {\n  try {\n    const cart = await loadCart(wanted)\n    const t = total(cart, code)\n    const problems = cart.lines.filter((l) => l.product.stock < l.qty).map((l) => `Only ${l.product.stock} left of ${l.product.name}`)\n    if (problems.length > 0) return `Sorry: ${problems.join("; ")}`\n    await checkout(cart)\n    return `Order placed: ${eur.format(t.total)}`\n  } catch (e) {\n    return `Sorry: ${e.message}`\n  }\n}',
      tests: [['A good order', '(async () => { const before = shop.products.mug.stock; const r = await placeOrder({ mug: 2, pen: 4 }, "TAKE5"); const ok = r === "Order placed: €21.50" && shop.products.mug.stock === before - 2; shop.products.mug.stock = before; shop.products.pen.stock += 4; return ok })()'], ['Bad code', resolvesTo('placeOrder({ mug: 1 }, "HALFPRICE")', '"Sorry: Unknown code HALFPRICE"')], ['Not enough', resolvesTo('placeOrder({ tee: 3, cap: 1 })', '"Sorry: Only 2 left of T-shirt; Only 0 left of Cap"')], ['Unknown product', resolvesTo('placeOrder({ hat: 1 })', '"Sorry: No product hat"')]],
      alt: (starter) => starter.replace('price: 1.25, stock: 40', 'price: 1.5, stock: 40'),
    }),
  ],
  questions: [
    mc('Why do the cart\'s sums round to cents at each step?', ['Floating-point sums like 0.1 + 0.2 aren\'t exact, and money must be', 'Rounding makes it faster', 'JSON needs whole numbers', 'It isn\'t needed'], 0, 'Round money to cents.'),
    mc('What does `"SAVE10".match(/^SAVE(\\d{1,2})$/)[1]` give?', ['`"10"`', '`10`', '`"SAVE10"`', '`null`'], 0, 'The group, as text.', { code: 'console.log("SAVE10".match(/^SAVE(\\d{1,2})$/)[1])', output: '10' }),
    mc('If the third line of an order can\'t be reserved, what must happen to the first two?', ['They are released again (a rollback)', 'They stay reserved', 'They are sold anyway', 'Nothing'], 0, 'All or nothing.'),
    mc('Why reserve the lines one after another rather than all at once?', ['So it is clear which ones succeeded before a failure, to release just those', 'Promise.all can\'t reserve', 'It is faster', 'The server needs one per second'], 0, 'A simple, safe rollback.'),
    mc('Why does `add` return `this`?', ['So calls can be chained: `cart.add(a).add(b)`', 'It must return something', 'To copy the cart', 'To delete the line'], 0, 'A fluent style.'),
    mc('Where are the free-shipping limit and the shipping price kept?', ['In named constants at the top', 'Inside the if', 'In the JSON', 'In the receipt'], 0, 'Easy to find and change.'),
    mc('What does `Math.min(5, 3.5)` give for a TAKE5 code on a 3.50 cart?', ['`3.5`: never more than the cart', '`5`', '`-1.5`', '`0`'], 0, 'A discount can\'t make the total negative.', { code: 'console.log(Math.min(5, 3.5))', output: '3.5' }),
    mc('Why does `placeOrder` return text instead of throwing?', ['It is the edge the page shows to the shopper, so it gives a message either way', 'Async functions can\'t throw', 'Errors are slow', 'It doesn\'t matter'], 0, 'Inner functions throw; the edge turns errors into messages.'),
    qShort('Undoing the steps already done when a later one fails is called a…', 'rollback', 'Release what was reserved.'),
  ],
})
