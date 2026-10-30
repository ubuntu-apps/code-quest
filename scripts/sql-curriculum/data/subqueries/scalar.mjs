// Subqueries and sets: A value from another query.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { SUBQUERIES_DB } from '../subqueries-db.mjs'

export default makeTopic({
  id: 'scalar_subqueries',
  title: 'A value from another query',
  database: SUBQUERIES_DB,
  paragraphs: [
    "This quest's database is a small music streaming service: `artists`, their `tracks`, the `listeners`, every time a listener `plays` a track, and which artists each listener `follows`. Open **Tables** to see them.",
    'Which tracks are longer than average? You could work out the average first, then type it into a second query. A **subquery** does both at once: a whole query in brackets, used where a value would go.',
    '```\nSELECT title, duration_s\nFROM tracks\nWHERE duration_s > (SELECT AVG(duration_s) FROM tracks);\n```',
    'SQLite runs the query in brackets first, gets one number, and uses it in the comparison. Typing the number in yourself would work today, but would be wrong as soon as a track is added; the subquery always uses the current average.',
    'A subquery used as a value must give **one column**. It should also give one row. If it gives no rows, its value is `NULL`. If it gives several, SQLite quietly uses the first one, and most other databases give an error, so make sure it can only give one, for example with an aggregate like `MAX` or with `LIMIT 1`.',
    'A value subquery can go anywhere a value can, including the `SELECT` list. This shows how far each track is from the average:',
    '```\nSELECT title,\n       duration_s - (SELECT AVG(duration_s) FROM tracks) AS diff\nFROM tracks;\n```',
    'A good habit: run the subquery on its own in the sandbox first, check its result, then put it in brackets inside the bigger query.',
  ],
  sandboxCode: 'SELECT title, duration_s\nFROM tracks\nWHERE duration_s > (SELECT AVG(duration_s) FROM tracks);',
  sandboxSnippets: [
    snippet('The average alone', 'SELECT AVG(duration_s) FROM tracks;'),
    snippet('Longer than average', 'SELECT title, duration_s\nFROM tracks\nWHERE duration_s > (SELECT AVG(duration_s) FROM tracks);'),
    snippet('Distance from average', 'SELECT title,\n       duration_s - (SELECT AVG(duration_s) FROM tracks) AS diff\nFROM tracks;'),
    snippet('The longest track', 'SELECT title, duration_s\nFROM tracks\nWHERE duration_s = (SELECT MAX(duration_s) FROM tracks);'),
  ],
  readMore: { label: 'SQLite: subquery expressions', url: 'https://www.sqlite.org/lang_expr.html#subq', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Longer than average', {
      prompt: 'Show the `title` and `duration_s` of every track longer than the average track. Use a subquery, not a typed number.',
      hint: '`WHERE duration_s > (SELECT AVG(duration_s) FROM tracks)`.',
      solution: 'SELECT title, duration_s\nFROM tracks\nWHERE duration_s > (SELECT AVG(duration_s) FROM tracks);',
    }),
    query('easy', 'The longest track', {
      prompt: 'Show the `title` and `duration_s` of the longest track, using `MAX` in a subquery.',
      hint: '`WHERE duration_s = (SELECT MAX(duration_s) FROM tracks)`.',
      solution: 'SELECT title, duration_s\nFROM tracks\nWHERE duration_s = (SELECT MAX(duration_s) FROM tracks);',
    }),
    query('easy', 'The newest release', {
      prompt: 'Show the `title` and `released` date of the most recently released track.',
      hint: '`WHERE released = (SELECT MAX(released) FROM tracks)`.',
      solution: 'SELECT title, released\nFROM tracks\nWHERE released = (SELECT MAX(released) FROM tracks);',
    }),
    query('medium', 'Distance from average', {
      prompt: 'Show each track\'s `title` and how many seconds longer (positive) or shorter (negative) than the average it is, rounded to 1 decimal, called `diff`.',
      hint: '`ROUND(duration_s - (SELECT AVG(duration_s) FROM tracks), 1) AS diff`.',
      solution: 'SELECT title, ROUND(duration_s - (SELECT AVG(duration_s) FROM tracks), 1) AS diff\nFROM tracks;',
    }),
    query('medium', 'Share of all plays', {
      prompt: 'Show each `track_id` in `plays`, its number of plays (`plays`) and its share of all plays as a percentage rounded to 1 decimal (`percent`). Most plays first, then by track id.',
      hint: '`ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM plays), 1) AS percent`, grouped by track_id.',
      solution: 'SELECT track_id, COUNT(*) AS plays,\n       ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM plays), 1) AS percent\nFROM plays\nGROUP BY track_id\nORDER BY plays DESC, track_id;',
    }),
    query('medium', 'Premium out of all', {
      prompt: 'In one row, show the number of premium listeners (`premium`) and the number of all listeners (`total`), each from its own subquery.',
      hint: 'Each column is a subquery in brackets, `(SELECT COUNT(*) FROM …)`, with its name after `AS`. No FROM is needed after them.',
      solution: "SELECT (SELECT COUNT(*) FROM listeners WHERE plan = 'premium') AS premium,\n       (SELECT COUNT(*) FROM listeners) AS total;",
    }),
    query('hard', 'Fix the misuse', {
      prompt: 'This query should list the tracks shorter than average, but gives the error **misuse of aggregate function AVG()**. Fix it.',
      starter: 'SELECT title, duration_s\nFROM tracks\nWHERE duration_s < AVG(duration_s);',
      hint: 'WHERE works row by row and can\'t use an aggregate directly. Put the average in a subquery.',
      solution: 'SELECT title, duration_s\nFROM tracks\nWHERE duration_s < (SELECT AVG(duration_s) FROM tracks);',
    }),
    query('hard', 'The last week', {
      prompt: 'Count the plays in the 7 days up to and including the latest play date (the latest date and the 6 days before it), called `recent`.',
      hint: "`WHERE played_on > date((SELECT MAX(played_on) FROM plays), '-7 days')`.",
      solution: "SELECT COUNT(*) AS recent\nFROM plays\nWHERE played_on > date((SELECT MAX(played_on) FROM plays), '-7 days');",
    }),
    query('expert', 'Long-playing artists', {
      prompt: "Show the `name` of each artist whose tracks are longer on average than the average of all tracks, with their average rounded to 1 decimal (`average`). Longest first.",
      hint: 'Join tracks to artists, group by artist, and `HAVING AVG(t.duration_s) > (SELECT AVG(duration_s) FROM tracks)`.',
      solution: 'SELECT a.name, ROUND(AVG(t.duration_s), 1) AS average\nFROM tracks t\nJOIN artists a ON a.id = t.artist_id\nGROUP BY a.id, a.name\nHAVING AVG(t.duration_s) > (SELECT AVG(duration_s) FROM tracks)\nORDER BY average DESC;',
    }),
    query('expert', 'Same artist', {
      prompt: "Show the `title` of every other track by the artist of `Glass City`, without typing that artist's id.",
      hint: "`WHERE artist_id = (SELECT artist_id FROM tracks WHERE title = 'Glass City') AND title <> 'Glass City'`.",
      solution: "SELECT title\nFROM tracks\nWHERE artist_id = (SELECT artist_id FROM tracks WHERE title = 'Glass City')\n  AND title <> 'Glass City';",
    }),
  ],
  questions: [
    mc('What is a subquery?', ['A query that changes data', 'A smaller table', 'A query with LIMIT', 'A query in brackets inside another query'], 3,
      'The inner query runs first and its result is used by the outer one.'),
    mc('Why use a subquery instead of typing the average?', ['Typed numbers are not allowed', 'It sorts the result', 'It is shorter', 'It stays right when the data changes'], 3,
      'The subquery works out the average every time the query runs.'),
    mc('How many columns may a value subquery return?', ['Two', 'One', 'None', 'Any number'], 1,
      'It stands for a single value, so one column.'),
    mc('A value subquery finds no rows. What is its value?', ['`NULL`', '0', 'An empty string', 'An error'], 0,
      'No row means no value: NULL.'),
    mc('In SQLite, what happens if a value subquery returns several rows?', ['It gives an error', 'It returns them all', 'It adds them up', 'It uses the first row'], 3,
      'SQLite quietly uses the first row; most other databases give an error.'),
    qShort('Which aggregate gives the largest value, as in `(SELECT ___(duration_s) FROM tracks)`?', 'MAX',
      'MAX returns one value: the largest.'),
    mc('Why does `WHERE duration_s < AVG(duration_s)` fail?', ['duration_s is text', 'It needs ORDER BY', 'AVG needs ROUND', 'WHERE runs row by row and can\'t use an aggregate'], 3,
      'Put the aggregate in a subquery instead.'),
    mc('Can a subquery go in the SELECT list?', ['No, only in WHERE', 'Only with GROUP BY', 'Yes, anywhere a single value can go', 'Only in FROM'], 2,
      'For example `duration_s - (SELECT AVG(duration_s) FROM tracks)`.'),
    mc('Which runs first?', ['They run at the same time', 'Whichever is shorter', 'The subquery', 'The outer query'], 2,
      'Its result is needed before the outer comparison can be made.'),
    mc('What is a good way to write a subquery?', ['Avoid aggregates', 'Run it alone first, then put it in brackets', 'Always add LIMIT', 'Write the outer query last'], 1,
      'Checking the inner result first makes mistakes easy to see.'),
  ],
})
