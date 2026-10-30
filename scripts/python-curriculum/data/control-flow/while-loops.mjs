// Decisions and loops topic: while loops. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task, typedInput } from '../_builders.mjs'

export default makeTopic({
  id: "while_loops",
  title: "while loops",
  paragraphs: [
    "A **loop** repeats code, so you don't have to write it again and again. A `while` loop repeats its block **as long as** its condition is true. Python checks the condition, runs the block, checks again, and so on, until the condition is false.",
    "```\ncount = 1\nwhile count <= 3:\n    print(\"Count:\", count)\n    count += 1\nprint(\"Done\")\n```",
    "Something inside the loop has to change the condition, here `count += 1`. Without it, `count` stays 1 forever and the loop never ends: an **infinite loop**. CodeQuest stops code that runs for more than 10 seconds, so if your program seems stuck, look for the line that should move the loop towards its end.",
    "`while` is the right loop when you don't know in advance how many repetitions you'll need: keep doubling until a number passes 1000, keep asking until the user types something valid, keep adding interest until the savings reach a goal.",
    "```\nsavings = 1000\nyears = 0\nwhile savings < 1500:\n    savings = savings * 1.05\n    years += 1\nprint(years, \"years\")   # 9 years\n```",
    "A loop often builds up a result in a variable that starts before the loop: a total that starts at 0, a counter, or a text that starts empty. Each time round (each **iteration**), the loop updates it.",
    "Loops and `input()` work well together: ask, check the answer, and ask again while it isn't good enough. A loop can also keep reading until the user types a stop word or 0.",
    "Watch for **off-by-one** errors, where the loop runs one time too many or too few. `while count < 3` and `while count <= 3` differ by one iteration; trace the first and last rounds in your head (or with `print`) to be sure.",
  ],
  sandboxCode: "count = 1\nwhile count <= 5:\n    print(\"Count:\", count)\n    count += 1\n\nn = 1\nwhile n < 1000:\n    n = n * 2\nprint(\"First power of 2 above 1000:\", n)",
  sandboxSnippets: [
    snippet("Count up", "i = 1\nwhile i <= 5:\n    print(i)\n    i += 1"),
    snippet("Countdown", "n = 3\nwhile n > 0:\n    print(n)\n    n -= 1\nprint(\"Liftoff!\")"),
    snippet("Add up", "total = 0\nn = 1\nwhile n <= 10:\n    total += n\n    n += 1\nprint(total)"),
    snippet("Until a goal", "savings = 1000\nyears = 0\nwhile savings < 1500:\n    savings = savings * 1.05\n    years += 1\nprint(years, round(savings, 2))"),
    snippet("Ask until valid", "# Type a few numbers in the Input box, one per line.\nage = int(input(\"Age (0-120): \"))\nwhile age < 0 or age > 120:\n    age = int(input(\"Please try again: \"))\nprint(\"Thanks,\", age)"),
  ],
  readMore: { label: "Python docs: the while statement", url: "https://docs.python.org/3/reference/compound_stmts.html#the-while-statement", source: "Python docs" },
  challenges: [
    task("easy", "Count to five", {
      prompt: "Use a `while` loop to print the numbers 1 to 5, each on its own line.",
      starter: "n = 1\n",
      hint: "`while n <= 5:`, then inside the loop print `n` and add 1 to it.",
      solution: "n = 1\nwhile n <= 5:\n    print(n)\n    n += 1",
      tests: [
        ["Prints 1 to 5", "_cq_stdout.split() == [\"1\", \"2\", \"3\", \"4\", \"5\"]"],
      ],
    }),
    task("easy", "Countdown", {
      prompt: "Print `3`, `2`, `1` and then `Liftoff!`, using a `while` loop for the numbers.",
      starter: "n = 3\n",
      hint: "Loop `while n > 0`, printing `n` and subtracting 1. Print `Liftoff!` after the loop (not indented).",
      solution: "n = 3\nwhile n > 0:\n    print(n)\n    n -= 1\nprint(\"Liftoff!\")",
      tests: [
        ["Prints the countdown", "_cq_stdout.strip().splitlines() == [\"3\", \"2\", \"1\", \"Liftoff!\"]"],
      ],
    }),
    task("easy", "Add them up", {
      prompt: "Use a `while` loop to set `total` to the sum of the numbers 1 to 100.",
      starter: "total = 0\nn = 1\n",
      hint: "Inside the loop: `total += n`, then `n += 1`. Loop `while n <= 100`.",
      solution: "total = 0\nn = 1\nwhile n <= 100:\n    total += n\n    n += 1",
      tests: [
        ["total is 5050", "total == 5050"],
      ],
    }),
    task("medium", "Keep doubling", {
      prompt: "Start at 1 and keep doubling `n` while it is 1000 or less. Count the doublings in `steps`.",
      starter: "n = 1\nsteps = 0\n",
      hint: "Loop `while n <= 1000:` with `n = n * 2` and `steps += 1` inside.",
      solution: "n = 1\nsteps = 0\nwhile n <= 1000:\n    n = n * 2\n    steps += 1",
      tests: [
        ["n is 1024", "n == 1024"],
        ["steps is 10", "steps == 10"],
      ],
    }),
    task("medium", "Fix the endless loop", {
      prompt: "This loop never ends (CodeQuest stops it after 10 seconds). Fix it so it prints 0 to 4.",
      starter: "count = 0\nwhile count < 5:\n    print(count)",
      hint: "Nothing changes `count`. Add `count += 1` inside the loop.",
      solution: "count = 0\nwhile count < 5:\n    print(count)\n    count += 1",
      tests: [
        ["Prints 0 to 4", "_cq_stdout.split() == [\"0\", \"1\", \"2\", \"3\", \"4\"]"],
      ],
    }),
    task("medium", "Sum of the digits", {
      prompt: "Set `digit_sum` to the sum of the digits of `n`, using a `while` loop with `%` and `//`.",
      starter: "n = 2026\ndigit_sum = 0\n",
      hint: "While `n > 0`: add `n % 10` (the last digit) to `digit_sum`, then drop it with `n = n // 10`.",
      solution: "n = 2026\ndigit_sum = 0\nwhile n > 0:\n    digit_sum += n % 10\n    n = n // 10",
      tests: [
        ["digit_sum is 10", "digit_sum == 10"],
      ],
    }),
    task("hard", "Ask until valid", {
      prompt: "Ask `Age (0-120): ` and keep asking `Please try again: ` until the age is from 0 to 120. Then print `Thanks, <age>`. The check types `150`, `-3` and `42`.",
      hint: "Read one age before the loop. Loop `while age < 0 or age > 120:`, reading a new age inside.",
      solution: "age = int(input(\"Age (0-120): \"))\nwhile age < 0 or age > 120:\n    age = int(input(\"Please try again: \"))\nprint(\"Thanks,\", age)",
      setup: typedInput("150", "-3", "42"),
      tests: [
        ["Asked three times", "_cq_stdout.count(\"Please try again: \") == 2"],
        ["Prints Thanks, 42", "_cq_stdout.strip().splitlines()[-1] == \"Thanks, 42\""],
      ],
    }),
    task("hard", "Savings goal", {
      prompt: "Savings grow by 5% a year. Set `years` to how many years it takes for `savings` to reach `goal`.",
      starter: "savings = 1000\ngoal = 1500\nyears = 0\n",
      hint: "Loop `while savings < goal:`, multiplying by 1.05 and counting the years.",
      solution: "savings = 1000\ngoal = 1500\nyears = 0\nwhile savings < goal:\n    savings = savings * 1.05\n    years += 1",
      tests: [
        ["years is 9", "years == 9"],
        ["savings reached the goal", "savings >= 1500"],
      ],
    }),
    task("expert", "The Collatz sequence", {
      prompt: "Start with `n`. While `n` isn't 1: if it is even, halve it (with `//`); if it is odd, set it to `3 * n + 1`. Count the steps in `steps`.",
      starter: "n = 27\nsteps = 0\n",
      hint: "Inside `while n != 1:`, use `if n % 2 == 0:` to choose between the two updates, then `steps += 1`.",
      solution: "n = 27\nsteps = 0\nwhile n != 1:\n    if n % 2 == 0:\n        n = n // 2\n    else:\n        n = 3 * n + 1\n    steps += 1",
      tests: [
        ["steps is 111", "steps == 111"],
        ["n ends at 1", "n == 1"],
      ],
    }),
    task("expert", "Add until zero", {
      prompt: "Read numbers with `Number: ` until the user types 0. Then print `Total: <sum>` and `Count: <how many numbers before the 0>`. The check types `5`, `10`, `-3` and `0`.",
      hint: "Read the first number before the loop, and a new one at the end of each round. Loop `while number != 0:`.",
      solution: "total = 0\ncount = 0\nnumber = int(input(\"Number: \"))\nwhile number != 0:\n    total += number\n    count += 1\n    number = int(input(\"Number: \"))\nprint(\"Total:\", total)\nprint(\"Count:\", count)",
      setup: typedInput("5", "10", "-3", "0"),
      tests: [
        ["Prints the total and count", "_cq_stdout.strip().splitlines()[-2:] == [\"Total: 12\", \"Count: 3\"]"],
      ],
    }),
  ],
  questions: [
    mc("When does a `while` loop stop?", ["When its condition becomes false", "After 10 rounds", "When it reaches `print`", "Never"], 0),
    mc("What happens if the condition never becomes false?", ["Python stops after one round", "The loop never ends: an infinite loop", "A `SyntaxError`", "The loop is skipped"], 1),
    qShort("How many times does the body run? `n = 0`, then `while n < 3: n += 1` (a number)", "3"),
    mc("How often does the body of `while False:` run?", ["Once", "Forever", "Never", "Twice"], 2),
    mc("When is `while` a better choice than other loops?", ["When printing text", "Always", "Never", "When you don't know in advance how many rounds you need"], 3),
    mc("What does this print?\n\n```\nn = 1\nwhile n < 20:\n    n = n * 3\nprint(n)\n```", ["`9`", "`20`", "`81`", "`27`"], 3),
    mc("After `x = 10` and `while x > 0: x -= 3`, what is `x`?", ["`0`", "`-2`", "`1`", "`-3`"], 1),
    mc("What is missing from this loop?\n\n```\ni = 0\nwhile i < 5:\n    print(i)\n```", ["A colon", "`else:`", "`i += 1` inside the loop", "Nothing"], 2),
    mc("What is an off-by-one error?", ["A wrong variable name", "A loop that runs forever", "A missing colon", "A loop that runs one time too many or too few"], 3),
    mc("Where should a total start, if a loop adds numbers to it?", ["Before the loop, at 0", "Inside the loop, at 0", "After the loop", "Anywhere"], 0),
  ],
})
