// Window functions: the section's projects (easy, medium, hard).
import { makeProject, mc, qShort, query, snippet } from './_builders.mjs'
import { WINDOWS_DB } from './windows-db.mjs'

// ---- League table -------------------------------------------------------------------------

const leagueTable = makeProject('easy', {
  id: 'proj_league_table',
  title: 'League table',
  database: WINDOWS_DB,
  paragraphs: [
    "You run the quiz league's noticeboard. Each challenge is one part of it: the standings, last night's results, the night winners, the team table, the gap to the leader and the most wins.",
    'Players on the same points share a place (RANK).',
  ],
  sandboxCode: 'SELECT p.name, SUM(g.points) AS total,\n       RANK() OVER (ORDER BY SUM(g.points) DESC) AS place\nFROM games g\nJOIN players p ON p.id = g.player_id\nGROUP BY p.id, p.name\nORDER BY place, p.name;',
  sandboxSnippets: [
    snippet('Standings', 'SELECT p.name, SUM(g.points) AS total,\n       RANK() OVER (ORDER BY SUM(g.points) DESC) AS place\nFROM games g\nJOIN players p ON p.id = g.player_id\nGROUP BY p.id, p.name\nORDER BY place, p.name;'),
  ],
  readMore: { label: 'SQLite: window functions', url: 'https://www.sqlite.org/windowfunctions.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Standings', {
      prompt: "Show each player's `name`, `team`, `games` played, season `total` and `place` (RANK by total). Sort by place, then name.",
      hint: 'Join players, group by player, `RANK() OVER (ORDER BY SUM(g.points) DESC)`.',
      solution: 'SELECT p.name, p.team, COUNT(*) AS games, SUM(g.points) AS total,\n       RANK() OVER (ORDER BY SUM(g.points) DESC) AS place\nFROM games g\nJOIN players p ON p.id = g.player_id\nGROUP BY p.id, p.name, p.team\nORDER BY place, p.name;',
    }),
    query('easy', 'Last night', {
      prompt: "For the latest quiz night, show each player's `name`, `points` and `place` (RANK). Sort by place, then name.",
      hint: "`WHERE g.played_on = (SELECT MAX(played_on) FROM games)`, then RANK over what's left.",
      solution: 'SELECT p.name, g.points,\n       RANK() OVER (ORDER BY g.points DESC) AS place\nFROM games g\nJOIN players p ON p.id = g.player_id\nWHERE g.played_on = (SELECT MAX(played_on) FROM games)\nORDER BY place, p.name;',
    }),
    query('medium', 'Night winners', {
      prompt: "Show the winner or winners of every night: `played_on`, `name` and `points`. Sort by date, then name.",
      hint: 'RANK per night in a CTE, keep place 1.',
      solution: 'WITH ranked AS (\n  SELECT g.played_on, p.name, g.points,\n         RANK() OVER (PARTITION BY g.played_on ORDER BY g.points DESC) AS place\n  FROM games g\n  JOIN players p ON p.id = g.player_id\n)\nSELECT played_on, name, points\nFROM ranked\nWHERE place = 1\nORDER BY played_on, name;',
    }),
    query('medium', 'Team table', {
      prompt: "Show each `team`, its season points (`total`), how many players it has used (`players`) and its `place` (RANK by total). Sort by place, then team.",
      hint: 'Group by team; `COUNT(DISTINCT g.player_id)` counts the players.',
      solution: 'SELECT p.team, SUM(g.points) AS total, COUNT(DISTINCT g.player_id) AS players,\n       RANK() OVER (ORDER BY SUM(g.points) DESC) AS place\nFROM games g\nJOIN players p ON p.id = g.player_id\nGROUP BY p.team\nORDER BY place, p.team;',
    }),
    query('hard', 'Behind the leader', {
      prompt: "Show each player's `name`, season `total`, and how many points behind the top total they are (`behind`; 0 for the leader). Sort by total (highest first), then name.",
      hint: '`MAX(SUM(g.points)) OVER () - SUM(g.points)`.',
      solution: 'SELECT p.name, SUM(g.points) AS total,\n       MAX(SUM(g.points)) OVER () - SUM(g.points) AS behind\nFROM games g\nJOIN players p ON p.id = g.player_id\nGROUP BY p.id, p.name\nORDER BY total DESC, p.name;',
    }),
    query('hard', 'Most wins', {
      prompt: "Show each player who won at least one night (shared wins count): `name` and `wins`. Sort by wins (most first), then name.",
      hint: 'RANK per night in a CTE, keep place 1, then group by player and count.',
      solution: 'WITH ranked AS (\n  SELECT player_id,\n         RANK() OVER (PARTITION BY played_on ORDER BY points DESC) AS place\n  FROM games\n)\nSELECT p.name, COUNT(*) AS wins\nFROM ranked r\nJOIN players p ON p.id = r.player_id\nWHERE r.place = 1\nGROUP BY p.id, p.name\nORDER BY wins DESC, p.name;',
    }),
  ],
  questions: [
    mc('Two players finish on 201 points at the top. With RANK, what is the next player\'s place?', ['2', '1', '4', '3'], 3,
      'RANK skips after a tie.'),
    mc('Why does "Last night" work with WHERE and a window together?', ['It doesn\'t; it needs a subquery', 'WHERE runs after the window', 'WHERE keeps last night\'s rows first, and the window ranks only those', 'The window ignores WHERE'], 2,
      'Windows are worked out after WHERE.'),
    mc('Why RANK, not ROW_NUMBER, for night winners?', ['Shared wins should all be kept', 'ROW_NUMBER skips the first row', 'RANK is faster', 'ROW_NUMBER needs PARTITION BY'], 0,
      'ROW_NUMBER would keep only one of two tied winners.'),
    mc('What does `MAX(SUM(g.points)) OVER ()` give in a grouped query?', ['The highest player total, on every row', 'The best single game', 'Each player\'s total', 'An error'], 0,
      'The window runs over the grouped rows.'),
    qShort('Which ranking function lets tied players share a place and skips the next place?', 'RANK',
      '`RANK() OVER (ORDER BY …)`.'),
    mc('How does "Most wins" count wins?', ['Ranks each night, keeps the first places, then counts them per player', 'MAX(points) per player', 'COUNT(*) of games', 'ROW_NUMBER = 1 per player'], 0,
      'A window first, then GROUP BY on its result.'),
  ],
})

