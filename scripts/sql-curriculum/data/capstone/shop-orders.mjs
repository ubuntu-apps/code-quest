// Capstone projects: An online shop's orders.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { CHECK } from '../advanced-db.mjs'
import { SHOP_DB } from '../capstone-db.mjs'

const { viewColumns, viewRows } = CHECK

const LINES = "SELECT o.id AS order_id, o.ordered_on, c.name AS customer,\n       ROUND(SUM(i.quantity * i.unit_price), 2) AS total\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nJOIN order_items i ON i.order_id = o.id\nWHERE o.status = 'paid'\nGROUP BY o.id, o.ordered_on, c.name\nORDER BY o.ordered_on, o.id;"
const MONTHLY = "SELECT strftime('%Y-%m', o.ordered_on) AS month,\n       COUNT(DISTINCT o.id) AS orders,\n       ROUND(SUM(i.quantity * i.unit_price), 2) AS revenue\nFROM orders o\nJOIN order_items i ON i.order_id = o.id\nWHERE o.status = 'paid'\nGROUP BY month\nORDER BY month;"

export default makeTopic({
  id: 'shop_orders',
  title: "An online shop's orders",
  database: SHOP_DB,
  paragraphs: [
    "Welcome to the capstone projects. Each one is a full piece of work on a database of its own, using skills from across the course: you'll choose which tables to join, how to group, when a window or a CTE is the right tool, and which NULLs to watch out for. The challenges say what the result should look like, not how to get it, so there is usually more than one good answer.",
    "The first is a small online shop selling tea, coffee and kitchen things. The owner wants a report on the last six months: what sold, who bought it, how the months compare and how much the discounts cost.",
    "The tables are `customers`, `products`, `orders` (with a `status`: only `paid` orders count as sales) and `order_items`, one row for each product in an order, with the `quantity` and the `unit_price` actually charged. That can be lower than the product's list `price` when there was a discount, so revenue is always `quantity * unit_price`.",
    "A good habit for a report like this: start from the smallest correct query, check its rows by eye, then build on it. Here, most answers start from paid orders joined to their items:",
    '```\n' + LINES + '\n```',
  ],
  sandboxCode: LINES,
  sandboxSnippets: [
    snippet('Paid order totals', LINES),
    snippet('Months', MONTHLY),
    snippet('The tables', 'SELECT * FROM orders ORDER BY id;'),
  ],
  readMore: { label: 'SQLite: SELECT', url: 'https://www.sqlite.org/lang_select.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Sales so far', {
      prompt: "Show one row: the number of paid orders (`paid_orders`) and their `revenue` (2 decimals).",
      hint: "Join orders to order_items, keep `status = 'paid'`, and count the orders with `COUNT(DISTINCT o.id)`: each order has several item rows.",
      solution: "SELECT COUNT(DISTINCT o.id) AS paid_orders,\n       ROUND(SUM(i.quantity * i.unit_price), 2) AS revenue\nFROM orders o\nJOIN order_items i ON i.order_id = o.id\nWHERE o.status = 'paid';",
    }),
    query('easy', 'Order totals', {
      prompt: "For each paid order, show `order_id`, `ordered_on`, the customer's name (`customer`) and the order's `total` (2 decimals). In date order, then by order id.",
      hint: 'The lesson\'s example.',
      solution: LINES,
    }),
    query('easy', 'Signed up, never ordered', {
      prompt: "Show the `name` and `email` of customers who have never placed an order of any kind. Sort by name.",
      hint: '`NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)`.',
      solution: 'SELECT name, email\nFROM customers c\nWHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)\nORDER BY name;',
    }),
    query('medium', 'Month by month', {
      prompt: "For each month with paid orders (`month`, like `2026-05`), show the number of paid `orders` and the `revenue` (2 decimals). In month order.",
      hint: "`strftime('%Y-%m', o.ordered_on) AS month`, grouped by it.",
      solution: MONTHLY,
    }),
    query('medium', 'Best seller in each category', {
      prompt: "For each `category`, show its best-selling product by units in paid orders (`product`, and `units`). Keep ties. Sort by category, then product.",
      hint: 'Units per product in a CTE with `RANK() OVER (PARTITION BY p.category ORDER BY SUM(i.quantity) DESC)`, then keep rank 1.',
      solution: "WITH units AS (\n  SELECT p.category, p.name AS product, SUM(i.quantity) AS units,\n         RANK() OVER (PARTITION BY p.category ORDER BY SUM(i.quantity) DESC) AS place\n  FROM order_items i\n  JOIN orders o ON o.id = i.order_id\n  JOIN products p ON p.id = i.product_id\n  WHERE o.status = 'paid'\n  GROUP BY p.id, p.category, p.name\n)\nSELECT category, product, units\nFROM units\nWHERE place = 1\nORDER BY category, product;",
    }),
    query('medium', 'Average basket', {
      prompt: "For each customer with paid orders, show `name`, their number of paid `orders` and their average order value (`average_order`, 2 decimals). Highest average first, then by name.",
      hint: 'Revenue divided by `COUNT(DISTINCT o.id)`.',
      solution: "SELECT c.name, COUNT(DISTINCT o.id) AS orders,\n       ROUND(SUM(i.quantity * i.unit_price) / COUNT(DISTINCT o.id), 2) AS average_order\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nJOIN order_items i ON i.order_id = o.id\nWHERE o.status = 'paid'\nGROUP BY c.id, c.name\nORDER BY average_order DESC, c.name;",
    }),
    query('hard', 'Up or down', {
      prompt: "For each month with paid orders, show `month`, `revenue` (2 decimals) and the change from the month before as a percentage (`change_pct`, 1 decimal; empty for the first month). In month order.",
      hint: 'Monthly revenue in a CTE, then `100.0 * (revenue - LAG(revenue) OVER (ORDER BY month)) / LAG(revenue) OVER (ORDER BY month)`.',
      solution: "WITH monthly AS (\n  SELECT strftime('%Y-%m', o.ordered_on) AS month, SUM(i.quantity * i.unit_price) AS revenue\n  FROM orders o\n  JOIN order_items i ON i.order_id = o.id\n  WHERE o.status = 'paid'\n  GROUP BY month\n)\nSELECT month, ROUND(revenue, 2) AS revenue,\n       ROUND(100.0 * (revenue - LAG(revenue) OVER (ORDER BY month)) / LAG(revenue) OVER (ORDER BY month), 1) AS change_pct\nFROM monthly\nORDER BY month;",
    }),
    query('hard', 'Coming back', {
      prompt: "Show the customers with two or more paid orders: `name`, `orders`, their first and last paid order dates (`first_order`, `last_order`) and the whole days between them (`days_between`). Most orders first, then by name.",
      hint: 'Group paid orders by customer with `HAVING COUNT(*) >= 2`; `CAST(julianday(MAX(…)) - julianday(MIN(…)) AS INTEGER)`.',
      solution: "SELECT c.name, COUNT(*) AS orders,\n       MIN(o.ordered_on) AS first_order, MAX(o.ordered_on) AS last_order,\n       CAST(julianday(MAX(o.ordered_on)) - julianday(MIN(o.ordered_on)) AS INTEGER) AS days_between\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nWHERE o.status = 'paid'\nGROUP BY c.id, c.name\nHAVING COUNT(*) >= 2\nORDER BY orders DESC, c.name;",
    }),
    query('expert', 'What the discounts cost', {
      prompt: "For each product sold below its list price in paid orders, show the product's name (`product`), the units sold at a discount (`discounted_units`) and the money given away (`given_away`: list price minus price charged, times quantity; 2 decimals). Most given away first, then by product.",
      hint: "Join items to products and orders; `WHERE i.unit_price < p.price AND o.status = 'paid'`.",
      solution: "SELECT p.name AS product, SUM(i.quantity) AS discounted_units,\n       ROUND(SUM((p.price - i.unit_price) * i.quantity), 2) AS given_away\nFROM order_items i\nJOIN products p ON p.id = i.product_id\nJOIN orders o ON o.id = i.order_id\nWHERE o.status = 'paid' AND i.unit_price < p.price\nGROUP BY p.id, p.name\nORDER BY given_away DESC, product;",
    }),
    query('expert', 'Customer summary', {
      prompt: "Create a view `customer_summary` with every customer's `name`, `city`, paid `orders` (0 if none), `revenue` (2 decimals, 0 if none), date of their last paid order (`last_order`, empty if none) and `place` (RANK by revenue, highest first).",
      hint: 'Inside the view: a CTE of paid totals per customer, LEFT JOINed to customers, with COALESCE and `RANK() OVER (ORDER BY …)`.',
      solution: "CREATE VIEW customer_summary AS\nWITH paid AS (\n  SELECT o.customer_id, COUNT(DISTINCT o.id) AS orders,\n         SUM(i.quantity * i.unit_price) AS revenue, MAX(o.ordered_on) AS last_order\n  FROM orders o\n  JOIN order_items i ON i.order_id = o.id\n  WHERE o.status = 'paid'\n  GROUP BY o.customer_id\n)\nSELECT c.name, c.city,\n       COALESCE(p.orders, 0) AS orders,\n       ROUND(COALESCE(p.revenue, 0), 2) AS revenue,\n       p.last_order,\n       RANK() OVER (ORDER BY COALESCE(p.revenue, 0) DESC) AS place\nFROM customers c\nLEFT JOIN paid p ON p.customer_id = c.id;",
      checks: [viewColumns('customer_summary'), viewRows('customer_summary', 'name')],
    }),
  ],
  questions: [
    mc('Why is revenue `quantity * unit_price` and not `quantity * price`?', ['unit_price is what was actually charged, after any discount', 'price can be NULL', 'unit_price is faster', 'They are always the same'], 0,
      'The list price can change, and discounts lower the charge.'),
    mc('Why `COUNT(DISTINCT o.id)` after joining orders to their items?', ['It is needed by GROUP BY', 'To skip NULLs', 'Each order has one row per item, so COUNT(*) would count items', 'DISTINCT sorts the ids'], 2,
      'Joining to a "many" table multiplies the rows.'),
    mc('Which finds customers with no orders at all?', ['NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)', 'GROUP BY customer_id', 'WHERE orders = 0', 'INNER JOIN orders'], 0,
      'NOT EXISTS is safe even if a column has NULLs.'),
    mc("What does `strftime('%Y-%m', ordered_on)` give for '2026-07-30'?", ["'2026-07'", "'2026-07-30'", "'07'", "'July'"], 0,
      'Good for grouping by month.'),
    qShort('Which window function gives the previous month\'s revenue in a month-by-month list?', 'LAG',
      '`LAG(revenue) OVER (ORDER BY month)`.'),
    mc('Why RANK for the best seller in each category?', ['ROW_NUMBER can\'t partition', 'RANK skips NULLs', 'Two products with the same units both stay', 'RANK is faster'], 2,
      'Kitchen has a tie.'),
    mc('Why is change_pct empty for the first month?', ['There is an error', 'The first month is skipped', 'It is 0', 'LAG has no earlier month, so the sum is NULL'], 3,
      'Anything with NULL is NULL.'),
    mc('Where does the "two or more paid orders" filter go?', ['In the ORDER BY', 'HAVING COUNT(*) >= 2', 'In the JOIN', 'WHERE COUNT(*) >= 2'], 1,
      'Conditions on groups go in HAVING.'),
    mc('Why does the view LEFT JOIN customers to the paid totals?', ['To sort them', 'Views must', 'To remove duplicates', 'So customers with no paid orders still appear, with 0'], 3,
      'COALESCE turns their NULLs into 0.'),
    mc('Why build a report from the smallest correct query up?', ['It is faster to run', 'SQLite needs it', 'Views need it', 'Each step can be checked by eye before the next is added'], 3,
      'A wrong join is easy to spot early and hard to find later.'),
  ],
})
