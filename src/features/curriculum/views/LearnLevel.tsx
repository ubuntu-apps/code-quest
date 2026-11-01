import { useRef, type ReactNode } from 'react'
import type { Challenge, Level, TestGradeResult } from '../types'
import { saveProgress, type LevelProgress } from '../progressStorage'
import type { ChallengeTestResult, FriendlyCodeError } from '../../languages'
import { STEP_PANEL_ID, stepTabId, type LevelStep } from '../constants'
import { EditableText } from '../../editor'
import { AddItemButton } from '../../editor'
import { ChallengeCard } from '../components/ChallengeCard'
import { LevelStepNav } from '../components/LevelStepNav'
import { StepFlipper } from '../components/StepFlipper'
import { useStepScrollMemory } from '../hooks/useStepScrollMemory'
import { IntroStep } from './IntroStep'
import { TestStep } from './TestStep'
import { CodeLanguageContext } from '../codeLanguageContext'

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

interface LearnLevelProps {
  level: Level
  languageId: string
  levelStep: LevelStep
  prog: LevelProgress
  onLevelStepChange: (step: LevelStep) => void
  onUpdateLevelTitle: (title: string) => void
  onUpdateIntro: (patch: Partial<Level['intro']>) => void
  onReadMoreOpen: () => void
  sandboxCode: string
  sandboxOutput: string
  sandboxRunning: boolean
  sandboxError: FriendlyCodeError | null
  sandboxErrorUiEpoch: number
  onSandboxCodeChange: (code: string) => void
  onSandboxRun: (stdin: string) => void
  onSandboxStop: () => void
  onSandboxReset: () => void
  onSandboxErrorClear: () => void
  challengeDrafts: Record<string, string>
  challengeStatus: Record<string, 'passed' | 'failed'>
  challengeTestResults: Record<string, ChallengeTestResult[]>
  challengeRuntimeError: Record<string, FriendlyCodeError | null>
  challengeErrorExpanded: Record<string, boolean>
  challengeErrorUiEpoch: Record<string, number>
  /** Challenges being checked now, with a progress message. */
  challengeChecking: Record<string, string>
  /** Challenges whose code is running (Run button), with a progress message. */
  challengeRunning: Record<string, string>
  /** What each challenge's code printed on its last Run or Check. */
  challengeOutput: Record<string, string | null>
  onRunChallenge: (challenge: Challenge) => void
  onChallengeDraftChange: (challengeId: string, value: string) => void
  onCheckChallenge: (challenge: Challenge) => void
  onStopChallengeCheck: (challengeId: string) => void
  onRevealAnswer: (challengeId: string) => void
  onUpdateChallenge: (challengeId: string, patch: Partial<Challenge>) => void
  onMoveChallenge: (challengeId: string, direction: -1 | 1) => void
  onRemoveChallenge: (challengeId: string) => void
  onAddChallenge: () => void
  onToggleChallengeErrorExpanded: (challengeId: string) => void
  testShort: Record<string, string>
  testMcq: Record<string, string>
  testResult: TestGradeResult | null
  /** Questions changed since the last Submit (their marks are hidden). */
  testEdited: Record<string, true>
  onTestShortChange: (questionId: string, value: string) => void
  onTestMcqChange: (questionId: string, choiceId: string) => void
  onUpdatePassingScore: (score: number) => void
  onUpdateQuestion: (questionId: string, question: import('../types').TestQuestion) => void
  onMoveQuestion: (questionId: string, direction: -1 | 1) => void
  onRemoveQuestion: (questionId: string) => void
  onAddQuestion: (type: 'mcq' | 'shortText') => void
  onSubmitTest: () => void
  onRetakeTest: () => void
  showNext: boolean
  nextLevelTitle: string | null
  onGoToNextLevel: () => void
  /** Shown under a passed quiz: "Section complete" when this lesson finished its section. */
  afterQuizPassed?: ReactNode
}

