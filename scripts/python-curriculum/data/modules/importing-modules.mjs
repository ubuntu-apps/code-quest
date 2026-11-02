// Modules and packages topic: Importing modules. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "import_statements",
  title: "Importing modules",
  paragraphs: [
    "You've already met `import math`. A **module** is a file of Python code (functions, variables, classes) that other programs can use. Python comes with hundreds of them, called the **standard library**, and later in this quest you'll write your own. Importing a module lets you use its code without copying it into your program.",
    "```\nimport math\n\nprint(math.sqrt(16))   # 4.0\nprint(math.pi)         # 3.141592653589793\n```",
    "`import math` creates one name in your program, `math`, and everything inside the module is reached with a dot: `math.sqrt`, `math.pi`. The dot keeps the module's names apart from yours, so your own variable called `floor` can't clash with `math.floor`. Imports go at the top of the file, so a reader sees at once what the program depends on.",
    "When you only need a few names, `from ... import ...` brings them straight into your program. The code gets shorter, but the reminder of where each name came from is gone, so it's best for a handful of well-known names.",
    "```\nfrom math import sqrt, pi\n\nprint(sqrt(25))         # 5.0\nprint(round(pi, 2))     # 3.14\n```",
    "`as` gives a module, or a name from it, a different name. It's handy for long names, and some libraries have names everyone uses: `import numpy as np`, `import pandas as pd`.",
    "```\nimport statistics as stats\nfrom math import factorial as fact\n\nprint(stats.mean([2, 4, 9]))   # 5\nprint(fact(5))                 # 120\n```",
    "There's also `from math import *`, which imports every public name. Avoid it: a reader can't tell where a name came from, and it can silently replace names you already have. Here it overwrites a variable without any warning:",
    "```\ne = \"east\"\nfrom math import *\nprint(e)   # 2.718281828459045: math.e replaced it\n```",
    "A module is an object like any other. `dir(math)` lists the names inside it, and `math.__name__` is its name. Python loads each module once per program; importing it again just hands back the copy it already loaded, so imports are cheap. When the module's name is only known while the program runs, `importlib.import_module(\"math\")` imports it from a string.",
    "A misspelled module raises `ModuleNotFoundError: No module named 'maths'`. A name the module doesn't have raises `ImportError: cannot import name ...` with `from ... import`, or `AttributeError: module 'math' has no attribute ...` with the dot.",
  ],
  sandboxCode: "import math\nfrom statistics import mean, median\nimport random as rnd\n\nprint(math.ceil(4.2), math.floor(4.8))\nprint(mean([3, 5, 10]), median([3, 5, 10]))\nprint(rnd.randint(1, 6))",
  sandboxSnippets: [
    snippet("Dot access", "import math\nprint(math.sqrt(81), math.pi)"),
    snippet("from ... import", "from math import floor, ceil\nprint(floor(2.7), ceil(2.1))"),
    snippet("An alias", "import statistics as stats\nprint(stats.median([7, 1, 4]))"),
    snippet("What is inside?", "import math\nprint([name for name in dir(math) if name.startswith(\"is\")])"),
  ],
  readMore: { label: "Python tutorial: Modules", url: "https://docs.python.org/3/tutorial/modules.html", source: "Python docs" },
  challenges: [
    task("easy", "Square root", {
      prompt: "Import the `math` module and set `root` to the square root of 144 using `math.sqrt`.",
      starter: "root = 0\n",
      hint: "Write `import math` at the top, then `root = math.sqrt(144)`.",
      solution: "import math\n\nroot = math.sqrt(144)",
      tests: [
        ["math is imported", "type(math).__name__ == \"module\""],
        ["root is 12.0", "root == 12.0"],
      ],
    }),
    task("easy", "Just two names", {
      prompt: "Import only `pi` and `floor` from `math` (not the whole module), and set `area` to `floor(pi * 10 ** 2)`.",
      hint: "`from math import pi, floor`, then use them without `math.`.",
      solution: "from math import pi, floor\n\narea = floor(pi * 10 ** 2)",
      tests: [
        ["area is 314", "area == 314"],
        ["pi and floor came from math", "pi == __import__(\"math\").pi and floor is __import__(\"math\").floor"],
        ["The name math is not used", "\"math\" not in globals()"],
      ],
    }),
    task("easy", "A short name", {
      prompt: "Import `statistics` with the short name `stats`, and set `middle` to the median of `scores`.",
      starter: "scores = [72, 95, 64, 88, 80]\n",
      hint: "`import statistics as stats`, then `stats.median(scores)`.",
      solution: "import statistics as stats\n\nscores = [72, 95, 64, 88, 80]\nmiddle = stats.median(scores)",
      tests: [
        ["stats is the statistics module", "stats is __import__(\"statistics\")"],
        ["middle is 80", "middle == 80"],
      ],
    }),
    task("medium", "Fix the import", {
      prompt: "This crashes with `ModuleNotFoundError`. Fix it so `big` is 10 factorial.",
      starter: "import Math\n\nbig = Math.factorial(10)\n",
      hint: "Module names are case-sensitive: the module is `math`, all lowercase.",
      solution: "import math\n\nbig = math.factorial(10)",
      tests: [
        ["big is 3628800", "big == 3628800"],
      ],
    }),
    task("medium", "Two modules", {
      prompt: "Import `math` and `statistics`. Set `side` to the long side of a right triangle with sides 3 and 4 (`math.hypot`), and `avg` to the mean of `[2, 4, 9]`.",
      hint: "One line `import math, statistics` or two `import` lines both work.",
      solution: "import math\nimport statistics\n\nside = math.hypot(3, 4)\navg = statistics.mean([2, 4, 9])",
      tests: [
        ["side is 5.0", "side == 5.0"],
        ["avg is 5", "avg == 5"],
        ["Both modules imported", "math is __import__(\"math\") and statistics is __import__(\"statistics\")"],
      ],
    }),
    task("medium", "Name clash", {
      prompt: "The star import replaces `e`, so `direction` is a number. Change the import so `direction` stays `\"east\"` and `growth` still works.",
      starter: "e = \"east\"\nfrom math import *\n\ndirection = e\ngrowth = round(exp(2), 3)\n",
      hint: "Import only what you need, `from math import exp`, or use `import math` and `math.exp`.",
      solution: "e = \"east\"\nfrom math import exp\n\ndirection = e\ngrowth = round(exp(2), 3)",
      tests: [
        ["direction is \"east\"", "direction == \"east\""],
        ["growth is 7.389", "growth == 7.389"],
      ],
    }),
    task("hard", "Look inside", {
      prompt: "Use `dir()` to set `checks` to the list of names in `math` that start with `\"is\"`, in the order `dir` gives them.",
      starter: "import math\n",
      hint: "A comprehension over `dir(math)` with `if name.startswith(\"is\")`.",
      solution: "import math\n\nchecks = [name for name in dir(math) if name.startswith(\"is\")]",
      tests: [
        ["checks is right", "checks == [\"isclose\", \"isfinite\", \"isinf\", \"isnan\", \"isqrt\"]"],
      ],
    }),
    task("hard", "Describe a module", {
      prompt: "Define `describe(module)` that returns a sentence like `math has 60 public names`, counting the names from `dir(module)` that don't start with `_`.",
      hint: "Use `module.__name__` for the name and count with a comprehension.",
      solution: "def describe(module):\n    public = [name for name in dir(module) if not name.startswith(\"_\")]\n    return f\"{module.__name__} has {len(public)} public names\"",
      tests: [
        ["Describes math", "describe(__import__(\"math\")) == \"math has \" + str(len([n for n in dir(__import__(\"math\")) if not n.startswith(\"_\")])) + \" public names\""],
        ["Describes statistics", "describe(__import__(\"statistics\")).startswith(\"statistics has \")"],
      ],
    }),
    task("expert", "Import by name", {
      prompt: "Define `load(name)` that imports the module called `name` with `importlib.import_module` and returns it, or returns `None` if there is no such module.",
      starter: "import importlib\n",
      hint: "Call `importlib.import_module(name)` inside `try`, and `except ModuleNotFoundError: return None`.",
      solution: "import importlib\n\ndef load(name):\n    try:\n        return importlib.import_module(name)\n    except ModuleNotFoundError:\n        return None",
      tests: [
        ["Loads math", "load(\"math\") is __import__(\"math\")"],
        ["Loads json", "load(\"json\").dumps([1]) == \"[1]\""],
        ["A missing module", "load(\"no_such_module_here\") is None"],
      ],
    }),
    task("expert", "Look it up", {
      prompt: "Define `lookup(path)` that takes a dotted path like `\"math.sqrt\"` and returns that object: import the module before the last dot, then get the name after it.",
      starter: "import importlib\n",
      hint: "`module_name, _, name = path.rpartition(\".\")`, then `getattr(importlib.import_module(module_name), name)`.",
      solution: "import importlib\n\ndef lookup(path):\n    module_name, _, name = path.rpartition(\".\")\n    module = importlib.import_module(module_name)\n    return getattr(module, name)",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\n",
      tests: [
        ["math.sqrt", "lookup(\"math.sqrt\")(9) == 3.0"],
        ["statistics.mean", "lookup(\"statistics.mean\")([1, 2, 3]) == 2"],
        ["A missing name", "_raises(lookup, \"math.nothing\") == \"AttributeError\""],
      ],
    }),
  ],
  questions: [
    mc("After `import math`, how do you call its `sqrt`?", ["`sqrt(9)`", "`math.sqrt(9)`", "`math(sqrt, 9)`", "`import sqrt(9)`"], 1, "`import math` gives you the module, so its names are reached as `math.name`."),
    mc("What does `from math import pi` do?", ["Imports the whole module as `pi`", "Copies the file", "Makes the name `pi` available directly", "Nothing until you call it"], 2, "`from module import name` brings in that one name to use without the module prefix."),
    mc("What does `import statistics as stats` do?", ["Imports statistics under the name `stats`", "Imports a module called `stats`", "Renames the file", "Imports only `stats` from statistics"], 0, "`as` gives the module a shorter name in your file."),
    mc("Why avoid `from math import *`?", ["It is slower", "It only imports one name", "It is not allowed", "It hides where names came from and can overwrite yours"], 3, "A star import pulls in many unknown names, which makes the code harder to follow and can overwrite yours."),
    mc("What does `import maths` raise when there is no such module?", ["`ModuleNotFoundError`", "`NameError`", "`AttributeError`", "`SyntaxError`"], 0, "When Python can't find a module of that name, it raises `ModuleNotFoundError`."),
    mc("What happens if the same module is imported twice?", ["It runs twice", "Python reuses the copy it already loaded", "An error", "The second import is ignored and the name is deleted"], 1, "A module runs once, on its first import; later imports get the same module object."),
    mc("What does `dir(math)` give?", ["The folder math is in", "The math documentation", "A list of the names inside the module", "The module's size"], 2, "`dir` lists the names (functions, constants and so on) a module defines."),
    mc("Where do imports usually go?", ["At the bottom", "Inside each function", "In a separate file", "At the top of the file"], 3, "Imports at the top show at a glance everything the file depends on."),
    mc("Which imports a module whose name is in a string?", ["`importlib.import_module(\"math\")`", "`import \"math\"`", "`open(\"math\")`", "`dir(\"math\")`"], 0, "`importlib.import_module` takes the module's name as a string."),
  ],
})
