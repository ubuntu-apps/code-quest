// Subqueries and sets: UNION and UNION ALL.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { SUBQUERIES_DB } from '../subqueries-db.mjs'

export default makeTopic({
  id: 'union',
  title: 'UNION and UNION ALL',
  database: SUBQUERIES_DB,
  paragraphs: [
    'Joins put tables side by side. `UNION` stacks the results of two queries **on top of each other**, making one longer list:',
    '```\nSELECT name FROM artists\nUNION\nSELECT name FROM listeners;\n```',
    'Both queries must give the same number of columns, and the columns are matched by position, not by name. The result takes its column names from the first query.',
    '`UNION` removes duplicate rows from the combined result. `UNION ALL` keeps every row, which is faster and is what you want when repeats matter, such as when you will count them.',
    "A text column added to each part says where each row came from:",
    "```\nSELECT 'artist' AS kind, name FROM artists\nUNION ALL\nSELECT 'listener', name FROM listeners\nORDER BY kind, name;\n```",
    "`ORDER BY` goes once, at the very end, and sorts the whole combined result. Here it can only name the result's columns, like `kind` or `name`. To sort by a calculation, put the whole `UNION` in a subquery in `FROM` and sort the outer query.",
    'For one table, `WHERE a OR b` usually does the same as a `UNION` of two queries. `UNION` is what you need when the rows come from **different tables**.',
  ],
  sandboxCode: "SELECT 'artist' AS kind, name FROM artists\nUNION ALL\nSELECT 'listener', name FROM listeners\nORDER BY kind, name;",
  sandboxSnippets: [
    snippet('All names', 'SELECT name FROM artists\nUNION\nSELECT name FROM listeners;'),
    snippet('With a kind', "SELECT 'artist' AS kind, name FROM artists\nUNION ALL\nSELECT 'listener', name FROM listeners\nORDER BY kind, name;"),
    snippet('UNION vs UNION ALL', 'SELECT country FROM artists\nUNION\nSELECT country FROM listeners;\nSELECT country FROM artists\nUNION ALL\nSELECT country FROM listeners;'),
    snippet('Different column counts', '-- This gives an error: the two parts need the same number of columns\nSELECT name, genre FROM artists\nUNION\nSELECT name FROM listeners;'),
  ],
  readMore: { label: 'SQLite: compound SELECT', url: 'https://www.sqlite.org/lang_select.html#compound_select_statements', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'All names', {
      prompt: 'Show one list of the names of all artists and all listeners, in a column called `name`.',
      hint: 'Two SELECTs of one column each, joined with `UNION`.',
      solution: 'SELECT name FROM artists\nUNION\nSELECT name FROM listeners;',
    }),
    query('easy', 'Every country', {
      prompt: 'Show each `country` that has an artist or a listener, once each, in alphabetical order.',
      hint: '`UNION` removes the repeats; `ORDER BY country` goes at the very end.',
      solution: 'SELECT country FROM artists\nUNION\nSELECT country FROM listeners\nORDER BY country;',
    }),
    query('easy', 'Who is who', {
      prompt: "Show every artist and listener with a `kind` column (`artist` or `listener`) and their `name`. Sort by kind, then name.",
      hint: "Each SELECT adds a fixed text, such as `'artist' AS kind`. Join them with `UNION ALL` and put one ORDER BY at the very end.",
      solution: "SELECT 'artist' AS kind, name FROM artists\nUNION ALL\nSELECT 'listener', name FROM listeners\nORDER BY kind, name;",
    }),
    query('medium', 'Short and long', {
      prompt: "Make one list of the tracks under 200 seconds, labelled `short`, and the tracks over 400 seconds, labelled `long`: `title` and `length`. Sort by title.",
      hint: 'Two SELECTs on `tracks`, each with its own WHERE and a fixed label, joined with `UNION ALL`. One ORDER BY goes at the end.',
      solution: "SELECT title, 'short' AS length FROM tracks WHERE duration_s < 200\nUNION ALL\nSELECT title, 'long' FROM tracks WHERE duration_s > 400\nORDER BY title;",
    }),
    query('medium', 'Campaign list', {
      prompt: "Show the `name` and `plan` of every listener who is premium or who joined in 2026, once each, with a `UNION` of two queries. In name order.",
      hint: "`… WHERE plan = 'premium' UNION … WHERE joined >= '2026-01-01' ORDER BY name`.",
      solution: "SELECT name, plan FROM listeners WHERE plan = 'premium'\nUNION\nSELECT name, plan FROM listeners WHERE joined >= '2026-01-01'\nORDER BY name;",
    }),
    query('medium', 'Fix the columns', {
      prompt: "This should list every artist and listener `name` with a second column, `detail`: the genre for artists and the plan for listeners. It gives an error. Fix it.",
      starter: 'SELECT name, genre AS detail FROM artists\nUNION\nSELECT name FROM listeners;',
      hint: 'The second query needs a second column too: `SELECT name, plan FROM listeners`.',
      solution: 'SELECT name, genre AS detail FROM artists\nUNION\nSELECT name, plan FROM listeners;',
    }),
    query('hard', 'Row counts', {
      prompt: "Show one row per table with its name (`table_name`) and number of rows (`row_count`), for `artists`, `tracks`, `listeners`, `plays` and `follows`.",
      hint: "Five queries like `SELECT 'artists' AS table_name, COUNT(*) AS row_count FROM artists`, joined with `UNION ALL`.",
      solution: "SELECT 'artists' AS table_name, COUNT(*) AS row_count FROM artists\nUNION ALL SELECT 'tracks', COUNT(*) FROM tracks\nUNION ALL SELECT 'listeners', COUNT(*) FROM listeners\nUNION ALL SELECT 'plays', COUNT(*) FROM plays\nUNION ALL SELECT 'follows', COUNT(*) FROM follows;",
    }),
    query('hard', 'Mentions', {
      prompt: "Count how often each artist appears as followed or as played: each artist's `name` and `mentions` (follows plus plays). Most first, then by name.",
      hint: 'In FROM: `(SELECT artist_id FROM follows UNION ALL SELECT t.artist_id FROM plays p JOIN tracks t ON t.id = p.track_id) AS m`, then join to artists and group.',
      solution: 'SELECT a.name, COUNT(*) AS mentions\nFROM (\n  SELECT artist_id FROM follows\n  UNION ALL\n  SELECT t.artist_id FROM plays p JOIN tracks t ON t.id = p.track_id\n) AS m\nJOIN artists a ON a.id = m.artist_id\nGROUP BY a.id, a.name\nORDER BY mentions DESC, a.name;',
    }),
    query('expert', 'A total row', {
      prompt: "Show each `plan` with its number of listeners (`listeners`), plus a last row with `all` and the total. The plans go in alphabetical order, with `all` last.",
      hint: "`ORDER BY` after a UNION can only name columns, so wrap it: `SELECT plan, listeners FROM (… UNION ALL SELECT 'all', COUNT(*) FROM listeners) ORDER BY CASE WHEN plan = 'all' THEN 1 ELSE 0 END, plan`.",
      solution: "SELECT plan, listeners\nFROM (\n  SELECT plan, COUNT(*) AS listeners FROM listeners GROUP BY plan\n  UNION ALL\n  SELECT 'all', COUNT(*) FROM listeners\n) AS summary\nORDER BY CASE WHEN plan = 'all' THEN 1 ELSE 0 END, plan;",
    }),
    query('expert', 'Who to email', {
      prompt: "List the listeners to email: those with no plays (`reason` = `no plays`) and those who joined on or after 2026-08-25 (`reason` = `new`). A listener in both appears twice. Show `name` and `reason`, sorted by name, then reason.",
      hint: 'Two SELECTs on `listeners`, each with its own reason as a fixed text. The first uses `NOT IN (SELECT listener_id FROM plays)`. Join them with `UNION ALL` and sort at the end.',
      solution: "SELECT name, 'no plays' AS reason FROM listeners\nWHERE id NOT IN (SELECT listener_id FROM plays)\nUNION ALL\nSELECT name, 'new' FROM listeners\nWHERE joined >= '2026-08-25'\nORDER BY name, reason;",
    }),
  ],
  questions: [
    mc('What does UNION do?', ['Removes a table', 'Counts rows', 'Stacks the rows of two queries into one result', 'Joins two tables side by side'], 2,
      'The second query\'s rows go under the first query\'s rows.'),
    mc('What must the two parts of a UNION have in common?', ['The same number of columns', 'The same WHERE', 'The same column names', 'The same table'], 0,
      'Columns are matched by position, so the counts must agree.'),
    mc('Where do the result\'s column names come from?', ['Both, joined', 'The first query', 'They are numbered', 'The last query'], 1,
      'Name the columns in the first query.'),
    mc('What is the difference between UNION and UNION ALL?', ['UNION keeps duplicates', 'There is none', 'UNION removes duplicate rows; UNION ALL keeps them', 'UNION ALL sorts the rows'], 2,
      'Use UNION ALL when repeats matter or when you will count the rows.'),
    qShort('Which word after UNION keeps duplicate rows?', 'ALL',
      '`UNION ALL`.'),
    mc('Where does ORDER BY go in a UNION?', ['Once, at the very end', 'In each part', 'Before UNION', 'It is not allowed'], 0,
      'It sorts the whole combined result.'),
    mc('How can you sort a UNION by a CASE expression?', ['Put the CASE in each part', 'Wrap the UNION in a subquery in FROM and sort the outer query', 'You can\'t sort a UNION', 'Use GROUP BY'], 1,
      'A UNION\'s ORDER BY can only name its result columns.'),
    mc("What does `SELECT 'artist' AS kind, name FROM artists` add?", ['A new column in the table', 'An error', "A column with the text 'artist' on every row", 'A filter'], 2,
      'A fixed value labels where the rows came from.'),
    mc('When do you need UNION rather than OR?', ['Never', 'For numbers', 'When sorting', 'When the rows come from different tables'], 3,
      'OR filters one table; UNION combines results from anywhere.'),
    mc('Why use UNION ALL for counting mentions?', ['It is required by COUNT', 'It sorts the rows', 'UNION gives an error', 'Repeats must be kept so each one is counted'], 3,
      'UNION would merge identical rows and lose counts.'),
  ],
})
