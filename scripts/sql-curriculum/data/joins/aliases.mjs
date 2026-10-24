// Joining tables: Table aliases and clashing names.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { JOINS_DB } from '../joins-db.mjs'

export default makeTopic({
  id: 'table_aliases',
  title: 'Table aliases',
  database: JOINS_DB,
  paragraphs: [
    'Writing `orders.` and `customers.` before every column gets long. A **table alias** gives a table a short name for the rest of the query:',
    '```\nSELECT o.id, o.order_date, c.name\nFROM orders AS o\nJOIN customers AS c ON o.customer_id = c.id;\n```',
    'The `AS` is optional for tables, so `FROM orders o JOIN customers c` means the same. Short aliases like `o`, `c` and `p` are the usual style, and you will see them in most real queries.',
    'Once a table has an alias, use the alias everywhere in that query. `FROM orders o … WHERE orders.status = \'shipped\'` gives the error **no such column: orders.status**, because inside this query the table is now called `o`.',
    'If a column name exists in both tables and you leave out the table, SQLite can\'t guess which one you mean:',
    "```\n-- This gives an error: ambiguous column name: id\nSELECT id, name\nFROM orders o\nJOIN customers c ON o.customer_id = c.id;\n```",
    'The fix is to say which table: `o.id` or `c.id`. Columns that exist in only one table work without a prefix, but adding it keeps a query readable when it grows.',
    'When you show two columns with the same name, give them different names with `AS`, so the result is clear: `SELECT o.id AS order_id, c.id AS customer_id`.',
  ],
  sandboxCode: 'SELECT o.id AS order_id, c.id AS customer_id, c.name\nFROM orders o\nJOIN customers c ON o.customer_id = c.id;',
  sandboxSnippets: [
    snippet('With aliases', 'SELECT o.id, o.order_date, c.name\nFROM orders AS o\nJOIN customers AS c ON o.customer_id = c.id;'),
    snippet('Ambiguous name', "-- This gives an error: ambiguous column name: id\nSELECT id, name\nFROM orders o\nJOIN customers c ON o.customer_id = c.id;"),
    snippet('Two ids, two names', 'SELECT o.id AS order_id, c.id AS customer_id, c.name\nFROM orders o\nJOIN customers c ON o.customer_id = c.id;'),
    snippet('Lines and products', 'SELECT i.order_id, p.name, i.quantity\nFROM order_items i\nJOIN products p ON i.product_id = p.id;'),
  ],
  readMore: { label: 'SQLite: the SELECT statement', url: 'https://www.sqlite.org/lang_select.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Short names', {
      prompt: "Using the aliases `o` and `c`, show each order's `id`, the customer's `name` and the order's `status`.",
      hint: '`FROM orders o JOIN customers c ON o.customer_id = c.id`, then `o.id, c.name, o.status`.',
      solution: 'SELECT o.id, c.name, o.status\nFROM orders o\nJOIN customers c ON o.customer_id = c.id;',
    }),
    query('easy', 'Fix the ambiguous name', {
      prompt: "This query should show each order's id and its customer's name, but gives the error **ambiguous column name: id**. Fix it.",
      starter: 'SELECT id, name\nFROM orders o\nJOIN customers c ON o.customer_id = c.id;',
      hint: 'Say which table each column comes from: `o.id, c.name`.',
      solution: 'SELECT o.id, c.name\nFROM orders o\nJOIN customers c ON o.customer_id = c.id;',
    }),
    query('easy', 'Lines with aliases', {
      prompt: 'Using the aliases `i` and `p`, show each order line\'s `order_id`, the product `name` and the `quantity`.',
      hint: '`FROM order_items i JOIN products p ON i.product_id = p.id`.',
      solution: 'SELECT i.order_id, p.name, i.quantity\nFROM order_items i\nJOIN products p ON i.product_id = p.id;',
    }),
    query('medium', 'Two ids', {
      prompt: "Show each order's id as `order_id`, its customer's id as `customer_id`, and the customer's name as `customer`.",
      hint: '`o.id AS order_id, c.id AS customer_id, c.name AS customer`.',
      solution: 'SELECT o.id AS order_id, c.id AS customer_id, c.name AS customer\nFROM orders o\nJOIN customers c ON o.customer_id = c.id;',
    }),
    query('medium', 'Line and product ids', {
      prompt: "For each order line, show the line's id as `line_id`, the product's id as `product_id` and the product's name as `product`.",
      hint: '`i.id AS line_id, p.id AS product_id, p.name AS product`.',
      solution: 'SELECT i.id AS line_id, p.id AS product_id, p.name AS product\nFROM order_items i\nJOIN products p ON i.product_id = p.id;',
    }),
    query('medium', 'Fix the old name', {
      prompt: "This query should show the shipped orders with their customer's name, but gives the error **no such column: orders.status**. Fix it.",
      starter: "SELECT o.id, c.name\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nWHERE orders.status = 'shipped';",
      hint: 'Inside this query the table is called `o`.',
      solution: "SELECT o.id, c.name\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nWHERE o.status = 'shipped';",
    }),
    query('hard', 'Who handled it, shorter', {
      prompt: "Using the aliases `o` and `e`, show each order's id as `order_id` and the employee's name and role as `employee` and `role`.",
      hint: '`FROM orders o JOIN employees e ON o.employee_id = e.id`.',
      solution: 'SELECT o.id AS order_id, e.name AS employee, e.role\nFROM orders o\nJOIN employees e ON o.employee_id = e.id;',
    }),
    query('hard', 'Fix two problems', {
      prompt: "This query should show each order line's id, its product's id and name. It has an ambiguous name, and both ids would be called `id`. Show them as `line_id`, `product_id` and `name`.",
      starter: 'SELECT id, id, name\nFROM order_items i\nJOIN products p ON i.product_id = p.id;',
      hint: '`i.id AS line_id, p.id AS product_id, p.name`.',
      solution: 'SELECT i.id AS line_id, p.id AS product_id, p.name\nFROM order_items i\nJOIN products p ON i.product_id = p.id;',
    }),
    query('expert', 'Lines with their dates', {
      prompt: 'Join `order_items` (alias `i`) to `orders` (alias `o`) and show each line\'s `order_id`, the `order_date`, the `product_id` and the `quantity`.',
      hint: '`FROM order_items i JOIN orders o ON i.order_id = o.id`.',
      solution: 'SELECT i.order_id, o.order_date, i.product_id, i.quantity\nFROM order_items i\nJOIN orders o ON i.order_id = o.id;',
    }),
    query('expert', 'A tidy order list', {
      prompt: "Show each order as `order_id`, its `status`, the customer's name as `customer` and the customer's `city`, in order id order.",
      hint: '`o.id AS order_id, o.status, c.name AS customer, c.city … ORDER BY o.id`.',
      solution: 'SELECT o.id AS order_id, o.status, c.name AS customer, c.city\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nORDER BY o.id;',
    }),
  ],
  questions: [
    mc('What does `FROM orders o` do?', ['Renames the table for good', 'Selects column o', 'Sorts by o', 'Gives orders the short name o for this query'], 3,
      'An alias only lasts for the query it is written in.'),
    mc('Is `AS` needed for a table alias?', ['Only for long names', 'Yes, always', 'No, `orders o` and `orders AS o` are the same', 'Only in joins'], 2,
      'For tables, AS is optional.'),
    mc('`SELECT id FROM orders o JOIN customers c ON …` gives…', ['The error ambiguous column name: id', 'Both ids', 'The order ids', 'The customer ids'], 0,
      'Both tables have an id column, so SQLite does not know which you mean.'),
    mc('After `FROM orders o`, what does `WHERE orders.status = \'shipped\'` give?', ['The shipped orders', 'No rows', 'Every order', 'An error: no such column: orders.status'], 3,
      'Once aliased, the table is called o in that query.'),
    qShort('What keyword gives an output column a new name?', 'AS',
      'For example `c.id AS customer_id`.'),
    mc('Why rename `o.id` and `c.id` in the output?', ['So the two id columns are easy to tell apart', 'It is required', 'It makes the query faster', 'To sort them'], 0,
      'Two columns both called id are confusing to read.'),
    mc('Does `SELECT city FROM orders o JOIN customers c ON …` need `c.city`?', ['Yes, always', 'No, city exists only in customers, so it is not ambiguous', 'It gives an error', 'Only with GROUP BY'], 1,
      'A prefix is only required for clashing names, though it is a good habit.'),
    mc('Which is a good alias for order_items?', ['`p`', '`i` (or `oi`)', '`order_items_table`', '`orders`'], 1,
      'Short and easy to connect to the table name.'),
    mc('Do aliases change the result rows?', ['No, only how you write the query', 'Yes', 'They remove duplicates', 'They sort the result'], 0,
      'The join is the same; only the names are shorter.'),
    mc('Which query is correct?', ['`SELECT o.id, c.name FROM orders o JOIN customers c ON o.customer_id = c.id;`', '`SELECT id, name FROM orders o JOIN customers c ON o.customer_id = c.id;`', '`SELECT o.id, c.name FROM orders JOIN customers ON o.customer_id = c.id;`', '`SELECT orders.id FROM orders o;`'], 0,
      'The aliases are defined in FROM and JOIN, and used everywhere else.'),
  ],
})
