// Functions topic: Recursion. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "recursion",
  title: "Recursion",
  paragraphs: [
    "A function can call **itself**. That's called **recursion**, and it's a natural way to solve a problem that contains a smaller copy of itself. The classic example is the factorial: 5! = 5 × 4 × 3 × 2 × 1, which is just 5 × 4!.",
    "```\ndef factorial(n):\n    if n <= 1:                      # base case: the answer is known\n        return 1\n    return n * factorial(n - 1)     # recursive case: a smaller problem\n\nprint(factorial(5))   # 120\n```",
    "Every recursive function needs two parts. The **base case** answers the smallest version of the problem directly, without calling itself. The **recursive case** makes the problem a little smaller and calls the function on that. Each call must move closer to the base case, or the calls never stop.",
    "Follow `factorial(3)`: it needs `3 * factorial(2)`, which needs `2 * factorial(1)`. `factorial(1)` hits the base case and returns 1. Then the waiting calls finish in reverse order: `factorial(2)` returns 2, and `factorial(3)` returns 6. Python keeps every unfinished call on a **call stack** until the ones it's waiting for return.",
    "Forget the base case, or never reach it, and the calls pile up until Python stops with `RecursionError: maximum recursion depth exceeded`. The limit is about 1,000 calls deep, which is plenty for recursion that halves or trims its problem, but too few for counting down from a million.",
    "Recursion works on text and lists too: a string reversed is its last character plus the rest reversed, and a list's sum is its first item plus the sum of the rest. The base case is usually the empty string or the empty list.",
    "```\ndef reverse(text):\n    if text == \"\":\n        return \"\"\n    return reverse(text[1:]) + text[0]\n\nprint(reverse(\"python\"))   # nohtyp\n```",
    "Where recursion really shines is **nested** data: folders inside folders, lists inside lists, menus inside menus. A loop can't easily say \"and do the same for whatever is inside\", but a recursive call can:",
    "```\ndef total(items):\n    result = 0\n    for item in items:\n        if isinstance(item, list):\n            result += total(item)   # the same job, one level down\n        else:\n            result += item\n    return result\n\nprint(total([1, [2, 3], [4, [5, 6]]]))   # 21\n```",
    "For simple counting and repeating, a loop is usually clearer and faster. Reach for recursion when the problem is naturally made of smaller copies of itself.",
  ],
  sandboxCode: "def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\nprint([factorial(n) for n in range(1, 7)])\n\ndef total(items):\n    result = 0\n    for item in items:\n        if isinstance(item, list):\n            result += total(item)\n        else:\n            result += item\n    return result\n\nprint(total([1, [2, 3], [4, [5, 6]]]))",
  sandboxSnippets: [
    snippet("Countdown", "def countdown(n):\n    if n == 0:\n        print(\"Liftoff!\")\n        return\n    print(n)\n    countdown(n - 1)\n\ncountdown(3)"),
    snippet("Watch the calls", "def factorial(n):\n    print(\"  \" * (5 - n) + f\"factorial({n})\")\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\nprint(factorial(4))"),
    snippet("No base case", "def forever(n):\n    return forever(n + 1)\n\nforever(1)"),
    snippet("Recursion on text", "def reverse(text):\n    if text == \"\":\n        return \"\"\n    return reverse(text[1:]) + text[0]\n\nprint(reverse(\"stressed\"))"),
    snippet("Nested lists", "def count_items(items):\n    count = 0\n    for item in items:\n        if isinstance(item, list):\n            count += count_items(item)\n        else:\n            count += 1\n    return count\n\nprint(count_items([1, [2, 3], [[4], 5]]))"),
  ],
  readMore: { label: "Real Python: thinking recursively in Python", url: "https://realpython.com/python-thinking-recursively/", source: "Real Python" },
  challenges: [
    task("easy", "Factorial", {
      prompt: "Define `factorial(n)` recursively: 1 when `n` is 1 or less, otherwise `n * factorial(n - 1)`.",
      hint: "Base case first: `if n <= 1: return 1`. Then `return n * factorial(n - 1)`.",
      solution: "def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)",
      tests: [
        ["factorial(5) is 120", "factorial(5) == 120"],
        ["factorial(1) is 1", "factorial(1) == 1"],
        ["factorial(0) is 1", "factorial(0) == 1"],
      ],
    }),
    task("easy", "Countdown", {
      prompt: "Define `countdown(n)` that prints `n` down to 1 and then `Liftoff!`, by calling itself with `n - 1`.",
      hint: "When `n == 0`, print `Liftoff!` and return. Otherwise print `n` and call `countdown(n - 1)`.",
      solution: "def countdown(n):\n    if n == 0:\n        print(\"Liftoff!\")\n        return\n    print(n)\n    countdown(n - 1)",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\n",
      tests: [
        ["countdown(3)", "_out(countdown, 3) == \"3\\n2\\n1\\nLiftoff!\\n\""],
        ["countdown(0)", "_out(countdown, 0) == \"Liftoff!\\n\""],
      ],
    }),
    task("easy", "Add the base case", {
      prompt: "`sum_to(n)` should add 1 + 2 + … + n, but it never stops and raises `RecursionError`. Add the missing base case: `sum_to(0)` is 0.",
      starter: "def sum_to(n):\n    return n + sum_to(n - 1)\n",
      hint: "Before the `return`, add `if n == 0: return 0`.",
      solution: "def sum_to(n):\n    if n == 0:\n        return 0\n    return n + sum_to(n - 1)",
      tests: [
        ["sum_to(4) is 10", "sum_to(4) == 10"],
        ["sum_to(0) is 0", "sum_to(0) == 0"],
      ],
    }),
    task("medium", "Power", {
      prompt: "Define `power(base, exp)` recursively, without `**`: anything to the power 0 is 1, and `base ** exp` is `base * base ** (exp - 1)`.",
      hint: "`if exp == 0: return 1`, then `return base * power(base, exp - 1)`.",
      solution: "def power(base, exp):\n    if exp == 0:\n        return 1\n    return base * power(base, exp - 1)",
      tests: [
        ["power(2, 10)", "power(2, 10) == 1024"],
        ["power(5, 0)", "power(5, 0) == 1"],
        ["power(3, 3)", "power(3, 3) == 27"],
      ],
    }),
    task("medium", "Reverse", {
      prompt: "Define `reverse(text)` recursively: the reverse of `text` is the reverse of everything after the first character, plus the first character.",
      hint: "Base case: `if text == \"\": return \"\"`. Then `return reverse(text[1:]) + text[0]`.",
      solution: "def reverse(text):\n    if text == \"\":\n        return \"\"\n    return reverse(text[1:]) + text[0]",
      tests: [
        ["reverse(\"python\")", "reverse(\"python\") == \"nohtyp\""],
        ["reverse(\"\")", "reverse(\"\") == \"\""],
      ],
    }),
    task("medium", "Sum of digits", {
      prompt: "Define `digit_sum(n)` recursively: the last digit (`n % 10`) plus the digit sum of the rest (`n // 10`). A single digit is its own sum.",
      hint: "`if n < 10: return n`, then `return n % 10 + digit_sum(n // 10)`.",
      solution: "def digit_sum(n):\n    if n < 10:\n        return n\n    return n % 10 + digit_sum(n // 10)",
      tests: [
        ["digit_sum(1234) is 10", "digit_sum(1234) == 10"],
        ["digit_sum(7) is 7", "digit_sum(7) == 7"],
      ],
    }),
    task("hard", "Fibonacci", {
      prompt: "Define `fib(n)`: `fib(0)` is 0, `fib(1)` is 1, and every later one is the sum of the two before it.",
      hint: "Two base cases: `if n < 2: return n`. Then `return fib(n - 1) + fib(n - 2)`.",
      solution: "def fib(n):\n    if n < 2:\n        return n\n    return fib(n - 1) + fib(n - 2)",
      tests: [
        ["fib(10) is 55", "fib(10) == 55"],
        ["fib(1) is 1", "fib(1) == 1"],
        ["fib(0) is 0", "fib(0) == 0"],
      ],
    }),
    task("hard", "Palindrome", {
      prompt: "Define `is_palindrome(word)` recursively: a word of 0 or 1 letters is a palindrome; otherwise its first and last letters must match and the middle (`word[1:-1]`) must be a palindrome too.",
      hint: "`if len(word) <= 1: return True`. Then `return word[0] == word[-1] and is_palindrome(word[1:-1])`.",
      solution: "def is_palindrome(word):\n    if len(word) <= 1:\n        return True\n    return word[0] == word[-1] and is_palindrome(word[1:-1])",
      tests: [
        ["racecar", "is_palindrome(\"racecar\") is True"],
        ["python", "is_palindrome(\"python\") is False"],
        ["abba", "is_palindrome(\"abba\") is True"],
      ],
    }),
    task("expert", "Flatten", {
      prompt: "Define `flatten(items)` that turns a list nested to any depth into one flat list, in order.",
      hint: "Loop over the items: if an item `isinstance(item, list)`, `extend` the result with `flatten(item)`; otherwise `append` it.",
      solution: "def flatten(items):\n    result = []\n    for item in items:\n        if isinstance(item, list):\n            result.extend(flatten(item))\n        else:\n            result.append(item)\n    return result",
      tests: [
        ["Deeply nested", "flatten([1, [2, [3, [4]]], 5]) == [1, 2, 3, 4, 5]"],
        ["Already flat", "flatten([1, 2]) == [1, 2]"],
        ["Empty lists", "flatten([[], [[]]]) == []"],
      ],
    }),
    task("expert", "Count the files", {
      prompt: "A folder is a dict: each key is a name, and its value is either `None` (a file) or another dict (a folder). Define `count_files(folder)` that counts every file, however deep.",
      hint: "Loop over `folder.values()`: add 1 for `None`, and `count_files(value)` for a dict.",
      solution: "def count_files(folder):\n    count = 0\n    for value in folder.values():\n        if value is None:\n            count += 1\n        else:\n            count += count_files(value)\n    return count",
      tests: [
        ["A small tree", "count_files({\"docs\": {\"a.txt\": None, \"b.txt\": None}, \"img\": {\"c.png\": None}, \"readme.md\": None}) == 4"],
        ["Deep and empty folders", "count_files({\"a\": {\"b\": {\"c\": {}}}, \"x.py\": None}) == 1"],
        ["An empty folder", "count_files({}) == 0"],
      ],
    }),
  ],
  questions: [
    mc("What is recursion?", ["A loop that never ends", "A function that calls itself", "A function with no parameters", "Calling two functions at once"], 1),
    mc("What is the base case?", ["The case answered directly, without another recursive call", "The first line of the file", "The biggest input", "The recursive call"], 0),
    mc("What happens with no base case?", ["It returns `None`", "It runs once", "Python adds one for you", "The calls never stop, until a `RecursionError`"], 3),
    mc("In a recursive `factorial(n)`, what makes each call get closer to the base case?", ["The `print`", "The `if`", "Calling it with `n - 1`", "The return value"], 2),
    qShort("`def f(n): return 1 if n <= 1 else n * f(n - 1)`. What is `f(4)`? (a number)", "24"),
    mc("What does Python keep on the call stack?", ["Every unfinished call, waiting for the ones it called", "Only the first call", "The program's variables", "Nothing"], 0),
    mc("Which problem suits recursion best?", ["Printing 1 to 10", "Adding two numbers", "Totalling numbers in lists nested inside lists", "Reading one line of input"], 2),
    mc("About how deep can Python's recursion go by default?", ["10 calls", "Without limit", "100 calls", "About 1,000 calls"], 3),
    mc("What is a typical base case for a function working on text?", ["The longest string", "The empty string", "A string with spaces", "There isn't one"], 1),
    mc("`def r(s): return \"\" if s == \"\" else r(s[1:]) + s[0]`. What is `r(\"abc\")`?", ["`\"cba\"`", "`\"abc\"`", "`\"a\"`", "`\"\"`"], 0),
  ],
})
