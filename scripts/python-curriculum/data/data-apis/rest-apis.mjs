import { makeTopic, mc, py, qShort, task } from '../_builders.mjs'

/** A tiny in-memory todo API the challenges call instead of a real server. */
const FAKE_API = py`import json
from urllib.parse import urlparse, parse_qs

_todos = {
    1: {"id": 1, "title": "Buy milk", "done": False},
    2: {"id": 2, "title": "Walk dog", "done": True},
    3: {"id": 3, "title": "Write report", "done": False},
}
api_calls = []

def _reply(status, data):
    return status, json.dumps(data)

def api(method, path, body=None):
    """Pretend REST API for todos. Returns (status_code, response_text)."""
    api_calls.append((method, path))
    url = urlparse(path)
    parts = [p for p in url.path.split("/") if p]
    query = {k: v[0] for k, v in parse_qs(url.query).items()}
    if not parts or parts[0] != "todos" or len(parts) > 2:
        return _reply(404, {"error": "not found"})
    if len(parts) == 1:
        if method == "GET":
            items = sorted(_todos.values(), key=lambda t: t["id"])
            if "done" in query:
                items = [t for t in items if t["done"] == (query["done"] == "true")]
            if "page" in query:
                page, per_page = int(query["page"]), int(query.get("per_page", 2))
                start = (page - 1) * per_page
                next_page = page + 1 if start + per_page < len(items) else None
                return _reply(200, {"items": items[start:start + per_page], "next_page": next_page})
            return _reply(200, items)
        if method == "POST":
            data = json.loads(body or "{}")
            if not str(data.get("title", "")).strip():
                return _reply(400, {"error": "title is required"})
            new_id = max(_todos, default=0) + 1
            _todos[new_id] = {"id": new_id, "title": data["title"], "done": bool(data.get("done", False))}
            return _reply(201, _todos[new_id])
        return _reply(405, {"error": "method not allowed"})
    if not parts[1].isdigit() or int(parts[1]) not in _todos:
        return _reply(404, {"error": "not found"})
    todo_id = int(parts[1])
    if method == "GET":
        return _reply(200, _todos[todo_id])
    if method == "PUT":
        data = json.loads(body or "{}")
        if "title" not in data or "done" not in data:
            return _reply(400, {"error": "PUT needs title and done"})
        _todos[todo_id] = {"id": todo_id, "title": data["title"], "done": bool(data["done"])}
        return _reply(200, _todos[todo_id])
    if method == "DELETE":
        del _todos[todo_id]
        return 204, ""
    return _reply(405, {"error": "method not allowed"})`

const API_NOTE =
  'The sandbox has a pretend todo API: `api(method, path, body=None)` returns `(status, text)`, where `text` is the JSON response.'