// ---- Player form report ------------------------------------------------------------------

const formReport = makeProject('medium', {
  id: 'proj_form_report',
  title: 'Player form report',
  database: WINDOWS_DB,
  paragraphs: [
    'Team captains want to know who is in form. Build the report one table at a time: every game in order, the change from game to game, a rolling average, each player\'s best night, who is above their average now, and who has improved.',
    'Every challenge lists players by name.',
  ],
  sandboxCode: 'SELECT p.name, g.played_on, g.points,\n       ROW_NUMBER() OVER (PARTITION BY g.player_id ORDER BY g.played_on) AS game_no\nFROM games g\nJOIN players p ON p.id = g.player_id\nORDER BY p.name, g.played_on;',
  sandboxSnippets: [
    snippet('Game log', 'SELECT p.name, g.played_on, g.points,\n       ROW_NUMBER() OVER (PARTITION BY g.player_id ORDER BY g.played_on) AS game_no\nFROM games g\nJOIN players p ON p.id = g.player_id\nORDER BY p.name, g.played_on;'),
  ],
  readMore: { label: 'SQLite: built-in window functions', url: 'https://www.sqlite.org/windowfunctions.html#builtins', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Game log', {
      prompt: "Show every game's player `name`, `played_on`, `points` and the player's game number (`game_no`, 1 for their first). Sort by name, then date.",
      hint: '`ROW_NUMBER() OVER (PARTITION BY g.player_id ORDER BY g.played_on)`.',
      solution: 'SELECT p.name, g.played_on, g.points,\n       ROW_NUMBER() OVER (PARTITION BY g.player_id ORDER BY g.played_on) AS game_no\nFROM games g\nJOIN players p ON p.id = g.player_id\nORDER BY p.name, g.played_on;',
    }),
    query('medium', 'Up or down', {
      prompt: "Show every game's `name`, `played_on`, `points` and the change since the player's previous game (`change`). Sort by name, then date.",
      hint: '`g.points - LAG(g.points) OVER (PARTITION BY g.player_id ORDER BY g.played_on)`.',
      solution: 'SELECT p.name, g.played_on, g.points,\n       g.points - LAG(g.points) OVER (PARTITION BY g.player_id ORDER BY g.played_on) AS change\nFROM games g\nJOIN players p ON p.id = g.player_id\nORDER BY p.name, g.played_on;',
    }),
    query('medium', 'Rolling form', {
      prompt: "Show every game's `name`, `played_on`, `points` and the average of the player's last three games, this one included (`form`, 1 decimal). Sort by name, then date.",
      hint: '`ROWS BETWEEN 2 PRECEDING AND CURRENT ROW`.',
      solution: 'SELECT p.name, g.played_on, g.points,\n       ROUND(AVG(g.points) OVER (PARTITION BY g.player_id ORDER BY g.played_on\n                                 ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 1) AS form\nFROM games g\nJOIN players p ON p.id = g.player_id\nORDER BY p.name, g.played_on;',
    }),
    query('medium', 'Best night', {
      prompt: "Show each player's best game (on a tie, the earlier one): `name`, `played_on` and `points`. Sort by name.",
      hint: 'ROW_NUMBER per player by points DESC, then date; keep 1.',
      solution: 'WITH ranked AS (\n  SELECT g.player_id, g.played_on, g.points,\n         ROW_NUMBER() OVER (PARTITION BY g.player_id ORDER BY g.points DESC, g.played_on) AS n\n  FROM games g\n)\nSELECT p.name, r.played_on, r.points\nFROM ranked r\nJOIN players p ON p.id = r.player_id\nWHERE r.n = 1\nORDER BY p.name;',
    }),
    query('hard', 'In form now', {
      prompt: "Show the players whose latest game beat their own season average: `name`, the latest points (`latest`) and the season average (`average`, 1 decimal). Sort by name.",
      hint: 'In a CTE: ROW_NUMBER newest first and `AVG(points) OVER (PARTITION BY player_id)`. Keep `n = 1 AND points > average`.',
      solution: 'WITH g AS (\n  SELECT player_id, points,\n         ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY played_on DESC) AS n,\n         AVG(points) OVER (PARTITION BY player_id) AS average\n  FROM games\n)\nSELECT p.name, g.points AS latest, ROUND(g.average, 1) AS average\nFROM g\nJOIN players p ON p.id = g.player_id\nWHERE g.n = 1 AND g.points > g.average\nORDER BY p.name;',
    }),
    query('hard', 'Improvers', {
      prompt: "Compare each player's first two games with their last two: show `name`, the points of the first two (`first_two`) and of the last two (`last_two`), only for players whose last two scored more. Sort by name.",
      hint: 'Number each player\'s games both ways (oldest first and newest first) in a CTE; then group with `SUM(CASE WHEN first_no <= 2 THEN points END)` and the same for the last two, and keep the improvers with HAVING.',
      solution: 'WITH numbered AS (\n  SELECT player_id, points,\n         ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY played_on) AS first_no,\n         ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY played_on DESC) AS last_no\n  FROM games\n)\nSELECT p.name,\n       SUM(CASE WHEN n.first_no <= 2 THEN n.points END) AS first_two,\n       SUM(CASE WHEN n.last_no <= 2 THEN n.points END) AS last_two\nFROM numbered n\nJOIN players p ON p.id = n.player_id\nGROUP BY p.id, p.name\nHAVING last_two > first_two\nORDER BY p.name;',
    }),
  ],
  questions: [
    mc('Which gives each player\'s game number?', ['RANK() OVER (ORDER BY points)', 'LAG(played_on)', 'ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY played_on)', 'COUNT(*)'], 2,
      'Numbering starts again for each player.'),
    mc('What is `change` on a player\'s first game?', ['Their points', 'An error', '0', 'NULL'], 3,
      'LAG has no row before it.'),
    mc('Which frame gives the last three games?', ['ROWS BETWEEN 2 PRECEDING AND CURRENT ROW', 'ROWS BETWEEN CURRENT ROW AND 2 FOLLOWING', 'ROWS BETWEEN 3 PRECEDING AND CURRENT ROW', 'RANGE 3'], 0,
      'Two before, plus this one.'),
    mc('Why add `g.played_on` after `points DESC` in "Best night"?', ['So a tie for the best always picks the earlier night', 'To sort the result', 'ROW_NUMBER needs two columns', 'To group by date'], 0,
      'ROW_NUMBER needs an order that doesn\'t tie.'),
    qShort('Which clause keeps only the groups whose last two games scored more? (one word)', 'HAVING',
      'It filters after GROUP BY.'),
    mc('How does "Improvers" find the last two games?', ['ROW_NUMBER newest first, then <= 2', 'LIMIT 2', 'MAX(played_on)', 'LAG(points, 2)'], 0,
      'Numbering the other way round.'),
  ],
})

