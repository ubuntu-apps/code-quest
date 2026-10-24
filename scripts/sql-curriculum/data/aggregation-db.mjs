/**
 * The database for "Summarising data": two weeks of sales at a small café chain, and a
 * class's exam results. Both have repeated values to group by (stores, products,
 * students, subjects) and a few missing values (an unrecorded payment, an absent exam),
 * because how totals treat NULL is part of the lessons.
 */
import { database, insert } from './databases.mjs'

const SCHEMA = `CREATE TABLE sales (
  id INTEGER PRIMARY KEY,
  sale_date TEXT,
  store TEXT,
  product TEXT,
  category TEXT,
  quantity INTEGER,
  unit_price REAL,
  payment TEXT
);
CREATE TABLE results (
  id INTEGER PRIMARY KEY,
  student TEXT,
  subject TEXT,
  term TEXT,
  score INTEGER
);`

const SALE_COLUMNS = ['id', 'sale_date', 'store', 'product', 'category', 'quantity', 'unit_price', 'payment']
const RESULT_COLUMNS = ['id', 'student', 'subject', 'term', 'score']

/** Results for each student as [subject, autumn score, spring score] rows. */
function results(students) {
  const rows = []
  let id = 1
  for (const [student, subjects] of students) {
    for (const [subject, autumn, spring] of subjects) {
      rows.push([id++, student, subject, 'Autumn', autumn])
      rows.push([id++, student, subject, 'Spring', spring])
    }
  }
  return rows
}

const DATA = [
  insert('sales', SALE_COLUMNS, [
    [1, '2026-10-01', 'North', 'Latte', 'Coffee', 2, 3.8, 'card'],
    [2, '2026-10-01', 'North', 'Croissant', 'Bakery', 3, 2.75, 'cash'],
    [3, '2026-10-01', 'South', 'Espresso', 'Coffee', 1, 2.5, 'card'],
    [4, '2026-10-02', 'Central', 'Chai', 'Tea', 2, 3.4, 'app'],
    [5, '2026-10-02', 'South', 'Muffin', 'Bakery', 4, 3.1, 'card'],
    [6, '2026-10-02', 'North', 'Cookie', 'Snacks', 6, 1.9, null],
    [7, '2026-10-03', 'Central', 'Latte', 'Coffee', 3, 3.8, 'card'],
    [8, '2026-10-03', 'Central', 'Bagel', 'Bakery', 2, 2.6, 'cash'],
    [9, '2026-10-04', 'South', 'Green tea', 'Tea', 1, 2.9, 'app'],
    [10, '2026-10-04', 'North', 'Cappuccino', 'Coffee', 2, 3.6, 'card'],
    [11, '2026-10-05', 'South', 'Latte', 'Coffee', 5, 3.8, 'app'],
    [12, '2026-10-05', 'Central', 'Granola bar', 'Snacks', 3, 2.2, 'cash'],
    [13, '2026-10-06', 'North', 'Muffin', 'Bakery', 2, 3.1, 'card'],
    [14, '2026-10-06', 'South', 'Cookie', 'Snacks', 10, 1.9, 'cash'],
    [15, '2026-10-07', 'Central', 'Espresso', 'Coffee', 4, 2.5, null],
    [16, '2026-10-07', 'North', 'Chai', 'Tea', 1, 3.4, 'app'],
    [17, '2026-10-08', 'South', 'Croissant', 'Bakery', 6, 2.75, 'card'],
    [18, '2026-10-08', 'Central', 'Cappuccino', 'Coffee', 2, 3.6, 'card'],
    [19, '2026-10-09', 'North', 'Latte', 'Coffee', 4, 3.8, 'cash'],
    [20, '2026-10-09', 'South', 'Bagel', 'Bakery', 3, 2.6, 'app'],
    [21, '2026-10-10', 'Central', 'Cookie', 'Snacks', 8, 1.9, 'card'],
    [22, '2026-10-10', 'North', 'Green tea', 'Tea', 2, 2.9, null],
    [23, '2026-10-11', 'South', 'Cappuccino', 'Coffee', 3, 3.6, 'card'],
    [24, '2026-10-11', 'Central', 'Muffin', 'Bakery', 5, 3.1, 'app'],
    [25, '2026-10-12', 'North', 'Espresso', 'Coffee', 3, 2.5, 'card'],
    [26, '2026-10-12', 'South', 'Chai', 'Tea', 2, 3.4, 'cash'],
    [27, '2026-10-13', 'Central', 'Croissant', 'Bakery', 4, 2.75, 'card'],
    [28, '2026-10-13', 'North', 'Granola bar', 'Snacks', 2, 2.2, 'app'],
    [29, '2026-10-14', 'South', 'Latte', 'Coffee', 2, 3.8, 'card'],
    [30, '2026-10-14', 'Central', 'Latte', 'Coffee', 6, 3.8, 'cash'],
  ]),
  insert('results', RESULT_COLUMNS, results([
    ['Ana', [['Maths', 78, 85], ['Science', 82, 88], ['English', 91, 94]]],
    ['Ben', [['Maths', 64, 70], ['Science', 58, null], ['English', 72, 75]]],
    ['Chloe', [['Maths', 95, 97], ['Science', 89, 92], ['English', 84, 80]]],
    ['Dev', [['Maths', 55, 61], ['Science', 67, 73], ['English', null, 66]]],
    ['Ella', [['Maths', 88, 83], ['Science', 76, 79], ['English', 69, 77]]],
  ])),
].join('\n')

