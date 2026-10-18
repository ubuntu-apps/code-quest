import type { Challenge, Level, TestGradeResult } from '../types'
import type { LevelProgress } from '../progressStorage'
import type { FriendlySandboxError } from '../components/CodeSandboxSection'
import type { PythonChallengeTestResult } from '../pythonSandbox'
import type { RChallengeTestResult } from '../rSandbox'
import type { LevelStep } from '../constants'
import { EditableText } from '../../editor'
import { AddItemButton } from '../../editor'
import { ChallengeCard } from '../components/ChallengeCard'
import { LevelStepNav } from '../components/LevelStepNav'
import { IntroStep } from './IntroStep'
import { TestStep } from './TestStep'

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
  sandboxError: FriendlySandboxError | null
  sandboxErrorUiEpoch: number
  onSandboxCodeChange: (code: string) => void
  onSandboxRun: (stdin: string) => void
  onSandboxStop: () => void
  onSandboxReset: () => void
  onSandboxErrorClear: () => void
  challengeDrafts: Record<string, string>
  challengeStatus: Record<string, 'passed' | 'failed'>
  challengeTestResults: Record<string, (PythonChallengeTestResult | RChallengeTestResult)[]>
  challengeRuntimeError: Record<string, FriendlySandboxError | null>
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
}: LearnLevelProps) {
  const handleStepChange = (step: LevelStep) => {
    onLevelStepChange(step)
    scrollToTop()
  }

  const handleGoToNext = () => {
    onGoToNextLevel()
    scrollToTop()
  }

  const stepNavProps = {
    levelStep,
    showNext,
    nextLevelTitle,
    onLevelStepChange: handleStepChange,
    onGoToNextLevel: handleGoToNext,
  }

  return (
    <div className="cq-stack cq-level">
      <EditableText
        as="h1"
        className="cq-title"
        value={level.title}
        onChange={onUpdateLevelTitle}
      />
      <LevelStepNav {...stepNavProps} />

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
            />
          ))}
          <AddItemButton label="Add challenge" onClick={onAddChallenge} />
        </section>
      )}

      {levelStep === 'test' && (
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
        />
      )}

      <LevelStepNav {...stepNavProps} placement="bottom" />
    </div>
  )
}
