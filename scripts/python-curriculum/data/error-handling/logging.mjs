// Errors and exceptions topic: Logging. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "logging_basics",
  title: "Logging",
  paragraphs: [
    "`print` is fine for showing results, but real programs also need a record of what they did and what went wrong, one you can turn up when hunting a bug and down when everything's fine. That's what the `logging` module is for.",
    "Every log message has a **level** that says how important it is. From least to most serious: `DEBUG` (details for finding bugs), `INFO` (normal events, like \"order saved\"), `WARNING` (something odd, but the program carries on), `ERROR` (something failed) and `CRITICAL` (the program can't go on).",
    "```\nimport logging\n\nlogging.warning(\"Disk almost full\")   # shown\nlogging.info(\"Started\")               # hidden: below the default level\n```",
    "By default only `WARNING` and above are shown, in the form `WARNING:root:Disk almost full` (`root` is the name of the default logger). To change that, call `logging.basicConfig` **once**, at the start of the program, before logging anything. `level` sets the lowest level shown and `format` sets the layout:",
    "```\nimport logging\n\nlogging.basicConfig(level=logging.INFO, format=\"%(levelname)s: %(message)s\")\nlogging.info(\"Started\")              # INFO: Started\nlogging.debug(\"x is 5\")              # hidden: DEBUG is below INFO\nlogging.error(\"Could not save\")      # ERROR: Could not save\n```",
    "Useful format fields are `%(levelname)s`, `%(message)s`, `%(name)s` (the logger's name) and `%(asctime)s` (the time). Logging normally writes to the error output, separate from `print`; in CodeQuest both appear in the Output box, and each run starts with logging back at its defaults.",
    "In bigger programs, each file gets its own named logger with `logger = logging.getLogger(__name__)` and calls `logger.info(...)` on it, so every message says where it came from. Inside an `except` block, `logger.exception(\"Saving failed\")` logs at `ERROR` level **and** includes the traceback.",
    "Two habits. Let logging fill in values for you: `logger.info(\"Total: %s\", total)` only builds the text if the message is actually shown. And turn your temporary debug `print`s into `logger.debug(...)` calls: they stay silent until you set the level to `DEBUG`, so you can leave them in.",
  ],
  sandboxCode: "import logging\n\nlogging.basicConfig(level=logging.INFO, format=\"%(levelname)s: %(message)s\")\nlogger = logging.getLogger(\"shop\")\n\nlogger.info(\"Shop opened\")\nlogger.debug(\"This is hidden at INFO level\")\ntry:\n    1 / 0\nexcept ZeroDivisionError:\n    logger.exception(\"Price calculation failed\")\nlogger.warning(\"Only %s items left\", 3)",
  sandboxSnippets: [
    snippet("The default level", "import logging\n\nlogging.debug(\"debug\")\nlogging.info(\"info\")\nlogging.warning(\"warning\")\nlogging.error(\"error\")"),
    snippet("Set the level and format", "import logging\n\nlogging.basicConfig(level=logging.DEBUG, format=\"%(levelname)s - %(message)s\")\nlogging.debug(\"now visible\")\nlogging.info(\"so is this\")"),
    snippet("A named logger", "import logging\n\nlogging.basicConfig(level=logging.INFO, format=\"%(name)s | %(levelname)s | %(message)s\")\nlogger = logging.getLogger(\"payments\")\nlogger.info(\"Payment received\")"),
    snippet("Log an exception", "import logging\n\ntry:\n    {}[\"missing\"]\nexcept KeyError:\n    logging.exception(\"Lookup failed\")"),
    snippet("Values the lazy way", "import logging\n\nlogging.basicConfig(level=logging.INFO, format=\"%(message)s\")\ntotal = 42.5\nlogging.info(\"Total: %s, items: %d\", total, 3)"),
  ],
  readMore: { label: "Python docs: logging how-to", url: "https://docs.python.org/3/howto/logging.html", source: "Python docs" },
  challenges: [
    task("easy", "A warning", {
      prompt: "Import `logging` and log the warning `Low battery`.",
      hint: "`import logging`, then `logging.warning(\"Low battery\")`.",
      solution: "import logging\n\nlogging.warning(\"Low battery\")",
      tests: [
        ["Logs the warning", "\"WARNING:root:Low battery\" in _cq_stdout"],
      ],
    }),
    task("easy", "Show the info", {
      prompt: "Set up logging so `INFO` messages are shown, then log `Starting` at `INFO` level.",
      starter: "import logging\n\n",
      hint: "`logging.basicConfig(level=logging.INFO)` first, then `logging.info(\"Starting\")`.",
      solution: "import logging\n\nlogging.basicConfig(level=logging.INFO)\nlogging.info(\"Starting\")",
      tests: [
        ["Logs the info message", "\"INFO:root:Starting\" in _cq_stdout"],
      ],
    }),
    task("easy", "A tidier format", {
      prompt: "Set the format to `%(levelname)s: %(message)s`, then log the error `Disk full`.",
      starter: "import logging\n\n",
      hint: "`logging.basicConfig(format=\"%(levelname)s: %(message)s\")`, then `logging.error(\"Disk full\")`.",
      solution: "import logging\n\nlogging.basicConfig(format=\"%(levelname)s: %(message)s\")\nlogging.error(\"Disk full\")",
      tests: [
        ["Prints ERROR: Disk full", "_cq_stdout.strip() == \"ERROR: Disk full\""],
      ],
    }),
    task("medium", "Log from a function", {
      prompt: "Define `process(order_id)` that logs `Processing order <id>` at `INFO` level and returns `done`.",
      starter: "import logging\n\n",
      hint: "`logging.info(f\"Processing order {order_id}\")` inside the function (or `logging.info(\"Processing order %s\", order_id)`).",
      solution: "import logging\n\ndef process(order_id):\n    logging.info(\"Processing order %s\", order_id)\n    return \"done\"",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["Logs at INFO", "_logs(process, 7) == [\"INFO: Processing order 7\"]"],
        ["Returns done", "process(1) == \"done\""],
      ],
    }),
    task("medium", "Pick the level", {
      prompt: "Define `check_temp(t)` that logs `Temperature <t>` at `DEBUG` level when `t` is 30 or below, at `WARNING` above 30, and at `ERROR` above 40.",
      starter: "import logging\n\n",
      hint: "Check the highest band first: `if t > 40: logging.error(...)`, `elif t > 30: logging.warning(...)`, `else: logging.debug(...)`.",
      solution: "import logging\n\ndef check_temp(t):\n    if t > 40:\n        logging.error(\"Temperature %s\", t)\n    elif t > 30:\n        logging.warning(\"Temperature %s\", t)\n    else:\n        logging.debug(\"Temperature %s\", t)",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["20 is DEBUG", "_logs(check_temp, 20) == [\"DEBUG: Temperature 20\"]"],
        ["35 is WARNING", "_logs(check_temp, 35) == [\"WARNING: Temperature 35\"]"],
        ["45 is ERROR", "_logs(check_temp, 45) == [\"ERROR: Temperature 45\"]"],
      ],
    }),
    task("medium", "A named logger", {
      prompt: "Set the format to `%(name)s: %(levelname)s: %(message)s` with level `INFO`, create `logger = logging.getLogger(\"shop\")`, and log `Opened` at `INFO` level with it.",
      starter: "import logging\n\n",
      hint: "Call `basicConfig` with both `level` and `format`, then `logger.info(\"Opened\")`.",
      solution: "import logging\n\nlogging.basicConfig(level=logging.INFO, format=\"%(name)s: %(levelname)s: %(message)s\")\nlogger = logging.getLogger(\"shop\")\nlogger.info(\"Opened\")",
      tests: [
        ["Prints shop: INFO: Opened", "_cq_stdout.strip() == \"shop: INFO: Opened\""],
      ],
    }),
    task("hard", "Log the exception", {
      prompt: "Define `safe_divide(a, b)` that returns `a / b`, or logs `Division failed` with `logging.exception` and returns `None` when it fails.",
      starter: "import logging\n\n",
      hint: "In `except ZeroDivisionError:` call `logging.exception(\"Division failed\")`, then `return None`.",
      solution: "import logging\n\ndef safe_divide(a, b):\n    try:\n        return a / b\n    except ZeroDivisionError:\n        logging.exception(\"Division failed\")\n        return None",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["Works normally", "safe_divide(6, 3) == 2"],
        ["Logs at ERROR", "_logs(safe_divide, 1, 0) == [\"ERROR: Division failed\"]"],
        ["Returns None", "(lambda: safe_divide(1, 0))() is None"],
      ],
    }),
    task("hard", "Debug lines, not prints", {
      prompt: "Replace the two `print` calls in `total` with `logging.debug` calls, so they stay silent unless the level is `DEBUG`.",
      starter: "import logging\n\ndef total(prices):\n    result = 0\n    for p in prices:\n        print(f\"adding {p}\")\n        result += p\n    print(f\"total is {result}\")\n    return result\n",
      hint: "Change each `print(...)` to `logging.debug(...)` with the same text.",
      solution: "import logging\n\ndef total(prices):\n    result = 0\n    for p in prices:\n        logging.debug(f\"adding {p}\")\n        result += p\n    logging.debug(f\"total is {result}\")\n    return result",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["Still adds up", "total([1, 2]) == 3"],
        ["Nothing printed", "_out(total, [1, 2]) == \"\""],
        ["Logs at DEBUG", "_logs(total, [1, 2]) == [\"DEBUG: adding 1\", \"DEBUG: adding 2\", \"DEBUG: total is 3\"]"],
      ],
    }),
    task("expert", "Lines up neatly", {
      prompt: "Configure logging with level `DEBUG` and the format `%(levelname)-8s %(message)s` (the `-8` pads the level to 8 characters), then log `Loading` at `DEBUG` and `Retrying` at `WARNING`.",
      starter: "import logging\n\n",
      hint: "One `basicConfig` call with both settings, then `logging.debug(...)` and `logging.warning(...)`.",
      solution: "import logging\n\nlogging.basicConfig(level=logging.DEBUG, format=\"%(levelname)-8s %(message)s\")\nlogging.debug(\"Loading\")\nlogging.warning(\"Retrying\")",
      tests: [
        ["Both lines, aligned", "_cq_stdout.splitlines() == [\"DEBUG    Loading\", \"WARNING  Retrying\"]"],
      ],
    }),
    task("expert", "Count the log levels", {
      prompt: "Define `level_counts(lines)` for log lines like `ERROR: Disk full`: return a dict counting each level. Skip lines without `: `, logging `Skipping line <n>` at `WARNING` level (counting from 1).",
      starter: "import logging\n\n",
      hint: "Loop with `enumerate(lines, start=1)`. If `\": \" not in line`, log the warning and `continue`; otherwise `level = line.split(\": \", 1)[0]`.",
      solution: "import logging\n\ndef level_counts(lines):\n    counts = {}\n    for n, line in enumerate(lines, start=1):\n        if \": \" not in line:\n            logging.warning(\"Skipping line %s\", n)\n            continue\n        level = line.split(\": \", 1)[0]\n        counts[level] = counts.get(level, 0) + 1\n    return counts",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["Counts the levels", "level_counts([\"INFO: a\", \"ERROR: b\", \"INFO: c\"]) == {\"INFO\": 2, \"ERROR\": 1}"],
        ["Warns about a bad line", "_logs(level_counts, [\"INFO: a\", \"garbage\"]) == [\"WARNING: Skipping line 2\"]"],
      ],
    }),
  ],
  questions: [
    mc("Which levels are shown by default?", ["All of them", "`WARNING` and above", "Only `DEBUG`", "Only `ERROR`"], 1),
    mc("Which level is meant for details used when hunting bugs?", ["`INFO`", "`WARNING`", "`DEBUG`", "`CRITICAL`"], 2),
    mc("When should `logging.basicConfig` be called?", ["Once, at the start, before logging anything", "Before every message", "At the end of the program", "Never"], 0),
    mc("What does `%(levelname)s` put in a log line?", ["The time", "The file name", "The message", "The level, such as `ERROR`"], 3),
    qShort("Which logging level comes between INFO and ERROR? (one word)", "WARNING"),
    mc("What does `logger.exception(\"Save failed\")` do inside `except`?", ["Raises the exception again", "Logs at ERROR level and includes the traceback", "Hides the error", "Prints only the message"], 1),
    mc("Why use `logging.getLogger(__name__)` in bigger programs?", ["Each message then says which part of the program it came from", "It is faster", "It turns off logging", "It sets the level to DEBUG"], 0),
    mc("Why turn debug `print`s into `logger.debug` calls?", ["They print in colour", "They run faster", "They stay silent until the level is DEBUG, so you can leave them in", "They raise errors"], 2),
    mc("With `level=logging.INFO`, is `logging.debug(\"x\")` shown?", ["Yes", "Only once", "Only in functions", "No: DEBUG is below INFO"], 3),
    mc("What is the benefit of `logger.info(\"Total: %s\", total)`?", ["It is shorter", "The text is only built if the message is shown", "It shows more decimals", "It raises on errors"], 1),
  ],
})
