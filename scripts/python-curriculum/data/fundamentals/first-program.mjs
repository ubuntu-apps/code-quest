// Fundamentals topic: Your first program. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "first_program",
  title: "Your first program",
  paragraphs: [
    "Python is a programming language: a way to write instructions a computer can follow. It reads almost like English, which makes it a popular first language, and it's used everywhere, from websites and games to data analysis, science and AI.",
    "A Python program is a list of instructions that run from top to bottom, one line at a time. In CodeQuest you type code into the sandbox or a challenge, press **Run** or **Check**, and Python runs right here in your browser.",
    "Your first instruction is `print()`. Whatever you put inside the brackets is shown as output. Text goes in quotes, so Python knows it is text and not code. Numbers and maths don't need quotes.",
    "```\nprint(\"Hello, world!\")\nprint(42)\nprint(2 + 3)\n```",
    "Each `print()` writes one line. The quotes make all the difference: `print(\"2 + 3\")` shows the text `2 + 3`, while `print(2 + 3)` works out the sum and shows `5`. You can also give `print` several things separated by commas, and it shows them with a space between: `print(\"2 + 3 =\", 2 + 3)` shows `2 + 3 = 5`.",
    "Lines that start with `#` are **comments**. Python skips them; they are notes for the people who read the code. A comment can also go at the end of a line.",
    "```\n# Say hello\nprint(\"Hi!\")  # this line prints Hi!\n```",
    "Mistakes are normal, and Python tells you about them. When it can't run your code, it stops and shows an **error message**. Read the last line first. `SyntaxError` means the code isn't written correctly, such as a missing bracket or quote. `NameError: name 'pritn' is not defined` means Python doesn't know a name, usually because of a typo.",
    "Python is case-sensitive: `print` works, `Print` doesn't. Spelling matters exactly in the text you print too, because the challenges compare your output character by character.",
  ],
  sandboxCode: "print(\"Hello, world!\")\nprint(42)\nprint(2 + 3)\nprint(\"2 + 3\")\nprint(\"2 + 3 =\", 2 + 3)",
  sandboxSnippets: [
    snippet("Hello", "print(\"Hello, world!\")\nprint(\"I'm learning Python.\")"),
    snippet("Numbers and maths", "print(7)\nprint(6 * 7)\nprint(100 - 1)"),
    snippet("Text or maths?", "print(\"6 * 7\")\nprint(6 * 7)\nprint(\"6 * 7 =\", 6 * 7)"),
    snippet("Comments", "# This whole line is a comment\nprint(\"Comments are skipped\")  # and so is this part"),
    snippet("Read an error", "# Run this and read the last line of the error.\n# Then fix the typo and run it again.\npritn(\"Hello\")"),
  ],
  readMore: { label: "Python tutorial: an informal introduction", url: "https://docs.python.org/3/tutorial/introduction.html", source: "Python docs" },
  challenges: [
    task("easy", "Say hello", {
      prompt: "Print exactly `Hello, world!`",
      starter: "print()",
      hint: "Put the text in quotes inside the brackets: `print(\"...\")`.",
      solution: "print(\"Hello, world!\")",
      tests: [
        ["Prints Hello, world!", "_cq_stdout.strip() == \"Hello, world!\""],
      ],
    }),
    task("easy", "Print a number", {
      prompt: "Print the number `2026`.",
      starter: "print()",
      hint: "Numbers don't need quotes: `print(2026)`.",
      solution: "print(2026)",
      tests: [
        ["Prints 2026", "_cq_stdout.strip() == \"2026\""],
      ],
    }),
    task("easy", "Two lines", {
      prompt: "Print `Ready` on one line and `Set` on the next.",
      starter: "print(\"Ready\")\n",
      hint: "Each `print()` writes its own line, so you need a second `print`.",
      solution: "print(\"Ready\")\nprint(\"Set\")",
      tests: [
        ["Prints Ready, then Set", "_cq_stdout.strip().splitlines() == [\"Ready\", \"Set\"]"],
      ],
    }),
    task("medium", "Let Python do the maths", {
      prompt: "How many hours are in a year? Print the result of 365 days times 24 hours. Let Python work it out: use `*` for multiplication.",
      starter: "print()",
      hint: "Put the calculation inside the brackets, without quotes: `print(365 * 24)`.",
      solution: "print(365 * 24)",
      tests: [
        ["Prints 8760", "_cq_stdout.strip() == \"8760\""],
      ],
    }),
    task("medium", "Text and maths together", {
      prompt: "Print `7 + 8 = 15`. Write the first part as text and let Python calculate the `15`.",
      starter: "print()",
      hint: "Give `print` two things, separated by a comma: the text `\"7 + 8 =\"` and the sum `7 + 8`.",
      solution: "print(\"7 + 8 =\", 7 + 8)",
      tests: [
        ["Prints 7 + 8 = 15", "_cq_stdout.strip() == \"7 + 8 = 15\""],
      ],
    }),
    task("medium", "Fix the capital letter", {
      prompt: "This line fails. Run it, read the error, then fix it so it prints `Welcome`.",
      starter: "Print(\"Welcome\")",
      hint: "Python is case-sensitive. The function is called `print`, all lowercase.",
      solution: "print(\"Welcome\")",
      tests: [
        ["Prints Welcome", "_cq_stdout.strip() == \"Welcome\""],
      ],
    }),
    task("hard", "Fix the quotes", {
      prompt: "This line has a `SyntaxError`. Fix it so it prints `Python is fun`.",
      starter: "print(\"Python is fun)",
      hint: "Text needs a quote at both ends. One is missing before the closing bracket.",
      solution: "print(\"Python is fun\")",
      tests: [
        ["Prints Python is fun", "_cq_stdout.strip() == \"Python is fun\""],
      ],
    }),
    task("hard", "Comment it out", {
      prompt: "Turn the middle line into a comment, so only the other two lines are printed. Don't delete it.",
      starter: "print(\"Keep me\")\nprint(\"Skip me\")\nprint(\"Keep me too\")",
      hint: "Put `#` at the start of the middle line. Python skips everything after a `#`.",
      solution: "print(\"Keep me\")\n# print(\"Skip me\")\nprint(\"Keep me too\")",
      tests: [
        ["Prints only the first and last lines", "_cq_stdout.strip().splitlines() == [\"Keep me\", \"Keep me too\"]"],
      ],
    }),
    task("expert", "Seconds in a week", {
      prompt: "Print `Seconds in a week: 604800`. Let Python calculate the number from 7 days, 24 hours, 60 minutes and 60 seconds.",
      starter: "print()",
      hint: "Multiply all four numbers: `7 * 24 * 60 * 60`. Give `print` the text and the calculation, separated by a comma.",
      solution: "print(\"Seconds in a week:\", 7 * 24 * 60 * 60)",
      tests: [
        ["Prints the right line", "_cq_stdout.strip() == \"Seconds in a week: 604800\""],
      ],
    }),
    task("expert", "Fix three mistakes", {
      prompt: "This program has three mistakes. Fix them all so it prints:\n\n```\nWelcome to CodeQuest\nLessons: 10\nHave fun!\n```",
      starter: "# A short welcome\npritn(\"Welcome to CodeQuest\")\nprint(\"Lessons:\" 10)\nprint('Have fun!\")",
      hint: "Fix one error at a time and run again: a misspelled name, a missing comma between two things in `print`, and quotes that don't match.",
      solution: "# A short welcome\nprint(\"Welcome to CodeQuest\")\nprint(\"Lessons:\", 10)\nprint(\"Have fun!\")",
      tests: [
        ["Prints all three lines", "_cq_stdout.strip().splitlines() == [\"Welcome to CodeQuest\", \"Lessons: 10\", \"Have fun!\"]"],
      ],
    }),
  ],
  questions: [
    mc("What does `print(\"2 + 3\")` show?", ["`5`","`2 + 3`","An error","`\"2 + 3\"`"], 1),
    mc("What does `print(2 + 3)` show?", ["`2 + 3`","`23`","`5`","Nothing"], 2),
    qShort("Which function shows output on the screen? (name only)", "print"),
    mc("Why does the text need quotes in `print(\"Hi\")`?", ["So Python knows it is text, not code", "Quotes make the text bold", "Every value needs quotes", "They are optional"], 0),
    mc("What does Python do with a line that starts with `#`?", ["Prints it", "Skips it, because it is a comment", "Shows it as a heading", "Raises an error"], 1),
    mc("Why does `Print(\"Hi\")` fail?", ["Text must use single quotes","Python is case-sensitive: `Print` is not `print`","`print` needs two values","`Hi` should be a number"], 1),
    mc("You forgot the closing quote in `print(\"Hi)`. Which error do you get?", ["`NameError`","`TypeError`","`SyntaxError`","`ValueError`"], 2),
    mc("`pritn(\"Hi\")` gives `NameError: name 'pritn' is not defined`. What is wrong?", ["The text needs single quotes","The function name is misspelled","Python is not installed","`Hi` should be in capitals"], 1),
    mc("In which order does Python run the lines of a program?", ["Top to bottom", "Bottom to top", "Shortest line first", "In random order"], 0),
    mc("What does `print(\"Total:\", 10 + 5)` show?", ["`Total: 10 + 5`","`Total:15`","`Total: 15`","`\"Total:\" 15`"], 2),
  ],
})
