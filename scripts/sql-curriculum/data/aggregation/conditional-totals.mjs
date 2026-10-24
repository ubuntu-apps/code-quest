// Summarising data: Totals with conditions.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { AGGREGATION_DB } from '../aggregation-db.mjs'

export default makeTopic({
  id: 'conditional_totals',
  title: 'Totals with conditions',
  database: AGGREGATION_DB,
  paragraphs: [
    "`WHERE` and `HAVING` remove rows or groups. Sometimes you want to keep every group but count only some of its rows. Put a `CASE` inside the aggregate:",
    "```\nSELECT store,\n  COUNT(*) AS sales,\n  SUM(CASE WHEN payment = 'card' THEN 1 ELSE 0 END) AS card_sales\nFROM sales\nGROUP BY store;\n```",
    'Each card sale adds 1 and every other sale adds 0, so the sum is the number of card sales, next to the total, in the same row.',
    "The same trick adds up only some values: `SUM(CASE WHEN category = 'Coffee' THEN quantity ELSE 0 END)` counts coffees sold. Without the `ELSE`, the other rows give `NULL`, which `SUM`, `AVG` and `COUNT` skip, so `COUNT(CASE WHEN score >= 60 THEN 1 END)` counts the passes and `AVG(CASE WHEN term = 'Autumn' THEN score END)` averages the autumn scores only.",
    "Several of these side by side turn rows into columns, a layout often called a **pivot**:",
    "```\nSELECT student,\n  ROUND(AVG(CASE WHEN term = 'Autumn' THEN score END), 1) AS autumn,\n  ROUND(AVG(CASE WHEN term = 'Spring' THEN score END), 1) AS spring\nFROM results\nGROUP BY student;\n```",
    "A percentage is a conditional count divided by all the rows: `ROUND(100.0 * SUM(CASE WHEN payment = 'card' THEN 1 ELSE 0 END) / COUNT(*), 1)`.",
    "In SQLite, a comparison is itself 1 (true) or 0 (false), so `SUM(payment = 'card')` also counts card sales. The `CASE` form works in every database.",
  ],
  sandboxCode: "SELECT store,\n  COUNT(*) AS sales,\n  SUM(CASE WHEN payment = 'card' THEN 1 ELSE 0 END) AS card_sales\nFROM sales\nGROUP BY store;",
  sandboxSnippets: [
    snippet('Count some rows', "SELECT store,\n  COUNT(*) AS sales,\n  SUM(CASE WHEN payment = 'card' THEN 1 ELSE 0 END) AS card_sales\nFROM sales\nGROUP BY store;"),
    snippet('Pivot', "SELECT student,\n  ROUND(AVG(CASE WHEN term = 'Autumn' THEN score END), 1) AS autumn,\n  ROUND(AVG(CASE WHEN term = 'Spring' THEN score END), 1) AS spring\nFROM results\nGROUP BY student;"),
    snippet('Percentage', "SELECT store,\n  ROUND(100.0 * SUM(CASE WHEN payment = 'card' THEN 1 ELSE 0 END) / COUNT(*), 1) AS card_percent\nFROM sales\nGROUP BY store;"),
    snippet('Short form', "SELECT store, SUM(payment = 'card') AS card_sales FROM sales GROUP BY store;"),
  ],
  readMore: { label: 'SQLite: the CASE expression', url: 'https://www.sqlite.org/lang_expr.html#case', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Card sales per store', {
      prompt: "Show each `store` and its number of card sales, called `card_sales`, using `SUM(CASE ...)` so that every store is listed.",
      hint: "`SUM(CASE WHEN payment = 'card' THEN 1 ELSE 0 END) AS card_sales`.",
      solution: "SELECT store, SUM(CASE WHEN payment = 'card' THEN 1 ELSE 0 END) AS card_sales FROM sales GROUP BY store;",
    }),
    query('easy', 'Coffees per store', {
      prompt: 'Show each `store` and the number of coffee items it sold (`quantity` of `Coffee` sales), called `coffee_items`.',
      hint: "`SUM(CASE WHEN category = 'Coffee' THEN quantity ELSE 0 END)`.",
      solution: "SELECT store, SUM(CASE WHEN category = 'Coffee' THEN quantity ELSE 0 END) AS coffee_items FROM sales GROUP BY store;",
    }),
    query('easy', 'Passes per subject', {
      prompt: 'Show each `subject` and its number of scores of 60 or more, called `passes`, using `COUNT(CASE ...)`.',
      hint: '`COUNT(CASE WHEN score >= 60 THEN 1 END) AS passes`. Without ELSE, the others are NULL and not counted.',
      solution: 'SELECT subject, COUNT(CASE WHEN score >= 60 THEN 1 END) AS passes FROM results GROUP BY subject;',
    }),
    query('medium', 'Categories as columns', {
      prompt: "Show each `store` with the number of sales in three columns: `coffee`, `tea` and `bakery`.",
      hint: "One SUM(CASE …) per category: `SUM(CASE WHEN category = 'Coffee' THEN 1 ELSE 0 END) AS coffee`, and so on.",
      solution: "SELECT store,\n  SUM(CASE WHEN category = 'Coffee' THEN 1 ELSE 0 END) AS coffee,\n  SUM(CASE WHEN category = 'Tea' THEN 1 ELSE 0 END) AS tea,\n  SUM(CASE WHEN category = 'Bakery' THEN 1 ELSE 0 END) AS bakery\nFROM sales\nGROUP BY store;",
    }),
    query('medium', 'Autumn and spring', {
      prompt: "Show each `student` with their average score in each term, rounded to 1 decimal, in columns called `autumn` and `spring`.",
      hint: "`ROUND(AVG(CASE WHEN term = 'Autumn' THEN score END), 1) AS autumn`, and the same for Spring.",
      solution: "SELECT student,\n  ROUND(AVG(CASE WHEN term = 'Autumn' THEN score END), 1) AS autumn,\n  ROUND(AVG(CASE WHEN term = 'Spring' THEN score END), 1) AS spring\nFROM results\nGROUP BY student;",
    }),
    query('medium', 'Card share', {
      prompt: "Show each `store` and the percentage of its sales paid by card, rounded to 1 decimal, called `card_percent`.",
      hint: "`ROUND(100.0 * SUM(CASE WHEN payment = 'card' THEN 1 ELSE 0 END) / COUNT(*), 1)`.",
      solution: "SELECT store, ROUND(100.0 * SUM(CASE WHEN payment = 'card' THEN 1 ELSE 0 END) / COUNT(*), 1) AS card_percent\nFROM sales\nGROUP BY store;",
    }),
    query('hard', 'Improvers', {
      prompt: 'Show the `student`s whose spring average is higher than their autumn average.',
      hint: "Compare two conditional averages in HAVING: `HAVING AVG(CASE WHEN term = 'Spring' THEN score END) > AVG(CASE WHEN term = 'Autumn' THEN score END)`.",
      solution: "SELECT student FROM results\nGROUP BY student\nHAVING AVG(CASE WHEN term = 'Spring' THEN score END) > AVG(CASE WHEN term = 'Autumn' THEN score END);",
    }),
    query('hard', 'Weekend takings', {
      prompt: "Show each `store` and its takings on Saturdays and Sundays only, rounded to 2 decimals, called `weekend_revenue`.",
      hint: "`SUM(CASE WHEN strftime('%w', sale_date) IN ('0', '6') THEN quantity * unit_price ELSE 0 END)`.",
      solution: "SELECT store,\n  ROUND(SUM(CASE WHEN strftime('%w', sale_date) IN ('0', '6') THEN quantity * unit_price ELSE 0 END), 2) AS weekend_revenue\nFROM sales\nGROUP BY store;",
    }),
    query('expert', 'Pass rates', {
      prompt: 'Show each `subject` and the percentage of exams taken that scored 60 or more, rounded to 1 decimal, called `pass_rate`. Absences don\'t count. Highest first, then by subject.',
      hint: '`ROUND(100.0 * COUNT(CASE WHEN score >= 60 THEN 1 END) / COUNT(score), 1)`; `COUNT(score)` skips absences.',
      solution: 'SELECT subject, ROUND(100.0 * COUNT(CASE WHEN score >= 60 THEN 1 END) / COUNT(score), 1) AS pass_rate\nFROM results\nGROUP BY subject\nORDER BY pass_rate DESC, subject;',
    }),
    query('expert', 'Big and small takings', {
      prompt: 'Show each `store` with its takings from big sales (5 or more items) and small sales in two columns, `big` and `small`, each rounded to 2 decimals.',
      hint: '`ROUND(SUM(CASE WHEN quantity >= 5 THEN quantity * unit_price ELSE 0 END), 2) AS big`, and the opposite for `small`.',
      solution: 'SELECT store,\n  ROUND(SUM(CASE WHEN quantity >= 5 THEN quantity * unit_price ELSE 0 END), 2) AS big,\n  ROUND(SUM(CASE WHEN quantity < 5 THEN quantity * unit_price ELSE 0 END), 2) AS small\nFROM sales\nGROUP BY store;',
    }),
  ],
  questions: [
    mc("What does `SUM(CASE WHEN payment = 'card' THEN 1 ELSE 0 END)` give per group?", ['The number of card sales', 'The card total in money', 'The number of sales', '1 or 0'], 0,
      'Each card sale adds 1 and every other sale adds 0.'),
    mc('Why use SUM(CASE …) instead of WHERE?', ['It is faster', 'To keep every group and the totals side by side', 'WHERE cannot use text', 'There is no difference'], 1,
      'WHERE would remove the other rows, so you couldn\'t show both counts or list stores with none.'),
    mc('Why does `COUNT(CASE WHEN score >= 60 THEN 1 END)` count only passes?', ['COUNT only counts 1s', 'CASE removes rows', 'Without ELSE, the other rows are NULL, which COUNT skips', 'It counts every row'], 2,
      'COUNT(value) ignores NULLs.'),
    qShort("In SQLite, what does `('card' = 'card')` give as a number?", '1',
      'A true comparison is 1 and a false one is 0.'),
    mc('What is a pivot?', ['Sorting by two columns', 'A kind of join', 'Grouping twice', 'Turning values from rows into columns'], 3,
      'Conditional totals side by side make one column per value.'),
    mc("What does `AVG(CASE WHEN term = 'Autumn' THEN score END)` average?", ['Only the autumn scores', 'All scores', 'Autumn scores as 1s', 'Nothing: it is NULL'], 0,
      'Other terms give NULL, which AVG skips.'),
    mc('Which gives the card percentage?', ["`SUM(payment = 'card') / 100`", "`100 * COUNT(*) / SUM(...)`", "`100.0 * SUM(CASE WHEN payment = 'card' THEN 1 ELSE 0 END) / COUNT(*)`", '`AVG(card)`'], 2,
      'Card sales divided by all sales, times 100.0 to keep decimals.'),
    mc('Can conditional totals be compared in HAVING?', ['No', 'Yes, like any aggregate', 'Only with WHERE', 'Only COUNT'], 1,
      'For example HAVING one conditional average > another.'),
    mc("Is `SUM(payment = 'card')` standard SQL?", ['Yes', 'Only in WHERE', 'It is an error everywhere', 'No: it relies on SQLite treating true as 1'], 3,
      'The CASE form works in every database.'),
    mc('What does `SUM(CASE WHEN category = \'Tea\' THEN quantity END)` give for a store with no tea?', ['`NULL`', '`0`', 'An error', 'The store is left out'], 0,
      'Every value is NULL, and SUM of only NULLs is NULL. With ELSE 0 it would be 0.'),
  ],
})
