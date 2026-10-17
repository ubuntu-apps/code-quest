// Classes and objects topic: Keeping objects valid. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "encapsulation",
  title: "Keeping objects valid",
  paragraphs: [
    "An object should never get into a state that makes no sense: a bank account with a negative balance, a person aged -5, a product with no name. **Encapsulation** means the object looks after its own data. It checks values when it's created and whenever they change, and the rest of the program goes through its methods instead of changing attributes directly.",
    "```\nclass Account:\n    def __init__(self, owner, balance=0):\n        if not owner.strip():\n            raise ValueError(\"Owner can't be empty\")\n        if balance < 0:\n            raise ValueError(\"Balance can't be negative\")\n        self._owner = owner\n        self._balance = balance\n\n    def deposit(self, amount):\n        if amount <= 0:\n            raise ValueError(\"Deposit must be positive\")\n        self._balance += amount\n\n    def balance(self):\n        return self._balance\n\nacc = Account(\"Ana\", 10)\nacc.deposit(5)\nprint(acc.balance())   # 15\n```",
    "Checking in `__init__` means an invalid object can never exist: if the values are wrong, the object is never made. Raise `ValueError` for a value of the right type that isn't allowed, and `TypeError` for the wrong type altogether. The error stops the mistake where it happens, instead of letting a bad value spread and cause a confusing failure later.",
    "The underscore in `_balance` is a convention meaning \"internal: don't use this from outside the class\". Python doesn't enforce it, and `acc._balance = -100` would still work, but every Python programmer reads it as a warning sign. Outside code calls `acc.balance()` and `acc.deposit(5)`, which keep the rules.",
    "A method that hands out a list or dict should hand out a **copy**. If `history()` returned `self._history` itself, a caller could append to it and change the account's records behind its back. `return list(self._history)` gives them their own list to do what they like with.",
    "```\nclass Account:\n    def __init__(self):\n        self._history = []\n\n    def deposit(self, amount):\n        self._history.append(amount)\n\n    def history(self):\n        return list(self._history)   # a copy\n\nacc = Account()\nacc.deposit(20)\nh = acc.history()\nh.append(1_000_000)                  # changes the copy only\nprint(acc.history())                 # [20]\n```",
    "Two underscores at the start, like `self.__pin`, go one step further: Python renames the attribute to `_Account__pin` behind the scenes (\"name mangling\"), so `acc.__pin` raises `AttributeError`. It exists mainly to stop subclasses clashing with a parent's names, and isn't real security either. A single underscore is the everyday choice.",
    "The payoff comes when the rules change. If accounts may now go 100 into overdraft, you change one check inside the class, and every part of the program that uses accounts follows the new rule.",
  ],
  sandboxCode: "class Thermostat:\n    def __init__(self, target=20):\n        self.set_target(target)\n\n    def set_target(self, value):\n        if not 10 <= value <= 30:\n            raise ValueError(f\"{value} is out of range (10 to 30)\")\n        self._target = value\n\n    def target(self):\n        return self._target\n\nt = Thermostat()\nt.set_target(22.5)\nprint(t.target())\ntry:\n    t.set_target(99)\nexcept ValueError as e:\n    print(\"Refused:\", e)\nprint(t.target())",
  sandboxSnippets: [
    snippet("Refuse a bad value", "class Pet:\n    def __init__(self, name):\n        if not name.strip():\n            raise ValueError(\"Name can't be empty\")\n        self.name = name\n\ntry:\n    Pet(\"  \")\nexcept ValueError as e:\n    print(\"ValueError:\", e)"),
    snippet("Use the methods", "class Account:\n    def __init__(self, owner, balance=0):\n        self._owner = owner\n        self._balance = balance\n\n    def deposit(self, amount):\n        self._balance += amount\n\n    def balance(self):\n        return self._balance\n\nacc = Account(\"Ana\")\nacc.deposit(30)\nprint(acc.balance())"),
    snippet("Hand out a copy", "class Log:\n    def __init__(self):\n        self._lines = [\"started\"]\n    def lines(self):\n        return list(self._lines)\n\nlog = Log()\nlog.lines().append(\"hacked\")\nprint(log.lines())"),
    snippet("Name mangling", "class Vault:\n    def __init__(self):\n        self.__pin = \"1234\"\n\nv = Vault()\nprint(hasattr(v, \"__pin\"), v._Vault__pin)"),
  ],
  readMore: { label: "Python tutorial: Private variables", url: "https://docs.python.org/3/tutorial/classes.html#private-variables", source: "Python docs" },
  challenges: [
    task("easy", "No empty names", {
      prompt: "Make `Pet` refuse an empty or blank name by raising `ValueError(\"Name can't be empty\")`.",
      starter: "class Pet:\n    def __init__(self, name):\n        self.name = name\n",
      hint: "Check `if not name.strip():` before storing it.",
      solution: "class Pet:\n    def __init__(self, name):\n        if not name.strip():\n            raise ValueError(\"Name can't be empty\")\n        self.name = name",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["A real name", "Pet(\"Tom\").name == \"Tom\""],
        ["Empty", "_error(Pet, \"\") == \"ValueError: Name can't be empty\""],
        ["Blank", "_error(Pet, \"   \") == \"ValueError: Name can't be empty\""],
      ],
    }),
    task("easy", "Positive deposits", {
      prompt: "Make `deposit` raise `ValueError(\"Deposit must be positive\")` for an amount of 0 or less, leaving the balance alone.",
      starter: "class Account:\n    def __init__(self, owner, balance=0):\n        self._owner = owner\n        self._balance = balance\n\n    def deposit(self, amount):\n        self._balance += amount\n\n    def balance(self):\n        return self._balance\n",
      hint: "Check `amount <= 0` at the start of `deposit`.",
      solution: "class Account:\n    def __init__(self, owner, balance=0):\n        self._owner = owner\n        self._balance = balance\n\n    def deposit(self, amount):\n        if amount <= 0:\n            raise ValueError(\"Deposit must be positive\")\n        self._balance += amount\n\n    def balance(self):\n        return self._balance\n",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["A good deposit", "(lambda a: (a.deposit(5), a.balance())[1])(Account(\"Ana\")) == 5"],
        ["Refused", "(lambda a: (_error(a.deposit, -5), _error(a.deposit, 0), a.balance()))(Account(\"Ana\", 10)) == (\"ValueError: Deposit must be positive\", \"ValueError: Deposit must be positive\", 10)"],
      ],
    }),
    task("easy", "Through the front door", {
      prompt: "Create an `Account` for Ana called `acc`, deposit 50 twice using its method, and set `shown` to the balance from its `balance()` method. Don't touch `_balance` directly.",
      starter: "class Account:\n    def __init__(self, owner, balance=0):\n        self._owner = owner\n        self._balance = balance\n\n    def deposit(self, amount):\n        self._balance += amount\n\n    def balance(self):\n        return self._balance\n",
      hint: "`acc.deposit(50)` twice, then `shown = acc.balance()`.",
      solution: "class Account:\n    def __init__(self, owner, balance=0):\n        self._owner = owner\n        self._balance = balance\n\n    def deposit(self, amount):\n        self._balance += amount\n\n    def balance(self):\n        return self._balance\n\nacc = Account(\"Ana\")\nacc.deposit(50)\nacc.deposit(50)\nshown = acc.balance()",
      tests: [
        ["shown is 100", "shown == 100"],
        ["Only the methods were used", "_cq_source.count(\"._balance\") == 3"],
      ],
    }),
    task("medium", "A sensible age", {
      prompt: "Make `Person` check its `age`: a non-integer raises `TypeError(\"Age must be a whole number\")`, and an integer outside 0 to 150 raises `ValueError(\"Age must be 0 to 150\")`.",
      starter: "class Person:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n",
      hint: "Check `isinstance(age, int)` first, then the range.",
      solution: "class Person:\n    def __init__(self, name, age):\n        if not isinstance(age, int):\n            raise TypeError(\"Age must be a whole number\")\n        if not 0 <= age <= 150:\n            raise ValueError(\"Age must be 0 to 150\")\n        self.name = name\n        self.age = age",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["Fine", "Person(\"Ana\", 30).age == 30 and Person(\"Baby\", 0).age == 0"],
        ["Wrong type", "_error(Person, \"Ana\", \"30\") == \"TypeError: Age must be a whole number\""],
        ["Out of range", "[_error(Person, \"X\", a) for a in (-1, 151)] == [\"ValueError: Age must be 0 to 150\"] * 2"],
      ],
    }),
    task("medium", "Hand out a copy", {
      prompt: "Anyone can change the account's records through the list `history()` returns. Make it return a copy.",
      starter: "class Account:\n    def __init__(self):\n        self._history = []\n\n    def deposit(self, amount):\n        self._history.append(amount)\n\n    def history(self):\n        return self._history\n",
      hint: "`return list(self._history)`.",
      solution: "class Account:\n    def __init__(self):\n        self._history = []\n\n    def deposit(self, amount):\n        self._history.append(amount)\n\n    def history(self):\n        return list(self._history)",
      tests: [
        ["The records", "(lambda a: (a.deposit(20), a.deposit(5), a.history())[2])(Account()) == [20, 5]"],
        ["Changing the copy changes nothing", "(lambda a: (a.deposit(20), a.history().append(999), a.history())[2])(Account()) == [20]"],
      ],
    }),
    task("medium", "Withdrawal rules", {
      prompt: "Add `withdraw(amount)` to `Account`: it raises `ValueError(\"Amount must be positive\")` for 0 or less, and `ValueError(\"Not enough money\")` if the balance is too low, otherwise takes the money.",
      starter: "class Account:\n    def __init__(self, owner, balance=0):\n        self._owner = owner\n        self._balance = balance\n\n    def deposit(self, amount):\n        self._balance += amount\n\n    def balance(self):\n        return self._balance\n",
      hint: "Two checks, then `self._balance -= amount`.",
      solution: "class Account:\n    def __init__(self, owner, balance=0):\n        self._owner = owner\n        self._balance = balance\n\n    def deposit(self, amount):\n        self._balance += amount\n\n    def balance(self):\n        return self._balance\n\n    def withdraw(self, amount):\n        if amount <= 0:\n            raise ValueError(\"Amount must be positive\")\n        if amount > self._balance:\n            raise ValueError(\"Not enough money\")\n        self._balance -= amount",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["Withdraw", "(lambda a: (a.withdraw(30), a.balance())[1])(Account(\"Ana\", 100)) == 70"],
        ["Too much", "(lambda a: (_error(a.withdraw, 101), a.balance()))(Account(\"Ana\", 100)) == (\"ValueError: Not enough money\", 100)"],
        ["Not positive", "_error(Account(\"Ana\", 100).withdraw, 0) == \"ValueError: Amount must be positive\""],
      ],
    }),
    task("hard", "Thermostat", {
      prompt: "Define `Thermostat` with a target (default 20) that always stays between 10 and 30: `set_target(t)` clamps values outside that range to the nearest limit, `up()` and `down()` move by 0.5 (also clamped), and `target()` returns it.",
      hint: "One private method can do the clamping: `max(10, min(30, value))`. Use it in `__init__` too.",
      solution: "class Thermostat:\n    def __init__(self, target=20):\n        self.set_target(target)\n\n    def set_target(self, value):\n        self._target = max(10, min(30, value))\n\n    def up(self):\n        self.set_target(self._target + 0.5)\n\n    def down(self):\n        self.set_target(self._target - 0.5)\n\n    def target(self):\n        return self._target",
      tests: [
        ["Default", "Thermostat().target() == 20"],
        ["Clamped", "Thermostat(45).target() == 30 and (lambda t: (t.set_target(2), t.target())[1])(Thermostat()) == 10"],
        ["Up and down", "(lambda t: (t.up(), t.up(), t.target())[2])(Thermostat(29.5)) == 30 and (lambda t: (t.down(), t.target())[1])(Thermostat(18)) == 17.5"],
      ],
    }),
    task("hard", "Usernames", {
      prompt: "Define `User(username)` with `rename(new)`, `username()` and `old_names()` (a copy of the earlier names, oldest first). A username must be 3 to 12 letters or digits, or `ValueError(\"Bad username: <name>\")` is raised, also in `__init__`.",
      hint: "A private `_check(name)` method can raise the error; call it in both places. `name.isalnum()` checks letters and digits.",
      solution: "class User:\n    def __init__(self, username):\n        self._check(username)\n        self._username = username\n        self._old = []\n\n    def _check(self, name):\n        if not (3 <= len(name) <= 12 and name.isalnum()):\n            raise ValueError(f\"Bad username: {name}\")\n\n    def rename(self, new):\n        self._check(new)\n        self._old.append(self._username)\n        self._username = new\n\n    def username(self):\n        return self._username\n\n    def old_names(self):\n        return list(self._old)",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["Renaming", "(lambda u: (u.rename(\"ana2\"), u.rename(\"anaB\"), u.username(), u.old_names())[2:])(User(\"ana\")) == (\"anaB\", [\"ana\", \"ana2\"])"],
        ["Bad names", "_error(User, \"a b\") == \"ValueError: Bad username: a b\" and _error(User(\"ana\").rename, \"xy\") == \"ValueError: Bad username: xy\""],
        ["A copy", "(lambda u: (u.rename(\"bob1\"), u.old_names().clear(), u.old_names())[2])(User(\"ana\")) == [\"ana\"]"],
      ],
    }),
    task("expert", "Stock that can't go negative", {
      prompt: "Define `Inventory` with `add(item, qty)`, `remove(item, qty)` (raising `ValueError(\"Not enough <item>\")` without changing anything if there isn't enough), `count(item)` (0 for unknown items) and `remove_many(order)`, which removes a dict of items all together: if any item is short, it raises that error and removes **nothing**.",
      hint: "In `remove_many`, check every item first, and only then remove them all.",
      solution: "class Inventory:\n    def __init__(self):\n        self._stock = {}\n\n    def add(self, item, qty):\n        self._stock[item] = self._stock.get(item, 0) + qty\n\n    def count(self, item):\n        return self._stock.get(item, 0)\n\n    def _check(self, item, qty):\n        if self.count(item) < qty:\n            raise ValueError(f\"Not enough {item}\")\n\n    def remove(self, item, qty):\n        self._check(item, qty)\n        self._stock[item] -= qty\n\n    def remove_many(self, order):\n        for item, qty in order.items():\n            self._check(item, qty)\n        for item, qty in order.items():\n            self._stock[item] -= qty",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["Add and remove", "(lambda i: (i.add(\"apple\", 5), i.add(\"apple\", 3), i.remove(\"apple\", 6), i.count(\"apple\"), i.count(\"pear\"))[3:])(Inventory()) == (2, 0)"],
        ["Not enough", "(lambda i: (i.add(\"pear\", 1), _error(i.remove, \"pear\", 2), i.count(\"pear\"))[1:])(Inventory()) == (\"ValueError: Not enough pear\", 1)"],
        ["All or nothing", "(lambda i: (i.add(\"a\", 5), i.add(\"b\", 1), _error(i.remove_many, {\"a\": 2, \"b\": 3}), i.count(\"a\"), i.remove_many({\"a\": 2, \"b\": 1}), i.count(\"a\"), i.count(\"b\"))[2:4] + (i.count(\"a\"), i.count(\"b\")))(Inventory()) == (\"ValueError: Not enough b\", 5, 3, 0)"],
      ],
    }),
    task("expert", "Closed orders", {
      prompt: "Define `Order` with `add(item, price)`, `total()`, `items()` (a tuple of the item names) and `close()`. After `close()`, `add` raises `RuntimeError(\"Order is closed\")`. Closing an order with no items raises `ValueError(\"Order is empty\")`.",
      hint: "Keep `self._closed = False` and a list of `(item, price)`. Check the flag at the start of `add`.",
      solution: "class Order:\n    def __init__(self):\n        self._lines = []\n        self._closed = False\n\n    def add(self, item, price):\n        if self._closed:\n            raise RuntimeError(\"Order is closed\")\n        self._lines.append((item, price))\n\n    def total(self):\n        return sum(price for item, price in self._lines)\n\n    def items(self):\n        return tuple(item for item, price in self._lines)\n\n    def close(self):\n        if not self._lines:\n            raise ValueError(\"Order is empty\")\n        self._closed = True",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["An order", "(lambda o: (o.add(\"tea\", 2.5), o.add(\"cake\", 4), o.close(), o.total(), o.items())[3:])(Order()) == (6.5, (\"tea\", \"cake\"))"],
        ["Closed", "(lambda o: (o.add(\"tea\", 2.5), o.close(), _error(o.add, \"cake\", 4), o.items())[2:])(Order()) == (\"RuntimeError: Order is closed\", (\"tea\",))"],
        ["Empty", "_error(Order().close) == \"ValueError: Order is empty\""],
      ],
    }),
  ],
  questions: [
    mc("What does encapsulation mean?", ["Hiding code in a file", "The object looks after its own data and keeps it valid", "Making every attribute public", "Using many classes"], 1),
    mc("Why check values in `__init__`?", ["It is faster", "Python requires it", "So an invalid object can never be made", "To print errors"], 2),
    mc("Which error suits a value of the right type that isn't allowed, like an age of -5?", ["`ValueError`", "`TypeError`", "`NameError`", "`KeyError`"], 0),
    mc("What does a single leading underscore, as in `_balance`, mean?", ["It is deleted", "Python blocks outside access", "It is a class attribute", "Internal: don't use it from outside the class"], 3),
    mc("Why should `history()` return `list(self._history)`?", ["Lists are slow", "So callers can't change the object's own list", "To sort it", "It doesn't matter"], 1),
    mc("What does Python do with an attribute named `__pin`?", ["Renames it to `_ClassName__pin` (name mangling)", "Encrypts it", "Deletes it", "Makes it a constant"], 0),
    qShort("`acc._balance = -100` from outside: does Python stop it? (yes or no)", "no"),
    mc("The rules for accounts change. Where do you update them, with good encapsulation?", ["Everywhere accounts are used", "In the tests only", "Nowhere", "In one place, inside the class"], 3),
    mc("Which error suits a value of the wrong type, like an age of `\"30\"`?", ["`ValueError`", "`IndexError`", "`TypeError`", "`AttributeError`"], 2),
    mc("An \"all or nothing\" method finds a problem halfway. What should it do?", ["Check everything first, so nothing is changed when it fails", "Keep the half it finished", "Ignore the problem", "Delete the object"], 0),
  ],
})
