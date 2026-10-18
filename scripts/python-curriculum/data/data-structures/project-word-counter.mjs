// Data structures project: Word counter. Lesson, Try-it snippets, challenges and quiz.
import { makeProject, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeProject("medium", {
  id: "proj_word_counter",
  title: "Word counter",
  paragraphs: [
    "Build a word counter: give it some text and it reports how many words there are, how many different ones, and which words are used most. It's the kind of program behind word clouds and search engines, and it uses lists, sets, dicts, sorting and comprehensions.",
    "Words need cleaning before they can be counted: `Data`, `data,` and `data.` should all count as the same word. Make every word lowercase and `strip` the punctuation off its ends with `w.strip(\".,!?:\")`.",
    "For the text in this project, the finished report is:",
    "```\nWords: 23\nDifferent: 15\ndata: 5\ncode: 4\nkeeps: 2\n```",
    "The plan: clean the words into a list, count them all with `len`, count the different ones with a set, count each word in a dict, and sort the dict's keys by their counts to find the top three.",
    "Build it in steps; the last challenge puts everything together.",
  ],
  sandboxCode: "text = \"The cat and the hat. The end!\"\nwords = [w.strip(\".,!?\") for w in text.lower().split()]\nprint(words)\nprint(len(words), len(set(words)))\ncounts = {}\nfor w in words:\n    counts[w] = counts.get(w, 0) + 1\nprint(sorted(counts, key=counts.get, reverse=True)[:2])",
  sandboxSnippets: [
    snippet("Clean a word", "print(\"Data,\".lower().strip(\".,!?\"))\nprint(\"wins!\".strip(\".,!?\"))"),
    snippet("Count with a dict", "counts = {}\nfor w in [\"a\", \"b\", \"a\"]:\n    counts[w] = counts.get(w, 0) + 1\nprint(counts)"),
    snippet("Top words", "counts = {\"a\": 3, \"b\": 1, \"c\": 2}\nprint(sorted(counts, key=counts.get, reverse=True)[:2])"),
  ],
  challenges: [
    task("easy", "Clean a word", {
      prompt: "Set `clean` to `word` in lowercase without the punctuation at its end.",
      starter: "word = \"Code.\"\n",
      hint: "Chain the methods: `word.lower().strip(\".,!?:\")`.",
      solution: "word = \"Code.\"\nclean = word.lower().strip(\".,!?:\")",
      tests: [
        ["clean is code", "clean == \"code\""],
      ],
    }),
    task("easy", "All the words", {
      prompt: "Set `words` to a list of every word in `text`, lowercase and without punctuation, using a list comprehension.",
      starter: "text = \"Tidy data keeps code simple. Fresh data keeps old data useful, and code saves time! Data first, then code: data grows, code follows.\"\n",
      hint: "Split the lowercase text, and strip each piece: `[w.strip(\".,!?:\") for w in text.lower().split()]`.",
      solution: "text = \"Tidy data keeps code simple. Fresh data keeps old data useful, and code saves time! Data first, then code: data grows, code follows.\"\nwords = [w.strip(\".,!?:\") for w in text.lower().split()]\n",
      tests: [
        ["words starts right", "words[:5] == [\"tidy\", \"data\", \"keeps\", \"code\", \"simple\"]"],
        ["There are 23 words", "len(words) == 23"],
        ["No punctuation is left", "all(w.isalpha() for w in words)"],
      ],
    }),
    task("medium", "How many?", {
      prompt: "Set `total` to the number of words and `different` to the number of different words.",
      starter: "text = \"Tidy data keeps code simple. Fresh data keeps old data useful, and code saves time! Data first, then code: data grows, code follows.\"\nwords = [w.strip(\".,!?:\") for w in text.lower().split()]\n",
      hint: "`len(words)` counts them all; a set keeps one of each: `len(set(words))`.",
      solution: "text = \"Tidy data keeps code simple. Fresh data keeps old data useful, and code saves time! Data first, then code: data grows, code follows.\"\nwords = [w.strip(\".,!?:\") for w in text.lower().split()]\ntotal = len(words)\ndifferent = len(set(words))",
      tests: [
        ["total is 23", "total == 23"],
        ["different is 15", "different == 15"],
      ],
    }),
    task("medium", "Count every word", {
      prompt: "Build `counts`: a dict mapping each word to how often it appears.",
      starter: "text = \"Tidy data keeps code simple. Fresh data keeps old data useful, and code saves time! Data first, then code: data grows, code follows.\"\nwords = [w.strip(\".,!?:\") for w in text.lower().split()]\n",
      hint: "Start with `counts = {}`. For each word: `counts[w] = counts.get(w, 0) + 1`.",
      solution: "text = \"Tidy data keeps code simple. Fresh data keeps old data useful, and code saves time! Data first, then code: data grows, code follows.\"\nwords = [w.strip(\".,!?:\") for w in text.lower().split()]\ncounts = {}\nfor w in words:\n    counts[w] = counts.get(w, 0) + 1\n",
      tests: [
        ["data appears 5 times", "counts[\"data\"] == 5"],
        ["code appears 4 times", "counts[\"code\"] == 4"],
        ["15 different words", "len(counts) == 15"],
      ],
    }),
    task("hard", "The top three", {
      prompt: "Set `top3` to the three most used words, most used first.",
      starter: "text = \"Tidy data keeps code simple. Fresh data keeps old data useful, and code saves time! Data first, then code: data grows, code follows.\"\nwords = [w.strip(\".,!?:\") for w in text.lower().split()]\ncounts = {}\nfor w in words:\n    counts[w] = counts.get(w, 0) + 1\n",
      hint: "Sort the keys by their counts, highest first, and slice: `sorted(counts, key=counts.get, reverse=True)[:3]`.",
      solution: "text = \"Tidy data keeps code simple. Fresh data keeps old data useful, and code saves time! Data first, then code: data grows, code follows.\"\nwords = [w.strip(\".,!?:\") for w in text.lower().split()]\ncounts = {}\nfor w in words:\n    counts[w] = counts.get(w, 0) + 1\ntop3 = sorted(counts, key=counts.get, reverse=True)[:3]",
      tests: [
        ["top3 is right", "top3 == [\"data\", \"code\", \"keeps\"]"],
      ],
    }),
    task("expert", "The report", {
      prompt: "Put it all together and print the report from the lesson: `Words: 23`, `Different: 15`, then the top three words with their counts, like `data: 5`.",
      starter: "text = \"Tidy data keeps code simple. Fresh data keeps old data useful, and code saves time! Data first, then code: data grows, code follows.\"\n",
      hint: "Clean the words, count them, find the top three, then print two summary lines and loop over the top three.",
      solution: "text = \"Tidy data keeps code simple. Fresh data keeps old data useful, and code saves time! Data first, then code: data grows, code follows.\"\nwords = [w.strip(\".,!?:\") for w in text.lower().split()]\ncounts = {}\nfor w in words:\n    counts[w] = counts.get(w, 0) + 1\nprint(f\"Words: {len(words)}\")\nprint(f\"Different: {len(counts)}\")\nfor w in sorted(counts, key=counts.get, reverse=True)[:3]:\n    print(f\"{w}: {counts[w]}\")",
      tests: [
        ["Prints the report", "_cq_stdout.strip().splitlines() == [\"Words: 23\", \"Different: 15\", \"data: 5\", \"code: 4\", \"keeps: 2\"]"],
      ],
    }),
  ],
  questions: [
    mc("Why make every word lowercase first?", ["It is faster", "So `Data` and `data` count as the same word", "Sets need lowercase", "To remove punctuation"], 1),
    mc("What does `\"wins!\".strip(\".,!?\")` give?", ["`\"wins\"`", "`\"wins!\"`", "`\"!\"`", "`\"\"`"], 0),
    mc("Which counts the different words in `words`?", ["`len(words)`", "`words.count()`", "`len(set(words))`", "`sorted(words)`"], 2),
    mc("What does `counts.get(w, 0) + 1` do for a new word?", ["Raises a `KeyError`", "Gives 0", "Adds the word twice", "Gives 1, its first count"], 3),
    qShort("What is `len(set([\"data\", \"code\", \"data\"]))`? (a number)", "2"),
    mc("Why would ties make \"the top three\" unclear?", ["Ties raise errors", "Words with equal counts could come in either order", "Dicts can't hold equal values", "They can't happen"], 1),
  ],
})
