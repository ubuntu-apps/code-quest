import type { RuntimeAssertionTest } from './types'
import { explainPythonError, type FriendlyPythonError } from './pythonErrorHelper'
export type { FriendlyPythonError } from './pythonErrorHelper'

import { PYODIDE_CDN_BASE } from '../../runtimeVersions'

/** How long learner code may run before it is stopped (infinite-loop guard). */
export const PYTHON_RUN_TIME_LIMIT_MS = 10_000

/** How long the first download of the Python runtime may take before we give up. */
const PYTHON_LOAD_TIME_LIMIT_MS = 120_000

/** How long downloading extra packages a run imports (e.g. pandas) may take. */
const PACKAGE_LOAD_TIME_LIMIT_MS = 120_000

/** How long "Download for offline" may spend fetching every lesson package. */
const PRELOAD_TIME_LIMIT_MS = 600_000

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
/** Downloads the packages imported by `code` without running it. */
type PreloadRequest = { type: 'preload'; code: string }
type WorkerRequest = RunRequest | TestsRequest | PreloadRequest

/**
 * What a run is doing, for the UI:
 * - `waiting`: another run is still going (`waiting-download`: "Download for offline" is)
 * - `loading`: downloading and starting Python (first run only)
 * - `packages`: downloading packages the code imports, such as pandas
 * - `running`: the code itself is running
 */
export type PythonRunStatus = 'waiting' | 'waiting-download' | 'loading' | 'packages' | 'running'

export interface PythonRunOptions {
  onStatus?: (status: PythonRunStatus) => void
  /** Called with everything printed so far, while the code runs. */
  onOutput?: (outputSoFar: string) => void
  /** Aborting stops this run only: a queued run is dropped, a running one is stopped. */
  signal?: AbortSignal
}

type RunPayload = { output: string; error: string | null }
type TestsPayload = { tests: PythonChallengeTestResult[]; error: string | null }

type WorkerReply =
  | { type: 'ready' }
  | { type: 'load-error'; message: string }
  | { id: number; type: 'loading-packages' }
  | { id: number; type: 'started' }
  | { id: number; type: 'output'; text: string }
  | { id: number; type: 'result'; payload: unknown }
  | { id: number; type: 'crash'; message: string }
  | { id: number; type: 'package-error'; message: string }

type JobOutcome =
  | { kind: 'result'; payload: unknown }
  | { kind: 'crash'; message: string }
  | { kind: 'timeout' }
  | { kind: 'package-timeout' }
  | { kind: 'package-error' }
  | { kind: 'stopped' }

interface ActiveJob {
  id: number
  timer: ReturnType<typeof setTimeout> | null
  /** Output streamed so far, shown if the run doesn't finish (timeout, Stop, crash). */
  partialOutput: string
  settle: (outcome: JobOutcome) => void
  /** Called when the worker has its packages and starts running the code. */
  start: () => void
  options: PythonRunOptions
}

/** Thrown when the learner presses Stop while the runtime is still loading. */
class RunStoppedError extends Error {}

let worker: Worker | null = null
let workerReady: Promise<void> | null = null
/** True once Python has loaded in the current worker. */
let runtimeLoaded = false
let rejectWorkerLoad: ((error: Error) => void) | null = null
let activeJob: ActiveJob | null = null
let queue: Promise<unknown> = Promise.resolve()
let nextJobId = 1
/** Jobs queued or running, so a new job knows it has to wait. */
let pendingJobs = 0
/** The kind of job that has the worker now (loading it or running). */
let currentJobType: WorkerRequest['type'] | null = null

function workerUrl(): string {
  const base = import.meta.env.BASE_URL
  return `${base.endsWith('/') ? base : `${base}/`}pyodide-worker.js`
}

