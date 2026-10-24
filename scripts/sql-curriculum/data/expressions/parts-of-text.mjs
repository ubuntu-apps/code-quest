// Functions and expressions: Parts of text (SUBSTR, INSTR, REPLACE).
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { EXPRESSIONS_DB } from '../expressions-db.mjs'

export default makeTopic({
  id: 'parts_of_text',
  title: 'Parts of text',
  database: EXPRESSIONS_DB,
  paragraphs: [
    '`SUBSTR(text, start, length)` takes part of a text. Positions count from **1**, so `SUBSTR(joined, 1, 4)` is the first four characters of a date like `2024-02-14`: the year.',
    '```\nSELECT joined, SUBSTR(joined, 1, 4) AS year, SUBSTR(joined, 6, 2) AS month\nFROM customers;\n```',
    'Leave out the length to take everything from `start` to the end. A negative start counts from the end: `SUBSTR(phone, -4)` is the last four characters.',
    "`INSTR(text, part)` finds where `part` first appears, or gives 0 if it doesn't. `INSTR('ana@example.com', '@')` is 4.",
    "`REPLACE(text, old, new)` swaps every `old` for `new`: `REPLACE('555-0101', '-', '')` is `5550101`. It is case-sensitive.",
    'Together they can cut text at a marker. The part of an email before the `@` ends one character before it, and the domain starts one character after it:',
    "```\nSELECT email,\n  SUBSTR(email, 1, INSTR(email, '@') - 1) AS username,\n  SUBSTR(email, INSTR(email, '@') + 1) AS domain\nFROM customers;\n```",
    "With `UPPER` and `LOWER`, you can fix the capitals of a name: a capital first letter, `UPPER(SUBSTR(first_name, 1, 1))`, then the rest in small letters, `LOWER(SUBSTR(first_name, 2))`.",
  ],
  sandboxCode: 'SELECT joined, SUBSTR(joined, 1, 4) AS year, SUBSTR(joined, 6, 2) AS month\nFROM customers;',
  sandboxSnippets: [
    snippet('Year and month', 'SELECT joined, SUBSTR(joined, 1, 4) AS year, SUBSTR(joined, 6, 2) AS month\nFROM customers;'),
    snippet('From the end', 'SELECT phone, SUBSTR(phone, -4) AS last_four FROM customers;'),
    snippet('Find the @', "SELECT email, INSTR(email, '@') AS at_position FROM customers;"),
    snippet('Replace', "SELECT phone, REPLACE(phone, '-', ' ') AS spaced FROM customers;"),
    snippet('Cut at the @', "SELECT email,\n  SUBSTR(email, 1, INSTR(email, '@') - 1) AS username,\n  SUBSTR(email, INSTR(email, '@') + 1) AS domain\nFROM customers;"),
  ],
  readMore: { label: 'SQLite: core functions', url: 'https://www.sqlite.org/lang_corefunc.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'First letter', {
      prompt: "Show each customer's `first_name` and its first character, in a column called `initial`.",
      hint: '`SUBSTR(first_name, 1, 1) AS initial`.',
      solution: 'SELECT first_name, SUBSTR(first_name, 1, 1) AS initial FROM customers;',
    }),
    query('easy', 'Year joined', {
      prompt: "Show each customer's `id` and the year they joined (the first four characters of `joined`), in a column called `year`.",
      hint: '`SUBSTR(joined, 1, 4) AS year`.',
      solution: 'SELECT id, SUBSTR(joined, 1, 4) AS year FROM customers;',
    }),
    query('easy', 'Digits only', {
      prompt: "Show each customer's `id` and their phone number without the dash, in a column called `digits`.",
      hint: "`REPLACE(phone, '-', '') AS digits`.",
      solution: "SELECT id, REPLACE(phone, '-', '') AS digits FROM customers;",
    }),
    query('medium', "Where's the @?", {
      prompt: 'Show each `email` and the position of its `@`, in a column called `at_position`.',
      hint: "`INSTR(email, '@') AS at_position`.",
      solution: "SELECT email, INSTR(email, '@') AS at_position FROM customers;",
    }),
    query('medium', 'Month joined', {
      prompt: "Show each customer's `first_name` and the month they joined (characters 6 and 7 of `joined`), in a column called `month`.",
      hint: 'Start at 6 and take 2: `SUBSTR(joined, 6, 2) AS month`.',
      solution: 'SELECT first_name, SUBSTR(joined, 6, 2) AS month FROM customers;',
    }),
    query('medium', 'Last four digits', {
      prompt: "Show each customer's `id` and the last four characters of their phone number, in a column called `last_four`.",
      hint: 'A negative start counts from the end: `SUBSTR(phone, -4)`.',
      solution: 'SELECT id, SUBSTR(phone, -4) AS last_four FROM customers;',
    }),
    query('hard', 'Usernames', {
      prompt: 'Show the part of each `email` before the `@`, in a column called `username`.',
      hint: "It ends one character before the @: `SUBSTR(email, 1, INSTR(email, '@') - 1)`.",
      solution: "SELECT SUBSTR(email, 1, INSTR(email, '@') - 1) AS username FROM customers;",
    }),
    query('hard', 'Domains', {
      prompt: 'Show the part of each `email` after the `@`, in lower case, in a column called `domain`.',
      hint: "`LOWER(SUBSTR(email, INSTR(email, '@') + 1)) AS domain`.",
      solution: "SELECT LOWER(SUBSTR(email, INSTR(email, '@') + 1)) AS domain FROM customers;",
    }),
    query('expert', 'Proper capitals', {
      prompt: "Show each customer's first name with a capital first letter and the rest in small letters (`ben` becomes `Ben`), in a column called `first_name`.",
      hint: '`UPPER(SUBSTR(first_name, 1, 1)) || LOWER(SUBSTR(first_name, 2))`.',
      solution: 'SELECT UPPER(SUBSTR(first_name, 1, 1)) || LOWER(SUBSTR(first_name, 2)) AS first_name FROM customers;',
    }),
    query('expert', 'Staff initials', {
      prompt: "Show each employee's `name` and their initials (the first letter of each of the two names, like `ML` for Maria Lopez), in a column called `initials`.",
      hint: "The second name starts just after the space: `SUBSTR(name, 1, 1) || SUBSTR(name, INSTR(name, ' ') + 1, 1)`.",
      solution: "SELECT name, SUBSTR(name, 1, 1) || SUBSTR(name, INSTR(name, ' ') + 1, 1) AS initials FROM employees;",
    }),
  ],
  questions: [
    mc("What does `SUBSTR('2024-02-14', 1, 4)` give?", ["`'2024'`", "`'024-'`", "`'02-14'`", "`'2024-02'`"], 0,
      'Positions start at 1, so this takes characters 1 to 4.'),
    mc("What does `SUBSTR('Lisbon', 4)` give?", ["`'Lis'`", "`'sbon'`", "`'bon'`", "`'L'`"], 2,
      'Without a length, it takes everything from position 4 to the end.'),
    mc("What does `SUBSTR('555-0101', -4)` give?", ["`'555-'`", "`'0101'`", "`'-010'`", 'An error'], 1,
      'A negative start counts from the end.'),
    mc("What does `INSTR('hello', 'z')` give?", ['`NULL`', '`-1`', '`1`', '`0`'], 3,
      'INSTR gives 0 when the part is not found.'),
    mc("What does `INSTR('ana@example.com', '@')` give?", ['`4`', '`3`', '`5`', "`'@'`"], 0,
      'The @ is the 4th character.'),
    qShort('Which function swaps every copy of one piece of text for another?', 'REPLACE',
      "`REPLACE(text, old, new)`, for example `REPLACE(phone, '-', '')`."),
    mc("What does `REPLACE('a-b-c', '-', '')` give?", ["`'a-bc'`", "`'abc'`", "`'a b c'`", "`'ab-c'`"], 1,
      'REPLACE changes every copy, not only the first.'),
    mc('Why `- 1` in `SUBSTR(email, 1, INSTR(email, \'@\') - 1)`?', ['To include the @', 'Positions start at 0', 'To stop just before the @', 'It removes the first letter'], 2,
      'INSTR gives the position of the @, so one less is the length of the part before it.'),
    mc('How do you make `ben` into `Ben`?', ['`UPPER(first_name)`', '`INITCAP(first_name)`', '`SUBSTR(UPPER(first_name), 1)`', '`UPPER(SUBSTR(first_name, 1, 1)) || LOWER(SUBSTR(first_name, 2))`'], 3,
      'Capitalise the first letter and join it to the rest in lower case. (SQLite has no INITCAP.)'),
    mc("Is `REPLACE('Dog', 'dog', 'cat')` case-sensitive?", ["Yes: it gives 'Dog' unchanged", "No: it gives 'cat'", "It gives 'Cat'", 'It gives an error'], 0,
      'REPLACE only matches exactly the same letters, case included.'),
  ],
})
