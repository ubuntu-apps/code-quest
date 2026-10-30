// Summarising data: the section's projects (easy, medium, hard).
import { makeProject, mc, qPattern, qShort, query, snippet } from './_builders.mjs'
import { AGGREGATION_DB } from './aggregation-db.mjs'

const cafeReport = makeProject('easy', {
  id: 'proj_cafe_report',
  title: 'Café weekly report',
  database: AGGREGATION_DB,
  paragraphs: [
    "The café's owner wants a report on the two weeks of `sales`: how each store did, which categories and products sell, how people pay and how the weeks compare.",
    "Takings are always `quantity * unit_price`, rounded to 2 decimals at the end. Each challenge is one table of the report.",
  ],
  sandboxCode: 'SELECT store, COUNT(*) AS sales, SUM(quantity) AS items,\n       ROUND(SUM(quantity * unit_price), 2) AS revenue\nFROM sales\nGROUP BY store;',
  sandboxSnippets: [
    snippet('Per store', 'SELECT store, COUNT(*) AS sales, SUM(quantity) AS items,\n       ROUND(SUM(quantity * unit_price), 2) AS revenue\nFROM sales\nGROUP BY store;'),
    snippet('Per product', 'SELECT product, SUM(quantity) AS items FROM sales GROUP BY product ORDER BY items DESC;'),
    snippet('Per week', "SELECT strftime('%W', sale_date) AS week, COUNT(*) AS sales FROM sales GROUP BY week;"),
  ],
  readMore: { label: 'SQLite: aggregate functions', url: 'https://www.sqlite.org/lang_aggfunc.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Store totals', {
      prompt: 'Show each `store` with its number of sales (`sales`), items (`items`) and takings (`revenue`, 2 decimals). Highest takings first.',
      hint: '`COUNT(*)`, `SUM(quantity)`, `ROUND(SUM(quantity * unit_price), 2)`, `GROUP BY store ORDER BY revenue DESC`.',
      solution: 'SELECT store, COUNT(*) AS sales, SUM(quantity) AS items,\n       ROUND(SUM(quantity * unit_price), 2) AS revenue\nFROM sales\nGROUP BY store\nORDER BY revenue DESC;',
    }),
    query('easy', 'Category totals', {
      prompt: 'Show each `category` with its items (`items`) and takings (`revenue`, 2 decimals). Highest takings first.',
      hint: '`GROUP BY category ORDER BY revenue DESC`.',
      solution: 'SELECT category, SUM(quantity) AS items, ROUND(SUM(quantity * unit_price), 2) AS revenue\nFROM sales\nGROUP BY category\nORDER BY revenue DESC;',
    }),
    query('medium', 'Top five products', {
      prompt: 'Show the five products with the highest takings: `product`, `items` and `revenue` (2 decimals). Highest first; equal takings in product order.',
      hint: '`GROUP BY product ORDER BY revenue DESC, product LIMIT 5`.',
      solution: 'SELECT product, SUM(quantity) AS items, ROUND(SUM(quantity * unit_price), 2) AS revenue\nFROM sales\nGROUP BY product\nORDER BY revenue DESC, product\nLIMIT 5;',
    }),
    query('medium', 'Good days', {
      prompt: 'Show each `sale_date` on which takings were over 15, with the takings (`revenue`, 2 decimals), in date order.',
      hint: '`GROUP BY sale_date HAVING SUM(quantity * unit_price) > 15 ORDER BY sale_date`.',
      solution: 'SELECT sale_date, ROUND(SUM(quantity * unit_price), 2) AS revenue FROM sales\nGROUP BY sale_date\nHAVING SUM(quantity * unit_price) > 15\nORDER BY sale_date;',
    }),
    query('hard', 'How people pay', {
      prompt: "Show each `store` with its number of sales paid by `card`, `cash` and `app`, and with no payment recorded, in columns called `card`, `cash`, `app` and `unknown`. In store order.",
      hint: "One `SUM(CASE WHEN payment = 'card' THEN 1 ELSE 0 END)` per method, and `SUM(CASE WHEN payment IS NULL THEN 1 ELSE 0 END)` for unknown.",
      solution: "SELECT store,\n  SUM(CASE WHEN payment = 'card' THEN 1 ELSE 0 END) AS card,\n  SUM(CASE WHEN payment = 'cash' THEN 1 ELSE 0 END) AS cash,\n  SUM(CASE WHEN payment = 'app' THEN 1 ELSE 0 END) AS app,\n  SUM(CASE WHEN payment IS NULL THEN 1 ELSE 0 END) AS unknown\nFROM sales\nGROUP BY store\nORDER BY store;",
    }),
    query('hard', 'Week by week', {
      prompt: "Show each week (`strftime('%W', sale_date)`, called `week`) with its number of sales (`sales`), takings (`revenue`, 2 decimals) and average sale value (`average_sale`, 2 decimals). In week order.",
      hint: '`ROUND(AVG(quantity * unit_price), 2) AS average_sale`, `GROUP BY week ORDER BY week`.',
      solution: "SELECT strftime('%W', sale_date) AS week, COUNT(*) AS sales,\n       ROUND(SUM(quantity * unit_price), 2) AS revenue,\n       ROUND(AVG(quantity * unit_price), 2) AS average_sale\nFROM sales\nGROUP BY week\nORDER BY week;",
    }),
  ],
  questions: [
    mc('Which gives one row per store?', ['`GROUP BY store`', '`ORDER BY store`', '`DISTINCT sales`', '`WHERE store`'], 0,
      'GROUP BY makes one row per value.'),
    mc('Where does "takings over 15" go?', ['WHERE', 'ORDER BY', 'HAVING', 'LIMIT'], 2,
      'It tests a group total.'),
    mc("Which counts the cash sales in each store while keeping every store?", ["`WHERE payment = 'cash'`", "`SUM(CASE WHEN payment = 'cash' THEN 1 ELSE 0 END)`", "`COUNT(cash)`", "`HAVING payment = 'cash'`"], 1,
      'A conditional sum counts some rows without removing the others.'),
    qPattern("Which `strftime` code gives the week of the year? (Capitals matter.)", '^\\s*%W\\s*$', '%W',
      '%W is the week number, with weeks starting on Monday.'),
    mc('Why add `product` after `revenue DESC` in ORDER BY?', ['It is required', 'To group by product', 'To show the product', 'To fix the order of equal takings'], 3,
      'A tie-breaker makes the order the same every time.'),
    mc('What is `AVG(quantity * unit_price)`?', ['The average value of a sale', 'The average price per item', 'The total takings', 'The number of sales'], 0,
      'Each row\'s value, averaged over the sales.'),
  ],
})

