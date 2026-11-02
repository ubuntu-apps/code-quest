// Errors and exceptions topic: Catching errors with try. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task, typedInput } from '../_builders.mjs'

export default makeTopic({
  id: "try_except",
  title: "Catching errors with try",
  paragraphs: [
    "Until now, an error has stopped your program on the spot. Many errors, though, are **expected**: a user types `abc` where you asked for a number, or a price is missing from a list. Python calls these **exceptions**, and your program can catch them and carry on.",
    "When an exception isn't caught, Python prints a **traceback**. Read it from the bottom: the last line names the exception and gives its message, such as `ValueError: invalid literal for int() with base 10: 'abc'`, and the lines above it show where it happened, with the line number.",
    "To catch an exception, put the risky code in a `try` block and say what to do instead in an `except` block. If anything in `try` raises that exception, Python jumps straight to `except`; if nothing goes wrong, `except` is skipped.",
    "```\ntext = \"abc\"\ntry:\n    number = int(text)\n    print(\"You typed\", number)\nexcept ValueError:\n    print(\"That's not a number.\")\nprint(\"The program carries on.\")\n```",
    "Name the exception you expect, such as `except ValueError:`. A bare `except:` catches **everything**, including your own typos (a `NameError`) and the Stop button, so real bugs hide behind a friendly message. Catch only what you know how to handle.",
    "`except ValueError as e:` also gives you the exception object, and `str(e)` (or just `e` in an f-string) is its message, handy for telling the user what went wrong.",
    "Inside a function, `try`/`except` lets you turn a crash into a sensible result, like returning `None` when the text isn't a number. In a loop, it lets you skip a bad item and move on to the next:",
    "```\ndef to_int(text):\n    try:\n        return int(text)\n    except ValueError:\n        return None\n\nvalues = [\"4\", \"x\", \"10\"]\nprint([to_int(v) for v in values])   # [4, None, 10]\n```",
    "A classic use is asking again until the input is valid: `while True:` read the input, `try` to convert it, and `break` out of the loop once it works.",
  ],
  sandboxCode: "def to_int(text):\n    try:\n        return int(text)\n    except ValueError:\n        return None\n\nfor text in [\"42\", \"abc\", \" 7 \", \"3.5\"]:\n    print(repr(text), \"->\", to_int(text))\n\ntry:\n    print(10 / 0)\nexcept ZeroDivisionError as e:\n    print(\"Caught:\", e)",
  sandboxSnippets: [
    snippet("An uncaught error", "print(\"Before\")\nnumber = int(\"abc\")\nprint(\"After\")"),
    snippet("Catch it", "try:\n    number = int(\"abc\")\nexcept ValueError:\n    number = 0\nprint(number)"),
    snippet("The message", "try:\n    int(\"abc\")\nexcept ValueError as e:\n    print(\"Problem:\", e)"),
    snippet("Skip bad items", "total = 0\nfor text in [\"4\", \"x\", \"10\", \"\"]:\n    try:\n        total += int(text)\n    except ValueError:\n        print(\"Skipping\", repr(text))\nprint(total)"),
    snippet("Other exceptions", "try:\n    print([1, 2, 3][10])\nexcept IndexError as e:\n    print(\"IndexError:\", e)\ntry:\n    print({\"a\": 1}[\"b\"])\nexcept KeyError as e:\n    print(\"KeyError:\", e)"),
  ],
  readMore: { label: "Python tutorial: handling exceptions", url: "https://docs.python.org/3/tutorial/errors.html#handling-exceptions", source: "Python docs" },
  challenges: [
    task("easy", "A safe conversion", {
      prompt: "Define `to_int(text)` that returns `int(text)`, or `None` if the text isn't a whole number.",
      hint: "Put `return int(text)` in a `try` block and `return None` under `except ValueError:`.",
      solution: "def to_int(text):\n    try:\n        return int(text)\n    except ValueError:\n        return None",
      tests: [
        ["to_int(\"42\")", "to_int(\"42\") == 42"],
        ["to_int(\"abc\")", "to_int(\"abc\") is None"],
        ["to_int(\"\")", "to_int(\"\") is None"],
      ],
    }),
    task("easy", "A safe division", {
      prompt: "Define `safe_divide(a, b)` that returns `a / b`, or `None` when `b` is 0.",
      hint: "Dividing by zero raises `ZeroDivisionError`: catch that one.",
      solution: "def safe_divide(a, b):\n    try:\n        return a / b\n    except ZeroDivisionError:\n        return None",
      tests: [
        ["safe_divide(10, 4)", "safe_divide(10, 4) == 2.5"],
        ["safe_divide(1, 0)", "safe_divide(1, 0) is None"],
      ],
    }),
    task("easy", "Don't crash", {
      prompt: "This crashes with a `ValueError`. Wrap the conversion in `try`/`except`, so that when it fails `age` is 0 and `Not a number` is printed.",
      starter: "text = \"thirty\"\nage = int(text)\n",
      hint: "Inside `try:` put `age = int(text)`. Under `except ValueError:` set `age = 0` and print the message.",
      solution: "text = \"thirty\"\ntry:\n    age = int(text)\nexcept ValueError:\n    age = 0\n    print(\"Not a number\")",
      tests: [
        ["age is 0", "age == 0"],
        ["Prints the message", "_cq_stdout.strip() == \"Not a number\""],
      ],
    }),
    task("medium", "What went wrong?", {
      prompt: "Define `check(text)` that returns `OK` if `int(text)` works, or `Error: ` followed by the exception's message if it doesn't.",
      hint: "`except ValueError as e:` gives you the exception; `return f\"Error: {e}\"`.",
      solution: "def check(text):\n    try:\n        int(text)\n        return \"OK\"\n    except ValueError as e:\n        return f\"Error: {e}\"",
      tests: [
        ["check(\"12\")", "check(\"12\") == \"OK\""],
        ["check(\"abc\")", "check(\"abc\") == \"Error: invalid literal for int() with base 10: 'abc'\""],
      ],
    }),
    task("medium", "Ask until it's a number", {
      prompt: "Keep asking `Age: ` until the answer is a whole number, printing `Please type a number` after each bad answer. Store the result in `age`. The check types `abc`, an empty line and `42`.",
      hint: "`while True:` with a `try` around `age = int(input(\"Age: \"))` and `break`; the `except ValueError:` prints the message.",
      solution: "while True:\n    try:\n        age = int(input(\"Age: \"))\n        break\n    except ValueError:\n        print(\"Please type a number\")",
      setup: typedInput("abc", "", "42"),
      tests: [
        ["age is 42", "age == 42"],
        ["Complains twice", "_cq_stdout.count(\"Please type a number\") == 2"],
      ],
    }),
    task("medium", "Add up the good ones", {
      prompt: "Set `total` to the sum of the values that are whole numbers, and `bad` to how many aren't.",
      starter: "values = [\"4\", \"x\", \"10\", \"\", \"3\"]\n",
      hint: "Loop over the values with a `try` inside: add `int(v)` to `total`, and in `except ValueError:` add 1 to `bad`.",
      solution: "values = [\"4\", \"x\", \"10\", \"\", \"3\"]\ntotal = 0\nbad = 0\nfor v in values:\n    try:\n        total += int(v)\n    except ValueError:\n        bad += 1",
      tests: [
        ["total is 17", "total == 17"],
        ["bad is 2", "bad == 2"],
      ],
    }),
    task("hard", "A missing price", {
      prompt: "Define `price_of(prices, item)` that returns the item's price, or `None` if it isn't in `prices`, by catching the `KeyError`.",
      hint: "`try: return prices[item]` and `except KeyError: return None`.",
      solution: "def price_of(prices, item):\n    try:\n        return prices[item]\n    except KeyError:\n        return None",
      tests: [
        ["A known item", "price_of({\"tea\": 2.5}, \"tea\") == 2.5"],
        ["A missing item", "price_of({\"tea\": 2.5}, \"jam\") is None"],
      ],
    }),
    task("hard", "Read the scores", {
      prompt: "Define `parse_scores(text)` for text like `Ana:91,Ben:x,Cleo:85`: return a dict of the names whose score is a whole number, skipping the rest.",
      hint: "Split on commas, then each part on `:`. Put `scores[name] = int(score)` in a `try` and `continue` (or `pass`) on `ValueError`.",
      solution: "def parse_scores(text):\n    scores = {}\n    for part in text.split(\",\"):\n        name, score = part.split(\":\")\n        try:\n            scores[name] = int(score)\n        except ValueError:\n            pass\n    return scores",
      tests: [
        ["Skips Ben", "parse_scores(\"Ana:91,Ben:x,Cleo:85\") == {\"Ana\": 91, \"Cleo\": 85}"],
        ["All good", "parse_scores(\"Dev:70\") == {\"Dev\": 70}"],
      ],
    }),
    task("expert", "A safe position", {
      prompt: "Define `item_at(items, i)` that returns `items[i]`, or the text `No item at position N` (with the real `i`) when the index is out of range.",
      hint: "Catch `IndexError` and return an f-string.",
      solution: "def item_at(items, i):\n    try:\n        return items[i]\n    except IndexError:\n        return f\"No item at position {i}\"",
      tests: [
        ["item_at([\"a\", \"b\"], 1)", "item_at([\"a\", \"b\"], 1) == \"b\""],
        ["item_at([\"a\", \"b\"], 5)", "item_at([\"a\", \"b\"], 5) == \"No item at position 5\""],
        ["Negative indexes still work", "item_at([\"a\", \"b\"], -1) == \"b\""],
      ],
    }),
    task("expert", "An average from input", {
      prompt: "Read numbers with `Number: ` until an empty line. Skip anything that isn't a number, printing `Skipping <text>`, then print `Average: <value>`. The check types `5`, `ten`, `10` and an empty line, so it expects `Skipping ten` and `Average: 7.5`.",
      hint: "Loop: read `text`; `if text == \"\": break`. Then `try` to `float(text)` and append it; on `ValueError` print the skip message. Finally print the average.",
      solution: "numbers = []\nwhile True:\n    text = input(\"Number: \")\n    if text == \"\":\n        break\n    try:\n        numbers.append(float(text))\n    except ValueError:\n        print(f\"Skipping {text}\")\nprint(f\"Average: {sum(numbers) / len(numbers)}\")",
      setup: typedInput("5", "ten", "10", ""),
      tests: [
        ["Skips ten", "\"Skipping ten\" in _cq_stdout"],
        ["Prints the average", "_cq_stdout.strip().splitlines()[-1] == \"Average: 7.5\""],
      ],
    }),
  ],
  questions: [
    mc("What does Python do when an exception isn't caught?", ["Ignores it", "Stops the program and prints a traceback", "Asks the user what to do", "Restarts the program"], 1, "An uncaught exception stops the program, and the traceback shows where it happened."),
    mc("Which line of a traceback names the exception?", ["The first line", "The middle", "The last line", "None of them"], 2, "The last line gives the exception's type and message; the lines above it show how the program got there."),
    mc("When does the `except` block run?", ["When the code in `try` raises that exception", "Always", "Never", "Before the `try` block"], 0, "`except` runs only if the code in `try` raises a matching exception."),
    mc("Why avoid a bare `except:`?", ["It is slower", "It is a syntax error", "It only catches `ValueError`", "It also hides real bugs, like typos"], 3, "A bare `except:` catches everything, including mistakes you would want to see."),
    qShort("Which exception does `int(\"abc\")` raise? (class name)", "ValueError", "`ValueError` means the type was right (a string) but its value can't be converted."),
    mc("In `except ValueError as e:`, what is `e`?", ["The line number", "The exception object, whose text is the message", "A string with the code", "The value that was typed"], 1, "`as e` stores the exception object, and `str(e)` is its message."),
    mc("Which exception does `{\"a\": 1}[\"b\"]` raise?", ["`ValueError`", "`IndexError`", "`KeyError`", "`NameError`"], 2, "Square brackets on a dictionary raise `KeyError` for a key that isn't there."),
    mc("What happens to the rest of `try` after the line that raised?", ["It still runs", "It runs after `except`", "It runs twice", "It is skipped"], 3, "Python jumps to the matching `except` at once, so the rest of the `try` block doesn't run."),
    mc("Which pattern asks again until the input is valid?", ["`if` with `else`", "`while True:` with `try`, `break` when it works", "`for` over the input", "A bare `except:`"], 1, "The loop repeats, `try` catches bad input, and `break` leaves once a value converts."),
  ],
})
