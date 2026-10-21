// Data structures topic: Dictionaries. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "dictionaries",
  title: "Dictionaries",
  paragraphs: [
    "A list finds things by position. A **dictionary** (`dict`) finds them by name: it maps **keys** to **values**, like a word to its meaning in a real dictionary. Write it in curly braces, with a colon between each key and its value, and look values up with the key in square brackets.",
    "```\nages = {\"Ana\": 30, \"Ben\": 25}\nprint(ages[\"Ana\"])   # 30\nprint(len(ages))     # 2\n```",
    "Keys are unique: each key appears once. Assigning to a key adds it, or replaces its value if it's already there: `ages[\"Cleo\"] = 41` adds Cleo, and `ages[\"Ben\"] = 26` changes Ben's age. `del ages[\"Ben\"]` removes a key, and `ages.pop(\"Ben\")` removes it and returns its value. `\"Ana\" in ages` checks whether a **key** exists.",
    "Looking up a key that isn't there raises a `KeyError`. When a key might be missing, use `get`: `ages.get(\"Dan\")` returns `None` instead of failing, and `ages.get(\"Dan\", 0)` returns the default you give it.",
    "```\nstock = {\"apple\": 12, \"pear\": 0}\nprint(stock.get(\"kiwi\"))      # None\nprint(stock.get(\"kiwi\", 0))   # 0\nprint(\"pear\" in stock)        # True\n```",
    "`get` with a default makes counting easy, one of the most common jobs for a dict. For each item, take its count so far (0 if it's new), add 1, and store it back:",
    "```\ncounts = {}\nfor word in \"the cat and the hat\".split():\n    counts[word] = counts.get(word, 0) + 1\nprint(counts)   # {'the': 2, 'cat': 1, 'and': 1, 'hat': 1}\n```",
    "`keys()`, `values()` and `items()` give you the keys, the values, or `(key, value)` pairs. A `for` loop over a dict goes through its keys; loop over `items()` to get both at once: `for name, age in ages.items():`. Dicts remember the order in which keys were added.",
    "Values can be anything, but keys must be values that can't change: strings, numbers and tuples work, while a list as a key raises `TypeError: unhashable type`. To merge one dict into another, use `update`: `settings.update(changes)`; `settings | changes` builds a new, merged dict instead.",
  ],
  sandboxCode: "ages = {\"Ana\": 30, \"Ben\": 25}\nages[\"Cleo\"] = 41\nages[\"Ben\"] = 26\nprint(ages)\nprint(ages.get(\"Dan\", \"unknown\"))\nfor name, age in ages.items():\n    print(f\"{name} is {age}\")",
  sandboxSnippets: [
    snippet("Look up and change", "prices = {\"tea\": 2.5, \"cake\": 3.75}\nprices[\"tea\"] = 2.8\nprices[\"jam\"] = 4.0\nprint(prices[\"tea\"], prices)"),
    snippet("A missing key", "prices = {\"tea\": 2.5}\nprint(prices.get(\"milk\", 0))\nprint(prices[\"milk\"])"),
    snippet("Counting with get", "counts = {}\nfor letter in \"banana\":\n    counts[letter] = counts.get(letter, 0) + 1\nprint(counts)"),
    snippet("keys, values and items", "ages = {\"Ana\": 30, \"Ben\": 25}\nprint(list(ages.keys()), list(ages.values()))\nfor name, age in ages.items():\n    print(name, age)"),
    snippet("Merging", "settings = {\"theme\": \"light\", \"size\": 14}\nsettings.update({\"theme\": \"dark\"})\nprint(settings)\nprint(settings | {\"size\": 16})"),
  ],
  readMore: { label: "Python tutorial: dictionaries", url: "https://docs.python.org/3/tutorial/datastructures.html#dictionaries", source: "Python docs" },
  challenges: [
    task("easy", "Capitals", {
      prompt: "Create a dict `capitals` that maps `France` to `Paris`, `Japan` to `Tokyo` and `Kenya` to `Nairobi`.",
      hint: "Curly braces, with `key: value` pairs separated by commas: `{\"France\": \"Paris\", ...}`.",
      solution: "capitals = {\"France\": \"Paris\", \"Japan\": \"Tokyo\", \"Kenya\": \"Nairobi\"}",
      tests: [
        ["capitals is right", "capitals == {\"France\": \"Paris\", \"Japan\": \"Tokyo\", \"Kenya\": \"Nairobi\"}"],
      ],
    }),
    task("easy", "Look it up", {
      prompt: "Set `price` to the price of `tea`.",
      starter: "prices = {\"coffee\": 3.2, \"tea\": 2.5, \"cake\": 3.75}\n",
      hint: "Use the key in square brackets: `prices[\"tea\"]`.",
      solution: "prices = {\"coffee\": 3.2, \"tea\": 2.5, \"cake\": 3.75}\nprice = prices[\"tea\"]",
      tests: [
        ["price is 2.5", "price == 2.5"],
      ],
    }),
    task("easy", "Add and change", {
      prompt: "Add `Cleo` with age 41, and change `Ben`'s age to 26.",
      starter: "ages = {\"Ana\": 30, \"Ben\": 25}\n",
      hint: "Assigning to a key adds it or replaces its value: `ages[\"Cleo\"] = 41`.",
      solution: "ages = {\"Ana\": 30, \"Ben\": 25}\nages[\"Cleo\"] = 41\nages[\"Ben\"] = 26",
      tests: [
        ["ages is right", "ages == {\"Ana\": 30, \"Ben\": 26, \"Cleo\": 41}"],
      ],
    }),
    task("medium", "A safe lookup", {
      prompt: "Set `kiwis` to the number of kiwis in `stock`, or 0 if there are none listed, without a `KeyError`.",
      starter: "stock = {\"apple\": 12, \"pear\": 4}\n",
      hint: "`stock.get(\"kiwi\", 0)` returns 0 when the key is missing.",
      solution: "stock = {\"apple\": 12, \"pear\": 4}\nkiwis = stock.get(\"kiwi\", 0)",
      tests: [
        ["kiwis is 0", "kiwis == 0"],
      ],
    }),
    task("medium", "Take it out", {
      prompt: "Remove the `temp` key from `settings`, storing its value in `removed`.",
      starter: "settings = {\"theme\": \"dark\", \"temp\": \"x1\", \"size\": 14}\n",
      hint: "`pop` removes a key and returns its value: `removed = settings.pop(\"temp\")`.",
      solution: "settings = {\"theme\": \"dark\", \"temp\": \"x1\", \"size\": 14}\nremoved = settings.pop(\"temp\")",
      tests: [
        ["removed is x1", "removed == \"x1\""],
        ["settings has no temp", "settings == {\"theme\": \"dark\", \"size\": 14}"],
      ],
    }),
    task("medium", "The menu", {
      prompt: "Print one line per item, like `coffee: $3.20`, with two decimals.",
      starter: "prices = {\"coffee\": 3.2, \"tea\": 2.5, \"cake\": 3.75}\n",
      hint: "`for item, price in prices.items():` and `f\"{item}: ${price:.2f}\"`.",
      solution: "prices = {\"coffee\": 3.2, \"tea\": 2.5, \"cake\": 3.75}\nfor item, price in prices.items():\n    print(f\"{item}: ${price:.2f}\")",
      tests: [
        ["Prints the menu", "_cq_stdout.strip().splitlines() == [\"coffee: $3.20\", \"tea: $2.50\", \"cake: $3.75\"]"],
      ],
    }),
    task("hard", "Count the words", {
      prompt: "Build `counts`: how often each word appears in `text`.",
      starter: "text = \"red blue red green blue red\"\n",
      hint: "Start with `counts = {}`. For each word: `counts[word] = counts.get(word, 0) + 1`.",
      solution: "text = \"red blue red green blue red\"\ncounts = {}\nfor word in text.split():\n    counts[word] = counts.get(word, 0) + 1",
      tests: [
        ["counts is right", "counts == {\"red\": 3, \"blue\": 2, \"green\": 1}"],
      ],
    }),
    task("hard", "Fix the KeyError", {
      prompt: "Dan has no score yet, so this crashes. Fix it so it prints `Dan: no score` (and still prints the score for a name that has one).",
      starter: "scores = {\"Ana\": 91, \"Ben\": 78}\nname = \"Dan\"\nprint(f\"{name}: {scores[name]}\")\n",
      hint: "Replace `scores[name]` with `scores.get(name, \"no score\")`.",
      solution: "scores = {\"Ana\": 91, \"Ben\": 78}\nname = \"Dan\"\nprint(f\"{name}: {scores.get(name, 'no score')}\")",
      tests: [
        ["Prints Dan: no score", "_cq_stdout.strip() == \"Dan: no score\""],
      ],
    }),
    task("expert", "Turn it around", {
      prompt: "Build `code_for`: `codes` the other way round, mapping each country name to its code.",
      starter: "codes = {\"NO\": \"Norway\", \"JP\": \"Japan\", \"KE\": \"Kenya\"}\n",
      hint: "Start with an empty dict. In `for code, country in codes.items():` set `code_for[country] = code`.",
      solution: "codes = {\"NO\": \"Norway\", \"JP\": \"Japan\", \"KE\": \"Kenya\"}\ncode_for = {}\nfor code, country in codes.items():\n    code_for[country] = code",
      tests: [
        ["code_for is right", "code_for == {\"Norway\": \"NO\", \"Japan\": \"JP\", \"Kenya\": \"KE\"}"],
      ],
    }),
    task("expert", "The bill", {
      prompt: "Set `total` to the cost of `order` (item to quantity) using `prices`, then print `Total: $20.75`.",
      starter: "prices = {\"tea\": 2.5, \"cake\": 3.75, \"jam\": 4.0}\norder = {\"tea\": 2, \"cake\": 1, \"jam\": 3}\n",
      hint: "Loop over `order.items()`; add `prices[item] * qty` to a total that starts at 0.",
      solution: "prices = {\"tea\": 2.5, \"cake\": 3.75, \"jam\": 4.0}\norder = {\"tea\": 2, \"cake\": 1, \"jam\": 3}\ntotal = 0\nfor item, qty in order.items():\n    total += prices[item] * qty\nprint(f\"Total: ${total:.2f}\")",
      tests: [
        ["total is 20.75", "total == 20.75"],
        ["Prints the total", "_cq_stdout.strip().splitlines()[-1] == \"Total: $20.75\""],
      ],
    }),
  ],
  questions: [
    mc("What does a dictionary map?", ["Positions to values", "Keys to values", "Values to positions", "Lists to lists"], 1),
    mc("What does `ages[\"Dan\"]` do when there is no key `\"Dan\"`?", ["Returns `None`", "Returns 0", "Adds Dan", "Raises a `KeyError`"], 3),
    mc("What is `{\"a\": 1}.get(\"b\", 0)`?", ["`0`", "`None`", "`1`", "A `KeyError`"], 0),
    mc("What does `ages[\"Ben\"] = 26` do if Ben is already a key?", ["Raises an error", "Adds a second Ben", "Replaces Ben's value", "Nothing"], 2),
    qShort("Which method returns a value, or a default when the key is missing? (name only)", "get"),
    mc("For a dictionary `ages`, what does `\"Ana\" in ages` check?", ["Whether Ana is one of the values", "Whether Ana is one of the keys", "Whether the dict is empty", "Whether Ana is the first key"], 1),
    mc("Which loop gives you both keys and values?", ["`for k in d:`", "`for k, v in d:`", "`for v in d.values():`", "`for k, v in d.items():`"], 3),
    mc("Why can't a list be a dictionary key?", ["Lists can change, so they can't be keys", "Lists are too long", "Keys must be strings", "It can"], 0),
    mc("After `counts = {}` and `counts[\"x\"] = counts.get(\"x\", 0) + 1` twice, what is `counts`?", ["`{\"x\": 1}`", "`{\"x\": 0}`", "`{\"x\": 2}`", "An error"], 2),
    mc("For a dictionary `d`, what does `d.pop(\"k\")` return?", ["The whole dict", "The value of `\"k\"`", "`None`", "The key `\"k\"`"], 1),
  ],
})
