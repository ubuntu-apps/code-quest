// Modules and packages topic: Installing packages: pip and venv. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "pip_venv",
  title: "Installing packages: pip and venv",
  paragraphs: [
    "Beyond the standard library, the **Python Package Index** (PyPI, at pypi.org) has hundreds of thousands of packages written by other people: `requests` for the web, `pandas` for tables of data, `pytest` for testing, `flask` for websites. The tool that installs them is **pip**. You run it in a terminal, not inside a Python program:",
    "```\npython -m pip install requests             # the latest version\npython -m pip install \"requests==2.32.3\"   # one exact version\npython -m pip install --upgrade requests   # a newer version\npython -m pip list                         # what is installed\npython -m pip uninstall requests\n```",
    "After that, `import requests` works like any other import. The name you install isn't always the name you import: you install `beautifulsoup4` but `import bs4`, and install `Pillow` but `import PIL`. A package's page on PyPI shows both.",
    "Installing everything into one shared Python soon causes trouble: one project needs version 1 of a package, another needs version 2. A **virtual environment** gives each project its own private set of packages. You create one per project, switch it on, and anything pip installs goes into it:",
    "```\npython -m venv .venv             # once, in the project folder\nsource .venv/bin/activate        # macOS and Linux\n.venv\\Scripts\\activate           # Windows\npython -m pip install requests   # goes into .venv only\ndeactivate                       # switch it off again\n```",
    "A project lists the packages it needs in a file called `requirements.txt`, one per line, usually pinned to exact versions so everyone gets the same ones. `pip freeze > requirements.txt` writes the list from what's installed, and `pip install -r requirements.txt` installs it all on another computer. The `.venv` folder itself is never shared or committed; the requirements file is.",
    "```\n# requirements.txt\nrequests==2.32.3\npandas==2.2.2\npytest>=8.0\n```",
    "Versions are usually written `MAJOR.MINOR.PATCH`: a new major version may break your code, a minor one adds features, a patch only fixes bugs. Compare versions as numbers, not text: as strings, `\"2.10\" < \"2.9\"`, because the character `1` comes before `9`. Splitting on dots and comparing tuples of ints, `(2, 10) > (2, 9)`, gets it right.",
    "Inside Python, `sys.prefix` is the folder of the Python that's running; in a virtual environment it differs from `sys.base_prefix`, so comparing them tells you whether one is active.",
    "This app runs Python in your browser, so there's no terminal and no pip here, but popular packages like `numpy` and `pandas` are ready to import, as the Data and APIs quest shows. The challenges practise what you can do in code: reading requirement files, comparing versions and checking the environment.",
  ],
  sandboxCode: "import sys\n\nprint(\"Python\", sys.version.split()[0])\nprint(\"In a virtual environment?\", sys.prefix != sys.base_prefix)\n\ndef parse_version(text):\n    return tuple(int(part) for part in text.split(\".\"))\n\nprint(\"2.10\" > \"2.9\", parse_version(\"2.10\") > parse_version(\"2.9\"))",
  sandboxSnippets: [
    snippet("Split a pin", "line = \"pandas==2.2.2\"\nname, version = line.split(\"==\")\nprint(name, version)"),
    snippet("Text vs numbers", "print(sorted([\"1.10.0\", \"1.9.0\", \"1.2.0\"]))\nprint(sorted([\"1.10.0\", \"1.9.0\", \"1.2.0\"], key=lambda v: tuple(map(int, v.split(\".\")))))"),
    snippet("Read requirements", "from pathlib import Path\nPath(\"requirements.txt\").write_text(\"# web\\nrequests==2.32.3\\n\\npandas==2.2.2\\n\")\nfor line in Path(\"requirements.txt\").read_text().splitlines():\n    if line.strip() and not line.startswith(\"#\"):\n        print(line.split(\"==\"))"),
    snippet("Is it installed?", "import importlib.util\nfor name in [\"json\", \"requests\", \"numpy\"]:\n    print(name, importlib.util.find_spec(name) is not None)"),
  ],
  readMore: { label: "Python Packaging: Installing packages", url: "https://packaging.python.org/en/latest/tutorials/installing-packages/", source: "Python Packaging Authority" },
  challenges: [
    task("easy", "Name and version", {
      prompt: "Split the pinned requirement `line` into `name` and `version`.",
      starter: "line = \"requests==2.32.3\"\n",
      hint: "`name, version = line.split(\"==\")`.",
      solution: "line = \"requests==2.32.3\"\nname, version = line.split(\"==\")",
      tests: [
        ["name is requests", "name == \"requests\""],
        ["version is 2.32.3", "version == \"2.32.3\""],
      ],
    }),
    task("easy", "Write the requirements", {
      prompt: "Write `requirements.txt` with two pinned packages, one per line: `requests` version `2.32.3` and `pandas` version `2.2.2`.",
      hint: "Each line is `name==version`, ending with `\\n`.",
      solution: "with open(\"requirements.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"requests==2.32.3\\n\")\n    f.write(\"pandas==2.2.2\\n\")",
      setup: "def _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["The file is right", "_read(\"requirements.txt\") == \"requests==2.32.3\\npandas==2.2.2\\n\""],
      ],
    }),
    task("easy", "In a virtual environment?", {
      prompt: "Set `in_venv` to whether a virtual environment is active, by comparing `sys.prefix` with `sys.base_prefix`.",
      starter: "import sys\n",
      hint: "They differ inside a virtual environment: `sys.prefix != sys.base_prefix`.",
      solution: "import sys\n\nin_venv = sys.prefix != sys.base_prefix",
      tests: [
        ["in_venv is right", "in_venv == (__import__(\"sys\").prefix != __import__(\"sys\").base_prefix)"],
        ["Compared the prefixes", "\"base_prefix\" in _cq_source"],
      ],
    }),
    task("medium", "Read requirements.txt", {
      prompt: "Define `read_requirements(name)` that returns a dict from package name to pinned version for the file `name`. Skip blank lines and `#` comments; a line without `==` gets the version `None`.",
      hint: "For each stripped line: skip it if empty or starting with `#`; if `\"==\" in line`, split it; otherwise the version is `None`.",
      solution: "def read_requirements(name):\n    packages = {}\n    with open(name, encoding=\"utf-8\") as f:\n        for line in f:\n            line = line.strip()\n            if not line or line.startswith(\"#\"):\n                continue\n            if \"==\" in line:\n                package, version = line.split(\"==\")\n                packages[package] = version\n            else:\n                packages[line] = None\n    return packages",
      setup: "import os as _os\nwith open('requirements.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('# web\\nrequests==2.32.3\\n\\n# data\\npandas==2.2.2\\nrich\\n')\n",
      tests: [
        ["Reads the file", "read_requirements(\"requirements.txt\") == {\"requests\": \"2.32.3\", \"pandas\": \"2.2.2\", \"rich\": None}"],
      ],
    }),
    task("medium", "Versions as numbers", {
      prompt: "Define `parse_version(text)` that turns `\"2.10.1\"` into the tuple `(2, 10, 1)`, so versions compare correctly.",
      hint: "`tuple(int(part) for part in text.split(\".\"))`.",
      solution: "def parse_version(text):\n    return tuple(int(part) for part in text.split(\".\"))\n",
      tests: [
        ["Three parts", "parse_version(\"2.10.1\") == (2, 10, 1)"],
        ["Compares as numbers", "parse_version(\"2.10.0\") > parse_version(\"2.9.5\")"],
        ["Two parts", "parse_version(\"3.12\") == (3, 12)"],
      ],
    }),
    task("medium", "Install name, import name", {
      prompt: "Define `import_name(package)` that returns the name you import for a package you install. Use the `KNOWN` dict for the unusual ones; otherwise it's the package name in lowercase with `-` changed to `_`.",
      starter: "KNOWN = {\"beautifulsoup4\": \"bs4\", \"Pillow\": \"PIL\", \"scikit-learn\": \"sklearn\", \"python-dateutil\": \"dateutil\"}\n",
      hint: "`KNOWN.get(package, package.lower().replace(\"-\", \"_\"))`.",
      solution: "KNOWN = {\"beautifulsoup4\": \"bs4\", \"Pillow\": \"PIL\", \"scikit-learn\": \"sklearn\", \"python-dateutil\": \"dateutil\"}\n\ndef import_name(package):\n    return KNOWN.get(package, package.lower().replace(\"-\", \"_\"))",
      tests: [
        ["A known one", "import_name(\"beautifulsoup4\") == \"bs4\" and import_name(\"Pillow\") == \"PIL\""],
        ["A plain one", "import_name(\"requests\") == \"requests\""],
        ["Dashes and capitals", "import_name(\"My-Tool\") == \"my_tool\""],
      ],
    }),
    task("hard", "Newest first", {
      prompt: "Define `newest_first(versions)` that returns the version strings sorted from newest to oldest, comparing them as numbers.",
      starter: "def parse_version(text):\n    return tuple(int(part) for part in text.split(\".\"))\n",
      hint: "`sorted(versions, key=parse_version, reverse=True)`.",
      solution: "def parse_version(text):\n    return tuple(int(part) for part in text.split(\".\"))\n\ndef newest_first(versions):\n    return sorted(versions, key=parse_version, reverse=True)",
      tests: [
        ["Sorted as numbers", "newest_first([\"1.9.0\", \"1.10.0\", \"1.2.3\", \"2.0.0\"]) == [\"2.0.0\", \"1.10.0\", \"1.9.0\", \"1.2.3\"]"],
        ["Empty", "newest_first([]) == []"],
      ],
    }),
    task("hard", "Does it match?", {
      prompt: "Define `satisfies(version, spec)` where `spec` is an operator and a version, like `\">=2.0\"`, `\"==1.4.2\"`, `\"<3\"`, `\"<=2.5\"` or `\">1.0\"`. Return whether `version` meets it.",
      starter: "def parse_version(text):\n    return tuple(int(part) for part in text.split(\".\"))\n",
      hint: "Check the two-character operators (`==`, `>=`, `<=`) before the one-character ones (`>`, `<`), then compare `parse_version` tuples.",
      solution: "def parse_version(text):\n    return tuple(int(part) for part in text.split(\".\"))\n\ndef satisfies(version, spec):\n    v = parse_version(version)\n    for op in [\"==\", \">=\", \"<=\", \">\", \"<\"]:\n        if spec.startswith(op):\n            target = parse_version(spec[len(op):])\n            break\n    else:\n        raise ValueError(f\"Unknown spec: {spec}\")\n    if op == \"==\":\n        return v == target\n    if op == \">=\":\n        return v >= target\n    if op == \"<=\":\n        return v <= target\n    if op == \">\":\n        return v > target\n    return v < target",
      tests: [
        ["At least", "satisfies(\"2.10.1\", \">=2.9\") is True and satisfies(\"1.9\", \">=2.0\") is False"],
        ["Exactly", "satisfies(\"1.4.2\", \"==1.4.2\") is True and satisfies(\"1.4.3\", \"==1.4.2\") is False"],
        ["Below", "satisfies(\"2.10.1\", \"<3\") is True and satisfies(\"3.0.1\", \"<3\") is False"],
        ["The others", "satisfies(\"2.5\", \"<=2.5\") is True and satisfies(\"1.0\", \">1.0\") is False"],
      ],
    }),
    task("expert", "Check the environment", {
      prompt: "Define `check(installed)` that compares the pinned packages in `requirements.txt` with `installed`, a dict from name to version. Return a list of problems in file order: `missing: <name>` or `wrong version: <name> <installed> (need <pinned>)`.",
      hint: "Read the `name==version` lines (skip blanks and comments). For each, look the name up in `installed`.",
      solution: "def check(installed):\n    problems = []\n    with open(\"requirements.txt\", encoding=\"utf-8\") as f:\n        for line in f:\n            line = line.strip()\n            if not line or line.startswith(\"#\"):\n                continue\n            name, pinned = line.split(\"==\")\n            if name not in installed:\n                problems.append(f\"missing: {name}\")\n            elif installed[name] != pinned:\n                problems.append(f\"wrong version: {name} {installed[name]} (need {pinned})\")\n    return problems",
      setup: "import os as _os\nwith open('requirements.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('requests==2.32.3\\n# data\\npandas==2.2.2\\n\\nrich==13.7.1\\n')\n",
      tests: [
        ["Two problems", "check({\"requests\": \"2.32.3\", \"pandas\": \"2.1.0\"}) == [\"wrong version: pandas 2.1.0 (need 2.2.2)\", \"missing: rich\"]"],
        ["All good", "check({\"requests\": \"2.32.3\", \"pandas\": \"2.2.2\", \"rich\": \"13.7.1\", \"numpy\": \"2.0.0\"}) == []"],
      ],
    }),
    task("expert", "Bump the version", {
      prompt: "Define `bump(version, part)` that returns the next version: `\"major\"` turns `1.4.2` into `2.0.0`, `\"minor\"` into `1.5.0`, and `\"patch\"` into `1.4.3`. Any other part raises `ValueError`.",
      hint: "Split into three ints. Raising one part resets the parts after it to 0.",
      solution: "def bump(version, part):\n    major, minor, patch = (int(p) for p in version.split(\".\"))\n    if part == \"major\":\n        return f\"{major + 1}.0.0\"\n    if part == \"minor\":\n        return f\"{major}.{minor + 1}.0\"\n    if part == \"patch\":\n        return f\"{major}.{minor}.{patch + 1}\"\n    raise ValueError(f\"Unknown part: {part}\")",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\n",
      tests: [
        ["major", "bump(\"1.4.2\", \"major\") == \"2.0.0\""],
        ["minor", "bump(\"1.4.2\", \"minor\") == \"1.5.0\""],
        ["patch", "bump(\"1.9.9\", \"patch\") == \"1.9.10\""],
        ["Unknown part", "_raises(bump, \"1.0.0\", \"huge\") == \"ValueError\""],
      ],
    }),
  ],
  questions: [
    mc("What is PyPI?", ["A standard library module", "The Python Package Index, where packages are published", "A type of virtual environment", "A Python version"], 1, "PyPI is the public index of Python packages that `pip` downloads from."),
    mc("Where do you run `pip install`?", ["Inside a Python program", "In the `import` line", "In a terminal", "In requirements.txt"], 2, "`pip` is a command-line tool, not Python code."),
    mc("In `requirements.txt`, what does `requests>=2.31` allow?", ["Exactly version 2.31", "Version 2.31 or any newer one", "Any version below 2.31", "Only 2.31.x patch releases"], 1, "`>=` sets a minimum version; `==` pins one exact version."),
    mc("What does `pip install -r requirements.txt` do?", ["Removes the packages", "Reads the file aloud", "Creates a virtual environment", "Installs every package listed in the file"], 3, "`-r` reads the package list from a file."),
    mc("What does `requests==2.32.3` mean in requirements.txt?", ["At least 2.32.3", "Exactly version 2.32.3", "Any version but 2.32.3", "Version 2 or 32 or 3"], 1, "`==` pins an exact version, so everyone gets the same one."),
    mc("You install `beautifulsoup4`. What do you import?", ["`bs4`", "`beautifulsoup4`", "`soup`", "`beautifulsoup`"], 0, "A package's install name and its import name can differ: `beautifulsoup4` is imported as `bs4`."),
    qShort("Is `\"2.10\" > \"2.9\"` True or False when compared as strings?", "False", "Strings compare character by character, and \"1\" comes before \"9\", so compare versions as numbers."),
    mc("Which should not be shared or committed with a project?", ["`requirements.txt`", "The source code", "The README", "The `.venv` folder"], 3, "A virtual environment is rebuilt from `requirements.txt`, so the folder itself isn't shared."),
    mc("In `MAJOR.MINOR.PATCH`, which change may break your code?", ["A patch", "A minor change", "A new major version", "None of them"], 2, "Semantic versioning saves breaking changes for new major versions."),
    mc("How can a program tell that a virtual environment is active?", ["`sys.prefix != sys.base_prefix`", "`sys.version`", "`import venv`", "`sys.path[0] == \"\"`"], 0, "In a venv, `sys.prefix` points at the venv, while `sys.base_prefix` stays the main install."),
  ],
})
