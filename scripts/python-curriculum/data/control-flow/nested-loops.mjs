// Decisions and loops topic: Nested loops. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "nested_loops",
  title: "Nested loops",
  paragraphs: [
    "A loop can contain another loop. For every round of the **outer** loop, the **inner** loop runs all the way through. That's how you work with things that have rows and columns, such as grids, tables and patterns.",
    "```\nfor row in range(1, 4):\n    for col in range(1, 4):\n        print(row * col, end=\" \")\n    print()   # new line after each row\n```",
    "This prints a 3 by 3 times table. `end=\" \"` keeps a row's numbers on one line, and the empty `print()` after the inner loop starts the next row. Notice its indentation: it belongs to the outer loop, so it runs once per row.",
    "The inner loop's range can depend on the outer loop variable. That's how you draw triangles: row 1 has 1 star, row 2 has 2, and so on, using `range(row)` or simply `\"*\" * row`.",
    "The number of rounds multiplies: an outer loop of 4 and an inner loop of 5 run the inner body 4 × 5 = 20 times. With big ranges this adds up fast, so keep nested loops for when you really need every combination.",
    "Give the loop variables names that say what they count, like `row` and `col`, or `i` and `j` for plain numbers. Reusing the same name for both loops is a classic bug.",
    "`break` only leaves the loop it's in: inside the inner loop, it ends that loop, and the outer loop carries on with its next round. Combined with the loop `else`, this is a neat way to test every number in a range for being prime:",
    "```\nfor n in range(2, 20):\n    for d in range(2, n):\n        if n % d == 0:\n            break\n    else:\n        print(n, end=\" \")   # 2 3 5 7 11 13 17 19\n```",
  ],
  sandboxCode: "for row in range(1, 4):\n    for col in range(1, 4):\n        print(row * col, end=\" \")\n    print()\n\nfor row in range(1, 5):\n    print(\"*\" * row)",
  sandboxSnippets: [
    snippet("Grid", "for row in range(3):\n    for col in range(5):\n        print(\"#\", end=\"\")\n    print()"),
    snippet("All pairs", "for letter in \"ab\":\n    for number in range(1, 4):\n        print(letter + str(number), end=\" \")\n    print()"),
    snippet("Triangle", "for row in range(1, 6):\n    for _ in range(row):\n        print(\"*\", end=\"\")\n    print()"),
    snippet("Counting rounds", "count = 0\nfor i in range(4):\n    for j in range(5):\n        count += 1\nprint(count)"),
    snippet("break in the inner loop", "for n in range(2, 20):\n    for d in range(2, n):\n        if n % d == 0:\n            break\n    else:\n        print(n, end=\" \")"),
  ],
  readMore: { label: "Python tutorial: more control flow tools", url: "https://docs.python.org/3/tutorial/controlflow.html", source: "Python docs" },
  challenges: [
    task("easy", "A block of stars", {
      prompt: "Print 3 rows of 4 stars: `****` on each line. Use two loops.",
      hint: "Outer loop over rows; inner loop prints `\"*\"` with `end=\"\"`; then `print()` to end the row.",
      solution: "for row in range(3):\n    for col in range(4):\n        print(\"*\", end=\"\")\n    print()",
      tests: [
        ["Prints three rows of ****", "_cq_stdout.split() == [\"****\"] * 3"],
      ],
    }),
    task("easy", "Every pair", {
      prompt: "Print every pair of a digit from `12` and a letter from `ab`, one per line: `1-a`, `1-b`, `2-a`, `2-b`.",
      hint: "Outer `for digit in \"12\":`, inner `for letter in \"ab\":`, and print `f\"{digit}-{letter}\"`.",
      solution: "for digit in \"12\":\n    for letter in \"ab\":\n        print(f\"{digit}-{letter}\")",
      tests: [
        ["Prints the four pairs", "_cq_stdout.split() == [\"1-a\", \"1-b\", \"2-a\", \"2-b\"]"],
      ],
    }),
    task("easy", "Count the rounds", {
      prompt: "Set `count` to how many times the inner body runs when an outer loop over `range(4)` contains an inner loop over `range(5)`. Count it with the loops.",
      starter: "count = 0\n",
      hint: "Two loops, with `count += 1` in the inner one.",
      solution: "count = 0\nfor i in range(4):\n    for j in range(5):\n        count += 1",
      tests: [
        ["count is 20", "count == 20"],
      ],
    }),
    task("medium", "A triangle", {
      prompt: "Print a triangle of `rows` rows: 1 star, then 2, up to 4.",
      starter: "rows = 4\n",
      hint: "Loop `row` from 1 to `rows`; the inner loop runs `row` times.",
      solution: "rows = 4\nfor row in range(1, rows + 1):\n    for _ in range(row):\n        print(\"*\", end=\"\")\n    print()",
      tests: [
        ["Prints the triangle", "_cq_stdout.split() == [\"*\", \"**\", \"***\", \"****\"]"],
      ],
    }),
    task("medium", "Times table grid", {
      prompt: "Print a 3 by 3 times table, with the numbers on each row separated by single spaces:\n\n```\n1 2 3\n2 4 6\n3 6 9\n```",
      hint: "Print `row * col` with `end=\" \"` in the inner loop, and `print()` after it. The check ignores spaces at the end of a line.",
      solution: "for row in range(1, 4):\n    for col in range(1, 4):\n        print(row * col, end=\" \")\n    print()",
      tests: [
        ["Prints the grid", "[line.strip() for line in _cq_stdout.strip().splitlines()] == [\"1 2 3\", \"2 4 6\", \"3 6 9\"]"],
      ],
    }),
    task("medium", "Coordinates", {
      prompt: "Print the coordinates of a 2-row, 3-column grid, one row per line:\n\n```\n(0,0) (0,1) (0,2)\n(1,0) (1,1) (1,2)\n```",
      hint: "Print `f\"({row},{col})\"` with `end=\" \"` inside, and `print()` after each row.",
      solution: "for row in range(2):\n    for col in range(3):\n        print(f\"({row},{col})\", end=\" \")\n    print()",
      tests: [
        ["Prints the coordinates", "[line.strip() for line in _cq_stdout.strip().splitlines()] == [\"(0,0) (0,1) (0,2)\", \"(1,0) (1,1) (1,2)\"]"],
      ],
    }),
    task("hard", "Number pyramid", {
      prompt: "Print `rows` lines: `1`, then `1 2`, then `1 2 3`, up to `1 2 3 4`.",
      starter: "rows = 4\n",
      hint: "The inner loop runs from 1 to the current row number, printing with `end=\" \"`.",
      solution: "rows = 4\nfor row in range(1, rows + 1):\n    for n in range(1, row + 1):\n        print(n, end=\" \")\n    print()",
      tests: [
        ["Prints the pyramid", "[line.strip() for line in _cq_stdout.strip().splitlines()] == [\"1\", \"1 2\", \"1 2 3\", \"1 2 3 4\"]"],
      ],
    }),
    task("hard", "Pairs that add up", {
      prompt: "Set `pairs` to how many pairs of numbers `i` and `j` from 1 to 5, with `i < j`, add up to 6.",
      starter: "pairs = 0\n",
      hint: "Let the inner loop start after `i`: `for j in range(i + 1, 6):`. Count when `i + j == 6`.",
      solution: "pairs = 0\nfor i in range(1, 6):\n    for j in range(i + 1, 6):\n        if i + j == 6:\n            pairs += 1",
      tests: [
        ["pairs is 2", "pairs == 2"],
      ],
    }),
    task("expert", "Primes up to 30", {
      prompt: "Build `primes`: the prime numbers from 2 to 30, separated by spaces (`2 3 5 7 ...`). Use nested loops with `break` and the loop `else`.",
      starter: "primes = \"\"\n",
      hint: "For each `n`, try every `d` from 2 to `n - 1`. `break` on a divisor; in the inner loop's `else`, add `str(n) + \" \"`. Strip the last space.",
      solution: "primes = \"\"\nfor n in range(2, 31):\n    for d in range(2, n):\n        if n % d == 0:\n            break\n    else:\n        primes = primes + str(n) + \" \"\nprimes = primes.strip()",
      tests: [
        ["primes is right", "primes == \"2 3 5 7 11 13 17 19 23 29\""],
      ],
    }),
    task("expert", "Checkerboard", {
      prompt: "Print a 4 by 4 checkerboard of `#` and `.`, starting with `#` in the top-left corner:\n\n```\n#.#.\n.#.#\n#.#.\n.#.#\n```",
      hint: "A square is `#` when `(row + col) % 2 == 0`, and `.` otherwise.",
      solution: "for row in range(4):\n    for col in range(4):\n        if (row + col) % 2 == 0:\n            print(\"#\", end=\"\")\n        else:\n            print(\".\", end=\"\")\n    print()",
      tests: [
        ["Prints the checkerboard", "_cq_stdout.split() == [\"#.#.\", \".#.#\", \"#.#.\", \".#.#\"]"],
      ],
    }),
  ],
  questions: [
    mc("An outer loop runs 3 times and its inner loop 4 times. How often does the inner body run?", ["`7`", "`12`", "`4`", "`3`"], 1, "The inner loop runs fully for each round of the outer loop: 3 × 4 is 12."),
    mc("What does the inner loop do in each round of the outer loop?", ["It runs all the way through", "It runs once", "It is skipped", "It continues where it stopped"], 0, "Each outer round starts the inner loop again from the beginning."),
    mc("Why is there a `print()` after the inner loop in grid programs?", ["To print a space", "To end the program", "To start a new line after each row", "To repeat the row"], 2, "`print()` with no values ends the current line, so the next row starts on a new line."),
    mc("Which loop does a `break` in the inner loop end?", ["Both loops", "The outer loop", "The whole program", "Only the inner loop"], 3, "`break` only leaves the loop it is directly inside."),
    mc("What does this print?\n\n```\nfor i in range(2):\n    for j in range(2):\n        print(i, j)\n```", ["`0 0`, `0 1`, `1 0`, `1 1`", "`0 0` and `1 1`", "`0 1` and `1 0`", "`0`, `1`"], 0, "For each `i`, the inner loop goes through every `j`, so you get all four pairs in order."),
    qShort("How many lines does `for row in range(5): print(\"*\" * row)` print? (a number)", "5", "The outer loop runs 5 times and prints one line each time (the first line is empty)."),
    mc("What goes wrong if both loops use the variable `i`?", ["Nothing", "The inner loop overwrites the outer loop's `i`", "A `SyntaxError`", "The loops run in parallel"], 1, "Both loops would share one variable, so the inner loop changes the value the outer loop relies on."),
    mc("Which line goes in the blank so the third row prints `***`?\n\n```\nfor row in range(1, 4):\n    ____\n        print(\"*\", end=\"\")\n    print()\n```", ["`for _ in range(3, row):`", "`for _ in range(1):`", "`for _ in range(row):`", "`for _ in range(row, 0):`"], 2, "`range(row)` repeats `row` times, so the third row (`row` is 3) gets 3 stars."),
    mc("Why keep nested loops for when you need them?", ["They are a syntax error in Python 3", "They can't use `range`", "They need `while`", "The number of rounds multiplies and can get very large"], 3, "Nested loops multiply: 1,000 × 1,000 is a million rounds."),
    mc("A checkerboard is drawn with nested loops over `row` and `col`, both counting from 0. Which squares are `#` if the top-left corner (row 0, col 0) is `#`?", ["Those where `(row + col) % 2 == 0`", "Those where `row == col`", "Every second row", "Those where `col % 2 == 1`"], 0, "Moving one square in any direction changes `row + col` by 1, so the pattern alternates."),
  ],
})
