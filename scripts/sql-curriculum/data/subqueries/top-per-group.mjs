// Subqueries and sets: The top row in each group.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { SUBQUERIES_DB } from '../subqueries-db.mjs'

export default makeTopic({
  id: 'top_per_group',
  title: 'The top in each group',
  database: SUBQUERIES_DB,
  paragraphs: [
    '"Each artist\'s longest track" sounds like a `GROUP BY`, but `GROUP BY artist_id` with `MAX(duration_s)` only gives the length, not the title. You need the whole **row** that holds the top value.',
    'A correlated subquery finds it: keep each track whose length equals the longest length of its own artist.',
    '```\nSELECT t.title, t.duration_s\nFROM tracks t\nWHERE t.duration_s = (\n  SELECT MAX(duration_s) FROM tracks WHERE artist_id = t.artist_id\n);\n```',
    'If two rows tie for the top, both are kept. Sometimes that is right. When you need exactly one row per group, add a rule that breaks ties: let the subquery pick one **id**, sorted by your rule, with `LIMIT 1`:',
    '```\nSELECT t.title\nFROM tracks t\nWHERE t.id = (\n  SELECT t2.id FROM tracks t2\n  WHERE t2.artist_id = t.artist_id\n  ORDER BY t2.duration_s DESC, t2.id\n  LIMIT 1\n);\n```',
    'When the value you rank by is itself a total, like plays per track, work it out in a CTE first, then pick the top rows from the CTE in the same way.',
    'The window functions quest shows a shorter way to do all this, with `ROW_NUMBER()` and `RANK()`. The subquery way works in every database, and helps you see what those functions do.',
  ],
  sandboxCode: 'SELECT t.title, t.duration_s\nFROM tracks t\nWHERE t.duration_s = (\n  SELECT MAX(duration_s) FROM tracks WHERE artist_id = t.artist_id\n);',
  sandboxSnippets: [
    snippet('Only the length', 'SELECT artist_id, MAX(duration_s) AS longest FROM tracks GROUP BY artist_id;'),
    snippet('The whole row', 'SELECT t.title, t.duration_s\nFROM tracks t\nWHERE t.duration_s = (\n  SELECT MAX(duration_s) FROM tracks WHERE artist_id = t.artist_id\n);'),
    snippet('Exactly one per group', 'SELECT t.title\nFROM tracks t\nWHERE t.id = (\n  SELECT t2.id FROM tracks t2\n  WHERE t2.artist_id = t.artist_id\n  ORDER BY t2.duration_s DESC, t2.id\n  LIMIT 1\n);'),
    snippet('Top from a CTE', 'WITH tp AS (\n  SELECT t.artist_id, t.title, COUNT(p.id) AS plays\n  FROM tracks t\n  LEFT JOIN plays p ON p.track_id = t.id\n  GROUP BY t.id, t.artist_id, t.title\n)\nSELECT artist_id, title, plays\nFROM tp\nWHERE plays = (SELECT MAX(plays) FROM tp AS x WHERE x.artist_id = tp.artist_id);'),
  ],
  readMore: { label: 'SQLite: subquery expressions', url: 'https://www.sqlite.org/lang_expr.html#subq', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Longest per artist', {
      prompt: "Show each artist's name (`artist`) with the `title` and `duration_s` of their longest track. In artist order.",
      hint: 'Join tracks to artists, and keep `t.duration_s = (SELECT MAX(duration_s) FROM tracks WHERE artist_id = t.artist_id)`.',
      solution: 'SELECT a.name AS artist, t.title, t.duration_s\nFROM tracks t\nJOIN artists a ON a.id = t.artist_id\nWHERE t.duration_s = (\n  SELECT MAX(duration_s) FROM tracks WHERE artist_id = t.artist_id\n)\nORDER BY artist;',
    }),
    query('easy', 'Newest per artist', {
      prompt: "Show each artist's name (`artist`) with the `title` and `released` date of their newest track (all of them if several came out that day). Sort by artist, then title.",
      hint: '`t.released = (SELECT MAX(released) FROM tracks WHERE artist_id = t.artist_id)`.',
      solution: 'SELECT a.name AS artist, t.title, t.released\nFROM tracks t\nJOIN artists a ON a.id = t.artist_id\nWHERE t.released = (\n  SELECT MAX(released) FROM tracks WHERE artist_id = t.artist_id\n)\nORDER BY artist, t.title;',
    }),
    query('easy', 'First to join', {
      prompt: 'For each `plan`, show the `name` and `joined` date of the listener who joined first. In plan order.',
      hint: '`WHERE joined = (SELECT MIN(joined) FROM listeners l2 WHERE l2.plan = l.plan)`.',
      solution: 'SELECT plan, name, joined\nFROM listeners l\nWHERE joined = (SELECT MIN(joined) FROM listeners l2 WHERE l2.plan = l.plan)\nORDER BY plan;',
    }),
    query('medium', 'Latest play', {
      prompt: "For each listener who played, show their `name`, the date of their latest play (`played_on`) and the `title` of the track they played then. In name order.",
      hint: 'Join plays to listeners and tracks, and keep `p.played_on = (SELECT MAX(played_on) FROM plays WHERE listener_id = p.listener_id)`.',
      solution: 'SELECT l.name, p.played_on, t.title\nFROM plays p\nJOIN listeners l ON l.id = p.listener_id\nJOIN tracks t ON t.id = p.track_id\nWHERE p.played_on = (\n  SELECT MAX(played_on) FROM plays WHERE listener_id = p.listener_id\n)\nORDER BY l.name;',
    }),
    query('medium', 'Hits, with ties', {
      prompt: "For every artist, show their name (`artist`), and the `title` and `plays` of their most played track. Count plays of all tracks (so unplayed tracks have 0). Show all tracks that tie. Sort by artist, then title.",
      hint: 'A CTE `tp` of (artist_id, title, plays) with a LEFT JOIN to plays, then `WHERE plays = (SELECT MAX(plays) FROM tp AS x WHERE x.artist_id = tp.artist_id)`.',
      solution: 'WITH tp AS (\n  SELECT t.artist_id, t.title, COUNT(p.id) AS plays\n  FROM tracks t\n  LEFT JOIN plays p ON p.track_id = t.id\n  GROUP BY t.id, t.artist_id, t.title\n)\nSELECT a.name AS artist, tp.title, tp.plays\nFROM tp\nJOIN artists a ON a.id = tp.artist_id\nWHERE tp.plays = (SELECT MAX(plays) FROM tp AS x WHERE x.artist_id = tp.artist_id)\nORDER BY artist, tp.title;',
    }),
    query('hard', 'One hit each', {
      prompt: "Now exactly one track per artist: show `artist`, `title` and `plays` of each artist's most played track. If tracks tie, take the one released first, then the lower id. In artist order.",
      hint: 'In the CTE keep `t.id` and `t.released` too, then `WHERE tp.id = (SELECT x.id FROM tp AS x WHERE x.artist_id = tp.artist_id ORDER BY x.plays DESC, x.released, x.id LIMIT 1)`.',
      solution: 'WITH tp AS (\n  SELECT t.id, t.artist_id, t.title, t.released, COUNT(p.id) AS plays\n  FROM tracks t\n  LEFT JOIN plays p ON p.track_id = t.id\n  GROUP BY t.id, t.artist_id, t.title, t.released\n)\nSELECT a.name AS artist, tp.title, tp.plays\nFROM tp\nJOIN artists a ON a.id = tp.artist_id\nWHERE tp.id = (\n  SELECT x.id FROM tp AS x\n  WHERE x.artist_id = tp.artist_id\n  ORDER BY x.plays DESC, x.released, x.id\n  LIMIT 1\n)\nORDER BY artist;',
    }),
    query('hard', 'Favourite artists', {
      prompt: "For each listener who played, show their `name`, their favourite artist (most plays, called `artist`) and those `plays`. If artists tie, take the one whose name comes first alphabetically. In name order.",
      hint: 'A CTE of (listener_id, artist_id, artist name, plays), then keep the row whose artist_id is the first one from `ORDER BY plays DESC, artist_name LIMIT 1` for that listener.',
      solution: 'WITH la AS (\n  SELECT p.listener_id, a.id AS artist_id, a.name AS artist, COUNT(*) AS plays\n  FROM plays p\n  JOIN tracks t ON t.id = p.track_id\n  JOIN artists a ON a.id = t.artist_id\n  GROUP BY p.listener_id, a.id, a.name\n)\nSELECT l.name, la.artist, la.plays\nFROM la\nJOIN listeners l ON l.id = la.listener_id\nWHERE la.artist_id = (\n  SELECT x.artist_id FROM la AS x\n  WHERE x.listener_id = la.listener_id\n  ORDER BY x.plays DESC, x.artist\n  LIMIT 1\n)\nORDER BY l.name;',
    }),
    query('expert', 'Top two per artist', {
      prompt: "Show each artist's two most played tracks: `artist`, `title` and `plays` (unplayed tracks count as 0, so an artist with one track shows one row). Ties are broken by title. Sort by artist, then most plays, then title.",
      hint: 'From a CTE of plays per track, keep a track when fewer than 2 tracks of the same artist rank above it: `(SELECT COUNT(*) FROM tp AS x WHERE x.artist_id = tp.artist_id AND (x.plays > tp.plays OR (x.plays = tp.plays AND x.title < tp.title))) < 2`.',
      solution: 'WITH tp AS (\n  SELECT t.artist_id, t.title, COUNT(p.id) AS plays\n  FROM tracks t\n  LEFT JOIN plays p ON p.track_id = t.id\n  GROUP BY t.id, t.artist_id, t.title\n)\nSELECT a.name AS artist, tp.title, tp.plays\nFROM tp\nJOIN artists a ON a.id = tp.artist_id\nWHERE (\n  SELECT COUNT(*) FROM tp AS x\n  WHERE x.artist_id = tp.artist_id\n    AND (x.plays > tp.plays OR (x.plays = tp.plays AND x.title < tp.title))\n) < 2\nORDER BY artist, tp.plays DESC, tp.title;',
    }),
    query('expert', 'Most followed per genre', {
      prompt: "For each `genre`, show the most followed artist (`artist`) and their `followers`. Show every artist that ties. Sort by genre, then artist.",
      hint: 'A CTE of (genre, artist, followers) with a correlated subquery or join for the counts, then keep the rows whose followers equal the genre\'s maximum.',
      solution: 'WITH af AS (\n  SELECT a.genre, a.name AS artist,\n         (SELECT COUNT(*) FROM follows f WHERE f.artist_id = a.id) AS followers\n  FROM artists a\n)\nSELECT genre, artist, followers\nFROM af\nWHERE followers = (SELECT MAX(followers) FROM af AS x WHERE x.genre = af.genre)\nORDER BY genre, artist;',
    }),
  ],
  questions: [
    mc('Why isn\'t `GROUP BY artist_id` with `MAX(duration_s)` enough for "each artist\'s longest track"?', ['It gives the length but not the rest of that row, like the title', 'MAX doesn\'t work with GROUP BY', 'It gives every track', 'It is too slow'], 0,
      'You need the whole row that holds the top value.'),
    mc('What does `WHERE duration_s = (SELECT MAX(duration_s) FROM tracks WHERE artist_id = t.artist_id)` keep?', ['Tracks above average', 'The longest track overall', 'Each artist\'s longest track(s)', 'Every track'], 2,
      'The correlated subquery finds the maximum for the current track\'s artist.'),
    mc('What happens when two tracks tie for the longest?', ['Neither is kept', 'Both are kept', 'It gives an error', 'Only the first is kept'], 1,
      'Both equal the maximum.'),
    mc('How do you keep exactly one row per group?', ['Use DISTINCT', 'Use UNION', 'Add GROUP BY title', 'Let the subquery pick one id with ORDER BY … LIMIT 1'], 3,
      'The sort order is your tie-breaking rule.'),
    qShort('Which clause keeps only the first row of the sorted subquery?', 'LIMIT',
      '`ORDER BY … LIMIT 1`.'),
    mc('When the ranking value is a total, like plays per track, what is a good first step?', ['Use UNION', 'Use NOT IN', 'Work out the totals in a CTE', 'Sort the plays table'], 2,
      'Then pick the top rows from the CTE.'),
    mc('Why count plays with a LEFT JOIN in "Hits, with ties"?', ['So unplayed tracks have 0 and can still be an artist\'s top', 'To remove duplicates', 'LEFT JOIN is required in CTEs', 'It is faster'], 0,
      'An artist with only unplayed tracks would otherwise disappear.'),
    mc('"Fewer than 2 rows rank above it" keeps…', ['The top two rows of each group', 'The bottom two', 'The top row only', 'Every row'], 0,
      'The first has 0 rows above it, the second has 1.'),
    mc('Which later SQL feature makes top-per-group queries shorter?', ['CASE', 'COALESCE', 'Window functions like ROW_NUMBER()', 'UNION'], 2,
      'They come in the window functions quest.'),
    mc('In "Favourite artists", why sort by `x.artist` after `x.plays DESC`?', ['To remove NULLs', 'To break ties between artists with the same plays', 'To sort the output', 'It is required by LIMIT'], 1,
      'Without it, a tie could pick either artist.'),
  ],
})
