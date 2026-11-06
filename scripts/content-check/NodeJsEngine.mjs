/**
 * Runs JavaScript for JavaScriptChecker in Node, through the app's own harness, each run in a
 * new worker thread (js-thread.mjs) like the app's new Web Worker per run. Nothing to install.
 */
import { Worker } from 'node:worker_threads'

const THREAD = new URL('./js-thread.mjs', import.meta.url)

export class NodeJsEngine {
  /** @param {number} timeoutMs How long a run may take (the app allows 10 seconds). */
  constructor(timeoutMs = 10_000) {
    this.timeoutMs = timeoutMs
  }

  async available() {
    return true
  }

  /** Runs code: { output, error } with error `{ detail }` ("ReferenceError: x is not defined"). */
  async run(code) {
    const result = await this.execute({ code })
    return { output: result.output, error: result.error ? { detail: `${result.error.name}: ${result.error.message}` } : null }
  }

  /** A challenge's Check: { passed, tests, output, error }. */
  async check(code, setupCode, tests) {
    const result = await this.execute({ code, setupCode, tests })
    if (result.error) return { passed: false, tests: result.tests ?? [], output: result.output, error: { detail: `${result.error.name}: ${result.error.message}` } }
    const list = result.tests ?? []
    return { passed: list.length > 0 && list.every((t) => t.passed), tests: list, output: result.output, error: null }
  }

  execute(job) {
    return new Promise((resolve) => {
      const worker = new Worker(THREAD, { workerData: job })
      const timer = setTimeout(() => {
        void worker.terminate()
        resolve({ output: '', error: { name: 'Timeout', message: `still running after ${this.timeoutMs / 1000} seconds` } })
      }, this.timeoutMs)
      worker.once('message', (result) => {
        clearTimeout(timer)
        void worker.terminate()
        resolve(result)
      })
      worker.once('error', (error) => {
        clearTimeout(timer)
        resolve({ output: '', error: { name: 'EngineError', message: error.message } })
      })
    })
  }
}
