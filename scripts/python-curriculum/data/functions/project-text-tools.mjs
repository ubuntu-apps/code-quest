// Functions project: Text tools. Lesson, Try-it snippets, challenges and quiz.
import { makeProject, mc, qShort, snippet, task, typedInput } from '../_builders.mjs'

export default makeProject("easy", {
  id: "proj_text_tools",
  title: "Text tools",
  paragraphs: [
    "Build a small toolbox of text functions, then use them together in a report. Each tool is one short function that does one job and **returns** its answer, which makes it easy to test and to reuse.",
    "The tools: `count_vowels(text)` counts the vowels, `word_count(text)` counts the words, `capitalize_words(text)` capitalises the first letter of every word, and `is_palindrome(text)` says whether the text reads the same backwards, ignoring spaces and capitals. When the user types `never odd or even`, the finished program shows:",
    "```\nText: never odd or even\nWords: 4\nVowels: 6\nTitle: Never Odd Or Even\nPalindrome: yes\n```",
    "Build it one tool at a time, then a `report(text)` function that uses all four and returns the four lines as one string, and finally the program that reads the text and prints the report. Type a sentence in the Input box to try the sandbox.",
  ],
  sandboxCode: "def count_vowels(text):\n    return sum(1 for ch in text.lower() if ch in \"aeiou\")\n\ndef word_count(text):\n    return len(text.split())\n\ntext = input(\"Text: \")\nprint(\"Words:\", word_count(text))\nprint(\"Vowels:\", count_vowels(text))",
  sandboxSnippets: [
    snippet("Count matching letters", "text = \"Hello World\"\nprint(sum(1 for ch in text.lower() if ch in \"aeiou\"))"),
    snippet("Capitalise each word", "words = \"never odd or even\".split()\nprint(\" \".join(w[0].upper() + w[1:] for w in words))"),
    snippet("Letters only", "text = \"Never odd, or even!\"\nletters = [ch for ch in text.lower() if ch.isalpha()]\nprint(\"\".join(letters), letters == letters[::-1])"),
  ],
  challenges: [
    task("easy", "Count the vowels", {
      prompt: "Define `count_vowels(text)` that returns how many vowels (a, e, i, o, u, capitals included) `text` has.",
      hint: "Loop over `text.lower()` and count the letters `in \"aeiou\"`, or use `sum(1 for ch in ... if ...)`.",
      solution: "def count_vowels(text):\n    return sum(1 for ch in text.lower() if ch in \"aeiou\")",
      tests: [
        ["count_vowels(\"Hello World\")", "count_vowels(\"Hello World\") == 3"],
        ["count_vowels(\"AEIOU\")", "count_vowels(\"AEIOU\") == 5"],
        ["count_vowels(\"rhythm\")", "count_vowels(\"rhythm\") == 0"],
      ],
    }),
    task("easy", "Count the words", {
      prompt: "Define `word_count(text)` that returns the number of words in `text`.",
      hint: "`return len(text.split())`. `split()` with no argument ignores extra spaces.",
      solution: "def word_count(text):\n    return len(text.split())",
      tests: [
        ["Four words", "word_count(\"never odd or even\") == 4"],
        ["Extra spaces", "word_count(\"  hello   world \") == 2"],
        ["Empty", "word_count(\"\") == 0"],
      ],
    }),
    task("medium", "Capitalise every word", {
      prompt: "Define `capitalize_words(text)` that returns `text` with the first letter of every word in capitals (not using `title()`).",
      hint: "For each word: `w[0].upper() + w[1:]`. Join them with a space.",
      solution: "def capitalize_words(text):\n    return \" \".join(w[0].upper() + w[1:] for w in text.split())",
      tests: [
        ["capitalize_words(\"never odd or even\")", "capitalize_words(\"never odd or even\") == \"Never Odd Or Even\""],
        ["Keeps the rest of each word", "capitalize_words(\"iPhone and macOS\") == \"IPhone And MacOS\""],
      ],
    }),
    task("medium", "A palindrome?", {
      prompt: "Define `is_palindrome(text)` that returns whether `text` reads the same backwards, looking only at letters and ignoring capitals.",
      hint: "Keep the letters: `[ch for ch in text.lower() if ch.isalpha()]`. Then compare the list with its reverse, `[::-1]`.",
      solution: "def is_palindrome(text):\n    letters = [ch for ch in text.lower() if ch.isalpha()]\n    return letters == letters[::-1]",
      tests: [
        ["never odd or even", "is_palindrome(\"never odd or even\") is True"],
        ["With punctuation", "is_palindrome(\"A man, a plan, a canal: Panama!\") is True"],
        ["Not one", "is_palindrome(\"python\") is False"],
      ],
    }),
    task("hard", "The report", {
      prompt: "The four tools are ready. Define `report(text)` that uses them to **return** four lines as one string, like the lesson: `Words: 4`, `Vowels: 6`, `Title: ...` and `Palindrome: yes` (or `no`).",
      starter: "def count_vowels(text):\n    return sum(1 for ch in text.lower() if ch in \"aeiou\")\n\ndef word_count(text):\n    return len(text.split())\n\ndef capitalize_words(text):\n    return \" \".join(w[0].upper() + w[1:] for w in text.split())\n\ndef is_palindrome(text):\n    letters = [ch for ch in text.lower() if ch.isalpha()]\n    return letters == letters[::-1]\n\n",
      hint: "Build a list of four f-strings, using a conditional expression for yes/no, and return `\"\\n\".join(lines)`.",
      solution: "def count_vowels(text):\n    return sum(1 for ch in text.lower() if ch in \"aeiou\")\n\ndef word_count(text):\n    return len(text.split())\n\ndef capitalize_words(text):\n    return \" \".join(w[0].upper() + w[1:] for w in text.split())\n\ndef is_palindrome(text):\n    letters = [ch for ch in text.lower() if ch.isalpha()]\n    return letters == letters[::-1]\n\ndef report(text):\n    lines = [\n        f\"Words: {word_count(text)}\",\n        f\"Vowels: {count_vowels(text)}\",\n        f\"Title: {capitalize_words(text)}\",\n        f\"Palindrome: {'yes' if is_palindrome(text) else 'no'}\",\n    ]\n    return \"\\n\".join(lines)\n",
      tests: [
        ["report(\"never odd or even\")", "report(\"never odd or even\") == \"Words: 4\\nVowels: 6\\nTitle: Never Odd Or Even\\nPalindrome: yes\""],
        ["report(\"hello there\")", "report(\"hello there\").splitlines() == [\"Words: 2\", \"Vowels: 4\", \"Title: Hello There\", \"Palindrome: no\"]"],
      ],
    }),
    task("hard", "The whole program", {
      prompt: "Ask `Text: `, then print the report for the text typed. The check types `Was it a car or a cat I saw`.",
      starter: "def count_vowels(text):\n    return sum(1 for ch in text.lower() if ch in \"aeiou\")\n\ndef word_count(text):\n    return len(text.split())\n\ndef capitalize_words(text):\n    return \" \".join(w[0].upper() + w[1:] for w in text.split())\n\ndef is_palindrome(text):\n    letters = [ch for ch in text.lower() if ch.isalpha()]\n    return letters == letters[::-1]\n\ndef report(text):\n    lines = [\n        f\"Words: {word_count(text)}\",\n        f\"Vowels: {count_vowels(text)}\",\n        f\"Title: {capitalize_words(text)}\",\n        f\"Palindrome: {'yes' if is_palindrome(text) else 'no'}\",\n    ]\n    return \"\\n\".join(lines)\n\n",
      hint: "Two lines: `text = input(\"Text: \")` and `print(report(text))`.",
      solution: "def count_vowels(text):\n    return sum(1 for ch in text.lower() if ch in \"aeiou\")\n\ndef word_count(text):\n    return len(text.split())\n\ndef capitalize_words(text):\n    return \" \".join(w[0].upper() + w[1:] for w in text.split())\n\ndef is_palindrome(text):\n    letters = [ch for ch in text.lower() if ch.isalpha()]\n    return letters == letters[::-1]\n\ndef report(text):\n    lines = [\n        f\"Words: {word_count(text)}\",\n        f\"Vowels: {count_vowels(text)}\",\n        f\"Title: {capitalize_words(text)}\",\n        f\"Palindrome: {'yes' if is_palindrome(text) else 'no'}\",\n    ]\n    return \"\\n\".join(lines)\n\ntext = input(\"Text: \")\nprint(report(text))",
      setup: typedInput("Was it a car or a cat I saw"),
      tests: [
        ["Prints the report", "_cq_stdout.strip().splitlines()[1:] == [\"Words: 9\", \"Vowels: 9\", \"Title: Was It A Car Or A Cat I Saw\", \"Palindrome: yes\"]"],
      ],
    }),
  ],
  questions: [
    mc("Why does each tool **return** its answer instead of printing it?", ["Printing is not allowed in functions", "So other code, like `report`, can use the answer", "It is faster", "Returning prints it too"], 1),
    mc("What does `\"  hello   world \".split()` give?", ["`[\"\", \"hello\", \"\", \"world\", \"\"]`", "`[\"hello world\"]`", "`[\"hello\", \"world\"]`", "An error"], 2),
    mc("What does `ch.isalpha()` check?", ["Whether `ch` is a letter", "Whether `ch` is a capital", "Whether `ch` is a vowel", "Whether `ch` is a digit"], 0),
    mc("Why build `report` out of the four tools?", ["It is required", "To make the program longer", "Each tool is then tested once and reused, not rewritten", "Tools can only be used inside other functions"], 2),
    qShort("What is `\"Odd\"[0].upper() + \"odd\"[1:]`?", "Odd"),
    mc("What does `\"\\n\".join([\"a\", \"b\"])` give?", ["`\"a\\nb\"`: two lines", "`\"ab\"`", "`[\"a\", \"b\"]`", "`\"a b\"`"], 0),
  ],
})
