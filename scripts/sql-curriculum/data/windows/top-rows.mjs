// Window functions: The top rows in each group.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { WINDOWS_DB } from '../windows-db.mjs'

export default makeTopic({
  id: 'top_rows_per_group',
  title: 'The top rows in each group',
  database: WINDOWS_DB,
  paragraphs: [
    'The subqueries section found "the top row in each group" with correlated subqueries. Window functions make it shorter and easier to read: number or rank the rows within each group, then keep the first few.',
    '```\nWITH ranked AS (\n  SELECT player_id, played_on, points,\n         ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY points DESC, played_on) AS n\n  FROM games\n)\nSELECT player_id, played_on, points\nFROM ranked\nWHERE n = 1\nORDER BY player_id;\n```',
    "That is each player's best game, with ties going to the earlier night. Change `n = 1` to `n <= 3` for each player's top three.",
    "Choose the function by what should happen with ties. `ROW_NUMBER` keeps exactly as many rows as you ask for, so it needs a tie-breaker that decides which tied row wins. `RANK` keeps every tied row, so `rank <= 3` can return more than three rows. `DENSE_RANK` with `= 2` finds everyone on the second-best score.",
    'The ranking can run over groups from `GROUP BY` too: total the points per team and night first, then rank the nights within each team.',
  ],
  sandboxCode: 'WITH ranked AS (\n  SELECT player_id, played_on, points,\n         ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY points DESC, played_on) AS n\n  FROM games\n)\nSELECT player_id, played_on, points\nFROM ranked\nWHERE n = 1\nORDER BY player_id;',
  sandboxSnippets: [
    snippet('Best game each', 'WITH ranked AS (\n  SELECT player_id, played_on, points,\n         ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY points DESC, played_on) AS n\n  FROM games\n)\nSELECT player_id, played_on, points\nFROM ranked\nWHERE n = 1\nORDER BY player_id;'),
    snippet('Top three, ties kept', 'WITH ranked AS (\n  SELECT id, points, RANK() OVER (ORDER BY points DESC) AS place FROM games\n)\nSELECT id, points, place FROM ranked WHERE place <= 3 ORDER BY place, id;'),
  ],
  readMore: { label: 'SQLite: window functions', url: 'https://www.sqlite.org/windowfunctions.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Night winners', {
      prompt: "Show each night's winner or winners: `played_on`, `player_id` and `points`. Use RANK in a CTE. Sort by date, then player id.",
      hint: '`WITH ranked AS (… RANK() OVER (PARTITION BY played_on ORDER BY points DESC) AS place …) … WHERE place = 1`.',
      solution: 'WITH ranked AS (\n  SELECT played_on, player_id, points,\n         RANK() OVER (PARTITION BY played_on ORDER BY points DESC) AS place\n  FROM games\n)\nSELECT played_on, player_id, points\nFROM ranked\nWHERE place = 1\nORDER BY played_on, player_id;',
    }),
    query('easy', 'Best game each', {
      prompt: "Show each player's best game (if two tie, the earlier one): `player_id`, `played_on` and `points`. Sort by player id.",
      hint: '`ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY points DESC, played_on)`, keep n = 1.',
      solution: 'WITH ranked AS (\n  SELECT player_id, played_on, points,\n         ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY points DESC, played_on) AS n\n  FROM games\n)\nSELECT player_id, played_on, points\nFROM ranked\nWHERE n = 1\nORDER BY player_id;',
    }),
    query('easy', 'Top three, ties kept', {
      prompt: "Show the games in the top three places by points, keeping ties: `id`, `points` and `place` (RANK). Sort by place, then id.",
      hint: '`RANK() OVER (ORDER BY points DESC)`, keep `place <= 3`.',
      solution: 'WITH ranked AS (\n  SELECT id, points, RANK() OVER (ORDER BY points DESC) AS place\n  FROM games\n)\nSELECT id, points, place\nFROM ranked\nWHERE place <= 3\nORDER BY place, id;',
    }),
    query('medium', 'Top two of each team', {
      prompt: "Show the two players with the highest season totals in each team (ties broken by name): `team`, `name`, `total`. Sort by team, then highest total, then name.",
      hint: 'Group by player in the CTE with `ROW_NUMBER() OVER (PARTITION BY p.team ORDER BY SUM(g.points) DESC, p.name)`.',
      solution: 'WITH totals AS (\n  SELECT p.team, p.name, SUM(g.points) AS total,\n         ROW_NUMBER() OVER (PARTITION BY p.team ORDER BY SUM(g.points) DESC, p.name) AS n\n  FROM games g\n  JOIN players p ON p.id = g.player_id\n  GROUP BY p.id, p.team, p.name\n)\nSELECT team, name, total\nFROM totals\nWHERE n <= 2\nORDER BY team, total DESC, name;',
    }),
    query('medium', 'Last two games', {
      prompt: "Show each player's two most recent games: `player_id`, `played_on` and `points`. Sort by player id, then date.",
      hint: 'Number newest first, keep n <= 2.',
      solution: 'WITH ranked AS (\n  SELECT player_id, played_on, points,\n         ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY played_on DESC) AS n\n  FROM games\n)\nSELECT player_id, played_on, points\nFROM ranked\nWHERE n <= 2\nORDER BY player_id, played_on;',
    }),
    query('medium', 'Bottom of the night', {
      prompt: "Show each night's lowest scorer or scorers: `played_on`, `player_id`, `points`. Sort by date, then player id.",
      hint: 'RANK with `ORDER BY points` (lowest first), keep 1.',
      solution: 'WITH ranked AS (\n  SELECT played_on, player_id, points,\n         RANK() OVER (PARTITION BY played_on ORDER BY points) AS place\n  FROM games\n)\nSELECT played_on, player_id, points\nFROM ranked\nWHERE place = 1\nORDER BY played_on, player_id;',
    }),
    query('hard', "Each team's best night", {
      prompt: "Show each team's best night (highest team total; if two tie, the earlier night): `team`, `played_on`, `team_points`. Sort by team.",
      hint: 'Group by team and night in the CTE, ROW_NUMBER per team by `SUM(points) DESC, played_on`.',
      solution: 'WITH nights AS (\n  SELECT p.team, g.played_on, SUM(g.points) AS team_points,\n         ROW_NUMBER() OVER (PARTITION BY p.team ORDER BY SUM(g.points) DESC, g.played_on) AS n\n  FROM games g\n  JOIN players p ON p.id = g.player_id\n  GROUP BY p.team, g.played_on\n)\nSELECT team, played_on, team_points\nFROM nights\nWHERE n = 1\nORDER BY team;',
    }),
    query('hard', 'Second best', {
      prompt: "Show each player's second-best score (the next score below their best, whatever how many games share the best): `player_id` and `points`, once per player. Players with only one distinct score are left out. Sort by player id.",
      hint: '`DENSE_RANK() OVER (PARTITION BY player_id ORDER BY points DESC)`, keep 2, and use DISTINCT.',
      solution: 'WITH ranked AS (\n  SELECT player_id, points,\n         DENSE_RANK() OVER (PARTITION BY player_id ORDER BY points DESC) AS place\n  FROM games\n)\nSELECT DISTINCT player_id, points\nFROM ranked\nWHERE place = 2\nORDER BY player_id;',
    }),
    query('expert', 'Finished on a high', {
      prompt: "Show the players whose latest game was also their best score (their latest points equal their season maximum): `player_id`, `played_on`, `points`. Sort by player id.",
      hint: 'In the CTE: `ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY played_on DESC) AS n` and `MAX(points) OVER (PARTITION BY player_id) AS best`. Keep `n = 1 AND points = best`.',
      solution: 'WITH g AS (\n  SELECT player_id, played_on, points,\n         ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY played_on DESC) AS n,\n         MAX(points) OVER (PARTITION BY player_id) AS best\n  FROM games\n)\nSELECT player_id, played_on, points\nFROM g\nWHERE n = 1 AND points = best\nORDER BY player_id;',
    }),
    query('expert', 'Winning margin', {
      prompt: "For each night, show the winning score (`first`), the runner-up score (`second`, the second row when sorted by points, so a tie gives 0 margin) and the `margin` between them. Sort by date.",
      hint: 'ROW_NUMBER per night by points DESC (ties by player id); then group by night with `MAX(CASE WHEN n = 1 THEN points END)` and the same for n = 2.',
      solution: 'WITH ranked AS (\n  SELECT played_on, points,\n         ROW_NUMBER() OVER (PARTITION BY played_on ORDER BY points DESC, player_id) AS n\n  FROM games\n)\nSELECT played_on,\n       MAX(CASE WHEN n = 1 THEN points END) AS first,\n       MAX(CASE WHEN n = 2 THEN points END) AS second,\n       MAX(CASE WHEN n = 1 THEN points END) - MAX(CASE WHEN n = 2 THEN points END) AS margin\nFROM ranked\nGROUP BY played_on\nORDER BY played_on;',
    }),
  ],
  questions: [
    mc('What is the usual pattern for "top N in each group"?', ['ORDER BY with LIMIT', 'A self-join only', 'Rank or number within PARTITION BY in a CTE, then filter outside', 'GROUP BY with LIMIT'], 2,
      'WHERE can\'t use the window directly, so it goes in a CTE or subquery.'),
    mc('Two games tie for a player\'s best. Which keeps exactly one of them?', ['RANK = 1', 'ROW_NUMBER = 1 with a tie-breaker', 'DENSE_RANK = 1', 'MAX(points)'], 1,
      'The tie-breaker decides which one.'),
    mc('Can `RANK <= 3` return more than three rows?', ['Only with DENSE_RANK', 'No', 'Only with PARTITION BY', 'Yes, when rows tie'], 3,
      'Tied rows all keep their place.'),
    mc('Which finds everyone on the second-best score?', ['ROW_NUMBER = 2', 'RANK = 2', 'MAX - 1', 'DENSE_RANK = 2'], 3,
      'With RANK, a tie for first means nobody is ranked 2.'),
    qShort('Which keyword starts a named subquery that holds the ranked rows?', 'WITH',
      '`WITH ranked AS (…) SELECT … FROM ranked WHERE …`.'),
    mc('How do you get each player\'s two latest games?', ['ROW_NUMBER by played_on DESC per player, keep n <= 2', 'ORDER BY played_on DESC LIMIT 2', 'MAX(played_on)', 'RANK by points'], 0,
      'LIMIT would keep two rows in total, not two per player.'),
    mc('Can you rank groups from GROUP BY within a partition?', ['Yes, like ranking each team\'s nights by team total', 'Only with DISTINCT', 'Only one group', 'No'], 0,
      'The window runs over the grouped rows.'),
    mc('How does the window version compare with the correlated subquery from the subqueries section?', ['It gives different answers', 'It needs no ORDER BY', 'It is usually shorter and clearer', 'It can\'t handle ties'], 2,
      'Both work; windows say it more directly.'),
    mc('Why ROW_NUMBER, not RANK, for the winning margin?', ['RANK needs DISTINCT', 'So there is always a row 2, even when the top two tie', 'RANK is slower', 'RANK can\'t partition'], 1,
      'With RANK, a tie for first leaves no rank 2.'),
    mc('What does `MAX(CASE WHEN n = 1 THEN points END)` do after numbering?', ['Picks the points of row 1 in each group', 'Finds the largest n', 'Counts the winners', 'Gives an error'], 0,
      'A conditional aggregate turns rows into columns.'),
  ],
})
