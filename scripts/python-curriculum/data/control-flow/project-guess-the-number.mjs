// Decisions and loops project: Guess the number. Lesson, Try-it snippets, challenges and quiz.
import { makeProject, mc, qShort, snippet, task, typedInput } from '../_builders.mjs'

export default makeProject("easy", {
  id: "proj_guess_the_number",
  title: "Guess the number",
  paragraphs: [
    "Build the classic guessing game. The program has a secret number; the player guesses, and the program says whether each guess is too low, too high or correct, until they get it or run out of tries. It uses comparisons, `if`/`elif`/`else`, a `while` loop and `break`.",
    "To keep the checks predictable the secret is always 7 here. (A real game would pick one with `random.randint(1, 10)`, which you'll meet in Modules and packages.) When the player types 3, 9 and 7, the finished game shows:",
    "```\nGuess a number from 1 to 10.\nYour guess: 3\nToo low\nYour guess: 9\nToo high\nYour guess: 7\nCorrect! You got it in 3 tries.\n```",
    "Build it in steps: compare one guess, read a guess, keep asking until it's right, count the tries, and finally limit the player to 5 tries. Type guesses on separate lines in the Input box to try the sandbox.",
  ],
  sandboxCode: "secret = 7\nguess = int(input(\"Your guess: \"))\nwhile guess != secret:\n    if guess < secret:\n        print(\"Too low\")\n    else:\n        print(\"Too high\")\n    guess = int(input(\"Your guess: \"))\nprint(\"Correct!\")",
  sandboxSnippets: [
    snippet("Compare a guess", "secret = 7\nguess = 4\nif guess < secret:\n    print(\"Too low\")\nelif guess > secret:\n    print(\"Too high\")\nelse:\n    print(\"Correct!\")"),
    snippet("Count while you loop", "tries = 0\nwhile tries < 3:\n    tries += 1\n    print(\"Try\", tries)"),
    snippet("Stop early", "for tries in range(1, 6):\n    print(\"Try\", tries)\n    if tries == 2:\n        print(\"Got it!\")\n        break\nelse:\n    print(\"Out of tries\")"),
  ],
  challenges: [
    task("easy", "Compare one guess", {
      prompt: "Print `Too low`, `Too high` or `Correct!` by comparing `guess` with `secret`.",
      starter: "secret = 7\nguess = 4\n",
      hint: "Use `if guess < secret:`, `elif guess > secret:` and `else:`.",
      solution: "secret = 7\nguess = 4\nif guess < secret:\n    print(\"Too low\")\nelif guess > secret:\n    print(\"Too high\")\nelse:\n    print(\"Correct!\")",
      tests: [
        ["Prints Too low", "_cq_stdout.strip() == \"Too low\""],
      ],
    }),
    task("easy", "Read a guess", {
      prompt: "Ask `Your guess: ` and store the answer in `guess` as a whole number. The check types `5`.",
      starter: "secret = 7\n",
      hint: "`guess = int(input(\"Your guess: \"))`.",
      solution: "secret = 7\nguess = int(input(\"Your guess: \"))",
      setup: typedInput("5"),
      tests: [
        ["guess is the number 5", "guess == 5 and isinstance(guess, int)"],
      ],
    }),
    task("medium", "Give a hint", {
      prompt: "Read a guess with `Your guess: `, then print `Too low`, `Too high` or `Correct!`. The check types `9`.",
      starter: "secret = 7\n",
      hint: "Read it with `int(input(...))`, then reuse your comparison from the first step.",
      solution: "secret = 7\nguess = int(input(\"Your guess: \"))\nif guess < secret:\n    print(\"Too low\")\nelif guess > secret:\n    print(\"Too high\")\nelse:\n    print(\"Correct!\")",
      setup: typedInput("9"),
      tests: [
        ["Prints Too high", "_cq_stdout.strip().splitlines()[-1] == \"Too high\""],
      ],
    }),
    task("medium", "Keep guessing", {
      prompt: "Keep asking `Your guess: ` until the guess is right, printing `Too low` or `Too high` after each wrong one and `Correct!` at the end. The check types 3, 9 and 7.",
      starter: "secret = 7\n",
      hint: "Read the first guess before the loop, then `while guess != secret:` give the hint and read the next guess.",
      solution: "secret = 7\nguess = int(input(\"Your guess: \"))\nwhile guess != secret:\n    if guess < secret:\n        print(\"Too low\")\n    else:\n        print(\"Too high\")\n    guess = int(input(\"Your guess: \"))\nprint(\"Correct!\")",
      setup: typedInput("3", "9", "7"),
      tests: [
        ["Prints the hints, then Correct!", "[l for l in _cq_stdout.strip().splitlines() if not l.startswith(\"Your guess\")] == [\"Too low\", \"Too high\", \"Correct!\"]"],
      ],
    }),
    task("hard", "Count the tries", {
      prompt: "Do the same, but count the guesses and finish with `Correct! You got it in 3 tries.` The check types 3, 9 and 7.",
      starter: "secret = 7\n",
      hint: "Start `tries = 1` after the first guess and add 1 every time you read another one. Use an f-string for the last line.",
      solution: "secret = 7\nguess = int(input(\"Your guess: \"))\ntries = 1\nwhile guess != secret:\n    if guess < secret:\n        print(\"Too low\")\n    else:\n        print(\"Too high\")\n    guess = int(input(\"Your guess: \"))\n    tries += 1\nprint(f\"Correct! You got it in {tries} tries.\")",
      setup: typedInput("3", "9", "7"),
      tests: [
        ["tries is 3", "tries == 3"],
        ["Prints the result", "_cq_stdout.strip().splitlines()[-1] == \"Correct! You got it in 3 tries.\""],
      ],
    }),
    task("expert", "Only five tries", {
      prompt: "The whole game: print `Guess a number from 1 to 10.`, then give the player at most 5 tries. On a right guess print `Correct! You got it in N tries.` and stop; after 5 wrong guesses print `Out of tries! The number was 7.` The check types 1, 2, 3, 4 and 5.",
      starter: "secret = 7\n",
      hint: "`for tries in range(1, 6):` read a guess; if it's right, print the win and `break`; otherwise give the hint. The loop's `else:` runs only when it never hit `break`.",
      solution: "secret = 7\nprint(\"Guess a number from 1 to 10.\")\nfor tries in range(1, 6):\n    guess = int(input(\"Your guess: \"))\n    if guess == secret:\n        print(f\"Correct! You got it in {tries} tries.\")\n        break\n    elif guess < secret:\n        print(\"Too low\")\n    else:\n        print(\"Too high\")\nelse:\n    print(f\"Out of tries! The number was {secret}.\")",
      setup: typedInput("1", "2", "3", "4", "5"),
      tests: [
        ["Starts with the welcome", "_cq_stdout.strip().splitlines()[0] == \"Guess a number from 1 to 10.\""],
        ["Gives a hint for each guess", "[l for l in _cq_stdout.strip().splitlines() if l.startswith(\"Too\")] == [\"Too low\"] * 5"],
        ["Ends with Out of tries", "_cq_stdout.strip().splitlines()[-1] == \"Out of tries! The number was 7.\""],
      ],
    }),
  ],
  questions: [
    mc("No earlier line sets `guess`. What happens when this runs?\n\n```\nwhile guess != 7:\n    guess = int(input())\n```", ["The loop is skipped", "It asks for one guess", "A `NameError`: `guess` has no value yet", "It loops forever"], 2, "The condition is checked before the first round, so `guess` must already exist. Read the first guess before the loop."),
    mc("Which comparison is true when the guess is too low?", ["`guess > secret`", "`guess == secret`", "`guess < secret`", "`guess != guess`"], 2, "A guess below the secret number is too low."),
    mc("What happens if you forget to read a new guess inside the loop?", ["The loop never ends", "Python asks automatically", "The loop ends at once", "Nothing changes"], 0, "The condition depends on `guess`, so without a new guess it never becomes false."),
    mc("In `for tries in range(1, 6):`, how many guesses does the player get?", ["6", "1", "4", "5"], 3, "`range(1, 6)` gives 1 to 5, which is five tries."),
    mc("When does a `for` loop's `else:` block run?", ["After every round", "Only when the loop ends without `break`", "Only after `break`", "Never"], 1, "The `else` runs only when the player used every try without a `break` for a correct guess."),
    qShort("`int(input())` when the player types `07`. What number is stored?", "7", "`int()` ignores leading zeros, so `\"07\"` becomes 7."),
  ],
})
