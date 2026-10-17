import { snippet } from './_builders.mjs'

/** @type {Record<string, { id: string, label: string, code: string }[]>} */
export const SANDBOX_SNIPPETS_BY_LEVEL = {
  // ── Capstone projects ───────────────────────────────────
  cli_guess_game: [
    snippet('randint', 'import random\nprint(random.randint(1, 10))'),
    snippet('while guess', 'secret = 7\nguess = 0\nwhile guess != secret:\n    guess = 7\nprint("win")'),
    snippet('Higher/Lower', 'g, s = 3, 5\nif g < s:\n    print("Higher")\nelif g > s:\n    print("Lower")'),
    snippet('main guard', 'def main():\n    print("play")\n\nif __name__ == "__main__":\n    main()'),
    snippet('try int input', 'try:\n    n = int("5")\nexcept ValueError:\n    n = 0\nprint(n)'),
  ],
  todo_list: [
    snippet('List of dicts', 'todos = [{"id": 1, "text": "Learn Python", "done": False}]\nprint(todos)'),
    snippet('add task', 'todos = []\ntodos.append({"id": 1, "text": "Build", "done": False})\nprint(todos)'),
    snippet('List tasks', 'todos = [{"text": "a", "done": False}, {"text": "b", "done": True}]\nfor t in todos:\n    mark = "x" if t["done"] else " "\n    print(f"[{mark}] {t[\'text\']}")'),
    snippet('json save', 'import json\ntodos = [{"text": "a"}]\nprint(json.dumps(todos))'),
    snippet('Filter done', 'todos = [{"done": True}, {"done": False}]\nopen_tasks = [t for t in todos if not t["done"]]\nprint(len(open_tasks))'),
  ],
  password_generator: [
    snippet('random.choice', 'import random\nimport string\nprint(random.choice(string.ascii_letters))'),
    snippet('Join password', 'import random\nimport string\nchars = string.ascii_letters + string.digits\nprint("".join(random.choice(chars) for _ in range(8)))'),
    snippet('generate fn', 'import random\nimport string\n\ndef generate_password(n=12):\n    chars = string.ascii_letters + string.digits\n    return "".join(random.choice(chars) for _ in range(n))\nprint(generate_password(8))'),
    snippet('secrets', 'import secrets\nprint(secrets.choice("abc"))'),
  ],
  unit_converter: [
    snippet('km to miles', 'KM_TO_MI = 0.621371\nprint(10 * KM_TO_MI)'),
    snippet('C to F', 'def c_to_f(c):\n    return c * 9/5 + 32\nprint(c_to_f(0))'),
    snippet('Conversion dict', 'factors = {"km": 1000, "m": 1}\nprint(factors["km"])'),
    snippet('Convert fn', 'def km_to_miles(km):\n    return km * 0.621371\nprint(km_to_miles(10))'),
  ],
  contact_book: [
    snippet('Dict storage', 'contacts = {}\ncontacts["ana"] = {"phone": "555"}\nprint(contacts)'),
    snippet('add contact', 'contacts = {}\ndef add(name, phone):\n    contacts[name.lower()] = {"phone": phone}\nadd("Ana", "555")\nprint(contacts)'),
    snippet('get lookup', 'contacts = {"ana": {"phone": "555"}}\nprint(contacts.get("bob"))'),
    snippet('Search partial', 'contacts = {"ana": 1, "andrew": 2}\nprint([k for k in contacts if "an" in k])'),
  ],
  quiz_app: [
    snippet('Question dict', 'questions = [{"q": "2+2?", "choices": ["3", "4"], "a": 1}]\nprint(questions[0]["choices"])'),
    snippet('Grade answers', 'questions = [{"a": 1}, {"a": 0}]\nanswers = [1, 0]\nscore = sum(1 for i, a in enumerate(answers) if a == questions[i]["a"])\nprint(score)'),
    snippet('Percent', 'print(int(3 / 4 * 100))'),
    snippet('shuffle', 'import random\nlst = [1, 2, 3]\nrandom.shuffle(lst)\nprint(lst)'),
  ],
  expense_tracker: [
    snippet('Add expense', 'expenses = []\nexpenses.append({"amount": 12.5, "category": "food"})\nprint(expenses)'),
    snippet('Sum amounts', 'expenses = [{"amount": 10}, {"amount": 5}]\nprint(sum(e["amount"] for e in expenses))'),
    snippet('Filter category', 'expenses = [{"category": "food", "amount": 1}, {"category": "bus", "amount": 2}]\nprint([e for e in expenses if e["category"] == "food"])'),
    snippet('strftime date', 'from datetime import datetime\nprint(datetime.now().strftime("%Y-%m-%d"))'),
    snippet('Group totals', 'totals = {}\nfor e in [{"category": "food", "amount": 10}, {"category": "food", "amount": 5}]:\n    totals[e["category"]] = totals.get(e["category"], 0) + e["amount"]\nprint(totals)'),
  ],
  web_scraper_basics: [
    snippet('Split parse', 'html = \'<a href="/page">Link</a>\'\nparts = html.split("<a href=")\nprint(len(parts))'),
    snippet('Extract href', 'part = \'"/page">Link\'\nurl = part.split(">")[0].strip(\'"\')\nprint(url)'),
    snippet('Build links', 'links = []\nlinks.append("/page")\nprint(links)'),
    snippet('urlopen', 'from urllib.request import urlopen\nprint("fetch ready")'),
    snippet('sleep rate limit', 'import time\ntime.sleep(0)\nprint("rate limit")'),
  ],
  weather_cli: [
    snippet('Mock API', 'API_SAMPLE = {"city": "London", "temp_c": 18, "conditions": "Cloudy"}\nprint(API_SAMPLE)'),
    snippet('Format report', 'data = {"city": "London", "temp_c": 18, "conditions": "Cloudy", "humidity": 72}\nprint(f"{data[\'city\']}: {data[\'temp_c\']}C, {data[\'conditions\']}")'),
    snippet('get nested', 'data = {}\nprint(data.get("wind", "Unknown"))'),
    snippet('json cache', 'import json\ndata = {"city": "London", "temp_c": 18}\nprint(json.dumps(data))'),
    snippet('argparse', 'import argparse\np = argparse.ArgumentParser()\np.add_argument("--city", default="Paris")\nprint(p.parse_args([]).city)'),
  ],
  capstone_planning: [
    snippet('Score fn', 'def project_score(features_done, tests_done):\n    return features_done * 10 + tests_done * 15\nprint(project_score(4, 2))'),
    snippet('main guard', 'def main():\n    print("Capstone ready")\n\nif __name__ == "__main__":\n    main()'),
    snippet('Module list', 'modules = ["models", "cli", "utils"]\nprint("cli" in modules)'),
    snippet('try/except plan', 'try:\n    int("42")\nexcept ValueError:\n    print("handle bad input")'),
    snippet('README sections', 'sections = ["Install", "Usage", "License"]\nprint(len(sections))'),
  ],
}

export function sandboxSnippetsFor(levelId) {
  return SANDBOX_SNIPPETS_BY_LEVEL[levelId]
}
