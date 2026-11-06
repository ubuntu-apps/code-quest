// First steps side quest (easy): A name badge. Lesson, Try-it snippets, challenges and quiz.
import { is, makeProject, mc, prints, snippet, task, uses } from '../_builders.mjs'

export default makeProject('easy', {
  id: 'proj_name_badge',
  title: 'A name badge',
  paragraphs: [
    'Time to put First steps together: a name badge for a conference, drawn with text. From these details:',
    '```\nconst first = "Maya"\nconst last = "Lopez"\nconst role = "Designer"\nconst year = 2026\n```',
    'the finished program shows:',
    '```text\n+--------------------+\n| MAYA LOPEZ         |\n| Designer           |\n| Member since 2026  |\n+--------------------+\n```',
    'Every line is 22 characters wide. The border is `+`, 20 dashes and `+`: `"-".repeat(20)` makes the dashes. Each middle line is `| `, the text, then `" |"`, with the text made 18 characters long by `padEnd(18)`, which adds spaces at the end (as `padStart` adds them at the start).',
    'Build it in steps; the last challenges put it together.',
  ],
  sandboxCode: 'const first = "Maya"\nconst last = "Lopez"\nconst name = `${first} ${last}`.toUpperCase()\nconsole.log("+" + "-".repeat(20) + "+")\nconsole.log(`| ${name.padEnd(18)} |`)',
  sandboxSnippets: [
    snippet('Repeat and pad', 'console.log("-".repeat(20))\nconsole.log(`[${"Hi".padEnd(6)}]`)\nconsole.log(`[${"Hi".padStart(6)}]`)'),
    snippet('Line lengths', 'const line = `| ${"Designer".padEnd(18)} |`\nconsole.log(line, line.length)'),
  ],
  challenges: [
    task('easy', 'The name', {
      prompt: 'Set `name` to the first and last names with a space between, in capitals: `MAYA LOPEZ`.',
      starter: 'const first = "Maya"\nconst last = "Lopez"\n',
      hint: '`` `${first} ${last}`.toUpperCase() ``.',
      solution: 'const first = "Maya"\nconst last = "Lopez"\nconst name = `${first} ${last}`.toUpperCase()',
      tests: [['name is MAYA LOPEZ', is('name', 'MAYA LOPEZ')]],
    }),
    task('easy', 'The border', {
      prompt: 'Set `border` to `+`, 20 dashes and `+`, using `repeat`.',
      hint: '`"+" + "-".repeat(20) + "+"`.',
      solution: 'const border = "+" + "-".repeat(20) + "+"',
      tests: [['border is right', is('border', '+--------------------+')], ['Uses repeat', uses('repeat(20)')]],
      typedOk: true,
    }),
    task('medium', 'One badge line', {
      prompt: 'Set `line` to `| `, the role padded to 18 characters, then ` |`: `| Designer           |` (22 characters).',
      starter: 'const role = "Designer"\n',
      hint: '`` `| ${role.padEnd(18)} |` ``.',
      solution: 'const role = "Designer"\nconst line = `| ${role.padEnd(18)} |`',
      tests: [['line is right', is('line', '| Designer           |')], ['line is 22 characters', 'line.length === 22'], ['Uses padEnd', uses('padEnd(18)')]],
    }),
    task('medium', 'Member since', {
      prompt: 'Set `since` to `Member since ` and the year: `Member since 2026`.',
      starter: 'const year = 2026\n',
      hint: '`` `Member since ${year}` ``.',
      solution: 'const year = 2026\nconst since = `Member since ${year}`',
      tests: [['since is right', is('since', 'Member since 2026')]],
    }),
    task('hard', 'The whole badge', {
      prompt: 'Show the whole badge: the border, the name, the role, the member line, then the border again, each middle line padded to 18 characters inside `| ` and ` |`.',
      starter: 'const first = "Maya"\nconst last = "Lopez"\nconst role = "Designer"\nconst year = 2026\n',
      hint: 'Make `name`, `since` and `border` as before, then five `console.log` lines; each middle one is `` `| ${text.padEnd(18)} |` ``.',
      solution: 'const first = "Maya"\nconst last = "Lopez"\nconst role = "Designer"\nconst year = 2026\nconst name = `${first} ${last}`.toUpperCase()\nconst since = `Member since ${year}`\nconst border = "+" + "-".repeat(20) + "+"\nconsole.log(border)\nconsole.log(`| ${name.padEnd(18)} |`)\nconsole.log(`| ${role.padEnd(18)} |`)\nconsole.log(`| ${since.padEnd(18)} |`)\nconsole.log(border)',
      tests: [['Shows the badge', prints('+--------------------+', '| MAYA LOPEZ         |', '| Designer           |', '| Member since 2026  |', '+--------------------+')]],
      alt: 'const first = "Tom"\nconst last = "Ng"\nconst role = "Engineer"\nconst year = 2019',
    }),
    task('expert', 'A badge that fits', {
      prompt: 'Long names won\'t fit in 18 characters. Set `width` to the length of the longest of `name`, `role` and `since`, then show the badge with the border and padding sized to fit: dashes `width + 2` long, and each text padded to `width`.',
      starter: 'const name = "ALEXANDRA VON SCHMIDT"\nconst role = "Designer"\nconst since = "Member since 2026"\n',
      hint: '`Math.max(name.length, role.length, since.length)` gives the width. The border is `"+" + "-".repeat(width + 2) + "+"`, and each line `` `| ${text.padEnd(width)} |` ``.',
      solution: 'const name = "ALEXANDRA VON SCHMIDT"\nconst role = "Designer"\nconst since = "Member since 2026"\nconst width = Math.max(name.length, role.length, since.length)\nconst border = "+" + "-".repeat(width + 2) + "+"\nconsole.log(border)\nconsole.log(`| ${name.padEnd(width)} |`)\nconsole.log(`| ${role.padEnd(width)} |`)\nconsole.log(`| ${since.padEnd(width)} |`)\nconsole.log(border)',
      tests: [
        ['width is the longest length', is('width', 21)],
        ['Shows the badge', prints('+-----------------------+', '| ALEXANDRA VON SCHMIDT |', '| Designer              |', '| Member since 2026     |', '+-----------------------+')],
      ],
      alt: 'const name = "JO KIM"\nconst role = "Chief Technology Officer"\nconst since = "Member since 2001"',
    }),
  ],
  questions: [
    mc('What does `"ab".repeat(3)` give?', ['"ababab"', '"ab3"', '"aabbb"', '"ab ab ab"'], 0,
      'repeat joins copies of the string with nothing between.', { code: 'console.log("ab".repeat(3))', output: 'ababab' }),
    mc('How long is `"Hi".padEnd(5)`?', ['5 characters', '2 characters', '7 characters', '3 characters'], 0,
      'padEnd adds spaces at the end until the text is 5 long.'),
    mc('What does `` `| ${"x".padEnd(3)} |` `` give?', ['"| x   |"', '"| x |"', '"|x  |"', '"|   x |"'], 0,
      '"x" becomes "x  " (3 characters), between "| " and " |".', { code: 'console.log(`| ${"x".padEnd(3)} |`)', output: '| x   |' }),
    mc('What does `"Lopez".toUpperCase()` give?', ['"LOPEZ"', '"lopez"', '"Lopez"', '"L"'], 0,
      'Every letter becomes a capital.', { code: 'console.log("Lopez".toUpperCase())', output: 'LOPEZ' }),
    mc('What does `Math.max("Designer".length, "Maya".length)` give?', ['8', '4', '12', '"Designer"'], 0,
      'The lengths are 8 and 4; max gives 8.', { code: 'console.log(Math.max("Designer".length, "Maya".length))', output: '8' }),
    mc('Which pads text at the start instead of the end?', ['`padStart`', '`padEnd`', '`trim`', '`repeat`'], 0,
      'padStart adds at the start, which lines numbers up on the right.'),
  ],
})
