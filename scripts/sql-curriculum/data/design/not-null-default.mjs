// Designing tables: NOT NULL and DEFAULT.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { CHECK, DESIGN_DB } from '../design-db.mjs'

const { columns, rows, tryIt } = CHECK

export default makeTopic({
  id: 'not_null_default',
  title: 'NOT NULL and DEFAULT',
  database: DESIGN_DB,
  paragraphs: [
    'A table can protect itself from bad data with **constraints**: rules written into the table that SQLite checks on every INSERT and UPDATE. The first two are about missing values.',
    '`NOT NULL` means the column must always have a value. An insert without one gives **NOT NULL constraint failed: guests.name**:',
    '```\nCREATE TABLE guests (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL,\n  email TEXT\n);\n```',
    "`DEFAULT` gives a value to use when the INSERT leaves the column out. Defaults are written like values: numbers as they are, text in single quotes.",
    "```\nCREATE TABLE tickets (\n  id INTEGER PRIMARY KEY,\n  seat TEXT NOT NULL,\n  status TEXT NOT NULL DEFAULT 'booked',\n  price REAL NOT NULL DEFAULT 0\n);\n```",
    "The two go well together: the column always has a value, and the usual one is filled in for you. But a default is only used when the column is left out. Writing `NULL` on purpose still stores `NULL`, which `NOT NULL` then refuses.",
    "`NOT NULL` doesn't stop empty text: `''` is a value, not a missing one. To refuse that too you need a `CHECK`, in the next stage. Defaults can also be `CURRENT_DATE` or `CURRENT_TIMESTAMP`, which fill in today's date or time.",
  ],
  sandboxCode: "CREATE TABLE tickets (\n  id INTEGER PRIMARY KEY,\n  seat TEXT NOT NULL,\n  status TEXT NOT NULL DEFAULT 'booked',\n  price REAL NOT NULL DEFAULT 0\n);\nINSERT INTO tickets (seat) VALUES ('A1');\nSELECT * FROM tickets;",
  sandboxSnippets: [
    snippet('Defaults filled in', "CREATE TABLE tickets (\n  id INTEGER PRIMARY KEY,\n  seat TEXT NOT NULL,\n  status TEXT NOT NULL DEFAULT 'booked',\n  price REAL NOT NULL DEFAULT 0\n);\nINSERT INTO tickets (seat) VALUES ('A1');\nSELECT * FROM tickets;"),
    snippet('A missing name', "-- This gives an error: name is NOT NULL\nCREATE TABLE guests (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT);\nINSERT INTO guests (email) VALUES ('nobody@example.com');"),
    snippet('Empty is not missing', "CREATE TABLE guests (id INTEGER PRIMARY KEY, name TEXT NOT NULL);\nINSERT INTO guests (name) VALUES ('');\nSELECT * FROM guests;"),
  ],
  readMore: { label: 'SQLite: CREATE TABLE', url: 'https://www.sqlite.org/lang_createtable.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'A name is required', {
      prompt: "Create `guests` with `id` (INTEGER PRIMARY KEY), `name` (TEXT, NOT NULL) and `email` (TEXT).",
      hint: '`name TEXT NOT NULL`.',
      solution: 'CREATE TABLE guests (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL,\n  email TEXT\n);',
      checks: [columns('guests'), tryIt('A guest without a name is refused', "INSERT INTO guests (email) VALUES ('x@example.com')")],
    }),
    query('easy', 'Free unless priced', {
      prompt: "Create `events` with `id` (INTEGER PRIMARY KEY), `title` (TEXT, NOT NULL) and `price` (REAL, NOT NULL, default 0).",
      hint: '`price REAL NOT NULL DEFAULT 0`.',
      solution: 'CREATE TABLE events (\n  id INTEGER PRIMARY KEY,\n  title TEXT NOT NULL,\n  price REAL NOT NULL DEFAULT 0\n);',
      checks: [columns('events'), tryIt('An event without a price costs 0', "INSERT INTO events (title) VALUES ('Open Day'); SELECT title, price FROM events")],
    }),
    query('medium', 'Fix the missing rule', {
      prompt: 'This table should refuse guests without a name, but accepts them. Fix it.',
      starter: 'CREATE TABLE guests (\n  id INTEGER PRIMARY KEY,\n  name TEXT,\n  email TEXT\n);',
      hint: 'Add NOT NULL to name.',
      solution: 'CREATE TABLE guests (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL,\n  email TEXT\n);',
      checks: [columns('guests'), tryIt('A guest without a name is refused', "INSERT INTO guests (email) VALUES ('x@example.com')")],
    }),
    query('medium', 'Settings', {
      prompt: "Create `settings` with `name` (TEXT, NOT NULL), `enabled` (INTEGER, NOT NULL, default 1) and `level` (INTEGER, default 3), then add a setting called `dark_mode` with only its name.",
      hint: "`INSERT INTO settings (name) VALUES ('dark_mode');` fills the other two from their defaults.",
      solution: "CREATE TABLE settings (\n  name TEXT NOT NULL,\n  enabled INTEGER NOT NULL DEFAULT 1,\n  level INTEGER DEFAULT 3\n);\nINSERT INTO settings (name) VALUES ('dark_mode');",
      checks: [columns('settings'), rows('settings', 'name')],
    }),
    query('medium', 'All defaults', {
      prompt: "Create `counters` with `id` (INTEGER PRIMARY KEY) and `total` (INTEGER, NOT NULL, default 0), then add two rows that use only the defaults, with `INSERT INTO counters DEFAULT VALUES;` twice.",
      hint: 'DEFAULT VALUES inserts a row with every column at its default (and the next id).',
      solution: 'CREATE TABLE counters (\n  id INTEGER PRIMARY KEY,\n  total INTEGER NOT NULL DEFAULT 0\n);\nINSERT INTO counters DEFAULT VALUES;\nINSERT INTO counters DEFAULT VALUES;',
      checks: [columns('counters'), rows('counters', 'id')],
    }),
    query('hard', 'Default, not NULL', {
      prompt: "Create `tickets` with `seat` (TEXT, NOT NULL) and `status` (TEXT, NOT NULL, default `'booked'`). Leaving the status out should give `booked`, but writing NULL for it should be refused.",
      hint: "`status TEXT NOT NULL DEFAULT 'booked'`.",
      solution: "CREATE TABLE tickets (\n  seat TEXT NOT NULL,\n  status TEXT NOT NULL DEFAULT 'booked'\n);",
      checks: [
        columns('tickets'),
        tryIt('Leaving the status out gives booked', "INSERT INTO tickets (seat) VALUES ('A1'); SELECT seat, status FROM tickets"),
        tryIt('An explicit NULL status is refused', "INSERT INTO tickets (seat, status) VALUES ('A2', NULL)"),
      ],
    }),
    query('hard', 'Fix the import', {
      prompt: "This copies the ticket sheet into `tickets`, but stops with **NOT NULL constraint failed: tickets.seat** because some tickets have no seat. Store those as `standing` instead.",
      starter: 'CREATE TABLE tickets (\n  guest TEXT NOT NULL,\n  seat TEXT NOT NULL,\n  price REAL NOT NULL\n);\nINSERT INTO tickets (guest, seat, price)\nSELECT guest_name, seat, price FROM ticket_sheet;',
      hint: "In the SELECT, `COALESCE(seat, 'standing')`.",
      solution: "CREATE TABLE tickets (\n  guest TEXT NOT NULL,\n  seat TEXT NOT NULL,\n  price REAL NOT NULL\n);\nINSERT INTO tickets (guest, seat, price)\nSELECT guest_name, COALESCE(seat, 'standing'), price FROM ticket_sheet;",
      checks: [columns('tickets'), rows('tickets', 'guest, seat')],
    }),
    query('expert', 'Volunteers', {
      prompt: "Create `staff` with `id` (INTEGER PRIMARY KEY), `name` (TEXT, NOT NULL), `role` (TEXT, NOT NULL, default `'volunteer'`) and `hours` (REAL, NOT NULL, default 0). Then add `Mara Venn` with only her name, and `Tomas Ek` as `manager` with 12.5 hours.",
      hint: 'Two INSERTs (or one per row with different column lists).',
      solution: "CREATE TABLE staff (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL,\n  role TEXT NOT NULL DEFAULT 'volunteer',\n  hours REAL NOT NULL DEFAULT 0\n);\nINSERT INTO staff (name) VALUES ('Mara Venn');\nINSERT INTO staff (name, role, hours) VALUES ('Tomas Ek', 'manager', 12.5);",
      checks: [columns('staff'), rows('staff', 'id')],
    }),
    query('expert', 'Complete events', {
      prompt: "Create `events` so that an event can't be added without a `title` or an `event_date` (both TEXT), and its `price` (REAL) is 0 unless given. Give it an `id` (INTEGER PRIMARY KEY) first.",
      hint: 'NOT NULL on title and event_date; `price REAL NOT NULL DEFAULT 0`.',
      solution: 'CREATE TABLE events (\n  id INTEGER PRIMARY KEY,\n  title TEXT NOT NULL,\n  event_date TEXT NOT NULL,\n  price REAL NOT NULL DEFAULT 0\n);',
      checks: [
        columns('events'),
        tryIt('An event without a title is refused', "INSERT INTO events (event_date) VALUES ('2026-12-01')"),
        tryIt('An event without a date is refused', "INSERT INTO events (title) VALUES ('Open Day')"),
        tryIt('The price defaults to 0', "INSERT INTO events (title, event_date) VALUES ('Open Day', '2026-12-01'); SELECT title, price FROM events"),
      ],
    }),
  ],
  questions: [
    mc('What is a constraint?', ['A kind of query', 'A column type', 'An index', 'A rule in the table that SQLite checks on every change'], 3,
      'NOT NULL, DEFAULT, UNIQUE, CHECK and keys are constraints.'),
    mc('What does NOT NULL do?', ['Removes NULLs from results', 'Makes the column unique', 'Fills in a value', 'Refuses rows where the column has no value'], 3,
      'The insert or update fails instead.'),
    mc('When is a DEFAULT used?', ['When the INSERT leaves the column out', 'Never in SQLite', 'Always', 'When the value is NULL'], 0,
      'An explicit NULL is stored as NULL, not replaced.'),
    mc("Does `NOT NULL` refuse the empty text `''`?", ['No, empty text is a value', 'Yes', 'Only for numbers', 'Only with STRICT'], 0,
      'To refuse it, add a CHECK.'),
    qShort('Which keyword gives a column a value to use when it is left out?', 'DEFAULT',
      "`status TEXT DEFAULT 'booked'`."),
    mc("How is a text default written?", ['As a column name', "In single quotes: `DEFAULT 'booked'`", 'Without quotes', 'In brackets only'], 1,
      'Like any text value.'),
    mc('What does `INSERT INTO counters DEFAULT VALUES;` add?', ['Nothing', 'A row with every column at its default', 'A copy of the last row', 'An error'], 1,
      'Each column gets its default (or NULL), and the id gets the next number.'),
    mc('An import fails with **NOT NULL constraint failed: tickets.seat**. What can you do?', ['Give the missing values a value in the SELECT, for example with COALESCE', 'Use DISTINCT', 'Remove the table', 'Use DEFAULT NULL'], 0,
      'Or decide the column may be NULL after all.'),
    mc("With `status TEXT NOT NULL DEFAULT 'booked'`, what does `INSERT … (seat, status) VALUES ('A2', NULL)` do?", ['Fails: NOT NULL refuses the NULL', "Stores 'booked'", 'Stores NULL', 'Stores an empty text'], 0,
      'The default is only used when the column is left out.'),
    mc('Which default fills in today\'s date?', ['`DEFAULT date`', '`DEFAULT CURRENT_DATE`', "`DEFAULT 'today'`", '`DEFAULT NOW`'], 1,
      'CURRENT_TIMESTAMP gives the date and time.'),
  ],
})
