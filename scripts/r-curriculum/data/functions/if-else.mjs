// Functions and control flow: if and else.
import { code, isText, makeTopic, mc, near, prints, qShort, r, snippet, task, uses } from '../_builders.mjs'

export default makeTopic({
  id: 'if_else',
  title: 'if and else',
  paragraphs: [
    'So far, every line of your code has run, top to bottom. `if` runs some code **only when** a condition is TRUE. The code to run goes in curly braces:',
    code('temperature <- 31', 'if (temperature > 30) {', r`  cat("Water the greenhouse twice today\n")`, '}'),
    'Add `else` for what to do otherwise, and `else if` for more cases. R checks the conditions in order and runs only the first block whose condition is TRUE:',
    code('if (temperature > 30) {', '  advice <- "water twice"', '} else if (temperature > 20) {', '  advice <- "water once"', '} else {', '  advice <- "no watering"', '}'),
    'Write `} else` on the same line as the closing brace, as above. At the top level of a script R would otherwise think the `if` had already ended.',
    '`if` needs **one** TRUE or FALSE. That\'s the difference from `ifelse()`, which works on a whole vector at once. `if (c(TRUE, FALSE))` is an error ("the condition has length > 1"), and `if (NA)` is an error too, so make sure the condition can\'t be missing. Use `any()`, `all()` or `is.na()` to turn a vector into one answer.',
    'Indent the code inside the braces by two spaces. R doesn\'t need it, but it makes the structure easy to see.',
  ],
  sandboxCode: r`temperature <- 24
if (temperature > 30) {
  advice <- "water twice"
} else if (temperature > 20) {
  advice <- "water once"
} else {
  advice <- "no watering"
}
advice`,
  sandboxSnippets: [
    snippet('Only one value', '# Run it and read the error\nif (c(25, 35) > 30) cat("hot")'),
    snippet('any() and all()', r`temps <- c(25, 35, 28)
if (any(temps > 30)) cat("At least one hot day\n")
if (all(temps > 20)) cat("Every day was warm\n")`),
  ],
  readMore: { label: 'R documentation: Control flow', url: 'https://stat.ethz.ch/R-manual/R-devel/library/base/html/Control.html', source: 'R documentation' },
  challenges: [
    task('easy', 'Hot day', {
      prompt: 'Add an `if` so the code shows `Hot day!` when `temperature` is over 30.',
      starter: 'temperature <- 34\n',
      hint: r`if (temperature > 30) { cat("Hot day!\n") }`,
      solution: r`temperature <- 34
if (temperature > 30) {
  cat("Hot day!\n")
}`,
      tests: [['Shows Hot day!', prints('Hot day!')], ['Uses if', uses('if (') + ' || ' + uses('if(')]],
    }),
    task('easy', 'Pass or fail', {
      prompt: 'Make `result` `"pass"` if `score` is 50 or more, and `"fail"` otherwise, with `if` and `else`.',
      starter: 'score <- 47\n',
      hint: 'Two branches: `if (score >= 50) { result <- "pass" } else { result <- "fail" }`.',
      solution: 'score <- 47\nif (score >= 50) {\n  result <- "pass"\n} else {\n  result <- "fail"\n}',
      tests: [['result is "fail"', isText('result', 'fail')], ['Uses else', uses('else')]],
    }),
    task('easy', 'Free delivery', {
      prompt: 'Make `delivery` 0 if `order_total` is 30 or more, and 3.5 otherwise.',
      starter: 'order_total <- 42\n',
      hint: '`if (order_total >= 30) { delivery <- 0 } else { delivery <- 3.5 }`',
      solution: 'order_total <- 42\nif (order_total >= 30) {\n  delivery <- 0\n} else {\n  delivery <- 3.5\n}',
      tests: [['delivery is 0', near('delivery', 0)]],
    }),
    task('medium', 'Three levels', {
      prompt: 'Make `advice` `"water twice"` above 30 °C, `"water once"` above 20 °C, and `"no watering"` otherwise.',
      starter: 'temperature <- 24\n',
      hint: 'Use `if`, `else if` and `else`, testing the highest temperature first.',
      solution: 'temperature <- 24\nif (temperature > 30) {\n  advice <- "water twice"\n} else if (temperature > 20) {\n  advice <- "water once"\n} else {\n  advice <- "no watering"\n}',
      tests: [['advice is "water once"', isText('advice', 'water once')], ['Uses else if', uses('else if')]],
    }),
    task('medium', 'Any late?', {
      prompt: 'Show `Some deliveries were late` if **any** delivery took more than 30 minutes, and `All on time` otherwise.',
      starter: 'minutes <- c(24, 19, 35, 27)\n',
      hint: '`if` needs one TRUE or FALSE, so wrap the comparison in `any()`.',
      solution: r`minutes <- c(24, 19, 35, 27)
if (any(minutes > 30)) {
  cat("Some deliveries were late\n")
} else {
  cat("All on time\n")
}`,
      tests: [['Shows Some deliveries were late', prints('Some deliveries were late')], ['Uses any()', uses('any(')]],
    }),
    task('medium', 'Fix the condition', {
      prompt: 'This gives the error "the condition has length > 1". It should show `Everyone passed` only when every score is 50 or more. Fix it.',
      starter: r`scores <- c(71, 64, 88, 52)
if (scores >= 50) {
  cat("Everyone passed\n")
}`,
      hint: 'Turn the vector of answers into one with `all()`.',
      solution: r`scores <- c(71, 64, 88, 52)
if (all(scores >= 50)) {
  cat("Everyone passed\n")
}`,
      tests: [['Shows Everyone passed', prints('Everyone passed')]],
    }),
    task('hard', 'Watch out for NA', {
      prompt: 'The reading may be missing. Make `status` `"missing"` if `reading` is NA, `"high"` if it is over 25, and `"ok"` otherwise. Test for NA first.',
      starter: 'reading <- NA\n',
      hint: 'Start with `if (is.na(reading))`. Comparing NA with 25 first would give an error.',
      solution: 'reading <- NA\nif (is.na(reading)) {\n  status <- "missing"\n} else if (reading > 25) {\n  status <- "high"\n} else {\n  status <- "ok"\n}',
      tests: [['status is "missing"', isText('status', 'missing')]],
    }),
    task('expert', 'Ticket price', {
      prompt: 'A museum charges 0 for under-5s, 6 for under-18s, 4 for 65 and over, and 12 for everyone else. Make `price` the price for `age`.',
      starter: 'age <- 70\n',
      hint: 'Four branches. Check the age groups in an order where each condition is clear: under 5, under 18, 65 and over, else.',
      solution: 'age <- 70\nif (age < 5) {\n  price <- 0\n} else if (age < 18) {\n  price <- 6\n} else if (age >= 65) {\n  price <- 4\n} else {\n  price <- 12\n}',
      tests: [['price is 4', near('price', 4)], ['Uses else if', uses('else if')]],
    }),
  ],
  questions: [
    mc('What does `x <- 7; if (x > 5) "big" else "small"` give?', ['`"small"`', '`"big"`', '`TRUE`', 'An error'], 1,
      '7 is over 5, so the first branch is used.',
      { code: 'x <- 7\nif (x > 5) "big" else "small"', output: '[1] "big"' }),
    mc('What does `if (c(TRUE, FALSE)) 1` give?', ['`1`', 'An error: the condition has length > 1', '`NULL`', 'A warning only'], 1,
      '`if` needs exactly one TRUE or FALSE.',
      { code: 'if (c(TRUE, FALSE)) 1', error: 'the condition has length > 1' }),
    mc('What does `if (NA) 1` give?', ['`1`', '`NA`', 'An error', 'Nothing'], 2,
      'R can\'t decide whether to run the code, so it stops.',
      { code: 'if (NA) 1', error: 'missing value where TRUE/FALSE needed' }),
    mc('With `x <- 15`, which branch runs in `if (x > 20) "a" else if (x > 10) "b" else "c"`?', ['`"a"`', '`"b"`', '`"c"`', 'Both b and c'], 1,
      'The first condition is FALSE, the second TRUE. Only one branch runs.',
      { code: 'x <- 15\nif (x > 20) "a" else if (x > 10) "b" else "c"', output: '[1] "b"' }),
    mc('What is the difference between `if` and `ifelse()`?', ['None', '`if` decides once for one value; `ifelse()` decides for every value of a vector', '`ifelse()` is faster', '`if` works on vectors'], 1,
      'Use `ifelse()` for a new column, `if` to decide what code runs.'),
    mc('What does `if (any(c(3, 8) > 5)) "yes" else "no"` give?', ['`"no"`', '`"yes"`', 'An error', '`TRUE`'], 1,
      '`any()` turns the two answers into one TRUE.',
      { code: 'if (any(c(3, 8) > 5)) "yes" else "no"', output: '[1] "yes"' }),
    mc('What does `if (FALSE) "a"` give?', ['`"a"`', 'Nothing (NULL)', 'An error', '`FALSE`'], 1,
      'With no `else`, nothing is run and nothing is shown.',
      { code: 'x <- if (FALSE) "a"\nis.null(x)', output: '[1] TRUE' }),
    mc('Why test `is.na(x)` first in an if/else chain?', ['It is faster', 'Comparing NA (like `x > 25`) would give an error in `if`', 'R needs it', 'To round x'], 1,
      '`if (NA > 25)` is `if (NA)`, which stops with an error.'),
    qShort('Which word gives the branch to run when the `if` condition is FALSE?', 'else',
      '`if (…) { … } else { … }`'),
  ],
})
