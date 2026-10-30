// Subqueries and sets: Subqueries in FROM.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { SUBQUERIES_DB } from '../subqueries-db.mjs'

export default makeTopic({
  id: 'from_subqueries',
  title: 'Subqueries in FROM',
  database: SUBQUERIES_DB,
  paragraphs: [
    'A query\'s result is itself a table, so a subquery can go in `FROM`, and the outer query reads from it like any other table. This is how you work with totals of totals.',
    'How many plays does a listener make on average? First count each listener\'s plays, then average those counts:',
    '```\nSELECT AVG(plays) AS average\nFROM (\n  SELECT listener_id, COUNT(*) AS plays\n  FROM plays\n  GROUP BY listener_id\n) AS per_listener;\n```',
    "`AVG(COUNT(*))` doesn't work: aggregates can't be nested. The subquery makes one row per listener with their count, and the outer query averages that column.",
    'Give the subquery a name with `AS`. SQLite lets you leave it out, but most databases require it, and you need it to refer to the subquery\'s columns. Inside, name every calculated column, because those names are the columns of the new table.',
    'A subquery in `FROM` can be joined like a table:',
    '```\nSELECT l.name, pl.plays\nFROM listeners l\nJOIN (\n  SELECT listener_id, COUNT(*) AS plays\n  FROM plays\n  GROUP BY listener_id\n) AS pl ON pl.listener_id = l.id\nORDER BY pl.plays DESC, l.name;\n```',
    'When the same subquery is needed twice, the query gets long and repetitive. The `WITH` stages later in this quest fix that.',
  ],
  sandboxCode: 'SELECT AVG(plays) AS average\nFROM (\n  SELECT listener_id, COUNT(*) AS plays\n  FROM plays\n  GROUP BY listener_id\n) AS per_listener;',
  sandboxSnippets: [
    snippet('The inner table alone', 'SELECT listener_id, COUNT(*) AS plays\nFROM plays\nGROUP BY listener_id;'),
    snippet('Average of counts', 'SELECT AVG(plays) AS average\nFROM (\n  SELECT listener_id, COUNT(*) AS plays\n  FROM plays\n  GROUP BY listener_id\n) AS per_listener;'),
    snippet('Joined to names', 'SELECT l.name, pl.plays\nFROM listeners l\nJOIN (\n  SELECT listener_id, COUNT(*) AS plays\n  FROM plays\n  GROUP BY listener_id\n) AS pl ON pl.listener_id = l.id\nORDER BY pl.plays DESC, l.name;'),
  ],
  readMore: { label: 'SQLite: subqueries in FROM', url: 'https://www.sqlite.org/lang_select.html#fromclause', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Average plays', {
      prompt: 'Show the average number of plays per listener, counting only listeners who played, rounded to 2 decimals, called `average`.',
      hint: 'Average the `plays` column of `(SELECT listener_id, COUNT(*) AS plays FROM plays GROUP BY listener_id)`.',
      solution: 'SELECT ROUND(AVG(plays), 2) AS average\nFROM (\n  SELECT listener_id, COUNT(*) AS plays\n  FROM plays\n  GROUP BY listener_id\n) AS per_listener;',
    }),
    query('easy', 'The most plays', {
      prompt: 'Show the highest number of plays by a single listener, called `most`.',
      hint: '`SELECT MAX(plays) AS most FROM (…per listener counts…) AS per_listener`.',
      solution: 'SELECT MAX(plays) AS most\nFROM (\n  SELECT listener_id, COUNT(*) AS plays\n  FROM plays\n  GROUP BY listener_id\n) AS per_listener;',
    }),
    query('easy', 'Popular tracks', {
      prompt: 'Count the tracks that were played 3 or more times, called `popular`.',
      hint: '`SELECT COUNT(*) AS popular FROM (SELECT track_id FROM plays GROUP BY track_id HAVING COUNT(*) >= 3) AS p`.',
      solution: 'SELECT COUNT(*) AS popular\nFROM (\n  SELECT track_id\n  FROM plays\n  GROUP BY track_id\n  HAVING COUNT(*) >= 3\n) AS popular_tracks;',
    }),
    query('medium', 'Names and counts', {
      prompt: "Join `listeners` to a subquery of play counts: show each listener's `name` and `plays`, most first, then by name. (Listeners with no plays are left out.)",
      hint: '`FROM listeners l JOIN (SELECT listener_id, COUNT(*) AS plays FROM plays GROUP BY listener_id) AS pl ON pl.listener_id = l.id`.',
      solution: 'SELECT l.name, pl.plays\nFROM listeners l\nJOIN (\n  SELECT listener_id, COUNT(*) AS plays\n  FROM plays\n  GROUP BY listener_id\n) AS pl ON pl.listener_id = l.id\nORDER BY pl.plays DESC, l.name;',
    }),
    query('medium', 'Above the average listener', {
      prompt: "Show the `name` and `plays` of the listeners with more plays than the average listener who played. Most first, then by name.",
      hint: 'Join names to the per-listener counts, and compare `pl.plays > (SELECT AVG(plays) FROM (…the same counts…))`.',
      solution: 'SELECT l.name, pl.plays\nFROM listeners l\nJOIN (\n  SELECT listener_id, COUNT(*) AS plays\n  FROM plays\n  GROUP BY listener_id\n) AS pl ON pl.listener_id = l.id\nWHERE pl.plays > (\n  SELECT AVG(plays)\n  FROM (SELECT listener_id, COUNT(*) AS plays FROM plays GROUP BY listener_id) AS x\n)\nORDER BY pl.plays DESC, l.name;',
    }),
    query('medium', 'Tracks per artist, by genre', {
      prompt: 'For each `genre`, show the number of artists (`artists`) and the average number of tracks per artist, rounded to 2 decimals (`tracks_per_artist`). In genre order.',
      hint: 'Count tracks per artist in a subquery, join it to artists, then group by genre.',
      solution: 'SELECT a.genre, COUNT(*) AS artists, ROUND(AVG(c.tracks), 2) AS tracks_per_artist\nFROM artists a\nJOIN (\n  SELECT artist_id, COUNT(*) AS tracks\n  FROM tracks\n  GROUP BY artist_id\n) AS c ON c.artist_id = a.id\nGROUP BY a.genre\nORDER BY a.genre;',
    }),
    query('hard', 'Listener bands', {
      prompt: 'Group the listeners who played by their number of plays: a `band` of `1-3`, `4-6` or `7+`, and the number of listeners in each (`listeners`). In band order.',
      hint: "From the per-listener counts, `CASE WHEN plays <= 3 THEN '1-3' WHEN plays <= 6 THEN '4-6' ELSE '7+' END AS band`, then group by band.",
      solution: "SELECT CASE WHEN plays <= 3 THEN '1-3' WHEN plays <= 6 THEN '4-6' ELSE '7+' END AS band,\n       COUNT(*) AS listeners\nFROM (\n  SELECT listener_id, COUNT(*) AS plays\n  FROM plays\n  GROUP BY listener_id\n) AS per_listener\nGROUP BY band\nORDER BY band;",
    }),
    query('hard', 'Plays per track, by genre', {
      prompt: 'For each `genre`, show the average number of plays of its played tracks, rounded to 2 decimals (`plays_per_track`). Highest first, then by genre.',
      hint: 'Count plays per track in a subquery, join it to tracks and artists, then group by genre.',
      solution: 'SELECT a.genre, ROUND(AVG(pt.plays), 2) AS plays_per_track\nFROM (\n  SELECT track_id, COUNT(*) AS plays\n  FROM plays\n  GROUP BY track_id\n) AS pt\nJOIN tracks t ON t.id = pt.track_id\nJOIN artists a ON a.id = t.artist_id\nGROUP BY a.genre\nORDER BY plays_per_track DESC, a.genre;',
    }),
    query('expert', 'One-artist listeners', {
      prompt: 'Show the `name` of every listener whose plays were all of a single artist.',
      hint: 'Make a subquery of distinct (listener_id, artist_id) pairs from plays joined to tracks, group it by listener and keep `HAVING COUNT(*) = 1`, then get the names.',
      solution: 'SELECT name\nFROM listeners\nWHERE id IN (\n  SELECT listener_id\n  FROM (\n    SELECT DISTINCT p.listener_id, t.artist_id\n    FROM plays p\n    JOIN tracks t ON t.id = p.track_id\n  ) AS pairs\n  GROUP BY listener_id\n  HAVING COUNT(*) = 1\n);',
    }),
    query('expert', 'Versus the average', {
      prompt: "For each listener who played, show `name`, `plays` and how far they are from the average listener (`vs_average`, 2 decimals). Highest first, then by name.",
      hint: '`ROUND(pl.plays - (SELECT AVG(plays) FROM (…the counts again…) AS x), 2) AS vs_average`. Notice how the counts are written twice: the next stages fix that.',
      solution: 'SELECT l.name, pl.plays,\n       ROUND(pl.plays - (\n         SELECT AVG(plays)\n         FROM (SELECT listener_id, COUNT(*) AS plays FROM plays GROUP BY listener_id) AS x\n       ), 2) AS vs_average\nFROM listeners l\nJOIN (\n  SELECT listener_id, COUNT(*) AS plays\n  FROM plays\n  GROUP BY listener_id\n) AS pl ON pl.listener_id = l.id\nORDER BY pl.plays DESC, l.name;',
    }),
  ],
  questions: [
    mc('What does a subquery in FROM act like?', ['A condition', 'A sort order', 'A table the outer query reads from', 'A single value'], 2,
      'Its result rows and columns become a temporary table.'),
    mc('Why can\'t you write `AVG(COUNT(*))`?', ['AVG only works on text', 'Aggregates can\'t be nested', 'COUNT needs a column', 'It is too slow'], 1,
      'Count per group in a subquery, then average in the outer query.'),
    mc('Why name a subquery in FROM with AS?', ['SQLite needs it for speed', 'Most databases require it, and you use the name to refer to its columns', 'To sort it', 'It changes the result'], 1,
      'SQLite allows leaving it out, but a name is good practice.'),
    mc("What does `SELECT AVG(n) FROM (SELECT COUNT(*) FROM plays GROUP BY listener_id);` give?", ["The average of the counts", "An error: no such column: n", "`NULL`", "`0`"], 1,
      "The subquery's column is headed `COUNT(*)`, not `n`, so the outer query can't find `n`. Writing `COUNT(*) AS n` inside fixes it."),
    qShort('Which keyword gives the subquery in FROM its name?', 'AS',
      '`(…) AS per_listener`.'),
    mc('Can a subquery in FROM be joined to a table?', ['No', 'Only with LEFT JOIN', 'Only to itself', 'Yes, like any table'], 3,
      'Join it with ON, as usual.'),
    mc('Which gives the average number of plays per listener?', ['`SELECT AVG(listener_id) FROM plays`', '`SELECT AVG(COUNT(*)) FROM plays`', '`SELECT AVG(plays) FROM (SELECT listener_id, COUNT(*) AS plays FROM plays GROUP BY listener_id)`', '`SELECT COUNT(*) / AVG(listener_id) FROM plays`'], 2,
      'Count per listener first, then average.'),
    mc('What is the downside of using the same subquery twice?', ['It gives wrong results', 'It is not allowed', 'The query gets long and repetitive', 'It changes the data'], 2,
      'WITH lets you write it once and use it twice.'),
    mc('Listeners with no plays: are they in `SELECT … FROM plays GROUP BY listener_id`?', ['Yes, with NULL', 'Only with ORDER BY', 'No, they have no rows in plays', 'Yes, with 0'], 2,
      'Grouping only makes groups for values that exist.'),
    mc('In `FROM (…) AS pl`, how do you refer to its `plays` column?', ['You can\'t', '`pl.plays`', '`plays.pl`', '`(…).plays`'], 1,
      'Use the name you gave it, like a table alias.'),
  ],
})
