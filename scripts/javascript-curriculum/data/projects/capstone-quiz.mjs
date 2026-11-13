// Capstone: A quiz game. Lesson, Try-it snippets, challenges and quiz.
import { makeTopic, mc, prints, qShort, resolvesTo, same, snippet, task } from '../_builders.mjs'

const BANK = 'const bankJson = `[\n  { "id": 1, "category": "space", "q": "Which planet is known as the red planet?", "a": "Mars" },\n  { "id": 2, "category": "space", "q": "What is the largest planet?", "a": "Jupiter" },\n  { "id": 3, "category": "nature", "q": "How many legs does a spider have?", "a": "8", "accept": ["eight"] },\n  { "id": 4, "category": "space", "q": "What do we call a rock that burns up in the sky?", "a": "meteor", "accept": ["shooting star"] },\n  { "id": 5, "category": "nature", "q": "What is the largest ocean?", "a": "Pacific", "accept": ["Pacific Ocean"] },\n  { "id": 6, "category": "nature", "q": "What gas do plants take in?", "a": "carbon dioxide", "accept": ["CO2"] }\n]`\nconst bank = JSON.parse(bankJson)\n'
const CHECK = 'function isRight(question, answer) {\n  const clean = (s) => String(s).trim().replace(/\\s+/g, " ").toLowerCase()\n  return [question.a, ...(question.accept ?? [])].some((ok) => clean(ok) === clean(answer))\n}\n'
const RANDOM = 'function makeRandom(seed) {\n  let state = seed\n  return () => {\n    state = (state * 1664525 + 1013904223) % 4294967296\n    return state / 4294967296\n  }\n}\n'
const SHUFFLE = 'function shuffle(list, random) {\n  const out = [...list]\n  for (let i = out.length - 1; i > 0; i--) {\n    const j = Math.floor(random() * (i + 1))\n    ;[out[i], out[j]] = [out[j], out[i]]\n  }\n  return out\n}\n'
const SCORE = 'function score(results) {\n  let points = 0\n  let streak = 0\n  for (const r of results) {\n    if (r.correct) {\n      streak++\n      points += 10 + (streak >= 3 ? 5 : 0)\n    } else {\n      streak = 0\n    }\n  }\n  return points\n}\n'

