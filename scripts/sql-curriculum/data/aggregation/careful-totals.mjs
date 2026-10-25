// Summarising data: Totals that need care.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { AGGREGATION_DB } from '../aggregation-db.mjs'

export default makeTopic({
  id: 'careful_totals',
  title: 'Totals that need care',
  database: AGGREGATION_DB,
  paragraphs: [
    "A few things about totals catch everyone out at least once.",
    "**The sum of nothing is NULL.** When no rows match, `SUM`, `AVG`, `MIN` and `MAX` give `NULL`, not 0 (only `COUNT` gives 0). Wrap the total in `COALESCE` when 0 is the right answer:",
    "```\nSELECT COALESCE(SUM(quantity), 0) AS juice_items FROM sales WHERE category = 'Juice';\n```",
    "The same happens inside groups: `SUM(CASE WHEN category = 'Tea' THEN quantity END)` is `NULL` for a store with no tea. `COALESCE(…, 0)` or an `ELSE 0` fixes it.",
    "**Whole-number division.** Sums and counts of whole numbers are whole numbers, so `SUM(score) / COUNT(score)` drops the decimals. Multiply by `1.0` first, or use `AVG`.",
    "**An average of prices is not the price per item.** `AVG(unit_price)` treats a sale of 1 latte like a sale of 10 cookies. The average price actually paid per item is the takings divided by the items: `SUM(quantity * unit_price) / SUM(quantity)`.",
    "```\nSELECT ROUND(AVG(unit_price), 2) AS average_listed_price,\n       ROUND(SUM(quantity * unit_price) / SUM(quantity), 2) AS paid_per_item\nFROM sales;\n```",
    'Neither is wrong: they answer different questions. Before writing a total, say in words what it should mean.',
  ],
  sandboxCode: "SELECT ROUND(AVG(unit_price), 2) AS average_listed_price,\n       ROUND(SUM(quantity * unit_price) / SUM(quantity), 2) AS paid_per_item\nFROM sales;",
  sandboxSnippets: [
    snippet('Two averages', "SELECT ROUND(AVG(unit_price), 2) AS average_listed_price,\n       ROUND(SUM(quantity * unit_price) / SUM(quantity), 2) AS paid_per_item\nFROM sales;"),
    snippet('Sum of nothing', "SELECT SUM(quantity) AS plain, COALESCE(SUM(quantity), 0) AS with_coalesce\nFROM sales WHERE category = 'Juice';"),
    snippet('Whole numbers', 'SELECT student, SUM(score) / COUNT(score) AS whole, ROUND(AVG(score), 1) AS exact\nFROM results GROUP BY student;'),
    snippet('NULL in groups', "SELECT store, SUM(CASE WHEN category = 'Tea' THEN quantity END) AS tea\nFROM sales GROUP BY store;"),
  ],
  readMore: { label: 'SQLite: aggregate functions', url: 'https://www.sqlite.org/lang_aggfunc.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Juice at North', {
      prompt: "Show the number of `Juice` items sold at the `North` store, called `items`, as 0 if there were none.",
      hint: "`COALESCE(SUM(quantity), 0) ... WHERE store = 'North' AND category = 'Juice'`.",
      solution: "SELECT COALESCE(SUM(quantity), 0) AS items FROM sales WHERE store = 'North' AND category = 'Juice';",
    }),
    query('easy', 'Paid per item', {
      prompt: 'Show the average price paid per item across all sales (takings divided by items), rounded to 2 decimals, called `price_per_item`.',
      hint: '`ROUND(SUM(quantity * unit_price) / SUM(quantity), 2)`.',
      solution: 'SELECT ROUND(SUM(quantity * unit_price) / SUM(quantity), 2) AS price_per_item FROM sales;',
    }),
    query('medium', 'Two kinds of average price', {
      prompt: 'In one row, show the plain average of `unit_price` (`average_listed_price`) and the price paid per item (`paid_per_item`), both rounded to 2 decimals.',
      hint: '`ROUND(AVG(unit_price), 2)` and `ROUND(SUM(quantity * unit_price) / SUM(quantity), 2)`.',
      solution: 'SELECT ROUND(AVG(unit_price), 2) AS average_listed_price,\n       ROUND(SUM(quantity * unit_price) / SUM(quantity), 2) AS paid_per_item\nFROM sales;',
    }),
    query('medium', 'Fix the average', {
      prompt: "This query should show each student's average score with 1 decimal, but it drops the decimals. Fix it, keeping the name `average`.",
      starter: 'SELECT student, SUM(score) / COUNT(score) AS average FROM results GROUP BY student;',
      hint: 'Multiply by 1.0 before dividing, then round: `ROUND(SUM(score) * 1.0 / COUNT(score), 1)`. (`ROUND(AVG(score), 1)` gives the same.)',
      solution: 'SELECT student, ROUND(SUM(score) * 1.0 / COUNT(score), 1) AS average FROM results GROUP BY student;',
    }),
    query('medium', 'Items per sale', {
      prompt: 'Show each `category` and the average number of items per sale, rounded to 2 decimals, called `avg_items`.',
      hint: '`ROUND(AVG(quantity), 2)`. AVG keeps decimals even for whole numbers.',
      solution: 'SELECT category, ROUND(AVG(quantity), 2) AS avg_items FROM sales GROUP BY category;',
    }),
    query('hard', 'Takings per trading day', {
      prompt: 'Show each `store` and its takings per day it traded (takings divided by the number of different sale dates), rounded to 2 decimals, called `per_day`.',
      hint: '`ROUND(SUM(quantity * unit_price) / COUNT(DISTINCT sale_date), 2)`.',
      solution: 'SELECT store, ROUND(SUM(quantity * unit_price) / COUNT(DISTINCT sale_date), 2) AS per_day FROM sales GROUP BY store;',
    }),
    query('hard', 'First, last and count', {
      prompt: 'Show each `store` with its first sale date (`first_sale`), last sale date (`last_sale`) and number of sales (`sales`).',
      hint: '`MIN(sale_date)`, `MAX(sale_date)` and `COUNT(*)` with `GROUP BY store`.',
      solution: 'SELECT store, MIN(sale_date) AS first_sale, MAX(sale_date) AS last_sale, COUNT(*) AS sales FROM sales GROUP BY store;',
    }),
    query('expert', 'Biggest gaps', {
      prompt: "Show each `student` and the gap between their best and worst score, called `gap`. Biggest gap first, then by name.",
      hint: '`MAX(score) - MIN(score) AS gap ... ORDER BY gap DESC, student`.',
      solution: 'SELECT student, MAX(score) - MIN(score) AS gap FROM results\nGROUP BY student\nORDER BY gap DESC, student;',
    }),
    query('expert', 'Tea, or zero', {
      prompt: "Show each `store` and the number of `Tea` items it sold, called `tea_items`, with 0 for a store that sold none.",
      hint: "`COALESCE(SUM(CASE WHEN category = 'Tea' THEN quantity END), 0)`, or add `ELSE 0` inside the CASE.",
      solution: "SELECT store, COALESCE(SUM(CASE WHEN category = 'Tea' THEN quantity END), 0) AS tea_items FROM sales GROUP BY store;",
    }),
  ],
  questions: [
    mc('What does `SUM(quantity)` give when no rows match?', ['`0`', '`NULL`', 'No row at all', 'An error'], 1,
      'SUM, AVG, MIN and MAX of no values are NULL; only COUNT gives 0.'),
    mc('What does `COUNT(*)` give when no rows match?', ['`0`', '`NULL`', 'No row at all', 'An error'], 0,
      'COUNT gives 0 for an empty set.'),
    mc('How do you show 0 instead of a NULL total?', ['`SUM(quantity, 0)`', '`IFZERO(SUM(quantity))`', '`COALESCE(SUM(quantity), 0)`', '`SUM(quantity) OR 0`'], 2,
      'COALESCE replaces the NULL with 0.'),
    mc('What is `SUM(score) / COUNT(score)` for scores 80 and 85?', ['`82.5`', '`83`', '`NULL`', '`82`'], 3,
      'Both are whole numbers, so the division drops the .5.'),
    qShort('Which function averages numbers and keeps decimals, even for whole numbers?', 'AVG',
      'AVG always gives a decimal result.'),
    mc('1 latte at 4.00 and 9 cookies at 2.00. What is the price paid per item?', ['`2.20`', '`3.00`', '`2.00`', '`4.00`'], 0,
      'Takings 22.00 divided by 10 items is 2.20; AVG(unit_price) would say 3.00.'),
    mc('Which is the plain average of the listed prices?', ['`SUM(quantity * unit_price) / SUM(quantity)`', '`AVG(unit_price)`', '`SUM(unit_price)`', '`AVG(quantity)`'], 1,
      'AVG(unit_price) gives every sale the same weight, whatever its quantity.'),
    mc('Which averages takings per trading day?', ['`AVG(sale_date)`', '`SUM(...) / COUNT(*)`', '`SUM(quantity) / 7`', '`SUM(quantity * unit_price) / COUNT(DISTINCT sale_date)`'], 3,
      'Divide by the number of different days, not the number of sales.'),
    mc("Why can `SUM(CASE WHEN category = 'Tea' THEN quantity END)` be NULL?", ['A group with no tea has only NULLs to add', 'CASE needs ELSE', 'SUM ignores CASE', 'Tea is text'], 0,
      'Without ELSE, non-tea rows are NULL; if all are, the sum is NULL.'),
    mc('What should you do before writing a total?', ['Add ROUND', 'Use GROUP BY', 'Say in words what it should mean', 'Use COUNT(*)'], 2,
      'Different totals answer different questions, so decide which question you are answering.'),
  ],
})
