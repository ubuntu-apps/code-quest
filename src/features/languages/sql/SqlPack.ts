import type { EditorLanguage } from '../EditorLanguage'
import type { ChallengeCheckResult, ChallengeRunOptions, CodeRunResult, RunOptions, TablePeek } from '../LanguagePack'
import { PyodidePack } from '../pyodide/PyodidePack'
import language from './language.json'
import { sqlErrorSummaryLine } from './sqlErrors'

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
    const runOptions = this.runOptions({ ...options, onOutput: undefined })
    return (await this.runtime()).runSql(code, options.level?.database?.setupSql ?? '', runOptions)
  }

  async checkChallenge(answer: string, options: ChallengeRunOptions): Promise<ChallengeCheckResult> {
    const { challenge, level } = options
    return (await this.runtime()).checkSql(
      answer,
      {
        setupSql: level.database?.setupSql ?? '',
        altSetupSql: level.database?.altSetupSql,
        solutionSql: challenge.solution ?? '',
        ordered: challenge.validation.ordered,
        checks: challenge.validation.tests,
      },
      this.runOptions(options, true),
    )
  }

  async runChallenge(answer: string, options: ChallengeRunOptions): Promise<CodeRunResult> {
    return (await this.runtime()).runSql(answer, options.level.database?.setupSql ?? '', this.runOptions(options))
  }

  /** "Peek": the first rows of one of the lesson's tables. */
  async peekTable({ table, setupSql, rows }: TablePeek): Promise<CodeRunResult> {
    const quoted = `"${table.replace(/"/g, '""')}"`
    return (await this.runtime()).runSql(`SELECT * FROM ${quoted} LIMIT ${rows};`, setupSql, this.runOptions())
  }

  /** The SQL engine only: the lessons' databases come with them. */
  async prepareOffline({ signal }: { signal?: AbortSignal }): Promise<void> {
    await (await this.runtime()).prepareOffline('import sqlite3', this.runWording, signal)
  }
}
