// Window functions: NTILE and the value functions.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { WINDOWS_DB } from '../windows-db.mjs'

export default makeTopic({
  id: 'ntile_values',
  title: 'Buckets and values: NTILE, FIRST_VALUE and more',
  database: WINDOWS_DB,
  paragraphs: [
    "`NTILE(4)` splits the rows, in the `OVER`'s order, into 4 buckets as equal in size as it can, and gives each row its bucket's number: the top quarter is 1. If the rows don't divide evenly, the first buckets get one more row.",
    '```\nSELECT id, points,\n       NTILE(4) OVER (ORDER BY points DESC, id) AS quarter\nFROM games\nORDER BY quarter, points DESC, id;\n```',
    "`FIRST_VALUE(points)` gives the value from the first row of the frame, so with `PARTITION BY player_id ORDER BY played_on` it is the points of the player's first game, on every row. `NTH_VALUE(points, 2)` is the second row's value.",
    "`LAST_VALUE` has a trap. The default frame with `ORDER BY` ends at the current row, so the last row of the frame is the current row itself, and `LAST_VALUE(points)` just gives back `points`. To see the whole partition, give the frame yourself: `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`.",
    '```\nSELECT player_id, played_on, points,\n       LAST_VALUE(points) OVER (PARTITION BY player_id ORDER BY played_on\n                                ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS last_points\nFROM games\nORDER BY player_id, played_on;\n```',
    "Two more give positions as fractions. `PERCENT_RANK()` is `(rank - 1) / (rows - 1)`: 0 for the first, 1 for the last. `CUME_DIST()` is the share of rows that come before the current row or tie with it, so the last row gets 1.",
  ],
  sandboxCode: 'SELECT id, points,\n       NTILE(4) OVER (ORDER BY points DESC, id) AS quarter\nFROM games\nORDER BY quarter, points DESC, id;',
  sandboxSnippets: [
    snippet('Quarters', 'SELECT id, points,\n       NTILE(4) OVER (ORDER BY points DESC, id) AS quarter\nFROM games\nORDER BY quarter, points DESC, id;'),
    snippet('First and last', 'SELECT player_id, played_on, points,\n       FIRST_VALUE(points) OVER w AS first_points,\n       LAST_VALUE(points) OVER w AS last_points\nFROM games\nWINDOW w AS (PARTITION BY player_id ORDER BY played_on\n             ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)\nORDER BY player_id, played_on;'),
    snippet('Positions', 'SELECT id, points,\n       RANK() OVER (ORDER BY points) AS rank,\n       ROUND(PERCENT_RANK() OVER (ORDER BY points), 2) AS pct_rank,\n       ROUND(CUME_DIST() OVER (ORDER BY points), 2) AS cume_dist\nFROM games\nORDER BY points, id;'),
  ],
  readMore: { label: 'SQLite: built-in window functions', url: 'https://www.sqlite.org/windowfunctions.html#builtins', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Quarters', {
      prompt: "Split the games into 4 buckets from the highest points (ties by id): show `id`, `points` and `quarter`. Sort by quarter, then highest points, then id.",
      hint: '`NTILE(4) OVER (ORDER BY points DESC, id)`.',
      solution: 'SELECT id, points,\n       NTILE(4) OVER (ORDER BY points DESC, id) AS quarter\nFROM games\nORDER BY quarter, points DESC, id;',
    }),
    query('easy', 'Where they started', {
      prompt: "Show each game's `player_id`, `played_on` and `points`, with the points of the player's first game (`first_points`). Sort by player id, then date.",
      hint: '`FIRST_VALUE(points) OVER (PARTITION BY player_id ORDER BY played_on)`.',
      solution: 'SELECT player_id, played_on, points,\n       FIRST_VALUE(points) OVER (PARTITION BY player_id ORDER BY played_on) AS first_points\nFROM games\nORDER BY player_id, played_on;',
    }),
    query('easy', 'Top half', {
      prompt: "Split the players into 2 halves by season total, highest first (ties by name): show `name`, `total` and `half`. Sort by half, then highest total, then name.",
      hint: 'Join and group by player, then `NTILE(2) OVER (ORDER BY SUM(g.points) DESC, p.name)`.',
      solution: 'SELECT p.name, SUM(g.points) AS total,\n       NTILE(2) OVER (ORDER BY SUM(g.points) DESC, p.name) AS half\nFROM games g\nJOIN players p ON p.id = g.player_id\nGROUP BY p.id, p.name\nORDER BY half, total DESC, p.name;',
    }),
    query('medium', 'Fix the last value', {
      prompt: "`last_points` should be the points of the player's latest game, on every row, but it just repeats `points`. Fix the window.",
      starter: 'SELECT player_id, played_on, points,\n       LAST_VALUE(points) OVER (PARTITION BY player_id ORDER BY played_on) AS last_points\nFROM games\nORDER BY player_id, played_on;',
      hint: 'The default frame ends at the current row. Add `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`.',
      solution: 'SELECT player_id, played_on, points,\n       LAST_VALUE(points) OVER (PARTITION BY player_id ORDER BY played_on\n                                ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS last_points\nFROM games\nORDER BY player_id, played_on;',
    }),
    query('medium', 'The second game', {
      prompt: "Show each game's `player_id`, `played_on` and `points`, with the points of the player's second game on every row (`second_points`). Sort by player id, then date.",
      hint: '`NTH_VALUE(points, 2)` with the frame over the whole partition.',
      solution: 'SELECT player_id, played_on, points,\n       NTH_VALUE(points, 2) OVER (PARTITION BY player_id ORDER BY played_on\n                                  ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS second_points\nFROM games\nORDER BY player_id, played_on;',
    }),
    query('medium', 'Percent rank', {
      prompt: "Show each game's `id` and `points`, with its `PERCENT_RANK` from the lowest points (`pct_rank`, 2 decimals). Sort by points, then id.",
      hint: '`ROUND(PERCENT_RANK() OVER (ORDER BY points), 2)`.',
      solution: 'SELECT id, points,\n       ROUND(PERCENT_RANK() OVER (ORDER BY points), 2) AS pct_rank\nFROM games\nORDER BY points, id;',
    }),
    query('hard', 'Cumulative share', {
      prompt: "Show each player's `name` and season total (`total`), with the share of players on that total or less (`cume_dist`, 2 decimals). Sort by total, then name.",
      hint: 'Group by player, then `ROUND(CUME_DIST() OVER (ORDER BY SUM(g.points)), 2)`.',
      solution: 'SELECT p.name, SUM(g.points) AS total,\n       ROUND(CUME_DIST() OVER (ORDER BY SUM(g.points)), 2) AS cume_dist\nFROM games g\nJOIN players p ON p.id = g.player_id\nGROUP BY p.id, p.name\nORDER BY total, p.name;',
    }),
    query('hard', 'First and last', {
      prompt: "Show one row per player: `player_id`, the points of their first game (`first_points`), of their latest game (`last_points`), and the `change` between them. Sort by player id.",
      hint: 'FIRST_VALUE and LAST_VALUE over the whole partition, then DISTINCT.',
      solution: 'SELECT DISTINCT player_id,\n       FIRST_VALUE(points) OVER (PARTITION BY player_id ORDER BY played_on) AS first_points,\n       LAST_VALUE(points) OVER (PARTITION BY player_id ORDER BY played_on\n                                ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS last_points,\n       LAST_VALUE(points) OVER (PARTITION BY player_id ORDER BY played_on\n                                ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)\n         - FIRST_VALUE(points) OVER (PARTITION BY player_id ORDER BY played_on) AS change\nFROM games\nORDER BY player_id;',
    }),
    query('expert', 'Top quarter each night', {
      prompt: "Show the games in the first of 4 buckets on their night, by points from the highest (ties by player id): `played_on`, `player_id` and `points`. Sort by date, then highest points, then player id.",
      hint: '`NTILE(4) OVER (PARTITION BY played_on ORDER BY points DESC, player_id)` in a subquery, keep 1.',
      solution: 'SELECT played_on, player_id, points\nFROM (\n  SELECT played_on, player_id, points,\n         NTILE(4) OVER (PARTITION BY played_on ORDER BY points DESC, player_id) AS quarter\n  FROM games\n) AS g\nWHERE quarter = 1\nORDER BY played_on, points DESC, player_id;',
    }),
    query('expert', 'Behind the leader', {
      prompt: "Show each game's `played_on`, `player_id` and `points`, the id of that night's leader (`leader`: highest points, ties by player id) and how many points behind the leader it was (`behind`). Sort by date, then highest points, then player id.",
      hint: '`FIRST_VALUE(player_id) OVER (PARTITION BY played_on ORDER BY points DESC, player_id)`, and the same with `points` for the leader\'s score.',
      solution: 'SELECT played_on, player_id, points,\n       FIRST_VALUE(player_id) OVER (PARTITION BY played_on ORDER BY points DESC, player_id) AS leader,\n       FIRST_VALUE(points) OVER (PARTITION BY played_on ORDER BY points DESC, player_id) - points AS behind\nFROM games\nORDER BY played_on, points DESC, player_id;',
    }),
  ],
  questions: [
    mc('What does NTILE(4) do?', ['Splits the rows into 4 buckets in order and numbers them 1 to 4', 'Keeps 4 rows', 'Ranks in steps of 4', 'Divides the values by 4'], 0,
      'The top bucket is 1 when ordered highest first.'),
    mc('10 rows with NTILE(4): how big are the buckets?', ['All 2.5', '3, 3, 2, 2', '2, 2, 3, 3', '4, 4, 2, 0'], 1,
      'The first buckets get the extra rows.'),
    mc('What does `FIRST_VALUE(points) OVER (PARTITION BY player_id ORDER BY played_on)` give?', ['The lowest points', 'The latest points', "The points of the player's first game, on every row", 'The first row of the table'], 2,
      'The default frame always starts at the first row.'),
    mc('Why does `LAST_VALUE(points) OVER (PARTITION BY player_id ORDER BY played_on)` just repeat `points`?', ['PARTITION BY is wrong', 'The default frame ends at the current row', 'LAST_VALUE is broken', 'It needs DESC'], 1,
      'Widen the frame to UNBOUNDED FOLLOWING.'),
    qShort('Which function gives the value from the n-th row of the frame?', 'NTH_VALUE',
      '`NTH_VALUE(points, 2) OVER (…)`.'),
    mc('What is PERCENT_RANK on the first row?', ['0', '1', '0.5', 'NULL'], 0,
      '(rank - 1) / (rows - 1), and the first rank is 1.'),
    mc('What is CUME_DIST on the last row?', ['The number of rows', 'NULL', '0', '1'], 3,
      'All rows come before it or tie with it.'),
    mc('Which frame lets LAST_VALUE see the whole partition?', ['RANGE CURRENT ROW', 'ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING', 'No frame', 'ROWS BETWEEN 1 PRECEDING AND CURRENT ROW'], 1,
      'From the first row to the last.'),
    mc('Why add a tie-breaker to NTILE\'s ORDER BY?', ['To get more buckets', 'So tied rows always land in the same buckets', 'NTILE needs two columns', 'It is faster'], 1,
      'Like ROW_NUMBER, NTILE splits tied rows.'),
    mc('How do you get one row per player from FIRST_VALUE and LAST_VALUE?', ['GROUP BY points', 'LIMIT 1', 'WHERE n = 1 only', 'SELECT DISTINCT player_id and the two values'], 3,
      'Every row of a player has the same values.'),
  ],
})
