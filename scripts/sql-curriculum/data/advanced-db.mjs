/**
 * The database for "Advanced queries": a garden centre. Staff report to managers (a tree),
 * categories sit inside other categories (another tree), products keep extra details as
 * JSON, sales happen on most days but not all (gaps for a calendar), and targets are kept
 * one column per quarter (wide, for turning columns into rows). A few NULLs are there on
 * purpose: a sale at the self-checkout has no staff_id, one product's price is on request,
 * and the gift card has no category or details.
 * Every person and product here is invented.
 */
import { database, insert } from './databases.mjs'

const SCHEMA = `CREATE TABLE staff (
  id INTEGER PRIMARY KEY,
  name TEXT,
  role TEXT,
  manager_id INTEGER,
  hired TEXT
);
CREATE TABLE categories (
  id INTEGER PRIMARY KEY,
  name TEXT,
  parent_id INTEGER
);
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT,
  category_id INTEGER,
  price REAL,
  details TEXT
);
CREATE TABLE sales (
  id INTEGER PRIMARY KEY,
  product_id INTEGER,
  staff_id INTEGER,
  sold_on TEXT,
  quantity INTEGER
);
CREATE TABLE targets (
  staff_id INTEGER PRIMARY KEY,
  q1 INTEGER,
  q2 INTEGER,
  q3 INTEGER,
  q4 INTEGER
);`

const S = ['id', 'name', 'role', 'manager_id', 'hired']
const C = ['id', 'name', 'parent_id']
const P = ['id', 'name', 'category_id', 'price', 'details']
const SA = ['id', 'product_id', 'staff_id', 'sold_on', 'quantity']
const T = ['staff_id', 'q1', 'q2', 'q3', 'q4']

/** Details as JSON text (null stays NULL). */
const j = (o) => (o === null ? null : JSON.stringify(o))

/** Sales as [product_id, staff_id, sold_on, quantity], numbered in order. */
const sales = (rows) => rows.map((r, i) => [i + 1, ...r])

const DATA = [
  insert('staff', S, [
    [1, 'Rosa Lindqvist', 'manager', null, '2019-03-01'],
    [2, 'Tomas Ferreira', 'supervisor', 1, '2020-06-15'],
    [3, 'Nadia Okafor', 'supervisor', 1, '2021-02-01'],
    [4, 'Owen Price', 'assistant', 2, '2022-04-11'],
    [5, 'Priya Raman', 'assistant', 2, '2023-09-05'],
    [6, 'Leo Marsh', 'assistant', 3, '2024-01-20'],
    [7, 'Mia Kowal', 'trainee', 4, '2026-05-02'],
    [8, 'Sam Adeyemi', 'trainee', 6, '2026-08-17'],
  ]),
  insert('categories', C, [
    [1, 'Plants', null],
    [2, 'Outdoor plants', 1],
    [3, 'Houseplants', 1],
    [4, 'Shrubs', 2],
    [5, 'Perennials', 2],
    [6, 'Tools', null],
    [7, 'Hand tools', 6],
    [8, 'Pots', null],
  ]),
  insert('products', P, [
    [1, 'Lavender', 5, 6.5, j({ colour: 'purple', height_cm: 45, tags: ['scented', 'sun', 'bees'], care: { water: 'low', light: 'sun' } })],
    [2, 'Hosta', 5, 8.0, j({ colour: 'green', height_cm: 50, tags: ['shade'], care: { water: 'medium', light: 'shade' } })],
    [3, 'Boxwood', 4, 24.0, j({ colour: 'green', height_cm: 60, tags: ['evergreen', 'hedge'], care: { water: 'medium', light: 'sun' } })],
    [4, 'Hydrangea', 4, 18.5, j({ colour: 'blue', height_cm: 90, tags: ['flowering', 'shade'], care: { water: 'high', light: 'part shade' } })],
    [5, 'Snake plant', 3, 15.0, j({ colour: 'green', height_cm: 70, tags: ['easy', 'low light'], care: { water: 'low', light: 'shade' } })],
    [6, 'Peace lily', 3, 12.0, j({ colour: 'white', height_cm: 40, tags: ['flowering', 'easy'], care: { water: 'medium', light: 'shade' } })],
    [7, 'Trowel', 7, 9.0, j({ material: 'steel', tags: ['hand tool'] })],
    [8, 'Pruning shears', 7, 22.0, j({ material: 'steel', tags: ['hand tool', 'sharp'] })],
    [9, 'Wheelbarrow', 6, 79.0, j({ material: 'steel', capacity_l: 90, tags: [] })],
    [10, 'Terracotta pot', 8, 7.5, j({ material: 'clay', diameter_cm: 20, tags: ['handmade'] })],
    [11, 'Olive tree', 2, null, j({ colour: 'green', height_cm: 150, tags: ['evergreen', 'sun'], care: { water: 'low', light: 'sun' } })],
    [12, 'Gift card', null, 25.0, null],
  ]),
  insert('sales', SA, sales([
    [1, 4, '2026-10-01', 3],
    [5, 5, '2026-10-01', 1],
    [7, null, '2026-10-01', 2],
    [3, 2, '2026-10-02', 1],
    [10, 6, '2026-10-02', 4],
    [1, 5, '2026-10-02', 2],
    [6, 4, '2026-10-03', 1],
    [12, null, '2026-10-03', 1],
    [4, 3, '2026-10-03', 2],
    [8, 6, '2026-10-06', 1],
    [2, 7, '2026-10-06', 3],
    [9, 2, '2026-10-07', 1],
    [5, 4, '2026-10-07', 2],
    [1, 8, '2026-10-08', 5],
    [10, 5, '2026-10-08', 2],
    [6, 6, '2026-10-09', 1],
    [3, 3, '2026-10-09', 2],
    [7, 7, '2026-10-10', 1],
    [11, 3, '2026-10-10', 1],
    [2, null, '2026-10-10', 2],
    [4, 5, '2026-10-12', 1],
    [1, 4, '2026-10-12', 2],
    [8, 8, '2026-10-13', 1],
    [5, 6, '2026-10-13', 3],
    [10, 4, '2026-10-14', 2],
    [6, 2, '2026-10-14', 2],
  ])),
  insert('targets', T, [
    [2, 4000, 4500, 5000, 6000],
    [3, 3500, 4000, 4500, 5000],
    [4, 2000, 2200, 2400, 2600],
    [5, 1800, 2000, 2200, 2500],
    [6, null, 1500, 1800, 2000],
    [7, null, null, 800, 1000],
    [8, null, null, null, 600],
  ]),
].join('\n')

