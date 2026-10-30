// Joining tables: INNER JOIN.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { JOINS_DB } from '../joins-db.mjs'

export default makeTopic({
  id: 'inner_join',
  title: 'INNER JOIN',
  database: JOINS_DB,
  paragraphs: [
    '`JOIN` combines rows from two tables in one query. `ON` says which rows belong together, usually a foreign key equal to a primary key:',
    '```\nSELECT orders.id, orders.order_date, customers.name\nFROM orders\nJOIN customers ON orders.customer_id = customers.id;\n```',
    'For each order, SQLite finds the customer whose `id` equals the order\'s `customer_id`, and puts the two rows side by side. The result has one row per matching pair.',
    'Because both tables have columns called `id` and `name`, write `table.column` to say which one you mean: `orders.id`, `customers.name`. It is a good habit even when the name is unique.',
    "`JOIN` on its own means `INNER JOIN`: only rows that **have** a match appear. Customers who never ordered aren't in the result above, because no order points to them. (The `LEFT JOIN` stage keeps them.)",
    'Getting `ON` wrong is a common join mistake. `ON orders.id = customers.id` runs without an error, but pairs order 1 with customer 1, order 2 with customer 2, and so on, which means nothing. Always join a foreign key to the key it points to.',
    'Which table comes first doesn\'t change an inner join\'s rows: `FROM customers JOIN orders ON …` gives the same pairs.',
  ],
  sandboxCode: 'SELECT orders.id, orders.order_date, customers.name\nFROM orders\nJOIN customers ON orders.customer_id = customers.id;',
  sandboxSnippets: [
    snippet('Orders and customers', 'SELECT orders.id, orders.order_date, customers.name\nFROM orders\nJOIN customers ON orders.customer_id = customers.id;'),
    snippet('Lines and products', 'SELECT order_items.order_id, products.name, order_items.quantity\nFROM order_items\nJOIN products ON order_items.product_id = products.id;'),
    snippet('Who handled it', 'SELECT orders.id, employees.name\nFROM orders\nJOIN employees ON orders.employee_id = employees.id;'),
    snippet('A wrong ON', '-- runs, but pairs unrelated rows\nSELECT orders.id, customers.name\nFROM orders\nJOIN customers ON orders.id = customers.id;'),
  ],
  readMore: { label: 'SQLite: joins in SELECT', url: 'https://www.sqlite.org/lang_select.html#fromclause', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Who placed each order?', {
      prompt: "Show each order's `id` and the `name` of the customer who placed it.",
      hint: "Join `customers` to `orders` where the order's `customer_id` matches the customer's `id`. Write `table.column` for columns both tables have.",
      solution: 'SELECT orders.id, customers.name\nFROM orders\nJOIN customers ON orders.customer_id = customers.id;',
    }),
    query('easy', 'What was ordered', {
      prompt: 'For every order line, show the `order_id`, the product `name` and the `quantity`.',
      hint: '`FROM order_items JOIN products ON order_items.product_id = products.id`.',
      solution: 'SELECT order_items.order_id, products.name, order_items.quantity\nFROM order_items\nJOIN products ON order_items.product_id = products.id;',
    }),
    query('medium', 'Who handled it', {
      prompt: "Show each order's `id` and the name of the employee who handled it, in a column called `employee`.",
      hint: '`JOIN employees ON orders.employee_id = employees.id`, and `employees.name AS employee`.',
      solution: 'SELECT orders.id, employees.name AS employee\nFROM orders\nJOIN employees ON orders.employee_id = employees.id;',
    }),
    query('medium', 'Prices on the lines', {
      prompt: 'For every order line, show the product `name`, its `price` and the `quantity`.',
      hint: 'Join order_items to products and pick `products.name, products.price, order_items.quantity`.',
      solution: 'SELECT products.name, products.price, order_items.quantity\nFROM order_items\nJOIN products ON order_items.product_id = products.id;',
    }),
    query('medium', 'Line totals', {
      prompt: 'For every order line, show the `order_id`, the product `name` and the line total (quantity times price, rounded to 2 decimals), called `line_total`.',
      hint: '`ROUND(order_items.quantity * products.price, 2) AS line_total`.',
      solution: 'SELECT order_items.order_id, products.name,\n       ROUND(order_items.quantity * products.price, 2) AS line_total\nFROM order_items\nJOIN products ON order_items.product_id = products.id;',
    }),
    query('hard', 'Fix the ON', {
      prompt: "This query should show each order with its customer's name, but it pairs the wrong rows (order 4 shows Dev Patel, who didn't place it). Fix it.",
      starter: 'SELECT orders.id, customers.name\nFROM orders\nJOIN customers ON orders.id = customers.id;',
      hint: "Join the order's customer_id to the customer's id.",
      solution: 'SELECT orders.id, customers.name\nFROM orders\nJOIN customers ON orders.customer_id = customers.id;',
    }),
    query('hard', 'Where orders go', {
      prompt: "Show each order's `id` and the customer's `city`.",
      hint: 'Join orders to customers and pick `customers.city`.',
      solution: 'SELECT orders.id, customers.city\nFROM orders\nJOIN customers ON orders.customer_id = customers.id;',
    }),
    query('expert', 'Categories ordered', {
      prompt: 'For every order line, show the `order_id` and the `category` of its product.',
      hint: 'Join order_items to products; the category is `products.category`.',
      solution: 'SELECT order_items.order_id, products.category\nFROM order_items\nJOIN products ON order_items.product_id = products.id;',
    }),
    query('expert', 'From the employee side', {
      prompt: 'Start from `employees` this time: show each employee\'s `name` with the `order_date` and `status` of every order they handled.',
      hint: '`FROM employees JOIN orders ON orders.employee_id = employees.id`.',
      solution: 'SELECT employees.name, orders.order_date, orders.status\nFROM employees\nJOIN orders ON orders.employee_id = employees.id;',
    }),
  ],
  questions: [
    mc('What does `ON` do in a join?', ['Sorts the result', 'Filters out NULLs', 'Names the result', 'Says which rows of the two tables belong together'], 3,
      'ON is the condition that pairs rows, usually a foreign key = primary key.'),
    mc('Which ON pairs orders with their customers?', ['`ON orders.name = customers.name`', '`ON orders.customer_id = customers.id`', '`ON orders.id = customers.id`', '`ON customers.customer_id = orders.id`'], 1,
      "The order's customer_id holds the customer's id."),
    mc('Why write `customers.name` instead of `name`?', ['It is faster', 'Names must have a dot', 'Both tables may have a column called name', 'It renames the column'], 2,
      'table.column says exactly which column you mean.'),
    mc('Does an INNER JOIN show customers with no orders?', ['Yes, with NULLs', 'Only the first one', 'Yes, with 0', 'No, only rows that have a match'], 3,
      'Inner joins keep matching pairs only.'),
    qShort('`JOIN` on its own is short for which kind of join? (one word)', 'INNER',
      '`JOIN` means `INNER JOIN`.'),
    mc('`ON orders.id = customers.id` gives…', ['Rows that pair unrelated orders and customers', 'An error', 'No rows', 'The right pairs'], 0,
      'It runs, but matching an order number to a customer number means nothing.'),
    mc('Does `FROM customers JOIN orders` give different rows from `FROM orders JOIN customers` (same ON)?', ['Yes', 'No, the same pairs', 'Only with WHERE', 'It gives an error'], 1,
      'For inner joins, the order of the tables only changes the default column order.'),
    mc('An order points to a customer. How many rows does the join give per order?', ['One, its customer', 'Two', 'None', 'One per customer in the table'], 0,
      'Each order has exactly one matching customer.'),
    mc('Ana has 3 orders. How many rows does she get in orders JOIN customers?', ['3', '1', '0', '6'], 0,
      'One row per matching pair: one per order.'),
    mc('Can you calculate with columns from both tables?', ['No', 'Only in WHERE', 'Only with GROUP BY', 'Yes, like `quantity * price`'], 3,
      'After the join, every column of both rows is available.'),
  ],
})
