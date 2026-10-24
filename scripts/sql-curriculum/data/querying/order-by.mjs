// Querying a table: Sorting with ORDER BY.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { QUERYING_DB } from '../databases.mjs'

export default makeTopic({
  id: 'order_by',
  title: 'Sorting with ORDER BY',
  database: QUERYING_DB,
  paragraphs: [
    "Without instructions, a database may return rows in any order. Often it is the order they were added, but you can't rely on that. `ORDER BY` sorts the result:",
    '```\nSELECT title, year FROM books ORDER BY year;\n```',
    'The order is **ascending** (smallest first, A to Z) unless you say otherwise. Add `DESC` for **descending** order, largest first. (`ASC` asks for ascending order explicitly.)',
    '```\nSELECT name, price FROM products ORDER BY price DESC;\n```',
    'Sort by several columns by listing them: the second column only decides the order of rows that are equal in the first. Each column can have its own `DESC`:',
    '```\nSELECT title, genre, year FROM books ORDER BY genre, year DESC;\n```',
    "You can sort by a column you don't show, and by a name you gave a column with `AS`. Text sorts alphabetically, with capital letters before lower-case ones; in ascending order, `NULL` comes first.",
    '`ORDER BY` goes after `WHERE`: `SELECT` … `FROM` … `WHERE` … `ORDER BY` ….',
    'When two rows tie on every sort column, their order is not fixed. If the order matters, add another column to break ties, such as `ORDER BY price, name`.',
  ],
  sandboxCode: 'SELECT title, year FROM books ORDER BY year;',
  sandboxSnippets: [
    snippet('Oldest first', 'SELECT title, year FROM books ORDER BY year;'),
    snippet('Most expensive first', 'SELECT name, price FROM products ORDER BY price DESC;'),
    snippet('Two columns', 'SELECT title, genre, year FROM books ORDER BY genre, year DESC;'),
    snippet('Filter, then sort', "SELECT name, age FROM pets WHERE species = 'cat' ORDER BY age;"),
    snippet('NULL comes first', 'SELECT title, rating FROM books ORDER BY rating;'),
  ],
  readMore: { label: 'SQLite: ORDER BY', url: 'https://www.sqlite.org/lang_select.html#orderby', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Oldest first', {
      prompt: 'Show the `title` and `year` of every book, oldest first.',
      hint: '`ORDER BY year` sorts from the smallest year up.',
      solution: 'SELECT title, year FROM books ORDER BY year;',
    }),
    query('easy', 'Most expensive first', {
      prompt: 'Show the `name` and `price` of every product, most expensive first.',
      hint: '`ORDER BY price DESC`.',
      solution: 'SELECT name, price FROM products ORDER BY price DESC;',
    }),
    query('easy', 'A to Z', {
      prompt: 'Show the `name` of every pet in alphabetical order.',
      hint: '`ORDER BY name`.',
      solution: 'SELECT name FROM pets ORDER BY name;',
    }),
    query('medium', 'Heaviest pets', {
      prompt: 'Show the `name` and `weight_kg` of every pet, heaviest first.',
      hint: '`ORDER BY weight_kg DESC`.',
      solution: 'SELECT name, weight_kg FROM pets ORDER BY weight_kg DESC;',
    }),
    query('medium', 'Dogs by age', {
      prompt: 'Show the `name` and `age` of the dogs, youngest first.',
      hint: "`WHERE species = 'dog'`, then `ORDER BY age`.",
      solution: "SELECT name, age FROM pets WHERE species = 'dog' ORDER BY age;",
    }),
    query('medium', 'Longest first', {
      prompt: 'Show only the `title` of every book, from the most pages to the fewest. Books with the same number of pages go in title order.',
      hint: 'Sort by a column you don\'t show, with a tie-breaker: `ORDER BY pages DESC, title`.',
      solution: 'SELECT title FROM books ORDER BY pages DESC, title;',
    }),
    query('hard', 'By genre, then year', {
      prompt: 'Show the `title`, `genre` and `year` of every book, sorted by genre (A to Z) and, within each genre, oldest first.',
      hint: '`ORDER BY genre, year`.',
      solution: 'SELECT title, genre, year FROM books ORDER BY genre, year;',
    }),
    query('hard', 'Category, then price', {
      prompt: 'Show the `name`, `category` and `price` of every product, sorted by category (A to Z) and, within each category, most expensive first.',
      hint: 'Each column has its own direction: `ORDER BY category, price DESC`.',
      solution: 'SELECT name, category, price FROM products ORDER BY category, price DESC;',
    }),
    query('expert', "Owners' pets", {
      prompt: 'For the pets that have an owner, show `owner`, `name` and `age`, sorted by owner (A to Z) and then oldest pet first.',
      hint: '`WHERE owner IS NOT NULL ORDER BY owner, age DESC`.',
      solution: 'SELECT owner, name, age FROM pets WHERE owner IS NOT NULL ORDER BY owner, age DESC;',
    }),
    query('expert', 'Sort by a new name', {
      prompt: 'Show each book\'s `title` and its price in a column called `cost`, cheapest first. Books with the same price go in title order. Use the name `cost` in ORDER BY.',
      hint: '`SELECT title, price AS cost FROM books ORDER BY cost, title;`',
      solution: 'SELECT title, price AS cost FROM books ORDER BY cost, title;',
    }),
  ],
  questions: [
    mc('Without ORDER BY, in which order do rows come?', ['Alphabetical', 'No guaranteed order', 'Newest first', 'By the first column'], 1,
      'A database may return rows in any order unless you ask for one.'),
    mc('What is the default direction of `ORDER BY`?', ['Ascending: smallest first, A to Z', 'Descending', 'Random', 'The table\'s order'], 0,
      'ORDER BY sorts ascending unless you add DESC.'),
    qShort('Which keyword sorts from largest to smallest?', 'DESC',
      '`DESC` means descending: largest first, Z to A.'),
    mc('In `ORDER BY genre, year`, what does `year` do?', ['Nothing', 'It is sorted first', 'It replaces genre', 'It orders rows with the same genre'], 3,
      'The second column only decides the order of rows that are equal in the first.'),
    mc('Where does `ORDER BY` go?', ['Before FROM', 'After WHERE', 'Before WHERE', 'Before SELECT'], 1,
      'The order is SELECT … FROM … WHERE … ORDER BY.'),
    mc('Can you sort by a column you don\'t show?', ['Yes', 'No', 'Only numbers', 'Only with DESC'], 0,
      'ORDER BY can use any column of the table, shown or not.'),
    mc('In ascending order, where do NULL values go in SQLite?', ['Last', 'They are left out', 'First', 'In the middle'], 2,
      'SQLite puts NULLs first in ascending order (and last in descending order).'),
    mc('How do you sort by price, cheapest first, and name for equal prices?', ['`ORDER BY name, price`', '`ORDER BY price AND name`', '`ORDER BY price DESC, name`', '`ORDER BY price, name`'], 3,
      'List price first, then name as the tie-breaker; ascending is the default.'),
    mc('Two rows tie on every sort column. In which order do they come?', ['Their order is not fixed', 'Alphabetical', 'By id', 'The query fails'], 0,
      'Ties can come in any order; add another sort column if the order matters.'),
    mc('Can ORDER BY use a name given with AS?', ['No', 'Only for text columns', 'Yes', 'Only with DESC'], 2,
      'ORDER BY can refer to a result column by its AS name.'),
  ],
})