const ALT_DATA = [
  insert('sales', SALE_COLUMNS, [
    [1, '2026-09-28', 'East', 'Mocha', 'Coffee', 3, 4.1, 'card'],
    [2, '2026-09-28', 'West', 'Scone', 'Bakery', 2, 2.95, 'cash'],
    [3, '2026-09-29', 'East', 'Orange juice', 'Juice', 4, 3.25, 'app'],
    [4, '2026-09-29', 'North', 'Latte', 'Coffee', 1, 3.8, null],
    [5, '2026-09-30', 'West', 'Mocha', 'Coffee', 5, 4.1, 'card'],
    [6, '2026-09-30', 'East', 'Brownie', 'Snacks', 7, 2.4, 'cash'],
    [7, '2026-10-01', 'North', 'Scone', 'Bakery', 3, 2.95, 'card'],
    [8, '2026-10-01', 'West', 'Earl Grey', 'Tea', 2, 3.0, 'app'],
    [9, '2026-10-02', 'East', 'Latte', 'Coffee', 6, 3.8, 'card'],
    [10, '2026-10-02', 'North', 'Orange juice', 'Juice', 2, 3.25, 'cash'],
    [11, '2026-10-03', 'West', 'Brownie', 'Snacks', 4, 2.4, null],
    [12, '2026-10-03', 'East', 'Earl Grey', 'Tea', 1, 3.0, 'card'],
    [13, '2026-10-04', 'North', 'Mocha', 'Coffee', 2, 4.1, 'app'],
    [14, '2026-10-04', 'West', 'Latte', 'Coffee', 3, 3.8, 'cash'],
    [15, '2026-10-05', 'East', 'Scone', 'Bakery', 5, 2.95, 'card'],
    [16, '2026-10-05', 'North', 'Brownie', 'Snacks', 9, 2.4, 'card'],
    [17, '2026-10-06', 'West', 'Orange juice', 'Juice', 3, 3.25, 'app'],
    [18, '2026-10-06', 'East', 'Mocha', 'Coffee', 2, 4.1, 'cash'],
  ]),
  insert('results', RESULT_COLUMNS, results([
    ['Gus', [['Maths', 71, 74], ['Science', 66, 70], ['Art', 90, 86]]],
    ['Hana', [['Maths', 93, 96], ['Science', null, 88], ['Art', 79, 83]]],
    ['Ivan', [['Maths', 52, 58], ['Science', 61, 64], ['Art', 74, null]]],
    ['Jade', [['Maths', 85, 81], ['Science', 90, 94], ['Art', 68, 72]]],
  ])),
].join('\n')

export const AGGREGATION_DB = database(SCHEMA, DATA, ALT_DATA)
