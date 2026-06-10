/** Expert validation fixes for projects.mjs and functions.mjs (partial). */

export const projectFixes = {
  'max attempts': "pyVar('lost','lost == True','secret = 7\\nmax_attempts = 3\\nattempts = 0\\nguesses = [1, 2, 3]\\nlost = False')",
  'play again': "pyVar('games','games == 2','games = 0\\nplay_again = \"y\"')",
  'atomic save': "includes('os.replace')",
  'guarantee symbol': "pyVar('has_sym','has_sym == True','import string\\nsymbols = \"!@#$\"\\nchars = string.ascii_letters + string.digits + symbols\\npwd = \"abcdef12\"\\nhas_sym = any(c in symbols for c in pwd)')",
  'exclude ambiguous': "pyVar('clean','clean == True','ambiguous = set(\"0O1l\")\\ncharset = \"abc0O1l\"\\nclean = False')",
  'strength check': "pyVar('strong','strong == True','def strength(pwd):\\n    score = 0\\n    if len(pwd) >= 8:\\n        score += 1\\n    if any(c.isupper() for c in pwd):\\n        score += 1\\n    if any(c.isdigit() for c in pwd):\\n        score += 1\\n    return score >= 3\\nstrong = strength(\"weak\")')",
  'chain conversion': "pyVar('mi','round(mi, 2) == 6.21','km = 10\\nm = 0\\nmi = 0')",
  'menu units': "pyVar('label','label == \"km-mi\"','menu = {\"1\": \"km-mi\", \"2\": \"c-f\", \"3\": \"kg-lb\"}\\nchoice = \"1\"\\nlabel = \"\"')",
  'export csv': "pyVar('csv_text','\"Ana\" in csv_text and \"555\" in csv_text','import csv\\nimport io\\ncontacts = [{\"name\": \"Ana\", \"phone\": \"555\"}]\\nbuf = io.StringIO()\\ncsv_text = \"\"')",
  'feedback per q': "pyVar('msg','msg == \"Correct\"','questions = [{\"q\": \"2+2?\", \"choices\": [\"3\", \"4\"], \"a\": 1}]\\nanswer = 1\\nmsg = \"\"')",
  'retry wrong': "pyVar('attempts','attempts == 2','correct = 1\\nanswer = 0\\nmax_tries = 3\\nattempts = 0')",
  'high score file': "pyVar('high','high == 85','import json\\nscore = 85\\nhigh = 0\\ndata = {}')",
  'top category': "pyVar('top','top == \"food\"','expenses = [{\"category\": \"food\", \"amount\": 30}, {\"category\": \"bus\", \"amount\": 10}, {\"category\": \"food\", \"amount\": 20}]\\ntotals = {}\\ntop = \"\"')",
  'budget alert': "pyVar('alert','alert == True','budget = 100\\ntotal = 120\\nalert = False')",
  'handle relative urls': "pyVar('absolute','absolute == \"https://example.com/other\"','from urllib.parse import urljoin\\nbase = \"https://example.com/path/\"\\nrelative = \"/other\"\\nabsolute = \"\"')",
  'csv export links': "pyVar('rows','rows == 3','import csv\\nimport io\\nlinks = [\"/a\", \"/b\"]\\nbuf = io.StringIO()\\nrows = 0')",
  'validate response': "pyVar('valid','valid == True','data = {\"city\": \"London\", \"temp_c\": 18}\\nrequired = [\"city\", \"temp_c\", \"conditions\"]\\nvalid = False')",
  'retry fetch': "pyVar('attempts','attempts == 2','max_retries = 3\\nattempts = 0\\nsuccess = False')",
  'compare cities': "pyVar('warmer','warmer == \"London\"','cities = {\"London\": {\"temp_c\": 20}, \"Paris\": {\"temp_c\": 15}}\\nwarmer = \"\"')",
  'mvp scope': "pyVar('ready','ready == True','mvp = [\"data model\", \"core functions\", \"CLI\"]\\nextras = [\"analytics\", \"themes\"]\\nready = False')",
  'error handling plan': "includes('try','except')",
  'refactor pass': "pyVar('funcs','funcs >= 2','funcs = 0')",
}

export const functionsFixes = {
  'error order': "pyVar('illegal','illegal == True','def f(a, b):\\n    return a + b\\nillegal = False')",
}
