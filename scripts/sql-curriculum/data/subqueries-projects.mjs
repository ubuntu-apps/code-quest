// Subqueries and sets: the section's projects (easy, medium, hard).
import { makeProject, mc, qShort, query, snippet } from './_builders.mjs'
import { SUBQUERIES_DB } from './subqueries-db.mjs'

const weeklyChart = makeProject('easy', {
  id: 'proj_weekly_chart',
  title: 'Weekly chart',
  database: SUBQUERIES_DB,
  paragraphs: [
    "You edit the service's chart page. Each challenge is one box on the page: the top tracks, the new releases, the tracks nobody has found yet, the artist chart and each genre's hit.",
    "Plays are counted over the whole `plays` table. Today is 2026-10-24.",
  ],
  sandboxCode: 'SELECT t.title, COUNT(p.id) AS plays\nFROM tracks t\nLEFT JOIN plays p ON p.track_id = t.id\nGROUP BY t.id, t.title\nORDER BY plays DESC, t.title;',
  sandboxSnippets: [
    snippet('Plays per track', 'SELECT t.title, COUNT(p.id) AS plays\nFROM tracks t\nLEFT JOIN plays p ON p.track_id = t.id\nGROUP BY t.id, t.title\nORDER BY plays DESC, t.title;'),
    snippet('Average length', 'SELECT AVG(duration_s) FROM tracks;'),
  ],
  readMore: { label: 'SQLite: the WITH clause', url: 'https://www.sqlite.org/lang_with.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Long listens', {
      prompt: "Show the `title` and artist name (`artist`) of every track longer than the average track. In title order.",
      hint: 'Join tracks to artists, `WHERE t.duration_s > (SELECT AVG(duration_s) FROM tracks) ORDER BY t.title`.',
      solution: 'SELECT t.title, a.name AS artist\nFROM tracks t\nJOIN artists a ON a.id = t.artist_id\nWHERE t.duration_s > (SELECT AVG(duration_s) FROM tracks)\nORDER BY t.title;',
    }),
    query('easy', 'Top five', {
      prompt: 'Show the five most played tracks: `title` and `plays`. Most first; equal plays in title order.',
      hint: 'Group plays by track, join the titles, `ORDER BY plays DESC, t.title LIMIT 5`.',
      solution: 'SELECT t.title, COUNT(*) AS plays\nFROM plays p\nJOIN tracks t ON t.id = p.track_id\nGROUP BY t.id, t.title\nORDER BY plays DESC, t.title\nLIMIT 5;',
    }),
    query('medium', 'New this year', {
      prompt: "Show each track released in 2026: `title`, `released` and its `plays` (0 if none), newest first.",
      hint: "`(SELECT COUNT(*) FROM plays p WHERE p.track_id = t.id) AS plays … WHERE released >= '2026-01-01' ORDER BY released DESC`.",
      solution: "SELECT title, released,\n       (SELECT COUNT(*) FROM plays p WHERE p.track_id = t.id) AS plays\nFROM tracks t\nWHERE released >= '2026-01-01'\nORDER BY released DESC;",
    }),
    query('medium', 'Waiting to be found', {
      prompt: 'Show the `title` and artist name (`artist`) of every track that has never been played.',
      hint: 'Join tracks to artists, `WHERE NOT EXISTS (SELECT 1 FROM plays p WHERE p.track_id = t.id)`.',
      solution: 'SELECT t.title, a.name AS artist\nFROM tracks t\nJOIN artists a ON a.id = t.artist_id\nWHERE NOT EXISTS (SELECT 1 FROM plays p WHERE p.track_id = t.id);',
    }),
    query('hard', 'Artist chart', {
      prompt: "Show the top three artists by plays: `name`, `plays` and `followers`. Use one CTE per count. Most plays first; ties in name order.",
      hint: 'CTEs artist_plays and artist_followers, joined to artists, `ORDER BY plays DESC, a.name LIMIT 3`.',
      solution: 'WITH artist_plays AS (\n  SELECT t.artist_id, COUNT(*) AS plays\n  FROM plays p\n  JOIN tracks t ON t.id = p.track_id\n  GROUP BY t.artist_id\n),\nartist_followers AS (\n  SELECT artist_id, COUNT(*) AS followers\n  FROM follows\n  GROUP BY artist_id\n)\nSELECT a.name, ap.plays, COALESCE(af.followers, 0) AS followers\nFROM artists a\nJOIN artist_plays ap ON ap.artist_id = a.id\nLEFT JOIN artist_followers af ON af.artist_id = a.id\nORDER BY ap.plays DESC, a.name\nLIMIT 3;',
    }),
    query('hard', 'Genre hits', {
      prompt: "For each `genre`, show its most played track: `title` and `plays` (all tracks that tie). Sort by genre, then title.",
      hint: 'A CTE of (genre, title, plays) for the played tracks, then keep `plays = (SELECT MAX(plays) FROM cte AS x WHERE x.genre = cte.genre)`.',
      solution: 'WITH gt AS (\n  SELECT a.genre, t.title, COUNT(*) AS plays\n  FROM plays p\n  JOIN tracks t ON t.id = p.track_id\n  JOIN artists a ON a.id = t.artist_id\n  GROUP BY a.genre, t.id, t.title\n)\nSELECT genre, title, plays\nFROM gt\nWHERE plays = (SELECT MAX(plays) FROM gt AS x WHERE x.genre = gt.genre)\nORDER BY genre, title;',
    }),
  ],
  questions: [
    mc('Which keeps the tracks longer than average?', ['`ORDER BY AVG(duration_s)`', '`WHERE duration_s > (SELECT AVG(duration_s) FROM tracks)`', '`WHERE duration_s > AVG(duration_s)`', '`HAVING duration_s > AVG`'], 1,
      'The average comes from a subquery.'),
    mc('Why add `t.title` after `plays DESC` in the top five?', ['To group by title', 'To remove duplicates', 'It is required by LIMIT', 'So tracks with equal plays come in a fixed order'], 3,
      'With ties, LIMIT would otherwise cut at an unpredictable place.'),
    mc('Which finds tracks with no plays?', ['`NOT EXISTS (SELECT 1 FROM plays p WHERE p.track_id = t.id)`', '`WHERE track_id IS NULL`', '`EXISTS (SELECT 1 FROM plays)`', '`WHERE plays = 0`'], 0,
      'For each track, check that no play of it exists.'),
    qShort('Which keyword starts a query with named subqueries?', 'WITH',
      '`WITH name AS (…)`.'),
    mc('Why count plays and followers in separate CTEs?', ['To sort them', 'Joining both raw tables would multiply the counts', 'It is shorter', 'CTEs can only count once'], 1,
      'One row per artist in each CTE keeps the join clean.'),
    mc('"Genre hits" keeps a track when…', ['it was released first', 'it has any plays', 'its plays equal the most plays in its genre', 'it is the longest'], 2,
      'The correlated subquery finds the genre\'s maximum.'),
  ],
})

