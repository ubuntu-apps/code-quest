// Designing tables: Primary keys.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { CHECK, DESIGN_DB } from '../design-db.mjs'

const { columns, rows, tryIt } = CHECK

export default makeTopic({
  id: 'primary_keys',
  title: 'Primary keys',
  database: DESIGN_DB,
  paragraphs: [
    'Every table needs a way to point at exactly one row: its **primary key**. Most tables use a number for it:',
    '```\nCREATE TABLE guests (\n  id INTEGER PRIMARY KEY,\n  name TEXT,\n  email TEXT\n);\n```',
    "In SQLite, a column declared exactly `INTEGER PRIMARY KEY` is special: if you leave it out of an INSERT, SQLite fills in the next number by itself, and no two rows can share it. The spelling matters: `INT PRIMARY KEY` doesn't get numbered automatically, and inserting without an id leaves it `NULL`.",
    'Sometimes the data already has a natural key, such as a country code. A text primary key works, but SQLite (unlike other databases) lets it be `NULL` unless you add `NOT NULL`:',
    "```\nCREATE TABLE countries (\n  code TEXT NOT NULL PRIMARY KEY,\n  name TEXT\n);\n```",
    'A primary key can also be several columns together. A seat is only unique within its room, so the pair is the key:',
    '```\nCREATE TABLE seats (\n  room_id INTEGER,\n  seat TEXT,\n  PRIMARY KEY (room_id, seat)\n);\n```',
    "`INTEGER PRIMARY KEY AUTOINCREMENT` also promises that ids of deleted rows are never used again. Without it, deleting the row with the largest id lets the next insert take that id. You rarely need `AUTOINCREMENT`, but it matters when an old id must never come back.",
  ],
  sandboxCode: "CREATE TABLE guests (\n  id INTEGER PRIMARY KEY,\n  name TEXT,\n  email TEXT\n);\nINSERT INTO guests (name, email) VALUES ('Ana Lima', 'ana.lima@example.com');\nSELECT * FROM guests;",
  sandboxSnippets: [
    snippet('Numbered for you', "CREATE TABLE guests (\n  id INTEGER PRIMARY KEY,\n  name TEXT,\n  email TEXT\n);\nINSERT INTO guests (name, email) VALUES ('Ana Lima', 'ana.lima@example.com');\nSELECT * FROM guests;"),
    snippet('INT is not the same', "CREATE TABLE guests (id INT PRIMARY KEY, name TEXT);\nINSERT INTO guests (name) VALUES ('Ana Lima');\nSELECT * FROM guests;"),
    snippet('A key of two columns', "CREATE TABLE seats (room_id INTEGER, seat TEXT, PRIMARY KEY (room_id, seat));\nINSERT INTO seats VALUES (1, 'A1'), (2, 'A1');\nSELECT * FROM seats;"),
  ],
  readMore: { label: 'SQLite: ROWIDs and INTEGER PRIMARY KEY', url: 'https://www.sqlite.org/lang_createtable.html#rowid', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Guests with ids', {
      prompt: "Create `guests` with `id` (INTEGER PRIMARY KEY), `name` (TEXT) and `email` (TEXT).",
      hint: '`id INTEGER PRIMARY KEY` as the first column.',
      solution: 'CREATE TABLE guests (\n  id INTEGER PRIMARY KEY,\n  name TEXT,\n  email TEXT\n);',
      checks: [columns('guests'), tryIt('Two guests can\'t share an id', "INSERT INTO guests (id, name) VALUES (1, 'A'); INSERT INTO guests (id, name) VALUES (1, 'B')")],
    }),
    query('easy', 'Numbered events', {
      prompt: "Create `events` with `id` (INTEGER PRIMARY KEY), `title` (TEXT) and `event_date` (TEXT), then add `Jazz Night` on `2026-11-06` and `Film Club` on `2026-11-20` without giving ids.",
      hint: 'The ids 1 and 2 are filled in by SQLite.',
      solution: "CREATE TABLE events (\n  id INTEGER PRIMARY KEY,\n  title TEXT,\n  event_date TEXT\n);\nINSERT INTO events (title, event_date) VALUES\n  ('Jazz Night', '2026-11-06'),\n  ('Film Club', '2026-11-20');",
      checks: [columns('events'), rows('events', 'id')],
    }),
    query('easy', 'Country codes', {
      prompt: "Create `countries` with `code` (TEXT, NOT NULL, the primary key) and `name` (TEXT).",
      hint: '`code TEXT NOT NULL PRIMARY KEY`.',
      solution: 'CREATE TABLE countries (\n  code TEXT NOT NULL PRIMARY KEY,\n  name TEXT\n);',
      checks: [
        columns('countries'),
        tryIt('A repeated code is refused', "INSERT INTO countries VALUES ('PT', 'Portugal'); INSERT INTO countries VALUES ('PT', 'Again')"),
        tryIt('A missing code is refused', "INSERT INTO countries (name) VALUES ('Nowhere')"),
      ],
    }),
    query('medium', 'Seats', {
      prompt: "Create `seats` with `room_id` (INTEGER) and `seat` (TEXT), whose primary key is the two columns together.",
      hint: '`PRIMARY KEY (room_id, seat)` after the columns.',
      solution: 'CREATE TABLE seats (\n  room_id INTEGER,\n  seat TEXT,\n  PRIMARY KEY (room_id, seat)\n);',
      checks: [
        columns('seats'),
        tryIt('The same seat in the same room is refused', "INSERT INTO seats VALUES (1, 'A1'); INSERT INTO seats VALUES (1, 'A1')"),
        tryIt('The same seat in another room is fine', "INSERT INTO seats VALUES (1, 'A1'); INSERT INTO seats VALUES (2, 'A1'); SELECT COUNT(*) FROM seats"),
      ],
    }),
    query('medium', 'Fix the missing id', {
      prompt: "In this table, a new guest gets no id (it stays NULL). Fix the table so SQLite numbers the guests.",
      starter: "CREATE TABLE guests (\n  id INT PRIMARY KEY,\n  name TEXT\n);\nINSERT INTO guests (name) VALUES ('Ana Lima');",
      hint: 'Only exactly `INTEGER PRIMARY KEY` is numbered automatically.',
      solution: "CREATE TABLE guests (\n  id INTEGER PRIMARY KEY,\n  name TEXT\n);\nINSERT INTO guests (name) VALUES ('Ana Lima');",
      checks: [columns('guests'), rows('guests', 'name')],
    }),
    query('medium', 'Guests from the sheet', {
      prompt: "Create `guests` (`id` INTEGER PRIMARY KEY, `name` TEXT, `email` TEXT) and fill it with each different guest name and email from `ticket_sheet`, in name order, letting SQLite number them.",
      hint: '`INSERT INTO guests (name, email) SELECT DISTINCT guest_name, guest_email FROM ticket_sheet ORDER BY guest_name;`',
      solution: 'CREATE TABLE guests (\n  id INTEGER PRIMARY KEY,\n  name TEXT,\n  email TEXT\n);\nINSERT INTO guests (name, email)\nSELECT DISTINCT guest_name, guest_email\nFROM ticket_sheet\nORDER BY guest_name;',
      checks: [columns('guests'), rows('guests', 'id')],
    }),
    query('hard', 'Never again', {
      prompt: "Create `invoices` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `amount` REAL). Add invoices of 10, 20 and 30, delete the one with id 3, then add one of 40. The new invoice must get id 4, not 3.",
      hint: 'With AUTOINCREMENT, SQLite remembers the largest id ever used.',
      solution: 'CREATE TABLE invoices (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  amount REAL\n);\nINSERT INTO invoices (amount) VALUES (10), (20), (30);\nDELETE FROM invoices WHERE id = 3;\nINSERT INTO invoices (amount) VALUES (40);',
      checks: [rows('invoices', 'id')],
    }),
    query('hard', 'One ticket each', {
      prompt: "Create `entries` with `event_id` (INTEGER) and `guest_id` (INTEGER), where a guest can have at most one entry per event: make the pair the primary key.",
      hint: '`PRIMARY KEY (event_id, guest_id)`.',
      solution: 'CREATE TABLE entries (\n  event_id INTEGER,\n  guest_id INTEGER,\n  PRIMARY KEY (event_id, guest_id)\n);',
      checks: [
        columns('entries'),
        tryIt('A second entry for the same event and guest is refused', 'INSERT INTO entries VALUES (1, 5); INSERT INTO entries VALUES (1, 5)'),
      ],
    }),
    query('expert', 'Room codes', {
      prompt: "Create `room_codes` with `code` (TEXT, NOT NULL, primary key), `room_id` (INTEGER), then fill it with each room's `id` and a code made of the first 3 letters of its name in capitals (Hall A → `HAL`).",
      hint: "`INSERT INTO room_codes (code, room_id) SELECT UPPER(SUBSTR(name, 1, 3)), id FROM rooms;`",
      solution: 'CREATE TABLE room_codes (\n  code TEXT NOT NULL PRIMARY KEY,\n  room_id INTEGER\n);\nINSERT INTO room_codes (code, room_id)\nSELECT UPPER(SUBSTR(name, 1, 3)), id FROM rooms;',
      checks: [columns('room_codes'), rows('room_codes', 'code')],
    }),
    query('expert', 'Events from the sheet', {
      prompt: "Create `events` (`id` INTEGER PRIMARY KEY, `title` TEXT, `event_date` TEXT, `room` TEXT, `price` REAL) and fill it with each different event from `ticket_sheet`, ordered by date and then title, letting SQLite number them.",
      hint: '`SELECT DISTINCT event_title, event_date, room, price FROM ticket_sheet ORDER BY event_date, event_title`.',
      solution: 'CREATE TABLE events (\n  id INTEGER PRIMARY KEY,\n  title TEXT,\n  event_date TEXT,\n  room TEXT,\n  price REAL\n);\nINSERT INTO events (title, event_date, room, price)\nSELECT DISTINCT event_title, event_date, room, price\nFROM ticket_sheet\nORDER BY event_date, event_title;',
      checks: [columns('events'), rows('events', 'id')],
    }),
  ],
  questions: [
    mc('What is a primary key for?', ['Sorting the table', 'Making the table faster to create', 'Storing passwords', 'Pointing at exactly one row'], 3,
      'No two rows can share it.'),
    mc('What does SQLite do with `id INTEGER PRIMARY KEY` when you leave it out of an INSERT?', ['Uses 0', 'Leaves it NULL', 'Fills in the next number', 'Gives an error'], 2,
      'It numbers the rows by itself.'),
    mc('What happens with `id INT PRIMARY KEY` when you leave it out?', ['It stays NULL', 'It becomes 1', 'It is numbered', 'An error'], 0,
      'Only exactly INTEGER PRIMARY KEY is numbered automatically.'),
    mc('Why add NOT NULL to a TEXT primary key in SQLite?', ['It is faster', 'Text can\'t be a key', 'To sort it', 'SQLite otherwise lets it be NULL'], 3,
      'Other databases forbid NULL keys; SQLite needs it said.'),
    qShort('Which keyword makes SQLite never reuse the id of a deleted row?', 'AUTOINCREMENT',
      '`INTEGER PRIMARY KEY AUTOINCREMENT`.'),
    mc('How do you make two columns together the key?', ['PRIMARY KEY on both columns', 'UNIQUE on each', 'It can\'t be done', '`PRIMARY KEY (room_id, seat)` after the columns'], 3,
      'A composite key is written as a table constraint.'),
    mc('With `PRIMARY KEY (room_id, seat)`, can two rooms both have seat A1?', ['No', 'Yes, only the pair must be unique', 'Only if one is NULL', 'Only with AUTOINCREMENT'], 1,
      'The pair (1, A1) differs from (2, A1).'),
    mc('Without AUTOINCREMENT, you delete the row with the largest id, 3. What id does the next row get?', ['4', '1', '3', 'NULL'], 2,
      'The next id is one more than the largest id now in the table.'),
    mc('What is a natural key?', ['A value from the data itself that is already unique, like a country code', 'Any number', 'The first column', 'A key with AUTOINCREMENT'], 0,
      'The other kind, an id number made up for the table, is called a surrogate key.'),
    mc('Can INSERT … SELECT fill a table whose ids are numbered by SQLite?', ['Only one row at a time', 'Yes: leave id out of the column list', 'No', 'Only with AUTOINCREMENT'], 1,
      'Each inserted row gets the next number.'),
  ],
})