const examBoard = makeProject('medium', {
  id: 'proj_exam_board',
  title: 'Exam board',
  database: AGGREGATION_DB,
  paragraphs: [
    "The exam board is meeting about the class's `results`. They want averages per term, absences, grade counts, the subjects that improved most, and the honour roll.",
    "A missing score means the student was absent. Grades are `A` for 90 or more, `B` for 75 or more, `C` for 60 or more and `D` below that.",
  ],
  sandboxCode: "SELECT subject, term, ROUND(AVG(score), 1) AS average\nFROM results\nGROUP BY subject, term;",
  sandboxSnippets: [
    snippet('Subject and term', "SELECT subject, term, ROUND(AVG(score), 1) AS average\nFROM results\nGROUP BY subject, term;"),
    snippet('Absences', 'SELECT student, COUNT(*) - COUNT(score) AS absent FROM results GROUP BY student;'),
    snippet('Pivot', "SELECT subject,\n  ROUND(AVG(CASE WHEN term = 'Autumn' THEN score END), 1) AS autumn,\n  ROUND(AVG(CASE WHEN term = 'Spring' THEN score END), 1) AS spring\nFROM results GROUP BY subject;"),
  ],
  readMore: { label: 'SQLite: aggregate functions', url: 'https://www.sqlite.org/lang_aggfunc.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Terms side by side', {
      prompt: 'Show each `subject` with its autumn and spring averages, rounded to 1 decimal, in columns called `autumn` and `spring`.',
      hint: "`ROUND(AVG(CASE WHEN term = 'Autumn' THEN score END), 1) AS autumn`, the same for Spring, `GROUP BY subject`.",
      solution: "SELECT subject,\n  ROUND(AVG(CASE WHEN term = 'Autumn' THEN score END), 1) AS autumn,\n  ROUND(AVG(CASE WHEN term = 'Spring' THEN score END), 1) AS spring\nFROM results\nGROUP BY subject;",
    }),
    query('easy', 'Absences', {
      prompt: 'Show each `student` and their number of absences (`absent`). Most absences first, then by name.',
      hint: '`COUNT(*) - COUNT(score) AS absent ... ORDER BY absent DESC, student`.',
      solution: 'SELECT student, COUNT(*) - COUNT(score) AS absent FROM results\nGROUP BY student\nORDER BY absent DESC, student;',
    }),
    query('medium', 'Grades per subject', {
      prompt: 'Show each `subject` with the number of `A`, `B`, `C` and `D` grades, in columns called `a`, `b`, `c` and `d`. Absences don\'t count.',
      hint: "`SUM(CASE WHEN score >= 90 THEN 1 ELSE 0 END) AS a`, `SUM(CASE WHEN score >= 75 AND score < 90 THEN 1 ELSE 0 END) AS b`, and so on. A NULL score fails every condition.",
      solution: "SELECT subject,\n  SUM(CASE WHEN score >= 90 THEN 1 ELSE 0 END) AS a,\n  SUM(CASE WHEN score >= 75 AND score < 90 THEN 1 ELSE 0 END) AS b,\n  SUM(CASE WHEN score >= 60 AND score < 75 THEN 1 ELSE 0 END) AS c,\n  SUM(CASE WHEN score < 60 THEN 1 ELSE 0 END) AS d\nFROM results\nGROUP BY subject;",
    }),
    query('medium', 'Steady students', {
      prompt: "Show the `student`s whose lowest score is at least 70, with that score (`lowest`), in name order.",
      hint: '`MIN(score) AS lowest ... HAVING MIN(score) >= 70 ORDER BY student`.',
      solution: 'SELECT student, MIN(score) AS lowest FROM results\nGROUP BY student\nHAVING MIN(score) >= 70\nORDER BY student;',
    }),
    query('hard', 'Most improved subjects', {
      prompt: 'Show each `subject` and the change from its autumn average to its spring average, rounded to 1 decimal, called `change`. Biggest improvement first.',
      hint: "`ROUND(AVG(CASE WHEN term = 'Spring' THEN score END) - AVG(CASE WHEN term = 'Autumn' THEN score END), 1) AS change ... ORDER BY change DESC`.",
      solution: "SELECT subject,\n  ROUND(AVG(CASE WHEN term = 'Spring' THEN score END) - AVG(CASE WHEN term = 'Autumn' THEN score END), 1) AS change\nFROM results\nGROUP BY subject\nORDER BY change DESC;",
    }),
    query('hard', 'Honour roll', {
      prompt: 'Show the students who took every exam (no absences) and averaged 80 or more: `student`, `average` (1 decimal) and `taken`. Best average first.',
      hint: '`HAVING COUNT(score) = COUNT(*) AND AVG(score) >= 80 ORDER BY average DESC`.',
      solution: 'SELECT student, ROUND(AVG(score), 1) AS average, COUNT(score) AS taken FROM results\nGROUP BY student\nHAVING COUNT(score) = COUNT(*) AND AVG(score) >= 80\nORDER BY average DESC;',
    }),
  ],
  questions: [
    mc('Which counts absences per student?', ['`COUNT(*) - COUNT(score)`', '`COUNT(score)`', '`COUNT(NULL)`', '`SUM(score)`'], 0,
      'All rows minus the rows with a score.'),
    mc('Why does a NULL score not count as a D in `SUM(CASE WHEN score < 60 THEN 1 ELSE 0 END)`?', ['NULL is 0', 'CASE skips NULL rows', '`NULL < 60` is not true, so it falls to ELSE 0', 'It does count'], 2,
      'Comparisons with NULL are not true.'),
    mc('Which keeps students with no absences?', ['`WHERE score IS NOT NULL`', '`HAVING COUNT(score) = COUNT(*)`', '`HAVING MIN(score) > 0`', '`WHERE COUNT(*) = 6`'], 1,
      'Every row has a score when the two counts are equal.'),
    qShort('A subject averaged 74.0 in autumn and 79.5 in spring. What is the change?', '5.5',
      'Spring minus autumn.'),
    mc('Why can\'t WHERE do the honour roll\'s "averaged 80 or more"?', ['WHERE can\'t compare numbers', 'AVG is not allowed', 'WHERE needs GROUP BY', 'The average is a group total, so it belongs in HAVING'], 3,
      'WHERE runs before grouping.'),
    mc('Can HAVING combine two conditions with AND?', ['Yes', 'No', 'Only with OR', 'Only one aggregate per query'], 0,
      'HAVING takes any condition, including several joined with AND.'),
  ],
})

