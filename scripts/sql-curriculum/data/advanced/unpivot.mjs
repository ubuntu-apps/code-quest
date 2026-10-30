// Advanced queries: Turning columns into rows.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { ADVANCED_DB } from '../advanced-db.mjs'

const UNION = "SELECT staff_id, 'q1' AS quarter, q1 AS target FROM targets\nUNION ALL SELECT staff_id, 'q2', q2 FROM targets\nUNION ALL SELECT staff_id, 'q3', q3 FROM targets\nUNION ALL SELECT staff_id, 'q4', q4 FROM targets\nORDER BY staff_id, quarter;"
const QUARTERS = 'WITH quarters(quarter) AS (VALUES (1), (2), (3), (4))\n'
const ROWS = QUARTERS + 'SELECT t.staff_id, q.quarter,\n       CASE q.quarter WHEN 1 THEN t.q1 WHEN 2 THEN t.q2 WHEN 3 THEN t.q3 ELSE t.q4 END AS target\nFROM targets t\nCROSS JOIN quarters q\n'
const LONG = QUARTERS + ', long AS (\n  SELECT t.staff_id, q.quarter,\n         CASE q.quarter WHEN 1 THEN t.q1 WHEN 2 THEN t.q2 WHEN 3 THEN t.q3 ELSE t.q4 END AS target\n  FROM targets t\n  CROSS JOIN quarters q\n)\n'

