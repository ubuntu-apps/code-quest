// Data structures topic: Lists. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "lists",
  title: "Lists",
  paragraphs: [
    "So far each variable has held one value. A **list** holds many, in order: write the items in square brackets, separated by commas. A list can hold any kind of value, even a mix, and `[]` is an empty list. `len()` counts the items, just as it counts the characters of a string.",
    "```\nscores = [90, 75, 88]\nnames = [\"Ana\", \"Ben\", \"Cleo\"]\nempty = []\nprint(len(scores), names)   # 3 ['Ana', 'Ben', 'Cleo']\n```",
    "Indexing works as it does for strings: `scores[0]` is the first item, `scores[-1]` the last, and an index past the end raises an `IndexError`. The big difference is that lists are **mutable**: you can change them in place. `scores[1] = 80` replaces the second item.",
    "**Adding items.** `append(x)` adds `x` to the end, and `insert(i, x)` puts it at index `i`, moving the rest along. `extend(other)` adds every item of another list. `+` joins two lists into a new one, and `*` repeats a list: `[0] * 3` is `[0, 0, 0]`.",
    "```\nshopping = [\"milk\", \"eggs\"]\nshopping.append(\"bread\")\nshopping.insert(0, \"tea\")\nprint(shopping)   # ['tea', 'milk', 'eggs', 'bread']\n```",
    "**Removing items.** `pop()` removes the last item and returns it, so you can keep it: `last = shopping.pop()`. `pop(i)` does the same for index `i`. `remove(x)` removes the first item equal to `x`, and raises a `ValueError` if there isn't one. `del shopping[0]` deletes by index, and `clear()` empties the list.",
    "**Searching and summing.** `x in lst` checks whether `x` is in the list, `lst.index(x)` gives its position and `lst.count(x)` how often it appears. For lists of numbers, `sum()`, `min()` and `max()` do what they say, so the average is `sum(scores) / len(scores)`.",
    "**Sorting.** `lst.sort()` sorts the list in place, and `lst.sort(reverse=True)` sorts it from high to low. `sorted(lst)` leaves the list alone and returns a new, sorted one. A classic bug is `lst = lst.sort()`: `sort()` changes the list and returns `None`, so the list is lost. `lst.reverse()` flips the order in place.",
    "**Two names, one list.** `b = a` does not copy a list; it gives the same list a second name, so a change made through `b` shows up in `a` too. To get an independent copy, use `a.copy()` (or `list(a)`).",
    "```\na = [1, 2, 3]\nb = a          # the same list\nc = a.copy()   # a new list\na.append(4)\nprint(b, c)    # [1, 2, 3, 4] [1, 2, 3]\n```",
  ],
  sandboxCode: "scores = [90, 75, 88]\nscores.append(62)\nscores[1] = 80\nprint(scores, len(scores))\nprint(sum(scores) / len(scores), max(scores))\nprint(sorted(scores), sorted(scores, reverse=True))\nlast = scores.pop()\nprint(last, scores)",
  sandboxSnippets: [
    snippet("Make and change a list", "pets = [\"cat\", \"dog\"]\npets.append(\"fish\")\npets[0] = \"rabbit\"\nprint(pets, len(pets))"),
    snippet("pop and remove", "todo = [\"wash\", \"shop\", \"cook\", \"read\"]\ndone = todo.pop()\ntodo.remove(\"shop\")\nprint(done, todo)"),
    snippet("sum, min and max", "temps = [18, 21, 17, 25]\nprint(sum(temps), min(temps), max(temps))\nprint(sum(temps) / len(temps))"),
    snippet("sort or sorted?", "nums = [3, 1, 2]\nprint(sorted(nums), nums)\nnums.sort()\nprint(nums)\nprint(nums.sort())"),
    snippet("A copy or the same list?", "a = [1, 2]\nb = a\nc = a.copy()\nb.append(3)\nprint(a, b, c)"),
  ],
  readMore: { label: "Python tutorial: more on lists", url: "https://docs.python.org/3/tutorial/datastructures.html#more-on-lists", source: "Python docs" },
  challenges: [
    task("easy", "Make a list", {
      prompt: "Create a list `colours` holding `red`, `green` and `blue`, in that order.",
      hint: "Square brackets, with the strings separated by commas: `colours = [\"red\", ...]`.",
      solution: "colours = [\"red\", \"green\", \"blue\"]",
      tests: [
        ["colours is right", "colours == [\"red\", \"green\", \"blue\"]"],
      ],
    }),
    task("easy", "First and last", {
      prompt: "Set `first` to the first score and `last` to the last one.",
      starter: "scores = [72, 95, 88, 61]\n",
      hint: "Index 0 is the first item and -1 the last: `scores[0]` and `scores[-1]`.",
      solution: "scores = [72, 95, 88, 61]\nfirst = scores[0]\nlast = scores[-1]",
      tests: [
        ["first is 72", "first == 72"],
        ["last is 61", "last == 61"],
      ],
    }),
    task("easy", "Add to the end", {
      prompt: "Add `milk` to the end of `shopping`.",
      starter: "shopping = [\"eggs\", \"bread\"]\n",
      hint: "`shopping.append(\"milk\")`.",
      solution: "shopping = [\"eggs\", \"bread\"]\nshopping.append(\"milk\")",
      tests: [
        ["shopping ends with milk", "shopping == [\"eggs\", \"bread\", \"milk\"]"],
      ],
    }),
    task("medium", "Swap an item", {
      prompt: "Replace `pear` (the second fruit) with `kiwi`, using its index.",
      starter: "fruit = [\"apple\", \"pear\", \"plum\"]\n",
      hint: "The second item has index 1: `fruit[1] = \"kiwi\"`.",
      solution: "fruit = [\"apple\", \"pear\", \"plum\"]\nfruit[1] = \"kiwi\"",
      tests: [
        ["fruit is right", "fruit == [\"apple\", \"kiwi\", \"plum\"]"],
      ],
    }),
    task("medium", "Jump the queue", {
      prompt: "`vip` goes to the front of `queue`, and the late arrivals in `late` join at the back. Use `insert` and `extend`.",
      starter: "queue = [\"Ben\", \"Cleo\"]\nvip = \"Ana\"\nlate = [\"Dev\", \"Eli\"]\n",
      hint: "`queue.insert(0, vip)` puts Ana at index 0; `queue.extend(late)` adds every item of `late` at the end.",
      solution: "queue = [\"Ben\", \"Cleo\"]\nvip = \"Ana\"\nlate = [\"Dev\", \"Eli\"]\nqueue.insert(0, vip)\nqueue.extend(late)",
      tests: [
        ["queue is right", "queue == [\"Ana\", \"Ben\", \"Cleo\", \"Dev\", \"Eli\"]"],
      ],
    }),
    task("medium", "Clean the inbox", {
      prompt: "Remove `spam` from `inbox`, then take the last message off the list with `pop` and store it in `latest`.",
      starter: "inbox = [\"hi\", \"spam\", \"meeting\", \"lunch?\"]\n",
      hint: "`inbox.remove(\"spam\")` removes by value; `latest = inbox.pop()` removes the last item and returns it.",
      solution: "inbox = [\"hi\", \"spam\", \"meeting\", \"lunch?\"]\ninbox.remove(\"spam\")\nlatest = inbox.pop()",
      tests: [
        ["latest is lunch?", "latest == \"lunch?\""],
        ["inbox is right", "inbox == [\"hi\", \"meeting\"]"],
      ],
    }),
    task("medium", "Temperature stats", {
      prompt: "Set `highest`, `lowest` and `average` for `temps`.",
      starter: "temps = [18, 21, 17, 25, 19]\n",
      hint: "`max(temps)`, `min(temps)`, and `sum(temps) / len(temps)` for the average.",
      solution: "temps = [18, 21, 17, 25, 19]\nhighest = max(temps)\nlowest = min(temps)\naverage = sum(temps) / len(temps)",
      tests: [
        ["highest is 25", "highest == 25"],
        ["lowest is 17", "lowest == 17"],
        ["average is 20.0", "average == 20.0"],
      ],
    }),
    task("hard", "A ranking", {
      prompt: "Set `ranked` to the scores from high to low, without changing `scores` itself.",
      starter: "scores = [72, 95, 88, 61]\n",
      hint: "`sorted()` returns a new list and leaves the old one alone. Pass `reverse=True` for high to low.",
      solution: "scores = [72, 95, 88, 61]\nranked = sorted(scores, reverse=True)",
      tests: [
        ["ranked is high to low", "ranked == [95, 88, 72, 61]"],
        ["scores is unchanged", "scores == [72, 95, 88, 61]"],
      ],
    }),
    task("hard", "Fix the sort", {
      prompt: "`names` should be sorted alphabetically, but after this line it is `None`. Fix it.",
      starter: "names = [\"Cleo\", \"Ana\", \"Ben\"]\nnames = names.sort()\n",
      hint: "`sort()` changes the list in place and returns `None`. Call it on its own line, without `names =`.",
      solution: "names = [\"Cleo\", \"Ana\", \"Ben\"]\nnames.sort()",
      tests: [
        ["names is sorted", "names == [\"Ana\", \"Ben\", \"Cleo\"]"],
      ],
    }),
    task("hard", "Where and how often", {
      prompt: "Set `first_rain` to the position of the first `rain` in `weather`, and `rainy_days` to how many days were `rain`. If there was no rain at all, `first_rain` should be `None`.",
      starter: "weather = [\"sun\", \"cloud\", \"rain\", \"sun\", \"rain\"]\n",
      hint: "`weather.count(\"rain\")` counts. `weather.index(\"rain\")` finds the first one, but raises `ValueError` when it isn't there, so check `\"rain\" in weather` first.",
      solution: "weather = [\"sun\", \"cloud\", \"rain\", \"sun\", \"rain\"]\nrainy_days = weather.count(\"rain\")\nif \"rain\" in weather:\n    first_rain = weather.index(\"rain\")\nelse:\n    first_rain = None",
      tests: [
        ["first_rain is 2", "first_rain == 2"],
        ["rainy_days is 2", "rainy_days == 2"],
      ],
    }),
    task("expert", "A real backup", {
      prompt: "`backup` should keep the playlist as it was before the new song was added, but it changes too. Fix it.",
      starter: "playlist = [\"Song A\", \"Song B\", \"Song C\"]\nbackup = playlist\nplaylist.append(\"Song D\")\n",
      hint: "`backup = playlist` gives the same list a second name. Make a copy instead: `backup = playlist.copy()`.",
      solution: "playlist = [\"Song A\", \"Song B\", \"Song C\"]\nbackup = playlist.copy()\nplaylist.append(\"Song D\")",
      tests: [
        ["playlist has 4 songs", "playlist == [\"Song A\", \"Song B\", \"Song C\", \"Song D\"]"],
        ["backup still has 3", "backup == [\"Song A\", \"Song B\", \"Song C\"]"],
      ],
    }),
    task("expert", "No duplicates", {
      prompt: "Build `unique`: the items of `visits` without repeats, in the order they first appear.",
      starter: "visits = [\"home\", \"shop\", \"home\", \"park\", \"shop\", \"home\"]\n",
      hint: "Start with `unique = []`. Loop over `visits` and `append` each item only `if item not in unique`.",
      solution: "visits = [\"home\", \"shop\", \"home\", \"park\", \"shop\", \"home\"]\nunique = []\nfor item in visits:\n    if item not in unique:\n        unique.append(item)",
      tests: [
        ["unique is right", "unique == [\"home\", \"shop\", \"park\"]"],
      ],
    }),
  ],
  questions: [
    mc("What is `[10, 20, 30][1]`?", ["`10`", "`20`", "`30`", "An error"], 1),
    mc("What does `nums.append(4)` do?", ["Adds 4 to the start", "Replaces the last item with 4", "Adds 4 to the end", "Returns a new list"], 2),
    mc("Which is true of lists but not of strings?", ["They are mutable: you can change items in place", "They have a length", "They can be indexed", "They can be looped over"], 0),
    mc("What does `pop()` return?", ["Nothing", "The whole list", "The first item", "The item it removed"], 3),
    qShort("What is `len([4, 8, 15, 16])`? (a number)", "4"),
    mc("After `lst = [3, 1, 2]` and `lst = lst.sort()`, what is `lst`?", ["`[1, 2, 3]`", "`None`", "`[3, 1, 2]`", "An error"], 1),
    mc("What is the difference between `sort()` and `sorted()`?", ["None", "`sorted()` only works on numbers", "`sort()` changes the list; `sorted()` returns a new one", "`sort()` returns a new list"], 2),
    mc("After `a = [1, 2]`, `b = a` and `b.append(3)`, what is `a`?", ["`[1, 2, 3]`", "`[1, 2]`", "`[3]`", "An error"], 0),
    mc("What does `[1, 2].remove(5)` do?", ["Nothing", "Removes the last item", "Returns `None`", "Raises a `ValueError`"], 3),
    mc("What is `[0] * 3`?", ["`[0]`", "`[0, 0, 0]`", "`0`", "`[3]`"], 1),
  ],
})
