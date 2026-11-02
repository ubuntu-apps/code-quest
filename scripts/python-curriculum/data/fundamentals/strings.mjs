// Fundamentals topic: Strings. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "strings",
  title: "Strings",
  paragraphs: [
    "A **string** (`str`) is a piece of text: a sequence of characters in quotes. You've printed plenty of them; now let's work with them. `+` joins strings and `*` repeats them: `\"Py\" + \"thon\"` is `\"Python\"` and `\"ha\" * 3` is `\"hahaha\"`.",
    "`len(text)` counts the characters, spaces included: `len(\"hi there\")` is `8`. The empty string `\"\"` has length 0.",
    "Each character has a position, its **index**, and counting starts at **0**: `word[0]` is the first character and `word[1]` the second. Negative indexes count from the end, so `word[-1]` is the last character. An index past the end raises an `IndexError`.",
    "```\nword = \"Python\"\nprint(word[0], word[1], word[-1])   # P y n\nprint(len(word))                    # 6\n```",
    "A **slice** takes a part of a string: `word[start:end]` runs from `start` up to, but not including, `end`. Leave out a side to go to the edge: `word[:3]` is the first three characters (`\"Pyt\"`), `word[3:]` is everything from index 3 (`\"hon\"`), and `word[-3:]` is the last three.",
    "```\nword = \"Python\"\nprint(word[0:2], word[:3], word[3:], word[-3:])   # Py Pyt hon hon\n```",
    "`in` checks whether one string appears inside another: `\"cat\" in \"concatenate\"` is `True`. Like everything about strings, it's case-sensitive: `\"A\" == \"a\"` is `False`.",
    "Strings are **immutable**: you can't change a character in place, so `word[0] = \"J\"` raises a `TypeError`. Instead, build a new string, such as `\"J\" + word[1:]`, and assign it to a name.",
    "To join a string and a number with `+`, turn the number into text first with `str()`: `\"Age: \" + str(30)`. The next two stages show neater ways: string methods and f-strings.",
  ],
  sandboxCode: "word = \"Python\"\nprint(word[0], word[-1], len(word))\nprint(word[:3], word[3:])\nprint(\"Py\" + \"thon\", \"ha\" * 3)\nprint(\"th\" in word, \"Th\" in word)",
  sandboxSnippets: [
    snippet("Join and repeat", "first = \"Ada\"\nlast = \"Lovelace\"\nprint(first + \" \" + last)\nprint(\"-\" * 20)"),
    snippet("Length", "print(len(\"hi there\"))\nprint(len(\"\"))"),
    snippet("Indexes", "word = \"planet\"\nprint(word[0], word[1], word[-1], word[-2])"),
    snippet("Slices", "stamp = \"2026-10-16\"\nprint(stamp[:4], stamp[5:7], stamp[8:])"),
    snippet("in", "email = \"ana@example.com\"\nprint(\"@\" in email)\nprint(\"gmail\" in email)"),
  ],
  readMore: { label: "Python tutorial: text", url: "https://docs.python.org/3/tutorial/introduction.html#text", source: "Python docs" },
  challenges: [
    task("easy", "Full name", {
      prompt: "Set `full` to the first and last name joined with a space between them, then print it.",
      starter: "first = \"Ada\"\nlast = \"Lovelace\"\n",
      hint: "Join three strings: `first + \" \" + last`.",
      solution: "first = \"Ada\"\nlast = \"Lovelace\"\nfull = first + \" \" + last\nprint(full)",
      tests: [
        ["full is Ada Lovelace", "full == \"Ada Lovelace\""],
        ["Prints it", "_cq_stdout.strip() == \"Ada Lovelace\""],
      ],
    }),
    task("easy", "Underline a title", {
      prompt: "Print `title`, and below it a line of `=` signs exactly as long as the title.",
      starter: "title = \"Menu\"\nprint(title)\n",
      hint: "Repeat `\"=\"` as many times as the title has characters: `\"=\" * len(title)`.",
      solution: "title = \"Menu\"\nprint(title)\nprint(\"=\" * len(title))",
      tests: [
        ["Prints Menu and ====", "_cq_stdout.strip().splitlines() == [\"Menu\", \"====\"]"],
      ],
    }),
    task("easy", "First and last letter", {
      prompt: "Set `first` to the first character of `word` and `last` to its last character.",
      starter: "word = \"planet\"\n",
      hint: "Indexes start at 0, and -1 is the last character: `word[0]` and `word[-1]`.",
      solution: "word = \"planet\"\nfirst = word[0]\nlast = word[-1]",
      tests: [
        ["first is p", "first == \"p\""],
        ["last is t", "last == \"t\""],
      ],
    }),
    task("medium", "Initials", {
      prompt: "Set `initials` to the first letter of `first` followed by the first letter of `last`.",
      starter: "first = \"Grace\"\nlast = \"Hopper\"\n",
      hint: "Join two characters: `first[0] + last[0]`.",
      solution: "first = \"Grace\"\nlast = \"Hopper\"\ninitials = first[0] + last[0]",
      tests: [
        ["initials is GH", "initials == \"GH\""],
      ],
    }),
    task("medium", "Slice a date", {
      prompt: "Use slices to set `year`, `month` and `day` from `stamp`, as strings.",
      starter: "stamp = \"2026-10-16\"\n",
      hint: "Count the positions: the year is characters 0 to 3 (`stamp[:4]`), the month 5 and 6 (`stamp[5:7]`), and the day from 8 to the end.",
      solution: "stamp = \"2026-10-16\"\nyear = stamp[:4]\nmonth = stamp[5:7]\nday = stamp[8:]",
      tests: [
        ["year is 2026", "year == \"2026\""],
        ["month is 10", "month == \"10\""],
        ["day is 16", "day == \"16\""],
      ],
    }),
    task("medium", "Is it in there?", {
      prompt: "Set `has_at` to whether `email` contains `@`, and `is_gmail` to whether it contains `gmail`.",
      starter: "email = \"ana@example.com\"\n",
      hint: "`\"@\" in email` is already `True` or `False`; store it.",
      solution: "email = \"ana@example.com\"\nhas_at = \"@\" in email\nis_gmail = \"gmail\" in email",
      tests: [
        ["has_at is True", "has_at is True"],
        ["is_gmail is False", "is_gmail is False"],
      ],
    }),
    task("hard", "Fix the label", {
      prompt: "This fails with a `TypeError`. Fix it so `label` is `\"Items: 3\"`.",
      starter: "count = 3\nlabel = \"Items: \" + count\n",
      hint: "Turn the number into text before joining: `str(count)`.",
      solution: "count = 3\nlabel = \"Items: \" + str(count)",
      tests: [
        ["label is Items: 3", "label == \"Items: 3\""],
      ],
    }),
    task("hard", "Change the first letter", {
      prompt: "Strings can't be changed in place. Build `new_word` from `word` so it reads `tango`: a `t` followed by everything except the first letter of `word`.",
      starter: "word = \"mango\"\n",
      hint: "`word[1:]` is everything from index 1: `\"ango\"`. Put `\"t\"` in front.",
      solution: "word = \"mango\"\nnew_word = \"t\" + word[1:]",
      tests: [
        ["new_word is tango", "new_word == \"tango\""],
        ["word is still mango", "word == \"mango\""],
      ],
    }),
    task("expert", "Hide a card number", {
      prompt: "Set `masked` to `card` with every digit except the last four replaced by `*`. It should work for a card of any length, so use `len`.",
      starter: "card = \"4111222233334444\"\n",
      hint: "The stars: `\"*\" * (len(card) - 4)`. The last four digits: `card[-4:]`. Join them.",
      solution: "card = \"4111222233334444\"\nmasked = \"*\" * (len(card) - 4) + card[-4:]",
      tests: [
        ["masked is ************4444", "masked == \"************4444\""],
      ],
    }),
    task("expert", "The middle character", {
      prompt: "Set `middle` to the character in the middle of `word`. The word has an odd length; find the middle index from `len(word)`.",
      starter: "word = \"racecar\"\n",
      hint: "`len(word) // 2` is the middle index (3 for a 7-letter word). Use it as an index.",
      solution: "word = \"racecar\"\nmiddle = word[len(word) // 2]",
      tests: [
        ["middle is e", "middle == \"e\""],
      ],
    }),
  ],
  questions: [
    mc("What is `\"ha\" * 3`?", ["`ha3`","`hahaha`","`ha ha ha`","An error"], 1, "Multiplying a string by a number repeats it that many times."),
    mc("What is `len(\"hi there\")`?", ["`7`","`2`","`8`","`9`"], 2, "`len` counts every character, including the space: 2 + 1 + 5 is 8."),
    mc("For `word = \"Python\"`, what is `word[0]`?", ["`P`","`y`","`n`","`Python`"], 0, "Indexes start at 0, so `[0]` is the first character."),
    mc("For `word = \"Python\"`, what is `word[-1]`?", ["`P`","`n`","`o`","An error"], 1, "Negative indexes count from the end, so `[-1]` is the last character."),
    mc("What is `\"Python\"[1:4]`?", ["`Pyt`","`ytho`","`tho`","`yth`"], 3, "A slice `[1:4]` takes from index 1 up to, but not including, index 4."),
    qShort("Which function counts the characters in a string? (name only)", "len", "`len()` returns the number of characters in a string (and items in a list)."),
    mc("What does `\"cat\" in \"concatenate\"` give?", ["`True`","`False`","`3`","An error"], 0, "`in` checks whether one string appears anywhere inside another, and \"concatenate\" contains \"cat\"."),
    mc("Why does `word[0] = \"J\"` fail?", ["Index `0` does not exist","`J` must be lowercase","Strings are immutable: they can't be changed in place","You need double quotes"], 2, "Strings are immutable, so you build a new string instead, such as `\"J\" + word[1:]`."),
    mc("What does `\"Age: \" + str(30)` give?", ["A `TypeError`","`Age: 30`","`Age: str(30)`","`Age:30`"], 1, "`str(30)` turns the number into text, so `+` can join the two strings."),
  ],
})
