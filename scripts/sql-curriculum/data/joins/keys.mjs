// Joining tables: Keys and relationships.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { JOINS_DB } from '../joins-db.mjs'

export default makeTopic({
  id: 'keys_relationships',
  title: 'Keys and relationships',
  database: JOINS_DB,
  paragraphs: [
    "Real databases split their data over several tables. This section's shop has five: `customers`, `orders`, `order_items`, `products` and `employees`. Open **Tables** to see how they fit together.",
    "Why not one big table? An order would then repeat the customer's name and city on every line, and a customer who moved would need changing in many places. Splitting the data stores each fact **once**, and the tables point to each other instead.",
    "Every table has an `id` column, its **primary key**: a number that identifies one row and is never repeated. Other tables refer to a row by that number. In `orders`, `customer_id` holds the `id` of the customer who placed the order. A column like that is a **foreign key**.",
    '```\nSELECT id, customer_id, employee_id, order_date FROM orders;\n```',
    "So order 1 has `customer_id` 1: it was placed by the customer whose `id` is 1, Ana Silva. In the same way, `employee_id` points to `employees`, `order_items` points to both `orders` and `products`, and `employees.manager_id` points to another employee.",
    "Without joins, following a key takes two steps: look up the id, then use it.",
    "```\nSELECT id FROM customers WHERE name = 'Ana Silva';\nSELECT id, order_date FROM orders WHERE customer_id = 1;\n```",
    "The next lesson does both steps in one query. In this one, practise reading the keys.",
  ],
  sandboxCode: 'SELECT id, customer_id, employee_id, order_date FROM orders;',
  sandboxSnippets: [
    snippet('Orders and their keys', 'SELECT id, customer_id, employee_id, order_date FROM orders;'),
    snippet('Two steps', "SELECT id FROM customers WHERE name = 'Ana Silva';\nSELECT id, order_date FROM orders WHERE customer_id = 1;"),
    snippet('Order lines', 'SELECT order_id, product_id, quantity FROM order_items WHERE order_id = 5;'),
    snippet('Managers', 'SELECT id, name, manager_id FROM employees;'),
  ],
  readMore: { label: 'SQLite: foreign keys', url: 'https://www.sqlite.org/foreignkeys.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', "Ana's id", {
      prompt: "Show the `id` of the customer called `Ana Silva`.",
      hint: 'Filter `customers` with WHERE on the `name` column. Text goes in single quotes.',
      solution: "SELECT id FROM customers WHERE name = 'Ana Silva';",
    }),
    query('easy', 'Orders of customer 1', {
      prompt: 'Show the `id` and `order_date` of the orders placed by the customer whose id is 1.',
      hint: '`WHERE customer_id = 1`.',
      solution: 'SELECT id, order_date FROM orders WHERE customer_id = 1;',
    }),
    query('easy', 'Lines of order 5', {
      prompt: 'Show the `product_id` and `quantity` of each line of order 5 (from `order_items`).',
      hint: 'Each row of `order_items` has an `order_id`. Keep the rows where it is 5.',
      solution: 'SELECT product_id, quantity FROM order_items WHERE order_id = 5;',
    }),
    query('medium', "Tom's team", {
      prompt: 'Show the `name` of the employees whose manager is employee 2.',
      hint: '`WHERE manager_id = 2`.',
      solution: 'SELECT name FROM employees WHERE manager_id = 2;',
    }),
    query('medium', 'Orders per customer id', {
      prompt: 'Show each `customer_id` in `orders` and how many orders it has, called `orders`.',
      hint: '`GROUP BY customer_id`.',
      solution: 'SELECT customer_id, COUNT(*) AS orders FROM orders GROUP BY customer_id;',
    }),
    query('hard', 'Most ordered product id', {
      prompt: 'Show the `product_id` with the most items ordered (sum of `quantity` in `order_items`) and that number, called `items`. One row.',
      hint: '`GROUP BY product_id ORDER BY items DESC LIMIT 1`.',
      solution: 'SELECT product_id, SUM(quantity) AS items FROM order_items\nGROUP BY product_id\nORDER BY items DESC, product_id\nLIMIT 1;',
    }),
    query('hard', 'The top boss', {
      prompt: 'Show the `name` of the employee who has no manager.',
      hint: "Their `manager_id` is missing: `WHERE manager_id IS NULL`.",
      solution: 'SELECT name FROM employees WHERE manager_id IS NULL;',
    }),
    query('expert', 'Customers who ordered', {
      prompt: 'Show each `customer_id` that appears in `orders`, once each, in order.',
      hint: '`DISTINCT` shows each value once, and ORDER BY puts them in order.',
      solution: 'SELECT DISTINCT customer_id FROM orders ORDER BY customer_id;',
    }),
    query('expert', 'Busy orders', {
      prompt: 'Show each `order_id` with three or more lines in `order_items`, and its number of lines, called `lines`.',
      hint: '`GROUP BY order_id HAVING COUNT(*) >= 3`.',
      solution: 'SELECT order_id, COUNT(*) AS lines FROM order_items\nGROUP BY order_id\nHAVING COUNT(*) >= 3;',
    }),
  ],
  questions: [
    mc('What is a primary key?', ['The largest number in a table', 'A column that identifies each row, never repeated', 'The first column of every query', 'A password for the table'], 1,
      'Each row has its own key value, such as its id.'),
    mc('In `orders`, what is `customer_id`?', ['A foreign key pointing to a customer\'s id', 'A count of customers', 'The customer\'s name', 'The order\'s own id'], 0,
      'It holds the id of the customer who placed the order.'),
    mc('Why split data into several tables?', ['Each fact is stored once, not repeated on every row', 'SQL requires it', 'Tables can only have a few columns', 'It is faster to type'], 0,
      'A customer\'s city is stored once in customers, not on every order.'),
    qShort('What do we call a column that refers to the primary key of another table?', 'foreign key',
      'A foreign key points to a row in another (or the same) table.'),
    mc('Order 4 has `customer_id` 3. Who placed it?', ['Order 3', 'Customer 4', 'Employee 3', 'The customer whose id is 3'], 3,
      'customer_id refers to customers.id.'),
    mc('Which table links orders to products?', ['`customers`', '`employees`', '`products`', '`order_items`'], 3,
      'Each order_items row says which product, in which order, and how many.'),
    mc('What does `manager_id` in `employees` point to?', ['Another employee', 'An order', 'A product', 'A customer'], 0,
      'A table can refer to itself: a manager is also an employee.'),
    mc('Without joins, how do you find Ana\'s orders?', ['Look up her id, then use it in a second query', 'Use ORDER BY', 'You can\'t', 'One query on orders by name'], 0,
      'orders only knows customer ids, not names.'),
    mc('Can two customers have the same id?', ['Yes', 'Only if they share a name', 'Only in SQLite', 'No, a primary key is unique'], 3,
      'That is what makes it a reliable way to point at one row.'),
    mc('Why is a customer who moved easy to update in this design?', ['It isn\'t', 'Their city is stored in one place', 'Orders store the city too', 'IDs change'], 1,
      'Only the customers row needs changing; orders point to it by id.'),
  ],
})
