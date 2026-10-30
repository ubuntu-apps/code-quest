// Designing tables: Foreign keys.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { CHECK, DESIGN_DB } from '../design-db.mjs'

const { columns, rows, foreignKeys, tryIt } = CHECK

export default makeTopic({
  id: 'foreign_keys',
  title: 'Foreign keys',
  database: DESIGN_DB,
  paragraphs: [
    'A **foreign key** column holds the primary key of a row in another table, as `loans.member_id` did in the last quest. `REFERENCES` turns that into a rule: the value must exist in the other table.',
    '```\nPRAGMA foreign_keys = ON;\nCREATE TABLE events (\n  id INTEGER PRIMARY KEY,\n  title TEXT NOT NULL,\n  room_id INTEGER REFERENCES rooms (id)\n);\n```',
    "**SQLite only checks foreign keys after `PRAGMA foreign_keys = ON;`**, and the setting lasts for one connection. Here each Run is a new connection, so start your SQL with it. Without it, `REFERENCES` is written down but never checked.",
    'With the check on, an event in room 9 (which doesn\'t exist) gives **FOREIGN KEY constraint failed**. So does deleting a room that events still use. Add the parent rows first, and delete the children first.',
    '`ON DELETE` changes what happens when the parent row is deleted:',
    "`ON DELETE CASCADE`, as in `room_id INTEGER REFERENCES rooms (id) ON DELETE CASCADE`, deletes the child rows too. `ON DELETE SET NULL` keeps them but empties the foreign key. Without either, deleting a parent that still has children is refused. Pick what makes sense for the data: a ticket means nothing without its event (cascade), but an event can wait for a new room (set null).",
    'A foreign key can point at its own table: `manager_id INTEGER REFERENCES staff (id)`.',
  ],
  sandboxCode: "PRAGMA foreign_keys = ON;\nCREATE TABLE events (\n  id INTEGER PRIMARY KEY,\n  title TEXT NOT NULL,\n  room_id INTEGER REFERENCES rooms (id)\n);\nINSERT INTO events (title, room_id) VALUES ('Jazz Night', 1);\nSELECT * FROM events;",
  sandboxSnippets: [
    snippet('A valid event', "PRAGMA foreign_keys = ON;\nCREATE TABLE events (\n  id INTEGER PRIMARY KEY,\n  title TEXT NOT NULL,\n  room_id INTEGER REFERENCES rooms (id)\n);\nINSERT INTO events (title, room_id) VALUES ('Jazz Night', 1);\nSELECT * FROM events;"),
    snippet('A missing room', "-- This gives an error: there is no room 9\nPRAGMA foreign_keys = ON;\nCREATE TABLE events (id INTEGER PRIMARY KEY, title TEXT, room_id INTEGER REFERENCES rooms (id));\nINSERT INTO events (title, room_id) VALUES ('Lost Event', 9);"),
    snippet('Without the PRAGMA', "CREATE TABLE events (id INTEGER PRIMARY KEY, title TEXT, room_id INTEGER REFERENCES rooms (id));\nINSERT INTO events (title, room_id) VALUES ('Lost Event', 9);\nSELECT * FROM events;"),
    snippet('Cascade', "PRAGMA foreign_keys = ON;\nCREATE TABLE events (id INTEGER PRIMARY KEY, title TEXT,\n  room_id INTEGER REFERENCES rooms (id) ON DELETE CASCADE);\nINSERT INTO events (title, room_id) VALUES ('Market', 3), ('Fair', 3);\nDELETE FROM rooms WHERE id = 3;\nSELECT * FROM events;"),
  ],
  readMore: { label: 'SQLite: foreign key support', url: 'https://www.sqlite.org/foreignkeys.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Events in rooms', {
      prompt: "Turn on foreign keys, then create `events` with `id` (INTEGER PRIMARY KEY), `title` (TEXT, NOT NULL) and `room_id` (INTEGER), where `room_id` must be an `id` in `rooms`.",
      hint: 'Start with `PRAGMA foreign_keys = ON;`, then `room_id INTEGER REFERENCES rooms (id)`.',
      solution: 'PRAGMA foreign_keys = ON;\nCREATE TABLE events (\n  id INTEGER PRIMARY KEY,\n  title TEXT NOT NULL,\n  room_id INTEGER REFERENCES rooms (id)\n);',
      checks: [
        columns('events'),
        foreignKeys('events'),
        tryIt('An event in a missing room is refused', "INSERT INTO events (title, room_id) VALUES ('Lost', 99)"),
      ],
    }),
    query('easy', 'Tickets for guests', {
      prompt: "Turn on foreign keys. Create `guests` (`id` INTEGER PRIMARY KEY, `name` TEXT NOT NULL), and `tickets` (`id` INTEGER PRIMARY KEY, `guest_id` INTEGER NOT NULL referencing `guests (id)`, `seat` TEXT).",
      hint: 'The parent table first, then `guest_id INTEGER NOT NULL REFERENCES guests (id)`.',
      solution: 'PRAGMA foreign_keys = ON;\nCREATE TABLE guests (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL\n);\nCREATE TABLE tickets (\n  id INTEGER PRIMARY KEY,\n  guest_id INTEGER NOT NULL REFERENCES guests (id),\n  seat TEXT\n);',
      checks: [
        columns('tickets'),
        foreignKeys('tickets'),
        tryIt('A ticket for a missing guest is refused', "INSERT INTO tickets (guest_id, seat) VALUES (1, 'A1')"),
      ],
    }),
    query('easy', 'Fix the order', {
      prompt: "With foreign keys on, this script stops with **FOREIGN KEY constraint failed**. Fix it so both rows go in.",
      starter: "PRAGMA foreign_keys = ON;\nCREATE TABLE guests (id INTEGER PRIMARY KEY, name TEXT NOT NULL);\nCREATE TABLE tickets (id INTEGER PRIMARY KEY, guest_id INTEGER NOT NULL REFERENCES guests (id), seat TEXT);\nINSERT INTO tickets (guest_id, seat) VALUES (1, 'A1');\nINSERT INTO guests (id, name) VALUES (1, 'Ana Lima');",
      hint: 'Add the guest before the ticket that points to them.',
      solution: "PRAGMA foreign_keys = ON;\nCREATE TABLE guests (id INTEGER PRIMARY KEY, name TEXT NOT NULL);\nCREATE TABLE tickets (id INTEGER PRIMARY KEY, guest_id INTEGER NOT NULL REFERENCES guests (id), seat TEXT);\nINSERT INTO guests (id, name) VALUES (1, 'Ana Lima');\nINSERT INTO tickets (guest_id, seat) VALUES (1, 'A1');",
      checks: [rows('guests', 'id'), rows('tickets', 'id')],
    }),
    query('medium', 'Cascade', {
      prompt: "Turn on foreign keys and create `events` (`id` INTEGER PRIMARY KEY, `title` TEXT NOT NULL, `room_id` INTEGER referencing `rooms (id)`) so that deleting a room also deletes its events.",
      hint: '`REFERENCES rooms (id) ON DELETE CASCADE`.',
      solution: 'PRAGMA foreign_keys = ON;\nCREATE TABLE events (\n  id INTEGER PRIMARY KEY,\n  title TEXT NOT NULL,\n  room_id INTEGER REFERENCES rooms (id) ON DELETE CASCADE\n);',
      checks: [
        foreignKeys('events'),
        tryIt('Deleting a room deletes its events', "INSERT INTO events (title, room_id) VALUES ('Market', 1), ('Fair', 1), ('Talk', 2); DELETE FROM rooms WHERE id = 1; SELECT title FROM events ORDER BY title"),
      ],
    }),
    query('medium', 'Set null', {
      prompt: "Turn on foreign keys and create `events` (`id` INTEGER PRIMARY KEY, `title` TEXT NOT NULL, `room_id` INTEGER referencing `rooms (id)`) so that deleting a room keeps its events but empties their `room_id`.",
      hint: '`ON DELETE SET NULL`.',
      solution: 'PRAGMA foreign_keys = ON;\nCREATE TABLE events (\n  id INTEGER PRIMARY KEY,\n  title TEXT NOT NULL,\n  room_id INTEGER REFERENCES rooms (id) ON DELETE SET NULL\n);',
      checks: [
        foreignKeys('events'),
        tryIt('Deleting a room keeps its events without a room', "INSERT INTO events (title, room_id) VALUES ('Market', 1), ('Talk', 2); DELETE FROM rooms WHERE id = 1; SELECT title, room_id FROM events ORDER BY title"),
      ],
    }),
    query('medium', 'Still in use', {
      prompt: "Turn on foreign keys and create `events` (`id` INTEGER PRIMARY KEY, `title` TEXT NOT NULL, `room_id` INTEGER referencing `rooms (id)`) with no ON DELETE rule, so a room that events still use can't be deleted.",
      hint: 'The plain `REFERENCES rooms (id)`: deleting a used parent is refused.',
      solution: 'PRAGMA foreign_keys = ON;\nCREATE TABLE events (\n  id INTEGER PRIMARY KEY,\n  title TEXT NOT NULL,\n  room_id INTEGER REFERENCES rooms (id)\n);',
      checks: [
        foreignKeys('events'),
        tryIt('Deleting a used room is refused', "INSERT INTO events (title, room_id) VALUES ('Market', 1); DELETE FROM rooms WHERE id = 1"),
        tryIt('Deleting an unused room is fine', "INSERT INTO events (title, room_id) VALUES ('Market', 1); DELETE FROM rooms WHERE id = 2; SELECT COUNT(*) FROM rooms"),
      ],
    }),
    query('hard', 'Fix the unchecked key', {
      prompt: 'This should refuse events in rooms that don\'t exist, but it lets them in. Fix it.',
      starter: 'CREATE TABLE events (\n  id INTEGER PRIMARY KEY,\n  title TEXT NOT NULL,\n  room_id INTEGER REFERENCES rooms (id)\n);',
      hint: 'Foreign keys are only checked after `PRAGMA foreign_keys = ON;`.',
      solution: 'PRAGMA foreign_keys = ON;\nCREATE TABLE events (\n  id INTEGER PRIMARY KEY,\n  title TEXT NOT NULL,\n  room_id INTEGER REFERENCES rooms (id)\n);',
      checks: [tryIt('An event in a missing room is refused', "INSERT INTO events (title, room_id) VALUES ('Lost', 99)")],
    }),
    query('hard', 'Two parents', {
      prompt: "Turn on foreign keys. Create `guests` (`id` INTEGER PRIMARY KEY, `name` TEXT NOT NULL), `events` (`id` INTEGER PRIMARY KEY, `title` TEXT NOT NULL) and `tickets` (`id` INTEGER PRIMARY KEY, `event_id` and `guest_id`, both INTEGER NOT NULL, referencing `events (id)` and `guests (id)`, with ON DELETE CASCADE on both).",
      hint: 'Two REFERENCES columns in tickets, each with `ON DELETE CASCADE`.',
      solution: 'PRAGMA foreign_keys = ON;\nCREATE TABLE guests (id INTEGER PRIMARY KEY, name TEXT NOT NULL);\nCREATE TABLE events (id INTEGER PRIMARY KEY, title TEXT NOT NULL);\nCREATE TABLE tickets (\n  id INTEGER PRIMARY KEY,\n  event_id INTEGER NOT NULL REFERENCES events (id) ON DELETE CASCADE,\n  guest_id INTEGER NOT NULL REFERENCES guests (id) ON DELETE CASCADE\n);',
      checks: [
        foreignKeys('tickets'),
        tryIt('Deleting a guest deletes their tickets', "INSERT INTO guests VALUES (1, 'A'), (2, 'B'); INSERT INTO events VALUES (1, 'E'); INSERT INTO tickets (event_id, guest_id) VALUES (1, 1), (1, 2); DELETE FROM guests WHERE id = 1; SELECT event_id, guest_id FROM tickets"),
      ],
    }),
    query('expert', 'Who manages whom', {
      prompt: "Turn on foreign keys and create `staff` with `id` (INTEGER PRIMARY KEY), `name` (TEXT, NOT NULL) and `manager_id` (INTEGER) referencing another row of `staff`. Then add `Mara Venn` (no manager) and `Tomas Ek` managed by her, using her id.",
      hint: '`manager_id INTEGER REFERENCES staff (id)`. Insert Mara first; her id is 1.',
      solution: "PRAGMA foreign_keys = ON;\nCREATE TABLE staff (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL,\n  manager_id INTEGER REFERENCES staff (id)\n);\nINSERT INTO staff (name) VALUES ('Mara Venn');\nINSERT INTO staff (name, manager_id) VALUES ('Tomas Ek', 1);",
      checks: [foreignKeys('staff'), rows('staff', 'id'), tryIt('A missing manager is refused', "INSERT INTO staff (name, manager_id) VALUES ('X', 99)")],
    }),
    query('expert', 'Down the chain', {
      prompt: "Turn on foreign keys. Create `events` (`id` INTEGER PRIMARY KEY, `title` TEXT NOT NULL, `room_id` INTEGER referencing `rooms (id)`) and `tickets` (`id` INTEGER PRIMARY KEY, `event_id` INTEGER NOT NULL referencing `events (id)`, `seat` TEXT), so that deleting a room deletes its events, and deleting an event deletes its tickets.",
      hint: 'ON DELETE CASCADE on both foreign keys: the deletes pass down the chain.',
      solution: 'PRAGMA foreign_keys = ON;\nCREATE TABLE events (\n  id INTEGER PRIMARY KEY,\n  title TEXT NOT NULL,\n  room_id INTEGER REFERENCES rooms (id) ON DELETE CASCADE\n);\nCREATE TABLE tickets (\n  id INTEGER PRIMARY KEY,\n  event_id INTEGER NOT NULL REFERENCES events (id) ON DELETE CASCADE,\n  seat TEXT\n);',
      checks: [
        foreignKeys('events'),
        foreignKeys('tickets'),
        tryIt('Deleting a room deletes its events\' tickets', "INSERT INTO events (id, title, room_id) VALUES (1, 'Market', 1), (2, 'Talk', 2); INSERT INTO tickets (event_id, seat) VALUES (1, 'A1'), (1, 'A2'), (2, 'B1'); DELETE FROM rooms WHERE id = 1; SELECT event_id, seat FROM tickets"),
      ],
    }),
  ],
  questions: [
    mc('What does `room_id INTEGER REFERENCES rooms (id)` say?', ['room_id is the primary key', 'rooms has a room_id column', 'room_id must be unique', 'room_id must be an id that exists in rooms'], 3,
      'That is a foreign key.'),
    mc('What does SQLite need before it checks foreign keys?', ['STRICT tables', 'A transaction', '`PRAGMA foreign_keys = ON;`', 'An index'], 2,
      'It is off by default, for each connection.'),
    mc('With the check on, what happens when you insert an event in a room that doesn\'t exist?', ['room_id becomes NULL', 'It is stored', 'The room is created', 'FOREIGN KEY constraint failed'], 3,
      'The parent row must exist.'),
    mc('Which order works with foreign keys on?', ['Only one table per run', 'Parents first, then the children that point to them', 'Children first, then parents', 'Any order'], 1,
      'And delete children before their parents.'),
    qShort('Which word after ON DELETE also deletes the child rows?', 'CASCADE',
      '`ON DELETE CASCADE`.'),
    mc('What does `ON DELETE SET NULL` do when the parent is deleted?', ['Deletes the children', 'Refuses the delete', 'Deletes the parent table', 'Keeps the children, emptying their foreign key'], 3,
      'The children stay, now pointing nowhere.'),
    mc('With no ON DELETE rule, what happens when you delete a room that events still use?', ['Nothing is checked', 'The events are deleted', 'The delete is refused', 'Their room_id becomes NULL'], 2,
      'Only when foreign keys are on, of course.'),
    mc('Why might tickets cascade but events set null when their parent goes?', ['Cascade is faster', 'It is required', 'A ticket means nothing without its event, but an event can get a new room', 'Set null is the default'], 2,
      'Choose the rule that matches what the data means.'),
    mc('Can a foreign key point at its own table?', ['Yes, like a manager who is also on the staff', 'No', 'Only with CASCADE', 'Only in other databases'], 0,
      '`manager_id INTEGER REFERENCES staff (id)`.'),
    mc('Without `PRAGMA foreign_keys = ON`, what does REFERENCES do in SQLite?', ['It deletes bad rows', 'It is written down but not checked', 'It gives an error', 'It checks only inserts'], 1,
      'That is why the PRAGMA comes first.'),
  ],
})
