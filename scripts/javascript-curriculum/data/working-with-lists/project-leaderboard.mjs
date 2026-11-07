// Working with lists side quest (hard): A leaderboard. Lesson, Try-it snippets, challenges and quiz.
import { is, makeProject, mc, same, snippet, task } from '../_builders.mjs'

export default makeProject('hard', {
  id: 'proj_leaderboard',
  title: 'A leaderboard',
  paragraphs: [
    'A game records every round each player finishes:',
    '```\nconst rounds = [\n  { player: "Ana", score: 120 },\n  { player: "Ben", score: 90 },\n  { player: "Ana", score: 80 },\n  { player: "Cal", score: 150 },\n  { player: "Ben", score: 110 },\n  { player: "Dee", score: 50 },\n]\n```',
    'The leaderboard shows each player\'s **total**, highest first. Equal totals share a rank, and the next rank skips: two players tied at 1st are followed by 3rd. Ties are listed A to Z.',
    '```text\n1. Ana 200\n1. Ben 200\n3. Cal 150\n4. Dee 50\n```',
    'Build it in steps: totals per player, sorting with a tie-break, ranks that handle ties, then the lines. Finally, a "most improved" check compares each player\'s first and last rounds.',
  ],
  sandboxCode: 'const rounds = [\n  { player: "Ana", score: 120 },\n  { player: "Ana", score: 80 },\n  { player: "Ben", score: 90 },\n]\nconsole.log(Object.groupBy(rounds, (r) => r.player))',
  sandboxSnippets: [
    snippet('Tie-break', 'const rows = [{ name: "Cy", total: 9 }, { name: "Al", total: 9 }]\nconsole.log(rows.toSorted((a, b) => b.total - a.total || a.name.localeCompare(b.name)))'),
  ],
  challenges: [
    task('easy', 'Totals', {
      prompt: 'Write `totals(rounds)`, returning an object from each player to the sum of their scores.',
      hint: '`reduce` into `{}`: `acc[r.player] = (acc[r.player] ?? 0) + r.score`.',
      solution: 'function totals(rounds) {\n  return rounds.reduce((acc, r) => {\n    acc[r.player] = (acc[r.player] ?? 0) + r.score\n    return acc\n  }, {})\n}',
      tests: [['Totals', same('totals([{ player: "Ana", score: 120 }, { player: "Ben", score: 90 }, { player: "Ana", score: 80 }])', '{ Ana: 200, Ben: 90 }')], ['Empty', same('totals([])', '{}')]],
    }),
    task('easy', 'As rows', {
      prompt: 'Write `rows(totals)`, turning `{ Ana: 200 }` into `[{ name: "Ana", total: 200 }]`.',
      hint: '`Object.entries(totals).map(([name, total]) => ({ name, total }))`.',
      solution: 'function rows(totals) {\n  return Object.entries(totals).map(([name, total]) => ({ name, total }))\n}',
      tests: [['Rows', same('rows({ Ana: 200, Ben: 90 })', '[{ name: "Ana", total: 200 }, { name: "Ben", total: 90 }]')]],
    }),
    task('medium', 'Sorted with ties', {
      prompt: 'Write `ranked(rows)`, returning a sorted copy: highest `total` first, A to Z by `name` for equal totals.',
      hint: '`rows.toSorted((a, b) => b.total - a.total || a.name.localeCompare(b.name))`.',
      solution: 'function ranked(rows) {\n  return rows.toSorted((a, b) => b.total - a.total || a.name.localeCompare(b.name))\n}',
      tests: [['Order', same('ranked([{ name: "Cal", total: 150 }, { name: "Ben", total: 200 }, { name: "Ana", total: 200 }]).map((r) => r.name)', '["Ana", "Ben", "Cal"]')], ['Copy', '(() => { const r = [{ name: "B", total: 1 }, { name: "A", total: 2 }]; ranked(r); return r[0].name === "B" })()']],
    }),
    task('medium', 'Ranks with ties', {
      prompt: 'Write `ranks(totals)`: given totals already sorted highest first, return each one\'s rank, where equal totals share a rank and the next one skips. `[200, 200, 150, 50]` gives `[1, 1, 3, 4]`.',
      hint: 'With `map((t, i) => …)`: if `i > 0` and `t` equals the previous total, the rank is the same as before; otherwise it is `i + 1`. Keep the last rank in a variable.',
      solution: 'function ranks(totals) {\n  let last = 0\n  return totals.map((t, i) => {\n    if (i === 0 || t !== totals[i - 1]) last = i + 1\n    return last\n  })\n}',
      tests: [['Ties', same('ranks([200, 200, 150, 50])', '[1, 1, 3, 4]')], ['No ties', same('ranks([9, 5, 1])', '[1, 2, 3]')], ['All tied', same('ranks([7, 7, 7])', '[1, 1, 1]')]],
    }),
    task('hard', 'The board', {
      prompt: 'Write `board(rounds)`, returning the leaderboard lines like `1. Ana 200`, with ties sharing a rank and listed A to Z.',
      hint: 'Totals → rows → sorted; then map each row with its rank (as in the last step) into a line.',
      solution: 'function board(rounds) {\n  const totals = rounds.reduce((acc, r) => {\n    acc[r.player] = (acc[r.player] ?? 0) + r.score\n    return acc\n  }, {})\n  const sorted = Object.entries(totals)\n    .map(([name, total]) => ({ name, total }))\n    .toSorted((a, b) => b.total - a.total || a.name.localeCompare(b.name))\n  let rank = 0\n  return sorted.map((row, i) => {\n    if (i === 0 || row.total !== sorted[i - 1].total) rank = i + 1\n    return `${rank}. ${row.name} ${row.total}`\n  })\n}',
      tests: [['The game', same('board([{ player: "Ana", score: 120 }, { player: "Ben", score: 90 }, { player: "Ana", score: 80 }, { player: "Cal", score: 150 }, { player: "Ben", score: 110 }, { player: "Dee", score: 50 }])', '["1. Ana 200", "1. Ben 200", "3. Cal 150", "4. Dee 50"]')], ['One player', same('board([{ player: "Zed", score: 5 }])', '["1. Zed 5"]')]],
    }),
    task('expert', 'Most improved', {
      prompt: 'Write `mostImproved(rounds)`: for each player with at least 2 rounds, the improvement is their last score minus their first. Return the name with the biggest improvement (A to Z first on a tie), or `null` if nobody has 2 rounds.',
      hint: 'Group by player, keep groups with `length >= 2`, map to `[name, list.at(-1).score - list[0].score]`, sort, take the first.',
      solution: 'function mostImproved(rounds) {\n  const groups = Object.groupBy(rounds, (r) => r.player)\n  const gains = Object.entries(groups)\n    .filter(([, list]) => list.length >= 2)\n    .map(([name, list]) => [name, list.at(-1).score - list[0].score])\n    .toSorted(([nameA, a], [nameB, b]) => b - a || nameA.localeCompare(nameB))\n  return gains.length === 0 ? null : gains[0][0]\n}',
      tests: [['Ben improved', is('mostImproved([{ player: "Ana", score: 120 }, { player: "Ben", score: 90 }, { player: "Ana", score: 80 }, { player: "Ben", score: 110 }])', 'Ben')], ['Tie goes A to Z', is('mostImproved([{ player: "Zoe", score: 1 }, { player: "Al", score: 1 }, { player: "Zoe", score: 5 }, { player: "Al", score: 5 }])', 'Al')], ['Nobody', is('mostImproved([{ player: "Ana", score: 1 }])', null)]],
    }),
  ],
  questions: [
    mc('Why group or reduce the rounds first?', ['Each player has several rounds that need one total', 'To sort them', 'To remove players', 'Rounds are already totals'], 0, 'One total per player.'),
    mc('What does `b.total - a.total || a.name.localeCompare(b.name)` do on equal totals?', ['Falls back to A to Z by name', 'Puts them in random order', 'Keeps the highest name', 'Nothing'], 0, '0 || … moves on to the name.'),
    mc('With totals `[9, 9, 4]`, what ranks does "shared rank, then skip" give?', ['1, 1, 3', '1, 1, 2', '1, 2, 3', '2, 2, 3'], 0, 'The third player is 3rd: two are ahead.'),
    mc('What does `[5, 8, 2].at(-1)` give?', ['2', '5', '8', 'undefined'], 0, 'at(-1) is the last item.', { code: 'console.log([5, 8, 2].at(-1))', output: '2' }),
    mc('What does `"Al".localeCompare("Zoe")` give?', ['A negative number', 'A positive number', '0', 'true'], 0, '"Al" comes first.', { code: 'console.log("Al".localeCompare("Zoe") < 0)', output: 'true' }),
    mc('Why use `toSorted` rather than `sort` here?', ['It leaves the original list unchanged', 'It is faster', 'sort can\'t compare names', 'sort only works on numbers'], 0, 'A sorted copy.'),
  ],
})
