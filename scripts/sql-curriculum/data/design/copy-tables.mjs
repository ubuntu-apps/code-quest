// Designing tables: Tables from queries.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { CHECK, DESIGN_DB } from '../design-db.mjs'

const { columns, rows, tables, tryIt } = CHECK

export default makeTopic({
  id: 'tables_from_queries',
  title: 'Tables from queries',
  database: DESIGN_DB,
  paragraphs: [
    '`CREATE TABLE … AS SELECT` makes a new table from a query\'s result, columns and rows together. It is the quickest way to take a backup or keep a summary:',
    '```\nCREATE TABLE contacts_backup AS\nSELECT * FROM contacts;\n```',
    "The new table gets the query's column names, so name calculated columns with `AS`. It gets rough types, but **no constraints**: no primary key, no `NOT NULL`, no `UNIQUE`, no defaults. That is fine for a backup or a report, but not for a table you'll keep adding to.",
    'For a proper table, write `CREATE TABLE` with the constraints yourself, then fill it with `INSERT … SELECT`:',
    '```\nCREATE TABLE guests (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL,\n  email TEXT UNIQUE\n);\nINSERT INTO guests (name, email)\nSELECT DISTINCT guest_name, guest_email FROM ticket_sheet;\n```',
    '`WHERE 0` (never true) copies just the columns, with no rows. And `CREATE TEMP TABLE` makes a table that disappears when the connection closes: handy for in-between steps.',
  ],
  sandboxCode: "CREATE TABLE event_totals AS\nSELECT event_title, COUNT(*) AS tickets, SUM(price) AS takings\nFROM ticket_sheet\nGROUP BY event_title;\nSELECT * FROM event_totals;",
  sandboxSnippets: [
    snippet('A backup', 'CREATE TABLE contacts_backup AS\nSELECT * FROM contacts;\nSELECT * FROM contacts_backup;'),
    snippet('A summary', "CREATE TABLE event_totals AS\nSELECT event_title, COUNT(*) AS tickets, SUM(price) AS takings\nFROM ticket_sheet\nGROUP BY event_title;\nSELECT * FROM event_totals;"),
    snippet('No constraints', "CREATE TABLE rooms_copy AS SELECT * FROM rooms;\nSELECT name, type, \"notnull\", pk FROM pragma_table_info('rooms');\nSELECT name, type, \"notnull\", pk FROM pragma_table_info('rooms_copy');"),
  ],
  readMore: { label: 'SQLite: CREATE TABLE … AS SELECT', url: 'https://www.sqlite.org/lang_createtable.html#createtabas', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'A backup', {
      prompt: 'Make a backup of `contacts` called `contacts_backup`, with all its rows.',
      hint: '`CREATE TABLE new_name AS` followed by a query that selects every row.',
      solution: 'CREATE TABLE contacts_backup AS\nSELECT * FROM contacts;',
      checks: [rows('contacts_backup', 'id')],
    }),
    query('easy', 'Takings per event', {
      prompt: "Make a table `event_totals` with each `event_title` from `ticket_sheet`, its number of tickets (`tickets`) and its takings (`takings`, the sum of `price`).",
      hint: '`CREATE TABLE event_totals AS` followed by a query that groups `ticket_sheet` by `event_title`, with `COUNT(*)` and `SUM(price)`.',
      solution: 'CREATE TABLE event_totals AS\nSELECT event_title, COUNT(*) AS tickets, SUM(price) AS takings\nFROM ticket_sheet\nGROUP BY event_title;',
      checks: [rows('event_totals', 'event_title')],
    }),
    query('easy', 'Same columns, no rows', {
      prompt: 'Make an empty table `contacts_empty` with the same columns as `contacts`.',
      hint: '`CREATE TABLE … AS SELECT * FROM contacts` with a WHERE that is never true, such as `WHERE 0`.',
      solution: 'CREATE TABLE contacts_empty AS\nSELECT * FROM contacts WHERE 0;',
      checks: [columns('contacts_empty'), tryIt('It has no rows', 'SELECT COUNT(*) FROM contacts_empty')],
    }),
    query('medium', 'Backup and restore', {
      prompt: "Back up `contacts` to `contacts_backup`, delete every row of `contacts`, then put them all back from the backup.",
      hint: 'CREATE TABLE … AS SELECT; DELETE FROM contacts; INSERT INTO contacts SELECT * FROM contacts_backup;',
      solution: 'CREATE TABLE contacts_backup AS SELECT * FROM contacts;\nDELETE FROM contacts;\nINSERT INTO contacts SELECT * FROM contacts_backup;',
      checks: [rows('contacts', 'id'), rows('contacts_backup', 'id')],
    }),
    query('medium', 'A proper guests table', {
      prompt: "Create `guests` with `id` (INTEGER PRIMARY KEY), `name` (TEXT, NOT NULL) and `email` (TEXT, UNIQUE), then fill it with each different guest from `ticket_sheet`, in name order.",
      hint: 'CREATE TABLE with the constraints, then `INSERT INTO guests (name, email) SELECT DISTINCT guest_name, guest_email FROM ticket_sheet ORDER BY guest_name;`',
      solution: 'CREATE TABLE guests (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL,\n  email TEXT UNIQUE\n);\nINSERT INTO guests (name, email)\nSELECT DISTINCT guest_name, guest_email\nFROM ticket_sheet\nORDER BY guest_name;',
      checks: [columns('guests'), rows('guests', 'id')],
    }),
    query('medium', 'Fix the column name', {
      prompt: "This makes a summary table, but its second column ends up called `SUM(price)`. Name it `takings`.",
      starter: 'CREATE TABLE totals AS\nSELECT event_title, SUM(price)\nFROM ticket_sheet\nGROUP BY event_title;',
      hint: '`SUM(price) AS takings`.',
      solution: 'CREATE TABLE totals AS\nSELECT event_title, SUM(price) AS takings\nFROM ticket_sheet\nGROUP BY event_title;',
      checks: [columns('totals'), rows('totals', 'event_title')],
    }),
    query('hard', 'Archive', {
      prompt: "Move the ticket sheet's rows for events before `2026-11-10` into a new table `sheet_archive`, then delete them from `ticket_sheet`.",
      hint: "CREATE TABLE sheet_archive AS SELECT * FROM ticket_sheet WHERE event_date < '2026-11-10'; then the DELETE with the same WHERE.",
      solution: "CREATE TABLE sheet_archive AS\nSELECT * FROM ticket_sheet WHERE event_date < '2026-11-10';\nDELETE FROM ticket_sheet WHERE event_date < '2026-11-10';",
      checks: [rows('sheet_archive', 'guest_name, event_title'), rows('ticket_sheet', 'guest_name, event_title')],
    }),
    query('hard', 'Room sizes', {
      prompt: "Make a table `room_sizes` with each room's `id`, `name`, `seats` and a `size`: `large` for 100 seats or more, `small` otherwise.",
      hint: '`CREATE TABLE room_sizes AS SELECT …`, with a `CASE WHEN seats >= 100 THEN … ELSE … END` column called `size`.',
      solution: "CREATE TABLE room_sizes AS\nSELECT id, name, seats,\n       CASE WHEN seats >= 100 THEN 'large' ELSE 'small' END AS size\nFROM rooms;",
      checks: [rows('room_sizes', 'id')],
    }),
    query('expert', 'Rebuild without notes', {
      prompt: "Rebuild `contacts` as `id` (INTEGER PRIMARY KEY), `name` (TEXT, NOT NULL) and `phone` (TEXT), without the notes, keeping the rows. Use a transaction, a new table, a copy, a drop and a rename.",
      hint: 'CREATE TABLE contacts_new (…); INSERT INTO contacts_new (id, name, phone) SELECT id, name, phone FROM contacts; DROP TABLE contacts; ALTER TABLE contacts_new RENAME TO contacts;',
      solution: 'BEGIN;\nCREATE TABLE contacts_new (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL,\n  phone TEXT\n);\nINSERT INTO contacts_new (id, name, phone) SELECT id, name, phone FROM contacts;\nDROP TABLE contacts;\nALTER TABLE contacts_new RENAME TO contacts;\nCOMMIT;',
      checks: [tables, columns('contacts'), rows('contacts', 'id')],
    }),
    query('expert', 'One per name', {
      prompt: "Rebuild `contacts` so names are unique (`name` TEXT NOT NULL UNIQUE), keeping the first row (lowest id) for each name and all four columns.",
      hint: 'Create contacts_new with `name TEXT NOT NULL UNIQUE`, then `INSERT OR IGNORE INTO contacts_new SELECT * FROM contacts ORDER BY id;`, drop, rename.',
      solution: 'BEGIN;\nCREATE TABLE contacts_new (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL UNIQUE,\n  phone TEXT,\n  notes TEXT\n);\nINSERT OR IGNORE INTO contacts_new (id, name, phone, notes)\nSELECT id, name, phone, notes FROM contacts ORDER BY id;\nDROP TABLE contacts;\nALTER TABLE contacts_new RENAME TO contacts;\nCOMMIT;',
      checks: [columns('contacts'), rows('contacts', 'id'), tryIt('A repeated name is refused', "INSERT INTO contacts (name) VALUES ('Tomas Ek'), ('Tomas Ek')")],
    }),
  ],
  questions: [
    mc('What does `CREATE TABLE b AS SELECT * FROM a` copy?', ['The columns and the rows', 'Only the columns', 'Only the rows', 'The constraints too'], 0,
      'It copies the query\'s result.'),
    mc('Does CREATE TABLE … AS SELECT copy the primary key and NOT NULL rules?', ['Yes', 'No, the new table has no constraints', 'Only the primary key', 'Only with STRICT'], 1,
      'Write CREATE TABLE yourself when you need them.'),
    mc("What are the columns of the table made by `CREATE TABLE t AS SELECT name, price * 2 FROM products;`?", ["`name` and `price`", "`name` and `price * 2`", "`name` and `column2`", "None: it fails without a name"], 1,
      "The new table takes the headings of the query, so the calculated column is called `price * 2`, which is awkward to use. `price * 2 AS double_price` gives it a proper name."),
    mc('What does `WHERE 0` do in a CREATE TABLE … AS SELECT?', ['Copies only the first row', 'Copies the columns with no rows', 'Copies every row', 'Gives an error'], 1,
      '0 is never true.'),
    qShort('Which keyword makes a table that disappears when the connection closes? (as in CREATE ___ TABLE)', 'TEMP',
      'TEMPORARY works too.'),
    mc('How do you make a proper table with constraints from a query?', ['CREATE TABLE … AS SELECT', 'ALTER TABLE', 'COPY TABLE', 'CREATE TABLE with the constraints, then INSERT … SELECT'], 3,
      'The constraints come from your CREATE TABLE.'),
    mc('When is CREATE TABLE … AS SELECT a good choice?', ['Never', 'For a table you keep adding to', 'For a backup or a summary', 'For foreign keys'], 2,
      'Fast, but without rules.'),
    mc('Which keeps the first row of each name when copying into a table with UNIQUE names?', ['INSERT OR REPLACE', 'INSERT', 'INSERT OR IGNORE … ORDER BY id', 'CREATE TABLE … AS'], 2,
      'Later duplicates are skipped.'),
    mc("contacts has 10 rows: 4 in 'Leeds', 2 with a NULL city and 4 elsewhere. How many rows does `INSERT INTO archive SELECT * FROM contacts WHERE city <> 'Leeds'` copy?", ["`6`", "`8`", "`4`", "`2`"], 2,
      "The NULL cities don't count as \"not Leeds\": the comparison is unknown. So 4 rows are copied, and a DELETE with the same WHERE removes exactly those 4."),
    mc('What does a restore from backup look like?', ['`ALTER TABLE contacts_backup;`', '`RESTORE contacts;`', '`UPDATE contacts FROM backup;`', '`INSERT INTO contacts SELECT * FROM contacts_backup;`'], 3,
      'Put the rows back with INSERT … SELECT.'),
  ],
})
