// Summarising data: Summary reports, and the order a query runs in.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { AGGREGATION_DB } from '../aggregation-db.mjs'

export default makeTopic({
  id: 'summary_reports',
  title: 'Summary reports',
  database: AGGREGATION_DB,
  paragraphs: [
    "A real report often uses every clause at once. It helps to know the order SQL works through them, which is **not** the order they are written in:",
    '`FROM` → `WHERE` → `GROUP BY` → `HAVING` → `SELECT` → `ORDER BY` → `LIMIT`',
    'In words: take the table, keep the rows that match `WHERE`, put them into groups, keep the groups that match `HAVING`, work out the columns (and their `AS` names), sort them, and keep the first few.',
    "That order explains the rules you've met. `WHERE` can't use totals, because grouping comes later. `ORDER BY` can use a name from `SELECT`, because it comes after it. In standard SQL, `WHERE` can't, because it comes before. (SQLite is lenient and accepts it, but most databases give an error, so write the calculation out in `WHERE`.)",
    'A full report, the three best-selling products with more than 20 in takings:',
    '```\nSELECT product, SUM(quantity) AS items,\n       ROUND(SUM(quantity * unit_price), 2) AS revenue\nFROM sales\nWHERE payment IS NOT NULL\nGROUP BY product\nHAVING SUM(quantity * unit_price) > 20\nORDER BY revenue DESC\nLIMIT 3;\n```',
    'Read it in the order it runs: from the sales, keep those with a recorded payment, group by product, keep products with more than 20 in takings, work out the columns, sort by takings and keep the first three.',
    'When a report gets long, build it step by step in the sandbox: get the grouping right first, then add the totals, then the filters and the sort.',
  ],
  sandboxCode: 'SELECT product, SUM(quantity) AS items,\n       ROUND(SUM(quantity * unit_price), 2) AS revenue\nFROM sales\nWHERE payment IS NOT NULL\nGROUP BY product\nHAVING SUM(quantity * unit_price) > 20\nORDER BY revenue DESC\nLIMIT 3;',
  sandboxSnippets: [
    snippet('Full report', 'SELECT product, SUM(quantity) AS items,\n       ROUND(SUM(quantity * unit_price), 2) AS revenue\nFROM sales\nWHERE payment IS NOT NULL\nGROUP BY product\nHAVING SUM(quantity * unit_price) > 20\nORDER BY revenue DESC\nLIMIT 3;'),
    snippet('Daily report', 'SELECT sale_date, COUNT(*) AS sales, SUM(quantity) AS items,\n       ROUND(SUM(quantity * unit_price), 2) AS revenue\nFROM sales\nGROUP BY sale_date\nORDER BY sale_date;'),
    snippet('Subject report', 'SELECT subject, COUNT(score) AS taken, ROUND(AVG(score), 1) AS average,\n       MAX(score) AS best, MIN(score) AS worst\nFROM results\nGROUP BY subject;'),
  ],
  readMore: { label: 'SQLite: the SELECT statement', url: 'https://www.sqlite.org/lang_select.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'The top store', {
      prompt: 'Show the `store` with the highest takings and its takings rounded to 2 decimals (`revenue`). One row.',
      hint: '`GROUP BY store ORDER BY revenue DESC LIMIT 1`.',
      solution: 'SELECT store, ROUND(SUM(quantity * unit_price), 2) AS revenue FROM sales\nGROUP BY store\nORDER BY revenue DESC\nLIMIT 1;',
    }),
    query('easy', 'The two best students', {
      prompt: 'Show the two `student`s with the highest average score, with the average rounded to 1 decimal (`average`), best first.',
      hint: '`GROUP BY student ORDER BY average DESC LIMIT 2`.',
      solution: 'SELECT student, ROUND(AVG(score), 1) AS average FROM results\nGROUP BY student\nORDER BY average DESC\nLIMIT 2;',
    }),
    query('easy', 'Big categories', {
      prompt: 'Show each `category` with 15 or more items sold and its items (`items`), most first, then by category.',
      hint: '`GROUP BY category HAVING SUM(quantity) >= 15 ORDER BY items DESC, category`.',
      solution: 'SELECT category, SUM(quantity) AS items FROM sales\nGROUP BY category\nHAVING SUM(quantity) >= 15\nORDER BY items DESC, category;',
    }),
    query('medium', 'Card coffee', {
      prompt: 'For coffee sales paid by card, show each `store` with at least 2 of them and that number (`sales`), most first, then by store.',
      hint: "`WHERE category = 'Coffee' AND payment = 'card' GROUP BY store HAVING COUNT(*) >= 2 ORDER BY sales DESC, store`.",
      solution: "SELECT store, COUNT(*) AS sales FROM sales\nWHERE category = 'Coffee' AND payment = 'card'\nGROUP BY store\nHAVING COUNT(*) >= 2\nORDER BY sales DESC, store;",
    }),
    query('medium', 'First-week daily report', {
      prompt: 'For 2026-10-01 to 2026-10-07, show each `sale_date` with its number of sales (`sales`), items (`items`) and takings rounded to 2 decimals (`revenue`), in date order.',
      hint: "`WHERE sale_date BETWEEN '2026-10-01' AND '2026-10-07' GROUP BY sale_date ORDER BY sale_date`.",
      solution: "SELECT sale_date, COUNT(*) AS sales, SUM(quantity) AS items,\n       ROUND(SUM(quantity * unit_price), 2) AS revenue\nFROM sales\nWHERE sale_date BETWEEN '2026-10-01' AND '2026-10-07'\nGROUP BY sale_date\nORDER BY sale_date;",
    }),
    query('medium', 'Subject report', {
      prompt: 'For each `subject`, show the exams taken (`taken`), the absences (`absent`), the average rounded to 1 decimal (`average`), the best (`best`) and the worst (`worst`) score. Best average first.',
      hint: '`COUNT(score)`, `COUNT(*) - COUNT(score)`, `ROUND(AVG(score), 1)`, `MAX(score)`, `MIN(score)`, then `ORDER BY average DESC`.',
      solution: 'SELECT subject, COUNT(score) AS taken, COUNT(*) - COUNT(score) AS absent,\n       ROUND(AVG(score), 1) AS average, MAX(score) AS best, MIN(score) AS worst\nFROM results\nGROUP BY subject\nORDER BY average DESC;',
    }),
    query('hard', 'Top products', {
      prompt: 'Show the five products with the highest takings, only counting products with more than 20 in takings: `product`, `category`, `items` and `revenue` (2 decimals). Highest first.',
      hint: 'Group by product and category (a product has one category), `HAVING SUM(quantity * unit_price) > 20 ORDER BY revenue DESC LIMIT 5`.',
      solution: 'SELECT product, category, SUM(quantity) AS items,\n       ROUND(SUM(quantity * unit_price), 2) AS revenue\nFROM sales\nGROUP BY product, category\nHAVING SUM(quantity * unit_price) > 20\nORDER BY revenue DESC\nLIMIT 5;',
    }),
    query('hard', 'Weekends by store', {
      prompt: "Show each `store` with its number of weekend sales (`weekend_sales`) and weekday sales (`weekday_sales`), in store order.",
      hint: "Two conditional counts: `SUM(CASE WHEN strftime('%w', sale_date) IN ('0', '6') THEN 1 ELSE 0 END)` and the opposite.",
      solution: "SELECT store,\n  SUM(CASE WHEN strftime('%w', sale_date) IN ('0', '6') THEN 1 ELSE 0 END) AS weekend_sales,\n  SUM(CASE WHEN strftime('%w', sale_date) IN ('0', '6') THEN 0 ELSE 1 END) AS weekday_sales\nFROM sales\nGROUP BY store\nORDER BY store;",
    }),
    query('expert', 'Report cards', {
      prompt: "Show each `student` with their autumn and spring averages (`autumn`, `spring`, 1 decimal) and the change from autumn to spring (`change`, 1 decimal). Biggest improvement first.",
      hint: "`ROUND(AVG(CASE WHEN term = 'Spring' THEN score END) - AVG(CASE WHEN term = 'Autumn' THEN score END), 1) AS change ... ORDER BY change DESC`.",
      solution: "SELECT student,\n  ROUND(AVG(CASE WHEN term = 'Autumn' THEN score END), 1) AS autumn,\n  ROUND(AVG(CASE WHEN term = 'Spring' THEN score END), 1) AS spring,\n  ROUND(AVG(CASE WHEN term = 'Spring' THEN score END) - AVG(CASE WHEN term = 'Autumn' THEN score END), 1) AS change\nFROM results\nGROUP BY student\nORDER BY change DESC;",
    }),
    query('expert', 'Best days of the week', {
      prompt: "Show the three days of the week with the highest takings: the day's name (`Sunday` to `Saturday`, called `day`), the number of sales (`sales`) and the takings (`revenue`, 2 decimals). Highest first.",
      hint: "Name the day with a CASE on `strftime('%w', sale_date)` (`WHEN '0' THEN 'Sunday'` …), group by it, then `ORDER BY revenue DESC LIMIT 3`.",
      solution: "SELECT CASE strftime('%w', sale_date)\n    WHEN '0' THEN 'Sunday' WHEN '1' THEN 'Monday' WHEN '2' THEN 'Tuesday'\n    WHEN '3' THEN 'Wednesday' WHEN '4' THEN 'Thursday' WHEN '5' THEN 'Friday'\n    ELSE 'Saturday' END AS day,\n  COUNT(*) AS sales,\n  ROUND(SUM(quantity * unit_price), 2) AS revenue\nFROM sales\nGROUP BY day\nORDER BY revenue DESC\nLIMIT 3;",
    }),
  ],
  questions: [
    mc('Which runs first?', ['SELECT', 'WHERE', 'ORDER BY', 'HAVING'], 1,
      'After FROM comes WHERE; SELECT is worked out after grouping and HAVING.'),
    mc('Which comes right after GROUP BY when a query runs?', ['HAVING', 'WHERE', 'SELECT', 'LIMIT'], 0,
      'FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT.'),
    mc('In standard SQL, why can ORDER BY use an AS name, but WHERE can\'t?', ['ORDER BY is special', 'WHERE only uses numbers', 'ORDER BY runs after SELECT; WHERE runs before it', 'It is the other way round'], 2,
      'Names are given in SELECT, so only later steps can use them. (SQLite also allows them in WHERE, but most databases don\'t.)'),
    qShort('Which clause runs last?', 'LIMIT',
      'LIMIT keeps the first rows after everything else is done.'),
    mc('Why can\'t WHERE use COUNT(*)?', ['COUNT is only for SELECT', 'WHERE is too slow', 'COUNT needs HAVING to exist', 'WHERE runs before the rows are grouped'], 3,
      'There are no group totals yet when WHERE runs.'),
    mc('What is a good way to build a long report?', ['Step by step: grouping, then totals, then filters and sorting', 'All at once', 'Starting with LIMIT', 'Without GROUP BY'], 0,
      'Checking each step in the sandbox makes mistakes easy to spot.'),
    mc('In the report example, which products can appear?', ['All of them', 'Only the cheapest', 'Up to three with more than 20 in takings from recorded payments', 'Only those paid by card'], 2,
      'WHERE, HAVING and LIMIT each narrow the result.'),
    mc('Why group by both product and category for a product report?', ['To show the category, which must be grouped or aggregated', 'It counts each sale twice', 'GROUP BY needs two columns', 'To sort by category'], 0,
      'Each product has one category, so adding it doesn\'t split the groups, but lets you show it.'),
    mc('Where do you test "more than 20 in takings"?', ['WHERE', 'ORDER BY', 'LIMIT', 'HAVING'], 3,
      'It is a group total.'),
    mc('Where do you test "payment is recorded"?', ['HAVING', 'WHERE', 'GROUP BY', 'ORDER BY'], 1,
      'It is about single rows, so filter them early.'),
  ],
})
