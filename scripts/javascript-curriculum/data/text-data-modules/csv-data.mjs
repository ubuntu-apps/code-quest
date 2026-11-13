// Text, data and modules: CSV, tables as text. Lesson, Try-it snippets, challenges and quiz.
import { MDN, makeTopic, mc, prints, qShort, same, snippet, task } from '../_builders.mjs'

const SALES = 'const csv = `date,item,qty,price\n2026-03-01,tea,2,2.50\n2026-03-01,cake,1,3.20\n2026-03-02,tea,3,2.50\n2026-03-02,juice,2,1.95`\n'

export default makeTopic({
  id: 'csv_data',
  title: 'CSV: tables as text',
  paragraphs: [
    'Spreadsheets, bank statements and data downloads often come as **CSV** (comma-separated values): one line per row, the values separated by commas, and usually a **header** line with the column names first.',
    '```text\nname,city,age\nAna,Lisbon,31\nBen,Oslo,27\n```',
    'Turning CSV into objects takes three steps: split it into lines, split the header into column names, then for each other line split the values and pair each with its column name.',
    '```\nconst csv = "name,city,age\\nAna,Lisbon,31\\nBen,Oslo,27"\nconst [header, ...rows] = csv.trim().split("\\n")\nconst columns = header.split(",")\nconst people = rows.map((line) => {\n  const values = line.split(",")\n  return Object.fromEntries(columns.map((col, i) => [col, values[i]]))\n})\nconsole.log(people)\n```',
    'Everything you read from CSV is **text**: `"31"`, not `31`. Convert the columns that are numbers with `Number(…)` before you add them up.',
    'Going the other way, from objects to CSV, is the same in reverse: a header from the keys, then each row\'s values joined with commas, and all the lines joined with `"\\n"`.',
    '```\nconst rows = [{ item: "tea", qty: 2 }, { item: "cake", qty: 1 }]\nconst columns = Object.keys(rows[0])\nconst csv = [columns.join(","), ...rows.map((r) => columns.map((c) => r[c]).join(","))].join("\\n")\nconsole.log(csv)\n```',
    'Real CSV has a catch: a value that contains a comma is wrapped in double quotes, like `"Lima, Ana",Lisbon`, and a quote inside is written twice (`""`). A plain `split(",")` breaks on those. For simple data you made yourself, `split` is fine; for files from elsewhere, use a proper parser (the expert challenges build a small one).',
  ],
  sandboxCode: 'const csv = "fruit,count\\napples,12\\npears,5"\nconst [header, ...lines] = csv.split("\\n")\nconsole.log(header.split(","))\nfor (const line of lines) {\n  const [fruit, count] = line.split(",")\n  console.log(fruit, Number(count) * 2)\n}',
  sandboxSnippets: [
    snippet('fromEntries', 'console.log(Object.fromEntries([["name", "Ana"], ["age", "31"]]))'),
    snippet('Commas inside', 'console.log(\'"Lima, Ana",Lisbon\'.split(","))'),
    snippet('Back to CSV', 'const rows = [["x", 1], ["y", 2]]\nconsole.log(rows.map((r) => r.join(",")).join("\\n"))'),
  ],
  readMore: MDN('Web/JavaScript/Reference/Global_Objects/Object/fromEntries', 'MDN: Object.fromEntries()'),
  challenges: [
    task('easy', 'The columns', {
      prompt: 'Make `columns` the list of column names from the header line of `csv`.',
      starter: SALES,
      hint: '`csv.split("\\n")[0].split(",")`.',
      solution: SALES + 'const columns = csv.split("\\n")[0].split(",")',
      tests: [['columns', same('columns', '["date", "item", "qty", "price"]')]],
      alt: 'const csv = `day,product,count\n1,pen,4`',
    }),
    task('easy', 'Count the rows', {
      prompt: 'Make `rowCount` the number of data rows in `csv` (not counting the header, nor a blank line at the end).',
      starter: SALES,
      hint: '`csv.trim().split("\\n").length - 1`.',
      solution: SALES + 'const rowCount = csv.trim().split("\\n").length - 1',
      tests: [['rowCount is 4', 'rowCount === 4']],
      alt: 'const csv = `date,item,qty,price\n2026-03-01,tea,2,2.50\n`',
    }),
    task('easy', 'One row', {
      prompt: 'Split the line `row` into `item`, `qty` and `price`, with `qty` and `price` as numbers, then show `2 × tea = 5`.',
      starter: 'const row = "tea,2,2.50"\n',
      hint: '`const [item, q, p] = row.split(",")`; `const qty = Number(q)` and the same for price.',
      solution: 'const row = "tea,2,2.50"\nconst [item, q, p] = row.split(",")\nconst qty = Number(q)\nconst price = Number(p)\nconsole.log(`${qty} × ${item} = ${qty * price}`)',
      tests: [['Shows 2 × tea = 5', prints('2 × tea = 5')], ['qty and price are numbers', 'qty === 2 && price === 2.5']],
    }),
    task('medium', 'Rows to objects', {
      prompt: 'Write `parseCsv(csv)` that returns a list of objects, one per data row, with the header\'s column names as keys (values stay text). Ignore blank lines.',
      hint: 'Split into lines and `filter` out blank ones; the first is the header; `Object.fromEntries(columns.map((c, i) => [c, values[i]]))`.',
      solution: 'function parseCsv(csv) {\n  const [header, ...rows] = csv.split("\\n").filter((line) => line.trim() !== "")\n  const columns = header.split(",")\n  return rows.map((line) => {\n    const values = line.split(",")\n    return Object.fromEntries(columns.map((col, i) => [col, values[i]]))\n  })\n}',
      tests: [['Two rows', same('parseCsv("name,age\\nAna,31\\n\\nBen,27\\n")', '[{ name: "Ana", age: "31" }, { name: "Ben", age: "27" }]')], ['Header only', same('parseCsv("a,b")', '[]')]],
    }),
    task('medium', 'Takings', {
      prompt: 'Make `total` the money taken in `csv`: the sum of `qty * price` over every row, rounded to 2 decimal places.',
      starter: SALES,
      hint: 'Skip the header with `slice(1)`; for each line, split and multiply `Number(qty) * Number(price)`.',
      solution: SALES + 'const lines = csv.trim().split("\\n").slice(1)\nconst sum = lines.reduce((acc, line) => {\n  const [, , qty, price] = line.split(",")\n  return acc + Number(qty) * Number(price)\n}, 0)\nconst total = Math.round(sum * 100) / 100',
      tests: [['total is 19.6', 'total === 19.6']],
      alt: 'const csv = `date,item,qty,price\n2026-04-01,pen,4,1.25\n2026-04-02,ink,1,6.00`',
    }),
    task('medium', 'Objects to CSV', {
      prompt: 'Write `toCsv(rows)` that turns a list of objects (all with the same keys) into CSV text: a header from the first object\'s keys, then one line per object. An empty list gives `""`.',
      hint: '`const columns = Object.keys(rows[0])`; each line is `columns.map((c) => row[c]).join(",")`; join everything with `"\\n"`.',
      solution: 'function toCsv(rows) {\n  if (rows.length === 0) return ""\n  const columns = Object.keys(rows[0])\n  const lines = rows.map((row) => columns.map((c) => row[c]).join(","))\n  return [columns.join(","), ...lines].join("\\n")\n}',
      tests: [['Two rows', 'toCsv([{ item: "tea", qty: 2 }, { item: "cake", qty: 1 }]) === "item,qty\\ntea,2\\ncake,1"'], ['Empty', 'toCsv([]) === ""']],
    }),
    task('hard', 'Sales per item', {
      prompt: 'Write `perItem(csv)` for CSV like the sales above: return an object of item → total quantity sold, with the quantities as numbers.',
      starter: SALES,
      hint: 'Skip the header; for each row add `Number(qty)` to `totals[item]` (starting from 0).',
      solution: SALES + 'function perItem(csv) {\n  const totals = {}\n  for (const line of csv.trim().split("\\n").slice(1)) {\n    const [, item, qty] = line.split(",")\n    totals[item] = (totals[item] ?? 0) + Number(qty)\n  }\n  return totals\n}',
      tests: [['The sales', same('perItem(csv)', '{ tea: 5, cake: 1, juice: 2 }')], ['Other data', same('perItem("date,item,qty,price\\nx,pen,4,1\\ny,pen,1,1")', '{ pen: 5 }')]],
    }),
    task('hard', 'Pick columns', {
      prompt: 'Write `selectColumns(csv, wanted)` that returns new CSV text with only the `wanted` columns, in the order they are listed in `wanted`.',
      hint: 'Find each wanted column\'s index in the header with `indexOf`; build every line from those indexes.',
      solution: 'function selectColumns(csv, wanted) {\n  const lines = csv.trim().split("\\n").map((line) => line.split(","))\n  const indexes = wanted.map((col) => lines[0].indexOf(col))\n  return lines.map((values) => indexes.map((i) => values[i]).join(",")).join("\\n")\n}',
      tests: [['Swap and drop', 'selectColumns("a,b,c\\n1,2,3\\n4,5,6", ["c", "a"]) === "c,a\\n3,1\\n6,4"'], ['One column', 'selectColumns("name,age\\nAna,31", ["name"]) === "name\\nAna"']],
    }),
    task('expert', 'Quoted values', {
      prompt: 'Write `splitCsvLine(line)` that splits one CSV line into values, handling quotes: a value in double quotes may contain commas, and `""` inside quotes means one `"`. So `\'"Lima, Ana",31,"say ""hi"""\'` gives `["Lima, Ana", "31", \'say "hi"\']`.',
      hint: 'Go through the characters with an `inQuotes` flag and a `current` value. A `"` toggles `inQuotes`, unless it is `""` inside quotes (then add one `"` and skip the next). A `,` outside quotes ends the value.',
      solution: 'function splitCsvLine(line) {\n  const values = []\n  let current = ""\n  let inQuotes = false\n  for (let i = 0; i < line.length; i++) {\n    const ch = line[i]\n    if (ch === \'"\') {\n      if (inQuotes && line[i + 1] === \'"\') {\n        current += \'"\'\n        i++\n      } else {\n        inQuotes = !inQuotes\n      }\n    } else if (ch === "," && !inQuotes) {\n      values.push(current)\n      current = ""\n    } else {\n      current += ch\n    }\n  }\n  values.push(current)\n  return values\n}',
      tests: [['Quotes and commas', same('splitCsvLine(\'"Lima, Ana",31,"say ""hi"""\')', '["Lima, Ana", "31", \'say "hi"\']')], ['Plain', same('splitCsvLine("a,b,,c")', '["a", "b", "", "c"]')]],
    }),
    task('expert', 'Quote when needed', {
      prompt: 'Write `csvValue(value)` that turns a value into text for a CSV file: if it contains a comma, a double quote or a new line, wrap it in double quotes and double every quote inside; otherwise leave it as it is.',
      hint: '`const text = String(value)`; `if (/[",\\n]/.test(text)) return `"${text.replaceAll(\'"\', \'""\')}"``.',
      solution: 'function csvValue(value) {\n  const text = String(value)\n  if (/[",\\n]/.test(text)) return `"${text.replaceAll(\'"\', \'""\')}"`\n  return text\n}',
      tests: [['Comma', 'csvValue("Lima, Ana") === \'"Lima, Ana"\''], ['Quote', 'csvValue(\'say "hi"\') === \'"say ""hi"""\''], ['Plain', 'csvValue(31) === "31" && csvValue("tea") === "tea"']],
    }),
  ],
  questions: [
    mc('What is the first line of most CSV files?', ['A header with the column names', 'The first row of data', 'A comment', 'The number of rows'], 0, 'It names the columns.'),
    mc('What type is a value read from CSV?', ['Text, always', 'A number when it looks like one', 'Whatever was saved', 'undefined'], 0, 'Convert with Number().'),
    mc('What does this show?\n```\nconst [head, ...rest] = "a,b\\n1,2\\n3,4".split("\\n")\nconsole.log(rest.length)\n```', ['`2`', '`3`', '`1`', '`4`'], 0, 'Two data rows after the header.', { code: 'const [head, ...rest] = "a,b\\n1,2\\n3,4".split("\\n")\nconsole.log(rest.length)', output: '2' }),
    mc('What does `Object.fromEntries([["a", 1], ["b", 2]])` give?', ['`{ a: 1, b: 2 }`', '`[ "a", "b" ]`', '`{ 0: ["a", 1] }`', 'An error'], 0, 'Pairs to an object.', { code: 'console.log(Object.fromEntries([["a", 1], ["b", 2]]))', output: '{ a: 1, b: 2 }' }),
    mc('Why does `split(",")` go wrong on `"Lima, Ana",31`?', ['The comma inside the quotes splits the name in two', 'split can\'t use commas', 'It removes the quotes', 'It doesn\'t go wrong'], 0, 'Quoted values need a real parser.'),
    mc('In CSV, how is a `"` written inside a quoted value?', ['As two quotes: `""`', 'As `\\"`', 'It can\'t be', 'As `\'`'], 0, '"say ""hi""" is say "hi".'),
    mc('What does this show?\n```\nconsole.log([["x", 1], ["y", 2]].map((r) => r.join(",")).join("\\n"))\n```', ['Two lines: `x,1` and `y,2`', '`x,1,y,2`', '`x1y2`', 'An error'], 0, 'Rows joined with commas, lines with new lines.', { code: 'console.log([["x", 1], ["y", 2]].map((r) => r.join(",")).join("\\n"))', output: 'x,1\ny,2' }),
    mc('Why use `csv.trim()` before splitting into lines?', ['A new line at the end would give an empty last row', 'It removes the header', 'It makes the values numbers', 'It is required'], 0, 'Files often end with a new line.'),
    qShort('What does the C in CSV stand for?', 'comma', 'Comma-separated values.'),
  ],
})
