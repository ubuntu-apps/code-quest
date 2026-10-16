import { makeTopic, mc, py, qShort, task } from '../_builders.mjs'

const RAISES = py`def error_of(fn):
    try:
        fn()
    except Exception as err:
        return type(err).__name__, str(err)
    return None`

export default makeTopic({
  id: 'data_validation',
  title: 'Data validation',
  paragraphs: [
    'Validate shape, types, ranges before processing. Fail early with clear messages.',
    'Use schemas (pydantic, jsonschema) for complex payloads.',
    'Sanitize strings, bound numbers, check required fields.',
  ],
  sandboxCode: py`def validate_user(data):
    if "name" not in data or not isinstance(data["name"], str):
        raise ValueError("name required string")
    if "age" in data and (not isinstance(data["age"], int) or data["age"] < 0):
        raise ValueError("age must be non-negative int")
    return data

print(validate_user({"name": "Ana", "age": 30}))`,
  challenges: [
    task('easy', 'Required fields', {
      prompt: 'Write `missing_fields(record, required)` that returns the names in `required` that are not keys of `record`, in the same order.',
      starter: py`def missing_fields(record, required):
    ___`,
      hint: '`[name for name in required if name not in record]`.',
      solution: py`def missing_fields(record, required):
    return [name for name in required if name not in record]`,
      tests: [
        ['Nothing missing', py`missing_fields({"name": "Ana", "email": "a@x.io"}, ["name", "email"]) == []`],
        ['Some missing, in order', py`missing_fields({"email": "a@x.io"}, ["name", "email", "age"]) == ["name", "age"]`],
      ],
    }),
    task('easy', 'Check type and range', {
      prompt:
        'Write `is_valid_age(value)`: `True` only for an `int` from 0 to 150. Watch out: `True` and `False` are ints in Python, but they are not ages.',
      starter: py`def is_valid_age(value):
    ___`,
      hint: 'Check `isinstance(value, int) and not isinstance(value, bool)`, then `0 <= value <= 150`.',
      solution: py`def is_valid_age(value):
    return isinstance(value, int) and not isinstance(value, bool) and 0 <= value <= 150`,
      tests: [
        ['Normal ages', py`is_valid_age(0) and is_valid_age(42) and is_valid_age(150)`],
        ['Out of range', py`not is_valid_age(-1) and not is_valid_age(151)`],
        ['Wrong types', py`not is_valid_age("42") and not is_valid_age(42.0)`],
        ['Booleans are rejected', py`not is_valid_age(True)`],
      ],
    }),
    task('medium', 'Simple email check', {
      prompt:
        'Write `looks_like_email(text)` using a regular expression: some characters without spaces or `@`, then `@`, then a domain that contains a dot.',
      starter: py`import re

def looks_like_email(text):
    ___`,
      hint: '`re.fullmatch(r"[^@\\s]+@[^@\\s]+\\.[^@\\s]+", text) is not None`.',
      solution: py`import re

def looks_like_email(text):
    return re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", text) is not None`,
      tests: [
        ['Accepts normal addresses', py`looks_like_email("ana@example.com") and looks_like_email("a.b+tag@mail.co.uk")`],
        ['Rejects missing parts', py`not looks_like_email("ana@") and not looks_like_email("@example.com") and not looks_like_email("ana@example")`],
        ['Rejects spaces and two @', py`not looks_like_email("an a@example.com") and not looks_like_email("a@b@c.com")`],
      ],
    }),
    task('medium', 'Collect every error', {
      prompt:
        'Write `validate_user(data)` that returns a list of error messages instead of stopping at the first one. Use exactly: `"name is required"` (missing or blank) and `"age must be a non-negative integer"`.',
      starter: py`def validate_user(data):
    errors = []
    ___
    return errors`,
      hint: 'Check `name` with `str(data.get("name", "")).strip()`; for `age`, check `isinstance(age, int) and age >= 0`.',
      solution: py`def validate_user(data):
    errors = []
    if not str(data.get("name", "")).strip():
        errors.append("name is required")
    age = data.get("age")
    if not isinstance(age, int) or isinstance(age, bool) or age < 0:
        errors.append("age must be a non-negative integer")
    return errors`,
      tests: [
        ['Valid user has no errors', py`validate_user({"name": "Ana", "age": 30}) == []`],
        ['Reports both problems', py`validate_user({"name": "  ", "age": -1}) == ["name is required", "age must be a non-negative integer"]`],
        ['Missing age', py`validate_user({"name": "Ana"}) == ["age must be a non-negative integer"]`],
      ],
    }),
    task('hard', 'Fail with a clear message', {
      prompt:
        'Write `parse_age(text)` that returns the age as an int. For anything that isn\'t a whole number from 0 to 150, raise `ValueError` with the message `invalid age: <text>` (use `repr`, e.g. `invalid age: \'abc\'`).',
      starter: py`def parse_age(text):
    ___`,
      hint: 'Wrap `int(text)` in `try`; in `except ValueError`, or when out of range, `raise ValueError(f"invalid age: {text!r}")`.',
      solution: py`def parse_age(text):
    try:
        age = int(text)
    except ValueError:
        raise ValueError(f"invalid age: {text!r}") from None
    if not 0 <= age <= 150:
        raise ValueError(f"invalid age: {text!r}")
    return age`,
      setup: RAISES,
      tests: [
        ['Parses good input', py`parse_age("42") == 42 and parse_age(" 7 ") == 7`],
        ['Not a number', py`error_of(lambda: parse_age("abc")) == ("ValueError", "invalid age: 'abc'")`],
        ['Out of range', py`error_of(lambda: parse_age("200")) == ("ValueError", "invalid age: '200'")`],
      ],
    }),
    task('hard', 'Clean form input', {
      prompt:
        'Web forms send everything as text. Write `clean_form(form)` that returns a new dict: strip spaces from `name`, convert `age` to an int, and turn `newsletter` (`"yes"`/`"no"`, any case) into `True`/`False`.',
      starter: py`def clean_form(form):
    ___`,
      hint: 'Build `{"name": form["name"].strip(), "age": int(form["age"]), "newsletter": form["newsletter"].strip().lower() == "yes"}`.',
      solution: py`def clean_form(form):
    return {
        "name": form["name"].strip(),
        "age": int(form["age"]),
        "newsletter": form["newsletter"].strip().lower() == "yes",
    }`,
      tests: [
        ['Cleans values', py`clean_form({"name": "  Ana ", "age": "30", "newsletter": "YES"}) == {"name": "Ana", "age": 30, "newsletter": True}`],
        ['"no" becomes False', py`clean_form({"name": "Ben", "age": "5", "newsletter": "no"})["newsletter"] is False`],
        ['Doesn\'t change the original', py`(lambda f: (clean_form(f), f)[1])({"name": " Cy ", "age": "1", "newsletter": "no"}) == {"name": " Cy ", "age": "1", "newsletter": "no"}`],
      ],
    }),
    task('expert', 'A tiny schema checker', {
      prompt:
        'Write `check(data, schema)`. `schema` maps each field to its required type, like `{"name": str, "age": int}`. Return a list of errors: `"<field>: missing"` or `"<field>: expected <type name>"`, in schema order.',
      starter: py`def check(data, schema):
    ___`,
      hint: 'Loop over `schema.items()`. Use `type_.__name__` for the type name in messages.',
      solution: py`def check(data, schema):
    errors = []
    for field, type_ in schema.items():
        if field not in data:
            errors.append(f"{field}: missing")
        elif not isinstance(data[field], type_):
            errors.append(f"{field}: expected {type_.__name__}")
    return errors`,
      setup: py`SCHEMA = {"name": str, "age": int, "tags": list}`,
      tests: [
        ['Valid data', py`check({"name": "Ana", "age": 3, "tags": []}, SCHEMA) == []`],
        ['Missing and wrong types', py`check({"name": 5, "tags": "x"}, SCHEMA) == ["name: expected str", "age: missing", "tags: expected list"]`],
      ],
    }),
    task('expert', 'Ranges and allowed values', {
      prompt:
        'Write `validate_order(order)` returning a list of errors. `qty` must be an int from 1 to 100 (`"qty must be 1-100"`), and `size` must be one of `S`, `M`, `L` (`"size must be S, M or L"`).',
      starter: py`ALLOWED_SIZES = {"S", "M", "L"}

def validate_order(order):
    ___`,
      hint: 'Check `isinstance(qty, int) and 1 <= qty <= 100`, and `order.get("size") in ALLOWED_SIZES`.',
      solution: py`ALLOWED_SIZES = {"S", "M", "L"}

def validate_order(order):
    errors = []
    qty = order.get("qty")
    if not isinstance(qty, int) or not 1 <= qty <= 100:
        errors.append("qty must be 1-100")
    if order.get("size") not in ALLOWED_SIZES:
        errors.append("size must be S, M or L")
    return errors`,
      tests: [
        ['Valid order', py`validate_order({"qty": 2, "size": "M"}) == []`],
        ['Bad quantity', py`validate_order({"qty": 0, "size": "S"}) == ["qty must be 1-100"]`],
        ['Bad size', py`validate_order({"qty": 5, "size": "XL"}) == ["size must be S, M or L"]`],
        ['Both wrong', py`len(validate_order({"qty": "5"})) == 2`],
      ],
    }),
    task('expert', 'Validate a whole batch', {
      prompt:
        'Write `split_valid(rows)`. Each row needs a non-blank `name` and a numeric `score` from 0 to 100. Return `(valid, errors)`: the valid rows, and `(index, message)` pairs for the rest. Use `"bad name"` or `"bad score"` as the message, checking name first.',
      starter: py`def split_valid(rows):
    valid, errors = [], []
    ___
    return valid, errors`,
      hint: 'Loop with `enumerate(rows)`. A score is numeric if it is an int or float but not a bool.',
      solution: py`def split_valid(rows):
    valid, errors = [], []
    for i, row in enumerate(rows):
        score = row.get("score")
        if not str(row.get("name", "")).strip():
            errors.append((i, "bad name"))
        elif isinstance(score, bool) or not isinstance(score, (int, float)) or not 0 <= score <= 100:
            errors.append((i, "bad score"))
        else:
            valid.append(row)
    return valid, errors`,
      setup: py`ROWS = [{"name": "Ana", "score": 91}, {"name": "", "score": 50}, {"name": "Cy", "score": 140}, {"name": "Dee", "score": 72.5}, {"name": "Eli", "score": "80"}]`,
      tests: [
        ['Valid rows kept', py`split_valid(ROWS)[0] == [{"name": "Ana", "score": 91}, {"name": "Dee", "score": 72.5}]`],
        ['Errors reported by index', py`split_valid(ROWS)[1] == [(1, "bad name"), (2, "bad score"), (4, "bad score")]`],
      ],
    }),
    task('expert', 'Validate in a dataclass', {
      prompt:
        'Make `User` a dataclass with `name: str` and `age: int`. In `__post_init__`, raise `ValueError` if `name` is blank or `age` is negative, so an invalid `User` can never exist.',
      starter: py`from dataclasses import dataclass

@dataclass
class User:
    name: str
    age: int

    def __post_init__(self):
        ___`,
      hint: '`__post_init__` runs right after the generated `__init__`. Check `self.name.strip()` and `self.age < 0`.',
      solution: py`from dataclasses import dataclass

@dataclass
class User:
    name: str
    age: int

    def __post_init__(self):
        if not self.name.strip():
            raise ValueError("name must not be blank")
        if self.age < 0:
            raise ValueError("age must not be negative")`,
      setup: RAISES,
      tests: [
        ['Valid users work', py`User("Ana", 30).age == 30`],
        ['Blank name rejected', py`error_of(lambda: User("  ", 30))[0] == "ValueError"`],
        ['Negative age rejected', py`error_of(lambda: User("Ana", -1))[0] == "ValueError"`],
      ],
    }),
  ],
  questions: [
    mc('When should you validate input?', ['After saving it', 'Only in tests', 'As soon as it enters your program', 'Never; trust the client'], 2),
    mc('Why is `isinstance(True, int)` a trap when checking numbers?', ['It raises an error', 'bool is a subclass of int, so it returns True', 'It is slow', 'It returns False'], 1),
    qShort('Which exception is the usual choice for a value with the right type but a bad value? (class name)', 'ValueError'),
    mc('What is the advantage of collecting all errors instead of stopping at the first?', ['The user can fix everything in one go', 'It is faster', 'It uses less memory', 'Errors become warnings'], 0),
    mc('Why convert form values like `"30"` explicitly?', ['Forms send numbers as ints', 'Python converts them automatically', 'It removes spaces', 'Everything from a form arrives as text'], 3),
    mc('What does `re.fullmatch` check?', ['That the whole string matches the pattern', 'That the pattern appears anywhere', 'Only the first character', 'The string length'], 0),
    qShort('Which dataclass method runs right after `__init__`, useful for validation? (name only)', '__post_init__'),
    mc('Which library is widely used to validate data with type-annotated models?', ['requests', 'pydantic', 'pathlib', 'csv'], 1),
    mc('A good validation error message…', ['Shows a stack trace', 'Says only "invalid"', 'Names the field and what was expected', 'Is logged but never shown'], 2),
    mc('`raise ValueError(...) from None` does what?', ['Hides the original exception from the traceback', 'Returns None', 'Catches the error', 'Converts it to a warning'], 0),
  ],
})
