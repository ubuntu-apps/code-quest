// Decisions and loops topic: match and case. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task, typedInput } from '../_builders.mjs'

export default makeTopic({
  id: "match_case",
  title: "match and case",
  paragraphs: [
    "When you compare one value against a list of possibilities, a long `if`/`elif` chain gets repetitive. `match` (added in Python 3.10) says it more neatly: give it a value, then list the `case`s it might be.",
    "```\ncommand = \"stop\"\nmatch command:\n    case \"start\":\n        print(\"Starting\")\n    case \"stop\":\n        print(\"Stopping\")\n    case _:\n        print(\"Unknown command\")\n```",
    "Python tries the cases from the top and runs **only the first** one that matches. `case _:` matches anything, so it works like `else`; put it last. Without it, a value that matches no case simply does nothing.",
    "One case can match several values: separate them with `|`, which reads as \"or\": `case \"sat\" | \"sun\":`. Cases can match numbers too, as in `case 404:`.",
    "A **guard** adds a condition to a case: `case n if n < 0:` matches any value (and calls it `n`) but only when `n < 0`. Guards let a `match` handle ranges, though for range checks such as `score >= 90`, a plain `if`/`elif` is usually clearer.",
    "```\nn = -5\nmatch n:\n    case 0:\n        sign = \"zero\"\n    case x if x < 0:\n        sign = \"negative\"\n    case _:\n        sign = \"positive\"\nprint(sign)   # negative\n```",
    "A watch-out: a bare name in a case, like `case other:`, is not a comparison with a variable called `other`. It matches **everything** and stores the value in `other`. Python refuses to run a `match` where such a case comes before others, because those could never be reached.",
    "Use `match` when one value can be one of several fixed options: menu choices, commands, status codes, days of the week. Use `if`/`elif` for anything else, especially comparisons such as `<` and `>`.",
  ],
  sandboxCode: "day = \"sat\"\nmatch day:\n    case \"sat\" | \"sun\":\n        print(\"Weekend!\")\n    case \"fri\":\n        print(\"Almost the weekend\")\n    case _:\n        print(\"A weekday\")",
  sandboxSnippets: [
    snippet("Basic match", "light = \"red\"\nmatch light:\n    case \"red\":\n        print(\"Stop\")\n    case \"green\":\n        print(\"Go\")\n    case _:\n        print(\"Get ready\")"),
    snippet("Several values", "month = 4\nmatch month:\n    case 2:\n        days = 28\n    case 4 | 6 | 9 | 11:\n        days = 30\n    case _:\n        days = 31\nprint(days)"),
    snippet("Numbers", "code = 404\nmatch code:\n    case 200:\n        print(\"OK\")\n    case 404:\n        print(\"Not Found\")\n    case _:\n        print(\"Something else\")"),
    snippet("Guards", "temp = 35\nmatch temp:\n    case t if t >= 30:\n        print(\"Hot\")\n    case t if t >= 15:\n        print(\"Mild\")\n    case _:\n        print(\"Cold\")"),
    snippet("No match", "fruit = \"kiwi\"\nmatch fruit:\n    case \"apple\":\n        print(\"An apple\")\nprint(\"No case matched, so nothing was printed above.\")"),
  ],
  readMore: { label: "Python tutorial: match statements", url: "https://docs.python.org/3/tutorial/controlflow.html#match-statements", source: "Python docs" },
  challenges: [
    task("easy", "Weekend or weekday", {
      prompt: "Use `match` to set `kind` to `weekend` for `sat` or `sun`, and `weekday` for anything else.",
      starter: "day = \"sat\"\n",
      hint: "One case with two values: `case \"sat\" | \"sun\":`, and `case _:` for the rest.",
      solution: "day = \"sat\"\nmatch day:\n    case \"sat\" | \"sun\":\n        kind = \"weekend\"\n    case _:\n        kind = \"weekday\"",
      tests: [
        ["kind is weekend", "kind == \"weekend\""],
      ],
    }),
    task("easy", "Traffic light", {
      prompt: "Use `match` to set `action`: `red` means `stop`, `amber` means `get ready`, and `green` means `go`.",
      starter: "light = \"amber\"\n",
      hint: "Three cases, one per colour. Each one sets `action`.",
      solution: "light = \"amber\"\nmatch light:\n    case \"red\":\n        action = \"stop\"\n    case \"amber\":\n        action = \"get ready\"\n    case \"green\":\n        action = \"go\"",
      tests: [
        ["action is get ready", "action == \"get ready\""],
      ],
    }),
    task("easy", "Unknown command", {
      prompt: "Commands `start` and `stop` print `Starting` and `Stopping`. Add a default case so anything else prints `Unknown command`.",
      starter: "command = \"dance\"\nmatch command:\n    case \"start\":\n        print(\"Starting\")\n    case \"stop\":\n        print(\"Stopping\")\n",
      hint: "Add `case _:` at the end, with `print(\"Unknown command\")` indented under it.",
      solution: "command = \"dance\"\nmatch command:\n    case \"start\":\n        print(\"Starting\")\n    case \"stop\":\n        print(\"Stopping\")\n    case _:\n        print(\"Unknown command\")",
      tests: [
        ["Prints Unknown command", "_cq_stdout.strip() == \"Unknown command\""],
      ],
    }),
    task("medium", "Status codes", {
      prompt: "Set `text` for the HTTP status `code`: 200 is `OK`, 404 is `Not Found`, 500 is `Server Error`, and anything else is `Unknown`.",
      starter: "code = 404\n",
      hint: "Cases can match numbers: `case 200:`. End with `case _:`.",
      solution: "code = 404\nmatch code:\n    case 200:\n        text = \"OK\"\n    case 404:\n        text = \"Not Found\"\n    case 500:\n        text = \"Server Error\"\n    case _:\n        text = \"Unknown\"",
      tests: [
        ["text is Not Found", "text == \"Not Found\""],
      ],
    }),
    task("medium", "Days in a month", {
      prompt: "Set `days` for `month` (ignore leap years): February has 28, April, June, September and November have 30, and the rest have 31.",
      starter: "month = 2\n",
      hint: "Use `|` for the 30-day months: `case 4 | 6 | 9 | 11:`.",
      solution: "month = 2\nmatch month:\n    case 2:\n        days = 28\n    case 4 | 6 | 9 | 11:\n        days = 30\n    case _:\n        days = 31",
      tests: [
        ["days is 28", "days == 28"],
      ],
    }),
    task("medium", "Menu choice", {
      prompt: "Ask `Choose 1-3: ` and print `Start`, `Settings` or `Quit` for 1, 2 or 3, or `Invalid choice` for anything else. The check types `2`.",
      hint: "`input` returns text, so match strings: `case \"1\":`.",
      solution: "choice = input(\"Choose 1-3: \")\nmatch choice:\n    case \"1\":\n        print(\"Start\")\n    case \"2\":\n        print(\"Settings\")\n    case \"3\":\n        print(\"Quit\")\n    case _:\n        print(\"Invalid choice\")",
      setup: typedInput("2"),
      tests: [
        ["Prints Settings", "_cq_stdout.strip().splitlines()[-1] == \"Settings\""],
      ],
    }),
    task("hard", "A guard", {
      prompt: "Use `match` with guards to set `sign` to `zero`, `negative` or `positive` for `n`.",
      starter: "n = -5\n",
      hint: "`case 0:` first, then `case x if x < 0:`, then `case _:` for positive.",
      solution: "n = -5\nmatch n:\n    case 0:\n        sign = \"zero\"\n    case x if x < 0:\n        sign = \"negative\"\n    case _:\n        sign = \"positive\"",
      tests: [
        ["sign is negative", "sign == \"negative\""],
      ],
    }),
    task("hard", "Fix the catch-all", {
      prompt: "This `match` won't even run: the first case matches everything. Fix it so a kiwi costs 2, an apple 1, and any other fruit 0.",
      starter: "fruit = \"kiwi\"\nmatch fruit:\n    case other:\n        price = 0\n    case \"apple\":\n        price = 1\n    case \"kiwi\":\n        price = 2\nprint(price)",
      hint: "A bare name like `other` matches anything. Move the default to the end and write it as `case _:`.",
      solution: "fruit = \"kiwi\"\nmatch fruit:\n    case \"apple\":\n        price = 1\n    case \"kiwi\":\n        price = 2\n    case _:\n        price = 0\nprint(price)",
      tests: [
        ["price is 2", "price == 2"],
      ],
    }),
    task("expert", "A tiny calculator", {
      prompt: "Use `match` on `op` to set `result` to `a op b` for `+`, `-`, `*` and `/`, or `None` for any other operator.",
      starter: "a = 8\nb = 2\nop = \"/\"\n",
      hint: "One case per operator, such as `case \"/\": result = a / b`, and `case _: result = None`.",
      solution: "a = 8\nb = 2\nop = \"/\"\nmatch op:\n    case \"+\":\n        result = a + b\n    case \"-\":\n        result = a - b\n    case \"*\":\n        result = a * b\n    case \"/\":\n        result = a / b\n    case _:\n        result = None",
      tests: [
        ["result is 4.0", "result == 4.0"],
      ],
    }),
    task("expert", "Rock, paper, scissors", {
      prompt: "Set `result` to `win`, `lose` or `draw` for `me` against `them`. Use `match me:` with guards: the same choice is a draw; rock beats scissors, paper beats rock, scissors beat paper; anything else loses.",
      starter: "me = \"rock\"\nthem = \"scissors\"\n",
      hint: "A guard can check the other player: `case \"rock\" if them == \"scissors\":`. Check for a draw first with `case _ if me == them:`.",
      solution: "me = \"rock\"\nthem = \"scissors\"\nmatch me:\n    case _ if me == them:\n        result = \"draw\"\n    case \"rock\" if them == \"scissors\":\n        result = \"win\"\n    case \"paper\" if them == \"rock\":\n        result = \"win\"\n    case \"scissors\" if them == \"paper\":\n        result = \"win\"\n    case _:\n        result = \"lose\"",
      tests: [
        ["result is win", "result == \"win\""],
      ],
    }),
  ],
  questions: [
    mc("What does this print?\n\n```\ncommand = \"halt\"\nmatch command:\n    case \"go\":\n        print(\"Going\")\n    case \"stop\" | \"halt\":\n        print(\"Stopping\")\n```", ["`Going`", "`Stopping`", "Both lines", "Nothing"], 1),
    mc("What does `case _:` match?", ["Only an empty string", "Anything: it is the default", "Nothing", "Only `None`"], 1),
    mc("How do you match `\"sat\"` or `\"sun\"` in one case?", ["`case \"sat\" or \"sun\":`", "`case \"sat\", \"sun\":`", "`case \"sat\" | \"sun\":`", "`case [\"sat\" \"sun\"]:`"], 2),
    mc("What happens if no case matches and there is no `case _`?", ["A `ValueError`", "The first case runs", "The program stops", "Nothing: the match is skipped"], 3),
    mc("What is a guard?", ["An `if` condition after a pattern, like `case x if x < 0:`", "A case that stops the program", "The default case", "A comment in a match"], 0),
    qShort("Which keyword starts a match block?", "match"),
    mc("Why is `case other:` before other cases a mistake?", ["`other` must be in quotes", "It matches everything, so the cases after it can never run", "Cases need numbers", "It only matches `None`"], 1),
    mc("When is `if`/`elif` the better choice?", ["When matching fixed words", "Never", "When comparing ranges, like `score >= 90`", "When there are more than two cases"], 2),
    mc("How many cases run when several could match?", ["All of them", "The last one", "None", "Only the first one that matches"], 3),
    mc("With `x = 3`, which case runs?\n\n```\nmatch x:\n    case 1 | 2:\n        ...\n    case 3:\n        ...\n    case _:\n        ...\n```", ["`case 1 | 2`", "`case 3`", "`case _`", "Both `case 3` and `case _`"], 1),
  ],
})
