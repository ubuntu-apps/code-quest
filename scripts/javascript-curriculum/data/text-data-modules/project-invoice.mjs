// Text, data and modules side quest (hard): An invoice maker. Lesson, Try-it snippets, challenges and quiz.
import { makeProject, mc, prints, same, snippet, task, throwsWhen } from '../_builders.mjs'

const ORDER = 'const orderJson = `{\n  "number": "2026-0147",\n  "client": "Riverside Bikes",\n  "issued": "2026-11-12",\n  "lines": [\n    { "item": "Brake pads", "qty": 4, "unit": 12.5 },\n    { "item": "Chain", "qty": 2, "unit": 24.99 },\n    { "item": "Labour (hours)", "qty": 1.5, "unit": 40 }\n  ]\n}`\n'
const MONEY = 'const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })\n'
const TOTALS = 'function totals(lines, taxRate) {\n  const round = (n) => Math.round(n * 100) / 100\n  const subtotal = round(lines.reduce((s, l) => s + l.qty * l.unit, 0))\n  const tax = round(subtotal * taxRate)\n  return { subtotal, tax, total: round(subtotal + tax) }\n}\n'
const DUE = 'function dueDate(issued, days) {\n  const d = new Date(issued + "T00:00:00Z")\n  d.setUTCDate(d.getUTCDate() + days)\n  return d.toISOString().slice(0, 10)\n}\n'

