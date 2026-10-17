// Functions topic: Docstrings and type hints. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "docstrings_hints",
  title: "Docstrings and type hints",
  paragraphs: [
    "As programs grow, you'll call functions you wrote weeks ago, or that someone else wrote. Two habits make a function explain itself: a **docstring** that says what it does, and **type hints** that say what goes in and what comes out.",
    "A docstring is a string written as the very first line of the function body, in triple quotes. Python stores it with the function, and `help(area)` or `area.__doc__` shows it. Start with one short sentence saying what the function does or returns; add more lines below only when they help.",
    "```\ndef area(width, height):\n    \"\"\"Return the area of a rectangle.\"\"\"\n    return width * height\n\nprint(area.__doc__)   # Return the area of a rectangle.\n```",
    "For bigger functions, a common layout lists the arguments and the result under headings:",
    "```\ndef average(numbers):\n    \"\"\"Return the average of a list of numbers.\n\n    Args:\n        numbers: the values to average.\n\n    Returns:\n        The average, or 0.0 for an empty list.\n    \"\"\"\n    if not numbers:\n        return 0.0\n    return sum(numbers) / len(numbers)\n```",
    "**Type hints** go in the `def` line: a colon and a type after each parameter, and `->` with a type before the final colon for what the function returns. `def area(width: float, height: float) -> float:` reads as \"takes two floats, gives back a float\". A function that returns nothing is marked `-> None`.",
    "Hints can describe collections too: `list[int]` is a list of ints, `dict[str, int]` a dict from strings to ints, `tuple[int, int]` a pair. `int | None` means \"an int, or `None`\", useful for a function that might not find anything. (Older code writes `Optional[int]`, from the `typing` module.)",
    "Python **doesn't check** hints when the program runs: `area(\"ab\", 3)` with float hints still runs (and returns `\"ababab\"`). Hints are for people, and for tools: code editors use them to suggest methods and warn about mistakes, and checkers like mypy read them to find bugs before you run anything.",
    "Python stores the hints with the function, in `area.__annotations__`, a dict such as `{\"width\": float, \"height\": float, \"return\": float}`. You'll rarely need it yourself, but it's how the challenges here can see your hints.",
  ],
  sandboxCode: "def average(numbers: list[float]) -> float:\n    \"\"\"Return the average of numbers, or 0.0 for an empty list.\"\"\"\n    if not numbers:\n        return 0.0\n    return sum(numbers) / len(numbers)\n\nprint(average([70, 85, 90]))\nprint(average.__doc__)\nprint(average.__annotations__)",
  sandboxSnippets: [
    snippet("A docstring", "def shout(text):\n    \"\"\"Return text in capitals with an exclamation mark.\"\"\"\n    return text.upper() + \"!\"\n\nprint(shout(\"hi\"))\nprint(shout.__doc__)"),
    snippet("Type hints", "def area(width: float, height: float) -> float:\n    return width * height\n\nprint(area(2.5, 4))\nprint(area.__annotations__)"),
    snippet("Hints are not checked", "def double(n: int) -> int:\n    return n * 2\n\nprint(double(\"ab\"))"),
    snippet("Collections and None", "def find(names: list[str], target: str) -> int | None:\n    \"\"\"Return the index of target in names, or None.\"\"\"\n    if target in names:\n        return names.index(target)\n    return None\n\nprint(find([\"Ana\", \"Ben\"], \"Ben\"), find([\"Ana\"], \"Zoe\"))"),
    snippet("Returns nothing", "def greet(name: str) -> None:\n    print(f\"Hello, {name}!\")\n\nresult = greet(\"Ana\")\nprint(result)"),
  ],
  readMore: { label: "Python tutorial: documentation strings", url: "https://docs.python.org/3/tutorial/controlflow.html#documentation-strings", source: "Python docs" },
  challenges: [
    task("easy", "Add a docstring", {
      prompt: "Give `area` a one-line docstring that mentions a rectangle (for example, `Return the area of a rectangle.`).",
      starter: "def area(width, height):\n    return width * height\n",
      hint: "Add `\"\"\"Return the area of a rectangle.\"\"\"` as the first line of the body, indented like the `return`.",
      solution: "def area(width, height):\n    \"\"\"Return the area of a rectangle.\"\"\"\n    return width * height",
      tests: [
        ["area has a docstring", "area.__doc__ is not None and \"rectangle\" in area.__doc__.lower()"],
        ["area still works", "area(2, 3) == 6"],
      ],
    }),
    task("easy", "Read a docstring", {
      prompt: "Set `doc` to the docstring of `shout`, without retyping it.",
      starter: "def shout(text):\n    \"\"\"Return text in capitals with an exclamation mark.\"\"\"\n    return text.upper() + \"!\"\n\n",
      hint: "A function keeps its docstring in `.__doc__`: `doc = shout.__doc__`.",
      solution: "def shout(text):\n    \"\"\"Return text in capitals with an exclamation mark.\"\"\"\n    return text.upper() + \"!\"\n\ndoc = shout.__doc__",
      tests: [
        ["doc is the docstring", "doc == \"Return text in capitals with an exclamation mark.\""],
      ],
    }),
    task("easy", "Add type hints", {
      prompt: "Add type hints to `add`: both parameters are `int`, and it returns an `int`.",
      starter: "def add(a, b):\n    return a + b\n",
      hint: "`def add(a: int, b: int) -> int:`.",
      solution: "def add(a: int, b: int) -> int:\n    return a + b",
      tests: [
        ["The hints are right", "add.__annotations__ == {\"a\": int, \"b\": int, \"return\": int}"],
        ["add still works", "add(2, 3) == 5"],
      ],
    }),
    task("medium", "A list of prices", {
      prompt: "Define `total(prices: list[float]) -> float` that returns the sum of the prices.",
      hint: "The hints go in the `def` line; the body is `return sum(prices)`.",
      solution: "def total(prices: list[float]) -> float:\n    return sum(prices)",
      tests: [
        ["The hints are right", "total.__annotations__ == {\"prices\": list[float], \"return\": float}"],
        ["total([2.5, 1.5])", "total([2.5, 1.5]) == 4.0"],
      ],
    }),
    task("medium", "Maybe nothing", {
      prompt: "Define `find(names: list[str], target: str) -> int | None` that returns the index of `target` in `names`, or `None` if it isn't there.",
      hint: "`if target in names: return names.index(target)`, then `return None`.",
      solution: "def find(names: list[str], target: str) -> int | None:\n    if target in names:\n        return names.index(target)\n    return None",
      tests: [
        ["The return hint is int | None", "find.__annotations__[\"return\"] == (int | None)"],
        ["Finds Ben", "find([\"Ana\", \"Ben\"], \"Ben\") == 1"],
        ["Zoe is missing", "find([\"Ana\"], \"Zoe\") is None"],
      ],
    }),
    task("medium", "Returns nothing", {
      prompt: "Add type hints to `greet`: `name` is a `str`, and it returns nothing, so mark it `-> None`.",
      starter: "def greet(name):\n    print(f\"Hello, {name}!\")\n",
      hint: "`def greet(name: str) -> None:`.",
      solution: "def greet(name: str) -> None:\n    print(f\"Hello, {name}!\")",
      tests: [
        ["The hints are right", "greet.__annotations__ == {\"name\": str, \"return\": None}"],
      ],
    }),
    task("hard", "Hints are not checked", {
      prompt: "Set `result` to what `double(\"ab\")` returns. The hint says `int`, but Python doesn't check it.",
      starter: "def double(n: int) -> int:\n    return n * 2\n\n",
      hint: "Just call it: `result = double(\"ab\")`. Strings can be \"multiplied\" too.",
      solution: "def double(n: int) -> int:\n    return n * 2\n\nresult = double(\"ab\")",
      tests: [
        ["result is abab", "result == \"abab\""],
      ],
    }),
    task("hard", "Document it fully", {
      prompt: "Define `average(numbers: list[float]) -> float` with a docstring that has `Args:` and `Returns:` sections. It returns 0.0 for an empty list.",
      hint: "Follow the layout in the lesson. In the body: `if not numbers: return 0.0`, then `return sum(numbers) / len(numbers)`.",
      solution: "def average(numbers: list[float]) -> float:\n    \"\"\"Return the average of a list of numbers.\n\n    Args:\n        numbers: the values to average.\n\n    Returns:\n        The average, or 0.0 for an empty list.\n    \"\"\"\n    if not numbers:\n        return 0.0\n    return sum(numbers) / len(numbers)",
      tests: [
        ["The docstring has Args and Returns", "average.__doc__ is not None and \"Args:\" in average.__doc__ and \"Returns:\" in average.__doc__"],
        ["The hints are right", "average.__annotations__ == {\"numbers\": list[float], \"return\": float}"],
        ["average([70, 85, 90])", "abs(average([70, 85, 90]) - 81.6666666) < 1e-6"],
        ["average([]) is 0.0", "average([]) == 0.0"],
      ],
    }),
    task("expert", "Word lengths", {
      prompt: "Define `word_lengths(words: list[str]) -> dict[str, int]`, with a one-line docstring, that returns a dict mapping each word to its length.",
      hint: "A dict comprehension: `return {w: len(w) for w in words}`.",
      solution: "def word_lengths(words: list[str]) -> dict[str, int]:\n    \"\"\"Return a dict mapping each word to its length.\"\"\"\n    return {w: len(w) for w in words}",
      tests: [
        ["The hints are right", "word_lengths.__annotations__ == {\"words\": list[str], \"return\": dict[str, int]}"],
        ["It has a docstring", "bool(word_lengths.__doc__)"],
        ["word_lengths([\"tea\", \"cake\"])", "word_lengths([\"tea\", \"cake\"]) == {\"tea\": 3, \"cake\": 4}"],
      ],
    }),
    task("expert", "A pair back", {
      prompt: "Define `min_max(numbers: list[int]) -> tuple[int, int]`, with a docstring, that returns the smallest and largest number.",
      hint: "The return hint is `tuple[int, int]`; the body is `return min(numbers), max(numbers)`.",
      solution: "def min_max(numbers: list[int]) -> tuple[int, int]:\n    \"\"\"Return the smallest and the largest of numbers.\"\"\"\n    return min(numbers), max(numbers)",
      tests: [
        ["The hints are right", "min_max.__annotations__ == {\"numbers\": list[int], \"return\": tuple[int, int]}"],
        ["It has a docstring", "bool(min_max.__doc__)"],
        ["min_max([4, 1, 9])", "min_max([4, 1, 9]) == (1, 9)"],
      ],
    }),
  ],
  questions: [
    mc("Where does a docstring go?", ["Above the `def` line", "As the first line of the function body", "At the end of the function", "In a separate file"], 1),
    mc("How can you read a function's docstring?", ["`area.doc`", "`print(area)`", "`help(area)` or `area.__doc__`", "`area.docstring()`"], 2),
    mc("What does `-> float` in a `def` line say?", ["The function returns a float", "The first parameter is a float", "The function converts to float", "It is a comment"], 0),
    mc("What happens when you call `area(\"ab\", 3)` and `area` has float hints?", ["A `TypeError` from the hints", "Python converts \"ab\" to a float", "It refuses to run", "It runs anyway: Python doesn't check hints"], 3),
    qShort("What return hint marks a function that returns nothing? (one word)", "None"),
    mc("What does `list[int]` mean as a hint?", ["A list of any values", "A list of ints", "An int or a list", "The length of a list"], 1),
    mc("What does `int | None` mean as a hint?", ["An int, or None", "Neither", "An int divided by None", "A syntax error"], 0),
    mc("Who uses type hints?", ["Only Python itself, to stop bad calls", "Nobody", "People reading the code, editors and checkers like mypy", "Only the `print` function"], 2),
    mc("What should the first line of a docstring be?", ["The author's name", "The date", "A copy of the code", "One short sentence saying what the function does"], 3),
    mc("Where does Python keep a function's hints?", ["In `__doc__`", "In `__annotations__`", "In `__hints__`", "Nowhere"], 1),
  ],
})
