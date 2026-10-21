// Functions topic: Returning values. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "return_values",
  title: "Returning values",
  paragraphs: [
    "So far your functions have printed things. Most useful functions instead **give back** a result, which the rest of the program can store, compare or pass on. `return` does that: it ends the function and hands a value back to the place that called it.",
    "```\ndef square(n):\n    return n * n\n\narea = square(4)          # area is 16\nprint(square(3) + 1)      # 10\n```",
    "A call to a function that returns something **is** that value, so you can use it anywhere you'd use the value itself: in a calculation, an `if`, an f-string, or as an argument to another call, such as `print(square(square(2)))`.",
    "`print` and `return` are easy to mix up. `print` shows something on the screen and gives nothing back; `return` gives a value back and shows nothing. A function that only prints can't be used in a calculation, because the call has no value to calculate with:",
    "```\ndef double_print(n):\n    print(n * 2)\n\ndef double(n):\n    return n * 2\n\nx = double_print(5)   # prints 10, but x is None\ny = double(5)         # prints nothing, but y is 10\nprint(x, y)           # None 10\n```",
    "That `None` is what every function returns when it reaches its end without a `return`, or with a bare `return` and no value. If a result you expected turns out to be `None`, look for a missing `return`.",
    "`return` ends the function **at once**, even in the middle of a loop, and the lines after it don't run. That makes early returns a neat way to handle cases one at a time: `if score >= 90: return \"A\"`, then the next check, with no `elif` needed. It also means a `return` indented one level too far, inside a loop, returns after the first round.",
    "A function can return several values at once by separating them with commas. They come back as a tuple, which you can unpack straight into names:",
    "```\ndef min_max(numbers):\n    return min(numbers), max(numbers)\n\nlow, high = min_max([3, 9, 1, 7])\nprint(low, high)   # 1 9\n```",
    "A good rule: let functions **return** their results and let the main program decide what to print. Functions that return are easier to test, combine and reuse, which is exactly how the challenges here check your work.",
  ],
  sandboxCode: "def square(n):\n    return n * n\n\ndef describe(n):\n    if n % 2 == 0:\n        return \"even\"\n    return \"odd\"\n\nprint(square(4), square(square(2)))\nprint(f\"7 is {describe(7)}\")\n\ndef min_max(numbers):\n    return min(numbers), max(numbers)\n\nlow, high = min_max([3, 9, 1, 7])\nprint(low, high)",
  sandboxSnippets: [
    snippet("Return a value", "def add(a, b):\n    return a + b\n\ntotal = add(2, 3)\nprint(total, add(total, 10))"),
    snippet("print vs return", "def show(n):\n    print(n * 2)\n\ndef give(n):\n    return n * 2\n\nprint(show(5))\nprint(give(5))"),
    snippet("Returning early", "def grade(score):\n    if score >= 90:\n        return \"A\"\n    if score >= 80:\n        return \"B\"\n    return \"C\"\n\nprint(grade(95), grade(85), grade(60))"),
    snippet("Several values", "def divide(a, b):\n    return a // b, a % b\n\nwhole, rest = divide(17, 5)\nprint(whole, rest)"),
    snippet("return ends a loop", "def first_even(numbers):\n    for n in numbers:\n        if n % 2 == 0:\n            return n\n    return None\n\nprint(first_even([3, 7, 8, 10]))\nprint(first_even([1, 3]))"),
  ],
  readMore: { label: "Python tutorial: defining functions", url: "https://docs.python.org/3/tutorial/controlflow.html#defining-functions", source: "Python docs" },
  challenges: [
    task("easy", "Square it", {
      prompt: "Define `square(n)` that returns `n` times `n`.",
      hint: "`return n * n`.",
      solution: "def square(n):\n    return n * n",
      tests: [
        ["square(3) is 9", "square(3) == 9"],
        ["square(-4) is 16", "square(-4) == 16"],
      ],
    }),
    task("easy", "Print or return?", {
      prompt: "`double(5)` should give back `10`, but it prints it instead and returns `None`. Fix it.",
      starter: "def double(n):\n    print(n * 2)\n",
      hint: "Replace `print(...)` with `return n * 2`.",
      solution: "def double(n):\n    return n * 2",
      tests: [
        ["double(5) is 10", "double(5) == 10"],
        ["double(0) is 0", "double(0) == 0"],
      ],
    }),
    task("easy", "Even?", {
      prompt: "Define `is_even(n)` that returns `True` if `n` is even and `False` otherwise.",
      hint: "A comparison is already `True` or `False`: `return n % 2 == 0`.",
      solution: "def is_even(n):\n    return n % 2 == 0",
      tests: [
        ["is_even(4) is True", "is_even(4) is True"],
        ["is_even(7) is False", "is_even(7) is False"],
      ],
    }),
    task("medium", "Use the result", {
      prompt: "Set `total` to the price with tax of a 10 item plus the price with tax of a 5 item, using the function.",
      starter: "def with_tax(price):\n    return price * 1.2\n\n",
      hint: "Each call is a value: `total = with_tax(10) + with_tax(5)`.",
      solution: "def with_tax(price):\n    return price * 1.2\n\ntotal = with_tax(10) + with_tax(5)",
      tests: [
        ["total is 18.0", "abs(total - 18.0) < 1e-9"],
      ],
    }),
    task("medium", "The biggest of three", {
      prompt: "Define `largest(a, b, c)` that returns the biggest of the three numbers, without `max()`.",
      hint: "Compare with `if`/`elif`, or keep a \"best so far\" and replace it when a bigger one comes along.",
      solution: "def largest(a, b, c):\n    best = a\n    if b > best:\n        best = b\n    if c > best:\n        best = c\n    return best",
      tests: [
        ["largest(3, 9, 4) is 9", "largest(3, 9, 4) == 9"],
        ["largest(8, 2, 5) is 8", "largest(8, 2, 5) == 8"],
        ["largest(1, 2, 7) is 7", "largest(1, 2, 7) == 7"],
      ],
    }),
    task("medium", "Letter grades", {
      prompt: "Define `grade(score)` that returns `A` for 90 or more, `B` for 80 or more, `C` for 70 or more, and `F` otherwise. Try early returns.",
      hint: "`if score >= 90: return \"A\"`, then the next check, and `return \"F\"` at the end.",
      solution: "def grade(score):\n    if score >= 90:\n        return \"A\"\n    if score >= 80:\n        return \"B\"\n    if score >= 70:\n        return \"C\"\n    return \"F\"",
      tests: [
        ["grade(95)", "grade(95) == \"A\""],
        ["grade(80)", "grade(80) == \"B\""],
        ["grade(72)", "grade(72) == \"C\""],
        ["grade(40)", "grade(40) == \"F\""],
      ],
    }),
    task("hard", "Smallest and largest", {
      prompt: "Define `min_max(numbers)` that returns the smallest and the largest number as a pair.",
      hint: "`return min(numbers), max(numbers)` returns a tuple.",
      solution: "def min_max(numbers):\n    return min(numbers), max(numbers)",
      tests: [
        ["min_max([3, 9, 1])", "min_max([3, 9, 1]) == (1, 9)"],
        ["min_max([5])", "min_max([5]) == (5, 5)"],
      ],
    }),
    task("hard", "Where is the first vowel?", {
      prompt: "Define `first_vowel(word)` that returns the index of the first vowel in `word`, or `-1` if it has none.",
      hint: "Loop with `enumerate(word)` and `return i` as soon as `ch in \"aeiou\"`. After the loop, `return -1`.",
      solution: "def first_vowel(word):\n    for i, ch in enumerate(word):\n        if ch in \"aeiou\":\n            return i\n    return -1",
      tests: [
        ["first_vowel(\"python\")", "first_vowel(\"python\") == 4"],
        ["first_vowel(\"apple\")", "first_vowel(\"apple\") == 0"],
        ["first_vowel(\"rhythm\")", "first_vowel(\"rhythm\") == -1"],
      ],
    }),
    task("expert", "Count the words", {
      prompt: "Define `count_words(text)` that returns a dict mapping each lowercase word to how often it appears.",
      hint: "Build a dict with `counts[w] = counts.get(w, 0) + 1` over `text.lower().split()`, then return it.",
      solution: "def count_words(text):\n    counts = {}\n    for w in text.lower().split():\n        counts[w] = counts.get(w, 0) + 1\n    return counts",
      tests: [
        ["Counts a sentence", "count_words(\"The cat and the hat\") == {\"the\": 2, \"cat\": 1, \"and\": 1, \"hat\": 1}"],
        ["An empty text", "count_words(\"\") == {}"],
      ],
    }),
    task("expert", "Returning too soon", {
      prompt: "`total([1, 2, 3])` should be 6, but it gives 1. Find the misplaced line and fix it.",
      starter: "def total(numbers):\n    result = 0\n    for n in numbers:\n        result += n\n        return result\n",
      hint: "The `return` is inside the loop, so it runs after the first number. Move it out of the loop (indent it one level less).",
      solution: "def total(numbers):\n    result = 0\n    for n in numbers:\n        result += n\n    return result",
      tests: [
        ["total([1, 2, 3]) is 6", "total([1, 2, 3]) == 6"],
        ["total([]) is 0", "total([]) == 0"],
      ],
    }),
  ],
  questions: [
    mc("What does `return` do?", ["Prints a value", "Ends the function and gives a value back to the caller", "Restarts the function", "Stores a value in a global variable"], 1),
    mc("What does a function return if it has no `return` statement?", ["`0`", "`\"\"`", "`None`", "An error"], 2),
    mc("`def f(): print(5)`. What is `x` after `x = f()`?", ["`None`", "`5`", "`\"5\"`", "An error"], 0),
    mc("What happens to the lines after a `return` that runs?", ["They run afterwards", "They run first", "They raise an error", "They are skipped"], 3),
    qShort("`def f(n): return n + 1`. What is `f(f(1))`? (a number)", "3"),
    mc("What does `return a, b` give back?", ["Only `a`", "A tuple `(a, b)`", "A list `[a, b]`", "An error"], 1),
    mc("Why can't you do `double_print(5) + 1` when the function only prints?", ["The call returns `None`, which can't be added to", "Printing is too slow", "Functions can't be added", "You can"], 0),
    mc("A `return` is indented inside a `for` loop by mistake. What happens?", ["The loop runs twice", "Nothing changes", "The function returns during the first round", "A `SyntaxError`"], 2),
    mc("Which style makes functions easiest to test and reuse?", ["Printing inside every function", "Using only global variables", "Never using parameters", "Returning results and letting the caller print"], 3),
    mc("`min_max(items)` returns the smallest and the largest item as a pair. After `low, high = min_max([4, 2])`, what is `high`?", ["`2`", "`4`", "`(2, 4)`", "`None`"], 1),
  ],
})
