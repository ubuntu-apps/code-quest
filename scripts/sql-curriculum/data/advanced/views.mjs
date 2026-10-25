// Advanced queries: Views.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { ADVANCED_DB, CHECK } from '../advanced-db.mjs'

const { viewColumns, viewRows, views } = CHECK

const SALE_LINES = 'CREATE VIEW sale_lines AS\nSELECT s.id AS sale_id, s.sold_on, p.name AS product, s.quantity\nFROM sales s\nJOIN products p ON p.id = s.product_id;'
const DAILY = 'CREATE VIEW daily_takings AS\nSELECT s.sold_on, ROUND(SUM(s.quantity * p.price), 2) AS takings\nFROM sales s\nJOIN products p ON p.id = s.product_id\nGROUP BY s.sold_on;'

export default makeTopic({
  id: 'views',
  title: 'Saved queries: views',
  database: ADVANCED_DB,
  paragraphs: [
    "This section's database is a garden centre: `staff` (each with a `manager_id`), `categories` (inside other categories), `products` (with extra `details` stored as JSON), `sales`, and `targets` for each quarter. Open **Tables** to see them.",
    'A **view** is a query with a name. Once it is made, you can select from it as if it were a table:',
    '```\nCREATE VIEW sale_lines AS\nSELECT s.id AS sale_id, s.sold_on, p.name AS product, s.quantity\nFROM sales s\nJOIN products p ON p.id = s.product_id;\n\nSELECT * FROM sale_lines WHERE quantity >= 3 ORDER BY sale_id;\n```',
    "A view stores the query, not the rows. Each time you select from it, the query runs again, so it always shows the data as it is now. That makes views good for queries you use often, and for hiding a long join behind a simple name.",
    'The view\'s columns are named by the query, so name calculated columns with `AS`, or list the names after the view\'s name: `CREATE VIEW top_sellers (product, sold) AS SELECT …`.',
    "Views can be used anywhere a table can in a SELECT: in joins, in subqueries, and in other views. You can't INSERT into a view or UPDATE it in SQLite: change the tables underneath instead.",
    "To change a view, drop it and make it again: SQLite has no `CREATE OR REPLACE VIEW`. `DROP VIEW sale_lines;` removes it (the tables stay as they are), and `CREATE VIEW IF NOT EXISTS` skips the CREATE when the view is already there.",
  ],
  sandboxCode: SALE_LINES + '\n\nSELECT * FROM sale_lines WHERE quantity >= 3 ORDER BY sale_id;',
  sandboxSnippets: [
    snippet('Make and use a view', SALE_LINES + '\n\nSELECT * FROM sale_lines WHERE quantity >= 3 ORDER BY sale_id;'),
    snippet('A grouped view', DAILY + '\n\nSELECT * FROM daily_takings ORDER BY sold_on;'),
    snippet('Not updatable', '-- This gives an error: views can\'t be changed directly\n' + SALE_LINES + "\nUPDATE sale_lines SET quantity = 1;"),
  ],
  readMore: { label: 'SQLite: CREATE VIEW', url: 'https://www.sqlite.org/lang_createview.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'A product list', {
      prompt: 'Create a view called `product_list` with each product\'s `name` and `price`.',
      hint: '`CREATE VIEW name AS` followed by the query the view should save.',
      solution: 'CREATE VIEW product_list AS\nSELECT name, price FROM products;',
      checks: [viewColumns('product_list'), viewRows('product_list', 'name')],
    }),
    query('easy', 'Use the view', {
      prompt: 'Create a view `cheap_products` with the `name` and `price` of products under 10. Then select everything from it, cheapest first, then by name.',
      hint: 'Two statements: `CREATE VIEW … AS SELECT … WHERE price < 10;` then `SELECT * FROM cheap_products ORDER BY price, name;`.',
      solution: 'CREATE VIEW cheap_products AS\nSELECT name, price FROM products WHERE price < 10;\n\nSELECT * FROM cheap_products ORDER BY price, name;',
      checks: [viewColumns('cheap_products'), viewRows('cheap_products', 'name')],
    }),
    query('easy', 'Sale lines', {
      prompt: 'Create the lesson\'s view `sale_lines`: each sale\'s id (`sale_id`), `sold_on`, the product\'s name (`product`) and `quantity`.',
      hint: 'Join sales to products inside the view.',
      solution: SALE_LINES,
      checks: [viewColumns('sale_lines'), viewRows('sale_lines', 'sale_id')],
    }),
    query('medium', 'Line totals', {
      prompt: 'Create a view `sale_totals` with each sale\'s id (`sale_id`), `sold_on`, product name (`product`), `quantity`, `price` and `line_total` (quantity times price, 2 decimals).',
      hint: '`ROUND(s.quantity * p.price, 2) AS line_total`.',
      solution: 'CREATE VIEW sale_totals AS\nSELECT s.id AS sale_id, s.sold_on, p.name AS product, s.quantity, p.price,\n       ROUND(s.quantity * p.price, 2) AS line_total\nFROM sales s\nJOIN products p ON p.id = s.product_id;',
      checks: [viewColumns('sale_totals'), viewRows('sale_totals', 'sale_id')],
    }),
    query('medium', 'Daily takings', {
      prompt: 'Create a view `daily_takings` with each day\'s `sold_on` and its `takings` (the sum of quantity times price, 2 decimals).',
      hint: 'A grouped query works in a view: `GROUP BY s.sold_on`.',
      solution: DAILY,
      checks: [viewColumns('daily_takings'), viewRows('daily_takings', 'sold_on')],
    }),
    query('medium', 'Better days', {
      prompt: 'Create the `daily_takings` view from the last challenge. Then use it to show the days whose takings beat the average day: `sold_on` and `takings`, in date order.',
      hint: '`SELECT … FROM daily_takings WHERE takings > (SELECT AVG(takings) FROM daily_takings)`.',
      solution: DAILY + '\n\nSELECT sold_on, takings\nFROM daily_takings\nWHERE takings > (SELECT AVG(takings) FROM daily_takings)\nORDER BY sold_on;',
      checks: [viewRows('daily_takings', 'sold_on')],
    }),
    query('hard', 'Change a view', {
      prompt: 'The starter makes `product_list` with name and price. Keep that line, then change the view so it also has `category_id` as a third column. SQLite has no CREATE OR REPLACE VIEW.',
      starter: 'CREATE VIEW product_list AS SELECT name, price FROM products;\n',
      hint: '`DROP VIEW product_list;`, then create it again with three columns.',
      solution: 'CREATE VIEW product_list AS SELECT name, price FROM products;\nDROP VIEW product_list;\nCREATE VIEW product_list AS SELECT name, price, category_id FROM products;',
      checks: [viewColumns('product_list'), viewRows('product_list', 'name')],
    }),
    query('hard', 'Who reports to whom', {
      prompt: 'Create a view `staff_view` with each staff member\'s `name`, `role` and their manager\'s name (`manager`, empty for the person at the top).',
      hint: 'A self LEFT JOIN: `FROM staff s LEFT JOIN staff m ON m.id = s.manager_id`.',
      solution: 'CREATE VIEW staff_view AS\nSELECT s.name, s.role, m.name AS manager\nFROM staff s\nLEFT JOIN staff m ON m.id = s.manager_id;',
      checks: [viewColumns('staff_view'), viewRows('staff_view', 'name')],
    }),
    query('expert', 'Category sales', {
      prompt: "Create a view `category_sales` with each category name that has sales (`category`; `No category` for products without one), the items sold (`items`) and the `takings` (2 decimals).",
      hint: "Join sales to products, LEFT JOIN categories, `COALESCE(c.name, 'No category')`, group by it.",
      solution: "CREATE VIEW category_sales AS\nSELECT COALESCE(c.name, 'No category') AS category,\n       SUM(s.quantity) AS items,\n       ROUND(SUM(s.quantity * p.price), 2) AS takings\nFROM sales s\nJOIN products p ON p.id = s.product_id\nLEFT JOIN categories c ON c.id = p.category_id\nGROUP BY COALESCE(c.name, 'No category');",
      checks: [viewColumns('category_sales'), viewRows('category_sales', 'category')],
    }),
    query('expert', 'Name the columns', {
      prompt: 'Create a view `top_sellers` whose columns are named in the CREATE VIEW line, `(product, sold)`: each product\'s name and the items sold. Then show the products in it that sold 4 or more, most first, then by name.',
      hint: '`CREATE VIEW top_sellers (product, sold) AS SELECT p.name, SUM(s.quantity) …`, then `SELECT * FROM top_sellers WHERE sold >= 4 ORDER BY sold DESC, product`.',
      solution: 'CREATE VIEW top_sellers (product, sold) AS\nSELECT p.name, SUM(s.quantity)\nFROM sales s\nJOIN products p ON p.id = s.product_id\nGROUP BY p.id, p.name;\n\nSELECT * FROM top_sellers WHERE sold >= 4 ORDER BY sold DESC, product;',
      checks: [viewColumns('top_sellers'), viewRows('top_sellers', 'product')],
    }),
  ],
  questions: [
    mc('What does a view store?', ['A copy of the rows', 'An index', 'Nothing until you refresh it', 'A query, which runs each time you select from it'], 3,
      'So a view always shows the data as it is now.'),
    mc('A row is added to sales after a view on sales was made. Does the view show it?', ['No, views are copies', 'Yes, the next time you select from the view', 'Only after DROP VIEW', 'Only if the view has ORDER BY'], 1,
      'The view\'s query runs again each time.'),
    mc('How do you change a view in SQLite?', ['DROP VIEW, then CREATE VIEW again', 'UPDATE VIEW', 'CREATE OR REPLACE VIEW', 'ALTER VIEW'], 0,
      'SQLite has no CREATE OR REPLACE.'),
    mc('What happens to the tables when you drop a view?', ['They are locked', 'Nothing: only the view goes', 'They are dropped too', 'Their rows are deleted'], 1,
      'A view is just a saved query.'),
    qShort('Which two words start the statement that makes a view? (two words)', 'CREATE VIEW',
      '`CREATE VIEW name AS SELECT …`.'),
    mc('Can you UPDATE a view in SQLite?', ['Only grouped views', 'Only with IF EXISTS', 'No, change the tables underneath instead', 'Yes, always'], 2,
      'SQLite views are read-only.'),
    mc('`CREATE VIEW top_sellers (product, sold) AS …` does what with `(product, sold)`?', ['Names the view\'s columns', 'Chooses the tables', 'Adds two rows', 'Sorts the view'], 0,
      'Handy when the query has calculated columns.'),
    mc('Can a view be used in a join or a subquery?', ['No', 'Only in a subquery', 'Yes, anywhere a table can be read', 'Only if it has one column'], 2,
      'You can even build views on other views.'),
    mc('What does `CREATE VIEW IF NOT EXISTS v AS …` do when v already exists?', ['Gives an error', 'Replaces v', 'Drops v', 'Nothing: it skips the CREATE'], 3,
      'Useful in setup scripts.'),
    mc('Why give a calculated column a name with AS inside a view?', ['So the view\'s column has a simple name to select by', 'It is faster', 'Views need two columns', 'To sort the view'], 0,
      'Otherwise the column is named after its expression.'),
  ],
})
