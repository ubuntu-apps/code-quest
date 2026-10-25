// Capstone projects: Cleaning a messy import.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { CHECK } from '../design-db.mjs'
import { CLEANING_DB } from '../capstone-db.mjs'

const { columns } = CHECK

const ISO = "CASE WHEN signed_up LIKE '__/__/____'\n            THEN substr(signed_up, 7, 4) || '-' || substr(signed_up, 4, 2) || '-' || substr(signed_up, 1, 2)\n            ELSE signed_up END"
const CITY = 'upper(substr(trim(city), 1, 1)) || lower(substr(trim(city), 2))'
const DIGITS = "replace(replace(replace(replace(phone, ' ', ''), '-', ''), '(', ''), ')', '')"
const ROWS = ['The signups table has the right rows', 'SELECT * FROM signups ORDER BY id']

export default makeTopic({
  id: 'data_cleaning',
  title: 'Cleaning a messy import',
  database: CLEANING_DB,
  paragraphs: [
    "Real data is rarely tidy. A new app imported its first sign-ups from a web form and a spreadsheet, and `signups` shows it: emails in mixed case with stray spaces, the same person signed up twice, plans written `Basic`, `basic ` and ` PRO`, dates in two formats, phone numbers with brackets and dashes, and empty strings where NULL was meant.",
    "Cleaning goes in a safe order: **look** first (what values are really there?), then **query** the cleaned version without changing anything, and only when that looks right, **change** the data or copy it into a clean table.",
    "```\nSELECT plan, COUNT(*) AS signups FROM signups GROUP BY plan ORDER BY plan;\n```",
    "The tools are ones you know. `trim()` takes spaces off both ends and `lower()` evens out case, so `lower(trim(email))` is the email to compare by. `NULLIF(trim(x), '')` turns blank text into a real NULL. `replace()` strips characters. `substr()` and `||` rebuild `05/03/2026` (day/month/year) as `2026-03-05`, and `LIKE '__/__/____'` spots that format, since `_` matches any one character.",
    "Duplicates are rows whose cleaned email is the same. Keep the first (lowest id) of each and remove the rest: `ROW_NUMBER() OVER (PARTITION BY lower(trim(email)) ORDER BY id)` numbers each person's sign-ups, and number 1 is the one to keep.",
  ],
  sandboxCode: 'SELECT plan, COUNT(*) AS signups FROM signups GROUP BY plan ORDER BY plan;',
  sandboxSnippets: [
    snippet('Plans as typed', 'SELECT plan, COUNT(*) AS signups FROM signups GROUP BY plan ORDER BY plan;'),
    snippet('Cleaned emails', 'SELECT id, email, lower(trim(email)) AS clean_email FROM signups ORDER BY clean_email, id;'),
    snippet('Two date formats', 'SELECT id, signed_up,\n       ' + ISO + ' AS iso\nFROM signups ORDER BY id;'),
  ],
  readMore: { label: 'SQLite: core functions', url: 'https://www.sqlite.org/lang_corefunc.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Look first', {
      prompt: "Show each `plan` exactly as it was typed, with how many sign-ups have it (`signups`). Sort by plan.",
      hint: 'Group by the raw column. The spaces and capitals make each spelling its own group.',
      solution: 'SELECT plan, COUNT(*) AS signups\nFROM signups\nGROUP BY plan\nORDER BY plan;',
    }),
    query('easy', 'Tidy plans', {
      prompt: "Now show each plan cleaned up (lower case, no spaces at either end) as `plan`, with its number of `signups`. Sort by plan.",
      hint: '`lower(trim(plan)) AS plan`, grouped by it.',
      solution: 'SELECT lower(trim(plan)) AS plan, COUNT(*) AS signups\nFROM signups\nGROUP BY lower(trim(plan))\nORDER BY plan;',
    }),
    query('easy', 'Blank is not NULL', {
      prompt: "Show one row counting `referred_by`: real NULLs (`missing`), blank text such as `''` or spaces (`blank`) and actual codes (`codes`).",
      hint: "`COUNT(*) FILTER (WHERE referred_by IS NULL)`, `… WHERE trim(referred_by) = ''`, `… WHERE trim(referred_by) <> ''`.",
      solution: "SELECT COUNT(*) FILTER (WHERE referred_by IS NULL) AS missing,\n       COUNT(*) FILTER (WHERE trim(referred_by) = '') AS blank,\n       COUNT(*) FILTER (WHERE trim(referred_by) <> '') AS codes\nFROM signups;",
    }),
    query('medium', 'Signed up twice', {
      prompt: "Show each cleaned email (`email`: lower case, trimmed) that appears more than once, with how many times (`signups`). Sort by email.",
      hint: 'Group by `lower(trim(email))` with `HAVING COUNT(*) > 1`.',
      solution: 'SELECT lower(trim(email)) AS email, COUNT(*) AS signups\nFROM signups\nGROUP BY lower(trim(email))\nHAVING COUNT(*) > 1\nORDER BY email;',
    }),
    query('medium', 'One date format', {
      prompt: "Show each sign-up's `id`, `signed_up` as typed, and the date as `YYYY-MM-DD` (`iso`). Dates like `05/03/2026` are day/month/year. In id order.",
      hint: "`CASE WHEN signed_up LIKE '__/__/____' THEN substr(signed_up, 7, 4) || '-' || substr(signed_up, 4, 2) || '-' || substr(signed_up, 1, 2) ELSE signed_up END`.",
      solution: 'SELECT id, signed_up,\n       ' + ISO + ' AS iso\nFROM signups\nORDER BY id;',
    }),
    query('medium', 'Clean in place', {
      prompt: "Clean every row with one UPDATE: trim `full_name`; trim and lower-case `email`; trim `city` and give it a capital first letter and lower case after (`Leeds`); lower-case and trim `plan`; turn blank `referred_by` into NULL (and trim the codes); and rewrite day/month/year dates as `YYYY-MM-DD`.",
      hint: "One `UPDATE signups SET full_name = trim(full_name), email = lower(trim(email)), …`. For the city: `upper(substr(trim(city), 1, 1)) || lower(substr(trim(city), 2))`. For referred_by: `NULLIF(trim(referred_by), '')`.",
      solution: 'UPDATE signups\nSET full_name = trim(full_name),\n    email = lower(trim(email)),\n    city = ' + CITY + ",\n    plan = lower(trim(plan)),\n    referred_by = NULLIF(trim(referred_by), ''),\n    signed_up = " + ISO.replace(/\n {12}/g, '\n                ') + ';',
      checks: [ROWS],
    }),
    query('hard', 'Which ones go', {
      prompt: "List the duplicate sign-ups to remove: every row whose cleaned email already appeared with a lower id. Show `id`, the cleaned `email` and the id that is kept (`keep_id`). In id order.",
      hint: 'In a CTE: `ROW_NUMBER() OVER (PARTITION BY lower(trim(email)) ORDER BY id) AS n` and `MIN(id) OVER (PARTITION BY lower(trim(email))) AS keep_id`. Keep n > 1.',
      solution: 'WITH numbered AS (\n  SELECT id, lower(trim(email)) AS email,\n         ROW_NUMBER() OVER (PARTITION BY lower(trim(email)) ORDER BY id) AS n,\n         MIN(id) OVER (PARTITION BY lower(trim(email))) AS keep_id\n  FROM signups\n)\nSELECT id, email, keep_id\nFROM numbered\nWHERE n > 1\nORDER BY id;',
    }),
    query('hard', 'Remove the duplicates', {
      prompt: "Delete the duplicate sign-ups, keeping the row with the lowest id for each cleaned email.",
      hint: 'A subquery with `MIN(id)` and `GROUP BY lower(trim(email))` finds the row to keep for each email. Delete the rows whose id is NOT IN that list. (NOT IN is safe here: MIN(id) is never NULL.)',
      solution: 'DELETE FROM signups\nWHERE id NOT IN (SELECT MIN(id) FROM signups GROUP BY lower(trim(email)));',
      checks: [ROWS],
    }),
    query('expert', 'Phone numbers', {
      prompt: "Show each sign-up's `id`, its phone with only the digits kept (`digits`: no spaces, dashes or brackets; empty stays empty, NULL stays NULL) and `valid`: 1 if the digits are 11 long and start with `07`, otherwise 0. In id order.",
      hint: "Nest `replace()` four times. For valid: `CASE WHEN length(digits) = 11 AND digits LIKE '07%' THEN 1 ELSE 0 END`, which is 0 for NULL too.",
      solution: 'WITH p AS (\n  SELECT id, ' + DIGITS + " AS digits\n  FROM signups\n)\nSELECT id, digits,\n       CASE WHEN length(digits) = 11 AND digits LIKE '07%' THEN 1 ELSE 0 END AS valid\nFROM p\nORDER BY id;",
    }),
    query('expert', 'A clean table', {
      prompt: "Create `customers` with `id` (INTEGER PRIMARY KEY), `name` (TEXT NOT NULL), `email` (TEXT NOT NULL UNIQUE), `city` (TEXT), `phone` (TEXT), `signed_up` (TEXT NOT NULL), `plan` (TEXT NOT NULL, one of `basic`, `pro`, `team`) and `referred_by` (TEXT). Fill it from signups with one cleaned row per email: keep the lowest id's row and its id, clean every column as in Clean in place, and store phones as digits, with NULL instead of an invalid one.",
      hint: 'CREATE TABLE with `CHECK (plan IN (…))`, then `INSERT INTO customers SELECT …cleaned columns… FROM signups WHERE id IN (SELECT MIN(id) FROM signups GROUP BY lower(trim(email)))`. For the phone: `CASE WHEN length(d) = 11 AND d LIKE \'07%\' THEN d END` on the digits.',
      solution: "CREATE TABLE customers (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL,\n  email TEXT NOT NULL UNIQUE,\n  city TEXT,\n  phone TEXT,\n  signed_up TEXT NOT NULL,\n  plan TEXT NOT NULL CHECK (plan IN ('basic', 'pro', 'team')),\n  referred_by TEXT\n);\n\nINSERT INTO customers (id, name, email, city, phone, signed_up, plan, referred_by)\nSELECT id, trim(full_name), lower(trim(email)),\n       " + CITY + ",\n       CASE WHEN length(" + DIGITS + ") = 11 AND " + DIGITS + " LIKE '07%'\n            THEN " + DIGITS + " END,\n       " + ISO.replace(/\n {12}/g, '\n       ') + ",\n       lower(trim(plan)),\n       NULLIF(trim(referred_by), '')\nFROM signups\nWHERE id IN (SELECT MIN(id) FROM signups GROUP BY lower(trim(email)));",
      checks: [columns('customers'), ['The customers table has the right rows', 'SELECT * FROM customers ORDER BY id']],
    }),
  ],
  questions: [
    mc('What is the safe order for cleaning data?', ['Copy it, then look', 'Look at the values, query a cleaned version, then change the data', 'Change it first, then check', 'Delete the bad rows first'], 1,
      'Nothing changes until the cleaned version looks right.'),
    mc("Why does `GROUP BY plan` show 'Basic' and 'basic ' separately?", ['GROUP BY is case-insensitive', 'Text compares exactly, so case and spaces make different values', 'One of them is NULL', 'It doesn\'t'], 1,
      'lower(trim(plan)) evens them out.'),
    mc("What does `NULLIF(trim(referred_by), '')` give for '  '?", ['0', "'  '", "''", 'NULL'], 3,
      'Trimmed to an empty string, which NULLIF turns into NULL.'),
    mc("What does `LIKE '__/__/____'` match?", ['Text starting with two underscores', 'Only YYYY-MM-DD dates', 'Exactly two characters, a slash, two characters, a slash and four characters', 'Any text with slashes'], 2,
      '_ matches any single character.'),
    qShort('Which function removes spaces from both ends of a text?', 'trim',
      '`trim(email)`.'),
    mc('How do you find people who signed up twice?', ['Group by the cleaned email and keep groups with COUNT(*) > 1', 'GROUP BY id', 'DISTINCT email', 'WHERE email = email'], 0,
      'The raw emails differ in case and spaces.'),
    mc("Why is `id NOT IN (SELECT MIN(id) …)` safe in the DELETE?", ['Because of GROUP BY', 'NOT IN is always safe', 'MIN(id) is never NULL, so the list has no NULL', 'DELETE ignores NULLs'], 2,
      'NOT IN goes wrong only when the list contains a NULL.'),
    mc("What does `replace(phone, '-', '')` do?", ['Adds dashes', 'Removes every dash', 'Removes the first dash only', 'Replaces the phone'], 1,
      'Nest replace() once for each character to remove.'),
    mc('Why copy the cleaned rows into a new table with constraints?', ['NOT NULL, UNIQUE and CHECK stop messy values from getting in again', 'It is faster', 'Constraints clean the data', 'Old tables can\'t be queried'], 0,
      'Cleaning once is good; preventing new mess is better.'),
    mc('Which number marks the row to keep in `ROW_NUMBER() OVER (PARTITION BY lower(trim(email)) ORDER BY id)`?', ['1', '0', 'The highest', 'NULL'], 0,
      'The lowest id of each email gets 1.'),
  ],
})
