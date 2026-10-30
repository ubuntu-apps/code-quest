// Window functions: Named windows, FILTER, and streaks.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { WINDOWS_DB } from '../windows-db.mjs'

export default makeTopic({
  id: 'named_windows',
  title: 'Named windows, FILTER and streaks',
  database: WINDOWS_DB,
  paragraphs: [
    "When several functions use the same window, name it once with a `WINDOW` clause, after `HAVING` and before `ORDER BY`, and write `OVER w`:",
    '```\nSELECT player_id, played_on, points,\n       LAG(points) OVER w AS previous,\n       SUM(points) OVER w AS season_so_far\nFROM games\nWINDOW w AS (PARTITION BY player_id ORDER BY played_on)\nORDER BY player_id, played_on;\n```',
    "You can add a frame to a named window where you use it: `OVER (w ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)`. (The named window itself must not have a frame then.)",
    "An aggregate window can also take `FILTER (WHERE …)`, written before `OVER`, so it only counts some rows of its frame: `COUNT(*) FILTER (WHERE points >= 40) OVER w` is the number of games of 40 or more so far.",
    "Windows also solve **gaps and islands**: finding runs of things in a row. Number the quiz nights with `DENSE_RANK() OVER (ORDER BY played_on)`, and number each player's games with `ROW_NUMBER()`. While a player attends every night, both go up by one each time, so `night - ROW_NUMBER()` stays the same. After a missed night it jumps. Each value marks one streak:",
    '```\nWITH numbered AS (\n  SELECT player_id, played_on,\n         DENSE_RANK() OVER (ORDER BY played_on) AS night\n  FROM games\n)\nSELECT player_id, played_on, night,\n       night - ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY played_on) AS streak\nFROM numbered\nORDER BY player_id, played_on;\n```',
    'Group by player and streak to get each streak\'s first and last night and its length.',
  ],
  sandboxCode: 'SELECT player_id, played_on, points,\n       LAG(points) OVER w AS previous,\n       SUM(points) OVER w AS season_so_far\nFROM games\nWINDOW w AS (PARTITION BY player_id ORDER BY played_on)\nORDER BY player_id, played_on;',
  sandboxSnippets: [
    snippet('A named window', 'SELECT player_id, played_on, points,\n       LAG(points) OVER w AS previous,\n       SUM(points) OVER w AS season_so_far\nFROM games\nWINDOW w AS (PARTITION BY player_id ORDER BY played_on)\nORDER BY player_id, played_on;'),
    snippet('FILTER', 'SELECT player_id, played_on, points,\n       COUNT(*) FILTER (WHERE points >= 40) OVER (PARTITION BY player_id ORDER BY played_on) AS forties_so_far\nFROM games\nORDER BY player_id, played_on;'),
    snippet('Streaks', 'WITH numbered AS (\n  SELECT player_id, played_on,\n         DENSE_RANK() OVER (ORDER BY played_on) AS night\n  FROM games\n)\nSELECT player_id, played_on, night,\n       night - ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY played_on) AS streak\nFROM numbered\nORDER BY player_id, played_on;'),
  ],
  readMore: { label: 'SQLite: the WINDOW clause and FILTER', url: 'https://www.sqlite.org/windowfunctions.html#the_window_clause', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Name the window', {
      prompt: "Show each game's `player_id`, `played_on` and `points`, with the running total (`season_so_far`) and running average (`average_so_far`, 1 decimal), both over a named window `w`. Sort by player id, then date.",
      hint: '`WINDOW w AS (PARTITION BY player_id ORDER BY played_on)`, then `SUM(points) OVER w` and `AVG(points) OVER w`.',
      solution: 'SELECT player_id, played_on, points,\n       SUM(points) OVER w AS season_so_far,\n       ROUND(AVG(points) OVER w, 1) AS average_so_far\nFROM games\nWINDOW w AS (PARTITION BY player_id ORDER BY played_on)\nORDER BY player_id, played_on;',
    }),
    query('easy', 'Forties so far', {
      prompt: "Show each game's `player_id`, `played_on` and `points`, with how many of the player's games so far scored 40 or more (`forties_so_far`). Sort by player id, then date.",
      hint: '`COUNT(*) FILTER (WHERE points >= 40) OVER (PARTITION BY player_id ORDER BY played_on)`.',
      solution: 'SELECT player_id, played_on, points,\n       COUNT(*) FILTER (WHERE points >= 40) OVER (PARTITION BY player_id ORDER BY played_on) AS forties_so_far\nFROM games\nORDER BY player_id, played_on;',
    }),
    query('easy', 'Night numbers', {
      prompt: "Show each game's `player_id` and `played_on`, with the night's number in the season (`night`, 1 for the first night). Sort by date, then player id.",
      hint: '`DENSE_RANK() OVER (ORDER BY played_on)`: every game that night gets the same number.',
      solution: 'SELECT player_id, played_on,\n       DENSE_RANK() OVER (ORDER BY played_on) AS night\nFROM games\nORDER BY played_on, player_id;',
    }),
    query('medium', 'Before, after and so far', {
      prompt: "Show each game's `player_id`, `played_on` and `points`, with `previous` (points of the game before), `next` (points of the game after) and `best_so_far`, all over one named window. Sort by player id, then date.",
      hint: '`LAG(points) OVER w`, `LEAD(points) OVER w` and `MAX(points) OVER w`.',
      solution: 'SELECT player_id, played_on, points,\n       LAG(points) OVER w AS previous,\n       LEAD(points) OVER w AS next,\n       MAX(points) OVER w AS best_so_far\nFROM games\nWINDOW w AS (PARTITION BY player_id ORDER BY played_on)\nORDER BY player_id, played_on;',
    }),
    query('medium', 'A frame on a named window', {
      prompt: "Show each game's `player_id`, `played_on` and `points`, the average of the last three games (`last3`, 1 decimal) and the running total (`season_so_far`), using one named window `w` without a frame. Sort by player id, then date.",
      hint: '`OVER (w ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)` for the average; `OVER w` for the total.',
      solution: 'SELECT player_id, played_on, points,\n       ROUND(AVG(points) OVER (w ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 1) AS last3,\n       SUM(points) OVER w AS season_so_far\nFROM games\nWINDOW w AS (PARTITION BY player_id ORDER BY played_on)\nORDER BY player_id, played_on;',
    }),
    query('medium', 'Nights missed', {
      prompt: "Show each game's `player_id`, `played_on` and `night` number, with how many nights the player missed since their previous game (`missed`; empty for their first game). Sort by player id, then date.",
      hint: 'Number the nights in a CTE; then `night - LAG(night) OVER (…) - 1`.',
      solution: 'WITH numbered AS (\n  SELECT player_id, played_on,\n         DENSE_RANK() OVER (ORDER BY played_on) AS night\n  FROM games\n)\nSELECT player_id, played_on, night,\n       night - LAG(night) OVER (PARTITION BY player_id ORDER BY played_on) - 1 AS missed\nFROM numbered\nORDER BY player_id, played_on;',
    }),
    query('hard', 'Streak labels', {
      prompt: "Show each game's `player_id`, `played_on` and `night`, with `streak`: night minus the player's game number, so games in an unbroken run share it. Sort by player id, then date.",
      hint: 'The intro\'s example.',
      solution: 'WITH numbered AS (\n  SELECT player_id, played_on,\n         DENSE_RANK() OVER (ORDER BY played_on) AS night\n  FROM games\n)\nSELECT player_id, played_on, night,\n       night - ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY played_on) AS streak\nFROM numbered\nORDER BY player_id, played_on;',
    }),
    query('hard', 'Streaks', {
      prompt: "List every attendance streak (nights in a row): `player_id`, its first night (`started`), its last night (`ended`) and how many nights it lasted (`nights`). Sort by player id, then start.",
      hint: 'Put the streak labels in a second CTE, then group by player_id and streak.',
      solution: 'WITH numbered AS (\n  SELECT player_id, played_on,\n         DENSE_RANK() OVER (ORDER BY played_on) AS night\n  FROM games\n),\nlabelled AS (\n  SELECT player_id, played_on,\n         night - ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY played_on) AS streak\n  FROM numbered\n)\nSELECT player_id, MIN(played_on) AS started, MAX(played_on) AS ended, COUNT(*) AS nights\nFROM labelled\nGROUP BY player_id, streak\nORDER BY player_id, started;',
    }),
    query('expert', 'Longest streak', {
      prompt: "Show each player's `name` and their longest attendance streak in nights (`longest`). Sort by longest (highest first), then name.",
      hint: 'Count each streak as before, then take the MAX per player and join players.',
      solution: 'WITH numbered AS (\n  SELECT player_id, played_on,\n         DENSE_RANK() OVER (ORDER BY played_on) AS night\n  FROM games\n),\nlabelled AS (\n  SELECT player_id,\n         night - ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY played_on) AS streak\n  FROM numbered\n),\nstreaks AS (\n  SELECT player_id, COUNT(*) AS nights\n  FROM labelled\n  GROUP BY player_id, streak\n)\nSELECT p.name, MAX(s.nights) AS longest\nFROM streaks s\nJOIN players p ON p.id = s.player_id\nGROUP BY p.id, p.name\nORDER BY longest DESC, p.name;',
    }),
    query('expert', 'Player cards', {
      prompt: "Show one row per player: `name`, `games`, season `total`, `average` (1 decimal), `best` score, number of games of 40 or more (`forties`) and `place` (RANK by total). Sort by place, then name.",
      hint: 'Group by player; `COUNT(*) FILTER (WHERE g.points >= 40)` counts the forties; `RANK() OVER (ORDER BY SUM(g.points) DESC)` gives the place.',
      solution: 'SELECT p.name, COUNT(*) AS games, SUM(g.points) AS total,\n       ROUND(AVG(g.points), 1) AS average, MAX(g.points) AS best,\n       COUNT(*) FILTER (WHERE g.points >= 40) AS forties,\n       RANK() OVER (ORDER BY SUM(g.points) DESC) AS place\nFROM games g\nJOIN players p ON p.id = g.player_id\nGROUP BY p.id, p.name\nORDER BY place, p.name;',
    }),
  ],
  questions: [
    mc('Where does the WINDOW clause go?', ['After ORDER BY', 'After HAVING, before ORDER BY', 'Before FROM', 'Inside OVER'], 1,
      'Then OVER w uses it.'),
    mc('Why name a window?', ['To allow WHERE', 'To sort the result', 'It is faster', 'To write the same window once for several functions'], 3,
      'Less repetition, fewer mistakes.'),
    mc('How do you add a frame to a named window w?', ['You can\'t', 'OVER w ROWS …', 'WINDOW w ROWS …', 'OVER (w ROWS BETWEEN …)'], 3,
      'The named window itself must not have a frame then.'),
    mc('Where does FILTER go in `COUNT(*) FILTER (WHERE points >= 40) OVER w`?', ['In the WINDOW clause', 'In WHERE', 'Between the aggregate and OVER', 'After OVER'], 2,
      'It limits the rows the aggregate counts.'),
    qShort('Which keyword limits an aggregate to some rows, as in `COUNT(*) … (WHERE points >= 40)`?', 'FILTER',
      'It works with GROUP BY and with windows.'),
    mc('Why does `night - ROW_NUMBER()` mark a streak?', ['It ranks the players', 'It is always 0', 'Both go up by one while nights are in a row, so the difference stays the same', 'It counts the nights'], 2,
      'A missed night makes the difference jump.'),
    mc('Why DENSE_RANK for night numbers?', ['Every game on a night gets the same number, and the next night is the next number', 'It is the same as ROW_NUMBER', 'It needs no ORDER BY', 'It skips numbers after ties'], 0,
      'RANK would jump by the number of games on the night before.'),
    mc('What is the "gaps and islands" problem?', ['Finding runs of rows in a row, and the gaps between them', 'Sorting by two columns', 'Finding NULLs', 'Joining tables with gaps'], 0,
      'Streaks are islands; missed nights are gaps.'),
    mc('After labelling streaks, how do you get each streak\'s length?', ['ROW_NUMBER', 'LAG', 'MAX(streak)', 'GROUP BY player_id, streak with COUNT(*)'], 3,
      'Each label is one streak.'),
    mc('Can a grouped query use FILTER and a window function together?', ['Only with a named window', 'Yes', 'No', 'Only without GROUP BY'], 1,
      'Like the player cards challenge.'),
  ],
})
