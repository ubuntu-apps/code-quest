// First steps in R: Working with text.
import { R_INTRO, code, isText, makeTopic, matches, mc, near, prints, qShort, r, snippet, task, uses } from '../_builders.mjs'

export default makeTopic({
  id: 'text',
  title: 'Working with text',
  paragraphs: [
    'Text in R is called a **string** (R also calls it "character"). It goes in double quotes `"..."` or single quotes `\'...\'`; both work the same. Use single quotes around text that contains double quotes: `\'She said "hi"\'`.',
    '`paste()` joins pieces of text, with a space between them. `paste0()` joins them with nothing in between. Numbers are turned into text along the way:',
    code('paste("Good", "morning")   # "Good morning"', 'paste0("bike", 42)          # "bike42"', 'paste("Table", 4, "of", 12) # "Table 4 of 12"'),
    'To join with something else, give `paste()` a `sep` (separator): `paste("2026", "10", "30", sep = "-")` gives `"2026-10-30"`.',
    'A few functions for working with text:',
    '| Function | What it does | Example | Result |\n| --- | --- | --- | --- |\n| `nchar()` | counts the characters | `nchar("garden")` | `6` |\n| `toupper()` | capital letters | `toupper("open")` | `"OPEN"` |\n| `tolower()` | small letters | `tolower("SALE")` | `"sale"` |',
    '`nchar()` counts every character, spaces included: `nchar("R is fun")` is 8.',
    'Text that looks like a number is still text. `"5" + 1` gives an error, because R can\'t add text. Leave the quotes off numbers you want to calculate with.',
    'To show a finished message, `cat()` is usually best: it shows the words without quotes, and puts a space between the pieces, like `paste()`.',
    code(r`name <- "Ana"`, r`greeting <- paste("Hello,", name)`, r`cat(greeting, "\n")`),
  ],
  sandboxCode: r`name <- "Ana"
greeting <- paste("Hello,", name)
greeting
cat(greeting, "\n")
nchar(greeting)
toupper(greeting)`,
  sandboxSnippets: [
    snippet('paste and paste0', 'paste("bike", 42)\npaste0("bike", 42)'),
    snippet('A separator', 'paste("2026", "10", "30", sep = "-")\npaste("tea", "milk", "sugar", sep = ", ")'),
    snippet('Quotes inside text', r`cat('She said "hi"', "\n")`),
    snippet('Text is not a number', '# Run it and read the error\n"5" + 1'),
  ],
  readMore: R_INTRO('Character-vectors', 'An Introduction to R: character vectors'),
  challenges: [
    task('easy', 'Join two words', {
      prompt: 'Make `greeting` the text `Good morning`, by joining `"Good"` and `"morning"` with `paste()`.',
      hint: '`greeting <- paste("Good", "morning")`',
      solution: 'greeting <- paste("Good", "morning")',
      tests: [
        ['greeting is "Good morning"', isText('greeting', 'Good morning')],
        ['Uses paste()', uses('paste(')],
      ],
    }),
    task('easy', 'No space', {
      prompt: 'Make `bike_id` the text `bike42`, joining `"bike"` and the number `42` with no space.',
      hint: '`paste0()` joins with nothing in between: `bike_id <- paste0("bike", 42)`.',
      solution: 'bike_id <- paste0("bike", 42)',
      tests: [
        ['bike_id is "bike42"', isText('bike_id', 'bike42')],
        ['Uses paste0()', uses('paste0(')],
      ],
    }),
    task('easy', 'Count the letters', {
      prompt: 'Make `n` the number of characters in `"Community garden"`, spaces included.',
      hint: '`n <- nchar("Community garden")`',
      solution: 'n <- nchar("Community garden")',
      tests: [
        ['n is 16', near('n', 16)],
        ['Uses nchar()', uses('nchar(')],
      ],
    }),
    task('medium', 'A sign in capitals', {
      prompt: 'Make `sign` the text in `notice`, in capital letters.',
      starter: 'notice <- "open today"\n',
      hint: '`sign <- toupper(notice)`',
      solution: 'notice <- "open today"\nsign <- toupper(notice)',
      tests: [
        ['sign is "OPEN TODAY"', isText('sign', 'OPEN TODAY')],
        ['Uses toupper()', uses('toupper(')],
      ],
    }),
    task('medium', 'A date with dashes', {
      prompt: 'Make `date_text` the text `2026-10-30` by pasting `"2026"`, `"10"` and `"30"` with `-` between them.',
      hint: 'Give `paste()` a separator: `paste("2026", "10", "30", sep = "-")`.',
      solution: 'date_text <- paste("2026", "10", "30", sep = "-")',
      tests: [
        ['date_text is "2026-10-30"', isText('date_text', '2026-10-30')],
        ['Uses sep', uses('sep')],
      ],
    }),
    task('medium', 'A name tag', {
      prompt: 'Make `full_name` the first and last names, with a space between them.',
      starter: 'first <- "Ana"\nlast <- "Silva"\n',
      hint: '`full_name <- paste(first, last)`',
      solution: 'first <- "Ana"\nlast <- "Silva"\nfull_name <- paste(first, last)',
      tests: [
        ['full_name is "Ana Silva"', isText('full_name', 'Ana Silva')],
        ['Uses paste()', uses('paste(')],
      ],
    }),
    task('hard', 'Text and a number', {
      prompt: 'Make `message` the text `You ordered 3 cups`, using the variable `cups` for the number.',
      starter: 'cups <- 3\n',
      hint: '`paste()` turns the number into text: `paste("You ordered", cups, "cups")`.',
      solution: 'cups <- 3\nmessage <- paste("You ordered", cups, "cups")',
      tests: [
        ['message is "You ordered 3 cups"', isText('message', 'You ordered 3 cups')],
        ['Uses the cups variable', matches(',\\s*cups\\s*,')],
      ],
    }),
    task('hard', 'Quotes inside text', {
      prompt: 'This line gives an error. Fix it so it shows `She said "hi"`, quotes included.',
      starter: r`cat("She said "hi"", "\n")`,
      hint: 'The inner quotes end the text early. Wrap the text in single quotes instead: `\'She said "hi"\'`.',
      solution: r`cat('She said "hi"', "\n")`,
      tests: [['Shows She said "hi"', prints('She said "hi"')]],
    }),
    task('expert', 'An order code', {
      prompt: 'Make `order_code` the item, a dash and the quantity, all in capitals: `LATTE-2`.',
      starter: 'item <- "latte"\nquantity <- 2\n',
      hint: 'Join with `paste0(item, "-", quantity)`, then wrap that in `toupper()`.',
      solution: 'item <- "latte"\nquantity <- 2\norder_code <- toupper(paste0(item, "-", quantity))',
      tests: [
        ['order_code is "LATTE-2"', isText('order_code', 'LATTE-2')],
        ['Uses toupper()', uses('toupper(')],
      ],
    }),
  ],
  questions: [
    mc('What does `paste("a", "b")` give?', ['`"ab"`', '`"a b"`', '`"a" "b"`', '`"a-b"`'], 1,
      '`paste()` puts a space between the pieces.',
      { code: 'paste("a", "b")', output: '[1] "a b"' }),
    mc('What does `paste0("a", "b")` give?', ['`"ab"`', '`"a b"`', '`"a0b"`', 'An error'], 0,
      '`paste0()` joins the pieces with nothing in between.',
      { code: 'paste0("a", "b")', output: '[1] "ab"' }),
    mc('What does `nchar("R is fun")` give?', ['`6`', '`3`', '`8`', '`7`'], 2,
      '`nchar()` counts every character, including the two spaces.',
      { code: 'nchar("R is fun")', output: '[1] 8' }),
    mc('What does `paste("Room", 4)` give?', ['`"Room4"`', 'An error', '`"Room 4"`', '`"Room" 4`'], 2,
      '`paste()` turns the number into text and adds a space.',
      { code: 'paste("Room", 4)', output: '[1] "Room 4"' }),
    mc('What does `paste("tea", "milk", sep = "+")` give?', ['`"tea milk"`', '`"tea+milk"`', '`"teamilk"`', '`"tea +milk"`'], 1,
      '`sep` replaces the space between the pieces.',
      { code: 'paste("tea", "milk", sep = "+")', output: '[1] "tea+milk"' }),
    mc('What does `"5" + 1` give?', ['`[1] 6`', '`[1] "51"`', 'An error: non-numeric argument', '`[1] "6"`'], 2,
      '`"5"` is text, and R can\'t do arithmetic with text.',
      { code: '"5" + 1', error: 'non-numeric argument' }),
    mc('What does `toupper("Hello")` give?', ['`"hello"`', '`"HELLO"`', '`"Hello"`', '`"H"`'], 1,
      '`toupper()` turns every letter into a capital.',
      { code: 'toupper("Hello")', output: '[1] "HELLO"' }),
    mc('Which shows `It\'s 5 o\'clock` without an error?', ['`cat(\'It\'s 5 o\'clock\')`', '`cat("It\'s 5 o\'clock")`', '`cat(It\'s 5 o\'clock)`', '`cat("It"s 5 o"clock")`'], 1,
      'Text that contains single quotes can go in double quotes.',
      { code: `cat("It's 5 o'clock")`, output: "It's 5 o'clock" }),
    qShort('Which function counts the characters in a piece of text?', 'nchar',
      '`nchar("garden")` is 6.'),
  ],
})
