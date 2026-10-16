import { makeTopic, mc, py, qShort, task } from '../_builders.mjs'

const BOOKS_DB = py`import sqlite3
conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT, author TEXT, genre TEXT, pages INTEGER, year INTEGER)")
conn.executemany(
    "INSERT INTO books (title, author, genre, pages, year) VALUES (?, ?, ?, ?, ?)",
    [
        ("Dune", "Herbert", "sci-fi", 412, 1965),
        ("Emma", "Austen", "classic", 474, 1815),
        ("Neuromancer", "Gibson", "sci-fi", 271, 1984),
        ("Persuasion", "Austen", "classic", 249, 1817),
        ("Hyperion", "Simmons", "sci-fi", 482, 1989),
    ],
)
conn.commit()`

const DB_NOTE = 'A database is ready in `conn` with a `books` table: `id, title, author, genre, pages, year`.'

export default makeTopic({
  id: 'sqlite_basics',
  title: 'SQLite basics',
  paragraphs: [
    'sqlite3 in stdlib — embedded SQL database. connect, execute, fetchall.',
    'Parameterized queries prevent SQL injection. Use context manager for connection.',
    'Great for local apps, prototypes, and tests.',
  ],
  sandboxCode: py`import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE users (id INTEGER, name TEXT)")
conn.execute("INSERT INTO users VALUES (1, ?)", ("Ana",))
rows = conn.execute("SELECT name FROM users WHERE id=?", (1,)).fetchall()
print(rows[0][0])
conn.close()`,
  challenges: [
    task('easy', 'Create a table', {
      prompt:
        'Open an in-memory database as `conn` and create a table `tasks` with columns `id INTEGER PRIMARY KEY`, `title TEXT` and `done INTEGER`.',
      starter: py`import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute(___)`,
      hint: '`conn.execute("CREATE TABLE tasks (id INTEGER PRIMARY KEY, title TEXT, done INTEGER)")`.',
      solution: py`import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE tasks (id INTEGER PRIMARY KEY, title TEXT, done INTEGER)")`,
      tests: [
        ['Table exists', py`conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='tasks'").fetchone() is not None`],
        ['Has the right columns', py`[c[1] for c in conn.execute("PRAGMA table_info(tasks)")] == ["id", "title", "done"]`],
      ],
    }),
    task('easy', 'Insert and select', {
      prompt: `${DB_NOTE}\n\nInsert the book \`("Kindred", "Butler", "sci-fi", 264, 1979)\`, then set \`titles\` to every title written after 1980, oldest first.`,
      starter: py`conn.execute(
    "INSERT INTO books (title, author, genre, pages, year) VALUES (?, ?, ?, ?, ?)",
    ___,
)
titles = [row[0] for row in conn.execute(___)]`,
      hint: 'Pass the values as a tuple. Query `SELECT title FROM books WHERE year > 1980 ORDER BY year`.',
      solution: py`conn.execute(
    "INSERT INTO books (title, author, genre, pages, year) VALUES (?, ?, ?, ?, ?)",
    ("Kindred", "Butler", "sci-fi", 264, 1979),
)
titles = [row[0] for row in conn.execute("SELECT title FROM books WHERE year > 1980 ORDER BY year")]`,
      setup: BOOKS_DB,
      tests: [
        ['Kindred was inserted', py`conn.execute("SELECT year FROM books WHERE title = 'Kindred'").fetchone() == (1979,)`],
        ['titles', py`titles == ["Neuromancer", "Hyperion"]`],
      ],
    }),
    task('medium', 'Safe parameters', {
      prompt: `${DB_NOTE}\n\nWrite \`books_by(author)\` that returns that author's titles sorted A–Z. Use a \`?\` placeholder, never string formatting, so input can't change the SQL.`,
      starter: py`def books_by(author):
    ___`,
      hint: '`conn.execute("SELECT title FROM books WHERE author = ? ORDER BY title", (author,))`. Note the comma: it makes a one-item tuple.',
      solution: py`def books_by(author):
    rows = conn.execute("SELECT title FROM books WHERE author = ? ORDER BY title", (author,))
    return [row[0] for row in rows]`,
      setup: BOOKS_DB,
      tests: [
        ['Finds an author', py`books_by("Austen") == ["Emma", "Persuasion"]`],
        ['Unknown author', py`books_by("Tolkien") == []`],
        ['Injection attempt finds nothing', py`books_by("x' OR '1'='1") == []`],
      ],
    }),
    task('medium', 'Insert many rows', {
      prompt: 'Insert every row of `new_books` into the `books` table with one `executemany` call, then set `count` to the total number of books.',
      starter: py`new_books = [
    ("Beloved", "Morrison", "classic", 324, 1987),
    ("Foundation", "Asimov", "sci-fi", 255, 1951),
    ("Middlemarch", "Eliot", "classic", 880, 1871),
]
___
count = ___`,
      hint: '`conn.executemany("INSERT INTO books (title, author, genre, pages, year) VALUES (?, ?, ?, ?, ?)", new_books)`, then `SELECT COUNT(*)`.',
      solution: py`new_books = [
    ("Beloved", "Morrison", "classic", 324, 1987),
    ("Foundation", "Asimov", "sci-fi", 255, 1951),
    ("Middlemarch", "Eliot", "classic", 880, 1871),
]
conn.executemany("INSERT INTO books (title, author, genre, pages, year) VALUES (?, ?, ?, ?, ?)", new_books)
count = conn.execute("SELECT COUNT(*) FROM books").fetchone()[0]`,
      setup: BOOKS_DB,
      tests: [
        ['All three inserted', py`conn.execute("SELECT COUNT(*) FROM books WHERE title IN ('Beloved', 'Foundation', 'Middlemarch')").fetchone()[0] == 3`],
        ['count', py`count == 8`],
      ],
    }),
    task('hard', 'Group and aggregate', {
      prompt: `${DB_NOTE}\n\nFor each genre, get the number of books and the average page count, rounded to a whole number. Store a dict like \`{"sci-fi": (3, 388), ...}\` in \`stats\`.`,
      starter: py`rows = conn.execute(___).fetchall()
stats = ___`,
      hint: '`SELECT genre, COUNT(*), ROUND(AVG(pages)) FROM books GROUP BY genre`. Turn each row into `genre: (count, int(avg))`.',
      solution: py`rows = conn.execute("SELECT genre, COUNT(*), ROUND(AVG(pages)) FROM books GROUP BY genre").fetchall()
stats = {genre: (n, int(avg)) for genre, n, avg in rows}`,
      setup: BOOKS_DB,
      tests: [['Count and average per genre', py`stats == {"sci-fi": (3, 388), "classic": (2, 362)}`]],
    }),
    task('hard', 'Update and delete', {
      prompt: `${DB_NOTE}\n\nAdd 10 pages to every classic, then delete every book published before 1900. Commit your changes.`,
      starter: py`conn.execute(___)
conn.execute(___)
conn.commit()`,
      hint: '`UPDATE books SET pages = pages + 10 WHERE genre = \'classic\'` and `DELETE FROM books WHERE year < 1900`.',
      solution: py`conn.execute("UPDATE books SET pages = pages + 10 WHERE genre = 'classic'")
conn.execute("DELETE FROM books WHERE year < 1900")
conn.commit()`,
      setup: py`${BOOKS_DB}
conn.execute("INSERT INTO books (title, author, genre, pages, year) VALUES ('Beloved', 'Morrison', 'classic', 324, 1987)")`,
      tests: [
        ['Old books removed', py`conn.execute("SELECT COUNT(*) FROM books WHERE year < 1900").fetchone()[0] == 0`],
        ['Classics got 10 more pages', py`conn.execute("SELECT pages FROM books WHERE title = 'Beloved'").fetchone()[0] == 334`],
        ['Other books unchanged', py`conn.execute("SELECT pages FROM books WHERE title = 'Dune'").fetchone()[0] == 412`],
      ],
    }),
    task('expert', 'Rows as dictionaries', {
      prompt: `${DB_NOTE}\n\nWrite \`fetch_dicts(sql, params=())\` that runs a query and returns a list of dicts keyed by column name. Use \`sqlite3.Row\`.`,
      starter: py`import sqlite3

def fetch_dicts(sql, params=()):
    ___`,
      hint: 'Set `conn.row_factory = sqlite3.Row`; each row then converts with `dict(row)`.',
      solution: py`import sqlite3

def fetch_dicts(sql, params=()):
    conn.row_factory = sqlite3.Row
    return [dict(row) for row in conn.execute(sql, params)]`,
      setup: BOOKS_DB,
      tests: [
        ['Returns dicts', py`fetch_dicts("SELECT title, year FROM books WHERE author = ?", ("Gibson",)) == [{"title": "Neuromancer", "year": 1984}]`],
        ['Several rows', py`[d["title"] for d in fetch_dicts("SELECT title FROM books WHERE genre = ? ORDER BY year", ("sci-fi",))] == ["Dune", "Neuromancer", "Hyperion"]`],
      ],
    }),
    task('expert', 'Join two tables', {
      prompt:
        'There are two tables: `authors(id, name)` and `novels(title, author_id)`. Set `pairs` to `(author name, title)` tuples for every novel, sorted by author then title.',
      starter: py`pairs = conn.execute(___).fetchall()`,
      hint: '`SELECT authors.name, novels.title FROM novels JOIN authors ON novels.author_id = authors.id ORDER BY authors.name, novels.title`.',
      solution: py`pairs = conn.execute(
    "SELECT authors.name, novels.title FROM novels "
    "JOIN authors ON novels.author_id = authors.id "
    "ORDER BY authors.name, novels.title"
).fetchall()`,
      setup: py`import sqlite3
conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE authors (id INTEGER PRIMARY KEY, name TEXT)")
conn.execute("CREATE TABLE novels (title TEXT, author_id INTEGER)")
conn.executemany("INSERT INTO authors VALUES (?, ?)", [(1, "Le Guin"), (2, "Butler")])
conn.executemany("INSERT INTO novels VALUES (?, ?)", [("The Dispossessed", 1), ("Kindred", 2), ("A Wizard of Earthsea", 1), ("Dawn", 2)])`,
      tests: [['Joined and sorted', py`pairs == [("Butler", "Dawn"), ("Butler", "Kindred"), ("Le Guin", "A Wizard of Earthsea"), ("Le Guin", "The Dispossessed")]`]],
    }),
    task('expert', 'All or nothing', {
      prompt:
        'Write `transfer(from_id, to_id, amount)` for the `accounts(id, balance)` table. Take the money from one account and add it to the other inside `with conn:` so both changes happen together. If the sender doesn\'t have enough, raise `ValueError` and change nothing.',
      starter: py`def transfer(from_id, to_id, amount):
    with conn:
        ___`,
      hint: 'Inside `with conn:`, read the sender\'s balance; raise `ValueError` if it is too low; otherwise run two `UPDATE`s. An exception inside `with conn:` rolls everything back.',
      solution: py`def transfer(from_id, to_id, amount):
    with conn:
        (balance,) = conn.execute("SELECT balance FROM accounts WHERE id = ?", (from_id,)).fetchone()
        if balance < amount:
            raise ValueError("insufficient funds")
        conn.execute("UPDATE accounts SET balance = balance - ? WHERE id = ?", (amount, from_id))
        conn.execute("UPDATE accounts SET balance = balance + ? WHERE id = ?", (amount, to_id))`,
      setup: py`import sqlite3
conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE accounts (id INTEGER PRIMARY KEY, balance INTEGER)")
conn.executemany("INSERT INTO accounts VALUES (?, ?)", [(1, 100), (2, 50)])
conn.commit()

def balances():
    return dict(conn.execute("SELECT id, balance FROM accounts"))

def raises(fn, exc):
    try:
        fn()
    except exc:
        return True
    return False`,
      tests: [
        ['A good transfer moves the money', py`(transfer(1, 2, 30), balances())[1] == {1: 70, 2: 80}`],
        ['Overdrawing raises ValueError', py`raises(lambda: transfer(2, 1, 500), ValueError)`],
        ['A failed transfer changes nothing', py`(raises(lambda: transfer(2, 1, 500), ValueError), balances())[1] == {1: 70, 2: 80}`],
      ],
    }),
    task('expert', 'Insert or update', {
      prompt:
        'Count words with an "upsert": for each word in `text`, insert it into `word_counts(word PRIMARY KEY, n)` with `n = 1`, or add 1 if it is already there. Use `ON CONFLICT ... DO UPDATE`.',
      starter: py`text = "to be or not to be"
for word in text.split():
    conn.execute(___, (word,))`,
      hint: '`INSERT INTO word_counts (word, n) VALUES (?, 1) ON CONFLICT(word) DO UPDATE SET n = n + 1`.',
      solution: py`text = "to be or not to be"
for word in text.split():
    conn.execute(
        "INSERT INTO word_counts (word, n) VALUES (?, 1) ON CONFLICT(word) DO UPDATE SET n = n + 1",
        (word,),
    )`,
      setup: py`import sqlite3
conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE word_counts (word TEXT PRIMARY KEY, n INTEGER)")`,
      tests: [['Counts per word', py`dict(conn.execute("SELECT word, n FROM word_counts")) == {"to": 2, "be": 2, "or": 1, "not": 1}`]],
    }),
  ],
  questions: [
    mc('Where does `sqlite3.connect(":memory:")` keep the database?', ['In a file called memory', 'On a server', 'In RAM, gone when the program ends', 'In the browser cache'], 2),
    qShort('Which character is the sqlite3 placeholder for a value? (one character)', '?'),
    mc('Why use placeholders instead of building SQL with f-strings?', ['They prevent SQL injection', 'They are required for SELECT', 'They make queries shorter', 'f-strings are slower'], 0),
    mc('`conn.execute(...).fetchone()` returns…', ['A list of rows', 'The next row as a tuple, or None', 'The number of rows', 'A dict'], 1),
    mc('Which method inserts many rows with one call?', ['execute', 'insertmany', 'fetchall', 'executemany'], 3),
    mc('What does `with conn:` do?', ['Commits on success and rolls back on an exception', 'Closes the connection', 'Opens a new connection', 'Locks the file forever'], 0),
    qShort('Which SQL keyword groups rows so you can COUNT or AVG per group? (two words)', 'group by'),
    mc('`("Ana")` vs `("Ana",)` as query parameters:', ['Both are tuples', 'Only the second is a tuple', 'Only the first is a tuple', 'Neither works'], 1),
    mc('What does `conn.row_factory = sqlite3.Row` give you?', ['Faster queries', 'Automatic commits', 'Rows you can read by column name', 'Sorted rows'], 2),
    mc('Which clause turns an INSERT into an "upsert"?', ['WHERE EXISTS', 'REPLACE INTO', 'UNION', 'ON CONFLICT … DO UPDATE'], 3),
  ],
})
