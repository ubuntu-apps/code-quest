// Data and APIs topic: Settings and secrets. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "config_secrets",
  title: "Settings and secrets",
  paragraphs: [
    "Programs that talk to APIs and databases need settings: an API key, a database password, the address of a server. Writing them into the code causes trouble. A key in code that's pushed to GitHub is public, and bots scan for exactly that within minutes. And when the same program runs on your laptop and on a server, the settings differ, so they shouldn't need a code change.",
    "The standard place for settings like these is the **environment**: named text values that every program inherits from whatever started it. You set them in a terminal (`export API_KEY=abc123` on macOS and Linux, `$env:API_KEY=\"abc123\"` in Windows PowerShell), and Python reads them through `os.environ`, which works like a dict:",
    "```\nimport os\n\nmode = os.environ.get(\"APP_MODE\", \"development\")   # a default if it isn't set\nport = int(os.environ.get(\"PORT\", \"8000\"))         # values are always text\nprint(mode, port)\n```",
    "`os.environ.get(name, default)` is the safe way to read one; `os.environ[name]` raises `KeyError` when it's missing. Every value is a string, so convert numbers with `int`, and turn on/off settings into `True` or `False` yourself, accepting the usual spellings like `1`, `true`, `yes` and `on`.",
    "For settings with structure, a settings file is easier to read and edit. The **INI** format, read by the standard `configparser` module, has `[sections]` of `key = value` lines, and its `getint`, `getboolean` and `fallback=` options do the conversions and defaults:",
    "```\nimport configparser\n\nconfig = configparser.ConfigParser()\nconfig.read_string(\"\"\"\n[database]\nhost = db.example.com\nport = 5432\ndebug = no\n\"\"\")\ndb = config[\"database\"]\nprint(db[\"host\"], db.getint(\"port\"), db.getboolean(\"debug\"))   # db.example.com 5432 False\nprint(db.get(\"user\", fallback=\"guest\"))                       # guest\n```",
    "Real programs usually layer their settings: sensible defaults in the code, overridden by a settings file, overridden in turn by environment variables. That way the file holds the everyday values, and a server can change any one of them without touching the file.",
    "Secrets need extra care. Keep them in environment variables, or in a `.env` file that's listed in `.gitignore` so it never reaches version control (the `python-dotenv` package loads one into the environment). Never print or log a secret in full: if you must show which key is in use, show only its last few characters, like `sk-...6789`.",
    "Python here runs in your browser, which has no terminal to set variables in, so the challenges set the values they need themselves.",
  ],
  sandboxCode: "import os\nimport configparser\n\nprint(\"Mode:\", os.environ.get(\"APP_MODE\", \"development\"))\nprint(\"Missing:\", os.environ.get(\"NOT_SET\", \"(default)\"))\n\nconfig = configparser.ConfigParser()\nconfig.read_string(\"[app]\\nname = CodeQuest\\nport = 8080\\n\")\nprint(config[\"app\"][\"name\"], config[\"app\"].getint(\"port\") + 1)",
  sandboxSnippets: [
    snippet("Read with a default", "import os\nprint(os.environ.get(\"SOME_SETTING\", \"default value\"))"),
    snippet("KeyError when missing", "import os\ntry:\n    os.environ[\"DEFINITELY_NOT_SET\"]\nexcept KeyError as e:\n    print(\"KeyError:\", e)"),
    snippet("An INI file", "import configparser\nc = configparser.ConfigParser()\nc.read_string(\"[app]\\ndebug = on\\nretries = 3\\n\")\nprint(c[\"app\"].getboolean(\"debug\"), c[\"app\"].getint(\"retries\"))"),
    snippet("Show a secret safely", "key = \"sk-live-1234567896789\"\nprint(key[:3] + \"...\" + key[-4:])"),
  ],
  readMore: { label: "Python docs: configparser", url: "https://docs.python.org/3/library/configparser.html", source: "Python docs" },
  challenges: [
    task("easy", "Mode with a default", {
      prompt: "Define `get_mode()` that returns the `APP_MODE` environment variable, or `\"development\"` if it isn't set.",
      starter: "import os\n",
      hint: "`os.environ.get(\"APP_MODE\", \"development\")`.",
      solution: "import os\n\ndef get_mode():\n    return os.environ.get(\"APP_MODE\", \"development\")",
      setup: "def _with_env(values, fn, *args):\n    import os as _os\n    saved = {k: _os.environ.get(k) for k in values}\n    for k, v in values.items():\n        if v is None:\n            _os.environ.pop(k, None)\n        else:\n            _os.environ[k] = v\n    try:\n        return fn(*args)\n    finally:\n        for k, v in saved.items():\n            if v is None:\n                _os.environ.pop(k, None)\n            else:\n                _os.environ[k] = v\n",
      tests: [
        ["Not set", "_with_env({\"APP_MODE\": None}, get_mode) == \"development\""],
        ["Set", "_with_env({\"APP_MODE\": \"production\"}, get_mode) == \"production\""],
      ],
    }),
    task("easy", "A port number", {
      prompt: "Define `get_port()` that returns the `PORT` environment variable as an int, or 8000 if it isn't set.",
      starter: "import os\n",
      hint: "Environment values are text: `int(os.environ.get(\"PORT\", \"8000\"))`.",
      solution: "import os\n\ndef get_port():\n    return int(os.environ.get(\"PORT\", \"8000\"))",
      setup: "def _with_env(values, fn, *args):\n    import os as _os\n    saved = {k: _os.environ.get(k) for k in values}\n    for k, v in values.items():\n        if v is None:\n            _os.environ.pop(k, None)\n        else:\n            _os.environ[k] = v\n    try:\n        return fn(*args)\n    finally:\n        for k, v in saved.items():\n            if v is None:\n                _os.environ.pop(k, None)\n            else:\n                _os.environ[k] = v\n",
      tests: [
        ["Not set", "_with_env({\"PORT\": None}, get_port) == 8000"],
        ["Set", "_with_env({\"PORT\": \"5000\"}, get_port) == 5000"],
      ],
    }),
    task("easy", "Read a section", {
      prompt: "Read `settings.ini` with `configparser` and set `host` to the `host` in its `[database]` section and `name` to the `name` in `[app]`.",
      starter: "import configparser\n",
      hint: "`config = configparser.ConfigParser()`, `config.read(\"settings.ini\")`, then `config[\"database\"][\"host\"]`.",
      solution: "import configparser\n\nconfig = configparser.ConfigParser()\nconfig.read(\"settings.ini\")\nhost = config[\"database\"][\"host\"]\nname = config[\"app\"][\"name\"]",
      setup: "import os as _os\nwith open('settings.ini', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('[app]\\nname = CodeQuest\\nport = 8080\\ndebug = yes\\n\\n[database]\\nhost = db.example.com\\nuser = admin\\n')\n",
      tests: [
        ["host", "host == \"db.example.com\""],
        ["name", "name == \"CodeQuest\""],
      ],
    }),
    task("medium", "On or off", {
      prompt: "Define `env_flag(name, default=False)` that reads an environment variable as `True` (`1`, `true`, `yes`, `on`, any case) or `False` (`0`, `false`, `no`, `off`), returns `default` if it isn't set, and raises `ValueError(\"Bad value for <name>: <value>\")` for anything else.",
      starter: "import os\n",
      hint: "Read it with `os.environ.get(name)`; compare `value.strip().lower()` with the two groups of words.",
      solution: "import os\n\ndef env_flag(name, default=False):\n    value = os.environ.get(name)\n    if value is None:\n        return default\n    text = value.strip().lower()\n    if text in (\"1\", \"true\", \"yes\", \"on\"):\n        return True\n    if text in (\"0\", \"false\", \"no\", \"off\"):\n        return False\n    raise ValueError(f\"Bad value for {name}: {value}\")\n",
      setup: "def _with_env(values, fn, *args):\n    import os as _os\n    saved = {k: _os.environ.get(k) for k in values}\n    for k, v in values.items():\n        if v is None:\n            _os.environ.pop(k, None)\n        else:\n            _os.environ[k] = v\n    try:\n        return fn(*args)\n    finally:\n        for k, v in saved.items():\n            if v is None:\n                _os.environ.pop(k, None)\n            else:\n                _os.environ[k] = v\nimport io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["Yes", "_with_env({\"DEBUG\": \"Yes\"}, env_flag, \"DEBUG\") is True"],
        ["Off", "_with_env({\"DEBUG\": \"off\"}, env_flag, \"DEBUG\", True) is False"],
        ["Not set", "_with_env({\"DEBUG\": None}, env_flag, \"DEBUG\", True) is True"],
        ["Nonsense", "_with_env({\"DEBUG\": \"maybe\"}, _error, env_flag, \"DEBUG\") == \"ValueError: Bad value for DEBUG: maybe\""],
      ],
    }),
    task("medium", "Typed settings", {
      prompt: "Define `load_settings(path)` that reads the `[app]` section of an INI file and returns a dict with `name` (text, default `\"app\"`), `port` (int, default 8000) and `debug` (bool, default `False`), using the defaults for anything missing.",
      starter: "import configparser\n",
      hint: "`section = config[\"app\"]` if the file has it; then `section.get(\"name\", fallback=\"app\")`, `section.getint(\"port\", fallback=8000)`, `section.getboolean(\"debug\", fallback=False)`.",
      solution: "import configparser\n\ndef load_settings(path):\n    config = configparser.ConfigParser()\n    config.read(path)\n    if not config.has_section(\"app\"):\n        config.add_section(\"app\")\n    app = config[\"app\"]\n    return {\n        \"name\": app.get(\"name\", fallback=\"app\"),\n        \"port\": app.getint(\"port\", fallback=8000),\n        \"debug\": app.getboolean(\"debug\", fallback=False),\n    }",
      setup: "import os as _os\nwith open('settings.ini', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('[app]\\nname = CodeQuest\\nport = 8080\\ndebug = yes\\n\\n[database]\\nhost = db.example.com\\nuser = admin\\n')\nwith open('small.ini', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('[app]\\nport = 9000\\n')\n",
      tests: [
        ["From the file", "load_settings(\"settings.ini\") == {\"name\": \"CodeQuest\", \"port\": 8080, \"debug\": True}"],
        ["Some missing", "load_settings(\"small.ini\") == {\"name\": \"app\", \"port\": 9000, \"debug\": False}"],
        ["No file at all", "load_settings(\"nothing.ini\") == {\"name\": \"app\", \"port\": 8000, \"debug\": False}"],
      ],
    }),
    task("medium", "Show a secret safely", {
      prompt: "Define `masked(secret)` that shows only the first 3 and last 4 characters, like `sk-...6789`, or `****` for anything shorter than 10 characters.",
      hint: "`secret[:3] + \"...\" + secret[-4:]`, after checking the length.",
      solution: "def masked(secret):\n    if len(secret) < 10:\n        return \"****\"\n    return secret[:3] + \"...\" + secret[-4:]",
      tests: [
        ["A key", "masked(\"sk-live-1234567896789\") == \"sk-...6789\""],
        ["Too short to show", "masked(\"abc123\") == \"****\""],
      ],
    }),
    task("hard", "Required settings", {
      prompt: "Define `require(names)` that returns a dict of the named environment variables, or, if any are missing, raises `RuntimeError(\"Missing settings: A, B\")` listing every missing one in the order given.",
      starter: "import os\n",
      hint: "Collect the missing names first; raise if there are any; otherwise build the dict.",
      solution: "import os\n\ndef require(names):\n    missing = [name for name in names if name not in os.environ]\n    if missing:\n        raise RuntimeError(\"Missing settings: \" + \", \".join(missing))\n    return {name: os.environ[name] for name in names}",
      setup: "def _with_env(values, fn, *args):\n    import os as _os\n    saved = {k: _os.environ.get(k) for k in values}\n    for k, v in values.items():\n        if v is None:\n            _os.environ.pop(k, None)\n        else:\n            _os.environ[k] = v\n    try:\n        return fn(*args)\n    finally:\n        for k, v in saved.items():\n            if v is None:\n                _os.environ.pop(k, None)\n            else:\n                _os.environ[k] = v\nimport io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["All there", "_with_env({\"CQ_A\": \"1\", \"CQ_B\": \"two\"}, require, [\"CQ_A\", \"CQ_B\"]) == {\"CQ_A\": \"1\", \"CQ_B\": \"two\"}"],
        ["Two missing", "_with_env({\"CQ_A\": None, \"CQ_B\": \"two\", \"CQ_C\": None}, _error, require, [\"CQ_A\", \"CQ_B\", \"CQ_C\"]) == \"RuntimeError: Missing settings: CQ_A, CQ_C\""],
      ],
    }),
    task("hard", "Write a settings file", {
      prompt: "Use `configparser` to write `settings.ini` with an `[app]` section (`name = CodeQuest`, `debug = no`) and a `[database]` section (`host = localhost`, `port = 5432`).",
      starter: "import configparser\n",
      hint: "Assign dicts: `config[\"app\"] = {\"name\": \"CodeQuest\", \"debug\": \"no\"}`, then `config.write(f)` with the file open for writing.",
      solution: "import configparser\n\nconfig = configparser.ConfigParser()\nconfig[\"app\"] = {\"name\": \"CodeQuest\", \"debug\": \"no\"}\nconfig[\"database\"] = {\"host\": \"localhost\", \"port\": \"5432\"}\nwith open(\"settings.ini\", \"w\") as f:\n    config.write(f)",
      tests: [
        ["Reads back", "(lambda c: (c.read(\"settings.ini\"), c[\"app\"][\"name\"], c[\"app\"].getboolean(\"debug\"), c[\"database\"].getint(\"port\"), c[\"database\"][\"host\"])[1:])(__import__(\"configparser\").ConfigParser()) == (\"CodeQuest\", False, 5432, \"localhost\")"],
      ],
    }),
    task("expert", "Layered settings", {
      prompt: "Define `settings(path)` that starts from the defaults `{\"host\": \"localhost\", \"port\": 8000, \"debug\": False}`, overrides them with the `[app]` section of the INI file (if there is one), and then with the environment variables `APP_HOST`, `APP_PORT` and `APP_DEBUG`. Ports are ints, and debug values are read like `env_flag` (which is given).",
      starter: "import configparser\nimport os\n\ndef env_flag(name, default=False):\n    value = os.environ.get(name)\n    if value is None:\n        return default\n    text = value.strip().lower()\n    if text in (\"1\", \"true\", \"yes\", \"on\"):\n        return True\n    if text in (\"0\", \"false\", \"no\", \"off\"):\n        return False\n    raise ValueError(f\"Bad value for {name}: {value}\")\n",
      hint: "Apply the layers in order, so the last one wins. For the file, `app.getint` and `app.getboolean` with the current values as `fallback`.",
      solution: "import configparser\nimport os\n\ndef env_flag(name, default=False):\n    value = os.environ.get(name)\n    if value is None:\n        return default\n    text = value.strip().lower()\n    if text in (\"1\", \"true\", \"yes\", \"on\"):\n        return True\n    if text in (\"0\", \"false\", \"no\", \"off\"):\n        return False\n    raise ValueError(f\"Bad value for {name}: {value}\")\n\ndef settings(path):\n    result = {\"host\": \"localhost\", \"port\": 8000, \"debug\": False}\n    config = configparser.ConfigParser()\n    config.read(path)\n    if config.has_section(\"app\"):\n        app = config[\"app\"]\n        result[\"host\"] = app.get(\"host\", fallback=result[\"host\"])\n        result[\"port\"] = app.getint(\"port\", fallback=result[\"port\"])\n        result[\"debug\"] = app.getboolean(\"debug\", fallback=result[\"debug\"])\n    if \"APP_HOST\" in os.environ:\n        result[\"host\"] = os.environ[\"APP_HOST\"]\n    if \"APP_PORT\" in os.environ:\n        result[\"port\"] = int(os.environ[\"APP_PORT\"])\n    result[\"debug\"] = env_flag(\"APP_DEBUG\", result[\"debug\"])\n    return result",
      setup: "def _with_env(values, fn, *args):\n    import os as _os\n    saved = {k: _os.environ.get(k) for k in values}\n    for k, v in values.items():\n        if v is None:\n            _os.environ.pop(k, None)\n        else:\n            _os.environ[k] = v\n    try:\n        return fn(*args)\n    finally:\n        for k, v in saved.items():\n            if v is None:\n                _os.environ.pop(k, None)\n            else:\n                _os.environ[k] = v\n_none = {\"APP_HOST\": None, \"APP_PORT\": None, \"APP_DEBUG\": None}\nimport os as _os\nwith open('app.ini', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('[app]\\nhost = example.com\\nport = 9000\\ndebug = yes\\n')\n",
      tests: [
        ["Defaults", "_with_env(_none, settings, \"none.ini\") == {\"host\": \"localhost\", \"port\": 8000, \"debug\": False}"],
        ["The file", "_with_env(_none, settings, \"app.ini\") == {\"host\": \"example.com\", \"port\": 9000, \"debug\": True}"],
        ["The environment wins", "_with_env(dict(_none, APP_PORT=\"7000\", APP_DEBUG=\"no\"), settings, \"app.ini\") == {\"host\": \"example.com\", \"port\": 7000, \"debug\": False}"],
      ],
    }),
    task("expert", "Read a .env file", {
      prompt: "Define `parse_env(text)` that reads `.env` text into a dict: `KEY=value` lines, ignoring blank lines and `#` comments, allowing an optional `export ` in front, trimming spaces, and removing matching quotes around the value. A line without `=` raises `ValueError(\"Line <n>: <line>\")` (counting from 1).",
      hint: "Loop with `enumerate(text.splitlines(), start=1)`. `line.partition(\"=\")` splits on the first `=`. Strip quotes when the value starts and ends with the same `\"` or `'`.",
      solution: "def parse_env(text):\n    values = {}\n    for number, line in enumerate(text.splitlines(), start=1):\n        line = line.strip()\n        if not line or line.startswith(\"#\"):\n            continue\n        if line.startswith(\"export \"):\n            line = line[len(\"export \"):]\n        key, sep, value = line.partition(\"=\")\n        if not sep:\n            raise ValueError(f\"Line {number}: {line}\")\n        value = value.strip()\n        if len(value) >= 2 and value[0] == value[-1] and value[0] in \"\\\"'\":\n            value = value[1:-1]\n        values[key.strip()] = value\n    return values",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["A .env file", "parse_env(\"# keys\\nAPI_KEY=abc123\\n\\nexport MODE = test\\nNAME=\\\"Code Quest\\\"\\nEMPTY=\\nURL='https://x.org/?a=1'\\n\") == {\"API_KEY\": \"abc123\", \"MODE\": \"test\", \"NAME\": \"Code Quest\", \"EMPTY\": \"\", \"URL\": \"https://x.org/?a=1\"}"],
        ["A broken line", "_error(parse_env, \"A=1\\n\\nBROKEN\") == \"ValueError: Line 3: BROKEN\""],
      ],
    }),
  ],
  questions: [
    mc("Why not write an API key into the code?", ["Keys must be numbers", "It can end up public, for example when the code is pushed to GitHub", "Python can't read it", "It slows the program"], 1),
    mc("What does `os.environ.get(\"PORT\", \"8000\")` return when `PORT` isn't set?", ["`None`", "An error", "`\"8000\"`", "`8000`"], 2),
    mc("What type are environment variable values?", ["Always text (`str`)", "Whatever was set", "`int` or `str`", "`bytes`"], 0),
    mc("What does `os.environ[\"MISSING\"]` do when it isn't set?", ["Returns `None`", "Returns `\"\"`", "Creates it", "Raises `KeyError`"], 3),
    mc("Which standard module reads INI settings files?", ["`settings`", "`configparser`", "`ini`", "`json`"], 1),
    mc("In a layered setup, which usually wins?", ["Environment variables, then the file, then the code's defaults", "The code's defaults", "The file always", "Whichever is longest"], 0),
    qShort("Which file lists files that git should never commit, such as `.env`? (the file name)", ".gitignore"),
    mc("How should a program show which secret key it uses?", ["Print it in full", "Never mention it", "Write it to a log", "Show only its last few characters"], 3),
    mc("What does `getboolean` accept as true?", ["Only `True`", "Only `1`", "Words like `yes`, `on`, `true` and `1`", "Any text"], 2),
    mc("Where do environment variables come from?", ["Whatever started the program, such as the terminal", "The Python installation", "The internet", "The code itself only"], 0),
  ],
})
