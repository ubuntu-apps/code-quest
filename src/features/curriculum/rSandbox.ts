import type { RuntimeAssertionTest } from './types'
import { explainRError, type FriendlyRError } from './rErrorHelper'
export type { FriendlyRError } from './rErrorHelper'

import { WEBR_CDN_BASE } from '../../runtimeVersions'

/** Pinned release (see runtimeVersions.ts): avoids `latest` drift and matches the documented API. */
const WEBR_CDN = `${WEBR_CDN_BASE}webr.mjs`

/** PostMessage works without cross-origin isolation (GitHub Pages, local Vite). */
const CHANNEL_POST_MESSAGE = 3

const INIT_TIMEOUT_MS = 120_000
const RUN_TIMEOUT_MS = 45_000

type CaptureOutput = { type: string; data: unknown }

type CaptureOptions = { withAutoprint?: boolean; captureStreams?: boolean; captureConditions?: boolean }

type ShelterInstance = {
  captureR: (code: string, options?: CaptureOptions) => Promise<{ output: CaptureOutput[] }>
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
  /** What the learner's code printed, as the console would show it. */
  output: string
}

/** Separates the learner's output from the test results in a check's output. */
const TESTS_MARKER = '<<codequest-tests>>'

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

/** Downloads and starts the R runtime (used by "Download for offline"). */
export async function prepareROffline(): Promise<void> {
  await getWebR()
}

/** Start downloading WebR in the background when the user opens R. */
export function preloadWebR(): void {
  void getWebR().catch(() => {
    /* surfaced on first Run */
  })
}

/** The text of a captured warning or message (an R condition object). */
async function conditionText(data: unknown): Promise<string> {
  if (typeof data === 'string') return data
  try {
    const condition = data as { get: (name: string) => Promise<{ toString: () => Promise<string> }> }
    return await (await condition.get('message')).toString()
  } catch {
    return ''
  }
}

/**
 * What the code printed, in order, as the R console shows it: output lines, plus
 * warnings and messages (R still runs the code after a warning).
 */
async function textFromCapture(output: CaptureOutput[]): Promise<string> {
  const lines: string[] = []
  for (const item of output) {
    if (item.type === 'stdout') lines.push(typeof item.data === 'string' ? item.data : String(item.data ?? ''))
    else if (item.type === 'warning') lines.push(`Warning: ${(await conditionText(item.data)).trim()}`)
    else if (item.type === 'message') lines.push((await conditionText(item.data)).replace(/\n$/, ''))
  }
  return lines.join('\n')
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

async function captureRCode(
  code: string,
  options: CaptureOptions = {},
): Promise<{ output: string; error: FriendlyRError | null }> {
  const webR = await getWebR()
  const shelter = await new webR.Shelter()
  try {
    const captured = await withTimeout(
      shelter.captureR(code, { captureStreams: true, captureConditions: true, ...options }),
      RUN_TIMEOUT_MS,
      'R code took too long to run.',
    )
    const errorText = errorTextFromCapture(captured.output)
    if (errorText) {
      return { output: '', error: explainRError(errorText) }
    }
    return { output: await textFromCapture(captured.output), error: null }
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : 'Execution error'
    return { output: '', error: explainRError(detail) }
  } finally {
    shelter.purge()
  }
}

/** Clears variables left by earlier runs, so each run starts fresh, like a new R session. */
const CLEAR_GLOBALS = 'rm(list = ls(envir = globalenv(), all.names = TRUE), envir = globalenv())'

/** Runs code like the R console: each line's value is shown unless it is assigned. */
export async function runRCode(source: string): Promise<SandboxRunResult> {
  await captureRCode(CLEAR_GLOBALS)
  return captureRCode(source, { withAutoprint: true })
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
  # The learner's code runs in its own environment, which sees R's functions but not
  # variables left in the global environment by the sandbox.
  env <- new.env(parent = parent.env(globalenv()))
  setup <- "${safeSetup}"
  user <- "${safeUser}"
  tests <- ${testsLiteral}
  if (nzchar(trimws(setup))) {
    eval(parse(text = setup), envir = env)
  }
  # Tests can look at the code itself (to check a function was used) and at its output.
  env$._cq_code <- user
  # Like the console: every top-level value is printed unless it is assigned.
  env$._cq_stdout <- paste(capture.output({
    for (expr in parse(text = user)) {
      res <- withVisible(eval(expr, envir = env))
      if (res$visible) print(res$value)
    }
  }), collapse = "\\n")
  cat(env$._cq_stdout, "\\n${TESTS_MARKER}\\n", sep = "")
  lines <- character(length(tests))
  for (i in seq_along(tests)) {
    t <- tests[[i]]
    passed <- FALSE
    detail <- ""
    tryCatch({
      # A failed check shows just its label; an error inside it (such as a variable the
      # learner hasn't made yet, "object 'total' not found") is shown as the reason.
      passed <- isTRUE(eval(parse(text = t$assertion), envir = env))
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
    return { passed: false, tests: [], error: result.error, output: '' }
  }

  const markerAt = result.output.lastIndexOf(TESTS_MARKER)
  const learnerOutput = markerAt >= 0 ? result.output.slice(0, markerAt).replace(/\n+$/, '') : ''
  const parsed = result.output
    .slice(markerAt >= 0 ? markerAt + TESTS_MARKER.length : 0)
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
        label: test?.label ?? id ?? 'Check',
        passed,
        detail: passed ? undefined : detail || undefined,
      }
    })

  return {
    passed: parsed.length > 0 && parsed.every((t) => t.passed),
    tests: parsed,
    error: null,
    output: learnerOutput,
  }
}
