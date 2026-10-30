// Querying a table: the section's projects (easy, medium, hard). Each builds one report
// step by step, using every lesson in the section.
import { makeProject, mc, qShort, query, snippet } from './_builders.mjs'
import { QUERYING_DB } from './databases.mjs'

const libraryReport = makeProject('easy', {
  id: 'proj_library_report',
  title: 'Library report',
  database: QUERYING_DB,
  paragraphs: [
    'The library wants a few lists from its `books` table: what it has, the classics, the books still waiting for a rating, and the best-rated ones.',
    'Each challenge is one part of the report. They use what you learned in this quest: choosing columns, `WHERE`, `NULL`, `ORDER BY`, `LIMIT` and joining text with `||`.',
    'Try your ideas in the sandbox first. Remember to sort when the order matters, and to give calculated columns the name the challenge asks for.',
  ],
  sandboxCode: 'SELECT title, author, year, rating FROM books ORDER BY author, title;',
  sandboxSnippets: [
    snippet('Catalogue', 'SELECT title, author FROM books ORDER BY author, title;'),
    snippet('Unrated', 'SELECT title FROM books WHERE rating IS NULL;'),
    snippet('Label', "SELECT title || ' (' || year || ')' AS entry FROM books;"),
  ],
  readMore: { label: 'SQLite: the SELECT statement', url: 'https://www.sqlite.org/lang_select.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'The catalogue', {
      prompt: 'Show the `title` and `author` of every book, sorted by author and then by title.',
      hint: '`ORDER BY author, title`.',
      solution: 'SELECT title, author FROM books ORDER BY author, title;',
    }),
    query('easy', 'The classics', {
      prompt: 'Show the `title` and `year` of the books published before 1950, oldest first.',
      hint: '`WHERE year < 1950 ORDER BY year`.',
      solution: 'SELECT title, year FROM books WHERE year < 1950 ORDER BY year;',
    }),
    query('medium', 'Waiting for a rating', {
      prompt: 'Show the `title` of every book that has no rating yet, in title order.',
      hint: '`WHERE rating IS NULL ORDER BY title`.',
      solution: 'SELECT title FROM books WHERE rating IS NULL ORDER BY title;',
    }),
    query('medium', 'Top five', {
      prompt: 'Show the `title` and `rating` of the five best-rated books, best first. Books with the same rating go in title order.',
      hint: 'Leave out the unrated books, then `ORDER BY rating DESC, title LIMIT 5`.',
      solution: 'SELECT title, rating FROM books\nWHERE rating IS NOT NULL\nORDER BY rating DESC, title\nLIMIT 5;',
    }),
    query('hard', 'Catalogue entries', {
      prompt: 'Show one column called `entry` with each book\'s title and year in brackets, like `Dune (1965)`, oldest first.',
      hint: "`title || ' (' || year || ')' AS entry`, then `ORDER BY year`.",
      solution: "SELECT title || ' (' || year || ')' AS entry FROM books ORDER BY year;",
    }),
    query('hard', 'Best of the imagination', {
      prompt: 'Show the `genre`, `title` and `rating` of the `Science Fiction` and `Fantasy` books rated 4.5 or higher. Sort by genre, then best rating first, then title.',
      hint: "`WHERE genre IN ('Science Fiction', 'Fantasy') AND rating >= 4.5 ORDER BY genre, rating DESC, title`.",
      solution: "SELECT genre, title, rating FROM books\nWHERE genre IN ('Science Fiction', 'Fantasy') AND rating >= 4.5\nORDER BY genre, rating DESC, title;",
    }),
  ],
  questions: [
    mc('Which lists the books with no rating?', ['`WHERE rating = NULL`', '`WHERE rating IS NULL`', '`WHERE rating = 0`', "`WHERE rating = ''`"], 1,
      'Missing values are found with IS NULL.'),
    mc('How do you get the five best-rated books?', ['`ORDER BY rating DESC LIMIT 5`', '`ORDER BY rating LIMIT 5`', '`LIMIT 5`', '`WHERE rating = 5`'], 0,
      'Sort best first, then keep five rows.'),
    mc("What does `title || ' (' || year || ')'` give for Dune, 1965?", ["`Dune(1965)`", "`Dune 1965`", "`Dune (1965)`", "`Dune || 1965`"], 2,
      'The pieces are joined exactly as written, including the space and brackets.'),
    mc('Why add `title` to `ORDER BY rating DESC, title`?', ['It is required', 'To show the title', 'To filter by title', 'To fix the order of books with the same rating'], 3,
      'The second sort column breaks ties in the first.'),
    qShort('Which keyword keeps only the first rows of a result?', 'LIMIT',
      '`LIMIT n` keeps the first n rows.'),
    mc('Do unrated books appear in `WHERE rating >= 4.5`?', ['No', 'Yes', 'Only if sorted', 'Only with LIMIT'], 0,
      'Comparing NULL gives unknown, so those rows are not kept.'),
  ],
})

