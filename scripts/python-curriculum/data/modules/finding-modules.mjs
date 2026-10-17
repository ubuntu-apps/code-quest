// Modules and packages topic: How Python finds modules. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "import_system",
  title: "How Python finds modules",
  paragraphs: [
    "When Python meets `import shapes`, it first looks in `sys.modules`, a dictionary of every module already loaded. If `shapes` is there, it hands back that module; this is why a module only runs once. If not, it searches the folders listed in `sys.path`, in order, for a file `shapes.py` or a package folder `shapes`. The first match wins. If no folder has one, the import fails with `ModuleNotFoundError`.",
    "```\nimport sys\n\nfor folder in sys.path[:4]:\n    print(folder)   # the first few folders Python searches, in order\n```",
    "The list starts with the folder of the program being run (here, the current folder, shown as an empty string), then the standard library's folders, then `site-packages`, where installed packages go. A program can add a folder with `sys.path.append(\"libs\")`, though in a real project it's usually better to organise the files so that isn't needed. Every module records where it was loaded from in `__file__`.",
    "```\nimport statistics\n\nprint(statistics.__file__)   # the path of the statistics module's file\n```",
    "Because your own folder is searched first, a file of yours with the same name as a standard module **hides** it. Save a file as `statistics.py`, and `import statistics` in that folder loads yours instead, so `statistics.mean` suddenly doesn't exist. If a standard module seems to be missing its functions, check `__file__` and rename your file.",
    "Some modules are optional: a program can use a faster or fancier package when it's installed and fall back to the standard library when it isn't. Catch the error with `except ImportError` (which also catches its subclass `ModuleNotFoundError`). To ask whether a module is available without importing it, use `importlib.util.find_spec(name)`, which returns `None` when there's no such module.",
    "```\ntry:\n    import speedy_json as json_lib   # an imaginary faster package\nexcept ImportError:\n    import json as json_lib          # the standard library will do\n\nprint(json_lib.dumps({\"ok\": True}))  # {\"ok\": true}\n```",
    "Since a module is only loaded once, editing its file doesn't change a program that has already imported it. `importlib.reload(module)` runs the file again and updates the module in place. Programs rarely need it, but it's handy while experimenting.",
    "A trap to know about is the **circular import**: `a.py` imports `b`, and `b.py` imports something from `a`. While `a` is still running its first lines, `b` asks for a name `a` hasn't defined yet, and fails with `ImportError: cannot import name ... from partially initialized module 'a'`. The fix is to move the shared code into a third module, or to write `import a` and use `a.name()` inside functions, so the name is only looked up when the function runs, by which time both modules have finished loading.",
  ],
  sandboxCode: "import sys\nimport importlib.util\n\nimport json\nprint(\"Loaded modules:\", len(sys.modules))\nprint(\"json is loaded:\", \"json\" in sys.modules)\nprint(\"Same object:\", sys.modules[\"json\"] is json)\n\nfor name in [\"json\", \"statistics\", \"no_such_module\"]:\n    print(name, \"available:\", importlib.util.find_spec(name) is not None)",
  sandboxSnippets: [
    snippet("sys.path", "import sys\nprint(sys.path[:3])"),
    snippet("Where from?", "import json, random\nprint(json.__file__)\nprint(random.__file__)"),
    snippet("Loaded once", "import sys, statistics\nprint(sys.modules[\"statistics\"] is statistics)"),
    snippet("reload", "import importlib\nfrom pathlib import Path\nPath(\"level_mod.py\").write_text(\"LEVEL = 1\\n\")\nimport level_mod\nPath(\"level_mod.py\").write_text(\"LEVEL = 2\\n\")\nprint(level_mod.LEVEL)\nimportlib.reload(level_mod)\nprint(level_mod.LEVEL)"),
  ],
  readMore: { label: "Python docs: The module search path", url: "https://docs.python.org/3/tutorial/modules.html#the-module-search-path", source: "Python docs" },
  challenges: [
    task("easy", "Already loaded?", {
      prompt: "Import `json`, then set `loaded` to whether `\"json\"` is a key in `sys.modules`.",
      starter: "import sys\n\nloaded = False\n",
      hint: "`import json`, then `loaded = \"json\" in sys.modules`.",
      solution: "import sys\nimport json\n\nloaded = \"json\" in sys.modules",
      tests: [
        ["loaded is True", "loaded is True"],
        ["Checked sys.modules", "\"sys.modules\" in _cq_source"],
      ],
    }),
    task("easy", "Where did it come from?", {
      prompt: "Import `statistics` and set `where` to the path of the file it was loaded from.",
      hint: "Every module has `__file__`.",
      solution: "import statistics\n\nwhere = statistics.__file__",
      tests: [
        ["where is the module file", "where == __import__(\"statistics\").__file__ and where.endswith(\"statistics.py\")"],
      ],
    }),
    task("easy", "Maybe installed", {
      prompt: "Try to import a package called `fancy_charts`. If it isn't installed, set `fancy_charts` to `None` instead of crashing. Then set `has_charts` to whether it was found.",
      hint: "`try: import fancy_charts` with `except ImportError: fancy_charts = None`.",
      solution: "try:\n    import fancy_charts\nexcept ImportError:\n    fancy_charts = None\n\nhas_charts = fancy_charts is not None",
      tests: [
        ["No crash, and None", "fancy_charts is None"],
        ["has_charts is False", "has_charts is False"],
      ],
    }),
    task("medium", "Add a folder", {
      prompt: "The module `helpers.py` is in a folder `libs`, which isn't searched. Add `\"libs\"` to `sys.path`, import `helpers`, and set `loud` to `helpers.shout(\"hi\")`.",
      starter: "import sys\n",
      hint: "`sys.path.append(\"libs\")` before `import helpers`.",
      solution: "import sys\n\nsys.path.append(\"libs\")\nimport helpers\n\nloud = helpers.shout(\"hi\")",
      setup: "import os as _os\n_os.makedirs('libs', exist_ok=True)\nwith open('libs/helpers.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('def shout(text):\\n    return text.upper() + \"!\"\\n')\n",
      tests: [
        ["loud is HI!", "loud == \"HI!\""],
        ["helpers came from libs", "helpers.__file__.replace(\"\\\\\", \"/\").endswith(\"libs/helpers.py\")"],
      ],
    }),
    task("medium", "Reload it", {
      prompt: "The folder has `level.py` with `LEVEL = 1`. Import it, rewrite the file to say `LEVEL = 2` (using `pathlib`), and make the loaded module see the change. Set `now` to `level.LEVEL`.",
      starter: "from pathlib import Path\nimport importlib\n\nimport level\nPath(\"level.py\").write_text(\"LEVEL = 2\\n\")\n\nnow = level.LEVEL\n",
      hint: "The module was loaded before the edit. `importlib.reload(level)` runs the file again.",
      solution: "from pathlib import Path\nimport importlib\n\nimport level\nPath(\"level.py\").write_text(\"LEVEL = 2\\n\")\nimportlib.reload(level)\n\nnow = level.LEVEL",
      setup: "import os as _os\nwith open('level.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('LEVEL = 1\\n')\n",
      tests: [
        ["now is 2", "now == 2"],
      ],
    }),
    task("medium", "A fallback", {
      prompt: "Define `to_json(data)` that uses the (imaginary) faster `speedy_json` module if it's installed, and the standard `json` module otherwise, to turn `data` into JSON text.",
      hint: "Put the imports at the top: `try: import speedy_json as json_lib` / `except ImportError: import json as json_lib`. Then `return json_lib.dumps(data)`.",
      solution: "try:\n    import speedy_json as json_lib\nexcept ImportError:\n    import json as json_lib\n\ndef to_json(data):\n    return json_lib.dumps(data)",
      tests: [
        ["A dict", "to_json({\"a\": 1}) == '{\"a\": 1}'"],
        ["A list", "to_json([1, 2]) == \"[1, 2]\""],
        ["The standard json was used", "json_lib is __import__(\"json\")"],
      ],
    }),
    task("hard", "Is it available?", {
      prompt: "Define `available(name)` that returns `True` if a module called `name` can be imported, without importing it. Use `importlib.util.find_spec`.",
      starter: "import importlib.util\n",
      hint: "`importlib.util.find_spec(name) is not None`.",
      solution: "import importlib.util\n\ndef available(name):\n    return importlib.util.find_spec(name) is not None",
      tests: [
        ["json is available", "available(\"json\") is True"],
        ["A made-up module", "available(\"no_such_module_xyz\") is False"],
        ["Not imported, just found", "(available(\"tabnanny\"), \"tabnanny\" in __import__(\"sys\").modules)[1] is False"],
      ],
    }),
    task("hard", "First match wins", {
      prompt: "Folders `v1` and `v2` both have a `greet.py`, and `v1` is already on `sys.path`. Make `import greet` load the one in `v2`, then set `version` to `greet.VERSION`.",
      starter: "import sys\n",
      hint: "The search goes in order, so put `\"v2\"` at the front: `sys.path.insert(0, \"v2\")`.",
      solution: "import sys\n\nsys.path.insert(0, \"v2\")\nimport greet\n\nversion = greet.VERSION",
      setup: "import os as _os\n_os.makedirs('v1', exist_ok=True)\nwith open('v1/greet.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('VERSION = 1\\n')\n_os.makedirs('v2', exist_ok=True)\nwith open('v2/greet.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('VERSION = 2\\n')\nimport sys as _sys\n_sys.path.append(\"v1\")\n",
      tests: [
        ["version is 2", "version == 2"],
        ["Loaded from v2", "greet.__file__.replace(\"\\\\\", \"/\").endswith(\"v2/greet.py\")"],
      ],
    }),
    task("expert", "Break the circle", {
      prompt: "Your code is `b.py`. The folder's `a.py` does `import b`, and `b` imports `name` from `a`, so importing `a` fails: `a` isn't finished when `b` asks for `name`. Change `b.py` so that importing `a` first works and `both()` still returns `AB`.",
      starter: "from a import name as a_name\n\ndef name():\n    return \"B\"\n\ndef both():\n    return a_name() + name()\n",
      hint: "Write `import a` at the top instead, and call `a.name()` inside `both()`, so the name is looked up only when `both` runs.",
      solution: "import a\n\ndef name():\n    return \"B\"\n\ndef both():\n    return a.name() + name()",
      setup: "import os as _os\nwith open('a.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('import b\\n\\ndef name():\\n    return \"A\"\\n\\ndef both():\\n    return name() + b.name()\\n')\nwith open(\"b.py\", \"w\", encoding=\"utf-8\") as _f:\n    _f.write(_cq_source)\ndef _fresh(name):\n    import sys as _sys, importlib as _il\n    for _k in (\"a\", \"b\"):\n        _sys.modules.pop(_k, None)\n    _il.invalidate_caches()\n    return _il.import_module(name)\n",
      tests: [
        ["Importing a works", "_fresh(\"a\").both() == \"AB\""],
        ["b.both works", "(_fresh(\"a\"), __import__(\"sys\").modules[\"b\"].both())[1] == \"AB\""],
      ],
    }),
    task("expert", "My own modules", {
      prompt: "The folder has `alpha.py` and `beta.py`. Import both, then define `my_modules()` that returns the sorted names of the loaded modules (in `sys.modules`) whose `__file__` is in the current folder.",
      starter: "import os\nimport sys\n",
      hint: "For each module in `sys.modules.values()`, take `getattr(m, \"__file__\", None)`; keep it if `os.path.dirname(os.path.abspath(f)) == os.getcwd()`.",
      solution: "import os\nimport sys\nimport alpha\nimport beta\n\ndef my_modules():\n    here = os.getcwd()\n    names = []\n    for name, module in sys.modules.items():\n        f = getattr(module, \"__file__\", None)\n        if f and os.path.dirname(os.path.abspath(f)) == here:\n            names.append(name)\n    return sorted(names)",
      setup: "import os as _os\nwith open('alpha.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('A = 1\\n')\nwith open('beta.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('B = 2\\n')\nwith open('gamma.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('C = 3\\n')\n",
      tests: [
        ["alpha and beta", "my_modules() == [\"alpha\", \"beta\"]"],
      ],
    }),
  ],
  questions: [
    mc("Where does Python look first when you `import x`?", ["`sys.path`", "`sys.modules`, the modules already loaded", "The internet", "The current function"], 1),
    mc("What is `sys.path`?", ["The folders Python searches for modules, in order", "The program's name", "A list of loaded modules", "The Python version"], 0),
    mc("Your folder has a file `statistics.py`. What does `import statistics` load there?", ["The standard module", "Both", "Your file, because your folder is searched first", "Nothing"], 2),
    mc("How can you tell which file a module was loaded from?", ["`module.__name__`", "`dir(module)`", "`help(module)`", "`module.__file__`"], 3),
    mc("Which error does `except ImportError` also catch?", ["`ModuleNotFoundError`", "`NameError`", "`FileNotFoundError`", "`AttributeError`"], 0),
    mc("What does `importlib.util.find_spec(\"x\")` return when there is no module `x`?", ["`False`", "`None`", "It raises an error", "An empty module"], 1),
    qShort("Which function in `importlib` runs an already-imported module's file again? (one word)", "reload"),
    mc("What causes \"cannot import name ... from partially initialized module\"?", ["A missing file", "A typo", "Too many imports", "A circular import"], 3),
    mc("How can `b.py` avoid a circular import with `a.py`?", ["Import `a` twice", "Use `import a` and call `a.name()` inside functions", "Rename `a.py`", "Delete `sys.modules`"], 1),
    mc("What does `sys.path.append(\"libs\")` do?", ["Adds `libs` to the folders searched for modules", "Creates a folder", "Imports every module in `libs`", "Deletes `libs`"], 0),
  ],
})
