import type { RuntimeAssertionTest } from './types'
import { explainRError, type FriendlyRError } from './rErrorHelper'
import { WEBR_CDN_BASE } from '../../runtimeVersions'
import { CLEAR_GLOBALS, challengeWrapper, parseChallengeOutput } from './rHarness'
export type { FriendlyRError } from './rErrorHelper'

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
  close?: () => void
}

type WebRModule = {
  WebR: new (options?: { channelType?: number }) => WebRInstance
  ChannelType?: { PostMessage: number }
}

/** Lets a caller stop a run: Stop in the sandbox, or leaving the page. */
export interface RRunOptions {
  signal?: AbortSignal
}

class RRunStoppedError extends Error {}

const STOPPED_ERROR: FriendlyRError = {
  title: 'Stopped',
  detail: 'You stopped the code before it finished.',
  tip: 'If it seemed stuck, look for a loop whose condition never becomes FALSE.',
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

/**
 * Throws away the R runtime, so a run that never ends (an endless loop) can't hold up the
 * next one. webR can't interrupt code here, so the next run starts a fresh R (from the
 * browser's cache, so it's quick after the first time).
 */
function discardWebR(): void {
  const old = loaderPromise
  loaderPromise = null
  old?.then((webR) => webR.close?.()).catch(() => undefined)
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

async function captureRCode(
  code: string,
  options: CaptureOptions = {},
  signal?: AbortSignal,
): Promise<{ output: string; error: FriendlyRError | null }> {
  if (signal?.aborted) return { output: '', error: STOPPED_ERROR }
  const webR = await getWebR()
  const shelter = await new webR.Shelter()
  let onAbort: (() => void) | undefined
  const stopped = new Promise<never>((_, reject) => {
    onAbort = () => reject(new RRunStoppedError())
    signal?.addEventListener('abort', onAbort, { once: true })
  })
  try {
    const captured = await Promise.race([
      withTimeout(
        shelter.captureR(code, { captureStreams: true, captureConditions: true, ...options }),
        RUN_TIMEOUT_MS,
        'R code took too long to run, so it was stopped.',
      ),
      stopped,
    ])
    const errorText = errorTextFromCapture(captured.output)
    if (errorText) {
      return { output: '', error: explainRError(errorText) }
    }
    return { output: await textFromCapture(captured.output), error: null }
  } catch (error: unknown) {
    if (error instanceof RRunStoppedError) {
      discardWebR()
      return { output: '', error: STOPPED_ERROR }
    }
    const detail = error instanceof Error ? error.message : 'Execution error'
    // A run that timed out is probably still going, so start a fresh R for the next one.
    if (detail.includes('took too long')) discardWebR()
    return { output: '', error: explainRError(detail) }
  } finally {
    if (onAbort) signal?.removeEventListener('abort', onAbort)
    try {
      shelter.purge()
    } catch {
      // The runtime was thrown away.
    }
  }
}

/** Runs code like the R console: each line's value is shown unless it is assigned. */
export async function runRCode(source: string, options: RRunOptions = {}): Promise<SandboxRunResult> {
  await captureRCode(CLEAR_GLOBALS, {}, options.signal)
  return captureRCode(source, { withAutoprint: true }, options.signal)
}

export async function runRChallengeTests(
  userCode: string,
  setupCode: string | undefined,
  tests: RuntimeAssertionTest[],
  options: RRunOptions = {},
): Promise<RChallengeRunResult> {
  const result = await captureRCode(challengeWrapper(userCode, setupCode, tests), {}, options.signal)
  if (result.error) {
    return { passed: false, tests: [], error: result.error, output: '' }
  }
  return { ...parseChallengeOutput(result.output, tests), error: null }
}
