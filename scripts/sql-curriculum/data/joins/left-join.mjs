// Joining tables: LEFT JOIN.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { JOINS_DB } from '../joins-db.mjs'

export default makeTopic({
  id: 'left_join',
  title: 'LEFT JOIN',
  database: JOINS_DB,
  paragraphs: [
    "An inner join drops rows with no match: Finn and Grace never ordered, so they vanish from every query so far. `LEFT JOIN` keeps **every row of the left table** (the one in `FROM`), matched or not:",
    '```\nSELECT c.name, o.id AS order_id\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id;\n```',
    "Customers with orders get one row per order, as before. Finn and Grace get one row each, with `NULL` in every column from `orders`, because there was nothing to fill them with.",
    'This makes counting with zeros possible. Count a column from the right table, not the rows: `COUNT(*)` would count Finn\'s single row and say 1, but `COUNT(o.id)` skips the `NULL` and says 0.',
    '```\nSELECT c.name, COUNT(o.id) AS orders\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nGROUP BY c.id, c.name;\n```',
    "`SUM` over no rows gives `NULL`, not 0, so wrap it: `COALESCE(SUM(i.quantity), 0)`.",
    "Where you put a condition matters. To count only shipped orders but keep every customer, put the condition in `ON`: `LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped'`. In `WHERE`, the test `o.status = 'shipped'` is not true for the `NULL` rows (it is unknown), so they are thrown away and the query acts like an inner join again.",
    'Which table goes first matters too: the one in `FROM` is the one that is kept whole. SQLite 3.39 and later also has `RIGHT JOIN`, which keeps the right table instead, but you can always swap the tables and use `LEFT JOIN`, which is what most people do.',
  ],
  sandboxCode: 'SELECT c.name, COUNT(o.id) AS orders\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nGROUP BY c.id, c.name;',
  sandboxSnippets: [
    snippet('Every customer', 'SELECT c.name, o.id AS order_id\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id;'),
    snippet('Counts with zeros', 'SELECT c.name, COUNT(o.id) AS orders\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nGROUP BY c.id, c.name;'),
    snippet('COUNT(*) is wrong here', 'SELECT c.name, COUNT(*) AS orders\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nGROUP BY c.id, c.name;'),
    snippet('Condition in ON', "SELECT c.name, COUNT(o.id) AS shipped\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped'\nGROUP BY c.id, c.name;"),
    snippet('Condition in WHERE', "-- Finn, Grace and others disappear\nSELECT c.name, COUNT(o.id) AS shipped\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nWHERE o.status = 'shipped'\nGROUP BY c.id, c.name;"),
  ],
  readMore: { label: 'SQLite: joins in SELECT', url: 'https://www.sqlite.org/lang_select.html#fromclause', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Every customer', {
      prompt: "Show every customer's `name` with the `id` of each of their orders, called `order_id`. Customers with no orders must still appear.",
      hint: '`FROM customers c LEFT JOIN orders o ON o.customer_id = c.id`.',
      solution: 'SELECT c.name, o.id AS order_id\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id;',
    }),
    query('easy', 'Counts with zeros', {
      prompt: "Show every customer's `name` and their number of orders (`orders`), with 0 for customers who never ordered.",
      hint: '`LEFT JOIN`, then `COUNT(o.id)`, grouped by customer.',
      solution: 'SELECT c.name, COUNT(o.id) AS orders\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nGROUP BY c.id, c.name;',
    }),
    query('easy', 'Every product', {
      prompt: "Show every product's `name` with the `quantity` of each order line for it. Products never ordered must still appear.",
      hint: '`FROM products p LEFT JOIN order_items i ON i.product_id = p.id`.',
      solution: 'SELECT p.name, i.quantity\nFROM products p\nLEFT JOIN order_items i ON i.product_id = p.id;',
    }),
    query('medium', 'Fix the count', {
      prompt: 'This query says Finn Murphy has 1 order, but he has none. Fix it.',
      starter: 'SELECT c.name, COUNT(*) AS orders\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nGROUP BY c.id, c.name;',
      hint: '`COUNT(*)` counts his row of NULLs. Count a column from orders instead.',
      solution: 'SELECT c.name, COUNT(o.id) AS orders\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nGROUP BY c.id, c.name;',
    }),
    query('medium', 'Items per product, with zeros', {
      prompt: "Show every product's `name` and its total quantity ordered (`items`), with 0 for products never ordered. Most first, then by name.",
      hint: '`COALESCE(SUM(i.quantity), 0) AS items … ORDER BY items DESC, p.name`.',
      solution: 'SELECT p.name, COALESCE(SUM(i.quantity), 0) AS items\nFROM products p\nLEFT JOIN order_items i ON i.product_id = p.id\nGROUP BY p.id, p.name\nORDER BY items DESC, p.name;',
    }),
    query('hard', 'Shipped, with zeros', {
      prompt: "Show every customer's `name` and their number of shipped orders (`shipped`), with 0 for customers who have none.",
      hint: "Put the status test in ON: `LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped'`.",
      solution: "SELECT c.name, COUNT(o.id) AS shipped\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped'\nGROUP BY c.id, c.name;",
    }),
    query('hard', 'Fix the lost customers', {
      prompt: "This query should show every customer's number of pending orders (`pending`), including 0, but most customers are missing. Fix it.",
      starter: "SELECT c.name, COUNT(o.id) AS pending\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nWHERE o.status = 'pending'\nGROUP BY c.id, c.name;",
      hint: 'The WHERE throws away the rows with no pending order. Move the test into ON.',
      solution: "SELECT c.name, COUNT(o.id) AS pending\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'pending'\nGROUP BY c.id, c.name;",
    }),
    query('expert', 'Takings per product', {
      prompt: "Show every product's `name` and its takings (`revenue`: sum of quantity times price, 2 decimals), with 0 for products never ordered. Highest first, then by name.",
      hint: '`ROUND(COALESCE(SUM(i.quantity * p.price), 0), 2) AS revenue`.',
      solution: 'SELECT p.name, ROUND(COALESCE(SUM(i.quantity * p.price), 0), 2) AS revenue\nFROM products p\nLEFT JOIN order_items i ON i.product_id = p.id\nGROUP BY p.id, p.name\nORDER BY revenue DESC, p.name;',
    }),
    query('expert', 'Last order, or never', {
      prompt: "Show every customer's `name` and the date of their latest order (`last_order`), or the text `never` if they haven't ordered. In name order.",
      hint: "`COALESCE(MAX(o.order_date), 'never') AS last_order`.",
      solution: "SELECT c.name, COALESCE(MAX(o.order_date), 'never') AS last_order\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nGROUP BY c.id, c.name\nORDER BY c.name;",
    }),
  ],
  questions: [
    mc('What does `LEFT JOIN` keep that `JOIN` drops?', ['Left-table rows with no match', 'Right-table rows with no match', 'Duplicate rows', 'NULL ids'], 0,
      'Every row of the FROM table stays.'),
    mc('Finn has no orders. In `customers LEFT JOIN orders`, what is his `o.id`?', ['He has no row', '0', 'NULL', 'His customer id'], 2,
      'Columns from the unmatched side are filled with NULL.'),
    mc('Which counts orders correctly with a LEFT JOIN?', ['`SUM(o.id)`', '`COUNT(*)`', '`COUNT(c.id)`', '`COUNT(o.id)`'], 3,
      'COUNT of a column skips NULLs, so Finn gets 0.'),
    mc('What does `SUM(i.quantity)` give for a product never ordered?', ['An error', '1', 'NULL', '0'], 2,
      'Wrap it in COALESCE(…, 0) to show 0.'),
    qShort('Which function turns NULL into 0, as in `…(SUM(x), 0)`?', 'COALESCE',
      'COALESCE returns its first value that is not NULL.'),
    mc("Where should `o.status = 'shipped'` go to keep every customer?", ['In ON', 'In WHERE', 'In GROUP BY', 'In ORDER BY'], 0,
      'In ON it only limits which orders match; the customers stay.'),
    mc("What happens if you put `o.status = 'shipped'` in WHERE after a LEFT JOIN?", ['It gives an error', 'Nothing changes', 'Customers with no shipped orders disappear', 'Every customer gets 0'], 2,
      'WHERE throws away the NULL rows, so it acts like an inner join.'),
    mc('In `FROM products p LEFT JOIN order_items i`, which table is kept whole?', ['order_items', 'Neither', 'products', 'Both'], 2,
      'The table in FROM is the left one.'),
    mc('How can you get the effect of a RIGHT JOIN with LEFT JOIN?', ['Use WHERE', 'Use COUNT(*)', 'Swap the two tables', 'You can\'t'], 2,
      'A RIGHT JOIN B is the same as B LEFT JOIN A.'),
    mc('Ana has 3 orders. How many rows does she get in `customers LEFT JOIN orders`?', ['3', '1', '4', '0'], 0,
      'Matched rows work like an inner join: one per order.'),
  ],
})
