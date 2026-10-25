// Summarising data: Counting rows with COUNT.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { AGGREGATION_DB } from '../aggregation-db.mjs'

export default makeTopic({
  id: 'count_rows',
  title: 'Counting rows: COUNT',
  database: AGGREGATION_DB,
  paragraphs: [
    "So far every query showed rows. This section is about **summarising** them: how many sales, how much money, the average score. The database is new: two weeks of `sales` at a small café chain with three stores, and a class's exam `results`. Open **Tables** to see the columns.",
    "An **aggregate function** turns many rows into one value. `COUNT(*)` counts rows:",
    '```\nSELECT COUNT(*) AS sales FROM sales;\n```',
    'The result is a single row with a single number. With `WHERE`, only the matching rows are counted:',
    "```\nSELECT COUNT(*) AS card_sales FROM sales WHERE payment = 'card';\n```",
    "`COUNT(column)` counts only the rows where that column **has a value**, skipping `NULL`. A few payments weren't recorded, so `COUNT(payment)` is smaller than `COUNT(*)`, and the difference is the number of missing values.",
    '```\nSELECT COUNT(*) AS all_sales, COUNT(payment) AS recorded,\n       COUNT(*) - COUNT(payment) AS missing\nFROM sales;\n```',
    'As with any calculated column, name each count with `AS`.',
  ],
  sandboxCode: 'SELECT COUNT(*) AS sales FROM sales;',
  sandboxSnippets: [
    snippet('Count every row', 'SELECT COUNT(*) AS sales FROM sales;'),
    snippet('Count with WHERE', "SELECT COUNT(*) AS card_sales FROM sales WHERE payment = 'card';"),
    snippet('Values, not rows', 'SELECT COUNT(*) AS all_sales, COUNT(payment) AS recorded,\n       COUNT(*) - COUNT(payment) AS missing\nFROM sales;'),
    snippet('Exams', 'SELECT COUNT(*) AS results, COUNT(score) AS taken FROM results;'),
  ],
  readMore: { label: 'SQLite: aggregate functions', url: 'https://www.sqlite.org/lang_aggfunc.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'How many sales?', {
      prompt: 'Count the rows in the `sales` table, in a column called `sales`.',
      hint: '`SELECT COUNT(*) AS sales FROM sales;`',
      solution: 'SELECT COUNT(*) AS sales FROM sales;',
    }),
    query('easy', 'Card payments', {
      prompt: 'Count the sales paid by `card`, in a column called `card_sales`.',
      hint: "`COUNT(*) ... WHERE payment = 'card'`.",
      solution: "SELECT COUNT(*) AS card_sales FROM sales WHERE payment = 'card';",
    }),
    query('medium', 'Recorded payments', {
      prompt: 'Count how many sales have a payment method recorded (not NULL), in a column called `recorded`. Use `COUNT` on the column.',
      hint: '`COUNT(payment)` skips the NULLs.',
      solution: 'SELECT COUNT(payment) AS recorded FROM sales;',
    }),
    query('medium', 'Coffee at North', {
      prompt: 'Count the `Coffee` sales at the `North` store, in a column called `coffees`.',
      hint: "`WHERE store = 'North' AND category = 'Coffee'`.",
      solution: "SELECT COUNT(*) AS coffees FROM sales WHERE store = 'North' AND category = 'Coffee';",
    }),
    query('hard', 'Missing payments', {
      prompt: 'Show how many sales have no payment method recorded, in a column called `missing`, by subtracting one count from another.',
      hint: 'All rows minus the rows with a value: `COUNT(*) - COUNT(payment)`.',
      solution: 'SELECT COUNT(*) - COUNT(payment) AS missing FROM sales;',
    }),
    query('hard', 'Big sales', {
      prompt: 'Count the sales of 5 or more items (`quantity`), in a column called `big_sales`.',
      hint: '`WHERE quantity >= 5`.',
      solution: 'SELECT COUNT(*) AS big_sales FROM sales WHERE quantity >= 5;',
    }),
    query('expert', 'The first week', {
      prompt: 'Count the sales from 2026-10-01 to 2026-10-07 (both included), in a column called `first_week`.',
      hint: "`WHERE sale_date BETWEEN '2026-10-01' AND '2026-10-07'`.",
      solution: "SELECT COUNT(*) AS first_week FROM sales WHERE sale_date BETWEEN '2026-10-01' AND '2026-10-07';",
    }),
  ],
  questions: [
    mc('What does an aggregate function do?', ['Turns many rows into one value', 'Adds a column to the table', 'Sorts the rows', 'Joins two tables'], 0,
      'Aggregates such as COUNT, SUM and AVG summarise many rows into one value.'),
    mc('What does `COUNT(*)` count?', ['Columns', 'Rows', 'Values that are not NULL', 'Different values'], 1,
      'COUNT(*) counts every row, whatever is in it.'),
    mc('What does `COUNT(payment)` count?', ['Every row', 'The different payment methods', 'The rows where payment is not NULL', 'The NULLs'], 2,
      'COUNT on a column skips the rows where that column is NULL.'),
    qShort('A table has 30 rows and 3 NULL payments. What is `COUNT(payment)`?', '27',
      '30 rows minus the 3 without a value.'),
    mc("How do you count only the card sales?", ["`COUNT('card')`", '`COUNT(payment = card)`', '`COUNT(*) GROUP card`', "`COUNT(*) ... WHERE payment = 'card'`"], 3,
      'WHERE picks the rows first, then COUNT counts them.'),
    mc('How many rows does `SELECT COUNT(*) FROM sales` return?', ['One', 'One per sale', 'None', 'One per store'], 0,
      'Without grouping, an aggregate gives a single row.'),
    mc('Which gives the number of missing scores?', ['`COUNT(NULL)`', '`COUNT(*) - COUNT(score)`', '`COUNT(score)`', '`COUNT(score IS NULL)`'], 1,
      'All rows minus the rows with a score leaves the missing ones.'),
    mc('Why name a count with AS?', ["It's required", 'To change the count', 'So the heading says what it is, instead of COUNT(*)', 'To make it faster'], 2,
      'Like any calculated column, it is headed by its expression unless you name it.'),
    mc('What does `COUNT(*)` give for a WHERE that matches no rows?', ['`0`', '`NULL`', 'No result row', 'An error'], 0,
      'Counting nothing gives 0, in a single row.'),
  ],
})
