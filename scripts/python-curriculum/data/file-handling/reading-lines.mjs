// Files topic: Reading line by line. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "reading_files",
  title: "Reading line by line",
  paragraphs: [
    "`read()` loads the whole file at once, which is fine for small files. Most of the time, though, you want to work through a file **one line at a time**, and a file object lets you loop over it directly:",
    "```\nwith open(\"poem.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"Roses are red\\nViolets are blue\\n\")\n\nwith open(\"poem.txt\", encoding=\"utf-8\") as f:\n    for line in f:\n        print(repr(line))     # 'Roses are red\\n', then 'Violets are blue\\n'\n```",
    "Each line still ends with its `\\n`. Printing it as it is gives you an extra blank line, so take it off first: `line.rstrip(\"\\n\")` removes just the line break, and `line.strip()` removes spaces at both ends too. The last line of a file may or may not end with `\\n`, and stripping handles both.",
    "Looping over the file is also the **memory-friendly** way: Python reads one line, hands it to you, and forgets it, so even a file of several gigabytes works. `read()` or `readlines()` would load all of it at once.",
    "`enumerate(f, start=1)` numbers the lines as you go, which is handy for messages like \"line 7 is broken\". Inside the loop, skip what you don't want with `continue`: blank lines (`if not line.strip():`) or comments (`if line.startswith(\"#\"):`).",
    "```\nwith open(\"data.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"# scores\\nAna,91\\n\\nBen,78\\n\")\n\nscores = {}\nwith open(\"data.txt\", encoding=\"utf-8\") as f:\n    for number, line in enumerate(f, start=1):\n        line = line.strip()\n        if not line or line.startswith(\"#\"):\n            continue\n        name, score = line.split(\",\")\n        scores[name] = int(score)\nprint(scores)   # {'Ana': 91, 'Ben': 78}\n```",
    "Two other methods: `f.readline()` reads just the next line (`\"\"` at the end of the file), useful for a header line before looping over the rest; and `f.readlines()` returns a list of all the lines, `\\n` included. To get the lines without their breaks, `f.read().splitlines()` is usually neater.",
    "A file object can only be looped over **once**: a second loop starts where the first finished, at the end, and finds nothing. Open the file again, or keep the lines you need in a list.",
  ],
  sandboxCode: "with open(\"poem.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"Roses are red\\nViolets are blue\\nPython is fun\\n\")\n\nwith open(\"poem.txt\", encoding=\"utf-8\") as f:\n    for number, line in enumerate(f, start=1):\n        print(number, line.rstrip(\"\\n\"))",
  sandboxSnippets: [
    snippet("Loop over a file", "with open(\"p.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"one\\ntwo\\nthree\\n\")\n\nwith open(\"p.txt\", encoding=\"utf-8\") as f:\n    for line in f:\n        print(line)"),
    snippet("Strip the line break", "with open(\"p.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"one\\ntwo\\n\")\n\nwith open(\"p.txt\", encoding=\"utf-8\") as f:\n    for line in f:\n        print(line.rstrip(\"\\n\"))"),
    snippet("A header line first", "with open(\"t.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"name,score\\nAna,91\\nBen,78\\n\")\n\nwith open(\"t.txt\", encoding=\"utf-8\") as f:\n    header = f.readline().strip()\n    rows = [line.strip() for line in f]\nprint(header, rows)"),
    snippet("Only one loop", "with open(\"p.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"a\\nb\\n\")\n\nwith open(\"p.txt\", encoding=\"utf-8\") as f:\n    print([line for line in f])\n    print([line for line in f])"),
  ],
  readMore: { label: "Python tutorial: methods of file objects", url: "https://docs.python.org/3/tutorial/inputoutput.html#methods-of-file-objects", source: "Python docs" },
  challenges: [
    task("easy", "Print each line", {
      prompt: "Print each line of `poem.txt`, without the extra blank lines.",
      hint: "Loop `for line in f:` and `print(line.rstrip(\"\\n\"))`.",
      solution: "with open(\"poem.txt\", encoding=\"utf-8\") as f:\n    for line in f:\n        print(line.rstrip(\"\\n\"))",
      setup: "import os as _os\nwith open('poem.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('Roses are red\\nViolets are blue\\nPython is fun\\nAnd so are you\\n')\n",
      tests: [
        ["Prints the poem", "_cq_stdout.splitlines() == [\"Roses are red\", \"Violets are blue\", \"Python is fun\", \"And so are you\"]"],
      ],
    }),
    task("easy", "Numbered lines", {
      prompt: "Print each line of `poem.txt` with its number, like `1: Roses are red`.",
      hint: "`for number, line in enumerate(f, start=1):`.",
      solution: "with open(\"poem.txt\", encoding=\"utf-8\") as f:\n    for number, line in enumerate(f, start=1):\n        print(f\"{number}: {line.rstrip()}\")",
      setup: "import os as _os\nwith open('poem.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('Roses are red\\nViolets are blue\\nPython is fun\\nAnd so are you\\n')\n",
      tests: [
        ["Prints numbered lines", "_cq_stdout.splitlines() == [\"1: Roses are red\", \"2: Violets are blue\", \"3: Python is fun\", \"4: And so are you\"]"],
      ],
    }),
    task("easy", "A clean list", {
      prompt: "Set `lines` to a list of the lines of `poem.txt`, each with its line break removed, by looping over the file.",
      hint: "A comprehension over the file: `[line.rstrip(\"\\n\") for line in f]`.",
      solution: "with open(\"poem.txt\", encoding=\"utf-8\") as f:\n    lines = [line.rstrip(\"\\n\") for line in f]",
      setup: "import os as _os\nwith open('poem.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('Roses are red\\nViolets are blue\\nPython is fun\\nAnd so are you\\n')\n",
      tests: [
        ["lines is right", "lines == [\"Roses are red\", \"Violets are blue\", \"Python is fun\", \"And so are you\"]"],
      ],
    }),
    task("medium", "Not the blank ones", {
      prompt: "Set `count` to the number of lines in `scores.txt` that aren't blank.",
      hint: "Count the lines where `line.strip()` is not empty.",
      solution: "with open(\"scores.txt\", encoding=\"utf-8\") as f:\n    count = sum(1 for line in f if line.strip())",
      setup: "import os as _os\nwith open('scores.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('Ana,91\\nBen,78\\n\\nCleo,85\\n')\n",
      tests: [
        ["count is 3", "count == 3"],
      ],
    }),
    task("medium", "Read the scores", {
      prompt: "Read `scores.txt` (lines like `Ana,91`) into a dict `scores` mapping names to int scores, skipping blank lines.",
      hint: "Strip each line, `continue` if it's empty, then `name, score = line.split(\",\")`.",
      solution: "scores = {}\nwith open(\"scores.txt\", encoding=\"utf-8\") as f:\n    for line in f:\n        line = line.strip()\n        if not line:\n            continue\n        name, score = line.split(\",\")\n        scores[name] = int(score)",
      setup: "import os as _os\nwith open('scores.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('Ana,91\\nBen,78\\n\\nCleo,85\\n')\n",
      tests: [
        ["scores is right", "scores == {\"Ana\": 91, \"Ben\": 78, \"Cleo\": 85}"],
      ],
    }),
    task("medium", "Skip the header", {
      prompt: "`table.txt` starts with a header line. Set `header` to it (stripped) with `readline()`, and `rows` to the remaining lines (stripped) by looping over the rest.",
      hint: "Inside `with`: `header = f.readline().strip()`, then `rows = [line.strip() for line in f]`.",
      solution: "with open(\"table.txt\", encoding=\"utf-8\") as f:\n    header = f.readline().strip()\n    rows = [line.strip() for line in f]",
      setup: "import os as _os\nwith open('table.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('name,score\\nAna,91\\nBen,78\\n')\n",
      tests: [
        ["header is right", "header == \"name,score\""],
        ["rows is right", "rows == [\"Ana,91\", \"Ben,78\"]"],
      ],
    }),
    task("hard", "Where is it?", {
      prompt: "Set `found` to the number of the first line (counting from 1) in `poem.txt` that contains `blue`, or `None` if no line does.",
      hint: "`enumerate(f, start=1)`, and `break` when `\"blue\" in line`. Start with `found = None`.",
      solution: "found = None\nwith open(\"poem.txt\", encoding=\"utf-8\") as f:\n    for number, line in enumerate(f, start=1):\n        if \"blue\" in line:\n            found = number\n            break",
      setup: "import os as _os\nwith open('poem.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('Roses are red\\nViolets are blue\\nPython is fun\\nAnd so are you\\n')\n",
      tests: [
        ["found is 2", "found == 2"],
      ],
    }),
    task("hard", "The average temperature", {
      prompt: "Set `average` to the average of the numbers in `temps.txt`, skipping blank lines and lines that aren't numbers.",
      hint: "Loop over the lines; `try` to append `float(line)`, and `continue` on `ValueError` (a blank line raises one too).",
      solution: "values = []\nwith open(\"temps.txt\", encoding=\"utf-8\") as f:\n    for line in f:\n        try:\n            values.append(float(line))\n        except ValueError:\n            continue\naverage = sum(values) / len(values)",
      setup: "import os as _os\nwith open('temps.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('18.5\\n21\\nbroken\\n\\n19.5\\n')\n",
      tests: [
        ["average is 19.666...", "abs(average - 59 / 3) < 1e-9"],
      ],
    }),
    task("expert", "Count the levels", {
      prompt: "Set `levels` to a dict counting the first word of each line in `app.log` (such as `INFO` and `ERROR`).",
      hint: "For each line, `level = line.split()[0]`, then count it with `get`.",
      solution: "levels = {}\nwith open(\"app.log\", encoding=\"utf-8\") as f:\n    for line in f:\n        level = line.split()[0]\n        levels[level] = levels.get(level, 0) + 1",
      setup: "import os as _os\nwith open('app.log', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('INFO start\\nERROR disk full\\nWARNING slow\\nINFO saved\\nERROR timeout\\n')\n",
      tests: [
        ["levels is right", "levels == {\"INFO\": 2, \"ERROR\": 2, \"WARNING\": 1}"],
      ],
    }),
    task("expert", "The last three lines", {
      prompt: "Define `tail(name, n=3)` that returns the last `n` lines of a file, without their line breaks, reading it line by line (so it would work on a huge file). A `deque(maxlen=n)` keeps just the last few.",
      hint: "`from collections import deque`. Append each stripped line to `deque(maxlen=n)` and return `list(...)` of it.",
      solution: "from collections import deque\n\ndef tail(name, n=3):\n    last = deque(maxlen=n)\n    with open(name, encoding=\"utf-8\") as f:\n        for line in f:\n            last.append(line.rstrip(\"\\n\"))\n    return list(last)",
      setup: "import os as _os\nwith open('app.log', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('INFO start\\nERROR disk full\\nWARNING slow\\nINFO saved\\nERROR timeout\\n')\nwith open('one.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('only line\\n')\n",
      tests: [
        ["The last 3", "tail(\"app.log\") == [\"WARNING slow\", \"INFO saved\", \"ERROR timeout\"]"],
        ["The last 1", "tail(\"app.log\", 1) == [\"ERROR timeout\"]"],
        ["A short file", "tail(\"one.txt\") == [\"only line\"]"],
      ],
    }),
  ],
  questions: [
    mc("What does `for line in f:` give you each time round?", ["One word", "The next line, with its `\\n` at the end", "The line number", "The whole file"], 1, "Iterating a file gives one line per round, and each line still ends with `\\n`."),
    mc("Why is looping over a file memory-friendly?", ["It compresses the file", "It skips blank lines", "It reads one line at a time instead of the whole file", "It closes the file first"], 2, "Only one line is in memory at a time, so even huge files work."),
    mc("What does `line.rstrip(\"\\n\")` do?", ["Removes the line break at the end", "Removes every letter n", "Splits the line", "Adds a line break"], 0, "`rstrip(\"\\n\")` removes line-break characters from the right end only."),
    mc("What does `f.readline()` return at the end of the file?", ["`None`", "An error", "The first line again", "`\"\"`"], 3, "At the end of the file `readline()` returns an empty string, while a blank line is `\"\\n\"`."),
    qShort("`enumerate(f, start=1)`: what number does the first line get? (a number)", "1", "`start=1` makes the counting begin at 1, like line numbers in an editor."),
    mc("What happens if you loop over the same file object twice?", ["The lines come again", "The second loop finds nothing: it starts at the end", "An error", "The file is reopened"], 1, "A file object is used up after one pass; reopen it or `seek(0)` to read it again."),
    mc("How do you skip blank lines in a loop?", ["`if not line.strip(): continue`", "`if line == None: break`", "`if line: continue`", "`line.skip()`"], 0, "A blank line becomes `\"\"` after `strip()`, which is falsy."),
    mc("What does `f.readlines()` return?", ["The number of lines", "The first line", "A list of all the lines, each with its `\\n`", "A list without line breaks"], 2, "`readlines()` reads every line into a list, keeping the line breaks."),
    mc("Why read a header with `readline()` before the loop?", ["It is faster", "The loop can't read headers", "It removes the header from the file", "So the loop then only sees the data lines"], 3, "After `readline()` reads the header, the loop carries on from the second line."),
    mc("Which is usually neatest for a list of lines without breaks?", ["`f.readlines()`", "`f.read().splitlines()`", "`f.readline()`", "`list(f.read())`"], 1, "`splitlines()` gives the lines with their line breaks already removed."),
  ],
})
