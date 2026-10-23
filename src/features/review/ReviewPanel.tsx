import { useMemo, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import type { LanguageBundle, TestGradeResult, TestQuestion } from '../curriculum/types'
import { gradeTest } from '../curriculum/validateAnswer'
import { localDateKey } from '../curriculum/streak'
import { TestStep } from '../curriculum/views/TestStep'
import { playSound } from '../sound/sound'
import { countEvent } from '../../lib/analytics'
import { pickReview, reviewPool, REVIEW_SIZE } from './reviewSchedule'
import {
  answeredQuestionIds,
  finishReviewSession,
  loadReviewState,
  recordReviewAnswers,
  startReviewSession,
  todaysSession,
  useReviewSnapshot,
} from './reviewStorage'

interface ReviewPanelProps {
  languageId: string
  bundle: LanguageBundle
  /** Changes whenever saved progress changes (a newly passed quiz adds questions). */
  progressVersion: number
  /** Counts the review towards the daily streak. */
  onActivity: () => void
}

/** Fewer known questions than this and there is nothing worth reviewing yet. */
const MIN_POOL = 3

/**
 * Home page: a short daily set of past quiz questions, with the ones the learner got
 * wrong coming back sooner (see reviewSchedule.ts). It doesn't earn XP, but it keeps
 * the streak going.
 */
export function ReviewPanel({ languageId, bundle, progressVersion, onActivity }: ReviewPanelProps) {
  const snapshot = useReviewSnapshot(languageId)
  const state = useMemo(() => {
    void snapshot
    return loadReviewState(languageId)
  }, [languageId, snapshot])
  const pool = useMemo(() => {
    void progressVersion
    return reviewPool(languageId, bundle, state.items)
  }, [languageId, bundle, state.items, progressVersion])
  const byId = useMemo(() => new Map(pool.map((c) => [c.question.id, c])), [pool])

  const [open, setOpen] = useState(false)
  const [questions, setQuestions] = useState<TestQuestion[]>([])
  const [short, setShort] = useState<Record<string, string>>({})
  const [mcq, setMcq] = useState<Record<string, string>>({})
  const [result, setResult] = useState<TestGradeResult | null>(null)
  const [edited, setEdited] = useState<Record<string, true>>({})
  const [recorded, setRecorded] = useState(false)

  if (pool.length < MIN_POOL) return null

  const today = localDateKey(new Date())
  const session = todaysSession(state)
  const setSize = Math.min(REVIEW_SIZE, pool.length)

  const begin = (ids: string[]) => {
    setQuestions(ids.map((id) => byId.get(id)?.question).filter((q): q is TestQuestion => q !== undefined))
    setShort({})
    setMcq({})
    setResult(null)
    setEdited({})
    setRecorded(false)
    setOpen(true)
  }

  const start = () => {
    // A set started earlier today (and not finished) comes back as it was.
    if (session && !session.done && session.ids.every((id) => byId.has(id))) {
      begin(session.ids)
      return
    }
    const exclude = new Set(session?.ids ?? [])
    const ids = pickReview(pool, today, REVIEW_SIZE, exclude)
    startReviewSession(languageId, ids)
    begin(ids)
  }

  const markEdited = (questionId: string) =>
    setEdited((prev) => (prev[questionId] ? prev : { ...prev, [questionId]: true }))

  const check = () => {
    const graded = gradeTest(questions, short, mcq, 0)
    setResult(graded)
    setEdited({})
    // Only the first check counts: later ones come after the right answers were shown.
    if (recorded) return
    setRecorded(true)
    const answered = answeredQuestionIds(short, mcq)
    recordReviewAnswers(languageId, graded.byQuestion, answered)
    finishReviewSession(languageId, graded.correct)
    countEvent('review-done', 'Daily review done')
    if (answered.length > 0) onActivity()
    playSound(
      graded.correct === graded.total ? 'quizPass' : graded.correct * 2 >= graded.total ? 'checkPass' : 'checkFail',
    )
  }

  if (open) {
    const reviewLevel = {
      id: 'daily_review',
      title: 'Daily review',
      intro: { bodyMarkdown: '' },
      challenges: [],
      test: { passingScorePercent: 0, questions },
    }
    const sources = Object.fromEntries(questions.map((q) => [q.id, byId.get(q.id)?.level.title ?? '']))
    return (
      <section className="cq-review cq-review--open" aria-labelledby="cq-review-title">
        <div className="cq-card-row cq-card-row--panel">
          <h2 className="cq-subtitle" id="cq-review-title">
            <RotateCcw size={18} aria-hidden /> Daily review
          </h2>
          <button type="button" className="cq-btn cq-btn--sm" onClick={() => setOpen(false)}>
            Close
          </button>
        </div>
        <TestStep
          practice
          questionSources={sources}
          level={reviewLevel}
          prog={{ challengesCompleted: [], testPassed: false, challengeAnswers: {} }}
          testShort={short}
          testMcq={mcq}
          testResult={result}
          testEdited={edited}
          onTestShortChange={(id, value) => {
            markEdited(id)
            setShort((prev) => ({ ...prev, [id]: value }))
          }}
          onTestMcqChange={(id, choice) => {
            markEdited(id)
            setMcq((prev) => ({ ...prev, [id]: choice }))
          }}
          onUpdatePassingScore={() => undefined}
          onUpdateQuestion={() => undefined}
          onMoveQuestion={() => undefined}
          onRemoveQuestion={() => undefined}
          onAddQuestion={() => undefined}
          onSubmit={check}
          onRetake={() => setOpen(false)}
        />
      </section>
    )
  }

  if (session?.done) {
    return (
      <section className="cq-panel cq-review" aria-labelledby="cq-review-title">
        <h2 className="cq-subtitle" id="cq-review-title">
          <RotateCcw size={18} aria-hidden /> Daily review
        </h2>
        <p>
          <strong>Done for today:</strong> {session.correct} of {session.ids.length} right.{' '}
          {session.correct < session.ids.length
            ? 'The ones you missed will come back tomorrow.'
            : 'Those will come back in a few days.'}
        </p>
        {pool.length > session.ids.length ? (
          <button type="button" className="cq-btn" onClick={start}>
            Another set
          </button>
        ) : null}
      </section>
    )
  }

  const resuming = session !== null && !session.done
  return (
    <section className="cq-panel cq-review" aria-labelledby="cq-review-title">
      <h2 className="cq-subtitle" id="cq-review-title">
        <RotateCcw size={18} aria-hidden /> Daily review
      </h2>
      <p className="cq-muted">
        {setSize} questions from quizzes you&apos;ve taken. The ones you get wrong come back sooner, so they
        stick. About two minutes; it keeps your streak going but doesn&apos;t earn XP.
      </p>
      <button type="button" className="cq-btn cq-btn--primary" onClick={start}>
        {resuming ? 'Continue review' : 'Start review'}
      </button>
    </section>
  )
}
