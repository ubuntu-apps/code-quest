// Modules and packages project: Dice roller. Lesson, Try-it snippets, challenges and quiz.
import { makeProject, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeProject("easy", {
  id: "proj_dice_roller",
  title: "Dice roller",
  paragraphs: [
    "Board games and role-playing games describe dice with a short code: `2d6` means \"roll two six-sided dice\", `d20` means one twenty-sided die. Build a module, `dice.py`, that understands these codes and rolls them, and that also works as a program when run on its own.",
    "```\nDice (like 2d6, blank to stop): 2d6\n4 + 3 = 7\nDice (like 2d6, blank to stop): d20\n17 = 17\nDice (like 2d6, blank to stop): bones\nNot dice: bones\nDice (like 2d6, blank to stop):\nBye!\n```",
    "The module has small functions that each do one thing, `roll`, `roll_many`, `parse` and `describe`, so another program (a board game, say) can `import dice` and use just the parts it needs. The interactive loop lives in `main()`, behind a main guard, so importing `dice` never starts asking questions.",
    "Random results are hard to check, so the checks set a seed first: with the same seed, `random` gives the same rolls every time, and the checks can work out what your code should have rolled.",
  ],
  sandboxCode: "import random\n\ndef roll(sides=6):\n    return random.randint(1, sides)\n\nrolls = [roll() for _ in range(3)]\nprint(\" + \".join(str(r) for r in rolls), \"=\", sum(rolls))",
  sandboxSnippets: [
    snippet("Read a dice code", "count, d, sides = \"3d8\".partition(\"d\")\nprint(count, d, sides)\nprint(\"d20\".partition(\"d\"))"),
    snippet("Join with plus signs", "rolls = [4, 2, 6]\nprint(\" + \".join(str(r) for r in rolls) + f\" = {sum(rolls)}\")"),
    snippet("Same seed, same rolls", "import random\nrandom.seed(4)\nprint([random.randint(1, 6) for _ in range(3)])\nrandom.seed(4)\nprint([random.randint(1, 6) for _ in range(3)])"),
  ],
  challenges: [
    task("easy", "Roll one die", {
      prompt: "Your code is `dice.py`. Define `roll(sides=6)` that returns a random whole number from 1 to `sides`.",
      starter: "import random\n",
      hint: "`random.randint(1, sides)`.",
      solution: "import random\n\ndef roll(sides=6):\n    return random.randint(1, sides)\n",
      setup: "def _import_both(path):\n    import importlib as _il, sys as _sys, os as _os, io as _io, contextlib as _cl\n    folder = _os.path.dirname(path)\n    if folder:\n        _os.makedirs(folder, exist_ok=True)\n    with open(path, \"w\", encoding=\"utf-8\") as _f:\n        _f.write(_cq_source)\n    name = path[:-3].replace(\"/\", \".\")\n    if name.endswith(\".__init__\"):\n        name = name[:-9]\n    for _k in [k for k in _sys.modules if k == name or k.startswith(name + \".\")]:\n        del _sys.modules[_k]\n    _il.invalidate_caches()\n    import builtins as _bi\n    def _no_input(prompt=\"\"):\n        raise RuntimeError(\"input() ran while the module was being imported: put that code under the main guard\")\n    buf = _io.StringIO()\n    real_input = _bi.input\n    _bi.input = _no_input\n    try:\n        with _cl.redirect_stdout(buf):\n            mod = _il.import_module(name)\n    finally:\n        _bi.input = real_input\n    return mod, buf.getvalue()\ndef _module(path):\n    return _import_both(path)[0]\ndef _import_prints(path):\n    return _import_both(path)[1]\n",
      tests: [
        ["A normal die", "set(_module(\"dice.py\").roll() for _ in range(300)) == {1, 2, 3, 4, 5, 6}"],
        ["A d20", "all(1 <= _module(\"dice.py\").roll(20) <= 20 for _ in range(50)) and 20 in {roll(20) for _ in range(500)}"],
      ],
    }),
    task("medium", "Roll several", {
      prompt: "Add `roll_many(count, sides=6)` to `dice.py`: a list of `count` rolls, using `roll`.",
      starter: "import random\n\ndef roll(sides=6):\n    return random.randint(1, sides)\n\n",
      hint: "A comprehension: `[roll(sides) for _ in range(count)]`.",
      solution: "import random\n\ndef roll(sides=6):\n    return random.randint(1, sides)\n\ndef roll_many(count, sides=6):\n    return [roll(sides) for _ in range(count)]\n",
      tests: [
        ["Three dice", "len(roll_many(3)) == 3 and all(1 <= r <= 6 for r in roll_many(3))"],
        ["Other dice", "all(1 <= r <= 8 for r in roll_many(40, 8))"],
        ["Uses the seed", "(__import__(\"random\").seed(4), roll_many(3))[1] == (lambda R: [(R.seed(_k), [R.randint(1, _s) for _ in range(_n)])[1] for (_k, _n, _s) in [(4, 3, 6)]][0])(__import__(\"random\"))"],
      ],
    }),
    task("medium", "Read the code", {
      prompt: "Add `parse(text)` that turns a dice code into `(count, sides)`: `\"3d6\"` gives `(3, 6)` and `\"d20\"` gives `(1, 20)`, ignoring case and spaces. Anything else (no `d`, words, fewer than 1 die or 2 sides) raises `ValueError(\"Not dice: <text>\")`.",
      starter: "import random\n\ndef roll(sides=6):\n    return random.randint(1, sides)\n\ndef roll_many(count, sides=6):\n    return [roll(sides) for _ in range(count)]\n\n",
      hint: "`count, d, sides = text.strip().lower().partition(\"d\")`. Check `d == \"d\"`, that `sides.isdigit()`, and that `count` is empty or digits.",
      solution: "import random\n\ndef roll(sides=6):\n    return random.randint(1, sides)\n\ndef roll_many(count, sides=6):\n    return [roll(sides) for _ in range(count)]\n\ndef parse(text):\n    count, d, sides = text.strip().lower().partition(\"d\")\n    if d != \"d\" or not sides.isdigit() or not (count == \"\" or count.isdigit()):\n        raise ValueError(f\"Not dice: {text}\")\n    count = int(count) if count else 1\n    sides = int(sides)\n    if count < 1 or sides < 2:\n        raise ValueError(f\"Not dice: {text}\")\n    return count, sides\n",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["Two numbers", "parse(\"3d6\") == (3, 6) and parse(\" 2D10 \") == (2, 10)"],
        ["No count", "parse(\"d20\") == (1, 20)"],
        ["Not dice", "[_error(parse, t) for t in [\"bones\", \"3x6\", \"d\", \"0d6\", \"2d1\"]] == [\"ValueError: Not dice: bones\", \"ValueError: Not dice: 3x6\", \"ValueError: Not dice: d\", \"ValueError: Not dice: 0d6\", \"ValueError: Not dice: 2d1\"]"],
      ],
    }),
    task("hard", "Show the rolls", {
      prompt: "Add `describe(rolls)` that returns text like `4 + 2 + 6 = 12` for a list of rolls (a single roll gives `17 = 17`).",
      starter: "import random\n\ndef roll(sides=6):\n    return random.randint(1, sides)\n\ndef roll_many(count, sides=6):\n    return [roll(sides) for _ in range(count)]\n\ndef parse(text):\n    count, d, sides = text.strip().lower().partition(\"d\")\n    if d != \"d\" or not sides.isdigit() or not (count == \"\" or count.isdigit()):\n        raise ValueError(f\"Not dice: {text}\")\n    count = int(count) if count else 1\n    sides = int(sides)\n    if count < 1 or sides < 2:\n        raise ValueError(f\"Not dice: {text}\")\n    return count, sides\n\n",
      hint: "`\" + \".join(str(r) for r in rolls)`, then add ` = ` and the sum.",
      solution: "import random\n\ndef roll(sides=6):\n    return random.randint(1, sides)\n\ndef roll_many(count, sides=6):\n    return [roll(sides) for _ in range(count)]\n\ndef parse(text):\n    count, d, sides = text.strip().lower().partition(\"d\")\n    if d != \"d\" or not sides.isdigit() or not (count == \"\" or count.isdigit()):\n        raise ValueError(f\"Not dice: {text}\")\n    count = int(count) if count else 1\n    sides = int(sides)\n    if count < 1 or sides < 2:\n        raise ValueError(f\"Not dice: {text}\")\n    return count, sides\n\ndef describe(rolls):\n    return \" + \".join(str(r) for r in rolls) + f\" = {sum(rolls)}\"\n",
      tests: [
        ["Three rolls", "describe([4, 2, 6]) == \"4 + 2 + 6 = 12\""],
        ["One roll", "describe([17]) == \"17 = 17\""],
      ],
    }),
    task("hard", "Roll from text", {
      prompt: "Add `roll_text(text)` that parses a dice code, rolls it and returns the description, all using your functions.",
      starter: "import random\n\ndef roll(sides=6):\n    return random.randint(1, sides)\n\ndef roll_many(count, sides=6):\n    return [roll(sides) for _ in range(count)]\n\ndef parse(text):\n    count, d, sides = text.strip().lower().partition(\"d\")\n    if d != \"d\" or not sides.isdigit() or not (count == \"\" or count.isdigit()):\n        raise ValueError(f\"Not dice: {text}\")\n    count = int(count) if count else 1\n    sides = int(sides)\n    if count < 1 or sides < 2:\n        raise ValueError(f\"Not dice: {text}\")\n    return count, sides\n\ndef describe(rolls):\n    return \" + \".join(str(r) for r in rolls) + f\" = {sum(rolls)}\"\n\n",
      hint: "`count, sides = parse(text)`, then `describe(roll_many(count, sides))`.",
      solution: "import random\n\ndef roll(sides=6):\n    return random.randint(1, sides)\n\ndef roll_many(count, sides=6):\n    return [roll(sides) for _ in range(count)]\n\ndef parse(text):\n    count, d, sides = text.strip().lower().partition(\"d\")\n    if d != \"d\" or not sides.isdigit() or not (count == \"\" or count.isdigit()):\n        raise ValueError(f\"Not dice: {text}\")\n    count = int(count) if count else 1\n    sides = int(sides)\n    if count < 1 or sides < 2:\n        raise ValueError(f\"Not dice: {text}\")\n    return count, sides\n\ndef describe(rolls):\n    return \" + \".join(str(r) for r in rolls) + f\" = {sum(rolls)}\"\n\ndef roll_text(text):\n    count, sides = parse(text)\n    return describe(roll_many(count, sides))\n",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\n",
      tests: [
        ["Seeded 3d6", "(__import__(\"random\").seed(4), roll_text(\"3d6\"))[1] == (lambda r: \" + \".join(map(str, r)) + f\" = {sum(r)}\")((lambda R: [(R.seed(_k), [R.randint(1, _s) for _ in range(_n)])[1] for (_k, _n, _s) in [(4, 3, 6)]][0])(__import__(\"random\")))"],
        ["Bad text", "_raises(roll_text, \"lots\") == \"ValueError\""],
      ],
    }),
    task("expert", "The dice program", {
      prompt: "Finish `dice.py` with `main()`: keep asking `Dice (like 2d6, blank to stop): `, print the roll (or the error message for a bad code), and print `Bye!` after a blank answer. Call `main()` under a main guard, so importing the module is silent.",
      starter: "import random\n\ndef roll(sides=6):\n    return random.randint(1, sides)\n\ndef roll_many(count, sides=6):\n    return [roll(sides) for _ in range(count)]\n\ndef parse(text):\n    count, d, sides = text.strip().lower().partition(\"d\")\n    if d != \"d\" or not sides.isdigit() or not (count == \"\" or count.isdigit()):\n        raise ValueError(f\"Not dice: {text}\")\n    count = int(count) if count else 1\n    sides = int(sides)\n    if count < 1 or sides < 2:\n        raise ValueError(f\"Not dice: {text}\")\n    return count, sides\n\ndef describe(rolls):\n    return \" + \".join(str(r) for r in rolls) + f\" = {sum(rolls)}\"\n\ndef roll_text(text):\n    count, sides = parse(text)\n    return describe(roll_many(count, sides))\n\n",
      hint: "A `while True` loop; `break` on a blank answer; `try: print(roll_text(text))` and `except ValueError as e: print(e)`.",
      solution: "import random\n\ndef roll(sides=6):\n    return random.randint(1, sides)\n\ndef roll_many(count, sides=6):\n    return [roll(sides) for _ in range(count)]\n\ndef parse(text):\n    count, d, sides = text.strip().lower().partition(\"d\")\n    if d != \"d\" or not sides.isdigit() or not (count == \"\" or count.isdigit()):\n        raise ValueError(f\"Not dice: {text}\")\n    count = int(count) if count else 1\n    sides = int(sides)\n    if count < 1 or sides < 2:\n        raise ValueError(f\"Not dice: {text}\")\n    return count, sides\n\ndef describe(rolls):\n    return \" + \".join(str(r) for r in rolls) + f\" = {sum(rolls)}\"\n\ndef roll_text(text):\n    count, sides = parse(text)\n    return describe(roll_many(count, sides))\n\n\ndef main():\n    while True:\n        text = input(\"Dice (like 2d6, blank to stop): \")\n        if not text.strip():\n            print(\"Bye!\")\n            break\n        try:\n            print(roll_text(text))\n        except ValueError as e:\n            print(e)\n\n\nif __name__ == \"__main__\":\n    main()\n",
      setup: "import random as _r\n_r.seed(1)\n_cq_answers = ['2d6', 'd20', 'bones', '']\ndef input(prompt=\"\"):\n    if not _cq_answers:\n        raise EOFError(\"This check only types 4 answer(s): call input() fewer times.\")\n    value = _cq_answers.pop(0)\n    print(str(prompt) + value)\n    return value\ndef _import_both(path):\n    import importlib as _il, sys as _sys, os as _os, io as _io, contextlib as _cl\n    folder = _os.path.dirname(path)\n    if folder:\n        _os.makedirs(folder, exist_ok=True)\n    with open(path, \"w\", encoding=\"utf-8\") as _f:\n        _f.write(_cq_source)\n    name = path[:-3].replace(\"/\", \".\")\n    if name.endswith(\".__init__\"):\n        name = name[:-9]\n    for _k in [k for k in _sys.modules if k == name or k.startswith(name + \".\")]:\n        del _sys.modules[_k]\n    _il.invalidate_caches()\n    import builtins as _bi\n    def _no_input(prompt=\"\"):\n        raise RuntimeError(\"input() ran while the module was being imported: put that code under the main guard\")\n    buf = _io.StringIO()\n    real_input = _bi.input\n    _bi.input = _no_input\n    try:\n        with _cl.redirect_stdout(buf):\n            mod = _il.import_module(name)\n    finally:\n        _bi.input = real_input\n    return mod, buf.getvalue()\ndef _module(path):\n    return _import_both(path)[0]\ndef _import_prints(path):\n    return _import_both(path)[1]\n",
      tests: [
        ["The replies", "[l for l in _cq_stdout.splitlines() if not l.startswith(\"Dice\")] == (__import__(\"random\").seed(1), [roll_text(\"2d6\"), roll_text(\"d20\"), \"Not dice: bones\", \"Bye!\"])[1]"],
        ["Importing is silent", "_import_prints(\"dice.py\") == \"\""],
        ["The functions import", "_module(\"dice.py\").parse(\"4d8\") == (4, 8)"],
      ],
    }),
  ],
  questions: [
    mc("What does `\"2d6\".split(\"d\")` give?", ["`['2d6']`", "`[2, 6]`", "`('2', 'd', '6')`", "`['2', '6']`"], 3, "`split(\"d\")` cuts the text at the `d` and returns the pieces as strings, so they still need `int()`."),
    mc("Why is the interactive loop behind a main guard?", ["So it runs twice", "Because `input` needs it", "So importing `dice` never starts asking questions", "To make it random"], 2, "The guard stops the loop from running when another program imports the module."),
    mc("What does `\"d20\".partition(\"d\")` give?", ["`(\"\", \"d\", \"20\")`", "`(\"d\", \"20\")`", "`[\"d20\"]`", "`(1, 20)`"], 0, "`partition` splits at the first `d`, and nothing comes before it."),
    mc("How can checks test code that rolls random dice?", ["They can't", "They roll real dice", "They ignore the numbers", "They set a seed so the rolls repeat"], 3, "With the same seed, `random` gives the same rolls every time, so the expected results are known."),
    qShort("What should `describe([5])` return?", "5 = 5", "With one die, the total is just that roll."),
    mc("`dice.py` defines `roll(sides)` and has a main guard. Which line in another file lets you call `roll(6)` directly?", ["`import roll from dice`", "`from dice import roll`", "`import dice.roll`", "`from roll import dice`"], 1, "`from dice import roll` imports the module and makes the name `roll` available; the main guard stops the dice game from starting."),
  ],
})
