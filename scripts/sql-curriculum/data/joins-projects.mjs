// Joining tables: the section's projects (easy, medium, hard).
import { makeProject, mc, qShort, query, snippet } from './_builders.mjs'
import { JOINS_DB } from './joins-db.mjs'

const orderLookup = makeProject('easy', {
  id: 'proj_order_lookup',
  title: 'Order lookup',
  database: JOINS_DB,
  paragraphs: [
    "You're on the shop's help desk. Customers phone in about their orders, and you answer by looking them up across `orders`, `customers`, `employees`, `order_items` and `products`.",
    "Today is 2026-10-24. A line's value is `quantity * price`, rounded to 2 decimals at the end.",
  ],
  sandboxCode: 'SELECT o.id, o.order_date, o.status, c.name AS customer\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nWHERE o.id = 7;',
  sandboxSnippets: [
    snippet('One order', 'SELECT o.id, o.order_date, o.status, c.name AS customer\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nWHERE o.id = 7;'),
    snippet('Its lines', 'SELECT p.name, i.quantity, p.price\nFROM order_items i\nJOIN products p ON i.product_id = p.id\nWHERE i.order_id = 7;'),
    snippet('Days waiting', "SELECT id, CAST(julianday('2026-10-24') - julianday(order_date) AS INTEGER) AS days_waiting\nFROM orders WHERE status = 'pending';"),
  ],
  readMore: { label: 'SQLite: joins in SELECT', url: 'https://www.sqlite.org/lang_select.html#fromclause', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Order 7', {
      prompt: "A caller asks about order 7. Show its `id`, `order_date`, `status` and the customer's name as `customer`.",
      hint: 'Join orders to customers, `WHERE o.id = 7`.',
      solution: 'SELECT o.id, o.order_date, o.status, c.name AS customer\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nWHERE o.id = 7;',
    }),
    query('easy', "What's in it", {
      prompt: 'Show the lines of order 7: product `name`, `quantity`, `price` and `line_total` (2 decimals).',
      hint: 'Join order_items to products, `WHERE i.order_id = 7`, and `ROUND(i.quantity * p.price, 2) AS line_total`.',
      solution: 'SELECT p.name, i.quantity, p.price, ROUND(i.quantity * p.price, 2) AS line_total\nFROM order_items i\nJOIN products p ON i.product_id = p.id\nWHERE i.order_id = 7;',
    }),
    query('medium', 'The bill', {
      prompt: 'Show the total of order 7 (2 decimals), called `total`.',
      hint: '`SELECT ROUND(SUM(i.quantity * p.price), 2) AS total … WHERE i.order_id = 7`.',
      solution: 'SELECT ROUND(SUM(i.quantity * p.price), 2) AS total\nFROM order_items i\nJOIN products p ON i.product_id = p.id\nWHERE i.order_id = 7;',
    }),
    query('medium', 'Still waiting', {
      prompt: "Show every pending order: its `id`, `order_date`, the customer's name (`customer`) and the employee handling it (`employee`). Oldest first.",
      hint: "Join orders to customers and employees, `WHERE o.status = 'pending' ORDER BY o.order_date`.",
      solution: "SELECT o.id, o.order_date, c.name AS customer, e.name AS employee\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nJOIN employees e ON o.employee_id = e.id\nWHERE o.status = 'pending'\nORDER BY o.order_date;",
    }),
    query('hard', 'Customer history', {
      prompt: "Customer 2 calls about all their orders. Show each order's `id`, `order_date`, `status` and `total` (2 decimals), oldest first.",
      hint: 'Join orders, order_items and products, `WHERE o.customer_id = 2`, `GROUP BY o.id, o.order_date, o.status`.',
      solution: 'SELECT o.id, o.order_date, o.status, ROUND(SUM(i.quantity * p.price), 2) AS total\nFROM orders o\nJOIN order_items i ON i.order_id = o.id\nJOIN products p ON i.product_id = p.id\nWHERE o.customer_id = 2\nGROUP BY o.id, o.order_date, o.status\nORDER BY o.order_date;',
    }),
    query('hard', 'Call them back', {
      prompt: "Make a call-back list of pending orders placed before 2026-09-01: the customer's `name` and `city`, the order `id`, and the whole days it has waited until today (`days_waiting`). Longest wait first.",
      hint: "`CAST(julianday('2026-10-24') - julianday(o.order_date) AS INTEGER) AS days_waiting`, `WHERE o.status = 'pending' AND o.order_date < '2026-09-01'`.",
      solution: "SELECT c.name, c.city, o.id,\n       CAST(julianday('2026-10-24') - julianday(o.order_date) AS INTEGER) AS days_waiting\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nWHERE o.status = 'pending' AND o.order_date < '2026-09-01'\nORDER BY days_waiting DESC;",
    }),
  ],
  questions: [
    mc('Where is the price of a product stored?', ['In products', 'In order_items', 'In orders', 'In customers'], 0,
      'Each fact is stored once, in the table it belongs to.'),
    mc("Which tables do you need for an order's total?", ['order_items and products', 'customers and products', 'employees and orders', 'orders and customers'], 0,
      'Quantities are in order_items, prices in products.'),
    mc('Which query finds who is handling a pending order?', ['customers JOIN products', 'orders JOIN products', 'orders JOIN employees', 'employees JOIN customers'], 2,
      'orders.employee_id points to the employee.'),
    qShort('Which function turns a date into a number of days?', 'julianday',
      'Subtracting two julianday values gives the days between them.'),
    mc('Why group by `o.order_date` and `o.status` too in Customer history?', ['To show them; each order has one date and status, so the groups stay the same', 'To sort', 'It changes the totals', 'It removes cancelled orders'], 0,
      'Columns you show next to a total must be grouped or aggregated.'),
    mc('Which keeps only old pending orders?', ["`HAVING o.status = 'pending'`", "`ORDER BY o.order_date`", "`LIMIT 2`", "`WHERE o.status = 'pending' AND o.order_date < '2026-09-01'`"], 3,
      'Both conditions are about single rows, so they go in WHERE.'),
  ],
})

