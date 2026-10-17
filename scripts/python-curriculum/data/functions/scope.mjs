// Functions topic: Scope: local and global. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "scope_globals",
  title: "Scope: local and global",
  paragraphs: [
    "Where a variable is created decides where it can be used: its **scope**. A variable assigned inside a function is **local**: it exists only while that call runs, and code outside the function can't see it. Parameters are local too.",
    "```\ndef make_message():\n    message = \"Hi there\"     # local to make_message\n    return message\n\nresult = make_message()\nprint(result)    # Hi there\nprint(message)   # NameError: message only existed inside the function\n```",
    "A variable assigned at the top level of the program, outside any function, is **global**. Functions can **read** globals, which is handy for constants such as `TAX_RATE = 0.2` (written in capitals by convention, to say \"this never changes\").",
    "Assigning is different. An assignment inside a function always creates a **local** variable, even when a global has the same name; the two are separate, and the global is left alone:",
    "```\nx = 10\n\ndef change():\n    x = 5          # a new local x; the global x is untouched\n    return x\n\nprint(change(), x)   # 5 10\n```",
    "That leads to a classic error. `count += 1` inside a function means \"assign to `count`\", so Python treats `count` as local in the whole function, and reading it before it has a value fails with `UnboundLocalError: cannot access local variable 'count'`.",
    "You **can** change a global by declaring it first with `global count`. It works, but code full of globals is hard to follow, because any function might change anything. The better habit is: **pass values in as arguments, and return the results**. Then each function says exactly what it uses and what it changes.",
    "```\ndef add_points(score, points):\n    return score + points\n\nscore = 0\nscore = add_points(score, 10)\nscore = add_points(score, 5)\nprint(score)   # 15\n```",
    "Functions can also be defined inside other functions. The inner one can read the outer one's variables (the **enclosing** scope), and `nonlocal` lets it change them. Python looks a name up in this order: **L**ocal, **E**nclosing, **G**lobal, then **B**uilt-in, known as the LEGB rule. That's why you can't call your own variable `len` without hiding the real `len()`.",
  ],
  sandboxCode: "TAX_RATE = 0.2\n\ndef with_tax(price):\n    return price * (1 + TAX_RATE)   # reading a global is fine\n\nprint(with_tax(10))\n\nx = 10\ndef change():\n    x = 5\n    return x\n\nprint(change(), x)",
  sandboxSnippets: [
    snippet("Local variables vanish", "def make_message():\n    message = \"Hi there\"\n    return message\n\nprint(make_message())\nprint(message)"),
    snippet("Same name, two variables", "name = \"global Ana\"\n\ndef show():\n    name = \"local Ben\"\n    print(name)\n\nshow()\nprint(name)"),
    snippet("UnboundLocalError", "count = 0\n\ndef add_one():\n    count += 1\n\nadd_one()"),
    snippet("global (use sparingly)", "count = 0\n\ndef add_one():\n    global count\n    count += 1\n\nadd_one()\nadd_one()\nprint(count)"),
    snippet("nonlocal", "def make_counter():\n    count = 0\n    def step():\n        nonlocal count\n        count += 1\n        return count\n    return step\n\ncounter = make_counter()\nprint(counter(), counter(), counter())"),
  ],
  readMore: { label: "Python tutorial: scopes and namespaces", url: "https://docs.python.org/3/tutorial/classes.html#python-scopes-and-namespaces", source: "Python docs" },
  challenges: [
    task("easy", "Get it out", {
      prompt: "`print(message)` fails with a `NameError`, because `message` only exists inside the function. Return it from the function instead, store the result in `result`, and print that.",
      starter: "def make_message():\n    message = \"Hi there\"\n\nmake_message()\nprint(message)\n",
      hint: "Add `return message` to the function, then `result = make_message()` and `print(result)`.",
      solution: "def make_message():\n    message = \"Hi there\"\n    return message\n\nresult = make_message()\nprint(result)",
      tests: [
        ["result is Hi there", "result == \"Hi there\""],
        ["Prints it", "_cq_stdout.strip() == \"Hi there\""],
      ],
    }),
    task("easy", "Read a constant", {
      prompt: "Define `with_tax(price)` that returns the price plus tax, using the global `TAX_RATE`.",
      starter: "TAX_RATE = 0.2\n\n",
      hint: "Functions can read globals: `return price * (1 + TAX_RATE)`.",
      solution: "TAX_RATE = 0.2\n\ndef with_tax(price):\n    return price * (1 + TAX_RATE)",
      tests: [
        ["with_tax(10) is 12", "abs(with_tax(10) - 12) < 1e-9"],
        ["with_tax(5) is 6", "abs(with_tax(5) - 6) < 1e-9"],
      ],
    }),
    task("easy", "Two different x", {
      prompt: "Set `inside` to what `change()` returns and `outside` to the global `x` after the call.",
      starter: "x = 10\n\ndef change():\n    x = 5\n    return x\n\n",
      hint: "Call it, `inside = change()`, then `outside = x`. The assignment inside created a separate local `x`.",
      solution: "x = 10\n\ndef change():\n    x = 5\n    return x\n\ninside = change()\noutside = x",
      tests: [
        ["inside is 5", "inside == 5"],
        ["outside is still 10", "outside == 10"],
      ],
    }),
    task("medium", "Fix the UnboundLocalError", {
      prompt: "`add_one()` fails with `UnboundLocalError`. Rewrite it as `add_one(count)` that returns `count + 1`, and use it to bring `count` to 2.",
      starter: "count = 0\n\ndef add_one():\n    count += 1\n\nadd_one()\nadd_one()\n",
      hint: "Pass the value in and return the result: `count = add_one(count)`, twice.",
      solution: "count = 0\n\ndef add_one(count):\n    return count + 1\n\ncount = add_one(count)\ncount = add_one(count)",
      tests: [
        ["count is 2", "count == 2"],
        ["add_one(5) is 6", "add_one(5) == 6"],
      ],
    }),
    task("medium", "With global", {
      prompt: "Make `add_points` change the global `score` by declaring it `global`, so after the two calls `score` is 15.",
      starter: "score = 0\n\ndef add_points(points):\n    score += points\n\nadd_points(10)\nadd_points(5)\n",
      hint: "Add `global score` as the first line of the function body.",
      solution: "score = 0\n\ndef add_points(points):\n    global score\n    score += points\n\nadd_points(10)\nadd_points(5)",
      tests: [
        ["score is 15", "score == 15"],
      ],
    }),
    task("medium", "In and out", {
      prompt: "`apply_discount` reads and changes globals. Rewrite it as `apply_discount(price, rate)` that **returns** the discounted price, with no globals.",
      starter: "price = 50\nrate = 0.1\n\ndef apply_discount():\n    global price\n    price = price * (1 - rate)\n",
      hint: "`def apply_discount(price, rate): return price * (1 - rate)`.",
      solution: "def apply_discount(price, rate):\n    return price * (1 - rate)",
      tests: [
        ["apply_discount(50, 0.1)", "abs(apply_discount(50, 0.1) - 45) < 1e-9"],
        ["apply_discount(80, 0.25)", "abs(apply_discount(80, 0.25) - 60) < 1e-9"],
      ],
    }),
    task("hard", "No more global list", {
      prompt: "`add_task` appends to a global list. Rewrite it as `add_task(tasks, task)` that returns a **new** list with the task added, leaving the list passed in unchanged.",
      starter: "tasks = []\n\ndef add_task(task):\n    tasks.append(task)\n",
      hint: "Build a new list: `return tasks + [task]`.",
      solution: "def add_task(tasks, task):\n    return tasks + [task]",
      tests: [
        ["Adds the task", "add_task([\"shop\"], \"cook\") == [\"shop\", \"cook\"]"],
        ["Leaves the original alone", "(lambda t: (add_task(t, \"x\"), t)[1])([\"a\"]) == [\"a\"]"],
      ],
    }),
    task("hard", "Don't hide a built-in", {
      prompt: "Naming a variable `sum` hides the built-in `sum()`, so the last line fails. Rename the variable to `total` (on both lines that use it) so `average` is 20.0.",
      starter: "numbers = [10, 20, 30]\nsum = 0\nfor n in numbers:\n    sum += n\naverage = sum(numbers) / len(numbers)\n",
      hint: "Use another name for your running total, such as `total`, and the built-in `sum()` works again.",
      solution: "numbers = [10, 20, 30]\ntotal = 0\nfor n in numbers:\n    total += n\naverage = sum(numbers) / len(numbers)",
      tests: [
        ["average is 20.0", "average == 20.0"],
        ["total is 60", "total == 60"],
      ],
    }),
    task("expert", "A counter that remembers", {
      prompt: "Define `make_counter()` that returns a function. Each call of that function returns the next number: 1, 2, 3… Use an inner function and `nonlocal`.",
      hint: "Inside `make_counter`: `count = 0`, then `def step():` with `nonlocal count`, `count += 1` and `return count`. Finally `return step` (no brackets).",
      solution: "def make_counter():\n    count = 0\n    def step():\n        nonlocal count\n        count += 1\n        return count\n    return step",
      tests: [
        ["Counts 1, 2, 3", "(lambda c: [c(), c(), c()])(make_counter()) == [1, 2, 3]"],
        ["Each counter is separate", "(lambda a, b: [a(), a(), b()])(make_counter(), make_counter()) == [1, 2, 1]"],
      ],
    }),
    task("expert", "A safe bank", {
      prompt: "Write `deposit(balance, amount)` and `withdraw(balance, amount)` that return the new balance, with no globals. `withdraw` returns the balance unchanged when there isn't enough money.",
      hint: "`deposit` returns `balance + amount`. In `withdraw`, `if amount > balance: return balance`, else `return balance - amount`.",
      solution: "def deposit(balance, amount):\n    return balance + amount\n\ndef withdraw(balance, amount):\n    if amount > balance:\n        return balance\n    return balance - amount",
      tests: [
        ["deposit(100, 50)", "deposit(100, 50) == 150"],
        ["withdraw(100, 30)", "withdraw(100, 30) == 70"],
        ["withdraw(100, 500) is refused", "withdraw(100, 500) == 100"],
        ["Chained calls", "withdraw(deposit(0, 80), 30) == 50"],
      ],
    }),
  ],
  questions: [
    mc("Where can a variable assigned inside a function be used?", ["Anywhere in the program", "Only inside that function, during the call", "Only in the next function", "Only after the function ends"], 1),
    mc("Can a function read a global variable?", ["No", "Only with `global`", "Yes", "Only if it is a string"], 2),
    mc("`x = 10`, then `def f(): x = 5`, then `f()`. What is the global `x`?", ["`10`", "`5`", "`15`", "An error"], 0),
    mc("What causes `UnboundLocalError`?", ["A missing `return`", "Calling a function too early", "A misspelt name", "Reading a variable that the function also assigns, before it has a value"], 3),
    qShort("Which keyword lets a function change a global variable? (one word)", "global"),
    mc("What is the better habit than changing globals?", ["Print everything", "Pass values in as arguments and return the results", "Use more globals", "Avoid functions"], 1),
    mc("Which keyword lets an inner function change a variable of the function around it?", ["`global`", "`outer`", "`nonlocal`", "`local`"], 2),
    mc("What does LEGB stand for?", ["Local, Enclosing, Global, Built-in", "List, Element, Group, Block", "Loop, Else, Global, Break", "Local, External, General, Base"], 0),
    mc("Why are constants like `TAX_RATE` written in capitals?", ["Python requires it", "They run faster", "They become global", "By convention, to say the value never changes"], 3),
    mc("What goes wrong after `len = 5`?", ["Nothing", "`len()` no longer works: the name now means 5", "`len` becomes 5 everywhere in Python", "A `SyntaxError`"], 1),
  ],
})
