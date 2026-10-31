// Types, text and factors, hard side quest: The sign-up sheet.
import { code, isTexts, makeProject, mc, near, prints, qShort, r, snippet, task, uses } from '../_builders.mjs'

const DATA = 'signups <- c("  ana SILVA", "Ben   okafor ", "cy LI", "ANA silva", "dee  Mensah")\n'
const TIDY = 'signups <- c("ana silva", "ben okafor", "cy li", "ana silva", "dee mensah")\n'

export default makeProject('hard', {
  id: 'proj_signup_sheet',
  title: 'The sign-up sheet',
  paragraphs: [
    'The garden club had a sign-up sheet for its autumn workshop. People typed their own names, with stray spaces, odd capitals, and one person who signed up twice:',
    code('signups <- c("  ana SILVA", "Ben   okafor ", "cy LI", "ANA silva", "dee  Mensah")'),
    'Make a clean list of people, each name written properly once, plus their initials for the name badges. The last challenge shows:',
    code('4 people signed up', 'Ana Silva (AS)', 'Ben Okafor (BO)', 'Cy Li (CL)', 'Dee Mensah (DM)'),
    'You will need `trimws()`, `gsub()`, `tolower()`, `toupper()`, `substr()`, `sub()` and `unique()`, which gives each different value once.',
  ],
  sandboxCode: DATA + 'trimws(signups)\ngsub(" +", " ", trimws(signups))',
  sandboxSnippets: [
    snippet('First and last name', 'name <- "ana silva"\nsub(" .*", "", name)\nsub(".* ", "", name)'),
    snippet('A capital first letter', 'word <- "silva"\npaste0(toupper(substr(word, 1, 1)), substr(word, 2, nchar(word)))'),
    snippet('Each once', 'unique(c("ana", "ben", "ana"))'),
  ],
  challenges: [
    task('easy', 'Tidy spaces and capitals', {
      prompt: 'Make `tidy` the names with no spaces at the ends, single spaces between words, and all small letters.',
      starter: DATA,
      hint: '`tolower(gsub(" +", " ", trimws(signups)))`',
      solution: DATA + 'tidy <- tolower(gsub(" +", " ", trimws(signups)))',
      tests: [['tidy is ana silva, ben okafor, cy li, ana silva, dee mensah', isTexts('tidy', 'ana silva', 'ben okafor', 'cy li', 'ana silva', 'dee mensah')]],
    }),
    task('medium', 'Each person once', {
      prompt: 'Make `people` the tidy names with the duplicate removed, and `n_people` how many there are.',
      starter: TIDY,
      hint: '`people <- unique(signups)` and `n_people <- length(people)`.',
      solution: TIDY + 'people <- unique(signups)\nn_people <- length(people)',
      tests: [
        ['people is ana silva, ben okafor, cy li, dee mensah', isTexts('people', 'ana silva', 'ben okafor', 'cy li', 'dee mensah')],
        ['n_people is 4', near('n_people', 4)],
      ],
    }),
    task('medium', 'First and last names', {
      prompt: 'Make `first` everything before the space, and `last` everything after it.',
      starter: 'people <- c("ana silva", "ben okafor", "cy li", "dee mensah")\n',
      hint: '`first <- sub(" .*", "", people)` removes the space and everything after it. `last <- sub(".* ", "", people)` removes everything up to the space.',
      solution: 'people <- c("ana silva", "ben okafor", "cy li", "dee mensah")\nfirst <- sub(" .*", "", people)\nlast <- sub(".* ", "", people)',
      tests: [
        ['first is ana, ben, cy, dee', isTexts('first', 'ana', 'ben', 'cy', 'dee')],
        ['last is silva, okafor, li, mensah', isTexts('last', 'silva', 'okafor', 'li', 'mensah')],
      ],
    }),
    task('hard', 'Capital letters', {
      prompt: 'Make `First` and `Last` the names with a capital first letter, such as `"Ana"` and `"Silva"`.',
      starter: 'first <- c("ana", "ben", "cy", "dee")\nlast <- c("silva", "okafor", "li", "mensah")\n',
      hint: 'Capital first letter, then the rest: `paste0(toupper(substr(first, 1, 1)), substr(first, 2, nchar(first)))`. The same for `last`.',
      solution: 'first <- c("ana", "ben", "cy", "dee")\nlast <- c("silva", "okafor", "li", "mensah")\nFirst <- paste0(toupper(substr(first, 1, 1)), substr(first, 2, nchar(first)))\nLast <- paste0(toupper(substr(last, 1, 1)), substr(last, 2, nchar(last)))',
      tests: [
        ['First is Ana, Ben, Cy, Dee', isTexts('First', 'Ana', 'Ben', 'Cy', 'Dee')],
        ['Last is Silva, Okafor, Li, Mensah', isTexts('Last', 'Silva', 'Okafor', 'Li', 'Mensah')],
      ],
    }),
    task('hard', 'Initials', {
      prompt: 'Make `initials` each person\'s initials in capitals, such as `"AS"`.',
      starter: 'First <- c("Ana", "Ben", "Cy", "Dee")\nLast <- c("Silva", "Okafor", "Li", "Mensah")\n',
      hint: '`paste0(substr(First, 1, 1), substr(Last, 1, 1))`',
      solution: 'First <- c("Ana", "Ben", "Cy", "Dee")\nLast <- c("Silva", "Okafor", "Li", "Mensah")\ninitials <- paste0(substr(First, 1, 1), substr(Last, 1, 1))',
      tests: [['initials is AS, BO, CL, DM', isTexts('initials', 'AS', 'BO', 'CL', 'DM')]],
    }),
    task('expert', 'The badge list', {
      prompt: 'Starting from the messy sign-ups, show:\n\n```\n4 people signed up\nAna Silva (AS)\nBen Okafor (BO)\nCy Li (CL)\nDee Mensah (DM)\n```',
      starter: DATA,
      hint: 'Tidy, `unique()`, split into first and last, add capitals, then `cat(sprintf("%s %s (%s%s)\\n", First, Last, …), sep = "")` shows one line per person.',
      solution: DATA + r`people <- unique(tolower(gsub(" +", " ", trimws(signups))))
first <- sub(" .*", "", people)
last <- sub(".* ", "", people)
First <- paste0(toupper(substr(first, 1, 1)), substr(first, 2, nchar(first)))
Last <- paste0(toupper(substr(last, 1, 1)), substr(last, 2, nchar(last)))
cat(length(people), "people signed up\n")
cat(sprintf("%s %s (%s%s)\n", First, Last, substr(First, 1, 1), substr(Last, 1, 1)), sep = "")`,
      tests: [['Shows the badge list', prints('4 people signed up', 'Ana Silva (AS)', 'Ben Okafor (BO)', 'Cy Li (CL)', 'Dee Mensah (DM)')]],
    }),
  ],
  questions: [
    mc('What does `unique(c("b", "a", "b"))` give?', ['`[1] "a" "b"`', '`[1] "b" "a"`', '`[1] "b" "a" "b"`', '`[1] 2`'], 1,
      '`unique()` keeps each value once, in the order it first appears.',
      { code: 'unique(c("b", "a", "b"))', output: '[1] "b" "a"' }),
    mc('What does `sub(" .*", "", "ben okafor")` give?', ['`"ben"`', '`"okafor"`', '`"ben okafor"`', '`" okafor"`'], 0,
      '` .*` matches the space and everything after it, which is removed.',
      { code: 'sub(" .*", "", "ben okafor")', output: '[1] "ben"' }),
    mc('What does `sub(".* ", "", "ben okafor")` give?', ['`"ben"`', '`"okafor"`', '`"ben "`', '`""`'], 1,
      '`.* ` matches everything up to and including the space.',
      { code: 'sub(".* ", "", "ben okafor")', output: '[1] "okafor"' }),
    mc('What does `paste0(toupper(substr("li", 1, 1)), substr("li", 2, 2))` give?', ['`"LI"`', '`"Li"`', '`"lI"`', '`"L"`'], 1,
      'The first letter in capitals, then the rest unchanged.',
      { code: 'paste0(toupper(substr("li", 1, 1)), substr("li", 2, 2))', output: '[1] "Li"' }),
    mc('What does `tolower(gsub(" +", " ", trimws(" ANA   SILVA ")))` give?', ['`"ana silva"`', '`"ANA SILVA"`', '`" ana silva "`', '`"anasilva"`'], 0,
      'Trim the ends, squeeze the spaces, then small letters.',
      { code: 'tolower(gsub(" +", " ", trimws(" ANA   SILVA ")))', output: '[1] "ana silva"' }),
    mc('Why tidy the names before `unique()`?', ['`unique()` only works on small letters', '`"ana silva"` and `"ANA silva"` are different texts until they are tidied', 'It is faster', 'To sort them'], 1,
      '`unique()` compares exact texts, so the same person typed two ways counts twice.'),
    qShort('Which function keeps each different value once?', 'unique',
      '`unique(x)` drops repeats, keeping the first of each.'),
  ],
})
