// Fundamentals topic: Printing output. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "printing",
  title: "Printing output",
  paragraphs: [
    "`print()` is how your program talks to you, and it has a few options worth knowing. Give it several values separated by commas and it prints them on one line, with a space between each: `print(\"Score:\", 42)` shows `Score: 42`. That's an easy way to mix text and numbers.",
    "`sep` changes what goes **between** the values, and `end` changes what comes **after** the last one, which is normally a new line. With `end=\"\"` the next `print` carries on the same line.",
    "```\nprint(\"a\", \"b\", \"c\", sep=\"-\")   # a-b-c\nprint(\"Loading\", end=\"\")\nprint(\"...\")                    # Loading...\n```",
    "Inside text, a backslash starts an **escape sequence**: `\\n` is a new line and `\\t` is a tab, which jumps to the next column. So a single `print` can show several lines: `print(\"Line 1\\nLine 2\")`. To print a backslash itself, write two: `\\\\`.",
    "Text can be written with double quotes `\"...\"` or single quotes `'...'`. To show one kind of quote, wrap the text in the other kind: `print('She said \"hi\"')` and `print(\"It's sunny\")`. You can also escape a quote with a backslash: `print(\"She said \\\"hi\\\"\")`.",
    "`print()` with nothing inside prints an empty line, which is handy for spacing out output. For text over several lines, triple quotes keep the line breaks exactly as you type them:",
    "```\nprint(\"\"\"Shopping list:\n- apples\n- bread\"\"\")\n```",
    "`print` shows values as plain text: `print(\"hi\")` shows `hi` without quotes. When you need to see exactly what a value is, `repr()` shows it the way you'd write it in code: `print(repr(\"hi\"))` shows `'hi'`, quotes included. That makes stray spaces easy to spot, because `repr(\" hi \")` is `' hi '`.",
  ],
  sandboxCode: "print(\"Score:\", 42)\nprint(2026, 10, 16, sep=\"-\")\nprint(\"Loading\", end=\"\")\nprint(\"...\")\nprint(\"Name:\\tAna\\nCity:\\tOslo\")",
  sandboxSnippets: [
    snippet("Several values", "print(\"Ana\", \"is\", 30, \"years old\")\nprint(\"Total:\", 4 + 5)"),
    snippet("sep and end", "print(\"red\", \"green\", \"blue\", sep=\", \")\nprint(\"No new line here\", end=\" \")\nprint(\"<- this follows on\")"),
    snippet("Escapes", "print(\"Line 1\\nLine 2\")\nprint(\"Name:\\tAna\")\nprint(\"A backslash: \\\\\")"),
    snippet("Quotes", "print('She said \"hi\"')\nprint(\"It's sunny\")\nprint(\"Escaped: \\\"quoted\\\"\")"),
    snippet("repr", "print(\" padded \")\nprint(repr(\" padded \"))\nprint(repr(42), repr(\"42\"))"),
  ],
  readMore: { label: "Python docs: the print() function", url: "https://docs.python.org/3/library/functions.html#print", source: "Python docs" },
  challenges: [
    task("easy", "Mix text and numbers", {
      prompt: "Use one `print` with two values to show `Level: 3`. Write `3` as a number, not as text.",
      starter: "print()",
      hint: "Separate the values with a comma: the text `\"Level:\"` and the number `3`. `print` adds the space for you.",
      solution: "print(\"Level:\", 3)",
      tests: [
        ["Prints Level: 3", "_cq_stdout.strip() == \"Level: 3\""],
      ],
    }),
    task("easy", "An empty line", {
      prompt: "Print `Top`, then an empty line, then `Bottom`.",
      starter: "print(\"Top\")\n",
      hint: "`print()` with nothing inside prints an empty line.",
      solution: "print(\"Top\")\nprint()\nprint(\"Bottom\")",
      tests: [
        ["Prints Top, an empty line and Bottom", "_cq_stdout == \"Top\\n\\nBottom\\n\""],
      ],
    }),
    task("easy", "A date with sep", {
      prompt: "Print the numbers `2026`, `10` and `16` as `2026-10-16`, using one `print` and `sep`.",
      starter: "print(2026, 10, 16)",
      hint: "Add `sep=\"-\"` after the values, inside the brackets.",
      solution: "print(2026, 10, 16, sep=\"-\")",
      tests: [
        ["Prints 2026-10-16", "_cq_stdout.strip() == \"2026-10-16\""],
      ],
    }),
    task("medium", "Stay on the same line", {
      prompt: "Change the first `print` so the output is one line: `Loading... done`",
      starter: "print(\"Loading\")\nprint(\"done\")",
      hint: "Use `end` on the first print. Whatever you give `end` is printed instead of the new line, so `end=\"... \"` puts the dots and a space before `done`.",
      solution: "print(\"Loading\", end=\"... \")\nprint(\"done\")",
      tests: [
        ["Prints Loading... done", "_cq_stdout.strip() == \"Loading... done\""],
      ],
    }),
    task("medium", "Quotes inside text", {
      prompt: "Print exactly: `She said \"Python is fun\"`",
      starter: "print()",
      hint: "Wrap the text in single quotes, so the double quotes inside are just characters.",
      solution: "print('She said \"Python is fun\"')",
      tests: [
        ["Prints the quote", "_cq_stdout.strip() == 'She said \"Python is fun\"'"],
      ],
    }),
    task("medium", "Two lines, one print", {
      prompt: "Use a single `print` with `\\n` to show `Name: Ana` on one line and `Age: 30` on the next.",
      starter: "print()",
      hint: "Put `\\n` where the new line should start: `\"Name: Ana\\nAge: 30\"`.",
      solution: "print(\"Name: Ana\\nAge: 30\")",
      tests: [
        ["Prints two lines", "_cq_stdout.strip().splitlines() == [\"Name: Ana\", \"Age: 30\"]"],
      ],
    }),
    task("hard", "Columns with tabs", {
      prompt: "Print this two-row table, with a tab (`\\t`) between the columns:\n\n```\nItem\tPrice\nTea\t2.50\n```\n\nWrite the price as text, so the trailing zero stays.",
      starter: "print(\"Item\\tPrice\")\n",
      hint: "The second row is like the first: `print(\"Tea\\t2.50\")`.",
      solution: "print(\"Item\\tPrice\")\nprint(\"Tea\\t2.50\")",
      tests: [
        ["Prints both rows with tabs", "_cq_stdout == \"Item\\tPrice\\nTea\\t2.50\\n\""],
      ],
    }),
    task("hard", "A Windows path", {
      prompt: "Print this file path exactly: `C:\\Users\\Ana\\notes.txt`",
      starter: "print(\"C:\\Users\\Ana\\notes.txt\")",
      hint: "Each backslash starts an escape sequence: `\\U` here even stops the program with an error, and `\\n` would start a new line. Write every backslash twice: `\\\\`.",
      solution: "print(\"C:\\\\Users\\\\Ana\\\\notes.txt\")",
      tests: [
        ["Prints the path", "_cq_stdout.strip() == \"C:\\\\Users\\\\Ana\\\\notes.txt\""],
      ],
    }),
    task("expert", "A triangle", {
      prompt: "Using a single `print`, draw this triangle. Mind the spaces at the start of the first two lines.\n\n```\n  *\n ***\n*****\n```",
      starter: "print()",
      hint: "Use `\\n` between the rows: two spaces and a star, then one space and three stars, then five stars.",
      solution: "print(\"  *\\n ***\\n*****\")",
      tests: [
        ["Draws the triangle", "_cq_stdout == \"  *\\n ***\\n*****\\n\""],
      ],
    }),
    task("expert", "Show the spaces", {
      prompt: "Print the text ` hi ` (with a space before and after) using `repr`, so that the output shows the quotes and the spaces: `' hi '`",
      starter: "print(\" hi \")",
      hint: "Wrap the text in `repr(...)` inside the `print`.",
      solution: "print(repr(\" hi \"))",
      tests: [
        ["Prints ' hi '", "_cq_stdout.strip() == \"' hi '\""],
      ],
    }),
  ],
  questions: [
    mc("What does `print(\"a\", \"b\")` show?", ["ab", "a b", "a,b", "\"a\" \"b\""], 1),
    qShort("Which `print` argument changes what goes between the values? (name only)", "sep"),
    qShort("Which `print` argument changes what is printed at the very end, normally a new line? (name only)", "end"),
    mc("What does `print(\"x\", end=\"\")` change?", ["Nothing is printed", "The next print carries on the same line", "x is printed twice", "The quotes are printed"], 1),
    mc("What does `\\n` inside text do?", ["Prints a backslash and an n", "Adds a tab", "Ends the program", "Starts a new line"], 3),
    mc("How do you print `It's here`?", ["`print('It's here')`", "`print(\"It's here\")`", "`print(It's here)`", "`print(It's \"here\")`"], 1),
    mc("What does `print()` with nothing inside do?", ["Raises an error", "Prints None", "Prints an empty line", "Nothing at all"], 2),
    mc("What does `print(\"A\", \"B\", sep=\"\")` show?", ["AB", "A B", "A,B", "A\"\"B"], 0),
    mc("Which prints a single backslash?", ["`print(\"\\\\\")`", "`print(\"\\\")`", "`print(/)`", "`print(\"//\")`"], 0),
    mc("What does `print(repr(\"hi\"))` show?", ["hi", "'hi'", "repr(hi)", "\"repr\""], 1),
  ],
})
