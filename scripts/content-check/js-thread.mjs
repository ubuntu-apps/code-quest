/**
 * One JavaScript run for NodeJsEngine, in its own worker thread (so a run that never ends can
 * be stopped), through the app's own harness (src/features/languages/javascript/jsHarness.ts).
 */
import { parentPort, workerData } from 'node:worker_threads'
import { runJavaScript } from '../../src/features/languages/javascript/jsHarness.ts'

// As in the app's worker: no network for lesson code.
for (const name of ['fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource']) globalThis[name] = undefined

const { code, setupCode, tests } = workerData
parentPort.postMessage(await runJavaScript(code, { setupCode, ...(tests ? { tests } : {}) }))
