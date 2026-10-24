// Summarising data: HAVING, filtering groups.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { AGGREGATION_DB } from '../aggregation-db.mjs'

export default makeTopic({
  id: 'having',
  title: 'HAVING: filtering groups',
  database: AGGREGATION_DB,
  paragraphs: [
    '`WHERE` picks **rows** before they are grouped, so it can\'t use totals: at that point there are none yet. To keep only some **groups**, use `HAVING`, which comes after `GROUP BY` and can use aggregates:',
    '```\nSELECT product, SUM(quantity) AS items\nFROM sales\nGROUP BY product\nHAVING SUM(quantity) >= 10;\n```',
    'Putting an aggregate in `WHERE` gives the error `misuse of aggregate`. That\'s the sign it belongs in `HAVING`.',
    "A query can use both. `WHERE` decides which rows go into the groups, and `HAVING` decides which groups are shown. Card sales per store, for the stores with at least 4 of them:",
    "```\nSELECT store, COUNT(*) AS card_sales\nFROM sales\nWHERE payment = 'card'\nGROUP BY store\nHAVING COUNT(*) >= 4;\n```",
    'The order of the clauses is now `SELECT` … `FROM` … `WHERE` … `GROUP BY` … `HAVING` … `ORDER BY` … `LIMIT`.',
    'In `HAVING`, write the aggregate out again (`HAVING SUM(quantity) >= 10`). SQLite also accepts the name from `SELECT` (`HAVING items >= 10`), but many databases don\'t.',
    'A condition that doesn\'t need a total, such as `store = \'North\'`, belongs in `WHERE`: it is clearer and lets the database skip those rows early.',
  ],
  sandboxCode: 'SELECT product, SUM(quantity) AS items\nFROM sales\nGROUP BY product\nHAVING SUM(quantity) >= 10;',
  sandboxSnippets: [
    snippet('HAVING', 'SELECT product, SUM(quantity) AS items\nFROM sales\nGROUP BY product\nHAVING SUM(quantity) >= 10;'),
    snippet('WHERE and HAVING', "SELECT store, COUNT(*) AS card_sales\nFROM sales\nWHERE payment = 'card'\nGROUP BY store\nHAVING COUNT(*) >= 4;"),
    snippet('Aggregate in WHERE', '-- This gives an error: totals can\'t go in WHERE\nSELECT store, SUM(quantity) AS items FROM sales\nWHERE SUM(quantity) > 25\nGROUP BY store;'),
    snippet('Averages over 80', 'SELECT student, ROUND(AVG(score), 1) AS average FROM results\nGROUP BY student\nHAVING AVG(score) > 80;'),
  ],
  readMore: { label: 'SQLite: the SELECT statement', url: 'https://www.sqlite.org/lang_select.html#resultset', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Popular products', {
      prompt: 'Show each `product` and its items sold (`items`), only for the products with 10 or more items sold.',
      hint: '`GROUP BY product HAVING SUM(quantity) >= 10`.',
      solution: 'SELECT product, SUM(quantity) AS items FROM sales\nGROUP BY product\nHAVING SUM(quantity) >= 10;',
    }),
    query('easy', 'Top students', {
      prompt: "Show each `student` and their average score rounded to 1 decimal (`average`), only for students whose average is above 80.",
      hint: '`GROUP BY student HAVING AVG(score) > 80`.',
      solution: 'SELECT student, ROUND(AVG(score), 1) AS average FROM results\nGROUP BY student\nHAVING AVG(score) > 80;',
    }),
    query('easy', 'Busy days', {
      prompt: 'Show each `sale_date` with 3 or more sales, and its number of sales (`sales`).',
      hint: '`GROUP BY sale_date HAVING COUNT(*) >= 3`.',
      solution: 'SELECT sale_date, COUNT(*) AS sales FROM sales\nGROUP BY sale_date\nHAVING COUNT(*) >= 3;',
    }),
    query('medium', 'Categories over 50', {
      prompt: 'Show each `category` whose takings are over 50, with its takings rounded to 2 decimals (`revenue`).',
      hint: '`HAVING SUM(quantity * unit_price) > 50`.',
      solution: 'SELECT category, ROUND(SUM(quantity * unit_price), 2) AS revenue FROM sales\nGROUP BY category\nHAVING SUM(quantity * unit_price) > 50;',
    }),
    query('medium', 'Card-heavy stores', {
      prompt: 'Show each `store` with at least 4 sales paid by `card`, and that number (`card_sales`).',
      hint: "Rows first, groups second: `WHERE payment = 'card' GROUP BY store HAVING COUNT(*) >= 4`.",
      solution: "SELECT store, COUNT(*) AS card_sales FROM sales\nWHERE payment = 'card'\nGROUP BY store\nHAVING COUNT(*) >= 4;",
    }),
    query('medium', 'Subjects with absences', {
      prompt: 'Show each `subject` that has at least one missing score, and how many (`absent`).',
      hint: 'Missing = all rows minus scores: `COUNT(*) - COUNT(score) AS absent ... HAVING COUNT(*) > COUNT(score)`.',
      solution: 'SELECT subject, COUNT(*) - COUNT(score) AS absent FROM results\nGROUP BY subject\nHAVING COUNT(*) > COUNT(score);',
    }),
    query('hard', 'Regulars', {
      prompt: 'Show each `product` that was sold 3 or more times (rows), with its number of sales (`sales`). Most sales first, then product order.',
      hint: '`HAVING COUNT(*) >= 3 ORDER BY sales DESC, product`.',
      solution: 'SELECT product, COUNT(*) AS sales FROM sales\nGROUP BY product\nHAVING COUNT(*) >= 3\nORDER BY sales DESC, product;',
    }),
    query('hard', 'Never below 60', {
      prompt: "Show each `student` whose lowest score is 60 or more, with that lowest score (`lowest`).",
      hint: '`MIN(score) AS lowest ... HAVING MIN(score) >= 60`. (MIN skips the absences.)',
      solution: 'SELECT student, MIN(score) AS lowest FROM results\nGROUP BY student\nHAVING MIN(score) >= 60;',
    }),
    query('expert', 'Fix the misuse', {
      prompt: 'This query should show the stores that sold more than 25 items, but it gives `misuse of aggregate`. Fix it.',
      starter: 'SELECT store, SUM(quantity) AS items FROM sales\nWHERE SUM(quantity) > 25\nGROUP BY store;',
      hint: 'A condition on a total goes in HAVING, after GROUP BY.',
      solution: 'SELECT store, SUM(quantity) AS items FROM sales\nGROUP BY store\nHAVING SUM(quantity) > 25;',
    }),
    query('expert', 'Big store/category pairs', {
      prompt: 'Show each `store` and `category` combination with 8 or more items sold, and that number (`items`). Most items first, then by store and category.',
      hint: '`GROUP BY store, category HAVING SUM(quantity) >= 8 ORDER BY items DESC, store, category`.',
      solution: 'SELECT store, category, SUM(quantity) AS items FROM sales\nGROUP BY store, category\nHAVING SUM(quantity) >= 8\nORDER BY items DESC, store, category;',
    }),
  ],
  questions: [
    mc('What does HAVING filter?', ['Rows, before grouping', 'Groups, after grouping', 'Columns', 'Tables'], 1,
      'HAVING keeps or drops whole groups, using their totals.'),
    mc('Why can\'t WHERE use `SUM(quantity)`?', ['WHERE runs before the rows are grouped, so there are no totals yet', 'SUM is not allowed in SQL', 'WHERE only works on text', 'It can, in SQLite'], 0,
      'Totals only exist after grouping; that is HAVING\'s job.'),
    mc('Which error means an aggregate is in the wrong place?', ['`no such column`', '`syntax error`', '`misuse of aggregate`', '`incomplete input`'], 2,
      "SQLite says misuse of aggregate when, for example, SUM appears in WHERE."),
    qShort('Which clause comes right after GROUP BY?', 'HAVING',
      'SELECT … FROM … WHERE … GROUP BY … HAVING … ORDER BY … LIMIT.'),
    mc("Where does `store = 'North'` belong in a grouped query?", ['HAVING', 'ORDER BY', 'GROUP BY', 'WHERE'], 3,
      "It doesn't need a total, so filter the rows early with WHERE."),
    mc("In `WHERE payment = 'card' GROUP BY store HAVING COUNT(*) >= 4`, what does COUNT(*) count?", ['Card sales in each store', 'All sales in each store', 'All card sales', 'Stores'], 0,
      'WHERE has already removed the other payments, so each group only holds card sales.'),
    mc('Which keeps students averaging above 80?', ['`WHERE AVG(score) > 80`', '`GROUP BY student HAVING AVG(score) > 80`', '`WHERE score > 80 GROUP BY student`', '`HAVING score > 80`'], 1,
      'The average is a group total, so it is tested in HAVING.'),
    mc('`WHERE score > 80 GROUP BY student` gives…', ['Students with an average above 80', 'An error', 'Each student\'s scores above 80, grouped', 'Nothing'], 2,
      'WHERE drops the low scores first, which is a different question.'),
    mc("Is `HAVING items >= 10` (using the AS name) portable to other databases?", ['Yes, everywhere', 'It is required', 'Only for text', 'No, many need the aggregate written out'], 3,
      'SQLite and MySQL accept it; standard SQL expects `HAVING SUM(quantity) >= 10`.'),
    mc('Can a query have both WHERE and HAVING?', ['Yes: WHERE filters rows, HAVING filters groups', 'No', 'Only without ORDER BY', 'Only with LIMIT'], 0,
      'They filter at different steps, so they work together.'),
  ],
})
