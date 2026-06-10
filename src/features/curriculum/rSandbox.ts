import type { RuntimeAssertionTest } from './types'
import { explainRError, type FriendlyRError } from './rErrorHelper'
export type { FriendlyRError } from './rErrorHelper'

/** Pinned release — avoid `latest` drift and match documented API. */
const WEBR_VERSION = 'v0.4.2'
const WEBR_CDN = `https://webr.r-wasm.org/${WEBR_VERSION}/webr.mjs`

/** PostMessage works without cross-origin isolation (GitHub Pages, local Vite). */
const CHANNEL_POST_MESSAGE = 3

const INIT_TIMEOUT_MS = 120_000
const RUN_TIMEOUT_MS = 45_000

type CaptureOutput = { type: string; data: unknown }

type ShelterInstance = {
  captureR: (code: string) => Promise<{ output: CaptureOutput[] }>
  purge: () => void
}

type WebRInstance = {
  init: () => Promise<unknown>
  Shelter: new () => Promise<ShelterInstance>
}

type WebRModule = {
  WebR: new (options?: { channelType?: number }) => WebRInstance
  ChannelType?: { PostMessage: number }
}

export interface SandboxRunResult {
  output: string
  error: FriendlyRError | null
}

export interface RChallengeTestResult {
  id: string
  label: string
  passed: boolean
  detail?: string
}

export interface RChallengeRunResult {
  passed: boolean
  tests: RChallengeTestResult[]
  error: FriendlyRError | null
}

let loaderPromise: Promise<WebRInstance> | null = null

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error: unknown) => {
        clearTimeout(timer)
        reject(error instanceof Error ? error : new Error(String(error)))
      },
    )
  })
}

async function loadWebRModule(): Promise<WebRModule> {
  return (await import(/* @vite-ignore */ WEBR_CDN)) as WebRModule
}

async function createWebR(): Promise<WebRInstance> {
  const mod = await loadWebRModule()
  const channelType = mod.ChannelType?.PostMessage ?? CHANNEL_POST_MESSAGE
  const webR = new mod.WebR({ channelType })
  await withTimeout(
    webR.init(),
    INIT_TIMEOUT_MS,
    'R runtime took too long to start. Check your network and try again.',
  )
  return webR
}

async function getWebR(): Promise<WebRInstance> {
  if (!loaderPromise) {
    loaderPromise = createWebR().catch((error: unknown) => {
      loaderPromise = null
      throw error
    })
  }
  return loaderPromise
}

/** Start downloading WebR in the background when the user opens R. */
export function preloadWebR(): void {
  void getWebR().catch(() => {
    /* surfaced on first Run */
  })
}

function stdoutFromCapture(output: CaptureOutput[]): string {
  return output
    .filter((item) => item.type === 'stdout')
    .map((item) => (typeof item.data === 'string' ? item.data : String(item.data ?? '')))
    .join('')
}

function errorTextFromCapture(output: CaptureOutput[]): string | null {
  const errors = output
    .filter((item) => item.type === 'error')
    .map((item) => (typeof item.data === 'string' ? item.data : String(item.data ?? '')))
    .filter(Boolean)
  if (errors.length > 0) return errors.join('\n')

  const stderr = output
    .filter((item) => item.type === 'stderr')
    .map((item) => (typeof item.data === 'string' ? item.data : String(item.data ?? '')))
    .join('\n')
    .trim()

  return stderr || null
}

function escapeRDoubleQuoted(input: string): string {
  return input.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function testsToRList(tests: RuntimeAssertionTest[]): string {
  const items = tests.map(
    (t) =>
      `list(id="${escapeRDoubleQuoted(t.id)}", label="${escapeRDoubleQuoted(t.label)}", assertion="${escapeRDoubleQuoted(t.assertion)}")`,
  )
  return `list(${items.join(', ')})`
}

async function captureRCode(code: string): Promise<{ output: string; error: FriendlyRError | null }> {
  const webR = await getWebR()
  const shelter = await new webR.Shelter()
  try {
    const captured = await withTimeout(
      shelter.captureR(code),
      RUN_TIMEOUT_MS,
      'R code took too long to run.',
    )
    const errorText = errorTextFromCapture(captured.output)
    if (errorText) {
      return { output: '', error: explainRError(errorText) }
    }
    return { output: stdoutFromCapture(captured.output), error: null }
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : 'Execution error'
    return { output: '', error: explainRError(detail) }
  } finally {
    shelter.purge()
  }
}

export async function runRCode(source: string): Promise<SandboxRunResult> {
  return captureRCode(source)
}

export async function runRChallengeTests(
  userCode: string,
  setupCode: string | undefined,
  tests: RuntimeAssertionTest[],
): Promise<RChallengeRunResult> {
  const safeSetup = escapeRDoubleQuoted(setupCode ?? '')
  const safeUser = escapeRDoubleQuoted(userCode)
  const testsLiteral = testsToRList(tests)

  const wrapped = `
local({
  env <- new.env(parent = emptyenv())
  setup <- "${safeSetup}"
  user <- "${safeUser}"
  tests <- ${testsLiteral}
  if (nzchar(trimws(setup))) {
    eval(parse(text = setup), envir = env)
  }
  env$._cq_stdout <- paste(capture.output({
    eval(parse(text = user), envir = env)
  }), collapse = "\\n")
  lines <- character(length(tests))
  for (i in seq_along(tests)) {
    t <- tests[[i]]
    passed <- FALSE
    detail <- ""
    tryCatch({
      passed <- isTRUE(eval(parse(text = t$assertion), envir = env))
      if (!passed) {
        detail <- paste0("Assertion returned FALSE: ", t$assertion)
      }
    }, error = function(e) {
      passed <<- FALSE
      detail <<- conditionMessage(e)
    })
    status <- if (passed) "PASS" else "FAIL"
    lines[i] <- paste0(t$id, "\\t", status, "\\t", detail)
  }
  cat(paste(lines, collapse = "\\n"))
  invisible(NULL)
})
`

  const result = await captureRCode(wrapped)
  if (result.error) {
    return { passed: false, tests: [], error: result.error }
  }

  const parsed = result.output
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [id, status, ...detailParts] = line.split('\t')
      const passed = status === 'PASS'
      const detail = detailParts.join('\t').trim()
      const test = tests.find((t) => t.id === id)
      return {
        id: id ?? 'unknown',
        label: test?.label ?? id ?? 'Test',
        passed,
        detail: passed ? undefined : detail || undefined,
      }
    })

  return {
    passed: parsed.length > 0 && parsed.every((t) => t.passed),
    tests: parsed,
    error: null,
  }
}
