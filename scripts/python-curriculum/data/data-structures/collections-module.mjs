// Data structures topic: The collections module. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "collections_data",
  title: "The collections module",
  paragraphs: [
    "Python's `collections` module has containers made for everyday data jobs. Each one behaves like a dict, a tuple or a list you already know, with one extra skill. Import the ones you need at the top: `from collections import Counter, defaultdict`.",
    "**`Counter` counts things.** Give it a list (or a string) and it maps each item to how often it appears. A missing item counts as 0 instead of raising a `KeyError`, and `most_common(n)` gives the top `n` as `(item, count)` pairs, most common first.",
    "```\nfrom collections import Counter\n\ncounts = Counter([\"apple\", \"pear\", \"apple\", \"fig\", \"apple\"])\nprint(counts[\"apple\"], counts[\"kiwi\"])   # 3 0\nprint(counts.most_common(2))             # [('apple', 3), ('pear', 1)]\n```",
    "Counters do arithmetic too: `stock - sold` subtracts the counts item by item and leaves out anything that reaches zero or less, and `+` adds two counters together.",
    "**`defaultdict` fills in missing keys.** `defaultdict(list)` gives every new key an empty list the first time you use it, so grouping needs no `if key not in d` check. `defaultdict(int)` starts new keys at 0, and `defaultdict(set)` with an empty set.",
    "```\nfrom collections import defaultdict\n\nby_letter = defaultdict(list)\nfor name in [\"Ana\", \"Ben\", \"Amir\", \"Bea\"]:\n    by_letter[name[0]].append(name)\nprint(dict(by_letter))   # {'A': ['Ana', 'Amir'], 'B': ['Ben', 'Bea']}\n```",
    "**`namedtuple` names the fields of a tuple.** After `Point = namedtuple(\"Point\", [\"x\", \"y\"])`, `p = Point(3, 4)` makes a tuple you can read as `p.x` and `p.y` instead of `p[0]` and `p[1]`. It's still a tuple, so it unpacks and can't be changed.",
    "**`deque` (say \"deck\") is a list built for both ends.** `append` and `pop` work at the right, `appendleft` and `popleft` at the left, all of them fast; removing from the front of a list is slow, because every other item has to move. That makes a deque the natural choice for a queue. With `deque(maxlen=3)` it keeps only the last 3 items: appending a fourth drops the oldest.",
    "```\nfrom collections import deque\n\nqueue = deque([\"Ana\", \"Ben\"])\nqueue.append(\"Cleo\")       # joins at the back\nprint(queue.popleft())     # Ana is served first\nrecent = deque(maxlen=3)\nfor reading in [20, 21, 23, 22]:\n    recent.append(reading)\nprint(list(recent))        # [21, 23, 22]\n```",
    "Two more tools. `ChainMap(cli, env, defaults)` looks a key up in each dict in turn and returns the first match, a neat way to layer settings. And outside `collections`, `heapq.nlargest(3, scores, key=scores.get)` (after `import heapq`) gives the 3 keys with the highest values, biggest first.",
  ],
  sandboxCode: "from collections import Counter, defaultdict\n\nwords = \"the cat and the dog and the bird\".split()\nprint(Counter(words).most_common(2))\n\nby_length = defaultdict(list)\nfor word in words:\n    by_length[len(word)].append(word)\nprint(dict(by_length))",
  sandboxSnippets: [
    snippet("Counter", "from collections import Counter\n\nstock = Counter({\"apple\": 10, \"pear\": 4, \"fig\": 2})\nsold = Counter({\"apple\": 3, \"fig\": 2})\nprint(stock - sold)\nprint(Counter(\"mississippi\").most_common(2))"),
    snippet("defaultdict", "from collections import defaultdict\n\ntotals = defaultdict(int)\nfor item, amount in [(\"tea\", 2), (\"cake\", 1), (\"tea\", 3)]:\n    totals[item] += amount\nprint(dict(totals))"),
    snippet("namedtuple", "from collections import namedtuple\n\nProduct = namedtuple(\"Product\", [\"name\", \"price\"])\npen = Product(\"Pen\", 1.5)\nprint(pen.name, pen.price, pen)\nname, price = pen\nprint(name)"),
    snippet("deque", "from collections import deque\n\nrecent = deque(maxlen=3)\nfor reading in [21.5, 22.0, 22.4, 23.1]:\n    recent.append(reading)\n    print(list(recent))"),
    snippet("ChainMap and heapq", "import heapq\nfrom collections import ChainMap\n\nsettings = ChainMap({\"debug\": True}, {\"port\": 9000}, {\"port\": 8000, \"debug\": False})\nprint(settings[\"port\"], settings[\"debug\"])\nscores = {\"Ana\": 88, \"Ben\": 95, \"Cy\": 72}\nprint(heapq.nlargest(2, scores, key=scores.get))"),
  ],
  readMore: { label: "Python docs: collections", url: "https://docs.python.org/3/library/collections.html", source: "Python docs" },
  challenges: [
    task("easy", "Count the fruit", {
      prompt: "Set `counts` to a `Counter` of the fruit in `basket`.",
      starter: "from collections import Counter\n\nbasket = [\"apple\", \"pear\", \"apple\", \"fig\", \"apple\", \"pear\"]\n",
      hint: "`counts = Counter(basket)`.",
      solution: "from collections import Counter\n\nbasket = [\"apple\", \"pear\", \"apple\", \"fig\", \"apple\", \"pear\"]\ncounts = Counter(basket)",
      tests: [
        ["counts is right", "counts == {\"apple\": 3, \"pear\": 2, \"fig\": 1} and isinstance(counts, Counter)"],
      ],
    }),
    task("easy", "The top two", {
      prompt: "Set `top2` to the two most common words in `text`, as `(word, count)` pairs.",
      starter: "from collections import Counter\n\ntext = \"the cat and the dog and the bird\"\n",
      hint: "Count the words, then ask for the top 2: `Counter(text.split()).most_common(2)`.",
      solution: "from collections import Counter\n\ntext = \"the cat and the dog and the bird\"\ntop2 = Counter(text.split()).most_common(2)",
      tests: [
        ["top2 is right", "top2 == [(\"the\", 3), (\"and\", 2)]"],
      ],
    }),
    task("medium", "Group by first letter", {
      prompt: "Build `by_letter` with `defaultdict(list)`, so `by_letter[\"A\"]` is the list of names starting with A.",
      starter: "from collections import defaultdict\n\nnames = [\"Ana\", \"Ben\", \"Amir\", \"Bea\", \"Cleo\"]\n",
      hint: "Make `by_letter = defaultdict(list)`, then for each name: `by_letter[name[0]].append(name)`.",
      solution: "from collections import defaultdict\n\nnames = [\"Ana\", \"Ben\", \"Amir\", \"Bea\", \"Cleo\"]\nby_letter = defaultdict(list)\nfor name in names:\n    by_letter[name[0]].append(name)",
      tests: [
        ["A names", "by_letter[\"A\"] == [\"Ana\", \"Amir\"]"],
        ["B names", "by_letter[\"B\"] == [\"Ben\", \"Bea\"]"],
        ["C names", "by_letter[\"C\"] == [\"Cleo\"]"],
      ],
    }),
    task("medium", "Name the fields", {
      prompt: "Make a `namedtuple` called `Point` with fields `x` and `y`, and set `p` to the point (3, 4).",
      starter: "from collections import namedtuple\n\n",
      hint: "`Point = namedtuple(\"Point\", [\"x\", \"y\"])`, then `p = Point(3, 4)`.",
      solution: "from collections import namedtuple\n\nPoint = namedtuple(\"Point\", [\"x\", \"y\"])\np = Point(3, 4)",
      tests: [
        ["p.x is 3", "p.x == 3"],
        ["p.y is 4", "p.y == 4"],
        ["p is still a tuple", "p == (3, 4)"],
      ],
    }),
    task("medium", "Stock after sales", {
      prompt: "Set `remaining` to the stock left after the sales, by subtracting the counters.",
      starter: "from collections import Counter\n\nstock = Counter({\"apple\": 10, \"pear\": 4, \"fig\": 2})\nsold = Counter({\"apple\": 3, \"fig\": 2})\n",
      hint: "`remaining = stock - sold`. Items that reach 0 are left out.",
      solution: "from collections import Counter\n\nstock = Counter({\"apple\": 10, \"pear\": 4, \"fig\": 2})\nsold = Counter({\"apple\": 3, \"fig\": 2})\nremaining = stock - sold",
      tests: [
        ["Counts went down", "remaining[\"apple\"] == 7 and remaining[\"pear\"] == 4"],
        ["Sold-out figs are gone", "\"fig\" not in remaining"],
      ],
    }),
    task("medium", "Serve the queue", {
      prompt: "Dev joins the back of `queue` and Eli, who has a priority pass, joins the front. Then serve two people from the front: set `served` to their names, in order. The rest stay in `queue`.",
      starter: "from collections import deque\n\nqueue = deque([\"Ana\", \"Ben\", \"Cleo\"])\n",
      hint: "`append` adds at the back, `appendleft` at the front, and `popleft` takes from the front: `served = [queue.popleft(), queue.popleft()]`.",
      solution: "from collections import deque\n\nqueue = deque([\"Ana\", \"Ben\", \"Cleo\"])\nqueue.append(\"Dev\")\nqueue.appendleft(\"Eli\")\nserved = [queue.popleft(), queue.popleft()]",
      tests: [
        ["served is Eli, then Ana", "served == [\"Eli\", \"Ana\"]"],
        ["queue holds the rest", "list(queue) == [\"Ben\", \"Cleo\", \"Dev\"]"],
      ],
    }),
    task("hard", "The last three", {
      prompt: "Keep only the latest 3 readings: add every reading to a `deque` with `maxlen=3` called `recent`.",
      starter: "from collections import deque\n\nreadings = [20.5, 21.0, 22.4, 23.1, 22.8]\n",
      hint: "`recent = deque(maxlen=3)`, then `append` each reading in a loop.",
      solution: "from collections import deque\n\nreadings = [20.5, 21.0, 22.4, 23.1, 22.8]\nrecent = deque(maxlen=3)\nfor r in readings:\n    recent.append(r)",
      tests: [
        ["recent holds the last three", "list(recent) == [22.4, 23.1, 22.8]"],
      ],
    }),
    task("hard", "A search index", {
      prompt: "Build `index` with `defaultdict(set)`: it maps each lowercase word to the set of document ids it appears in.",
      starter: "from collections import defaultdict\n\ndocs = {1: \"Python loves data\", 2: \"Data beats opinion\", 3: \"Python is fun\"}\n",
      hint: "Loop over `docs.items()`, then over the words of each text, and `index[word.lower()].add(doc_id)`.",
      solution: "from collections import defaultdict\n\ndocs = {1: \"Python loves data\", 2: \"Data beats opinion\", 3: \"Python is fun\"}\nindex = defaultdict(set)\nfor doc_id, text in docs.items():\n    for word in text.split():\n        index[word.lower()].add(doc_id)",
      tests: [
        ["python is in 1 and 3", "index[\"python\"] == {1, 3}"],
        ["data is in 1 and 2", "index[\"data\"] == {1, 2}"],
        ["fun is in 3", "index[\"fun\"] == {3}"],
      ],
    }),
    task("hard", "Layered settings", {
      prompt: "Set `settings` to a `ChainMap` that looks a key up in `command_line` first, then `file_settings`, then `defaults`. Then set `port`, `debug` and `host` from it.",
      starter: "from collections import ChainMap\n\ndefaults = {\"port\": 8000, \"debug\": False, \"host\": \"localhost\"}\nfile_settings = {\"port\": 9000}\ncommand_line = {\"debug\": True}\n",
      hint: "List the dicts in the order to search: `ChainMap(command_line, file_settings, defaults)`. Then `settings[\"port\"]` and so on.",
      solution: "from collections import ChainMap\n\ndefaults = {\"port\": 8000, \"debug\": False, \"host\": \"localhost\"}\nfile_settings = {\"port\": 9000}\ncommand_line = {\"debug\": True}\nsettings = ChainMap(command_line, file_settings, defaults)\nport = settings[\"port\"]\ndebug = settings[\"debug\"]\nhost = settings[\"host\"]",
      tests: [
        ["settings is a ChainMap", "isinstance(settings, ChainMap)"],
        ["port comes from the file", "port == 9000"],
        ["debug comes from the command line", "debug is True"],
        ["host comes from the defaults", "host == \"localhost\""],
      ],
    }),
    task("expert", "Moving average", {
      prompt: "Set `averages` to the average of every run of 3 readings in a row, using a `deque(maxlen=3)` as a sliding window.",
      starter: "from collections import deque\n\nreadings = [1, 2, 3, 4, 5]\n",
      hint: "Append each reading to the window; once `len(window) == 3`, append `sum(window) / 3` to `averages`.",
      solution: "from collections import deque\n\nreadings = [1, 2, 3, 4, 5]\nwindow = deque(maxlen=3)\naverages = []\nfor r in readings:\n    window.append(r)\n    if len(window) == 3:\n        averages.append(sum(window) / 3)",
      tests: [
        ["averages is right", "averages == [2.0, 3.0, 4.0]"],
      ],
    }),
    task("expert", "The top three", {
      prompt: "Set `podium` to the names of the 3 highest scorers, best first, using `heapq.nlargest`.",
      starter: "import heapq\n\nscores = {\"Ana\": 88, \"Ben\": 95, \"Cy\": 72, \"Dee\": 91, \"Eli\": 79}\n",
      hint: "Sort the keys by their values: `heapq.nlargest(3, scores, key=scores.get)`.",
      solution: "import heapq\n\nscores = {\"Ana\": 88, \"Ben\": 95, \"Cy\": 72, \"Dee\": 91, \"Eli\": 79}\npodium = heapq.nlargest(3, scores, key=scores.get)",
      tests: [
        ["podium is right", "podium == [\"Ben\", \"Dee\", \"Ana\"]"],
      ],
    }),
  ],
  questions: [
    mc("What is `Counter(\"banana\")[\"a\"]`?", ["`1`", "`2`", "`3`", "An error"], 2, "`Counter` counts each item, and \"banana\" has three a's."),
    qShort("Which `Counter` method returns the most frequent items? (name only)", "most_common", "`most_common(n)` returns the `n` most frequent items with their counts."),
    mc("What happens when you read a missing key from `defaultdict(list)`?", ["A `KeyError`", "It returns and stores an empty list", "It returns `None`", "It returns 0"], 1, "A `defaultdict` calls its factory, here `list`, to create and store a value for a missing key."),
    mc("Why use a `namedtuple` instead of a plain tuple?", ["You can read the fields by name", "It can be changed", "It sorts itself", "It holds more items"], 0, "A namedtuple is still a tuple, but `p.x` reads better than `p[0]`."),
    mc("What does `deque(maxlen=3)` do when a fourth item is appended?", ["Raises an error", "Grows to 4", "Ignores the new item", "Drops the oldest item"], 3, "A bounded deque keeps only the newest `maxlen` items."),
    mc("Why is a `deque` better than a list for a queue?", ["It sorts its items", "Adding and removing at both ends is fast", "It can't change", "It removes duplicates"], 1, "A deque adds and removes at either end in constant time; `list.pop(0)` has to shift every item."),
    mc("What does `Counter(a=1) - Counter(a=3)` give?", ["`Counter({\"a\": -2})`", "An error", "An empty `Counter`", "`Counter({\"a\": 2})`"], 2, "Counter subtraction keeps only positive counts, so a count of -2 is dropped."),
    mc("What does `Counter([\"x\", \"y\"])[\"z\"]` give?", ["`0`", "A `KeyError`", "`None`", "`1`"], 0, "A missing key in a `Counter` counts as 0 instead of raising an error."),
    mc("Which `collections` class looks keys up through several dicts in order?", ["`Counter`", "`deque`", "`namedtuple`", "`ChainMap`"], 3, "`ChainMap` searches each dict in turn and returns the first match."),
    mc("Which method takes the first item off the front of a deque?", ["`pop()`", "`remove()`", "`popleft()`", "`shift()`"], 2, "`popleft()` removes and returns the item at the left end."),
  ],
})
