// Decisions and loops topic: Loop patterns. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "loop_patterns",
  title: "Loop patterns",
  paragraphs: [
    "Most loops you'll ever write are variations on a handful of **patterns**. Learn to recognise them and many problems become \"oh, that's the counting pattern\". The examples here loop over numbers stored in a string, such as `\"4 8 15 16\"`: `split()` breaks it into pieces and `int()` turns each piece into a number.",
    "**Sum and count.** Start a total (or a counter) at 0 before the loop, and add to it inside. The average is then the total divided by the count.",
    "```\ndata = \"70 85 90 65\"\ntotal = 0\ncount = 0\nfor piece in data.split():\n    total += int(piece)\n    count += 1\nprint(total / count)   # 77.5\n```",
    "**Count matches.** The same, but add 1 only when an `if` says the item matches, such as how many numbers are 7, or how many words are longer than five letters.",
    "**Find the largest (or smallest).** Remember the best so far, starting with the first item, and replace it whenever you see a better one. Starting with 0 instead is a common bug: it gives the wrong answer when every number is negative.",
    "```\ndata = \"12 45 7 23 56 9\"\npieces = data.split()\nlargest = int(pieces[0])\nfor piece in pieces:\n    if int(piece) > largest:\n        largest = int(piece)\nprint(largest)   # 56\n```",
    "**Search.** Loop until you find what you want, then `break`; the loop's `else` handles \"not found\". **Build a result**: start with empty text and add to it. To know each item's position as well, `enumerate()` gives you pairs of index and item: `for i, piece in enumerate(data.split()):`.",
    "**Remember the previous item.** To spot runs and changes (the longest streak of sixes, or how often a value went up), keep the previous value or the current run length in a variable, and update it at the end of every round.",
    "**Two passes.** Some questions need the whole sequence first. \"How many scores are above average?\" needs the average, so one loop works out the average, and a second loop counts.",
  ],
  sandboxCode: "data = \"4 8 15 16 23 42\"\ntotal = 0\nlargest = None\nfor piece in data.split():\n    n = int(piece)\n    total += n\n    if largest is None or n > largest:\n        largest = n\nprint(\"Total:\", total, \"Largest:\", largest)\n\nfor i, piece in enumerate(data.split()):\n    print(i, piece)",
  sandboxSnippets: [
    snippet("Sum and average", "data = \"70 85 90 65\"\ntotal = 0\ncount = 0\nfor piece in data.split():\n    total += int(piece)\n    count += 1\nprint(total, count, total / count)"),
    snippet("Count matches", "data = \"3 7 2 9 7 7 1\"\nsevens = 0\nfor piece in data.split():\n    if piece == \"7\":\n        sevens += 1\nprint(sevens)"),
    snippet("Largest", "data = \"-5 -2 -9\"\npieces = data.split()\nlargest = int(pieces[0])\nfor piece in pieces:\n    if int(piece) > largest:\n        largest = int(piece)\nprint(largest)"),
    snippet("enumerate", "for i, letter in enumerate(\"abc\"):\n    print(i, letter)"),
    snippet("Streaks", "rolls = \"1 6 6 2 6 6 6 3\"\nrun = 0\nlongest = 0\nfor piece in rolls.split():\n    if piece == \"6\":\n        run += 1\n        if run > longest:\n            longest = run\n    else:\n        run = 0\nprint(longest)"),
  ],
  readMore: { label: "Python docs: enumerate()", url: "https://docs.python.org/3/library/functions.html#enumerate", source: "Python docs" },
  challenges: [
    task("easy", "Total", {
      prompt: "Set `total` to the sum of the numbers in `data`.",
      starter: "data = \"4 8 15 16 23 42\"\ntotal = 0\n",
      hint: "Loop over `data.split()` and add `int(piece)` each time.",
      solution: "data = \"4 8 15 16 23 42\"\ntotal = 0\nfor piece in data.split():\n    total += int(piece)",
      tests: [
        ["total is 108", "total == 108"],
      ],
    }),
    task("easy", "Count the sevens", {
      prompt: "Set `sevens` to how many of the numbers in `data` are 7.",
      starter: "data = \"3 7 2 9 7 7 1\"\nsevens = 0\n",
      hint: "Add 1 when `int(piece) == 7` (or when `piece == \"7\"`).",
      solution: "data = \"3 7 2 9 7 7 1\"\nsevens = 0\nfor piece in data.split():\n    if int(piece) == 7:\n        sevens += 1",
      tests: [
        ["sevens is 3", "sevens == 3"],
      ],
    }),
    task("easy", "The largest", {
      prompt: "Set `largest` to the largest number in `data`, without `max()`.",
      starter: "data = \"12 45 7 23 56 9\"\n",
      hint: "Start with the first number: `largest = int(data.split()[0])`, then replace it with any bigger one.",
      solution: "data = \"12 45 7 23 56 9\"\nlargest = int(data.split()[0])\nfor piece in data.split():\n    if int(piece) > largest:\n        largest = int(piece)",
      tests: [
        ["largest is 56", "largest == 56"],
      ],
    }),
    task("medium", "Average", {
      prompt: "Set `average` to the average of the numbers in `data`.",
      starter: "data = \"70 85 90 65\"\n",
      hint: "Count and add in one loop, then divide the total by the count after it.",
      solution: "data = \"70 85 90 65\"\ntotal = 0\ncount = 0\nfor piece in data.split():\n    total += int(piece)\n    count += 1\naverage = total / count",
      tests: [
        ["average is 77.5", "average == 77.5"],
      ],
    }),
    task("medium", "The smallest and where it is", {
      prompt: "Set `smallest` to the smallest number in `data`, and `position` to its index (counting from 0), using `enumerate`.",
      starter: "data = \"5 3 8 1 9\"\n",
      hint: "`for i, piece in enumerate(data.split()):`. When a number is smaller than `smallest`, store both the number and `i`.",
      solution: "data = \"5 3 8 1 9\"\nsmallest = int(data.split()[0])\nposition = 0\nfor i, piece in enumerate(data.split()):\n    if int(piece) < smallest:\n        smallest = int(piece)\n        position = i",
      tests: [
        ["smallest is 1", "smallest == 1"],
        ["position is 3", "position == 3"],
      ],
    }),
    task("medium", "Letters with dashes", {
      prompt: "Build `spaced`: the letters of `word` with a dash between them (`h-e-l-l-o`), without a dash at the end.",
      starter: "word = \"hello\"\nspaced = \"\"\n",
      hint: "Add a dash before every letter except the first: `if spaced: spaced += \"-\"`, then add the letter.",
      solution: "word = \"hello\"\nspaced = \"\"\nfor ch in word:\n    if spaced:\n        spaced += \"-\"\n    spaced += ch",
      tests: [
        ["spaced is h-e-l-l-o", "spaced == \"h-e-l-l-o\""],
      ],
    }),
    task("hard", "Longest streak", {
      prompt: "Set `longest` to the longest run of sixes in a row in `rolls`.",
      starter: "rolls = \"1 6 6 2 6 6 6 3\"\n",
      hint: "Keep the current run length: add 1 on a six, reset it to 0 otherwise, and remember the biggest run you've seen.",
      solution: "rolls = \"1 6 6 2 6 6 6 3\"\nrun = 0\nlongest = 0\nfor piece in rolls.split():\n    if piece == \"6\":\n        run += 1\n        if run > longest:\n            longest = run\n    else:\n        run = 0",
      tests: [
        ["longest is 3", "longest == 3"],
      ],
    }),
    task("hard", "Above average", {
      prompt: "Set `above` to how many numbers in `data` are above the average. You need two loops.",
      starter: "data = \"10 20 30 40 55\"\n",
      hint: "First loop: the average. Second loop: count the numbers greater than it.",
      solution: "data = \"10 20 30 40 55\"\ntotal = 0\ncount = 0\nfor piece in data.split():\n    total += int(piece)\n    count += 1\naverage = total / count\nabove = 0\nfor piece in data.split():\n    if int(piece) > average:\n        above += 1",
      tests: [
        ["above is 2", "above == 2"],
      ],
    }),
    task("expert", "Second largest", {
      prompt: "Set `second` to the second-largest different number in `data` (so a repeated maximum doesn't count twice).",
      starter: "data = \"4 9 2 9 7\"\n",
      hint: "Track `first` and `second`. A number bigger than `first` pushes `first` down to `second`; a number between them (and not equal to `first`) becomes `second`.",
      solution: "data = \"4 9 2 9 7\"\nfirst = None\nsecond = None\nfor piece in data.split():\n    n = int(piece)\n    if first is None or n > first:\n        second = first\n        first = n\n    elif n != first and (second is None or n > second):\n        second = n",
      tests: [
        ["second is 7", "second == 7"],
      ],
    }),
    task("expert", "Bank account", {
      prompt: "Apply each transaction in `transactions` to a `balance` that starts at 0. A withdrawal that would take the balance below 0 is declined (skipped and counted). Then print `Balance: 100, declined: 1`.",
      starter: "transactions = \"+100 -30 -20 +50 -200\"\n",
      hint: "`int(\"+100\")` and `int(\"-30\")` both work. For each amount: if `balance + amount < 0`, count it as declined and `continue`; otherwise add it.",
      solution: "transactions = \"+100 -30 -20 +50 -200\"\nbalance = 0\ndeclined = 0\nfor piece in transactions.split():\n    amount = int(piece)\n    if balance + amount < 0:\n        declined += 1\n        continue\n    balance += amount\nprint(f\"Balance: {balance}, declined: {declined}\")",
      tests: [
        ["balance is 100", "balance == 100"],
        ["declined is 1", "declined == 1"],
        ["Prints the summary", "_cq_stdout.strip() == \"Balance: 100, declined: 1\""],
      ],
    }),
  ],
  questions: [
    mc("Where does a running total start?", ["Inside the loop", "At 0, before the loop", "At the first number, inside the loop", "After the loop"], 1),
    mc("Why start the largest-so-far at the first item rather than at 0?", ["It is faster", "So it works when every number is negative", "Python requires it", "0 is not a number"], 1),
    mc("How do you get the average from a loop?", ["Count the items and divide the total by the count", "Use `range`", "Divide by 2", "Take the middle item"], 0),
    mc("What does `enumerate(\"ab\")` give a loop?", ["`\"a\"` and `\"b\"`", "`0` and `1`", "Pairs of index and item: `(0, \"a\")`, `(1, \"b\")`", "The length"], 2),
    mc("Why does \"how many scores are above average?\" need two loops?", ["It doesn't", "Loops can only count", "To be faster", "You need the average before you can compare"], 3),
    mc("Which pattern finds whether an item exists and stops early?", ["Search with `break`", "Sum", "Two passes", "Build a string"], 0),
    mc("How do you add a dash between letters, but not at the end?", ["Add a dash after every letter", "Add a dash before every letter except the first", "Use `range(0)`", "Add two dashes"], 1),
    mc("A loop keeps track of the current streak and the longest streak so far. What happens when the streak breaks?", ["The longest streak resets", "The loop stops", "The current run goes back to 0", "Nothing"], 2),
    mc("What does `\"4 8 15\".split()` give?", ["`4 8 15`", "`[4, 8, 15]`", "`\"4815\"`", "`['4', '8', '15']`"], 3),
  ],
})
