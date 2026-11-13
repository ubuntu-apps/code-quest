// Asynchronous JavaScript side quest (hard): A weather board. Lesson, Try-it snippets, challenges and quiz.
import { makeProject, mc, rejectsWhen, resolvesTo, snippet, task } from '../_builders.mjs'
import { FAKE_FETCH } from './_server.mjs'

const fetchTask = (difficulty, title, spec) => task(difficulty, title, { ...spec, setup: FAKE_FETCH })
const GET_JSON = 'async function getJson(url) {\n  const response = await fakeFetch(url)\n  if (!response.ok) throw new Error(`${url} failed with ${response.status}`)\n  return response.json()\n}\n'

export default makeProject('hard', {
  id: 'proj_weather_board',
  title: 'A weather board',
  paragraphs: [
    'Build the data side of a weather board: a screen that shows the weather in a user\'s favourite cities, and copes when the server lets it down.',
    'As in the lesson on fetching, `fakeFetch(url)` stands in for `fetch` and is ready for you. It knows `/weather/CITY` for `lisbon`, `oslo`, `seoul` and `cairo` (each `{ city, temp, sky }`, `temp` in °C), gives `404` for other cities and `500` for any path under `/broken/`.',
    '- `getJson(url)`: fetch, check, parse;\n- `line(report)`: one line of the board, like `Oslo      8°C  rain`;\n- `board(cities)`: every city at once, with `Oslo: not available` for one that fails;\n- `summary(cities)`: the warmest, the coldest and the average;\n- `refresh(cities, getWeather)`: a board that tries a failing city once more before giving up.',
    '```text\nLisbon   24°C  sunny\nOslo      8°C  rain\nParis: not available\n```',
  ],
  sandboxCode: 'const report = { city: "Oslo", temp: 8, sky: "rain" }\nconsole.log(report.city.padEnd(8) + String(report.temp).padStart(3) + "°C  " + report.sky)',
  sandboxSnippets: [
    snippet('Lining up', 'console.log("Oslo".padEnd(8) + String(8).padStart(3) + "°C  rain")\nconsole.log("Lisbon".padEnd(8) + String(24).padStart(3) + "°C  sunny")'),
    snippet('Capital letter', 'const city = "oslo"\nconsole.log(city[0].toUpperCase() + city.slice(1))'),
  ],
  challenges: [
    fetchTask('easy', 'Get the JSON', {
      prompt: 'Write `async function getJson(url)`: fetch it with `fakeFetch`; if the response isn\'t `ok`, throw `Error("URL failed with STATUS")`; else return the parsed JSON.',
      hint: 'Check `response.ok`, then `return response.json()`.',
      solution: GET_JSON,
      tests: [['Oslo', resolvesTo('getJson("/weather/oslo")', '{ city: "Oslo", temp: 8, sky: "rain" }')], ['Paris', rejectsWhen('getJson("/weather/paris")', '/weather/paris failed with 404')]],
    }),
    fetchTask('easy', 'One line', {
      prompt: 'Write `function line(report)` that turns `{ city: "Oslo", temp: 8, sky: "rain" }` into `Oslo      8°C  rain`: the city padded to 8 characters, the temperature padded on the left to 3, then `°C`, two spaces and the sky.',
      hint: '`report.city.padEnd(8) + String(report.temp).padStart(3) + "°C  " + report.sky`.',
      solution: 'function line(report) {\n  return report.city.padEnd(8) + String(report.temp).padStart(3) + "°C  " + report.sky\n}',
      tests: [['Oslo', 'line({ city: "Oslo", temp: 8, sky: "rain" }) === "Oslo      8°C  rain"'], ['Lisbon', 'line({ city: "Lisbon", temp: 24, sky: "sunny" }) === "Lisbon   24°C  sunny"'], ['Below zero', 'line({ city: "Nuuk", temp: -12, sky: "snow" }) === "Nuuk    -12°C  snow"']],
    }),
    fetchTask('medium', 'The board', {
      prompt: 'Write `async function board(cities)` that fetches every city\'s weather **at once** and returns a list of lines (using `line`). A city that fails gives `City: not available` instead, with a capital first letter.',
      starter: GET_JSON + 'function line(report) {\n  return report.city.padEnd(8) + String(report.temp).padStart(3) + "°C  " + report.sky\n}\n',
      hint: 'Map each city to an async function with its own `try`…`catch` that returns a line either way, then `Promise.all`.',
      solution: GET_JSON + 'function line(report) {\n  return report.city.padEnd(8) + String(report.temp).padStart(3) + "°C  " + report.sky\n}\nasync function board(cities) {\n  return Promise.all(\n    cities.map(async (city) => {\n      try {\n        return line(await getJson(`/weather/${city}`))\n      } catch {\n        return `${city[0].toUpperCase()}${city.slice(1)}: not available`\n      }\n    }),\n  )\n}',
      tests: [['Three cities', resolvesTo('board(["lisbon", "oslo", "paris"])', '["Lisbon   24°C  sunny", "Oslo      8°C  rain", "Paris: not available"]')], ['At once', '(async () => { const real = fakeFetch; let open = 0; let most = 0; fakeFetch = async (u) => { open++; most = Math.max(most, open); try { return await real(u) } finally { open-- } }; try { await board(["oslo", "seoul", "cairo"]) } finally { fakeFetch = real } return most > 1 })()']],
    }),
    fetchTask('medium', 'Summary', {
      prompt: 'Write `async function summary(cities)` that fetches the cities at once (skipping any that fail) and returns `{ warmest, coldest, average }`: the city names as the server writes them, and the average temperature rounded to 1 decimal place. With no cities known, return `null`.',
      starter: GET_JSON,
      hint: 'Use `Promise.allSettled`, keep the fulfilled values, then sort a copy by `temp` (or use `reduce`).',
      solution: GET_JSON + 'async function summary(cities) {\n  const results = await Promise.allSettled(cities.map((c) => getJson(`/weather/${c}`)))\n  const reports = results.filter((r) => r.status === "fulfilled").map((r) => r.value)\n  if (reports.length === 0) return null\n  const sorted = reports.toSorted((a, b) => a.temp - b.temp)\n  const average = reports.reduce((sum, r) => sum + r.temp, 0) / reports.length\n  return { warmest: sorted.at(-1).city, coldest: sorted[0].city, average: Math.round(average * 10) / 10 }\n}',
      tests: [['Four cities', resolvesTo('summary(["oslo", "cairo", "lisbon", "seoul"])', '{ warmest: "Cairo", coldest: "Oslo", average: 20.5 }')], ['One unknown', resolvesTo('summary(["seoul", "rome", "oslo"])', '{ warmest: "Seoul", coldest: "Oslo", average: 12.5 }')], ['None known', resolvesTo('summary(["rome"])', 'null')]],
    }),
    fetchTask('hard', 'One more try', {
      prompt: 'Write `async function refresh(cities, getWeather)`: like `board`, but uses `getWeather(city)` (an async function giving a report) instead of fetching, and if it fails for a city, tries **once more** before showing `City: not available`. Return the lines in order.',
      starter: 'function line(report) {\n  return report.city.padEnd(8) + String(report.temp).padStart(3) + "°C  " + report.sky\n}\n',
      hint: 'For each city: `try { return line(await getWeather(city)) } catch { try { return line(await getWeather(city)) } catch { return … } }`.',
      solution: 'function line(report) {\n  return report.city.padEnd(8) + String(report.temp).padStart(3) + "°C  " + report.sky\n}\nasync function refresh(cities, getWeather) {\n  return Promise.all(\n    cities.map(async (city) => {\n      for (let attempt = 1; attempt <= 2; attempt++) {\n        try {\n          return line(await getWeather(city))\n        } catch {\n          // try once more\n        }\n      }\n      return `${city[0].toUpperCase()}${city.slice(1)}: not available`\n    }),\n  )\n}',
      tests: [['A blip is retried', '(async () => { const tries = {}; const getWeather = async (c) => { tries[c] = (tries[c] ?? 0) + 1; if (c === "oslo" && tries[c] === 1) throw new Error("blip"); return { city: c[0].toUpperCase() + c.slice(1), temp: 5, sky: "fog" } }; const lines = await refresh(["oslo", "rome"], getWeather); return JSON.stringify(lines) === JSON.stringify(["Oslo      5°C  fog", "Rome      5°C  fog"]) && tries.oslo === 2 && tries.rome === 1 })()'], ['Gives up after two tries', '(async () => { let calls = 0; const lines = await refresh(["oslo"], async () => { calls++; throw new Error("down") }); return lines[0] === "Oslo: not available" && calls === 2 })()']],
    }),
    fetchTask('expert', 'Keep it fresh', {
      prompt: 'Asking the server again for every redraw is wasteful, but weather does change. Write `makeCache(maxAge)`: it returns an async function `get(city)` that fetches `/weather/CITY` with `getJson`, but reuses a saved report for that city if it is younger than `maxAge` ms. Each `get` call returns the report.',
      starter: GET_JSON,
      hint: 'Inside `makeCache`, keep `const saved = new Map()` of city → `{ report, at }`. In `get`: if there is one and `Date.now() - at < maxAge`, return its report; else fetch, save with `at: Date.now()`, return.',
      solution: GET_JSON + 'function makeCache(maxAge) {\n  const saved = new Map()\n  return async function get(city) {\n    const hit = saved.get(city)\n    if (hit && Date.now() - hit.at < maxAge) return hit.report\n    const report = await getJson(`/weather/${city}`)\n    saved.set(city, { report, at: Date.now() })\n    return report\n  }\n}',
      tests: [['Gives the report', '(async () => { const get = makeCache(1000); return (await get("cairo")).temp === 33 })()'], ['Reuses a fresh one', '(async () => { const real = fakeFetch; let calls = 0; try { fakeFetch = (u) => { calls++; return real(u) }; const get = makeCache(1000); await get("oslo"); await get("oslo"); await get("seoul") } finally { fakeFetch = real } return calls === 2 })()'], ['Fetches again when old', '(async () => { const real = fakeFetch; let calls = 0; try { fakeFetch = (u) => { calls++; return real(u) }; const get = makeCache(30); await get("oslo"); await new Promise((r) => setTimeout(r, 50)); await get("oslo") } finally { fakeFetch = real } return calls === 2 })()']],
    }),
  ],
  questions: [
    mc('Why fetch the cities with `Promise.all` rather than one by one?', ['They don\'t depend on each other, so it is much faster', 'The server needs them together', 'It uses less data', 'It is the only way'], 0, 'As slow as the slowest city, not the sum.'),
    mc('Why does each city get its own `try`…`catch` inside the `map`?', ['So one failing city shows "not available" instead of failing the whole board', 'Because Promise.all needs it', 'To make it faster', 'It doesn\'t matter'], 0, 'Contain failures where they happen.'),
    mc('What does `"Oslo".padEnd(8)` give?', ['`"Oslo    "` (8 characters)', '`"    Oslo"`', '`"Oslo8"`', '`"Oslo"`'], 0, 'Spaces added on the right.', { code: 'console.log(JSON.stringify("Oslo".padEnd(8)))', output: '"Oslo    "' }),
    mc('A city\'s report was saved 5 seconds ago and `maxAge` is 60 seconds. What does the cache do?', ['Returns the saved report without fetching', 'Fetches again', 'Throws an error', 'Deletes the report'], 0, 'It is still fresh.'),
    mc('Which failures are worth one more try?', ['Temporary ones, like a blip in the network', 'A city that doesn\'t exist', 'A typo in the code', 'All of them, for ever'], 0, 'A 404 will fail again.'),
    mc('What does `[{ t: 8 }, { t: 24 }].toSorted((a, b) => a.t - b.t).at(-1).t` give?', ['`24`', '`8`', 'undefined', 'An error'], 0, 'The last after sorting is the biggest.', { code: 'console.log([{ t: 8 }, { t: 24 }].toSorted((a, b) => a.t - b.t).at(-1).t)', output: '24' }),
  ],
})
