// Joining tables: Joining three or more tables.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { JOINS_DB } from '../joins-db.mjs'

export default makeTopic({
  id: 'three_tables',
  title: 'Three or more tables',
  database: JOINS_DB,
  paragraphs: [
    'A query can join as many tables as it needs. Each `JOIN` adds one more table to the rows built so far, with its own `ON`:',
    '```\nSELECT o.id, c.name AS customer, e.name AS employee\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nJOIN employees e ON o.employee_id = e.id;\n```',
    'Follow the keys like a path. To get from a customer to the products they bought, go customers → orders → order_items → products, one join per step:',
    '```\nSELECT c.name AS customer, p.name AS product, i.quantity\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nJOIN order_items i ON i.order_id = o.id\nJOIN products p ON i.product_id = p.id;\n```',
    'Everything else works the same: filter with `WHERE`, group, total and sort. How much each customer spent:',
    '```\nSELECT c.name, ROUND(SUM(i.quantity * p.price), 2) AS spent\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nJOIN order_items i ON i.order_id = o.id\nJOIN products p ON i.product_id = p.id\nGROUP BY c.id, c.name\nORDER BY spent DESC;\n```',
    'To keep customers who never ordered, make the first join a `LEFT JOIN`, and the joins after it too. A plain `JOIN` later in the chain would need a match for the `NULL` rows, find none, and drop them again.',
    'Long joins are easier to get right step by step: run the first join, look at the rows, then add the next.',
  ],
  sandboxCode: 'SELECT c.name AS customer, p.name AS product, i.quantity\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nJOIN order_items i ON i.order_id = o.id\nJOIN products p ON i.product_id = p.id;',
  sandboxSnippets: [
    snippet('Both names', 'SELECT o.id, c.name AS customer, e.name AS employee\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nJOIN employees e ON o.employee_id = e.id;'),
    snippet('Who bought what', 'SELECT c.name AS customer, p.name AS product, i.quantity\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nJOIN order_items i ON i.order_id = o.id\nJOIN products p ON i.product_id = p.id;'),
    snippet('Spend per customer', 'SELECT c.name, ROUND(SUM(i.quantity * p.price), 2) AS spent\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nJOIN order_items i ON i.order_id = o.id\nJOIN products p ON i.product_id = p.id\nGROUP BY c.id, c.name\nORDER BY spent DESC;'),
    snippet('LEFT all the way', 'SELECT c.name, ROUND(COALESCE(SUM(i.quantity * p.price), 0), 2) AS spent\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nLEFT JOIN order_items i ON i.order_id = o.id\nLEFT JOIN products p ON i.product_id = p.id\nGROUP BY c.id, c.name;'),
  ],
  readMore: { label: 'SQLite: joins in SELECT', url: 'https://www.sqlite.org/lang_select.html#fromclause', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Both names', {
      prompt: "Show each order's `id`, the customer's name as `customer` and the employee's name as `employee`.",
      hint: 'Two joins: `JOIN customers c ON o.customer_id = c.id JOIN employees e ON o.employee_id = e.id`.',
      solution: 'SELECT o.id, c.name AS customer, e.name AS employee\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nJOIN employees e ON o.employee_id = e.id;',
    }),
    query('easy', 'Lines with dates and names', {
      prompt: 'For every order line, show the `order_id`, the `order_date` and the product `name`.',
      hint: 'Join order_items to orders and to products.',
      solution: 'SELECT i.order_id, o.order_date, p.name\nFROM order_items i\nJOIN orders o ON i.order_id = o.id\nJOIN products p ON i.product_id = p.id;',
    }),
    query('easy', 'Shipped, with both names', {
      prompt: "Show the shipped orders' `order_date`, the customer's name (`customer`) and the employee's name (`employee`), oldest first.",
      hint: "The Both names joins, then `WHERE o.status = 'shipped' ORDER BY o.order_date`.",
      solution: "SELECT o.order_date, c.name AS customer, e.name AS employee\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nJOIN employees e ON o.employee_id = e.id\nWHERE o.status = 'shipped'\nORDER BY o.order_date;",
    }),
    query('medium', 'Who bought what', {
      prompt: 'Show every order line as the customer\'s name (`customer`), the product\'s name (`product`) and the `quantity`.',
      hint: 'customers → orders → order_items → products: three joins.',
      solution: 'SELECT c.name AS customer, p.name AS product, i.quantity\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nJOIN order_items i ON i.order_id = o.id\nJOIN products p ON i.product_id = p.id;',
    }),
    query('medium', 'Spend per customer', {
      prompt: "Show each customer's `name` and how much they spent (`spent`: sum of quantity times price, 2 decimals). Highest first.",
      hint: 'The Who bought what joins, then `GROUP BY c.id, c.name ORDER BY spent DESC`.',
      solution: 'SELECT c.name, ROUND(SUM(i.quantity * p.price), 2) AS spent\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nJOIN order_items i ON i.order_id = o.id\nJOIN products p ON i.product_id = p.id\nGROUP BY c.id, c.name\nORDER BY spent DESC;',
    }),
    query('medium', 'Sales per employee', {
      prompt: "Show the `name` of each employee who handled orders and the value of those orders (`sales`, 2 decimals). Highest first.",
      hint: 'employees → orders → order_items → products, then group by employee.',
      solution: 'SELECT e.name, ROUND(SUM(i.quantity * p.price), 2) AS sales\nFROM employees e\nJOIN orders o ON o.employee_id = e.id\nJOIN order_items i ON i.order_id = o.id\nJOIN products p ON i.product_id = p.id\nGROUP BY e.id, e.name\nORDER BY sales DESC;',
    }),
    query('hard', 'Order summary', {
      prompt: "Show each order as `order_id`, the customer's name (`customer`), its number of lines (`lines`) and its `total` (2 decimals). Biggest total first.",
      hint: 'Join orders to customers, order_items and products, then `GROUP BY o.id, c.name`.',
      solution: 'SELECT o.id AS order_id, c.name AS customer, COUNT(*) AS lines,\n       ROUND(SUM(i.quantity * p.price), 2) AS total\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nJOIN order_items i ON i.order_id = o.id\nJOIN products p ON i.product_id = p.id\nGROUP BY o.id, c.name\nORDER BY total DESC;',
    }),
    query('hard', 'Who sells electronics', {
      prompt: "Show the `name` of each employee who sold `electronics` products and how many items of them (`items`). Most first, then by name.",
      hint: "employees → orders → order_items → products, `WHERE p.category = 'electronics'`, then group by employee.",
      solution: "SELECT e.name, SUM(i.quantity) AS items\nFROM employees e\nJOIN orders o ON o.employee_id = e.id\nJOIN order_items i ON i.order_id = o.id\nJOIN products p ON i.product_id = p.id\nWHERE p.category = 'electronics'\nGROUP BY e.id, e.name\nORDER BY items DESC, e.name;",
    }),
    query('expert', "Ana's shopping list", {
      prompt: "Show each product `Ana Silva` has bought (`name`) and how many in total (`items`). Most first, then by name.",
      hint: "customers → orders → order_items → products, `WHERE c.name = 'Ana Silva'`, `GROUP BY p.id, p.name`.",
      solution: "SELECT p.name, SUM(i.quantity) AS items\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nJOIN order_items i ON i.order_id = o.id\nJOIN products p ON i.product_id = p.id\nWHERE c.name = 'Ana Silva'\nGROUP BY p.id, p.name\nORDER BY items DESC, p.name;",
    }),
    query('expert', 'Everyone\'s spend', {
      prompt: "Show every customer's `name` and how much they spent (`spent`, 2 decimals), with 0 for customers who never ordered. Highest first, then by name.",
      hint: 'LEFT JOIN all the way along the chain, and `ROUND(COALESCE(SUM(i.quantity * p.price), 0), 2)`.',
      solution: 'SELECT c.name, ROUND(COALESCE(SUM(i.quantity * p.price), 0), 2) AS spent\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nLEFT JOIN order_items i ON i.order_id = o.id\nLEFT JOIN products p ON i.product_id = p.id\nGROUP BY c.id, c.name\nORDER BY spent DESC, c.name;',
    }),
  ],
  questions: [
    mc('How many joins does a query over four tables need?', ['3', '4', '1', '2'], 0,
      'Each JOIN adds one table to the first.'),
    mc('How do you get from a customer to the products they bought?', ['It is not possible', 'customers → products', 'customers → orders → order_items → products', 'customers → employees → products'], 2,
      'Follow the foreign keys one step at a time.'),
    mc('Does each JOIN need its own ON?', ['Yes', 'Only LEFT JOINs', 'No, one ON is enough', 'Only the first'], 0,
      'Each ON says how the new table matches the rows so far.'),
    mc('Why must the joins after a LEFT JOIN also be LEFT?', ['It is faster', 'Plain JOIN is not allowed after LEFT', 'To sort the rows', 'A plain JOIN would drop the NULL rows the LEFT JOIN kept'], 3,
      'The NULL rows have nothing to match in the next table.'),
    qShort('Which function turns a NULL total into 0?', 'COALESCE',
      'COALESCE(SUM(…), 0).'),
    mc('Which ON joins order_items to orders?', ['`ON i.id = o.id`', '`ON i.product_id = o.id`', '`ON o.customer_id = i.id`', '`ON i.order_id = o.id`'], 3,
      'order_items.order_id points to orders.id.'),
    mc("To total an employee's sales, which tables do you need?", ['employees, orders, order_items and products', 'orders and products', 'employees and products', 'employees and orders'], 0,
      'Prices are in products, quantities in order_items, and the employee is on the order.'),
    mc('Can WHERE test a column from the third or fourth table?', ['Only with HAVING', 'No', 'Only from the first table', 'Yes, any joined column'], 3,
      'After the joins, all columns are available.'),
    mc("There are 4 orders and 10 order lines, each for a listed product. How many rows does `orders o JOIN order_items i ON i.order_id = o.id JOIN products p ON p.id = i.product_id` give?", ["`4`", "`14`", "`40`", "`10`"], 3,
      "Each order line matches one order and one product, so the result has one row per line: 10. The order details repeat on each of its lines."),
    mc('A customer bought 2 Notebooks in one order and 1 in another. What does `SUM(i.quantity)` per product show for Notebook?', ['2', '1', '6', '3'], 3,
      'SUM adds the quantities over all her lines for that product.'),
  ],
})
