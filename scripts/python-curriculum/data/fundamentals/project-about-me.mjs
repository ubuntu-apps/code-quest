// Fundamentals project: About me card. Lesson, Try-it snippets, challenges and quiz.
import { makeProject, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeProject("easy", {
  id: "proj_about_me_card",
  title: "About me card",
  paragraphs: [
    "Time to build something. In this side quest you'll make a little profile card, step by step, using what you've learned: variables, maths, string methods and f-strings. Each challenge adds one piece, and the last one puts the whole card together.",
    "This is the finished card:",
    "```\n==========================\nSAM RIVERA\nAge: 28 (born 1998)\nHobby: rock climbing\nDays lived: about 10,220\n==========================\n```",
    "The details live in variables at the top of the program, and everything else is worked out from them. Change the name or the birth year, and the whole card updates. That's the point of variables.",
    "Useful pieces: `upper()` for the name, subtraction for the age, `:,` in an f-string for the thousands separator, and `\"=\" * 26` for the border lines. Try your own card in the sandbox first!",
  ],
  sandboxCode: "name = \"Your Name\"\nbirth_year = 2000\nhobby = \"your hobby\"\nage = 2026 - birth_year\n\nprint(\"=\" * 26)\nprint(name.upper())\nprint(f\"Age: {age} (born {birth_year})\")\nprint(f\"Hobby: {hobby}\")\nprint(\"=\" * 26)",
  sandboxSnippets: [
    snippet("Details", "name = \"Sam Rivera\"\nbirth_year = 1998\nhobby = \"rock climbing\"\nprint(name, birth_year, hobby)"),
    snippet("Age and days", "age = 2026 - 1998\nprint(age, f\"{age * 365:,}\")"),
    snippet("Heading", "print(\"sam rivera\".upper())\nprint(\"=\" * 26)"),
  ],
  challenges: [
    task("easy", "Your details", {
      prompt: "Create the three details: `name` is `Sam Rivera`, `birth_year` is `1998` and `hobby` is `rock climbing`.",
      hint: "Two strings and one int: `name = \"Sam Rivera\"`, `birth_year = 1998`, `hobby = \"rock climbing\"`.",
      solution: "name = \"Sam Rivera\"\nbirth_year = 1998\nhobby = \"rock climbing\"",
      tests: [
        ["name is Sam Rivera", "name == \"Sam Rivera\""],
        ["birth_year is 1998", "birth_year == 1998"],
        ["hobby is rock climbing", "hobby == \"rock climbing\""],
      ],
    }),
    task("easy", "Work out the age", {
      prompt: "Set `age` from `current_year` and `birth_year`.",
      starter: "birth_year = 1998\ncurrent_year = 2026\n",
      hint: "Subtract: `age = current_year - birth_year`.",
      solution: "birth_year = 1998\ncurrent_year = 2026\nage = current_year - birth_year",
      tests: [
        ["age is 28", "age == 28"],
      ],
    }),
    task("medium", "Name in capitals", {
      prompt: "Set `heading` to the name in capital letters.",
      starter: "name = \"Sam Rivera\"\n",
      hint: "`heading = name.upper()`.",
      solution: "name = \"Sam Rivera\"\nheading = name.upper()",
      tests: [
        ["heading is SAM RIVERA", "heading == \"SAM RIVERA\""],
      ],
    }),
    task("medium", "Days lived", {
      prompt: "Set `days` to roughly how many days Sam has lived (age times 365), and `days_text` to that number with a thousands separator, as text.",
      starter: "age = 28\n",
      hint: "`days = age * 365`, then `days_text = f\"{days:,}\"`.",
      solution: "age = 28\ndays = age * 365\ndays_text = f\"{days:,}\"",
      tests: [
        ["days is 10220", "days == 10220"],
        ["days_text is 10,220", "days_text == \"10,220\""],
      ],
    }),
    task("hard", "One line of the card", {
      prompt: "Set `age_line` to the text `Age: 28 (born 1998)`, built with an f-string from the variables.",
      starter: "birth_year = 1998\nage = 28\n",
      hint: "Put both variables in one f-string: `f\"Age: {age} (born {birth_year})\"`.",
      solution: "birth_year = 1998\nage = 28\nage_line = f\"Age: {age} (born {birth_year})\"",
      tests: [
        ["age_line is right", "age_line == \"Age: 28 (born 1998)\""],
      ],
    }),
    task("hard", "Print the card", {
      prompt: "Everything is ready in the variables. Print the whole card, exactly as shown in the intro: the border, the heading, three detail lines and the border again.",
      starter: "name = \"Sam Rivera\"\nbirth_year = 1998\nhobby = \"rock climbing\"\ncurrent_year = 2026\nage = current_year - birth_year\nheading = name.upper()\ndays = age * 365\nborder = \"=\" * 26\n",
      hint: "Six `print` calls. Use `border` and `heading` as they are, and f-strings for the three detail lines; the days need `{days:,}`.",
      solution: "name = \"Sam Rivera\"\nbirth_year = 1998\nhobby = \"rock climbing\"\ncurrent_year = 2026\nage = current_year - birth_year\nheading = name.upper()\ndays = age * 365\nborder = \"=\" * 26\nprint(border)\nprint(heading)\nprint(f\"Age: {age} (born {birth_year})\")\nprint(f\"Hobby: {hobby}\")\nprint(f\"Days lived: about {days:,}\")\nprint(border)",
      tests: [
        ["Prints the card", "_cq_stdout.strip().splitlines() == [\"=\" * 26, \"SAM RIVERA\", \"Age: 28 (born 1998)\", \"Hobby: rock climbing\", \"Days lived: about 10,220\", \"=\" * 26]"],
      ],
    }),
  ],
  questions: [
    mc("What does this print?\n\n```\nname = \"Sam\"\nprint(\"Hi\", name)\nname = \"Ana\"\n```", ["`Hi Sam`", "`Hi Ana`", "`Hi name`", "`Hi Sam` and then `Hi Ana`"], 0),
    mc("What does `\"sam rivera\".upper()` give?", ["`Sam Rivera`","`SAM RIVERA`","`sam rivera`","`SAM rivera`"], 1),
    mc("What does `f\"{10220:,}\"` give?", ["`10220`","`10.220`","`10,220`","`10 220`"], 2),
    mc("What does `\"=\" * 5` give?", ["`=5`","`5=`","An error","`=====`"], 3),
    mc("With `born = 1998` and `year = 2026`, what does `print(f\"Age: {year - born}\")` show?", ["`Age: year - born`", "`Age: {28}`", "`Age:28`", "`Age: 28`"], 3),
    qShort("Which string method turns every letter into a capital? (name only)", "upper"),
  ],
})
