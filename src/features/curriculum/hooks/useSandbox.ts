import { useCallback, useState } from 'react'
import type { FriendlySandboxError } from '../components/CodeSandboxSection'
import { runPythonCode, stopPythonRun } from '../pythonSandbox'
import { runRCode } from '../rSandbox'
import { defaultSandboxForLanguage } from '../sandboxDefaults'
import type { Level } from '../types'

function startingCode(level: Level, languageId: string | null): string {
  return level.intro.sandboxCode ?? defaultSandboxForLanguage(languageId ?? 'python')
}

/** State and actions for the intro "Sandbox" (free-form code runner) of a level. */
export function useSandbox(languageId: string | null) {
  const [code, setCode] = useState(() => defaultSandboxForLanguage('python'))
  const [output, setOutput] = useState('')
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<FriendlySandboxError | null>(null)
  const [errorUiEpoch, setErrorUiEpoch] = useState(0)

  const run = async (stdin = '') => {
    setRunning(true)
    setError(null)
    setOutput(
      languageId === 'r'
        ? 'Loading R runtime (first run downloads ~30MB, may take a minute)...'
        : 'Running...',
    )
    try {
      const result = languageId === 'r' ? await runRCode(code) : await runPythonCode(code, stdin)
      setOutput(result.output.trim() ? result.output : '[no output]')
      setError(result.error)
    } catch (err: unknown) {
      setOutput('')
      const runtimeName = languageId === 'r' ? 'R' : 'Python'
      setError({
        title: `${runtimeName} runtime failed`,
        detail: err instanceof Error ? err.message : `Could not start the ${runtimeName} runtime`,
        tip: 'Check your network connection and try again.',
      })
    }
    setErrorUiEpoch((n) => n + 1)
    setRunning(false)
  }

  /** "Reset code" button: back to the level's starting code, keeping the error epoch. */
  const reset = (level: Level) => {
    setCode(startingCode(level, languageId))
    setOutput('')
    setError(null)
  }

  const clearError = () => setError(null)

  /** Fresh sandbox when a level is opened. */
  const resetForLevel = useCallback((level: Level, langId: string | null) => {
    setCode(startingCode(level, langId))
    setOutput('')
    setRunning(false)
    setError(null)
    setErrorUiEpoch(0)
  }, [])

  return {
    code,
    setCode,
    output,
    running,
    error,
    errorUiEpoch,
    run,
    stop: stopPythonRun,
    reset,
    clearError,
    resetForLevel,
  }
}
