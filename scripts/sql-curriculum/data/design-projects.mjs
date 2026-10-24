// Designing tables: the section's projects (easy, medium, hard).
import { makeProject, mc, qShort, query, snippet } from './_builders.mjs'
import { CHECK, DESIGN_DB } from './design-db.mjs'

const { columns, rows, tables, foreignKeys, indexes, tryIt } = CHECK

// ---- Volunteer rota ---------------------------------------------------------------------

const VOLUNTEERS = 'CREATE TABLE volunteers (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL,\n  email TEXT UNIQUE,\n  joined TEXT NOT NULL\n);'
const SHIFTS = 'CREATE TABLE shifts (\n  id INTEGER PRIMARY KEY,\n  event_title TEXT NOT NULL,\n  shift_date TEXT NOT NULL,\n  hours REAL NOT NULL DEFAULT 4 CHECK (hours > 0)\n);'
const ROTA = 'CREATE TABLE rota (\n  volunteer_id INTEGER NOT NULL REFERENCES volunteers (id) ON DELETE CASCADE,\n  shift_id INTEGER NOT NULL REFERENCES shifts (id) ON DELETE CASCADE,\n  PRIMARY KEY (volunteer_id, shift_id)\n);'
const ROTA_ALL = `PRAGMA foreign_keys = ON;\n${VOLUNTEERS}\n${SHIFTS}\n${ROTA}`

