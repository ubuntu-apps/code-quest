// Files topic: Paths with pathlib. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "pathlib_data",
  title: "Paths with pathlib",
  paragraphs: [
    "`pathlib` is the modern way to work with paths. Instead of passing strings to `os` functions, you make a `Path` object, and the path itself knows how to answer questions about it. Many Python programmers prefer it, because the code reads naturally.",
    "```\nfrom pathlib import Path\n\np = Path(\"data\") / \"2026\" / \"sales.txt\"   # / joins path parts\nprint(p)                  # data/2026/sales.txt (on Mac and Linux)\nprint(p.name)             # sales.txt\nprint(p.stem, p.suffix)   # sales .txt\nprint(p.parent)           # data/2026\n```",
    "The `/` operator joins parts, using the right separator for the computer, just like `os.path.join`. `.name` is the last part, `.stem` the name without its extension, `.suffix` the extension (with its dot) and `.parent` the folder above. Like `os.path`, these don't touch the disk.",
    "Questions about the disk are methods: `p.exists()`, `p.is_file()` and `p.is_dir()`. `p.stat().st_size` is the size in bytes. `p.mkdir(parents=True, exist_ok=True)` creates a folder and any missing ones above it.",
    "For small files, a `Path` can read and write the whole text in one call, opening and closing the file for you: `p.read_text(encoding=\"utf-8\")` returns the text, and `p.write_text(text, encoding=\"utf-8\")` replaces the file with it. For line-by-line work on big files, `p.open(encoding=\"utf-8\")` works just like `open(p)`, with `with`.",
    "```\nfrom pathlib import Path\n\nfolder = Path(\"notes\")\nfolder.mkdir(exist_ok=True)\n(folder / \"todo.txt\").write_text(\"buy milk\\n\", encoding=\"utf-8\")\nprint((folder / \"todo.txt\").read_text(encoding=\"utf-8\"))\n```",
    "`folder.iterdir()` goes through everything in a folder, giving `Path` objects. `folder.glob(\"*.txt\")` gives just the entries whose names match a pattern (`*` means \"anything\"), and `folder.rglob(\"*.txt\")` also searches every folder inside it. Sort them when the order matters.",
    "```\nfrom pathlib import Path\n\nfor p in sorted(Path(\".\").glob(\"*.txt\")):\n    print(p.name, p.stat().st_size)\n```",
    "Anything that takes a path also takes a `Path`: `open(p)`, `os.path.exists(p)` and so on. Use `str(p)` when you really need it as text. `p.rename(new)` and `p.unlink()` (delete) work like `os.rename` and `os.remove`.",
  ],
  sandboxCode: "from pathlib import Path\n\nfolder = Path(\"demo\")\nfolder.mkdir(exist_ok=True)\n(folder / \"a.txt\").write_text(\"hello\\n\", encoding=\"utf-8\")\n(folder / \"b.md\").write_text(\"# title\\n\", encoding=\"utf-8\")\n\nfor p in sorted(folder.iterdir()):\n    print(p.name, p.suffix, p.stat().st_size, \"bytes\")\nprint([p.name for p in folder.glob(\"*.txt\")])",
  sandboxSnippets: [
    snippet("Join with /", "from pathlib import Path\n\np = Path(\"music\") / \"jazz\" / \"track01.mp3\"\nprint(p, p.name, p.stem, p.suffix, p.parent)"),
    snippet("Read and write text", "from pathlib import Path\n\np = Path(\"quick.txt\")\np.write_text(\"one\\ntwo\\n\", encoding=\"utf-8\")\nprint(p.read_text(encoding=\"utf-8\").splitlines())"),
    snippet("Does it exist?", "from pathlib import Path\n\nprint(Path(\"quick.txt\").exists(), Path(\"missing.txt\").exists(), Path(\".\").is_dir())"),
    snippet("glob", "from pathlib import Path\n\nfor name in [\"a.txt\", \"b.txt\", \"c.csv\"]:\n    Path(name).write_text(\"x\", encoding=\"utf-8\")\nprint(sorted(p.name for p in Path(\".\").glob(\"*.txt\")))"),
    snippet("Change a suffix", "from pathlib import Path\n\np = Path(\"reports\") / \"jan.txt\"\nprint(p.with_suffix(\".csv\"), p.with_name(\"feb.txt\"))"),
  ],
  readMore: { label: "Python docs: pathlib", url: "https://docs.python.org/3/library/pathlib.html", source: "Python docs" },
  challenges: [
    task("easy", "Build a Path", {
      prompt: "Set `p` to the `Path` of `sales.txt` inside `2026` inside `data`, using `/`.",
      starter: "from pathlib import Path\n\n",
      hint: "`p = Path(\"data\") / \"2026\" / \"sales.txt\"`.",
      solution: "from pathlib import Path\n\np = Path(\"data\") / \"2026\" / \"sales.txt\"",
      tests: [
        ["p is right", "p == __import__(\"pathlib\").Path(\"data\", \"2026\", \"sales.txt\")"],
      ],
    }),
    task("easy", "Its parts", {
      prompt: "Set `name`, `stem`, `suffix` and `parent_name` (the name of the folder it's in) for `p`.",
      starter: "from pathlib import Path\n\np = Path(\"photos\") / \"2026\" / \"beach.jpg\"\n",
      hint: "`p.name`, `p.stem`, `p.suffix` and `p.parent.name`.",
      solution: "from pathlib import Path\n\np = Path(\"photos\") / \"2026\" / \"beach.jpg\"\nname = p.name\nstem = p.stem\nsuffix = p.suffix\nparent_name = p.parent.name",
      tests: [
        ["name", "name == \"beach.jpg\""],
        ["stem", "stem == \"beach\""],
        ["suffix", "suffix == \".jpg\""],
        ["parent_name", "parent_name == \"2026\""],
      ],
    }),
    task("easy", "Read it in one go", {
      prompt: "Set `text` to the text of `readme.md`, using `Path.read_text`.",
      starter: "from pathlib import Path\n\n",
      hint: "`Path(\"readme.md\").read_text(encoding=\"utf-8\")`.",
      solution: "from pathlib import Path\n\ntext = Path(\"readme.md\").read_text(encoding=\"utf-8\")",
      setup: "import os as _os\n_os.makedirs('docs', exist_ok=True)\nwith open('docs/report.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('quarterly numbers\\n')\n_os.makedirs('docs', exist_ok=True)\nwith open('docs/notes.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('remember\\n')\n_os.makedirs('docs', exist_ok=True)\nwith open('docs/photo.png', \"wb\") as _f:\n    _f.write(b'\\x89PNG....')\n_os.makedirs('docs/2025', exist_ok=True)\nwith open('docs/2025/old.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('old\\n')\nwith open('readme.md', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('# hi\\n')\n",
      tests: [
        ["text is right", "text == \"# hi\\n\""],
      ],
    }),
    task("medium", "Write it in one go", {
      prompt: "Create the folder `out` (if needed) and write `Done!` into `out/result.txt`, using `mkdir` and `write_text`.",
      starter: "from pathlib import Path\n\n",
      hint: "`folder = Path(\"out\")`, `folder.mkdir(exist_ok=True)`, then `(folder / \"result.txt\").write_text(\"Done!\", encoding=\"utf-8\")`.",
      solution: "from pathlib import Path\n\nfolder = Path(\"out\")\nfolder.mkdir(exist_ok=True)\n(folder / \"result.txt\").write_text(\"Done!\", encoding=\"utf-8\")",
      setup: "def _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["out/result.txt is right", "_read(\"out/result.txt\") == \"Done!\""],
      ],
    }),
    task("medium", "Find the text files", {
      prompt: "Set `names` to the sorted names of the `.txt` files directly inside `docs`, using `glob`.",
      starter: "from pathlib import Path\n\n",
      hint: "`sorted(p.name for p in Path(\"docs\").glob(\"*.txt\"))`.",
      solution: "from pathlib import Path\n\nnames = sorted(p.name for p in Path(\"docs\").glob(\"*.txt\"))",
      setup: "import os as _os\n_os.makedirs('docs', exist_ok=True)\nwith open('docs/report.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('quarterly numbers\\n')\n_os.makedirs('docs', exist_ok=True)\nwith open('docs/notes.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('remember\\n')\n_os.makedirs('docs', exist_ok=True)\nwith open('docs/photo.png', \"wb\") as _f:\n    _f.write(b'\\x89PNG....')\n_os.makedirs('docs/2025', exist_ok=True)\nwith open('docs/2025/old.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('old\\n')\nwith open('readme.md', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('# hi\\n')\n",
      tests: [
        ["names is right", "names == [\"notes.txt\", \"report.txt\"]"],
      ],
    }),
    task("medium", "Everywhere inside", {
      prompt: "Set `all_txt` to the sorted names of every `.txt` file in `docs` **and** its subfolders, using `rglob`.",
      starter: "from pathlib import Path\n\n",
      hint: "`Path(\"docs\").rglob(\"*.txt\")` searches the folders inside too.",
      solution: "from pathlib import Path\n\nall_txt = sorted(p.name for p in Path(\"docs\").rglob(\"*.txt\"))",
      setup: "import os as _os\n_os.makedirs('docs', exist_ok=True)\nwith open('docs/report.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('quarterly numbers\\n')\n_os.makedirs('docs', exist_ok=True)\nwith open('docs/notes.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('remember\\n')\n_os.makedirs('docs', exist_ok=True)\nwith open('docs/photo.png', \"wb\") as _f:\n    _f.write(b'\\x89PNG....')\n_os.makedirs('docs/2025', exist_ok=True)\nwith open('docs/2025/old.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('old\\n')\nwith open('readme.md', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('# hi\\n')\n",
      tests: [
        ["all_txt is right", "all_txt == [\"notes.txt\", \"old.txt\", \"report.txt\"]"],
      ],
    }),
    task("hard", "Sizes", {
      prompt: "Set `sizes` to a dict mapping the name of each file directly in `docs` to its size in bytes (skip folders).",
      starter: "from pathlib import Path\n\n",
      hint: "Loop over `Path(\"docs\").iterdir()`, keep the ones where `p.is_file()`, and use `p.stat().st_size`.",
      solution: "from pathlib import Path\n\nsizes = {p.name: p.stat().st_size for p in Path(\"docs\").iterdir() if p.is_file()}",
      setup: "import os as _os\n_os.makedirs('docs', exist_ok=True)\nwith open('docs/report.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('quarterly numbers\\n')\n_os.makedirs('docs', exist_ok=True)\nwith open('docs/notes.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('remember\\n')\n_os.makedirs('docs', exist_ok=True)\nwith open('docs/photo.png', \"wb\") as _f:\n    _f.write(b'\\x89PNG....')\n_os.makedirs('docs/2025', exist_ok=True)\nwith open('docs/2025/old.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('old\\n')\nwith open('readme.md', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('# hi\\n')\n",
      tests: [
        ["sizes is right", "sizes == {\"report.txt\": 18, \"notes.txt\": 9, \"photo.png\": 8}"],
      ],
    }),
    task("hard", "Change the extension", {
      prompt: "Define `backup_name(p)` that returns the same path with `.bak` added after its extension: `notes.txt` becomes `notes.txt.bak`, in the same folder.",
      starter: "from pathlib import Path\n\n",
      hint: "`p.with_name(p.name + \".bak\")` keeps the folder and changes only the name.",
      solution: "from pathlib import Path\n\ndef backup_name(p):\n    return p.with_name(p.name + \".bak\")",
      tests: [
        ["notes.txt", "backup_name(Path(\"docs\") / \"notes.txt\") == Path(\"docs\") / \"notes.txt.bak\""],
        ["No folder", "backup_name(Path(\"a.md\")) == Path(\"a.md.bak\")"],
      ],
    }),
    task("expert", "Make backups", {
      prompt: "Define `back_up(folder)` that copies the text of every `.txt` file directly in `folder` into a `.bak` file next to it (so `notes.txt` gets `notes.txt.bak`), and returns how many backups it made.",
      starter: "from pathlib import Path\n\n",
      hint: "For each `p` in `folder.glob(\"*.txt\")`, write `p.read_text()` to `p.with_name(p.name + \".bak\")`.",
      solution: "from pathlib import Path\n\ndef back_up(folder):\n    count = 0\n    for p in Path(folder).glob(\"*.txt\"):\n        p.with_name(p.name + \".bak\").write_text(p.read_text(encoding=\"utf-8\"), encoding=\"utf-8\")\n        count += 1\n    return count",
      setup: "import os as _os\n_os.makedirs('docs', exist_ok=True)\nwith open('docs/report.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('quarterly numbers\\n')\n_os.makedirs('docs', exist_ok=True)\nwith open('docs/notes.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('remember\\n')\n_os.makedirs('docs', exist_ok=True)\nwith open('docs/photo.png', \"wb\") as _f:\n    _f.write(b'\\x89PNG....')\n_os.makedirs('docs/2025', exist_ok=True)\nwith open('docs/2025/old.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('old\\n')\nwith open('readme.md', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('# hi\\n')\ndef _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["Two backups", "back_up(\"docs\") == 2"],
        ["The copies match", "_read(\"docs/notes.txt.bak\") == \"remember\\n\" and _read(\"docs/report.txt.bak\") == \"quarterly numbers\\n\""],
      ],
    }),
    task("expert", "Count by type", {
      prompt: "Define `count_types(folder)` that returns a dict counting the files in `folder` and all its subfolders by suffix (such as `.txt`), using `rglob(\"*\")`. Skip folders.",
      starter: "from pathlib import Path\n\n",
      hint: "`for p in Path(folder).rglob(\"*\"):` keep files, and count `p.suffix` with `get`.",
      solution: "from pathlib import Path\n\ndef count_types(folder):\n    counts = {}\n    for p in Path(folder).rglob(\"*\"):\n        if p.is_file():\n            counts[p.suffix] = counts.get(p.suffix, 0) + 1\n    return counts",
      setup: "import os as _os\n_os.makedirs('docs', exist_ok=True)\nwith open('docs/report.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('quarterly numbers\\n')\n_os.makedirs('docs', exist_ok=True)\nwith open('docs/notes.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('remember\\n')\n_os.makedirs('docs', exist_ok=True)\nwith open('docs/photo.png', \"wb\") as _f:\n    _f.write(b'\\x89PNG....')\n_os.makedirs('docs/2025', exist_ok=True)\nwith open('docs/2025/old.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('old\\n')\nwith open('readme.md', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('# hi\\n')\n",
      tests: [
        ["Counts the docs tree", "count_types(\"docs\") == {\".txt\": 3, \".png\": 1}"],
      ],
    }),
  ],
  questions: [
    mc("What does `Path(\"data\") / \"x.txt\"` do?", ["Divides two paths", "Joins them into the path data/x.txt", "Raises an error", "Reads the file"], 1, "`Path` uses `/` to join path parts, whatever the operating system."),
    mc("For `Path(\"a/report.txt\")`, what is `.stem`?", ["`report.txt`", "`.txt`", "`report`", "`a`"], 2, "`.stem` is the file name without its extension."),
    mc("What does `p.read_text()` do?", ["Opens, reads the whole text and closes the file", "Reads one line", "Prints the file", "Returns the file name"], 0, "`read_text` opens, reads and closes the file in one call."),
    mc("What does `p.write_text(\"hi\")` do to an existing file?", ["Appends \"hi\"", "Raises an error", "Nothing", "Replaces its contents with \"hi\""], 3, "`write_text` opens the file in write mode, so it replaces the contents."),
    qShort("For `Path(\"photos/beach.jpg\")`, what is `.suffix`?", ".jpg", "`.suffix` is the extension, including the dot."),
    mc("What is the difference between `glob` and `rglob`?", ["None", "`rglob` also searches every folder inside", "`rglob` sorts the results", "`glob` only finds folders"], 1, "`rglob` (recursive glob) also searches every folder below."),
    mc("Can you pass a `Path` to `open()`?", ["Yes", "No, only strings", "Only with `str()`", "Only for reading"], 0, "`open` and most file functions accept `Path` objects directly."),
    mc("Which creates a folder and any missing ones above it?", ["`p.touch()`", "`p.parent`", "`p.mkdir(parents=True, exist_ok=True)`", "`p.exists()`"], 2, "`parents=True` creates missing parent folders too, and `exist_ok=True` allows an existing folder."),
    mc("What does `p.with_suffix(\".csv\")` return?", ["The file's text", "A renamed file on disk", "`True`", "A new path with the extension changed"], 3, "Path methods like `with_suffix` return a new path; nothing changes on disk."),
    mc("Which gives a file's size in bytes?", ["`len(p)`", "`p.stat().st_size`", "`p.size()`", "`p.name`"], 1, "`stat()` returns file information, including the size in `st_size`."),
  ],
})
