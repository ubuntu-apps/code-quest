// Modules and packages topic: Dates and times. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "dates_times",
  title: "Dates and times",
  paragraphs: [
    "Due dates, ages, timetables, how long ago something happened: dates come up in almost every real program. The `datetime` module handles them, including the awkward parts like months of different lengths and leap years. It has three main types: `date` (a day), `datetime` (a day and a time), and `timedelta` (a length of time).",
    "```\nfrom datetime import date\n\nd = date(2025, 3, 14)        # year, month, day\nprint(d)                     # 2025-03-14\nprint(d.year, d.month, d.day)   # 2025 3 14\nprint(d.weekday())           # 4: Monday is 0, so this is a Friday\nprint(date.today())          # whatever today is\n```",
    "Dates can be compared with `<` and `>`, and subtracting one date from another gives a `timedelta`, whose `.days` is the gap in days. Adding a `timedelta` moves a date forward, rolling over into the next month or year as needed:",
    "```\nfrom datetime import date, timedelta\n\nstart = date(2025, 1, 15)\nprint(start + timedelta(days=30))           # 2025-02-14\nprint((date(2025, 3, 1) - start).days)      # 45\nprint(date(2024, 2, 28) + timedelta(days=1))  # 2024-02-29: a leap year\n```",
    "To show a date in a particular style, `strftime` (\"string from time\") fills in a pattern: `%d` is the day, `%m` the month number, `%Y` the four-digit year, `%A` the weekday name and `%B` the month name. Going the other way, `datetime.strptime` (\"string parse time\") reads text in a given pattern, and `date.fromisoformat` reads the standard `2025-03-14` form. Text that doesn't fit the pattern raises `ValueError`.",
    "```\nfrom datetime import date, datetime\n\nd = date(2025, 3, 14)\nprint(d.strftime(\"%d/%m/%Y\"))      # 14/03/2025\nprint(d.strftime(\"%A %d %B %Y\"))   # Friday 14 March 2025\n\nparsed = datetime.strptime(\"25/12/2025\", \"%d/%m/%Y\").date()\nprint(parsed)                          # 2025-12-25\nprint(date.fromisoformat(\"2025-07-04\"))  # 2025-07-04\n```",
    "A `datetime` adds hours, minutes and seconds. Subtracting two of them also gives a `timedelta`; its `.total_seconds()` turns the whole gap into seconds, which is the easiest way to get hours or minutes:",
    "```\nfrom datetime import datetime\n\nstart = datetime(2025, 3, 14, 9, 15)    # 9:15 in the morning\nend = datetime(2025, 3, 14, 17, 45)\ngap = end - start\nprint(gap)                          # 8:30:00\nprint(gap.total_seconds() / 3600)   # 8.5 hours\n```",
    "`date.today()` and `datetime.now()` give a different answer every day, which makes a function that uses them hard to check. A common habit is to pass \"today\" in as a parameter: `age(born, today)` can be tested with any date you like, and the real program just calls `age(born, date.today())`.",
  ],
  sandboxCode: "from datetime import date, timedelta\n\ntoday = date.today()\nprint(\"Today is\", today.strftime(\"%A %d %B %Y\"))\nprint(\"In 100 days:\", today + timedelta(days=100))\nnew_year = date(today.year + 1, 1, 1)\nprint(\"Days until New Year:\", (new_year - today).days)",
  sandboxSnippets: [
    snippet("Make a date", "from datetime import date\nd = date(2025, 12, 25)\nprint(d, d.strftime(\"%A\"))"),
    snippet("Days between", "from datetime import date\nprint((date(2025, 12, 25) - date(2025, 12, 1)).days)"),
    snippet("Parse text", "from datetime import datetime\nprint(datetime.strptime(\"03/04/2025 14:30\", \"%d/%m/%Y %H:%M\"))"),
    snippet("Leap years", "from datetime import date, timedelta\nprint(date(2024, 2, 28) + timedelta(days=1))\nprint(date(2025, 2, 28) + timedelta(days=1))"),
  ],
  readMore: { label: "Python docs: datetime", url: "https://docs.python.org/3/library/datetime.html", source: "Python docs" },
  challenges: [
    task("easy", "Make a date", {
      prompt: "Set `launch` to the date 20 July 2025, and `year` to its year.",
      starter: "from datetime import date\n",
      hint: "`date(2025, 7, 20)`, then `launch.year`.",
      solution: "from datetime import date\n\nlaunch = date(2025, 7, 20)\nyear = launch.year",
      tests: [
        ["launch is right", "launch == __import__(\"datetime\").date(2025, 7, 20)"],
        ["year is 2025", "year == 2025"],
      ],
    }),
    task("easy", "Days between", {
      prompt: "Set `gap` to the number of days from 1 January 2025 to 1 March 2025.",
      starter: "from datetime import date\n",
      hint: "Subtract the dates and take `.days`.",
      solution: "from datetime import date\n\ngap = (date(2025, 3, 1) - date(2025, 1, 1)).days",
      tests: [
        ["gap is 59", "gap == 59"],
      ],
    }),
    task("easy", "Thirty days later", {
      prompt: "A library book borrowed on `borrowed` is due back 30 days later. Set `due` to that date.",
      starter: "from datetime import date, timedelta\n\nborrowed = date(2025, 1, 15)\n",
      hint: "`borrowed + timedelta(days=30)`.",
      solution: "from datetime import date, timedelta\n\nborrowed = date(2025, 1, 15)\ndue = borrowed + timedelta(days=30)",
      tests: [
        ["due is 14 February", "due == __import__(\"datetime\").date(2025, 2, 14)"],
      ],
    }),
    task("medium", "Two styles", {
      prompt: "Set `short` to `d` written as `14/03/2025` and `long` to `Friday 14 March 2025`, using `strftime`.",
      starter: "from datetime import date\n\nd = date(2025, 3, 14)\n",
      hint: "The patterns are `\"%d/%m/%Y\"` and `\"%A %d %B %Y\"`.",
      solution: "from datetime import date\n\nd = date(2025, 3, 14)\nshort = d.strftime(\"%d/%m/%Y\")\nlong = d.strftime(\"%A %d %B %Y\")",
      tests: [
        ["short is right", "short == \"14/03/2025\""],
        ["long is right", "long == \"Friday 14 March 2025\""],
      ],
    }),
    task("medium", "Read a date", {
      prompt: "Define `parse(text)` that turns text like `25/12/2025` into a `date`.",
      starter: "from datetime import datetime\n",
      hint: "`datetime.strptime(text, \"%d/%m/%Y\").date()`.",
      solution: "from datetime import datetime\n\ndef parse(text):\n    return datetime.strptime(text, \"%d/%m/%Y\").date()",
      setup: "import io as _io, contextlib as _cl\ndef _out(fn, *a, **k):\n    buf = _io.StringIO()\n    with _cl.redirect_stdout(buf):\n        fn(*a, **k)\n    return buf.getvalue()\ndef _raises(fn, *a, **k):\n    try:\n        fn(*a, **k)\n    except Exception as e:\n        return type(e).__name__\n    return None\n",
      tests: [
        ["Christmas", "parse(\"25/12/2025\") == __import__(\"datetime\").date(2025, 12, 25)"],
        ["Single digits", "parse(\"01/02/2024\") == __import__(\"datetime\").date(2024, 2, 1)"],
        ["Not a date", "_raises(parse, \"31/02/2025\") == \"ValueError\""],
      ],
    }),
    task("medium", "Weekend?", {
      prompt: "Define `is_weekend(d)` that returns `True` if the date `d` is a Saturday or Sunday.",
      starter: "from datetime import date\n",
      hint: "`d.weekday()` is 5 for Saturday and 6 for Sunday.",
      solution: "from datetime import date\n\ndef is_weekend(d):\n    return d.weekday() >= 5",
      tests: [
        ["Saturday", "is_weekend(__import__(\"datetime\").date(2025, 3, 15)) is True"],
        ["Sunday", "is_weekend(__import__(\"datetime\").date(2025, 3, 16)) is True"],
        ["Friday", "is_weekend(__import__(\"datetime\").date(2025, 3, 14)) is False"],
      ],
    }),
    task("hard", "How old?", {
      prompt: "Define `age(born, today)` that returns a person's age in whole years on the date `today`. Careful: if this year's birthday hasn't come yet, they're a year younger than `today.year - born.year`.",
      starter: "from datetime import date\n",
      hint: "Subtract the years, then take one off if `(today.month, today.day) < (born.month, born.day)`.",
      solution: "from datetime import date\n\ndef age(born, today):\n    years = today.year - born.year\n    if (today.month, today.day) < (born.month, born.day):\n        years -= 1\n    return years",
      tests: [
        ["After the birthday", "age(__import__(\"datetime\").date(2000, 5, 14), __import__(\"datetime\").date(2025, 6, 1)) == 25"],
        ["Before the birthday", "age(__import__(\"datetime\").date(2000, 5, 14), __import__(\"datetime\").date(2025, 5, 13)) == 24"],
        ["On the birthday", "age(__import__(\"datetime\").date(2000, 5, 14), __import__(\"datetime\").date(2025, 5, 14)) == 25"],
      ],
    }),
    task("hard", "Hours worked", {
      prompt: "Define `hours(start, end)` that takes two times like `\"09:15\"` and `\"17:45\"` and returns the hours between them as a float (8.5 here).",
      starter: "from datetime import datetime\n",
      hint: "Parse each with `datetime.strptime(text, \"%H:%M\")`, subtract, and divide `.total_seconds()` by 3600.",
      solution: "from datetime import datetime\n\ndef hours(start, end):\n    a = datetime.strptime(start, \"%H:%M\")\n    b = datetime.strptime(end, \"%H:%M\")\n    return (b - a).total_seconds() / 3600",
      tests: [
        ["A working day", "hours(\"09:15\", \"17:45\") == 8.5"],
        ["Quarter of an hour", "hours(\"12:00\", \"12:15\") == 0.25"],
      ],
    }),
    task("expert", "Countdown", {
      prompt: "Define `countdown(now, event)` for two `datetime`s that returns text like `3 days, 4 hours, 5 minutes` until `event`, or `Started` if `event` isn't after `now`. Ignore leftover seconds.",
      starter: "from datetime import datetime\n",
      hint: "Take `gap = event - now`. `gap.days` is the days; `gap.seconds // 3600` the hours; `gap.seconds % 3600 // 60` the minutes.",
      solution: "from datetime import datetime\n\ndef countdown(now, event):\n    if event <= now:\n        return \"Started\"\n    gap = event - now\n    hours = gap.seconds // 3600\n    minutes = gap.seconds % 3600 // 60\n    return f\"{gap.days} days, {hours} hours, {minutes} minutes\"",
      tests: [
        ["A few days away", "countdown(__import__(\"datetime\").datetime(2025, 3, 1, 8, 0), __import__(\"datetime\").datetime(2025, 3, 4, 12, 5, 30)) == \"3 days, 4 hours, 5 minutes\""],
        ["Later today", "countdown(__import__(\"datetime\").datetime(2025, 3, 1, 22, 50), __import__(\"datetime\").datetime(2025, 3, 2, 1, 0)) == \"0 days, 2 hours, 10 minutes\""],
        ["Already started", "countdown(__import__(\"datetime\").datetime(2025, 3, 2), __import__(\"datetime\").datetime(2025, 3, 1)) == \"Started\""],
      ],
    }),
    task("expert", "Working days", {
      prompt: "Define `workdays(start, end)` that counts the weekdays (Monday to Friday) from `start` to `end`, including both.",
      starter: "from datetime import date, timedelta\n",
      hint: "Step a date from `start` to `end` with `timedelta(days=1)`, counting those with `weekday() < 5`.",
      solution: "from datetime import date, timedelta\n\ndef workdays(start, end):\n    count = 0\n    day = start\n    while day <= end:\n        if day.weekday() < 5:\n            count += 1\n        day += timedelta(days=1)\n    return count",
      tests: [
        ["One week", "workdays(__import__(\"datetime\").date(2025, 3, 10), __import__(\"datetime\").date(2025, 3, 16)) == 5"],
        ["March 2025", "workdays(__import__(\"datetime\").date(2025, 3, 1), __import__(\"datetime\").date(2025, 3, 31)) == 21"],
        ["A single Saturday", "workdays(__import__(\"datetime\").date(2025, 3, 15), __import__(\"datetime\").date(2025, 3, 15)) == 0"],
      ],
    }),
  ],
  questions: [
    mc("Which type stores a day with no time?", ["`datetime`", "`date`", "`timedelta`", "`time`"], 1, "`date` holds a year, month and day only."),
    mc("What does subtracting two dates give?", ["A date", "A number of seconds", "A `timedelta`", "An error"], 2, "One date minus another gives the time between them as a `timedelta`."),
    mc("What is `date(2025, 1, 31) + timedelta(days=1)`?", ["`2025-02-01`", "`2025-01-32`", "An error", "`2025-01-01`"], 0, "Date arithmetic knows month lengths, so the day after 31 January is 1 February."),
    mc("What does `d.weekday()` return for a Monday?", ["`1`", "`\"Monday\"`", "`7`", "`0`"], 3, "`weekday()` counts Monday as 0 and Sunday as 6."),
    mc("Which turns a date into text in a chosen style?", ["`strptime`", "`strftime`", "`fromisoformat`", "`str.format`"], 1, "`strftime` (string format time) turns a date into text; `strptime` parses text into a date."),
    mc("What does `datetime.strptime(\"31/02/2025\", \"%d/%m/%Y\")` do?", ["Raises `ValueError`", "Gives 3 March", "Gives 28 February", "Returns `None`"], 0, "There is no 31 February, so parsing it fails with a `ValueError`."),
    qShort("In a `strftime` pattern, which code gives the four-digit year? (like `%x`)", "%Y", "`%Y` is the year with century, like 2025."),
    mc("How do you get the hours in a `timedelta` called `gap`?", ["`gap.hours`", "`gap.days * 24`", "`int(gap)`", "`gap.total_seconds() / 3600`"], 3, "A `timedelta` stores days and seconds; `total_seconds()` gives the whole length in seconds."),
    qShort("With `def days_left(due, today): return (due - today).days`, what is `days_left(date(2025, 3, 10), date(2025, 3, 1))`? (a number)", "9", "Because `today` is a parameter, any date can be passed in, so the answer can be checked without waiting for a real day."),
    mc("What does `date.fromisoformat(\"2025-07-04\")` give?", ["4 July 2025", "7 April 2025", "A string", "An error"], 0, "ISO dates are written year-month-day."),
  ],
})
