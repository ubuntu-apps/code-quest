// Querying a table: Missing values (NULL).
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { QUERYING_DB } from '../databases.mjs'

export default makeTopic({
  id: 'null_values',
  title: 'Missing values: NULL',
  database: QUERYING_DB,
  paragraphs: [
    "Sometimes a value is missing: a book that hasn't been rated yet, a pet with no owner on record. A database stores that as `NULL`, which means \"unknown\". It is not 0 and not empty text: it is no value at all.",
    "`NULL` follows its own rules. Any comparison with it gives \"unknown\" instead of true or false, and `WHERE` only keeps rows where the condition is true. So `rating = NULL` never matches anything, not even the books without a rating.",
    'To find missing values, use `IS NULL`; to find the rows that have a value, use `IS NOT NULL`:',
    '```\nSELECT title FROM books WHERE rating IS NULL;\n```',
    '```\nSELECT name, breed FROM pets WHERE breed IS NOT NULL;\n```',
    "This rule catches people out with \"not\" conditions. `WHERE owner <> 'Ana'` leaves out Ana's pets, but it also leaves out the pets with no owner, because comparing `NULL` with `'Ana'` gives unknown. To include them, ask for them too:",
    "```\nSELECT name, owner FROM pets WHERE owner <> 'Ana' OR owner IS NULL;\n```",
    'In results, CodeQuest shows a missing value as `NULL`.',
  ],
  sandboxCode: 'SELECT title, rating FROM books WHERE rating IS NULL;',
  sandboxSnippets: [
    snippet('IS NULL', 'SELECT title, rating FROM books WHERE rating IS NULL;'),
    snippet('IS NOT NULL', 'SELECT name, breed FROM pets WHERE breed IS NOT NULL;'),
    snippet('= NULL finds nothing', 'SELECT name FROM pets WHERE owner = NULL;'),
    snippet('Not Ana', "SELECT name, owner FROM pets WHERE owner <> 'Ana';"),
    snippet('Not Ana, or no owner', "SELECT name, owner FROM pets WHERE owner <> 'Ana' OR owner IS NULL;"),
  ],
  readMore: { label: 'SQLite: how NULL is handled', url: 'https://www.sqlite.org/nulls.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Unrated books', {
      prompt: 'Show the `title` of every book that has no rating.',
      hint: '`WHERE rating IS NULL`.',
      solution: 'SELECT title FROM books WHERE rating IS NULL;',
    }),
    query('easy', 'Known breeds', {
      prompt: 'Show the `name` and `breed` of the pets whose breed is known.',
      hint: '`WHERE breed IS NOT NULL`.',
      solution: 'SELECT name, breed FROM pets WHERE breed IS NOT NULL;',
    }),
    query('medium', 'Fix the NULL test', {
      prompt: 'This query should list the pets with no breed recorded, but it returns no rows. Fix it.',
      starter: 'SELECT name FROM pets WHERE breed = NULL;',
      hint: '`= NULL` is never true. Use `IS NULL`.',
      solution: 'SELECT name FROM pets WHERE breed IS NULL;',
    }),
    query('medium', 'Highly rated', {
      prompt: 'Show the `title` and `rating` of the books rated 4.5 or higher.',
      hint: '`WHERE rating >= 4.5`. Books without a rating are left out on their own: the comparison is unknown for them.',
      solution: 'SELECT title, rating FROM books WHERE rating >= 4.5;',
    }),
    query('medium', 'Dogs of unknown breed', {
      prompt: 'Show the `name` of the dogs whose breed is not recorded.',
      hint: "`WHERE species = 'dog' AND breed IS NULL`.",
      solution: "SELECT name FROM pets WHERE species = 'dog' AND breed IS NULL;",
    }),
    query('hard', 'Missing or low', {
      prompt: 'Show the `title` and `rating` of the books that have no rating or a rating below 4.3.',
      hint: '`WHERE rating IS NULL OR rating < 4.3`.',
      solution: 'SELECT title, rating FROM books WHERE rating IS NULL OR rating < 4.3;',
    }),
    query('hard', 'Owned and older', {
      prompt: 'Show the `name`, `owner` and `age` of the pets that have an owner and are older than 5.',
      hint: '`WHERE owner IS NOT NULL AND age > 5`.',
      solution: 'SELECT name, owner, age FROM pets WHERE owner IS NOT NULL AND age > 5;',
    }),
    query('expert', "Not Ana's", {
      prompt: "Show the `name` and `owner` of every pet that isn't Ana's, including the pets with no owner.",
      hint: "`owner <> 'Ana'` leaves out the NULL owners, so add `OR owner IS NULL`.",
      solution: "SELECT name, owner FROM pets WHERE owner <> 'Ana' OR owner IS NULL;",
    }),
    query('expert', 'Not top rated', {
      prompt: 'Show the `title` and `rating` of every book not rated above 4.5, including the books with no rating.',
      hint: '`WHERE rating <= 4.5 OR rating IS NULL`.',
      solution: 'SELECT title, rating FROM books WHERE rating <= 4.5 OR rating IS NULL;',
    }),
  ],
  questions: [
    mc('What does `NULL` mean in a table?', ['Zero', 'Empty text', 'The value is missing or unknown', 'An error'], 2,
      'NULL means there is no value: it is not 0 and not an empty string.'),
    mc('Which finds books with no rating?', ['`WHERE rating = NULL`', '`WHERE rating IS NULL`', "`WHERE rating = ''`", '`WHERE rating = 0`'], 1,
      'Only `IS NULL` tests for a missing value; `= NULL` is never true.'),
    mc('Why does `WHERE rating = NULL` return no rows?', ['Comparing with NULL gives unknown, never true', 'NULL is not allowed in WHERE', 'It is a syntax error', 'It only works for text'], 0,
      'Any comparison with NULL is unknown, and WHERE keeps only rows where the condition is true.'),
    qShort('Complete the condition that keeps rows which have a value: `breed IS ___ NULL`.', 'NOT',
      '`IS NOT NULL` is true when the column has a value.'),
    mc("Does `WHERE owner <> 'Ana'` keep pets with no owner?", ['Yes', 'Only cats', 'It gives an error', 'No: the comparison is unknown for them'], 3,
      "NULL compared with 'Ana' is unknown, so those rows are dropped too."),
    mc('How do you include pets with no owner in "not Ana\'s pets"?', ["`owner <> 'Ana' AND owner IS NULL`", "`owner <> 'Ana' OR owner IS NULL`", "`owner <> 'Ana' OR NULL`", "`owner NOT 'Ana'`"], 1,
      'Add the missing values with `OR owner IS NULL`.'),
    mc('Is `NULL` the same as `0`?', ['No, NULL means no value at all', 'Yes', 'Only for numbers', 'Only in SQLite'], 0,
      '0 is a value; NULL means the value is missing.'),
    mc('`WHERE rating >= 4.5` keeps books without a rating?', ['Yes', 'Only if they are new', 'It depends on the genre', 'No'], 3,
      'For a NULL rating the comparison is unknown, so the row is not kept.'),
    mc("What does `SELECT NULL = NULL;` show?", ["`1`", "`0`", "An error", "`NULL`"], 3,
      "Any comparison with NULL is unknown, even NULL with NULL, so the result is `NULL`. That is why you test for it with `IS NULL`."),
  ],
})
