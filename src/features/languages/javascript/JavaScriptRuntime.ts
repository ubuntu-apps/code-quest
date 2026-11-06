import type { RuntimeAssertionTest } from '../../curriculum/content/types'
import type { ChallengeCheckResult, CodeRunResult } from '../LanguagePack'
import { CodeRuntime, type RunWording } from '../runtime/CodeRuntime'
import { explainJsError } from './jsErrors'
import type { JsResult } from './jsHarness'
import type { JsJob, JsWorkerMessage } from './jsWorker'

export interface JsRuntimeRunOptions {
  setupCode?: string
  signal?: AbortSignal
  onOutput?: (outputSoFar: string) => void
}

type Outcome = { kind: 'done'; result: JsResult } | { kind: 'stopped' | 'tooLong' | 'died'; output: string }

/**
 * JavaScript in a Web Worker (jsWorker.ts): the browser's own JavaScript engine, so there is
 * nothing to download. Every run gets a new worker, so it starts fresh; a Stop, or code still
 * running after the time limit, ends the worker.
 */
export class JavaScriptRuntime extends CodeRuntime {
  private readonly wording: RunWording

  /** @param wording JavaScript's messages and time limit (JavaScriptPack's `runWording`). */
  constructor(wording: RunWording) {
    super()
    this.wording = wording
  }

  /** Runs code: what it logs, or its error. */
  async run(code: string, options: JsRuntimeRunOptions = {}): Promise<CodeRunResult> {
    const outcome = await this.execute({ code, ...(options.setupCode ? { setupCode: options.setupCode } : {}) }, options)
    if (outcome.kind !== 'done') return this.ran(outcome.output, this.interrupted(outcome.kind))
    const { output, error } = outcome.result
    return this.ran(output, error ? explainJsError(error) : null)
  }

  /** A challenge's Check: its setup, the learner's code, then its tests (see jsHarness.ts). */
  async check(code: string, setupCode: string | undefined, tests: RuntimeAssertionTest[], options: JsRuntimeRunOptions = {}): Promise<ChallengeCheckResult> {
    const outcome = await this.execute({ code, ...(setupCode ? { setupCode } : {}), tests }, options)
    if (outcome.kind !== 'done') return this.failed(this.interrupted(outcome.kind), outcome.output)
    const { output, error, tests: results = [] } = outcome.result
    if (error) return this.failed(explainJsError(error), output)
    return this.checked(results, output)
  }

  private interrupted(kind: 'stopped' | 'tooLong' | 'died') {
    return kind === 'stopped' ? this.stopped(this.wording) : kind === 'tooLong' ? this.tooLong(this.wording) : this.died(this.wording)
  }

  private execute(job: Omit<JsJob, 'nonce'>, { signal, onOutput }: JsRuntimeRunOptions): Promise<Outcome> {
    return new Promise((resolve) => {
      if (signal?.aborted) return resolve({ kind: 'stopped', output: '' })
      const nonce = crypto.getRandomValues(new Uint32Array(4)).join('-')
      let output = ''
      const worker = new Worker(new URL('./jsWorker.ts', import.meta.url), { type: 'module', name: 'codequest-javascript' })
      const finish = (outcome: Outcome) => {
        clearTimeout(timer)
        signal?.removeEventListener('abort', onAbort)
        worker.terminate()
        resolve(outcome)
      }
      const onAbort = () => finish({ kind: 'stopped', output })
      const timer = setTimeout(() => finish({ kind: 'tooLong', output }), this.wording.runSeconds * 1000)
      signal?.addEventListener('abort', onAbort, { once: true })
      worker.onmessage = (event: MessageEvent<JsWorkerMessage>) => {
        const message = event.data
        if (!message || message.nonce !== nonce) return
        if (message.type === 'output') {
          output = message.output
          onOutput?.(output)
        } else finish({ kind: 'done', result: message.result })
      }
      worker.onerror = (event) => {
        event.preventDefault()
        finish({ kind: 'died', output })
      }
      worker.postMessage({ nonce, ...job } satisfies JsJob)
    })
  }
}
