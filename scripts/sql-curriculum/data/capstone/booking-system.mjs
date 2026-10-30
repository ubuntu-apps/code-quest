// Capstone projects: Building a booking system, step by step.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { CHECK as ADV } from '../advanced-db.mjs'
import { CHECK as DESIGN } from '../design-db.mjs'
import { BOOKING_DB } from '../capstone-db.mjs'

const { columns, foreignKeys, tryIt } = DESIGN
const { viewColumns, viewRows, indexes, plan } = ADV

// Each step's SQL; a step's starter is every step before it.
const STEPS = [
  'CREATE TABLE cottages (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL UNIQUE,\n  sleeps INTEGER NOT NULL CHECK (sleeps > 0),\n  nightly_rate REAL NOT NULL\n);\nINSERT INTO cottages (name, sleeps, nightly_rate)\nSELECT name, sleeps, nightly_rate FROM cottage_sheet ORDER BY name;',
  'CREATE TABLE guests (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL,\n  email TEXT NOT NULL UNIQUE\n);\nINSERT INTO guests (name, email)\nSELECT MIN(guest_name), guest_email FROM requests GROUP BY guest_email ORDER BY guest_email;',
  'CREATE TABLE bookings (\n  id INTEGER PRIMARY KEY,\n  guest_id INTEGER NOT NULL REFERENCES guests (id),\n  cottage_id INTEGER NOT NULL REFERENCES cottages (id),\n  arrive TEXT NOT NULL,\n  depart TEXT NOT NULL,\n  party INTEGER NOT NULL CHECK (party > 0),\n  CHECK (depart > arrive)\n);',
  'INSERT INTO bookings (guest_id, cottage_id, arrive, depart, party)\nSELECT g.id, c.id, r.arrive, r.depart, r.party\nFROM requests r\nJOIN guests g ON g.email = r.guest_email\nJOIN cottages c ON c.name = r.cottage\nWHERE r.party <= c.sleeps\nORDER BY r.id;',
]
const DELETE_CLASHES = 'DELETE FROM bookings\nWHERE EXISTS (\n  SELECT 1 FROM bookings a\n  WHERE a.cottage_id = bookings.cottage_id\n    AND a.id < bookings.id\n    AND a.arrive < bookings.depart\n    AND bookings.arrive < a.depart\n);'
const INDEX = 'CREATE INDEX bookings_cottage_arrive ON bookings (cottage_id, arrive);'
const VIEW = 'CREATE VIEW cottage_summary AS\nSELECT c.name AS cottage,\n       COUNT(b.id) AS bookings,\n       COALESCE(SUM(julianday(b.depart) - julianday(b.arrive)), 0) AS nights,\n       ROUND(COALESCE(SUM((julianday(b.depart) - julianday(b.arrive)) * c.nightly_rate), 0), 2) AS revenue\nFROM cottages c\nLEFT JOIN bookings b ON b.cottage_id = c.id\nGROUP BY c.id, c.name;'

const upTo = (n) => STEPS.slice(0, n).join('\n\n')
const ALL = [...STEPS, DELETE_CLASHES, INDEX, VIEW]
const before = (n) => ALL.slice(0, n).join('\n\n') + '\n\n'
const BOOKING_ROWS = [
  'The bookings table has the right rows',
  'SELECT b.id, g.email, c.name, b.arrive, b.depart, b.party\nFROM bookings b\nJOIN guests g ON g.id = b.guest_id\nJOIN cottages c ON c.id = b.cottage_id\nORDER BY b.id',
]

