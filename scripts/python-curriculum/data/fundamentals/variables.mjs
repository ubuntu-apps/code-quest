// Fundamentals topic: Variables. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "variables",
  title: "Variables",
  paragraphs: [
    "A **variable** is a name for a value. You create one with `=`: `age = 30` means \"let the name `age` refer to 30\". After that, you can use the name wherever you'd use the value, and Python looks the value up.",
    "```\nage = 30\nname = \"Ana\"\nprint(name, \"is\", age)   # Ana is 30\n```",
    "`=` means \"assign\", not \"equals\". Python works out the right side first and then stores the result under the name on the left. That's why `count = count + 1` makes sense: take the current count, add 1, and store the result back in `count`. Using a name before you've assigned it gives a `NameError`.",
    "A variable can be reassigned at any time: the new value simply replaces the old one. It can even switch to a different kind of value, although that tends to confuse readers.",
    "**Naming rules.** Names can contain letters, digits and underscores, but they can't start with a digit (`2fast` is not allowed), can't contain spaces or dashes (`total-score` would mean \"total minus score\"), and can't be one of Python's keywords, such as `class` or `if`. Names are case-sensitive: `score` and `Score` are two different variables.",
    "Python's style guide, PEP 8, recommends `snake_case`: lowercase words joined by underscores, like `total_price`. Choose names for what a value means. `seconds_per_day = 86400` explains itself; `x = 86400` doesn't.",
    "There are shortcuts for assigning several names at once. `x, y = 10, 20` gives `x` the value 10 and `y` the value 20, and `a = b = 0` sets both to 0. To swap two values, write `a, b = b, a`: the right side is worked out completely before anything is stored.",
    "```\nx, y = 10, 20\nx, y = y, x\nprint(x, y)   # 20 10\n```",
    "Variables let you write a calculation once and reuse it. Change a value at the top of the program, and every line that uses it follows.",
  ],
  sandboxCode: "name = \"Ana\"\nage = 30\nprint(name, \"is\", age)\nage = age + 1\nprint(\"Next year\", name, \"will be\", age)",
  sandboxSnippets: [
    snippet("Assign and print", "city = \"Lisbon\"\nyear = 2026\nprint(city, year)"),
    snippet("Reassign", "mood = \"sleepy\"\nprint(mood)\nmood = \"awake\"\nprint(mood)"),
    snippet("Count up", "count = 0\ncount = count + 1\ncount = count + 1\nprint(count)"),
    snippet("Two at once", "width, height = 7, 3\nprint(width * height)\na = b = 0\nprint(a, b)"),
    snippet("Swap", "left, right = \"cat\", \"dog\"\nleft, right = right, left\nprint(left, right)"),
  ],
  readMore: { label: "PEP 8: naming conventions", url: "https://peps.python.org/pep-0008/#naming-conventions", source: "Python Enhancement Proposals" },
  challenges: [
    task("easy", "Store a city", {
      prompt: "Create a variable `city` holding the text `Lisbon`, then print it.",
      hint: "Assign with `=`, then print the variable without quotes: `print(city)`.",
      solution: "city = \"Lisbon\"\nprint(city)",
      tests: [
        ["city is Lisbon", "city == \"Lisbon\""],
        ["Prints Lisbon", "_cq_stdout.strip() == \"Lisbon\""],
      ],
    }),
    task("easy", "Store a number", {
      prompt: "Create a variable `year` set to `2026`, then print `Year: 2026` using the variable.",
      hint: "Give `print` the text `\"Year:\"` and the variable `year`, separated by a comma.",
      solution: "year = 2026\nprint(\"Year:\", year)",
      tests: [
        ["year is 2026", "year == 2026"],
        ["Prints Year: 2026", "_cq_stdout.strip() == \"Year: 2026\""],
      ],
    }),
    task("easy", "Change a value", {
      prompt: "Below the existing lines, set `score` to `25` and print it again. The output should be `10` and then `25`.",
      starter: "score = 10\nprint(score)\n",
      hint: "Assign the new value with `score = 25`, then add another `print(score)`.",
      solution: "score = 10\nprint(score)\nscore = 25\nprint(score)",
      tests: [
        ["score is now 25", "score == 25"],
        ["Prints 10, then 25", "_cq_stdout.strip().splitlines() == [\"10\", \"25\"]"],
      ],
    }),
    task("medium", "Count up", {
      prompt: "Add 1 to `steps` three times, each time with `steps = steps + 1`. Then print `steps`.",
      starter: "steps = 0\n",
      hint: "Write the line `steps = steps + 1` three times, then `print(steps)`.",
      solution: "steps = 0\nsteps = steps + 1\nsteps = steps + 1\nsteps = steps + 1\nprint(steps)",
      tests: [
        ["steps is 3", "steps == 3"],
        ["Prints 3", "_cq_stdout.strip() == \"3\""],
      ],
    }),
    task("medium", "Fix the names", {
      prompt: "These variable names break Python's naming rules. Rename them to `first_place` and `total_score` everywhere, so the program prints `Ana 90`.",
      starter: "1st_place = \"Ana\"\ntotal-score = 90\nprint(1st_place, total-score)",
      hint: "A name can't start with a digit or contain a dash. Change both names on every line where they appear.",
      solution: "first_place = \"Ana\"\ntotal_score = 90\nprint(first_place, total_score)",
      tests: [
        ["first_place is Ana", "first_place == \"Ana\""],
        ["total_score is 90", "total_score == 90"],
        ["Prints Ana 90", "_cq_stdout.strip() == \"Ana 90\""],
      ],
    }),
    task("medium", "Area of a rectangle", {
      prompt: "Create `area` from `width` and `height` (don't type the number yourself), then print `Area: 21`.",
      starter: "width = 7\nheight = 3\n",
      hint: "Multiply the two variables: `area = width * height`.",
      solution: "width = 7\nheight = 3\narea = width * height\nprint(\"Area:\", area)",
      tests: [
        ["area is 21", "area == 21"],
        ["Prints Area: 21", "_cq_stdout.strip() == \"Area: 21\""],
      ],
    }),
    task("hard", "Swap two values", {
      prompt: "Swap the values of `left` and `right` in a single line, so `left` is `\"dog\"` and `right` is `\"cat\"`.",
      starter: "left = \"cat\"\nright = \"dog\"\n",
      hint: "Assign both at once, with the order reversed on the right: `left, right = right, left`.",
      solution: "left = \"cat\"\nright = \"dog\"\nleft, right = right, left",
      tests: [
        ["left is dog", "left == \"dog\""],
        ["right is cat", "right == \"cat\""],
      ],
    }),
    task("hard", "Several at once", {
      prompt: "In one line, set `x`, `y` and `z` to `1`, `2` and `3`. Then set `total` to their sum and print it.",
      hint: "Separate the names and the values with commas: `x, y, z = 1, 2, 3`. Then `total = x + y + z`.",
      solution: "x, y, z = 1, 2, 3\ntotal = x + y + z\nprint(total)",
      tests: [
        ["x, y and z are 1, 2 and 3", "(x, y, z) == (1, 2, 3)"],
        ["total is 6", "total == 6"],
        ["Prints 6", "_cq_stdout.strip() == \"6\""],
      ],
    }),
    task("expert", "Price with tax", {
      prompt: "Create `tax` (the price times the tax rate) and `total` (price plus tax) from the variables. Then print `Total: 25.0`.",
      starter: "price = 20\ntax_rate = 0.25\n",
      hint: "`tax = price * tax_rate` is 5.0; then `total = price + tax`.",
      solution: "price = 20\ntax_rate = 0.25\ntax = price * tax_rate\ntotal = price + tax\nprint(\"Total:\", total)",
      tests: [
        ["tax is 5.0", "tax == 5.0"],
        ["total is 25.0", "total == 25.0"],
        ["Prints Total: 25.0", "_cq_stdout.strip() == \"Total: 25.0\""],
      ],
    }),
    task("expert", "A running balance", {
      prompt: "Start with `balance = 100`. Then spend 30, earn 45 and spend 20, updating `balance` after each step and printing it each time. The output should be `70`, `115` and `95`.",
      starter: "balance = 100\n",
      hint: "Each step is a reassignment, such as `balance = balance - 30`, followed by `print(balance)`.",
      solution: "balance = 100\nbalance = balance - 30\nprint(balance)\nbalance = balance + 45\nprint(balance)\nbalance = balance - 20\nprint(balance)",
      tests: [
        ["balance ends at 95", "balance == 95"],
        ["Prints 70, 115 and 95", "_cq_stdout.strip().splitlines() == [\"70\", \"115\", \"95\"]"],
      ],
    }),
  ],
  questions: [
    mc("After `x = 5` and then `x = 8`, what is `x`?", ["`5`","`8`","`13`","An error"], 1, "Assigning again replaces the old value: a variable holds one value at a time."),
    mc("What does `=` do in `age = 30`?", ["Checks whether age equals 30","Prints 30","Stores 30 under the name `age`","Adds 30 to `age`"], 2, "In Python `=` means assignment: store the value on the right under the name on the left."),
    mc("Which is a valid variable name?", ["`first_name`","`2nd_place`","`total-price`","`class`"], 0, "Names can use letters, digits and underscores but can't start with a digit, contain `-`, or be a keyword like `class`."),
    qShort("Which naming style does PEP 8 recommend for variables, like `total_price`?", "snake_case", "PEP 8, Python's style guide, uses lowercase words joined by underscores (snake_case) for variable names."),
    mc("After `count = 4` and `count = count + 1`, what is `count`?", ["`4`","`5`","`1`","An error"], 1, "The right side is worked out first using the old value (4 + 1), then the result is stored back in `count`."),
    mc("Using a variable before assigning it gives…", ["A `SyntaxError`","The value 0","A `NameError`","An empty string"], 2, "Python only knows a name after it has been assigned, so using it earlier is a `NameError`."),
    mc("What does `x, y = 1, 2` do?", ["Sets `x` to 1 and `y` to 2","Sets both to 2","Makes a pair called `x`","Raises an error"], 0, "This is multiple assignment: the values on the right are stored in the names on the left, in order."),
    mc("How do you swap `a` and `b` in one line?", ["`a = b`", "`a, b = b, a`", "`swap(a, b)`", "`a = b = a`"], 1, "The right side `b, a` is built first, then unpacked into `a` and `b`, so the values trade places."),
    mc("Are `Score` and `score` the same variable?", ["Yes, case is ignored","Only for numbers","Only inside `print`","No, names are case-sensitive"], 3, "Python is case-sensitive, so `Score` and `score` are two different names."),
    mc("After `a = 3`, `b = a` and then `a = 7`, what is `b`?", ["`3`", "`7`", "`10`", "An error"], 0, "`b = a` copies the value 3 into `b`. Giving `a` a new value later doesn't change `b`."),
  ],
})
