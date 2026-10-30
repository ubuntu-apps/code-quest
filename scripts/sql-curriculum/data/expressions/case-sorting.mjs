// Functions and expressions: Sorting and filtering with CASE.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { EXPRESSIONS_DB } from '../expressions-db.mjs'

export default makeTopic({
  id: 'case_sorting',
  title: 'Sorting and filtering with CASE',
  database: EXPRESSIONS_DB,
  paragraphs: [
    "`CASE` is an expression, so it can go anywhere a value can: in `ORDER BY`, in `WHERE`, and inside calculations.",
    "**A custom order.** Alphabetical order isn't always what you want. To show pending orders first, sort by a number that `CASE` gives each row:",
    "```\nSELECT id, status FROM orders\nORDER BY CASE WHEN status = 'pending' THEN 0 ELSE 1 END, id;\n```",
    "Pending orders get 0 and the rest get 1, so the pending ones come first; `id` then orders each group. The numbers themselves aren't shown.",
    "**Different rules for different rows.** A `CASE` inside a calculation lets each row use its own rule. Here support staff get a 10% rise and everyone else 5%:",
    "```\nSELECT name, salary,\n  ROUND(salary * CASE WHEN role = 'Support' THEN 1.10 ELSE 1.05 END) AS new_salary\nFROM employees;\n```",
    '**Filtering on a worked-out value.** In `WHERE`, a `CASE` can work out the value to compare. This finds orders worth more than 100 after their discount, treating a missing discount as none:',
    "```\nSELECT id, total, discount FROM orders\nWHERE CASE WHEN discount IS NULL THEN total\n           ELSE total * (100 - discount) / 100.0 END > 100;\n```",
    "Dates written as `YYYY-MM-DD` compare correctly as text, because the year comes first: `hire_date < '2020-01-01'` means \"hired before 2020\". The next stages do much more with dates.",
  ],
  sandboxCode: "SELECT id, status FROM orders\nORDER BY CASE WHEN status = 'pending' THEN 0 ELSE 1 END, id;",
  sandboxSnippets: [
    snippet('Pending first', "SELECT id, status FROM orders\nORDER BY CASE WHEN status = 'pending' THEN 0 ELSE 1 END, id;"),
    snippet('Role order', "SELECT name, role FROM employees\nORDER BY CASE role WHEN 'Manager' THEN 1 WHEN 'Developer' THEN 2 ELSE 3 END, name;"),
    snippet('Different rises', "SELECT name, salary,\n  ROUND(salary * CASE WHEN role = 'Support' THEN 1.10 ELSE 1.05 END) AS new_salary\nFROM employees;"),
    snippet('CASE in WHERE', "SELECT id, total, discount FROM orders\nWHERE CASE WHEN discount IS NULL THEN total\n           ELSE total * (100 - discount) / 100.0 END > 100;"),
    snippet('Dates as text', "SELECT name, hire_date FROM employees WHERE hire_date < '2020-01-01';"),
  ],
  readMore: { label: 'SQLite: the CASE expression', url: 'https://www.sqlite.org/lang_expr.html#case', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Pending first', {
      prompt: 'Show the `id` and `status` of every order, with the pending orders first. Within each group, sort by `id`.',
      hint: "`ORDER BY CASE WHEN status = 'pending' THEN 0 ELSE 1 END, id`.",
      solution: "SELECT id, status FROM orders\nORDER BY CASE WHEN status = 'pending' THEN 0 ELSE 1 END, id;",
    }),
    query('easy', 'Managers, then developers', {
      prompt: "Show each employee's `name` and `role`: managers first, then developers, then everyone else. Within each group, sort by name.",
      hint: "`ORDER BY CASE role WHEN 'Manager' THEN 1 WHEN 'Developer' THEN 2 ELSE 3 END, name`.",
      solution: "SELECT name, role FROM employees\nORDER BY CASE role WHEN 'Manager' THEN 1 WHEN 'Developer' THEN 2 ELSE 3 END, name;",
    }),
    query('easy', 'Pay rise', {
      prompt: "Show each employee's `name`, `salary` and `new_salary`: 10% more for `Support` staff and 5% more for everyone else, rounded to a whole number.",
      hint: "`ROUND(salary * CASE WHEN role = 'Support' THEN 1.10 ELSE 1.05 END) AS new_salary`.",
      solution: "SELECT name, salary,\n  ROUND(salary * CASE WHEN role = 'Support' THEN 1.10 ELSE 1.05 END) AS new_salary\nFROM employees;",
    }),
    query('medium', 'Status order', {
      prompt: 'Show the `id`, `status` and `order_date` of every order: pending first, then shipped, then cancelled. Within each status, oldest first.',
      hint: "`ORDER BY CASE status WHEN 'pending' THEN 1 WHEN 'shipped' THEN 2 ELSE 3 END, order_date`.",
      solution: "SELECT id, status, order_date FROM orders\nORDER BY CASE status WHEN 'pending' THEN 1 WHEN 'shipped' THEN 2 ELSE 3 END, order_date;",
    }),
    query('medium', 'Over 100 after discount', {
      prompt: 'Show the `id` and `total` of the orders worth more than 100 after their discount. A missing discount means no discount.',
      hint: 'Work out the value with CASE in WHERE: `WHERE CASE WHEN discount IS NULL THEN total ELSE total * (100 - discount) / 100.0 END > 100`.',
      solution: 'SELECT id, total FROM orders\nWHERE CASE WHEN discount IS NULL THEN total\n           ELSE total * (100 - discount) / 100.0 END > 100;',
    }),
    query('medium', 'Reward points', {
      prompt: "Show each order's `id`, `total` and `points`: double the total for orders of 100 or more, the total itself otherwise, rounded **down** to a whole number.",
      hint: '`FLOOR(CASE WHEN total >= 100 THEN total * 2 ELSE total END) AS points`.',
      solution: 'SELECT id, total, FLOOR(CASE WHEN total >= 100 THEN total * 2 ELSE total END) AS points FROM orders;',
    }),
    query('hard', 'Biggest group first', {
      prompt: 'Show the `id` and `total` of every order: first those of 100 or more, then those of 50 or more, then the rest. Within each group, newest `order_date` first.',
      hint: "`ORDER BY CASE WHEN total >= 100 THEN 1 WHEN total >= 50 THEN 2 ELSE 3 END, order_date DESC`.",
      solution: 'SELECT id, total FROM orders\nORDER BY CASE WHEN total >= 100 THEN 1 WHEN total >= 50 THEN 2 ELSE 3 END, order_date DESC;',
    }),
    query('hard', 'Veterans', {
      prompt: "Show each employee's `name`, `hire_date` and a `group`: `veteran` if hired before 2020, `newer` otherwise.",
      hint: "Dates compare as text: `CASE WHEN hire_date < '2020-01-01' THEN 'veteran' ELSE 'newer' END AS \"group\"`. (`group` is an SQL word, so put the name in double quotes.)",
      solution: "SELECT name, hire_date,\n  CASE WHEN hire_date < '2020-01-01' THEN 'veteran' ELSE 'newer' END AS \"group\"\nFROM employees;",
    }),
    query('expert', 'Missing cities last', {
      prompt: "Show each customer's `first_name` and `city`, sorted by the city without its extra spaces (A to Z), with the customers who have no city at the end.",
      hint: 'Put NULLs last with CASE, then sort by the trimmed city: `ORDER BY CASE WHEN city IS NULL THEN 1 ELSE 0 END, TRIM(city)`.',
      solution: 'SELECT first_name, city FROM customers\nORDER BY CASE WHEN city IS NULL THEN 1 ELSE 0 END, TRIM(city);',
    }),
    query('expert', 'Bonus or 2%', {
      prompt: "Show each employee's `name` and `bonus`: their bonus if they have one, otherwise 2% of their salary, rounded to a whole number. Largest bonus first; equal bonuses in name order.",
      hint: '`CASE WHEN bonus IS NULL THEN ROUND(salary * 0.02) ELSE bonus END AS bonus ... ORDER BY bonus DESC, name`.',
      solution: 'SELECT name, CASE WHEN bonus IS NULL THEN ROUND(salary * 0.02) ELSE bonus END AS bonus\nFROM employees\nORDER BY bonus DESC, name;',
    }),
  ],
  questions: [
    mc('Where can a CASE expression go?', ['Only in SELECT', 'Only in ORDER BY', 'Anywhere a value can: SELECT, WHERE, ORDER BY, calculations', 'Only in WHERE'], 2,
      'CASE gives a value, so it can be used wherever a value is allowed.'),
    mc("With `ORDER BY CASE WHEN status = 'pending' THEN 0 ELSE 1 END`, which rows come first?", ['Pending orders', 'Shipped orders', 'Cancelled orders', 'In id order'], 0,
      'Pending rows sort as 0, before every other row (1).'),
    mc('Are the numbers from a CASE in ORDER BY shown in the result?', ['Yes, as a new column', 'Only the first one', 'Only with AS', "No, they're only used for sorting"], 3,
      'Expressions in ORDER BY decide the order without being shown.'),
    mc('Why add `, id` after the CASE in ORDER BY?', ['It is required', 'To sort the rows inside each group', 'To show the id', 'To filter by id'], 1,
      'The second sort key orders rows that the CASE puts in the same group.'),
    qShort("Complete the sort to put NULL cities last: `ORDER BY CASE WHEN city IS NULL THEN 1 ELSE ___ END`", '0',
      'Rows with a city get 0 and sort before the NULL ones (1).'),
    mc("Why does `hire_date < '2020-01-01'` work on text dates?", ['SQLite turns them into numbers', 'It only works for 2020', 'YYYY-MM-DD text sorts in date order', "It doesn't work"], 2,
      'With the year first, then month, then day, alphabetical order is date order.'),
    mc("What does `salary * CASE WHEN role = 'Support' THEN 1.10 ELSE 1.05 END` do?", ['Gives Support staff 10% more and everyone else 5%', 'Gives everyone 15% more', 'Filters to Support staff', 'Gives an error'], 0,
      'The CASE picks the multiplier for each row.'),
    mc('Can CASE be used in WHERE?', ['No', 'Only with ELSE', 'Only for text', 'Yes, it gives a value to compare'], 3,
      'For example `WHERE CASE … END > 100` compares the value CASE works out.'),
    mc('Which puts managers first, then everyone else in name order?', ["`ORDER BY name, role = 'Manager'`", "`ORDER BY CASE WHEN role = 'Manager' THEN 0 ELSE 1 END, name`", "`ORDER BY role DESC`", "`WHERE role = 'Manager' ORDER BY name`"], 1,
      'CASE gives managers the smallest sort value; name orders each group.'),
    mc('Why must `group` be in double quotes as a column name?', ['GROUP is an SQL keyword', 'It has a space', 'Names must always be quoted', 'It is too short'], 0,
      'GROUP is part of SQL (GROUP BY), so as a name it needs double quotes.'),
  ],
})
