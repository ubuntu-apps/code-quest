// Changing data: the section's projects (easy, medium, hard).
import { makeProject, mc, qShort, query, snippet } from './_builders.mjs'
import { AFTER, MODIFYING_DB } from './modifying-db.mjs'

const frontDesk = makeProject('easy', {
  id: 'proj_front_desk',
  title: 'Front desk day',
  database: MODIFYING_DB,
  paragraphs: [
    "You're on the library's front desk today, 2026-10-24. People come in to join, borrow, return, renew and pay. Each challenge is one visitor; get the data right for each.",
    'Anything that changes two tables goes in a transaction. A book that goes out lowers `available`; a book that comes back raises it.',
  ],
  sandboxCode: 'SELECT * FROM loans WHERE returned IS NULL;',
  sandboxSnippets: [
    snippet('Loans still out', 'SELECT * FROM loans WHERE returned IS NULL;'),
    snippet('Books on the shelf', 'SELECT id, title, copies, available FROM books;'),
  ],
  readMore: { label: 'SQLite: transactions', url: 'https://www.sqlite.org/lang_transaction.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Joining', {
      prompt: "`Hana Sato` (`hana.sato@example.com`) joins today. Add her and return her `id` so you can write it on her card.",
      hint: "`INSERT INTO members (name, email, joined) VALUES (…) RETURNING id;`",
      solution: "INSERT INTO members (name, email, joined)\nVALUES ('Hana Sato', 'hana.sato@example.com', '2026-10-24')\nRETURNING id;",
      checks: [AFTER.members],
    }),
    query('easy', 'Borrowing', {
      prompt: "Member 2 borrows book 7, due back on `2026-11-07`. In one transaction, add the loan and lower book 7's `available`.",
      hint: 'BEGIN; INSERT INTO loans …; UPDATE books …; COMMIT;',
      solution: "BEGIN;\nINSERT INTO loans (member_id, book_id, borrowed, due)\nVALUES (2, 7, '2026-10-24', '2026-11-07');\nUPDATE books SET available = available - 1 WHERE id = 7;\nCOMMIT;",
      checks: [AFTER.loans, AFTER.books],
    }),
    query('medium', 'Returning', {
      prompt: "Loan 3 comes back. In one transaction, raise the `available` of its book (found from the loan) and mark the loan returned today.",
      hint: 'Update books `WHERE id = (SELECT book_id FROM loans WHERE id = 3)` first, then the loan.',
      solution: "BEGIN;\nUPDATE books SET available = available + 1\nWHERE id = (SELECT book_id FROM loans WHERE id = 3);\nUPDATE loans SET returned = '2026-10-24' WHERE id = 3;\nCOMMIT;",
      checks: [AFTER.books, AFTER.loans],
    }),
    query('medium', 'Renewing', {
      prompt: "The borrower of loan 8 renews it: if it is still out, its new due date is 14 days from today.",
      hint: "`date('2026-10-24', '+14 days')` gives the new due date. Only change the loan if `returned IS NULL`.",
      solution: "UPDATE loans\nSET due = date('2026-10-24', '+14 days')\nWHERE id = 8 AND returned IS NULL;",
      checks: [AFTER.loans],
    }),
    query('hard', 'Paying up', {
      prompt: "Member 6 pays `3.0`. In one transaction, take it off their fine and delete their fine row if nothing is left to pay.",
      hint: 'UPDATE fines … WHERE member_id = 6; DELETE FROM fines WHERE member_id = 6 AND amount <= 0;',
      solution: 'BEGIN;\nUPDATE fines SET amount = amount - 3.0 WHERE member_id = 6;\nDELETE FROM fines WHERE member_id = 6 AND amount <= 0;\nCOMMIT;',
      checks: [AFTER.fines],
    }),
    query('hard', 'Reminders', {
      prompt: "At closing time, set the status of every member with an overdue loan (still out, due before today) to `reminded`, and return their `id` and `name` for the reminder letters.",
      hint: "`UPDATE members SET status = 'reminded' WHERE id IN (…overdue member ids…) RETURNING id, name;`",
      solution: "UPDATE members\nSET status = 'reminded'\nWHERE id IN (\n  SELECT member_id FROM loans\n  WHERE returned IS NULL AND due < '2026-10-24'\n)\nRETURNING id, name;",
      checks: [AFTER.members],
    }),
  ],
  questions: [
    mc('Which gives a new member\'s id straight away?', ['`RETURNING id`', '`SELECT COUNT(*)`', '`LIMIT 1`', '`ORDER BY id`'], 0,
      'RETURNING shows the inserted row.'),
    mc('Why lend a book in a transaction?', ['To get the id', 'It is faster', 'The new loan and the lower available count must happen together', 'INSERT needs it'], 2,
      'Either both changes are kept or neither.'),
    mc('When a book comes back, what happens to `available`?', ['Nothing', 'It goes down by 1', 'It is set to 0', 'It goes up by 1'], 3,
      'One more copy is on the shelf.'),
    qShort('Which function moves a date, as in `___(\'2026-10-24\', \'+14 days\')`?', 'date',
      'date() with a modifier.'),
    mc('Why `AND returned IS NULL` when renewing?', ['To change every loan', 'So a loan that was already returned isn\'t changed', 'It is required by UPDATE', 'To sort'], 1,
      'Only loans still out can be renewed.'),
    mc('After paying 3.0 of a 3.0 fine, what happens to the row?', ['It is deleted, because the amount is now 0', 'It stays at 3.0', 'It becomes NULL', 'It goes negative and stays'], 0,
      'The DELETE removes rows with nothing left to pay.'),
  ],
})

