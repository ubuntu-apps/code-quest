/**
 * Checks lesson content by running it, the same way the app does.
 *
 * For every Python challenge graded by tests it runs three versions of the
 * learner's code through the app's own worker helpers (public/pyodide-worker.js):
 *   - the solution        → must pass every test
 *   - the starter code    → must NOT pass (otherwise the challenge is pre-solved)
 *   - empty code          → must NOT pass (otherwise setup code gives the answer away)
 * It also flags missing prompts, hints and solutions, text-matched Python
 * challenges, and malformed quiz questions.
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

const RULES = {
  'empty-prompt': 'Challenge has no instructions',
  'no-hint': 'Challenge has no hint',
  'no-solution': 'Challenge has no solution',
  'no-tests': 'Challenge has no tests',
  'solution-fails': 'Solution does not pass its own tests',
  'starter-passes': 'Starter code already passes (pre-solved)',
  'empty-passes': 'Empty code passes (setup gives the answer away)',
  'text-matched': 'Python challenge graded by text matching instead of tests',
  'bad-quiz': 'Quiz question is malformed',
  'quiz-pattern': 'Every multiple-choice answer in this quiz is in the same position',
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
results = []
for case in cases:
    out = {}
    for variant, code in case["variants"].items():
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

function findPython() {
  const candidates = [process.env.CQ_PYTHON, 'python3', 'python'].filter(Boolean)
  for (const cmd of candidates) {
    const r = spawnSync(cmd, ['--version'], { encoding: 'utf8' })
    if (r.status === 0) return cmd
  }
  throw new Error('Python 3 not found. Install it or set CQ_PYTHON.')
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
    let challengeCount = 0

    for (const level of file.levels) {
      for (const ch of level.challenges) {
        challengeCount += 1
        const where = { section: sectionKey, level: level.id, item: ch.title }
        const add = (rule, detail = '') => sectionIssues.push({ ...where, rule, detail })
        if (!ch.promptMarkdown?.trim()) add('empty-prompt')
        if (!(ch.hint ?? ch.hints?.[0])?.trim()) add('no-hint')
        if (!ch.solution?.trim()) add('no-solution')
        const mode = ch.validation?.mode
        if (lang.id === 'python' && (mode === 'includesAll' || mode === 'regex')) add('text-matched', mode)
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
      }
    }

    const results = runPython(python, helpers, cases)
    results.forEach((res, i) => {
      const { where, hasSolution, starterBlank } = caseRefs[i]
      const add = (rule, detail = '') => sectionIssues.push({ ...where, rule, detail })
      if (hasSolution && !res.solution.passed) add('solution-fails', res.solution.detail)
      if (res.empty.passed) add('empty-passes')
      else if (!starterBlank && res.starter.passed) add('starter-passes')
    })

    const strict = allStrict || strictSections.has(sectionKey)
    sectionStats.push({ sectionKey, challengeCount, issues: sectionIssues.length, strict })
    issues.push(...sectionIssues.map((issue) => ({ ...issue, strict })))
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
