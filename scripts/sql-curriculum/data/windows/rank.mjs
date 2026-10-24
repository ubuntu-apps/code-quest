// Window functions: RANK and DENSE_RANK.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { WINDOWS_DB } from '../windows-db.mjs'

export default makeTopic({
  id: 'rank_dense_rank',
  title: 'Rankings: RANK and DENSE_RANK',
  database: WINDOWS_DB,
  paragraphs: [
    "In a quiz, two players on the same score share a place. `RANK()` does that: rows that tie in the `ORDER BY` get the same rank, and the next rank skips ahead, like 1, 2, 2, 4. `DENSE_RANK()` doesn't skip: 1, 2, 2, 3.",
    '```\nSELECT player_id, points,\n       ROW_NUMBER() OVER (ORDER BY points DESC, player_id) AS row_no,\n       RANK() OVER (ORDER BY points DESC) AS rank,\n       DENSE_RANK() OVER (ORDER BY points DESC) AS dense_rank\nFROM games\nWHERE played_on = (SELECT MIN(played_on) FROM games)\nORDER BY points DESC, player_id;\n```',
    "On the first night, Ada and Cora both scored 42: `RANK` puts both first and the next player third, `DENSE_RANK` puts the next player second, and `ROW_NUMBER` still numbers them 1 and 2.",
    'Which to use depends on the question. Sports tables usually use `RANK`. `DENSE_RANK` answers "the second-best score" when two people tie for the best. `ROW_NUMBER` is for when you need exactly one row per number.',
    "Unlike `ROW_NUMBER`, ranks don't need a tie-breaker to be reliable: tied rows get the same rank whatever order they come in. With `PARTITION BY`, each group is ranked on its own, such as the places on each night.",
    'Ranks work on grouped rows too: rank players by season total with `RANK() OVER (ORDER BY SUM(points) DESC)`.',
  ],
  sandboxCode: 'SELECT player_id, points,\n       ROW_NUMBER() OVER (ORDER BY points DESC, player_id) AS row_no,\n       RANK() OVER (ORDER BY points DESC) AS rank,\n       DENSE_RANK() OVER (ORDER BY points DESC) AS dense_rank\nFROM games\nWHERE played_on = (SELECT MIN(played_on) FROM games)\nORDER BY points DESC, player_id;',
  sandboxSnippets: [
    snippet('Three ways', 'SELECT player_id, points,\n       ROW_NUMBER() OVER (ORDER BY points DESC, player_id) AS row_no,\n       RANK() OVER (ORDER BY points DESC) AS rank,\n       DENSE_RANK() OVER (ORDER BY points DESC) AS dense_rank\nFROM games\nWHERE played_on = (SELECT MIN(played_on) FROM games)\nORDER BY points DESC, player_id;'),
    snippet('Places each night', 'SELECT played_on, player_id, points,\n       RANK() OVER (PARTITION BY played_on ORDER BY points DESC) AS place\nFROM games\nORDER BY played_on, place, player_id;'),
    snippet('Season table', 'SELECT player_id, SUM(points) AS total,\n       RANK() OVER (ORDER BY SUM(points) DESC) AS place\nFROM games\nGROUP BY player_id\nORDER BY place, player_id;'),
  ],
  readMore: { label: 'SQLite: built-in window functions', url: 'https://www.sqlite.org/windowfunctions.html#builtins', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Best games ever', {
      prompt: "Show every game's `id`, `player_id` and `points`, ranked from the highest points with `RANK` (`place`). Sort by `place`, then id.",
      hint: '`RANK() OVER (ORDER BY points DESC) AS place`.',
      solution: 'SELECT id, player_id, points, RANK() OVER (ORDER BY points DESC) AS place\nFROM games\nORDER BY place, id;',
    }),
    query('easy', 'Without gaps', {
      prompt: "The same, but with `DENSE_RANK`, so the places have no gaps (`place`). Sort by `place`, then id.",
      hint: '`DENSE_RANK() OVER (ORDER BY points DESC)`.',
      solution: 'SELECT id, player_id, points, DENSE_RANK() OVER (ORDER BY points DESC) AS place\nFROM games\nORDER BY place, id;',
    }),
    query('easy', 'Places each night', {
      prompt: "Show each game's `played_on`, `player_id` and `points`, with its `RANK` within that night (`place`). Sort by date, then place, then player id.",
      hint: '`RANK() OVER (PARTITION BY played_on ORDER BY points DESC)`.',
      solution: 'SELECT played_on, player_id, points,\n       RANK() OVER (PARTITION BY played_on ORDER BY points DESC) AS place\nFROM games\nORDER BY played_on, place, player_id;',
    }),
    query('medium', 'League table', {
      prompt: "Show each player's `name`, season total (`total`) and `RANK` by total (`place`). Sort by place, then name.",
      hint: 'Join players, group by player, then `RANK() OVER (ORDER BY SUM(g.points) DESC)`.',
      solution: 'SELECT p.name, SUM(g.points) AS total,\n       RANK() OVER (ORDER BY SUM(g.points) DESC) AS place\nFROM games g\nJOIN players p ON p.id = g.player_id\nGROUP BY p.id, p.name\nORDER BY place, p.name;',
    }),
    query('medium', 'All three', {
      prompt: "For the first quiz night, show each `player_id` and `points`, with `row_no` (ROW_NUMBER, ties by player id), `rank` (RANK) and `dense_rank` (DENSE_RANK), all from the highest points. Sort by points (highest first), then player id.",
      hint: 'The lesson\'s example: three window functions over the same ORDER BY.',
      solution: 'SELECT player_id, points,\n       ROW_NUMBER() OVER (ORDER BY points DESC, player_id) AS row_no,\n       RANK() OVER (ORDER BY points DESC) AS rank,\n       DENSE_RANK() OVER (ORDER BY points DESC) AS dense_rank\nFROM games\nWHERE played_on = (SELECT MIN(played_on) FROM games)\nORDER BY points DESC, player_id;',
    }),
    query('medium', 'Within the team', {
      prompt: "Show each player's `team`, `name` and season total (`total`), with their `RANK` within their team (`team_place`). Sort by team, then team place, then name.",
      hint: '`RANK() OVER (PARTITION BY p.team ORDER BY SUM(g.points) DESC)`.',
      solution: 'SELECT p.team, p.name, SUM(g.points) AS total,\n       RANK() OVER (PARTITION BY p.team ORDER BY SUM(g.points) DESC) AS team_place\nFROM games g\nJOIN players p ON p.id = g.player_id\nGROUP BY p.id, p.team, p.name\nORDER BY p.team, team_place, p.name;',
    }),
    query('hard', 'Winners', {
      prompt: "Show each night's winner (or winners, if they tied): `played_on`, `player_id` and `points`. Sort by date, then player id.",
      hint: 'RANK per night in a subquery, then `WHERE place = 1`.',
      solution: 'SELECT played_on, player_id, points\nFROM (\n  SELECT played_on, player_id, points,\n         RANK() OVER (PARTITION BY played_on ORDER BY points DESC) AS place\n  FROM games\n) AS g\nWHERE place = 1\nORDER BY played_on, player_id;',
    }),
    query('hard', 'Personal rankings', {
      prompt: "Show each game's `player_id`, `played_on` and `points`, ranked among that player's own games, best first (`personal`, with `RANK`). Sort by player id, then rank, then date.",
      hint: '`RANK() OVER (PARTITION BY player_id ORDER BY points DESC)`.',
      solution: 'SELECT player_id, played_on, points,\n       RANK() OVER (PARTITION BY player_id ORDER BY points DESC) AS personal\nFROM games\nORDER BY player_id, personal, played_on;',
    }),
    query('expert', 'Medals', {
      prompt: "For each night, give `gold`, `silver` and `bronze` to the first three DENSE_RANK places (ties share a medal): `played_on`, `player_id`, `points`, `medal`. Leave out everyone else. Sort by date, then highest points, then player id.",
      hint: "DENSE_RANK per night in a subquery; outside, `CASE place WHEN 1 THEN 'gold' WHEN 2 THEN 'silver' ELSE 'bronze' END` with `WHERE place <= 3`.",
      solution: "SELECT played_on, player_id, points,\n       CASE place WHEN 1 THEN 'gold' WHEN 2 THEN 'silver' ELSE 'bronze' END AS medal\nFROM (\n  SELECT played_on, player_id, points,\n         DENSE_RANK() OVER (PARTITION BY played_on ORDER BY points DESC) AS place\n  FROM games\n) AS g\nWHERE place <= 3\nORDER BY played_on, points DESC, player_id;",
    }),
    query('expert', 'Team of the night', {
      prompt: "For each night, show each team's total (`team_points`) and its `RANK` among the teams that night (`place`): `played_on`, `team`, `team_points`, `place`. Sort by date, then place, then team.",
      hint: 'Group by played_on and team, then `RANK() OVER (PARTITION BY g.played_on ORDER BY SUM(g.points) DESC)`.',
      solution: 'SELECT g.played_on, p.team, SUM(g.points) AS team_points,\n       RANK() OVER (PARTITION BY g.played_on ORDER BY SUM(g.points) DESC) AS place\nFROM games g\nJOIN players p ON p.id = g.player_id\nGROUP BY g.played_on, p.team\nORDER BY g.played_on, place, p.team;',
    }),
  ],
  questions: [
    mc('Scores 50, 45, 45, 40 ranked highest first with RANK give…', ['1, 2, 2, 3', '1, 2, 3, 4', '1, 1, 2, 3', '1, 2, 2, 4'], 3,
      'RANK skips after a tie.'),
    mc('The same scores with DENSE_RANK give…', ['1, 2, 2, 4', '1, 2, 2, 3', '1, 2, 3, 4', '2, 1, 1, 3'], 1,
      'DENSE_RANK doesn\'t skip.'),
    mc('And with ROW_NUMBER (ties broken by id)?', ['1, 2, 2, 4', '1, 2, 2, 3', '1, 2, 3, 4', '1, 1, 1, 1'], 2,
      'ROW_NUMBER never repeats a number.'),
    mc('Do RANK and DENSE_RANK need a tie-breaker to be reliable?', ['No, tied rows get the same rank whatever their order', 'Yes, always', 'Only DENSE_RANK', 'Only with PARTITION BY'], 0,
      'Unlike ROW_NUMBER.'),
    qShort('Which ranking function gives 1, 2, 2, 3 (no gaps after ties)?', 'DENSE_RANK',
      '`DENSE_RANK() OVER (…)`.'),
    mc('How do you find each night\'s winners, ties included?', ['ROW_NUMBER = 1', 'LIMIT 1', 'RANK per night in a subquery, then WHERE place = 1', 'MAX(points) only'], 2,
      'ROW_NUMBER would keep only one of two tied winners.'),
    mc('Which answers "the second-best score" when two players tie for the best?', ['ROW_NUMBER = 2', 'MAX - 1', 'RANK = 2', 'DENSE_RANK = 2'], 3,
      'With RANK, nobody would be second.'),
    mc('How do you rank players by season total?', ['RANK() OVER (ORDER BY points)', 'ORDER BY total', 'Group by player, then RANK() OVER (ORDER BY SUM(points) DESC)', 'RANK(SUM(points))'], 2,
      'The window works over the grouped rows.'),
    mc('What does PARTITION BY team do to a ranking?', ['Nothing', 'Removes ties', 'Ranks the players within each team separately', 'Ranks teams'], 2,
      'Each team has its own number 1.'),
    mc('Which is most common for a sports table?', ['RANK', 'DENSE_RANK', 'ROW_NUMBER', 'NTILE'], 0,
      'Two teams on the same points share a place, and the next place is skipped.'),
  ],
})
