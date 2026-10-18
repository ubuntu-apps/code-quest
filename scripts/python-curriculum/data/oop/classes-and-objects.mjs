// Classes and objects topic: Classes and objects. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "classes_basics",
  title: "Classes and objects",
  paragraphs: [
    "So far your data has lived in lists and dicts, and the code that works on it in separate functions. A **class** bundles the two together into a new type of your own. You've been using objects all along: `\"hi\"` is an object of the class `str`, and `\"hi\".upper()` is something that kind of object can do. Now you'll make your own.",
    "```\nclass Dog:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n\nrex = Dog(\"Rex\", 3)\nprint(rex.name, rex.age)   # Rex 3\n```",
    "`class Dog:` describes what a dog is. Calling `Dog(\"Rex\", 3)` makes a new dog, called an **instance** or **object** of the class. Python creates the empty object, then calls the special method `__init__` (short for \"initialise\"), passing the new object as the first parameter, `self`, followed by your arguments. `self.name = name` stores the value as an **attribute** on that particular object, reached afterwards with a dot: `rex.name`.",
    "Every object gets its own attributes, so changing one dog doesn't touch another:",
    "```\nrex = Dog(\"Rex\", 3)\nfido = Dog(\"Fido\", 5)\nrex.age = 4\nprint(rex.age, fido.age)        # 4 5\nprint(type(rex).__name__)       # Dog\nprint(isinstance(fido, Dog))    # True\n```",
    "Class names use CapWords (`Dog`, `BankAccount`), while attributes are lowercase like other variables. `__init__` parameters can have defaults, just like a function's: `def __init__(self, name, age=0)` lets you write `Dog(\"Pip\")`. Leave out a required argument and you get `TypeError: Dog.__init__() missing 1 required positional argument: 'age'`; read an attribute that was never set and you get `AttributeError: 'Dog' object has no attribute 'colour'`.",
    "Why not just use a dict like `{\"name\": \"Rex\", \"age\": 3}`? A class gives every object the same shape, gives the type a name you can check with `isinstance`, and, from the next lesson on, holds the functions that belong with the data. You've actually written a class already: `class InvalidAgeError(Exception): pass` in the errors section made a new kind of exception.",
    "One thing a plain class can't do yet is print nicely: `print(rex)` shows something like `<__main__.Dog object at 0x7f3a...>`. A later lesson in this section fixes that.",
  ],
  sandboxCode: "class Dog:\n    def __init__(self, name, age=0):\n        self.name = name\n        self.age = age\n\ndogs = [Dog(\"Rex\", 3), Dog(\"Fido\", 5), Dog(\"Pip\")]\nfor dog in dogs:\n    print(dog.name, \"is\", dog.age)\nprint(isinstance(dogs[0], Dog))",
  sandboxSnippets: [
    snippet("A class", "class Dog:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n\nd = Dog(\"Rex\", 3)\nprint(d.name, d.age)"),
    snippet("Separate objects", "class Dog:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n\na = Dog(\"A\", 1)\nb = Dog(\"B\", 2)\na.age += 10\nprint(a.age, b.age)"),
    snippet("A missing argument", "class Dog:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n\ntry:\n    Dog(\"Rex\")\nexcept TypeError as e:\n    print(\"TypeError:\", e)"),
    snippet("Its attributes", "class Dog:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n\nprint(vars(Dog(\"Rex\", 3)))"),
  ],
  readMore: { label: "Python tutorial: Classes", url: "https://docs.python.org/3/tutorial/classes.html#a-first-look-at-classes", source: "Python docs" },
  challenges: [
    task("easy", "Your first class", {
      prompt: "Define a class `Book` whose `__init__` takes a `title` and an `author` and stores them as attributes.",
      hint: "`def __init__(self, title, author):` then `self.title = title` and `self.author = author`.",
      solution: "class Book:\n    def __init__(self, title, author):\n        self.title = title\n        self.author = author",
      tests: [
        ["title and author", "(lambda b: (b.title, b.author))(Book(\"Dune\", \"Frank Herbert\")) == (\"Dune\", \"Frank Herbert\")"],
        ["Two books", "Book(\"A\", \"X\").title != Book(\"B\", \"Y\").title"],
      ],
    }),
    task("easy", "Make an object", {
      prompt: "Create a `Point` called `p` at x 3, y 4, and set `total` to `p.x + p.y`.",
      starter: "class Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n",
      hint: "`p = Point(3, 4)`.",
      solution: "class Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\np = Point(3, 4)\ntotal = p.x + p.y",
      tests: [
        ["p is a Point", "isinstance(p, Point) and (p.x, p.y) == (3, 4)"],
        ["total is 7", "total == 7"],
      ],
    }),
    task("easy", "A starting score", {
      prompt: "Define a class `Player` with a `name` and a `score` that defaults to 0.",
      hint: "Give the parameter a default: `def __init__(self, name, score=0):`.",
      solution: "class Player:\n    def __init__(self, name, score=0):\n        self.name = name\n        self.score = score",
      tests: [
        ["Default score", "Player(\"Ana\").score == 0"],
        ["Given score", "Player(\"Ben\", 12).score == 12 and Player(\"Ben\", 12).name == \"Ben\""],
      ],
    }),
    task("medium", "Where did the name go?", {
      prompt: "`Cat(\"Tom\").name` raises `AttributeError`. Fix the class.",
      starter: "class Cat:\n    def __init__(self, name):\n        name = name\n",
      hint: "`name = name` only sets a local variable. Store it on the object: `self.name = name`.",
      solution: "class Cat:\n    def __init__(self, name):\n        self.name = name",
      tests: [
        ["The name is stored", "Cat(\"Tom\").name == \"Tom\""],
      ],
    }),
    task("medium", "Separate scores", {
      prompt: "Create two players, `ana` and `ben`. Give `ana` 10 points by changing her `score`, and set `scores` to the tuple `(ana.score, ben.score)`.",
      starter: "class Player:\n    def __init__(self, name, score=0):\n        self.name = name\n        self.score = score\n",
      hint: "`ana.score += 10` changes only that object.",
      solution: "class Player:\n    def __init__(self, name, score=0):\n        self.name = name\n        self.score = score\n\nana = Player(\"Ana\")\nben = Player(\"Ben\")\nana.score += 10\nscores = (ana.score, ben.score)",
      tests: [
        ["scores is (10, 0)", "scores == (10, 0)"],
        ["Two players", "isinstance(ana, Player) and isinstance(ben, Player) and ana is not ben"],
      ],
    }),
    task("medium", "Cheap products", {
      prompt: "Make a `Product` for each `(name, price)` pair in `data`, as the list `products`, then set `cheap` to the names of those costing less than 5.",
      starter: "class Product:\n    def __init__(self, name, price):\n        self.name = name\n        self.price = price\n\ndata = [(\"pen\", 1.5), (\"book\", 12.0), (\"mug\", 4.99), (\"lamp\", 25.0)]\n",
      hint: "`[Product(n, p) for n, p in data]`, then a comprehension over `products`.",
      solution: "class Product:\n    def __init__(self, name, price):\n        self.name = name\n        self.price = price\n\ndata = [(\"pen\", 1.5), (\"book\", 12.0), (\"mug\", 4.99), (\"lamp\", 25.0)]\nproducts = [Product(name, price) for name, price in data]\ncheap = [p.name for p in products if p.price < 5]",
      tests: [
        ["Four products", "len(products) == 4 and all(isinstance(p, Product) for p in products)"],
        ["cheap is right", "cheap == [\"pen\", \"mug\"]"],
      ],
    }),
    task("hard", "Top of the class", {
      prompt: "Define `Student` (a `name` and a `grade`), then `top_student(students)`, which returns the name of the student with the highest grade, or `None` for an empty list.",
      hint: "`max(students, key=lambda s: s.grade)` finds the object; return its `.name`.",
      solution: "class Student:\n    def __init__(self, name, grade):\n        self.name = name\n        self.grade = grade\n\ndef top_student(students):\n    if not students:\n        return None\n    return max(students, key=lambda s: s.grade).name",
      tests: [
        ["The best grade", "top_student([Student(\"Ana\", 81), Student(\"Ben\", 94), Student(\"Cy\", 77)]) == \"Ben\""],
        ["Nobody", "top_student([]) is None"],
      ],
    }),
    task("hard", "Count the dogs", {
      prompt: "Define `count_dogs(things)` that returns how many items in the list are `Dog` objects.",
      starter: "class Dog:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n",
      hint: "`sum(1 for t in things if isinstance(t, Dog))`.",
      solution: "class Dog:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n\ndef count_dogs(things):\n    return sum(1 for t in things if isinstance(t, Dog))",
      tests: [
        ["Mixed list", "count_dogs([Dog(\"Rex\", 3), \"Rex\", {\"name\": \"Fido\"}, Dog(\"Pip\", 1)]) == 2"],
        ["None", "count_dogs([1, 2]) == 0"],
      ],
    }),
    task("expert", "Contacts from text", {
      prompt: "Define `Contact` (`name`, `email`, and `phone` defaulting to `None`) and `parse_contact(text)`, which turns `\"Ana; ana@example.com; 555-1234\"` (phone optional) into a `Contact`, trimming spaces. Any other number of parts raises `ValueError(\"Bad contact: <text>\")`.",
      hint: "Split on `\";\"` and strip each part. With 2 or 3 parts, `Contact(*parts)` works.",
      solution: "class Contact:\n    def __init__(self, name, email, phone=None):\n        self.name = name\n        self.email = email\n        self.phone = phone\n\ndef parse_contact(text):\n    parts = [p.strip() for p in text.split(\";\")]\n    if len(parts) not in (2, 3):\n        raise ValueError(f\"Bad contact: {text}\")\n    return Contact(*parts)",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["With a phone", "(lambda c: (c.name, c.email, c.phone))(parse_contact(\"Ana; ana@example.com; 555-1234\")) == (\"Ana\", \"ana@example.com\", \"555-1234\")"],
        ["Without a phone", "(lambda c: (c.name, c.phone))(parse_contact(\"Ben;ben@example.com\")) == (\"Ben\", None)"],
        ["Bad text", "_error(parse_contact, \"just a name\") == \"ValueError: Bad contact: just a name\""],
      ],
    }),
    task("expert", "What changed?", {
      prompt: "Define `changes(old, new)` that compares two objects of the same class and returns the sorted names of the attributes whose values differ. `vars(obj)` gives an object's attributes as a dict.",
      hint: "Loop over `vars(old)` and compare each value with `vars(new)[name]`.",
      solution: "def changes(old, new):\n    before = vars(old)\n    after = vars(new)\n    return sorted(name for name in before if before[name] != after[name])",
      setup: "class _P:\n    def __init__(self, name, age, city):\n        self.name = name\n        self.age = age\n        self.city = city\n",
      tests: [
        ["Two changes", "changes(_P(\"Ana\", 30, \"Oslo\"), _P(\"Ana\", 31, \"Rome\")) == [\"age\", \"city\"]"],
        ["No change", "changes(_P(\"Ben\", 5, \"Nis\"), _P(\"Ben\", 5, \"Nis\")) == []"],
      ],
    }),
  ],
  questions: [
    mc("What does a class describe?", ["A single value", "A new type: what its objects hold and can do", "A list of functions", "A file"], 1),
    mc("What does `Dog(\"Rex\", 3)` do?", ["Defines the class", "Prints a dog", "Creates a new Dog object and runs `__init__`", "Calls a function named Rex"], 2),
    mc("Inside `__init__`, what is `self`?", ["The new object being set up", "The class", "The first argument you pass", "A keyword for printing"], 0),
    mc("What does `self.age = age` do?", ["Makes a local variable", "Compares two ages", "Deletes age", "Stores `age` as an attribute of the object"], 3),
    mc("Two objects of the same class: change one's attribute. What happens to the other?", ["It changes too", "Nothing: each object has its own attributes", "An error", "It is deleted"], 1),
    mc("How should a class be named?", ["In CapWords, like `BankAccount`", "In lowercase, like `bank_account`", "In capitals, like `BANK`", "Any way, with spaces"], 0),
    qShort("What is the name of the special method that sets up a new object? (with underscores)", "__init__"),
    mc("Reading an attribute that was never set raises what?", ["`NameError`", "`KeyError`", "`TypeError`", "`AttributeError`"], 3),
    mc("Which checks whether `x` is a `Dog`?", ["`x == Dog`", "`Dog(x)`", "`isinstance(x, Dog)`", "`x.Dog`"], 2),
    mc("What does `vars(obj)` give?", ["A dict of the object's attributes", "The class name", "The methods", "A copy of the object"], 0),
  ],
})
