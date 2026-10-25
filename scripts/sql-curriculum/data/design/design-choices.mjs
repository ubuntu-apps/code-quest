// Designing tables: Design choices.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { CHECK, DESIGN_DB } from '../design-db.mjs'

const { columns, rows, foreignKeys, tryIt } = CHECK

export default makeTopic({
  id: 'design_choices',
  title: 'Design choices',
  database: DESIGN_DB,
  paragraphs: [
    'Designing tables is mostly a few questions, asked again for each thing you store.',
    "**What are the things, and how do they relate?** Each kind of thing gets a table. One-to-many (a room has many events) is a foreign key in the \"many\" table. Many-to-many (events and performers) is a junction table with a key for each side. One-to-one, such as an optional profile for a guest, is a table whose primary key is also the foreign key.",
    "**What does each column hold, exactly?** One value per column: never a comma-separated list like `'jazz,live'`, which can't be searched, joined or checked properly. Money is safest as a whole number of cents (`1250` for 12.50), because decimal numbers like 0.1 can't be stored exactly. Dates are `YYYY-MM-DD` text, and true/false is 0 or 1.",
    "**What must always be true?** Write it into the table: `NOT NULL` for required values, `UNIQUE` for things that can't repeat, `CHECK` for allowed values, and foreign keys for links. A rule in the table is checked on every change, by every program, forever.",
    "```\nCREATE TABLE prices (\n  item TEXT NOT NULL UNIQUE,\n  cents INTEGER NOT NULL CHECK (cents >= 0)\n);\n```",
    "A short list of allowed values can be a `CHECK (status IN (…))`. If the list changes often or has details of its own, make it a small lookup table and point to it with a foreign key.",
  ],
  sandboxCode: "SELECT 0.1 + 0.2 AS decimals, 10 + 20 AS cents;",
  sandboxSnippets: [
    snippet('Why cents', "SELECT 0.1 + 0.2 AS decimals, 0.1 + 0.2 = 0.3 AS equal, 10 + 20 AS cents;"),
    snippet('A valid date?', "SELECT date('2026-11-06') AS good, date('2026-13-01') AS bad_month, date('6/11/2026') AS bad_form;"),
    snippet('Prices in cents', "CREATE TABLE prices (\n  item TEXT NOT NULL UNIQUE,\n  cents INTEGER NOT NULL CHECK (cents >= 0)\n);\nINSERT INTO prices VALUES ('Ticket', 1250);\nSELECT item, cents / 100.0 AS price FROM prices;"),
  ],
  readMore: { label: 'SQLite: CREATE TABLE', url: 'https://www.sqlite.org/lang_createtable.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'One room, many events', {
      prompt: "Turn on foreign keys and create `events` with `id` (INTEGER PRIMARY KEY), `title` (TEXT NOT NULL) and `room_id` (INTEGER NOT NULL, referencing `rooms (id)`).",
      hint: 'The "many" side holds the foreign key.',
      solution: 'PRAGMA foreign_keys = ON;\nCREATE TABLE events (\n  id INTEGER PRIMARY KEY,\n  title TEXT NOT NULL,\n  room_id INTEGER NOT NULL REFERENCES rooms (id)\n);',
      checks: [columns('events'), foreignKeys('events')],
    }),
    query('easy', 'Prices in cents', {
      prompt: "Create `prices` with `item` (TEXT, NOT NULL, UNIQUE) and `cents` (INTEGER, NOT NULL, not below 0), then store a `Ticket` costing 12.50 and a `Programme` costing 3.00, in cents.",
      hint: '1250 and 300.',
      solution: "CREATE TABLE prices (\n  item TEXT NOT NULL UNIQUE,\n  cents INTEGER NOT NULL CHECK (cents >= 0)\n);\nINSERT INTO prices (item, cents) VALUES ('Ticket', 1250), ('Programme', 300);",
      checks: [columns('prices'), rows('prices', 'item')],
    }),
    query('easy', 'Yes or no', {
      prompt: "Create `rooms_info` with `room_id` (INTEGER PRIMARY KEY) and `has_stage` (INTEGER, NOT NULL, default 0), where `has_stage` can only be 0 or 1.",
      hint: '`CHECK (has_stage IN (0, 1))`.',
      solution: 'CREATE TABLE rooms_info (\n  room_id INTEGER PRIMARY KEY,\n  has_stage INTEGER NOT NULL DEFAULT 0 CHECK (has_stage IN (0, 1))\n);',
      checks: [columns('rooms_info'), tryIt('2 is refused', 'INSERT INTO rooms_info VALUES (1, 2)')],
    }),
    query('medium', 'Real dates only', {
      prompt: "Create `events` with `title` (TEXT, NOT NULL) and `event_date` (TEXT, NOT NULL), where the date must be a real date in `YYYY-MM-DD` form.",
      hint: "`date(x)` gives the date back in that form, or NULL if it isn't one: `CHECK (event_date = date(event_date))`.",
      solution: 'CREATE TABLE events (\n  title TEXT NOT NULL,\n  event_date TEXT NOT NULL CHECK (event_date = date(event_date))\n);',
      checks: [
        columns('events'),
        tryIt('Month 13 is refused', "INSERT INTO events VALUES ('X', '2026-13-01')"),
        tryIt('Another date form is refused', "INSERT INTO events VALUES ('X', '6/11/2026')"),
        tryIt('A real date is fine', "INSERT INTO events VALUES ('X', '2026-11-06'); SELECT * FROM events"),
      ],
    }),
    query('medium', 'Optional profiles', {
      prompt: "Turn on foreign keys. Create `guests` (`id` INTEGER PRIMARY KEY, `name` TEXT NOT NULL) and `guest_profiles`, whose primary key `guest_id` (INTEGER) also references `guests (id)`, with a `bio` (TEXT). A guest can have at most one profile.",
      hint: '`guest_id INTEGER PRIMARY KEY REFERENCES guests (id)`.',
      solution: 'PRAGMA foreign_keys = ON;\nCREATE TABLE guests (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL\n);\nCREATE TABLE guest_profiles (\n  guest_id INTEGER PRIMARY KEY REFERENCES guests (id),\n  bio TEXT\n);',
      checks: [
        columns('guest_profiles'),
        foreignKeys('guest_profiles'),
        tryIt('A second profile for one guest is refused', "INSERT INTO guests VALUES (1, 'A'); INSERT INTO guest_profiles VALUES (1, 'x'); INSERT INTO guest_profiles VALUES (1, 'y')"),
      ],
    }),
    query('medium', 'Performers at events', {
      prompt: "Turn on foreign keys. Create `events` (`id` INTEGER PRIMARY KEY, `title` TEXT NOT NULL), `performers` (`id` INTEGER PRIMARY KEY, `name` TEXT NOT NULL) and `event_performers` (`event_id`, `performer_id`, both INTEGER NOT NULL, referencing the two tables with ON DELETE CASCADE, the pair as primary key).",
      hint: 'A junction table: one row per (event, performer) pair.',
      solution: 'PRAGMA foreign_keys = ON;\nCREATE TABLE events (id INTEGER PRIMARY KEY, title TEXT NOT NULL);\nCREATE TABLE performers (id INTEGER PRIMARY KEY, name TEXT NOT NULL);\nCREATE TABLE event_performers (\n  event_id INTEGER NOT NULL REFERENCES events (id) ON DELETE CASCADE,\n  performer_id INTEGER NOT NULL REFERENCES performers (id) ON DELETE CASCADE,\n  PRIMARY KEY (event_id, performer_id)\n);',
      checks: [columns('event_performers'), foreignKeys('event_performers')],
    }),
    query('hard', 'A lookup table', {
      prompt: "Turn on foreign keys. Create `statuses` with `code` (TEXT, NOT NULL, primary key) and `label` (TEXT), add the codes `booked` (Booked), `cancelled` (Cancelled) and `used` (Used), then create `tickets` with `seat` (TEXT) and `status` (TEXT, NOT NULL, default `'booked'`, referencing `statuses (code)`).",
      hint: '`status TEXT NOT NULL DEFAULT \'booked\' REFERENCES statuses (code)`.',
      solution: "PRAGMA foreign_keys = ON;\nCREATE TABLE statuses (\n  code TEXT NOT NULL PRIMARY KEY,\n  label TEXT\n);\nINSERT INTO statuses (code, label) VALUES ('booked', 'Booked'), ('cancelled', 'Cancelled'), ('used', 'Used');\nCREATE TABLE tickets (\n  seat TEXT,\n  status TEXT NOT NULL DEFAULT 'booked' REFERENCES statuses (code)\n);",
      checks: [
        rows('statuses', 'code'),
        foreignKeys('tickets'),
        tryIt('An unknown status is refused', "INSERT INTO tickets VALUES ('A1', 'lost')"),
        tryIt('The default is booked', "INSERT INTO tickets (seat) VALUES ('A1'); SELECT * FROM tickets"),
      ],
    }),
    query('hard', 'Price history', {
      prompt: "Turn on foreign keys. Create `events` (`id` INTEGER PRIMARY KEY, `title` TEXT NOT NULL) and `event_prices`, which keeps every price an event has had: `event_id` (INTEGER NOT NULL, referencing events), `cents` (INTEGER NOT NULL, not below 0) and `valid_from` (TEXT NOT NULL), with (`event_id`, `valid_from`) as primary key.",
      hint: 'One row per price change; the pair (event, start date) is unique.',
      solution: 'PRAGMA foreign_keys = ON;\nCREATE TABLE events (id INTEGER PRIMARY KEY, title TEXT NOT NULL);\nCREATE TABLE event_prices (\n  event_id INTEGER NOT NULL REFERENCES events (id),\n  cents INTEGER NOT NULL CHECK (cents >= 0),\n  valid_from TEXT NOT NULL,\n  PRIMARY KEY (event_id, valid_from)\n);',
      checks: [
        columns('event_prices'),
        foreignKeys('event_prices'),
        tryIt('Two prices from the same day are refused', "INSERT INTO events VALUES (1, 'E'); INSERT INTO event_prices VALUES (1, 800, '2026-11-01'); INSERT INTO event_prices VALUES (1, 900, '2026-11-01')"),
      ],
    }),
    query('expert', 'A waitlist', {
      prompt: "Turn on foreign keys. Create `events` (`id` INTEGER PRIMARY KEY, `title` TEXT NOT NULL) and `waitlist` with `event_id` (INTEGER NOT NULL, referencing events, ON DELETE CASCADE), `guest_email` (TEXT NOT NULL) and `position` (INTEGER NOT NULL, more than 0). Each position and each guest can appear only once per event.",
      hint: 'Two table-level UNIQUE constraints: `UNIQUE (event_id, position)` and `UNIQUE (event_id, guest_email)`.',
      solution: 'PRAGMA foreign_keys = ON;\nCREATE TABLE events (id INTEGER PRIMARY KEY, title TEXT NOT NULL);\nCREATE TABLE waitlist (\n  event_id INTEGER NOT NULL REFERENCES events (id) ON DELETE CASCADE,\n  guest_email TEXT NOT NULL,\n  position INTEGER NOT NULL CHECK (position > 0),\n  UNIQUE (event_id, position),\n  UNIQUE (event_id, guest_email)\n);',
      checks: [
        columns('waitlist'),
        foreignKeys('waitlist'),
        tryIt('Position 0 is refused', "INSERT INTO events VALUES (1, 'E'); INSERT INTO waitlist VALUES (1, 'a@example.com', 0)"),
        tryIt('A taken position is refused', "INSERT INTO events VALUES (1, 'E'); INSERT INTO waitlist VALUES (1, 'a@example.com', 1); INSERT INTO waitlist VALUES (1, 'b@example.com', 1)"),
        tryIt('A guest twice is refused', "INSERT INTO events VALUES (1, 'E'); INSERT INTO waitlist VALUES (1, 'a@example.com', 1); INSERT INTO waitlist VALUES (1, 'a@example.com', 2)"),
      ],
    }),
    query('expert', 'No more lists', {
      prompt: "Instead of storing tags as a list like `'jazz,live'` in one column, create `event_tags` with `event_title` (TEXT NOT NULL) and `tag` (TEXT NOT NULL), the pair as primary key, and store Jazz Night's tags `jazz` and `live` and Film Club's tag `film` as one row each.",
      hint: 'One value per column: three rows.',
      solution: "CREATE TABLE event_tags (\n  event_title TEXT NOT NULL,\n  tag TEXT NOT NULL,\n  PRIMARY KEY (event_title, tag)\n);\nINSERT INTO event_tags VALUES ('Jazz Night', 'jazz'), ('Jazz Night', 'live'), ('Film Club', 'film');",
      checks: [columns('event_tags'), rows('event_tags', 'event_title, tag')],
    }),
  ],
  questions: [
    mc('Where does the foreign key go in a one-to-many relationship (a room has many events)?', ['In the "many" table: events.room_id', 'In rooms', 'In both', 'In a junction table'], 0,
      'Each event points to its one room.'),
    mc('Why not store tags as `\'jazz,live\'` in one column?', ['It is slower to insert', 'It is too long', 'It can\'t be searched, joined or checked properly', 'Commas are not allowed'], 2,
      'One value per column; use a separate table for lists.'),
    mc('Why store money as whole cents?', ['It is shorter', 'REAL is not allowed', 'Decimal numbers like 0.1 can\'t be stored exactly', 'Cents sort better'], 2,
      '0.1 + 0.2 is not exactly 0.3 as a REAL.'),
    mc('How is a one-to-one relationship, like an optional profile, usually made?', ['A table whose primary key is also the foreign key', 'Two foreign keys', 'A junction table', 'One big table'], 0,
      'So each guest has at most one profile.'),
    qShort('Which function checks a date, giving NULL for `2026-13-01`?', 'date',
      '`CHECK (event_date = date(event_date))`.'),
    mc('Why write rules into the table rather than into each program?', ['It is required', 'They are checked on every change, by every program', 'They are faster to type', 'Programs can\'t check rules'], 1,
      'The database is the one place every change passes through.'),
    mc('When is a lookup table better than `CHECK (status IN (…))`?', ['For numbers', 'For dates', 'Never', 'When the list changes often or has details of its own'], 3,
      'Adding a row is easier than rebuilding a table to change a CHECK.'),
    mc('How do you keep every price an event has had?', ['Update the price each time', 'A list in one column', 'A table with one row per price and its start date', 'Many price columns'], 2,
      'History is rows, not columns.'),
    mc('What does `UNIQUE (event_id, position)` stop?', ['Two guests at the same position on one waitlist', 'Two events with position 1', 'Any repeated position', 'Missing positions'], 0,
      'Each position once per event.'),
  ],
})
