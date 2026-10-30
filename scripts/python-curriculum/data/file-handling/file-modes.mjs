// Files topic: Appending and file modes. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "appending",
  title: "Appending and file modes",
  paragraphs: [
    "Mode `\"w\"` replaces a file. Often you want to **add** to it instead: another line in a diary, another entry in a log. Mode `\"a\"` (append) opens the file and writes at the end, keeping everything already there. Like `\"w\"`, it creates the file if it doesn't exist.",
    "```\nwith open(\"diary.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"Monday: rain\\n\")\n\nwith open(\"diary.txt\", \"a\", encoding=\"utf-8\") as f:\n    f.write(\"Tuesday: sun\\n\")\n\nwith open(\"diary.txt\", encoding=\"utf-8\") as f:\n    print(f.read())   # both days are there\n```",
    "Appended text goes right after the last character in the file. If the file doesn't end with a line break, the new text joins the last line, so programs that append usually write a full line each time, ending with `\\n`.",
    "The modes you'll use most:",
    "```\n\"r\"    read (the default); the file must exist\n\"w\"    write; creates the file, or empties an existing one\n\"a\"    append; creates the file, or adds to the end\n\"x\"    create; fails with FileExistsError if the file exists\n\"r+\"   read and write an existing file, from the start\n```",
    "`\"x\"` is the safe choice when you must not overwrite anything, such as a new save file or an exported report: it raises `FileExistsError` instead of quietly destroying an existing file. Add `b` to any mode for binary files (`\"rb\"`, `\"wb\"`), which the stage on bytes covers.",
    "A file that's both read and updated, like a counter or a list of unique entries, is usually easiest to handle in two steps: read the whole thing, work out the new content, then write it back with `\"w\"` (or append just the new part with `\"a\"`).",
    "```\ndef add_unique(name, item):\n    try:\n        with open(name, encoding=\"utf-8\") as f:\n            existing = f.read().splitlines()\n    except FileNotFoundError:     # no file yet: nothing in it\n        existing = []\n    if item not in existing:\n        with open(name, \"a\", encoding=\"utf-8\") as f:\n            f.write(item + \"\\n\")\n\nadd_unique(\"tags.txt\", \"python\")\nadd_unique(\"tags.txt\", \"python\")   # already there: nothing added\n```",
  ],
  sandboxCode: "with open(\"log.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"started\\n\")\n\nfor event in [\"loaded data\", \"saved report\"]:\n    with open(\"log.txt\", \"a\", encoding=\"utf-8\") as f:\n        f.write(event + \"\\n\")\n\nwith open(\"log.txt\", encoding=\"utf-8\") as f:\n    print(f.read())",
  sandboxSnippets: [
    snippet("Append a line", "with open(\"a.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"first\\n\")\nwith open(\"a.txt\", \"a\", encoding=\"utf-8\") as f:\n    f.write(\"second\\n\")\nwith open(\"a.txt\", encoding=\"utf-8\") as f:\n    print(repr(f.read()))"),
    snippet("Missing line break", "with open(\"b.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"no break at the end\")\nwith open(\"b.txt\", \"a\", encoding=\"utf-8\") as f:\n    f.write(\"joined on!\\n\")\nwith open(\"b.txt\", encoding=\"utf-8\") as f:\n    print(repr(f.read()))"),
    snippet("\"x\" refuses to overwrite", "with open(\"c.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"precious\\n\")\ntry:\n    with open(\"c.txt\", \"x\", encoding=\"utf-8\") as f:\n        f.write(\"oops\\n\")\nexcept FileExistsError as e:\n    print(\"Not overwritten:\", e)"),
    snippet("A counter in a file", "with open(\"count.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"0\")\nfor _ in range(3):\n    with open(\"count.txt\", encoding=\"utf-8\") as f:\n        n = int(f.read())\n    with open(\"count.txt\", \"w\", encoding=\"utf-8\") as f:\n        f.write(str(n + 1))\nwith open(\"count.txt\", encoding=\"utf-8\") as f:\n    print(f.read())"),
  ],
  readMore: { label: "Python docs: open() and its modes", url: "https://docs.python.org/3/library/functions.html#open", source: "Python docs" },
  challenges: [
    task("easy", "Add a line", {
      prompt: "Add the line `Tuesday: sun` (with a line break) to the end of `diary.txt`, keeping what's already there.",
      hint: "Open it with mode `\"a\"`.",
      solution: "with open(\"diary.txt\", \"a\", encoding=\"utf-8\") as f:\n    f.write(\"Tuesday: sun\\n\")",
      setup: "import os as _os\nwith open('diary.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('Monday: rain\\n')\ndef _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["Both lines are there", "_read(\"diary.txt\") == \"Monday: rain\\nTuesday: sun\\n\""],
      ],
    }),
    task("easy", "Several more", {
      prompt: "Append each item of `new_items` to `list.txt`, one per line.",
      starter: "new_items = [\"jam\", \"tea\"]\n",
      hint: "One `\"a\"` open, and a loop writing `item + \"\\n\"`.",
      solution: "new_items = [\"jam\", \"tea\"]\nwith open(\"list.txt\", \"a\", encoding=\"utf-8\") as f:\n    for item in new_items:\n        f.write(item + \"\\n\")",
      setup: "import os as _os\nwith open('list.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('eggs\\nmilk\\n')\ndef _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["list.txt is right", "_read(\"list.txt\") == \"eggs\\nmilk\\njam\\ntea\\n\""],
      ],
    }),
    task("easy", "Append or overwrite?", {
      prompt: "This was meant to add a line to `log.txt`, but it wipes the old lines. Fix the mode.",
      starter: "with open(\"log.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"third\\n\")\n",
      hint: "`\"w\"` empties the file. Use `\"a\"`.",
      solution: "with open(\"log.txt\", \"a\", encoding=\"utf-8\") as f:\n    f.write(\"third\\n\")",
      setup: "import os as _os\nwith open('log.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('first\\nsecond\\n')\ndef _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["log.txt keeps the old lines", "_read(\"log.txt\") == \"first\\nsecond\\nthird\\n\""],
      ],
    }),
    task("medium", "A log function", {
      prompt: "Define `log(name, message)` that appends a line `- <message>` to the file `name`.",
      hint: "Open `name` with `\"a\"` and write `f\"- {message}\\n\"`.",
      solution: "def log(name, message):\n    with open(name, \"a\", encoding=\"utf-8\") as f:\n        f.write(f\"- {message}\\n\")",
      setup: "def _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["Two messages", "(log(\"events.txt\", \"started\"), log(\"events.txt\", \"stopped\"), _read(\"events.txt\"))[2] == \"- started\\n- stopped\\n\""],
      ],
    }),
    task("medium", "Never overwrite", {
      prompt: "Define `create(name, text)` that writes `text` to a **new** file and returns `True`, or returns `False` without touching the file if it already exists. Use mode `\"x\"`.",
      hint: "Open with `\"x\"` inside `try`, and `except FileExistsError: return False`.",
      solution: "def create(name, text):\n    try:\n        with open(name, \"x\", encoding=\"utf-8\") as f:\n            f.write(text)\n    except FileExistsError:\n        return False\n    return True",
      setup: "import os as _os\nwith open('keep.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('precious')\ndef _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["A new file", "create(\"new.txt\", \"hello\") is True and _read(\"new.txt\") == \"hello\""],
        ["An existing file is left alone", "create(\"keep.txt\", \"oops\") is False and _read(\"keep.txt\") == \"precious\""],
      ],
    }),
    task("medium", "Count after appending", {
      prompt: "Append the line `four` to `count.txt`, then set `lines` to the number of lines the file now has.",
      hint: "Append with `\"a\"`, then open it again to read and count.",
      solution: "with open(\"count.txt\", \"a\", encoding=\"utf-8\") as f:\n    f.write(\"four\\n\")\nwith open(\"count.txt\", encoding=\"utf-8\") as f:\n    lines = len(f.read().splitlines())",
      setup: "import os as _os\nwith open('count.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('one\\ntwo\\nthree\\n')\ndef _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["lines is 4", "lines == 4"],
        ["The file ends with four", "_read(\"count.txt\").endswith(\"four\\n\")"],
      ],
    }),
    task("hard", "Mind the gap", {
      prompt: "`notes.txt` doesn't end with a line break, so appending would join the last line. Append `third` as a line of its own, adding the missing line break first if it's needed.",
      hint: "Read the file; if it isn't empty and doesn't end with `\"\\n\"`, write a `\"\\n\"` before `third\\n`.",
      solution: "with open(\"notes.txt\", encoding=\"utf-8\") as f:\n    text = f.read()\nwith open(\"notes.txt\", \"a\", encoding=\"utf-8\") as f:\n    if text and not text.endswith(\"\\n\"):\n        f.write(\"\\n\")\n    f.write(\"third\\n\")",
      setup: "import os as _os\nwith open('notes.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('first\\nsecond')\ndef _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["notes.txt is right", "_read(\"notes.txt\") == \"first\\nsecond\\nthird\\n\""],
      ],
    }),
    task("hard", "Visitor counter", {
      prompt: "Define `visit(name)` that reads a number from the file `name` (0 if the file doesn't exist), adds 1, writes the new number back, and returns it.",
      hint: "`try` to read and `int` the file; on `FileNotFoundError` start at 0. Then write `str(count)` with `\"w\"`.",
      solution: "def visit(name):\n    try:\n        with open(name, encoding=\"utf-8\") as f:\n            count = int(f.read())\n    except FileNotFoundError:\n        count = 0\n    count += 1\n    with open(name, \"w\", encoding=\"utf-8\") as f:\n        f.write(str(count))\n    return count",
      setup: "def _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["Counts up", "[visit(\"visits.txt\") for _ in range(3)] == [1, 2, 3]"],
        ["Saved in the file", "(visit(\"v2.txt\"), _read(\"v2.txt\"))[1] == \"1\""],
      ],
    }),
    task("expert", "Only new tags", {
      prompt: "Define `add_unique(name, item)` that appends `item` as a line to the file `name` only if it isn't a line there already, and returns `True` if it was added. A missing file counts as empty.",
      hint: "Read the existing lines (an empty list on `FileNotFoundError`), check `item in existing`, then append.",
      solution: "def add_unique(name, item):\n    try:\n        with open(name, encoding=\"utf-8\") as f:\n            existing = f.read().splitlines()\n    except FileNotFoundError:\n        existing = []\n    if item in existing:\n        return False\n    with open(name, \"a\", encoding=\"utf-8\") as f:\n        f.write(item + \"\\n\")\n    return True",
      setup: "def _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["Adds new items once", "[add_unique(\"tags.txt\", t) for t in [\"python\", \"files\", \"python\"]] == [True, True, False]"],
        ["The file has each once", "(add_unique(\"t2.txt\", \"a\"), add_unique(\"t2.txt\", \"a\"), _read(\"t2.txt\"))[2] == \"a\\n\""],
      ],
    }),
    task("expert", "Keep the last five", {
      prompt: "Define `remember(name, entry, keep=5)` that adds `entry` as a line to the file `name` but keeps only the newest `keep` lines (older ones are dropped). A missing file counts as empty.",
      hint: "Read the lines (or `[]`), append the new entry, keep `lines[-keep:]`, and write them all back with `\"w\"`.",
      solution: "def remember(name, entry, keep=5):\n    try:\n        with open(name, encoding=\"utf-8\") as f:\n            lines = f.read().splitlines()\n    except FileNotFoundError:\n        lines = []\n    lines.append(entry)\n    lines = lines[-keep:]\n    with open(name, \"w\", encoding=\"utf-8\") as f:\n        f.write(\"\\n\".join(lines) + \"\\n\")",
      setup: "def _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["Keeps the newest five", "([remember(\"recent.txt\", f\"item {i}\") for i in range(1, 8)], _read(\"recent.txt\"))[1] == \"item 3\\nitem 4\\nitem 5\\nitem 6\\nitem 7\\n\""],
        ["A smaller keep", "([remember(\"r2.txt\", x, keep=2) for x in \"abc\"], _read(\"r2.txt\"))[1] == \"b\\nc\\n\""],
      ],
    }),
  ],
  questions: [
    mc("What does mode `\"a\"` do?", ["Reads the file", "Writes at the end, keeping what is there", "Empties the file", "Opens it as binary"], 1),
    mc("What does mode `\"a\"` do when the file doesn't exist?", ["Raises `FileNotFoundError`", "Asks first", "Creates it", "Nothing"], 2),
    mc("What does mode `\"x\"` do if the file already exists?", ["Raises `FileExistsError`", "Overwrites it", "Appends to it", "Renames it"], 0),
    mc("Why do appended lines sometimes join the last line?", ["Append mode removes line breaks", "The file was opened with `\"r\"`", "Python adds a space", "The file didn't end with a line break"], 3),
    mc("Which mode reads and writes an existing file from the start?", ["`\"w+\"`", "`\"r+\"`", "`\"a\"`", "`\"x\"`"], 1),
    mc("How do you update a counter stored in a file?", ["Read it, add 1, write it back with `\"w\"`", "Open it with `\"x\"`", "Append the new number", "Rename the file"], 0),
    mc("What does adding `b` to a mode, as in `\"rb\"`, mean?", ["Bigger buffer", "Backup first", "Binary: bytes instead of text", "Blank file"], 2),
    mc("Which mode is safest for a new save file you must not overwrite?", ["`\"w\"`", "`\"a\"`", "`\"r+\"`", "`\"x\"`"], 3),
  ],
})
