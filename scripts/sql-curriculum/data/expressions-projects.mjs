// Functions and expressions: the section's projects (easy, medium, hard).
import { makeProject, mc, qShort, query, snippet } from './_builders.mjs'
import { EXPRESSIONS_DB } from './expressions-db.mjs'

const customerCleanup = makeProject('easy', {
  id: 'proj_customer_cleanup',
  title: 'Customer clean-up',
  database: EXPRESSIONS_DB,
  paragraphs: [
    "The shop is sending its first newsletter, and the `customers` table needs tidying first: names in odd capitals, spaces around cities, emails in mixed case and missing phone numbers.",
    "You won't change the table itself (that comes in a later section). Instead, each challenge builds part of a clean list, and the last one puts it all together.",
    "You'll need `TRIM`, `UPPER`, `LOWER`, `SUBSTR`, `INSTR`, `COALESCE` and `||`.",
  ],
  sandboxCode: 'SELECT first_name, last_name, email, city, phone FROM customers;',
  sandboxSnippets: [
    snippet('The raw data', 'SELECT first_name, last_name, email, city, phone FROM customers;'),
    snippet('Proper capitals', 'SELECT UPPER(SUBSTR(first_name, 1, 1)) || LOWER(SUBSTR(first_name, 2)) AS first_name FROM customers;'),
    snippet('Tidy city', "SELECT COALESCE(TRIM(city), 'unknown') AS city FROM customers;"),
  ],
  readMore: { label: 'SQLite: core functions', url: 'https://www.sqlite.org/lang_corefunc.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Emails, cleaned', {
      prompt: "Show each customer's `id` and their email in lower case, called `email`, in order of `id`.",
      hint: '`LOWER(email) AS email ... ORDER BY id`.',
      solution: 'SELECT id, LOWER(email) AS email FROM customers ORDER BY id;',
    }),
    query('easy', 'Cities, cleaned', {
      prompt: "Show each customer's `id` and their city without extra spaces, or `unknown` if it is missing, called `city`.",
      hint: "`COALESCE(TRIM(city), 'unknown') AS city`.",
      solution: "SELECT id, COALESCE(TRIM(city), 'unknown') AS city FROM customers;",
    }),
    query('medium', 'Names, cleaned', {
      prompt: "Show each customer's `id`, and their first and last names each with a capital first letter and the rest in small letters, called `first_name` and `last_name`.",
      hint: 'Do the same for both: `UPPER(SUBSTR(x, 1, 1)) || LOWER(SUBSTR(x, 2))`.',
      solution: 'SELECT id,\n  UPPER(SUBSTR(first_name, 1, 1)) || LOWER(SUBSTR(first_name, 2)) AS first_name,\n  UPPER(SUBSTR(last_name, 1, 1)) || LOWER(SUBSTR(last_name, 2)) AS last_name\nFROM customers;',
    }),
    query('medium', 'Phones', {
      prompt: "Show each customer's `id` and their phone number, or `none` when it is missing, called `phone`.",
      hint: "`COALESCE(phone, 'none') AS phone`.",
      solution: "SELECT id, COALESCE(phone, 'none') AS phone FROM customers;",
    }),
    query('hard', 'Email domains', {
      prompt: "Show each customer's `id` and the part of their email after the `@`, in lower case, called `domain`. Sort by domain, then by `id`.",
      hint: "`LOWER(SUBSTR(email, INSTR(email, '@') + 1)) AS domain ... ORDER BY domain, id`.",
      solution: "SELECT id, LOWER(SUBSTR(email, INSTR(email, '@') + 1)) AS domain FROM customers ORDER BY domain, id;",
    }),
    query('hard', 'The mailing list', {
      prompt: "Put it all together: one column called `entry` like `Ben Okafor <ben.okafor@example.com>, Lagos`, with proper capitals, a lower-case email and the trimmed city (or `unknown`). Sort by the cleaned last name, then first name.",
      hint: "Build the name parts as before, join them with `||`, and sort by the same cleaned expressions (or by `LOWER(last_name), LOWER(first_name)`).",
      solution: "SELECT UPPER(SUBSTR(first_name, 1, 1)) || LOWER(SUBSTR(first_name, 2)) || ' ' ||\n       UPPER(SUBSTR(last_name, 1, 1)) || LOWER(SUBSTR(last_name, 2)) ||\n       ' <' || LOWER(email) || '>, ' || COALESCE(TRIM(city), 'unknown') AS entry\nFROM customers\nORDER BY LOWER(last_name), LOWER(first_name);",
    }),
  ],
  questions: [
    mc("What does `TRIM('  Madrid  ')` give?", ["`'Madrid'`", "`'  Madrid'`", "`'Madrid  '`", "`'MADRID'`"], 0,
      'TRIM removes spaces from both ends.'),
    mc("What does `COALESCE(TRIM(NULL), 'unknown')` give?", ['`NULL`', "`''`", "`'unknown'`", 'An error'], 2,
      'TRIM of NULL is NULL, so COALESCE uses the stand-in.'),
    mc('Why sort by `LOWER(last_name)`?', ['It is faster', 'So names in different cases sort together', 'Sorting needs lower case', 'To hide the names'], 1,
      "Capital letters sort before small ones, so 'murphy' would come after 'Silva' without it."),
    qShort("Which function finds the position of the `@` in an email?", 'INSTR',
      "`INSTR(email, '@')` gives the position of the first @."),
    mc("What does `UPPER(SUBSTR('OKAFOR', 1, 1)) || LOWER(SUBSTR('OKAFOR', 2))` give?", ["`'OKAFOR'`", "`'okafor'`", "`'OKafor'`", "`'Okafor'`"], 3,
      'A capital first letter, then the rest in small letters.'),
    mc('Does this project change the customers table?', ['No: SELECT only changes the result', 'Yes, permanently', 'Only the emails', 'Only until reload'], 0,
      'Functions in a SELECT never change the stored data.'),
  ],
})

