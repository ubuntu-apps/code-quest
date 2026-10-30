// Joining tables: Finding rows with no match.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { JOINS_DB } from '../joins-db.mjs'

export default makeTopic({
  id: 'unmatched_rows',
  title: 'Rows with no match',
  database: JOINS_DB,
  paragraphs: [
    'Some of the most useful questions are about what is missing: customers who never ordered, products nobody bought, staff with no sales. A `LEFT JOIN` finds them, because the unmatched rows are the ones with `NULL` on the right side.',
    '```\nSELECT c.name\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nWHERE o.id IS NULL;\n```',
    "Read it as: take every customer, attach their orders if they have any, then keep only the rows where no order was attached. Test a column that can't be `NULL` in a real match, like the right table's `id`.",
    "This `WHERE` is fine, unlike the one in the last stage. There, `WHERE o.status = 'shipped'` threw the unmatched rows away by accident. Here, `WHERE o.id IS NULL` keeps only the unmatched rows, on purpose.",
    'You can combine both ideas. Customers with no **shipped** order: put the status in `ON`, so only shipped orders can match, then keep the rows that found none:',
    "```\nSELECT c.name\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped'\nWHERE o.id IS NULL;\n```",
    'Remember to use `IS NULL`, never `= NULL`, which is never true.',
  ],
  sandboxCode: 'SELECT c.name\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nWHERE o.id IS NULL;',
  sandboxSnippets: [
    snippet('Never ordered', 'SELECT c.name\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nWHERE o.id IS NULL;'),
    snippet('Never sold', 'SELECT p.name\nFROM products p\nLEFT JOIN order_items i ON i.product_id = p.id\nWHERE i.id IS NULL;'),
    snippet('No shipped order', "SELECT c.name\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped'\nWHERE o.id IS NULL;"),
  ],
  readMore: { label: 'SQLite: joins in SELECT', url: 'https://www.sqlite.org/lang_select.html#fromclause', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Never ordered', {
      prompt: "Show the `name` of every customer who has never placed an order.",
      hint: '`LEFT JOIN orders`, then `WHERE o.id IS NULL`.',
      solution: 'SELECT c.name\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nWHERE o.id IS NULL;',
    }),
    query('easy', 'Never sold', {
      prompt: 'Show the `name` of every product that is in no order line.',
      hint: '`FROM products p LEFT JOIN order_items i ON i.product_id = p.id WHERE i.id IS NULL`.',
      solution: 'SELECT p.name\nFROM products p\nLEFT JOIN order_items i ON i.product_id = p.id\nWHERE i.id IS NULL;',
    }),
    query('medium', 'Unsold stock', {
      prompt: 'Show the `name`, `category` and `price` of every product never ordered, most expensive first.',
      hint: 'The same query as Never sold, with more columns and `ORDER BY p.price DESC`.',
      solution: 'SELECT p.name, p.category, p.price\nFROM products p\nLEFT JOIN order_items i ON i.product_id = p.id\nWHERE i.id IS NULL\nORDER BY p.price DESC;',
    }),
    query('medium', 'How many never ordered?', {
      prompt: 'Show how many customers have never ordered, in a column called `customers`.',
      hint: '`SELECT COUNT(*) AS customers` with the same LEFT JOIN and `WHERE o.id IS NULL`.',
      solution: 'SELECT COUNT(*) AS customers\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nWHERE o.id IS NULL;',
    }),
    query('medium', 'No shipped order', {
      prompt: "Show the `name` of every customer with no shipped order (they may have other orders, or none).",
      hint: "`LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped' WHERE o.id IS NULL`.",
      solution: "SELECT c.name\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped'\nWHERE o.id IS NULL;",
    }),
    query('hard', 'Cancelled, or not', {
      prompt: "This query should show every customer with the date of their cancelled order (`cancelled_on`), or NULL if they have none. It only shows one customer. Fix it.",
      starter: "SELECT c.name, o.order_date AS cancelled_on\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nWHERE o.status = 'cancelled';",
      hint: 'Move the status test into ON so the other customers are kept.',
      solution: "SELECT c.name, o.order_date AS cancelled_on\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'cancelled';",
    }),
    query('hard', 'Quiet sales staff', {
      prompt: "Show the `name` of each employee with the role `Sales` who handled no orders.",
      hint: "`WHERE o.id IS NULL AND e.role = 'Sales'`.",
      solution: "SELECT e.name\nFROM employees e\nLEFT JOIN orders o ON o.employee_id = e.id\nWHERE o.id IS NULL AND e.role = 'Sales';",
    }),
    query('expert', 'Empty categories', {
      prompt: 'Show each product `category` in which no product was ever ordered.',
      hint: 'Group products by category after a LEFT JOIN to order_items, and keep the groups with `HAVING COUNT(i.id) = 0`.',
      solution: 'SELECT p.category\nFROM products p\nLEFT JOIN order_items i ON i.product_id = p.id\nGROUP BY p.category\nHAVING COUNT(i.id) = 0;',
    }),
    query('expert', 'Ordered, but nothing shipped', {
      prompt: "Show the `name` of every customer who has placed at least one order, but none of whose orders shipped.",
      hint: "Join customers to orders (so only customers with orders remain), group by customer and keep the groups with `HAVING SUM(CASE WHEN o.status = 'shipped' THEN 1 ELSE 0 END) = 0`.",
      solution: "SELECT c.name\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nGROUP BY c.id, c.name\nHAVING SUM(CASE WHEN o.status = 'shipped' THEN 1 ELSE 0 END) = 0;",
    }),
  ],
  questions: [
    mc('Which finds customers who never ordered?', ['`JOIN orders … WHERE o.id IS NULL`', '`LEFT JOIN orders … WHERE o.id = NULL`', '`JOIN orders … WHERE c.id IS NULL`', '`LEFT JOIN orders … WHERE o.id IS NULL`'], 3,
      'Only unmatched rows have NULL in the right table\'s id.'),
    mc('Why test `o.id` rather than, say, `o.status`?', ['A real match always has an id, so NULL means no match', 'Status is text', 'It sorts faster', 'It is shorter'], 0,
      'A matched order could have other columns that are NULL.'),
    mc('Would an inner join find customers with no orders?', ['Yes', 'Only with WHERE', 'No, it drops them', 'Only with GROUP BY'], 2,
      'Inner joins only keep matches.'),
    mc('What does `WHERE o.id = NULL` return?', ['Every row', 'An error', 'No rows', 'The unmatched rows'], 2,
      'Comparing with = NULL is never true. Use IS NULL.'),
    qShort('Fill in: `WHERE o.id ___ NULL` (one word)', 'IS',
      'IS NULL tests for a missing value.'),
    mc('Customers with no shipped order: where does the status test go?', ['In ON', 'In WHERE, next to IS NULL', 'In ORDER BY', 'It can\'t be done'], 0,
      'In ON, only shipped orders can match; IS NULL then finds those with none.'),
    mc('Which counts the categories with no orders?', ['`COUNT(*)` per category', '`HAVING COUNT(i.id) = 0` after a LEFT JOIN', '`WHERE COUNT(i.id) = 0`', '`HAVING COUNT(*) = 0`'], 1,
      'COUNT(*) is never 0 for a group, because the group has at least one row.'),
    mc('Why is `WHERE o.id IS NULL` fine after a LEFT JOIN, but `WHERE o.status = …` is not?', ['They are both wrong', 'IS NULL is faster', 'IS NULL keeps the unmatched rows on purpose; the status test throws them away', 'Only one uses WHERE'], 2,
      'The difference is whether the NULL rows pass the test.'),
    mc('Which finds employees who handled no orders?', ['`FROM employees e JOIN orders o … WHERE o.id IS NULL`', '`FROM orders o JOIN employees e …`', '`FROM employees e LEFT JOIN orders o ON o.employee_id = e.id WHERE o.id IS NULL`', '`FROM orders o LEFT JOIN employees e … WHERE e.id IS NULL`'], 2,
      'Keep every employee, then keep those with no order attached.'),
    mc('Which table goes in FROM to find products never ordered?', ['`products`', '`order_items`', '`orders`', '`customers`'], 0,
      'The table you want to keep whole goes first.'),
  ],
})