const volunteerRota = makeProject('easy', {
  id: 'proj_volunteer_rota',
  title: 'Volunteer rota',
  database: DESIGN_DB,
  paragraphs: [
    'The venue runs on volunteers. Design three tables for the rota: `volunteers`, the `shifts` that need people, and `rota`, which says who works which shift.',
    'Each challenge starts from the venue\'s database again, so create every table it needs. Later challenges build on the earlier designs: copy them across.',
  ],
  sandboxCode: ROTA_ALL + "\nSELECT name FROM sqlite_schema WHERE type = 'table';",
  sandboxSnippets: [
    snippet('The three tables', ROTA_ALL + "\nSELECT name FROM sqlite_schema WHERE type = 'table';"),
  ],
  readMore: { label: 'SQLite: CREATE TABLE', url: 'https://www.sqlite.org/lang_createtable.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Volunteers', {
      prompt: "Create `volunteers` with `id` (INTEGER PRIMARY KEY), `name` (TEXT, NOT NULL), `email` (TEXT, UNIQUE) and `joined` (TEXT, NOT NULL).",
      hint: 'Four columns, three constraints.',
      solution: VOLUNTEERS,
      checks: [columns('volunteers')],
    }),
    query('easy', 'Shifts', {
      prompt: "Create `shifts` with `id` (INTEGER PRIMARY KEY), `event_title` (TEXT, NOT NULL), `shift_date` (TEXT, NOT NULL) and `hours` (REAL, NOT NULL, default 4, more than 0).",
      hint: '`hours REAL NOT NULL DEFAULT 4 CHECK (hours > 0)`.',
      solution: SHIFTS,
      checks: [columns('shifts'), tryIt('A shift of 0 hours is refused', "INSERT INTO shifts (event_title, shift_date, hours) VALUES ('Jazz Night', '2026-11-06', 0)")],
    }),
    query('medium', 'Who works when', {
      prompt: "Turn on foreign keys and create `volunteers` and `shifts` as above, plus `rota` with `volunteer_id` and `shift_id` (INTEGER NOT NULL, referencing the two tables with ON DELETE CASCADE), the pair as primary key.",
      hint: 'A junction table, like event_performers.',
      solution: ROTA_ALL,
      checks: [columns('rota'), foreignKeys('rota')],
    }),
    query('medium', 'First rota', {
      prompt: "Build the three tables, then add volunteers `Mara Venn` (`mara.venn@example.com`) and `Tomas Ek` (no email), both joined `2026-10-24`, a Jazz Night shift on `2026-11-06` with the default hours, and put both volunteers on it.",
      hint: 'Ids 1 and 2 for the volunteers, 1 for the shift.',
      solution: ROTA_ALL + "\nINSERT INTO volunteers (name, email, joined) VALUES\n  ('Mara Venn', 'mara.venn@example.com', '2026-10-24'),\n  ('Tomas Ek', NULL, '2026-10-24');\nINSERT INTO shifts (event_title, shift_date) VALUES ('Jazz Night', '2026-11-06');\nINSERT INTO rota (volunteer_id, shift_id) VALUES (1, 1), (2, 1);",
      checks: [rows('volunteers', 'id'), rows('shifts', 'id'), rows('rota', 'volunteer_id, shift_id')],
    }),
    query('hard', 'Phones and a fast rota', {
      prompt: "Build the three tables, then add a `phone` column (TEXT) to `volunteers`, and an index on `rota (shift_id)` so the people on a shift are found quickly.",
      hint: 'ALTER TABLE … ADD COLUMN; CREATE INDEX … ON rota (shift_id).',
      solution: ROTA_ALL + '\nALTER TABLE volunteers ADD COLUMN phone TEXT;\nCREATE INDEX rota_shift ON rota (shift_id);',
      checks: [columns('volunteers'), indexes('rota')],
    }),
    query('hard', 'Leaving the rota', {
      prompt: "Build the three tables so that when a volunteer is deleted, their rota rows go too, and a rota row for a volunteer who doesn't exist is refused. (The design from \"Who works when\" does both.)",
      hint: 'PRAGMA foreign_keys = ON, and ON DELETE CASCADE on volunteer_id.',
      solution: ROTA_ALL,
      checks: [
        tryIt('Deleting a volunteer removes their rota rows', "INSERT INTO volunteers (id, name, joined) VALUES (1, 'A', '2026-10-24'), (2, 'B', '2026-10-24'); INSERT INTO shifts (id, event_title, shift_date) VALUES (1, 'E', '2026-11-06'); INSERT INTO rota VALUES (1, 1), (2, 1); DELETE FROM volunteers WHERE id = 1; SELECT * FROM rota"),
        tryIt('A missing volunteer is refused', "INSERT INTO shifts (id, event_title, shift_date) VALUES (1, 'E', '2026-11-06'); INSERT INTO rota VALUES (9, 1)"),
      ],
    }),
  ],
  questions: [
    mc('What kind of table is `rota`?', ['A lookup table', 'A backup', 'A summary', 'A junction table between volunteers and shifts'], 3,
      'One row per (volunteer, shift) pair.'),
    mc('Why is the pair (volunteer_id, shift_id) the primary key?', ['So the same volunteer can\'t be put on the same shift twice', 'It is required for foreign keys', 'To allow NULLs', 'To sort the rota'], 0,
      'Each pair can appear once.'),
    mc('What does ON DELETE CASCADE on volunteer_id do?', ['Refuses deleting volunteers', 'Empties volunteer_id', 'Deletes the volunteer\'s rota rows with them', 'Nothing'], 2,
      'Only with foreign keys turned on.'),
    mc('Why does `hours` have a DEFAULT and a CHECK?', ['To sort', 'They are the same', 'To make it unique', 'Most shifts are 4 hours, and a shift must last some time'], 3,
      'The default fills it in; the CHECK refuses nonsense.'),
    qShort('Which statement adds the phone column? (two words: ALTER …)', 'ALTER TABLE',
      '`ALTER TABLE volunteers ADD COLUMN phone TEXT;`'),
    mc('Why index rota (shift_id)?', ['To make shift_id unique', 'To delete faster only', 'It is required', 'To find the people on a shift without reading the whole rota'], 3,
      'The primary key index starts with volunteer_id, so it doesn\'t help searches by shift alone.'),
  ],
})

// ---- Normalise the sheet ----------------------------------------------------------------

