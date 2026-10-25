// Functions and expressions: Date arithmetic.
import { makeTopic, mc, qPattern, query, snippet } from '../_builders.mjs'
import { EXPRESSIONS_DB } from '../expressions-db.mjs'

export default makeTopic({
  id: 'date_arithmetic',
  title: 'Date arithmetic',
  database: EXPRESSIONS_DB,
  paragraphs: [
    "`date(date, modifier, …)` moves a date. Modifiers like `'+7 days'`, `'-1 month'` or `'+1 year'` add or take away time, and SQLite handles the different lengths of months and leap years:",
    "```\nSELECT order_date,\n  date(order_date, '+7 days') AS due,\n  date(order_date, '+1 month') AS next_month\nFROM orders;\n```",
    "`'start of month'` goes back to the 1st of the month. Modifiers apply in order, so `date(d, 'start of month', '+1 month', '-1 day')` is the last day of `d`'s month.",
    '**How far apart?** `julianday(date)` turns a date into a number of days, so subtracting two of them gives the days in between:',
    "```\nSELECT id, julianday(ship_date) - julianday(order_date) AS days_to_ship\nFROM orders WHERE ship_date IS NOT NULL;\n```",
    'The result can have decimals (it counts time of day too), so it shows as `2.0`. For dates without times it is always a whole number of days.',
    "Comparisons and modifiers combine: `ship_date <= date(order_date, '+1 day')` means \"shipped by the next day\".",
    "Challenges use the fixed date `'2026-10-24'` as \"today\" so their answers don't change. In real queries you would write `date('now')`.",
    'For whole years, divide the days by 365.25 (counting leap years) and round down: `FLOOR((julianday(\'2026-10-24\') - julianday(hire_date)) / 365.25)`.',
  ],
  sandboxCode: "SELECT order_date,\n  date(order_date, '+7 days') AS due,\n  date(order_date, '+1 month') AS next_month\nFROM orders;",
  sandboxSnippets: [
    snippet('Add days', "SELECT order_date,\n  date(order_date, '+7 days') AS due,\n  date(order_date, '+1 month') AS next_month\nFROM orders;"),
    snippet('Days between', 'SELECT id, julianday(ship_date) - julianday(order_date) AS days_to_ship\nFROM orders WHERE ship_date IS NOT NULL;'),
    snippet('Month start and end', "SELECT order_date,\n  date(order_date, 'start of month') AS first_day,\n  date(order_date, 'start of month', '+1 month', '-1 day') AS last_day\nFROM orders;"),
    snippet('Days since joining', "SELECT first_name, julianday('2026-10-24') - julianday(joined) AS days\nFROM customers;"),
    snippet('Leap years', "SELECT date('2024-02-28', '+1 day') AS leap, date('2026-02-28', '+1 day') AS normal;"),
  ],
  readMore: { label: 'SQLite: date and time functions', url: 'https://www.sqlite.org/lang_datefunc.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Due in a week', {
      prompt: "Show each order's `id`, `order_date` and the date one week later, called `due`.",
      hint: "`date(order_date, '+7 days') AS due`.",
      solution: "SELECT id, order_date, date(order_date, '+7 days') AS due FROM orders;",
    }),
    query('easy', 'Days to ship', {
      prompt: 'For the orders that have shipped, show the `id` and the number of days between ordering and shipping, called `days`.',
      hint: '`julianday(ship_date) - julianday(order_date) AS days ... WHERE ship_date IS NOT NULL`.',
      solution: 'SELECT id, julianday(ship_date) - julianday(order_date) AS days FROM orders\nWHERE ship_date IS NOT NULL;',
    }),
    query('easy', 'One-year anniversary', {
      prompt: "Show each customer's `first_name` and the date one year after they joined, called `anniversary`.",
      hint: "`date(joined, '+1 year') AS anniversary`.",
      solution: "SELECT first_name, date(joined, '+1 year') AS anniversary FROM customers;",
    }),
    query('medium', 'Slow shipping', {
      prompt: 'Show the `id`, `order_date` and `ship_date` of the orders that took more than 3 days to ship.',
      hint: '`WHERE julianday(ship_date) - julianday(order_date) > 3`. Unshipped orders drop out on their own: the difference is NULL.',
      solution: 'SELECT id, order_date, ship_date FROM orders\nWHERE julianday(ship_date) - julianday(order_date) > 3;',
    }),
    query('medium', 'First of the month', {
      prompt: "Show each order's `id` and the first day of the month it was placed in, called `month_start`.",
      hint: "`date(order_date, 'start of month') AS month_start`.",
      solution: "SELECT id, date(order_date, 'start of month') AS month_start FROM orders;",
    }),
    query('medium', 'Days as a customer', {
      prompt: "Show each customer's `first_name` and how many days they had been a customer on 2026-10-24, called `days`.",
      hint: "`julianday('2026-10-24') - julianday(joined) AS days`.",
      solution: "SELECT first_name, julianday('2026-10-24') - julianday(joined) AS days FROM customers;",
    }),
    query('hard', 'Waiting orders', {
      prompt: "For the `pending` orders, show the `id` and how many days they had been waiting on 2026-10-24, called `waiting`. Longest wait first.",
      hint: "`julianday('2026-10-24') - julianday(order_date) AS waiting ... ORDER BY waiting DESC`.",
      solution: "SELECT id, julianday('2026-10-24') - julianday(order_date) AS waiting FROM orders\nWHERE status = 'pending'\nORDER BY waiting DESC;",
    }),
    query('hard', 'Last day of the month', {
      prompt: "Show each order's `id` and the last day of the month it was placed in, called `month_end`.",
      hint: "Start of month, forward a month, back a day: `date(order_date, 'start of month', '+1 month', '-1 day')`.",
      solution: "SELECT id, date(order_date, 'start of month', '+1 month', '-1 day') AS month_end FROM orders;",
    }),
    query('expert', 'Years of service', {
      prompt: "Show each employee's `name` and their whole years of service on 2026-10-24, called `years`. Longest first; equal values in name order.",
      hint: "Days divided by 365.25, rounded down: `FLOOR((julianday('2026-10-24') - julianday(hire_date)) / 365.25) AS years`.",
      solution: "SELECT name, FLOOR((julianday('2026-10-24') - julianday(hire_date)) / 365.25) AS years\nFROM employees\nORDER BY years DESC, name;",
    }),
    query('expert', 'Shipped by the next day', {
      prompt: 'Show the `id`, `order_date` and `ship_date` of the orders shipped on the day they were placed or the day after.',
      hint: "`WHERE ship_date <= date(order_date, '+1 day')`.",
      solution: "SELECT id, order_date, ship_date FROM orders\nWHERE ship_date <= date(order_date, '+1 day');",
    }),
  ],
  questions: [
    mc("What does `date('2026-01-30', '+7 days')` give?", ["`'2026-01-37'`", "`'2026-02-06'`", "`'2026-02-07'`", 'An error'], 1,
      'SQLite moves into the next month: 30 January plus 7 days is 6 February.'),
    mc("What does `date('2026-05-17', 'start of month')` give?", ["`'2026-05-01'`", "`'2026-05-17'`", "`'2026-01-01'`", "`'2026-06-01'`"], 0,
      "'start of month' goes back to the 1st of the same month."),
    mc('What does `julianday(a) - julianday(b)` give?', ['A date', 'The number of months between', 'The number of days between', 'Text'], 2,
      'julianday turns each date into a day count, so the difference is in days.'),
    mc("How do you get the last day of a date's month?", ["`date(d, '+1 month')`", "`date(d, 'end of month')`", "`date(d, '-1 day')`", "`date(d, 'start of month', '+1 month', '-1 day')`"], 3,
      'Go to the 1st, forward a month, then back a day. (There is no end of month modifier.)'),
    qPattern("Complete the modifier that adds a year: `date(joined, '___')`", '^\\s*\\+\\s*1\\s+years?\\s*$', '+1 year',
      "Modifiers like '+1 year', '-3 months' and '+7 days' move a date."),
    mc('Why does a day difference show as `2.0`?', ['julianday counts fractions of days too, so the result is a decimal number', 'It is a rounding error', 'Dates are always decimals', 'Because of the time zone'], 0,
      'julianday includes the time of day, so its numbers have decimals.'),
    mc("What does `date('2024-02-28', '+1 day')` give?", ["`'2024-03-01'`", "`'2024-02-30'`", "`'2024-02-28'`", "`'2024-02-29'`"], 3,
      '2024 is a leap year, and SQLite knows it.'),
    mc('How do you turn a number of days into whole years?', ['Divide by 365.25 and round down', 'Divide by 12', 'Multiply by 365', 'Use `%Y`'], 0,
      '365.25 days per year allows for leap years; FLOOR keeps whole years.'),
    mc("Which finds orders shipped by the next day?", ["`ship_date = order_date + 1`", "`ship_date < order_date`", "`ship_date <= date(order_date, '+1 day')`", "`julianday(ship_date) = 1`"], 2,
      "Adding text dates with + doesn't work; move the date with a modifier, then compare."),
  ],
})
