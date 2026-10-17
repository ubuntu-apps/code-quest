// Decisions and loops topic: Combining conditions. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "boolean_logic",
  title: "Combining conditions",
  paragraphs: [
    "Real decisions often depend on more than one thing: you can enter if you're old enough **and** have a ticket. Python combines conditions with three words: `and`, `or` and `not`.",
    "`a and b` is `True` only when **both** sides are true. `a or b` is `True` when **at least one** side is true. `not a` flips a bool: `not True` is `False`.",
    "```\nage = 20\nhas_ticket = True\nprint(age >= 18 and has_ticket)       # True\nprint(age < 12 or age >= 65)          # False\nprint(not has_ticket)                 # False\n```",
    "When you mix them, `not` is applied first, then `and`, then `or`, just as `*` comes before `+`. So `a or b and c` means `a or (b and c)`. Brackets make your meaning clear, and they never hurt.",
    "A classic mistake is `colour == \"red\" or \"blue\"`. It reads like English, but Python sees `(colour == \"red\") or \"blue\"`, and `\"blue\"` on its own is truthy, so the whole thing is always truthy. Write the comparison out each time: `colour == \"red\" or colour == \"blue\"`.",
    "`in` and `not in` check whether a piece of text appears inside another: `\" \" not in name` is `True` when the name has no spaces. Combined with `and`, that makes neat validation rules, like `len(name) >= 3 and \" \" not in name`.",
    "Python stops working out a condition as soon as it knows the answer, which is called **short-circuiting**. In `a and b`, if `a` is false, `b` is never even looked at. And `and` and `or` actually return one of their two values, not always a bool: `name or \"Guest\"` gives `name` if it's truthy (not empty) and `\"Guest\"` otherwise. That's a handy way to supply a default.",
    "```\nname = \"\"\nprint(name or \"Guest\")   # Guest\n```",
    "Flipping a combined condition swaps `and` and `or`: `not (a and b)` is the same as `not a or not b`. This is known as De Morgan's law, and it helps when a condition reads more naturally the other way round.",
  ],
  sandboxCode: "age = 20\nhas_ticket = True\nprint(age >= 18 and has_ticket)\nprint(age < 12 or age >= 65)\nprint(not has_ticket)\nname = \"\"\nprint(name or \"Guest\")",
  sandboxSnippets: [
    snippet("and", "print(True and True, True and False, False and False)\nage = 15\nprint(age >= 13 and age <= 19)"),
    snippet("or", "print(True or False, False or False)\nday = \"sun\"\nprint(day == \"sat\" or day == \"sun\")"),
    snippet("not", "is_raining = True\nprint(not is_raining)\nprint(not (5 > 3))"),
    snippet("The \"or\" trap", "colour = \"green\"\nprint(colour == \"red\" or \"blue\")\nprint(colour == \"red\" or colour == \"blue\")"),
    snippet("Default with or", "name = \"\"\nnickname = \"Ace\"\nprint(name or \"Guest\", nickname or \"Guest\")"),
  ],
  readMore: { label: "Python docs: boolean operations", url: "https://docs.python.org/3/library/stdtypes.html#boolean-operations-and-or-not", source: "Python docs" },
  challenges: [
    task("easy", "Both needed", {
      prompt: "You can enter if you are at least 18 **and** have a ticket. Set `can_enter`.",
      starter: "age = 20\nhas_ticket = True\n",
      hint: "Join the two conditions with `and`: `age >= 18 and has_ticket`.",
      solution: "age = 20\nhas_ticket = True\ncan_enter = age >= 18 and has_ticket",
      tests: [
        ["can_enter is True", "can_enter is True"],
      ],
    }),
    task("easy", "Either one", {
      prompt: "It is a day off if it is the weekend **or** a holiday. Set `day_off`.",
      starter: "is_weekend = False\nis_holiday = True\n",
      hint: "`or` is true when at least one side is true.",
      solution: "is_weekend = False\nis_holiday = True\nday_off = is_weekend or is_holiday",
      tests: [
        ["day_off is True", "day_off is True"],
      ],
    }),
    task("easy", "Flip it", {
      prompt: "You go out when it is **not** raining. Set `go_out`.",
      starter: "is_raining = True\n",
      hint: "`not` turns `True` into `False` and the other way round.",
      solution: "is_raining = True\ngo_out = not is_raining",
      tests: [
        ["go_out is False", "go_out is False"],
      ],
    }),
    task("medium", "Teenager", {
      prompt: "Set `is_teen` to whether `age` is from 13 to 19, using `and`.",
      starter: "age = 15\n",
      hint: "Two comparisons: `age >= 13 and age <= 19`.",
      solution: "age = 15\nis_teen = age >= 13 and age <= 19",
      tests: [
        ["is_teen is True", "is_teen is True"],
      ],
    }),
    task("medium", "Discount", {
      prompt: "Children under 12, people 65 or older and students get a discount. Set `discount`.",
      starter: "age = 70\nis_student = False\n",
      hint: "Three conditions, any of which is enough: join them with `or`.",
      solution: "age = 70\nis_student = False\ndiscount = age < 12 or age >= 65 or is_student",
      tests: [
        ["discount is True", "discount is True"],
      ],
    }),
    task("medium", "Valid username", {
      prompt: "A username is valid if it has at least 3 characters and no spaces. Set `valid`.",
      starter: "name = \"ana_99\"\n",
      hint: "`len(name) >= 3 and \" \" not in name`.",
      solution: "name = \"ana_99\"\nvalid = len(name) >= 3 and \" \" not in name",
      tests: [
        ["valid is True", "valid is True"],
      ],
    }),
    task("hard", "Fix the \"or\"", {
      prompt: "`is_primary` should say whether `colour` is red, blue or yellow. Green is none of them, but the line gives a truthy answer. Fix it.",
      starter: "colour = \"green\"\nis_primary = colour == \"red\" or \"blue\" or \"yellow\"\nprint(is_primary)",
      hint: "Each part of an `or` is checked on its own, and `\"blue\"` alone is truthy. Compare `colour` in every part.",
      solution: "colour = \"green\"\nis_primary = colour == \"red\" or colour == \"blue\" or colour == \"yellow\"\nprint(is_primary)",
      tests: [
        ["is_primary is False", "is_primary is False"],
      ],
    }),
    task("hard", "Leap years", {
      prompt: "A year is a leap year if it divides by 4, except years that divide by 100, unless they also divide by 400. Set `leap1`, `leap2` and `leap3` for the three years.",
      starter: "y1, y2, y3 = 2024, 1900, 2000\n",
      hint: "For one year: `y % 4 == 0 and y % 100 != 0 or y % 400 == 0`. Write it three times, with `y1`, `y2` and `y3`.",
      solution: "y1, y2, y3 = 2024, 1900, 2000\nleap1 = y1 % 4 == 0 and y1 % 100 != 0 or y1 % 400 == 0\nleap2 = y2 % 4 == 0 and y2 % 100 != 0 or y2 % 400 == 0\nleap3 = y3 % 4 == 0 and y3 % 100 != 0 or y3 % 400 == 0",
      tests: [
        ["2024 is a leap year", "leap1 is True"],
        ["1900 is not", "leap2 is False"],
        ["2000 is", "leap3 is True"],
      ],
    }),
    task("expert", "Strong passwords", {
      prompt: "A password is strong if it has at least 8 characters and is neither all digits nor all letters. Set `strong1` and `strong2` for the two passwords.",
      starter: "pw1 = \"Secret123\"\npw2 = \"password\"\n",
      hint: "For one password: `len(pw) >= 8 and not pw.isdigit() and not pw.isalpha()`.",
      solution: "pw1 = \"Secret123\"\npw2 = \"password\"\nstrong1 = len(pw1) >= 8 and not pw1.isdigit() and not pw1.isalpha()\nstrong2 = len(pw2) >= 8 and not pw2.isdigit() and not pw2.isalpha()",
      tests: [
        ["Secret123 is strong", "strong1 is True"],
        ["password is not", "strong2 is False"],
      ],
    }),
    task("expert", "A default name", {
      prompt: "Set `display` to `name`, or to `Guest` when `name` is empty, in one line with `or`. Then print it.",
      starter: "name = \"\"\n",
      hint: "`or` returns its first truthy value, and empty text is falsy: `name or \"Guest\"`.",
      solution: "name = \"\"\ndisplay = name or \"Guest\"\nprint(display)",
      tests: [
        ["display is Guest", "display == \"Guest\""],
        ["Prints Guest", "_cq_stdout.strip() == \"Guest\""],
      ],
    }),
  ],
  questions: [
    mc("What is `True and False`?", ["`True`", "`False`", "`None`", "An error"], 1),
    mc("What is `True or False`?", ["`True`", "`False`", "`None`", "An error"], 0),
    qShort("Which operator is true only when both sides are true?", "and"),
    mc("In `a or b and c`, which part is worked out first?", ["`a or b`", "Left to right", "`b and c`", "It is a syntax error"], 2),
    mc("Why is `colour == \"red\" or \"blue\"` always truthy?", ["`or` only checks the left side", "Strings can't be compared", "It compares colour to both", "`\"blue\"` on its own is truthy"], 3),
    mc("What does `\"\" or \"Guest\"` give?", ["`\"\"`", "`\"Guest\"`", "`True`", "`False`"], 1),
    mc("What is `5 > 3 and 2 > 4`?", ["`False`", "`True`", "`2`", "An error"], 0),
    mc("`not (a and b)` is the same as…", ["`not a and not b`", "`a or b`", "`not a or not b`", "`a and not b`"], 2),
    mc("What is `\" \" not in \"hello\"`?", ["`False`", "An error", "`\" \"`", "`True`"], 3),
    mc("What is `not 0`?", ["`0`", "`True`", "`False`", "An error"], 1),
  ],
})
