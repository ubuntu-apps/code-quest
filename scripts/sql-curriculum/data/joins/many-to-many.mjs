// Joining tables: Many-to-many relationships.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { JOINS_DB } from '../joins-db.mjs'

export default makeTopic({
  id: 'many_to_many',
  title: 'Many-to-many',
  database: JOINS_DB,
  paragraphs: [
    'A customer has many orders, but each order has one customer: that is **one-to-many**, and a foreign key in `orders` is enough.',
    'Orders and products are different. An order can contain many products, and a product can appear in many orders. That is **many-to-many**, and no single column can hold it. Instead, a third table sits in the middle: `order_items`, with one row per pair, plus facts about the pair, like the quantity. A table like this is called a **junction table**.',
    'To go from orders to products, you always pass through the junction table:',
    '```\nSELECT o.id, p.name, i.quantity\nFROM orders o\nJOIN order_items i ON i.order_id = o.id\nJOIN products p ON i.product_id = p.id;\n```',
    'Because a product can be in many orders, and a customer can buy it more than once, counts through a junction table often need `COUNT(DISTINCT …)`. How many different customers bought each product:',
    '```\nSELECT p.name, COUNT(DISTINCT o.customer_id) AS customers\nFROM products p\nJOIN order_items i ON i.product_id = p.id\nJOIN orders o ON i.order_id = o.id\nGROUP BY p.id, p.name;\n```',
    'A self-join of the junction table answers "what is bought together?": two lines of the same order, with different products.',
    '```\nSELECT i1.order_id, i1.product_id AS product_1, i2.product_id AS product_2\nFROM order_items i1\nJOIN order_items i2 ON i1.order_id = i2.order_id AND i1.product_id < i2.product_id;\n```',
  ],
  sandboxCode: 'SELECT o.id, p.name, i.quantity\nFROM orders o\nJOIN order_items i ON i.order_id = o.id\nJOIN products p ON i.product_id = p.id;',
  sandboxSnippets: [
    snippet('Orders and products', 'SELECT o.id, p.name, i.quantity\nFROM orders o\nJOIN order_items i ON i.order_id = o.id\nJOIN products p ON i.product_id = p.id;'),
    snippet('Customers per product', 'SELECT p.name, COUNT(DISTINCT o.customer_id) AS customers\nFROM products p\nJOIN order_items i ON i.product_id = p.id\nJOIN orders o ON i.order_id = o.id\nGROUP BY p.id, p.name;'),
    snippet('Bought together', 'SELECT i1.order_id, i1.product_id AS product_1, i2.product_id AS product_2\nFROM order_items i1\nJOIN order_items i2 ON i1.order_id = i2.order_id AND i1.product_id < i2.product_id;'),
  ],
  readMore: { label: 'Wikipedia: associative entity (junction table)', url: 'https://en.wikipedia.org/wiki/Associative_entity', source: 'Wikipedia' },
  challenges: [
    query('easy', 'Inside order 5', {
      prompt: 'Show the product `name` and `quantity` of every line of order 5.',
      hint: "Join order_items to products, `WHERE i.order_id = 5`.",
      solution: 'SELECT p.name, i.quantity\nFROM order_items i\nJOIN products p ON i.product_id = p.id\nWHERE i.order_id = 5;',
    }),
    query('easy', 'Kitchen orders', {
      prompt: 'Show the id of each order containing a `kitchen` product, as `order_id`, once each, in order.',
      hint: "`SELECT DISTINCT i.order_id … WHERE p.category = 'kitchen' ORDER BY i.order_id`.",
      solution: "SELECT DISTINCT i.order_id\nFROM order_items i\nJOIN products p ON i.product_id = p.id\nWHERE p.category = 'kitchen'\nORDER BY i.order_id;",
    }),
    query('easy', 'Orders per product', {
      prompt: "Show each ordered product's `name` and the number of orders it appears in (`orders`).",
      hint: '`COUNT(DISTINCT i.order_id)`, grouped by product.',
      solution: 'SELECT p.name, COUNT(DISTINCT i.order_id) AS orders\nFROM products p\nJOIN order_items i ON i.product_id = p.id\nGROUP BY p.id, p.name;',
    }),
    query('medium', 'Electronics buyers', {
      prompt: "Show the `name` of every customer who bought an `electronics` product, once each, in name order.",
      hint: "customers → orders → order_items → products, `SELECT DISTINCT c.name … WHERE p.category = 'electronics' ORDER BY c.name`.",
      solution: "SELECT DISTINCT c.name\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nJOIN order_items i ON i.order_id = o.id\nJOIN products p ON i.product_id = p.id\nWHERE p.category = 'electronics'\nORDER BY c.name;",
    }),
    query('medium', 'Pairs in an order', {
      prompt: 'Show every pair of products in the same order: `order_id`, `product_1` and `product_2` (product ids, the smaller first). Sort by order id, then product_1, then product_2.',
      hint: '`FROM order_items i1 JOIN order_items i2 ON i1.order_id = i2.order_id AND i1.product_id < i2.product_id`.',
      solution: 'SELECT i1.order_id, i1.product_id AS product_1, i2.product_id AS product_2\nFROM order_items i1\nJOIN order_items i2 ON i1.order_id = i2.order_id AND i1.product_id < i2.product_id\nORDER BY i1.order_id, product_1, product_2;',
    }),
    query('medium', 'Customers per product', {
      prompt: "Show each ordered product's `name` and how many different customers bought it (`customers`). Most first, then by name.",
      hint: '`COUNT(DISTINCT o.customer_id) … ORDER BY customers DESC, p.name`.',
      solution: 'SELECT p.name, COUNT(DISTINCT o.customer_id) AS customers\nFROM products p\nJOIN order_items i ON i.product_id = p.id\nJOIN orders o ON i.order_id = o.id\nGROUP BY p.id, p.name\nORDER BY customers DESC, p.name;',
    }),
    query('hard', 'Bought together', {
      prompt: 'Show each pair of products bought in the same order, by name (`product_1`, `product_2`, where product_1 has the smaller id), and how many orders had both (`times`). Most first, then by product_1, then product_2.',
      hint: 'The pairs self-join, then join products twice (`p1`, `p2`), group by the two product ids and names.',
      solution: 'SELECT p1.name AS product_1, p2.name AS product_2, COUNT(*) AS times\nFROM order_items i1\nJOIN order_items i2 ON i1.order_id = i2.order_id AND i1.product_id < i2.product_id\nJOIN products p1 ON i1.product_id = p1.id\nJOIN products p2 ON i2.product_id = p2.id\nGROUP BY p1.id, p1.name, p2.id, p2.name\nORDER BY times DESC, product_1, product_2;',
    }),
    query('hard', 'Varied shoppers', {
      prompt: "Show each customer who bought from two or more categories: `name` and the number of categories (`categories`). Most first, then by name.",
      hint: '`COUNT(DISTINCT p.category)`, `HAVING COUNT(DISTINCT p.category) >= 2`.',
      solution: 'SELECT c.name, COUNT(DISTINCT p.category) AS categories\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nJOIN order_items i ON i.order_id = o.id\nJOIN products p ON i.product_id = p.id\nGROUP BY c.id, c.name\nHAVING COUNT(DISTINCT p.category) >= 2\nORDER BY categories DESC, c.name;',
    }),
    query('expert', 'With a Notebook', {
      prompt: "Show the `name` of every other product that was in an order with a `Notebook`, once each, in name order.",
      hint: "Self-join order_items on the order, with `i2.product_id <> i1.product_id`; join products for both sides, `WHERE p1.name = 'Notebook'`.",
      solution: "SELECT DISTINCT p2.name\nFROM order_items i1\nJOIN order_items i2 ON i1.order_id = i2.order_id AND i2.product_id <> i1.product_id\nJOIN products p1 ON i1.product_id = p1.id\nJOIN products p2 ON i2.product_id = p2.id\nWHERE p1.name = 'Notebook'\nORDER BY p2.name;",
    }),
    query('expert', 'Bought again', {
      prompt: "Show each customer and product where the customer bought that product in two or more different orders: the customer's name (`customer`), the product's name (`product`) and the number of orders (`orders`). In customer order, then product order.",
      hint: 'Join all four tables, group by customer and product, and keep `HAVING COUNT(DISTINCT o.id) >= 2`.',
      solution: 'SELECT c.name AS customer, p.name AS product, COUNT(DISTINCT o.id) AS orders\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nJOIN order_items i ON i.order_id = o.id\nJOIN products p ON i.product_id = p.id\nGROUP BY c.id, c.name, p.id, p.name\nHAVING COUNT(DISTINCT o.id) >= 2\nORDER BY customer, product;',
    }),
  ],
  questions: [
    mc('Customers and orders are…', ['Many-to-many', 'One-to-one', 'Not related', 'One-to-many'], 3,
      'A customer has many orders; each order has one customer.'),
    mc('Orders and products are…', ['One-to-many', 'Not related', 'One-to-one', 'Many-to-many'], 3,
      'An order has many products, and a product is in many orders.'),
    mc('How is a many-to-many relationship stored?', ['A junction table with one row per pair', 'It can\'t be stored', 'A list in one column', 'A foreign key in products'], 0,
      'order_items holds one row per order and product.'),
    mc('What else can a junction table hold?', ['The product\'s price', 'Facts about the pair, like the quantity', 'Nothing but the two keys', 'The customer\'s name'], 1,
      'The quantity belongs to the pair, not to the order or the product alone.'),
    qShort('What is a table like order_items called? (two words)', 'junction table',
      'Also called a link, bridge or associative table.'),
    mc('Why use `COUNT(DISTINCT o.customer_id)` for customers per product?', ['A customer may have bought the product more than once', 'COUNT(*) gives an error', 'To skip NULLs only', 'It sorts the result'], 0,
      'DISTINCT counts each customer once.'),
    mc('How do you find products bought together?', ['LEFT JOIN products', 'Join products to itself on price', 'GROUP BY product', 'Join order_items to itself on the order id'], 3,
      'Two lines of the same order are two products bought together.'),
    mc('Why `i1.product_id < i2.product_id` in the pairs query?', ['To find cheaper products', 'So each pair appears once and no product pairs with itself', 'It is required', 'To sort by price'], 1,
      'The same trick as in the self-join stage.'),
    mc('To go from orders to products you pass through…', ['customers', 'employees', 'nothing', 'order_items'], 3,
      'The junction table links the two.'),
    mc('If order 5 has 3 lines, how many pairs does the pairs query give for it?', ['3', '2', '6', '9'], 0,
      'A–B, A–C and B–C.'),
  ],
})
