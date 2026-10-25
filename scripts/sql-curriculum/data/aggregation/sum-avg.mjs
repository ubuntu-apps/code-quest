// Summarising data: SUM, AVG, MIN and MAX.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { AGGREGATION_DB } from '../aggregation-db.mjs'

export default makeTopic({
  id: 'sum_avg',
  title: 'SUM, AVG, MIN and MAX',
  database: AGGREGATION_DB,
  paragraphs: [
    '`SUM(x)` adds up a column, `AVG(x)` gives its average (the mean), and `MIN(x)` and `MAX(x)` the smallest and largest values. Several can go in one query:',
    '```\nSELECT SUM(quantity) AS items, MIN(quantity) AS smallest, MAX(quantity) AS largest\nFROM sales;\n```',
    'They work on calculations too. Each sale\'s value is `quantity * unit_price`, so the total takings are:',
    '```\nSELECT ROUND(SUM(quantity * unit_price), 2) AS revenue FROM sales;\n```',
    'Averages rarely come out round, so they are usually rounded: `ROUND(AVG(score), 1)`.',
    "All of them **skip NULL**. An absent exam doesn't count as 0: `AVG(score)` is the average of the exams that were taken. If you wanted absences to count as 0, you'd divide the sum by every row: `SUM(score) * 1.0 / COUNT(*)`. Which one is right depends on the question.",
    "`MIN` and `MAX` also work on text (alphabetical order) and on dates written as `YYYY-MM-DD`: `MIN(sale_date)` is the first day of sales.",
  ],
  sandboxCode: 'SELECT SUM(quantity) AS items, MIN(quantity) AS smallest, MAX(quantity) AS largest\nFROM sales;',
  sandboxSnippets: [
    snippet('Sum, min, max', 'SELECT SUM(quantity) AS items, MIN(quantity) AS smallest, MAX(quantity) AS largest\nFROM sales;'),
    snippet('Revenue', 'SELECT ROUND(SUM(quantity * unit_price), 2) AS revenue FROM sales;'),
    snippet('Average', 'SELECT ROUND(AVG(score), 1) AS average FROM results;'),
    snippet('NULLs are skipped', 'SELECT ROUND(AVG(score), 1) AS of_taken, ROUND(SUM(score) * 1.0 / COUNT(*), 1) AS absences_as_zero\nFROM results;'),
    snippet('Dates', 'SELECT MIN(sale_date) AS first_day, MAX(sale_date) AS last_day FROM sales;'),
  ],
  readMore: { label: 'SQLite: aggregate functions', url: 'https://www.sqlite.org/lang_aggfunc.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Items sold', {
      prompt: 'Show the total number of items sold (the sum of `quantity`), in a column called `items`.',
      hint: '`SELECT SUM(quantity) AS items FROM sales;`',
      solution: 'SELECT SUM(quantity) AS items FROM sales;',
    }),
    query('easy', 'Average score', {
      prompt: 'Show the average `score`, rounded to 1 decimal, in a column called `average`.',
      hint: '`ROUND(AVG(score), 1) AS average`.',
      solution: 'SELECT ROUND(AVG(score), 1) AS average FROM results;',
    }),
    query('easy', 'Top score', {
      prompt: 'Show the highest `score`, in a column called `best`.',
      hint: '`MAX(score) AS best`.',
      solution: 'SELECT MAX(score) AS best FROM results;',
    }),
    query('medium', 'Revenue', {
      prompt: 'Show the total takings (the sum of `quantity` times `unit_price`), rounded to 2 decimals, in a column called `revenue`.',
      hint: '`ROUND(SUM(quantity * unit_price), 2) AS revenue`.',
      solution: 'SELECT ROUND(SUM(quantity * unit_price), 2) AS revenue FROM sales;',
    }),
    query('medium', 'Cheapest and dearest', {
      prompt: 'Show the lowest and highest `unit_price` in one row, in columns called `cheapest` and `dearest`.',
      hint: '`MIN(unit_price) AS cheapest, MAX(unit_price) AS dearest`.',
      solution: 'SELECT MIN(unit_price) AS cheapest, MAX(unit_price) AS dearest FROM sales;',
    }),
    query('medium', 'First and last day', {
      prompt: 'Show the first and last `sale_date`, in columns called `first_day` and `last_day`.',
      hint: '`MIN(sale_date) AS first_day, MAX(sale_date) AS last_day`. Dates in this form sort correctly as text.',
      solution: 'SELECT MIN(sale_date) AS first_day, MAX(sale_date) AS last_day FROM sales;',
    }),
    query('hard', 'Average sale', {
      prompt: 'Show the average value of a sale (`quantity` times `unit_price`), rounded to 2 decimals, in a column called `average_sale`.',
      hint: '`ROUND(AVG(quantity * unit_price), 2)`.',
      solution: 'SELECT ROUND(AVG(quantity * unit_price), 2) AS average_sale FROM sales;',
    }),
    query('expert', 'Spring spread', {
      prompt: 'Show the gap between the highest and lowest `Spring` score, in a column called `spread`.',
      hint: "`MAX(score) - MIN(score) AS spread ... WHERE term = 'Spring'`.",
      solution: "SELECT MAX(score) - MIN(score) AS spread FROM results WHERE term = 'Spring';",
    }),
    query('expert', 'Two kinds of average', {
      prompt: 'In one row, show the average score of the exams taken (`of_taken`) and the average if absences counted as 0 (`absences_as_zero`), both rounded to 1 decimal.',
      hint: '`ROUND(AVG(score), 1)` and `ROUND(SUM(score) * 1.0 / COUNT(*), 1)`.',
      solution: 'SELECT ROUND(AVG(score), 1) AS of_taken, ROUND(SUM(score) * 1.0 / COUNT(*), 1) AS absences_as_zero\nFROM results;',
    }),
  ],
  questions: [
    mc('What does `AVG(score)` give?', ['The middle value', 'The mean of the scores', 'The most common score', 'The total'], 1,
      'AVG adds the values and divides by how many there are: the mean.'),
    mc('How do AVG and SUM treat NULL?', ['They skip it', 'As 0', 'They give NULL', 'They give an error'], 0,
      'Aggregates ignore NULL values (COUNT(*) is the one that counts every row).'),
    mc('Which gives the total takings?', ['`SUM(quantity) * SUM(unit_price)`', '`AVG(quantity * unit_price)`', '`SUM(quantity * unit_price)`', '`COUNT(quantity * unit_price)`'], 2,
      "Multiply each row first, then add them up. Multiplying two sums would count every item at every price."),
    qShort('Which function gives the smallest value?', 'MIN',
      'MIN gives the smallest value; MAX the largest.'),
    mc("What does `MIN(sale_date)` give for YYYY-MM-DD dates?", ['The last date', 'The number of dates', 'An error', 'The earliest date'], 3,
      'This date form sorts in date order, so the smallest is the earliest.'),
    mc('Scores 80, 90 and one absence (NULL). What is AVG(score)?', ['`85`', '`56.7`', '`NULL`', '`170`'], 0,
      'The NULL is skipped: (80 + 90) / 2 = 85.'),
    mc('Same scores. What is `SUM(score) * 1.0 / COUNT(*)`?', ['`85`', '`56.7`', '`NULL`', '`90`'], 1,
      'COUNT(*) counts all three rows, so the absence counts as 0: 170 / 3.'),
    mc('Can one query use several aggregates?', ['No, only one', 'Only SUM and AVG', 'Yes, as separate columns', 'Only with GROUP BY'], 2,
      'For example `SELECT MIN(x), MAX(x), AVG(x)` gives them all in one row.'),
    mc('Why round an average?', ['AVG requires it', 'Averages are often long decimals', 'To make it a whole number always', 'It is faster'], 1,
      'ROUND(AVG(x), 1) keeps it readable.'),
    mc("What does `MAX(product)` give for text?", ['The longest name', 'An error', 'NULL', 'The last name in alphabetical order'], 3,
      'For text, MAX follows alphabetical order.'),
  ],
})
