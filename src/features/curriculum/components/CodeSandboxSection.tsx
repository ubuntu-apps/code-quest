import { PythonSandboxSection } from './PythonSandboxSection'
import type { FriendlyPythonError } from '../pythonSandbox'
import type { FriendlyRError } from '../rSandbox'
import type { SandboxSnippet } from '../types'

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
  onRun: () => void
  onReset: () => void
  onErrorClear: () => void
}

export function CodeSandboxSection(props: CodeSandboxSectionProps) {
  if (props.languageId === 'python' || props.languageId === 'r') {
    return (
      <PythonSandboxSection
        {...props}
        languageId={props.languageId as 'python' | 'r'}
      />
    )
  }
  return null
}