export default makeTopic({
  id: 'capstone_quiz',
  title: 'A quiz game',
  paragraphs: [
    'Build the engine of a quiz game: a bank of questions saved as JSON, fair answer checking, rounds picked at random, points with a bonus for a streak, a time limit on each answer, and a high-score table.',
    'Games feel random, but code that is random is hard to test: run it twice and you get two answers. The trick is a **seeded** random number generator: a function that gives numbers that look random, but always the same sequence for the same **seed**. Tests use a fixed seed; the real game uses the time as its seed.',
    '```\nfunction makeRandom(seed) {\n  let state = seed\n  return () => {\n    state = (state * 1664525 + 1013904223) % 4294967296\n    return state / 4294967296\n  }\n}\nconst r1 = makeRandom(42)\nconst r2 = makeRandom(42)\nconsole.log(r1(), r1())\nconsole.log(r2(), r2())\n```',
    'The same idea, passing in what can change, goes for answers and time: the game asks an `async` function `getAnswer(question)` for each answer. In the real game it waits for the player; in the tests it is a fake that answers at once, or too late.',
    'The scoring: 10 points for a right answer, and 5 more for each right answer that makes a streak of 3 or more in a row. A wrong answer, or no answer in time, ends the streak.',
  ],
  sandboxCode: BANK + '\nconsole.log(bank.length, "questions")\nconsole.log(bank.map((q) => q.category))',
  sandboxSnippets: [
    snippet('Swap two', 'const list = ["a", "b", "c"]\n;[list[0], list[2]] = [list[2], list[0]]\nconsole.log(list)'),
    snippet('Time limit race', 'const answer = new Promise((r) => setTimeout(() => r("Mars"), 300))\nconst timeUp = new Promise((r) => setTimeout(() => r(null), 100))\nconsole.log(await Promise.race([answer, timeUp]))'),
  ],
  challenges: [
    task('easy', 'The bank', {
      prompt: 'Make `categories` the list of the bank\'s categories, each once, in order of first appearance, and `perCategory` an object counting the questions in each.',
      starter: BANK,
      hint: '`[...new Set(bank.map((q) => q.category))]`; count into an object with a loop.',
      solution: BANK + 'const categories = [...new Set(bank.map((q) => q.category))]\nconst perCategory = {}\nfor (const q of bank) perCategory[q.category] = (perCategory[q.category] ?? 0) + 1',
      tests: [['categories', same('categories', '["space", "nature"]')], ['perCategory', same('perCategory', '{ space: 3, nature: 3 }')]],
      alt: (starter) => starter.replace('"id": 2, "category": "space"', '"id": 2, "category": "art"'),
    }),
    task('easy', 'Is it right?', {
      prompt: 'Write `isRight(question, answer)`: true if the answer matches `question.a` or any text in `question.accept` (if there is one), ignoring case, spaces at the ends and extra spaces inside. Answers may be numbers too.',
      starter: BANK,
      hint: 'A `clean` helper with `String(s).trim().replace(/\\s+/g, " ").toLowerCase()`, then `[question.a, ...(question.accept ?? [])].some(…)`.',
      solution: BANK + CHECK,
      tests: [['Case and spaces', 'isRight(bank[0], "  mars ") && isRight(bank[5], "Carbon   Dioxide")'], ['Other answers', 'isRight(bank[2], "eight") && isRight(bank[2], 8) && isRight(bank[3], "Shooting star")'], ['Wrong', '!isRight(bank[1], "Saturn") && !isRight(bank[0], "")']],
    }),
    task('easy', 'Points', {
      prompt: 'Write `score(results)`: `results` is a list of `{ correct }`. Give 10 points per right answer, plus 5 for each right answer that is the 3rd or more in a row.',
      hint: 'Keep a `streak` counter: add one on a right answer, set it to 0 on a wrong one.',
      solution: SCORE,
      tests: [['Three in a row', 'score([{ correct: true }, { correct: true }, { correct: true }]) === 35'], ['Broken streak', 'score([{ correct: true }, { correct: true }, { correct: false }, { correct: true }, { correct: true }, { correct: true }, { correct: true }]) === 70'], ['None right', 'score([{ correct: false }]) === 0 && score([]) === 0']],
    }),
    task('medium', 'Seeded random', {
      prompt: 'Write `makeRandom(seed)` as in the lesson: it returns a function that gives the next number between 0 and 1 each time it is called, always the same sequence for the same seed.',
      hint: 'Keep `state` in the outer function; the inner one updates it with `(state * 1664525 + 1013904223) % 4294967296` and returns `state / 4294967296`.',
      solution: RANDOM,
      tests: [['Same seed, same numbers', '(() => { const a = makeRandom(7); const b = makeRandom(7); return a() === b() && a() === b() })()'], ['Between 0 and 1', '(() => { const r = makeRandom(1); for (let i = 0; i < 100; i++) { const x = r(); if (x < 0 || x >= 1) return false } return true })()'], ['The first number for seed 42', 'Math.abs(makeRandom(42)() - 0.2523451747838408) < 1e-12']],
    }),
    task('medium', 'Shuffle', {
      prompt: 'Write `shuffle(list, random)` that returns a **new** shuffled list (the Fisher–Yates way: from the last place down to the second, swap each with a random place at or before it), using the `random` function it is given.',
      starter: RANDOM,
      hint: '`for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [out[i], out[j]] = [out[j], out[i]] }`.',
      solution: RANDOM + SHUFFLE,
      tests: [['Seed 42', same('shuffle([1, 2, 3, 4, 5], makeRandom(42))', '[3, 4, 5, 1, 2]')], ['Same items', '(() => { const s = shuffle([1, 2, 3, 4, 5, 6], makeRandom(9)); return s.length === 6 && [...s].sort().join() === "1,2,3,4,5,6" })()'], ['Original unchanged', '(() => { const list = [1, 2, 3]; shuffle(list, makeRandom(3)); return list.join() === "1,2,3" })()']],
    }),
    task('medium', 'Pick a round', {
      prompt: 'Write `pickRound(bank, category, n, random)` that takes the questions of that category (all, if `category` is `"any"`), shuffles them with `shuffle`, and returns the first `n` ids.',
      starter: BANK + RANDOM + SHUFFLE,
      hint: 'Filter, `shuffle(…, random)`, `slice(0, n)`, then map to `q.id`.',
      solution: BANK + RANDOM + SHUFFLE + 'function pickRound(bank, category, n, random) {\n  const pool = category === "any" ? bank : bank.filter((q) => q.category === category)\n  return shuffle(pool, random)\n    .slice(0, n)\n    .map((q) => q.id)\n}',
      tests: [['Two space questions', '(() => { const ids = pickRound(bank, "space", 2, makeRandom(5)); return ids.length === 2 && ids.every((id) => [1, 2, 4].includes(id)) && ids[0] !== ids[1] })()'], ['Same seed, same round', 'JSON.stringify(pickRound(bank, "any", 4, makeRandom(11))) === JSON.stringify(pickRound(bank, "any", 4, makeRandom(11)))'], ['Asks for too many', 'pickRound(bank, "nature", 10, makeRandom(1)).length === 3']],
    }),
    task('hard', 'Play a round', {
      prompt: 'Write `async function play(questions, getAnswer)` that asks each question in turn with `await getAnswer(question)` and returns the results: `{ id, answer, correct }` for each, using `isRight`.',
      starter: BANK + CHECK,
      hint: 'A `for…of` loop with `await`, pushing an object for each question.',
      solution: BANK + CHECK + 'async function play(questions, getAnswer) {\n  const results = []\n  for (const q of questions) {\n    const answer = await getAnswer(q)\n    results.push({ id: q.id, answer, correct: isRight(q, answer) })\n  }\n  return results\n}',
      tests: [['A player', resolvesTo('play(bank.slice(0, 3), async (q) => ({ 1: "mars", 2: "Saturn", 3: "eight" })[q.id])', '[{ id: 1, answer: "mars", correct: true }, { id: 2, answer: "Saturn", correct: false }, { id: 3, answer: "eight", correct: true }]')], ['One at a time', '(async () => { let open = 0; let most = 0; await play(bank, async () => { open++; most = Math.max(most, open); await new Promise((r) => setTimeout(r, 5)); open--; return "x" }); return most === 1 })()']],
    }),
    task('hard', 'A time limit', {
      prompt: 'Write `async function answerWithin(getAnswer, question, ms)` that gives the player\'s answer if it comes within `ms` milliseconds, and `null` (time\'s up) if not. Use `Promise.race`.',
      hint: '`Promise.race([getAnswer(question), new Promise((resolve) => setTimeout(() => resolve(null), ms))])`.',
      solution: 'async function answerWithin(getAnswer, question, ms) {\n  const timeUp = new Promise((resolve) => setTimeout(() => resolve(null), ms))\n  return Promise.race([getAnswer(question), timeUp])\n}',
      tests: [['In time', resolvesTo('answerWithin(async () => { await new Promise((r) => setTimeout(r, 10)); return "Mars" }, {}, 100)', '"Mars"')], ['Too slow', resolvesTo('answerWithin(async () => { await new Promise((r) => setTimeout(r, 150)); return "Mars" }, {}, 30)', 'null')]],
    }),
    task('expert', 'High scores', {
      prompt: 'Write `addHighScore(table, name, points)`: `table` is a list of `{ name, points }`, best first. Return a **new** table with the new score in its place (after any equal scores already there), keeping only the top 5, and the new score\'s `rank` (1 to 5, or `null` if it didn\'t make it): `{ table, rank }`.',
      hint: 'Find the first index whose points are lower: `table.findIndex((e) => e.points < points)` (use the end if none). Insert there in a copy with `toSpliced`, then `slice(0, 5)`. The rank is index + 1 if it is under 5.',
      solution: 'function addHighScore(table, name, points) {\n  let at = table.findIndex((e) => e.points < points)\n  if (at === -1) at = table.length\n  const next = table.toSpliced(at, 0, { name, points }).slice(0, 5)\n  return { table: next, rank: at < 5 ? at + 1 : null }\n}',
      tests: [['In the middle', same('addHighScore([{ name: "A", points: 90 }, { name: "B", points: 70 }], "Kim", 80)', '{ table: [{ name: "A", points: 90 }, { name: "Kim", points: 80 }, { name: "B", points: 70 }], rank: 2 }')], ['A tie goes after', 'addHighScore([{ name: "A", points: 50 }], "Z", 50).rank === 2'], ['Not good enough', '(() => { const t = [90, 80, 70, 60, 50].map((p, i) => ({ name: "P" + i, points: p })); const r = addHighScore(t, "Low", 10); return r.rank === null && r.table.length === 5 && t.length === 5 })()'], ['Top of a full table', '(() => { const t = [90, 80, 70, 60, 50].map((p, i) => ({ name: "P" + i, points: p })); const r = addHighScore(t, "Ace", 99); return r.rank === 1 && r.table.length === 5 && r.table.at(-1).points === 60 })()']],
    }),
    task('expert', 'Game over', {
      prompt: 'Write `async function game(bank, getAnswer, seed)` that picks 4 questions from any category with `makeRandom(seed)`, plays them with a 50 ms limit each (time\'s up counts as wrong, shown as `—`), then shows a line per question like `✓ Which planet is known as the red planet? mars` (or `✗ …`), and finally `Score: N`. Then play it with the given `player` and seed 3.',
      starter: BANK + CHECK + RANDOM + SHUFFLE + SCORE + 'const player = async (q) => {\n  if (q.id === 6) await new Promise((r) => setTimeout(r, 200))\n  return { 1: "mars", 2: "jupiter", 3: "six", 4: "meteor", 5: "pacific", 6: "CO2" }[q.id]\n}\n',
      hint: 'Pick ids with `shuffle(bank, makeRandom(seed)).slice(0, 4)`. For each question, race `getAnswer(q)` against a 50 ms timer. Build the results, show the lines, then `score(results)`.',
      solution: BANK + CHECK + RANDOM + SHUFFLE + SCORE + 'const player = async (q) => {\n  if (q.id === 6) await new Promise((r) => setTimeout(r, 200))\n  return { 1: "mars", 2: "jupiter", 3: "six", 4: "meteor", 5: "pacific", 6: "CO2" }[q.id]\n}\nasync function game(bank, getAnswer, seed) {\n  const questions = shuffle(bank, makeRandom(seed)).slice(0, 4)\n  const results = []\n  for (const q of questions) {\n    const timeUp = new Promise((resolve) => setTimeout(() => resolve(null), 50))\n    const answer = await Promise.race([getAnswer(q), timeUp])\n    results.push({ q, answer, correct: answer !== null && isRight(q, answer) })\n  }\n  for (const r of results) {\n    console.log(`${r.correct ? "✓" : "✗"} ${r.q.q} ${r.answer ?? "—"}`)\n  }\n  console.log(`Score: ${score(results)}`)\n}\nawait game(bank, player, 3)',
      tests: [['The game', '(() => { const want = shuffle(bank, makeRandom(3)).slice(0, 4); const rows = want.map((q) => { const a = { 1: "mars", 2: "jupiter", 3: "six", 4: "meteor", 5: "pacific", 6: null }[q.id]; return { q, a, ok: a !== null && isRight(q, a) } }); const lines = rows.map((r) => `${r.ok ? "✓" : "✗"} ${r.q.q} ${r.a ?? "—"}`); return _cq_prints(...lines, `Score: ${score(rows.map((r) => ({ correct: r.ok })))}`) })()'], ['Uses the time limit', '_cq_lines.includes("✗ What gas do plants take in? —") || !shuffle(bank, makeRandom(3)).slice(0, 4).some((q) => q.id === 6)']],
      typedOk: true,
    }),
  ],
  questions: [
    mc('Why use a seeded random function in a game?', ['Tests can use a fixed seed and get the same "random" results every time', 'It is more random', 'Math.random doesn\'t work in games', 'It is faster'], 0, 'Predictable when you need it.'),
    mc('What does `makeRandom(42)` give when called twice, compared with another `makeRandom(42)`?', ['The same two numbers', 'Different numbers', 'Always 42', 'An error'], 0, 'Same seed, same sequence.'),
    mc('Why does `shuffle` copy the list first?', ['So the caller\'s list isn\'t changed', 'Fisher–Yates needs two lists', 'It is faster', 'It doesn\'t need to'], 0, 'No surprises for the caller.'),
    mc('With 10 points per right answer and +5 from the 3rd in a row, what do five right answers score?', ['65', '50', '75', '60'], 0, '10 + 10 + 15 + 15 + 15.', { code: 'let p = 0\nfor (let s = 1; s <= 5; s++) p += 10 + (s >= 3 ? 5 : 0)\nconsole.log(p)', output: '65' }),
    mc('How does the game give up waiting for a slow answer?', ['`Promise.race` with a timer that gives `null`', 'It stops the player\'s function', 'setInterval', 'It can\'t'], 0, 'The first to settle wins.'),
    mc('Why does `play` take `getAnswer` as an argument?', ['The real game and the tests can each pass their own', 'Async functions must be arguments', 'To make it shorter', 'It doesn\'t need to'], 0, 'Dependency injection again.'),
    mc('What does `["a", "b"].toSpliced(1, 0, "x")` give?', ['`[ \'a\', \'x\', \'b\' ]`', '`[ \'x\' ]`', '`[ \'a\', \'b\', \'x\' ]`', 'An error'], 0, 'A new list with x inserted at 1.', { code: 'console.log(["a", "b"].toSpliced(1, 0, "x"))', output: "[ 'a', 'x', 'b' ]" }),
    mc('Why ask the questions one at a time, not with `Promise.all`?', ['A player answers one question after another', 'Promise.all can\'t take functions', 'It is faster', 'It doesn\'t matter'], 0, 'The order matters here.'),
    qShort('What do you call the starting number that fixes the sequence of a random generator?', 'seed', 'makeRandom(seed)'),
  ],
})
