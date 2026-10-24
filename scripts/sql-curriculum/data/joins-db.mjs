/**
 * The database for "Joining tables": an online shop split into linked tables. Orders point
 * to a customer and to the employee who handled them; order_items links orders to products
 * (an order has many products, a product is in many orders); employees point to their
 * manager. Some customers never ordered, some products were never sold and some staff
 * handled no orders, because finding those is half of what joins are for.
 */
import { database, insert } from './databases.mjs'

const SCHEMA = `CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT,
  city TEXT,
  joined TEXT
);
CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT,
  role TEXT,
  manager_id INTEGER
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
  employee_id INTEGER,
  order_date TEXT,
  status TEXT
);
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER,
  product_id INTEGER,
  quantity INTEGER
);`

const C = ['id', 'name', 'city', 'joined']
const E = ['id', 'name', 'role', 'manager_id']
const P = ['id', 'name', 'category', 'price']
const O = ['id', 'customer_id', 'employee_id', 'order_date', 'status']
const I = ['id', 'order_id', 'product_id', 'quantity']

/** Order lines as [order_id, product_id, quantity], numbered from 1. */
function items(lines) {
  return lines.map((line, i) => [i + 1, ...line])
}

const DATA = [
  insert('customers', C, [
    [1, 'Ana Silva', 'Lisbon', '2024-02-14'],
    [2, 'Ben Okafor', 'Lagos', '2023-11-03'],
    [3, 'Chloe Martin', 'Paris', '2025-06-21'],
    [4, 'Dev Patel', 'Mumbai', '2022-08-30'],
    [5, 'Ella Novak', 'Prague', '2025-01-09'],
    [6, 'Finn Murphy', 'Dublin', '2024-12-01'],
    [7, 'Grace Kim', 'Seoul', '2026-03-15'],
    [8, 'Hugo Garcia', 'Madrid', '2023-05-19'],
  ]),
  insert('employees', E, [
    [1, 'Maria Lopez', 'Manager', null],
    [2, 'Tom Reed', 'Team lead', 1],
    [3, 'Aisha Khan', 'Sales', 2],
    [4, 'Leo Rossi', 'Sales', 2],
    [5, 'Sara Lind', 'Support', 1],
    [6, 'Omar Haddad', 'Sales', 2],
  ]),
  insert('products', P, [
    [1, 'Notebook', 'stationery', 3.5],
    [2, 'Pencil set', 'stationery', 4.25],
    [3, 'Backpack', 'bags', 39.99],
    [4, 'Water bottle', 'kitchen', 12.0],
    [5, 'Desk lamp', 'home', 24.5],
    [6, 'Headphones', 'electronics', 59.9],
    [7, 'USB cable', 'electronics', 6.99],
    [8, 'Lunch box', 'kitchen', 9.75],
    [9, 'Sticky notes', 'stationery', 2.1],
    [10, 'Phone stand', 'electronics', 15.0],
  ]),
  insert('orders', O, [
    [1, 1, 3, '2026-01-05', 'shipped'],
    [2, 2, 4, '2026-01-18', 'shipped'],
    [3, 1, 3, '2026-02-02', 'shipped'],
    [4, 3, 4, '2026-02-14', 'cancelled'],
    [5, 4, 3, '2026-03-01', 'shipped'],
    [6, 5, 4, '2026-03-22', 'shipped'],
    [7, 2, 3, '2026-04-10', 'shipped'],
    [8, 8, 5, '2026-05-05', 'pending'],
    [9, 4, 4, '2026-06-30', 'shipped'],
    [10, 3, 3, '2026-08-12', 'pending'],
    [11, 1, 4, '2026-09-03', 'shipped'],
    [12, 8, 3, '2026-09-28', 'pending'],
  ]),
  insert('order_items', I, items([
    [1, 1, 3], [1, 9, 2],
    [2, 3, 1], [2, 7, 2],
    [3, 6, 1],
    [4, 4, 2], [4, 8, 1],
    [5, 2, 4], [5, 1, 5], [5, 9, 10],
    [6, 7, 1],
    [7, 4, 1], [7, 3, 1],
    [8, 6, 1], [8, 1, 2],
    [9, 8, 3], [9, 2, 1],
    [10, 9, 5],
    [11, 7, 3], [11, 4, 1], [11, 1, 1],
    [12, 3, 1],
  ])),
].join('\n')

const ALT_DATA = [
  insert('customers', C, [
    [1, 'Lena Fischer', 'Berlin', '2023-03-08'],
    [2, 'Marco Bianchi', 'Rome', '2025-10-30'],
    [3, 'Zoe Adams', 'Toronto', '2022-01-17'],
    [4, 'Ravi Shah', 'Delhi', '2026-05-12'],
    [5, 'Yuki Sato', 'Osaka', '2024-07-01'],
    [6, 'Pablo Ruiz', 'Seville', '2021-12-24'],
  ]),
  insert('employees', E, [
    [1, 'Elif Demir', 'Manager', null],
    [2, 'Jack Hill', 'Sales', 1],
    [3, 'Mei Chen', 'Team lead', 1],
    [4, 'Noah Brown', 'Sales', 3],
    [5, 'Priya Nair', 'Support', 3],
  ]),
  insert('products', P, [
    [1, 'Eraser', 'stationery', 0.99],
    [2, 'Laptop sleeve', 'bags', 19.99],
    [3, 'Blender', 'kitchen', 49.0],
    [4, 'Ruler', 'stationery', 1.5],
    [5, 'Speaker', 'electronics', 34.95],
    [6, 'Mug', 'kitchen', 7.5],
    [7, 'Charger', 'electronics', 18.0],
    [8, 'Bookends', 'home', 16.25],
  ]),
  insert('orders', O, [
    [1, 3, 2, '2025-12-29', 'shipped'],
    [2, 1, 4, '2026-02-11', 'shipped'],
    [3, 4, 2, '2026-03-17', 'cancelled'],
    [4, 2, 4, '2026-04-04', 'shipped'],
    [5, 6, 2, '2026-06-09', 'shipped'],
    [6, 1, 4, '2026-07-21', 'pending'],
    [7, 3, 2, '2026-08-30', 'shipped'],
  ]),
  insert('order_items', I, items([
    [1, 1, 10], [1, 6, 2],
    [2, 3, 1],
    [3, 5, 1], [3, 4, 3],
    [4, 2, 1],
    [5, 8, 2], [5, 6, 4],
    [6, 1, 5],
    [7, 5, 1], [7, 2, 1], [7, 4, 2],
  ])),
].join('\n')

export const JOINS_DB = database(SCHEMA, DATA, ALT_DATA)
