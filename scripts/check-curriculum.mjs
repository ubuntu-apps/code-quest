/**
 * Checks lesson content by running it, the same way the app does.
 *
 * For every Python challenge graded by tests it runs three versions of the
 * learner's code through the app's own worker helpers (public/pyodide-worker.js):
 *   - the solution        → must pass every test
 *   - the starter code    → must NOT pass (otherwise the challenge is pre-solved)
 *   - empty code          → must NOT pass (otherwise setup code gives the answer away)
 *   - "typed in"          → the starter code plus the solution's final values typed in as
 *                           fixed values (and its output printed as fixed text); must NOT
 *                           pass, or the checks don't make the learner work anything out.
 *                           Fixed by checks that rerun the code with other starting values
 *                           (`_cq_rerun`, see data/variations.mjs in python-curriculum).
 * It also flags missing prompts, hints and solutions, text-matched Python
 * challenges, and malformed quiz questions.
 *
 * SQL challenges (`sql_tests`) run on SQLite through the same helpers: the solution must
 * pass; the starter code, empty code and the solution's result typed in as fixed values
 * (SELECT 'Dune' ... UNION ALL ...) must not. The solution must return rows on the lesson's
 * data and a different result on the other rows (altSetupSql), or the checks can't tell a
 * real query from a typed-in one. Lesson sandbox code, samples and "Try it" blocks must run,
 * except samples that show an error on purpose (they start with "-- This gives an error").
 *
 * Quiz answers: a multiple-choice question that asks what some Python or SQL gives ("What does
 * `len("hi")` give?", "After `x = [1]`, what is `x * 2`?") is run, and the answer marked correct
 * must be what it really gives. Questions whose result matches none of the choices can't be
 * checked this way and are left alone. Python "Try it" blocks (which load on their own) must run,
 * except ones that show an error on purpose (a comment that mentions the error).
 *
 * Sections listed in scripts/curriculum-check.json ("strictSections") must be
 * clean or the script exits with code 1. Other sections are reported only.
 *
 * Usage: node scripts/check-curriculum.mjs [--all-strict] [--section python/data_and_apis] [--verbose]
 * Needs Python 3 on PATH (python3 or python), or set CQ_PYTHON. pandas is needed for pandas lessons.
 */
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const contentDir = join(root, 'public', 'content')
const args = process.argv.slice(2)
const allStrict = args.includes('--all-strict')
const verbose = args.includes('--verbose')
const onlySection = args.includes('--section') ? args[args.indexOf('--section') + 1] : null
const config = JSON.parse(readFileSync(join(root, 'scripts', 'curriculum-check.json'), 'utf8'))
const strictSections = new Set(config.strictSections ?? [])
// Challenges where typing a fixed value in is the whole task (e.g. "make a variable").
const typedAllowed = new Set(config.typedAllowed ?? [])

