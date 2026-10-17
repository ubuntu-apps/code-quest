import { makeTopic, mc, py, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: 'datetime_data',
  title: 'Dates and times',
  paragraphs: [
    "The `datetime` module has a type for each job: `date` for a day (16 October 2026), `datetime` for a day and a time, and `timedelta` for a length of time, such as 30 days or 90 minutes.",
    "```\nfrom datetime import date, datetime, timedelta\n\nd = date(2026, 10, 16)\nmeeting = datetime(2026, 10, 16, 9, 30)\nprint(d + timedelta(days=30))   # 2026-11-15\n```",
    "Date arithmetic follows the calendar: adding `timedelta(days=1)` to 31 January gives 1 February. Subtracting two dates gives a `timedelta`, and its `.days` is the number of days between them (negative if the second date is later). Dates compare with `<` and `>`, and tuples help compare parts of them: `(today.month, today.day) < (birth.month, birth.day)` is true while this year's birthday is still to come.",
    "`strftime` (\"string format time\") turns a date into text using codes: `%Y` is the 4-digit year (`%y` gives only 2 digits), `%m` the month number, `%d` the day, `%H:%M` the 24-hour time, `%A` the weekday name and `%b` the short month name. `strptime` (\"string parse time\") goes the other way, reading text with the same codes:",
    "```\nprint(meeting.strftime(\"%d/%m/%Y %H:%M\"))   # 16/10/2026 09:30\nprint(meeting.strftime(\"%A\"))               # Friday\nparsed = datetime.strptime(\"16 Oct 2026\", \"%d %b %Y\")\n```",
    "APIs usually send times in the **ISO 8601** format, `2026-10-16T09:30:00`, because it sorts correctly and means the same everywhere. `.isoformat()` writes it and `datetime.fromisoformat(text)` (or `date.fromisoformat`) reads it.",
    "`d.weekday()` returns 0 for Monday up to 6 for Sunday, which makes weekends easy to skip, and `d.isocalendar().week` gives the ISO week number, handy for weekly reports.",
    "**Time zones.** A plain `datetime` is **naive**: it has no time zone, so 09:30 could be anywhere. An **aware** datetime carries one in `tzinfo`. Servers store times in UTC, which is the same everywhere and has no daylight-saving jumps, and convert to local time only to show it. `astimezone` converts:",
    "```\nfrom datetime import timezone\n\nutc_time = datetime(2026, 10, 16, 13, 0, tzinfo=timezone.utc)\nnew_york = timezone(timedelta(hours=-4))\nprint(utc_time.astimezone(new_york))   # 2026-10-16 09:00:00-04:00\n```",
    "Python won't compare a naive datetime with an aware one: it raises `TypeError` instead of guessing. The fixed offset above is fine for a single date; for a real place, whose offset changes with daylight saving, use `zoneinfo.ZoneInfo(\"America/New_York\")`.",
  ],
  sandboxCode: "from datetime import date, datetime, timedelta\n\ntoday = date(2026, 10, 16)\nprint(today.strftime(\"%A %d %B %Y\"))\nprint(today + timedelta(days=30))\nprint((date(2026, 12, 25) - today).days, \"days until 25 December\")",
  sandboxSnippets: [
    snippet("Dates and timedelta", "from datetime import date, timedelta\n\nd = date(2026, 1, 31)\nprint(d + timedelta(days=1))\nprint((date(2026, 3, 1) - d).days)"),
    snippet("Format", "from datetime import datetime\n\ndt = datetime(2026, 3, 5, 14, 30)\nprint(dt.strftime(\"%d/%m/%Y %H:%M\"))\nprint(dt.strftime(\"%A, %d %b %y\"))"),
    snippet("Parse", "from datetime import datetime\n\nparsed = datetime.strptime(\"16 Oct 2026\", \"%d %b %Y\")\nprint(parsed, parsed.year)"),
    snippet("ISO 8601", "from datetime import datetime, timedelta\n\nwhen = datetime.fromisoformat(\"2026-10-16T09:30:00\")\nprint((when + timedelta(minutes=90)).isoformat())"),
    snippet("Time zones", "from datetime import datetime, timedelta, timezone\n\nutc_time = datetime(2026, 10, 16, 13, 0, tzinfo=timezone.utc)\nprint(utc_time.astimezone(timezone(timedelta(hours=-4))))\nprint(utc_time.astimezone(timezone(timedelta(hours=2))))"),
  ],
  readMore: { label: "Python docs: the datetime module", url: "https://docs.python.org/3/library/datetime.html", source: "Python docs" },
  challenges: [
    task('easy', 'Make a date', {
      prompt: 'Create the date 16 October 2026 as `d`, then set `day_name` to its weekday name (like `"Monday"`) using `strftime`.',
      starter: py`from datetime import date

d = ___
day_name = ___`,
      hint: '`date(year, month, day)`, and `%A` in `strftime` is the full weekday name.',
      solution: py`from datetime import date

d = date(2026, 10, 16)
day_name = d.strftime("%A")`,
      tests: [
        ['d is the right date', py`d == __import__('datetime').date(2026, 10, 16)`],
        ['day_name', py`day_name == "Friday"`],
      ],
    }),
    task('easy', 'Format for display', {
      prompt: 'Format `dt` as `05/03/2026 14:30` (day/month/year, 24-hour time). Store it in `label`.',
      starter: py`from datetime import datetime

dt = datetime(2026, 3, 5, 14, 30)
label = dt.strftime(___)`,
      hint: 'Use `%d/%m/%Y %H:%M`.',
      solution: py`from datetime import datetime

dt = datetime(2026, 3, 5, 14, 30)
label = dt.strftime("%d/%m/%Y %H:%M")`,
      tests: [['label', py`label == "05/03/2026 14:30"`]],
    }),
    task('medium', 'Parse a date string', {
      prompt: 'Parse the text `"16 Oct 2026"` into a `datetime` called `parsed` with `strptime`.',
      starter: py`from datetime import datetime

parsed = datetime.strptime("16 Oct 2026", ___)`,
      hint: '`%d` is the day, `%b` the short month name and `%Y` the 4-digit year.',
      solution: py`from datetime import datetime

parsed = datetime.strptime("16 Oct 2026", "%d %b %Y")`,
      tests: [['parsed', py`parsed == __import__('datetime').datetime(2026, 10, 16)`]],
    }),
    task('medium', 'Add days', {
      prompt: 'An invoice dated `issued` is due 30 days later. Compute `due` with `timedelta`.',
      starter: py`from datetime import date, timedelta

issued = date(2026, 1, 15)
due = ___`,
      hint: '`issued + timedelta(days=30)`.',
      solution: py`from datetime import date, timedelta

issued = date(2026, 1, 15)
due = issued + timedelta(days=30)`,
      tests: [['due rolls into February', py`due == __import__('datetime').date(2026, 2, 14)`]],
    }),
    task('hard', 'Days until', {
      prompt: 'Write `days_until(today, target)` that returns how many days are left (an int). It is negative if `target` has passed.',
      starter: py`from datetime import date

def days_until(today, target):
    ___`,
      hint: 'Subtracting two dates gives a `timedelta`; use its `.days`.',
      solution: py`from datetime import date

def days_until(today, target):
    return (target - today).days`,
      setup: py`from datetime import date`,
      tests: [
        ['Across a month', py`days_until(date(2026, 10, 16), date(2026, 11, 1)) == 16`],
        ['Across a year', py`days_until(date(2026, 12, 25), date(2027, 1, 1)) == 7`],
        ['Past dates are negative', py`days_until(date(2026, 10, 16), date(2026, 10, 10)) == -6`],
      ],
    }),
    task('hard', 'ISO 8601 in and out', {
      prompt:
        'APIs send times like `"2026-10-16T09:30:00"`. Parse `stamp` into `when` with `fromisoformat`, add 90 minutes, and store the result back as an ISO string in `later`.',
      starter: py`from datetime import datetime, timedelta

stamp = "2026-10-16T09:30:00"
when = ___
later = ___`,
      hint: '`datetime.fromisoformat(stamp)`; then `(when + timedelta(minutes=90)).isoformat()`.',
      solution: py`from datetime import datetime, timedelta

stamp = "2026-10-16T09:30:00"
when = datetime.fromisoformat(stamp)
later = (when + timedelta(minutes=90)).isoformat()`,
      tests: [
        ['when is a datetime', py`when == __import__('datetime').datetime(2026, 10, 16, 9, 30)`],
        ['later is ISO text', py`later == "2026-10-16T11:00:00"`],
      ],
    }),
    task('expert', 'Age in years', {
      prompt: 'Write `age(birth, today)` that returns a person\'s age in whole years. Someone hasn\'t aged yet if their birthday is later this year.',
      starter: py`from datetime import date

def age(birth, today):
    ___`,
      hint: 'Start with `today.year - birth.year`, then subtract 1 if `(today.month, today.day) < (birth.month, birth.day)`.',
      solution: py`from datetime import date

def age(birth, today):
    years = today.year - birth.year
    if (today.month, today.day) < (birth.month, birth.day):
        years -= 1
    return years`,
      setup: py`from datetime import date`,
      tests: [
        ['Birthday already passed', py`age(date(2000, 3, 1), date(2026, 10, 16)) == 26`],
        ['Birthday tomorrow', py`age(date(2000, 10, 17), date(2026, 10, 16)) == 25`],
        ['Birthday today', py`age(date(2000, 10, 16), date(2026, 10, 16)) == 26`],
      ],
    }),
    task('expert', 'UTC to local time', {
      prompt:
        'Servers store times in UTC. Convert `utc_time` to New York summer time (UTC−4) and store it in `local`. Use a fixed offset with `timezone(timedelta(hours=-4))`.',
      starter: py`from datetime import datetime, timedelta, timezone

utc_time = datetime(2026, 10, 16, 13, 0, tzinfo=timezone.utc)
new_york = ___
local = ___`,
      hint: 'Aware datetimes convert with `.astimezone(new_york)`.',
      solution: py`from datetime import datetime, timedelta, timezone

utc_time = datetime(2026, 10, 16, 13, 0, tzinfo=timezone.utc)
new_york = timezone(timedelta(hours=-4))
local = utc_time.astimezone(new_york)`,
      tests: [
        ['Hour is shifted', py`local.hour == 9`],
        ['Offset is -4 hours', py`local.utcoffset() == __import__('datetime').timedelta(hours=-4)`],
        ['Same moment in time', py`local == utc_time`],
      ],
    }),
    task('expert', 'Count by week', {
      prompt:
        'Count how many `orders` fall in each ISO week. Store a dict in `per_week` that maps the week number to the count.',
      starter: py`from datetime import date

orders = ["2026-10-05", "2026-10-07", "2026-10-12", "2026-10-16", "2026-10-18", "2026-10-19"]
per_week = {}
___`,
      hint: 'Parse with `date.fromisoformat(s)`; `.isocalendar().week` gives the week number.',
      solution: py`from datetime import date

orders = ["2026-10-05", "2026-10-07", "2026-10-12", "2026-10-16", "2026-10-18", "2026-10-19"]
per_week = {}
for s in orders:
    week = date.fromisoformat(s).isocalendar().week
    per_week[week] = per_week.get(week, 0) + 1`,
      tests: [['Counts per ISO week', py`per_week == {41: 2, 42: 3, 43: 1}`]],
    }),
    task('expert', 'Business days', {
      prompt:
        'Write `business_days(start, end)` that counts Monday–Friday days from `start` up to but not including `end`.',
      starter: py`from datetime import date, timedelta

def business_days(start, end):
    ___`,
      hint: 'Step one day at a time with `timedelta(days=1)`; `d.weekday() < 5` is a weekday.',
      solution: py`from datetime import date, timedelta

def business_days(start, end):
    count = 0
    day = start
    while day < end:
        if day.weekday() < 5:
            count += 1
        day += timedelta(days=1)
    return count`,
      setup: py`from datetime import date`,
      tests: [
        ['One full week', py`business_days(date(2026, 10, 12), date(2026, 10, 19)) == 5`],
        ['Weekend only', py`business_days(date(2026, 10, 17), date(2026, 10, 19)) == 0`],
        ['Two weeks', py`business_days(date(2026, 10, 1), date(2026, 10, 15)) == 10`],
        ['Empty range', py`business_days(date(2026, 10, 16), date(2026, 10, 16)) == 0`],
      ],
    }),
  ],
  questions: [
    mc('What do you get from `date(2026, 1, 31) + timedelta(days=1)`?', ['2026-01-32', 'An error', '2026-02-01', '2026-01-01'], 2),
    qShort('Which method turns a datetime into text with a format like `%Y-%m-%d`? (name only)', 'strftime'),
    mc('Which method parses text into a datetime with a format string?', ['strptime', 'strftime', 'isoformat', 'parse'], 0),
    mc('Subtracting two `date` objects gives…', ['An int', 'A timedelta', 'A date', 'A float'], 1),
    mc('What is a "naive" datetime?', ['One in UTC', 'One before 1970', 'One with only a date', 'One with no time zone attached'], 3),
    mc('Why store times in UTC on servers?', ['UTC has no daylight-saving jumps and is the same everywhere', 'It uses less memory', 'Python requires it', 'It is more precise'], 0),
    mc('In `strftime`, which code gives the 4-digit year, like `2026`?', ['`%y`', '`%D`', '`%Y`', '`%j`'], 2),
    mc('What does `datetime(2026, 10, 16, 9, 30).isoformat()` return?', ['16/10/2026 09:30', '2026-10-16T09:30:00', 'Oct 16 2026', '1792145400'], 1),
    mc('`d.weekday()` returns 0 for…', ['Sunday', 'Saturday', 'Monday', 'January'], 2),
    mc('Comparing a naive datetime with an aware one…', ['Treats the naive one as UTC', 'Uses your computer\'s time zone', 'Ignores the time zone', 'Raises a TypeError'], 3),
  ],
})
