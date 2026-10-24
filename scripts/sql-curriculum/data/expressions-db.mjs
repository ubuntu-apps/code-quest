/**
 * The database for "Functions and expressions": a small online shop's customers, orders
 * and staff. The data is a little messy on purpose (names in odd cases, spaces around
 * cities, missing phone numbers), because cleaning it up is what these functions are for.
 * Dates are text in the YYYY-MM-DD form SQLite's date functions read.
 */
import { database, insert } from './databases.mjs'

const SCHEMA = `CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  city TEXT,
  phone TEXT,
  joined TEXT
);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER,
  order_date TEXT,
  ship_date TEXT,
  total REAL,
  discount INTEGER,
  status TEXT
);
CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT,
  role TEXT,
  salary INTEGER,
  hire_date TEXT,
  bonus INTEGER
);`

const CUSTOMER_COLUMNS = ['id', 'first_name', 'last_name', 'email', 'city', 'phone', 'joined']
const ORDER_COLUMNS = ['id', 'customer_id', 'order_date', 'ship_date', 'total', 'discount', 'status']
const EMPLOYEE_COLUMNS = ['id', 'name', 'role', 'salary', 'hire_date', 'bonus']

const DATA = [
  insert('customers', CUSTOMER_COLUMNS, [
    [1, 'Ana', 'Silva', 'ana.silva@example.com', 'Lisbon', '555-0101', '2024-02-14'],
    [2, 'ben', 'OKAFOR', 'Ben.Okafor@Example.com', ' Lagos', null, '2023-11-03'],
    [3, 'Chloe', 'Martin', 'chloe@example.org', 'Paris ', '555-0144', '2025-06-21'],
    [4, 'Dev', 'Patel', 'dev.patel@example.com', 'Mumbai', '555-0190', '2022-08-30'],
    [5, 'Ella', 'Novak', 'ELLA.NOVAK@EXAMPLE.COM', 'Prague', null, '2025-01-09'],
    [6, 'finn', 'murphy', 'finn.murphy@example.net', 'Dublin', '555-0123', '2024-12-01'],
    [7, 'Grace', 'Kim', 'grace.kim@example.com', null, '555-0177', '2026-03-15'],
    [8, 'Hugo', 'Garcia', 'hugo@example.org', '  Madrid  ', '555-0156', '2023-05-19'],
    [9, 'Iris', 'Tanaka', 'iris.tanaka@example.net', 'Osaka', null, '2026-07-04'],
    [10, 'Jonas', 'Berg', 'jonas.berg@example.com', 'Stockholm', '555-0168', '2024-09-27'],
  ]),
  insert('orders', ORDER_COLUMNS, [
    [1, 1, '2026-01-05', '2026-01-07', 42.5, null, 'shipped'],
    [2, 2, '2026-01-18', '2026-01-25', 120.0, 10, 'shipped'],
    [3, 1, '2026-02-02', '2026-02-03', 15.99, null, 'shipped'],
    [4, 3, '2026-02-14', null, 64.0, 5, 'cancelled'],
    [5, 4, '2026-03-01', '2026-03-06', 230.75, 20, 'shipped'],
    [6, 5, '2026-03-22', '2026-03-24', 9.5, null, 'shipped'],
    [7, 6, '2026-04-10', '2026-04-18', 77.25, null, 'shipped'],
    [8, 2, '2026-05-05', '2026-05-06', 54.0, 0, 'shipped'],
    [9, 7, '2026-06-30', '2026-07-02', 310.4, 25, 'shipped'],
    [10, 8, '2026-08-12', null, 18.0, null, 'pending'],
    [11, 9, '2026-09-03', '2026-09-04', 99.99, 10, 'shipped'],
    [12, 10, '2026-09-28', null, 45.6, null, 'pending'],
    [13, 4, '2026-10-02', null, 150.0, 15, 'pending'],
    [14, 3, '2026-10-15', null, 12.25, null, 'cancelled'],
  ]),
  insert('employees', EMPLOYEE_COLUMNS, [
    [1, 'Maria Lopez', 'Manager', 72000, '2015-04-01', 5000],
    [2, 'Tom Reed', 'Developer', 65500, '2019-09-15', null],
    [3, 'Aisha Khan', 'Developer', 69800, '2021-01-11', 2500],
    [4, 'Leo Rossi', 'Designer', 54250, '2022-06-20', null],
    [5, 'Sara Lind', 'Support', 41000, '2018-03-05', 1200],
    [6, 'Omar Haddad', 'Support', 39500, '2024-02-26', null],
    [7, 'Nina Petrova', 'Analyst', 61200, '2020-11-30', 1800],
    [8, 'Kai Wong', 'Intern', 24000, '2026-06-01', null],
  ]),
].join('\n')

const ALT_DATA = [
  insert('customers', CUSTOMER_COLUMNS, [
    [1, 'Lena', 'Fischer', 'lena.fischer@example.com', 'Berlin', '555-0201', '2023-03-08'],
    [2, 'marco', 'BIANCHI', 'Marco.Bianchi@Example.org', ' Rome', '555-0214', '2025-10-30'],
    [3, 'Zoe', 'Adams', 'ZOE.ADAMS@EXAMPLE.NET', 'Toronto  ', null, '2022-01-17'],
    [4, 'Ravi', 'Shah', 'ravi@example.com', 'Delhi', '555-0233', '2026-05-12'],
    [5, 'yuki', 'sato', 'yuki.sato@example.net', null, null, '2024-07-01'],
    [6, 'Pablo', 'Ruiz', 'pablo.ruiz@example.org', 'Seville', '555-0249', '2021-12-24'],
    [7, 'Amara', 'Diallo', 'amara.diallo@example.com', '  Dakar ', '555-0262', '2025-02-28'],
  ]),
  insert('orders', ORDER_COLUMNS, [
    [1, 3, '2025-12-29', '2026-01-02', 88.8, 5, 'shipped'],
    [2, 1, '2026-02-11', '2026-02-12', 23.4, null, 'shipped'],
    [3, 4, '2026-03-17', null, 145.0, 10, 'cancelled'],
    [4, 2, '2026-04-04', '2026-04-11', 61.15, null, 'shipped'],
    [5, 6, '2026-06-09', '2026-06-10', 402.0, 30, 'shipped'],
    [6, 5, '2026-07-21', null, 7.75, null, 'pending'],
    [7, 7, '2026-08-30', '2026-09-01', 129.99, 0, 'shipped'],
    [8, 1, '2026-09-14', null, 56.5, 15, 'pending'],
    [9, 3, '2026-10-20', null, 19.0, null, 'pending'],
  ]),
  insert('employees', EMPLOYEE_COLUMNS, [
    [1, 'Elif Demir', 'Manager', 78500, '2012-10-08', 6000],
    [2, 'Jack Hill', 'Developer', 58900, '2023-04-17', null],
    [3, 'Mei Chen', 'Analyst', 66400, '2017-07-03', 2200],
    [4, 'Noah Brown', 'Support', 37800, '2025-09-22', null],
    [5, 'Priya Nair', 'Designer', 57300, '2016-02-14', 900],
    [6, 'Lucas Moreau', 'Intern', 26500, '2026-01-12', null],
  ]),
].join('\n')

export const EXPRESSIONS_DB = database(SCHEMA, DATA, ALT_DATA)