const customerInsights = makeProject('medium', {
  id: 'proj_customer_insights',
  title: 'Customer insights',
  database: JOINS_DB,
  paragraphs: [
    'The marketing team wants to understand the customers: who orders, who spends, who has gone quiet, and what each category attracts.',
    'Remember: customers who never ordered only appear with a `LEFT JOIN`, and their totals need `COALESCE`.',
  ],
  sandboxCode: 'SELECT c.name, COUNT(o.id) AS orders\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nGROUP BY c.id, c.name;',
  sandboxSnippets: [
    snippet('Orders, with zeros', 'SELECT c.name, COUNT(o.id) AS orders\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nGROUP BY c.id, c.name;'),
    snippet('Spend', 'SELECT c.name, ROUND(SUM(i.quantity * p.price), 2) AS spent\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nJOIN order_items i ON i.order_id = o.id\nJOIN products p ON i.product_id = p.id\nGROUP BY c.id, c.name;'),
    snippet('Never ordered', 'SELECT c.name, c.joined\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nWHERE o.id IS NULL;'),
  ],
  readMore: { label: 'SQLite: aggregate functions', url: 'https://www.sqlite.org/lang_aggfunc.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Order counts', {
      prompt: "Show every customer's `name` and number of orders (`orders`), including 0. Most first, then by name.",
      hint: '`LEFT JOIN orders`, `COUNT(o.id)`, `ORDER BY orders DESC, c.name`.',
      solution: 'SELECT c.name, COUNT(o.id) AS orders\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nGROUP BY c.id, c.name\nORDER BY orders DESC, c.name;',
    }),
    query('medium', 'Gone quiet', {
      prompt: 'The team wants to email customers who never ordered. Show their `name`, `city` and `joined` date, earliest joined first.',
      hint: '`LEFT JOIN orders … WHERE o.id IS NULL ORDER BY c.joined`.',
      solution: 'SELECT c.name, c.city, c.joined\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nWHERE o.id IS NULL\nORDER BY c.joined;',
    }),
    query('medium', 'Average order', {
      prompt: "For each customer who ordered, show their `name`, number of orders (`orders`) and average order value (`average_order`: total spent divided by orders, 2 decimals). Highest average first.",
      hint: 'Join all four tables; `COUNT(DISTINCT o.id)` counts orders, not lines. `ROUND(SUM(i.quantity * p.price) / COUNT(DISTINCT o.id), 2)`.',
      solution: 'SELECT c.name, COUNT(DISTINCT o.id) AS orders,\n       ROUND(SUM(i.quantity * p.price) / COUNT(DISTINCT o.id), 2) AS average_order\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nJOIN order_items i ON i.order_id = o.id\nJOIN products p ON i.product_id = p.id\nGROUP BY c.id, c.name\nORDER BY average_order DESC;',
    }),
    query('medium', 'Category reach', {
      prompt: 'For each category that was ordered, show the `category`, how many different customers bought from it (`customers`) and the items sold (`items`). Most customers first, then by category.',
      hint: '`COUNT(DISTINCT o.customer_id)`, `SUM(i.quantity)`, `GROUP BY p.category`.',
      solution: 'SELECT p.category, COUNT(DISTINCT o.customer_id) AS customers, SUM(i.quantity) AS items\nFROM products p\nJOIN order_items i ON i.product_id = p.id\nJOIN orders o ON i.order_id = o.id\nGROUP BY p.category\nORDER BY customers DESC, p.category;',
    }),
    query('hard', 'Shipped and not', {
      prompt: "Show every customer's `name` with their number of shipped orders (`shipped`) and other orders (`not_shipped`), including customers with none (0 and 0). In name order.",
      hint: "LEFT JOIN orders, then `SUM(CASE WHEN o.status = 'shipped' THEN 1 ELSE 0 END)` and `SUM(CASE WHEN o.status <> 'shipped' THEN 1 ELSE 0 END)`.",
      solution: "SELECT c.name,\n  SUM(CASE WHEN o.status = 'shipped' THEN 1 ELSE 0 END) AS shipped,\n  SUM(CASE WHEN o.status <> 'shipped' THEN 1 ELSE 0 END) AS not_shipped\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nGROUP BY c.id, c.name\nORDER BY c.name;",
    }),
    query('hard', 'Best customers', {
      prompt: "Show the customers who spent more than 100 on shipped orders: `name` and `spent` (2 decimals). Highest first.",
      hint: "Join all four tables, `WHERE o.status = 'shipped'`, then `HAVING SUM(i.quantity * p.price) > 100`.",
      solution: "SELECT c.name, ROUND(SUM(i.quantity * p.price), 2) AS spent\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nJOIN order_items i ON i.order_id = o.id\nJOIN products p ON i.product_id = p.id\nWHERE o.status = 'shipped'\nGROUP BY c.id, c.name\nHAVING SUM(i.quantity * p.price) > 100\nORDER BY spent DESC;",
    }),
  ],
  questions: [
    mc('Which keeps customers with no orders in a count?', ['LEFT JOIN with COUNT(*)', 'LEFT JOIN with COUNT(o.id)', 'JOIN with COUNT(*)', 'JOIN with COUNT(o.id)'], 1,
      'LEFT JOIN keeps them; COUNT(o.id) gives them 0.'),
    mc("Ana has 2 orders, one with 3 lines and one with 1 line. After joining order_items, what are `COUNT(*)` and `COUNT(DISTINCT o.id)` for her?", ["4 and 2", "2 and 2", "4 and 4", "6 and 2"], 0,
      "The join gives one row per line, so `COUNT(*)` counts 4 lines. `COUNT(DISTINCT o.id)` counts each order once: 2."),
    mc('In Shipped and not, what does Finn (no orders) get?', ['He is missing', '0 and 0', '1 and 0', 'NULL and NULL'], 1,
      'His status is NULL, so both CASEs give 0.'),
    qShort('Which clause keeps only customers who spent more than 100?', 'HAVING',
      'It tests a group total.'),
    mc('Where does the shipped test go in Best customers?', ['WHERE, before grouping', 'HAVING', 'ON of customers', 'ORDER BY'], 0,
      'It is about single orders.'),
    mc('Why count customers with DISTINCT in Category reach?', ['A customer may buy from a category many times', 'Categories repeat', 'It is required with GROUP BY', 'To remove NULLs'], 0,
      'Each customer should be counted once per category.'),
  ],
})