export default makeTopic({
  id: 'booking_system',
  title: 'Building a booking system',
  database: BOOKING_DB,
  paragraphs: [
    "The last capstone builds a database instead of only reading one. A family runs a few holiday cottages, and until now every booking request has gone into a spreadsheet. Two sheets have been loaded as they are: `cottage_sheet` (each cottage, how many it sleeps and its nightly rate) and `requests` (who asked for which cottage, when, and for how many people).",
    "Over ten steps you'll design proper tables, move the data across, find and fix double bookings, speed up the lookups and build the reports. **Each step starts from the sheets again**, so the starter code carries all your earlier steps; add the new step after them. If an earlier step was wrong, fix it in the starter.",
    "The design: `cottages` and `guests` each get an id, and `bookings` points to both, one row per stay. A stay is from `arrive` to `depart`, and the guests sleep the nights in between: arriving on the 2nd and leaving on the 5th is 3 nights, and someone else can arrive on the 5th.",
    "```\ncottages (id, name, sleeps, nightly_rate)\nguests   (id, name, email)\nbookings (id, guest_id → guests, cottage_id → cottages, arrive, depart, party)\n```",
    "Two stays at the same cottage clash when each starts before the other ends: `a.arrive < b.depart AND b.arrive < a.depart`. That one condition covers every kind of overlap, and stays that only touch (one leaves the day the other arrives) don't count.",
  ],
  sandboxCode: 'SELECT * FROM requests ORDER BY id;',
  sandboxSnippets: [
    snippet('The requests', 'SELECT * FROM requests ORDER BY id;'),
    snippet('The cottages', 'SELECT * FROM cottage_sheet ORDER BY name;'),
    snippet('Nights in a stay', "SELECT julianday('2026-10-05') - julianday('2026-10-02') AS nights;"),
  ],
  readMore: { label: 'SQLite: CREATE TABLE', url: 'https://www.sqlite.org/lang_createtable.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Cottages', {
      prompt: "Create `cottages` with `id` (INTEGER PRIMARY KEY), `name` (TEXT, NOT NULL, UNIQUE), `sleeps` (INTEGER, NOT NULL, more than 0) and `nightly_rate` (REAL, NOT NULL). Fill it from `cottage_sheet`, in name order.",
      hint: 'CREATE TABLE, then `INSERT INTO cottages (name, sleeps, nightly_rate) SELECT … FROM cottage_sheet ORDER BY name;`.',
      solution: upTo(1),
      checks: [
        columns('cottages'),
        ['The cottages table has the right rows', 'SELECT id, name, sleeps, nightly_rate FROM cottages ORDER BY id'],
        tryIt('A cottage must sleep someone', "INSERT INTO cottages (name, sleeps, nightly_rate) VALUES ('Test Hut', 0, 50)"),
      ],
    }),
    query('easy', 'Guests', {
      prompt: "Keep step 1, then create `guests` with `id` (INTEGER PRIMARY KEY), `name` (TEXT, NOT NULL) and `email` (TEXT, NOT NULL, UNIQUE). Fill it with one row per email in `requests`, in email order.",
      starter: before(1),
      hint: 'Some guests asked more than once. `SELECT MIN(guest_name), guest_email FROM requests GROUP BY guest_email ORDER BY guest_email`.',
      solution: upTo(2),
      checks: [columns('guests'), ['The guests table has the right rows', 'SELECT id, name, email FROM guests ORDER BY id']],
    }),
    query('easy', 'Bookings', {
      prompt: "Keep steps 1 and 2, then create `bookings`: `id` (INTEGER PRIMARY KEY), `guest_id` (INTEGER, NOT NULL, references guests), `cottage_id` (INTEGER, NOT NULL, references cottages), `arrive` and `depart` (TEXT, NOT NULL), `party` (INTEGER, NOT NULL, more than 0), and a table CHECK that `depart > arrive`.",
      starter: before(2),
      hint: '`guest_id INTEGER NOT NULL REFERENCES guests (id)`, … and a last line `CHECK (depart > arrive)`.',
      solution: upTo(3),
      checks: [
        columns('bookings'),
        foreignKeys('bookings'),
        tryIt('A stay must end after it starts', "INSERT INTO bookings (guest_id, cottage_id, arrive, depart, party) VALUES (1, 1, '2026-10-05', '2026-10-05', 2)"),
      ],
    }),
    query('medium', 'Move the requests across', {
      prompt: "Keep steps 1 to 3, then fill `bookings` from `requests`, in request id order. Leave out requests for more people than the cottage sleeps.",
      starter: before(3),
      hint: 'INSERT … SELECT from requests joined to guests (on the email) and cottages (on the name), `WHERE r.party <= c.sleeps ORDER BY r.id`.',
      solution: upTo(4),
      checks: [BOOKING_ROWS],
    }),
    query('medium', 'Stays and prices', {
      prompt: "Keep steps 1 to 4, then show every booking: the guest's name (`guest`), the `cottage` name, `arrive`, the number of `nights` and the `cost` (nights times the nightly rate). Sort by arrival, then cottage.",
      starter: before(4),
      hint: '`CAST(julianday(b.depart) - julianday(b.arrive) AS INTEGER) AS nights`.',
      solution: upTo(4) + '\n\nSELECT g.name AS guest, c.name AS cottage, b.arrive,\n       CAST(julianday(b.depart) - julianday(b.arrive) AS INTEGER) AS nights,\n       (julianday(b.depart) - julianday(b.arrive)) * c.nightly_rate AS cost\nFROM bookings b\nJOIN guests g ON g.id = b.guest_id\nJOIN cottages c ON c.id = b.cottage_id\nORDER BY b.arrive, cottage;',
    }),
    query('medium', 'Double bookings', {
      prompt: "Keep steps 1 to 4, then find the clashes: pairs of bookings for the same cottage whose stays overlap. Show the `cottage`, the earlier booking's id (`first_booking`) and the later one's (`second_booking`). Sort by first_booking, then second_booking.",
      starter: before(4),
      hint: 'Join bookings to itself: `b.cottage_id = a.cottage_id AND a.id < b.id AND a.arrive < b.depart AND b.arrive < a.depart`.',
      solution: upTo(4) + '\n\nSELECT c.name AS cottage, a.id AS first_booking, b.id AS second_booking\nFROM bookings a\nJOIN bookings b ON b.cottage_id = a.cottage_id AND a.id < b.id\n                AND a.arrive < b.depart AND b.arrive < a.depart\nJOIN cottages c ON c.id = a.cottage_id\nORDER BY first_booking, second_booking;',
    }),
    query('hard', 'Cancel the clashes', {
      prompt: "Keep steps 1 to 4, then delete every booking that clashes with an earlier one (a lower id) for the same cottage. The first request wins.",
      starter: before(4),
      hint: '`DELETE FROM bookings WHERE EXISTS (SELECT 1 FROM bookings a WHERE a.cottage_id = bookings.cottage_id AND a.id < bookings.id AND …overlap…)`.',
      solution: before(4) + DELETE_CLASHES,
      checks: [BOOKING_ROWS],
    }),
    query('hard', 'Fast lookups', {
      prompt: "Keep steps 1 to 4 and the DELETE, then create an index called `bookings_cottage_arrive` so that looking up one cottage's bookings from a date, like `SELECT * FROM bookings WHERE cottage_id = 1 AND arrive >= '2026-10-10'`, is a SEARCH.",
      starter: before(5),
      hint: 'Equality column first, then the range: `bookings (cottage_id, arrive)`.',
      solution: before(5) + INDEX,
      checks: [indexes('bookings'), plan('The lookup searches with the index', "SELECT * FROM bookings WHERE cottage_id = 1 AND arrive >= '2026-10-10'")],
    }),
    query('expert', 'Cottage summary', {
      prompt: "Keep everything so far, then create a view `cottage_summary` with every cottage (`cottage`), its number of `bookings`, the `nights` booked and the `revenue` (2 decimals), all 0 for a cottage with no bookings.",
      starter: before(6),
      hint: 'LEFT JOIN bookings to cottages; `COALESCE(SUM(julianday(b.depart) - julianday(b.arrive)), 0)` for the nights.',
      solution: before(6) + VIEW,
      checks: [viewColumns('cottage_summary'), viewRows('cottage_summary', 'cottage')],
    }),
    query('expert', 'October calendar', {
      prompt: "Keep everything so far, then show every night of October 2026 (`night`) for the first cottage by name, with the name of the guest staying that night (`guest`; empty when it is free). In date order.",
      starter: before(7),
      hint: "A recursive calendar from '2026-10-01' to '2026-10-31'. LEFT JOIN bookings on that cottage and `n.night >= b.arrive AND n.night < b.depart`, then LEFT JOIN guests. The cottage id is `(SELECT id FROM cottages ORDER BY name LIMIT 1)`.",
      solution: before(7) + "WITH RECURSIVE nights(night) AS (\n  SELECT '2026-10-01'\n  UNION ALL\n  SELECT date(night, '+1 day') FROM nights WHERE night < '2026-10-31'\n)\nSELECT n.night, g.name AS guest\nFROM nights n\nLEFT JOIN bookings b ON b.cottage_id = (SELECT id FROM cottages ORDER BY name LIMIT 1)\n                    AND n.night >= b.arrive AND n.night < b.depart\nLEFT JOIN guests g ON g.id = b.guest_id\nORDER BY n.night;",
    }),
  ],
  questions: [
    mc('Why do guests get their own table instead of a name and email on every booking?', ['SQLite needs it', 'A guest who books twice is stored once, so their details can\'t disagree', 'Bookings can\'t hold text', 'It is faster to type'], 1,
      'That is normalisation.'),
    mc('Why fill guests with `GROUP BY guest_email`?', ['To find the newest', 'GROUP BY is needed by INSERT', 'To sort them', 'Each email becomes one guest, even if they asked several times'], 3,
      'UNIQUE on email would refuse the repeats otherwise.'),
    mc("What does `julianday('2026-07-05') - julianday('2026-07-02')` give?", ["`2.0`", "`4.0`", "`3.0`", "`5.0`"], 2,
      "julianday turns each date into a day number, so the difference is the number of nights: arriving on the 2nd and leaving on the 5th is 3 nights."),
    mc('When do two stays at the same cottage clash?', ['When they arrive the same day', 'When one leaves the day the other arrives', 'When they are booked by the same guest', 'When each starts before the other ends'], 3,
      '`a.arrive < b.depart AND b.arrive < a.depart`.'),
    qShort('Which keyword, in the bookings table, makes guest_id point to a row of guests?', 'REFERENCES',
      '`guest_id INTEGER NOT NULL REFERENCES guests (id)`.'),
    mc('Why `a.id < b.id` in the clash join?', ['To sort by id', 'Lower ids are cheaper', 'It is needed by EXISTS', 'Each pair is listed once, and a booking isn\'t paired with itself'], 3,
      'Without it, every clash shows twice and every booking clashes with itself.'),
    mc('Why does the request id order matter when filling bookings?', ['To group the guests', 'It doesn\'t', 'The booking ids follow it, and the clash rule keeps the lower id, so the first request wins', 'INSERT needs ORDER BY'], 2,
      'ids are given in the order rows are inserted.'),
    mc('Which index serves `WHERE cottage_id = 1 AND arrive >= …`?', ['(cottage_id, arrive)', '(party)', '(arrive)', '(arrive, cottage_id)'], 0,
      'The equality column first, then the range.'),
    mc('Why LEFT JOIN bookings in the cottage summary?', ['Views must', 'To remove clashes', 'So a cottage with no bookings still shows, with 0', 'To sort the cottages'], 2,
      'COALESCE turns its NULL sums into 0.'),
    mc('In the calendar, why `n.night < b.depart` and not `<=`?', ['It is shorter', 'To skip the first night', 'Guests don\'t sleep there on the night they leave', 'Dates can\'t be equal'], 2,
      'The departure day is free for the next guests.'),
  ],
})
