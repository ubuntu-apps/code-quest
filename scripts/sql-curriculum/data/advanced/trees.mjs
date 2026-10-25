// Advanced queries: Walking trees with recursive WITH.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { ADVANCED_DB } from '../advanced-db.mjs'

const LEVELS = 'WITH RECURSIVE chart(id, name, level) AS (\n  SELECT id, name, 1 FROM staff WHERE manager_id IS NULL\n  UNION ALL\n  SELECT s.id, s.name, c.level + 1\n  FROM staff s\n  JOIN chart c ON s.manager_id = c.id\n)\nSELECT name, level FROM chart ORDER BY level, name;'
const PATHS = "WITH RECURSIVE tree(id, path) AS (\n  SELECT id, name FROM categories WHERE parent_id IS NULL\n  UNION ALL\n  SELECT c.id, t.path || ' > ' || c.name\n  FROM categories c\n  JOIN tree t ON c.parent_id = t.id\n)\nSELECT path FROM tree ORDER BY path;"

export default makeTopic({
  id: 'recursive_trees',
  title: 'Walking trees',
  database: ADVANCED_DB,
  paragraphs: [
    "Each staff member's `manager_id` points to another row of `staff`, and their manager has a manager too, up to the person at the top. Data like that is a **tree**. A join finds one step; a recursive CTE follows all of them.",
    '```\n' + LEVELS + '\n```',
    "The anchor is the top of the tree, the person with no manager, at level 1. The recursive part joins `staff` to the rows found so far: everyone whose manager is in `chart` is one level further down. It stops when a level finds nobody new.",
    "The same pattern builds paths. Carry text along and add to it at each step, and you get each category's full path:",
    '```\n' + PATHS + '\n```',
    'You can also start anywhere and walk up: anchor on one person, and join to the manager of the row found last (`JOIN staff m ON m.id = c.manager_id`).',
    "To ask about whole branches, such as everyone below each manager, make pairs: anchor every person as their own `top`, and keep the `top` while walking down. Then group by it.",
  ],
  sandboxCode: LEVELS,
  sandboxSnippets: [
    snippet('Staff levels', LEVELS),
    snippet('Category paths', PATHS),
    snippet('Walking up', 'WITH RECURSIVE up(id, name, manager_id, steps) AS (\n  SELECT id, name, manager_id, 0 FROM staff WHERE id = 7\n  UNION ALL\n  SELECT m.id, m.name, m.manager_id, u.steps + 1\n  FROM staff m\n  JOIN up u ON m.id = u.manager_id\n)\nSELECT name, steps FROM up ORDER BY steps;'),
  ],
  readMore: { label: 'SQLite: hierarchical query examples', url: 'https://www.sqlite.org/lang_with.html#hierarchical_query_examples', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Levels', {
      prompt: "Show each staff member's `name` and `level` (1 for the person at the top). Sort by level, then name.",
      hint: 'The lesson\'s first example.',
      solution: LEVELS,
    }),
    query('easy', 'Category depth', {
      prompt: "Show each category's `name` and `depth` (1 for a category with no parent). Sort by depth, then name.",
      hint: 'The same pattern on categories: anchor `WHERE parent_id IS NULL`, join `c.parent_id = t.id`.',
      solution: 'WITH RECURSIVE tree(id, name, depth) AS (\n  SELECT id, name, 1 FROM categories WHERE parent_id IS NULL\n  UNION ALL\n  SELECT c.id, c.name, t.depth + 1\n  FROM categories c\n  JOIN tree t ON c.parent_id = t.id\n)\nSELECT name, depth FROM tree ORDER BY depth, name;',
    }),
    query('easy', 'Below staff member 2', {
      prompt: "Show everyone below staff member 2 (directly or further down): `name` and `steps` (1 for those who report straight to them). Sort by steps, then name.",
      hint: 'Anchor on the people with `manager_id = 2`, at step 1.',
      solution: 'WITH RECURSIVE below(id, name, steps) AS (\n  SELECT id, name, 1 FROM staff WHERE manager_id = 2\n  UNION ALL\n  SELECT s.id, s.name, b.steps + 1\n  FROM staff s\n  JOIN below b ON s.manager_id = b.id\n)\nSELECT name, steps FROM below ORDER BY steps, name;',
    }),
    query('medium', 'Category paths', {
      prompt: "Show each category's full `path`, like `Plants > Outdoor plants > Shrubs`. Sort by path.",
      hint: "Carry the path: `t.path || ' > ' || c.name`.",
      solution: PATHS,
    }),
    query('medium', 'Chain of command', {
      prompt: "Start from the most recently hired staff member and walk up to the top: `name` and `steps` (0 for the new person, 1 for their manager, …). Sort by steps.",
      hint: 'Anchor `WHERE hired = (SELECT MAX(hired) FROM staff)`; join `m.id = u.manager_id`.',
      solution: 'WITH RECURSIVE up(id, name, manager_id, steps) AS (\n  SELECT id, name, manager_id, 0 FROM staff WHERE hired = (SELECT MAX(hired) FROM staff)\n  UNION ALL\n  SELECT m.id, m.name, m.manager_id, u.steps + 1\n  FROM staff m\n  JOIN up u ON m.id = u.manager_id\n)\nSELECT name, steps FROM up ORDER BY steps;',
    }),
    query('medium', 'Everything in category 1', {
      prompt: 'Show the `name` of every product in category 1 or in any category inside it, however deep. Sort by name.',
      hint: 'Walk down from category 1 to collect the category ids, then `WHERE category_id IN (SELECT id FROM tree)`.',
      solution: 'WITH RECURSIVE tree(id) AS (\n  SELECT 1\n  UNION ALL\n  SELECT c.id FROM categories c JOIN tree t ON c.parent_id = t.id\n)\nSELECT name FROM products\nWHERE category_id IN (SELECT id FROM tree)\nORDER BY name;',
    }),
    query('hard', 'Org chart', {
      prompt: "Show the staff in tree order: `name`, `level` and `path`, where the path is the names from the top down joined with `/` (like `Rosa Lindqvist/Tomas Ferreira`). Sort by path.",
      hint: "Carry both a level and a path; sorting by path puts each person under their manager.",
      solution: "WITH RECURSIVE chart(id, name, level, path) AS (\n  SELECT id, name, 1, name FROM staff WHERE manager_id IS NULL\n  UNION ALL\n  SELECT s.id, s.name, c.level + 1, c.path || '/' || s.name\n  FROM staff s\n  JOIN chart c ON s.manager_id = c.id\n)\nSELECT name, level, path FROM chart ORDER BY path;",
    }),
    query('hard', 'Team sizes', {
      prompt: "For every staff member, show `name` and how many people are below them, directly or further down (`below`, 0 for those with nobody). Sort by below (most first), then name.",
      hint: 'Pairs: anchor `SELECT id AS top, id FROM staff`; walk down keeping `top`. Every pair except (top, top) is someone below. Count per top, from staff with a LEFT JOIN.',
      solution: 'WITH RECURSIVE pairs(top, id) AS (\n  SELECT id, id FROM staff\n  UNION ALL\n  SELECT p.top, s.id\n  FROM staff s\n  JOIN pairs p ON s.manager_id = p.id\n)\nSELECT st.name, COUNT(p.id) AS below\nFROM staff st\nLEFT JOIN pairs p ON p.top = st.id AND p.id <> st.id\nGROUP BY st.id, st.name\nORDER BY below DESC, st.name;',
    }),
    query('expert', 'Team sales', {
      prompt: "For each staff member with someone below them, show `name` and the items sold by them and everyone below them together (`team_items`). Sort by team_items (most first), then name.",
      hint: 'Use the pairs from Team sizes (including each person with themselves), join sales on `s.staff_id = p.id`, and group by top. Keep only those who have someone below.',
      solution: 'WITH RECURSIVE pairs(top, id) AS (\n  SELECT id, id FROM staff\n  UNION ALL\n  SELECT p.top, s.id\n  FROM staff s\n  JOIN pairs p ON s.manager_id = p.id\n)\nSELECT st.name, SUM(sa.quantity) AS team_items\nFROM pairs p\nJOIN staff st ON st.id = p.top\nJOIN sales sa ON sa.staff_id = p.id\nWHERE p.top IN (SELECT manager_id FROM staff WHERE manager_id IS NOT NULL)\nGROUP BY st.id, st.name\nORDER BY team_items DESC, st.name;',
    }),
    query('expert', 'Rolled-up takings', {
      prompt: "For every category, show `category` (its name) and the takings of all products in it or in any category inside it (`takings`, 2 decimals, 0 when none). Sort by category.",
      hint: 'Pairs again, on categories: (top, id). Join products on `pr.category_id = p.id`, LEFT JOIN sales, and sum quantity times price per top. COALESCE to 0.',
      solution: 'WITH RECURSIVE pairs(top, id) AS (\n  SELECT id, id FROM categories\n  UNION ALL\n  SELECT p.top, c.id\n  FROM categories c\n  JOIN pairs p ON c.parent_id = p.id\n)\nSELECT c.name AS category,\n       ROUND(COALESCE(SUM(s.quantity * pr.price), 0), 2) AS takings\nFROM categories c\nJOIN pairs p ON p.top = c.id\nLEFT JOIN products pr ON pr.category_id = p.id\nLEFT JOIN sales s ON s.product_id = pr.id\nGROUP BY c.id, c.name\nORDER BY category;',
    }),
  ],
  questions: [
    mc('What makes `staff` a tree?', ['It has a role column', 'Each row points to its manager in the same table', 'It has an id', 'It is sorted'], 1,
      'manager_id refers to another staff row.'),
    mc('In the levels query, what is the anchor?', ['The person with no manager, at level 1', 'The trainees', 'The last level', 'Everyone'], 0,
      'The walk starts at the top.'),
    mc('What does the recursive part join on to go down one level?', ['c.level = 1', 's.id = c.manager_id', 's.name = c.name', 's.manager_id = c.id'], 3,
      'People whose manager has just been found.'),
    mc('Which join walks up, from a person to their manager?', ['s.manager_id = c.id', 's.id = c.id', 'c.level + 1', 'm.id = u.manager_id'], 3,
      'The next row is the manager of the row found last.'),
    qShort('Which operator joins pieces of text, as in building a path?', '||',
      "`t.path || ' > ' || c.name`."),
    mc('Why does sorting by the path give tree order?', ['It doesn\'t', 'Each path starts with its manager\'s path, so people sort right after their manager', 'Paths are numbers', 'ORDER BY path sorts by level'], 1,
      'Text sorts letter by letter, so a path sorts just after its beginning.'),
    mc('How do you count everyone below each person?', ['MAX(level)', 'COUNT(manager_id)', 'Make (top, id) pairs by anchoring every person and walking down; count per top', 'GROUP BY level'], 2,
      'Each person is the top of their own branch.'),
    mc('When does a tree walk stop?', ['After 3 levels', 'At the first trainee', 'When a level finds no new rows', 'Never'], 2,
      'The leaves have nobody below them.'),
    mc('What would happen if a manager_id loop existed (A manages B, B manages A)?', ['The walk would go round for ever with UNION ALL', 'Nothing', 'An error', 'The rows are skipped'], 0,
      'Real trees have no loops; UNION instead of UNION ALL stops repeats of identical rows.'),
    mc('How do you find every product inside category 1, however deep?', ['GROUP BY category_id', 'Walk down the category tree from 1, then IN (SELECT id FROM tree)', 'WHERE category_id = 1', 'WHERE parent_id = 1'], 1,
      'The tree gives all the category ids.'),
  ],
})
