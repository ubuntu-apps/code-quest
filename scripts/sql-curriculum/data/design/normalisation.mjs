// Designing tables: Splitting data into tables (normalisation).
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { CHECK, DESIGN_DB } from '../design-db.mjs'

const { columns, rows, foreignKeys } = CHECK

const GUESTS = 'CREATE TABLE guests (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL,\n  email TEXT UNIQUE\n);\nINSERT INTO guests (name, email)\nSELECT DISTINCT guest_name, guest_email FROM ticket_sheet ORDER BY guest_name;'
const EVENTS = 'CREATE TABLE events (\n  id INTEGER PRIMARY KEY,\n  title TEXT NOT NULL,\n  event_date TEXT NOT NULL,\n  room TEXT,\n  price REAL NOT NULL\n);\nINSERT INTO events (title, event_date, room, price)\nSELECT DISTINCT event_title, event_date, room, price FROM ticket_sheet ORDER BY event_date, event_title;'
const TICKETS = 'CREATE TABLE tickets (\n  id INTEGER PRIMARY KEY,\n  guest_id INTEGER NOT NULL REFERENCES guests (id),\n  event_id INTEGER NOT NULL REFERENCES events (id),\n  seat TEXT\n);\nINSERT INTO tickets (guest_id, event_id, seat)\nSELECT g.id, e.id, s.seat\nFROM ticket_sheet s\nJOIN guests g ON g.email = s.guest_email\nJOIN events e ON e.title = s.event_title\nORDER BY g.id, e.id;'

