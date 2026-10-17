// Decisions and loops topic: break and continue. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task, typedInput } from '../_builders.mjs'

export default makeTopic({
  id: "break_continue",
  title: "break and continue",
  paragraphs: [
    "Sometimes you want to leave a loop early, or skip one round. `break` ends the loop immediately, and the program carries on after it. `continue` skips the rest of the current round and jumps straight to the next one.",
    "```\nfor n in range(1, 11):\n    if n == 4:\n        continue      # skip 4\n    if n == 7:\n        break         # stop at 7\n    print(n)          # 1 2 3 5 6\n```",
    "`break` is perfect for **searching**: loop through the items and stop as soon as you find what you're looking for, rather than checking the rest for nothing.",
    "`while True:` repeats forever, unless a `break` inside ends it. It's the usual way to write a loop that keeps asking until the user is done, because the exit check can sit in the middle of the loop, right after the `input()`:",
    "```\nwhile True:\n    command = input(\"> \")\n    if command == \"quit\":\n        print(\"Bye!\")\n        break\n    print(\"Running\", command)\n```",
    "Loops can have an `else` block too. It runs when the loop finishes normally, but **not** when it was ended by `break`. That makes \"search, and say if nothing was found\" short to write:",
    "```\nword = \"rhythm\"\nfor ch in word:\n    if ch in \"aeiou\":\n        print(\"Found a vowel:\", ch)\n        break\nelse:\n    print(\"No vowels\")   # runs, because the loop never hit break\n```",
    "Don't confuse `continue` with `pass`. `pass` does nothing and carries on with the next line in the same round; `continue` skips everything after it in this round.",
    "Use `break` and `continue` sparingly: a loop with several exits gets hard to follow. Often a clearer `while` condition or an `if` around the code does the same job.",
  ],
  sandboxCode: "for n in range(1, 11):\n    if n == 4:\n        continue\n    if n == 7:\n        break\n    print(n)\n\nword = \"rhythm\"\nfor ch in word:\n    if ch in \"aeiou\":\n        print(\"Found a vowel:\", ch)\n        break\nelse:\n    print(\"No vowels in\", word)",
  sandboxSnippets: [
    snippet("break", "for n in range(1, 100):\n    if n * n > 50:\n        print(\"First square above 50:\", n * n)\n        break"),
    snippet("continue", "for ch in \"a b c\":\n    if ch == \" \":\n        continue\n    print(ch)"),
    snippet("while True", "# Type a few commands in the Input box, ending with quit.\nwhile True:\n    command = input(\"> \")\n    if command == \"quit\":\n        print(\"Bye!\")\n        break\n    print(\"Running\", command)"),
    snippet("for ... else", "for n in range(2, 10):\n    if 35 % n == 0:\n        print(\"35 divides by\", n)\n        break\nelse:\n    print(\"35 is prime\")"),
    snippet("Stop early", "total = 0\nfor n in range(1, 100):\n    if total + n > 20:\n        break\n    total += n\nprint(total, n)"),
  ],
  readMore: { label: "Python tutorial: break, continue and else on loops", url: "https://docs.python.org/3/tutorial/controlflow.html#break-and-continue-statements", source: "Python docs" },
  challenges: [
    task("easy", "Stop at six", {
      prompt: "This prints 1 to 10. Add a `break` so it stops before printing 6.",
      starter: "for n in range(1, 11):\n    print(n)",
      hint: "Before the `print`, add `if n == 6: break` (on two lines, indented).",
      solution: "for n in range(1, 11):\n    if n == 6:\n        break\n    print(n)",
      tests: [
        ["Prints 1 to 5", "_cq_stdout.split() == [\"1\", \"2\", \"3\", \"4\", \"5\"]"],
      ],
    }),
    task("easy", "Skip three", {
      prompt: "This prints 1 to 5. Use `continue` so it skips 3.",
      starter: "for n in range(1, 6):\n    print(n)",
      hint: "Before the `print`, add `if n == 3: continue`.",
      solution: "for n in range(1, 6):\n    if n == 3:\n        continue\n    print(n)",
      tests: [
        ["Prints 1, 2, 4 and 5", "_cq_stdout.split() == [\"1\", \"2\", \"4\", \"5\"]"],
      ],
    }),
    task("easy", "The first vowel", {
      prompt: "Set `first_vowel` to the first vowel in `text`, using a loop with `break`.",
      starter: "text = \"rhythm and blues\"\nfirst_vowel = \"\"\n",
      hint: "When `ch in \"aeiou\"`, store it in `first_vowel` and `break`.",
      solution: "text = \"rhythm and blues\"\nfirst_vowel = \"\"\nfor ch in text:\n    if ch in \"aeiou\":\n        first_vowel = ch\n        break",
      tests: [
        ["first_vowel is a", "first_vowel == \"a\""],
      ],
    }),
    task("medium", "Skip the spaces", {
      prompt: "Build `no_spaces` from `text` without its spaces, using `continue`.",
      starter: "text = \"a b c d\"\nno_spaces = \"\"\n",
      hint: "If `ch == \" \"`, `continue`; otherwise add `ch`.",
      solution: "text = \"a b c d\"\nno_spaces = \"\"\nfor ch in text:\n    if ch == \" \":\n        continue\n    no_spaces = no_spaces + ch",
      tests: [
        ["no_spaces is abcd", "no_spaces == \"abcd\""],
      ],
    }),
    task("medium", "A command loop", {
      prompt: "Repeat: ask `> `; if the answer is `quit`, print `Bye!` and stop; otherwise print `Running <command>`. The check types `help`, `stats` and `quit`.",
      hint: "`while True:` with `command = input(\"> \")`, then `if command == \"quit\":` print and `break`.",
      solution: "while True:\n    command = input(\"> \")\n    if command == \"quit\":\n        print(\"Bye!\")\n        break\n    print(\"Running\", command)",
      setup: typedInput("help", "stats", "quit"),
      tests: [
        ["Runs two commands, then says Bye!", "_cq_stdout.strip().splitlines() == [\"> help\", \"Running help\", \"> stats\", \"Running stats\", \"> quit\", \"Bye!\"]"],
      ],
    }),
    task("medium", "First multiple of 7", {
      prompt: "Set `found` to the first number above 100 that divides by 7.",
      hint: "Loop over `range(101, 200)` and `break` at the first `n % 7 == 0`.",
      solution: "for n in range(101, 200):\n    if n % 7 == 0:\n        found = n\n        break",
      tests: [
        ["found is 105", "found == 105"],
      ],
    }),
    task("hard", "Is it prime?", {
      prompt: "A number is prime if nothing from 2 up to itself minus 1 divides it. Set `is_prime` for `n`, and `divisor` to the smallest number that divides it (or `None` if it is prime). Stop at the first divisor.",
      starter: "n = 91\nis_prime = True\ndivisor = None\n",
      hint: "Loop `d` over `range(2, n)`. When `n % d == 0`: set `is_prime = False`, `divisor = d`, and `break`.",
      solution: "n = 91\nis_prime = True\ndivisor = None\nfor d in range(2, n):\n    if n % d == 0:\n        is_prime = False\n        divisor = d\n        break",
      tests: [
        ["is_prime is False", "is_prime is False"],
        ["divisor is 7", "divisor == 7"],
      ],
    }),
    task("hard", "Search with for-else", {
      prompt: "Print `Has a vowel` if `word` contains a vowel, or `No vowels` if it doesn't. Use `break` and the loop's `else`.",
      starter: "word = \"crypt\"\n",
      hint: "Loop over the letters: on a vowel, print and `break`. The `else:` lines up with `for` and runs only when there was no break.",
      solution: "word = \"crypt\"\nfor ch in word:\n    if ch in \"aeiou\":\n        print(\"Has a vowel\")\n        break\nelse:\n    print(\"No vowels\")",
      tests: [
        ["Prints No vowels", "_cq_stdout.strip() == \"No vowels\""],
      ],
    }),
    task("expert", "Three tries", {
      prompt: "The password is `python`. Ask `Password: ` up to three times. Print `Wrong` after each wrong try and `Access granted` (then stop) when it is right. If all three tries are wrong, print `Locked out`. The check types `abc`, `letmein` and `python`.",
      hint: "`for attempt in range(3):` with `break` on success, and an `else:` on the loop that prints `Locked out`.",
      solution: "for attempt in range(3):\n    if input(\"Password: \") == \"python\":\n        print(\"Access granted\")\n        break\n    print(\"Wrong\")\nelse:\n    print(\"Locked out\")",
      setup: typedInput("abc", "letmein", "python"),
      tests: [
        ["Two wrong tries, then access", "[line for line in _cq_stdout.strip().splitlines() if not line.startswith(\"Password: \")] == [\"Wrong\", \"Wrong\", \"Access granted\"]"],
      ],
    }),
    task("expert", "Fill up to 100", {
      prompt: "Add 1, 2, 3, … to `total`, but stop before the total would go above 100. Set `last` to the last number you added.",
      starter: "total = 0\n",
      hint: "Loop over `range(1, 101)`. If `total + n > 100`, `break`; otherwise add `n` and set `last = n`.",
      solution: "total = 0\nfor n in range(1, 101):\n    if total + n > 100:\n        break\n    total += n\n    last = n",
      tests: [
        ["total is 91", "total == 91"],
        ["last is 13", "last == 13"],
      ],
    }),
  ],
  questions: [
    mc("What does `break` do?", ["Skips to the next round", "Ends the loop immediately", "Pauses the program", "Ends the program"], 1),
    mc("What does `continue` do?", ["Skips the rest of this round and goes to the next", "Ends the loop", "Does nothing", "Restarts the loop from the beginning"], 0),
    mc("When does the `else` of a loop run?", ["Always", "Never", "When the loop finishes without `break`", "Only after `continue`"], 2),
    mc("How does a `while True:` loop stop?", ["After 100 rounds", "When the condition is false", "It can't stop", "With a `break` inside it"], 3),
    mc("What does this print?\n\n```\nfor n in range(5):\n    if n == 2:\n        continue\n    print(n)\n```", ["`0 1 3 4`", "`0 1`", "`2`", "`0 1 2 3 4`"], 0),
    qShort("Which keyword ends a loop early?", "break"),
    mc("What is the difference between `pass` and `continue`?", ["None", "`pass` does nothing; `continue` skips the rest of the round", "`pass` ends the loop", "`continue` does nothing"], 1),
    mc("Why use `break` when searching?", ["It is required", "It prints the result", "To stop as soon as the item is found", "To restart the search"], 2),
    mc("What does this print?\n\n```\nfor n in range(3):\n    if n == 5:\n        break\nelse:\n    print(\"done\")\n```", ["Nothing", "`0 1 2`", "An error", "`done`"], 3),
    mc("In nested loops, which loop does `break` end?", ["Only the innermost loop it is in", "All the loops", "The outer loop", "None"], 0),
  ],
})