const productReview = makeProject('hard', {
  id: 'proj_product_review',
  title: 'Product review',
  database: AGGREGATION_DB,
  paragraphs: [
    "The café is reviewing its menu. For every product, the owner wants to know how it sells, where it sells, how it's paid for, and finally a decision: keep it, watch it or review it.",
    "This side quest uses the whole quest: grouping, `HAVING`, `COUNT(DISTINCT)`, `GROUP_CONCAT`, conditional totals and careful averages.",
  ],
  sandboxCode: 'SELECT product, category, SUM(quantity) AS items,\n       ROUND(SUM(quantity * unit_price), 2) AS revenue,\n       COUNT(DISTINCT store) AS stores\nFROM sales\nGROUP BY product, category;',
  sandboxSnippets: [
    snippet('Product totals', 'SELECT product, category, SUM(quantity) AS items,\n       ROUND(SUM(quantity * unit_price), 2) AS revenue,\n       COUNT(DISTINCT store) AS stores\nFROM sales\nGROUP BY product, category;'),
    snippet('Where it sells', 'SELECT product, GROUP_CONCAT(DISTINCT store) AS stores FROM sales GROUP BY product;'),
    snippet('Card share', "SELECT category, ROUND(100.0 * SUM(CASE WHEN payment = 'card' THEN 1 ELSE 0 END) / COUNT(*), 1) AS card_percent\nFROM sales GROUP BY category;"),
  ],
  readMore: { label: 'SQLite: aggregate functions', url: 'https://www.sqlite.org/lang_aggfunc.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Product totals', {
      prompt: 'Show each `product` with its items (`items`) and takings (`revenue`, 2 decimals). Highest takings first, then product.',
      hint: '`GROUP BY product ORDER BY revenue DESC, product`.',
      solution: 'SELECT product, SUM(quantity) AS items, ROUND(SUM(quantity * unit_price), 2) AS revenue\nFROM sales\nGROUP BY product\nORDER BY revenue DESC, product;',
    }),
    query('medium', 'Where it sells', {
      prompt: 'Show each `product`, the number of different stores selling it (`store_count`) and the list of those stores (`stores`, with `GROUP_CONCAT(DISTINCT store)`).',
      hint: '`COUNT(DISTINCT store) AS store_count, GROUP_CONCAT(DISTINCT store) AS stores`.',
      solution: 'SELECT product, COUNT(DISTINCT store) AS store_count, GROUP_CONCAT(DISTINCT store) AS stores\nFROM sales\nGROUP BY product;',
    }),
    query('medium', 'Slow sellers', {
      prompt: 'Show the products with fewer than 8 items sold, with their items (`items`). Fewest first, then by product.',
      hint: '`HAVING SUM(quantity) < 8 ORDER BY items, product`.',
      solution: 'SELECT product, SUM(quantity) AS items FROM sales\nGROUP BY product\nHAVING SUM(quantity) < 8\nORDER BY items, product;',
    }),
    query('hard', 'Price paid per category', {
      prompt: 'Show each `category` with the plain average of its `unit_price` (`listed`) and the price paid per item (`paid`), both rounded to 2 decimals.',
      hint: '`ROUND(AVG(unit_price), 2) AS listed, ROUND(SUM(quantity * unit_price) / SUM(quantity), 2) AS paid`.',
      solution: 'SELECT category,\n  ROUND(AVG(unit_price), 2) AS listed,\n  ROUND(SUM(quantity * unit_price) / SUM(quantity), 2) AS paid\nFROM sales\nGROUP BY category;',
    }),
    query('hard', 'Paid by card', {
      prompt: 'Show each `category` and the percentage of its sales paid by card, rounded to 1 decimal (`card_percent`). Highest first, then by category.',
      hint: "`ROUND(100.0 * SUM(CASE WHEN payment = 'card' THEN 1 ELSE 0 END) / COUNT(*), 1)`.",
      solution: "SELECT category,\n  ROUND(100.0 * SUM(CASE WHEN payment = 'card' THEN 1 ELSE 0 END) / COUNT(*), 1) AS card_percent\nFROM sales\nGROUP BY category\nORDER BY card_percent DESC, category;",
    }),
    query('hard', 'The decision', {
      prompt: "Show each `product` with `items`, `revenue` (2 decimals), `stores` (how many different stores sold it) and a `decision`: `keep` if 10 or more items sold, otherwise `review` if only one store sold it, otherwise `watch`. Highest takings first, then product.",
      hint: "`CASE WHEN SUM(quantity) >= 10 THEN 'keep' WHEN COUNT(DISTINCT store) = 1 THEN 'review' ELSE 'watch' END AS decision`. Aggregates can go inside CASE.",
      solution: "SELECT product, SUM(quantity) AS items,\n  ROUND(SUM(quantity * unit_price), 2) AS revenue,\n  COUNT(DISTINCT store) AS stores,\n  CASE\n    WHEN SUM(quantity) >= 10 THEN 'keep'\n    WHEN COUNT(DISTINCT store) = 1 THEN 'review'\n    ELSE 'watch'\n  END AS decision\nFROM sales\nGROUP BY product\nORDER BY revenue DESC, product;",
    }),
  ],
  questions: [
    mc('Can an aggregate go inside CASE?', ['Yes: `CASE WHEN SUM(quantity) >= 10 THEN …`', 'No', 'Only COUNT', 'Only in WHERE'], 0,
      'In a grouped query, CASE can test group totals.'),
    mc('Which lists the stores that sold a product?', ['`COUNT(DISTINCT store)`', '`GROUP_CONCAT(DISTINCT store)`', '`DISTINCT store`', '`MAX(store)`'], 1,
      'GROUP_CONCAT joins them into one text; COUNT(DISTINCT) only counts them.'),
    mc('Why might `listed` and `paid` differ?', ['A rounding error', 'NULL prices', 'Big sales of cheap items pull the paid price down', 'They never differ'], 2,
      'The price paid per item weights each price by how many were sold.'),
    qShort('Which clause keeps only the slow sellers (fewer than 8 items)?', 'HAVING',
      'It tests a group total.'),
    mc('In the decision, a product with 12 items in one store gets…', ['`review`', '`watch`', 'NULL', '`keep`'], 3,
      'The first WHEN (10 or more items) is already true.'),
    mc('Which percentage is right for "card sales out of all sales"?', ["`100.0 * SUM(CASE WHEN payment = 'card' THEN 1 ELSE 0 END) / COUNT(*)`", "`SUM(card) / 100`", "`COUNT(card) * 100`", '`AVG(payment)`'], 0,
      'Card sales divided by all sales, times 100.0.'),
  ],
})

export const aggregationProjects = [cafeReport, examBoard, productReview]
