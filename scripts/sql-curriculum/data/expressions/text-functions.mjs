// Functions and expressions: Text functions.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { EXPRESSIONS_DB } from '../expressions-db.mjs'

export default makeTopic({
  id: 'text_functions',
  title: 'Text functions',
  database: EXPRESSIONS_DB,
  paragraphs: [
    "This section uses a new database: a small online shop's `customers`, `orders` and `employees`. Open **Tables** to see the columns. Like most real data, it's a little messy: some names are typed in odd cases, and some cities have extra spaces around them.",
    'A **function** takes values in brackets and gives back a new value. Text functions change or measure text:',
    '```\nSELECT first_name, UPPER(first_name) AS upper_name, LOWER(email) AS email\nFROM customers;\n```',
    '`UPPER(text)` gives capitals, `LOWER(text)` small letters, and `LENGTH(text)` the number of characters, spaces included. Like calculations, functions change only the result, never the table, and a function given `NULL` gives `NULL` back.',
    "`TRIM(text)` removes spaces from both ends; `LTRIM` and `RTRIM` remove them from the left or the right only. `LENGTH(' Lagos')` is 6, and `LENGTH(TRIM(' Lagos'))` is 5.",
    'Functions can go inside each other. The innermost one is worked out first:',
    '```\nSELECT UPPER(TRIM(city)) AS city FROM customers;\n```',
    "Functions work in `WHERE` and `ORDER BY` too. `=` is case-sensitive, so comparing in one case finds every spelling: `WHERE LOWER(first_name) = 'ben'` finds `ben`, `Ben` and `BEN`.",
    "Text joined with `||` can include function results: `first_name || ' ' || UPPER(last_name)`.",
  ],
  sandboxCode: 'SELECT first_name, UPPER(first_name) AS upper_name, LOWER(email) AS email\nFROM customers;',
  sandboxSnippets: [
    snippet('Upper and lower', 'SELECT first_name, UPPER(first_name) AS upper_name, LOWER(email) AS email\nFROM customers;'),
    snippet('Length', 'SELECT first_name, LENGTH(first_name) AS letters FROM customers;'),
    snippet('Trim', "SELECT '[' || city || ']' AS before, '[' || TRIM(city) || ']' AS after FROM customers;"),
    snippet('Nested', 'SELECT UPPER(TRIM(city)) AS city FROM customers;'),
    snippet('Any case', "SELECT first_name FROM customers WHERE LOWER(first_name) = 'ben';"),
  ],
  readMore: { label: 'SQLite: core functions', url: 'https://www.sqlite.org/lang_corefunc.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Emails in lower case', {
      prompt: "Show every customer's email in lower case, in a column called `email_lower`.",
      hint: '`SELECT LOWER(email) AS email_lower FROM customers;`',
      solution: 'SELECT LOWER(email) AS email_lower FROM customers;',
    }),
    query('easy', 'Cities in capitals', {
      prompt: "Show every customer's `first_name` and their city in capitals, in a column called `city_upper`.",
      hint: '`UPPER(city) AS city_upper`. A missing city stays NULL.',
      solution: 'SELECT first_name, UPPER(city) AS city_upper FROM customers;',
    }),
    query('easy', 'Name lengths', {
      prompt: "Show each customer's `first_name` and how many characters it has, in a column called `letters`.",
      hint: '`LENGTH(first_name) AS letters`.',
      solution: 'SELECT first_name, LENGTH(first_name) AS letters FROM customers;',
    }),
    query('medium', 'Clean cities', {
      prompt: "Show each customer's `id` and their city without the extra spaces, in a column called `city`.",
      hint: '`TRIM(city) AS city`.',
      solution: 'SELECT id, TRIM(city) AS city FROM customers;',
    }),
    query('medium', 'Find Ben, any case', {
      prompt: "Show the `id` and `first_name` of every customer whose first name is `ben`, however it is capitalised.",
      hint: "Compare in one case: `WHERE LOWER(first_name) = 'ben'`.",
      solution: "SELECT id, first_name FROM customers WHERE LOWER(first_name) = 'ben';",
    }),
    query('medium', 'Who has extra spaces?', {
      prompt: 'Show the `id` and `city` of the customers whose city has spaces at the start or end.',
      hint: "A city with extra spaces gets shorter when trimmed: `WHERE LENGTH(city) <> LENGTH(TRIM(city))`.",
      solution: 'SELECT id, city FROM customers WHERE LENGTH(city) <> LENGTH(TRIM(city));',
    }),
    query('hard', 'Full names', {
      prompt: "Show one column called `full_name` with each customer's first name, a space and their last name.",
      hint: "`first_name || ' ' || last_name AS full_name`.",
      solution: "SELECT first_name || ' ' || last_name AS full_name FROM customers;",
    }),
    query('hard', 'Tidy cities, A to Z', {
      prompt: 'Show every customer\'s city trimmed and in capitals, in a column called `city`, sorted A to Z.',
      hint: 'Nest the functions, `UPPER(TRIM(city)) AS city`, then `ORDER BY city`.',
      solution: 'SELECT UPPER(TRIM(city)) AS city FROM customers ORDER BY city;',
    }),
    query('expert', 'Long emails', {
      prompt: 'Show the `email` and its length (called `chars`) for the emails longer than 20 characters, longest first. Equal lengths go in email order.',
      hint: '`WHERE LENGTH(email) > 20 ORDER BY chars DESC, email`.',
      solution: 'SELECT email, LENGTH(email) AS chars FROM customers\nWHERE LENGTH(email) > 20\nORDER BY chars DESC, email;',
    }),
  ],
  questions: [
    mc("What does `UPPER('Lisbon')` give?", ["`'lisbon'`", "`'LISBON'`", "`'Lisbon'`", '`6`'], 1,
      'UPPER turns every letter into a capital.'),
    mc("What does `LENGTH(' Lagos')` give?", ['`5`', '`7`', '`6`', "`'Lagos'`"], 2,
      'LENGTH counts every character, including the space at the start.'),
    mc('What does `TRIM` remove?', ['Spaces at both ends of the text', 'Every space', 'The first letter', 'Capital letters'], 0,
      'TRIM removes spaces from the start and the end, not from the middle.'),
    qShort('Which function removes spaces from the left end only?', 'LTRIM',
      '`LTRIM` trims the left (start); `RTRIM` trims the right (end).'),
    mc('Does `UPPER(name)` change the table?', ['Yes, permanently', 'Only for text columns', 'Only until the next query', 'No, only the result'], 3,
      'Functions in a SELECT change what you see, not what is stored.'),
    mc('What is `UPPER(NULL)`?', ['`NULL`', "`'NULL'`", "`''`", 'An error'], 0,
      'A function given a missing value gives a missing value back.'),
    mc('In `UPPER(TRIM(city))`, which runs first?', ['`UPPER`', 'They run at the same time', '`TRIM`', 'Whichever is shorter'], 2,
      'The innermost function is worked out first; its result goes to the outer one.'),
    mc("Which finds `ben`, `Ben` and `BEN`?", ["`WHERE first_name = 'ben'`", "`WHERE LOWER(first_name) = 'ben'`", "`WHERE UPPER(first_name) = 'ben'`", "`WHERE first_name = 'Ben'`"], 1,
      'Turning the column into lower case first makes every spelling match the lower-case value.'),
    mc('How do you find cities with spaces at the ends?', ['`WHERE city LIKE TRIM`', '`WHERE TRIM(city) IS NULL`', "`WHERE city = ' '`", '`WHERE LENGTH(city) <> LENGTH(TRIM(city))`'], 3,
      'If trimming makes the text shorter, it had spaces at an end.'),
    mc("What does `'Ana' || ' ' || UPPER('silva')` give?", ["`'Ana SILVA'`", "`'ANA SILVA'`", "`'Ana silva'`", "`'AnaSILVA'`"], 0,
      'Only the part inside UPPER changes; the pieces are joined as written.'),
  ],
})
