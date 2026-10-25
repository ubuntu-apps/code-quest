// Functions and expressions: Formatting with printf.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { EXPRESSIONS_DB } from '../expressions-db.mjs'

export default makeTopic({
  id: 'printf_formatting',
  title: 'Formatting with printf',
  database: EXPRESSIONS_DB,
  paragraphs: [
    "`printf(format, values…)` builds text from a pattern. Each `%` code in the pattern is replaced by the next value: `%s` for text, `%d` for a whole number and `%f` for a number with decimals. Everything else is copied as it is.",
    "```\nSELECT printf('%s works as %s', name, role) AS line FROM employees;\n```",
    "Between the `%` and the letter you can say how the value should look. `%.2f` always shows two decimals, so `printf('%.2f', 42.5)` is `42.50`, which `ROUND` can't do: `ROUND(42.5, 2)` is still 42.5.",
    "A number before the letter sets a minimum width, padded with spaces: `%5d`. Starting it with 0 pads with zeros: `printf('ORD-%04d', 7)` is `ORD-0007`. A comma adds thousands separators: `printf('%,d', 72000)` is `72,000`. To write a real percent sign, use `%%`.",
    "```\nSELECT printf('ORD-%04d', id) AS order_no, printf('%.2f', total) AS total,\n       printf('%d%%', discount) AS discount\nFROM orders;\n```",
    '`printf` gives **text**. That is right for showing results, but sort by the original numbers: as text, `100.00` comes before `9.50`.',
    'SQLite also calls this function `format` in newer versions; `printf` works in all of them.',
  ],
  sandboxCode: "SELECT printf('ORD-%04d', id) AS order_no, printf('%.2f', total) AS total,\n       printf('%d%%', discount) AS discount\nFROM orders;",
  sandboxSnippets: [
    snippet('Order lines', "SELECT printf('ORD-%04d', id) AS order_no, printf('%.2f', total) AS total,\n       printf('%d%%', discount) AS discount\nFROM orders;"),
    snippet('Text in a pattern', "SELECT printf('%s works as %s', name, role) AS line FROM employees;"),
    snippet('Two decimals', "SELECT ROUND(42.5, 2) AS rounded, printf('%.2f', 42.5) AS formatted;"),
    snippet('Thousands', "SELECT name, printf('%,d', salary) AS salary FROM employees;"),
    snippet('Widths', "SELECT printf('[%5d]', 42) AS spaces, printf('[%05d]', 42) AS zeros, printf('[%-6s]', 'ab') AS left_aligned;"),
  ],
  readMore: { label: 'SQLite: the printf function', url: 'https://www.sqlite.org/printf.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Two decimals', {
      prompt: "Show each order's `id` and its total with exactly two decimals (`42.50`), in a column called `total`.",
      hint: "`printf('%.2f', total) AS total`.",
      solution: "SELECT id, printf('%.2f', total) AS total FROM orders;",
    }),
    query('easy', 'Order numbers', {
      prompt: "Show each order's number as `ORD-` followed by its `id` padded to 4 digits (`ORD-0007`), in a column called `order_no`.",
      hint: "`printf('ORD-%04d', id) AS order_no`.",
      solution: "SELECT printf('ORD-%04d', id) AS order_no FROM orders;",
    }),
    query('easy', 'Name and role', {
      prompt: "Show one column called `staff` with each employee's name and role in brackets, like `Maria Lopez (Manager)`.",
      hint: "`printf('%s (%s)', name, role) AS staff`.",
      solution: "SELECT printf('%s (%s)', name, role) AS staff FROM employees;",
    }),
    query('medium', 'Monthly pay sentence', {
      prompt: "Show one column called `line` like `Maria Lopez earns 6000.00 a month` (salary divided by 12, two decimals).",
      hint: "`printf('%s earns %.2f a month', name, salary / 12.0) AS line`.",
      solution: "SELECT printf('%s earns %.2f a month', name, salary / 12.0) AS line FROM employees;",
    }),
    query('medium', 'Percent signs', {
      prompt: 'For the orders with a discount, show the `id` and the discount with a percent sign (`10%`), in a column called `discount`.',
      hint: "`%%` writes a real percent sign: `printf('%d%%', discount)`.",
      solution: "SELECT id, printf('%d%%', discount) AS discount FROM orders WHERE discount IS NOT NULL;",
    }),
    query('hard', 'Readable salaries', {
      prompt: "Show each employee's `name` and their salary with thousands separators (`72,000`), called `salary`. Highest salary first.",
      hint: "`printf('%,d', salary) AS salary`, but sort by the number: `ORDER BY employees.salary DESC`. (`salary` alone would mean the text column you just made.)",
      solution: "SELECT name, printf('%,d', salary) AS salary FROM employees ORDER BY employees.salary DESC;",
    }),
    query('hard', 'Customer cards', {
      prompt: "Show one column called `card` like `Ana Silva <ana.silva@example.com>`, with the email in lower case.",
      hint: "`printf('%s %s <%s>', first_name, last_name, LOWER(email)) AS card`.",
      solution: "SELECT printf('%s %s <%s>', first_name, last_name, LOWER(email)) AS card FROM customers;",
    }),
    query('expert', 'Receipt lines', {
      prompt: "Show one `line` per order like `#3 2026-02-02 15.99` (a #, the id, the date and the total with two decimals, separated by spaces), in order of `id`.",
      hint: "`printf('#%d %s %.2f', id, order_date, total) AS line ... ORDER BY id`.",
      solution: "SELECT printf('#%d %s %.2f', id, order_date, total) AS line FROM orders ORDER BY id;",
    }),
    query('expert', 'Quarters', {
      prompt: "Show each order's `id` and its quarter like `2026-Q1` (months 1–3 are Q1, 4–6 Q2, and so on), called `quarter`.",
      hint: "The quarter is (month + 2) / 3 with whole-number division: `printf('%s-Q%d', strftime('%Y', order_date), (CAST(strftime('%m', order_date) AS INTEGER) + 2) / 3)`.",
      solution: "SELECT id, printf('%s-Q%d', strftime('%Y', order_date), (CAST(strftime('%m', order_date) AS INTEGER) + 2) / 3) AS quarter\nFROM orders;",
    }),
  ],
  questions: [
    mc("What does `printf('%.2f', 3.5)` give?", ["`'3.5'`", "`'3.50'`", '`3.50` as a number', "`'4'`"], 1,
      '%.2f always shows two decimals, and printf gives text.'),
    mc('Which code is for text?', ['`%s`', '`%d`', '`%f`', '`%t`'], 0,
      '%s inserts a text value (s for string).'),
    mc("What does `printf('ORD-%04d', 7)` give?", ["`'ORD-7'`", "`'ORD-   7'`", "`'ORD-0007'`", "`'ORD-7000'`"], 2,
      '04 pads with zeros to at least 4 digits.'),
    mc("How do you write a real % sign in printf?", ['`\\%`', "`'%'`", '`%p`', '`%%`'], 3,
      'Two percent signs make one in the output.'),
    qShort("What does `printf('%,d', 1500)` give?", '1,500',
      'The comma flag adds thousands separators.'),
    mc('What type does printf give?', ['Text', 'A number', 'Whatever the values were', 'NULL'], 0,
      'printf builds text, which sorts as text.'),
    mc("Why sort by `total`, not `printf('%.2f', total)`?", ['printf is slow', "As text, '100.00' sorts before '9.50'", 'printf cannot be sorted', 'There is no difference'], 1,
      'Formatted values are text, so they sort character by character.'),
    mc("What does `printf('%s is %d', 'Max', 7)` give?", ["`'%s is %d'`", "`'Max 7'`", "`'Max is 7'`", "`'Max is 7.0'`"], 2,
      'Each code is replaced by the next value, in order.'),
    mc('Why use `%.2f` instead of `ROUND(x, 2)` to show prices?', ['ROUND is not allowed', 'ROUND gives text', '%.2f is shorter', 'ROUND(42.5, 2) still shows 42.5, but %.2f shows 42.50'], 3,
      'ROUND changes the value, but only printf controls how many decimals are shown.'),
    mc("What does `printf('[%5d]', 42)` give?", ["`'[   42]'`", "`'[42   ]'`", "`'[00042]'`", "`'[42]'`"], 0,
      'A width of 5 pads with spaces on the left; 05 would pad with zeros.'),
  ],
})
