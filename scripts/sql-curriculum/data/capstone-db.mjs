/**
 * The databases for "Capstone projects": an online shop, a school's grades, a library's
 * loans, a messy sign-up import to clean, and the raw sheets a booking system is built from.
 * Each has a second set of rows that every check also runs on.
 * Every person, product, book and place here is invented. Today is 2026-10-24.
 */
import { database, insert } from './databases.mjs'

/** Rows numbered from 1 in the order given. */
const numbered = (rows) => rows.map((r, i) => [i + 1, ...r])

// ---- An online shop ------------------------------------------------------------------------

const SHOP_SCHEMA = `CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT,
  email TEXT,
  city TEXT,
  joined TEXT
);
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT,
  category TEXT,
  price REAL
);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER,
  ordered_on TEXT,
  status TEXT
);
CREATE TABLE order_items (
  order_id INTEGER,
  product_id INTEGER,
  quantity INTEGER,
  unit_price REAL
);`

const CU = ['id', 'name', 'email', 'city', 'joined']
const PR = ['id', 'name', 'category', 'price']
const OR = ['id', 'customer_id', 'ordered_on', 'status']
const OI = ['order_id', 'product_id', 'quantity', 'unit_price']

/** Items as { order_id: [[product_id, quantity, unit_price], …] }. */
const items = (byOrder) => Object.entries(byOrder).flatMap(([order, rows]) => rows.map((r) => [Number(order), ...r]))

const SHOP_DATA = [
  insert('customers', CU, [
    [1, 'Amara Osei', 'amara.osei@example.com', 'Leeds', '2026-01-12'],
    [2, 'Ben Hartley', 'ben.hartley@example.com', 'York', '2026-02-03'],
    [3, 'Chloe Dubois', 'chloe.dubois@example.com', 'Leeds', '2026-02-20'],
    [4, 'Dev Patel', 'dev.patel@example.com', 'Hull', '2026-03-15'],
    [5, 'Elena Rossi', 'elena.rossi@example.com', 'York', '2026-04-02'],
    [6, 'Finn Murphy', 'finn.murphy@example.com', 'Leeds', '2026-05-18'],
    [7, 'Grace Liu', 'grace.liu@example.com', 'Hull', '2026-06-30'],
    [8, 'Hassan Ali', 'hassan.ali@example.com', 'York', '2026-09-01'],
  ]),
  insert('products', PR, [
    [1, 'Green tea', 'Tea', 4.5],
    [2, 'Earl Grey', 'Tea', 5.0],
    [3, 'Chai blend', 'Tea', 6.0],
    [4, 'House espresso', 'Coffee', 8.0],
    [5, 'Decaf beans', 'Coffee', 7.5],
    [6, 'Cold brew pack', 'Coffee', 9.0],
    [7, 'Teapot', 'Kitchen', 22.0],
    [8, 'Milk frother', 'Kitchen', 18.0],
    [9, 'Mug set', 'Kitchen', 15.0],
    [10, 'Tea strainer', 'Kitchen', 3.5],
  ]),
  insert('orders', OR, numbered([
    [1, '2026-05-04', 'paid'],
    [2, '2026-05-11', 'paid'],
    [3, '2026-05-20', 'paid'],
    [1, '2026-06-02', 'paid'],
    [4, '2026-06-09', 'cancelled'],
    [5, '2026-06-15', 'paid'],
    [2, '2026-06-28', 'paid'],
    [6, '2026-07-05', 'paid'],
    [3, '2026-07-19', 'paid'],
    [1, '2026-07-30', 'paid'],
    [7, '2026-08-08', 'paid'],
    [4, '2026-08-14', 'paid'],
    [5, '2026-08-25', 'cancelled'],
    [2, '2026-09-03', 'paid'],
    [6, '2026-09-17', 'paid'],
    [1, '2026-09-29', 'paid'],
    [3, '2026-10-06', 'paid'],
    [7, '2026-10-12', 'paid'],
    [5, '2026-10-20', 'paid'],
  ])),
  insert('order_items', OI, items({
    1: [[1, 2, 4.5], [7, 1, 22.0]],
    2: [[4, 2, 8.0]],
    3: [[2, 1, 5.0], [9, 1, 15.0]],
    4: [[3, 2, 6.0]],
    5: [[8, 1, 18.0]],
    6: [[5, 1, 7.5], [1, 1, 4.5]],
    7: [[4, 1, 7.2]],
    8: [[6, 3, 9.0], [9, 1, 13.5]],
    9: [[2, 2, 5.0], [3, 1, 6.0]],
    10: [[7, 1, 19.8], [1, 3, 4.5]],
    11: [[8, 1, 18.0], [4, 1, 8.0]],
    12: [[3, 2, 5.4]],
    13: [[6, 2, 9.0]],
    14: [[4, 3, 8.0]],
    15: [[2, 1, 5.0], [5, 2, 7.5]],
    16: [[9, 1, 15.0], [3, 1, 6.0]],
    17: [[1, 2, 4.5]],
    18: [[6, 2, 8.1], [8, 1, 18.0]],
    19: [[2, 1, 5.0], [7, 1, 22.0]],
  })),
].join('\n')

