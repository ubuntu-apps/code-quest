// Advanced queries: Recursive WITH, counting and series.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { ADVANCED_DB } from '../advanced-db.mjs'

const DAYS = "WITH RECURSIVE days(day) AS (\n  SELECT MIN(sold_on) FROM sales\n  UNION ALL\n  SELECT date(day, '+1 day') FROM days\n  WHERE day < (SELECT MAX(sold_on) FROM sales)\n)\nSELECT day FROM days ORDER BY day;"

export default makeTopic({
  id: 'recursive_with',
  title: 'Recursive WITH: making rows',
  database: ADVANCED_DB,
  paragraphs: [
    'A CTE marked `RECURSIVE` can select from itself. That lets a query make rows that are in no table, such as the numbers 1 to 5:',
    '```\nWITH RECURSIVE n(x) AS (\n  SELECT 1\n  UNION ALL\n  SELECT x + 1 FROM n WHERE x < 5\n)\nSELECT x FROM n;\n```',
    'It has two parts joined by `UNION ALL`. The first, the **anchor**, gives the starting rows: here one row, 1. The second, the **recursive part**, is run on the rows made last time, and its rows are added: 2, then 3, and so on. When it makes no new rows, the recursion stops. The names in brackets after `n` name its columns.',
    "The `WHERE x < 5` is what stops it. Leave it out and the query never ends, so always write the stop condition first. (A `LIMIT` on the final SELECT also stops it, as long as that SELECT has no `ORDER BY`, which would wait for every row first.)",
    'The rows can be anything you can work out from the row before: dates with `date(day, \'+1 day\')`, amounts that double, text that grows. The anchor and the stop condition can read real tables, so this makes every day from the first sale to the last:',
    '```\n' + DAYS + '\n```',
    'The rows come out in the order they were made, but only an `ORDER BY` guarantees an order, so add one when the order matters.',
  ],
  sandboxCode: 'WITH RECURSIVE n(x) AS (\n  SELECT 1\n  UNION ALL\n  SELECT x + 1 FROM n WHERE x < 5\n)\nSELECT x FROM n;',
  sandboxSnippets: [
    snippet('One to five', 'WITH RECURSIVE n(x) AS (\n  SELECT 1\n  UNION ALL\n  SELECT x + 1 FROM n WHERE x < 5\n)\nSELECT x FROM n;'),
    snippet('Every sales day', DAYS),
    snippet('Stopped by LIMIT', 'WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x * 2 FROM n)\nSELECT x FROM n LIMIT 8;'),
  ],
  readMore: { label: 'SQLite: recursive common table expressions', url: 'https://www.sqlite.org/lang_with.html#recursive_common_table_expressions', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Count to the products', {
      prompt: 'Show the numbers (`x`) from 1 up to the number of products, in order.',
      hint: 'Stop with `WHERE x < (SELECT COUNT(*) FROM products)`.',
      solution: 'WITH RECURSIVE n(x) AS (\n  SELECT 1\n  UNION ALL\n  SELECT x + 1 FROM n WHERE x < (SELECT COUNT(*) FROM products)\n)\nSELECT x FROM n ORDER BY x;',
    }),
    query('easy', 'Every sales day', {
      prompt: 'Show every date (`day`) from the first sale to the last, sales or not, in order.',
      hint: "Start at `MIN(sold_on)`, add `date(day, '+1 day')`, stop at `MAX(sold_on)`.",
      solution: DAYS,
    }),
    query('easy', 'Every other day', {
      prompt: 'Show every second date (`day`) starting at the first sale, up to the last sale, in order.',
      hint: "`date(day, '+2 days')`, and keep going while the next date isn't past the last sale.",
      solution: "WITH RECURSIVE days(day) AS (\n  SELECT MIN(sold_on) FROM sales\n  UNION ALL\n  SELECT date(day, '+2 days') FROM days\n  WHERE date(day, '+2 days') <= (SELECT MAX(sold_on) FROM sales)\n)\nSELECT day FROM days ORDER BY day;",
    }),
    query('medium', 'Price ladder', {
      prompt: 'For the cheapest product, show what 1 to 5 of it cost: `quantity` and `cost` (2 decimals). In order of quantity.',
      hint: 'Make 1 to 5, then multiply by `(SELECT MIN(price) FROM products)`.',
      solution: 'WITH RECURSIVE q(quantity) AS (\n  SELECT 1\n  UNION ALL\n  SELECT quantity + 1 FROM q WHERE quantity < 5\n)\nSELECT quantity, ROUND(quantity * (SELECT MIN(price) FROM products), 2) AS cost\nFROM q\nORDER BY quantity;',
    }),
    query('medium', 'The next five days', {
      prompt: 'Show the five dates (`day`) after the last sale, using `LIMIT` to stop the recursion instead of a WHERE.',
      hint: "Start one day after `MAX(sold_on)`, with no WHERE in the recursive part, and end with `SELECT day FROM days LIMIT 5`. Don't add ORDER BY: it would need every row first, and there is no end.",
      solution: "WITH RECURSIVE days(day) AS (\n  SELECT date(MAX(sold_on), '+1 day') FROM sales\n  UNION ALL\n  SELECT date(day, '+1 day') FROM days\n)\nSELECT day FROM days LIMIT 5;",
    }),
    query('medium', 'Weeks', {
      prompt: 'Split the sales period into weeks starting on the first sale\'s date: `week_start` and `week_end` (6 days later), for every week that starts on or before the last sale. In order.',
      hint: "Step by `'+7 days'` and show `date(week_start, '+6 days') AS week_end`.",
      solution: "WITH RECURSIVE weeks(week_start) AS (\n  SELECT MIN(sold_on) FROM sales\n  UNION ALL\n  SELECT date(week_start, '+7 days') FROM weeks\n  WHERE date(week_start, '+7 days') <= (SELECT MAX(sold_on) FROM sales)\n)\nSELECT week_start, date(week_start, '+6 days') AS week_end\nFROM weeks\nORDER BY week_start;",
    }),
    query('hard', 'Doubling', {
      prompt: 'Start at the cheapest product\'s price and keep doubling it. Show each `step` (0 for the start) and `amount`, for as long as the amount is 100 or less. In order of step.',
      hint: 'Two columns in the CTE: `(step, amount)`. The recursive part keeps rows where `amount * 2 <= 100`.',
      solution: 'WITH RECURSIVE d(step, amount) AS (\n  SELECT 0, MIN(price) FROM products\n  UNION ALL\n  SELECT step + 1, amount * 2 FROM d WHERE amount * 2 <= 100\n)\nSELECT step, amount FROM d ORDER BY step;',
    }),
    query('hard', 'Letter by letter', {
      prompt: "Split the name of the person at the top (no manager) into its characters: `n` (1 for the first) and `letter`, spaces included. In order of n.",
      hint: 'Count n from 1 up to `length(name)`, and take `substr(name, n, 1)`.',
      solution: 'WITH RECURSIVE n(n) AS (\n  SELECT 1\n  UNION ALL\n  SELECT n + 1 FROM n WHERE n < (SELECT length(name) FROM staff WHERE manager_id IS NULL)\n)\nSELECT n, substr((SELECT name FROM staff WHERE manager_id IS NULL), n, 1) AS letter\nFROM n\nORDER BY n;',
    }),
    query('expert', 'Fibonacci', {
      prompt: 'Show the Fibonacci numbers 1, 1, 2, 3, 5, … that are no bigger than the number of sales: `n` (1 for the first) and `fib`. In order of n.',
      hint: 'Carry two numbers: `(n, fib, next_fib)` starting at `(1, 1, 1)`, then `(n + 1, next_fib, fib + next_fib)` while `next_fib <=` the count.',
      solution: 'WITH RECURSIVE f(n, fib, next_fib) AS (\n  SELECT 1, 1, 1\n  UNION ALL\n  SELECT n + 1, next_fib, fib + next_fib FROM f\n  WHERE next_fib <= (SELECT COUNT(*) FROM sales)\n)\nSELECT n, fib FROM f ORDER BY n;',
    }),
    query('expert', 'Growing target', {
      prompt: "Staff member 2's Q4 target grows by 10% a year. Show the `year` (2026 for today's target, up to 2030) and the `target`, rounded to a whole number. In order of year.",
      hint: 'Start at `(2026, q4)` from targets for staff_id 2; each step adds 1 to the year and multiplies by 1.1. Round only when you show it.',
      solution: 'WITH RECURSIVE g(year, target) AS (\n  SELECT 2026, q4 FROM targets WHERE staff_id = 2\n  UNION ALL\n  SELECT year + 1, target * 1.1 FROM g WHERE year < 2030\n)\nSELECT year, ROUND(target) AS target FROM g ORDER BY year;',
    }),
  ],
  questions: [
    mc('What does RECURSIVE let a CTE do?', ['Run twice', 'Update a table', 'Sort itself', 'Select from itself, adding rows until no new ones come'], 3,
      'That is how it makes rows that are in no table.'),
    mc('What is the anchor?', ['The CTE\'s name', 'The stop condition', 'The first SELECT, which gives the starting rows', 'The final SELECT'], 2,
      'It runs once.'),
    mc('What joins the anchor and the recursive part?', ['UNION ALL', 'WHERE', 'JOIN', 'AND'], 0,
      '(UNION also works, and drops repeats.)'),
    mc('What happens without a stop condition?', ['An error at once', 'Nothing', 'It runs for ever, unless a LIMIT stops it', 'It stops at 100 rows'], 2,
      'Write the WHERE first.'),
    qShort('Which keyword after WITH lets a CTE refer to itself?', 'RECURSIVE',
      '`WITH RECURSIVE n(x) AS (…)`.'),
    mc("What does `date(day, '+1 day')` give for '2026-10-31'?", ['NULL', 'An error', "'2026-11-01'", "'2026-10-32'"], 2,
      'date() handles month and year ends.'),
    mc('When does the recursion stop?', ['When the anchor ends', 'When ORDER BY runs', 'After 10 steps', 'When the recursive part makes no new rows'], 3,
      'The WHERE makes that happen.'),
    mc('In `WITH RECURSIVE d(step, amount) AS …`, what is `(step, amount)`?', ['The names of the CTE\'s columns', 'Two tables', 'A filter', 'The ORDER BY'], 0,
      'The anchor and recursive part give values in that order.'),
    mc('Can the anchor read from real tables?', ['Only in a view', 'Yes, like `SELECT MIN(sold_on) FROM sales`', 'No, only constants', 'Only COUNT'], 1,
      'And so can the stop condition.'),
    mc('Why add ORDER BY to the final SELECT?', ['It stops the recursion', 'It is required by RECURSIVE', 'It removes repeats', 'Only ORDER BY guarantees the order of the result'], 3,
      'The rows usually come in the order made, but that isn\'t promised.'),
  ],
})
