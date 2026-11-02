// Fundamentals topic: String methods. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "string_methods",
  title: "String methods",
  paragraphs: [
    "Strings come with **methods**: functions you call on a string with a dot, like `text.upper()`. A method never changes the original string (strings are immutable). It returns a new one, so store the result: `name = name.strip()`.",
    "**Changing case.** `upper()` and `lower()` turn every letter into a capital or a small letter, and `title()` capitalises the first letter of each word. `lower()` is handy for comparing text without caring about case: `answer.lower() == \"yes\"` is true for `Yes`, `YES` and `yes`.",
    "**Cleaning up.** `strip()` removes spaces (and new lines) from both ends, while `lstrip()` and `rstrip()` only do the left or the right end. `replace(old, new)` swaps every `old` for `new`: `\"2026/10/16\".replace(\"/\", \"-\")` is `\"2026-10-16\"`.",
    "Methods can be **chained**: each one works on the result of the one before. `name.strip().title()` first strips the spaces, then title-cases what's left.",
    "```\nname = \"  ada LOVELACE \"\nprint(name.strip().title())   # Ada Lovelace\n```",
    "**Searching.** `count(sub)` counts how often `sub` appears. `find(sub)` gives the index where it first appears, or `-1` if it isn't there. `startswith(prefix)` and `endswith(suffix)` return `True` or `False`: `\"photo.jpg\".endswith(\".jpg\")` is `True`.",
    "**Checking content.** `isdigit()` is `True` when every character is a digit, as in `\"2026\".isdigit()`, and `isalpha()` when every character is a letter. They're useful before turning input into a number.",
    "**Splitting and joining.** `split()` breaks a string into a list of words at the spaces, and `split(\",\")` breaks it at the commas. `\", \".join(words)` glues a list of strings back together, with `\", \"` between the pieces. (Lists get their own quest later; for now, think of them as the pieces in square brackets.)",
    "```\nwords = \"red green blue\".split()\nprint(words)              # ['red', 'green', 'blue']\nprint(\" + \".join(words))  # red + green + blue\n```",
  ],
  sandboxCode: "text = \"  Hello, CodeQuest!  \"\nprint(text.strip())\nprint(text.strip().upper())\nprint(text.count(\"o\"), text.find(\"Code\"))\nprint(\"a,b,c\".split(\",\"))",
  sandboxSnippets: [
    snippet("Case", "print(\"hello\".upper())\nprint(\"HELLO\".lower())\nprint(\"the hobbit\".title())"),
    snippet("strip and replace", "raw = \"   banana  \"\nprint(repr(raw.strip()))\nprint(\"16.10.2026\".replace(\".\", \"/\"))"),
    snippet("Search", "text = \"She sells sea shells\"\nprint(text.count(\"s\"), text.find(\"sea\"), text.find(\"zoo\"))\nprint(\"photo.jpg\".endswith(\".jpg\"))"),
    snippet("Check content", "print(\"2026\".isdigit(), \"20a6\".isdigit())\nprint(\"Ana\".isalpha(), \"Ana B\".isalpha())"),
    snippet("split and join", "parts = \"2026-10-16\".split(\"-\")\nprint(parts)\nprint(\"/\".join(parts))"),
  ],
  readMore: { label: "Python docs: string methods", url: "https://docs.python.org/3/library/stdtypes.html#string-methods", source: "Python docs" },
  challenges: [
    task("easy", "Shout it", {
      prompt: "Set `loud` to `message` in capital letters.",
      starter: "message = \"watch out\"\n",
      hint: "`message.upper()` returns a new string in capitals.",
      solution: "message = \"watch out\"\nloud = message.upper()",
      tests: [
        ["loud is WATCH OUT", "loud == \"WATCH OUT\""],
      ],
    }),
    task("easy", "Clean it up", {
      prompt: "Set `clean` to `raw` without the spaces around it.",
      starter: "raw = \"   banana  \"\n",
      hint: "`strip()` removes spaces from both ends.",
      solution: "raw = \"   banana  \"\nclean = raw.strip()",
      tests: [
        ["clean is banana", "clean == \"banana\""],
      ],
    }),
    task("easy", "Title case", {
      prompt: "Set `nice` to the book title with every word capitalised.",
      starter: "book = \"the hobbit\"\n",
      hint: "`title()` capitalises the first letter of every word.",
      solution: "book = \"the hobbit\"\nnice = book.title()",
      tests: [
        ["nice is The Hobbit", "nice == \"The Hobbit\""],
      ],
    }),
    task("medium", "Any case will do", {
      prompt: "Set `is_yes` to whether `answer` means \"yes\", whatever its capital letters.",
      starter: "answer = \"YeS\"\n",
      hint: "Make it lowercase first, then compare: `answer.lower() == \"yes\"`.",
      solution: "answer = \"YeS\"\nis_yes = answer.lower() == \"yes\"",
      tests: [
        ["is_yes is True", "is_yes is True"],
      ],
    }),
    task("medium", "Fix the date", {
      prompt: "Set `fixed` to `date` with the dots replaced by slashes.",
      starter: "date = \"16.10.2026\"\n",
      hint: "`date.replace(\".\", \"/\")` replaces every dot.",
      solution: "date = \"16.10.2026\"\nfixed = date.replace(\".\", \"/\")",
      tests: [
        ["fixed is 16/10/2026", "fixed == \"16/10/2026\""],
      ],
    }),
    task("medium", "Count a letter", {
      prompt: "Set `s_count` to how many times the letter s appears in `sentence`, counting capital S too.",
      starter: "sentence = \"She sells sea shells\"\n",
      hint: "`count` is case-sensitive, so make the sentence lowercase first: `sentence.lower().count(\"s\")`.",
      solution: "sentence = \"She sells sea shells\"\ns_count = sentence.lower().count(\"s\")",
      tests: [
        ["s_count is 6", "s_count == 6"],
      ],
    }),
    task("medium", "Only digits?", {
      prompt: "A PIN must be exactly 4 digits. Set `valid` to whether `pin` is one: every character a digit, and 4 characters long.",
      starter: "pin = \"40a6\"\n",
      hint: "`pin.isdigit()` checks the characters and `len(pin) == 4` the length. Join them with `and`.",
      solution: "pin = \"40a6\"\nvalid = pin.isdigit() and len(pin) == 4",
      tests: [
        ["valid is False for 40a6", "valid is False"],
      ],
    }),
    task("hard", "Is it a photo?", {
      prompt: "Set `is_photo` to whether `filename` ends in `.jpg`, whatever its capital letters.",
      starter: "filename = \"Holiday.JPG\"\n",
      hint: "Chain the methods: lowercase first, then `endswith(\".jpg\")`.",
      solution: "filename = \"Holiday.JPG\"\nis_photo = filename.lower().endswith(\".jpg\")",
      tests: [
        ["is_photo is True", "is_photo is True"],
      ],
    }),
    task("hard", "Find the domain", {
      prompt: "Set `domain` to the part of `email` after the `@`. Use `find` to locate the `@`, then a slice.",
      starter: "email = \"grace@example.org\"\n",
      hint: "`at = email.find(\"@\")` is the index of the `@`. The domain starts one character later: `email[at + 1:]`.",
      solution: "email = \"grace@example.org\"\nat = email.find(\"@\")\ndomain = email[at + 1:]",
      tests: [
        ["domain is example.org", "domain == \"example.org\""],
      ],
    }),
    task("hard", "Count the words", {
      prompt: "Set `word_count` to the number of words in `sentence`. Some words are separated by more than one space.",
      starter: "sentence = \"  The quick   brown fox  jumps \"\n",
      hint: "`split()` with no argument splits at any run of spaces and ignores the ones at the ends. `len()` counts the pieces.",
      solution: "sentence = \"  The quick   brown fox  jumps \"\nword_count = len(sentence.split())",
      tests: [
        ["word_count is 5", "word_count == 5"],
      ],
    }),
    task("expert", "Make a username", {
      prompt: "Turn `full_name` into a username like `ada.lovelace`: no spaces around it, all lowercase, and a dot instead of the space between the names.",
      starter: "full_name = \"  Ada Lovelace \"\n",
      hint: "Chain three methods: `strip()`, then `lower()`, then `replace(\" \", \".\")`.",
      solution: "full_name = \"  Ada Lovelace \"\nusername = full_name.strip().lower().replace(\" \", \".\")",
      tests: [
        ["username is ada.lovelace", "username == \"ada.lovelace\""],
      ],
    }),
    task("expert", "Hashtags", {
      prompt: "Turn `tags` into `result`, the text `#python #data #web`. The spacing in `tags` is messy.",
      starter: "tags = \"python, data ,  web\"\n",
      hint: "Remove all spaces with `replace(\" \", \"\")`, then `split(\",\")` gives the three words. Join them with `\" #\"` and put one more `\"#\"` in front.",
      solution: "tags = \"python, data ,  web\"\nwords = tags.replace(\" \", \"\").split(\",\")\nresult = \"#\" + \" #\".join(words)",
      tests: [
        ["result is #python #data #web", "result == \"#python #data #web\""],
      ],
    }),
  ],
  questions: [
    mc("What does `\"hi\".upper()` return?", ["`hi`","`HI`","`Hi`","An error"], 1, "`.upper()` returns a copy with every letter in capitals."),
    qShort("Which method removes spaces from both ends of a string? (name only)", "strip", "`.strip()` removes spaces (and other whitespace such as new lines) from both ends."),
    mc("After `name = \" Ana \"` and then `name.strip()`, what is `name`?", ["`\"Ana\"`","`\"\"`","`\" Ana \"`: the result was never stored","An error"], 2, "String methods return a new string and never change the original, so you have to store the result."),
    mc("What does `\"  Hi There \".strip().lower()` give?", ["`\"  hi there \"`","`\"Hi There\"`","`\"hithere\"`","`\"hi there\"`"], 3, "Chained methods run left to right: `strip()` removes the outer spaces, then `lower()` works on that result. The space between the words stays."),
    mc("What does `\"a-b-c\".replace(\"-\", \"\")` give?", ["`abc`","`a b c`","`a-b-c`","`-`"], 0, "Replacing every `-` with an empty string removes them all."),
    mc("What is `\"banana\".count(\"a\")`?", ["`1`","`2`","`3`","`6`"], 2, "`.count` returns how many times the text appears, and \"banana\" has three a's."),
    mc("What does `\"hello\".find(\"z\")` give?", ["`0`","`None`","An error","`-1`"], 3, "`.find` returns -1 when the text isn't there; `.index` would raise an error instead."),
    mc("What is `\"photo.png\".endswith(\".png\")`?", ["`True`","`False`","`.png`","`4`"], 0, "`.endswith` checks the end of the string, which makes it handy for file extensions."),
    mc("What is `\"12a\".isdigit()`?", ["`True`","`False`","`12`","An error"], 1, "`.isdigit()` is `True` only when every character is a digit, and `a` isn't one."),
    mc("What does `\"a b c\".split()` give?", ["`\"abc\"`","`['a', 'b', 'c']`","`('a', 'b', 'c')`","`3`"], 1, "With no argument, `.split()` splits on runs of whitespace and returns a list of words."),
    mc("What does `\"-\".join([\"2026\", \"10\", \"16\"])` give?", ["`2026-10-16`","`-2026-10-16-`","`2026 10 16`","An error"], 0, "`.join` puts the string it is called on, here `-`, between the items of the list."),
  ],
})