const SHOP_ALT = [
  insert('customers', CU, [
    [1, 'Ivo Petrov', 'ivo.petrov@example.com', 'Bristol', '2026-03-01'],
    [2, 'Jade Moss', 'jade.moss@example.com', 'Bath', '2026-04-10'],
    [3, 'Kenji Sato', 'kenji.sato@example.com', 'Bristol', '2026-05-05'],
    [4, 'Lara Costa', 'lara.costa@example.com', 'Bath', '2026-06-06'],
    [5, 'Mo Farouk', 'mo.farouk@example.com', 'Bristol', '2026-07-07'],
  ]),
  insert('products', PR, [
    [1, 'Oolong', 'Tea', 7.0],
    [2, 'Mint tea', 'Tea', 3.8],
    [3, 'Filter beans', 'Coffee', 6.5],
    [4, 'Espresso cups', 'Kitchen', 12.0],
    [5, 'Kettle', 'Kitchen', 35.0],
    [6, 'Coffee grinder', 'Kitchen', 28.0],
  ]),
  insert('orders', OR, numbered([
    [1, '2026-06-03', 'paid'],
    [2, '2026-06-20', 'paid'],
    [1, '2026-07-08', 'paid'],
    [3, '2026-07-22', 'cancelled'],
    [3, '2026-08-02', 'paid'],
    [5, '2026-08-30', 'paid'],
    [2, '2026-09-12', 'paid'],
    [1, '2026-10-01', 'paid'],
  ])),
  insert('order_items', OI, items({
    1: [[1, 2, 7.0]],
    2: [[5, 1, 35.0], [2, 1, 3.8]],
    3: [[3, 2, 6.5]],
    4: [[4, 1, 12.0]],
    5: [[2, 3, 3.8], [4, 2, 10.8]],
    6: [[3, 1, 6.5]],
    7: [[1, 1, 6.3], [3, 2, 6.5]],
    8: [[5, 1, 31.5]],
  })),
].join('\n')

export const SHOP_DB = database(SHOP_SCHEMA, SHOP_DATA, SHOP_ALT)

// ---- A school's grades ---------------------------------------------------------------------

const SCHOOL_SCHEMA = `CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  name TEXT,
  year_group INTEGER
);
CREATE TABLE courses (
  id INTEGER PRIMARY KEY,
  title TEXT,
  teacher TEXT
);
CREATE TABLE enrolments (
  student_id INTEGER,
  course_id INTEGER
);
CREATE TABLE assessments (
  id INTEGER PRIMARY KEY,
  course_id INTEGER,
  title TEXT,
  weight INTEGER,
  due_on TEXT
);
CREATE TABLE results (
  assessment_id INTEGER,
  student_id INTEGER,
  score INTEGER
);`

