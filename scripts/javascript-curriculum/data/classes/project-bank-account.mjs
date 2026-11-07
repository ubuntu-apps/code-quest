// Classes side quest (easy): A bank account. Lesson, Try-it snippets, challenges and quiz.
import { is, makeProject, mc, same, snippet, task, throwsWhen } from '../_builders.mjs'

export default makeProject('easy', {
  id: 'proj_bank_account',
  title: 'A bank account',
  paragraphs: [
    'Build the kind of class every banking app has at its heart: an account that keeps its balance safe and remembers what happened.',
    '- The balance is **private**, readable through a getter.\n- `deposit` and `withdraw` check their amounts and throw for bad ones.\n- Every change is recorded in a history, and `statement()` prints it.',
    '```text\nKim\'s account\n+ $100.00\n- $30.00\n+ $12.50\nBalance: $82.50\n```',
  ],
  sandboxCode: 'class Account {\n  #balance = 0\n  deposit(n) {\n    this.#balance += n\n  }\n  get balance() {\n    return this.#balance\n  }\n}\nconst a = new Account()\na.deposit(100)\nconsole.log(a.balance)',
  sandboxSnippets: [
    snippet('Money text', 'const money = (n) => `$${n.toFixed(2)}`\nconsole.log(money(12.5), money(100))'),
  ],
  challenges: [
    task('easy', 'The account', {
      prompt: 'Write a class `Account` whose constructor takes `owner`, with a private `#balance` of 0 and a getter `balance`.',
      hint: '`#balance = 0` in the class body; `get balance() { return this.#balance }`.',
      solution: 'class Account {\n  #balance = 0\n  constructor(owner) {\n    this.owner = owner\n  }\n  get balance() {\n    return this.#balance\n  }\n}',
      tests: [['Starts at 0', is('new Account("Kim").balance', 0)], ['Owner', is('new Account("Kim").owner', 'Kim')], ['Private', 'JSON.stringify(new Account("Kim")) === \'{"owner":"Kim"}\'']],
    }),
    task('easy', 'Deposit', {
      prompt: 'Add `deposit(amount)`, which throws a `RangeError("Deposit must be more than 0")` for 0 or less, else adds it.',
      starter: 'class Account {\n  #balance = 0\n  constructor(owner) {\n    this.owner = owner\n  }\n  get balance() {\n    return this.#balance\n  }\n}\n',
      hint: 'A guard clause, then `this.#balance += amount`.',
      solution: 'class Account {\n  #balance = 0\n  constructor(owner) {\n    this.owner = owner\n  }\n  deposit(amount) {\n    if (amount <= 0) throw new RangeError("Deposit must be more than 0")\n    this.#balance += amount\n  }\n  get balance() {\n    return this.#balance\n  }\n}',
      tests: [['Deposits', '(() => { const a = new Account("Kim"); a.deposit(50); a.deposit(25); return a.balance === 75 })()'], ['Bad amount', throwsWhen('new Account("Kim").deposit(-5)', 'RangeError: Deposit must be more than 0')]],
    }),
    task('medium', 'Withdraw', {
      prompt: 'Add `withdraw(amount)`: throw a `RangeError` for 0 or less, an `Error("Not enough money")` for more than the balance, else take it off.',
      starter: 'class Account {\n  #balance = 0\n  constructor(owner) {\n    this.owner = owner\n  }\n  deposit(amount) {\n    if (amount <= 0) throw new RangeError("Deposit must be more than 0")\n    this.#balance += amount\n  }\n  get balance() {\n    return this.#balance\n  }\n}\n',
      hint: 'Two guard clauses.',
      solution: 'class Account {\n  #balance = 0\n  constructor(owner) {\n    this.owner = owner\n  }\n  deposit(amount) {\n    if (amount <= 0) throw new RangeError("Deposit must be more than 0")\n    this.#balance += amount\n  }\n  withdraw(amount) {\n    if (amount <= 0) throw new RangeError("Withdrawal must be more than 0")\n    if (amount > this.#balance) throw new Error("Not enough money")\n    this.#balance -= amount\n  }\n  get balance() {\n    return this.#balance\n  }\n}',
      tests: [['Withdraws', '(() => { const a = new Account("Kim"); a.deposit(100); a.withdraw(30); return a.balance === 70 })()'], ['Too much', '(() => { const a = new Account("Kim"); a.deposit(10); try { a.withdraw(20) } catch (e) { return e.message === "Not enough money" && a.balance === 10 } return false })()'], ['Bad amount', throwsWhen('new Account("Kim").withdraw(0)', 'RangeError')]],
    }),
    task('medium', 'History', {
      prompt: 'Keep a private `#history` of `{ type, amount }` (`type` is `"deposit"` or `"withdraw"`), added on each successful change. A getter `history` returns a copy.',
      starter: 'class Account {\n  #balance = 0\n  constructor(owner) {\n    this.owner = owner\n  }\n  deposit(amount) {\n    if (amount <= 0) throw new RangeError("Deposit must be more than 0")\n    this.#balance += amount\n  }\n  withdraw(amount) {\n    if (amount <= 0) throw new RangeError("Withdrawal must be more than 0")\n    if (amount > this.#balance) throw new Error("Not enough money")\n    this.#balance -= amount\n  }\n  get balance() {\n    return this.#balance\n  }\n}\n',
      hint: 'Push to `this.#history` after the balance changes; `get history() { return this.#history.map((h) => ({ ...h })) }`.',
      solution: 'class Account {\n  #balance = 0\n  #history = []\n  constructor(owner) {\n    this.owner = owner\n  }\n  deposit(amount) {\n    if (amount <= 0) throw new RangeError("Deposit must be more than 0")\n    this.#balance += amount\n    this.#history.push({ type: "deposit", amount })\n  }\n  withdraw(amount) {\n    if (amount <= 0) throw new RangeError("Withdrawal must be more than 0")\n    if (amount > this.#balance) throw new Error("Not enough money")\n    this.#balance -= amount\n    this.#history.push({ type: "withdraw", amount })\n  }\n  get balance() {\n    return this.#balance\n  }\n  get history() {\n    return this.#history.map((h) => ({ ...h }))\n  }\n}',
      tests: [['Records', '(() => { const a = new Account("Kim"); a.deposit(100); a.withdraw(30); try { a.withdraw(999) } catch {} return JSON.stringify(a.history) === JSON.stringify([{ type: "deposit", amount: 100 }, { type: "withdraw", amount: 30 }]) })()'], ['A copy', '(() => { const a = new Account("Kim"); a.deposit(1); a.history.push({}); return a.history.length === 1 })()']],
    }),
    task('hard', 'The statement', {
      prompt: 'Add `statement()`, returning the lines from the lesson: `OWNER\'s account`, then `+ $N` or `- $N` for each change (2 decimal places), then `Balance: $N`.',
      starter: 'class Account {\n  #balance = 0\n  #history = []\n  constructor(owner) {\n    this.owner = owner\n  }\n  deposit(amount) {\n    this.#balance += amount\n    this.#history.push({ type: "deposit", amount })\n  }\n  withdraw(amount) {\n    this.#balance -= amount\n    this.#history.push({ type: "withdraw", amount })\n  }\n}\n',
      hint: 'Build an array: the title, `this.#history.map(...)`, then the balance line.',
      solution: 'class Account {\n  #balance = 0\n  #history = []\n  constructor(owner) {\n    this.owner = owner\n  }\n  deposit(amount) {\n    this.#balance += amount\n    this.#history.push({ type: "deposit", amount })\n  }\n  withdraw(amount) {\n    this.#balance -= amount\n    this.#history.push({ type: "withdraw", amount })\n  }\n  statement() {\n    const money = (n) => `$${n.toFixed(2)}`\n    return [\n      `${this.owner}\'s account`,\n      ...this.#history.map((h) => `${h.type === "deposit" ? "+" : "-"} ${money(h.amount)}`),\n      `Balance: ${money(this.#balance)}`,\n    ]\n  }\n}',
      tests: [['Statement', '(() => { const a = new Account("Kim"); a.deposit(100); a.withdraw(30); a.deposit(12.5); return JSON.stringify(a.statement()) === JSON.stringify(["Kim\'s account", "+ $100.00", "- $30.00", "+ $12.50", "Balance: $82.50"]) })()'], ['New account', same('new Account("Al").statement()', '["Al\'s account", "Balance: $0.00"]')]],
    }),
    task('expert', 'Transfers', {
      prompt: 'Add a static `transfer(from, to, amount)`, which withdraws from one account and deposits into the other. If the withdrawal throws, nothing should change and the error should go up.',
      starter: 'class Account {\n  #balance = 0\n  constructor(owner) {\n    this.owner = owner\n  }\n  deposit(amount) {\n    if (amount <= 0) throw new RangeError("Deposit must be more than 0")\n    this.#balance += amount\n  }\n  withdraw(amount) {\n    if (amount <= 0) throw new RangeError("Withdrawal must be more than 0")\n    if (amount > this.#balance) throw new Error("Not enough money")\n    this.#balance -= amount\n  }\n  get balance() {\n    return this.#balance\n  }\n}\n',
      hint: 'Withdraw first: if it throws, the deposit line never runs.',
      solution: 'class Account {\n  #balance = 0\n  constructor(owner) {\n    this.owner = owner\n  }\n  deposit(amount) {\n    if (amount <= 0) throw new RangeError("Deposit must be more than 0")\n    this.#balance += amount\n  }\n  withdraw(amount) {\n    if (amount <= 0) throw new RangeError("Withdrawal must be more than 0")\n    if (amount > this.#balance) throw new Error("Not enough money")\n    this.#balance -= amount\n  }\n  get balance() {\n    return this.#balance\n  }\n  static transfer(from, to, amount) {\n    from.withdraw(amount)\n    to.deposit(amount)\n  }\n}',
      tests: [['Moves money', '(() => { const a = new Account("A"); const b = new Account("B"); a.deposit(50); Account.transfer(a, b, 20); return a.balance === 30 && b.balance === 20 })()'], ['Nothing changes on failure', '(() => { const a = new Account("A"); const b = new Account("B"); a.deposit(5); try { Account.transfer(a, b, 20) } catch (e) { return e.message === "Not enough money" && a.balance === 5 && b.balance === 0 } return false })()']],
    }),
  ],
  questions: [
    mc('Why is the balance private?', ['So it can only change through deposit and withdraw, which check the rules', 'To make it faster', 'So it can\'t be read', 'Banks require #'], 0, 'Protect the state.'),
    mc('How do outside users read the balance?', ['Through the `balance` getter', 'As `account.#balance`', 'They can\'t', 'With `account.getBalance`'], 0, 'A getter with no setter.'),
    mc('Why record history only after a change succeeds?', ['A failed withdrawal didn\'t happen, so it shouldn\'t be listed', 'History is slow', 'It must be first', 'It doesn\'t matter'], 0, 'The record matches reality.'),
    mc('In `transfer`, why withdraw before depositing?', ['If the withdrawal fails, the deposit never happens', 'Deposits are slower', 'It is alphabetical', 'It doesn\'t matter'], 0, 'No money appears from nowhere.'),
    mc('Why is `transfer` static?', ['It works on two accounts, not one', 'Static methods are faster', 'It is private', 'Instances can\'t call methods'], 0, 'Account.transfer(a, b, n).'),
    mc('What does `(82.5).toFixed(2)` give?', ['"82.50"', '82.5', '"82.5"', '82.50'], 0, 'Text with 2 decimal places.', { code: 'console.log((82.5).toFixed(2))', output: '82.50' }),
  ],
})
