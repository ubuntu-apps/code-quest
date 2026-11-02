// Files topic: When files go wrong. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "file_errors",
  title: "When files go wrong",
  paragraphs: [
    "Files live outside your program, so many things can go wrong that your code can't prevent: the file was moved or never existed, a folder sits where you expected a file, the disk is full, or you aren't allowed to read it. Each problem raises its own exception, and all of them are kinds of `OSError`:",
    "```\nOSError\n├── FileNotFoundError     the file or folder doesn't exist\n├── FileExistsError       it exists, but you needed it not to (\"x\" mode)\n├── IsADirectoryError     you tried to open a folder as a file\n├── NotADirectoryError    a file is in the way where a folder should be\n└── PermissionError       you aren't allowed to read or write it\n```",
    "The usual pattern is `try` around the `with`, catching the specific problem you can do something about. A missing file is often a normal situation, such as the first time a program runs, before any save file exists:",
    "```\ndef load_notes(name):\n    try:\n        with open(name, encoding=\"utf-8\") as f:\n            return f.read().splitlines()\n    except FileNotFoundError:\n        return []          # no notes yet: start empty\n\nprint(load_notes(\"no-notes-yet.txt\"))   # []\n```",
    "The exception carries details: `e.filename` is the path involved, and `e.strerror` a description such as `No such file or directory`. Use them to give a clear message, such as `Can't find settings.txt`, rather than a traceback.",
    "Catch `OSError` when any file problem should be handled the same way, such as \"skip this file and carry on\". Catch the narrow ones (`FileNotFoundError`) when only that problem is expected; let the others stop the program, so you hear about them.",
    "Checking first with `os.path.exists` (LBYL) seems simpler, but the file could vanish between the check and the `open`, and it doesn't cover permissions or folders. Trying and catching (EAFP) handles every case at the moment it matters.",
    "Reading a file with the wrong encoding raises `UnicodeDecodeError`, a kind of `ValueError` rather than `OSError`: the file opened fine, but its bytes don't make sense as text. The next stage explains bytes and encodings; for now, `open(..., errors=\"replace\")` swaps unreadable bytes for a � instead of failing.",
  ],
  sandboxCode: "def load_notes(name):\n    try:\n        with open(name, encoding=\"utf-8\") as f:\n            return f.read().splitlines()\n    except FileNotFoundError:\n        return []\n\nprint(load_notes(\"missing.txt\"))\ntry:\n    open(\"missing.txt\", encoding=\"utf-8\")\nexcept FileNotFoundError as e:\n    print(\"filename:\", e.filename, \"| problem:\", e.strerror)",
  sandboxSnippets: [
    snippet("A missing file", "try:\n    with open(\"nope.txt\", encoding=\"utf-8\") as f:\n        print(f.read())\nexcept FileNotFoundError as e:\n    print(\"Can't find\", e.filename)"),
    snippet("A folder, not a file", "import os\n\nos.makedirs(\"a_folder\", exist_ok=True)\ntry:\n    open(\"a_folder\", encoding=\"utf-8\")\nexcept IsADirectoryError as e:\n    print(type(e).__name__, \"-\", e.strerror)"),
    snippet("All file errors are OSErrors", "for cls in [FileNotFoundError, FileExistsError, IsADirectoryError, PermissionError]:\n    print(cls.__name__, issubclass(cls, OSError))"),
    snippet("Bytes that aren't text", "with open(\"bin.dat\", \"wb\") as f:\n    f.write(bytes([0xff, 0xfe, 0x41]))\ntry:\n    open(\"bin.dat\", encoding=\"utf-8\").read()\nexcept UnicodeDecodeError as e:\n    print(\"UnicodeDecodeError:\", e.reason)\nprint(open(\"bin.dat\", encoding=\"utf-8\", errors=\"replace\").read())"),
  ],
  readMore: { label: "Python docs: OS exceptions", url: "https://docs.python.org/3/library/exceptions.html#os-exceptions", source: "Python docs" },
  challenges: [
    task("easy", "Read or default", {
      prompt: "Define `read_or_default(name, default=\"\")` that returns the text of the file, or `default` if it doesn't exist.",
      hint: "`try:` the `with open(...)` and `return f.read()`; `except FileNotFoundError: return default`.",
      solution: "def read_or_default(name, default=\"\"):\n    try:\n        with open(name, encoding=\"utf-8\") as f:\n            return f.read()\n    except FileNotFoundError:\n        return default",
      setup: "import os as _os\nwith open('here.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('hello\\n')\n",
      tests: [
        ["An existing file", "read_or_default(\"here.txt\") == \"hello\\n\""],
        ["A missing file", "read_or_default(\"gone.txt\", \"none\") == \"none\""],
      ],
    }),
    task("easy", "Start empty", {
      prompt: "Define `load_tasks(name)` that returns the lines of the file as a list (without line breaks), or an empty list if the file doesn't exist yet.",
      hint: "The same shape: `return f.read().splitlines()`, and `return []` on `FileNotFoundError`.",
      solution: "def load_tasks(name):\n    try:\n        with open(name, encoding=\"utf-8\") as f:\n            return f.read().splitlines()\n    except FileNotFoundError:\n        return []",
      setup: "import os as _os\nwith open('tasks.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('shop\\ncook\\n')\n",
      tests: [
        ["Some tasks", "load_tasks(\"tasks.txt\") == [\"shop\", \"cook\"]"],
        ["No file yet", "load_tasks(\"none.txt\") == []"],
      ],
    }),
    task("easy", "A friendly message", {
      prompt: "Define `open_message(name)` that returns `Opened <name>` if the file can be read, or `Can't find <filename>` using the exception's `filename`.",
      hint: "`except FileNotFoundError as e: return f\"Can't find {e.filename}\"`.",
      solution: "def open_message(name):\n    try:\n        with open(name, encoding=\"utf-8\") as f:\n            f.read()\n        return f\"Opened {name}\"\n    except FileNotFoundError as e:\n        return f\"Can't find {e.filename}\"",
      setup: "import os as _os\nwith open('here.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('hello\\n')\n",
      tests: [
        ["Found", "open_message(\"here.txt\") == \"Opened here.txt\""],
        ["Missing", "open_message(\"lost.txt\") == \"Can't find lost.txt\""],
      ],
    }),
    task("medium", "A folder by mistake", {
      prompt: "Define `safe_read(name)` that returns the text of a file, `missing` if it doesn't exist, or `folder` if `name` is a folder.",
      hint: "Two `except` clauses: `FileNotFoundError` and `IsADirectoryError`.",
      solution: "def safe_read(name):\n    try:\n        with open(name, encoding=\"utf-8\") as f:\n            return f.read()\n    except FileNotFoundError:\n        return \"missing\"\n    except IsADirectoryError:\n        return \"folder\"",
      setup: "import os as _os\nwith open('here.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('hello\\n')\n_os.makedirs('docs', exist_ok=True)\n",
      tests: [
        ["A file", "safe_read(\"here.txt\") == \"hello\\n\""],
        ["Missing", "safe_read(\"lost.txt\") == \"missing\""],
        ["A folder", "safe_read(\"docs\") == \"folder\""],
      ],
    }),
    task("medium", "Settings with defaults", {
      prompt: "Define `load_settings(name)` that starts from `{\"theme\": \"light\", \"size\": \"12\"}` and overrides it with any `key=value` lines from the file. A missing file just gives the defaults.",
      hint: "Make the defaults dict first. In `try`, read the lines and update the dict; `except FileNotFoundError: pass`. Return the dict.",
      solution: "def load_settings(name):\n    settings = {\"theme\": \"light\", \"size\": \"12\"}\n    try:\n        with open(name, encoding=\"utf-8\") as f:\n            for line in f:\n                if \"=\" in line:\n                    key, value = line.strip().split(\"=\", 1)\n                    settings[key] = value\n    except FileNotFoundError:\n        pass\n    return settings",
      setup: "import os as _os\nwith open('settings.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('theme=dark\\nlang=en\\n')\n",
      tests: [
        ["From the file", "load_settings(\"settings.txt\") == {\"theme\": \"dark\", \"size\": \"12\", \"lang\": \"en\"}"],
        ["No file", "load_settings(\"nothing.txt\") == {\"theme\": \"light\", \"size\": \"12\"}"],
      ],
    }),
    task("medium", "Any file problem", {
      prompt: "Define `line_count(name)` that returns the number of lines in a file, or `-1` for **any** file problem (missing, a folder, and so on), by catching `OSError`.",
      hint: "`except OSError: return -1` catches all of them.",
      solution: "def line_count(name):\n    try:\n        with open(name, encoding=\"utf-8\") as f:\n            return len(f.read().splitlines())\n    except OSError:\n        return -1",
      setup: "import os as _os\nwith open('tasks.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('shop\\ncook\\n')\n_os.makedirs('docs', exist_ok=True)\n",
      tests: [
        ["A file", "line_count(\"tasks.txt\") == 2"],
        ["Missing", "line_count(\"lost.txt\") == -1"],
        ["A folder", "line_count(\"docs\") == -1"],
      ],
    }),
    task("hard", "Read them all", {
      prompt: "Define `read_all(names)` that returns `(texts, missing)`: a dict of the text of each file that exists, and a list of the names that don't.",
      hint: "Loop over the names with a `try` for each one, so one missing file doesn't stop the rest.",
      solution: "def read_all(names):\n    texts = {}\n    missing = []\n    for name in names:\n        try:\n            with open(name, encoding=\"utf-8\") as f:\n                texts[name] = f.read()\n        except FileNotFoundError:\n            missing.append(name)\n    return texts, missing",
      setup: "import os as _os\nwith open('a.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('A\\n')\nwith open('b.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('B\\n')\n",
      tests: [
        ["Mixed files", "read_all([\"a.txt\", \"x.txt\", \"b.txt\"]) == ({\"a.txt\": \"A\\n\", \"b.txt\": \"B\\n\"}, [\"x.txt\"])"],
      ],
    }),
    task("hard", "Don't overwrite", {
      prompt: "Define `save_new(name, text)` that writes `text` to a new file and returns `saved`, or returns `<name> already exists` if it does, without changing it.",
      hint: "Open with `\"x\"` and catch `FileExistsError`.",
      solution: "def save_new(name, text):\n    try:\n        with open(name, \"x\", encoding=\"utf-8\") as f:\n            f.write(text)\n    except FileExistsError:\n        return f\"{name} already exists\"\n    return \"saved\"",
      setup: "import os as _os\nwith open('here.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('hello\\n')\ndef _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["A new file", "save_new(\"new.txt\", \"hi\") == \"saved\" and _read(\"new.txt\") == \"hi\""],
        ["An existing file", "save_new(\"here.txt\", \"oops\") == \"here.txt already exists\" and _read(\"here.txt\") == \"hello\\n\""],
      ],
    }),
    task("expert", "A careful copy", {
      prompt: "Define `copy_file(src, dst)` that copies the text of `src` into `dst` and returns `copied`. Return `no source: <src>` if `src` is missing, and `<dst> exists` if `dst` already exists (never overwrite it).",
      hint: "Read `src` in one `try` (catching `FileNotFoundError`), then write `dst` with `\"x\"` in another (catching `FileExistsError`).",
      solution: "def copy_file(src, dst):\n    try:\n        with open(src, encoding=\"utf-8\") as f:\n            text = f.read()\n    except FileNotFoundError:\n        return f\"no source: {src}\"\n    try:\n        with open(dst, \"x\", encoding=\"utf-8\") as f:\n            f.write(text)\n    except FileExistsError:\n        return f\"{dst} exists\"\n    return \"copied\"",
      setup: "import os as _os\nwith open('here.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('hello\\n')\nwith open('taken.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('keep me')\ndef _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["Copies", "copy_file(\"here.txt\", \"copy.txt\") == \"copied\" and _read(\"copy.txt\") == \"hello\\n\""],
        ["No source", "copy_file(\"lost.txt\", \"c2.txt\") == \"no source: lost.txt\""],
        ["Never overwrites", "copy_file(\"here.txt\", \"taken.txt\") == \"taken.txt exists\" and _read(\"taken.txt\") == \"keep me\""],
      ],
    }),
    task("expert", "Unreadable bytes", {
      prompt: "`mixed.txt` contains a few bytes that aren't valid UTF-8. Define `read_text_safely(name)` that returns the text, falling back to reading with `errors=\"replace\"` when a `UnicodeDecodeError` happens.",
      hint: "Try a normal read first; in `except UnicodeDecodeError:` open it again with `errors=\"replace\"`.",
      solution: "def read_text_safely(name):\n    try:\n        with open(name, encoding=\"utf-8\") as f:\n            return f.read()\n    except UnicodeDecodeError:\n        with open(name, encoding=\"utf-8\", errors=\"replace\") as f:\n            return f.read()",
      setup: "import os as _os\nwith open('here.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('hello\\n')\nwith open('mixed.txt', \"wb\") as _f:\n    _f.write(b'caf\\xe9 ok\\n')\n",
      tests: [
        ["A clean file", "read_text_safely(\"here.txt\") == \"hello\\n\""],
        ["Bad bytes become �", "read_text_safely(\"mixed.txt\") == \"caf\\ufffd ok\\n\""],
      ],
    }),
  ],
  questions: [
    mc("Which exception means the file doesn't exist?", ["`FileExistsError`", "`FileNotFoundError`", "`IsADirectoryError`", "`ValueError`"], 1, "`FileNotFoundError` is raised when the path doesn't exist."),
    mc("Which is the parent of the file exceptions?", ["`ValueError`", "`LookupError`", "`OSError`", "`IOErrorBase`"], 2, "File and operating-system errors are all subclasses of `OSError`."),
    mc("What does `e.filename` give?", ["The path involved in the error", "The error message", "The line number", "The file's text"], 0, "File exceptions carry the path that caused them in `filename`."),
    mc("Opening a folder with `open()` raises…", ["`FileNotFoundError`", "`PermissionError`", "`TypeError`", "`IsADirectoryError`"], 3, "`open` expects a file, so a folder raises `IsADirectoryError` (Windows raises `PermissionError`)."),
    qShort("Which mode raises `FileExistsError` if the file is already there? (one letter)", "x", "`\"x\"` mode raises `FileExistsError` instead of overwriting."),
    mc("`notes.txt` doesn't exist. What does this print?\n\n```\ntry:\n    open(\"notes.txt\").read()\nexcept FileNotFoundError as e:\n    print(e.filename)\n```", ["`notes.txt`", "`None`", "A traceback", "`FileNotFoundError`"], 0, "Trying the open and catching the error handles a missing file in one place, and `e.filename` says which one."),
    mc("When should you catch the broad `OSError`?", ["When every file problem should be handled the same way", "Always", "Never", "Only for folders"], 0, "`except OSError:` catches every file-related error."),
    mc("What does `errors=\"replace\"` do when reading?", ["Deletes bad lines", "Raises a clearer error", "Swaps unreadable bytes for �", "Converts the file"], 2, "`errors=\"replace\"` swaps bytes that can't be decoded for the replacement character."),
    mc("`UnicodeDecodeError` is a kind of…", ["`OSError`", "`KeyError`", "`TypeError`", "`ValueError`"], 3, "A decode error means the bytes are a bad value for the chosen encoding, so it is a kind of `ValueError`."),
    mc("A program runs for the first time and its save file isn't there yet. Good handling?", ["Crash with a traceback", "Catch `FileNotFoundError` and start with empty data", "Delete the folder", "Use `\"x\"` to read it"], 1, "A missing save file on the first run is normal, so start with empty data."),
  ],
})
