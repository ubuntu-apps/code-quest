// Subqueries and sets: EXISTS and NOT EXISTS.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { SUBQUERIES_DB } from '../subqueries-db.mjs'

export default makeTopic({
  id: 'exists_subqueries',
  title: 'EXISTS and NOT EXISTS',
  database: SUBQUERIES_DB,
  paragraphs: [
    '`EXISTS (subquery)` is true when the subquery returns **at least one row**, whatever is in it. It is almost always correlated: it asks "is there a matching row for this one?"',
    '```\nSELECT name\nFROM listeners l\nWHERE EXISTS (SELECT 1 FROM plays p WHERE p.listener_id = l.id);\n```',
    'For each listener, SQLite looks for a play by them. The `SELECT 1` is a habit: `EXISTS` only cares whether a row exists, not about its columns, so any value will do.',
    '`NOT EXISTS` is the opposite, and the clearest way to find things with no match:',
    '```\nSELECT name\nFROM listeners l\nWHERE NOT EXISTS (SELECT 1 FROM plays p WHERE p.listener_id = l.id);\n```',
    'Unlike `NOT IN`, `NOT EXISTS` has no trap with `NULL` values, because it only asks whether matching rows exist.',
    'The subquery can be as detailed as you need, with joins and several conditions. Listeners who follow an artist but have never played any of their tracks:',
    '```\nSELECT l.name AS listener, a.name AS artist\nFROM follows f\nJOIN listeners l ON l.id = f.listener_id\nJOIN artists a ON a.id = f.artist_id\nWHERE NOT EXISTS (\n  SELECT 1\n  FROM plays p\n  JOIN tracks t ON t.id = p.track_id\n  WHERE p.listener_id = f.listener_id\n    AND t.artist_id = f.artist_id\n);\n```',
  ],
  sandboxCode: 'SELECT name\nFROM listeners l\nWHERE NOT EXISTS (SELECT 1 FROM plays p WHERE p.listener_id = l.id);',
  sandboxSnippets: [
    snippet('Has played', 'SELECT name\nFROM listeners l\nWHERE EXISTS (SELECT 1 FROM plays p WHERE p.listener_id = l.id);'),
    snippet('Never played', 'SELECT name\nFROM listeners l\nWHERE NOT EXISTS (SELECT 1 FROM plays p WHERE p.listener_id = l.id);'),
    snippet('Followed, never played', 'SELECT l.name AS listener, a.name AS artist\nFROM follows f\nJOIN listeners l ON l.id = f.listener_id\nJOIN artists a ON a.id = f.artist_id\nWHERE NOT EXISTS (\n  SELECT 1\n  FROM plays p\n  JOIN tracks t ON t.id = p.track_id\n  WHERE p.listener_id = f.listener_id\n    AND t.artist_id = f.artist_id\n);'),
  ],
  readMore: { label: 'SQLite: the EXISTS operator', url: 'https://www.sqlite.org/lang_expr.html#the_exists_operator', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Has played', {
      prompt: 'Show the `name` of every listener with at least one play, using `EXISTS`.',
      hint: '`WHERE EXISTS (SELECT 1 FROM plays p WHERE p.listener_id = l.id)`.',
      solution: 'SELECT name\nFROM listeners l\nWHERE EXISTS (SELECT 1 FROM plays p WHERE p.listener_id = l.id);',
    }),
    query('easy', 'Never played', {
      prompt: 'Show the `name` of every listener who has never played anything, using `NOT EXISTS`.',
      hint: '`WHERE NOT EXISTS (SELECT 1 FROM plays p WHERE p.listener_id = l.id)`.',
      solution: 'SELECT name\nFROM listeners l\nWHERE NOT EXISTS (SELECT 1 FROM plays p WHERE p.listener_id = l.id);',
    }),
    query('medium', 'Premium followers', {
      prompt: 'Show the `name` of every artist followed by at least one premium listener.',
      hint: "`WHERE EXISTS (SELECT 1 FROM follows f JOIN listeners l ON l.id = f.listener_id WHERE f.artist_id = a.id AND l.plan = 'premium')`.",
      solution: "SELECT name\nFROM artists a\nWHERE EXISTS (\n  SELECT 1\n  FROM follows f\n  JOIN listeners l ON l.id = f.listener_id\n  WHERE f.artist_id = a.id AND l.plan = 'premium'\n);",
    }),
    query('medium', 'Silent artists', {
      prompt: 'Show the `name` of every artist none of whose tracks has ever been played.',
      hint: '`WHERE NOT EXISTS (SELECT 1 FROM tracks t JOIN plays p ON p.track_id = t.id WHERE t.artist_id = a.id)`.',
      solution: 'SELECT name\nFROM artists a\nWHERE NOT EXISTS (\n  SELECT 1\n  FROM tracks t\n  JOIN plays p ON p.track_id = t.id\n  WHERE t.artist_id = a.id\n);',
    }),
    query('medium', 'Up to date', {
      prompt: 'Show the `name` of every listener who played a track released in 2026.',
      hint: "`EXISTS (SELECT 1 FROM plays p JOIN tracks t ON t.id = p.track_id WHERE p.listener_id = l.id AND t.released >= '2026-01-01')`.",
      solution: "SELECT name\nFROM listeners l\nWHERE EXISTS (\n  SELECT 1\n  FROM plays p\n  JOIN tracks t ON t.id = p.track_id\n  WHERE p.listener_id = l.id AND t.released >= '2026-01-01'\n);",
    }),
    query('hard', 'Followed, never played', {
      prompt: "Show each listener's name (`listener`) and each artist they follow but have never played (`artist`). Sort by listener, then artist.",
      hint: 'Start from follows joined to listeners and artists, then `WHERE NOT EXISTS` a play by that listener of a track by that artist.',
      solution: 'SELECT l.name AS listener, a.name AS artist\nFROM follows f\nJOIN listeners l ON l.id = f.listener_id\nJOIN artists a ON a.id = f.artist_id\nWHERE NOT EXISTS (\n  SELECT 1\n  FROM plays p\n  JOIN tracks t ON t.id = p.track_id\n  WHERE p.listener_id = f.listener_id\n    AND t.artist_id = f.artist_id\n)\nORDER BY listener, artist;',
    }),
    query('hard', 'No jazz for premium', {
      prompt: 'Show the `name` of every premium listener who has never played a `jazz` track.',
      hint: "`WHERE plan = 'premium' AND NOT EXISTS (… plays joined to tracks and artists, for this listener, where the genre is jazz)`.",
      solution: "SELECT name\nFROM listeners l\nWHERE plan = 'premium'\n  AND NOT EXISTS (\n    SELECT 1\n    FROM plays p\n    JOIN tracks t ON t.id = p.track_id\n    JOIN artists a ON a.id = t.artist_id\n    WHERE p.listener_id = l.id AND a.genre = 'jazz'\n  );",
    }),
    query('expert', 'Every track played', {
      prompt: 'Show the `name` of every artist all of whose tracks have been played at least once.',
      hint: 'Turn it around: keep the artists for which there is NOT a track that has NOT been played. Two NOT EXISTS, one inside the other.',
      solution: 'SELECT name\nFROM artists a\nWHERE NOT EXISTS (\n  SELECT 1\n  FROM tracks t\n  WHERE t.artist_id = a.id\n    AND NOT EXISTS (SELECT 1 FROM plays p WHERE p.track_id = t.id)\n);',
    }),
    query('expert', 'Beyond their follows', {
      prompt: "Show the `name` of every listener who played at least one artist they don't follow.",
      hint: 'EXISTS a play (joined to tracks) by this listener for which NOT EXISTS a follow of that track\'s artist by this listener.',
      solution: 'SELECT name\nFROM listeners l\nWHERE EXISTS (\n  SELECT 1\n  FROM plays p\n  JOIN tracks t ON t.id = p.track_id\n  WHERE p.listener_id = l.id\n    AND NOT EXISTS (\n      SELECT 1 FROM follows f\n      WHERE f.listener_id = l.id AND f.artist_id = t.artist_id\n    )\n);',
    }),
  ],
  questions: [
    mc('When is `EXISTS (subquery)` true?', ['When its value is not 0', 'When it has no NULLs', 'When the subquery returns at least one row', 'When it returns exactly one row'], 2,
      'It only checks whether any row comes back.'),
    mc('Why write `SELECT 1` inside EXISTS?', ['It is required', 'EXISTS ignores the columns, so any value will do', 'It makes the result 1', 'It limits to one row'], 1,
      'It is a common habit that shows the columns don\'t matter.'),
    mc('Which finds listeners with no plays?', ['`NOT EXISTS (SELECT 1 FROM plays p WHERE p.listener_id = l.id)`', '`NOT IN plays`', '`EXISTS (SELECT 1 FROM plays)`', '`WHERE plays IS NULL`'], 0,
      'For each listener, check that no play of theirs exists.'),
    mc('Why is NOT EXISTS safer than NOT IN?', ['It sorts the rows', 'It works without aliases', 'It is not affected by NULL values in the subquery', 'It is shorter'], 2,
      'NOT IN with a NULL in the list keeps nothing; NOT EXISTS only asks if rows exist.'),
    qShort('Which keyword goes before EXISTS to find rows with no match?', 'NOT',
      '`NOT EXISTS (…)`.'),
    mc('`EXISTS (SELECT 1 FROM plays)` with no WHERE is…', ['Correlated', 'True for every row if plays has any rows', 'False', 'An error'], 1,
      'Without a link to the outer row, it asks the same thing every time.'),
    mc('"Artists all of whose tracks were played" is written as…', ['EXISTS a played track', 'NOT EXISTS an unplayed track', 'COUNT(*) = 1', 'IN plays'], 1,
      '"All are played" is the same as "none is unplayed".'),
    mc('Can the subquery inside EXISTS use joins and several conditions?', ['Only joins', 'No', 'Only one condition', 'Yes'], 3,
      'It is a normal query; EXISTS only checks whether it returns rows.'),
    mc('Does EXISTS repeat outer rows when several inner rows match?', ['No, each outer row is kept once at most', 'Yes, once per match', 'Only with LEFT JOIN', 'Only twice'], 0,
      'It is a yes/no test for each outer row.'),
    mc('What usually links the EXISTS subquery to the outer row?', ['UNION', 'A condition using the outer alias, like `p.listener_id = l.id`', 'ORDER BY', 'LIMIT'], 1,
      'That is what makes it correlated.'),
  ],
})
