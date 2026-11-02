// Fundamentals topic: Reading input. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task, typedInput } from '../_builders.mjs'

export default makeTopic({
  id: "reading_input",
  title: "Reading input",
  paragraphs: [
    "Programs get more interesting when they react to the person using them. `input()` pauses the program, waits for the user to type a line, and returns what they typed. Put a question inside the brackets and it's shown first, as a **prompt**:",
    "```\nname = input(\"What's your name? \")\nprint(f\"Nice to meet you, {name}!\")\n```",
    "**In CodeQuest,** type the answers into the sandbox's **Input** box before you press Run, one line for each `input()` call. Python reads them in order. If the program asks more questions than there are lines, you get an error saying `input()` needs a value. (Try the sandbox below: type `Ana` and `30` on two lines.)",
    "`input()` **always returns a string**, even when the user types digits, so `input(\"Age? \") + 1` raises a `TypeError`. Convert the answer first: `age = int(input(\"Age? \"))`, or use `float(...)` for decimals.",
    "People type messily, with extra spaces and random capitals. `.strip()` removes the spaces at the ends, and `.lower()` lets you compare without caring about case: `answer = input(\"Continue? \").strip().lower()` turns `\" Yes \"` into `\"yes\"`.",
    "If the user types something that isn't a number, `int()` raises a `ValueError` and the program stops. For now, assume the input is right; in the Errors and exceptions quest you'll learn to catch the mistake and ask again.",
    "A typical small program has three parts: **read** the input, **process** it (convert and calculate), and **print** the result. Keeping the parts apart, with a clear name for each value, makes the program easy to follow:",
    "```\nkm = float(input(\"Distance in km: \"))\nmiles = km * 0.621371\nprint(f\"{km} km is {miles:.2f} miles\")\n```",
    "The prompt is printed without a new line, so the user's answer appears right after it. End your prompts with a space (or a `\\n` if the answer should go on the next line).",
  ],
  sandboxCode: "name = input(\"What's your name? \")\nage = int(input(\"How old are you? \"))\nprint(f\"Hi {name}! Next year you'll be {age + 1}.\")",
  sandboxSnippets: [
    snippet("Ask a question", "# Type a name in the Input box first.\nname = input(\"What's your name? \")\nprint(f\"Hello, {name}!\")"),
    snippet("A number from input", "# Type a number in the Input box first.\nage = int(input(\"Age? \"))\nprint(f\"In ten years you'll be {age + 10}.\")"),
    snippet("Clean the answer", "# Type something like \"  YES \" in the Input box.\nanswer = input(\"Continue? \").strip().lower()\nprint(repr(answer))"),
    snippet("Read, process, print", "# Type a distance, such as 5, in the Input box.\nkm = float(input(\"Distance in km: \"))\nmiles = km * 0.621371\nprint(f\"{km} km is {miles:.2f} miles\")"),
    snippet("Two numbers", "# Type two numbers, one per line, in the Input box.\na = int(input(\"First number: \"))\nb = int(input(\"Second number: \"))\nprint(f\"{a} + {b} = {a + b}\")"),
  ],
  readMore: { label: "Python docs: input()", url: "https://docs.python.org/3/library/functions.html#input", source: "Python docs" },
  challenges: [
    task("easy", "Say hello", {
      prompt: "Ask `What's your name? ` with `input`, store the answer in `name`, and print `Hello, <name>!`. The check types `Ana`, so it expects `Hello, Ana!`.",
      hint: "`name = input(\"What's your name? \")`, then an f-string: `print(f\"Hello, {name}!\")`.",
      solution: "name = input(\"What's your name? \")\nprint(f\"Hello, {name}!\")",
      setup: typedInput("Ana"),
      tests: [
        ["name is what the user typed", "name == \"Ana\""],
        ["Prints Hello, Ana!", "_cq_stdout.strip().splitlines()[-1] == \"Hello, Ana!\""],
      ],
    }),
    task("easy", "It's a string", {
      prompt: "This program crashes when the user types `41`. Fix it so it prints `42`.",
      starter: "age = input(\"Age? \")\nprint(age + 1)",
      hint: "`input()` returns text. Convert it: `age = int(input(\"Age? \"))`.",
      solution: "age = int(input(\"Age? \"))\nprint(age + 1)",
      setup: typedInput("41"),
      tests: [
        ["Prints 42", "_cq_stdout.strip().splitlines()[-1] == \"42\""],
      ],
    }),
    task("medium", "Add two numbers", {
      prompt: "Ask for two whole numbers and print `Sum: <total>`. The check types `7` and `35`.",
      hint: "Two `input` calls, each wrapped in `int(...)`. Then `print(\"Sum:\", a + b)` or an f-string.",
      solution: "a = int(input(\"First number: \"))\nb = int(input(\"Second number: \"))\nprint(f\"Sum: {a + b}\")",
      setup: typedInput("7", "35"),
      tests: [
        ["Prints Sum: 42", "_cq_stdout.strip().splitlines()[-1] == \"Sum: 42\""],
      ],
    }),
    task("medium", "Height in centimetres", {
      prompt: "Ask for a height in metres and print it in centimetres as a whole number, like `Height: 175 cm`. The check types `1.75`.",
      hint: "Read it with `float(input(...))`, multiply by 100, and format with `:.0f` so no decimals are shown.",
      solution: "metres = float(input(\"Height in metres: \"))\ncm = metres * 100\nprint(f\"Height: {cm:.0f} cm\")",
      setup: typedInput("1.75"),
      tests: [
        ["Prints Height: 175 cm", "_cq_stdout.strip().splitlines()[-1] == \"Height: 175 cm\""],
      ],
    }),
    task("medium", "Tidy the answer", {
      prompt: "Ask `Continue? ` and store the answer in `answer`, without spaces at the ends and in lowercase. The check types `  YES `.",
      hint: "Chain the methods straight onto `input`: `input(\"Continue? \").strip().lower()`.",
      solution: "answer = input(\"Continue? \").strip().lower()",
      setup: typedInput("  YES "),
      tests: [
        ["answer is yes", "answer == \"yes\""],
      ],
    }),
    task("hard", "Distance converter", {
      prompt: "Ask for a distance in km and print `<km> km is <miles> miles`, with the miles to 2 decimals (1 km = 0.621371 miles). The check types `5`, so it expects `5.0 km is 3.11 miles`.",
      hint: "Read, process, print: `km = float(input(...))`, `miles = km * 0.621371`, then an f-string with `{miles:.2f}`.",
      solution: "km = float(input(\"Distance in km: \"))\nmiles = km * 0.621371\nprint(f\"{km} km is {miles:.2f} miles\")",
      setup: typedInput("5"),
      tests: [
        ["Prints the conversion", "_cq_stdout.strip().splitlines()[-1] == \"5.0 km is 3.11 miles\""],
      ],
    }),
    task("hard", "Rectangle calculator", {
      prompt: "Ask for a width and a height (decimals allowed), then print the area and the perimeter on two lines: `Area: 9.0` and `Perimeter: 13.0`. The check types `4.5` and `2`.",
      hint: "Use `float` for both. The perimeter is `2 * (width + height)`.",
      solution: "width = float(input(\"Width: \"))\nheight = float(input(\"Height: \"))\nprint(\"Area:\", width * height)\nprint(\"Perimeter:\", 2 * (width + height))",
      setup: typedInput("4.5", "2"),
      tests: [
        ["Prints the area and perimeter", "_cq_stdout.strip().splitlines()[-2:] == [\"Area: 9.0\", \"Perimeter: 13.0\"]"],
      ],
    }),
    task("expert", "Minutes to hours", {
      prompt: "Ask for a number of minutes and print it as hours and minutes, like `135 minutes is 2 h 15 min`. The check types `135`.",
      hint: "Read an int, then `hours, rest = divmod(minutes, 60)`.",
      solution: "minutes = int(input(\"Minutes: \"))\nhours, rest = divmod(minutes, 60)\nprint(f\"{minutes} minutes is {hours} h {rest} min\")",
      setup: typedInput("135"),
      tests: [
        ["Prints 135 minutes is 2 h 15 min", "_cq_stdout.strip().splitlines()[-1] == \"135 minutes is 2 h 15 min\""],
      ],
    }),
    task("expert", "Shopping total", {
      prompt: "Ask for an item name, its price and the quantity (in that order), then print a line like `4 x Pens = 5.00`. The check types `Pens`, `1.25` and `4`.",
      hint: "Keep the name as text, use `float` for the price and `int` for the quantity, then format the total with `:.2f`.",
      solution: "item = input(\"Item: \")\nprice = float(input(\"Price: \"))\nqty = int(input(\"Quantity: \"))\nprint(f\"{qty} x {item} = {price * qty:.2f}\")",
      setup: typedInput("Pens", "1.25", "4"),
      tests: [
        ["Prints 4 x Pens = 5.00", "_cq_stdout.strip().splitlines()[-1] == \"4 x Pens = 5.00\""],
      ],
    }),
  ],
  questions: [
    mc("What type does `input()` return?", ["`int`","`str`","`float`","It depends on what the user types"], 1, "`input()` always returns text, whatever the user types; convert it if you need a number."),
    qShort("Which function reads a line typed by the user? (name only)", "input", "`input()` waits for the user to type a line and returns it as a string."),
    mc("The user types `5`. What does `input(\"? \") + 1` do?", ["Gives `6`","Gives `\"51\"`","Raises a `TypeError`","Gives `5`"], 2, "`input()` returns the string `\"5\"`, and adding text to a number is a `TypeError`."),
    mc("How do you read a whole number from the user?", ["`int(input(\"? \"))`", "`input(int(\"? \"))`", "`input(\"? \").int()`", "`number(input(\"? \"))`"], 0, "Read the text with `input()`, then convert it to a whole number with `int()`."),
    mc("What happens if the user types `abc` for `int(input(\"? \"))`?", ["It returns 0","A `ValueError` stops the program","It returns `\"abc\"`","Python asks again by itself"], 1, "`int(\"abc\")` can't make a number from letters, so it raises a `ValueError`."),
    mc("Which turns `\" Yes \"` into `\"yes\"`?", ["`.upper()`", "`.split()`", "`.title()`", "`.strip().lower()`"], 3, "`.strip()` removes the spaces and `.lower()` makes the text lowercase, so the answer can be compared easily."),
    mc("What does the text inside `input(\"Age? \")` do?", ["It is the default answer", "It is shown to the user as a prompt", "It is the variable name", "Nothing"], 1, "The argument to `input()` is a prompt shown before the user types."),
    mc("The user types `3` and then `4` for `a = input()` and `b = input()`. What does `print(a + b)` show?", ["`7`", "`34`", "`3 4`", "A `TypeError`"], 1, "`input()` always gives text, so `+` joins the two strings into `34`. Convert with `int()` first to add them."),
    mc("The user types ` 7 ` with spaces around it. What is `int(input())`?", ["A `ValueError`", "`\" 7 \"`", "`7`", "`0`"], 2, "`int()` ignores spaces and line breaks around the digits, so it gives the number 7."),
    mc("The user types `2.5`. What does `int(input())` do?", ["Gives `2`","Gives `3`","Raises a `ValueError`","Gives `2.5`"], 2, "`int()` won't read text with a decimal point, so `\"2.5\"` raises a `ValueError`; use `float()` instead."),
  ],
})
