// Querying a table: LIMIT and DISTINCT.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { QUERYING_DB } from '../databases.mjs'

export default makeTopic({
  id: 'limit_distinct',
  title: 'LIMIT and DISTINCT',
  database: QUERYING_DB,
  paragraphs: [
    '`LIMIT` keeps only the first few rows of a result. Together with `ORDER BY`, it answers "top" questions, such as the three most expensive products:',
    '```\nSELECT name, price FROM products ORDER BY price DESC LIMIT 3;\n```',
    'Without `ORDER BY`, "the first 3 rows" could be any 3 rows, so always sort before you limit.',
    '`OFFSET` skips rows before the limit starts. `LIMIT 5 OFFSET 5` gives rows 6 to 10, which is how apps show results page by page.',
    '```\nSELECT title FROM books ORDER BY title LIMIT 5 OFFSET 5;\n```',
    '`DISTINCT` removes repeated rows from a result. It goes straight after `SELECT`:',
    '```\nSELECT DISTINCT species FROM pets;\n```',
    'With several columns, `DISTINCT` removes rows where **all** the columns repeat, so `SELECT DISTINCT species, owner` lists each combination once.',
    'The full order of the clauses is now `SELECT` (`DISTINCT`) … `FROM` … `WHERE` … `ORDER BY` … `LIMIT` … `OFFSET` ….',
  ],
  sandboxCode: 'SELECT name, price FROM products ORDER BY price DESC LIMIT 3;',
  sandboxSnippets: [
    snippet('Top 3', 'SELECT name, price FROM products ORDER BY price DESC LIMIT 3;'),
    snippet('Page 2', 'SELECT title FROM books ORDER BY title LIMIT 5 OFFSET 5;'),
    snippet('Each species once', 'SELECT DISTINCT species FROM pets;'),
    snippet('Sorted genres', 'SELECT DISTINCT genre FROM books ORDER BY genre;'),
    snippet('Combinations', 'SELECT DISTINCT species, owner FROM pets ORDER BY species;'),
  ],
  readMore: { label: 'SQLite: LIMIT and OFFSET', url: 'https://www.sqlite.org/lang_select.html#limitoffset', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Top three', {
      prompt: 'Show the `name` and `price` of the three most expensive products, most expensive first.',
      hint: '`ORDER BY price DESC LIMIT 3`.',
      solution: 'SELECT name, price FROM products ORDER BY price DESC LIMIT 3;',
    }),
    query('easy', 'Every species once', {
      prompt: 'Show each `species` in the `pets` table once.',
      hint: '`SELECT DISTINCT species FROM pets;`',
      solution: 'SELECT DISTINCT species FROM pets;',
    }),
    query('easy', 'The oldest book', {
      prompt: 'Show the `title` and `year` of the oldest book (one row).',
      hint: 'Sort oldest first, then keep one row: `ORDER BY year LIMIT 1`.',
      solution: 'SELECT title, year FROM books ORDER BY year LIMIT 1;',
    }),
    query('medium', 'Genres A to Z', {
      prompt: 'Show each book `genre` once, in alphabetical order.',
      hint: '`SELECT DISTINCT genre FROM books ORDER BY genre;`',
      solution: 'SELECT DISTINCT genre FROM books ORDER BY genre;',
    }),
    query('medium', 'The two youngest', {
      prompt: 'Show the `name` and `age` of the two youngest pets, youngest first. Pets of the same age go in name order.',
      hint: '`ORDER BY age, name LIMIT 2`.',
      solution: 'SELECT name, age FROM pets ORDER BY age, name LIMIT 2;',
    }),
    query('medium', 'Page two', {
      prompt: 'With the books in title order (A to Z), show the `title` of books 6 to 10: skip the first five and show the next five.',
      hint: '`ORDER BY title LIMIT 5 OFFSET 5`.',
      solution: 'SELECT title FROM books ORDER BY title LIMIT 5 OFFSET 5;',
    }),
    query('hard', 'Categories in stock', {
      prompt: 'Show each `category` that has at least one product in stock (stock above 0) once, in alphabetical order.',
      hint: '`SELECT DISTINCT category ... WHERE stock > 0 ORDER BY category`.',
      solution: 'SELECT DISTINCT category FROM products WHERE stock > 0 ORDER BY category;',
    }),
    query('hard', 'Who owns what', {
      prompt: 'For the pets that have an owner, show each combination of `owner` and `species` once.',
      hint: '`SELECT DISTINCT owner, species FROM pets WHERE owner IS NOT NULL;`',
      solution: 'SELECT DISTINCT owner, species FROM pets WHERE owner IS NOT NULL;',
    }),
    query('expert', 'Cheapest sci-fi or fantasy', {
      prompt: 'Show the `title` and `price` of the two cheapest books in `Science Fiction` or `Fantasy`, cheapest first.',
      hint: "Filter, sort, then limit: `WHERE genre IN (...) ORDER BY price LIMIT 2`.",
      solution: "SELECT title, price FROM books\nWHERE genre IN ('Science Fiction', 'Fantasy')\nORDER BY price LIMIT 2;",
    }),
    query('expert', 'Third heaviest', {
      prompt: 'Show the `name` and `weight_kg` of the third heaviest pet (one row).',
      hint: 'Heaviest first, skip two, keep one: `ORDER BY weight_kg DESC LIMIT 1 OFFSET 2`.',
      solution: 'SELECT name, weight_kg FROM pets ORDER BY weight_kg DESC LIMIT 1 OFFSET 2;',
    }),
  ],
  questions: [
    mc('What does `LIMIT 3` do?', ['Keeps only the first 3 rows', 'Keeps rows with 3 columns', 'Skips 3 rows', 'Repeats the query 3 times'], 0,
      'LIMIT keeps at most that many rows of the result.'),
    mc('Why use ORDER BY with LIMIT?', ['LIMIT needs it to run', 'It is faster', 'Without it, "the first rows" could be any rows', 'It removes duplicates'], 2,
      'Without a sort order, the database may return any rows first.'),
    mc('What does `LIMIT 5 OFFSET 10` give?', ['Rows 5 to 10', 'Rows 11 to 15', 'Rows 10 to 15', 'The first 15 rows'], 1,
      'OFFSET 10 skips ten rows, then LIMIT 5 keeps the next five: rows 11 to 15.'),
    qShort('Which keyword, written right after SELECT, removes repeated rows?', 'DISTINCT',
      '`SELECT DISTINCT` shows each different row once.'),
    mc('`SELECT DISTINCT species, owner` removes rows where…', ['the species repeats', 'the owner repeats', 'either column repeats', 'both columns repeat together'], 3,
      'DISTINCT looks at the whole row, so a row is removed only if every column matches another row.'),
    mc('Where does LIMIT go?', ['After ORDER BY', 'Before WHERE', 'Right after SELECT', 'Before FROM'], 0,
      'LIMIT comes at the end, after ORDER BY.'),
    mc('Which query finds the cheapest product?', ['`SELECT name FROM products LIMIT 1;`', '`SELECT name FROM products ORDER BY price DESC LIMIT 1;`', '`SELECT name FROM products ORDER BY price LIMIT 1;`', '`SELECT MIN name FROM products;`'], 2,
      'Sort cheapest first, then keep one row.'),
    mc('What does `SELECT DISTINCT genre FROM books` show?', ['Every book', 'Each genre once', 'The number of genres', 'The first genre'], 1,
      'Each different genre appears once.'),
    mc('How do you show the 2nd row only, after sorting?', ['`LIMIT 2`', '`OFFSET 2`', '`LIMIT 2 OFFSET 1`', '`LIMIT 1 OFFSET 1`'], 3,
      'Skip one row, then keep one.'),
    mc('Where does DISTINCT go?', ['Right after SELECT', 'After FROM', 'At the end', 'After WHERE'], 0,
      'It is written straight after SELECT: `SELECT DISTINCT …`.'),
  ],
})
