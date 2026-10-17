// Modules and packages topic: Writing your own modules. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "creating_modules",
  title: "Writing your own modules",
  paragraphs: [
    "Every `.py` file is a module. Put some functions in a file called `greetings.py`, and any other program in the same folder can `import greetings` and use them. The module's name is the file name without `.py`.",
    "```\n# greetings.py\ndef hello(name):\n    return f\"Hello, {name}!\"\n\nLANGUAGES = [\"en\", \"es\", \"fr\"]\n```",
    "```\n# main.py, in the same folder\nimport greetings\n\nprint(greetings.hello(\"Ana\"))   # Hello, Ana!\nprint(greetings.LANGUAGES)      # ['en', 'es', 'fr']\n```",
    "Splitting code into modules keeps each file short and about one thing, and lets several programs share the same code: fix a bug in `greetings.py` and every program that imports it gets the fix. A module name must work as a Python name, so `my_tools.py` is fine but `my-tools.py` can't be imported. Don't name your file after a standard module either: a `random.py` of your own would be imported instead of the real one.",
    "When Python imports a module, it runs the whole file from top to bottom, once. Every function and variable the file defines becomes part of the module. That means a `print` at the top level of a module runs during the import, which is why modules usually just **define** things and leave the doing to the program that imports them. Importing it a second time doesn't run it again: Python reuses the module it already loaded.",
    "You can try this here: the code below writes a module file, then imports it.",
    "```\nfrom pathlib import Path\n\nPath(\"shapes.py\").write_text(\"\"\"\nprint(\"shapes is loading\")\n\ndef square(side):\n    return side * side\n\"\"\")\n\nimport shapes          # shapes is loading\nimport shapes          # nothing: already loaded\nprint(shapes.square(4))   # 16\n```",
    "By convention, names in capitals (`MAX_PLAYERS = 4`) are constants that shouldn't change, and a name starting with an underscore (`_clean`) is a helper meant for use inside the module only. Python doesn't stop anyone using it, but `from module import *` skips it, and readers know to leave it alone.",
    "**How the checks work in this section:** in a real project you'd have two files, the module and the program that imports it. Here, your code is the module. The checks save it as a file, such as `greetings.py`, and import it the way another program would, then try what's inside. When a challenge gives you a module to use, it's already in the folder, ready to import.",
  ],
  sandboxCode: "from pathlib import Path\n\nPath(\"tools.py\").write_text(\"\"\"\nTAX = 0.2\n\ndef with_tax(price):\n    return round(price * (1 + TAX), 2)\n\"\"\")\n\nimport tools\nprint(tools.TAX)\nprint(tools.with_tax(10))",
  sandboxSnippets: [
    snippet("Write and import", "from pathlib import Path\nPath(\"hello_mod.py\").write_text(\"def hi():\\n    return 'hi there'\\n\")\nimport hello_mod\nprint(hello_mod.hi())"),
    snippet("Runs on import", "from pathlib import Path\nPath(\"noisy.py\").write_text(\"print('noisy runs now')\\nVALUE = 42\\n\")\nimport noisy\nprint(noisy.VALUE)"),
    snippet("from your module", "from pathlib import Path\nPath(\"units.py\").write_text(\"def km_to_miles(km):\\n    return km * 0.621371\\n\")\nfrom units import km_to_miles\nprint(round(km_to_miles(5), 2))"),
    snippet("A module is an object", "from pathlib import Path\nPath(\"box.py\").write_text(\"SIZE = 3\\n\")\nimport box\nprint(type(box), box.__name__, box.SIZE)"),
  ],
  readMore: { label: "Python tutorial: More on modules", url: "https://docs.python.org/3/tutorial/modules.html#more-on-modules", source: "Python docs" },
  challenges: [
    task("easy", "A greetings module", {
      prompt: "Your code is the module `greetings.py`. Define `hello(name)` that returns `Hello, <name>!`.",
      hint: "`def hello(name): return f\"Hello, {name}!\"`.",
      solution: "def hello(name):\n    return f\"Hello, {name}!\"",
      setup: "def _import_both(path):\n    import importlib as _il, sys as _sys, os as _os, io as _io, contextlib as _cl\n    folder = _os.path.dirname(path)\n    if folder:\n        _os.makedirs(folder, exist_ok=True)\n    with open(path, \"w\", encoding=\"utf-8\") as _f:\n        _f.write(_cq_source)\n    name = path[:-3].replace(\"/\", \".\")\n    if name.endswith(\".__init__\"):\n        name = name[:-9]\n    for _k in [k for k in _sys.modules if k == name or k.startswith(name + \".\")]:\n        del _sys.modules[_k]\n    _il.invalidate_caches()\n    import builtins as _bi\n    def _no_input(prompt=\"\"):\n        raise RuntimeError(\"input() ran while the module was being imported: put that code under the main guard\")\n    buf = _io.StringIO()\n    real_input = _bi.input\n    _bi.input = _no_input\n    try:\n        with _cl.redirect_stdout(buf):\n            mod = _il.import_module(name)\n    finally:\n        _bi.input = real_input\n    return mod, buf.getvalue()\ndef _module(path):\n    return _import_both(path)[0]\ndef _import_prints(path):\n    return _import_both(path)[1]\n",
      tests: [
        ["greetings.hello works", "_module(\"greetings.py\").hello(\"Ana\") == \"Hello, Ana!\""],
      ],
    }),
    task("easy", "Settings", {
      prompt: "Your code is the module `settings.py`. Give it two constants: `APP_NAME` set to `\"CodeQuest\"` and `MAX_PLAYERS` set to 4.",
      hint: "Just two assignments at the top level.",
      solution: "APP_NAME = \"CodeQuest\"\nMAX_PLAYERS = 4",
      setup: "def _import_both(path):\n    import importlib as _il, sys as _sys, os as _os, io as _io, contextlib as _cl\n    folder = _os.path.dirname(path)\n    if folder:\n        _os.makedirs(folder, exist_ok=True)\n    with open(path, \"w\", encoding=\"utf-8\") as _f:\n        _f.write(_cq_source)\n    name = path[:-3].replace(\"/\", \".\")\n    if name.endswith(\".__init__\"):\n        name = name[:-9]\n    for _k in [k for k in _sys.modules if k == name or k.startswith(name + \".\")]:\n        del _sys.modules[_k]\n    _il.invalidate_caches()\n    import builtins as _bi\n    def _no_input(prompt=\"\"):\n        raise RuntimeError(\"input() ran while the module was being imported: put that code under the main guard\")\n    buf = _io.StringIO()\n    real_input = _bi.input\n    _bi.input = _no_input\n    try:\n        with _cl.redirect_stdout(buf):\n            mod = _il.import_module(name)\n    finally:\n        _bi.input = real_input\n    return mod, buf.getvalue()\ndef _module(path):\n    return _import_both(path)[0]\ndef _import_prints(path):\n    return _import_both(path)[1]\n",
      tests: [
        ["settings.APP_NAME", "_module(\"settings.py\").APP_NAME == \"CodeQuest\""],
        ["settings.MAX_PLAYERS", "_module(\"settings.py\").MAX_PLAYERS == 4"],
      ],
    }),
    task("easy", "A shapes module", {
      prompt: "Your code is the module `shapes.py`. Define `square_area(side)` and `circle_area(radius)` (rounded to 2 places, using `math.pi`).",
      starter: "import math\n",
      hint: "The module can import `math` itself. `round(math.pi * radius ** 2, 2)`.",
      solution: "import math\n\ndef square_area(side):\n    return side * side\n\ndef circle_area(radius):\n    return round(math.pi * radius ** 2, 2)",
      setup: "def _import_both(path):\n    import importlib as _il, sys as _sys, os as _os, io as _io, contextlib as _cl\n    folder = _os.path.dirname(path)\n    if folder:\n        _os.makedirs(folder, exist_ok=True)\n    with open(path, \"w\", encoding=\"utf-8\") as _f:\n        _f.write(_cq_source)\n    name = path[:-3].replace(\"/\", \".\")\n    if name.endswith(\".__init__\"):\n        name = name[:-9]\n    for _k in [k for k in _sys.modules if k == name or k.startswith(name + \".\")]:\n        del _sys.modules[_k]\n    _il.invalidate_caches()\n    import builtins as _bi\n    def _no_input(prompt=\"\"):\n        raise RuntimeError(\"input() ran while the module was being imported: put that code under the main guard\")\n    buf = _io.StringIO()\n    real_input = _bi.input\n    _bi.input = _no_input\n    try:\n        with _cl.redirect_stdout(buf):\n            mod = _il.import_module(name)\n    finally:\n        _bi.input = real_input\n    return mod, buf.getvalue()\ndef _module(path):\n    return _import_both(path)[0]\ndef _import_prints(path):\n    return _import_both(path)[1]\n",
      tests: [
        ["square_area", "_module(\"shapes.py\").square_area(5) == 25"],
        ["circle_area", "_module(\"shapes.py\").circle_area(1) == 3.14"],
      ],
    }),
    task("medium", "A quiet import", {
      prompt: "Importing this `calc.py` prints things, which a module shouldn't do. Keep `add` and `subtract`, but make the import print nothing.",
      starter: "print(\"Loading calc...\")\n\ndef add(a, b):\n    return a + b\n\ndef subtract(a, b):\n    return a - b\n\nprint(add(2, 3))\n",
      hint: "Remove the top-level `print` lines; the functions stay.",
      solution: "def add(a, b):\n    return a + b\n\ndef subtract(a, b):\n    return a - b",
      setup: "def _import_both(path):\n    import importlib as _il, sys as _sys, os as _os, io as _io, contextlib as _cl\n    folder = _os.path.dirname(path)\n    if folder:\n        _os.makedirs(folder, exist_ok=True)\n    with open(path, \"w\", encoding=\"utf-8\") as _f:\n        _f.write(_cq_source)\n    name = path[:-3].replace(\"/\", \".\")\n    if name.endswith(\".__init__\"):\n        name = name[:-9]\n    for _k in [k for k in _sys.modules if k == name or k.startswith(name + \".\")]:\n        del _sys.modules[_k]\n    _il.invalidate_caches()\n    import builtins as _bi\n    def _no_input(prompt=\"\"):\n        raise RuntimeError(\"input() ran while the module was being imported: put that code under the main guard\")\n    buf = _io.StringIO()\n    real_input = _bi.input\n    _bi.input = _no_input\n    try:\n        with _cl.redirect_stdout(buf):\n            mod = _il.import_module(name)\n    finally:\n        _bi.input = real_input\n    return mod, buf.getvalue()\ndef _module(path):\n    return _import_both(path)[0]\ndef _import_prints(path):\n    return _import_both(path)[1]\n",
      tests: [
        ["Importing prints nothing", "_import_prints(\"calc.py\") == \"\""],
        ["The functions still work", "_module(\"calc.py\").add(2, 3) == 5 and _module(\"calc.py\").subtract(5, 2) == 3"],
      ],
    }),
    task("medium", "Use a module", {
      prompt: "The folder already has `prices.py`, with a function `price_of(item)`. Import it and set `total` to the price of 2 teas and 1 cake.",
      hint: "`import prices`, then `prices.price_of(\"tea\") * 2 + prices.price_of(\"cake\")`.",
      solution: "import prices\n\ntotal = prices.price_of(\"tea\") * 2 + prices.price_of(\"cake\")",
      setup: "import os as _os\nwith open('prices.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('PRICES = {\"tea\": 2.25, \"coffee\": 2.75, \"cake\": 4.0}\\n\\ndef price_of(item):\\n    return PRICES[item]\\n')\n",
      tests: [
        ["total is 8.5", "total == 8.5"],
        ["prices is imported", "type(prices).__name__ == \"module\" and prices.__name__ == \"prices\""],
      ],
    }),
    task("medium", "Just one function", {
      prompt: "The folder has `units.py`, with `km_to_miles(km)`. Import only that function (not the module name) and set `run` to 10 km in miles, rounded to 2 places.",
      hint: "`from units import km_to_miles`.",
      solution: "from units import km_to_miles\n\nrun = round(km_to_miles(10), 2)",
      setup: "import os as _os\nwith open('units.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('MILES_PER_KM = 0.621371\\n\\ndef km_to_miles(km):\\n    return km * MILES_PER_KM\\n')\n",
      tests: [
        ["run is 6.21", "run == 6.21"],
        ["Only the function was imported", "km_to_miles.__module__ == \"units\" and \"units\" not in globals()"],
      ],
    }),
    task("hard", "A private helper", {
      prompt: "Your code is the module `text_tools.py`. Write a helper `_clean(text)` that strips spaces and lowercases, and two public functions that use it: `word_count(text)` and `same_text(a, b)` (do they match once cleaned?).",
      hint: "`_clean` returns `text.strip().lower()`. `word_count` is `len(_clean(text).split())`.",
      solution: "def _clean(text):\n    return text.strip().lower()\n\ndef word_count(text):\n    return len(_clean(text).split())\n\ndef same_text(a, b):\n    return _clean(a) == _clean(b)",
      setup: "def _import_both(path):\n    import importlib as _il, sys as _sys, os as _os, io as _io, contextlib as _cl\n    folder = _os.path.dirname(path)\n    if folder:\n        _os.makedirs(folder, exist_ok=True)\n    with open(path, \"w\", encoding=\"utf-8\") as _f:\n        _f.write(_cq_source)\n    name = path[:-3].replace(\"/\", \".\")\n    if name.endswith(\".__init__\"):\n        name = name[:-9]\n    for _k in [k for k in _sys.modules if k == name or k.startswith(name + \".\")]:\n        del _sys.modules[_k]\n    _il.invalidate_caches()\n    import builtins as _bi\n    def _no_input(prompt=\"\"):\n        raise RuntimeError(\"input() ran while the module was being imported: put that code under the main guard\")\n    buf = _io.StringIO()\n    real_input = _bi.input\n    _bi.input = _no_input\n    try:\n        with _cl.redirect_stdout(buf):\n            mod = _il.import_module(name)\n    finally:\n        _bi.input = real_input\n    return mod, buf.getvalue()\ndef _module(path):\n    return _import_both(path)[0]\ndef _import_prints(path):\n    return _import_both(path)[1]\n",
      tests: [
        ["word_count", "_module(\"text_tools.py\").word_count(\"  The cat sat \") == 3"],
        ["same_text", "_module(\"text_tools.py\").same_text(\" Hello\", \"hello \") is True and _module(\"text_tools.py\").same_text(\"a\", \"b\") is False"],
        ["The helper is private", "[n for n in dir(_module(\"text_tools.py\")) if not n.startswith(\"_\")] == [\"same_text\", \"word_count\"] and callable(_module(\"text_tools.py\")._clean)"],
      ],
    }),
    task("hard", "A counter module", {
      prompt: "Your code is the module `counter.py`. It has a variable `count`, starting at 0, and a function `tick()` that adds 1 to it and returns the new count.",
      hint: "Inside `tick`, `global count` lets the function change the module's variable.",
      solution: "count = 0\n\ndef tick():\n    global count\n    count += 1\n    return count",
      setup: "def _import_both(path):\n    import importlib as _il, sys as _sys, os as _os, io as _io, contextlib as _cl\n    folder = _os.path.dirname(path)\n    if folder:\n        _os.makedirs(folder, exist_ok=True)\n    with open(path, \"w\", encoding=\"utf-8\") as _f:\n        _f.write(_cq_source)\n    name = path[:-3].replace(\"/\", \".\")\n    if name.endswith(\".__init__\"):\n        name = name[:-9]\n    for _k in [k for k in _sys.modules if k == name or k.startswith(name + \".\")]:\n        del _sys.modules[_k]\n    _il.invalidate_caches()\n    import builtins as _bi\n    def _no_input(prompt=\"\"):\n        raise RuntimeError(\"input() ran while the module was being imported: put that code under the main guard\")\n    buf = _io.StringIO()\n    real_input = _bi.input\n    _bi.input = _no_input\n    try:\n        with _cl.redirect_stdout(buf):\n            mod = _il.import_module(name)\n    finally:\n        _bi.input = real_input\n    return mod, buf.getvalue()\ndef _module(path):\n    return _import_both(path)[0]\ndef _import_prints(path):\n    return _import_both(path)[1]\n",
      tests: [
        ["tick counts up", "(lambda m: [m.tick(), m.tick(), m.tick()])(_module(\"counter.py\")) == [1, 2, 3]"],
        ["count is stored in the module", "(lambda m: (m.tick(), m.tick(), m.count)[2])(_module(\"counter.py\")) == 2"],
      ],
    }),
    task("expert", "Shared settings", {
      prompt: "The folder has `config.py` (a `settings` dict; it prints when loaded) and `ui.py`, whose `theme()` reads `config.settings`. Import both, change the theme in `config.settings` to `\"dark\"`, and set `shown` to `ui.theme()`.",
      hint: "Both files use the same `config` module object, so changing `config.settings[\"theme\"]` is seen by `ui`.",
      solution: "import config\nimport ui\n\nconfig.settings[\"theme\"] = \"dark\"\nshown = ui.theme()",
      setup: "import os as _os\nwith open('config.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('print(\"Loading config\")\\nsettings = {\"theme\": \"light\", \"font\": 16}\\n')\nwith open('ui.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('import config\\n\\ndef theme():\\n    return config.settings[\"theme\"]\\n')\n",
      tests: [
        ["ui sees the change", "shown == \"dark\""],
        ["config loaded only once", "_cq_stdout.count(\"Loading config\") == 1"],
      ],
    }),
    task("expert", "A report module", {
      prompt: "Your code is the module `report.py`. It imports `statistics` and the folder's `grades.py` (which has `letter(score)`), and defines `summary(scores)` returning text like `3 scores, mean 81.0, grade B`.",
      hint: "Import both at the top; the mean is `statistics.mean(scores)` as a float with one decimal place, and `grades.letter(...)` gives the grade for the mean.",
      solution: "import statistics\nimport grades\n\ndef summary(scores):\n    mean = statistics.mean(scores)\n    return f\"{len(scores)} scores, mean {mean:.1f}, grade {grades.letter(mean)}\"",
      setup: "def _import_both(path):\n    import importlib as _il, sys as _sys, os as _os, io as _io, contextlib as _cl\n    folder = _os.path.dirname(path)\n    if folder:\n        _os.makedirs(folder, exist_ok=True)\n    with open(path, \"w\", encoding=\"utf-8\") as _f:\n        _f.write(_cq_source)\n    name = path[:-3].replace(\"/\", \".\")\n    if name.endswith(\".__init__\"):\n        name = name[:-9]\n    for _k in [k for k in _sys.modules if k == name or k.startswith(name + \".\")]:\n        del _sys.modules[_k]\n    _il.invalidate_caches()\n    import builtins as _bi\n    def _no_input(prompt=\"\"):\n        raise RuntimeError(\"input() ran while the module was being imported: put that code under the main guard\")\n    buf = _io.StringIO()\n    real_input = _bi.input\n    _bi.input = _no_input\n    try:\n        with _cl.redirect_stdout(buf):\n            mod = _il.import_module(name)\n    finally:\n        _bi.input = real_input\n    return mod, buf.getvalue()\ndef _module(path):\n    return _import_both(path)[0]\ndef _import_prints(path):\n    return _import_both(path)[1]\nimport os as _os\nwith open('grades.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('def letter(score):\\n    if score >= 90:\\n        return \"A\"\\n    if score >= 80:\\n        return \"B\"\\n    if score >= 70:\\n        return \"C\"\\n    return \"F\"\\n')\n",
      tests: [
        ["Three scores", "_module(\"report.py\").summary([72, 85, 86]) == \"3 scores, mean 81.0, grade B\""],
        ["Top marks", "_module(\"report.py\").summary([95, 99]) == \"2 scores, mean 97.0, grade A\""],
      ],
    }),
  ],
  questions: [
    mc("What is the module name of the file `greetings.py`?", ["`greetings.py`", "`greetings`", "`py.greetings`", "`Greetings`"], 1),
    mc("What happens when a module is imported for the first time?", ["Only its first function runs", "Nothing until you call something", "Python runs the whole file once", "It is copied into your file"], 2),
    mc("Why can't `my-tools.py` be imported?", ["`my-tools` isn't a valid Python name", "It is too long", "Files can't have dashes", "It needs capitals"], 0),
    mc("Why shouldn't you name your own file `random.py`?", ["Python forbids it", "It is slower", "It deletes the real module", "It would be imported instead of the standard `random`"], 3),
    mc("What does a top-level `print` in a module do?", ["Nothing", "Prints during the import", "Prints every time a function is called", "Raises an error"], 1),
    mc("What does a leading underscore, as in `_clean`, mean?", ["A helper meant for use inside the module only", "A constant", "A private file", "An error"], 0),
    qShort("Which keyword lets a function change a module-level variable? (one word)", "global"),
    mc("Two modules both `import config`. How many `config` module objects are there?", ["Two", "None", "It depends on the order", "One, shared by both"], 3),
    mc("What does a name in capitals, like `MAX_PLAYERS`, usually mean?", ["A class", "A function", "A constant that shouldn't change", "A module"], 2),
    mc("In this section's challenges, what happens to your code?", ["It is saved as a module file and imported by the checks", "It is ignored", "It is printed", "It is renamed to main.py and deleted"], 0),
  ],
})
