// Designing tables: UNIQUE and CHECK.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { CHECK, DESIGN_DB } from '../design-db.mjs'

const { columns, rows, tryIt } = CHECK

export default makeTopic({
  id: 'unique_check',
  title: 'UNIQUE and CHECK',
  database: DESIGN_DB,
  paragraphs: [
    '`UNIQUE` means no two rows may have the same value in that column. Unlike the primary key, a table can have several unique columns, and `NULL` is allowed (even many times, because missing values are never equal):',
    '```\nCREATE TABLE guests (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL,\n  email TEXT UNIQUE\n);\n```',
    'Written after the columns, `UNIQUE (event_id, seat)` makes the **pair** unique: the same seat can be sold for different events, but only once per event.',
    '`CHECK (condition)` refuses any row for which the condition is false. Any condition that works in `WHERE` on that row works here:',
    "```\nCREATE TABLE tickets (\n  id INTEGER PRIMARY KEY,\n  event_id INTEGER NOT NULL,\n  seat TEXT,\n  price REAL NOT NULL CHECK (price >= 0),\n  status TEXT NOT NULL DEFAULT 'booked'\n    CHECK (status IN ('booked', 'cancelled', 'used')),\n  UNIQUE (event_id, seat)\n);\n```",
    "Breaking a rule gives **UNIQUE constraint failed: …** or **CHECK constraint failed: …**, and the whole statement is refused. One thing to know: a `CHECK` passes when its condition is `NULL`, so `CHECK (price >= 0)` lets a missing price through. Add `NOT NULL` when the value is required.",
    "Text comparisons are case-sensitive, so `UNIQUE` lets both `ana@example.com` and `Ana@Example.com` in. Adding `COLLATE NOCASE` to the column makes comparisons ignore case: `email TEXT UNIQUE COLLATE NOCASE`.",
  ],
  sandboxCode: "CREATE TABLE tickets (\n  id INTEGER PRIMARY KEY,\n  event_id INTEGER NOT NULL,\n  seat TEXT,\n  price REAL NOT NULL CHECK (price >= 0),\n  UNIQUE (event_id, seat)\n);\nINSERT INTO tickets (event_id, seat, price) VALUES (1, 'A1', 25), (2, 'A1', 8);\nSELECT * FROM tickets;",
  sandboxSnippets: [
    snippet('Pairs', "CREATE TABLE tickets (\n  id INTEGER PRIMARY KEY,\n  event_id INTEGER NOT NULL,\n  seat TEXT,\n  price REAL NOT NULL CHECK (price >= 0),\n  UNIQUE (event_id, seat)\n);\nINSERT INTO tickets (event_id, seat, price) VALUES (1, 'A1', 25), (2, 'A1', 8);\nSELECT * FROM tickets;"),
    snippet('A broken CHECK', "-- This gives an error: the price is negative\nCREATE TABLE tickets (price REAL CHECK (price >= 0));\nINSERT INTO tickets VALUES (-5);"),
    snippet('NULL passes a CHECK', 'CREATE TABLE tickets (price REAL CHECK (price >= 0));\nINSERT INTO tickets VALUES (NULL);\nSELECT * FROM tickets;'),
  ],
  readMore: { label: 'SQLite: CHECK constraints', url: 'https://www.sqlite.org/lang_createtable.html#ckconst', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'One email each', {
      prompt: "Create `guests` with `id` (INTEGER PRIMARY KEY), `name` (TEXT, NOT NULL) and `email` (TEXT, UNIQUE).",
      hint: '`email TEXT UNIQUE`.',
      solution: 'CREATE TABLE guests (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL,\n  email TEXT UNIQUE\n);',
      checks: [columns('guests'), tryIt('A repeated email is refused', "INSERT INTO guests (name, email) VALUES ('A', 'a@example.com'); INSERT INTO guests (name, email) VALUES ('B', 'a@example.com')")],
    }),
    query('easy', 'No negative prices', {
      prompt: "Create `tickets` with `seat` (TEXT) and `price` (REAL, NOT NULL), where the price can't be below 0.",
      hint: '`price REAL NOT NULL CHECK (price >= 0)`.',
      solution: 'CREATE TABLE tickets (\n  seat TEXT,\n  price REAL NOT NULL CHECK (price >= 0)\n);',
      checks: [
        columns('tickets'),
        tryIt('A negative price is refused', "INSERT INTO tickets VALUES ('A1', -5)"),
        tryIt('A price of 0 is fine', "INSERT INTO tickets VALUES ('A1', 0); SELECT * FROM tickets"),
      ],
    }),
    query('easy', 'Real rooms', {
      prompt: "Create `halls` with `name` (TEXT, NOT NULL, UNIQUE) and `seats` (INTEGER), where seats must be more than 0.",
      hint: '`seats INTEGER CHECK (seats > 0)`.',
      solution: 'CREATE TABLE halls (\n  name TEXT NOT NULL UNIQUE,\n  seats INTEGER CHECK (seats > 0)\n);',
      checks: [
        columns('halls'),
        tryIt('A hall with 0 seats is refused', "INSERT INTO halls VALUES ('Attic', 0)"),
        tryIt('A repeated name is refused', "INSERT INTO halls VALUES ('Attic', 10); INSERT INTO halls VALUES ('Attic', 20)"),
      ],
    }),
    query('medium', 'One seat, one ticket', {
      prompt: "Create `tickets` with `event_id` (INTEGER, NOT NULL) and `seat` (TEXT), where each seat can be sold only once per event.",
      hint: '`UNIQUE (event_id, seat)` after the columns.',
      solution: 'CREATE TABLE tickets (\n  event_id INTEGER NOT NULL,\n  seat TEXT,\n  UNIQUE (event_id, seat)\n);',
      checks: [
        columns('tickets'),
        tryIt('The same seat twice for one event is refused', "INSERT INTO tickets VALUES (1, 'A1'); INSERT INTO tickets VALUES (1, 'A1')"),
        tryIt('The same seat for two events is fine', "INSERT INTO tickets VALUES (1, 'A1'); INSERT INTO tickets VALUES (2, 'A1'); SELECT COUNT(*) FROM tickets"),
      ],
    }),
    query('medium', 'Known statuses', {
      prompt: "Create `tickets` with `seat` (TEXT) and `status` (TEXT, NOT NULL, default `'booked'`), where the status must be `booked`, `cancelled` or `used`.",
      hint: "`CHECK (status IN ('booked', 'cancelled', 'used'))`.",
      solution: "CREATE TABLE tickets (\n  seat TEXT,\n  status TEXT NOT NULL DEFAULT 'booked'\n    CHECK (status IN ('booked', 'cancelled', 'used'))\n);",
      checks: [
        columns('tickets'),
        tryIt('An unknown status is refused', "INSERT INTO tickets VALUES ('A1', 'lost')"),
        tryIt('used is fine', "INSERT INTO tickets VALUES ('A1', 'used'); SELECT * FROM tickets"),
      ],
    }),
    query('medium', 'Fix the backwards check', {
      prompt: 'This table should refuse negative prices, but it refuses every positive price instead. Fix it.',
      starter: 'CREATE TABLE tickets (\n  seat TEXT,\n  price REAL NOT NULL CHECK (price <= 0)\n);',
      hint: 'The condition says what a good row looks like: `price >= 0`.',
      solution: 'CREATE TABLE tickets (\n  seat TEXT,\n  price REAL NOT NULL CHECK (price >= 0)\n);',
      checks: [
        columns('tickets'),
        tryIt('A positive price is fine', "INSERT INTO tickets VALUES ('A1', 25); SELECT * FROM tickets"),
        tryIt('A negative price is refused', "INSERT INTO tickets VALUES ('A1', -5)"),
      ],
    }),
    query('hard', 'Ends after it starts', {
      prompt: "Create `bookings` with `room_id` (INTEGER, NOT NULL), `starts` (TEXT, NOT NULL) and `ends` (TEXT, NOT NULL), where `ends` can't be before `starts`.",
      hint: 'A CHECK can compare two columns: `CHECK (ends >= starts)` after the columns.',
      solution: 'CREATE TABLE bookings (\n  room_id INTEGER NOT NULL,\n  starts TEXT NOT NULL,\n  ends TEXT NOT NULL,\n  CHECK (ends >= starts)\n);',
      checks: [
        columns('bookings'),
        tryIt('Ending before starting is refused', "INSERT INTO bookings VALUES (1, '2026-11-06', '2026-11-05')"),
        tryIt('A one-day booking is fine', "INSERT INTO bookings VALUES (1, '2026-11-06', '2026-11-06'); SELECT COUNT(*) FROM bookings"),
      ],
    }),
    query('hard', 'Looks like an email', {
      prompt: "Create `guests` with `name` (TEXT, NOT NULL) and `email` (TEXT, UNIQUE), where an email must have at least one character, an `@`, and at least one character after it.",
      hint: "`CHECK (email LIKE '_%@_%')`.",
      solution: "CREATE TABLE guests (\n  name TEXT NOT NULL,\n  email TEXT UNIQUE CHECK (email LIKE '_%@_%')\n);",
      checks: [
        columns('guests'),
        tryIt('An email without @ is refused', "INSERT INTO guests VALUES ('A', 'nope')"),
        tryIt('An email with nothing before the @ is refused', "INSERT INTO guests VALUES ('A', '@example.com')"),
        tryIt('A normal email is fine', "INSERT INTO guests VALUES ('A', 'a@example.com'); SELECT * FROM guests"),
      ],
    }),
    query('expert', 'Same email, other capitals', {
      prompt: "Create `guests` with `name` (TEXT, NOT NULL) and `email` (TEXT, UNIQUE), where `ana@example.com` and `Ana@Example.com` count as the same email.",
      hint: '`email TEXT UNIQUE COLLATE NOCASE`.',
      solution: 'CREATE TABLE guests (\n  name TEXT NOT NULL,\n  email TEXT UNIQUE COLLATE NOCASE\n);',
      checks: [
        columns('guests'),
        tryIt('The same email in other capitals is refused', "INSERT INTO guests VALUES ('A', 'ana@example.com'); INSERT INTO guests VALUES ('B', 'Ana@Example.com')"),
      ],
    }),
    query('expert', 'Each guest once', {
      prompt: "Create `guests` with `id` (INTEGER PRIMARY KEY), `name` (TEXT, NOT NULL) and `email` (TEXT, UNIQUE). Fill it from `ticket_sheet` with `INSERT OR IGNORE`, so each email goes in only once (keeping the first row for it, in the sheet's order).",
      hint: '`INSERT OR IGNORE INTO guests (name, email) SELECT guest_name, guest_email FROM ticket_sheet;`',
      solution: 'CREATE TABLE guests (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL,\n  email TEXT UNIQUE\n);\nINSERT OR IGNORE INTO guests (name, email)\nSELECT guest_name, guest_email FROM ticket_sheet;',
      checks: [columns('guests'), rows('guests', 'id')],
    }),
  ],
  questions: [
    mc('What does UNIQUE do?', ['Makes the column the primary key', 'Sorts the column', 'Removes duplicates from results', 'Refuses a second row with the same value in that column'], 3,
      'Each value can appear only once.'),
    mc('Can a UNIQUE column hold NULL in several rows?', ['Yes, missing values are never equal', 'Only once', 'Only with NOT NULL', 'No'], 0,
      'Add NOT NULL if the value is required.'),
    mc('What does `UNIQUE (event_id, seat)` allow?', ['Each event only once', 'The same seat for different events, but once per event', 'Nothing', 'Each seat only once in the whole table'], 1,
      'The pair must be unique.'),
    mc('When does a CHECK refuse a row?', ['When the condition is NULL', 'Never', 'When the column is missing', 'When the condition is false'], 3,
      'A NULL (unknown) result passes.'),
    qShort('Which keyword adds a rule like `(price >= 0)` to a column?', 'CHECK',
      '`price REAL CHECK (price >= 0)`.'),
    mc('Does `CHECK (price >= 0)` refuse a NULL price?', ['Only with STRICT', 'No: the check is unknown, so it passes', 'Yes', 'Only for REAL columns'], 1,
      'Add NOT NULL to refuse missing prices.'),
    mc('How do you compare two columns in a rule?', ['You can\'t', 'A CHECK after the columns, like `CHECK (ends >= starts)`', 'With UNIQUE', 'With DEFAULT'], 1,
      'A table-level CHECK can use any of the row\'s columns.'),
    mc("What does `COLLATE NOCASE` do for a UNIQUE email?", ['Removes the email', 'Makes it lower case', 'Makes ana@example.com and Ana@Example.com count as the same', 'Nothing'], 2,
      'Comparisons on that column ignore case.'),
    mc('What does `INSERT OR IGNORE` do with a row that breaks UNIQUE?', ['Stops with an error', 'Adds it anyway', 'Skips it', 'Replaces the old row'], 2,
      'The other rows still go in.'),
    mc("Which CHECK allows only 'booked', 'cancelled' and 'used'?", ["`UNIQUE (status)`", "`DEFAULT 'booked'`", "`CHECK (status IN ('booked', 'cancelled', 'used'))`", "`CHECK (status = 'booked')`"], 2,
      'IN tests against the list.'),
  ],
})
