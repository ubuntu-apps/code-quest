// Functions and expressions: Replacing NULL (COALESCE, IFNULL, NULLIF).
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { EXPRESSIONS_DB } from '../expressions-db.mjs'

export default makeTopic({
  id: 'null_functions',
  title: 'Replacing NULL',
  database: EXPRESSIONS_DB,
  paragraphs: [
    "A missing value spreads: a calculation with `NULL` in it gives `NULL`. `salary + bonus` is `NULL` for anyone without a bonus, and `first_name || ' from ' || city` is `NULL` when the city is missing. Often you'd rather use a stand-in value.",
    '`COALESCE(a, b, …)` gives the first of its values that is not `NULL`. With a value as the last argument, the result is never `NULL`:',
    "```\nSELECT name, salary + COALESCE(bonus, 0) AS total_pay FROM employees;\n```",
    "`COALESCE(phone, email)` gives the phone number when there is one, and the email otherwise. `COALESCE(phone, email, 'no contact')` adds a last resort.",
    '`IFNULL(a, b)` does the same with exactly two values: `IFNULL(bonus, 0)`. `COALESCE` is standard SQL and works in every database, so this course mostly uses it.',
    '`NULLIF(a, b)` goes the other way: it gives `NULL` when `a` equals `b`, and `a` otherwise. `NULLIF(discount, 0)` treats a discount of 0 as "no discount". It also prevents dividing by zero, because dividing by `NULL` gives `NULL` instead of a wrong answer: `total / NULLIF(quantity, 0)`.',
    "A stand-in is for showing or calculating, not for pretending: in `WHERE`, `discount IS NULL` still tells you which rows really have no value.",
  ],
  sandboxCode: 'SELECT name, salary, bonus, salary + bonus AS plain_sum, salary + COALESCE(bonus, 0) AS total_pay\nFROM employees;',
  sandboxSnippets: [
    snippet('NULL spreads', 'SELECT name, salary, bonus, salary + bonus AS plain_sum, salary + COALESCE(bonus, 0) AS total_pay\nFROM employees;'),
    snippet('First that exists', "SELECT first_name, COALESCE(phone, email, 'no contact') AS contact FROM customers;"),
    snippet('IFNULL', 'SELECT id, IFNULL(discount, 0) AS discount FROM orders;'),
    snippet('NULLIF', 'SELECT id, discount, NULLIF(discount, 0) AS real_discount FROM orders;'),
    snippet('Text with NULL', "SELECT first_name || ' from ' || city AS plain,\n       first_name || ' from ' || COALESCE(TRIM(city), 'somewhere') AS safe\nFROM customers;"),
  ],
  readMore: { label: 'SQLite: core functions', url: 'https://www.sqlite.org/lang_corefunc.html#coalesce', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Phone or a dash', {
      prompt: "Show each customer's `first_name` and their `phone`, with `-` when it is missing. Call the column `phone`.",
      hint: "`COALESCE(phone, '-') AS phone`.",
      solution: "SELECT first_name, COALESCE(phone, '-') AS phone FROM customers;",
    }),
    query('easy', 'No discount means 0', {
      prompt: "Show each order's `id` and its `discount`, with 0 instead of a missing discount.",
      hint: '`COALESCE(discount, 0) AS discount`.',
      solution: 'SELECT id, COALESCE(discount, 0) AS discount FROM orders;',
    }),
    query('easy', 'IFNULL for bonuses', {
      prompt: "Use `IFNULL` to show each employee's `name` and `bonus`, with 0 instead of a missing bonus.",
      hint: '`IFNULL(bonus, 0) AS bonus`.',
      solution: 'SELECT name, IFNULL(bonus, 0) AS bonus FROM employees;',
    }),
    query('medium', 'Total pay', {
      prompt: "Show each employee's `name` and their salary plus bonus, called `total_pay`. A missing bonus counts as 0.",
      hint: 'Without COALESCE, the sum is NULL for anyone without a bonus: `salary + COALESCE(bonus, 0)`.',
      solution: 'SELECT name, salary + COALESCE(bonus, 0) AS total_pay FROM employees;',
    }),
    query('medium', 'City or unknown', {
      prompt: "Show each customer's `first_name` and their city without extra spaces, or `unknown` when it is missing. Call the column `city`.",
      hint: "`COALESCE(TRIM(city), 'unknown') AS city`. TRIM of NULL is NULL, so COALESCE still catches it.",
      solution: "SELECT first_name, COALESCE(TRIM(city), 'unknown') AS city FROM customers;",
    }),
    query('medium', 'Paid, for every order', {
      prompt: "Show every order's `id` and the amount paid after its discount, rounded to 2 decimals, called `paid`. Orders without a discount paid the full total.",
      hint: '`ROUND(total * (100 - COALESCE(discount, 0)) / 100.0, 2) AS paid`.',
      solution: 'SELECT id, ROUND(total * (100 - COALESCE(discount, 0)) / 100.0, 2) AS paid FROM orders;',
    }),
    query('hard', 'Best way to reach them', {
      prompt: "Show each customer's `first_name` and a `contact` column: the phone number when there is one, otherwise the email.",
      hint: '`COALESCE(phone, email) AS contact`.',
      solution: 'SELECT first_name, COALESCE(phone, email) AS contact FROM customers;',
    }),
    query('hard', 'A zero discount is no discount', {
      prompt: "Show each order's `id` and its `discount`, but with `NULL` where the discount is 0.",
      hint: '`NULLIF(discount, 0) AS discount`.',
      solution: 'SELECT id, NULLIF(discount, 0) AS discount FROM orders;',
    }),
    query('expert', 'Where are they from?', {
      prompt: "Show one column called `label` like `Ana from Lisbon`, using the trimmed city, or `somewhere` when the city is missing (`Grace from somewhere`).",
      hint: "`first_name || ' from ' || COALESCE(TRIM(city), 'somewhere') AS label`.",
      solution: "SELECT first_name || ' from ' || COALESCE(TRIM(city), 'somewhere') AS label FROM customers;",
    }),
    query('expert', 'Bonus as a percentage', {
      prompt: "Show each employee's `name` and their bonus as a percentage of their salary, rounded to 1 decimal, called `bonus_percent` (0 for no bonus). Highest first; equal values in name order.",
      hint: '`ROUND(COALESCE(bonus, 0) * 100.0 / salary, 1) AS bonus_percent ... ORDER BY bonus_percent DESC, name`.',
      solution: 'SELECT name, ROUND(COALESCE(bonus, 0) * 100.0 / salary, 1) AS bonus_percent\nFROM employees\nORDER BY bonus_percent DESC, name;',
    }),
  ],
  questions: [
    mc('What is `65500 + NULL`?', ['`65500`', '`NULL`', '`0`', 'An error'], 1,
      'Any calculation with a missing value gives a missing value.'),
    mc("What does `COALESCE(NULL, NULL, 'x')` give?", ["`'x'`", '`NULL`', 'An error', "`'NULL'`"], 0,
      'COALESCE gives the first value that is not NULL.'),
    mc('How is `IFNULL(a, b)` different from `COALESCE(a, b)`?', ['IFNULL works on text only', 'IFNULL gives NULL back', 'COALESCE only takes one value', 'It takes exactly two values; COALESCE takes any number'], 3,
      'With two values they do the same; COALESCE is standard and takes more.'),
    mc('What does `NULLIF(0, 0)` give?', ['`NULL`', '`0`', '`1`', 'An error'], 0,
      'NULLIF gives NULL when its two values are equal.'),
    mc('What does `NULLIF(15, 0)` give?', ['`NULL`', '`0`', '`15`', '`-15`'], 2,
      'The values differ, so the first one is given back.'),
    qShort('Which function gives the first of its values that is not NULL?', 'COALESCE',
      '`COALESCE(a, b, …)` returns the first non-NULL value.'),
    mc("What is `'Grace' || ' from ' || NULL`?", ["`'Grace from '`", '`NULL`', "`'Grace from NULL'`", "`'Grace'`"], 1,
      'Joining text with NULL gives NULL, which is why COALESCE helps.'),
    mc('How can NULLIF prevent dividing by zero?', ['It turns 0 into 1', 'It skips the row', 'It rounds the result', 'Dividing by NULL gives NULL instead of a wrong answer'], 3,
      '`x / NULLIF(y, 0)` gives NULL when y is 0.'),
    mc('Which still finds the orders that really have no discount?', ['`WHERE discount IS NULL`', '`WHERE COALESCE(discount, 0) = 0`', '`WHERE discount = 0`', '`WHERE NULLIF(discount, 0)`'], 0,
      'IS NULL tests for the missing value itself; the COALESCE version also finds discounts of 0.'),
  ],
})
