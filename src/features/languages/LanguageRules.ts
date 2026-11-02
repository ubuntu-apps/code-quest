import type { SandboxSnippet } from '../curriculum/content/types.ts'
import { Highlighter, type Token } from './Highlighter.ts'
import { parseLanguageSpec, toRegExp, type LanguageSpec } from './languageSpec.ts'

/**
 * What a language's language.json says, ready to use: its labels and flags, how its code is
 * coloured, and which lesson blocks get "Try it". No runtime and no UI, so the content
 * checkers (scripts/content-check) use the same rules as the app. LanguagePack adds the rest.
 *
 * Imports here name their `.ts` files, so Node can load this file as it is.
 */

/** A fenced code block from lesson markdown, with its info string (```text …) if it has one. */
export interface FenceBlock {
  content: string
  lang?: string
}

/** Fences marked as sample output never get a "Try it" button. */
const OUTPUT_LANGS = new Set(['text', 'output'])

export class LanguageRules {
  /** The language's language.json, checked. */
  readonly spec: LanguageSpec
  private readonly highlighter: Highlighter
  private readonly tryIt: { firstLine: RegExp | null; codeLines: RegExp[]; notCodeLines: RegExp[]; errorDemo: RegExp | null }

  /** @param json The language's language.json. */
  constructor(json: unknown) {
    this.spec = parseLanguageSpec(json)
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
}
