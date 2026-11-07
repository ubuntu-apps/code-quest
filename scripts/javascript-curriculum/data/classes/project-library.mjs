// Classes side quest (medium): A library system. Lesson, Try-it snippets, challenges and quiz.
import { is, makeProject, mc, same, snippet, task, throwsWhen } from '../_builders.mjs'

export default makeProject('medium', {
  id: 'proj_library',
  title: 'A library system',
  paragraphs: [
    'A school library lends books to members. Three classes work together:',
    '- `Book`: a title, an author, and who has it (`borrower`, or `null`);\n- `Member`: a name, and the books they have out (at most 3);\n- `Library`: keeps the books and members, and lends and returns books, checking the rules.',
    'The rules: a book can only be lent if it is in; a member can\'t have more than 3 books; only the borrower can return a book. Breaking a rule throws an `Error` saying why.',
    '```text\nlibrary.lend("Dune", "Ana")    ✓\nlibrary.lend("Dune", "Ben")    ✗ Dune is already out\nlibrary.giveBack("Dune", "Ben") ✗ Ben doesn\'t have Dune\n```',
  ],
  sandboxCode: 'class Book {\n  constructor(title, author) {\n    this.title = title\n    this.author = author\n    this.borrower = null\n  }\n  get isIn() {\n    return this.borrower === null\n  }\n}\nconsole.log(new Book("Dune", "Herbert"))',
  sandboxSnippets: [
    snippet('Find by title', 'const books = [{ title: "Dune" }, { title: "Emma" }]\nconsole.log(books.find((b) => b.title === "Emma"))'),
  ],
  challenges: [
    task('easy', 'A book', {
      prompt: 'Write `Book` with `title`, `author`, `borrower` (`null`), and a getter `isIn`.',
      hint: '`get isIn() { return this.borrower === null }`.',
      solution: 'class Book {\n  constructor(title, author) {\n    this.title = title\n    this.author = author\n    this.borrower = null\n  }\n  get isIn() {\n    return this.borrower === null\n  }\n}',
      tests: [['New book', '(() => { const b = new Book("Dune", "Herbert"); return b.isIn === true && b.borrower === null && b.author === "Herbert" })()'], ['Out', '(() => { const b = new Book("Dune", "Herbert"); b.borrower = "Ana"; return b.isIn === false })()']],
    }),
    task('easy', 'A member', {
      prompt: 'Write `Member` with `name`, an empty `books` array, and a getter `canBorrow` (fewer than 3 books).',
      hint: '`get canBorrow() { return this.books.length < 3 }`.',
      solution: 'class Member {\n  constructor(name) {\n    this.name = name\n    this.books = []\n  }\n  get canBorrow() {\n    return this.books.length < 3\n  }\n}',
      tests: [['New member', is('new Member("Ana").canBorrow', true)], ['Full', '(() => { const m = new Member("Ana"); m.books.push("a", "b", "c"); return m.canBorrow === false })()']],
    }),
    task('medium', 'Add and find', {
      prompt: 'Write `Library` with `books` and `members` arrays, `addBook(book)` and `join(member)` (both return `this`), and `findBook(title)` / `findMember(name)` that throw `Error("No book called TITLE")` / `Error("No member called NAME")` when missing.',
      starter: 'class Book {\n  constructor(title, author) {\n    this.title = title\n    this.author = author\n    this.borrower = null\n  }\n}\nclass Member {\n  constructor(name) {\n    this.name = name\n    this.books = []\n  }\n}\n',
      hint: '`find`, then throw if the result is `undefined`.',
      solution: 'class Book {\n  constructor(title, author) {\n    this.title = title\n    this.author = author\n    this.borrower = null\n  }\n}\nclass Member {\n  constructor(name) {\n    this.name = name\n    this.books = []\n  }\n}\nclass Library {\n  constructor() {\n    this.books = []\n    this.members = []\n  }\n  addBook(book) {\n    this.books.push(book)\n    return this\n  }\n  join(member) {\n    this.members.push(member)\n    return this\n  }\n  findBook(title) {\n    const book = this.books.find((b) => b.title === title)\n    if (!book) throw new Error(`No book called ${title}`)\n    return book\n  }\n  findMember(name) {\n    const member = this.members.find((m) => m.name === name)\n    if (!member) throw new Error(`No member called ${name}`)\n    return member\n  }\n}',
      tests: [['Finds', '(() => { const lib = new Library().addBook(new Book("Dune", "H")).join(new Member("Ana")); return lib.findBook("Dune").title === "Dune" && lib.findMember("Ana").name === "Ana" })()'], ['No book', throwsWhen('new Library().findBook("Emma")', 'No book called Emma')], ['No member', throwsWhen('new Library().findMember("Zed")', 'No member called Zed')]],
    }),
    task('medium', 'Lend', {
      prompt: 'Add `lend(title, name)`: throw `Error("TITLE is already out")` if the book is out, `Error("NAME has 3 books already")` if the member is full; else set the book\'s `borrower` and add the title to the member\'s `books`.',
      starter: 'class Book {\n  constructor(title) {\n    this.title = title\n    this.borrower = null\n  }\n}\nclass Member {\n  constructor(name) {\n    this.name = name\n    this.books = []\n  }\n}\nclass Library {\n  constructor() {\n    this.books = []\n    this.members = []\n  }\n  findBook(title) {\n    const book = this.books.find((b) => b.title === title)\n    if (!book) throw new Error(`No book called ${title}`)\n    return book\n  }\n  findMember(name) {\n    const member = this.members.find((m) => m.name === name)\n    if (!member) throw new Error(`No member called ${name}`)\n    return member\n  }\n}\n',
      hint: 'Find both, two guard clauses, then the two changes.',
      solution: 'class Book {\n  constructor(title) {\n    this.title = title\n    this.borrower = null\n  }\n}\nclass Member {\n  constructor(name) {\n    this.name = name\n    this.books = []\n  }\n}\nclass Library {\n  constructor() {\n    this.books = []\n    this.members = []\n  }\n  findBook(title) {\n    const book = this.books.find((b) => b.title === title)\n    if (!book) throw new Error(`No book called ${title}`)\n    return book\n  }\n  findMember(name) {\n    const member = this.members.find((m) => m.name === name)\n    if (!member) throw new Error(`No member called ${name}`)\n    return member\n  }\n  lend(title, name) {\n    const book = this.findBook(title)\n    const member = this.findMember(name)\n    if (book.borrower !== null) throw new Error(`${title} is already out`)\n    if (member.books.length >= 3) throw new Error(`${name} has 3 books already`)\n    book.borrower = name\n    member.books.push(title)\n  }\n}',
      tests: [['Lends', '(() => { const lib = new Library(); lib.books.push(new Book("Dune")); lib.members.push(new Member("Ana")); lib.lend("Dune", "Ana"); return lib.books[0].borrower === "Ana" && lib.members[0].books[0] === "Dune" })()'], ['Already out', '(() => { const lib = new Library(); lib.books.push(new Book("Dune")); lib.members.push(new Member("Ana"), new Member("Ben")); lib.lend("Dune", "Ana"); try { lib.lend("Dune", "Ben") } catch (e) { return e.message === "Dune is already out" } return false })()'], ['Full', '(() => { const lib = new Library(); lib.books.push(new Book("a"), new Book("b"), new Book("c"), new Book("d")); lib.members.push(new Member("Ana")); for (const t of ["a", "b", "c"]) lib.lend(t, "Ana"); try { lib.lend("d", "Ana") } catch (e) { return e.message === "Ana has 3 books already" && lib.books[3].borrower === null } return false })()']],
    }),
    task('hard', 'Give it back', {
      prompt: 'Add `giveBack(title, name)`: throw `Error("NAME doesn\'t have TITLE")` unless that member is the borrower; else set `borrower` to `null` and remove the title from their `books`.',
      starter: 'class Library {\n  constructor() {\n    this.books = []\n    this.members = []\n  }\n  findBook(title) {\n    return this.books.find((b) => b.title === title)\n  }\n  findMember(name) {\n    return this.members.find((m) => m.name === name)\n  }\n  lend(title, name) {\n    this.findBook(title).borrower = name\n    this.findMember(name).books.push(title)\n  }\n}\n',
      hint: 'Check `book.borrower !== name`; remove with `filter`.',
      solution: 'class Library {\n  constructor() {\n    this.books = []\n    this.members = []\n  }\n  findBook(title) {\n    return this.books.find((b) => b.title === title)\n  }\n  findMember(name) {\n    return this.members.find((m) => m.name === name)\n  }\n  lend(title, name) {\n    this.findBook(title).borrower = name\n    this.findMember(name).books.push(title)\n  }\n  giveBack(title, name) {\n    const book = this.findBook(title)\n    const member = this.findMember(name)\n    if (!book || !member || book.borrower !== name) throw new Error(`${name} doesn\'t have ${title}`)\n    book.borrower = null\n    member.books = member.books.filter((t) => t !== title)\n  }\n}',
      tests: [['Returns', '(() => { const lib = new Library(); lib.books.push({ title: "Dune", borrower: null }); lib.members.push({ name: "Ana", books: [] }); lib.lend("Dune", "Ana"); lib.giveBack("Dune", "Ana"); return lib.books[0].borrower === null && lib.members[0].books.length === 0 })()'], ['Wrong person', '(() => { const lib = new Library(); lib.books.push({ title: "Dune", borrower: null }); lib.members.push({ name: "Ana", books: [] }, { name: "Ben", books: [] }); lib.lend("Dune", "Ana"); try { lib.giveBack("Dune", "Ben") } catch (e) { return e.message === "Ben doesn\'t have Dune" && lib.books[0].borrower === "Ana" } return false })()']],
    }),
    task('expert', 'Reports', {
      prompt: 'Add two methods to `Library`: `available()`, the titles that are in, A to Z; and `onLoan()`, lines like `Dune: Ana` for each book that is out, A to Z by title.',
      starter: 'class Library {\n  constructor(books) {\n    this.books = books\n  }\n}\n',
      hint: '`filter`, `toSorted((a, b) => a.title.localeCompare(b.title))`, `map`.',
      solution: 'class Library {\n  constructor(books) {\n    this.books = books\n  }\n  available() {\n    return this.books\n      .filter((b) => b.borrower === null)\n      .map((b) => b.title)\n      .toSorted((a, b) => a.localeCompare(b))\n  }\n  onLoan() {\n    return this.books\n      .filter((b) => b.borrower !== null)\n      .toSorted((a, b) => a.title.localeCompare(b.title))\n      .map((b) => `${b.title}: ${b.borrower}`)\n  }\n}',
      tests: [['Available', same('new Library([{ title: "Emma", borrower: null }, { title: "Dune", borrower: "Ana" }, { title: "Beloved", borrower: null }]).available()', '["Beloved", "Emma"]')], ['On loan', same('new Library([{ title: "Emma", borrower: "Ben" }, { title: "Dune", borrower: "Ana" }, { title: "Beloved", borrower: null }]).onLoan()', '["Dune: Ana", "Emma: Ben"]')]],
    }),
  ],
  questions: [
    mc('Which class should know whether a book is in?', ['Book', 'Member', 'Library', 'All three'], 0, 'A book knows its own borrower.'),
    mc('Which class checks the lending rules?', ['Library: it sees both books and members', 'Book', 'Member', 'None'], 0, 'The rules involve both.'),
    mc('What does `findBook` throw for a missing title?', ['An Error saying no book has that title', 'Nothing', 'undefined', 'A SyntaxError'], 0, 'Fail loudly.'),
    mc('Why check every rule before changing anything in `lend`?', ['So a broken rule leaves everything as it was', 'Checks are faster first', 'JavaScript requires it', 'It doesn\'t matter'], 0, 'No half-finished loans.'),
    mc('What does `["Emma", "Beloved"].toSorted((a, b) => a.localeCompare(b))` give?', ['`["Beloved", "Emma"]`', '`["Emma", "Beloved"]`', '`2`', 'An error'], 0, 'A to Z.', { code: 'console.log(["Emma", "Beloved"].toSorted((a, b) => a.localeCompare(b)))', output: "[ 'Beloved', 'Emma' ]" }),
    mc('Is a Library a Book, or does it have Books?', ['It has Books: composition', 'It is a Book: inheritance', 'Neither', 'Both'], 0, '"Has a".'),
  ],
})
