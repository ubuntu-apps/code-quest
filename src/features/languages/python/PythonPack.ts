import type { LanguageBundle } from '../../curriculum/types'
import type { EditorLanguage } from '../EditorLanguage'
import type { ChallengeCheckResult, ChallengeRunOptions, CodeRunResult, RunOptions } from '../LanguagePack'
import { PyodidePack } from '../pyodide/PyodidePack'
import language from './language.json'
import { pythonErrorSummaryLine } from './pythonErrors'

/** Python on Pyodide, in a worker. What Python is like is in language.json. */
export class PythonPack extends PyodidePack {
  constructor() {
    super(language)
  }

  errorSummaryLine(detail: string): string | null {
    return pythonErrorSummaryLine(detail)
  }

  async loadEditor(): Promise<EditorLanguage> {
    const { PythonEditorLanguage } = await import('./PythonEditorLanguage')
    return new PythonEditorLanguage(this.spec)
  }

  async run(code: string, options: RunOptions): Promise<CodeRunResult> {
    return (await this.runtime()).runPython(code, options.stdin ?? '', this.runOptions(options))
  }

  async checkChallenge(answer: string, options: ChallengeRunOptions): Promise<ChallengeCheckResult> {
    const { setupCode, tests = [] } = options.challenge.validation
    return (await this.runtime()).checkPython(answer, setupCode, tests, this.runOptions(options, true))
  }

  async runChallenge(answer: string, options: ChallengeRunOptions): Promise<CodeRunResult> {
    const setupCode = options.challenge.validation.setupCode
    return (await this.runtime()).tryPython(answer, setupCode, this.runOptions(options))
  }

  /** The runtime plus every package the course's code imports. */
  async prepareOffline({ bundle, signal }: { bundle: LanguageBundle; signal?: AbortSignal }): Promise<void> {
    await (await this.runtime()).prepareOffline(this.courseCode(bundle), this.runWording, signal)
  }

  /** All Python code in a course, so the worker can find every package it imports. */
  courseCode(bundle: LanguageBundle): string {
    const parts: string[] = []
    for (const { file } of bundle.sections) {
      for (const level of file.levels) {
        parts.push(level.intro.sandboxCode ?? '')
        for (const snippet of level.sandboxSnippets ?? []) parts.push(snippet.code)
        for (const ch of level.challenges) {
          parts.push(ch.starterCode ?? '', ch.solution ?? '', ch.validation.setupCode ?? '')
        }
      }
    }
    return parts.filter(Boolean).join('\n')
  }
}
