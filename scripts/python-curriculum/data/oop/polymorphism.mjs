// Classes and objects topic: Polymorphism and duck typing. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "polymorphism",
  title: "Polymorphism and duck typing",
  paragraphs: [
    "**Polymorphism** (\"many forms\") means different classes answering the same method call in their own way. Code that only calls that method can then work with any of them, without knowing or caring which one it has:",
    "```\nimport math\n\nclass Circle:\n    def __init__(self, radius):\n        self.radius = radius\n\n    def area(self):\n        return math.pi * self.radius ** 2\n\nclass Square:\n    def __init__(self, side):\n        self.side = side\n\n    def area(self):\n        return self.side ** 2\n\nshapes = [Circle(1), Square(2), Circle(0.5)]\ntotal = sum(shape.area() for shape in shapes)\nprint(round(total, 2))   # 7.93\n```",
    "`Circle` and `Square` don't share a parent class here. Python doesn't check types before calling a method; it just calls it, and any object that has an `area` method will do. This is called **duck typing**: \"if it walks like a duck and quacks like a duck, it's a duck.\" You've relied on it all along: `len()` works on strings, lists and dicts, and `for` loops over anything that can be looped over.",
    "Polymorphism replaces chains of type checks. Instead of a function that asks `if isinstance(shape, Circle): ... elif isinstance(shape, Square): ...`, each class carries its own version of the behaviour. Adding a triangle then means writing a `Triangle` class with an `area` method, and the loop that adds up areas doesn't change at all.",
    "A base class can spell out what its subclasses must provide. The simplest way is a method that raises `NotImplementedError`, so a subclass that forgets to override it fails with a clear message the moment the method is called:",
    "```\nclass Shape:\n    def area(self):\n        raise NotImplementedError(\"Subclasses must define area\")\n\n    def describe(self):\n        return f\"{type(self).__name__} with area {self.area():.1f}\"\n\nclass Rectangle(Shape):\n    def __init__(self, width, height):\n        self.width = width\n        self.height = height\n\n    def area(self):\n        return self.width * self.height\n\nprint(Rectangle(2, 3).describe())   # Rectangle with area 6.0\n```",
    "The `abc` module (\"abstract base classes\") makes the rule stronger. Inherit from `ABC` and mark the required methods with `@abstractmethod`: then Python refuses to create an object of the base class, or of any subclass that hasn't defined every abstract method, raising `TypeError` straight away instead of when the method is first used.",
    "```\nfrom abc import ABC, abstractmethod\n\nclass Payment(ABC):\n    @abstractmethod\n    def pay(self, amount):\n        ...\n\nclass Card(Payment):\n    def pay(self, amount):\n        return f\"Paid {amount:.2f} by card\"\n\nprint(Card().pay(5))      # Paid 5.00 by card\ntry:\n    Payment()\nexcept TypeError:\n    print(\"Payment is abstract\")\n```",
  ],
  sandboxCode: "class Dog:\n    def speak(self):\n        return \"Woof\"\n\nclass Duck:\n    def speak(self):\n        return \"Quack\"\n\nclass Robot:\n    def speak(self):\n        return \"Beep\"\n\nfor thing in [Dog(), Duck(), Robot()]:\n    print(type(thing).__name__, \"says\", thing.speak())\n\nprint(len(\"abc\"), len([1, 2]), len({\"a\": 1}))\nprint(1 + 2, \"a\" + \"b\", [1] + [2])",
  sandboxSnippets: [
    snippet("Same call, different answers", "class Dog:\n    def speak(self):\n        return \"Woof\"\n\nclass Duck:\n    def speak(self):\n        return \"Quack\"\n\nclass Robot:\n    def speak(self):\n        return \"Beep\"\n\nprint([t.speak() for t in (Dog(), Duck(), Robot())])"),
    snippet("Anything with write", "import io\n\ndef report(out):\n    out.write(\"Total: 3\\n\")\n\nbuffer = io.StringIO()\nreport(buffer)\nprint(repr(buffer.getvalue()))\nwith open(\"report.txt\", \"w\") as f:\n    report(f)\nprint(open(\"report.txt\").read())"),
    snippet("NotImplementedError", "class Shape:\n    def area(self):\n        raise NotImplementedError(\"Subclasses must define area\")\n\nclass Blob(Shape):\n    pass\n\ntry:\n    Blob().area()\nexcept NotImplementedError as e:\n    print(\"NotImplementedError:\", e)"),
    snippet("An abstract class", "from abc import ABC, abstractmethod\n\nclass Animal(ABC):\n    @abstractmethod\n    def speak(self):\n        ...\n\nclass Fish(Animal):\n    pass\n\ntry:\n    Fish()\nexcept TypeError:\n    print(\"Fish forgot speak, so it can't be created\")"),
  ],
  readMore: { label: "Python docs: abc, abstract base classes", url: "https://docs.python.org/3/library/abc.html", source: "Python docs" },
  challenges: [
    task("easy", "Two shapes, one method", {
      prompt: "Define `Circle(radius)` and `Square(side)`, each with an `area()` method (use `math.pi` for the circle).",
      starter: "import math\n",
      hint: "Each class has its own `area`; the names match so they can be used alike.",
      solution: "import math\n\nclass Circle:\n    def __init__(self, radius):\n        self.radius = radius\n\n    def area(self):\n        return math.pi * self.radius ** 2\n\nclass Square:\n    def __init__(self, side):\n        self.side = side\n\n    def area(self):\n        return self.side ** 2\n",
      tests: [
        ["Square", "Square(3).area() == 9"],
        ["Circle", "round(Circle(1).area(), 4) == 3.1416"],
        ["Both answer area()", "all(callable(getattr(s, \"area\", None)) for s in (Circle(1), Square(1)))"],
      ],
    }),
    task("easy", "Add up the areas", {
      prompt: "Define `total_area(shapes)` that returns the sum of the areas of a list of shapes, of any kind.",
      starter: "import math\n\nclass Circle:\n    def __init__(self, radius):\n        self.radius = radius\n\n    def area(self):\n        return math.pi * self.radius ** 2\n\nclass Square:\n    def __init__(self, side):\n        self.side = side\n\n    def area(self):\n        return self.side ** 2\n",
      hint: "`sum(shape.area() for shape in shapes)`.",
      solution: "import math\n\nclass Circle:\n    def __init__(self, radius):\n        self.radius = radius\n\n    def area(self):\n        return math.pi * self.radius ** 2\n\nclass Square:\n    def __init__(self, side):\n        self.side = side\n\n    def area(self):\n        return self.side ** 2\n\ndef total_area(shapes):\n    return sum(shape.area() for shape in shapes)",
      tests: [
        ["Mixed shapes", "round(total_area([Circle(1), Square(2), Circle(0.5)]), 2) == 7.93"],
        ["Empty", "total_area([]) == 0"],
        ["Any object with area()", "total_area([type(\"Odd\", (), {\"area\": lambda self: 10})()]) == 10"],
      ],
    }),
    task("easy", "Everyone speaks", {
      prompt: "Set `sounds` to the list of what each object in `things` says.",
      starter: "class Dog:\n    def speak(self):\n        return \"Woof\"\n\nclass Duck:\n    def speak(self):\n        return \"Quack\"\n\nclass Robot:\n    def speak(self):\n        return \"Beep\"\n\nthings = [Dog(), Robot(), Duck(), Dog()]\n",
      hint: "`[thing.speak() for thing in things]`.",
      solution: "class Dog:\n    def speak(self):\n        return \"Woof\"\n\nclass Duck:\n    def speak(self):\n        return \"Quack\"\n\nclass Robot:\n    def speak(self):\n        return \"Beep\"\n\nthings = [Dog(), Robot(), Duck(), Dog()]\nsounds = [thing.speak() for thing in things]",
      tests: [
        ["sounds is right", "sounds == [\"Woof\", \"Beep\", \"Quack\", \"Woof\"]"],
      ],
    }),
    task("medium", "No more type checks", {
      prompt: "`describe_all` checks each type by hand. Give each class its own `describe()` method instead, and make `describe_all` just call it, with no `isinstance`.",
      starter: "class Car:\n    def __init__(self, make):\n        self.make = make\n\nclass Bike:\n    def __init__(self, gears):\n        self.gears = gears\n\ndef describe_all(things):\n    result = []\n    for t in things:\n        if isinstance(t, Car):\n            result.append(f\"A {t.make} car\")\n        elif isinstance(t, Bike):\n            result.append(f\"A bike with {t.gears} gears\")\n    return result\n",
      hint: "Move each f-string into a `describe` method on its class; `describe_all` becomes `[t.describe() for t in things]`.",
      solution: "class Car:\n    def __init__(self, make):\n        self.make = make\n\n    def describe(self):\n        return f\"A {self.make} car\"\n\nclass Bike:\n    def __init__(self, gears):\n        self.gears = gears\n\n    def describe(self):\n        return f\"A bike with {self.gears} gears\"\n\ndef describe_all(things):\n    return [t.describe() for t in things]",
      tests: [
        ["Same results", "describe_all([Car(\"Fiat\"), Bike(21)]) == [\"A Fiat car\", \"A bike with 21 gears\"]"],
        ["Each class describes itself", "Car(\"VW\").describe() == \"A VW car\" and Bike(3).describe() == \"A bike with 3 gears\""],
        ["No type checks", "\"isinstance\" not in _cq_source"],
      ],
    }),
    task("medium", "A contract", {
      prompt: "Define `Shape`, whose `area()` raises `NotImplementedError(\"Subclasses must define area\")`, and `Triangle(base, height)`, a subclass that defines `area()` as half the base times the height.",
      hint: "The base method only raises; `Triangle` overrides it.",
      solution: "class Shape:\n    def area(self):\n        raise NotImplementedError(\"Subclasses must define area\")\n\nclass Triangle(Shape):\n    def __init__(self, base, height):\n        self.base = base\n        self.height = height\n\n    def area(self):\n        return self.base * self.height / 2",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["Triangle", "Triangle(4, 3).area() == 6.0 and isinstance(Triangle(1, 1), Shape)"],
        ["The base refuses", "_error(Shape().area) == \"NotImplementedError: Subclasses must define area\""],
      ],
    }),
    task("medium", "Write anywhere", {
      prompt: "Define `save_report(lines, out)` that writes each line, followed by a line break, using `out.write`. It should work with a file and with an `io.StringIO`.",
      hint: "Just `out.write(line + \"\\n\")` in a loop: anything with a `write` method will do.",
      solution: "def save_report(lines, out):\n    for line in lines:\n        out.write(line + \"\\n\")",
      tests: [
        ["To a StringIO", "(lambda b: (save_report([\"a\", \"b\"], b), b.getvalue())[1])(__import__(\"io\").StringIO()) == \"a\\nb\\n\""],
        ["To a file", "(lambda f: (save_report([\"x\", \"y\"], f), f.close(), open(\"r.txt\").read())[2])(open(\"r.txt\", \"w\")) == \"x\\ny\\n\""],
        ["To anything with write", "(lambda c: (save_report([\"1\", \"2\", \"3\"], c), c.n)[1])(type(\"Counter\", (), {\"n\": 0, \"write\": lambda self, s: setattr(self, \"n\", self.n + 1)})()) == 3"],
      ],
    }),
    task("hard", "Abstract payments", {
      prompt: "Using `abc`, define an abstract `Payment` with an abstract `fee(amount)` and a normal method `receipt(amount)` returning `Paid <total>` (amount plus fee, 2 places). Then `Card` (fee 2% of the amount) and `Cash` (no fee).",
      starter: "from abc import ABC, abstractmethod\n",
      hint: "`class Payment(ABC):` with `@abstractmethod def fee(self, amount): ...`. `receipt` uses `self.fee(amount)`.",
      solution: "from abc import ABC, abstractmethod\n\nclass Payment(ABC):\n    @abstractmethod\n    def fee(self, amount):\n        ...\n\n    def receipt(self, amount):\n        return f\"Paid {amount + self.fee(amount):.2f}\"\n\nclass Card(Payment):\n    def fee(self, amount):\n        return amount * 0.02\n\nclass Cash(Payment):\n    def fee(self, amount):\n        return 0",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\n",
      tests: [
        ["Card", "Card().receipt(50) == \"Paid 51.00\""],
        ["Cash", "Cash().receipt(50) == \"Paid 50.00\""],
        ["Payment is abstract", "_raises(Payment) == \"TypeError\""],
        ["So is an incomplete subclass", "_raises(type(\"Cheque\", (Payment,), {})) == \"TypeError\""],
      ],
    }),
    task("hard", "Notify everyone", {
      prompt: "Define `EmailNotifier(address)` and `SmsNotifier(number)`, each with `send(message)` returning text: `Email to <address>: <message>`, and for SMS `SMS to <number>: <message>` with the message cut to 20 characters. Then `notify_all(notifiers, message)` returns the list of results.",
      hint: "The two `send` methods differ; `notify_all` doesn't care which it calls.",
      solution: "class EmailNotifier:\n    def __init__(self, address):\n        self.address = address\n\n    def send(self, message):\n        return f\"Email to {self.address}: {message}\"\n\nclass SmsNotifier:\n    def __init__(self, number):\n        self.number = number\n\n    def send(self, message):\n        return f\"SMS to {self.number}: {message[:20]}\"\n\ndef notify_all(notifiers, message):\n    return [n.send(message) for n in notifiers]",
      tests: [
        ["Both", "notify_all([EmailNotifier(\"ana@example.com\"), SmsNotifier(\"555-0101\")], \"Your order has shipped today\") == [\"Email to ana@example.com: Your order has shipped today\", \"SMS to 555-0101: Your order has shipp\"]"],
        ["Nobody", "notify_all([], \"hi\") == []"],
      ],
    }),
    task("expert", "Pluggable calculator", {
      prompt: "Define operation classes `Add`, `Multiply` and `Power`, each with a class attribute `symbol` (`+`, `*`, `^`) and a method `apply(a, b)`. Then `Calculator(operations)` keeps them by symbol, and its `calculate(text)` works out text like `3 ^ 2` (numbers and symbol separated by spaces), raising `ValueError(\"Unknown operation: <symbol>\")` for symbols it doesn't know.",
      hint: "In `Calculator.__init__`, build `{op.symbol: op for op in operations}`. `calculate` splits the text into three parts and converts the numbers with `float`.",
      solution: "class Add:\n    symbol = \"+\"\n\n    def apply(self, a, b):\n        return a + b\n\nclass Multiply:\n    symbol = \"*\"\n\n    def apply(self, a, b):\n        return a * b\n\nclass Power:\n    symbol = \"^\"\n\n    def apply(self, a, b):\n        return a ** b\n\nclass Calculator:\n    def __init__(self, operations):\n        self.operations = {op.symbol: op for op in operations}\n\n    def calculate(self, text):\n        a, symbol, b = text.split()\n        if symbol not in self.operations:\n            raise ValueError(f\"Unknown operation: {symbol}\")\n        return self.operations[symbol].apply(float(a), float(b))",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["All three", "(lambda c: [c.calculate(t) for t in [\"3 ^ 2\", \"2.5 * 4\", \"1 + 1\"]])(Calculator([Add(), Multiply(), Power()])) == [9.0, 10.0, 2.0]"],
        ["Unknown", "_error(Calculator([Add()]).calculate, \"6 / 3\") == \"ValueError: Unknown operation: /\""],
        ["A new operation plugs in", "Calculator([type(\"Sub\", (), {\"symbol\": \"-\", \"apply\": lambda self, a, b: a - b})()]).calculate(\"5 - 2\") == 3.0"],
      ],
    }),
    task("expert", "Exporters", {
      prompt: "Define `CsvExporter`, `JsonExporter` and `TextExporter`, each with a class attribute `extension` (`csv`, `json`, `txt`) and `export(rows)`, where `rows` is a list of dicts with the same keys. CSV gives a header line then value lines, comma-separated; JSON gives `json.dumps(rows)`; text gives lines like `name=Ana, age=30`. Lines end with `\\n` (except JSON). Then `export_all(rows, exporters)` returns a dict from extension to output.",
      starter: "import json\n",
      hint: "The CSV header is `\",\".join(rows[0])`; each row is `\",\".join(str(v) for v in row.values())`.",
      solution: "import json\n\nclass CsvExporter:\n    extension = \"csv\"\n\n    def export(self, rows):\n        lines = [\",\".join(rows[0])] + [\",\".join(str(v) for v in row.values()) for row in rows]\n        return \"\".join(line + \"\\n\" for line in lines)\n\nclass JsonExporter:\n    extension = \"json\"\n\n    def export(self, rows):\n        return json.dumps(rows)\n\nclass TextExporter:\n    extension = \"txt\"\n\n    def export(self, rows):\n        return \"\".join(\", \".join(f\"{k}={v}\" for k, v in row.items()) + \"\\n\" for row in rows)\n\ndef export_all(rows, exporters):\n    return {e.extension: e.export(rows) for e in exporters}",
      tests: [
        ["All three", "export_all([{\"name\": \"Ana\", \"age\": 30}, {\"name\": \"Ben\", \"age\": 25}], [CsvExporter(), JsonExporter(), TextExporter()]) == {\"csv\": \"name,age\\nAna,30\\nBen,25\\n\", \"json\": '[{\"name\": \"Ana\", \"age\": 30}, {\"name\": \"Ben\", \"age\": 25}]', \"txt\": \"name=Ana, age=30\\nname=Ben, age=25\\n\"}"],
        ["Just one", "export_all([{\"x\": 1}], [TextExporter()]) == {\"txt\": \"x=1\\n\"}"],
      ],
    }),
  ],
  questions: [
    mc("What does polymorphism mean in Python?", ["One class with many objects", "Different classes answering the same method call in their own way", "A class that inherits twice", "Changing a type at runtime"], 1),
    mc("Do objects need a shared parent class to be used in the same loop?", ["Yes, always", "Only for numbers", "No: any object with the right methods works", "Only with `abc`"], 2),
    mc("What is duck typing?", ["Using an object for what it can do, not what type it is", "Checking types with `type()`", "A kind of inheritance", "Naming classes after animals"], 0),
    mc("Why replace `isinstance` chains with methods on each class?", ["`isinstance` is slow", "It is required", "Methods can't be wrong", "A new class then needs no change to the code that uses it"], 3),
    mc("What does a base method that raises `NotImplementedError` say?", ["This method is broken", "Subclasses must provide their own version", "This class can't be used", "The method is private"], 1),
    mc("With `abc`, what happens if you create an object of a class with an abstract method left undefined?", ["`TypeError` straight away", "It works until the method is called", "A warning only", "The method returns `None`"], 0),
    qShort("Which decorator from `abc` marks a method that subclasses must define? (with the @)", "@abstractmethod"),
    mc("Why does `len()` work on strings, lists and dicts?", ["They inherit from a `Sized` class", "Python checks each type", "`len` is a method", "Each has its own `__len__`; `len` just calls it"], 3),
    mc("A function calls `out.write(...)`. Which can `out` be?", ["Only a file", "Only a string", "Anything with a `write` method, like a file or `io.StringIO`", "Only `sys.stdout`"], 2),
    mc("Adding a `Triangle` with an `area` method to a total-area loop needs what change to the loop?", ["None", "A new `elif`", "An `isinstance` check", "A new loop"], 0),
  ],
})
