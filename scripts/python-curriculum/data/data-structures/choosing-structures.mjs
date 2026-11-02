// Data structures topic: Choosing a data structure. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "choosing_structures",
  title: "Choosing a data structure",
  paragraphs: [
    "You now know Python's four built-in collections. Choosing the right one makes code shorter, clearer and often much faster, so here they are side by side:",
    "```\nlist   [3, 1, 3]      ordered, changeable, duplicates allowed, found by position\ntuple  (3, 1)         ordered, fixed once made\ndict   {\"Ana\": 30}    keys mapped to values, keys unique, found by key\nset    {3, 1}         unique items, no order, very fast \"in\"\n```",
    "Ask a few questions about your data. **Do you look things up by a name or an ID?** Use a dict. **Does the order matter, or do you need positions?** Use a list. **Must every item be unique, or do you keep asking \"is this in there?\"** Use a set. **Is it a small, fixed group of values that belong together**, such as a coordinate or a date? Use a tuple (or a `namedtuple`).",
    "Speed is often the deciding factor. `x in some_list` looks at the items one by one, which gets slow for long lists checked many times; `x in some_set` and `key in some_dict` are answered instantly. If you find yourself searching a list of records for a name over and over, build a dict keyed by name once and look the name up directly.",
    "```\npeople = [(\"Ana\", 30), (\"Ben\", 25), (\"Cleo\", 41)]\nage_of = dict(people)        # build the lookup once\nprint(age_of[\"Cleo\"])        # 41, no searching needed\nbanned = set([\"spam1\", \"bot7\"])\nprint(\"bot7\" in banned)      # True, instantly\n```",
    "Real programs **combine** them: a list of dicts for records, a dict of lists to group things, a dict of sets for tags, a Counter for counts. Because tuples can't change, they can be dict keys, which makes a dict with `(row, col)` keys a handy grid where only the filled squares are stored.",
    "```\nboard = {}\nboard[(0, 0)] = \"X\"\nboard[(1, 2)] = \"O\"\nprint(board.get((1, 2), \".\"), board.get((2, 2), \".\"))   # O .\n```",
    "Converting is cheap when your needs change: `set(lst)` drops duplicates, `sorted(s)` turns a set back into an ordered list, `dict(zip(keys, values))` pairs two lists up, and `list(d.items())` turns a dict into a list of pairs.",
    "Start with the simplest structure that does the job, and change it when the job changes. A list is a fine default; reach for a dict when you look things up, a set when you need uniqueness or fast `in`, and the `collections` module when a container fits the task exactly.",
  ],
  sandboxCode: "people = [(\"Ana\", 30), (\"Ben\", 25), (\"Cleo\", 41)]\nage_of = dict(people)\nprint(age_of[\"Cleo\"])\n\nvisits = [\"home\", \"shop\", \"home\", \"park\"]\nprint(len(visits), len(set(visits)), sorted(set(visits)))\n\nboard = {(0, 0): \"X\", (1, 2): \"O\"}\nfor row in range(3):\n    print(\"\".join(board.get((row, col), \".\") for col in range(3)))",
  sandboxSnippets: [
    snippet("Lookup: list or dict?", "prices_list = [(\"tea\", 2.5), (\"cake\", 3.75)]\nfor name, price in prices_list:\n    if name == \"cake\":\n        print(price)\n\nprices = dict(prices_list)\nprint(prices[\"cake\"])"),
    snippet("Unique: list or set?", "tags = [\"python\", \"data\", \"python\", \"web\"]\nprint(tags)\nprint(set(tags))"),
    snippet("Tuple keys", "seats = {(\"A\", 1): \"Ana\", (\"B\", 4): \"Ben\"}\nprint(seats[(\"B\", 4)], seats.get((\"C\", 2), \"empty\"))"),
    snippet("A dict of sets", "likes = {\"Ana\": {\"tea\"}, \"Ben\": set()}\nlikes[\"Ana\"].add(\"cake\")\nlikes[\"Ana\"].add(\"tea\")\nprint(likes)"),
    snippet("Converting", "d = {\"a\": 1, \"b\": 2}\nprint(list(d.items()), list(d), set(d.values()))"),
  ],
  readMore: { label: "Python tutorial: data structures", url: "https://docs.python.org/3/tutorial/datastructures.html", source: "Python docs" },
  challenges: [
    task("easy", "A price lookup", {
      prompt: "Turn the list of pairs into a dict `prices`, then set `cake` to the price of cake by looking it up.",
      starter: "pairs = [(\"tea\", 2.5), (\"cake\", 3.75), (\"jam\", 4.0)]\n",
      hint: "`dict(pairs)` turns `(key, value)` pairs into a dict. Then `prices[\"cake\"]`.",
      solution: "pairs = [(\"tea\", 2.5), (\"cake\", 3.75), (\"jam\", 4.0)]\nprices = dict(pairs)\ncake = prices[\"cake\"]",
      tests: [
        ["prices is a dict", "prices == {\"tea\": 2.5, \"cake\": 3.75, \"jam\": 4.0}"],
        ["cake is 3.75", "cake == 3.75"],
      ],
    }),
    task("easy", "Unique tags", {
      prompt: "Tags should be unique. Set `tag_set` to the tags as a set.",
      starter: "tags = [\"python\", \"data\", \"python\", \"web\", \"data\"]\n",
      hint: "`set(tags)`.",
      solution: "tags = [\"python\", \"data\", \"python\", \"web\", \"data\"]\ntag_set = set(tags)",
      tests: [
        ["tag_set is right", "tag_set == {\"python\", \"data\", \"web\"}"],
      ],
    }),
    task("easy", "Fixed for good", {
      prompt: "The origin of a map should never change. Set `origin` to `coords` as a tuple.",
      starter: "coords = [0, 0]\n",
      hint: "`tuple(coords)`.",
      solution: "coords = [0, 0]\norigin = tuple(coords)",
      tests: [
        ["origin is the tuple (0, 0)", "origin == (0, 0) and isinstance(origin, tuple)"],
      ],
    }),
    task("medium", "Banned users", {
      prompt: "Make `banned_set` from `banned` for fast lookups, then set `allowed` to the users who aren't banned, in their original order.",
      starter: "banned = [\"bot7\", \"spam1\"]\nusers = [\"ana\", \"bot7\", \"ben\", \"spam1\", \"cleo\"]\n",
      hint: "`banned_set = set(banned)`, then `[u for u in users if u not in banned_set]`.",
      solution: "banned = [\"bot7\", \"spam1\"]\nusers = [\"ana\", \"bot7\", \"ben\", \"spam1\", \"cleo\"]\nbanned_set = set(banned)\nallowed = [u for u in users if u not in banned_set]",
      tests: [
        ["banned_set is a set", "banned_set == {\"bot7\", \"spam1\"}"],
        ["allowed is right", "allowed == [\"ana\", \"ben\", \"cleo\"]"],
      ],
    }),
    task("medium", "A sparse board", {
      prompt: "Use `board` as a grid with `(row, col)` keys: put `X` at row 0, column 0 and `O` at row 1, column 2.",
      starter: "board = {}\n",
      hint: "Tuples can be keys: `board[(0, 0)] = \"X\"`.",
      solution: "board = {}\nboard[(0, 0)] = \"X\"\nboard[(1, 2)] = \"O\"",
      tests: [
        ["board is right", "board == {(0, 0): \"X\", (1, 2): \"O\"}"],
      ],
    }),
    task("medium", "Tags per post", {
      prompt: "Each post has a set of tags. Add `python` to post 2 and `news` to post 1. (Post 2 already has `python`; a set keeps just one.)",
      starter: "posts = {1: {\"web\"}, 2: {\"python\", \"data\"}}\n",
      hint: "`posts[2]` is a set, so use `add`: `posts[2].add(\"python\")`.",
      solution: "posts = {1: {\"web\"}, 2: {\"python\", \"data\"}}\nposts[2].add(\"python\")\nposts[1].add(\"news\")",
      tests: [
        ["posts is right", "posts == {1: {\"web\", \"news\"}, 2: {\"python\", \"data\"}}"],
      ],
    }),
    task("hard", "Find by name", {
      prompt: "Build `by_name`, a dict mapping each person's name to their record, then set `cleo_age` by looking Cleo up in it.",
      starter: "people = [\n    {\"name\": \"Ana\", \"age\": 30},\n    {\"name\": \"Ben\", \"age\": 25},\n    {\"name\": \"Cleo\", \"age\": 41},\n]\n",
      hint: "`by_name = {p[\"name\"]: p for p in people}`, then `by_name[\"Cleo\"][\"age\"]`.",
      solution: "people = [\n    {\"name\": \"Ana\", \"age\": 30},\n    {\"name\": \"Ben\", \"age\": 25},\n    {\"name\": \"Cleo\", \"age\": 41},\n]\nby_name = {p[\"name\"]: p for p in people}\ncleo_age = by_name[\"Cleo\"][\"age\"]",
      tests: [
        ["by_name has every name", "sorted(by_name) == [\"Ana\", \"Ben\", \"Cleo\"]"],
        ["cleo_age is 41", "cleo_age == 41"],
      ],
    }),
    task("hard", "Returning visitors", {
      prompt: "Set `returning` to how many logins were by someone who had logged in before. Keep the names seen so far in a set.",
      starter: "logins = [\"ana\", \"ben\", \"ana\", \"cleo\", \"ben\", \"ana\"]\n",
      hint: "Start with `seen = set()` and `returning = 0`. For each name: if it's `in seen`, add 1; then `seen.add(name)`.",
      solution: "logins = [\"ana\", \"ben\", \"ana\", \"cleo\", \"ben\", \"ana\"]\nseen = set()\nreturning = 0\nfor name in logins:\n    if name in seen:\n        returning += 1\n    seen.add(name)",
      tests: [
        ["returning is 3", "returning == 3"],
      ],
    }),
    task("expert", "Low stock", {
      prompt: "Deliveries arrive as `(item, qty)` pairs, and items repeat. Add them up into a dict `totals`, then set `low` to a sorted list of the items with fewer than 5.",
      starter: "deliveries = [(\"tea\", 3), (\"jam\", 6), (\"tea\", 1), (\"cake\", 2), (\"jam\", 1), (\"cake\", 4)]\n",
      hint: "Total with `totals[item] = totals.get(item, 0) + qty`. Then `sorted(item for item, n in totals.items() if n < 5)`.",
      solution: "deliveries = [(\"tea\", 3), (\"jam\", 6), (\"tea\", 1), (\"cake\", 2), (\"jam\", 1), (\"cake\", 4)]\ntotals = {}\nfor item, qty in deliveries:\n    totals[item] = totals.get(item, 0) + qty\nlow = sorted(item for item, n in totals.items() if n < 5)",
      tests: [
        ["totals is right", "totals == {\"tea\": 4, \"jam\": 7, \"cake\": 6}"],
        ["low is right", "low == [\"tea\"]"],
      ],
    }),
    task("expert", "Anagram groups", {
      prompt: "Words with the same letters are anagrams. Build `groups`: a dict mapping each word's sorted letters (as text, like `\"act\"`) to the list of words with those letters.",
      starter: "words = [\"listen\", \"silent\", \"cat\", \"enlist\", \"act\", \"dog\"]\n",
      hint: "The key for a word is `\"\".join(sorted(word))`. Group like before: add an empty list for a new key, then append.",
      solution: "words = [\"listen\", \"silent\", \"cat\", \"enlist\", \"act\", \"dog\"]\ngroups = {}\nfor word in words:\n    key = \"\".join(sorted(word))\n    if key not in groups:\n        groups[key] = []\n    groups[key].append(word)",
      tests: [
        ["groups is right", "groups == {\"eilnst\": [\"listen\", \"silent\", \"enlist\"], \"act\": [\"cat\", \"act\"], \"dgo\": [\"dog\"]}"],
      ],
    }),
  ],
  questions: [
    mc("You look up phone numbers by name. Which structure fits?", ["A list", "A dict", "A set", "A tuple"], 1, "A dict finds a value from its key (the name) straight away."),
    mc("You need the days of the week in order and never change them. Which fits best?", ["A tuple", "A set", "A dict", "A Counter"], 0, "A tuple keeps its order and can't be changed by accident."),
    mc("You keep checking whether a username is already taken. Which is fastest for that?", ["A list", "A tuple", "A string", "A set"], 3, "Membership tests on a set take about the same time however many names there are."),
    mc("Why can `(row, col)` be a dict key but `[row, col]` can't?", ["Tuples are shorter", "Lists can't hold numbers", "Tuples can't change; lists can", "Dicts only accept tuples"], 2, "Only hashable, unchangeable values can be keys, and a tuple is unchangeable."),
    qShort("Which built-in turns a list into its unique items? (name only)", "set", "`set()` keeps one copy of each item (wrap it in `sorted` if you need order)."),
    mc("A to-do list where order matters and you add and remove items. Which fits?", ["A list", "A tuple", "A set", "A frozen set"], 0, "A list keeps items in order and lets you add and remove them."),
    mc("What is wrong with searching a list of records for a name thousands of times?", ["Nothing", "Lists can't hold records", "It raises an error", "Each search checks the items one by one, which is slow"], 3, "A list search checks items one at a time; a dict keyed by name finds a record directly."),
    mc("How do you count how often each word appears?", ["A set", "A tuple", "A dict or a `Counter`", "A sorted list"], 2, "A dict maps each word to its count, and `Counter` does exactly that."),
    mc("Which is the best starting point when no special needs apply?", ["A list", "A `deque`", "A `ChainMap`", "A dict of sets"], 0, "A list is the simplest general collection; reach for others when a need appears."),
  ],
})
