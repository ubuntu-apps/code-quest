/**
 * The database for "Designing tables": an events venue that has kept its bookings in one
 * big spreadsheet-like table, `ticket_sheet`. The lessons build proper tables for guests,
 * events and tickets from it. `rooms` and `contacts` are small tables to change and copy;
 * contacts has one person entered twice. Every name, event and email is invented.
 */
import { database, insert } from './databases.mjs'

const SCHEMA = `CREATE TABLE ticket_sheet (
  guest_name TEXT,
  guest_email TEXT,
  event_title TEXT,
  event_date TEXT,
  room TEXT,
  price REAL,
  seat TEXT
);
CREATE TABLE rooms (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  seats INTEGER
);
CREATE TABLE contacts (
  id INTEGER PRIMARY KEY,
  name TEXT,
  phone TEXT,
  notes TEXT
);
CREATE INDEX sheet_room ON ticket_sheet (room);`

const S = ['guest_name', 'guest_email', 'event_title', 'event_date', 'room', 'price', 'seat']
const R = ['id', 'name', 'seats']
const C = ['id', 'name', 'phone', 'notes']

const DATA = [
  insert('ticket_sheet', S, [
    ['Ana Lima', 'ana.lima@example.com', 'Jazz Night', '2026-11-06', 'Hall A', 25.0, 'A1'],
    ['Ana Lima', 'ana.lima@example.com', 'Poetry Evening', '2026-11-13', 'Studio', 12.0, 'S4'],
    ['Ben Fox', 'ben.fox@example.com', 'Jazz Night', '2026-11-06', 'Hall A', 25.0, 'A2'],
    ['Chiara Rossi', 'chiara.rossi@example.com', 'Jazz Night', '2026-11-06', 'Hall A', 25.0, 'B1'],
    ['Chiara Rossi', 'chiara.rossi@example.com', 'Film Club', '2026-11-20', 'Studio', 8.0, 'S1'],
    ['Dawit Bekele', 'dawit.bekele@example.com', 'Poetry Evening', '2026-11-13', 'Studio', 12.0, 'S5'],
    ['Elena Popa', 'elena.popa@example.com', 'Film Club', '2026-11-20', 'Studio', 8.0, 'S2'],
    ['Ben Fox', 'ben.fox@example.com', 'Film Club', '2026-11-20', 'Studio', 8.0, 'S3'],
    ['Farid Haddad', 'farid.haddad@example.com', 'Jazz Night', '2026-11-06', 'Hall A', 25.0, 'B2'],
    ['Gao Yan', 'gao.yan@example.com', 'Garden Market', '2026-11-28', 'Garden', 0.0, null],
  ]),
  insert('rooms', R, [
    [1, 'Hall A', 120],
    [2, 'Studio', 40],
    [3, 'Garden', 60],
  ]),
  insert('contacts', C, [
    [1, 'Mara Venn', '555-0101', 'caterer'],
    [2, 'Tomas Ek', '555-0102', null],
    [3, 'Ines Duarte', '555-0103', 'sound'],
    [4, 'Mara Venn', '555-0101', 'caterer, entered again'],
  ]),
].join('\n')

const ALT_DATA = [
  insert('ticket_sheet', S, [
    ['Ivo Kral', 'ivo.kral@example.com', 'Choir Concert', '2026-12-04', 'Main Hall', 18.0, 'C3'],
    ['Ivo Kral', 'ivo.kral@example.com', 'Comedy Night', '2026-12-11', 'Loft', 15.0, 'L1'],
    ['Jana Holm', 'jana.holm@example.com', 'Choir Concert', '2026-12-04', 'Main Hall', 18.0, 'C4'],
    ['Kwame Osei', 'kwame.osei@example.com', 'Comedy Night', '2026-12-11', 'Loft', 15.0, 'L2'],
    ['Lina Sato', 'lina.sato@example.com', 'Choir Concert', '2026-12-04', 'Main Hall', 18.0, null],
    ['Kwame Osei', 'kwame.osei@example.com', 'Craft Fair', '2026-12-18', 'Main Hall', 0.0, 'F1'],
  ]),
  insert('rooms', R, [
    [1, 'Main Hall', 200],
    [2, 'Loft', 30],
  ]),
  insert('contacts', C, [
    [1, 'Pia Lund', '555-0201', 'lights'],
    [2, 'Rui Matos', '555-0202', null],
    [3, 'Pia Lund', '555-0201', null],
  ]),
].join('\n')

export const DESIGN_DB = database(SCHEMA, DATA, ALT_DATA)

/**
 * Checks for challenges that create or change tables. Each runs after the learner's SQL and
 * after the solution, inside a savepoint that is rolled back, and the results must match.
 * A check that tries a change shows either its rows or the error ("error: …") it gave.
 */
export const CHECK = {
  /** Column names, types, NOT NULL, defaults and primary key, in table order. */
  columns: (table) => [
    `The ${table} table has the right columns`,
    `SELECT name, UPPER(type) AS type, CASE WHEN pk > 0 THEN 0 ELSE "notnull" END AS not_null,\n` +
      `       dflt_value AS default_value, pk\nFROM pragma_table_info('${table}')\nORDER BY cid`,
  ],
  /** The rows of a table, in a fixed order. */
  rows: (table, orderBy) => [`The ${table} table has the right rows`, `SELECT * FROM ${table} ORDER BY ${orderBy}`],
  /** The tables in the database. */
  tables: [
    'The right tables exist',
    "SELECT name FROM sqlite_schema WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
  ],
  /** Foreign keys: column, parent table and column, and what happens on delete. */
  foreignKeys: (table) => [
    `The ${table} table has the right foreign keys`,
    `SELECT fk."from", fk."table",\n` +
      `       COALESCE(fk."to", (SELECT p.name FROM pragma_table_info(fk."table") p WHERE p.pk = 1)) AS "to",\n` +
      `       fk.on_delete\nFROM pragma_foreign_key_list('${table}') fk\nORDER BY fk."from"`,
  ],
  /** Indexes made with CREATE INDEX: their columns, whether unique and whether partial. */
  indexes: (table) => [
    `The ${table} table has the right indexes`,
    `SELECT (SELECT group_concat(COALESCE(ii.name, '(expression)'), ', ') FROM pragma_index_info(il.name) ii) AS columns,\n` +
      `       il."unique", il.partial\nFROM pragma_index_list('${table}') il\nWHERE il.origin = 'c'\nORDER BY columns, il."unique"`,
  ],
  /** Tries statements; the last result, or the error, must match the solution's. */
  tryIt: (label, sql) => [label, sql],
}
