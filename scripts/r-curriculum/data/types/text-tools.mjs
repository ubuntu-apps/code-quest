// Types, text and factors: More text tools.
import { code, isText, isTexts, makeTopic, mc, prints, qShort, r, snippet, task, uses } from '../_builders.mjs'

export default makeTopic({
  id: 'text_tools',
  title: 'More text tools',
  paragraphs: [
    'The first quest showed `paste()`, `nchar()` and `toupper()`. Here are the next tools, and like most of R they all work on whole vectors at once.',
    '`substr(x, start, stop)` cuts out part of a text by character position: `substr("2026-10-30", 1, 4)` is `"2026"`. Handy for codes where each part sits in a fixed place.',
    '`trimws()` removes spaces at the start and end, a very common problem in typed-in data: `trimws("  Ana ")` is `"Ana"`.',
    '`strsplit()` splits a text into pieces at a separator. Because it can split several texts at once, it gives a **list** with one vector per text; take the first with `[[1]]`:',
    code('strsplit("tea,milk,sugar", ",")[[1]]   # "tea" "milk" "sugar"'),
    '`sprintf()` builds a text from a template, with a placeholder for each value. It is the way to show money with exactly two decimals:',
    '| Placeholder | Means | Example | Result |\n| --- | --- | --- | --- |\n| `%s` | text | `sprintf("Hi %s", "Ana")` | `"Hi Ana"` |\n| `%d` | whole number | `sprintf("%d cups", 3L)` | `"3 cups"` |\n| `%.2f` | number with 2 decimals | `sprintf("%.2f", 9.6)` | `"9.60"` |\n| `%5.1f` | 5 characters wide, 1 decimal | `sprintf("%5.1f", 3.14159)` | `"  3.1"` |',
    code(r`cat(sprintf("Total: %.2f\n", 9.6))      # Total: 9.60`),
    '`%d` needs a whole number. A plain number like `3` works too, but `3.5` gives an error; use `%.0f` or `round()` for those.',
  ],
  sandboxCode: r`substr("2026-10-30", 1, 4)
trimws("  Ana ")
strsplit("tea,milk,sugar", ",")[[1]]
sprintf("%.2f", 9.6)
cat(sprintf("Total: %.2f\n", 9.6))`,
  sandboxSnippets: [
    snippet('Several at once', 'codes <- c("BK-104", "BK-221", "DVD-07")\nsubstr(codes, 1, 2)\nsprintf("Item %s", codes)'),
    snippet('Money', r`prices <- c(2.5, 3, 4.25)
sprintf("%.2f", prices)
cat(sprintf("%-8s %5.2f\n", c("tea", "latte", "cake"), prices), sep = "")`),
  ],
  readMore: { label: 'R documentation: sprintf()', url: 'https://stat.ethz.ch/R-manual/R-devel/library/base/html/sprintf.html', source: 'R documentation' },
  challenges: [
    task('easy', 'The year', {
      prompt: 'Make `year` the first four characters of `date_text`.',
      starter: 'date_text <- "2026-10-30"\n',
      hint: '`year <- substr(date_text, 1, 4)`',
      solution: 'date_text <- "2026-10-30"\nyear <- substr(date_text, 1, 4)',
      tests: [
        ['year is "2026"', isText('year', '2026')],
        ['Uses substr()', uses('substr(')],
      ],
    }),
    task('easy', 'Trim the spaces', {
      prompt: 'Make `clean` the names without the spaces at the start and end.',
      starter: 'names_in <- c("  Ana", "Ben  ", " Cy ")\n',
      hint: '`clean <- trimws(names_in)`',
      solution: 'names_in <- c("  Ana", "Ben  ", " Cy ")\nclean <- trimws(names_in)',
      tests: [['clean is Ana, Ben, Cy', isTexts('clean', 'Ana', 'Ben', 'Cy')]],
    }),
    task('easy', 'Two decimals', {
      prompt: 'Make `shown` the price as text with exactly two decimals: `"9.60"`.',
      starter: 'price <- 9.6\n',
      hint: '`shown <- sprintf("%.2f", price)`',
      solution: 'price <- 9.6\nshown <- sprintf("%.2f", price)',
      tests: [
        ['shown is "9.60"', isText('shown', '9.60')],
        ['Uses sprintf()', uses('sprintf(')],
      ],
    }),
    task('medium', 'Split the list', {
      prompt: 'Make `items` the shopping items as a vector, by splitting `list_text` at the commas.',
      starter: 'list_text <- "oats,milk,apples,coffee"\n',
      hint: '`items <- strsplit(list_text, ",")[[1]]`',
      solution: 'list_text <- "oats,milk,apples,coffee"\nitems <- strsplit(list_text, ",")[[1]]',
      tests: [['items is oats, milk, apples, coffee', isTexts('items', 'oats', 'milk', 'apples', 'coffee')]],
    }),
    task('medium', 'Shelf codes', {
      prompt: 'Each library code starts with a 2-letter shelf. Make `shelf` the first two characters of every code.',
      starter: 'codes <- c("FI-104", "SC-221", "HI-007", "FI-350")\n',
      hint: '`substr()` works on the whole vector: `substr(codes, 1, 2)`.',
      solution: 'codes <- c("FI-104", "SC-221", "HI-007", "FI-350")\nshelf <- substr(codes, 1, 2)',
      tests: [['shelf is FI, SC, HI, FI', isTexts('shelf', 'FI', 'SC', 'HI', 'FI')]],
    }),
    task('medium', 'A template', {
      prompt: 'Make `lines` one text per member, like `"Ana has 3 loans"`, using `sprintf()` with `%s` and `%d`.',
      starter: 'member <- c("Ana", "Ben")\nloans <- c(3L, 2L)\n',
      hint: '`sprintf("%s has %d loans", member, loans)`',
      solution: 'member <- c("Ana", "Ben")\nloans <- c(3L, 2L)\nlines <- sprintf("%s has %d loans", member, loans)',
      tests: [['lines is "Ana has 3 loans" "Ben has 2 loans"', isTexts('lines', 'Ana has 3 loans', 'Ben has 2 loans')]],
    }),
    task('hard', 'Money on a receipt', {
      prompt: 'Show the total like a receipt, with two decimals: `Total: 10.50`.',
      starter: 'total <- 10.5\n',
      hint: 'Build the line with `sprintf("Total: %.2f\\n", total)` and show it with `cat()`.',
      solution: r`total <- 10.5
cat(sprintf("Total: %.2f\n", total))`,
      tests: [
        ['Shows Total: 10.50', prints('Total: 10.50')],
        ['Uses sprintf()', uses('sprintf(')],
      ],
    }),
    task('expert', 'The middle part', {
      prompt: 'Make `numbers` the 3-digit number in each code, as numbers: the part after the dash.',
      starter: 'codes <- c("FI-104", "SC-221", "HI-007")\n',
      hint: 'The number is characters 4 to 6: `as.numeric(substr(codes, 4, 6))`.',
      solution: 'codes <- c("FI-104", "SC-221", "HI-007")\nnumbers <- as.numeric(substr(codes, 4, 6))',
      tests: [['numbers is 104, 221, 7', 'is.numeric(numbers) && isTRUE(all.equal(numbers, c(104, 221, 7)))']],
    }),
  ],
  questions: [
    mc('What does `substr("garden", 2, 4)` give?', ['`"gar"`', '`"ard"`', '`"arde"`', '`"den"`'], 1,
      'Characters 2 to 4: a, r, d.',
      { code: 'substr("garden", 2, 4)', output: '[1] "ard"' }),
    mc('What does `trimws("  hi  ")` give?', ['`"hi"`', '`"  hi"`', '`"hi  "`', '`" hi "`'], 0,
      'Spaces at both ends are removed.',
      { code: 'trimws("  hi  ")', output: '[1] "hi"' }),
    mc('What does `sprintf("%.2f", 3)` give?', ['`"3"`', '`"3.2"`', '`"3.00"`', '`3.00`'], 2,
      '`%.2f` always shows two decimals, and the result is text.',
      { code: 'sprintf("%.2f", 3)', output: '[1] "3.00"' }),
    mc('What does `sprintf("%s: %d", "Cups", 4L)` give?', ['`"Cups: 4"`', '`"%s: %d"`', '`"Cups 4"`', 'An error'], 0,
      'Each placeholder is filled with the next value.',
      { code: 'sprintf("%s: %d", "Cups", 4L)', output: '[1] "Cups: 4"' }),
    mc('What does `strsplit("a-b-c", "-")[[1]]` give?', ['`[1] "a-b-c"`', '`[1] "a" "b" "c"`', '`[1] "abc"`', '`[1] "-" "-"`'], 1,
      'The text is split at every dash.',
      { code: 'strsplit("a-b-c", "-")[[1]]', output: '[1] "a" "b" "c"' }),
    mc('What does `substr(c("apple", "kiwi"), 1, 1)` give?', ['`"a"`', '`[1] "a" "k"`', '`[1] "apple"`', 'An error'], 1,
      '`substr()` works on every text in the vector.',
      { code: 'substr(c("apple", "kiwi"), 1, 1)', output: '[1] "a" "k"' }),
    mc('What does `sprintf("%d", 3.5)` give?', ['`"3"`', '`"4"`', '`"3.5"`', 'An error'], 3,
      '`%d` needs a whole number. Use `%.0f` or `%.1f` for others.',
      { code: 'sprintf("%d", 3.5)', error: 'invalid format' }),
    mc('What does `sprintf("%5.1f", 2.345)` give?', ['`"2.3"`', '`"  2.3"`', '`"2.345"`', '`"00002.3"`'], 1,
      '5 characters wide with 1 decimal, padded with spaces on the left.',
      { code: 'sprintf("%5.1f", 2.345)', output: '[1] "  2.3"' }),
    qShort('Which function removes the spaces at the start and end of a text?', 'trimws',
      '`trimws()` is short for "trim white space".'),
  ],
})