const ALT_DATA = [
  insert('staff', S, [
    [1, 'Ines Duarte', 'manager', null, '2018-05-01'],
    [2, 'Kofi Mensah', 'supervisor', 1, '2020-01-10'],
    [3, 'Lena Hoff', 'assistant', 2, '2022-07-07'],
    [4, 'Marco Bianchi', 'assistant', 2, '2023-03-03'],
    [5, 'Noor Hassan', 'trainee', 3, '2026-06-01'],
    [6, 'Pavel Novak', 'supervisor', 1, '2021-09-09'],
  ]),
  insert('categories', C, [
    [1, 'Garden', null],
    [2, 'Trees', 1],
    [3, 'Fruit trees', 2],
    [4, 'Indoor', null],
    [5, 'Cacti', 4],
    [6, 'Supplies', null],
  ]),
  insert('products', P, [
    [1, 'Apple tree', 3, 35.0, j({ colour: 'green', height_cm: 180, tags: ['fruit', 'sun'], care: { water: 'medium', light: 'sun' } })],
    [2, 'Birch', 2, 42.0, j({ colour: 'white', height_cm: 250, tags: ['native'], care: { water: 'medium', light: 'sun' } })],
    [3, 'Barrel cactus', 5, 11.0, j({ colour: 'green', height_cm: 25, tags: ['easy', 'sun'], care: { water: 'low', light: 'sun' } })],
    [4, 'Compost', 6, 6.0, j({ material: 'peat-free', tags: ['organic'] })],
    [5, 'Watering can', 6, 14.0, j({ material: 'zinc', capacity_l: 5, tags: [] })],
    [6, 'Pear tree', 3, null, j({ colour: 'green', height_cm: 200, tags: ['fruit'], care: { water: 'medium', light: 'sun' } })],
    [7, 'Plant food', null, 5.5, null],
  ]),
  insert('sales', SA, sales([
    [1, 3, '2026-10-01', 1],
    [3, 4, '2026-10-01', 2],
    [4, null, '2026-10-02', 5],
    [5, 2, '2026-10-02', 1],
    [2, 6, '2026-10-04', 1],
    [3, 5, '2026-10-05', 3],
    [7, null, '2026-10-05', 2],
    [1, 2, '2026-10-06', 1],
    [4, 3, '2026-10-07', 4],
  ])),
  insert('targets', T, [
    [2, 3000, 3200, 3400, 3600],
    [3, 1500, 1600, 1700, 1800],
    [4, null, 1400, 1500, 1600],
    [5, null, null, null, 500],
    [6, 2500, 2600, 2700, 2900],
  ]),
].join('\n')

export const ADVANCED_DB = database(SCHEMA, DATA, ALT_DATA)

/** Checks for challenges that create views or indexes. */
export const CHECK = {
  /** A view's column names, in order. */
  viewColumns: (view) => [`The ${view} view has the right columns`, `SELECT name FROM pragma_table_info('${view}') ORDER BY cid`],
  /** A view's rows, in a fixed order. */
  viewRows: (view, orderBy) => [`The ${view} view gives the right rows`, `SELECT * FROM ${view} ORDER BY ${orderBy}`],
  /** The views in the database. */
  views: ['The right views exist', "SELECT name FROM sqlite_schema WHERE type = 'view' ORDER BY name"],
  /** Indexes made with CREATE INDEX on a table: their columns, whether unique and whether partial. */
  indexes: (table) => [
    `The ${table} table has the right indexes`,
    `SELECT (SELECT group_concat(COALESCE(ii.name, '(expression)'), ', ') FROM pragma_index_info(il.name) ii) AS columns,\n` +
      `       il."unique", il.partial\nFROM pragma_index_list('${table}') il\nWHERE il.origin = 'c'\nORDER BY columns`,
  ],
  /** The plan SQLite picks for a query. Index names show in it, so prompts give them. */
  plan: (label, sql) => [label, `EXPLAIN QUERY PLAN ${sql}`],
}
