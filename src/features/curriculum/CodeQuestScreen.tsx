import '../../App.css'

import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  ExternalLink,
  Flame,
  Info,
  ListTodo,
  Play,
  X,
  Zap,
} from 'lucide-react'
import type { Challenge, LanguageBundle, Level, RootIndex } from './types'
import { loadLanguageBundle, loadRootIndex } from './loadCurriculum'
import { SimpleMarkdown } from './SimpleMarkdown'
import { gradeQuestion, validateAgainst } from './validateAnswer'
import { loadProgress, saveProgress } from './progressStorage'
import { getFreePythonAiHelp, type PythonAiHelp } from './freeAiHelp'
import {
  runPythonCode,
  runPythonChallengeTests,
  type FriendlyPythonError,
  type PythonChallengeTestResult,
} from './pythonSandbox'
import { BottomNav, type BottomNavItem } from '../../components/BottomNav/BottomNav'
import { APP_VERSION } from '../../version'
import { detectPlatform, installInstructions } from '../../platform'
import { CodeTextareaWithErrorLine } from './codeEditor'
import { pythonErrorSummaryLine } from './pythonErrorHelper'

type TabId = 'learn' | 'progress' | 'about'
type LearnView = 'languages' | 'sections' | 'levels' | 'level'
type LevelStep = 'intro' | 'challenges' | 'test'

const PASS_DEFAULT = 70
const DEFAULT_SANDBOX_CODE = 'print("Hello from CodeQuest!")'
const STREAK_STORAGE_KEY = 'codequest:streak'
const LAST_LEVEL_STORAGE_KEY = 'codequest:lastLevel'
const CHALLENGE_XP = 10
const TEST_XP = 50
const SANDBOX_SNIPPETS: { id: string; label: string; code: string }[] = [
  { id: 'hello', label: 'Hello', code: 'print("Hello, Python!")' },
  {
    id: 'variables',
    label: 'Variables',
    code: 'name = "Alex"\nscore = 7\nprint(name)\nprint(score)',
  },
  { id: 'loop', label: 'Loop', code: 'for i in range(3):\n    print("Step", i)' },
  { id: 'function', label: 'Function', code: 'def add(a, b):\n    return a + b\n\nprint(add(2, 3))' },
]

type StreakState = { lastDate: string; count: number }

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function loadStreakState(): StreakState {
  try {
    const raw = localStorage.getItem(STREAK_STORAGE_KEY)
    if (!raw) return { lastDate: '', count: 0 }
    const parsed = JSON.parse(raw) as Partial<StreakState>
    return {
      lastDate: typeof parsed.lastDate === 'string' ? parsed.lastDate : '',
      count: typeof parsed.count === 'number' ? parsed.count : 0,
    }
  } catch {
    return { lastDate: '', count: 0 }
  }
}

function recordDailyActivity(): number {
  const today = dateKey(new Date())
  const yesterday = dateKey(new Date(Date.now() - 24 * 60 * 60 * 1000))
  const curr = loadStreakState()
  let next: StreakState
  if (curr.lastDate === today) {
    next = curr
  } else if (curr.lastDate === yesterday) {
    next = { lastDate: today, count: curr.count + 1 }
  } else {
    next = { lastDate: today, count: 1 }
  }
  localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(next))
  return next.count
}

function computeLevelXp(languageId: string, level: Level): number {
  const p = loadProgress(languageId, level.id)
  const challengeXp = Math.min(p.challengesCompleted.length, level.challenges.length) * CHALLENGE_XP
  const testXp = p.testPassed ? TEST_XP : 0
  return challengeXp + testXp
}

function pythonErrorLinePointer(
  code: string,
  err: Pick<FriendlyPythonError, 'line' | 'column'> | null | undefined,
) {
  if (!err?.line) return null
  const lines = code.split('\n')
  const lineIndex = err.line - 1
  if (lineIndex < 0 || lineIndex >= lines.length) return null
  const text = lines[lineIndex] ?? ''
  const col = Math.max(1, err.column ?? 1)
  const caretPad = ' '.repeat(Math.max(0, col - 1))
  return {
    line: err.line,
    text,
    caret: `${caretPad}^`,
    column: err.column,
  }
}

