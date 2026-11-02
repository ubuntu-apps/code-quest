import { LanguagePack, type RunHandlers } from '../LanguagePack'
import type { PyodideRunOptions, PyodideRuntime } from './PyodideRuntime'

/**
 * A language whose code runs on the Python worker (Pyodide): Python itself, and SQL through
 * Python's sqlite3. They share the worker, its warm-up and its run statuses (waiting,
 * downloading, running), which each language words in its language.json.
 */
export abstract class PyodidePack extends LanguagePack {
  /** The shared worker's runtime, loaded on first use. */
  protected async runtime(): Promise<PyodideRuntime> {
    return (await import('./PyodideRuntime')).pyodide
  }

  /** Starts the worker in the background, so the first Run or Check doesn't wait for it. */
  warmUp(): void {
    this.runtime()
      .then((runtime) => runtime.warmUp())
      .catch(() => undefined) // The first run shows the error.
  }

  /**
   * The runtime's options for a run, in this language's words. While checking, "running"
   * reads "Checking…"; the other statuses (downloading, waiting) are shown as they are.
   */
  protected runOptions(handlers: RunHandlers = {}, checking = false): PyodideRunOptions {
    const { signal, onStatus, onOutput } = handlers
    return {
      wording: this.runWording,
      signal,
      onStatus: onStatus && ((status) => onStatus(checking && status === 'running' ? 'Checking…' : this.statusMessage(status))),
      onOutput,
    }
  }
}