export default makeTopic({
  id: 'rest_apis',
  title: 'REST APIs',
  paragraphs: [
    'REST uses HTTP verbs GET POST PUT DELETE on resources identified by URLs.',
    'JSON is common response format. Status codes: 200 OK, 404 not found, 500 server error.',
    'Design clear endpoints; version APIs; document with OpenAPI.',
    'In the challenges you talk to a pretend todo API with `api(method, path, body=None)`. It returns `(status, text)` like a real HTTP call: `GET /todos`, `GET /todos/1`, `POST /todos`, `PUT /todos/1` and `DELETE /todos/1`.',
  ],
  sandboxCode: py`import json

# Conceptual API response
response = {"status": 200, "data": {"id": 1, "title": "Todo"}}
print(response["status"])
print(json.dumps(response["data"]))`,
  challenges: [
    task('easy', 'GET a collection', {
      prompt: `${API_NOTE}\n\nCall \`GET /todos\`. Store the status code in \`status\`, the parsed list in \`todos\`, and how many there are in \`count\`.`,
      starter: py`import json

status, text = api("GET", "/todos")
todos = ___
count = ___`,
      hint: 'Parse the response text with `json.loads(text)`, then use `len(todos)`.',
      solution: py`import json

status, text = api("GET", "/todos")
todos = json.loads(text)
count = len(todos)`,
      setup: FAKE_API,
      tests: [
        ['status is 200', py`status == 200`],
        ['todos is the parsed list', py`isinstance(todos, list) and todos[0]["title"] == "Buy milk"`],
        ['count', py`count == 3`],
      ],
    }),
    task('easy', 'GET one resource', {
      prompt: `${API_NOTE}\n\nFetch the todo with id 2 and store its title in \`title\`.`,
      starter: py`import json

status, text = api("GET", ___)
title = ___`,
      hint: 'One resource lives at `/todos/<id>`, so the path is `"/todos/2"`.',
      solution: py`import json

status, text = api("GET", "/todos/2")
title = json.loads(text)["title"]`,
      setup: FAKE_API,
      tests: [
        ['Asked for /todos/2', py`("GET", "/todos/2") in api_calls`],
        ['title', py`title == "Walk dog"`],
      ],
    }),
    task('medium', 'Check the status code', {
      prompt: `${API_NOTE}\n\nWrite \`get_title(todo_id)\`: return the todo's title, or \`None\` when the API answers 404.`,
      starter: py`import json

def get_title(todo_id):
    status, text = api("GET", f"/todos/{todo_id}")
    ___`,
      hint: 'Check `if status == 404: return None` before parsing the body.',
      solution: py`import json

def get_title(todo_id):
    status, text = api("GET", f"/todos/{todo_id}")
    if status == 404:
        return None
    return json.loads(text)["title"]`,
      setup: FAKE_API,
      tests: [
        ['Existing todo', py`get_title(1) == "Buy milk"`],
        ['Another todo', py`get_title(3) == "Write report"`],
        ['Missing todo gives None', py`get_title(99) is None`],
      ],
    }),
    task('medium', 'Create with POST', {
      prompt: `${API_NOTE}\n\nCreate a todo titled \`Read book\` by POSTing JSON to \`/todos\`. Store the status in \`status\` and the new todo's id in \`new_id\`.`,
      starter: py`import json

status, text = api("POST", "/todos", ___)
new_id = ___`,
      hint: 'The body is a JSON string: `json.dumps({"title": "Read book"})`. The response is the created todo.',
      solution: py`import json

status, text = api("POST", "/todos", json.dumps({"title": "Read book"}))
new_id = json.loads(text)["id"]`,
      setup: FAKE_API,
      tests: [
        ['201 Created', py`status == 201`],
        ['new_id', py`new_id == 4`],
        ['The todo exists now', py`json.loads(api("GET", "/todos/4")[1])["title"] == "Read book"`],
      ],
    }),
    task('hard', 'Update with PUT', {
      prompt: `${API_NOTE}\n\nMark todo 1 as done. PUT replaces the whole resource, so send both \`title\` and \`done\`. Store the status in \`status\`.`,
      starter: py`import json

current = json.loads(api("GET", "/todos/1")[1])
status, text = api("PUT", "/todos/1", ___)`,
      hint: 'Send `json.dumps({"title": current["title"], "done": True})`.',
      solution: py`import json

current = json.loads(api("GET", "/todos/1")[1])
status, text = api("PUT", "/todos/1", json.dumps({"title": current["title"], "done": True}))`,
      setup: FAKE_API,
      tests: [
        ['status is 200', py`status == 200`],
        ['Todo 1 is done', py`json.loads(api("GET", "/todos/1")[1])["done"] is True`],
        ['Title kept', py`json.loads(api("GET", "/todos/1")[1])["title"] == "Buy milk"`],
      ],
    }),
    task('hard', 'Delete a resource', {
      prompt: `${API_NOTE}\n\nDelete todo 3. Store the status in \`status\`, then confirm it is gone: set \`gone\` to \`True\` if fetching it now returns 404.`,
      starter: py`status, text = api(___, ___)
gone = ___`,
      hint: 'Call `api("DELETE", "/todos/3")`, then compare `api("GET", "/todos/3")[0] == 404`.',
      solution: py`status, text = api("DELETE", "/todos/3")
gone = api("GET", "/todos/3")[0] == 404`,
      setup: FAKE_API,
      tests: [
        ['204 No Content', py`status == 204`],
        ['gone is True', py`gone is True`],
        ['Only todo 3 was removed', py`sorted(_todos) == [1, 2]`],
      ],
    }),
    task('expert', 'Filter on the server', {
      prompt: `${API_NOTE}\n\nAsk the API for unfinished todos only, using the query string \`?done=false\`. Store their titles in \`open_titles\`.`,
      starter: py`import json

status, text = api("GET", ___)
open_titles = ___`,
      hint: 'The path is `"/todos?done=false"`; then collect `t["title"]` for each todo.',
      solution: py`import json

status, text = api("GET", "/todos?done=false")
open_titles = [t["title"] for t in json.loads(text)]`,
      setup: FAKE_API,
      tests: [
        ['Used the filter', py`any(path.startswith("/todos?") and "done=false" in path for _, path in api_calls)`],
        ['Only open todos', py`open_titles == ["Buy milk", "Write report"]`],
      ],
    }),
    task('expert', 'Classify status codes', {
      prompt:
        'Write `classify(status)` that returns `"success"` for 2xx codes, `"redirect"` for 3xx, `"client error"` for 4xx and `"server error"` for 5xx.',
      starter: py`def classify(status):
    ___`,
      hint: '`status // 100` gives the first digit: 2, 3, 4 or 5.',
      solution: py`def classify(status):
    kind = status // 100
    if kind == 2:
        return "success"
    if kind == 3:
        return "redirect"
    if kind == 4:
        return "client error"
    if kind == 5:
        return "server error"
    raise ValueError(f"Unknown status {status}")`,
      tests: [
        ['2xx', py`classify(200) == "success" and classify(204) == "success"`],
        ['3xx', py`classify(301) == "redirect"`],
        ['4xx', py`classify(404) == "client error" and classify(422) == "client error"`],
        ['5xx', py`classify(503) == "server error"`],
      ],
    }),
    task('expert', 'Turn API errors into exceptions', {
      prompt: `${API_NOTE}\n\nWrite \`create_todo(title)\` that POSTs a new todo and returns its id. If the API answers 400, raise \`ValueError\` with the API's \`error\` message.`,
      starter: py`import json

def create_todo(title):
    ___`,
      hint: 'Parse the response first. `if status == 400: raise ValueError(data["error"])`.',
      solution: py`import json

def create_todo(title):
    status, text = api("POST", "/todos", json.dumps({"title": title}))
    data = json.loads(text)
    if status == 400:
        raise ValueError(data["error"])
    return data["id"]`,
      setup: py`${FAKE_API}

def error_message(fn):
    try:
        fn()
    except ValueError as err:
        return str(err)
    return None`,
      tests: [
        ['Returns the new id', py`create_todo("Plan trip") == 4`],
        ['Raises for an empty title', py`error_message(lambda: create_todo("  ")) == "title is required"`],
      ],
    }),
    task('expert', 'Follow pagination', {
      prompt: `${API_NOTE}\n\nWith \`?page=N&per_page=2\` the API returns \`{"items": [...], "next_page": N + 1 or null}\`. Write \`fetch_all()\` that follows \`next_page\` from page 1 and returns every todo.`,
      starter: py`import json

def fetch_all():
    ___`,
      hint: 'Start with `page = 1`; loop while `page` is not `None`, extending a list with `data["items"]` and setting `page = data["next_page"]`.',
      solution: py`import json

def fetch_all():
    todos = []
    page = 1
    while page is not None:
        status, text = api("GET", f"/todos?page={page}&per_page=2")
        data = json.loads(text)
        todos.extend(data["items"])
        page = data["next_page"]
    return todos`,
      setup: FAKE_API,
      tests: [
        ['Gets every todo in order', py`[t["id"] for t in fetch_all()] == [1, 2, 3]`],
        ['Used pages, not the plain list', py`all("page=" in path for _, path in api_calls)`],
        ['Stops after the last page', py`(api_calls.clear(), fetch_all(), len(api_calls))[2] == 2`],
      ],
    }),
  ],
  questions: [
    mc('Which HTTP method should read data without changing it?', ['POST', 'GET', 'PUT', 'DELETE'], 1),
    qShort('Which status code means "Created"? (number)', '201'),
    mc('In REST, what identifies a resource?', ['Its URL', 'The request body', 'The HTTP method', 'A cookie'], 0),
    mc('What does status 204 tell you?', ['Not found', 'Server error', 'Success with no response body', 'Redirect'], 2),
    mc('Which method replaces a whole resource?', ['GET', 'POST', 'PATCH', 'PUT'], 3),
    mc('A 4xx status means the problem is…', ['In the request the client sent', 'On the server', 'In the network', 'A redirect'], 0),
    qShort('Which status code means "Not Found"? (number)', '404'),
    mc('Why are PUT and DELETE called idempotent?', ['They are faster', 'Repeating them has the same effect as doing them once', 'They need no body', 'They cannot fail'], 1),
    mc('An API returns 20 items and a `next_page` field. What is this called?', ['Caching', 'Versioning', 'Pagination', 'Throttling'], 2),
    mc('Why put a version like `/v1/` in API paths?', ['To make URLs shorter', 'It is required by HTTP', 'To speed up requests', 'So the API can change without breaking existing clients'], 3),
  ],
})
