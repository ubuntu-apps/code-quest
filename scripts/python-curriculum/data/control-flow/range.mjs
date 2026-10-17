// Decisions and loops topic: range(). Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "range_function",
  title: "range()",
  paragraphs: [
    "`range()` produces a sequence of whole numbers for a `for` loop to go through. It's how you repeat something a set number of times, or count through numbers.",
    "`range(stop)` counts from 0 up to, but **not including**, `stop`: `range(5)` gives 0, 1, 2, 3 and 4, which is five numbers. `range(start, stop)` starts somewhere else: `range(1, 6)` gives 1 to 5.",
    "```\nfor i in range(1, 6):\n    print(i, \"squared is\", i ** 2)\n```",
    "A third value sets the **step**: `range(0, 20, 5)` gives 0, 5, 10 and 15. A negative step counts down: `range(5, 0, -1)` gives 5, 4, 3, 2 and 1 (again stopping before the stop value).",
    "To see what a range contains, turn it into a list: `list(range(0, 10, 3))` is `[0, 3, 6, 9]`. `len(range(10))` is 10, and `sum(range(1, 5))` adds 1 + 2 + 3 + 4. An empty range, such as `range(1, 1)`, makes a loop run zero times.",
    "When you just need to repeat something and don't use the number, call the loop variable `_`: `for _ in range(3): print(\"Hip hip hooray!\")`.",
    "`range()` pairs well with `len()` to visit positions in a string: `for i in range(len(word)):` gives every index, and `range(0, len(word), 2)` every other one. Remember that the last index is `len(word) - 1`.",
    "```\nword = \"python\"\nfor i in range(len(word)):\n    print(i, word[i])\n```",
  ],
  sandboxCode: "for i in range(1, 6):\n    print(i, \"squared is\", i ** 2)\n\nprint(list(range(5)))\nprint(list(range(0, 20, 5)))\nprint(list(range(5, 0, -1)))",
  sandboxSnippets: [
    snippet("range(stop)", "for i in range(4):\n    print(i)"),
    snippet("Start and stop", "for year in range(2020, 2026):\n    print(year)"),
    snippet("Step", "print(list(range(0, 50, 10)))\nprint(list(range(10, 0, -2)))"),
    snippet("Repeat", "for _ in range(3):\n    print(\"Hip hip hooray!\")"),
    snippet("Positions", "word = \"python\"\nfor i in range(len(word)):\n    print(i, word[i])"),
  ],
  readMore: { label: "Python tutorial: the range() function", url: "https://docs.python.org/3/tutorial/controlflow.html#the-range-function", source: "Python docs" },
  challenges: [
    task("easy", "Repeat five times", {
      prompt: "Print `Python!` five times, using `range`.",
      hint: "`for _ in range(5):` and `print(\"Python!\")` inside.",
      solution: "for _ in range(5):\n    print(\"Python!\")",
      tests: [
        ["Prints Python! five times", "_cq_stdout.split() == [\"Python!\"] * 5"],
      ],
    }),
    task("easy", "One to ten", {
      prompt: "Print the numbers 1 to 10, each on its own line.",
      hint: "`range(1, 11)`: the stop value isn't included, so use 11.",
      solution: "for n in range(1, 11):\n    print(n)",
      tests: [
        ["Prints 1 to 10", "_cq_stdout.split() == [str(n) for n in range(1, 11)]"],
      ],
    }),
    task("easy", "Even numbers", {
      prompt: "Print the even numbers from 2 to 20, using the step of `range`.",
      hint: "Start at 2 and step by 2: `range(2, 21, 2)`.",
      solution: "for n in range(2, 21, 2):\n    print(n)",
      tests: [
        ["Prints 2 to 20 in twos", "_cq_stdout.split() == [str(n) for n in range(2, 21, 2)]"],
      ],
    }),
    task("medium", "Count down", {
      prompt: "Print 10 down to 1, then `Go!`, using a negative step.",
      hint: "`range(10, 0, -1)` stops before 0.",
      solution: "for n in range(10, 0, -1):\n    print(n)\nprint(\"Go!\")",
      tests: [
        ["Prints the countdown", "_cq_stdout.split() == [str(n) for n in range(10, 0, -1)] + [\"Go!\"]"],
      ],
    }),
    task("medium", "Times table", {
      prompt: "Print the times table for `n`, from `7 x 1 = 7` to `7 x 10 = 70`.",
      starter: "n = 7\n",
      hint: "Loop `i` over `range(1, 11)` and print `f\"{n} x {i} = {n * i}\"`.",
      solution: "n = 7\nfor i in range(1, 11):\n    print(f\"{n} x {i} = {n * i}\")",
      tests: [
        ["Prints ten lines", "_cq_stdout.strip().splitlines() == [f\"7 x {i} = {7 * i}\" for i in range(1, 11)]"],
      ],
    }),
    task("medium", "Add the odd numbers", {
      prompt: "Set `total` to the sum of the odd numbers from 1 to 99.",
      starter: "total = 0\n",
      hint: "Step through the odd numbers with `range(1, 100, 2)` and add each one.",
      solution: "total = 0\nfor n in range(1, 100, 2):\n    total += n",
      tests: [
        ["total is 2500", "total == 2500"],
      ],
    }),
    task("hard", "Factorial", {
      prompt: "Set `factorial` to n! = 1 × 2 × … × n.",
      starter: "n = 6\nfactorial = 1\n",
      hint: "Multiply as you go: `for i in range(1, n + 1): factorial *= i`.",
      solution: "n = 6\nfactorial = 1\nfor i in range(1, n + 1):\n    factorial *= i",
      tests: [
        ["factorial is 720", "factorial == 720"],
      ],
    }),
    task("hard", "Squares on one line", {
      prompt: "Print the squares of 1 to 5 on one line, separated by spaces: `1 4 9 16 25`.",
      hint: "Use `print(i ** 2, end=\" \")` in the loop; the check ignores the space at the end.",
      solution: "for i in range(1, 6):\n    print(i ** 2, end=\" \")",
      tests: [
        ["Prints 1 4 9 16 25", "_cq_stdout.strip() == \"1 4 9 16 25\""],
      ],
    }),
    task("expert", "Multiples of 3 or 5", {
      prompt: "Set `total` to the sum of all the numbers below 1000 that are multiples of 3 or 5.",
      starter: "total = 0\n",
      hint: "Loop over `range(1000)` and add `n` when `n % 3 == 0 or n % 5 == 0`.",
      solution: "total = 0\nfor n in range(1000):\n    if n % 3 == 0 or n % 5 == 0:\n        total += n",
      tests: [
        ["total is 233168", "total == 233168"],
      ],
    }),
    task("expert", "Every other letter", {
      prompt: "Build `every_other`: the letters of `word` at positions 0, 2, 4 and so on, using `range` with a step.",
      starter: "word = \"programming\"\nevery_other = \"\"\n",
      hint: "Loop `i` over `range(0, len(word), 2)` and add `word[i]`.",
      solution: "word = \"programming\"\nevery_other = \"\"\nfor i in range(0, len(word), 2):\n    every_other = every_other + word[i]",
      tests: [
        ["every_other is pormig", "every_other == \"pormig\""],
      ],
    }),
  ],
  questions: [
    mc("Which numbers does `range(5)` give?", ["1 to 5", "0 to 4", "0 to 5", "5 only"], 1),
    mc("Which numbers does `range(2, 6)` give?", ["2, 3, 4 and 5", "2 to 6", "3 to 6", "2 and 6"], 0),
    mc("What does `list(range(0, 10, 3))` give?", ["`[0, 3, 6, 9, 12]`", "`[3, 6, 9]`", "`[0, 3, 6, 9]`", "`[0, 10, 3]`"], 2),
    mc("Which numbers does `range(5, 0, -1)` give?", ["5 to 0", "0 to 5", "4 to 0", "5, 4, 3, 2 and 1"], 3),
    qShort("What is `len(range(10))`? (a number)", "10"),
    mc("Is the stop value included in a range?", ["No", "Yes", "Only with a step", "Only when counting down"], 0),
    mc("How many times does `for i in range(1, 1):` run its block?", ["Once", "Never", "Forever", "Twice"], 1),
    mc("What does `_` mean in `for _ in range(3):`?", ["It is a syntax error", "It repeats the loop forever", "A name for a number we don't use", "It skips every other number"], 2),
    mc("What is `sum(range(1, 5))`?", ["`15`", "`5`", "`4`", "`10`"], 3),
    mc("What is the last index of a string with `len(word)` characters?", ["`len(word) - 1`", "`len(word)`", "`len(word) + 1`", "`0`"], 0),
  ],
})
