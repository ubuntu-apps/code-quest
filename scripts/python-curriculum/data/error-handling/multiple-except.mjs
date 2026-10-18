// Errors and exceptions topic: Handling different errors. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "multiple_except",
  title: "Handling different errors",
  paragraphs: [
    "One `try` block can go wrong in more than one way. Converting text and then dividing by it might fail because the text isn't a number, or because the number is 0. Give each kind of exception its own `except` clause, and Python runs the first one that matches:",
    "```\ndef divide_by(text):\n    try:\n        return 100 / int(text)\n    except ValueError:\n        return \"not a number\"\n    except ZeroDivisionError:\n        return \"can't divide by zero\"\n\nprint(divide_by(\"4\"), divide_by(\"x\"), divide_by(\"0\"))\n```",
    "When several exceptions need the **same** handling, list them in a tuple: `except (KeyError, IndexError):`. Add `as e` to get the exception object, and `type(e).__name__` gives its name as text, such as `\"KeyError\"`.",
    "Python checks the `except` clauses **from the top** and uses the first that matches, so order matters. `except Exception:` matches almost every error, so if it comes first, the specific clauses below it never run. Put specific exceptions first and general ones last.",
    "An `except Exception as e:` at the end is a reasonable safety net in a program that must keep going, like a command loop, as long as it **reports** what happened instead of hiding it.",
    "```\nfor command in [\"10/2\", \"8/0\", \"x/3\", \"7\"]:\n    try:\n        a, b = command.split(\"/\")\n        print(int(a) / int(b))\n    except ZeroDivisionError:\n        print(\"Can't divide by zero\")\n    except ValueError as e:\n        print(\"Bad input:\", e)\n```",
    "Notice that the last command, `7`, raises a `ValueError` too: unpacking one piece into `a, b` fails with `not enough values to unpack`. Different mistakes can raise the same exception type, so read the message as well as the name.",
  ],
  sandboxCode: "def divide_by(text):\n    try:\n        return 100 / int(text)\n    except ValueError:\n        return \"not a number\"\n    except ZeroDivisionError:\n        return \"can't divide by zero\"\n\nfor t in [\"4\", \"x\", \"0\"]:\n    print(t, \"->\", divide_by(t))",
  sandboxSnippets: [
    snippet("Two except clauses", "for text in [\"5\", \"five\", \"0\"]:\n    try:\n        print(10 / int(text))\n    except ValueError:\n        print(\"Not a number:\", text)\n    except ZeroDivisionError:\n        print(\"Zero!\")"),
    snippet("A tuple of exceptions", "def first(container, key):\n    try:\n        return container[key]\n    except (KeyError, IndexError):\n        return None\n\nprint(first({\"a\": 1}, \"b\"), first([1, 2], 9), first([1, 2], 0))"),
    snippet("The exception's name", "try:\n    [][0]\nexcept Exception as e:\n    print(type(e).__name__, \"-\", e)"),
    snippet("Order matters", "try:\n    int(\"x\")\nexcept Exception:\n    print(\"general handler\")\nexcept ValueError:\n    print(\"never reached\")"),
    snippet("Same type, different causes", "for command in [\"10/2\", \"x/3\", \"7\"]:\n    try:\n        a, b = command.split(\"/\")\n        print(int(a) / int(b))\n    except ValueError as e:\n        print(\"Bad input:\", e)"),
  ],
  readMore: { label: "Python tutorial: handling exceptions", url: "https://docs.python.org/3/tutorial/errors.html#handling-exceptions", source: "Python docs" },
  challenges: [
    task("easy", "Two things can go wrong", {
      prompt: "Define `divide_by(text)` that returns `100 / int(text)`, `not a number` for a `ValueError`, and `cannot divide by zero` for a `ZeroDivisionError`.",
      hint: "One `try` and two `except` clauses, each returning its message.",
      solution: "def divide_by(text):\n    try:\n        return 100 / int(text)\n    except ValueError:\n        return \"not a number\"\n    except ZeroDivisionError:\n        return \"cannot divide by zero\"",
      tests: [
        ["divide_by(\"4\")", "divide_by(\"4\") == 25"],
        ["divide_by(\"x\")", "divide_by(\"x\") == \"not a number\""],
        ["divide_by(\"0\")", "divide_by(\"0\") == \"cannot divide by zero\""],
      ],
    }),
    task("easy", "Same handling", {
      prompt: "Define `get_item(container, key)` that returns `container[key]`, or `None` when it raises a `KeyError` or an `IndexError`. Use one `except` with a tuple.",
      hint: "`except (KeyError, IndexError):`.",
      solution: "def get_item(container, key):\n    try:\n        return container[key]\n    except (KeyError, IndexError):\n        return None",
      tests: [
        ["From a dict", "get_item({\"a\": 1}, \"a\") == 1"],
        ["A missing key", "get_item({\"a\": 1}, \"b\") is None"],
        ["Past the end of a list", "get_item([1, 2], 5) is None"],
      ],
    }),
    task("easy", "Name the error", {
      prompt: "Define `what_went_wrong(text)` that tries `100 / int(text)` and returns `ok`, or the name of the exception (such as `ValueError`).",
      hint: "`except (ValueError, ZeroDivisionError) as e: return type(e).__name__`.",
      solution: "def what_went_wrong(text):\n    try:\n        100 / int(text)\n        return \"ok\"\n    except (ValueError, ZeroDivisionError) as e:\n        return type(e).__name__",
      tests: [
        ["\"5\"", "what_went_wrong(\"5\") == \"ok\""],
        ["\"five\"", "what_went_wrong(\"five\") == \"ValueError\""],
        ["\"0\"", "what_went_wrong(\"0\") == \"ZeroDivisionError\""],
      ],
    }),
    task("medium", "Fix the order", {
      prompt: "`parse(\"x\")` should return `bad number`, but the general clause catches it first. Fix the order of the `except` clauses.",
      starter: "def parse(text):\n    try:\n        return int(text)\n    except Exception:\n        return \"something went wrong\"\n    except ValueError:\n        return \"bad number\"\n",
      hint: "Specific clauses go first: move `except ValueError:` above `except Exception:`.",
      solution: "def parse(text):\n    try:\n        return int(text)\n    except ValueError:\n        return \"bad number\"\n    except Exception:\n        return \"something went wrong\"",
      tests: [
        ["parse(\"x\")", "parse(\"x\") == \"bad number\""],
        ["parse(\"7\")", "parse(\"7\") == 7"],
        ["parse(None) still reaches the general clause", "parse(None) == \"something went wrong\""],
      ],
    }),
    task("medium", "Read an age", {
      prompt: "Define `get_age(person)` that returns `int(person[\"age\"])`, `missing age` when there is no `age` key, and `bad age` when it isn't a whole number.",
      hint: "Catch `KeyError` and `ValueError` in separate clauses.",
      solution: "def get_age(person):\n    try:\n        return int(person[\"age\"])\n    except KeyError:\n        return \"missing age\"\n    except ValueError:\n        return \"bad age\"",
      tests: [
        ["A good age", "get_age({\"age\": \"30\"}) == 30"],
        ["No age", "get_age({\"name\": \"Ana\"}) == \"missing age\""],
        ["A bad age", "get_age({\"age\": \"old\"}) == \"bad age\""],
      ],
    }),
    task("medium", "Run the sums", {
      prompt: "Define `run(commands)` for commands like `10/2`: return a list with the result of each, or `zero` for a division by zero, or `bad` for anything that raises a `ValueError`.",
      hint: "For each command: `a, b = command.split(\"/\")` and `int(a) / int(b)` in a `try`, appending the result or the message.",
      solution: "def run(commands):\n    results = []\n    for command in commands:\n        try:\n            a, b = command.split(\"/\")\n            results.append(int(a) / int(b))\n        except ZeroDivisionError:\n            results.append(\"zero\")\n        except ValueError:\n            results.append(\"bad\")\n    return results",
      tests: [
        ["Mixed commands", "run([\"10/2\", \"8/0\", \"x/3\", \"7\"]) == [5.0, \"zero\", \"bad\", \"bad\"]"],
        ["No commands", "run([]) == []"],
      ],
    }),
    task("hard", "Dig for an email", {
      prompt: "Define `email_of(data, i)` that returns `data[\"users\"][i][\"email\"]`, or `None` if any step fails with a `KeyError`, `IndexError` or `TypeError`.",
      hint: "Put the whole lookup in `try` and catch the three in one tuple.",
      solution: "def email_of(data, i):\n    try:\n        return data[\"users\"][i][\"email\"]\n    except (KeyError, IndexError, TypeError):\n        return None",
      tests: [
        ["Found", "email_of({\"users\": [{\"email\": \"a@example.net\"}]}, 0) == \"a@example.net\""],
        ["No users key", "email_of({}, 0) is None"],
        ["Index out of range", "email_of({\"users\": []}, 0) is None"],
        ["A user that is None", "email_of({\"users\": [None]}, 0) is None"],
      ],
    }),
    task("hard", "Minutes from a time", {
      prompt: "Define `minutes(text)` that turns `\"12:30\"` into 750 (minutes since midnight), or returns `None` for text it can't read, such as `12-30` or `ab:cd`.",
      hint: "`h, m = text.split(\":\")` raises `ValueError` if there isn't exactly one colon, and so does `int(\"ab\")`. Catch `ValueError`.",
      solution: "def minutes(text):\n    try:\n        h, m = text.split(\":\")\n        return int(h) * 60 + int(m)\n    except ValueError:\n        return None",
      tests: [
        ["12:30", "minutes(\"12:30\") == 750"],
        ["12-30", "minutes(\"12-30\") is None"],
        ["ab:cd", "minutes(\"ab:cd\") is None"],
        ["1:2:3", "minutes(\"1:2:3\") is None"],
      ],
    }),
    task("expert", "Count the problems", {
      prompt: "Define `average(items)` that averages the items that work with `float(item)`, and returns `(average, problems)`, where `problems` counts the failures by exception name. `float(None)` raises a `TypeError`.",
      hint: "Keep a list of numbers and a dict of counts. In `except (ValueError, TypeError) as e:` add 1 to `problems[type(e).__name__]`.",
      solution: "def average(items):\n    numbers = []\n    problems = {}\n    for item in items:\n        try:\n            numbers.append(float(item))\n        except (ValueError, TypeError) as e:\n            name = type(e).__name__\n            problems[name] = problems.get(name, 0) + 1\n    return sum(numbers) / len(numbers), problems",
      tests: [
        ["Mixed items", "average([\"4\", 6, \"x\", None, \"2\"]) == (4.0, {\"ValueError\": 1, \"TypeError\": 1})"],
        ["All good", "average([1, 2]) == (1.5, {})"],
      ],
    }),
    task("expert", "A tiny calculator", {
      prompt: "Define `calc(text)` for text like `3 + 4`, with `+`, `-`, `*` and `/`. Return the result, or `bad number`, `division by zero`, or `unknown operator`. Look the operator up in a dict of lambdas, so an unknown one raises a `KeyError`.",
      hint: "`ops = {\"+\": lambda a, b: a + b, ...}`. Split the text into three parts, convert the numbers with `float`, then `ops[op](a, b)`. Catch `ValueError`, `ZeroDivisionError` and `KeyError` separately.",
      solution: "def calc(text):\n    ops = {\"+\": lambda a, b: a + b, \"-\": lambda a, b: a - b, \"*\": lambda a, b: a * b, \"/\": lambda a, b: a / b}\n    try:\n        a, op, b = text.split()\n        return ops[op](float(a), float(b))\n    except ValueError:\n        return \"bad number\"\n    except ZeroDivisionError:\n        return \"division by zero\"\n    except KeyError:\n        return \"unknown operator\"",
      tests: [
        ["3 + 4", "calc(\"3 + 4\") == 7"],
        ["8 / 0", "calc(\"8 / 0\") == \"division by zero\""],
        ["x * 2", "calc(\"x * 2\") == \"bad number\""],
        ["2 ^ 3", "calc(\"2 ^ 3\") == \"unknown operator\""],
      ],
    }),
  ],
  questions: [
    mc("How many `except` clauses can one `try` have?", ["Only one", "As many as you need", "Two", "One per line of code"], 1),
    mc("Which `except` clause runs when several could match?", ["The last one", "All of them", "The first one that matches, from the top", "The most specific, wherever it is"], 2),
    mc("How do you handle `KeyError` and `IndexError` the same way?", ["`except (KeyError, IndexError):`", "`except KeyError, IndexError:`", "`except KeyError or IndexError:`", "`except KeyError and IndexError:`"], 0),
    mc("What does `type(e).__name__` give for a `ValueError`?", ["`ValueError()`", "The message", "`<class>`", "`\"ValueError\"`"], 3),
    qShort("Which exception does `10 / 0` raise? (class name)", "ZeroDivisionError"),
    mc("Why must `except Exception:` come after the specific clauses?", ["It is slower", "It catches almost everything, so clauses after it never run", "Python requires it last", "It only works at the end"], 1),
    mc("`a, b = \"7\".split(\"/\")` raises which exception?", ["`ValueError`", "`IndexError`", "`TypeError`", "`KeyError`"], 0),
    mc("When is a final `except Exception as e:` reasonable?", ["Always, instead of specific clauses", "Never", "In a loop that must keep going, as long as it reports the error", "Only for `KeyError`"], 2),
    mc("What does `float(None)` raise?", ["`ValueError`", "`KeyError`", "Nothing: it gives 0.0", "`TypeError`"], 3),
    mc("A `ValueError` can come from different mistakes. How do you tell them apart?", ["You can't", "Read the message too, not just the name", "Use a bare `except`", "Check the line count"], 1),
  ],
})
