// Files project: Log analyser. Lesson, Try-it snippets, challenges and quiz.
import { makeProject, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeProject("medium", {
  id: "proj_log_analyser",
  title: "Log analyser",
  paragraphs: [
    "Programs write **log files** as they run, one line per event, and when something goes wrong, reading the log is how you find out what happened. Build a tool that reads a server log, counts what happened, pulls out the errors and writes a short report.",
    "Each line has a date, a time, a level and a message, separated by spaces: `2026-10-17 09:20:44 ERROR Disk full`. Real logs also contain the odd broken line, which the analyser must skip rather than crash on. For the log in this side quest, the finished report is:",
    "```\nLog: server.log\nERROR: 3\nINFO: 2\nWARNING: 1\nMost common error: Disk full\n```",
    "`line.split(\" \", 3)` splits at the first three spaces only, so the message stays in one piece however many spaces it has. A line that doesn't give four parts is broken.",
    "Build it in steps: reading one line, counting the levels, errors by hour, saving the errors to their own file, the most common error, and finally the whole report.",
  ],
  sandboxCode: "line = \"2026-10-17 10:05:51 ERROR Timeout talking to database\"\nprint(line.split(\" \", 3))\nprint(line.split(\" \"))",
  sandboxSnippets: [
    snippet("Split a limited number of times", "print(\"a b c d e\".split(\" \", 2))"),
    snippet("The hour of a time", "time = \"09:20:44\"\nprint(time[:2], time.split(\":\")[0])"),
    snippet("Most common", "counts = {\"Disk full\": 2, \"Timeout\": 1}\nprint(max(counts, key=counts.get))"),
  ],
  challenges: [
    task("easy", "Read one line", {
      prompt: "Define `parse_line(line)` that returns `(date, time, level, message)` (the message stripped), or raises `ValueError(\"Bad log line: <line>\")` (the line stripped) when it doesn't have four parts.",
      hint: "`parts = line.split(\" \", 3)`, check `len(parts) != 4`, then unpack.",
      solution: "def parse_line(line):\n    parts = line.split(\" \", 3)\n    if len(parts) != 4:\n        raise ValueError(f\"Bad log line: {line.strip()}\")\n    date, time, level, message = parts\n    return date, time, level, message.strip()\n",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\ndef _error(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return f\"{type(e).__name__}: {e}\"\n    return None\ndef _logs(fn, *a, **k):\n    import logging as _lg\n    records = []\n    class _H(_lg.Handler):\n        def emit(self, r):\n            records.append(f\"{r.levelname}: {r.getMessage()}\")\n    h = _H()\n    root = _lg.getLogger()\n    old = root.level\n    root.addHandler(h)\n    root.setLevel(_lg.DEBUG)\n    try:\n        fn(*a, **k)\n    finally:\n        root.removeHandler(h)\n        root.setLevel(old)\n    return records\ndef _raise(exc):\n    raise exc\ndef _catches(test_fn, name, fake):\n    g = test_fn.__globals__\n    real = g[name]\n    g[name] = fake\n    try:\n        test_fn()\n    except AssertionError:\n        return True\n    finally:\n        g[name] = real\n    return False\n",
      tests: [
        ["A good line", "parse_line(\"2026-10-17 09:20:44 ERROR Disk full\\n\") == (\"2026-10-17\", \"09:20:44\", \"ERROR\", \"Disk full\")"],
        ["A long message", "parse_line(\"d t INFO one two  three\")[3] == \"one two  three\""],
        ["A broken line", "_error(parse_line, \"this line\\n\") == \"ValueError: Bad log line: this line\""],
      ],
    }),
    task("medium", "Count the levels", {
      prompt: "Define `count_levels(name)` that returns a dict counting the levels in a log file, skipping broken lines.",
      starter: "def parse_line(line):\n    parts = line.split(\" \", 3)\n    if len(parts) != 4:\n        raise ValueError(f\"Bad log line: {line.strip()}\")\n    date, time, level, message = parts\n    return date, time, level, message.strip()\n\n",
      hint: "Loop over the file; `try` to `parse_line`, `continue` on `ValueError`, and count the level.",
      solution: "def parse_line(line):\n    parts = line.split(\" \", 3)\n    if len(parts) != 4:\n        raise ValueError(f\"Bad log line: {line.strip()}\")\n    date, time, level, message = parts\n    return date, time, level, message.strip()\n\ndef count_levels(name):\n    counts = {}\n    with open(name, encoding=\"utf-8\") as f:\n        for line in f:\n            try:\n                date, time, level, message = parse_line(line)\n            except ValueError:\n                continue\n            counts[level] = counts.get(level, 0) + 1\n    return counts\n",
      setup: "import os as _os\nwith open('server.log', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('2026-10-17 09:15:02 INFO Server started\\n2026-10-17 09:20:44 ERROR Disk full\\n2026-10-17 10:02:10 WARNING Slow response\\n2026-10-17 10:05:51 ERROR Timeout talking to database\\n2026-10-17 10:30:00 INFO Backup done\\n--- broken ---\\n2026-10-17 11:45:13 ERROR Disk full\\n')\n",
      tests: [
        ["Counts server.log", "count_levels(\"server.log\") == {\"INFO\": 2, \"ERROR\": 3, \"WARNING\": 1}"],
      ],
    }),
    task("medium", "Errors by hour", {
      prompt: "Define `errors_by_hour(name)` that returns a dict mapping each hour (the first two characters of the time, like `\"09\"`) to how many `ERROR` lines happened in it.",
      starter: "def parse_line(line):\n    parts = line.split(\" \", 3)\n    if len(parts) != 4:\n        raise ValueError(f\"Bad log line: {line.strip()}\")\n    date, time, level, message = parts\n    return date, time, level, message.strip()\n\n",
      hint: "Like `count_levels`, but only for `ERROR`, counting `time[:2]`.",
      solution: "def parse_line(line):\n    parts = line.split(\" \", 3)\n    if len(parts) != 4:\n        raise ValueError(f\"Bad log line: {line.strip()}\")\n    date, time, level, message = parts\n    return date, time, level, message.strip()\n\ndef errors_by_hour(name):\n    hours = {}\n    with open(name, encoding=\"utf-8\") as f:\n        for line in f:\n            try:\n                date, time, level, message = parse_line(line)\n            except ValueError:\n                continue\n            if level == \"ERROR\":\n                hour = time[:2]\n                hours[hour] = hours.get(hour, 0) + 1\n    return hours\n",
      setup: "import os as _os\nwith open('server.log', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('2026-10-17 09:15:02 INFO Server started\\n2026-10-17 09:20:44 ERROR Disk full\\n2026-10-17 10:02:10 WARNING Slow response\\n2026-10-17 10:05:51 ERROR Timeout talking to database\\n2026-10-17 10:30:00 INFO Backup done\\n--- broken ---\\n2026-10-17 11:45:13 ERROR Disk full\\n')\n",
      tests: [
        ["server.log", "errors_by_hour(\"server.log\") == {\"09\": 1, \"10\": 1, \"11\": 1}"],
      ],
    }),
    task("medium", "Save the errors", {
      prompt: "Define `save_errors(name, out)` that copies the `ERROR` lines of a log, unchanged, into the file `out`, and returns how many it copied.",
      starter: "def parse_line(line):\n    parts = line.split(\" \", 3)\n    if len(parts) != 4:\n        raise ValueError(f\"Bad log line: {line.strip()}\")\n    date, time, level, message = parts\n    return date, time, level, message.strip()\n\n",
      hint: "Open both files in one `with`. Write the original `line` (it already has its `\\n`).",
      solution: "def parse_line(line):\n    parts = line.split(\" \", 3)\n    if len(parts) != 4:\n        raise ValueError(f\"Bad log line: {line.strip()}\")\n    date, time, level, message = parts\n    return date, time, level, message.strip()\n\ndef save_errors(name, out):\n    count = 0\n    with open(name, encoding=\"utf-8\") as src, open(out, \"w\", encoding=\"utf-8\") as dst:\n        for line in src:\n            try:\n                date, time, level, message = parse_line(line)\n            except ValueError:\n                continue\n            if level == \"ERROR\":\n                dst.write(line)\n                count += 1\n    return count\n",
      setup: "import os as _os\nwith open('server.log', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('2026-10-17 09:15:02 INFO Server started\\n2026-10-17 09:20:44 ERROR Disk full\\n2026-10-17 10:02:10 WARNING Slow response\\n2026-10-17 10:05:51 ERROR Timeout talking to database\\n2026-10-17 10:30:00 INFO Backup done\\n--- broken ---\\n2026-10-17 11:45:13 ERROR Disk full\\n')\ndef _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["Copies three", "save_errors(\"server.log\", \"errors.log\") == 3"],
        ["errors.log is right", "(save_errors(\"server.log\", \"e2.log\"), _read(\"e2.log\"))[1] == \"2026-10-17 09:20:44 ERROR Disk full\\n2026-10-17 10:05:51 ERROR Timeout talking to database\\n2026-10-17 11:45:13 ERROR Disk full\\n\""],
      ],
    }),
    task("hard", "The most common error", {
      prompt: "Define `top_error(name)` that returns the error message that appears most often, or `None` if there are no errors.",
      starter: "def parse_line(line):\n    parts = line.split(\" \", 3)\n    if len(parts) != 4:\n        raise ValueError(f\"Bad log line: {line.strip()}\")\n    date, time, level, message = parts\n    return date, time, level, message.strip()\n\n",
      hint: "Count the messages of `ERROR` lines in a dict, then `max(messages, key=messages.get)`.",
      solution: "def parse_line(line):\n    parts = line.split(\" \", 3)\n    if len(parts) != 4:\n        raise ValueError(f\"Bad log line: {line.strip()}\")\n    date, time, level, message = parts\n    return date, time, level, message.strip()\n\ndef top_error(name):\n    messages = {}\n    with open(name, encoding=\"utf-8\") as f:\n        for line in f:\n            try:\n                date, time, level, message = parse_line(line)\n            except ValueError:\n                continue\n            if level == \"ERROR\":\n                messages[message] = messages.get(message, 0) + 1\n    if not messages:\n        return None\n    return max(messages, key=messages.get)\n",
      setup: "import os as _os\nwith open('server.log', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('2026-10-17 09:15:02 INFO Server started\\n2026-10-17 09:20:44 ERROR Disk full\\n2026-10-17 10:02:10 WARNING Slow response\\n2026-10-17 10:05:51 ERROR Timeout talking to database\\n2026-10-17 10:30:00 INFO Backup done\\n--- broken ---\\n2026-10-17 11:45:13 ERROR Disk full\\n')\nwith open('calm.log', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('2026-10-17 09:00:00 INFO all good\\n')\n",
      tests: [
        ["Disk full", "top_error(\"server.log\") == \"Disk full\""],
        ["No errors", "top_error(\"calm.log\") is None"],
      ],
    }),
    task("expert", "The report", {
      prompt: "Define `analyse(name, report)` that writes the report from the intro into the file `report` and returns `Report saved`, or returns `No log file: <name>` (writing nothing) if the log doesn't exist. Use the functions you've written.",
      starter: "def parse_line(line):\n    parts = line.split(\" \", 3)\n    if len(parts) != 4:\n        raise ValueError(f\"Bad log line: {line.strip()}\")\n    date, time, level, message = parts\n    return date, time, level, message.strip()\n\ndef count_levels(name):\n    counts = {}\n    with open(name, encoding=\"utf-8\") as f:\n        for line in f:\n            try:\n                date, time, level, message = parse_line(line)\n            except ValueError:\n                continue\n            counts[level] = counts.get(level, 0) + 1\n    return counts\n\ndef errors_by_hour(name):\n    hours = {}\n    with open(name, encoding=\"utf-8\") as f:\n        for line in f:\n            try:\n                date, time, level, message = parse_line(line)\n            except ValueError:\n                continue\n            if level == \"ERROR\":\n                hour = time[:2]\n                hours[hour] = hours.get(hour, 0) + 1\n    return hours\n\ndef save_errors(name, out):\n    count = 0\n    with open(name, encoding=\"utf-8\") as src, open(out, \"w\", encoding=\"utf-8\") as dst:\n        for line in src:\n            try:\n                date, time, level, message = parse_line(line)\n            except ValueError:\n                continue\n            if level == \"ERROR\":\n                dst.write(line)\n                count += 1\n    return count\n\ndef top_error(name):\n    messages = {}\n    with open(name, encoding=\"utf-8\") as f:\n        for line in f:\n            try:\n                date, time, level, message = parse_line(line)\n            except ValueError:\n                continue\n            if level == \"ERROR\":\n                messages[message] = messages.get(message, 0) + 1\n    if not messages:\n        return None\n    return max(messages, key=messages.get)\n\n",
      hint: "Call `count_levels` inside `try`, catching `FileNotFoundError`. Build the lines (levels sorted), add the most common error (or `none`), and write them.",
      solution: "def parse_line(line):\n    parts = line.split(\" \", 3)\n    if len(parts) != 4:\n        raise ValueError(f\"Bad log line: {line.strip()}\")\n    date, time, level, message = parts\n    return date, time, level, message.strip()\n\ndef count_levels(name):\n    counts = {}\n    with open(name, encoding=\"utf-8\") as f:\n        for line in f:\n            try:\n                date, time, level, message = parse_line(line)\n            except ValueError:\n                continue\n            counts[level] = counts.get(level, 0) + 1\n    return counts\n\ndef errors_by_hour(name):\n    hours = {}\n    with open(name, encoding=\"utf-8\") as f:\n        for line in f:\n            try:\n                date, time, level, message = parse_line(line)\n            except ValueError:\n                continue\n            if level == \"ERROR\":\n                hour = time[:2]\n                hours[hour] = hours.get(hour, 0) + 1\n    return hours\n\ndef save_errors(name, out):\n    count = 0\n    with open(name, encoding=\"utf-8\") as src, open(out, \"w\", encoding=\"utf-8\") as dst:\n        for line in src:\n            try:\n                date, time, level, message = parse_line(line)\n            except ValueError:\n                continue\n            if level == \"ERROR\":\n                dst.write(line)\n                count += 1\n    return count\n\ndef top_error(name):\n    messages = {}\n    with open(name, encoding=\"utf-8\") as f:\n        for line in f:\n            try:\n                date, time, level, message = parse_line(line)\n            except ValueError:\n                continue\n            if level == \"ERROR\":\n                messages[message] = messages.get(message, 0) + 1\n    if not messages:\n        return None\n    return max(messages, key=messages.get)\n\ndef analyse(name, report):\n    try:\n        levels = count_levels(name)\n    except FileNotFoundError:\n        return f\"No log file: {name}\"\n    lines = [f\"Log: {name}\"]\n    for level in sorted(levels):\n        lines.append(f\"{level}: {levels[level]}\")\n    common = top_error(name)\n    lines.append(f\"Most common error: {common or 'none'}\")\n    with open(report, \"w\", encoding=\"utf-8\") as f:\n        f.write(\"\\n\".join(lines) + \"\\n\")\n    return \"Report saved\"\n",
      setup: "import os as _os\nwith open('server.log', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('2026-10-17 09:15:02 INFO Server started\\n2026-10-17 09:20:44 ERROR Disk full\\n2026-10-17 10:02:10 WARNING Slow response\\n2026-10-17 10:05:51 ERROR Timeout talking to database\\n2026-10-17 10:30:00 INFO Backup done\\n--- broken ---\\n2026-10-17 11:45:13 ERROR Disk full\\n')\ndef _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["Report saved", "analyse(\"server.log\", \"report.txt\") == \"Report saved\""],
        ["report.txt is right", "(analyse(\"server.log\", \"r2.txt\"), _read(\"r2.txt\"))[1] == \"Log: server.log\\nERROR: 3\\nINFO: 2\\nWARNING: 1\\nMost common error: Disk full\\n\""],
        ["A missing log", "analyse(\"missing.log\", \"r3.txt\") == \"No log file: missing.log\" and not __import__(\"os\").path.exists(\"r3.txt\")"],
      ],
    }),
  ],
  questions: [
    mc("Why does the analyser skip broken lines instead of stopping?", ["Python can't read them", "Real logs often contain odd lines, and one shouldn't spoil the report", "They are always empty", "To make it faster"], 1, "Skipping and counting odd lines keeps the analysis going."),
    mc("What does `\"a b c d e\".split(\" \", 2)` give?", ["`[\"a\", \"b\", \"c\", \"d\", \"e\"]`", "`[\"a\", \"b\"]`", "`[\"a\", \"b\", \"c d e\"]`", "`[\"a b\", \"c d e\"]`"], 2, "`maxsplit=2` splits at most twice, so the message keeps its spaces."),
    mc("Why write the original `line` when copying errors?", ["It already ends with its `\\n` and stays exactly as logged", "Lines can't be changed", "It is shorter", "To remove the date"], 0, "Copying the original line keeps it identical, newline included."),
    mc("How is \"the most common error\" found?", ["The first error", "The longest message", "Sorting the file", "Counting messages in a dict and taking `max` by count"], 3, "A dict counts each message, and `max` with a key finds the largest count."),
    qShort("What is `\"09:20:44\"[:2]`?", "09", "`[:2]` takes the first two characters, the hour."),
    mc("What should `analyse` do when the log doesn't exist?", ["Write an empty report", "Return a clear message and write nothing", "Crash", "Create the log"], 1, "A missing input file is reported clearly, and no empty report is written."),
  ],
})
