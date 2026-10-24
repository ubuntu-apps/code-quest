// Functions and expressions: Dates.
import { makeTopic, mc, qPattern, query, snippet } from '../_builders.mjs'
import { EXPRESSIONS_DB } from '../expressions-db.mjs'

export default makeTopic({
  id: 'dates',
  title: 'Dates',
  database: EXPRESSIONS_DB,
  paragraphs: [
    "SQLite has no separate date type: dates are usually stored as text in the form `YYYY-MM-DD`, such as `2026-03-01`. That form is chosen on purpose. With the year first, then the month, then the day, sorting the text alphabetically also sorts the dates, and comparisons work too:",
    "```\nSELECT id, order_date FROM orders\nWHERE order_date BETWEEN '2026-03-01' AND '2026-03-31'\nORDER BY order_date;\n```",
    "Months and days always have two digits (`03`, not `3`): without them, `'2026-10-02'` would sort before `'2026-9-28'`.",
    "`strftime(format, date)` takes the parts you want out of a date, as text. `%Y` is the year, `%m` the month, `%d` the day, `%w` the day of the week (`0` is Sunday, `6` is Saturday) and `%j` the day of the year. Other characters are kept as they are:",
    "```\nSELECT order_date,\n  strftime('%Y', order_date) AS year,\n  strftime('%m', order_date) AS month,\n  strftime('%d/%m/%Y', order_date) AS written\nFROM orders;\n```",
    "Because the parts are text, compare them with text: `strftime('%Y', joined) = '2024'`, or `strftime('%w', order_date) IN ('0', '6')` for weekends.",
    "`date(text)` gives a date in the standard form (or `NULL` if the text isn't a date). `date('now')` is today's date, but its result changes every day, so the challenges here use fixed dates.",
  ],
  sandboxCode: "SELECT order_date,\n  strftime('%Y', order_date) AS year,\n  strftime('%m', order_date) AS month,\n  strftime('%d/%m/%Y', order_date) AS written\nFROM orders;",
  sandboxSnippets: [
    snippet('Parts of a date', "SELECT order_date,\n  strftime('%Y', order_date) AS year,\n  strftime('%m', order_date) AS month,\n  strftime('%d/%m/%Y', order_date) AS written\nFROM orders;"),
    snippet('A date range', "SELECT id, order_date FROM orders\nWHERE order_date BETWEEN '2026-03-01' AND '2026-03-31'\nORDER BY order_date;"),
    snippet('Day of the week', "SELECT order_date, strftime('%w', order_date) AS weekday FROM orders;"),
    snippet('Joined in 2024', "SELECT first_name, joined FROM customers WHERE strftime('%Y', joined) = '2024';"),
    snippet('Today', "SELECT date('now') AS today;"),
  ],
  readMore: { label: 'SQLite: date and time functions', url: 'https://www.sqlite.org/lang_datefunc.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Orders in March', {
      prompt: 'Show the `id` and `order_date` of the orders placed in March 2026.',
      hint: "`WHERE order_date BETWEEN '2026-03-01' AND '2026-03-31'`.",
      solution: "SELECT id, order_date FROM orders WHERE order_date BETWEEN '2026-03-01' AND '2026-03-31';",
    }),
    query('easy', 'Newest first', {
      prompt: 'Show the `id` and `order_date` of every order, newest first.',
      hint: '`ORDER BY order_date DESC`: dates in this form sort correctly as text.',
      solution: 'SELECT id, order_date FROM orders ORDER BY order_date DESC;',
    }),
    query('easy', 'Year hired', {
      prompt: "Show each employee's `name` and the year they were hired, in a column called `year`.",
      hint: "`strftime('%Y', hire_date) AS year`.",
      solution: "SELECT name, strftime('%Y', hire_date) AS year FROM employees;",
    }),
    query('medium', 'Joined in 2024', {
      prompt: 'Show the `first_name` and `joined` date of the customers who joined in 2024.',
      hint: "`WHERE strftime('%Y', joined) = '2024'` (text, so in quotes).",
      solution: "SELECT first_name, joined FROM customers WHERE strftime('%Y', joined) = '2024';",
    }),
    query('medium', 'Order months', {
      prompt: "Show each order's `id` and the month it was placed (`01` to `12`), in a column called `month`.",
      hint: "`strftime('%m', order_date) AS month`.",
      solution: "SELECT id, strftime('%m', order_date) AS month FROM orders;",
    }),
    query('medium', 'Hired before 2020', {
      prompt: 'Show the `name` and `hire_date` of the employees hired before 2020, earliest first.',
      hint: "`WHERE hire_date < '2020-01-01' ORDER BY hire_date`.",
      solution: "SELECT name, hire_date FROM employees WHERE hire_date < '2020-01-01' ORDER BY hire_date;",
    }),
    query('hard', 'Day of the week', {
      prompt: "Show each order's `id`, `order_date` and its day of the week as a number (0 for Sunday to 6 for Saturday), called `weekday`.",
      hint: "`strftime('%w', order_date) AS weekday`.",
      solution: "SELECT id, order_date, strftime('%w', order_date) AS weekday FROM orders;",
    }),
    query('hard', 'Weekend orders', {
      prompt: 'Show the `id` and `order_date` of the orders placed on a Saturday or Sunday.',
      hint: "Sunday is `'0'` and Saturday `'6'`: `WHERE strftime('%w', order_date) IN ('0', '6')`.",
      solution: "SELECT id, order_date FROM orders WHERE strftime('%w', order_date) IN ('0', '6');",
    }),
    query('expert', 'Day/month/year', {
      prompt: "Show each order's `id` and its date written as day/month/year, like `05/01/2026`, in a column called `written`.",
      hint: "Other characters in the format are kept: `strftime('%d/%m/%Y', order_date)`.",
      solution: "SELECT id, strftime('%d/%m/%Y', order_date) AS written FROM orders;",
    }),
    query('expert', 'Early in the month', {
      prompt: 'Show the `id` and `order_date` of the orders placed on the 1st to the 5th of a month, oldest first.',
      hint: "The day as text: `WHERE strftime('%d', order_date) <= '05' ORDER BY order_date`.",
      solution: "SELECT id, order_date FROM orders WHERE strftime('%d', order_date) <= '05' ORDER BY order_date;",
    }),
  ],
  questions: [
    mc('How does SQLite usually store a date?', ['As a number of seconds', "As text like '2026-03-01'", 'In a DATE type', 'As three columns'], 1,
      'SQLite stores dates as text (or numbers); the YYYY-MM-DD text form is the usual choice.'),
    mc('Why does `YYYY-MM-DD` text sort in date order?', ['The year comes first, then the month, then the day', 'SQLite sorts dates specially', 'Because of the dashes', 'It only works for one year'], 0,
      'With the largest unit first and two-digit months and days, alphabetical order is date order.'),
    mc("What does `strftime('%Y', '2026-03-01')` give?", ["`'03'`", '`2026` as a number', "`'2026'`", "`'01'`"], 2,
      '%Y is the year, given back as text.'),
    mc("What does `strftime('%w', date)` give for a Sunday?", ["`'7'`", "`'Sunday'`", "`'1'`", "`'0'`"], 3,
      '%w counts the days of the week from 0 (Sunday) to 6 (Saturday).'),
    qPattern("Which `strftime` code gives the month, like `03`? (Capitals matter.)", '^\\s*%m\\s*$', '%m',
      "`%m` is the two-digit month; `%M` would be minutes."),
    mc("Which finds the customers who joined in 2024?", ["`WHERE strftime('%Y', joined) = '2024'`", '`WHERE joined = 2024`', "`WHERE strftime('%m', joined) = '2024'`", "`WHERE joined LIKE '%2024'`"], 0,
      'Take the year out of the date and compare it with the text 2024.'),
    mc("What does `strftime('%d/%m/%Y', '2026-01-05')` give?", ["`'2026/01/05'`", "`'5/1/2026'`", "`'05/01/2026'`", "`'01/05/2026'`"], 2,
      '%d is the day, %m the month and %Y the year; the slashes are kept.'),
    mc('Why do challenges avoid `date(\'now\')`?', ['It is not SQL', 'Its result changes every day', 'It gives an error in SQLite', 'It is slow'], 1,
      "'now' depends on the day the query runs, so a fixed date gives repeatable results."),
    mc("Is `'2026-10-02' > '2026-09-28'`?", ['No, 0 is less than 9', 'Only with date()', 'It gives an error', 'Yes'], 3,
      "Compared character by character, '10' comes after '09', so October is later."),
    mc("Which keeps the orders from March 2026?", ["`order_date BETWEEN '2026-03-01' AND '2026-03-31'`", "`order_date = '2026-03'`", "`order_date > '2026-03'`", '`order_date BETWEEN 3 AND 3`'], 0,
      'A range from the first to the last day of the month, both included.'),
  ],
})
