import type { RuntimeAssertionTest } from '../../curriculum/content/types'
import { PYODIDE_CDN_BASE } from '../../../runtimeVersions'
import type { ChallengeCheckResult, ChallengeTestResult, CodeRunResult, FriendlyCodeError } from '../LanguagePack'
import { explainPythonError } from '../python/pythonErrors'
import { CodeRuntime, type RuntimeRunOptions, type RunWording } from '../runtime/CodeRuntime'
import { isCodeRuntimeSupported } from '../runtime/runtimeSupport'
import { explainSqlError, type SqlErrorPayload } from '../sql/sqlErrors'

/** How long the first download of Pyodide may take before we give up. */
const LOAD_TIME_LIMIT_MS = 120_000

/** How long downloading extra packages a run imports (e.g. pandas) may take. */
const PACKAGE_LOAD_TIME_LIMIT_MS = 120_000

/** How long "Download for offline" may spend fetching every lesson package. */
const PRELOAD_TIME_LIMIT_MS = 600_000

type RunRequest = { type: 'run'; code: string; stdin: string }
type TestsRequest = { type: 'tests'; userCode: string; setupCode: string; tests: RuntimeAssertionTest[]; stdin: string }
/** A challenge's "Run": its setup, then the learner's code, with no tests. */
type TryRequest = { type: 'try'; userCode: string; setupCode: string }
/** Downloads the packages imported by `code` without running it. */
type PreloadRequest = { type: 'preload'; code: string }
/** SQL on SQLite, through Python's sqlite3 module: the learner's SQL on a fresh copy of the lesson's database. */
type SqlRunRequest = { type: 'sql-run'; sql: string; setupSql: string }
/** A SQL challenge's Check: compared with the solution, on the lesson's rows and on other rows. */
type SqlTestsRequest = {
  type: 'sql-tests'
  sql: string
  setupSql: string
  altSetupSql: string
  solutionSql: string
  ordered: boolean
  checks: RuntimeAssertionTest[]
}
type WorkerRequest = RunRequest | TestsRequest | TryRequest | PreloadRequest | SqlRunRequest | SqlTestsRequest

/**
 * What a run is doing, for the UI:
 * - `waiting`: another run is still going (`waiting-download`: "Download for offline" is)
 * - `loading`: downloading and starting Python (first run only)
 * - `packages`: downloading packages the code imports, such as pandas
 * - `running`: the code itself is running
 */
export type PyodideStatus = 'waiting' | 'waiting-download' | 'loading' | 'packages' | 'running'

export type PyodideRunOptions = RuntimeRunOptions<PyodideStatus>

/** What the worker sends back for a run and for a check. */
type Payload = {
  output?: string
  error: string | null
  sqlError?: SqlErrorPayload | null
  tests?: ChallengeTestResult[]
}

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

type JobResult = { outcome: JobOutcome; partialOutput: string }

/** A job sent to the worker: what came back, or why nothing did. */
type Sent = { payload: Payload; partialOutput: string } | { error: FriendlyCodeError; partialOutput: string }

interface ActiveJob {
  id: number
  timer: ReturnType<typeof setTimeout> | null
  /** Output streamed so far, shown if the run doesn't finish (timeout, Stop, crash). */
  partialOutput: string
  settle: (outcome: JobOutcome) => void
  /** Called when the worker has its packages and starts running the code. */
  start: () => void
  options: PyodideRunOptions
}

/** Thrown when the learner presses Stop while the runtime is still loading. */
class RunStoppedError extends Error {}

const STOPPED: JobResult = { outcome: { kind: 'stopped' }, partialOutput: '' }

/**
 * Python on Pyodide, in a Web Worker (public/pyodide-worker.js), for Python and for SQL
 * (SQLite through Python's sqlite3). Jobs run one at a time; a run that takes too long or is
 * stopped ends by throwing the worker away, the only way to interrupt a busy Pyodide.
 */
export class PyodideRuntime extends CodeRuntime {
  private worker: Worker | null = null
  private workerReady: Promise<void> | null = null
  /** True once Python has loaded in the current worker. */
  private runtimeLoaded = false
  private rejectWorkerLoad: ((error: Error) => void) | null = null
  private activeJob: ActiveJob | null = null
  private queue: Promise<unknown> = Promise.resolve()
  private nextJobId = 1
  /** Jobs queued or running, so a new job knows it has to wait. */
  private pendingJobs = 0
  /** The kind of job that has the worker now (loading it or running). */
  private currentJobType: WorkerRequest['type'] | null = null