const petClinic = makeProject('medium', {
  id: 'proj_pet_clinic',
  title: 'Pet clinic',
  database: QUERYING_DB,
  paragraphs: [
    "The vet's clinic keeps its patients in the `pets` table. Today you'll prepare the lists the reception desk needs: the check-up list, the records with missing details, weights in pounds, and labels for the appointment board.",
    'Some pets have no breed or no owner recorded, so watch out for `NULL`. One kilogram is about 2.2046 pounds.',
  ],
  sandboxCode: 'SELECT name, species, age, owner FROM pets ORDER BY age DESC;',
  sandboxSnippets: [
    snippet('Oldest first', 'SELECT name, species, age FROM pets ORDER BY age DESC;'),
    snippet('Missing details', 'SELECT name, breed, owner FROM pets WHERE breed IS NULL OR owner IS NULL;'),
    snippet('Pounds', 'SELECT name, ROUND(weight_kg * 2.2046, 1) AS weight_lb FROM pets;'),
  ],
  readMore: { label: 'SQLite: how NULL is handled', url: 'https://www.sqlite.org/nulls.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Check-up list', {
      prompt: 'Show the `name`, `species` and `age` of the dogs and cats older than 5, oldest first.',
      hint: "`WHERE species IN ('dog', 'cat') AND age > 5 ORDER BY age DESC`.",
      solution: "SELECT name, species, age FROM pets\nWHERE species IN ('dog', 'cat') AND age > 5\nORDER BY age DESC;",
    }),
    query('easy', 'Missing details', {
      prompt: 'Show the `name`, `breed` and `owner` of the pets with no breed or no owner recorded, in name order.',
      hint: '`WHERE breed IS NULL OR owner IS NULL ORDER BY name`.',
      solution: 'SELECT name, breed, owner FROM pets\nWHERE breed IS NULL OR owner IS NULL\nORDER BY name;',
    }),
    query('medium', 'Weight in pounds', {
      prompt: "Show each pet's `name` and its weight in pounds (kilograms times 2.2046) rounded to 1 decimal, in a column called `weight_lb`. Heaviest first.",
      hint: '`ROUND(weight_kg * 2.2046, 1) AS weight_lb`, then `ORDER BY weight_lb DESC`.',
      solution: 'SELECT name, ROUND(weight_kg * 2.2046, 1) AS weight_lb FROM pets ORDER BY weight_lb DESC;',
    }),
    query('medium', 'Owners to call', {
      prompt: 'Show each `owner` once, in alphabetical order. Leave out the missing owners.',
      hint: '`SELECT DISTINCT owner ... WHERE owner IS NOT NULL ORDER BY owner`.',
      solution: 'SELECT DISTINCT owner FROM pets WHERE owner IS NOT NULL ORDER BY owner;',
    }),
    query('hard', 'Small patients', {
      prompt: 'Show the `name`, `species` and `weight_kg` of the hamsters, rabbits and parrots, and of any other pet under 5 kg. Lightest first.',
      hint: "`WHERE species IN ('hamster', 'rabbit', 'parrot') OR weight_kg < 5 ORDER BY weight_kg`.",
      solution: "SELECT name, species, weight_kg FROM pets\nWHERE species IN ('hamster', 'rabbit', 'parrot') OR weight_kg < 5\nORDER BY weight_kg;",
    }),
    query('hard', 'Appointment board', {
      prompt: "For the pets that have an owner, show a `label` like `Biscuit the dog` and the `owner`. Sort by owner, then by pet name.",
      hint: "`name || ' the ' || species AS label`, `WHERE owner IS NOT NULL`, `ORDER BY owner, name`.",
      solution: "SELECT name || ' the ' || species AS label, owner FROM pets\nWHERE owner IS NOT NULL\nORDER BY owner, name;",
    }),
  ],
  questions: [
    mc('Which finds pets missing a breed or an owner?', ['`breed IS NULL AND owner IS NULL`', '`breed = NULL OR owner = NULL`', '`breed IS NULL OR owner IS NULL`', '`NOT breed OR NOT owner`'], 2,
      'Either missing value is enough, so it is OR, and missing values are tested with IS NULL.'),
    mc('How do you list each owner once?', ['`SELECT DISTINCT owner FROM pets`', '`SELECT owner FROM pets LIMIT 1`', '`SELECT UNIQUE owner`', '`SELECT owner ONCE`'], 0,
      'DISTINCT removes repeated rows.'),
    mc('What does `ROUND(10.5 * 2.2046, 1)` give?', ['`23.15`', '`23`', '`23.2`', '`23.1`'], 3,
      '10.5 × 2.2046 = 23.1483, which rounds to 23.1.'),
    mc("Which builds `Biscuit the dog`?", ["`name + ' the ' + species`", "`name || ' the ' || species`", "`name, ' the ', species`", "`CONCAT name species`"], 1,
      'In SQLite, `||` joins text.'),
    qShort('Which keyword sorts from largest to smallest?', 'DESC',
      'DESC means descending order.'),
    mc("Why is `species IN ('dog', 'cat') AND age > 5` safe without extra brackets?", ['IN is one condition, so AND applies to all of it', 'AND comes after OR', 'Brackets are not allowed', 'It is not safe'], 0,
      'IN with its list counts as a single condition.'),
  ],
})

