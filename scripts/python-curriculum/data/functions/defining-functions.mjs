// Functions topic: Defining functions. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "defining_functions",
  title: "Defining functions",
  paragraphs: [
    "You've been **calling** functions since your first program: `print()`, `len()`, `sorted()`. Now you'll write your own. A function is a named block of code you can run whenever you like, as often as you like. Write it once, give it a good name, and the rest of your program can simply say what it wants done.",
    "`def` starts a function **definition**: the name, round brackets, a colon, and then the body, indented by four spaces, just like the body of an `if` or a loop.",
    "```\ndef say_hello():\n    print(\"Hello!\")\n    print(\"Welcome to CodeQuest.\")\n\nsay_hello()\nsay_hello()\n```",
    "Defining a function doesn't run it: Python just remembers it under that name. The body runs only when you **call** the function by writing its name followed by brackets, `say_hello()`. Each call runs the whole body again from the top, so the example prints its two lines twice.",
    "The brackets matter. `say_hello` on its own is just the function itself, a value like any other; nothing happens. You saw this in Data structures: `sorted(words, key=len)` passes the function `len` without calling it, and `sorted` calls it for you.",
    "Python runs a program from top to bottom, so a function must be defined **before** the line that calls it runs. Calling it too early gives `NameError: name 'say_hello' is not defined`. That's why definitions usually come first, and the code that uses them comes after.",
    "Name functions like variables, in `snake_case`, and make the name say what the function **does**, usually with a verb: `print_menu`, `show_score`, `draw_border`. A good name means you rarely need to look inside to know what a call does.",
    "Functions can call other functions, which lets you build big jobs out of small, clear steps:",
    "```\ndef line():\n    print(\"-\" * 20)\n\ndef header():\n    line()\n    print(\"Weekly report\")\n    line()\n\nheader()\n```",
    "When you notice the same few lines copied in several places, that's a sign they want to be a function. Change the function once, and every place that calls it follows. A body that's empty for now needs `pass`, as with an empty `if`.",
  ],
  sandboxCode: "def line():\n    print(\"-\" * 20)\n\ndef header():\n    line()\n    print(\"Weekly report\")\n    line()\n\nheader()\nprint(\"All tasks done.\")",
  sandboxSnippets: [
    snippet("Define and call", "def cheer():\n    print(\"Hip hip hooray!\")\n\ncheer()\ncheer()"),
    snippet("Defining is not running", "def secret():\n    print(\"You called me!\")\n\nprint(\"The function exists, but nothing has happened yet.\")"),
    snippet("Without the brackets", "def wave():\n    print(\"*waves*\")\n\nprint(wave)\nwave()"),
    snippet("Called too early", "greet()\n\ndef greet():\n    print(\"Hi\")"),
    snippet("Functions calling functions", "def stars():\n    print(\"*\" * 10)\n\ndef framed():\n    stars()\n    print(\"  Framed!\")\n    stars()\n\nframed()"),
  ],
  readMore: { label: "Python tutorial: defining functions", url: "https://docs.python.org/3/tutorial/controlflow.html#defining-functions", source: "Python docs" },
  challenges: [
    task("easy", "Say hello", {
      prompt: "Define a function `say_hello()` that prints `Hello!`, then call it once.",
      hint: "`def say_hello():`, then an indented `print(\"Hello!\")`. Call it on its own line, not indented: `say_hello()`.",
      solution: "def say_hello():\n    print(\"Hello!\")\n\nsay_hello()",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\n",
      tests: [
        ["say_hello is a function", "callable(say_hello)"],
        ["Calling it prints Hello!", "_out(say_hello) == \"Hello!\\n\""],
        ["Your program printed Hello!", "_cq_stdout.strip() == \"Hello!\""],
      ],
    }),
    task("easy", "Three cheers", {
      prompt: "The function is ready. Call it three times.",
      starter: "def cheer():\n    print(\"Hooray!\")\n\n",
      hint: "Write `cheer()` on three lines.",
      solution: "def cheer():\n    print(\"Hooray!\")\n\ncheer()\ncheer()\ncheer()",
      tests: [
        ["Prints Hooray! three times", "_cq_stdout.strip().splitlines() == [\"Hooray!\"] * 3"],
      ],
    }),
    task("easy", "Fix the call", {
      prompt: "This should print the menu, but nothing happens. Fix the last line.",
      starter: "def show_menu():\n    print(\"1. Start\")\n    print(\"2. Quit\")\n\nshow_menu\n",
      hint: "Without brackets, `show_menu` is just the function. Call it: `show_menu()`.",
      solution: "def show_menu():\n    print(\"1. Start\")\n    print(\"2. Quit\")\n\nshow_menu()",
      tests: [
        ["Prints the menu", "_cq_stdout.strip().splitlines() == [\"1. Start\", \"2. Quit\"]"],
      ],
    }),
    task("medium", "A dividing line", {
      prompt: "Define `line()` to print 20 dashes. Then print `Title` between two lines by calling it twice.",
      hint: "`def line(): print(\"-\" * 20)`. Then `line()`, `print(\"Title\")`, `line()`.",
      solution: "def line():\n    print(\"-\" * 20)\n\nline()\nprint(\"Title\")\nline()",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\n",
      tests: [
        ["line prints 20 dashes", "_out(line) == \"-\" * 20 + \"\\n\""],
        ["Prints the title between lines", "_cq_stdout.strip().splitlines() == [\"-\" * 20, \"Title\", \"-\" * 20]"],
      ],
    }),
    task("medium", "Too early", {
      prompt: "This fails with a `NameError`, because the function is called before it is defined. Fix the order.",
      starter: "show_rules()\n\ndef show_rules():\n    print(\"Rule 1: have fun\")\n",
      hint: "Move the call below the definition.",
      solution: "def show_rules():\n    print(\"Rule 1: have fun\")\n\nshow_rules()",
      tests: [
        ["Prints the rule", "_cq_stdout.strip() == \"Rule 1: have fun\""],
      ],
    }),
    task("medium", "Build a header", {
      prompt: "Define `header()` so it calls `line()`, prints `Weekly report`, and calls `line()` again. Then call `header()`.",
      starter: "def line():\n    print(\"=\" * 15)\n\n",
      hint: "Inside `header`, three lines: `line()`, `print(\"Weekly report\")`, `line()`.",
      solution: "def line():\n    print(\"=\" * 15)\n\ndef header():\n    line()\n    print(\"Weekly report\")\n    line()\n\nheader()",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\n",
      tests: [
        ["header prints the three lines", "_out(header).splitlines() == [\"=\" * 15, \"Weekly report\", \"=\" * 15]"],
        ["Your program called it", "_cq_stdout.strip().splitlines() == [\"=\" * 15, \"Weekly report\", \"=\" * 15]"],
      ],
    }),
    task("hard", "Sing it three times", {
      prompt: "Define `chorus()` to print `La la la` and then `Oh yeah`. Call it inside a loop that runs 3 times.",
      hint: "Define the function first, then `for _ in range(3): chorus()`.",
      solution: "def chorus():\n    print(\"La la la\")\n    print(\"Oh yeah\")\n\nfor _ in range(3):\n    chorus()",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\n",
      tests: [
        ["chorus prints two lines", "_out(chorus) == \"La la la\\nOh yeah\\n\""],
        ["Sings it three times", "_cq_stdout.strip().splitlines() == [\"La la la\", \"Oh yeah\"] * 3"],
      ],
    }),
    task("hard", "Numbered menu", {
      prompt: "Define `show_menu()` to print the `options` numbered from 1, like `1. Play`. Then call it.",
      starter: "options = [\"Play\", \"Settings\", \"Quit\"]\n\n",
      hint: "Inside the function, loop with `enumerate(options, start=1)`.",
      solution: "options = [\"Play\", \"Settings\", \"Quit\"]\n\ndef show_menu():\n    for number, option in enumerate(options, start=1):\n        print(f\"{number}. {option}\")\n\nshow_menu()",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\n",
      tests: [
        ["show_menu prints the menu", "_out(show_menu).splitlines() == [\"1. Play\", \"2. Settings\", \"3. Quit\"]"],
      ],
    }),
    task("expert", "A banner", {
      prompt: "Define `banner()` that prints this box, then call it:\n\n```\n+-----------+\n| CodeQuest |\n+-----------+\n```",
      hint: "Three `print` calls. The border is `\"+\" + \"-\" * 11 + \"+\"`.",
      solution: "def banner():\n    print(\"+\" + \"-\" * 11 + \"+\")\n    print(\"| CodeQuest |\")\n    print(\"+\" + \"-\" * 11 + \"+\")\n\nbanner()",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\n",
      tests: [
        ["banner prints the box", "_out(banner).splitlines() == [\"+-----------+\", \"| CodeQuest |\", \"+-----------+\"]"],
      ],
    }),
    task("expert", "Stop repeating yourself", {
      prompt: "The same three lines appear twice. Put them in a function `divider()` and call it in both places, so the program prints exactly what it does now.",
      starter: "print(\"Part 1\")\nprint()\nprint(\"~\" * 12)\nprint()\nprint(\"Part 2\")\nprint()\nprint(\"~\" * 12)\nprint()\n",
      hint: "Define `divider()` with the three repeated lines in its body (`print()`, the tildes, `print()`), then replace both copies with `divider()`.",
      solution: "def divider():\n    print()\n    print(\"~\" * 12)\n    print()\n\nprint(\"Part 1\")\ndivider()\nprint(\"Part 2\")\ndivider()",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\n",
      tests: [
        ["divider prints the three lines", "_out(divider) == \"\\n\" + \"~\" * 12 + \"\\n\\n\""],
        ["The output is unchanged", "_cq_stdout.splitlines() == [\"Part 1\", \"\", \"~\" * 12, \"\", \"Part 2\", \"\", \"~\" * 12, \"\"]"],
      ],
    }),
  ],
  questions: [
    mc("Which keyword starts a function definition?", ["`function`", "`def`", "`func`", "`define`"], 1),
    mc("When does the body of a function run?", ["When it is defined", "When the program starts", "Each time the function is called", "Never"], 2),
    mc("`say_hello` is a function. What does `say_hello` (without brackets) do on its own line?", ["Nothing: it is the function itself, not a call", "Calls the function", "Raises a `SyntaxError`", "Deletes the function"], 0),
    mc("Calling a function before its `def` line has run gives…", ["A `SyntaxError`", "Nothing", "A `TypeError`", "A `NameError`"], 3),
    qShort("A function is called three times and its body prints two lines. How many lines are printed? (a number)", "6"),
    mc("Which is the best function name?", ["`Function1`", "`print_receipt`", "`x`", "`DoIt`"], 1),
    mc("What must end the `def` line?", ["A colon `:`", "A semicolon", "Brackets `()`", "Nothing"], 0),
    mc("Can a function call another function?", ["No", "Only built-in ones", "Yes", "Only if they have the same name"], 2),
    mc("What does a function body that only contains `pass` do?", ["Raises an error", "Ends the program", "Calls itself", "Nothing"], 3),
    mc("Why turn repeated code into a function?", ["It runs twice as fast", "You change it in one place and every call follows", "Python requires it", "It hides the code"], 1),
  ],
})
