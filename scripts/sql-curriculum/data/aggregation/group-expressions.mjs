// Summarising data: Grouping by a calculation.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { AGGREGATION_DB } from '../aggregation-db.mjs'

export default makeTopic({
  id: 'group_expressions',
  title: 'Grouping by a calculation',
  database: AGGREGATION_DB,
  paragraphs: [
    "You can group by a calculation as well as by a column. Grouping by the day of the week shows which days are busiest:",
    "```\nSELECT strftime('%w', sale_date) AS weekday, COUNT(*) AS sales\nFROM sales\nGROUP BY weekday;\n```",
    'SQLite lets `GROUP BY` use the name you gave the calculation with `AS`, as above. Some databases need the calculation written out again: `GROUP BY strftime(\'%w\', sale_date)`. Both work here.',
    "`CASE` makes your own groups. This splits sales into big and small ones:",
    "```\nSELECT CASE WHEN quantity >= 5 THEN 'big' ELSE 'small' END AS size,\n       COUNT(*) AS sales, SUM(quantity) AS items\nFROM sales\nGROUP BY size;\n```",
    "Grouping by a date part gives totals per day, week or month: `strftime('%W', sale_date)` is the week of the year (weeks start on Monday). `COALESCE` can turn the NULL group into a readable one: `GROUP BY COALESCE(payment, 'unknown')`.",
    'With a calculated group, make sure the label says what the group is: `weekday` `3` is a Wednesday.',
  ],
  sandboxCode: "SELECT strftime('%w', sale_date) AS weekday, COUNT(*) AS sales\nFROM sales\nGROUP BY weekday;",
  sandboxSnippets: [
    snippet('By weekday', "SELECT strftime('%w', sale_date) AS weekday, COUNT(*) AS sales\nFROM sales\nGROUP BY weekday;"),
    snippet('CASE groups', "SELECT CASE WHEN quantity >= 5 THEN 'big' ELSE 'small' END AS size,\n       COUNT(*) AS sales, SUM(quantity) AS items\nFROM sales\nGROUP BY size;"),
    snippet('By week', "SELECT strftime('%W', sale_date) AS week, SUM(quantity) AS items\nFROM sales GROUP BY week ORDER BY week;"),
    snippet('Named NULL group', "SELECT COALESCE(payment, 'unknown') AS payment, COUNT(*) AS sales\nFROM sales GROUP BY COALESCE(payment, 'unknown');"),
  ],
  readMore: { label: 'SQLite: GROUP BY', url: 'https://www.sqlite.org/lang_select.html#resultset', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Sales by weekday', {
      prompt: "Show each day of the week as a number (`strftime('%w', sale_date)`, called `weekday`) and its number of sales, called `sales`.",
      hint: 'Give the `strftime` expression the name `weekday`, then group by that name.',
      solution: "SELECT strftime('%w', sale_date) AS weekday, COUNT(*) AS sales FROM sales GROUP BY weekday;",
    }),
    query('easy', 'Big and small', {
      prompt: 'Group the sales into `big` (5 or more items) and `small`, in a column called `size`, and count each group in a column called `sales`.',
      hint: "`CASE WHEN quantity >= 5 THEN 'big' ELSE 'small' END AS size ... GROUP BY size`.",
      solution: "SELECT CASE WHEN quantity >= 5 THEN 'big' ELSE 'small' END AS size, COUNT(*) AS sales\nFROM sales\nGROUP BY size;",
    }),
    query('easy', 'Grades', {
      prompt: "For the exams that were taken, show each `grade` (`A` for 90 or more, `B` for 75 or more, `C` for 60 or more, `D` otherwise) and how many results got it, called `results`. In grade order.",
      hint: "`WHERE score IS NOT NULL`, a CASE for the grade, `GROUP BY grade ORDER BY grade`.",
      solution: "SELECT CASE\n    WHEN score >= 90 THEN 'A'\n    WHEN score >= 75 THEN 'B'\n    WHEN score >= 60 THEN 'C'\n    ELSE 'D'\n  END AS grade,\n  COUNT(*) AS results\nFROM results\nWHERE score IS NOT NULL\nGROUP BY grade\nORDER BY grade;",
    }),
    query('medium', 'Takings per day', {
      prompt: 'Show each `sale_date` and that day\'s takings (quantity times unit price, summed and rounded to 2 decimals), called `revenue`, in date order.',
      hint: '`GROUP BY sale_date ORDER BY sale_date`.',
      solution: 'SELECT sale_date, ROUND(SUM(quantity * unit_price), 2) AS revenue FROM sales\nGROUP BY sale_date\nORDER BY sale_date;',
    }),
    query('medium', 'Price bands', {
      prompt: "Group the sales by price: `under 3` for a `unit_price` below 3 and `3 or more` otherwise, in a column called `band`, with the number of items sold in each, called `items`.",
      hint: "`CASE WHEN unit_price < 3 THEN 'under 3' ELSE '3 or more' END AS band ... GROUP BY band`.",
      solution: "SELECT CASE WHEN unit_price < 3 THEN 'under 3' ELSE '3 or more' END AS band, SUM(quantity) AS items\nFROM sales\nGROUP BY band;",
    }),
    query('medium', 'Unknown payments, named', {
      prompt: "Show each payment method, with `unknown` for the missing ones (call it `payment`), and the number of sales, called `sales`.",
      hint: "Group by the same COALESCE: `GROUP BY COALESCE(payment, 'unknown')`.",
      solution: "SELECT COALESCE(payment, 'unknown') AS payment, COUNT(*) AS sales FROM sales\nGROUP BY COALESCE(payment, 'unknown');",
    }),
    query('hard', 'Weekly takings', {
      prompt: "Show each week of the year (`strftime('%W', sale_date)`, called `week`) and its takings, rounded to 2 decimals, called `revenue`. In week order.",
      hint: "`GROUP BY week ORDER BY week`.",
      solution: "SELECT strftime('%W', sale_date) AS week, ROUND(SUM(quantity * unit_price), 2) AS revenue\nFROM sales\nGROUP BY week\nORDER BY week;",
    }),
    query('hard', 'By first letter', {
      prompt: "Show the first letter of each `product` (called `letter`) and the number of sales of products starting with it, called `sales`, in alphabetical order.",
      hint: '`SUBSTR(product, 1, 1) AS letter ... GROUP BY letter ORDER BY letter`.',
      solution: 'SELECT SUBSTR(product, 1, 1) AS letter, COUNT(*) AS sales FROM sales\nGROUP BY letter\nORDER BY letter;',
    }),
    query('expert', 'Weekend or weekday', {
      prompt: "Show the takings on weekends and on weekdays: a column called `part` (`weekend` for Saturdays and Sundays, `weekday` otherwise) and the takings rounded to 2 decimals, called `revenue`.",
      hint: "`CASE WHEN strftime('%w', sale_date) IN ('0', '6') THEN 'weekend' ELSE 'weekday' END AS part ... GROUP BY part`.",
      solution: "SELECT CASE WHEN strftime('%w', sale_date) IN ('0', '6') THEN 'weekend' ELSE 'weekday' END AS part,\n       ROUND(SUM(quantity * unit_price), 2) AS revenue\nFROM sales\nGROUP BY part;",
    }),
    query('expert', 'Items by whole price', {
      prompt: 'Show each `unit_price` rounded to a whole number (called `price`) and the number of items sold at it, called `items`, cheapest first.',
      hint: '`ROUND(unit_price) AS price ... GROUP BY price ORDER BY price`.',
      solution: 'SELECT ROUND(unit_price) AS price, SUM(quantity) AS items FROM sales\nGROUP BY price\nORDER BY price;',
    }),
  ],
  questions: [
    mc('Can GROUP BY use a calculation, not only a column?', ['No', 'Yes, such as a date part or a CASE', 'Only numbers', 'Only with HAVING'], 1,
      'Any expression can be a group: every row with the same result goes in the same group.'),
    mc("Does SQLite allow `GROUP BY weekday` when `weekday` is a name given with AS?", ['Yes', 'No', 'Only for text', 'Only in ORDER BY'], 0,
      'SQLite allows it. Some other databases need the calculation written out again.'),
    mc("What does `strftime('%W', date)` give?", ['The weekday', 'The day of the year', 'The week of the year', 'The month'], 2,
      '%W is the week number (weeks starting on Monday); %w is the day of the week.'),
    qShort("How many groups does `CASE WHEN quantity >= 5 THEN 'big' ELSE 'small' END` make?", '2',
      'Every row is either big or small.'),
    mc("How do you give the NULL payment group a readable name?", ["`GROUP BY payment AS 'unknown'`", '`WHERE payment IS NULL`', "`HAVING 'unknown'`", "`COALESCE(payment, 'unknown')` in SELECT and GROUP BY"], 3,
      'COALESCE turns NULL into a label before grouping.'),
    mc('Grades by CASE: why add `WHERE score IS NOT NULL`?', ['So absences don\'t land in the ELSE grade', 'CASE needs it', 'To sort the grades', 'It makes no difference'], 0,
      'A NULL score fails every WHEN and would be counted as a D.'),
    mc('Which gives one row per day?', ['`GROUP BY sales`', "`GROUP BY strftime('%Y', sale_date)`", '`GROUP BY sale_date`', '`GROUP BY quantity`'], 2,
      'Each date is its own group.'),
    mc("Which shows the busiest weekday first?", ["`ORDER BY weekday`", "`ORDER BY sales DESC` (with `COUNT(*) AS sales`)", '`GROUP BY sales DESC`', '`LIMIT 1` alone'], 1,
      'Sort the groups by their count.'),
    mc('What is weekday 0 in SQLite?', ['Monday', 'Saturday', 'It is not used', 'Sunday'], 3,
      "strftime('%w') counts from 0 for Sunday to 6 for Saturday."),
    mc('Grouping by `ROUND(unit_price)` puts 2.5 and 2.6 in…', ['Different groups', 'The same group, 3.0', 'The same group, 2.0', 'No group'], 1,
      'Both round to 3, so they share a group.'),
  ],
})
