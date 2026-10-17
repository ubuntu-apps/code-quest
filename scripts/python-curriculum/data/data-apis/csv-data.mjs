import { makeTopic, mc, py, qShort, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: 'csv_data',
  title: 'CSV data',
  paragraphs: [
    "CSV (\"comma-separated values\") is the simplest table format: one row per line, values separated by commas, and usually a first line (the header) with the column names. Spreadsheets and databases can all export it.",
    "```\nname,score\nAna,90\nBob,85\n```",
    "Python's `csv` module reads and writes CSV correctly, including tricky cases, so you don't have to split lines yourself. It works with files and with `io.StringIO`, which wraps a string so it behaves like an open file. The examples here use `StringIO`, so you can try everything without creating files.",
    "`csv.reader` gives you each row as a list of strings. `csv.DictReader` reads the header first and gives each row as a dict, so you can write `row[\"score\"]` instead of remembering that the score is `row[1]`.",
    "```\nimport csv\nfrom io import StringIO\n\ndata = \"name,score\\nAna,90\\nBob,85\\n\"\nfor row in csv.DictReader(StringIO(data)):\n    print(row[\"name\"], row[\"score\"])\n```",
    "Every value csv reads is a **string**, even `90`, so `sum(row[\"score\"] for row in rows)` fails. Convert first with `int(...)` or `float(...)`. If some rows may be empty or broken, put the conversion in `try`/`except ValueError` and skip those rows.",
    "To write, create a `csv.writer` and call `writerow` for one row or `writerows` for many. `csv.DictWriter` writes dicts: give it the `fieldnames`, call `writeheader()` to write the header row, then `writerows`. When a value contains a comma, csv puts it in quotes, like `\"Lee, Jr.\"`, so it stays one value.",
    "```\nbuf = StringIO()\nwriter = csv.writer(buf)\nwriter.writerow([\"name\", \"score\"])\nwriter.writerows([[\"Ana\", 90], [\"Lee, Jr.\", 85]])\nprint(buf.getvalue())\n```",
    "Not every CSV uses commas. Many European exports separate values with `;`, because there the comma is the decimal point (`1,5`). Pass `delimiter=\";\"` to the reader, and swap the decimal comma before converting: `float(\"1,5\".replace(\",\", \".\"))`.",
    "With real files, open them with `newline=\"\"`, because the csv module handles line endings itself (otherwise you can get blank rows on Windows), and with `encoding=\"utf-8\"`, so names like Zoë survive: `open(\"people.csv\", \"w\", newline=\"\", encoding=\"utf-8\")`.",
    "To total a column per group, loop over the rows and add to a dict: `totals[region] = totals.get(region, 0) + amount`. For bigger analyses, pandas (later in this chapter) reads a CSV into a table you can filter and group in one line.",
  ],
  sandboxCode: "import csv\nfrom io import StringIO\n\ndata = \"name,score\\nAna,90\\nBob,85\\nCleo,80\\n\"\nrows = list(csv.DictReader(StringIO(data)))\nprint(rows[0])\nprint(sum(int(row[\"score\"]) for row in rows))",
  sandboxSnippets: [
    snippet("Rows as lists", "import csv\nfrom io import StringIO\n\ndata = \"name,score\\nAna,90\\nBob,85\\n\"\nfor row in csv.reader(StringIO(data)):\n    print(row)"),
    snippet("Rows as dicts", "import csv\nfrom io import StringIO\n\ndata = \"name,city\\nAna,Oslo\\nBob,Lima\\n\"\nfor person in csv.DictReader(StringIO(data)):\n    print(person[\"name\"], \"lives in\", person[\"city\"])"),
    snippet("Write CSV", "import csv\nfrom io import StringIO\n\nbuf = StringIO()\nwriter = csv.DictWriter(buf, fieldnames=[\"name\", \"city\"])\nwriter.writeheader()\nwriter.writerows([{\"name\": \"Lee, Jr.\", \"city\": \"NYC\"}, {\"name\": \"Ana\", \"city\": \"Oslo\"}])\nprint(buf.getvalue())"),
    snippet("Semicolons", "import csv\nfrom io import StringIO\n\ndata = \"item;price\\napple;1,5\\npear;2,25\\n\"\nfor row in csv.DictReader(StringIO(data), delimiter=\";\"):\n    print(row[\"item\"], float(row[\"price\"].replace(\",\", \".\")))"),
    snippet("Totals per group", "import csv\nfrom io import StringIO\n\ndata = \"region,amount\\nnorth,10\\nsouth,25\\nnorth,20\\n\"\ntotals = {}\nfor row in csv.DictReader(StringIO(data)):\n    totals[row[\"region\"]] = totals.get(row[\"region\"], 0) + int(row[\"amount\"])\nprint(totals)"),
  ],
  readMore: { label: "Python docs: the csv module", url: "https://docs.python.org/3/library/csv.html", source: "Python docs" },
  challenges: [
    task('easy', 'Read rows', {
      prompt:
        'Read `data` with `csv.reader` and store every row in the list `rows`. (`StringIO` lets the csv module read a string as if it were a file.)',
      starter: py`import csv
from io import StringIO

data = "name,score\nAna,90\nBob,85\n"
rows = ___`,
      hint: '`csv.reader(StringIO(data))` gives rows one at a time; wrap it in `list(...)`.',
      solution: py`import csv
from io import StringIO

data = "name,score\nAna,90\nBob,85\n"
rows = list(csv.reader(StringIO(data)))`,
      tests: [['rows holds every row as a list of strings', py`rows == [["name", "score"], ["Ana", "90"], ["Bob", "85"]]`]],
    }),
    task('easy', 'Rows as dictionaries', {
      prompt:
        'Use `csv.DictReader` so each row is a dict keyed by the header. Store the rows in `people` and set `first_city` to the first person\'s city.',
      starter: py`import csv
from io import StringIO

data = "name,city\nAna,Oslo\nBob,Lima\n"
people = ___
first_city = ___`,
      hint: '`list(csv.DictReader(StringIO(data)))`, then `people[0]["city"]`.',
      solution: py`import csv
from io import StringIO

data = "name,city\nAna,Oslo\nBob,Lima\n"
people = list(csv.DictReader(StringIO(data)))
first_city = people[0]["city"]`,
      tests: [
        ['people are dicts', py`people == [{"name": "Ana", "city": "Oslo"}, {"name": "Bob", "city": "Lima"}]`],
        ['first_city', py`first_city == "Oslo"`],
      ],
    }),
    task('medium', 'Sum a column', {
      prompt: 'Add up the `score` column into `total`. Remember: everything csv reads is a string.',
      starter: py`import csv
from io import StringIO

data = "name,score\nAna,90\nBob,85\nCleo,80\n"
total = ___`,
      hint: 'Convert each value with `int(row["score"])` inside `sum(...)`.',
      solution: py`import csv
from io import StringIO

data = "name,score\nAna,90\nBob,85\nCleo,80\n"
total = sum(int(row["score"]) for row in csv.DictReader(StringIO(data)))`,
      tests: [
        ['total is a number', py`isinstance(total, int)`],
        ['total is correct', py`total == 255`],
      ],
    }),
    task('medium', 'Write CSV', {
      prompt:
        'Use `csv.writer` to write a header row `name,score` and the two rows in `scores` into `buf`. Then store the text in `out`.',
      starter: py`import csv
from io import StringIO

scores = [["Ana", 90], ["Bob", 85]]
buf = StringIO()
writer = csv.writer(buf)
# write the header and the rows here

out = buf.getvalue()`,
      hint: '`writer.writerow(["name", "score"])`, then `writer.writerows(scores)`.',
      solution: py`import csv
from io import StringIO

scores = [["Ana", 90], ["Bob", 85]]
buf = StringIO()
writer = csv.writer(buf)
writer.writerow(["name", "score"])
writer.writerows(scores)

out = buf.getvalue()`,
      tests: [['out has the header and both rows', py`out.splitlines() == ["name,score", "Ana,90", "Bob,85"]`]],
    }),
    task('hard', 'Commas inside values', {
      prompt:
        'Write the row `["Lee, Jr.", "NYC"]` with `csv.writer` and store the text in `out`. Look at how csv protects the comma inside the name.',
      starter: py`import csv
from io import StringIO

buf = StringIO()
___
out = buf.getvalue()
print(out)`,
      hint: 'Create `csv.writer(buf)` and call `writerow`. csv adds quotes around values that contain the delimiter.',
      solution: py`import csv
from io import StringIO

buf = StringIO()
csv.writer(buf).writerow(["Lee, Jr.", "NYC"])
out = buf.getvalue()
print(out)`,
      tests: [
        ['The name is quoted', py`out.strip() == '"Lee, Jr.",NYC'`],
        ['It reads back as two fields', py`next(__import__('csv').reader(__import__('io').StringIO(out))) == ["Lee, Jr.", "NYC"]`],
      ],
    }),
    task('hard', 'Write dictionaries', {
      prompt:
        'Write `people` (a list of dicts) as CSV with `csv.DictWriter`, including a header row. Store the text in `out`.',
      starter: py`import csv
from io import StringIO

people = [{"name": "Ana", "city": "Oslo"}, {"name": "Bob", "city": "Lima"}]
buf = StringIO()
writer = csv.DictWriter(buf, fieldnames=___)
___
out = buf.getvalue()`,
      hint: 'Pass `fieldnames=["name", "city"]`, then call `writer.writeheader()` and `writer.writerows(people)`.',
      solution: py`import csv
from io import StringIO

people = [{"name": "Ana", "city": "Oslo"}, {"name": "Bob", "city": "Lima"}]
buf = StringIO()
writer = csv.DictWriter(buf, fieldnames=["name", "city"])
writer.writeheader()
writer.writerows(people)
out = buf.getvalue()`,
      tests: [['Header plus one line per person', py`out.splitlines() == ["name,city", "Ana,Oslo", "Bob,Lima"]`]],
    }),
    task('expert', 'European-style CSV', {
      prompt:
        'Many European exports use `;` between fields and a comma as the decimal point. Parse `data` into `prices`, a list of floats: `[1.5, 2.25]`.',
      starter: py`import csv
from io import StringIO

data = "item;price\napple;1,5\npear;2,25\n"
prices = ___`,
      hint: 'Use `csv.DictReader(..., delimiter=";")`, then `float(row["price"].replace(",", "."))`.',
      solution: py`import csv
from io import StringIO

data = "item;price\napple;1,5\npear;2,25\n"
prices = [float(row["price"].replace(",", ".")) for row in csv.DictReader(StringIO(data), delimiter=";")]`,
      tests: [['prices are floats', py`prices == [1.5, 2.25]`]],
    }),
    task('expert', 'Skip bad rows', {
      prompt:
        'Write `parse_scores(text)`. It reads CSV with a `name,score` header and returns a list of `(name, score)` tuples with `score` as an int. Skip rows whose score is missing or not a number.',
      starter: py`import csv
from io import StringIO

def parse_scores(text):
    ___`,
      hint: 'Loop over `csv.DictReader`. Try `int(row["score"])` and `continue` on `ValueError` or `TypeError`.',
      solution: py`import csv
from io import StringIO

def parse_scores(text):
    result = []
    for row in csv.DictReader(StringIO(text)):
        try:
            result.append((row["name"], int(row["score"])))
        except (ValueError, TypeError):
            continue
    return result`,
      tests: [
        ['Good rows are parsed', py`parse_scores("name,score\nAna,90\nBob,85\n") == [("Ana", 90), ("Bob", 85)]`],
        ['Non-numbers are skipped', py`parse_scores("name,score\nAna,90\nBob,n/a\nCy,70\n") == [("Ana", 90), ("Cy", 70)]`],
        ['Missing scores are skipped', py`parse_scores("name,score\nAna\nBob,85\n") == [("Bob", 85)]`],
      ],
    }),
    task('expert', 'Totals per group', {
      prompt: 'Total the `amount` column for each `region`. Store the result in the dict `totals`, e.g. `{"north": 30, ...}`.',
      starter: py`import csv
from io import StringIO

data = "region,amount\nnorth,10\nsouth,25\nnorth,20\neast,5\n"
totals = {}
___`,
      hint: 'Loop over `DictReader` and do `totals[region] = totals.get(region, 0) + int(row["amount"])`.',
      solution: py`import csv
from io import StringIO

data = "region,amount\nnorth,10\nsouth,25\nnorth,20\neast,5\n"
totals = {}
for row in csv.DictReader(StringIO(data)):
    totals[row["region"]] = totals.get(row["region"], 0) + int(row["amount"])`,
      tests: [['Totals per region', py`totals == {"north": 30, "south": 25, "east": 5}`]],
    }),
    task('expert', 'Save and reload a file', {
      prompt:
        'Write `rows` to a real file named `people.csv`, then read it back into `loaded`. Open the file with `newline=""` and `encoding="utf-8"`, as the csv docs recommend.',
      starter: py`import csv

rows = [["name", "age"], ["Ana", "30"], ["Zoë", "27"]]

with open("people.csv", "w", newline="", encoding="utf-8") as f:
    ___

with open("people.csv", newline="", encoding="utf-8") as f:
    loaded = ___`,
      hint: 'Write with `csv.writer(f).writerows(rows)`; read with `list(csv.reader(f))`.',
      solution: py`import csv

rows = [["name", "age"], ["Ana", "30"], ["Zoë", "27"]]

with open("people.csv", "w", newline="", encoding="utf-8") as f:
    csv.writer(f).writerows(rows)

with open("people.csv", newline="", encoding="utf-8") as f:
    loaded = list(csv.reader(f))`,
      tests: [
        ['The file was written', py`__import__('pathlib').Path("people.csv").exists()`],
        ['loaded matches rows', py`loaded == [["name", "age"], ["Ana", "30"], ["Zoë", "27"]]`],
      ],
    }),
  ],
  questions: [
    mc('What does CSV stand for?', ['Coded Spreadsheet View', 'Comma-separated values', 'Compressed string values', 'Column sorted values'], 1),
    mc("What type is every value that `csv.reader` gives you?", ["`str`","Whatever type the value looks like","`bytes`","`int` or `str`"], 0),
    qShort('Which csv class gives you each row as a dict? (class name)', 'DictReader'),
    mc("Which method writes a single row with `csv.writer`?", ["`write`","`row`","`append`","`writerow`"], 3),
    mc('Why open CSV files with `newline=""`?', ['It makes files smaller', 'It removes the header', 'So csv controls line endings and avoids blank lines', 'It is required for reading only'], 2),
    mc('How does csv store the value `Lee, Jr.`?', ['As two fields', 'Wrapped in double quotes', 'With the comma removed', 'It raises an error'], 1),
    qShort('Which argument tells csv to split on `;` instead of `,`? (argument name)', 'delimiter'),
    mc("Which `DictWriter` method writes the column names?", ["`writeheader`","`header`","`writekeys`","`writerow(None)`"], 0),
    mc("`sum(row[\"n\"] for row in rows)` fails with a csv file. Why?", ["csv rows are tuples","The values are strings","`sum` needs a list","Rows are read-only"], 1),
    mc('When is pandas a better choice than the csv module?', ['Never', 'Writing a single row', 'Reading a 3-line file', 'Analyzing large tables with filtering and grouping'], 3),
  ],
})