const stockCheck = makeProject('hard', {
  id: 'proj_shop_stock_check',
  title: 'Shop stock check',
  database: QUERYING_DB,
  paragraphs: [
    "It's the end of the month at the shop, and the manager wants a stock check from the `products` table: what to reorder, what the stock is worth, the sale prices and a final report.",
    'This side quest puts the whole quest together: conditions, `IN`, `LIKE`, `ORDER BY` with tie-breakers, calculated columns with `AS`, `ROUND` and `UPPER`.',
    'Give calculated columns exactly the names the challenges ask for, and add tie-breakers where rows could be equal.',
  ],
  sandboxCode: 'SELECT name, category, price, stock, price * stock AS stock_value FROM products;',
  sandboxSnippets: [
    snippet('Stock value', 'SELECT name, ROUND(price * stock, 2) AS stock_value FROM products ORDER BY stock_value DESC;'),
    snippet('Low stock', 'SELECT name, stock FROM products WHERE stock < 20 ORDER BY stock;'),
    snippet('Sale prices', "SELECT name, price, ROUND(price * 0.75, 2) AS sale_price FROM products WHERE category = 'electronics';"),
  ],
  readMore: { label: 'SQLite: core functions', url: 'https://www.sqlite.org/lang_corefunc.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Reorder list', {
      prompt: 'Show the `name` and `stock` of products with fewer than 20 in stock, lowest stock first. Products with the same stock go in name order.',
      hint: '`WHERE stock < 20 ORDER BY stock, name`.',
      solution: 'SELECT name, stock FROM products WHERE stock < 20 ORDER BY stock, name;',
    }),
    query('easy', 'What the stock is worth', {
      prompt: "Show each product's `name` and its stock value (price times stock) rounded to 2 decimals, in a column called `stock_value`. Highest value first; equal values in name order.",
      hint: '`ROUND(price * stock, 2) AS stock_value ... ORDER BY stock_value DESC, name`.',
      solution: 'SELECT name, ROUND(price * stock, 2) AS stock_value FROM products ORDER BY stock_value DESC, name;',
    }),
    query('medium', 'Mid-range, no stationery', {
      prompt: 'Show the `name`, `category` and `price` of products priced from 5 to 20 that are not stationery, cheapest first.',
      hint: "`WHERE price BETWEEN 5 AND 20 AND category <> 'stationery' ORDER BY price`.",
      solution: "SELECT name, category, price FROM products\nWHERE price BETWEEN 5 AND 20 AND category <> 'stationery'\nORDER BY price;",
    }),
    query('medium', 'Sale tags', {
      prompt: 'For the `electronics` and `bags` products, show the `name`, `price` and the price with 25% off rounded to 2 decimals, called `sale_price`. Highest sale price first.',
      hint: "`ROUND(price * 0.75, 2) AS sale_price`, `WHERE category IN ('electronics', 'bags')`, `ORDER BY sale_price DESC`.",
      solution: "SELECT name, price, ROUND(price * 0.75, 2) AS sale_price FROM products\nWHERE category IN ('electronics', 'bags')\nORDER BY sale_price DESC;",
    }),
    query('hard', 'Search the shelves', {
      prompt: 'Show the `name` and `stock` of the products in stock (above 0) whose name contains the letter `e`, in name order.',
      hint: "`WHERE stock > 0 AND name LIKE '%e%' ORDER BY name`.",
      solution: "SELECT name, stock FROM products WHERE stock > 0 AND name LIKE '%e%' ORDER BY name;",
    }),
    query('hard', 'The manager\'s report', {
      prompt: 'Show the category in capitals (called `category`), the `name`, and the stock value (price times stock, called `stock_value`) of the products whose stock is worth more than 300. Highest value first.',
      hint: '`UPPER(category) AS category`, `price * stock AS stock_value`, `WHERE price * stock > 300 ORDER BY stock_value DESC`.',
      solution: 'SELECT UPPER(category) AS category, name, price * stock AS stock_value FROM products\nWHERE price * stock > 300\nORDER BY stock_value DESC;',
    }),
  ],
  questions: [
    mc('Which keeps products priced from 5 to 20, both included?', ['`price > 5 AND price < 20`', '`price BETWEEN 5 AND 20`', '`price IN (5, 20)`', '`price BETWEEN 20 AND 5`'], 1,
      'BETWEEN includes both ends, smaller value first.'),
    mc('Why give `price * stock` a name with AS?', ['So the result has a clear heading, like `stock_value`', 'It is faster', 'It saves it in the table', 'Calculations need it to run'], 0,
      'Without AS, the heading would be the calculation itself.'),
    mc("Which product does `WHERE price * stock > 300` keep?", ["Price 50, stock 6", "Price 9.99, stock 30", "Price 12, stock 30", "Price 300, stock 1"], 2,
      "12 × 30 = 360 is over 300. 50 × 6 and 300 × 1 are exactly 300, which `>` does not keep, and 9.99 × 30 is 299.7."),
    mc('In WHERE, how do you filter on the stock value?', ['`WHERE stock_value > 300` everywhere', '`WHERE price + stock > 300`', '`WHERE price * stock > 300`', 'You can\'t'], 2,
      'Repeat the calculation; most databases don\'t allow the AS name in WHERE.'),
    qShort('Which function turns text into capital letters?', 'UPPER',
      "`UPPER('kitchen')` gives `KITCHEN`."),
    mc("Which finds names containing an e?", ["`LIKE 'e%'`", "`LIKE '%e'`", "`= '%e%'`", "`LIKE '%e%'`"], 3,
      '`%` on both sides allows anything before and after the e.'),
  ],
})

export const queryingProjects = [libraryReport, petClinic, stockCheck]