export function LearnLevel({
  level,
  languageId,
  levelStep,
  prog,
  onLevelStepChange,
  onUpdateLevelTitle,
  onUpdateIntro,
  onReadMoreOpen,
  sandboxCode,
  sandboxOutput,
  sandboxRunning,
  sandboxError,
  sandboxErrorUiEpoch,
  onSandboxCodeChange,
  onSandboxRun,
  onSandboxStop,
  onSandboxReset,
  onSandboxErrorClear,
  challengeDrafts,
  challengeStatus,
  challengeTestResults,
  challengeRuntimeError,
  challengeErrorExpanded,
  challengeErrorUiEpoch,
  challengeChecking,
  challengeRunning,
  challengeOutput,
  onRunChallenge,
  onChallengeDraftChange,
  onCheckChallenge,
  onStopChallengeCheck,
  onRevealAnswer,
  onUpdateChallenge,
  onMoveChallenge,
  onRemoveChallenge,
  onAddChallenge,
  onToggleChallengeErrorExpanded,
  testShort,
  testMcq,
  testResult,
  testEdited,
  onTestShortChange,
  onTestMcqChange,
  onUpdatePassingScore,
  onUpdateQuestion,
  onMoveQuestion,
  onRemoveQuestion,
  onAddQuestion,
  onSubmitTest,
  onRetakeTest,
  showNext,
  nextLevelTitle,
  onGoToNextLevel,
  afterQuizPassed,
}: LearnLevelProps) {
  // Each step keeps its own place: back from a look at the intro to the challenge you were on.
  useStepScrollMemory(level.id, levelStep)
  const topTabs = useRef<HTMLDivElement>(null)
  const bottomTabs = useRef<HTMLDivElement>(null)

  const handleStepChange = onLevelStepChange

  const handleGoToNext = () => {
    onGoToNextLevel()
    scrollToTop()
  }

  const isDone = (id: string) => prog.challengesCompleted.includes(id)
  const stepNavProps = {
    levelStep,
    showNext,
    nextLevelTitle,
    onLevelStepChange: handleStepChange,
    onGoToNextLevel: handleGoToNext,
    challengeCount: { done: level.challenges.filter((c) => isDone(c.id)).length, total: level.challenges.length },
    testPassed: prog.testPassed,
  }

  /** After a solve: scroll to the next unsolved challenge, or go on to the quiz. */
  const nextAfter = (chIndex: number): { label: string; go: () => void } => {
    const rest = [...level.challenges.slice(chIndex + 1), ...level.challenges.slice(0, chIndex)]
    const next = rest.find((c) => !isDone(c.id))
    if (!next) return { label: 'Go to the gate', go: () => handleStepChange('quiz') }
    return {
      label: 'Next challenge',
      go: () => document.getElementById(`challenge-${next.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    }
  }

  return (
    <CodeLanguageContext.Provider value={languageId}>
      <div className="cq-stack cq-level">
        <EditableText
          as="h1"
          className="cq-title"
          value={level.title}
          onChange={onUpdateLevelTitle}
        />
        <LevelStepNav {...stepNavProps} ref={topTabs} />

        {prog.challengesReset ? (
          <div className="cq-reset-note" role="status">
            <p>
              {prog.challengesReset === 1
                ? 'This stage was updated since you last worked on it, so your earlier answer to one challenge was cleared.'
                : `This stage was updated since you last worked on it, so your earlier answers to ${prog.challengesReset} challenges were cleared.`}{' '}
              Cleared gates always stay cleared.
            </p>
            <button
              type="button"
              className="cq-btn cq-btn--sm"
              onClick={() => saveProgress(languageId, level.id, { ...prog, challengesReset: undefined })}
            >
              OK
            </button>
          </div>
        ) : null}

        {/* Same stacking as the page, so wrapping the step changes nothing on screen. */}
        <div className="cq-stack" role="tabpanel" id={STEP_PANEL_ID} aria-labelledby={stepTabId(levelStep)}>
          {levelStep === 'intro' && (
            <IntroStep
              level={level}
              languageId={languageId}
              sandboxCode={sandboxCode}
              sandboxOutput={sandboxOutput}
              sandboxRunning={sandboxRunning}
              sandboxError={sandboxError}
              sandboxErrorUiEpoch={sandboxErrorUiEpoch}
              onUpdateIntro={onUpdateIntro}
              onReadMoreOpen={onReadMoreOpen}
              onSandboxCodeChange={onSandboxCodeChange}
              onSandboxRun={onSandboxRun}
              onSandboxStop={onSandboxStop}
              onSandboxReset={onSandboxReset}
              onSandboxErrorClear={onSandboxErrorClear}
            />
          )}

          {levelStep === 'challenges' && (
            <section className="cq-challenges">
              {level.challenges.map((ch, chIndex) => (
                <ChallengeCard
                  key={ch.id}
                  challenge={ch}
                  tables={level.database?.tables}
                  setupSql={level.database?.setupSql}
                  chIndex={chIndex}
                  totalChallenges={level.challenges.length}
                  draft={challengeDrafts[ch.id] ?? ''}
                  done={prog.challengesCompleted.includes(ch.id)}
                  status={challengeStatus[ch.id]}
                  answerViewed={prog.answersViewed?.includes(ch.id) ?? false}
                  testResults={challengeTestResults[ch.id] ?? []}
                  runtimeError={challengeRuntimeError[ch.id] ?? null}
                  errorExpanded={challengeErrorExpanded[ch.id] ?? false}
                  errorUiEpoch={challengeErrorUiEpoch[ch.id] ?? 0}
                  checkingMessage={challengeChecking[ch.id] ?? null}
                  runningMessage={challengeRunning[ch.id] ?? null}
                  output={challengeOutput[ch.id] ?? null}
                  onRun={() => onRunChallenge(ch)}
                  onDraftChange={(value) => onChallengeDraftChange(ch.id, value)}
                  onCheck={() => onCheckChallenge(ch)}
                  onStopCheck={() => onStopChallengeCheck(ch.id)}
                  onRevealAnswer={() => onRevealAnswer(ch.id)}
                  onUpdateChallenge={(patch) => onUpdateChallenge(ch.id, patch)}
                  onMove={(dir) => onMoveChallenge(ch.id, dir)}
                  onDelete={() => onRemoveChallenge(ch.id)}
                  onToggleErrorExpanded={() => onToggleChallengeErrorExpanded(ch.id)}
                  next={nextAfter(chIndex)}
                />
              ))}
              <AddItemButton label="Add challenge" onClick={onAddChallenge} />
            </section>
          )}

          {levelStep === 'quiz' && (
            <TestStep
              level={level}
              prog={prog}
              testShort={testShort}
              testMcq={testMcq}
              testResult={testResult}
              testEdited={testEdited}
              onTestShortChange={onTestShortChange}
              onTestMcqChange={onTestMcqChange}
              onUpdatePassingScore={onUpdatePassingScore}
              onUpdateQuestion={onUpdateQuestion}
              onMoveQuestion={onMoveQuestion}
              onRemoveQuestion={onRemoveQuestion}
              onAddQuestion={onAddQuestion}
              onSubmit={onSubmitTest}
              onRetake={onRetakeTest}
              nextLevelTitle={showNext ? nextLevelTitle : null}
              onGoToNextLevel={handleGoToNext}
              challengesDone={stepNavProps.challengeCount.done}
              onGoToChallenges={() => handleStepChange('challenges')}
              afterPass={afterQuizPassed}
            />
          )}
        </div>

        <LevelStepNav {...stepNavProps} placement="bottom" ref={bottomTabs} />
        <StepFlipper levelStep={levelStep} onLevelStepChange={handleStepChange} topTabs={topTabs} bottomTabs={bottomTabs} />
      </div>
    </CodeLanguageContext.Provider>
  )
}