const orderTracker = makeProject('medium', {
  id: 'proj_order_tracker',
  title: 'Order tracker',
  database: EXPRESSIONS_DB,
  paragraphs: [
    "The shop wants a page that tracks its `orders`: what state each one is in, how long shipping took, what customers actually paid, and which orders are still waiting.",
    "Take \"today\" to be 2026-10-24. A missing discount means no discount; a missing ship date means the order hasn't shipped.",
    "You'll use `CASE`, `COALESCE`, `julianday`, `strftime` and `printf`.",
  ],
  sandboxCode: 'SELECT id, order_date, ship_date, total, discount, status FROM orders;',
  sandboxSnippets: [
    snippet('All orders', 'SELECT id, order_date, ship_date, total, discount, status FROM orders;'),
    snippet('Days to ship', 'SELECT id, julianday(ship_date) - julianday(order_date) AS days FROM orders;'),
    snippet('Paid', 'SELECT id, ROUND(total * (100 - COALESCE(discount, 0)) / 100.0, 2) AS paid FROM orders;'),
  ],
  readMore: { label: 'SQLite: date and time functions', url: 'https://www.sqlite.org/lang_datefunc.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Order states', {
      prompt: "Show each order's `id` and a `state`: `on its way` for shipped orders, `to send` for pending ones and `cancelled` for cancelled ones. In order of `id`.",
      hint: "`CASE status WHEN 'shipped' THEN 'on its way' WHEN 'pending' THEN 'to send' ELSE 'cancelled' END AS state ... ORDER BY id`.",
      solution: "SELECT id,\n  CASE status WHEN 'shipped' THEN 'on its way' WHEN 'pending' THEN 'to send' ELSE 'cancelled' END AS state\nFROM orders ORDER BY id;",
    }),
    query('easy', 'Amount paid', {
      prompt: "Show each order's `id` and the amount paid after any discount, with two decimals as text (`42.50`), called `paid`.",
      hint: "`printf('%.2f', total * (100 - COALESCE(discount, 0)) / 100.0) AS paid`.",
      solution: "SELECT id, printf('%.2f', total * (100 - COALESCE(discount, 0)) / 100.0) AS paid FROM orders;",
    }),
    query('medium', 'Shipping speed', {
      prompt: "For the shipped orders, show the `id`, the days it took to ship as a whole number (`days`), and `speed`: `fast` for 2 days or less, `slow` otherwise. Slowest first; equal days in `id` order.",
      hint: "`CAST(julianday(ship_date) - julianday(order_date) AS INTEGER) AS days`, then `CASE WHEN ... <= 2 THEN 'fast' ELSE 'slow' END`.",
      solution: "SELECT id,\n  CAST(julianday(ship_date) - julianday(order_date) AS INTEGER) AS days,\n  CASE WHEN julianday(ship_date) - julianday(order_date) <= 2 THEN 'fast' ELSE 'slow' END AS speed\nFROM orders\nWHERE ship_date IS NOT NULL\nORDER BY days DESC, id;",
    }),
    query('medium', 'Still waiting', {
      prompt: "For the `pending` orders, show the `id`, `order_date` and how many whole days each has waited by 2026-10-24 (`waiting`). Longest wait first.",
      hint: "`CAST(julianday('2026-10-24') - julianday(order_date) AS INTEGER) AS waiting ... ORDER BY waiting DESC`.",
      solution: "SELECT id, order_date, CAST(julianday('2026-10-24') - julianday(order_date) AS INTEGER) AS waiting\nFROM orders\nWHERE status = 'pending'\nORDER BY waiting DESC;",
    }),
    query('hard', 'Monthly labels', {
      prompt: "Show each order's `id` and a `label` like `2026-03 #5: 230.75` (the year and month of the order, a # and the id, then the total with two decimals). Sort by `order_date`.",
      hint: "`printf('%s #%d: %.2f', strftime('%Y-%m', order_date), id, total) AS label ... ORDER BY order_date`.",
      solution: "SELECT id, printf('%s #%d: %.2f', strftime('%Y-%m', order_date), id, total) AS label\nFROM orders\nORDER BY order_date;",
    }),
    query('hard', 'The tracker', {
      prompt: "Put it together for the orders that aren't cancelled: `id`, `order_date`, `paid` (after discount, rounded to 2 decimals, as a number) and `shipping`: the ship date, or `waiting 22 days` for unshipped orders (whole days up to 2026-10-24). Newest order first.",
      hint: "`COALESCE(ship_date, printf('waiting %d days', CAST(julianday('2026-10-24') - julianday(order_date) AS INTEGER))) AS shipping`.",
      solution: "SELECT id, order_date,\n  ROUND(total * (100 - COALESCE(discount, 0)) / 100.0, 2) AS paid,\n  COALESCE(ship_date, printf('waiting %d days', CAST(julianday('2026-10-24') - julianday(order_date) AS INTEGER))) AS shipping\nFROM orders\nWHERE status <> 'cancelled'\nORDER BY order_date DESC;",
    }),
  ],
  questions: [
    mc('An order of 80 has a discount of NULL. What was paid?', ['`NULL`', '`80`', '`0`', '`72`'], 1,
      'A missing discount means none, so with COALESCE(discount, 0) the full 80 is paid.'),
    mc("What does `CAST(julianday('2026-10-24') - julianday('2026-10-02') AS INTEGER)` give?", ['`22`', '`22.0`', '`23`', "`'22'`"], 0,
      '22 days apart, cut to a whole number.'),
    mc("What does `strftime('%Y-%m', '2026-03-01')` give?", ["`'2026'`", "`'03-2026'`", "`'2026-03'`", "`'2026-03-01'`"], 2,
      'The year, a dash and the month.'),
    mc('Why use COALESCE for the shipping column?', ['To round it', 'To sort it', 'To hide shipped orders', 'To show the ship date, or a waiting message when it is missing'], 3,
      'COALESCE gives the first non-NULL value: the ship date when it exists.'),
    qShort("Which keyword closes a CASE expression?", 'END',
      'CASE … WHEN … THEN … ELSE … END.'),
    mc("Which keeps orders that aren't cancelled?", ["`WHERE status <> 'cancelled'`", "`WHERE status = 'cancelled'`", "`WHERE NOT status`", "`WHERE status IS NOT NULL`"], 0,
      '<> means not equal.'),
  ],
})

