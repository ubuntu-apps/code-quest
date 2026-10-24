// Window functions: Totals beside every row (OVER).
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { WINDOWS_DB } from '../windows-db.mjs'

export default makeTopic({
  id: 'window_basics',
  title: 'Totals beside every row',
  database: WINDOWS_DB,
  paragraphs: [
    "This section's database is a pub quiz league: `players` in teams, and `games`, one row for each player on each quiz night with their `points`. Open **Tables** to see them.",
    '`SUM(points)` adds up all the rows into one row. Add `OVER ()` and it becomes a **window function**: it still adds up all the rows, but every row stays, with the total beside it:',
    '```\nSELECT id, player_id, points,\n       SUM(points) OVER () AS total\nFROM games\nORDER BY id;\n```',
    "The rows a window function looks at are its **window**. Empty brackets mean the window is the whole result. Any aggregate works this way: `COUNT(*) OVER ()`, `AVG(points) OVER ()`, `MAX(points) OVER ()`. Having the total on each row makes comparisons easy, such as each game's share of all the points: `100.0 * points / SUM(points) OVER ()`.",
    "Window functions are worked out after `WHERE`, `GROUP BY` and `HAVING`, just before `ORDER BY`. So the window only sees the rows that are left, and with `GROUP BY` it works over the groups: `SUM(SUM(points)) OVER ()` adds up the group totals.",
    "That order also means `WHERE` can't use a window function: **misuse of window function** is the error. Work the window out in a subquery, then filter outside it:",
    '```\nSELECT id, points\nFROM (SELECT id, points, AVG(points) OVER () AS average FROM games) AS g\nWHERE points > average\nORDER BY id;\n```',
  ],
  sandboxCode: 'SELECT id, player_id, points,\n       SUM(points) OVER () AS total\nFROM games\nORDER BY id;',
  sandboxSnippets: [
    snippet('Total beside each row', 'SELECT id, player_id, points,\n       SUM(points) OVER () AS total\nFROM games\nORDER BY id;'),
    snippet('Compare: one row', 'SELECT SUM(points) AS total FROM games;'),
    snippet('Share of all points', 'SELECT id, points,\n       ROUND(100.0 * points / SUM(points) OVER (), 2) AS share\nFROM games\nORDER BY id;'),
    snippet('Not in WHERE', '-- This gives an error: WHERE runs before the window\nSELECT id, points FROM games WHERE points > AVG(points) OVER ();'),
  ],
  readMore: { label: 'SQLite: window functions', url: 'https://www.sqlite.org/windowfunctions.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'The grand total', {
      prompt: "Show each game's `id`, `player_id` and `points`, with the total points of all games beside it, called `total`. In id order.",
      hint: '`SUM(points) OVER () AS total … ORDER BY id`.',
      solution: 'SELECT id, player_id, points, SUM(points) OVER () AS total\nFROM games\nORDER BY id;',
    }),
    query('easy', 'The average game', {
      prompt: "Show each game's `id` and `points`, with the average points of all games rounded to 1 decimal (`average`). In id order.",
      hint: '`ROUND(AVG(points) OVER (), 1) AS average`.',
      solution: 'SELECT id, points, ROUND(AVG(points) OVER (), 1) AS average\nFROM games\nORDER BY id;',
    }),
    query('easy', 'How many games', {
      prompt: "Show each game's `id` and `played_on`, with the number of games in the table beside it (`games`). In id order.",
      hint: '`COUNT(*) OVER () AS games`.',
      solution: 'SELECT id, played_on, COUNT(*) OVER () AS games\nFROM games\nORDER BY id;',
    }),
    query('medium', 'Above or below', {
      prompt: "Show each game's `id` and `points`, and how far it is from the average game (`diff`, 1 decimal; negative means below). In id order.",
      hint: '`ROUND(points - AVG(points) OVER (), 1) AS diff`.',
      solution: 'SELECT id, points, ROUND(points - AVG(points) OVER (), 1) AS diff\nFROM games\nORDER BY id;',
    }),
    query('medium', 'Share of the first night', {
      prompt: "For the first quiz night only (the earliest `played_on`), show each `player_id`, their `points` and their share of that night's points (`share`, %, 2 decimals). Highest first, then by player id.",
      hint: "`WHERE played_on = (SELECT MIN(played_on) FROM games)`; the window then only sees that night's rows.",
      solution: 'SELECT player_id, points,\n       ROUND(100.0 * points / SUM(points) OVER (), 2) AS share\nFROM games\nWHERE played_on = (SELECT MIN(played_on) FROM games)\nORDER BY share DESC, player_id;',
    }),
    query('medium', 'Behind the best', {
      prompt: "For the last quiz night, show each `player_id`, their `points`, the night's best score (`best`) and how many points behind it they were (`behind`). Best first, then by player id.",
      hint: "`MAX(points) OVER () AS best`, `MAX(points) OVER () - points AS behind`, with WHERE on the latest date.",
      solution: 'SELECT player_id, points,\n       MAX(points) OVER () AS best,\n       MAX(points) OVER () - points AS behind\nFROM games\nWHERE played_on = (SELECT MAX(played_on) FROM games)\nORDER BY points DESC, player_id;',
    }),
    query('hard', 'Better than average', {
      prompt: "Show the `id` and `points` of the games above the average game, using a window function in a subquery. In id order.",
      hint: '`FROM (SELECT id, points, AVG(points) OVER () AS average FROM games) AS g WHERE points > average`.',
      solution: 'SELECT id, points\nFROM (SELECT id, points, AVG(points) OVER () AS average FROM games) AS g\nWHERE points > average\nORDER BY id;',
    }),
    query('hard', 'Share of the season', {
      prompt: "Show each `player_id`, their season total (`total`) and their share of all the points (`share`, %, 1 decimal). Highest total first, then by player id.",
      hint: 'Group by player; the window works over the groups: `ROUND(100.0 * SUM(points) / SUM(SUM(points)) OVER (), 1)`.',
      solution: 'SELECT player_id, SUM(points) AS total,\n       ROUND(100.0 * SUM(points) / SUM(SUM(points)) OVER (), 1) AS share\nFROM games\nGROUP BY player_id\nORDER BY total DESC, player_id;',
    }),
    query('expert', 'Fix the misuse', {
      prompt: "This should list the games with more points than average, but gives **misuse of window function AVG()**. Fix it, keeping the window function. In id order.",
      starter: 'SELECT id, points\nFROM games\nWHERE points > AVG(points) OVER ()\nORDER BY id;',
      hint: 'WHERE runs before windows. Work out the average in a subquery and filter outside it.',
      solution: 'SELECT id, points\nFROM (SELECT id, points, AVG(points) OVER () AS average FROM games) AS g\nWHERE points > average\nORDER BY id;',
    }),
    query('expert', 'Team shares', {
      prompt: "Show each `team`, its season points (`points`) and its share of the league's points (`share`, %, 1 decimal). Highest first.",
      hint: 'Join games to players, group by team, and divide by `SUM(SUM(g.points)) OVER ()`.',
      solution: 'SELECT p.team, SUM(g.points) AS points,\n       ROUND(100.0 * SUM(g.points) / SUM(SUM(g.points)) OVER (), 1) AS share\nFROM games g\nJOIN players p ON p.id = g.player_id\nGROUP BY p.team\nORDER BY points DESC;',
    }),
  ],
  questions: [
    mc('What does `SUM(points) OVER ()` give?', ['The points of each row', 'The total of all rows, on every row', 'One row with the total', 'A running total'], 1,
      'The rows stay, and each one shows the total.'),
    mc('What is the difference between `SUM(points)` and `SUM(points) OVER ()`?', ['The first collapses the rows into one; the second keeps every row', 'The second is faster', 'The first keeps every row', 'None'], 0,
      'OVER turns an aggregate into a window function.'),
    mc('What do empty brackets in `OVER ()` mean?', ['An error', 'No rows', 'The current row only', 'The window is the whole result'], 3,
      'Later lessons put things inside the brackets.'),
    mc('Why does `WHERE points > AVG(points) OVER ()` fail?', ['AVG can\'t be a window function', 'points is text', 'OVER needs a column', 'WHERE runs before window functions'], 3,
      'Filter on the window in an outer query.'),
    qShort('Which keyword turns an aggregate into a window function?', 'OVER',
      '`SUM(points) OVER ()`.'),
    mc('After WHERE has removed some rows, what does `SUM(points) OVER ()` add up?', ['Every row in the table', 'The removed rows', 'Nothing', 'Only the rows left'], 3,
      'Windows are worked out after WHERE.'),
    mc('With GROUP BY, what does `SUM(SUM(points)) OVER ()` give?', ['An error', 'The total of the group totals, on every group row', 'The largest group', 'A running total'], 1,
      'The window works over the grouped rows.'),
    mc('Which gives each game\'s share of all points?', ['`PERCENT(points)`', '`points / SUM(points)`', '`SUM(points) / points OVER ()`', '`100.0 * points / SUM(points) OVER ()`'], 3,
      'Times 100.0 for a percentage with decimals.'),
    mc('When are window functions worked out?', ['Before WHERE', 'After ORDER BY', 'After WHERE, GROUP BY and HAVING, before ORDER BY', 'First'], 2,
      'So ORDER BY can sort by them, but WHERE can\'t use them.'),
    mc('Which of these can be a window function?', ['COUNT, SUM, AVG, MIN and MAX', 'Only SUM', 'Only COUNT', 'None of the aggregates'], 0,
      'Any aggregate followed by OVER.'),
  ],
})
