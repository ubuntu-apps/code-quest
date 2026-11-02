// Modules and packages topic: Exploring the standard library. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "stdlib_overview",
  title: "Exploring the standard library",
  paragraphs: [
    "Python is said to come with \"batteries included\": the **standard library** that's installed with every copy of Python has modules for maths, dates, random numbers, files, text, data formats and much more. Before writing something yourself or installing a package, it's worth checking whether the standard library already does it.",
    "Some of the modules you'll reach for most:",
    "```\nmath          square roots, rounding down/up, pi, trigonometry\nstatistics    mean, median, mode, standard deviation\nrandom        random numbers, choices and shuffling\ndatetime      dates, times and the gaps between them\nstring        ready-made sets of characters: letters, digits\ncollections   Counter, defaultdict, deque, namedtuple\nitertools     combinations, running totals, looping helpers\nos, pathlib   files and folders\njson, csv     reading and writing data files\nsys           facts about Python itself, like its version\n```",
    "`statistics` saves you writing averages by hand, and handles the awkward cases, like the median of an even number of values:",
    "```\nimport statistics\n\nscores = [72, 95, 64, 88]\nprint(statistics.mean(scores))     # 79.75\nprint(statistics.median(scores))   # 80.0, halfway between 72 and 88\nprint(statistics.mode([\"a\", \"b\", \"a\"]))   # a, the most common\n```",
    "`string` has ready-made strings of characters, so you never need to type out the alphabet, and `itertools` builds the combinations and arrangements that are fiddly to write as loops:",
    "```\nimport string\nfrom itertools import combinations\n\nprint(string.ascii_lowercase)   # abcdefghijklmnopqrstuvwxyz\nprint(string.digits)            # 0123456789\nprint(list(combinations([\"Ana\", \"Ben\", \"Cy\"], 2)))\n# [('Ana', 'Ben'), ('Ana', 'Cy'), ('Ben', 'Cy')]\n```",
    "To find your way around a module, `dir(module)` lists its names and `help(module.name)` prints its documentation. The same text is in the `__doc__` attribute, so `print(statistics.median.__doc__)` explains the median function. For the full picture, the Python docs have a page for every module, with examples.",
    "You've already used `collections` (for `Counter` and `defaultdict`) and `os` and `pathlib` (for files). The next two stages look closely at two more you'll use all the time: `random` and `datetime`.",
  ],
  sandboxCode: "import statistics\nimport string\nimport sys\nfrom itertools import permutations\n\nprint(statistics.mean([3, 8, 10]))\nprint(string.punctuation)\nprint(sys.version_info.major, sys.version_info.minor)\nprint([\"\".join(p) for p in permutations(\"abc\")])",
  sandboxSnippets: [
    snippet("statistics", "import statistics\ndata = [2, 4, 4, 4, 5, 5, 7, 9]\nprint(statistics.mean(data), statistics.median(data), statistics.mode(data))"),
    snippet("string constants", "import string\nprint(string.ascii_uppercase)\nprint(string.digits)\nprint(string.punctuation)"),
    snippet("Running totals", "from itertools import accumulate\nprint(list(accumulate([5, 3, 8, 2])))"),
    snippet("Read the docs", "import statistics\nprint(statistics.median.__doc__.splitlines()[0])"),
  ],
  readMore: { label: "The Python Standard Library", url: "https://docs.python.org/3/library/index.html", source: "Python docs" },
  challenges: [
    task("easy", "Most popular", {
      prompt: "Use `statistics.mode` to set `winner` to the most common vote.",
      starter: "votes = [\"pizza\", \"tacos\", \"pizza\", \"sushi\", \"pizza\", \"tacos\"]\n",
      hint: "`import statistics`, then `statistics.mode(votes)`.",
      solution: "import statistics\n\nvotes = [\"pizza\", \"tacos\", \"pizza\", \"sushi\", \"pizza\", \"tacos\"]\nwinner = statistics.mode(votes)",
      tests: [
        ["winner is pizza", "winner == \"pizza\""],
        ["statistics is imported", "statistics is __import__(\"statistics\")"],
      ],
    }),
    task("easy", "The alphabet", {
      prompt: "Set `alphabet` to the lowercase alphabet from the `string` module, and `first_five` to its first five letters.",
      hint: "`import string`, then `string.ascii_lowercase` and a slice.",
      solution: "import string\n\nalphabet = string.ascii_lowercase\nfirst_five = alphabet[:5]",
      tests: [
        ["alphabet is right", "alphabet == \"abcdefghijklmnopqrstuvwxyz\""],
        ["first_five is abcde", "first_five == \"abcde\""],
        ["string is imported", "string is __import__(\"string\")"],
      ],
    }),
    task("easy", "Which Python?", {
      prompt: "Use the `sys` module to set `major` to the main version number of the Python running your code (the 3 in 3.12).",
      hint: "`import sys`, then `sys.version_info.major`.",
      solution: "import sys\n\nmajor = sys.version_info.major",
      tests: [
        ["major is 3", "major == 3"],
        ["sys is imported", "sys is __import__(\"sys\")"],
      ],
    }),
    task("medium", "Letters and digits only", {
      prompt: "Define `is_simple(text)` that returns `True` if every character of `text` is an ASCII letter or digit. Use the `string` module rather than typing the characters out.",
      starter: "import string\n",
      hint: "`allowed = string.ascii_letters + string.digits`, then `all(c in allowed for c in text)`.",
      solution: "import string\n\ndef is_simple(text):\n    allowed = string.ascii_letters + string.digits\n    return all(c in allowed for c in text)",
      tests: [
        ["Letters and digits", "is_simple(\"Room101\") is True"],
        ["A space", "is_simple(\"a b\") is False"],
        ["Punctuation", "is_simple(\"hi!\") is False"],
      ],
    }),
    task("medium", "Every pair", {
      prompt: "Set `pairs` to the list of every pair of players that could play a match, using `itertools.combinations`.",
      starter: "players = [\"Ana\", \"Ben\", \"Cy\", \"Dee\"]\n",
      hint: "`from itertools import combinations`, then `list(combinations(players, 2))`.",
      solution: "from itertools import combinations\n\nplayers = [\"Ana\", \"Ben\", \"Cy\", \"Dee\"]\npairs = list(combinations(players, 2))",
      tests: [
        ["Six matches", "len(pairs) == 6"],
        ["Starts with Ana and Ben", "pairs[0] == (\"Ana\", \"Ben\")"],
        ["Ends with Cy and Dee", "pairs[-1] == (\"Cy\", \"Dee\")"],
      ],
    }),
    task("medium", "How spread out?", {
      prompt: "Set `average` to the mean of `data` and `spread` to its population standard deviation (`statistics.pstdev`).",
      starter: "data = [2, 4, 4, 4, 5, 5, 7, 9]\n",
      hint: "Both are in `statistics`: `mean` and `pstdev`.",
      solution: "import statistics\n\ndata = [2, 4, 4, 4, 5, 5, 7, 9]\naverage = statistics.mean(data)\nspread = statistics.pstdev(data)",
      tests: [
        ["average is 5", "average == 5"],
        ["spread is 2.0", "spread == 2.0"],
      ],
    }),
    task("hard", "Lucky sevens", {
      prompt: "Using `itertools.product`, set `sevens` to every roll of two dice (as `(first, second)` tuples) that adds up to 7.",
      hint: "`product(range(1, 7), repeat=2)` gives every roll; keep those with `a + b == 7`.",
      solution: "from itertools import product\n\nsevens = [(a, b) for a, b in product(range(1, 7), repeat=2) if a + b == 7]",
      tests: [
        ["Six ways", "len(sevens) == 6"],
        ["In order", "sevens == [(1, 6), (2, 5), (3, 4), (4, 3), (5, 2), (6, 1)]"],
      ],
    }),
    task("hard", "Read the docs", {
      prompt: "Set `summary` to the first line of the documentation of `statistics.median` (its `__doc__`).",
      starter: "import statistics\n",
      hint: "`statistics.median.__doc__.splitlines()[0]`.",
      solution: "import statistics\n\nsummary = statistics.median.__doc__.splitlines()[0]",
      tests: [
        ["summary is the first line", "summary == __import__(\"statistics\").median.__doc__.splitlines()[0]"],
        ["It mentions the median", "\"median\" in summary.lower()"],
      ],
    }),
    task("expert", "Top letters", {
      prompt: "Define `top_letters(text, n=3)` that returns the `n` most common letters in `text` as `(letter, count)` pairs, ignoring case and anything that isn't a letter a to z. Use `Counter` and the `string` module.",
      starter: "import string\nfrom collections import Counter\n",
      hint: "Count `c` for `c in text.lower() if c in string.ascii_lowercase`, then `.most_common(n)`.",
      solution: "import string\nfrom collections import Counter\n\ndef top_letters(text, n=3):\n    counts = Counter(c for c in text.lower() if c in string.ascii_lowercase)\n    return counts.most_common(n)",
      tests: [
        ["Hello, World!", "top_letters(\"Hello, World!\") == [(\"l\", 3), (\"o\", 2), (\"h\", 1)]"],
        ["Just one", "top_letters(\"Banana!\", 1) == [(\"a\", 3)]"],
        ["No letters", "top_letters(\"123 !?\") == []"],
      ],
    }),
    task("expert", "Ups and downs", {
      prompt: "Define `changes(values)` that returns how much each value changed from the one before, using `itertools.pairwise`, and `biggest_rise(values)` that returns the largest of those changes (or `0` with fewer than two values).",
      starter: "from itertools import pairwise\n",
      hint: "`[b - a for a, b in pairwise(values)]`; `max(changes(values), default=0)`.",
      solution: "from itertools import pairwise\n\ndef changes(values):\n    return [b - a for a, b in pairwise(values)]\n\ndef biggest_rise(values):\n    return max(changes(values), default=0)",
      tests: [
        ["Changes", "changes([10, 12, 9, 15]) == [2, -3, 6]"],
        ["Biggest rise", "biggest_rise([10, 12, 9, 15]) == 6"],
        ["Too short", "changes([5]) == [] and biggest_rise([5]) == 0"],
      ],
    }),
  ],
  questions: [
    mc("What is the standard library?", ["A website of packages", "The modules that come installed with Python", "Your own modules", "A list of keywords"], 1, "The standard library is the set of modules that comes with every Python install."),
    mc("Which module has `mean` and `median`?", ["`math`", "`random`", "`statistics`", "`string`"], 2, "`statistics` has averages and spread: `mean`, `median`, `mode`, `stdev` and more."),
    mc("What is `string.digits`?", ["`\"0123456789\"`", "A function that finds digits", "The number 10", "A list of numbers"], 0, "`string` has ready-made constants like `ascii_letters` and `digits`."),
    mc("What does `statistics.median([72, 95, 64, 88])` give?", ["`79.75`", "`88`", "`72`", "`80.0`"], 3, "With an even number of values, the median is the average of the two middle ones: (72 + 88) / 2."),
    mc("What does `combinations([\"a\", \"b\", \"c\"], 2)` produce?", ["`(\"a\", \"b\")` only", "Each pair: `(\"a\", \"b\")`, `(\"a\", \"c\")`, `(\"b\", \"c\")`", "Every order of all three", "The number 3"], 1, "`combinations` gives each group of the given size once, with order ignored."),
    mc("How can you read a function's documentation in code?", ["`help(f)` or `f.__doc__`", "`dir(f)`", "`f.docs()`", "`print(f)`"], 0, "Functions keep their docstring in `__doc__`, and `help` shows it."),
    qShort("Which module tells you the Python version (as `version_info`)? (one word)", "sys", "`sys.version_info` holds the running Python's version numbers."),
    mc("Which module has `Counter` and `defaultdict`?", ["`itertools`", "`string`", "`statistics`", "`collections`"], 3, "`collections` holds extra container types such as `Counter`, `defaultdict` and `deque`."),
    mc("After `from statistics import mean`, what is `mean([2, 4, 9])`?", ["`5`", "`15`", "`4`", "A `NameError`"], 0, "`from ... import mean` makes the name `mean` available directly. The mean of 2, 4 and 9 is 15 / 3 = 5."),
    mc("What does `statistics.mode` return?", ["The average", "The middle value", "The most common value", "The spread"], 2, "The mode is the value that appears most often."),
  ],
})