function discardWorker(): void {
  worker?.terminate()
  worker = null
  workerReady = null
  runtimeLoaded = false
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
  if (reply.type === 'loading-packages') {
    job.options.onStatus?.('packages')
    return
  }
  if (reply.type === 'started') {
    job.start()
    job.options.onStatus?.('running')
    return
  }
  if (reply.type === 'output') {
    job.partialOutput += reply.text
    job.options.onOutput?.(job.partialOutput)
    return
  }
  if (reply.type === 'result') {
    job.settle({ kind: 'result', payload: reply.payload })
    return
  }
  if (reply.type === 'package-error') {
    job.settle({ kind: 'package-error' })
    return
  }
  // A JavaScript-level failure can leave Pyodide unusable, so start fresh next time.
  discardWorker()
  job.settle({ kind: 'crash', message: reply.message })
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
        if (worker === w) runtimeLoaded = true
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

type JobResult = { outcome: JobOutcome; partialOutput: string }

const STOPPED: JobResult = { outcome: { kind: 'stopped' }, partialOutput: '' }

async function runJob(request: WorkerRequest, options: PythonRunOptions): Promise<JobResult> {
  const { signal, onStatus } = options
  if (signal?.aborted) return STOPPED
  if (!runtimeLoaded) onStatus?.('loading')
  // Stopping while Python loads: discardWorker() rejects the load with RunStoppedError.
  const stopLoad = () => discardWorker()
  signal?.addEventListener('abort', stopLoad, { once: true })
  try {
    await ensureWorker()
  } finally {
    signal?.removeEventListener('abort', stopLoad)
  }
  const w = worker
  if (!w || signal?.aborted) return STOPPED
  const id = nextJobId++
  return new Promise<JobResult>((resolve) => {
    // The only way to interrupt a busy Pyodide is to kill its worker.
    const limit = (ms: number, outcome: JobOutcome) => {
      if (job.timer) clearTimeout(job.timer)
      job.timer = setTimeout(() => {
        discardWorker()
        job.settle(outcome)
      }, ms)
    }
    const stop = () => {
      if (activeJob !== job) return
      discardWorker()
      job.settle({ kind: 'stopped' })
    }
    const job: ActiveJob = {
      id,
      timer: null,
      partialOutput: '',
      options,
      settle: (outcome) => {
        if (job.timer) clearTimeout(job.timer)
        signal?.removeEventListener('abort', stop)
        if (activeJob === job) activeJob = null
        resolve({ outcome, partialOutput: job.partialOutput })
      },
      start: () => limit(PYTHON_RUN_TIME_LIMIT_MS, { kind: 'timeout' }),
    }
    // First the worker downloads any packages the code imports, then the run limit applies.
    limit(request.type === 'preload' ? PRELOAD_TIME_LIMIT_MS : PACKAGE_LOAD_TIME_LIMIT_MS, { kind: 'package-timeout' })
    activeJob = job
    signal?.addEventListener('abort', stop, { once: true })
    if (request.type !== 'preload') onStatus?.('running')
    w.postMessage({ ...request, id, cdnBase: PYODIDE_CDN_BASE })
  })
}

/**
 * Runs jobs one at a time so a slow job's time limit never covers another's.
 * A job stopped while it waits its turn settles at once and never runs.
 */
function enqueue(request: WorkerRequest, options: PythonRunOptions = {}): Promise<JobResult> {
  const { signal, onStatus } = options
  if (signal?.aborted) return Promise.resolve(STOPPED)
  if (pendingJobs > 0) onStatus?.(currentJobType === 'preload' ? 'waiting-download' : 'waiting')
  pendingJobs += 1

  let started = false
  let dropped = false
  let resolveDropped: (result: JobResult) => void = () => {}
  const droppedResult = new Promise<JobResult>((resolve) => {
    resolveDropped = resolve
  })
  const dropWhileWaiting = () => {
    if (started) return
    dropped = true
    resolveDropped(STOPPED)
  }
  signal?.addEventListener('abort', dropWhileWaiting, { once: true })

  const run = queue
    .then(async () => {
      started = true
      signal?.removeEventListener('abort', dropWhileWaiting)
      if (dropped) return STOPPED
      currentJobType = request.type
      try {
        return await runJob(request, options)
      } finally {
        currentJobType = null
      }
    })
    .finally(() => {
      pendingJobs -= 1
    })
  queue = run.catch(() => undefined)
  return Promise.race([run, droppedResult])
}

/**
 * Downloads the Python runtime plus every package that `lessonCode` imports, so
 * they are cached for offline use. Throws an Error with a learner-friendly message.
 */
export async function preparePythonOffline(lessonCode: string, signal?: AbortSignal): Promise<void> {
  let outcome: JobOutcome
  try {
    outcome = (await enqueue({ type: 'preload', code: lessonCode }, { signal })).outcome
  } catch (error: unknown) {
    throw new Error(error instanceof RunStoppedError ? 'The download was stopped.' : RUNTIME_LOAD_ERROR, {
      cause: error,
    })
  }
  if (outcome.kind === 'result') return
  if (outcome.kind === 'stopped') throw new Error('The download was stopped.')
  if (outcome.kind === 'crash' || outcome.kind === 'package-error') {
    throw new Error('Could not download the Python packages. Check your internet connection and try again.')
  }
  throw new Error('Downloading Python took too long. Check your internet connection and try again.')
}

/** What to show while a run is in a given state. */
export function pythonStatusMessage(status: PythonRunStatus): string {
  switch (status) {
    case 'waiting':
      return 'Waiting for the previous run to finish…'
    case 'waiting-download':
      return 'Waiting for "Download for offline" to finish…'
    case 'loading':
      return 'Downloading Python (first run only, about 10 MB)…'
    case 'packages':
      return 'Downloading the packages this code uses, such as pandas (first time only)…'
    case 'running':
      return 'Running…'
  }
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
  if (outcome.kind === 'package-timeout') {
    return {
      title: 'Python packages took too long to download',
      detail: 'This code imports a package (such as pandas) that has to be downloaded first, and the download did not finish.',
      tip: 'Check your internet connection and run the code again.',
      errorType: 'PackageTimeout',
    }
  }
  if (outcome.kind === 'package-error') {
    return {
      title: 'Could not download a Python package',
      detail: 'This code imports a package (such as pandas or sqlite3) that has to be downloaded first, and the download failed.',
      tip: 'Check your internet connection and run the code again.',
      errorType: 'PackageError',
    }
  }
  if (outcome.kind === 'stopped') return stoppedError()
  return explainPythonError(outcome.message)
}

export async function runPythonCode(
  source: string,
  stdin = '',
  options: PythonRunOptions = {},
): Promise<SandboxRunResult> {
  let outcome: JobOutcome
  let partialOutput: string
  try {
    ;({ outcome, partialOutput } = await enqueue({ type: 'run', code: source, stdin }, options))
  } catch (error: unknown) {
    return { output: '', error: error instanceof RunStoppedError ? stoppedError() : loadError() }
  }
  if (outcome.kind !== 'result') {
    // Show what was printed before the run was cut off; it helps find a runaway loop.
    return { output: partialOutput, error: await outcomeError(outcome) }
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
  options: PythonRunOptions = {},
): Promise<PythonChallengeRunResult> {
  let outcome: JobOutcome
  try {
    outcome = (
      await enqueue({ type: 'tests', userCode, setupCode: setupCode ?? '', tests, stdin: '' }, options)
    ).outcome
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
    // A challenge with no tests can't be passed (it would accept any code).
    passed: results.length > 0 && results.every((t) => t.passed),
    tests: results,
    error: null,
  }
}
