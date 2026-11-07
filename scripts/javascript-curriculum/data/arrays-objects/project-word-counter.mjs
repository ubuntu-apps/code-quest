// Arrays and objects side quest (hard): A word counter. Lesson, Try-it snippets, challenges and quiz.
import { is, makeProject, mc, prints, same, snippet, task, uses } from '../_builders.mjs'

export default makeProject('hard', {
  id: 'proj_word_counter',
  title: 'A word counter',
  paragraphs: [
    'Writers and search engines count words. Given some text, find how many words there are, how many different ones, and which come up most.',
    '```\nconst text = "The cat and the hat and the bat"\n```',
    'Words are compared in lower case, so "The" and "the" count as one word. The report:',
    '```text\nWords: 8\nDifferent: 5\nthe: 3\nand: 2\ncat: 1\nhat: 1\nbat: 1\n```',
    'The counts are listed from most to least; equal counts keep the order the words first appeared. A `Set` gives the different words, and a `Map` the counts.',
  ],
  sandboxCode: 'const words = "The cat and the hat".toLowerCase().split(" ")\nconsole.log(words, new Set(words).size)',
  sandboxSnippets: [
    snippet('Count', 'const counts = new Map()\nfor (const w of ["a", "b", "a"]) {\n  counts.set(w, (counts.get(w) ?? 0) + 1)\n}\nconsole.log(counts)'),
  ],
  challenges: [
    task('easy', 'The words', {
      prompt: 'Set `words` to the words of `text`, all in lower case.',
      starter: 'const text = "The Cat and THE hat"\n',
      hint: '`text.toLowerCase().split(" ")`.',
      solution: 'const text = "The Cat and THE hat"\nconst words = text.toLowerCase().split(" ")',
      tests: [['words is right', same('words', '["the", "cat", "and", "the", "hat"]')]],
    }),
    task('easy', 'How many different', {
      prompt: 'Set `different` to how many different words `words` has.',
      starter: 'const words = ["the", "cat", "and", "the", "hat"]\n',
      hint: '`new Set(words).size`.',
      solution: 'const words = ["the", "cat", "and", "the", "hat"]\nconst different = new Set(words).size',
      tests: [['different is 4', is('different', 4)], ['Uses a Set', uses('Set(')]],
    }),
    task('medium', 'Count them', {
      prompt: 'Set `counts` to a `Map` from each word to how many times it appears.',
      starter: 'const words = ["the", "cat", "and", "the", "hat", "and", "the"]\n',
      hint: '`counts.set(w, (counts.get(w) ?? 0) + 1)` for each word.',
      solution: 'const words = ["the", "cat", "and", "the", "hat", "and", "the"]\nconst counts = new Map()\nfor (const w of words) {\n  counts.set(w, (counts.get(w) ?? 0) + 1)\n}',
      tests: [['counts is right', 'counts instanceof Map && JSON.stringify([...counts]) === JSON.stringify([["the", 3], ["cat", 1], ["and", 2], ["hat", 1]])']],
    }),
    task('medium', 'The most common', {
      prompt: 'Set `common` to the word with the highest count in `counts` (the first one, if there is a tie).',
      starter: 'const counts = new Map([["the", 3], ["cat", 1], ["and", 2]])\n',
      hint: 'Loop over the Map, keeping the best count and its word; only replace on a bigger count.',
      solution: 'const counts = new Map([["the", 3], ["cat", 1], ["and", 2]])\nlet common = null\nlet best = 0\nfor (const [word, n] of counts) {\n  if (n > best) {\n    best = n\n    common = word\n  }\n}',
      tests: [['common is the', is('common', 'the')]],
      alt: 'const counts = new Map([["the", 3], ["cat", 1], ["and", 5]])',
    }),
    task('hard', 'Most to least', {
      prompt: 'Show each word and its count from most to least, as `the: 3`. For equal counts, keep the Map\'s order. Go from the highest count down to 1, showing the words with each count.',
      starter: 'const counts = new Map([["cat", 1], ["the", 3], ["and", 2], ["hat", 1]])\n',
      hint: 'Find the highest count first. Then `for (let c = highest; c >= 1; c--)`, and inside, loop over the Map showing words whose count is `c`.',
      solution: 'const counts = new Map([["cat", 1], ["the", 3], ["and", 2], ["hat", 1]])\nlet highest = 0\nfor (const n of counts.values()) {\n  if (n > highest) highest = n\n}\nfor (let c = highest; c >= 1; c--) {\n  for (const [word, n] of counts) {\n    if (n === c) console.log(`${word}: ${n}`)\n  }\n}',
      tests: [['Shows the counts in order', prints('the: 3', 'and: 2', 'cat: 1', 'hat: 1')]],
    }),
    task('expert', 'The report', {
      prompt: 'Show the whole report for `text`: `Words: 8`, `Different: 5`, then every word with its count from most to least.',
      starter: 'const text = "The cat and the hat and the bat"\n',
      hint: 'Put the earlier steps together: lower-case words, a Set for the different ones, a Map for the counts, then the most-to-least loop.',
      solution: 'const text = "The cat and the hat and the bat"\nconst words = text.toLowerCase().split(" ")\nconsole.log(`Words: ${words.length}`)\nconsole.log(`Different: ${new Set(words).size}`)\nconst counts = new Map()\nfor (const w of words) {\n  counts.set(w, (counts.get(w) ?? 0) + 1)\n}\nlet highest = 0\nfor (const n of counts.values()) {\n  if (n > highest) highest = n\n}\nfor (let c = highest; c >= 1; c--) {\n  for (const [word, n] of counts) {\n    if (n === c) console.log(`${word}: ${n}`)\n  }\n}',
      tests: [['Shows the report', prints('Words: 8', 'Different: 5', 'the: 3', 'and: 2', 'cat: 1', 'hat: 1', 'bat: 1')]],
      alt: 'const text = "Go go GO stop go stop wait"',
    }),
  ],
  questions: [
    mc('What does `"A b A".toLowerCase().split(" ")` give?', ['["a", "b", "a"]', '["A", "b", "A"]', '"a b a"', '["ab", "a"]'], 0, 'Lower case first, then split at the spaces.', { code: 'console.log("A b A".toLowerCase().split(" "))', output: "[ 'a', 'b', 'a' ]" }),
    mc('What is `new Set(["x", "y", "x"]).size`?', ['2', '3', '1', '0'], 0, 'x is kept once.', { code: 'console.log(new Set(["x", "y", "x"]).size)', output: '2' }),
    mc('Why lower-case the text first?', ['So "The" and "the" count as the same word', 'split needs lower case', 'Maps can\'t hold capitals', 'To make it shorter'], 0, 'Otherwise they would be counted apart.'),
    mc('What does `counts.values()` give in a `for…of`?', ['Each count', 'Each word', 'Each [word, count] pair', 'The size'], 0, 'values() gives just the values.'),
    mc('After counting `["a", "b", "a"]` in a Map, what is `counts.get("a")`?', ['2', '1', '3', 'undefined'], 0, 'a appears twice.', { code: 'const counts = new Map()\nfor (const w of ["a", "b", "a"]) counts.set(w, (counts.get(w) ?? 0) + 1)\nconsole.log(counts.get("a"))', output: '2' }),
    mc('Why does a Map suit word counts better than an array?', ['Each word is a key you can look up directly', 'Arrays can\'t hold text', 'Maps are always sorted', 'Arrays can\'t count'], 0, 'get and set by word, no searching.'),
  ],
})
