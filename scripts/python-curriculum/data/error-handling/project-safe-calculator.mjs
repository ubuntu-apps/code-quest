// Errors and exceptions project: Safe calculator. Lesson, Try-it snippets, challenges and quiz.
import { makeProject, mc, qShort, snippet, task, typedInput } from '../_builders.mjs'

export default makeProject("easy", {
  id: "proj_safe_calculator",
  title: "Safe calculator",
  paragraphs: [
    "Build a calculator that never crashes, however badly it's used. Type a sum such as `3 + 4` and it answers; type nonsense and it explains what's wrong, then waits for the next sum.",
    "A session looks like this:",
    "```\n> 3 + 4\n= 7\n> 8 / 0\nError: Can't divide by zero\n> x * 2\nError: Not a number: x\n> 2 ^ 3\nError: Unknown operator: ^\n> quit\nBye! 1 answer, 3 errors.\n```",
    "The small functions **raise** clear exceptions when something's wrong, and one function, `safe_calculate`, **catches** them and turns them into messages. That split keeps every piece simple: the maths functions don't need to know how errors are shown, and the loop doesn't need to know what can go wrong.",
    "Build it in steps: reading a number, the calculation, the safe wrapper, then the loop with a count of answers and errors. To try the sandbox, type one sum per line in the Input box.",
  ],
  sandboxCode: "def read_number(text):\n    try:\n        return float(text)\n    except ValueError as e:\n        raise ValueError(f\"Not a number: {text}\") from e\n\nfor text in [\"3\", \"2.5\", \"x\"]:\n    try:\n        print(read_number(text))\n    except ValueError as e:\n        print(\"Error:\", e)",
  sandboxSnippets: [
    snippet("Raise from", "try:\n    float(\"x\")\nexcept ValueError as e:\n    print(\"Low-level message:\", e)"),
    snippet("Format a result", "for value in [7.0, 2.5, 0.3333333]:\n    print(f\"= {value:g}\")"),
    snippet("Split a sum", "a, op, b = \"3 + 4\".split()\nprint(a, op, b)"),
  ],
  challenges: [
    task("easy", "Read a number", {
      prompt: "Define `read_number(text)` that returns `float(text)`, or raises `ValueError(\"Not a number: <text>\")` from the original error.",
      hint: "`try: return float(text)` and `except ValueError as e: raise ValueError(f\"Not a number: {text}\") from e`.",
      solution: "def read_number(text):\n    try:\n        return float(text)\n    except ValueError as e:\n        raise ValueError(f\"Not a number: {text}\") from e\n",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["read_number(\"2.5\")", "read_number(\"2.5\") == 2.5"],
        ["read_number(\"x\")", "_error(read_number, \"x\") == \"ValueError: Not a number: x\""],
      ],
    }),
    task("easy", "Do the maths", {
      prompt: "Define `calculate(a, op, b)` for `+`, `-`, `*` and `/`. Raise `ZeroDivisionError(\"Can't divide by zero\")` when dividing by 0, and `ValueError(\"Unknown operator: <op>\")` for any other operator.",
      hint: "One `if` per operator, with the zero check inside the `/` branch, and the `raise ValueError` at the end.",
      solution: "def calculate(a, op, b):\n    if op == \"+\":\n        return a + b\n    if op == \"-\":\n        return a - b\n    if op == \"*\":\n        return a * b\n    if op == \"/\":\n        if b == 0:\n            raise ZeroDivisionError(\"Can't divide by zero\")\n        return a / b\n    raise ValueError(f\"Unknown operator: {op}\")\n",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["3 + 4", "calculate(3, \"+\", 4) == 7"],
        ["9 / 2", "calculate(9, \"/\", 2) == 4.5"],
        ["Divide by zero", "_error(calculate, 1, \"/\", 0) == \"ZeroDivisionError: Can't divide by zero\""],
        ["Unknown operator", "_error(calculate, 2, \"^\", 3) == \"ValueError: Unknown operator: ^\""],
      ],
    }),
    task("medium", "Never crash", {
      prompt: "Define `safe_calculate(text)` for text like `3 + 4`: return `= 7` (format the result with `:g`), or `Error: <message>` for a `ValueError` or `ZeroDivisionError`. Text that isn't three parts gives `Error: Type a sum like 3 + 4`.",
      starter: "def read_number(text):\n    try:\n        return float(text)\n    except ValueError as e:\n        raise ValueError(f\"Not a number: {text}\") from e\n\ndef calculate(a, op, b):\n    if op == \"+\":\n        return a + b\n    if op == \"-\":\n        return a - b\n    if op == \"*\":\n        return a * b\n    if op == \"/\":\n        if b == 0:\n            raise ZeroDivisionError(\"Can't divide by zero\")\n        return a / b\n    raise ValueError(f\"Unknown operator: {op}\")\n\n",
      hint: "Put the split and the calculation in `try`. Unpacking the wrong number of parts raises a `ValueError` whose message mentions \"unpack\"; check for that to give the friendlier message.",
      solution: "def read_number(text):\n    try:\n        return float(text)\n    except ValueError as e:\n        raise ValueError(f\"Not a number: {text}\") from e\n\ndef calculate(a, op, b):\n    if op == \"+\":\n        return a + b\n    if op == \"-\":\n        return a - b\n    if op == \"*\":\n        return a * b\n    if op == \"/\":\n        if b == 0:\n            raise ZeroDivisionError(\"Can't divide by zero\")\n        return a / b\n    raise ValueError(f\"Unknown operator: {op}\")\n\ndef safe_calculate(text):\n    try:\n        a, op, b = text.split()\n        result = calculate(read_number(a), op, read_number(b))\n    except ValueError as e:\n        if \"unpack\" in str(e):\n            return \"Error: Type a sum like 3 + 4\"\n        return f\"Error: {e}\"\n    except ZeroDivisionError as e:\n        return f\"Error: {e}\"\n    return f\"= {result:g}\"\n",
      tests: [
        ["3 + 4", "safe_calculate(\"3 + 4\") == \"= 7\""],
        ["10 / 4", "safe_calculate(\"10 / 4\") == \"= 2.5\""],
        ["8 / 0", "safe_calculate(\"8 / 0\") == \"Error: Can't divide by zero\""],
        ["x * 2", "safe_calculate(\"x * 2\") == \"Error: Not a number: x\""],
        ["Not a sum", "safe_calculate(\"hello\") == \"Error: Type a sum like 3 + 4\""],
      ],
    }),
    task("medium", "Count the outcomes", {
      prompt: "Define `run(sums)` that calls `safe_calculate` on each sum and returns `(answers, errors)`: how many gave an answer and how many gave an error.",
      starter: "def read_number(text):\n    try:\n        return float(text)\n    except ValueError as e:\n        raise ValueError(f\"Not a number: {text}\") from e\n\ndef calculate(a, op, b):\n    if op == \"+\":\n        return a + b\n    if op == \"-\":\n        return a - b\n    if op == \"*\":\n        return a * b\n    if op == \"/\":\n        if b == 0:\n            raise ZeroDivisionError(\"Can't divide by zero\")\n        return a / b\n    raise ValueError(f\"Unknown operator: {op}\")\n\ndef safe_calculate(text):\n    try:\n        a, op, b = text.split()\n        result = calculate(read_number(a), op, read_number(b))\n    except ValueError as e:\n        if \"unpack\" in str(e):\n            return \"Error: Type a sum like 3 + 4\"\n        return f\"Error: {e}\"\n    except ZeroDivisionError as e:\n        return f\"Error: {e}\"\n    return f\"= {result:g}\"\n\n",
      hint: "A reply that starts with `Error` is an error; anything else is an answer.",
      solution: "def read_number(text):\n    try:\n        return float(text)\n    except ValueError as e:\n        raise ValueError(f\"Not a number: {text}\") from e\n\ndef calculate(a, op, b):\n    if op == \"+\":\n        return a + b\n    if op == \"-\":\n        return a - b\n    if op == \"*\":\n        return a * b\n    if op == \"/\":\n        if b == 0:\n            raise ZeroDivisionError(\"Can't divide by zero\")\n        return a / b\n    raise ValueError(f\"Unknown operator: {op}\")\n\ndef safe_calculate(text):\n    try:\n        a, op, b = text.split()\n        result = calculate(read_number(a), op, read_number(b))\n    except ValueError as e:\n        if \"unpack\" in str(e):\n            return \"Error: Type a sum like 3 + 4\"\n        return f\"Error: {e}\"\n    except ZeroDivisionError as e:\n        return f\"Error: {e}\"\n    return f\"= {result:g}\"\n\ndef run(sums):\n    answers = 0\n    errors = 0\n    for s in sums:\n        if safe_calculate(s).startswith(\"Error\"):\n            errors += 1\n        else:\n            answers += 1\n    return answers, errors",
      tests: [
        ["Mixed sums", "run([\"3 + 4\", \"8 / 0\", \"x * 2\", \"2 * 5\"]) == (2, 2)"],
        ["No sums", "run([]) == (0, 0)"],
      ],
    }),
    task("hard", "The calculator loop", {
      prompt: "Read sums with `input(\"> \")` until the user types `quit`, printing the reply to each. The check types `3 + 4`, `8 / 0`, `x * 2` and `quit`.",
      starter: "def read_number(text):\n    try:\n        return float(text)\n    except ValueError as e:\n        raise ValueError(f\"Not a number: {text}\") from e\n\ndef calculate(a, op, b):\n    if op == \"+\":\n        return a + b\n    if op == \"-\":\n        return a - b\n    if op == \"*\":\n        return a * b\n    if op == \"/\":\n        if b == 0:\n            raise ZeroDivisionError(\"Can't divide by zero\")\n        return a / b\n    raise ValueError(f\"Unknown operator: {op}\")\n\ndef safe_calculate(text):\n    try:\n        a, op, b = text.split()\n        result = calculate(read_number(a), op, read_number(b))\n    except ValueError as e:\n        if \"unpack\" in str(e):\n            return \"Error: Type a sum like 3 + 4\"\n        return f\"Error: {e}\"\n    except ZeroDivisionError as e:\n        return f\"Error: {e}\"\n    return f\"= {result:g}\"\n\n",
      hint: "`while True:` read a line; `break` on `quit`; otherwise `print(safe_calculate(line))`.",
      solution: "def read_number(text):\n    try:\n        return float(text)\n    except ValueError as e:\n        raise ValueError(f\"Not a number: {text}\") from e\n\ndef calculate(a, op, b):\n    if op == \"+\":\n        return a + b\n    if op == \"-\":\n        return a - b\n    if op == \"*\":\n        return a * b\n    if op == \"/\":\n        if b == 0:\n            raise ZeroDivisionError(\"Can't divide by zero\")\n        return a / b\n    raise ValueError(f\"Unknown operator: {op}\")\n\ndef safe_calculate(text):\n    try:\n        a, op, b = text.split()\n        result = calculate(read_number(a), op, read_number(b))\n    except ValueError as e:\n        if \"unpack\" in str(e):\n            return \"Error: Type a sum like 3 + 4\"\n        return f\"Error: {e}\"\n    except ZeroDivisionError as e:\n        return f\"Error: {e}\"\n    return f\"= {result:g}\"\n\nwhile True:\n    line = input(\"> \")\n    if line == \"quit\":\n        break\n    print(safe_calculate(line))",
      setup: typedInput("3 + 4", "8 / 0", "x * 2", "quit"),
      tests: [
        ["Prints the replies", "[l for l in _cq_stdout.strip().splitlines() if not l.startswith(\"> \")] == [\"= 7\", \"Error: Can't divide by zero\", \"Error: Not a number: x\"]"],
      ],
    }),
    task("hard", "Say goodbye", {
      prompt: "The whole program: the same loop, plus a goodbye line when the user quits, like `Bye! 1 answer, 3 errors.` (use `answer`/`error` for exactly 1, `answers`/`errors` otherwise). The check types `3 + 4`, `8 / 0`, `x * 2`, `2 ^ 3` and `quit`.",
      starter: "def read_number(text):\n    try:\n        return float(text)\n    except ValueError as e:\n        raise ValueError(f\"Not a number: {text}\") from e\n\ndef calculate(a, op, b):\n    if op == \"+\":\n        return a + b\n    if op == \"-\":\n        return a - b\n    if op == \"*\":\n        return a * b\n    if op == \"/\":\n        if b == 0:\n            raise ZeroDivisionError(\"Can't divide by zero\")\n        return a / b\n    raise ValueError(f\"Unknown operator: {op}\")\n\ndef safe_calculate(text):\n    try:\n        a, op, b = text.split()\n        result = calculate(read_number(a), op, read_number(b))\n    except ValueError as e:\n        if \"unpack\" in str(e):\n            return \"Error: Type a sum like 3 + 4\"\n        return f\"Error: {e}\"\n    except ZeroDivisionError as e:\n        return f\"Error: {e}\"\n    return f\"= {result:g}\"\n\n",
      hint: "Count as you go, as in `run`. For the words, `\"answer\" if answers == 1 else \"answers\"`.",
      solution: "def read_number(text):\n    try:\n        return float(text)\n    except ValueError as e:\n        raise ValueError(f\"Not a number: {text}\") from e\n\ndef calculate(a, op, b):\n    if op == \"+\":\n        return a + b\n    if op == \"-\":\n        return a - b\n    if op == \"*\":\n        return a * b\n    if op == \"/\":\n        if b == 0:\n            raise ZeroDivisionError(\"Can't divide by zero\")\n        return a / b\n    raise ValueError(f\"Unknown operator: {op}\")\n\ndef safe_calculate(text):\n    try:\n        a, op, b = text.split()\n        result = calculate(read_number(a), op, read_number(b))\n    except ValueError as e:\n        if \"unpack\" in str(e):\n            return \"Error: Type a sum like 3 + 4\"\n        return f\"Error: {e}\"\n    except ZeroDivisionError as e:\n        return f\"Error: {e}\"\n    return f\"= {result:g}\"\n\nanswers = 0\nerrors = 0\nwhile True:\n    line = input(\"> \")\n    if line == \"quit\":\n        break\n    reply = safe_calculate(line)\n    print(reply)\n    if reply.startswith(\"Error\"):\n        errors += 1\n    else:\n        answers += 1\na_word = \"answer\" if answers == 1 else \"answers\"\ne_word = \"error\" if errors == 1 else \"errors\"\nprint(f\"Bye! {answers} {a_word}, {errors} {e_word}.\")",
      setup: typedInput("3 + 4", "8 / 0", "x * 2", "2 ^ 3", "quit"),
      tests: [
        ["Prints every reply", "[l for l in _cq_stdout.strip().splitlines() if not l.startswith(\"> \")][:4] == [\"= 7\", \"Error: Can't divide by zero\", \"Error: Not a number: x\", \"Error: Unknown operator: ^\"]"],
        ["Says goodbye", "_cq_stdout.strip().splitlines()[-1] == \"Bye! 1 answer, 3 errors.\""],
      ],
    }),
  ],
  questions: [
    mc("Why do the small functions raise errors instead of printing them?", ["Printing is slow", "So one place can decide how errors are shown, and the functions stay simple", "Functions can't print", "Raising is shorter"], 1),
    mc("What does `f\"{7.0:g}\"` give?", ["`7.0`", "`7.00`", "`7`", "`7g`"], 2),
    mc("`a, op, b = \"hello\".split()` raises which exception?", ["`ValueError`", "`TypeError`", "`IndexError`", "`KeyError`"], 0),
    mc("Why `raise ValueError(...) from e` in `read_number`?", ["To hide the original", "To make it faster", "Python requires it", "To give a clearer message and keep the original as the cause"], 3),
    qShort("What does `safe_calculate(\"6 * 7\")` return?", "= 42"),
    mc("Which functions catch exceptions in this program?", ["All of them", "Only `safe_calculate`", "Only `calculate`", "None"], 1),
  ],
})
