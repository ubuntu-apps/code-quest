import type { Challenge, Level } from '../types'
import type { LevelProgress } from '../progressStorage'
import type { PythonAiHelp } from '../freeAiHelp'
import type { FriendlyPythonError, PythonChallengeTestResult } from '../pythonSandbox'
import type { LevelStep } from '../constants'
import { EditableText } from '../../editor'
import { AddItemButton } from '../../editor'
import { ChallengeCard } from '../components/ChallengeCard'
import { IntroStep } from './IntroStep'
import { TestStep } from './TestStep'

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
  sandboxError: FriendlyPythonError | null
  sandboxErrorUiEpoch: number
  onSandboxCodeChange: (code: string) => void
  onSandboxRun: () => void
  onSandboxReset: () => void
  onSandboxErrorClear: () => void
  challengeDrafts: Record<string, string>
  challengeStatus: Record<string, 'passed' | 'failed'>
  challengeTestResults: Record<string, PythonChallengeTestResult[]>
  challengeRuntimeError: Record<string, FriendlyPythonError | null>
  challengeErrorExpanded: Record<string, boolean>
  challengeErrorUiEpoch: Record<string, number>
  challengeAiHelp: Record<string, PythonAiHelp | null>
  challengeAiLoading: Record<string, boolean>
  challengeFixCopied: Record<string, boolean>
  onChallengeDraftChange: (challengeId: string, value: string) => void
  onCheckChallenge: (challenge: Challenge) => void
  onUpdateChallenge: (challengeId: string, patch: Partial<Challenge>) => void
  onMoveChallenge: (challengeId: string, direction: -1 | 1) => void
  onRemoveChallenge: (challengeId: string) => void
  onAddChallenge: () => void
  onToggleChallengeErrorExpanded: (challengeId: string) => void
  onRequestChallengeAiHelp: (challengeId: string, userCode: string, error: FriendlyPythonError) => void
  onChallengeFixCopied: (challengeId: string, copied: boolean) => void
  testShort: Record<string, string>
  testMcq: Record<string, string>
  testResult: { correct: number; total: number; passed: boolean } | null
  onTestShortChange: (questionId: string, value: string) => void
  onTestMcqChange: (questionId: string, choiceId: string) => void
  onUpdatePassingScore: (score: number) => void
  onUpdateQuestion: (questionId: string, question: import('../types').TestQuestion) => void
  onMoveQuestion: (questionId: string, direction: -1 | 1) => void
  onRemoveQuestion: (questionId: string) => void
  onAddQuestion: (type: 'mcq' | 'shortText') => void
  onSubmitTest: () => void
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
  onSandboxReset,
  onSandboxErrorClear,
  challengeDrafts,
  challengeStatus,
  challengeTestResults,
  challengeRuntimeError,
  challengeErrorExpanded,
  challengeErrorUiEpoch,
  challengeAiHelp,
  challengeAiLoading,
  challengeFixCopied,
  onChallengeDraftChange,
  onCheckChallenge,
  onUpdateChallenge,
  onMoveChallenge,
  onRemoveChallenge,
  onAddChallenge,
  onToggleChallengeErrorExpanded,
  onRequestChallengeAiHelp,
  onChallengeFixCopied,
  testShort,
  testMcq,
  testResult,
  onTestShortChange,
  onTestMcqChange,
  onUpdatePassingScore,
  onUpdateQuestion,
  onMoveQuestion,
  onRemoveQuestion,
  onAddQuestion,
  onSubmitTest,
}: LearnLevelProps) {
  const stepTabs: { id: LevelStep; label: string }[] = [
    { id: 'intro', label: 'Intro' },
    { id: 'challenges', label: 'Challenges' },
    { id: 'test', label: 'Test' },
  ]

  return (
    <div className="cq-stack cq-level">
      <EditableText
        as="h1"
        className="cq-title"
        value={level.title}
        onChange={onUpdateLevelTitle}
      />
      <div className="cq-step-tabs" role="tablist">
        {stepTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={levelStep === t.id}
            className={`cq-step-tab${levelStep === t.id ? ' cq-step-tab--active' : ''}`}
            onClick={() => onLevelStepChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

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
              testResults={challengeTestResults[ch.id] ?? []}
              runtimeError={challengeRuntimeError[ch.id] ?? null}
              errorExpanded={challengeErrorExpanded[ch.id] ?? false}
              errorUiEpoch={challengeErrorUiEpoch[ch.id] ?? 0}
              aiHelp={challengeAiHelp[ch.id] ?? null}
              aiLoading={challengeAiLoading[ch.id] ?? false}
              fixCopied={challengeFixCopied[ch.id] ?? false}
              onDraftChange={(value) => onChallengeDraftChange(ch.id, value)}
              onCheck={() => onCheckChallenge(ch)}
              onUpdateChallenge={(patch) => onUpdateChallenge(ch.id, patch)}
              onMove={(dir) => onMoveChallenge(ch.id, dir)}
              onDelete={() => onRemoveChallenge(ch.id)}
              onToggleErrorExpanded={() => onToggleChallengeErrorExpanded(ch.id)}
              onRequestAiHelp={() =>
                onRequestChallengeAiHelp(ch.id, challengeDrafts[ch.id] ?? '', challengeRuntimeError[ch.id]!)
              }
              onFixCopied={(copied) => onChallengeFixCopied(ch.id, copied)}
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
          onTestShortChange={onTestShortChange}
          onTestMcqChange={onTestMcqChange}
          onUpdatePassingScore={onUpdatePassingScore}
          onUpdateQuestion={onUpdateQuestion}
          onMoveQuestion={onMoveQuestion}
          onRemoveQuestion={onRemoveQuestion}
          onAddQuestion={onAddQuestion}
          onSubmit={onSubmitTest}
        />
      )}
    </div>
  )
}
