// Advanced queries: Filling the gaps with a calendar.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { ADVANCED_DB } from '../advanced-db.mjs'

const CAL = "WITH RECURSIVE days(day) AS (\n  SELECT MIN(sold_on) FROM sales\n  UNION ALL\n  SELECT date(day, '+1 day') FROM days\n  WHERE day < (SELECT MAX(sold_on) FROM sales)\n)\n"
const EVERY_DAY = CAL + 'SELECT d.day, COUNT(s.id) AS sales\nFROM days d\nLEFT JOIN sales s ON s.sold_on = d.day\nGROUP BY d.day\nORDER BY d.day;'

export default makeTopic({
  id: 'fill_gaps',
  title: 'Filling the gaps',
  database: ADVANCED_DB,
  paragraphs: [
    "`GROUP BY sold_on` gives one row for each day that has sales. Days with no sales simply aren't there, so a report or a chart would skip them, and a moving average over \"the last three rows\" would really cover more than three days.",
    'The fix is a **calendar**: make every day with a recursive CTE, then LEFT JOIN the data to it. Days with no sales keep their row, with NULLs from sales:',
    '```\n' + EVERY_DAY + '\n```',
    "`COUNT(s.id)` counts only matching sales, so an empty day gets 0. Sums are NULL on an empty day, so wrap them: `COALESCE(SUM(s.quantity), 0)`.",
    "With every day present, the rest is easy: `WHERE s.id IS NULL` finds the empty days, `strftime('%w', d.day)` gives the weekday (0 is Sunday), and window functions over the calendar really do cover days, not just the days that happened to have rows.",
    'The same trick works for any series with gaps: numbers, months or weeks. Make the full series first, then join.',
  ],
  sandboxCode: EVERY_DAY,
  sandboxSnippets: [
    snippet('Sales per day, gaps missing', 'SELECT sold_on, COUNT(*) AS sales\nFROM sales\nGROUP BY sold_on\nORDER BY sold_on;'),
    snippet('Every day', EVERY_DAY),
    snippet('Empty days', CAL + 'SELECT d.day\nFROM days d\nLEFT JOIN sales s ON s.sold_on = d.day\nWHERE s.id IS NULL\nORDER BY d.day;'),
  ],
  readMore: { label: 'SQLite: date and time functions', url: 'https://www.sqlite.org/lang_datefunc.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'With the gaps', {
      prompt: 'Without a calendar, show each `sold_on` that has sales and how many sales it had (`sales`). In date order. (Look for the missing days.)',
      hint: '`GROUP BY sold_on`.',
      solution: 'SELECT sold_on, COUNT(*) AS sales\nFROM sales\nGROUP BY sold_on\nORDER BY sold_on;',
    }),
    query('easy', 'Every day', {
      prompt: 'Show every `day` from the first sale to the last with its number of `sales` (0 on days with none). In date order.',
      hint: 'The lesson\'s example: a calendar CTE, LEFT JOIN sales, `COUNT(s.id)`.',
      solution: EVERY_DAY,
    }),
    query('medium', 'Empty days', {
      prompt: 'Show the days (`day`) between the first and last sale that had no sales at all. In date order.',
      hint: 'LEFT JOIN, then `WHERE s.id IS NULL`.',
      solution: CAL + 'SELECT d.day\nFROM days d\nLEFT JOIN sales s ON s.sold_on = d.day\nWHERE s.id IS NULL\nORDER BY d.day;',
    }),
    query('medium', 'Takings every day', {
      prompt: 'Show every `day` with its `takings` (quantity times price, 2 decimals, 0 on days with none). In date order.',
      hint: 'LEFT JOIN sales, then LEFT JOIN products; `ROUND(COALESCE(SUM(s.quantity * p.price), 0), 2)`.',
      solution: CAL + 'SELECT d.day, ROUND(COALESCE(SUM(s.quantity * p.price), 0), 2) AS takings\nFROM days d\nLEFT JOIN sales s ON s.sold_on = d.day\nLEFT JOIN products p ON p.id = s.product_id\nGROUP BY d.day\nORDER BY d.day;',
    }),
    query('medium', 'Named weekdays', {
      prompt: "Show every `day`, its weekday name (`weekday`: `Sun`, `Mon`, `Tue`, `Wed`, `Thu`, `Fri` or `Sat`) and its number of `sales`. In date order.",
      hint: "`CASE strftime('%w', d.day) WHEN '0' THEN 'Sun' WHEN '1' THEN 'Mon' … END`.",
      solution: CAL + "SELECT d.day,\n       CASE strftime('%w', d.day)\n         WHEN '0' THEN 'Sun' WHEN '1' THEN 'Mon' WHEN '2' THEN 'Tue' WHEN '3' THEN 'Wed'\n         WHEN '4' THEN 'Thu' WHEN '5' THEN 'Fri' ELSE 'Sat'\n       END AS weekday,\n       COUNT(s.id) AS sales\nFROM days d\nLEFT JOIN sales s ON s.sold_on = d.day\nGROUP BY d.day\nORDER BY d.day;",
    }),
    query('hard', 'Running items', {
      prompt: 'Show every `day`, its `items` (0 if none) and the running total of items so far (`items_so_far`). In date order.',
      hint: 'Group the calendar as before; add `SUM(COALESCE(SUM(s.quantity), 0)) OVER (ORDER BY d.day)`.',
      solution: CAL + 'SELECT d.day, COALESCE(SUM(s.quantity), 0) AS items,\n       SUM(COALESCE(SUM(s.quantity), 0)) OVER (ORDER BY d.day) AS items_so_far\nFROM days d\nLEFT JOIN sales s ON s.sold_on = d.day\nGROUP BY d.day\nORDER BY d.day;',
    }),
    query('hard', 'Three-day items', {
      prompt: 'Show every `day`, its `items` (0 if none) and the items of that day and the two days before it (`three_days`). Because every day is a row, two rows back really is two days back. In date order.',
      hint: '`SUM(…) OVER (ORDER BY d.day ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)`.',
      solution: CAL + 'SELECT d.day, COALESCE(SUM(s.quantity), 0) AS items,\n       SUM(COALESCE(SUM(s.quantity), 0)) OVER (ORDER BY d.day ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS three_days\nFROM days d\nLEFT JOIN sales s ON s.sold_on = d.day\nGROUP BY d.day\nORDER BY d.day;',
    }),
    query('expert', 'Quiet spells', {
      prompt: 'List each run of days in a row with no sales: `started`, `ended` and `days`. In date order.',
      hint: "Number the empty days with ROW_NUMBER. For days in a row, `julianday(day) - n` stays the same, so group by it.",
      solution: CAL + ', empty AS (\n  SELECT d.day, ROW_NUMBER() OVER (ORDER BY d.day) AS n\n  FROM days d\n  LEFT JOIN sales s ON s.sold_on = d.day\n  WHERE s.id IS NULL\n)\nSELECT MIN(day) AS started, MAX(day) AS ended, COUNT(*) AS days\nFROM empty\nGROUP BY julianday(day) - n\nORDER BY started;',
    }),
    query('expert', 'Days since a sale', {
      prompt: 'Show every `day` and how many days it had been since the last day with sales (`days_since`: 0 on a day with sales). In date order.',
      hint: 'Per calendar day, `CASE WHEN COUNT(s.id) > 0 THEN d.day END` is the day itself on sale days. Its running MAX over the calendar is the last sale day so far; subtract with julianday.',
      solution: CAL + 'SELECT d.day,\n       CAST(julianday(d.day) - julianday(MAX(CASE WHEN COUNT(s.id) > 0 THEN d.day END) OVER (ORDER BY d.day)) AS INTEGER) AS days_since\nFROM days d\nLEFT JOIN sales s ON s.sold_on = d.day\nGROUP BY d.day\nORDER BY d.day;',
    }),
  ],
  questions: [
    mc('Why are some days missing from `GROUP BY sold_on`?', ['GROUP BY skips weekends', 'The dates are text', 'COUNT skips them', 'A day with no sales has no rows to group'], 3,
      'Grouping can only show values that are in the rows.'),
    mc('What is a calendar CTE for?', ['Counting weekdays', 'Sorting dates', 'Making every day, so data can be LEFT JOINed onto it', 'Changing the date format'], 2,
      'Every day gets a row, with or without data.'),
    mc('Why LEFT JOIN, not JOIN, from the calendar?', ['It is faster', 'JOIN needs a key', 'So days with no sales keep their row', 'To remove duplicates'], 2,
      'An inner join would drop the empty days again.'),
    mc('On an empty day, what is `SUM(s.quantity)`?', ['NULL', '0', 'An error', '1'], 0,
      'Wrap it in COALESCE to show 0.'),
    qShort('Which function turns a NULL sum into 0?', 'COALESCE',
      '`COALESCE(SUM(s.quantity), 0)`.'),
    mc("What does `strftime('%w', day)` give for a Sunday?", ["'0'", "'7'", "'Sun'", "'1'"], 0,
      'Sunday is 0 and Saturday is 6, as text.'),
    mc('Why does a moving window need the calendar to cover days?', ['ROWS needs numbers', 'It doesn\'t', 'Windows can\'t read dates', 'Without it, "2 rows back" might be more than 2 days back'], 3,
      'Missing days would make the frame stretch further back.'),
    mc('How do you find the days with no sales?', ['GROUP BY day HAVING sales', 'Calendar LEFT JOIN sales, WHERE s.id IS NULL', 'NOT EXISTS (SELECT day)', 'WHERE COUNT(*) = 0'], 1,
      'No matching sale means the joined columns are NULL.'),
    mc('`COUNT(s.id)` on an empty calendar day gives…', ['1', 'An error', '0', 'NULL'], 2,
      'COUNT of a column skips NULLs.'),
    mc('Can the same trick fill gaps in numbers or months?', ['Only in views', 'Yes: make the full series, then join the data to it', 'No, only days', 'Only with GROUP BY'], 1,
      'Any series a recursive CTE can make.'),
  ],
})
