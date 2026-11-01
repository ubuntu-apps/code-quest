/**
 * Checks every course's lessons by running them, the same way the app does (see ContentChecker.mjs).
 *
 * Usage: node scripts/content-check/check.mjs [--language r] [--section python/data_and_apis] [--all-strict] [--verbose] [--require-engines]
 *   (npm run check:content)
 *
 * Python and SQL run on Python 3 (python3 or python on PATH, or set CQ_PYTHON; pandas for the
 * pandas lessons). R runs in webR: npm install --no-save webr@0.4.2 first. A course whose engine
 * isn't installed gets the shared checks only, unless it is asked for with --language, or every
 * engine is required with --require-engines (CI): then the check stops with an error.
 *
 * Sections listed in scripts/curriculum-check.json ("strictSections") must be clean or the
 * check exits with code 1; other sections are reported only.
 */
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ContentChecker } from './ContentChecker.mjs'
import { FileContentSource } from './ContentSource.mjs'
import { PythonEngine } from './PythonEngine.mjs'
import { PythonChecker } from './PythonChecker.mjs'
import { SqlChecker } from './SqlChecker.mjs'
import { RChecker } from './RChecker.mjs'
import { WebREngine } from './WebREngine.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const args = process.argv.slice(2)
const option = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : null)
const language = option('--language')

const python = new PythonEngine(root)
/** Each language's checker. A new language is one more line here. */
const checkers = {
  python: (spec) => new PythonChecker(spec, python),
  sql: (spec) => new SqlChecker(spec, python),
  r: (spec) => new RChecker(spec, new WebREngine(), RCourse),
}
// The R stages' data (for `typedOk` and the questions' checks), loaded only when R is checked.
const RCourse = !language || language === 'r' ? (await import('../r-curriculum/data/course.mjs')).COURSE : []

const checker = new ContentChecker({
  source: new FileContentSource(root),
  checkers,
  config: JSON.parse(readFileSync(join(root, 'scripts', 'curriculum-check.json'), 'utf8')),
  language,
  section: option('--section'),
  allStrict: args.includes('--all-strict'),
})
const report = await checker.run()
checker.print({ verbose: args.includes('--verbose') })
if ((language || args.includes('--require-engines')) && checker.skipped.length) process.exit(2)
process.exit(report.problems.length ? 1 : 0)