const staffReport = makeProject('hard', {
  id: 'proj_staff_report',
  title: 'Staff report',
  database: EXPRESSIONS_DB,
  paragraphs: [
    "The manager needs a staff report from the `employees` table: years of service, pay bands, monthly pay, bonuses and a one-line summary for each person.",
    'Take "today" to be 2026-10-24. A missing bonus means no bonus.',
    'This project uses the whole section: text functions, numbers, `CASE`, `COALESCE`, dates, `CAST` and `printf`.',
  ],
  sandboxCode: 'SELECT name, role, salary, hire_date, bonus FROM employees;',
  sandboxSnippets: [
    snippet('All staff', 'SELECT name, role, salary, hire_date, bonus FROM employees;'),
    snippet('Years of service', "SELECT name, CAST((julianday('2026-10-24') - julianday(hire_date)) / 365.25 AS INTEGER) AS years FROM employees;"),
    snippet('Formatted pay', "SELECT name, printf('%,d', salary) AS salary FROM employees;"),
  ],
  readMore: { label: 'SQLite: the printf function', url: 'https://www.sqlite.org/printf.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Years of service', {
      prompt: "Show each employee's `name` and their whole years of service by 2026-10-24, called `years`, as a whole number. Most years first; equal values in name order.",
      hint: "`CAST((julianday('2026-10-24') - julianday(hire_date)) / 365.25 AS INTEGER) AS years`.",
      solution: "SELECT name, CAST((julianday('2026-10-24') - julianday(hire_date)) / 365.25 AS INTEGER) AS years\nFROM employees\nORDER BY years DESC, name;",
    }),
    query('easy', 'Pay bands', {
      prompt: "Show each employee's `name`, `salary` and `band`: `A` for 65000 or more, `B` for 50000 or more, `C` for 35000 or more, and `D` otherwise. Highest salary first.",
      hint: "Strictest first: `CASE WHEN salary >= 65000 THEN 'A' WHEN salary >= 50000 THEN 'B' WHEN salary >= 35000 THEN 'C' ELSE 'D' END`.",
      solution: "SELECT name, salary,\n  CASE\n    WHEN salary >= 65000 THEN 'A'\n    WHEN salary >= 50000 THEN 'B'\n    WHEN salary >= 35000 THEN 'C'\n    ELSE 'D'\n  END AS band\nFROM employees\nORDER BY salary DESC;",
    }),
    query('medium', 'Monthly pay', {
      prompt: "Show each employee's `name` and their monthly pay (salary plus any bonus, divided by 12) with exactly two decimals, like `6416.67`, called `monthly`.",
      hint: "`printf('%.2f', (salary + COALESCE(bonus, 0)) / 12.0) AS monthly`. Without COALESCE, anyone without a bonus would get NULL.",
      solution: "SELECT name, printf('%.2f', (salary + COALESCE(bonus, 0)) / 12.0) AS monthly FROM employees;",
    }),
    query('medium', 'Initials and role', {
      prompt: "Show one column called `badge` like `ML - MANAGER`: the initials of each employee, a dash with a space on each side, and the role in capitals.",
      hint: "`SUBSTR(name, 1, 1) || SUBSTR(name, INSTR(name, ' ') + 1, 1) || ' - ' || UPPER(role) AS badge`.",
      solution: "SELECT SUBSTR(name, 1, 1) || SUBSTR(name, INSTR(name, ' ') + 1, 1) || ' - ' || UPPER(role) AS badge FROM employees;",
    }),
    query('hard', 'Anniversaries this year', {
      prompt: "Show each employee's `name` and the date of their work anniversary in 2026, called `anniversary` (the month and day they were hired, in 2026). Sort by that date.",
      hint: "`'2026' || SUBSTR(hire_date, 5) AS anniversary ... ORDER BY anniversary`. (SUBSTR from position 5 is `-MM-DD`.)",
      solution: "SELECT name, '2026' || SUBSTR(hire_date, 5) AS anniversary FROM employees ORDER BY anniversary;",
    }),
    query('hard', 'The report', {
      prompt: "One `line` per employee like `Maria Lopez, Manager since 2015 (11 years): 72,000 + 5,000 bonus`. Use `+ no bonus` when there is none. Most years first; equal years in name order.",
      hint: "Build the line with printf: `printf('%s, %s since %s (%d years): %,d + %s', name, role, strftime('%Y', hire_date), <years>, salary, <bonus part>)`. For the bonus part use CASE, because printf turns a NULL number into 0: `CASE WHEN bonus IS NULL THEN 'no bonus' ELSE printf('%,d bonus', bonus) END`. Sort by the years expression DESC, then name.",
      solution: "SELECT printf('%s, %s since %s (%d years): %,d + %s',\n    name, role, strftime('%Y', hire_date),\n    CAST((julianday('2026-10-24') - julianday(hire_date)) / 365.25 AS INTEGER),\n    salary,\n    CASE WHEN bonus IS NULL THEN 'no bonus' ELSE printf('%,d bonus', bonus) END) AS line\nFROM employees\nORDER BY CAST((julianday('2026-10-24') - julianday(hire_date)) / 365.25 AS INTEGER) DESC, name;",
    }),
  ],
  questions: [
    mc('Why divide the days by 365.25 for years of service?', ['To allow for leap years', 'Months have 30.4 days', 'It rounds the result', 'SQLite requires it'], 0,
      'Every fourth year has 366 days, so a year is about 365.25 days on average.'),
    mc("What does `printf('%.2f', 6416.666)` give?", ["`'6416.666'`", "`'6,416.67'`", "`'6416.67'`", "`'6417'`"], 2,
      '.2 keeps two decimals, rounding the last one. (The comma flag only works with %d.)'),
    mc('Which band does a salary of 50000 get with `>= 65000 A, >= 50000 B, >= 35000 C`?', ['A', 'B', 'C', 'D'], 1,
      '50000 is not 65000 or more, but it is 50000 or more.'),
    qShort("What does `SUBSTR('2015-04-01', 5)` give?", '-04-01',
      'Everything from position 5 to the end.'),
    mc('Why sort the report by hire date for "most years first"?', ['Dates sort faster', 'The years column is text', 'It is required by printf', 'Earlier hires have more years of service'], 3,
      'The earliest hire date has the most years.'),
    mc("What does `CASE WHEN bonus IS NULL THEN 'no bonus' ELSE printf('%,d bonus', bonus) END` give for a bonus of 2500?", ["`'2,500 bonus'`", "`'no bonus'`", "`'2500'`", '`NULL`'], 0,
      'The bonus exists, so the ELSE part formats it.'),
  ],
})

export const expressionsProjects = [customerCleanup, orderTracker, staffReport]
