// Capstone projects: A library's loans.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { LIBRARY_DB } from '../capstone-db.mjs'

const OUT_NOW = 'SELECT b.title, m.name AS member, l.due_on\nFROM loans l\nJOIN copies c ON c.id = l.copy_id\nJOIN books b ON b.id = c.book_id\nJOIN members m ON m.id = l.member_id\nWHERE l.returned_on IS NULL\nORDER BY l.due_on, b.title;'

export default makeTopic({
  id: 'library_loans',
  title: "A library's loans",
  database: LIBRARY_DB,
  paragraphs: [
    "A small library wants to know where its books are. The library owns `books`, and of some books it has more than one physical `copies`. `members` borrow copies: each row of `loans` has the copy, the member, the date it was borrowed, the date it is due back (three weeks later) and the date it came back, `returned_on`, which is **NULL while the copy is still out**.",
    "So a loan joins to its book through its copy: `loans → copies → books`. Today is 2026-10-24.",
    '```\n' + OUT_NOW + '\n```',
    "Dates are text in the form `YYYY-MM-DD`, so comparing them with `<` and `>` works, and `julianday()` turns them into day numbers to subtract. A loan is overdue when it is still out and its due date is before today.",
    "Watch the counts in this project: a book with two copies, each with several loans, makes many rows when joined, so count with care, or count in subqueries.",
  ],
  sandboxCode: OUT_NOW,
  sandboxSnippets: [
    snippet('Out right now', OUT_NOW),
    snippet('Days between dates', "SELECT julianday('2026-10-24') - julianday('2026-10-06') AS days;"),
  ],
  readMore: { label: 'SQLite: date and time functions', url: 'https://www.sqlite.org/lang_datefunc.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Out right now', {
      prompt: "Show every copy that is out now: the book's `title`, the member's name (`member`) and `due_on`. Sort by due date, then title.",
      hint: 'The lesson\'s example: `WHERE l.returned_on IS NULL`.',
      solution: OUT_NOW,
    }),
    query('easy', 'Overdue', {
      prompt: "Show the loans that are overdue today: `title`, `member` and whole days overdue (`days_overdue`). Most overdue first, then by title.",
      hint: "Still out and `l.due_on < '2026-10-24'`; `CAST(julianday('2026-10-24') - julianday(l.due_on) AS INTEGER)`.",
      solution: "SELECT b.title, m.name AS member,\n       CAST(julianday('2026-10-24') - julianday(l.due_on) AS INTEGER) AS days_overdue\nFROM loans l\nJOIN copies c ON c.id = l.copy_id\nJOIN books b ON b.id = c.book_id\nJOIN members m ON m.id = l.member_id\nWHERE l.returned_on IS NULL AND l.due_on < '2026-10-24'\nORDER BY days_overdue DESC, b.title;",
    }),
    query('easy', 'Loans by genre', {
      prompt: "Show each `genre` and its number of `loans`, ever. Most first, then by genre.",
      hint: 'Join loans to copies and books; group by genre.',
      solution: 'SELECT b.genre, COUNT(*) AS loans\nFROM loans l\nJOIN copies c ON c.id = l.copy_id\nJOIN books b ON b.id = c.book_id\nGROUP BY b.genre\nORDER BY loans DESC, b.genre;',
    }),
    query('medium', 'On the shelf', {
      prompt: "For every book, show `title`, its number of `copies`, how many are out now (`out`) and how many are on the shelf (`available`). Sort by title.",
      hint: 'Count copies and open loans in two subqueries in the SELECT list, so the counts don\'t multiply each other.',
      solution: 'SELECT b.title,\n       (SELECT COUNT(*) FROM copies c WHERE c.book_id = b.id) AS copies,\n       (SELECT COUNT(*) FROM loans l JOIN copies c ON c.id = l.copy_id\n        WHERE c.book_id = b.id AND l.returned_on IS NULL) AS out,\n       (SELECT COUNT(*) FROM copies c WHERE c.book_id = b.id)\n         - (SELECT COUNT(*) FROM loans l JOIN copies c ON c.id = l.copy_id\n            WHERE c.book_id = b.id AND l.returned_on IS NULL) AS available\nFROM books b\nORDER BY b.title;',
    }),
    query('medium', 'Late returns', {
      prompt: "Show the loans that came back late: `member`, `title` and whole days late (`days_late`). Latest first, then by member, then title.",
      hint: '`WHERE l.returned_on > l.due_on`.',
      solution: 'SELECT m.name AS member, b.title,\n       CAST(julianday(l.returned_on) - julianday(l.due_on) AS INTEGER) AS days_late\nFROM loans l\nJOIN copies c ON c.id = l.copy_id\nJOIN books b ON b.id = c.book_id\nJOIN members m ON m.id = l.member_id\nWHERE l.returned_on > l.due_on\nORDER BY days_late DESC, member, b.title;',
    }),
    query('medium', 'Fines', {
      prompt: "The fine is 0.25 for each day late: for loans returned late, up to the day they came back; for overdue loans still out, up to today. Show each member who owes something: `name` and `fine` (2 decimals). Highest first, then by name.",
      hint: "Days late is `julianday(COALESCE(l.returned_on, '2026-10-24')) - julianday(l.due_on)`; keep loans where it is more than 0.",
      solution: "SELECT m.name,\n       ROUND(SUM(0.25 * (julianday(COALESCE(l.returned_on, '2026-10-24')) - julianday(l.due_on))), 2) AS fine\nFROM loans l\nJOIN members m ON m.id = l.member_id\nWHERE julianday(COALESCE(l.returned_on, '2026-10-24')) > julianday(l.due_on)\nGROUP BY m.id, m.name\nORDER BY fine DESC, m.name;",
    }),
    query('hard', 'Most borrowed in each genre', {
      prompt: "For each `genre`, show its most borrowed book (`title`, and `loans`). Keep ties. Sort by genre, then title.",
      hint: 'Loans per book in a CTE with `RANK() OVER (PARTITION BY b.genre ORDER BY COUNT(*) DESC)`; keep 1.',
      solution: 'WITH counts AS (\n  SELECT b.genre, b.title, COUNT(*) AS loans,\n         RANK() OVER (PARTITION BY b.genre ORDER BY COUNT(*) DESC) AS place\n  FROM loans l\n  JOIN copies c ON c.id = l.copy_id\n  JOIN books b ON b.id = c.book_id\n  GROUP BY b.id, b.genre, b.title\n)\nSELECT genre, title, loans\nFROM counts\nWHERE place = 1\nORDER BY genre, title;',
    }),
    query('hard', 'How long books stay out', {
      prompt: "For returned loans, show per `genre`: how many (`returned`), the average days kept (`average_days`, 1 decimal) and the longest (`longest_days`). Sort by genre.",
      hint: '`julianday(l.returned_on) - julianday(l.borrowed_on)`, only `WHERE l.returned_on IS NOT NULL`.',
      solution: 'SELECT b.genre, COUNT(*) AS returned,\n       ROUND(AVG(julianday(l.returned_on) - julianday(l.borrowed_on)), 1) AS average_days,\n       CAST(MAX(julianday(l.returned_on) - julianday(l.borrowed_on)) AS INTEGER) AS longest_days\nFROM loans l\nJOIN copies c ON c.id = l.copy_id\nJOIN books b ON b.id = c.book_id\nWHERE l.returned_on IS NOT NULL\nGROUP BY b.genre\nORDER BY b.genre;',
    }),
    query('expert', 'Every month', {
      prompt: "Show every month (`month`, like `2026-05`) from the month of the first loan to the month of the last, with the number of loans borrowed in it (`loans`, 0 if none). In order.",
      hint: "A recursive CTE of month starts: begin at `date(MIN(borrowed_on), 'start of month')`, add `'+1 month'`. LEFT JOIN loans on `strftime('%Y-%m', …)`.",
      solution: "WITH RECURSIVE months(start) AS (\n  SELECT date(MIN(borrowed_on), 'start of month') FROM loans\n  UNION ALL\n  SELECT date(start, '+1 month') FROM months\n  WHERE date(start, '+1 month') <= (SELECT MAX(borrowed_on) FROM loans)\n)\nSELECT strftime('%Y-%m', m.start) AS month, COUNT(l.id) AS loans\nFROM months m\nLEFT JOIN loans l ON strftime('%Y-%m', l.borrowed_on) = strftime('%Y-%m', m.start)\nGROUP BY m.start\nORDER BY month;",
    }),
    query('expert', 'Every copy out', {
      prompt: "Show the books with no copy on the shelf right now: `title`, `copies`, and the earliest due date among their open loans (`back_by`). Soonest first, then by title.",
      hint: 'Group open loans by book, and compare their count with the number of copies in HAVING.',
      solution: 'SELECT b.title, COUNT(*) AS copies, MIN(l.due_on) AS back_by\nFROM loans l\nJOIN copies c ON c.id = l.copy_id\nJOIN books b ON b.id = c.book_id\nWHERE l.returned_on IS NULL\nGROUP BY b.id, b.title\nHAVING COUNT(*) = (SELECT COUNT(*) FROM copies c2 WHERE c2.book_id = b.id)\nORDER BY back_by, b.title;',
    }),
  ],
  questions: [
    mc('How do you know a copy is still out?', ['Its loan has no returned_on (NULL)', 'Its due_on is in the past', 'It has no loans', 'Its book has one copy'], 0,
      'returned_on is filled in when it comes back.'),
    mc('How does a loan reach its book\'s title?', ['Through the genre', 'loans → books directly', 'loans → copies → books', 'loans → members → books'], 2,
      'A loan is of a copy, and a copy is of a book.'),
    mc("Why can dates like '2026-10-06' be compared with `<`?", ['In YYYY-MM-DD form, text order is date order', 'They can\'t', 'SQLite has a date type', 'They are numbers'], 0,
      'Year first, then month, then day, all with leading zeros.'),
    mc('When is a loan overdue today?', ["When it is still out and due_on < '2026-10-24'", 'When returned_on > due_on', 'When due_on is today', 'When it was borrowed over 21 days ago, returned or not'], 0,
      'A loan due today isn\'t overdue yet.'),
    qShort('Which function turns a YYYY-MM-DD date into a day number you can subtract?', 'julianday',
      "`julianday('2026-10-24') - julianday(due_on)`."),
    mc('Why count copies and open loans in separate subqueries?', ['Subqueries are faster', 'COUNT only works once per query', 'To sort them', 'Joining both to books would multiply the rows and inflate the counts'], 3,
      'Each one-to-many join multiplies the rows of the other.'),
    mc("What does `COALESCE(returned_on, '2026-10-24')` do in the fines?", ['Counts an open loan up to today', 'Sets a return date in the table', 'Rounds the date', 'Skips open loans'], 0,
      'It doesn\'t change the data, only the calculation.'),
    mc('Why does the month list need a recursive CTE?', ['GROUP BY can\'t use dates', 'To sort months', 'strftime needs it', 'Months with no loans have no rows to group'], 3,
      'A calendar of months fills the gap.'),
    mc("What does `date('2026-05-18', 'start of month')` give?", ["'2026-05'", "'2026-05-01'", "'2026-05-31'", "'2026-06-01'"], 1,
      'Then +1 month steps from one month start to the next.'),
    mc('In "Every copy out", what does the HAVING compare?', ['Loans with members', 'Copies with genres', 'The number of open loans of a book with its number of copies', 'The due dates'], 2,
      'When they are equal, nothing is on the shelf.'),
  ],
})