const stockTake = makeProject('medium', {
  id: 'proj_stock_take',
  title: 'Stock take',
  database: MODIFYING_DB,
  paragraphs: [
    "Once a year the library counts its books. Some numbers in `books` are wrong, new copies have arrived, one book was lost and some books nobody borrows any more.",
    'A book\'s `available` should always be its `copies` minus its loans still out.',
  ],
  sandboxCode: 'SELECT b.id, b.title, b.copies, b.available,\n  (SELECT COUNT(*) FROM loans l WHERE l.book_id = b.id AND l.returned IS NULL) AS out\nFROM books b;',
  sandboxSnippets: [
    snippet('Check the numbers', 'SELECT b.id, b.title, b.copies, b.available,\n  (SELECT COUNT(*) FROM loans l WHERE l.book_id = b.id AND l.returned IS NULL) AS out\nFROM books b;'),
    snippet('Arrivals', 'SELECT * FROM arrivals;'),
  ],
  readMore: { label: 'SQLite: UPDATE', url: 'https://www.sqlite.org/lang_update.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Recount', {
      prompt: "Set every book's `available` to its copies minus its loans still out.",
      hint: '`SET available = copies - (SELECT COUNT(*) FROM loans WHERE loans.book_id = books.id AND loans.returned IS NULL)`.',
      solution: 'UPDATE books\nSET available = copies - (\n  SELECT COUNT(*) FROM loans\n  WHERE loans.book_id = books.id AND loans.returned IS NULL\n);',
      checks: [AFTER.books],
    }),
    query('medium', 'The wrong way round', {
      prompt: "A book with more copies available than it owns must have its two numbers swapped. Swap `copies` and `available` for every such book.",
      hint: '`SET copies = available, available = copies WHERE available > copies`.',
      solution: 'UPDATE books\nSET copies = available, available = copies\nWHERE available > copies;',
      checks: [AFTER.books],
    }),
    query('medium', 'Unpack the arrivals', {
      prompt: "In one transaction: add the arriving copies to books already on the shelf (same title), insert the other arrivals as new books (1 copy when the number is missing, all available), then empty `arrivals`.",
      hint: 'UPDATE books … FROM arrivals …; INSERT INTO books … SELECT … WHERE title NOT IN (SELECT title FROM books); DELETE FROM arrivals;',
      solution: 'BEGIN;\nUPDATE books\nSET copies = books.copies + a.copies,\n    available = books.available + a.copies\nFROM arrivals AS a\nWHERE a.title = books.title;\nINSERT INTO books (title, author, copies, available)\nSELECT title, author, COALESCE(copies, 1), COALESCE(copies, 1)\nFROM arrivals\nWHERE title NOT IN (SELECT title FROM books);\nDELETE FROM arrivals;\nCOMMIT;',
      checks: [AFTER.books, AFTER.arrivals],
    }),
    query('medium', 'Lost', {
      prompt: "Member 1 lost book 5 (loan 4). In one transaction: mark loan 4 returned today, take one copy off book 5 (its `available` stays as it is), and add a `10.0` replacement charge to member 1's fine, creating the row if needed.",
      hint: 'UPDATE loans …; UPDATE books SET copies = copies - 1 WHERE id = 5; an upsert into fines.',
      solution: "BEGIN;\nUPDATE loans SET returned = '2026-10-24' WHERE id = 4;\nUPDATE books SET copies = copies - 1 WHERE id = 5;\nINSERT INTO fines (member_id, amount)\nVALUES (1, 10.0)\nON CONFLICT (member_id) DO UPDATE\nSET amount = amount + excluded.amount;\nCOMMIT;",
      checks: [AFTER.loans, AFTER.books, AFTER.fines],
    }),
    query('hard', 'Gathering dust', {
      prompt: "Withdraw the books that have no loan borrowed on or after `2026-09-01` and none still out. In one transaction, delete their loans, then the books.",
      hint: "Pick them with `NOT EXISTS (SELECT 1 FROM loans WHERE loans.book_id = books.id AND (borrowed >= '2026-09-01' OR returned IS NULL))`. Delete the loans whose book_id is one of those books first; then the books with no loans left can go.",
      solution: "BEGIN;\nDELETE FROM loans\nWHERE book_id IN (\n  SELECT id FROM books\n  WHERE NOT EXISTS (\n    SELECT 1 FROM loans l\n    WHERE l.book_id = books.id AND (l.borrowed >= '2026-09-01' OR l.returned IS NULL)\n  )\n);\nDELETE FROM books\nWHERE NOT EXISTS (SELECT 1 FROM loans l WHERE l.book_id = books.id);\nCOMMIT;",
      checks: [AFTER.loans, AFTER.books],
    }),
    query('hard', 'More copies of the popular ones', {
      prompt: "In one transaction: recount `available` for every book, then give each book with no copies available one more copy (raise `copies` and `available` by 1), returning the `id`, `title`, `copies` and `available` of those books. Then commit.",
      hint: 'The recount UPDATE, then `UPDATE books SET copies = copies + 1, available = available + 1 WHERE available = 0 RETURNING id, title, copies, available;`, then COMMIT.',
      solution: 'BEGIN;\nUPDATE books\nSET available = copies - (\n  SELECT COUNT(*) FROM loans\n  WHERE loans.book_id = books.id AND loans.returned IS NULL\n);\nUPDATE books\nSET copies = copies + 1, available = available + 1\nWHERE available = 0\nRETURNING id, title, copies, available;\nCOMMIT;',
      checks: [AFTER.books],
    }),
  ],
  questions: [
    mc('What should `available` always be?', ['copies plus loans', 'copies minus the loans still out', 'copies', 'The number of loans'], 1,
      'Every copy is either on the shelf or out on loan.'),
    mc('Does `SET copies = available, available = copies` really swap them?', ['Only in a transaction', 'Only with WHERE', 'No, both end up the same', 'Yes: both assignments use the old values'], 3,
      'SET reads all the old values before changing anything.'),
    mc('When unpacking arrivals, why update the existing books before inserting the new ones?', ['Otherwise the new rows would also match the title and get the copies twice', 'INSERT can\'t use arrivals', 'UPDATE must come first', 'It is faster'], 0,
      'After the INSERT, every arrival\'s title would be in books.'),
    mc('Why does a lost book lower `copies` but not `available`?', ['copies can\'t change', 'The lost copy was out on loan, so it was never counted as available', 'available is never changed', 'It is a mistake'], 1,
      'The shelf has the same number of copies as before.'),
    qShort('Which keyword, at the end of an UPDATE, shows the changed rows?', 'RETURNING',
      '`… RETURNING id, title;`'),
    mc('Why delete the loans before the books when withdrawing books?', ['DELETE order never matters', 'books are protected', 'To sort them', 'So no loans are left pointing to missing books'], 3,
      'Children first, then the rows they point to.'),
  ],
})

