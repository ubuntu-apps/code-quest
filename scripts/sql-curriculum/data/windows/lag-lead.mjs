// Window functions: LAG and LEAD.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { WINDOWS_DB } from '../windows-db.mjs'

export default makeTopic({
  id: 'lag_lead',
  title: 'The row before and after: LAG and LEAD',
  database: WINDOWS_DB,
  paragraphs: [
    "`LAG(points)` gives the value of `points` from the row before, in the order of the `OVER`'s `ORDER BY`. `LEAD(points)` gives the row after. With `PARTITION BY`, \"before\" means the player's previous game:",
    '```\nSELECT player_id, played_on, points,\n       LAG(points) OVER (PARTITION BY player_id ORDER BY played_on) AS previous,\n       points - LAG(points) OVER (PARTITION BY player_id ORDER BY played_on) AS change\nFROM games\nORDER BY player_id, played_on;\n```',
    "A player's first game has no game before it, so `previous` is NULL, and so is `change`. `LEAD` is NULL on the last row of each partition in the same way.",
    "Both take two more arguments: how many rows back or forward (`LAG(points, 2)` is two games ago), and a value to use instead of NULL (`LAG(points, 1, 0)`).",
    "LAG works with any column. With dates, `julianday(played_on) - julianday(LAG(played_on) OVER (…))` is the number of days since the player's previous game.",
    "LAG and LEAD need an order that doesn't tie, or \"the row before\" isn't well defined. Here each player plays once a night, so `played_on` is enough within a player.",
  ],
  sandboxCode: 'SELECT player_id, played_on, points,\n       LAG(points) OVER (PARTITION BY player_id ORDER BY played_on) AS previous,\n       points - LAG(points) OVER (PARTITION BY player_id ORDER BY played_on) AS change\nFROM games\nORDER BY player_id, played_on;',
  sandboxSnippets: [
    snippet('Previous game', 'SELECT player_id, played_on, points,\n       LAG(points) OVER (PARTITION BY player_id ORDER BY played_on) AS previous,\n       points - LAG(points) OVER (PARTITION BY player_id ORDER BY played_on) AS change\nFROM games\nORDER BY player_id, played_on;'),
    snippet('Next game', 'SELECT player_id, played_on,\n       LEAD(played_on) OVER (PARTITION BY player_id ORDER BY played_on) AS next_game\nFROM games\nORDER BY player_id, played_on;'),
    snippet('Days between', 'SELECT player_id, played_on,\n       julianday(played_on) - julianday(LAG(played_on) OVER (PARTITION BY player_id ORDER BY played_on)) AS days\nFROM games\nORDER BY player_id, played_on;'),
  ],
  readMore: { label: 'SQLite: built-in window functions', url: 'https://www.sqlite.org/windowfunctions.html#builtins', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Last time', {
      prompt: "Show each game's `player_id`, `played_on` and `points`, with the points of the player's previous game (`previous`). Sort by player id, then date.",
      hint: '`LAG(points) OVER (PARTITION BY player_id ORDER BY played_on)`.',
      solution: 'SELECT player_id, played_on, points,\n       LAG(points) OVER (PARTITION BY player_id ORDER BY played_on) AS previous\nFROM games\nORDER BY player_id, played_on;',
    }),
    query('easy', 'Next time', {
      prompt: "Show each game's `player_id` and `played_on`, with the date of the player's next game (`next_game`; empty after their last). Sort by player id, then date.",
      hint: '`LEAD(played_on) OVER (PARTITION BY player_id ORDER BY played_on)`.',
      solution: 'SELECT player_id, played_on,\n       LEAD(played_on) OVER (PARTITION BY player_id ORDER BY played_on) AS next_game\nFROM games\nORDER BY player_id, played_on;',
    }),
    query('easy', 'Up or down', {
      prompt: "Show each game's `player_id`, `played_on` and `points`, with the change since the player's previous game (`change`). Sort by player id, then date.",
      hint: '`points - LAG(points) OVER (…)`.',
      solution: 'SELECT player_id, played_on, points,\n       points - LAG(points) OVER (PARTITION BY player_id ORDER BY played_on) AS change\nFROM games\nORDER BY player_id, played_on;',
    }),
    query('medium', 'Days between games', {
      prompt: "Show each game's `player_id` and `played_on`, with the whole number of days since the player's previous game (`days`). Sort by player id, then date.",
      hint: '`CAST(julianday(played_on) - julianday(LAG(played_on) OVER (…)) AS INTEGER)`.',
      solution: 'SELECT player_id, played_on,\n       CAST(julianday(played_on) - julianday(LAG(played_on) OVER (PARTITION BY player_id ORDER BY played_on)) AS INTEGER) AS days\nFROM games\nORDER BY player_id, played_on;',
    }),
    query('medium', 'Getting better', {
      prompt: "Show the games in which a player beat their previous game's points: `player_id`, `played_on`, `previous` and `points`. Sort by player id, then date.",
      hint: 'LAG in a subquery, then `WHERE points > previous` (a NULL previous is left out).',
      solution: 'SELECT player_id, played_on, previous, points\nFROM (\n  SELECT player_id, played_on, points,\n         LAG(points) OVER (PARTITION BY player_id ORDER BY played_on) AS previous\n  FROM games\n) AS g\nWHERE points > previous\nORDER BY player_id, played_on;',
    }),
    query('medium', 'Night on night', {
      prompt: "Show each night's `played_on`, its points (`night_points`) and the change from the night before (`change`). Sort by date.",
      hint: 'Group by played_on, then `SUM(points) - LAG(SUM(points)) OVER (ORDER BY played_on)`.',
      solution: 'SELECT played_on, SUM(points) AS night_points,\n       SUM(points) - LAG(SUM(points)) OVER (ORDER BY played_on) AS change\nFROM games\nGROUP BY played_on\nORDER BY played_on;',
    }),
    query('hard', 'Missed a week', {
      prompt: "Show the games a player came back to after a gap of more than 7 days: `player_id`, the previous game's date (`previous_game`), `played_on`, and the days between (`days`, whole number). Sort by player id, then date.",
      hint: 'Put `LAG(played_on) … AS previous_game` in a subquery; work out the days outside and keep those over 7.',
      solution: 'SELECT player_id, previous_game, played_on,\n       CAST(julianday(played_on) - julianday(previous_game) AS INTEGER) AS days\nFROM (\n  SELECT player_id, played_on,\n         LAG(played_on) OVER (PARTITION BY player_id ORDER BY played_on) AS previous_game\n  FROM games\n) AS g\nWHERE julianday(played_on) - julianday(previous_game) > 7\nORDER BY player_id, played_on;',
    }),
    query('hard', 'Three rising', {
      prompt: "Show the games that finished a run of three rising scores (better than the game before, which was better than the one before that): `player_id`, `played_on`, `two_ago`, `previous` and `points`. Sort by player id, then date.",
      hint: '`LAG(points, 2)` and `LAG(points)` in a subquery; keep `points > previous AND previous > two_ago`.',
      solution: 'SELECT player_id, played_on, two_ago, previous, points\nFROM (\n  SELECT player_id, played_on, points,\n         LAG(points) OVER (PARTITION BY player_id ORDER BY played_on) AS previous,\n         LAG(points, 2) OVER (PARTITION BY player_id ORDER BY played_on) AS two_ago\n  FROM games\n) AS g\nWHERE points > previous AND previous > two_ago\nORDER BY player_id, played_on;',
    }),
    query('expert', 'Biggest jump', {
      prompt: "Show each player's biggest improvement from one game to the next (`biggest_jump`; it can be negative if they never improved): `player_id` and `biggest_jump`. Players with one game are left out. Sort by player id.",
      hint: 'Work out each change in a CTE, then group by player and take `MAX(change)`. MAX skips the NULLs.',
      solution: 'WITH changes AS (\n  SELECT player_id,\n         points - LAG(points) OVER (PARTITION BY player_id ORDER BY played_on) AS change\n  FROM games\n)\nSELECT player_id, MAX(change) AS biggest_jump\nFROM changes\nGROUP BY player_id\nHAVING COUNT(change) > 0\nORDER BY player_id;',
    }),
    query('expert', 'Peaks', {
      prompt: "Show the games that scored more than both the player's game before and their game after: `player_id`, `played_on`, `before`, `points` and `after`. Sort by player id, then date.",
      hint: 'LAG and LEAD in a subquery; keep `points > before AND points > after`.',
      solution: 'SELECT player_id, played_on, before, points, after\nFROM (\n  SELECT player_id, played_on, points,\n         LAG(points) OVER (PARTITION BY player_id ORDER BY played_on) AS before,\n         LEAD(points) OVER (PARTITION BY player_id ORDER BY played_on) AS after\n  FROM games\n) AS g\nWHERE points > before AND points > after\nORDER BY player_id, played_on;',
    }),
  ],
  questions: [
    mc('What does `LAG(points) OVER (PARTITION BY player_id ORDER BY played_on)` give?', ['The first game\'s points', "The points of the player's previous game", 'The points of the next game', 'The lowest points'], 1,
      'LAG looks back one row.'),
    mc('What does LAG give on a player\'s first game?', ['An error', 'The same row\'s points', '0', 'NULL'], 3,
      'There is no row before it in the partition.'),
    mc('What does `LAG(points, 2)` give?', ['The second game', 'The points from two rows back', 'Two rows', 'The points minus 2'], 1,
      'The second argument is how many rows back.'),
    mc('What does `LAG(points, 1, 0)` change?', ['It gives 0 instead of NULL when there is no row before', 'It looks forward', 'It skips one row', 'It counts from 0'], 0,
      'The third argument is the default.'),
    qShort('Which function gives the value from the next row?', 'LEAD',
      '`LEAD(points) OVER (…)`.'),
    mc('How do you get the days since the previous game?', ['julianday(played_on) - julianday(LAG(played_on) OVER (…))', 'played_on - LAG(played_on)', 'LAG(days)', 'COUNT(played_on)'], 0,
      'julianday turns a date into a number of days.'),
    mc('Why does `WHERE points > previous` leave out first games?', ['WHERE removes NULL rows first', 'previous is 0', 'Comparing with NULL is never true', 'LAG skips them'], 2,
      'NULL means unknown, so the comparison isn\'t true.'),
    mc('What do LAG and LEAD need to be well defined?', ['An ORDER BY that doesn\'t tie', 'A frame', 'GROUP BY', 'A number column'], 0,
      'Otherwise "the row before" could be either of two tied rows.'),
    mc('`SUM(points) - LAG(SUM(points)) OVER (ORDER BY played_on)` after GROUP BY played_on gives…', ['An error', 'Each game\'s change', 'The running total', 'Each night\'s change from the night before'], 3,
      'LAG works over the grouped rows.'),
    mc('How do you find the games better than both neighbours?', ['LAG only', 'LAG and LEAD in a subquery, then compare with both', 'MAX(points)', 'RANK = 1'], 1,
      'A peak is above the row before and the row after.'),
  ],
})
