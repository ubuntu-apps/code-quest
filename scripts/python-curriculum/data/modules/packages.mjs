// Modules and packages topic: Packages. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "packages",
  title: "Packages",
  paragraphs: [
    "As a project grows, one folder of modules gets crowded. A **package** is a folder of modules that belong together, imported by its folder name. A shop program might keep its code like this:",
    "```\nshop/\n    __init__.py\n    prices.py\n    cart.py\nmain.py\n```",
    "From `main.py`, the modules inside are reached with a dot, just like names inside a module. All three of these work; pick the one that reads best where it's used:",
    "```text\nimport shop.prices\nprint(shop.prices.price_of(\"tea\"))\n\nfrom shop import prices\nprint(prices.price_of(\"tea\"))\n\nfrom shop.prices import price_of\nprint(price_of(\"tea\"))\n```",
    "The file `__init__.py` makes the folder a regular package, and Python runs it when the package is first imported. It's often empty. It can also import the package's most useful names, so users can write `shop.price_of` without knowing which module it lives in. (Python 3 can import a folder without one, as a \"namespace package\", but the usual habit is to include it.)",
    "You can build a package here with `pathlib`: make the folder, write the files, and import it.",
    "```\nfrom pathlib import Path\n\nPath(\"shop\").mkdir(exist_ok=True)\nPath(\"shop/__init__.py\").write_text(\"\")\nPath(\"shop/prices.py\").write_text(\"\"\"\nPRICES = {\"tea\": 2.25, \"cake\": 4.0}\n\ndef price_of(item):\n    return PRICES[item]\n\"\"\")\n\nfrom shop.prices import price_of\nprint(price_of(\"cake\"))   # 4.0\n```",
    "Modules inside a package often import each other. `shop/cart.py` can use an **absolute** import, which names the full path, `from shop.prices import price_of`, or a **relative** one, `from .prices import price_of`, where the dot means \"this package\". A relative import only works in a module that was imported as part of its package; run the file directly and it fails with `ImportError: attempted relative import with no known parent package`. Absolute imports work either way, so they're the safer default.",
    "Packages can contain packages: `shop/payments/cards.py` is imported as `shop.payments.cards`, and each folder has its own `__init__.py`. Most large libraries you'll install, like `pandas` or `requests`, are packages organised this way.",
    "In the challenges, some packages are already in the folder for you to import; others you build with `pathlib`. When a challenge says your code is a file inside a package, like `shop/cart.py`, the checks save it there and import it by its dotted name.",
  ],
  sandboxCode: "from pathlib import Path\n\nPath(\"kit\").mkdir(exist_ok=True)\nPath(\"kit/__init__.py\").write_text(\"from kit.text import shout\\n\")\nPath(\"kit/text.py\").write_text(\"def shout(s):\\n    return s.upper() + '!'\\n\")\n\nimport kit\nprint(kit.shout(\"packages\"))\nprint(kit.text.shout(\"modules\"))",
  sandboxSnippets: [
    snippet("Make a package", "from pathlib import Path\nPath(\"pets\").mkdir(exist_ok=True)\nPath(\"pets/__init__.py\").write_text(\"\")\nPath(\"pets/dogs.py\").write_text(\"def bark():\\n    return 'Woof'\\n\")\nfrom pets import dogs\nprint(dogs.bark())"),
    snippet("Dotted names", "from pathlib import Path\nPath(\"zoo\").mkdir(exist_ok=True)\nPath(\"zoo/__init__.py\").write_text(\"\")\nPath(\"zoo/cats.py\").write_text(\"SOUND = 'Meow'\\n\")\nimport zoo.cats\nprint(zoo.cats.__name__, zoo.cats.SOUND)"),
    snippet("A front door", "from pathlib import Path\nPath(\"maths_kit\").mkdir(exist_ok=True)\nPath(\"maths_kit/basic.py\").write_text(\"def double(n):\\n    return n * 2\\n\")\nPath(\"maths_kit/__init__.py\").write_text(\"from maths_kit.basic import double\\n\")\nimport maths_kit\nprint(maths_kit.double(21))"),
    snippet("Relative import, run directly", "try:\n    exec(\"from .prices import price_of\")\nexcept ImportError as e:\n    print(\"ImportError:\", e)"),
  ],
  readMore: { label: "Python tutorial: Packages", url: "https://docs.python.org/3/tutorial/modules.html#packages", source: "Python docs" },
  challenges: [
    task("easy", "From a package", {
      prompt: "The folder has a `shop` package with a `prices` module. Import `prices` from `shop` and set `tea` to `prices.price_of(\"tea\")`.",
      hint: "`from shop import prices`.",
      solution: "from shop import prices\n\ntea = prices.price_of(\"tea\")",
      setup: "import os as _os\n_os.makedirs('shop', exist_ok=True)\nwith open('shop/__init__.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('')\n_os.makedirs('shop', exist_ok=True)\nwith open('shop/prices.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('PRICES = {\"tea\": 2.25, \"coffee\": 2.75, \"cake\": 4.0}\\n\\ndef price_of(item):\\n    return PRICES[item]\\n')\n",
      tests: [
        ["tea is 2.25", "tea == 2.25"],
        ["prices came from the package", "prices.__name__ == \"shop.prices\""],
      ],
    }),
    task("easy", "Straight to the function", {
      prompt: "Import just `price_of` from `shop.prices`, and set `cake` to the price of `\"cake\"`.",
      hint: "`from shop.prices import price_of`.",
      solution: "from shop.prices import price_of\n\ncake = price_of(\"cake\")",
      setup: "import os as _os\n_os.makedirs('shop', exist_ok=True)\nwith open('shop/__init__.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('')\n_os.makedirs('shop', exist_ok=True)\nwith open('shop/prices.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('PRICES = {\"tea\": 2.25, \"coffee\": 2.75, \"cake\": 4.0}\\n\\ndef price_of(item):\\n    return PRICES[item]\\n')\n",
      tests: [
        ["cake is 4.0", "cake == 4.0"],
        ["price_of came from shop.prices", "price_of.__module__ == \"shop.prices\""],
      ],
    }),
    task("easy", "The full path", {
      prompt: "Use `import shop.prices` (the whole dotted name) and set `total` to the price of three coffees.",
      hint: "After `import shop.prices`, call `shop.prices.price_of(\"coffee\")`.",
      solution: "import shop.prices\n\ntotal = shop.prices.price_of(\"coffee\") * 3",
      setup: "import os as _os\n_os.makedirs('shop', exist_ok=True)\nwith open('shop/__init__.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('')\n_os.makedirs('shop', exist_ok=True)\nwith open('shop/prices.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('PRICES = {\"tea\": 2.25, \"coffee\": 2.75, \"cake\": 4.0}\\n\\ndef price_of(item):\\n    return PRICES[item]\\n')\n",
      tests: [
        ["total is 8.25", "total == 8.25"],
        ["shop is the package", "shop.__name__ == \"shop\" and shop.prices.__name__ == \"shop.prices\""],
      ],
    }),
    task("medium", "Build a package", {
      prompt: "Using `pathlib`, create a package folder `tools` with an empty `__init__.py` and a module `tools/hello.py` containing `def hi(): return \"hi\"`. Then import `tools.hello` and set `said` to `tools.hello.hi()`.",
      starter: "from pathlib import Path\n",
      hint: "`Path(\"tools\").mkdir()`, then `write_text` for each file, then `import tools.hello`.",
      solution: "from pathlib import Path\n\nPath(\"tools\").mkdir(exist_ok=True)\nPath(\"tools/__init__.py\").write_text(\"\")\nPath(\"tools/hello.py\").write_text(\"def hi():\\n    return \\\"hi\\\"\\n\")\n\nimport tools.hello\n\nsaid = tools.hello.hi()",
      tests: [
        ["The package files exist", "__import__(\"os\").path.isfile(\"tools/__init__.py\") and __import__(\"os\").path.isfile(\"tools/hello.py\")"],
        ["said is \"hi\"", "said == \"hi\""],
      ],
    }),
    task("medium", "A module in the package", {
      prompt: "Your code is `shop/cart.py`. Import `price_of` from `shop.prices` (an absolute import) and define `total(items)` that adds up the prices of a list of items.",
      hint: "`from shop.prices import price_of`, then `sum(price_of(item) for item in items)`.",
      solution: "from shop.prices import price_of\n\ndef total(items):\n    return sum(price_of(item) for item in items)",
      setup: "import os as _os\n_os.makedirs('shop', exist_ok=True)\nwith open('shop/__init__.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('')\n_os.makedirs('shop', exist_ok=True)\nwith open('shop/prices.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('PRICES = {\"tea\": 2.25, \"coffee\": 2.75, \"cake\": 4.0}\\n\\ndef price_of(item):\\n    return PRICES[item]\\n')\ndef _import_both(path):\n    import importlib as _il, sys as _sys, os as _os, io as _io, contextlib as _cl\n    folder = _os.path.dirname(path)\n    if folder:\n        _os.makedirs(folder, exist_ok=True)\n    with open(path, \"w\", encoding=\"utf-8\") as _f:\n        _f.write(_cq_source)\n    name = path[:-3].replace(\"/\", \".\")\n    if name.endswith(\".__init__\"):\n        name = name[:-9]\n    for _k in [k for k in _sys.modules if k == name or k.startswith(name + \".\")]:\n        del _sys.modules[_k]\n    _il.invalidate_caches()\n    import builtins as _bi\n    def _no_input(prompt=\"\"):\n        raise RuntimeError(\"input() ran while the module was being imported: put that code under the main guard\")\n    buf = _io.StringIO()\n    real_input = _bi.input\n    _bi.input = _no_input\n    try:\n        with _cl.redirect_stdout(buf):\n            mod = _il.import_module(name)\n    finally:\n        _bi.input = real_input\n    return mod, buf.getvalue()\ndef _module(path):\n    return _import_both(path)[0]\ndef _import_prints(path):\n    return _import_both(path)[1]\n",
      tests: [
        ["Tea and cake", "_module(\"shop/cart.py\").total([\"tea\", \"cake\"]) == 6.25"],
        ["An empty cart", "_module(\"shop/cart.py\").total([]) == 0"],
        ["Imported as shop.cart", "_module(\"shop/cart.py\").__name__ == \"shop.cart\""],
      ],
    }),
    task("medium", "Run it directly", {
      prompt: "This `shop/cart.py` uses a relative import, so running it directly fails. Change it to an absolute import so it works both when run and when imported.",
      starter: "from .prices import price_of\n\ndef total(items):\n    return sum(price_of(item) for item in items)\n",
      hint: "Replace `.prices` with the full name `shop.prices`.",
      solution: "from shop.prices import price_of\n\ndef total(items):\n    return sum(price_of(item) for item in items)",
      setup: "import os as _os\n_os.makedirs('shop', exist_ok=True)\nwith open('shop/__init__.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('')\n_os.makedirs('shop', exist_ok=True)\nwith open('shop/prices.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('PRICES = {\"tea\": 2.25, \"coffee\": 2.75, \"cake\": 4.0}\\n\\ndef price_of(item):\\n    return PRICES[item]\\n')\ndef _import_both(path):\n    import importlib as _il, sys as _sys, os as _os, io as _io, contextlib as _cl\n    folder = _os.path.dirname(path)\n    if folder:\n        _os.makedirs(folder, exist_ok=True)\n    with open(path, \"w\", encoding=\"utf-8\") as _f:\n        _f.write(_cq_source)\n    name = path[:-3].replace(\"/\", \".\")\n    if name.endswith(\".__init__\"):\n        name = name[:-9]\n    for _k in [k for k in _sys.modules if k == name or k.startswith(name + \".\")]:\n        del _sys.modules[_k]\n    _il.invalidate_caches()\n    import builtins as _bi\n    def _no_input(prompt=\"\"):\n        raise RuntimeError(\"input() ran while the module was being imported: put that code under the main guard\")\n    buf = _io.StringIO()\n    real_input = _bi.input\n    _bi.input = _no_input\n    try:\n        with _cl.redirect_stdout(buf):\n            mod = _il.import_module(name)\n    finally:\n        _bi.input = real_input\n    return mod, buf.getvalue()\ndef _module(path):\n    return _import_both(path)[0]\ndef _import_prints(path):\n    return _import_both(path)[1]\n",
      tests: [
        ["total works", "total([\"coffee\", \"coffee\"]) == 5.5"],
        ["Imported as part of the package", "_module(\"shop/cart.py\").total([\"cake\"]) == 4.0"],
      ],
    }),
    task("hard", "The front door", {
      prompt: "Your code is `shop/__init__.py`. Make `price_of` and `PRICES` available straight from the package, so that `import shop` then `shop.price_of(\"tea\")` works. Use an absolute import.",
      hint: "`from shop.prices import price_of, PRICES`.",
      solution: "from shop.prices import price_of, PRICES",
      setup: "import os as _os\n_os.makedirs('shop', exist_ok=True)\nwith open('shop/prices.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('PRICES = {\"tea\": 2.25, \"coffee\": 2.75, \"cake\": 4.0}\\n\\ndef price_of(item):\\n    return PRICES[item]\\n')\ndef _import_both(path):\n    import importlib as _il, sys as _sys, os as _os, io as _io, contextlib as _cl\n    folder = _os.path.dirname(path)\n    if folder:\n        _os.makedirs(folder, exist_ok=True)\n    with open(path, \"w\", encoding=\"utf-8\") as _f:\n        _f.write(_cq_source)\n    name = path[:-3].replace(\"/\", \".\")\n    if name.endswith(\".__init__\"):\n        name = name[:-9]\n    for _k in [k for k in _sys.modules if k == name or k.startswith(name + \".\")]:\n        del _sys.modules[_k]\n    _il.invalidate_caches()\n    import builtins as _bi\n    def _no_input(prompt=\"\"):\n        raise RuntimeError(\"input() ran while the module was being imported: put that code under the main guard\")\n    buf = _io.StringIO()\n    real_input = _bi.input\n    _bi.input = _no_input\n    try:\n        with _cl.redirect_stdout(buf):\n            mod = _il.import_module(name)\n    finally:\n        _bi.input = real_input\n    return mod, buf.getvalue()\ndef _module(path):\n    return _import_both(path)[0]\ndef _import_prints(path):\n    return _import_both(path)[1]\n",
      tests: [
        ["shop.price_of works", "_module(\"shop/__init__.py\").price_of(\"tea\") == 2.25"],
        ["shop.PRICES is there", "sorted(_module(\"shop/__init__.py\").PRICES) == [\"cake\", \"coffee\", \"tea\"]"],
      ],
    }),
    task("hard", "A package inside a package", {
      prompt: "Using `pathlib`, add a subpackage `shop/payments` (with its own `__init__.py`) containing `cards.py` with `def mask(number): return \"**** \" + number[-4:]`. Then import `mask` from `shop.payments.cards` and set `shown` to `mask(\"4111111111111111\")`.",
      starter: "from pathlib import Path\n",
      hint: "`Path(\"shop/payments\").mkdir()`; the `shop` folder is already there. Then `from shop.payments.cards import mask`.",
      solution: "from pathlib import Path\n\nPath(\"shop/payments\").mkdir(exist_ok=True)\nPath(\"shop/payments/__init__.py\").write_text(\"\")\nPath(\"shop/payments/cards.py\").write_text(\"def mask(number):\\n    return \\\"**** \\\" + number[-4:]\\n\")\n\nfrom shop.payments.cards import mask\n\nshown = mask(\"4111111111111111\")",
      setup: "import os as _os\n_os.makedirs('shop', exist_ok=True)\nwith open('shop/__init__.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('')\n_os.makedirs('shop', exist_ok=True)\nwith open('shop/prices.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('PRICES = {\"tea\": 2.25, \"coffee\": 2.75, \"cake\": 4.0}\\n\\ndef price_of(item):\\n    return PRICES[item]\\n')\n",
      tests: [
        ["shown is masked", "shown == \"**** 1111\""],
        ["The subpackage exists", "__import__(\"os\").path.isfile(\"shop/payments/__init__.py\")"],
        ["mask came from shop.payments.cards", "mask.__module__ == \"shop.payments.cards\""],
      ],
    }),
    task("expert", "What is inside?", {
      prompt: "Import the `shop` package and set `modules` to the sorted names of the modules in it, using `pkgutil.iter_modules(shop.__path__)` (each result has a `.name`).",
      starter: "import pkgutil\n",
      hint: "`import shop`, then `sorted(m.name for m in pkgutil.iter_modules(shop.__path__))`.",
      solution: "import pkgutil\nimport shop\n\nmodules = sorted(m.name for m in pkgutil.iter_modules(shop.__path__))",
      setup: "import os as _os\n_os.makedirs('shop', exist_ok=True)\nwith open('shop/__init__.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('')\n_os.makedirs('shop', exist_ok=True)\nwith open('shop/prices.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('PRICES = {\"tea\": 2.25, \"coffee\": 2.75, \"cake\": 4.0}\\n\\ndef price_of(item):\\n    return PRICES[item]\\n')\n_os.makedirs('shop', exist_ok=True)\nwith open('shop/cart.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('def total(items):\\n    return 0\\n')\n_os.makedirs('shop', exist_ok=True)\nwith open('shop/receipt.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('def show():\\n    pass\\n')\n_os.makedirs('shop', exist_ok=True)\nwith open('shop/notes.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('not a module\\n')\n",
      tests: [
        ["modules is right", "modules == [\"cart\", \"prices\", \"receipt\"]"],
      ],
    }),
    task("expert", "Plug-ins", {
      prompt: "The `plugins` package has modules `upper` and `reverse`, each with a `run(text)` function. Define `apply(name, text)` that imports `plugins.<name>` with `importlib.import_module` and returns its `run(text)`, or raises `ValueError(\"No plugin: <name>\")` if there is no such module.",
      starter: "import importlib\n",
      hint: "Build the name `f\"plugins.{name}\"`, import it inside `try`, and turn `ModuleNotFoundError` into a `ValueError`.",
      solution: "import importlib\n\ndef apply(name, text):\n    try:\n        plugin = importlib.import_module(f\"plugins.{name}\")\n    except ModuleNotFoundError:\n        raise ValueError(f\"No plugin: {name}\")\n    return plugin.run(text)",
      setup: "import os as _os\n_os.makedirs('plugins', exist_ok=True)\nwith open('plugins/__init__.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('')\n_os.makedirs('plugins', exist_ok=True)\nwith open('plugins/upper.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('def run(text):\\n    return text.upper()\\n')\n_os.makedirs('plugins', exist_ok=True)\nwith open('plugins/reverse.py', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('def run(text):\\n    return text[::-1]\\n')\nimport io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["upper", "apply(\"upper\", \"hi\") == \"HI\""],
        ["reverse", "apply(\"reverse\", \"abc\") == \"cba\""],
        ["Unknown plugin", "_error(apply, \"shout\", \"hi\") == \"ValueError: No plugin: shout\""],
      ],
    }),
  ],
  questions: [
    mc("What is a package?", ["A single module", "A folder of modules imported by its name", "A zipped file", "A function with many parts"], 1, "A package groups related modules under one name."),
    mc("Which file makes a folder a regular package?", ["`main.py`", "`package.py`", "`__init__.py`", "`setup.txt`"], 2, "A folder with an `__init__.py` is a regular package."),
    mc("How do you import the `prices` module from the `shop` package?", ["`from shop import prices`", "`import prices from shop`", "`import shop/prices`", "`from prices import shop`"], 0, "`from package import module` imports a module from inside the package."),
    mc("When does `__init__.py` run?", ["Every time a function is called", "Never", "Only when run directly", "When the package is first imported"], 3, "`__init__.py` runs the first time the package is imported."),
    mc("What does the dot mean in `from .prices import price_of`?", ["The whole computer", "This package (a relative import)", "The standard library", "A hidden file"], 1, "A leading dot means \"relative to the current package\"."),
    mc("What happens if you run a file that uses a relative import directly?", ["`ImportError`: no known parent package", "It works the same", "It imports itself", "It prints a warning only"], 0, "Relative imports need a parent package, and a file run directly has none."),
    qShort("What is the full dotted name of `shop/payments/cards.py`?", "shop.payments.cards", "Each folder and the module name are joined with dots."),
    mc("Why are absolute imports the safer default?", ["They are shorter", "They are faster", "They hide the package", "They work both when imported and when run directly"], 3, "An absolute import names the full path, which works however the code is started."),
    mc("Why import names in a package's `__init__.py`?", ["To run them twice", "To delete the modules", "So users can write `shop.price_of` directly", "It is required"], 2, "Names imported in `__init__.py` become part of the package's top level."),
    mc("What is `import shop.prices` then `shop.prices.price_of`?", ["Using the full dotted path", "An error", "A relative import", "A namespace package"], 0, "`import shop.prices` makes `shop.prices` available under its full dotted name."),
  ],
})