// ---- Season review -----------------------------------------------------------------------

const seasonReview = makeProject('hard', {
  id: 'proj_season_review',
  title: 'Season review',
  database: WINDOWS_DB,
  paragraphs: [
    'The season is over, and the league wants a review: the league\'s points night by night, each month\'s top scorer, the most consistent players, comebacks after missed nights, the teams on each night, and a summary card for every player.',
    'Each challenge needs more than one window, or a window and a GROUP BY together.',
  ],
  sandboxCode: 'SELECT played_on, SUM(points) AS night_points,\n       SUM(SUM(points)) OVER (ORDER BY played_on) AS league_so_far\nFROM games\nGROUP BY played_on\nORDER BY played_on;',
  sandboxSnippets: [
    snippet('League by night', 'SELECT played_on, SUM(points) AS night_points,\n       SUM(SUM(points)) OVER (ORDER BY played_on) AS league_so_far\nFROM games\nGROUP BY played_on\nORDER BY played_on;'),
  ],
  readMore: { label: 'SQLite: window functions', url: 'https://www.sqlite.org/windowfunctions.html', source: 'SQLite documentation' },
  challenges: [
    query('medium', 'Night by night', {
      prompt: "Show each night's number (`night`, 1 for the first), `played_on`, its points (`night_points`), the change from the night before (`change`) and the league's running total (`league_so_far`). Sort by date.",
      hint: 'Group by played_on; ROW_NUMBER, LAG and a running SUM, all ordered by played_on.',
      solution: 'SELECT ROW_NUMBER() OVER (ORDER BY played_on) AS night, played_on,\n       SUM(points) AS night_points,\n       SUM(points) - LAG(SUM(points)) OVER (ORDER BY played_on) AS change,\n       SUM(SUM(points)) OVER (ORDER BY played_on) AS league_so_far\nFROM games\nGROUP BY played_on\nORDER BY played_on;',
    }),
    query('hard', 'Top of the month', {
      prompt: "For each month (`month`, like `2026-09`), show its top scorer or scorers by points that month: `month`, `name` and `month_points`. Sort by month, then name.",
      hint: "Group by month and player in a CTE (`strftime('%Y-%m', played_on)`), RANK within each month, keep 1.",
      solution: "WITH monthly AS (\n  SELECT strftime('%Y-%m', g.played_on) AS month, p.name, SUM(g.points) AS month_points,\n         RANK() OVER (PARTITION BY strftime('%Y-%m', g.played_on) ORDER BY SUM(g.points) DESC) AS place\n  FROM games g\n  JOIN players p ON p.id = g.player_id\n  GROUP BY month, p.id, p.name\n)\nSELECT month, name, month_points\nFROM monthly\nWHERE place = 1\nORDER BY month, name;",
    }),
    query('hard', 'Most consistent', {
      prompt: "Show each player's `name`, `best` and `worst` scores, the `spread` between them, and `place` (DENSE_RANK by spread, smallest first). Sort by place, then name.",
      hint: 'Group by player; `DENSE_RANK() OVER (ORDER BY MAX(g.points) - MIN(g.points))`.',
      solution: 'SELECT p.name, MAX(g.points) AS best, MIN(g.points) AS worst,\n       MAX(g.points) - MIN(g.points) AS spread,\n       DENSE_RANK() OVER (ORDER BY MAX(g.points) - MIN(g.points)) AS place\nFROM games g\nJOIN players p ON p.id = g.player_id\nGROUP BY p.id, p.name\nORDER BY place, p.name;',
    }),
    query('hard', 'Comebacks', {
      prompt: "Show the games a player played after missing one or more nights, in which they scored above their own season average: `name`, `played_on`, `points` and `missed` (nights missed just before). Sort by name, then date.",
      hint: 'CTE 1: DENSE_RANK night numbers. CTE 2: `night - LAG(night) OVER (…) - 1 AS missed` and `AVG(points) OVER (PARTITION BY player_id) AS average`. Keep `missed > 0 AND points > average`.',
      solution: 'WITH numbered AS (\n  SELECT player_id, played_on, points,\n         DENSE_RANK() OVER (ORDER BY played_on) AS night\n  FROM games\n),\nchecked AS (\n  SELECT player_id, played_on, points,\n         night - LAG(night) OVER (PARTITION BY player_id ORDER BY played_on) - 1 AS missed,\n         AVG(points) OVER (PARTITION BY player_id) AS average\n  FROM numbered\n)\nSELECT p.name, c.played_on, c.points, c.missed\nFROM checked c\nJOIN players p ON p.id = c.player_id\nWHERE c.missed > 0 AND c.points > c.average\nORDER BY p.name, c.played_on;',
    }),
    query('hard', 'Teams each night', {
      prompt: "For each night and team, show `played_on`, `team`, the team's points (`team_points`), its share of the night's points (`share`, %, 1 decimal) and its `place` that night (RANK). Sort by date, then place, then team.",
      hint: 'Group by night and team; `SUM(SUM(g.points)) OVER (PARTITION BY g.played_on)` is the night total.',
      solution: 'SELECT g.played_on, p.team, SUM(g.points) AS team_points,\n       ROUND(100.0 * SUM(g.points) / SUM(SUM(g.points)) OVER (PARTITION BY g.played_on), 1) AS share,\n       RANK() OVER (PARTITION BY g.played_on ORDER BY SUM(g.points) DESC) AS place\nFROM games g\nJOIN players p ON p.id = g.player_id\nGROUP BY g.played_on, p.team\nORDER BY g.played_on, place, p.team;',
    }),
    query('hard', 'Player cards', {
      prompt: "Show one card per player: `name`, season `total`, `place` (RANK by total), their `best` score, the date of their best game (`best_on`, the earlier on a tie) and their latest three-game average (`form`, 1 decimal). Sort by place, then name.",
      hint: 'In a CTE, per game: ROW_NUMBER by points DESC then date (`best_no`), ROW_NUMBER newest first (`latest_no`) and the 3-game moving average. Then group by player, picking values with `MAX(CASE WHEN … THEN … END)`, and RANK by `SUM(points)`.',
      solution: 'WITH g AS (\n  SELECT player_id, played_on, points,\n         ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY points DESC, played_on) AS best_no,\n         ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY played_on DESC) AS latest_no,\n         AVG(points) OVER (PARTITION BY player_id ORDER BY played_on\n                           ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS last3\n  FROM games\n)\nSELECT p.name, SUM(g.points) AS total,\n       RANK() OVER (ORDER BY SUM(g.points) DESC) AS place,\n       MAX(g.points) AS best,\n       MAX(CASE WHEN g.best_no = 1 THEN g.played_on END) AS best_on,\n       ROUND(MAX(CASE WHEN g.latest_no = 1 THEN g.last3 END), 1) AS form\nFROM g\nJOIN players p ON p.id = g.player_id\nGROUP BY p.id, p.name\nORDER BY place, p.name;',
    }),
  ],
  questions: [
    mc('Can ROW_NUMBER, LAG and a running SUM all run over the same grouped rows?', ['Only without GROUP BY', 'Yes, each OVER is worked out on its own', 'No, only one window per query', 'Only with a named window'], 1,
      'They all see the nights as rows.'),
    mc("Why PARTITION BY strftime('%Y-%m', played_on) for the month's top scorer?", ['To sort by month', 'So each month is ranked separately', 'To group the games', 'It is needed by RANK'], 1,
      'Each month gets its own place 1.'),
    mc('Why DENSE_RANK for "Most consistent"?', ['It is faster', 'RANK can\'t sort ascending', 'Places stay 1, 2, 3, … with no gaps after equal spreads', 'DENSE_RANK removes ties'], 2,
      'Equal spreads share a place, and the next place follows on.'),
    mc('How does "Comebacks" find missed nights?', ['By the number of days', 'With COUNT(*)', 'By ROW_NUMBER only', 'Night numbers from DENSE_RANK, then the gap to the previous night with LAG'], 3,
      'A gap of more than one night means nights were missed.'),
    qShort("Which aggregate, over `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW`, gives the three-game average? (one word)", 'AVG',
      '`AVG(points) OVER (… ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)`.'),
    mc('How does a player card pick the date of the best game after GROUP BY?', ['`played_on` on its own', '`MAX(CASE WHEN best_no = 1 THEN played_on END)`', '`MAX(played_on)`', '`FIRST(played_on)`'], 1,
      'Only the best game\'s date is not NULL, so MAX picks it.'),
  ],
})

export const windowsProjects = [leagueTable, formReport, seasonReview]