const N_GUESTS = 'CREATE TABLE guests (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL,\n  email TEXT NOT NULL UNIQUE COLLATE NOCASE\n);\nINSERT INTO guests (name, email)\nSELECT DISTINCT guest_name, guest_email FROM ticket_sheet ORDER BY guest_name;'
const N_EVENTS = 'CREATE TABLE events (\n  id INTEGER PRIMARY KEY,\n  title TEXT NOT NULL,\n  event_date TEXT NOT NULL,\n  room_id INTEGER REFERENCES rooms (id),\n  price REAL NOT NULL CHECK (price >= 0)\n);\nINSERT INTO events (title, event_date, room_id, price)\nSELECT DISTINCT s.event_title, s.event_date, r.id, s.price\nFROM ticket_sheet s\nJOIN rooms r ON r.name = s.room\nORDER BY s.event_date, s.event_title;'
const N_TICKETS = "CREATE TABLE tickets (\n  id INTEGER PRIMARY KEY,\n  guest_id INTEGER NOT NULL REFERENCES guests (id),\n  event_id INTEGER NOT NULL REFERENCES events (id) ON DELETE CASCADE,\n  seat TEXT NOT NULL DEFAULT 'standing',\n  UNIQUE (event_id, seat)\n);\nINSERT INTO tickets (guest_id, event_id, seat)\nSELECT g.id, e.id, COALESCE(s.seat, 'standing')\nFROM ticket_sheet s\nJOIN guests g ON g.email = s.guest_email\nJOIN events e ON e.title = s.event_title\nORDER BY g.id, e.id;"
const N_ALL = `PRAGMA foreign_keys = ON;\n${N_GUESTS}\n${N_EVENTS}\n${N_TICKETS}`

const normaliseSheet = makeProject('medium', {
  id: 'proj_normalise_sheet',
  title: 'Normalise the sheet',
  database: DESIGN_DB,
  paragraphs: [
    "Time to replace `ticket_sheet` for good with `guests`, `events` (pointing at `rooms`) and `tickets`, with every rule written into the tables.",
    'Each challenge starts fresh, so each one builds what it needs. The challenges add one table at a time: copy your earlier answers forward.',
  ],
  sandboxCode: N_ALL + '\nSELECT * FROM tickets;',
  sandboxSnippets: [
    snippet('The sheet', 'SELECT * FROM ticket_sheet;'),
    snippet('Rooms', 'SELECT * FROM rooms;'),
  ],
  readMore: { label: 'Wikipedia: database normalization', url: 'https://en.wikipedia.org/wiki/Database_normalization', source: 'Wikipedia' },
  challenges: [
    query('easy', 'Guests', {
      prompt: "Create `guests` (`id` INTEGER PRIMARY KEY, `name` TEXT NOT NULL, `email` TEXT NOT NULL, unique whatever its capitals) and fill it with each different guest from the sheet, in name order.",
      hint: '`email TEXT NOT NULL UNIQUE COLLATE NOCASE`.',
      solution: N_GUESTS,
      checks: [columns('guests'), rows('guests', 'id')],
    }),
    query('medium', 'Events in rooms', {
      prompt: "Create `events` (`id` INTEGER PRIMARY KEY, `title` TEXT NOT NULL, `event_date` TEXT NOT NULL, `room_id` INTEGER referencing `rooms (id)`, `price` REAL NOT NULL and not below 0) and fill it from the sheet, finding the room ids by name, ordered by date and then title.",
      hint: 'SELECT DISTINCT … FROM ticket_sheet s JOIN rooms r ON r.name = s.room ORDER BY …',
      solution: N_EVENTS,
      checks: [columns('events'), foreignKeys('events'), rows('events', 'id')],
    }),
    query('medium', 'Tickets', {
      prompt: "Turn on foreign keys and build `guests` and `events` as above. Then create `tickets`: `id` (INTEGER PRIMARY KEY), `guest_id` (INTEGER NOT NULL, referencing guests), `event_id` (INTEGER NOT NULL, referencing events, ON DELETE CASCADE) and `seat` (TEXT NOT NULL, default `'standing'`), each seat once per event. Fill it from the sheet (missing seats are `standing`), ordered by guest id and then event id.",
      hint: "`COALESCE(s.seat, 'standing')`, and `UNIQUE (event_id, seat)`.",
      solution: N_ALL,
      checks: [columns('tickets'), foreignKeys('tickets'), rows('tickets', 'id')],
    }),
    query('hard', 'Same totals as before', {
      prompt: "Build all three tables, then show each event's `title` with its number of tickets (`tickets`) and takings (`takings`, the sum of the event's price over its tickets), from the new tables, in title order.",
      hint: 'Join tickets to events and group by event.',
      solution: N_ALL + '\nSELECT e.title, COUNT(*) AS tickets, SUM(e.price) AS takings\nFROM tickets t\nJOIN events e ON e.id = t.event_id\nGROUP BY e.id, e.title\nORDER BY e.title;',
      checks: [rows('tickets', 'id')],
    }),
    query('hard', 'Fast lookups', {
      prompt: "Build all three tables, then add indexes on `tickets (guest_id)` and `tickets (event_id)`.",
      hint: 'Two CREATE INDEX statements. (The UNIQUE (event_id, seat) already gives an index starting with event_id, but add both anyway: the check looks for indexes you created.)',
      solution: N_ALL + '\nCREATE INDEX tickets_guest ON tickets (guest_id);\nCREATE INDEX tickets_event ON tickets (event_id);',
      checks: [indexes('tickets')],
    }),
    query('hard', 'Goodbye, sheet', {
      prompt: "In one transaction, build all three tables and then drop `ticket_sheet` and its index.",
      hint: 'Dropping a table drops its indexes too. BEGIN; … DROP TABLE ticket_sheet; COMMIT;',
      solution: 'PRAGMA foreign_keys = ON;\nBEGIN;\n' + N_GUESTS + '\n' + N_EVENTS + '\n' + N_TICKETS + '\nDROP TABLE ticket_sheet;\nCOMMIT;',
      checks: [tables, rows('tickets', 'id')],
    }),
  ],
  questions: [
    mc('Why `COLLATE NOCASE` on the email?', ['To sort emails', 'To make them lower case', 'It is faster', 'So the same email in other capitals counts as a duplicate'], 3,
      'UNIQUE then ignores case.'),
    mc('How are room ids found when building events?', ['They are not needed', 'By typing them', 'By joining the sheet to rooms on the room name', 'With COUNT'], 2,
      'The join looks up each name\'s id.'),
    mc("Why `COALESCE(s.seat, 'standing')`?", ['To remove duplicates', 'Some sheet rows have no seat, and seat is NOT NULL', 'It is required by UNIQUE', 'To sort seats'], 1,
      'Missing seats become standing tickets.'),
    mc('Why can several standing tickets for one event be a problem with `UNIQUE (event_id, seat)`?', ['UNIQUE ignores text', "Two 'standing' seats for the same event would clash", 'They can\'t', 'NULL seats clash'], 1,
      'In this data each event has at most one standing ticket; a real design might keep standing tickets as NULL seats.'),
    qShort('Which statement removes the old sheet? (two words)', 'DROP TABLE',
      'It removes the table\'s indexes too.'),
    mc('Why build everything in one transaction before dropping the sheet?', ['DROP needs it', 'It is faster', 'Indexes need it', 'If anything fails, the sheet is still there'], 3,
      'Never throw away the old data until the new tables are complete.'),
  ],
})

