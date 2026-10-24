// Window functions: ROW_NUMBER.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { WINDOWS_DB } from '../windows-db.mjs'

export default makeTopic({
  id: 'row_number',
  title: 'Numbering rows: ROW_NUMBER',
  database: WINDOWS_DB,
  paragraphs: [
    'Some window functions only make sense in order. `ROW_NUMBER()` numbers the rows 1, 2, 3, … in the order given by `ORDER BY` inside the `OVER`:',
    '```\nSELECT id, played_on, player_id,\n       ROW_NUMBER() OVER (ORDER BY played_on, id) AS n\nFROM games\nORDER BY n;\n```',
    "The `ORDER BY` inside `OVER` only decides the numbering. The order of the result is still decided by the query's own `ORDER BY` at the end, so you usually write both.",
    'With `PARTITION BY`, numbering starts again at 1 in each group. This numbers each player\'s games in date order, so their first game is 1:',
    '```\nSELECT player_id, played_on,\n       ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY played_on) AS game_no\nFROM games\nORDER BY player_id, game_no;\n```',
    "`ROW_NUMBER` always gives different numbers, even to rows that tie in the `ORDER BY`. Which of two tied rows gets the lower number is then up to the database, and may change. So make the order unique: add a tie-breaker such as the id, or use `RANK` (next lesson) when ties should share a number.",
    'To keep only some numbers, such as each player\'s first game, number the rows in a subquery and filter outside it.',
  ],
  sandboxCode: 'SELECT player_id, played_on,\n       ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY played_on) AS game_no\nFROM games\nORDER BY player_id, game_no;',
  sandboxSnippets: [
    snippet('Number everything', 'SELECT id, played_on, player_id,\n       ROW_NUMBER() OVER (ORDER BY played_on, id) AS n\nFROM games\nORDER BY n;'),
    snippet('Per player', 'SELECT player_id, played_on,\n       ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY played_on) AS game_no\nFROM games\nORDER BY player_id, game_no;'),
    snippet('First games only', 'SELECT player_id, played_on, points\nFROM (\n  SELECT player_id, played_on, points,\n         ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY played_on) AS game_no\n  FROM games\n) AS g\nWHERE game_no = 1\nORDER BY player_id;'),
  ],
  readMore: { label: 'SQLite: built-in window functions', url: 'https://www.sqlite.org/windowfunctions.html#builtins', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Number the games', {
      prompt: "Show each game's `id`, `played_on` and `player_id`, numbered by date and then id, in a column called `n`. Sort by `n`.",
      hint: '`ROW_NUMBER() OVER (ORDER BY played_on, id) AS n … ORDER BY n`.',
      solution: 'SELECT id, played_on, player_id,\n       ROW_NUMBER() OVER (ORDER BY played_on, id) AS n\nFROM games\nORDER BY n;',
    }),
    query('easy', 'Number the players', {
      prompt: "Show each player's `name`, numbered in alphabetical order (`n`). Sort by `n`.",
      hint: '`ROW_NUMBER() OVER (ORDER BY name) AS n`.',
      solution: 'SELECT name, ROW_NUMBER() OVER (ORDER BY name) AS n\nFROM players\nORDER BY n;',
    }),
    query('easy', 'Game numbers', {
      prompt: "Show each game's `player_id` and `played_on`, with its number among that player's games in date order (`game_no`). Sort by player id, then `game_no`.",
      hint: '`ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY played_on)`.',
      solution: 'SELECT player_id, played_on,\n       ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY played_on) AS game_no\nFROM games\nORDER BY player_id, game_no;',
    }),
    query('medium', 'Places on the night', {
      prompt: "Show each game's `played_on`, `player_id` and `points`, numbered within its night from the highest points down, with ties in player id order (`place`). Sort by date, then `place`.",
      hint: '`ROW_NUMBER() OVER (PARTITION BY played_on ORDER BY points DESC, player_id)`.',
      solution: 'SELECT played_on, player_id, points,\n       ROW_NUMBER() OVER (PARTITION BY played_on ORDER BY points DESC, player_id) AS place\nFROM games\nORDER BY played_on, place;',
    }),
    query('medium', 'Page two', {
      prompt: "Numbering the games by id, show the `id`, `player_id` and `points` of games 11 to 20 (the second page of 10). Sort by id.",
      hint: 'Number in a subquery, then `WHERE n BETWEEN 11 AND 20`.',
      solution: 'SELECT id, player_id, points\nFROM (SELECT id, player_id, points, ROW_NUMBER() OVER (ORDER BY id) AS n FROM games) AS g\nWHERE n BETWEEN 11 AND 20\nORDER BY id;',
    }),
    query('medium', 'Debuts', {
      prompt: "Show each player's first game: `player_id`, `played_on` and `points`. Sort by player id.",
      hint: 'Number each player\'s games by date in a subquery and keep `game_no = 1`.',
      solution: 'SELECT player_id, played_on, points\nFROM (\n  SELECT player_id, played_on, points,\n         ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY played_on) AS game_no\n  FROM games\n) AS g\nWHERE game_no = 1\nORDER BY player_id;',
    }),
    query('hard', 'Latest games', {
      prompt: "Show each player's most recent game: `player_id`, `played_on` and `points`. Sort by player id.",
      hint: 'Number newest first: `ORDER BY played_on DESC` inside OVER.',
      solution: 'SELECT player_id, played_on, points\nFROM (\n  SELECT player_id, played_on, points,\n         ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY played_on DESC) AS n\n  FROM games\n) AS g\nWHERE n = 1\nORDER BY player_id;',
    }),
    query('hard', 'Numbering nights', {
      prompt: "Show each quiz night's date (`played_on`), its number in the season (`night`, 1 for the first) and how many played (`players`). Sort by date.",
      hint: 'Group by played_on, then `ROW_NUMBER() OVER (ORDER BY played_on)` numbers the groups.',
      solution: 'SELECT played_on, ROW_NUMBER() OVER (ORDER BY played_on) AS night, COUNT(*) AS players\nFROM games\nGROUP BY played_on\nORDER BY played_on;',
    }),
    query('expert', 'The second game', {
      prompt: "Show each player's second game (players with only one game are left out): `player_id`, `played_on` and `points`. Sort by player id.",
      hint: 'Keep `game_no = 2`.',
      solution: 'SELECT player_id, played_on, points\nFROM (\n  SELECT player_id, played_on, points,\n         ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY played_on) AS game_no\n  FROM games\n) AS g\nWHERE game_no = 2\nORDER BY player_id;',
    }),
    query('expert', 'Debut or game n', {
      prompt: "Show each game's `player_id` and `played_on`, with a `label`: `debut` for the player's first game, otherwise `game 2`, `game 3` and so on. Sort by player id, then date.",
      hint: "`CASE WHEN ROW_NUMBER() OVER (…) = 1 THEN 'debut' ELSE 'game ' || ROW_NUMBER() OVER (…) END`.",
      solution: "SELECT player_id, played_on,\n       CASE WHEN ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY played_on) = 1 THEN 'debut'\n            ELSE 'game ' || ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY played_on)\n       END AS label\nFROM games\nORDER BY player_id, played_on;",
    }),
  ],
  questions: [
    mc('What does ROW_NUMBER() give?', ['The table\'s ids', 'The number of rows', 'Random numbers', '1, 2, 3, … in the order of the OVER\'s ORDER BY'], 3,
      'Each row gets the next number.'),
    mc('What does the ORDER BY inside OVER decide?', ['Only how the window numbers or looks at the rows', 'The partitions', 'Nothing', 'The order of the result'], 0,
      'The result\'s order still comes from the final ORDER BY.'),
    mc('What does PARTITION BY do to ROW_NUMBER?', ['Starts the numbering again at 1 in each group', 'Makes ties share numbers', 'Nothing', 'Skips numbers'], 0,
      'Each player\'s first game is 1.'),
    mc('Two rows tie in the OVER\'s ORDER BY. What does ROW_NUMBER do?', ['Gives them different numbers, in an order you can\'t rely on', 'Gives both the same number', 'Gives an error', 'Skips both'], 0,
      'Add a tie-breaker, or use RANK.'),
    qShort('Which window function numbers rows 1, 2, 3, …? (with brackets or without)', 'ROW_NUMBER',
      '`ROW_NUMBER() OVER (…)`.'),
    mc('How do you keep only each player\'s first game?', ['LIMIT 1', 'GROUP BY player_id', 'Number in a subquery, then WHERE game_no = 1 outside', 'WHERE ROW_NUMBER() = 1'], 2,
      'WHERE can\'t use window functions directly.'),
    mc('How do you number newest first?', ['`ORDER BY played_on DESC` inside OVER', 'Reverse the table', 'PARTITION BY DESC', 'ORDER BY at the end'], 0,
      'Then number 1 is the latest game.'),
    mc('Can ROW_NUMBER number groups from GROUP BY?', ['Only with PARTITION BY', 'Yes, the window runs over the grouped rows', 'Only one group', 'No'], 1,
      'For example numbering quiz nights.'),
    mc('Which gives a reliable numbering of the games by points?', ['`ORDER BY points`', '`ORDER BY points DESC`', '`PARTITION BY points`', '`ORDER BY points DESC, id`'], 3,
      'The id breaks ties, so the order is always the same.'),
    mc('What is page two of 10 rows, numbered from 1?', ['Rows 2 to 12', 'Rows 20 to 30', 'Rows 11 to 20', 'Rows 10 to 20'], 2,
      'Page one is 1 to 10.'),
  ],
})
