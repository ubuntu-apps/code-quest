import type { RuntimeAssertionTest } from '../../curriculum/content/types'
import { WEBR_CDN_BASE } from '../../../runtimeVersions'
import type { ChallengeCheckResult, CodeRunResult, FriendlyCodeError } from '../LanguagePack'
import { CodeRuntime, type RunWording } from '../runtime/CodeRuntime'
import { explainRError } from './rErrors'
import { CLEAR_GLOBALS, challengeWrapper, parseChallengeOutput } from './rHarness'

/** Pinned release (see runtimeVersions.ts): avoids `latest` drift and matches the documented API. */
const WEBR_CDN = `${WEBR_CDN_BASE}webr.mjs`

/** PostMessage works without cross-origin isolation (GitHub Pages, local Vite). */
const CHANNEL_POST_MESSAGE = 3

/** How long downloading and starting R may take the first time. */
const INIT_TIMEOUT_MS = 120_000

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

class StoppedError extends Error {}
class TimeoutError extends Error {}
class StartError extends Error {}

function withTimeout<T>(promise: Promise<T>, ms: number, error: () => Error): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(error()), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (reason: unknown) => {
        clearTimeout(timer)
        reject(reason instanceof Error ? reason : new Error(String(reason)))
      },
    )
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

const asText = (data: unknown) => (typeof data === 'string' ? data : String(data ?? ''))

/**
 * What the code printed, in order, as the R console shows it: output lines, plus
 * warnings and messages (R still runs the code after a warning).
 */
async function textFromCapture(output: CaptureOutput[]): Promise<string> {
  const lines: string[] = []
  for (const item of output) {
    if (item.type === 'stdout') lines.push(asText(item.data))
    else if (item.type === 'warning') lines.push(`Warning: ${(await conditionText(item.data)).trim()}`)
    else if (item.type === 'message') lines.push((await conditionText(item.data)).replace(/\n$/, ''))
  }
  return lines.join('\n')
}

function errorTextFromCapture(output: CaptureOutput[]): string | null {
  const errors = output.filter((item) => item.type === 'error').map((item) => asText(item.data)).filter(Boolean)
  if (errors.length > 0) return errors.join('\n')
  const stderr = output.filter((item) => item.type === 'stderr').map((item) => asText(item.data)).join('\n').trim()
  return stderr || null
}

/**
 * R on webR (R compiled to WebAssembly), in the page itself. One R is shared by every
 * WebRRuntime; it starts on first use and is thrown away after a Stop or a run that took too
 * long, since webR can't interrupt code here (the next run starts a fresh R from the cache).
 */
export class WebRRuntime extends CodeRuntime {
  private static loader: Promise<WebRInstance> | null = null

  private readonly wording: RunWording

  /** @param wording R's messages and time limit (RPack's `runWording`). */
  constructor(wording: RunWording) {
    super()
    this.wording = wording
  }

  private static async start(): Promise<WebRInstance> {
    const mod = (await import(/* @vite-ignore */ WEBR_CDN)) as WebRModule
    const webR = new mod.WebR({ channelType: mod.ChannelType?.PostMessage ?? CHANNEL_POST_MESSAGE })
    await withTimeout(webR.init(), INIT_TIMEOUT_MS, () => new StartError('R took too long to start'))
    return webR
  }

  private static webR(): Promise<WebRInstance> {
    WebRRuntime.loader ??= WebRRuntime.start().catch((error: unknown) => {
      WebRRuntime.loader = null
      throw error instanceof Error ? new StartError(error.message) : new StartError(String(error))
    })
    return WebRRuntime.loader
  }

  private static discard(): void {
    const old = WebRRuntime.loader
    WebRRuntime.loader = null
    old?.then((webR) => webR.close?.()).catch(() => undefined)
  }

  /** Starts downloading webR in the background (it is big); a failure shows on the first run. */
  preload(): void {
    void WebRRuntime.webR().catch(() => undefined)
  }

  /** Downloads and starts R, for "Download for offline". */
  async prepareOffline(): Promise<void> {
    await WebRRuntime.webR()
  }

  /** Runs code like the R console: each line's value is shown unless it is assigned. */
  async run(source: string, { signal }: RRunOptions = {}): Promise<CodeRunResult> {
    const cleared = await this.capture(CLEAR_GLOBALS, {}, signal)
    if (cleared.error) return cleared
    return this.capture(source, { withAutoprint: true }, signal)
  }

  /** A challenge's Check: its setup, the learner's code, then its tests (see rHarness.ts). */
  async check(
    userCode: string,
    setupCode: string | undefined,
    tests: RuntimeAssertionTest[],
    { signal }: RRunOptions = {},
  ): Promise<ChallengeCheckResult> {
    const result = await this.capture(challengeWrapper(userCode, setupCode, tests), {}, signal)
    if (result.error) return this.failed(result.error)
    const parsed = parseChallengeOutput(result.output, tests)
    return this.checked(parsed.tests, parsed.output)
  }

  private async capture(code: string, options: CaptureOptions, signal?: AbortSignal): Promise<CodeRunResult> {
    if (signal?.aborted) return this.ran('', this.stopped(this.wording))
    let webR: WebRInstance
    try {
      webR = await WebRRuntime.webR()
    } catch {
      return this.ran('', this.cannotStart(this.wording))
    }
    const shelter = await new webR.Shelter()
    let onAbort: (() => void) | undefined
    const stopped = new Promise<never>((_, reject) => {
      onAbort = () => reject(new StoppedError())
      signal?.addEventListener('abort', onAbort, { once: true })
    })
    try {
      const captured = await Promise.race([
        withTimeout(
          shelter.captureR(code, { captureStreams: true, captureConditions: true, ...options }),
          this.wording.runSeconds * 1000,
          () => new TimeoutError(),
        ),
        stopped,
      ])
      const errorText = errorTextFromCapture(captured.output)
      if (errorText) return this.ran('', explainRError(errorText))
      return this.ran(await textFromCapture(captured.output))
    } catch (error: unknown) {
      return this.ran('', this.interrupted(error))
    } finally {
      if (onAbort) signal?.removeEventListener('abort', onAbort)
      try {
        shelter.purge()
      } catch {
        // The runtime was thrown away.
      }
    }
  }

  /** A run that didn't finish: stopped, too long (R is probably still busy), or another failure. */
  private interrupted(error: unknown): FriendlyCodeError {
    if (error instanceof StoppedError || error instanceof TimeoutError) {
      WebRRuntime.discard()
      return error instanceof StoppedError ? this.stopped(this.wording) : this.tooLong(this.wording)
    }
    return explainRError(error instanceof Error ? error.message : 'Execution error')
  }
}
