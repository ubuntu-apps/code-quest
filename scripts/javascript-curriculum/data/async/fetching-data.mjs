// Asynchronous JavaScript: Fetching data. Lesson, Try-it snippets, challenges and quiz.
import { MDN, makeTopic, mc, prints, qShort, rejectsWhen, resolvesTo, snippet, task, uses } from '../_builders.mjs'
import { FAKE_FETCH, MINI_FETCH } from './_server.mjs'

const fetchTask = (difficulty, title, spec) => task(difficulty, title, { ...spec, setup: FAKE_FETCH })
const PATHS = 'The server knows `/users/1` to `/users/3` (each `{ id, name, city }`), `/users/ID/posts` (a list of `{ id, title, likes }`) and `/weather/CITY` for lisbon, oslo, seoul and cairo (`{ city, temp, sky }`).'

export default makeTopic({
  id: 'fetching_data',
  title: 'Fetching data from a server',
  paragraphs: [
    'The most common async job of all is asking a **server** for data: the weather, a list of products, a user\'s messages. In the browser (and in Node) you do it with **`fetch(url)`**, which returns a promise of a **response**.',
    '```text\nconst response = await fetch("https://api.example.com/users/1")\nif (!response.ok) {\n  throw new Error(`Request failed: ${response.status}`)\n}\nconst user = await response.json()\nconsole.log(user.name)\n```',
    'There are **two** awaits. The first waits for the server to answer: the response tells you the **status** (`200` means OK, `404` not found, `500` the server broke) before the body has fully arrived. The second, **`response.json()`**, reads the body and turns its JSON text into a value.',
    'A detail that catches everyone: `fetch` is only rejected when the request couldn\'t be made at all (no network). A `404` or `500` answer is still a **fulfilled** promise. So always check **`response.ok`** (true for statuses 200 to 299) and throw if it is false.',
    'Lesson code here has no network, so this quest uses **`fakeFetch(url)`**, which answers the same way from some built-in data after a short wait. In the challenges it is already there for you. In the lesson examples it is written out at the top:',
    '```\n' + MINI_FETCH + '\nconst response = await fakeFetch("/users/2")\nif (response.ok) {\n  const user = await response.json()\n  console.log(user.name, "lives in", user.city)\n}\nconst missing = await fakeFetch("/users/99")\nconsole.log(missing.status, missing.ok)\n```',
    'Wrap the fetching in a small async function like `getJson(url)` that fetches, checks `ok` and returns the parsed data, and use it everywhere. Then every request handles failure the same way, and the rest of your code just awaits values.',
    'Everything from this quest works with requests: `Promise.all` to fetch several things at once, `try`…`catch` to show a friendly message when the server is down, `Promise.race` for a timeout. Real servers also need care with how **often** you ask (don\'t fetch in a tight loop) and with the data you get back (check it before trusting it).',
  ],
  sandboxCode: MINI_FETCH + '\nconst response = await fakeFetch("/users/1")\nconsole.log(response.status, response.ok)\nconst user = await response.json()\nconsole.log(user)',
  sandboxSnippets: [
    snippet('Not found', MINI_FETCH + '\nconst response = await fakeFetch("/users/99")\nconsole.log(response.ok ? "found" : "not found: " + response.status)'),
    snippet('A getJson helper', MINI_FETCH + '\nasync function getJson(url) {\n  const response = await fakeFetch(url)\n  if (!response.ok) throw new Error(`${url} gave ${response.status}`)\n  return response.json()\n}\ntry {\n  console.log(await getJson("/users/2"))\n  console.log(await getJson("/nope"))\n} catch (e) {\n  console.log("Problem:", e.message)\n}'),
    snippet('Two at once', MINI_FETCH + '\nconst responses = await Promise.all([fakeFetch("/users/1"), fakeFetch("/users/2")])\nconst users = await Promise.all(responses.map((r) => r.json()))\nconsole.log(users.map((u) => u.name))'),
  ],
  readMore: MDN('Web/API/Fetch_API/Using_Fetch', 'MDN: Using the Fetch API'),
  challenges: [
    fetchTask('easy', 'Fetch a user', {
      prompt: `Use \`fakeFetch("/users/3")\` and \`.json()\` to make \`user\` the user's data, then show their name. ${PATHS}`,
      hint: '`const response = await fakeFetch("/users/3")`, then `const user = await response.json()`.',
      solution: 'const response = await fakeFetch("/users/3")\nconst user = await response.json()\nconsole.log(user.name)',
      tests: [['user is Kim\'s data', 'JSON.stringify(user) === JSON.stringify({ id: 3, name: "Kim", city: "Seoul" })'], ['Shows Kim', prints('Kim')], ['Uses fakeFetch and json()', '_cq_code.includes("fakeFetch(") && _cq_code.includes(".json()")']],
      typedOk: true,
    }),
    fetchTask('easy', 'Check the status', {
      prompt: `Fetch \`url\` and show \`Found\` if the response is \`ok\`, else \`Not found (STATUS)\`. ${PATHS}`,
      starter: 'const url = "/users/7"\n',
      hint: '`const response = await fakeFetch(url)`; `if (response.ok) … else console.log(`Not found (${response.status})`)`.',
      solution: 'const url = "/users/7"\nconst response = await fakeFetch(url)\nif (response.ok) {\n  console.log("Found")\n} else {\n  console.log(`Not found (${response.status})`)\n}',
      tests: [['Shows Not found (404)', prints('Not found (404)')], ['Uses response.ok', uses('.ok')]],
      alt: 'const url = "/users/2"',
    }),
    fetchTask('easy', 'Today\'s weather', {
      prompt: `Write \`async function weather(city)\` that fetches \`/weather/CITY\` and returns text like \`Oslo: 8°C, rain\`. ${PATHS}`,
      hint: '`const w = await (await fakeFetch(`/weather/${city}`)).json()`, then build the text.',
      solution: 'async function weather(city) {\n  const response = await fakeFetch(`/weather/${city}`)\n  const w = await response.json()\n  return `${w.city}: ${w.temp}°C, ${w.sky}`\n}',
      tests: [['weather("oslo")', resolvesTo('weather("oslo")', '"Oslo: 8°C, rain"')], ['weather("cairo")', resolvesTo('weather("cairo")', '"Cairo: 33°C, sunny"')]],
    }),
    fetchTask('medium', 'A getJson helper', {
      prompt: `Write \`async function getJson(url)\`: fetch \`url\`; if the response isn't \`ok\`, throw \`Error("URL failed with STATUS")\`; else return the parsed JSON. ${PATHS}`,
      hint: '`if (!response.ok) throw new Error(`${url} failed with ${response.status}`)`, then `return response.json()`.',
      solution: 'async function getJson(url) {\n  const response = await fakeFetch(url)\n  if (!response.ok) throw new Error(`${url} failed with ${response.status}`)\n  return response.json()\n}',
      tests: [['A user', resolvesTo('getJson("/users/1")', '{ id: 1, name: "Ana", city: "Lisbon" }')], ['Not found', rejectsWhen('getJson("/users/42")', '/users/42 failed with 404')], ['Server broken', rejectsWhen('getJson("/broken/users")', 'failed with 500')]],
    }),
    fetchTask('medium', 'Total likes', {
      prompt: `Write \`async function totalLikes(userId)\` that fetches the user's posts and returns the sum of their \`likes\`. ${PATHS}`,
      hint: 'Fetch `/users/${userId}/posts`, `.json()`, then `reduce`.',
      solution: 'async function totalLikes(userId) {\n  const response = await fakeFetch(`/users/${userId}/posts`)\n  const posts = await response.json()\n  return posts.reduce((sum, p) => sum + p.likes, 0)\n}',
      tests: [['User 1 has 13', resolvesTo('totalLikes(1)', '13')], ['User 3 has 0', resolvesTo('totalLikes(3)', '0')]],
    }),
    fetchTask('medium', 'Several users at once', {
      prompt: `Write \`async function names(ids)\` that fetches all the users at once and returns their names, in the order of \`ids\`. ${PATHS}`,
      hint: '`Promise.all(ids.map(async (id) => (await (await fakeFetch(`/users/${id}`)).json()).name))`.',
      solution: 'async function names(ids) {\n  const users = await Promise.all(\n    ids.map(async (id) => {\n      const response = await fakeFetch(`/users/${id}`)\n      return response.json()\n    }),\n  )\n  return users.map((u) => u.name)\n}',
      tests: [['3, 1, 2', resolvesTo('names([3, 1, 2])', '["Kim", "Ana", "Ben"]')], ['Uses Promise.all', uses('Promise.all(')], ['At once', '(async () => { const real = fakeFetch; let open = 0; let most = 0; fakeFetch = async (u) => { open++; most = Math.max(most, open); try { return await real(u) } finally { open-- } }; try { await names([1, 2, 3]) } finally { fakeFetch = real } return most > 1 })()']],
    }),
    fetchTask('hard', 'A friendly message', {
      prompt: `Write \`async function cityOf(id)\` that returns \`NAME lives in CITY\`, or \`Sorry, the server is down\` if the status is 500 or more, or \`Sorry, user ID wasn't found\` if the response isn't ok for another reason. ${PATHS} (To see a 500, try \`fakeFetch("/broken/x")\`.)`,
      hint: 'Check `response.status >= 500` first, then `!response.ok`, then read the JSON.',
      solution: 'async function cityOf(id) {\n  const response = await fakeFetch(`/users/${id}`)\n  if (response.status >= 500) return "Sorry, the server is down"\n  if (!response.ok) return `Sorry, user ${id} wasn\'t found`\n  const user = await response.json()\n  return `${user.name} lives in ${user.city}`\n}',
      tests: [['User 2', resolvesTo('cityOf(2)', '"Ben lives in Oslo"')], ['User 8', resolvesTo('cityOf(8)', '"Sorry, user 8 wasn\'t found"')], ['Server down', '(async () => { const real = fakeFetch; try { fakeFetch = () => Promise.resolve({ ok: false, status: 503, json: async () => ({}) }); return (await cityOf(1)) === "Sorry, the server is down" } finally { fakeFetch = real } })()']],
    }),
    fetchTask('hard', 'The user and their posts', {
      prompt: `Write \`async function profile(id)\`: fetch the user, then their posts, and return \`{ name, posts }\` where \`posts\` is the list of post titles, most liked first. ${PATHS}`,
      hint: 'Two fetches (they can run together with `Promise.all`), then sort the posts by `likes`, biggest first, and map to titles.',
      solution: 'async function profile(id) {\n  const [userRes, postsRes] = await Promise.all([fakeFetch(`/users/${id}`), fakeFetch(`/users/${id}/posts`)])\n  const user = await userRes.json()\n  const posts = await postsRes.json()\n  const titles = posts.toSorted((a, b) => b.likes - a.likes).map((p) => p.title)\n  return { name: user.name, posts: titles }\n}',
      tests: [['User 1', resolvesTo('profile(1)', '{ name: "Ana", posts: ["My first app", "Hello world"] }')], ['User 3', resolvesTo('profile(3)', '{ name: "Kim", posts: [] }')]],
    }),
    fetchTask('expert', 'The warmest city', {
      prompt: `Write \`async function warmest(cities)\` that fetches the weather for every city at once and returns the name (as the server writes it) of the warmest one. Skip cities the server doesn't know; if none are known, return \`null\`. ${PATHS}`,
      hint: 'Fetch them all with `Promise.all`; keep only the `ok` responses; read their JSON; then find the one with the highest `temp`.',
      solution: 'async function warmest(cities) {\n  const responses = await Promise.all(cities.map((c) => fakeFetch(`/weather/${c}`)))\n  const reports = await Promise.all(responses.filter((r) => r.ok).map((r) => r.json()))\n  if (reports.length === 0) return null\n  return reports.reduce((best, w) => (w.temp > best.temp ? w : best)).city\n}',
      tests: [['Lisbon beats Oslo and Seoul', resolvesTo('warmest(["oslo", "lisbon", "seoul"])', '"Lisbon"')], ['Unknown cities skipped', resolvesTo('warmest(["paris", "cairo", "oslo"])', '"Cairo"')], ['None known', resolvesTo('warmest(["atlantis"])', 'null')]],
    }),
    fetchTask('expert', 'Fetch with a cache', {
      prompt: `Asking the server twice for the same thing wastes time. Write \`cachedJson(url)\` (async) that fetches and returns the JSON the first time, and returns the saved value for that url after that, **without** fetching again. Make the cache a \`Map\` named \`cache\`. ${PATHS}`,
      hint: '`const cache = new Map()`. In the function: `if (cache.has(url)) return cache.get(url)`; else fetch, `.json()`, `cache.set(url, data)` and return it.',
      solution: 'const cache = new Map()\nasync function cachedJson(url) {\n  if (cache.has(url)) return cache.get(url)\n  const response = await fakeFetch(url)\n  const data = await response.json()\n  cache.set(url, data)\n  return data\n}',
      tests: [['Gives the data', resolvesTo('cachedJson("/weather/seoul")', '{ city: "Seoul", temp: 17, sky: "cloudy" }')], ['Fetches only once', '(async () => { const real = fakeFetch; let calls = 0; try { fakeFetch = (u) => { calls++; return real(u) }; await cachedJson("/users/2"); await cachedJson("/users/2"); await cachedJson("/users/2") } finally { fakeFetch = real } return calls === 1 && cache.has("/users/2") })()']],
    }),
  ],
  questions: [
    mc('What does `await fetch(url)` give you?', ['A response: its status, and a way to read the body', 'The data, parsed', 'Text', 'Nothing until the page reloads'], 0, 'The body is read with .json() (or .text()).'),
    mc('Why are there two `await`s, one for `fetch` and one for `.json()`?', ['The response arrives before the whole body has been read', 'It is a mistake; one is enough', 'json() is slow on purpose', 'To try twice'], 0, 'Headers first, body second.'),
    mc('The server answers `404`. What does the `fetch` promise do?', ['It is fulfilled, with `ok` false and `status` 404', 'It is rejected', 'It never settles', 'It retries'], 0, 'Only network failures reject; check ok.'),
    mc('What does `response.ok` tell you?', ['Whether the status is a success (200–299)', 'Whether the body is JSON', 'Whether the network is on', 'Whether it was fast'], 0, 'Check it before reading the data.'),
    mc('What does status `500` mean?', ['The server had a problem', 'Not found', 'Everything is fine', 'You are not allowed'], 0, '5xx are server errors; 4xx are mistakes in the request.'),
    mc('Which is the best shape for code that fetches in many places?', ['One `getJson(url)` helper that fetches, checks `ok` and parses', 'Copy the fetch lines everywhere', 'Never check the status', 'Fetch everything at start-up'], 0, 'One place to handle failure.'),
    mc('How do you fetch three things at once?', ['`Promise.all` of the three fetches', 'Three awaits one after another', 'Fetch the three urls joined into one', 'setInterval'], 0, 'They don\'t depend on each other.'),
    mc('What does `response.json()` do?', ['Reads the body and turns its JSON text into a value (a promise of it)', 'Turns a value into JSON text', 'Checks the status', 'Sends data to the server'], 0, 'Like JSON.parse, for the body.'),
    qShort('Which response property is `true` for a successful status?', 'ok', 'response.ok'),
  ],
})
