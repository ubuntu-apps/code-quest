// Errors and exceptions topic: else and finally. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "else_finally",
  title: "else and finally",
  paragraphs: [
    "A `try` statement has two more optional parts. `else` runs only when the `try` block finished **without** an exception, and `finally` runs **always**, error or not, as the very last step:",
    "```\ndef read_number(text):\n    try:\n        n = int(text)\n    except ValueError:\n        print(\"Not a number\")\n    else:\n        print(\"Got\", n)\n    finally:\n        print(\"Done checking\", repr(text))\n\nread_number(\"5\")\nread_number(\"x\")\n```",
    "Why not just put the `else` code at the end of `try`? Because then an exception raised by **that** code would be caught too, by an `except` written for something else. Keep the `try` block small, holding only the line that might fail, and put the follow-up work in `else`.",
    "`finally` is for clean-up that must happen whatever goes wrong: closing a connection, releasing a lock, printing a closing line, putting things back the way they were. It runs even when the `try` or `except` block **returns**, or when an exception escapes uncaught:",
    "```\ndef check(text):\n    try:\n        return int(text) > 0\n    except ValueError:\n        return False\n    finally:\n        print(\"checked\", repr(text))   # runs before either return\n\nprint(check(\"7\"))\n```",
    "The full shape is `try`, then any `except` clauses, then `else`, then `finally`, in that order. `else` needs at least one `except` before it; `finally` can come straight after `try` when you only want the clean-up and are happy to let the exception travel on to the caller.",
    "One warning: don't `return` from inside a `finally` block. A `return` there silently replaces whatever the function was returning, and even swallows an exception that was on its way out.",
  ],
  sandboxCode: "def read_number(text):\n    try:\n        n = int(text)\n    except ValueError:\n        print(\"Not a number\")\n    else:\n        print(\"Got\", n)\n    finally:\n        print(\"Done checking\", repr(text))\n\nread_number(\"5\")\nread_number(\"x\")",
  sandboxSnippets: [
    snippet("Which parts run?", "for text in [\"7\", \"seven\"]:\n    try:\n        n = int(text)\n    except ValueError:\n        print(\"except\")\n    else:\n        print(\"else\")\n    finally:\n        print(\"finally\")\n    print(\"--\")"),
    snippet("finally runs before return", "def f():\n    try:\n        return \"from try\"\n    finally:\n        print(\"finally ran first\")\n\nprint(f())"),
    snippet("finally with an uncaught error", "try:\n    try:\n        1 / 0\n    finally:\n        print(\"cleaning up\")\nexcept ZeroDivisionError:\n    print(\"caught outside\")"),
    snippet("Keep try small", "data = {\"a\": \"5\"}\ntry:\n    value = data[\"a\"]\nexcept KeyError:\n    print(\"missing\")\nelse:\n    print(int(value) * 2)"),
  ],
  readMore: { label: "Python tutorial: defining clean-up actions", url: "https://docs.python.org/3/tutorial/errors.html#defining-clean-up-actions", source: "Python docs" },
  challenges: [
    task("easy", "Only on success", {
      prompt: "Define `double(text)` that returns `None` if `int(text)` fails, and otherwise (in an `else` block) returns the number times 2.",
      hint: "`try: n = int(text)`, `except ValueError: return None`, `else: return n * 2`.",
      solution: "def double(text):\n    try:\n        n = int(text)\n    except ValueError:\n        return None\n    else:\n        return n * 2",
      tests: [
        ["double(\"21\")", "double(\"21\") == 42"],
        ["double(\"x\")", "double(\"x\") is None"],
      ],
    }),
    task("easy", "Always finish", {
      prompt: "Define `check(text)` that prints `Valid` if `int(text)` works or `Invalid` if not, and **always** prints `Checked` last, using `finally`.",
      hint: "`else: print(\"Valid\")`, `except ValueError: print(\"Invalid\")`, `finally: print(\"Checked\")`.",
      solution: "def check(text):\n    try:\n        int(text)\n    except ValueError:\n        print(\"Invalid\")\n    else:\n        print(\"Valid\")\n    finally:\n        print(\"Checked\")",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\n",
      tests: [
        ["check(\"5\")", "_out(check, \"5\") == \"Valid\\nChecked\\n\""],
        ["check(\"x\")", "_out(check, \"x\") == \"Invalid\\nChecked\\n\""],
      ],
    }),
    task("easy", "Say goodbye", {
      prompt: "`visit(text)` should always print `Goodbye` at the end, but the early `return` skips it for bad input. Move it into a `finally` block.",
      starter: "def visit(text):\n    try:\n        n = int(text)\n    except ValueError:\n        print(\"Bad number\")\n        return\n    print(\"Number\", n)\n    print(\"Goodbye\")\n",
      hint: "Wrap the body so that `print(\"Goodbye\")` sits in `finally:`, which runs even after `return`.",
      solution: "def visit(text):\n    try:\n        n = int(text)\n        print(\"Number\", n)\n    except ValueError:\n        print(\"Bad number\")\n        return\n    finally:\n        print(\"Goodbye\")",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\n",
      tests: [
        ["visit(\"3\")", "_out(visit, \"3\") == \"Number 3\\nGoodbye\\n\""],
        ["visit(\"x\")", "_out(visit, \"x\") == \"Bad number\\nGoodbye\\n\""],
      ],
    }),
    task("medium", "Trace the steps", {
      prompt: "Define `steps(text)` that returns a list of what happened: `start`, then `error` or `ok` (from `except` and `else`), then `end` (from `finally`). The conversion is `int(text)`.",
      hint: "Start with `events = [\"start\"]`, append in each block, and return `events` after the whole `try` statement.",
      solution: "def steps(text):\n    events = [\"start\"]\n    try:\n        int(text)\n    except ValueError:\n        events.append(\"error\")\n    else:\n        events.append(\"ok\")\n    finally:\n        events.append(\"end\")\n    return events",
      tests: [
        ["steps(\"1\")", "steps(\"1\") == [\"start\", \"ok\", \"end\"]"],
        ["steps(\"x\")", "steps(\"x\") == [\"start\", \"error\", \"end\"]"],
      ],
    }),
    task("medium", "Close the connection", {
      prompt: "Define `send(conn, message)`: it sets `conn[\"open\"] = True`, then calls `transmit(message)` (which may raise), and must always set `conn[\"open\"] = False` at the end. Let any error carry on to the caller.",
      starter: "def transmit(message):\n    if message == \"\":\n        raise ValueError(\"empty message\")\n    return f\"sent {message}\"\n\n",
      hint: "Set it open, then `try: return transmit(message)` with `finally: conn[\"open\"] = False`. No `except` is needed.",
      solution: "def transmit(message):\n    if message == \"\":\n        raise ValueError(\"empty message\")\n    return f\"sent {message}\"\n\ndef send(conn, message):\n    conn[\"open\"] = True\n    try:\n        return transmit(message)\n    finally:\n        conn[\"open\"] = False",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\n",
      tests: [
        ["A good message", "(lambda c: (send(c, \"hi\"), c))({}) == (\"sent hi\", {\"open\": False})"],
        ["Closed even after an error", "(lambda c: (_raises(send, c, \"\"), c))({}) == (\"ValueError\", {\"open\": False})"],
      ],
    }),
    task("medium", "Keep try small", {
      prompt: "In `total_of`, an error from `float` in the second line is wrongly reported as `missing price`. Move the second line into an `else` block, so only `prices[item]` is inside `try`.",
      starter: "def total_of(prices, item, qty):\n    try:\n        price = prices[item]\n        return float(price) * qty\n    except (KeyError, ValueError):\n        return \"missing price\"\n",
      hint: "Catch only `KeyError` around the lookup, and do the multiplication in `else:`. Then a bad price raises its own `ValueError`.",
      solution: "def total_of(prices, item, qty):\n    try:\n        price = prices[item]\n    except KeyError:\n        return \"missing price\"\n    else:\n        return float(price) * qty",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\n",
      tests: [
        ["A good price", "total_of({\"tea\": \"2.5\"}, \"tea\", 2) == 5.0"],
        ["A missing item", "total_of({\"tea\": \"2.5\"}, \"jam\", 1) == \"missing price\""],
        ["A broken price is not hidden", "_raises(total_of, {\"tea\": \"free\"}, \"tea\", 1) == \"ValueError\""],
      ],
    }),
    task("hard", "Try again", {
      prompt: "Define `with_retries(action, tries=3)`: call `action()` up to `tries` times. Return its result as soon as it works; after each `ConnectionError`, print `Attempt N failed`. If every try fails, return `None`.",
      hint: "A `for attempt in range(1, tries + 1):` loop, with `try: return action()` and `except ConnectionError: print(...)`. After the loop, `return None`.",
      solution: "def with_retries(action, tries=3):\n    for attempt in range(1, tries + 1):\n        try:\n            return action()\n        except ConnectionError:\n            print(f\"Attempt {attempt} failed\")\n    return None",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _flaky(fails):\n    calls = []\n    def action():\n        calls.append(1)\n        if len(calls) <= fails:\n            raise ConnectionError(\"network down\")\n        return \"ok\"\n    return action\n",
      tests: [
        ["Works on the third try", "_out(with_retries, _flaky(2)) == \"Attempt 1 failed\\nAttempt 2 failed\\n\""],
        ["Returns the result", "with_retries(_flaky(2)) == \"ok\""],
        ["Gives up after the tries", "with_retries(_flaky(5), tries=2) is None"],
      ],
    }),
    task("hard", "Count what was processed", {
      prompt: "Define `process(lines)` that turns each line into an int. Return `(numbers, bad, seen)`: the good numbers (added in `else`), how many failed, and how many lines were looked at (counted in `finally`).",
      hint: "Inside the loop: `try: n = int(line)`, `except ValueError: bad += 1`, `else: numbers.append(n)`, `finally: seen += 1`.",
      solution: "def process(lines):\n    numbers = []\n    bad = 0\n    seen = 0\n    for line in lines:\n        try:\n            n = int(line)\n        except ValueError:\n            bad += 1\n        else:\n            numbers.append(n)\n        finally:\n            seen += 1\n    return numbers, bad, seen",
      tests: [
        ["Mixed lines", "process([\"1\", \"x\", \"3\", \"\"]) == ([1, 3], 2, 4)"],
        ["No lines", "process([]) == ([], 0, 0)"],
      ],
    }),
    task("expert", "Put it back", {
      prompt: "Define `with_setting(settings, key, value, action)`: change `settings[key]` to `value`, call `action()` and return its result, and **always** put the old value back afterwards, even if `action` raises.",
      hint: "Save `old = settings[key]` first, then `try: return action()` with `finally: settings[key] = old`.",
      solution: "def with_setting(settings, key, value, action):\n    old = settings[key]\n    settings[key] = value\n    try:\n        return action()\n    finally:\n        settings[key] = old",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\n",
      tests: [
        ["Uses the new value, then restores it", "(lambda s: (with_setting(s, \"mode\", \"fast\", lambda: s[\"mode\"]), s))({\"mode\": \"slow\"}) == (\"fast\", {\"mode\": \"slow\"})"],
        ["Restores after an error", "(lambda s: (_raises(with_setting, s, \"mode\", \"x\", lambda: 1 / 0), s))({\"mode\": \"slow\"}) == (\"ZeroDivisionError\", {\"mode\": \"slow\"})"],
      ],
    }),
    task("expert", "The last word", {
      prompt: "Set `result` to what `f()` returns. Read it carefully: a `return` inside `finally` replaces the one from `try`, which is why you shouldn't write one.",
      starter: "def f():\n    try:\n        return \"try\"\n    finally:\n        return \"finally\"\n\n",
      hint: "Call it: `result = f()`.",
      solution: "def f():\n    try:\n        return \"try\"\n    finally:\n        return \"finally\"\n\nresult = f()",
      tests: [
        ["result is finally", "result == \"finally\""],
      ],
    }),
  ],
  questions: [
    mc("When does the `else` block of a `try` run?", ["Always", "Only when no exception was raised in `try`", "Only after an exception", "Before `try`"], 1),
    mc("When does `finally` run?", ["Only after an error", "Only after success", "Always, as the last step", "Never, if there is a `return`"], 2),
    mc("What does this print?\n\n```\ntry:\n    n = int(\"5\")\nexcept ValueError:\n    print(\"bad\")\nelse:\n    print(n * 2)\nfinally:\n    print(\"done\")\n```", ["`10`, then `done`", "`done`", "`bad`, then `done`", "`10`"], 0),
    mc("A `try` block returns a value. Does `finally` still run?", ["No", "Only if there is an `except`", "Only on errors", "Yes, just before the function returns"], 3),
    qShort("In which block do you close a connection that must be closed whatever happens? (one word)", "finally"),
    mc("What is the correct order?", ["`try`, `else`, `except`, `finally`", "`try`, `except`, `else`, `finally`", "`try`, `finally`, `except`, `else`", "`except`, `try`, `else`, `finally`"], 1),
    mc("Can `finally` come straight after `try`, with no `except`?", ["Yes: it cleans up and lets the exception continue", "No", "Only inside a loop", "Only with `else`"], 0),
    mc("Why not `return` inside `finally`?", ["It is a `SyntaxError`", "It runs twice", "It replaces the real return value and can hide an exception", "It makes the function slower"], 2),
    mc("`try` raises a `KeyError` and there is only `except ValueError:` plus `finally`. What happens?", ["The `ValueError` clause runs", "Nothing runs", "The error is ignored", "`finally` runs, then the `KeyError` carries on to the caller"], 3),
    mc("Which part needs at least one `except` before it?", ["`finally`", "`else`", "`try`", "None"], 1),
  ],
})
