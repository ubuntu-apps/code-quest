import { makeTopic, mc, py, qShort, task } from '../_builders.mjs'

export default makeTopic({
  id: 'json_basics',
  title: 'JSON basics',
  paragraphs: [
    'JSON is text format for data exchange. Python `json` module: `loads`, `dumps`.',
    'Convert dict/list to JSON string and back. Keys must be strings in JSON.',
    'Always handle decode errors when parsing untrusted input.',
  ],
  sandboxCode: py`import json

data = {"name": "Ana", "score": 95}
text = json.dumps(data)
print(text)
print(json.loads(text)["name"])`,
  challenges: [
    task('easy', 'Dict to JSON', {
      prompt: 'Use `json.dumps` to turn the `book` dictionary into a JSON string. Store the result in `text`.',
      starter: py`import json

book = {"title": "Dune", "year": 1965}
text = ___`,
      hint: '`json.dumps(some_dict)` returns a string.',
      solution: py`import json

book = {"title": "Dune", "year": 1965}
text = json.dumps(book)`,
      tests: [
        ['text is a string', py`isinstance(text, str)`],
        ['text is the JSON for book', py`__import__('json').loads(text) == {"title": "Dune", "year": 1965}`],
      ],
    }),
    task('easy', 'JSON to dict', {
      prompt: 'Parse the JSON string `raw` with `json.loads`, store the result in `player`, then print the player\'s name.',
      starter: py`import json

raw = '{"name": "Ana", "score": 92}'
player = ___
print(___)`,
      hint: '`json.loads(raw)` gives you a dict; then use `player["name"]`.',
      solution: py`import json

raw = '{"name": "Ana", "score": 92}'
player = json.loads(raw)
print(player["name"])`,
      tests: [
        ['player is a dict with the parsed data', py`player == {"name": "Ana", "score": 92}`],
        ['Prints the name', py`_cq_stdout.strip() == "Ana"`],
      ],
    }),
    task('medium', 'Pretty-print settings', {
      prompt:
        'Make a readable JSON string from `config`: indent it by 2 spaces and sort the keys alphabetically. Store it in `pretty` and print it.',
      starter: py`import json

config = {"theme": "dark", "font_size": 14, "autosave": True}
pretty = json.dumps(config, ___)
print(pretty)`,
      hint: '`json.dumps` accepts `indent=2` and `sort_keys=True`.',
      solution: py`import json

config = {"theme": "dark", "font_size": 14, "autosave": True}
pretty = json.dumps(config, indent=2, sort_keys=True)
print(pretty)`,
      tests: [
        ['Indented by 2 spaces', py`'\n  "autosave": true' in pretty`],
        ['Keys are sorted', py`pretty.index("autosave") < pretty.index("font_size") < pretty.index("theme")`],
        ['Printed', py`_cq_stdout.strip() == pretty.strip()`],
      ],
    }),
    task('medium', 'Round trip', {
      prompt:
        'Convert the list `scores` to a JSON string `text`, then convert `text` back into a Python list called `back`.',
      starter: py`import json

scores = [88, 92, 79]
text = ___
back = ___`,
      hint: '`dumps` goes Python → text, `loads` goes text → Python.',
      solution: py`import json

scores = [88, 92, 79]
text = json.dumps(scores)
back = json.loads(text)`,
      tests: [
        ['text is JSON', py`text == "[88, 92, 79]"`],
        ['back equals scores', py`back == [88, 92, 79]`],
        ['back is a new list, not the same object', py`back is not scores`],
      ],
    }),
    task('hard', 'Dig into nested JSON', {
      prompt:
        'Parse the order in `raw`. Set `email` to the customer\'s email and `total_qty` to the sum of `qty` over all items.',
      starter: py`import json

raw = '''
{"id": 7,
 "customer": {"name": "Lee", "email": "lee@example.com"},
 "items": [{"sku": "A1", "qty": 2}, {"sku": "B4", "qty": 1}, {"sku": "C9", "qty": 5}]}
'''
order = json.loads(raw)
email = ___
total_qty = ___`,
      hint: 'Chain keys for nested dicts (`order["customer"]["email"]`), and use `sum(...)` over the items list.',
      solution: py`import json

raw = '''
{"id": 7,
 "customer": {"name": "Lee", "email": "lee@example.com"},
 "items": [{"sku": "A1", "qty": 2}, {"sku": "B4", "qty": 1}, {"sku": "C9", "qty": 5}]}
'''
order = json.loads(raw)
email = order["customer"]["email"]
total_qty = sum(item["qty"] for item in order["items"])`,
      tests: [
        ['email is correct', py`email == "lee@example.com"`],
        ['total_qty adds up every item', py`total_qty == 8`],
      ],
    }),
    task('hard', 'Survive bad JSON', {
      prompt:
        'Write `safe_parse(text)`. It returns the parsed value, or `None` if `text` is not valid JSON (catch `json.JSONDecodeError`).',
      starter: py`import json

def safe_parse(text):
    ___`,
      hint: 'Wrap `json.loads(text)` in `try:` and return `None` in `except json.JSONDecodeError:`.',
      solution: py`import json

def safe_parse(text):
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return None`,
      tests: [
        ['Parses an object', py`safe_parse('{"a": 1}') == {"a": 1}`],
        ['Parses a list', py`safe_parse("[1, 2]") == [1, 2]`],
        ['Returns None for broken JSON', py`safe_parse("{bad}") is None`],
        ['Returns None for an empty string', py`safe_parse("") is None`],
      ],
    }),
    task('expert', 'Keep accents readable', {
      prompt:
        'By default `json.dumps` escapes non-ASCII letters (`ü` becomes `\\u00fc`). Dump `place` so the accents stay as they are. Store it in `text`.',
      starter: py`import json

place = {"city": "Zürich", "café": "Grüezi"}
text = json.dumps(place)`,
      hint: 'Pass `ensure_ascii=False` to `json.dumps`.',
      solution: py`import json

place = {"city": "Zürich", "café": "Grüezi"}
text = json.dumps(place, ensure_ascii=False)`,
      tests: [
        ['Accents kept', py`"Zürich" in text and "café" in text`],
        ['No \\u escapes', py`"\\u" not in text`],
        ['Still valid JSON', py`__import__('json').loads(text) == {"city": "Zürich", "café": "Grüezi"}`],
      ],
    }),
    task('expert', 'Dates in JSON', {
      prompt:
        'JSON has no date type, so `json.dumps` fails on a `date`. Write `to_json(event)` that dumps the dict, turning any `date` into an ISO string like `"2026-10-16"`. Use the `default=` argument.',
      starter: py`import json
from datetime import date

def to_json(event):
    ___

print(to_json({"name": "Launch", "on": date(2026, 10, 16)}))`,
      hint: '`default` is a function called for objects JSON can\'t handle. Return `obj.isoformat()` for dates and raise `TypeError` otherwise.',
      solution: py`import json
from datetime import date

def encode(obj):
    if isinstance(obj, date):
        return obj.isoformat()
    raise TypeError(f"Can't serialize {type(obj).__name__}")

def to_json(event):
    return json.dumps(event, default=encode)

print(to_json({"name": "Launch", "on": date(2026, 10, 16)}))`,
      tests: [
        ['Date becomes an ISO string', py`to_json({"name": "Launch", "on": __import__('datetime').date(2026, 10, 16)}) == '{"name": "Launch", "on": "2026-10-16"}'`],
        ['Works for other dates too', py`'"1999-01-31"' in to_json({"d": __import__('datetime').date(1999, 1, 31)})`],
        ['Plain dicts still work', py`to_json({"a": 1}) == '{"a": 1}'`],
      ],
    }),
    task('expert', 'Filter records from an API', {
      prompt:
        '`raw` is a JSON list of users from an API. Build `active_names`: the names of active users, sorted alphabetically.',
      starter: py`import json

raw = '[{"name": "Zoe", "active": true}, {"name": "Ben", "active": false}, {"name": "Amir", "active": true}, {"name": "Kai", "active": true}]'
users = json.loads(raw)
active_names = ___`,
      hint: 'JSON `true` becomes Python `True`. Use a list comprehension with `if user["active"]`, then `sorted(...)`.',
      solution: py`import json

raw = '[{"name": "Zoe", "active": true}, {"name": "Ben", "active": false}, {"name": "Amir", "active": true}, {"name": "Kai", "active": true}]'
users = json.loads(raw)
active_names = sorted(user["name"] for user in users if user["active"])`,
      tests: [['Active users only, sorted', py`active_names == ["Amir", "Kai", "Zoe"]`]],
    }),
    task('expert', 'Merge settings', {
      prompt:
        'Write `merge_settings(defaults_json, user_json)`. Parse both JSON strings and return a dict where the user\'s values win. The nested `"colors"` dict must be merged too, not replaced.',
      starter: py`import json

def merge_settings(defaults_json, user_json):
    ___`,
      hint: 'Start from `{**defaults, **user}`, then set `colors` to `{**defaults["colors"], **user.get("colors", {})}`.',
      solution: py`import json

def merge_settings(defaults_json, user_json):
    defaults = json.loads(defaults_json)
    user = json.loads(user_json)
    merged = {**defaults, **user}
    merged["colors"] = {**defaults.get("colors", {}), **user.get("colors", {})}
    return merged`,
      setup: py`DEFAULTS = '{"theme": "light", "size": 12, "colors": {"bg": "white", "fg": "black"}}'`,
      tests: [
        ['User values win', py`merge_settings(DEFAULTS, '{"size": 16}')["size"] == 16`],
        ['Missing user values keep defaults', py`merge_settings(DEFAULTS, '{"size": 16}')["theme"] == "light"`],
        ['Nested colors are merged', py`merge_settings(DEFAULTS, '{"colors": {"bg": "navy"}}')["colors"] == {"bg": "navy", "fg": "black"}`],
      ],
    }),
  ],
  questions: [
    mc('What type does `json.dumps(...)` return?', ['dict', 'str', 'bytes', 'A file object'], 1),
    qShort('Which `json` function turns a JSON string into Python objects? (name only)', 'loads'),
    mc('Python `None` becomes what in JSON?', ['"None"', 'nil', 'null', 'An empty string'], 2),
    mc('In a JSON object, keys must be…', ['Strings', 'Any hashable value', 'Numbers', 'Unique per file'], 0),
    mc('What does `json.dumps({1: "a"})` produce?', ['An error', '{1: "a"}', '[1, "a"]', '{"1": "a"}'], 3),
    qShort('Which exception does `json.loads` raise for invalid text? (class name)', 'JSONDecodeError'),
    mc('What does `indent=2` do in `json.dumps`?', ['Limits nesting to 2 levels', 'Pretty-prints with 2 spaces per level', 'Sorts keys', 'Compresses the output'], 1),
    mc('How is `json.dump` (no s) different from `json.dumps`?', ['It writes to an open file', 'It returns bytes', 'It is faster', 'There is no difference'], 0),
    mc('The tuple `(1, 2)` comes back from a JSON round trip as…', ['(1, 2)', 'An error', '[1, 2]', '{"0": 1, "1": 2}'], 2),
    mc('Why does `json.dumps` fail on a `datetime`?', ['JSON has no date type', 'Dates are too large', 'It needs `indent=`', 'Datetimes are mutable'], 0),
  ],
})