  // ---- Python ----

  async runPython(code: string, stdin: string, options: PyodideRunOptions): Promise<CodeRunResult> {
    return this.runResult(await this.send({ type: 'run', code, stdin }, options), code)
  }

  /**
   * Runs a challenge answer the way a check does (same setup, so sample files and typed
   * answers for input() are there) but without its tests, to see what it prints.
   */
  async tryPython(userCode: string, setupCode: string | undefined, options: PyodideRunOptions): Promise<CodeRunResult> {
    return this.runResult(await this.send({ type: 'try', userCode, setupCode: setupCode ?? '' }, options), userCode)
  }

  async checkPython(
    userCode: string,
    setupCode: string | undefined,
    tests: RuntimeAssertionTest[],
    options: PyodideRunOptions,
  ): Promise<ChallengeCheckResult> {
    const request: TestsRequest = { type: 'tests', userCode, setupCode: setupCode ?? '', tests, stdin: '' }
    return this.checkResult(await this.send(request, options), userCode)
  }

  // ---- SQL ----

  /** Runs the learner's SQL on a fresh database made by `setupSql`, and shows each result as a table. */
  async runSql(sql: string, setupSql: string, options: PyodideRunOptions): Promise<CodeRunResult> {
    return this.runResult(await this.send({ type: 'sql-run', sql, setupSql }, options), sql)
  }

  /**
   * A SQL challenge's Check: the learner's SQL is compared with the solution's result on the
   * lesson's data and, with `altSetupSql`, on the same tables with other rows. `checks` are
   * queries run on both databases afterwards (for statements that change data).
   */
  async checkSql(
    sql: string,
    spec: { setupSql: string; altSetupSql?: string; solutionSql: string; ordered?: boolean; checks?: RuntimeAssertionTest[] },
    options: PyodideRunOptions,
  ): Promise<ChallengeCheckResult> {
    const request: SqlTestsRequest = {
      type: 'sql-tests',
      sql,
      setupSql: spec.setupSql,
      altSetupSql: spec.altSetupSql ?? '',
      solutionSql: spec.solutionSql,
      ordered: spec.ordered ?? false,
      checks: spec.checks ?? [],
    }
    return this.checkResult(await this.send(request, options), sql)
  }

  // ---- The runtime ----

