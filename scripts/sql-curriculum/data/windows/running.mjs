// Window functions: Running totals.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { WINDOWS_DB } from '../windows-db.mjs'

export default makeTopic({
  id: 'running_totals',
  title: 'Running totals',
  database: WINDOWS_DB,
  paragraphs: [
    "Put `ORDER BY` inside the `OVER` of an aggregate, and it adds up as it goes: each row gets the total from the start up to that row. That is a **running total**.",
    '```\nSELECT player_id, played_on, points,\n       SUM(points) OVER (PARTITION BY player_id ORDER BY played_on) AS season_so_far\nFROM games\nORDER BY player_id, played_on;\n```',
    "Each player's total grows game by game, and starts again for the next player. The other aggregates work the same way: `AVG` gives the average so far, `MAX` the best so far, `COUNT(*)` the games so far.",
    "The rows a running total covers are called its **frame**. With `ORDER BY` and nothing else, the frame runs from the start of the partition to the current row, **and every row that ties with it** in the `ORDER BY`. That catches people out:",
    '```\nSELECT id, played_on, points,\n       SUM(points) OVER (ORDER BY played_on) AS running\nFROM games\nORDER BY id;\n```',
    "Every game on the same night shows the same `running` value, the total after the whole night, because those games tie on `played_on`. To add one game at a time, make the order unique: `ORDER BY played_on, id`. (The frames lesson shows how to choose the frame yourself.)",
    'For a running total of groups, total the groups first and run the window over them: `SUM(SUM(points)) OVER (ORDER BY played_on)` after `GROUP BY played_on` gives the league\'s points so far, night by night.',
  ],
  sandboxCode: 'SELECT player_id, played_on, points,\n       SUM(points) OVER (PARTITION BY player_id ORDER BY played_on) AS season_so_far\nFROM games\nORDER BY player_id, played_on;',
  sandboxSnippets: [
    snippet('Season so far', 'SELECT player_id, played_on, points,\n       SUM(points) OVER (PARTITION BY player_id ORDER BY played_on) AS season_so_far\nFROM games\nORDER BY player_id, played_on;'),
    snippet('Ties share a total', 'SELECT id, played_on, points,\n       SUM(points) OVER (ORDER BY played_on) AS running,\n       SUM(points) OVER (ORDER BY played_on, id) AS one_at_a_time\nFROM games\nORDER BY id;'),
    snippet('League by night', 'SELECT played_on, SUM(points) AS night_points,\n       SUM(SUM(points)) OVER (ORDER BY played_on) AS league_so_far\nFROM games\nGROUP BY played_on\nORDER BY played_on;'),
  ],
  readMore: { label: 'SQLite: window frames', url: 'https://www.sqlite.org/windowfunctions.html#frame_specifications', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Season so far', {
      prompt: "Show each game's `player_id`, `played_on` and `points`, with the player's running total of points (`season_so_far`). Sort by player id, then date.",
      hint: '`SUM(points) OVER (PARTITION BY player_id ORDER BY played_on)`.',
      solution: 'SELECT player_id, played_on, points,\n       SUM(points) OVER (PARTITION BY player_id ORDER BY played_on) AS season_so_far\nFROM games\nORDER BY player_id, played_on;',
    }),
    query('easy', 'League by night', {
      prompt: "Show each night's `played_on`, its points (`night_points`) and the league's running total of points (`league_so_far`). Sort by date.",
      hint: 'Group by played_on, then `SUM(SUM(points)) OVER (ORDER BY played_on)`.',
      solution: 'SELECT played_on, SUM(points) AS night_points,\n       SUM(SUM(points)) OVER (ORDER BY played_on) AS league_so_far\nFROM games\nGROUP BY played_on\nORDER BY played_on;',
    }),
    query('easy', 'Best so far', {
      prompt: "Show each game's `player_id`, `played_on` and `points`, with the player's best score up to and including that game (`best_so_far`). Sort by player id, then date.",
      hint: '`MAX(points) OVER (PARTITION BY player_id ORDER BY played_on)`.',
      solution: 'SELECT player_id, played_on, points,\n       MAX(points) OVER (PARTITION BY player_id ORDER BY played_on) AS best_so_far\nFROM games\nORDER BY player_id, played_on;',
    }),
    query('medium', 'Average so far', {
      prompt: "Show each game's `player_id`, `played_on` and `points`, with the player's average so far (`average_so_far`, 1 decimal). Sort by player id, then date.",
      hint: '`ROUND(AVG(points) OVER (PARTITION BY player_id ORDER BY played_on), 1)`.',
      solution: 'SELECT player_id, played_on, points,\n       ROUND(AVG(points) OVER (PARTITION BY player_id ORDER BY played_on), 1) AS average_so_far\nFROM games\nORDER BY player_id, played_on;',
    }),
    query('medium', 'One game at a time', {
      prompt: "This running total should grow by one game at a time, but every game on a night shows the same value. Fix the window so it adds the games in date order, then id order.",
      starter: 'SELECT id, played_on, points,\n       SUM(points) OVER (ORDER BY played_on) AS running\nFROM games\nORDER BY id;',
      hint: 'Games on the same night tie, so they share the frame. Add `id` to the ORDER BY inside OVER.',
      solution: 'SELECT id, played_on, points,\n       SUM(points) OVER (ORDER BY played_on, id) AS running\nFROM games\nORDER BY id;',
    }),
    query('medium', 'Team race', {
      prompt: "For each team and night, show the `team`, `played_on`, the team's points that night (`team_points`) and its running total (`team_so_far`). Sort by team, then date.",
      hint: 'Join players, group by team and night, then `SUM(SUM(g.points)) OVER (PARTITION BY p.team ORDER BY g.played_on)`.',
      solution: 'SELECT p.team, g.played_on, SUM(g.points) AS team_points,\n       SUM(SUM(g.points)) OVER (PARTITION BY p.team ORDER BY g.played_on) AS team_so_far\nFROM games g\nJOIN players p ON p.id = g.player_id\nGROUP BY p.team, g.played_on\nORDER BY p.team, g.played_on;',
    }),
    query('hard', 'First to 100', {
      prompt: "Show the game in which each player's running total first reached 100 or more: `player_id`, `played_on` and `season_so_far`. Players who never reached 100 are left out. Sort by player id.",
      hint: 'Work out the running total in a subquery; keep rows where `season_so_far >= 100` but `season_so_far - points < 100`.',
      solution: 'SELECT player_id, played_on, season_so_far\nFROM (\n  SELECT player_id, played_on, points,\n         SUM(points) OVER (PARTITION BY player_id ORDER BY played_on) AS season_so_far\n  FROM games\n) AS g\nWHERE season_so_far >= 100 AND season_so_far - points < 100\nORDER BY player_id;',
    }),
    query('hard', 'How far through', {
      prompt: "Show each game's `player_id`, `played_on` and `points`, with the player's running total as a share of their whole season's total (`season_pct`, %, 1 decimal). Sort by player id, then date.",
      hint: 'Two windows: a running one with ORDER BY, and a whole-partition one without: `100.0 * SUM(points) OVER (PARTITION BY player_id ORDER BY played_on) / SUM(points) OVER (PARTITION BY player_id)`.',
      solution: 'SELECT player_id, played_on, points,\n       ROUND(100.0 * SUM(points) OVER (PARTITION BY player_id ORDER BY played_on)\n             / SUM(points) OVER (PARTITION BY player_id), 1) AS season_pct\nFROM games\nORDER BY player_id, played_on;',
    }),
    query('expert', 'Points per game so far', {
      prompt: "For each night, show `played_on`, the games played that night (`games`), the games played so far in the season (`games_so_far`) and the league's average points per game so far (`average_so_far`, 2 decimals). Sort by date.",
      hint: 'Group by night; `SUM(COUNT(*)) OVER (ORDER BY played_on)` counts the games so far. Divide the running points by it (times 1.0).',
      solution: 'SELECT played_on, COUNT(*) AS games,\n       SUM(COUNT(*)) OVER (ORDER BY played_on) AS games_so_far,\n       ROUND(1.0 * SUM(SUM(points)) OVER (ORDER BY played_on)\n             / SUM(COUNT(*)) OVER (ORDER BY played_on), 2) AS average_so_far\nFROM games\nGROUP BY played_on\nORDER BY played_on;',
    }),
    query('expert', 'Halfway there', {
      prompt: "Show the game in which each player passed half of their season's total (the running total is at least half the season total, but wasn't before that game): `player_id`, `played_on`, `season_so_far` and `season_total`. Sort by player id.",
      hint: 'In a subquery, work out the running total and the season total. Keep rows where `2 * season_so_far >= season_total` and `2 * (season_so_far - points) < season_total`.',
      solution: 'SELECT player_id, played_on, season_so_far, season_total\nFROM (\n  SELECT player_id, played_on, points,\n         SUM(points) OVER (PARTITION BY player_id ORDER BY played_on) AS season_so_far,\n         SUM(points) OVER (PARTITION BY player_id) AS season_total\n  FROM games\n) AS g\nWHERE 2 * season_so_far >= season_total AND 2 * (season_so_far - points) < season_total\nORDER BY player_id;',
    }),
  ],
  questions: [
    mc('What turns `SUM(points) OVER (…)` into a running total?', ['GROUP BY', 'A subquery', 'ORDER BY inside the OVER', 'PARTITION BY'], 2,
      'With an order, the frame runs from the start to the current row.'),
    mc('What does PARTITION BY player_id add to a running total?', ['It removes ties', 'Nothing', 'Each player\'s running total starts again from zero', 'It sorts the result'], 2,
      'One running total per player.'),
    mc('`SUM(points) OVER (ORDER BY played_on)`: what do two games on the same night show?', ['Different running totals', 'An error', 'The same total, the one after the whole night', 'NULL'], 2,
      'Rows that tie in the ORDER BY share the frame.'),
    mc('How do you make a running total grow one row at a time?', ['Use GROUP BY', 'Add DISTINCT', 'Use AVG', 'Make the ORDER BY inside OVER unique, for example by adding id'], 3,
      'Then no two rows tie.'),
    qShort('What is the set of rows a window function looks at for each row called? (one word)', 'frame',
      'With ORDER BY, the default frame runs from the start to the current row, and its ties.'),
    mc('What does `MAX(points) OVER (PARTITION BY player_id ORDER BY played_on)` give?', ['The best score so far', 'The season best', 'The latest score', 'The number of games'], 0,
      'Any aggregate can run.'),
    mc('How do you get the league\'s running total night by night?', ['SUM(points) OVER ()', 'GROUP BY played_on, then SUM(SUM(points)) OVER (ORDER BY played_on)', 'ORDER BY played_on only', 'COUNT(*) OVER ()'], 1,
      'Total each night, then run the window over the nights.'),
    mc('Without ORDER BY, what does `SUM(points) OVER (PARTITION BY player_id)` give?', ['The whole season total on every row', 'The first game\'s points', 'A running total', 'An error'], 0,
      'No order means the frame is the whole partition.'),
    mc('Which keeps only the game where a running total first reached 100?', ['LIMIT 1', 'running >= 100 AND running - points < 100, in an outer query', 'WHERE running = 100', 'HAVING running >= 100'], 1,
      'It reached 100 in this game, not before.'),
    mc('Can one query have a running window and a whole-partition window?', ['Only with GROUP BY', 'Only if they have the same ORDER BY', 'Yes, each OVER is worked out separately', 'No, only one OVER per query'], 2,
      'That is how you get "how far through the season".'),
  ],
})
