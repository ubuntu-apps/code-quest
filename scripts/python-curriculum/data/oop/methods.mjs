// Classes and objects topic: Methods. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "methods",
  title: "Methods",
  paragraphs: [
    "A **method** is a function written inside a class. You call it on an object with a dot, like `\"hi\".upper()`, and it works with that object's attributes. This is what makes classes useful: the data and the operations that keep it correct live in one place.",
    "```\nclass Account:\n    def __init__(self, owner, balance=0):\n        self.owner = owner\n        self.balance = balance\n\n    def deposit(self, amount):\n        self.balance += amount\n\n    def describe(self):\n        return f\"{self.owner} has {self.balance}\"\n\nacc = Account(\"Ana\")\nacc.deposit(50)\nacc.deposit(25)\nprint(acc.describe())   # Ana has 75\n```",
    "Every method's first parameter is `self`. When you write `acc.deposit(50)`, Python calls `Account.deposit(acc, 50)`: the object before the dot becomes `self`, and your arguments fill the other parameters. Inside the method, `self.balance` is that object's balance, so each account changes only its own.",
    "Some methods **change** the object, like `deposit`, and usually return nothing. Others **answer a question** about it, like `describe`, and return a value without changing anything. Keeping the two kinds apart makes a class easy to use. A method can also call the object's other methods through `self`:",
    "```\nclass Account:\n    def __init__(self, owner, balance=0):\n        self.owner = owner\n        self.balance = balance\n\n    def can_afford(self, amount):\n        return amount <= self.balance\n\n    def withdraw(self, amount):\n        if not self.can_afford(amount):\n            raise ValueError(\"Not enough money\")\n        self.balance -= amount\n\nacc = Account(\"Ben\", 100)\nacc.withdraw(30)\nprint(acc.balance)        # 70\nprint(acc.can_afford(80)) # False\n```",
    "Two mistakes come up a lot. Forgetting the `self` parameter, `def deposit(amount):`, gives `TypeError: Account.deposit() takes 1 positional argument but 2 were given`, because Python passes the object as well as your argument. Forgetting `self.` inside a method, `balance += amount`, refers to a local variable that doesn't exist and raises an error.",
    "An object can hold a list or dict as an attribute. Create it in `__init__`, so every object gets a fresh one of its own:",
    "```\nclass Basket:\n    def __init__(self):\n        self.items = []\n\n    def add(self, name, price):\n        self.items.append((name, price))\n\n    def total(self):\n        return sum(price for name, price in self.items)\n\nmine = Basket()\nmine.add(\"tea\", 2.5)\nmine.add(\"cake\", 4.0)\nyours = Basket()\nprint(mine.total(), yours.total())   # 6.5 0\n```",
  ],
  sandboxCode: "class Account:\n    def __init__(self, owner, balance=0):\n        self.owner = owner\n        self.balance = balance\n\n    def deposit(self, amount):\n        self.balance += amount\n\n    def describe(self):\n        return f\"{self.owner} has {self.balance}\"\n\nacc = Account(\"Ana\")\nfor amount in [20, 35, 10]:\n    acc.deposit(amount)\nprint(acc.describe())",
  sandboxSnippets: [
    snippet("Call a method", "class Account:\n    def __init__(self, owner, balance=0):\n        self.owner = owner\n        self.balance = balance\n\n    def deposit(self, amount):\n        self.balance += amount\n\n    def describe(self):\n        return f\"{self.owner} has {self.balance}\"\n\na = Account(\"Cy\", 5)\na.deposit(10)\nprint(a.describe())"),
    snippet("The same call, spelled out", "class Account:\n    def __init__(self, owner, balance=0):\n        self.owner = owner\n        self.balance = balance\n\n    def deposit(self, amount):\n        self.balance += amount\n\n    def describe(self):\n        return f\"{self.owner} has {self.balance}\"\n\na = Account(\"Dee\")\nAccount.deposit(a, 40)\nprint(a.balance)"),
    snippet("Forgetting self", "class Broken:\n    def hello():\n        return \"hi\"\n\ntry:\n    Broken().hello()\nexcept TypeError as e:\n    print(\"TypeError:\", e)"),
    snippet("A list per object", "class Basket:\n    def __init__(self):\n        self.items = []\n\na, b = Basket(), Basket()\na.items.append(\"tea\")\nprint(a.items, b.items)"),
  ],
  readMore: { label: "Python tutorial: Method objects", url: "https://docs.python.org/3/tutorial/classes.html#method-objects", source: "Python docs" },
  challenges: [
    task("easy", "Say hello", {
      prompt: "Define a class `Person` with a `name`, and a method `greet()` that returns `Hi, I'm <name>`.",
      hint: "Inside the method, use `self.name`.",
      solution: "class Person:\n    def __init__(self, name):\n        self.name = name\n\n    def greet(self):\n        return f\"Hi, I'm {self.name}\"",
      tests: [
        ["Ana", "Person(\"Ana\").greet() == \"Hi, I'm Ana\""],
        ["Ben", "Person(\"Ben\").greet() == \"Hi, I'm Ben\""],
      ],
    }),
    task("easy", "Area and perimeter", {
      prompt: "Define `Rectangle` with a `width` and `height`, and methods `area()` and `perimeter()`.",
      hint: "`return self.width * self.height`, and `2 * (self.width + self.height)`.",
      solution: "class Rectangle:\n    def __init__(self, width, height):\n        self.width = width\n        self.height = height\n\n    def area(self):\n        return self.width * self.height\n\n    def perimeter(self):\n        return 2 * (self.width + self.height)",
      tests: [
        ["area", "Rectangle(3, 4).area() == 12"],
        ["perimeter", "Rectangle(3, 4).perimeter() == 14"],
      ],
    }),
    task("easy", "Count to three", {
      prompt: "Create a `Counter` called `c`, call its `increment` method three times, and set `value` to `c.count`.",
      starter: "class Counter:\n    def __init__(self):\n        self.count = 0\n\n    def increment(self):\n        self.count += 1\n",
      hint: "`c = Counter()`, then `c.increment()` three times.",
      solution: "class Counter:\n    def __init__(self):\n        self.count = 0\n\n    def increment(self):\n        self.count += 1\n\nc = Counter()\nc.increment()\nc.increment()\nc.increment()\nvalue = c.count",
      tests: [
        ["value is 3", "value == 3 and c.count == 3"],
        ["Used the method", "_cq_source.count(\"increment()\") >= 1"],
      ],
    }),
    task("medium", "Switch it on", {
      prompt: "Define `Lamp`, which starts with `is_on` set to `False`, and methods `switch_on()`, `switch_off()` and `toggle()` (which flips it).",
      hint: "`toggle` sets `self.is_on = not self.is_on`.",
      solution: "class Lamp:\n    def __init__(self):\n        self.is_on = False\n\n    def switch_on(self):\n        self.is_on = True\n\n    def switch_off(self):\n        self.is_on = False\n\n    def toggle(self):\n        self.is_on = not self.is_on",
      tests: [
        ["Starts off", "Lamp().is_on is False"],
        ["On and off", "(lambda l: (l.switch_on(), l.is_on, l.switch_off(), l.is_on))(Lamp())[1::2] == (True, False)"],
        ["Toggle", "(lambda l: (l.toggle(), l.is_on, l.toggle(), l.is_on))(Lamp())[1::2] == (True, False)"],
      ],
    }),
    task("medium", "The missing self", {
      prompt: "Calling `deposit` crashes with a `TypeError`. Fix the method.",
      starter: "class Account:\n    def __init__(self, balance=0):\n        self.balance = balance\n\n    def deposit(amount):\n        self.balance += amount\n",
      hint: "Every method needs `self` as its first parameter.",
      solution: "class Account:\n    def __init__(self, balance=0):\n        self.balance = balance\n\n    def deposit(self, amount):\n        self.balance += amount",
      tests: [
        ["deposit works", "(lambda a: (a.deposit(30), a.deposit(5), a.balance)[2])(Account()) == 35"],
      ],
    }),
    task("medium", "A shopping basket", {
      prompt: "Define `Basket` with a list of `(name, price)` items, and methods `add(name, price)`, `total()` and `count()`. Each basket must have its own list.",
      hint: "Create `self.items = []` in `__init__`.",
      solution: "class Basket:\n    def __init__(self):\n        self.items = []\n\n    def add(self, name, price):\n        self.items.append((name, price))\n\n    def total(self):\n        return sum(price for name, price in self.items)\n\n    def count(self):\n        return len(self.items)",
      tests: [
        ["Adds up", "(lambda b: (b.add(\"tea\", 2.5), b.add(\"cake\", 4.0), b.total(), b.count())[2:])(Basket()) == (6.5, 2)"],
        ["Separate baskets", "(lambda a, b: (a.add(\"x\", 1), b.count())[1])(Basket(), Basket()) == 0"],
      ],
    }),
    task("hard", "Safe withdrawals", {
      prompt: "Define `Account` with a `balance` (default 0) and methods `deposit(amount)`, `can_afford(amount)` and `withdraw(amount)`, which raises `ValueError(\"Not enough money\")` if `can_afford` says no.",
      hint: "In `withdraw`, call `self.can_afford(amount)` before changing the balance.",
      solution: "class Account:\n    def __init__(self, balance=0):\n        self.balance = balance\n\n    def deposit(self, amount):\n        self.balance += amount\n\n    def can_afford(self, amount):\n        return amount <= self.balance\n\n    def withdraw(self, amount):\n        if not self.can_afford(amount):\n            raise ValueError(\"Not enough money\")\n        self.balance -= amount",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["Withdraw", "(lambda a: (a.withdraw(30), a.balance)[1])(Account(100)) == 70"],
        ["Too much", "(lambda a: (_error(a.withdraw, 80), a.balance))(Account(50)) == (\"ValueError: Not enough money\", 50)"],
        ["can_afford", "Account(10).can_afford(10) is True and Account(10).can_afford(11) is False"],
      ],
    }),
    task("hard", "Temperature log", {
      prompt: "Define `TempLog` with methods `add(temp)`, `average()` (rounded to 1 place, or `None` if empty) and `highest()` (or `None` if empty).",
      hint: "Keep `self.temps = []`. `max(self.temps)` and `round(sum(...) / len(...), 1)`.",
      solution: "class TempLog:\n    def __init__(self):\n        self.temps = []\n\n    def add(self, temp):\n        self.temps.append(temp)\n\n    def average(self):\n        if not self.temps:\n            return None\n        return round(sum(self.temps) / len(self.temps), 1)\n\n    def highest(self):\n        if not self.temps:\n            return None\n        return max(self.temps)",
      tests: [
        ["Three readings", "(lambda t: ([t.add(x) for x in (18, 21, 23)], t.average(), t.highest())[1:])(TempLog()) == (20.7, 23)"],
        ["Empty", "TempLog().average() is None and TempLog().highest() is None"],
      ],
    }),
    task("expert", "Undo", {
      prompt: "Define `Editor` with a `text` attribute (starting `\"\"`) and methods `write(words)`, which adds to the text, and `undo()`, which removes what the most recent `write` added (and does nothing if there's nothing to undo).",
      hint: "Keep a list of earlier texts. Before each `write`, append the current text; `undo` pops the last one back.",
      solution: "class Editor:\n    def __init__(self):\n        self.text = \"\"\n        self.history = []\n\n    def write(self, words):\n        self.history.append(self.text)\n        self.text += words\n\n    def undo(self):\n        if self.history:\n            self.text = self.history.pop()",
      tests: [
        ["Typing", "(lambda e: (e.write(\"Hello\"), e.write(\", world\"), e.text)[2])(Editor()) == \"Hello, world\""],
        ["Undo twice", "(lambda e: (e.write(\"a\"), e.write(\"b\"), e.write(\"c\"), e.undo(), e.undo(), e.text)[5])(Editor()) == \"a\""],
        ["Nothing to undo", "(lambda e: (e.undo(), e.text)[1])(Editor()) == \"\""],
      ],
    }),
    task("expert", "Lap timer", {
      prompt: "Define `Timer` with `start(t)` and `stop(t)` (times in seconds), adding each run to a total, plus `laps` (a list of each run's length) and `total()`. Calling `stop` without a `start`, or `start` twice in a row, raises `RuntimeError`.",
      hint: "Store `self.started = None`. `start` sets it (raising if it's already set); `stop` works out `t - self.started`, records the lap and sets it back to `None`.",
      solution: "class Timer:\n    def __init__(self):\n        self.started = None\n        self.laps = []\n\n    def start(self, t):\n        if self.started is not None:\n            raise RuntimeError(\"Already running\")\n        self.started = t\n\n    def stop(self, t):\n        if self.started is None:\n            raise RuntimeError(\"Not running\")\n        self.laps.append(t - self.started)\n        self.started = None\n\n    def total(self):\n        return sum(self.laps)",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\n",
      tests: [
        ["Two laps", "(lambda tm: (tm.start(10), tm.stop(25), tm.start(30), tm.stop(32), tm.laps, tm.total())[4:])(Timer()) == ([15, 2], 17)"],
        ["Stop without start", "_raises(Timer().stop, 5) == \"RuntimeError\""],
        ["Start twice", "(lambda tm: (tm.start(1), _raises(tm.start, 2))[1])(Timer()) == \"RuntimeError\""],
      ],
    }),
  ],
  questions: [
    mc("What is a method?", ["A variable in a class", "A function defined inside a class", "A kind of loop", "A module"], 1),
    mc("`acc.deposit(50)` is the same as which call?", ["`deposit(50)`", "`Account(acc, 50)`", "`Account.deposit(acc, 50)`", "`acc.deposit(acc, 50)`"], 2),
    mc("Inside a method, what is `self.balance`?", ["The balance of the object the method was called on", "A class-wide balance", "A local variable", "A global variable"], 0),
    mc("`def deposit(amount):` in a class, then `acc.deposit(5)`. What happens?", ["It works", "It returns None", "A `NameError`", "A `TypeError`: it takes 1 argument but 2 were given"], 3),
    mc("How can one method use another of the same object?", ["`other_method()`", "`self.other_method()`", "`Class.other_method()`", "It can't"], 1),
    mc("Where should a list attribute like `self.items` be created?", ["In `__init__`, so each object gets its own", "Outside the class", "In each method", "In a global variable"], 0),
    qShort("What is the conventional name of a method's first parameter?", "self"),
    mc("Which kind of method usually returns nothing?", ["One that answers a question", "One that prints", "One that is called first", "One that changes the object"], 3),
    mc("Why put `deposit` and `withdraw` inside the class?", ["So the code that keeps the balance right lives with the balance", "It is faster", "Functions can't change numbers", "To hide the balance"], 0),
  ],
})
