// Fundamentals topic: Data types. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "data_types",
  title: "Data types",
  paragraphs: [
    "Every value in Python has a **type**, and the type decides what you can do with it. The basic types are `int` for whole numbers (42, -7), `float` for numbers with a decimal point (3.14), `str` for text in quotes, `bool` for `True` and `False`, and the special value `None`, which means \"no value\".",
    "```\nprint(type(42))      # <class 'int'>\nprint(type(3.14))    # <class 'float'>\nprint(type(\"hi\"))    # <class 'str'>\nprint(type(True))    # <class 'bool'>\nprint(type(None))    # <class 'NoneType'>\n```",
    "`type(value)` tells you a value's type. Quotes change everything: `42` is an int, but `\"42\"` is a str, text that happens to contain digits. And `3.0` is a float even though it's a whole number, because of the decimal point.",
    "The type decides what operators do. `+` adds numbers but joins text: `2 + 3` is `5`, while `\"2\" + \"3\"` is `\"23\"`. Mixing text and a number, as in `\"Age: \" + 30`, raises a `TypeError`, because Python won't guess whether you meant maths or text. (A later stage shows how to convert between types.)",
    "Ints and floats mix freely, and the result is a float: `2 + 0.5` is `2.5`. Dividing with `/` always gives a float, even `10 / 2`, which is `5.0`.",
    "`bool` values often come from comparisons: `5 > 3` is `True` and `2 == 3` is `False` (`==` asks \"is it equal?\"). The Decisions and loops quest uses them to make decisions. Note the capital letters: it's `True` and `False`, never `true`.",
    "`None` stands for \"nothing here (yet)\", such as a result you don't have. It isn't 0 and it isn't empty text; it's its own value with its own type.",
    "To check whether a value has a certain type, use `isinstance(value, int)`, which returns `True` or `False`. One surprise: `bool` is a kind of `int` in Python, so `isinstance(True, int)` is `True`, and `True + True` is `2`. That's handy for counting how many things are true.",
  ],
  sandboxCode: "print(type(42), type(3.14), type(\"42\"))\nprint(type(True), type(None))\nprint(2 + 3, \"2\" + \"3\")\nprint(10 / 2, 2 + 0.5)\nprint(5 > 3, isinstance(True, int))",
  sandboxSnippets: [
    snippet("type()", "print(type(7))\nprint(type(7.0))\nprint(type(\"7\"))"),
    snippet("+ for numbers and text", "print(4 + 5)\nprint(\"4\" + \"5\")"),
    snippet("Division gives a float", "print(10 / 2)\nprint(type(10 / 2))\nprint(2 + 0.5)"),
    snippet("bool and None", "print(5 > 3, 2 == 3)\nresult = None\nprint(result, type(result))"),
    snippet("A TypeError", "# Run this to see the error, then try print(\"Age:\", 30) instead.\nprint(\"Age: \" + 30)"),
  ],
  readMore: { label: "Python docs: built-in types", url: "https://docs.python.org/3/library/stdtypes.html", source: "Python docs" },
  challenges: [
    task("easy", "An int and a float", {
      prompt: "Create `count` holding the whole number `12` and `price` holding the decimal `4.5`.",
      hint: "Write whole numbers without a decimal point and decimals with one: `count = 12`, `price = 4.5`.",
      solution: "count = 12\nprice = 4.5",
      tests: [
        ["count is the int 12", "type(count) is int and count == 12"],
        ["price is the float 4.5", "type(price) is float and price == 4.5"],
      ],
    }),
    task("easy", "Text, not a number", {
      prompt: "A postcode can start with a zero, which a number would lose. Store the postcode `02134` as text in `zip_code`, then print it.",
      hint: "Put the digits in quotes so they stay text: `zip_code = \"02134\"`.",
      solution: "zip_code = \"02134\"\nprint(zip_code)",
      tests: [
        ["zip_code is the text 02134", "zip_code == \"02134\""],
        ["Prints 02134", "_cq_stdout.strip() == \"02134\""],
      ],
    }),
    task("easy", "True or False", {
      prompt: "Set `is_open` to `True` and `has_errors` to `False`.",
      hint: "Write them without quotes and with a capital first letter.",
      solution: "is_open = True\nhas_errors = False",
      tests: [
        ["is_open is True", "is_open is True"],
        ["has_errors is False", "has_errors is False"],
      ],
    }),
    task("medium", "Ask Python the type", {
      prompt: "Set `kind` to the type of `mystery` and print it.",
      starter: "mystery = 7 / 7\n",
      hint: "`kind = type(mystery)`. Remember what `/` always returns.",
      solution: "mystery = 7 / 7\nkind = type(mystery)\nprint(kind)",
      tests: [
        ["kind is float", "kind is float"],
        ["Prints <class 'float'>", "_cq_stdout.strip() == \"<class 'float'>\""],
      ],
    }),
    task("medium", "Add or join?", {
      prompt: "Set `added` to what you get from adding the numbers 4 and 5, and `joined` to what you get from joining the texts `\"4\"` and `\"5\"` with `+`.",
      hint: "`added = 4 + 5` and `joined = \"4\" + \"5\"`. Same operator, different types.",
      solution: "added = 4 + 5\njoined = \"4\" + \"5\"",
      tests: [
        ["added is 9", "added == 9"],
        ["joined is \"45\"", "joined == \"45\""],
      ],
    }),
    task("medium", "No value yet", {
      prompt: "The race hasn't finished, so there is no winner yet. Set `winner` to `None` and print its type.",
      hint: "`winner = None`, then `print(type(winner))`.",
      solution: "winner = None\nprint(type(winner))",
      tests: [
        ["winner is None", "winner is None"],
        ["Prints <class 'NoneType'>", "_cq_stdout.strip() == \"<class 'NoneType'>\""],
      ],
    }),
    task("hard", "Fix the TypeError", {
      prompt: "This line fails with a `TypeError`. Fix it so it prints `Items: 3`.",
      starter: "print(\"Items: \" + 3)",
      hint: "You can't `+` text and a number. Give `print` two values separated by a comma instead: `print(\"Items:\", 3)`.",
      solution: "print(\"Items:\", 3)",
      tests: [
        ["Prints Items: 3", "_cq_stdout.strip() == \"Items: 3\""],
      ],
    }),
    task("hard", "Check with isinstance", {
      prompt: "Set `is_int` to whether `value` is an int, and `is_float` to whether it is a float, using `isinstance`.",
      starter: "value = 3.0\n",
      hint: "`isinstance(value, int)` returns `True` or `False`. Store each result in its variable.",
      solution: "value = 3.0\nis_int = isinstance(value, int)\nis_float = isinstance(value, float)",
      tests: [
        ["is_int is False", "is_int is False"],
        ["is_float is True", "is_float is True"],
      ],
    }),
    task("expert", "Count what is true", {
      prompt: "Each of `a`, `b` and `c` is `True` or `False`. Set `true_count` to how many of them are `True` by adding them up, then print it.",
      starter: "a = 5 > 3\nb = 2 > 9\nc = 10 == 10\n",
      hint: "`True` counts as 1 and `False` as 0, so `a + b + c` counts the true ones.",
      solution: "a = 5 > 3\nb = 2 > 9\nc = 10 == 10\ntrue_count = a + b + c\nprint(true_count)",
      tests: [
        ["true_count is 2", "true_count == 2"],
        ["Prints 2", "_cq_stdout.strip() == \"2\""],
      ],
    }),
    task("expert", "Which results are floats?", {
      prompt: "Create `r1 = 6 / 3`, `r2 = 6 * 3` and `r3 = 6 + 0.5`. Then set `float_count` to how many of them are floats, using `isinstance` and `+`.",
      hint: "Add up three checks: `isinstance(r1, float) + isinstance(r2, float) + isinstance(r3, float)`.",
      solution: "r1 = 6 / 3\nr2 = 6 * 3\nr3 = 6 + 0.5\nfloat_count = isinstance(r1, float) + isinstance(r2, float) + isinstance(r3, float)",
      tests: [
        ["r1, r2 and r3 are right", "r1 == 2.0 and r2 == 18 and r3 == 6.5"],
        ["float_count is 2", "float_count == 2"],
      ],
    }),
  ],
  questions: [
    mc("What is `type(\"42\")`?", ["`int`","`str`","`float`","`bool`"], 1),
    mc("What type is `3.0`?", ["`float`","`int`","`str`","`None`"], 0),
    mc("What does `\"2\" + \"3\"` give?", ["`5`","`\"23\"`","`6`","An error"], 1),
    mc("What does `\"Age: \" + 30` give?", ["`Age: 30`","`Age: 30.0`","A `TypeError`","`Age: \"30\"`"], 2),
    mc("What does `10 / 2` give?", ["`5`","`\"5\"`","`2`","`5.0`"], 3),
    qShort("Which function tells you the type of a value? (name only)", "type"),
    mc("What does `None` mean?", ["Zero","Empty text","No value","`False`"], 2),
    mc("Which is a valid bool value?", ["`true`","`True`","`\"True\"`","`TRUE`"], 1),
    mc("`isinstance(True, int)` is…", ["`True`, because `bool` is a kind of `int`","`False`","An error","`None`"], 0),
    mc("What type is `2 + 0.5`?", ["`int`","`str`","`bool`","`float`"], 3),
  ],
})
