// Subqueries and sets: Several CTEs.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { SUBQUERIES_DB } from '../subqueries-db.mjs'

export default makeTopic({
  id: 'several_ctes',
  title: 'Several CTEs',
  database: SUBQUERIES_DB,
  paragraphs: [
    'One `WITH` can hold several CTEs, separated by commas. Write `WITH` only once:',
    '```\nWITH artist_plays AS (\n  SELECT t.artist_id, COUNT(*) AS plays\n  FROM plays p\n  JOIN tracks t ON t.id = p.track_id\n  GROUP BY t.artist_id\n),\nartist_followers AS (\n  SELECT artist_id, COUNT(*) AS followers\n  FROM follows\n  GROUP BY artist_id\n)\nSELECT a.name,\n       COALESCE(ap.plays, 0) AS plays,\n       COALESCE(af.followers, 0) AS followers\nFROM artists a\nLEFT JOIN artist_plays ap ON ap.artist_id = a.id\nLEFT JOIN artist_followers af ON af.artist_id = a.id;\n```',
    "Each CTE counts one thing, so joining them gives one row per artist and the counts can't multiply. `LEFT JOIN` and `COALESCE` keep the artists with nothing to count.",
    'A later CTE can use an earlier one, so a long question becomes a chain of small steps, each easy to check on its own:',
    "```\nWITH recent AS (\n  SELECT * FROM plays WHERE played_on >= '2026-10-10'\n),\nrecent_listeners AS (\n  SELECT DISTINCT listener_id FROM recent\n)\nSELECT name\nFROM listeners\nWHERE id IN (SELECT listener_id FROM recent_listeners);\n```",
    'A forgotten comma between two CTEs is the most usual error here: SQLite then reports a **syntax error** near the second name.',
  ],
  sandboxCode: "WITH recent AS (\n  SELECT * FROM plays WHERE played_on >= '2026-10-10'\n),\nrecent_listeners AS (\n  SELECT DISTINCT listener_id FROM recent\n)\nSELECT name\nFROM listeners\nWHERE id IN (SELECT listener_id FROM recent_listeners);",
  sandboxSnippets: [
    snippet('Plays and followers', 'WITH artist_plays AS (\n  SELECT t.artist_id, COUNT(*) AS plays\n  FROM plays p\n  JOIN tracks t ON t.id = p.track_id\n  GROUP BY t.artist_id\n),\nartist_followers AS (\n  SELECT artist_id, COUNT(*) AS followers\n  FROM follows\n  GROUP BY artist_id\n)\nSELECT a.name,\n       COALESCE(ap.plays, 0) AS plays,\n       COALESCE(af.followers, 0) AS followers\nFROM artists a\nLEFT JOIN artist_plays ap ON ap.artist_id = a.id\nLEFT JOIN artist_followers af ON af.artist_id = a.id;'),
    snippet('A chain', "WITH recent AS (\n  SELECT * FROM plays WHERE played_on >= '2026-10-10'\n),\nrecent_listeners AS (\n  SELECT DISTINCT listener_id FROM recent\n)\nSELECT name\nFROM listeners\nWHERE id IN (SELECT listener_id FROM recent_listeners);"),
    snippet('Missing comma', "-- This gives an error: there is no comma between the two CTEs\nWITH a AS (SELECT 1 AS x)\nb AS (SELECT 2 AS y)\nSELECT * FROM a, b;"),
  ],
  readMore: { label: 'SQLite: the WITH clause', url: 'https://www.sqlite.org/lang_with.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Plays and followers', {
      prompt: "With two CTEs, show every artist's `name`, `plays` and `followers` (0 when there are none). In name order.",
      hint: 'The two CTEs from the lesson, LEFT JOINed to artists, with `COALESCE(…, 0)` and `ORDER BY a.name`.',
      solution: 'WITH artist_plays AS (\n  SELECT t.artist_id, COUNT(*) AS plays\n  FROM plays p\n  JOIN tracks t ON t.id = p.track_id\n  GROUP BY t.artist_id\n),\nartist_followers AS (\n  SELECT artist_id, COUNT(*) AS followers\n  FROM follows\n  GROUP BY artist_id\n)\nSELECT a.name,\n       COALESCE(ap.plays, 0) AS plays,\n       COALESCE(af.followers, 0) AS followers\nFROM artists a\nLEFT JOIN artist_plays ap ON ap.artist_id = a.id\nLEFT JOIN artist_followers af ON af.artist_id = a.id\nORDER BY a.name;',
    }),
    query('easy', 'Recent listeners', {
      prompt: "With a CTE `recent` of the plays on or after 2026-10-10 and a second CTE of their distinct listener ids, show those listeners' `name`s in alphabetical order.",
      hint: 'The chain from the lesson, plus `ORDER BY name`.',
      solution: "WITH recent AS (\n  SELECT * FROM plays WHERE played_on >= '2026-10-10'\n),\nrecent_listeners AS (\n  SELECT DISTINCT listener_id FROM recent\n)\nSELECT name\nFROM listeners\nWHERE id IN (SELECT listener_id FROM recent_listeners)\nORDER BY name;",
    }),
    query('easy', 'Long plays', {
      prompt: 'With a CTE `long_tracks` (over 300 seconds) and a CTE `long_plays` (plays of those tracks), count the long plays, called `long_plays`.',
      hint: '`long_plays AS (SELECT * FROM plays WHERE track_id IN (SELECT id FROM long_tracks))`, then `SELECT COUNT(*) AS long_plays FROM long_plays`.',
      solution: 'WITH long_tracks AS (\n  SELECT id FROM tracks WHERE duration_s > 300\n),\nlong_plays AS (\n  SELECT * FROM plays WHERE track_id IN (SELECT id FROM long_tracks)\n)\nSELECT COUNT(*) AS long_plays\nFROM long_plays;',
    }),
    query('medium', 'Genre explorers', {
      prompt: "With one CTE of the distinct (listener, genre) pairs played and another counting genres per listener, show the `name` and `genres` of listeners who played 2 or more genres. Most first, then by name.",
      hint: 'Pairs: `SELECT DISTINCT p.listener_id, a.genre FROM plays p JOIN tracks t … JOIN artists a …`. Counts: group the pairs by listener_id.',
      solution: 'WITH pairs AS (\n  SELECT DISTINCT p.listener_id, a.genre\n  FROM plays p\n  JOIN tracks t ON t.id = p.track_id\n  JOIN artists a ON a.id = t.artist_id\n),\ncounts AS (\n  SELECT listener_id, COUNT(*) AS genres\n  FROM pairs\n  GROUP BY listener_id\n)\nSELECT l.name, c.genres\nFROM counts c\nJOIN listeners l ON l.id = c.listener_id\nWHERE c.genres >= 2\nORDER BY c.genres DESC, l.name;',
    }),
    query('medium', 'Plays per follower', {
      prompt: "For every artist with followers, show `name` and plays per follower (`plays_per_follower`, 2 decimals), using the two CTEs. Highest first, then by name.",
      hint: 'Join artists to artist_followers (inner, so only followed artists), LEFT JOIN artist_plays, and `ROUND(COALESCE(ap.plays, 0) * 1.0 / af.followers, 2)`.',
      solution: 'WITH artist_plays AS (\n  SELECT t.artist_id, COUNT(*) AS plays\n  FROM plays p\n  JOIN tracks t ON t.id = p.track_id\n  GROUP BY t.artist_id\n),\nartist_followers AS (\n  SELECT artist_id, COUNT(*) AS followers\n  FROM follows\n  GROUP BY artist_id\n)\nSELECT a.name, ROUND(COALESCE(ap.plays, 0) * 1.0 / af.followers, 2) AS plays_per_follower\nFROM artists a\nJOIN artist_followers af ON af.artist_id = a.id\nLEFT JOIN artist_plays ap ON ap.artist_id = a.id\nORDER BY plays_per_follower DESC, a.name;',
    }),
    query('medium', 'Fix the comma', {
      prompt: 'This query should count the plays of tracks released in 2026 (`new_plays`), but gives a syntax error. Fix it.',
      starter: "WITH new_tracks AS (\n  SELECT id FROM tracks WHERE released >= '2026-01-01'\n)\nnew_plays AS (\n  SELECT * FROM plays WHERE track_id IN (SELECT id FROM new_tracks)\n)\nSELECT COUNT(*) AS new_plays FROM new_plays;",
      hint: 'Two CTEs need a comma between them, and WITH only once.',
      solution: "WITH new_tracks AS (\n  SELECT id FROM tracks WHERE released >= '2026-01-01'\n),\nnew_plays AS (\n  SELECT * FROM plays WHERE track_id IN (SELECT id FROM new_tracks)\n)\nSELECT COUNT(*) AS new_plays FROM new_plays;",
    }),
    query('hard', 'Played and followed', {
      prompt: "Show every listener's `name`, how many different artists they played (`played`) and how many they follow (`followed`), with 0s where needed. In name order.",
      hint: 'One CTE with `COUNT(DISTINCT t.artist_id)` per listener from plays, one counting follows per listener, both LEFT JOINed to listeners.',
      solution: 'WITH played AS (\n  SELECT p.listener_id, COUNT(DISTINCT t.artist_id) AS played\n  FROM plays p\n  JOIN tracks t ON t.id = p.track_id\n  GROUP BY p.listener_id\n),\nfollowed AS (\n  SELECT listener_id, COUNT(*) AS followed\n  FROM follows\n  GROUP BY listener_id\n)\nSELECT l.name,\n       COALESCE(pd.played, 0) AS played,\n       COALESCE(fd.followed, 0) AS followed\nFROM listeners l\nLEFT JOIN played pd ON pd.listener_id = l.id\nLEFT JOIN followed fd ON fd.listener_id = l.id\nORDER BY l.name;',
    }),
    query('hard', 'Release years', {
      prompt: "For each release year (the first 4 characters of `released`, called `year`), show the number of tracks released (`releases`) and the plays of those tracks (`plays`, 0 if none). In year order.",
      hint: 'One CTE counting tracks per year, one counting plays per year (plays joined to tracks), then LEFT JOIN the second to the first on year.',
      solution: 'WITH yearly AS (\n  SELECT SUBSTR(released, 1, 4) AS year, COUNT(*) AS releases\n  FROM tracks\n  GROUP BY year\n),\nyearly_plays AS (\n  SELECT SUBSTR(t.released, 1, 4) AS year, COUNT(*) AS plays\n  FROM plays p\n  JOIN tracks t ON t.id = p.track_id\n  GROUP BY year\n)\nSELECT y.year, y.releases, COALESCE(yp.plays, 0) AS plays\nFROM yearly y\nLEFT JOIN yearly_plays yp ON yp.year = y.year\nORDER BY y.year;',
    }),
    query('expert', 'Month on month', {
      prompt: "Show every listener's `name`, their plays in September 2026 (`september`), in October 2026 (`october`) and the change (`change`, October minus September), with 0s where needed. Biggest drop first, then by name.",
      hint: "Two CTEs, one per month (`played_on LIKE '2026-09%'`), both LEFT JOINed to listeners with COALESCE.",
      solution: "WITH sept AS (\n  SELECT listener_id, COUNT(*) AS plays FROM plays\n  WHERE played_on LIKE '2026-09%'\n  GROUP BY listener_id\n),\noct AS (\n  SELECT listener_id, COUNT(*) AS plays FROM plays\n  WHERE played_on LIKE '2026-10%'\n  GROUP BY listener_id\n)\nSELECT l.name,\n       COALESCE(s.plays, 0) AS september,\n       COALESCE(o.plays, 0) AS october,\n       COALESCE(o.plays, 0) - COALESCE(s.plays, 0) AS change\nFROM listeners l\nLEFT JOIN sept s ON s.listener_id = l.id\nLEFT JOIN oct o ON o.listener_id = l.id\nORDER BY change, l.name;",
    }),
    query('expert', 'Loyal and silent followers', {
      prompt: "For each followed artist, show `name`, the followers who have played them (`loyal`) and the followers who never have (`silent`). In name order.",
      hint: 'CTE 1: distinct (listener_id, artist_id) pairs from plays and tracks. CTE 2: follows LEFT JOIN those pairs, with `CASE WHEN pairs.listener_id IS NULL THEN 0 ELSE 1 END AS played`. Then sum per artist.',
      solution: 'WITH played_pairs AS (\n  SELECT DISTINCT p.listener_id, t.artist_id\n  FROM plays p\n  JOIN tracks t ON t.id = p.track_id\n),\nmarked AS (\n  SELECT f.artist_id,\n         CASE WHEN pp.listener_id IS NULL THEN 0 ELSE 1 END AS played\n  FROM follows f\n  LEFT JOIN played_pairs pp\n    ON pp.listener_id = f.listener_id AND pp.artist_id = f.artist_id\n)\nSELECT a.name, SUM(m.played) AS loyal, COUNT(*) - SUM(m.played) AS silent\nFROM marked m\nJOIN artists a ON a.id = m.artist_id\nGROUP BY a.id, a.name\nORDER BY a.name;',
    }),
  ],
  questions: [
    mc('How are several CTEs written?', ['One WITH, the CTEs separated by commas', 'One WITH per CTE', 'Separated by semicolons', 'Nested inside each other'], 0,
      '`WITH a AS (…), b AS (…) SELECT …`.'),
    mc('Can a CTE use one defined before it?', ['Only the first one', 'Only in WHERE', 'No', 'Yes'], 3,
      'That is how you build a chain of steps.'),
    mc('What does a missing comma between CTEs cause?', ['A syntax error near the second name', 'An empty result', 'Nothing', 'Wrong counts'], 0,
      'SQLite expects a comma or the main SELECT after a CTE.'),
    mc('Why count plays and followers in separate CTEs?', ['So the result is sorted', 'So the counts don\'t multiply when joined', 'CTEs can only count one thing', 'It is faster to type'], 1,
      'Each CTE has one row per artist, so the join adds no extra rows.'),
    qShort('Which function turns a missing count from a LEFT JOIN into 0?', 'COALESCE',
      '`COALESCE(ap.plays, 0)`.'),
    mc('How many times do you write the word WITH for three CTEs?', ['Twice', 'None', 'Once', 'Three times'], 2,
      'One WITH starts the list.'),
    mc('Why LEFT JOIN the CTEs to artists?', ['It is faster', 'To keep artists that have nothing to count', 'CTEs need it', 'To remove duplicates'], 1,
      'An inner join would drop them.'),
    mc('What is the advantage of a chain of CTEs?', ['Each step is small and can be checked on its own', 'It avoids SELECT', 'It changes the data', 'It always runs faster'], 0,
      'You can `SELECT * FROM step` to look at any step.'),
    mc("`WHERE played_on LIKE '2026-09%'` keeps…", ['Plays in 2026', 'Plays in October', 'Plays in September 2026', 'Plays on 9 days'], 2,
      "The text starts with '2026-09'."),
    mc('Can the main query join two CTEs to each other?', ['Only the first one', 'Yes, like any two tables', 'No', 'Only with UNION'], 1,
      'CTEs behave like tables in the main query.'),
  ],
})