export function CodeQuestScreen() {
  const baseUrl = import.meta.env.BASE_URL
  const [platform] = useState(() => detectPlatform())

  const [tab, setTab] = useState<TabId>('learn')
  const [, bump] = useReducer((n: number) => n + 1, 0)

  const [rootIndex, setRootIndex] = useState<RootIndex | null>(null)
  const [rootError, setRootError] = useState<string | null>(null)
  const [homeBundles, setHomeBundles] = useState<Record<string, LanguageBundle>>({})
  const [streakCount, setStreakCount] = useState(() => loadStreakState().count)

  const [learnView, setLearnView] = useState<LearnView>('languages')
  const [languageId, setLanguageId] = useState<string | null>(null)
  const [bundle, setBundle] = useState<LanguageBundle | null>(null)
  const [bundleError, setBundleError] = useState<string | null>(null)

  const [sectionId, setSectionId] = useState<string | null>(null)
  const [levelId, setLevelId] = useState<string | null>(null)
  const [levelStep, setLevelStep] = useState<LevelStep>('intro')

  const [challengeDrafts, setChallengeDrafts] = useState<Record<string, string>>({})
  const [challengeStatus, setChallengeStatus] = useState<Record<string, 'passed' | 'failed'>>({})
  const [challengeTestResults, setChallengeTestResults] = useState<Record<string, PythonChallengeTestResult[]>>(
    {},
  )
  const [challengeRuntimeError, setChallengeRuntimeError] = useState<Record<string, FriendlyPythonError | null>>(
    {},
  )
  const [challengeErrorExpanded, setChallengeErrorExpanded] = useState<Record<string, boolean>>({})
  const [testShort, setTestShort] = useState<Record<string, string>>({})
  const [testMcq, setTestMcq] = useState<Record<string, string>>({})
  const [testResult, setTestResult] = useState<{ correct: number; total: number; passed: boolean } | null>(
    null,
  )
  const [readMoreOpen, setReadMoreOpen] = useState(false)
  const [sandboxCode, setSandboxCode] = useState(DEFAULT_SANDBOX_CODE)
  const [sandboxOutput, setSandboxOutput] = useState('')
  const [sandboxRunning, setSandboxRunning] = useState(false)
  const [sandboxError, setSandboxError] = useState<FriendlyPythonError | null>(null)
  const [sandboxErrorExpanded, setSandboxErrorExpanded] = useState(false)
  const [sandboxAiHelp, setSandboxAiHelp] = useState<PythonAiHelp | null>(null)
  const [sandboxAiLoading, setSandboxAiLoading] = useState(false)
  const [sandboxFixCopied, setSandboxFixCopied] = useState(false)
  const [sandboxErrorUiEpoch, setSandboxErrorUiEpoch] = useState(0)
  const [challengeErrorUiEpoch, setChallengeErrorUiEpoch] = useState<Record<string, number>>({})
  const [challengeAiHelp, setChallengeAiHelp] = useState<Record<string, PythonAiHelp | null>>({})
  const [challengeAiLoading, setChallengeAiLoading] = useState<Record<string, boolean>>({})
  const [challengeFixCopied, setChallengeFixCopied] = useState<Record<string, boolean>>({})

  const [progressBundles, setProgressBundles] = useState<Record<string, LanguageBundle>>({})
  const [progressLoading, setProgressLoading] = useState(false)
  const [progressError, setProgressError] = useState<string | null>(null)

  useEffect(() => {
    loadRootIndex(baseUrl)
      .then(setRootIndex)
      .catch((e: unknown) => setRootError(e instanceof Error ? e.message : 'Failed to load catalog'))
  }, [baseUrl])

  useEffect(() => {
    if (!rootIndex) return
    let cancelled = false
    void (async () => {
      try {
        const entries = await Promise.all(
          rootIndex.languages.map(async (lang) => {
            const b = await loadLanguageBundle(baseUrl, lang.path)
            return [lang.id, b] as const
          }),
        )
        if (!cancelled) setHomeBundles(Object.fromEntries(entries))
      } catch {
        if (!cancelled) setHomeBundles({})
      }
    })()
    return () => {
      cancelled = true
    }
  }, [rootIndex, baseUrl])

  useEffect(() => {
    if (tab !== 'progress' || !rootIndex) return
    let cancelled = false
    void (async () => {
      setProgressLoading(true)
      setProgressError(null)
      try {
        const entries = await Promise.all(
          rootIndex.languages.map(async (lang) => {
            const b = await loadLanguageBundle(baseUrl, lang.path)
            return [lang.id, b] as const
          }),
        )
        if (!cancelled) {
          setProgressBundles(Object.fromEntries(entries))
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setProgressError(e instanceof Error ? e.message : 'Failed to load progress data')
        }
      } finally {
        if (!cancelled) setProgressLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [tab, rootIndex, baseUrl])

  useEffect(() => {
    if (!readMoreOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setReadMoreOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [readMoreOpen])

  const selectedSection = useMemo(() => {
    if (!bundle || !sectionId) return null
    return bundle.sections.find((s) => s.sectionRef.id === sectionId) ?? null
  }, [bundle, sectionId])

  const selectedLevel = useMemo(() => {
    if (!selectedSection || !levelId) return null
    return selectedSection.file.levels.find((l) => l.id === levelId) ?? null
  }, [selectedSection, levelId])

  const isLevelUnlocked = useCallback((langId: string, levels: Level[], index: number): boolean => {
    if (index === 0) return true
    const prev = levels[index - 1]
    return loadProgress(langId, prev.id).testPassed
  }, [])

  const resetLevelWorkState = useCallback((level: Level, langId: string | null) => {
    const drafts: Record<string, string> = {}
    const saved = langId ? loadProgress(langId, level.id).challengeAnswers ?? {} : {}
    for (const ch of level.challenges) {
      drafts[ch.id] = saved[ch.id] ?? ch.starterCode ?? ''
    }
    setChallengeDrafts(drafts)
    setChallengeStatus({})
    setChallengeTestResults({})
    setChallengeRuntimeError({})
    setChallengeErrorExpanded({})
    setChallengeAiHelp({})
    setChallengeAiLoading({})
    setChallengeFixCopied({})
    setTestShort({})
    setTestMcq({})
    setTestResult(null)
    setSandboxCode(DEFAULT_SANDBOX_CODE)
    setSandboxOutput('')
    setSandboxRunning(false)
    setSandboxError(null)
    setSandboxErrorExpanded(false)
    setSandboxAiHelp(null)
    setSandboxAiLoading(false)
    setSandboxFixCopied(false)
    setSandboxErrorUiEpoch(0)
    setChallengeErrorUiEpoch({})
  }, [])

  const openLanguage = useCallback(
    async (path: string, id: string) => {
      setLanguageId(id)
      setBundleError(null)
      setLearnView('sections')
      try {
        const b = await loadLanguageBundle(baseUrl, path)
        setBundle(b)
      } catch (e: unknown) {
        setBundle(null)
        setBundleError(e instanceof Error ? e.message : 'Failed to load language')
      }
    },
    [baseUrl],
  )

  const openLevelByPath = useCallback(
    async (opts: { languageId: string; languagePath: string; sectionId: string; levelId: string }) => {
      await openLanguage(opts.languagePath, opts.languageId)
      const b = await loadLanguageBundle(baseUrl, opts.languagePath)
      const section = b.sections.find((s) => s.sectionRef.id === opts.sectionId)
      if (!section) return
      const levelIndex = section.file.levels.findIndex((l) => l.id === opts.levelId)
      if (levelIndex < 0) return
      if (!isLevelUnlocked(opts.languageId, section.file.levels, levelIndex)) return
      const level = section.file.levels[levelIndex]
      setSectionId(opts.sectionId)
      setLevelId(level.id)
      setLevelStep('intro')
      setLearnView('level')
      resetLevelWorkState(level, opts.languageId)
      localStorage.setItem(LAST_LEVEL_STORAGE_KEY, JSON.stringify(opts))
    },
    [baseUrl, isLevelUnlocked, openLanguage, resetLevelWorkState],
  )

  const back = () => {
    setTestResult(null)
    if (learnView === 'level') {
      setLevelId(null)
      setLearnView('levels')
      return
    }
    if (learnView === 'levels') {
      setSectionId(null)
      setLearnView('sections')
      return
    }
    if (learnView === 'sections') {
      setBundle(null)
      setLanguageId(null)
      setLearnView('languages')
    }
  }

  const navItems: BottomNavItem[] = useMemo(
    () => [
      { id: 'learn', label: 'Learn', icon: BookOpen },
      { id: 'progress', label: 'Progress', icon: ListTodo },
      { id: 'about', label: 'About', icon: Info },
    ],
    [],
  )

  const totalXp = useMemo(() => {
    if (!rootIndex) return 0
    let xp = 0
    for (const lang of rootIndex.languages) {
      const b = homeBundles[lang.id]
      if (!b) continue
      for (const { file } of b.sections) {
        for (const lvl of file.levels) {
          xp += computeLevelXp(lang.id, lvl)
        }
      }
    }
    return xp
  }, [homeBundles, rootIndex])

  const xpCurrentLevel = totalXp % 100
  const xpLevel = Math.floor(totalXp / 100)

  const continueTarget = (() => {
    if (!rootIndex) return null
    try {
      const raw = localStorage.getItem(LAST_LEVEL_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as {
          languageId?: string
          languagePath?: string
          sectionId?: string
          levelId?: string
        }
        if (parsed.languageId && parsed.languagePath && parsed.sectionId && parsed.levelId) {
          return {
            languageId: parsed.languageId,
            languagePath: parsed.languagePath,
            sectionId: parsed.sectionId,
            levelId: parsed.levelId,
          }
        }
      }
    } catch {
      // ignore malformed local storage
    }

    for (const lang of rootIndex.languages) {
      const b = homeBundles[lang.id]
      if (!b) continue
      for (const section of b.sections) {
        for (let i = 0; i < section.file.levels.length; i += 1) {
          const lvl = section.file.levels[i]
          if (!isLevelUnlocked(lang.id, section.file.levels, i)) continue
          const p = loadProgress(lang.id, lvl.id)
          if (!p.testPassed) {
            return {
              languageId: lang.id,
              languagePath: lang.path,
              sectionId: section.sectionRef.id,
              levelId: lvl.id,
            }
          }
        }
      }
    }
    return null
  })()

  const checkChallenge = async (ch: Challenge) => {
    if (!languageId || !selectedLevel) return
    setChallengeErrorUiEpoch((prev) => ({ ...prev, [ch.id]: (prev[ch.id] ?? 0) + 1 }))
    const answer = challengeDrafts[ch.id] ?? ''
    const before = loadProgress(languageId, selectedLevel.id)
    saveProgress(languageId, selectedLevel.id, {
      ...before,
      challengeAnswers: {
        ...(before.challengeAnswers ?? {}),
        [ch.id]: answer,
      },
    })
    let ok: boolean
    if (ch.validation.mode === 'python_tests') {
      const tests = ch.validation.tests ?? []
      const run = await runPythonChallengeTests(answer, ch.validation.setupCode, tests)
      setChallengeTestResults((prev) => ({ ...prev, [ch.id]: run.tests }))
      setChallengeRuntimeError((prev) => ({ ...prev, [ch.id]: run.error }))
      setChallengeErrorExpanded((prev) => ({ ...prev, [ch.id]: false }))
      setChallengeAiHelp((prev) => ({ ...prev, [ch.id]: null }))
      setChallengeAiLoading((prev) => ({ ...prev, [ch.id]: false }))
      setChallengeFixCopied((prev) => ({ ...prev, [ch.id]: false }))
      ok = run.passed
    } else {
      ok = validateAgainst(answer, ch.validation)
      setChallengeTestResults((prev) => ({ ...prev, [ch.id]: [] }))
      setChallengeRuntimeError((prev) => ({ ...prev, [ch.id]: null }))
      setChallengeErrorExpanded((prev) => ({ ...prev, [ch.id]: false }))
      setChallengeAiHelp((prev) => ({ ...prev, [ch.id]: null }))
      setChallengeAiLoading((prev) => ({ ...prev, [ch.id]: false }))
      setChallengeFixCopied((prev) => ({ ...prev, [ch.id]: false }))
    }
    if (!ok) {
      setChallengeStatus((prev) => ({ ...prev, [ch.id]: 'failed' }))
      const prev = loadProgress(languageId, selectedLevel.id)
      if (prev.challengesCompleted.includes(ch.id)) {
        saveProgress(languageId, selectedLevel.id, {
          ...prev,
          challengesCompleted: prev.challengesCompleted.filter((id) => id !== ch.id),
        })
        bump()
      }
      return
    }
    setChallengeStatus((prev) => ({ ...prev, [ch.id]: 'passed' }))
    const prev = loadProgress(languageId, selectedLevel.id)
    const challengesCompleted = [...new Set([...prev.challengesCompleted, ch.id])]
    saveProgress(languageId, selectedLevel.id, {
      ...prev,
      challengesCompleted,
      challengeAnswers: {
        ...(prev.challengeAnswers ?? {}),
        [ch.id]: answer,
      },
    })
    setStreakCount(recordDailyActivity())
    bump()
  }

  const submitTest = () => {
    if (!languageId || !selectedLevel) return
    const questions = selectedLevel.test.questions
    const passing = selectedLevel.test.passingScorePercent ?? PASS_DEFAULT
    let correct = 0
    for (const q of questions) {
      const ok = gradeQuestion(q, testShort[q.id], testMcq[q.id])
      if (ok) correct += 1
    }
    const total = questions.length
    const pct = total === 0 ? 100 : (correct / total) * 100
    const passed = pct >= passing
    setTestResult({ correct, total, passed })
    const prev = loadProgress(languageId, selectedLevel.id)
    saveProgress(languageId, selectedLevel.id, {
      ...prev,
      testPassed: prev.testPassed || passed,
    })
    setStreakCount(recordDailyActivity())
    bump()
  }

  const runSandbox = async () => {
    setSandboxRunning(true)
    setSandboxError(null)
    setSandboxOutput('Running...')
    setSandboxAiHelp(null)
    setSandboxAiLoading(false)
    setSandboxFixCopied(false)
    const result = await runPythonCode(sandboxCode)
    setSandboxOutput(result.output.trim() ? result.output : '[no output]')
    setSandboxError(result.error)
    setSandboxErrorUiEpoch((n) => n + 1)
    setSandboxErrorExpanded(false)
    setSandboxRunning(false)
  }

  const resetSandbox = () => {
    setSandboxCode(DEFAULT_SANDBOX_CODE)
    setSandboxOutput('')
    setSandboxError(null)
    setSandboxErrorExpanded(false)
    setSandboxAiHelp(null)
    setSandboxAiLoading(false)
    setSandboxFixCopied(false)
  }

  const copyToClipboard = async (text: string): Promise<boolean> => {
    if (!text.trim()) return false
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      return false
    }
  }

  const requestSandboxAiHelp = async () => {
    if (!sandboxError || sandboxAiLoading) return
    setSandboxAiLoading(true)
    setSandboxFixCopied(false)
    try {
      const help = await getFreePythonAiHelp({
        userCode: sandboxCode,
        error: sandboxError,
        context: 'sandbox',
      })
      setSandboxAiHelp(help)
    } catch (error: unknown) {
      setSandboxAiHelp({
        explanation: error instanceof Error ? error.message : 'AI Help failed. Please try again.',
        fix: '',
        nextStep: '',
        text: error instanceof Error ? error.message : 'AI Help failed. Please try again.',
      })
    } finally {
      setSandboxAiLoading(false)
    }
  }

  const requestChallengeAiHelp = async (challengeId: string, userCode: string, error: FriendlyPythonError) => {
    if (challengeAiLoading[challengeId]) return
    setChallengeAiLoading((prev) => ({ ...prev, [challengeId]: true }))
    setChallengeFixCopied((prev) => ({ ...prev, [challengeId]: false }))
    try {
      const help = await getFreePythonAiHelp({
        userCode,
        error,
        context: 'challenge',
      })
      setChallengeAiHelp((prev) => ({ ...prev, [challengeId]: help }))
    } catch (err: unknown) {
      setChallengeAiHelp((prev) => ({
        ...prev,
        [challengeId]: {
          explanation: err instanceof Error ? err.message : 'AI Help failed. Please try again.',
          fix: '',
          nextStep: '',
          text: err instanceof Error ? err.message : 'AI Help failed. Please try again.',
        },
      }))
    } finally {
      setChallengeAiLoading((prev) => ({ ...prev, [challengeId]: false }))
    }
  }

  const sandboxErrorPointer = useMemo(() => {
    if (!sandboxError?.line) return null
    const lines = sandboxCode.split('\n')
    const lineIndex = sandboxError.line - 1
    if (lineIndex < 0 || lineIndex >= lines.length) return null
    const text = lines[lineIndex] ?? ''
    const col = Math.max(1, sandboxError.column ?? 1)
    const caretPad = ' '.repeat(Math.max(0, col - 1))
    return {
      line: sandboxError.line,
      text,
      caret: `${caretPad}^`,
      column: sandboxError.column,
    }
  }, [sandboxCode, sandboxError])

  const renderLearn = () => {
    if (rootError) {
      return <div className="cq-panel cq-error">{rootError}</div>
    }
    if (!rootIndex) {
      return <div className="cq-panel cq-muted">Loading catalog…</div>
    }

    if (learnView === 'languages') {
      return (
        <div className="cq-stack">
          <h1 className="cq-title">Home</h1>
          <div className="cq-panel cq-home-panel">
            <button
              type="button"
              className="cq-btn cq-btn--primary cq-continue-btn"
              onClick={() => {
                if (continueTarget) {
                  void openLevelByPath(continueTarget)
                }
              }}
              disabled={!continueTarget}
            >
              <Play size={16} />
              Continue your Quest
            </button>
            <div className="cq-home-kpis">
              <div className="cq-kpi">
                <div className="cq-kpi-label">
                  <Zap size={14} />
                  XP
                </div>
                <div className="cq-kpi-value">Level {xpLevel}</div>
                <div className="cq-progress-bar" aria-label="XP progress">
                  <div className="cq-progress-bar-fill" style={{ width: `${xpCurrentLevel}%` }} />
                </div>
                <div className="cq-kpi-muted">
                  {xpCurrentLevel}/100 · {totalXp} total XP
                </div>
              </div>
              <div className="cq-kpi">
                <div className="cq-kpi-label">
                  <Flame size={14} />
                  Daily streak
                </div>
                <div className="cq-kpi-value">{streakCount} day{streakCount === 1 ? '' : 's'}</div>
                <div className="cq-kpi-muted">Complete any challenge or test to keep streak alive.</div>
              </div>
            </div>
          </div>
          <p className="cq-lead">Pick a language. Lessons and quizzes load from JSON — edit files under `public/content/`.</p>
          <ul className="cq-card-list">
            {rootIndex.languages.map((lang) => (
              <li key={lang.id}>
                <button type="button" className="cq-card-btn" onClick={() => void openLanguage(lang.path, lang.id)}>
                  <span className="cq-card-title">{lang.title}</span>
                  <span className="cq-card-meta">{lang.id}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )
    }

    if (bundleError || !bundle) {
      return <div className="cq-panel cq-error">{bundleError ?? 'Loading…'}</div>
    }

    if (learnView === 'sections') {
      return (
        <div className="cq-stack">
          <h1 className="cq-title">{bundle.index.title}</h1>
          <p className="cq-lead">Sections</p>
          <ul className="cq-card-list">
            {bundle.index.sections.map((sec) => {
              const loaded = bundle.sections.find((s) => s.sectionRef.id === sec.id)
              const levels = loaded?.file.levels ?? []
              const completedCount =
                languageId && levels.length > 0
                  ? levels.filter((lvl) => loadProgress(languageId, lvl.id).testPassed).length
                  : 0
              const pct = levels.length > 0 ? Math.round((completedCount / levels.length) * 100) : 0
              const sectionXp =
                languageId && levels.length > 0
                  ? levels.reduce((sum, lvl) => sum + computeLevelXp(languageId, lvl), 0)
                  : 0

              return (
                <li key={sec.id}>
                  <button
                    type="button"
                    className="cq-card-btn"
                    onClick={() => {
                      setSectionId(sec.id)
                      setLearnView('levels')
                    }}
                  >
                    <span className="cq-card-title">{sec.title}</span>
                    <span className="cq-card-meta">
                      {completedCount}/{levels.length} levels complete · {sectionXp} XP
                    </span>
                    <div className="cq-progress-bar" aria-label={`${sec.title} progress`}>
                      <div className="cq-progress-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )
    }

    if (learnView === 'levels' && selectedSection) {
      return (
        <div className="cq-stack">
          <h1 className="cq-title">{selectedSection.sectionRef.title}</h1>
          <ul className="cq-card-list">
            {selectedSection.file.levels.map((lvl) => {
              const levelIndex = selectedSection.file.levels.findIndex((v) => v.id === lvl.id)
              const locked = !languageId
                ? false
                : !isLevelUnlocked(languageId, selectedSection.file.levels, levelIndex)
              const p = languageId ? loadProgress(languageId, lvl.id) : null
              const challengesDone =
                lvl.challenges.length === 0 ||
                lvl.challenges.every((c) => p?.challengesCompleted.includes(c.id))
              const done = Boolean(p && challengesDone && p.testPassed)
              const partial = Boolean(p && !done && (p.challengesCompleted.length > 0 || p.testPassed))
              return (
                <li key={lvl.id}>
                  <button
                    type="button"
                    className={`cq-card-btn${locked ? ' cq-card-btn--locked' : ''}`}
                    disabled={locked}
                    onClick={() => {
                      if (locked || !languageId) return
                      setLevelId(lvl.id)
                      setLevelStep('intro')
                      setLearnView('level')
                      resetLevelWorkState(lvl, languageId)
                      localStorage.setItem(
                        LAST_LEVEL_STORAGE_KEY,
                        JSON.stringify({
                          languageId,
                          languagePath:
                            rootIndex?.languages.find((lang) => lang.id === languageId)?.path ?? '',
                          sectionId: selectedSection.sectionRef.id,
                          levelId: lvl.id,
                        }),
                      )
                    }}
                  >
                    <span className="cq-card-title">{lvl.title}</span>
                    <span className="cq-card-meta">
                      {locked
                        ? 'Locked · pass previous test to unlock'
                        : done
                          ? 'Completed'
                          : partial
                            ? 'In progress'
                            : 'Not started'}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )
    }

    if (learnView === 'level' && selectedLevel && languageId) {
      const prog = loadProgress(languageId, selectedLevel.id)
      const stepTabs: { id: LevelStep; label: string }[] = [
        { id: 'intro', label: 'Intro' },
        { id: 'challenges', label: 'Challenges' },
        { id: 'test', label: 'Test' },
      ]

      return (
        <div className="cq-stack cq-level">
          <h1 className="cq-title">{selectedLevel.title}</h1>
          <div className="cq-step-tabs" role="tablist">
            {stepTabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={levelStep === t.id}
                className={`cq-step-tab${levelStep === t.id ? ' cq-step-tab--active' : ''}`}
                onClick={() => setLevelStep(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {levelStep === 'intro' && (
            <section className="cq-panel">
              {selectedLevel.intro.title && <h2 className="cq-subtitle">{selectedLevel.intro.title}</h2>}
              <SimpleMarkdown text={selectedLevel.intro.bodyMarkdown} />
              {selectedLevel.intro.readMore && (
                <div className="cq-row">
                  <button
                    type="button"
                    className="cq-btn cq-btn--primary"
                    onClick={() => setReadMoreOpen(true)}
                  >
                    {selectedLevel.intro.readMore.label ?? 'Read more'}
                  </button>
                </div>
              )}

              {languageId === 'python' && (
                <section className="cq-sandbox">
                  <h3 className="cq-sandbox-title">Sandbox</h3>
                  <p className="cq-muted">You can try some python code here.</p>
                  <label className="cq-label" htmlFor="python-sandbox-input">
                    Python code
                  </label>
                  <div className="cq-sandbox-snippets">
                    {SANDBOX_SNIPPETS.map((snippet) => (
                      <button
                        key={snippet.id}
                        type="button"
                        className="cq-btn cq-btn--snippet"
                        onClick={() => setSandboxCode(snippet.code)}
                      >
                        {snippet.label}
                      </button>
                    ))}
                  </div>
                  <CodeTextareaWithErrorLine
                    id="python-sandbox-input"
                    className="cq-code-input cq-sandbox-input"
                    rows={6}
                    spellCheck={false}
                    value={sandboxCode}
                    onChange={(e) => setSandboxCode(e.target.value)}
                    errorLine={sandboxError?.line ?? null}
                    errorSummary={
                      sandboxError?.detail ? pythonErrorSummaryLine(sandboxError.detail) : null
                    }
                    errorTitle={sandboxError?.title ?? null}
                    errorColumn={sandboxError?.column ?? null}
                    errorUiEpoch={sandboxErrorUiEpoch}
                  />
                  <div className="cq-row">
                    <button
                      type="button"
                      className="cq-btn cq-btn--primary"
                      onClick={() => void runSandbox()}
                      disabled={sandboxRunning}
                    >
                      {sandboxRunning ? 'Running...' : 'Run code'}
                    </button>
                    <button
                      type="button"
                      className="cq-btn"
                      onClick={resetSandbox}
                      disabled={sandboxRunning}
                    >
                      Reset code
                    </button>
                  </div>
                  <div className="cq-label">Output</div>
                  <pre className="cq-sandbox-output">{sandboxOutput || 'Run code to see output.'}</pre>
                  {sandboxError && (
                    <div className="cq-sandbox-error" role="alert">
                      <div className="cq-sandbox-error-title">{sandboxError.title}</div>
                      {sandboxError.tip && (
                        <div className="cq-sandbox-error-tip">{sandboxError.tip}</div>
                      )}
                      <button
                        type="button"
                        className="cq-sandbox-error-toggle"
                        onClick={() => setSandboxErrorExpanded((v) => !v)}
                        aria-expanded={sandboxErrorExpanded}
                      >
                        {sandboxErrorExpanded ? (
                          <>
                            Hide full error <ChevronUp size={14} />
                          </>
                        ) : (
                          <>
                            Show full error <ChevronDown size={14} />
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="cq-sandbox-error-toggle"
                        onClick={() => void requestSandboxAiHelp()}
                        disabled={sandboxAiLoading}
                      >
                        {sandboxAiLoading ? 'AI is thinking...' : 'AI Help'}
                      </button>
                      {sandboxErrorExpanded && (
                        <div className="cq-sandbox-error-detail">{sandboxError.detail}</div>
                      )}
                      {sandboxAiHelp && (
                        <>
                          <div className="cq-ai-help-text">{sandboxAiHelp.text}</div>
                          {sandboxAiHelp.fix && (
                            <div className="cq-ai-help-actions">
                              <button
                                type="button"
                                className="cq-sandbox-error-toggle"
                                onClick={() =>
                                  void copyToClipboard(sandboxAiHelp.fix).then((ok) => setSandboxFixCopied(ok))
                                }
                              >
                                {sandboxFixCopied ? 'Copied!' : 'Copy fix'}
                              </button>
                            </div>
                          )}
                        </>
                      )}
                      {sandboxErrorPointer && (
                        <pre className="cq-sandbox-error-pointer">
{`Line ${sandboxErrorPointer.line}${sandboxErrorPointer.column ? `, Col ${sandboxErrorPointer.column}` : ''}
${sandboxErrorPointer.text}
${sandboxErrorPointer.caret}`}
                        </pre>
                      )}
                    </div>
                  )}
                </section>
              )}
            </section>
          )}

          {levelStep === 'challenges' && (
            <section className="cq-challenges">
              {selectedLevel.challenges.map((ch) => {
                const done = prog.challengesCompleted.includes(ch.id)
                const status = challengeStatus[ch.id]
                const pyRuntimeErr = challengeRuntimeError[ch.id] ?? null
                const pyErrExpanded = challengeErrorExpanded[ch.id] ?? false
                const pyAiHelp = challengeAiHelp[ch.id] ?? null
                const pyAiLoading = challengeAiLoading[ch.id] ?? false
                const pyFixCopied = challengeFixCopied[ch.id] ?? false
                const pyErrPointer =
                  ch.validation.mode === 'python_tests' && pyRuntimeErr
                    ? pythonErrorLinePointer(challengeDrafts[ch.id] ?? '', pyRuntimeErr)
                    : null
                return (
                  <div key={ch.id} className="cq-panel cq-challenge-card">
                    <h2 className="cq-subtitle">{ch.title}</h2>
                    <SimpleMarkdown text={ch.promptMarkdown} />
                    <label className="cq-label" htmlFor={`code-${ch.id}`}>
                      Your answer
                    </label>
                    <CodeTextareaWithErrorLine
                      id={`code-${ch.id}`}
                      className="cq-code-input"
                      rows={4}
                      spellCheck={false}
                      value={challengeDrafts[ch.id] ?? ''}
                      onChange={(e) => {
                        const nextValue = e.target.value
                        setChallengeDrafts((prev) => ({
                          ...prev,
                          [ch.id]: nextValue,
                        }))
                        if (languageId && selectedLevel) {
                          const p = loadProgress(languageId, selectedLevel.id)
                          saveProgress(languageId, selectedLevel.id, {
                            ...p,
                            challengeAnswers: {
                              ...(p.challengeAnswers ?? {}),
                              [ch.id]: nextValue,
                            },
                          })
                        }
                      }}
                      errorLine={
                        ch.validation.mode === 'python_tests' && pyRuntimeErr?.line != null
                          ? pyRuntimeErr.line
                          : null
                      }
                      errorSummary={
                        ch.validation.mode === 'python_tests' && pyRuntimeErr?.detail
                          ? pythonErrorSummaryLine(pyRuntimeErr.detail)
                          : null
                      }
                      errorTitle={ch.validation.mode === 'python_tests' ? (pyRuntimeErr?.title ?? null) : null}
                      errorColumn={
                        ch.validation.mode === 'python_tests' ? (pyRuntimeErr?.column ?? null) : null
                      }
                      errorUiEpoch={challengeErrorUiEpoch[ch.id] ?? 0}
                    />
                    {ch.hints && ch.hints.length > 0 && (
                      <details className="cq-hints">
                        <summary>Hints</summary>
                        <ul>
                          {ch.hints.map((h, i) => (
                            <li key={i}>{h}</li>
                          ))}
                        </ul>
                      </details>
                    )}
                    <div className="cq-row">
                      <button
                        type="button"
                        className="cq-btn cq-btn--primary"
                        onClick={() => void checkChallenge(ch)}
                      >
                        {status === 'failed' ? 'Try again' : done ? 'Check again' : 'Check'}
                      </button>
                      {done && status !== 'failed' && (challengeDrafts[ch.id] ?? '').trim() !== '' ? (
                        <span className="cq-badge cq-badge--ok">Challenge complete</span>
                      ) : null}
                    </div>
                    {ch.validation.mode === 'python_tests' && pyRuntimeErr && (
                      <div className="cq-sandbox-error" role="alert">
                        <div className="cq-sandbox-error-title">{pyRuntimeErr.title}</div>
                        {pyRuntimeErr.tip && (
                          <div className="cq-sandbox-error-tip">{pyRuntimeErr.tip}</div>
                        )}
                        <button
                          type="button"
                          className="cq-sandbox-error-toggle"
                          onClick={() =>
                            setChallengeErrorExpanded((prev) => ({
                              ...prev,
                              [ch.id]: !(prev[ch.id] ?? false),
                            }))
                          }
                          aria-expanded={pyErrExpanded}
                        >
                          {pyErrExpanded ? (
                            <>
                              Hide full error <ChevronUp size={14} />
                            </>
                          ) : (
                            <>
                              Show full error <ChevronDown size={14} />
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          className="cq-sandbox-error-toggle"
                          onClick={() =>
                            void requestChallengeAiHelp(ch.id, challengeDrafts[ch.id] ?? '', pyRuntimeErr)
                          }
                          disabled={pyAiLoading}
                        >
                          {pyAiLoading ? 'AI is thinking...' : 'AI Help'}
                        </button>
                        {pyErrExpanded && (
                          <div className="cq-sandbox-error-detail">{pyRuntimeErr.detail}</div>
                        )}
                        {pyAiHelp && (
                          <>
                            <div className="cq-ai-help-text">{pyAiHelp.text}</div>
                            {pyAiHelp.fix && (
                              <div className="cq-ai-help-actions">
                                <button
                                  type="button"
                                  className="cq-sandbox-error-toggle"
                                  onClick={() =>
                                    void copyToClipboard(pyAiHelp.fix).then((ok) =>
                                      setChallengeFixCopied((prev) => ({ ...prev, [ch.id]: ok })),
                                    )
                                  }
                                >
                                  {pyFixCopied ? 'Copied!' : 'Copy fix'}
                                </button>
                              </div>
                            )}
                          </>
                        )}
                        {pyErrPointer && (
                          <pre className="cq-sandbox-error-pointer">
{`Line ${pyErrPointer.line}${pyErrPointer.column ? `, Col ${pyErrPointer.column}` : ''}
${pyErrPointer.text}
${pyErrPointer.caret}`}
                          </pre>
                        )}
                      </div>
                    )}
                    {(challengeTestResults[ch.id]?.length ?? 0) > 0 && (
                      <ul className="cq-testcase-list">
                        {challengeTestResults[ch.id].map((t) => (
                          <li
                            key={t.id}
                            className={`cq-testcase-item${t.passed ? ' cq-testcase-item--pass' : ' cq-testcase-item--fail'}`}
                          >
                            <span>{t.label}</span>
                            <span>{t.passed ? 'Pass' : 'Fail'}</span>
                            {!t.passed && t.detail ? (
                              <div className="cq-testcase-detail">{t.detail}</div>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              })}
            </section>
          )}

          {levelStep === 'test' && (
            <section className="cq-panel cq-test">
              <p className="cq-muted">
                Passing score: {selectedLevel.test.passingScorePercent ?? PASS_DEFAULT}% ·{' '}
                {prog.testPassed ? 'You already passed at least once.' : 'Answer all questions, then Submit.'}
              </p>
              <ol className="cq-test-list">
                {selectedLevel.test.questions.map((q, qi) => (
                  <li key={q.id} className="cq-test-item">
                    <div className="cq-test-prompt">
                      <span className="cq-test-num">{qi + 1}.</span>
                      <div>
                        {q.type === 'mcq' ? (
                          <>
                            <p>{q.prompt}</p>
                            <div className="cq-mcq">
                              {q.choices.map((c) => (
                                <label key={c.id} className="cq-mcq-opt">
                                  <input
                                    type="radio"
                                    name={`mcq-${q.id}`}
                                    checked={testMcq[q.id] === c.id}
                                    onChange={() => setTestMcq((prev) => ({ ...prev, [q.id]: c.id }))}
                                  />
                                  <span>{c.label}</span>
                                </label>
                              ))}
                            </div>
                          </>
                        ) : (
                          <>
                            <SimpleMarkdown text={q.prompt} />
                            <textarea
                              className="cq-code-input"
                              rows={2}
                              spellCheck={false}
                              value={testShort[q.id] ?? ''}
                              onChange={(e) =>
                                setTestShort((prev) => ({
                                  ...prev,
                                  [q.id]: e.target.value,
                                }))
                              }
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
              <button type="button" className="cq-btn cq-btn--primary" onClick={submitTest}>
                Submit test
              </button>
              {testResult && (
                <p className={testResult.passed ? 'cq-score cq-score--pass' : 'cq-score cq-score--fail'}>
                  Score {testResult.correct}/{testResult.total} ({Math.round((testResult.correct / Math.max(testResult.total, 1)) * 100)}
                  %){' '}
                  {testResult.passed ? 'Passed' : 'Not passed'}
                </p>
              )}
            </section>
          )}
        </div>
      )
    }

    return null
  }

  const renderProgress = () => {
    if (progressLoading) return <div className="cq-panel cq-muted">Loading progress…</div>
    if (progressError) return <div className="cq-panel cq-error">{progressError}</div>
    if (!rootIndex) return <div className="cq-panel cq-muted">Open the Learn tab once to load catalog.</div>

    const rows: { lang: string; section: string; level: Level; prog: ReturnType<typeof loadProgress> }[] = []
    for (const lang of rootIndex.languages) {
      const b = progressBundles[lang.id]
      if (!b) continue
      for (const { sectionRef, file } of b.sections) {
        for (const lvl of file.levels) {
          rows.push({
            lang: lang.title,
            section: sectionRef.title,
            level: lvl,
            prog: loadProgress(lang.id, lvl.id),
          })
        }
      }
    }

    return (
      <div className="cq-stack">
        <h1 className="cq-title">Progress</h1>
        <p className="cq-lead">Stored only on this device (`localStorage`).</p>
        <ul className="cq-progress-list">
          {rows.map((r) => {
            const totalCh = r.level.challenges.length
            const chDone = r.prog.challengesCompleted.length
            const challengesOk = totalCh === 0 || chDone >= totalCh
            return (
              <li key={`${r.level.id}-${r.section}`} className="cq-progress-row">
                <div>
                  <div className="cq-progress-title">{r.level.title}</div>
                  <div className="cq-progress-meta">
                    {r.lang} · {r.section}
                  </div>
                </div>
                <div className="cq-progress-tags">
                  <span className={challengesOk ? 'cq-tag cq-tag--ok' : 'cq-tag'}>
                    Challenges {Math.min(chDone, totalCh)}/{totalCh}
                  </span>
                  <span className={r.prog.testPassed ? 'cq-tag cq-tag--ok' : 'cq-tag'}>
                    Test {r.prog.testPassed ? 'passed' : 'open'}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  const showBack = tab === 'learn' && learnView !== 'languages'

  const shellClassName =
    platform === 'android'
      ? 'cq-shell cq-shell--android'
      : platform === 'ios'
        ? 'cq-shell cq-shell--ios'
        : 'cq-shell'

  const installSteps = installInstructions(platform).split('\n').slice(1)

  return (
    <div className={shellClassName}>
      <header className="cq-header">
        {showBack ? (
          <button type="button" className="cq-back" onClick={back} aria-label="Back">
            <ChevronLeft size={22} />
          </button>
        ) : (
          <span className="cq-header-spacer" aria-hidden />
        )}
        <div className="cq-brand">CodeQuest</div>
        <span className="cq-header-spacer" aria-hidden />
      </header>

      <main className="cq-main">{tab === 'learn' ? renderLearn() : tab === 'progress' ? renderProgress() : (
        <div className="cq-stack cq-about">
          <h1 className="cq-title">About</h1>
          <p className="cq-lead">
            CodeQuest is a configurable PWA for learning syntax and concepts. Challenges check your answers with patterns you define in JSON — no cloud compiler.
          </p>
          <section>
            <h2 className="cq-subtitle">Install on your phone</h2>
            <p className="cq-muted cq-install-intro">{installInstructions(platform).split('\n')[0]}</p>
            <ol className="cq-install-steps">
              {installSteps.map((step) => (
                <li key={step}>{step.replace(/^\d+\.\s*/, '')}</li>
              ))}
            </ol>
          </section>
          <p className="cq-muted">Version {APP_VERSION}</p>
        </div>
      )}</main>

      <BottomNav items={navItems} activeId={tab} onSelect={(id) => setTab(id as TabId)} />

      {readMoreOpen && selectedLevel?.intro.readMore && (
        <div
          className="cq-modal-backdrop"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setReadMoreOpen(false)
          }}
        >
          <div
            className="cq-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedLevel.title} read more`}
          >
            <div className="cq-modal-header">
              <div className="cq-modal-title">Read more</div>
              <button
                type="button"
                className="cq-icon-btn"
                aria-label="Close article"
                onClick={() => setReadMoreOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="cq-modal-credit">
              Source: {selectedLevel.intro.readMore.source}
              {' · '}
              <a href={selectedLevel.intro.readMore.url} target="_blank" rel="noreferrer">
                Open original <ExternalLink size={14} />
              </a>
            </div>

            <iframe
              className="cq-modal-frame"
              title={`${selectedLevel.title} reference`}
              src={selectedLevel.intro.readMore.url}
            />

            <div className="cq-modal-actions">
              <button type="button" className="cq-btn" onClick={() => setReadMoreOpen(false)}>
                Close and return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
