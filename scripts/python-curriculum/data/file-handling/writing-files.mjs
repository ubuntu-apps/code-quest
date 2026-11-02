// Files topic: Writing files. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "writing_files",
  title: "Writing files",
  paragraphs: [
    "To write a file, open it in mode `\"w\"` and call `write` with the text. If the file doesn't exist it's created; if it **does** exist, everything in it is thrown away first. `\"w\"` always starts from an empty file, so be sure you mean it.",
    "```\nwith open(\"greeting.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"Hello!\\n\")\n    f.write(\"This is line two.\\n\")\n\nwith open(\"greeting.txt\", encoding=\"utf-8\") as f:\n    print(f.read())\n```",
    "`write` writes exactly what you give it and nothing more: no space, and **no line break** at the end. Add `\"\\n\"` yourself wherever a line should end, or the lines will run together. It also only takes strings, so numbers need `str()` or an f-string first: `f.write(f\"{score}\\n\")`.",
    "`print` can write to a file too, with `file=f`. It works just like printing to the screen: it converts values to text, puts spaces between them and adds the line break for you, so it's often the most convenient way to write lines.",
    "```\nscores = {\"Ana\": 91, \"Ben\": 78}\nwith open(\"scores.txt\", \"w\", encoding=\"utf-8\") as f:\n    for name, score in scores.items():\n        print(name, score, sep=\": \", file=f)\n\nwith open(\"scores.txt\", encoding=\"utf-8\") as f:\n    print(f.read())   # Ana: 91, then Ben: 78\n```",
    "To write many lines at once, join them: `f.write(\"\\n\".join(lines) + \"\\n\")`. (There's also `f.writelines(lines)`, which, despite its name, adds no line breaks either.)",
    "Written text may sit in a buffer for a moment before it reaches the file. Closing the file (which `with` does for you) makes sure everything is written. Don't read a file back while you still have it open for writing; let the `with` block end first.",
    "A common pattern is **read, change, write**: read a file, transform its contents, and write the result to a new file. Writing to a **different** name keeps the original safe if something goes wrong halfway.",
  ],
  sandboxCode: "lines = [\"eggs\", \"milk\", \"bread\"]\nwith open(\"shopping.txt\", \"w\", encoding=\"utf-8\") as f:\n    for number, item in enumerate(lines, start=1):\n        print(f\"{number}. {item}\", file=f)\n\nwith open(\"shopping.txt\", encoding=\"utf-8\") as f:\n    print(f.read())",
  sandboxSnippets: [
    snippet("write adds no line break", "with open(\"w.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"one\")\n    f.write(\"two\")\n\nwith open(\"w.txt\", encoding=\"utf-8\") as f:\n    print(repr(f.read()))"),
    snippet("\"w\" starts from empty", "with open(\"w.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"first version\\n\")\nwith open(\"w.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"second version\\n\")\nwith open(\"w.txt\", encoding=\"utf-8\") as f:\n    print(f.read())"),
    snippet("Numbers need str", "with open(\"n.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(42)"),
    snippet("print to a file", "with open(\"p.txt\", \"w\", encoding=\"utf-8\") as f:\n    print(\"Total:\", 42, file=f)\n    print(\"Done\", file=f)\n\nwith open(\"p.txt\", encoding=\"utf-8\") as f:\n    print(repr(f.read()))"),
    snippet("Join the lines", "items = [\"tea\", \"cake\", \"jam\"]\nwith open(\"j.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"\\n\".join(items) + \"\\n\")\n\nwith open(\"j.txt\", encoding=\"utf-8\") as f:\n    print(repr(f.read()))"),
  ],
  readMore: { label: "Python tutorial: methods of file objects", url: "https://docs.python.org/3/tutorial/inputoutput.html#methods-of-file-objects", source: "Python docs" },
  challenges: [
    task("easy", "Your first file", {
      prompt: "Write `Hello, file!` followed by a line break into a new file `hello.txt`.",
      hint: "`with open(\"hello.txt\", \"w\", encoding=\"utf-8\") as f:` and `f.write(\"Hello, file!\\n\")`.",
      solution: "with open(\"hello.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"Hello, file!\\n\")",
      setup: "def _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["hello.txt is right", "_read(\"hello.txt\") == \"Hello, file!\\n\""],
      ],
    }),
    task("easy", "Three lines", {
      prompt: "Write the lines `one`, `two` and `three` into `count.txt`, each ending with a line break.",
      hint: "Three `write` calls, each with `\\n` at the end, or one with `\"one\\ntwo\\nthree\\n\"`.",
      solution: "with open(\"count.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"one\\n\")\n    f.write(\"two\\n\")\n    f.write(\"three\\n\")",
      setup: "def _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["count.txt is right", "_read(\"count.txt\") == \"one\\ntwo\\nthree\\n\""],
      ],
    }),
    task("easy", "They ran together", {
      prompt: "This writes `teacakejam` on one line. Fix it so `items.txt` has one item per line.",
      starter: "items = [\"tea\", \"cake\", \"jam\"]\nwith open(\"items.txt\", \"w\", encoding=\"utf-8\") as f:\n    for item in items:\n        f.write(item)\n",
      hint: "`write` adds no line break: write `item + \"\\n\"`.",
      solution: "items = [\"tea\", \"cake\", \"jam\"]\nwith open(\"items.txt\", \"w\", encoding=\"utf-8\") as f:\n    for item in items:\n        f.write(item + \"\\n\")",
      setup: "def _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["items.txt is right", "_read(\"items.txt\") == \"tea\\ncake\\njam\\n\""],
      ],
    }),
    task("medium", "Write numbers", {
      prompt: "Write the numbers 1 to 10 into `numbers.txt`, one per line.",
      hint: "A loop over `range(1, 11)` writing `f\"{n}\\n\"`, or `print(n, file=f)`.",
      solution: "with open(\"numbers.txt\", \"w\", encoding=\"utf-8\") as f:\n    for n in range(1, 11):\n        f.write(f\"{n}\\n\")",
      setup: "def _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["numbers.txt is right", "_read(\"numbers.txt\") == \"\".join(f\"{n}\\n\" for n in range(1, 11))"],
      ],
    }),
    task("medium", "Print into a file", {
      prompt: "Use `print(..., file=f)` to write the lines `Total: 42` and `Items: 3` into `report.txt`, using the variables.",
      starter: "total = 42\nitems = 3\n",
      hint: "`print(\"Total:\", total, file=f)` adds the space and the line break.",
      solution: "total = 42\nitems = 3\nwith open(\"report.txt\", \"w\", encoding=\"utf-8\") as f:\n    print(\"Total:\", total, file=f)\n    print(\"Items:\", items, file=f)",
      setup: "def _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["report.txt is right", "_read(\"report.txt\") == \"Total: 42\\nItems: 3\\n\""],
      ],
    }),
    task("medium", "Start again", {
      prompt: "`log.txt` already has old lines in it. Replace its contents with just `fresh start` and a line break.",
      hint: "Opening with `\"w\"` empties the file first, then you write the new line.",
      solution: "with open(\"log.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"fresh start\\n\")",
      setup: "import os as _os\nwith open('log.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('old line 1\\nold line 2\\n')\ndef _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["log.txt has only the new line", "_read(\"log.txt\") == \"fresh start\\n\""],
      ],
    }),
    task("hard", "Save the scores", {
      prompt: "Define `save_scores(scores, name)` that writes one line per person, like `Ana: 91`, sorted by name, into the file `name`.",
      hint: "Open `name` for writing and loop over `sorted(scores)`, writing `f\"{person}: {scores[person]}\\n\"`.",
      solution: "def save_scores(scores, name):\n    with open(name, \"w\", encoding=\"utf-8\") as f:\n        for person in sorted(scores):\n            f.write(f\"{person}: {scores[person]}\\n\")",
      setup: "def _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["Writes the file", "(save_scores({\"Ben\": 78, \"Ana\": 91}, \"s.txt\"), _read(\"s.txt\"))[1] == \"Ana: 91\\nBen: 78\\n\""],
      ],
    }),
    task("hard", "Shout the file", {
      prompt: "Read `quiet.txt` and write its text in capitals into `loud.txt`. Leave `quiet.txt` unchanged.",
      hint: "Read it with one `with`, then write `text.upper()` with another (or open both in one `with`).",
      solution: "with open(\"quiet.txt\", encoding=\"utf-8\") as f:\n    text = f.read()\nwith open(\"loud.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(text.upper())",
      setup: "import os as _os\nwith open('quiet.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('hello there\\nhow are you?\\n')\ndef _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["loud.txt is in capitals", "_read(\"loud.txt\") == \"HELLO THERE\\nHOW ARE YOU?\\n\""],
        ["quiet.txt is unchanged", "_read(\"quiet.txt\") == \"hello there\\nhow are you?\\n\""],
      ],
    }),
    task("expert", "A table", {
      prompt: "Write `prices.txt` as a table: a header line `item,price`, then one line per item in `prices`, like `tea,2.50` (always two decimals).",
      starter: "prices = {\"tea\": 2.5, \"cake\": 3.75, \"jam\": 4}\n",
      hint: "Write the header first, then loop over `prices.items()` writing `f\"{item},{price:.2f}\\n\"`.",
      solution: "prices = {\"tea\": 2.5, \"cake\": 3.75, \"jam\": 4}\nwith open(\"prices.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"item,price\\n\")\n    for item, price in prices.items():\n        f.write(f\"{item},{price:.2f}\\n\")",
      setup: "def _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["prices.txt is right", "_read(\"prices.txt\") == \"item,price\\ntea,2.50\\ncake,3.75\\njam,4.00\\n\""],
      ],
    }),
    task("expert", "A summary report", {
      prompt: "`sales.txt` has one amount per line. Write `summary.txt` with three lines: `Count: 4`, `Total: 70.00` and `Average: 17.50`.",
      hint: "Read the amounts with `float`, then write three f-string lines with `:.2f` for the money.",
      solution: "with open(\"sales.txt\", encoding=\"utf-8\") as f:\n    amounts = [float(line) for line in f if line.strip()]\ntotal = sum(amounts)\nwith open(\"summary.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(f\"Count: {len(amounts)}\\n\")\n    f.write(f\"Total: {total:.2f}\\n\")\n    f.write(f\"Average: {total / len(amounts):.2f}\\n\")",
      setup: "import os as _os\nwith open('sales.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('12.5\\n30\\n7.5\\n20\\n')\ndef _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["summary.txt is right", "_read(\"summary.txt\") == \"Count: 4\\nTotal: 70.00\\nAverage: 17.50\\n\""],
      ],
    }),
  ],
  questions: [
    mc("What happens to an existing file opened with `\"w\"`?", ["New text goes at the end", "Its contents are thrown away first", "Python refuses to open it", "It is renamed"], 1, "`\"w\"` empties the file as it opens it, so start-of-file writing replaces everything."),
    mc("What does `f.write(\"hi\")` add after the text?", ["A line break", "A space", "Nothing", "A full stop"], 2, "Unlike `print`, `write` adds nothing, so put `\\n` in yourself."),
    mc("What does `f.write(42)` do?", ["Raises a `TypeError`: it needs a string", "Writes 42", "Writes \"42\\n\"", "Nothing"], 0, "`write` only accepts strings; convert numbers with `str()` first."),
    mc("What does `print(\"a\", \"b\", file=f)` write?", ["`ab`", "`a b` without a line break", "`[\"a\", \"b\"]`", "`a b` and a line break"], 3, "`print` uses its usual space and newline, but sends them to the file."),
    qShort("Which mode letter opens a file for writing? (one letter)", "w", "`\"w\"` is write mode: create the file or replace its contents."),
    mc("Why write the result to a different file than the original?", ["It is faster", "The original stays safe if something goes wrong", "Python can't write to a file it read", "Files can only be written once"], 1, "If the program fails halfway, the input file is still untouched."),
    mc("How do you write a list of lines with line breaks?", ["`f.write(\"\\n\".join(lines) + \"\\n\")`", "`f.write(lines)`", "`f.writelines(lines)` adds the breaks", "`f.write(str(lines))`"], 0, "`join` puts newlines between the lines, and one more ends the last line."),
    mc("What makes sure buffered text actually reaches the file?", ["Writing it twice", "Printing it", "Closing the file, which `with` does", "Reading it back"], 2, "Closing (or flushing) writes out anything still waiting in the buffer."),
    mc("`\"w\"` mode and a file that doesn't exist yet: what happens?", ["An error", "Nothing", "It asks first", "The file is created"], 3, "`\"w\"` creates the file when it doesn't exist."),
    mc("What is the read, change, write pattern?", ["Writing a file three times", "Reading a file, transforming its text, and writing the result", "Reading only the changes", "Deleting and recreating a file"], 1, "Read the text in, change it in Python, then write the new version out."),
  ],
})
