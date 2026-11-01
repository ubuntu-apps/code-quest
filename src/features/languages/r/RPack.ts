import type { EditorLanguage } from '../EditorLanguage'
import { LanguagePack, type ChallengeCheckResult, type ChallengeRunOptions, type CodeRunResult, type RunOptions } from '../LanguagePack'
import language from './language.json'
import { rErrorSummaryLine } from './rErrors'
import type { WebRRuntime } from './WebRRuntime'

/**
 * R on webR (R compiled to WebAssembly), in the page itself. What R is like is in
 * language.json: a stage builds up step by step and the sandbox starts empty, so "Try it"
 * loads the earlier blocks too, and challenges have no Run button (a Check shows the output).
 */
export class RPack extends LanguagePack {
  private webR: Promise<WebRRuntime> | null = null

  constructor() {
    super(language)
  }

  /** The R runtime, loaded on first use (the content checker's browser scripts use it too). */
  runtime(): Promise<WebRRuntime> {
    this.webR ??= import('./WebRRuntime').then(({ WebRRuntime }) => new WebRRuntime(this.runWording))
    return this.webR
  }

  errorSummaryLine(detail: string): string | null {
    return rErrorSummaryLine(detail)
  }

  async loadEditor(): Promise<EditorLanguage> {
    const { REditorLanguage } = await import('./REditorLanguage')
    return new REditorLanguage(this.spec)
  }

  async run(code: string, { signal }: RunOptions): Promise<CodeRunResult> {
    return (await this.runtime()).run(code, { signal })
  }

  async checkChallenge(answer: string, { challenge, signal }: ChallengeRunOptions): Promise<ChallengeCheckResult> {
    const { setupCode, tests = [] } = challenge.validation
    return (await this.runtime()).check(answer, setupCode, tests, { signal })
  }

  /** Starts downloading webR as soon as the course opens: it is big. */
  preload(): void {
    void this.runtime().then((runtime) => runtime.preload())
  }

  async prepareOffline(): Promise<void> {
    try {
      await (await this.runtime()).prepareOffline()
    } catch {
      throw new Error(this.spec.messages.runtimeLoadFailed ?? `Could not download the ${this.label} runtime.`)
    }
  }
}
