import type { RuntimeAssertionTest } from './types'
import { explainPythonError, type FriendlyPythonError } from './pythonErrorHelper'
export type { FriendlyPythonError } from './pythonErrorHelper'

const PYODIDE_VERSION = '0.27.2'
const PYODIDE_CDN_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`

/** How long learner code may run before it is stopped (infinite-loop guard). */
export const PYTHON_RUN_TIME_LIMIT_MS = 10_000

/** How long the first download of the Python runtime may take before we give up. */
const PYTHON_LOAD_TIME_LIMIT_MS = 120_000

const RUNTIME_LOAD_ERROR =
  'Could not load the Python runtime. Check your internet connection, or try a newer browser (Python needs Safari 16.4+ or a recent Chrome/Firefox).'

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

type RunRequest = { type: 'run'; code: string; stdin: string }
type TestsRequest = {
  type: 'tests'
  userCode: string
  setupCode: string
  tests: RuntimeAssertionTest[]
  stdin: string
}
type WorkerRequest = RunRequest | TestsRequest

type RunPayload = { output: string; error: string | null }
type TestsPayload = { tests: PythonChallengeTestResult[]; error: string | null }

type WorkerReply =
  | { type: 'ready' }
  | { type: 'load-error'; message: string }
  | { id: number; type: 'result'; payload: unknown }
  | { id: number; type: 'crash'; message: string }

type JobOutcome =
  | { kind: 'result'; payload: unknown }
  | { kind: 'crash'; message: string }
  | { kind: 'timeout' }
  | { kind: 'stopped' }

interface ActiveJob {
  id: number
  timer: ReturnType<typeof setTimeout> | null
  settle: (outcome: JobOutcome) => void
}

/** Thrown when the learner presses Stop while the runtime is still loading. */
class RunStoppedError extends Error {}

let worker: Worker | null = null
let workerReady: Promise<void> | null = null
let rejectWorkerLoad: ((error: Error) => void) | null = null
let activeJob: ActiveJob | null = null
let queue: Promise<unknown> = Promise.resolve()
let nextJobId = 1

function workerUrl(): string {
  const base = import.meta.env.BASE_URL
  return `${base.endsWith('/') ? base : `${base}/`}pyodide-worker.js`
}

function discardWorker(): void {
  worker?.terminate()
  worker = null
  workerReady = null
  // A terminated worker never reports back, so settle a pending load here
  // instead of leaving every later run waiting on it.
  const rejectLoad = rejectWorkerLoad
  rejectWorkerLoad = null
  rejectLoad?.(new RunStoppedError('Stopped while loading'))
}

function handleWorkerMessage(reply: WorkerReply): void {
  if (!('id' in reply)) return
  const job = activeJob
  if (!job || job.id !== reply.id) return
  job.settle(
    reply.type === 'result'
      ? { kind: 'result', payload: reply.payload }
      : { kind: 'crash', message: reply.message },
  )
}

/** Starts (or reuses) the worker and resolves once Pyodide has loaded inside it. */
function ensureWorker(): Promise<void> {
  if (worker && workerReady) return workerReady
  const w = new Worker(workerUrl())
  worker = w
  workerReady = new Promise<void>((resolve, reject) => {
    const loadTimer = setTimeout(() => fail(new Error(RUNTIME_LOAD_ERROR)), PYTHON_LOAD_TIME_LIMIT_MS)
    const finish = () => {
      clearTimeout(loadTimer)
      w.removeEventListener('message', onInit)
      if (rejectWorkerLoad === fail) rejectWorkerLoad = null
    }
    function fail(error: Error) {
      finish()
      reject(error)
    }
    const onInit = (event: MessageEvent<WorkerReply>) => {
      if (event.data.type === 'ready') {
        finish()
        resolve()
      } else if (event.data.type === 'load-error') {
        fail(new Error(RUNTIME_LOAD_ERROR))
      }
    }
    rejectWorkerLoad = fail
    w.addEventListener('message', onInit)
    w.addEventListener('error', () => fail(new Error(RUNTIME_LOAD_ERROR)), { once: true })
  })
  w.addEventListener('message', (event: MessageEvent<WorkerReply>) => handleWorkerMessage(event.data))
  w.postMessage({ type: 'init', cdnBase: PYODIDE_CDN_BASE })
  // A failed load must not poison later attempts (e.g. the learner comes back online).
  workerReady.catch(() => {
    if (worker === w) discardWorker()
  })
  return workerReady
}

async function runJob(request: WorkerRequest): Promise<JobOutcome> {
  await ensureWorker()
  const w = worker
  if (!w) return { kind: 'stopped' }
  const id = nextJobId++
  return new Promise<JobOutcome>((resolve) => {
    const job: ActiveJob = {
      id,
      timer: null,
      settle: (outcome) => {
        if (job.timer) clearTimeout(job.timer)
        if (activeJob === job) activeJob = null
        resolve(outcome)
      },
    }
    job.timer = setTimeout(() => {
      // The only way to interrupt a busy Pyodide is to kill its worker.
      discardWorker()
      job.settle({ kind: 'timeout' })
    }, PYTHON_RUN_TIME_LIMIT_MS)
    activeJob = job
    w.postMessage({ ...request, id, cdnBase: PYODIDE_CDN_BASE })
  })
}

/** Runs jobs one at a time so a slow job's time limit never covers another's. */
function enqueue(request: WorkerRequest): Promise<JobOutcome> {
  const next = queue.then(() => runJob(request))
  queue = next.catch(() => undefined)
  return next
}

/** Stops whatever Python code is running now. The next run starts a fresh runtime. */
export function stopPythonRun(): void {
  const job = activeJob
  discardWorker()
  job?.settle({ kind: 'stopped' })
}

function loadError(): FriendlyPythonError {
  return {
    title: 'Python could not start',
    detail: RUNTIME_LOAD_ERROR,
    tip: 'Check your internet connection and try again.',
    errorType: 'RuntimeLoadError',
  }
}

function timeLimitError(): FriendlyPythonError {
  const seconds = Math.round(PYTHON_RUN_TIME_LIMIT_MS / 1000)
  return {
    title: 'Code took too long',
    detail: `Your code was still running after ${seconds} seconds, so it was stopped.`,
    tip: 'Look for a loop that never ends, such as `while True:` without a `break`, or a loop condition that never becomes false.',
    errorType: 'Timeout',
  }
}

function stoppedError(): FriendlyPythonError {
  return {
    title: 'Stopped',
    detail: 'You stopped the code before it finished.',
    errorType: 'Stopped',
  }
}

async function outcomeError(outcome: Exclude<JobOutcome, { kind: 'result' }>): Promise<FriendlyPythonError> {
  if (outcome.kind === 'timeout') return timeLimitError()
  if (outcome.kind === 'stopped') return stoppedError()
  return explainPythonError(outcome.message)
}

export async function runPythonCode(source: string, stdin = ''): Promise<SandboxRunResult> {
  let outcome: JobOutcome
  try {
    outcome = await enqueue({ type: 'run', code: source, stdin })
  } catch (error: unknown) {
    return { output: '', error: error instanceof RunStoppedError ? stoppedError() : loadError() }
  }
  if (outcome.kind !== 'result') {
    return { output: '', error: await outcomeError(outcome) }
  }
  const payload = outcome.payload as RunPayload
  return {
    output: payload.output ?? '',
    error: payload.error ? await explainPythonError(payload.error) : null,
  }
}

export async function runPythonChallengeTests(
  userCode: string,
  setupCode: string | undefined,
  tests: RuntimeAssertionTest[],
): Promise<PythonChallengeRunResult> {
  let outcome: JobOutcome
  try {
    outcome = await enqueue({ type: 'tests', userCode, setupCode: setupCode ?? '', tests, stdin: '' })
  } catch (error: unknown) {
    return {
      passed: false,
      tests: [],
      error: error instanceof RunStoppedError ? stoppedError() : loadError(),
    }
  }
  if (outcome.kind !== 'result') {
    return { passed: false, tests: [], error: await outcomeError(outcome) }
  }
  const payload = outcome.payload as TestsPayload
  if (payload.error) {
    return { passed: false, tests: [], error: await explainPythonError(payload.error) }
  }
  const results = Array.isArray(payload.tests) ? payload.tests : []
  return {
    passed: results.every((t) => t.passed),
    tests: results,
    error: null,
  }
}
