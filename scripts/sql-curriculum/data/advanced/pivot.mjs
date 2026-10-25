// Advanced queries: Turning rows into columns.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { ADVANCED_DB } from '../advanced-db.mjs'

const WEEKS = "SELECT p.name,\n       SUM(CASE WHEN s.sold_on < '2026-10-08' THEN s.quantity ELSE 0 END) AS week1,\n       SUM(CASE WHEN s.sold_on >= '2026-10-08' THEN s.quantity ELSE 0 END) AS week2\nFROM sales s\nJOIN products p ON p.id = s.product_id\nGROUP BY p.id, p.name\nORDER BY p.name;"
const ROLES = "SELECT COUNT(*) FILTER (WHERE role = 'manager') AS managers,\n       COUNT(*) FILTER (WHERE role = 'supervisor') AS supervisors,\n       COUNT(*) FILTER (WHERE role = 'assistant') AS assistants,\n       COUNT(*) FILTER (WHERE role = 'trainee') AS trainees\nFROM staff;"

export default makeTopic({
  id: 'pivot',
  title: 'Rows into columns',
  database: ADVANCED_DB,
  paragraphs: [
    'A grouped query gives one row per group: items per product and week would be one row for each product and each week. Reports often want the weeks side by side instead, as columns. Turning rows into columns like that is called a **pivot**.',
    'SQLite has no PIVOT keyword. You write one column for each value you want, each adding up only its own rows with `CASE`:',
    '```\n' + WEEKS + '\n```',
    "`ELSE 0` makes a product with no sales in a week show 0 rather than NULL. The other aggregates work too: `COUNT(CASE WHEN … THEN 1 END)` counts, because COUNT skips the NULL from a CASE with no ELSE.",
    'A shorter way to write the condition is `FILTER`, after any aggregate:',
    '```\n' + ROLES + '\n```',
    "With no GROUP BY, that is one row for the whole table. One limit of pivots in SQL: you must list the columns yourself, so you need to know the values (the weeks, the roles) when you write the query.",
  ],
  sandboxCode: WEEKS,
  sandboxSnippets: [
    snippet('Rows first', "SELECT p.name, CASE WHEN s.sold_on < '2026-10-08' THEN 'week1' ELSE 'week2' END AS week,\n       SUM(s.quantity) AS items\nFROM sales s\nJOIN products p ON p.id = s.product_id\nGROUP BY p.name, week\nORDER BY p.name, week;"),
    snippet('Weeks as columns', WEEKS),
    snippet('Roles with FILTER', ROLES),
  ],
  readMore: { label: 'SQLite: aggregate functions and FILTER', url: 'https://www.sqlite.org/lang_aggfunc.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Two weeks side by side', {
      prompt: "For each product with sales, show `name`, the items sold before 2026-10-08 (`week1`) and from 2026-10-08 on (`week2`), with 0 where none. Sort by name.",
      hint: "`SUM(CASE WHEN s.sold_on < '2026-10-08' THEN s.quantity ELSE 0 END) AS week1`.",
      solution: WEEKS,
    }),
    query('easy', 'Roles in one row', {
      prompt: 'Show one row with the number of staff in each role: `managers`, `supervisors`, `assistants` and `trainees`.',
      hint: "`COUNT(*) FILTER (WHERE role = 'manager') AS managers`, and so on.",
      solution: ROLES,
    }),
    query('easy', 'Staffed or self-checkout', {
      prompt: 'For each `sold_on`, show the sales served by staff (`staffed`) and those at the self-checkout, which have no staff_id (`self_checkout`). In date order.',
      hint: '`COUNT(staff_id)` counts the served sales; `COUNT(*) FILTER (WHERE staff_id IS NULL)` the others.',
      solution: 'SELECT sold_on,\n       COUNT(*) FILTER (WHERE staff_id IS NOT NULL) AS staffed,\n       COUNT(*) FILTER (WHERE staff_id IS NULL) AS self_checkout\nFROM sales\nGROUP BY sold_on\nORDER BY sold_on;',
    }),
    query('medium', 'Weekdays and weekends', {
      prompt: "For each product with sales, show `name`, the items sold on weekdays (`weekday_items`) and at weekends (`weekend_items`). Sort by name.",
      hint: "Weekends are `strftime('%w', s.sold_on) IN ('0', '6')`.",
      solution: "SELECT p.name,\n       SUM(CASE WHEN strftime('%w', s.sold_on) IN ('0', '6') THEN 0 ELSE s.quantity END) AS weekday_items,\n       SUM(CASE WHEN strftime('%w', s.sold_on) IN ('0', '6') THEN s.quantity ELSE 0 END) AS weekend_items\nFROM sales s\nJOIN products p ON p.id = s.product_id\nGROUP BY p.id, p.name\nORDER BY p.name;",
    }),
    query('medium', 'Staff by week', {
      prompt: "For each staff member with sales, show `name`, items sold before 2026-10-08 (`week1`), from then on (`week2`) and in all (`total`). Sort by name.",
      hint: 'Two CASE sums and a plain SUM.',
      solution: "SELECT st.name,\n       SUM(CASE WHEN s.sold_on < '2026-10-08' THEN s.quantity ELSE 0 END) AS week1,\n       SUM(CASE WHEN s.sold_on >= '2026-10-08' THEN s.quantity ELSE 0 END) AS week2,\n       SUM(s.quantity) AS total\nFROM sales s\nJOIN staff st ON st.id = s.staff_id\nGROUP BY st.id, st.name\nORDER BY st.name;",
    }),
    query('medium', 'Price bands', {
      prompt: 'For each category with products, show its `category` name and how many of its products cost under 10 (`under_10`), 10 to 20 (`from_10_to_20`) and over 20 (`over_20`). Products without a price count in none. Sort by category.',
      hint: 'Join products to categories; `COUNT(*) FILTER (WHERE p.price BETWEEN 10 AND 20)` and so on.',
      solution: 'SELECT c.name AS category,\n       COUNT(*) FILTER (WHERE p.price < 10) AS under_10,\n       COUNT(*) FILTER (WHERE p.price BETWEEN 10 AND 20) AS from_10_to_20,\n       COUNT(*) FILTER (WHERE p.price > 20) AS over_20\nFROM products p\nJOIN categories c ON c.id = p.category_id\nGROUP BY c.id, c.name\nORDER BY category;',
    }),
    query('hard', 'Items by role', {
      prompt: "For each `sold_on`, show the items sold by assistants (`assistants`), by supervisors and the manager together (`seniors`), by trainees (`trainees`) and at the self-checkout (`self_checkout`). In date order.",
      hint: "LEFT JOIN staff (self-checkout sales have no staff). `SUM(s.quantity) FILTER (WHERE st.role IN ('supervisor', 'manager'))`, and COALESCE each to 0.",
      solution: "SELECT s.sold_on,\n       COALESCE(SUM(s.quantity) FILTER (WHERE st.role = 'assistant'), 0) AS assistants,\n       COALESCE(SUM(s.quantity) FILTER (WHERE st.role IN ('supervisor', 'manager')), 0) AS seniors,\n       COALESCE(SUM(s.quantity) FILTER (WHERE st.role = 'trainee'), 0) AS trainees,\n       COALESCE(SUM(s.quantity) FILTER (WHERE s.staff_id IS NULL), 0) AS self_checkout\nFROM sales s\nLEFT JOIN staff st ON st.id = s.staff_id\nGROUP BY s.sold_on\nORDER BY s.sold_on;",
    }),
    query('hard', 'With a total line', {
      prompt: "Show Two weeks side by side, then one more row at the end named `All products` with the totals of each column. Keep the products in name order, with the total last.",
      hint: "UNION ALL a second grouped query with no GROUP BY. To keep the total last, add a sort column (0 for products, 1 for the total) in a subquery, and sort by it, then name.",
      solution: "SELECT name, week1, week2\nFROM (\n  SELECT 0 AS sort, p.name,\n         SUM(CASE WHEN s.sold_on < '2026-10-08' THEN s.quantity ELSE 0 END) AS week1,\n         SUM(CASE WHEN s.sold_on >= '2026-10-08' THEN s.quantity ELSE 0 END) AS week2\n  FROM sales s\n  JOIN products p ON p.id = s.product_id\n  GROUP BY p.id, p.name\n  UNION ALL\n  SELECT 1, 'All products',\n         SUM(CASE WHEN sold_on < '2026-10-08' THEN quantity ELSE 0 END),\n         SUM(CASE WHEN sold_on >= '2026-10-08' THEN quantity ELSE 0 END)\n  FROM sales\n) AS t\nORDER BY sort, name;",
    }),
    query('expert', 'Category weekend table', {
      prompt: "For each category name with sales (`category`; `No category` for products without one), show `weekday_items`, `weekend_items` and `place` (RANK by all items, most first). Sort by place, then category.",
      hint: "LEFT JOIN categories and group by the COALESCEd name; `RANK() OVER (ORDER BY SUM(s.quantity) DESC)`.",
      solution: "SELECT COALESCE(c.name, 'No category') AS category,\n       SUM(CASE WHEN strftime('%w', s.sold_on) IN ('0', '6') THEN 0 ELSE s.quantity END) AS weekday_items,\n       SUM(CASE WHEN strftime('%w', s.sold_on) IN ('0', '6') THEN s.quantity ELSE 0 END) AS weekend_items,\n       RANK() OVER (ORDER BY SUM(s.quantity) DESC) AS place\nFROM sales s\nJOIN products p ON p.id = s.product_id\nLEFT JOIN categories c ON c.id = p.category_id\nGROUP BY COALESCE(c.name, 'No category')\nORDER BY place, category;",
    }),
    query('expert', 'The first three days', {
      prompt: "For each product sold on 2026-10-01, 10-02 or 10-03, show `name` and its items on each of those days as `oct1`, `oct2` and `oct3` (0 where none). Sort by name.",
      hint: "Filter the three days in WHERE, then one CASE sum per day.",
      solution: "SELECT p.name,\n       SUM(CASE WHEN s.sold_on = '2026-10-01' THEN s.quantity ELSE 0 END) AS oct1,\n       SUM(CASE WHEN s.sold_on = '2026-10-02' THEN s.quantity ELSE 0 END) AS oct2,\n       SUM(CASE WHEN s.sold_on = '2026-10-03' THEN s.quantity ELSE 0 END) AS oct3\nFROM sales s\nJOIN products p ON p.id = s.product_id\nWHERE s.sold_on BETWEEN '2026-10-01' AND '2026-10-03'\nGROUP BY p.id, p.name\nORDER BY p.name;",
    }),
  ],
  questions: [
    mc('What is a pivot?', ['Sorting rows', 'Joining a table to itself', 'Removing duplicates', 'Turning the values of a column into separate columns'], 3,
      'Weeks become columns instead of rows.'),
    mc('Does SQLite have a PIVOT keyword?', ['No: you write one CASE or FILTER column per value', 'Only in views', 'Only for numbers', 'Yes'], 0,
      'Each column picks out its own rows.'),
    mc("What does `ELSE 0` do in `SUM(CASE WHEN … THEN quantity ELSE 0 END)`?", ['Skips the row', 'Nothing', 'Counts rows', 'Makes a group with no matching rows show 0 instead of NULL'], 3,
      'Without ELSE, a group with no matches sums only NULLs.'),
    mc('Which counts the trainees?', ["COUNT(*) FILTER (WHERE role = 'trainee')", "SUM(role = 'trainee' FILTER)", "COUNT(role) WHERE role = 'trainee'", "FILTER COUNT(*) (role = 'trainee')"], 0,
      'FILTER goes after the aggregate.'),
    qShort("Which keyword follows an aggregate to limit its rows, as in `COUNT(*) … (WHERE role = 'manager')`?", 'FILTER',
      'A shorter way to write the CASE.'),
    mc('What must you know to write a pivot in SQL?', ['Nothing', 'The values that become columns', 'The number of rows', 'The primary key'], 1,
      'Each column is written out by hand.'),
    mc('Why does `COUNT(CASE WHEN x THEN 1 END)` count only matching rows?', ['CASE is a filter', 'Without ELSE, other rows give NULL, and COUNT skips NULL', 'COUNT only counts 1s', 'It doesn\'t'], 1,
      'That is the CASE version of FILTER.'),
    mc('A pivot with no GROUP BY gives…', ['An error', 'One row for the whole table', 'No rows', 'One row per value'], 1,
      'Like any aggregate without GROUP BY.'),
    mc('How do you keep a total row last after UNION ALL?', ['Put it first in the query', 'LIMIT', 'Add a sort column (0, then 1) and sort by it first', 'ORDER BY name'], 2,
      'Only ORDER BY decides the order.'),
    mc('Can a pivot column use any aggregate, such as AVG or MAX?', ['Only SUM', 'Only COUNT', 'No', 'Yes, with CASE or FILTER'], 3,
      'For example `MAX(points) FILTER (WHERE …)`.'),
  ],
})
