// Modules and packages project: Habit tracker. Lesson, Try-it snippets, challenges and quiz.
import { makeProject, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeProject("medium", {
  id: "proj_habit_tracker",
  title: "Habit tracker",
  paragraphs: [
    "Keeping a habit going, like practising, reading or walking, is easier when you can see your streak. Build `habits.py`, a module that keeps a log of the days you did your habit, one date per line, in `habit.txt`:",
    "```\n2025-03-10\n2025-03-12\n2025-03-13\n```",
    "From the log it works out how things are going. On 13 March 2025, with the longer log the checks use, it reports:",
    "```\nDone today: yes\nCurrent streak: 2 days\nLongest streak: 5 days\nThis week: 3 of 7\n```",
    "The current streak counts the days in a row ending today, or ending yesterday if today isn't logged yet, because the day isn't over. Dates are stored in the standard `2025-03-13` form, which `date.fromisoformat` reads and `isoformat()` writes, and every function takes \"today\" as a parameter, so the checks can use any date they like. The real program passes `date.today()`.",
  ],
  sandboxCode: "from datetime import date, timedelta\n\ndays = [date(2025, 3, 10), date(2025, 3, 11), date(2025, 3, 12)]\ntoday = date(2025, 3, 12)\nstreak = 0\nday = today\nwhile day in days:\n    streak += 1\n    day -= timedelta(days=1)\nprint(\"Streak:\", streak)",
  sandboxSnippets: [
    snippet("Dates to text and back", "from datetime import date\nd = date(2025, 3, 13)\nprint(d.isoformat(), date.fromisoformat(\"2025-03-13\") == d)"),
    snippet("The Monday of this week", "from datetime import date, timedelta\ntoday = date(2025, 3, 13)\nprint(today - timedelta(days=today.weekday()))"),
    snippet("Days in a row?", "from datetime import date, timedelta\na, b = date(2025, 3, 12), date(2025, 3, 13)\nprint(b - a == timedelta(days=1))"),
  ],
  challenges: [
    task("easy", "Load the log", {
      prompt: "Define `load_days(name)` that returns the dates in the log file as a sorted list of `date`s, without repeats and skipping blank lines. A missing file gives `[]`.",
      starter: "from datetime import date, timedelta\n\n",
      hint: "A set comprehension of `date.fromisoformat(line.strip())`, inside `try`; then `sorted(...)`.",
      solution: "from datetime import date, timedelta\n\ndef load_days(name):\n    try:\n        with open(name, encoding=\"utf-8\") as f:\n            days = {date.fromisoformat(line.strip()) for line in f if line.strip()}\n    except FileNotFoundError:\n        return []\n    return sorted(days)\n",
      setup: "import os as _os\nwith open('habit.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('2025-03-03\\n2025-03-04\\n2025-03-05\\n2025-03-06\\n2025-03-07\\n\\n2025-03-10\\n2025-03-12\\n2025-03-13\\n2025-03-12\\n')\n",
      tests: [
        ["Eight different days", "len(load_days(\"habit.txt\")) == 8"],
        ["Sorted dates", "load_days(\"habit.txt\")[0] == __import__(\"datetime\").date(2025, 3, 3) and load_days(\"habit.txt\")[-1] == __import__(\"datetime\").date(2025, 3, 13)"],
        ["No log yet", "load_days(\"none.txt\") == []"],
      ],
    }),
    task("medium", "Mark a day", {
      prompt: "Define `mark_done(name, day)` that adds `day` to the log (as `2025-03-14`) and returns `True`, or returns `False` without writing if it's already there.",
      starter: "from datetime import date, timedelta\n\ndef load_days(name):\n    try:\n        with open(name, encoding=\"utf-8\") as f:\n            days = {date.fromisoformat(line.strip()) for line in f if line.strip()}\n    except FileNotFoundError:\n        return []\n    return sorted(days)\n\n",
      hint: "Check `day in load_days(name)` first, then append `day.isoformat() + \"\\n\"`.",
      solution: "from datetime import date, timedelta\n\ndef load_days(name):\n    try:\n        with open(name, encoding=\"utf-8\") as f:\n            days = {date.fromisoformat(line.strip()) for line in f if line.strip()}\n    except FileNotFoundError:\n        return []\n    return sorted(days)\n\ndef mark_done(name, day):\n    if day in load_days(name):\n        return False\n    with open(name, \"a\", encoding=\"utf-8\") as f:\n        f.write(day.isoformat() + \"\\n\")\n    return True\n",
      setup: "import os as _os\nwith open('habit.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('2025-03-03\\n2025-03-04\\n2025-03-05\\n2025-03-06\\n2025-03-07\\n\\n2025-03-10\\n2025-03-12\\n2025-03-13\\n2025-03-12\\n')\ndef _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["A new day", "mark_done(\"habit.txt\", __import__(\"datetime\").date(2025, 3, 14)) is True and _read(\"habit.txt\").endswith(\"2025-03-14\\n\")"],
        ["Already done", "mark_done(\"habit.txt\", __import__(\"datetime\").date(2025, 3, 13)) is False and _read(\"habit.txt\").count(\"2025-03-13\") == 1"],
        ["A new log", "mark_done(\"new.txt\", __import__(\"datetime\").date(2025, 1, 1)) is True and _read(\"new.txt\") == \"2025-01-01\\n\""],
      ],
    }),
    task("medium", "Current streak", {
      prompt: "Define `current_streak(days, today)`: how many days in a row, ending today, are in `days`. If today isn't in `days` yet, count from yesterday instead.",
      starter: "from datetime import date, timedelta\n\n",
      hint: "Turn `days` into a set. Start at `today`, or `today - timedelta(days=1)`, and step back one day at a time while the day is in the set.",
      solution: "from datetime import date, timedelta\n\ndef current_streak(days, today):\n    done = set(days)\n    day = today if today in done else today - timedelta(days=1)\n    streak = 0\n    while day in done:\n        streak += 1\n        day -= timedelta(days=1)\n    return streak\n",
      tests: [
        ["Ending today", "current_streak([__import__(\"datetime\").date(2025, 3, 11), __import__(\"datetime\").date(2025, 3, 12), __import__(\"datetime\").date(2025, 3, 13)], __import__(\"datetime\").date(2025, 3, 13)) == 3"],
        ["Not done today yet", "current_streak([__import__(\"datetime\").date(2025, 3, 11), __import__(\"datetime\").date(2025, 3, 12)], __import__(\"datetime\").date(2025, 3, 13)) == 2"],
        ["Broken", "current_streak([__import__(\"datetime\").date(2025, 3, 10)], __import__(\"datetime\").date(2025, 3, 13)) == 0"],
        ["Across a month", "current_streak([__import__(\"datetime\").date(2025, 2, 28), __import__(\"datetime\").date(2025, 3, 1)], __import__(\"datetime\").date(2025, 3, 1)) == 2"],
      ],
    }),
    task("hard", "Longest streak", {
      prompt: "Define `longest_streak(days)`: the longest run of days in a row anywhere in `days` (which may be unsorted and have repeats).",
      starter: "from datetime import date, timedelta\n\n",
      hint: "Go through `sorted(set(days))`. If a day is exactly one day after the previous, the run grows; otherwise it restarts at 1. Keep the best.",
      solution: "from datetime import date, timedelta\n\ndef longest_streak(days):\n    best = 0\n    run = 0\n    previous = None\n    for day in sorted(set(days)):\n        if previous is not None and day - previous == timedelta(days=1):\n            run += 1\n        else:\n            run = 1\n        best = max(best, run)\n        previous = day\n    return best\n",
      setup: "import datetime as _dt\n_r = '2025-03-03\\n2025-03-04\\n2025-03-05\\n2025-03-06\\n2025-03-07\\n\\n2025-03-10\\n2025-03-12\\n2025-03-13\\n2025-03-12\\n'\ndef load(text):\n    return [_dt.date.fromisoformat(x) for x in text.split()]\n",
      tests: [
        ["The log", "longest_streak(load(_r)) == 5"],
        ["Unsorted with repeats", "longest_streak([__import__(\"datetime\").date(2025, 1, 2), __import__(\"datetime\").date(2025, 1, 1), __import__(\"datetime\").date(2025, 1, 2), __import__(\"datetime\").date(2025, 1, 3)]) == 3"],
        ["Nothing yet", "longest_streak([]) == 0"],
      ],
    }),
    task("hard", "This week", {
      prompt: "Define `this_week(days, today)`: how many different days in `days` fall in the same Monday-to-Sunday week as `today`.",
      starter: "from datetime import date, timedelta\n\n",
      hint: "Monday is `today - timedelta(days=today.weekday())`; Sunday is 6 days later. Count the days of `set(days)` between them.",
      solution: "from datetime import date, timedelta\n\ndef this_week(days, today):\n    monday = today - timedelta(days=today.weekday())\n    sunday = monday + timedelta(days=6)\n    return sum(1 for day in set(days) if monday <= day <= sunday)\n",
      setup: "import datetime as _dt\n_r = '2025-03-03\\n2025-03-04\\n2025-03-05\\n2025-03-06\\n2025-03-07\\n\\n2025-03-10\\n2025-03-12\\n2025-03-13\\n2025-03-12\\n'\ndef load(text):\n    return [_dt.date.fromisoformat(x) for x in text.split()]\n",
      tests: [
        ["Thursday 13 March", "this_week(load(_r), __import__(\"datetime\").date(2025, 3, 13)) == 3"],
        ["The week before", "this_week(load(_r), __import__(\"datetime\").date(2025, 3, 9)) == 5"],
        ["An empty week", "this_week(load(_r), __import__(\"datetime\").date(2025, 4, 1)) == 0"],
      ],
    }),
    task("expert", "The report", {
      prompt: "Your code is `habits.py`. Add `summary(name, today)`, returning the four report lines shown in the lesson (with `1 day`, not `1 days`), and under a main guard print the summary for `habit.txt` and `date.today()`.",
      starter: "from datetime import date, timedelta\n\ndef load_days(name):\n    try:\n        with open(name, encoding=\"utf-8\") as f:\n            days = {date.fromisoformat(line.strip()) for line in f if line.strip()}\n    except FileNotFoundError:\n        return []\n    return sorted(days)\n\ndef mark_done(name, day):\n    if day in load_days(name):\n        return False\n    with open(name, \"a\", encoding=\"utf-8\") as f:\n        f.write(day.isoformat() + \"\\n\")\n    return True\n\ndef current_streak(days, today):\n    done = set(days)\n    day = today if today in done else today - timedelta(days=1)\n    streak = 0\n    while day in done:\n        streak += 1\n        day -= timedelta(days=1)\n    return streak\n\ndef longest_streak(days):\n    best = 0\n    run = 0\n    previous = None\n    for day in sorted(set(days)):\n        if previous is not None and day - previous == timedelta(days=1):\n            run += 1\n        else:\n            run = 1\n        best = max(best, run)\n        previous = day\n    return best\n\ndef this_week(days, today):\n    monday = today - timedelta(days=today.weekday())\n    sunday = monday + timedelta(days=6)\n    return sum(1 for day in set(days) if monday <= day <= sunday)\n\n",
      hint: "Load the days once, then build the four f-strings from your functions. A small helper can turn a number into `1 day` or `3 days`.",
      solution: "from datetime import date, timedelta\n\ndef load_days(name):\n    try:\n        with open(name, encoding=\"utf-8\") as f:\n            days = {date.fromisoformat(line.strip()) for line in f if line.strip()}\n    except FileNotFoundError:\n        return []\n    return sorted(days)\n\ndef mark_done(name, day):\n    if day in load_days(name):\n        return False\n    with open(name, \"a\", encoding=\"utf-8\") as f:\n        f.write(day.isoformat() + \"\\n\")\n    return True\n\ndef current_streak(days, today):\n    done = set(days)\n    day = today if today in done else today - timedelta(days=1)\n    streak = 0\n    while day in done:\n        streak += 1\n        day -= timedelta(days=1)\n    return streak\n\ndef longest_streak(days):\n    best = 0\n    run = 0\n    previous = None\n    for day in sorted(set(days)):\n        if previous is not None and day - previous == timedelta(days=1):\n            run += 1\n        else:\n            run = 1\n        best = max(best, run)\n        previous = day\n    return best\n\ndef this_week(days, today):\n    monday = today - timedelta(days=today.weekday())\n    sunday = monday + timedelta(days=6)\n    return sum(1 for day in set(days) if monday <= day <= sunday)\n\ndef days_text(n):\n    return \"1 day\" if n == 1 else f\"{n} days\"\n\n\ndef summary(name, today):\n    days = load_days(name)\n    return [\n        f\"Done today: {'yes' if today in days else 'no'}\",\n        f\"Current streak: {days_text(current_streak(days, today))}\",\n        f\"Longest streak: {days_text(longest_streak(days))}\",\n        f\"This week: {this_week(days, today)} of 7\",\n    ]\n\n\nif __name__ == \"__main__\":\n    for line in summary(\"habit.txt\", date.today()):\n        print(line)\n",
      setup: "import os as _os\nwith open('habit.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('2025-03-03\\n2025-03-04\\n2025-03-05\\n2025-03-06\\n2025-03-07\\n\\n2025-03-10\\n2025-03-12\\n2025-03-13\\n2025-03-12\\n')\ndef _import_both(path):\n    import importlib as _il, sys as _sys, os as _os, io as _io, contextlib as _cl\n    folder = _os.path.dirname(path)\n    if folder:\n        _os.makedirs(folder, exist_ok=True)\n    with open(path, \"w\", encoding=\"utf-8\") as _f:\n        _f.write(_cq_source)\n    name = path[:-3].replace(\"/\", \".\")\n    if name.endswith(\".__init__\"):\n        name = name[:-9]\n    for _k in [k for k in _sys.modules if k == name or k.startswith(name + \".\")]:\n        del _sys.modules[_k]\n    _il.invalidate_caches()\n    import builtins as _bi\n    def _no_input(prompt=\"\"):\n        raise RuntimeError(\"input() ran while the module was being imported: put that code under the main guard\")\n    buf = _io.StringIO()\n    real_input = _bi.input\n    _bi.input = _no_input\n    try:\n        with _cl.redirect_stdout(buf):\n            mod = _il.import_module(name)\n    finally:\n        _bi.input = real_input\n    return mod, buf.getvalue()\ndef _module(path):\n    return _import_both(path)[0]\ndef _import_prints(path):\n    return _import_both(path)[1]\n",
      tests: [
        ["13 March", "_module(\"habits.py\").summary(\"habit.txt\", __import__(\"datetime\").date(2025, 3, 13)) == [\"Done today: yes\", \"Current streak: 2 days\", \"Longest streak: 5 days\", \"This week: 3 of 7\"]"],
        ["11 March", "summary(\"habit.txt\", __import__(\"datetime\").date(2025, 3, 11)) == [\"Done today: no\", \"Current streak: 1 day\", \"Longest streak: 5 days\", \"This week: 3 of 7\"]"],
        ["Running prints the report", "len(_cq_stdout.splitlines()) == 4 and _cq_stdout.startswith(\"Done today: \")"],
        ["Importing is silent", "_import_prints(\"habits.py\") == \"\""],
      ],
    }),
  ],
  questions: [
    mc("Why store dates as `2025-03-13`?", ["It is shorter", "It is the standard form that `fromisoformat` reads and `isoformat` writes", "Python can't store other forms", "It hides the year"], 1),
    mc("Why does every function take `today` as a parameter?", ["It is faster", "Dates need it", "So the checks can use any date instead of the real one", "To change the clock"], 2),
    mc("Today isn't logged yet, but yesterday and the day before are. What is the current streak?", ["2", "0", "1", "3"], 0),
    mc("How do you find the Monday of `today`'s week?", ["`today.monday()`", "`today - timedelta(days=7)`", "`date(today.year, 1, 1)`", "`today - timedelta(days=today.weekday())`"], 3),
    qShort("`date(2025, 3, 13) - date(2025, 3, 12)` equals `timedelta(days=...)`? (a number)", "1"),
    mc("Why turn `days` into a set?", ["Repeated dates count once, and checking `day in done` is fast", "Sets sort dates", "Sets can be saved to files", "It is required by `datetime`"], 0),
  ],
})
