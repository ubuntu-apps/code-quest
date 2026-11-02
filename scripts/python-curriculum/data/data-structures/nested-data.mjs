// Data structures topic: Nested data. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "nested_structures",
  title: "Nested data",
  paragraphs: [
    "Collections can hold other collections, and real data usually does. A **list of dicts** is a table of records, one dict per row. A **dict of lists** groups things under a name. A **list of lists** is a grid. The data you'll get from files and web APIs later in the course looks just like this.",
    "```\npeople = [\n    {\"name\": \"Ana\", \"age\": 30},\n    {\"name\": \"Ben\", \"age\": 25},\n]\nprint(people[1][\"name\"])   # Ben\n```",
    "Read chained brackets from left to right; each one goes a level deeper. `people[1]` is the second dict, and `people[1][\"name\"]` is the name in it. To go through every record, loop over the list and use the keys on each dict: `for person in people: print(person[\"name\"])`.",
    "In a dict of lists, `groups[\"fruit\"]` is an ordinary list, so you can `append` to it. A new key needs its empty list first, which is a common pattern when grouping things:",
    "```\ngroups = {}\nfor word in [\"apple\", \"bean\", \"avocado\", \"beet\", \"cherry\"]:\n    letter = word[0]\n    if letter not in groups:\n        groups[letter] = []\n    groups[letter].append(word)\nprint(groups)   # {'a': ['apple', 'avocado'], 'b': ['bean', 'beet'], 'c': ['cherry']}\n```",
    "In a grid, `grid[row][col]` picks one cell: first the row (a list), then the item in it. There's a trap when you make one: `[[0] * 3] * 3` repeats the **same** inner list three times, so changing one row changes them all. Build each row separately with a comprehension instead.",
    "```\nbad = [[0] * 3] * 3\nbad[0][0] = 1\nprint(bad)    # [[1, 0, 0], [1, 0, 0], [1, 0, 0]]\ngood = [[0] * 3 for _ in range(3)]\ngood[0][0] = 1\nprint(good)   # [[1, 0, 0], [0, 0, 0], [0, 0, 0]]\n```",
    "The same thing catches people out with copies. `copy()` makes a **shallow** copy: a new outer list or dict, but the inner lists are shared, so changing one of them shows up in both. For a fully independent copy, use `copy.deepcopy()` from the `copy` module (`import copy` first).",
    "Nested data stays easy to work with when it has a consistent shape: every record has the same keys, and every row of a grid the same length. When a key is optional, use `get` so a missing one doesn't stop the program.",
  ],
  sandboxCode: "people = [\n    {\"name\": \"Ana\", \"age\": 30, \"pets\": [\"cat\"]},\n    {\"name\": \"Ben\", \"age\": 25, \"pets\": []},\n    {\"name\": \"Cleo\", \"age\": 41, \"pets\": [\"dog\", \"fish\"]},\n]\nfor person in people:\n    print(f\"{person['name']} ({person['age']}) has {len(person['pets'])} pets\")\n\ngrid = [[1, 2, 3], [4, 5, 6]]\nprint(grid[1][2], [row[0] for row in grid])",
  sandboxSnippets: [
    snippet("A list of dicts", "books = [\n    {\"title\": \"Dune\", \"year\": 1965},\n    {\"title\": \"Emma\", \"year\": 1815},\n]\nfor book in books:\n    print(book[\"title\"], book[\"year\"])"),
    snippet("A dict of lists", "menu = {\"drinks\": [\"tea\", \"coffee\"], \"food\": [\"cake\"]}\nmenu[\"food\"].append(\"soup\")\nprint(menu[\"food\"], len(menu[\"drinks\"]))"),
    snippet("A grid", "grid = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]\nprint(grid[0][2], grid[2][0])\nfor row in grid:\n    print(row)"),
    snippet("The repeated-row trap", "bad = [[\".\"] * 3] * 3\nbad[1][1] = \"X\"\nprint(bad)"),
    snippet("Shallow and deep copies", "import copy\n\ndata = {\"tags\": [\"a\", \"b\"]}\nshallow = data.copy()\ndeep = copy.deepcopy(data)\ndata[\"tags\"].append(\"c\")\nprint(shallow, deep)"),
  ],
  readMore: { label: "Python docs: shallow and deep copy", url: "https://docs.python.org/3/library/copy.html", source: "Python docs" },
  challenges: [
    task("easy", "Dig in", {
      prompt: "Set `name` to the name of the second person in `people`.",
      starter: "people = [{\"name\": \"Ana\", \"age\": 30}, {\"name\": \"Ben\", \"age\": 25}]\n",
      hint: "First the position in the list, then the key: `people[1][\"name\"]`.",
      solution: "people = [{\"name\": \"Ana\", \"age\": 30}, {\"name\": \"Ben\", \"age\": 25}]\nname = people[1][\"name\"]",
      tests: [
        ["name is Ben", "name == \"Ben\""],
      ],
    }),
    task("easy", "The centre square", {
      prompt: "Set `centre` to the middle cell of the 3 by 3 `grid`.",
      starter: "grid = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]\n",
      hint: "Row first, then column, both index 1: `grid[1][1]`.",
      solution: "grid = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]\ncentre = grid[1][1]",
      tests: [
        ["centre is 5", "centre == 5"],
      ],
    }),
    task("easy", "Add to a group", {
      prompt: "Add `plum` to the fruit list in `groups`.",
      starter: "groups = {\"fruit\": [\"apple\", \"pear\"], \"veg\": [\"leek\"]}\n",
      hint: "`groups[\"fruit\"]` is a list, so `append` to it.",
      solution: "groups = {\"fruit\": [\"apple\", \"pear\"], \"veg\": [\"leek\"]}\ngroups[\"fruit\"].append(\"plum\")",
      tests: [
        ["groups is right", "groups == {\"fruit\": [\"apple\", \"pear\", \"plum\"], \"veg\": [\"leek\"]}"],
      ],
    }),
    task("medium", "List the people", {
      prompt: "Print one line per person, like `Ana (30)`.",
      starter: "people = [{\"name\": \"Ana\", \"age\": 30}, {\"name\": \"Ben\", \"age\": 25}, {\"name\": \"Cleo\", \"age\": 41}]\n",
      hint: "Loop over the list; in an f-string, use single quotes for the keys: `f\"{person['name']} ({person['age']})\"`.",
      solution: "people = [{\"name\": \"Ana\", \"age\": 30}, {\"name\": \"Ben\", \"age\": 25}, {\"name\": \"Cleo\", \"age\": 41}]\nfor person in people:\n    name = person[\"name\"]\n    age = person[\"age\"]\n    print(f\"{name} ({age})\")",
      tests: [
        ["Prints the people", "_cq_stdout.strip().splitlines() == [\"Ana (30)\", \"Ben (25)\", \"Cleo (41)\"]"],
      ],
    }),
    task("medium", "Cart total", {
      prompt: "Set `total` to the cost of everything in `cart`: each item's price times its quantity, added up.",
      starter: "cart = [\n    {\"item\": \"tea\", \"price\": 2.5, \"qty\": 2},\n    {\"item\": \"cake\", \"price\": 3.75, \"qty\": 1},\n    {\"item\": \"jam\", \"price\": 4.0, \"qty\": 3},\n]\n",
      hint: "Start at 0 and, for each `line` in `cart`, add `line[\"price\"] * line[\"qty\"]`.",
      solution: "cart = [\n    {\"item\": \"tea\", \"price\": 2.5, \"qty\": 2},\n    {\"item\": \"cake\", \"price\": 3.75, \"qty\": 1},\n    {\"item\": \"jam\", \"price\": 4.0, \"qty\": 3},\n]\ntotal = 0\nfor line in cart:\n    total += line[\"price\"] * line[\"qty\"]",
      tests: [
        ["total is 20.75", "total == 20.75"],
      ],
    }),
    task("medium", "A column", {
      prompt: "Set `middle_column` to the middle number of each row of `grid`, as a list.",
      starter: "grid = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]\n",
      hint: "Take item 1 of every row: `[row[1] for row in grid]`.",
      solution: "grid = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]\nmiddle_column = [row[1] for row in grid]",
      tests: [
        ["middle_column is right", "middle_column == [2, 5, 8]"],
      ],
    }),
    task("hard", "Group by length", {
      prompt: "Build `by_length`: a dict mapping each word length to a list of the words with that length, in order.",
      starter: "words = [\"tea\", \"cake\", \"jam\", \"soup\", \"biscuit\"]\n",
      hint: "For each word, `n = len(word)`. If `n` isn't a key yet, set `by_length[n] = []`; then append the word.",
      solution: "words = [\"tea\", \"cake\", \"jam\", \"soup\", \"biscuit\"]\nby_length = {}\nfor word in words:\n    n = len(word)\n    if n not in by_length:\n        by_length[n] = []\n    by_length[n].append(word)",
      tests: [
        ["by_length is right", "by_length == {3: [\"tea\", \"jam\"], 4: [\"cake\", \"soup\"], 7: [\"biscuit\"]}"],
      ],
    }),
    task("hard", "Fix the board", {
      prompt: "Putting an `X` in the top-left corner puts one at the start of every row. Fix how `board` is made, so only one `X` appears.",
      starter: "board = [[\".\"] * 3] * 3\nboard[0][0] = \"X\"\n",
      hint: "Build each row separately: `board = [[\".\"] * 3 for _ in range(3)]`.",
      solution: "board = [[\".\"] * 3 for _ in range(3)]\nboard[0][0] = \"X\"",
      tests: [
        ["Only the corner is X", "board == [[\"X\", \".\", \".\"], [\".\", \".\", \".\"], [\".\", \".\", \".\"]]"],
      ],
    }),
    task("expert", "A deep copy", {
      prompt: "Adding a colour to `settings` changes `backup` too, because `copy()` shares the inner list. Fix it with a deep copy.",
      starter: "settings = {\"colours\": [\"red\", \"blue\"], \"size\": 12}\nbackup = settings.copy()\nsettings[\"colours\"].append(\"green\")\n",
      hint: "Add `import copy` at the top and make `backup = copy.deepcopy(settings)`.",
      solution: "import copy\n\nsettings = {\"colours\": [\"red\", \"blue\"], \"size\": 12}\nbackup = copy.deepcopy(settings)\nsettings[\"colours\"].append(\"green\")",
      tests: [
        ["settings has green", "settings[\"colours\"] == [\"red\", \"blue\", \"green\"]"],
        ["backup does not", "backup == {\"colours\": [\"red\", \"blue\"], \"size\": 12}"],
      ],
    }),
    task("expert", "Average marks", {
      prompt: "Set `averages` to a dict mapping each student to the average of their marks, rounded to 1 decimal.",
      starter: "marks = {\"Ana\": [90, 85, 77], \"Ben\": [62, 70], \"Cleo\": [88, 91, 95, 80]}\n",
      hint: "A dict comprehension over `marks.items()`, with `round(sum(m) / len(m), 1)` as the value.",
      solution: "marks = {\"Ana\": [90, 85, 77], \"Ben\": [62, 70], \"Cleo\": [88, 91, 95, 80]}\naverages = {name: round(sum(m) / len(m), 1) for name, m in marks.items()}",
      tests: [
        ["averages is right", "averages == {\"Ana\": 84.0, \"Ben\": 66.0, \"Cleo\": 88.5}"],
      ],
    }),
  ],
  questions: [
    mc("For `people = [{\"name\": \"Ana\"}, {\"name\": \"Ben\"}]`, what is `people[0][\"name\"]`?", ["`\"Ben\"`", "`\"Ana\"`", "`{\"name\": \"Ana\"}`", "An error"], 1, "`people[0]` is the first dict, then `[\"name\"]` reads its value."),
    mc("What is `grid[2][0]` for `grid = [[1, 2], [3, 4], [5, 6]]`?", ["`5`", "`2`", "`3`", "`6`"], 0, "`grid[2]` is the row `[5, 6]`, and `[0]` is its first item."),
    mc("What does `[[0] * 3] * 3` get wrong?", ["It makes a 3 by 9 grid", "It raises an error", "All three rows are the same list", "Nothing"], 2, "Multiplying the outer list repeats a reference to the same inner list, so changing one row changes them all."),
    mc("What does a shallow `copy()` share with the original?", ["Nothing", "The keys only", "Its length", "The inner lists and dicts"], 3, "A shallow copy makes a new outer container but shares the objects inside it."),
    qShort("Which module has `deepcopy`? (name only)", "copy", "`copy.deepcopy` copies the nested objects too, all the way down."),
    mc("Which shape suits \"a table of records\"?", ["A set of strings", "A list of dicts", "A single dict", "A tuple of numbers"], 1, "Each record is a dict of fields, and the list keeps the records in order."),
    mc("`groups` is a dict of lists. Before appending to `groups[key]` for a new key, what do you need?", ["`groups[key] = []`", "`groups.append(key)`", "`del groups[key]`", "Nothing"], 0, "`groups[key]` must hold a list before you can append to it; `setdefault` or `defaultdict` can do this for you."),
    mc("How do you read `data[\"users\"][0][\"email\"]`?", ["From right to left", "All at once", "Left to right, one level deeper at each bracket", "It is a syntax error"], 2, "Each bracket goes one level deeper into the data, from left to right."),
    mc("Which builds a 2 by 2 grid of zeros safely?", ["`[[0, 0]] * 2`", "`[0, 0] * 2`", "`[[0] * 2] * 2`", "`[[0] * 2 for _ in range(2)]`"], 3, "The comprehension makes a new row each time, so the rows are separate lists."),
    mc("Why use `get` on records with optional keys?", ["It is faster", "So a missing key doesn't stop the program", "It sorts the keys", "It copies the dict"], 1, "`get` returns `None` (or your default) instead of raising a `KeyError` for a missing field."),
  ],
})
