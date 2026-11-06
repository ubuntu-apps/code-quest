/**
 * Runs learners' JavaScript and checks it: the part shared by the app (jsWorker.ts, in a Web
 * Worker) and the content checker (scripts/content-check/NodeJsEngine.mjs, in a Node worker
 * thread), so a check runs the same way everywhere. No imports apart from types, so Node can
 * load this file directly.
 *
 * The code runs as the body of an async function, so `await` works at the top level. It gets
 * its own `console` (what it logs is the output) and its own timers (a run ends once every
 * timer has fired). A challenge's tests are JavaScript expressions that run after the code, in
 * the same scope, so they see the learner's variables by name, plus:
 * - `_cq_output`: everything logged, as text (lines joined with \n);
 * - `_cq_lines`: the logged lines, with spaces at line ends removed;
 * - `_cq_code`: the code itself, to check a feature was used;
 * - `_cq_prints(...lines)`: the output is exactly these lines (a difference is highlighted).
 * The host stops a run that goes on too long by ending the worker.
 */
import type { RuntimeAssertionTest } from '../../curriculum/content/types.ts'

/** An error from the learner's code, with its position in that code when known (1-based). */
export interface JsError {
  name: string
  message: string
  line?: number
  column?: number
}

export interface JsTestLine {
  id: string
  label: string
  passed: boolean
  detail?: string
  diff?: { expected: string; actual: string; text: boolean }
}

export interface JsResult {
  output: string
  error: JsError | null
  /** Only for a Check: each test's result. */
  tests?: JsTestLine[]
}

export interface JsRunOptions {
  /** A challenge's setup code, run before the learner's (its lines aren't counted in error positions). */
  setupCode?: string
  /** A challenge's tests; without them it is a plain run. */
  tests?: RuntimeAssertionTest[]
  /** Called with everything logged so far, as the code runs. */
  onOutput?: (outputSoFar: string) => void
}

// ---- Showing values, as Node's console.log does (a simpler version of util.inspect) ----

const IDENTIFIER = /^[A-Za-z_$][\w$]*$/
const MAX_DEPTH = 2
const LINE_WIDTH = 72

function quote(text: string): string {
  const q = text.includes("'") && !text.includes('"') ? '"' : "'"
  const escaped = text.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\t/g, '\\t')
  return q + (q === "'" ? escaped.replace(/'/g, "\\'") : escaped) + q
}

function joined(open: string, items: string[], close: string, indent: string): string {
  if (items.length === 0) return `${open}${close}`
  const oneLine = `${open} ${items.join(', ')} ${close}`
  if (oneLine.length <= LINE_WIDTH && !items.some((i) => i.includes('\n'))) return oneLine
  const inner = indent + '  '
  return `${open}\n${items.map((i) => inner + i.replace(/\n/g, '\n' + inner)).join(',\n')}\n${indent}${close}`
}

/** A value as console.log shows it inside an array or object. */
export function inspect(value: unknown, depth = 0, seen: object[] = []): string {
  if (typeof value === 'string') return quote(value)
  if (typeof value === 'number') return Object.is(value, -0) ? '-0' : String(value)
  if (typeof value === 'bigint') return `${value}n`
  if (typeof value === 'symbol') return value.toString()
  if (value === undefined || value === null || typeof value === 'boolean') return String(value)
  if (typeof value === 'function') {
    const source = Function.prototype.toString.call(value)
    if (source.startsWith('class')) return `[class ${value.name || '(anonymous)'}]`
    return value.name ? `[Function: ${value.name}]` : '[Function (anonymous)]'
  }
  const object = value as object
  if (seen.includes(object)) return '[Circular]'
  if (object instanceof Date) return Number.isNaN(object.getTime()) ? 'Invalid Date' : object.toISOString()
  if (object instanceof RegExp) return String(object)
  if (object instanceof Error) return `${object.name}: ${object.message}`
  if (typeof Promise !== 'undefined' && object instanceof Promise) return 'Promise { <pending> }'
  const next = [...seen, object]
  if (Array.isArray(object)) {
    if (depth > MAX_DEPTH) return '[Array]'
    const items = object.map((item) => inspect(item, depth + 1, next))
    return joined('[', items, ']', '')
  }
  if (object instanceof Map) {
    if (depth > MAX_DEPTH) return '[Map]'
    const items = [...object].map(([k, v]) => `${inspect(k, depth + 1, next)} => ${inspect(v, depth + 1, next)}`)
    return `Map(${object.size}) ` + joined('{', items, '}', '')
  }
  if (object instanceof Set) {
    if (depth > MAX_DEPTH) return '[Set]'
    return `Set(${object.size}) ` + joined('{', [...object].map((v) => inspect(v, depth + 1, next)), '}', '')
  }
  const ctor = (Object.getPrototypeOf(object) as { constructor?: { name?: string } } | null)?.constructor
  const prefix = ctor && ctor.name && ctor !== Object ? `${ctor.name} ` : Object.getPrototypeOf(object) === null ? '[Object: null prototype] ' : ''
  if (depth > MAX_DEPTH) return prefix ? `[${prefix.trim()}]` : '[Object]'
  const record = object as Record<string, unknown>
  const items = Object.keys(record).map((key) => `${IDENTIFIER.test(key) ? key : quote(key)}: ${inspect(record[key], depth + 1, next)}`)
  return prefix + joined('{', items, '}', '')
}

/** The line console.log writes for these values: text as it is, everything else inspected. */
export function formatLog(values: unknown[]): string {
  return values.map((v) => (typeof v === 'string' ? v : inspect(v))).join(' ')
}

// ---- Where an error happened ----

type AsyncFunctionConstructor = new (...args: string[]) => (...args: unknown[]) => Promise<unknown>
const AsyncFunction = Object.getPrototypeOf(async () => undefined).constructor as AsyncFunctionConstructor

/** The line and column an error points at in the function's source, from its stack or own fields. */
function rawPosition(error: unknown): { line: number; column: number } | null {
  if (!error || typeof error !== 'object') return null
  const e = error as { stack?: unknown; line?: unknown; column?: unknown; lineNumber?: unknown; columnNumber?: unknown }
  // Safari, then Firefox, then V8 (Chrome, Node): the first frame in the learner's function.
  if (typeof e.line === 'number') return { line: e.line, column: typeof e.column === 'number' ? e.column : 1 }
  if (typeof e.lineNumber === 'number') return { line: e.lineNumber, column: typeof e.columnNumber === 'number' ? e.columnNumber + 1 : 1 }
  const stack = typeof e.stack === 'string' ? e.stack : ''
  // V8: "at eval (eval at …, <anonymous>:4:1)"; Firefox: "… > AsyncFunction:4:1".
  const frame = /,\s*<anonymous>:(\d+):(\d+)\)/.exec(stack) ?? /> (?:Async)?Function:(\d+):(\d+)/.exec(stack)
  return frame ? { line: Number(frame[1]), column: Number(frame[2]) } : null
}

