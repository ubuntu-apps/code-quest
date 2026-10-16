import { useCallback, useState } from 'react'
import type { FriendlySandboxError } from '../components/CodeSandboxSection'
import { loadProgress, saveProgress } from '../progressStorage'
import { runPythonChallengeTests, type PythonChallengeTestResult } from '../pythonSandbox'
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

  const check = async (ch: Challenge) => {
    if (!languageId || !level) return
    setErrorUiEpoch((prev) => ({ ...prev, [ch.id]: (prev[ch.id] ?? 0) + 1 }))
    const answer = drafts[ch.id] ?? ''
    saveAnswer(languageId, level.id, ch.id, answer)

    let ok: boolean
    if (ch.validation.mode === 'python_tests') {
      const run = await runPythonChallengeTests(answer, ch.validation.setupCode, ch.validation.tests ?? [])
      showRunFeedback(ch.id, run)
      ok = run.passed
    } else if (ch.validation.mode === 'r_tests') {
      const run = await runRChallengeTests(answer, ch.validation.setupCode, ch.validation.tests ?? [])
      showRunFeedback(ch.id, run)
      ok = run.passed
    } else {
      ok = validateAgainst(answer, ch.validation)
      clearRunFeedback(ch.id)
    }

    const prev = loadProgress(languageId, level.id)
    if (!ok) {
      setStatus((s) => ({ ...s, [ch.id]: 'failed' }))
      if (prev.challengesCompleted.includes(ch.id)) {
        saveProgress(languageId, level.id, {
          ...prev,
          challengesCompleted: prev.challengesCompleted.filter((id) => id !== ch.id),
        })
      }
      return
    }

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
    if (languageId && level) saveAnswer(languageId, level.id, challengeId, value)
  }

  /** Records that the answer was revealed before the challenge was solved (it then earns less XP). */
  const revealAnswer = (challengeId: string) => {
    if (!languageId || !level) return
    const prev = loadProgress(languageId, level.id)
    const viewed = prev.answersViewed ?? []
    if (prev.challengesCompleted.includes(challengeId) || viewed.includes(challengeId)) return
    saveProgress(languageId, level.id, { ...prev, answersViewed: [...viewed, challengeId] })
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
    check,
    changeDraft,
    revealAnswer,
    toggleErrorExpanded,
    resetForLevel,
  }
}
