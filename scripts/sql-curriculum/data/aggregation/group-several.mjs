// Summarising data: Grouping by several columns.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { AGGREGATION_DB } from '../aggregation-db.mjs'

export default makeTopic({
  id: 'group_several',
  title: 'Grouping by several columns',
  database: AGGREGATION_DB,
  paragraphs: [
    'List several columns after `GROUP BY` and each **combination** becomes a group. Sales per store **and** category:',
    '```\nSELECT store, category, COUNT(*) AS sales\nFROM sales\nGROUP BY store, category;\n```',
    'Only the combinations that actually occur appear: if a store sold no tea, there is no `(store, Tea)` row.',
    'As before, every column in `SELECT` must be grouped or aggregated, so a grouped query usually starts with the grouping columns and ends with the totals.',
    'Results with two grouping columns read best when sorted by them, the outer one first. Inside each store, sorting by a total shows the biggest first:',
    '```\nSELECT store, category, ROUND(SUM(quantity * unit_price), 2) AS revenue\nFROM sales\nGROUP BY store, category\nORDER BY store, revenue DESC;\n```',
    "The order of the columns in `GROUP BY` doesn't change the groups, only the order in `ORDER BY` changes how they're listed.",
  ],
  sandboxCode: 'SELECT store, category, COUNT(*) AS sales\nFROM sales\nGROUP BY store, category;',
  sandboxSnippets: [
    snippet('Store and category', 'SELECT store, category, COUNT(*) AS sales\nFROM sales\nGROUP BY store, category;'),
    snippet('Sorted inside groups', 'SELECT store, category, ROUND(SUM(quantity * unit_price), 2) AS revenue\nFROM sales\nGROUP BY store, category\nORDER BY store, revenue DESC;'),
    snippet('Subject and term', 'SELECT subject, term, ROUND(AVG(score), 1) AS average\nFROM results\nGROUP BY subject, term\nORDER BY subject, term;'),
  ],
  readMore: { label: 'SQLite: GROUP BY', url: 'https://www.sqlite.org/lang_select.html#resultset', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Store and category', {
      prompt: 'Show each `store` and `category` combination and its number of sales, called `sales`.',
      hint: '`GROUP BY store, category`.',
      solution: 'SELECT store, category, COUNT(*) AS sales FROM sales GROUP BY store, category;',
    }),
    query('easy', 'Subject and term', {
      prompt: 'Show each `subject` and `term` with its average score rounded to 1 decimal, called `average`.',
      hint: '`ROUND(AVG(score), 1) AS average ... GROUP BY subject, term`.',
      solution: 'SELECT subject, term, ROUND(AVG(score), 1) AS average FROM results GROUP BY subject, term;',
    }),
    query('medium', 'Category takings per store', {
      prompt: 'Show each `store`, `category` and its takings rounded to 2 decimals, called `revenue`. Sort by store, then highest revenue first.',
      hint: '`GROUP BY store, category ORDER BY store, revenue DESC`.',
      solution: 'SELECT store, category, ROUND(SUM(quantity * unit_price), 2) AS revenue\nFROM sales\nGROUP BY store, category\nORDER BY store, revenue DESC;',
    }),
    query('medium', 'Each student, each term', {
      prompt: "Show each `student` and `term` with the student's average that term, rounded to 1 decimal, called `average`. Sort by student, then term.",
      hint: '`GROUP BY student, term ORDER BY student, term`.',
      solution: 'SELECT student, term, ROUND(AVG(score), 1) AS average FROM results\nGROUP BY student, term\nORDER BY student, term;',
    }),
    query('medium', 'Products per store', {
      prompt: 'Show each `store` and `product` with the number of items sold, called `items`. Sort by store, then most items first, then product.',
      hint: '`GROUP BY store, product ORDER BY store, items DESC, product`.',
      solution: 'SELECT store, product, SUM(quantity) AS items FROM sales\nGROUP BY store, product\nORDER BY store, items DESC, product;',
    }),
    query('hard', 'Best result per subject', {
      prompt: "Show each `student` and `subject` with the student's best score in it (from either term), called `best`.",
      hint: '`MAX(score) AS best ... GROUP BY student, subject`.',
      solution: 'SELECT student, subject, MAX(score) AS best FROM results GROUP BY student, subject;',
    }),
    query('hard', 'Coffee per store per day', {
      prompt: 'For `Coffee` only, show each `sale_date` and `store` with the number of coffees sold, called `coffees`. Sort by date, then store.',
      hint: "`WHERE category = 'Coffee' GROUP BY sale_date, store ORDER BY sale_date, store`.",
      solution: "SELECT sale_date, store, SUM(quantity) AS coffees FROM sales\nWHERE category = 'Coffee'\nGROUP BY sale_date, store\nORDER BY sale_date, store;",
    }),
    query('expert', 'Weekends per store', {
      prompt: "Show each `store`, a `part` column (`weekend` or `weekday`) and the number of sales, called `sales`. Sort by store, then part.",
      hint: "Group by the store and the CASE: `GROUP BY store, part ORDER BY store, part`.",
      solution: "SELECT store,\n  CASE WHEN strftime('%w', sale_date) IN ('0', '6') THEN 'weekend' ELSE 'weekday' END AS part,\n  COUNT(*) AS sales\nFROM sales\nGROUP BY store, part\nORDER BY store, part;",
    }),
    query('expert', 'Top three pairs', {
      prompt: 'Show the three `store` and `category` combinations with the highest takings (rounded to 2 decimals, called `revenue`), highest first.',
      hint: '`GROUP BY store, category ORDER BY revenue DESC LIMIT 3`.',
      solution: 'SELECT store, category, ROUND(SUM(quantity * unit_price), 2) AS revenue\nFROM sales\nGROUP BY store, category\nORDER BY revenue DESC\nLIMIT 3;',
    }),
  ],
  questions: [
    mc('With `GROUP BY store, category`, what is a group?', ['Each store', 'Each category', 'Each store and category combination', 'Each row'], 2,
      'Rows that share both values form one group.'),
    mc('If a store sold no tea, is there a (store, Tea) row?', ['No, only combinations that occur appear', 'Yes, with 0', 'Yes, with NULL', 'Only with ORDER BY'], 0,
      'Groups come from the rows that exist.'),
    mc('Does the order of columns in GROUP BY change the groups?', ['Yes', 'Only for text', 'Only with LIMIT', 'No, only ORDER BY changes how they are listed'], 3,
      '`GROUP BY a, b` and `GROUP BY b, a` make the same groups.'),
    qShort('3 stores each sold 4 categories. How many rows does `GROUP BY store, category` give?', '12',
      'One row for each of the 3 × 4 combinations.'),
    mc('Which columns may SELECT show with `GROUP BY store, category`?', ['Any column', 'store, category and aggregates', 'Only aggregates', 'Only store'], 1,
      'Grouped columns and aggregates; anything else is ambiguous.'),
    mc("Which sorts by store, then by each store's best category first?", ['`ORDER BY revenue DESC, store`', '`ORDER BY category, store`', '`ORDER BY store, revenue DESC`', '`GROUP BY revenue`'], 2,
      'The outer column first, then the total inside each store.'),
    mc('`MAX(score)` with `GROUP BY student, subject` gives…', ["Each student's best score per subject", 'The best score overall', "Each subject's best student", 'The number of scores'], 0,
      'One group per student and subject, and MAX takes the higher of the two terms.'),
    mc('Can you group by a column and a CASE together?', ['No', 'Only with HAVING', 'Only in SQLite', 'Yes, any mix of columns and calculations'], 3,
      'Each grouping item can be a column or a calculation.'),
    mc('Which gives the top three store/category pairs by revenue?', ['`LIMIT 3` before GROUP BY', '`GROUP BY store, category ORDER BY revenue DESC LIMIT 3`', '`WHERE revenue > 3`', '`GROUP BY 3`'], 1,
      'Group, sort the groups by revenue, then keep three.'),
    mc('Does WHERE still work with several grouping columns?', ['Yes, it filters rows before grouping', 'No', 'Only on the first column', 'Only on totals'], 0,
      'WHERE always filters rows before they are grouped.'),
  ],
})
