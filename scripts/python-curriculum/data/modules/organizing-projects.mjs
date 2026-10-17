// Modules and packages topic: Organising a project. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "organizing_projects",
  title: "Organising a project",
  paragraphs: [
    "A program in one file is fine while it's short. Once it grows to a few hundred lines, finding anything gets slow, and changing one part risks breaking another. The answer is to split it into modules, each with one job, and to lay the project out the way other Python programmers expect. A typical small project looks like this:",
    "```\nweather_app/\n    README.md            what it is and how to run it\n    requirements.txt     the packages it needs\n    main.py              starts the program\n    weather/             the package with the real code\n        __init__.py\n        fetch.py         getting the data\n        convert.py       calculations\n        display.py       turning results into text\n    tests/\n        test_convert.py  checks for convert.py\n```",
    "A few habits make this work. Give each module one job, and name it after that job. Keep calculations apart from input and printing: a function that **returns** a result can be reused, tested and printed anywhere, while one that prints can only print. Keep `main.py` small, just imports, a `main()` that connects the pieces, and the main guard. Put settings that might change, like a tax rate or a file name, in one place, such as `settings.py`, rather than scattered through the code.",
    "Imports should flow one way: `main.py` imports `display`, `display` imports `convert`, and `convert` imports nothing of yours. When a low-level module never imports a higher one, circular imports can't happen, and each module can be understood (and tested) on its own.",
    "Here's a script split along those lines. The calculation lives in its own module and knows nothing about `input` or `print`; the main program handles the talking:",
    "```\n# convert.py\n\"\"\"Temperature conversions.\"\"\"\n\ndef c_to_f(c):\n    return c * 9 / 5 + 32\n```",
    "```\n# main.py\nfrom convert import c_to_f\n\ndef main():\n    c = float(input(\"Degrees C: \"))\n    print(f\"{c_to_f(c):.1f} F\")\n\nif __name__ == \"__main__\":\n    main()\n```",
    "The string on the first line of `convert.py` is the module's **docstring**. It becomes `convert.__doc__`, and `help(convert)` shows it, so a reader learns what the module is for without opening it. Tests usually live in a `tests` folder, in files named `test_something.py`, and import the code they check: tools like `pytest` find and run every `test_` function in them.",
    "One subtlety with settings: `import settings` and then `settings.TAX_RATE` reads the current value every time, while `from settings import TAX_RATE` copies the value once, when the import runs. If a setting can be changed while the program runs, use the first form.",
    "In the challenges you'll build layouts with `pathlib`, write modules that slot into a given project, and write small tools that look at a project's files.",
  ],
  sandboxCode: "from pathlib import Path\n\nfor name in [\"app/main.py\", \"app/tools/__init__.py\", \"app/tools/maths.py\", \"app/tests/test_maths.py\"]:\n    path = Path(name)\n    path.parent.mkdir(parents=True, exist_ok=True)\n    path.write_text(\"\")\n\nprint(\"app/\")\nfor path in sorted(Path(\"app\").rglob(\"*\")):\n    depth = len(path.parts) - 1\n    print(\"    \" * depth + path.name + (\"/\" if path.is_dir() else \"\"))",
  sandboxSnippets: [
    snippet("Return, don't print", "def average(nums):\n    return sum(nums) / len(nums)\n\nresult = average([3, 4, 8])\nprint(f\"Average: {result}\")"),
    snippet("A module docstring", "from pathlib import Path\nPath(\"conv_mod.py\").write_text('\"\"\"Temperature conversions.\"\"\"\\n\\ndef c_to_f(c):\\n    return c * 9 / 5 + 32\\n')\nimport conv_mod\nprint(conv_mod.__doc__)"),
    snippet("import vs from-import", "from pathlib import Path\nPath(\"cfg.py\").write_text(\"RATE = 0.2\\n\")\nimport cfg\nfrom cfg import RATE\ncfg.RATE = 0.1\nprint(cfg.RATE, RATE)"),
    snippet("Find every module", "from pathlib import Path\nfor name in [\"proj/a.py\", \"proj/pkg/b.py\", \"proj/notes.txt\"]:\n    Path(name).parent.mkdir(parents=True, exist_ok=True)\n    Path(name).write_text(\"\")\nprint(sorted(p.as_posix() for p in Path(\"proj\").rglob(\"*.py\")))"),
  ],
  readMore: { label: "The Hitchhiker's Guide to Python: Structuring your project", url: "https://docs.python-guide.org/writing/structure/", source: "Python Guide" },
  challenges: [
    task("easy", "Lay it out", {
      prompt: "Using `pathlib`, create the empty files `notes_app/README.md`, `notes_app/main.py` and `notes_app/notes/__init__.py` (making the folders as needed).",
      starter: "from pathlib import Path\n",
      hint: "For each path: `path.parent.mkdir(parents=True, exist_ok=True)`, then `path.write_text(\"\")`.",
      solution: "from pathlib import Path\n\nfor name in [\"notes_app/README.md\", \"notes_app/main.py\", \"notes_app/notes/__init__.py\"]:\n    path = Path(name)\n    path.parent.mkdir(parents=True, exist_ok=True)\n    path.write_text(\"\")",
      tests: [
        ["The files exist", "all(__import__(\"os\").path.isfile(p) for p in [\"notes_app/README.md\", \"notes_app/main.py\", \"notes_app/notes/__init__.py\"])"],
      ],
    }),
    task("easy", "Say what it's for", {
      prompt: "Your code is `convert.py`. Start it with the docstring `Temperature conversions.` and define `c_to_f(c)`.",
      hint: "The first line is the string `\"\"\"Temperature conversions.\"\"\"`.",
      solution: "\"\"\"Temperature conversions.\"\"\"\n\ndef c_to_f(c):\n    return c * 9 / 5 + 32",
      setup: "def _import_both(path):\n    import importlib as _il, sys as _sys, os as _os, io as _io, contextlib as _cl\n    folder = _os.path.dirname(path)\n    if folder:\n        _os.makedirs(folder, exist_ok=True)\n    with open(path, \"w\", encoding=\"utf-8\") as _f:\n        _f.write(_cq_source)\n    name = path[:-3].replace(\"/\", \".\")\n    if name.endswith(\".__init__\"):\n        name = name[:-9]\n    for _k in [k for k in _sys.modules if k == name or k.startswith(name + \".\")]:\n        del _sys.modules[_k]\n    _il.invalidate_caches()\n    import builtins as _bi\n    def _no_input(prompt=\"\"):\n        raise RuntimeError(\"input() ran while the module was being imported: put that code under the main guard\")\n    buf = _io.StringIO()\n    real_input = _bi.input\n    _bi.input = _no_input\n    try:\n        with _cl.redirect_stdout(buf):\n            mod = _il.import_module(name)\n    finally:\n        _bi.input = real_input\n    return mod, buf.getvalue()\ndef _module(path):\n    return _import_both(path)[0]\ndef _import_prints(path):\n    return _import_both(path)[1]\n",
      tests: [
        ["The docstring", "_module(\"convert.py\").__doc__ == \"Temperature conversions.\""],
        ["c_to_f works", "_module(\"convert.py\").c_to_f(100) == 212.0"],
      ],
    }),
    task("easy", "Return, don't print", {
      prompt: "This `average` prints its answer, so other code can't use it. Make it return the average instead, and print nothing.",
      starter: "def average(nums):\n    print(sum(nums) / len(nums))\n",
      hint: "Change `print(...)` to `return ...`.",
      solution: "def average(nums):\n    return sum(nums) / len(nums)",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\n",
      tests: [
        ["Returns the average", "average([3, 4, 8]) == 5.0"],
        ["Prints nothing", "_out(average, [1, 2]) == \"\""],
      ],
    }),
    task("medium", "Read the settings", {
      prompt: "The folder has `settings.py` with `TAX_RATE`. Define `with_tax(price)` that returns `price` plus tax, rounded to 2 places, reading the rate so that a change to `settings.TAX_RATE` while the program runs is used.",
      hint: "Use `import settings` and read `settings.TAX_RATE` inside the function; `from settings import TAX_RATE` would copy the value once.",
      solution: "import settings\n\ndef with_tax(price):\n    return round(price * (1 + settings.TAX_RATE), 2)",
      setup: "import os as _os\nwith open('settings.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('TAX_RATE = 0.2\\nCURRENCY = \"EUR\"\\n')\n",
      tests: [
        ["With the starting rate", "with_tax(10) == 12.0"],
        ["After the rate changes", "(setattr(__import__(\"settings\"), \"TAX_RATE\", 0.1), with_tax(10))[1] == 11.0"],
      ],
    }),
    task("medium", "The main program", {
      prompt: "The `grades` package has `calc.py` and `display.py`, whose `report(name, scores)` returns a line of text. Write the main program: a `main()` that prints the report for Ana (`[92, 88, 95]`) and then Ben (`[71, 64, 80]`), called under a main guard.",
      hint: "`from grades.display import report`, then two `print(report(...))` lines in `main()`.",
      solution: "from grades.display import report\n\ndef main():\n    print(report(\"Ana\", [92, 88, 95]))\n    print(report(\"Ben\", [71, 64, 80]))\n\nif __name__ == \"__main__\":\n    main()",
      setup: "import os as _os\n_os.makedirs('grades', exist_ok=True)\nwith open('grades/__init__.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('')\n_os.makedirs('grades', exist_ok=True)\nwith open('grades/calc.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('def average(scores):\\n    return sum(scores) / len(scores)\\n\\ndef letter(score):\\n    if score >= 90:\\n        return \"A\"\\n    if score >= 80:\\n        return \"B\"\\n    if score >= 70:\\n        return \"C\"\\n    return \"F\"\\n')\n_os.makedirs('grades', exist_ok=True)\nwith open('grades/display.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('from grades.calc import average, letter\\n\\ndef report(name, scores):\\n    avg = average(scores)\\n    return f\"{name}: {avg:.1f} ({letter(avg)})\"\\n')\n",
      tests: [
        ["The two reports", "_cq_stdout.splitlines() == [\"Ana: 91.7 (A)\", \"Ben: 71.7 (C)\"]"],
        ["report came from the package", "report.__module__ == \"grades.display\""],
      ],
    }),
    task("medium", "Find every module", {
      prompt: "Set `modules` to the sorted paths (as `/`-separated text) of every `.py` file inside the `app` folder, at any depth.",
      starter: "from pathlib import Path\n",
      hint: "`Path(\"app\").rglob(\"*.py\")` finds them all; `.as_posix()` gives the text.",
      solution: "from pathlib import Path\n\nmodules = sorted(p.as_posix() for p in Path(\"app\").rglob(\"*.py\"))",
      setup: "import os as _os\n_os.makedirs('app', exist_ok=True)\nwith open('app/main.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('')\n_os.makedirs('app', exist_ok=True)\nwith open('app/README.md', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('')\n_os.makedirs('app/shop', exist_ok=True)\nwith open('app/shop/__init__.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('')\n_os.makedirs('app/shop', exist_ok=True)\nwith open('app/shop/cart.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('')\n_os.makedirs('app/tests', exist_ok=True)\nwith open('app/tests/test_cart.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('')\n_os.makedirs('app/data', exist_ok=True)\nwith open('app/data/prices.csv', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('')\n",
      tests: [
        ["modules is right", "modules == [\"app/main.py\", \"app/shop/__init__.py\", \"app/shop/cart.py\", \"app/tests/test_cart.py\"]"],
      ],
    }),
    task("hard", "A test file", {
      prompt: "Your code is `tests/test_convert.py`. Import `c_to_f` from the folder's `convert.py` and write two test functions: `test_freezing` (0 C is 32 F) and `test_boiling` (100 C is 212 F), each using `assert`.",
      hint: "`from convert import c_to_f`, then `def test_freezing(): assert c_to_f(0) == 32`.",
      solution: "from convert import c_to_f\n\ndef test_freezing():\n    assert c_to_f(0) == 32\n\ndef test_boiling():\n    assert c_to_f(100) == 212",
      setup: "import os as _os\nwith open('convert.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('def c_to_f(c):\\n    return c * 9 / 5 + 32\\n')\ndef _import_both(path):\n    import importlib as _il, sys as _sys, os as _os, io as _io, contextlib as _cl\n    folder = _os.path.dirname(path)\n    if folder:\n        _os.makedirs(folder, exist_ok=True)\n    with open(path, \"w\", encoding=\"utf-8\") as _f:\n        _f.write(_cq_source)\n    name = path[:-3].replace(\"/\", \".\")\n    if name.endswith(\".__init__\"):\n        name = name[:-9]\n    for _k in [k for k in _sys.modules if k == name or k.startswith(name + \".\")]:\n        del _sys.modules[_k]\n    _il.invalidate_caches()\n    import builtins as _bi\n    def _no_input(prompt=\"\"):\n        raise RuntimeError(\"input() ran while the module was being imported: put that code under the main guard\")\n    buf = _io.StringIO()\n    real_input = _bi.input\n    _bi.input = _no_input\n    try:\n        with _cl.redirect_stdout(buf):\n            mod = _il.import_module(name)\n    finally:\n        _bi.input = real_input\n    return mod, buf.getvalue()\ndef _module(path):\n    return _import_both(path)[0]\ndef _import_prints(path):\n    return _import_both(path)[1]\nimport io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["The tests pass", "(lambda m: (m.test_freezing(), m.test_boiling()))(_module(\"tests/test_convert.py\")) == (None, None)"],
        ["test_freezing catches a bug", "_catches(_module(\"tests/test_convert.py\").test_freezing, \"c_to_f\", lambda c: c)"],
        ["test_boiling catches a bug", "_catches(_module(\"tests/test_convert.py\").test_boiling, \"c_to_f\", lambda c: c * 2 + 30)"],
      ],
    }),
    task("hard", "Round in circles", {
      prompt: "`deps` maps each module to the modules it imports. Define `circular_pairs(deps)` that returns the sorted list of pairs `(a, b)`, with `a < b`, where `a` imports `b` and `b` imports `a`.",
      hint: "For each `a` and each `b` in `deps[a]`, check `a in deps.get(b, [])`; keep the pair once with `a < b`.",
      solution: "def circular_pairs(deps):\n    pairs = set()\n    for a, imports in deps.items():\n        for b in imports:\n            if a in deps.get(b, []):\n                pairs.add((min(a, b), max(a, b)))\n    return sorted(pairs)",
      tests: [
        ["One circle", "circular_pairs({\"main\": [\"display\"], \"display\": [\"convert\", \"main\"], \"convert\": []}) == [(\"display\", \"main\")]"],
        ["Two circles", "circular_pairs({\"a\": [\"b\", \"c\"], \"b\": [\"a\"], \"c\": [\"a\"], \"d\": [\"a\"]}) == [(\"a\", \"b\"), (\"a\", \"c\")]"],
        ["None", "circular_pairs({\"main\": [\"tools\"], \"tools\": []}) == []"],
      ],
    }),
    task("expert", "What does it import?", {
      prompt: "Define `imports_of(path)` that reads a Python file and returns the sorted, de-duplicated top-level module names it imports, from lines starting with `import` or `from` (so `import numpy as np` gives `numpy`, and `from shop.cart import total` gives `shop`).",
      hint: "For `import` lines, split the rest on commas and take the first word of each part; for `from` lines, take the word after `from`. Then `.split(\".\")[0]` for the top level.",
      solution: "def imports_of(path):\n    names = set()\n    with open(path, encoding=\"utf-8\") as f:\n        for line in f:\n            line = line.strip()\n            if line.startswith(\"import \"):\n                for part in line[len(\"import \"):].split(\",\"):\n                    names.add(part.split()[0].split(\".\")[0])\n            elif line.startswith(\"from \"):\n                names.add(line.split()[1].split(\".\")[0])\n    return sorted(names)",
      setup: "import os as _os\nwith open('main.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('\"\"\"The shop.\"\"\"\\nimport os, sys\\nimport numpy as np\\nfrom shop.cart import total\\nfrom shop import prices\\nimport json\\n\\ndef main():\\n    print(total([]))\\n')\nwith open('empty.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('x = 1\\n')\n",
      tests: [
        ["main.py", "imports_of(\"main.py\") == [\"json\", \"numpy\", \"os\", \"shop\", \"sys\"]"],
        ["No imports", "imports_of(\"empty.py\") == []"],
      ],
    }),
    task("expert", "Project report", {
      prompt: "Define `report(folder)` that returns a list of lines, one per `.py` file in `folder` at any depth, sorted by path: `<path>: <n> lines` (path `/`-separated, counting every line), then `Total: <lines> lines in <files> files`.",
      starter: "from pathlib import Path\n",
      hint: "Loop over `sorted(Path(folder).rglob(\"*.py\"))`; `len(p.read_text().splitlines())` counts the lines.",
      solution: "from pathlib import Path\n\ndef report(folder):\n    lines = []\n    total = 0\n    files = sorted(Path(folder).rglob(\"*.py\"))\n    for path in files:\n        n = len(path.read_text(encoding=\"utf-8\").splitlines())\n        total += n\n        lines.append(f\"{path.as_posix()}: {n} lines\")\n    lines.append(f\"Total: {total} lines in {len(files)} files\")\n    return lines",
      setup: "import os as _os\n_os.makedirs('grades', exist_ok=True)\nwith open('grades/__init__.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('')\n_os.makedirs('grades', exist_ok=True)\nwith open('grades/calc.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('def average(scores):\\n    return sum(scores) / len(scores)\\n\\ndef letter(score):\\n    if score >= 90:\\n        return \"A\"\\n    if score >= 80:\\n        return \"B\"\\n    if score >= 70:\\n        return \"C\"\\n    return \"F\"\\n')\n_os.makedirs('grades', exist_ok=True)\nwith open('grades/display.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('from grades.calc import average, letter\\n\\ndef report(name, scores):\\n    avg = average(scores)\\n    return f\"{name}: {avg:.1f} ({letter(avg)})\"\\n')\n",
      tests: [
        ["The grades project", "report(\"grades\") == [\"grades/__init__.py: 0 lines\", \"grades/calc.py: 11 lines\", \"grades/display.py: 5 lines\", \"Total: 16 lines in 3 files\"]"],
        ["An empty folder", "(__import__(\"os\").makedirs(\"empty_dir\", exist_ok=True), report(\"empty_dir\"))[1] == [\"Total: 0 lines in 0 files\"]"],
      ],
    }),
  ],
  questions: [
    mc("When is it time to split a program into modules?", ["Never", "When it gets long and parts have different jobs", "Only when it has a bug", "After writing tests"], 1),
    mc("Why keep calculations apart from `input` and `print`?", ["Printing is slow", "Python requires it", "A function that returns can be reused and tested anywhere", "It uses less memory"], 2),
    mc("What should `main.py` usually contain?", ["Imports, a `main()` that connects the pieces, and the main guard", "All the calculations", "Only constants", "The tests"], 0),
    mc("Why should imports flow one way, from `main` down?", ["It is faster", "It makes files shorter", "Python requires it", "It prevents circular imports"], 3),
    mc("Where does a module's docstring go?", ["At the end", "As the first line of the file", "In README.md", "In `__init__.py` only"], 1),
    mc("`settings.TAX_RATE` is changed while the program runs. Which import sees the new value?", ["`import settings`, then `settings.TAX_RATE`", "`from settings import TAX_RATE`", "Both", "Neither"], 0),
    mc("How are test files usually named?", ["`convert_check.py`", "`test_convert.py`", "`convert.test`", "`tests.py` only"], 1),
    mc("What usually goes in `requirements.txt`?", ["The tests", "The program's output", "Notes for users", "The packages the project needs"], 3),
    mc("Which folder usually holds the checks for a project's code?", ["`src/`", "`docs/`", "`tests/`", "`.venv/`"], 2),
    mc("Where do settings like a tax rate belong?", ["In one place, such as `settings.py`", "Copied into every function", "In the README", "In the test files"], 0),
  ],
})
