import { useCallback, useRef, useState } from 'react'
import { languagePack, type FriendlyCodeError } from '../../languages'
import type { Level } from '../types'

function startingCode(level: Level, languageId: string | null): string {
  return level.intro.sandboxCode ?? languagePack(languageId)?.defaultSandboxCode ?? ''
}

/** State and actions for the intro "Sandbox" (free-form code runner) of a level. */
export function useSandbox(languageId: string | null) {
  const [code, setCode] = useState('')
  const [output, setOutput] = useState('')
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<FriendlyCodeError | null>(null)
  const [errorUiEpoch, setErrorUiEpoch] = useState(0)
  // Bumped when a new level opens, so a run that finishes later can't write into it.
  const levelEpochRef = useRef(0)
  /** Stops the current run (and only that run). */
  const runControllerRef = useRef<AbortController | null>(null)
  /** The open lesson: SQL runs on its database. */
  const levelRef = useRef<Level | null>(null)

  const run = async (stdin = '') => {
    const pack = languagePack(languageId)
    if (!pack) return
    const epoch = levelEpochRef.current
    const stillCurrent = () => levelEpochRef.current === epoch
    setRunning(true)
    setError(null)
    setOutput(pack.startMessage())
    const controller = new AbortController()
    runControllerRef.current = controller
    try {
      const result = await pack.run(code, {
        level: levelRef.current,
        stdin,
        signal: controller.signal,
        onStatus: (message) => {
          if (stillCurrent()) setOutput(message)
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
      setError(pack.runtimeFailedError(err))
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
    levelRef.current = level
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