  /**
   * Starts downloading and starting Python in the background, so the learner's first
   * Run or Check doesn't wait for it. Skipped on data-saver and very slow connections,
   * and when this browser can't run Python; a failure is silent (the first run retries).
   */
  warmUp(): void {
    if (this.worker || !isCodeRuntimeSupported()) return
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
    if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? '')) return
    this.ensureWorker().catch(() => undefined)
  }

  /**
   * Downloads the runtime plus every package that `code` imports, so they are cached for
   * offline use. Throws an Error with a learner-friendly message.
   */
  async prepareOffline(code: string, { label }: RunWording, signal?: AbortSignal): Promise<void> {
    let outcome: JobOutcome
    try {
      outcome = (await this.enqueue({ type: 'preload', code }, { signal })).outcome
    } catch (error: unknown) {
      throw new Error(error instanceof RunStoppedError ? 'The download was stopped.' : `Could not download ${label}. Check your internet connection and try again.`, {
        cause: error,
      })
    }
    if (outcome.kind === 'result') return
    if (outcome.kind === 'stopped') throw new Error('The download was stopped.')
    if (outcome.kind === 'crash' || outcome.kind === 'package-error') {
      throw new Error(`Could not download what ${label} needs. Check your internet connection and try again.`)
    }
    throw new Error(`Downloading ${label} took too long. Check your internet connection and try again.`)
  }

  // ---- Turning what the worker sent into results ----

  /** Sends a job and waits for it: the worker's payload, or a friendly error for why there is none. */
  private async send(request: WorkerRequest, options: PyodideRunOptions): Promise<Sent> {
    let result: JobResult
    try {
      result = await this.enqueue(request, options)
    } catch (error: unknown) {
      const why = error instanceof RunStoppedError ? this.stopped(options.wording) : this.cannotStart(options.wording)
      return { error: why, partialOutput: '' }
    }
    const { outcome, partialOutput } = result
    if (outcome.kind === 'result') return { payload: outcome.payload as Payload, partialOutput }
    return { error: await this.outcomeError(outcome, options.wording), partialOutput }
  }

  private async outcomeError(outcome: Exclude<JobOutcome, { kind: 'result' }>, wording: RunWording): Promise<FriendlyCodeError> {
    switch (outcome.kind) {
      case 'timeout':
        return this.tooLong(wording)
      case 'package-timeout':
        return this.packageFailed(wording, true)
      case 'package-error':
        return this.packageFailed(wording, false)
      case 'stopped':
        return this.stopped(wording)
      case 'crash':
        return explainPythonError(outcome.message)
    }
  }

  /** The learner's error: SQLite's (with the line of the statement in `code`) or Python's. */
  private async codeError(payload: Payload, code: string): Promise<FriendlyCodeError | null> {
    if (payload.sqlError) return explainSqlError(payload.sqlError, code)
    if (payload.error) return explainPythonError(payload.error)
    return null
  }

  /** A Run: what was printed. A run that was cut off still shows what it printed, to help find a runaway loop. */
  private async runResult(sent: Sent, code: string): Promise<CodeRunResult> {
    if ('error' in sent) return this.ran(sent.partialOutput, sent.error)
    return this.ran(sent.payload.output ?? '', await this.codeError(sent.payload, code))
  }

  private async checkResult(sent: Sent, code: string): Promise<ChallengeCheckResult> {
    if ('error' in sent) return this.failed(sent.error)
    const output = typeof sent.payload.output === 'string' ? sent.payload.output : ''
    const error = await this.codeError(sent.payload, code)
    if (error) return this.failed(error, output)
    return this.checked(Array.isArray(sent.payload.tests) ? sent.payload.tests : [], output)
  }

  // ---- The worker ----

  private workerUrl(): string {
    const base = import.meta.env.BASE_URL
    return `${base.endsWith('/') ? base : `${base}/`}pyodide-worker.js`
  }

  private discardWorker(): void {
    this.worker?.terminate()
    this.worker = null
    this.workerReady = null
    this.runtimeLoaded = false
    // A terminated worker never reports back, so settle a pending load here
    // instead of leaving every later run waiting on it.
    const rejectLoad = this.rejectWorkerLoad
    this.rejectWorkerLoad = null
    rejectLoad?.(new RunStoppedError('Stopped while loading'))
  }

  private handleWorkerMessage(reply: WorkerReply): void {
    if (!('id' in reply)) return
    const job = this.activeJob
    if (!job || job.id !== reply.id) return
    switch (reply.type) {
      case 'loading-packages':
        job.options.onStatus?.('packages')
        return
      case 'started':
        job.start()
        job.options.onStatus?.('running')
        return
      case 'output':
        job.partialOutput += reply.text
        job.options.onOutput?.(job.partialOutput)
        return
      case 'result':
        job.settle({ kind: 'result', payload: reply.payload })
        return
      case 'package-error':
        job.settle({ kind: 'package-error' })
        return
      case 'crash':
        // A JavaScript-level failure can leave Pyodide unusable, so start fresh next time.
        this.discardWorker()
        job.settle({ kind: 'crash', message: reply.message })
    }
  }

  /** Starts (or reuses) the worker and resolves once Pyodide has loaded inside it. */
  private ensureWorker(): Promise<void> {
    if (this.worker && this.workerReady) return this.workerReady
    const w = new Worker(this.workerUrl())
    this.worker = w
    const loadFailed = () => new Error('Could not load Pyodide')
    const ready = new Promise<void>((resolve, reject) => {
      const loadTimer = setTimeout(() => fail(loadFailed()), LOAD_TIME_LIMIT_MS)
      const finish = () => {
        clearTimeout(loadTimer)
        w.removeEventListener('message', onInit)
        if (this.rejectWorkerLoad === fail) this.rejectWorkerLoad = null
      }
      const fail = (error: Error) => {
        finish()
        reject(error)
      }
      const onInit = (event: MessageEvent<WorkerReply>) => {
        if (event.data.type === 'ready') {
          finish()
          if (this.worker === w) this.runtimeLoaded = true
          resolve()
        } else if (event.data.type === 'load-error') {
          fail(loadFailed())
        }
      }
      this.rejectWorkerLoad = fail
      w.addEventListener('message', onInit)
      w.addEventListener('error', () => fail(loadFailed()), { once: true })
    })
    this.workerReady = ready
    w.addEventListener('message', (event: MessageEvent<WorkerReply>) => this.handleWorkerMessage(event.data))
    w.postMessage({ type: 'init', cdnBase: PYODIDE_CDN_BASE })
    // A failed load must not poison later attempts (e.g. the learner comes back online).
    ready.catch(() => {
      if (this.worker === w) this.discardWorker()
    })
    return ready
  }

  private async runJob(request: WorkerRequest, options: Partial<PyodideRunOptions>): Promise<JobResult> {
    const { signal, onStatus } = options
    if (signal?.aborted) return STOPPED
    if (!this.runtimeLoaded) onStatus?.('loading')
    // Stopping while Python loads: discardWorker() rejects the load with RunStoppedError.
    const stopLoad = () => this.discardWorker()
    signal?.addEventListener('abort', stopLoad, { once: true })
    try {
      await this.ensureWorker()
    } finally {
      signal?.removeEventListener('abort', stopLoad)
    }
    const w = this.worker
    if (!w || signal?.aborted) return STOPPED
    const id = this.nextJobId++
    const runLimitMs = (options.wording?.runSeconds ?? 10) * 1000
    return new Promise<JobResult>((resolve) => {
      // The only way to interrupt a busy Pyodide is to kill its worker.
      const limit = (ms: number, outcome: JobOutcome) => {
        if (job.timer) clearTimeout(job.timer)
        job.timer = setTimeout(() => {
          this.discardWorker()
          job.settle(outcome)
        }, ms)
      }
      const stop = () => {
        if (this.activeJob !== job) return
        this.discardWorker()
        job.settle({ kind: 'stopped' })
      }
      const job: ActiveJob = {
        id,
        timer: null,
        partialOutput: '',
        options: options as PyodideRunOptions,
        settle: (outcome) => {
          if (job.timer) clearTimeout(job.timer)
          signal?.removeEventListener('abort', stop)
          if (this.activeJob === job) this.activeJob = null
          resolve({ outcome, partialOutput: job.partialOutput })
        },
        start: () => limit(runLimitMs, { kind: 'timeout' }),
      }
      // First the worker downloads any packages the code imports, then the run limit applies.
      limit(request.type === 'preload' ? PRELOAD_TIME_LIMIT_MS : PACKAGE_LOAD_TIME_LIMIT_MS, { kind: 'package-timeout' })
      this.activeJob = job
      signal?.addEventListener('abort', stop, { once: true })
      if (request.type !== 'preload') onStatus?.('running')
      w.postMessage({ ...request, id, cdnBase: PYODIDE_CDN_BASE })
    })
  }

  /**
   * Runs jobs one at a time so a slow job's time limit never covers another's.
   * A job stopped while it waits its turn settles at once and never runs.
   */
  private enqueue(request: WorkerRequest, options: Partial<PyodideRunOptions>): Promise<JobResult> {
    const { signal, onStatus } = options
    if (signal?.aborted) return Promise.resolve(STOPPED)
    if (this.pendingJobs > 0) onStatus?.(this.currentJobType === 'preload' ? 'waiting-download' : 'waiting')
    this.pendingJobs += 1

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

    const run = this.queue
      .then(async () => {
        started = true
        signal?.removeEventListener('abort', dropWhileWaiting)
        if (dropped) return STOPPED
        this.currentJobType = request.type
        try {
          return await this.runJob(request, options)
        } finally {
          this.currentJobType = null
        }
      })
      .finally(() => {
        this.pendingJobs -= 1
      })
    this.queue = run.catch(() => undefined)
    return Promise.race([run, droppedResult])
  }
}

/** The one Pyodide worker, shared by Python and SQL. */
export const pyodide = new PyodideRuntime()
