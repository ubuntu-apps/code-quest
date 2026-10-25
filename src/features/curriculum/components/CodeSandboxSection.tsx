import { PythonSandboxSection } from './PythonSandboxSection'
import type { FriendlyPythonError } from '../pythonSandbox'
import type { FriendlyRError } from '../rSandbox'
import type { SandboxSnippet, SqlTable } from '../types'

export type FriendlySandboxError = FriendlyPythonError | FriendlyRError

interface CodeSandboxSectionProps {
  languageId: string
  snippets?: SandboxSnippet[]
  code: string
  onCodeChange: (code: string) => void
  output: string
  running: boolean
  error: FriendlySandboxError | null
  errorUiEpoch: number
  onRun: (stdin: string) => void
  onStop?: () => void
  onReset: () => void
  onErrorClear: () => void
  /** SQL lessons: the tables the sandbox's database has. */
  tables?: SqlTable[]
  /** SQL lessons: the SQL that makes the sandbox's database, for peeking at a table's rows. */
  setupSql?: string
}

export function CodeSandboxSection(props: CodeSandboxSectionProps) {
  if (props.languageId === 'python' || props.languageId === 'r' || props.languageId === 'sql') {
    return <PythonSandboxSection {...props} languageId={props.languageId} />
  }
  return null
}