const ST = ['id', 'name', 'year_group']
const CO = ['id', 'title', 'teacher']
const EN = ['student_id', 'course_id']
const AS = ['id', 'course_id', 'title', 'weight', 'due_on']
const RE = ['assessment_id', 'student_id', 'score']

/** Results as { assessment_id: { student_id: score } }; a missing student has not handed in. */
const results = (byAssessment) =>
  Object.entries(byAssessment).flatMap(([a, scores]) => Object.entries(scores).map(([s, score]) => [Number(a), Number(s), score]))

const SCHOOL_DATA = [
  insert('students', ST, [
    [1, 'Aisha Khan', 11],
    [2, 'Bruno Silva', 11],
    [3, 'Cara Nolan', 11],
    [4, 'Dmitri Ivanov', 10],
    [5, 'Esme Clarke', 10],
    [6, 'Felix Wong', 10],
    [7, 'Gemma Hart', 11],
  ]),
  insert('courses', CO, [
    [1, 'Maths', 'Ms Adeyemi'],
    [2, 'Biology', 'Mr Lindgren'],
    [3, 'History', 'Ms Torres'],
    [4, 'Art', 'Mr Okoro'],
  ]),
  insert('enrolments', EN, [
    [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1],
    [1, 2], [3, 2], [5, 2], [6, 2], [7, 2],
    [2, 3], [4, 3], [7, 3],
  ]),
  insert('assessments', AS, [
    [1, 1, 'Algebra test', 30, '2026-09-18'],
    [2, 1, 'Geometry project', 30, '2026-10-02'],
    [3, 1, 'Mid-term exam', 40, '2026-10-16'],
    [4, 2, 'Cells quiz', 20, '2026-09-15'],
    [5, 2, 'Lab report', 40, '2026-09-29'],
    [6, 2, 'Ecology essay', 40, '2026-10-13'],
    [7, 3, 'Source analysis', 50, '2026-09-24'],
    [8, 3, 'Essay', 50, '2026-10-08'],
  ]),
  insert('results', RE, results({
    1: { 1: 88, 2: 72, 3: 65, 4: 91, 5: 58, 6: 77 },
    2: { 1: 92, 2: 68, 3: 70, 4: 85, 6: 80 },
    3: { 1: 85, 2: 75, 3: 61, 4: 88, 5: 62, 6: 74 },
    4: { 1: 90, 3: 55, 5: 70, 6: 60, 7: 82 },
    5: { 1: 84, 3: 66, 5: 72, 7: 79 },
    6: { 1: 79, 3: 71, 5: 68, 6: 65, 7: 88 },
    7: { 2: 64, 4: 77, 7: 91 },
    8: { 2: 70, 7: 86 },
  })),
].join('\n')

const SCHOOL_ALT = [
  insert('students', ST, [
    [1, 'Hana Mori', 10],
    [2, 'Ian Burke', 10],
    [3, 'Jasmin Roy', 11],
    [4, 'Kofi Asante', 11],
  ]),
  insert('courses', CO, [
    [1, 'Physics', 'Dr Bell'],
    [2, 'Music', 'Ms Ray'],
    [3, 'Drama', 'Mr Finch'],
  ]),
  insert('enrolments', EN, [[1, 1], [2, 1], [3, 1], [4, 1], [2, 2], [4, 2]]),
  insert('assessments', AS, [
    [1, 1, 'Forces test', 50, '2026-09-20'],
    [2, 1, 'Circuits lab', 50, '2026-10-04'],
    [3, 2, 'Performance', 60, '2026-09-27'],
    [4, 2, 'Composition', 40, '2026-10-11'],
  ]),
  insert('results', RE, results({
    1: { 1: 74, 2: 58, 3: 90, 4: 66 },
    2: { 1: 80, 3: 85, 4: 70 },
    3: { 2: 88, 4: 61 },
    4: { 2: 76, 4: 59 },
  })),
].join('\n')

export const SCHOOL_DB = database(SCHOOL_SCHEMA, SCHOOL_DATA, SCHOOL_ALT)

// ---- A library's loans ---------------------------------------------------------------------

