// Subqueries and sets: WITH (common table expressions).
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { SUBQUERIES_DB } from '../subqueries-db.mjs'

export default makeTopic({
  id: 'with_cte',
  title: 'WITH: naming a subquery',
  database: SUBQUERIES_DB,
  paragraphs: [
    '`WITH` gives a subquery a name **before** the main query, which can then use it like a table. Such a named subquery is called a **common table expression**, or CTE.',
    '```\nWITH per_listener AS (\n  SELECT listener_id, COUNT(*) AS plays\n  FROM plays\n  GROUP BY listener_id\n)\nSELECT l.name, pl.plays\nFROM per_listener pl\nJOIN listeners l ON l.id = pl.listener_id\nWHERE pl.plays > (SELECT AVG(plays) FROM per_listener)\nORDER BY pl.plays DESC, l.name;\n```',
    'Compare it with the last stage, where the counts had to be written twice. Here they are written once and used twice: in `FROM` and inside the subquery for the average.',
    'A query with `WITH` reads from top to bottom: first the steps, then the answer. That makes long queries much easier to follow, and to check: you can test the CTE by itself by putting a plain `SELECT * FROM per_listener;` after it.',
    "The CTE only exists while its query runs; it doesn't create a table. Inside it, name every calculated column with `AS`, or list the names after the CTE's name: `WITH genre_plays(genre, plays) AS (…)`.",
  ],
  sandboxCode: 'WITH per_listener AS (\n  SELECT listener_id, COUNT(*) AS plays\n  FROM plays\n  GROUP BY listener_id\n)\nSELECT * FROM per_listener;',
  sandboxSnippets: [
    snippet('Look at the CTE', 'WITH per_listener AS (\n  SELECT listener_id, COUNT(*) AS plays\n  FROM plays\n  GROUP BY listener_id\n)\nSELECT * FROM per_listener;'),
    snippet('Use it twice', 'WITH per_listener AS (\n  SELECT listener_id, COUNT(*) AS plays\n  FROM plays\n  GROUP BY listener_id\n)\nSELECT l.name, pl.plays\nFROM per_listener pl\nJOIN listeners l ON l.id = pl.listener_id\nWHERE pl.plays > (SELECT AVG(plays) FROM per_listener)\nORDER BY pl.plays DESC, l.name;'),
    snippet('Column names in the header', 'WITH genre_plays(genre, plays) AS (\n  SELECT a.genre, COUNT(*)\n  FROM plays p\n  JOIN tracks t ON t.id = p.track_id\n  JOIN artists a ON a.id = t.artist_id\n  GROUP BY a.genre\n)\nSELECT * FROM genre_plays;'),
  ],
  readMore: { label: 'SQLite: the WITH clause', url: 'https://www.sqlite.org/lang_with.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Big catalogues', {
      prompt: "Using a CTE that counts each artist's tracks, show the `name` and number of tracks (`tracks`) of the artists with more than 2 tracks.",
      hint: '`WITH counts AS (SELECT artist_id, COUNT(*) AS tracks FROM tracks GROUP BY artist_id) SELECT a.name, c.tracks FROM counts c JOIN artists a ON a.id = c.artist_id WHERE c.tracks > 2;`',
      solution: 'WITH counts AS (\n  SELECT artist_id, COUNT(*) AS tracks\n  FROM tracks\n  GROUP BY artist_id\n)\nSELECT a.name, c.tracks\nFROM counts c\nJOIN artists a ON a.id = c.artist_id\nWHERE c.tracks > 2;',
    }),
    query('easy', 'Long tracks by artist', {
      prompt: 'Using a CTE called `long_tracks` with the tracks over 300 seconds, show each `artist_id` and its number of long tracks (`long_tracks`).',
      hint: '`WITH long_tracks AS (SELECT * FROM tracks WHERE duration_s > 300) SELECT artist_id, COUNT(*) AS long_tracks FROM long_tracks GROUP BY artist_id;`',
      solution: 'WITH long_tracks AS (\n  SELECT * FROM tracks WHERE duration_s > 300\n)\nSELECT artist_id, COUNT(*) AS long_tracks\nFROM long_tracks\nGROUP BY artist_id;',
    }),
    query('easy', 'Premium plays', {
      prompt: 'Using a CTE of the premium listeners, count the plays made by premium listeners, called `premium_plays`.',
      hint: "`WITH premium AS (SELECT id FROM listeners WHERE plan = 'premium') SELECT COUNT(*) AS premium_plays FROM plays WHERE listener_id IN (SELECT id FROM premium);`",
      solution: "WITH premium AS (\n  SELECT id FROM listeners WHERE plan = 'premium'\n)\nSELECT COUNT(*) AS premium_plays\nFROM plays\nWHERE listener_id IN (SELECT id FROM premium);",
    }),
    query('medium', 'Above average, again', {
      prompt: "Show the `name` and `plays` of the listeners with more plays than the average listener who played, using a CTE so the counts are written once. Most first, then by name.",
      hint: 'The CTE per_listener, then `WHERE pl.plays > (SELECT AVG(plays) FROM per_listener)`.',
      solution: 'WITH per_listener AS (\n  SELECT listener_id, COUNT(*) AS plays\n  FROM plays\n  GROUP BY listener_id\n)\nSELECT l.name, pl.plays\nFROM per_listener pl\nJOIN listeners l ON l.id = pl.listener_id\nWHERE pl.plays > (SELECT AVG(plays) FROM per_listener)\nORDER BY pl.plays DESC, l.name;',
    }),
    query('medium', 'Genre averages', {
      prompt: 'With a CTE of plays per track, show each `genre` and the average plays of its played tracks (`plays_per_track`, 2 decimals). Highest first, then by genre.',
      hint: '`WITH per_track AS (SELECT track_id, COUNT(*) AS plays FROM plays GROUP BY track_id)`, then join tracks and artists and group by genre.',
      solution: 'WITH per_track AS (\n  SELECT track_id, COUNT(*) AS plays\n  FROM plays\n  GROUP BY track_id\n)\nSELECT a.genre, ROUND(AVG(pt.plays), 2) AS plays_per_track\nFROM per_track pt\nJOIN tracks t ON t.id = pt.track_id\nJOIN artists a ON a.id = t.artist_id\nGROUP BY a.genre\nORDER BY plays_per_track DESC, a.genre;',
    }),
    query('medium', 'Fix the join', {
      prompt: "This query should show each played track's `title` and `plays`, but gives the error **no such column: per_track.id**. Fix it.",
      starter: 'WITH per_track AS (\n  SELECT track_id, COUNT(*) AS plays\n  FROM plays\n  GROUP BY track_id\n)\nSELECT title, plays\nFROM tracks\nJOIN per_track ON per_track.id = tracks.id;',
      hint: "The CTE's columns are `track_id` and `plays`: it has no `id`.",
      solution: 'WITH per_track AS (\n  SELECT track_id, COUNT(*) AS plays\n  FROM plays\n  GROUP BY track_id\n)\nSELECT title, plays\nFROM tracks\nJOIN per_track ON per_track.track_id = tracks.id;',
    }),
    query('hard', 'The most played', {
      prompt: 'Show the `title` and `plays` of the most played track (all of them, if several tie), using a CTE of plays per track twice. In title order.',
      hint: '`WHERE pt.plays = (SELECT MAX(plays) FROM per_track)`.',
      solution: 'WITH per_track AS (\n  SELECT track_id, COUNT(*) AS plays\n  FROM plays\n  GROUP BY track_id\n)\nSELECT t.title, pt.plays\nFROM per_track pt\nJOIN tracks t ON t.id = pt.track_id\nWHERE pt.plays = (SELECT MAX(plays) FROM per_track)\nORDER BY t.title;',
    }),
    query('hard', 'Genre shares', {
      prompt: "Write `WITH genre_plays(genre, plays) AS (…)` and show each `genre`, its `plays` and its share of all plays (`percent`, 1 decimal). Most plays first, then by genre.",
      hint: '`ROUND(100.0 * plays / (SELECT SUM(plays) FROM genre_plays), 1) AS percent`.',
      solution: 'WITH genre_plays(genre, plays) AS (\n  SELECT a.genre, COUNT(*)\n  FROM plays p\n  JOIN tracks t ON t.id = p.track_id\n  JOIN artists a ON a.id = t.artist_id\n  GROUP BY a.genre\n)\nSELECT genre, plays, ROUND(100.0 * plays / (SELECT SUM(plays) FROM genre_plays), 1) AS percent\nFROM genre_plays\nORDER BY plays DESC, genre;',
    }),
    query('expert', 'Gone quiet', {
      prompt: "Using a CTE of each listener's last play date, show the `name`, `last_played` and whole days since then on 2026-10-24 (`days`) of the listeners who haven't played for more than 10 days. Longest first.",
      hint: "`CAST(julianday('2026-10-24') - julianday(last_played) AS INTEGER) AS days`, and repeat the calculation in WHERE.",
      solution: "WITH last AS (\n  SELECT listener_id, MAX(played_on) AS last_played\n  FROM plays\n  GROUP BY listener_id\n)\nSELECT l.name, last.last_played,\n       CAST(julianday('2026-10-24') - julianday(last.last_played) AS INTEGER) AS days\nFROM last\nJOIN listeners l ON l.id = last.listener_id\nWHERE julianday('2026-10-24') - julianday(last.last_played) > 10\nORDER BY days DESC;",
    }),
    query('expert', 'Free versus premium', {
      prompt: 'For each `plan`, show the number of listeners (`listeners`), their total plays (`plays`) and plays per listener (`per_listener`, 2 decimals), counting listeners with no plays as 0. In plan order.',
      hint: 'A CTE with one row per listener, `COUNT(p.id)` after a LEFT JOIN to plays, then group the CTE by plan.',
      solution: 'WITH per_listener AS (\n  SELECT l.id, l.plan, COUNT(p.id) AS plays\n  FROM listeners l\n  LEFT JOIN plays p ON p.listener_id = l.id\n  GROUP BY l.id, l.plan\n)\nSELECT plan, COUNT(*) AS listeners, SUM(plays) AS plays, ROUND(AVG(plays), 2) AS per_listener\nFROM per_listener\nGROUP BY plan\nORDER BY plan;',
    }),
  ],
  questions: [
    mc('What does `WITH name AS (…)` do?', ['Names a subquery so the main query can use it like a table', 'Creates a new table for good', 'Renames a column', 'Sorts the result'], 0,
      'The named subquery is a common table expression (CTE).'),
    mc('What is a big advantage of a CTE over a subquery in FROM?', ['It needs no SELECT', 'It is always faster', 'It can be used several times but written once', 'It changes the data'], 2,
      'Write it once at the top, use it wherever needed.'),
    mc('Does a CTE stay in the database after the query?', ['Only if named', 'Yes', 'Until you close the app', 'No, it only exists while its query runs'], 3,
      'CREATE TABLE makes lasting tables; WITH does not.'),
    mc('How can you look at a CTE\'s rows?', ['Put `SELECT * FROM name;` after the WITH', 'You can\'t', 'With ORDER BY', 'In the Tables panel'], 0,
      'A quick way to check each step.'),
    qShort('Which keyword starts a query with a common table expression?', 'WITH',
      '`WITH name AS (…) SELECT …`.'),
    mc('What does `WITH genre_plays(genre, plays) AS (…)` do with `(genre, plays)`?', ['Nothing', 'Names the CTE\'s columns', 'Filters the rows', 'Sorts by them'], 1,
      'The names apply to the CTE\'s columns in order.'),
    mc('In which order does a query with WITH read?', ['Inside out', 'In any order', 'Bottom to top', 'Top to bottom: the steps first, then the answer'], 3,
      'That is what makes long queries easier to follow.'),
    mc('Where does the main SELECT go?', ['After the closing bracket of the CTE', 'In a separate query', 'Inside the brackets', 'Before WITH'], 0,
      '`WITH x AS (…) SELECT … FROM x`.'),
    mc("Why does `per_track.id` fail when the CTE selects `track_id, COUNT(*) AS plays`?", ['CTEs have no columns', 'Joins can\'t use CTEs', 'It needs an alias', 'The CTE only has the columns its SELECT gives: track_id and plays'], 3,
      'Use the names the CTE actually has.'),
    mc('Can the main query use a CTE in a subquery too?', ['Only once', 'Yes, anywhere a table can go', 'No', 'Only in FROM'], 1,
      'For example `(SELECT AVG(plays) FROM per_listener)`.'),
  ],
})
