// Errors and exceptions topic: Assertions and tests. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "assertions",
  title: "Assertions and tests",
  paragraphs: [
    "An **assertion** states something you believe must be true at that point in the program. `assert condition, \"message\"` does nothing when the condition is true, and raises `AssertionError` with the message when it's false:",
    "```\ndef average(numbers):\n    assert len(numbers) > 0, \"numbers must not be empty\"\n    return sum(numbers) / len(numbers)\n\nprint(average([2, 4]))   # 3.0\naverage([])              # AssertionError: numbers must not be empty\n```",
    "Assertions are for catching **bugs**: situations that can only happen if the code itself is wrong, such as a total that should always be 100, or a list that should already be sorted. They make a wrong assumption fail loudly, right where it went wrong, instead of producing a strange result three functions later.",
    "They are **not** for checking user input or anything that can legitimately go wrong while the program runs. Python can be started with assertions switched off (`python -O`), and then they simply don't run. For input and other expected problems, `raise` a proper exception, as in the last lessons.",
    "Assertions are also the building block of **tests**: small functions that call your code with known inputs and assert the answers. If a test function runs without an `AssertionError`, the code passed. The checks in CodeQuest's challenges work exactly like this.",
    "```\ndef is_even(n):\n    return n % 2 == 0\n\ndef test_is_even():\n    assert is_even(4)\n    assert not is_even(7)\n    assert is_even(0), \"zero is even\"\n\ntest_is_even()\nprint(\"All tests passed\")\n```",
    "A good test checks the ordinary case, the edges (zero, empty, one item, negative numbers) and anything that once had a bug. Tools like pytest find and run every `test_` function in a project for you, and they show both values when an `assert a == b` fails.",
    "Make the message useful: include the values involved, as in `assert total == 100, f\"Parts add up to {total}, not 100\"`. A failing assertion then tells you not just that something is wrong, but what.",
  ],
  sandboxCode: "def is_even(n):\n    return n % 2 == 0\n\ndef test_is_even():\n    assert is_even(4)\n    assert not is_even(7)\n    assert is_even(0), \"zero is even\"\n\ntest_is_even()\nprint(\"All tests passed\")\n\nparts = [50, 30, 15]\ntotal = sum(parts)\nassert total == 100, f\"Parts add up to {total}, not 100\"",
  sandboxSnippets: [
    snippet("A passing assert", "x = 5\nassert x > 0, \"x must be positive\"\nprint(\"Still running\")"),
    snippet("A failing assert", "x = -2\nassert x > 0, f\"x must be positive, got {x}\""),
    snippet("A tiny test", "def double(n):\n    return n * 2\n\ndef test_double():\n    assert double(2) == 4\n    assert double(0) == 0\n    assert double(-3) == -6\n\ntest_double()\nprint(\"ok\")"),
    snippet("Assert or raise?", "def set_age(age):\n    if age < 0:\n        raise ValueError(\"Age can't be negative\")   # user input: raise\n    return age\n\ndef area(w, h):\n    result = w * h\n    assert result >= 0, \"area can't be negative\"     # a bug check: assert\n    return result\n\nprint(set_age(5), area(2, 3))"),
  ],
  readMore: { label: "Python docs: the assert statement", url: "https://docs.python.org/3/reference/simple_stmts.html#the-assert-statement", source: "Python docs" },
  challenges: [
    task("easy", "Guard the average", {
      prompt: "Add an assertion to `average` so that an empty list raises `AssertionError` with the message `numbers must not be empty`.",
      starter: "def average(numbers):\n    return sum(numbers) / len(numbers)\n",
      hint: "First line of the body: `assert len(numbers) > 0, \"numbers must not be empty\"`.",
      solution: "def average(numbers):\n    assert len(numbers) > 0, \"numbers must not be empty\"\n    return sum(numbers) / len(numbers)",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["average([2, 4])", "average([2, 4]) == 3"],
        ["average([]) asserts", "_error(average, []) == \"AssertionError: numbers must not be empty\""],
      ],
    }),
    task("easy", "Parts of a whole", {
      prompt: "Define `check_parts(parts)` that asserts the parts add up to 100 (message `Parts must add up to 100`) and returns `True`.",
      hint: "`assert sum(parts) == 100, \"Parts must add up to 100\"`, then `return True`.",
      solution: "def check_parts(parts):\n    assert sum(parts) == 100, \"Parts must add up to 100\"\n    return True",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["Good parts", "check_parts([50, 30, 20]) is True"],
        ["Bad parts", "_error(check_parts, [50, 30]) == \"AssertionError: Parts must add up to 100\""],
      ],
    }),
    task("easy", "The test is right", {
      prompt: "This test fails, because `square` has a bug. Fix `square`, not the test.",
      starter: "def square(n):\n    return n * 2\n\ndef test_square():\n    assert square(3) == 9\n    assert square(0) == 0\n    assert square(-2) == 4\n\ntest_square()\n",
      hint: "A square is a number times itself: `n * n`.",
      solution: "def square(n):\n    return n * n\n\ndef test_square():\n    assert square(3) == 9\n    assert square(0) == 0\n    assert square(-2) == 4\n\ntest_square()",
      tests: [
        ["square(3) is 9", "square(3) == 9"],
        ["The test passes", "test_square() is None"],
      ],
    }),
    task("medium", "Raise, don't assert", {
      prompt: "Assertions can be switched off, so they mustn't check user input. Change `set_age` to raise `ValueError(\"Age can't be negative\")` instead.",
      starter: "def set_age(age):\n    assert age >= 0, \"Age can't be negative\"\n    return age\n",
      hint: "Replace the `assert` with `if age < 0: raise ValueError(...)`.",
      solution: "def set_age(age):\n    if age < 0:\n        raise ValueError(\"Age can't be negative\")\n    return age",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["set_age(5)", "set_age(5) == 5"],
        ["A ValueError now", "_error(set_age, -1) == \"ValueError: Age can't be negative\""],
      ],
    }),
    task("medium", "Never below zero", {
      prompt: "Define `apply(balance, changes)` that adds each change to the balance in turn, asserting after each step that it isn't negative (message like `Balance went negative: -20`), and returns the final balance.",
      hint: "In the loop, after `balance += change`, `assert balance >= 0, f\"Balance went negative: {balance}\"`.",
      solution: "def apply(balance, changes):\n    for change in changes:\n        balance += change\n        assert balance >= 0, f\"Balance went negative: {balance}\"\n    return balance",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["Stays positive", "apply(100, [-30, 50, -20]) == 100"],
        ["Goes negative", "_error(apply, 10, [5, -35, 40]) == \"AssertionError: Balance went negative: -20\""],
      ],
    }),
    task("medium", "A useful message", {
      prompt: "Define `check_sorted(items)` that asserts each item is no bigger than the next, with a message naming the first bad position, like `Not sorted at index 2`, and returns `True`.",
      hint: "Loop `i` over `range(len(items) - 1)` and `assert items[i] <= items[i + 1], f\"Not sorted at index {i}\"`.",
      solution: "def check_sorted(items):\n    for i in range(len(items) - 1):\n        assert items[i] <= items[i + 1], f\"Not sorted at index {i}\"\n    return True",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["Sorted", "check_sorted([1, 2, 2, 5]) is True"],
        ["Not sorted", "_error(check_sorted, [1, 3, 7, 4]) == \"AssertionError: Not sorted at index 2\""],
        ["Empty", "check_sorted([]) is True"],
      ],
    }),
    task("hard", "Write a test", {
      prompt: "Write `test_reverse()` with at least three `assert`s checking `reverse` (a normal word, an empty string, and a single letter). Then call it. A good test must also **fail** for a broken `reverse`.",
      starter: "def reverse(text):\n    return text[::-1]\n\n",
      hint: "For example `assert reverse(\"abc\") == \"cba\"`, `assert reverse(\"\") == \"\"`, `assert reverse(\"a\") == \"a\"`.",
      solution: "def reverse(text):\n    return text[::-1]\n\ndef test_reverse():\n    assert reverse(\"abc\") == \"cba\"\n    assert reverse(\"\") == \"\"\n    assert reverse(\"a\") == \"a\"\n\ntest_reverse()",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["It passes for the real reverse", "test_reverse() is None"],
        ["It catches a reverse that does nothing", "_catches(test_reverse, \"reverse\", lambda s: s)"],
        ["It catches one that breaks on empty text", "_catches(test_reverse, \"reverse\", lambda s: s[::-1] if s else \"?\")"],
      ],
    }),
    task("hard", "Test the edges", {
      prompt: "Write `test_is_palindrome()` that checks `is_palindrome` on at least: a palindrome, a word that isn't one, and a palindrome with capitals (`Anna`). Call it.",
      starter: "def is_palindrome(word):\n    w = word.lower()\n    return w == w[::-1]\n\n",
      hint: "Use `assert is_palindrome(...)` for true cases and `assert not is_palindrome(...)` for false ones.",
      solution: "def is_palindrome(word):\n    w = word.lower()\n    return w == w[::-1]\n\ndef test_is_palindrome():\n    assert is_palindrome(\"level\")\n    assert not is_palindrome(\"python\")\n    assert is_palindrome(\"Anna\")\n\ntest_is_palindrome()",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["It passes", "test_is_palindrome() is None"],
        ["Catches \"always True\"", "_catches(test_is_palindrome, \"is_palindrome\", lambda w: True)"],
        ["Catches ignoring capitals wrongly", "_catches(test_is_palindrome, \"is_palindrome\", lambda w: w == w[::-1])"],
      ],
    }),
    task("expert", "Explain the failure", {
      prompt: "Define `check_total(order)` for an order dict with `items` (a list of prices) and `total`. Assert that the total matches the sum of the items, with a message like `Total is 12, but items add up to 10`, and return `True`.",
      hint: "Work out `expected = sum(order[\"items\"])`, then assert with an f-string message showing both numbers.",
      solution: "def check_total(order):\n    expected = sum(order[\"items\"])\n    assert order[\"total\"] == expected, f\"Total is {order['total']}, but items add up to {expected}\"\n    return True",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["A right total", "check_total({\"items\": [4, 6], \"total\": 10}) is True"],
        ["A wrong total", "_error(check_total, {\"items\": [4, 6], \"total\": 12}) == \"AssertionError: Total is 12, but items add up to 10\""],
      ],
    }),
    task("expert", "Test a function with several cases", {
      prompt: "Write `test_grade()` that checks `grade` at every boundary: 90 and 89, 80 and 79, 70 and 69. Call it.",
      starter: "def grade(score):\n    if score >= 90:\n        return \"A\"\n    if score >= 80:\n        return \"B\"\n    if score >= 70:\n        return \"C\"\n    return \"F\"\n\n",
      hint: "Six asserts, such as `assert grade(90) == \"A\"` and `assert grade(89) == \"B\"`.",
      solution: "def grade(score):\n    if score >= 90:\n        return \"A\"\n    if score >= 80:\n        return \"B\"\n    if score >= 70:\n        return \"C\"\n    return \"F\"\n\ndef test_grade():\n    assert grade(90) == \"A\"\n    assert grade(89) == \"B\"\n    assert grade(80) == \"B\"\n    assert grade(79) == \"C\"\n    assert grade(70) == \"C\"\n    assert grade(69) == \"F\"\n\ntest_grade()",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["It passes", "test_grade() is None"],
        ["Catches > instead of >= at 90", "_catches(test_grade, \"grade\", lambda s: \"A\" if s > 90 else \"B\" if s >= 80 else \"C\" if s >= 70 else \"F\")"],
        ["Catches a mistake at 70", "_catches(test_grade, \"grade\", lambda s: \"A\" if s >= 90 else \"B\" if s >= 80 else \"C\" if s > 70 else \"F\")"],
        ["Catches a mistake at 80", "_catches(test_grade, \"grade\", lambda s: \"A\" if s >= 90 else \"B\" if s >= 81 else \"C\" if s >= 70 else \"F\")"],
      ],
    }),
  ],
  questions: [
    mc("What does `assert x > 0, \"bad\"` do when `x` is 5?", ["Raises `AssertionError`", "Nothing: the program carries on", "Prints \"bad\"", "Returns `True`"], 1),
    mc("What should assertions check?", ["User input", "Network errors", "Things that can only be false if the code has a bug", "Missing files"], 2),
    mc("Why not check user input with `assert`?", ["Assertions can be switched off, with `python -O`", "It is slower", "It prints too much", "It is a syntax error"], 0),
    mc("How do CodeQuest's challenge checks work?", ["Someone reads your code", "They count your lines", "They guess at random", "Like assertions: each check is a condition run against your code"], 3),
    qShort("`assert 2 + 2 == 5, \"maths\"`. Which exception is raised? (class name)", "AssertionError"),
    mc("When has a test function passed?", ["When it prints \"ok\"", "When it runs without an `AssertionError`", "When it returns `True`", "When it is called twice"], 1),
    mc("Which values make good test cases?", ["The ordinary case and the edges, like 0, empty and negative", "Only big numbers", "Only one typical value", "Random values"], 0),
    mc("Why put values in the assertion message?", ["It is required", "It hides the error", "So a failure says what went wrong, not just that it did", "It makes the test faster"], 2),
    mc("What does a good test do when the code is broken?", ["Passes anyway", "Fixes the code", "Prints a warning", "Fails"], 3),
    mc("Which tool finds and runs `test_` functions in a project?", ["pip", "pytest", "print", "logging"], 1),
  ],
})
