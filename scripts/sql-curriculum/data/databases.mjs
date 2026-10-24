/**
 * The databases SQL lessons run on. `setupSql` makes the tables learners see; `altSetupSql`
 * has the same tables with other rows, which every Check also runs on, so a query has to
 * pick rows by their values (an answer typed in as fixed values gives the wrong result).
 * Keep the other rows varied enough that each challenge's answer differs between the two.
 */

/** Columns of each CREATE TABLE in `schema`, for the "Tables" list learners see. */
function tablesOf(schema) {
  return [...schema.matchAll(/CREATE TABLE (\w+) \(([\s\S]*?)\);/g)].map(([, name, body]) => ({
    name,
    columns: body
      .split(',\n')
      .map((line) => line.trim().split(/\s+/)[0])
      .filter(Boolean),
  }))
}

export function insert(table, columns, rows) {
  const value = (v) => (v === null ? 'NULL' : typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : String(v))
  return `INSERT INTO ${table} (${columns.join(', ')}) VALUES\n${rows
    .map((row) => `  (${row.map(value).join(', ')})`)
    .join(',\n')};`
}

export function database(schema, data, altData) {
  return { setupSql: `${schema}\n${data}\n`, altSetupSql: `${schema}\n${altData}\n`, tables: tablesOf(schema) }
}

// ---- Querying a table: books, pets and a shop's products ------------------------------

const QUERYING_SCHEMA = `CREATE TABLE books (
  id INTEGER PRIMARY KEY,
  title TEXT,
  author TEXT,
  genre TEXT,
  year INTEGER,
  pages INTEGER,
  price REAL,
  rating REAL
);
CREATE TABLE pets (
  id INTEGER PRIMARY KEY,
  name TEXT,
  species TEXT,
  breed TEXT,
  age INTEGER,
  weight_kg REAL,
  owner TEXT
);
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT,
  category TEXT,
  price REAL,
  stock INTEGER
);`

const BOOK_COLUMNS = ['id', 'title', 'author', 'genre', 'year', 'pages', 'price', 'rating']
const PET_COLUMNS = ['id', 'name', 'species', 'breed', 'age', 'weight_kg', 'owner']
const PRODUCT_COLUMNS = ['id', 'name', 'category', 'price', 'stock']

const QUERYING_DATA = [
  insert('books', BOOK_COLUMNS, [
    [1, 'Pride and Prejudice', 'Jane Austen', 'Romance', 1813, 432, 7.99, 4.6],
    [2, 'Emma', 'Jane Austen', 'Romance', 1815, 474, 6.5, 4.1],
    [3, 'Dune', 'Frank Herbert', 'Science Fiction', 1965, 688, 10.99, 4.7],
    [4, 'Neuromancer', 'William Gibson', 'Science Fiction', 1984, 271, 9.49, null],
    [5, 'The Hobbit', 'J.R.R. Tolkien', 'Fantasy', 1937, 310, 8.99, 4.8],
    [6, 'A Wizard of Earthsea', 'Ursula K. Le Guin', 'Fantasy', 1968, 183, 7.49, 4.4],
    [7, 'The Left Hand of Darkness', 'Ursula K. Le Guin', 'Science Fiction', 1969, 304, 9.99, 4.3],
    [8, 'Frankenstein', 'Mary Shelley', 'Horror', 1818, 280, 5.99, 4.0],
    [9, 'Dracula', 'Bram Stoker', 'Horror', 1897, 418, 6.99, 4.2],
    [10, 'The Murder of Roger Ackroyd', 'Agatha Christie', 'Mystery', 1926, 312, 7.99, 4.5],
    [11, 'Murder on the Orient Express', 'Agatha Christie', 'Mystery', 1934, 256, 8.49, 4.6],
    [12, 'The Hound of the Baskervilles', 'Arthur Conan Doyle', 'Mystery', 1902, 256, 4.99, null],
    [13, 'Beloved', 'Toni Morrison', 'Literary', 1987, 324, 11.99, 4.4],
    [14, 'One Hundred Years of Solitude', 'Gabriel Garcia Marquez', 'Literary', 1967, 417, 12.49, 4.6],
    [15, 'The Road', 'Cormac McCarthy', 'Literary', 2006, 287, 10.49, null],
    [16, 'Project Hail Mary', 'Andy Weir', 'Science Fiction', 2021, 496, 14.99, 4.8],
  ]),
  insert('pets', PET_COLUMNS, [
    [1, 'Biscuit', 'dog', 'Beagle', 4, 10.5, 'Ana'],
    [2, 'Luna', 'cat', null, 2, 4.1, 'Ben'],
    [3, 'Max', 'dog', 'Labrador', 7, 31.0, 'Chloe'],
    [4, 'Pepper', 'rabbit', null, 1, 1.8, null],
    [5, 'Shadow', 'cat', 'Siamese', 9, 5.2, 'Ana'],
    [6, 'Coco', 'parrot', null, 15, 0.4, 'Dev'],
    [7, 'Daisy', 'dog', 'Poodle', 3, 7.3, null],
    [8, 'Mochi', 'cat', null, 5, 3.9, 'Ella'],
    [9, 'Rocky', 'dog', 'Boxer', 6, 28.4, 'Ben'],
    [10, 'Nibbles', 'hamster', null, 1, 0.1, 'Finn'],
    [11, 'Oscar', 'cat', 'Maine Coon', 11, 7.8, null],
    [12, 'Bella', 'dog', null, 2, 12.2, 'Grace'],
  ]),
  insert('products', PRODUCT_COLUMNS, [
    [1, 'Notebook', 'stationery', 3.5, 120],
    [2, 'Pencil set', 'stationery', 4.25, 80],
    [3, 'Backpack', 'bags', 39.99, 15],
    [4, 'Water bottle', 'kitchen', 12.0, 40],
    [5, 'Desk lamp', 'home', 24.5, 0],
    [6, 'Headphones', 'electronics', 59.9, 12],
    [7, 'USB cable', 'electronics', 6.99, 200],
    [8, 'Lunch box', 'kitchen', 9.75, 35],
    [9, 'Sticky notes', 'stationery', 2.1, 300],
    [10, 'Phone stand', 'electronics', 15.0, 0],
  ]),
].join('\n')

