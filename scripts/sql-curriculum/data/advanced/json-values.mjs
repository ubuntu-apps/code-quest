// Advanced queries: JSON values in a column.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { ADVANCED_DB } from '../advanced-db.mjs'

const DETAILS = ['The products table has the right details', 'SELECT id, details FROM products ORDER BY id']

export default makeTopic({
  id: 'json_values',
  title: 'JSON in a column',
  database: ADVANCED_DB,
  paragraphs: [
    'Products are not all alike: plants have a colour, a height and care needs, tools have a material. Instead of a column for every possible fact, `products.details` holds them as **JSON** text, such as `{"colour":"purple","height_cm":45,"tags":["scented","sun"],"care":{"water":"low","light":"sun"}}`.',
    "`json_extract(details, '$.colour')` reads one value. The **path** starts at `$`, the whole value; `.colour` picks a key, `.care.water` goes inside an object, and `[0]` picks from an array: `$.tags[0]` is the first tag.",
    "```\nSELECT name,\n       json_extract(details, '$.colour') AS colour,\n       json_extract(details, '$.care.water') AS water,\n       json_extract(details, '$.tags[0]') AS first_tag\nFROM products\nORDER BY name;\n```",
    "A key that isn't there gives NULL, and so does NULL details, so tools simply have no colour. Numbers come back as numbers and text as text, so you can compare, sort and do sums with them. (Newer SQLite also has a short form, `details ->> '$.colour'`.)",
    "JSON can be built too. `json_object('name', name, 'price', price)` makes an object from pairs of keys and values, and `json_array(1, 2)` makes an array.",
    "To change one value inside the JSON, UPDATE the column with `json_set(details, '$.colour', 'red')`, which returns the JSON with that key set (added if it was missing). `json_remove(details, '$.tags')` returns it with a key taken out.",
  ],
  sandboxCode: "SELECT name,\n       json_extract(details, '$.colour') AS colour,\n       json_extract(details, '$.care.water') AS water,\n       json_extract(details, '$.tags[0]') AS first_tag\nFROM products\nORDER BY name;",
  sandboxSnippets: [
    snippet('Read values', "SELECT name,\n       json_extract(details, '$.colour') AS colour,\n       json_extract(details, '$.care.water') AS water,\n       json_extract(details, '$.tags[0]') AS first_tag\nFROM products\nORDER BY name;"),
    snippet('Build JSON', "SELECT json_object('name', name, 'price', price) AS item\nFROM products\nORDER BY name;"),
    snippet('Set a value', "UPDATE products SET details = json_set(details, '$.colour', 'red') WHERE id = 1;\nSELECT name, details FROM products WHERE id = 1;"),
  ],
  readMore: { label: 'SQLite: JSON functions', url: 'https://www.sqlite.org/json1.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Colours', {
      prompt: "Show the `name` and `colour` of every product that has a colour in its details. Sort by name.",
      hint: "`json_extract(details, '$.colour') AS colour … WHERE colour IS NOT NULL`.",
      solution: "SELECT name, json_extract(details, '$.colour') AS colour\nFROM products\nWHERE json_extract(details, '$.colour') IS NOT NULL\nORDER BY name;",
    }),
    query('easy', 'Tallest first', {
      prompt: "Show the `name` and `height_cm` of every product with a height, tallest first, then by name.",
      hint: "Heights are numbers in the JSON, so they sort as numbers.",
      solution: "SELECT name, json_extract(details, '$.height_cm') AS height_cm\nFROM products\nWHERE json_extract(details, '$.height_cm') IS NOT NULL\nORDER BY height_cm DESC, name;",
    }),
    query('easy', 'Watering', {
      prompt: "Show the `name` and `water` need (inside `care`) of every product that has one. Sort by name.",
      hint: "`json_extract(details, '$.care.water')`.",
      solution: "SELECT name, json_extract(details, '$.care.water') AS water\nFROM products\nWHERE json_extract(details, '$.care.water') IS NOT NULL\nORDER BY name;",
    }),
    query('medium', 'First tags', {
      prompt: "Show the `name` and first tag (`first_tag`) of every product with at least one tag. Sort by name.",
      hint: "`json_extract(details, '$.tags[0]')`: an empty array has no element 0, so it gives NULL.",
      solution: "SELECT name, json_extract(details, '$.tags[0]') AS first_tag\nFROM products\nWHERE json_extract(details, '$.tags[0]') IS NOT NULL\nORDER BY name;",
    }),
    query('medium', 'Out of the sun', {
      prompt: "Show the `name` and `light` need of the products whose light is `shade` or `part shade`. Sort by name.",
      hint: "`json_extract(details, '$.care.light') IN ('shade', 'part shade')`.",
      solution: "SELECT name, json_extract(details, '$.care.light') AS light\nFROM products\nWHERE json_extract(details, '$.care.light') IN ('shade', 'part shade')\nORDER BY name;",
    }),
    query('medium', 'By colour', {
      prompt: "For each colour, show `colour`, how many products have it (`products`) and their average price (`average_price`, 2 decimals). Leave out products without a colour. Sort by colour.",
      hint: "Group by the extracted colour.",
      solution: "SELECT json_extract(details, '$.colour') AS colour,\n       COUNT(*) AS products,\n       ROUND(AVG(price), 2) AS average_price\nFROM products\nWHERE json_extract(details, '$.colour') IS NOT NULL\nGROUP BY colour\nORDER BY colour;",
    }),
    query('hard', 'Build objects', {
      prompt: "For each product with a price, show `item`: a JSON object with its `name` and `price`, like `{\"name\":\"Hosta\",\"price\":8.0}`. Sort by name.",
      hint: "`json_object('name', name, 'price', price) AS item`.",
      solution: "SELECT json_object('name', name, 'price', price) AS item\nFROM products\nWHERE price IS NOT NULL\nORDER BY name;",
    }),
    query('hard', 'Water less', {
      prompt: "Change the details of every product whose water need is `low` so that it is `very low` instead. Leave the rest of the JSON as it is.",
      hint: "`UPDATE products SET details = json_set(details, '$.care.water', 'very low') WHERE json_extract(details, '$.care.water') = 'low';`",
      solution: "UPDATE products\nSET details = json_set(details, '$.care.water', 'very low')\nWHERE json_extract(details, '$.care.water') = 'low';",
      checks: [DETAILS],
    }),
    query('expert', 'Add a size', {
      prompt: "For every product with a `height_cm`, add a `size` key to its details: `small` under 50 cm, `medium` from 50 to 99, `large` from 100.",
      hint: "`json_set(details, '$.size', CASE WHEN … THEN 'small' … END)`, only where the height is not NULL.",
      solution: "UPDATE products\nSET details = json_set(details, '$.size',\n  CASE WHEN json_extract(details, '$.height_cm') < 50 THEN 'small'\n       WHEN json_extract(details, '$.height_cm') < 100 THEN 'medium'\n       ELSE 'large' END)\nWHERE json_extract(details, '$.height_cm') IS NOT NULL;",
      checks: [DETAILS],
    }),
    query('expert', 'Tidy empty tags', {
      prompt: "Some products have an empty `tags` array. Remove the `tags` key from their details, and leave the others alone.",
      hint: "`json_array_length(details, '$.tags') = 0` finds them; `json_remove(details, '$.tags')` takes the key out.",
      solution: "UPDATE products\nSET details = json_remove(details, '$.tags')\nWHERE json_array_length(details, '$.tags') = 0;",
      checks: [DETAILS],
    }),
  ],
  questions: [
    mc("What does `$` mean at the start of a JSON path?", ['The first key', 'The last array element', 'The whole JSON value', 'A dollar amount'], 2,
      'Keys and array positions follow it.'),
    mc("What does `json_extract(details, '$.care.water')` read?", ['The water key inside the care object', 'Every water key', 'The care array', 'The key named "care.water"'], 0,
      'Each dot goes one level in.'),
    mc("What does `'$.tags[0]'` pick?", ['Tag number 0 by name', 'The last tag', 'The number of tags', 'The first element of the tags array'], 3,
      'Arrays count from 0.'),
    mc('What does json_extract give for a key that isn\'t there?', ['An empty string', '0', 'NULL', 'An error'], 2,
      'And so it does for NULL details.'),
    qShort("Which function returns JSON with one value set, as in `…(details, '$.colour', 'red')`?", 'json_set',
      'Use it in an UPDATE to save the change.'),
    mc("What does `json_object('name', name, 'price', price)` make?", ['A table', 'An object with the keys name and price', 'An array of two values', 'Two columns'], 1,
      'Keys and values in pairs.'),
    mc('Does `json_set` change the table by itself?', ['Only inside a view', 'Only for arrays', 'Yes', 'No: it returns new JSON; UPDATE … SET details = json_set(…) saves it'], 3,
      'JSON functions work on values.'),
    mc('Can you sort by a number read from JSON?', ['Yes, json_extract returns numbers as numbers', 'Only for whole numbers', 'No, JSON is text', 'Only with CAST'], 0,
      'Text comes back as text, numbers as numbers.'),
    mc("What does `json_remove(details, '$.tags')` return?", ['The JSON without the tags key', 'NULL', 'The tags', 'An error if tags is empty'], 0,
      'Like json_set, it doesn\'t change the table on its own.'),
    mc('Why keep extra facts in a JSON column?', ['JSON is faster than columns', 'Columns can\'t hold text', 'To avoid primary keys', 'Products have different facts, and one column can hold any of them'], 3,
      'Use columns for facts every row has, JSON for the rest.'),
  ],
})