// ---- Venue booking system ---------------------------------------------------------------

const V_ROOMS = 'CREATE TABLE rooms_new (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL UNIQUE,\n  seats INTEGER NOT NULL CHECK (seats > 0)\n);\nINSERT INTO rooms_new (id, name, seats) SELECT id, name, seats FROM rooms;\nDROP TABLE rooms;\nALTER TABLE rooms_new RENAME TO rooms;'
const V_EVENTS = 'CREATE TABLE events (\n  id INTEGER PRIMARY KEY,\n  title TEXT NOT NULL,\n  event_date TEXT NOT NULL CHECK (event_date = date(event_date)),\n  room_id INTEGER REFERENCES rooms (id) ON DELETE SET NULL,\n  price_cents INTEGER NOT NULL DEFAULT 0 CHECK (price_cents >= 0)\n);'
const V_STATUSES = "CREATE TABLE statuses (\n  code TEXT NOT NULL PRIMARY KEY\n);\nINSERT INTO statuses (code) VALUES ('booked'), ('cancelled'), ('used');"
const V_TICKETS = "CREATE TABLE tickets (\n  id INTEGER PRIMARY KEY,\n  event_id INTEGER NOT NULL REFERENCES events (id) ON DELETE CASCADE,\n  guest_email TEXT NOT NULL,\n  seat TEXT,\n  status TEXT NOT NULL DEFAULT 'booked' REFERENCES statuses (code),\n  UNIQUE (event_id, seat)\n);"
const V_ALL = `PRAGMA foreign_keys = ON;\nBEGIN;\n${V_ROOMS}\nCOMMIT;\n${V_EVENTS}\n${V_STATUSES}\n${V_TICKETS}`

