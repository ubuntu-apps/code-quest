// Classes and objects topic: Class attributes and class methods. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "class_members",
  title: "Class attributes and class methods",
  paragraphs: [
    "Attributes set on `self` belong to one object. A variable written directly inside the class body belongs to the **class** itself, and every object of the class shares it. That suits values that are the same for all of them, like a list of allowed sizes, and counts that span all of them, like how many have been made.",
    "```\nclass Pizza:\n    SIZES = (\"small\", \"medium\", \"large\")   # the same for every pizza\n    made = 0                               # counts all pizzas\n\n    def __init__(self, size):\n        if size not in Pizza.SIZES:\n            raise ValueError(f\"No {size} pizzas\")\n        self.size = size                   # this pizza's own size\n        Pizza.made += 1\n\nPizza(\"small\")\nPizza(\"large\")\nprint(Pizza.made)          # 2\nprint(Pizza(\"medium\").SIZES)  # ('small', 'medium', 'large')\n```",
    "When you read `self.SIZES`, Python looks on the object first and then on its class, which is why every pizza can see `SIZES`. Assigning is different: `self.made += 1` would create a new attribute on that one object, hiding the shared one, and the class count would never change. To update a class attribute, assign through the class name, `Pizza.made += 1`.",
    "```\nclass Robot:\n    count = 0\n\n    def __init__(self):\n        self.count += 1     # makes a new attribute on this robot only\n\nRobot()\nRobot()\nprint(Robot.count)          # 0: the shared count never changed\n```",
    "The same sharing causes a classic bug with lists: `members = []` in the class body is **one** list that every team appends to. A list that each object should own must be created in `__init__`, as `self.members = []`.",
    "A **class method**, marked with `@classmethod`, receives the class instead of an object, by convention as `cls`. Its usual job is an extra way to create objects, often from a different kind of input. Calling `cls(...)` makes the new object, just as calling the class does:",
    "```\nclass Temperature:\n    def __init__(self, celsius):\n        self.celsius = celsius\n\n    @classmethod\n    def from_fahrenheit(cls, f):\n        return cls(round((f - 32) * 5 / 9, 1))\n\n    @staticmethod\n    def is_freezing(celsius):\n        return celsius <= 0\n\nt = Temperature.from_fahrenheit(212)\nprint(t.celsius)                      # 100.0\nprint(Temperature.is_freezing(-3))    # True\n```",
    "A **static method**, marked with `@staticmethod`, gets neither `self` nor `cls`. It's an ordinary function that lives in the class because it belongs with it, like a check on a value before an object is made. Both kinds are called on the class itself, `Temperature.from_fahrenheit(212)`, without needing an object first.",
  ],
  sandboxCode: "class Ticket:\n    PRICE = 12.5\n    sold = 0\n\n    def __init__(self, name):\n        Ticket.sold += 1\n        self.name = name\n        self.number = Ticket.sold\n\n    @classmethod\n    def takings(cls):\n        return cls.sold * cls.PRICE\n\nfor name in [\"Ana\", \"Ben\", \"Cy\"]:\n    t = Ticket(name)\n    print(t.number, t.name)\nprint(\"Takings:\", Ticket.takings())",
  sandboxSnippets: [
    snippet("Shared by all", "class Car:\n    WHEELS = 4\n    def __init__(self, colour):\n        self.colour = colour\n\nprint(Car.WHEELS, Car(\"red\").WHEELS, vars(Car(\"red\")))"),
    snippet("A shared list bug", "class Team:\n    members = []\n\na, b = Team(), Team()\na.members.append(\"Ana\")\nprint(b.members)"),
    snippet("A class method", "class Point:\n    def __init__(self, x, y):\n        self.x, self.y = x, y\n\n    @classmethod\n    def from_text(cls, text):\n        x, y = text.split(\",\")\n        return cls(int(x), int(y))\n\np = Point.from_text(\"3,4\")\nprint(p.x, p.y)"),
    snippet("A static method", "class Maths:\n    @staticmethod\n    def double(n):\n        return n * 2\n\nprint(Maths.double(21))"),
  ],
  readMore: { label: "Python tutorial: Class and instance variables", url: "https://docs.python.org/3/tutorial/classes.html#class-and-instance-variables", source: "Python docs" },
  challenges: [
    task("easy", "Four sides", {
      prompt: "Give `Square` a class attribute `SIDES` set to 4, shared by all squares (not set in `__init__`).",
      starter: "class Square:\n    def __init__(self, size):\n        self.size = size\n",
      hint: "Write `SIDES = 4` in the class body, above `__init__`.",
      solution: "class Square:\n    SIDES = 4\n\n    def __init__(self, size):\n        self.size = size",
      tests: [
        ["On the class", "Square.SIDES == 4"],
        ["Every square sees it", "Square(2).SIDES == 4 and \"SIDES\" not in vars(Square(2))"],
      ],
    }),
    task("easy", "How many tickets?", {
      prompt: "Give `Ticket` a class attribute `count`, starting at 0, that goes up by one each time a ticket is made.",
      starter: "class Ticket:\n    def __init__(self, name):\n        self.name = name\n",
      hint: "In `__init__`, `Ticket.count += 1`.",
      solution: "class Ticket:\n    count = 0\n\n    def __init__(self, name):\n        self.name = name\n        Ticket.count += 1",
      tests: [
        ["Counts", "(lambda before: (Ticket(\"a\"), Ticket(\"b\"), Ticket(\"c\"), Ticket.count - before)[3])(Ticket.count) == 3"],
        ["Not on each ticket", "\"count\" not in vars(Ticket(\"x\"))"],
      ],
    }),
    task("easy", "From a pair", {
      prompt: "Add a class method `from_pair(cls, pair)` to `Point` that makes a point from a tuple like `(3, 4)`.",
      starter: "class Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n",
      hint: "`@classmethod`, then `return cls(pair[0], pair[1])`.",
      solution: "class Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\n    @classmethod\n    def from_pair(cls, pair):\n        return cls(pair[0], pair[1])",
      tests: [
        ["From (3, 4)", "(lambda p: (type(p).__name__, p.x, p.y))(Point.from_pair((3, 4))) == (\"Point\", 3, 4)"],
      ],
    }),
    task("medium", "One list each", {
      prompt: "Every `Team` shares one `members` list, so adding to one team adds to all. Fix it so each team has its own.",
      starter: "class Team:\n    members = []\n\n    def __init__(self, name):\n        self.name = name\n\n    def join(self, person):\n        self.members.append(person)\n",
      hint: "Remove the class-level list and create `self.members = []` in `__init__`.",
      solution: "class Team:\n    def __init__(self, name):\n        self.name = name\n        self.members = []\n\n    def join(self, person):\n        self.members.append(person)",
      tests: [
        ["Separate lists", "(lambda a, b: (a.join(\"Ana\"), b.join(\"Ben\"), a.members, b.members)[2:])(Team(\"Red\"), Team(\"Blue\")) == ([\"Ana\"], [\"Ben\"])"],
      ],
    }),
    task("medium", "Serial numbers", {
      prompt: "`Robot.count` stays at 0. Fix it so each new robot adds one to the class's `count`, and gets that number as its own `serial`.",
      starter: "class Robot:\n    count = 0\n\n    def __init__(self):\n        self.count += 1\n        self.serial = self.count\n",
      hint: "Assign through the class: `Robot.count += 1`, then `self.serial = Robot.count`.",
      solution: "class Robot:\n    count = 0\n\n    def __init__(self):\n        Robot.count += 1\n        self.serial = Robot.count",
      tests: [
        ["The class counts", "(lambda before: (Robot(), Robot(), Robot.count - before)[2])(Robot.count) == 2"],
        ["Serials go up", "(lambda a, b: b.serial - a.serial)(Robot(), Robot()) == 1 and Robot().serial == Robot.count"],
      ],
    }),
    task("medium", "From Fahrenheit", {
      prompt: "Add a class method `from_fahrenheit(cls, f)` to `Temperature` that returns a `Temperature` in Celsius, rounded to 1 place.",
      starter: "class Temperature:\n    def __init__(self, celsius):\n        self.celsius = celsius\n",
      hint: "`cls(round((f - 32) * 5 / 9, 1))`.",
      solution: "class Temperature:\n    def __init__(self, celsius):\n        self.celsius = celsius\n\n    @classmethod\n    def from_fahrenheit(cls, f):\n        return cls(round((f - 32) * 5 / 9, 1))",
      tests: [
        ["Boiling", "Temperature.from_fahrenheit(212).celsius == 100.0"],
        ["Body temperature", "Temperature.from_fahrenheit(98.6).celsius == 37.0"],
        ["A Temperature", "isinstance(Temperature.from_fahrenheit(32), Temperature)"],
      ],
    }),
    task("hard", "Dates from text", {
      prompt: "Define `Date(day, month, year)` with a class method `from_iso(text)` that reads `2025-03-14`, and a `__str__` that shows `14/03/2025`.",
      hint: "Split on `\"-\"` and convert to ints. In `__str__`, `:02d` pads with a zero.",
      solution: "class Date:\n    def __init__(self, day, month, year):\n        self.day = day\n        self.month = month\n        self.year = year\n\n    @classmethod\n    def from_iso(cls, text):\n        year, month, day = (int(part) for part in text.split(\"-\"))\n        return cls(day, month, year)\n\n    def __str__(self):\n        return f\"{self.day:02d}/{self.month:02d}/{self.year}\"",
      tests: [
        ["From text", "(lambda d: (d.day, d.month, d.year))(Date.from_iso(\"2025-03-14\")) == (14, 3, 2025)"],
        ["Shown", "str(Date.from_iso(\"2024-12-05\")) == \"05/12/2024\""],
      ],
    }),
    task("hard", "Strong passwords only", {
      prompt: "Define `Password` with a static method `is_strong(text)` (at least 8 characters, with a letter and a digit), and an `__init__` that stores `text` or raises `ValueError(\"Too weak\")` if it isn't strong.",
      hint: "`@staticmethod` and no `self`. In `__init__`, call `Password.is_strong(text)`.",
      solution: "class Password:\n    def __init__(self, text):\n        if not Password.is_strong(text):\n            raise ValueError(\"Too weak\")\n        self.text = text\n\n    @staticmethod\n    def is_strong(text):\n        return len(text) >= 8 and any(c.isalpha() for c in text) and any(c.isdigit() for c in text)",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["Static checks", "Password.is_strong(\"abc12345\") is True and Password.is_strong(\"abcdefgh\") is False and Password.is_strong(\"a1\") is False"],
        ["A strong one", "Password(\"secret123\").text == \"secret123\""],
        ["A weak one", "_error(Password, \"password\") == \"ValueError: Too weak\""],
      ],
    }),
    task("expert", "Units by name", {
      prompt: "Define `Unit(name, factor)`, where `factor` is how many metres one unit is. Every unit made is kept in a class dict `units` by name. Add a class method `get(name)` (raising `ValueError(\"Unknown unit: <name>\")` for unknown names) and a method `to_metres(value)`.",
      hint: "In `__init__`, `Unit.units[name] = self`. In `get`, look it up in `cls.units`.",
      solution: "class Unit:\n    units = {}\n\n    def __init__(self, name, factor):\n        self.name = name\n        self.factor = factor\n        Unit.units[name] = self\n\n    @classmethod\n    def get(cls, name):\n        if name not in cls.units:\n            raise ValueError(f\"Unknown unit: {name}\")\n        return cls.units[name]\n\n    def to_metres(self, value):\n        return value * self.factor",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["Kept by name", "(Unit(\"km\", 1000), Unit(\"cm\", 0.01), Unit.get(\"km\").to_metres(3))[2] == 3000"],
        ["The same object", "(lambda u: Unit.get(\"ft\") is u)(Unit(\"ft\", 0.3048))"],
        ["Unknown", "_error(Unit.get, \"parsec\") == \"ValueError: Unknown unit: parsec\""],
      ],
    }),
    task("expert", "Limited seats", {
      prompt: "Define `Seat`, with class attributes `capacity` (3) and `taken` (0). Making a seat takes one; making one when all are taken raises `RuntimeError(\"Sold out\")`. Add a class method `remaining()`.",
      hint: "Check `Seat.taken >= Seat.capacity` at the start of `__init__`, then `Seat.taken += 1`. `remaining` returns `cls.capacity - cls.taken`.",
      solution: "class Seat:\n    capacity = 3\n    taken = 0\n\n    def __init__(self):\n        if Seat.taken >= Seat.capacity:\n            raise RuntimeError(\"Sold out\")\n        Seat.taken += 1\n\n    @classmethod\n    def remaining(cls):\n        return cls.capacity - cls.taken",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["Selling seats", "(lambda t: (t[0], t[2], t[5]))((Seat.remaining(), Seat(), Seat.remaining(), Seat(), Seat(), Seat.remaining())) == (3, 2, 0)"],
        ["Sold out", "_error(Seat) == \"RuntimeError: Sold out\" and Seat.remaining() == 0"],
      ],
    }),
  ],
  questions: [
    mc("Who shares a class attribute like `SIZES = (...)` in the class body?", ["Only the first object", "Every object of the class", "Nobody", "Only the class methods"], 1),
    mc("`self.made += 1` inside `__init__`, where `made` is a class attribute. What happens?", ["The class count goes up", "An error", "This object gets its own `made`; the class count doesn't change", "All objects are counted twice"], 2),
    mc("How do you update a class attribute from a method?", ["Through the class name: `Pizza.made += 1`", "`self.made += 1`", "`made += 1`", "`global made`"], 0),
    mc("Why is `members = []` in a class body a bug for teams?", ["Lists can't be attributes", "It is slower", "It is read-only", "All teams share that one list"], 3),
    mc("What does a class method receive as its first parameter?", ["The object", "The class, usually called `cls`", "Nothing", "The module"], 1),
    mc("What is a common use of a class method?", ["Another way to create objects, like `from_fahrenheit`", "Printing", "Deleting objects", "Comparing objects"], 0),
    qShort("Which decorator makes a method that gets neither `self` nor `cls`? (with the @)", "@staticmethod"),
    mc("Reading `self.SIZES`, where does Python look?", ["Only the object", "Only the class", "The module", "The object first, then its class"], 3),
    mc("Inside a class method, how do you make a new object?", ["`self()`", "`new cls`", "`cls(...)`", "`object()`"], 2),
    mc("How are class methods usually called?", ["On the class itself, like `Temperature.from_fahrenheit(212)`", "Only on objects", "With `self.`", "Through `super()`"], 0),
  ],
})
