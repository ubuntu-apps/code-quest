import { makeTopic, mc, py, qShort, task } from '../_builders.mjs'

export default makeTopic({
  id: 'urllib_requests',
  title: 'HTTP with urllib',
  paragraphs: [
    '`urllib.request` fetches URLs from stdlib. `urlopen`, read, decode.',
    'Set headers, handle HTTP errors, respect timeouts.',
    'For complex HTTP prefer `requests` library when available.',
    'The sandbox here has no internet access, so the challenges practise everything around a request: building URLs and requests, decoding responses, and handling errors and retries.',
  ],
  sandboxCode: py`from urllib.request import urlopen

# Example structure (may not run offline):
# with urlopen("https://example.com", timeout=5) as r:
#     html = r.read().decode()
print("urllib ready")`,
  challenges: [
    task('easy', 'Build a query string', {
      prompt: 'Turn `params` into a URL query string with `urlencode` and store it in `query`.',
      starter: py`from urllib.parse import urlencode

params = {"q": "python csv", "page": 2}
query = ___
print(query)`,
      hint: '`urlencode(params)` handles spaces and `&` for you.',
      solution: py`from urllib.parse import urlencode

params = {"q": "python csv", "page": 2}
query = urlencode(params)
print(query)`,
      tests: [['Encoded query string', py`query == "q=python+csv&page=2"`]],
    }),
    task('easy', 'Take a URL apart', {
      prompt: 'Use `urlparse` to split `url`. Set `host` to the domain and `path` to the path.',
      starter: py`from urllib.parse import urlparse

url = "https://api.example.com/v1/users?limit=10"
parts = urlparse(url)
host = ___
path = ___`,
      hint: 'The result has `.netloc` (the domain) and `.path`.',
      solution: py`from urllib.parse import urlparse

url = "https://api.example.com/v1/users?limit=10"
parts = urlparse(url)
host = parts.netloc
path = parts.path`,
      tests: [
        ['host', py`host == "api.example.com"`],
        ['path', py`path == "/v1/users"`],
      ],
    }),
    task('medium', 'Read query parameters', {
      prompt:
        'Read the parameters from `url` with `parse_qs`. Set `limit` to the limit as an int, and `tags` to the list of every `tag` value.',
      starter: py`from urllib.parse import urlparse, parse_qs

url = "https://api.example.com/posts?limit=10&tag=python&tag=csv"
params = ___
limit = ___
tags = ___`,
      hint: '`parse_qs(urlparse(url).query)` maps each name to a list of values, so use `params["limit"][0]`.',
      solution: py`from urllib.parse import urlparse, parse_qs

url = "https://api.example.com/posts?limit=10&tag=python&tag=csv"
params = parse_qs(urlparse(url).query)
limit = int(params["limit"][0])
tags = params["tag"]`,
      tests: [
        ['limit is the int 10', py`limit == 10 and isinstance(limit, int)`],
        ['tags lists every value', py`tags == ["python", "csv"]`],
      ],
    }),
    task('medium', 'Add request headers', {
      prompt:
        'Create a `Request` for `url` that sends the headers `User-Agent: CodeQuest/1.0` and `Accept: application/json`. Store it in `req` (don\'t open it).',
      starter: py`from urllib.request import Request

url = "https://api.example.com/v1/users"
req = ___`,
      hint: '`Request(url, headers={...})` takes a dict of header names and values.',
      solution: py`from urllib.request import Request

url = "https://api.example.com/v1/users"
req = Request(url, headers={"User-Agent": "CodeQuest/1.0", "Accept": "application/json"})`,
      tests: [
        ['Targets the URL', py`req.full_url == "https://api.example.com/v1/users"`],
        ['User-Agent header set', py`req.get_header("User-agent") == "CodeQuest/1.0"`],
        ['Accept header set', py`req.get_header("Accept") == "application/json"`],
        ['It is a GET request', py`req.get_method() == "GET"`],
      ],
    }),
    task('hard', 'Prepare a POST', {
      prompt:
        'Build a POST `Request` to `url` whose body is the form-encoded `form` dict (as bytes). Store it in `req`.',
      starter: py`from urllib.parse import urlencode
from urllib.request import Request

url = "https://api.example.com/signup"
form = {"name": "Ana", "age": 30}
body = ___
req = ___`,
      hint: 'A request body must be bytes: `urlencode(form).encode()`. Then `Request(url, data=body, method="POST")`.',
      solution: py`from urllib.parse import urlencode
from urllib.request import Request

url = "https://api.example.com/signup"
form = {"name": "Ana", "age": 30}
body = urlencode(form).encode()
req = Request(url, data=body, method="POST")`,
      tests: [
        ['Method is POST', py`req.get_method() == "POST"`],
        ['Body is encoded bytes', py`req.data == b"name=Ana&age=30"`],
      ],
    }),
    task('hard', 'Decode a response', {
      prompt:
        '`raw` is what `response.read()` returns: bytes. Decode it as UTF-8 into `body`, parse the JSON into `data`, and set `count` to the number of items.',
      starter: py`import json

raw = b'{"ok": true, "items": ["caf\xc3\xa9", "tea", "juice"]}'
body = ___
data = ___
count = ___`,
      hint: '`raw.decode("utf-8")` gives a str; then `json.loads(body)` and `len(data["items"])`.',
      solution: py`import json

raw = b'{"ok": true, "items": ["caf\xc3\xa9", "tea", "juice"]}'
body = raw.decode("utf-8")
data = json.loads(body)
count = len(data["items"])`,
      tests: [
        ['body is text', py`isinstance(body, str) and "café" in body`],
        ['data is parsed', py`data["ok"] is True`],
        ['count', py`count == 3`],
      ],
    }),
    task('expert', 'Safe URL paths', {
      prompt:
        'Write `user_url(name)` that returns `https://api.example.com/users/<name>` with `name` percent-encoded, so spaces and slashes can\'t break the path.',
      starter: py`from urllib.parse import quote

def user_url(name):
    ___`,
      hint: '`quote(name, safe="")` encodes everything that isn\'t a plain letter or digit, including `/`.',
      solution: py`from urllib.parse import quote

def user_url(name):
    return "https://api.example.com/users/" + quote(name, safe="")`,
      tests: [
        ['Plain names unchanged', py`user_url("ana") == "https://api.example.com/users/ana"`],
        ['Spaces encoded', py`user_url("Ana Lee") == "https://api.example.com/users/Ana%20Lee"`],
        ['Slashes encoded', py`user_url("a/b") == "https://api.example.com/users/a%2Fb"`],
      ],
    }),
    task('expert', 'Handle HTTP errors', {
      prompt:
        'Write `safe_get(fetch, url)`. Call `fetch(url)` and return its result. If it raises an `HTTPError` with code 404, return `None` instead. Let every other error propagate.',
      starter: py`from urllib.error import HTTPError

def safe_get(fetch, url):
    ___`,
      hint: 'In `except HTTPError as err:`, check `err.code == 404`; otherwise use a bare `raise` to re-raise.',
      solution: py`from urllib.error import HTTPError

def safe_get(fetch, url):
    try:
        return fetch(url)
    except HTTPError as err:
        if err.code == 404:
            return None
        raise`,
      setup: py`from urllib.error import HTTPError

def ok_fetch(url):
    return "hello"

def missing_fetch(url):
    raise HTTPError(url, 404, "Not Found", None, None)

def broken_fetch(url):
    raise HTTPError(url, 500, "Server Error", None, None)

def raises(fn, exc):
    try:
        fn()
    except exc:
        return True
    return False`,
      tests: [
        ['Returns the body on success', py`safe_get(ok_fetch, "/a") == "hello"`],
        ['Returns None for 404', py`safe_get(missing_fetch, "/a") is None`],
        ['Re-raises other errors', py`raises(lambda: safe_get(broken_fetch, "/a"), HTTPError)`],
      ],
    }),
    task('expert', 'Retry flaky requests', {
      prompt:
        'Write `fetch_with_retry(fetch, url, attempts=3)`. Call `fetch(url)`; if it raises `URLError`, try again, up to `attempts` calls in total. Return the first success, or re-raise the last error.',
      starter: py`from urllib.error import URLError

def fetch_with_retry(fetch, url, attempts=3):
    ___`,
      hint: 'Loop `for i in range(attempts):` with `try: return fetch(url)`. In `except URLError:`, re-raise when `i == attempts - 1`.',
      solution: py`from urllib.error import URLError

def fetch_with_retry(fetch, url, attempts=3):
    for i in range(attempts):
        try:
            return fetch(url)
        except URLError:
            if i == attempts - 1:
                raise`,
      setup: py`from urllib.error import URLError

def make_flaky(failures):
    calls = []
    def fetch(url):
        calls.append(url)
        if len(calls) <= failures:
            raise URLError("connection reset")
        return "data"
    fetch.calls = calls
    return fetch

def raises(fn, exc):
    try:
        fn()
    except exc:
        return True
    return False`,
      tests: [
        ['Succeeds after two failures', py`fetch_with_retry(make_flaky(2), "/x") == "data"`],
        ['Gives up after three tries', py`raises(lambda: fetch_with_retry(make_flaky(5), "/x"), URLError)`],
        ['Makes exactly `attempts` calls', py`(lambda f: (raises(lambda: fetch_with_retry(f, "/x", attempts=4), URLError), len(f.calls))[1])(make_flaky(9)) == 4`],
      ],
    }),
    task('expert', 'Page through results', {
      prompt:
        'An API returns `per_page` items per page. Write `page_urls(base, total_items, per_page)` that returns the URL of every page, like `base?page=1&per_page=20`.',
      starter: py`import math
from urllib.parse import urlencode

def page_urls(base, total_items, per_page):
    ___`,
      hint: 'There are `math.ceil(total_items / per_page)` pages. Build each with `base + "?" + urlencode({"page": n, "per_page": per_page})`.',
      solution: py`import math
from urllib.parse import urlencode

def page_urls(base, total_items, per_page):
    pages = math.ceil(total_items / per_page)
    return [base + "?" + urlencode({"page": n, "per_page": per_page}) for n in range(1, pages + 1)]`,
      tests: [
        ['Partial last page counts', py`page_urls("https://api.example.com/items", 45, 20) == ["https://api.example.com/items?page=1&per_page=20", "https://api.example.com/items?page=2&per_page=20", "https://api.example.com/items?page=3&per_page=20"]`],
        ['Exact multiple', py`len(page_urls("/x", 40, 20)) == 2`],
        ['No items, no pages', py`page_urls("/x", 0, 20) == []`],
      ],
    }),
  ],
  questions: [
    mc('What does `response.read()` return?', ['str', 'dict', 'bytes', 'A list of lines'], 2),
    qShort('Which `urllib.parse` function turns a dict into `a=1&b=2`? (name only)', 'urlencode'),
    mc('Why pass `timeout=` to `urlopen`?', ['So a slow server can\'t hang your program forever', 'To make requests faster', 'To retry automatically', 'To cache the response'], 0),
    mc('What does HTTP status 404 mean?', ['Server error', 'Not found', 'Redirect', 'Unauthorized'], 1),
    mc('Which exception does urllib raise for a 500 response?', ['ValueError', 'TimeoutError', 'JSONDecodeError', 'HTTPError'], 3),
    mc('A `Request` body (`data=`) must be…', ['bytes', 'A dict', 'A str', 'JSON'], 0),
    qShort('Which `urlparse` attribute holds the domain, like `api.example.com`? (attribute name)', 'netloc'),
    mc('Why encode user input with `quote()` before putting it in a URL path?', ['To compress it', 'So characters like spaces and `/` can\'t break the URL', 'To encrypt it', 'Servers require lowercase'], 1),
    mc('Which errors are usually worth retrying?', ['404 Not Found', '400 Bad Request', 'Network errors and 503 Service Unavailable', 'Every error'], 2),
    mc('What does adding `method="POST"` to a `Request` change?', ['The URL', 'The HTTP method sent', 'The response format', 'Nothing unless data is set'], 1),
  ],
})
