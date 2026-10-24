// Subqueries and sets: INTERSECT and EXCEPT.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { SUBQUERIES_DB } from '../subqueries-db.mjs'

export default makeTopic({
  id: 'intersect_except',
  title: 'INTERSECT and EXCEPT',
  database: SUBQUERIES_DB,
  paragraphs: [
    'Two more set operators work like `UNION`, with two queries that have the same number of columns:',
    '`INTERSECT` keeps the rows that appear in **both** results. `EXCEPT` keeps the rows of the first result that do **not** appear in the second. Like `UNION`, both remove duplicates.',
    'Countries with listeners but no artists:',
    '```\nSELECT country FROM listeners\nEXCEPT\nSELECT country FROM artists;\n```',
    "They compare whole rows, which makes them neat for pairs. Each (listener, artist) pair that is followed but has never been played:",
    '```\nSELECT listener_id, artist_id FROM follows\nEXCEPT\nSELECT p.listener_id, t.artist_id\nFROM plays p\nJOIN tracks t ON t.id = p.track_id;\n```',
    'With `EXCEPT`, the order matters: `A EXCEPT B` and `B EXCEPT A` are different questions. With `INTERSECT` it doesn\'t.',
    'The result has only the columns you compared. To show names, put the set query in a subquery (in `FROM` or after `IN`) and join or filter from there. As with `UNION`, `ORDER BY` goes once, after the last part.',
  ],
  sandboxCode: 'SELECT listener_id, artist_id FROM follows\nEXCEPT\nSELECT p.listener_id, t.artist_id\nFROM plays p\nJOIN tracks t ON t.id = p.track_id;',
  sandboxSnippets: [
    snippet('In both', 'SELECT country FROM artists\nINTERSECT\nSELECT country FROM listeners;'),
    snippet('In one only', 'SELECT country FROM listeners\nEXCEPT\nSELECT country FROM artists;'),
    snippet('Followed, never played', 'SELECT listener_id, artist_id FROM follows\nEXCEPT\nSELECT p.listener_id, t.artist_id\nFROM plays p\nJOIN tracks t ON t.id = p.track_id;'),
  ],
  readMore: { label: 'SQLite: compound SELECT', url: 'https://www.sqlite.org/lang_select.html#compound_select_statements', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Shared countries', {
      prompt: 'Show each `country` that has both an artist and a listener.',
      hint: '`SELECT country FROM artists INTERSECT SELECT country FROM listeners;`',
      solution: 'SELECT country FROM artists\nINTERSECT\nSELECT country FROM listeners;',
    }),
    query('easy', 'Listener-only countries', {
      prompt: 'Show each `country` that has listeners but no artists.',
      hint: '`SELECT country FROM listeners EXCEPT SELECT country FROM artists;`',
      solution: 'SELECT country FROM listeners\nEXCEPT\nSELECT country FROM artists;',
    }),
    query('easy', 'Unplayed track ids', {
      prompt: 'Show the `id` of every track that has never been played, using `EXCEPT`.',
      hint: '`SELECT id FROM tracks EXCEPT SELECT track_id FROM plays;`',
      solution: 'SELECT id FROM tracks\nEXCEPT\nSELECT track_id FROM plays;',
    }),
    query('medium', 'Follow and play', {
      prompt: 'Show the `listener_id` of every listener who both follows someone and has played something.',
      hint: '`SELECT listener_id FROM follows INTERSECT SELECT listener_id FROM plays;`',
      solution: 'SELECT listener_id FROM follows\nINTERSECT\nSELECT listener_id FROM plays;',
    }),
    query('medium', 'Followed, not played', {
      prompt: 'Show each (`listener_id`, `artist_id`) pair that is in `follows` but has never been played (no play by that listener of a track by that artist).',
      hint: 'The follows pairs `EXCEPT` the pairs from plays joined to tracks.',
      solution: 'SELECT listener_id, artist_id FROM follows\nEXCEPT\nSELECT p.listener_id, t.artist_id\nFROM plays p\nJOIN tracks t ON t.id = p.track_id;',
    }),
    query('medium', 'Played, not followed', {
      prompt: 'Show each (`listener_id`, `artist_id`) pair that has been played but is not in `follows`.',
      hint: 'The same two queries the other way round.',
      solution: 'SELECT p.listener_id, t.artist_id\nFROM plays p\nJOIN tracks t ON t.id = p.track_id\nEXCEPT\nSELECT listener_id, artist_id FROM follows;',
    }),
    query('hard', 'With names', {
      prompt: "Show the followed-but-never-played pairs with names: the listener's `name` and the artist's name as `artist`. Sort by name, then artist.",
      hint: 'Put the EXCEPT in FROM, `(…) AS x`, then join listeners on `x.listener_id` and artists on `x.artist_id`.',
      solution: 'SELECT l.name, a.name AS artist\nFROM (\n  SELECT listener_id, artist_id FROM follows\n  EXCEPT\n  SELECT p.listener_id, t.artist_id\n  FROM plays p\n  JOIN tracks t ON t.id = p.track_id\n) AS x\nJOIN listeners l ON l.id = x.listener_id\nJOIN artists a ON a.id = x.artist_id\nORDER BY l.name, artist;',
    }),
    query('hard', 'Fix the sort', {
      prompt: 'This query should list the countries with listeners but no artists, in alphabetical order, but gives an error. Fix it.',
      starter: 'SELECT country FROM listeners\nORDER BY country\nEXCEPT\nSELECT country FROM artists;',
      hint: 'ORDER BY goes once, after the last part.',
      solution: 'SELECT country FROM listeners\nEXCEPT\nSELECT country FROM artists\nORDER BY country;',
    }),
    query('expert', 'Shared genres', {
      prompt: 'Show each `genre` that has been played by both a free and a premium listener.',
      hint: "Two queries of genres from plays joined to listeners, tracks and artists, one with `plan = 'free'` and one with `plan = 'premium'`, and INTERSECT between them.",
      solution: "SELECT a.genre\nFROM plays p\nJOIN listeners l ON l.id = p.listener_id\nJOIN tracks t ON t.id = p.track_id\nJOIN artists a ON a.id = t.artist_id\nWHERE l.plan = 'free'\nINTERSECT\nSELECT a.genre\nFROM plays p\nJOIN listeners l ON l.id = p.listener_id\nJOIN tracks t ON t.id = p.track_id\nJOIN artists a ON a.id = t.artist_id\nWHERE l.plan = 'premium';",
    }),
    query('expert', 'Folk and jazz', {
      prompt: 'Show the `name` of every listener who has played both a `folk` and a `jazz` track.',
      hint: "`WHERE id IN (folk listener ids INTERSECT jazz listener ids)`, each from plays joined to tracks and artists.",
      solution: "SELECT name\nFROM listeners\nWHERE id IN (\n  SELECT p.listener_id FROM plays p\n  JOIN tracks t ON t.id = p.track_id\n  JOIN artists a ON a.id = t.artist_id\n  WHERE a.genre = 'folk'\n  INTERSECT\n  SELECT p.listener_id FROM plays p\n  JOIN tracks t ON t.id = p.track_id\n  JOIN artists a ON a.id = t.artist_id\n  WHERE a.genre = 'jazz'\n);",
    }),
  ],
  questions: [
    mc('What does INTERSECT keep?', ['Rows that appear in both results', 'Rows in either result', 'Rows only in the first', 'Every row twice'], 0,
      'It is the overlap of the two results.'),
    mc('What does `A EXCEPT B` keep?', ['Rows of B that are not in A', 'Every row', 'Rows in both', 'Rows of A that are not in B'], 3,
      'It takes B away from A.'),
    mc('Does the order of the two queries matter for EXCEPT?', ['No', 'Only for numbers', 'Yes: A EXCEPT B is not B EXCEPT A', 'Only with ORDER BY'], 2,
      'For INTERSECT the order does not matter.'),
    mc('Do INTERSECT and EXCEPT keep duplicate rows?', ['Only with ALL', 'No, they remove duplicates', 'Yes, always', 'Only INTERSECT'], 1,
      'Like UNION, they return each different row once.'),
    qShort('Which operator keeps the rows of the first query that are not in the second?', 'EXCEPT',
      '`A EXCEPT B`.'),
    mc('What do INTERSECT and EXCEPT compare?', ['Whole rows, column by column', 'Only the first column', 'Only the ids', 'Column names'], 0,
      'Every column must match for two rows to count as the same.'),
    mc('How do you show names for the pairs an EXCEPT returns?', ['Put the EXCEPT in a subquery and join the names to it', 'Use ORDER BY name', 'It is not possible', 'Add names to the EXCEPT'], 0,
      'Adding names inside would change what is compared; join them afterwards.'),
    mc('Which gives "listeners who played both folk and jazz"?', ['folk listeners EXCEPT jazz listeners', 'folk listeners INTERSECT jazz listeners', 'folk listeners UNION ALL jazz listeners', 'folk listeners UNION jazz listeners'], 1,
      'Both means the overlap.'),
    mc('Where does ORDER BY go with EXCEPT?', ['Before EXCEPT', 'In both parts', 'Nowhere', 'Once, after the last part'], 3,
      'Before EXCEPT, SQLite says the ORDER BY clause should come after it.'),
    mc('`SELECT id FROM tracks EXCEPT SELECT track_id FROM plays` finds…', ['Tracks played twice', 'Every track', 'Plays without tracks', 'Tracks never played'], 3,
      'Track ids minus the played ones.'),
  ],
})