const LIBRARY_SCHEMA = `CREATE TABLE members (
  id INTEGER PRIMARY KEY,
  name TEXT,
  joined TEXT
);
CREATE TABLE books (
  id INTEGER PRIMARY KEY,
  title TEXT,
  author TEXT,
  genre TEXT
);
CREATE TABLE copies (
  id INTEGER PRIMARY KEY,
  book_id INTEGER
);
CREATE TABLE loans (
  id INTEGER PRIMARY KEY,
  copy_id INTEGER,
  member_id INTEGER,
  borrowed_on TEXT,
  due_on TEXT,
  returned_on TEXT
);`

const ME = ['id', 'name', 'joined']
const BO = ['id', 'title', 'author', 'genre']
const CP = ['id', 'book_id']
const LO = ['id', 'copy_id', 'member_id', 'borrowed_on', 'due_on', 'returned_on']

const LIBRARY_DATA = [
  insert('members', ME, [
    [1, 'Iris Bloom', '2024-02-10'],
    [2, 'Jonah Reyes', '2024-09-01'],
    [3, 'Kemi Adebayo', '2025-01-15'],
    [4, 'Luca Ferri', '2025-06-20'],
    [5, 'Maya Singh', '2026-03-03'],
    [6, 'Noah Fischer', '2026-08-12'],
  ]),
  insert('books', BO, [
    [1, 'Orchard of Glass Bells', 'Rhea Monroe', 'Fiction'],
    [2, 'Ember and Saltwater', 'Tomas Varga', 'Fiction'],
    [3, 'Quiet Engines of Spring', 'Lena Okafor', 'Science'],
    [4, 'A Map for Low Tide', 'Ines Calder', 'Fiction'],
    [5, 'Small Wonders of Soil', 'Dara Quinn', 'Science'],
    [6, 'The Copper Crown Years', 'Victor Hale', 'History'],
    [7, 'Harbour Walls of Vell', 'Moira Banks', 'History'],
  ]),
  insert('copies', CP, [[1, 1], [2, 1], [3, 2], [4, 3], [5, 4], [6, 4], [7, 5], [8, 6], [9, 7]]),
  insert('loans', LO, numbered([
    [8, 3, '2026-05-18', '2026-06-08', '2026-06-05'],
    [1, 1, '2026-07-02', '2026-07-23', '2026-07-20'],
    [3, 2, '2026-07-05', '2026-07-26', '2026-07-30'],
    [4, 3, '2026-07-14', '2026-08-04', '2026-08-01'],
    [5, 1, '2026-07-28', '2026-08-18', '2026-08-25'],
    [8, 4, '2026-08-03', '2026-08-24', '2026-08-24'],
    [2, 5, '2026-08-10', '2026-08-31', '2026-09-02'],
    [9, 2, '2026-08-19', '2026-09-09', '2026-09-05'],
    [6, 3, '2026-09-01', '2026-09-22', '2026-09-20'],
    [1, 4, '2026-09-06', '2026-09-27', '2026-10-04'],
    [3, 1, '2026-09-15', '2026-10-06', null],
    [7, 2, '2026-09-22', '2026-10-13', '2026-10-10'],
    [5, 5, '2026-09-28', '2026-10-19', null],
    [2, 3, '2026-10-03', '2026-10-24', null],
    [4, 4, '2026-10-08', '2026-10-29', null],
    [1, 2, '2026-10-12', '2026-11-02', null],
    [6, 1, '2026-10-15', '2026-11-05', null],
  ])),
].join('\n')

