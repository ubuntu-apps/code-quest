// Querying a table: Matching text with LIKE.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { QUERYING_DB } from '../databases.mjs'

export default makeTopic({
  id: 'like_patterns',
  title: 'Matching text with LIKE',
  database: QUERYING_DB,
  paragraphs: [
    '`=` only matches text exactly. `LIKE` matches a **pattern** with two wildcards: `%` stands for any number of characters (even none), and `_` stands for exactly one character.',
    "```\nSELECT title FROM books WHERE title LIKE 'The %';\n```",
    "`'The %'` matches every title that starts with `The` and a space. Put the `%` where the unknown part goes: `'The%'` starts with The, `'%y'` ends with y, `'%war%'` contains war anywhere, and `'____'` (four underscores) is exactly four characters long.",
    "In SQLite, `LIKE` ignores the difference between upper and lower case for the letters A to Z, so `name LIKE 'note%'` matches `Notebook`. (`=` doesn't.)",
    "```\nSELECT name FROM products WHERE name LIKE '%note%';\n```",
    '`NOT LIKE` keeps the rows that don\'t match the pattern.',
    "Without wildcards, `LIKE` is just an equals that ignores case: `species LIKE 'DOG'` matches `dog`. Use `=` when you know the exact value, and `LIKE` when you know only part of it.",
  ],
  sandboxCode: "SELECT title FROM books WHERE title LIKE 'The %';",
  sandboxSnippets: [
    snippet('Starts with', "SELECT title FROM books WHERE title LIKE 'The %';"),
    snippet('Ends with', "SELECT name FROM pets WHERE name LIKE '%y';"),
    snippet('Contains', "SELECT title FROM books WHERE title LIKE '%of%';"),
    snippet('Exact length', "SELECT name FROM pets WHERE name LIKE '___';"),
    snippet('Ignores case', "SELECT name FROM products WHERE name LIKE 'NOTE%';"),
  ],
  readMore: { label: 'SQLite: the LIKE operator', url: 'https://www.sqlite.org/lang_expr.html#like', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Starts with "The"', {
      prompt: 'Show the `title` of every book whose title starts with `The ` (The and a space).',
      hint: "`WHERE title LIKE 'The %'`.",
      solution: "SELECT title FROM books WHERE title LIKE 'The %';",
    }),
    query('easy', 'Ends in y', {
      prompt: 'Show the `name` of every pet whose name ends with the letter `y`.',
      hint: "The `%` goes before the y: `LIKE '%y'`.",
      solution: "SELECT name FROM pets WHERE name LIKE '%y';",
    }),
    query('easy', 'Anything with "note"', {
      prompt: 'Show the `name` of every product whose name contains `note` anywhere, in any case.',
      hint: "`%` on both sides: `LIKE '%note%'`. LIKE ignores case, so `Notebook` matches too.",
      solution: "SELECT name FROM products WHERE name LIKE '%note%';",
    }),
    query('medium', "Christie's books", {
      prompt: 'Show the `title` of the books whose `author` ends with `Christie`.',
      hint: "`WHERE author LIKE '%Christie'`.",
      solution: "SELECT title FROM books WHERE author LIKE '%Christie';",
    }),
    query('medium', 'Murder!', {
      prompt: 'Show the `title` of every book with `Murder` in its title.',
      hint: "`LIKE '%Murder%'`.",
      solution: "SELECT title FROM books WHERE title LIKE '%Murder%';",
    }),
    query('medium', 'No letter a', {
      prompt: 'Show the `name` of every pet whose name has no letter `a` in it (upper or lower case).',
      hint: "`NOT LIKE '%a%'`. LIKE ignores case, so this skips both `Ana` and `luna`.",
      solution: "SELECT name FROM pets WHERE name NOT LIKE '%a%';",
    }),
    query('hard', 'Four letters', {
      prompt: 'Show the `name` of every pet whose name is exactly four letters long.',
      hint: "Each `_` is one character: `LIKE '____'` (four underscores).",
      solution: "SELECT name FROM pets WHERE name LIKE '____';",
    }),
    query('hard', 'Second letter o', {
      prompt: 'Show the `name` of every pet whose name has `o` as its second letter.',
      hint: "One character, then o, then anything: `LIKE '_o%'`.",
      solution: "SELECT name FROM pets WHERE name LIKE '_o%';",
    }),
    query('expert', '"The" or "of"', {
      prompt: 'Show the `title` of every book whose title starts with `The ` or contains the word `of` (with a space on each side).',
      hint: "Two LIKEs joined by OR: `title LIKE 'The %' OR title LIKE '% of %'`.",
      solution: "SELECT title FROM books WHERE title LIKE 'The %' OR title LIKE '% of %';",
    }),
    query('expert', 'Phones', {
      prompt: 'Show the `name` and `stock` of the `electronics` products with `phone` anywhere in their name.',
      hint: "`WHERE category = 'electronics' AND name LIKE '%phone%'`.",
      solution: "SELECT name, stock FROM products WHERE category = 'electronics' AND name LIKE '%phone%';",
    }),
  ],
  questions: [
    mc('What does `%` stand for in a LIKE pattern?', ['Exactly one character', 'Any number of characters, even none', 'A percent sign only', 'A digit'], 1,
      '`%` matches any run of characters, including an empty one.'),
    mc('What does `_` stand for in a LIKE pattern?', ['Exactly one character', 'A space', 'Any number of characters', 'An underscore only'], 0,
      'Each `_` matches exactly one character.'),
    mc('Which pattern finds titles that end with `ing`?', ["`'ing%'`", "`'_ing'`", "`'%ing'`", "`'%ing%'`"], 2,
      'The `%` goes where the unknown part is: before the ending.'),
    mc("Does `name LIKE 'note%'` match `Notebook` in SQLite?", ['No, LIKE is case-sensitive', 'Only with `=`', 'Only in lower case', 'Yes, LIKE ignores case for A to Z'], 3,
      "SQLite's LIKE ignores upper and lower case for English letters."),
    mc('Which finds names exactly three characters long?', ["`LIKE '___'`", "`LIKE '%3'`", "`LIKE '%%%'`", "`LIKE '3'`"], 0,
      'Three underscores match exactly three characters.'),
    qShort('Which keyword compares text with a pattern that uses `%` and `_`?', 'LIKE',
      '`LIKE` compares text with a pattern that can contain wildcards.'),
    mc('Which finds titles containing `war` anywhere?', ["`'war%'`", "`'%war%'`", "`'%war'`", "`'_war_'`"], 1,
      '`%` on both sides allows anything before and after.'),
    mc("What does `NOT LIKE '%a%'` keep?", ['Values with an a', 'Values that start with a', 'Only the value a', 'Values with no a'], 3,
      'NOT LIKE keeps the rows that don\'t match: here, those without an a.'),
    mc("Does `species LIKE 'DOG'` (no wildcards) match `dog`?", ['Yes: without wildcards it is an equals that ignores case', 'No, the case differs', 'Only with `%`', 'It gives an error'], 0,
      'Without wildcards, LIKE compares the whole value, ignoring case.'),
    mc('When is `=` better than `LIKE`?', ['Never', 'For numbers only', 'When you know the exact value', 'When the value has spaces'], 2,
      '`=` says exactly what you mean when you know the whole value; LIKE is for partial matches.'),
  ],
})
