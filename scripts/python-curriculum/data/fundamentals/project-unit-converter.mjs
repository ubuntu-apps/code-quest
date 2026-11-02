// Fundamentals project: Unit converter. Lesson, Try-it snippets, challenges and quiz.
import { makeProject, mc, qShort, snippet, task, typedInput } from '../_builders.mjs'

export default makeProject("medium", {
  id: "proj_unit_converter",
  title: "Unit converter",
  paragraphs: [
    "Build a converter that asks for a number and shows it in three other units. It uses the whole of Fundamentals: reading input, converting it to a number, arithmetic, and f-strings for tidy output.",
    "The conversions: 1 km is 0.621371 miles; Fahrenheit is Celsius × 9 / 5 + 32; and 1 kg is 2.20462 lb (pounds). When the user types `10`, the finished program shows:",
    "```\nNumber to convert: 10\n10.0 km = 6.21 miles\n10.0 °C = 50.0 °F\n10.0 kg = 22.05 lb\n```",
    "Remember that `input()` returns text, so turn the answer into a float before doing maths with it. Show the miles and pounds with 2 decimals (`:.2f`) and the temperature with 1 (`:.1f`).",
    "Build it in steps: first each conversion on its own, then reading the number, then the output, and finally the whole program. Type a number in the Input box to try the sandbox.",
  ],
  sandboxCode: "value = float(input(\"Number to convert: \"))\nmiles = value * 0.621371\nprint(f\"{value} km = {miles:.2f} miles\")",
  sandboxSnippets: [
    snippet("km to miles", "km = 10\nprint(km * 0.621371)"),
    snippet("°C to °F", "celsius = 25\nprint(celsius * 9 / 5 + 32)"),
    snippet("kg to lb", "kg = 70\nprint(round(kg * 2.20462, 2))"),
  ],
  challenges: [
    task("easy", "Kilometres to miles", {
      prompt: "Set `miles` to `km` converted to miles (1 km = 0.621371 miles).",
      starter: "km = 10\n",
      hint: "Multiply by the factor: `miles = km * 0.621371`.",
      solution: "km = 10\nmiles = km * 0.621371",
      tests: [
        ["miles is 6.21371", "abs(miles - 6.21371) < 1e-9"],
      ],
    }),
    task("easy", "Celsius to Fahrenheit", {
      prompt: "Set `fahrenheit` to `celsius` converted: times 9, divided by 5, plus 32.",
      starter: "celsius = 25\n",
      hint: "`fahrenheit = celsius * 9 / 5 + 32`. Multiplication and division happen before the addition.",
      solution: "celsius = 25\nfahrenheit = celsius * 9 / 5 + 32",
      tests: [
        ["fahrenheit is 77.0", "fahrenheit == 77.0"],
      ],
    }),
    task("medium", "Kilograms to pounds", {
      prompt: "Set `pounds` to `kg` converted to pounds (1 kg = 2.20462 lb), rounded to 2 decimals.",
      starter: "kg = 70\n",
      hint: "`round(kg * 2.20462, 2)`.",
      solution: "kg = 70\npounds = round(kg * 2.20462, 2)",
      tests: [
        ["pounds is 154.32", "pounds == 154.32"],
      ],
    }),
    task("medium", "Read the number", {
      prompt: "Ask `Number to convert: ` and store the answer in `value` as a float. The check types `10`.",
      hint: "`value = float(input(\"Number to convert: \"))`.",
      solution: "value = float(input(\"Number to convert: \"))",
      setup: typedInput("10"),
      tests: [
        ["value is the float 10.0", "value == 10.0 and isinstance(value, float)"],
      ],
    }),
    task("hard", "Tidy output", {
      prompt: "Print the three result lines for `value`, exactly like this:\n\n```\n10.0 km = 6.21 miles\n10.0 °C = 50.0 °F\n10.0 kg = 22.05 lb\n```\n\nWork each result out inside the f-string.",
      starter: "value = 10.0\n",
      hint: "One f-string per line, for example `f\"{value} km = {value * 0.621371:.2f} miles\"`. The temperature uses `:.1f`.",
      solution: "value = 10.0\nprint(f\"{value} km = {value * 0.621371:.2f} miles\")\nprint(f\"{value} °C = {value * 9 / 5 + 32:.1f} °F\")\nprint(f\"{value} kg = {value * 2.20462:.2f} lb\")",
      tests: [
        ["Prints the three lines", "_cq_stdout.strip().splitlines() == [\"10.0 km = 6.21 miles\", \"10.0 °C = 50.0 °F\", \"10.0 kg = 22.05 lb\"]"],
      ],
    }),
    task("hard", "The whole converter", {
      prompt: "Put it all together: ask `Number to convert: `, then print the three conversions in the same format. The check types `3.5`.",
      hint: "Read the value with `float(input(...))`, then reuse your three f-strings from the last step.",
      solution: "value = float(input(\"Number to convert: \"))\nprint(f\"{value} km = {value * 0.621371:.2f} miles\")\nprint(f\"{value} °C = {value * 9 / 5 + 32:.1f} °F\")\nprint(f\"{value} kg = {value * 2.20462:.2f} lb\")",
      setup: typedInput("3.5"),
      tests: [
        ["Prints the three conversions", "_cq_stdout.strip().splitlines()[-3:] == [\"3.5 km = 2.17 miles\", \"3.5 °C = 38.3 °F\", \"3.5 kg = 7.72 lb\"]"],
      ],
    }),
  ],
  questions: [
    mc("Why wrap `input()` in `float()` here?", ["`input()` returns text, and maths needs a number","`float()` makes input faster","It removes spaces","`print` needs it"], 0, "`input()` always gives text, and a calculation needs a number, so `float()` converts it."),
    mc("`celsius = float(\"25\")`. What is `celsius * 9 / 5 + 32`?", ["`77`", "`77.0`", "`\"77.0\"`", "A `TypeError`"], 1, "`float(\"25\")` gives the number 25.0, and maths with a float (or `/`) gives a float: 77.0."),
    mc("What does `f\"{6.21371:.2f}\"` give?", ["`6.2`","`6.22`","`6.21`","`6.21371`"], 2, "`.2f` keeps two decimal places, and 6.21371 rounds to 6.21."),
    mc("With `c = 25.0` and `f = 77.0`, which line prints `25.0 °C = 77.0 °F`?", ["`print(\"{c} °C = {f} °F\")`", "`print(c, \"°C =\", f, \"°F\", sep=\"\")`", "`print(f\"{c} °C = {f} °F\")`", "`print(f\"{c}°C = {f}°F\")`"], 2, "Only the f-string fills in the values with the spaces as written. Without `f` the braces are printed as they are, and `sep=\"\"` removes the spaces."),
    mc("The user types `abc`. What does `float(input())` do?", ["Returns `0.0`","Raises a `ValueError`","Returns `\"abc\"`","Returns `None`"], 1, "`float()` can't make a number from letters, so it raises a `ValueError`."),
    qShort("What does `print(f\"{-40 * 9 / 5 + 32:.1f}\")` show?", "-40.0", "-40 * 9 / 5 + 32 is -40.0, and `:.1f` shows it with one decimal place."),
  ],
})
