import type { PythonRunOptions } from '../curriculum/pythonSandbox'
import { LanguagePack, type RunHandlers } from './LanguagePack'

/** The Python worker's module, loaded on first use. */
export const pyodideRuntime = () => import('../curriculum/pythonSandbox')

/**
 * A language whose code runs on the Python worker (Pyodide): Python itself, and SQL through
 * Python's sqlite3. They share the worker's warm-up and its run statuses (waiting,
 * downloading, running), which each language words in its language.json.
 */
export abstract class PyodidePack extends LanguagePack {
  /** Starts the worker in the background, so the first Run or Check doesn't wait for it. */
  warmUp(): void {
    void pyodideRuntime().then((runtime) => runtime.warmUpPython())
  }

  /**
   * The worker's options for a run. While checking, "running" reads "Checking…"; the
   * other statuses (downloading, waiting) are shown as they are.
   */
  protected workerOptions(handlers: RunHandlers = {}, checking = false): PythonRunOptions {
    const { signal, onStatus, onOutput } = handlers
    return {
      signal,
      onStatus: onStatus && ((status) => onStatus(checking && status === 'running' ? 'Checking…' : this.statusMessage(status))),
      onOutput,
    }
  }
}
