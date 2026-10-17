// Files topic: Opening and reading files. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "opening_files",
  title: "Opening and reading files",
  paragraphs: [
    "Everything a program has stored in variables disappears when it ends. **Files** keep data for later: notes, settings, scores, logs, whole books. This section is about reading and writing them.",
    "In CodeQuest, Python runs in your browser with a small disk of its own. Files you create in the sandbox stay there until the page reloads (or a run is stopped), and every challenge check starts in a fresh, empty folder, with the sample files that challenge needs already in it.",
    "`open(name)` opens a file and gives you a **file object**. Its `read()` method returns the whole content as one string, and `close()` tells Python you've finished with it. The example first creates a small file to read; writing files gets its own lesson soon.",
    "```\nf = open(\"hello.txt\", \"w\", encoding=\"utf-8\")    # create a file to read\nf.write(\"Hello, file!\\nSecond line\\n\")\nf.close()\n\nf = open(\"hello.txt\", encoding=\"utf-8\")\ntext = f.read()\nf.close()\nprint(text)\n```",
    "The second argument of `open` is the **mode**: `\"r\"` to read (the default), `\"w\"` to write. Pass `encoding=\"utf-8\"` as well, so that letters like é and ø are read correctly whatever computer the file came from; the lesson on bytes explains why.",
    "The text you get back includes the line breaks, as `\\n` characters. `text.splitlines()` turns it into a list of lines without them, and `len(text)` counts every character, line breaks included.",
    "A file object remembers how far it has read. After `read()` has returned everything, a second `read()` returns `\"\"`, because there's nothing left. `read(5)` reads at most 5 characters, and the next read carries on from there.",
    "```\nf = open(\"hello.txt\", encoding=\"utf-8\")\nprint(repr(f.read(5)))    # 'Hello'\nprint(repr(f.read(2)))    # ', '\nrest = f.read()\nprint(repr(f.read()))     # '' : nothing left\nf.close()\n```",
    "Opening a file that doesn't exist raises `FileNotFoundError`. And forgetting `close()` can leave files locked or half-written in real programs, which is why the next lesson shows the `with` statement, which closes files for you.",
  ],
  sandboxCode: "f = open(\"shopping.txt\", \"w\", encoding=\"utf-8\")\nf.write(\"eggs\\nmilk\\nbread\\n\")\nf.close()\n\nf = open(\"shopping.txt\", encoding=\"utf-8\")\ntext = f.read()\nf.close()\n\nprint(repr(text))\nprint(text.splitlines(), len(text))",
  sandboxSnippets: [
    snippet("Read a whole file", "f = open(\"note.txt\", \"w\", encoding=\"utf-8\")\nf.write(\"Remember the meeting at 3.\\n\")\nf.close()\n\nf = open(\"note.txt\", encoding=\"utf-8\")\nprint(f.read())\nf.close()"),
    snippet("The line breaks", "f = open(\"two.txt\", \"w\", encoding=\"utf-8\")\nf.write(\"one\\ntwo\\n\")\nf.close()\n\nf = open(\"two.txt\", encoding=\"utf-8\")\ntext = f.read()\nf.close()\nprint(repr(text), text.splitlines())"),
    snippet("Reading moves along", "f = open(\"abc.txt\", \"w\", encoding=\"utf-8\")\nf.write(\"abcdefgh\")\nf.close()\n\nf = open(\"abc.txt\", encoding=\"utf-8\")\nprint(f.read(3), f.read(3), repr(f.read()), repr(f.read()))\nf.close()"),
    snippet("A missing file", "open(\"no-such-file.txt\", encoding=\"utf-8\")"),
  ],
  readMore: { label: "Python tutorial: reading and writing files", url: "https://docs.python.org/3/tutorial/inputoutput.html#reading-and-writing-files", source: "Python docs" },
  challenges: [
    task("easy", "Read the notes", {
      prompt: "Read the whole of `notes.txt` into `text`, then close the file.",
      hint: "`f = open(\"notes.txt\", encoding=\"utf-8\")`, `text = f.read()`, `f.close()`.",
      solution: "f = open(\"notes.txt\", encoding=\"utf-8\")\ntext = f.read()\nf.close()",
      setup: "import os as _os\nwith open('notes.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('Buy milk\\nCall Ana\\nWater the plants\\n')\n",
      tests: [
        ["text is the whole file", "text == 'Buy milk\\nCall Ana\\nWater the plants\\n'"],
        ["The file is closed", "f.closed"],
      ],
    }),
    task("easy", "How long is it?", {
      prompt: "Set `size` to the number of characters in `notes.txt`, line breaks included.",
      hint: "Read it, then `len(...)`.",
      solution: "f = open(\"notes.txt\", encoding=\"utf-8\")\nsize = len(f.read())\nf.close()",
      setup: "import os as _os\nwith open('notes.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('Buy milk\\nCall Ana\\nWater the plants\\n')\n",
      tests: [
        ["size is right", "size == 35"],
      ],
    }),
    task("easy", "The first line", {
      prompt: "Set `first` to the first line of `poem.txt`, without the line break.",
      hint: "Read the text, then `text.splitlines()[0]`.",
      solution: "f = open(\"poem.txt\", encoding=\"utf-8\")\ntext = f.read()\nf.close()\nfirst = text.splitlines()[0]",
      setup: "import os as _os\nwith open('poem.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('Roses are red\\nViolets are blue\\nPython is fun\\nAnd so are you\\n')\n",
      tests: [
        ["first is Roses are red", "first == \"Roses are red\""],
      ],
    }),
    task("medium", "Count the lines", {
      prompt: "Set `count` to the number of lines in `poem.txt`.",
      hint: "`len(text.splitlines())`.",
      solution: "f = open(\"poem.txt\", encoding=\"utf-8\")\ncount = len(f.read().splitlines())\nf.close()",
      setup: "import os as _os\nwith open('poem.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('Roses are red\\nViolets are blue\\nPython is fun\\nAnd so are you\\n')\n",
      tests: [
        ["count is 4", "count == 4"],
      ],
    }),
    task("medium", "Read it twice", {
      prompt: "Open `notes.txt` once and call `read()` twice, storing the results in `first_read` and `second_read`.",
      hint: "Two `f.read()` calls on the same file object. The second finds nothing left.",
      solution: "f = open(\"notes.txt\", encoding=\"utf-8\")\nfirst_read = f.read()\nsecond_read = f.read()\nf.close()",
      setup: "import os as _os\nwith open('notes.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('Buy milk\\nCall Ana\\nWater the plants\\n')\n",
      tests: [
        ["first_read is the whole file", "first_read == 'Buy milk\\nCall Ana\\nWater the plants\\n'"],
        ["second_read is empty", "second_read == \"\""],
      ],
    }),
    task("medium", "Just the start", {
      prompt: "Set `start` to the first 8 characters of `poem.txt`, reading only those 8.",
      hint: "`f.read(8)`.",
      solution: "f = open(\"poem.txt\", encoding=\"utf-8\")\nstart = f.read(8)\nf.close()",
      setup: "import os as _os\nwith open('poem.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('Roses are red\\nViolets are blue\\nPython is fun\\nAnd so are you\\n')\n",
      tests: [
        ["start is Roses ar", "start == \"Roses ar\""],
      ],
    }),
    task("hard", "Count the words", {
      prompt: "Set `words` to the number of words in `poem.txt`.",
      hint: "Read the text and `len(text.split())`: `split()` splits on spaces and line breaks alike.",
      solution: "f = open(\"poem.txt\", encoding=\"utf-8\")\nwords = len(f.read().split())\nf.close()",
      setup: "import os as _os\nwith open('poem.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('Roses are red\\nViolets are blue\\nPython is fun\\nAnd so are you\\n')\n",
      tests: [
        ["words is 13", "words == 13"],
      ],
    }),
    task("hard", "The longest line", {
      prompt: "Set `longest` to the longest line of `poem.txt` (the first one, on a tie).",
      hint: "`max(text.splitlines(), key=len)`.",
      solution: "f = open(\"poem.txt\", encoding=\"utf-8\")\ntext = f.read()\nf.close()\nlongest = max(text.splitlines(), key=len)",
      setup: "import os as _os\nwith open('poem.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('Roses are red\\nViolets are blue\\nPython is fun\\nAnd so are you\\n')\n",
      tests: [
        ["longest is right", "longest == \"Violets are blue\""],
      ],
    }),
    task("expert", "Add them up", {
      prompt: "`numbers.txt` has one number per line. Set `total` to their sum.",
      hint: "Read the text, split it into lines, and add `float(line)` for each one.",
      solution: "f = open(\"numbers.txt\", encoding=\"utf-8\")\ntext = f.read()\nf.close()\ntotal = sum(float(line) for line in text.splitlines())",
      setup: "import os as _os\nwith open('numbers.txt', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('12\\n7.5\\n30\\n12\\n')\n",
      tests: [
        ["total is 61.5", "total == 61.5"],
      ],
    }),
    task("expert", "Find the errors", {
      prompt: "Set `errors` to how many lines of `app.log` contain the word `error`, in any mix of capitals.",
      hint: "Loop over the lines and count those where `\"error\" in line.lower()`.",
      solution: "f = open(\"app.log\", encoding=\"utf-8\")\ntext = f.read()\nf.close()\nerrors = sum(1 for line in text.splitlines() if \"error\" in line.lower())",
      setup: "import os as _os\nwith open('app.log', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('INFO started\\nERROR disk full\\nINFO saved\\nWarning: low memory\\nError: timeout\\nerror reading config\\n')\n",
      tests: [
        ["errors is 3", "errors == 3"],
      ],
    }),
  ],
  questions: [
    mc("What does `f.read()` return?", ["A list of lines", "The whole file as one string", "The first line", "The file name"], 1),
    mc("What is the default mode of `open`?", ["`\"w\"`", "`\"a\"`", "`\"r\"`: reading", "`\"x\"`"], 2),
    mc("Why pass `encoding=\"utf-8\"`?", ["So letters like é are read correctly on every computer", "It makes reading faster", "It is required for writing", "To read binary files"], 0),
    mc("What does a second `f.read()` return after the first read everything?", ["The whole file again", "An error", "`None`", "`\"\"`"], 3),
    qShort("Which exception does opening a missing file raise? (class name)", "FileNotFoundError"),
    mc("What does `text.splitlines()` give?", ["The text with no spaces", "A list of the lines, without their line breaks", "The number of lines", "Only the first line"], 1),
    mc("What does `f.read(5)` do?", ["Reads at most 5 characters, from where the file object is", "Reads line 5", "Reads 5 lines", "Skips 5 characters"], 0),
    mc("Which character marks the end of each line in the text?", ["`\\t`", "`;`", "`\\n`", "`.`"], 2),
    mc("Why must a file be closed?", ["To delete it", "To read it again", "Python requires it before printing", "Open files can stay locked or half-written"], 3),
    mc("In CodeQuest, where do challenge checks run?", ["In your computer's Documents folder", "In a fresh folder with that challenge's sample files", "On a server", "In the sandbox's folder"], 1),
  ],
})
