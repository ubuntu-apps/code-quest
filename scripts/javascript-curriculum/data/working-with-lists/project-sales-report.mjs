// Working with lists side quest (medium): A sales report. Lesson, Try-it snippets, challenges and quiz.
import { is, makeProject, mc, same, snippet, task } from '../_builders.mjs'

export default makeProject('medium', {
  id: 'proj_sales_report',
  title: 'A sales report',
  paragraphs: [
    'A small shop records each sale:',
    '```\nconst sales = [\n  { day: "Mon", item: "tea", qty: 3, price: 2.5 },\n  { day: "Mon", item: "cake", qty: 1, price: 4 },\n  { day: "Tue", item: "tea", qty: 5, price: 2.5 },\n  { day: "Tue", item: "pie", qty: 2, price: 3.5 },\n  { day: "Wed", item: "cake", qty: 4, price: 4 },\n]\n```',
    'The owner wants a weekly report: the total takings, takings by day, the best-selling item by quantity, and a few neat lines to print.',
    'Each sale is worth `qty * price`. You will total, group, sort and format, using `reduce`, `Object.groupBy`, `Object.entries` and `toSorted`.',
    '```text\nWeek: $47.00\nMon: $11.50\nTue: $19.50\nWed: $16.00\nBest seller: tea (8)\n```',
  ],
  sandboxCode: 'const sales = [\n  { day: "Mon", item: "tea", qty: 3, price: 2.5 },\n  { day: "Tue", item: "pie", qty: 2, price: 3.5 },\n]\nconsole.log(sales.map((s) => s.qty * s.price))',
  sandboxSnippets: [
    snippet('Group by day', 'const sales = [{ day: "Mon", qty: 1 }, { day: "Tue", qty: 2 }, { day: "Mon", qty: 3 }]\nconsole.log(Object.groupBy(sales, (s) => s.day))'),
  ],
  challenges: [
    task('easy', 'Week total', {
      prompt: 'Write `weekTotal(sales)`, returning the total of `qty * price` for every sale.',
      hint: '`sales.reduce((sum, s) => sum + s.qty * s.price, 0)`.',
      solution: 'function weekTotal(sales) {\n  return sales.reduce((sum, s) => sum + s.qty * s.price, 0)\n}',
      tests: [['Two sales', is('weekTotal([{ qty: 3, price: 2.5 }, { qty: 1, price: 4 }])', 11.5)], ['None', is('weekTotal([])', 0)]],
    }),
    task('easy', 'Items sold', {
      prompt: 'Write `itemsSold(sales)`, returning the different items sold, A to Z, without repeats.',
      hint: '`[...new Set(sales.map((s) => s.item))].toSorted()`.',
      solution: 'function itemsSold(sales) {\n  return [...new Set(sales.map((s) => s.item))].toSorted()\n}',
      tests: [['Three items', same('itemsSold([{ item: "tea" }, { item: "cake" }, { item: "tea" }, { item: "pie" }])', '["cake", "pie", "tea"]')]],
    }),
    task('medium', 'By day', {
      prompt: 'Write `byDay(sales)`, returning an object from each day to its takings.',
      hint: 'Group by day, then turn each group into a `reduce` total with `Object.fromEntries`.',
      solution: 'function byDay(sales) {\n  const groups = Object.groupBy(sales, (s) => s.day)\n  return Object.fromEntries(\n    Object.entries(groups).map(([day, list]) => [day, list.reduce((sum, s) => sum + s.qty * s.price, 0)]),\n  )\n}',
      tests: [['Days', same('byDay([{ day: "Mon", qty: 3, price: 2.5 }, { day: "Tue", qty: 2, price: 3.5 }, { day: "Mon", qty: 1, price: 4 }])', '{ Mon: 11.5, Tue: 7 }')]],
    }),
    task('medium', 'Quantity of each', {
      prompt: 'Write `qtyByItem(sales)`, returning an object from each item to the total `qty` sold.',
      hint: '`reduce` into `{}`: `acc[s.item] = (acc[s.item] ?? 0) + s.qty`.',
      solution: 'function qtyByItem(sales) {\n  return sales.reduce((acc, s) => {\n    acc[s.item] = (acc[s.item] ?? 0) + s.qty\n    return acc\n  }, {})\n}',
      tests: [['Items', same('qtyByItem([{ item: "tea", qty: 3 }, { item: "cake", qty: 1 }, { item: "tea", qty: 5 }])', '{ tea: 8, cake: 1 }')]],
    }),
    task('hard', 'Best seller', {
      prompt: 'Write `bestSeller(sales)`, returning `[item, qty]` for the item with the most sold (the first, if tied).',
      hint: 'Total the qty per item, then `Object.entries(...).toSorted(([, a], [, b]) => b - a)[0]`.',
      solution: 'function bestSeller(sales) {\n  const qty = sales.reduce((acc, s) => {\n    acc[s.item] = (acc[s.item] ?? 0) + s.qty\n    return acc\n  }, {})\n  return Object.entries(qty).toSorted(([, a], [, b]) => b - a)[0]\n}',
      tests: [['Tea', same('bestSeller([{ item: "tea", qty: 3 }, { item: "cake", qty: 5 }, { item: "tea", qty: 5 }])', '["tea", 8]')], ['Tie', same('bestSeller([{ item: "a", qty: 1 }, { item: "b", qty: 1 }])', '["a", 1]')]],
    }),
    task('expert', 'The report', {
      prompt: 'Write `report(sales)`, returning the lines of the lesson\'s report: `Week: $…`, one `Day: $…` line per day in the order days first appear, then `Best seller: item (qty)`. Money has 2 decimal places.',
      hint: 'Reuse the ideas from the earlier steps; build an array of lines and return it.',
      solution: 'function report(sales) {\n  const money = (n) => `$${n.toFixed(2)}`\n  const worth = (s) => s.qty * s.price\n  const lines = [`Week: ${money(sales.reduce((sum, s) => sum + worth(s), 0))}`]\n  for (const [day, list] of Object.entries(Object.groupBy(sales, (s) => s.day))) {\n    lines.push(`${day}: ${money(list.reduce((sum, s) => sum + worth(s), 0))}`)\n  }\n  const qty = sales.reduce((acc, s) => {\n    acc[s.item] = (acc[s.item] ?? 0) + s.qty\n    return acc\n  }, {})\n  const [item, n] = Object.entries(qty).toSorted(([, a], [, b]) => b - a)[0]\n  lines.push(`Best seller: ${item} (${n})`)\n  return lines\n}',
      tests: [['The week', same('report([{ day: "Mon", item: "tea", qty: 3, price: 2.5 }, { day: "Mon", item: "cake", qty: 1, price: 4 }, { day: "Tue", item: "tea", qty: 5, price: 2.5 }, { day: "Tue", item: "pie", qty: 2, price: 3.5 }, { day: "Wed", item: "cake", qty: 4, price: 4 }])', '["Week: $47.00", "Mon: $11.50", "Tue: $19.50", "Wed: $16.00", "Best seller: tea (8)"]')], ['One sale', same('report([{ day: "Fri", item: "pie", qty: 1, price: 3 }])', '["Week: $3.00", "Fri: $3.00", "Best seller: pie (1)"]')]],
    }),
  ],
  questions: [
    mc('What is one sale of `{ qty: 3, price: 2.5 }` worth?', ['7.5', '5.5', '3', '2.5'], 0, '3 × 2.5.', { code: 'console.log(3 * 2.5)', output: '7.5' }),
    mc('Which gives the different items without repeats?', ['`[...new Set(items)]`', '`items.sort()`', '`items.flat()`', '`items.join()`'], 0, 'A Set drops repeats.'),
    mc('What does `Object.entries({ tea: 8 })` give?', ['`[["tea", 8]]`', '`["tea", 8]`', '`8`', '`{ tea: 8 }`'], 0, 'A list of pairs.', { code: 'console.log(Object.entries({ tea: 8 }))', output: "[ [ 'tea', 8 ] ]" }),
    mc('In `toSorted(([, a], [, b]) => b - a)`, what are `a` and `b`?', ['The values of two pairs', 'The keys', 'The indexes', 'The whole pairs'], 0, 'The empty slot skips the key.'),
    mc('What does `(16).toFixed(2)` give?', ['"16.00"', '16', '"16"', '16.00'], 0, 'Text with 2 decimal places.', { code: 'console.log((16).toFixed(2))', output: '16.00' }),
    mc('Why group by day before totalling?', ['To get one total for each day', 'To sort the sales', 'reduce needs groups', 'To remove repeats'], 0, 'One group per day, one sum per group.'),
  ],
})
