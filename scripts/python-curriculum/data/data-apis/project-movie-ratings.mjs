// Data and APIs project: Movie ratings. Lesson, Try-it snippets, challenges and quiz.
import { makeProject, mc, qShort, snippet, task } from '../_builders.mjs'

export default makeProject("easy", {
  id: "proj_movie_ratings",
  title: "Movie ratings",
  paragraphs: [
    "A film club collects its members' ratings in a CSV file, one rating of 1 to 5 stars per line. Turn the file into something useful: the average for each movie, the top picks, a JSON report for the club's website, and a summary to print.",
    "```\nmovie,user,stars\nHarbor,ana,5\nHarbor,ben,4\nComet,ana,4\nTinsel,ana,two\n```",
    "Real files are messy. Someone typed `two` instead of `2`, someone left the stars empty, and someone gave a film 6 stars. The program skips those rows but notes each one, with its line number in the file, so nothing disappears silently. The finished summary looks like this:",
    "```\n7 ratings of 4 movies, 3 skipped\nHarbor  ★★★★★ 4.5\nComet   ★★★★☆ 4.0\nGlacier ★★★★☆ 4.0\nTinsel  ★☆☆☆☆ 1.0\n```",
  ],
  sandboxCode: "import csv\nfrom io import StringIO\n\ndata = \"movie,stars\\nHarbor,5\\nHarbor,4\\nComet,3\\n\"\ntotals = {}\nfor row in csv.DictReader(StringIO(data)):\n    totals.setdefault(row[\"movie\"], []).append(int(row[\"stars\"]))\nprint({movie: sum(s) / len(s) for movie, s in totals.items()})",
  sandboxSnippets: [
    snippet("Group values", "groups = {}\nfor movie, stars in [(\"Harbor\", 5), (\"Comet\", 3), (\"Harbor\", 4)]:\n    groups.setdefault(movie, []).append(stars)\nprint(groups)"),
    snippet("Sort by score, then name", "avgs = {\"Glacier\": 4.0, \"Harbor\": 4.5, \"Comet\": 4.0}\nprint(sorted(avgs.items(), key=lambda item: (-item[1], item[0])))"),
    snippet("Stars", "avg = 3.6\nfull = int(avg + 0.5)\nprint(\"★\" * full + \"☆\" * (5 - full))"),
  ],
  challenges: [
    task("easy", "Load the ratings", {
      prompt: "Define `load_ratings(path)` that reads the CSV file into a list of dicts with keys `movie`, `user` and `stars`, with `stars` as an int. (This file has no bad rows.)",
      starter: "import csv\nimport json\n\n",
      hint: "Open with `newline=\"\"`, loop over `csv.DictReader(f)`, and convert `row[\"stars\"]` with `int`.",
      solution: "import csv\nimport json\n\ndef load_ratings(path):\n    with open(path, newline=\"\", encoding=\"utf-8\") as f:\n        return [{\"movie\": r[\"movie\"], \"user\": r[\"user\"], \"stars\": int(r[\"stars\"])} for r in csv.DictReader(f)]\n",
      setup: "import os as _os\nwith open('good.csv', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('movie,user,stars\\nHarbor,ana,5\\nHarbor,ben,4\\nComet,ana,4\\nComet,cy,5\\nComet,ben,3\\nTinsel,cy,1\\n')\n",
      tests: [
        ["Six ratings", "len(load_ratings(\"good.csv\")) == 6"],
        ["The first", "load_ratings(\"good.csv\")[0] == {\"movie\": \"Harbor\", \"user\": \"ana\", \"stars\": 5}"],
      ],
    }),
    task("medium", "Averages", {
      prompt: "Define `averages(ratings)` that returns a dict from movie to its average stars, rounded to 1 place.",
      starter: "import csv\nimport json\n\n",
      hint: "Collect each movie's stars in a list with `setdefault`, then average them.",
      solution: "import csv\nimport json\n\ndef averages(ratings):\n    totals = {}\n    for r in ratings:\n        totals.setdefault(r[\"movie\"], []).append(r[\"stars\"])\n    return {movie: round(sum(s) / len(s), 1) for movie, s in totals.items()}\n",
      tests: [
        ["Averages", "averages([{\"movie\": \"Harbor\", \"user\": \"a\", \"stars\": 5}, {\"movie\": \"Harbor\", \"user\": \"b\", \"stars\": 4}, {\"movie\": \"Comet\", \"user\": \"a\", \"stars\": 3}]) == {\"Harbor\": 4.5, \"Comet\": 3.0}"],
        ["None", "averages([]) == {}"],
      ],
    }),
    task("medium", "Top picks", {
      prompt: "Define `top_movies(avgs, n=3)` that returns the names of the `n` best movies, highest average first, with ties in alphabetical order.",
      starter: "import csv\nimport json\n\n",
      hint: "Sort the items by `(-average, name)`.",
      solution: "import csv\nimport json\n\ndef top_movies(avgs, n=3):\n    ranked = sorted(avgs.items(), key=lambda item: (-item[1], item[0]))\n    return [movie for movie, avg in ranked[:n]]\n",
      tests: [
        ["Top 3", "top_movies({\"Glacier\": 4.0, \"Harbor\": 4.5, \"Comet\": 4.0, \"Tinsel\": 1.0}) == [\"Harbor\", \"Comet\", \"Glacier\"]"],
        ["Top 1", "top_movies({\"Orbit\": 2.0, \"Tinsel\": 1.0}, 1) == [\"Orbit\"]"],
      ],
    }),
    task("hard", "Skip the bad rows", {
      prompt: "Change `load_ratings` to return `(ratings, problems)`: skip rows whose stars aren't a whole number (`line 8: bad stars 'two'`) or aren't 1 to 5 (`line 11: stars out of range 6`), counting the header as line 1.",
      starter: "import csv\nimport json\n\ndef load_ratings(path):\n    with open(path, newline=\"\", encoding=\"utf-8\") as f:\n        return [{\"movie\": r[\"movie\"], \"user\": r[\"user\"], \"stars\": int(r[\"stars\"])} for r in csv.DictReader(f)]\n",
      hint: "`enumerate(csv.DictReader(f), start=2)` gives each row's line number. Put `int(...)` in `try` and check the range after.",
      solution: "import csv\nimport json\n\ndef load_ratings(path):\n    ratings = []\n    problems = []\n    with open(path, newline=\"\", encoding=\"utf-8\") as f:\n        for line, row in enumerate(csv.DictReader(f), start=2):\n            try:\n                stars = int(row[\"stars\"])\n            except ValueError:\n                problems.append(f\"line {line}: bad stars {row['stars']!r}\")\n                continue\n            if not 1 <= stars <= 5:\n                problems.append(f\"line {line}: stars out of range {stars}\")\n                continue\n            ratings.append({\"movie\": row[\"movie\"], \"user\": row[\"user\"], \"stars\": stars})\n    return ratings, problems\n",
      setup: "import os as _os\nwith open('ratings.csv', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('movie,user,stars\\nHarbor,ana,5\\nHarbor,ben,4\\nComet,ana,4\\nComet,cy,5\\nComet,ben,3\\nTinsel,cy,1\\nTinsel,ana,two\\nGlacier,ben,\\nGlacier,cy,4\\nOrbit,ana,6\\n')\n",
      tests: [
        ["The good rows", "len(load_ratings(\"ratings.csv\")[0]) == 7"],
        ["The problems", "load_ratings(\"ratings.csv\")[1] == [\"line 8: bad stars 'two'\", \"line 9: bad stars ''\", \"line 11: stars out of range 6\"]"],
      ],
    }),
    task("hard", "A JSON report", {
      prompt: "Define `save_report(avgs, path)` that writes the averages to a JSON file, indented by 2 with the keys sorted.",
      starter: "import csv\nimport json\n\n",
      hint: "`json.dump(avgs, f, indent=2, sort_keys=True)` with the file open for writing.",
      solution: "import csv\nimport json\n\ndef save_report(avgs, path):\n    with open(path, \"w\", encoding=\"utf-8\") as f:\n        json.dump(avgs, f, indent=2, sort_keys=True)\n",
      tests: [
        ["Reads back", "(save_report({\"Harbor\": 4.5, \"Comet\": 4.0}, \"report.json\"), __import__(\"json\").load(open(\"report.json\")))[1] == {\"Comet\": 4.0, \"Harbor\": 4.5}"],
        ["Pretty", "(save_report({\"b\": 1.0, \"a\": 2.0}, \"r2.json\"), open(\"r2.json\").read())[1] == '{\\n  \"a\": 2.0,\\n  \"b\": 1.0\\n}'"],
      ],
    }),
    task("expert", "The summary", {
      prompt: "Define `summary(path)` returning the lines shown in the intro: a count line, then every movie, best first, as its name padded to 8 characters, five stars (`★` for each star of the average rounded half up, `☆` for the rest) and the average.",
      starter: "import csv\nimport json\n\ndef load_ratings(path):\n    ratings = []\n    problems = []\n    with open(path, newline=\"\", encoding=\"utf-8\") as f:\n        for line, row in enumerate(csv.DictReader(f), start=2):\n            try:\n                stars = int(row[\"stars\"])\n            except ValueError:\n                problems.append(f\"line {line}: bad stars {row['stars']!r}\")\n                continue\n            if not 1 <= stars <= 5:\n                problems.append(f\"line {line}: stars out of range {stars}\")\n                continue\n            ratings.append({\"movie\": row[\"movie\"], \"user\": row[\"user\"], \"stars\": stars})\n    return ratings, problems\n\ndef averages(ratings):\n    totals = {}\n    for r in ratings:\n        totals.setdefault(r[\"movie\"], []).append(r[\"stars\"])\n    return {movie: round(sum(s) / len(s), 1) for movie, s in totals.items()}\n\ndef top_movies(avgs, n=3):\n    ranked = sorted(avgs.items(), key=lambda item: (-item[1], item[0]))\n    return [movie for movie, avg in ranked[:n]]\n\n",
      hint: "Use your functions. `f\"{movie:<8}\"` pads the name; Round the average half up for the full stars, with `int(avg + 0.5)`: `round(4.5)` gives 4, because Python rounds halves to the even number.",
      solution: "import csv\nimport json\n\ndef load_ratings(path):\n    ratings = []\n    problems = []\n    with open(path, newline=\"\", encoding=\"utf-8\") as f:\n        for line, row in enumerate(csv.DictReader(f), start=2):\n            try:\n                stars = int(row[\"stars\"])\n            except ValueError:\n                problems.append(f\"line {line}: bad stars {row['stars']!r}\")\n                continue\n            if not 1 <= stars <= 5:\n                problems.append(f\"line {line}: stars out of range {stars}\")\n                continue\n            ratings.append({\"movie\": row[\"movie\"], \"user\": row[\"user\"], \"stars\": stars})\n    return ratings, problems\n\ndef averages(ratings):\n    totals = {}\n    for r in ratings:\n        totals.setdefault(r[\"movie\"], []).append(r[\"stars\"])\n    return {movie: round(sum(s) / len(s), 1) for movie, s in totals.items()}\n\ndef top_movies(avgs, n=3):\n    ranked = sorted(avgs.items(), key=lambda item: (-item[1], item[0]))\n    return [movie for movie, avg in ranked[:n]]\n\ndef stars_text(avg):\n    full = int(avg + 0.5)   # round halves up\n    return \"★\" * full + \"☆\" * (5 - full)\n\n\ndef summary(path):\n    ratings, problems = load_ratings(path)\n    avgs = averages(ratings)\n    lines = [f\"{len(ratings)} ratings of {len(avgs)} movies, {len(problems)} skipped\"]\n    for movie in top_movies(avgs, len(avgs)):\n        lines.append(f\"{movie:<8}{stars_text(avgs[movie])} {avgs[movie]}\")\n    return lines\n",
      setup: "import os as _os\nwith open('ratings.csv', \"w\", encoding=\"utf-8\") as _f:\n    _f.write('movie,user,stars\\nHarbor,ana,5\\nHarbor,ben,4\\nComet,ana,4\\nComet,cy,5\\nComet,ben,3\\nTinsel,cy,1\\nTinsel,ana,two\\nGlacier,ben,\\nGlacier,cy,4\\nOrbit,ana,6\\n')\n",
      tests: [
        ["The summary", "summary(\"ratings.csv\") == [\"7 ratings of 4 movies, 3 skipped\", \"Harbor  ★★★★★ 4.5\", \"Comet   ★★★★☆ 4.0\", \"Glacier ★★★★☆ 4.0\", \"Tinsel  ★☆☆☆☆ 1.0\"]"],
      ],
    }),
  ],
  questions: [
    mc("Why does `load_ratings` note skipped rows instead of ignoring them?", ["It is faster", "So nothing disappears silently", "CSV requires it", "To make the file smaller"], 1),
    mc("Why start the line count at 2 with `enumerate(..., start=2)`?", ["Lists start at 2", "To skip a row", "Line 1 of the file is the header", "It is a typo"], 2),
    mc("What does `sort_keys=True` do in `json.dump`?", ["Writes the keys in alphabetical order", "Sorts the values", "Removes duplicates", "Nothing for dicts"], 0),
    mc("How does sorting by `(-average, name)` order movies?", ["By name only", "Lowest first", "Randomly", "Highest average first, ties alphabetically"], 3),
    qShort("What is the average of 5 and 4, rounded to 1 place?", "4.5"),
    mc("Why is `\"two\"` skipped?", ["It is a word, so `int()` raises `ValueError`", "It is too long", "It is lowercase", "Two stars aren't allowed"], 0),
  ],
})
