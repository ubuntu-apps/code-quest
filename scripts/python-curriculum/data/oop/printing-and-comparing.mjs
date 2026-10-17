// Classes and objects topic: Printing and comparing objects. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "dunder_methods",
  title: "Printing and comparing objects",
  paragraphs: [
    "Out of the box, your objects don't print or compare in a useful way: `print(p)` shows `<__main__.Point object at 0x...>`, and two points with the same `x` and `y` aren't equal. Python fixes both with **special methods**, whose names start and end with two underscores (so they're nicknamed \"dunder\" methods). You never call them yourself; Python calls them when your object is printed, compared, and so on. `__init__` is the one you already know.",
    "`__str__` returns the text `print()` and `str()` use. `__repr__` returns the text Python uses everywhere else: in the console, inside a printed list, and in error messages. By convention `__repr__` looks like the code that would make the object, so it's clear what you're looking at.",
    "```\nclass Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\n    def __str__(self):\n        return f\"({self.x}, {self.y})\"\n\n    def __repr__(self):\n        return f\"Point({self.x}, {self.y})\"\n\np = Point(1, 2)\nprint(p)                # (1, 2)\nprint([p, Point(3, 4)]) # [Point(1, 2), Point(3, 4)]\nprint(f\"{p} and {p!r}\") # (1, 2) and Point(1, 2)\n```",
    "If a class only has `__repr__`, `str()` and `print()` use that too, so `__repr__` is the one to write first. Both must **return** a string; a `__str__` that prints instead fails with `TypeError: __str__ returned non-string`.",
    "For `==`, Python calls `__eq__`. Without it, two objects are only equal if they are the very same object, like `is`. With it, you decide what equal means. When the other value is a different type, return the special value `NotImplemented`, which tells Python \"I don't know how to compare with that\" (and `==` then gives `False`).",
    "```\nclass Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\n    def __eq__(self, other):\n        if not isinstance(other, Point):\n            return NotImplemented\n        return self.x == other.x and self.y == other.y\n\na, b = Point(1, 2), Point(1, 2)\nprint(a == b, a is b)    # True False\nprint(a == (1, 2))       # False\n```",
    "Defining `__eq__` has a side effect: objects can no longer go in a set or be dict keys, because Python can't be sure equal objects would land in the same place. Adding `__hash__`, returning `hash(...)` of the same values `__eq__` compares, brings that back. Only do it if the values won't change after the object is made.",
    "`__lt__` (less than) is called for `<`, and it's all `sorted()` and `min()` need to put your objects in order. Return whether `self` should come before `other`.",
    "```\nclass Version:\n    def __init__(self, major, minor):\n        self.major = major\n        self.minor = minor\n\n    def __lt__(self, other):\n        return (self.major, self.minor) < (other.major, other.minor)\n\n    def __repr__(self):\n        return f\"{self.major}.{self.minor}\"\n\nprint(sorted([Version(2, 0), Version(1, 10), Version(1, 2)]))   # [1.2, 1.10, 2.0]\n```",
  ],
  sandboxCode: "class Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\n    def __str__(self):\n        return f\"({self.x}, {self.y})\"\n\n    def __repr__(self):\n        return f\"Point({self.x}, {self.y})\"\n\n    def __eq__(self, other):\n        if not isinstance(other, Point):\n            return NotImplemented\n        return self.x == other.x and self.y == other.y\n\npoints = [Point(3, 4), Point(1, 2)]\nprint(points[0])\nprint(points)\nprint(Point(1, 2) == Point(1, 2), Point(1, 2) == Point(2, 1))",
  sandboxSnippets: [
    snippet("Before: the default", "class Plain:\n    pass\n\nprint(Plain() == Plain())\nprint(repr(Plain())[:22])"),
    snippet("__str__ and __repr__", "class Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\n    def __str__(self):\n        return f\"({self.x}, {self.y})\"\n\n    def __repr__(self):\n        return f\"Point({self.x}, {self.y})\"\n\n    def __eq__(self, other):\n        if not isinstance(other, Point):\n            return NotImplemented\n        return self.x == other.x and self.y == other.y\n\np = Point(5, 6)\nprint(str(p), repr(p))"),
    snippet("Equality", "class Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\n    def __str__(self):\n        return f\"({self.x}, {self.y})\"\n\n    def __repr__(self):\n        return f\"Point({self.x}, {self.y})\"\n\n    def __eq__(self, other):\n        if not isinstance(other, Point):\n            return NotImplemented\n        return self.x == other.x and self.y == other.y\n\nprint(Point(0, 0) == Point(0, 0))\nprint(Point(0, 0) != Point(0, 1))"),
    snippet("Sorting", "class Box:\n    def __init__(self, size):\n        self.size = size\n    def __lt__(self, other):\n        return self.size < other.size\n    def __repr__(self):\n        return f\"Box({self.size})\"\n\nprint(sorted([Box(3), Box(1), Box(2)]))\nprint(max([Box(3), Box(9)]))"),
  ],
  readMore: { label: "Python docs: Special method names", url: "https://docs.python.org/3/reference/datamodel.html#basic-customization", source: "Python docs" },
  challenges: [
    task("easy", "Print a book", {
      prompt: "Give `Book` a `__str__` method so that printing a book shows `Dune by Frank Herbert`.",
      starter: "class Book:\n    def __init__(self, title, author):\n        self.title = title\n        self.author = author\n",
      hint: "`def __str__(self): return f\"{self.title} by {self.author}\"`.",
      solution: "class Book:\n    def __init__(self, title, author):\n        self.title = title\n        self.author = author\n\n    def __str__(self):\n        return f\"{self.title} by {self.author}\"",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\n",
      tests: [
        ["str(book)", "str(Book(\"Dune\", \"Frank Herbert\")) == \"Dune by Frank Herbert\""],
        ["print(book)", "_out(print, Book(\"Emma\", \"Jane Austen\")) == \"Emma by Jane Austen\\n\""],
      ],
    }),
    task("easy", "A clear repr", {
      prompt: "Give `Point` a `__repr__` that returns `Point(1, 2)` (with its own numbers), so lists of points are readable.",
      starter: "class Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n",
      hint: "`return f\"Point({self.x}, {self.y})\"`.",
      solution: "class Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\n    def __repr__(self):\n        return f\"Point({self.x}, {self.y})\"",
      tests: [
        ["repr", "repr(Point(1, 2)) == \"Point(1, 2)\""],
        ["In a list", "str([Point(0, 5), Point(-1, 3)]) == \"[Point(0, 5), Point(-1, 3)]\""],
      ],
    }),
    task("easy", "Show money", {
      prompt: "Give `Money` a `__str__` that shows the amount in euros with two decimal places, like `€12.50`.",
      starter: "class Money:\n    def __init__(self, amount):\n        self.amount = amount\n",
      hint: "`f\"€{self.amount:.2f}\"`.",
      solution: "class Money:\n    def __init__(self, amount):\n        self.amount = amount\n\n    def __str__(self):\n        return f\"€{self.amount:.2f}\"",
      tests: [
        ["12.5", "str(Money(12.5)) == \"€12.50\""],
        ["3", "f\"{Money(3)}\" == \"€3.00\""],
      ],
    }),
    task("medium", "Equal points", {
      prompt: "Give `Point` an `__eq__` so two points with the same `x` and `y` are equal. Comparing with anything that isn't a `Point` should return `NotImplemented`.",
      starter: "class Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n",
      hint: "Check `isinstance(other, Point)` first, then compare both attributes.",
      solution: "class Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\n    def __eq__(self, other):\n        if not isinstance(other, Point):\n            return NotImplemented\n        return self.x == other.x and self.y == other.y",
      tests: [
        ["Same values", "Point(1, 2) == Point(1, 2)"],
        ["Different", "Point(1, 2) != Point(2, 1)"],
        ["Not a point", "(Point(1, 2) == (1, 2)) is False and Point(1, 2).__eq__(\"x\") is NotImplemented"],
      ],
    }),
    task("medium", "Cards", {
      prompt: "Give `Card` a `__str__` returning `Q of hearts` and a `__repr__` returning `Card('Q', 'hearts')`.",
      starter: "class Card:\n    def __init__(self, rank, suit):\n        self.rank = rank\n        self.suit = suit\n",
      hint: "In `__repr__`, `{self.rank!r}` adds the quotes for you.",
      solution: "class Card:\n    def __init__(self, rank, suit):\n        self.rank = rank\n        self.suit = suit\n\n    def __str__(self):\n        return f\"{self.rank} of {self.suit}\"\n\n    def __repr__(self):\n        return f\"Card({self.rank!r}, {self.suit!r})\"",
      tests: [
        ["str", "str(Card(\"Q\", \"hearts\")) == \"Q of hearts\""],
        ["repr", "repr(Card(\"Q\", \"hearts\")) == \"Card('Q', 'hearts')\""],
        ["A hand", "str([Card(\"A\", \"spades\")]) == \"[Card('A', 'spades')]\""],
      ],
    }),
    task("medium", "Return, don't print", {
      prompt: "Printing a `Pet` crashes with `TypeError: __str__ returned non-string`. Fix `__str__`.",
      starter: "class Pet:\n    def __init__(self, name, kind):\n        self.name = name\n        self.kind = kind\n\n    def __str__(self):\n        print(f\"{self.name} the {self.kind}\")\n",
      hint: "`__str__` must return the text, not print it.",
      solution: "class Pet:\n    def __init__(self, name, kind):\n        self.name = name\n        self.kind = kind\n\n    def __str__(self):\n        return f\"{self.name} the {self.kind}\"",
      tests: [
        ["str(pet)", "str(Pet(\"Tom\", \"cat\")) == \"Tom the cat\""],
      ],
    }),
    task("hard", "Sort the versions", {
      prompt: "Give `Version` the special methods so that `sorted` puts versions in order (compare `major`, then `minor`, then `patch`), `==` works, and `str` shows `1.4.2`.",
      starter: "class Version:\n    def __init__(self, major, minor, patch):\n        self.major = major\n        self.minor = minor\n        self.patch = patch\n",
      hint: "Compare tuples: `(self.major, self.minor, self.patch) < (other.major, other.minor, other.patch)` in `__lt__`, and the same with `==` in `__eq__`.",
      solution: "class Version:\n    def __init__(self, major, minor, patch):\n        self.major = major\n        self.minor = minor\n        self.patch = patch\n\n    def _key(self):\n        return (self.major, self.minor, self.patch)\n\n    def __lt__(self, other):\n        return self._key() < other._key()\n\n    def __eq__(self, other):\n        if not isinstance(other, Version):\n            return NotImplemented\n        return self._key() == other._key()\n\n    def __str__(self):\n        return f\"{self.major}.{self.minor}.{self.patch}\"",
      tests: [
        ["Sorted", "[str(v) for v in sorted([Version(1, 10, 0), Version(1, 2, 3), Version(0, 9, 9), Version(1, 2, 0)])] == [\"0.9.9\", \"1.2.0\", \"1.2.3\", \"1.10.0\"]"],
        ["Equal", "Version(1, 0, 0) == Version(1, 0, 0) and Version(1, 0, 0) != Version(1, 0, 1)"],
        ["Newest", "str(max([Version(2, 0, 0), Version(10, 0, 0)])) == \"10.0.0\""],
      ],
    }),
    task("hard", "Points in a set", {
      prompt: "Give `Point` `__eq__` and `__hash__`, so equal points count once in a set and can be used as dict keys.",
      starter: "class Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n",
      hint: "`__hash__` returns `hash((self.x, self.y))`, matching what `__eq__` compares.",
      solution: "class Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\n    def __eq__(self, other):\n        if not isinstance(other, Point):\n            return NotImplemented\n        return (self.x, self.y) == (other.x, other.y)\n\n    def __hash__(self):\n        return hash((self.x, self.y))",
      tests: [
        ["A set", "len({Point(1, 2), Point(1, 2), Point(3, 4)}) == 2"],
        ["A dict key", "{Point(0, 0): \"origin\"}[Point(0, 0)] == \"origin\""],
      ],
    }),
    task("expert", "Fractions", {
      prompt: "Define `Fraction(num, den)` that stores the fraction in lowest terms (use `math.gcd`), shows `3/4` with `str` (or just `2` when the bottom is 1), has `__repr__` `Fraction(3, 4)`, and compares equal when the values match.",
      starter: "import math\n",
      hint: "In `__init__`, divide both by `math.gcd(num, den)`. Compare `(num, den)` pairs in `__eq__`.",
      solution: "import math\n\nclass Fraction:\n    def __init__(self, num, den):\n        g = math.gcd(num, den)\n        self.num = num // g\n        self.den = den // g\n\n    def __str__(self):\n        if self.den == 1:\n            return str(self.num)\n        return f\"{self.num}/{self.den}\"\n\n    def __repr__(self):\n        return f\"Fraction({self.num}, {self.den})\"\n\n    def __eq__(self, other):\n        if not isinstance(other, Fraction):\n            return NotImplemented\n        return (self.num, self.den) == (other.num, other.den)",
      tests: [
        ["Lowest terms", "str(Fraction(6, 8)) == \"3/4\" and repr(Fraction(6, 8)) == \"Fraction(3, 4)\""],
        ["A whole number", "str(Fraction(10, 5)) == \"2\""],
        ["Equal values", "Fraction(1, 2) == Fraction(4, 8) and Fraction(1, 2) != Fraction(2, 3)"],
      ],
    }),
    task("expert", "Leaderboard order", {
      prompt: "Give `Player` a `__lt__` so that `sorted(players)` puts the highest `score` first, and players with equal scores in alphabetical `name` order, plus a `__repr__` like `Ana: 30`.",
      starter: "class Player:\n    def __init__(self, name, score):\n        self.name = name\n        self.score = score\n",
      hint: "\"Comes first\" means \"less than\": compare `(-self.score, self.name)` with `(-other.score, other.name)`.",
      solution: "class Player:\n    def __init__(self, name, score):\n        self.name = name\n        self.score = score\n\n    def __lt__(self, other):\n        return (-self.score, self.name) < (-other.score, other.name)\n\n    def __repr__(self):\n        return f\"{self.name}: {self.score}\"",
      tests: [
        ["Leaderboard", "str(sorted([Player(\"Cy\", 20), Player(\"Ana\", 30), Player(\"Ben\", 20), Player(\"Dee\", 5)])) == \"[Ana: 30, Ben: 20, Cy: 20, Dee: 5]\""],
        ["min is the leader", "repr(min([Player(\"Zed\", 1), Player(\"Amy\", 9)])) == \"Amy: 9\""],
      ],
    }),
  ],
  questions: [
    mc("What does `print(obj)` use to get its text?", ["`__init__`", "`__str__` (or `__repr__` if there is no `__str__`)", "`__eq__`", "`__print__`"], 1),
    mc("Where does Python use `__repr__`?", ["Only in `print`", "Only in files", "In the console, inside printed lists and in error messages", "Never"], 2),
    mc("By convention, what should `__repr__` look like?", ["The code that would make the object, like `Point(1, 2)`", "A sentence", "The memory address", "Nothing"], 0),
    mc("Without `__eq__`, when are two objects equal with `==`?", ["When their attributes match", "Always", "Never", "Only when they are the same object"], 3),
    mc("What should `__eq__` return when `other` is a different type?", ["`False`", "`NotImplemented`", "`None`", "An error"], 1),
    mc("Which special method does `sorted()` need?", ["`__lt__`", "`__sort__`", "`__str__`", "`__len__`"], 0),
    qShort("What does `f\"{p!r}\"` call on `p`? (the method name)", "__repr__"),
    mc("Why can't objects with `__eq__` go in a set straight away?", ["Sets only hold numbers", "They are too big", "They need `__lt__`", "They also need a matching `__hash__`"], 3),
    mc("What goes wrong if `__str__` prints instead of returning?", ["Nothing", "It prints twice", "`TypeError: __str__ returned non-string`", "It returns an empty string"], 2),
    mc("What does \"dunder\" stand for?", ["Double underscore", "Dynamic under", "Data under", "Default number"], 0),
  ],
})
