// Functions and expressions: Types and CAST.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { EXPRESSIONS_DB } from '../expressions-db.mjs'

export default makeTopic({
  id: 'types_cast',
  title: 'Types and CAST',
  database: EXPRESSIONS_DB,
  paragraphs: [
    'Every value has a **type**. SQLite has five: `integer` (whole numbers), `real` (numbers with decimals), `text`, `blob` (raw bytes, such as images) and `null`. `typeof(value)` tells you which one a value is:',
    "```\nSELECT id, typeof(total) AS total_type, typeof(discount) AS discount_type,\n       typeof(order_date) AS date_type\nFROM orders;\n```",
    'SQLite is flexible about types, but the type still matters. Text sorts letter by letter, so as text `\'9\'` comes after `\'10\'` (9 is bigger than 1). Numbers stored or produced as text, like the results of `strftime` and `SUBSTR`, sort and compare the text way.',
    '`CAST(value AS type)` turns a value into another type. `CAST(\'09\' AS INTEGER)` is the number 9; `CAST(salary AS TEXT)` is text; `CAST(5 AS REAL)` is 5.0.',
    '```\nSELECT order_date, CAST(strftime(\'%m\', order_date) AS INTEGER) AS month FROM orders;\n```',
    '`CAST(x AS INTEGER)` **cuts off** the decimals instead of rounding: `CAST(42.99 AS INTEGER)` is 42, while `ROUND(42.99)` is 43.0. That also makes it a way to drop the `.0` that `ROUND` leaves: `CAST(ROUND(42.99) AS INTEGER)` is 43.',
    "Some things that look like numbers should stay text: phone numbers, postcodes and ID codes like `007` would lose their leading zeros as numbers, and you never do maths with them.",
  ],
  sandboxCode: "SELECT id, typeof(total) AS total_type, typeof(discount) AS discount_type,\n       typeof(order_date) AS date_type\nFROM orders;",
  sandboxSnippets: [
    snippet('typeof', "SELECT id, typeof(total) AS total_type, typeof(discount) AS discount_type,\n       typeof(order_date) AS date_type\nFROM orders;"),
    snippet('Text sorts differently', "SELECT '9' < '10' AS as_text, 9 < 10 AS as_numbers;"),
    snippet('CAST', "SELECT CAST('09' AS INTEGER) AS whole, CAST(5 AS REAL) AS decimal, CAST(42 AS TEXT) AS words;"),
    snippet('Cut, not round', 'SELECT total, CAST(total AS INTEGER) AS cut, ROUND(total) AS rounded FROM orders;'),
    snippet('Month as a number', "SELECT order_date, CAST(strftime('%m', order_date) AS INTEGER) AS month FROM orders;"),
  ],
  readMore: { label: 'SQLite: datatypes', url: 'https://www.sqlite.org/datatype3.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'What type is the discount?', {
      prompt: "Show each order's `id` and the type of its `discount`, called `type`.",
      hint: '`typeof(discount) AS type`. Missing discounts have the type null.',
      solution: 'SELECT id, typeof(discount) AS type FROM orders;',
    }),
    query('easy', 'Cut the decimals', {
      prompt: "Show each order's `id` and its total as a whole number with the decimals cut off, called `whole`.",
      hint: '`CAST(total AS INTEGER) AS whole`.',
      solution: 'SELECT id, CAST(total AS INTEGER) AS whole FROM orders;',
    }),
    query('easy', 'Month as a number', {
      prompt: "Show each order's `id` and its month as a number (3, not `03`), called `month`.",
      hint: "`CAST(strftime('%m', order_date) AS INTEGER) AS month`.",
      solution: "SELECT id, CAST(strftime('%m', order_date) AS INTEGER) AS month FROM orders;",
    }),
    query('medium', 'Second half of the year', {
      prompt: 'Show the `id` and `order_date` of the orders from July onwards (month 7 or later), comparing the month as a number.',
      hint: "`WHERE CAST(strftime('%m', order_date) AS INTEGER) >= 7`.",
      solution: "SELECT id, order_date FROM orders WHERE CAST(strftime('%m', order_date) AS INTEGER) >= 7;",
    }),
    query('medium', 'Years since hiring', {
      prompt: "Show each employee's `name` and 2026 minus the year they were hired (as a number), called `years`.",
      hint: "`2026 - CAST(SUBSTR(hire_date, 1, 4) AS INTEGER) AS years`.",
      solution: 'SELECT name, 2026 - CAST(SUBSTR(hire_date, 1, 4) AS INTEGER) AS years FROM employees;',
    }),
    query('hard', 'Phone as a number', {
      prompt: "Show each customer's `id` and their phone number with the dash removed, turned into an integer, called `phone_number`.",
      hint: "`CAST(REPLACE(phone, '-', '') AS INTEGER) AS phone_number`. (In real tables, keep phone numbers as text.)",
      solution: "SELECT id, CAST(REPLACE(phone, '-', '') AS INTEGER) AS phone_number FROM customers;",
    }),
    query('hard', 'Sort by number, not text', {
      prompt: 'This query should list the orders from the smallest total to the largest, but the totals are sorted as text (so 120.0 comes before 15.99). Fix it.',
      starter: 'SELECT id, total FROM orders ORDER BY CAST(total AS TEXT);',
      hint: 'Sort by the number itself: `ORDER BY total`.',
      solution: 'SELECT id, total FROM orders ORDER BY total;',
    }),
    query('expert', 'Cut or round?', {
      prompt: 'Show the `id`, `total`, the total with its decimals cut off (`cut`) and the rounded total (`rounded`), only for the orders where the two differ.',
      hint: '`CAST(total AS INTEGER) AS cut, ROUND(total) AS rounded ... WHERE CAST(total AS INTEGER) <> ROUND(total)`.',
      solution: 'SELECT id, total, CAST(total AS INTEGER) AS cut, ROUND(total) AS rounded FROM orders\nWHERE CAST(total AS INTEGER) <> ROUND(total);',
    }),
    query('expert', 'Pay per day', {
      prompt: "Show each employee's `name` and a `daily` column like `197 per day`: their salary divided by 365, rounded to a whole number, without a `.0`.",
      hint: "Round, then CAST to drop the .0: `CAST(ROUND(salary / 365.0) AS INTEGER) || ' per day'`.",
      solution: "SELECT name, CAST(ROUND(salary / 365.0) AS INTEGER) || ' per day' AS daily FROM employees;",
    }),
  ],
  questions: [
    mc('Which of these is not one of SQLite\'s types?', ['integer', 'date', 'real', 'text'], 1,
      'SQLite has integer, real, text, blob and null; dates are stored as text or numbers.'),
    mc("What does `typeof(42.5)` give?", ["`'integer'`", "`'text'`", "`'real'`", "`'number'`"], 2,
      'Numbers with decimals are real.'),
    mc("Is `'9' < '10'` true?", ["No: as text, '9' comes after '10'", 'Yes', 'It gives an error', 'Only in SQLite'], 0,
      "Text compares character by character, and '9' is after '1'."),
    mc("What does `CAST('09' AS INTEGER)` give?", ["`'09'`", '`0`', '`90`', '`9`'], 3,
      'The text becomes the number 9.'),
    mc('What does `CAST(42.99 AS INTEGER)` give?', ['`43`', '`42`', '`42.99`', '`43.0`'], 1,
      'CAST to INTEGER cuts off the decimals; it does not round.'),
    qShort('Which function tells you the type of a value?', 'typeof',
      "`typeof(x)` gives 'integer', 'real', 'text', 'blob' or 'null'."),
    mc("Why should a postcode like `'02134'` stay text?", ['Text is faster', 'Numbers cannot be stored', 'As a number it would lose its leading zero', 'SQLite requires it'], 2,
      'Codes that are not quantities keep their exact form as text.'),
    mc("What type is the result of `strftime('%m', '2026-03-01')`?", ['text', 'integer', 'real', 'null'], 0,
      'strftime gives text, so CAST it to compare or sort as a number.'),
    mc('How do you show 43 instead of 43.0 after rounding?', ['`ROUND(x, 0)`', '`FLOOR(x)`', '`CAST(x AS TEXT)`', '`CAST(ROUND(x) AS INTEGER)`'], 3,
      'ROUND keeps a decimal point; CAST to INTEGER removes it.'),
    mc('What does `typeof(NULL)` give?', ["`'null'`", '`NULL`', "`'text'`", 'An error'], 0,
      'NULL has its own type, null.'),
  ],
})
