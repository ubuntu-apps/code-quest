// Data and APIs topic: Timestamps and time zones. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "datetime_data",
  title: "Timestamps and time zones",
  paragraphs: [
    "The Modules section covered dates, times and the gaps between them. Data from APIs, logs and databases adds two complications: times often arrive as **timestamps** (a count of seconds), and they come from all over the world, so a time only means something together with its **time zone**.",
    "A plain `datetime(2025, 3, 14, 9, 0)` is **naive**: 9:00, but nobody knows where. An **aware** datetime carries its zone in `tzinfo`. `timezone.utc` is Coordinated Universal Time, the zone servers use, and `timezone(timedelta(hours=2))` is a fixed offset two hours ahead of it. `astimezone` shows the same moment in another zone:",
    "```\nfrom datetime import datetime, timedelta, timezone\n\nmeeting = datetime(2025, 3, 14, 12, 0, tzinfo=timezone.utc)\nprint(meeting.isoformat())          # 2025-03-14T12:00:00+00:00\n\nplus_two = timezone(timedelta(hours=2))\nlocal = meeting.astimezone(plus_two)\nprint(local.isoformat())            # 2025-03-14T14:00:00+02:00\nprint(local == meeting)             # True: the same moment\n```",
    "APIs usually send times as ISO 8601 text with the offset on the end: `+02:00`, or a `Z` for UTC (\"Zulu time\"). `datetime.fromisoformat` reads the offsets. Python 3.11 and later also read the `Z`; for older versions, replace it with `+00:00` first, which works everywhere.",
    "```\nfrom datetime import datetime\n\ntext = \"2025-03-14T12:00:00Z\"\nwhen = datetime.fromisoformat(text.replace(\"Z\", \"+00:00\"))\nprint(when.tzinfo, when.hour)   # UTC 12\n```",
    "A **Unix timestamp** counts the seconds since midnight UTC on 1 January 1970: `1700000000` is a moment in November 2023. `datetime.fromtimestamp(ts, tz=timezone.utc)` turns one into a datetime, and `.timestamp()` goes back. Always pass `tz=timezone.utc`; without it, Python uses the clock of whatever computer the code runs on, so the same program gives different answers in different places.",
    "```\nfrom datetime import datetime, timezone\n\nwhen = datetime.fromtimestamp(1700000000, tz=timezone.utc)\nprint(when)                  # 2023-11-14 22:13:20+00:00\nprint(int(when.timestamp())) # 1700000000\n```",
    "Aware datetimes compare and subtract correctly across zones: 14:00 at `+02:00` equals 12:00 UTC. Mixing a naive and an aware datetime raises `TypeError`, because Python can't guess the missing zone. The safe habit is to make every datetime aware as soon as it enters your program, do all the work in UTC, and convert to a local zone only to show it to a person.",
    "Real places also change their offset for summer time. The `zoneinfo` module knows those rules, `ZoneInfo(\"Europe/London\")`, when the computer has time zone data installed. Fixed offsets, used in this lesson, are enough for reading and comparing timestamps from APIs.",
  ],
  sandboxCode: "from datetime import datetime, timedelta, timezone\n\nnow = datetime.now(timezone.utc)\nprint(\"UTC now:\", now.isoformat(timespec=\"seconds\"))\nfor hours in (-5, 1, 9):\n    zone = timezone(timedelta(hours=hours))\n    print(f\"UTC{hours:+d}:\", now.astimezone(zone).strftime(\"%H:%M\"))\nprint(\"Unix time:\", int(now.timestamp()))",
  sandboxSnippets: [
    snippet("Naive or aware", "from datetime import datetime, timezone\nprint(datetime(2025, 1, 1).tzinfo)\nprint(datetime(2025, 1, 1, tzinfo=timezone.utc).tzinfo)"),
    snippet("Same moment, two zones", "from datetime import datetime, timedelta, timezone\na = datetime(2025, 3, 14, 12, 0, tzinfo=timezone.utc)\nb = datetime(2025, 3, 14, 14, 0, tzinfo=timezone(timedelta(hours=2)))\nprint(a == b, b - a)"),
    snippet("Timestamps", "from datetime import datetime, timezone\nprint(datetime.fromtimestamp(0, tz=timezone.utc))\nprint(datetime(2025, 1, 1, tzinfo=timezone.utc).timestamp())"),
    snippet("Mixing fails", "from datetime import datetime, timezone\ntry:\n    datetime(2025, 1, 1) < datetime(2025, 1, 1, tzinfo=timezone.utc)\nexcept TypeError as e:\n    print(\"TypeError:\", e)"),
  ],
  readMore: { label: "Python docs: Aware and naive objects", url: "https://docs.python.org/3/library/datetime.html#aware-and-naive-objects", source: "Python docs" },
  challenges: [
    task("easy", "A moment in UTC", {
      prompt: "Set `launch` to 14 March 2025 at 12:30 UTC (an aware datetime), and `text` to its ISO form.",
      starter: "from datetime import datetime, timedelta, timezone\n\n",
      hint: "`datetime(2025, 3, 14, 12, 30, tzinfo=timezone.utc)`, then `.isoformat()`.",
      solution: "from datetime import datetime, timedelta, timezone\n\nlaunch = datetime(2025, 3, 14, 12, 30, tzinfo=timezone.utc)\ntext = launch.isoformat()",
      tests: [
        ["launch is aware", "launch.tzinfo is not None and launch.utcoffset().total_seconds() == 0"],
        ["text", "text == \"2025-03-14T12:30:00+00:00\""],
      ],
    }),
    task("easy", "From a timestamp", {
      prompt: "Set `when` to the UTC datetime for the Unix timestamp `ts`.",
      starter: "from datetime import datetime, timedelta, timezone\n\nts = 1700000000\n",
      hint: "`datetime.fromtimestamp(ts, tz=timezone.utc)`.",
      solution: "from datetime import datetime, timedelta, timezone\n\nts = 1700000000\nwhen = datetime.fromtimestamp(ts, tz=timezone.utc)",
      tests: [
        ["when is right", "when == __import__(\"datetime\").datetime(2023, 11, 14, 22, 13, 20, tzinfo=__import__(\"datetime\").timezone.utc)"],
        ["In UTC", "when.utcoffset().total_seconds() == 0"],
      ],
    }),
    task("easy", "Back to a timestamp", {
      prompt: "Set `ts` to the Unix timestamp (a whole number) of midnight UTC on 1 January 2025.",
      starter: "from datetime import datetime, timedelta, timezone\n\n",
      hint: "Make the aware datetime, then `int(...timestamp())`.",
      solution: "from datetime import datetime, timedelta, timezone\n\nts = int(datetime(2025, 1, 1, tzinfo=timezone.utc).timestamp())",
      tests: [
        ["ts is right", "ts == 1735689600"],
      ],
    }),
    task("medium", "Read an API time", {
      prompt: "Define `parse_time(text)` that reads ISO text like `2025-03-14T12:00:00Z` or `2025-03-14T14:00:00+02:00` into an aware datetime. It must work for the `Z` form on any Python version.",
      starter: "from datetime import datetime, timedelta, timezone\n\n",
      hint: "If the text ends with `\"Z\"`, replace that with `\"+00:00\"`, then `datetime.fromisoformat`.",
      solution: "from datetime import datetime, timedelta, timezone\n\ndef parse_time(text):\n    if text.endswith(\"Z\"):\n        text = text[:-1] + \"+00:00\"\n    return datetime.fromisoformat(text)\n",
      tests: [
        ["With Z", "parse_time(\"2025-03-14T12:00:00Z\") == __import__(\"datetime\").datetime(2025, 3, 14, 12, 0, tzinfo=__import__(\"datetime\").timezone.utc)"],
        ["With an offset", "parse_time(\"2025-03-14T14:00:00+02:00\").utcoffset().total_seconds() == 7200"],
        ["The same moment", "parse_time(\"2025-03-14T14:00:00+02:00\") == parse_time(\"2025-03-14T12:00:00Z\")"],
      ],
    }),
    task("medium", "Another zone", {
      prompt: "Show `meeting` (12:00 UTC) in the zone two hours ahead of UTC: set `local` to the converted datetime and `shown` to its time as `HH:MM`.",
      starter: "from datetime import datetime, timedelta, timezone\n\nmeeting = datetime(2025, 3, 14, 12, 0, tzinfo=timezone.utc)\n",
      hint: "`meeting.astimezone(timezone(timedelta(hours=2)))`, then `.strftime(\"%H:%M\")`.",
      solution: "from datetime import datetime, timedelta, timezone\n\nmeeting = datetime(2025, 3, 14, 12, 0, tzinfo=timezone.utc)\nlocal = meeting.astimezone(timezone(timedelta(hours=2)))\nshown = local.strftime(\"%H:%M\")",
      tests: [
        ["shown is 14:00", "shown == \"14:00\""],
        ["The same moment", "local == meeting and local.utcoffset().total_seconds() == 7200"],
      ],
    }),
    task("medium", "Naive or aware?", {
      prompt: "Define `is_aware(dt)` that returns `True` if the datetime knows its time zone.",
      starter: "from datetime import datetime, timedelta, timezone\n\n",
      hint: "Aware means `dt.tzinfo is not None and dt.utcoffset() is not None`.",
      solution: "from datetime import datetime, timedelta, timezone\n\ndef is_aware(dt):\n    return dt.tzinfo is not None and dt.utcoffset() is not None",
      tests: [
        ["Naive", "is_aware(__import__(\"datetime\").datetime(2025, 1, 1)) is False"],
        ["Aware", "is_aware(__import__(\"datetime\").datetime(2025, 1, 1, tzinfo=__import__(\"datetime\").timezone.utc)) is True"],
      ],
    }),
    task("hard", "Which came first?", {
      prompt: "Define `in_order(texts)` that returns the ISO time strings sorted by the moment they describe (not alphabetically), keeping each string as it was. Use your `parse_time`.",
      starter: "from datetime import datetime, timedelta, timezone\n\ndef parse_time(text):\n    if text.endswith(\"Z\"):\n        text = text[:-1] + \"+00:00\"\n    return datetime.fromisoformat(text)\n",
      hint: "`sorted(texts, key=parse_time)`.",
      solution: "from datetime import datetime, timedelta, timezone\n\ndef parse_time(text):\n    if text.endswith(\"Z\"):\n        text = text[:-1] + \"+00:00\"\n    return datetime.fromisoformat(text)\n\ndef in_order(texts):\n    return sorted(texts, key=parse_time)",
      tests: [
        ["Across zones", "in_order([\"2025-03-14T13:00:00+02:00\", \"2025-03-14T10:30:00Z\", \"2025-03-14T06:00:00-05:00\"]) == [\"2025-03-14T10:30:00Z\", \"2025-03-14T13:00:00+02:00\", \"2025-03-14T06:00:00-05:00\"]"],
      ],
    }),
    task("hard", "Minutes between", {
      prompt: "Define `minutes_between(start, end)` for two ISO time strings (any offsets) that returns the whole minutes from `start` to `end`.",
      starter: "from datetime import datetime, timedelta, timezone\n\ndef parse_time(text):\n    if text.endswith(\"Z\"):\n        text = text[:-1] + \"+00:00\"\n    return datetime.fromisoformat(text)\n",
      hint: "Subtract the parsed datetimes and divide `.total_seconds()` by 60.",
      solution: "from datetime import datetime, timedelta, timezone\n\ndef parse_time(text):\n    if text.endswith(\"Z\"):\n        text = text[:-1] + \"+00:00\"\n    return datetime.fromisoformat(text)\n\ndef minutes_between(start, end):\n    return int((parse_time(end) - parse_time(start)).total_seconds() // 60)",
      tests: [
        ["Different zones", "minutes_between(\"2025-03-14T09:00:00Z\", \"2025-03-14T11:30:00+02:00\") == 30"],
        ["Same zone", "minutes_between(\"2025-03-14T09:00:00+01:00\", \"2025-03-14T17:45:00+01:00\") == 525"],
      ],
    }),
    task("expert", "Events per day", {
      prompt: "Define `per_day(texts)` that counts ISO timestamps by their **UTC** date, returning a dict like `{\"2025-03-14\": 2}` with the dates in order.",
      starter: "from datetime import datetime, timedelta, timezone\n\ndef parse_time(text):\n    if text.endswith(\"Z\"):\n        text = text[:-1] + \"+00:00\"\n    return datetime.fromisoformat(text)\n",
      hint: "Convert each with `.astimezone(timezone.utc).date().isoformat()`, count, then build the dict from the sorted keys.",
      solution: "from datetime import datetime, timedelta, timezone\n\ndef parse_time(text):\n    if text.endswith(\"Z\"):\n        text = text[:-1] + \"+00:00\"\n    return datetime.fromisoformat(text)\n\ndef per_day(texts):\n    counts = {}\n    for text in texts:\n        day = parse_time(text).astimezone(timezone.utc).date().isoformat()\n        counts[day] = counts.get(day, 0) + 1\n    return dict(sorted(counts.items()))",
      tests: [
        ["Late evening elsewhere is tomorrow in UTC", "per_day([\"2025-03-14T23:30:00-02:00\", \"2025-03-14T10:00:00Z\", \"2025-03-15T00:30:00+02:00\"]) == {\"2025-03-14\": 2, \"2025-03-15\": 1}"],
        ["Sorted", "list(per_day([\"2025-03-16T10:00:00Z\", \"2025-03-15T10:00:00Z\"])) == [\"2025-03-15\", \"2025-03-16\"]"],
      ],
    }),
    task("expert", "Show it locally", {
      prompt: "Define `show_local(text, hours)` that shows an ISO time in the zone `hours` from UTC as `14/03/2025 14:00 (UTC+2)` (or `UTC-5`, or `UTC+0`).",
      starter: "from datetime import datetime, timedelta, timezone\n\ndef parse_time(text):\n    if text.endswith(\"Z\"):\n        text = text[:-1] + \"+00:00\"\n    return datetime.fromisoformat(text)\n",
      hint: "Convert with `astimezone(timezone(timedelta(hours=hours)))`, format with `strftime(\"%d/%m/%Y %H:%M\")`, and write the offset with `f\"{hours:+d}\"`.",
      solution: "from datetime import datetime, timedelta, timezone\n\ndef parse_time(text):\n    if text.endswith(\"Z\"):\n        text = text[:-1] + \"+00:00\"\n    return datetime.fromisoformat(text)\n\ndef show_local(text, hours):\n    local = parse_time(text).astimezone(timezone(timedelta(hours=hours)))\n    return local.strftime(\"%d/%m/%Y %H:%M\") + f\" (UTC{hours:+d})\"",
      tests: [
        ["Ahead", "show_local(\"2025-03-14T12:00:00Z\", 2) == \"14/03/2025 14:00 (UTC+2)\""],
        ["Behind, the day before", "show_local(\"2025-03-14T03:00:00Z\", -5) == \"13/03/2025 22:00 (UTC-5)\""],
        ["UTC itself", "show_local(\"2025-03-14T14:00:00+02:00\", 0) == \"14/03/2025 12:00 (UTC+0)\""],
      ],
    }),
  ],
  questions: [
    mc("What is a naive datetime?", ["One with a typo", "One with no time zone attached", "One in UTC", "One before 1970"], 1),
    mc("What does `Z` at the end of an ISO time mean?", ["Zero seconds", "The zone is unknown", "UTC", "Midnight"], 2),
    mc("What is a Unix timestamp?", ["Seconds since midnight UTC on 1 January 1970", "The current date as text", "Milliseconds since the computer started", "A date in ISO form"], 0),
    mc("Why pass `tz=timezone.utc` to `fromtimestamp`?", ["It is faster", "Timestamps are always negative", "Python requires it", "Without it, the answer depends on the computer's own clock"], 3),
    mc("Is 14:00 at `+02:00` equal to 12:00 UTC?", ["No", "Yes, they are the same moment", "Only in summer", "Comparing them raises an error"], 1),
    mc("What happens when you compare a naive and an aware datetime?", ["`TypeError`", "The naive one is treated as UTC", "`False`", "It works"], 0),
    qShort("Which datetime method shows the same moment in another time zone? (name only)", "astimezone"),
    mc("What is the safe habit for times in a program?", ["Use naive datetimes everywhere", "Store local times", "Use strings", "Make them aware, work in UTC, convert only to show them"], 3),
    mc("Which module knows the summer-time rules of real places?", ["`time`", "`calendar`", "`zoneinfo`", "`locale`"], 2),
    mc("How can older Pythons read `2025-03-14T12:00:00Z`?", ["Replace the `Z` with `+00:00` first", "Remove the `T`", "Use `int()`", "They can't"], 0),
  ],
})
