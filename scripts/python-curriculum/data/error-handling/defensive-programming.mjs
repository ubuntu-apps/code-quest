// Errors and exceptions topic: Defensive programming. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task, typedInput } from '../_builders.mjs'

export default makeTopic({
  id: "defensive_programming",
  title: "Defensive programming",
  paragraphs: [
    "**Defensive programming** means writing code that expects things to go wrong: odd input, missing data, values out of range. Instead of hoping for the best, it checks what it's given, handles the problems it can, and fails clearly on the ones it can't.",
    "The most useful habit is the **guard clause**: check the inputs at the top of a function and leave early (with `raise` or `return`) when something's wrong. The rest of the function can then trust its inputs, with no deep nesting of `if`s:",
    "```\ndef discount(price, percent):\n    if price < 0:\n        raise ValueError(\"price can't be negative\")\n    if not 0 <= percent <= 100:\n        raise ValueError(\"percent must be 0 to 100\")\n    return price * (1 - percent / 100)\n```",
    "**Normalise before you check.** People type `\" Yes\"`, `\"YES\"` and `\"y\"` for the same answer. Clean the input first with `strip()` and `lower()`, then compare against a small set of accepted values, and reject everything else with a clear message.",
    "There are two styles of checking. **Look before you leap** (LBYL) tests first: `if key in prices:`. **Easier to ask forgiveness than permission** (EAFP) just tries, and catches the exception: `try: prices[key]`. Python code often prefers EAFP, especially when the check and the action could disagree, as with conversions: `int(text)` inside `try` is simpler and more reliable than checking every character first.",
    "```\ndef safe_int(text, default=0):\n    try:\n        return int(text)\n    except (ValueError, TypeError):\n        return default\n\nprint(safe_int(\"42\"), safe_int(\"x\"), safe_int(None, -1))   # 42 0 -1\n```",
    "**Fail loudly, not silently.** Returning a made-up value when something is wrong (a 0 for a missing price, an empty list for a broken file) lets bad data spread. Use a default only when it's genuinely correct to carry on; otherwise raise, and let the caller decide.",
    "When there are many rules to check, such as a sign-up form, it's often kinder to **collect every problem** and report them together rather than stopping at the first. Each check appends a message to a list, and an empty list means the data is valid.",
  ],
  sandboxCode: "def parse_answer(text):\n    answer = text.strip().lower()\n    if answer in (\"y\", \"yes\"):\n        return True\n    if answer in (\"n\", \"no\"):\n        return False\n    raise ValueError(f\"Please answer yes or no, not {text!r}\")\n\nfor text in [\" Yes\", \"n\", \"maybe\"]:\n    try:\n        print(repr(text), \"->\", parse_answer(text))\n    except ValueError as e:\n        print(e)",
  sandboxSnippets: [
    snippet("Guard clauses", "def discount(price, percent):\n    if price < 0:\n        raise ValueError(\"price can't be negative\")\n    if not 0 <= percent <= 100:\n        raise ValueError(\"percent must be 0 to 100\")\n    return price * (1 - percent / 100)\n\nprint(discount(80, 25))\nprint(discount(80, 150))"),
    snippet("Normalise first", "for text in [\"  YES \", \"Yes\", \"yes\"]:\n    print(repr(text), \"->\", text.strip().lower())"),
    snippet("LBYL and EAFP", "prices = {\"tea\": 2.5}\nitem = \"jam\"\nif item in prices:\n    print(prices[item])\nelse:\n    print(\"no price (LBYL)\")\ntry:\n    print(prices[item])\nexcept KeyError:\n    print(\"no price (EAFP)\")"),
    snippet("Collect the problems", "form = {\"name\": \"\", \"age\": \"abc\"}\nproblems = []\nif not form[\"name\"].strip():\n    problems.append(\"name is required\")\nif not form[\"age\"].isdigit():\n    problems.append(\"age must be a number\")\nprint(problems or \"all good\")"),
  ],
  readMore: { label: "Python glossary: EAFP", url: "https://docs.python.org/3/glossary.html#term-EAFP", source: "Python docs" },
  challenges: [
    task("easy", "Guard the discount", {
      prompt: "Define `discount(price, percent)` that returns the discounted price, with guard clauses raising `ValueError(\"price can't be negative\")` and `ValueError(\"percent must be 0 to 100\")`.",
      hint: "Two `if ...: raise` lines at the top, then `return price * (1 - percent / 100)`.",
      solution: "def discount(price, percent):\n    if price < 0:\n        raise ValueError(\"price can't be negative\")\n    if not 0 <= percent <= 100:\n        raise ValueError(\"percent must be 0 to 100\")\n    return price * (1 - percent / 100)",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["discount(80, 25)", "discount(80, 25) == 60"],
        ["A negative price", "_error(discount, -5, 10) == \"ValueError: price can't be negative\""],
        ["Too much off", "_error(discount, 80, 150) == \"ValueError: percent must be 0 to 100\""],
      ],
    }),
    task("easy", "Yes or no", {
      prompt: "Define `parse_answer(text)` that returns `True` for `y`/`yes` and `False` for `n`/`no`, ignoring spaces and capitals, and raises `ValueError(\"Please answer yes or no\")` for anything else.",
      hint: "Normalise with `text.strip().lower()`, then check `in (\"y\", \"yes\")` and `in (\"n\", \"no\")`.",
      solution: "def parse_answer(text):\n    answer = text.strip().lower()\n    if answer in (\"y\", \"yes\"):\n        return True\n    if answer in (\"n\", \"no\"):\n        return False\n    raise ValueError(\"Please answer yes or no\")",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["\" Yes \"", "parse_answer(\" Yes \") is True"],
        ["\"N\"", "parse_answer(\"N\") is False"],
        ["\"maybe\"", "_error(parse_answer, \"maybe\") == \"ValueError: Please answer yes or no\""],
      ],
    }),
    task("easy", "Keep it in range", {
      prompt: "Define `clamp(value, low, high)` that returns `value`, but never less than `low` or more than `high`.",
      hint: "`if value < low: return low`, `if value > high: return high`, else return `value`. (Or `max(low, min(value, high))`.)",
      solution: "def clamp(value, low, high):\n    if value < low:\n        return low\n    if value > high:\n        return high\n    return value",
      tests: [
        ["Inside", "clamp(5, 0, 10) == 5"],
        ["Too low", "clamp(-3, 0, 10) == 0"],
        ["Too high", "clamp(42, 0, 10) == 10"],
      ],
    }),
    task("medium", "A safe conversion", {
      prompt: "Define `safe_int(text, default=0)` that returns `int(text)`, or `default` when the conversion raises a `ValueError` or `TypeError`.",
      hint: "EAFP: `try: return int(text)`, `except (ValueError, TypeError): return default`.",
      solution: "def safe_int(text, default=0):\n    try:\n        return int(text)\n    except (ValueError, TypeError):\n        return default",
      tests: [
        ["safe_int(\"42\")", "safe_int(\"42\") == 42"],
        ["safe_int(\"x\")", "safe_int(\"x\") == 0"],
        ["safe_int(None, -1)", "safe_int(None, -1) == -1"],
      ],
    }),
    task("medium", "Check a sign-up", {
      prompt: "Define `problems(form)` that returns a list of every problem with the form dict: `name is required` (missing or blank), `age must be a number`, and `email needs an @`. An empty list means it's valid.",
      hint: "Use `form.get(key, \"\")` so a missing key counts as blank. Append a message for each failed rule, in that order.",
      solution: "def problems(form):\n    found = []\n    if not form.get(\"name\", \"\").strip():\n        found.append(\"name is required\")\n    if not form.get(\"age\", \"\").isdigit():\n        found.append(\"age must be a number\")\n    if \"@\" not in form.get(\"email\", \"\"):\n        found.append(\"email needs an @\")\n    return found",
      tests: [
        ["A valid form", "problems({\"name\": \"Ana\", \"age\": \"30\", \"email\": \"a@example.net\"}) == []"],
        ["Everything wrong", "problems({\"name\": \"  \", \"age\": \"old\"}) == [\"name is required\", \"age must be a number\", \"email needs an @\"]"],
        ["One problem", "problems({\"name\": \"Ben\", \"age\": \"40\", \"email\": \"ben\"}) == [\"email needs an @\"]"],
      ],
    }),
    task("medium", "Ask for a quantity", {
      prompt: "Ask `Quantity (1-10): ` until the answer is a whole number from 1 to 10, printing `Please type a number` or `Must be 1 to 10` for bad answers. Store the result in `qty`. The check types `ten`, `0`, `15` and `3`.",
      hint: "A `while True:` loop: `try` the conversion (`except ValueError:` print and `continue`), then check the range, and `break` when it's fine.",
      solution: "while True:\n    try:\n        qty = int(input(\"Quantity (1-10): \"))\n    except ValueError:\n        print(\"Please type a number\")\n        continue\n    if 1 <= qty <= 10:\n        break\n    print(\"Must be 1 to 10\")",
      setup: typedInput("ten", "0", "15", "3"),
      tests: [
        ["qty is 3", "qty == 3"],
        ["One \"not a number\"", "_cq_stdout.count(\"Please type a number\") == 1"],
        ["Two out of range", "_cq_stdout.count(\"Must be 1 to 10\") == 2"],
      ],
    }),
    task("hard", "Read a config", {
      prompt: "Define `parse_config(lines)` that turns lines like `size = 14` into a dict (keys and values stripped), skipping blank lines and lines starting with `#`. A line without `=` raises `ValueError(\"Line 3: expected key = value\")` with its line number (counting from 1).",
      hint: "Loop with `enumerate(lines, start=1)`. `continue` for blank and comment lines; check `\"=\" in line`; then `key, value = line.split(\"=\", 1)`.",
      solution: "def parse_config(lines):\n    config = {}\n    for number, line in enumerate(lines, start=1):\n        line = line.strip()\n        if not line or line.startswith(\"#\"):\n            continue\n        if \"=\" not in line:\n            raise ValueError(f\"Line {number}: expected key = value\")\n        key, value = line.split(\"=\", 1)\n        config[key.strip()] = value.strip()\n    return config",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["A good config", "parse_config([\"# settings\", \"size = 14\", \"\", \"theme=dark\"]) == {\"size\": \"14\", \"theme\": \"dark\"}"],
        ["A bad line", "_error(parse_config, [\"size = 14\", \"\", \"oops\"]) == \"ValueError: Line 3: expected key = value\""],
        ["Equals signs in the value", "parse_config([\"url = a=b\"]) == {\"url\": \"a=b\"}"],
      ],
    }),
    task("hard", "An average that refuses junk", {
      prompt: "Define `average(values)` that averages only the `int` and `float` values (ignoring `None`, text and anything else), and raises `ValueError(\"No numbers to average\")` if none are left.",
      hint: "Keep `[v for v in values if isinstance(v, (int, float))]`, check it isn't empty, then divide.",
      solution: "def average(values):\n    numbers = [v for v in values if isinstance(v, (int, float))]\n    if not numbers:\n        raise ValueError(\"No numbers to average\")\n    return sum(numbers) / len(numbers)",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["Mixed values", "average([4, None, \"x\", 8.0]) == 6"],
        ["Nothing usable", "_error(average, [None, \"a\"]) == \"ValueError: No numbers to average\""],
      ],
    }),
    task("expert", "A careful transfer", {
      prompt: "Define `transfer(accounts, source, target, amount)` that moves money between accounts in a dict, after checking (in this order): `ValueError(\"Amount must be positive\")`, `KeyError` naming a missing account, and `ValueError(\"Insufficient funds\")`. Nothing may change if any check fails.",
      hint: "Do every check before changing anything: the amount, then `for name in (source, target): if name not in accounts: raise KeyError(name)`, then the balance.",
      solution: "def transfer(accounts, source, target, amount):\n    if amount <= 0:\n        raise ValueError(\"Amount must be positive\")\n    for name in (source, target):\n        if name not in accounts:\n            raise KeyError(name)\n    if accounts[source] < amount:\n        raise ValueError(\"Insufficient funds\")\n    accounts[source] -= amount\n    accounts[target] += amount",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["A transfer", "(lambda a: (transfer(a, \"Ana\", \"Ben\", 30), a)[1])({\"Ana\": 100, \"Ben\": 0}) == {\"Ana\": 70, \"Ben\": 30}"],
        ["Not positive", "_error(transfer, {\"Ana\": 1, \"Ben\": 1}, \"Ana\", \"Ben\", 0) == \"ValueError: Amount must be positive\""],
        ["A missing account", "_error(transfer, {\"Ana\": 1}, \"Ana\", \"Zoe\", 1) == \"KeyError: 'Zoe'\""],
        ["Too much, nothing changes", "(lambda a: (_raises(transfer, a, \"Ana\", \"Ben\", 500), a))({\"Ana\": 100, \"Ben\": 0}) == (\"ValueError\", {\"Ana\": 100, \"Ben\": 0})"],
      ],
    }),
    task("expert", "Clean a username", {
      prompt: "Define `clean_username(raw)`: strip it, lowercase it, turn spaces into `_`, and drop any character that isn't a letter, digit or `_`. Raise `ValueError(\"Username too short\")` if fewer than 3 characters remain.",
      hint: "Normalise in steps, then filter with `\"\".join(ch for ch in name if ch.isalnum() or ch == \"_\")`, and check the length last.",
      solution: "def clean_username(raw):\n    name = raw.strip().lower().replace(\" \", \"_\")\n    name = \"\".join(ch for ch in name if ch.isalnum() or ch == \"_\")\n    if len(name) < 3:\n        raise ValueError(\"Username too short\")\n    return name",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["Messy input", "clean_username(\"  Ana Lima! \") == \"ana_lima\""],
        ["Symbols removed", "clean_username(\"B#e@n99\") == \"ben99\""],
        ["Too short after cleaning", "_error(clean_username, \" !a! \") == \"ValueError: Username too short\""],
      ],
    }),
  ],
  questions: [
    mc("What is a guard clause?", ["A comment at the top", "A check at the top of a function that leaves early when something is wrong", "A `finally` block", "A test function"], 1),
    mc("Why normalise input with `strip()` and `lower()` before checking it?", ["It is faster", "Python needs it", "So `\" Yes\"`, `\"YES\"` and `\"yes\"` count as the same answer", "To make it longer"], 2),
    mc("What does EAFP mean?", ["Easier to ask forgiveness than permission: try it and catch the exception", "Every argument fits perfectly", "Errors are always fatal", "Exit after first problem"], 0),
    mc("Which is LBYL?", ["`try: prices[k]`", "`except KeyError:`", "`raise KeyError(k)`", "`if k in prices:`"], 3),
    mc("Why is returning a made-up 0 for a missing price risky?", ["0 is not a number", "Bad data spreads quietly instead of failing clearly", "It is slower", "Functions can't return 0"], 1),
    mc("Why collect every problem in a sign-up form?", ["So the user can fix them all at once", "Python requires it", "To avoid using `if`", "It uses less memory"], 0),
    mc("A function moves money between two accounts after checking the amount and the balance. When should the balances change?", ["Before the checks", "Between the checks", "Only after every check has passed", "It doesn't matter"], 2),
    mc("Which is the safest way to turn text into an int with a fallback?", ["Check that every character is a digit", "Use `eval(text)`", "Assume it is fine", "`try: int(text)` with `except ValueError`"], 3),
    mc("What does \"fail loudly\" mean?", ["Print in capitals", "Raise a clear error instead of carrying on with bad data", "Beep", "Restart the program"], 1),
  ],
})
