import { sqlErrorSummaryLine } from '../../curriculum/sqlErrorHelper'
import type { EditorLanguage } from '../EditorLanguage'
import type { ChallengeCheckResult, ChallengeRunOptions, CodeRunResult, RunOptions } from '../LanguagePack'
import { PyodidePack, pyodideRuntime } from '../PyodidePack'
import language from './language.json'

/**
 * SQL on SQLite, through Python's sqlite3 on the Python worker. A lesson brings its database
 * (`level.database`): every run starts from a fresh copy, and a Check compares the answer's
 * result with the solution's, on the lesson's rows and on other rows. What SQL is like is in
 * language.json.
 */
export class SqlPack extends PyodidePack {
  constructor() {
    super(language)
  }

  errorSummaryLine(detail: string): string | null {
    return sqlErrorSummaryLine(detail)
  }

  async loadEditor(): Promise<EditorLanguage> {
    const { SqlEditorLanguage } = await import('./SqlEditorLanguage')
    return new SqlEditorLanguage(this.spec)
  }

  async run(code: string, options: RunOptions): Promise<CodeRunResult> {
    // The sandbox shows the result tables when the run ends, not the text as it comes.
    const worker = this.workerOptions({ ...options, onOutput: undefined })
    return (await pyodideRuntime()).runSqlCode(code, options.level?.database?.setupSql ?? '', worker)
  }

  async checkChallenge(answer: string, options: ChallengeRunOptions): Promise<ChallengeCheckResult> {
    const { challenge, level } = options
    return (await pyodideRuntime()).runSqlChallengeTests(
      answer,
      {
        setupSql: level.database?.setupSql ?? '',
        altSetupSql: level.database?.altSetupSql,
        solutionSql: challenge.solution ?? '',
        ordered: challenge.validation.ordered,
        checks: challenge.validation.tests,
      },
      this.workerOptions(options, true),
    )
  }

  async runChallenge(answer: string, options: ChallengeRunOptions): Promise<CodeRunResult> {
    return (await pyodideRuntime()).runSqlCode(answer, options.level.database?.setupSql ?? '', this.workerOptions(options))
  }

  /** The SQL engine only: the lessons' databases come with them. */
  async prepareOffline({ signal }: { signal?: AbortSignal }): Promise<void> {
    await (await pyodideRuntime()).prepareSqlOffline(signal)
  }
}
