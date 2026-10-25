// Decisions and loops topic: if, elif and else. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task, typedInput } from '../_builders.mjs'

export default makeTopic({
  id: "if_elif_else",
  title: "if, elif and else",
  paragraphs: [
    "Now your programs can act on their decisions. An `if` statement runs a block of code only when its condition is true. The line ends with a colon, and the lines that belong to it are **indented** by four spaces:",
    "```\ntemperature = 31\nif temperature > 30:\n    print(\"It's hot!\")\n    print(\"Drink some water.\")\nprint(\"Done\")\n```",
    "Indentation isn't decoration in Python: it's how Python knows which lines are inside the `if`. Here both indented lines run only when it's hot, while `print(\"Done\")` always runs. A missing indent gives an `IndentationError`.",
    "`else` adds a block for when the condition is false. `elif` (short for \"else if\") adds more conditions in between. Python checks them from the top and runs **only the first** block whose condition is true; `else` catches everything left over.",
    "```\nscore = 85\nif score >= 90:\n    grade = \"A\"\nelif score >= 80:\n    grade = \"B\"\nelif score >= 70:\n    grade = \"C\"\nelse:\n    grade = \"F\"\nprint(grade)   # B\n```",
    "Because only the first match runs, **order matters**. If the check `score >= 70` came first, a score of 95 would stop there and get a C. Put the most specific conditions first.",
    "A condition can be anything that is truthy or falsy. `if name:` runs when `name` isn't empty, which is a common way to check that someone typed something. If a block should do nothing for now, write `pass` in it, because Python doesn't allow empty blocks.",
    "For a simple either-or value, there's a one-line form, the **conditional expression**: `label = \"even\" if n % 2 == 0 else \"odd\"`. It reads almost like English. Keep longer decisions in a normal `if`.",
    "`if` statements can contain other `if` statements (nesting), but deep nesting gets hard to read. Often `and` or `elif` says the same thing more simply.",
  ],
  sandboxCode: "temperature = 31\nif temperature > 30:\n    print(\"It's hot!\")\nelif temperature > 15:\n    print(\"It's mild.\")\nelse:\n    print(\"It's cold!\")\n\nn = 7\nprint(\"even\" if n % 2 == 0 else \"odd\")",
  sandboxSnippets: [
    snippet("if", "age = 20\nif age >= 18:\n    print(\"You can vote.\")\nprint(\"Thanks for checking!\")"),
    snippet("if and else", "n = 7\nif n % 2 == 0:\n    print(n, \"is even\")\nelse:\n    print(n, \"is odd\")"),
    snippet("elif chain", "score = 72\nif score >= 90:\n    print(\"A\")\nelif score >= 80:\n    print(\"B\")\nelif score >= 70:\n    print(\"C\")\nelse:\n    print(\"F\")"),
    snippet("Truthiness", "name = \"\"\nif name:\n    print(\"Hello,\", name)\nelse:\n    print(\"You didn't type a name.\")"),
    snippet("One-line form", "stock = 0\nmessage = \"In stock\" if stock > 0 else \"Sold out\"\nprint(message)"),
  ],
  readMore: { label: "Python tutorial: if statements", url: "https://docs.python.org/3/tutorial/controlflow.html#if-statements", source: "Python docs" },
  challenges: [
    task("easy", "A hot day", {
      prompt: "Print `Hot day` if `temperature` is above 30.",
      starter: "temperature = 31\n",
      hint: "`if temperature > 30:` and, on the next line, indented by four spaces, `print(\"Hot day\")`.",
      solution: "temperature = 31\nif temperature > 30:\n    print(\"Hot day\")",
      tests: [
        ["Prints Hot day", "_cq_stdout.strip() == \"Hot day\""],
      ],
    }),
    task("easy", "Even or odd", {
      prompt: "Print `even` or `odd` for `n`, using `if` and `else`.",
      starter: "n = 7\n",
      hint: "A number is even when `n % 2 == 0`.",
      solution: "n = 7\nif n % 2 == 0:\n    print(\"even\")\nelse:\n    print(\"odd\")",
      tests: [
        ["Prints odd", "_cq_stdout.strip() == \"odd\""],
      ],
    }),
    task("easy", "Fix the indentation", {
      prompt: "This fails with an `IndentationError`. Fix it so it prints `Adult`.",
      starter: "age = 20\nif age >= 18:\nprint(\"Adult\")",
      hint: "The line inside the `if` needs four spaces in front of it.",
      solution: "age = 20\nif age >= 18:\n    print(\"Adult\")",
      tests: [
        ["Prints Adult", "_cq_stdout.strip() == \"Adult\""],
      ],
    }),
    task("medium", "Letter grade", {
      prompt: "Set `grade` for `score`: `A` for 90 or more, `B` for 80 or more, `C` for 70 or more, and `F` otherwise.",
      starter: "score = 85\n",
      hint: "Use `if`, two `elif`s and an `else`, highest grade first.",
      solution: "score = 85\nif score >= 90:\n    grade = \"A\"\nelif score >= 80:\n    grade = \"B\"\nelif score >= 70:\n    grade = \"C\"\nelse:\n    grade = \"F\"",
      tests: [
        ["grade is B", "grade == \"B\""],
      ],
    }),
    task("medium", "Positive, negative or zero", {
      prompt: "Print `positive`, `negative` or `zero` for `n`.",
      starter: "n = -4\n",
      hint: "Three cases: `if n > 0`, `elif n < 0`, and `else` for zero.",
      solution: "n = -4\nif n > 0:\n    print(\"positive\")\nelif n < 0:\n    print(\"negative\")\nelse:\n    print(\"zero\")",
      tests: [
        ["Prints negative", "_cq_stdout.strip() == \"negative\""],
      ],
    }),
    task("medium", "Ticket price", {
      prompt: "Set `price` for `age`: under 3 is free (0), under 12 costs 8, under 65 costs 15, and 65 or older costs 10.",
      starter: "age = 10\n",
      hint: "Check from the youngest up: `if age < 3`, `elif age < 12`, `elif age < 65`, `else`.",
      solution: "age = 10\nif age < 3:\n    price = 0\nelif age < 12:\n    price = 8\nelif age < 65:\n    price = 15\nelse:\n    price = 10",
      tests: [
        ["price is 8", "price == 8"],
      ],
    }),
    task("medium", "Did they type anything?", {
      prompt: "Set `greeting` to `Hello, <name>!` when `name` isn't empty, and to `Who are you?` when it is. Use the name itself as the condition (`if name:`), not a comparison.",
      starter: "name = \"\"\n",
      hint: "Empty text is falsy, so `if name:` is false for `\"\"` and true for any other text.",
      solution: "name = \"\"\nif name:\n    greeting = f\"Hello, {name}!\"\nelse:\n    greeting = \"Who are you?\"",
      tests: [
        ["greeting is Who are you?", "greeting == \"Who are you?\""],
      ],
    }),
    task("hard", "Order matters", {
      prompt: "A score of 90 or more should give `distinction`, 50 or more `pass`, and anything else `fail`. A score of 95 gets `pass` here. Fix the order.",
      starter: "score = 95\nif score >= 50:\n    result = \"pass\"\nelif score >= 90:\n    result = \"distinction\"\nelse:\n    result = \"fail\"\nprint(result)",
      hint: "Only the first true condition runs. Check `score >= 90` before `score >= 50`.",
      solution: "score = 95\nif score >= 90:\n    result = \"distinction\"\nelif score >= 50:\n    result = \"pass\"\nelse:\n    result = \"fail\"\nprint(result)",
      tests: [
        ["result is distinction", "result == \"distinction\""],
      ],
    }),
    task("hard", "In one line", {
      prompt: "Set `label` to `even` or `odd` for `n`, in a single line, with a conditional expression.",
      starter: "n = 12\n",
      hint: "`label = \"even\" if n % 2 == 0 else \"odd\"`.",
      solution: "n = 12\nlabel = \"even\" if n % 2 == 0 else \"odd\"",
      tests: [
        ["label is even", "label == \"even\""],
      ],
    }),
    task("expert", "Log in", {
      prompt: "Ask `Username: ` and `Password: `. Print `Welcome!` if they are `admin` and `python123`, `Wrong password` if only the username is right, and `Unknown user` otherwise. The check types `admin` and `letmein`.",
      hint: "Read both answers first. Then `if` both are right, `elif` the username is right, `else` unknown.",
      solution: "username = input(\"Username: \")\npassword = input(\"Password: \")\nif username == \"admin\" and password == \"python123\":\n    print(\"Welcome!\")\nelif username == \"admin\":\n    print(\"Wrong password\")\nelse:\n    print(\"Unknown user\")",
      setup: typedInput("admin", "letmein"),
      tests: [
        ["Prints Wrong password", "_cq_stdout.strip().splitlines()[-1] == \"Wrong password\""],
      ],
    }),
    task("expert", "Shipping cost", {
      prompt: "Set `cost`: parcels up to 1 kg cost 5, up to 5 kg cost 10, and heavier ones 20. Express delivery doubles the price. Then print `Shipping: $20`.",
      starter: "weight = 3.5\nexpress = True\n",
      hint: "Work out the base price with `if`/`elif`/`else`, then a separate `if express:` doubles it.",
      solution: "weight = 3.5\nexpress = True\nif weight <= 1:\n    cost = 5\nelif weight <= 5:\n    cost = 10\nelse:\n    cost = 20\nif express:\n    cost = cost * 2\nprint(f\"Shipping: ${cost}\")",
      tests: [
        ["cost is 20", "cost == 20"],
        ["Prints Shipping: $20", "_cq_stdout.strip() == \"Shipping: $20\""],
      ],
    }),
  ],
  questions: [
    mc("What must end the `if` line?", ["A colon `:`", "A semicolon `;`", "A full stop", "Nothing"], 0),
    qShort("How many spaces are the standard indentation in Python? (a number)", "4"),
    mc("With `x = 5`, what does this print?\n\n```\nif x > 3:\n    print(\"A\")\nelif x > 1:\n    print(\"B\")\n```", ["`B`", "`A`", "`A` and `B`", "Nothing"], 1),
    mc("When does the `else` block run?", ["Always", "When the first condition is true", "When none of the conditions above it is true", "Only after an `elif`"], 2),
    mc("Which error do you get when a block isn't indented?", ["`TypeError`", "`NameError`", "`ValueError`", "`IndentationError`"], 3),
    mc("What does `\"yes\" if 3 > 5 else \"no\"` give?", ["`\"yes\"`", "`\"no\"`", "`True`", "`False`"], 1),
    mc("With `name = \"\"`, what happens to the block under `if name:`?", ["It is skipped, because empty text is falsy", "It runs", "It raises an error", "It runs twice"], 0),
    qShort("Which keyword checks another condition after an `if`?", "elif"),
    mc("How many `elif` blocks can one `if` have?", ["Only one", "Exactly two", "As many as you need", "None; use nested ifs"], 2),
    mc("What does `pass` do?", ["Skips the rest of the program", "Ends the `if`", "Raises an error", "Nothing: it fills a block that must not be empty"], 3),
  ],
})
