// Querying a table: Combining conditions with AND, OR and NOT.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { QUERYING_DB } from '../databases.mjs'

export default makeTopic({
  id: 'and_or_not',
  title: 'AND, OR and NOT',
  database: QUERYING_DB,
  paragraphs: [
    'One condition is often not enough. `AND` keeps a row only when **both** conditions are true:',
    "```\nSELECT name, age FROM pets WHERE species = 'dog' AND age < 5;\n```",
    '`OR` keeps a row when **either** condition is true (or both):',
    "```\nSELECT name, species FROM pets WHERE species = 'cat' OR species = 'rabbit';\n```",
    "Each side must be a complete condition. `species = 'cat' OR 'rabbit'` doesn't do what it seems to; repeat the column: `species = 'cat' OR species = 'rabbit'`.",
    "`NOT` turns a condition around: `WHERE NOT genre = 'Fantasy'` keeps every book that isn't fantasy (the same as `genre <> 'Fantasy'`).",
    '**Brackets matter.** `AND` is worked out before `OR`, just as `*` comes before `+` in maths. So this query, meant to find cats and dogs older than 5, also lists every dog of any age:',
    "```\nSELECT name, species, age FROM pets\nWHERE species = 'dog' OR species = 'cat' AND age > 5;\n```",
    "SQLite reads it as `species = 'dog' OR (species = 'cat' AND age > 5)`. Brackets make it say what you mean:",
    "```\nSELECT name, species, age FROM pets\nWHERE (species = 'dog' OR species = 'cat') AND age > 5;\n```",
    'When a condition mixes `AND` and `OR`, add brackets even where they aren\'t needed: the query is easier to read and to get right.',
  ],
  sandboxCode: "SELECT name, age FROM pets WHERE species = 'dog' AND age < 5;",
  sandboxSnippets: [
    snippet('AND', "SELECT name, age FROM pets WHERE species = 'dog' AND age < 5;"),
    snippet('OR', "SELECT name, species FROM pets WHERE species = 'cat' OR species = 'rabbit';"),
    snippet('NOT', "SELECT title, genre FROM books WHERE NOT genre = 'Fantasy';"),
    snippet('Without brackets', "SELECT name, species, age FROM pets\nWHERE species = 'dog' OR species = 'cat' AND age > 5;"),
    snippet('With brackets', "SELECT name, species, age FROM pets\nWHERE (species = 'dog' OR species = 'cat') AND age > 5;"),
  ],
  readMore: { label: 'SQLite: operators and their order', url: 'https://www.sqlite.org/lang_expr.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Young dogs', {
      prompt: 'Show the `name` of the dogs younger than 5.',
      hint: "Join the two conditions with AND: `WHERE species = 'dog' AND age < 5`.",
      solution: "SELECT name FROM pets WHERE species = 'dog' AND age < 5;",
    }),
    query('easy', 'Cats or rabbits', {
      prompt: 'Show the `name` and `species` of every cat and every rabbit.',
      hint: "A pet can't be both, so it's OR: `species = 'cat' OR species = 'rabbit'`.",
      solution: "SELECT name, species FROM pets WHERE species = 'cat' OR species = 'rabbit';",
    }),
    query('easy', 'Cheap stationery', {
      prompt: 'Show the `name` and `price` of products in the `stationery` category that cost less than 4.',
      hint: "`WHERE category = 'stationery' AND price < 4`.",
      solution: "SELECT name, price FROM products WHERE category = 'stationery' AND price < 4;",
    }),
    query('medium', 'Not fantasy', {
      prompt: 'Use `NOT` to show the `title` and `genre` of every book that is not `Fantasy`.',
      hint: "`WHERE NOT genre = 'Fantasy'`.",
      solution: "SELECT title, genre FROM books WHERE NOT genre = 'Fantasy';",
    }),
    query('medium', 'Long and old', {
      prompt: 'Show the `title`, `year` and `pages` of books published before 1900 that have more than 400 pages.',
      hint: 'Two conditions that must both be true: `year < 1900 AND pages > 400`.',
      solution: 'SELECT title, year, pages FROM books WHERE year < 1900 AND pages > 400;',
    }),
    query('medium', 'Electronics in stock', {
      prompt: 'Show the `name` and `stock` of the `electronics` products that are in stock (stock above 0).',
      hint: "`WHERE category = 'electronics' AND stock > 0`.",
      solution: "SELECT name, stock FROM products WHERE category = 'electronics' AND stock > 0;",
    }),
    query('hard', 'Fix the brackets', {
      prompt: 'This query should list the dogs and cats that are older than 5, but it also lists young dogs. Fix it.',
      starter: "SELECT name, species, age FROM pets\nWHERE species = 'dog' OR species = 'cat' AND age > 5;",
      hint: 'AND is worked out before OR. Put brackets around the two species conditions.',
      solution: "SELECT name, species, age FROM pets\nWHERE (species = 'dog' OR species = 'cat') AND age > 5;",
    }),
    query('hard', 'Either way', {
      prompt: 'Show the `title` of every book that is by `Agatha Christie` or has more than 450 pages.',
      hint: "`WHERE author = 'Agatha Christie' OR pages > 450`.",
      solution: "SELECT title FROM books WHERE author = 'Agatha Christie' OR pages > 450;",
    }),
    query('expert', 'Kitchen or home, over 10', {
      prompt: 'Show the `name`, `category` and `price` of products in the `kitchen` or `home` category that cost more than 10.',
      hint: "Brackets around the OR: `(category = 'kitchen' OR category = 'home') AND price > 10`.",
      solution: "SELECT name, category, price FROM products\nWHERE (category = 'kitchen' OR category = 'home') AND price > 10;",
    }),
    query('expert', 'Small, and not dogs', {
      prompt: 'Using `NOT`, show the `name` and `species` of the pets that are not dogs and weigh under 5 kg.',
      hint: "`WHERE NOT species = 'dog' AND weight_kg < 5`. NOT applies to the condition right after it.",
      solution: "SELECT name, species FROM pets WHERE NOT species = 'dog' AND weight_kg < 5;",
    }),
  ],
  questions: [
    mc('When does `WHERE a OR b` keep a row?', ['When at least one condition is true', 'Only when both are true', 'Only when exactly one is true', 'Never'], 0,
      '`OR` keeps the row if either condition (or both) is true.'),
    mc('Which part is worked out first in `a OR b AND c`?', ['`a OR b`', 'Left to right', '`b AND c`', 'They are the same'], 2,
      '`AND` comes before `OR`, so it is `a OR (b AND c)`.'),
    mc('Which finds cats and rabbits?', ["`species = 'cat' AND species = 'rabbit'`", "`species = 'cat' OR 'rabbit'`", "`species = 'cat', 'rabbit'`", "`species = 'cat' OR species = 'rabbit'`"], 3,
      'Each side of OR must be a full condition, and a pet can\'t be both, so AND would find none.'),
    mc("`WHERE NOT genre = 'Fantasy'` is the same as…", ["`WHERE genre <> 'Fantasy'`", "`WHERE genre = 'NOT Fantasy'`", "`WHERE genre = 'Fantasy'`", 'Nothing: NOT is not SQL'], 0,
      'NOT turns the condition around, so it keeps rows whose genre isn\'t Fantasy.'),
    qShort('Which keyword keeps a row only when both conditions are true?', 'AND',
      '`AND` combines two conditions that must both be true.'),
    mc('How do you find dogs and cats older than 5?', ["`species = 'dog' OR species = 'cat' AND age > 5`", "`(species = 'dog' OR species = 'cat') AND age > 5`", "`species = 'dog' AND species = 'cat' AND age > 5`", "`species = 'dog' OR 'cat' > 5`"], 1,
      'Brackets make the OR happen first; then AND applies the age to both species.'),
    mc("What does `WHERE species = 'dog' AND species = 'cat'` return?", ['Every dog and cat', 'Only dogs', 'An error', 'No rows'], 3,
      'A pet can\'t be a dog and a cat at once, so no row matches.'),
    mc('Why add brackets even where they aren\'t needed?', ['They make the query run faster', 'SQL requires them with AND', 'They make the meaning clear to readers', 'They change the result'], 2,
      'Brackets that match the usual order don\'t change the result, but they make the intent obvious.'),
    mc('`NOT` applies to…', ['The condition right after it', 'The whole WHERE clause', 'Only text columns', 'The SELECT list'], 0,
      'NOT turns around the condition that follows it; use brackets to apply it to more.'),
  ],
})
