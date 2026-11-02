// Errors and exceptions topic: The exception family tree. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "exception_hierarchy",
  title: "The exception family tree",
  paragraphs: [
    "Python's exceptions form a family tree. `KeyError` and `IndexError` are both kinds of `LookupError`; `ZeroDivisionError` and `OverflowError` are kinds of `ArithmeticError`; and nearly everything is a kind of `Exception`. A small part of the tree:",
    "```\nBaseException\n├── KeyboardInterrupt, SystemExit\n└── Exception\n    ├── ArithmeticError\n    │   ├── ZeroDivisionError\n    │   └── OverflowError\n    ├── LookupError\n    │   ├── KeyError\n    │   └── IndexError\n    ├── ValueError\n    ├── TypeError\n    ├── NameError\n    └── OSError\n        └── FileNotFoundError\n```",
    "An `except` clause catches the exception you name **and all its children**. `except LookupError:` catches both `KeyError` and `IndexError`, which is neater than listing them when the reason doesn't matter. `except ArithmeticError:` catches division by zero and overflow alike.",
    "You can ask about the tree directly. `issubclass(KeyError, LookupError)` is `True`, and `isinstance(e, LookupError)` checks an exception object you've caught. Every exception class lists its ancestors in `__mro__`, from itself up to `object`.",
    "```\nprint(issubclass(KeyError, LookupError))        # True\nprint(issubclass(ValueError, LookupError))      # False\nprint([c.__name__ for c in KeyError.__mro__])\n# ['KeyError', 'LookupError', 'Exception', 'BaseException', 'object']\n```",
    "The tree explains why order matters between clauses: a parent listed first catches its children before their own clauses get a chance. Put children first, parents later: `except ZeroDivisionError:` before `except ArithmeticError:`.",
    "At the top, `BaseException` also covers `KeyboardInterrupt` (the user pressing Ctrl+C) and `SystemExit` (from `exit()`). These aren't errors in your logic; they are ways of stopping the program. That's why handlers use `except Exception:` as the widest net, never `except BaseException:` or a bare `except:`, which would trap them too.",
    "Catching too broadly hides bugs. `except Exception:` around a block with a typo turns `NameError: name 'totl' is not defined` into a quiet wrong answer. Catch the narrowest family that covers what you expect.",
  ],
  sandboxCode: "for cls in [KeyError, IndexError, ZeroDivisionError, ValueError]:\n    names = [c.__name__ for c in cls.__mro__]\n    print(\" -> \".join(names))\n\ntry:\n    {\"a\": 1}[\"b\"]\nexcept LookupError as e:\n    print(\"Caught a\", type(e).__name__, \"as a LookupError\")",
  sandboxSnippets: [
    snippet("Catch the family", "for action in [lambda: [][0], lambda: {}[\"x\"]]:\n    try:\n        action()\n    except LookupError as e:\n        print(\"lookup problem:\", type(e).__name__)"),
    snippet("issubclass", "print(issubclass(ZeroDivisionError, ArithmeticError))\nprint(issubclass(KeyError, Exception))\nprint(issubclass(KeyboardInterrupt, Exception))"),
    snippet("isinstance on a caught error", "try:\n    1 / 0\nexcept Exception as e:\n    print(isinstance(e, ArithmeticError), isinstance(e, LookupError))"),
    snippet("The ancestors", "print([c.__name__ for c in FileNotFoundError.__mro__])"),
    snippet("Too broad hides a typo", "def total(prices):\n    try:\n        return sum(pricse)\n    except Exception:\n        return 0\n\nprint(total([1, 2, 3]))"),
  ],
  readMore: { label: "Python docs: the exception hierarchy", url: "https://docs.python.org/3/library/exceptions.html#exception-hierarchy", source: "Python docs" },
  challenges: [
    task("easy", "Is it a lookup error?", {
      prompt: "Set `is_lookup` to whether `KeyError` is a kind of `LookupError`, and `is_value` to whether `IndexError` is a kind of `ValueError`, using `issubclass`.",
      hint: "`issubclass(child, parent)` returns `True` or `False`.",
      solution: "is_lookup = issubclass(KeyError, LookupError)\nis_value = issubclass(IndexError, ValueError)",
      tests: [
        ["is_lookup is True", "is_lookup is True"],
        ["is_value is False", "is_value is False"],
      ],
    }),
    task("easy", "Catch the parent", {
      prompt: "Define `fetch(container, key)` that returns `container[key]`, or `None` for any `LookupError` (so both missing keys and bad indexes).",
      hint: "`except LookupError: return None` catches `KeyError` and `IndexError`.",
      solution: "def fetch(container, key):\n    try:\n        return container[key]\n    except LookupError:\n        return None",
      tests: [
        ["A dict key", "fetch({\"a\": 1}, \"a\") == 1"],
        ["A missing key", "fetch({\"a\": 1}, \"z\") is None"],
        ["A bad index", "fetch([1, 2], 9) is None"],
      ],
    }),
    task("easy", "Whose child?", {
      prompt: "Set `parent` to the name of the class right above `ZeroDivisionError` in the tree, as text, using `__mro__`.",
      hint: "`ZeroDivisionError.__mro__[1]` is its parent class; `.__name__` gives its name.",
      solution: "parent = ZeroDivisionError.__mro__[1].__name__",
      tests: [
        ["parent is ArithmeticError", "parent == \"ArithmeticError\""],
      ],
    }),
    task("medium", "Sort the problems", {
      prompt: "Define `family(e)` that returns `lookup`, `arithmetic` or `value` for an exception object of those families, and `other` for anything else.",
      hint: "Check with `isinstance(e, LookupError)`, `isinstance(e, ArithmeticError)` and `isinstance(e, ValueError)`.",
      solution: "def family(e):\n    if isinstance(e, LookupError):\n        return \"lookup\"\n    if isinstance(e, ArithmeticError):\n        return \"arithmetic\"\n    if isinstance(e, ValueError):\n        return \"value\"\n    return \"other\"",
      tests: [
        ["KeyError", "family(KeyError(\"k\")) == \"lookup\""],
        ["IndexError", "family(IndexError()) == \"lookup\""],
        ["OverflowError", "family(OverflowError()) == \"arithmetic\""],
        ["ValueError", "family(ValueError()) == \"value\""],
        ["TypeError", "family(TypeError()) == \"other\""],
      ],
    }),
    task("medium", "Too broad", {
      prompt: "`parse(\" 5\")` should be 5, but it always returns 0: `except Exception` hides a typo. Catch only `ValueError`, run it to see the real error, and fix the typo.",
      starter: "def parse(text):\n    try:\n        return int(txet)\n    except Exception:\n        return 0\n",
      hint: "With `except ValueError:` the `NameError` shows up: the variable is `text`, not `txet`.",
      solution: "def parse(text):\n    try:\n        return int(text)\n    except ValueError:\n        return 0",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\n",
      tests: [
        ["parse(\" 5\")", "parse(\" 5\") == 5"],
        ["parse(\"x\")", "parse(\"x\") == 0"],
        ["Other errors are not hidden", "_raises(parse, None) == \"TypeError\""],
      ],
    }),
    task("medium", "Family names", {
      prompt: "Define `ancestors(cls)` that returns the names of an exception class and its ancestors, up to and including `Exception`.",
      hint: "Loop over `cls.__mro__`, append each `__name__`, and `break` after `Exception`.",
      solution: "def ancestors(cls):\n    names = []\n    for c in cls.__mro__:\n        names.append(c.__name__)\n        if c is Exception:\n            break\n    return names",
      tests: [
        ["KeyError", "ancestors(KeyError) == [\"KeyError\", \"LookupError\", \"Exception\"]"],
        ["FileNotFoundError", "ancestors(FileNotFoundError) == [\"FileNotFoundError\", \"OSError\", \"Exception\"]"],
        ["ValueError", "ancestors(ValueError) == [\"ValueError\", \"Exception\"]"],
      ],
    }),
    task("hard", "Children first", {
      prompt: "Define `describe(action)` that calls `action()` and returns `zero` for a `ZeroDivisionError`, `math` for any other `ArithmeticError`, `other` for any other `Exception`, and `fine` if nothing goes wrong.",
      hint: "Three `except` clauses, child before parent: `ZeroDivisionError`, then `ArithmeticError`, then `Exception`.",
      solution: "def describe(action):\n    try:\n        action()\n    except ZeroDivisionError:\n        return \"zero\"\n    except ArithmeticError:\n        return \"math\"\n    except Exception:\n        return \"other\"\n    return \"fine\"",
      tests: [
        ["Division by zero", "describe(lambda: 1 / 0) == \"zero\""],
        ["Overflow", "describe(lambda: 10.0 ** 1000) == \"math\""],
        ["A KeyError", "describe(lambda: {}[\"x\"]) == \"other\""],
        ["No problem", "describe(lambda: 1 + 1) == \"fine\""],
      ],
    }),
    task("hard", "Not errors at all", {
      prompt: "Set `stoppers` to the names of the classes in `classes` that are **not** a kind of `Exception`.",
      starter: "classes = [ValueError, KeyboardInterrupt, KeyError, SystemExit, OSError]\n",
      hint: "A comprehension with `if not issubclass(c, Exception)`, keeping `c.__name__`.",
      solution: "classes = [ValueError, KeyboardInterrupt, KeyError, SystemExit, OSError]\nstoppers = [c.__name__ for c in classes if not issubclass(c, Exception)]",
      tests: [
        ["stoppers is right", "stoppers == [\"KeyboardInterrupt\", \"SystemExit\"]"],
      ],
    }),
    task("expert", "Count by family", {
      prompt: "Define `tally(actions)` that runs each action and counts the exceptions they raise by family: return a dict with keys `lookup`, `arithmetic` and `other` (only for families that occurred).",
      hint: "Run each in `try`. In `except Exception as e:` pick the key with `isinstance` checks and add 1 with `get`.",
      solution: "def tally(actions):\n    counts = {}\n    for action in actions:\n        try:\n            action()\n        except Exception as e:\n            if isinstance(e, LookupError):\n                key = \"lookup\"\n            elif isinstance(e, ArithmeticError):\n                key = \"arithmetic\"\n            else:\n                key = \"other\"\n            counts[key] = counts.get(key, 0) + 1\n    return counts",
      tests: [
        ["Mixed actions", "tally([lambda: [][1], lambda: 1 / 0, lambda: {}[\"k\"], lambda: int(\"x\"), lambda: 5]) == {\"lookup\": 2, \"arithmetic\": 1, \"other\": 1}"],
        ["No errors", "tally([lambda: 1]) == {}"],
      ],
    }),
    task("expert", "A shared parent", {
      prompt: "Define `common_parent(a, b)` that returns the name of the closest class both exception classes descend from.",
      hint: "Walk `a.__mro__` in order and return the first class that also appears in `b.__mro__`.",
      solution: "def common_parent(a, b):\n    for c in a.__mro__:\n        if c in b.__mro__:\n            return c.__name__",
      tests: [
        ["KeyError and IndexError", "common_parent(KeyError, IndexError) == \"LookupError\""],
        ["ZeroDivisionError and OverflowError", "common_parent(ZeroDivisionError, OverflowError) == \"ArithmeticError\""],
        ["ValueError and KeyError", "common_parent(ValueError, KeyError) == \"Exception\""],
        ["The same class", "common_parent(KeyError, KeyError) == \"KeyError\""],
      ],
    }),
  ],
  questions: [
    mc("What does `except LookupError:` catch?", ["Only `LookupError` itself", "`LookupError` and its children, like `KeyError` and `IndexError`", "Every exception", "Only `KeyError`"], 1, "An `except` clause also catches every subclass of the exception it names."),
    mc("Which is a kind of `ArithmeticError`?", ["`ValueError`", "`KeyError`", "`ZeroDivisionError`", "`TypeError`"], 2, "`ZeroDivisionError` is a subclass of `ArithmeticError`."),
    mc("What does `issubclass(KeyError, Exception)` give?", ["`True`", "`False`", "An error", "`None`"], 0, "`KeyError` comes from `LookupError`, which comes from `Exception`."),
    mc("Why not catch `BaseException`?", ["It is slower", "It doesn't exist", "It only catches typos", "It also traps `KeyboardInterrupt` and `SystemExit`, which stop the program"], 3, "`BaseException` includes Ctrl+C (`KeyboardInterrupt`) and `sys.exit()`, which should be allowed to stop the program."),
    qShort("What is the parent class of `KeyError`? (class name)", "LookupError", "`KeyError` and `IndexError` are both kinds of `LookupError`."),
    mc("Which order of clauses is right?", ["`except ArithmeticError:` then `except ZeroDivisionError:`", "`except ZeroDivisionError:` then `except ArithmeticError:`", "Either: Python sorts them", "Only one is allowed"], 1, "Put the specific clause first; the general one would otherwise catch everything first."),
    mc("How do you check a caught exception's family?", ["`isinstance(e, LookupError)`", "`e == LookupError`", "`type(e) is LookupError`", "`e.family`"], 0, "`isinstance` is also true for subclasses, so it checks the whole family."),
    mc("What does `except Exception:` around a typo do?", ["Shows the `NameError`", "Fixes the typo", "Turns the bug into a quiet wrong result", "Raises a `SyntaxError`"], 2, "Catching too broadly hides the `NameError`, so the bug is never reported."),
    mc("What does `KeyError.__mro__` hold?", ["The error message", "Its children", "The line number", "The class and its ancestors, in order"], 3, "The MRO (method resolution order) lists the class and each of its parents, in order."),
    mc("Which exception is a child of `OSError`?", ["`IndexError`", "`FileNotFoundError`", "`ValueError`", "`NameError`"], 1, "File problems like `FileNotFoundError` are kinds of `OSError`."),
  ],
})
