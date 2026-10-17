// Decisions and loops topic: Comparisons. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "comparison_operators",
  title: "Comparisons",
  paragraphs: [
    "Programs make decisions by asking yes-or-no questions. A **comparison** compares two values and answers with a bool: `True` or `False`. Python has six comparison operators: `==` (equal), `!=` (not equal), `<` and `>` (less and greater than), and `<=` and `>=` (less or equal, greater or equal).",
    "```\nage = 17\nprint(age >= 18)   # False\nprint(age == 17)   # True\nprint(age != 20)   # True\n```",
    "Don't mix up `=` and `==`. A single `=` **assigns** a value to a name; a double `==` **asks** whether two values are equal. You can store the answer to a comparison like any other value: `is_adult = age >= 18`.",
    "Ints and floats compare by value, so `1 == 1.0` is `True`. Text and numbers are different types, though: `\"5\" == 5` is `False`, and `\"5\" < 5` raises a `TypeError`. Convert first, as in `int(\"5\") == 5`.",
    "Strings compare character by character, so `==` is exact and case-sensitive: `\"Paris\" == \"paris\"` is `False`. `<` and `>` compare alphabetically, but every capital letter comes before every small letter, so `\"Zebra\" < \"apple\"` is `True`. To compare text fairly, make both sides the same case first with `.lower()`, and remove stray spaces with `.strip()`.",
    "Comparisons can be **chained**: `0 <= score <= 100` means \"score is at least 0 and at most 100\", just as in maths. It's shorter and clearer than writing the two halves separately.",
    "```\nscore = 105\nprint(0 <= score <= 100)   # False\n```",
    "Remember from Fundamentals that floats aren't exact: `0.1 + 0.2 == 0.3` is `False`. Compare floats with `math.isclose(a, b)`, or check that the difference is tiny: `abs(a - b) < 0.0001`.",
  ],
  sandboxCode: "age = 17\nprint(age >= 18, age == 17, age != 20)\nprint(\"Paris\" == \"paris\", \"paris\" == \"paris\")\nprint(\"Zebra\" < \"apple\", \"zebra\" < \"apple\")\nscore = 105\nprint(0 <= score <= 100)",
  sandboxSnippets: [
    snippet("Numbers", "print(5 > 3, 5 < 3)\nprint(7 == 7.0, 7 != 8)\nprint(10 >= 10, 10 > 10)"),
    snippet("Store the answer", "temperature = 31\nis_hot = temperature > 30\nprint(is_hot)"),
    snippet("Text", "print(\"Paris\" == \"paris\")\nprint(\"Paris\".lower() == \"paris\")\nprint(\"apple\" < \"banana\", \"Zebra\" < \"apple\")"),
    snippet("Chained", "score = 85\nprint(0 <= score <= 100)\nprint(80 <= score < 90)"),
    snippet("Text vs number", "typed = \"42\"\nprint(typed == 42)\nprint(int(typed) == 42)"),
  ],
  readMore: { label: "Python docs: comparisons", url: "https://docs.python.org/3/reference/expressions.html#comparisons", source: "Python docs" },
  challenges: [
    task("easy", "Is it hot?", {
      prompt: "Set `is_hot` to whether `temperature` is above 30.",
      starter: "temperature = 31\n",
      hint: "A comparison gives `True` or `False`, so you can store it directly: `is_hot = temperature > 30`.",
      solution: "temperature = 31\nis_hot = temperature > 30",
      tests: [
        ["is_hot is True", "is_hot is True"],
      ],
    }),
    task("easy", "A correct guess?", {
      prompt: "Set `correct` to whether `guess` equals `secret`.",
      starter: "secret = 7\nguess = 7\n",
      hint: "Use `==` to compare; a single `=` would assign instead.",
      solution: "secret = 7\nguess = 7\ncorrect = guess == secret",
      tests: [
        ["correct is True", "correct is True"],
      ],
    }),
    task("easy", "Not the same", {
      prompt: "Set `different` to whether `a` and `b` are not equal.",
      starter: "a = \"cat\"\nb = \"Cat\"\n",
      hint: "`!=` means \"not equal\". Capital letters count, so these two are different.",
      solution: "a = \"cat\"\nb = \"Cat\"\ndifferent = a != b",
      tests: [
        ["different is True", "different is True"],
      ],
    }),
    task("medium", "The pass mark", {
      prompt: "The pass mark is 50 or more. Set `passed` to whether `score` passes, then print it.",
      starter: "score = 49\n",
      hint: "\"50 or more\" is `>= 50`.",
      solution: "score = 49\npassed = score >= 50\nprint(passed)",
      tests: [
        ["passed is False", "passed is False"],
        ["Prints False", "_cq_stdout.strip() == \"False\""],
      ],
    }),
    task("medium", "A valid score", {
      prompt: "A valid score is from 0 to 100. Set `valid` to whether `score` is valid, using one chained comparison.",
      starter: "score = 105\n",
      hint: "Chain the two limits: `0 <= score <= 100`.",
      solution: "score = 105\nvalid = 0 <= score <= 100",
      tests: [
        ["valid is False", "valid is False"],
      ],
    }),
    task("medium", "Alphabetical order", {
      prompt: "Set `comes_first` to whether `w1` comes before `w2` in alphabetical order.",
      starter: "w1 = \"pear\"\nw2 = \"apple\"\n",
      hint: "`<` compares strings alphabetically.",
      solution: "w1 = \"pear\"\nw2 = \"apple\"\ncomes_first = w1 < w2",
      tests: [
        ["comes_first is False", "comes_first is False"],
      ],
    }),
    task("hard", "A fair comparison", {
      prompt: "The quiz answer is `Paris`, and the user typed ` paris `. Set `match` to `True` if they match when you ignore spaces at the ends and capital letters.",
      starter: "answer = \"Paris\"\ntyped = \" paris \"\n",
      hint: "Clean both sides the same way before comparing: `typed.strip().lower() == answer.lower()`.",
      solution: "answer = \"Paris\"\ntyped = \" paris \"\nmatch = typed.strip().lower() == answer.lower()",
      tests: [
        ["match is True", "match is True"],
      ],
    }),
    task("hard", "Fix the comparison", {
      prompt: "`is_adult` should be `True` or `False`, but this line sets it to 18. Fix it so it says whether `age` is 18 or more.",
      starter: "age = 18\nis_adult = age = 18\nprint(is_adult)",
      hint: "The line uses `=`, which assigns. To ask a question, compare: `is_adult = age >= 18`.",
      solution: "age = 18\nis_adult = age >= 18\nprint(is_adult)",
      tests: [
        ["is_adult is True", "is_adult is True"],
        ["age is still 18", "age == 18"],
      ],
    }),
    task("expert", "Text vs number", {
      prompt: "`typed` holds what a user typed, and `same` should say whether it equals the number 42. It gives `False`; fix it.",
      starter: "typed = \"42\"\nsame = typed == 42\nprint(same)",
      hint: "`\"42\"` is text, so it never equals the number 42. Convert it first: `int(typed) == 42`.",
      solution: "typed = \"42\"\nsame = int(typed) == 42\nprint(same)",
      tests: [
        ["same is True", "same is True"],
      ],
    }),
    task("expert", "Within budget", {
      prompt: "Set `close` to whether `price` is within 10% of `budget` (higher or lower).",
      starter: "price = 95\nbudget = 100\n",
      hint: "The difference is `abs(price - budget)`; 10% of the budget is `budget * 0.1`. Compare them with `<=`.",
      solution: "price = 95\nbudget = 100\nclose = abs(price - budget) <= budget * 0.1",
      tests: [
        ["close is True", "close is True"],
      ],
    }),
  ],
  questions: [
    mc("What does `5 > 3` give?", ["`True`", "`False`", "`5`", "`3`"], 0),
    qShort("Which operator asks whether two values are equal?", "=="),
    mc("What is `\"Zebra\" < \"apple\"`?", ["`False`", "`True`", "An error", "`None`"], 1),
    mc("What is `1 == 1.0`?", ["`False`", "An error", "`True`", "`None`"], 2),
    mc("What does `\"5\" == 5` give?", ["`True`", "An error", "`5`", "`False`"], 3),
    mc("What does `0 <= x <= 10` mean?", ["`x` is from 0 to 10, inclusive", "`x` is 0 or 10", "`x` is less than 0", "It is a syntax error"], 0),
    mc("What is the difference between `=` and `==`?", ["They are the same", "`=` assigns a value; `==` compares two values", "`==` assigns; `=` compares", "`==` is only for text"], 1),
    mc("What does `\"5\" < 5` do?", ["Gives `True`", "Gives `False`", "Raises a `TypeError`", "Gives `None`"], 2),
    mc("What is `\"Apple\".lower() == \"apple\"`?", ["`True`", "`False`", "An error", "`\"apple\"`"], 0),
    qShort("Which operator means \"not equal\"?", "!="),
  ],
})
