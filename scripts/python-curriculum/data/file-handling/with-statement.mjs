// Files topic: The with statement. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "with_statement",
  title: "The with statement",
  paragraphs: [
    "Remembering to call `close()` is easy to forget, and if an error happens between `open` and `close`, the `close()` line never runs. The `with` statement solves both problems: it opens the file, runs the indented block, and **always** closes the file afterwards, whether the block finished normally or with an error.",
    "```\nwith open(\"hello.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"Hello again!\\n\")\n\nwith open(\"hello.txt\", encoding=\"utf-8\") as f:\n    text = f.read()\n\nprint(text)\nprint(f.closed)   # True: closed as soon as the block ended\n```",
    "Read it as: \"with the file `hello.txt` open, and called `f`, do this\". The name after `as` is the file object, just like the result of `open` in the last lesson. Variables you create inside the block, such as `text`, still exist after it; only the file is closed.",
    "From now on, use `with` whenever you open a file. It's shorter, it can't forget, and every experienced Python programmer will expect it.",
    "One `with` can open several files at once, separated by commas, which is handy for reading one file while writing another:",
    "```\nwith open(\"a.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"from a\\n\")\n\nwith open(\"a.txt\", encoding=\"utf-8\") as src, open(\"b.txt\", \"w\", encoding=\"utf-8\") as dst:\n    dst.write(src.read().upper())\n```",
    "Wrapping the `with` in a function gives you a small, reusable tool: `read_file(name)` that returns the text, or `count_lines(name)`. The file is opened and closed inside, and the caller never has to think about it.",
    "`with` isn't only for files. It works with anything that needs setting up and tidying away, such as network connections and locks. Objects that work with `with` are called **context managers**.",
  ],
  sandboxCode: "with open(\"todo.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"learn with\\npractise\\n\")\n\nwith open(\"todo.txt\", encoding=\"utf-8\") as f:\n    text = f.read()\n\nprint(repr(text))\nprint(\"closed?\", f.closed)",
  sandboxSnippets: [
    snippet("Closed after the block", "with open(\"x.txt\", \"w\", encoding=\"utf-8\") as f:\n    print(\"inside, closed?\", f.closed)\nprint(\"after, closed?\", f.closed)"),
    snippet("Closed even after an error", "try:\n    with open(\"y.txt\", \"w\", encoding=\"utf-8\") as f:\n        raise ValueError(\"something broke\")\nexcept ValueError:\n    pass\nprint(\"closed?\", f.closed)"),
    snippet("Two files at once", "with open(\"in.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"quiet words\\n\")\n\nwith open(\"in.txt\", encoding=\"utf-8\") as src, open(\"out.txt\", \"w\", encoding=\"utf-8\") as dst:\n    dst.write(src.read().upper())\n\nwith open(\"out.txt\", encoding=\"utf-8\") as f:\n    print(f.read())"),
    snippet("A reading function", "def read_file(name):\n    with open(name, encoding=\"utf-8\") as f:\n        return f.read()\n\nwith open(\"z.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"hello\\n\")\nprint(repr(read_file(\"z.txt\")))"),
  ],
  readMore: { label: "Python tutorial: reading and writing files", url: "https://docs.python.org/3/tutorial/inputoutput.html#reading-and-writing-files", source: "Python docs" },
  challenges: [
    task("easy", "Read with with", {
      prompt: "Read the whole of `notes.txt` into `text`, using `with`.",
      hint: "`with open(\"notes.txt\", encoding=\"utf-8\") as f:` and `text = f.read()` indented inside.",
      solution: "with open(\"notes.txt\", encoding=\"utf-8\") as f:\n    text = f.read()",
      setup: "import os as _os\nwith open('notes.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('Buy milk\\nCall Ana\\nWater the plants\\n')\n",
      tests: [
        ["text is the whole file", "text == 'Buy milk\\nCall Ana\\nWater the plants\\n'"],
        ["The file is closed", "f.closed"],
      ],
    }),
    task("easy", "It forgot to close", {
      prompt: "This code never closes the file. Rewrite it with a `with` statement, so the file is closed automatically.",
      starter: "f = open(\"notes.txt\", encoding=\"utf-8\")\nlines = f.read().splitlines()\n",
      hint: "`with open(\"notes.txt\", encoding=\"utf-8\") as f:` with the second line indented inside it.",
      solution: "with open(\"notes.txt\", encoding=\"utf-8\") as f:\n    lines = f.read().splitlines()",
      setup: "import os as _os\nwith open('notes.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('Buy milk\\nCall Ana\\nWater the plants\\n')\n",
      tests: [
        ["lines is right", "lines == [\"Buy milk\", \"Call Ana\", \"Water the plants\"]"],
        ["The file is closed", "f.closed"],
      ],
    }),
    task("easy", "Closed or not?", {
      prompt: "Read `notes.txt` with `with`. Inside the block set `inside = f.closed`, and after the block `after = f.closed`.",
      hint: "`f.closed` is `False` while the file is open and `True` once `with` has closed it.",
      solution: "with open(\"notes.txt\", encoding=\"utf-8\") as f:\n    inside = f.closed\nafter = f.closed",
      setup: "import os as _os\nwith open('notes.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('Buy milk\\nCall Ana\\nWater the plants\\n')\n",
      tests: [
        ["inside is False", "inside is False"],
        ["after is True", "after is True"],
      ],
    }),
    task("medium", "Just one line", {
      prompt: "Set `first` to the first line of `notes.txt`, without the line break, using `f.readline()` inside a `with` block.",
      hint: "`f.readline()` reads one line, including its `\\n`; `.rstrip(\"\\n\")` removes it.",
      solution: "with open(\"notes.txt\", encoding=\"utf-8\") as f:\n    first = f.readline().rstrip(\"\\n\")",
      setup: "import os as _os\nwith open('notes.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('Buy milk\\nCall Ana\\nWater the plants\\n')\n",
      tests: [
        ["first is Buy milk", "first == \"Buy milk\""],
      ],
    }),
    task("medium", "Two at once", {
      prompt: "Open `a.txt` and `b.txt` in one `with` statement and set `combined` to the text of `a.txt` followed by the text of `b.txt`.",
      hint: "`with open(\"a.txt\", ...) as fa, open(\"b.txt\", ...) as fb:` then `combined = fa.read() + fb.read()`.",
      solution: "with open(\"a.txt\", encoding=\"utf-8\") as fa, open(\"b.txt\", encoding=\"utf-8\") as fb:\n    combined = fa.read() + fb.read()",
      setup: "import os as _os\nwith open('a.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('first file\\n')\nwith open('b.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('second file\\n')\n",
      tests: [
        ["combined is right", "combined == \"first file\\nsecond file\\n\""],
      ],
    }),
    task("medium", "A reading tool", {
      prompt: "Define `read_file(name)` that returns the whole text of a file, using `with`.",
      hint: "Return from inside the `with` block: the file is still closed on the way out.",
      solution: "def read_file(name):\n    with open(name, encoding=\"utf-8\") as f:\n        return f.read()",
      setup: "import os as _os\nwith open('notes.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('Buy milk\\nCall Ana\\nWater the plants\\n')\nwith open('b.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('second file\\n')\n",
      tests: [
        ["Reads notes.txt", "read_file(\"notes.txt\") == 'Buy milk\\nCall Ana\\nWater the plants\\n'"],
        ["Reads another file", "read_file(\"b.txt\") == \"second file\\n\""],
      ],
    }),
    task("hard", "Count the lines", {
      prompt: "Define `count_lines(name)` that returns how many lines a file has.",
      hint: "Inside `with`, `return len(f.read().splitlines())`.",
      solution: "def count_lines(name):\n    with open(name, encoding=\"utf-8\") as f:\n        return len(f.read().splitlines())",
      setup: "import os as _os\nwith open('notes.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('Buy milk\\nCall Ana\\nWater the plants\\n')\nwith open('empty.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('')\n",
      tests: [
        ["notes.txt has 3", "count_lines(\"notes.txt\") == 3"],
        ["empty.txt has 0", "count_lines(\"empty.txt\") == 0"],
      ],
    }),
    task("hard", "Closed after an error", {
      prompt: "The block below raises a `ValueError`. Catch it around the `with`, and set `was_closed` to `f.closed` afterwards, to see that `with` closed the file anyway.",
      starter: "with open(\"notes.txt\", encoding=\"utf-8\") as f:\n    int(f.readline())\n",
      hint: "Wrap the whole `with` in `try`/`except ValueError: pass`, then `was_closed = f.closed`.",
      solution: "try:\n    with open(\"notes.txt\", encoding=\"utf-8\") as f:\n        int(f.readline())\nexcept ValueError:\n    pass\nwas_closed = f.closed",
      setup: "import os as _os\nwith open('notes.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('Buy milk\\nCall Ana\\nWater the plants\\n')\n",
      tests: [
        ["was_closed is True", "was_closed is True"],
      ],
    }),
    task("expert", "The longest word", {
      prompt: "Define `longest_word(name)` that returns the longest word in a file (the first one, on a tie).",
      hint: "Read the text with `with`, then `max(text.split(), key=len)`.",
      solution: "def longest_word(name):\n    with open(name, encoding=\"utf-8\") as f:\n        return max(f.read().split(), key=len)",
      setup: "import os as _os\nwith open('notes.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('Buy milk\\nCall Ana\\nWater the plants\\n')\nwith open('story.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('cats sleep everywhere they can\\n')\n",
      tests: [
        ["In notes.txt", "longest_word(\"notes.txt\") == \"plants\""],
        ["In story.txt", "longest_word(\"story.txt\") == \"everywhere\""],
      ],
    }),
    task("expert", "Read the settings", {
      prompt: "Define `read_settings(name)` that reads lines like `theme = dark` into a dict (keys and values stripped), skipping blank lines.",
      hint: "Loop over `f.read().splitlines()`; skip `if not line.strip()`; `key, value = line.split(\"=\", 1)`.",
      solution: "def read_settings(name):\n    settings = {}\n    with open(name, encoding=\"utf-8\") as f:\n        for line in f.read().splitlines():\n            if not line.strip():\n                continue\n            key, value = line.split(\"=\", 1)\n            settings[key.strip()] = value.strip()\n    return settings",
      setup: "import os as _os\nwith open('settings.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('theme = dark\\n\\nsize=14\\nname =  Ana Lima \\n')\n",
      tests: [
        ["Reads the settings", "read_settings(\"settings.txt\") == {\"theme\": \"dark\", \"size\": \"14\", \"name\": \"Ana Lima\"}"],
      ],
    }),
  ],
  questions: [
    mc("What does `with` do with the file when its block ends?", ["Deletes it", "Closes it", "Leaves it open", "Reads it again"], 1),
    mc("Does `with` close the file if the block raises an error?", ["No", "Only for reading", "Yes, always", "Only with `finally`"], 2),
    mc("In `with open(\"a.txt\") as f:`, what is `f`?", ["The file object", "The file name", "The text", "A list of lines"], 0),
    mc("After a `with` block, can you still use a variable created inside it?", ["No, it is deleted", "Only if it is a string", "Only inside a function", "Yes; only the file is closed"], 3),
    qShort("After a `with` block ends, what is `f.closed`? (True or False)", "True"),
    mc("How do you open two files in one `with`?", ["Two `with` keywords on one line", "Separate them with commas", "Use `and`", "You can't"], 1),
    mc("What does `f.readline()` return?", ["The next line, including its `\\n`", "All the lines", "The line number", "The last line"], 0),
    mc("What are objects that work with `with` called?", ["Iterators", "Modules", "Context managers", "Generators"], 2),
    mc("Why prefer `with` over `open` and `close`?", ["It reads faster", "It works without a file name", "It makes files smaller", "It can't forget to close the file"], 3),
    mc("`def read_file(name)` returns from inside `with`. Is the file closed?", ["No", "Yes, on the way out", "Only on errors", "Only if you call close"], 1),
  ],
})
