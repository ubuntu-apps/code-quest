// Summarising data: GROUP BY.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { AGGREGATION_DB } from '../aggregation-db.mjs'

export default makeTopic({
  id: 'group_by',
  title: 'GROUP BY',
  database: AGGREGATION_DB,
  paragraphs: [
    'One total for the whole table is a start, but questions are usually "per something": sales **per store**, the average **per student**. `GROUP BY` puts the rows into groups that share a value, and the aggregates then work on each group:',
    '```\nSELECT store, COUNT(*) AS sales, SUM(quantity) AS items\nFROM sales\nGROUP BY store;\n```',
    'The result has one row per store. Show the grouping column too, or you won\'t know which number belongs to which group.',
    '**The rule:** every column in `SELECT` must either be in the `GROUP BY` or be inside an aggregate. `SELECT store, product, COUNT(*) … GROUP BY store` makes no sense, because a store has many products. Most databases refuse it; SQLite shows the product from one row of the group, which is an easy-to-miss mistake.',
    '`WHERE` filters rows **before** they are grouped. This counts only the card sales in each store:',
    "```\nSELECT store, COUNT(*) AS card_sales FROM sales\nWHERE payment = 'card'\nGROUP BY store;\n```",
    'Rows whose grouping value is `NULL` form a group of their own.',
    'To sort by a total, use its name in `ORDER BY`. The clauses go in this order: `SELECT` … `FROM` … `WHERE` … `GROUP BY` … `ORDER BY` … `LIMIT`.',
    '```\nSELECT product, SUM(quantity) AS sold FROM sales\nGROUP BY product\nORDER BY sold DESC;\n```',
  ],
  sandboxCode: 'SELECT store, COUNT(*) AS sales, SUM(quantity) AS items\nFROM sales\nGROUP BY store;',
  sandboxSnippets: [
    snippet('Per store', 'SELECT store, COUNT(*) AS sales, SUM(quantity) AS items\nFROM sales\nGROUP BY store;'),
    snippet('Per student', 'SELECT student, ROUND(AVG(score), 1) AS average FROM results GROUP BY student;'),
    snippet('WHERE first', "SELECT store, COUNT(*) AS card_sales FROM sales\nWHERE payment = 'card'\nGROUP BY store;"),
    snippet('Sorted by total', 'SELECT product, SUM(quantity) AS sold FROM sales\nGROUP BY product\nORDER BY sold DESC;'),
    snippet('A NULL group', 'SELECT payment, COUNT(*) AS sales FROM sales GROUP BY payment;'),
  ],
  readMore: { label: 'SQLite: GROUP BY', url: 'https://www.sqlite.org/lang_select.html#resultset', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Sales per store', {
      prompt: 'Show each `store` and its number of sales, in a column called `sales`.',
      hint: '`SELECT store, COUNT(*) AS sales FROM sales GROUP BY store;`',
      solution: 'SELECT store, COUNT(*) AS sales FROM sales GROUP BY store;',
    }),
    query('easy', 'Items per category', {
      prompt: 'Show each `category` and the number of items sold in it (sum of `quantity`), in a column called `items`.',
      hint: '`SUM(quantity) AS items ... GROUP BY category`.',
      solution: 'SELECT category, SUM(quantity) AS items FROM sales GROUP BY category;',
    }),
    query('easy', 'Average per student', {
      prompt: "Show each `student` and their average score rounded to 1 decimal, in a column called `average`.",
      hint: '`ROUND(AVG(score), 1) AS average ... GROUP BY student`.',
      solution: 'SELECT student, ROUND(AVG(score), 1) AS average FROM results GROUP BY student;',
    }),
    query('medium', 'Revenue per store', {
      prompt: 'Show each `store` and its takings (quantity times unit price, summed and rounded to 2 decimals), called `revenue`. Highest first.',
      hint: '`ROUND(SUM(quantity * unit_price), 2) AS revenue ... GROUP BY store ORDER BY revenue DESC`.',
      solution: 'SELECT store, ROUND(SUM(quantity * unit_price), 2) AS revenue FROM sales\nGROUP BY store\nORDER BY revenue DESC;',
    }),
    query('medium', 'Best score per subject', {
      prompt: 'Show each `subject` and its highest score, in a column called `best`.',
      hint: '`MAX(score) AS best ... GROUP BY subject`.',
      solution: 'SELECT subject, MAX(score) AS best FROM results GROUP BY subject;',
    }),
    query('medium', 'How people paid', {
      prompt: 'Show each `payment` method and its number of sales, in a column called `sales`. (The unrecorded payments form their own group.)',
      hint: '`GROUP BY payment`. NULL becomes a group too.',
      solution: 'SELECT payment, COUNT(*) AS sales FROM sales GROUP BY payment;',
    }),
    query('hard', 'Best sellers', {
      prompt: 'Show each `product` and the number of items sold, called `sold`. Most sold first; equal numbers in product order.',
      hint: '`SUM(quantity) AS sold ... GROUP BY product ORDER BY sold DESC, product`.',
      solution: 'SELECT product, SUM(quantity) AS sold FROM sales\nGROUP BY product\nORDER BY sold DESC, product;',
    }),
    query('hard', 'Card sales per store', {
      prompt: 'Show each `store` and its number of sales paid by `card`, in a column called `card_sales`.',
      hint: "Filter first, then group: `WHERE payment = 'card' GROUP BY store`.",
      solution: "SELECT store, COUNT(*) AS card_sales FROM sales\nWHERE payment = 'card'\nGROUP BY store;",
    }),
    query('expert', 'Subjects ranked', {
      prompt: 'Show each `subject` and its average score rounded to 1 decimal, called `average`, best subject first.',
      hint: '`GROUP BY subject ORDER BY average DESC`.',
      solution: 'SELECT subject, ROUND(AVG(score), 1) AS average FROM results\nGROUP BY subject\nORDER BY average DESC;',
    }),
    query('expert', 'The busiest day', {
      prompt: 'Show the `sale_date` on which the most items were sold, and that number, called `items`. One row; if two days tie, the earlier one.',
      hint: '`GROUP BY sale_date ORDER BY items DESC, sale_date LIMIT 1`.',
      solution: 'SELECT sale_date, SUM(quantity) AS items FROM sales\nGROUP BY sale_date\nORDER BY items DESC, sale_date\nLIMIT 1;',
    }),
  ],
  questions: [
    mc('What does `GROUP BY store` do?', ['Sorts by store', 'Puts rows with the same store together, one result row per store', 'Removes the store column', 'Filters to one store'], 1,
      'Each group becomes one row, and aggregates are worked out per group.'),
    mc('Which SELECT works with `GROUP BY store`?', ['`SELECT store, COUNT(*)`', '`SELECT store, product`', '`SELECT product, COUNT(*)`', '`SELECT *`'], 0,
      'Every column must be grouped or inside an aggregate; product is neither.'),
    mc('What does SQLite do with a column that is neither grouped nor aggregated?', ['Gives an error', 'Leaves it empty', 'Shows its value from one row of the group', 'Adds up its values'], 2,
      'SQLite allows it but picks one row\'s value, which is easy to misread. Other databases refuse it.'),
    mc('When does WHERE filter rows in a grouped query?', ['After grouping', 'It can\'t be used', 'Only on totals', 'Before the rows are grouped'], 3,
      'WHERE works on individual rows, before GROUP BY.'),
    qShort('Which clause goes right after WHERE: `GROUP BY` or `ORDER BY`?', 'GROUP BY',
      'SELECT … FROM … WHERE … GROUP BY … ORDER BY … LIMIT.'),
    mc('What happens to rows whose grouping value is NULL?', ['They form their own group', 'They are dropped', 'They join the first group', 'The query fails'], 0,
      'NULLs are grouped together into one group.'),
    mc('How do you sort the stores by their number of sales?', ['`ORDER BY store`', '`GROUP BY sales`', '`ORDER BY sales DESC` (with `COUNT(*) AS sales`)', '`SORT BY COUNT`'], 2,
      'ORDER BY can use the total\'s name.'),
    mc('Why show the grouping column in SELECT?', ["It's required", 'To know which group each total belongs to', 'To make grouping faster', 'To sort the groups'], 1,
      'Without it, you get a list of numbers with no labels.'),
    mc('How many rows does `SELECT student, AVG(score) FROM results GROUP BY student` give for 5 students?', ['1', '30', '10', '5'], 3,
      'One row per group: one per student.'),
    mc('Which counts card sales per store?', ["`WHERE payment = 'card' GROUP BY store` with `COUNT(*)`", "`GROUP BY store, 'card'`", "`COUNT(card) GROUP BY store`", "`GROUP BY payment WHERE store`"], 0,
      'Filter the card sales with WHERE, then group what is left by store.'),
  ],
})
