// Advanced queries: JSON arrays, json_each and building JSON from rows.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { ADVANCED_DB } from '../advanced-db.mjs'

const EACH = "SELECT p.name, t.value AS tag\nFROM products p, json_each(p.details, '$.tags') AS t\nORDER BY p.name, tag;"
const COUNTS = "SELECT t.value AS tag, COUNT(*) AS products\nFROM products p, json_each(p.details, '$.tags') AS t\nGROUP BY tag\nORDER BY products DESC, tag;"

export default makeTopic({
  id: 'json_arrays',
  title: 'JSON arrays and json_each',
  database: ADVANCED_DB,
  paragraphs: [
    "Each product's `tags` is a JSON array. `json_array_length(details, '$.tags')` says how many tags there are. To work with the tags themselves, turn the array into rows with `json_each`:",
    '```\n' + EACH + '\n```',
    "`json_each` is a **table-valued function**: it goes in FROM like a table, and gives one row per element of the array, with the element in its `value` column (there are also `key`, the position, and `type`). Listing it after `products p,` joins each product to its own tags; a product with no tags, or no details, has no rows.",
    'Once the tags are rows, everything else works on them: count products per tag, find products with a given tag, or join tags to sales:',
    '```\n' + COUNTS + '\n```',
    "To test for one tag, use EXISTS: `WHERE EXISTS (SELECT 1 FROM json_each(details, '$.tags') WHERE value = 'easy')`.",
    "The other way round, aggregates build JSON from rows. `json_group_array(name)` collects a group's values into one JSON array, and `json_group_object(name, price)` into one object. The values go in the order the rows arrive, so to control it, sort in a subquery first.",
  ],
  sandboxCode: EACH,
  sandboxSnippets: [
    snippet('One row per tag', EACH),
    snippet('Products per tag', COUNTS),
    snippet('Rows into an array', 'SELECT json_group_array(name) AS names\nFROM (SELECT name FROM products ORDER BY name);'),
  ],
  readMore: { label: 'SQLite: json_each', url: 'https://www.sqlite.org/json1.html#jeach', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'How many tags', {
      prompt: "Show each product with details: `name` and its number of tags (`tags`). Sort by name.",
      hint: "`json_array_length(details, '$.tags')`, `WHERE details IS NOT NULL`.",
      solution: "SELECT name, json_array_length(details, '$.tags') AS tags\nFROM products\nWHERE details IS NOT NULL\nORDER BY name;",
    }),
    query('easy', 'Every tag', {
      prompt: "Show one row per product and tag: `name` and `tag`. Sort by name, then tag.",
      hint: "`FROM products p, json_each(p.details, '$.tags') AS t`, and `t.value AS tag`.",
      solution: EACH,
    }),
    query('easy', 'Easy plants', {
      prompt: "Show the `name` of every product tagged `easy`. Sort by name.",
      hint: "`WHERE EXISTS (SELECT 1 FROM json_each(details, '$.tags') WHERE value = 'easy')`.",
      solution: "SELECT name\nFROM products\nWHERE EXISTS (SELECT 1 FROM json_each(details, '$.tags') WHERE value = 'easy')\nORDER BY name;",
    }),
    query('medium', 'Products per tag', {
      prompt: "For each tag, show `tag` and how many products have it (`products`). Most first, then by tag.",
      hint: 'The lesson\'s second example.',
      solution: COUNTS,
    }),
    query('medium', 'No tags', {
      prompt: "Show the `name` of every product with no tags at all: an empty array, or no details. Sort by name.",
      hint: "`WHERE COALESCE(json_array_length(details, '$.tags'), 0) = 0`.",
      solution: "SELECT name\nFROM products\nWHERE COALESCE(json_array_length(details, '$.tags'), 0) = 0\nORDER BY name;",
    }),
    query('medium', 'Tag positions', {
      prompt: "Show each product's tags with their position: `name`, `position` (0 for the first, from json_each's `key`) and `tag`. Only products with two or more tags. Sort by name, then position.",
      hint: "`t.key AS position`, and `WHERE json_array_length(p.details, '$.tags') >= 2`.",
      solution: "SELECT p.name, t.key AS position, t.value AS tag\nFROM products p, json_each(p.details, '$.tags') AS t\nWHERE json_array_length(p.details, '$.tags') >= 2\nORDER BY p.name, position;",
    }),
    query('hard', 'Cheap names in one array', {
      prompt: "Show one value, `names`: a JSON array of the names of products under 10, cheapest first (then by name).",
      hint: '`json_group_array(name)` collects names into one array. To control their order, collect them from a subquery that already sorts them.',
      solution: 'SELECT json_group_array(name) AS names\nFROM (SELECT name FROM products WHERE price < 10 ORDER BY price, name);',
    }),
    query('hard', 'A price object per category', {
      prompt: "For each category with priced products, show `category` and `prices`: a JSON object from product name to price, in name order. Sort by category.",
      hint: 'In a subquery, join products to categories and sort by name; then `json_group_object(name, price)` grouped by category.',
      solution: 'SELECT category, json_group_object(name, price) AS prices\nFROM (\n  SELECT c.name AS category, p.name, p.price\n  FROM products p\n  JOIN categories c ON c.id = p.category_id\n  WHERE p.price IS NOT NULL\n  ORDER BY p.name\n) AS t\nGROUP BY category\nORDER BY category;',
    }),
    query('expert', 'Sales by tag', {
      prompt: "For each tag, show `tag` and the items sold of products with that tag (`items`). Tags with no sales are left out. Most first, then by tag.",
      hint: "Join products, json_each and sales; group by the tag.",
      solution: "SELECT t.value AS tag, SUM(s.quantity) AS items\nFROM products p, json_each(p.details, '$.tags') AS t\nJOIN sales s ON s.product_id = p.id\nGROUP BY tag\nORDER BY items DESC, tag;",
    }),
    query('expert', 'Tags in each category', {
      prompt: "For each category with tagged products, show `category` and how many different tags its products have (`tags`). Most first, then by category.",
      hint: '`COUNT(DISTINCT t.value)`, grouped by category.',
      solution: "SELECT c.name AS category, COUNT(DISTINCT t.value) AS tags\nFROM products p\nJOIN categories c ON c.id = p.category_id,\n     json_each(p.details, '$.tags') AS t\nGROUP BY c.id, c.name\nORDER BY tags DESC, category;",
    }),
  ],
  questions: [
    mc("What does `json_array_length(details, '$.tags')` give for `[\"a\",\"b\"]`?", ['0', '"a"', '2', '1'], 2,
      'The number of elements.'),
    mc('What kind of function is json_each?', ['A table-valued function: it goes in FROM and gives rows', 'A window function', 'A view', 'An aggregate'], 0,
      'One row per element.'),
    mc('Which column of json_each holds the element itself?', ['path', 'key', 'type', 'value'], 3,
      'key is its position in an array.'),
    mc('What rows does json_each give for an empty array?', ['One NULL row', 'An error', 'One row with []', 'None'], 3,
      'So a product with no tags drops out of the join.'),
    qShort("Which aggregate collects a group's values into one JSON array?", 'json_group_array',
      '`json_group_array(name)`.'),
    mc("How do you find products with the tag 'easy'?", ["WHERE tags = 'easy'", "WHERE details LIKE 'easy'", "json_extract(details, '$.easy')", "EXISTS (SELECT 1 FROM json_each(details, '$.tags') WHERE value = 'easy')"], 3,
      'LIKE on the whole text could also match "easy" inside another word or key.'),
    mc('How do you control the order of values in json_group_array?', ['It always sorts', 'Sort the rows in a subquery first', 'Add DESC', 'You can\'t'], 1,
      'Values go in the order the rows arrive.'),
    mc("What does `json_group_object(name, price)` make?", ['Two arrays', 'One object, with each name as a key and its price as the value', 'A table', 'An array of names'], 1,
      'Per group, like any aggregate.'),
    mc('`FROM products p, json_each(p.details, \'$.tags\') AS t` joins each product to…', ['Its own tags', 'Every tag of every product', 'The first tag only', 'Nothing'], 0,
      'json_each reads from the current product row.'),
    mc('Once tags are rows, can you GROUP BY them?', ['Only in a view', 'Yes, like any column', 'No', 'Only with DISTINCT'], 1,
      'That is the point of turning them into rows.'),
  ],
})
