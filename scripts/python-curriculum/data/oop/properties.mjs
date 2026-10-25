// Classes and objects topic: Properties. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "properties",
  title: "Properties",
  paragraphs: [
    "`acc.balance()` works, but reading a value with brackets feels clumsy: a rectangle's area is something it **has**, not something you ask it to do. A **property** is a method that's used like an attribute, written without brackets. It lets a class work out values on the fly and check values as they're set, while the code using the class just reads and assigns attributes.",
    "```\nclass Rectangle:\n    def __init__(self, width, height):\n        self.width = width\n        self.height = height\n\n    @property\n    def area(self):\n        return self.width * self.height\n\nr = Rectangle(3, 4)\nprint(r.area)    # 12: no brackets\nr.width = 10\nprint(r.area)    # 40: always up to date\n```",
    "The `@property` line above the method is a **decorator**: it turns the method into a property. Because `area` is worked out each time it's read, it can never be out of date, which a plain attribute set in `__init__` could be.",
    "A property can also have a **setter**, a method that runs when you assign to it. That's the place to check the value. The real value lives in an attribute with an underscore, and `__init__` assigns through the property, so the check runs for new objects as well:",
    "```\nclass Person:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age            # runs the setter below\n\n    @property\n    def age(self):\n        return self._age\n\n    @age.setter\n    def age(self, value):\n        if value < 0:\n            raise ValueError(\"Age can't be negative\")\n        self._age = value\n\np = Person(\"Ana\", 30)\np.age = 31            # checked\nprint(p.age)          # 31\n```",
    "A property with no setter is **read-only**: assigning to it raises `AttributeError`. That's a good fit for values that should only change through a method, like a balance that changes only through `deposit` and `withdraw`.",
    "Properties are the reason Python classes rarely need `get_x()` and `set_x()` methods. Start with plain attributes. If you later need a check or a calculation, turn the attribute into a property, and every piece of code that reads `p.age` or assigns `p.age = 31` keeps working unchanged. Keep properties quick and free of surprises: reading one shouldn't do slow work or change anything.",
    "```\nclass Temperature:\n    def __init__(self, celsius):\n        self.celsius = celsius\n\n    @property\n    def fahrenheit(self):\n        return self.celsius * 9 / 5 + 32\n\n    @fahrenheit.setter\n    def fahrenheit(self, value):\n        self.celsius = (value - 32) * 5 / 9\n\nt = Temperature(100)\nprint(t.fahrenheit)    # 212.0\nt.fahrenheit = 32\nprint(t.celsius)       # 0.0\n```",
  ],
  sandboxCode: "class Circle:\n    def __init__(self, radius):\n        self.radius = radius\n\n    @property\n    def diameter(self):\n        return self.radius * 2\n\n    @diameter.setter\n    def diameter(self, value):\n        self.radius = value / 2\n\nc = Circle(5)\nprint(c.diameter)\nc.diameter = 30\nprint(c.radius)",
  sandboxSnippets: [
    snippet("A computed value", "class Square:\n    def __init__(self, side):\n        self.side = side\n    @property\n    def area(self):\n        return self.side ** 2\n\ns = Square(4)\nprint(s.area)\ns.side = 5\nprint(s.area)"),
    snippet("A checked setter", "class Product:\n    def __init__(self, price):\n        self.price = price\n    @property\n    def price(self):\n        return self._price\n    @price.setter\n    def price(self, value):\n        if value < 0:\n            raise ValueError(\"Price can't be negative\")\n        self._price = value\n\np = Product(5)\ntry:\n    p.price = -1\nexcept ValueError as e:\n    print(\"ValueError:\", e)\nprint(p.price)"),
    snippet("Read-only", "class Account:\n    def __init__(self):\n        self._balance = 0\n    @property\n    def balance(self):\n        return self._balance\n\ntry:\n    Account().balance = 100\nexcept AttributeError:\n    print(\"balance is read-only\")"),
    snippet("Calling it by mistake", "class Box:\n    @property\n    def size(self):\n        return 3\n\ntry:\n    Box().size()\nexcept TypeError as e:\n    print(\"TypeError:\", e)"),
  ],
  readMore: { label: "Python docs: property", url: "https://docs.python.org/3/library/functions.html#property", source: "Python docs" },
  challenges: [
    task("easy", "Area as a property", {
      prompt: "Give `Rectangle` an `area` property, so `r.area` (no brackets) is the width times the height.",
      starter: "class Rectangle:\n    def __init__(self, width, height):\n        self.width = width\n        self.height = height\n",
      hint: "`@property` above `def area(self):`.",
      solution: "class Rectangle:\n    def __init__(self, width, height):\n        self.width = width\n        self.height = height\n\n    @property\n    def area(self):\n        return self.width * self.height",
      tests: [
        ["area", "Rectangle(3, 4).area == 12"],
        ["Up to date", "(lambda r: (setattr(r, \"width\", 10), r.area)[1])(Rectangle(3, 4)) == 40"],
      ],
    }),
    task("easy", "Full name", {
      prompt: "Give `Person` a `full_name` property: the first and last names with a space between.",
      starter: "class Person:\n    def __init__(self, first, last):\n        self.first = first\n        self.last = last\n",
      hint: "`return f\"{self.first} {self.last}\"` in a property.",
      solution: "class Person:\n    def __init__(self, first, last):\n        self.first = first\n        self.last = last\n\n    @property\n    def full_name(self):\n        return f\"{self.first} {self.last}\"",
      tests: [
        ["full_name", "Person(\"Ada\", \"Lovelace\").full_name == \"Ada Lovelace\""],
        ["A property", "isinstance(Person.__dict__.get(\"full_name\"), property)"],
      ],
    }),
    task("easy", "No brackets", {
      prompt: "This crashes with `TypeError: 'int' object is not callable`. Fix the last line.",
      starter: "class Circle:\n    def __init__(self, radius):\n        self.radius = radius\n\n    @property\n    def diameter(self):\n        return self.radius * 2\n\nc = Circle(5)\nd = c.diameter()\n",
      hint: "`diameter` is a property: read it like an attribute, without `()`.",
      solution: "class Circle:\n    def __init__(self, radius):\n        self.radius = radius\n\n    @property\n    def diameter(self):\n        return self.radius * 2\n\nc = Circle(5)\nd = c.diameter",
      tests: [
        ["d is 10", "d == 10"],
      ],
    }),
    task("medium", "A checked price", {
      prompt: "Turn `price` into a property whose setter raises `ValueError(\"Price can't be negative\")`, so the check also runs in `__init__`.",
      starter: "class Product:\n    def __init__(self, name, price):\n        self.name = name\n        self.price = price\n",
      hint: "Store the value in `self._price`. Keep `self.price = price` in `__init__`, so it goes through the setter.",
      solution: "class Product:\n    def __init__(self, name, price):\n        self.name = name\n        self.price = price\n\n    @property\n    def price(self):\n        return self._price\n\n    @price.setter\n    def price(self, value):\n        if value < 0:\n            raise ValueError(\"Price can't be negative\")\n        self._price = value",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["A good price", "(lambda p: (setattr(p, \"price\", 7.5), p.price)[1])(Product(\"pen\", 2)) == 7.5"],
        ["Refused when set", "(lambda p: (_error(setattr, p, \"price\", -1), p.price))(Product(\"pen\", 2)) == (\"ValueError: Price can't be negative\", 2)"],
        ["Refused when made", "_error(Product, \"pen\", -3) == \"ValueError: Price can't be negative\""],
      ],
    }),
    task("medium", "Read-only balance", {
      prompt: "Make `balance` a read-only property of `Account`, so it can only change through `deposit`.",
      starter: "class Account:\n    def __init__(self):\n        self.balance = 0\n\n    def deposit(self, amount):\n        self.balance += amount\n",
      hint: "Store it as `self._balance`, and give `balance` a property with no setter.",
      solution: "class Account:\n    def __init__(self):\n        self._balance = 0\n\n    def deposit(self, amount):\n        self._balance += amount\n\n    @property\n    def balance(self):\n        return self._balance",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\n",
      tests: [
        ["deposit still works", "(lambda a: (a.deposit(40), a.balance)[1])(Account()) == 40"],
        ["Assigning fails", "_raises(setattr, Account(), \"balance\", 1000) == \"AttributeError\""],
      ],
    }),
    task("medium", "Both scales", {
      prompt: "Give `Temperature` a `fahrenheit` property with a setter, so reading it converts from `celsius` and assigning it updates `celsius`.",
      starter: "class Temperature:\n    def __init__(self, celsius):\n        self.celsius = celsius\n",
      hint: "F = C * 9 / 5 + 32, and C = (F - 32) * 5 / 9.",
      solution: "class Temperature:\n    def __init__(self, celsius):\n        self.celsius = celsius\n\n    @property\n    def fahrenheit(self):\n        return self.celsius * 9 / 5 + 32\n\n    @fahrenheit.setter\n    def fahrenheit(self, value):\n        self.celsius = (value - 32) * 5 / 9",
      tests: [
        ["Reading", "Temperature(100).fahrenheit == 212.0"],
        ["Setting", "(lambda t: (setattr(t, \"fahrenheit\", 50), t.celsius)[1])(Temperature(0)) == 10.0"],
      ],
    }),
    task("hard", "Tidy emails", {
      prompt: "Give `User` an `email` property whose setter strips spaces and lowercases the address, and raises `ValueError(\"Bad email: <value>\")` if there's no `@` in it. It must also apply in `__init__`.",
      starter: "class User:\n    def __init__(self, email):\n        self.email = email\n",
      hint: "In the setter: `value = value.strip().lower()`, check `\"@\" in value`, then store `self._email`.",
      solution: "class User:\n    def __init__(self, email):\n        self.email = email\n\n    @property\n    def email(self):\n        return self._email\n\n    @email.setter\n    def email(self, value):\n        cleaned = value.strip().lower()\n        if \"@\" not in cleaned:\n            raise ValueError(f\"Bad email: {value}\")\n        self._email = cleaned",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["Tidied", "User(\"  Ana@Example.COM \").email == \"ana@example.com\""],
        ["Changed later", "(lambda u: (setattr(u, \"email\", \"BEN@example.org\"), u.email)[1])(User(\"a@b.c\")) == \"ben@example.org\""],
        ["Refused", "_error(User, \"nope\") == \"ValueError: Bad email: nope\""],
      ],
    }),
    task("hard", "Basket facts", {
      prompt: "Give `Basket` three properties: `total` (the sum of the prices), `count` (how many items) and `is_empty`.",
      starter: "class Basket:\n    def __init__(self):\n        self.items = []\n\n    def add(self, name, price):\n        self.items.append((name, price))\n",
      hint: "Each property works it out from `self.items` when it's read.",
      solution: "class Basket:\n    def __init__(self):\n        self.items = []\n\n    def add(self, name, price):\n        self.items.append((name, price))\n\n    @property\n    def total(self):\n        return sum(price for name, price in self.items)\n\n    @property\n    def count(self):\n        return len(self.items)\n\n    @property\n    def is_empty(self):\n        return not self.items",
      tests: [
        ["Empty", "(lambda b: (b.total, b.count, b.is_empty))(Basket()) == (0, 0, True)"],
        ["Two items", "(lambda b: (b.add(\"tea\", 2.5), b.add(\"cake\", 4), (b.total, b.count, b.is_empty))[2])(Basket()) == (6.5, 2, False)"],
      ],
    }),
    task("expert", "Progress bar", {
      prompt: "Define `Task(total)` with a `done` property (its setter clamps the value between 0 and `total`), a `percent` property (a whole number, rounded down), and a `bar` property like `[#####-----] 50%` (10 slots, one `#` per full 10%).",
      hint: "`percent = self.done * 100 // self.total`; the bar has `percent // 10` `#` characters and the rest `-`.",
      solution: "class Task:\n    def __init__(self, total):\n        self.total = total\n        self.done = 0\n\n    @property\n    def done(self):\n        return self._done\n\n    @done.setter\n    def done(self, value):\n        self._done = max(0, min(self.total, value))\n\n    @property\n    def percent(self):\n        return self.done * 100 // self.total\n\n    @property\n    def bar(self):\n        filled = self.percent // 10\n        return \"[\" + \"#\" * filled + \"-\" * (10 - filled) + f\"] {self.percent}%\"",
      tests: [
        ["Half way", "(lambda t: (setattr(t, \"done\", 4), t.percent, t.bar)[1:])(Task(8)) == (50, \"[#####-----] 50%\")"],
        ["Rounded down", "(lambda t: (setattr(t, \"done\", 2), t.percent, t.bar)[1:])(Task(3)) == (66, \"[######----] 66%\")"],
        ["Clamped", "(lambda t: (setattr(t, \"done\", 99), t.done, t.bar, setattr(t, \"done\", -5), t.done))(Task(5))[1:3] + ((lambda t: (setattr(t, \"done\", -5), t.done)[1])(Task(5)),) == (5, \"[##########] 100%\", 0)"],
        ["Nothing done", "Task(5).bar == \"[----------] 0%\""],
      ],
    }),
    task("expert", "Durations", {
      prompt: "Define `Duration(seconds)` storing a total number of seconds, with a `total_seconds` property (its setter refuses negatives with `ValueError(\"Duration can't be negative\")`), read-only properties `hours`, `minutes` and `seconds` (the parts, so `3723` is 1 hour, 2 minutes, 3 seconds), and a `__str__` like `1:02:03`.",
      hint: "`divmod(total, 3600)` gives hours and the rest; `divmod(rest, 60)` gives minutes and seconds.",
      solution: "class Duration:\n    def __init__(self, seconds):\n        self.total_seconds = seconds\n\n    @property\n    def total_seconds(self):\n        return self._total\n\n    @total_seconds.setter\n    def total_seconds(self, value):\n        if value < 0:\n            raise ValueError(\"Duration can't be negative\")\n        self._total = value\n\n    @property\n    def hours(self):\n        return self._total // 3600\n\n    @property\n    def minutes(self):\n        return self._total % 3600 // 60\n\n    @property\n    def seconds(self):\n        return self._total % 60\n\n    def __str__(self):\n        return f\"{self.hours}:{self.minutes:02d}:{self.seconds:02d}\"",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["The parts", "(lambda d: (d.hours, d.minutes, d.seconds))(Duration(3723)) == (1, 2, 3)"],
        ["Shown", "str(Duration(3723)) == \"1:02:03\" and str(Duration(59)) == \"0:00:59\""],
        ["Changed", "(lambda d: (setattr(d, \"total_seconds\", 7200), str(d))[1])(Duration(1)) == \"2:00:00\""],
        ["Refused", "_error(Duration, -1) == \"ValueError: Duration can't be negative\" and _raises(setattr, Duration(1), \"hours\", 3) == \"AttributeError\""],
      ],
    }),
  ],
  questions: [
    mc("What does `@property` do to a method?", ["Makes it private", "Lets it be used like an attribute, without brackets", "Runs it once", "Makes it a class method"], 1),
    mc("Why can a computed property like `area` never be out of date?", ["It is cached", "It is set in `__init__`", "It is worked out each time it is read", "Python updates it on a timer"], 2),
    mc("Which decorator adds a setter for a property called `age`?", ["`@age.setter`", "`@setter`", "`@property.setter`", "`@set_age`"], 0),
    mc("What happens when you assign to a property that has no setter?", ["It works", "Nothing", "`ValueError`", "`AttributeError`"], 3),
    mc("Why does `__init__` write `self.age = age` rather than `self._age = age`?", ["It is shorter", "So the setter's check runs for new objects too", "It is faster", "Underscores aren't allowed in `__init__`"], 1),
    mc("`c.diameter` is a property. What does `c.diameter()` do?", ["Calls the value it returns, usually a `TypeError`", "Works the same", "Returns the method", "Sets the diameter"], 0),
    mc("What is a big advantage of properties over `get_x()`/`set_x()` methods?", ["They are faster", "They are private", "They can't raise errors", "You can add one later without changing the code that uses the attribute"], 3),
    mc("What should reading a property not do?", ["Return a value", "Use `self`", "Do slow work or change the object", "Use other attributes"], 2),
    mc("Where does a property with a setter usually keep its value?", ["In an attribute with a leading underscore, like `self._age`", "In a global variable", "In the class", "Nowhere"], 0),
  ],
})