const salesTeamReview = makeProject('hard', {
  id: 'proj_sales_team_review',
  title: 'Sales team review',
  database: JOINS_DB,
  paragraphs: [
    "It's review time for the staff. Maria, the manager, wants to see who works for whom, how much each person and each team sold, and how much is still waiting to ship.",
    'These queries join `employees` to itself and to the order tables. Build them step by step in the sandbox.',
  ],
  sandboxCode: "SELECT e.name AS employee, COALESCE(m.name, '(none)') AS manager\nFROM employees e\nLEFT JOIN employees m ON e.manager_id = m.id;",
  sandboxSnippets: [
    snippet('Staff and managers', "SELECT e.name AS employee, COALESCE(m.name, '(none)') AS manager\nFROM employees e\nLEFT JOIN employees m ON e.manager_id = m.id;"),
    snippet('Sales per employee', 'SELECT e.name, ROUND(SUM(i.quantity * p.price), 2) AS sales\nFROM employees e\nJOIN orders o ON o.employee_id = e.id\nJOIN order_items i ON i.order_id = o.id\nJOIN products p ON i.product_id = p.id\nGROUP BY e.id, e.name;'),
  ],
  readMore: { label: 'SQLite: the SELECT statement', url: 'https://www.sqlite.org/lang_select.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Staff list', {
      prompt: "Show every employee's `name`, `role` and their manager's name as `manager` (`(none)` for the top boss), in employee id order.",
      hint: "`LEFT JOIN employees m ON e.manager_id = m.id`, `COALESCE(m.name, '(none)')`, `ORDER BY e.id`.",
      solution: "SELECT e.name, e.role, COALESCE(m.name, '(none)') AS manager\nFROM employees e\nLEFT JOIN employees m ON e.manager_id = m.id\nORDER BY e.id;",
    }),
    query('medium', 'Everyone\'s numbers', {
      prompt: "Show every employee's `name`, the orders they handled (`orders`) and the value of those orders (`sales`, 2 decimals), with 0 for both if they handled none. Highest sales first, then by name.",
      hint: 'LEFT JOIN all the way: orders, order_items, products. `COUNT(DISTINCT o.id)` and `ROUND(COALESCE(SUM(i.quantity * p.price), 0), 2)`.',
      solution: 'SELECT e.name, COUNT(DISTINCT o.id) AS orders,\n       ROUND(COALESCE(SUM(i.quantity * p.price), 0), 2) AS sales\nFROM employees e\nLEFT JOIN orders o ON o.employee_id = e.id\nLEFT JOIN order_items i ON i.order_id = o.id\nLEFT JOIN products p ON i.product_id = p.id\nGROUP BY e.id, e.name\nORDER BY sales DESC, e.name;',
    }),
    query('medium', 'Shipped by sales staff', {
      prompt: "For employees with the role `Sales`, show each `name` and the value of their shipped orders (`shipped_sales`, 2 decimals). Only those with shipped orders, highest first.",
      hint: "`WHERE e.role = 'Sales' AND o.status = 'shipped'`, then group by employee.",
      solution: "SELECT e.name, ROUND(SUM(i.quantity * p.price), 2) AS shipped_sales\nFROM employees e\nJOIN orders o ON o.employee_id = e.id\nJOIN order_items i ON i.order_id = o.id\nJOIN products p ON i.product_id = p.id\nWHERE e.role = 'Sales' AND o.status = 'shipped'\nGROUP BY e.id, e.name\nORDER BY shipped_sales DESC;",
    }),
    query('hard', 'Team totals', {
      prompt: "For each manager, show their name as `manager` and the value of the orders handled by the people who report directly to them (`team_sales`, 2 decimals). Highest first.",
      hint: 'employees e JOIN employees m (the manager), then orders on `o.employee_id = e.id`, order_items and products. Group by the manager.',
      solution: 'SELECT m.name AS manager, ROUND(SUM(i.quantity * p.price), 2) AS team_sales\nFROM employees e\nJOIN employees m ON e.manager_id = m.id\nJOIN orders o ON o.employee_id = e.id\nJOIN order_items i ON i.order_id = o.id\nJOIN products p ON i.product_id = p.id\nGROUP BY m.id, m.name\nORDER BY team_sales DESC;',
    }),
    query('hard', 'Shipped or waiting', {
      prompt: "For each employee who handled orders, show `name`, the value of their shipped orders (`shipped`) and of their other orders (`not_shipped`), both 2 decimals. In name order.",
      hint: "`ROUND(SUM(CASE WHEN o.status = 'shipped' THEN i.quantity * p.price ELSE 0 END), 2)` and the same with `<>`.",
      solution: "SELECT e.name,\n  ROUND(SUM(CASE WHEN o.status = 'shipped' THEN i.quantity * p.price ELSE 0 END), 2) AS shipped,\n  ROUND(SUM(CASE WHEN o.status <> 'shipped' THEN i.quantity * p.price ELSE 0 END), 2) AS not_shipped\nFROM employees e\nJOIN orders o ON o.employee_id = e.id\nJOIN order_items i ON i.order_id = o.id\nJOIN products p ON i.product_id = p.id\nGROUP BY e.id, e.name\nORDER BY e.name;",
    }),
    query('hard', 'Shared customers', {
      prompt: "Show each customer who was served by two or more different employees: `name` and the number of employees (`employees`). Most first, then by name.",
      hint: '`COUNT(DISTINCT o.employee_id)`, `HAVING COUNT(DISTINCT o.employee_id) >= 2`.',
      solution: 'SELECT c.name, COUNT(DISTINCT o.employee_id) AS employees\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nGROUP BY c.id, c.name\nHAVING COUNT(DISTINCT o.employee_id) >= 2\nORDER BY employees DESC, c.name;',
    }),
  ],
  questions: [
    mc('Which shows the top boss in a staff list?', ['`LEFT JOIN employees m ON e.manager_id = m.id`', '`JOIN employees m ON e.manager_id = m.id`', '`JOIN employees m ON e.id = m.id`', '`WHERE manager_id = 1`'], 0,
      'Her manager_id is NULL, so only a LEFT JOIN keeps her.'),
    mc('In Team totals, which alias is grouped?', ['m, the manager', 'o, the order', 'p, the product', 'e, the employee'], 0,
      'One group per manager, adding up their team\'s orders.'),
    mc("Omar has no orders. What happens to him in `employees e LEFT JOIN orders o ON o.employee_id = e.id JOIN order_items i ON i.order_id = o.id`?", ["He shows with NULLs", "He shows with 0", "An error", "The second join drops him"], 3,
      "The LEFT JOIN keeps Omar with NULL in `o.id`, but the plain JOIN then finds no line where `i.order_id = NULL`, so his row goes. The second join must be LEFT too."),
    mc('Which counts orders, not lines, after joining order_items?', ['`COUNT(*)`', '`COUNT(i.id)`', '`SUM(o.id)`', '`COUNT(DISTINCT o.id)`'], 3,
      'Each order appears once per line, so count distinct ids.'),
    qShort("The statuses are shipped, waiting, shipped and NULL. What does `SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END)` give?", "2",
      "The two shipped rows give 1 each. waiting gives 0, and so does NULL: `NULL = 'shipped'` is not true, so it falls to `ELSE 0`."),
    mc('Why does Omar Haddad not appear in Shipped or waiting?', ['His orders were cancelled', 'His name is NULL', 'He handled no orders, and the joins are inner', 'He is not in Sales'], 2,
      'Inner joins keep only employees with orders.'),
  ],
})

export const joinsProjects = [orderLookup, customerInsights, salesTeamReview]
