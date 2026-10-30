// Joining tables: Filtering and sorting joined rows.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { JOINS_DB } from '../joins-db.mjs'

export default makeTopic({
  id: 'join_filter_sort',
  title: 'Filtering and sorting joins',
  database: JOINS_DB,
  paragraphs: [
    'A join gives you rows with the columns of both tables, and everything you know still works on them. `WHERE` can test a column from either table, and `ORDER BY` can sort by any of them.',
    "Ana's orders, found by her name instead of her id:",
    "```\nSELECT o.id, o.order_date\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nWHERE c.name = 'Ana Silva';\n```",
    'This is the two-step lookup from the first stage, done in one query. The order is always the same: `FROM` and `JOIN`, then `WHERE`, then `ORDER BY` and `LIMIT`.',
    "Shipped orders, sorted by customer and then by date:",
    "```\nSELECT c.name, o.order_date\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nWHERE o.status = 'shipped'\nORDER BY c.name, o.order_date;\n```",
    'You can also calculate with columns from both tables, and sort by the result. Here are the order lines worth more than 20, biggest first:',
    '```\nSELECT i.order_id, p.name, ROUND(i.quantity * p.price, 2) AS line_total\nFROM order_items i\nJOIN products p ON i.product_id = p.id\nWHERE i.quantity * p.price > 20\nORDER BY line_total DESC, i.order_id;\n```',
  ],
  sandboxCode: "SELECT c.name, o.order_date\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nWHERE o.status = 'shipped'\nORDER BY c.name, o.order_date;",
  sandboxSnippets: [
    snippet("Ana's orders", "SELECT o.id, o.order_date\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nWHERE c.name = 'Ana Silva';"),
    snippet('Shipped, sorted', "SELECT c.name, o.order_date\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nWHERE o.status = 'shipped'\nORDER BY c.name, o.order_date;"),
    snippet('Big lines', 'SELECT i.order_id, p.name, ROUND(i.quantity * p.price, 2) AS line_total\nFROM order_items i\nJOIN products p ON i.product_id = p.id\nWHERE i.quantity * p.price > 20\nORDER BY line_total DESC, i.order_id;'),
    snippet('Electronics lines', "SELECT i.order_id, p.name, i.quantity\nFROM order_items i\nJOIN products p ON i.product_id = p.id\nWHERE p.category = 'electronics';"),
  ],
  readMore: { label: 'SQLite: the SELECT statement', url: 'https://www.sqlite.org/lang_select.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', "Ana's orders", {
      prompt: "Show the `id` and `order_date` of the orders placed by `Ana Silva`, found by her name.",
      hint: "Join orders to customers, then `WHERE c.name = 'Ana Silva'`.",
      solution: "SELECT o.id, o.order_date\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nWHERE c.name = 'Ana Silva';",
    }),
    query('easy', 'Shipped, by date', {
      prompt: "Show the customer `name` and `order_date` of every shipped order, oldest first.",
      hint: "`WHERE o.status = 'shipped' ORDER BY o.order_date`.",
      solution: "SELECT c.name, o.order_date\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nWHERE o.status = 'shipped'\nORDER BY o.order_date;",
    }),
    query('easy', 'Electronics lines', {
      prompt: "Show the `order_id`, product `name` and `quantity` of every order line for an `electronics` product.",
      hint: "Join order_items to products, then `WHERE p.category = 'electronics'`.",
      solution: "SELECT i.order_id, p.name, i.quantity\nFROM order_items i\nJOIN products p ON i.product_id = p.id\nWHERE p.category = 'electronics';",
    }),
    query('medium', 'By customer, then date', {
      prompt: 'Show the customer `name` and `order_date` of every order, sorted by name and then by date.',
      hint: '`ORDER BY c.name, o.order_date`.',
      solution: 'SELECT c.name, o.order_date\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nORDER BY c.name, o.order_date;',
    }),
    query('medium', 'Handled by sales staff', {
      prompt: "Show the `id` and `order_date` of the orders handled by an employee whose role is `Sales`, in date order.",
      hint: "Join orders to employees, `WHERE e.role = 'Sales' ORDER BY o.order_date`.",
      solution: "SELECT o.id, o.order_date\nFROM orders o\nJOIN employees e ON o.employee_id = e.id\nWHERE e.role = 'Sales'\nORDER BY o.order_date;",
    }),
    query('medium', 'Big lines', {
      prompt: 'Show the order lines worth more than 20 (quantity times price): `order_id`, product `name` and `line_total` (2 decimals). Biggest first, then by order id.',
      hint: '`WHERE i.quantity * p.price > 20 ORDER BY line_total DESC, i.order_id`.',
      solution: 'SELECT i.order_id, p.name, ROUND(i.quantity * p.price, 2) AS line_total\nFROM order_items i\nJOIN products p ON i.product_id = p.id\nWHERE i.quantity * p.price > 20\nORDER BY line_total DESC, i.order_id;',
    }),
    query('hard', 'Waiting orders', {
      prompt: "Show the pending orders with the customer's `name` and `city` and the `order_date`, oldest first.",
      hint: "`WHERE o.status = 'pending' ORDER BY o.order_date`.",
      solution: "SELECT c.name, c.city, o.order_date\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nWHERE o.status = 'pending'\nORDER BY o.order_date;",
    }),
    query('hard', 'Latest three shipped', {
      prompt: "Show the three most recent shipped orders: the order `id`, the customer `name` and the `order_date`, newest first.",
      hint: "`WHERE o.status = 'shipped' ORDER BY o.order_date DESC LIMIT 3`.",
      solution: "SELECT o.id, c.name, o.order_date\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nWHERE o.status = 'shipped'\nORDER BY o.order_date DESC\nLIMIT 3;",
    }),
    query('expert', 'Loyal customers', {
      prompt: "Show the orders placed by customers who joined before 2024: the customer `name`, when they `joined`, and the `order_date`. Sort by order date.",
      hint: "`WHERE c.joined < '2024-01-01' ORDER BY o.order_date`.",
      solution: "SELECT c.name, c.joined, o.order_date\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nWHERE c.joined < '2024-01-01'\nORDER BY o.order_date;",
    }),
    query('expert', 'Kitchen and bags', {
      prompt: "Show the order lines for `kitchen` or `bags` products: the product `name`, `category`, `order_id` and `quantity`. Sort by product name, then order id.",
      hint: "`WHERE p.category IN ('kitchen', 'bags') ORDER BY p.name, i.order_id`.",
      solution: "SELECT p.name, p.category, i.order_id, i.quantity\nFROM order_items i\nJOIN products p ON i.product_id = p.id\nWHERE p.category IN ('kitchen', 'bags')\nORDER BY p.name, i.order_id;",
    }),
  ],
  questions: [
    mc('Can `WHERE` test a column from the joined table?', ['No, only from the FROM table', 'Only with HAVING', 'Only numbers', 'Yes, from either table'], 3,
      'After the join, every column of both rows is available.'),
    mc('In which order are these written?', ['ORDER BY, WHERE, JOIN', 'JOIN, FROM, WHERE', 'WHERE, JOIN, ORDER BY', 'FROM … JOIN … ON, WHERE, ORDER BY'], 3,
      'The join is part of FROM, so it comes before WHERE.'),
    mc("How do you find Ana's orders by name in one query?", ["Join to customers and use WHERE c.name = 'Ana Silva'", 'It needs two queries', 'WHERE customer_id = \'Ana Silva\'', 'ORDER BY name'], 0,
      'The join brings the name next to each order.'),
    mc('`ORDER BY c.name, o.order_date` sorts…', ['By name, and by date within each name', 'By date, then name', 'Only by name', 'By the order id'], 0,
      'The second column breaks ties in the first.'),
    qShort('Which keyword keeps only the first few rows of the sorted result?', 'LIMIT',
      'It comes last, as usual.'),
    mc('Can you sort by a calculation using both tables, like `quantity * price`?', ['Only in WHERE', 'Yes', 'No', 'Only with GROUP BY'], 1,
      'Any expression over the joined columns works.'),
    mc('Why add `i.order_id` after `line_total DESC`?', ['To join the tables', 'It is required', 'So lines with the same total come in a fixed order', 'To remove duplicates'], 2,
      'Equal totals would otherwise come in any order.'),
    mc("`WHERE c.joined < '2024-01-01'` keeps…", ['Orders placed before 2024', 'Customers with no orders', 'Orders from customers who joined before 2024', 'Nothing'], 2,
      'joined belongs to the customer, not the order.'),
    mc('Which finds lines for electronics products?', ["`WHERE p.category = 'electronics'` after joining products", '`WHERE i.category = \'electronics\'`', "`WHERE o.status = 'electronics'`", '`ORDER BY category`'], 0,
      'The category is stored in products.'),
    mc('Does WHERE run before or after the join?', ['It depends on ORDER BY', 'After: it filters the joined rows', 'Before: it filters the tables first', 'Instead of the join'], 1,
      'FROM and JOIN build the rows, then WHERE keeps some of them.'),
  ],
})
