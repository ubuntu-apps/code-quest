// Data structures topic: Looping over collections. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "iterating_collections",
  title: "Looping over collections",
  paragraphs: [
    "A `for` loop works on every collection: a list or tuple gives its items in order, a set gives its items in no particular order, a string gives its characters, and a dictionary gives its **keys** (use `.values()` or `.items()` for the rest). Python has a few helpers that make these loops shorter and clearer.",
    "`enumerate(items)` gives each item together with its position, as pairs you can unpack. It counts from 0, or from any number you choose with `start`, which is handy for numbered lists:",
    "```\nshopping = [\"eggs\", \"milk\", \"bread\"]\nfor number, item in enumerate(shopping, start=1):\n    print(f\"{number}. {item}\")\n```",
    "`zip(a, b)` walks through two (or more) lists side by side, giving you one item from each at a time. It stops at the end of the shortest list. Combined with `dict()`, it turns a list of keys and a list of values into a dictionary.",
    "```\nnames = [\"Ana\", \"Ben\", \"Cleo\"]\nscores = [91, 78, 85]\nfor name, score in zip(names, scores):\n    print(name, score)\nprint(dict(zip(names, scores)))   # {'Ana': 91, 'Ben': 78, 'Cleo': 85}\n```",
    "`sorted()` accepts any collection and always returns a new list. Its `key` option sorts by something other than the items themselves: give it a function, and the items are sorted by what that function returns. `key=len` sorts words by length, and `key=str.lower` sorts text ignoring capitals. Note there are no brackets after the function name: you pass the function itself, and `sorted` calls it for every item.",
    "A neat trick for dictionaries: `sorted(prices, key=prices.get)` sorts the **keys** by their values, because `prices.get(key)` looks up each key's value. `min` and `max` take a `key` too, so `min(prices, key=prices.get)` is the cheapest item.",
    "```\nprices = {\"tea\": 2.5, \"cake\": 3.75, \"water\": 1.0}\nprint(sorted(prices, key=prices.get))      # ['water', 'tea', 'cake']\nprint(max(prices, key=prices.get))         # cake\nprint(sorted([\"kiwi\", \"fig\", \"banana\"], key=len))\n```",
    "`reversed(items)` loops backwards without making a reversed copy. And `sum()`, `min()` and `max()` work on any collection of numbers, including `d.values()`.",
    "One warning: **don't add or remove items in the list you're looping over.** The loop keeps its own position, so removing an item makes it skip the next one. Loop over a copy (`for x in items[:]`) or build a new list instead. A dictionary that changes size during a loop raises a `RuntimeError`.",
  ],
  sandboxCode: "shopping = [\"eggs\", \"milk\", \"bread\"]\nfor number, item in enumerate(shopping, start=1):\n    print(f\"{number}. {item}\")\n\nnames = [\"Ana\", \"Ben\", \"Cleo\"]\nscores = [91, 78, 85]\nfor name, score in zip(names, scores):\n    print(name, score)\n\nprices = {\"tea\": 2.5, \"cake\": 3.75, \"water\": 1.0}\nprint(sorted(prices, key=prices.get), min(prices, key=prices.get))",
  sandboxSnippets: [
    snippet("enumerate", "for i, letter in enumerate(\"abc\", start=1):\n    print(i, letter)"),
    snippet("zip", "days = [\"Mon\", \"Tue\", \"Wed\"]\ntemps = [18, 21, 17]\nfor day, temp in zip(days, temps):\n    print(day, temp)"),
    snippet("Sort with a key", "words = [\"banana\", \"Fig\", \"apple\"]\nprint(sorted(words))\nprint(sorted(words, key=str.lower))\nprint(sorted(words, key=len))"),
    snippet("Sort a dict by value", "scores = {\"Ana\": 91, \"Ben\": 78, \"Cleo\": 85}\nprint(sorted(scores, key=scores.get, reverse=True))\nprint(max(scores, key=scores.get))"),
    snippet("Removing while looping", "nums = [1, -2, -3, 4]\nfor n in nums:\n    if n < 0:\n        nums.remove(n)\nprint(nums)"),
  ],
  readMore: { label: "Python tutorial: looping techniques", url: "https://docs.python.org/3/tutorial/datastructures.html#looping-techniques", source: "Python docs" },
  challenges: [
    task("easy", "A numbered list", {
      prompt: "Print the shopping list numbered from 1: `1. eggs`, `2. milk`, `3. bread`.",
      starter: "shopping = [\"eggs\", \"milk\", \"bread\"]\n",
      hint: "`for number, item in enumerate(shopping, start=1):` and an f-string.",
      solution: "shopping = [\"eggs\", \"milk\", \"bread\"]\nfor number, item in enumerate(shopping, start=1):\n    print(f\"{number}. {item}\")",
      tests: [
        ["Prints the numbered list", "_cq_stdout.strip().splitlines() == [\"1. eggs\", \"2. milk\", \"3. bread\"]"],
      ],
    }),
    task("easy", "Count the stock", {
      prompt: "Set `total` to the number of items in stock: the sum of all the values in `stock`.",
      starter: "stock = {\"apple\": 12, \"pear\": 4, \"plum\": 9}\n",
      hint: "`stock.values()` gives the numbers; `sum()` adds them.",
      solution: "stock = {\"apple\": 12, \"pear\": 4, \"plum\": 9}\ntotal = sum(stock.values())",
      tests: [
        ["total is 25", "total == 25"],
      ],
    }),
    task("easy", "In reverse", {
      prompt: "Print the steps from last to first, using `reversed`.",
      starter: "steps = [\"mix\", \"bake\", \"cool\", \"eat\"]\n",
      hint: "`for step in reversed(steps):`.",
      solution: "steps = [\"mix\", \"bake\", \"cool\", \"eat\"]\nfor step in reversed(steps):\n    print(step)",
      tests: [
        ["Prints the steps backwards", "_cq_stdout.strip().splitlines() == [\"eat\", \"cool\", \"bake\", \"mix\"]"],
      ],
    }),
    task("medium", "Side by side", {
      prompt: "Print each name with its score, like `Ana: 91`, using `zip`.",
      starter: "names = [\"Ana\", \"Ben\", \"Cleo\"]\nscores = [91, 78, 85]\n",
      hint: "`for name, score in zip(names, scores):`.",
      solution: "names = [\"Ana\", \"Ben\", \"Cleo\"]\nscores = [91, 78, 85]\nfor name, score in zip(names, scores):\n    print(f\"{name}: {score}\")",
      tests: [
        ["Prints the pairs", "_cq_stdout.strip().splitlines() == [\"Ana: 91\", \"Ben: 78\", \"Cleo: 85\"]"],
      ],
    }),
    task("medium", "A phone book", {
      prompt: "Set `phone_book` to a dict that maps each name to its number, using `zip`.",
      starter: "names = [\"Ana\", \"Ben\"]\nnumbers = [\"555-0101\", \"555-0199\"]\n",
      hint: "`dict(zip(names, numbers))`.",
      solution: "names = [\"Ana\", \"Ben\"]\nnumbers = [\"555-0101\", \"555-0199\"]\nphone_book = dict(zip(names, numbers))",
      tests: [
        ["phone_book is right", "phone_book == {\"Ana\": \"555-0101\", \"Ben\": \"555-0199\"}"],
      ],
    }),
    task("medium", "Shortest first", {
      prompt: "Set `by_length` to the words sorted from shortest to longest.",
      starter: "words = [\"banana\", \"fig\", \"cherry\", \"kiwi\"]\n",
      hint: "Sort with `key=len`. Words of the same length keep their order.",
      solution: "words = [\"banana\", \"fig\", \"cherry\", \"kiwi\"]\nby_length = sorted(words, key=len)",
      tests: [
        ["by_length is right", "by_length == [\"fig\", \"kiwi\", \"banana\", \"cherry\"]"],
      ],
    }),
    task("hard", "The cheapest", {
      prompt: "Set `cheapest` to the name of the cheapest item in `prices`.",
      starter: "prices = {\"tea\": 2.5, \"cake\": 3.75, \"water\": 1.0, \"juice\": 2.2}\n",
      hint: "`min` with a key: `min(prices, key=prices.get)`.",
      solution: "prices = {\"tea\": 2.5, \"cake\": 3.75, \"water\": 1.0, \"juice\": 2.2}\ncheapest = min(prices, key=prices.get)",
      tests: [
        ["cheapest is water", "cheapest == \"water\""],
      ],
    }),
    task("hard", "Leaderboard", {
      prompt: "Set `ranking` to the names in `scores`, from the highest score to the lowest.",
      starter: "scores = {\"Ana\": 91, \"Ben\": 78, \"Cleo\": 85, \"Dev\": 96}\n",
      hint: "Sort the keys by their values, highest first: `sorted(scores, key=scores.get, reverse=True)`.",
      solution: "scores = {\"Ana\": 91, \"Ben\": 78, \"Cleo\": 85, \"Dev\": 96}\nranking = sorted(scores, key=scores.get, reverse=True)",
      tests: [
        ["ranking is right", "ranking == [\"Dev\", \"Ana\", \"Cleo\", \"Ben\"]"],
      ],
    }),
    task("expert", "Fix the skipped item", {
      prompt: "This should remove every negative number from `nums`, but one survives, because the list changes while it is being looped over. Fix it so `nums` ends up as `[3, 4]`.",
      starter: "nums = [3, -1, -2, 4, -5]\nfor n in nums:\n    if n < 0:\n        nums.remove(n)\n",
      hint: "Loop over a copy, so removing from `nums` doesn't disturb the loop: `for n in nums[:]:`.",
      solution: "nums = [3, -1, -2, 4, -5]\nfor n in nums[:]:\n    if n < 0:\n        nums.remove(n)",
      tests: [
        ["nums is [3, 4]", "nums == [3, 4]"],
      ],
    }),
    task("expert", "Day-to-day changes", {
      prompt: "Build `changes`: how much the temperature went up or down from each day to the next. Pair each day with the next one using `zip(temps, temps[1:])`.",
      starter: "temps = [12, 15, 11, 18, 18]\n",
      hint: "`zip(temps, temps[1:])` gives `(12, 15)`, `(15, 11)` and so on. Append `today - yesterday` for each pair.",
      solution: "temps = [12, 15, 11, 18, 18]\nchanges = []\nfor yesterday, today in zip(temps, temps[1:]):\n    changes.append(today - yesterday)",
      tests: [
        ["changes is right", "changes == [3, -4, 7, 0]"],
      ],
    }),
  ],
  questions: [
    mc("What does a `for` loop over a dictionary give you?", ["Its values", "Its keys", "Its `(key, value)` pairs", "Its length"], 1),
    mc("What does `enumerate([\"a\", \"b\"], start=1)` give a loop?", ["`(1, \"a\")` and `(2, \"b\")`", "`(0, \"a\")` and `(1, \"b\")`", "`\"a\"` and `\"b\"`", "`1` and `2`"], 0),
    mc("Where does `zip` stop when the lists have different lengths?", ["At the end of the longest", "It raises an error", "It fills in `None`", "At the end of the shortest"], 3),
    mc("What is `sorted([\"kiwi\", \"fig\", \"banana\"], key=len)`?", ["`[\"banana\", \"kiwi\", \"fig\"]`", "`[\"banana\", \"fig\", \"kiwi\"]`", "`[\"fig\", \"kiwi\", \"banana\"]`", "`[3, 4, 6]`"], 2),
    qShort("What does `dict(zip([\"a\", \"b\"], [1, 2]))[\"b\"]` give? (a number)", "2"),
    mc("What does `max(prices, key=prices.get)` return?", ["The highest price", "The key with the highest value", "The last key", "A sorted list"], 1),
    mc("Why is it `key=len` and not `key=len()`?", ["`sorted` needs the function itself, to call on every item", "Brackets are optional", "`len()` would sort backwards", "It is a syntax error either way"], 0),
    mc("What goes wrong when you remove items from a list while looping over it?", ["Nothing", "A `KeyError`", "The loop runs forever", "The loop can skip items"], 3),
    mc("What does `sorted()` return for a set?", ["A set", "A new sorted list", "A tuple", "`None`"], 1),
    mc("Which loops over a list backwards without making a reversed copy?", ["`for x in items[::-1]:`", "`for x in sorted(items):`", "`for x in reversed(items):`", "`for x in items.reverse():`"], 2),
  ],
})
