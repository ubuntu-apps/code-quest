// Advanced queries: the section's projects (easy, medium, hard).
import { makeProject, mc, qShort, query, snippet } from './_builders.mjs'
import { ADVANCED_DB, CHECK } from './advanced-db.mjs'

const { viewColumns, viewRows, indexes, plan } = CHECK

const CAL = "WITH RECURSIVE days(day) AS (\n  SELECT MIN(sold_on) FROM sales\n  UNION ALL\n  SELECT date(day, '+1 day') FROM days\n  WHERE day < (SELECT MAX(sold_on) FROM sales)\n)\n"

// ---- Staff directory ----------------------------------------------------------------------

const staffDirectory = makeProject('easy', {
  id: 'proj_staff_directory',
  title: 'Staff directory',
  database: ADVANCED_DB,
  paragraphs: [
    'The garden centre wants a staff directory for its notice board and intranet: who everyone reports to, how long they have been here, how the teams are arranged, and an org chart that stays up to date by itself.',
    'Today is 2026-10-24.',
  ],
  sandboxCode: 'SELECT s.name, s.role, m.name AS manager\nFROM staff s\nLEFT JOIN staff m ON m.id = s.manager_id\nORDER BY s.name;',
  sandboxSnippets: [
    snippet('Who reports to whom', 'SELECT s.name, s.role, m.name AS manager\nFROM staff s\nLEFT JOIN staff m ON m.id = s.manager_id\nORDER BY s.name;'),
  ],
  readMore: { label: 'SQLite: the WITH clause', url: 'https://www.sqlite.org/lang_with.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Directory view', {
      prompt: "Create a view `directory` with each staff member's `name`, `role` and their manager's name (`manager`; `none` for the person at the top).",
      hint: "A self LEFT JOIN with `COALESCE(m.name, 'none') AS manager`.",
      solution: "CREATE VIEW directory AS\nSELECT s.name, s.role, COALESCE(m.name, 'none') AS manager\nFROM staff s\nLEFT JOIN staff m ON m.id = s.manager_id;",
      checks: [viewColumns('directory'), viewRows('directory', 'name')],
    }),
    query('easy', 'Years of service', {
      prompt: "Show each staff member's `name`, `hired` date and whole years of service up to today (`years`). Longest first, then by name.",
      hint: "`CAST((julianday('2026-10-24') - julianday(hired)) / 365.25 AS INTEGER) AS years`.",
      solution: "SELECT name, hired,\n       CAST((julianday('2026-10-24') - julianday(hired)) / 365.25 AS INTEGER) AS years\nFROM staff\nORDER BY years DESC, name;",
    }),
    query('medium', 'Levels', {
      prompt: "Show each staff member's `name`, `role` and `level` in the tree (1 at the top). Sort by level, then name.",
      hint: 'A recursive CTE from the person with no manager, joining `s.manager_id = c.id`.',
      solution: 'WITH RECURSIVE chart(id, level) AS (\n  SELECT id, 1 FROM staff WHERE manager_id IS NULL\n  UNION ALL\n  SELECT s.id, c.level + 1\n  FROM staff s\n  JOIN chart c ON s.manager_id = c.id\n)\nSELECT s.name, s.role, c.level\nFROM chart c\nJOIN staff s ON s.id = c.id\nORDER BY c.level, s.name;',
    }),
    query('medium', 'Direct reports', {
      prompt: "For each staff member who manages someone, show `name` and how many people report straight to them (`direct_reports`). Most first, then by name.",
      hint: 'Join staff to itself on `r.manager_id = m.id` and count per manager.',
      solution: 'SELECT m.name, COUNT(*) AS direct_reports\nFROM staff m\nJOIN staff r ON r.manager_id = m.id\nGROUP BY m.id, m.name\nORDER BY direct_reports DESC, m.name;',
    }),
    query('hard', 'Whole teams', {
      prompt: "For each staff member who manages someone, show `name` and how many people are in their whole team below them (`team_size`). Most first, then by name.",
      hint: 'Make (top, id) pairs by anchoring every person and walking down; count the pairs where id isn\'t top.',
      solution: 'WITH RECURSIVE pairs(top, id) AS (\n  SELECT id, id FROM staff\n  UNION ALL\n  SELECT p.top, s.id\n  FROM staff s\n  JOIN pairs p ON s.manager_id = p.id\n)\nSELECT st.name, COUNT(*) AS team_size\nFROM pairs p\nJOIN staff st ON st.id = p.top\nWHERE p.id <> p.top\nGROUP BY st.id, st.name\nORDER BY team_size DESC, st.name;',
    }),
    query('hard', 'Org chart view', {
      prompt: "Create a view `org_chart` with each staff member's `name`, `level` (1 at the top) and `path` (names from the top down joined with `/`). A view can hold a recursive WITH.",
      hint: "`CREATE VIEW org_chart AS WITH RECURSIVE chart(…) AS (…) SELECT name, level, path FROM chart;`",
      solution: "CREATE VIEW org_chart AS\nWITH RECURSIVE chart(id, name, level, path) AS (\n  SELECT id, name, 1, name FROM staff WHERE manager_id IS NULL\n  UNION ALL\n  SELECT s.id, s.name, c.level + 1, c.path || '/' || s.name\n  FROM staff s\n  JOIN chart c ON s.manager_id = c.id\n)\nSELECT name, level, path FROM chart;",
      checks: [viewColumns('org_chart'), viewRows('org_chart', 'path')],
    }),
  ],
  questions: [
    mc('Why does a view suit the directory?', ['It is faster than a table', 'It can be updated', 'It runs its query each time, so it always shows the current staff', 'It copies the staff table'], 2,
      'Nobody needs to rebuild it when someone joins.'),
    mc('Why LEFT JOIN for the manager\'s name?', ['So the person with no manager still appears', 'To remove duplicates', 'A self-join needs it', 'To sort'], 0,
      'An inner join would drop the top of the tree.'),
    mc('What does `julianday(\'2026-10-24\') - julianday(hired)` give?', ['A date', 'Years', 'Months', 'The number of days between the dates'], 3,
      'Divide by 365.25 for years.'),
    mc('How does the levels query find the second level?', ['GROUP BY manager_id', 'ORDER BY level', 'It joins staff whose manager_id is a first-level id', 'WHERE level = 2'], 2,
      'Each step goes one level down.'),
    qShort('Which keyword lets a CTE refer to itself?', 'RECURSIVE',
      '`WITH RECURSIVE chart(…) AS (…)`.'),
    mc('Can a view contain a recursive WITH?', ['No', 'Only without ORDER BY', 'Only with UNION', 'Yes'], 3,
      'Any SELECT can be a view.'),
  ],
})

