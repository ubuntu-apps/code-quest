/**
 * The Web Worker that runs one learner's JavaScript (see JavaScriptRuntime.ts): a new one for
 * every run, so each starts fresh, and a run that never ends is stopped by ending the worker.
 * The code can't reach the network or start other workers.
 */
import { runJavaScript, type JsResult } from './jsHarness'

export interface JsJob {
  /** Only messages carrying it are the worker's own (the learner's code could post too). */
  nonce: string
  code: string
  setupCode?: string
  tests?: { id: string; label: string; assertion: string }[]
}

export type JsWorkerMessage = { nonce: string; type: 'output'; output: string } | { nonce: string; type: 'done'; result: JsResult }

const scope = self as unknown as Record<string, unknown> & { postMessage: (message: JsWorkerMessage) => void }
const post = scope.postMessage.bind(scope)

for (const name of ['fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'importScripts', 'Worker', 'SharedWorker', 'BroadcastChannel', 'indexedDB', 'caches']) {
  try {
    Object.defineProperty(scope, name, { value: undefined, configurable: false, writable: false })
  } catch {
    // Not there in this browser.
  }
}

/** Output reaches the page at most every 100 ms, so a busy loop that logs doesn't flood it. */
const THROTTLE_MS = 100

self.onmessage = (event: MessageEvent<JsJob>) => {
  const { nonce, code, setupCode, tests } = event.data
  self.onmessage = null
  let last = 0
  let timer: ReturnType<typeof setTimeout> | null = null
  let latest = ''
  const flush = () => {
    timer = null
    last = Date.now()
    post({ nonce, type: 'output', output: latest })
  }
  void runJavaScript(code, {
    setupCode,
    ...(tests ? { tests } : {}),
    onOutput: (output) => {
      latest = output
      if (timer) return
      const wait = THROTTLE_MS - (Date.now() - last)
      if (wait <= 0) flush()
      else timer = setTimeout(flush, wait)
    },
  }).then((result) => {
    if (timer) clearTimeout(timer)
    post({ nonce, type: 'done', result })
  })
}
