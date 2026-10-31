// Cleaning data, easy side quest: Club sign-ups.
import { code, isTexts, makeProject, mc, prints, qShort, snippet, task } from '../_builders.mjs'

const RAW = 'raw <- "name,email,joined,paid\n ana silva,Ana@Example.org,02/09/2026,yes\nBEN OKAFOR,ben@example.org ,03/09/2026,Y\nCy Li,cy@example.org,N/A,no\nana silva,ana@example.org,02/09/2026,yes\nDee  Moss,dee@example.org,15/09/2026,N/A"\n'
const READ = 'club <- read.csv(text = raw, na.strings = c("", "N/A"))\n'
const EMAIL = 'club$email <- tolower(trimws(club$email))\n'
const NAMES = 'club$name <- tools::toTitleCase(tolower(gsub(" +", " ", trimws(club$name))))\n'
const DEDUPE = 'club <- club[!duplicated(club$email), ]\n'
const PAID = 'club$paid <- unname(c(yes = TRUE, y = TRUE, no = FALSE, n = FALSE)[tolower(club$paid)])\n'

export default makeProject('easy', {
  id: 'proj_club_signups',
  title: 'Club sign-ups',
  paragraphs: [
    'The new gardening club collected sign-ups on a shared form, and it shows: odd spaces, shouting capitals, a member who signed up twice, and three different ways to say "yes".',
    code(...RAW.trim().split('\n')),
    'Clean it step by step into a members list you could hand to the treasurer. The last challenge shows:',
    code('4 members, 2 paid, 1 not paid, 1 unknown'),
  ],
  sandboxCode: RAW + READ + 'str(club)\ntable(club$paid)',
  sandboxSnippets: [snippet('Look at the emails', RAW + READ + 'sort(unique(club$email))')],
  challenges: [
    task('easy', 'Read it in', {
      prompt: 'Read `raw` into `club`, with empty values and `N/A` becoming NA.',
      starter: RAW,
      hint: '`club <- read.csv(text = raw, na.strings = c("", "N/A"))`',
      solution: RAW + READ,
      tests: [['club has 5 rows', 'is.data.frame(club) && nrow(club) == 5'], ['N/A became NA', 'sum(is.na(club$joined)) == 1 && sum(is.na(club$paid)) == 1']],
    }),
    task('easy', 'Clean the emails', {
      prompt: 'Make the `email` column trimmed and small letters.',
      starter: RAW + READ,
      hint: '`club$email <- tolower(trimws(club$email))`',
      solution: RAW + READ + EMAIL,
      tests: [['email is cleaned', 'identical(club$email, c("ana@example.org", "ben@example.org", "cy@example.org", "ana@example.org", "dee@example.org"))']],
    }),
    task('medium', 'Tidy the names', {
      prompt: 'Make each name trimmed, with single spaces, and a capital at the start of each word.',
      starter: RAW + READ + EMAIL,
      hint: '`tools::toTitleCase(tolower(gsub(" +", " ", trimws(club$name))))`',
      solution: RAW + READ + EMAIL + NAMES,
      tests: [['name is Ana Silva, Ben Okafor, Cy Li, Ana Silva, Dee Moss', 'identical(club$name, c("Ana Silva", "Ben Okafor", "Cy Li", "Ana Silva", "Dee Moss"))']],
    }),
    task('medium', 'One row per member', {
      prompt: 'Keep only the first sign-up for each email.',
      starter: RAW + READ + EMAIL + NAMES,
      hint: '`club <- club[!duplicated(club$email), ]`',
      solution: RAW + READ + EMAIL + NAMES + DEDUPE,
      tests: [['club has 4 rows, one per email', 'nrow(club) == 4 && !any(duplicated(club$email))']],
    }),
    task('hard', 'Paid or not', {
      prompt: 'Make `paid` TRUE for yes/y, FALSE for no/n, whatever the case, and NA where it is unknown.',
      starter: RAW + READ + EMAIL + NAMES + DEDUPE,
      hint: 'A lookup: `unname(c(yes = TRUE, y = TRUE, no = FALSE, n = FALSE)[tolower(club$paid)])`.',
      solution: RAW + READ + EMAIL + NAMES + DEDUPE + PAID,
      tests: [['paid is TRUE TRUE FALSE NA', 'identical(unname(club$paid), c(TRUE, TRUE, FALSE, NA))']],
    }),
    task('expert', 'For the treasurer', {
      prompt: 'Show the summary line for the cleaned list:\n\n```\n4 members, 2 paid, 1 not paid, 1 unknown\n```',
      starter: RAW + READ + EMAIL + NAMES + DEDUPE + PAID,
      hint: '`nrow(club)`, `sum(club$paid, na.rm = TRUE)`, `sum(!club$paid, na.rm = TRUE)` and `sum(is.na(club$paid))`, joined with `cat(..., sep = "")`.',
      solution: RAW + READ + EMAIL + NAMES + DEDUPE + PAID + 'cat(nrow(club), " members, ", sum(club$paid, na.rm = TRUE), " paid, ", sum(!club$paid, na.rm = TRUE), " not paid, ", sum(is.na(club$paid)), " unknown\\n", sep = "")',
      tests: [['Shows the summary', prints('4 members, 2 paid, 1 not paid, 1 unknown')]],
    }),
  ],
  questions: [
    mc('Why clean the emails before removing duplicates?', ['It is faster', '"Ana@Example.org" and "ana@example.org" are one person but different texts', 'duplicated() ignores case', 'It isn\'t needed'], 1,
      'Duplicates are found by exact match, so clean first.'),
    mc('What does `tolower(trimws("ben@example.org "))` give?', ['`"ben@example.org"`', '`"BEN@EXAMPLE.ORG"`', '`"ben@example.org "`', '`"ben"`'], 0,
      'Trimmed and small letters.',
      { code: 'tolower(trimws("ben@example.org "))', output: '[1] "ben@example.org"' }),
    mc('What does `tools::toTitleCase(tolower("BEN OKAFOR"))` give?', ['`"BEN OKAFOR"`', '`"Ben Okafor"`', '`"ben okafor"`', '`"Ben okafor"`'], 1,
      'Small letters first, then a capital for each word.',
      { code: 'tools::toTitleCase(tolower("BEN OKAFOR"))', output: '[1] "Ben Okafor"' }),
    mc('What does `unname(c(yes = TRUE, no = FALSE)[c("no", NA)])` give?', ['`[1] FALSE    NA`', '`[1] FALSE TRUE`', 'An error', '`[1] FALSE`'], 0,
      'A missing code gives NA, so unknown stays unknown.',
      { code: 'unname(c(yes = TRUE, no = FALSE)[c("no", NA)])', output: '[1] FALSE    NA' }),
    mc('What does `sum(c(TRUE, FALSE, NA), na.rm = TRUE)` give?', ['`1`', '`NA`', '`2`', '`0`'], 0,
      'TRUE counts as 1; the NA is left out.',
      { code: 'sum(c(TRUE, FALSE, NA), na.rm = TRUE)', output: '[1] 1' }),
    qShort('Which `read.csv()` argument lists the texts that should be read as NA?', 'na.strings',
      '`na.strings = c("", "N/A")`'),
  ],
})
