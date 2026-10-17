import { useCallback, useRef, useState } from 'react'
import type { FriendlySandboxError } from '../components/CodeSandboxSection'
import { pythonStatusMessage, runPythonCode } from '../pythonSandbox'
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
  // Bumped when a new level opens, so a run that finishes later can't write into it.
  const levelEpochRef = useRef(0)
  /** Stops the current Python run (and only that run). */
  const runControllerRef = useRef<AbortController | null>(null)

  const run = async (stdin = '') => {
    const epoch = levelEpochRef.current
    const stillCurrent = () => levelEpochRef.current === epoch
    setRunning(true)
    setError(null)
    setOutput(
      languageId === 'r'
        ? 'Loading R runtime (first run downloads ~30MB, may take a minute)...'
        : pythonStatusMessage('running'),
    )
    const controller = new AbortController()
    runControllerRef.current = controller
    try {
      const result =
        languageId === 'r'
          ? await runRCode(code)
          : await runPythonCode(code, stdin, {
              signal: controller.signal,
              onStatus: (status) => {
                if (stillCurrent()) setOutput(pythonStatusMessage(status))
              },
              // Show printed lines as they arrive, not only when the run ends.
              onOutput: (text) => {
                if (stillCurrent()) setOutput(text)
              },
            })
      if (!stillCurrent()) return
      setOutput(result.output.trim() ? result.output : '[no output]')
      setError(result.error)
    } catch (err: unknown) {
      if (!stillCurrent()) return
      setOutput('')
      const runtimeName = languageId === 'r' ? 'R' : 'Python'
      setError({
        title: `${runtimeName} runtime failed`,
        detail: err instanceof Error ? err.message : `Could not start the ${runtimeName} runtime`,
        tip: 'Check your network connection and try again.',
      })
    }
    if (runControllerRef.current === controller) runControllerRef.current = null
    setErrorUiEpoch((n) => n + 1)
    setRunning(false)
  }

  const stop = () => runControllerRef.current?.abort()

  /** "Reset code" button: back to the level's starting code, keeping the error epoch. */
  const reset = (level: Level) => {
    setCode(startingCode(level, languageId))
    setOutput('')
    setError(null)
  }

  const clearError = () => setError(null)

  /** Fresh sandbox when a level is opened. */
  const resetForLevel = useCallback((level: Level, langId: string | null) => {
    levelEpochRef.current += 1
    // A run from the previous level is no longer shown, so don't let it hold up the next one.
    runControllerRef.current?.abort()
    runControllerRef.current = null
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
    stop,
    reset,
    clearError,
    resetForLevel,
  }
}
