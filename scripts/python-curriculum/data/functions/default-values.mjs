// Functions topic: Default values. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "default_parameters",
  title: "Default values",
  paragraphs: [
    "Some arguments have an obvious usual value. You can give a parameter a **default** in the `def` line, with `=`, and then callers only pass it when they want something different:",
    "```\ndef greet(name, greeting=\"Hello\"):\n    return f\"{greeting}, {name}!\"\n\nprint(greet(\"Ana\"))              # Hello, Ana!\nprint(greet(\"Ben\", \"Welcome\"))   # Welcome, Ben!\n```",
    "A parameter with a default is **optional**; one without is **required**. You've used optional arguments plenty already: `round(x)` and `round(x, 2)`, `print(..., sep=\"-\")`, `range(stop)` and `range(start, stop)` all work because those functions have defaults.",
    "Required parameters must come **before** the ones with defaults, otherwise Python couldn't tell which argument is which. `def order(size=\"M\", drink):` is a `SyntaxError` (parameter without a default follows parameter with a default); write `def order(drink, size=\"M\"):` instead.",
    "Defaults let a function grow without breaking the calls that already use it. Add `decimals=2` to a `format_price` function, and every existing call carries on working, while new calls can ask for something else.",
    "```\ndef format_price(amount, currency=\"$\", decimals=2):\n    return f\"{currency}{amount:.{decimals}f}\"\n\nprint(format_price(4.5))              # $4.50\nprint(format_price(4.5, \"€\"))         # €4.50\nprint(format_price(1234.5, \"£\", 0))   # £1234\n```",
    "**One trap.** A default value is created **once**, when the `def` line runs, not on every call. For numbers, strings and `None` that's harmless, but a default list or dict is shared between all calls, so changes pile up from one call to the next:",
    "```\ndef add_item(item, basket=[]):     # one list, shared by every call!\n    basket.append(item)\n    return basket\n\nprint(add_item(\"apple\"))   # ['apple']\nprint(add_item(\"pear\"))    # ['apple', 'pear']  surprise!\n```",
    "The fix is the standard pattern: use `None` as the default and create a fresh list inside the function: `def add_item(item, basket=None):`, then `if basket is None: basket = []`.",
  ],
  sandboxCode: "def greet(name, greeting=\"Hello\"):\n    return f\"{greeting}, {name}!\"\n\nprint(greet(\"Ana\"))\nprint(greet(\"Ben\", \"Welcome\"))\n\ndef format_price(amount, currency=\"$\", decimals=2):\n    return f\"{currency}{amount:.{decimals}f}\"\n\nprint(format_price(4.5), format_price(4.5, \"€\"), format_price(1234.5, \"£\", 0))",
  sandboxSnippets: [
    snippet("A default value", "def power(base, exp=2):\n    return base ** exp\n\nprint(power(5), power(2, 10))"),
    snippet("Optional arguments you know", "print(round(3.14159), round(3.14159, 2))\nprint(list(range(3)), list(range(1, 4)))"),
    snippet("Defaults come last", "def order(size=\"M\", drink):\n    return f\"{size} {drink}\""),
    snippet("The shared list trap", "def add_item(item, basket=[]):\n    basket.append(item)\n    return basket\n\nprint(add_item(\"apple\"))\nprint(add_item(\"pear\"))"),
    snippet("The None fix", "def add_item(item, basket=None):\n    if basket is None:\n        basket = []\n    basket.append(item)\n    return basket\n\nprint(add_item(\"apple\"))\nprint(add_item(\"pear\"))"),
  ],
  readMore: { label: "Python tutorial: default argument values", url: "https://docs.python.org/3/tutorial/controlflow.html#default-argument-values", source: "Python docs" },
  challenges: [
    task("easy", "A friendly default", {
      prompt: "Define `greet(name, greeting=\"Hello\")` that returns `Hello, Ana!` for `greet(\"Ana\")` and `Hi, Ana!` for `greet(\"Ana\", \"Hi\")`.",
      hint: "Put `greeting=\"Hello\"` in the `def` line and return `f\"{greeting}, {name}!\"`.",
      solution: "def greet(name, greeting=\"Hello\"):\n    return f\"{greeting}, {name}!\"",
      tests: [
        ["greet(\"Ana\")", "greet(\"Ana\") == \"Hello, Ana!\""],
        ["greet(\"Ana\", \"Hi\")", "greet(\"Ana\", \"Hi\") == \"Hi, Ana!\""],
      ],
    }),
    task("easy", "Squared by default", {
      prompt: "Define `power(base, exp=2)` that returns `base` to the power of `exp`.",
      hint: "`return base ** exp`, with `exp=2` in the `def` line.",
      solution: "def power(base, exp=2):\n    return base ** exp",
      tests: [
        ["power(5) is 25", "power(5) == 25"],
        ["power(2, 10) is 1024", "power(2, 10) == 1024"],
      ],
    }),
    task("easy", "Defaults go last", {
      prompt: "This line is a `SyntaxError`. Fix the order of the parameters so `order(\"tea\")` returns `M tea` and `order(\"tea\", \"L\")` returns `L tea`.",
      starter: "def order(size=\"M\", drink):\n    return f\"{size} {drink}\"\n",
      hint: "The required parameter comes first: `def order(drink, size=\"M\"):`.",
      solution: "def order(drink, size=\"M\"):\n    return f\"{size} {drink}\"",
      tests: [
        ["order(\"tea\")", "order(\"tea\") == \"M tea\""],
        ["order(\"tea\", \"L\")", "order(\"tea\", \"L\") == \"L tea\""],
      ],
    }),
    task("medium", "Price labels", {
      prompt: "Define `format_price(amount, currency=\"$\", decimals=2)` that returns the amount with the currency in front and that many decimals.",
      hint: "A format spec can use a variable: `f\"{currency}{amount:.{decimals}f}\"`.",
      solution: "def format_price(amount, currency=\"$\", decimals=2):\n    return f\"{currency}{amount:.{decimals}f}\"",
      tests: [
        ["format_price(4.5)", "format_price(4.5) == \"$4.50\""],
        ["format_price(4.5, \"€\")", "format_price(4.5, \"€\") == \"€4.50\""],
        ["format_price(1234.5, \"£\", 0)", "format_price(1234.5, \"£\", 0) == \"£1234\""],
      ],
    }),
    task("medium", "Say it again", {
      prompt: "Define `repeat(text, times=2, sep=\" \")` that returns `text` repeated `times` times with `sep` between the copies.",
      hint: "Make a list of copies, `[text] * times`, and join it: `sep.join(...)`.",
      solution: "def repeat(text, times=2, sep=\" \"):\n    return sep.join([text] * times)",
      tests: [
        ["repeat(\"hi\")", "repeat(\"hi\") == \"hi hi\""],
        ["repeat(\"ha\", 3)", "repeat(\"ha\", 3) == \"ha ha ha\""],
        ["repeat(\"go\", 3, \"-\")", "repeat(\"go\", 3, \"-\") == \"go-go-go\""],
      ],
    }),
    task("medium", "Too long?", {
      prompt: "Define `is_long(word, limit=5)` that returns whether `word` has more than `limit` letters.",
      hint: "`return len(word) > limit`.",
      solution: "def is_long(word, limit=5):\n    return len(word) > limit",
      tests: [
        ["is_long(\"banana\")", "is_long(\"banana\") is True"],
        ["is_long(\"fig\")", "is_long(\"fig\") is False"],
        ["is_long(\"fig\", 2)", "is_long(\"fig\", 2) is True"],
      ],
    }),
    task("hard", "The shared basket", {
      prompt: "Each call should start with a new, empty basket, but the items pile up from call to call. Fix it with the `None` pattern.",
      starter: "def add_item(item, basket=[]):\n    basket.append(item)\n    return basket\n",
      hint: "Change the default to `basket=None`, then `if basket is None: basket = []` at the start of the body.",
      solution: "def add_item(item, basket=None):\n    if basket is None:\n        basket = []\n    basket.append(item)\n    return basket",
      tests: [
        ["First call", "add_item(\"apple\") == [\"apple\"]"],
        ["Second call starts fresh", "add_item(\"pear\") == [\"pear\"]"],
        ["A basket you pass in is used", "add_item(\"kiwi\", [\"fig\"]) == [\"fig\", \"kiwi\"]"],
      ],
    }),
    task("hard", "Shipping", {
      prompt: "Define `shipping(weight, express=False)`: up to 1 kg costs 5, up to 5 kg costs 10, heavier costs 20, and express doubles it.",
      hint: "Work out the cost with `if`/`elif`/`else`, then `if express: cost *= 2`, then return it.",
      solution: "def shipping(weight, express=False):\n    if weight <= 1:\n        cost = 5\n    elif weight <= 5:\n        cost = 10\n    else:\n        cost = 20\n    if express:\n        cost *= 2\n    return cost",
      tests: [
        ["shipping(0.5)", "shipping(0.5) == 5"],
        ["shipping(3)", "shipping(3) == 10"],
        ["shipping(3, True)", "shipping(3, True) == 20"],
        ["shipping(8, True)", "shipping(8, True) == 40"],
      ],
    }),
    task("expert", "Keep a tally", {
      prompt: "Define `tally(words, counts=None)` that adds each word's count to `counts` and returns it. With no `counts` given, start a new dict each call.",
      hint: "Use the `None` pattern for the dict, then `counts[w] = counts.get(w, 0) + 1` for each word.",
      solution: "def tally(words, counts=None):\n    if counts is None:\n        counts = {}\n    for w in words:\n        counts[w] = counts.get(w, 0) + 1\n    return counts",
      tests: [
        ["A new tally", "tally([\"a\", \"b\", \"a\"]) == {\"a\": 2, \"b\": 1}"],
        ["Each call starts fresh", "tally([\"c\"]) == {\"c\": 1}"],
        ["Adds to a tally you pass in", "tally([\"a\"], {\"a\": 5}) == {\"a\": 6}"],
      ],
    }),
    task("expert", "Round them all", {
      prompt: "Define `round_all(numbers, places=1)` that returns a new list with every number rounded to `places` decimals.",
      hint: "A list comprehension: `[round(n, places) for n in numbers]`.",
      solution: "def round_all(numbers, places=1):\n    return [round(n, places) for n in numbers]",
      tests: [
        ["round_all([1.24, 3.86])", "round_all([1.24, 3.86]) == [1.2, 3.9]"],
        ["round_all([3.14159], 3)", "round_all([3.14159], 3) == [3.142]"],
        ["round_all([2.7, 1.2], 0)", "round_all([2.7, 1.2], 0) == [3.0, 1.0]"],
      ],
    }),
  ],
  questions: [
    mc("In `def greet(name, greeting=\"Hello\"):`, which parameter is optional?", ["`name`", "`greeting`", "Both", "Neither"], 1, "A parameter with a default value can be left out of the call."),
    mc("With `def greet(name, greeting=\"Hello\"):`, what does `greet(\"Ana\")` use for `greeting`?", ["Nothing: it raises an error", "`None`", "The default, `\"Hello\"`", "An empty string"], 2, "When an argument is left out, the parameter takes its default."),
    mc("Why is `def f(a=1, b):` a `SyntaxError`?", ["Parameters with defaults must come after the required ones", "Defaults must be strings", "A function can't have two parameters", "`b` is a reserved word"], 0, "Required parameters come first, so positional arguments can't skip over a default."),
    mc("When is a default value created?", ["On every call", "Never", "When the program ends", "Once, when the `def` line runs"], 3, "The default is made once when the function is defined, not again on every call."),
    mc("Why is the default in `def add_item(item, basket=[]):` a trap?", ["Lists can't be defaults", "The same list is shared by every call, so items pile up", "It makes the function slower", "It is a `SyntaxError`"], 1, "A mutable default like a list is created once and shared by every call that uses it."),
    mc("What is the usual fix for a list default?", ["A tuple default", "A global list", "`basket=None`, then make a new list inside", "No default at all"], 2, "With `if basket is None: basket = []` inside the function, every call gets a new list of its own."),
    mc("Which built-in has an optional argument?", ["`round`, as in `round(x, 2)`", "`len`", "`type`", "`input`, which needs one"], 0, "`round`'s second argument (the number of decimals) is optional; without it you get a whole number."),
    mc("How can defaults help when you change a function?", ["They make it run faster", "They hide errors", "They make every parameter required", "Old calls keep working while new calls pass the new argument"], 3, "Adding a parameter with a default keeps old calls working."),
    mc("With `def f(a, b=2, c=3)`, what is `c` after `f(1, 5)`?", ["`5`", "`3`", "`1`", "`2`"], 1, "`b` takes the 5, and `c` keeps its default, 3."),
  ],
})