const QUERYING_ALT_DATA = [
  insert('books', BOOK_COLUMNS, [
    [1, 'Sense and Sensibility', 'Jane Austen', 'Romance', 1811, 409, 6.99, 4.0],
    [2, 'Foundation', 'Isaac Asimov', 'Science Fiction', 1951, 255, 8.99, 4.5],
    [3, 'The Name of the Wind', 'Patrick Rothfuss', 'Fantasy', 2007, 662, 11.49, 4.7],
    [4, 'The Haunting of Hill House', 'Shirley Jackson', 'Horror', 1959, 246, 7.99, null],
    [5, 'And Then There Were None', 'Agatha Christie', 'Mystery', 1939, 272, 8.99, 4.8],
    [6, 'Jane Eyre', 'Charlotte Bronte', 'Romance', 1847, 532, 5.99, 4.3],
    [7, 'Kindred', 'Octavia E. Butler', 'Science Fiction', 1979, 264, 9.99, 4.6],
    [8, 'The Remains of the Day', 'Kazuo Ishiguro', 'Literary', 1989, 258, 10.99, null],
    [9, 'The Name of the Rose', 'Umberto Eco', 'Mystery', 1980, 536, 12.99, 4.4],
    [10, 'Circe', 'Madeline Miller', 'Fantasy', 2018, 393, 13.99, 4.5],
    [11, 'Rebecca', 'Daphne du Maurier', 'Gothic', 1938, 449, 7.49, 4.2],
    [12, "Ender's Game", 'Orson Scott Card', 'Science Fiction', 1985, 324, 8.49, 4.6],
  ]),
  insert('pets', PET_COLUMNS, [
    [1, 'Teddy', 'dog', 'Pug', 3, 8.0, 'Ivy'],
    [2, 'Misty', 'cat', null, 6, 4.5, null],
    [3, 'Ziggy', 'parrot', null, 22, 0.5, 'Jay'],
    [4, 'Bruno', 'dog', 'Rottweiler', 5, 45.0, 'Kim'],
    [5, 'Snowball', 'rabbit', null, 2, 2.0, null],
    [6, 'Felix', 'cat', 'Persian', 12, 4.8, 'Leo'],
    [7, 'Rex', 'dog', null, 8, 25.5, 'Ivy'],
    [8, 'Shelly', 'tortoise', null, 40, 1.3, 'Mia'],
    [9, 'Tiger', 'cat', 'Bengal', 4, 5.6, 'Kim'],
  ]),
  insert('products', PRODUCT_COLUMNS, [
    [1, 'Eraser', 'stationery', 0.99, 500],
    [2, 'Laptop sleeve', 'bags', 19.99, 0],
    [3, 'Blender', 'kitchen', 49.0, 8],
    [4, 'Ruler', 'stationery', 1.5, 150],
    [5, 'Speaker', 'electronics', 34.95, 20],
    [6, 'Mug', 'kitchen', 7.5, 60],
    [7, 'Charger', 'electronics', 18.0, 0],
    [8, 'Bookends', 'home', 16.25, 9],
  ]),
].join('\n')

export const QUERYING_DB = database(QUERYING_SCHEMA, QUERYING_DATA, QUERYING_ALT_DATA)
