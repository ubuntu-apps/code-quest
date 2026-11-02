// Decisions and loops project: Quiz game. Lesson, Try-it snippets, challenges and quiz.
import { makeProject, mc, qShort, snippet, task, typedInput } from '../_builders.mjs'

export default makeProject("medium", {
  id: "proj_quiz_game",
  title: "Quiz game",
  paragraphs: [
    "Build a three-question quiz that keeps score and finishes with a message that depends on how well the player did. It uses `input()`, comparisons that ignore capital letters, a counter, `if`/`elif`/`else`, `match` and a `for` loop.",
    "The questions: *What is 2 + 2?* (4), *What is the capital of Italy?* (Rome) and *What colour do you get by mixing blue and yellow?* (green). Answers count whatever their capitals and spaces, so ` ROME ` is right too. When the player types 4, rome and blue, the finished game shows:",
    "```\nWhat is 2 + 2? 4\nCorrect!\nWhat is the capital of Italy? rome\nCorrect!\nWhat colour do you get by mixing blue and yellow? blue\nWrong, it was green.\nScore: 2/3 (67%)\nWell done!\n```",
    "The final message: `Perfect!` for 100%, `Well done!` for 50% or more, and `Keep practising!` below that. The percentage is rounded to a whole number with `:.0f`.",
    "Build it in steps: check one answer, ask a question, keep score, pick the final message, then put the questions in a loop. Type three answers on separate lines in the Input box to try the sandbox.",
  ],
  sandboxCode: "score = 0\nanswer = input(\"What is 2 + 2? \")\nif answer.strip() == \"4\":\n    print(\"Correct!\")\n    score += 1\nelse:\n    print(\"Wrong, it was 4.\")\nanswer = input(\"What is the capital of Italy? \")\nif answer.strip().lower() == \"rome\":\n    print(\"Correct!\")\n    score += 1\nelse:\n    print(\"Wrong, it was Rome.\")\nprint(\"Score:\", score)",
  sandboxSnippets: [
    snippet("Ignore capitals and spaces", "answer = \"  ROME \"\nprint(answer.strip().lower() == \"rome\")"),
    snippet("Keep score", "score = 0\nfor answer in [\"yes\", \"no\", \"yes\"]:\n    if answer == \"yes\":\n        score += 1\nprint(score)"),
    snippet("A percentage", "score = 2\ntotal = 3\nprint(f\"{score / total * 100:.0f}%\")"),
  ],
  challenges: [
    task("easy", "Check an answer", {
      prompt: "Set `correct` to `True` when `answer` is `rome`, whatever its capitals and spaces, and `False` otherwise.",
      starter: "answer = \"  Rome \"\n",
      hint: "Clean the answer first: `answer.strip().lower() == \"rome\"`.",
      solution: "answer = \"  Rome \"\ncorrect = answer.strip().lower() == \"rome\"",
      tests: [
        ["correct is True", "correct is True"],
      ],
    }),
    task("easy", "Ask a question", {
      prompt: "Ask `What is 2 + 2? ` and print `Correct!` when the answer is `4`, or `Wrong, it was 4.` otherwise. The check types `4`.",
      hint: "`answer = input(\"What is 2 + 2? \")`, then `if answer.strip() == \"4\":`.",
      solution: "answer = input(\"What is 2 + 2? \")\nif answer.strip() == \"4\":\n    print(\"Correct!\")\nelse:\n    print(\"Wrong, it was 4.\")",
      setup: typedInput("4"),
      tests: [
        ["Prints Correct!", "_cq_stdout.strip().splitlines()[-1] == \"Correct!\""],
      ],
    }),
    task("medium", "Keep score", {
      prompt: "Ask the three questions in order, printing `Correct!` or `Wrong, it was ...` after each, and add 1 to `score` for each right answer. The check types `4`, `Rome` and `blue`.",
      starter: "score = 0\n",
      hint: "Three blocks of ask, compare and `score += 1`. Compare `.strip().lower()` with `\"rome\"` and `\"green\"`.",
      solution: "score = 0\nanswer = input(\"What is 2 + 2? \")\nif answer.strip() == \"4\":\n    print(\"Correct!\")\n    score += 1\nelse:\n    print(\"Wrong, it was 4.\")\nanswer = input(\"What is the capital of Italy? \")\nif answer.strip().lower() == \"rome\":\n    print(\"Correct!\")\n    score += 1\nelse:\n    print(\"Wrong, it was Rome.\")\nanswer = input(\"What colour do you get by mixing blue and yellow? \")\nif answer.strip().lower() == \"green\":\n    print(\"Correct!\")\n    score += 1\nelse:\n    print(\"Wrong, it was green.\")",
      setup: typedInput("4", "Rome", "blue"),
      tests: [
        ["score is 2", "score == 2"],
        ["Says the last answer was wrong", "_cq_stdout.strip().splitlines()[-1] == \"Wrong, it was green.\""],
      ],
    }),
    task("medium", "The final message", {
      prompt: "Set `message` from `score` out of `total`: `Perfect!` for 100%, `Well done!` for 50% or more, and `Keep practising!` below that.",
      starter: "score = 2\ntotal = 3\n",
      hint: "Work out `percent = score / total * 100`, then check the highest band first with `if`/`elif`/`else`.",
      solution: "score = 2\ntotal = 3\npercent = score / total * 100\nif percent == 100:\n    message = \"Perfect!\"\nelif percent >= 50:\n    message = \"Well done!\"\nelse:\n    message = \"Keep practising!\"",
      tests: [
        ["message is Well done!", "message == \"Well done!\""],
      ],
    }),
    task("hard", "Questions in a loop", {
      prompt: "Use `for i in range(1, 4):` with `match i` to pick each question and its answer, then ask it and keep score as before. The check types `5`, `rome` and `green`.",
      starter: "score = 0\n",
      hint: "In each `case`, set `question` and `expected`. After the `match`, ask the question once and compare `answer.strip().lower()` with `expected`.",
      solution: "score = 0\nfor i in range(1, 4):\n    match i:\n        case 1:\n            question = \"What is 2 + 2? \"\n            expected = \"4\"\n        case 2:\n            question = \"What is the capital of Italy? \"\n            expected = \"rome\"\n        case 3:\n            question = \"What colour do you get by mixing blue and yellow? \"\n            expected = \"green\"\n    answer = input(question)\n    if answer.strip().lower() == expected:\n        print(\"Correct!\")\n        score += 1\n    else:\n        print(f\"Wrong, it was {expected}.\")",
      setup: typedInput("5", "rome", "green"),
      tests: [
        ["score is 2", "score == 2"],
        ["Asks the questions in order", "_cq_stdout.index(\"2 + 2\") < _cq_stdout.index(\"Italy\") < _cq_stdout.index(\"colour\")"],
        ["Asks the colour question last", "\"What colour do you get by mixing blue and yellow? green\" in _cq_stdout"],
      ],
    }),
    task("expert", "The whole quiz", {
      prompt: "Put it all together: the three questions in a loop, then `Score: 2/3 (67%)` and the final message on the last two lines. The check types `4`, `rome` and `blue`.",
      starter: "score = 0\n",
      hint: "After the loop, print `f\"Score: {score}/3 ({score / 3 * 100:.0f}%)\"`, then pick the message as in the earlier step.",
      solution: "score = 0\nfor i in range(1, 4):\n    match i:\n        case 1:\n            question = \"What is 2 + 2? \"\n            expected = \"4\"\n        case 2:\n            question = \"What is the capital of Italy? \"\n            expected = \"rome\"\n        case 3:\n            question = \"What colour do you get by mixing blue and yellow? \"\n            expected = \"green\"\n    answer = input(question)\n    if answer.strip().lower() == expected:\n        print(\"Correct!\")\n        score += 1\n    else:\n        print(f\"Wrong, it was {expected}.\")\npercent = score / 3 * 100\nprint(f\"Score: {score}/3 ({percent:.0f}%)\")\nif percent == 100:\n    print(\"Perfect!\")\nelif percent >= 50:\n    print(\"Well done!\")\nelse:\n    print(\"Keep practising!\")",
      setup: typedInput("4", "rome", "blue"),
      tests: [
        ["Prints the score", "_cq_stdout.strip().splitlines()[-2] == \"Score: 2/3 (67%)\""],
        ["Ends with Well done!", "_cq_stdout.strip().splitlines()[-1] == \"Well done!\""],
      ],
    }),
  ],
  questions: [
    mc("Why compare `answer.strip().lower()` rather than `answer`?", ["It is faster", "So `Rome`, `ROME` and ` rome ` all count", "input() needs it", "To remove numbers"], 1, "Removing spaces and ignoring case means the player isn't marked wrong for typing differently."),
    mc("Where does `score = 0` go?", ["Inside the loop", "After the loop", "Before the loop", "In every `case`"], 2, "The score is created once before the loop; inside it, it would reset every question."),
    mc("Why check `percent == 100` before `percent >= 50`?", ["100 is also >= 50, so the first matching branch must be the most specific", "Python checks from the bottom", "It does not matter", "`==` is faster"], 0, "Branches are checked top to bottom and only the first true one runs, so the specific test goes first."),
    qShort("What does `f\"{2 / 3 * 100:.0f}\"` give?", "67", "2 / 3 * 100 is 66.67, and `.0f` rounds it to no decimals."),
    mc("In `for i in range(1, 4):`, which values does `i` take?", ["0, 1, 2", "1, 2, 3, 4", "1, 2, 3", "0 to 4"], 2, "`range(1, 4)` starts at 1 and stops before 4."),
    mc("What does `match i:` with `case 2:` do?", ["Assigns 2 to `i`", "Runs that block when `i` is 2", "Loops twice", "Compares two strings"], 1, "A `case` with a literal value runs when the value matches it."),
  ],
})
