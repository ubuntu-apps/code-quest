import type { PythonAssertionTest } from './types'
import { explainPythonError, type FriendlyPythonError } from './pythonErrorHelper'
export type { FriendlyPythonError } from './pythonErrorHelper'

const PYODIDE_VERSION = '0.27.2'
const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/pyodide.js`

type PyodideApi = {
  runPythonAsync: (code: string) => Promise<unknown>
}

type LoadPyodideFn = (options: { indexURL: string }) => Promise<PyodideApi>

export interface SandboxRunResult {
  output: string
  error: FriendlyPythonError | null
}

export interface PythonChallengeTestResult {
  id: string
  label: string
  passed: boolean
  detail?: string
}

export interface PythonChallengeRunResult {
  passed: boolean
  tests: PythonChallengeTestResult[]
  /** Present when user/setup code throws before or during test assertions. */
  error: FriendlyPythonError | null
}

declare global {
  interface Window {
    loadPyodide?: LoadPyodideFn
  }
}

let loaderPromise: Promise<PyodideApi> | null = null

function ensureScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.loadPyodide) {
      resolve()
      return
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-codequest-pyodide="1"]')
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Failed to load Pyodide script')), {
        once: true,
      })
      return
    }

    const script = document.createElement('script')
    script.src = PYODIDE_CDN
    script.async = true
    script.dataset.codequestPyodide = '1'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Pyodide script'))
    document.head.appendChild(script)
  })
}

async function getPyodide(): Promise<PyodideApi> {
  if (!loaderPromise) {
    loaderPromise = (async () => {
      await ensureScript()
      if (!window.loadPyodide) {
        throw new Error('Pyodide loader not available')
      }
      return window.loadPyodide({
        indexURL: `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`,
      })
    })()
  }
  return loaderPromise
}

export async function runPythonCode(source: string): Promise<SandboxRunResult> {
  const pyodide = await getPyodide()
  const wrapped = `
import io, sys
_cq_buf = io.StringIO()
_cq_old = sys.stdout
sys.stdout = _cq_buf
_cq_result = None
try:
    _cq_result = eval(compile(${JSON.stringify(source)}, "<sandbox>", "eval"))
except SyntaxError:
    exec(compile(${JSON.stringify(source)}, "<sandbox>", "exec"))
finally:
    sys.stdout = _cq_old
_cq_out = _cq_buf.getvalue()
if _cq_result is not None:
    _cq_out = _cq_out + str(_cq_result) + "\\n"
_cq_out
`

  try {
    const result = await pyodide.runPythonAsync(wrapped)
    const output = typeof result === 'string' ? result : String(result ?? '')
    return { output, error: null }
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : 'Execution error'
    return {
      output: '',
      error: await explainPythonError(detail),
    }
  }
}

function escapePyTripleSingleQuoted(input: string): string {
  return input.replace(/\\/g, '\\\\').replace(/'''/g, "\\'\\'\\'")
}

export async function runPythonChallengeTests(
  userCode: string,
  setupCode: string | undefined,
  tests: PythonAssertionTest[],
): Promise<PythonChallengeRunResult> {
  const pyodide = await getPyodide()
  const safeSetup = escapePyTripleSingleQuoted(setupCode ?? '')
  const safeUser = escapePyTripleSingleQuoted(userCode)
  const testPayload = JSON.stringify(tests)

  const wrapped = `
import json
import io
import sys

setup = '''${safeSetup}'''
user = '''${safeUser}'''
tests = json.loads(${JSON.stringify(testPayload)})

ns = {}
if setup.strip():
    exec(compile(setup, "<challenge_setup>", "exec"), ns, ns)
_cq_buf = io.StringIO()
_cq_old = sys.stdout
sys.stdout = _cq_buf
try:
    exec(compile(user, "<challenge_user>", "exec"), ns, ns)
finally:
    sys.stdout = _cq_old
ns["_cq_stdout"] = _cq_buf.getvalue()

results = []
for t in tests:
    try:
        ok = bool(eval(compile(t["assertion"], "<challenge_assert>", "eval"), ns, ns))
        if ok:
            results.append({"id": t["id"], "label": t["label"], "passed": True})
        else:
            results.append({
                "id": t["id"],
                "label": t["label"],
                "passed": False,
                "detail": f'Assertion returned False: {t["assertion"]}'
            })
    except Exception as e:
        results.append({
            "id": t["id"],
            "label": t["label"],
            "passed": False,
            "detail": str(e)
        })

json.dumps(results)
`

  try {
    const raw = await pyodide.runPythonAsync(wrapped)
    const parsed = JSON.parse(typeof raw === 'string' ? raw : String(raw ?? '[]')) as PythonChallengeTestResult[]
    return {
      passed: parsed.every((t) => t.passed),
      tests: parsed,
      error: null,
    }
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : 'Execution failed'
    return {
      passed: false,
      tests: [],
      error: await explainPythonError(detail),
    }
  }
}

