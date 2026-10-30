// Files topic: Paths and folders. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "file_paths",
  title: "Paths and folders",
  paragraphs: [
    "A file name like `\"notes.txt\"` is a **relative path**: Python looks for it in the **current working directory**, the folder the program is running in, which `os.getcwd()` shows. A path that starts from the top of the disk, like `/home/ana/notes.txt` (or `C:\\Users\\Ana\\notes.txt` on Windows), is an **absolute path** and means the same file wherever the program runs.",
    "The `os` module (`import os`) works with paths and folders. Folders are separated by `/` on Mac and Linux and by `\\` on Windows, so instead of gluing strings together, build paths with `os.path.join`, which uses the right separator for the computer it runs on:",
    "```\nimport os\n\npath = os.path.join(\"data\", \"2026\", \"sales.txt\")\nprint(path)                          # data/2026/sales.txt on Mac and Linux\nprint(os.path.basename(path))        # sales.txt\nprint(os.path.dirname(path))         # data/2026\nprint(os.path.splitext(path))        # ('data/2026/sales', '.txt')\n```",
    "These functions only work with the **text** of a path; the file doesn't need to exist. To ask about the disk, use `os.path.exists(path)`, `os.path.isfile(path)` and `os.path.isdir(path)`, which return `True` or `False`, and `os.path.getsize(path)` for a file's size in bytes.",
    "`os.makedirs(\"data/2026\", exist_ok=True)` creates a folder, including any missing folders above it; `exist_ok=True` means \"and don't complain if it's already there\". `os.listdir(folder)` returns the names of everything in a folder, files and folders alike, in no particular order, so sort them when the order matters.",
    "```\nimport os\n\nos.makedirs(\"reports\", exist_ok=True)\nwith open(os.path.join(\"reports\", \"jan.txt\"), \"w\", encoding=\"utf-8\") as f:\n    f.write(\"January\\n\")\nprint(sorted(os.listdir(\"reports\")))       # ['jan.txt']\nprint(os.path.exists(\"reports/jan.txt\"))   # True\n```",
    "`os.rename(old, new)` renames or moves a file, and `os.remove(path)` deletes one, permanently, with no recycle bin. Check what you're about to delete, and be extra careful in loops.",
    "The next stage shows `pathlib`, a newer and often neater way to do all of this. You'll meet both in real code, so it's worth knowing the `os` way too.",
  ],
  sandboxCode: "import os\n\nprint(\"Working directory:\", os.getcwd())\nos.makedirs(\"demo/sub\", exist_ok=True)\nwith open(os.path.join(\"demo\", \"a.txt\"), \"w\", encoding=\"utf-8\") as f:\n    f.write(\"hi\\n\")\nprint(sorted(os.listdir(\"demo\")))\nfor name in sorted(os.listdir(\"demo\")):\n    full = os.path.join(\"demo\", name)\n    print(name, \"folder\" if os.path.isdir(full) else \"file\")",
  sandboxSnippets: [
    snippet("Build paths", "import os\n\nprint(os.path.join(\"music\", \"jazz\", \"track01.mp3\"))"),
    snippet("Take a path apart", "import os\n\np = os.path.join(\"photos\", \"2026\", \"beach.jpg\")\nprint(os.path.basename(p), os.path.dirname(p), os.path.splitext(p)[1])"),
    snippet("Does it exist?", "import os\n\nwith open(\"here.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"x\")\nprint(os.path.exists(\"here.txt\"), os.path.exists(\"gone.txt\"))\nprint(os.path.isfile(\"here.txt\"), os.path.isdir(\".\"))"),
    snippet("Make folders", "import os\n\nos.makedirs(\"a/b/c\", exist_ok=True)\nos.makedirs(\"a/b/c\", exist_ok=True)\nprint(os.path.isdir(\"a/b/c\"))"),
    snippet("Rename and remove", "import os\n\nwith open(\"draft.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"text\")\nos.rename(\"draft.txt\", \"final.txt\")\nprint(os.path.exists(\"draft.txt\"), os.path.exists(\"final.txt\"))\nos.remove(\"final.txt\")\nprint(os.path.exists(\"final.txt\"))"),
  ],
  readMore: { label: "Python docs: os.path", url: "https://docs.python.org/3/library/os.path.html", source: "Python docs" },
  challenges: [
    task("easy", "Join a path", {
      prompt: "Set `path` to the path of `sales.txt` inside the folder `2026`, inside the folder `data`, using `os.path.join`.",
      starter: "import os\n\n",
      hint: "`os.path.join(\"data\", \"2026\", \"sales.txt\")`.",
      solution: "import os\n\npath = os.path.join(\"data\", \"2026\", \"sales.txt\")",
      tests: [
        ["path is right", "path == __import__(\"os\").path.join(\"data\", \"2026\", \"sales.txt\")"],
        ["It has three parts", "path.replace(\"\\\\\", \"/\").split(\"/\") == [\"data\", \"2026\", \"sales.txt\"]"],
      ],
    }),
    task("easy", "The extension", {
      prompt: "Set `name` to the file name of `path` (without its folders) and `ext` to its extension, such as `.jpg`.",
      starter: "import os\n\npath = os.path.join(\"photos\", \"2026\", \"beach.jpg\")\n",
      hint: "`os.path.basename(path)` and `os.path.splitext(path)[1]`.",
      solution: "import os\n\npath = os.path.join(\"photos\", \"2026\", \"beach.jpg\")\nname = os.path.basename(path)\next = os.path.splitext(path)[1]",
      tests: [
        ["name is beach.jpg", "name == \"beach.jpg\""],
        ["ext is .jpg", "ext == \".jpg\""],
      ],
    }),
    task("easy", "Is it there?", {
      prompt: "Set `has_readme` to whether `readme.md` exists and `has_docs` to whether `docs` is a folder.",
      starter: "import os\n\n",
      hint: "`os.path.exists(\"readme.md\")` and `os.path.isdir(\"docs\")`.",
      solution: "import os\n\nhas_readme = os.path.exists(\"readme.md\")\nhas_docs = os.path.isdir(\"docs\")",
      setup: "import os as _os\n_os.makedirs('docs', exist_ok=True)\nwith open('docs/report.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('quarterly numbers\\n')\n_os.makedirs('docs', exist_ok=True)\nwith open('docs/notes.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('remember\\n')\n_os.makedirs('docs', exist_ok=True)\nwith open('docs/photo.png', \"wb\") as _f:\n    _f.write(b'\\x89PNG....')\n_os.makedirs('docs', exist_ok=True)\n_os.makedirs('docs/old', exist_ok=True)\nwith open('readme.md', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('# hi\\n')\n",
      tests: [
        ["has_readme is True", "has_readme is True"],
        ["has_docs is True", "has_docs is True"],
      ],
    }),
    task("medium", "A folder and a file", {
      prompt: "Create the folder `reports/2026` and write `Hello` into a file `jan.txt` inside it.",
      starter: "import os\n\n",
      hint: "`os.makedirs(os.path.join(\"reports\", \"2026\"), exist_ok=True)`, then open `os.path.join(\"reports\", \"2026\", \"jan.txt\")` with `\"w\"`.",
      solution: "import os\n\nfolder = os.path.join(\"reports\", \"2026\")\nos.makedirs(folder, exist_ok=True)\nwith open(os.path.join(folder, \"jan.txt\"), \"w\", encoding=\"utf-8\") as f:\n    f.write(\"Hello\")",
      setup: "def _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["The file is there", "_read(\"reports/2026/jan.txt\") == \"Hello\""],
      ],
    }),
    task("medium", "The text files", {
      prompt: "Set `txt_files` to the sorted names of the `.txt` files in the folder `docs`.",
      starter: "import os\n\n",
      hint: "Loop over `os.listdir(\"docs\")` and keep names that `endswith(\".txt\")`, then sort.",
      solution: "import os\n\ntxt_files = sorted(name for name in os.listdir(\"docs\") if name.endswith(\".txt\"))",
      setup: "import os as _os\n_os.makedirs('docs', exist_ok=True)\nwith open('docs/report.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('quarterly numbers\\n')\n_os.makedirs('docs', exist_ok=True)\nwith open('docs/notes.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('remember\\n')\n_os.makedirs('docs', exist_ok=True)\nwith open('docs/photo.png', \"wb\") as _f:\n    _f.write(b'\\x89PNG....')\n_os.makedirs('docs', exist_ok=True)\n_os.makedirs('docs/old', exist_ok=True)\nwith open('readme.md', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('# hi\\n')\n",
      tests: [
        ["txt_files is right", "txt_files == [\"notes.txt\", \"report.txt\"]"],
      ],
    }),
    task("medium", "Files, not folders", {
      prompt: "Set `file_count` to how many entries in `docs` are files (not folders).",
      starter: "import os\n\n",
      hint: "For each name, check `os.path.isfile(os.path.join(\"docs\", name))`.",
      solution: "import os\n\nfile_count = sum(1 for name in os.listdir(\"docs\") if os.path.isfile(os.path.join(\"docs\", name)))",
      setup: "import os as _os\n_os.makedirs('docs', exist_ok=True)\nwith open('docs/report.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('quarterly numbers\\n')\n_os.makedirs('docs', exist_ok=True)\nwith open('docs/notes.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('remember\\n')\n_os.makedirs('docs', exist_ok=True)\nwith open('docs/photo.png', \"wb\") as _f:\n    _f.write(b'\\x89PNG....')\n_os.makedirs('docs', exist_ok=True)\n_os.makedirs('docs/old', exist_ok=True)\nwith open('readme.md', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('# hi\\n')\n",
      tests: [
        ["file_count is 3", "file_count == 3"],
      ],
    }),
    task("hard", "Rename a draft", {
      prompt: "Rename `draft.txt` to `final.txt`, but only if `draft.txt` exists and `final.txt` doesn't. Set `renamed` to `True` if you renamed it.",
      starter: "import os\n\n",
      hint: "Check both with `os.path.exists`, then `os.rename(\"draft.txt\", \"final.txt\")`.",
      solution: "import os\n\nrenamed = False\nif os.path.exists(\"draft.txt\") and not os.path.exists(\"final.txt\"):\n    os.rename(\"draft.txt\", \"final.txt\")\n    renamed = True",
      setup: "import os as _os\nwith open('draft.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('my essay')\ndef _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["renamed is True", "renamed is True"],
        ["final.txt has the text", "_read(\"final.txt\") == \"my essay\""],
        ["draft.txt is gone", "not __import__(\"os\").path.exists(\"draft.txt\")"],
      ],
    }),
    task("hard", "Tidy up", {
      prompt: "Define `remove_if_exists(path)` that deletes the file and returns `True`, or returns `False` if there's no such file.",
      starter: "import os\n\n",
      hint: "`if os.path.isfile(path): os.remove(path); return True`, else `return False`.",
      solution: "import os\n\ndef remove_if_exists(path):\n    if os.path.isfile(path):\n        os.remove(path)\n        return True\n    return False",
      setup: "import os as _os\nwith open('old.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('bye')\n",
      tests: [
        ["Removes a file", "remove_if_exists(\"old.txt\") is True and not __import__(\"os\").path.exists(\"old.txt\")"],
        ["A missing file", "remove_if_exists(\"nope.txt\") is False"],
      ],
    }),
    task("expert", "How big?", {
      prompt: "Define `folder_size(folder)` that returns the total size in bytes of the files directly inside `folder` (not counting subfolders).",
      starter: "import os\n\n",
      hint: "Add `os.path.getsize(full)` for each name whose full path `os.path.isfile`.",
      solution: "import os\n\ndef folder_size(folder):\n    total = 0\n    for name in os.listdir(folder):\n        full = os.path.join(folder, name)\n        if os.path.isfile(full):\n            total += os.path.getsize(full)\n    return total",
      setup: "import os as _os\n_os.makedirs('docs', exist_ok=True)\nwith open('docs/report.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('quarterly numbers\\n')\n_os.makedirs('docs', exist_ok=True)\nwith open('docs/notes.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('remember\\n')\n_os.makedirs('docs', exist_ok=True)\nwith open('docs/photo.png', \"wb\") as _f:\n    _f.write(b'\\x89PNG....')\n_os.makedirs('docs', exist_ok=True)\n_os.makedirs('docs/old', exist_ok=True)\nwith open('readme.md', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('# hi\\n')\n",
      tests: [
        ["docs is 35 bytes", "folder_size(\"docs\") == 35"],
        ["An empty folder", "folder_size(\"docs/old\") == 0"],
      ],
    }),
    task("expert", "Sort by type", {
      prompt: "Define `sort_by_extension(folder)` that moves every file in `folder` into a subfolder named after its extension without the dot (`txt`, `png`), creating the subfolders as needed. Files without an extension stay put. Return the number of files moved.",
      starter: "import os\n\n",
      hint: "For each file, `ext = os.path.splitext(name)[1][1:]`. Make `os.path.join(folder, ext)` and `os.rename` the file into it.",
      solution: "import os\n\ndef sort_by_extension(folder):\n    moved = 0\n    for name in os.listdir(folder):\n        full = os.path.join(folder, name)\n        ext = os.path.splitext(name)[1][1:]\n        if not os.path.isfile(full) or not ext:\n            continue\n        target = os.path.join(folder, ext)\n        os.makedirs(target, exist_ok=True)\n        os.rename(full, os.path.join(target, name))\n        moved += 1\n    return moved",
      setup: "import os as _os\n_os.makedirs('docs', exist_ok=True)\nwith open('docs/report.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('quarterly numbers\\n')\n_os.makedirs('docs', exist_ok=True)\nwith open('docs/notes.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('remember\\n')\n_os.makedirs('docs', exist_ok=True)\nwith open('docs/photo.png', \"wb\") as _f:\n    _f.write(b'\\x89PNG....')\n_os.makedirs('docs', exist_ok=True)\n_os.makedirs('docs/old', exist_ok=True)\nwith open('readme.md', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('# hi\\n')\n",
      tests: [
        ["Moves three files", "sort_by_extension(\"docs\") == 3"],
        ["txt files moved", "(lambda os: sorted(os.listdir(\"docs/txt\")))(__import__(\"os\")) == [\"notes.txt\", \"report.txt\"]"],
        ["png file moved", "__import__(\"os\").path.isfile(\"docs/png/photo.png\")"],
      ],
    }),
  ],
  questions: [
    mc("What is a relative path, like `\"notes.txt\"`, relative to?", ["The top of the disk", "The current working directory", "The Python install folder", "The home folder"], 1),
    mc("Why build paths with `os.path.join` instead of `+`?", ["It is faster", "It checks the file exists", "It uses the right separator for the computer", "It makes the folders"], 2),
    mc("What does `os.path.splitext(\"a/b.txt\")` give?", ["`(\"a/b\", \".txt\")`", "`(\"a\", \"b.txt\")`", "`\".txt\"`", "`[\"a\", \"b\", \"txt\"]`"], 0),
    mc("Does `os.path.basename(path)` need the file to exist?", ["Yes", "Only on Windows", "Only for folders", "No: it only works with the text of the path"], 3),
    mc("Which shows the current working directory?", ["`os.listdir()`", "`os.path.join()`", "`os.getcwd()`", "`os.path.dirname()`"], 2),
    mc("What does `exist_ok=True` do in `os.makedirs`?", ["Deletes the folder first", "Doesn't complain if the folder already exists", "Makes the folder read-only", "Checks the folder exists"], 1),
    mc("In what order does `os.listdir` return names?", ["No particular order, so sort them when it matters", "Alphabetical", "Newest first", "Files before folders"], 0),
    mc("What does `os.remove(path)` do?", ["Moves the file to the recycle bin", "Empties the file", "Deletes it permanently", "Removes a folder"], 2),
    mc("Which tells you if a path is a folder?", ["`os.path.isfile`", "`os.path.exists`", "`os.listdir`", "`os.path.isdir`"], 3),
    mc("What does `os.path.getsize(path)` return?", ["The number of lines", "The size in bytes", "The number of characters", "The date"], 1),
  ],
})
