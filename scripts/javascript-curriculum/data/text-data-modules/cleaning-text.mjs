// Text, data and modules: Cleaning messy text. Lesson, Try-it snippets, challenges and quiz.
import { MDN, makeTopic, mc, qShort, same, snippet, task } from '../_builders.mjs'

export default makeTopic({
  id: 'cleaning_text',
  title: 'Cleaning messy text',
  paragraphs: [
    'Text that comes from people is messy: extra spaces, odd capitals, blank lines, `"Yes"`, `"yes "` and `"Y"` all meaning the same. Before you can count, compare or search it, you **clean** it, the same way every time.',
    'A cleaning function usually does a few small steps in a row, each one simple:',
    '```\nfunction cleanName(raw) {\n  return raw\n    .trim()\n    .replace(/\\s+/g, " ")\n    .toLowerCase()\n    .replace(/\\b\\w/g, (c) => c.toUpperCase())\n}\nconsole.log(cleanName("   aNA    maria   lima "))\n```',
    'For text with many lines, **split** it into lines with `split("\\n")` (or `split(/\\r?\\n/)`, which also handles the Windows line ending `\\r\\n`), clean each line, and **drop** the blank ones with `filter`.',
    '```\nconst raw = "milk\\n\\n  bread \\r\\nEGGS\\n   \\n"\nconst items = raw\n  .split(/\\r?\\n/)\n  .map((line) => line.trim().toLowerCase())\n  .filter((line) => line !== "")\nconsole.log(items)\n```',
    'To compare words fairly, make a **key**: the cleaned form used only for comparing. `"Café"` and `"cafe"` differ only by an accent; `normalize("NFD")` splits an accented letter into the letter and its accent, and removing the accents (the range `\\u0300-\\u036f`) leaves plain letters.',
    '```\nconst key = (word) => word.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase()\nconsole.log(key("Café") === key("cafe"))\n```',
    'A **slug** is a cleaned name used in web addresses, like `my-first-post`: small letters and digits, with dashes between words. And always keep the **original** text too: cleaning throws information away, and you may need it later.',
  ],
  sandboxCode: 'const answers = [" Yes", "yes ", "YES", "no", "  No  ", "maybe"]\nconst cleaned = answers.map((a) => a.trim().toLowerCase())\nconsole.log(cleaned)\nconsole.log(cleaned.filter((a) => a === "yes").length, "said yes")',
  sandboxSnippets: [
    snippet('Lines', 'console.log("a\\n\\nb\\r\\nc".split(/\\r?\\n/))'),
    snippet('Remove accents', 'console.log("Crème brûlée".normalize("NFD").replace(/[\\u0300-\\u036f]/g, ""))'),
    snippet('Only letters', 'console.log("R2-D2 & C-3PO!".replace(/[^a-z]/gi, ""))'),
  ],
  readMore: MDN('Web/JavaScript/Reference/Global_Objects/String/normalize', 'MDN: String.prototype.normalize()'),
  challenges: [
    task('easy', 'Clean answers', {
      prompt: 'Make `cleaned` the answers with spaces trimmed and in small letters.',
      starter: 'const answers = [" Yes", "NO ", "  maybe  "]\n',
      hint: '`answers.map((a) => a.trim().toLowerCase())`.',
      solution: 'const answers = [" Yes", "NO ", "  maybe  "]\nconst cleaned = answers.map((a) => a.trim().toLowerCase())',
      tests: [['cleaned', same('cleaned', '["yes", "no", "maybe"]')]],
    }),
    task('easy', 'Non-blank lines', {
      prompt: 'Make `lines` the lines of `text`, each trimmed, with the blank ones left out. Lines may end with `\\n` or `\\r\\n`.',
      starter: 'const text = "first\\r\\n\\n  second  \\n   \\nthird\\n"\n',
      hint: '`text.split(/\\r?\\n/).map((l) => l.trim()).filter((l) => l !== "")`.',
      solution: 'const text = "first\\r\\n\\n  second  \\n   \\nthird\\n"\nconst lines = text.split(/\\r?\\n/).map((l) => l.trim()).filter((l) => l !== "")',
      tests: [['lines', same('lines', '["first", "second", "third"]')]],
    }),
    task('easy', 'Yes or no', {
      prompt: 'Write `isYes(answer)` that is `true` for any way of writing yes: `yes`, `y`, `yeah`, `yep`, in any case, with spaces around.',
      hint: 'Clean it, then `["yes", "y", "yeah", "yep"].includes(…)`.',
      solution: 'function isYes(answer) {\n  return ["yes", "y", "yeah", "yep"].includes(answer.trim().toLowerCase())\n}',
      tests: [['Yeses', 'isYes(" YES") && isYes("y") && isYes("Yeah ") && isYes("yep")'], ['Not yes', '!isYes("no") && !isYes("yes please") && !isYes("")']],
    }),
    task('medium', 'Clean a name', {
      prompt: 'Write `cleanName(raw)`: trim it, make runs of spaces a single space, and make each word start with a capital and continue in small letters.',
      hint: '`.trim().replace(/\\s+/g, " ").toLowerCase().replace(/\\b\\w/g, (c) => c.toUpperCase())`.',
      solution: 'function cleanName(raw) {\n  return raw\n    .trim()\n    .replace(/\\s+/g, " ")\n    .toLowerCase()\n    .replace(/\\b\\w/g, (c) => c.toUpperCase())\n}',
      tests: [['Ana Maria Lima', 'cleanName("   aNA    maria   lima ") === "Ana Maria Lima"'], ['One word', 'cleanName("BEN") === "Ben"']],
    }),
    task('medium', 'A slug', {
      prompt: 'Write `slugify(title)`: small letters, accents removed, every run of characters that aren\'t letters or digits turned into one `-`, and no `-` at either end. `"Café & Crème: Day 1!"` gives `"cafe-creme-day-1"`.',
      hint: '`normalize("NFD")`, remove `[\\u0300-\\u036f]`, `toLowerCase()`, `replace(/[^a-z0-9]+/g, "-")`, then remove dashes at the ends with `replace(/^-|-$/g, "")`.',
      solution: 'function slugify(title) {\n  return title\n    .normalize("NFD")\n    .replace(/[\\u0300-\\u036f]/g, "")\n    .toLowerCase()\n    .replace(/[^a-z0-9]+/g, "-")\n    .replace(/^-|-$/g, "")\n}',
      tests: [['Café', 'slugify("Café & Crème: Day 1!") === "cafe-creme-day-1"'], ['Spaces at the ends', 'slugify("  Hello,   World  ") === "hello-world"']],
    }),
    task('medium', 'Count the words', {
      prompt: 'Write `wordCount(text)` that counts the words: runs of letters, digits or apostrophes. Punctuation and extra spaces don\'t count.',
      hint: '`(text.match(/[\\w\']+/g) ?? []).length`.',
      solution: 'function wordCount(text) {\n  return (text.match(/[\\w\']+/g) ?? []).length\n}',
      tests: [['A sentence', 'wordCount("It\'s a  fine day -- isn\'t it?") === 6'], ['Empty', 'wordCount("   ") === 0']],
    }),
    task('hard', 'Same word?', {
      prompt: 'Write `sameWord(a, b)` that is true if the words are the same once trimmed, case is ignored and accents are removed.',
      hint: 'Make a `key(word)` function and compare `key(a) === key(b)`.',
      solution: 'function sameWord(a, b) {\n  const key = (w) => w.trim().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase()\n  return key(a) === key(b)\n}',
      tests: [['Café', 'sameWord("Café", " cafe")'], ['São Paulo', 'sameWord("SÃO PAULO", "sao paulo")'], ['Different', '!sameWord("cafe", "cake")']],
    }),
    task('hard', 'Tally the votes', {
      prompt: 'Write `tally(votes)` that counts votes after cleaning them (trimmed, small letters, blank votes left out), returning an object of vote → count.',
      hint: 'Clean each with `map`, `filter` out `""`, then count into an object.',
      solution: 'function tally(votes) {\n  const counts = {}\n  for (const v of votes.map((v) => v.trim().toLowerCase()).filter((v) => v !== "")) {\n    counts[v] = (counts[v] ?? 0) + 1\n  }\n  return counts\n}',
      tests: [['Votes', same('tally(["Pizza", " pizza ", "TACOS", "", "tacos", "pizza"])', '{ pizza: 3, tacos: 2 }')], ['None', same('tally([" "])', '{}')]],
    }),
    task('expert', 'Initials', {
      prompt: 'Write `initials(name)` that gives the capital first letters of each part of a name, with no accents: `"  élise   de la cruz "` gives `"EDLC"`, and parts joined by `-` count separately (`"Mary-Jane"` gives `"MJ"`).',
      hint: 'Remove accents, then `match(/[a-z]+/gi)` gives the parts; take the first letter of each and make it a capital.',
      solution: 'function initials(name) {\n  const plain = name.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "")\n  return (plain.match(/[a-z]+/gi) ?? []).map((part) => part[0].toUpperCase()).join("")\n}',
      tests: [['Élise', 'initials("  élise   de la cruz ") === "EDLC"'], ['Mary-Jane', 'initials("Mary-Jane watson") === "MJW"'], ['Empty', 'initials("") === ""']],
    }),
    task('expert', 'Phone numbers', {
      prompt: 'Write `cleanPhone(raw)` that keeps only the digits of a phone number, and formats a 10-digit one as `(555) 014-2367`. Anything that doesn\'t have exactly 10 digits gives `null`.',
      hint: '`const d = raw.replace(/\\D/g, "")` (`\\D` is "not a digit"); check the length; then `` `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` ``.',
      solution: 'function cleanPhone(raw) {\n  const d = raw.replace(/\\D/g, "")\n  if (d.length !== 10) return null\n  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`\n}',
      tests: [['Dots', 'cleanPhone("555.014.2367") === "(555) 014-2367"'], ['Spaces and dashes', 'cleanPhone(" 555 014 - 2367 ") === "(555) 014-2367"'], ['Too short', 'cleanPhone("014-2367") === null']],
    }),
  ],
  questions: [
    mc('Why clean text before comparing it?', ['So different ways of typing the same thing match', 'To make it shorter', 'JavaScript requires it', 'To remove all letters'], 0, '"Yes " and "yes" should count the same.'),
    mc('What does `split(/\\r?\\n/)` handle that `split("\\n")` doesn\'t?', ['Windows line endings, `\\r\\n`', 'Tabs', 'Spaces', 'Empty text'], 0, 'The \\r is optional.'),
    mc('What does this show?\n```\nconsole.log("  a   b ".trim().replace(/\\s+/g, " "))\n```', ['`a b`', '`a   b`', '`ab`', '` a b `'], 0, 'Trim the ends, squash the middle.', { code: 'console.log("  a   b ".trim().replace(/\\s+/g, " "))', output: 'a b' }),
    mc('What does `normalize("NFD")` do to `"é"`?', ['Splits it into `e` and a separate accent mark', 'Removes it', 'Makes it a capital', 'Nothing'], 0, 'Then the accent can be removed with a regex.'),
    mc('What is a slug?', ['A cleaned name for web addresses, like `my-first-post`', 'A slow function', 'A kind of regex', 'A blank line'], 0, 'Small letters, digits and dashes.'),
    mc('What does this show?\n```\nconsole.log(["a", "", " ", "b"].filter((s) => s.trim() !== "").length)\n```', ['`2`', '`4`', '`3`', '`1`'], 0, 'The blank ones are dropped.', { code: 'console.log(["a", "", " ", "b"].filter((s) => s.trim() !== "").length)', output: '2' }),
    mc('Why keep the original text as well as the cleaned one?', ['Cleaning throws information away that you may need later', 'Cleaned text can\'t be shown', 'It is faster', 'You must by law'], 0, 'Clean a copy.'),
    mc('What does `\\D` match?', ['Any character that is not a digit', 'A digit', 'The letter D', 'A dash'], 0, 'Capital letters invert: \\D, \\W, \\S.'),
    qShort('Which string method removes spaces from both ends?', 'trim', '"  hi ".trim()'),
  ],
})