const listenerInsights = makeProject('medium', {
  id: 'proj_listener_insights',
  title: 'Listener insights',
  database: SUBQUERIES_DB,
  paragraphs: [
    'The product team wants to understand the listeners: who never started, who listens most, who follows artists without listening to them, and what each listener likes best.',
    'Listeners without plays should appear wherever the question is about every listener.',
  ],
  sandboxCode: 'SELECT l.name, l.plan,\n       (SELECT COUNT(*) FROM plays p WHERE p.listener_id = l.id) AS plays\nFROM listeners l;',
  sandboxSnippets: [
    snippet('Plays per listener', 'SELECT l.name, l.plan,\n       (SELECT COUNT(*) FROM plays p WHERE p.listener_id = l.id) AS plays\nFROM listeners l;'),
    snippet('Genres per listener', 'SELECT DISTINCT p.listener_id, a.genre\nFROM plays p\nJOIN tracks t ON t.id = p.track_id\nJOIN artists a ON a.id = t.artist_id\nORDER BY p.listener_id;'),
  ],
  readMore: { label: 'SQLite: subquery expressions', url: 'https://www.sqlite.org/lang_expr.html#subq', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Never started', {
      prompt: 'Show the `name`, `plan` and `joined` date of every listener with no plays, earliest joined first.',
      hint: '`WHERE NOT EXISTS (SELECT 1 FROM plays p WHERE p.listener_id = l.id) ORDER BY joined`.',
      solution: 'SELECT name, plan, joined\nFROM listeners l\nWHERE NOT EXISTS (SELECT 1 FROM plays p WHERE p.listener_id = l.id)\nORDER BY joined;',
    }),
    query('medium', 'Keen listeners', {
      prompt: "Show the `name`, `plan` and `plays` of the listeners with more plays than the average listener who played. Most first, then by name.",
      hint: 'A CTE of plays per listener, joined to listeners, `WHERE plays > (SELECT AVG(plays) FROM cte)`.',
      solution: 'WITH per_listener AS (\n  SELECT listener_id, COUNT(*) AS plays\n  FROM plays\n  GROUP BY listener_id\n)\nSELECT l.name, l.plan, pl.plays\nFROM per_listener pl\nJOIN listeners l ON l.id = pl.listener_id\nWHERE pl.plays > (SELECT AVG(plays) FROM per_listener)\nORDER BY pl.plays DESC, l.name;',
    }),
    query('medium', 'Follows without listening', {
      prompt: "Show every listener's `name` and how many of the artists they follow they have never played (`unplayed_follows`), including 0. In name order.",
      hint: 'A correlated count of follows f for this listener `WHERE NOT EXISTS` a play by them of a track by f.artist_id.',
      solution: 'SELECT name,\n  (SELECT COUNT(*)\n   FROM follows f\n   WHERE f.listener_id = l.id\n     AND NOT EXISTS (\n       SELECT 1 FROM plays p\n       JOIN tracks t ON t.id = p.track_id\n       WHERE p.listener_id = l.id AND t.artist_id = f.artist_id\n     )\n  ) AS unplayed_follows\nFROM listeners l\nORDER BY name;',
    }),
    query('medium', 'No electronic yet', {
      prompt: 'Show the `name` of every premium listener who has never played an `electronic` track.',
      hint: "`WHERE plan = 'premium' AND id NOT IN (listener ids of plays of electronic tracks)`.",
      solution: "SELECT name\nFROM listeners\nWHERE plan = 'premium'\n  AND id NOT IN (\n    SELECT p.listener_id\n    FROM plays p\n    JOIN tracks t ON t.id = p.track_id\n    JOIN artists a ON a.id = t.artist_id\n    WHERE a.genre = 'electronic'\n  );",
    }),
    query('hard', 'Favourite genre', {
      prompt: "For each listener who played, show `name`, their favourite `genre` (most plays; ties go to the genre first in alphabetical order) and those `plays`. In name order.",
      hint: 'A CTE of (listener_id, genre, plays), then keep the row whose genre is the first from `ORDER BY plays DESC, genre LIMIT 1` for that listener.',
      solution: 'WITH lg AS (\n  SELECT p.listener_id, a.genre, COUNT(*) AS plays\n  FROM plays p\n  JOIN tracks t ON t.id = p.track_id\n  JOIN artists a ON a.id = t.artist_id\n  GROUP BY p.listener_id, a.genre\n)\nSELECT l.name, lg.genre, lg.plays\nFROM lg\nJOIN listeners l ON l.id = lg.listener_id\nWHERE lg.genre = (\n  SELECT x.genre FROM lg AS x\n  WHERE x.listener_id = lg.listener_id\n  ORDER BY x.plays DESC, x.genre\n  LIMIT 1\n)\nORDER BY l.name;',
    }),
    query('hard', 'Listener cards', {
      prompt: "Show one card per listener: `name`, `plan`, `plays`, number of different artists played (`artists`) and date of the last play (`last_played`, NULL if none). Most plays first, then by name.",
      hint: 'Three correlated subqueries in the SELECT list: COUNT(*), COUNT(DISTINCT t.artist_id) and MAX(played_on), each for this listener.',
      solution: 'SELECT name, plan,\n  (SELECT COUNT(*) FROM plays p WHERE p.listener_id = l.id) AS plays,\n  (SELECT COUNT(DISTINCT t.artist_id) FROM plays p JOIN tracks t ON t.id = p.track_id WHERE p.listener_id = l.id) AS artists,\n  (SELECT MAX(played_on) FROM plays p WHERE p.listener_id = l.id) AS last_played\nFROM listeners l\nORDER BY plays DESC, name;',
    }),
  ],
  questions: [
    mc('Which finds listeners who never played?', ['`WHERE id IN (SELECT listener_id FROM plays)`', '`NOT EXISTS (SELECT 1 FROM plays p WHERE p.listener_id = l.id)`', '`WHERE plays = 0`', '`EXISTS (SELECT 1 FROM plays)`'], 1,
      'No matching play exists for them.'),
    mc('Why use a CTE for "more plays than average"?', ['To sort', 'CTEs are faster', 'The counts are needed twice: to list and to average', 'AVG needs a CTE'], 2,
      'Write the counts once, use them twice.'),
    mc('How does a listener with no plays appear in "Follows without listening"?', ['With the number of artists they follow, since they played none of them', 'Always with 0', 'They are left out', 'With NULL'], 0,
      'Every follow of theirs is unplayed.'),
    mc('Is NOT IN safe in "No electronic yet"?', ['No, never', 'Only with ORDER BY', 'Only for text', 'Yes: listener_id in plays is never NULL here'], 3,
      'NOT IN only goes wrong when the list contains NULL.'),
    qShort('Which clause keeps only the first row of a sorted subquery?', 'LIMIT',
      '`ORDER BY … LIMIT 1`.'),
    mc('What does `(SELECT MAX(played_on) FROM plays p WHERE p.listener_id = l.id)` give for a listener with no plays?', ['0', 'Today', 'An error', 'NULL'], 3,
      'MAX of no rows is NULL.'),
  ],
})

