// Window functions: PARTITION BY.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { WINDOWS_DB } from '../windows-db.mjs'

export default makeTopic({
  id: 'partition_by',
  title: 'Windows per group: PARTITION BY',
  database: WINDOWS_DB,
  paragraphs: [
    "`PARTITION BY` splits the rows into groups, and the window function works within each group. It is like `GROUP BY`, except that the rows stay: each one gets its own group's result beside it.",
    '```\nSELECT id, played_on, player_id, points,\n       SUM(points) OVER (PARTITION BY played_on) AS night_total\nFROM games\nORDER BY played_on, player_id;\n```',
    "Every game on the same night gets the same `night_total`. Partition by player instead, and each game shows that player's figure: `AVG(points) OVER (PARTITION BY player_id)` is their season average, next to every game they played.",
    'That puts a row and its group side by side, which is exactly what comparisons need: points minus the night\'s average, a share of the team\'s total, whether a game was the player\'s best.',
    '```\nSELECT id, player_id, points,\n       MAX(points) OVER (PARTITION BY player_id) AS best,\n       points = MAX(points) OVER (PARTITION BY player_id) AS is_best\nFROM games\nORDER BY player_id, id;\n```',
    'You can partition by several columns, or by a column from a joined table, such as the team: `OVER (PARTITION BY p.team, g.played_on)`.',
  ],
  sandboxCode: 'SELECT id, played_on, player_id, points,\n       SUM(points) OVER (PARTITION BY played_on) AS night_total\nFROM games\nORDER BY played_on, player_id;',
  sandboxSnippets: [
    snippet('Night totals', 'SELECT id, played_on, player_id, points,\n       SUM(points) OVER (PARTITION BY played_on) AS night_total\nFROM games\nORDER BY played_on, player_id;'),
    snippet('Player averages', 'SELECT id, player_id, points,\n       ROUND(AVG(points) OVER (PARTITION BY player_id), 1) AS season_average\nFROM games\nORDER BY player_id, id;'),
    snippet('Best game?', 'SELECT id, player_id, points,\n       MAX(points) OVER (PARTITION BY player_id) AS best,\n       points = MAX(points) OVER (PARTITION BY player_id) AS is_best\nFROM games\nORDER BY player_id, id;'),
  ],
  readMore: { label: 'SQLite: window functions', url: 'https://www.sqlite.org/windowfunctions.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Night totals', {
      prompt: "Show each game's `played_on`, `player_id` and `points`, with the total points of that night (`night_total`). Sort by date, then player id.",
      hint: '`SUM(points) OVER (PARTITION BY played_on) AS night_total`.',
      solution: 'SELECT played_on, player_id, points,\n       SUM(points) OVER (PARTITION BY played_on) AS night_total\nFROM games\nORDER BY played_on, player_id;',
    }),
    query('easy', 'Season averages', {
      prompt: "Show each game's `player_id`, `played_on` and `points`, with the player's season average (`season_average`, 1 decimal). Sort by player id, then date.",
      hint: '`ROUND(AVG(points) OVER (PARTITION BY player_id), 1)`.',
      solution: 'SELECT player_id, played_on, points,\n       ROUND(AVG(points) OVER (PARTITION BY player_id), 1) AS season_average\nFROM games\nORDER BY player_id, played_on;',
    }),
    query('easy', 'Games played', {
      prompt: "Show each game's `player_id` and `played_on`, with how many games that player played in the season (`games`). Sort by player id, then date.",
      hint: '`COUNT(*) OVER (PARTITION BY player_id)`.',
      solution: 'SELECT player_id, played_on, COUNT(*) OVER (PARTITION BY player_id) AS games\nFROM games\nORDER BY player_id, played_on;',
    }),
    query('medium', 'Against the night', {
      prompt: "Show each game's `played_on`, `player_id` and `points`, and how far it was from that night's average (`diff`, 1 decimal). Sort by date, then player id.",
      hint: '`ROUND(points - AVG(points) OVER (PARTITION BY played_on), 1)`.',
      solution: 'SELECT played_on, player_id, points,\n       ROUND(points - AVG(points) OVER (PARTITION BY played_on), 1) AS diff\nFROM games\nORDER BY played_on, player_id;',
    }),
    query('medium', 'Share of the night', {
      prompt: "Show each game's `played_on`, `player_id` and its share of that night's points (`share`, %, 1 decimal). Sort by date, then highest share, then player id.",
      hint: '`ROUND(100.0 * points / SUM(points) OVER (PARTITION BY played_on), 1)`.',
      solution: 'SELECT played_on, player_id,\n       ROUND(100.0 * points / SUM(points) OVER (PARTITION BY played_on), 1) AS share\nFROM games\nORDER BY played_on, share DESC, player_id;',
    }),
    query('medium', 'Personal best?', {
      prompt: "Show each game's `player_id`, `played_on` and `points`, the player's best score (`best`), and `is_best`: 1 if this game equals it, otherwise 0. Sort by player id, then date.",
      hint: '`MAX(points) OVER (PARTITION BY player_id)`, and compare: `points = MAX(…) OVER (…) AS is_best`.',
      solution: 'SELECT player_id, played_on, points,\n       MAX(points) OVER (PARTITION BY player_id) AS best,\n       points = MAX(points) OVER (PARTITION BY player_id) AS is_best\nFROM games\nORDER BY player_id, played_on;',
    }),
    query('hard', 'Team nights', {
      prompt: "Show each game's `played_on`, the player's `team`, `name` and `points`, with their team's total that night (`team_night`). Sort by date, then team, then name.",
      hint: 'Join players, then `SUM(g.points) OVER (PARTITION BY g.played_on, p.team)`.',
      solution: 'SELECT g.played_on, p.team, p.name, g.points,\n       SUM(g.points) OVER (PARTITION BY g.played_on, p.team) AS team_night\nFROM games g\nJOIN players p ON p.id = g.player_id\nORDER BY g.played_on, p.team, p.name;',
    }),
    query('hard', 'Above their own average', {
      prompt: "Show the `player_id`, `played_on` and `points` of the games in which a player scored above their own season average. Sort by player id, then date.",
      hint: 'Put `AVG(points) OVER (PARTITION BY player_id) AS average` in a subquery, then `WHERE points > average`.',
      solution: 'SELECT player_id, played_on, points\nFROM (\n  SELECT player_id, played_on, points,\n         AVG(points) OVER (PARTITION BY player_id) AS average\n  FROM games\n) AS g\nWHERE points > average\nORDER BY player_id, played_on;',
    }),
    query('expert', 'Share of the team', {
      prompt: "Show each player's `team`, `name`, season total (`total`) and share of their team's total (`team_share`, %, 1 decimal). Sort by team, then highest total, then name.",
      hint: 'Group by player (and team), then `SUM(SUM(g.points)) OVER (PARTITION BY p.team)`.',
      solution: 'SELECT p.team, p.name, SUM(g.points) AS total,\n       ROUND(100.0 * SUM(g.points) / SUM(SUM(g.points)) OVER (PARTITION BY p.team), 1) AS team_share\nFROM games g\nJOIN players p ON p.id = g.player_id\nGROUP BY p.id, p.team, p.name\nORDER BY p.team, total DESC, p.name;',
    }),
    query('expert', 'Above the bottom', {
      prompt: "Show each game's `played_on`, `player_id` and `points`, how many points above that night's lowest score it was (`above_last`), and how many played that night (`players`). Sort by date, then highest points, then player id.",
      hint: '`points - MIN(points) OVER (PARTITION BY played_on)` and `COUNT(*) OVER (PARTITION BY played_on)`.',
      solution: 'SELECT played_on, player_id, points,\n       points - MIN(points) OVER (PARTITION BY played_on) AS above_last,\n       COUNT(*) OVER (PARTITION BY played_on) AS players\nFROM games\nORDER BY played_on, points DESC, player_id;',
    }),
  ],
  questions: [
    mc('What does `PARTITION BY played_on` do inside OVER?', ['Groups the result into one row per night', 'Splits the rows into one group per night, and the window works within each', 'Sorts by date', 'Removes other nights'], 1,
      'The rows stay; each gets its own night\'s result.'),
    mc('How is PARTITION BY different from GROUP BY?', ['PARTITION BY is faster', 'GROUP BY works only on numbers', 'It isn\'t', 'GROUP BY collapses each group into one row; PARTITION BY keeps every row'], 3,
      'That is why window functions are good for comparisons.'),
    mc('`AVG(points) OVER (PARTITION BY player_id)` gives…', ['The league average', 'The night\'s average', "The player's season average, on each of their games", 'A running average'], 2,
      'One average per player, repeated on each row.'),
    mc('Can PARTITION BY use two columns?', ['Only with ORDER BY', 'Only numbers', 'Yes, like `PARTITION BY played_on, team`', 'No'], 2,
      'Each combination is its own group.'),
    qShort('Which two words inside OVER split the rows into groups? (two words)', 'PARTITION BY',
      '`OVER (PARTITION BY …)`.'),
    mc('What does `points = MAX(points) OVER (PARTITION BY player_id)` give?', ['1 for each player\'s best game(s), 0 for the others', 'The best score', 'An error', 'The number of games'], 0,
      'A comparison is 1 when true and 0 when false.'),
    mc('How do you keep only games above the player\'s own average?', ['The window in a subquery, then WHERE outside it', 'HAVING', 'PARTITION BY points', 'WHERE with the window function'], 0,
      'WHERE can\'t use window functions directly.'),
    mc('In a grouped query, what does `SUM(SUM(points)) OVER (PARTITION BY team)` add up?', ['The group totals within each team', 'The team names', 'Every game', 'Nothing'], 0,
      'The window works over the grouped rows.'),
    mc('Can you partition by a column from a joined table?', ['Only the first table', 'Yes, any column of the rows', 'No', 'Only with GROUP BY'], 1,
      'For example p.team after joining players.'),
    mc('Two games on the same night: do they get the same `SUM(points) OVER (PARTITION BY played_on)`?', ['No', 'Only if they tie', 'Only with ORDER BY', 'Yes'], 3,
      'They are in the same partition.'),
  ],
})
