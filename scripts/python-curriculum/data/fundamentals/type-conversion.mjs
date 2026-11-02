// Fundamentals topic: Converting types. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: "type_conversion",
  title: "Converting types",
  paragraphs: [
    "Often a value has the wrong type for the job: text that holds a number, or a number you want to put into text. Each type's name works as a converter: `int()`, `float()`, `str()` and `bool()`.",
    "```\nprint(int(\"42\") + 1)       # 43\nprint(float(\"2.5\") * 2)    # 5.0\nprint(\"Age: \" + str(30))   # Age: 30\n```",
    "`int()` on a float **cuts off** the fraction; it doesn't round. `int(3.9)` is `3`, and `int(-3.9)` is `-3`. Use `round()` when you want the nearest whole number.",
    "Turning text into a number only works when the text looks like that number. `int(\"42\")` works, and so does `int(\" 42 \")`, because spaces around the digits are ignored. But `int(\"4.5\")`, `int(\"42 kg\")` and `int(\"\")` all raise a `ValueError`. `float(\"4.5\")` works, and to get an int from `\"4.5\"`, go through float first: `int(float(\"4.5\"))`.",
    "`int()` can also read numbers written in other bases, if you tell it which: `int(\"ff\", 16)` is `255` (hexadecimal, as in colour codes) and `int(\"101\", 2)` is `5` (binary).",
    "`bool()` follows Python's idea of **truthiness**. Zero and \"empty\" values are falsy: `0`, `0.0`, `\"\"` and `None` all give `False`. Everything else is truthy and gives `True`, including the texts `\"0\"` and `\"False\"`, because they aren't empty.",
    "```\nprint(bool(0), bool(\"\"), bool(None))   # False False False\nprint(bool(7), bool(\"0\"), bool(\" \"))   # True True True\n```",
    "`str()` works on any value: `str(3.5)` is `\"3.5\"` and `str(True)` is `\"True\"`. f-strings call it for you, which is why they're usually the easiest way to mix text and numbers.",
    "Converting gives you a **new** value; it doesn't change the variable. `int(x)` on a line by itself does nothing useful. Write `x = int(x)` to keep the result.",
  ],
  sandboxCode: "print(int(\"42\") + 1, float(\"2.5\") * 2)\nprint(int(3.9), round(3.9))\nprint(bool(0), bool(\"\"), bool(\"0\"), bool(\"False\"))\nprint(int(\"ff\", 16), \"Age: \" + str(30))",
  sandboxSnippets: [
    snippet("Text to number", "a = \"12\"\nb = \"30\"\nprint(a + b)\nprint(int(a) + int(b))"),
    snippet("Cut, not round", "print(int(3.9), int(-3.9))\nprint(round(3.9), round(-3.9))"),
    snippet("A ValueError", "# Run this to see the error. Then change \"4.5\" to \"4\".\nprint(int(\"4.5\"))"),
    snippet("Truthiness", "print(bool(0), bool(0.0), bool(\"\"), bool(None))\nprint(bool(1), bool(-2), bool(\"0\"), bool(\"False\"))"),
    snippet("Other bases", "print(int(\"ff\", 16))\nprint(int(\"101\", 2))\nprint(int(\"777\", 8))"),
  ],
  readMore: { label: "Python docs: int()", url: "https://docs.python.org/3/library/functions.html#int", source: "Python docs" },
  challenges: [
    task("easy", "Add two text numbers", {
      prompt: "Set `total` to the sum of the numbers in `a` and `b`. They are text, so convert them first.",
      starter: "a = \"12\"\nb = \"30\"\n",
      hint: "`int(a) + int(b)`. Without `int`, `+` would join the texts into `\"1230\"`.",
      solution: "a = \"12\"\nb = \"30\"\ntotal = int(a) + int(b)",
      tests: [
        ["total is the number 42", "total == 42 and isinstance(total, int)"],
      ],
    }),
    task("easy", "A number in a sentence", {
      prompt: "Set `message` to `You have 250 points`, joining the texts and `points` with `+`.",
      starter: "points = 250\n",
      hint: "Convert the number with `str(points)` before joining: `\"You have \" + str(points) + \" points\"`.",
      solution: "points = 250\nmessage = \"You have \" + str(points) + \" points\"",
      tests: [
        ["message is right", "message == \"You have 250 points\""],
      ],
    }),
    task("easy", "Text with decimals", {
      prompt: "Set `kg` to the number in `weight`, as a float.",
      starter: "weight = \"72.5\"\n",
      hint: "`float(weight)` reads text with a decimal point.",
      solution: "weight = \"72.5\"\nkg = float(weight)",
      tests: [
        ["kg is the float 72.5", "kg == 72.5 and isinstance(kg, float)"],
      ],
    }),
    task("medium", "Cut or round?", {
      prompt: "Set `cut` to `value` with the fraction cut off, and `nearest` to `value` rounded to the nearest whole number.",
      starter: "value = 7.8\n",
      hint: "`int(value)` cuts off the fraction; `round(value)` rounds it.",
      solution: "value = 7.8\ncut = int(value)\nnearest = round(value)",
      tests: [
        ["cut is 7", "cut == 7"],
        ["nearest is 8", "nearest == 8"],
      ],
    }),
    task("medium", "Text with a decimal point", {
      prompt: "Set `whole` to the whole-number part of `reading`, as an int. `int(reading)` alone fails; why?",
      starter: "reading = \"19.6\"\n",
      hint: "`int()` can't read `\"19.6\"` directly. Turn it into a float first: `int(float(reading))`.",
      solution: "reading = \"19.6\"\nwhole = int(float(reading))",
      tests: [
        ["whole is 19", "whole == 19 and isinstance(whole, int)"],
      ],
    }),
    task("medium", "Count the truthy values", {
      prompt: "Set `truthy_count` to how many of `v1` to `v4` are truthy, by adding up `bool()` of each.",
      starter: "v1, v2, v3, v4 = 0, \"0\", \"\", 3.5\n",
      hint: "`bool(v1) + bool(v2) + bool(v3) + bool(v4)`. Remember: `\"0\"` is not empty, so it is truthy.",
      solution: "v1, v2, v3, v4 = 0, \"0\", \"\", 3.5\ntruthy_count = bool(v1) + bool(v2) + bool(v3) + bool(v4)",
      tests: [
        ["truthy_count is 2", "truthy_count == 2"],
      ],
    }),
    task("hard", "Fix the crash", {
      prompt: "This program crashes, because `qty` is text. Fix it so it prints `Total: 7.5`.",
      starter: "qty = \"3\"\nprice = 2.5\ntotal = qty * price\nprint(\"Total:\", total)",
      hint: "Convert `qty` to an int before multiplying, for example `total = int(qty) * price`.",
      solution: "qty = \"3\"\nprice = 2.5\ntotal = int(qty) * price\nprint(\"Total:\", total)",
      tests: [
        ["total is 7.5", "total == 7.5"],
        ["Prints Total: 7.5", "_cq_stdout.strip() == \"Total: 7.5\""],
      ],
    }),
    task("hard", "Read a colour code", {
      prompt: "The colour `#ff8c00` is three hexadecimal numbers. Set `red`, `green` and `blue` to their values as ints.",
      starter: "hex_red = \"ff\"\nhex_green = \"8c\"\nhex_blue = \"00\"\n",
      hint: "Tell `int` the base: `int(hex_red, 16)`.",
      solution: "hex_red = \"ff\"\nhex_green = \"8c\"\nhex_blue = \"00\"\nred = int(hex_red, 16)\ngreen = int(hex_green, 16)\nblue = int(hex_blue, 16)",
      tests: [
        ["red is 255", "red == 255"],
        ["green is 140", "green == 140"],
        ["blue is 0", "blue == 0"],
      ],
    }),
    task("expert", "Clean up the number", {
      prompt: "Set `amount` to the number in `raw` as an int. It has spaces around it and a comma as a thousands separator.",
      starter: "raw = \" 1,250 \"\n",
      hint: "Clean the text first: `raw.strip().replace(\",\", \"\")` gives `\"1250\"`. Then `int(...)` it.",
      solution: "raw = \" 1,250 \"\namount = int(raw.strip().replace(\",\", \"\"))",
      tests: [
        ["amount is 1250", "amount == 1250 and isinstance(amount, int)"],
      ],
    }),
    task("expert", "Average of text scores", {
      prompt: "Set `average` to the average of the three scores, and `label` to `Average: 86.5` with one decimal.",
      starter: "s1, s2, s3 = \"88\", \"92.5\", \"79\"\n",
      hint: "Convert each score with `float`, add them in brackets and divide by 3. Then `label = f\"Average: {average:.1f}\"`.",
      solution: "s1, s2, s3 = \"88\", \"92.5\", \"79\"\naverage = (float(s1) + float(s2) + float(s3)) / 3\nlabel = f\"Average: {average:.1f}\"",
      tests: [
        ["average is 86.5", "abs(average - 86.5) < 1e-9"],
        ["label is Average: 86.5", "label == \"Average: 86.5\""],
      ],
    }),
  ],
  questions: [
    mc("What is `int(\"42\") + 1`?", ["`\"421\"`","`43`","`421`","An error"], 1, "`int(\"42\")` turns the text into the number 42, and 42 + 1 is 43."),
    mc("What is `int(3.9)`?", ["`4`","`3.9`","`3`","An error"], 2, "`int()` on a float cuts off the decimal part instead of rounding."),
    mc("What does `int(\"4.5\")` give?", ["`4`","`5`","`4.5`","A `ValueError`"], 3, "`int()` only accepts text that looks like a whole number, so `\"4.5\"` is rejected."),
    qShort("Which error does `int(\"hello\")` raise? (class name)", "ValueError", "`ValueError` means the type was right (a string) but its value can't be converted."),
    mc("What is `bool(\"0\")`?", ["`False`","`True`","`0`","An error"], 1, "Any non-empty string is truthy, even `\"0\"`, because only the empty string is falsy."),
    mc("Which of these is falsy?", ["`\"False\"`", "`\" \"`", "`0`", "`\"0\"`"], 2, "`0` is falsy, while every non-empty string, including `\"0\"`, `\" \"` and `\"False\"`, is truthy."),
    mc("What is `str(2.50)`?", ["`\"2.5\"`", "`\"2.50\"`", "`2.5`", "An error"], 0, "Converting a float to text uses its shortest form, so the trailing 0 disappears."),
    mc("What is `int(\"101\", 2)`?", ["`101`","`2`","`5`","`3`"], 2, "The second argument is the base: `101` in binary is 4 + 0 + 1, which is 5."),
    mc("After `x = \"7\"` and then `int(x)` on its own line, what type is `x`?", ["`int`","`str`, because the result was never stored","`float`","`None`"], 1, "Conversions return a new value; `x` stays the string `\"7\"` until you write `x = int(x)`."),
    mc("Which turns `\"4.5\"` into the int 4?", ["`int(\"4.5\")`", "`int(float(\"4.5\"))`", "`float(int(\"4.5\"))`", "`round(\"4.5\")`"], 1, "`float()` reads the decimal text first, then `int()` cuts off the .5."),
  ],
})