const LIBRARY_ALT = [
  insert('members', ME, [
    [1, 'Ola Berg', '2025-01-01'],
    [2, 'Pia Lund', '2025-05-05'],
    [3, 'Rami Haddad', '2026-02-02'],
    [4, 'Sofia Marin', '2026-07-07'],
  ]),
  insert('books', BO, [
    [1, 'Lanterns Over Clay', 'Ana Ruiz', 'Poetry'],
    [2, 'Paper Rivers Running', 'Bo Lind', 'Poetry'],
    [3, 'Iron and Orchid Gates', 'Cal West', 'History'],
  ]),
  insert('copies', CP, [[1, 1], [2, 2], [3, 3], [4, 3]]),
  insert('loans', LO, numbered([
    [1, 1, '2026-06-01', '2026-06-22', '2026-06-25'],
    [3, 2, '2026-06-10', '2026-07-01', '2026-06-28'],
    [2, 3, '2026-08-04', '2026-08-25', '2026-08-24'],
    [4, 1, '2026-08-20', '2026-09-10', '2026-09-15'],
    [1, 2, '2026-09-25', '2026-10-16', null],
    [3, 3, '2026-10-05', '2026-10-26', null],
  ])),
].join('\n')

export const LIBRARY_DB = database(LIBRARY_SCHEMA, LIBRARY_DATA, LIBRARY_ALT)

// ---- A messy sign-up import ----------------------------------------------------------------

const CLEANING_SCHEMA = `CREATE TABLE signups (
  id INTEGER PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  city TEXT,
  signed_up TEXT,
  plan TEXT,
  referred_by TEXT
);`

const SI = ['id', 'full_name', 'email', 'phone', 'city', 'signed_up', 'plan', 'referred_by']

const CLEANING_DATA = insert('signups', SI, [
  [1, '  Alice Moreau', 'Alice.Moreau@Example.com', '07700 900123', 'Leeds', '2026-03-04', 'Basic', 'FRIEND10'],
  [2, 'Bilal Rahman', 'bilal.rahman@example.com', '(07700) 900-456', 'leeds', '05/03/2026', 'pro', ''],
  [3, 'Alice Moreau', 'alice.moreau@example.com ', '07700900123', 'Leeds', '2026-03-09', 'basic ', null],
  [4, 'Chen Wei', 'chen.wei@example.com', '07700-900-789', 'York ', '12/03/2026', ' PRO', 'FRIEND10'],
  [5, 'Dana White', 'DANA.WHITE@EXAMPLE.COM', '07700 900 321', 'Hull', '2026-03-15', 'Basic', ''],
  [6, 'Bilal Rahman', 'Bilal.Rahman@example.com', '07700 900456', 'Leeds', '2026-03-20', 'Pro', 'SPRING'],
  [7, 'Emeka Obi', 'emeka.obi@example.com', '0770 090 0654', 'york', '22/03/2026', 'basic', null],
  [8, 'Fiona Lake ', 'fiona.lake@example.com', '', 'Hull', '2026-04-01', 'Team', '  '],
  [9, 'Dana White', 'dana.white@example.com', '07700900321', 'hull', '03/04/2026', 'basic', 'FRIEND10'],
  [10, 'Gus Navarro', 'gus.navarro@example.com', null, 'Leeds', '2026-04-11', 'team ', null],
])

const CLEANING_ALT = insert('signups', SI, [
  [1, 'Hugo Brandt', 'hugo.brandt@example.com', '07700 900111', 'Bath', '2026-05-02', 'basic', null],
  [2, 'Ivy Chen', 'IVY.CHEN@example.com', '07700-900-222', 'bath ', '04/05/2026', 'Team', ''],
  [3, 'Hugo Brandt', ' hugo.brandt@example.com', '(07700) 900111', 'Bath', '09/05/2026', 'BASIC', 'SUMMER'],
  [4, 'Jon Reid', 'jon.reid@example.com', '0770090033', 'Bristol', '2026-05-12', 'pro', null],
  [5, ' Kara Lowe', 'kara.lowe@example.com', null, 'Bristol', '2026-05-20', ' Pro ', 'SUMMER'],
  [6, 'Ivy Chen', 'ivy.chen@example.com', '07700900222', 'Bath', '2026-06-01', 'team', null],
  [7, 'Lina Shah', 'lina.shah@example.com', '07700 900 444', 'bristol', '07/06/2026', 'basic', '  '],
])

