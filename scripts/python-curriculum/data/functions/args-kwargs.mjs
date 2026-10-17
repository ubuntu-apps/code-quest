// Functions topic: *args and **kwargs. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "args_kwargs",
  title: "*args and **kwargs",
  paragraphs: [
    "`print` happily takes one value, three or none. Your own functions can do the same. A parameter with one star, written `*args` by convention, collects any number of extra **positional** arguments into a tuple:",
    "```\ndef total(*numbers):\n    return sum(numbers)\n\nprint(total(), total(5), total(1, 2, 3))   # 0 5 6\n```",
    "A parameter with two stars, `**kwargs`, collects any extra **keyword** arguments into a dict, with the names as keys:",
    "```\ndef describe(**info):\n    for key, value in info.items():\n        print(f\"{key}: {value}\")\n\ndescribe(name=\"Ana\", age=30, city=\"Oslo\")\n```",
    "The names `args` and `kwargs` are only habits; the stars do the work. Pick clearer names when you can, like `*numbers` or `**options`. In a `def`, they go in this order: normal parameters, `*args`, keyword-only parameters, then `**kwargs`, as in `def tag(name, *children, sep=\" \", **attrs):`. Anything after `*args` can only be passed by name.",
    "The stars also work the other way round, in a **call**. `*` unpacks a list or tuple into separate positional arguments, and `**` unpacks a dict into keyword arguments:",
    "```\ndef area(width, height):\n    return width * height\n\nsize = [3, 4]\nprint(area(*size))                  # the same as area(3, 4)\n\ndims = {\"width\": 3, \"height\": 4}\nprint(area(**dims))                 # the same as area(width=3, height=4)\nprint(*[\"a\", \"b\", \"c\"], sep=\"-\")    # a-b-c\n```",
    "Use `*args` when \"any number of the same kind of thing\" is natural, like numbers to add up or names to greet. Use `**kwargs` for open-ended options. When a function takes a fixed set of arguments, plain parameters are clearer: the `def` line documents them, and a typo in a name is caught.",
  ],
  sandboxCode: "def total(*numbers):\n    return sum(numbers)\n\nprint(total(), total(5), total(1, 2, 3))\n\ndef describe(**info):\n    for key, value in info.items():\n        print(f\"{key}: {value}\")\n\ndescribe(name=\"Ana\", city=\"Oslo\")\nprint(*[\"a\", \"b\", \"c\"], sep=\"-\")",
  sandboxSnippets: [
    snippet("*args is a tuple", "def show(*args):\n    print(type(args), args)\n\nshow(1, \"two\", 3.0)\nshow()"),
    snippet("**kwargs is a dict", "def show(**kwargs):\n    print(type(kwargs), kwargs)\n\nshow(colour=\"red\", size=3)"),
    snippet("Normal parameters first", "def greet(greeting, *names):\n    for name in names:\n        print(f\"{greeting}, {name}!\")\n\ngreet(\"Hi\", \"Ana\", \"Ben\", \"Cleo\")"),
    snippet("Unpacking in a call", "def area(width, height):\n    return width * height\n\nprint(area(*[3, 4]), area(**{\"width\": 5, \"height\": 2}))"),
    snippet("print with *", "items = [\"tea\", \"cake\", \"jam\"]\nprint(items)\nprint(*items)\nprint(*items, sep=\", \")"),
  ],
  readMore: { label: "Python tutorial: arbitrary argument lists", url: "https://docs.python.org/3/tutorial/controlflow.html#arbitrary-argument-lists", source: "Python docs" },
  challenges: [
    task("easy", "Add them all", {
      prompt: "Define `total(*numbers)` that returns the sum of however many numbers it is given (0 for none).",
      hint: "`numbers` is a tuple, so `return sum(numbers)`.",
      solution: "def total(*numbers):\n    return sum(numbers)",
      tests: [
        ["total(1, 2, 3)", "total(1, 2, 3) == 6"],
        ["total(10)", "total(10) == 10"],
        ["total()", "total() == 0"],
      ],
    }),
    task("easy", "Unpack a list", {
      prompt: "Set `result` by calling `area` with the two numbers in `size`, using `*`.",
      starter: "def area(width, height):\n    return width * height\n\nsize = [3, 4]\n",
      hint: "`result = area(*size)`.",
      solution: "def area(width, height):\n    return width * height\n\nsize = [3, 4]\nresult = area(*size)",
      tests: [
        ["result is 12", "result == 12"],
      ],
    }),
    task("easy", "Print the items", {
      prompt: "Print the items of `items` on one line, separated by spaces (`tea cake jam`), with one `print` and `*`.",
      starter: "items = [\"tea\", \"cake\", \"jam\"]\n",
      hint: "`print(*items)`: each item becomes its own argument.",
      solution: "items = [\"tea\", \"cake\", \"jam\"]\nprint(*items)",
      tests: [
        ["Prints tea cake jam", "_cq_stdout.strip() == \"tea cake jam\""],
      ],
    }),
    task("medium", "Describe it", {
      prompt: "Define `describe(**info)` that returns the pairs as text, like `name=Ana, age=30`, in the order they were passed.",
      hint: "Build a list with `f\"{key}={value}\"` for each `key, value in info.items()`, then `\", \".join(...)` it.",
      solution: "def describe(**info):\n    return \", \".join(f\"{key}={value}\" for key, value in info.items())",
      tests: [
        ["Two pairs", "describe(name=\"Ana\", age=30) == \"name=Ana, age=30\""],
        ["One pair", "describe(city=\"Oslo\") == \"city=Oslo\""],
        ["No pairs", "describe() == \"\""],
      ],
    }),
    task("medium", "Average of any", {
      prompt: "Define `average(*numbers)` that returns the average of the numbers, or 0 when there are none.",
      hint: "`if not numbers: return 0`, then `sum(numbers) / len(numbers)`.",
      solution: "def average(*numbers):\n    if not numbers:\n        return 0\n    return sum(numbers) / len(numbers)",
      tests: [
        ["average(2, 4, 6)", "average(2, 4, 6) == 4"],
        ["average(5)", "average(5) == 5"],
        ["average()", "average() == 0"],
      ],
    }),
    task("medium", "Unpack a dict", {
      prompt: "Print `a-b!` by passing the settings in `options` to `print` with `**`.",
      starter: "options = {\"sep\": \"-\", \"end\": \"!\\n\"}\n",
      hint: "`print(\"a\", \"b\", **options)`: the dict becomes `sep=\"-\", end=\"!\\n\"`.",
      solution: "options = {\"sep\": \"-\", \"end\": \"!\\n\"}\nprint(\"a\", \"b\", **options)",
      tests: [
        ["Prints a-b!", "_cq_stdout == \"a-b!\\n\""],
      ],
    }),
    task("hard", "Greet them all", {
      prompt: "Define `greet(greeting, *names)` that returns a list of greetings, one per name, like `Hi, Ana!`.",
      hint: "The first argument goes to `greeting`, the rest are collected in `names`: `return [f\"{greeting}, {n}!\" for n in names]`.",
      solution: "def greet(greeting, *names):\n    return [f\"{greeting}, {n}!\" for n in names]",
      tests: [
        ["Three names", "greet(\"Hi\", \"Ana\", \"Ben\", \"Cleo\") == [\"Hi, Ana!\", \"Hi, Ben!\", \"Hi, Cleo!\"]"],
        ["No names", "greet(\"Hello\") == []"],
      ],
    }),
    task("hard", "An HTML tag", {
      prompt: "Define `tag(name, *children, **attrs)` that builds a tag: `tag(\"p\", \"Hi\", \" there\", id=\"intro\")` returns `<p id=\"intro\">Hi there</p>`.",
      hint: "Join the children with `\"\".join(children)`. Build the attributes as `f' {k}=\"{v}\"'` for each pair, joined together, and put them after the tag name.",
      solution: "def tag(name, *children, **attrs):\n    attributes = \"\".join(f' {k}=\"{v}\"' for k, v in attrs.items())\n    return f\"<{name}{attributes}>{''.join(children)}</{name}>\"",
      tests: [
        ["With an attribute", "tag(\"p\", \"Hi\", \" there\", id=\"intro\") == '<p id=\"intro\">Hi there</p>'"],
        ["No attributes", "tag(\"b\", \"bold\") == \"<b>bold</b>\""],
        ["Two attributes", "tag(\"a\", \"link\", href=\"/\", title=\"Home\") == '<a href=\"/\" title=\"Home\">link</a>'"],
      ],
    }),
    task("expert", "Merge them", {
      prompt: "Define `merge(*dicts)` that returns one new dict holding all their keys; when a key repeats, the later dict wins.",
      hint: "Start with `result = {}` and `result.update(d)` for each dict, in order.",
      solution: "def merge(*dicts):\n    result = {}\n    for d in dicts:\n        result.update(d)\n    return result",
      tests: [
        ["Three dicts", "merge({\"a\": 1}, {\"b\": 2}, {\"a\": 3}) == {\"a\": 3, \"b\": 2}"],
        ["No dicts", "merge() == {}"],
        ["Leaves the inputs alone", "(lambda d: (merge(d, {\"x\": 9}), d)[1])({\"x\": 1}) == {\"x\": 1}"],
      ],
    }),
    task("expert", "A table row", {
      prompt: "Define `row(*cells, sep=\" | \", width=6)` that returns the cells left-aligned in columns of `width` characters, joined by `sep`. `sep` and `width` are keyword-only because they come after `*cells`.",
      hint: "Format each cell with `f\"{str(c):<{width}}\"` and join them with `sep`.",
      solution: "def row(*cells, sep=\" | \", width=6):\n    return sep.join(f\"{str(c):<{width}}\" for c in cells)",
      tests: [
        ["Default settings", "row(\"Tea\", 2.5) == \"Tea    | 2.5   \""],
        ["Custom settings", "row(\"a\", \"b\", sep=\",\", width=2) == \"a ,b \""],
        ["One cell", "row(\"x\", width=3) == \"x  \""],
      ],
    }),
  ],
  questions: [
    mc("Inside `def f(*args):`, what type is `args`?", ["A list", "A dict", "A tuple", "A string"], 2),
    mc("Inside `def f(**kwargs):`, what type is `kwargs`?", ["A dict", "A tuple", "A list", "A set"], 0),
    mc("`def total(*nums): return sum(nums)`. What is `total()`?", ["An error", "`None`", "`[]`", "`0`"], 3),
    mc("Do the names have to be `args` and `kwargs`?", ["Yes, always", "No: the stars do the work, and other names are fine", "Only `args` does", "Only in classes"], 1),
    qShort("What does `print(*[1, 2, 3])` print?", "1 2 3"),
    mc("What does `area(**{\"width\": 3, \"height\": 4})` do?", ["Calls `area(width=3, height=4)`", "Passes one dict argument", "Raises a `SyntaxError`", "Calls `area(3)`"], 0),
    mc("In `def f(a, *rest, flag=False):`, how can `flag` be passed?", ["By position only", "Not at all", "Only by name, as `flag=True`", "Only as the first argument"], 2),
    mc("Which order is correct in a `def`?", ["`**kwargs, *args, a`", "`*args, a, **kwargs`", "`**kwargs, a, *args`", "`a, *args, b=1, **kwargs`"], 3),
    mc("When are plain parameters better than `**kwargs`?", ["Never", "When the function takes a fixed set of arguments", "When there are no arguments", "When the values are numbers"], 1),
    mc("`def greet(greeting, *names)`. In `greet(\"Hi\", \"Ana\", \"Ben\")`, what is `names`?", ["`(\"Ana\", \"Ben\")`", "`(\"Hi\", \"Ana\", \"Ben\")`", "`\"Ana\"`", "`[\"Ana\", \"Ben\"]`"], 0),
  ],
})
