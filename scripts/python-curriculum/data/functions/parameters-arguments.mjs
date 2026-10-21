// Functions topic: Parameters and arguments. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "parameters_arguments",
  title: "Parameters and arguments",
  paragraphs: [
    "A function that always does exactly the same thing is useful, but one you can hand information to is far more useful. Put names inside the brackets of the `def` line: these are **parameters**, placeholders for the values the function will be given.",
    "```\ndef greet(name):\n    print(f\"Hello, {name}!\")\n\ngreet(\"Ana\")    # Hello, Ana!\ngreet(\"Ben\")    # Hello, Ben!\n```",
    "The values you pass in a call are **arguments**. When `greet(\"Ana\")` runs, Python sets the parameter `name` to `\"Ana\"` and then runs the body. The next call starts fresh with its own value. An argument can be any expression: a variable, a calculation, the result of another call, such as `greet(user.title())`.",
    "A function can take several parameters, separated by commas. Arguments are matched to parameters **by position**: the first argument goes to the first parameter, the second to the second, and so on. Swap them and the function still runs, just with the values in the wrong places:",
    "```\ndef describe_pet(name, animal):\n    print(f\"{name} is a {animal}.\")\n\ndescribe_pet(\"Rex\", \"dog\")    # Rex is a dog.\ndescribe_pet(\"dog\", \"Rex\")    # dog is a Rex.\n```",
    "The number of arguments has to match. Leave one out and Python stops with `TypeError: describe_pet() missing 1 required positional argument: 'animal'`; pass too many and it says it \"takes 2 positional arguments but 3 were given\". Both messages tell you exactly what's wrong.",
    "Parameters only exist **inside** the function: they're created fresh for each call and vanish when it ends. A parameter can share its name with a variable outside, but they are separate; the scope lesson later in this section explains why.",
    "Parameters turn a function into a reusable tool. `draw_line(char, length)` can draw any line you want, and a single `print_receipt(item, price, qty)` serves every item in a shop.",
  ],
  sandboxCode: "def describe_pet(name, animal):\n    print(f\"{name} is a {animal}.\")\n\ndescribe_pet(\"Rex\", \"dog\")\ndescribe_pet(\"Tom\", \"cat\")\n\ndef draw_line(char, length):\n    print(char * length)\n\ndraw_line(\"=\", 12)\ndraw_line(\"~\", 6)",
  sandboxSnippets: [
    snippet("One parameter", "def shout(word):\n    print(word.upper() + \"!\")\n\nshout(\"hello\")\nshout(\"python\")"),
    snippet("Two parameters", "def show_price(item, price):\n    print(f\"{item}: ${price:.2f}\")\n\nshow_price(\"Tea\", 2.5)\nshow_price(\"Cake\", 3.75)"),
    snippet("Order matters", "def divide(a, b):\n    print(a / b)\n\ndivide(10, 2)\ndivide(2, 10)"),
    snippet("A missing argument", "def area(width, height):\n    print(width * height)\n\narea(3)"),
    snippet("Arguments can be expressions", "def square(n):\n    print(n * n)\n\nx = 4\nsquare(x)\nsquare(x + 1)\nsquare(len(\"hello\"))"),
  ],
  readMore: { label: "Python tutorial: defining functions", url: "https://docs.python.org/3/tutorial/controlflow.html#defining-functions", source: "Python docs" },
  challenges: [
    task("easy", "Greet anyone", {
      prompt: "Define `greet(name)` so that `greet(\"Ana\")` prints `Hello, Ana!`.",
      hint: "`def greet(name):` and `print(f\"Hello, {name}!\")` inside.",
      solution: "def greet(name):\n    print(f\"Hello, {name}!\")",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\n",
      tests: [
        ["greet(\"Ana\")", "_out(greet, \"Ana\") == \"Hello, Ana!\\n\""],
        ["greet(\"Ben\")", "_out(greet, \"Ben\") == \"Hello, Ben!\\n\""],
      ],
    }),
    task("easy", "Pass an argument", {
      prompt: "Call `welcome` so that it prints `Welcome, Sam!`.",
      starter: "def welcome(name):\n    print(f\"Welcome, {name}!\")\n\n",
      hint: "Put the name in the brackets, in quotes: `welcome(\"Sam\")`.",
      solution: "def welcome(name):\n    print(f\"Welcome, {name}!\")\n\nwelcome(\"Sam\")",
      tests: [
        ["Prints the welcome", "_cq_stdout.strip() == \"Welcome, Sam!\""],
      ],
    }),
    task("easy", "Two parameters", {
      prompt: "Define `show_price(item, price)` so that `show_price(\"Tea\", 2.5)` prints `Tea: $2.50`.",
      hint: "Two parameters, separated by a comma. Format the price with `:.2f`.",
      solution: "def show_price(item, price):\n    print(f\"{item}: ${price:.2f}\")",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\n",
      tests: [
        ["show_price(\"Tea\", 2.5)", "_out(show_price, \"Tea\", 2.5) == \"Tea: $2.50\\n\""],
        ["show_price(\"Cake\", 3.75)", "_out(show_price, \"Cake\", 3.75) == \"Cake: $3.75\\n\""],
      ],
    }),
    task("medium", "The missing argument", {
      prompt: "This fails with `TypeError: area() missing 1 required positional argument`. Fix the call so it prints `12` (a 3 by 4 rectangle).",
      starter: "def area(width, height):\n    print(width * height)\n\narea(3)\n",
      hint: "The function needs two arguments: `area(3, 4)`.",
      solution: "def area(width, height):\n    print(width * height)\n\narea(3, 4)",
      tests: [
        ["Prints 12", "_cq_stdout.strip() == \"12\""],
      ],
    }),
    task("medium", "The wrong way round", {
      prompt: "This prints `dog is a Rex.` Fix the call, not the function, so it prints `Rex is a dog.`",
      starter: "def describe_pet(name, animal):\n    print(f\"{name} is a {animal}.\")\n\ndescribe_pet(\"dog\", \"Rex\")\n",
      hint: "Arguments match parameters by position: the name comes first.",
      solution: "def describe_pet(name, animal):\n    print(f\"{name} is a {animal}.\")\n\ndescribe_pet(\"Rex\", \"dog\")",
      tests: [
        ["Prints Rex is a dog.", "_cq_stdout.strip() == \"Rex is a dog.\""],
      ],
    }),
    task("medium", "Draw a line", {
      prompt: "Define `draw_line(char, length)` that prints `char` repeated `length` times.",
      hint: "`print(char * length)`.",
      solution: "def draw_line(char, length):\n    print(char * length)",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\n",
      tests: [
        ["draw_line(\"=\", 5)", "_out(draw_line, \"=\", 5) == \"=====\\n\""],
        ["draw_line(\"*\", 3)", "_out(draw_line, \"*\", 3) == \"***\\n\""],
      ],
    }),
    task("hard", "Countdown", {
      prompt: "Define `countdown(n)` that prints the numbers from `n` down to 1, one per line, and then `Go!`.",
      hint: "A loop over `range(n, 0, -1)` inside the function, then `print(\"Go!\")` after the loop.",
      solution: "def countdown(n):\n    for i in range(n, 0, -1):\n        print(i)\n    print(\"Go!\")",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\n",
      tests: [
        ["countdown(3)", "_out(countdown, 3) == \"3\\n2\\n1\\nGo!\\n\""],
        ["countdown(1)", "_out(countdown, 1) == \"1\\nGo!\\n\""],
      ],
    }),
    task("hard", "Times table", {
      prompt: "Define `times_table(n)` that prints `n x 1 = ...` up to `n x 5 = ...`.",
      hint: "Loop `i` over `range(1, 6)` and print `f\"{n} x {i} = {n * i}\"`.",
      solution: "def times_table(n):\n    for i in range(1, 6):\n        print(f\"{n} x {i} = {n * i}\")",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\n",
      tests: [
        ["times_table(3)", "_out(times_table, 3).splitlines() == [\"3 x 1 = 3\", \"3 x 2 = 6\", \"3 x 3 = 9\", \"3 x 4 = 12\", \"3 x 5 = 15\"]"],
        ["times_table(7) ends right", "_out(times_table, 7).splitlines()[-1] == \"7 x 5 = 35\""],
      ],
    }),
    task("expert", "A box around text", {
      prompt: "Define `box(text)` that prints `text` in a box that fits it, with one space either side:\n\n```\n+------+\n| Tea! |\n+------+\n```",
      hint: "The border is `\"+\" + \"-\" * (len(text) + 2) + \"+\"`. The middle line is `f\"| {text} |\"`.",
      solution: "def box(text):\n    border = \"+\" + \"-\" * (len(text) + 2) + \"+\"\n    print(border)\n    print(f\"| {text} |\")\n    print(border)",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\n",
      tests: [
        ["box(\"Tea!\")", "_out(box, \"Tea!\").splitlines() == [\"+------+\", \"| Tea! |\", \"+------+\"]"],
        ["box(\"CodeQuest\")", "_out(box, \"CodeQuest\").splitlines() == [\"+-----------+\", \"| CodeQuest |\", \"+-----------+\"]"],
      ],
    }),
    task("expert", "A titled list", {
      prompt: "Define `show_list(title, items)` that prints the title, then each item numbered from 1, like `1. eggs`.",
      hint: "Print the title first, then loop with `enumerate(items, start=1)`.",
      solution: "def show_list(title, items):\n    print(title)\n    for number, item in enumerate(items, start=1):\n        print(f\"{number}. {item}\")",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\n",
      tests: [
        ["A shopping list", "_out(show_list, \"Shopping\", [\"eggs\", \"milk\"]).splitlines() == [\"Shopping\", \"1. eggs\", \"2. milk\"]"],
        ["An empty list prints just the title", "_out(show_list, \"Nothing\", []) == \"Nothing\\n\""],
      ],
    }),
  ],
  questions: [
    mc("In `def greet(name):`, what is `name`?", ["An argument", "A parameter", "A keyword", "A return value"], 1),
    mc("In `greet(\"Ana\")`, what is `\"Ana\"`?", ["A parameter", "The function name", "An argument", "A variable"], 2),
    mc("How are arguments matched to parameters by default?", ["By position: first to first, second to second", "By name", "Alphabetically", "At random"], 0),
    mc("What happens when you leave out a required argument?", ["The parameter becomes 0", "Nothing", "The parameter becomes `None`", "A `TypeError` says which argument is missing"], 3),
    qShort("`def add(a, b): print(a + b)`. What does `add(2, 3)` print? (a number)", "5"),
    mc("Can an argument be a calculation, like `square(x + 1)`?", ["No, only variables", "Yes, it is worked out first and the result is passed", "Only for numbers", "Only with brackets"], 1),
    mc("Where does a parameter exist?", ["Only inside the function, during a call", "Everywhere in the program", "Only before the function is called", "In the next function"], 0),
    mc("`def f(a, b): print(a - b)`. What does `f(2, 10)` print?", ["`8`", "`2`", "`-8`", "`12`"], 2),
    mc("Why does `describe_pet(\"dog\", \"Rex\")` print `dog is a Rex.`?\n\n```\ndef describe_pet(name, animal):\n    print(f\"{name} is a {animal}.\")\n```", ["Strings can't be passed", "The function is broken", "Python sorts the arguments", "The arguments are in the wrong positions"], 3),
    mc("How many parameters can a function have?", ["As many as it needs", "One", "Two", "Ten"], 0),
  ],
})
