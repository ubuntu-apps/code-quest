// Designing tables: ALTER TABLE and DROP TABLE.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { CHECK, DESIGN_DB } from '../design-db.mjs'

const { columns, rows, tables, tryIt } = CHECK

export default makeTopic({
  id: 'alter_drop',
  title: 'Changing and removing tables',
  database: DESIGN_DB,
  paragraphs: [
    "Tables change as needs change. `ALTER TABLE` changes an existing table, keeping its rows. SQLite can do four things with it:",
    "```\nALTER TABLE contacts ADD COLUMN email TEXT;\nALTER TABLE contacts RENAME COLUMN phone TO mobile;\nALTER TABLE contacts DROP COLUMN notes;\nALTER TABLE contacts RENAME TO people;\n```",
    "A new column is added at the end, and existing rows get its default (or `NULL`). That is why `ADD COLUMN … NOT NULL` needs a `DEFAULT`: otherwise the rows already there would break the rule straight away, and SQLite says **Cannot add a NOT NULL column with default value NULL**.",
    '`DROP TABLE` deletes a whole table, rows and all. There is no undo, so be sure. `DROP TABLE IF EXISTS` does nothing if the table is already gone.',
    "SQLite's `ALTER TABLE` can't add a `CHECK`, `UNIQUE` or foreign key to an existing table, or change a column's type. For those, rebuild the table: create the new version under another name, copy the rows across, drop the old table, and rename the new one. Do it in a transaction, so a mistake leaves the old table as it was.",
    "```\nBEGIN;\nCREATE TABLE rooms_new (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL,\n  seats INTEGER CHECK (seats > 0)\n);\nINSERT INTO rooms_new (id, name, seats) SELECT id, name, seats FROM rooms;\nDROP TABLE rooms;\nALTER TABLE rooms_new RENAME TO rooms;\nCOMMIT;\n```",
  ],
  sandboxCode: "ALTER TABLE contacts ADD COLUMN email TEXT;\nSELECT * FROM contacts;",
  sandboxSnippets: [
    snippet('Add a column', 'ALTER TABLE contacts ADD COLUMN email TEXT;\nSELECT * FROM contacts;'),
    snippet('Rename a column', 'ALTER TABLE contacts RENAME COLUMN phone TO mobile;\nSELECT * FROM contacts;'),
    snippet('Drop a column', 'ALTER TABLE contacts DROP COLUMN notes;\nSELECT * FROM contacts;'),
    snippet('NOT NULL needs a default', '-- This gives an error: existing rows would have NULL\nALTER TABLE contacts ADD COLUMN email TEXT NOT NULL;'),
  ],
  readMore: { label: 'SQLite: ALTER TABLE', url: 'https://www.sqlite.org/lang_altertable.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'An email column', {
      prompt: 'Add an `email` column (TEXT) to `contacts`.',
      hint: '`ALTER TABLE table ADD COLUMN name TYPE;`',
      solution: 'ALTER TABLE contacts ADD COLUMN email TEXT;',
      checks: [columns('contacts')],
    }),
    query('easy', 'Mobile, not phone', {
      prompt: 'Rename the `phone` column of `contacts` to `mobile`.',
      hint: '`ALTER TABLE … RENAME COLUMN old TO new;`',
      solution: 'ALTER TABLE contacts RENAME COLUMN phone TO mobile;',
      checks: [columns('contacts'), rows('contacts', 'id')],
    }),
    query('easy', 'No longer needed', {
      prompt: 'Delete the whole `contacts` table.',
      hint: '`DROP TABLE` removes a table with all its rows.',
      solution: 'DROP TABLE contacts;',
      checks: [tables],
    }),
    query('medium', 'Accessible rooms', {
      prompt: 'Add a column `accessible` (INTEGER, NOT NULL, default 1) to `rooms`.',
      hint: 'A NOT NULL column needs a DEFAULT when the table already has rows.',
      solution: 'ALTER TABLE rooms ADD COLUMN accessible INTEGER NOT NULL DEFAULT 1;',
      checks: [columns('rooms'), rows('rooms', 'id')],
    }),
    query('medium', 'People, not contacts', {
      prompt: 'Rename the table `contacts` to `people`.',
      hint: '`ALTER TABLE old RENAME TO new;`',
      solution: 'ALTER TABLE contacts RENAME TO people;',
      checks: [tables, rows('people', 'id')],
    }),
    query('medium', 'No more notes', {
      prompt: 'Remove the `notes` column from `contacts`.',
      hint: '`ALTER TABLE … DROP COLUMN …;`',
      solution: 'ALTER TABLE contacts DROP COLUMN notes;',
      checks: [columns('contacts'), rows('contacts', 'id')],
    }),
    query('hard', 'Fix the new column', {
      prompt: "This should add a required `email` column to `contacts`, but gives **Cannot add a NOT NULL column with default value NULL**. Give it the default `''` so it works.",
      starter: 'ALTER TABLE contacts ADD COLUMN email TEXT NOT NULL;',
      hint: "`… TEXT NOT NULL DEFAULT ''`.",
      solution: "ALTER TABLE contacts ADD COLUMN email TEXT NOT NULL DEFAULT '';",
      checks: [columns('contacts'), rows('contacts', 'id')],
    }),
    query('hard', 'Tidy up', {
      prompt: "Drop the tables `old_contacts` and `contacts`, without an error for the one that doesn't exist.",
      hint: '`DROP TABLE IF EXISTS …;` for each.',
      solution: 'DROP TABLE IF EXISTS old_contacts;\nDROP TABLE IF EXISTS contacts;',
      checks: [tables],
    }),
    query('expert', 'Size bands', {
      prompt: "Add a `size` column (TEXT) to `rooms` and fill it: `large` for 100 seats or more, `medium` for 50 or more, `small` otherwise.",
      hint: "`ALTER TABLE rooms ADD COLUMN size TEXT;` then an UPDATE with CASE.",
      solution: "ALTER TABLE rooms ADD COLUMN size TEXT;\nUPDATE rooms SET size = CASE\n  WHEN seats >= 100 THEN 'large'\n  WHEN seats >= 50 THEN 'medium'\n  ELSE 'small'\nEND;",
      checks: [columns('rooms'), rows('rooms', 'id')],
    }),
    query('expert', 'Rebuild with a rule', {
      prompt: "Rebuild `rooms` so that `seats` must be more than 0: in a transaction, create `rooms_new` (`id` INTEGER PRIMARY KEY, `name` TEXT NOT NULL, `seats` INTEGER with that CHECK), copy the rows, drop `rooms` and rename `rooms_new` to `rooms`.",
      hint: 'BEGIN; CREATE TABLE rooms_new …; INSERT INTO rooms_new SELECT …; DROP TABLE rooms; ALTER TABLE rooms_new RENAME TO rooms; COMMIT;',
      solution: 'BEGIN;\nCREATE TABLE rooms_new (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL,\n  seats INTEGER CHECK (seats > 0)\n);\nINSERT INTO rooms_new (id, name, seats) SELECT id, name, seats FROM rooms;\nDROP TABLE rooms;\nALTER TABLE rooms_new RENAME TO rooms;\nCOMMIT;',
      checks: [tables, columns('rooms'), rows('rooms', 'id'), tryIt('A room with 0 seats is refused', "INSERT INTO rooms (name, seats) VALUES ('Cupboard', 0)")],
    }),
  ],
  questions: [
    mc('What does ALTER TABLE keep?', ['Only the first column', 'The rows already in the table', 'Nothing', 'Only the primary key'], 1,
      'It changes the table\'s structure without losing its data.'),
    mc('Where does `ADD COLUMN` put the new column?', ['At the end', 'In name order', 'Wherever there is space', 'First'], 0,
      'Existing rows get its default, or NULL.'),
    mc('Why does `ADD COLUMN email TEXT NOT NULL` fail on a table with rows?', ['email is a keyword', 'The existing rows would have NULL in it', 'ALTER can\'t add columns', 'TEXT can\'t be NOT NULL'], 1,
      'Give it a DEFAULT.'),
    mc('What does `DROP TABLE contacts;` remove?', ['Only the indexes', 'The whole table and its rows', 'Only the rows', 'Only the columns'], 1,
      'There is no undo.'),
    qShort('Which two words rename a table, as in `ALTER TABLE a ___ ___ b`? (two words)', 'RENAME TO',
      '`ALTER TABLE contacts RENAME TO people;`'),
    mc('How do you add a CHECK to an existing SQLite table?', ['ALTER COLUMN', 'It is added automatically', 'Rebuild it: create a new table, copy, drop, rename', 'ALTER TABLE ADD CHECK'], 2,
      "SQLite's ALTER TABLE can't add constraints."),
    mc('Why rebuild a table inside a transaction?', ['DROP needs it', 'RENAME needs it', 'It is faster', 'So a mistake leaves the old table as it was'], 3,
      'Rolling back restores everything.'),
    mc('What does `DROP TABLE IF EXISTS old_contacts;` do if the table is not there?', ['Drops every table', 'Creates it', 'Gives an error', 'Nothing'], 3,
      'IF EXISTS skips it quietly.'),
    mc('Which renames a column?', ['`UPDATE t SET a = b`', '`ALTER TABLE t RENAME COLUMN a TO b`', '`ALTER TABLE t CHANGE a b`', '`RENAME a TO b`'], 1,
      'Supported since SQLite 3.25.'),
    mc('After `ALTER TABLE rooms ADD COLUMN size TEXT`, what is `size` in the existing rows?', ['NULL', "''", '0', 'An error'], 0,
      'Fill it with an UPDATE afterwards.'),
  ],
})
