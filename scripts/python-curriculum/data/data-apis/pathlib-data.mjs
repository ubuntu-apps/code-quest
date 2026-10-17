import { makeTopic, mc, py, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: 'pathlib_data',
  title: 'Pathlib for data files',
  paragraphs: [
    "Data lives in files, and `pathlib.Path` is the modern way to work with file paths. A `Path` is an object rather than a plain string, so it knows how to join, split and inspect itself, and it uses the right separator on Windows, macOS and Linux.",
    "Join parts with `/`, as in `Path(\"data\") / \"2026\" / \"scores.csv\"`. Then ask about the parts: `.name` is the file name (`scores.csv`), `.suffix` the last extension (`.csv`), `.stem` the name without the last extension (`scores`; for `a.tar.gz` it is `a.tar`), and `.parent` the folder it's in.",
    "```\nfrom pathlib import Path\n\np = Path(\"data\") / \"2026\" / \"scores.csv\"\nprint(p.name, p.stem, p.suffix, p.parent)\nprint(p.with_suffix(\".json\"), p.with_name(\"backup.csv\"))\n```",
    "`with_suffix(\".json\")` and `with_name(\"backup.csv\")` return a new path with the extension or the name swapped. The original path doesn't change: like strings, paths can't be modified.",
    "Reading and writing a small text file takes one call: `p.write_text(text, encoding=\"utf-8\")` and `p.read_text(encoding=\"utf-8\")`. Always give the encoding; otherwise Python uses the computer's default, which differs between systems and can garble letters like ü.",
    "`p.exists()` returns `True` or `False`, and `p.is_file()` and `p.is_dir()` tell you what kind of thing is there. `folder.mkdir(parents=True, exist_ok=True)` creates a folder together with any missing parent folders, and doesn't complain if it already exists.",
    "To find files, `folder.glob(\"*.log\")` matches names directly inside the folder, while `folder.rglob(\"*.log\")` also searches every subfolder. `p.stat().st_size` is a file's size in bytes, and `p.rename(new_path)` renames or moves it. If you rename files while looping over a glob, turn the glob into a `list` first.",
    "```\nlogs = Path(\"logs\")\nlogs.mkdir(exist_ok=True)\n(logs / \"app.log\").write_text(\"started\\n\", encoding=\"utf-8\")\nprint([f.name for f in logs.glob(\"*.log\")])\n```",
    "`relative_to` gives one path relative to another: `Path(\"/home/ana/projects/app/main.py\").relative_to(\"/home/ana/projects\")` is `app/main.py`. `PurePosixPath` does the same path calculations with `/` on every system, without touching the disk.",
    "The code runner here has its own temporary folder, which is wiped when the page reloads, so the file examples are safe to try.",
  ],
  sandboxCode: "from pathlib import Path\n\nnotes = Path(\"notes\") / \"today.txt\"\nnotes.parent.mkdir(parents=True, exist_ok=True)\nnotes.write_text(\"hello\\nworld\\n\", encoding=\"utf-8\")\nprint(notes.read_text(encoding=\"utf-8\").splitlines())\nprint(notes.name, notes.suffix, notes.exists())",
  sandboxSnippets: [
    snippet("Path parts", "from pathlib import Path\n\nreport = Path(\"reports/summary.final.pdf\")\nprint(report.name, report.stem, report.suffix, report.parent)\nprint(report.with_suffix(\".txt\"))"),
    snippet("Write and read", "from pathlib import Path\n\np = Path(\"greeting.txt\")\np.write_text(\"Grüezi!\\n\", encoding=\"utf-8\")\nprint(p.read_text(encoding=\"utf-8\").strip())\nprint(p.stat().st_size, \"bytes (ü takes 2)\")"),
    snippet("Find files", "from pathlib import Path\n\nbase = Path(\"demo_logs\")\n(base / \"old\").mkdir(parents=True, exist_ok=True)\nfor name in [\"a.log\", \"b.txt\", \"old/c.log\"]:\n    (base / name).write_text(\"x\", encoding=\"utf-8\")\nprint(sorted(p.name for p in base.glob(\"*.log\")))\nprint(sorted(p.name for p in base.rglob(\"*.log\")))"),
    snippet("Rename", "from pathlib import Path\n\nphotos = Path(\"photos\")\nphotos.mkdir(exist_ok=True)\nfor n in (1, 2):\n    (photos / f\"IMG_{n}.jpg\").write_text(\"\", encoding=\"utf-8\")\nfor p in list(photos.glob(\"IMG_*.jpg\")):\n    p.rename(p.with_name(p.name.replace(\"IMG_\", \"holiday_\")))\nprint(sorted(p.name for p in photos.iterdir()))"),
    snippet("Relative paths", "from pathlib import PurePosixPath\n\nroot = PurePosixPath(\"/home/ana/projects\")\nscript = PurePosixPath(\"/home/ana/projects/app/src/main.py\")\nrel = script.relative_to(root)\nprint(rel, rel.parts)"),
  ],
  readMore: { label: "Python docs: the pathlib module", url: "https://docs.python.org/3/library/pathlib.html", source: "Python docs" },
  challenges: [
    task('easy', 'Join paths', {
      prompt: 'Build the path `data/2026/scores.csv` from its three parts using the `/` operator. Store it in `p`.',
      starter: py`from pathlib import Path

p = ___`,
      hint: '`Path("data") / "2026" / "scores.csv"`.',
      solution: py`from pathlib import Path

p = Path("data") / "2026" / "scores.csv"`,
      tests: [
        ['p is a Path', py`isinstance(p, __import__('pathlib').Path)`],
        ['Parts joined', py`p.as_posix() == "data/2026/scores.csv"`],
      ],
    }),
    task('easy', 'Name, stem and suffix', {
      prompt: 'For `report`, set `name` to the file name, `stem` to the name without the last extension, and `suffix` to the extension.',
      starter: py`from pathlib import Path

report = Path("reports/summary.final.pdf")
name = ___
stem = ___
suffix = ___`,
      hint: 'Paths have `.name`, `.stem` and `.suffix` attributes.',
      solution: py`from pathlib import Path

report = Path("reports/summary.final.pdf")
name = report.name
stem = report.stem
suffix = report.suffix`,
      tests: [
        ['name', py`name == "summary.final.pdf"`],
        ['stem keeps the inner dot', py`stem == "summary.final"`],
        ['suffix', py`suffix == ".pdf"`],
      ],
    }),
    task('medium', 'Write and read a text file', {
      prompt:
        'Write the two lines `hello` and `world` to `notes.txt` with `write_text`, then read the file back and store its lines (without newlines) in `lines`.',
      starter: py`from pathlib import Path

notes = Path("notes.txt")
___
lines = ___`,
      hint: '`notes.write_text("hello\\nworld\\n", encoding="utf-8")`, then `notes.read_text(encoding="utf-8").splitlines()`.',
      solution: py`from pathlib import Path

notes = Path("notes.txt")
notes.write_text("hello\nworld\n", encoding="utf-8")
lines = notes.read_text(encoding="utf-8").splitlines()`,
      tests: [
        ['The file exists', py`__import__('pathlib').Path("notes.txt").is_file()`],
        ['lines', py`lines == ["hello", "world"]`],
      ],
    }),
    task('medium', 'Make sure a folder exists', {
      prompt:
        'Write `ensure_dir(path)` that creates the folder (and any missing parent folders), does nothing if it already exists, and returns it as a `Path`.',
      starter: py`from pathlib import Path

def ensure_dir(path):
    ___`,
      hint: '`Path(path).mkdir(parents=True, exist_ok=True)`.',
      solution: py`from pathlib import Path

def ensure_dir(path):
    folder = Path(path)
    folder.mkdir(parents=True, exist_ok=True)
    return folder`,
      tests: [
        ['Creates nested folders', py`ensure_dir("out/2026/oct").is_dir()`],
        ['Calling it again is fine', py`ensure_dir("out/2026/oct").as_posix() == "out/2026/oct"`],
      ],
    }),
    task('hard', 'Find files with glob', {
      prompt:
        'The `logs` folder has files and a subfolder. Set `top_logs` to the names of `.log` files directly in `logs`, and `all_logs` to every `.log` file name at any depth. Sort both lists.',
      starter: py`from pathlib import Path

logs = Path("logs")
top_logs = ___
all_logs = ___`,
      hint: '`logs.glob("*.log")` looks in one folder; `logs.rglob("*.log")` also searches subfolders. Use `p.name` and `sorted(...)`.',
      solution: py`from pathlib import Path

logs = Path("logs")
top_logs = sorted(p.name for p in logs.glob("*.log"))
all_logs = sorted(p.name for p in logs.rglob("*.log"))`,
      setup: py`from pathlib import Path
for name in ["logs/a.log", "logs/b.log", "logs/readme.txt", "logs/old/c.log"]:
    Path(name).parent.mkdir(parents=True, exist_ok=True)
    Path(name).write_text("x", encoding="utf-8")`,
      tests: [
        ['Only the top folder', py`top_logs == ["a.log", "b.log"]`],
        ['Subfolders too', py`all_logs == ["a.log", "b.log", "c.log"]`],
      ],
    }),
    task('hard', 'Change the extension', {
      prompt: 'From `source`, make `json_path` (same name, `.json` extension) and `backup` (same folder, named `backup.csv`).',
      starter: py`from pathlib import Path

source = Path("exports/report.csv")
json_path = ___
backup = ___`,
      hint: '`source.with_suffix(".json")` and `source.with_name("backup.csv")`.',
      solution: py`from pathlib import Path

source = Path("exports/report.csv")
json_path = source.with_suffix(".json")
backup = source.with_name("backup.csv")`,
      tests: [
        ['json_path', py`json_path.as_posix() == "exports/report.json"`],
        ['backup', py`backup.as_posix() == "exports/backup.csv"`],
      ],
    }),
    task('expert', 'Save and load JSON files', {
      prompt:
        'Write `save_json(path, data)`, which creates any missing folders and writes `data` as JSON, and `load_json(path)`, which reads it back.',
      starter: py`import json
from pathlib import Path

def save_json(path, data):
    ___

def load_json(path):
    ___`,
      hint: 'Create the folder with `path.parent.mkdir(parents=True, exist_ok=True)`, then `path.write_text(json.dumps(data), encoding="utf-8")`.',
      solution: py`import json
from pathlib import Path

def save_json(path, data):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data), encoding="utf-8")

def load_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))`,
      tests: [
        ['Round trip', py`(save_json("data/users/ana.json", {"name": "Ana", "tags": ["x"]}), load_json("data/users/ana.json"))[1] == {"name": "Ana", "tags": ["x"]}`],
        ['Folders were created', py`__import__('pathlib').Path("data/users").is_dir()`],
      ],
    }),
    task('expert', 'Folder size', {
      prompt: 'Add up the size in bytes of every file under `project` (including subfolders). Store it in `total_bytes`.',
      starter: py`from pathlib import Path

project = Path("project")
total_bytes = ___`,
      hint: 'Loop over `project.rglob("*")`, keep `p.is_file()`, and add `p.stat().st_size`.',
      solution: py`from pathlib import Path

project = Path("project")
total_bytes = sum(p.stat().st_size for p in project.rglob("*") if p.is_file())`,
      setup: py`from pathlib import Path
Path("project/src").mkdir(parents=True, exist_ok=True)
Path("project/README.md").write_bytes(b"x" * 120)
Path("project/src/main.py").write_bytes(b"x" * 300)
Path("project/src/util.py").write_bytes(b"x" * 80)`,
      tests: [['Total size', py`total_bytes == 500`]],
    }),
    task('expert', 'Rename a batch of files', {
      prompt:
        'Rename every `IMG_<n>.jpg` in `photos` to `holiday_<n>.jpg`. Then set `names` to the sorted file names now in the folder.',
      starter: py`from pathlib import Path

photos = Path("photos")
___
names = sorted(p.name for p in photos.iterdir())`,
      hint: 'For each `p` in `photos.glob("IMG_*.jpg")`, call `p.rename(p.with_name(p.name.replace("IMG_", "holiday_")))`.',
      solution: py`from pathlib import Path

photos = Path("photos")
for p in list(photos.glob("IMG_*.jpg")):
    p.rename(p.with_name(p.name.replace("IMG_", "holiday_")))
names = sorted(p.name for p in photos.iterdir())`,
      setup: py`from pathlib import Path
Path("photos").mkdir(exist_ok=True)
for n in [1, 2, 3]:
    Path(f"photos/IMG_{n}.jpg").write_text("img", encoding="utf-8")
Path("photos/notes.txt").write_text("keep", encoding="utf-8")`,
      tests: [['Renamed, other files untouched', py`names == ["holiday_1.jpg", "holiday_2.jpg", "holiday_3.jpg", "notes.txt"]`]],
    }),
    task('expert', 'Relative paths', {
      prompt:
        'Set `rel` to the path of `script` relative to `root`, and `depth` to how many folders `rel` is inside. Use `PurePosixPath`, which works the same on every system.',
      starter: py`from pathlib import PurePosixPath

root = PurePosixPath("/home/ana/projects")
script = PurePosixPath("/home/ana/projects/app/src/main.py")
rel = ___
depth = ___`,
      hint: '`script.relative_to(root)`; the folders are `rel.parent.parts`.',
      solution: py`from pathlib import PurePosixPath

root = PurePosixPath("/home/ana/projects")
script = PurePosixPath("/home/ana/projects/app/src/main.py")
rel = script.relative_to(root)
depth = len(rel.parent.parts)`,
      tests: [
        ['rel', py`str(rel) == "app/src/main.py"`],
        ['depth', py`depth == 2`],
      ],
    }),
  ],
  questions: [
    mc('What does `Path("data") / "a.csv"` do?', ['Divides two numbers', 'Raises a TypeError', 'Joins the parts into one path', 'Opens the file'], 2),
    qShort('Which `Path` attribute gives the extension, like `.csv`? (attribute name)', 'suffix'),
    mc('`Path("a/b.tar.gz").stem` is…', ['b.tar', 'b', 'b.tar.gz', 'a/b'], 0),
    mc('What does `mkdir(parents=True, exist_ok=True)` add over plain `mkdir()`?', ['Deletes old folders', 'Creates missing parents and doesn\'t fail if it exists', 'Sets permissions', 'Nothing'], 1),
    mc('How is `rglob("*.log")` different from `glob("*.log")`?', ['It is faster', 'It ignores hidden files', 'It returns strings', 'It also searches subfolders'], 3),
    mc('Why pass `encoding="utf-8"` to `read_text`?', ['So the file reads the same on every system', 'It is faster', 'It compresses the text', 'Paths require it'], 0),
    qShort('Which `Path` method swaps the extension, like `.csv` to `.json`? (name only)', 'with_suffix'),
    mc('`p.exists()` returns…', ['The file contents', 'True or False', 'The file size', 'A new Path'], 1),
    mc('Which gives a file\'s size in bytes?', ['len(p)', 'p.size', 'p.stat().st_size', 'p.bytes()'], 2),
    mc('Why prefer `pathlib` over string paths?', ['Strings can\'t hold paths', 'It is the only way to open files', 'It is always faster', 'Joining and inspecting paths is clearer and works across systems'], 3),
  ],
})
