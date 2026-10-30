// Files project: Notes keeper. Lesson, Try-it snippets, challenges and quiz.
import { makeProject, mc, qShort, snippet, task, typedInput } from '../_builders.mjs'

export default makeProject("easy", {
  id: "proj_notes_keeper",
  title: "Notes keeper",
  paragraphs: [
    "Build a little notes app whose notes survive after the program ends, because they're kept in a file, `notes.txt`, one note per line. Each feature is a small function; the last step joins them into a command loop.",
    "A session looks like this:",
    "```\n> add buy milk\nSaved.\n> add call Ana about Friday\nSaved.\n> list\n1. buy milk\n2. call Ana about Friday\n> find ana\n- call Ana about Friday\n> quit\nBye!\n```",
    "It uses the whole quest: appending to add a note, reading line by line to list them, a missing file treated as \"no notes yet\", and rewriting the file to delete one. `command.partition(\" \")` splits a command at the first space into the action and the rest: `\"add buy milk\"` gives `(\"add\", \" \", \"buy milk\")`.",
    "Build it in steps. To try the sandbox, type one command per line in the Input box; the notes file stays in the sandbox until the page reloads.",
  ],
  sandboxCode: "def add_note(name, text):\n    with open(name, \"a\", encoding=\"utf-8\") as f:\n        f.write(text + \"\\n\")\n\ndef list_notes(name):\n    try:\n        with open(name, encoding=\"utf-8\") as f:\n            return f.read().splitlines()\n    except FileNotFoundError:\n        return []\n\nadd_note(\"demo-notes.txt\", input(\"New note: \"))\nfor number, note in enumerate(list_notes(\"demo-notes.txt\"), start=1):\n    print(f\"{number}. {note}\")",
  sandboxSnippets: [
    snippet("partition", "print(\"add buy milk\".partition(\" \"))\nprint(\"list\".partition(\" \"))"),
    snippet("Append a line", "with open(\"n.txt\", \"a\", encoding=\"utf-8\") as f:\n    f.write(\"a note\\n\")\nprint(open(\"n.txt\", encoding=\"utf-8\").read())"),
    snippet("Delete by number", "notes = [\"one\", \"two\", \"three\"]\ndel notes[2 - 1]\nprint(notes)"),
  ],
  challenges: [
    task("easy", "Add a note", {
      prompt: "Define `add_note(name, text)` that appends `text` as a new line to the file `name`.",
      hint: "Open with `\"a\"` and write `text + \"\\n\"`.",
      solution: "def add_note(name, text):\n    with open(name, \"a\", encoding=\"utf-8\") as f:\n        f.write(text + \"\\n\")\n",
      setup: "def _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["Two notes", "(add_note(\"n.txt\", \"buy milk\"), add_note(\"n.txt\", \"call Ana\"), _read(\"n.txt\"))[2] == \"buy milk\\ncall Ana\\n\""],
      ],
    }),
    task("easy", "List the notes", {
      prompt: "Define `list_notes(name)` that returns the notes as a list of lines, or an empty list if the file doesn't exist yet.",
      hint: "Read with `splitlines()` inside `try`; `return []` on `FileNotFoundError`.",
      solution: "def list_notes(name):\n    try:\n        with open(name, encoding=\"utf-8\") as f:\n            return f.read().splitlines()\n    except FileNotFoundError:\n        return []\n",
      setup: "import os as _os\nwith open('notes.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('buy milk\\ncall Ana\\n')\n",
      tests: [
        ["Some notes", "list_notes(\"notes.txt\") == [\"buy milk\", \"call Ana\"]"],
        ["No file yet", "list_notes(\"none.txt\") == []"],
      ],
    }),
    task("medium", "Search", {
      prompt: "Define `find_notes(name, word)` that returns the notes containing `word`, ignoring capitals. Use `list_notes`.",
      starter: "def add_note(name, text):\n    with open(name, \"a\", encoding=\"utf-8\") as f:\n        f.write(text + \"\\n\")\n\ndef list_notes(name):\n    try:\n        with open(name, encoding=\"utf-8\") as f:\n            return f.read().splitlines()\n    except FileNotFoundError:\n        return []\n\n",
      hint: "A comprehension over `list_notes(name)` with `word.lower() in note.lower()`.",
      solution: "def add_note(name, text):\n    with open(name, \"a\", encoding=\"utf-8\") as f:\n        f.write(text + \"\\n\")\n\ndef list_notes(name):\n    try:\n        with open(name, encoding=\"utf-8\") as f:\n            return f.read().splitlines()\n    except FileNotFoundError:\n        return []\n\ndef find_notes(name, word):\n    return [note for note in list_notes(name) if word.lower() in note.lower()]\n",
      setup: "import os as _os\nwith open('notes.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('buy milk\\ncall Ana about Friday\\nbuy stamps\\n')\n",
      tests: [
        ["Finds Ana", "find_notes(\"notes.txt\", \"ana\") == [\"call Ana about Friday\"]"],
        ["Finds two", "find_notes(\"notes.txt\", \"BUY\") == [\"buy milk\", \"buy stamps\"]"],
        ["No file", "find_notes(\"none.txt\", \"x\") == []"],
      ],
    }),
    task("medium", "Count them", {
      prompt: "Set `count` to the number of notes in `notes.txt` and `longest` to the longest note, using `list_notes`.",
      starter: "def list_notes(name):\n    try:\n        with open(name, encoding=\"utf-8\") as f:\n            return f.read().splitlines()\n    except FileNotFoundError:\n        return []\n\n",
      hint: "`notes = list_notes(\"notes.txt\")`, then `len(notes)` and `max(notes, key=len)`.",
      solution: "def list_notes(name):\n    try:\n        with open(name, encoding=\"utf-8\") as f:\n            return f.read().splitlines()\n    except FileNotFoundError:\n        return []\n\nnotes = list_notes(\"notes.txt\")\ncount = len(notes)\nlongest = max(notes, key=len)",
      setup: "import os as _os\nwith open('notes.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('buy milk\\ncall Ana about Friday\\nbuy stamps\\n')\n",
      tests: [
        ["count is 3", "count == 3"],
        ["longest is right", "longest == \"call Ana about Friday\""],
      ],
    }),
    task("hard", "Delete a note", {
      prompt: "Define `delete_note(name, number)` that removes note number `number` (counting from 1) by rewriting the file, and returns `True`, or returns `False` (changing nothing) if there's no such note.",
      starter: "def add_note(name, text):\n    with open(name, \"a\", encoding=\"utf-8\") as f:\n        f.write(text + \"\\n\")\n\ndef list_notes(name):\n    try:\n        with open(name, encoding=\"utf-8\") as f:\n            return f.read().splitlines()\n    except FileNotFoundError:\n        return []\n\n",
      hint: "Load the notes, check `1 <= number <= len(notes)`, `del notes[number - 1]`, then write them all back with `\"w\"`.",
      solution: "def add_note(name, text):\n    with open(name, \"a\", encoding=\"utf-8\") as f:\n        f.write(text + \"\\n\")\n\ndef list_notes(name):\n    try:\n        with open(name, encoding=\"utf-8\") as f:\n            return f.read().splitlines()\n    except FileNotFoundError:\n        return []\n\ndef delete_note(name, number):\n    notes = list_notes(name)\n    if not 1 <= number <= len(notes):\n        return False\n    del notes[number - 1]\n    with open(name, \"w\", encoding=\"utf-8\") as f:\n        for note in notes:\n            f.write(note + \"\\n\")\n    return True\n",
      setup: "import os as _os\nwith open('notes.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('buy milk\\ncall Ana about Friday\\nbuy stamps\\n')\ndef _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["Deletes the second", "delete_note(\"notes.txt\", 2) is True and _read(\"notes.txt\") == \"buy milk\\nbuy stamps\\n\""],
        ["No such note", "delete_note(\"notes.txt\", 9) is False and _read(\"notes.txt\") == \"buy milk\\nbuy stamps\\n\""],
      ],
    }),
    task("hard", "The notes app", {
      prompt: "Write the command loop from the intro: read commands with `input(\"> \")` until `quit` (print `Bye!`), handling `add <text>` (print `Saved.`), `list` (numbered, or `No notes yet.`) and `find <word>` (each match as `- note`), using `notes.txt`. Anything else prints `Commands: add <text>, list, find <word>, quit`. The check types `list`, `add buy milk`, `add call Ana`, `find ana`, `list`, `help` and `quit`.",
      starter: "def add_note(name, text):\n    with open(name, \"a\", encoding=\"utf-8\") as f:\n        f.write(text + \"\\n\")\n\ndef list_notes(name):\n    try:\n        with open(name, encoding=\"utf-8\") as f:\n            return f.read().splitlines()\n    except FileNotFoundError:\n        return []\n\ndef find_notes(name, word):\n    return [note for note in list_notes(name) if word.lower() in note.lower()]\n\ndef delete_note(name, number):\n    notes = list_notes(name)\n    if not 1 <= number <= len(notes):\n        return False\n    del notes[number - 1]\n    with open(name, \"w\", encoding=\"utf-8\") as f:\n        for note in notes:\n            f.write(note + \"\\n\")\n    return True\n\n",
      hint: "Split each command with `action, _, rest = command.partition(\" \")`, then use `if`/`elif` on the action.",
      solution: "def add_note(name, text):\n    with open(name, \"a\", encoding=\"utf-8\") as f:\n        f.write(text + \"\\n\")\n\ndef list_notes(name):\n    try:\n        with open(name, encoding=\"utf-8\") as f:\n            return f.read().splitlines()\n    except FileNotFoundError:\n        return []\n\ndef find_notes(name, word):\n    return [note for note in list_notes(name) if word.lower() in note.lower()]\n\ndef delete_note(name, number):\n    notes = list_notes(name)\n    if not 1 <= number <= len(notes):\n        return False\n    del notes[number - 1]\n    with open(name, \"w\", encoding=\"utf-8\") as f:\n        for note in notes:\n            f.write(note + \"\\n\")\n    return True\n\nwhile True:\n    command = input(\"> \").strip()\n    if command == \"quit\":\n        print(\"Bye!\")\n        break\n    action, _, rest = command.partition(\" \")\n    if action == \"add\" and rest:\n        add_note(\"notes.txt\", rest)\n        print(\"Saved.\")\n    elif action == \"list\":\n        notes = list_notes(\"notes.txt\")\n        if not notes:\n            print(\"No notes yet.\")\n        for number, note in enumerate(notes, start=1):\n            print(f\"{number}. {note}\")\n    elif action == \"find\" and rest:\n        for note in find_notes(\"notes.txt\", rest):\n            print(f\"- {note}\")\n    else:\n        print(\"Commands: add <text>, list, find <word>, quit\")\n",
      setup: typedInput("list", "add buy milk", "add call Ana", "find ana", "list", "help", "quit") + "def _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["Replies to every command", "[l for l in _cq_stdout.strip().splitlines() if not l.startswith(\"> \")] == [\"No notes yet.\", \"Saved.\", \"Saved.\", \"- call Ana\", \"1. buy milk\", \"2. call Ana\", \"Commands: add <text>, list, find <word>, quit\", \"Bye!\"]"],
        ["notes.txt is saved", "_read(\"notes.txt\") == \"buy milk\\ncall Ana\\n\""],
      ],
    }),
  ],
  questions: [
    mc("What does `notes.txt` contain after this runs, if the file didn't exist before?\n\n```\nfor note in [\"milk\", \"eggs\"]:\n    with open(\"notes.txt\", \"a\") as f:\n        f.write(note + \"\\n\")\n```", ["Only `eggs`", "Two lines: `milk` and `eggs`", "`milkeggs` on one line", "Nothing: `\"a\"` can't create a file"], 1),
    mc("Which mode adds a note without losing the others?", ["`\"w\"`", "`\"r\"`", "`\"a\"`", "`\"x\"`"], 2),
    mc("What should `list_notes` do when `notes.txt` doesn't exist yet?", ["Return an empty list", "Crash with a traceback", "Create a folder", "Return `None`"], 0),
    mc("How does `delete_note` remove a note?", ["Appends a blank line", "Opens the file with `\"x\"`", "Uses `os.remove`", "Reads all the notes, removes one, and writes the rest back with `\"w\"`"], 3),
    qShort("`\"find milk\".partition(\" \")[2]` gives which word?", "milk"),
    mc("Note number 1 is at which index of the list?", ["1", "0", "-1", "2"], 1),
  ],
})
