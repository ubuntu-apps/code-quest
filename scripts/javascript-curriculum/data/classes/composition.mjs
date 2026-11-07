// Classes: Objects working together. Lesson, Try-it snippets, challenges and quiz.
import { MDN, is, makeTopic, mc, qShort, same, snippet, task, throwsWhen, uses } from '../_builders.mjs'

export default makeTopic({
  id: 'composition',
  title: 'Objects working together',
  paragraphs: [
    'Real programs are made of objects that use each other. A library **has** books, an order **has** lines, a car **has** an engine. Giving one object others to hold and work with is called **composition**, and it is usually simpler than inheritance.',
    '```\nclass Book {\n  constructor(title, author) {\n    this.title = title\n    this.author = author\n    this.onLoan = false\n  }\n}\n\nclass Library {\n  #books = []\n  add(book) {\n    this.#books.push(book)\n    return this\n  }\n  available() {\n    return this.#books.filter((b) => !b.onLoan).map((b) => b.title)\n  }\n  lend(title) {\n    const book = this.#books.find((b) => b.title === title)\n    if (!book) throw new Error(`No book called ${title}`)\n    if (book.onLoan) throw new Error(`${title} is already on loan`)\n    book.onLoan = true\n  }\n}\n\nconst lib = new Library()\nlib.add(new Book("Dune", "Herbert")).add(new Book("Emma", "Austen"))\nlib.lend("Dune")\nconsole.log(lib.available())\n```',
    'Each class has one clear job. `Book` knows about one book; `Library` knows how to keep and lend many. Neither needs to know the other\'s insides beyond what it uses.',
    'A handy test: if "A **is a** B" is true, inheritance may fit (a `Savings` is an `Account`). If "A **has a** B" is true, use composition (a `Library` has `Book`s). When in doubt, choose composition: it is easier to change later.',
    'Composition also lets you swap parts. Give an object the helper it should use, and different helpers give different behaviour without any subclasses:',
    '```\nclass Checkout {\n  constructor(pricing) {\n    this.pricing = pricing\n  }\n  total(amount) {\n    return this.pricing(amount)\n  }\n}\n\nconst normal = new Checkout((a) => a)\nconst sale = new Checkout((a) => a * 0.8)\nconsole.log(normal.total(50), sale.total(50))\n```',
  ],
  sandboxCode: 'class Engine {\n  start() {\n    return "Vroom"\n  }\n}\nclass Car {\n  constructor() {\n    this.engine = new Engine()\n  }\n  drive() {\n    return `${this.engine.start()}! Off we go`\n  }\n}\nconsole.log(new Car().drive())',
  sandboxSnippets: [
    snippet('Has many', 'class Team {\n  constructor(name) {\n    this.name = name\n    this.players = []\n  }\n  add(player) {\n    this.players.push(player)\n  }\n}\nconst t = new Team("Owls")\nt.add({ name: "Ana" })\nconsole.log(t)'),
    snippet('Swap a part', 'class Logger {\n  constructor(format) {\n    this.format = format\n  }\n  log(msg) {\n    console.log(this.format(msg))\n  }\n}\nnew Logger((m) => `[info] ${m}`).log("ready")\nnew Logger((m) => m.toUpperCase()).log("ready")'),
  ],
  readMore: MDN('Learn_web_development/Extensions/Advanced_JavaScript_objects/Object-oriented_programming', 'MDN: Object-oriented programming'),
  challenges: [
    task('easy', 'Has a list', {
      prompt: 'Write a class `Team` with `name`, an empty `players` array, `add(player)`, and a getter `size`.',
      hint: 'The constructor sets both; `get size() { return this.players.length }`.',
      solution: 'class Team {\n  constructor(name) {\n    this.name = name\n    this.players = []\n  }\n  add(player) {\n    this.players.push(player)\n  }\n  get size() {\n    return this.players.length\n  }\n}',
      tests: [['Adds', '(() => { const t = new Team("Owls"); t.add("Ana"); t.add("Ben"); return t.size === 2 && t.name === "Owls" })()']],
    }),
    task('easy', 'Has a part', {
      prompt: 'Give `Car` an `engine` (a new `Engine`) in its constructor, and a method `drive()` returning `ENGINE SOUND! Off we go`, using `this.engine.start()`.',
      starter: 'class Engine {\n  start() {\n    return "Vroom"\n  }\n}\nclass Car {}\n',
      hint: '`constructor() { this.engine = new Engine() }`.',
      solution: 'class Engine {\n  start() {\n    return "Vroom"\n  }\n}\nclass Car {\n  constructor() {\n    this.engine = new Engine()\n  }\n  drive() {\n    return `${this.engine.start()}! Off we go`\n  }\n}',
      tests: [['Drives', is('new Car().drive()', 'Vroom! Off we go')], ['Has an engine', 'new Car().engine instanceof Engine']],
    }),
    task('easy', 'Is a, or has a?', {
      prompt: 'Set `choices` to `"inherit"` or `"compose"` for each pair, in order: a `Square` and a `Shape`; a `Playlist` and its `Song`s; a `Truck` and a `Vehicle`; an `Order` and its `Customer`.',
      hint: 'Is a → inherit; has a → compose.',
      solution: 'const choices = ["inherit", "compose", "inherit", "compose"]',
      tests: [['choices is right', same('choices', '["inherit", "compose", "inherit", "compose"]')]],
      typedOk: true,
    }),
    task('medium', 'An order of lines', {
      prompt: 'Write `Line` (`item`, `price`, `qty`, getter `total`) and `Order` with `add(item, price, qty)` that creates a `Line`, and a getter `total` adding the lines\' totals.',
      hint: 'In `Order.add`: `this.lines.push(new Line(item, price, qty))`.',
      solution: 'class Line {\n  constructor(item, price, qty) {\n    this.item = item\n    this.price = price\n    this.qty = qty\n  }\n  get total() {\n    return this.price * this.qty\n  }\n}\nclass Order {\n  constructor() {\n    this.lines = []\n  }\n  add(item, price, qty) {\n    this.lines.push(new Line(item, price, qty))\n    return this\n  }\n  get total() {\n    return this.lines.reduce((sum, l) => sum + l.total, 0)\n  }\n}',
      tests: [['Total', is('new Order().add("tea", 2.5, 2).add("cake", 4, 1).total', 9)], ['Lines', 'new Order().add("x", 1, 1).lines[0] instanceof Line']],
    }),
    task('medium', 'Swap the rule', {
      prompt: 'Write `Checkout`, whose constructor takes a `pricing` function, with `total(amount)` that uses it. Then make `sale`, a `Checkout` that takes 20% off.',
      hint: '`const sale = new Checkout((a) => a * 0.8)`.',
      solution: 'class Checkout {\n  constructor(pricing) {\n    this.pricing = pricing\n  }\n  total(amount) {\n    return this.pricing(amount)\n  }\n}\nconst sale = new Checkout((a) => a * 0.8)',
      tests: [['Sale', is('sale.total(50)', 40)], ['Any rule', is('new Checkout((a) => a + 5).total(10)', 15)]],
    }),
    task('medium', 'Lend a book', {
      prompt: 'Give `Library` a `lend(title)` that marks the book `onLoan`, throwing `Error("No book called TITLE")` if it isn\'t there and `Error("TITLE is already on loan")` if it is out.',
      starter: 'class Book {\n  constructor(title) {\n    this.title = title\n    this.onLoan = false\n  }\n}\nclass Library {\n  constructor() {\n    this.books = []\n  }\n  add(book) {\n    this.books.push(book)\n    return this\n  }\n}\n',
      hint: '`find` the book; two guard clauses; then set `onLoan`.',
      solution: 'class Book {\n  constructor(title) {\n    this.title = title\n    this.onLoan = false\n  }\n}\nclass Library {\n  constructor() {\n    this.books = []\n  }\n  add(book) {\n    this.books.push(book)\n    return this\n  }\n  lend(title) {\n    const book = this.books.find((b) => b.title === title)\n    if (!book) throw new Error(`No book called ${title}`)\n    if (book.onLoan) throw new Error(`${title} is already on loan`)\n    book.onLoan = true\n  }\n}',
      tests: [['Lends', '(() => { const l = new Library().add(new Book("Dune")); l.lend("Dune"); return l.books[0].onLoan === true })()'], ['Missing', throwsWhen('new Library().lend("Emma")', 'No book called Emma')], ['Already out', '(() => { const l = new Library().add(new Book("Dune")); l.lend("Dune"); try { l.lend("Dune") } catch (e) { return e.message === "Dune is already on loan" } return false })()']],
    }),
    task('hard', 'Students and courses', {
      prompt: 'Write `Course` (`name`, `students` array, `enrol(student)`) and `Student` (`name`, `courses` array). `enrol` adds the student to the course and the course\'s name to the student\'s `courses`, but does nothing if they are already enrolled.',
      hint: 'Check `this.students.includes(student)` first.',
      solution: 'class Student {\n  constructor(name) {\n    this.name = name\n    this.courses = []\n  }\n}\nclass Course {\n  constructor(name) {\n    this.name = name\n    this.students = []\n  }\n  enrol(student) {\n    if (this.students.includes(student)) return\n    this.students.push(student)\n    student.courses.push(this.name)\n  }\n}',
      tests: [['Both sides', '(() => { const s = new Student("Ana"); const c = new Course("Maths"); c.enrol(s); return c.students[0] === s && s.courses[0] === "Maths" })()'], ['Once only', '(() => { const s = new Student("Ana"); const c = new Course("Art"); c.enrol(s); c.enrol(s); return c.students.length === 1 && s.courses.length === 1 })()']],
    }),
    task('hard', 'A logger part', {
      prompt: 'Write `Logger` (with `lines` and `log(text)`) and `Account`, whose constructor takes a `logger`. `deposit(n)` adds to `balance` and logs `Deposited N`. Make it work with any object that has a `log` method.',
      hint: 'In `deposit`: `this.logger.log(`Deposited ${n}`)`.',
      solution: 'class Logger {\n  constructor() {\n    this.lines = []\n  }\n  log(text) {\n    this.lines.push(text)\n  }\n}\nclass Account {\n  constructor(logger) {\n    this.logger = logger\n    this.balance = 0\n  }\n  deposit(n) {\n    this.balance += n\n    this.logger.log(`Deposited ${n}`)\n  }\n}',
      tests: [['Logs', '(() => { const log = new Logger(); const a = new Account(log); a.deposit(5); a.deposit(10); return a.balance === 15 && log.lines.join() === "Deposited 5,Deposited 10" })()'], ['Any logger', '(() => { const got = []; new Account({ log: (t) => got.push(t) }).deposit(1); return got[0] === "Deposited 1" })()']],
    }),
    task('expert', 'An inventory', {
      prompt: 'Write `Product` (`name`, `price`) and `Inventory`, which keeps a private `Map` from name to `{ product, qty }`. `stock(product, qty)` adds qty (adding the product if new); `sell(name, qty)` takes qty away, throwing `Error("Not enough NAME")` if there isn\'t enough; getter `value` is the total of price × qty.',
      hint: 'Use `this.#items.get(name)`; for a new product, `set(name, { product, qty: 0 })` first.',
      solution: 'class Product {\n  constructor(name, price) {\n    this.name = name\n    this.price = price\n  }\n}\nclass Inventory {\n  #items = new Map()\n  stock(product, qty) {\n    if (!this.#items.has(product.name)) this.#items.set(product.name, { product, qty: 0 })\n    this.#items.get(product.name).qty += qty\n    return this\n  }\n  sell(name, qty) {\n    const entry = this.#items.get(name)\n    if (!entry || entry.qty < qty) throw new Error(`Not enough ${name}`)\n    entry.qty -= qty\n  }\n  get value() {\n    let total = 0\n    for (const { product, qty } of this.#items.values()) total += product.price * qty\n    return total\n  }\n}',
      tests: [['Value', '(() => { const inv = new Inventory(); const pen = new Product("pen", 2); inv.stock(pen, 10).stock(new Product("pad", 5), 2).stock(pen, 5); inv.sell("pen", 3); return inv.value === 34 })()'], ['Not enough', '(() => { const inv = new Inventory(); inv.stock(new Product("ink", 9), 1); try { inv.sell("ink", 2) } catch (e) { return e.message === "Not enough ink" } return false })()'], ['Unknown', throwsWhen('new Inventory().sell("x", 1)', 'Not enough x')]],
    }),
    task('expert', 'A tiny event system', {
      prompt: 'Write `EventBus` with `on(name, fn)` (remember a listener), `emit(name, data)` (call every listener for that name with `data`, returning how many ran), and `off(name, fn)` (forget that listener). Keep the listeners in a private `Map` of arrays.',
      hint: '`on`: `(map.get(name) ?? [])` then add; `emit`: loop and count; `off`: filter it out.',
      solution: 'class EventBus {\n  #listeners = new Map()\n  on(name, fn) {\n    const list = this.#listeners.get(name) ?? []\n    list.push(fn)\n    this.#listeners.set(name, list)\n  }\n  off(name, fn) {\n    const list = this.#listeners.get(name) ?? []\n    this.#listeners.set(name, list.filter((f) => f !== fn))\n  }\n  emit(name, data) {\n    const list = this.#listeners.get(name) ?? []\n    for (const fn of list) fn(data)\n    return list.length\n  }\n}',
      tests: [['Emits', '(() => { const bus = new EventBus(); const got = []; bus.on("save", (d) => got.push(`a ${d}`)); bus.on("save", (d) => got.push(`b ${d}`)); return bus.emit("save", 1) === 2 && got.join() === "a 1,b 1" })()'], ['Off', '(() => { const bus = new EventBus(); let n = 0; const fn = () => n++; bus.on("x", fn); bus.off("x", fn); return bus.emit("x") === 0 && n === 0 })()'], ['Nobody listening', is('new EventBus().emit("nothing")', 0)]],
    }),
  ],
  questions: [
    mc('What is composition?', ['An object holding and using other objects', 'A class extending another', 'A kind of loop', 'Copying an object'], 0, 'A library has books.'),
    mc('"A Library has Books." Which fits?', ['Composition', 'Inheritance', 'Neither', 'Static methods'], 0, '"Has a" means compose.'),
    mc('"A Truck is a Vehicle." Which might fit?', ['Inheritance', 'Composition', 'Neither', 'A getter'], 0, '"Is a" can mean extends.'),
    mc('When in doubt, which is usually easier to change later?', ['Composition', 'Inheritance', 'They are the same', 'Neither'], 0, 'Parts can be swapped.'),
    mc('What does this show?\n```\nclass E {\n  start() {\n    return "Vroom"\n  }\n}\nclass Car {\n  constructor() {\n    this.engine = new E()\n  }\n}\nconsole.log(new Car().engine.start())\n```', ['`Vroom`', '`undefined`', 'An error', '`E`'], 0, 'The car has an engine.', { code: 'class E {\n  start() {\n    return "Vroom"\n  }\n}\nclass Car {\n  constructor() {\n    this.engine = new E()\n  }\n}\nconsole.log(new Car().engine.start())', output: 'Vroom' }),
    mc('Why pass a helper (like a pricing function) into a constructor?', ['Different helpers give different behaviour, with no subclasses', 'It is faster', 'Constructors need functions', 'To make it private'], 0, 'Swap the part.'),
    mc('What should each class have?', ['One clear job', 'As many methods as possible', 'At least one subclass', 'Only private fields'], 0, 'Book knows a book; Library keeps many.'),
    mc('Account calls `this.logger.log(...)`. What can the logger be?', ['Any object with a `log` method', 'Only a Logger', 'Only console', 'A string'], 0, 'It only needs log.'),
    qShort('What is it called when an object is built from other objects it holds?', 'composition', '"Has a".'),
  ],
})
