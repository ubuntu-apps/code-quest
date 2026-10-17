// Data structures topic: Indexing and slicing. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "slicing_indexing",
  title: "Indexing and slicing",
  paragraphs: [
    "In Fundamentals you sliced strings. Lists use exactly the same indexes and slices, so it's worth knowing them well. Each item has two indexes: one counting from the start (from 0) and one counting from the end (from -1).",
    "```\nletters = [\"a\", \"b\", \"c\", \"d\", \"e\"]\n# index:     0    1    2    3    4\n# from end: -5   -4   -3   -2   -1\nprint(letters[1], letters[-2])   # b d\n```",
    "A **slice** `lst[start:stop]` gives a new list with the items from `start` up to, but not including, `stop`. Leave out `start` to begin at the start, and `stop` to go to the end. Some slices are worth remembering: `lst[:3]` is the first three items, `lst[-3:]` the last three, `lst[1:]` everything but the first, and `lst[:-1]` everything but the last.",
    "```\nletters = [\"a\", \"b\", \"c\", \"d\", \"e\"]\nprint(letters[1:4])   # ['b', 'c', 'd']\nprint(letters[:2])    # ['a', 'b']\nprint(letters[-2:])   # ['d', 'e']\n```",
    "A third number sets the **step**: `lst[::2]` takes every other item, and `lst[1::2]` every other item starting from the second. A negative step goes backwards, so `lst[::-1]` is the list reversed. It works on strings too: `\"stressed\"[::-1]` is `\"desserts\"`.",
    "Slices are forgiving. An index past the end raises an `IndexError`, but a slice past the end just stops there: `letters[3:100]` is `['d', 'e']`, and `letters[10:]` is an empty list. That makes slices handy for \"up to the next 10 items\" when there may be fewer.",
    "A slice is a **new** list, so `lst[:]` is a quick copy, and changing a slice you've stored doesn't change the original. You can, however, **assign** to a slice to replace part of a list in place, even with a different number of items. `del` works with slices too.",
    "```\nnums = [1, 2, 3, 4, 5]\nnums[1:3] = [\"two\", \"three\", \"and a half\"]\nprint(nums)        # [1, 'two', 'three', 'and a half', 4, 5]\ndel nums[:2]\nprint(nums)        # ['three', 'and a half', 4, 5]\n```",
    "An empty slice such as `lst[2:2]` sits between two items, so `lst[2:2] = [\"x\"]` inserts without replacing anything. Strings can't do this: they're immutable, so slicing a string always gives you a new string.",
  ],
  sandboxCode: "letters = [\"a\", \"b\", \"c\", \"d\", \"e\"]\nprint(letters[0], letters[-1])\nprint(letters[1:4], letters[:2], letters[-2:])\nprint(letters[::2], letters[::-1])\nprint(letters[3:100], letters[10:])\nprint(\"stressed\"[::-1])",
  sandboxSnippets: [
    snippet("Start and stop", "nums = [10, 20, 30, 40, 50]\nprint(nums[1:3])\nprint(nums[:3])\nprint(nums[3:])"),
    snippet("From the end", "nums = [10, 20, 30, 40, 50]\nprint(nums[-1], nums[-2:], nums[:-1])"),
    snippet("Steps", "nums = list(range(10))\nprint(nums[::2])\nprint(nums[1::2])\nprint(nums[::-1])"),
    snippet("Past the end", "nums = [1, 2, 3]\nprint(nums[1:50])\nprint(nums[5:])"),
    snippet("Replace a slice", "week = [\"Mon\", \"Tue\", \"Wed\", \"Thu\"]\nweek[1:3] = [\"Holiday\"]\nprint(week)"),
  ],
  readMore: { label: "Python tutorial: lists and slicing", url: "https://docs.python.org/3/tutorial/introduction.html#lists", source: "Python docs" },
  challenges: [
    task("easy", "The top three", {
      prompt: "`scores` is sorted from high to low. Set `top3` to the first three scores, with a slice.",
      starter: "scores = [98, 91, 87, 80, 76, 64]\n",
      hint: "`scores[:3]` runs from the start up to (not including) index 3.",
      solution: "scores = [98, 91, 87, 80, 76, 64]\ntop3 = scores[:3]",
      tests: [
        ["top3 is right", "top3 == [98, 91, 87]"],
      ],
    }),
    task("easy", "The last two", {
      prompt: "Set `last_two` to the last two items of `items`.",
      starter: "items = [\"pen\", \"ink\", \"paper\", \"clip\", \"tape\"]\n",
      hint: "Start two from the end and leave out the stop: `items[-2:]`.",
      solution: "items = [\"pen\", \"ink\", \"paper\", \"clip\", \"tape\"]\nlast_two = items[-2:]",
      tests: [
        ["last_two is right", "last_two == [\"clip\", \"tape\"]"],
      ],
    }),
    task("easy", "Backwards", {
      prompt: "Set `backwards` to `nums` reversed, with a slice.",
      starter: "nums = [1, 2, 3, 4, 5]\n",
      hint: "A step of -1 goes backwards: `nums[::-1]`.",
      solution: "nums = [1, 2, 3, 4, 5]\nbackwards = nums[::-1]",
      tests: [
        ["backwards is right", "backwards == [5, 4, 3, 2, 1]"],
      ],
    }),
    task("medium", "The middle", {
      prompt: "Set `middle` to every reading except the first and the last.",
      starter: "readings = [0, 12, 15, 11, 14, 0]\n",
      hint: "Start at index 1 and stop one before the end: `readings[1:-1]`.",
      solution: "readings = [0, 12, 15, 11, 14, 0]\nmiddle = readings[1:-1]",
      tests: [
        ["middle is right", "middle == [12, 15, 11, 14]"],
      ],
    }),
    task("medium", "Every other day", {
      prompt: "Set `every_other` to the 1st, 3rd, 5th and 7th days, with a step.",
      starter: "days = [\"Mon\", \"Tue\", \"Wed\", \"Thu\", \"Fri\", \"Sat\", \"Sun\"]\n",
      hint: "Leave out start and stop, and use a step of 2: `days[::2]`.",
      solution: "days = [\"Mon\", \"Tue\", \"Wed\", \"Thu\", \"Fri\", \"Sat\", \"Sun\"]\nevery_other = days[::2]",
      tests: [
        ["every_other is right", "every_other == [\"Mon\", \"Wed\", \"Fri\", \"Sun\"]"],
      ],
    }),
    task("medium", "A palindrome?", {
      prompt: "Set `is_palindrome` to whether `word` reads the same backwards, ignoring capital letters.",
      starter: "word = \"Racecar\"\n",
      hint: "Make it lowercase first, then compare it with its reverse: `w == w[::-1]`.",
      solution: "word = \"Racecar\"\nw = word.lower()\nis_palindrome = w == w[::-1]",
      tests: [
        ["is_palindrome is True", "is_palindrome is True"],
      ],
    }),
    task("hard", "A day off", {
      prompt: "Replace `Tue` and `Wed` in `week` with a single `Holiday`, using slice assignment.",
      starter: "week = [\"Mon\", \"Tue\", \"Wed\", \"Thu\", \"Fri\"]\n",
      hint: "The two days are `week[1:3]`. Assign a list to that slice: `week[1:3] = [\"Holiday\"]`.",
      solution: "week = [\"Mon\", \"Tue\", \"Wed\", \"Thu\", \"Fri\"]\nweek[1:3] = [\"Holiday\"]",
      tests: [
        ["week is right", "week == [\"Mon\", \"Holiday\", \"Thu\", \"Fri\"]"],
      ],
    }),
    task("hard", "Rotate", {
      prompt: "Set `rotated` to `items` with the first `k` items moved to the end.",
      starter: "items = [1, 2, 3, 4, 5, 6]\nk = 2\n",
      hint: "Join two slices: everything from `k` on, then the first `k`: `items[k:] + items[:k]`.",
      solution: "items = [1, 2, 3, 4, 5, 6]\nk = 2\nrotated = items[k:] + items[:k]",
      tests: [
        ["rotated is right", "rotated == [3, 4, 5, 6, 1, 2]"],
      ],
    }),
    task("expert", "Pages", {
      prompt: "A list shows `per_page` items per page. Set `shown` to the items on page number `page` (page 1 is the first page). Work the slice out from `page` and `per_page`.",
      starter: "items = list(\"abcdefghij\")\nper_page = 3\npage = 4\n",
      hint: "Page 1 starts at index 0, page 2 at 3, so a page starts at `(page - 1) * per_page` and stops `per_page` later. The last page may be shorter; slices don't mind.",
      solution: "items = list(\"abcdefghij\")\nper_page = 3\npage = 4\nstart = (page - 1) * per_page\nshown = items[start:start + per_page]",
      tests: [
        ["shown is the last, short page", "shown == [\"j\"]"],
      ],
    }),
    task("expert", "Insert in the middle", {
      prompt: "Insert `x` and `y` between `b` and `c`, in one line, with slice assignment.",
      starter: "letters = [\"a\", \"b\", \"c\", \"d\"]\n",
      hint: "An empty slice sits between two items: `letters[2:2] = [\"x\", \"y\"]` inserts without replacing.",
      solution: "letters = [\"a\", \"b\", \"c\", \"d\"]\nletters[2:2] = [\"x\", \"y\"]",
      tests: [
        ["letters is right", "letters == [\"a\", \"b\", \"x\", \"y\", \"c\", \"d\"]"],
      ],
    }),
  ],
  questions: [
    mc("For `nums = [10, 20, 30, 40]`, what is `nums[1:3]`?", ["`[10, 20, 30]`", "`[20, 30]`", "`[20, 30, 40]`", "`[30]`"], 1),
    mc("What is `nums[-1]` for `nums = [10, 20, 30, 40]`?", ["`10`", "`-1`", "`40`", "An error"], 2),
    mc("What does `lst[::-1]` give?", ["The list reversed", "The last item", "An empty list", "An error"], 0),
    mc("What is `[1, 2, 3][5:]`?", ["An `IndexError`", "`None`", "`[3]`", "`[]`"], 3),
    qShort("What is `\"stressed\"[::-1]`?", "desserts"),
    mc("What does `lst[:]` give?", ["The first item", "A copy of the whole list", "An empty list", "The same list under a new name"], 1),
    mc("What is `[0, 1, 2, 3, 4, 5][1::2]`?", ["`[0, 2, 4]`", "`[1, 2]`", "`[1, 3, 5]`", "`[5, 3, 1]`"], 2),
    mc("After `lst = [1, 2, 3]` and `lst[0:2] = [9]`, what is `lst`?", ["`[9, 3]`", "`[9, 2, 3]`", "`[9, 9, 3]`", "An error"], 0),
    mc("Which gives everything except the last item?", ["`lst[-1]`", "`lst[1:]`", "`lst[-1:]`", "`lst[:-1]`"], 3),
    mc("Why does `\"cat\"[0:1] = \"b\"` fail?", ["Slices only work on lists", "Strings are immutable", "The slice is empty", "`\"b\"` must be a list"], 1),
  ],
})