const catalogueReview = makeProject('hard', {
  id: 'proj_catalogue_review',
  title: 'Catalogue review',
  database: SUBQUERIES_DB,
  paragraphs: [
    'The label is reviewing its catalogue. It wants a profile of each artist, the tracks that reach every kind of listener, the gaps in what people have discovered, and how well follows turn into listening.',
    'Use whichever tools fit: subqueries, EXISTS, set operators and CTEs. Build each answer step by step in the sandbox.',
  ],
  sandboxCode: 'SELECT a.name,\n  (SELECT COUNT(*) FROM tracks t WHERE t.artist_id = a.id) AS tracks\nFROM artists a;',
  sandboxSnippets: [
    snippet('Tracks per artist', 'SELECT a.name,\n  (SELECT COUNT(*) FROM tracks t WHERE t.artist_id = a.id) AS tracks\nFROM artists a;'),
    snippet('Plays per track', 'WITH tp AS (\n  SELECT t.id, t.artist_id, t.title, COUNT(p.id) AS plays\n  FROM tracks t\n  LEFT JOIN plays p ON p.track_id = t.id\n  GROUP BY t.id, t.artist_id, t.title\n)\nSELECT * FROM tp;'),
  ],
  readMore: { label: 'SQLite: the SELECT statement', url: 'https://www.sqlite.org/lang_select.html', source: 'SQLite documentation' },
  challenges: [
    query('medium', 'Artist profiles', {
      prompt: "For each artist, show `name`, number of tracks (`tracks`), average length rounded to 1 decimal (`average_s`) and the title of their longest track (`longest`; the lowest id if two tie). In name order.",
      hint: "Group tracks by artist for the counts, and for the title use a correlated subquery: `(SELECT title FROM tracks t2 WHERE t2.artist_id = a.id ORDER BY duration_s DESC, id LIMIT 1)`.",
      solution: 'SELECT a.name, COUNT(*) AS tracks, ROUND(AVG(t.duration_s), 1) AS average_s,\n  (SELECT t2.title FROM tracks t2 WHERE t2.artist_id = a.id ORDER BY t2.duration_s DESC, t2.id LIMIT 1) AS longest\nFROM artists a\nJOIN tracks t ON t.artist_id = a.id\nGROUP BY a.id, a.name\nORDER BY a.name;',
    }),
    query('medium', 'Every kind of listener', {
      prompt: 'Show the `title` of every track played by at least one free listener and at least one premium listener. In title order.',
      hint: "`WHERE id IN (track ids played by free listeners INTERSECT track ids played by premium listeners)`.",
      solution: "SELECT title\nFROM tracks\nWHERE id IN (\n  SELECT p.track_id FROM plays p JOIN listeners l ON l.id = p.listener_id WHERE l.plan = 'free'\n  INTERSECT\n  SELECT p.track_id FROM plays p JOIN listeners l ON l.id = p.listener_id WHERE l.plan = 'premium'\n)\nORDER BY title;",
    }),
    query('hard', 'Complete or with gaps', {
      prompt: "Label every artist: `complete` if all their tracks have been played, `gaps` otherwise. Show `name` and `status`, built as a `UNION ALL` of two queries, in name order.",
      hint: "One query with NOT EXISTS an unplayed track (`'complete' AS status`), the other with EXISTS an unplayed track (`'gaps'`).",
      solution: "SELECT name, 'complete' AS status\nFROM artists a\nWHERE NOT EXISTS (\n  SELECT 1 FROM tracks t\n  WHERE t.artist_id = a.id\n    AND NOT EXISTS (SELECT 1 FROM plays p WHERE p.track_id = t.id)\n)\nUNION ALL\nSELECT name, 'gaps'\nFROM artists a\nWHERE EXISTS (\n  SELECT 1 FROM tracks t\n  WHERE t.artist_id = a.id\n    AND NOT EXISTS (SELECT 1 FROM plays p WHERE p.track_id = t.id)\n)\nORDER BY name;",
    }),
    query('hard', 'Share of listening', {
      prompt: "Show every artist's `name`, `plays` (0 if none) and share of all plays (`percent`, 1 decimal). Most plays first, then by name.",
      hint: 'A CTE of plays per artist, LEFT JOINed to artists; `ROUND(100.0 * COALESCE(ap.plays, 0) / (SELECT COUNT(*) FROM plays), 1)`.',
      solution: 'WITH artist_plays AS (\n  SELECT t.artist_id, COUNT(*) AS plays\n  FROM plays p\n  JOIN tracks t ON t.id = p.track_id\n  GROUP BY t.artist_id\n)\nSELECT a.name,\n       COALESCE(ap.plays, 0) AS plays,\n       ROUND(100.0 * COALESCE(ap.plays, 0) / (SELECT COUNT(*) FROM plays), 1) AS percent\nFROM artists a\nLEFT JOIN artist_plays ap ON ap.artist_id = a.id\nORDER BY plays DESC, a.name;',
    }),
    query('hard', 'Top two per genre', {
      prompt: "Show each genre's two most played tracks (counting plays of all tracks, so unplayed tracks count as 0): `genre`, `title`, `plays`. Ties are broken by title. Sort by genre, then most plays, then title.",
      hint: 'A CTE of (genre, title, plays) with a LEFT JOIN to plays, then keep the rows with fewer than 2 better rows in the same genre.',
      solution: 'WITH gt AS (\n  SELECT a.genre, t.title, COUNT(p.id) AS plays\n  FROM tracks t\n  JOIN artists a ON a.id = t.artist_id\n  LEFT JOIN plays p ON p.track_id = t.id\n  GROUP BY a.genre, t.id, t.title\n)\nSELECT genre, title, plays\nFROM gt\nWHERE (\n  SELECT COUNT(*) FROM gt AS x\n  WHERE x.genre = gt.genre\n    AND (x.plays > gt.plays OR (x.plays = gt.plays AND x.title < gt.title))\n) < 2\nORDER BY genre, plays DESC, title;',
    }),
    query('hard', 'From follow to play', {
      prompt: "For each followed artist, show `name`, `followers`, the followers who have played them (`listening`) and that as a percentage of followers (`percent`, 1 decimal). Highest percentage first, then by name.",
      hint: 'For each follow, test with EXISTS whether that listener played that artist (1 or 0) in a CTE, then group by artist.',
      solution: 'WITH marked AS (\n  SELECT f.artist_id,\n    CASE WHEN EXISTS (\n      SELECT 1 FROM plays p\n      JOIN tracks t ON t.id = p.track_id\n      WHERE p.listener_id = f.listener_id AND t.artist_id = f.artist_id\n    ) THEN 1 ELSE 0 END AS played\n  FROM follows f\n)\nSELECT a.name, COUNT(*) AS followers, SUM(m.played) AS listening,\n       ROUND(100.0 * SUM(m.played) / COUNT(*), 1) AS percent\nFROM marked m\nJOIN artists a ON a.id = m.artist_id\nGROUP BY a.id, a.name\nORDER BY percent DESC, a.name;',
    }),
  ],
  questions: [
    mc('How do you show the title of the longest track next to grouped counts?', ['`GROUP BY title`', 'It is not possible', 'A correlated subquery with ORDER BY … LIMIT 1 in the SELECT list', '`MAX(title)`'], 2,
      'MAX(title) would give the last title alphabetically, not the longest track.'),
    mc('"Played by both free and premium listeners" uses…', ['EXCEPT', 'UNION ALL', 'UNION', 'INTERSECT'], 3,
      'Both means the overlap of the two lists.'),
    mc('Why can `complete` and `gaps` be joined with UNION ALL safely?', ['UNION ALL removes duplicates', 'They are sorted', 'No artist can be in both lists', 'It is required'], 2,
      'NOT EXISTS and EXISTS of the same thing never both hold.'),
    mc('What does `CASE WHEN EXISTS (…) THEN 1 ELSE 0 END` give?', ['1 if any matching row exists, otherwise 0', 'The number of matching rows', 'NULL or 1', 'An error'], 0,
      'Summing those values counts the rows where the test holds.'),
    qShort('Which function turns a missing count from a LEFT JOIN into 0?', 'COALESCE',
      '`COALESCE(ap.plays, 0)`.'),
    mc('How do you keep the top two rows of each group without window functions?', ['`GROUP BY … HAVING COUNT(*) = 2`', '`DISTINCT`', 'Keep rows with fewer than 2 better rows in their group', '`LIMIT 2`'], 2,
      'LIMIT 2 alone would only keep two rows overall.'),
  ],
})

export const subqueriesProjects = [weeklyChart, listenerInsights, catalogueReview]
