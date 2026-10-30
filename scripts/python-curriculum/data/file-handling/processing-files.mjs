// Files topic: Processing text files. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "processing_files",
  title: "Processing text files",
  paragraphs: [
    "Most real file work follows one pattern: **read** some input, **process** it, and **write** the result somewhere else. Filtering a log for errors, renaming a word throughout a document, totalling a list of sales: all are the same three steps, with different processing in the middle.",
    "```\nwith open(\"app.log\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"INFO start\\nERROR disk full\\nINFO saved\\nERROR timeout\\n\")\n\nwith open(\"app.log\", encoding=\"utf-8\") as src, open(\"errors.txt\", \"w\", encoding=\"utf-8\") as dst:\n    for line in src:\n        if line.startswith(\"ERROR\"):\n            dst.write(line)\n\nwith open(\"errors.txt\", encoding=\"utf-8\") as f:\n    print(f.read())   # just the two ERROR lines\n```",
    "Opening the input and the output in one `with` and working line by line means even a huge log never has to fit in memory: each line is read, checked and written before the next one is read. Lines that are written unchanged keep their own `\\n`, so no extra line breaks are needed.",
    "When the processing needs the **whole** input first, such as sorting, counting or finding the top values, read everything (or build a dict as you go), then write the result in a second step. Keep the steps in separate functions, `load`, `summarise` and `save`, and each one is easy to test on its own.",
    "**Write to a new file**, never back into the one you're reading. If the program fails halfway, the original is still there. When the result really must replace the original, write it to a temporary name and then swap it into place with `os.replace(temp, original)`, which replaces the file in one step, so there's never a moment with a half-written file.",
    "```\nimport os\n\ndef replace_word(name, old, new):\n    with open(name, encoding=\"utf-8\") as f:\n        text = f.read()\n    temp = name + \".tmp\"\n    with open(temp, \"w\", encoding=\"utf-8\") as f:\n        f.write(text.replace(old, new))\n    os.replace(temp, name)     # swap in the finished file\n```",
    "Processing often combines several files (merging monthly reports into one) or splits one into several (one output file per category). The patterns are the same; only the number of `open` calls changes. A dict of open files, or a dict of lists written out at the end, keeps the splitting tidy.",
  ],
  sandboxCode: "with open(\"sales.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"fruit,apples,3.50\\nveg,leeks,2.00\\nfruit,pears,4.25\\n\")\n\ntotals = {}\nwith open(\"sales.txt\", encoding=\"utf-8\") as f:\n    for line in f:\n        category, item, price = line.strip().split(\",\")\n        totals[category] = totals.get(category, 0) + float(price)\n\nwith open(\"totals.txt\", \"w\", encoding=\"utf-8\") as f:\n    for category in sorted(totals):\n        f.write(f\"{category}: {totals[category]:.2f}\\n\")\n\nwith open(\"totals.txt\", encoding=\"utf-8\") as f:\n    print(f.read())",
  sandboxSnippets: [
    snippet("Filter lines", "with open(\"in.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"keep this\\ndrop that\\nkeep me too\\n\")\nwith open(\"in.txt\", encoding=\"utf-8\") as src, open(\"out.txt\", \"w\", encoding=\"utf-8\") as dst:\n    for line in src:\n        if line.startswith(\"keep\"):\n            dst.write(line)\nprint(open(\"out.txt\", encoding=\"utf-8\").read())"),
    snippet("Transform every line", "with open(\"names.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"ana lima\\nben ode\\n\")\nwith open(\"names.txt\", encoding=\"utf-8\") as src, open(\"titled.txt\", \"w\", encoding=\"utf-8\") as dst:\n    for line in src:\n        dst.write(line.title())\nprint(open(\"titled.txt\", encoding=\"utf-8\").read())"),
    snippet("Swap in safely", "import os\n\nwith open(\"doc.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"colour and colours\\n\")\nwith open(\"doc.txt.tmp\", \"w\", encoding=\"utf-8\") as f:\n    f.write(open(\"doc.txt\", encoding=\"utf-8\").read().replace(\"colour\", \"color\"))\nos.replace(\"doc.txt.tmp\", \"doc.txt\")\nprint(open(\"doc.txt\", encoding=\"utf-8\").read(), os.path.exists(\"doc.txt.tmp\"))"),
    snippet("Merge files", "for month, text in [(\"jan\", \"10\\n20\\n\"), (\"feb\", \"5\\n\")]:\n    with open(f\"{month}.txt\", \"w\", encoding=\"utf-8\") as f:\n        f.write(text)\nwith open(\"all.txt\", \"w\", encoding=\"utf-8\") as out:\n    for month in [\"jan\", \"feb\"]:\n        with open(f\"{month}.txt\", encoding=\"utf-8\") as f:\n            out.write(f.read())\nprint(open(\"all.txt\", encoding=\"utf-8\").read().split())"),
  ],
  readMore: { label: "Python docs: os.replace", url: "https://docs.python.org/3/library/os.html#os.replace", source: "Python docs" },
  challenges: [
    task("easy", "Just the errors", {
      prompt: "Copy only the lines of `app.log` that start with `ERROR` into a new file `errors.txt`.",
      hint: "Open both files in one `with`, loop over the log, and write the lines that `startswith(\"ERROR\")`.",
      solution: "with open(\"app.log\", encoding=\"utf-8\") as src, open(\"errors.txt\", \"w\", encoding=\"utf-8\") as dst:\n    for line in src:\n        if line.startswith(\"ERROR\"):\n            dst.write(line)",
      setup: "import os as _os\nwith open('app.log', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('INFO start\\nERROR disk full\\nINFO saved\\nERROR timeout\\nWARNING slow\\n')\ndef _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["errors.txt is right", "_read(\"errors.txt\") == \"ERROR disk full\\nERROR timeout\\n\""],
        ["app.log is unchanged", "_read(\"app.log\") == 'INFO start\\nERROR disk full\\nINFO saved\\nERROR timeout\\nWARNING slow\\n'"],
      ],
    }),
    task("easy", "Title case", {
      prompt: "Write every line of `names.txt` in title case into `titled.txt`.",
      hint: "Loop and write `line.title()`: the line break stays at the end.",
      solution: "with open(\"names.txt\", encoding=\"utf-8\") as src, open(\"titled.txt\", \"w\", encoding=\"utf-8\") as dst:\n    for line in src:\n        dst.write(line.title())",
      setup: "import os as _os\nwith open('names.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('ana lima\\nben ode\\ncleo park\\n')\ndef _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["titled.txt is right", "_read(\"titled.txt\") == \"Ana Lima\\nBen Ode\\nCleo Park\\n\""],
      ],
    }),
    task("easy", "Number the lines", {
      prompt: "Write the lines of `poem.txt` into `numbered.txt`, each starting with its number and a space, like `1 Roses are red`.",
      hint: "`enumerate(src, start=1)` and write `f\"{n} {line}\"`.",
      solution: "with open(\"poem.txt\", encoding=\"utf-8\") as src, open(\"numbered.txt\", \"w\", encoding=\"utf-8\") as dst:\n    for n, line in enumerate(src, start=1):\n        dst.write(f\"{n} {line}\")",
      setup: "import os as _os\nwith open('poem.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('Roses are red\\nViolets are blue\\n')\ndef _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["numbered.txt is right", "_read(\"numbered.txt\") == \"1 Roses are red\\n2 Violets are blue\\n\""],
      ],
    }),
    task("medium", "Totals by category", {
      prompt: "`sales.txt` has lines like `fruit,apples,3.50`. Write `totals.txt` with one line per category, sorted, like `dairy: 1.20`.",
      hint: "Build a dict of totals while reading, then write it out sorted with `:.2f`.",
      solution: "totals = {}\nwith open(\"sales.txt\", encoding=\"utf-8\") as f:\n    for line in f:\n        category, item, price = line.strip().split(\",\")\n        totals[category] = totals.get(category, 0) + float(price)\nwith open(\"totals.txt\", \"w\", encoding=\"utf-8\") as f:\n    for category in sorted(totals):\n        f.write(f\"{category}: {totals[category]:.2f}\\n\")",
      setup: "import os as _os\nwith open('sales.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('fruit,apples,3.50\\nveg,leeks,2.00\\nfruit,pears,4.25\\ndairy,milk,1.20\\nveg,carrots,1.30\\n')\ndef _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["totals.txt is right", "_read(\"totals.txt\") == \"dairy: 1.20\\nfruit: 7.75\\nveg: 3.30\\n\""],
      ],
    }),
    task("medium", "Merge the months", {
      prompt: "Combine `jan.txt`, `feb.txt` and `mar.txt`, in that order, into `quarter.txt`.",
      hint: "Open `quarter.txt` for writing once, then loop over the three names, writing each file's text.",
      solution: "with open(\"quarter.txt\", \"w\", encoding=\"utf-8\") as out:\n    for name in [\"jan.txt\", \"feb.txt\", \"mar.txt\"]:\n        with open(name, encoding=\"utf-8\") as f:\n            out.write(f.read())",
      setup: "import os as _os\nwith open('jan.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('10\\n20\\n')\nwith open('feb.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('5\\n')\nwith open('mar.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('7\\n8\\n')\ndef _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["quarter.txt is right", "_read(\"quarter.txt\") == \"10\\n20\\n5\\n7\\n8\\n\""],
      ],
    }),
    task("medium", "Word report", {
      prompt: "Count the words in `story.txt` (lowercase, punctuation `.,!?` stripped) and write `words.txt` with the three most common, one per line, like `the: 4`.",
      hint: "Count with a dict or `Counter`, then write `most_common(3)`.",
      solution: "from collections import Counter\n\nwith open(\"story.txt\", encoding=\"utf-8\") as f:\n    words = [w.strip(\".,!?\").lower() for w in f.read().split()]\nwith open(\"words.txt\", \"w\", encoding=\"utf-8\") as f:\n    for word, count in Counter(words).most_common(3):\n        f.write(f\"{word}: {count}\\n\")",
      setup: "import os as _os\nwith open('story.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('The cat sat. The cat ran!\\nThe dog sat, and the cat slept.\\n')\ndef _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["words.txt is right", "_read(\"words.txt\") == \"the: 4\\ncat: 3\\nsat: 2\\n\""],
      ],
    }),
    task("hard", "Replace a word safely", {
      prompt: "Define `replace_word(name, old, new)` that replaces every `old` with `new` in the file, writing to `name + \".tmp\"` first and then swapping it in with `os.replace`.",
      starter: "import os\n\n",
      hint: "Read the text, write the changed text to the temp file, then `os.replace(temp, name)`.",
      solution: "import os\n\ndef replace_word(name, old, new):\n    with open(name, encoding=\"utf-8\") as f:\n        text = f.read()\n    temp = name + \".tmp\"\n    with open(temp, \"w\", encoding=\"utf-8\") as f:\n        f.write(text.replace(old, new))\n    os.replace(temp, name)",
      setup: "import os as _os\nwith open('doc.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('colour and colours\\n')\ndef _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["The file is changed", "(replace_word(\"doc.txt\", \"colour\", \"color\"), _read(\"doc.txt\"))[1] == \"color and colors\\n\""],
        ["No temp file is left", "(replace_word(\"doc.txt\", \"x\", \"y\"), __import__(\"os\").path.exists(\"doc.txt.tmp\"))[1] is False"],
      ],
    }),
    task("hard", "Split by category", {
      prompt: "Write each line of `sales.txt` into a file named after its category, like `fruit.txt`, keeping the lines in order.",
      hint: "Group the lines in a dict of lists while reading, then write one file per key.",
      solution: "groups = {}\nwith open(\"sales.txt\", encoding=\"utf-8\") as f:\n    for line in f:\n        category = line.split(\",\")[0]\n        if category not in groups:\n            groups[category] = []\n        groups[category].append(line)\nfor category, lines in groups.items():\n    with open(f\"{category}.txt\", \"w\", encoding=\"utf-8\") as f:\n        f.writelines(lines)",
      setup: "import os as _os\nwith open('sales.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('fruit,apples,3.50\\nveg,leeks,2.00\\nfruit,pears,4.25\\ndairy,milk,1.20\\nveg,carrots,1.30\\n')\ndef _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["fruit.txt", "_read(\"fruit.txt\") == \"fruit,apples,3.50\\nfruit,pears,4.25\\n\""],
        ["veg.txt", "_read(\"veg.txt\") == \"veg,leeks,2.00\\nveg,carrots,1.30\\n\""],
        ["dairy.txt", "_read(\"dairy.txt\") == \"dairy,milk,1.20\\n\""],
      ],
    }),
    task("expert", "Load, summarise, save", {
      prompt: "Write three functions: `load(name)` returns the numbers in a file (one per line, blank lines skipped) as floats; `summarise(numbers)` returns a dict with `count`, `total` and `largest`; and `save(summary, name)` writes it as lines like `count: 4`. Then run them on `in.txt` into `summary.txt`.",
      hint: "Keep each step small. `save` loops over `summary.items()`; format floats with `:g`.",
      solution: "def load(name):\n    with open(name, encoding=\"utf-8\") as f:\n        return [float(line) for line in f if line.strip()]\n\ndef summarise(numbers):\n    return {\"count\": len(numbers), \"total\": sum(numbers), \"largest\": max(numbers)}\n\ndef save(summary, name):\n    with open(name, \"w\", encoding=\"utf-8\") as f:\n        for key, value in summary.items():\n            f.write(f\"{key}: {value:g}\\n\")\n\nsave(summarise(load(\"in.txt\")), \"summary.txt\")",
      setup: "import os as _os\nwith open('in.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('4\\n10\\n\\n2.5\\n7.5\\n')\ndef _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["load", "load(\"in.txt\") == [4.0, 10.0, 2.5, 7.5]"],
        ["summarise", "summarise([1.0, 5.0]) == {\"count\": 2, \"total\": 6.0, \"largest\": 5.0}"],
        ["summary.txt", "_read(\"summary.txt\") == \"count: 4\\ntotal: 24\\nlargest: 10\\n\""],
      ],
    }),
    task("expert", "Clean up a messy file", {
      prompt: "Define `clean(src, dst)` that copies `src` to `dst` with every line stripped, blank lines and `#` comments removed, and duplicate lines dropped (keeping the first). Return the number of lines written.",
      hint: "Keep a `seen` set while looping; write a line only if it is not empty, not a comment, and not seen.",
      solution: "def clean(src, dst):\n    seen = set()\n    written = 0\n    with open(src, encoding=\"utf-8\") as fin, open(dst, \"w\", encoding=\"utf-8\") as fout:\n        for line in fin:\n            line = line.strip()\n            if not line or line.startswith(\"#\") or line in seen:\n                continue\n            seen.add(line)\n            fout.write(line + \"\\n\")\n            written += 1\n    return written",
      setup: "import os as _os\nwith open('messy.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('  apple \\n\\n# fruit list\\nbanana\\napple\\n   \\ncherry\\nbanana\\n')\ndef _read(name):\n    with open(name, encoding=\"utf-8\") as _f:\n        return _f.read()\n",
      tests: [
        ["Returns 3", "clean(\"messy.txt\", \"clean.txt\") == 3"],
        ["clean.txt is right", "(clean(\"messy.txt\", \"c2.txt\"), _read(\"c2.txt\"))[1] == \"apple\\nbanana\\ncherry\\n\""],
      ],
    }),
  ],
  questions: [
    mc("What does `len(set([\"b\\n\", \"a\\n\", \"b\\n\"]))` give?", ["`3`", "`1`", "`2`", "An error"], 2),
    mc("Why process a big file line by line?", ["It sorts the lines", "It is the only way to write", "The whole file never has to fit in memory", "It removes line breaks"], 2),
    mc("Why write the result to a new file instead of the input?", ["If the program fails halfway, the original is still safe", "Python can't write to a file it reads", "New files are faster", "It keeps the encoding"], 0),
    mc("What does `os.replace(temp, name)` do?", ["Copies the text", "Deletes both files", "Renames `name` to `temp`", "Swaps the finished temp file into place in one step"], 3),
    qShort("`\"ana lima\\n\".title()` keeps the line break. What does it give, without the line break?", "Ana Lima"),
    mc("When must you read the whole input before writing?", ["Never", "When the result depends on all of it, like sorting or top counts", "For every filter", "Only for binary files"], 1),
    mc("Why split the work into `load`, `summarise` and `save`?", ["Each step is small and easy to test on its own", "Python requires three functions", "It is faster", "Files can only be opened in functions"], 0),
    mc("A line copied unchanged from the input already ends with `\\n`. What should you add?", ["Another `\\n`", "A space", "Nothing", "`\\r\\n`"], 2),
    mc("How do you split one file into one file per category?", ["Open every file in `\"r\"` mode", "Use `os.replace`", "Read it twice", "Group the lines in a dict of lists, then write one file per key"], 3),
    mc("Which keeps duplicate lines out of the output?", ["A list", "A `seen` set checked before writing", "Sorting first", "`os.path.exists`"], 1),
  ],
})
