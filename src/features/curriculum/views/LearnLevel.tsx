import { useRef, type ReactNode } from 'react'
import type { Level } from '../content/types'
import { saveProgress, type LevelProgress } from '../progress/progressStorage'
import type { SandboxState } from '../hooks/useSandbox'
import type { ChallengesState } from '../hooks/useChallenges'
import type { LevelTestState } from '../hooks/useLevelTest'
import { STEP_PANEL_ID, stepTabId, type LevelStep } from '../constants'
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
  onReadMoreOpen: () => void
  /** The lesson's sandbox (useSandbox). */
  sandbox: SandboxState
  /** The challenges' drafts, checks and results (useChallenges). */
  challenges: ChallengesState
  /** The gate's answers and result (useLevelTest). */
  test: LevelTestState
  /** The next stage, offered once the gate is cleared. */
  nextStage: { title: string | null; show: boolean; go: () => void }
  /** Shown under a passed quiz: "Section complete" when this lesson finished its section. */
  afterQuizPassed?: ReactNode
}

export function LearnLevel({
  level,
  languageId,
  levelStep,
  prog,
  onLevelStepChange,
  onReadMoreOpen,
  sandbox,
  challenges,
  test,
  nextStage,
  afterQuizPassed,
}: LearnLevelProps) {
  // Each step keeps its own place: back from a look at the intro to the challenge you were on.
  useStepScrollMemory(level.id, levelStep)
  const topTabs = useRef<HTMLDivElement>(null)
  const bottomTabs = useRef<HTMLDivElement>(null)

  const handleStepChange = onLevelStepChange

  const handleGoToNext = () => {
    nextStage.go()
    scrollToTop()
  }

  const isDone = (id: string) => prog.challengesCompleted.includes(id)
  const stepNavProps = {
    levelStep,
    showNext: nextStage.show,
    nextLevelTitle: nextStage.title,
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
        <h1 className="cq-title">{level.title}</h1>
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
              sandbox={sandbox}
              onReadMoreOpen={onReadMoreOpen}
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
                  draft={challenges.drafts[ch.id] ?? ''}
                  done={prog.challengesCompleted.includes(ch.id)}
                  status={challenges.status[ch.id]}
                  answerViewed={prog.answersViewed?.includes(ch.id) ?? false}
                  testResults={challenges.testResults[ch.id] ?? []}
                  runtimeError={challenges.runtimeError[ch.id] ?? null}
                  errorExpanded={challenges.errorExpanded[ch.id] ?? false}
                  errorUiEpoch={challenges.errorUiEpoch[ch.id] ?? 0}
                  checkingMessage={challenges.checking[ch.id] ?? null}
                  runningMessage={challenges.running[ch.id] ?? null}
                  output={challenges.output[ch.id] ?? null}
                  onRun={() => void challenges.run(ch)}
                  onDraftChange={(value) => challenges.changeDraft(ch.id, value)}
                  onCheck={() => void challenges.check(ch)}
                  onStopCheck={() => challenges.stopCheck(ch.id)}
                  onRevealAnswer={() => challenges.revealAnswer(ch.id)}
                  onToggleErrorExpanded={() => challenges.toggleErrorExpanded(ch.id)}
                  next={nextAfter(chIndex)}
                />
              ))}
            </section>
          )}

          {levelStep === 'quiz' && (
            <TestStep
              level={level}
              prog={prog}
              testShort={test.short}
              testMcq={test.mcq}
              testResult={test.result}
              testEdited={test.edited}
              onTestShortChange={test.changeShort}
              onTestMcqChange={test.changeMcq}
              onSubmit={test.submit}
              onRetake={test.retake}
              nextLevelTitle={nextStage.show ? nextStage.title : null}
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