const venueSystem = makeProject('hard', {
  id: 'proj_venue_system',
  title: 'Venue booking system',
  database: DESIGN_DB,
  paragraphs: [
    'The venue wants a booking system it can trust. Design it so bad data can\'t get in: rooms with real seat counts, events on real dates in existing rooms, prices in cents, and tickets with known statuses.',
    'Each challenge starts fresh. Copy your earlier answers forward as the design grows.',
  ],
  sandboxCode: V_ALL + "\nSELECT name FROM sqlite_schema WHERE type = 'table';",
  sandboxSnippets: [
    snippet('Whole design', V_ALL + "\nSELECT name FROM sqlite_schema WHERE type = 'table';"),
  ],
  readMore: { label: 'SQLite: foreign key support', url: 'https://www.sqlite.org/foreignkeys.html', source: 'SQLite documentation' },
  challenges: [
    query('medium', 'Stricter rooms', {
      prompt: "In a transaction, rebuild `rooms` so names are unique and required (`name` TEXT NOT NULL UNIQUE) and `seats` (INTEGER NOT NULL) must be more than 0, keeping the rows: create `rooms_new`, copy, drop and rename.",
      hint: 'The rebuild pattern from "Changing and removing tables".',
      solution: 'BEGIN;\n' + V_ROOMS + '\nCOMMIT;',
      checks: [columns('rooms'), rows('rooms', 'id'), tryIt('A room with 0 seats is refused', "INSERT INTO rooms (name, seats) VALUES ('Cupboard', 0)"), tryIt('A repeated name is refused', "INSERT INTO rooms (name, seats) VALUES ('Studio', 10)")],
    }),
    query('hard', 'Events', {
      prompt: "Turn on foreign keys and create `events`: `id` (INTEGER PRIMARY KEY), `title` (TEXT NOT NULL), `event_date` (TEXT NOT NULL, a real YYYY-MM-DD date), `room_id` (INTEGER referencing `rooms (id)`, set to NULL if the room is deleted) and `price_cents` (INTEGER NOT NULL, default 0, not below 0).",
      hint: '`CHECK (event_date = date(event_date))`, `ON DELETE SET NULL`, `CHECK (price_cents >= 0)`.',
      solution: 'PRAGMA foreign_keys = ON;\n' + V_EVENTS,
      checks: [
        columns('events'),
        foreignKeys('events'),
        tryIt('A bad date is refused', "INSERT INTO events (title, event_date) VALUES ('X', '2026-02-30')"),
        tryIt('A missing room is refused', "INSERT INTO events (title, event_date, room_id) VALUES ('X', '2026-11-06', 99)"),
      ],
    }),
    query('hard', 'Tickets with statuses', {
      prompt: "Turn on foreign keys and create `events` as above, a lookup table `statuses` (`code` TEXT NOT NULL PRIMARY KEY) with `booked`, `cancelled` and `used`, and `tickets`: `id` (INTEGER PRIMARY KEY), `event_id` (INTEGER NOT NULL, referencing events, ON DELETE CASCADE), `guest_email` (TEXT NOT NULL), `seat` (TEXT), `status` (TEXT NOT NULL, default `'booked'`, referencing `statuses (code)`), with each seat once per event.",
      hint: 'Create statuses before tickets, and add `UNIQUE (event_id, seat)`.',
      solution: 'PRAGMA foreign_keys = ON;\n' + V_EVENTS + '\n' + V_STATUSES + '\n' + V_TICKETS,
      checks: [
        columns('tickets'),
        foreignKeys('tickets'),
        tryIt('An unknown status is refused', "INSERT INTO events (id, title, event_date) VALUES (1, 'E', '2026-11-06'); INSERT INTO tickets (event_id, guest_email, status) VALUES (1, 'a@example.com', 'lost')"),
        tryIt('A seat twice is refused', "INSERT INTO events (id, title, event_date) VALUES (1, 'E', '2026-11-06'); INSERT INTO tickets (event_id, guest_email, seat) VALUES (1, 'a@example.com', 'A1'), (1, 'b@example.com', 'A1')"),
      ],
    }),
    query('hard', 'Load the sheet', {
      prompt: "Build the whole design (stricter rooms, events, statuses, tickets), then load the sheet: each event once (finding room ids by name, price in cents, ordered by date then title) and each ticket (ordered by event id, then guest email).",
      hint: "`CAST(ROUND(price * 100) AS INTEGER)` for cents. Tickets: `SELECT e.id, s.guest_email, s.seat FROM ticket_sheet s JOIN events e ON e.title = s.event_title ORDER BY e.id, s.guest_email`.",
      solution: V_ALL + "\nINSERT INTO events (title, event_date, room_id, price_cents)\nSELECT DISTINCT s.event_title, s.event_date, r.id, CAST(ROUND(s.price * 100) AS INTEGER)\nFROM ticket_sheet s\nJOIN rooms r ON r.name = s.room\nORDER BY s.event_date, s.event_title;\nINSERT INTO tickets (event_id, guest_email, seat)\nSELECT e.id, s.guest_email, s.seat\nFROM ticket_sheet s\nJOIN events e ON e.title = s.event_title\nORDER BY e.id, s.guest_email;",
      checks: [rows('events', 'id'), rows('tickets', 'id')],
    }),
    query('hard', 'Indexes for the box office', {
      prompt: "Build the whole design, then add an index on `tickets (guest_email)` and one on `events (event_date)`.",
      hint: 'Two CREATE INDEX statements after the tables.',
      solution: V_ALL + '\nCREATE INDEX tickets_email ON tickets (guest_email);\nCREATE INDEX events_date ON events (event_date);',
      checks: [indexes('tickets'), indexes('events')],
    }),
    query('hard', 'When a room closes', {
      prompt: "Build the whole design and load the sheet as in \"Load the sheet\". Then the Garden closes for good: delete it from `rooms`. Its events must stay, with no room.",
      hint: 'ON DELETE SET NULL on events.room_id does the work; delete the room by name.',
      solution: V_ALL + "\nINSERT INTO events (title, event_date, room_id, price_cents)\nSELECT DISTINCT s.event_title, s.event_date, r.id, CAST(ROUND(s.price * 100) AS INTEGER)\nFROM ticket_sheet s\nJOIN rooms r ON r.name = s.room\nORDER BY s.event_date, s.event_title;\nINSERT INTO tickets (event_id, guest_email, seat)\nSELECT e.id, s.guest_email, s.seat\nFROM ticket_sheet s\nJOIN events e ON e.title = s.event_title\nORDER BY e.id, s.guest_email;\nDELETE FROM rooms WHERE name = 'Garden';",
      checks: [rows('rooms', 'id'), rows('events', 'id'), rows('tickets', 'id')],
    }),
  ],
  questions: [
    mc('Why rebuild `rooms` instead of using ALTER TABLE?', ["SQLite's ALTER TABLE can't add UNIQUE or CHECK to existing columns", 'ALTER TABLE deletes rows', 'Rebuilding is faster', 'It is not needed'], 0,
      'Create, copy, drop, rename, inside a transaction.'),
    mc('What does `CHECK (event_date = date(event_date))` refuse?', ['NULL dates', 'Every date', "Text that isn't a real date in YYYY-MM-DD form", 'Dates in the past'], 2,
      "date('2026-02-30') is NULL, so the check fails."),
    mc('Why store prices as `price_cents` INTEGER?', ['To sort them', 'Cents are shorter', 'REAL is not allowed', 'Whole cents are exact; decimal numbers may not be'], 3,
      '12.50 becomes 1250.'),
    mc('Why must `statuses` be created and filled before tickets are added?', ["With foreign keys on, a ticket's status must already exist in statuses", 'Tables must be created in name order', 'Lookup tables are slow', 'It is not needed'], 0,
      'Parents first.'),
    qShort('Which rule on events.room_id keeps events when their room is deleted? (ON DELETE …, two words)', 'SET NULL',
      '`ON DELETE SET NULL`.'),
    mc('What does `CAST(ROUND(price * 100) AS INTEGER)` give for 12.5?', ['1250', '12', '125', '1250.0'], 0,
      'Rounded to whole cents, then made an integer.'),
  ],
})

export const designProjects = [volunteerRota, normaliseSheet, venueSystem]
