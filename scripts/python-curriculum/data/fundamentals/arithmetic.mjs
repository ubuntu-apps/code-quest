// Fundamentals topic: Numbers and arithmetic. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "arithmetic",
  title: "Numbers and arithmetic",
  paragraphs: [
    "Python makes a great calculator. `+`, `-`, `*` and `/` work as you'd expect, and `**` raises a number to a power: `2 ** 10` is `1024`.",
    "Division comes in three flavours. `/` gives the exact result as a float: `7 / 2` is `3.5`. `//` is **floor division**: it divides and drops the fraction, so `7 // 2` is `3`. `%` (**modulo**) gives the remainder: `7 % 2` is `1`. Together, `//` and `%` split something into whole groups and leftovers:",
    "```\nminutes = 135\nprint(minutes // 60, \"hours and\", minutes % 60, \"minutes\")   # 2 hours and 15 minutes\n```",
    "`%` is useful beyond leftovers: `n % 2` is 0 for even numbers and 1 for odd ones, and `n % 10` is the last digit of `n`. Likewise, `n // 10` drops the last digit.",
    "Python follows the usual order of operations: `**` first, then `*`, `/`, `//` and `%`, and finally `+` and `-`. So `2 + 3 * 4` is `14`. Use brackets to choose your own order: `(2 + 3) * 4` is `20`. When in doubt, add brackets; they make the code clearer, too.",
    "Updating a variable with arithmetic is so common that it has shortcuts: `score += 10` means `score = score + 10`. There are also `-=`, `*=`, `/=` and `//=`.",
    "```\nscore = 0\nscore += 10\nscore *= 3\nprint(score)   # 30\n```",
    "Two details. `//` always rounds **down**, so `-7 // 2` is `-4`, not `-3`. And ints can be as big as you like: `2 ** 100` is worked out exactly. Write big numbers with underscores to make them readable: `1_000_000` is the same as `1000000`.",
  ],
  sandboxCode: "print(7 / 2, 7 // 2, 7 % 2)\nprint(2 ** 10)\nprint(2 + 3 * 4, (2 + 3) * 4)\nminutes = 135\nprint(minutes // 60, \"h\", minutes % 60, \"min\")",
  sandboxSnippets: [
    snippet("Three divisions", "print(17 / 5)\nprint(17 // 5)\nprint(17 % 5)"),
    snippet("Even or odd", "print(10 % 2, 7 % 2)\nprint(2026 % 10, 2026 // 10)"),
    snippet("Order of operations", "print(2 + 3 * 4)\nprint((2 + 3) * 4)\nprint(2 ** 3 * 2)"),
    snippet("Shortcuts", "points = 5\npoints += 10\npoints -= 3\npoints *= 2\nprint(points)"),
    snippet("Big numbers", "print(2 ** 100)\nprint(1_000_000 * 3)"),
  ],
  readMore: { label: "Python tutorial: numbers", url: "https://docs.python.org/3/tutorial/introduction.html#numbers", source: "Python docs" },
  challenges: [
    task("easy", "Area of a room", {
      prompt: "Set `area` to the area of the room (length times width), then print it.",
      starter: "length = 4.5\nwidth = 3\n",
      hint: "Multiply the variables: `area = length * width`.",
      solution: "length = 4.5\nwidth = 3\narea = length * width\nprint(area)",
      tests: [
        ["area is 13.5", "area == 13.5"],
        ["Prints 13.5", "_cq_stdout.strip() == \"13.5\""],
      ],
    }),
    task("easy", "Powers of two", {
      prompt: "Computer memory counts in powers of two. Set `kb` to 2 to the power of 10 and `mb` to 2 to the power of 20.",
      hint: "Use `**` for powers: `kb = 2 ** 10`.",
      solution: "kb = 2 ** 10\nmb = 2 ** 20",
      tests: [
        ["kb is 1024", "kb == 1024"],
        ["mb is 1048576", "mb == 1048576"],
      ],
    }),
    task("easy", "Average of three", {
      prompt: "Set `average` to the average of `a`, `b` and `c`: add them up, then divide by 3.",
      starter: "a, b, c = 80, 90, 85\n",
      hint: "Division happens before addition, so `a + b + c / 3` only divides `c`. Put brackets around the sum.",
      solution: "a, b, c = 80, 90, 85\naverage = (a + b + c) / 3",
      tests: [
        ["average is 85.0", "average == 85.0"],
      ],
    }),
    task("medium", "Share the pizza", {
      prompt: "22 slices are shared between 6 people. Set `each` to how many whole slices each person gets and `left` to how many are left over. Then print `Each person gets 3 slices, 4 left over`.",
      starter: "slices = 22\npeople = 6\n",
      hint: "`//` gives the whole slices and `%` the leftovers. In `print`, the text `\"slices,\"` can include the comma.",
      solution: "slices = 22\npeople = 6\neach = slices // people\nleft = slices % people\nprint(\"Each person gets\", each, \"slices,\", left, \"left over\")",
      tests: [
        ["each is 3", "each == 3"],
        ["left is 4", "left == 4"],
        ["Prints the sentence", "_cq_stdout.strip() == \"Each person gets 3 slices, 4 left over\""],
      ],
    }),
    task("medium", "Split off the last digit", {
      prompt: "Set `last` to the last digit of `n` and `rest` to `n` without its last digit, using `%` and `//`.",
      starter: "n = 2026\n",
      hint: "Dividing by 10 moves the decimal point: the remainder (`% 10`) is the last digit, and the floor division (`// 10`) is what remains.",
      solution: "n = 2026\nlast = n % 10\nrest = n // 10",
      tests: [
        ["last is 6", "last == 6"],
        ["rest is 202", "rest == 202"],
      ],
    }),
    task("medium", "Keep score", {
      prompt: "Using `+=` and `*=`: add 10 to `score`, then add 25, then double it. Print the final score.",
      starter: "score = 0\n",
      hint: "Three lines: `score += 10`, `score += 25` and `score *= 2`.",
      solution: "score = 0\nscore += 10\nscore += 25\nscore *= 2\nprint(score)",
      tests: [
        ["score is 70", "score == 70"],
        ["Prints 70", "_cq_stdout.strip() == \"70\""],
      ],
    }),
    task("hard", "Time from seconds", {
      prompt: "Split `total` seconds into `hours`, `minutes` and `seconds`, then print `1 h 2 min 5 s`.",
      starter: "total = 3725\n",
      hint: "There are 3600 seconds in an hour: `hours = total // 3600`. What remains after the hours is `total % 3600`; divide that by 60 for the minutes. The seconds are `total % 60`.",
      solution: "total = 3725\nhours = total // 3600\nminutes = total % 3600 // 60\nseconds = total % 60\nprint(hours, \"h\", minutes, \"min\", seconds, \"s\")",
      tests: [
        ["hours is 1", "hours == 1"],
        ["minutes is 2", "minutes == 2"],
        ["seconds is 5", "seconds == 5"],
        ["Prints 1 h 2 min 5 s", "_cq_stdout.strip() == \"1 h 2 min 5 s\""],
      ],
    }),
    task("hard", "Fix the formula", {
      prompt: "This should convert 25 °C to Fahrenheit (77.0), but the formula is wrong. Fix it: multiply by 9, divide by 5, then add 32.",
      starter: "celsius = 25\nfahrenheit = celsius + 32 * 9 / 5\nprint(fahrenheit)",
      hint: "Write the steps in the order they should happen: `celsius * 9 / 5 + 32`.",
      solution: "celsius = 25\nfahrenheit = celsius * 9 / 5 + 32\nprint(fahrenheit)",
      tests: [
        ["fahrenheit is 77.0", "fahrenheit == 77.0"],
        ["Prints 77.0", "_cq_stdout.strip() == \"77.0\""],
      ],
    }),
    task("expert", "Split the bill", {
      prompt: "The bill is `total`, and everyone adds a `tip_percent` tip. Set `tip` to the tip amount and `each` to what each person pays (the bill plus the tip, shared equally).",
      starter: "total = 87.6\npeople = 4\ntip_percent = 15\n",
      hint: "A percentage is a fraction of 100: `tip = total * tip_percent / 100`. Then `each = (total + tip) / people`. Mind the brackets.",
      solution: "total = 87.6\npeople = 4\ntip_percent = 15\ntip = total * tip_percent / 100\neach = (total + tip) / people",
      tests: [
        ["tip is 13.14", "abs(tip - 13.14) < 1e-9"],
        ["each is 25.185", "abs(each - 25.185) < 1e-9"],
      ],
    }),
    task("expert", "Compound interest", {
      prompt: "Savings grow by `rate` (5%) every year, and the interest earns interest too. Set `final` to the amount after `years` years: savings times (1 + rate) to the power of years.",
      starter: "savings = 1000\nrate = 0.05\nyears = 3\n",
      hint: "`final = savings * (1 + rate) ** years`. The brackets make sure 1 + rate is added before the power.",
      solution: "savings = 1000\nrate = 0.05\nyears = 3\nfinal = savings * (1 + rate) ** years",
      tests: [
        ["final is 1157.625", "abs(final - 1157.625) < 1e-6"],
      ],
    }),
  ],
  questions: [
    mc("What is `7 // 2`?", ["`3.5`","`3`","`4`","`1`"], 1, "`//` divides and then rounds down to a whole number: 7 / 2 is 3.5, so the answer is 3."),
    mc("What is `7 % 2`?", ["`3`","`3.5`","`1`","`0`"], 2, "`%` gives the remainder: 7 divided by 2 is 3 with 1 left over."),
    mc("What is `2 + 3 * 4`?", ["`14`","`20`","`24`","`9`"], 0, "Multiplication happens before addition, so this is 2 + 12."),
    qShort("Which operator raises a number to a power, as in 2 to the power of 10?", "**", "`**` is the power operator, so `2 ** 10` is 1024."),
    mc("What does `score += 5` do?", ["Sets `score` to 5","Adds 5 to `score`","Checks whether `score` is 5","Prints `score + 5`"], 1, "`+=` adds to the variable's current value and stores the result: `score = score + 5`."),
    mc("What does `10 / 5` give?", ["`2`","`\"2\"`","`2.0`","`0`"], 2, "`/` always gives a `float`, so the result is `2.0`, not `2`."),
    mc("How can you tell that `n` is even?", ["`n % 2 == 0`", "`n / 2 == 0`", "`n // 2 == 1`", "`n ** 2 == n`"], 0, "Even numbers leave no remainder when divided by 2, so `n % 2` is 0."),
    mc("What is `-7 // 2`?", ["`-3`","`-3.5`","`-4`","`3`"], 2, "`//` rounds down, toward minus infinity: -3.5 becomes -4, not -3."),
    mc("What is `(2 + 3) * 4`?", ["`14`","`20`","`24`","`11`"], 1, "Brackets are worked out first, so this is 5 * 4."),
    mc("What is `1_000_000`?", ["A syntax error","The text `\"1_000_000\"`","Three separate numbers","One million, written with underscores for readability"], 3, "Underscores in a number are only there to group the digits for people; Python ignores them."),
  ],
})
