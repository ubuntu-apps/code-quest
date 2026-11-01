import type { Challenge, LanguageBundle, Level } from '../curriculum/types'
import type { EditorLanguage } from './EditorLanguage'
import type { KeySpec } from './languageSpec'
import { LanguageRules } from './LanguageRules'

/**
 * One course's language. What it is like is data, in its `language.json` (labels, flags, keys,
 * samples, messages, words, colouring and "Try it" rules; see languageSpec.ts). This class
 * turns that into what the app asks for; each language's subclass (PythonPack, SqlPack, RPack)
 * adds only what has to be code: running and checking it on its runtime, and its editor support.
 * The packs are registered in ./index.ts, and the app asks `languagePack(id)` instead of
 * testing `languageId === 'python'`.
 */

/** An error from running code, explained for learners. */
export interface FriendlyCodeError {
  title: string
  detail: string
  tip?: string
  /** 1-based line and column, when known. */
  line?: number
  column?: number
  /** Python: the exception's name, such as `NameError`. */
  errorType?: string
}

/** One test of a challenge check. */
export interface ChallengeTestResult {
  id: string
  label: string
  passed: boolean
  detail?: string
  /** Both values of a failed `a == b` test, so the difference can be highlighted. */
  diff?: { expected: string; actual: string; text: boolean; table?: boolean }
}

export interface CodeRunResult {
  output: string
  error: FriendlyCodeError | null
}

export interface ChallengeCheckResult extends CodeRunResult {
  passed: boolean
  tests: ChallengeTestResult[]
}

/** What a caller can follow while code runs. */
export interface RunHandlers {
  /** Aborting stops this run only (the Stop button, or leaving the lesson). */
  signal?: AbortSignal
  /** What the run is doing, for the status line ("Downloading Python…"). */
  onStatus?: (message: string) => void
  /** Everything printed so far, while the code runs. */
  onOutput?: (outputSoFar: string) => void
}

/** A sandbox run: the open lesson (SQL runs on its database) and the Input box's lines. */
export interface RunOptions extends RunHandlers {
  level?: Level | null
  stdin?: string
}

/** A challenge's Check or Run. */
export interface ChallengeRunOptions extends RunHandlers {
  challenge: Challenge
  level: Level
}

/** A key of the phone key bar. */
export type CodeKey =
  | { label: string; aria: string; kind: 'tab' | 'untab' }
  | { label: string; aria?: string; kind: 'pair'; open: string; close: string }
  | { label: string; aria?: string; kind: 'text'; text: string }

/** A key from the JSON as the key bar's key. */
function toCodeKey(key: KeySpec): CodeKey {
  if (typeof key === 'string') return { label: key, kind: 'text', text: key }
  if ('special' in key) {
    return key.special === 'indent'
      ? { label: '⇥', aria: 'Indent', kind: 'tab' }
      : { label: '⇤', aria: 'Remove indent', kind: 'untab' }
  }
  if ('pair' in key) {
    const [open, close] = key.pair
    return { label: key.label ?? `${open} ${close}`, aria: key.aria, kind: 'pair', open, close }
  }
  return { label: key.text, aria: key.aria, kind: 'text', text: key.text }
}

export abstract class LanguagePack extends LanguageRules {
  readonly keys: readonly CodeKey[]

  /** @param json The language's language.json. */
  constructor(json: unknown) {
    super(json)
    this.keys = this.spec.keys.map(toCodeKey)
  }

  /** The runtime's status, in this language's words (`loading` → "Downloading Python…"). */
  statusMessage(status: string): string {
    return this.spec.messages.status?.[status] ?? 'Running…'
  }

  /** The status line when a sandbox run starts. */
  startMessage(): string {
    return this.spec.messages.start ?? this.statusMessage('running')
  }

  /** The status line when a challenge's Run starts. */
  runChallengeStartMessage(): string {
    return this.statusMessage('running')
  }

  // ---- Code: errors, the editor and the runtime ----

  /** One line of an error's detail, for the message under the error line in the editor. */
  abstract errorSummaryLine(detail: string): string | null

  /** The error shown when the runtime itself couldn't start. */
  runtimeFailedError(err: unknown): FriendlyCodeError {
    return {
      title: `${this.label} runtime failed`,
      detail: err instanceof Error ? err.message : `Could not start the ${this.label} runtime`,
      tip: 'Check your network connection and try again.',
    }
  }

  /** The code editor's support for this language (syntax, suggestions, indents), loaded with the editor. */
  abstract loadEditor(): Promise<EditorLanguage>

  /** Runs sandbox code. */
  abstract run(code: string, options: RunOptions): Promise<CodeRunResult>

  /** Checks a challenge's answer against its tests. */
  abstract checkChallenge(answer: string, options: ChallengeRunOptions): Promise<ChallengeCheckResult>

  /** A challenge's Run: the answer with the challenge's setup but without its tests (when `features.runChallenges`). */
  runChallenge(answer: string, options: ChallengeRunOptions): Promise<CodeRunResult> {
    void [answer, options]
    return Promise.reject(new Error(`${this.label} challenges have no Run button`))
  }

  /** Called when a lesson opens (after the page has settled), to get the runtime ready. */
  warmUp(): void {}

  /** Called when the course opens. */
  preload(): void {}

  /** Downloads the runtime (and what the course's code needs), for "Download for offline". */
  abstract prepareOffline(options: { bundle: LanguageBundle; signal?: AbortSignal }): Promise<void>
}
