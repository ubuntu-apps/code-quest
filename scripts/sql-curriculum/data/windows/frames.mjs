// Window functions: Frames.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { WINDOWS_DB } from '../windows-db.mjs'

export default makeTopic({
  id: 'window_frames',
  title: 'Moving windows: frames',
  database: WINDOWS_DB,
  paragraphs: [
    "A frame says which rows around the current one an aggregate looks at. You write it after the `ORDER BY` inside `OVER`. This is the average of the player's last three games, the current one and the two before it:",
    '```\nSELECT player_id, played_on, points,\n       ROUND(AVG(points) OVER (PARTITION BY player_id ORDER BY played_on\n                               ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 1) AS last3\nFROM games\nORDER BY player_id, played_on;\n```',
    "That is a **moving average**. `ROWS BETWEEN start AND end` counts rows. The start and end can be `UNBOUNDED PRECEDING` (the first row of the partition), `n PRECEDING`, `CURRENT ROW`, `n FOLLOWING` and `UNBOUNDED FOLLOWING` (the last row).",
    "A frame can leave out the current row: `ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING` is every game before this one, so `MAX(points)` over it is the best score before this game. It is NULL for the first game, because the frame is empty.",
    "`RANGE` frames count by value instead of by rows. With one numeric `ORDER BY`, `RANGE BETWEEN 14 PRECEDING AND CURRENT ROW` takes the rows whose value is up to 14 below the current one. Ordering by `julianday(played_on)` makes that \"the last 14 days\", however many games that is.",
    "Finally, `EXCLUDE CURRENT ROW` at the end of a frame leaves the current row out, so `AVG(points) OVER (PARTITION BY played_on ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING EXCLUDE CURRENT ROW)` is the average of everyone else that night.",
  ],
  sandboxCode: 'SELECT player_id, played_on, points,\n       ROUND(AVG(points) OVER (PARTITION BY player_id ORDER BY played_on\n                               ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 1) AS last3\nFROM games\nORDER BY player_id, played_on;',
  sandboxSnippets: [
    snippet('Last three games', 'SELECT player_id, played_on, points,\n       ROUND(AVG(points) OVER (PARTITION BY player_id ORDER BY played_on\n                               ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 1) AS last3\nFROM games\nORDER BY player_id, played_on;'),
    snippet('Best before', 'SELECT player_id, played_on, points,\n       MAX(points) OVER (PARTITION BY player_id ORDER BY played_on\n                         ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING) AS best_before\nFROM games\nORDER BY player_id, played_on;'),
    snippet('Last 14 days', 'SELECT player_id, played_on, points,\n       SUM(points) OVER (PARTITION BY player_id ORDER BY julianday(played_on)\n                         RANGE BETWEEN 14 PRECEDING AND CURRENT ROW) AS last_14_days\nFROM games\nORDER BY player_id, played_on;'),
  ],
  readMore: { label: 'SQLite: frame specifications', url: 'https://www.sqlite.org/windowfunctions.html#frame_specifications', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Last three games', {
      prompt: "Show each game's `player_id`, `played_on` and `points`, with the average of the player's last three games, this one included (`last3`, 1 decimal). Sort by player id, then date.",
      hint: '`AVG(points) OVER (PARTITION BY player_id ORDER BY played_on ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)`.',
      solution: 'SELECT player_id, played_on, points,\n       ROUND(AVG(points) OVER (PARTITION BY player_id ORDER BY played_on\n                               ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 1) AS last3\nFROM games\nORDER BY player_id, played_on;',
    }),
    query('easy', 'Two nights', {
      prompt: "Show each night's `played_on`, its points (`night_points`), and the points of that night and the night before together (`two_nights`). Sort by date.",
      hint: 'Group by night, then `SUM(SUM(points)) OVER (ORDER BY played_on ROWS BETWEEN 1 PRECEDING AND CURRENT ROW)`.',
      solution: 'SELECT played_on, SUM(points) AS night_points,\n       SUM(SUM(points)) OVER (ORDER BY played_on ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) AS two_nights\nFROM games\nGROUP BY played_on\nORDER BY played_on;',
    }),
    query('easy', 'Still to come', {
      prompt: "Show each game's `player_id`, `played_on` and `points`, with the points the player went on to score in their later games (`still_to_come`; empty for their last game). Sort by player id, then date.",
      hint: '`ROWS BETWEEN 1 FOLLOWING AND UNBOUNDED FOLLOWING`.',
      solution: 'SELECT player_id, played_on, points,\n       SUM(points) OVER (PARTITION BY player_id ORDER BY played_on\n                         ROWS BETWEEN 1 FOLLOWING AND UNBOUNDED FOLLOWING) AS still_to_come\nFROM games\nORDER BY player_id, played_on;',
    }),
    query('medium', 'Full windows only', {
      prompt: "Like Last three games, but show `last3` only when there really are three games in the frame; otherwise leave it empty. Sort by player id, then date.",
      hint: '`CASE WHEN COUNT(*) OVER (same frame) = 3 THEN ROUND(AVG(points) OVER (same frame), 1) END`.',
      solution: 'SELECT player_id, played_on, points,\n       CASE WHEN COUNT(*) OVER (PARTITION BY player_id ORDER BY played_on\n                                ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) = 3\n            THEN ROUND(AVG(points) OVER (PARTITION BY player_id ORDER BY played_on\n                                         ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 1)\n       END AS last3\nFROM games\nORDER BY player_id, played_on;',
    }),
    query('medium', 'Either side', {
      prompt: "Show each game's `player_id`, `played_on` and `points`, with the average of this game and the player's games just before and just after it (`around`, 1 decimal). Sort by player id, then date.",
      hint: '`ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING`.',
      solution: 'SELECT player_id, played_on, points,\n       ROUND(AVG(points) OVER (PARTITION BY player_id ORDER BY played_on\n                               ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING), 1) AS around\nFROM games\nORDER BY player_id, played_on;',
    }),
    query('medium', 'Best before', {
      prompt: "Show each game's `player_id`, `played_on` and `points`, with the player's best score in their earlier games (`best_before`; empty for their first game). Sort by player id, then date.",
      hint: '`MAX(points) OVER (… ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING)`.',
      solution: 'SELECT player_id, played_on, points,\n       MAX(points) OVER (PARTITION BY player_id ORDER BY played_on\n                         ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING) AS best_before\nFROM games\nORDER BY player_id, played_on;',
    }),
    query('hard', 'New personal bests', {
      prompt: "Show the games in which a player beat all their earlier scores (first games don't count): `player_id`, `played_on`, `best_before` and `points`. Sort by player id, then date.",
      hint: 'The previous challenge in a subquery, then `WHERE points > best_before`.',
      solution: 'SELECT player_id, played_on, best_before, points\nFROM (\n  SELECT player_id, played_on, points,\n         MAX(points) OVER (PARTITION BY player_id ORDER BY played_on\n                           ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING) AS best_before\n  FROM games\n) AS g\nWHERE points > best_before\nORDER BY player_id, played_on;',
    }),
    query('hard', 'Last 14 days', {
      prompt: "Show each game's `player_id`, `played_on` and `points`, with the player's points from games in the 14 days up to and including this one (`last_14_days`). Sort by player id, then date.",
      hint: '`ORDER BY julianday(played_on) RANGE BETWEEN 14 PRECEDING AND CURRENT ROW`.',
      solution: 'SELECT player_id, played_on, points,\n       SUM(points) OVER (PARTITION BY player_id ORDER BY julianday(played_on)\n                         RANGE BETWEEN 14 PRECEDING AND CURRENT ROW) AS last_14_days\nFROM games\nORDER BY player_id, played_on;',
    }),
    query('expert', 'Everyone else', {
      prompt: "Show each game's `played_on`, `player_id` and `points`, with the average of the other players that night (`others`, 1 decimal). Sort by date, then player id.",
      hint: '`AVG(points) OVER (PARTITION BY played_on ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING EXCLUDE CURRENT ROW)`.',
      solution: 'SELECT played_on, player_id, points,\n       ROUND(AVG(points) OVER (PARTITION BY played_on\n                               ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING\n                               EXCLUDE CURRENT ROW), 1) AS others\nFROM games\nORDER BY played_on, player_id;',
    }),
    query('expert', 'Form guide', {
      prompt: "For each player's latest game only, show `player_id`, the points of their last two games (`recent`) and of the two games before those (`before`). Sort by player id.",
      hint: 'Two frames: `ROWS BETWEEN 1 PRECEDING AND CURRENT ROW` and `ROWS BETWEEN 3 PRECEDING AND 2 PRECEDING`, plus a ROW_NUMBER newest first to keep the latest game.',
      solution: 'SELECT player_id, recent, before\nFROM (\n  SELECT player_id,\n         SUM(points) OVER (PARTITION BY player_id ORDER BY played_on\n                           ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) AS recent,\n         SUM(points) OVER (PARTITION BY player_id ORDER BY played_on\n                           ROWS BETWEEN 3 PRECEDING AND 2 PRECEDING) AS before,\n         ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY played_on DESC) AS n\n  FROM games\n) AS g\nWHERE n = 1\nORDER BY player_id;',
    }),
  ],
  questions: [
    mc('What does `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW` cover?', ['The two rows after', 'The current row and the two before it', 'Two rows', 'Everything before'], 1,
      'Up to three rows: fewer at the start of a partition.'),
    mc('What is a moving average?', ['An average over a frame that moves along with the current row', 'A running total', 'An average that ignores NULL', 'An average of everything'], 0,
      'For example the last three games.'),
    mc('Which frame is "every later row"?', ['1 FOLLOWING AND UNBOUNDED FOLLOWING', '1 PRECEDING AND 1 FOLLOWING', 'UNBOUNDED PRECEDING AND CURRENT ROW', 'CURRENT ROW AND CURRENT ROW'], 0,
      'From the next row to the last.'),
    mc('What does MAX over `ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING` give on the first row?', ['0', 'The row\'s own value', 'An error', 'NULL, because the frame is empty'], 3,
      'There are no rows before the first.'),
    qShort('Which frame type counts rows, as opposed to values? (one word)', 'ROWS',
      'RANGE counts by the ORDER BY value.'),
    mc('`ORDER BY julianday(played_on) RANGE BETWEEN 14 PRECEDING AND CURRENT ROW` covers…', ['14 rows', 'The next 14 days', 'The games in the 14 days up to this one', 'The last 14 games'], 2,
      'RANGE uses the value, so it is days here.'),
    mc('How do you show a 3-game average only when there are three games?', ['LIMIT 3', 'ROWS 3', 'WHERE n = 3', 'CASE WHEN COUNT(*) OVER (same frame) = 3 THEN … END'], 3,
      'COUNT over the same frame says how many rows it has.'),
    mc('What does EXCLUDE CURRENT ROW do?', ['Leaves the current row out of the frame', 'Ends the partition', 'Removes the row from the result', 'Skips NULLs'], 0,
      'Good for "everyone else".'),
    mc('Where does the frame go?', ['In WHERE', 'After the query\'s ORDER BY', 'Inside OVER, after its ORDER BY', 'Before PARTITION BY'], 2,
      '`OVER (PARTITION BY … ORDER BY … ROWS BETWEEN …)`.'),
    mc('`ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING` covers…', ['The whole partition', 'The row before, this one and the row after', 'Only this row', 'Two rows before'], 1,
      'A centred window of three.'),
  ],
})
