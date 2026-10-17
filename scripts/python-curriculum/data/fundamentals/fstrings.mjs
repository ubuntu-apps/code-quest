// Fundamentals topic: f-strings and formatting. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "fstrings",
  title: "f-strings and formatting",
  paragraphs: [
    "Building text out of pieces with `+` and `str()` gets messy quickly. An **f-string** is much neater: put an `f` in front of the opening quote, and write any variable or expression inside `{curly braces}`. Python replaces each one with its value.",
    "```\nname = \"Ana\"\nage = 30\nprint(f\"{name} is {age} years old.\")   # Ana is 30 years old.\nprint(f\"Next year: {age + 1}\")          # Next year: 31\n```",
    "Anything that gives a value can go inside the braces: maths, method calls, indexes, as in `f\"{name.upper()} has {len(name)} letters\"`. Without the `f`, the braces are just printed as they are.",
    "After the value, a colon starts a **format spec** that controls how the value looks. `:.2f` shows a number with exactly 2 decimals, which is perfect for money: `f\"{4.5:.2f}\"` is `4.50`. `:,` adds thousands separators: `f\"{1234567:,}\"` is `1,234,567`. They can be combined: `f\"{1234.5:,.2f}\"` is `1,234.50`.",
    "`:%` shows a fraction as a percentage, so `f\"{0.256:.1%}\"` is `25.6%`.",
    "A number after the colon sets a **width**: the value is padded with spaces to that many characters, which lines up columns. `<`, `>` and `^` align the value to the left, right or centre. Inside an f-string, write text values with the other kind of quote, as in `{'Item':<8}`:",
    "```\nprint(f\"{'Item':<8}{'Price':>8}\")\nprint(f\"{'Tea':<8}{2.5:>8.2f}\")\nprint(f\"{'Cake':<8}{12:>8.2f}\")\n```",
    "Writing `{value=}` shows both the expression and its value, a quick way to check what your variables hold: `f\"{age=}\"` gives `age=30`. To show a real curly brace, double it: `f\"{{x}}\"` prints `{x}`.",
  ],
  sandboxCode: "name = \"Ana\"\nbalance = 1234.5\nprint(f\"Hello, {name}! Your balance is ${balance:,.2f}.\")\nprint(f\"{name=}, {len(name)=}\")\nprint(f\"{0.256:.1%}\")",
  sandboxSnippets: [
    snippet("Values in text", "city = \"Oslo\"\ntemp = 4\nprint(f\"It is {temp} degrees in {city}.\")"),
    snippet("Expressions", "a, b = 6, 7\nprint(f\"{a} x {b} = {a * b}\")\nprint(f\"{'shout'.upper()}!\")"),
    snippet("Decimals and commas", "price = 7.5\nprint(f\"{price:.2f}\")\nprint(f\"{8336817:,}\")\nprint(f\"{1234.5:,.2f}\")"),
    snippet("Columns", "print(f\"{'Name':<10}{'Score':>5}\")\nprint(f\"{'Ana':<10}{95:>5}\")\nprint(f\"{'Bob':<10}{8:>5}\")"),
    snippet("Debug with =", "x = 7\ny = x * 3\nprint(f\"{x=} {y=}\")"),
  ],
  readMore: { label: "Python tutorial: formatted string literals", url: "https://docs.python.org/3/tutorial/inputoutput.html#formatted-string-literals", source: "Python docs" },
  challenges: [
    task("easy", "Fill in the gaps", {
      prompt: "Use an f-string to print `Sam likes chess.` from the variables.",
      starter: "name = \"Sam\"\nhobby = \"chess\"\n",
      hint: "Start the text with `f` and put the names in braces: `f\"{name} likes {hobby}.\"`.",
      solution: "name = \"Sam\"\nhobby = \"chess\"\nprint(f\"{name} likes {hobby}.\")",
      tests: [
        ["Prints Sam likes chess.", "_cq_stdout.strip() == \"Sam likes chess.\""],
      ],
    }),
    task("easy", "Maths in the braces", {
      prompt: "Print `8 pieces of fruit`, working out the 8 inside the f-string from the two variables.",
      starter: "apples = 3\npears = 5\n",
      hint: "An expression can go in the braces: `{apples + pears}`.",
      solution: "apples = 3\npears = 5\nprint(f\"{apples + pears} pieces of fruit\")",
      tests: [
        ["Prints 8 pieces of fruit", "_cq_stdout.strip() == \"8 pieces of fruit\""],
      ],
    }),
    task("easy", "Two decimals", {
      prompt: "Print `Price: 7.50` from `price`, always with two decimals.",
      starter: "price = 7.5\n",
      hint: "Add `:.2f` after the variable name inside the braces.",
      solution: "price = 7.5\nprint(f\"Price: {price:.2f}\")",
      tests: [
        ["Prints Price: 7.50", "_cq_stdout.strip() == \"Price: 7.50\""],
      ],
    }),
    task("medium", "Thousands separators", {
      prompt: "Print `Population: 8,336,817` from `population`.",
      starter: "population = 8336817\n",
      hint: "`:,` adds the commas: `{population:,}`.",
      solution: "population = 8336817\nprint(f\"Population: {population:,}\")",
      tests: [
        ["Prints the population", "_cq_stdout.strip() == \"Population: 8,336,817\""],
      ],
    }),
    task("medium", "As a percentage", {
      prompt: "Print `Score: 85.0%` from `correct` and `total`.",
      starter: "correct = 17\ntotal = 20\n",
      hint: "Divide inside the braces and format with one decimal as a percentage: `{correct / total:.1%}`.",
      solution: "correct = 17\ntotal = 20\nprint(f\"Score: {correct / total:.1%}\")",
      tests: [
        ["Prints Score: 85.0%", "_cq_stdout.strip() == \"Score: 85.0%\""],
      ],
    }),
    task("medium", "Store, don't print", {
      prompt: "Set `report` to the text `Oslo: 4.3°C` (one decimal) using an f-string. Don't print it.",
      starter: "city = \"Oslo\"\ntemp = 4.27\n",
      hint: "An f-string is just a string, so you can assign it: `report = f\"{city}: {temp:.1f}°C\"`.",
      solution: "city = \"Oslo\"\ntemp = 4.27\nreport = f\"{city}: {temp:.1f}°C\"",
      tests: [
        ["report is Oslo: 4.3°C", "report == \"Oslo: 4.3°C\""],
      ],
    }),
    task("hard", "The missing f", {
      prompt: "`message` should say `Well done Lee, you scored 92!`, but the braces are shown as they are. Fix it.",
      starter: "name = \"Lee\"\nscore = 92\nmessage = \"Well done {name}, you scored {score}!\"\nprint(message)",
      hint: "An f-string needs the `f` before the opening quote.",
      solution: "name = \"Lee\"\nscore = 92\nmessage = f\"Well done {name}, you scored {score}!\"\nprint(message)",
      tests: [
        ["message is filled in", "message == \"Well done Lee, you scored 92!\""],
      ],
    }),
    task("hard", "Line up a table", {
      prompt: "Print the two rows below the heading, using the same widths: names left-aligned in 10 characters and scores right-aligned in 5. The output should be:\n\n```\nName      Score\nAna          95\nBob           8\n```",
      starter: "name1, score1 = \"Ana\", 95\nname2, score2 = \"Bob\", 8\nprint(f\"{'Name':<10}{'Score':>5}\")\n",
      hint: "Each row is like the heading but with the variables: `f\"{name1:<10}{score1:>5}\"`.",
      solution: "name1, score1 = \"Ana\", 95\nname2, score2 = \"Bob\", 8\nprint(f\"{'Name':<10}{'Score':>5}\")\nprint(f\"{name1:<10}{score1:>5}\")\nprint(f\"{name2:<10}{score2:>5}\")",
      tests: [
        ["Prints the table", "_cq_stdout == \"Name      Score\\nAna          95\\nBob           8\\n\""],
      ],
    }),
    task("expert", "A receipt line", {
      prompt: "Print `4 x Notebook = $14.00`, working out the total from the variables.",
      starter: "item = \"Notebook\"\nprice = 3.5\nqty = 4\n",
      hint: "Put the quantity, the item and the total `price * qty` in braces, and format the total with `:.2f`. The `$` is ordinary text.",
      solution: "item = \"Notebook\"\nprice = 3.5\nqty = 4\nprint(f\"{qty} x {item} = ${price * qty:.2f}\")",
      tests: [
        ["Prints 4 x Notebook = $14.00", "_cq_stdout.strip() == \"4 x Notebook = $14.00\""],
      ],
    }),
    task("expert", "A progress bar", {
      prompt: "Set `bar` to a progress bar like `[#######.............] 35%`: one `#` per task done, one `.` per task left, then the percentage with no decimals.",
      starter: "done = 7\ntotal = 20\n",
      hint: "Inside the brackets: `\"#\" * done` and `\".\" * (total - done)`. The percentage is `{done / total:.0%}`. Use single quotes for the `#` and `.` inside the f-string.",
      solution: "done = 7\ntotal = 20\nbar = f\"[{'#' * done}{'.' * (total - done)}] {done / total:.0%}\"",
      tests: [
        ["bar is right", "bar == \"[#######.............] 35%\""],
      ],
    }),
  ],
  questions: [
    mc("What does `f\"{2 + 3}\"` give?", ["`{2 + 3}`","`5`","`2 + 3`","`f5`"], 1),
    mc("What happens without the `f`, as in `\"Hi {name}\"`?", ["The text shows `{name}` as it is","Python still fills in the name","A `SyntaxError`","Nothing is printed"], 0),
    mc("What does `f\"{3.14159:.2f}\"` give?", ["`3.1`","`3.14159`","`3.14`","`3`"], 2),
    mc("What does `f\"{1500000:,}\"` give?", ["`1500000`","`1,500,000`","`1.500.000`","`1_500_000`"], 1),
    qShort("Which letter goes before the opening quote to make an f-string? (one letter)", "f"),
    mc("What does `f\"{0.5:.0%}\"` give?", ["`0.5%`","`50%`","`5%`","`0%`"], 1),
    mc("Which right-aligns `x` in a column 10 characters wide?", ["`{x:<10}`", "`{x:^10}`", "`{x:>10}`", "`{x:10}` always"], 2),
    mc("With `age = 30`, what does `f\"{age=}\"` show?", ["`30`","`age=30`","`{age=}`","`age: 30`"], 1),
    mc("How do you show a real `{` in an f-string?", ["`\\{`", "`{ }`", "You can't", "`{{`"], 3),
    mc("Why use `:.2f` for prices?", ["It rounds down", "It always shows exactly 2 decimals, like 4.50", "It adds a $ sign", "It turns the number into an int"], 1),
  ],
})
