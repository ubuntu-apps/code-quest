// Data and APIs topic: Finding patterns with re. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "regex_basics",
  title: "Finding patterns with re",
  paragraphs: [
    "String methods find exact text: `\"cat\" in text`, `text.replace(\",\", \"\")`. Data often needs **patterns** instead: every number in a sentence, anything shaped like a date, a phone number written three different ways. A **regular expression** (regex) is a small language for describing patterns, and Python's `re` module runs them.",
    "```\nimport re\n\ntext = \"3 apples, 12 pears and 100 grapes\"\nprint(re.findall(r\"\\d+\", text))   # ['3', '12', '100']\n```",
    "`\\d` means \"a digit\" and `+` means \"one or more of the thing before\", so `\\d+` matches a run of digits. Patterns are written as raw strings, `r\"...\"`, so the backslashes reach `re` untouched. The building blocks you'll use most:",
    "```\n\\d   a digit             \\w   a letter, digit or _     \\s   a space, tab or line break\n.    any character       [aeiou]  one of these        [^0-9]  anything but these\n+    one or more         *    zero or more              ?    optional (zero or one)\n{4}  exactly 4           {2,3}  2 or 3                  ^ and $  start and end of the text\n```",
    "The main functions: `re.findall(pattern, text)` returns every match as a list; `re.search` finds the first match anywhere (or returns `None`); `re.fullmatch` checks that the **whole** text fits the pattern, which is what you want for checking input; `re.sub(pattern, replacement, text)` replaces every match; and `re.split` splits wherever the pattern matches.",
    "```\nimport re\n\nprint(bool(re.fullmatch(r\"\\d{3}-\\d{4}\", \"555-1234\")))   # True\nprint(bool(re.fullmatch(r\"\\d{3}-\\d{4}\", \"555-12345\")))  # False\nprint(re.sub(r\"\\s+\", \" \", \"too    many   spaces\"))      # too many spaces\nprint(re.split(r\"[,;]\\s*\", \"red, green;blue\"))         # ['red', 'green', 'blue']\n```",
    "Brackets in a pattern make a **group**, which captures that part of the match. `match.group(1)` is the first group, `match.groups()` all of them, and a named group, `(?P<year>\\d{4})`, can be read as `match[\"year\"]`. Groups turn a line of text into separate fields:",
    "```\nimport re\n\nline = \"2025-03-14 12:00:01 ERROR Disk full\"\nm = re.fullmatch(r\"(?P<date>\\S+) (?P<time>\\S+) (?P<level>[A-Z]+) (?P<message>.*)\", line)\nprint(m[\"level\"], \"|\", m[\"message\"])   # ERROR | Disk full\n```",
    "`re.IGNORECASE` as an extra argument ignores upper and lower case, and `re.compile(pattern)` prepares a pattern you'll use many times. Keep patterns as simple as the job allows: they get hard to read quickly, and when a string method can do the job, it's usually clearer. Some things, like a fully correct email address check, are famously hard to do with a regex; a rough check plus a confirmation email is the usual answer.",
  ],
  sandboxCode: "import re\n\ntext = \"Call 555-1234 or 555-9876 before 2025-03-14. #python #Regex\"\nprint(re.findall(r\"\\d{3}-\\d{4}\", text))\nprint(re.search(r\"\\d{4}-\\d{2}-\\d{2}\", text).group())\nprint(re.findall(r\"#(\\w+)\", text))\nprint(re.sub(r\"\\d\", \"#\", \"PIN 4821\"))",
  sandboxSnippets: [
    snippet("findall", "import re\nprint(re.findall(r\"[A-Z]\\w+\", \"Ana met Ben in Paris\"))"),
    snippet("search and groups", "import re\nm = re.search(r\"(\\d+) x (\\w+)\", \"Order: 3 x tea\")\nprint(m.group(0), m.group(1), m.group(2))"),
    snippet("fullmatch for input", "import re\nfor code in [\"AB12\", \"ab12\", \"AB123\"]:\n    print(code, bool(re.fullmatch(r\"[A-Z]{2}\\d{2}\", code)))"),
    snippet("Ignore case", "import re\nprint(re.findall(r\"python\", \"Python, PYTHON, python\", re.IGNORECASE))"),
  ],
  readMore: { label: "Python docs: Regular expression HOWTO", url: "https://docs.python.org/3/howto/regex.html", source: "Python docs" },
  challenges: [
    task("easy", "All the numbers", {
      prompt: "Set `numbers` to the whole numbers in `text`, as ints, in order.",
      starter: "import re\n\ntext = \"Rooms 12, 7 and 103 are free\"\n",
      hint: "`re.findall(r\"\\d+\", text)` gives the digits as strings; convert each with `int`.",
      solution: "import re\n\ntext = \"Rooms 12, 7 and 103 are free\"\nnumbers = [int(n) for n in re.findall(r\"\\d+\", text)]",
      tests: [
        ["numbers is right", "numbers == [12, 7, 103]"],
      ],
    }),
    task("easy", "Five digits", {
      prompt: "Define `is_zip(text)` that returns `True` only if `text` is exactly five digits.",
      starter: "import re\n",
      hint: "`re.fullmatch(r\"\\d{5}\", text)` returns a match or `None`; wrap it in `bool`.",
      solution: "import re\n\ndef is_zip(text):\n    return bool(re.fullmatch(r\"\\d{5}\", text))",
      tests: [
        ["Five digits", "is_zip(\"90210\") is True"],
        ["Wrong", "[is_zip(t) for t in [\"9021\", \"902100\", \"9021a\", \" 90210\"]] == [False] * 4"],
      ],
    }),
    task("easy", "Tidy the spaces", {
      prompt: "Define `tidy(text)` that turns every run of spaces, tabs or line breaks into a single space and strips the ends.",
      starter: "import re\n",
      hint: "`re.sub(r\"\\s+\", \" \", text).strip()`.",
      solution: "import re\n\ndef tidy(text):\n    return re.sub(r\"\\s+\", \" \", text).strip()",
      tests: [
        ["Messy", "tidy(\"  too   many\\t spaces\\n here \") == \"too many spaces here\""],
        ["Already tidy", "tidy(\"fine\") == \"fine\""],
      ],
    }),
    task("medium", "Find the dates", {
      prompt: "Set `dates` to every date written like `2025-03-14` in `text`.",
      starter: "import re\n\ntext = \"Joined 2024-11-02, renewed 2025-03-14, ID 12345-67-89\"\n",
      hint: "Four digits, a dash, two digits, a dash, two digits: `\\d{4}-\\d{2}-\\d{2}`. Make sure `12345-67-89` doesn't count: `\\b` marks a word boundary.",
      solution: "import re\n\ntext = \"Joined 2024-11-02, renewed 2025-03-14, ID 12345-67-89\"\ndates = re.findall(r\"\\b\\d{4}-\\d{2}-\\d{2}\\b\", text)",
      tests: [
        ["dates is right", "dates == [\"2024-11-02\", \"2025-03-14\"]"],
      ],
    }),
    task("medium", "Split on anything", {
      prompt: "Define `words(text)` that splits `text` on any mix of commas, semicolons and spaces, leaving out empty pieces.",
      starter: "import re\n",
      hint: "`re.split(r\"[,;\\s]+\", text)`, then keep the non-empty ones.",
      solution: "import re\n\ndef words(text):\n    return [w for w in re.split(r\"[,;\\s]+\", text) if w]",
      tests: [
        ["Mixed", "words(\"red, green;blue  white\") == [\"red\", \"green\", \"blue\", \"white\"]"],
        ["Edges", "words(\" ,a; \") == [\"a\"]"],
      ],
    }),
    task("medium", "Hashtags", {
      prompt: "Define `hashtags(text)` that returns the hashtags in `text` (the word after each `#`), lowercased, each once, in the order they first appear.",
      starter: "import re\n",
      hint: "`re.findall(r\"#(\\w+)\", text)` returns just the group. Keep a list and skip ones you've seen.",
      solution: "import re\n\ndef hashtags(text):\n    tags = []\n    for tag in re.findall(r\"#(\\w+)\", text):\n        tag = tag.lower()\n        if tag not in tags:\n            tags.append(tag)\n    return tags",
      tests: [
        ["Tags", "hashtags(\"Loving #Python and #regex! #python #data_science\") == [\"python\", \"regex\", \"data_science\"]"],
        ["None", "hashtags(\"no tags here\") == []"],
      ],
    }),
    task("hard", "Read a log line", {
      prompt: "Define `parse_line(line)` that turns `2025-03-14 12:00:01 ERROR Disk full` into a dict with keys `date`, `time`, `level` and `message`, or returns `None` if the line doesn't fit that shape (date, time, an uppercase level, then the message).",
      starter: "import re\n",
      hint: "Use named groups with `re.fullmatch`, then `m.groupdict()`.",
      solution: "import re\n\nLINE = re.compile(r\"(?P<date>\\d{4}-\\d{2}-\\d{2}) (?P<time>\\d{2}:\\d{2}:\\d{2}) (?P<level>[A-Z]+) (?P<message>.+)\")\n\ndef parse_line(line):\n    m = LINE.fullmatch(line)\n    if m is None:\n        return None\n    return m.groupdict()",
      tests: [
        ["A line", "parse_line(\"2025-03-14 12:00:01 ERROR Disk full\") == {\"date\": \"2025-03-14\", \"time\": \"12:00:01\", \"level\": \"ERROR\", \"message\": \"Disk full\"}"],
        ["Not a log line", "parse_line(\"hello there\") is None and parse_line(\"2025-03-14 12:00:01 error lower\") is None"],
      ],
    }),
    task("hard", "Hide card numbers", {
      prompt: "Define `mask(text)` that replaces every 16-digit number in `text` with twelve `*` and its last four digits, like `************1234`.",
      starter: "import re\n",
      hint: "Capture the last four digits: `r\"\\b\\d{12}(\\d{4})\\b\"`, and use `r\"************\\1\"` as the replacement (`\\1` is the group).",
      solution: "import re\n\ndef mask(text):\n    return re.sub(r\"\\b\\d{12}(\\d{4})\\b\", r\"************\\1\", text)",
      tests: [
        ["A card", "mask(\"Paid with 4111111111111234 today\") == \"Paid with ************1234 today\""],
        ["Short numbers stay", "mask(\"Order 12345, card 5500000000000004.\") == \"Order 12345, card ************0004.\""],
      ],
    }),
    task("expert", "Phone numbers", {
      prompt: "Define `normalise(phone)` that accepts `555-123-4567`, `(555) 123-4567`, `555.123.4567` or `555 123 4567` and returns `555-123-4567`, or `None` for anything else.",
      starter: "import re\n",
      hint: "One `re.fullmatch` with three groups: `\\(?(\\d{3})\\)?[ .-]?(\\d{3})[ .-](\\d{4})`. Then join the groups with dashes.",
      solution: "import re\n\nPHONE = re.compile(r\"\\(?(\\d{3})\\)?[ .-]?(\\d{3})[ .-](\\d{4})\")\n\ndef normalise(phone):\n    m = PHONE.fullmatch(phone.strip())\n    if m is None:\n        return None\n    return \"-\".join(m.groups())",
      tests: [
        ["Four styles", "[normalise(p) for p in [\"555-123-4567\", \"(555) 123-4567\", \"555.123.4567\", \"555 123 4567\"]] == [\"555-123-4567\"] * 4"],
        ["Not phones", "[normalise(p) for p in [\"555-1234\", \"phone\", \"5551234567x\"]] == [None, None, None]"],
      ],
    }),
    task("expert", "Prices by currency", {
      prompt: "Define `totals(text)` that finds prices written with `€`, `$` or `£` before the amount (like `€12.50` or `$3`) and returns a dict from symbol to total, rounded to 2 places.",
      starter: "import re\n",
      hint: "Two groups: `([€$£])(\\d+(?:\\.\\d{2})?)`. `(?:...)` groups without capturing. `findall` then gives `(symbol, amount)` pairs.",
      solution: "import re\n\ndef totals(text):\n    result = {}\n    for symbol, amount in re.findall(r\"([€$£])(\\d+(?:\\.\\d{2})?)\", text):\n        result[symbol] = round(result.get(symbol, 0) + float(amount), 2)\n    return result",
      tests: [
        ["Mixed", "totals(\"Tea €2.50, cake €4, book $12.99, map £3.20 and €1.25\") == {\"€\": 7.75, \"$\": 12.99, \"£\": 3.2}"],
        ["None", "totals(\"free!\") == {}"],
      ],
    }),
  ],
  questions: [
    mc("What does `\\d+` match?", ["One letter", "A run of one or more digits", "The letter d", "Any character"], 1),
    mc("Why write patterns as raw strings, `r\"...\"`?", ["They are faster", "They ignore case", "So backslashes reach `re` untouched", "Python requires it"], 2),
    mc("Which function checks that the whole text fits a pattern?", ["`re.fullmatch`", "`re.search`", "`re.findall`", "`re.sub`"], 0),
    mc("What does `re.search` return when nothing matches?", ["An empty string", "`False`", "An error", "`None`"], 3),
    mc("What does `re.findall(r\"#(\\w+)\", \"#a #b\")` return?", ["`[\"#a\", \"#b\"]`", "`[\"a\", \"b\"]`", "`2`", "`[\"#\"]`"], 1),
    mc("What do brackets `(...)` do in a pattern?", ["Make a group that captures that part", "Make it optional", "Repeat it", "Nothing"], 0),
    qShort("Which `re` function replaces every match? (name only)", "sub"),
    mc("What does `?` after something mean?", ["Repeat forever", "Exactly one", "The end of the text", "Optional: zero or one"], 3),
    mc("Which flag ignores upper and lower case?", ["`re.CASE`", "`re.ANY`", "`re.IGNORECASE`", "`re.LOWER`"], 2),
    mc("When is a string method better than a regex?", ["When it can do the job: it is usually clearer", "Never", "Always", "Only for numbers"], 0),
  ],
})
