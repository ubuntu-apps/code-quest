// Querying a table: IN and BETWEEN.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { QUERYING_DB } from '../databases.mjs'

export default makeTopic({
  id: 'in_between',
  title: 'IN and BETWEEN',
  database: QUERYING_DB,
  paragraphs: [
    '`IN` checks a value against a list. It is a shorter way to write several `OR`s:',
    "```\nSELECT title, genre FROM books\nWHERE genre IN ('Fantasy', 'Horror', 'Mystery');\n```",
    "That is the same as `genre = 'Fantasy' OR genre = 'Horror' OR genre = 'Mystery'`. The list goes in brackets, with commas between the values.",
    '`NOT IN` keeps the rows whose value is **not** in the list.',
    '`BETWEEN` checks a range. **Both ends are included**: `BETWEEN 1900 AND 1999` keeps 1900 and 1999 too.',
    '```\nSELECT title, year FROM books WHERE year BETWEEN 1900 AND 1999;\n```',
    'It is the same as `year >= 1900 AND year <= 1999`. `NOT BETWEEN` keeps the values outside the range. Write the smaller value first: `BETWEEN 1999 AND 1900` matches nothing.',
    "`BETWEEN` works for text too, in alphabetical order: `name BETWEEN 'A' AND 'D'` keeps names from A up to the single letter D, so `Daisy` is left out (it comes after `'D'`).",
    '`IN` and `BETWEEN` combine with `AND` and `OR` like any other condition.',
  ],
  sandboxCode: "SELECT title, genre FROM books\nWHERE genre IN ('Fantasy', 'Horror', 'Mystery');",
  sandboxSnippets: [
    snippet('IN', "SELECT title, genre FROM books\nWHERE genre IN ('Fantasy', 'Horror', 'Mystery');"),
    snippet('NOT IN', "SELECT name, category FROM products\nWHERE category NOT IN ('stationery', 'kitchen');"),
    snippet('BETWEEN', 'SELECT title, year FROM books WHERE year BETWEEN 1900 AND 1999;'),
    snippet('Both ends count', 'SELECT name, price FROM products WHERE price BETWEEN 4.25 AND 12;'),
    snippet('Letters', "SELECT name FROM pets WHERE name BETWEEN 'A' AND 'D';"),
  ],
  readMore: { label: 'SQLite: IN and BETWEEN', url: 'https://www.sqlite.org/lang_expr.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Three genres', {
      prompt: 'Show the `title` and `genre` of the books whose genre is `Fantasy`, `Horror` or `Mystery`. Use `IN`.',
      hint: "`WHERE genre IN ('Fantasy', 'Horror', 'Mystery')`.",
      solution: "SELECT title, genre FROM books WHERE genre IN ('Fantasy', 'Horror', 'Mystery');",
    }),
    query('easy', 'Twentieth century', {
      prompt: 'Show the `title` and `year` of books published from 1900 to 1999 (both included). Use `BETWEEN`.',
      hint: '`WHERE year BETWEEN 1900 AND 1999`.',
      solution: 'SELECT title, year FROM books WHERE year BETWEEN 1900 AND 1999;',
    }),
    query('easy', 'Small animals', {
      prompt: 'Show the `name` and `species` of the hamsters, rabbits and parrots.',
      hint: "`WHERE species IN ('hamster', 'rabbit', 'parrot')`.",
      solution: "SELECT name, species FROM pets WHERE species IN ('hamster', 'rabbit', 'parrot');",
    }),
    query('medium', 'Not stationery or bags', {
      prompt: 'Show the `name` and `category` of every product that is not in the `stationery` or `bags` category.',
      hint: "`WHERE category NOT IN ('stationery', 'bags')`.",
      solution: "SELECT name, category FROM products WHERE category NOT IN ('stationery', 'bags');",
    }),
    query('medium', 'Mid-priced', {
      prompt: 'Show the `name` and `price` of products that cost from 5 to 15, both included.',
      hint: '`WHERE price BETWEEN 5 AND 15`.',
      solution: 'SELECT name, price FROM products WHERE price BETWEEN 5 AND 15;',
    }),
    query('medium', 'Medium-length books', {
      prompt: 'Show the `title` and `pages` of books with 250 to 320 pages, both included.',
      hint: '`BETWEEN 250 AND 320` includes both ends.',
      solution: 'SELECT title, pages FROM books WHERE pages BETWEEN 250 AND 320;',
    }),
    query('hard', "Ana's and Ben's pets", {
      prompt: 'Show the `name` and `owner` of the pets owned by `Ana` or `Ben`.',
      hint: "`WHERE owner IN ('Ana', 'Ben')`.",
      solution: "SELECT name, owner FROM pets WHERE owner IN ('Ana', 'Ben');",
    }),
    query('hard', 'Outside the range', {
      prompt: 'Show the `name` and `age` of pets whose age is not from 2 to 8.',
      hint: '`WHERE age NOT BETWEEN 2 AND 8`.',
      solution: 'SELECT name, age FROM pets WHERE age NOT BETWEEN 2 AND 8;',
    }),
    query('expert', 'Classic sci-fi and fantasy', {
      prompt: 'Show the `title` and `year` of the `Science Fiction` and `Fantasy` books published from 1960 to 1990.',
      hint: "`WHERE genre IN ('Science Fiction', 'Fantasy') AND year BETWEEN 1960 AND 1990`.",
      solution: "SELECT title, year FROM books\nWHERE genre IN ('Science Fiction', 'Fantasy') AND year BETWEEN 1960 AND 1990;",
    }),
    query('expert', 'Cheap, and not electronics', {
      prompt: 'Show the `name`, `category` and `price` of products that are not `electronics` and cost from 2 to 10.',
      hint: "`WHERE category <> 'electronics' AND price BETWEEN 2 AND 10`.",
      solution: "SELECT name, category, price FROM products\nWHERE category <> 'electronics' AND price BETWEEN 2 AND 10;",
    }),
  ],
  questions: [
    mc("`genre IN ('Horror', 'Mystery')` is the same as…", ["`genre = 'Horror' AND genre = 'Mystery'`", "`genre = 'Horror' OR genre = 'Mystery'`", "`genre BETWEEN 'Horror' AND 'Mystery'`", "`genre = 'Horror, Mystery'`"], 1,
      'IN is a shorter way to write several ORs on the same column.'),
    mc('Does `year BETWEEN 1900 AND 1999` include 1999?', ['No, only up to 1998', 'Only for text', 'Yes, both ends are included', 'Only with `=`'], 2,
      'BETWEEN includes both ends of the range.'),
    mc('`price BETWEEN 5 AND 15` is the same as…', ['`price >= 5 AND price <= 15`', '`price > 5 AND price < 15`', '`price >= 5 OR price <= 15`', '`price IN (5, 15)`'], 0,
      'Both ends are included, so the comparisons are `>=` and `<=`.'),
    mc('Which keeps the rows whose value is not in the list?', ["`IN NOT ('a', 'b')`", "`NOT ('a', 'b')`", "`!IN ('a', 'b')`", "`NOT IN ('a', 'b')`"], 3,
      '`NOT IN` keeps the values that are not in the list.'),
    mc('What does `age BETWEEN 8 AND 2` return?', ['Ages 2 to 8', 'No rows', 'An error', 'Every row'], 1,
      'With the larger value first, no number can be both ≥ 8 and ≤ 2.'),
    qShort('Which keyword checks a value against a list in brackets?', 'IN',
      '`IN (…)` is true when the value is one of those in the list.'),
    mc("Does `name BETWEEN 'A' AND 'D'` keep `Daisy`?", ["No: 'Daisy' comes after 'D' alphabetically", 'Yes, D is included', 'Only in SQLite', 'Text can\'t use BETWEEN'], 0,
      "Alphabetically, 'D' comes before 'Daisy', so the range stops just before it."),
    mc('How is the list in `IN` written?', ['Without brackets', 'With semicolons between the values', 'In brackets, with commas between the values', 'One value only'], 2,
      'The values go in round brackets, separated by commas.'),
    mc('Which finds pets aged 1, 2 or 3?', ['`age IN 1, 2, 3`', '`age BETWEEN 1 OR 3`', '`age = (1, 2, 3)`', '`age BETWEEN 1 AND 3`'], 3,
      '`age BETWEEN 1 AND 3` (or `age IN (1, 2, 3)`) works; the others are not valid.'),
    mc('Can IN and BETWEEN be combined with AND?', ['Yes, like any other condition', 'No, only one per query', 'Only IN', 'Only with brackets'], 0,
      'They are ordinary conditions, so AND, OR and NOT work with them.'),
  ],
})
