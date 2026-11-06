import type { EditorLanguage } from '../EditorLanguage'
import { LanguagePack, type ChallengeCheckResult, type ChallengeRunOptions, type CodeRunResult, type RunOptions } from '../LanguagePack'
import language from './language.json'
import { jsErrorSummaryLine } from './jsErrors'
import type { JavaScriptRuntime } from './JavaScriptRuntime'

/**
 * JavaScript, on the browser's own engine in a Web Worker (JavaScriptRuntime.ts): nothing to
 * download, so a run starts at once. What the code logs with `console.log` is its output, and
 * challenges have a Run button as in Python.
 */
export class JavaScriptPack extends LanguagePack {
  private loaded: Promise<JavaScriptRuntime> | null = null

  constructor() {
    super(language)
  }

  /** The runtime, loaded on first use. A failed load is forgotten, so the next run tries again. */
  runtime(): Promise<JavaScriptRuntime> {
    this.loaded ??= import('./JavaScriptRuntime')
      .then(({ JavaScriptRuntime }) => new JavaScriptRuntime(this.runWording))
      .catch((error: unknown) => {
        this.loaded = null
        throw error
      })
    return this.loaded
  }

  errorSummaryLine(detail: string): string | null {
    return jsErrorSummaryLine(detail)
  }

  async loadEditor(): Promise<EditorLanguage> {
    const { JavaScriptEditorLanguage } = await import('./JavaScriptEditorLanguage')
    return new JavaScriptEditorLanguage(this.spec)
  }

  async run(code: string, { signal, onOutput }: RunOptions): Promise<CodeRunResult> {
    return (await this.runtime()).run(code, { ...(signal ? { signal } : {}), ...(onOutput ? { onOutput } : {}) })
  }

  async checkChallenge(answer: string, { challenge, signal, onOutput }: ChallengeRunOptions): Promise<ChallengeCheckResult> {
    const { setupCode, tests = [] } = challenge.validation
    return (await this.runtime()).check(answer, setupCode, tests, { ...(signal ? { signal } : {}), ...(onOutput ? { onOutput } : {}) })
  }

  async runChallenge(answer: string, { challenge, signal, onOutput }: ChallengeRunOptions): Promise<CodeRunResult> {
    const { setupCode } = challenge.validation
    return (await this.runtime()).run(answer, { ...(setupCode ? { setupCode } : {}), ...(signal ? { signal } : {}), ...(onOutput ? { onOutput } : {}) })
  }

  /** Nothing to download: the browser runs JavaScript itself, and the worker comes with the app. */
  async prepareOffline(): Promise<void> {
    await this.runtime()
  }
}
