/**
 * The database for "Changing data": a small lending library. Members borrow books (loans),
 * owe fines, and new books wait in `arrivals` before they are added. The data has a few
 * mistakes on purpose, for the challenges to fix: an upper-case email, a member entered
 * twice, a duplicated loan, an orphaned fine, a missing status and two wrong availability
 * counts. "Today" is 2026-10-24 throughout.
 * Every member, book and author is invented.
 */
import { database, insert } from './databases.mjs'

const SCHEMA = `CREATE TABLE members (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  joined TEXT,
  status TEXT DEFAULT 'active'
);
CREATE TABLE books (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  copies INTEGER DEFAULT 1,
  available INTEGER DEFAULT 1
);
CREATE TABLE loans (
  id INTEGER PRIMARY KEY,
  member_id INTEGER,
  book_id INTEGER,
  borrowed TEXT,
  due TEXT,
  returned TEXT
);
CREATE TABLE fines (
  member_id INTEGER PRIMARY KEY,
  amount REAL
);
CREATE TABLE arrivals (
  title TEXT,
  author TEXT,
  copies INTEGER
);`

const M = ['id', 'name', 'email', 'joined', 'status']
const B = ['id', 'title', 'author', 'copies', 'available']
const L = ['id', 'member_id', 'book_id', 'borrowed', 'due', 'returned']
const F = ['member_id', 'amount']
const R = ['title', 'author', 'copies']

/** Loans as [member_id, book_id, borrowed, due, returned], numbered from 1. */
function loans(rows) {
  return rows.map((row, i) => [i + 1, ...row])
}

const DATA = [
  insert('members', M, [
    [1, 'Ama Mensah', 'ama.mensah@example.com', '2023-01-15', 'active'],
    [2, 'Bruno Costa', 'bruno.costa@example.com', '2024-03-02', 'active'],
    [3, 'Carla Ruiz', 'carla.ruiz@example.com', '2025-09-10', 'active'],
    [4, 'Daniel Kim', 'daniel.kim@example.com', '2022-11-20', 'suspended'],
    [5, 'Esther Cohen', null, '2026-02-14', null],
    [6, 'Felix Wagner', 'FELIX.WAGNER@EXAMPLE.ORG', '2021-06-30', 'inactive'],
    [7, 'Gemma Hughes', 'gemma.hughes@example.net', '2025-05-05', 'active'],
    [8, 'Carla Ruiz', null, '2026-10-01', 'active'],
  ]),
  insert('books', B, [
    [1, 'The Lantern Keeper', 'R. Holloway', 3, 1],
    [2, 'Rivers of Glass', 'M. Okonkwo', 2, 0],
    [3, 'A Short History of Maps', 'L. Brandt', 1, 0],
    [4, 'The Quiet Orchard', 'S. Laine', 2, 2],
    [5, 'Winter Arithmetic', 'P. Duarte', 1, 0],
    [6, 'Paper Comets', 'J. Abara', 3, 4],
    [7, 'Field Notes on Bees', 'H. Varga', 1, 1],
  ]),
  insert('loans', L, loans([
    [1, 1, '2026-08-03', '2026-08-17', '2026-08-15'],
    [2, 2, '2026-09-01', '2026-09-15', '2026-09-20'],
    [3, 1, '2026-09-20', '2026-10-04', null],
    [1, 5, '2026-10-01', '2026-10-15', null],
    [4, 2, '2026-10-05', '2026-10-19', null],
    [2, 6, '2026-10-10', '2026-10-24', null],
    [5, 1, '2026-10-12', '2026-10-26', null],
    [3, 2, '2026-10-14', '2026-10-28', null],
    [6, 4, '2026-07-10', '2026-07-24', '2026-07-30'],
    [1, 3, '2026-09-05', '2026-09-19', '2026-09-18'],
    [1, 1, '2026-08-03', '2026-08-17', '2026-08-15'],
    [8, 7, '2026-10-02', '2026-10-16', '2026-10-09'],
  ])),
  insert('fines', F, [
    [2, 2.3],
    [6, 3.0],
    [7, 0.0],
    [9, 4.0],
  ]),
  insert('arrivals', R, [
    ['Salt and Cedar', 'T. Ferreira', 2],
    ['The Lantern Keeper', 'R. Holloway', 2],
    ['Night Bus Stories', 'K. Adeyemi', null],
  ]),
].join('\n')

const ALT_DATA = [
  insert('members', M, [
    [1, 'Hugo Lambert', 'hugo.lambert@example.com', '2022-04-04', 'active'],
    [2, 'Iris Novak', 'IRIS.NOVAK@EXAMPLE.COM', '2024-12-12', 'active'],
    [3, 'Jonas Berg', null, '2020-08-08', null],
    [4, 'Kira Sato', 'kira.sato@example.org', '2025-03-03', 'suspended'],
    [5, 'Leo Marsh', 'leo.marsh@example.net', '2026-06-06', 'active'],
    [6, 'Hugo Lambert', null, '2026-09-09', 'active'],
  ]),
  insert('books', B, [
    [1, 'Copper Valley', 'N. Strand', 2, 1],
    [2, 'The Last Ferry', 'O. Mbeki', 1, 1],
    [3, 'Small Hours', 'C. Valdez', 2, 2],
    [4, 'Glass Birds', 'E. Rowan', 1, 0],
    [5, 'The Map Room', 'L. Brandt', 2, 1],
  ]),
  insert('loans', L, loans([
    [1, 1, '2026-09-10', '2026-09-24', null],
    [2, 2, '2026-10-08', '2026-10-22', null],
    [4, 4, '2026-10-15', '2026-10-29', null],
    [3, 3, '2026-06-01', '2026-06-15', '2026-06-20'],
    [5, 5, '2026-10-20', '2026-11-03', null],
    [6, 1, '2026-09-20', '2026-10-04', '2026-10-01'],
    [3, 3, '2026-06-01', '2026-06-15', '2026-06-20'],
  ])),
  insert('fines', F, [
    [5, 1.2],
    [3, 0.0],
    [8, 2.0],
  ]),
  insert('arrivals', R, [
    ['Small Hours', 'C. Valdez', 1],
    ['Tide Tables', 'R. Okafor', 3],
  ]),
].join('\n')

export const MODIFYING_DB = database(SCHEMA, DATA, ALT_DATA)

/**
 * Checks for challenges that change data: each query runs after the learner's SQL and after
 * the solution, on both sets of rows, and the results must match.
 */
export const AFTER = {
  members: ['The members table is right afterwards', 'SELECT * FROM members ORDER BY id'],
  books: ['The books table is right afterwards', 'SELECT * FROM books ORDER BY id'],
  loans: ['The loans table is right afterwards', 'SELECT * FROM loans ORDER BY id'],
  fines: ['The fines table is right afterwards', 'SELECT * FROM fines ORDER BY member_id'],
  arrivals: ['The arrivals table is right afterwards', 'SELECT * FROM arrivals ORDER BY title, author, copies'],
}
