// Advanced queries: NULL and other traps.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { ADVANCED_DB } from '../advanced-db.mjs'

export default makeTopic({
  id: 'null_traps',
  title: 'NULL and other traps',
  database: ADVANCED_DB,
  paragraphs: [
    'Some queries look right, run without an error and still give the wrong answer. Most of these traps involve NULL. Here is the worst one: which staff have never made a sale?',
    "```\nSELECT name FROM staff\nWHERE id NOT IN (SELECT staff_id FROM sales)\nORDER BY name;\n```",
    "It returns nothing, though Rosa has made no sales. Self-checkout sales have a NULL `staff_id`, and `x NOT IN (…, NULL)` is never true: it asks \"is x different from every value?\", and nobody knows whether x differs from an unknown. Use `NOT EXISTS`, which isn't fooled by NULLs, or filter the NULLs out of the subquery.",
    "The other NULL traps: `= NULL` is never true, so use `IS NULL`. `COUNT(column)`, `SUM` and `AVG` skip NULLs, while `COUNT(*)` counts rows. Anything combined with NULL is NULL: `price * 2`, and `'Hi ' || NULL` too. A sum of no rows is NULL, not 0. And in SQLite, NULLs sort first in ascending order.",
    "A LEFT JOIN can be undone by WHERE. In `products p LEFT JOIN sales s ON … WHERE s.sold_on >= '2026-10-08'`, products with no sales then have NULL there and the WHERE removes them. A condition on the right-hand table belongs in the ON clause.",
    "One more that isn't about NULL: dividing a whole number by a whole number gives a whole number in SQLite. `7 / 2` is 3. Write `7 * 1.0 / 2`, or `7 / 2.0`, to get 3.5.",
  ],
  sandboxCode: "SELECT name FROM staff\nWHERE id NOT IN (SELECT staff_id FROM sales)\nORDER BY name;",
  sandboxSnippets: [
    snippet('NOT IN and NULL', "SELECT name FROM staff\nWHERE id NOT IN (SELECT staff_id FROM sales)\nORDER BY name;"),
    snippet('NOT EXISTS', "SELECT name FROM staff st\nWHERE NOT EXISTS (SELECT 1 FROM sales s WHERE s.staff_id = st.id)\nORDER BY name;"),
    snippet('Small surprises', "SELECT 7 / 2 AS whole, 7 / 2.0 AS exact, NULL = NULL AS equal, NULL IS NULL AS is_null,\n       'Hi ' || NULL AS joined, (SELECT SUM(quantity) FROM sales WHERE 0) AS empty_sum;"),
  ],
  readMore: { label: 'SQLite: NULL handling', url: 'https://www.sqlite.org/nulls.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Never sold', {
      prompt: "This should list the staff who have never made a sale, but it returns nothing. Fix it. Sort by name.",
      starter: "SELECT name FROM staff\nWHERE id NOT IN (SELECT staff_id FROM sales)\nORDER BY name;",
      hint: 'Use `NOT EXISTS (SELECT 1 FROM sales s WHERE s.staff_id = st.id)`, or add `WHERE staff_id IS NOT NULL` inside the subquery.',
      solution: "SELECT name FROM staff st\nWHERE NOT EXISTS (SELECT 1 FROM sales s WHERE s.staff_id = st.id)\nORDER BY name;",
    }),
    query('easy', 'Count it right', {
      prompt: "Show one row: the number of sales (`all_sales`), the sales served by staff (`staffed`) and the self-checkout sales (`self_checkout`).",
      hint: '`COUNT(*)`, `COUNT(staff_id)`, and the difference between them (or `COUNT(*) FILTER (WHERE staff_id IS NULL)`).',
      solution: 'SELECT COUNT(*) AS all_sales, COUNT(staff_id) AS staffed, COUNT(*) - COUNT(staff_id) AS self_checkout\nFROM sales;',
    }),
    query('easy', 'Price on request', {
      prompt: "This should list the products with no price, but returns nothing. Fix it. Sort by name.",
      starter: "SELECT name FROM products\nWHERE price = NULL\nORDER BY name;",
      hint: '`= NULL` is never true. Use `IS NULL`.',
      solution: 'SELECT name FROM products\nWHERE price IS NULL\nORDER BY name;',
    }),
    query('medium', 'Keep every product', {
      prompt: "This should show every product with the items sold from 2026-10-08 on (`items`, 0 if none), but products with no such sales vanish. Fix it. Sort by name.",
      starter: "SELECT p.name, COALESCE(SUM(s.quantity), 0) AS items\nFROM products p\nLEFT JOIN sales s ON s.product_id = p.id\nWHERE s.sold_on >= '2026-10-08'\nGROUP BY p.id, p.name\nORDER BY p.name;",
      hint: "Move the date condition into the ON clause: `ON s.product_id = p.id AND s.sold_on >= '2026-10-08'`.",
      solution: "SELECT p.name, COALESCE(SUM(s.quantity), 0) AS items\nFROM products p\nLEFT JOIN sales s ON s.product_id = p.id AND s.sold_on >= '2026-10-08'\nGROUP BY p.id, p.name\nORDER BY p.name;",
    }),
    query('medium', 'Items per sale', {
      prompt: "This should show each sold product's average items per sale (`per_sale`, 2 decimals), but every answer is a whole number. Fix it. Sort by name.",
      starter: "SELECT p.name, ROUND(SUM(s.quantity) / COUNT(*), 2) AS per_sale\nFROM sales s\nJOIN products p ON p.id = s.product_id\nGROUP BY p.id, p.name\nORDER BY p.name;",
      hint: 'Whole number divided by whole number is a whole number. Multiply by 1.0 first.',
      solution: "SELECT p.name, ROUND(SUM(s.quantity) * 1.0 / COUNT(*), 2) AS per_sale\nFROM sales s\nJOIN products p ON p.id = s.product_id\nGROUP BY p.id, p.name\nORDER BY p.name;",
    }),
    query('medium', 'Names with managers', {
      prompt: "This should label everyone as `Name (manager's name)`, but the person at the top gets an empty label. Fix it so they get `Name (no manager)`. Sort by name.",
      starter: "SELECT s.name, s.name || ' (' || m.name || ')' AS label\nFROM staff s\nLEFT JOIN staff m ON m.id = s.manager_id\nORDER BY s.name;",
      hint: "Text joined with NULL is NULL. `COALESCE(m.name, 'no manager')`.",
      solution: "SELECT s.name, s.name || ' (' || COALESCE(m.name, 'no manager') || ')' AS label\nFROM staff s\nLEFT JOIN staff m ON m.id = s.manager_id\nORDER BY s.name;",
    }),
    query('hard', 'Two averages', {
      prompt: "Show one row with the average Q1 target of those who have one (`avg_set`) and the average if empty Q1 targets count as 0 (`avg_all`), both 1 decimal.",
      hint: '`AVG(q1)` skips NULLs; `AVG(COALESCE(q1, 0))` doesn\'t.',
      solution: 'SELECT ROUND(AVG(q1), 1) AS avg_set, ROUND(AVG(COALESCE(q1, 0)), 1) AS avg_all\nFROM targets;',
    }),
    query('hard', 'Missing prices last', {
      prompt: "Show every product's `name` and `price`, cheapest first, but with products without a price at the end. Then by name.",
      hint: 'NULLs sort first. `ORDER BY price IS NULL, price, name` puts them last (0 sorts before 1). Newer SQLite also has `NULLS LAST`.',
      solution: 'SELECT name, price\nFROM products\nORDER BY price IS NULL, price, name;',
    }),
    query('expert', 'Takings for everyone', {
      prompt: "Show every staff member's `name` and `takings` (quantity times price of their sales, 2 decimals), with 0 for anyone with none. Most first, then by name.",
      hint: 'LEFT JOIN sales and products; `ROUND(COALESCE(SUM(s.quantity * p.price), 0), 2)`. A sale of a product with no price adds nothing.',
      solution: 'SELECT st.name, ROUND(COALESCE(SUM(s.quantity * p.price), 0), 2) AS takings\nFROM staff st\nLEFT JOIN sales s ON s.staff_id = st.id\nLEFT JOIN products p ON p.id = s.product_id\nGROUP BY st.id, st.name\nORDER BY takings DESC, st.name;',
    }),
    query('expert', 'Tills open', {
      prompt: "For each `sold_on`, show how many different staff sold something (`staff`) and how many tills were used (`tills`), counting the self-checkout as one till and each staff member as one. In date order.",
      hint: '`COUNT(DISTINCT staff_id)` skips the NULLs. For tills, turn NULL into a value that is no staff id: `COUNT(DISTINCT COALESCE(staff_id, 0))`.',
      solution: 'SELECT sold_on, COUNT(DISTINCT staff_id) AS staff, COUNT(DISTINCT COALESCE(staff_id, 0)) AS tills\nFROM sales\nGROUP BY sold_on\nORDER BY sold_on;',
    }),
  ],
  questions: [
    mc('Why does `id NOT IN (SELECT staff_id FROM sales)` return nothing when staff_id has a NULL?', ['Comparing with NULL is unknown, so NOT IN is never true', 'NOT IN skips NULLs', 'The subquery fails', 'IN only works on text'], 0,
      'Use NOT EXISTS instead.'),
    mc('What does `WHERE price = NULL` return?', ['Every row', 'An error', 'The rows with no price', 'No rows, ever'], 3,
      'Use IS NULL.'),
    mc('`COUNT(staff_id)` against `COUNT(*)`:', ['COUNT(*) skips NULLs', 'COUNT(staff_id) skips rows where staff_id is NULL', 'COUNT(staff_id) counts distinct values', 'They are the same'], 1,
      'COUNT(*) counts rows.'),
    mc("What is `'Hi ' || NULL`?", ['NULL', "'Hi '", "'Hi NULL'", 'An error'], 0,
      'Anything combined with NULL is NULL.'),
    qShort('In SQLite, what is `7 / 2`?', '3',
      'Whole numbers give a whole number. `7 / 2.0` is 3.5.'),
    mc("Why does `WHERE s.sold_on >= …` after a LEFT JOIN drop unmatched rows?", ['LEFT JOIN ignores WHERE', 'WHERE runs first', 'It doesn\'t', 'Their s.sold_on is NULL, and the comparison isn\'t true'], 3,
      'Put conditions on the right-hand table in ON.'),
    mc('What is the SUM of no rows?', ['1', '0', 'NULL', 'An error'], 2,
      'COALESCE it to 0 when you need a number.'),
    mc('Where do NULLs go with ORDER BY price in SQLite?', ['Nowhere: they are left out', 'First', 'In the middle', 'Last'], 1,
      'Sort by `price IS NULL` first to move them last.'),
    mc('Which average counts empty targets as 0?', ['SUM(q1) / COUNT(q1)', 'AVG(q1 IS NULL)', 'AVG(COALESCE(q1, 0))', 'AVG(q1)'], 2,
      'AVG on its own skips NULLs.'),
    mc('Does COUNT(DISTINCT staff_id) count NULL as a value?', ['No, it skips NULLs', 'Yes, once', 'Yes, every time', 'Only with GROUP BY'], 0,
      'COALESCE it to a stand-in value to count it.'),
  ],
})
