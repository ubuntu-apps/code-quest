// Querying a table: Choosing columns.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { QUERYING_DB } from '../databases.mjs'

export default makeTopic({
  id: 'select_columns',
  title: 'Choosing columns',
  database: QUERYING_DB,
  paragraphs: [
    'To show several columns, list them after `SELECT`, separated by commas:',
    '```\nSELECT title, author, year FROM books;\n```',
    'The result has the columns in the order you list them, which doesn\'t have to be the order in the table. `SELECT year, title FROM books` puts the year first.',
    'Put a comma **between** columns, but not after the last one. A missing comma is a common mistake: `SELECT title author FROM books` doesn\'t give an error, but shows the title in a column called `author`. A comma before `FROM` gives `near "FROM": syntax error`.',
    '**Renaming a column.** `AS` gives a column a different name in the result. It doesn\'t change the table, only the heading you see:',
    '```\nSELECT name AS pet, species AS kind FROM pets;\n```',
    'A name with a space in it needs double quotes: `SELECT title AS "Book title" FROM books`. Text values use single quotes (next lesson); names use double quotes.',
    'Why not always use `*`? Naming the columns shows only what you need, in the order you want, and the query keeps giving the same columns even if someone adds a column to the table later.',
  ],
  sandboxCode: 'SELECT title, author, year FROM books;',
  sandboxSnippets: [
    snippet('Three columns', 'SELECT title, author, year FROM books;'),
    snippet('Another order', 'SELECT year, title FROM books;'),
    snippet('Renamed', 'SELECT name AS pet, species AS kind FROM pets;'),
    snippet('Name with spaces', 'SELECT title AS "Book title", price AS "Price in $" FROM books;'),
    snippet('Missing comma', '-- no error, but look at the heading\nSELECT title author FROM books;'),
  ],
  readMore: { label: 'SQLite: result columns', url: 'https://www.sqlite.org/lang_select.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Title and author', {
      prompt: 'Show the `title` and `author` of every book.',
      hint: 'List both columns with a comma between them: `SELECT title, author FROM books;`',
      solution: 'SELECT title, author FROM books;',
    }),
    query('easy', 'Name and species', {
      prompt: 'Show the `name` and `species` of every pet.',
      hint: '`SELECT name, species FROM pets;`',
      solution: 'SELECT name, species FROM pets;',
    }),
    query('easy', 'Name and price', {
      prompt: 'Show the `name` and `price` of every product.',
      hint: 'The table is `products`.',
      solution: 'SELECT name, price FROM products;',
    }),
    query('medium', 'Year first', {
      prompt: "Show each book's `year`, then its `title`: the year should be the first column.",
      hint: 'The result follows the order you list the columns in: `SELECT year, title ...`',
      solution: 'SELECT year, title FROM books;',
    }),
    query('medium', 'Rename a column', {
      prompt: "Show each pet's name, but call the column `pet`.",
      hint: 'Write `AS pet` after the column: `SELECT name AS pet FROM pets;`',
      solution: 'SELECT name AS pet FROM pets;',
    }),
    query('medium', 'Fix the commas', {
      prompt: 'This query should show the `name`, `price` and `stock` of every product. Fix it.',
      starter: 'SELECT name price stock FROM products;',
      hint: 'Columns need commas between them (and none after the last one).',
      solution: 'SELECT name, price, stock FROM products;',
    }),
    query('hard', 'Two new names', {
      prompt: 'Show every book\'s title in a column called `book` and its author in a column called `writer`.',
      hint: 'Each column gets its own `AS`: `SELECT title AS book, author AS writer FROM books;`',
      solution: 'SELECT title AS book, author AS writer FROM books;',
    }),
    query('hard', 'A name with a space', {
      prompt: 'Show the name of every product in a column called `Product name` (with the space).',
      hint: 'A name with a space goes in double quotes: `AS "Product name"`.',
      solution: 'SELECT name AS "Product name" FROM products;',
    }),
    query('expert', 'A pet card', {
      prompt: 'For every pet, show three columns: the name called `pet`, the owner called `owner_name`, and the age called `years`.',
      hint: '`SELECT name AS pet, owner AS owner_name, age AS years FROM pets;`',
      solution: 'SELECT name AS pet, owner AS owner_name, age AS years FROM pets;',
    }),
    query('expert', 'The same column twice', {
      prompt: "Show each product's `name` and `price`, and then the price again in a column called `old_price`.",
      hint: 'A column can appear more than once: `SELECT name, price, price AS old_price FROM products;`',
      solution: 'SELECT name, price, price AS old_price FROM products;',
    }),
  ],
  questions: [
    mc('How do you show the `title` and `year` of every book?', ['`SELECT title year FROM books;`', '`SELECT title, year FROM books;`', '`SELECT title AND year FROM books;`', '`SELECT (title, year) books;`'], 1,
      'Columns are listed with commas between them.'),
    mc('In which order do the columns of `SELECT year, title FROM books` appear?', ['title, then year', 'The order in the table', 'year, then title', 'Alphabetical order'], 2,
      'The result has the columns in the order they are listed in the query.'),
    mc('What does `AS` do in `SELECT name AS pet FROM pets`?', ['Renames the column in the result', 'Renames the column in the table', 'Filters the rows', 'Creates a new table'], 0,
      '`AS` only changes the heading in the result; the table is not changed.'),
    mc('What does `SELECT title author FROM books` show?', ['A syntax error', 'Two columns', 'Nothing', 'The titles, in a column called `author`'], 3,
      'Without a comma, `author` becomes the new name of the title column, which is easy to miss.'),
    mc('Which gives `near "FROM": syntax error`?', ['`SELECT title, author FROM books;`', '`SELECT title, author, FROM books;`', '`SELECT title FROM books;`', '`SELECT * FROM books;`'], 1,
      'A comma after the last column means SQLite expects another column, but finds `FROM`.'),
    mc('What is the standard way to name a column `Book title`, with a space?', ['`AS \'Book title\'`', '`AS Book title`', '`AS "Book title"`', '`AS (Book title)`'], 2,
      'Names with spaces go in double quotes; single quotes are for text values. (SQLite also accepts single quotes here, but that is not standard.)'),
    qShort('Which keyword renames a column in the result?', 'AS',
      '`AS` gives a column a new name in the result.'),
    mc('Why name columns instead of using `*`?', ['It shows only what you need, in your order', 'It is the only way to read text columns', 'Queries with `*` are not allowed', 'It makes the table smaller'], 0,
      'Naming columns keeps results focused and stable, even if the table gains columns later.'),
    mc('Can the same column appear twice in a SELECT?', ['No, it gives an error', 'Only with `*`', 'Only in different tables', 'Yes, for example once renamed'], 3,
      'A column can be listed more than once; renaming the copy makes the result clearer.'),
    mc('Does renaming a column with `AS` change the table?', ['Yes, permanently', 'No, only the result', 'Only until the next query', 'Only for numbers'], 1,
      'The table stays as it is. `AS` only affects the result of that query.'),
  ],
})
