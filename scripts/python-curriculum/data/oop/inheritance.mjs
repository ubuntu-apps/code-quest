// Classes and objects topic: Inheritance. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "inheritance",
  title: "Inheritance",
  paragraphs: [
    "Classes often have a lot in common. Dogs and cats both have names and make sounds; managers and developers are both employees with names and salaries. **Inheritance** lets a new class start from an existing one: the new class (the **subclass**, or child) gets every attribute and method of the existing one (the **base class**, or parent), and then adds or changes what it needs.",
    "```\nclass Animal:\n    def __init__(self, name):\n        self.name = name\n\n    def speak(self):\n        return \"...\"\n\n    def describe(self):\n        return f\"{self.name} says {self.speak()}\"\n\nclass Dog(Animal):\n    def speak(self):\n        return \"Woof\"\n\nrex = Dog(\"Rex\")\nprint(rex.describe())   # Rex says Woof\n```",
    "`class Dog(Animal):` means \"a Dog is an Animal\". `Dog` writes no `__init__` or `describe`, so it uses `Animal`'s. It does write its own `speak`, which **overrides** the parent's. When you call a method, Python looks in the object's own class first, then its parent, then the parent's parent, and uses the first one it finds. That's why `describe`, written in `Animal`, ends up calling `Dog`'s `speak`.",
    "When a subclass needs more in `__init__`, it writes its own and calls the parent's with `super().__init__(...)`, so the parent still sets up its part. `super()` works for any method: it lets the child build on the parent's version instead of repeating it.",
    "```\nclass Employee:\n    def __init__(self, name, salary):\n        self.name = name\n        self.salary = salary\n\n    def describe(self):\n        return f\"{self.name} earns {self.salary}\"\n\nclass Manager(Employee):\n    def __init__(self, name, salary):\n        super().__init__(name, salary)   # name and salary, as before\n        self.team = []                   # plus a team\n\n    def describe(self):\n        return super().describe() + f\" and manages {len(self.team)} people\"\n\nboss = Manager(\"Ana\", 5000)\nboss.team.extend([\"Ben\", \"Cy\"])\nprint(boss.describe())   # Ana earns 5000 and manages 2 people\n```",
    "Forget the `super().__init__` call and the parent's setup never runs, so `boss.name` raises `AttributeError`. A subclass object counts as the parent type too: `isinstance(boss, Employee)` is `True`, and `issubclass(Manager, Employee)` is `True`. Every class ultimately inherits from `object`, which is where default behaviour like the `<... object at 0x...>` text comes from.",
    "Use inheritance for an \"is a\" relationship: a manager **is an** employee, a `ValueError` **is an** `Exception`. You've already used this: `class InvalidAgeError(ValueError)` made a new exception that `except ValueError` also catches. For a \"has a\" relationship, like a car that has an engine, give the class an attribute holding the other object instead; the last lesson of this section looks at that. Keep family trees shallow: one or two levels is usually plenty.",
  ],
  sandboxCode: "class Animal:\n    def __init__(self, name):\n        self.name = name\n\n    def speak(self):\n        return \"...\"\n\n    def describe(self):\n        return f\"{self.name} says {self.speak()}\"\n\nclass Dog(Animal):\n    def speak(self):\n        return \"Woof\"\n\nclass Cat(Animal):\n    def speak(self):\n        return \"Meow\"\n\nfor pet in [Dog(\"Rex\"), Cat(\"Tom\"), Animal(\"Generic\")]:\n    print(pet.describe())\nprint(isinstance(Dog(\"x\"), Animal), issubclass(Cat, Dog))",
  sandboxSnippets: [
    snippet("Override a method", "class Animal:\n    def __init__(self, name):\n        self.name = name\n\n    def speak(self):\n        return \"...\"\n\n    def describe(self):\n        return f\"{self.name} says {self.speak()}\"\n\nclass Cow(Animal):\n    def speak(self):\n        return \"Moo\"\n\nprint(Cow(\"Daisy\").describe())"),
    snippet("super().__init__", "class Employee:\n    def __init__(self, name, salary):\n        self.name = name\n        self.salary = salary\n\n    def describe(self):\n        return f\"{self.name} earns {self.salary}\"\n\nclass Intern(Employee):\n    def __init__(self, name):\n        super().__init__(name, 1000)\n        self.mentor = None\n\ni = Intern(\"Cy\")\nprint(i.describe(), i.mentor)"),
    snippet("Forgetting super", "class Employee:\n    def __init__(self, name, salary):\n        self.name = name\n        self.salary = salary\n\n    def describe(self):\n        return f\"{self.name} earns {self.salary}\"\n\nclass Broken(Employee):\n    def __init__(self, name, salary):\n        self.team = []\n\ntry:\n    Broken(\"Dee\", 1).describe()\nexcept AttributeError as e:\n    print(\"AttributeError:\", e)"),
    snippet("Is it one?", "class Animal:\n    def __init__(self, name):\n        self.name = name\n\n    def speak(self):\n        return \"...\"\n\n    def describe(self):\n        return f\"{self.name} says {self.speak()}\"\n\nclass Dog(Animal):\n    pass\n\nprint(isinstance(Dog(\"x\"), Animal), isinstance(Animal(\"y\"), Dog))\nprint(Dog.__mro__)"),
  ],
  readMore: { label: "Python tutorial: Inheritance", url: "https://docs.python.org/3/tutorial/classes.html#inheritance", source: "Python docs" },
  challenges: [
    task("easy", "A cat", {
      prompt: "Define `Cat`, a subclass of `Animal`, whose `speak` returns `Meow`.",
      starter: "class Animal:\n    def __init__(self, name):\n        self.name = name\n\n    def speak(self):\n        return \"...\"\n\n    def describe(self):\n        return f\"{self.name} says {self.speak()}\"\n",
      hint: "`class Cat(Animal):` with one method, `speak`.",
      solution: "class Animal:\n    def __init__(self, name):\n        self.name = name\n\n    def speak(self):\n        return \"...\"\n\n    def describe(self):\n        return f\"{self.name} says {self.speak()}\"\n\nclass Cat(Animal):\n    def speak(self):\n        return \"Meow\"",
      tests: [
        ["Cat speaks", "Cat(\"Tom\").speak() == \"Meow\""],
        ["describe is inherited", "Cat(\"Tom\").describe() == \"Tom says Meow\""],
        ["A Cat is an Animal", "issubclass(Cat, Animal)"],
      ],
    }),
    task("easy", "For free", {
      prompt: "Define `Truck` as a subclass of `Vehicle` that adds nothing (`pass`). Then make `t = Truck(\"Volvo\", 6)` and set `info` to `t.describe()`.",
      starter: "class Vehicle:\n    def __init__(self, make, wheels):\n        self.make = make\n        self.wheels = wheels\n\n    def describe(self):\n        return f\"{self.make} with {self.wheels} wheels\"\n",
      hint: "A class body of just `pass` inherits everything.",
      solution: "class Vehicle:\n    def __init__(self, make, wheels):\n        self.make = make\n        self.wheels = wheels\n\n    def describe(self):\n        return f\"{self.make} with {self.wheels} wheels\"\n\nclass Truck(Vehicle):\n    pass\n\nt = Truck(\"Volvo\", 6)\ninfo = t.describe()",
      tests: [
        ["info", "info == \"Volvo with 6 wheels\""],
        ["t is a Truck and a Vehicle", "type(t) is Truck and isinstance(t, Vehicle)"],
      ],
    }),
    task("easy", "Which are animals?", {
      prompt: "Set `checks` to a list of `True`/`False` values: whether each item in `things` is an `Animal` (dogs count).",
      starter: "class Animal:\n    def __init__(self, name):\n        self.name = name\n\n    def speak(self):\n        return \"...\"\n\n    def describe(self):\n        return f\"{self.name} says {self.speak()}\"\n\nclass Dog(Animal):\n    def speak(self):\n        return \"Woof\"\n\nthings = [Dog(\"Rex\"), \"Rex\", Animal(\"Generic\"), 42]\n",
      hint: "`[isinstance(t, Animal) for t in things]`.",
      solution: "class Animal:\n    def __init__(self, name):\n        self.name = name\n\n    def speak(self):\n        return \"...\"\n\n    def describe(self):\n        return f\"{self.name} says {self.speak()}\"\n\nclass Dog(Animal):\n    def speak(self):\n        return \"Woof\"\n\nthings = [Dog(\"Rex\"), \"Rex\", Animal(\"Generic\"), 42]\nchecks = [isinstance(t, Animal) for t in things]",
      tests: [
        ["checks is right", "checks == [True, False, True, False]"],
      ],
    }),
    task("medium", "A manager", {
      prompt: "Define `Manager`, a subclass of `Employee`, whose `__init__` takes the same arguments, calls the parent's `__init__`, and also creates an empty `team` list.",
      starter: "class Employee:\n    def __init__(self, name, salary):\n        self.name = name\n        self.salary = salary\n\n    def describe(self):\n        return f\"{self.name} earns {self.salary}\"\n",
      hint: "`super().__init__(name, salary)`, then `self.team = []`.",
      solution: "class Employee:\n    def __init__(self, name, salary):\n        self.name = name\n        self.salary = salary\n\n    def describe(self):\n        return f\"{self.name} earns {self.salary}\"\n\nclass Manager(Employee):\n    def __init__(self, name, salary):\n        super().__init__(name, salary)\n        self.team = []",
      tests: [
        ["Parent attributes", "(lambda m: (m.name, m.salary, m.team))(Manager(\"Ana\", 5000)) == (\"Ana\", 5000, [])"],
        ["Inherited method", "Manager(\"Ana\", 5000).describe() == \"Ana earns 5000\""],
        ["Own lists", "(lambda a, b: (a.team.append(\"x\"), b.team)[1])(Manager(\"A\", 1), Manager(\"B\", 1)) == []"],
      ],
    }),
    task("medium", "Where is the name?", {
      prompt: "`Student(\"Ana\", \"Oak School\").name` raises `AttributeError`. Fix `Student`.",
      starter: "class Person:\n    def __init__(self, name):\n        self.name = name\n\nclass Student(Person):\n    def __init__(self, name, school):\n        self.school = school\n",
      hint: "The parent's `__init__` never runs. Call `super().__init__(name)` first.",
      solution: "class Person:\n    def __init__(self, name):\n        self.name = name\n\nclass Student(Person):\n    def __init__(self, name, school):\n        super().__init__(name)\n        self.school = school",
      tests: [
        ["name and school", "(lambda s: (s.name, s.school))(Student(\"Ana\", \"Oak School\")) == (\"Ana\", \"Oak School\")"],
      ],
    }),
    task("medium", "Build on the parent", {
      prompt: "Give `Manager` a `describe` that adds ` and manages <n> people` to the parent's description, using `super()`.",
      starter: "class Employee:\n    def __init__(self, name, salary):\n        self.name = name\n        self.salary = salary\n\n    def describe(self):\n        return f\"{self.name} earns {self.salary}\"\n\nclass Manager(Employee):\n    def __init__(self, name, salary):\n        super().__init__(name, salary)\n        self.team = []\n",
      hint: "`return super().describe() + f\" and manages {len(self.team)} people\"`.",
      solution: "class Employee:\n    def __init__(self, name, salary):\n        self.name = name\n        self.salary = salary\n\n    def describe(self):\n        return f\"{self.name} earns {self.salary}\"\n\nclass Manager(Employee):\n    def __init__(self, name, salary):\n        super().__init__(name, salary)\n        self.team = []\n\n    def describe(self):\n        return super().describe() + f\" and manages {len(self.team)} people\"",
      tests: [
        ["With a team", "(lambda m: (m.team.extend([\"Ben\", \"Cy\"]), m.describe())[1])(Manager(\"Ana\", 5000)) == \"Ana earns 5000 and manages 2 people\""],
        ["Employees unchanged", "Employee(\"Dee\", 3000).describe() == \"Dee earns 3000\""],
        ["Used super()", "\"super()\" in _cq_source.split(\"class Manager\")[1]"],
      ],
    }),
    task("hard", "Squares are rectangles", {
      prompt: "Define `Rectangle(width, height)` with `area()` and `__str__` like `Rectangle 3x4`, and `Square(side)`, a subclass that calls the parent's `__init__` with the side twice and shows as `Square 3x3`.",
      hint: "Use `type(self).__name__` in `__str__`, so `Square` doesn't need its own.",
      solution: "class Rectangle:\n    def __init__(self, width, height):\n        self.width = width\n        self.height = height\n\n    def area(self):\n        return self.width * self.height\n\n    def __str__(self):\n        return f\"{type(self).__name__} {self.width}x{self.height}\"\n\nclass Square(Rectangle):\n    def __init__(self, side):\n        super().__init__(side, side)",
      tests: [
        ["Rectangle", "Rectangle(3, 4).area() == 12 and str(Rectangle(3, 4)) == \"Rectangle 3x4\""],
        ["Square", "Square(3).area() == 9 and str(Square(3)) == \"Square 3x3\""],
        ["A Square is a Rectangle", "isinstance(Square(1), Rectangle)"],
      ],
    }),
    task("hard", "A family of errors", {
      prompt: "Define `BankError(Exception)`, and two subclasses: `InsufficientFunds`, which takes the amount missing and has the message `Need <n> more`, and `AccountLocked`. Then `withdraw(balance, amount, locked=False)` raises the right one, or returns the new balance.",
      hint: "In `InsufficientFunds.__init__(self, missing)`, call `super().__init__(f\"Need {missing} more\")` and keep `self.missing`.",
      solution: "class BankError(Exception):\n    pass\n\nclass InsufficientFunds(BankError):\n    def __init__(self, missing):\n        super().__init__(f\"Need {missing} more\")\n        self.missing = missing\n\nclass AccountLocked(BankError):\n    pass\n\ndef withdraw(balance, amount, locked=False):\n    if locked:\n        raise AccountLocked(\"Account is locked\")\n    if amount > balance:\n        raise InsufficientFunds(amount - balance)\n    return balance - amount",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["Works", "withdraw(100, 30) == 70"],
        ["Short", "_error(withdraw, 20, 70) == \"InsufficientFunds: Need 50 more\""],
        ["Locked", "_raises(withdraw, 100, 5, True) == \"AccountLocked\""],
        ["One except for both", "issubclass(InsufficientFunds, BankError) and issubclass(AccountLocked, BankError) and InsufficientFunds(5).missing == 5"],
      ],
    }),
    task("expert", "A list without repeats", {
      prompt: "Define `UniqueList`, a subclass of the built-in `list`, whose `append` ignores items already in it, and whose `extend` appends each item that way. Everything else stays a normal list.",
      hint: "Override `append` to check `if item not in self:` and then call `super().append(item)`. `extend` can loop and call `self.append`.",
      solution: "class UniqueList(list):\n    def append(self, item):\n        if item not in self:\n            super().append(item)\n\n    def extend(self, items):\n        for item in items:\n            self.append(item)",
      tests: [
        ["append", "(lambda u: (u.append(1), u.append(2), u.append(1), u)[3])(UniqueList()) == [1, 2]"],
        ["extend", "(lambda u: (u.extend([3, 1, 3, 2]), u)[1])(UniqueList([1])) == [1, 3, 2]"],
        ["Still a list", "isinstance(UniqueList(), list) and len(UniqueList([4, 5])) == 2"],
      ],
    }),
    task("expert", "Sale items", {
      prompt: "Define `Item(name, price)` with `final_price()` (just the price) and `label()` like `tea: 2.50`, then `SaleItem(name, price, percent_off)`, which overrides `final_price` using `super()`, rounded to 2 places. Finally, `total(items)` adds up the final prices of a mixed list.",
      hint: "`label` calls `self.final_price()`, so sale items label themselves correctly without their own `label`.",
      solution: "class Item:\n    def __init__(self, name, price):\n        self.name = name\n        self.price = price\n\n    def final_price(self):\n        return self.price\n\n    def label(self):\n        return f\"{self.name}: {self.final_price():.2f}\"\n\nclass SaleItem(Item):\n    def __init__(self, name, price, percent_off):\n        super().__init__(name, price)\n        self.percent_off = percent_off\n\n    def final_price(self):\n        return round(super().final_price() * (100 - self.percent_off) / 100, 2)\n\ndef total(items):\n    return round(sum(item.final_price() for item in items), 2)",
      tests: [
        ["Labels", "Item(\"tea\", 2.5).label() == \"tea: 2.50\" and SaleItem(\"cake\", 4, 25).label() == \"cake: 3.00\""],
        ["Total", "total([Item(\"tea\", 2.5), SaleItem(\"cake\", 4, 25), SaleItem(\"pie\", 9.99, 10)]) == 14.49"],
        ["Inherits", "issubclass(SaleItem, Item) and \"label\" not in SaleItem.__dict__"],
      ],
    }),
  ],
  questions: [
    mc("What does `class Dog(Animal):` mean?", ["Dog contains an Animal", "Dog is a subclass of Animal and inherits from it", "Animal inherits from Dog", "Dog replaces Animal"], 1),
    mc("What does it mean for a subclass to override a method?", ["It deletes it", "It calls it twice", "It defines its own version, used instead of the parent's", "It makes it private"], 2),
    mc("`describe` is in `Animal` and calls `self.speak()`. For a `Dog`, which `speak` runs?", ["Dog's, because Python looks in the object's own class first", "Animal's", "Both", "Neither"], 0),
    mc("What does `super().__init__(name)` do?", ["Creates a second object", "Calls the subclass's `__init__` again", "Deletes the parent", "Runs the parent's `__init__` for this object"], 3),
    mc("A subclass `__init__` forgets to call `super().__init__`. What usually goes wrong?", ["Nothing", "Attributes the parent sets are missing (`AttributeError`)", "It runs twice", "A `SyntaxError`"], 1),
    mc("For a `Manager(Employee)` object `m`, what is `isinstance(m, Employee)`?", ["`True`", "`False`", "An error", "It depends on the salary"], 0),
    qShort("Which class does every Python class ultimately inherit from? (one word)", "object"),
    mc("Which relationship suits inheritance?", ["\"Has a\", like a car and its engine", "\"Uses a\"", "\"Is next to\"", "\"Is a\", like a manager and an employee"], 3),
    mc("Why does `except ValueError` catch a custom `InvalidAgeError(ValueError)`?", ["Python guesses", "They have the same message", "An `InvalidAgeError` is a `ValueError`", "It doesn't"], 2),
    mc("How can an overriding method reuse the parent's version?", ["Call `super().method_name(...)`", "Copy the code", "Call `self.method_name()`", "It can't"], 0),
  ],
})
