// A stand-in for a web server, for the stages and side quests that fetch data. Lesson code runs
// with no network, so challenges get `fakeFetch(url)` as setup code: it answers like `fetch`
// (a promise of a response with `ok`, `status` and `json()`) from the data below, after a
// short wait. Unknown paths give 404; paths under /broken/ give 500.

/** The data the fake server knows, by path. */
export const SERVER_DATA = {
  '/users/1': { id: 1, name: 'Ana', city: 'Lisbon' },
  '/users/2': { id: 2, name: 'Ben', city: 'Oslo' },
  '/users/3': { id: 3, name: 'Kim', city: 'Seoul' },
  '/users/1/posts': [
    { id: 11, title: 'Hello world', likes: 4 },
    { id: 12, title: 'My first app', likes: 9 },
  ],
  '/users/2/posts': [{ id: 21, title: 'Fjords', likes: 15 }],
  '/users/3/posts': [],
  '/weather/lisbon': { city: 'Lisbon', temp: 24, sky: 'sunny' },
  '/weather/oslo': { city: 'Oslo', temp: 8, sky: 'rain' },
  '/weather/seoul': { city: 'Seoul', temp: 17, sky: 'cloudy' },
  '/weather/cairo': { city: 'Cairo', temp: 33, sky: 'sunny' },
}

/** fakeFetch, as JavaScript setup code (its lines aren't counted in error positions). */
export const FAKE_FETCH = `const _cq_server = ${JSON.stringify(SERVER_DATA)}
function fakeFetch(url) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const broken = url.startsWith("/broken/")
      const found = !broken && url in _cq_server
      const status = broken ? 500 : found ? 200 : 404
      resolve({
        url,
        status,
        ok: found,
        json: async () => {
          if (!found) throw new SyntaxError("Unexpected token '<', \\"<html>\\" is not valid JSON")
          return JSON.parse(JSON.stringify(_cq_server[url]))
        },
      })
    }, 10)
  })
}`

/** A short fakeFetch for lesson code and the sandbox, which have no setup code. */
export const MINI_FETCH = 'const DATA = {\n  "/users/1": { id: 1, name: "Ana", city: "Lisbon" },\n  "/users/2": { id: 2, name: "Ben", city: "Oslo" },\n}\n// Works like fetch, from DATA (there is no network here)\nfunction fakeFetch(url) {\n  return new Promise((resolve) => {\n    setTimeout(() => {\n      const found = url in DATA\n      resolve({ ok: found, status: found ? 200 : 404, json: async () => DATA[url] })\n    }, 100)\n  })\n}\n'