// ---- Product catalogue -------------------------------------------------------------------

const productCatalogue = makeProject('medium', {
  id: 'proj_product_catalogue',
  title: 'Product catalogue',
  database: ADVANCED_DB,
  paragraphs: [
    'The website needs a catalogue built from the products table: names with their categories and colours, a tag index, a care table, a price list as JSON for the web page, category paths, and a restock flag in the details.',
  ],
  sandboxCode: "SELECT name, json_extract(details, '$.colour') AS colour, details\nFROM products\nORDER BY name;",
  sandboxSnippets: [
    snippet('Details', "SELECT name, json_extract(details, '$.colour') AS colour, details\nFROM products\nORDER BY name;"),
  ],
  readMore: { label: 'SQLite: JSON functions', url: 'https://www.sqlite.org/json1.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Catalogue', {
      prompt: "Show every product's `name`, its category name (`category`; `none` if it has none), `price` and `colour` from the details. Sort by name.",
      hint: "LEFT JOIN categories, `COALESCE(c.name, 'none')`, and `json_extract(p.details, '$.colour')`.",
      solution: "SELECT p.name, COALESCE(c.name, 'none') AS category, p.price,\n       json_extract(p.details, '$.colour') AS colour\nFROM products p\nLEFT JOIN categories c ON c.id = p.category_id\nORDER BY p.name;",
    }),
    query('medium', 'Tag index', {
      prompt: "For each tag, show `tag`, the number of products with it (`products`) and the cheapest price among them (`from_price`). Sort by tag.",
      hint: "`FROM products p, json_each(p.details, '$.tags') AS t`, grouped by `t.value`.",
      solution: "SELECT t.value AS tag, COUNT(*) AS products, MIN(p.price) AS from_price\nFROM products p, json_each(p.details, '$.tags') AS t\nGROUP BY tag\nORDER BY tag;",
    }),
    query('medium', 'Care table', {
      prompt: "For each light need (`light`), show how many products need `low`, `medium` and `high` water, as columns `low`, `medium` and `high`. Only products with care details. Sort by light.",
      hint: "Group by the extracted light, and `COUNT(*) FILTER (WHERE json_extract(details, '$.care.water') = 'low')` for each column.",
      solution: "SELECT json_extract(details, '$.care.light') AS light,\n       COUNT(*) FILTER (WHERE json_extract(details, '$.care.water') = 'low') AS low,\n       COUNT(*) FILTER (WHERE json_extract(details, '$.care.water') = 'medium') AS medium,\n       COUNT(*) FILTER (WHERE json_extract(details, '$.care.water') = 'high') AS high\nFROM products\nWHERE json_extract(details, '$.care') IS NOT NULL\nGROUP BY light\nORDER BY light;",
    }),
    query('medium', 'Price list as JSON', {
      prompt: "Show one value, `price_list`: a JSON array with an object for each priced product, like `{\"name\":\"Lavender\",\"price\":6.5}`, cheapest first, then by name.",
      hint: "`json_group_array(json_object('name', name, 'price', price))` over a sorted subquery.",
      solution: "SELECT json_group_array(json_object('name', name, 'price', price)) AS price_list\nFROM (SELECT name, price FROM products WHERE price IS NOT NULL ORDER BY price, name);",
    }),
    query('hard', 'Category paths', {
      prompt: "Show each category's full `path` (like `Plants > Outdoor plants > Shrubs`) and how many products are in that category itself (`products`, 0 if none). Sort by path.",
      hint: "Build the paths with a recursive CTE, then LEFT JOIN products on the category id and count.",
      solution: "WITH RECURSIVE tree(id, path) AS (\n  SELECT id, name FROM categories WHERE parent_id IS NULL\n  UNION ALL\n  SELECT c.id, t.path || ' > ' || c.name\n  FROM categories c\n  JOIN tree t ON c.parent_id = t.id\n)\nSELECT t.path, COUNT(p.id) AS products\nFROM tree t\nLEFT JOIN products p ON p.category_id = t.id\nGROUP BY t.id, t.path\nORDER BY t.path;",
    }),
    query('hard', 'Restock flags', {
      prompt: "Add `\"restock\": true` to the details of every product that sold 4 or more items in all. (Products with no details yet get `{\"restock\":true}`.)",
      hint: "`json_set(COALESCE(details, '{}'), '$.restock', json('true'))`, `WHERE id IN (SELECT product_id FROM sales GROUP BY product_id HAVING SUM(quantity) >= 4)`.",
      solution: "UPDATE products\nSET details = json_set(COALESCE(details, '{}'), '$.restock', json('true'))\nWHERE id IN (SELECT product_id FROM sales GROUP BY product_id HAVING SUM(quantity) >= 4);",
      checks: [['The products table has the right details', 'SELECT id, details FROM products ORDER BY id']],
    }),
  ],
  questions: [
    mc("What does `json_extract(details, '$.colour')` give for a tool?", ["'none'", 'NULL, because tools have no colour key', 'An empty string', 'An error'], 1,
      'Missing keys give NULL.'),
    mc('Why does the tag index use json_each?', ['To read the colour', 'To sort the tags', 'To turn each product\'s tag array into rows that can be grouped', 'To count products'], 2,
      'One row per product and tag.'),
    mc('The care table turns water levels into…', ['A view', 'Rows', 'A JSON array', 'Columns, one per level'], 3,
      'A pivot with FILTER.'),
    mc('Why sort in a subquery before json_group_array?', ['To remove NULLs', 'The array takes the values in the order the rows arrive', 'json_group_array can\'t sort', 'It is required'], 1,
      'Sorting first sets the order.'),
    qShort("What does `json('true')` turn the text 'true' into? (one word)", 'true',
      'A JSON true, rather than the text "true".'),
    mc("Why `COALESCE(details, '{}')` in Restock flags?", ['json_set on NULL gives NULL, so start from an empty object instead', 'To remove details', 'To sort', 'It is needed by UPDATE'], 0,
      'The gift card has no details.'),
  ],
})

