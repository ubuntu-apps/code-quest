// Functions topic: Keyword arguments. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "keyword_arguments",
  title: "Keyword arguments",
  paragraphs: [
    "Arguments don't have to be matched by position. You can also name them in the call, `parameter=value`. These are **keyword arguments**, and with them the order no longer matters:",
    "```\ndef make_tea(milk, sugar):\n    return f\"Tea, milk: {milk}, sugars: {sugar}\"\n\nprint(make_tea(True, 2))\nprint(make_tea(sugar=2, milk=True))   # the same, and clearer\n```",
    "Keyword arguments make calls easier to read. `book_room(3, True, False)` leaves you guessing; `book_room(nights=3, breakfast=True, parking=False)` doesn't. You've used them already: `print(..., sep=\"-\", end=\"\")`, `sorted(words, key=len, reverse=True)`, `enumerate(items, start=1)`.",
    "You can mix both kinds in one call, but positional arguments must come first: `greet(\"Ana\", greeting=\"Hi\")` is fine, while `greet(greeting=\"Hi\", \"Ana\")` is a `SyntaxError` (positional argument follows keyword argument).",
    "Each parameter gets one value. Passing the same one by position **and** by name, as in `area(3, width=4)` when `width` is the first parameter, fails with `TypeError: area() got multiple values for argument 'width'`. A misspelt name fails too: `got an unexpected keyword argument 'widht'`.",
    "Keyword arguments pair naturally with defaults: a function can have many optional settings, and a caller names just the ones they want to change, in any order, skipping the rest.",
    "A `*` on its own in the parameter list makes every parameter after it **keyword-only**: callers have to name it. That's useful for flags and options that would be confusing as a bare `True` or a number:",
    "```\ndef ticket(destination, *, seat=\"any\", first_class=False):\n    kind = \"first class\" if first_class else \"standard\"\n    return f\"{destination}, seat {seat}, {kind}\"\n\nprint(ticket(\"Oslo\", seat=\"12A\"))\nprint(ticket(\"Oslo\", first_class=True))\n# ticket(\"Oslo\", \"12A\") is a TypeError: seat must be named\n```",
  ],
  sandboxCode: "def make_tea(milk, sugar):\n    return f\"Tea, milk: {milk}, sugars: {sugar}\"\n\nprint(make_tea(True, 2))\nprint(make_tea(sugar=2, milk=True))\n\ndef ticket(destination, *, seat=\"any\", first_class=False):\n    kind = \"first class\" if first_class else \"standard\"\n    return f\"{destination}, seat {seat}, {kind}\"\n\nprint(ticket(\"Oslo\", seat=\"12A\"))",
  sandboxSnippets: [
    snippet("Name the arguments", "def describe(name, age, city):\n    return f\"{name}, {age}, from {city}\"\n\nprint(describe(city=\"Oslo\", name=\"Ana\", age=30))"),
    snippet("Built-ins take keywords too", "words = [\"fig\", \"banana\", \"kiwi\"]\nprint(sorted(words, key=len, reverse=True))\nprint(\"a\", \"b\", \"c\", sep=\"-\", end=\"!\\n\")"),
    snippet("Positional first", "def greet(name, greeting=\"Hello\"):\n    return f\"{greeting}, {name}!\"\n\nprint(greet(\"Ana\", greeting=\"Hi\"))"),
    snippet("Multiple values", "def area(width, height):\n    return width * height\n\nprint(area(3, width=4))"),
    snippet("Keyword-only", "def ticket(destination, *, seat=\"any\"):\n    return f\"{destination}, seat {seat}\"\n\nprint(ticket(\"Oslo\", seat=\"12A\"))\nprint(ticket(\"Oslo\", \"12A\"))"),
  ],
  readMore: { label: "Python tutorial: keyword arguments", url: "https://docs.python.org/3/tutorial/controlflow.html#keyword-arguments", source: "Python docs" },
  challenges: [
    task("easy", "Name them", {
      prompt: "Set `order` by calling `make_tea` with `sugar=2` and `milk=True`, both as keyword arguments.",
      starter: "def make_tea(milk, sugar):\n    return f\"Tea, milk: {milk}, sugars: {sugar}\"\n\n",
      hint: "`order = make_tea(sugar=2, milk=True)`: with names, the order doesn't matter.",
      solution: "def make_tea(milk, sugar):\n    return f\"Tea, milk: {milk}, sugars: {sugar}\"\n\norder = make_tea(sugar=2, milk=True)",
      tests: [
        ["order is right", "order == \"Tea, milk: True, sugars: 2\""],
      ],
    }),
    task("easy", "A date with sep", {
      prompt: "Print the parts of the date as `17/10/2026`, using the `sep` keyword argument of `print`.",
      starter: "day, month, year = 17, 10, 2026\n",
      hint: "`print(day, month, year, sep=\"/\")`.",
      solution: "day, month, year = 17, 10, 2026\nprint(day, month, year, sep=\"/\")",
      tests: [
        ["Prints 17/10/2026", "_cq_stdout.strip() == \"17/10/2026\""],
      ],
    }),
    task("easy", "High to low", {
      prompt: "Set `ranked` to `scores` sorted from high to low, with the `reverse` keyword argument.",
      starter: "scores = [72, 95, 88, 61]\n",
      hint: "`sorted(scores, reverse=True)`.",
      solution: "scores = [72, 95, 88, 61]\nranked = sorted(scores, reverse=True)",
      tests: [
        ["ranked is right", "ranked == [95, 88, 72, 61]"],
      ],
    }),
    task("medium", "Positional first", {
      prompt: "This line is a `SyntaxError`. Fix the call so `info` is `Dune by Frank Herbert`.",
      starter: "def book(title, author):\n    return f\"{title} by {author}\"\n\ninfo = book(title=\"Dune\", \"Frank Herbert\")\n",
      hint: "Positional arguments must come before keyword ones. Name both, or pass both by position.",
      solution: "def book(title, author):\n    return f\"{title} by {author}\"\n\ninfo = book(title=\"Dune\", author=\"Frank Herbert\")",
      tests: [
        ["info is right", "info == \"Dune by Frank Herbert\""],
      ],
    }),
    task("medium", "Any order", {
      prompt: "Set `text` by calling `describe` with keyword arguments in this order: city `Oslo`, name `Ana`, age `30`.",
      starter: "def describe(name, age, city):\n    return f\"{name}, {age}, from {city}\"\n\n",
      hint: "`describe(city=\"Oslo\", name=\"Ana\", age=30)`.",
      solution: "def describe(name, age, city):\n    return f\"{name}, {age}, from {city}\"\n\ntext = describe(city=\"Oslo\", name=\"Ana\", age=30)",
      tests: [
        ["text is right", "text == \"Ana, 30, from Oslo\""],
      ],
    }),
    task("medium", "Name that seat", {
      prompt: "Define `ticket(destination, *, seat=\"any\")` that returns `Oslo, seat 12A` for `ticket(\"Oslo\", seat=\"12A\")`. The `*` makes `seat` keyword-only.",
      hint: "Put `*` between the parameters: `def ticket(destination, *, seat=\"any\"):`, and return an f-string.",
      solution: "def ticket(destination, *, seat=\"any\"):\n    return f\"{destination}, seat {seat}\"",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\n",
      tests: [
        ["ticket(\"Oslo\", seat=\"12A\")", "ticket(\"Oslo\", seat=\"12A\") == \"Oslo, seat 12A\""],
        ["ticket(\"Rome\")", "ticket(\"Rome\") == \"Rome, seat any\""],
        ["seat can't be passed by position", "_raises(ticket, \"Oslo\", \"12A\") == \"TypeError\""],
      ],
    }),
    task("hard", "A profile", {
      prompt: "Define `make_profile(name, *, age=None, city=None)` that returns a dict with `name` and only the other details that were given.",
      hint: "Start with `profile = {\"name\": name}`, add `age` and `city` only `if` they are not `None`, then return it.",
      solution: "def make_profile(name, *, age=None, city=None):\n    profile = {\"name\": name}\n    if age is not None:\n        profile[\"age\"] = age\n    if city is not None:\n        profile[\"city\"] = city\n    return profile",
      tests: [
        ["Just a name", "make_profile(\"Ana\") == {\"name\": \"Ana\"}"],
        ["With a city", "make_profile(\"Ben\", city=\"Oslo\") == {\"name\": \"Ben\", \"city\": \"Oslo\"}"],
        ["With both", "make_profile(\"Cleo\", age=41, city=\"Rome\") == {\"name\": \"Cleo\", \"age\": 41, \"city\": \"Rome\"}"],
      ],
    }),
    task("hard", "Longest first", {
      prompt: "Set `by_length` to `words` sorted from longest to shortest, using two keyword arguments of `sorted`.",
      starter: "words = [\"fig\", \"banana\", \"kiwi\", \"cherry\"]\n",
      hint: "`sorted(words, key=len, reverse=True)`. Words of equal length keep their order.",
      solution: "words = [\"fig\", \"banana\", \"kiwi\", \"cherry\"]\nby_length = sorted(words, key=len, reverse=True)",
      tests: [
        ["by_length is right", "by_length == [\"banana\", \"cherry\", \"kiwi\", \"fig\"]"],
      ],
    }),
    task("expert", "Name options", {
      prompt: "Define `format_name(first, last, *, upper=False, initials=False)`: `Ana Lima` normally, `A. L.` with `initials=True`, and capitals with `upper=True` (the options can combine).",
      hint: "Build the text first (full name, or `f\"{first[0]}. {last[0]}.\"`), then `if upper:` make it `.upper()`, and return it.",
      solution: "def format_name(first, last, *, upper=False, initials=False):\n    if initials:\n        text = f\"{first[0]}. {last[0]}.\"\n    else:\n        text = f\"{first} {last}\"\n    if upper:\n        text = text.upper()\n    return text",
      tests: [
        ["Plain", "format_name(\"Ana\", \"Lima\") == \"Ana Lima\""],
        ["Initials", "format_name(\"Ana\", \"Lima\", initials=True) == \"A. L.\""],
        ["Capitals", "format_name(\"Ana\", \"Lima\", upper=True) == \"ANA LIMA\""],
        ["Both", "format_name(\"ana\", \"lima\", upper=True, initials=True) == \"A. L.\""],
      ],
    }),
    task("expert", "Multiple values", {
      prompt: "This fails with `TypeError: area() got multiple values for argument 'width'`. Fix the call so `result` is the area of a rectangle 4 wide and 3 high.",
      starter: "def area(width, height):\n    return width * height\n\nresult = area(3, width=4)\n",
      hint: "The `3` already went to `width` by position. Name both: `area(width=4, height=3)`.",
      solution: "def area(width, height):\n    return width * height\n\nresult = area(width=4, height=3)",
      tests: [
        ["result is 12", "result == 12"],
      ],
    }),
  ],
  questions: [
    mc("What is a keyword argument?", ["An argument passed by name, like `sep=\"-\"`", "A reserved word", "The first argument", "An argument that is a string"], 0),
    mc("Does the order of keyword arguments matter?", ["Yes, always", "Only for numbers", "No, each one is matched by its name", "Only in `print`"], 2),
    mc("Why is `greet(greeting=\"Hi\", \"Ana\")` a `SyntaxError`?", ["`greeting` is misspelt", "Strings can't be keywords", "It has too many arguments", "A positional argument comes after a keyword argument"], 3),
    mc("`def area(width, height)`. What does `area(3, width=4)` do?", ["Returns 12", "Raises a `TypeError`: multiple values for `width`", "Returns 7", "Ignores the 3"], 1),
    mc("What does the lone `*` in `def f(a, *, b):` do?", ["Multiplies `a` by `b`", "Makes `b` optional", "Makes `b` keyword-only: it must be passed by name", "Collects extra arguments"], 2),
    qShort("`def f(a, *, b): return a - b`. What is `f(10, b=3)`? (a number)", "7"),
    mc("Why make a flag like `express` keyword-only?", ["It runs faster", "Python requires it", "So calls say `express=True` instead of a puzzling bare `True`", "So it can't have a default"], 2),
    mc("What does `area(widht=4, height=3)` raise?", ["Nothing, it guesses", "A `NameError`", "A `SyntaxError`", "A `TypeError` about an unexpected keyword argument"], 3),
    mc("`def f(a, b=2, c=3)`. Which call sets only `c`?", ["`f(1, 5)`", "`f(1, c=5)`", "`f(c=5)`", "`f(1, 2)`"], 1),
    mc("Why do keyword arguments help readers?", ["The call says what each value means", "They hide the values", "They shorten the function", "They make code run faster"], 0),
  ],
})
