// Decisions and loops topic: for loops. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "for_loops",
  title: "for loops",
  paragraphs: [
    "A `for` loop goes through a sequence one item at a time and runs its block for each one. Strings are sequences of characters, so `for ch in word:` visits every letter in turn:",
    "```\nword = \"code\"\nfor ch in word:\n    print(ch)\n```",
    "The name after `for` (here `ch`) is the **loop variable**. On each iteration it holds the current item, and you can call it anything that describes the item: `letter`, `word`, `n`. Unlike `while`, a `for` loop needs no counter to update and can't run forever: it stops when the items run out.",
    "To go through the words of a sentence, split it first: `for word in sentence.split():`. (`split()` gives a list of words; lists get their own quest next.)",
    "Most loops follow the **accumulator** pattern: set up a result before the loop, update it inside, and use it after. Counting, adding up and building new text all work this way:",
    "```\ntext = \"Programming is fun\"\nvowels = 0\nfor ch in text.lower():\n    if ch in \"aeiou\":\n        vowels += 1\nprint(vowels)   # 5\n```",
    "To build a new string, start with `result = \"\"` and add to it: `result = result + ch`. Adding each character in front (`result = ch + result`) reverses the text.",
    "Every character has a number, its code: `ord(\"a\")` is 97, and `chr(97)` turns it back into `\"a\"`. The letters a to z have the codes 97 to 122, one after another, so `chr(ord(ch) + 1)` is the next letter. That's the basis of simple ciphers.",
    "For counting a fixed number of times, `for` loops use `range()`, which the next stage covers in detail: `for i in range(3):` runs three times, with `i` set to 0, 1 and 2.",
  ],
  sandboxCode: "word = \"loop\"\nfor letter in word:\n    print(letter.upper())\n\ntotal = 0\nfor digit in \"2026\":\n    total += int(digit)\nprint(\"Digit sum:\", total)",
  sandboxSnippets: [
    snippet("Letters", "for ch in \"hello\":\n    print(ch)"),
    snippet("Words", "sentence = \"learn python today\"\nfor word in sentence.split():\n    print(word, len(word))"),
    snippet("Count", "text = \"banana\"\ncount = 0\nfor ch in text:\n    if ch == \"a\":\n        count += 1\nprint(count)"),
    snippet("Build a string", "word = \"stressed\"\nbackwards = \"\"\nfor ch in word:\n    backwards = ch + backwards\nprint(backwards)"),
    snippet("ord and chr", "print(ord(\"a\"), ord(\"b\"), ord(\"z\"))\nprint(chr(97), chr(ord(\"a\") + 1))"),
  ],
  readMore: { label: "Python tutorial: for statements", url: "https://docs.python.org/3/tutorial/controlflow.html#for-statements", source: "Python docs" },
  challenges: [
    task("easy", "Spell it out", {
      prompt: "Print each letter of `word` on its own line, using a `for` loop.",
      starter: "word = \"code\"\n",
      hint: "`for ch in word:` and `print(ch)` inside the loop.",
      solution: "word = \"code\"\nfor ch in word:\n    print(ch)",
      tests: [
        ["Prints c, o, d, e", "_cq_stdout.split() == [\"c\", \"o\", \"d\", \"e\"]"],
      ],
    }),
    task("easy", "Count a letter", {
      prompt: "Set `count` to how many times `a` appears in `text`, using a loop (not the `count` method).",
      starter: "text = \"banana\"\ncount = 0\n",
      hint: "Loop over the letters; when a letter equals `\"a\"`, add 1 to `count`.",
      solution: "text = \"banana\"\ncount = 0\nfor ch in text:\n    if ch == \"a\":\n        count += 1",
      tests: [
        ["count is 3", "count == 3"],
      ],
    }),
    task("easy", "One word per line", {
      prompt: "Print each word of `sentence` on its own line.",
      starter: "sentence = \"learn python today\"\n",
      hint: "Loop over `sentence.split()`.",
      solution: "sentence = \"learn python today\"\nfor word in sentence.split():\n    print(word)",
      tests: [
        ["Prints the three words", "_cq_stdout.strip().splitlines() == [\"learn\", \"python\", \"today\"]"],
      ],
    }),
    task("medium", "Count the vowels", {
      prompt: "Set `vowels` to the number of vowels (a, e, i, o, u) in `text`, capital letters included.",
      starter: "text = \"Programming is fun\"\nvowels = 0\n",
      hint: "Loop over `text.lower()` and check `if ch in \"aeiou\":`.",
      solution: "text = \"Programming is fun\"\nvowels = 0\nfor ch in text.lower():\n    if ch in \"aeiou\":\n        vowels += 1",
      tests: [
        ["vowels is 5", "vowels == 5"],
      ],
    }),
    task("medium", "Reverse a word", {
      prompt: "Build `backwards`, the word reversed, with a loop.",
      starter: "word = \"stressed\"\nbackwards = \"\"\n",
      hint: "Put each letter in front of what you have so far: `backwards = ch + backwards`.",
      solution: "word = \"stressed\"\nbackwards = \"\"\nfor ch in word:\n    backwards = ch + backwards",
      tests: [
        ["backwards is desserts", "backwards == \"desserts\""],
      ],
    }),
    task("medium", "Add the digits", {
      prompt: "Set `total` to the sum of the digits in the text `digits`.",
      starter: "digits = \"40217\"\ntotal = 0\n",
      hint: "Each `ch` is a one-character string; convert it with `int(ch)` before adding.",
      solution: "digits = \"40217\"\ntotal = 0\nfor ch in digits:\n    total += int(ch)",
      tests: [
        ["total is 14", "total == 14"],
      ],
    }),
    task("hard", "Capitalise every word", {
      prompt: "Build `result`: the sentence with the first letter of every word in capitals, using a loop over the words (not `title()`).",
      starter: "sentence = \"the quick brown fox\"\nresult = \"\"\n",
      hint: "For each word, add `word[0].upper() + word[1:]` and a space. Strip the last space at the end.",
      solution: "sentence = \"the quick brown fox\"\nresult = \"\"\nfor word in sentence.split():\n    result = result + word[0].upper() + word[1:] + \" \"\nresult = result.strip()",
      tests: [
        ["result is The Quick Brown Fox", "result == \"The Quick Brown Fox\""],
      ],
    }),
    task("hard", "Remove the vowels", {
      prompt: "Build `no_vowels`: `text` without any vowels (small or capital).",
      starter: "text = \"Hello World\"\nno_vowels = \"\"\n",
      hint: "Add a character only `if ch.lower() not in \"aeiou\":`.",
      solution: "text = \"Hello World\"\nno_vowels = \"\"\nfor ch in text:\n    if ch.lower() not in \"aeiou\":\n        no_vowels = no_vowels + ch",
      tests: [
        ["no_vowels is Hll Wrld", "no_vowels == \"Hll Wrld\""],
      ],
    }),
    task("expert", "Caesar cipher", {
      prompt: "Build `secret`: every letter of `message` moved 3 places along the alphabet, wrapping from z back to a (so `x` becomes `a`). Keep spaces as they are. The message is lowercase.",
      starter: "message = \"abc xyz\"\nsecret = \"\"\n",
      hint: "For a letter, its position is `ord(ch) - ord(\"a\")`. Add 3, wrap with `% 26`, and turn it back: `chr((ord(ch) - ord(\"a\") + 3) % 26 + ord(\"a\"))`.",
      solution: "message = \"abc xyz\"\nsecret = \"\"\nfor ch in message:\n    if ch == \" \":\n        secret = secret + \" \"\n    else:\n        secret = secret + chr((ord(ch) - ord(\"a\") + 3) % 26 + ord(\"a\"))",
      tests: [
        ["secret is def abc", "secret == \"def abc\""],
      ],
    }),
    task("expert", "The longest word", {
      prompt: "Set `longest` to the longest word in `sentence` (the first one, if there is a tie), without using `max`.",
      starter: "sentence = \"loops make code wonderful\"\nlongest = \"\"\n",
      hint: "Loop over the words and keep a word when `len(word) > len(longest)`.",
      solution: "sentence = \"loops make code wonderful\"\nlongest = \"\"\nfor word in sentence.split():\n    if len(word) > len(longest):\n        longest = word",
      tests: [
        ["longest is wonderful", "longest == \"wonderful\""],
      ],
    }),
  ],
  questions: [
    mc("How many times does `for ch in \"code\":` run its block?", ["`3`", "`4`", "`5`", "Until it is stopped"], 1, "A `for` loop over a string runs once per character, and \"code\" has 4."),
    mc("In `for word in sentence.split():`, what is `word`?", ["One word of the sentence at a time", "The whole sentence", "The number of words", "The first letter"], 0, "`.split()` gives a list of words, and the loop takes them one at a time."),
    mc("Can a `for` loop over a string run forever?", ["Yes, if you forget to update a counter", "Yes, always", "No: it stops when the items run out", "Only with `split()`"], 2, "A `for` loop goes through the items it was given and stops after the last one."),
    qShort("Which function gives the number (code) of a character, as in 97 for \"a\"? (name only)", "ord", "`ord` gives a character's Unicode code point, and `chr` goes the other way."),
    mc("What is `chr(ord(\"a\") + 1)`?", ["`\"a1\"`", "`98`", "An error", "`\"b\"`"], 3, "`ord(\"a\")` is 97, 97 + 1 is 98, and `chr(98)` is \"b\"."),
    mc("Where do you create the total in the accumulator pattern?", ["Before the loop", "Inside the loop", "After the loop", "In the `for` line"], 0, "The accumulator is created once before the loop, then each round adds to it."),
    mc("What does this build?\n\n```\nresult = \"\"\nfor ch in \"abc\":\n    result = ch + result\n```", ["`\"abc\"`", "`\"cba\"`", "`\"aabbcc\"`", "`\"\"`"], 1, "Each letter is put in front of what was built so far, which reverses the string."),
    mc("What does `for i in range(3):` set `i` to?", ["1, 2 and 3", "3", "0, 1 and 2", "0, 1, 2 and 3"], 2, "`range(3)` counts from 0 and stops before 3."),
    mc("What does `\"e\" in \"aeiou\"` give?", ["`True`", "`False`", "`1`", "An error"], 0, "`in` checks whether \"e\" appears in the string of vowels."),
  ],
})
