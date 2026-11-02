// Classes and objects topic: Data classes. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "dataclasses",
  title: "Data classes",
  paragraphs: [
    "Many classes mostly hold data: a point, a contact, a transaction. For each one you write the same things: an `__init__` that copies every parameter onto `self`, a `__repr__`, an `__eq__`. The `dataclasses` module writes them for you. You list the fields with their types, and `@dataclass` does the rest:",
    "```\nfrom dataclasses import dataclass\n\n@dataclass\nclass Point:\n    x: int\n    y: int\n\np = Point(1, 2)\nprint(p)                  # Point(x=1, y=2)\nprint(p == Point(1, 2))   # True\nprint(p.x + p.y)          # 3\n```",
    "Each line like `x: int` declares a field: its name and, after the colon, its type. The type is a note for readers and tools; Python doesn't check it, so `Point(\"a\", \"b\")` still works. A field can have a default, `score: int = 0`, and fields with defaults must come after those without, just like function parameters.",
    "A default that's a list or dict would be shared by every object, the bug from the class attributes stage, so dataclasses refuse it. Use `field(default_factory=list)` instead, which makes a fresh list for each object:",
    "```\nfrom dataclasses import dataclass, field\n\n@dataclass\nclass Basket:\n    owner: str\n    items: list = field(default_factory=list)\n\n    def total(self):\n        return sum(price for name, price in self.items)\n\nb = Basket(\"Ana\")\nb.items.append((\"tea\", 2.5))\nprint(b.total(), Basket(\"Ben\").items)   # 2.5 []\n```",
    "A dataclass is still an ordinary class, so it can have methods and properties like `total` above. To check values or work out extra fields after the generated `__init__` has run, add a `__post_init__` method; Python calls it straight afterwards.",
    "Options in the brackets change what's generated. `@dataclass(frozen=True)` makes objects read-only (assigning a field raises `FrozenInstanceError`) and lets them go in sets and be dict keys. `@dataclass(order=True)` adds `<`, `>` and the rest, comparing the fields in the order they're written, so `sorted` just works.",
    "```\nfrom dataclasses import dataclass\n\n@dataclass(frozen=True, order=True)\nclass Version:\n    major: int\n    minor: int\n\nversions = [Version(1, 10), Version(1, 2), Version(0, 9)]\nprint(sorted(versions)[0])           # Version(major=0, minor=9)\nprint(len({Version(1, 0), Version(1, 0)}))   # 1\n```",
    "`dataclasses.asdict(obj)` turns a data class into a dict, ready for `json.dumps`, and `Point(**d)` turns a dict back into an object. Reach for a data class when a class is mainly a record of values; when the behaviour is the point, like an account that guards its balance, a regular class is often clearer.",
  ],
  sandboxCode: "from dataclasses import dataclass, field, asdict\n\n@dataclass\nclass Contact:\n    name: str\n    email: str\n    tags: list = field(default_factory=list)\n\nc = Contact(\"Ana\", \"ana@example.com\")\nc.tags.append(\"friend\")\nprint(c)\nprint(asdict(c))\nprint(c == Contact(\"Ana\", \"ana@example.com\", [\"friend\"]))",
  sandboxSnippets: [
    snippet("A data class", "from dataclasses import dataclass\n\n@dataclass\nclass Item:\n    name: str\n    price: float = 0.0\n\nprint(Item(\"pen\"), Item(\"pen\", 1.5) == Item(\"pen\", 1.5))"),
    snippet("A list field", "from dataclasses import dataclass, field\n\n@dataclass\nclass Team:\n    name: str\n    members: list = field(default_factory=list)\n\na, b = Team(\"A\"), Team(\"B\")\na.members.append(\"Ana\")\nprint(a, b)"),
    snippet("Frozen", "from dataclasses import dataclass, FrozenInstanceError\n\n@dataclass(frozen=True)\nclass Colour:\n    r: int\n    g: int\n    b: int\n\nred = Colour(255, 0, 0)\ntry:\n    red.g = 100\nexcept FrozenInstanceError:\n    print(\"Can't change a frozen object\")\nprint({red: \"red\"}[Colour(255, 0, 0)])"),
    snippet("__post_init__", "from dataclasses import dataclass\n\n@dataclass\nclass Age:\n    years: int\n    def __post_init__(self):\n        if self.years < 0:\n            raise ValueError(\"Age can't be negative\")\n\ntry:\n    Age(-1)\nexcept ValueError as e:\n    print(\"ValueError:\", e)"),
  ],
  readMore: { label: "Python docs: dataclasses", url: "https://docs.python.org/3/library/dataclasses.html", source: "Python docs" },
  challenges: [
    task("easy", "Your first data class", {
      prompt: "Define a data class `Book` with fields `title` (str), `author` (str) and `pages` (int).",
      starter: "from dataclasses import dataclass\n",
      hint: "`@dataclass` above the class, then one `name: type` line per field.",
      solution: "from dataclasses import dataclass\n\n@dataclass\nclass Book:\n    title: str\n    author: str\n    pages: int",
      tests: [
        ["repr", "repr(Book(\"Dune\", \"Frank Herbert\", 412)) == \"Book(title='Dune', author='Frank Herbert', pages=412)\""],
        ["Equality", "Book(\"A\", \"B\", 1) == Book(\"A\", \"B\", 1) and Book(\"A\", \"B\", 1) != Book(\"A\", \"B\", 2)"],
      ],
    }),
    task("easy", "A default", {
      prompt: "Define a data class `Player` with a `name` (str) and a `score` (int) that defaults to 0.",
      starter: "from dataclasses import dataclass\n",
      hint: "`score: int = 0`.",
      solution: "from dataclasses import dataclass\n\n@dataclass\nclass Player:\n    name: str\n    score: int = 0",
      tests: [
        ["Default", "Player(\"Ana\") == Player(\"Ana\", 0)"],
        ["Given", "Player(\"Ben\", 7).score == 7"],
      ],
    }),
    task("easy", "Less typing", {
      prompt: "Rewrite `Product` as a data class (same fields, same order), so it gets a readable `repr` and `==` for free.",
      starter: "class Product:\n    def __init__(self, name, price):\n        self.name = name\n        self.price = price\n",
      hint: "Import `dataclass`, add `@dataclass`, and replace `__init__` with `name: str` and `price: float`.",
      solution: "from dataclasses import dataclass\n\n@dataclass\nclass Product:\n    name: str\n    price: float",
      tests: [
        ["repr", "repr(Product(\"pen\", 1.5)) == \"Product(name='pen', price=1.5)\""],
        ["Equality", "Product(\"pen\", 1.5) == Product(\"pen\", 1.5)"],
        ["A data class", "__import__(\"dataclasses\").is_dataclass(Product)"],
      ],
    }),
    task("medium", "A list for each", {
      prompt: "Define a data class `Basket` with an `owner` (str) and `items`, a list of prices that starts empty for each basket, plus a method `total()`.",
      starter: "from dataclasses import dataclass, field\n",
      hint: "`items: list = field(default_factory=list)`.",
      solution: "from dataclasses import dataclass, field\n\n@dataclass\nclass Basket:\n    owner: str\n    items: list = field(default_factory=list)\n\n    def total(self):\n        return sum(self.items)",
      tests: [
        ["Separate lists", "(lambda a, b: (a.items.append(5), b.items)[1])(Basket(\"Ana\"), Basket(\"Ben\")) == []"],
        ["total", "Basket(\"Cy\", [2.5, 4]).total() == 6.5"],
      ],
    }),
    task("medium", "Check after init", {
      prompt: "Define a data class `Temperature` with `celsius` (float), and a `__post_init__` that raises `ValueError(\"Below absolute zero\")` if it's below -273.15.",
      starter: "from dataclasses import dataclass\n",
      hint: "`def __post_init__(self):` runs right after the generated `__init__`.",
      solution: "from dataclasses import dataclass\n\n@dataclass\nclass Temperature:\n    celsius: float\n\n    def __post_init__(self):\n        if self.celsius < -273.15:\n            raise ValueError(\"Below absolute zero\")",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["Fine", "Temperature(21.5).celsius == 21.5"],
        ["Refused", "_error(Temperature, -300) == \"ValueError: Below absolute zero\""],
      ],
    }),
    task("medium", "Frozen places", {
      prompt: "Define a frozen data class `Place` with `lat` and `lon` (floats), so places can't be changed and can go in a set.",
      starter: "from dataclasses import dataclass\n",
      hint: "`@dataclass(frozen=True)`.",
      solution: "from dataclasses import dataclass\n\n@dataclass(frozen=True)\nclass Place:\n    lat: float\n    lon: float",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\n",
      tests: [
        ["In a set", "len({Place(51.5, -0.1), Place(51.5, -0.1), Place(48.9, 2.4)}) == 2"],
        ["Read-only", "_raises(setattr, Place(1, 2), \"lat\", 0) == \"FrozenInstanceError\""],
      ],
    }),
    task("hard", "Sortable versions", {
      prompt: "Define `Version` as a data class with `major`, `minor` and `patch` (ints) that can be sorted and compared with `<` and `>`, plus a `__str__` like `1.4.2`.",
      starter: "from dataclasses import dataclass\n",
      hint: "`@dataclass(order=True)` compares the fields in order. A `__str__` you write yourself is kept.",
      solution: "from dataclasses import dataclass\n\n@dataclass(order=True)\nclass Version:\n    major: int\n    minor: int\n    patch: int\n\n    def __str__(self):\n        return f\"{self.major}.{self.minor}.{self.patch}\"",
      tests: [
        ["Sorted", "[str(v) for v in sorted([Version(1, 10, 0), Version(1, 2, 3), Version(0, 9, 9)])] == [\"0.9.9\", \"1.2.3\", \"1.10.0\"]"],
        ["Compared", "Version(2, 0, 0) > Version(1, 99, 99) and max([Version(1, 0, 1), Version(1, 0, 0)]) == Version(1, 0, 1)"],
      ],
    }),
    task("hard", "A worked-out field", {
      prompt: "Define a data class `Rectangle` with `width` and `height`, and an `area` field that isn't passed in but worked out in `__post_init__`.",
      starter: "from dataclasses import dataclass, field\n",
      hint: "`area: float = field(init=False)`, then set `self.area` in `__post_init__`.",
      solution: "from dataclasses import dataclass, field\n\n@dataclass\nclass Rectangle:\n    width: float\n    height: float\n    area: float = field(init=False)\n\n    def __post_init__(self):\n        self.area = self.width * self.height",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\n",
      tests: [
        ["area", "Rectangle(3, 4).area == 12"],
        ["In the repr", "repr(Rectangle(2, 5)) == \"Rectangle(width=2, height=5, area=10)\""],
        ["Not a parameter", "_raises(Rectangle, 1, 2, 3) == \"TypeError\""],
      ],
    }),
    task("expert", "To JSON and back", {
      prompt: "Define a data class `Contact` (`name`, `email`, and `phone` defaulting to `None`), then `to_json(contacts)` returning a JSON list of their dicts, and `from_json(text)` turning that back into a list of `Contact`s.",
      starter: "import json\nfrom dataclasses import dataclass, asdict\n",
      hint: "`json.dumps([asdict(c) for c in contacts])`, and `[Contact(**d) for d in json.loads(text)]`.",
      solution: "import json\nfrom dataclasses import dataclass, asdict\n\n@dataclass\nclass Contact:\n    name: str\n    email: str\n    phone: str = None\n\ndef to_json(contacts):\n    return json.dumps([asdict(c) for c in contacts])\n\ndef from_json(text):\n    return [Contact(**d) for d in json.loads(text)]",
      tests: [
        ["to_json", "to_json([Contact(\"Ana\", \"a@example.com\")]) == '[{\"name\": \"Ana\", \"email\": \"a@example.com\", \"phone\": null}]'"],
        ["A round trip", "(lambda cs: from_json(to_json(cs)) == cs)([Contact(\"Ana\", \"a@example.com\", \"555\"), Contact(\"Ben\", \"b@example.com\")])"],
        ["Empty", "from_json(\"[]\") == []"],
      ],
    }),
    task("expert", "Next task", {
      prompt: "Define a data class `Task` with `priority` (int), `title` (str) and `done` (bool, default `False`) that sorts by priority **only** (lower first); `title` and `done` take no part in comparisons. Then `next_task(tasks)` returns the unfinished task with the lowest priority, or `None`.",
      starter: "from dataclasses import dataclass, field\n",
      hint: "`@dataclass(order=True)`, with `title: str = field(compare=False)` and `done: bool = field(default=False, compare=False)`. `min` of the unfinished ones, with `default=None`.",
      solution: "from dataclasses import dataclass, field\n\n@dataclass(order=True)\nclass Task:\n    priority: int\n    title: str = field(compare=False)\n    done: bool = field(default=False, compare=False)\n\ndef next_task(tasks):\n    return min((t for t in tasks if not t.done), default=None)",
      tests: [
        ["Sorted by priority", "[t.title for t in sorted([Task(3, \"c\"), Task(1, \"a\"), Task(2, \"b\")])] == [\"a\", \"b\", \"c\"]"],
        ["Titles don't count", "Task(1, \"x\") == Task(1, \"y\")"],
        ["Next task", "next_task([Task(1, \"done already\", True), Task(4, \"later\"), Task(2, \"soon\")]).title == \"soon\""],
        ["Nothing left", "next_task([Task(1, \"x\", True)]) is None"],
      ],
    }),
  ],
  questions: [
    mc("What does `@dataclass` write for you?", ["Nothing", "`__init__`, `__repr__` and `__eq__` from the fields", "Only `__str__`", "A database"], 1, "`@dataclass` writes the usual special methods for you from the field list."),
    mc("What does `x: int` mean in a data class?", ["x must be an int, or Python raises an error", "x is 0", "A field called x, with its type noted", "A class attribute shared by all"], 2, "Annotated class variables become fields; the type is a hint and isn't checked."),
    mc("How do you give each object its own empty list field?", ["`items: list = field(default_factory=list)`", "`items: list = []`", "`items = list`", "`items: list = None`"], 0, "`default_factory` builds a new list for each object instead of sharing one."),
    mc("When does `__post_init__` run?", ["Before `__init__`", "When the object is printed", "Never on its own", "Right after the generated `__init__`"], 3, "`__post_init__` runs after the generated `__init__`, which makes it the place for checks."),
    mc("What does `frozen=True` do?", ["Makes the class faster", "Makes objects read-only and usable in sets", "Stops the class having methods", "Sorts the fields"], 1, "Frozen objects can't be changed, so they can be hashed and used in sets."),
    mc("What does `order=True` add?", ["`<`, `>`, `<=` and `>=`, comparing fields in order", "A sort method", "An index field", "Alphabetical field names"], 0, "`order=True` compares objects like tuples of their fields."),
    qShort("Which function from `dataclasses` turns an object into a dict? (one word)", "asdict", "`asdict` converts a data class (and nested ones) to a dict."),
    mc("A field without a default comes after one with a default. What happens?", ["It gets `None`", "It works", "The order is fixed for you", "An error, as with function parameters"], 3, "The generated `__init__` follows the field order, and parameters with defaults must come last."),
    mc("When is a regular class often clearer than a data class?", ["When it holds a few values", "When it needs a `repr`", "When the behaviour, like guarding a balance, is the point", "Never"], 2, "Data classes suit data holders; a class whose job is to protect its data is clearer written by hand."),
    mc("How do you make an object from a dict `d` with matching keys?", ["`Point(**d)`", "`Point(d)`", "`Point.from(d)`", "`dict(Point)`"], 0, "`**d` unpacks the dict into keyword arguments that match the field names."),
  ],
})
