import type { Challenge, LanguageBundle, Level, SandboxSnippet } from '../curriculum/types'
import type { EditorLanguage } from './EditorLanguage'
import { Highlighter, type Token } from './Highlighter'
import { parseLanguageSpec, toRegExp, type KeySpec, type LanguageSpec } from './languageSpec'

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

/** A fenced code block from lesson markdown, with its info string (```text …) if it has one. */
export interface FenceBlock {
  content: string
  lang?: string
}

/** Fences marked as sample output never get a "Try it" button. */
const OUTPUT_LANGS = new Set(['text', 'output'])

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

export abstract class LanguagePack {
  /** The language's language.json, checked. */
  readonly spec: LanguageSpec
  readonly keys: readonly CodeKey[]
  private readonly highlighter: Highlighter
  private readonly tryIt: { firstLine: RegExp | null; codeLines: RegExp[]; notCodeLines: RegExp[]; errorDemo: RegExp | null }

  /** @param json The language's language.json. */
  constructor(json: unknown) {
    this.spec = parseLanguageSpec(json)
    this.keys = this.spec.keys.map(toCodeKey)
    this.highlighter = new Highlighter(this.spec)
    const { firstLine, codeLines = [], notCodeLines = [], errorDemo } = this.spec.tryIt
    this.tryIt = {
      firstLine: firstLine ? toRegExp(firstLine) : null,
      codeLines: codeLines.map(toRegExp),
      notCodeLines: notCodeLines.map(toRegExp),
      errorDemo: errorDemo ? new RegExp(errorDemo, 'i') : null,
    }
  }

  // ---- From language.json ----

  /** Course id: the folder under public/content, and the key of saved progress. */
  get id(): string {
    return this.spec.id
  }

  /** Shown in the sandbox ("You can try some R code here"). */
  get label(): string {
    return this.spec.label
  }

  /** The validation mode of this language's challenges, as written in the lesson JSON. */
  get testMode() {
    return this.spec.testMode
  }

  get canRunChallenges(): boolean {
    return this.spec.features.runChallenges
  }

  get readsInput(): boolean {
    return this.spec.features.readsInput
  }

  get tableOutput(): boolean {
    return this.spec.features.tableOutput
  }

  get hasDatabase(): boolean {
    return this.spec.features.database
  }

  get usesSetupCode(): boolean {
    return this.spec.features.setupCode
  }

  /** The sandbox's code when a lesson has none of its own. */
  get defaultSandboxCode(): string {
    return this.spec.sandbox.defaultCode
  }

  /** The sandbox's sample buttons when a lesson has none of its own. */
  get sandboxSamples(): readonly SandboxSnippet[] {
    return this.spec.sandbox.samples
  }

  /** What "Download for offline" says while it fetches this runtime. */
  get offlineStepLabel(): string {
    return this.spec.offline.stepLabel
  }

  /** Whether sandbox code reads input, so the Input box should show. */
  readsInputIn(code: string): boolean {
    const input = this.spec.sandbox.input
    return this.readsInput && !!input && new RegExp(input.detect).test(code)
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

  // ---- Lesson text ----

  /** Splits code into coloured tokens, for code in lesson text. */
  highlight(code: string): Token[] {
    return this.highlighter.highlight(code)
  }

  /** Whether a lesson's code block is code that can be run, rather than sample output or a sketch. */
  looksLikeCode(code: string): boolean {
    const prefix = this.spec.tryIt.commentPrefix
    const lines = code.split('\n').filter((l) => l.trim() !== '' && !l.trim().startsWith(prefix))
    if (lines.length === 0) return false
    const { firstLine, codeLines, notCodeLines } = this.tryIt
    if (firstLine) return firstLine.test(lines[0])
    if (lines.some((l) => notCodeLines.some((re) => re.test(l)))) return false
    return lines.some((l) => codeLines.some((re) => re.test(l)))
  }

  /** Whether a block gets a "Try it" button. */
  canTry(block: FenceBlock): boolean {
    if (block.lang && OUTPUT_LANGS.has(block.lang)) return false
    return this.looksLikeCode(block.content)
  }

  /** Whether a block shows an error on purpose (it says so in a comment, like `# Run it and read the error`). */
  showsError(code: string): boolean {
    return this.tryIt.errorDemo?.test(code) ?? false
  }

  /**
   * The code "Try it" loads for block `index`: the block itself, or (when tries build on
   * earlier blocks) every earlier block that could be tried, except ones that show an error
   * on purpose, followed by this one.
   */
  codeToTry(blocks: FenceBlock[], index: number): string {
    const block = blocks[index]
    if (!this.spec.tryIt.buildsOnEarlierBlocks) return block.content
    const earlier = blocks
      .slice(0, index)
      .filter((b) => this.canTry(b) && !this.showsError(b.content))
      .map((b) => b.content)
    return [...earlier, block.content].join('\n\n')
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
