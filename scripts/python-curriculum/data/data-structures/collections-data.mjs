import { makeTopic, mc, py, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: 'collections_data',
  title: 'The collections module',
  paragraphs: [
    "The `collections` module has containers made for everyday data jobs. Each one behaves like a dict, list or tuple you already know, with one extra skill.",
    "`Counter` counts things. Give it any list (or string) and it maps each item to how often it appears. `most_common(n)` returns the top `n` as `(item, count)` pairs, and a missing key counts as 0 instead of raising `KeyError`.",
    "```\nfrom collections import Counter\n\ncounts = Counter([\"apple\", \"pear\", \"apple\"])\nprint(counts[\"apple\"], counts[\"fig\"])   # 2 0\nprint(Counter(\"banana\").most_common(1))   # [('a', 3)]\n```",
    "Counters can also do arithmetic: `stock - sold` subtracts the counts and drops every item that reaches zero or less, so `Counter(a=1) - Counter(a=3)` is an empty Counter.",
    "`defaultdict` creates a value the first time you use a missing key. With `defaultdict(list)`, a new key starts as an empty list, so you can group items without first checking `if key not in d`. `defaultdict(set)` collects unique values the same way.",
    "```\nfrom collections import defaultdict\n\nby_letter = defaultdict(list)\nfor name in [\"Ana\", \"Ben\", \"Amir\"]:\n    by_letter[name[0]].append(name)\nprint(dict(by_letter))   # {'A': ['Ana', 'Amir'], 'B': ['Ben']}\n```",
    "`namedtuple` makes a small record type with named fields: after `Product = namedtuple(\"Product\", [\"name\", \"price\"])` you can write `p.price` instead of `p[1]`, which makes code much easier to read. It is still a tuple, so it works anywhere a tuple does.",
    "`deque` (say \"deck\") is a list built for adding and removing at both ends. A list is slow at the front, because every other item has to move along, so a deque is the better choice for a queue. With `maxlen=3` a deque keeps only the last 3 items: appending a fourth drops the oldest. That's exactly what you want for \"the latest readings\" or a moving window.",
    "`ChainMap(cli, env, defaults)` looks a key up in each dict in turn and returns the first match, so earlier dicts override later ones without copying anything. It's a neat way to layer settings.",
    "Outside `collections`, the `heapq` module finds the largest or smallest items quickly: `heapq.nlargest(3, items, key=...)` returns the top 3, biggest first. And since Python 3.7, a plain `dict` keeps its keys in the order you added them.",
  ],
  sandboxCode: "from collections import Counter, defaultdict\n\nwords = \"the cat and the dog and the bird\".split()\nprint(Counter(words).most_common(2))\n\nby_length = defaultdict(list)\nfor word in words:\n    by_length[len(word)].append(word)\nprint(dict(by_length))",
  sandboxSnippets: [
    snippet("Counter", "from collections import Counter\n\nstock = Counter({\"apple\": 10, \"pear\": 4, \"fig\": 2})\nsold = Counter({\"apple\": 3, \"fig\": 2})\nprint(stock - sold)\nprint(Counter(\"mississippi\").most_common(2))"),
    snippet("defaultdict", "from collections import defaultdict\n\ndocs = {1: \"python loves data\", 2: \"data beats opinion\"}\nindex = defaultdict(set)\nfor doc_id, text in docs.items():\n    for word in text.split():\n        index[word].add(doc_id)\nprint(sorted(index[\"data\"]))"),
    snippet("namedtuple", "from collections import namedtuple\n\nProduct = namedtuple(\"Product\", [\"name\", \"price\"])\nproducts = [Product(\"Pen\", 1.5), Product(\"Book\", 12.0)]\ncheapest = min(products, key=lambda p: p.price)\nprint(cheapest.name, cheapest)"),
    snippet("deque", "from collections import deque\n\nrecent = deque(maxlen=3)\nfor reading in [21.5, 22.0, 22.4, 23.1]:\n    recent.append(reading)\n    print(list(recent))"),
    snippet("ChainMap and heapq", "import heapq\nfrom collections import ChainMap\n\nsettings = ChainMap({\"debug\": True}, {\"port\": 9000}, {\"port\": 8000, \"debug\": False})\nprint(settings[\"port\"], settings[\"debug\"])\n\nscores = {\"Ana\": 91, \"Ben\": 78, \"Cy\": 85}\nprint(heapq.nlargest(2, scores.items(), key=lambda item: item[1]))"),
  ],
  readMore: { label: "Python docs: the collections module", url: "https://docs.python.org/3/library/collections.html", source: "Python docs" },
  challenges: [
    task('easy', 'Count things', {
      prompt: 'Count how often each fruit appears in `basket` using `Counter`. Store it in `counts`.',
      starter: py`from collections import Counter

basket = ["apple", "pear", "apple", "fig", "apple", "pear"]
counts = ___`,
      hint: '`Counter(basket)` does all the counting.',
      solution: py`from collections import Counter

basket = ["apple", "pear", "apple", "fig", "apple", "pear"]
counts = Counter(basket)`,
      tests: [
        ['apples', py`counts["apple"] == 3`],
        ['pears and figs', py`counts["pear"] == 2 and counts["fig"] == 1`],
        ['Missing items count as 0', py`counts["kiwi"] == 0`],
      ],
    }),
    task('easy', 'Group with defaultdict', {
      prompt: 'Group `names` by their first letter: `by_letter["A"]` should be the list of names starting with A. Use `defaultdict(list)`.',
      starter: py`from collections import defaultdict

names = ["Ana", "Ben", "Amir", "Bea", "Cleo"]
by_letter = defaultdict(list)
___`,
      hint: 'Loop over the names and `append` each one to `by_letter[name[0]]`. Missing keys start as an empty list.',
      solution: py`from collections import defaultdict

names = ["Ana", "Ben", "Amir", "Bea", "Cleo"]
by_letter = defaultdict(list)
for name in names:
    by_letter[name[0]].append(name)`,
      tests: [
        ['A names', py`by_letter["A"] == ["Ana", "Amir"]`],
        ['B and C names', py`by_letter["B"] == ["Ben", "Bea"] and by_letter["C"] == ["Cleo"]`],
      ],
    }),
    task('medium', 'Most common', {
      prompt: 'Find the two most common words in `text`. Store them in `top2` as a list of `(word, count)` pairs.',
      starter: py`from collections import Counter

text = "the cat and the dog and the bird"
top2 = ___`,
      hint: 'Split into words, count them, then call `.most_common(2)`.',
      solution: py`from collections import Counter

text = "the cat and the dog and the bird"
top2 = Counter(text.split()).most_common(2)`,
      tests: [['Top two words', py`top2 == [("the", 3), ("and", 2)]`]],
    }),
    task('medium', 'Named tuples', {
      prompt:
        'Define a `Product` namedtuple with fields `name` and `price`, build the three products below, and set `cheapest` to the name of the cheapest one.',
      starter: py`from collections import namedtuple

Product = ___
products = [Product("Pen", 1.5), Product("Book", 12.0), Product("Cup", 4.25)]
cheapest = ___`,
      hint: '`namedtuple("Product", ["name", "price"])`; then `min(products, key=lambda p: p.price).name`.',
      solution: py`from collections import namedtuple

Product = namedtuple("Product", ["name", "price"])
products = [Product("Pen", 1.5), Product("Book", 12.0), Product("Cup", 4.25)]
cheapest = min(products, key=lambda p: p.price).name`,
      tests: [
        ['Fields work by name', py`products[1].price == 12.0 and products[1].name == "Book"`],
        ['cheapest', py`cheapest == "Pen"`],
      ],
    }),
    task('hard', 'Keep the last few readings', {
      prompt:
        'A sensor sends `readings` one at a time. Keep only the 3 most recent in a `deque` called `recent` (use `maxlen`).',
      starter: py`from collections import deque

readings = [21.5, 22.0, 22.4, 23.1, 22.8]
recent = deque(___)
for r in readings:
    ___`,
      hint: '`deque(maxlen=3)` drops the oldest item automatically when you `append` a fourth.',
      solution: py`from collections import deque

readings = [21.5, 22.0, 22.4, 23.1, 22.8]
recent = deque(maxlen=3)
for r in readings:
    recent.append(r)`,
      tests: [
        ['Only the last 3', py`list(recent) == [22.4, 23.1, 22.8]`],
        ['Bounded to 3', py`recent.maxlen == 3`],
      ],
    }),
    task('hard', 'Stock left after sales', {
      prompt:
        'Subtract `sold` from `stock` with `Counter` arithmetic. Store it in `remaining`. Items that sold out should disappear.',
      starter: py`from collections import Counter

stock = Counter({"apple": 10, "pear": 4, "fig": 2})
sold = Counter({"apple": 3, "fig": 2})
remaining = ___`,
      hint: '`stock - sold` keeps only positive counts.',
      solution: py`from collections import Counter

stock = Counter({"apple": 10, "pear": 4, "fig": 2})
sold = Counter({"apple": 3, "fig": 2})
remaining = stock - sold`,
      tests: [
        ['Counts reduced', py`remaining["apple"] == 7 and remaining["pear"] == 4`],
        ['Sold-out items removed', py`"fig" not in remaining`],
      ],
    }),
    task('expert', 'Build a search index', {
      prompt:
        'Build `index`, mapping each lowercase word to the set of document ids it appears in. Then write `search(word)` that returns those ids as a sorted list.',
      starter: py`from collections import defaultdict

docs = {1: "Python loves data", 2: "Data beats opinion", 3: "Python is fun"}
index = defaultdict(set)
___

def search(word):
    ___`,
      hint: 'For each `doc_id, text` in `docs.items()`, add the id to `index[word.lower()]` for every word. `search` returns `sorted(index.get(word.lower(), set()))`.',
      solution: py`from collections import defaultdict

docs = {1: "Python loves data", 2: "Data beats opinion", 3: "Python is fun"}
index = defaultdict(set)
for doc_id, text in docs.items():
    for word in text.split():
        index[word.lower()].add(doc_id)

def search(word):
    return sorted(index.get(word.lower(), set()))`,
      tests: [
        ['Word in two docs', py`search("python") == [1, 3]`],
        ['Case-insensitive', py`search("DATA") == [1, 2]`],
        ['Unknown word', py`search("java") == []`],
      ],
    }),
    task('expert', 'Moving average', {
      prompt:
        'Write `moving_average(values, n)` that returns the average of each run of `n` consecutive values. Use a `deque(maxlen=n)` as the window.',
      starter: py`from collections import deque

def moving_average(values, n):
    ___`,
      hint: 'Append each value to the window; once `len(window) == n`, append `sum(window) / n` to the result.',
      solution: py`from collections import deque

def moving_average(values, n):
    window = deque(maxlen=n)
    result = []
    for v in values:
        window.append(v)
        if len(window) == n:
            result.append(sum(window) / n)
    return result`,
      tests: [
        ['Window of 3', py`moving_average([1, 2, 3, 4, 5], 3) == [2.0, 3.0, 4.0]`],
        ['Window of 2', py`moving_average([10, 20, 30], 2) == [15.0, 25.0]`],
        ['Too few values', py`moving_average([1, 2], 3) == []`],
      ],
    }),
    task('expert', 'Layered settings', {
      prompt:
        'Settings come from three places: command-line flags beat environment values, which beat defaults. Combine them with `ChainMap` into `settings`.',
      starter: py`from collections import ChainMap

defaults = {"port": 8000, "debug": False, "host": "localhost"}
env = {"port": 9000}
cli = {"debug": True}
settings = ___`,
      hint: '`ChainMap(cli, env, defaults)` looks keys up left to right.',
      solution: py`from collections import ChainMap

defaults = {"port": 8000, "debug": False, "host": "localhost"}
env = {"port": 9000}
cli = {"debug": True}
settings = ChainMap(cli, env, defaults)`,
      tests: [
        ['Environment beats defaults', py`settings["port"] == 9000`],
        ['Command line beats both', py`settings["debug"] is True`],
        ['Defaults fill the gaps', py`settings["host"] == "localhost"`],
      ],
    }),
    task('expert', 'Top scores with heapq', {
      prompt:
        'Write `top_scores(scores, k)` that returns the `k` best `(name, score)` pairs from the `scores` dict, highest first. Use `heapq.nlargest`.',
      starter: py`import heapq

def top_scores(scores, k):
    ___`,
      hint: '`heapq.nlargest(k, scores.items(), key=lambda item: item[1])`.',
      solution: py`import heapq

def top_scores(scores, k):
    return heapq.nlargest(k, scores.items(), key=lambda item: item[1])`,
      setup: py`SCORES = {"Ana": 88, "Ben": 95, "Cy": 72, "Dee": 91}`,
      tests: [
        ['Top 2', py`top_scores(SCORES, 2) == [("Ben", 95), ("Dee", 91)]`],
        ['Top 1', py`top_scores(SCORES, 1) == [("Ben", 95)]`],
        ['k larger than the data', py`len(top_scores(SCORES, 10)) == 4`],
      ],
    }),
  ],
  questions: [
    mc("What does `Counter(\"banana\")[\"a\"]` return?", ["`1`","`2`","`3`","An error"], 2),
    qShort('Which `Counter` method returns the most frequent items? (name only)', 'most_common'),
    mc("What happens when you read a missing key from `defaultdict(list)`?", ["`KeyError`","It returns and stores an empty list","It returns `None`","It returns 0"], 1),
    mc('Why use a `namedtuple` instead of a plain tuple?', ['Fields can be read by name', 'It is mutable', 'It sorts itself', 'It uses less memory than any tuple'], 0),
    mc('What does `deque(maxlen=3)` do when a fourth item is appended?', ['Raises an error', 'Grows to 4', 'Ignores the new item', 'Drops the oldest item'], 3),
    mc('Why is a `deque` better than a list for a queue?', ['Adding and removing at both ends is fast', 'It sorts items', 'It can hold more items', 'It is immutable'], 0),
    qShort('Which `collections` class looks keys up through several dicts in order? (class name)', 'ChainMap'),
    mc("`Counter(a=1) - Counter(a=3)` gives…", ["`Counter({\"a\": -2})`","An error","`Counter()` (empty)","`Counter({\"a\": 2})`"], 2),
    mc("Which `heapq` function returns the k largest items?", ["`nlargest`","`heappop`","`max`","`topk`"], 0),
    mc('Since Python 3.7 a plain `dict`…', ['Is sorted by key', 'Keeps insertion order', 'Is immutable', 'Allows duplicate keys'], 1),
  ],
})
