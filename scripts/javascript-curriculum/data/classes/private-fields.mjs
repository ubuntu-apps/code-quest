// Classes: Private fields. Lesson, Try-it snippets, challenges and quiz.
import { MDN, is, makeTopic, mc, qShort, same, snippet, task, throwsWhen } from '../_builders.mjs'

export default makeTopic({
  id: 'private_fields',
  title: 'Private fields: keeping things inside',
  paragraphs: [
    'So far anyone can reach in and change an object: `account.balance = 1000000`. A well-made class protects its data, so it can only change through its methods, which check the rules.',
    'A field whose name starts with **`#`** is **private**: only code inside the class can see it. From outside, it doesn\'t exist.',
    '```\nclass Account {\n  #balance = 0\n\n  deposit(amount) {\n    if (amount <= 0) throw new RangeError("Deposit must be positive")\n    this.#balance += amount\n  }\n\n  get balance() {\n    return this.#balance\n  }\n}\n\nconst a = new Account()\na.deposit(50)\nconsole.log(a.balance)\na.balance = 1000000\nconsole.log(a.balance)\n```',
    'Private fields must be declared in the class body (`#balance = 0` or just `#balance`) before use. Trying to use `a.#balance` outside the class is a `SyntaxError`, so the mistake is caught before the code even runs.',
    'Methods can be private too: `#check(amount) { … }` is a helper for the class\'s own methods, hidden from everyone else.',
    'A private field plus a getter (and no setter) gives a value the world can read but not change. That is the cleaner version of the `_age` habit from the getters stage.',
    '```\nclass Player {\n  #lives = 3\n  #log = []\n\n  #record(event) {\n    this.#log.push(event)\n  }\n  hit() {\n    this.#lives--\n    this.#record("hit")\n  }\n  get lives() {\n    return this.#lives\n  }\n  get history() {\n    return [...this.#log]\n  }\n}\n\nconst p = new Player()\np.hit()\nconsole.log(p.lives, p.history, p)\n```',
    'Notice that `console.log(p)` doesn\'t show private fields, and `history` hands out a *copy* of the log, so outside code can\'t change the real one.',
  ],
  sandboxCode: 'class Account {\n  #balance = 0\n  deposit(amount) {\n    this.#balance += amount\n  }\n  get balance() {\n    return this.#balance\n  }\n}\nconst a = new Account()\na.deposit(50)\na.balance = 999\nconsole.log(a.balance, a)',
  sandboxSnippets: [
    snippet('Outside is an error', '// This shows an error: #secret is private\nclass Safe {\n  #secret = "1234"\n}\nconst s = new Safe()\nconsole.log(s.#secret)'),
    snippet('A private method', 'class Order {\n  #items = []\n  #check(qty) {\n    if (qty < 1) throw new RangeError("qty must be 1 or more")\n  }\n  add(name, qty) {\n    this.#check(qty)\n    this.#items.push({ name, qty })\n  }\n  get count() {\n    return this.#items.length\n  }\n}\nconst o = new Order()\no.add("tea", 2)\nconsole.log(o.count)'),
    snippet('Hand out copies', 'class Team {\n  #members = ["Ana"]\n  get members() {\n    return [...this.#members]\n  }\n}\nconst t = new Team()\nt.members.push("Hacker")\nconsole.log(t.members)'),
  ],
  readMore: MDN('Web/JavaScript/Reference/Classes/Private_properties', 'MDN: Private properties'),
  challenges: [
    task('easy', 'Make it private', {
      prompt: 'Change `Counter` so `count` is a private field `#count`, with a getter `count` to read it.',
      starter: 'class Counter {\n  count = 0\n  add() {\n    this.count++\n  }\n}\n',
      hint: '`#count = 0`, `this.#count++`, and `get count() { return this.#count }`.',
      solution: 'class Counter {\n  #count = 0\n  add() {\n    this.#count++\n  }\n  get count() {\n    return this.#count\n  }\n}',
      tests: [['Counts', '(() => { const c = new Counter(); c.add(); c.add(); return c.count === 2 })()'], ['Can\'t be set', '(() => { const c = new Counter(); try { c.count = 99 } catch {} return c.count === 0 })()'], ['Uses #count', '_cq_code.includes("#count")']],
    }),
    task('easy', 'A safe balance', {
      prompt: 'Write a class `Account` with a private `#balance` (0), `deposit(n)`, and a getter `balance`.',
      hint: 'Declare `#balance = 0` in the class body.',
      solution: 'class Account {\n  #balance = 0\n  deposit(n) {\n    this.#balance += n\n  }\n  get balance() {\n    return this.#balance\n  }\n}',
      tests: [['Deposits', '(() => { const a = new Account(); a.deposit(30); a.deposit(20); return a.balance === 50 })()'], ['Hidden', 'JSON.stringify(new Account()) === "{}"']],
    }),
    task('easy', 'From the constructor', {
      prompt: 'Write a class `Secret` whose constructor takes a `code` and keeps it in `#code`, with a method `check(guess)` returning whether they match.',
      hint: 'Declare `#code`, then `this.#code = code` in the constructor.',
      solution: 'class Secret {\n  #code\n  constructor(code) {\n    this.#code = code\n  }\n  check(guess) {\n    return guess === this.#code\n  }\n}',
      tests: [['Right', is('new Secret("1234").check("1234")', true)], ['Wrong', is('new Secret("1234").check("0000")', false)], ['Hidden', is('new Secret("1234").code', undefined)]],
    }),
    task('medium', 'Rules on the way in', {
      prompt: 'Give `Account` a `withdraw(n)` that throws an `Error("Not enough money")` when `n` is more than the balance, and a `deposit(n)` that throws a `RangeError` for `n` of 0 or less.',
      starter: 'class Account {\n  #balance = 0\n  get balance() {\n    return this.#balance\n  }\n}\n',
      hint: 'Guard clauses, then change `this.#balance`.',
      solution: 'class Account {\n  #balance = 0\n  deposit(n) {\n    if (n <= 0) throw new RangeError("Deposit must be positive")\n    this.#balance += n\n  }\n  withdraw(n) {\n    if (n > this.#balance) throw new Error("Not enough money")\n    this.#balance -= n\n  }\n  get balance() {\n    return this.#balance\n  }\n}',
      tests: [['Works', '(() => { const a = new Account(); a.deposit(50); a.withdraw(20); return a.balance === 30 })()'], ['Too much', throwsWhen('new Account().withdraw(1)', 'Not enough money')], ['Bad deposit', throwsWhen('new Account().deposit(0)', 'RangeError')]],
    }),
    task('medium', 'A private helper', {
      prompt: 'Write a class `Basket` with a private `#items` array, a private method `#find(name)`, and `add(name)`: if the item is there, add 1 to its `qty`, else push `{ name, qty: 1 }`. A getter `items` returns a copy.',
      hint: '`#find(name) { return this.#items.find((i) => i.name === name) }`.',
      solution: 'class Basket {\n  #items = []\n  #find(name) {\n    return this.#items.find((i) => i.name === name)\n  }\n  add(name) {\n    const item = this.#find(name)\n    if (item) item.qty++\n    else this.#items.push({ name, qty: 1 })\n  }\n  get items() {\n    return this.#items.map((i) => ({ ...i }))\n  }\n}',
      tests: [['Adds', '(() => { const b = new Basket(); b.add("tea"); b.add("tea"); b.add("jam"); return JSON.stringify(b.items) === JSON.stringify([{ name: "tea", qty: 2 }, { name: "jam", qty: 1 }]) })()'], ['A copy', '(() => { const b = new Basket(); b.add("x"); b.items[0].qty = 99; b.items.push({}); return b.items.length === 1 && b.items[0].qty === 1 })()'], ['Private helper', '_cq_code.includes("#find(")']],
    }),
    task('medium', 'Read but not write', {
      prompt: 'Write a class `Person` whose constructor takes `name` and `born` (a year), both private, with getters `name` and `age` (the age in `2026`).',
      hint: '`get age() { return 2026 - this.#born }`.',
      solution: 'class Person {\n  #name\n  #born\n  constructor(name, born) {\n    this.#name = name\n    this.#born = born\n  }\n  get name() {\n    return this.#name\n  }\n  get age() {\n    return 2026 - this.#born\n  }\n}',
      tests: [['Reads', '(() => { const p = new Person("Ada", 1990); return p.name === "Ada" && p.age === 36 })()'], ['Can\'t change', '(() => { const p = new Person("Ada", 1990); try { p.age = 5 } catch {} return p.age === 36 })()']],
    }),
    task('hard', 'A log you can\'t edit', {
      prompt: 'Write a class `AuditLog` with a private `#entries` array, `record(text)` (adds `N. text`, numbered from 1), and a getter `entries` returning a copy.',
      hint: 'Use `this.#entries.length + 1` for the number.',
      solution: 'class AuditLog {\n  #entries = []\n  record(text) {\n    this.#entries.push(`${this.#entries.length + 1}. ${text}`)\n  }\n  get entries() {\n    return [...this.#entries]\n  }\n}',
      tests: [['Records', '(() => { const l = new AuditLog(); l.record("login"); l.record("logout"); return JSON.stringify(l.entries) === JSON.stringify(["1. login", "2. logout"]) })()'], ['Copy', '(() => { const l = new AuditLog(); l.record("a"); l.entries.length = 0; return l.entries.length === 1 })()']],
    }),
    task('hard', 'Limited tries', {
      prompt: 'Write a class `Lock` with a private code and a private count of wrong tries. `open(guess)` returns `"open"` or `"wrong"`, and once there have been 3 wrong tries it always returns `"locked"`. A getter `triesLeft` says how many wrong tries are left.',
      hint: 'Check "locked" first; count wrong guesses.',
      solution: 'class Lock {\n  #code\n  #wrong = 0\n  constructor(code) {\n    this.#code = code\n  }\n  open(guess) {\n    if (this.#wrong >= 3) return "locked"\n    if (guess === this.#code) return "open"\n    this.#wrong++\n    return "wrong"\n  }\n  get triesLeft() {\n    return 3 - this.#wrong\n  }\n}',
      tests: [['Opens', is('new Lock("42").open("42")', 'open')], ['Locks', '(() => { const l = new Lock("42"); l.open("1"); l.open("2"); const left = l.triesLeft; l.open("3"); return left === 1 && l.open("42") === "locked" && l.triesLeft === 0 })()']],
    }),
    task('expert', 'A bounded counter', {
      prompt: 'Write a class `Score` with private `#value`, `#min` and `#max` (from the constructor, `#value` starting at `min`). `add(n)` changes the value but keeps it between min and max (clamped). A getter `value`, and a static `between(a, b)` factory making `new Score(a, b)`.',
      hint: 'In `add`: `this.#value = Math.min(Math.max(this.#value + n, this.#min), this.#max)`.',
      solution: 'class Score {\n  #value\n  #min\n  #max\n  constructor(min, max) {\n    this.#min = min\n    this.#max = max\n    this.#value = min\n  }\n  static between(a, b) {\n    return new Score(a, b)\n  }\n  add(n) {\n    this.#value = Math.min(Math.max(this.#value + n, this.#min), this.#max)\n    return this\n  }\n  get value() {\n    return this.#value\n  }\n}',
      tests: [['Clamps', '(() => { const s = Score.between(0, 10); s.add(7).add(7); return s.value === 10 })()'], ['Low end', '(() => { const s = Score.between(0, 10); s.add(-5); return s.value === 0 })()'], ['Factory', 'Score.between(1, 2) instanceof Score']],
    }),
    task('expert', 'An undo stack', {
      prompt: 'Write a class `Editor` with a private `#text` (`""`) and a private `#history`. `type(s)` adds `s` to the end; `undo()` puts the text back to how it was before the last `type` (does nothing if there is nothing to undo). A getter `text`.',
      hint: 'Before changing `#text` in `type`, push its old value onto `#history`; `undo` pops it back.',
      solution: 'class Editor {\n  #text = ""\n  #history = []\n  type(s) {\n    this.#history.push(this.#text)\n    this.#text += s\n  }\n  undo() {\n    if (this.#history.length > 0) this.#text = this.#history.pop()\n  }\n  get text() {\n    return this.#text\n  }\n}',
      tests: [['Types', '(() => { const e = new Editor(); e.type("Hello"); e.type(" world"); return e.text === "Hello world" })()'], ['Undoes', '(() => { const e = new Editor(); e.type("a"); e.type("b"); e.undo(); const one = e.text; e.undo(); e.undo(); return one === "a" && e.text === "" })()']],
    }),
  ],
  questions: [
    mc('What makes a class field private?', ['A `#` at the start of its name', 'An `_` at the start', 'The word `private`', 'Putting it in the constructor'], 0, '#balance.'),
    mc('What happens with `account.#balance` outside the class?', ['A SyntaxError', 'It gives undefined', 'It works', 'It gives 0'], 0, 'Caught before the code runs.', { code: '// This shows an error\nclass A {\n  #b = 1\n}\nconsole.log(new A().#b)', error: 'SyntaxError' }),
    mc('Why make data private?', ['So it only changes through methods that check the rules', 'To make it faster', 'To save memory', 'To show it in console.log'], 0, 'Protect the object\'s state.'),
    mc('Does `console.log(obj)` show private fields?', ['No', 'Yes', 'Only numbers', 'Only with a getter'], 0, 'They are hidden.', { code: 'class A {\n  #secret = 1\n  open = 2\n}\nconsole.log(new A())', output: 'A { open: 2 }' }),
    mc('How do you let people read a private value but not change it?', ['A getter and no setter', 'A setter and no getter', 'A static field', 'You can\'t'], 0, 'get value() { return this.#value }'),
    mc('Why return a copy, like `[...this.#items]`, from a getter?', ['So outside code can\'t change the real array', 'Copies are faster', 'Getters must return copies', 'To sort it'], 0, 'Otherwise push on it changes yours.'),
    mc('Where must a private field be declared?', ['In the class body, like `#count = 0`', 'Anywhere', 'Only in the constructor', 'Outside the class'], 0, 'Declare before use.'),
    mc('Can a method be private?', ['Yes: `#helper() { … }`', 'No', 'Only static ones', 'Only getters'], 0, 'Called as this.#helper().'),
    qShort('Which character starts the name of a private field?', '#', '#balance'),
  ],
})