const cleanUp = makeProject('hard', {
  id: 'proj_data_clean_up',
  title: 'Data clean-up',
  database: MODIFYING_DB,
  paragraphs: [
    'Years of quick fixes have left the library\'s data messy: capital letters in emails, missing statuses, a member entered twice, a loan typed in twice, fines for nobody, and counts that don\'t add up.',
    'Fix each problem with as few statements as you can, and use a transaction when a fix touches more than one table.',
  ],
  sandboxCode: "SELECT * FROM members;\nSELECT member_id, book_id, borrowed, COUNT(*) AS copies\nFROM loans GROUP BY member_id, book_id, borrowed HAVING COUNT(*) > 1;",
  sandboxSnippets: [
    snippet('Members', 'SELECT * FROM members;'),
    snippet('Duplicate loans', 'SELECT member_id, book_id, borrowed, COUNT(*) AS copies\nFROM loans GROUP BY member_id, book_id, borrowed HAVING COUNT(*) > 1;'),
    snippet('Orphaned fines', 'SELECT * FROM fines WHERE member_id NOT IN (SELECT id FROM members);'),
  ],
  readMore: { label: 'SQLite: DELETE', url: 'https://www.sqlite.org/lang_delete.html', source: 'SQLite documentation' },
  challenges: [
    query('medium', 'Lower-case emails', {
      prompt: 'Change every email to lower case, updating only the rows that change.',
      hint: '`SET email = LOWER(email) WHERE email <> LOWER(email)`.',
      solution: 'UPDATE members\nSET email = LOWER(email)\nWHERE email <> LOWER(email);',
      checks: [AFTER.members],
    }),
    query('medium', 'Missing statuses', {
      prompt: "Set the status of every member whose status is missing to `active`.",
      hint: "`WHERE status IS NULL`.",
      solution: "UPDATE members\nSET status = 'active'\nWHERE status IS NULL;",
      checks: [AFTER.members],
    }),
    query('hard', 'One person, one record', {
      prompt: "Members with the same name are the same person. In one transaction, move all loans to the lowest id for that name, then delete the other members with that name.",
      hint: 'The same two statements as "Merge every duplicate" in the last lesson.',
      solution: 'BEGIN;\nUPDATE loans\nSET member_id = (\n  SELECT MIN(m2.id) FROM members m2\n  WHERE m2.name = (SELECT name FROM members WHERE id = loans.member_id)\n)\nWHERE member_id IN (SELECT id FROM members);\nDELETE FROM members\nWHERE id NOT IN (SELECT MIN(id) FROM members GROUP BY name);\nCOMMIT;',
      checks: [AFTER.loans, AFTER.members],
    }),
    query('hard', 'Typed twice', {
      prompt: 'Delete the duplicate loans (same member, book and borrowed date), keeping the lowest id of each.',
      hint: '`WHERE id NOT IN (SELECT MIN(id) FROM loans GROUP BY member_id, book_id, borrowed)`.',
      solution: 'DELETE FROM loans\nWHERE id NOT IN (\n  SELECT MIN(id) FROM loans\n  GROUP BY member_id, book_id, borrowed\n);',
      checks: [AFTER.loans],
    }),
    query('hard', 'Fines that make sense', {
      prompt: 'Delete the fines that belong to no member, and the fines of 0 or less, in one statement.',
      hint: '`WHERE member_id NOT IN (SELECT id FROM members) OR amount <= 0`.',
      solution: 'DELETE FROM fines\nWHERE member_id NOT IN (SELECT id FROM members) OR amount <= 0;',
      checks: [AFTER.fines],
    }),
    query('hard', 'Counts that add up', {
      prompt: "In one transaction, first swap `copies` and `available` for the books where available is bigger than copies (they were typed the wrong way round), then recount `available` for every book from the loans still out.",
      hint: 'The swap UPDATE with `WHERE available > copies`, then the recount UPDATE. The order matters.',
      solution: 'BEGIN;\nUPDATE books\nSET copies = available, available = copies\nWHERE available > copies;\nUPDATE books\nSET available = copies - (\n  SELECT COUNT(*) FROM loans\n  WHERE loans.book_id = books.id AND loans.returned IS NULL\n);\nCOMMIT;',
      checks: [AFTER.books],
    }),
  ],
  questions: [
    mc('Why `WHERE email <> LOWER(email)` when lowering emails?', ['So only the rows that actually change are updated', 'It is required', 'To skip NULLs only', 'To sort them'], 0,
      'The rows-changed count then shows how many were fixed.'),
    mc('Which finds missing statuses?', ["`status = 'NULL'`", "`status = ''`", '`status IS NULL`', '`status = NULL`'], 2,
      '= NULL is never true.'),
    mc('When merging duplicates, why move the loans before deleting the members?', ['DELETE needs it', 'It is faster', 'The UPDATE looks up each member\'s name, which needs the duplicate rows to still exist', 'Order doesn\'t matter'], 2,
      'After the DELETE, the duplicate ids would have no name to look up.'),
    mc('Which keeps the first of each group of duplicate loans?', ['`DELETE … WHERE id IN (SELECT MIN(id) …)`', '`DELETE DISTINCT FROM loans`', '`SELECT DISTINCT`', '`DELETE … WHERE id NOT IN (SELECT MIN(id) … GROUP BY …)`'], 3,
      'Delete every id that is not the smallest of its group.'),
    qShort('Which keyword joins two conditions so a row matching either one is deleted?', 'OR',
      '`WHERE … OR …`.'),
    mc('Why swap before recounting in "Counts that add up"?', ['It doesn\'t matter', 'The recount uses copies, which is wrong until the swap fixes it', 'Swapping after would be faster', 'The recount needs a transaction'], 1,
      'Recounting first would subtract from the wrong number.'),
  ],
})

export const modifyingProjects = [frontDesk, stockTake, cleanUp]
