// Functions and expressions: Numbers and rounding.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { EXPRESSIONS_DB } from '../expressions-db.mjs'

export default makeTopic({
  id: 'number_functions',
  title: 'Numbers and rounding',
  database: EXPRESSIONS_DB,
  paragraphs: [
    '`ROUND(x)` rounds to a whole number and `ROUND(x, 2)` to two decimal places. Halves round away from zero, so `ROUND(2.5)` is 3. The result keeps a decimal point: `ROUND(42.5)` shows as `43.0`.',
    '`CEIL(x)` always rounds **up** to the next whole number and `FLOOR(x)` always rounds **down**: `CEIL(15.01)` is 16 and `FLOOR(15.99)` is 15. Use them when rounding the usual way would be wrong, such as counting how many boxes you need.',
    '`ABS(x)` drops the minus sign, which is handy for "how far apart": `ABS(total - 100)` is the distance from 100 either way.',
    '```\nSELECT id, total, ROUND(total) AS rounded, CEIL(total) AS up, FLOOR(total) AS down\nFROM orders;\n```',
    'Remember whole-number division from the last section: `salary / 12` drops the decimals because both numbers are whole. Divide by `12.0` to keep them, and round the result: `ROUND(salary / 12.0, 2)`.',
    '`%` gives the **remainder** of a division: `7 % 2` is 1. A number is even when `x % 2 = 0`, and `x % 10` is its last digit.',
    "Percentages work as in maths: a 15% discount on a total is `total * 15 / 100.0`, and what is left to pay is `total * (100 - 15) / 100.0`.",
  ],
  sandboxCode: 'SELECT id, total, ROUND(total) AS rounded, CEIL(total) AS up, FLOOR(total) AS down\nFROM orders;',
  sandboxSnippets: [
    snippet('Rounding', 'SELECT id, total, ROUND(total) AS rounded, CEIL(total) AS up, FLOOR(total) AS down\nFROM orders;'),
    snippet('Two decimals', 'SELECT name, ROUND(salary / 12.0, 2) AS monthly FROM employees;'),
    snippet('Distance', 'SELECT id, total, ABS(total - 100) AS distance FROM orders;'),
    snippet('Remainder', 'SELECT id, id % 2 AS remainder FROM orders;'),
    snippet('Discount', 'SELECT id, total, discount, ROUND(total * discount / 100.0, 2) AS saving\nFROM orders WHERE discount IS NOT NULL;'),
  ],
  readMore: { label: 'SQLite: maths functions', url: 'https://www.sqlite.org/lang_mathfunc.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Whole totals', {
      prompt: "Show each order's `id` and its total rounded to a whole number, in a column called `rounded`.",
      hint: '`ROUND(total) AS rounded`.',
      solution: 'SELECT id, ROUND(total) AS rounded FROM orders;',
    }),
    query('easy', 'Monthly pay', {
      prompt: "Show each employee's `name` and their salary divided by 12, rounded to 2 decimals, in a column called `monthly`.",
      hint: 'Divide by `12.0` so the decimals stay: `ROUND(salary / 12.0, 2)`.',
      solution: 'SELECT name, ROUND(salary / 12.0, 2) AS monthly FROM employees;',
    }),
    query('easy', 'Round up', {
      prompt: "Show each order's `id` and its total rounded **up** to a whole number, in a column called `rounded_up`.",
      hint: '`CEIL(total) AS rounded_up`.',
      solution: 'SELECT id, CEIL(total) AS rounded_up FROM orders;',
    }),
    query('medium', 'Round down', {
      prompt: "Show each order's `id` and its total rounded **down** to a whole number, in a column called `whole`.",
      hint: '`FLOOR(total) AS whole`.',
      solution: 'SELECT id, FLOOR(total) AS whole FROM orders;',
    }),
    query('medium', 'How much was saved', {
      prompt: 'For the orders with a discount (not NULL), show the `id`, `total` and the money saved, `total` times `discount` percent, rounded to 2 decimals, called `saving`.',
      hint: '`ROUND(total * discount / 100.0, 2) AS saving ... WHERE discount IS NOT NULL`.',
      solution: 'SELECT id, total, ROUND(total * discount / 100.0, 2) AS saving FROM orders\nWHERE discount IS NOT NULL;',
    }),
    query('medium', 'Even order numbers', {
      prompt: 'Show the `id` and `total` of the orders whose `id` is an even number.',
      hint: 'Even numbers leave no remainder when divided by 2: `WHERE id % 2 = 0`.',
      solution: 'SELECT id, total FROM orders WHERE id % 2 = 0;',
    }),
    query('hard', 'Closest to 100', {
      prompt: 'Show the `id`, `total` and distance from 100 (called `distance`, always positive) of the three orders closest to 100, closest first.',
      hint: '`ABS(total - 100) AS distance ... ORDER BY distance LIMIT 3`.',
      solution: 'SELECT id, total, ABS(total - 100) AS distance FROM orders ORDER BY distance LIMIT 3;',
    }),
    query('hard', 'Salaries in thousands', {
      prompt: "Show each employee's `name` and salary in thousands, rounded to 1 decimal (65500 becomes 65.5), in a column called `thousands`.",
      hint: '`ROUND(salary / 1000.0, 1) AS thousands`.',
      solution: 'SELECT name, ROUND(salary / 1000.0, 1) AS thousands FROM employees;',
    }),
    query('expert', 'What was paid', {
      prompt: 'For the orders with a discount, show the `id` and the amount paid after the discount, rounded to 2 decimals, called `paid`. Highest first.',
      hint: 'Paying (100 - discount) percent: `ROUND(total * (100 - discount) / 100.0, 2) AS paid`.',
      solution: 'SELECT id, ROUND(total * (100 - discount) / 100.0, 2) AS paid FROM orders\nWHERE discount IS NOT NULL\nORDER BY paid DESC;',
    }),
    query('expert', 'Weekly pay, rounded up to 10', {
      prompt: "Show each employee's `name` and their weekly pay (salary divided by 52) rounded **up** to the next multiple of 10, in a column called `weekly`. For 72000 that is 1390.",
      hint: 'Count tens, round up, multiply back: `CEIL(salary / 52.0 / 10) * 10`.',
      solution: 'SELECT name, CEIL(salary / 52.0 / 10) * 10 AS weekly FROM employees;',
    }),
  ],
  questions: [
    mc('What does `ROUND(3.14159, 2)` give?', ['`3.1`', '`3.14`', '`3.15`', '`3`'], 1,
      'Two decimal places: 3.14159 becomes 3.14.'),
    mc('What does `CEIL(15.01)` give?', ['`16`', '`15`', '`15.01`', '`15.5`'], 0,
      'CEIL always rounds up to the next whole number.'),
    mc('What does `FLOOR(15.99)` give?', ['`16`', '`15.9`', '`15`', '`14`'], 2,
      'FLOOR always rounds down.'),
    mc('What does `ABS(42 - 100)` give?', ['`-58`', '`142`', '`0`', '`58`'], 3,
      'ABS removes the minus sign: the distance is 58.'),
    qShort('What is `17 % 5`?', '2',
      '17 divided by 5 is 3 with 2 left over; `%` gives the remainder.'),
    mc('Which keeps decimals in a monthly salary?', ['`salary / 12`', '`salary / 12.0`', '`salary % 12`', '`ROUND(salary / 12)`'], 1,
      'With a decimal number in the division, the result keeps its decimals.'),
    mc('Which finds even numbers?', ['`x % 2 = 0`', '`x / 2 = 0`', '`x % 2 = 1`', '`ROUND(x / 2) = x`'], 0,
      'An even number leaves no remainder when divided by 2.'),
    mc('A total of 80 with a 25% discount. What is paid?', ['`55`', '`20`', '`60`', '`105`'], 2,
      'Paying 75%: 80 × 75 / 100 = 60.'),
    mc('What does `ROUND(2.5)` give in SQLite?', ['`2.0`', '`2.5`', 'An error', '`3.0`'], 3,
      'SQLite rounds halves away from zero, and the result keeps a decimal point.'),
    mc('You need boxes of 6 for 20 items. Which gives the number of boxes?', ['`CEIL(20 / 6.0)`', '`FLOOR(20 / 6.0)`', '`ROUND(20 / 6)`', '`20 % 6`'], 0,
      '3.33 boxes means 4 are needed, so round up.'),
  ],
})
