// Files project: Saved to-do list. Lesson, Try-it snippets, challenges and quiz.
import { makeProject, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeProject("hard", {
  id: "proj_saved_todo",
  title: "Saved to-do list",
  paragraphs: [
    "Build a to-do list that remembers. Tasks are stored in a text file, one per line, with `[x]` for done and `[ ]` for not done yet, so the file is easy for a person to read too:",
    "```\n[x] buy milk\n[ ] call Ana\n[ ] water the plants\n```",
    "The program loads the file when it starts (an empty list if it doesn't exist yet), carries out a batch of commands, and saves the file at the end. Saving goes through a temporary file and `os.replace`, so a crash mid-save can never leave a half-written list. The commands: `add <task>`, `done <number>`, `list`, and `clear` (remove the finished tasks).",
    "For example, starting from the file above, the commands `add pay rent`, `done 2`, `clear` and `list` reply:",
    "```\nAdded: pay rent\nDone: call Ana\nCleared 2\n1. [ ] water the plants\n2. [ ] pay rent\n```",
    "Each task is a small dict, `{\"title\": \"call Ana\", \"done\": False}`, so the code reads naturally: `task[\"done\"] = True`. Build it in steps: reading one line, loading the file, saving it safely, showing the list, and finally running the commands.",
  ],
  sandboxCode: "def parse_task(line):\n    line = line.rstrip(\"\\n\")\n    return {\"title\": line[4:], \"done\": line.startswith(\"[x]\")}\n\nwith open(\"todo-demo.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"[x] buy milk\\n[ ] call Ana\\n\")\n\nwith open(\"todo-demo.txt\", encoding=\"utf-8\") as f:\n    tasks = [parse_task(line) for line in f]\nprint(tasks)",
  sandboxSnippets: [
    snippet("A task as a dict", "task = {\"title\": \"call Ana\", \"done\": False}\ntask[\"done\"] = True\nmark = \"x\" if task[\"done\"] else \" \"\nprint(f\"[{mark}] {task['title']}\")"),
    snippet("Safe save", "import os\n\nwith open(\"list.txt.tmp\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"[ ] new list\\n\")\nos.replace(\"list.txt.tmp\", \"list.txt\")\nprint(open(\"list.txt\", encoding=\"utf-8\").read(), os.path.exists(\"list.txt.tmp\"))"),
    snippet("Keep the unfinished", "tasks = [{\"title\": \"a\", \"done\": True}, {\"title\": \"b\", \"done\": False}]\nprint([t[\"title\"] for t in tasks if not t[\"done\"]])"),
  ],
  challenges: [
    task("easy", "Read one task", {
      prompt: "Define `parse_task(line)` that turns `[x] buy milk` into `{\"title\": \"buy milk\", \"done\": True}` and `[ ] call Ana` into `{\"title\": \"call Ana\", \"done\": False}` (ignoring the line break). Any other line raises `ValueError(\"Not a task: <line>\")`.",
      hint: "Strip the `\\n`, check `startswith(\"[x] \")` or `startswith(\"[ ] \")`, and take the title from `line[4:]`.",
      solution: "def parse_task(line):\n    line = line.rstrip(\"\\n\")\n    if line.startswith(\"[x] \"):\n        return {\"title\": line[4:], \"done\": True}\n    if line.startswith(\"[ ] \"):\n        return {\"title\": line[4:], \"done\": False}\n    raise ValueError(f\"Not a task: {line}\")\n",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["Done", "parse_task(\"[x] buy milk\\n\") == {\"title\": \"buy milk\", \"done\": True}"],
        ["Not done", "parse_task(\"[ ] call Ana\") == {\"title\": \"call Ana\", \"done\": False}"],
        ["Not a task", "_error(parse_task, \"hello\") == \"ValueError: Not a task: hello\""],
      ],
    }),
    task("medium", "Load the list", {
      prompt: "Define `load(name)` that returns the list of task dicts from the file, skipping blank lines, or an empty list if the file doesn't exist.",
      starter: "def parse_task(line):\n    line = line.rstrip(\"\\n\")\n    if line.startswith(\"[x] \"):\n        return {\"title\": line[4:], \"done\": True}\n    if line.startswith(\"[ ] \"):\n        return {\"title\": line[4:], \"done\": False}\n    raise ValueError(f\"Not a task: {line}\")\n\n",
      hint: "A comprehension over the file with `if line.strip()`, inside `try`; `return []` on `FileNotFoundError`.",
      solution: "def parse_task(line):\n    line = line.rstrip(\"\\n\")\n    if line.startswith(\"[x] \"):\n        return {\"title\": line[4:], \"done\": True}\n    if line.startswith(\"[ ] \"):\n        return {\"title\": line[4:], \"done\": False}\n    raise ValueError(f\"Not a task: {line}\")\n\ndef load(name):\n    try:\n        with open(name, encoding=\"utf-8\") as f:\n            return [parse_task(line) for line in f if line.strip()]\n    except FileNotFoundError:\n        return []\n",
      setup: "import os as _os\nwith open('todo.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('[x] buy milk\\n[ ] call Ana\\n\\n[ ] water the plants\\n')\n",
      tests: [
        ["Loads three tasks", "load(\"todo.txt\") == [{\"title\": \"buy milk\", \"done\": True}, {\"title\": \"call Ana\", \"done\": False}, {\"title\": \"water the plants\", \"done\": False}]"],
        ["No file yet", "load(\"none.txt\") == []"],
      ],
    }),
    task("medium", "Save it safely", {
      prompt: "Define `save(tasks, name)` that writes the tasks in the `[x] title` format into `name + \".tmp\"`, then swaps it into place with `os.replace`.",
      starter: "import os\n\ndef parse_task(line):\n    line = line.rstrip(\"\\n\")\n    if line.startswith(\"[x] \"):\n        return {\"title\": line[4:], \"done\": True}\n    if line.startswith(\"[ ] \"):\n        return {\"title\": line[4:], \"done\": False}\n    raise ValueError(f\"Not a task: {line}\")\n\ndef load(name):\n    try:\n        with open(name, encoding=\"utf-8\") as f:\n            return [parse_task(line) for line in f if line.strip()]\n    except FileNotFoundError:\n        return []\n\n",
      hint: "Write each task with `mark = \"x\" if task[\"done\"] else \" \"`, then `os.replace(temp, name)`.",
      solution: "import os\n\ndef parse_task(line):\n    line = line.rstrip(\"\\n\")\n    if line.startswith(\"[x] \"):\n        return {\"title\": line[4:], \"done\": True}\n    if line.startswith(\"[ ] \"):\n        return {\"title\": line[4:], \"done\": False}\n    raise ValueError(f\"Not a task: {line}\")\n\ndef load(name):\n    try:\n        with open(name, encoding=\"utf-8\") as f:\n            return [parse_task(line) for line in f if line.strip()]\n    except FileNotFoundError:\n        return []\n\ndef save(tasks, name):\n    temp = name + \".tmp\"\n    with open(temp, \"w\", encoding=\"utf-8\") as f:\n        for task in tasks:\n            mark = \"x\" if task[\"done\"] else \" \"\n            f.write(f\"[{mark}] {task['title']}\\n\")\n    os.replace(temp, name)\n",
      setup: "def _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["Writes the file", "(save([{\"title\": \"a\", \"done\": True}, {\"title\": \"b\", \"done\": False}], \"t.txt\"), _read(\"t.txt\"))[1] == \"[x] a\\n[ ] b\\n\""],
        ["No temp file left", "(save([], \"t2.txt\"), __import__(\"os\").path.exists(\"t2.txt.tmp\"))[1] is False"],
        ["Load reads it back", "(save([{\"title\": \"c\", \"done\": True}], \"t3.txt\"), load(\"t3.txt\"))[1] == [{\"title\": \"c\", \"done\": True}]"],
      ],
    }),
    task("hard", "Show the list", {
      prompt: "Define `show(tasks)` that returns the lines to display, like `1. [x] buy milk`, or `[\"Nothing to do!\"]` for an empty list.",
      hint: "`enumerate(tasks, start=1)` and an f-string with the mark.",
      solution: "def show(tasks):\n    if not tasks:\n        return [\"Nothing to do!\"]\n    lines = []\n    for number, task in enumerate(tasks, start=1):\n        mark = \"x\" if task[\"done\"] else \" \"\n        lines.append(f\"{number}. [{mark}] {task['title']}\")\n    return lines\n",
      tests: [
        ["Two tasks", "show([{\"title\": \"a\", \"done\": True}, {\"title\": \"b\", \"done\": False}]) == [\"1. [x] a\", \"2. [ ] b\"]"],
        ["Empty", "show([]) == [\"Nothing to do!\"]"],
      ],
    }),
    task("hard", "Finished or not", {
      prompt: "Set `left` to the number of unfinished tasks in `todo.txt` and `titles` to their titles, using `load`.",
      starter: "import os\n\ndef parse_task(line):\n    line = line.rstrip(\"\\n\")\n    if line.startswith(\"[x] \"):\n        return {\"title\": line[4:], \"done\": True}\n    if line.startswith(\"[ ] \"):\n        return {\"title\": line[4:], \"done\": False}\n    raise ValueError(f\"Not a task: {line}\")\n\ndef load(name):\n    try:\n        with open(name, encoding=\"utf-8\") as f:\n            return [parse_task(line) for line in f if line.strip()]\n    except FileNotFoundError:\n        return []\n\n",
      hint: "`tasks = load(\"todo.txt\")`, then a comprehension keeping `not t[\"done\"]`.",
      solution: "import os\n\ndef parse_task(line):\n    line = line.rstrip(\"\\n\")\n    if line.startswith(\"[x] \"):\n        return {\"title\": line[4:], \"done\": True}\n    if line.startswith(\"[ ] \"):\n        return {\"title\": line[4:], \"done\": False}\n    raise ValueError(f\"Not a task: {line}\")\n\ndef load(name):\n    try:\n        with open(name, encoding=\"utf-8\") as f:\n            return [parse_task(line) for line in f if line.strip()]\n    except FileNotFoundError:\n        return []\n\ntasks = load(\"todo.txt\")\nunfinished = [t for t in tasks if not t[\"done\"]]\nleft = len(unfinished)\ntitles = [t[\"title\"] for t in unfinished]",
      setup: "import os as _os\nwith open('todo.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('[x] buy milk\\n[ ] call Ana\\n[ ] water the plants\\n')\n",
      tests: [
        ["left is 2", "left == 2"],
        ["titles is right", "titles == [\"call Ana\", \"water the plants\"]"],
      ],
    }),
    task("expert", "Run the commands", {
      keepProgress: true,
      prompt: "Define `run(name, commands)`: load the list, carry out each command (`add <task>` replies `Added: <task>`; `done <n>` replies `Done: <task>` or `No task <n>`; `list` gives the `show` lines; `clear` removes finished tasks and replies `Cleared <count>`; anything else `Unknown command`), save the list, and return all the replies.",
      starter: "import os\n\ndef parse_task(line):\n    line = line.rstrip(\"\\n\")\n    if line.startswith(\"[x] \"):\n        return {\"title\": line[4:], \"done\": True}\n    if line.startswith(\"[ ] \"):\n        return {\"title\": line[4:], \"done\": False}\n    raise ValueError(f\"Not a task: {line}\")\n\ndef load(name):\n    try:\n        with open(name, encoding=\"utf-8\") as f:\n            return [parse_task(line) for line in f if line.strip()]\n    except FileNotFoundError:\n        return []\n\ndef save(tasks, name):\n    temp = name + \".tmp\"\n    with open(temp, \"w\", encoding=\"utf-8\") as f:\n        for task in tasks:\n            mark = \"x\" if task[\"done\"] else \" \"\n            f.write(f\"[{mark}] {task['title']}\\n\")\n    os.replace(temp, name)\n\ndef show(tasks):\n    if not tasks:\n        return [\"Nothing to do!\"]\n    lines = []\n    for number, task in enumerate(tasks, start=1):\n        mark = \"x\" if task[\"done\"] else \" \"\n        lines.append(f\"{number}. [{mark}] {task['title']}\")\n    return lines\n\n",
      hint: "Split each command with `partition(\" \")`. For `done`, convert the number and index the list inside `try`, catching `ValueError` and `IndexError` (and treat numbers below 1 as missing).",
      solution: "import os\n\ndef parse_task(line):\n    line = line.rstrip(\"\\n\")\n    if line.startswith(\"[x] \"):\n        return {\"title\": line[4:], \"done\": True}\n    if line.startswith(\"[ ] \"):\n        return {\"title\": line[4:], \"done\": False}\n    raise ValueError(f\"Not a task: {line}\")\n\ndef load(name):\n    try:\n        with open(name, encoding=\"utf-8\") as f:\n            return [parse_task(line) for line in f if line.strip()]\n    except FileNotFoundError:\n        return []\n\ndef save(tasks, name):\n    temp = name + \".tmp\"\n    with open(temp, \"w\", encoding=\"utf-8\") as f:\n        for task in tasks:\n            mark = \"x\" if task[\"done\"] else \" \"\n            f.write(f\"[{mark}] {task['title']}\\n\")\n    os.replace(temp, name)\n\ndef show(tasks):\n    if not tasks:\n        return [\"Nothing to do!\"]\n    lines = []\n    for number, task in enumerate(tasks, start=1):\n        mark = \"x\" if task[\"done\"] else \" \"\n        lines.append(f\"{number}. [{mark}] {task['title']}\")\n    return lines\n\ndef run(name, commands):\n    tasks = load(name)\n    output = []\n    for command in commands:\n        action, _, rest = command.partition(\" \")\n        if action == \"add\" and rest:\n            tasks.append({\"title\": rest, \"done\": False})\n            output.append(f\"Added: {rest}\")\n        elif action == \"done\":\n            try:\n                number = int(rest)\n                if number < 1:\n                    raise IndexError\n                task = tasks[number - 1]\n            except (ValueError, IndexError):\n                output.append(f\"No task {rest}\")\n                continue\n            task[\"done\"] = True\n            output.append(f\"Done: {task['title']}\")\n        elif action == \"list\":\n            output.extend(show(tasks))\n        elif action == \"clear\":\n            before = len(tasks)\n            tasks = [t for t in tasks if not t[\"done\"]]\n            output.append(f\"Cleared {before - len(tasks)}\")\n        else:\n            output.append(\"Unknown command\")\n    save(tasks, name)\n    return output\n",
      setup: "import os as _os\nwith open('todo.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('[x] buy milk\\n[ ] call Ana\\n[ ] water the plants\\n')\ndef _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["The intro example", "run(\"todo.txt\", [\"add pay rent\", \"done 2\", \"clear\", \"list\"]) == [\"Added: pay rent\", \"Done: call Ana\", \"Cleared 2\", \"1. [ ] water the plants\", \"2. [ ] pay rent\"]"],
        ["Saved to the file", "(run(\"t4.txt\", [\"add a\", \"add b\", \"done 1\"]), _read(\"t4.txt\"))[1] == \"[x] a\\n[ ] b\\n\""],
        ["Bad commands", "run(\"t5.txt\", [\"done 9\", \"done x\", \"done 0\", \"dance\", \"list\"]) == [\"No task 9\", \"No task x\", \"No task 0\", \"Unknown command\", \"Nothing to do!\"]"],
      ],
    }),
  ],
  questions: [
    mc("With `line = \"[x] pay rent\"`, what is `line[1] == \"x\"`?", ["`True`", "`False`", "`\"x\"`", "An `IndexError`"], 0),
    mc("What should `load` return the very first time, before the file exists?", ["`None`", "An error", "An empty list", "A list with one empty task"], 2),
    mc("Why does `save` write to a `.tmp` file first?", ["So a crash mid-save can never leave a half-written list", "It is faster", "Python can't write to `.txt` directly", "To make a backup copy"], 0),
    mc("What does `\"[ ] call Ana\"[4:]` give?", ["`\"[ ] \"`", "`\" call Ana\"`", "`\"Ana\"`", "`\"call Ana\"`"], 3),
    qShort("With `tasks = [{\"title\": \"a\", \"done\": True}, {\"title\": \"b\", \"done\": False}]`, how many tasks are in `[t for t in tasks if not t[\"done\"]]`? (a number)", "1"),
    mc("Why catch `IndexError` for `done 9`?", ["To delete task 9", "There is no task 9, and the program should reply instead of crashing", "To add task 9", "It is never raised"], 1),
  ],
})
