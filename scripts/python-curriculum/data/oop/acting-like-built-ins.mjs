// Classes and objects topic: Objects that act like built-ins. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "special_methods_adv",
  title: "Objects that act like built-ins",
  paragraphs: [
    "`len()`, `in`, `for`, square brackets and `+` all work on Python's own types because those types define special methods. Your classes can define the same ones, and then your objects work with the same familiar syntax. A playlist can answer `len(playlist)`, `\"Song\" in playlist` and `for song in playlist` just like a list does.",
    "```\nclass Playlist:\n    def __init__(self, songs):\n        self.songs = list(songs)\n\n    def __len__(self):               # len(p)\n        return len(self.songs)\n\n    def __getitem__(self, index):    # p[0], p[-1], p[1:3]\n        return self.songs[index]\n\n    def __contains__(self, song):    # \"Hey Jude\" in p\n        return song in self.songs\n\n    def __iter__(self):              # for song in p\n        return iter(self.songs)\n\np = Playlist([\"Yesterday\", \"Hey Jude\", \"Help!\"])\nprint(len(p), p[0], p[-1])     # 3 Yesterday Help!\nprint(\"Hey Jude\" in p)         # True\nfor song in p:\n    print(song)\n```",
    "Each method hands the work to the list inside, which is the usual pattern: the object decides what the operation means, often by passing it on to the data it holds. `__getitem__` gets whatever was in the brackets, so slices like `p[1:3]` reach the list too. `__iter__` must return an iterator, and `iter(self.songs)` is the easy way to get one.",
    "Objects are true in an `if` unless they say otherwise. Python asks `__bool__` first and, if there isn't one, `__len__`, so a playlist with a length of 0 is already false: `if playlist:` reads naturally.",
    "Operators are special methods too: `+` calls `__add__`, `-` calls `__sub__`, `*` calls `__mul__`. They should return a **new** object rather than changing either side, the way `2 + 3` doesn't change the 2. For a type you don't handle, return `NotImplemented`, and Python raises a clear `TypeError`.",
    "```\nclass Vector:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\n    def __add__(self, other):\n        if not isinstance(other, Vector):\n            return NotImplemented\n        return Vector(self.x + other.x, self.y + other.y)\n\n    def __mul__(self, number):\n        return Vector(self.x * number, self.y * number)\n\n    def __repr__(self):\n        return f\"Vector({self.x}, {self.y})\"\n\nprint(Vector(1, 2) + Vector(3, 4))   # Vector(4, 6)\nprint(Vector(1, 2) * 3)              # Vector(3, 6)\n```",
    "`sum()` starts from `0`, so `sum(vectors)` first does `0 + vector`. The int doesn't know about vectors, so Python tries the vector's `__radd__` (\"right add\") with the 0. A `__radd__` that returns `self` when `other` is 0, and otherwise calls `__add__`, makes `sum` work.",
    "For ordering, writing `__eq__` and `__lt__` and putting `@functools.total_ordering` above the class fills in `<=`, `>` and `>=` for you. There are special methods for nearly everything: `__setitem__` for assigning with brackets, `__call__` to call an object like a function, and `__enter__` and `__exit__` for `with` blocks, which is how files close themselves.",
  ],
  sandboxCode: "class Playlist:\n    def __init__(self, songs):\n        self.songs = list(songs)\n\n    def __len__(self):\n        return len(self.songs)\n\n    def __getitem__(self, index):\n        return self.songs[index]\n\n    def __contains__(self, song):\n        return song in self.songs\n\n    def __iter__(self):\n        return iter(self.songs)\n\np = Playlist([\"Yesterday\", \"Hey Jude\", \"Help!\", \"Let It Be\"])\nprint(len(p), p[1:3])\nprint(\"Help!\" in p, \"Imagine\" in p)\nfor number, song in enumerate(p, start=1):\n    print(number, song)\nprint(bool(Playlist([])))",
  sandboxSnippets: [
    snippet("len and in", "class Playlist:\n    def __init__(self, songs):\n        self.songs = list(songs)\n\n    def __len__(self):\n        return len(self.songs)\n\n    def __getitem__(self, index):\n        return self.songs[index]\n\n    def __contains__(self, song):\n        return song in self.songs\n\n    def __iter__(self):\n        return iter(self.songs)\n\np = Playlist([\"A\", \"B\"])\nprint(len(p), \"A\" in p)"),
    snippet("Brackets and slices", "class Playlist:\n    def __init__(self, songs):\n        self.songs = list(songs)\n\n    def __len__(self):\n        return len(self.songs)\n\n    def __getitem__(self, index):\n        return self.songs[index]\n\n    def __contains__(self, song):\n        return song in self.songs\n\n    def __iter__(self):\n        return iter(self.songs)\n\np = Playlist(\"abcde\")\nprint(p[0], p[-1], p[1:3])"),
    snippet("Operators", "class Vector:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\n    def __add__(self, other):\n        if not isinstance(other, Vector):\n            return NotImplemented\n        return Vector(self.x + other.x, self.y + other.y)\n\n    def __mul__(self, number):\n        return Vector(self.x * number, self.y * number)\n\n    def __eq__(self, other):\n        return isinstance(other, Vector) and (self.x, self.y) == (other.x, other.y)\n\n    def __repr__(self):\n        return f\"Vector({self.x}, {self.y})\"\n\nprint(Vector(1, 1) + Vector(2, 3), Vector(2, 0) * 5)\ntry:\n    Vector(1, 1) + 5\nexcept TypeError as e:\n    print(\"TypeError:\", e)"),
    snippet("total_ordering", "from functools import total_ordering\n\n@total_ordering\nclass Size:\n    def __init__(self, n):\n        self.n = n\n    def __eq__(self, other):\n        return self.n == other.n\n    def __lt__(self, other):\n        return self.n < other.n\n\nprint(Size(1) <= Size(2), Size(3) > Size(2), Size(2) >= Size(5))"),
  ],
  readMore: { label: "Python docs: Emulating container types", url: "https://docs.python.org/3/reference/datamodel.html#emulating-container-types", source: "Python docs" },
  challenges: [
    task("easy", "How many cards?", {
      prompt: "Give `Deck` a `__len__`, so `len(deck)` is the number of cards.",
      starter: "class Deck:\n    def __init__(self, cards):\n        self.cards = list(cards)\n",
      hint: "`return len(self.cards)`.",
      solution: "class Deck:\n    def __init__(self, cards):\n        self.cards = list(cards)\n\n    def __len__(self):\n        return len(self.cards)",
      tests: [
        ["Three cards", "len(Deck([\"A\", \"K\", \"Q\"])) == 3"],
        ["None", "len(Deck([])) == 0"],
      ],
    }),
    task("easy", "On the team?", {
      prompt: "Give `Team` a `__contains__`, so `\"ana\" in team` works, ignoring upper and lower case.",
      starter: "class Team:\n    def __init__(self, members):\n        self.members = members\n",
      hint: "Compare lowercased names: `name.lower() in [m.lower() for m in self.members]`.",
      solution: "class Team:\n    def __init__(self, members):\n        self.members = members\n\n    def __contains__(self, name):\n        return name.lower() in [m.lower() for m in self.members]",
      tests: [
        ["Any case", "\"ana\" in Team([\"Ana\", \"Ben\"]) and \"BEN\" in Team([\"Ana\", \"Ben\"])"],
        ["Not on the team", "\"Cy\" not in Team([\"Ana\", \"Ben\"])"],
      ],
    }),
    task("easy", "Loop over it", {
      prompt: "Give `Playlist` an `__iter__`, so `for song in playlist` goes through its songs.",
      starter: "class Playlist:\n    def __init__(self, songs):\n        self.songs = songs\n",
      hint: "`return iter(self.songs)`.",
      solution: "class Playlist:\n    def __init__(self, songs):\n        self.songs = songs\n\n    def __iter__(self):\n        return iter(self.songs)",
      tests: [
        ["A for loop", "[s.upper() for s in Playlist([\"a\", \"b\"])] == [\"A\", \"B\"]"],
        ["list() works too", "list(Playlist([\"x\", \"y\", \"z\"])) == [\"x\", \"y\", \"z\"]"],
      ],
    }),
    task("medium", "Brackets", {
      prompt: "Give `Shelf` a `__getitem__`, so `shelf[0]`, `shelf[-1]` and slices like `shelf[1:3]` work on its books.",
      starter: "class Shelf:\n    def __init__(self, books):\n        self.books = books\n",
      hint: "Pass the index straight to the list: `return self.books[index]`.",
      solution: "class Shelf:\n    def __init__(self, books):\n        self.books = books\n\n    def __getitem__(self, index):\n        return self.books[index]",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\n",
      tests: [
        ["Indexes", "(lambda s: (s[0], s[-1]))(Shelf([\"Dune\", \"Emma\", \"Ulysses\"])) == (\"Dune\", \"Ulysses\")"],
        ["A slice", "Shelf([\"Dune\", \"Emma\", \"Ulysses\"])[1:3] == [\"Emma\", \"Ulysses\"]"],
        ["Too far", "_raises(lambda: Shelf([])[0]) == \"IndexError\""],
      ],
    }),
    task("medium", "Adding vectors", {
      prompt: "Give `Vector` an `__add__` that returns a new vector, plus `__eq__` and a `__repr__` like `Vector(4, 6)`. Adding anything that isn't a `Vector` should give `NotImplemented`.",
      starter: "class Vector:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n",
      hint: "In `__add__`, `return Vector(self.x + other.x, self.y + other.y)`.",
      solution: "class Vector:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\n    def __add__(self, other):\n        if not isinstance(other, Vector):\n            return NotImplemented\n        return Vector(self.x + other.x, self.y + other.y)\n\n    def __eq__(self, other):\n        return isinstance(other, Vector) and (self.x, self.y) == (other.x, other.y)\n\n    def __repr__(self):\n        return f\"Vector({self.x}, {self.y})\"",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\n",
      tests: [
        ["Adding", "Vector(1, 2) + Vector(3, 4) == Vector(4, 6)"],
        ["repr", "repr(Vector(1, 2) + Vector(3, 4)) == \"Vector(4, 6)\""],
        ["A new object", "(lambda a: (a + Vector(1, 1), a.x)[1])(Vector(5, 5)) == 5"],
        ["Not a vector", "_raises(lambda: Vector(1, 1) + 3) == \"TypeError\""],
      ],
    }),
    task("medium", "Empty means false", {
      prompt: "Make an `Inbox` with no messages count as false in an `if`, and one with messages as true.",
      starter: "class Inbox:\n    def __init__(self):\n        self.messages = []\n\n    def receive(self, message):\n        self.messages.append(message)\n",
      hint: "A `__len__` (or `__bool__`) is enough.",
      solution: "class Inbox:\n    def __init__(self):\n        self.messages = []\n\n    def receive(self, message):\n        self.messages.append(message)\n\n    def __len__(self):\n        return len(self.messages)",
      tests: [
        ["Empty", "bool(Inbox()) is False"],
        ["With mail", "(lambda i: (i.receive(\"hi\"), bool(i))[1])(Inbox()) is True"],
      ],
    }),
    task("hard", "Money maths", {
      prompt: "Define `Money(cents)` with `+` and `-` (between two `Money`s), `*` by a whole number, `==`, and a `__str__` like `€12.50`. Adding a plain number should raise `TypeError`.",
      hint: "Store whole cents to avoid float rounding. Return `NotImplemented` for the wrong types. `f\"€{self.cents // 100}.{self.cents % 100:02d}\"`.",
      solution: "class Money:\n    def __init__(self, cents):\n        self.cents = cents\n\n    def __add__(self, other):\n        if not isinstance(other, Money):\n            return NotImplemented\n        return Money(self.cents + other.cents)\n\n    def __sub__(self, other):\n        if not isinstance(other, Money):\n            return NotImplemented\n        return Money(self.cents - other.cents)\n\n    def __mul__(self, times):\n        if not isinstance(times, int):\n            return NotImplemented\n        return Money(self.cents * times)\n\n    def __eq__(self, other):\n        return isinstance(other, Money) and self.cents == other.cents\n\n    def __str__(self):\n        return f\"€{self.cents // 100}.{self.cents % 100:02d}\"",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\n",
      tests: [
        ["Adding and showing", "str(Money(1000) + Money(250)) == \"€12.50\""],
        ["Taking away and times", "Money(500) - Money(120) == Money(380) and str(Money(199) * 3) == \"€5.97\""],
        ["Not a number", "_raises(lambda: Money(100) + 5) == \"TypeError\""],
      ],
    }),
    task("hard", "sum() of vectors", {
      prompt: "`sum(vectors)` fails because it starts by adding `0` to a vector. Add a `__radd__` so it works.",
      starter: "class Vector:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\n    def __add__(self, other):\n        if not isinstance(other, Vector):\n            return NotImplemented\n        return Vector(self.x + other.x, self.y + other.y)\n\n    def __mul__(self, number):\n        return Vector(self.x * number, self.y * number)\n\n    def __eq__(self, other):\n        return isinstance(other, Vector) and (self.x, self.y) == (other.x, other.y)\n\n    def __repr__(self):\n        return f\"Vector({self.x}, {self.y})\"\n",
      hint: "When `other == 0`, return `self`; otherwise `return self + other`.",
      solution: "class Vector:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\n    def __add__(self, other):\n        if not isinstance(other, Vector):\n            return NotImplemented\n        return Vector(self.x + other.x, self.y + other.y)\n\n    def __mul__(self, number):\n        return Vector(self.x * number, self.y * number)\n\n    def __eq__(self, other):\n        return isinstance(other, Vector) and (self.x, self.y) == (other.x, other.y)\n\n    def __repr__(self):\n        return f\"Vector({self.x}, {self.y})\"\n\n    def __radd__(self, other):\n        if other == 0:\n            return self\n        return self + other",
      tests: [
        ["sum works", "sum([Vector(1, 2), Vector(3, 4), Vector(-1, 0)]) == Vector(3, 6)"],
        ["One vector", "sum([Vector(5, 5)]) == Vector(5, 5)"],
      ],
    }),
    task("expert", "Card order", {
      prompt: "Define `Card(rank)` for ranks `\"2\"` to `\"10\"`, `\"J\"`, `\"Q\"`, `\"K\"`, `\"A\"` (in that order), with `__eq__`, `__lt__` and `@total_ordering`, so all comparisons, `sorted` and `max` work. Add a `__repr__` like `Card('Q')`.",
      starter: "from functools import total_ordering\n\nRANKS = [\"2\", \"3\", \"4\", \"5\", \"6\", \"7\", \"8\", \"9\", \"10\", \"J\", \"Q\", \"K\", \"A\"]\n",
      hint: "Compare `RANKS.index(self.rank)` with `RANKS.index(other.rank)`.",
      solution: "from functools import total_ordering\n\nRANKS = [\"2\", \"3\", \"4\", \"5\", \"6\", \"7\", \"8\", \"9\", \"10\", \"J\", \"Q\", \"K\", \"A\"]\n\n@total_ordering\nclass Card:\n    def __init__(self, rank):\n        self.rank = rank\n\n    def _value(self):\n        return RANKS.index(self.rank)\n\n    def __eq__(self, other):\n        return isinstance(other, Card) and self.rank == other.rank\n\n    def __lt__(self, other):\n        return self._value() < other._value()\n\n    def __repr__(self):\n        return f\"Card({self.rank!r})\"",
      tests: [
        ["Sorted", "repr(sorted([Card(\"K\"), Card(\"10\"), Card(\"A\"), Card(\"2\")])) == \"[Card('2'), Card('10'), Card('K'), Card('A')]\""],
        ["All comparisons", "Card(\"J\") < Card(\"Q\") and Card(\"A\") > Card(\"K\") and Card(\"5\") >= Card(\"5\") and Card(\"3\") <= Card(\"4\")"],
        ["max", "max([Card(\"9\"), Card(\"J\"), Card(\"10\")]) == Card(\"J\")"],
      ],
    }),
    task("expert", "A grid", {
      prompt: "Define `Grid(width, height, fill=\".\")` holding a cell for each `(x, y)`. `grid[x, y]` reads a cell and `grid[x, y] = \"#\"` sets one (both raise `IndexError(\"Off the grid\")` outside it), `len(grid)` is the number of cells, and `str(grid)` shows the rows, top to bottom, joined with line breaks.",
      hint: "Keep a list of rows. `__getitem__(self, pos)` and `__setitem__(self, pos, value)` receive the tuple `(x, y)`; check `0 <= x < width` and `0 <= y < height`.",
      solution: "class Grid:\n    def __init__(self, width, height, fill=\".\"):\n        self.width = width\n        self.height = height\n        self.rows = [[fill] * width for _ in range(height)]\n\n    def _check(self, pos):\n        x, y = pos\n        if not (0 <= x < self.width and 0 <= y < self.height):\n            raise IndexError(\"Off the grid\")\n        return x, y\n\n    def __getitem__(self, pos):\n        x, y = self._check(pos)\n        return self.rows[y][x]\n\n    def __setitem__(self, pos, value):\n        x, y = self._check(pos)\n        self.rows[y][x] = value\n\n    def __len__(self):\n        return self.width * self.height\n\n    def __str__(self):\n        return \"\\n\".join(\"\".join(row) for row in self.rows)",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["Setting and showing", "(lambda g: (g.__setitem__((0, 0), \"#\"), g.__setitem__((2, 1), \"@\"), str(g))[2])(Grid(3, 2)) == \"#..\\n..@\""],
        ["Reading and len", "(lambda g: (g[1, 1], len(g)))(Grid(4, 3, \"~\")) == (\"~\", 12)"],
        ["Off the grid", "_error(lambda: Grid(2, 2)[2, 0]) == \"IndexError: Off the grid\" and _error(Grid(2, 2).__setitem__, (0, -1), \"x\") == \"IndexError: Off the grid\""],
      ],
    }),
  ],
  questions: [
    mc("What does `len(obj)` call?", ["`obj.length()`", "`obj.__len__()`", "`obj.__size__()`", "`obj.count()`"], 1),
    mc("Which special method makes `x in obj` work?", ["`__in__`", "`__has__`", "`__contains__`", "`__find__`"], 2),
    mc("What should `__iter__` return?", ["An iterator, such as `iter(self.items)`", "A list", "The first item", "`self.items` always"], 0),
    mc("An object has `__len__` but no `__bool__`. When is it false in an `if`?", ["Never", "Always", "When it was just made", "When its length is 0"], 3),
    mc("What should `__add__` return?", ["Nothing; it changes `self`", "A new object with the result", "The other object", "A string"], 1),
    mc("What should `__add__` return for a type it can't handle?", ["`NotImplemented`", "`None`", "`0`", "`False`"], 0),
    qShort("Which special method lets `sum()` start from 0 with your objects? (with underscores)", "__radd__"),
    mc("What does `@functools.total_ordering` do?", ["Sorts the list", "Makes objects equal", "Adds `__len__`", "Fills in `<=`, `>` and `>=` from `__eq__` and `__lt__`"], 3),
    mc("`grid[2, 3] = \"#\"` calls which method?", ["`__getitem__`", "`__set__`", "`__setitem__`", "`__call__`"], 2),
    mc("Which special methods make an object work with `with`?", ["`__enter__` and `__exit__`", "`__open__` and `__close__`", "`__start__` and `__stop__`", "`__with__`"], 0),
  ],
})