export default makeProject('hard', {
  id: 'proj_invoice',
  title: 'An invoice maker',
  paragraphs: [
    'A bike repair shop gets its orders as JSON from its booking app. Build the code that checks an order and prints a neat invoice: line totals, tax, a due date 30 days after it was issued, and money shown properly.',
    '```text\nINVOICE 2026-0147               Riverside Bikes\nIssued 2026-11-12                Due 2026-12-12\n\nBrake pads          4 × $12.50           $50.00\nChain               2 × $24.99           $49.98\nLabour (hours)    1.5 × $40.00           $60.00\n\nSubtotal                                $159.98\nTax 20%                                  $32.00\nTotal                                   $191.98\n```',
    'Money needs care: `0.1 + 0.2` isn\'t exactly `0.3` in JavaScript, so round each sum to cents with `Math.round(n * 100) / 100`, and format with `Intl.NumberFormat` only when printing. Dates are in `YYYY-MM-DD` text; work on them in UTC so the computer\'s time zone can\'t shift a day.',
  ],
  sandboxCode: ORDER + '\nconst order = JSON.parse(orderJson)\nconsole.log(order.client, order.lines.length, "lines")\nconsole.log(0.1 + 0.2, Math.round((0.1 + 0.2) * 100) / 100)',
  sandboxSnippets: [
    snippet('Money', MONEY + 'console.log(usd.format(49.98), usd.format(1234.5))'),
    snippet('30 days later', 'const d = new Date("2026-11-12T00:00:00Z")\nd.setUTCDate(d.getUTCDate() + 30)\nconsole.log(d.toISOString().slice(0, 10))'),
  ],
  challenges: [
    task('easy', 'Read the order', {
      prompt: 'Parse `orderJson` into `order`, and make `itemNames` the list of the items on its lines.',
      starter: ORDER,
      hint: '`const order = JSON.parse(orderJson)`; `order.lines.map((l) => l.item)`.',
      solution: ORDER + 'const order = JSON.parse(orderJson)\nconst itemNames = order.lines.map((l) => l.item)',
      tests: [['order.client', 'order.client === "Riverside Bikes"'], ['itemNames', same('itemNames', '["Brake pads", "Chain", "Labour (hours)"]')]],
      alt: ORDER.replace('"Chain"', '"Bell"'),
    }),
    task('easy', 'The totals', {
      prompt: 'Write `totals(lines, taxRate)` that returns `{ subtotal, tax, total }`, each rounded to cents: the subtotal is the sum of `qty * unit`; the tax is the subtotal times `taxRate`.',
      hint: 'A `round` helper, `reduce` for the subtotal, then the other two.',
      solution: TOTALS,
      tests: [['The order', same('totals([{ qty: 4, unit: 12.5 }, { qty: 2, unit: 24.99 }, { qty: 1.5, unit: 40 }], 0.2)', '{ subtotal: 159.98, tax: 32, total: 191.98 }')], ['Cents', same('totals([{ qty: 3, unit: 0.1 }], 0)', '{ subtotal: 0.3, tax: 0, total: 0.3 }')]],
    }),
    task('medium', 'Due date', {
      prompt: 'Write `dueDate(issued, days)` that returns the date `days` after `issued`, both as `YYYY-MM-DD` text, working in UTC.',
      hint: '`new Date(issued + "T00:00:00Z")`, `setUTCDate(getUTCDate() + days)`, then `toISOString().slice(0, 10)`.',
      solution: DUE,
      tests: [['30 days', 'dueDate("2026-11-12", 30) === "2026-12-12"'], ['Into a new year', 'dueDate("2026-12-20", 14) === "2027-01-03"'], ['Leap year', 'dueDate("2028-02-28", 1) === "2028-02-29"']],
    }),
    task('medium', 'Check the order', {
      prompt: 'Write `checkOrder(order)` that throws an `Error` with a clear message if the order is bad, and returns `true` if it is fine: `"No lines"` if `lines` is missing or empty; `"Bad line: ITEM"` if a line\'s `qty` or `unit` isn\'t a number above 0; `"Bad date"` if `issued` isn\'t `YYYY-MM-DD`.',
      hint: '`Array.isArray(order.lines) && order.lines.length > 0`; for the numbers, `typeof x === "number" && x > 0`; for the date, `/^\\d{4}-\\d{2}-\\d{2}$/`.',
      solution: 'function checkOrder(order) {\n  if (!Array.isArray(order.lines) || order.lines.length === 0) throw new Error("No lines")\n  for (const line of order.lines) {\n    const ok = (x) => typeof x === "number" && x > 0\n    if (!ok(line.qty) || !ok(line.unit)) throw new Error(`Bad line: ${line.item}`)\n  }\n  if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(order.issued ?? "")) throw new Error("Bad date")\n  return true\n}',
      tests: [['A good order', 'checkOrder({ issued: "2026-11-12", lines: [{ item: "Chain", qty: 2, unit: 24.99 }] }) === true'], ['No lines', throwsWhen('checkOrder({ issued: "2026-11-12", lines: [] })', 'No lines')], ['Bad line', throwsWhen('checkOrder({ issued: "2026-11-12", lines: [{ item: "Bell", qty: "2", unit: 5 }] })', 'Bad line: Bell')], ['Bad date', throwsWhen('checkOrder({ issued: "12/11/2026", lines: [{ item: "Bell", qty: 1, unit: 5 }] })', 'Bad date')]],
    }),
    task('hard', 'Invoice lines', {
      prompt: 'Write `lineText(line)` that gives one invoice line: the item padded to 16 characters, the quantity padded on the left to 5, ` × `, the unit price in dollars padded on the right to 8, then the line total in dollars padded on the left to 15. For example `lineText({ item: "Chain", qty: 2, unit: 24.99 })` gives `"Chain               2 × $24.99           $49.98"`.',
      starter: MONEY,
      hint: '`line.item.padEnd(16) + String(line.qty).padStart(5) + " × " + usd.format(line.unit).padEnd(8) + usd.format(line.qty * line.unit).padStart(15)`.',
      solution: MONEY + 'function lineText(line) {\n  const total = Math.round(line.qty * line.unit * 100) / 100\n  return line.item.padEnd(16) + String(line.qty).padStart(5) + " × " + usd.format(line.unit).padEnd(8) + usd.format(total).padStart(15)\n}',
      tests: [['Chain', 'lineText({ item: "Chain", qty: 2, unit: 24.99 }) === "Chain               2 × $24.99           $49.98"'], ['Labour', 'lineText({ item: "Labour (hours)", qty: 1.5, unit: 40 }) === "Labour (hours)    1.5 × $40.00           $60.00"']],
    }),
    task('expert', 'The whole invoice', {
      prompt: 'Write `printInvoice(orderJson, taxRate)` that parses and checks the order, then shows the invoice exactly as in the lesson (the header lines are 47 characters wide: the left part padded to the end, the right part on the right). If the order is bad, show `Cannot make invoice: MESSAGE` instead. Then call it for `orderJson` with a tax rate of `0.2`.',
      starter: ORDER + MONEY + TOTALS + DUE + 'function checkOrder(order) {\n  if (!Array.isArray(order.lines) || order.lines.length === 0) throw new Error("No lines")\n  return true\n}\nfunction lineText(line) {\n  const total = Math.round(line.qty * line.unit * 100) / 100\n  return line.item.padEnd(16) + String(line.qty).padStart(5) + " × " + usd.format(line.unit).padEnd(8) + usd.format(total).padStart(15)\n}\n',
      hint: 'A helper `row(left, right)` that gives `left + right.padStart(47 - left.length)`. Show: two header rows, a blank line, the line texts, a blank line, then Subtotal, `Tax 20%` (from `taxRate * 100`) and Total rows with `usd.format`. Put it all in `try`…`catch`.',
      solution: ORDER + MONEY + TOTALS + DUE + 'function checkOrder(order) {\n  if (!Array.isArray(order.lines) || order.lines.length === 0) throw new Error("No lines")\n  return true\n}\nfunction lineText(line) {\n  const total = Math.round(line.qty * line.unit * 100) / 100\n  return line.item.padEnd(16) + String(line.qty).padStart(5) + " × " + usd.format(line.unit).padEnd(8) + usd.format(total).padStart(15)\n}\nfunction printInvoice(orderJson, taxRate) {\n  const row = (left, right) => left + right.padStart(47 - left.length)\n  try {\n    const order = JSON.parse(orderJson)\n    checkOrder(order)\n    const t = totals(order.lines, taxRate)\n    console.log(row(`INVOICE ${order.number}`, order.client))\n    console.log(row(`Issued ${order.issued}`, `Due ${dueDate(order.issued, 30)}`))\n    console.log("")\n    for (const line of order.lines) console.log(lineText(line))\n    console.log("")\n    console.log(row("Subtotal", usd.format(t.subtotal)))\n    console.log(row(`Tax ${Math.round(taxRate * 100)}%`, usd.format(t.tax)))\n    console.log(row("Total", usd.format(t.total)))\n  } catch (e) {\n    console.log(`Cannot make invoice: ${e.message}`)\n  }\n}\nprintInvoice(orderJson, 0.2)',
      tests: [['Shows the invoice', prints('INVOICE 2026-0147               Riverside Bikes', 'Issued 2026-11-12                Due 2026-12-12', '', 'Brake pads          4 × $12.50           $50.00', 'Chain               2 × $24.99           $49.98', 'Labour (hours)    1.5 × $40.00           $60.00', '', 'Subtotal                                $159.98', 'Tax 20%                                  $32.00', 'Total                                   $191.98')], ['A bad order', '(() => { const lines = []; const log = console.log; console.log = (v) => lines.push(v); try { printInvoice(\'{"lines":[]}\', 0.2) } finally { console.log = log } return lines.join("|") === "Cannot make invoice: No lines" })()'], ['Not JSON', '(() => { const lines = []; const log = console.log; console.log = (v) => lines.push(v); try { printInvoice("oops", 0.2) } finally { console.log = log } return lines.length === 1 && lines[0].startsWith("Cannot make invoice: ") })()']],
      alt: ORDER.replace('"Riverside Bikes"', '"Hill Cycles"') + MONEY + TOTALS + DUE + 'function checkOrder(order) {\n  if (!Array.isArray(order.lines) || order.lines.length === 0) throw new Error("No lines")\n  return true\n}\nfunction lineText(line) {\n  const total = Math.round(line.qty * line.unit * 100) / 100\n  return line.item.padEnd(16) + String(line.qty).padStart(5) + " × " + usd.format(line.unit).padEnd(8) + usd.format(total).padStart(15)\n}',
    }),
  ],
  questions: [
    mc('What does `0.1 + 0.2 === 0.3` give in JavaScript?', ['`false`', '`true`', 'An error', '`NaN`'], 0, 'Binary fractions aren\'t exact; round money to cents.', { code: 'console.log(0.1 + 0.2 === 0.3)', output: 'false' }),
    mc('Why work on the dates in UTC?', ['So the computer\'s time zone can\'t shift the day', 'UTC dates are faster', 'Local dates can\'t add days', 'It is required by JSON'], 0, 'Date-only values don\'t belong to a time zone.'),
    mc('When should the amounts become text like `$49.98`?', ['Only when printing', 'Straight after parsing', 'Before adding them up', 'In the JSON'], 0, 'Add numbers, show text.'),
    mc('What does `"2026-11-12T00:00:00Z"` mean?', ['Midnight on 12 November 2026, UTC', 'Noon local time', '12 November in the local zone', 'An invalid date'], 0, 'Z is UTC.'),
    mc('Why check the order before printing?', ['Bad data gives a clear message instead of a broken invoice', 'JSON.parse checks it already', 'Printing is slow', 'It isn\'t needed'], 0, 'Valid JSON can still be a wrong order.'),
    mc('What does `"Tax".padEnd(6) + "|"` give?', ['`Tax   |`', '`   Tax|`', '`Tax|`', '`Tax6|`'], 0, 'Spaces added on the right, up to 6.', { code: 'console.log("Tax".padEnd(6) + "|")', output: 'Tax   |' }),
  ],
})
