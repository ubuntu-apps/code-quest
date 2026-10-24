// Summarising data: COUNT(DISTINCT) and GROUP_CONCAT.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { AGGREGATION_DB } from '../aggregation-db.mjs'

export default makeTopic({
  id: 'distinct_concat',
  title: 'COUNT(DISTINCT) and GROUP_CONCAT',
  database: AGGREGATION_DB,
  paragraphs: [
    '`COUNT(DISTINCT column)` counts the **different** values instead of the rows. There are 30 sales, but how many different products?',
    '```\nSELECT COUNT(*) AS sales, COUNT(DISTINCT product) AS products FROM sales;\n```',
    'Per group, it answers questions like "in how many stores was each product sold?":',
    '```\nSELECT product, COUNT(DISTINCT store) AS stores\nFROM sales\nGROUP BY product;\n```',
    "Like `COUNT(column)`, it skips `NULL`: `COUNT(DISTINCT payment)` counts the payment methods that were recorded.",
    "`GROUP_CONCAT(column, separator)` joins a group's values into one text, such as a list of the dates a product sold on. `GROUP_CONCAT(DISTINCT column)` joins each different value once (with `DISTINCT`, SQLite always separates them with a comma).",
    "```\nSELECT category, GROUP_CONCAT(DISTINCT product) AS products\nFROM sales\nGROUP BY category;\n```",
    "The order of the joined values isn't guaranteed. SQLite joins them in the order it reads the rows, which here is the order the sales were added, but don't rely on it for anything important.",
    'In HAVING, `COUNT(DISTINCT …)` finds groups with enough variety: `HAVING COUNT(DISTINCT store) = 3` keeps the products sold in all three stores.',
  ],
  sandboxCode: 'SELECT COUNT(*) AS sales, COUNT(DISTINCT product) AS products FROM sales;',
  sandboxSnippets: [
    snippet('Rows and products', 'SELECT COUNT(*) AS sales, COUNT(DISTINCT product) AS products FROM sales;'),
    snippet('Stores per product', 'SELECT product, COUNT(DISTINCT store) AS stores\nFROM sales\nGROUP BY product;'),
    snippet('A list per group', "SELECT category, GROUP_CONCAT(DISTINCT product) AS products\nFROM sales\nGROUP BY category;"),
    snippet('Your own separator', "SELECT product, GROUP_CONCAT(sale_date, ' / ') AS dates\nFROM sales\nGROUP BY product;"),
  ],
  readMore: { label: 'SQLite: aggregate functions', url: 'https://www.sqlite.org/lang_aggfunc.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Different products', {
      prompt: 'Count the different products sold, in a column called `products`.',
      hint: '`COUNT(DISTINCT product) AS products`.',
      solution: 'SELECT COUNT(DISTINCT product) AS products FROM sales;',
    }),
    query('easy', 'Stores per product', {
      prompt: 'Show each `product` and the number of different stores that sold it, called `stores`.',
      hint: '`COUNT(DISTINCT store) AS stores ... GROUP BY product`.',
      solution: 'SELECT product, COUNT(DISTINCT store) AS stores FROM sales GROUP BY product;',
    }),
    query('easy', 'Students per subject', {
      prompt: 'Show each `subject` and the number of different students with results in it, called `students`.',
      hint: '`COUNT(DISTINCT student) AS students ... GROUP BY subject`.',
      solution: 'SELECT subject, COUNT(DISTINCT student) AS students FROM results GROUP BY subject;',
    }),
    query('medium', 'Range per store', {
      prompt: 'Show each `store` and the number of different products it sold, called `products`.',
      hint: '`COUNT(DISTINCT product) AS products ... GROUP BY store`.',
      solution: 'SELECT store, COUNT(DISTINCT product) AS products FROM sales GROUP BY store;',
    }),
    query('medium', 'Sold everywhere', {
      prompt: 'Show the `product`s that were sold in all three stores.',
      hint: '`GROUP BY product HAVING COUNT(DISTINCT store) = 3`.',
      solution: 'SELECT product FROM sales\nGROUP BY product\nHAVING COUNT(DISTINCT store) = 3;',
    }),
    query('medium', 'Trading days', {
      prompt: 'Show each `store` and the number of different days it made a sale, called `days`.',
      hint: '`COUNT(DISTINCT sale_date) AS days`.',
      solution: 'SELECT store, COUNT(DISTINCT sale_date) AS days FROM sales GROUP BY store;',
    }),
    query('hard', 'What each category sells', {
      prompt: 'Show each `category` and a list of its different products, called `products` (use `GROUP_CONCAT(DISTINCT product)`).',
      hint: '`GROUP_CONCAT(DISTINCT product) AS products ... GROUP BY category`.',
      solution: 'SELECT category, GROUP_CONCAT(DISTINCT product) AS products FROM sales GROUP BY category;',
    }),
    query('hard', 'Payment methods per store', {
      prompt: 'Show each `store` and how many different payment methods were recorded there, called `methods`.',
      hint: '`COUNT(DISTINCT payment)` skips the unrecorded ones.',
      solution: 'SELECT store, COUNT(DISTINCT payment) AS methods FROM sales GROUP BY store;',
    }),
    query('expert', 'When each product sold', {
      prompt: "Show each `product` and the dates it was sold on, joined with a comma and a space (`2026-10-01, 2026-10-03`), called `dates`.",
      hint: "`GROUP_CONCAT(sale_date, ', ') AS dates ... GROUP BY product`.",
      solution: "SELECT product, GROUP_CONCAT(sale_date, ', ') AS dates FROM sales GROUP BY product;",
    }),
    query('expert', 'Sales per trading day', {
      prompt: 'Show each `store` and its average number of sales per day it traded (sales divided by different days), rounded to 2 decimals, called `per_day`.',
      hint: '`ROUND(COUNT(*) * 1.0 / COUNT(DISTINCT sale_date), 2)`.',
      solution: 'SELECT store, ROUND(COUNT(*) * 1.0 / COUNT(DISTINCT sale_date), 2) AS per_day FROM sales GROUP BY store;',
    }),
  ],
  questions: [
    mc('What does `COUNT(DISTINCT product)` count?', ['Every sale', 'The different products', 'Products that are not NULL, repeats included', 'The longest product name'], 1,
      'Each different value is counted once.'),
    mc('Does `COUNT(DISTINCT payment)` count NULL as a method?', ['No, it skips NULL', 'Yes', 'Only once', 'It gives an error'], 0,
      'Like COUNT(column), it ignores NULL.'),
    mc('Which finds products sold in all 3 stores?', ['`WHERE store = 3`', '`HAVING COUNT(*) = 3`', '`HAVING COUNT(DISTINCT store) = 3`', '`GROUP BY 3`'], 2,
      'Three different stores, whatever the number of sales.'),
    qShort('Which function joins the values of a group into one text?', 'GROUP_CONCAT',
      "`GROUP_CONCAT(column, ', ')` joins them with a separator."),
    mc('Is the order of the values in GROUP_CONCAT guaranteed?', ['Yes, alphabetical', 'Yes, by id', 'Only with DISTINCT', 'No'], 3,
      "SQLite usually follows the order it reads the rows in, but it doesn't promise any order."),
    mc("What is the separator for `GROUP_CONCAT(DISTINCT product)` in SQLite?", ['A comma', 'A space', 'Nothing', 'A new line'], 0,
      'With DISTINCT, SQLite uses a comma and takes no separator argument.'),
    mc('30 sales of 10 different products. What is `COUNT(*) - COUNT(DISTINCT product)`?', ['`10`', '`30`', '`20`', '`0`'], 2,
      '30 rows minus 10 different products.'),
    mc('How do you average the sales per trading day?', ['`AVG(COUNT(*))`', '`COUNT(*) * 1.0 / COUNT(DISTINCT sale_date)`', '`COUNT(DISTINCT *)`', '`SUM(sale_date)`'], 1,
      'Sales divided by the number of different days (times 1.0 to keep decimals).'),
    mc('Can COUNT(DISTINCT …) be used in HAVING?', ['No', 'Only in WHERE', 'Only with GROUP_CONCAT', 'Yes, like any aggregate'], 3,
      'It is an aggregate, so HAVING can test it.'),
    mc('Which gives each category\'s products as one text?', ['`GROUP_CONCAT(DISTINCT product) ... GROUP BY category`', '`COUNT(DISTINCT product)`', '`DISTINCT category, product`', '`SUM(product)`'], 0,
      'GROUP_CONCAT joins the product names of each category.'),
  ],
})