const RULES = {
  'empty-prompt': 'Challenge has no instructions',
  'no-hint': 'Challenge has no hint',
  'no-solution': 'Challenge has no solution',
  'no-tests': 'Challenge has no tests',
  'solution-fails': 'Solution does not pass its own tests',
  'starter-passes': 'Starter code already passes (pre-solved)',
  'empty-passes': 'Empty code passes (setup gives the answer away)',
  'typed-passes': 'Typing the answer in as fixed values passes (no check tries other values)',
  'text-matched': 'Python challenge graded by text matching instead of tests',
  'bad-quiz': 'Quiz question is malformed',
  'quiz-pattern': 'Every multiple-choice answer in this quiz is in the same position',
  'empty-result': 'Solution returns no rows on the lesson data (nothing to compare)',
  'alt-same': 'Solution gives the same result on the other rows, so a typed-in answer could pass',
  'sandbox-error': 'Lesson SQL (sandbox, sample or "Try it" block) stops with an error',
  'quiz-wrong-answer': 'The quiz answer marked correct is not what the code gives (another choice is)',
  'python-try-error': 'A Python "Try it" block stops with an error',
  'order-ties': 'Rows that tie in the ORDER BY can come in either order, so a correct answer may fail the order check (add a tie-breaker)',
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

/** The exact Python helper code the app's worker runs (single source of truth). */
function workerPythonHelpers() {
  const src = readFileSync(join(root, 'public', 'pyodide-worker.js'), 'utf8')
  const match = src.match(/var PY_HELPERS = (\[[\s\S]*?\])\.join\('\\n'\)/)
  if (!match) throw new Error('Could not find PY_HELPERS in public/pyodide-worker.js')
  return new Function(`return ${match[1]}`)().join('\n')
}

const RUNNER = String.raw`
import json, os, sys, tempfile, signal
helpers = sys.argv[1]
exec(helpers, globals())
cases = json.load(sys.stdin)
# Lesson setup code may print; keep it out of the JSON result channel.
result_channel = sys.stdout
sys.stdout = open(os.devnull, "w")
has_alarm = hasattr(signal, "alarm")
class Timeout(Exception):
    pass
def on_alarm(signum, frame):
    raise Timeout()
if has_alarm:
    signal.signal(signal.SIGALRM, on_alarm)
home = os.getcwd()

def typed_variant(case):
    # The starter code, then every value the tests look at, typed in as the solution leaves
    # it, and the solution's output printed as fixed text: a learner who copied the answer.
    sol = case["variants"].get("solution")
    if not sol:
        return None
    names = set()
    for t in case["tests"]:
        try:
            tree = ast.parse(t["assertion"], mode="eval")
        except SyntaxError:
            continue
        names.update(n.id for n in ast.walk(tree) if isinstance(n, ast.Name))
    os.chdir(tempfile.mkdtemp(prefix="cq-typed-"))
    buf = io.StringIO()
    ns = _cq_fresh_ns("", buf)
    ns["_cq_source"] = sol
    old_out, old_err = sys.stdout, sys.stderr
    try:
        if has_alarm:
            signal.alarm(10)
        if case["setup"].strip():
            sys.stdout = sys.stderr = io.StringIO()
            exec(compile(case["setup"], "<setup>", "exec"), ns, ns)
        sys.stdout = sys.stderr = buf
        exec(compile(sol, "<solution>", "exec"), ns, ns)
    except BaseException:
        return None
    finally:
        if has_alarm:
            signal.alarm(0)
        sys.stdout, sys.stderr = old_out, old_err
        os.chdir(home)
    lines = []
    for name in sorted(names):
        if name.startswith("_") or name not in ns or hasattr(builtins, name):
            continue
        value = ns[name]
        try:
            if type(eval(repr(value))) is not type(value) or eval(repr(value)) != value:
                continue
        except Exception:
            continue
        lines.append(name + " = " + repr(value))
    if not lines:
        return None
    code = case["variants"].get("starter", "") + "\n" + "\n".join(lines) + "\n"
    if buf.getvalue():
        code += "print(" + repr(buf.getvalue()) + ", end='')\n"
    return code

results = []
for case in cases:
    out = {}
    variants = dict(case["variants"])
    typed = typed_variant(case)
    if typed is not None:
        variants["typed"] = typed
    for variant, code in variants.items():
        workdir = tempfile.mkdtemp(prefix="cq-check-")
        os.chdir(workdir)
        try:
            if has_alarm:
                signal.alarm(10)
            raw = json.loads(_cq_tests(code, case["setup"], json.dumps(case["tests"]), ""))
            tests = raw["tests"]
            passed = raw["error"] is None and len(tests) > 0 and all(t["passed"] for t in tests)
            detail = raw["error"].strip().splitlines()[-1] if raw["error"] else "; ".join(
                t["label"] + ": " + str(t.get("detail", "")) for t in tests if not t["passed"])
        except Timeout:
            passed, detail = False, "timed out"
        except BaseException as e:
            passed, detail = False, repr(e)
        finally:
            if has_alarm:
                signal.alarm(0)
            os.chdir(home)
        out[variant] = {"passed": passed, "detail": detail}
    results.append(out)
json.dump(results, result_channel)
`

const SQL_RUNNER = String.raw`
import json, sys
helpers = sys.argv[1]
exec(helpers, globals())
data = json.load(sys.stdin)

def lit(v):
    if v is None:
        return "NULL"
    if isinstance(v, str):
        return "'" + v.replace("'", "''") + "'"
    return repr(v)

def ident(name):
    return '"' + name.replace('"', '""') + '"'

def last_result(setup, sql):
    con = _cq_sql_db(setup)
    try:
        return _cq_sql_last_rows(_cq_sql_exec(con, sql))
    finally:
        con.close()

def typed_variant(case):
    # The solution's result typed in as fixed values: a learner who copied the answer table.
    try:
        res = last_result(case["setup"], case["solution"])
    except Exception:
        return None
    if res is None:
        return None
    cols, rows = res
    if not rows:
        return None
    first = "SELECT " + ", ".join(lit(v) + " AS " + ident(c) for v, c in zip(rows[0], cols))
    rest = ["SELECT " + ", ".join(lit(v) for v in r) for r in rows[1:]]
    return "\nUNION ALL\n".join([first] + rest) + ";"

results = []
for case in data["cases"]:
    out = {"variants": {}}
    variants = dict(case["variants"])
    typed = typed_variant(case)
    if typed is not None:
        variants["typed"] = typed
    for name, code in variants.items():
        try:
            raw = json.loads(_cq_sql_tests(code, case["setup"], case["alt"], case["solution"], case["ordered"], json.dumps(case["checks"])))
            tests = raw["tests"]
            err = raw.get("sqlError") or (raw["error"] and {"message": raw["error"].strip().splitlines()[-1]})
            passed = not err and len(tests) > 0 and all(t["passed"] for t in tests)
            detail = err["message"] if err else "; ".join(t["label"] + ": " + str(t.get("detail", "")) for t in tests if not t["passed"])
        except BaseException as e:
            passed, detail = False, repr(e)
        out["variants"][name] = {"passed": passed, "detail": detail}
    try:
        main = last_result(case["setup"], case["solution"])
        alt = last_result(case["alt"], case["solution"]) if case["alt"].strip() else None
        out["mainRows"] = None if main is None else len(main[1])
        out["altSame"] = main is not None and alt is not None and sorted(map(repr, main[1])) == sorted(map(repr, alt[1]))
        # Ties in the sort: add a random tie-breaker to the ORDER BY and run it a few times.
        out["ties"] = False
        if case["ordered"]:
            import re as _re
            sol = case["solution"]
            m = list(_re.finditer(r"\border\s+by\b", sol, _re.I))
            if m:
                start = m[-1].end()
                end_m = _re.search(r"\b(limit|offset)\b|;", sol[start:], _re.I)
                end = start + end_m.start() if end_m else len(sol)
                shuffled = sol[:end].rstrip() + ", random()" + (" " if end_m else "") + sol[end:]
                for setup in [case["setup"], case["alt"]]:
                    if not setup.strip():
                        continue
                    con = _cq_sql_db(setup)
                    try:
                        plain = _cq_sql_last_rows(_cq_sql_exec(con, sol))
                        for _ in range(8):
                            other = _cq_sql_last_rows(_cq_sql_exec(con, shuffled))
                            if plain and other and plain[1] != other[1]:
                                out["ties"] = True
                                break
                    finally:
                        con.close()
    except BaseException:
        out["mainRows"], out["altSame"] = None, False
    results.append(out)

runs = []
for run in data["runs"]:
    raw = json.loads(_cq_sql_run(run["sql"], run["setup"]))
    runs.append(raw["sqlError"]["message"] if raw.get("sqlError") else None)

json.dump({"cases": results, "runs": runs}, sys.stdout)
`

function findPython() {
  const candidates = [process.env.CQ_PYTHON, 'python3', 'python'].filter(Boolean)
  for (const cmd of candidates) {
    const r = spawnSync(cmd, ['--version'], { encoding: 'utf8' })
    if (r.status === 0) return cmd
  }
  throw new Error('Python 3 not found. Install it or set CQ_PYTHON.')
}

const QUIZ_RUNNER = String.raw`
import builtins, io, json, os, signal, sys, tempfile
helpers = sys.argv[1]
exec(helpers, globals())
data = json.load(sys.stdin)
result_channel = sys.stdout
class Timeout(Exception):
    pass
def on_alarm(signum, frame):
    raise Timeout()
has_alarm = hasattr(signal, "alarm")
if has_alarm:
    signal.signal(signal.SIGALRM, on_alarm)
home = os.getcwd()

def isolated(fn):
    # Fresh folder, no keyboard, output captured, and a time limit.
    buf = io.StringIO()
    old_out, old_err, old_input = sys.stdout, sys.stderr, builtins.input
    sys.stdout = sys.stderr = buf
    builtins.input = lambda *a: "1"
    os.chdir(tempfile.mkdtemp(prefix="cq-quiz-"))
    try:
        if has_alarm:
            signal.alarm(5)
        return fn(buf)
    finally:
        if has_alarm:
            signal.alarm(0)
        sys.stdout, sys.stderr, builtins.input = old_out, old_err, old_input
        os.chdir(home)

def py_values(prelude, expr):
    def run(buf):
        ns = {"__name__": "__main__"}
        if prelude:
            exec(compile(prelude, "<prelude>", "exec"), ns)
        start = len(buf.getvalue())
        try:
            code = compile(expr, "<question>", "eval")
        except SyntaxError:
            exec(compile(expr, "<question>", "exec"), ns)
            return [buf.getvalue()[start:].rstrip("\n")]
        value = eval(code, ns)
        printed = buf.getvalue()[start:].rstrip("\n")
        values = [repr(value), str(value)]
        return ([printed] if printed else []) + values
    try:
        return isolated(run)
    except BaseException:
        return None

def sql_values(setup, sql):
    try:
        con = _cq_sql_db(setup)
        try:
            res = _cq_sql_last_rows(_cq_sql_exec(con, sql))
        finally:
            con.close()
    except BaseException:
        return None
    if not res:
        return None
    cols, rows = res
    if len(rows) == 1 and len(cols) == 1:
        v = rows[0][0]
        return ["NULL" if v is None else str(v), repr(v), "'" + str(v) + "'"]
    return None

def try_block(code, folder):
    def run(buf):
        os.chdir(folder)
        exec(compile(code, "<try it>", "exec"), {"__name__": "__main__"})
        return None
    try:
        return isolated(run)
    except Timeout:
        return "timed out"
    except BaseException as e:
        return type(e).__name__ + ": " + str(e)[:160]

out = {"quiz": [], "tries": []}
for case in data["quiz"]:
    out["quiz"].append(py_values(case["prelude"], case["expr"]) if case["lang"] == "python" else sql_values(case["setup"], case["expr"]))
# A lesson's blocks share a folder, like the app's sandbox, which keeps files between runs.
folders = {}
for t in data["tries"]:
    folder = folders.setdefault(t["lesson"], tempfile.mkdtemp(prefix="cq-try-"))
    out["tries"].append(try_block(t["code"], folder))
json.dump(out, result_channel)
`

/**
 * A quiz question that asks what a piece of code gives, as { prelude, expr }: "What does
 * `x` give?" or "After `a` (and `b`), what is `x`?". Other questions give null.
 */
const QUIZ_WHAT = /^What (?:does|is|will) `([^`]+)`(?: (?:give|show|print|return|output|evaluate to|be|display))?\??$/
const QUIZ_AFTER = /^After `([^`]+)`(?:,? and (?:then )?`([^`]+)`)?, what (?:does|is|will) `([^`]+)`(?: (?:give|show|print|return|output|be|hold|contain))?\??$/
function quizCode(prompt) {
  const what = QUIZ_WHAT.exec(prompt.trim())
  if (what) return { prelude: '', expr: what[1] }
  const after = QUIZ_AFTER.exec(prompt.trim())
  if (after) return { prelude: [after[1], after[2]].filter(Boolean).join('\n'), expr: after[3] }
  return null
}

/** A choice or a result, compared loosely: no backticks, one kind of quote, single spaces. */
const quizNorm = (text) =>
  String(text)
    .trim()
    .replace(/^`([\s\S]*)`$/, '$1')
    .replace(/"/g, "'")
    .replace(/\s+/g, ' ')
    .trim()

/** Mirrors looksLikePython in src/features/curriculum/codeHighlight.ts (which "Try it" uses). */
const PY_CODE_LINE = [
  /^\s*(import|from|def|class|for|while|if|elif|else|try|except|finally|with|return|raise|assert|match|case|async|lambda|print)\b/,
  /^\s*@\w/,
  /^\s*[A-Za-z_][\w.[\]'"]*(\s*,\s*[A-Za-z_][\w.[\]]*)*\s*(\*\*|\/\/|[+\-*/%])?=(?!=)/,
  /^\s*[A-Za-z_][\w.]*\(/,
]
const PY_NOT_CODE_LINE = [/^(>|\$|>>>) /, /^\s*(python|pip|py|npm|cd|source)\s/, /^[A-Za-z][\w%]*( [\w%()]+)+: /, /^[A-Z][a-z]+: /]
function looksLikePython(code) {
  const lines = code.split('\n').filter((l) => l.trim() !== '' && !l.trim().startsWith('#'))
  if (lines.length === 0) return false
  if (lines.some((l) => PY_NOT_CODE_LINE.some((re) => re.test(l)))) return false
  return lines.some((l) => PY_CODE_LINE.some((re) => re.test(l)))
}

/** A Python lesson's "Try it" blocks; ones that show an error on purpose say so in a comment. */
function pythonTryBlocks(level) {
  const blocks = []
  for (const match of (level.intro.bodyMarkdown ?? '').matchAll(/```(\w*)\n([\s\S]*?)```/g)) {
    const [, info, code] = match
    if (info === 'text' || info === 'output' || !looksLikePython(code)) continue
    // Ones that show an error on purpose name it in a comment (# ValueError: …). Ones that
    // read the keyboard can't be run here,
    // and ones that go online (urlopen) need a network the check doesn't have.
    if (/#.*(error|raise|traceback|exception)/i.test(code) || /\b(input|urlopen)\s*\(/.test(code)) continue
    blocks.push(code)
  }
  return blocks
}

function runQuiz(python, helpers, data) {
  if (data.quiz.length === 0 && data.tries.length === 0) return { quiz: [], tries: [] }
  const r = spawnSync(python, ['-c', QUIZ_RUNNER, helpers], {
    input: JSON.stringify(data),
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    timeout: 15 * 60 * 1000,
  })
  if (r.status !== 0) throw new Error(`Quiz runner failed:\n${r.stderr}`)
  return JSON.parse(r.stdout)
}

function runPython(python, helpers, cases) {
  if (cases.length === 0) return []
  const r = spawnSync(python, ['-c', RUNNER, helpers], {
    input: JSON.stringify(cases),
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    timeout: 15 * 60 * 1000,
  })
  if (r.status !== 0) throw new Error(`Python runner failed:\n${r.stderr}`)
  return JSON.parse(r.stdout)
}

function runSql(python, helpers, data) {
  if (data.cases.length === 0 && data.runs.length === 0) return { cases: [], runs: [] }
  const r = spawnSync(python, ['-c', SQL_RUNNER, helpers], {
    input: JSON.stringify(data),
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    timeout: 15 * 60 * 1000,
  })
  if (r.status !== 0) throw new Error(`SQL runner failed:\n${r.stderr}`)
  return JSON.parse(r.stdout)
}

/** Runnable SQL in a lesson: the sandbox's code, its samples and the "Try it" code blocks. */
function lessonSql(level) {
  const blocks = []
  if (level.intro.sandboxCode) blocks.push(['sandbox', level.intro.sandboxCode])
  for (const snippet of level.sandboxSnippets ?? []) blocks.push([`sample "${snippet.label}"`, snippet.code])
  for (const match of (level.intro.bodyMarkdown ?? '').matchAll(/```\w*\n([\s\S]*?)```/g)) {
    const code = match[1]
    if (/^\s*(SELECT|WITH|INSERT|UPDATE|DELETE|REPLACE|CREATE|DROP|ALTER|BEGIN|PRAGMA|EXPLAIN)\b/i.test(code.split('\n').find((l) => l.trim() && !l.trim().startsWith('--')) ?? '')) {
      blocks.push(['"Try it" block', code])
    }
  }
  // Samples that show an error on purpose are marked with a comment.
  return blocks.filter(([, code]) => !/^\s*--\s*This gives an error/i.test(code))
}

function checkQuiz(question) {
  if (!question.prompt?.trim()) return 'empty prompt'
  if (question.type === 'mcq') {
    if (!Array.isArray(question.choices) || question.choices.length < 2) return 'fewer than 2 choices'
    if (!question.choices.some((c) => c.id === question.correctChoiceId)) return 'correct choice missing'
  } else if (!question.validation?.expected?.trim() && question.validation?.mode === 'equalsNormalized') {
    return 'no expected answer'
  }
  return null
}

const python = findPython()
const helpers = workerPythonHelpers()
const rootIndex = readJson(join(contentDir, 'index.json'))
const issues = []
const sectionStats = []

for (const lang of rootIndex.languages) {
  const langDir = dirname(lang.path)
  const langIndex = readJson(join(contentDir, lang.path))
  for (const sectionRef of langIndex.sections) {
    const sectionKey = `${lang.id}/${sectionRef.id}`
    if (onlySection && sectionKey !== onlySection) continue
    const file = readJson(join(contentDir, langDir, sectionRef.path))
    const sectionIssues = []
    const cases = []
    const caseRefs = []
    const sqlData = { cases: [], runs: [] }
    const sqlRefs = []
    const runRefs = []
    const quizData = { quiz: [], tries: [] }
    const quizRefs = []
    const tryRefs = []
    let challengeCount = 0

    for (const level of file.levels) {
      if (level.database) {
        for (const [what, sql] of lessonSql(level)) {
          sqlData.runs.push({ sql, setup: level.database.setupSql })
          runRefs.push({ section: sectionKey, level: level.id, item: what })
        }
      }
      for (const ch of level.challenges) {
        challengeCount += 1
        const where = { section: sectionKey, level: level.id, item: ch.title, id: ch.id }
        const add = (rule, detail = '') => sectionIssues.push({ ...where, rule, detail })
        if (!ch.promptMarkdown?.trim()) add('empty-prompt')
        if (!(ch.hint ?? ch.hints?.[0])?.trim()) add('no-hint')
        if (!ch.solution?.trim()) add('no-solution')
        const mode = ch.validation?.mode
        if (lang.id === 'python' && (mode === 'includesAll' || mode === 'regex')) add('text-matched', mode)
        if (mode === 'sql_tests') {
          if (!ch.solution?.trim()) continue
          sqlData.cases.push({
            setup: level.database?.setupSql ?? '',
            alt: level.database?.altSetupSql ?? '',
            solution: ch.solution,
            ordered: Boolean(ch.validation.ordered),
            checks: ch.validation.tests ?? [],
            variants: { solution: ch.solution, starter: ch.starterCode ?? '', empty: '' },
          })
          sqlRefs.push({ where, starterBlank: !(ch.starterCode ?? '').trim(), changesData: Boolean(ch.validation.tests?.length) })
          continue
        }
        if (mode !== 'python_tests') continue
        if (!ch.validation.tests?.length) {
          add('no-tests')
          continue
        }
        const variants = { starter: ch.starterCode ?? '', empty: '' }
        if (ch.solution?.trim()) variants.solution = ch.solution
        cases.push({ setup: ch.validation.setupCode ?? '', tests: ch.validation.tests, variants })
        caseRefs.push({ where, hasSolution: Boolean(variants.solution), starterBlank: !variants.starter.trim() })
      }
      const mcqAnswers = (level.test?.questions ?? []).filter((q) => q.type === 'mcq').map((q) => q.correctChoiceId)
      if (mcqAnswers.length >= 4 && new Set(mcqAnswers).size === 1) {
        sectionIssues.push({ section: sectionKey, level: level.id, item: 'quiz', rule: 'quiz-pattern', detail: `always "${mcqAnswers[0]}"` })
      }
      for (const q of level.test?.questions ?? []) {
        const problem = checkQuiz(q)
        if (problem) sectionIssues.push({ section: sectionKey, level: level.id, item: q.prompt, rule: 'bad-quiz', detail: problem })
        const asked = q.type === 'mcq' && (lang.id === 'python' || lang.id === 'sql') ? quizCode(q.prompt) : null
        if (asked && (lang.id === 'python' || /^\s*(SELECT|WITH)\b/i.test(asked.expr))) {
          quizData.quiz.push({ lang: lang.id, setup: level.database?.setupSql ?? '', ...asked })
          quizRefs.push({ where: { section: sectionKey, level: level.id, item: q.prompt }, q })
        }
      }
      if (lang.id === 'python') {
        for (const code of pythonTryBlocks(level)) {
          quizData.tries.push({ lesson: `${sectionKey}/${level.id}`, code })
          tryRefs.push({ section: sectionKey, level: level.id, item: `"Try it" block: ${code.trim().split('\n')[0].slice(0, 50)}` })
        }
      }
    }

    const results = runPython(python, helpers, cases)
    results.forEach((res, i) => {
      const { where, hasSolution, starterBlank } = caseRefs[i]
      const add = (rule, detail = '') => sectionIssues.push({ ...where, rule, detail })
      if (hasSolution && !res.solution.passed) add('solution-fails', res.solution.detail)
      if (res.empty.passed) add('empty-passes')
      else if (!starterBlank && res.starter.passed) add('starter-passes')
      else if (res.typed?.passed && !typedAllowed.has(where.id)) add('typed-passes')
    })

    const sql = runSql(python, helpers, sqlData)
    sql.cases.forEach((res, i) => {
      const { where, starterBlank, changesData } = sqlRefs[i]
      const add = (rule, detail = '') => sectionIssues.push({ ...where, rule, detail })
      const v = res.variants
      if (!v.solution.passed) add('solution-fails', v.solution.detail)
      if (v.empty.passed) add('empty-passes')
      else if (!starterBlank && v.starter.passed) add('starter-passes')
      else if (v.typed?.passed && !typedAllowed.has(where.id)) add('typed-passes')
      if (!changesData && res.mainRows === 0) add('empty-result')
      if (res.altSame && !typedAllowed.has(where.id)) add('alt-same')
      if (res.ties) add('order-ties')
    })
    sql.runs.forEach((message, i) => {
      if (message) sectionIssues.push({ ...runRefs[i], rule: 'sandbox-error', detail: message })
    })

    const quiz = runQuiz(python, helpers, quizData)
    quiz.quiz.forEach((values, i) => {
      if (!values) return
      const { where, q } = quizRefs[i]
      const results = new Set(values.map(quizNorm))
      const matching = q.choices.filter((c) => results.has(quizNorm(c.label)))
      if (matching.length > 0 && !matching.some((c) => c.id === q.correctChoiceId)) {
        sectionIssues.push({ ...where, rule: 'quiz-wrong-answer', detail: `it gives ${values[0]}` })
      }
    })
    quiz.tries.forEach((message, i) => {
      if (message) sectionIssues.push({ ...tryRefs[i], rule: 'python-try-error', detail: message })
    })

    const strict = allStrict || strictSections.has(sectionKey)
    sectionStats.push({ sectionKey, challengeCount, issues: sectionIssues.length, strict })
    // Typed-in answers are reported only: some challenges are fixed tasks ("print 1 to 10").
    issues.push(...sectionIssues.map((issue) => ({ ...issue, strict: strict && issue.rule !== 'typed-passes' })))
  }
}

// Report
const byRule = (list) =>
  Object.entries(
    list.reduce((acc, issue) => ({ ...acc, [issue.rule]: (acc[issue.rule] ?? 0) + 1 }), {}),
  )
    .map(([rule, n]) => `${n} ${rule}`)
    .join(', ')

console.log('Section'.padEnd(36) + 'Challenges'.padStart(11) + 'Issues'.padStart(8) + '  Mode')
for (const s of sectionStats) {
  const sectionIssues = issues.filter((i) => i.section === s.sectionKey)
  console.log(
    s.sectionKey.padEnd(36) +
      String(s.challengeCount).padStart(11) +
      String(s.issues).padStart(8) +
      `  ${s.strict ? 'strict' : 'report'}` +
      (sectionIssues.length ? `  (${byRule(sectionIssues)})` : ''),
  )
}

const strictIssues = issues.filter((i) => i.strict)
const toList = verbose ? issues : strictIssues
if (toList.length) {
  console.log('')
  for (const i of toList) {
    console.log(`${i.strict ? 'ERROR' : 'warn '} ${i.section} › ${i.level} › ${i.item}: ${RULES[i.rule]}${i.detail ? ` (${i.detail})` : ''}`)
  }
}

if (strictIssues.length) {
  console.log(`\n${strictIssues.length} problem(s) in strict sections.`)
  process.exit(1)
}
console.log('\nStrict sections are clean.')
