// Data structures topic: List comprehensions. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "list_comprehensions",
  title: "List comprehensions",
  paragraphs: [
    "Building a new list from an old one is so common that Python has a shortcut for it. Instead of starting with an empty list and appending in a loop, a **list comprehension** describes the new list in one line: `[expression for item in items]`.",
    "```\nnums = [1, 2, 3, 4]\n\nsquares = []\nfor n in nums:\n    squares.append(n ** 2)\n\nsquares = [n ** 2 for n in nums]   # the same, in one line\nprint(squares)                     # [1, 4, 9, 16]\n```",
    "Read it from the left: \"`n ** 2`, for each `n` in `nums`\". The expression at the front can be anything that gives a value: a method call like `w.upper()`, an f-string, or a conversion. `[int(p) for p in \"4 8 15\".split()]` turns text into a list of numbers.",
    "Add an `if` at the end to **filter**: only the items for which the condition is true make it into the new list.",
    "```\nnums = [5, 12, 7, 20, 3]\nevens = [n for n in nums if n % 2 == 0]\nbig = [n for n in nums if n > 6]\nprint(evens, big)   # [12, 20] [12, 7, 20]\n```",
    "To **choose** between two values for every item instead, put a conditional expression at the front: `[\"even\" if n % 2 == 0 else \"odd\" for n in nums]`. The rule of thumb: an `if` on its own goes at the end and drops items; an `if ... else` goes at the front and keeps every item.",
    "A comprehension can loop over anything a `for` loop can: a range, a string, a dict's items. `[name for name, score in scores.items() if score >= 80]` lists the names of everyone who scored 80 or more.",
    "Comprehensions can have more than one `for`, in the same order as nested loops: `[n for row in grid for n in row]` flattens a list of lists into one list. A comprehension inside another builds a list of lists: `[[0] * 3 for _ in range(2)]` is `[[0, 0, 0], [0, 0, 0]]`.",
    "Use comprehensions to **build a list**. When the work takes several steps, or you only want to print or count something, a normal loop is clearer. And when the list is only going to be added up, you can drop the square brackets: `sum(n * n for n in range(10))`.",
  ],
  sandboxCode: "nums = [5, 12, 7, 20, 3]\nprint([n * 2 for n in nums])\nprint([n for n in nums if n > 6])\nprint([\"even\" if n % 2 == 0 else \"odd\" for n in nums])\n\nwords = \"the quick brown fox\".split()\nprint([w.upper() for w in words if len(w) > 3])",
  sandboxSnippets: [
    snippet("Transform", "words = [\"tea\", \"cake\", \"jam\"]\nprint([w.upper() for w in words])\nprint([len(w) for w in words])"),
    snippet("Filter", "nums = list(range(1, 21))\nprint([n for n in nums if n % 3 == 0])"),
    snippet("Choose a value", "scores = [72, 45, 88, 50]\nprint([\"pass\" if s >= 50 else \"fail\" for s in scores])"),
    snippet("From a dict", "scores = {\"Ana\": 91, \"Ben\": 78, \"Cleo\": 85}\nprint([name for name, score in scores.items() if score >= 80])"),
    snippet("Two fors", "grid = [[1, 2], [3, 4], [5, 6]]\nprint([n for row in grid for n in row])"),
  ],
  readMore: { label: "Python tutorial: list comprehensions", url: "https://docs.python.org/3/tutorial/datastructures.html#list-comprehensions", source: "Python docs" },
  challenges: [
    task("easy", "Squares", {
      prompt: "Set `squares` to the squares of 1 to 5, with a list comprehension.",
      hint: "`[n ** 2 for n in range(1, 6)]`.",
      solution: "squares = [n ** 2 for n in range(1, 6)]",
      tests: [
        ["squares is right", "squares == [1, 4, 9, 16, 25]"],
      ],
    }),
    task("easy", "Shout", {
      prompt: "Set `loud` to every word in capitals, with a list comprehension.",
      starter: "words = [\"hi\", \"there\", \"friend\"]\n",
      hint: "`[w.upper() for w in words]`.",
      solution: "words = [\"hi\", \"there\", \"friend\"]\nloud = [w.upper() for w in words]",
      tests: [
        ["loud is right", "loud == [\"HI\", \"THERE\", \"FRIEND\"]"],
      ],
    }),
    task("easy", "Text to numbers", {
      prompt: "Set `nums` to the numbers in `data`, as a list of ints.",
      starter: "data = \"4 8 15 16 23 42\"\n",
      hint: "Convert each piece of the split: `[int(p) for p in data.split()]`.",
      solution: "data = \"4 8 15 16 23 42\"\nnums = [int(p) for p in data.split()]",
      tests: [
        ["nums is right", "nums == [4, 8, 15, 16, 23, 42]"],
      ],
    }),
    task("medium", "Only the evens", {
      prompt: "Set `evens` to the even numbers in `nums`.",
      starter: "nums = [5, 12, 7, 20, 3, 8]\n",
      hint: "Filter with an `if` at the end: `[n for n in nums if n % 2 == 0]`.",
      solution: "nums = [5, 12, 7, 20, 3, 8]\nevens = [n for n in nums if n % 2 == 0]",
      tests: [
        ["evens is right", "evens == [12, 20, 8]"],
      ],
    }),
    task("medium", "Long words", {
      prompt: "Set `long_words` to the words in `text` with more than 4 letters.",
      starter: "text = \"the quick brown fox jumps over the lazy dog\"\n",
      hint: "Loop over `text.split()` and keep a word `if len(w) > 4`.",
      solution: "text = \"the quick brown fox jumps over the lazy dog\"\nlong_words = [w for w in text.split() if len(w) > 4]",
      tests: [
        ["long_words is right", "long_words == [\"quick\", \"brown\", \"jumps\"]"],
      ],
    }),
    task("medium", "Pass or fail", {
      prompt: "Set `results` to `pass` or `fail` for every score (50 or more passes).",
      starter: "scores = [72, 45, 88, 50, 31]\n",
      hint: "Choose a value at the front: `[\"pass\" if s >= 50 else \"fail\" for s in scores]`.",
      solution: "scores = [72, 45, 88, 50, 31]\nresults = [\"pass\" if s >= 50 else \"fail\" for s in scores]",
      tests: [
        ["results is right", "results == [\"pass\", \"fail\", \"pass\", \"pass\", \"fail\"]"],
      ],
    }),
    task("hard", "The honour roll", {
      prompt: "Set `honours` to the names of everyone who scored 85 or more.",
      starter: "scores = {\"Ana\": 91, \"Ben\": 78, \"Cleo\": 85, \"Dev\": 96}\n",
      hint: "Loop over `scores.items()` and filter: `[name for name, score in scores.items() if score >= 85]`.",
      solution: "scores = {\"Ana\": 91, \"Ben\": 78, \"Cleo\": 85, \"Dev\": 96}\nhonours = [name for name, score in scores.items() if score >= 85]",
      tests: [
        ["honours is right", "honours == [\"Ana\", \"Cleo\", \"Dev\"]"],
      ],
    }),
    task("hard", "Clean the names", {
      prompt: "Set `names` to the names in `raw` without the spaces around them and in title case, leaving out the empty ones.",
      starter: "raw = [\"  ana \", \"\", \"BEN\", \"   \", \"cleo marsh\"]\n",
      hint: "Transform with `n.strip().title()` and filter with `if n.strip()`, which is falsy for empty text.",
      solution: "raw = [\"  ana \", \"\", \"BEN\", \"   \", \"cleo marsh\"]\nnames = [n.strip().title() for n in raw if n.strip()]",
      tests: [
        ["names is right", "names == [\"Ana\", \"Ben\", \"Cleo Marsh\"]"],
      ],
    }),
    task("expert", "Flatten", {
      prompt: "Set `flat` to all the numbers in `grid`, row by row, in one list.",
      starter: "grid = [[1, 2, 3], [4, 5], [6]]\n",
      hint: "Two `for`s, in the order of nested loops: `[n for row in grid for n in row]`.",
      solution: "grid = [[1, 2, 3], [4, 5], [6]]\nflat = [n for row in grid for n in row]",
      tests: [
        ["flat is right", "flat == [1, 2, 3, 4, 5, 6]"],
      ],
    }),
    task("expert", "A times table", {
      prompt: "Set `table` to a list of 3 rows, where row `r` holds `r * 1`, `r * 2` and `r * 3`, for `r` from 1 to 3. Use a comprehension inside a comprehension.",
      hint: "The inner one builds a row: `[r * c for c in range(1, 4)]`. The outer one makes a row for each `r` in `range(1, 4)`.",
      solution: "table = [[r * c for c in range(1, 4)] for r in range(1, 4)]",
      tests: [
        ["table is right", "table == [[1, 2, 3], [2, 4, 6], [3, 6, 9]]"],
      ],
    }),
  ],
  questions: [
    mc("What is `[n * 2 for n in [1, 2, 3]]`?", ["`[1, 2, 3, 1, 2, 3]`", "`[2, 4, 6]`", "`[1, 4, 9]`", "`6`"], 1, "The expression `n * 2` is worked out for each item."),
    mc("What does the `if` at the end of `[n for n in nums if n > 0]` do?", ["Keeps only the items that match", "Changes every item", "Stops at the first match", "Sorts the list"], 0, "An `if` at the end filters: only items that pass the test are kept."),
    mc("Where does an `if ... else` go in a comprehension?", ["At the end", "After the `in`", "At the front, before `for`", "It isn't allowed"], 2, "`x if cond else y` chooses the value for each item, so it belongs in the expression at the front."),
    mc("What is `[c for c in \"abc\"]`?", ["`\"abc\"`", "`[\"abc\"]`", "`[0, 1, 2]`", "`[\"a\", \"b\", \"c\"]`"], 3, "Looping over a string gives its characters one by one."),
    qShort("What is `len([n for n in range(10) if n % 2 == 0])`? (a number)", "5", "The even numbers from 0 to 9 are 0, 2, 4, 6 and 8."),
    mc("What is `[\"hi\" if n > 1 else \"lo\" for n in [1, 2]]`?", ["`[\"hi\", \"lo\"]`", "`[\"lo\", \"hi\"]`", "`[\"hi\"]`", "`[\"lo\"]`"], 1, "For 1 the condition is false, giving \"lo\"; for 2 it is true, giving \"hi\"."),
    mc("In `[n for row in grid for n in row]`, which loop is the outer one?", ["`for n in row`", "Neither", "`for row in grid`", "They run side by side"], 2, "The `for` clauses read left to right, like nested loops, so the first is the outer one."),
    mc("When is a normal loop better than a comprehension?", ["When the work takes several steps or you only want to print", "Always", "Never", "When the list is short"], 0, "Comprehensions are for building a list in one expression; a loop is clearer for many steps or side effects."),
    mc("What is `[[0] * 2 for _ in range(3)]`?", ["`[0, 0, 0, 0, 0, 0]`", "`[[0, 0, 0], [0, 0, 0]]`", "`[0, 0]`", "`[[0, 0], [0, 0], [0, 0]]`"], 3, "Each round of the comprehension builds a new `[0, 0]` row, so the three rows are separate lists."),
    mc("What is `sum(n for n in range(4))`?", ["`6`", "`4`", "`10`", "An error"], 0, "A generator expression can be passed straight to `sum`: 0 + 1 + 2 + 3 is 6."),
  ],
})