export const CLEANING_DB = database(CLEANING_SCHEMA, CLEANING_DATA, CLEANING_ALT)

// ---- The sheets a booking system starts from -------------------------------------------------

const BOOKING_SCHEMA = `CREATE TABLE cottage_sheet (
  name TEXT,
  sleeps INTEGER,
  nightly_rate REAL
);
CREATE TABLE requests (
  id INTEGER PRIMARY KEY,
  guest_name TEXT,
  guest_email TEXT,
  cottage TEXT,
  arrive TEXT,
  depart TEXT,
  party INTEGER,
  received_at TEXT
);`

const CS = ['name', 'sleeps', 'nightly_rate']
const RQ = ['id', 'guest_name', 'guest_email', 'cottage', 'arrive', 'depart', 'party', 'received_at']

const BOOKING_DATA = [
  insert('cottage_sheet', CS, [
    ['Bramble Cottage', 4, 120.0],
    ['Heron Lodge', 6, 165.0],
    ['Mill House', 2, 95.0],
    ['Willow Barn', 8, 210.0],
  ]),
  insert('requests', RQ, numbered([
    ['Olivia Grant', 'olivia.grant@example.com', 'Bramble Cottage', '2026-10-02', '2026-10-05', 2, '2026-08-01'],
    ['Tariq Hussain', 'tariq.hussain@example.com', 'Heron Lodge', '2026-10-03', '2026-10-10', 5, '2026-08-04'],
    ['Megan Price', 'megan.price@example.com', 'Mill House', '2026-10-04', '2026-10-06', 3, '2026-08-09'],
    ['Yusuf Demir', 'yusuf.demir@example.com', 'Bramble Cottage', '2026-10-04', '2026-10-08', 4, '2026-08-15'],
    ['Olivia Grant', 'olivia.grant@example.com', 'Willow Barn', '2026-10-16', '2026-10-20', 7, '2026-08-20'],
    ['Claire Moreau', 'claire.moreau@example.com', 'Mill House', '2026-10-10', '2026-10-14', 2, '2026-08-22'],
    ['Pedro Alves', 'pedro.alves@example.com', 'Heron Lodge', '2026-10-10', '2026-10-12', 6, '2026-08-30'],
    ['Megan Price', 'megan.price@example.com', 'Bramble Cottage', '2026-10-12', '2026-10-15', 2, '2026-09-02'],
    ['Tariq Hussain', 'tariq.hussain@example.com', 'Heron Lodge', '2026-10-11', '2026-10-13', 4, '2026-09-10'],
    ['Claire Moreau', 'claire.moreau@example.com', 'Bramble Cottage', '2026-10-20', '2026-10-23', 3, '2026-09-15'],
  ])),
].join('\n')

const BOOKING_ALT = [
  insert('cottage_sheet', CS, [
    ['Fern Hut', 2, 80.0],
    ['Lark Rise', 5, 140.0],
    ['Old Forge', 3, 110.0],
  ]),
  insert('requests', RQ, numbered([
    ['Ana Lima', 'ana.lima@example.com', 'Lark Rise', '2026-10-01', '2026-10-04', 4, '2026-07-10'],
    ['Bo Jensen', 'bo.jensen@example.com', 'Fern Hut', '2026-10-02', '2026-10-03', 2, '2026-07-15'],
    ['Cleo Hart', 'cleo.hart@example.com', 'Old Forge', '2026-10-05', '2026-10-09', 4, '2026-07-20'],
    ['Ana Lima', 'ana.lima@example.com', 'Old Forge', '2026-10-06', '2026-10-08', 2, '2026-08-01'],
    ['Dan Okoye', 'dan.okoye@example.com', 'Lark Rise', '2026-10-03', '2026-10-06', 5, '2026-08-12'],
    ['Bo Jensen', 'bo.jensen@example.com', 'Lark Rise', '2026-10-15', '2026-10-18', 3, '2026-09-01'],
  ])),
].join('\n')

export const BOOKING_DB = database(BOOKING_SCHEMA, BOOKING_DATA, BOOKING_ALT)
