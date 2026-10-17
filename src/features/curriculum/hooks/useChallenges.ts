import { useCallback, useRef, useState } from 'react'
import type { FriendlySandboxError } from '../components/CodeSandboxSection'
import { loadProgress, saveChallengeDraft, saveProgress } from '../progressStorage'
import {
  pythonStatusMessage,
  runPythonChallengeTests,
  type PythonChallengeTestResult,
} from '../pythonSandbox'
import { runRChallengeTests, type RChallengeTestResult } from '../rSandbox'
import type { Challenge, Level } from '../types'
import { validateAgainst } from '../validateAnswer'

type ChallengeTestResult = PythonChallengeTestResult | RChallengeTestResult

function saveAnswer(languageId: string, levelId: string, challengeId: string, answer: string) {
  const prev = loadProgress(languageId, levelId)
  saveProgress(languageId, levelId, {
    ...prev,
    challengeAnswers: { ...(prev.challengeAnswers ?? {}), [challengeId]: answer },
  })
}

/**
 * Drafts, check results and runtime errors for a level's challenges.
 * `onActivity` is called when a challenge is passed (used for the daily streak).
 */
export function useChallenges(languageId: string | null, level: Level | null, onActivity: () => void) {
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Record<string, 'passed' | 'failed'>>({})
  const [testResults, setTestResults] = useState<Record<string, ChallengeTestResult[]>>({})
  const [runtimeError, setRuntimeError] = useState<Record<string, FriendlySandboxError | null>>({})
  const [errorExpanded, setErrorExpanded] = useState<Record<string, boolean>>({})
  const [errorUiEpoch, setErrorUiEpoch] = useState<Record<string, number>>({})
  /** Challenges being checked now, with what the check is doing ("Downloading Python…"). */
  const [checking, setChecking] = useState<Record<string, string>>({})
  const checkControllers = useRef<Record<string, AbortController>>({})

  const showRunFeedback = (
    challengeId: string,
    run: { tests: ChallengeTestResult[]; error: FriendlySandboxError | null },
  ) => {
    setTestResults((prev) => ({ ...prev, [challengeId]: run.tests }))
    setRuntimeError((prev) => ({ ...prev, [challengeId]: run.error }))
    setErrorExpanded((prev) => ({ ...prev, [challengeId]: false }))
  }

  const clearRunFeedback = (challengeId: string) => {
    setTestResults((prev) => ({ ...prev, [challengeId]: [] }))
    setRuntimeError((prev) => ({ ...prev, [challengeId]: null }))
    setErrorExpanded((prev) => ({ ...prev, [challengeId]: false }))
  }

  const setCheckingMessage = (challengeId: string, message: string | null) =>
    setChecking((prev) => {
      const next = { ...prev }
      if (message === null) delete next[challengeId]
      else next[challengeId] = message
      return next
    })

  const check = async (ch: Challenge) => {
    if (!languageId || !level) return
    if (checkControllers.current[ch.id]) return // already being checked
    setErrorUiEpoch((prev) => ({ ...prev, [ch.id]: (prev[ch.id] ?? 0) + 1 }))
    const answer = drafts[ch.id] ?? ''
    saveAnswer(languageId, level.id, ch.id, answer)

    const controller = new AbortController()
    checkControllers.current[ch.id] = controller
    setCheckingMessage(ch.id, 'Checking…')
    let ok: boolean
    try {
      if (ch.validation.mode === 'python_tests') {
        const run = await runPythonChallengeTests(answer, ch.validation.setupCode, ch.validation.tests ?? [], {
          signal: controller.signal,
          onStatus: (status) =>
            setCheckingMessage(ch.id, status === 'running' ? 'Checking…' : pythonStatusMessage(status)),
        })
        // Stopped by the learner (or by leaving the level): not an attempt, so no feedback.
        if (controller.signal.aborted) return
        showRunFeedback(ch.id, run)
        ok = run.passed
      } else if (ch.validation.mode === 'r_tests') {
        const run = await runRChallengeTests(answer, ch.validation.setupCode, ch.validation.tests ?? [])
        if (controller.signal.aborted) return
        showRunFeedback(ch.id, run)
        ok = run.passed
      } else {
        ok = validateAgainst(answer, ch.validation)
        clearRunFeedback(ch.id)
      }
    } finally {
      if (checkControllers.current[ch.id] === controller) {
        delete checkControllers.current[ch.id]
        setCheckingMessage(ch.id, null)
      }
    }

    if (!ok) {
      // A challenge solved earlier stays solved: trying something else afterwards
      // shouldn't take away its XP or lock the next section again.
      setStatus((s) => ({ ...s, [ch.id]: 'failed' }))
      return
    }

    const prev = loadProgress(languageId, level.id)

    setStatus((s) => ({ ...s, [ch.id]: 'passed' }))
    saveProgress(languageId, level.id, {
      ...prev,
      challengesCompleted: [...new Set([...prev.challengesCompleted, ch.id])],
      challengeAnswers: { ...(prev.challengeAnswers ?? {}), [ch.id]: answer },
    })
    onActivity()
  }

  const changeDraft = (challengeId: string, value: string) => {
    setDrafts((prev) => ({ ...prev, [challengeId]: value }))
    if (languageId && level) saveChallengeDraft(languageId, level.id, challengeId, value)
  }

  /** Records that the answer was revealed before the challenge was solved (it then earns less XP). */
  const revealAnswer = (challengeId: string) => {
    if (!languageId || !level) return
    const prev = loadProgress(languageId, level.id)
    const viewed = prev.answersViewed ?? []
    if (prev.challengesCompleted.includes(challengeId) || viewed.includes(challengeId)) return
    saveProgress(languageId, level.id, { ...prev, answersViewed: [...viewed, challengeId] })
  }

  /** Stops a running check (only Python checks can be stopped). */
  const stopCheck = (challengeId: string) => checkControllers.current[challengeId]?.abort()

  const toggleErrorExpanded = (challengeId: string) =>
    setErrorExpanded((prev) => ({ ...prev, [challengeId]: !(prev[challengeId] ?? false) }))

  /** Loads saved answers (or starter code) when a level is opened and clears all feedback. */
  const resetForLevel = useCallback((lvl: Level, langId: string | null) => {
    const saved = langId ? (loadProgress(langId, lvl.id).challengeAnswers ?? {}) : {}
    const next: Record<string, string> = {}
    for (const ch of lvl.challenges) {
      next[ch.id] = saved[ch.id] ?? ch.starterCode ?? ''
    }
    // Checks still running for the previous level are no longer shown; stop them.
    for (const controller of Object.values(checkControllers.current)) controller.abort()
    checkControllers.current = {}
    setChecking({})
    setDrafts(next)
    setStatus({})
    setTestResults({})
    setRuntimeError({})
    setErrorExpanded({})
    setErrorUiEpoch({})
  }, [])

  return {
    drafts,
    status,
    testResults,
    runtimeError,
    errorExpanded,
    errorUiEpoch,
    checking,
    check,
    stopCheck,
    changeDraft,
    revealAnswer,
    toggleErrorExpanded,
    resetForLevel,
  }
}
