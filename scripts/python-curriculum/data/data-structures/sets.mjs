// Data structures topic: Sets. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "sets",
  title: "Sets",
  paragraphs: [
    "A **set** is a collection of **unique** items, written in curly braces: `{\"red\", \"green\", \"blue\"}`. A set never holds the same item twice, so turning a list into a set throws the duplicates away. `len(set(items))` tells you how many different items a list has.",
    "```\nvisits = [\"home\", \"shop\", \"home\", \"park\", \"shop\"]\nplaces = set(visits)\nprint(len(visits), len(places))   # 5 3\nprint(\"park\" in places)           # True\n```",
    "An empty set is `set()`, because `{}` makes an empty dictionary. `add(x)` puts an item in (adding one that's already there changes nothing). `remove(x)` takes it out and raises a `KeyError` if it isn't there; `discard(x)` does the same without complaining.",
    "Sets have **no order**, so there's no indexing: `places[0]` raises a `TypeError`, and a printed set may show its items in any order. When you need them in order, `sorted(places)` gives you a sorted list.",
    "Their superpower is speed. `x in some_set` is answered instantly, even with millions of items, while `x in some_list` has to look through the items one by one. Use a set whenever you keep asking \"have I seen this before?\".",
    "Sets also do the maths of groups. With two sets `a` and `b`: `a | b` (union) is everything in either, `a & b` (intersection) is what's in both, `a - b` (difference) is what's in `a` but not `b`, and `a ^ b` is what's in exactly one of them. The methods `union`, `intersection` and `difference` do the same and also accept lists.",
    "```\nana = {\"chess\", \"films\", \"running\"}\nben = {\"films\", \"cooking\", \"chess\"}\nprint(sorted(ana & ben))   # ['chess', 'films']\nprint(sorted(ana - ben))   # ['running']\nprint(len(ana | ben))      # 4\n```",
    "`a <= b` asks whether every item of `a` is also in `b` (a **subset**), and `a.isdisjoint(b)` whether they have nothing in common. Like dict keys, set items must be values that can't change: numbers, strings and tuples, but not lists.",
  ],
  sandboxCode: "visits = [\"home\", \"shop\", \"home\", \"park\", \"shop\"]\nplaces = set(visits)\nprint(len(places), sorted(places))\n\nana = {\"chess\", \"films\", \"running\"}\nben = {\"films\", \"cooking\", \"chess\"}\nprint(\"Both:\", sorted(ana & ben))\nprint(\"Only Ana:\", sorted(ana - ben))\nprint(\"Either:\", sorted(ana | ben))",
  sandboxSnippets: [
    snippet("Duplicates disappear", "numbers = [3, 1, 3, 2, 1, 3]\nprint(set(numbers), len(set(numbers)))"),
    snippet("add, remove and discard", "tags = {\"news\", \"draft\"}\ntags.add(\"python\")\ntags.discard(\"draft\")\ntags.discard(\"missing\")\nprint(sorted(tags))"),
    snippet("An empty set", "print(type({}), type(set()))"),
    snippet("Set maths", "a = {1, 2, 3, 4}\nb = {3, 4, 5}\nprint(a | b, a & b, a - b, a ^ b)"),
    snippet("Subsets", "needed = {\"passport\", \"tickets\"}\npacked = {\"passport\", \"tickets\", \"charger\"}\nprint(needed <= packed)"),
  ],
  readMore: { label: "Python tutorial: sets", url: "https://docs.python.org/3/tutorial/datastructures.html#sets", source: "Python docs" },
  challenges: [
    task("easy", "The vowels", {
      prompt: "Create a set `vowels` holding the letters a, e, i, o and u.",
      hint: "Curly braces with the letters as strings: `{\"a\", \"e\", ...}`.",
      solution: "vowels = {\"a\", \"e\", \"i\", \"o\", \"u\"}",
      tests: [
        ["vowels is right", "vowels == {\"a\", \"e\", \"i\", \"o\", \"u\"} and isinstance(vowels, set)"],
      ],
    }),
    task("easy", "Drop the duplicates", {
      prompt: "Set `unique` to a set of the numbers in `numbers`, without duplicates.",
      starter: "numbers = [3, 1, 3, 2, 1, 3]\n",
      hint: "`set(numbers)` keeps one of each.",
      solution: "numbers = [3, 1, 3, 2, 1, 3]\nunique = set(numbers)",
      tests: [
        ["unique is {1, 2, 3}", "unique == {1, 2, 3}"],
      ],
    }),
    task("easy", "How many different?", {
      prompt: "Set `different` to how many different people are in `visitors`.",
      starter: "visitors = [\"Ana\", \"Ben\", \"Ana\", \"Cleo\", \"Ben\", \"Ana\"]\n",
      hint: "Turn the list into a set, then count: `len(set(visitors))`.",
      solution: "visitors = [\"Ana\", \"Ben\", \"Ana\", \"Cleo\", \"Ben\", \"Ana\"]\ndifferent = len(set(visitors))",
      tests: [
        ["different is 3", "different == 3"],
      ],
    }),
    task("medium", "Update the tags", {
      prompt: "Add `python` to `tags` and take `draft` out. Use `discard`, so it would also work if `draft` weren't there.",
      starter: "tags = {\"news\", \"draft\"}\n",
      hint: "`tags.add(\"python\")` and `tags.discard(\"draft\")`.",
      solution: "tags = {\"news\", \"draft\"}\ntags.add(\"python\")\ntags.discard(\"draft\")",
      tests: [
        ["tags is right", "tags == {\"news\", \"python\"}"],
      ],
    }),
    task("medium", "Shared hobbies", {
      prompt: "Set `shared` to the hobbies that Ana and Ben both have.",
      starter: "ana = {\"chess\", \"films\", \"running\"}\nben = {\"films\", \"cooking\", \"chess\"}\n",
      hint: "The intersection: `ana & ben`.",
      solution: "ana = {\"chess\", \"films\", \"running\"}\nben = {\"films\", \"cooking\", \"chess\"}\nshared = ana & ben",
      tests: [
        ["shared is right", "shared == {\"chess\", \"films\"}"],
      ],
    }),
    task("medium", "Only Ana", {
      prompt: "Set `only_ana` to the hobbies Ana has and Ben doesn't.",
      starter: "ana = {\"chess\", \"films\", \"running\"}\nben = {\"films\", \"cooking\", \"chess\"}\n",
      hint: "The difference: `ana - ben`.",
      solution: "ana = {\"chess\", \"films\", \"running\"}\nben = {\"films\", \"cooking\", \"chess\"}\nonly_ana = ana - ben",
      tests: [
        ["only_ana is right", "only_ana == {\"running\"}"],
      ],
    }),
    task("medium", "All packed, nothing clashing", {
      prompt: "Set `ready` to whether every item in `required` is in `packed`, and `safe` to whether `menu` has nothing in common with `allergies`. Use `<=` and `isdisjoint`.",
      starter: "required = {\"passport\", \"tickets\", \"charger\"}\npacked = {\"tickets\", \"snacks\", \"passport\", \"charger\"}\nallergies = {\"nuts\"}\nmenu = {\"bread\", \"nuts\", \"soup\"}\n",
      hint: "`required <= packed` asks whether `required` is a subset of `packed`; `allergies.isdisjoint(menu)` is `True` when they share nothing.",
      solution: "required = {\"passport\", \"tickets\", \"charger\"}\npacked = {\"tickets\", \"snacks\", \"passport\", \"charger\"}\nallergies = {\"nuts\"}\nmenu = {\"bread\", \"nuts\", \"soup\"}\nready = required <= packed\nsafe = allergies.isdisjoint(menu)",
      tests: [
        ["ready is True", "ready is True"],
        ["safe is False", "safe is False"],
      ],
    }),
    task("hard", "Letters used", {
      prompt: "Set `letters` to a sorted list of the different letters in `word`.",
      starter: "word = \"mississippi\"\n",
      hint: "Make a set of the word, then sort it: `sorted(set(word))` gives a list.",
      solution: "word = \"mississippi\"\nletters = sorted(set(word))",
      tests: [
        ["letters is right", "letters == [\"i\", \"m\", \"p\", \"s\"]"],
      ],
    }),
    task("hard", "Forgot something?", {
      prompt: "Set `missing` to the set of things in `needed` that aren't in the `packed` list.",
      starter: "needed = {\"passport\", \"tickets\", \"charger\", \"socks\"}\npacked = [\"socks\", \"book\", \"passport\"]\n",
      hint: "Turn `packed` into a set, then subtract: `needed - set(packed)`.",
      solution: "needed = {\"passport\", \"tickets\", \"charger\", \"socks\"}\npacked = [\"socks\", \"book\", \"passport\"]\nmissing = needed - set(packed)",
      tests: [
        ["missing is right", "missing == {\"tickets\", \"charger\"}"],
      ],
    }),
    task("expert", "Every letter?", {
      prompt: "A pangram uses every letter of the alphabet. Set `is_pangram` for `sentence`, using sets.",
      starter: "sentence = \"The quick brown fox jumps over the lazy dog\"\nalphabet = \"abcdefghijklmnopqrstuvwxyz\"\n",
      hint: "Every letter of the alphabet must be in the sentence: `set(alphabet) <= set(sentence.lower())`.",
      solution: "sentence = \"The quick brown fox jumps over the lazy dog\"\nalphabet = \"abcdefghijklmnopqrstuvwxyz\"\nis_pangram = set(alphabet) <= set(sentence.lower())",
      tests: [
        ["is_pangram is True", "is_pangram is True"],
      ],
    }),
    task("expert", "The first repeat", {
      prompt: "Set `first_repeat` to the first word in `text` that has already appeared earlier. Keep the words seen so far in a set.",
      starter: "text = \"one two three two one four\"\n",
      hint: "Start with `seen = set()`. For each word: if it is `in seen`, store it and `break`; otherwise `seen.add(word)`.",
      solution: "text = \"one two three two one four\"\nseen = set()\nfirst_repeat = None\nfor word in text.split():\n    if word in seen:\n        first_repeat = word\n        break\n    seen.add(word)",
      tests: [
        ["first_repeat is two", "first_repeat == \"two\""],
      ],
    }),
  ],
  questions: [
    mc("What is `len({1, 2, 2, 3, 3, 3})`?", ["`6`", "`1`", "`3`", "`2`"], 2, "A set keeps only one copy of each value, so it holds 1, 2 and 3."),
    mc("How do you make an empty set?", ["`set()`", "`{}`", "`[]`", "`()`"], 0, "`{}` makes an empty dictionary, so an empty set needs `set()`."),
    mc("Why does `places[0]` fail on a set?", ["The set is empty", "Sets start at index 1", "Sets can only hold numbers", "Sets have no order, so no indexes"], 3, "Sets have no order, so their items have no positions to index."),
    mc("With `a = {1, 2, 3}` and `b = {2, 3, 4}`, what is `a & b`?", ["`{1, 2, 3, 4}`", "`{2, 3}`", "`{1}`", "`{1, 4}`"], 1, "`&` is the intersection: the items in both sets."),
    mc("With `a = {1, 2, 3}` and `b = {2, 3, 4}`, what is `a - b`?", ["`{1}`", "`{4}`", "`{2, 3}`", "`{1, 4}`"], 0, "`-` is the difference: the items in `a` that are not in `b`."),
    qShort("Which set method removes an item without an error if it is missing? (name only)", "discard", "`discard` removes the item if it is there; `remove` raises a `KeyError` if it isn't."),
    mc("Why use a set for \"have I seen this before?\"", ["Sets keep things in order", "Sets can hold lists", "Sets are printed nicely", "Checking `in` a set is very fast"], 3, "Sets use hashing, so `in` takes about the same time however big the set is."),
    mc("What does `{\"a\", \"b\"} <= {\"a\", \"b\", \"c\"}` give?", ["`False`", "An error", "`True`", "`{\"c\"}`"], 2, "`<=` checks for a subset: every item on the left is also on the right."),
    mc("Which gives the items in exactly one of `a` and `b`?", ["`a | b`", "`a ^ b`", "`a & b`", "`a <= b`"], 1, "`^` is the symmetric difference: items in one set or the other, but not both."),
    mc("What does `sorted({\"b\", \"a\"})` return?", ["`[\"a\", \"b\"]`", "`{\"a\", \"b\"}`", "`(\"a\", \"b\")`", "`\"ab\"`"], 0, "`sorted` works on any iterable and always returns a new list."),
  ],
})