export default makeTopic({
  id: 'unpivot',
  title: 'Columns into rows',
  database: ADVANCED_DB,
  paragraphs: [
    "`targets` is **wide**: one column per quarter. That is easy to read, but hard to query. To find each person's best quarter, or the total of all targets per quarter, you would have to write the same thing four times. A **long** table, one row per person and quarter, is much easier: then it's an ordinary GROUP BY.",
    'The plain way to turn columns into rows is one SELECT per column, joined with `UNION ALL`:',
    '```\n' + UNION + '\n```',
    'Another way is to join every row to a list of the quarters and pick the right column with CASE. `VALUES` makes the list without a table:',
    '```\n' + ROWS + 'WHERE target IS NOT NULL\nORDER BY t.staff_id, q.quarter;\n```',
    "`CROSS JOIN` pairs every target row with every quarter: 4 rows for each person. The CASE picks the column that goes with the quarter. Empty quarters come out as NULL targets, so filter them out, or keep them if the gaps matter.",
    "Once the data is long, put it in a CTE and query it like any table: group it, rank it, or run windows over it.",
  ],
  sandboxCode: UNION,
  sandboxSnippets: [
    snippet('With UNION ALL', UNION),
    snippet('With VALUES', ROWS + 'WHERE target IS NOT NULL\nORDER BY t.staff_id, q.quarter;'),
    snippet('A list from VALUES', "SELECT * FROM (VALUES (1, 'q1'), (2, 'q2'));"),
  ],
  readMore: { label: 'SQLite: the VALUES clause', url: 'https://www.sqlite.org/lang_select.html#the_values_clause', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Quarter rows', {
      prompt: "Turn targets into rows with UNION ALL: `staff_id`, `quarter` (`q1` to `q4`) and `target`, empty quarters included. Sort by staff_id, then quarter.",
      hint: "`SELECT staff_id, 'q1' AS quarter, q1 AS target FROM targets UNION ALL …`.",
      solution: UNION,
    }),
    query('easy', 'Without the gaps', {
      prompt: "The same rows, but leave out quarters with no target. Sort by staff_id, then quarter.",
      hint: 'Put a WHERE on each SELECT, or wrap the UNION ALL in a subquery and filter once.',
      solution: "SELECT staff_id, quarter, target\nFROM (\n  SELECT staff_id, 'q1' AS quarter, q1 AS target FROM targets\n  UNION ALL SELECT staff_id, 'q2', q2 FROM targets\n  UNION ALL SELECT staff_id, 'q3', q3 FROM targets\n  UNION ALL SELECT staff_id, 'q4', q4 FROM targets\n) AS t\nWHERE target IS NOT NULL\nORDER BY staff_id, quarter;",
    }),
    query('easy', 'With VALUES', {
      prompt: "Make the rows with a VALUES list of quarters 1 to 4 and CROSS JOIN: `staff_id`, `quarter` (a number) and `target`, leaving out empty quarters. Sort by staff_id, then quarter.",
      hint: 'The intro\'s second example.',
      solution: ROWS + 'WHERE target IS NOT NULL\nORDER BY t.staff_id, q.quarter;',
    }),
    query('medium', 'Yearly totals', {
      prompt: "Show each staff member's `name` with targets and the sum of their quarter targets (`year_target`). Sort by name.",
      hint: 'Make the long rows in a CTE, then join staff and `SUM(target)` per person (SUM skips the NULLs).',
      solution: LONG + 'SELECT s.name, SUM(l.target) AS year_target\nFROM long l\nJOIN staff s ON s.id = l.staff_id\nGROUP BY s.id, s.name\nORDER BY s.name;',
    }),
    query('medium', 'Empty quarters', {
      prompt: 'Show the `name` and `quarter` (a number) of every quarter with no target. Sort by name, then quarter.',
      hint: 'Long rows, then `WHERE target IS NULL`.',
      solution: LONG + 'SELECT s.name, l.quarter\nFROM long l\nJOIN staff s ON s.id = l.staff_id\nWHERE l.target IS NULL\nORDER BY s.name, l.quarter;',
    }),
    query('medium', 'Quarter totals', {
      prompt: 'For each `quarter` (a number), show the sum of the targets (`total`) and how many people have one (`people`). In order of quarter.',
      hint: '`GROUP BY quarter` on the long rows; `COUNT(target)` skips the NULLs.',
      solution: LONG + 'SELECT quarter, SUM(target) AS total, COUNT(target) AS people\nFROM long\nGROUP BY quarter\nORDER BY quarter;',
    }),
    query('hard', 'Best quarter', {
      prompt: "Show each staff member's highest quarter target: `name`, `quarter` (a number; the earlier one on a tie) and `target`. Sort by name.",
      hint: 'ROW_NUMBER per person over the long rows, `ORDER BY target DESC, quarter`; keep 1. NULLs sort last with DESC.',
      solution: LONG + ', ranked AS (\n  SELECT staff_id, quarter, target,\n         ROW_NUMBER() OVER (PARTITION BY staff_id ORDER BY target DESC, quarter) AS n\n  FROM long\n  WHERE target IS NOT NULL\n)\nSELECT s.name, r.quarter, r.target\nFROM ranked r\nJOIN staff s ON s.id = r.staff_id\nWHERE r.n = 1\nORDER BY s.name;',
    }),
    query('hard', 'Quarter on quarter', {
      prompt: "For each quarter with a target, show `staff_id`, `quarter`, `target` and the rise since that person's previous quarter with a target (`rise`; empty for their first). Sort by staff_id, then quarter.",
      hint: 'Long rows without the NULLs, then `target - LAG(target) OVER (PARTITION BY staff_id ORDER BY quarter)`.',
      solution: LONG + 'SELECT staff_id, quarter, target,\n       target - LAG(target) OVER (PARTITION BY staff_id ORDER BY quarter) AS rise\nFROM long\nWHERE target IS NOT NULL\nORDER BY staff_id, quarter;',
    }),
    query('expert', 'Halves', {
      prompt: "Go long and back again: for each `staff_id`, show the targets of the first half-year (`first_half`, Q1 and Q2) and second half (`second_half`), treating empty quarters as 0. Sort by staff_id.",
      hint: 'Long rows, then a pivot: `SUM(CASE WHEN quarter <= 2 THEN COALESCE(target, 0) ELSE 0 END)`.',
      solution: LONG + 'SELECT staff_id,\n       SUM(CASE WHEN quarter <= 2 THEN COALESCE(target, 0) ELSE 0 END) AS first_half,\n       SUM(CASE WHEN quarter > 2 THEN COALESCE(target, 0) ELSE 0 END) AS second_half\nFROM long\nGROUP BY staff_id\nORDER BY staff_id;',
    }),
    query('expert', 'When targets start', {
      prompt: "For each staff member with targets, show `name`, their first quarter with a target (`first_quarter`) and how many quarters have one (`quarters`). Sort by first_quarter, then name.",
      hint: 'On the long rows without NULLs: `MIN(quarter)` and `COUNT(*)` per person.',
      solution: LONG + 'SELECT s.name, MIN(l.quarter) AS first_quarter, COUNT(*) AS quarters\nFROM long l\nJOIN staff s ON s.id = l.staff_id\nWHERE l.target IS NOT NULL\nGROUP BY s.id, s.name\nORDER BY first_quarter, s.name;',
    }),
  ],
  questions: [
    mc('Why turn the quarter columns into rows?', ['To save space', 'Because columns can\'t hold numbers', 'To sort faster', 'So ordinary GROUP BY, ranks and windows work across the quarters'], 3,
      'Long data is easier to query.'),
    mc('How many SELECTs does the UNION ALL way need for four quarter columns?', ['Two', 'Eight', 'One', 'Four, one per column'], 3,
      'Each SELECT turns one column into rows.'),
    mc('What does `WITH quarters(quarter) AS (VALUES (1), (2), (3), (4))` make?', ['A table on disk', 'A view', 'A list of four rows with one column, for this query only', 'An index'], 2,
      'VALUES makes rows without a table.'),
    mc('What does CROSS JOIN do here?', ['Pairs every targets row with every quarter', 'Joins on matching ids', 'Removes NULLs', 'Joins quarters to targets on quarter'], 0,
      'Four rows per person, one per quarter.'),
    qShort('Which keyword makes rows from a list, as in `… (1), (2), (3)`?', 'VALUES',
      'It can stand in for a table.'),
    mc("Why UNION ALL and not UNION?", ['UNION is not allowed', 'UNION sorts the columns', 'There is no difference', 'UNION would drop rows that happen to be identical, and do extra work checking'], 3,
      'Two people with the same target in the same quarter must both stay.'),
    mc('What does SUM do with the NULL targets?', ['Skips them', 'Gives NULL', 'Gives an error', 'Treats them as 0 and counts them'], 0,
      'Aggregates skip NULLs (but COUNT(*) counts the rows).'),
    mc('Which column picks the right target in the VALUES way?', ['WHERE', 'A CASE on the quarter', 'GROUP BY', 'ORDER BY'], 1,
      '`CASE q.quarter WHEN 1 THEN t.q1 …`.'),
    mc('Is a wide table ever the better shape?', ['Only for dates', 'Yes, for reading or printing, when the columns are fixed', 'Never', 'Always'], 1,
      'Wide for people, long for queries.'),
    mc('After making long rows in a CTE, can you pivot them back?', ['Only with UNION', 'Only in a view', 'Yes, with CASE or FILTER sums', 'No'], 2,
      'Like the Halves challenge.'),
  ],
})
