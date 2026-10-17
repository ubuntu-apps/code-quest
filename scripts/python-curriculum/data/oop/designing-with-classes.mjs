// Classes and objects topic: Designing with classes. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "oop_design",
  title: "Designing with classes",
  paragraphs: [
    "Knowing how to write a class is half the job; the other half is deciding which classes to write. A good start is to describe the problem in a few sentences and look at the words. The nouns (library, book, member) are candidates for classes, and the verbs (borrow, return, renew) for methods.",
    "Objects can hold other objects. A car **has an** engine; a library **has** books and members. This is called **composition**, and it's often a better way to share code than inheritance: each part is a small class of its own, and the bigger object passes work on to it.",
    "```\nclass Engine:\n    def __init__(self, horsepower):\n        self.horsepower = horsepower\n\n    def start(self):\n        return f\"Vroom ({self.horsepower} hp)\"\n\nclass Car:\n    def __init__(self, make, horsepower):\n        self.make = make\n        self.engine = Engine(horsepower)   # a car has an engine\n\n    def start(self):\n        return f\"{self.make}: {self.engine.start()}\"\n\nprint(Car(\"Fiat\", 70).start())   # Fiat: Vroom (70 hp)\n```",
    "A few habits keep designs easy to change. Give each class **one job**: a class that calculates a report shouldn't also email it. **Tell, don't ask**: rather than reading `wallet.money`, checking it and changing it from outside, call `wallet.pay(5)` and let the wallet apply its own rules. And **pass parts in** rather than building them inside, `Car(\"Tesla\", ElectricMotor())`, so you can swap in a different part, or a fake one in a test, without touching `Car`.",
    "```\nclass ElectricMotor:\n    def start(self):\n        return \"Hmmm\"\n\nclass PetrolEngine:\n    def start(self):\n        return \"Vroom\"\n\nclass Car:\n    def __init__(self, make, engine):\n        self.make = make\n        self.engine = engine      # any object with start() will do\n\n    def start(self):\n        return f\"{self.make}: {self.engine.start()}\"\n\nprint(Car(\"Tesla\", ElectricMotor()).start())   # Tesla: Hmmm\nprint(Car(\"Fiat\", PetrolEngine()).start())     # Fiat: Vroom\n```",
    "Don't make everything a class. A class with only `__init__` and one method is usually a function in disguise, and a few values that travel together might be a tuple, a dict or a data class. Classes earn their place when data and the rules about it belong together, or when several kinds of thing need to be used the same way.",
    "Here's a small design using composition: a library holds books, and lending one out is the library's job, so it lives in a `Library` method. A missing book and a book already on loan are different problems, so they raise different errors.",
    "```\nclass Book:\n    def __init__(self, title):\n        self.title = title\n        self.available = True\n\nclass Library:\n    def __init__(self):\n        self.books = {}\n\n    def add(self, book):\n        self.books[book.title] = book\n\n    def borrow(self, title):\n        if title not in self.books:\n            raise LookupError(f\"No such book: {title}\")\n        book = self.books[title]\n        if not book.available:\n            raise ValueError(f\"Already borrowed: {title}\")\n        book.available = False\n        return book\n\nlib = Library()\nlib.add(Book(\"Dune\"))\nprint(lib.borrow(\"Dune\").available)   # False\n```",
  ],
  sandboxCode: "class Room:\n    def __init__(self, name):\n        self.name = name\n        self.exits = {}\n\n    def connect(self, other, direction, back):\n        self.exits[direction] = other\n        other.exits[back] = self\n\nhall, kitchen, garden = Room(\"Hall\"), Room(\"Kitchen\"), Room(\"Garden\")\nhall.connect(kitchen, \"north\", \"south\")\nkitchen.connect(garden, \"east\", \"west\")\n\nhere = hall\nfor step in [\"north\", \"east\", \"west\", \"south\"]:\n    here = here.exits[step]\n    print(f\"{step} -> {here.name}\")",
  sandboxSnippets: [
    snippet("Composition", "class Wheel:\n    def __init__(self, size):\n        self.size = size\n\nclass Bike:\n    def __init__(self):\n        self.wheels = [Wheel(28), Wheel(28)]\n\nprint([w.size for w in Bike().wheels])"),
    snippet("Tell, don't ask", "class Wallet:\n    def __init__(self, money):\n        self._money = money\n    def pay(self, amount):\n        if amount > self._money:\n            raise ValueError(\"Not enough money\")\n        self._money -= amount\n        return self._money\n\nw = Wallet(10)\nprint(w.pay(4))"),
    snippet("Swap a part", "class Loud:\n    def say(self, text):\n        return text.upper() + \"!\"\n\nclass Quiet:\n    def say(self, text):\n        return text.lower() + \"...\"\n\nclass Speaker:\n    def __init__(self, voice):\n        self.voice = voice\n    def greet(self):\n        return self.voice.say(\"Hello\")\n\nprint(Speaker(Loud()).greet(), Speaker(Quiet()).greet())"),
    snippet("A function will do", "def double(n):\n    return n * 2\n\nprint(double(21))"),
  ],
  readMore: { label: "Real Python: Inheritance and composition", url: "https://realpython.com/inheritance-composition-python/", source: "Real Python" },
  challenges: [
    task("easy", "A car has an engine", {
      prompt: "Define `Engine(horsepower)` with `start()` returning `Vroom (<hp> hp)`, and `Car(make, horsepower)`, which creates its own `Engine` as `self.engine` and has `start()` returning `<make>: ` followed by the engine's result.",
      hint: "`Car.__init__` sets `self.engine = Engine(horsepower)`; `Car.start` calls `self.engine.start()`.",
      solution: "class Engine:\n    def __init__(self, horsepower):\n        self.horsepower = horsepower\n\n    def start(self):\n        return f\"Vroom ({self.horsepower} hp)\"\n\nclass Car:\n    def __init__(self, make, horsepower):\n        self.make = make\n        self.engine = Engine(horsepower)\n\n    def start(self):\n        return f\"{self.make}: {self.engine.start()}\"",
      tests: [
        ["start", "Car(\"Fiat\", 70).start() == \"Fiat: Vroom (70 hp)\""],
        ["A car has an engine", "isinstance(Car(\"VW\", 90).engine, Engine) and not issubclass(Car, Engine)"],
      ],
    }),
    task("easy", "A team of players", {
      prompt: "Define `Team(name)`, holding a list of `Player` objects, with `add(player)` and `total_score()`, which adds up its players' scores.",
      starter: "class Player:\n    def __init__(self, name, score):\n        self.name = name\n        self.score = score\n",
      hint: "Keep `self.players = []`; `sum(p.score for p in self.players)`.",
      solution: "class Player:\n    def __init__(self, name, score):\n        self.name = name\n        self.score = score\n\nclass Team:\n    def __init__(self, name):\n        self.name = name\n        self.players = []\n\n    def add(self, player):\n        self.players.append(player)\n\n    def total_score(self):\n        return sum(p.score for p in self.players)",
      tests: [
        ["Total", "(lambda t: (t.add(Player(\"Ana\", 12)), t.add(Player(\"Ben\", 8)), t.total_score())[2])(Team(\"Red\")) == 20"],
        ["Empty team", "Team(\"Blue\").total_score() == 0"],
      ],
    }),
    task("easy", "Just a function", {
      prompt: "This class only wraps one calculation. Replace it with a plain function `double(n)` and no class.",
      starter: "class Doubler:\n    def __init__(self, n):\n        self.n = n\n\n    def result(self):\n        return self.n * 2\n",
      hint: "`def double(n): return n * 2`.",
      solution: "def double(n):\n    return n * 2",
      tests: [
        ["double works", "double(4) == 8 and double(-1) == -2"],
        ["No class needed", "\"class\" not in _cq_source"],
      ],
    }),
    task("medium", "Swap the engine", {
      prompt: "Define `PetrolEngine` and `ElectricMotor`, whose `start()` return `Vroom` and `Hmmm`, and `Car(make, engine)`, which uses whatever engine it is given: `start()` returns `<make>: <engine start>`.",
      hint: "The car stores the engine it's passed and calls `self.engine.start()`.",
      solution: "class PetrolEngine:\n    def start(self):\n        return \"Vroom\"\n\nclass ElectricMotor:\n    def start(self):\n        return \"Hmmm\"\n\nclass Car:\n    def __init__(self, make, engine):\n        self.make = make\n        self.engine = engine\n\n    def start(self):\n        return f\"{self.make}: {self.engine.start()}\"",
      tests: [
        ["Electric", "Car(\"Tesla\", ElectricMotor()).start() == \"Tesla: Hmmm\""],
        ["Petrol", "Car(\"Fiat\", PetrolEngine()).start() == \"Fiat: Vroom\""],
        ["Any engine", "Car(\"Toy\", type(\"Wind\", (), {\"start\": lambda self: \"Whirr\"})()).start() == \"Toy: Whirr\""],
      ],
    }),
    task("medium", "Tell, don't ask", {
      prompt: "The rule for paying lives outside the wallet. Move it into a `Wallet.pay(amount)` method that raises `ValueError(\"Not enough money\")` when there isn't enough, and otherwise takes the money. Keep `pay_for` working by having it call that method.",
      starter: "class Wallet:\n    def __init__(self, money):\n        self.money = money\n\ndef pay_for(wallet, amount):\n    if amount > wallet.money:\n        raise ValueError(\"Not enough money\")\n    wallet.money -= amount\n",
      hint: "Move the check and the subtraction into `Wallet.pay`; `pay_for` becomes `wallet.pay(amount)`.",
      solution: "class Wallet:\n    def __init__(self, money):\n        self.money = money\n\n    def pay(self, amount):\n        if amount > self.money:\n            raise ValueError(\"Not enough money\")\n        self.money -= amount\n\ndef pay_for(wallet, amount):\n    wallet.pay(amount)",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["pay", "(lambda w: (w.pay(3), w.money)[1])(Wallet(10)) == 7"],
        ["Refused", "(lambda w: (_error(w.pay, 20), w.money))(Wallet(10)) == (\"ValueError: Not enough money\", 10)"],
        ["pay_for uses it", "(lambda w: (pay_for(w, 4), w.money)[1])(Wallet(10)) == 6 and \"wallet.money\" not in _cq_source.split(\"def pay_for\")[1]"],
      ],
    }),
    task("medium", "Lend a book", {
      prompt: "Define `Book(title)` (starting `available`) and `Library`, holding books by title, with `add(book)` and `borrow(title)`, which marks the book as not available and returns it. A missing title raises `LookupError(\"No such book: <title>\")`; a book already out raises `ValueError(\"Already borrowed: <title>\")`.",
      hint: "Keep `self.books = {}`. Check the two problems in order, then set `book.available = False`.",
      solution: "class Book:\n    def __init__(self, title):\n        self.title = title\n        self.available = True\n\nclass Library:\n    def __init__(self):\n        self.books = {}\n\n    def add(self, book):\n        self.books[book.title] = book\n\n    def borrow(self, title):\n        if title not in self.books:\n            raise LookupError(f\"No such book: {title}\")\n        book = self.books[title]\n        if not book.available:\n            raise ValueError(f\"Already borrowed: {title}\")\n        book.available = False\n        return book\n",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["Borrow", "(lambda l: (l.add(Book(\"Dune\")), l.borrow(\"Dune\").available)[1])(Library()) is False"],
        ["Missing", "_error(Library().borrow, \"Emma\") == \"LookupError: No such book: Emma\""],
        ["Already out", "(lambda l: (l.add(Book(\"Dune\")), l.borrow(\"Dune\"), _error(l.borrow, \"Dune\"))[2])(Library()) == \"ValueError: Already borrowed: Dune\""],
      ],
    }),
    task("hard", "Members and loans", {
      prompt: "Extend the library: add `Member(name)` with a list `borrowed`, and give `Library` the methods `lend(member, title)` (uses `borrow`, then adds the book to the member's list; a member may have at most 3 books, or `ValueError(\"Limit reached\")`, checked first) and `give_back(member, title)` (makes the book available again and removes it from the member's list).",
      starter: "class Book:\n    def __init__(self, title):\n        self.title = title\n        self.available = True\n\nclass Library:\n    def __init__(self):\n        self.books = {}\n\n    def add(self, book):\n        self.books[book.title] = book\n\n    def borrow(self, title):\n        if title not in self.books:\n            raise LookupError(f\"No such book: {title}\")\n        book = self.books[title]\n        if not book.available:\n            raise ValueError(f\"Already borrowed: {title}\")\n        book.available = False\n        return book\n",
      hint: "Check `len(member.borrowed) >= 3` before borrowing. In `give_back`, find the book in `self.books`.",
      solution: "class Book:\n    def __init__(self, title):\n        self.title = title\n        self.available = True\n\nclass Library:\n    def __init__(self):\n        self.books = {}\n\n    def add(self, book):\n        self.books[book.title] = book\n\n    def borrow(self, title):\n        if title not in self.books:\n            raise LookupError(f\"No such book: {title}\")\n        book = self.books[title]\n        if not book.available:\n            raise ValueError(f\"Already borrowed: {title}\")\n        book.available = False\n        return book\n\n    def lend(self, member, title):\n        if len(member.borrowed) >= 3:\n            raise ValueError(\"Limit reached\")\n        book = self.borrow(title)\n        member.borrowed.append(book)\n\n    def give_back(self, member, title):\n        book = self.books[title]\n        member.borrowed.remove(book)\n        book.available = True\n\nclass Member:\n    def __init__(self, name):\n        self.name = name\n        self.borrowed = []",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["Lend and give back", "(lambda l, m: ([l.add(Book(t)) for t in \"ABCD\"], l.lend(m, \"A\"), l.lend(m, \"B\"), l.give_back(m, \"A\"), [b.title for b in m.borrowed], l.books[\"A\"].available)[4:])(Library(), Member(\"Ana\")) == ([\"B\"], True)"],
        ["The limit", "(lambda l, m: ([l.add(Book(t)) for t in \"ABCD\"], [l.lend(m, t) for t in \"ABC\"], _error(l.lend, m, \"D\"), l.books[\"D\"].available)[2:])(Library(), Member(\"Ben\")) == (\"ValueError: Limit reached\", True)"],
      ],
    }),
    task("hard", "A fake for testing", {
      prompt: "`Shop` sends a message through whatever notifier it's given. Write `FakeNotifier`, which doesn't send anything but records each message in a list `sent`, then make `shop` with a fake, call `shop.order(\"tea\")` and `shop.order(\"cake\")`, and set `messages` to what the fake recorded.",
      starter: "class Shop:\n    def __init__(self, notifier):\n        self.notifier = notifier\n\n    def order(self, item):\n        self.notifier.send(f\"Ordered {item}\")\n",
      hint: "`FakeNotifier` needs `self.sent = []` and a `send(message)` that appends.",
      solution: "class Shop:\n    def __init__(self, notifier):\n        self.notifier = notifier\n\n    def order(self, item):\n        self.notifier.send(f\"Ordered {item}\")\n\nclass FakeNotifier:\n    def __init__(self):\n        self.sent = []\n\n    def send(self, message):\n        self.sent.append(message)\n\nfake = FakeNotifier()\nshop = Shop(fake)\nshop.order(\"tea\")\nshop.order(\"cake\")\nmessages = fake.sent",
      tests: [
        ["messages", "messages == [\"Ordered tea\", \"Ordered cake\"]"],
        ["A working fake", "(lambda f: (Shop(f).order(\"x\"), f.sent)[1])(FakeNotifier()) == [\"Ordered x\"]"],
      ],
    }),
    task("expert", "Rooms to explore", {
      prompt: "Define `Room(name)` with an `exits` dict and `connect(other, direction)`, which links both ways using the opposite direction (north/south, east/west). Then `Player(room)` with `move(direction)`, which moves and returns the new room's name, or returns `You can't go that way` and stays put.",
      starter: "OPPOSITE = {\"north\": \"south\", \"south\": \"north\", \"east\": \"west\", \"west\": \"east\"}\n",
      hint: "`self.exits[direction] = other` and `other.exits[OPPOSITE[direction]] = self`. The player keeps `self.room`.",
      solution: "OPPOSITE = {\"north\": \"south\", \"south\": \"north\", \"east\": \"west\", \"west\": \"east\"}\n\nclass Room:\n    def __init__(self, name):\n        self.name = name\n        self.exits = {}\n\n    def connect(self, other, direction):\n        self.exits[direction] = other\n        other.exits[OPPOSITE[direction]] = self\n\nclass Player:\n    def __init__(self, room):\n        self.room = room\n\n    def move(self, direction):\n        if direction not in self.room.exits:\n            return \"You can't go that way\"\n        self.room = self.room.exits[direction]\n        return self.room.name",
      tests: [
        ["A walk", "(lambda h, k, g: (h.connect(k, \"north\"), k.connect(g, \"east\"), [p.move(d) for p in [Player(h)] for d in [\"north\", \"east\", \"north\", \"west\", \"south\"]])[2])(Room(\"Hall\"), Room(\"Kitchen\"), Room(\"Garden\")) == [\"Kitchen\", \"Garden\", \"You can't go that way\", \"Kitchen\", \"Hall\"]"],
      ],
    }),
    task("expert", "Events", {
      prompt: "Define `EventBus` with `subscribe(event, handler)` and `publish(event, data)`, which calls every handler subscribed to that event, in the order they subscribed, with `data`, and returns how many were called. Handlers can be functions or methods of other objects.",
      hint: "Keep a dict from event name to a list of handlers: `self.handlers.setdefault(event, []).append(handler)`.",
      solution: "class EventBus:\n    def __init__(self):\n        self.handlers = {}\n\n    def subscribe(self, event, handler):\n        self.handlers.setdefault(event, []).append(handler)\n\n    def publish(self, event, data):\n        handlers = self.handlers.get(event, [])\n        for handler in handlers:\n            handler(data)\n        return len(handlers)",
      tests: [
        ["Functions and methods", "(lambda bus, seen, log: (bus.subscribe(\"sale\", seen.append), bus.subscribe(\"sale\", lambda d: log.append(d * 2)), bus.subscribe(\"refund\", seen.append), bus.publish(\"sale\", 5), seen, log)[3:])(EventBus(), [], []) == (2, [5], [10])"],
        ["Nobody listening", "EventBus().publish(\"nothing\", 1) == 0"],
      ],
    }),
  ],
  questions: [
    mc("When reading a problem description, which words suggest classes?", ["The verbs", "The nouns, like library, book and member", "The adjectives", "The numbers"], 1),
    mc("What is composition?", ["Inheriting from two classes", "Writing music", "Objects holding other objects, like a car that has an engine", "Combining two functions"], 2),
    mc("Which relationship suits composition rather than inheritance?", ["\"Has a\"", "\"Is a\"", "\"Was a\"", "None"], 0),
    mc("What does \"tell, don't ask\" mean?", ["Ask the user before acting", "Print everything", "Read attributes before changing them", "Call a method and let the object apply its own rules"], 3),
    mc("Why pass an engine into `Car(make, engine)` instead of creating it inside?", ["It is faster", "Any engine, or a fake in a test, can be swapped in without changing `Car`", "Python requires it", "To save memory"], 1),
    mc("A class has only `__init__` and one method. What is it often better as?", ["A function", "Two classes", "A module", "A subclass"], 0),
    qShort("How many jobs should a well-designed class have? (a number)", "1"),
    mc("Why raise different errors for a missing book and a book already on loan?", ["Python needs two", "To be shorter", "It looks nicer", "Callers can handle the two problems differently"], 3),
    mc("What makes a fake notifier useful in a test?", ["It sends real emails", "It is faster to type", "It records messages so the test can check them, without sending anything", "It hides errors"], 2),
    mc("When does a class earn its place?", ["When data and the rules about it belong together", "Always", "Only for big programs", "When there are no functions"], 0),
  ],
})
