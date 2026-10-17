// Fundamentals topic: Math functions. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "math_functions",
  title: "Math functions",
  paragraphs: [
    "Python has built-in functions for everyday maths. `abs(-7)` is the distance from zero, `7`. `min(3, 9, 4)` and `max(3, 9, 4)` give the smallest and the largest of their values, here `3` and `9`. `pow(2, 5)` is the same as `2 ** 5`.",
    "`round(x)` rounds to the nearest whole number, and `round(x, 2)` to 2 decimal places: `round(3.14159, 2)` is `3.14`. One surprise: exact halves round to the nearest **even** number, so `round(2.5)` is `2` but `round(3.5)` is `4`. This \"banker's rounding\" stops totals from always drifting upwards.",
    "`divmod(a, b)` gives you `a // b` and `a % b` at once, as a pair you can unpack into two names: `hours, minutes = divmod(135, 60)` sets `hours` to 2 and `minutes` to 15.",
    "For more maths, **import** the `math` module: write `import math` at the top of your program, then use its functions with a dot. `math.sqrt(25)` is the square root, `5.0`. `math.pi` is π. `math.floor(3.7)` rounds down to `3` and `math.ceil(3.2)` rounds up to `4`.",
    "```\nimport math\n\nprint(math.sqrt(16), math.pi)            # 4.0 3.141592653589793\nprint(math.floor(3.7), math.ceil(3.2))   # 3 4\n```",
    "**Floats aren't exact.** A float is stored in binary, so most decimals are kept as a tiny bit more or less than what you typed. That's why `0.1 + 0.2` prints `0.30000000000000004`. It isn't a Python bug; every programming language does this.",
    "So don't compare floats with `==`. Round both sides first, or use `math.isclose(a, b)`, which is `True` when two numbers are equal apart from such tiny errors. For money, a common trick is to count in cents, using ints.",
    "To sum up the ways of dropping a fraction: `round` goes to the nearest whole number, `math.floor` always goes down (so `math.floor(-3.7)` is `-4`), and `math.ceil` always goes up.",
  ],
  sandboxCode: "import math\n\nprint(abs(-7), min(3, 9, 4), max(3, 9, 4))\nprint(round(3.14159, 2), round(2.5), round(3.5))\nprint(math.sqrt(16), math.floor(3.7), math.ceil(3.2))\nprint(0.1 + 0.2, math.isclose(0.1 + 0.2, 0.3))",
  sandboxSnippets: [
    snippet("abs, min and max", "print(abs(-12), abs(5))\nprint(min(8, 3, 6), max(8, 3, 6))"),
    snippet("round", "print(round(3.14159, 2))\nprint(round(2.5), round(3.5), round(4.5))"),
    snippet("divmod", "hours, minutes = divmod(200, 60)\nprint(hours, \"h\", minutes, \"min\")"),
    snippet("The math module", "import math\n\nprint(math.sqrt(49))\nprint(math.floor(9.99), math.ceil(9.01))\nprint(round(math.pi, 4))"),
    snippet("Float surprise", "import math\n\nprint(0.1 + 0.2)\nprint(0.1 + 0.2 == 0.3)\nprint(math.isclose(0.1 + 0.2, 0.3))"),
  ],
  readMore: { label: "Python docs: the math module", url: "https://docs.python.org/3/library/math.html", source: "Python docs" },
  challenges: [
    task("easy", "Distance between two numbers", {
      prompt: "Set `distance` to how far apart `a` and `b` are. It should be positive, whichever is bigger.",
      starter: "a = 3\nb = 11\n",
      hint: "`a - b` is negative here; `abs(...)` turns it into the distance.",
      solution: "a = 3\nb = 11\ndistance = abs(a - b)",
      tests: [
        ["distance is 8", "distance == 8"],
      ],
    }),
    task("easy", "Highest and lowest", {
      prompt: "Set `highest` and `lowest` to the highest and lowest of the four temperatures.",
      starter: "t1, t2, t3, t4 = 18, 23, 15, 21\n",
      hint: "`max(t1, t2, t3, t4)` and `min(...)` take any number of values.",
      solution: "t1, t2, t3, t4 = 18, 23, 15, 21\nhighest = max(t1, t2, t3, t4)\nlowest = min(t1, t2, t3, t4)",
      tests: [
        ["highest is 23", "highest == 23"],
        ["lowest is 15", "lowest == 15"],
      ],
    }),
    task("easy", "Round a price", {
      prompt: "Set `rounded` to `price` rounded to 2 decimal places.",
      starter: "price = 19.98765\n",
      hint: "`round(price, 2)`: the second value is the number of decimals.",
      solution: "price = 19.98765\nrounded = round(price, 2)",
      tests: [
        ["rounded is 19.99", "rounded == 19.99"],
      ],
    }),
    task("medium", "Side of a square", {
      prompt: "A square has an area of 49. Set `side` to the length of its side, using `math.sqrt`.",
      starter: "area = 49\n",
      hint: "Add `import math` at the top, then `side = math.sqrt(area)`.",
      solution: "import math\n\narea = 49\nside = math.sqrt(area)",
      tests: [
        ["side is 7.0", "side == 7.0"],
      ],
    }),
    task("medium", "How many boxes?", {
      prompt: "Each box holds `per_box` items. Set `boxes` to how many boxes you need for all the `items`; a part-full box still counts.",
      starter: "items = 23\nper_box = 5\n",
      hint: "23 / 5 is 4.6, so you need 5 boxes: always round up with `math.ceil`. Remember `import math`.",
      solution: "import math\n\nitems = 23\nper_box = 5\nboxes = math.ceil(items / per_box)",
      tests: [
        ["boxes is 5", "boxes == 5 and isinstance(boxes, int)"],
      ],
    }),
    task("medium", "Hours and minutes", {
      prompt: "Use `divmod` to split `minutes` into `hours` and `rest` (the minutes left over).",
      starter: "minutes = 200\n",
      hint: "`hours, rest = divmod(minutes, 60)` unpacks both results at once.",
      solution: "minutes = 200\nhours, rest = divmod(minutes, 60)",
      tests: [
        ["hours is 3", "hours == 3"],
        ["rest is 20", "rest == 20"],
      ],
    }),
    task("hard", "Area of a circle", {
      prompt: "Set `area` to the area of a circle with this radius (π times the radius squared), rounded to 2 decimals.",
      starter: "radius = 2\n",
      hint: "Use `math.pi` and `radius ** 2`, then wrap it all in `round(..., 2)`.",
      solution: "import math\n\nradius = 2\narea = round(math.pi * radius ** 2, 2)",
      tests: [
        ["area is 12.57", "area == 12.57"],
      ],
    }),
    task("hard", "Compare floats safely", {
      prompt: "`same` should say whether `total` equals 0.3, but `==` gives `False` because of float rounding. Fix `same` with `math.isclose`.",
      starter: "total = 0.1 + 0.2\nsame = total == 0.3\nprint(same)",
      hint: "Replace the comparison with `math.isclose(total, 0.3)`, and add `import math` at the top.",
      solution: "import math\n\ntotal = 0.1 + 0.2\nsame = math.isclose(total, 0.3)\nprint(same)",
      tests: [
        ["total is still 0.1 + 0.2", "total == 0.1 + 0.2"],
        ["same is True", "same is True"],
      ],
    }),
    task("expert", "Round half up", {
      prompt: "Python rounds 2.5 down to 2 (to the even number). Set `rounded` to `x` rounded the school way, where halves go up, using `math.floor`.",
      starter: "x = 2.5\n",
      hint: "Adding 0.5 and then rounding down gives the school rounding: `math.floor(x + 0.5)`.",
      solution: "import math\n\nx = 2.5\nrounded = math.floor(x + 0.5)",
      tests: [
        ["rounded is 3", "rounded == 3 and isinstance(rounded, int)"],
      ],
    }),
    task("expert", "Money in cents", {
      prompt: "To avoid float errors, prices are stored in cents. Set `total_cents` for the whole order, then split it with `divmod` into `dollars` and `cents`, and print `Total: 59 dollars 97 cents`.",
      starter: "price_cents = 1999   # $19.99\nquantity = 3\n",
      hint: "`total_cents = price_cents * quantity`, then `dollars, cents = divmod(total_cents, 100)`.",
      solution: "price_cents = 1999   # $19.99\nquantity = 3\ntotal_cents = price_cents * quantity\ndollars, cents = divmod(total_cents, 100)\nprint(\"Total:\", dollars, \"dollars\", cents, \"cents\")",
      tests: [
        ["total_cents is 5997", "total_cents == 5997"],
        ["dollars and cents are 59 and 97", "(dollars, cents) == (59, 97)"],
        ["Prints the total", "_cq_stdout.strip() == \"Total: 59 dollars 97 cents\""],
      ],
    }),
  ],
  questions: [
    mc("What is `abs(-12)`?", ["-12", "12", "0", "1.2"], 1),
    mc("What does `round(2.5)` give in Python?", ["3", "2.5", "2", "An error"], 2),
    mc("What is `round(3.14159, 2)`?", ["3.14", "3.1", "3", "3.142"], 0),
    qShort("Which module has `sqrt`, `floor` and `pi`? (name only)", "math"),
    mc("What is `math.ceil(4.1)`?", ["4", "5", "4.0", "4.1"], 1),
    mc("Why does `0.1 + 0.2` print `0.30000000000000004`?", ["It is a bug in Python", "You must import math first", "print rounds numbers badly", "Floats are stored in binary, so most decimals are slightly off"], 3),
    mc("What does `divmod(17, 5)` give?", ["(3, 2)", "(3.4, 0)", "(2, 3)", "3.4"], 0),
    mc("Which is the safest way to compare two floats?", ["`a == b`", "`math.isclose(a, b)`", "`a is b`", "`str(a) == str(b)`"], 1),
    mc("What is `max(4, 9, 2)`?", ["4", "2", "9", "15"], 2),
    mc("What is `math.floor(-3.7)`?", ["-3", "-4", "3", "-3.7"], 1),
  ],
})
