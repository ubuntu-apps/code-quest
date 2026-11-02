// Functions project: Password checker. Lesson, Try-it snippets, challenges and quiz.
import { makeProject, mc, qShort, snippet, task, typedInput } from '../_builders.mjs'

export default makeProject("medium", {
  id: "proj_password_checker",
  title: "Password checker",
  paragraphs: [
    "Build a password checker that scores a password and suggests how to make it stronger. Each rule is its own small function, and bigger functions are built out of the small ones.",
    "A password scores one point for each rule it meets: at least 8 characters, a digit, a capital letter, and a symbol (anything that isn't a letter or digit). A score of 4 is `Strong`, 2 or 3 is `Okay`, and 0 or 1 is `Weak`. When the user types `sunshine7`, the finished program shows:",
    "```\nPassword: sunshine7\nStrength: 2/4 (Okay)\n- Add a capital letter\n- Add a symbol\n```",
    "A handy built-in for the rules: `any(...)` is `True` when at least one item is true, so `any(ch.isdigit() for ch in pw)` asks \"is any character a digit?\". (`all(...)` is its partner: true only when every item is.) String methods do the rest: `isdigit()`, `isupper()` and `isalnum()`.",
    "Build it in steps: the three character checks, the score, the list of tips, and finally the whole program. Type a password in the Input box to try the sandbox.",
  ],
  sandboxCode: "def has_digit(pw):\n    return any(ch.isdigit() for ch in pw)\n\ndef has_upper(pw):\n    return any(ch.isupper() for ch in pw)\n\npw = input(\"Password: \")\nprint(\"Digit:\", has_digit(pw), \"Capital:\", has_upper(pw), \"Length:\", len(pw))",
  sandboxSnippets: [
    snippet("any and all", "pw = \"sunshine7\"\nprint(any(ch.isdigit() for ch in pw))\nprint(all(ch.isalpha() for ch in pw))"),
    snippet("Character tests", "for ch in \"aZ7!\":\n    print(ch, ch.isdigit(), ch.isupper(), ch.isalnum())"),
    snippet("Build a list of tips", "tips = []\nif len(\"abc\") < 8:\n    tips.append(\"Use at least 8 characters\")\nfor tip in tips:\n    print(\"-\", tip)"),
  ],
  challenges: [
    task("easy", "Any digits?", {
      prompt: "Define `has_digit(pw)` that returns `True` if `pw` contains at least one digit.",
      hint: "`return any(ch.isdigit() for ch in pw)`.",
      solution: "def has_digit(pw):\n    return any(ch.isdigit() for ch in pw)",
      tests: [
        ["sunshine7", "has_digit(\"sunshine7\") is True"],
        ["sunshine", "has_digit(\"sunshine\") is False"],
      ],
    }),
    task("easy", "Any capitals?", {
      prompt: "Define `has_upper(pw)` that returns `True` if `pw` contains at least one capital letter.",
      hint: "The same shape, with `ch.isupper()`.",
      solution: "def has_upper(pw):\n    return any(ch.isupper() for ch in pw)",
      tests: [
        ["Sunshine", "has_upper(\"Sunshine\") is True"],
        ["sunshine", "has_upper(\"sunshine\") is False"],
      ],
    }),
    task("medium", "Any symbols?", {
      prompt: "Define `has_symbol(pw)` that returns `True` if `pw` contains a character that is neither a letter nor a digit.",
      hint: "A symbol is a character where `ch.isalnum()` is `False`: `any(not ch.isalnum() for ch in pw)`.",
      solution: "def has_symbol(pw):\n    return any(not ch.isalnum() for ch in pw)",
      tests: [
        ["sun#shine", "has_symbol(\"sun#shine\") is True"],
        ["Sunshine7", "has_symbol(\"Sunshine7\") is False"],
      ],
    }),
    task("medium", "The score", {
      prompt: "Define `strength(pw)` that returns the score from 0 to 4: one point each for 8 or more characters, a digit, a capital and a symbol. Use the three functions.",
      starter: "def has_digit(pw):\n    return any(ch.isdigit() for ch in pw)\n\ndef has_upper(pw):\n    return any(ch.isupper() for ch in pw)\n\ndef has_symbol(pw):\n    return any(not ch.isalnum() for ch in pw)\n\n",
      hint: "Start at 0 and add 1 for each rule that holds, with four `if`s.",
      solution: "def has_digit(pw):\n    return any(ch.isdigit() for ch in pw)\n\ndef has_upper(pw):\n    return any(ch.isupper() for ch in pw)\n\ndef has_symbol(pw):\n    return any(not ch.isalnum() for ch in pw)\n\ndef strength(pw):\n    score = 0\n    if len(pw) >= 8:\n        score += 1\n    if has_digit(pw):\n        score += 1\n    if has_upper(pw):\n        score += 1\n    if has_symbol(pw):\n        score += 1\n    return score\n",
      tests: [
        ["abc", "strength(\"abc\") == 0"],
        ["sunshine7", "strength(\"sunshine7\") == 2"],
        ["Sunshine7!", "strength(\"Sunshine7!\") == 4"],
        ["Ab1!", "strength(\"Ab1!\") == 3"],
      ],
    }),
    task("hard", "Tips", {
      prompt: "Define `feedback(pw)` that returns a list of tips for the rules `pw` breaks, in this order: `Use at least 8 characters`, `Add a number`, `Add a capital letter`, `Add a symbol`.",
      starter: "def has_digit(pw):\n    return any(ch.isdigit() for ch in pw)\n\ndef has_upper(pw):\n    return any(ch.isupper() for ch in pw)\n\ndef has_symbol(pw):\n    return any(not ch.isalnum() for ch in pw)\n\n",
      hint: "Start with `tips = []`, and `append` a tip for each rule that fails, then return the list.",
      solution: "def has_digit(pw):\n    return any(ch.isdigit() for ch in pw)\n\ndef has_upper(pw):\n    return any(ch.isupper() for ch in pw)\n\ndef has_symbol(pw):\n    return any(not ch.isalnum() for ch in pw)\n\ndef feedback(pw):\n    tips = []\n    if len(pw) < 8:\n        tips.append(\"Use at least 8 characters\")\n    if not has_digit(pw):\n        tips.append(\"Add a number\")\n    if not has_upper(pw):\n        tips.append(\"Add a capital letter\")\n    if not has_symbol(pw):\n        tips.append(\"Add a symbol\")\n    return tips\n",
      tests: [
        ["sunshine7", "feedback(\"sunshine7\") == [\"Add a capital letter\", \"Add a symbol\"]"],
        ["abc", "feedback(\"abc\") == [\"Use at least 8 characters\", \"Add a number\", \"Add a capital letter\", \"Add a symbol\"]"],
        ["A strong one", "feedback(\"Sunshine7!\") == []"],
      ],
    }),
    task("expert", "The password checker", {
      prompt: "Put it together. Define `label(score)` (`Strong` for 4, `Okay` for 2 or 3, `Weak` otherwise), then ask `Password: ` and print `Strength: 2/4 (Okay)` followed by each tip as `- tip`. The check types `sunshine7`.",
      starter: "def has_digit(pw):\n    return any(ch.isdigit() for ch in pw)\n\ndef has_upper(pw):\n    return any(ch.isupper() for ch in pw)\n\ndef has_symbol(pw):\n    return any(not ch.isalnum() for ch in pw)\n\ndef strength(pw):\n    score = 0\n    if len(pw) >= 8:\n        score += 1\n    if has_digit(pw):\n        score += 1\n    if has_upper(pw):\n        score += 1\n    if has_symbol(pw):\n        score += 1\n    return score\n\ndef feedback(pw):\n    tips = []\n    if len(pw) < 8:\n        tips.append(\"Use at least 8 characters\")\n    if not has_digit(pw):\n        tips.append(\"Add a number\")\n    if not has_upper(pw):\n        tips.append(\"Add a capital letter\")\n    if not has_symbol(pw):\n        tips.append(\"Add a symbol\")\n    return tips\n\n",
      hint: "Read the password, work out `score = strength(pw)`, print `f\"Strength: {score}/4 ({label(score)})\"`, then loop over `feedback(pw)`.",
      solution: "def has_digit(pw):\n    return any(ch.isdigit() for ch in pw)\n\ndef has_upper(pw):\n    return any(ch.isupper() for ch in pw)\n\ndef has_symbol(pw):\n    return any(not ch.isalnum() for ch in pw)\n\ndef strength(pw):\n    score = 0\n    if len(pw) >= 8:\n        score += 1\n    if has_digit(pw):\n        score += 1\n    if has_upper(pw):\n        score += 1\n    if has_symbol(pw):\n        score += 1\n    return score\n\ndef feedback(pw):\n    tips = []\n    if len(pw) < 8:\n        tips.append(\"Use at least 8 characters\")\n    if not has_digit(pw):\n        tips.append(\"Add a number\")\n    if not has_upper(pw):\n        tips.append(\"Add a capital letter\")\n    if not has_symbol(pw):\n        tips.append(\"Add a symbol\")\n    return tips\n\ndef label(score):\n    if score == 4:\n        return \"Strong\"\n    if score >= 2:\n        return \"Okay\"\n    return \"Weak\"\n\npw = input(\"Password: \")\nscore = strength(pw)\nprint(f\"Strength: {score}/4 ({label(score)})\")\nfor tip in feedback(pw):\n    print(f\"- {tip}\")",
      setup: typedInput("sunshine7"),
      tests: [
        ["label works", "label(4) == \"Strong\" and label(3) == \"Okay\" and label(1) == \"Weak\""],
        ["Prints the result", "_cq_stdout.strip().splitlines()[1:] == [\"Strength: 2/4 (Okay)\", \"- Add a capital letter\", \"- Add a symbol\"]"],
      ],
    }),
  ],
  questions: [
    mc("What does `any(ch.isdigit() for ch in \"abc1\")` give?", ["`False`", "`True`", "`1`", "`\"1\"`"], 1, "`any` is `True` as soon as one item is true, and `\"1\"` is a digit."),
    mc("When is `all(...)` true?", ["When at least one item is true", "Never", "Only when every item is true", "When the list is long"], 2, "`all` is `True` only if no item is false."),
    mc("What does `all(len(p) >= 8 for p in [\"sunshine\", \"abc\"])` give?", ["`True`", "`[True, False]`", "`False`", "`1`"], 2, "`all` is only true when every item passes. `\"abc\"` is shorter than 8, so the answer is `False`."),
    mc("What does `\"!\".isalnum()` return?", ["`True`", "`\"!\"`", "An error", "`False`"], 3, "`!` is neither a letter nor a digit, so `.isalnum()` is `False`."),
    qShort("What is `sum([True, False, True, True])`? (a number)", "3", "`True` counts as 1 and `False` as 0, so summing the results of the rules counts how many passed."),
    mc("`feedback` returns a list. Why not print the tips inside it?", ["Lists can't be printed", "Returning lets the caller decide how to show them, and makes them easy to check", "Printing is slower", "It must return something"], 1, "Returning the tips leaves showing them to the caller, and a list is easy to test."),
  ],
})
