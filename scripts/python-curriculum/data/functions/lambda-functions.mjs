// Functions topic: Lambda functions. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "lambda_functions",
  title: "Lambda functions",
  paragraphs: [
    "Sometimes you need a tiny function just once, usually to hand to another function. Writing a whole `def` for it feels heavy. A **lambda** is a small function written as an expression: `lambda` parameters `:` the value to return.",
    "```\nsquare = lambda n: n * n        # the same as: def square(n): return n * n\nprint(square(4))                # 16\n```",
    "A lambda can only hold **one expression**, whose value it returns automatically; there's no `return`, no loops and no assignments inside. It has no name of its own, which is why it's also called an anonymous function.",
    "Its real home is as an argument. In Data structures you sorted with `key=len`; a lambda lets you sort by **anything** you can calculate, right where you need it:",
    "```\npairs = [(\"Ana\", 91), (\"Ben\", 78), (\"Cleo\", 85)]\nby_score = sorted(pairs, key=lambda p: p[1])\nprint(by_score)   # [('Ben', 78), ('Cleo', 85), ('Ana', 91)]\n\npeople = [{\"name\": \"Ana\", \"age\": 30}, {\"name\": \"Ben\", \"age\": 25}]\nyoungest = min(people, key=lambda p: p[\"age\"])\nprint(youngest[\"name\"])   # Ben\n```",
    "To sort by more than one thing, return a tuple: tuples compare item by item. `key=lambda p: (-p[1], p[0])` sorts by score from high to low (the minus sign flips the order) and breaks ties by name.",
    "`map(f, items)` applies a function to every item, and `filter(f, items)` keeps the items for which it returns something truthy. Both give back a lazy sequence, so wrap them in `list()` to see the result. A comprehension usually says the same thing more clearly: `[n * 2 for n in nums]` rather than `list(map(lambda n: n * 2, nums))`, so use whichever reads better.",
    "Functions can also **return** functions, and a lambda is a quick way to build one. `make_multiplier(3)` below returns a function that triples whatever it's given:",
    "```\ndef make_multiplier(factor):\n    return lambda x: x * factor\n\ntriple = make_multiplier(3)\nprint(triple(5))   # 15\n```",
    "Python's style guide advises against giving a lambda a name with `=`, as in the first example: if a function deserves a name, use `def`, which also gives it a proper name in error messages. Keep lambdas short and use them in place, as arguments.",
  ],
  sandboxCode: "pairs = [(\"Ana\", 91), (\"Ben\", 78), (\"Cleo\", 85)]\nprint(sorted(pairs, key=lambda p: p[1]))\nprint(sorted(pairs, key=lambda p: p[1], reverse=True))\n\nnums = [5, 12, 7, 20, 3]\nprint(list(filter(lambda n: n > 6, nums)))\nprint(list(map(lambda n: n * 2, nums)))",
  sandboxSnippets: [
    snippet("Sort by the second item", "pairs = [(\"tea\", 2.5), (\"cake\", 3.75), (\"water\", 1.0)]\nprint(sorted(pairs, key=lambda p: p[1]))"),
    snippet("Sort records", "people = [{\"name\": \"Ana\", \"age\": 30}, {\"name\": \"Ben\", \"age\": 25}]\nfor p in sorted(people, key=lambda p: p[\"age\"]):\n    print(p[\"name\"], p[\"age\"])"),
    snippet("Two sort keys", "scores = [(\"Ana\", 90), (\"Ben\", 95), (\"Cleo\", 90)]\nprint(sorted(scores, key=lambda s: (-s[1], s[0])))"),
    snippet("map and filter", "nums = [1, 2, 3, 4, 5, 6]\nprint(list(map(lambda n: n * n, nums)))\nprint(list(filter(lambda n: n % 2 == 0, nums)))\nprint([n * n for n in nums if n % 2 == 0])"),
    snippet("A function that makes functions", "def make_adder(n):\n    return lambda x: x + n\n\nadd5 = make_adder(5)\nprint(add5(10), make_adder(1)(1))"),
  ],
  readMore: { label: "Python tutorial: lambda expressions", url: "https://docs.python.org/3/tutorial/controlflow.html#lambda-expressions", source: "Python docs" },
  challenges: [
    task("easy", "Sort by score", {
      prompt: "Set `by_score` to `pairs` sorted by the score (the second item), lowest first, with a lambda.",
      starter: "pairs = [(\"Ana\", 91), (\"Ben\", 78), (\"Cleo\", 85)]\n",
      hint: "`sorted(pairs, key=lambda p: p[1])`.",
      solution: "pairs = [(\"Ana\", 91), (\"Ben\", 78), (\"Cleo\", 85)]\nby_score = sorted(pairs, key=lambda p: p[1])",
      tests: [
        ["by_score is right", "by_score == [(\"Ben\", 78), (\"Cleo\", 85), (\"Ana\", 91)]"],
      ],
    }),
    task("easy", "Ignore capitals", {
      prompt: "Set `ordered` to `names` sorted alphabetically, ignoring capital letters.",
      starter: "names = [\"bob\", \"Alice\", \"carol\", \"Dan\"]\n",
      hint: "Sort by the lowercase version: `key=lambda s: s.lower()`.",
      solution: "names = [\"bob\", \"Alice\", \"carol\", \"Dan\"]\nordered = sorted(names, key=lambda s: s.lower())",
      tests: [
        ["ordered is right", "ordered == [\"Alice\", \"bob\", \"carol\", \"Dan\"]"],
      ],
    }),
    task("easy", "The last letter", {
      prompt: "Set `by_last` to `words` sorted by their last letter.",
      starter: "words = [\"tea\", \"cake\", \"jam\", \"bread\"]\n",
      hint: "The last letter is `w[-1]`: `key=lambda w: w[-1]`.",
      solution: "words = [\"tea\", \"cake\", \"jam\", \"bread\"]\nby_last = sorted(words, key=lambda w: w[-1])",
      tests: [
        ["by_last is right", "by_last == [\"tea\", \"bread\", \"cake\", \"jam\"]"],
      ],
    }),
    task("medium", "The youngest", {
      prompt: "Set `youngest` to the name of the youngest person, using `min` with a lambda.",
      starter: "people = [{\"name\": \"Ana\", \"age\": 30}, {\"name\": \"Ben\", \"age\": 25}, {\"name\": \"Cleo\", \"age\": 41}]\n",
      hint: "`min(people, key=lambda p: p[\"age\"])` gives the whole record; take its `\"name\"`.",
      solution: "people = [{\"name\": \"Ana\", \"age\": 30}, {\"name\": \"Ben\", \"age\": 25}, {\"name\": \"Cleo\", \"age\": 41}]\nyoungest = min(people, key=lambda p: p[\"age\"])[\"name\"]",
      tests: [
        ["youngest is Ben", "youngest == \"Ben\""],
      ],
    }),
    task("medium", "Keep the evens", {
      prompt: "Set `evens` to the even numbers in `nums`, using `filter` and a lambda.",
      starter: "nums = [5, 12, 7, 20, 3, 8]\n",
      hint: "`list(filter(lambda n: n % 2 == 0, nums))`.",
      solution: "nums = [5, 12, 7, 20, 3, 8]\nevens = list(filter(lambda n: n % 2 == 0, nums))",
      tests: [
        ["evens is right", "evens == [12, 20, 8]"],
      ],
    }),
    task("medium", "Convert them all", {
      prompt: "Set `fahrenheit` to every temperature in `celsius` converted to °F, using `map` and a lambda.",
      starter: "celsius = [0, 10, 25, 100]\n",
      hint: "`list(map(lambda c: c * 9 / 5 + 32, celsius))`.",
      solution: "celsius = [0, 10, 25, 100]\nfahrenheit = list(map(lambda c: c * 9 / 5 + 32, celsius))",
      tests: [
        ["fahrenheit is right", "fahrenheit == [32.0, 50.0, 77.0, 212.0]"],
      ],
    }),
    task("hard", "Ties by name", {
      prompt: "Set `ranking` to `scores` sorted by score from high to low, and by name (A to Z) when scores tie.",
      starter: "scores = [(\"Cleo\", 90), (\"Ben\", 95), (\"Ana\", 90), (\"Dev\", 80)]\n",
      hint: "Return a tuple from the key: `lambda s: (-s[1], s[0])`. The minus sign puts high scores first.",
      solution: "scores = [(\"Cleo\", 90), (\"Ben\", 95), (\"Ana\", 90), (\"Dev\", 80)]\nranking = sorted(scores, key=lambda s: (-s[1], s[0]))",
      tests: [
        ["ranking is right", "ranking == [(\"Ben\", 95), (\"Ana\", 90), (\"Cleo\", 90), (\"Dev\", 80)]"],
      ],
    }),
    task("hard", "Give it a def", {
      prompt: "Python's style guide says a named function should use `def`. Rewrite `area` as a `def` that does the same thing.",
      starter: "area = lambda width, height: width * height\n",
      hint: "`def area(width, height):` and `return width * height`.",
      solution: "def area(width, height):\n    return width * height",
      tests: [
        ["area(2, 3) is 6", "area(2, 3) == 6"],
        ["area has its own name", "area.__name__ == \"area\""],
      ],
    }),
    task("expert", "A function factory", {
      prompt: "Define `make_multiplier(factor)` that returns a function multiplying its argument by `factor`. Then set `double = make_multiplier(2)`.",
      hint: "`return lambda x: x * factor` inside the function.",
      solution: "def make_multiplier(factor):\n    return lambda x: x * factor\n\ndouble = make_multiplier(2)",
      tests: [
        ["double(21) is 42", "double(21) == 42"],
        ["make_multiplier(3)(5) is 15", "make_multiplier(3)(5) == 15"],
      ],
    }),
    task("expert", "Top two", {
      prompt: "Set `top_two` to the names of the two highest scorers in `scores`, best first, by sorting `scores.items()` with a lambda.",
      starter: "scores = {\"Ana\": 88, \"Ben\": 95, \"Cleo\": 72, \"Dev\": 91}\n",
      hint: "Sort the `(name, score)` pairs with `key=lambda kv: kv[1], reverse=True`, take the first two with `[:2]`, and keep the names.",
      solution: "scores = {\"Ana\": 88, \"Ben\": 95, \"Cleo\": 72, \"Dev\": 91}\ntop_two = [name for name, _ in sorted(scores.items(), key=lambda kv: kv[1], reverse=True)[:2]]",
      tests: [
        ["top_two is right", "top_two == [\"Ben\", \"Dev\"]"],
      ],
    }),
  ],
  questions: [
    mc("What does `lambda n: n + 1` make?", ["A list", "A small function that returns `n + 1`", "A variable called `lambda`", "A loop"], 1),
    mc("What can a lambda body contain?", ["Any number of lines", "Loops and assignments", "A single expression", "Only `return` statements"], 2),
    mc("Where is a lambda most useful?", ["As an argument, such as `key=` for `sorted`", "As a whole program", "Instead of every `def`", "Inside comments"], 0),
    mc("What does `sorted(pairs, key=lambda p: p[1])` sort by?", ["The first item", "The length", "Alphabetically", "The second item of each pair"], 3),
    qShort("What is `(lambda x, y: x * y)(3, 4)`? (a number)", "12"),
    mc("How do you see the result of `map(...)`?", ["It prints itself", "Wrap it in `list(...)`", "Call `.show()`", "You can't"], 1),
    mc("Which is usually clearer than `list(map(lambda n: n * 2, nums))`?", ["`[n * 2 for n in nums]`", "`nums * 2`", "`sum(nums)`", "`map(nums)`"], 0),
    mc("For a list of `(name, score)` pairs, what does `key=lambda s: (-s[1], s[0])` do?", ["Sorts by name only", "Sorts randomly", "Sorts by score high to low, then by name", "Raises an error"], 2),
    mc("Why prefer `def` over `name = lambda ...`?", ["Lambdas are slower", "Lambdas can't be called", "`def` makes shorter code", "A named function deserves `def`, which also shows its name in errors"], 3),
    mc("`def f(n): return lambda x: x + n`. What is `f(2)(5)`?", ["`2`", "`7`", "`10`", "A function"], 1),
  ],
})
