// Joining tables: Totals over joined tables.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { JOINS_DB } from '../joins-db.mjs'

export default makeTopic({
  id: 'join_aggregate',
  title: 'Totals across tables',
  database: JOINS_DB,
  paragraphs: [
    'Joins and `GROUP BY` work well together: join first to bring in the names, then group and count.',
    '```\nSELECT c.name, COUNT(*) AS orders\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nGROUP BY c.id, c.name;\n```',
    'Why group by `c.id` as well as `c.name`? Two customers could share a name, and grouping by the name alone would add their orders together. Grouping by the id keeps each customer separate, and adding the name lets you show it.',
    'Totals often need a calculation from both tables. The total of each order is the sum of quantity times price over its lines:',
    '```\nSELECT i.order_id, ROUND(SUM(i.quantity * p.price), 2) AS total\nFROM order_items i\nJOIN products p ON i.product_id = p.id\nGROUP BY i.order_id;\n```',
    '`WHERE`, `HAVING` and `ORDER BY` work as before. The rows are joined, then filtered by `WHERE`, then grouped, then the groups are filtered by `HAVING`.',
    "One thing to notice: a customer with no orders doesn't appear at all, not even with 0. The inner join dropped them before the counting began. The `LEFT JOIN` stage fixes that.",
  ],
  sandboxCode: 'SELECT c.name, COUNT(*) AS orders\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nGROUP BY c.id, c.name;',
  sandboxSnippets: [
    snippet('Orders per customer', 'SELECT c.name, COUNT(*) AS orders\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nGROUP BY c.id, c.name;'),
    snippet('Order totals', 'SELECT i.order_id, ROUND(SUM(i.quantity * p.price), 2) AS total\nFROM order_items i\nJOIN products p ON i.product_id = p.id\nGROUP BY i.order_id;'),
    snippet('Items per category', 'SELECT p.category, SUM(i.quantity) AS items\nFROM order_items i\nJOIN products p ON i.product_id = p.id\nGROUP BY p.category\nORDER BY items DESC, p.category;'),
  ],
  readMore: { label: 'SQLite: aggregate functions', url: 'https://www.sqlite.org/lang_aggfunc.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Orders per customer', {
      prompt: "Show each customer's `name` and their number of orders, called `orders`.",
      hint: 'Join orders to customers, then `GROUP BY c.id, c.name`.',
      solution: 'SELECT c.name, COUNT(*) AS orders\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nGROUP BY c.id, c.name;',
    }),
    query('easy', 'Items per product', {
      prompt: "Show each ordered product's `name` and the total quantity ordered, called `items`.",
      hint: 'Join order_items to products, `SUM(i.quantity)`, `GROUP BY p.id, p.name`.',
      solution: 'SELECT p.name, SUM(i.quantity) AS items\nFROM order_items i\nJOIN products p ON i.product_id = p.id\nGROUP BY p.id, p.name;',
    }),
    query('medium', 'Order totals', {
      prompt: 'Show each `order_id` and its total (sum of quantity times price, 2 decimals), called `total`.',
      hint: '`ROUND(SUM(i.quantity * p.price), 2) AS total … GROUP BY i.order_id`.',
      solution: 'SELECT i.order_id, ROUND(SUM(i.quantity * p.price), 2) AS total\nFROM order_items i\nJOIN products p ON i.product_id = p.id\nGROUP BY i.order_id;',
    }),
    query('medium', 'Items per category', {
      prompt: 'Show each product `category` and the total quantity ordered, called `items`. Most first, then by category.',
      hint: '`GROUP BY p.category ORDER BY items DESC, p.category`.',
      solution: 'SELECT p.category, SUM(i.quantity) AS items\nFROM order_items i\nJOIN products p ON i.product_id = p.id\nGROUP BY p.category\nORDER BY items DESC, p.category;',
    }),
    query('medium', 'Shipped per customer', {
      prompt: "Show each customer's `name` and their number of shipped orders (`shipped`). Most first, then by name.",
      hint: "`WHERE o.status = 'shipped'` before grouping, then `ORDER BY shipped DESC, c.name`.",
      solution: "SELECT c.name, COUNT(*) AS shipped\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nWHERE o.status = 'shipped'\nGROUP BY c.id, c.name\nORDER BY shipped DESC, c.name;",
    }),
    query('hard', 'Repeat customers', {
      prompt: "Show the `name` of each customer with two or more orders, and their number of orders (`orders`).",
      hint: '`HAVING COUNT(*) >= 2`.',
      solution: 'SELECT c.name, COUNT(*) AS orders\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nGROUP BY c.id, c.name\nHAVING COUNT(*) >= 2;',
    }),
    query('hard', 'Top three products', {
      prompt: 'Show the three products with the highest takings: `name` and `revenue` (sum of quantity times price, 2 decimals). Highest first.',
      hint: '`GROUP BY p.id, p.name ORDER BY revenue DESC LIMIT 3`.',
      solution: 'SELECT p.name, ROUND(SUM(i.quantity * p.price), 2) AS revenue\nFROM order_items i\nJOIN products p ON i.product_id = p.id\nGROUP BY p.id, p.name\nORDER BY revenue DESC\nLIMIT 3;',
    }),
    query('expert', 'Last order', {
      prompt: "Show each customer's `name` and the date of their latest order (`last_order`). Most recent first.",
      hint: '`MAX(o.order_date) AS last_order … ORDER BY last_order DESC`.',
      solution: 'SELECT c.name, MAX(o.order_date) AS last_order\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nGROUP BY c.id, c.name\nORDER BY last_order DESC;',
    }),
    query('expert', 'Big orders', {
      prompt: 'Show the orders worth more than 50: `order_id`, number of lines (`lines`) and `total` (2 decimals). Biggest first.',
      hint: '`HAVING SUM(i.quantity * p.price) > 50 ORDER BY total DESC`.',
      solution: 'SELECT i.order_id, COUNT(*) AS lines, ROUND(SUM(i.quantity * p.price), 2) AS total\nFROM order_items i\nJOIN products p ON i.product_id = p.id\nGROUP BY i.order_id\nHAVING SUM(i.quantity * p.price) > 50\nORDER BY total DESC;',
    }),
  ],
  questions: [
    mc('Why `GROUP BY c.id, c.name` instead of only `c.name`?', ['Two customers could share a name', 'It is faster', 'Names can\'t be grouped', 'It sorts the result'], 0,
      'The id keeps each customer separate; the name is there to show.'),
    mc('Which comes first when the query runs?', ['ORDER BY', 'GROUP BY', 'The join', 'HAVING'], 2,
      'FROM and JOIN build the rows before anything is grouped.'),
    mc('How do you total an order?', ['MAX(price)', 'COUNT(*) of its lines', 'SUM(price)', 'SUM(quantity * price) over its lines'], 3,
      'Each line is worth quantity times price.'),
    mc('Does a customer with no orders appear in an inner join count?', ['No, the inner join drops them', 'Yes, with 0', 'Yes, with NULL', 'Only if they joined recently'], 0,
      'They have no matching row, so there is nothing to count.'),
    qShort('Which clause filters groups by their totals?', 'HAVING',
      'WHERE filters rows before grouping; HAVING filters groups after.'),
    mc("Where do you test `o.status = 'shipped'` when counting shipped orders per customer?", ['ORDER BY', 'ON', 'WHERE', 'HAVING'], 2,
      'It is about single rows, so filter before grouping.'),
    mc('`MAX(o.order_date)` per customer gives…', ['Their first order', 'Their latest order date', 'Their number of orders', 'An error'], 1,
      'Dates in YYYY-MM-DD form sort in time order.'),
    mc('Where does `HAVING SUM(i.quantity * p.price) > 50` go?', ['After GROUP BY', 'After LIMIT', 'Before WHERE', 'Inside ON'], 0,
      'HAVING follows GROUP BY.'),
    mc('Why are kitchen and electronics sorted by name in "Items per category"?', ['Alphabetical is required', 'Category is the only column', 'They have the same total, so the second sort key decides', 'Names come first'], 2,
      'A tie-breaker gives a fixed order.'),
    mc('Can you group by a column from the joined table?', ['Only the id', 'Yes, from either table', 'No', 'Only numbers'], 1,
      'After the join, all columns are available for grouping.'),
  ],
})
