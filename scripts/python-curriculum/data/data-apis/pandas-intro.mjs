import { makeTopic, mc, py, qShort, snippet, task } from '../_builders.mjs'

const PANDAS_NOTE = 'pandas downloads the first time you run it here, so the first check can take a few seconds.'

export default makeTopic({
  id: 'pandas_intro',
  title: 'Pandas introduction',
  paragraphs: [
    "pandas is the most popular Python library for working with tables of data. Its main type is the **DataFrame**: a table with named columns, like a spreadsheet you control with code. Each column on its own is a **Series**, a list of values with labels for the rows (the index).",
    "You can build a DataFrame from a dict of lists, where each key becomes a column, or load one with `pd.read_csv(...)`, which also turns number columns into numbers for you. `df.head(3)` shows the first 3 rows. The first time you use pandas here, it has to download, which can take a moment.",
    "```\nimport pandas as pd\n\ndf = pd.DataFrame({\"name\": [\"Ana\", \"Ben\", \"Cy\"], \"score\": [91, 78, 85]})\nprint(df.head())\nprint(df[\"score\"].mean())   # 84.66666666666667\n```",
    "`df[\"score\"]` picks one column as a Series, and a Series can summarise itself with `.mean()`, `.sum()`, `.max()` and `.min()`. Maths on columns works row by row: `df[\"price\"] * df[\"qty\"]` multiplies each row's price by its quantity, and assigning it to `df[\"revenue\"]` adds that as a new column.",
    "To filter, put a condition inside the square brackets: `df[df[\"score\"] >= 80]` keeps only the rows where it is true. `sort_values(\"score\", ascending=False)` sorts, highest first. `.tolist()` turns a column into a plain Python list, and `.to_dict()` turns a Series into a dict.",
    "```\npassed = df[df[\"score\"] >= 80]\nprint(passed[\"name\"].tolist())   # ['Ana', 'Cy']\nprint(df.sort_values(\"score\", ascending=False).head(2))\n```",
    "`groupby` splits the rows into groups and summarises each one: `sales.groupby(\"region\")[\"amount\"].sum()` gives the total per region. `value_counts()` counts how often each value appears in a column, most common first.",
    "Real data has gaps, and pandas marks a missing value as `NaN`. `.isna()` finds the gaps (`.isna().sum()` counts them), `fillna(value)` fills them in, for example with 0 or the column's mean, and `dropna()` drops the rows that have any. `pd.merge(orders, customers, on=\"customer_id\")` joins two tables on a shared column, like a SQL `JOIN`.",
    "One thing to watch: pandas gives back its own number types, such as `numpy.int64`. Use `int(...)` or `float(...)` when you need a plain Python number.",
  ],
  sandboxCode: "import pandas as pd\n\ndf = pd.DataFrame({\n    \"item\": [\"pen\", \"book\", \"cup\"],\n    \"qty\": [10, 2, 4],\n    \"price\": [1.5, 12.0, 4.25],\n})\ndf[\"revenue\"] = df[\"qty\"] * df[\"price\"]\nprint(df)\nprint(\"Total:\", df[\"revenue\"].sum())",
  sandboxSnippets: [
    snippet("Read CSV", "import pandas as pd\nfrom io import StringIO\n\ndata = \"name,score\\nAna,91\\nBen,78\\nCy,85\\n\"\ndf = pd.read_csv(StringIO(data))\nprint(df.head(2))\nprint(df[\"score\"].mean())"),
    snippet("Filter and sort", "import pandas as pd\n\ndf = pd.DataFrame({\"name\": [\"Ana\", \"Ben\", \"Cy\", \"Dee\"], \"score\": [91, 78, 95, 80]})\nprint(df[df[\"score\"] >= 80][\"name\"].tolist())\nprint(df.sort_values(\"score\", ascending=False).head(2))"),
    snippet("Group and count", "import pandas as pd\n\nsales = pd.DataFrame({\"region\": [\"north\", \"south\", \"north\", \"east\"], \"amount\": [10, 25, 20, 5]})\nprint(sales.groupby(\"region\")[\"amount\"].sum().to_dict())\nprint(sales[\"region\"].value_counts().to_dict())"),
    snippet("Missing values", "import pandas as pd\n\ndf = pd.DataFrame({\"city\": [\"Oslo\", \"Lima\", \"Rome\"], \"temp\": [4.0, None, 18.0]})\nprint(df[\"temp\"].isna().sum(), \"missing\")\nprint(df[\"temp\"].fillna(df[\"temp\"].mean()).tolist())\nprint(len(df.dropna()), \"complete rows\")"),
    snippet("Merge", "import pandas as pd\n\ncustomers = pd.DataFrame({\"customer_id\": [1, 2], \"name\": [\"Ana\", \"Ben\"]})\norders = pd.DataFrame({\"order_id\": [10, 11], \"customer_id\": [2, 1], \"total\": [30, 12]})\nprint(pd.merge(orders, customers, on=\"customer_id\"))"),
  ],
  readMore: { label: "pandas docs: 10 minutes to pandas", url: "https://pandas.pydata.org/docs/user_guide/10min.html", source: "pandas docs" },
  challenges: [
    task('easy', 'Make a DataFrame', {
      prompt: 'Build a DataFrame `df` from the `data` dict. Each key becomes a column.',
      starter: py`import pandas as pd

data = {"name": ["Ana", "Ben", "Cy"], "score": [91, 78, 85]}
df = ___
print(df)`,
      hint: '`pd.DataFrame(data)`.',
      solution: py`import pandas as pd

data = {"name": ["Ana", "Ben", "Cy"], "score": [91, 78, 85]}
df = pd.DataFrame(data)
print(df)`,
      tests: [
        ['df is a DataFrame', py`isinstance(df, __import__('pandas').DataFrame)`],
        ['3 rows, 2 columns', py`df.shape == (3, 2)`],
        ['Columns named from the keys', py`list(df.columns) == ["name", "score"]`],
      ],
    }),
    task('easy', 'Column average', {
      prompt: 'Set `avg` to the mean of the `score` column.',
      starter: py`import pandas as pd

df = pd.DataFrame({"name": ["Ana", "Ben", "Cy"], "score": [91, 78, 85]})
avg = ___`,
      hint: 'Select a column with `df["score"]`, then call `.mean()`.',
      solution: py`import pandas as pd

df = pd.DataFrame({"name": ["Ana", "Ben", "Cy"], "score": [91, 78, 85]})
avg = df["score"].mean()`,
      tests: [['avg', py`abs(float(avg) - 254 / 3) < 1e-9`]],
    }),
    task('medium', 'Filter rows', {
      prompt: 'Keep the rows where `score` is at least 80. Store the matching names as a plain list in `passed`.',
      starter: py`import pandas as pd

df = pd.DataFrame({"name": ["Ana", "Ben", "Cy", "Dee"], "score": [91, 78, 85, 80]})
passed = ___`,
      hint: '`df[df["score"] >= 80]` keeps matching rows; then `["name"].tolist()`.',
      solution: py`import pandas as pd

df = pd.DataFrame({"name": ["Ana", "Ben", "Cy", "Dee"], "score": [91, 78, 85, 80]})
passed = df[df["score"] >= 80]["name"].tolist()`,
      tests: [['passed', py`passed == ["Ana", "Cy", "Dee"]`]],
    }),
    task('medium', 'Sort and take the top', {
      prompt: 'Sort `df` by score, highest first, and store the names of the top 2 in `top2`.',
      starter: py`import pandas as pd

df = pd.DataFrame({"name": ["Ana", "Ben", "Cy", "Dee"], "score": [91, 78, 95, 80]})
top2 = ___`,
      hint: '`df.sort_values("score", ascending=False).head(2)["name"].tolist()`.',
      solution: py`import pandas as pd

df = pd.DataFrame({"name": ["Ana", "Ben", "Cy", "Dee"], "score": [91, 78, 95, 80]})
top2 = df.sort_values("score", ascending=False).head(2)["name"].tolist()`,
      tests: [['top2', py`top2 == ["Cy", "Ana"]`]],
    }),
    task('hard', 'Read CSV data', {
      prompt: 'Load `data` with `pd.read_csv` into `df`. Then set `total_qty` to the sum of the `qty` column as an int.',
      starter: py`import pandas as pd
from io import StringIO

data = "item,qty,price\npen,10,1.5\nbook,2,12.0\ncup,4,4.25\n"
df = ___
total_qty = ___`,
      hint: '`pd.read_csv(StringIO(data))` reads text like a file, and it detects the number columns for you.',
      solution: py`import pandas as pd
from io import StringIO

data = "item,qty,price\npen,10,1.5\nbook,2,12.0\ncup,4,4.25\n"
df = pd.read_csv(StringIO(data))
total_qty = int(df["qty"].sum())`,
      tests: [
        ['3 rows loaded', py`len(df) == 3`],
        ['qty is numeric', py`str(df["qty"].dtype).startswith("int")`],
        ['total_qty', py`total_qty == 16`],
      ],
    }),
    task('hard', 'Add a computed column', {
      prompt: 'Add a column `revenue` equal to `price * qty` for each row. Then set `total_revenue` to its sum.',
      starter: py`import pandas as pd

df = pd.DataFrame({"item": ["pen", "book", "cup"], "qty": [10, 2, 4], "price": [1.5, 12.0, 4.25]})
df["revenue"] = ___
total_revenue = ___`,
      hint: 'Column math works row by row: `df["price"] * df["qty"]`.',
      solution: py`import pandas as pd

df = pd.DataFrame({"item": ["pen", "book", "cup"], "qty": [10, 2, 4], "price": [1.5, 12.0, 4.25]})
df["revenue"] = df["price"] * df["qty"]
total_revenue = df["revenue"].sum()`,
      tests: [
        ['revenue per row', py`df["revenue"].tolist() == [15.0, 24.0, 17.0]`],
        ['total_revenue', py`float(total_revenue) == 56.0`],
      ],
    }),
    task('expert', 'Group and sum', {
      prompt: 'Total `amount` per `region` with `groupby`. Store the result as a plain dict in `totals`.',
      starter: py`import pandas as pd

sales = pd.DataFrame({"region": ["north", "south", "north", "east", "south"], "amount": [10, 25, 20, 5, 15]})
totals = ___`,
      hint: '`sales.groupby("region")["amount"].sum().to_dict()`.',
      solution: py`import pandas as pd

sales = pd.DataFrame({"region": ["north", "south", "north", "east", "south"], "amount": [10, 25, 20, 5, 15]})
totals = sales.groupby("region")["amount"].sum().to_dict()`,
      tests: [['totals', py`{k: int(v) for k, v in totals.items()} == {"east": 5, "north": 30, "south": 40}`]],
    }),
    task('expert', 'Missing values', {
      prompt:
        'Some temperatures are missing (`None`). Set `missing` to how many are missing, `filled` to the column with gaps replaced by the column mean, and `complete` to the number of rows with no gaps at all.',
      starter: py`import pandas as pd

df = pd.DataFrame({"city": ["Oslo", "Lima", "Rome", "Pune"], "temp": [4.0, None, 18.0, None]})
missing = ___
filled = ___
complete = ___`,
      hint: '`df["temp"].isna().sum()`, `df["temp"].fillna(df["temp"].mean())`, and `len(df.dropna())`.',
      solution: py`import pandas as pd

df = pd.DataFrame({"city": ["Oslo", "Lima", "Rome", "Pune"], "temp": [4.0, None, 18.0, None]})
missing = df["temp"].isna().sum()
filled = df["temp"].fillna(df["temp"].mean())
complete = len(df.dropna())`,
      tests: [
        ['missing', py`int(missing) == 2`],
        ['Gaps filled with the mean (11.0)', py`filled.tolist() == [4.0, 11.0, 18.0, 11.0]`],
        ['complete rows', py`complete == 2`],
      ],
    }),
    task('expert', 'Merge two tables', {
      prompt: 'Join `orders` with `customers` on `customer_id`. Store `(name, total)` pairs for every order, in order-id order, in `pairs`.',
      starter: py`import pandas as pd

customers = pd.DataFrame({"customer_id": [1, 2], "name": ["Ana", "Ben"]})
orders = pd.DataFrame({"order_id": [10, 11, 12], "customer_id": [2, 1, 2], "total": [30, 12, 8]})
merged = ___
pairs = ___`,
      hint: '`orders.merge(customers, on="customer_id").sort_values("order_id")`; then `list(zip(merged["name"], merged["total"]))`.',
      solution: py`import pandas as pd

customers = pd.DataFrame({"customer_id": [1, 2], "name": ["Ana", "Ben"]})
orders = pd.DataFrame({"order_id": [10, 11, 12], "customer_id": [2, 1, 2], "total": [30, 12, 8]})
merged = orders.merge(customers, on="customer_id").sort_values("order_id")
pairs = list(zip(merged["name"], merged["total"]))`,
      tests: [['pairs', py`[(n, int(t)) for n, t in pairs] == [("Ben", 30), ("Ana", 12), ("Ben", 8)]`]],
    }),
    task('expert', 'Count categories', {
      prompt: 'Count how many tickets have each `status` with `value_counts`. Store the counts as a dict in `by_status`.',
      starter: py`import pandas as pd

tickets = pd.DataFrame({"id": range(1, 8), "status": ["open", "closed", "open", "pending", "closed", "open", "closed"]})
by_status = ___`,
      hint: '`tickets["status"].value_counts().to_dict()`.',
      solution: py`import pandas as pd

tickets = pd.DataFrame({"id": range(1, 8), "status": ["open", "closed", "open", "pending", "closed", "open", "closed"]})
by_status = tickets["status"].value_counts().to_dict()`,
      tests: [['by_status', py`{k: int(v) for k, v in by_status.items()} == {"open": 3, "closed": 3, "pending": 1}`]],
    }),
  ],
  questions: [
    mc('What is a pandas DataFrame?', ['A table with labeled columns', 'A list of strings', 'A chart', 'A database server'], 0),
    qShort('Which pandas function loads a CSV file? (name only)', 'read_csv'),
    mc("`df[\"score\"]` returns…", ["A `DataFrame`","A `list`","A `Series` (one column)","A `dict`"], 2),
    mc('What does `df.head(3)` show?', ['The last 3 rows', 'The first 3 rows', 'The first 3 columns', '3 random rows'], 1),
    mc("How do you keep only rows where `score` is over 80?", ["`df.filter(score > 80)`","`df.where(80)`","`df[\"score\" > 80]`","`df[df[\"score\"] > 80]`"], 3),
    mc('What does `groupby("region")["amount"].sum()` do?', ['Sums amount separately for each region', 'Sorts by region', 'Counts regions', 'Removes duplicate regions'], 0),
    qShort('Which DataFrame method drops rows that have missing values? (name only)', 'dropna'),
    mc('`fillna(0)` does what?', ['Deletes zeros', 'Replaces missing values with 0', 'Fills the whole table with 0', 'Counts missing values'], 1),
    mc("Which method joins two DataFrames on a shared column?", ["`concat`","`append`","`merge`","`zip`"], 2),
    mc('What does `value_counts()` return?', ['The number of columns', 'The sum of a column', 'Unique values only', 'How often each value appears'], 3),
  ],
})