export default makeTopic({
  id: 'normalisation',
  title: 'Splitting data into tables',
  database: DESIGN_DB,
  paragraphs: [
    "`ticket_sheet` is one big table, like a spreadsheet: one row per ticket, with the guest's name and email and the event's title, date, room and price copied onto every row. That causes three kinds of trouble:",
    "**Repetition.** Jazz Night's date and price are stored once per ticket. **Changes in many places.** If Jazz Night moves, every one of its rows must be updated, and missing one leaves the data contradicting itself. **Facts tied to other facts.** An event with no tickets yet can't be stored at all, and deleting a guest's last ticket loses their email.",
    'The cure is to give each kind of thing its own table and store each fact **once**: guests in `guests`, events in `events`, and a ticket as a small row that points at both. This is called **normalisation**.',
    '```\nCREATE TABLE guests (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL,\n  email TEXT UNIQUE\n);\nINSERT INTO guests (name, email)\nSELECT DISTINCT guest_name, guest_email FROM ticket_sheet ORDER BY guest_name;\n```',
    'Fill `guests` and `events` first with `SELECT DISTINCT`. Then build each ticket by looking up the new ids with joins on values that identify a guest and an event (the email and the title):',
    '```\n-- This gives an error on its own: it needs the guests, events and tickets tables first.\n-- The "All three" example in the sandbox runs the whole build.\nINSERT INTO tickets (guest_id, event_id, seat)\nSELECT g.id, e.id, s.seat\nFROM ticket_sheet s\nJOIN guests g ON g.email = s.guest_email\nJOIN events e ON e.title = s.event_title;\n```',
    'Nothing is lost: joining the three tables gives the sheet back whenever you need it. But a change, such as a new date, is now one UPDATE in one place.',
  ],
  sandboxCode: 'SELECT event_title, event_date, room, price, COUNT(*) AS copies\nFROM ticket_sheet\nGROUP BY event_title, event_date, room, price;',
  sandboxSnippets: [
    snippet('How often each event is repeated', 'SELECT event_title, event_date, room, price, COUNT(*) AS copies\nFROM ticket_sheet\nGROUP BY event_title, event_date, room, price;'),
    snippet('Build guests', GUESTS + '\nSELECT * FROM guests;'),
    snippet('All three', 'PRAGMA foreign_keys = ON;\n' + GUESTS + '\n' + EVENTS + '\n' + TICKETS + '\nSELECT * FROM tickets;'),
  ],
  readMore: { label: 'Wikipedia: database normalization', url: 'https://en.wikipedia.org/wiki/Database_normalization', source: 'Wikipedia' },
  challenges: [
    query('easy', 'How many guests?', {
      prompt: 'Count the different guests in `ticket_sheet` (by email), in a column called `guests`.',
      hint: '`COUNT(DISTINCT column)` counts the different values.',
      solution: 'SELECT COUNT(DISTINCT guest_email) AS guests FROM ticket_sheet;',
    }),
    query('easy', 'Each event once', {
      prompt: 'Show each different event in the sheet once: `event_title`, `event_date`, `room` and `price`, in date order.',
      hint: '`SELECT DISTINCT … ORDER BY event_date`.',
      solution: 'SELECT DISTINCT event_title, event_date, room, price\nFROM ticket_sheet\nORDER BY event_date;',
    }),
    query('easy', 'Build guests', {
      prompt: "Create `guests` (`id` INTEGER PRIMARY KEY, `name` TEXT NOT NULL, `email` TEXT UNIQUE) and fill it with each different guest from the sheet, in name order.",
      hint: 'CREATE TABLE, then INSERT … SELECT DISTINCT … ORDER BY guest_name.',
      solution: GUESTS,
      checks: [columns('guests'), rows('guests', 'id')],
    }),
    query('medium', 'Build events', {
      prompt: "Create `events` (`id` INTEGER PRIMARY KEY, `title` TEXT NOT NULL, `event_date` TEXT NOT NULL, `room` TEXT, `price` REAL NOT NULL) and fill it with each different event from the sheet, ordered by date and then title.",
      hint: 'INSERT … SELECT DISTINCT event_title, event_date, room, price … ORDER BY event_date, event_title.',
      solution: EVENTS,
      checks: [columns('events'), rows('events', 'id')],
    }),
    query('medium', 'Changes in many places', {
      prompt: "Jazz Night moves to `2026-11-07`. In the sheet that means changing every Jazz Night row. Do it with one UPDATE.",
      hint: 'One UPDATE whose WHERE matches every Jazz Night row.',
      solution: "UPDATE ticket_sheet\nSET event_date = '2026-11-07'\nWHERE event_title = 'Jazz Night';",
      checks: [rows('ticket_sheet', 'guest_email, event_title')],
    }),
    query('medium', 'Build tickets', {
      prompt: "Build `guests` and `events` as in the last two challenges, then create `tickets` (`id` INTEGER PRIMARY KEY, `guest_id` and `event_id` INTEGER NOT NULL referencing them, `seat` TEXT) and fill it from the sheet, ordered by guest id and then event id.",
      hint: 'Look up the ids with `JOIN guests g ON g.email = s.guest_email JOIN events e ON e.title = s.event_title`.',
      solution: GUESTS + '\n' + EVENTS + '\n' + TICKETS,
      checks: [columns('tickets'), foreignKeys('tickets'), rows('tickets', 'id')],
    }),
    query('hard', 'The sheet again', {
      prompt: "Build all three tables, then join them back into the sheet: `guest_name`, `event_title`, `event_date` and `seat`, ordered by guest name and then event date.",
      hint: 'After the three builds: `SELECT g.name AS guest_name, e.title AS event_title, e.event_date, t.seat FROM tickets t JOIN guests g ON … JOIN events e ON … ORDER BY …`.',
      solution: GUESTS + '\n' + EVENTS + '\n' + TICKETS + '\nSELECT g.name AS guest_name, e.title AS event_title, e.event_date, t.seat\nFROM tickets t\nJOIN guests g ON g.id = t.guest_id\nJOIN events e ON e.id = t.event_id\nORDER BY guest_name, e.event_date;',
    }),
    query('hard', 'Rooms by id', {
      prompt: "Create `events` with a `room_id` instead of the room's name: `id` (INTEGER PRIMARY KEY), `title` (TEXT NOT NULL), `event_date` (TEXT NOT NULL), `room_id` (INTEGER referencing `rooms (id)`) and `price` (REAL NOT NULL). Fill it from the sheet, finding each room's id by its name, ordered by date and then title.",
      hint: '`SELECT DISTINCT s.event_title, s.event_date, r.id, s.price FROM ticket_sheet s JOIN rooms r ON r.name = s.room ORDER BY s.event_date, s.event_title`.',
      solution: 'CREATE TABLE events (\n  id INTEGER PRIMARY KEY,\n  title TEXT NOT NULL,\n  event_date TEXT NOT NULL,\n  room_id INTEGER REFERENCES rooms (id),\n  price REAL NOT NULL\n);\nINSERT INTO events (title, event_date, room_id, price)\nSELECT DISTINCT s.event_title, s.event_date, r.id, s.price\nFROM ticket_sheet s\nJOIN rooms r ON r.name = s.room\nORDER BY s.event_date, s.event_title;',
      checks: [columns('events'), foreignKeys('events'), rows('events', 'id')],
    }),
    query('expert', 'One change, one place', {
      prompt: "Build `guests`, `events` and `tickets` as before. Then move Jazz Night to `2026-11-07` with one UPDATE of `events`, and show the sheet again (`guest_name`, `event_title`, `event_date`, `seat`, by guest name and then date).",
      hint: 'The three builds, `UPDATE events SET event_date = … WHERE title = \'Jazz Night\';`, then the join from "The sheet again".',
      solution: GUESTS + '\n' + EVENTS + '\n' + TICKETS + "\nUPDATE events SET event_date = '2026-11-07' WHERE title = 'Jazz Night';\nSELECT g.name AS guest_name, e.title AS event_title, e.event_date, t.seat\nFROM tickets t\nJOIN guests g ON g.id = t.guest_id\nJOIN events e ON e.id = t.event_id\nORDER BY guest_name, e.event_date;",
      checks: [rows('events', 'id')],
    }),
    query('expert', 'Performers', {
      prompt: "Events can have several performers, and a performer can appear at several events. Create `performers` (`id` INTEGER PRIMARY KEY, `name` TEXT NOT NULL) and the junction table `event_performers` (`event_id` and `performer_id`, INTEGER NOT NULL, referencing `events (id)` and `performers (id)`, with the pair as primary key). Build `events` as before first.",
      hint: 'A many-to-many relationship needs a junction table with one row per pair.',
      solution: EVENTS + '\nCREATE TABLE performers (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL\n);\nCREATE TABLE event_performers (\n  event_id INTEGER NOT NULL REFERENCES events (id),\n  performer_id INTEGER NOT NULL REFERENCES performers (id),\n  PRIMARY KEY (event_id, performer_id)\n);',
      checks: [columns('performers'), columns('event_performers'), foreignKeys('event_performers')],
    }),
  ],
  questions: [
    mc('What is the main problem with the ticket sheet?', ['The same facts are copied onto many rows', 'It has too few columns', 'It has no rows', 'It uses TEXT'], 0,
      "Jazz Night's date and price are stored once per ticket."),
    mc('What does normalisation aim for?', ['Each fact stored once, in the table it belongs to', 'Wider rows', 'No primary keys', 'Fewer tables'], 0,
      'Guests in guests, events in events, tickets linking them.'),
    mc('In the sheet, what must you do if Jazz Night moves?', ['Delete the event', 'Nothing', 'Update one row', 'Update every Jazz Night row, and not miss one'], 3,
      'Missing one leaves contradicting dates.'),
    mc('Which table should be filled first?', ['guests and events, so tickets can point at them', 'tickets', 'Any', 'It doesn\'t matter with foreign keys'], 0,
      'Parents before children.'),
    qShort('Which keyword after SELECT gives each guest only once?', 'DISTINCT',
      '`SELECT DISTINCT guest_name, guest_email …`.'),
    mc('How are the new guest ids found when building tickets?', ['By joining the sheet to guests on a value that identifies the guest, like the email', 'By guessing', 'With COUNT', 'With UNION'], 0,
      'The join looks up the id for each row.'),
    mc('Is any information lost by splitting the sheet?', ['Only the prices', 'Yes, the dates', 'No: joining the tables gives the sheet back', 'Yes, the seats'], 2,
      'The facts are all still there, just once each.'),
    mc('What does a ticket row need after normalising?', ['The guest id, the event id and the seat', 'Every column of the sheet', 'The guest\'s name and email', 'The event\'s date and price'], 0,
      'Everything else is found through the ids.'),
    mc('Events and performers are many-to-many. What do you need?', ['A list of names in one column', 'An events column in performers', 'A junction table with one row per pair', 'A performer column in events'], 2,
      'Like order_items in the joins quest.'),
    mc('Why can\'t the sheet store an event with no tickets yet?', ['It can', 'Every row is a ticket, so an event only exists as part of one', 'Events need ids', 'The sheet is full'], 1,
      'In an events table, it is just a row.'),
  ],
})
