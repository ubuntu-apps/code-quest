/**
 * Runs Python for the Python and SQL checkers: Python 3 on this machine, with the exact helper
 * code the app's worker runs (public/pyodide-worker.js), so the checks grade code the way the
 * app does. Each runner (python/*.py) gets a batch of cases on stdin and prints its results.
 *
 * Needs Python 3 on PATH (python3 or python), or set CQ_PYTHON. pandas is needed for pandas lessons.
 */
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export class PythonEngine {
  /** @param {string} root The repository's folder. */
  constructor(root) {
    this.root = root
    this.command = null
    this.helpers = null
  }

  /** Whether Python 3 can be found. */
  available() {
    return this.findPython() !== null
  }

  findPython() {
    if (this.command) return this.command
    for (const cmd of [process.env.CQ_PYTHON, 'python3', 'python'].filter(Boolean)) {
      if (spawnSync(cmd, ['--version'], { encoding: 'utf8' }).status === 0) return (this.command = cmd)
    }
    return null
  }

  /** The Python helper code the app's worker runs (the single source of truth for grading). */
  workerHelpers() {
    if (this.helpers) return this.helpers
    const src = readFileSync(join(this.root, 'public', 'pyodide-worker.js'), 'utf8')
    const match = src.match(/var PY_HELPERS = (\[[\s\S]*?\])\.join\('\\n'\)/)
    if (!match) throw new Error('Could not find PY_HELPERS in public/pyodide-worker.js')
    return (this.helpers = new Function(`return ${match[1]}`)().join('\n'))
  }

  /** Runs python/<runner>.py on `input` and gives what it printed, as JSON. */
  run(runner, input) {
    const python = this.findPython()
    if (!python) throw new Error('Python 3 not found. Install it or set CQ_PYTHON.')
    // Run as `python -c`, so imports look in the working folder (where lesson code writes its
    // modules), as they do in the app, rather than in this script's folder.
    const script = readFileSync(join(this.root, 'scripts', 'content-check', 'python', `${runner}.py`), 'utf8')
    const r = spawnSync(python, ['-c', script, this.workerHelpers()], {
      input: JSON.stringify(input),
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      timeout: 15 * 60 * 1000,
    })
    if (r.status !== 0) throw new Error(`${runner}.py failed:\n${r.stderr}`)
    return JSON.parse(r.stdout)
  }
}
