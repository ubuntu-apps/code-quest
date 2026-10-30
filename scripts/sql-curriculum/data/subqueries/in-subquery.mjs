// Subqueries and sets: IN with a subquery.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { SUBQUERIES_DB } from '../subqueries-db.mjs'

export default makeTopic({
  id: 'in_subqueries',
  title: 'IN with a subquery',
  database: SUBQUERIES_DB,
  paragraphs: [
    'A subquery that returns a whole column of values can follow `IN`. The row is kept when its value is somewhere in that list:',
    "```\nSELECT title\nFROM tracks\nWHERE artist_id IN (SELECT id FROM artists WHERE genre = 'jazz');\n```",
    'Read it from the inside out: find the ids of the jazz artists, then keep the tracks whose `artist_id` is one of them.',
    "A join could answer the same question, but `IN` has one advantage: it never repeats rows. Joining listeners to their plays repeats a listener once per play; `WHERE id IN (SELECT listener_id FROM plays)` keeps each listener once, however often they played.",
    '`NOT IN` keeps the rows whose value is **not** in the list, such as the tracks nobody has played:',
    '```\nSELECT title\nFROM tracks\nWHERE id NOT IN (SELECT track_id FROM plays);\n```',
    "One trap: if the list contains a `NULL`, `NOT IN` keeps nothing at all. `3 NOT IN (1, 2, NULL)` isn't true, it's unknown, because the missing value might be 3. When the subquery's column can be `NULL`, add `WHERE column IS NOT NULL` inside it, or use `NOT EXISTS` (coming up in two stages).",
    'Subqueries can be nested: the list itself can come from a query that uses another subquery.',
  ],
  sandboxCode: "SELECT title\nFROM tracks\nWHERE artist_id IN (SELECT id FROM artists WHERE genre = 'jazz');",
  sandboxSnippets: [
    snippet('Jazz tracks', "SELECT title\nFROM tracks\nWHERE artist_id IN (SELECT id FROM artists WHERE genre = 'jazz');"),
    snippet('Never played', 'SELECT title\nFROM tracks\nWHERE id NOT IN (SELECT track_id FROM plays);'),
    snippet('Join repeats, IN does not', 'SELECT l.name FROM listeners l JOIN plays p ON p.listener_id = l.id;\nSELECT name FROM listeners WHERE id IN (SELECT listener_id FROM plays);'),
    snippet('The NULL trap', 'SELECT 3 NOT IN (1, 2) AS without_null,\n       3 NOT IN (1, 2, NULL) AS with_null;'),
  ],
  readMore: { label: 'SQLite: the IN operator', url: 'https://www.sqlite.org/lang_expr.html#the_in_and_not_in_operators', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Jazz tracks', {
      prompt: "Show the `title` of every track by a `jazz` artist, using `IN` with a subquery.",
      hint: "`WHERE artist_id IN (SELECT id FROM artists WHERE genre = 'jazz')`.",
      solution: "SELECT title\nFROM tracks\nWHERE artist_id IN (SELECT id FROM artists WHERE genre = 'jazz');",
    }),
    query('easy', 'Never played', {
      prompt: 'Show the `title` of every track that has never been played.',
      hint: '`WHERE id NOT IN (SELECT track_id FROM plays)`.',
      solution: 'SELECT title\nFROM tracks\nWHERE id NOT IN (SELECT track_id FROM plays);',
    }),
    query('easy', 'Active listeners', {
      prompt: 'Show the `name` of every listener who has played at least one track, once each.',
      hint: '`WHERE id IN (SELECT listener_id FROM plays)`.',
      solution: 'SELECT name\nFROM listeners\nWHERE id IN (SELECT listener_id FROM plays);',
    }),
    query('medium', 'New this year', {
      prompt: 'Show the `name` of every artist with a track released in 2026.',
      hint: "`WHERE id IN (SELECT artist_id FROM tracks WHERE released >= '2026-01-01')`.",
      solution: "SELECT name\nFROM artists\nWHERE id IN (SELECT artist_id FROM tracks WHERE released >= '2026-01-01');",
    }),
    query('medium', 'Electronic fans', {
      prompt: 'Show the `name` of every listener who follows an `electronic` artist. Use two nested subqueries.',
      hint: "`WHERE id IN (SELECT listener_id FROM follows WHERE artist_id IN (SELECT id FROM artists WHERE genre = 'electronic'))`.",
      solution: "SELECT name\nFROM listeners\nWHERE id IN (\n  SELECT listener_id FROM follows\n  WHERE artist_id IN (SELECT id FROM artists WHERE genre = 'electronic')\n);",
    }),
    query('medium', 'Pop listeners', {
      prompt: 'Show the `name` of every listener who played a track by a `pop` artist, once each.',
      hint: "Listener ids from plays whose track is in the pop artists' tracks: three levels of `IN`, or a join inside one subquery.",
      solution: "SELECT name\nFROM listeners\nWHERE id IN (\n  SELECT p.listener_id\n  FROM plays p\n  JOIN tracks t ON t.id = p.track_id\n  JOIN artists a ON a.id = t.artist_id\n  WHERE a.genre = 'pop'\n);",
    }),
    query('hard', 'Fix the repeats', {
      prompt: 'This query should list each listener who played a jazz track once, but some names appear several times. Rewrite it so each name appears once.',
      starter: "SELECT l.name\nFROM listeners l\nJOIN plays p ON p.listener_id = l.id\nJOIN tracks t ON t.id = p.track_id\nJOIN artists a ON a.id = t.artist_id\nWHERE a.genre = 'jazz';",
      hint: 'Keep listeners `WHERE id IN (…)` a subquery that finds the listener ids of the jazz plays.',
      solution: "SELECT name\nFROM listeners\nWHERE id IN (\n  SELECT p.listener_id\n  FROM plays p\n  JOIN tracks t ON t.id = p.track_id\n  JOIN artists a ON a.id = t.artist_id\n  WHERE a.genre = 'jazz'\n);",
    }),
    query('hard', 'Not for premium ears', {
      prompt: 'Show the `title` of every track that no premium listener has played.',
      hint: "`WHERE id NOT IN (SELECT track_id FROM plays WHERE listener_id IN (SELECT id FROM listeners WHERE plan = 'premium'))`.",
      solution: "SELECT title\nFROM tracks\nWHERE id NOT IN (\n  SELECT track_id FROM plays\n  WHERE listener_id IN (SELECT id FROM listeners WHERE plan = 'premium')\n);",
    }),
    query('expert', 'Unfollowed by premium', {
      prompt: 'Show the `name` of every artist that no premium listener follows.',
      hint: "`WHERE id NOT IN (SELECT artist_id FROM follows WHERE listener_id IN (SELECT id FROM listeners WHERE plan = 'premium'))`.",
      solution: "SELECT name\nFROM artists\nWHERE id NOT IN (\n  SELECT artist_id FROM follows\n  WHERE listener_id IN (SELECT id FROM listeners WHERE plan = 'premium')\n);",
    }),
    query('expert', 'The busiest day', {
      prompt: 'Show the `title` of each track played on the day with the most plays. If several days tie, use the earliest of them.',
      hint: 'The day: `(SELECT played_on FROM plays GROUP BY played_on ORDER BY COUNT(*) DESC, played_on LIMIT 1)`. Then keep the tracks whose id is in the plays of that day.',
      solution: 'SELECT title\nFROM tracks\nWHERE id IN (\n  SELECT track_id FROM plays\n  WHERE played_on = (\n    SELECT played_on FROM plays\n    GROUP BY played_on\n    ORDER BY COUNT(*) DESC, played_on\n    LIMIT 1\n  )\n);',
    }),
  ],
  questions: [
    mc('What must a subquery after `IN` return?', ['Exactly one value', 'Two columns', 'A whole table', 'One column of values'], 3,
      'IN checks the value against every value in that column.'),
    mc('How do you read `WHERE artist_id IN (SELECT id FROM artists WHERE genre = \'jazz\')`?', ['Tracks whose artist is one of the jazz artists', 'Jazz artists only', 'An error', 'Tracks by every artist'], 0,
      'The inner query lists the jazz artist ids; IN keeps tracks with one of them.'),
    mc('Why might `IN` be better than a join for "listeners who played something"?', ['Joins can\'t do it', 'IN keeps each listener once; the join repeats them per play', 'IN sorts the result', 'It is always faster'], 1,
      'A join gives one row per matching play.'),
    mc('What does `3 NOT IN (1, 2, NULL)` give?', ['True', 'False', 'An error', 'NULL (unknown)'], 3,
      'The missing value might be 3, so the answer is unknown, and WHERE drops the row.'),
    qShort('Which keyword, before IN, keeps the values that are not in the list?', 'NOT',
      '`NOT IN (…)`.'),
    mc('How do you make NOT IN safe when the column may be NULL?', ['Add `WHERE column IS NOT NULL` inside the subquery', 'Add ORDER BY', 'Use LIMIT 1', 'Use UNION'], 0,
      'Without NULLs in the list, NOT IN works as expected (or use NOT EXISTS).'),
    mc('Can subqueries be nested?', ['Only in FROM', 'No', 'Yes, a subquery can contain another', 'Only two levels'], 2,
      'Each level is worked out from the inside out.'),
    mc('Which finds tracks nobody has played?', ['`WHERE track_id IS NULL`', '`WHERE id NOT IN (SELECT track_id FROM plays)`', '`WHERE id <> plays`', '`WHERE id IN (SELECT track_id FROM plays)`'], 1,
      'Keep the tracks whose id is not among the played ones.'),
    mc('Does `IN (subquery)` care about the order of the list?', ['Yes', 'Only with ORDER BY', 'It must be sorted', 'No, it only checks whether the value is there'], 3,
      'IN is a membership test.'),
    mc('Can the subquery in IN use a join?', ['Only with GROUP BY', 'Yes, any query that returns one column', 'No', 'Only an INNER JOIN'], 1,
      'Whatever it does inside, it just has to return one column.'),
  ],
})
