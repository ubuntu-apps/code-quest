// Functions and expressions: CASE, choosing a value.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { EXPRESSIONS_DB } from '../expressions-db.mjs'

export default makeTopic({
  id: 'case_basics',
  title: 'CASE: choosing a value',
  database: EXPRESSIONS_DB,
  paragraphs: [
    "`CASE` chooses a value for each row, like an IF in other programming languages. It checks its `WHEN` conditions in order and uses the value after the first one that is true; if none is, it uses the `ELSE` value. It ends with `END`.",
    "```\nSELECT id, total,\n  CASE WHEN total >= 100 THEN 'big' ELSE 'small' END AS size\nFROM orders;\n```",
    'There can be as many `WHEN`s as you need. Because the first true one wins, put the strictest condition first:',
    "```\nSELECT name, salary,\n  CASE\n    WHEN salary >= 60000 THEN 'high'\n    WHEN salary >= 40000 THEN 'medium'\n    ELSE 'low'\n  END AS band\nFROM employees;\n```",
    "A salary of 65500 is also at least 40000, but it gets `'high'` because that `WHEN` comes first. In the other order, nobody would ever be `'high'`.",
    'Without an `ELSE`, rows that match no `WHEN` get `NULL`.',
    "When every condition compares the same column with `=`, there is a shorter form: name the column after `CASE` and give only values after each `WHEN`.",
    "```\nSELECT id,\n  CASE status WHEN 'shipped' THEN 'Sent' WHEN 'pending' THEN 'Waiting' ELSE 'Cancelled' END AS label\nFROM orders;\n```",
    'Like any other column, a `CASE` column needs a name given with `AS`.',
  ],
  sandboxCode: "SELECT id, total,\n  CASE WHEN total >= 100 THEN 'big' ELSE 'small' END AS size\nFROM orders;",
  sandboxSnippets: [
    snippet('Two choices', "SELECT id, total,\n  CASE WHEN total >= 100 THEN 'big' ELSE 'small' END AS size\nFROM orders;"),
    snippet('Bands', "SELECT name, salary,\n  CASE\n    WHEN salary >= 60000 THEN 'high'\n    WHEN salary >= 40000 THEN 'medium'\n    ELSE 'low'\n  END AS band\nFROM employees;"),
    snippet('No ELSE', "SELECT id, CASE WHEN discount > 10 THEN 'big discount' END AS note FROM orders;"),
    snippet('Short form', "SELECT id,\n  CASE status WHEN 'shipped' THEN 'Sent' WHEN 'pending' THEN 'Waiting' ELSE 'Cancelled' END AS label\nFROM orders;"),
    snippet('Missing values', "SELECT first_name, CASE WHEN phone IS NULL THEN 'no phone' ELSE phone END AS contact\nFROM customers;"),
  ],
  readMore: { label: 'SQLite: the CASE expression', url: 'https://www.sqlite.org/lang_expr.html#case', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Big or small', {
      prompt: "Show each order's `id`, `total`, and a column called `size` that is `big` for totals of 100 or more and `small` otherwise.",
      hint: "`CASE WHEN total >= 100 THEN 'big' ELSE 'small' END AS size`.",
      solution: "SELECT id, total, CASE WHEN total >= 100 THEN 'big' ELSE 'small' END AS size FROM orders;",
    }),
    query('easy', 'Shipped yet?', {
      prompt: "Show each order's `id` and a column called `shipped` that is `yes` when it has a `ship_date` and `no` when the ship date is missing.",
      hint: "`CASE WHEN ship_date IS NULL THEN 'no' ELSE 'yes' END AS shipped`.",
      solution: "SELECT id, CASE WHEN ship_date IS NULL THEN 'no' ELSE 'yes' END AS shipped FROM orders;",
    }),
    query('easy', 'Status labels', {
      prompt: "Show each order's `id` and a `label`: `Sent` for shipped orders, `Waiting` for pending ones, and `Cancelled` for the rest. Use the short form, `CASE status WHEN ...`.",
      hint: "`CASE status WHEN 'shipped' THEN 'Sent' WHEN 'pending' THEN 'Waiting' ELSE 'Cancelled' END AS label`.",
      solution: "SELECT id, CASE status WHEN 'shipped' THEN 'Sent' WHEN 'pending' THEN 'Waiting' ELSE 'Cancelled' END AS label FROM orders;",
    }),
    query('medium', 'Pay bands', {
      prompt: "Show each employee's `name` and a `band`: `high` for salaries of 60000 or more, `medium` for 40000 or more, and `low` otherwise.",
      hint: "Strictest first: `WHEN salary >= 60000 THEN 'high' WHEN salary >= 40000 THEN 'medium' ELSE 'low'`.",
      solution: "SELECT name,\n  CASE\n    WHEN salary >= 60000 THEN 'high'\n    WHEN salary >= 40000 THEN 'medium'\n    ELSE 'low'\n  END AS band\nFROM employees;",
    }),
    query('medium', 'How to reach them', {
      prompt: "Show each customer's `first_name` and a `contact` column: their phone number, or `email only` when the phone is missing.",
      hint: "`CASE WHEN phone IS NULL THEN 'email only' ELSE phone END AS contact`.",
      solution: "SELECT first_name, CASE WHEN phone IS NULL THEN 'email only' ELSE phone END AS contact FROM customers;",
    }),
    query('medium', 'Bonus, or zero', {
      prompt: "Show each employee's `name` and their `bonus`, with 0 instead of a missing bonus. Call the column `bonus`.",
      hint: '`CASE WHEN bonus IS NULL THEN 0 ELSE bonus END AS bonus`.',
      solution: 'SELECT name, CASE WHEN bonus IS NULL THEN 0 ELSE bonus END AS bonus FROM employees;',
    }),
    query('hard', 'Seasons', {
      prompt: "Show each order's `id`, `order_date` and a `season` from its month: `winter` for months 12, 01 and 02, `spring` for 03 to 05, `summer` for 06 to 08, and `autumn` otherwise.",
      hint: "The month is `SUBSTR(order_date, 6, 2)`. Use `WHEN SUBSTR(order_date, 6, 2) IN ('12', '01', '02') THEN 'winter'` and so on.",
      solution: "SELECT id, order_date,\n  CASE\n    WHEN SUBSTR(order_date, 6, 2) IN ('12', '01', '02') THEN 'winter'\n    WHEN SUBSTR(order_date, 6, 2) IN ('03', '04', '05') THEN 'spring'\n    WHEN SUBSTR(order_date, 6, 2) IN ('06', '07', '08') THEN 'summer'\n    ELSE 'autumn'\n  END AS season\nFROM orders;",
    }),
    query('expert', 'Teams', {
      prompt: "Show each employee's `name`, `role` and a `team`: `Product` for developers, designers and analysts, `Service` for support, and `Other` for everyone else.",
      hint: "`WHEN role IN ('Developer', 'Designer', 'Analyst') THEN 'Product' WHEN role = 'Support' THEN 'Service' ELSE 'Other'`.",
      solution: "SELECT name, role,\n  CASE\n    WHEN role IN ('Developer', 'Designer', 'Analyst') THEN 'Product'\n    WHEN role = 'Support' THEN 'Service'\n    ELSE 'Other'\n  END AS team\nFROM employees;",
    }),
    query('expert', 'Fix the order', {
      prompt: 'This query should label totals of 200 or more as `large`, 50 or more as `medium`, and the rest as `small`, but no order is ever `large`. Fix it.',
      starter: "SELECT id, total,\n  CASE\n    WHEN total >= 50 THEN 'medium'\n    WHEN total >= 200 THEN 'large'\n    ELSE 'small'\n  END AS size\nFROM orders;",
      hint: 'The first true WHEN wins, and every total of 200 or more is also at least 50. Put the `>= 200` check first.',
      solution: "SELECT id, total,\n  CASE\n    WHEN total >= 200 THEN 'large'\n    WHEN total >= 50 THEN 'medium'\n    ELSE 'small'\n  END AS size\nFROM orders;",
    }),
  ],
  questions: [
    mc('What does CASE do?', ['Changes the case of text', 'Chooses a value for each row from conditions', 'Sorts the rows', 'Filters out rows'], 1,
      'CASE picks a value per row: the one after the first WHEN that is true, or the ELSE value.'),
    mc('Which WHEN is used when several are true?', ['The first one', 'The last one', 'All of them', 'None: it is an error'], 0,
      'CASE stops at the first WHEN that is true.'),
    mc('What does a row get when no WHEN matches and there is no ELSE?', ['0', 'An error', '`NULL`', 'The first value'], 2,
      'Without ELSE, unmatched rows get NULL.'),
    qShort('Which keyword closes a CASE expression?', 'END',
      'Every CASE finishes with END (then usually AS and a name).'),
    mc("For a salary of 65500, what does `CASE WHEN salary >= 40000 THEN 'medium' WHEN salary >= 60000 THEN 'high' END` give?", ["`'high'`", '`NULL`', 'Both', "`'medium'`"], 3,
      'The first WHEN is already true, so the second one is never reached.'),
    mc("Which is the short form for comparing `status`?", ["`CASE status WHEN 'shipped' THEN 'Sent' END`", "`CASE WHEN 'shipped' THEN 'Sent' END`", "`CASE status = 'shipped' THEN 'Sent'`", "`WHEN status CASE 'shipped'`"], 0,
      "Name the column after CASE, then give only values after each WHEN."),
    mc('Which parts of CASE are needed?', ['Only ELSE', 'CASE, at least one WHEN … THEN, and END', 'CASE and ELSE', 'WHEN and ELSE'], 1,
      'ELSE is optional; CASE, WHEN … THEN and END are needed.'),
    mc("How do you test for a missing value inside CASE?", ["`WHEN phone = NULL`", "`WHEN phone == NULL`", "`WHEN NULL`", '`WHEN phone IS NULL`'], 3,
      'As in WHERE, missing values are tested with IS NULL.'),
    mc('Does a CASE column need a name?', ['Yes, give it one with AS, like any calculated column', 'No, SQL names it', 'Only with ELSE', 'Only for numbers'], 0,
      'Without AS, the heading would be the whole CASE expression.'),
  ],
})