// ---- Sales calendar ----------------------------------------------------------------------

const salesCalendar = makeProject('hard', {
  id: 'proj_sales_calendar',
  title: 'Sales calendar',
  database: ADVANCED_DB,
  paragraphs: [
    "The owner wants a daily sales report that doesn't skip quiet days, a view of it for the office, a weekend table for staff, the self-checkout's share, an index so the report stays fast as sales grow, and the best day of each week.",
    'Every challenge covers each day from the first sale to the last.',
  ],
  sandboxCode: CAL + 'SELECT d.day, COUNT(s.id) AS sales\nFROM days d\nLEFT JOIN sales s ON s.sold_on = d.day\nGROUP BY d.day\nORDER BY d.day;',
  sandboxSnippets: [
    snippet('Every day', CAL + 'SELECT d.day, COUNT(s.id) AS sales\nFROM days d\nLEFT JOIN sales s ON s.sold_on = d.day\nGROUP BY d.day\nORDER BY d.day;'),
  ],
  readMore: { label: 'SQLite: date and time functions', url: 'https://www.sqlite.org/lang_datefunc.html', source: 'SQLite documentation' },
  challenges: [
    query('medium', 'Every day', {
      prompt: "Show every `day` with its number of `sales` and `items` (0 on days with none). In date order.",
      hint: 'A calendar CTE, LEFT JOIN sales, `COUNT(s.id)` and `COALESCE(SUM(s.quantity), 0)`.',
      solution: CAL + 'SELECT d.day, COUNT(s.id) AS sales, COALESCE(SUM(s.quantity), 0) AS items\nFROM days d\nLEFT JOIN sales s ON s.sold_on = d.day\nGROUP BY d.day\nORDER BY d.day;',
    }),
    query('hard', 'Daily report view', {
      prompt: "Create a view `daily_report` with every `day`, its `takings` (2 decimals, 0 if none) and the running takings so far (`takings_so_far`, 2 decimals).",
      hint: 'Put the calendar CTE inside the view; LEFT JOIN sales and products; a running SUM over the grouped days.',
      solution: 'CREATE VIEW daily_report AS\n' + CAL + 'SELECT d.day,\n       ROUND(COALESCE(SUM(s.quantity * p.price), 0), 2) AS takings,\n       ROUND(SUM(COALESCE(SUM(s.quantity * p.price), 0)) OVER (ORDER BY d.day), 2) AS takings_so_far\nFROM days d\nLEFT JOIN sales s ON s.sold_on = d.day\nLEFT JOIN products p ON p.id = s.product_id\nGROUP BY d.day;',
      checks: [viewColumns('daily_report'), viewRows('daily_report', 'day')],
    }),
    query('hard', 'Weekend table', {
      prompt: "Show every staff member's `name`, the items they sold on weekdays (`weekday_items`) and at weekends (`weekend_items`), 0 where none. Most items in all first, then by name.",
      hint: "LEFT JOIN sales to staff; `COALESCE(SUM(s.quantity) FILTER (WHERE strftime('%w', s.sold_on) IN ('0', '6')), 0)`; sort by `weekday_items + weekend_items DESC`.",
      solution: "SELECT st.name,\n       COALESCE(SUM(s.quantity) FILTER (WHERE strftime('%w', s.sold_on) NOT IN ('0', '6')), 0) AS weekday_items,\n       COALESCE(SUM(s.quantity) FILTER (WHERE strftime('%w', s.sold_on) IN ('0', '6')), 0) AS weekend_items\nFROM staff st\nLEFT JOIN sales s ON s.staff_id = st.id\nGROUP BY st.id, st.name\nORDER BY weekday_items + weekend_items DESC, st.name;",
    }),
    query('hard', 'Self-checkout share', {
      prompt: "Show every `day`, its `items`, the self-checkout items (`self_items`) and their share (`self_pct`, %, 1 decimal; empty on days with no items). In date order.",
      hint: "`SUM(s.quantity) FILTER (WHERE s.staff_id IS NULL)` for the self-checkout; divide by `NULLIF(items, 0)` so empty days give NULL instead of an error-free 0.",
      solution: CAL + ', daily AS (\n  SELECT d.day,\n         COALESCE(SUM(s.quantity), 0) AS items,\n         COALESCE(SUM(s.quantity) FILTER (WHERE s.id IS NOT NULL AND s.staff_id IS NULL), 0) AS self_items\n  FROM days d\n  LEFT JOIN sales s ON s.sold_on = d.day\n  GROUP BY d.day\n)\nSELECT day, items, self_items, ROUND(100.0 * self_items / NULLIF(items, 0), 1) AS self_pct\nFROM daily\nORDER BY day;',
    }),
    query('hard', 'Keep the report fast', {
      prompt: "The report groups sales by day and adds up quantities. Create an index called `sales_day_quantity` on `sales (sold_on, quantity)` so that `SELECT sold_on, SUM(quantity) FROM sales GROUP BY sold_on` is answered from the index alone.",
      hint: 'A covering index holds every column the query reads, so list both columns in the index, in the order given.',
      solution: 'CREATE INDEX sales_day_quantity ON sales (sold_on, quantity);',
      checks: [indexes('sales'), plan('The report uses the covering index', 'SELECT sold_on, SUM(quantity) FROM sales GROUP BY sold_on')],
    }),
    query('hard', 'Best day of each week', {
      prompt: "Split the days into weeks of 7 from the first sale (`week` 1, 2, …). For each week, show its best day or days by items: `week`, `day` and `items`. Sort by week, then day.",
      hint: "`CAST((julianday(d.day) - julianday((SELECT MIN(sold_on) FROM sales))) / 7 AS INTEGER) + 1 AS week`. Then RANK within each week by items, and keep 1.",
      solution: CAL + ', daily AS (\n  SELECT d.day,\n         CAST((julianday(d.day) - julianday((SELECT MIN(sold_on) FROM sales))) / 7 AS INTEGER) + 1 AS week,\n         COALESCE(SUM(s.quantity), 0) AS items\n  FROM days d\n  LEFT JOIN sales s ON s.sold_on = d.day\n  GROUP BY d.day\n),\nranked AS (\n  SELECT week, day, items, RANK() OVER (PARTITION BY week ORDER BY items DESC) AS place\n  FROM daily\n)\nSELECT week, day, items\nFROM ranked\nWHERE place = 1\nORDER BY week, day;',
    }),
  ],
  questions: [
    mc('Why does the report start from a calendar CTE?', ['So days with no sales still get a row', 'To sort the dates', 'To make it faster', 'Views need it'], 0,
      'GROUP BY on sales alone skips quiet days.'),
    mc('Can a view hold a recursive CTE and a window function?', ['Yes, any SELECT can be a view', 'Only one of them', 'Only without GROUP BY', 'No'], 0,
      'The view runs it all each time.'),
    mc('Why LEFT JOIN sales to staff in the weekend table?', ['It is needed by FILTER', 'To sort by name', 'To include the self-checkout', 'So staff with no sales still appear, with 0'], 3,
      'Rosa has no sales.'),
    mc('What does `NULLIF(items, 0)` do in the share?', ['Removes the row', 'Rounds items', 'Turns 0 into NULL, so dividing gives NULL on empty days', 'Turns NULL into 0'], 2,
      'An empty day has no share to show.'),
    qShort('What kind of index holds every column a query needs? (one word)', 'covering',
      'The plan says USING COVERING INDEX.'),
    mc('Why RANK and not ROW_NUMBER for the best day of each week?', ['RANK is faster', 'ROW_NUMBER can\'t partition', 'RANK sorts by date', 'Days with the same items should all be kept'], 3,
      'A tie keeps both days.'),
  ],
})

export const advancedProjects = [staffDirectory, productCatalogue, salesCalendar]
