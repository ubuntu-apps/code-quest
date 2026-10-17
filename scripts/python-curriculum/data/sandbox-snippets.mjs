import { snippet } from './_builders.mjs'

/** @type {Record<string, { id: string, label: string, code: string }[]>} */
export const SANDBOX_SNIPPETS_BY_LEVEL = {
  // ── Classes and objects ───────────────────────────────────────────
  classes_basics: [
    snippet('Define class', 'class Cat:\n    pass\n\nc = Cat()\nprint(c)'),
    snippet('__init__', 'class Dog:\n    def __init__(self, name):\n        self.name = name\n\nd = Dog("Rex")\nprint(d.name)'),
    snippet('Method', 'class Dog:\n    def bark(self):\n        return "woof"\nprint(Dog().bark())'),
    snippet('Two instances', 'class Point:\n    def __init__(self, x):\n        self.x = x\nprint(Point(1).x, Point(2).x)'),
    snippet('isinstance', 'class Dog:\n    pass\nprint(isinstance(Dog(), Dog))'),
  ],
  methods: [
    snippet('inc counter', 'class Counter:\n    def __init__(self):\n        self.n = 0\n    def inc(self):\n        self.n += 1\n    def value(self):\n        return self.n\nc = Counter()\nc.inc()\nprint(c.value())'),
    snippet('Return self', 'class Builder:\n    def add(self, x):\n        self.x = x\n        return self\nb = Builder().add(1)\nprint(b.x)'),
    snippet('staticmethod', 'class Math:\n    @staticmethod\n    def add(a, b):\n        return a + b\nprint(Math.add(2, 3))'),
    snippet('classmethod', 'class User:\n    def __init__(self, name):\n        self.name = name\n    @classmethod\n    def guest(cls):\n        return cls("guest")\nprint(User.guest().name)'),
  ],
  inheritance: [
    snippet('Override', 'class Animal:\n    def speak(self):\n        return "..."\n\nclass Dog(Animal):\n    def speak(self):\n        return "woof"\nprint(Dog().speak())'),
    snippet('super()', 'class Animal:\n    def __init__(self, name):\n        self.name = name\n\nclass Dog(Animal):\n    def __init__(self, name):\n        super().__init__(name)\n\nd = Dog("Rex")\nprint(d.name)'),
    snippet('Subclass check', 'class Animal:\n    pass\nclass Dog(Animal):\n    pass\nprint(issubclass(Dog, Animal))'),
  ],
  encapsulation: [
    snippet('Private attr', 'class BankAccount:\n    def __init__(self, balance=0):\n        self._balance = balance\n    def deposit(self, amount):\n        self._balance += amount\n    def get_balance(self):\n        return self._balance\na = BankAccount(100)\na.deposit(50)\nprint(a.get_balance())'),
    snippet('property getter', 'class Circle:\n    def __init__(self, r):\n        self._r = r\n    @property\n    def radius(self):\n        return self._r\nc = Circle(5)\nprint(c.radius)'),
    snippet('Validate setter', 'class Circle:\n    def __init__(self, r):\n        self.radius = r\n    @property\n    def radius(self):\n        return self._r\n    @radius.setter\n    def radius(self, value):\n        if value < 0:\n            raise ValueError("negative radius")\n        self._r = value\nc = Circle(3)\nprint(c.radius)'),
  ],
  polymorphism: [
    snippet('Duck typing', 'def announce(animal):\n    print(animal.speak())\n\nclass Cat:\n    def speak(self):\n        return "meow"\n\nclass Dog:\n    def speak(self):\n        return "woof"\n\nfor a in [Cat(), Dog()]:\n    print(a.speak())'),
    snippet('Shared interface', 'class Square:\n    def area(self):\n        return 4\n\nclass Circle:\n    def area(self):\n        return 3\n\nfor shape in [Square(), Circle()]:\n    print(shape.area())'),
  ],
  dunder_methods: [
    snippet('__repr__', 'class Point:\n    def __init__(self, x, y):\n        self.x, self.y = x, y\n    def __repr__(self):\n        return f"Point({self.x}, {self.y})"\nprint(repr(Point(1, 2)))'),
    snippet('__str__', 'class Greeter:\n    def __str__(self):\n        return "hello"\nprint(str(Greeter()))'),
    snippet('__eq__', 'class Point:\n    def __init__(self, x):\n        self.x = x\n    def __eq__(self, other):\n        return self.x == other.x\nprint(Point(1) == Point(1))'),
    snippet('__len__', 'class Bag:\n    def __init__(self, items):\n        self.items = items\n    def __len__(self):\n        return len(self.items)\nprint(len(Bag([1, 2, 3])))'),
  ],
  properties: [
    snippet('Read-only', 'class Circle:\n    def __init__(self, r):\n        self._r = r\n    @property\n    def radius(self):\n        return self._r\nc = Circle(5)\nprint(c.radius)'),
    snippet('Setter', 'class Circle:\n    def __init__(self, r):\n        self._r = r\n    @property\n    def radius(self):\n        return self._r\n    @radius.setter\n    def radius(self, value):\n        self._r = value\nc = Circle(5)\nc.radius = 10\nprint(c.radius)'),
    snippet('Computed', 'class Rectangle:\n    def __init__(self, w, h):\n        self.w, self.h = w, h\n    @property\n    def area(self):\n        return self.w * self.h\nprint(Rectangle(4, 5).area)'),
  ],
  dataclasses: [
    snippet('@dataclass', 'from dataclasses import dataclass\n\n@dataclass\nclass User:\n    name: str\n    score: int = 0\n\nprint(User("Ana", 42))'),
    snippet('Default field', 'from dataclasses import dataclass, field\n\n@dataclass\nclass Team:\n    name: str\n    members: list = field(default_factory=list)\n\nt = Team("A")\nprint(t)'),
    snippet('Compare', 'from dataclasses import dataclass\n\n@dataclass\nclass Point:\n    x: int\n    y: int\n\nprint(Point(1, 2) == Point(1, 2))'),
  ],
  special_methods_adv: [
    snippet('Composition', 'class Engine:\n    def start(self):\n        return "vroom"\n\nclass Car:\n    def __init__(self, engine):\n        self.engine = engine\n    def drive(self):\n        return self.engine.start()\nprint(Car(Engine()).drive())'),
    snippet('Inject dependency', 'class Logger:\n    def log(self, msg):\n        return msg\n\nclass App:\n    def __init__(self, logger):\n        self.logger = logger\n    def run(self):\n        return self.logger.log("ok")\nprint(App(Logger()).run())'),
    snippet('Factory', 'def make_user(name):\n    return {"name": name, "active": True}\nprint(make_user("Ana"))'),
  ],
  oop_design: [
    snippet('Abstract style', 'class Notifier:\n    def send(self, message: str) -> None:\n        raise NotImplementedError\n\nclass EmailNotifier(Notifier):\n    def send(self, message: str) -> None:\n        print(f"Email: {message}")\nEmailNotifier().send("Hello")'),
    snippet('Single responsibility', 'class Report:\n    def build(self, data):\n        return str(data)\n\nclass Printer:\n    def print(self, text):\n        print(text)'),
    snippet('Interface', 'class Shape:\n    def area(self):\n        raise NotImplementedError\n\nclass Square(Shape):\n    def area(self):\n        return 1\nprint(Square().area())'),
  ],

  // ── Data and APIs ─────────────────────────────────────────────
  json_basics: [
    snippet('dumps', 'import json\ndata = {"name": "Ana", "score": 95}\nprint(json.dumps(data))'),
    snippet('loads', 'import json\nprint(json.loads(\'{"name": "Ana"}\')["name"])'),
    snippet('Pretty print', 'import json\nprint(json.dumps({"a": 1}, indent=2))'),
    snippet('List JSON', 'import json\nprint(json.loads("[1, 2]"))'),
    snippet('Decode error', 'import json\ntry:\n    json.loads("{bad}")\nexcept json.JSONDecodeError:\n    print("invalid JSON")'),
  ],
  csv_data: [
    snippet('DictReader', 'import csv\nfrom io import StringIO\nbuf = StringIO("name,score\\nAna,90\\n")\nrows = list(csv.DictReader(buf))\nprint(rows[0]["name"])'),
    snippet('csv writer', 'import csv\nfrom io import StringIO\nbuf = StringIO()\ncsv.writer(buf).writerow(["a", "b"])\nprint(buf.getvalue())'),
    snippet('Sum column', 'import csv\nfrom io import StringIO\nbuf = StringIO("score\\n90\\n85\\n")\nprint(sum(int(r["score"]) for r in csv.DictReader(buf)))'),
    snippet('Delimiter', 'import csv\nfrom io import StringIO\nbuf = StringIO()\ncsv.writer(buf, delimiter=";").writerow(["a", "b"])\nprint(buf.getvalue())'),
  ],
  urllib_requests: [
    snippet('urlopen', 'from urllib.request import urlopen\nprint("urllib ready")'),
    snippet('Parse url', 'from urllib.parse import urlparse\nprint(urlparse("https://example.com/path"))'),
    snippet('quote', 'from urllib.parse import quote\nprint(quote("hello world"))'),
    snippet('Request headers', '# req = Request(url, headers={"User-Agent": "CodeQuest"})\nprint("custom headers")'),
  ],
  rest_apis: [
    snippet('Response dict', 'response = {"status": 200, "data": {"id": 1, "title": "Todo"}}\nprint(response["status"])'),
    snippet('Status codes', 'print(200, 404, 500)'),
    snippet('JSON body', 'import json\ndata = {"id": 1, "title": "Todo"}\nprint(json.dumps(data))'),
    snippet('GET POST', 'methods = ["GET", "POST", "PUT", "DELETE"]\nprint(methods)'),
  ],
  datetime_data: [
    snippet('now', 'from datetime import datetime\nprint(datetime.now().strftime("%Y-%m-%d"))'),
    snippet('timedelta', 'from datetime import datetime, timedelta\nprint((datetime.now() + timedelta(days=7)).date())'),
    snippet('Parse', 'from datetime import datetime\nd = datetime.strptime("2024-06-01", "%Y-%m-%d")\nprint(d.month)'),
    snippet('ISO date', 'from datetime import date\nprint(date.today().isoformat())'),
  ],
  sqlite_basics: [
    snippet('In-memory DB', 'import sqlite3\nconn = sqlite3.connect(":memory:")\nconn.execute("CREATE TABLE users (id INTEGER, name TEXT)")\nconn.execute("INSERT INTO users VALUES (1, ?)", ("Ana",))\nprint(conn.execute("SELECT name FROM users").fetchone()[0])'),
    snippet('Parameterized', 'import sqlite3\nconn = sqlite3.connect(":memory:")\nconn.execute("CREATE TABLE t (v INTEGER)")\nconn.execute("INSERT INTO t VALUES (?)", (42,))\nprint(conn.execute("SELECT v FROM t WHERE v=?", (42,)).fetchone()[0])'),
    snippet('fetchall', 'import sqlite3\nconn = sqlite3.connect(":memory:")\nconn.execute("CREATE TABLE t (v INTEGER)")\nconn.executemany("INSERT INTO t VALUES (?)", [(1,), (2,)])\nprint(conn.execute("SELECT v FROM t").fetchall())'),
  ],
  pandas_intro: [
    snippet('DataFrame', 'try:\n    import pandas as pd\n    df = pd.DataFrame({"name": ["Ana", "Bob"], "score": [90, 85]})\n    print(df)\nexcept ImportError:\n    print("pandas not installed")'),
    snippet('Mean column', 'try:\n    import pandas as pd\n    df = pd.DataFrame({"score": [90, 85]})\n    print(df["score"].mean())\nexcept ImportError:\n    print("pandas not installed")'),
    snippet('head()', 'try:\n    import pandas as pd\n    df = pd.DataFrame({"a": [1, 2, 3]})\n    print(df.head(2))\nexcept ImportError:\n    print("pandas not installed")'),
  ],
  data_validation: [
    snippet('Validate user', 'def validate_user(data):\n    if "name" not in data or not isinstance(data["name"], str):\n        raise ValueError("name required string")\n    if "age" in data and data["age"] < 0:\n        raise ValueError("age must be non-negative")\n    return data\nprint(validate_user({"name": "Ana", "age": 30}))'),
    snippet('Required fields', 'required = ["name", "email"]\ndata = {"name": "Ana", "email": "a@b.c"}\nprint(all(k in data for k in required))'),
    snippet('Type check', 'def is_int(x):\n    return isinstance(x, int)\nprint(is_int(5), is_int("5"))'),
    snippet('Range check', 'age = 30\nprint(0 <= age <= 120)'),
  ],

  // ── Capstone projects ───────────────────────────────────
  cli_guess_game: [
    snippet('randint', 'import random\nprint(random.randint(1, 10))'),
    snippet('while guess', 'secret = 7\nguess = 0\nwhile guess != secret:\n    guess = 7\nprint("win")'),
    snippet('Higher/Lower', 'g, s = 3, 5\nif g < s:\n    print("Higher")\nelif g > s:\n    print("Lower")'),
    snippet('main guard', 'def main():\n    print("play")\n\nif __name__ == "__main__":\n    main()'),
    snippet('try int input', 'try:\n    n = int("5")\nexcept ValueError:\n    n = 0\nprint(n)'),
  ],
  todo_list: [
    snippet('List of dicts', 'todos = [{"id": 1, "text": "Learn Python", "done": False}]\nprint(todos)'),
    snippet('add task', 'todos = []\ntodos.append({"id": 1, "text": "Build", "done": False})\nprint(todos)'),
    snippet('List tasks', 'todos = [{"text": "a", "done": False}, {"text": "b", "done": True}]\nfor t in todos:\n    mark = "x" if t["done"] else " "\n    print(f"[{mark}] {t[\'text\']}")'),
    snippet('json save', 'import json\ntodos = [{"text": "a"}]\nprint(json.dumps(todos))'),
    snippet('Filter done', 'todos = [{"done": True}, {"done": False}]\nopen_tasks = [t for t in todos if not t["done"]]\nprint(len(open_tasks))'),
  ],
  password_generator: [
    snippet('random.choice', 'import random\nimport string\nprint(random.choice(string.ascii_letters))'),
    snippet('Join password', 'import random\nimport string\nchars = string.ascii_letters + string.digits\nprint("".join(random.choice(chars) for _ in range(8)))'),
    snippet('generate fn', 'import random\nimport string\n\ndef generate_password(n=12):\n    chars = string.ascii_letters + string.digits\n    return "".join(random.choice(chars) for _ in range(n))\nprint(generate_password(8))'),
    snippet('secrets', 'import secrets\nprint(secrets.choice("abc"))'),
  ],
  unit_converter: [
    snippet('km to miles', 'KM_TO_MI = 0.621371\nprint(10 * KM_TO_MI)'),
    snippet('C to F', 'def c_to_f(c):\n    return c * 9/5 + 32\nprint(c_to_f(0))'),
    snippet('Conversion dict', 'factors = {"km": 1000, "m": 1}\nprint(factors["km"])'),
    snippet('Convert fn', 'def km_to_miles(km):\n    return km * 0.621371\nprint(km_to_miles(10))'),
  ],
  contact_book: [
    snippet('Dict storage', 'contacts = {}\ncontacts["ana"] = {"phone": "555"}\nprint(contacts)'),
    snippet('add contact', 'contacts = {}\ndef add(name, phone):\n    contacts[name.lower()] = {"phone": phone}\nadd("Ana", "555")\nprint(contacts)'),
    snippet('get lookup', 'contacts = {"ana": {"phone": "555"}}\nprint(contacts.get("bob"))'),
    snippet('Search partial', 'contacts = {"ana": 1, "andrew": 2}\nprint([k for k in contacts if "an" in k])'),
  ],
  quiz_app: [
    snippet('Question dict', 'questions = [{"q": "2+2?", "choices": ["3", "4"], "a": 1}]\nprint(questions[0]["choices"])'),
    snippet('Grade answers', 'questions = [{"a": 1}, {"a": 0}]\nanswers = [1, 0]\nscore = sum(1 for i, a in enumerate(answers) if a == questions[i]["a"])\nprint(score)'),
    snippet('Percent', 'print(int(3 / 4 * 100))'),
    snippet('shuffle', 'import random\nlst = [1, 2, 3]\nrandom.shuffle(lst)\nprint(lst)'),
  ],
  expense_tracker: [
    snippet('Add expense', 'expenses = []\nexpenses.append({"amount": 12.5, "category": "food"})\nprint(expenses)'),
    snippet('Sum amounts', 'expenses = [{"amount": 10}, {"amount": 5}]\nprint(sum(e["amount"] for e in expenses))'),
    snippet('Filter category', 'expenses = [{"category": "food", "amount": 1}, {"category": "bus", "amount": 2}]\nprint([e for e in expenses if e["category"] == "food"])'),
    snippet('strftime date', 'from datetime import datetime\nprint(datetime.now().strftime("%Y-%m-%d"))'),
    snippet('Group totals', 'totals = {}\nfor e in [{"category": "food", "amount": 10}, {"category": "food", "amount": 5}]:\n    totals[e["category"]] = totals.get(e["category"], 0) + e["amount"]\nprint(totals)'),
  ],
  web_scraper_basics: [
    snippet('Split parse', 'html = \'<a href="/page">Link</a>\'\nparts = html.split("<a href=")\nprint(len(parts))'),
    snippet('Extract href', 'part = \'"/page">Link\'\nurl = part.split(">")[0].strip(\'"\')\nprint(url)'),
    snippet('Build links', 'links = []\nlinks.append("/page")\nprint(links)'),
    snippet('urlopen', 'from urllib.request import urlopen\nprint("fetch ready")'),
    snippet('sleep rate limit', 'import time\ntime.sleep(0)\nprint("rate limit")'),
  ],
  weather_cli: [
    snippet('Mock API', 'API_SAMPLE = {"city": "London", "temp_c": 18, "conditions": "Cloudy"}\nprint(API_SAMPLE)'),
    snippet('Format report', 'data = {"city": "London", "temp_c": 18, "conditions": "Cloudy", "humidity": 72}\nprint(f"{data[\'city\']}: {data[\'temp_c\']}C, {data[\'conditions\']}")'),
    snippet('get nested', 'data = {}\nprint(data.get("wind", "Unknown"))'),
    snippet('json cache', 'import json\ndata = {"city": "London", "temp_c": 18}\nprint(json.dumps(data))'),
    snippet('argparse', 'import argparse\np = argparse.ArgumentParser()\np.add_argument("--city", default="Paris")\nprint(p.parse_args([]).city)'),
  ],
  capstone_planning: [
    snippet('Score fn', 'def project_score(features_done, tests_done):\n    return features_done * 10 + tests_done * 15\nprint(project_score(4, 2))'),
    snippet('main guard', 'def main():\n    print("Capstone ready")\n\nif __name__ == "__main__":\n    main()'),
    snippet('Module list', 'modules = ["models", "cli", "utils"]\nprint("cli" in modules)'),
    snippet('try/except plan', 'try:\n    int("42")\nexcept ValueError:\n    print("handle bad input")'),
    snippet('README sections', 'sections = ["Install", "Usage", "License"]\nprint(len(sections))'),
  ],

  // ── Section projects ────────────────────────────────────────────
  rectangle_class: [
    snippet('class def', 'class Rectangle:\n    pass\nprint(Rectangle)'),
    snippet('__init__', 'class Rectangle:\n    def __init__(self, w, h):\n        self.width, self.height = w, h\nr = Rectangle(4, 5)\nprint(r.width)'),
    snippet('area()', 'class Rectangle:\n    def __init__(self, w, h):\n        self.width, self.height = w, h\n    def area(self):\n        return self.width * self.height\nprint(Rectangle(4, 5).area())'),
    snippet('Instance', 'class Rectangle:\n    def __init__(self, w, h):\n        self.width, self.height = w, h\n    def area(self):\n        return self.width * self.height\nprint(Rectangle(3, 3).area())'),
  ],
  contact_card: [
    snippet('Contact class', 'class Contact:\n    def __init__(self, name, email):\n        self.name, self.email = name, email\n\nc = Contact("Ana", "ana@mail.com")\nprint(c.name)'),
    snippet('label()', 'class Contact:\n    def __init__(self, n, e):\n        self.name, self.email = n, e\n    def label(self):\n        return f"{self.name} <{self.email}>"\nprint(Contact("Ana", "a@b").label())'),
    snippet('Contact list', 'book = []\nbook.append(1)\nbook.append(2)\nprint(len(book))'),
    snippet('Email check', 'print("@" in "ana@mail.com")'),
  ],
  bank_account: [
    snippet('Balance 0', 'balance = 0\nprint(balance)'),
    snippet('deposit', 'balance = 0\nbalance += 50\nprint(balance)'),
    snippet('safe withdraw', 'balance = 50\namount = 30\nif amount <= balance:\n    balance -= amount\nprint(balance)'),
    snippet('Transactions', 'transactions = 0\ntransactions += 1\ntransactions += 1\nprint(transactions)'),
    snippet('Full class', 'class BankAccount:\n    def __init__(self):\n        self.balance = 0\n    def deposit(self, amount):\n        self.balance += amount\na = BankAccount()\na.deposit(100)\nprint(a.balance)'),
  ],

  // Reused project ids with section-specific prefixes
  proj_data_apis_weather_cli: [
    snippet('Mock API', 'data = {"city": "London", "temp_c": 18, "conditions": "Cloudy"}\nprint(data)'),
    snippet('Format', 'data = {"city": "London", "temp_c": 18, "conditions": "Cloudy", "humidity": 72}\nprint(f"{data[\'city\']}: {data[\'temp_c\']}C")'),
    snippet('get safe', 'data = {}\nprint(data.get("wind", "Unknown"))'),
    snippet('json', 'import json\nprint(json.dumps({"city": "London"}))'),
  ],
  proj_data_apis_expense_tracker: [
    snippet('Add expense', 'expenses = []\nexpenses.append({"amount": 12.5, "category": "food"})\nprint(expenses)'),
    snippet('Sum', 'print(sum(e["amount"] for e in [{"amount": 10}, {"amount": 5}]))'),
    snippet('json save', 'import json\nprint(json.dumps(expenses := [{"amount": 1}]))'),
    snippet('Filter month', 'expenses = [{"date": "2024-06-01", "amount": 1}]\nprint([e for e in expenses if e["date"].startswith("2024-06")])'),
  ],
  proj_data_apis_web_scraper: [
    snippet('Parse href', 'html = \'<a href="/page">Link</a>\'\nparts = html.split("<a href=")\nprint(parts[1].split(">")[0].strip(\'"\'))'),
    snippet('Link list', 'links = ["/page", "/about"]\nprint(links)'),
    snippet('urlopen', 'from urllib.request import urlopen\nprint("ready")'),
    snippet('sleep', 'import time\ntime.sleep(0)\nprint("rate limit")'),
  ],
}

export function sandboxSnippetsFor(levelId) {
  return SANDBOX_SNIPPETS_BY_LEVEL[levelId]
}
