import { rErrorSummaryLine } from '../../curriculum/rErrorHelper'
import type { EditorLanguage } from '../EditorLanguage'
import { LanguagePack, type ChallengeCheckResult, type ChallengeRunOptions, type CodeRunResult, type RunOptions } from '../LanguagePack'
import language from './language.json'

/** The webR runtime's module, loaded on first use. */
const webRRuntime = () => import('../../curriculum/rSandbox')

/**
 * R on webR (R compiled to WebAssembly), in the page itself. What R is like is in
 * language.json: a stage builds up step by step and the sandbox starts empty, so "Try it"
 * loads the earlier blocks too, and challenges have no Run button (a Check shows the output).
 */
export class RPack extends LanguagePack {
  constructor() {
    super(language)
  }

  errorSummaryLine(detail: string): string | null {
    return rErrorSummaryLine(detail)
  }

  async loadEditor(): Promise<EditorLanguage> {
    const { REditorLanguage } = await import('./REditorLanguage')
    return new REditorLanguage(this.spec)
  }

  async run(code: string, { signal }: RunOptions): Promise<CodeRunResult> {
    return (await webRRuntime()).runRCode(code, { signal })
  }

  async checkChallenge(answer: string, { challenge, signal }: ChallengeRunOptions): Promise<ChallengeCheckResult> {
    const { setupCode, tests = [] } = challenge.validation
    return (await webRRuntime()).runRChallengeTests(answer, setupCode, tests, { signal })
  }

  /** Starts downloading webR as soon as the course opens: it is big. */
  preload(): void {
    void webRRuntime().then((runtime) => runtime.preloadWebR())
  }

  async prepareOffline(): Promise<void> {
    try {
      await (await webRRuntime()).prepareROffline()
    } catch {
      throw new Error(this.spec.messages.runtimeLoadFailed ?? `Could not download the ${this.label} runtime.`)
    }
  }
}
