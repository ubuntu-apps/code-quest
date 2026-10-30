// Data structures project: Grade book. Lesson, Try-it snippets, challenges and quiz.
import { makeProject, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeProject("easy", {
  id: "proj_grade_book",
  title: "Grade book",
  paragraphs: [
    "Build a grade book for a small class. Each student's score lives in a dictionary, and the program works out the class average, the top student and a letter grade for everyone, then prints a report sorted from the best score down.",
    "The letter grades: `A` for 90 or more, `B` for 80 or more, `C` for 70 or more, and `F` below that. With the five students in this side quest, the finished report is:",
    "```\nAna: 91 (A)\nCleo: 85 (B)\nBen: 78 (C)\nEli: 72 (C)\nDev: 64 (F)\nAverage: 78.0\n```",
    "Useful pieces: `sum(grades.values())` and `len(grades)` for the average, `max(grades, key=grades.get)` for the top student, and `sorted(grades, key=grades.get, reverse=True)` for the names from best to worst.",
    "Build it in steps: store the scores, add a student, the average, the top student, the letter grades, and finally the whole report.",
  ],
  sandboxCode: "grades = {\"Ana\": 91, \"Ben\": 78, \"Cleo\": 85}\ngrades[\"Dev\"] = 64\naverage = sum(grades.values()) / len(grades)\nprint(f\"Average: {average:.1f}\")\nprint(\"Top:\", max(grades, key=grades.get))\nfor name in sorted(grades, key=grades.get, reverse=True):\n    print(name, grades[name])",
  sandboxSnippets: [
    snippet("Add and change", "grades = {\"Ana\": 91}\ngrades[\"Ben\"] = 78\ngrades[\"Ana\"] = 93\nprint(grades)"),
    snippet("Average", "grades = {\"Ana\": 91, \"Ben\": 78, \"Cleo\": 85}\nprint(sum(grades.values()) / len(grades))"),
    snippet("Best to worst", "grades = {\"Ana\": 91, \"Ben\": 78, \"Cleo\": 85}\nprint(sorted(grades, key=grades.get, reverse=True))"),
  ],
  challenges: [
    task("easy", "Store the scores", {
      prompt: "Create a dict `grades` with these scores: Ana 91, Ben 78, Cleo 85 and Dev 64.",
      hint: "Names are the keys and scores the values: `{\"Ana\": 91, ...}`.",
      solution: "grades = {\"Ana\": 91, \"Ben\": 78, \"Cleo\": 85, \"Dev\": 64}",
      tests: [
        ["grades is right", "grades == {\"Ana\": 91, \"Ben\": 78, \"Cleo\": 85, \"Dev\": 64}"],
      ],
    }),
    task("easy", "A new student", {
      prompt: "Eli joins the class with a score of 72. Add him to `grades`.",
      starter: "grades = {\"Ana\": 91, \"Ben\": 78, \"Cleo\": 85, \"Dev\": 64}\n",
      hint: "Assign to a new key: `grades[\"Eli\"] = 72`.",
      solution: "grades = {\"Ana\": 91, \"Ben\": 78, \"Cleo\": 85, \"Dev\": 64}\ngrades[\"Eli\"] = 72",
      tests: [
        ["Eli is in the grade book", "grades == {\"Ana\": 91, \"Ben\": 78, \"Cleo\": 85, \"Dev\": 64, \"Eli\": 72}"],
      ],
    }),
    task("medium", "The class average", {
      prompt: "Set `average` to the average score.",
      starter: "grades = {\"Ana\": 91, \"Ben\": 78, \"Cleo\": 85, \"Dev\": 64, \"Eli\": 72}\n",
      hint: "Add up the values and divide by the number of students: `sum(grades.values()) / len(grades)`.",
      solution: "grades = {\"Ana\": 91, \"Ben\": 78, \"Cleo\": 85, \"Dev\": 64, \"Eli\": 72}\naverage = sum(grades.values()) / len(grades)",
      tests: [
        ["average is 78.0", "average == 78.0"],
      ],
    }),
    task("medium", "Top of the class", {
      prompt: "Set `top` to the name of the student with the highest score.",
      starter: "grades = {\"Ana\": 91, \"Ben\": 78, \"Cleo\": 85, \"Dev\": 64, \"Eli\": 72}\n",
      hint: "`max` with a key compares the keys by their values: `max(grades, key=grades.get)`.",
      solution: "grades = {\"Ana\": 91, \"Ben\": 78, \"Cleo\": 85, \"Dev\": 64, \"Eli\": 72}\ntop = max(grades, key=grades.get)",
      tests: [
        ["top is Ana", "top == \"Ana\""],
      ],
    }),
    task("hard", "Letter grades", {
      prompt: "Build `letters`: a dict mapping each name to a letter grade (`A` for 90+, `B` for 80+, `C` for 70+, `F` otherwise).",
      starter: "grades = {\"Ana\": 91, \"Ben\": 78, \"Cleo\": 85, \"Dev\": 64, \"Eli\": 72}\n",
      hint: "Start with `letters = {}`. Loop over `grades.items()` and use `if`/`elif`/`else` to pick the letter for each score.",
      solution: "grades = {\"Ana\": 91, \"Ben\": 78, \"Cleo\": 85, \"Dev\": 64, \"Eli\": 72}\nletters = {}\nfor name, score in grades.items():\n    if score >= 90:\n        letters[name] = \"A\"\n    elif score >= 80:\n        letters[name] = \"B\"\n    elif score >= 70:\n        letters[name] = \"C\"\n    else:\n        letters[name] = \"F\"",
      tests: [
        ["letters is right", "letters == {\"Ana\": \"A\", \"Ben\": \"C\", \"Cleo\": \"B\", \"Dev\": \"F\", \"Eli\": \"C\"}"],
      ],
    }),
    task("hard", "The report", {
      prompt: "Print the report from the intro: one line per student from the highest score to the lowest, like `Ana: 91 (A)`, then `Average: 78.0`.",
      starter: "grades = {\"Ana\": 91, \"Ben\": 78, \"Cleo\": 85, \"Dev\": 64, \"Eli\": 72}\nletters = {\"Ana\": \"A\", \"Ben\": \"C\", \"Cleo\": \"B\", \"Dev\": \"F\", \"Eli\": \"C\"}\n",
      hint: "Loop over `sorted(grades, key=grades.get, reverse=True)` and print `f\"{name}: {grades[name]} ({letters[name]})\"`. Work out the average and print it with `:.1f` after the loop.",
      solution: "grades = {\"Ana\": 91, \"Ben\": 78, \"Cleo\": 85, \"Dev\": 64, \"Eli\": 72}\nletters = {\"Ana\": \"A\", \"Ben\": \"C\", \"Cleo\": \"B\", \"Dev\": \"F\", \"Eli\": \"C\"}\nfor name in sorted(grades, key=grades.get, reverse=True):\n    print(f\"{name}: {grades[name]} ({letters[name]})\")\naverage = sum(grades.values()) / len(grades)\nprint(f\"Average: {average:.1f}\")",
      tests: [
        ["Prints the report", "_cq_stdout.strip().splitlines() == [\"Ana: 91 (A)\", \"Cleo: 85 (B)\", \"Ben: 78 (C)\", \"Eli: 72 (C)\", \"Dev: 64 (F)\", \"Average: 78.0\"]"],
      ],
    }),
  ],
  questions: [
    mc("With `grades = {\"Ana\": 91, \"Ben\": 78}`, what is `min(grades, key=grades.get)`?", ["`78`", "`'Ben'`", "`'Ana'`", "`('Ben', 78)`"], 1),
    mc("What does `grades.values()` give?", ["The scores", "The names", "The `(name, score)` pairs", "The number of students"], 0),
    mc("What does `max(grades, key=grades.get)` return?", ["The highest score", "The last name", "A sorted list", "The name with the highest score"], 3),
    mc("What does this print?\n\n```\nscore = 80\nif score >= 90:\n    print(\"A\")\nelif score >= 80:\n    print(\"B\")\nelif score >= 70:\n    print(\"C\")\n```", ["`A`", "`C`", "`B` and then `C`", "`B`"], 3),
    qShort("What is `len({\"Ana\": 91, \"Ben\": 78})`? (a number)", "2"),
    mc("Which gives the names from the best score to the worst?", ["`sorted(grades)`", "`sorted(grades, key=grades.get, reverse=True)`", "`grades.sort()`", "`reversed(grades)`"], 1),
  ],
})
