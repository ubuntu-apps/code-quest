// Advanced queries: Reading a query plan.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { ADVANCED_DB, CHECK } from '../advanced-db.mjs'

const { indexes, plan } = CHECK

export default makeTopic({
  id: 'query_plans',
  title: 'Reading a query plan',
  database: ADVANCED_DB,
  paragraphs: [
    'Before running a query, SQLite decides how: which table to read first, and whether to read every row or jump to the right ones with an index. Put `EXPLAIN QUERY PLAN` in front of a query to see that **plan** instead of the result:',
    "```\nEXPLAIN QUERY PLAN\nSELECT * FROM sales WHERE product_id = 5;\n```",
    "The `detail` column is the part to read. `SCAN sales` means it reads every row of sales. With an index on `product_id`, the plan becomes `SEARCH sales USING INDEX sales_product (product_id=?)`: it looks the value up in the index and reads only the matching rows.",
    "```\nCREATE INDEX sales_product ON sales (product_id);\n\nEXPLAIN QUERY PLAN\nSELECT * FROM sales WHERE product_id = 5;\n```",
    "Other things you will see: `SEARCH products USING INTEGER PRIMARY KEY (rowid=?)` is a lookup by id, the fastest kind. `USING COVERING INDEX` means the index holds every column the query needs, so the table isn't read at all. `USE TEMP B-TREE FOR ORDER BY` means SQLite sorts the rows itself; an index in the right order avoids that.",
    "An index only helps when the query compares the column itself. `WHERE date(sold_on) = '2026-10-07'` can't use an index on sold_on (it would need the value of `date(sold_on)` for every row), but `WHERE sold_on = '2026-10-07'` can. The same goes for `LIKE '%…'` with a % at the start.",
    "These tables are tiny, so every plan is fast here. On tables with millions of rows, SCAN against SEARCH is the difference between seconds and milliseconds. The plan is the first thing to look at when a query is slow.",
  ],
  sandboxCode: "EXPLAIN QUERY PLAN\nSELECT * FROM sales WHERE product_id = 5;",
  sandboxSnippets: [
    snippet('Without an index', 'EXPLAIN QUERY PLAN\nSELECT * FROM sales WHERE product_id = 5;'),
    snippet('With an index', 'CREATE INDEX sales_product ON sales (product_id);\n\nEXPLAIN QUERY PLAN\nSELECT * FROM sales WHERE product_id = 5;'),
    snippet('Primary key', 'EXPLAIN QUERY PLAN\nSELECT name FROM products WHERE id = 3;'),
    snippet('Sorting', 'EXPLAIN QUERY PLAN\nSELECT name, price FROM products ORDER BY price;'),
  ],
  readMore: { label: 'SQLite: EXPLAIN QUERY PLAN', url: 'https://www.sqlite.org/eqp.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Search by product', {
      prompt: "`SELECT * FROM sales WHERE product_id = 5` scans the whole table. Create an index called `sales_product` on `sales (product_id)` so it searches instead. (Run EXPLAIN QUERY PLAN to see the difference.)",
      hint: '`CREATE INDEX sales_product ON sales (product_id);`',
      solution: 'CREATE INDEX sales_product ON sales (product_id);',
      checks: [indexes('sales'), plan('The query searches with the index', 'SELECT * FROM sales WHERE product_id = 5')],
    }),
    query('easy', 'Search by day', {
      prompt: "Create an index called `sales_day` so that `SELECT * FROM sales WHERE sold_on = '2026-10-07'` searches instead of scanning.",
      hint: 'Index the column in the WHERE: `sales (sold_on)`.',
      solution: 'CREATE INDEX sales_day ON sales (sold_on);',
      checks: [indexes('sales'), plan('The query searches with the index', "SELECT * FROM sales WHERE sold_on = '2026-10-07'")],
    }),
    query('easy', 'Search by name', {
      prompt: "Create an index called `products_name` so that `SELECT price FROM products WHERE name = 'Hosta'` searches instead of scanning.",
      hint: '`CREATE INDEX products_name ON products (name);`',
      solution: 'CREATE INDEX products_name ON products (name);',
      checks: [indexes('products'), plan('The query searches with the index', "SELECT price FROM products WHERE name = 'Hosta'")],
    }),
    query('medium', 'Two columns', {
      prompt: "Create one index called `sales_staff_day` that lets `SELECT * FROM sales WHERE staff_id = 4 AND sold_on >= '2026-10-07'` search on both columns: staff_id first, then sold_on.",
      hint: 'A two-column index: `sales (staff_id, sold_on)`. The equality column goes first, the range second.',
      solution: 'CREATE INDEX sales_staff_day ON sales (staff_id, sold_on);',
      checks: [indexes('sales'), plan('The query searches on both columns', "SELECT * FROM sales WHERE staff_id = 4 AND sold_on >= '2026-10-07'")],
    }),
    query('medium', 'Covering index', {
      prompt: "Create an index called `sales_day_quantity` on `sales (sold_on, quantity)`, so that `SELECT sold_on, SUM(quantity) FROM sales GROUP BY sold_on` is answered from the index alone (a covering index).",
      hint: 'The index holds both columns the query uses, so the plan says USING COVERING INDEX.',
      solution: 'CREATE INDEX sales_day_quantity ON sales (sold_on, quantity);',
      checks: [indexes('sales'), plan('The query uses the covering index', 'SELECT sold_on, SUM(quantity) FROM sales GROUP BY sold_on')],
    }),
    query('medium', 'Already in order', {
      prompt: "`SELECT name, price FROM products WHERE price IS NOT NULL ORDER BY price` sorts with a temporary B-tree. Create an index called `products_price` on price, so the rows come out of the index already in order.",
      hint: '`CREATE INDEX products_price ON products (price);`, then the plan has no USE TEMP B-TREE.',
      solution: 'CREATE INDEX products_price ON products (price);',
      checks: [indexes('products'), plan('The query reads the index in order', 'SELECT name, price FROM products WHERE price IS NOT NULL ORDER BY price')],
    }),
    query('hard', 'An index on JSON', {
      prompt: "Create an index called `products_colour` on the expression `json_extract(details, '$.colour')`, so that `SELECT name FROM products WHERE json_extract(details, '$.colour') = 'green'` searches.",
      hint: "An index can be on an expression: `CREATE INDEX products_colour ON products (json_extract(details, '$.colour'));`. The query must use the same expression.",
      solution: "CREATE INDEX products_colour ON products (json_extract(details, '$.colour'));",
      checks: [indexes('products'), plan('The query searches with the index', "SELECT name FROM products WHERE json_extract(details, '$.colour') = 'green'")],
    }),
    query('hard', 'One index too many', {
      prompt: "The starter makes two indexes. `sales_product` is not needed: `sales_product_qty` starts with the same column, so it can do the same job. Keep the starter's lines and drop `sales_product`.",
      starter: 'CREATE INDEX sales_product ON sales (product_id);\nCREATE INDEX sales_product_qty ON sales (product_id, quantity);\n',
      hint: '`DROP INDEX sales_product;`',
      solution: 'CREATE INDEX sales_product ON sales (product_id);\nCREATE INDEX sales_product_qty ON sales (product_id, quantity);\nDROP INDEX sales_product;',
      checks: [indexes('sales'), plan('Queries on product_id still search', 'SELECT * FROM sales WHERE product_id = 5')],
    }),
    query('expert', 'A join that searches', {
      prompt: "In `SELECT p.name, s.quantity FROM products p JOIN sales s ON s.product_id = p.id WHERE p.name = 'Hosta'`, SQLite reads every row of sales (`SCAN s`) and looks each product up by id. Create just one index, `sales_product` on `sales (product_id)`, so the sales side of the join is a SEARCH.",
      hint: 'Index the column that sales is joined on.',
      solution: 'CREATE INDEX sales_product ON sales (product_id);',
      checks: [indexes('sales'), plan('The join searches sales with the index', "SELECT p.name, s.quantity FROM products p JOIN sales s ON s.product_id = p.id WHERE p.name = 'Hosta'")],
    }),
    query('expert', 'A partial index', {
      prompt: "Self-checkout sales (no staff_id) are checked by day. Create a partial index called `sales_self_checkout` on `sales (sold_on)` that only holds the rows `WHERE staff_id IS NULL`, so that `SELECT * FROM sales WHERE staff_id IS NULL AND sold_on = '2026-10-10'` searches with it.",
      hint: '`CREATE INDEX … ON sales (sold_on) WHERE staff_id IS NULL;`',
      solution: 'CREATE INDEX sales_self_checkout ON sales (sold_on) WHERE staff_id IS NULL;',
      checks: [indexes('sales'), plan('The query searches with the partial index', "SELECT * FROM sales WHERE staff_id IS NULL AND sold_on = '2026-10-10'")],
    }),
  ],
  questions: [
    mc('What does EXPLAIN QUERY PLAN show?', ['How SQLite will run the query, instead of its result', 'The query\'s result, faster', 'The table\'s columns', 'The query\'s errors'], 0,
      'Put it in front of any query.'),
    mc('What does `SCAN sales` mean?', ['It skips sales', 'It sorts sales', 'It uses an index', 'It reads every row of sales'], 3,
      'Fine for small tables, slow for big ones.'),
    mc('What does `SEARCH sales USING INDEX sales_product (product_id=?)` mean?', ['It reads every row', 'It sorts by product_id', 'It looks product_id up in the index and reads only matching rows', 'The index is missing'], 2,
      'That is what an index is for.'),
    mc('What does USING COVERING INDEX mean?', ['The table is empty', 'Two indexes are used', 'The index holds every column needed, so the table isn\'t read', 'The index is unique'], 2,
      'The fastest kind of index use.'),
    qShort('Which three words go in front of a query to see its plan? (three words)', 'EXPLAIN QUERY PLAN',
      'Each row of the result is one step; read the detail column.'),
    mc("Why can't `WHERE date(sold_on) = '2026-10-07'` use an index on sold_on?", ['The index holds sold_on, not date(sold_on), so every row must be worked out', 'Dates can\'t be indexed', 'It can', 'date() is too slow'], 0,
      'Compare the column itself: `sold_on = …`.'),
    mc('What does USE TEMP B-TREE FOR ORDER BY mean?', ['ORDER BY is ignored', 'An index is used', 'SQLite sorts the rows itself', 'The query fails'], 2,
      'An index in the right order can avoid it.'),
    mc('Which index can serve `WHERE staff_id = 4 AND sold_on >= …`?', ['(sold_on, staff_id) only', '(sold_on)', '(quantity, staff_id)', '(staff_id, sold_on)'], 3,
      'Equality column first, then the range.'),
    mc('An index on (product_id, quantity) exists. Is a separate index on (product_id) needed?', ['Only if quantity is NULL', 'No: the two-column index starts with product_id and can do its job', 'Yes, always', 'Only for joins'], 1,
      'Extra indexes slow down inserts and updates.'),
    mc("What does `CREATE INDEX … ON sales (sold_on) WHERE staff_id IS NULL` make?", ['An index on staff_id', 'An error', 'A unique index', 'A partial index holding only the self-checkout rows'], 3,
      'Smaller, and used by queries with the same condition.'),
  ],
})
