// Errors and exceptions topic: Debugging. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "debugging",
  title: "Debugging",
  paragraphs: [
    "Every programmer writes bugs; the skill is finding them quickly. **Debugging** is detective work: notice that the result is wrong, find where it first goes wrong, understand why, and fix that cause rather than the symptom.",
    "**Start with the traceback**, when there is one. Read it bottom-up: the last line names the exception and the message, and just above it is the exact line that failed, with its line number. The lines higher up show the chain of calls that led there, which tells you how the program got into that state.",
    "**When there's no error but the answer is wrong**, make the program show you what it's doing. Print the values at key points, and use the `=` trick in f-strings to label them automatically: `print(f\"{total=} {i=}\")` prints `total=12 i=3`. Compare what you see with what you expected; the first place they differ is where the bug lives.",
    "```\ndef average(numbers):\n    total = 0\n    for n in numbers:\n        total += n\n        print(f\"{n=} {total=}\")    # temporary debug line\n    return total / len(numbers)\n\nprint(average([4, 8, 6]))\n```",
    "**Make it small.** Find the smallest input that still goes wrong, such as a list of two items instead of a thousand. Small cases are quick to trace by hand, and they often make the cause obvious. Then **check your assumptions**: is that value really an int, or the text `\"7\"`? `print(type(x), repr(x))` settles it.",
    "A few bugs turn up again and again, so they're worth checking first:",
    "```\nrange(1, n)          # stops at n - 1: off by one?\nif x > 18:           # should it be >= 18?\n\"3\" + \"4\"            # \"34\", not 7: text instead of numbers\ntotal = 0            # inside the loop: reset every round\nname.upper()         # result thrown away: name is unchanged\nitems = []           # a shared default list, or a copy that isn't one\n```",
    "**Explain it out loud**, line by line, to a friend or to a rubber duck on your desk. Saying what each line does forces you to notice where what you believe and what the code says part ways. It works surprisingly often.",
    "Finally, once it's fixed: remove the debug prints, and if you can, add a test (an `assert`) for the case that was broken, so the bug can never quietly come back.",
  ],
  sandboxCode: "def average(numbers):\n    total = 0\n    for n in numbers:\n        total += n\n        print(f\"{n=} {total=}\")\n    return total / len(numbers)\n\nprint(average([4, 8, 6]))\n\nx = \"7\"\nprint(type(x), repr(x))",
  sandboxSnippets: [
    snippet("The = trick", "price = 2.5\nqty = 3\nprint(f\"{price=} {qty=} {price * qty=}\")"),
    snippet("Check the type", "value = \"42\"\nprint(type(value), repr(value))\nprint(type(int(value)), repr(int(value)))"),
    snippet("Off by one", "n = 5\nprint(list(range(1, n)))\nprint(list(range(1, n + 1)))"),
    snippet("A thrown-away result", "name = \"ana\"\nname.upper()\nprint(name)\nname = name.upper()\nprint(name)"),
    snippet("Reading a traceback", "def inner(d):\n    return d[\"missing\"]\n\ndef outer():\n    return inner({})\n\nouter()"),
  ],
  readMore: { label: "Python tutorial: errors and exceptions", url: "https://docs.python.org/3/tutorial/errors.html", source: "Python docs" },
  challenges: [
    task("easy", "Off by one", {
      prompt: "`sum_to(n)` should add up 1 to `n`, but `sum_to(4)` gives 6 instead of 10. Fix it.",
      starter: "def sum_to(n):\n    total = 0\n    for i in range(1, n):\n        total += i\n    return total\n",
      hint: "`range(1, n)` stops before `n`. Use `range(1, n + 1)`.",
      solution: "def sum_to(n):\n    total = 0\n    for i in range(1, n + 1):\n        total += i\n    return total",
      tests: [
        ["sum_to(4) is 10", "sum_to(4) == 10"],
        ["sum_to(1) is 1", "sum_to(1) == 1"],
      ],
    }),
    task("easy", "Exactly 18", {
      prompt: "`is_adult(18)` should be `True`. Fix the comparison.",
      starter: "def is_adult(age):\n    return age > 18\n",
      hint: "Eighteen counts, so use `>=`.",
      solution: "def is_adult(age):\n    return age >= 18",
      tests: [
        ["is_adult(18)", "is_adult(18) is True"],
        ["is_adult(17)", "is_adult(17) is False"],
      ],
    }),
    task("easy", "Text, not numbers", {
      prompt: "`add(a, b)` gets numbers as text, and `add(\"3\", \"4\")` returns `34`. Fix it so it returns the number 7.",
      starter: "def add(a, b):\n    return a + b\n",
      hint: "Convert both before adding: `int(a) + int(b)`.",
      solution: "def add(a, b):\n    return int(a) + int(b)",
      tests: [
        ["add(\"3\", \"4\") is 7", "add(\"3\", \"4\") == 7"],
      ],
    }),
    task("medium", "Reset every round", {
      prompt: "`total_price(prices)` only returns the last price. Find the misplaced line.",
      starter: "def total_price(prices):\n    for p in prices:\n        total = 0\n        total += p\n    return total\n",
      hint: "`total = 0` runs on every round. Move it above the loop.",
      solution: "def total_price(prices):\n    total = 0\n    for p in prices:\n        total += p\n    return total",
      tests: [
        ["total_price([1, 2, 3])", "total_price([1, 2, 3]) == 6"],
        ["total_price([5])", "total_price([5]) == 5"],
      ],
    }),
    task("medium", "The wrong name", {
      prompt: "`count_words` crashes with a `TypeError`. Read the error, then look closely at the names.",
      starter: "def count_words(text):\n    counts = {}\n    for word in text.split():\n        count = counts.get(word, 0)\n        count[word] = count + 1\n    return counts\n",
      hint: "The line that stores the new count uses `count` (a number) instead of `counts` (the dict).",
      solution: "def count_words(text):\n    counts = {}\n    for word in text.split():\n        count = counts.get(word, 0)\n        counts[word] = count + 1\n    return counts",
      tests: [
        ["Counts the words", "count_words(\"a b a\") == {\"a\": 2, \"b\": 1}"],
      ],
    }),
    task("medium", "Rounded down", {
      prompt: "`average([1, 2])` should be 1.5, but it gives 1. Fix it.",
      starter: "def average(numbers):\n    return sum(numbers) // len(numbers)\n",
      hint: "`//` is floor division. Use `/`.",
      solution: "def average(numbers):\n    return sum(numbers) / len(numbers)",
      tests: [
        ["average([1, 2])", "average([1, 2]) == 1.5"],
        ["average([4, 8, 6])", "average([4, 8, 6]) == 6"],
      ],
    }),
    task("hard", "Shout it", {
      prompt: "`shout(words)` should return every word in capitals, but the words come back unchanged.",
      starter: "def shout(words):\n    result = []\n    for w in words:\n        w.upper()\n        result.append(w)\n    return result\n",
      hint: "Strings never change in place: `w.upper()` returns a new string, which is thrown away. Append `w.upper()` instead.",
      solution: "def shout(words):\n    result = []\n    for w in words:\n        result.append(w.upper())\n    return result",
      tests: [
        ["shout([\"hi\", \"you\"])", "shout([\"hi\", \"you\"]) == [\"HI\", \"YOU\"]"],
      ],
    }),
    task("hard", "Clashing loop names", {
      prompt: "`pairs(n)` should list every pair `(i, j)` with `i < j` below `n`, but the inner loop uses the same name as the outer one. Fix it.",
      starter: "def pairs(n):\n    result = []\n    for i in range(n):\n        for i in range(i + 1, n):\n            result.append((i, i))\n    return result\n",
      hint: "Call the inner loop variable `j`, and append `(i, j)`.",
      solution: "def pairs(n):\n    result = []\n    for i in range(n):\n        for j in range(i + 1, n):\n            result.append((i, j))\n    return result",
      tests: [
        ["pairs(3)", "pairs(3) == [(0, 1), (0, 2), (1, 2)]"],
        ["pairs(1)", "pairs(1) == []"],
      ],
    }),
    task("expert", "Three bugs", {
      prompt: "`report(scores)` should return the average score (rounded to 1 decimal) and the best name, such as `(84.5, \"Ana\")`. It has three bugs. Find and fix them all.",
      starter: "def report(scores):\n    total = 0\n    best = None\n    for name, score in scores.items():\n        total =+ score\n        if best is None or score < scores[best]:\n            best = name\n    return round(total / len(scores)), best\n",
      hint: "Look at `=+` (it should be `+=`), the comparison for the best score (`>`), and the rounding (`round(..., 1)`).",
      solution: "def report(scores):\n    total = 0\n    best = None\n    for name, score in scores.items():\n        total += score\n        if best is None or score > scores[best]:\n            best = name\n    return round(total / len(scores), 1), best",
      tests: [
        ["Two students", "report({\"Ana\": 91, \"Ben\": 78}) == (84.5, \"Ana\")"],
        ["Three students", "report({\"Ana\": 70, \"Ben\": 95, \"Cleo\": 80}) == (81.7, \"Ben\")"],
      ],
    }),
    task("expert", "A broken recursion", {
      prompt: "`count_down_list(n)` should return `[n, n-1, ..., 1]`, but it never stops. Fix the base case and the recursive call.",
      starter: "def count_down_list(n):\n    if n == 1:\n        return []\n    return [n] + count_down_list(n + 1)\n",
      hint: "The call must move towards the base case: `n - 1`. And the base case should be `n == 0` returning `[]` (so 1 is included).",
      solution: "def count_down_list(n):\n    if n == 0:\n        return []\n    return [n] + count_down_list(n - 1)",
      tests: [
        ["count_down_list(3)", "count_down_list(3) == [3, 2, 1]"],
        ["count_down_list(1)", "count_down_list(1) == [1]"],
        ["count_down_list(0)", "count_down_list(0) == []"],
      ],
    }),
  ],
  questions: [
    mc("Where do you start reading a traceback?", ["At the top", "At the bottom: the exception, its message and the failing line", "In the middle", "It doesn't matter"], 1),
    mc("What does `print(f\"{total=}\")` print when `total` is 12?", ["`12`", "`total`", "`total=12`", "`{total=}`"], 2),
    mc("Why shrink a failing case to the smallest input?", ["Small cases are quick to trace and often make the cause obvious", "Big inputs are not allowed", "It makes the bug go away", "Python runs faster"], 0),
    mc("`x` looks like 7 but `x + 1` fails. What do you check first?", ["The line number", "The internet", "The file name", "Its type, with `print(type(x), repr(x))`"], 3),
    qShort("`range(1, 5)` gives how many numbers? (a number)", "4"),
    mc("Why does `name.upper()` on its own line change nothing?", ["It is a syntax error", "Strings can't change: the new string is thrown away", "It changes the next line", "`upper` needs an argument"], 1),
    mc("`total = 0` is inside the loop. What happens?", ["The total is reset on every round", "Nothing changes", "It runs once", "It raises an error"], 0),
    mc("What is \"rubber duck debugging\"?", ["Testing with toys", "Deleting code until it works", "Explaining the code line by line, out loud", "A Python module"], 2),
    mc("What should you do after fixing a bug?", ["Leave the debug prints in", "Rewrite the whole program", "Nothing", "Remove the debug prints and add a test for that case"], 3),
    mc("What does `total =+ score` do?", ["Adds `score` to `total`", "Sets `total` to `+score`, throwing the old total away", "A syntax error", "Subtracts"], 1),
  ],
})