let lineOffset: number | null = null

/** How many lines the engine puts before a generated function's body (2 in V8: the header and the brace). */
function bodyLineOffset(): number {
  if (lineOffset !== null) return lineOffset
  lineOffset = 2
  try {
    new Function('throw new Error("where")')()
  } catch (e) {
    const at = rawPosition(e)
    if (at) lineOffset = at.line - 1
  }
  return lineOffset
}

/**
 * The first line of `code` with a syntax error: the shortest start of the code that fails to
 * compile for another reason than ending too soon (a missing bracket only shows at the end).
 */
export function syntaxErrorLine(code: string): number | undefined {
  const lines = code.split('\n')
  const endsTooSoon = (message: string) => /end of (input|script)|expected expression, got end|unterminated|missing \} |unexpected eof/i.test(message)
  for (let n = 1; n <= lines.length; n++) {
    try {
      new AsyncFunction(lines.slice(0, n).join('\n'))
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      if (!endsTooSoon(message) || n === lines.length) return n
    }
  }
  return undefined
}

function toJsError(error: unknown, linesBefore: number, code: string): JsError {
  const name = error instanceof Error ? error.name : 'Error'
  const message = error instanceof Error ? error.message : `Uncaught ${inspect(error)}`
  if (name === 'SyntaxError') return { name, message, ...(syntaxLine(code)) }
  const at = rawPosition(error)
  if (!at) return { name, message }
  const line = at.line - bodyLineOffset() - linesBefore
  const total = code.split('\n').length
  return line >= 1 && line <= total ? { name, message, line, column: at.column } : { name, message }
}

function syntaxLine(code: string): { line?: number } {
  const line = syntaxErrorLine(code)
  return line ? { line } : {}
}

// ---- Running ----

const TEST_NAMES = ['_cq_code', '_cq_prints']

/**
 * Runs code (and a challenge's tests). Never throws: an error in the code is in `error`, and a
 * test that throws fails with the error as its detail.
 */
