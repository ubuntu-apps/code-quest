// Working with lists side quest (easy): A movie list. Lesson, Try-it snippets, challenges and quiz.
import { is, makeProject, mc, same, snippet, task } from '../_builders.mjs'

export default makeProject('easy', {
  id: 'proj_movie_list',
  title: 'A movie list',
  paragraphs: [
    'A film club keeps its list of movies as an array of objects:',
    '```\nconst movies = [\n  { title: "Up", year: 2009, rating: 8.3, watched: true },\n  { title: "Coco", year: 2017, rating: 8.4, watched: false },\n  { title: "Cars", year: 2006, rating: 7.2, watched: true },\n  { title: "Soul", year: 2020, rating: 8.0, watched: false },\n]\n```',
    'Members want to ask it questions: which haven\'t we watched? What are the best ones? What\'s the average rating? Each answer is a short chain of `filter`, `map`, `toSorted` and `reduce`.',
    'The last challenge builds the club\'s "to watch" line, best rated first:',
    '```text\nTo watch: Coco (8.4), Soul (8.0)\n```',
  ],
  sandboxCode: 'const movies = [\n  { title: "Up", year: 2009, rating: 8.3, watched: true },\n  { title: "Coco", year: 2017, rating: 8.4, watched: false },\n]\nconsole.log(movies.map((m) => m.title))',
  sandboxSnippets: [
    snippet('Rating to 1 place', 'console.log((8).toFixed(1), (8.35).toFixed(1))'),
  ],
  challenges: [
    task('easy', 'All the titles', {
      prompt: 'Set `titles` to the title of each movie.',
      starter: 'const movies = [\n  { title: "Up", year: 2009, rating: 8.3, watched: true },\n  { title: "Coco", year: 2017, rating: 8.4, watched: false },\n  { title: "Cars", year: 2006, rating: 7.2, watched: true },\n  { title: "Soul", year: 2020, rating: 8.0, watched: false },\n]\n',
      hint: '`movies.map((m) => m.title)`.',
      solution: 'const movies = [\n  { title: "Up", year: 2009, rating: 8.3, watched: true },\n  { title: "Coco", year: 2017, rating: 8.4, watched: false },\n  { title: "Cars", year: 2006, rating: 7.2, watched: true },\n  { title: "Soul", year: 2020, rating: 8.0, watched: false },\n]\nconst titles = movies.map((m) => m.title)',
      tests: [['titles is right', same('titles', '["Up", "Coco", "Cars", "Soul"]')]],
      alt: (starter) => starter.replace('"Up"', '"Brave"'),
    }),
    task('easy', 'Not watched yet', {
      prompt: 'Write `toWatch(movies)`, returning the movies not yet watched.',
      hint: '`movies.filter((m) => !m.watched)`.',
      solution: 'function toWatch(movies) {\n  return movies.filter((m) => !m.watched)\n}',
      tests: [['Two left', same('toWatch([{ title: "A", watched: true }, { title: "B", watched: false }]).map((m) => m.title)', '["B"]')], ['All watched', same('toWatch([{ title: "A", watched: true }])', '[]')]],
    }),
    task('medium', 'This century', {
      prompt: 'Write `since(movies, year)`, returning the titles of movies from that year or later, oldest first.',
      hint: 'Filter by `m.year >= year`, sort by `a.year - b.year`, map to titles.',
      solution: 'function since(movies, year) {\n  return movies\n    .filter((m) => m.year >= year)\n    .toSorted((a, b) => a.year - b.year)\n    .map((m) => m.title)\n}',
      tests: [['Since 2010', same('since([{ title: "Soul", year: 2020 }, { title: "Up", year: 2009 }, { title: "Coco", year: 2017 }], 2010)', '["Coco", "Soul"]')], ['None', same('since([{ title: "Up", year: 2009 }], 2050)', '[]')]],
    }),
    task('medium', 'Average rating', {
      prompt: 'Write `averageRating(movies)`, returning the average `rating`, rounded to 1 decimal place as a number (0 for no movies).',
      hint: 'Check for an empty list, then `reduce` to a total, divide, and `Math.round(x * 10) / 10`.',
      solution: 'function averageRating(movies) {\n  if (movies.length === 0) return 0\n  const total = movies.reduce((sum, m) => sum + m.rating, 0)\n  return Math.round((total / movies.length) * 10) / 10\n}',
      tests: [['Four movies', is('averageRating([{ rating: 8.3 }, { rating: 8.4 }, { rating: 7.2 }, { rating: 8.0 }])', 8)], ['Two movies', is('averageRating([{ rating: 7 }, { rating: 8 }])', 7.5)], ['None', is('averageRating([])', 0)]],
    }),
    task('hard', 'Best one', {
      prompt: 'Write `best(movies)`, returning the title of the highest-rated movie (the first, if tied), or `null` for an empty list.',
      hint: '`movies.reduce((top, m) => (top === null || m.rating > top.rating ? m : top), null)`, then its title.',
      solution: 'function best(movies) {\n  const top = movies.reduce((top, m) => (top === null || m.rating > top.rating ? m : top), null)\n  return top === null ? null : top.title\n}',
      tests: [['Best', is('best([{ title: "Up", rating: 8.3 }, { title: "Coco", rating: 8.4 }])', 'Coco')], ['Tie', is('best([{ title: "A", rating: 5 }, { title: "B", rating: 5 }])', 'A')], ['Empty', is('best([])', null)]],
    }),
    task('expert', 'The to-watch line', {
      prompt: 'Write `watchLine(movies)`, returning `To watch: Coco (8.4), Soul (8.0)`: the unwatched movies, best rated first, each rating to 1 decimal place. With nothing left, return `All watched!`.',
      hint: 'Filter, sort by `b.rating - a.rating`, map to `` `${m.title} (${m.rating.toFixed(1)})` ``, join with `", "`.',
      solution: 'function watchLine(movies) {\n  const left = movies\n    .filter((m) => !m.watched)\n    .toSorted((a, b) => b.rating - a.rating)\n    .map((m) => `${m.title} (${m.rating.toFixed(1)})`)\n  return left.length === 0 ? "All watched!" : `To watch: ${left.join(", ")}`\n}',
      tests: [['The club', is('watchLine([{ title: "Up", rating: 8.3, watched: true }, { title: "Soul", rating: 8, watched: false }, { title: "Coco", rating: 8.4, watched: false }])', 'To watch: Coco (8.4), Soul (8.0)')], ['All watched', is('watchLine([{ title: "Up", rating: 8.3, watched: true }])', 'All watched!')]],
    }),
  ],
  questions: [
    mc('Which method gives just the titles from a list of movies?', ['`map`', '`filter`', '`find`', '`sort`'], 0, 'One title for each movie.'),
    mc('Which method keeps only the unwatched movies?', ['`filter`', '`map`', '`reduce`', '`some`'], 0, 'A test for each movie.'),
    mc('What does `(8).toFixed(1)` give?', ['"8.0"', '8', '"8"', '8.0'], 0, 'Text with one decimal place.', { code: 'console.log((8).toFixed(1))', output: '8.0' }),
    mc('Which sorts movies best rated first?', ['`(a, b) => b.rating - a.rating`', '`(a, b) => a.rating - b.rating`', '`(a, b) => a > b`', '`sort()`'], 0, 'b - a: biggest first.'),
    mc('Why start `reduce` at `null` when finding the best movie?', ['So an empty list gives null, not an error', 'reduce needs null', 'To make it sorted', 'null is bigger than any rating'], 0, 'The empty case needs a start.'),
    mc('What does `["A", "B"].join(", ")` give?', ['"A, B"', '"AB"', '["A, B"]', '"A,B"'], 0, 'The separator goes between items.', { code: 'console.log(["A", "B"].join(", "))', output: 'A, B' }),
  ],
})
