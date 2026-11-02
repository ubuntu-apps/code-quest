// Data structures topic: Tuples and unpacking. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "tuples",
  title: "Tuples and unpacking",
  paragraphs: [
    "A **tuple** is like a list that can't be changed. Write it with round brackets: `point = (3, 4)`. Indexing, slicing, `len()` and `in` all work as they do for lists, but there's no `append`, no `remove` and no `point[0] = 5`: that raises a `TypeError`. Tuples have just two methods, `count()` and `index()`.",
    "```\npoint = (3, 4)\nprint(point[0], point[-1], len(point))   # 3 4 2\ncolour = (255, 165, 0)\nprint(255 in colour)                     # True\n```",
    "Why have a list you can't change? A tuple suits a **fixed group of values that belong together**: a coordinate, a colour, a date, a name with its score. Nobody can accidentally add a fourth number to a colour. And because they can't change, tuples can be used where lists can't, such as dictionary keys, which you'll meet next.",
    "The brackets are often optional: `point = 3, 4` makes a tuple too. A tuple with one item needs a comma, `(5,)`, because `(5)` is just the number 5 in brackets. `()` is the empty tuple. `tuple(lst)` and `list(tup)` convert between the two.",
    "**Unpacking** takes a tuple (or a list) apart into names, in one line: `x, y = point` sets `x` to 3 and `y` to 4. The number of names has to match the number of items, or you get a `ValueError`. You've already used this: `a, b = b, a` packs `b, a` into a tuple and unpacks it straight away.",
    "A name with a star collects \"the rest\" into a list: `first, *rest = [1, 2, 3, 4]` sets `rest` to `[2, 3, 4]`, and `first, *middle, last = ...` works too. Use `_` for values you don't need: `name, _ = (\"Ana\", 91)`.",
    "```\nscores = [99, 87, 85, 70, 64]\nbest, *others = scores\nprint(best, others)          # 99 [87, 85, 70, 64]\nfirst, *_, last = scores\nprint(first, last)           # 99 64\n```",
    "Lists of tuples are everywhere, and a `for` loop can unpack each one as it goes. Functions that give back several values also return a tuple: `divmod(17, 5)` is `(3, 2)`.",
    "```\nresults = [(\"Ana\", 91), (\"Ben\", 78), (\"Cleo\", 85)]\nfor name, score in results:\n    print(f\"{name}: {score}\")\n```",
    "Tuples compare item by item, like words in a dictionary: `(1, 9) < (2, 0)` is `True` because 1 < 2, and only on a tie is the next item compared. So sorting a list of tuples sorts by the first item, then by the second.",
  ],
  sandboxCode: "point = (3, 4)\nx, y = point\nprint(x, y, len(point))\n\nresults = [(\"Ana\", 91), (\"Ben\", 78), (\"Cleo\", 85)]\nfor name, score in results:\n    print(f\"{name}: {score}\")\n\nbest, *others = [99, 87, 85, 70]\nprint(best, others)",
  sandboxSnippets: [
    snippet("A tuple", "colour = (255, 165, 0)\nprint(colour[0], len(colour), 0 in colour)"),
    snippet("Tuples can't change", "colour = (255, 165, 0)\ncolour[0] = 200"),
    snippet("One item needs a comma", "print(type((5)), type((5,)))"),
    snippet("Unpacking", "name, age, city = (\"Ana\", 30, \"Oslo\")\nprint(name, city)\nfirst, *rest = [1, 2, 3, 4]\nprint(first, rest)"),
    snippet("Sorting tuples", "pairs = [(2, \"b\"), (1, \"z\"), (2, \"a\")]\nprint(sorted(pairs))"),
  ],
  readMore: { label: "Python tutorial: tuples and sequences", url: "https://docs.python.org/3/tutorial/datastructures.html#tuples-and-sequences", source: "Python docs" },
  challenges: [
    task("easy", "A colour", {
      prompt: "Create a tuple `orange` holding the numbers 255, 165 and 0.",
      hint: "Round brackets, items separated by commas: `orange = (255, 165, 0)`.",
      solution: "orange = (255, 165, 0)",
      tests: [
        ["orange is the tuple (255, 165, 0)", "orange == (255, 165, 0) and isinstance(orange, tuple)"],
      ],
    }),
    task("easy", "Unpack a point", {
      prompt: "Unpack `point` into `x` and `y`, in one line.",
      starter: "point = (3, 7)\n",
      hint: "Put two names on the left: `x, y = point`.",
      solution: "point = (3, 7)\nx, y = point",
      tests: [
        ["x is 3", "x == 3"],
        ["y is 7", "y == 7"],
      ],
    }),
    task("easy", "Just one", {
      prompt: "Create `single`, a tuple holding just the text `solo`.",
      hint: "A one-item tuple needs a comma: `(\"solo\",)`.",
      solution: "single = (\"solo\",)",
      tests: [
        ["single is a one-item tuple", "single == (\"solo\",)"],
      ],
    }),
    task("medium", "The next day", {
      prompt: "Tuples can't change, so make a new one: set `next_day` to `date` with the day (the last number) one higher.",
      starter: "date = (2026, 10, 17)\n",
      hint: "Unpack it first, `year, month, day = date`, then build `(year, month, day + 1)`.",
      solution: "date = (2026, 10, 17)\nyear, month, day = date\nnext_day = (year, month, day + 1)",
      tests: [
        ["next_day is (2026, 10, 18)", "next_day == (2026, 10, 18)"],
        ["date is unchanged", "date == (2026, 10, 17)"],
      ],
    }),
    task("medium", "Print the results", {
      prompt: "Print one line per result, like `Ana: 91`, unpacking each tuple in the `for` line.",
      starter: "results = [(\"Ana\", 91), (\"Ben\", 78), (\"Cleo\", 85)]\n",
      hint: "`for name, score in results:` and an f-string inside.",
      solution: "results = [(\"Ana\", 91), (\"Ben\", 78), (\"Cleo\", 85)]\nfor name, score in results:\n    print(f\"{name}: {score}\")",
      tests: [
        ["Prints the three lines", "_cq_stdout.strip().splitlines() == [\"Ana: 91\", \"Ben: 78\", \"Cleo: 85\"]"],
      ],
    }),
    task("medium", "The best and the rest", {
      prompt: "In one line, set `best` to the first score and `others` to a list of the rest.",
      starter: "scores = [99, 87, 85, 70, 64]\n",
      hint: "A starred name collects the rest: `best, *others = scores`.",
      solution: "scores = [99, 87, 85, 70, 64]\nbest, *others = scores",
      tests: [
        ["best is 99", "best == 99"],
        ["others is the rest", "others == [87, 85, 70, 64]"],
      ],
    }),
    task("hard", "Start and finish", {
      prompt: "In one line, set `start` to the first stop of `route` and `finish` to the last, ignoring the stops in between.",
      starter: "route = [\"Home\", \"Bakery\", \"Park\", \"Library\", \"School\"]\n",
      hint: "Put a starred `_` in the middle: `start, *_, finish = route`.",
      solution: "route = [\"Home\", \"Bakery\", \"Park\", \"Library\", \"School\"]\nstart, *_, finish = route",
      tests: [
        ["start is Home", "start == \"Home\""],
        ["finish is School", "finish == \"School\""],
      ],
    }),
    task("hard", "Distance between points", {
      prompt: "Set `distance` to the straight-line distance between `p1` and `p2`: the square root of (x2 - x1)² + (y2 - y1)².",
      starter: "p1 = (1, 2)\np2 = (4, 6)\n",
      hint: "Unpack both points, `x1, y1 = p1`, then `((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5`.",
      solution: "p1 = (1, 2)\np2 = (4, 6)\nx1, y1 = p1\nx2, y2 = p2\ndistance = ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5",
      tests: [
        ["distance is 5.0", "distance == 5.0"],
      ],
    }),
    task("expert", "Follow the moves", {
      prompt: "A robot starts at `(0, 0)`. Each move in `moves` is a step `(dx, dy)`. Set `position` to where it ends up, as a tuple.",
      starter: "moves = [(0, 1), (1, 0), (0, 1), (-1, 0), (0, 1)]\n",
      hint: "Keep `x` and `y` in two variables. In `for dx, dy in moves:` add each step, then `position = (x, y)`.",
      solution: "moves = [(0, 1), (1, 0), (0, 1), (-1, 0), (0, 1)]\nx, y = 0, 0\nfor dx, dy in moves:\n    x += dx\n    y += dy\nposition = (x, y)",
      tests: [
        ["position is (0, 3)", "position == (0, 3)"],
      ],
    }),
    task("expert", "Rank by score", {
      prompt: "Set `ranking` to the names in order of score, highest first. Tuples sort by their first item, so build `(score, name)` pairs, sort them, then pick out the names.",
      starter: "results = [(\"Ana\", 91), (\"Ben\", 78), (\"Cleo\", 85)]\n",
      hint: "Loop over `results` appending `(score, name)` to a new list. `sorted(pairs, reverse=True)` puts the best first; a second loop collects the names.",
      solution: "results = [(\"Ana\", 91), (\"Ben\", 78), (\"Cleo\", 85)]\npairs = []\nfor name, score in results:\n    pairs.append((score, name))\nranking = []\nfor score, name in sorted(pairs, reverse=True):\n    ranking.append(name)",
      tests: [
        ["ranking is right", "ranking == [\"Ana\", \"Cleo\", \"Ben\"]"],
      ],
    }),
  ],
  questions: [
    mc("What is the main difference between a tuple and a list?", ["A tuple can't be changed", "A tuple can't be indexed", "A tuple holds only numbers", "There is none"], 0, "Tuples are immutable, which makes them good for fixed records and dictionary keys."),
    mc("What does `point[0] = 5` do when `point` is a tuple?", ["Changes the first item", "Adds 5 at the start", "Raises a `TypeError`", "Nothing"], 2, "Tuples can't be changed after they are made, so item assignment is a `TypeError`."),
    mc("Which is a tuple with one item?", ["`(5)`", "`[5]`", "`5`", "`(5,)`"], 3, "The comma makes a tuple; `(5)` is just the number 5 in brackets."),
    mc("After `x, y = (3, 7)`, what is `y`?", ["`3`", "`7`", "`(3, 7)`", "An error"], 1, "Unpacking gives the names the items in order, so `y` gets the second."),
    mc("What does `a, b = (1, 2, 3)` do?", ["Raises a `ValueError`", "Sets `b` to `(2, 3)`", "Ignores the 3", "Sets `a` and `b` to 1"], 0, "Plain unpacking needs exactly as many names as items."),
    qShort("After `first, *rest = [1, 2, 3]`, how many items are in `rest`? (a number)", "2", "The starred name collects every item left over, here `[2, 3]`."),
    mc("What is `divmod(17, 5)`?", ["`3.4`", "`[3, 2]`", "`(2, 3)`", "`(3, 2)`"], 3, "`divmod` returns a tuple: the whole-number quotient and the remainder."),
    mc("What is `(1, 9) < (2, 0)`?", ["`False`", "An error", "`True`", "`None`"], 2, "Tuples compare item by item, and 1 < 2 settles it before the second items are looked at."),
    mc("Which suits a tuple best?", ["A shopping list you keep adding to", "A queue of jobs", "A list of scores to sort", "An (x, y) coordinate"], 3, "A coordinate has a fixed number of parts that belong together and don't change."),
    mc("In `for name, score in results:`, what is each item of `results`?", ["A pair, such as `(\"Ana\", 91)`", "A name", "A score", "A dictionary"], 0, "Each item of `results` is a pair, which the loop unpacks into two names."),
  ],
})