export async function runJavaScript(code: string, { setupCode = '', tests, onOutput }: JsRunOptions = {}): Promise<JsResult> {
  const logged: string[] = []
  const report = () => onOutput?.(logged.join('\n'))
  const write = (...values: unknown[]) => {
    logged.push(...formatLog(values).split('\n'))
    report()
  }
  const console = {
    log: write,
    info: write,
    debug: write,
    warn: write,
    error: write,
    table: (data: unknown) => write(data),
    clear: () => undefined,
  }

  // Timers the code starts: the run waits for them, so code after `setTimeout` still shows.
  let pending = 0
  let settle: (() => void) | null = null
  let timerError: unknown = null
  const wake = () => {
    if (pending === 0 && settle) settle()
  }
  const timers = new Map<unknown, 'timeout' | 'interval'>()
  const guarded = (fn: unknown, args: unknown[]) => () => {
    try {
      if (typeof fn === 'function') {
        const out = (fn as (...a: unknown[]) => unknown)(...args)
        if (out instanceof Promise) out.catch((e: unknown) => (timerError ??= e))
      }
    } catch (e) {
      timerError ??= e
    }
  }
  const setTimeout = (fn: unknown, ms?: number, ...args: unknown[]) => {
    pending++
    const id = globalThis.setTimeout(() => {
      timers.delete(id)
      pending--
      guarded(fn, args)()
      wake()
    }, ms)
    timers.set(id, 'timeout')
    return id
  }
  const clearTimeout = (id: unknown) => {
    if (timers.get(id) === 'timeout') {
      timers.delete(id)
      pending--
      globalThis.clearTimeout(id as ReturnType<typeof globalThis.setTimeout>)
      wake()
    }
  }
  const setInterval = (fn: unknown, ms?: number, ...args: unknown[]) => {
    pending++
    const id = globalThis.setInterval(guarded(fn, args), ms)
    timers.set(id, 'interval')
    return id
  }
  const clearInterval = (id: unknown) => {
    if (timers.get(id) === 'interval') {
      timers.delete(id)
      pending--
      globalThis.clearInterval(id as ReturnType<typeof globalThis.setInterval>)
      wake()
    }
  }
  const allTimersDone = () => (pending === 0 ? Promise.resolve() : new Promise<void>((resolve) => (settle = resolve)))

  const linesBefore = setupCode ? setupCode.split('\n').length : 0
  const testList = tests ?? []
  // The tests become closures at the end of the body, so they see the learner's variables, and
  // run once the timers are done.
  const closures = testList.map((t) => `(_cq_output, _cq_lines) => (${t.assertion}\n)`).join(',\n')
  const body = `${setupCode ? setupCode + '\n' : ''}${code}\n;return [${closures}]`
  const params = ['console', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', ...TEST_NAMES]

  let fn: (...args: unknown[]) => Promise<unknown>
  try {
    fn = new AsyncFunction(...params, body)
  } catch (e) {
    // The tests compile with the code, so check the learner's code on its own first.
    try {
      new AsyncFunction(code)
    } catch (own) {
      return { output: '', error: toJsError(own, 0, code), ...(tests ? { tests: notRun(testList) } : {}) }
    }
    return { output: '', error: toJsError(e, linesBefore, code), ...(tests ? { tests: notRun(testList) } : {}) }
  }

  const lazy = {
    output: () => logged.join('\n'),
    lines: () => logged.join('\n').split('\n').map((l) => l.replace(/\s+$/, '')),
  }
  let diff: JsTestLine['diff'] | undefined
  const prints = (...expected: string[]) => {
    const actual = lazy.lines()
    while (actual.length > 0 && actual[actual.length - 1] === '') actual.pop()
    const passed = actual.length === expected.length && actual.every((line, i) => line === expected[i])
    if (!passed) diff = { expected: expected.join('\n'), actual: actual.join('\n'), text: true }
    return passed
  }

  let checks: unknown
  try {
    checks = await fn(console, setTimeout, clearTimeout, setInterval, clearInterval, code, prints)
    await allTimersDone()
    if (timerError) throw timerError
  } catch (e) {
    for (const id of timers.keys()) {
      globalThis.clearTimeout(id as ReturnType<typeof globalThis.setTimeout>)
      globalThis.clearInterval(id as ReturnType<typeof globalThis.setInterval>)
    }
    return { output: lazy.output(), error: toJsError(e, linesBefore, code), ...(tests ? { tests: notRun(testList) } : {}) }
  }
  if (!tests) return { output: lazy.output(), error: null }

  const results: JsTestLine[] = []
  const list = Array.isArray(checks) ? (checks as ((output: string, lines: string[]) => unknown)[]) : []
  // Read once the timers are done, so the tests see everything that was logged.
  const output = lazy.output()
  const lines = lazy.lines()
  for (const [i, t] of testList.entries()) {
    diff = undefined
    let passed = false
    let detail: string | undefined
    try {
      // A test that awaits (async code) can give a promise.
      passed = (await list[i]?.(output, [...lines])) === true
    } catch (e) {
      detail = e instanceof Error ? `${e.name}: ${e.message}` : String(e)
    }
    const failedDiff = !passed ? diff : undefined
    results.push({ id: t.id, label: t.label, passed, ...(detail ? { detail } : {}), ...(failedDiff ? { diff: failedDiff } : {}) })
  }
  return { output: lazy.output(), error: null, tests: results }
}

function notRun(tests: RuntimeAssertionTest[]): JsTestLine[] {
  return tests.map((t) => ({ id: t.id, label: t.label, passed: false, detail: "This check didn't run." }))
}
