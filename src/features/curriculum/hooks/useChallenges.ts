import { useCallback, useRef, useState } from 'react'
import type { FriendlySandboxError } from '../components/CodeSandboxSection'
import { loadProgress, saveChallengeDraft, saveProgress } from '../progressStorage'
import {
  pythonStatusMessage,
  runPythonChallengeCode,
  runPythonChallengeTests,
  type PythonChallengeTestResult,
} from '../pythonSandbox'
import { runRChallengeTests, type RChallengeTestResult } from '../rSandbox'
import type { Challenge, Level } from '../types'
import { validateAgainst } from '../validateAnswer'
import { CHALLENGE_XP, CHALLENGE_XP_AFTER_ANSWER } from '../constants'
import { playSound } from '../../sound/sound'

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
 * `onActivity` is called when a challenge is passed (used for the daily streak), and
 * `onXp` with the XP earned when a challenge is solved for the first time.
 */
export function useChallenges(
  languageId: string | null,
  level: Level | null,
  onActivity: () => void,
  onXp?: (xp: number) => void,
) {
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Record<string, 'passed' | 'failed'>>({})
  const [testResults, setTestResults] = useState<Record<string, ChallengeTestResult[]>>({})
  const [runtimeError, setRuntimeError] = useState<Record<string, FriendlySandboxError | null>>({})
  const [errorExpanded, setErrorExpanded] = useState<Record<string, boolean>>({})
  const [errorUiEpoch, setErrorUiEpoch] = useState<Record<string, number>>({})
  /** Challenges being checked now, with what the check is doing ("Downloading Python…"). */
  const [checking, setChecking] = useState<Record<string, string>>({})
  const checkControllers = useRef<Record<string, AbortController>>({})
  /** What each challenge's code printed on its last Run or Check (null: nothing to show). */
  const [output, setOutput] = useState<Record<string, string | null>>({})
  /** Challenges whose code is running now (Run, not Check), with what the run is doing. */
  const [running, setRunning] = useState<Record<string, string>>({})
  const runControllers = useRef<Record<string, AbortController>>({})

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
        // A check that printed nothing (e.g. only defines a function) shows no output box.
        setOutput((prev) => ({ ...prev, [ch.id]: run.output ? run.output : null }))
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
      playSound('checkFail')
      return
    }

    const prev = loadProgress(languageId, level.id)
    const firstSolve = !prev.challengesCompleted.includes(ch.id)
    const answerSeen = (prev.answersViewed ?? []).includes(ch.id)

    setStatus((s) => ({ ...s, [ch.id]: 'passed' }))
    playSound('checkPass')
    saveProgress(languageId, level.id, {
      ...prev,
      challengesCompleted: [...new Set([...prev.challengesCompleted, ch.id])],
      challengeAnswers: { ...(prev.challengeAnswers ?? {}), [ch.id]: answer },
    })
    onActivity()
    if (firstSolve) onXp?.(answerSeen ? CHALLENGE_XP_AFTER_ANSWER : CHALLENGE_XP)
  }

  /**
   * "Run": runs the answer with the challenge's setup but without its tests, to show
   * what it prints. Not an attempt, so it doesn't change progress or unlock the answer.
   */
  const run = async (ch: Challenge) => {
    if (!languageId || !level || ch.validation.mode !== 'python_tests') return
    if (runControllers.current[ch.id] || checkControllers.current[ch.id]) return
    const answer = drafts[ch.id] ?? ''
    const controller = new AbortController()
    runControllers.current[ch.id] = controller
    const setRunningMessage = (message: string | null) =>
      setRunning((prev) => {
        const next = { ...prev }
        if (message === null) delete next[ch.id]
        else next[ch.id] = message
        return next
      })
    setRunningMessage(pythonStatusMessage('running'))
    setOutput((prev) => ({ ...prev, [ch.id]: '' }))
    setErrorUiEpoch((prev) => ({ ...prev, [ch.id]: (prev[ch.id] ?? 0) + 1 }))
    try {
      const result = await runPythonChallengeCode(answer, ch.validation.setupCode, {
        signal: controller.signal,
        onStatus: (status) => setRunningMessage(pythonStatusMessage(status)),
        onOutput: (text) => {
          if (runControllers.current[ch.id] === controller) setOutput((prev) => ({ ...prev, [ch.id]: text }))
        },
      })
      // Leaving the level stops the run; the new level's state is already fresh.
      if (runControllers.current[ch.id] !== controller) return
      setOutput((prev) => ({ ...prev, [ch.id]: result.output }))
      // A Run says nothing about the tests, so the last check's results no longer apply.
      setTestResults((prev) => ({ ...prev, [ch.id]: [] }))
      setRuntimeError((prev) => ({ ...prev, [ch.id]: result.error }))
      setErrorExpanded((prev) => ({ ...prev, [ch.id]: false }))
    } finally {
      if (runControllers.current[ch.id] === controller) {
        delete runControllers.current[ch.id]
        setRunningMessage(null)
      }
    }
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

  /** Stops a running check or Run (only Python code can be stopped). */
  const stopCheck = (challengeId: string) => {
    checkControllers.current[challengeId]?.abort()
    runControllers.current[challengeId]?.abort()
  }

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
    for (const controller of Object.values(runControllers.current)) controller.abort()
    runControllers.current = {}
    setRunning({})
    setOutput({})
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
    running,
    output,
    check,
    run,
    stopCheck,
    changeDraft,
    revealAnswer,
    toggleErrorExpanded,
    resetForLevel,
  }
}
