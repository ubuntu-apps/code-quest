// Subqueries and sets: Correlated subqueries.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { SUBQUERIES_DB } from '../subqueries-db.mjs'

export default makeTopic({
  id: 'correlated_subqueries',
  title: 'Correlated subqueries',
  database: SUBQUERIES_DB,
  paragraphs: [
    'The subqueries so far were complete on their own: you could run them alone. A **correlated** subquery uses a column of the outer query\'s current row, so it gives a different answer for each row.',
    "Which tracks are longer than their own artist's average?",
    '```\nSELECT title, duration_s\nFROM tracks t\nWHERE duration_s > (\n  SELECT AVG(duration_s)\n  FROM tracks\n  WHERE artist_id = t.artist_id\n);\n```',
    "For each track `t`, the subquery averages the tracks with the same `artist_id` as `t`. The alias is what makes this work: `t.artist_id` means the outer row's artist, while `artist_id` alone means the inner table's column.",
    'Correlated subqueries are handy in the `SELECT` list too. This counts each listener\'s plays, and gives 0 to listeners with none, without a `LEFT JOIN`:',
    '```\nSELECT name,\n       (SELECT COUNT(*) FROM plays p WHERE p.listener_id = l.id) AS plays\nFROM listeners l;\n```',
    'They also avoid a problem with joins. Joining an artist to both their plays and their followers multiplies the rows (every play times every follower), so the counts come out too big. Two separate correlated subqueries count each thing on its own.',
    "Because a correlated subquery runs once per outer row, it can be slow on big tables. On tables this size, it doesn't matter.",
  ],
  sandboxCode: 'SELECT title, duration_s\nFROM tracks t\nWHERE duration_s > (\n  SELECT AVG(duration_s)\n  FROM tracks\n  WHERE artist_id = t.artist_id\n);',
  sandboxSnippets: [
    snippet("Longer than the artist's average", 'SELECT title, duration_s\nFROM tracks t\nWHERE duration_s > (\n  SELECT AVG(duration_s)\n  FROM tracks\n  WHERE artist_id = t.artist_id\n);'),
    snippet('Plays per listener', 'SELECT name,\n       (SELECT COUNT(*) FROM plays p WHERE p.listener_id = l.id) AS plays\nFROM listeners l;'),
    snippet('Two counts side by side', 'SELECT name,\n  (SELECT COUNT(*) FROM tracks t JOIN plays p ON p.track_id = t.id WHERE t.artist_id = a.id) AS plays,\n  (SELECT COUNT(*) FROM follows f WHERE f.artist_id = a.id) AS followers\nFROM artists a;'),
  ],
  readMore: { label: 'Wikipedia: correlated subquery', url: 'https://en.wikipedia.org/wiki/Correlated_subquery', source: 'Wikipedia' },
  challenges: [
    query('easy', 'Plays per listener', {
      prompt: "Show every listener's `name` and their number of plays (`plays`), using a correlated subquery in the SELECT list. Listeners with no plays show 0.",
      hint: '`(SELECT COUNT(*) FROM plays p WHERE p.listener_id = l.id) AS plays`, with `FROM listeners l`.',
      solution: 'SELECT name,\n       (SELECT COUNT(*) FROM plays p WHERE p.listener_id = l.id) AS plays\nFROM listeners l;',
    }),
    query('easy', "The artist's name", {
      prompt: "Show every track's `title` and its artist's name (`artist`), using a correlated subquery instead of a join.",
      hint: '`(SELECT name FROM artists a WHERE a.id = t.artist_id) AS artist`.',
      solution: 'SELECT title,\n       (SELECT name FROM artists a WHERE a.id = t.artist_id) AS artist\nFROM tracks t;',
    }),
    query('medium', "Above the artist's average", {
      prompt: "Show the `title` and `duration_s` of every track longer than the average of its own artist's tracks.",
      hint: 'Compare with `(SELECT AVG(duration_s) FROM tracks WHERE artist_id = t.artist_id)`.',
      solution: 'SELECT title, duration_s\nFROM tracks t\nWHERE duration_s > (\n  SELECT AVG(duration_s)\n  FROM tracks\n  WHERE artist_id = t.artist_id\n);',
    }),
    query('medium', 'Last played', {
      prompt: "Show every listener's `name` and the date of their latest play (`last_played`), NULL if they never played.",
      hint: '`(SELECT MAX(played_on) FROM plays p WHERE p.listener_id = l.id) AS last_played`.',
      solution: 'SELECT name,\n       (SELECT MAX(played_on) FROM plays p WHERE p.listener_id = l.id) AS last_played\nFROM listeners l;',
    }),
    query('medium', 'Tracks per artist', {
      prompt: "Show every artist's `name` and number of tracks (`tracks`), using a correlated subquery. Most first, then by name.",
      hint: '`(SELECT COUNT(*) FROM tracks t WHERE t.artist_id = a.id) AS tracks … ORDER BY tracks DESC, name`.',
      solution: 'SELECT name,\n       (SELECT COUNT(*) FROM tracks t WHERE t.artist_id = a.id) AS tracks\nFROM artists a\nORDER BY tracks DESC, name;',
    }),
    query('hard', 'First play, or never', {
      prompt: "Show every track's `title` and the date it was first played (`first_play`), or the text `never`.",
      hint: "`COALESCE((SELECT MIN(played_on) FROM plays p WHERE p.track_id = t.id), 'never') AS first_play`.",
      solution: "SELECT title,\n       COALESCE((SELECT MIN(played_on) FROM plays p WHERE p.track_id = t.id), 'never') AS first_play\nFROM tracks t;",
    }),
    query('hard', 'Heavy listeners', {
      prompt: 'Show the `name` of every listener with more than 5 plays, using a correlated subquery in `WHERE`.',
      hint: '`WHERE (SELECT COUNT(*) FROM plays p WHERE p.listener_id = l.id) > 5`.',
      solution: 'SELECT name\nFROM listeners l\nWHERE (SELECT COUNT(*) FROM plays p WHERE p.listener_id = l.id) > 5;',
    }),
    query('expert', "Each artist's longest", {
      prompt: "Show the `title` and `duration_s` of each artist's longest track (if two tie, show both). In title order.",
      hint: '`WHERE duration_s = (SELECT MAX(duration_s) FROM tracks WHERE artist_id = t.artist_id) ORDER BY title`.',
      solution: 'SELECT title, duration_s\nFROM tracks t\nWHERE duration_s = (\n  SELECT MAX(duration_s)\n  FROM tracks\n  WHERE artist_id = t.artist_id\n)\nORDER BY title;',
    }),
    query('expert', 'Plays and followers', {
      prompt: "Show every artist's `name`, the plays of their tracks (`plays`) and their number of followers (`followers`). Use two correlated subqueries so the counts don't multiply. Most plays first, then by name.",
      hint: 'Plays: `(SELECT COUNT(*) FROM tracks t JOIN plays p ON p.track_id = t.id WHERE t.artist_id = a.id)`. Followers: `(SELECT COUNT(*) FROM follows f WHERE f.artist_id = a.id)`.',
      solution: 'SELECT name,\n  (SELECT COUNT(*) FROM tracks t JOIN plays p ON p.track_id = t.id WHERE t.artist_id = a.id) AS plays,\n  (SELECT COUNT(*) FROM follows f WHERE f.artist_id = a.id) AS followers\nFROM artists a\nORDER BY plays DESC, name;',
    }),
  ],
  questions: [
    mc('What makes a subquery correlated?', ['It is in FROM', 'It has GROUP BY', 'It uses a column from the outer query\'s row', 'It returns many rows'], 2,
      'So its answer changes from row to row.'),
    mc('Can you run a correlated subquery on its own?', ['No, it needs the outer row\'s value', 'Only with LIMIT', 'Only in SQLite', 'Yes, always'], 0,
      'On its own, `t.artist_id` has no row to come from.'),
    mc("In `WHERE artist_id = t.artist_id`, what is `t.artist_id`?", ['A typo', 'The inner table\'s column', 'Every artist id', "The outer row's artist id"], 3,
      'The alias t belongs to the outer query.'),
    mc('How often does a correlated subquery run?', ['Twice', 'Once per group', 'Once for each outer row', 'Once'], 2,
      'That is why it can be slow on very big tables.'),
    qShort('What value does `(SELECT COUNT(*) FROM plays p WHERE p.listener_id = l.id)` give for a listener with no plays?', '0',
      'COUNT of no rows is 0.'),
    mc('What does `(SELECT MAX(played_on) …)` give for a listener with no plays?', ['0', "''", 'An error', 'NULL'], 3,
      'MAX of no rows is NULL; COALESCE can replace it.'),
    mc("An artist has 3 plays and 2 followers. If you join both plays and followers to artists, what does `COUNT(p.id)` give for them?", ["`3`", "`5`", "`6`", "`2`"], 2,
      "Each play row pairs with each follower row, so the join has 3 × 2 = 6 rows and COUNT counts 6. A correlated subquery for each count gives 3 and 2."),
    mc('Which keeps each artist\'s longest track?', ['`GROUP BY title`', '`WHERE duration_s = MAX(duration_s)`', '`ORDER BY duration_s DESC LIMIT 1`', '`WHERE duration_s = (SELECT MAX(duration_s) FROM tracks WHERE artist_id = t.artist_id)`'], 3,
      'The subquery finds the maximum for the current track\'s artist.'),
    mc('Why does the outer table need an alias here?', ['SQLite requires all tables to have one', 'To make it faster', 'To sort by it', 'So the subquery can say which table\'s column it means'], 3,
      'Both levels read tracks, so the alias tells them apart.'),
    mc('A correlated subquery in SELECT gives one value per…', ['Group', 'Query', 'Row of the outer query', 'Table'], 2,
      'It is worked out again for every outer row.'),
  ],
})
