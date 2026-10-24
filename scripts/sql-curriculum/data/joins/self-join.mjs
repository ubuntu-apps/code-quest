// Joining tables: Self-joins.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { JOINS_DB } from '../joins-db.mjs'

export default makeTopic({
  id: 'self_join',
  title: 'Joining a table to itself',
  database: JOINS_DB,
  paragraphs: [
    "In `employees`, `manager_id` holds the `id` of another employee. To show each employee next to their manager's name, join the table to **itself**, with two different aliases:",
    '```\nSELECT e.name AS employee, m.name AS manager\nFROM employees e\nJOIN employees m ON e.manager_id = m.id;\n```',
    'Think of `e` and `m` as two copies of the same table: `e` plays the employee, `m` plays the manager. The aliases are required here, because both copies have the same name.',
    "Maria Lopez has no manager, so the inner join drops her. Use `LEFT JOIN` to keep her, with `NULL` (or a `COALESCE` text) as her manager.",
    'Grouping by the manager copy counts the size of each team:',
    '```\nSELECT m.name AS manager, COUNT(*) AS reports\nFROM employees e\nJOIN employees m ON e.manager_id = m.id\nGROUP BY m.id, m.name;\n```',
    "Self-joins aren't only for managers. Any time you want to pair rows of a table with other rows of the same table, such as products in the same category, join it to itself. Add `a.id < b.id` to the `ON` so each pair appears once, and a row isn't paired with itself.",
    '```\nSELECT a.name AS product_1, b.name AS product_2\nFROM products a\nJOIN products b ON a.category = b.category AND a.id < b.id;\n```',
  ],
  sandboxCode: 'SELECT e.name AS employee, m.name AS manager\nFROM employees e\nJOIN employees m ON e.manager_id = m.id;',
  sandboxSnippets: [
    snippet('Employee and manager', 'SELECT e.name AS employee, m.name AS manager\nFROM employees e\nJOIN employees m ON e.manager_id = m.id;'),
    snippet('Keep the boss', 'SELECT e.name AS employee, m.name AS manager\nFROM employees e\nLEFT JOIN employees m ON e.manager_id = m.id;'),
    snippet('Team sizes', 'SELECT m.name AS manager, COUNT(*) AS reports\nFROM employees e\nJOIN employees m ON e.manager_id = m.id\nGROUP BY m.id, m.name;'),
    snippet('Pairs', 'SELECT a.name AS product_1, b.name AS product_2\nFROM products a\nJOIN products b ON a.category = b.category AND a.id < b.id;'),
  ],
  readMore: { label: 'SQLite: the SELECT statement', url: 'https://www.sqlite.org/lang_select.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Employee and manager', {
      prompt: "Show each employee's name as `employee` and their manager's name as `manager`. Employees with no manager can be left out.",
      hint: '`FROM employees e JOIN employees m ON e.manager_id = m.id`.',
      solution: 'SELECT e.name AS employee, m.name AS manager\nFROM employees e\nJOIN employees m ON e.manager_id = m.id;',
    }),
    query('easy', "The manager's team", {
      prompt: "Show the `name` of each employee whose manager has the role `Manager`.",
      hint: "Join employees to their managers, then `WHERE m.role = 'Manager'`.",
      solution: "SELECT e.name\nFROM employees e\nJOIN employees m ON e.manager_id = m.id\nWHERE m.role = 'Manager';",
    }),
    query('easy', 'Keep the boss', {
      prompt: "Show every employee as `employee` with their manager's name as `manager` (NULL for the employee with no manager).",
      hint: '`LEFT JOIN employees m ON e.manager_id = m.id`.',
      solution: 'SELECT e.name AS employee, m.name AS manager\nFROM employees e\nLEFT JOIN employees m ON e.manager_id = m.id;',
    }),
    query('medium', 'Team sizes', {
      prompt: "Show each manager's name as `manager` and how many employees report to them (`reports`). Most first, then by name.",
      hint: '`GROUP BY m.id, m.name ORDER BY reports DESC, m.name`.',
      solution: 'SELECT m.name AS manager, COUNT(*) AS reports\nFROM employees e\nJOIN employees m ON e.manager_id = m.id\nGROUP BY m.id, m.name\nORDER BY reports DESC, m.name;',
    }),
    query('medium', 'Nobody above', {
      prompt: "Show every employee as `employee` with their manager's name as `manager`, or the text `(none)` if they have no manager.",
      hint: "`LEFT JOIN`, and `COALESCE(m.name, '(none)') AS manager`.",
      solution: "SELECT e.name AS employee, COALESCE(m.name, '(none)') AS manager\nFROM employees e\nLEFT JOIN employees m ON e.manager_id = m.id;",
    }),
    query('medium', 'Roles up the line', {
      prompt: "Show each employee's `name` and `role`, with their manager's role as `manager_role`. Employees with no manager can be left out.",
      hint: '`e.name, e.role, m.role AS manager_role`.',
      solution: 'SELECT e.name, e.role, m.role AS manager_role\nFROM employees e\nJOIN employees m ON e.manager_id = m.id;',
    }),
    query('hard', "Manager's manager", {
      prompt: "Show each employee as `employee`, their manager as `manager`, and their manager's manager as `grand_manager`. Only employees who have all three.",
      hint: 'Join employees three times: `JOIN employees m ON e.manager_id = m.id JOIN employees g ON m.manager_id = g.id`.',
      solution: 'SELECT e.name AS employee, m.name AS manager, g.name AS grand_manager\nFROM employees e\nJOIN employees m ON e.manager_id = m.id\nJOIN employees g ON m.manager_id = g.id;',
    }),
    query('hard', 'Teammates', {
      prompt: 'Show each pair of employees who have the same manager, as `employee_1` and `employee_2`, once per pair. Sort by the ids of the first and then the second employee.',
      hint: '`JOIN employees b ON a.manager_id = b.manager_id AND a.id < b.id … ORDER BY a.id, b.id`.',
      solution: 'SELECT a.name AS employee_1, b.name AS employee_2\nFROM employees a\nJOIN employees b ON a.manager_id = b.manager_id AND a.id < b.id\nORDER BY a.id, b.id;',
    }),
    query('expert', 'Team orders', {
      prompt: "For each manager, show their name as `manager` and the number of orders handled by the people who report to them (`team_orders`). Most first.",
      hint: 'Join employees to their managers, then join orders on `o.employee_id = e.id`, and group by the manager.',
      solution: 'SELECT m.name AS manager, COUNT(*) AS team_orders\nFROM employees e\nJOIN employees m ON e.manager_id = m.id\nJOIN orders o ON o.employee_id = e.id\nGROUP BY m.id, m.name\nORDER BY team_orders DESC;',
    }),
    query('expert', 'Same category', {
      prompt: 'Show each pair of products in the same category, as `product_1`, `product_2` and `category`, once per pair. Sort by category, then product_1, then product_2.',
      hint: '`FROM products a JOIN products b ON a.category = b.category AND a.id < b.id`.',
      solution: 'SELECT a.name AS product_1, b.name AS product_2, a.category\nFROM products a\nJOIN products b ON a.category = b.category AND a.id < b.id\nORDER BY a.category, product_1, product_2;',
    }),
  ],
  questions: [
    mc('What is a self-join?', ['Joining a table to a copy saved on disk', 'Joining a table to itself, using two aliases', 'A join with no ON', 'A join that removes duplicates'], 1,
      'The two aliases act like two copies of the table.'),
    mc('Why are aliases required in a self-join?', ['They aren\'t', 'They are faster', 'Both copies have the same table name, so SQLite needs a way to tell them apart', 'SQLite needs short names'], 2,
      'Without aliases, employees.name would be ambiguous.'),
    mc('Which ON pairs an employee with their manager?', ['`ON e.manager_id = m.manager_id`', '`ON e.manager_id = m.id`', '`ON m.manager_id = e.id`', '`ON e.id = m.id`'], 1,
      "The employee's manager_id holds the manager's id."),
    mc('Why does Maria Lopez vanish from the inner self-join?', ['Her name is NULL', 'She is the only manager', 'Her manager_id is NULL, so she has no match', 'She has no orders'], 2,
      'Use LEFT JOIN to keep her.'),
    qShort('Which kind of join keeps the employee with no manager? (one word, before JOIN)', 'LEFT',
      'LEFT JOIN keeps every row of the first copy.'),
    mc('Why add `a.id < b.id` when pairing rows?', ['It is required by SQLite', 'It removes NULLs', 'Each pair appears once and no row pairs with itself', 'It sorts the result'], 2,
      'Without it you get A–B, B–A and A–A.'),
    mc('To count team sizes, group by…', ['The employee copy', 'The manager copy', 'The role', 'Nothing'], 1,
      'Each manager gets one group, with one row per report.'),
    mc('How many times is employees joined to find the manager\'s manager?', ['Twice (three copies in total)', 'Four times', 'Once', 'Never'], 0,
      'e → m → g.'),
    mc('Can a self-join pair products in the same category?', ['Only with LEFT JOIN', 'Yes', 'No, only for hierarchies', 'Only with GROUP BY'], 1,
      'Any time rows pair with rows of the same table.'),
    mc("What does `COALESCE(m.name, '(none)')` show for the top boss?", ['NULL', 'Her own name', 'An empty string', '(none)'], 3,
      'Her manager name is NULL, so COALESCE uses the text.'),
  ],
})
