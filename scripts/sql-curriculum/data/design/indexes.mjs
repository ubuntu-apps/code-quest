// Designing tables: Indexes.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { CHECK, DESIGN_DB } from '../design-db.mjs'

const { indexes, tryIt } = CHECK

export default makeTopic({
  id: 'indexes',
  title: 'Indexes',
  database: DESIGN_DB,
  paragraphs: [
    "To find the rows `WHERE guest_email = 'ben.fox@example.com'`, SQLite normally reads the whole table, row by row. That is instant for ten rows and slow for ten million. An **index** is a sorted copy of one or more columns, with a pointer back to each row, so SQLite can jump straight to the matching ones, like the index at the back of a book.",
    '```\nCREATE INDEX sheet_email ON ticket_sheet (guest_email);\n```',
    "An index needs a name, then the table and the columns. It changes no results, only how fast they are found, and SQLite decides by itself when to use one. To see its choice, put `EXPLAIN QUERY PLAN` before a query: **SCAN** means reading every row, **SEARCH … USING INDEX** means the index helped.",
    "```\nEXPLAIN QUERY PLAN\nSELECT * FROM ticket_sheet WHERE guest_email = 'ben.fox@example.com';\n```",
    "An index on several columns, like `(event_title, seat)`, helps searches on the first column, or on the first and second together, but not on the second alone. `CREATE UNIQUE INDEX` also refuses duplicates, like a UNIQUE constraint. A **partial index** covers only some rows: `… WHERE price > 0`.",
    "Indexes aren't free: each one takes space and must be updated on every INSERT, UPDATE and DELETE. Index the columns you often search, join or sort on, not every column. Primary keys and UNIQUE columns get an index automatically. `DROP INDEX name` removes one; this database already has `sheet_room`, on `ticket_sheet (room)`.",
  ],
  sandboxCode: "EXPLAIN QUERY PLAN\nSELECT * FROM ticket_sheet WHERE guest_email = 'ben.fox@example.com';\nCREATE INDEX sheet_email ON ticket_sheet (guest_email);\nEXPLAIN QUERY PLAN\nSELECT * FROM ticket_sheet WHERE guest_email = 'ben.fox@example.com';",
  sandboxSnippets: [
    snippet('Before and after', "EXPLAIN QUERY PLAN\nSELECT * FROM ticket_sheet WHERE guest_email = 'ben.fox@example.com';\nCREATE INDEX sheet_email ON ticket_sheet (guest_email);\nEXPLAIN QUERY PLAN\nSELECT * FROM ticket_sheet WHERE guest_email = 'ben.fox@example.com';"),
    snippet('The indexes of a table', "SELECT name, \"unique\", partial FROM pragma_index_list('ticket_sheet');"),
    snippet('Second column alone', "CREATE INDEX sheet_event_seat ON ticket_sheet (event_title, seat);\nEXPLAIN QUERY PLAN SELECT * FROM ticket_sheet WHERE event_title = 'Film Club';\nEXPLAIN QUERY PLAN SELECT * FROM ticket_sheet WHERE seat = 'A1';"),
  ],
  readMore: { label: 'SQLite: CREATE INDEX', url: 'https://www.sqlite.org/lang_createindex.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Find guests fast', {
      prompt: 'Create an index on the `guest_email` column of `ticket_sheet`. Name it as you like.',
      hint: '`CREATE INDEX sheet_email ON ticket_sheet (guest_email);`',
      solution: 'CREATE INDEX sheet_email ON ticket_sheet (guest_email);',
      checks: [indexes('ticket_sheet')],
    }),
    query('easy', 'Not needed', {
      prompt: 'Remove the index `sheet_room`.',
      hint: '`DROP INDEX sheet_room;`',
      solution: 'DROP INDEX sheet_room;',
      checks: [indexes('ticket_sheet')],
    }),
    query('medium', 'Two columns', {
      prompt: 'Create one index on `ticket_sheet` covering `event_title` and then `seat`.',
      hint: '`CREATE INDEX sheet_event_seat ON ticket_sheet (event_title, seat);`',
      solution: 'CREATE INDEX sheet_event_seat ON ticket_sheet (event_title, seat);',
      checks: [indexes('ticket_sheet')],
    }),
    query('medium', 'No seat sold twice', {
      prompt: 'Create a unique index on `ticket_sheet (event_title, seat)`, so the same seat can\'t be sold twice for one event.',
      hint: '`CREATE UNIQUE INDEX …`.',
      solution: 'CREATE UNIQUE INDEX sheet_event_seat ON ticket_sheet (event_title, seat);',
      checks: [
        indexes('ticket_sheet'),
        tryIt('A seat sold twice for one event is refused', "INSERT INTO ticket_sheet (guest_name, event_title, seat) VALUES ('X', 'Film Club', 'Z9'), ('Y', 'Film Club', 'Z9')"),
      ],
    }),
    query('medium', 'Fix the missing name', {
      prompt: 'This should create an index on `ticket_sheet (guest_email)`, but gives a syntax error. Fix it.',
      starter: 'CREATE INDEX ON ticket_sheet (guest_email);',
      hint: 'Every index needs a name: `CREATE INDEX some_name ON …`.',
      solution: 'CREATE INDEX sheet_email ON ticket_sheet (guest_email);',
      checks: [indexes('ticket_sheet')],
    }),
    query('hard', 'Rooms by name', {
      prompt: "Queries often find a room by its name, as in `JOIN rooms r ON r.name = s.room`. Create an index that helps them search `rooms`.",
      hint: 'Index the column that is searched: `rooms (name)`.',
      solution: 'CREATE INDEX rooms_name ON rooms (name);',
      checks: [indexes('rooms')],
    }),
    query('hard', 'Only paid tickets', {
      prompt: 'Create a partial index on `ticket_sheet (event_title)` that only covers rows with a `price` above 0.',
      hint: '`CREATE INDEX … ON ticket_sheet (event_title) WHERE price > 0;`',
      solution: 'CREATE INDEX sheet_paid ON ticket_sheet (event_title) WHERE price > 0;',
      checks: [indexes('ticket_sheet')],
    }),
    query('expert', 'Everything the query needs', {
      prompt: "A report often runs `SELECT event_title, price FROM ticket_sheet WHERE event_title = …`. Create an index on `event_title` and then `price`, so SQLite can answer it from the index alone.",
      hint: 'An index that holds every column a query uses is called a covering index.',
      solution: 'CREATE INDEX sheet_title_price ON ticket_sheet (event_title, price);',
      checks: [indexes('ticket_sheet')],
    }),
    query('expert', 'Replace the room index', {
      prompt: "Replace `sheet_room` with one index on `ticket_sheet` covering `room` and then `event_date`.",
      hint: 'DROP INDEX sheet_room; then CREATE INDEX on (room, event_date).',
      solution: 'DROP INDEX sheet_room;\nCREATE INDEX sheet_room_date ON ticket_sheet (room, event_date);',
      checks: [indexes('ticket_sheet')],
    }),
  ],
  questions: [
    mc('What does an index do?', ['Sorts the table for good', 'Adds a column', 'Lets SQLite find matching rows without reading the whole table', 'Changes query results'], 2,
      'Like the index at the back of a book.'),
    mc('Does adding an index change what a query returns?', ['Yes', 'No, only how fast', 'Only for ORDER BY', 'Only with UNIQUE'], 1,
      'Results are the same; only the work changes.'),
    mc('In EXPLAIN QUERY PLAN, what does SCAN mean?', ['The query was cached', 'An index was used', 'An error', 'Every row of the table is read'], 3,
      'SEARCH … USING INDEX means an index helped.'),
    mc('An index on `(event_title, seat)` helps which search?', ['None', '`WHERE event_title = …`', '`WHERE seat = …` alone', 'Any column'], 1,
      'It helps the first column, or the first and second together.'),
    qShort('Which word makes an index refuse duplicates, as in `CREATE ___ INDEX`?', 'UNIQUE',
      '`CREATE UNIQUE INDEX …`.'),
    mc('What is the cost of an index?', ['Slower SELECTs', 'Space, and slower INSERT, UPDATE and DELETE', 'Wrong results', 'Nothing'], 1,
      'Every change must update the index too.'),
    mc('Which columns get an index automatically?', ['All TEXT columns', 'Every column', 'None', 'Primary keys and UNIQUE columns'], 3,
      'SQLite makes those indexes itself.'),
    mc('What is a partial index?', ['Half an index', 'An index on part of a column', 'An index that only covers rows matching its WHERE', 'A broken index'], 2,
      'For example only paid tickets.'),
    mc('What is wrong with `CREATE INDEX ON ticket_sheet (guest_email);`?', ['The column', 'The brackets', 'ON should be FOR', 'The index has no name'], 3,
      'Every index needs a name.'),
    mc('Which columns are worth indexing?', ['Every column', 'Only primary keys', 'Only TEXT columns', 'Those you often search, join or sort on'], 3,
      'Indexes on unused columns only cost.'),
  ],
})
