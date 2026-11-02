import { describe, expect, it } from 'vitest'
import type { Level, TestQuestion } from '../curriculum/content/types'
import { addDays, applyAnswers, pickReview, REVIEW_INTERVALS, type ReviewCandidate, type ReviewItem } from './reviewSchedule'

const TODAY = '2026-10-20'

function candidate(id: string, item: Partial<ReviewItem> = {}): ReviewCandidate {
  const question: TestQuestion = { id, type: 'mcq', prompt: id, choices: [], correctChoiceId: 'a' }
  const level = { id: 'lvl', title: 'Lesson' } as unknown as Level
  return { question, level, item: { box: 1, due: '', right: 0, wrong: 0, seen: '', ...item } }
}

describe('addDays', () => {
  it('moves across month and year ends', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
  })
})

describe('applyAnswers', () => {
  it('starts a new right answer in box 1 and a wrong one in box 0, due tomorrow', () => {
    const items = applyAnswers({}, { a: true, b: false }, TODAY)
    expect(items.a).toMatchObject({ box: 1, due: addDays(TODAY, REVIEW_INTERVALS[1]), right: 1, wrong: 0 })
    expect(items.b).toMatchObject({ box: 0, due: '2026-10-21', right: 0, wrong: 1 })
  })

  it('moves a right answer up a box and a wrong one back to box 0', () => {
    const start = { a: { box: 2, due: TODAY, right: 2, wrong: 0, seen: '2026-10-16' } }
    expect(applyAnswers(start, { a: true }, TODAY).a).toMatchObject({ box: 3, due: addDays(TODAY, REVIEW_INTERVALS[3]) })
    expect(applyAnswers(start, { a: false }, TODAY).a).toMatchObject({ box: 0, due: '2026-10-21', wrong: 1 })
  })

  it('stops at the top box', () => {
    const top = REVIEW_INTERVALS.length - 1
    const start = { a: { box: top, due: TODAY, right: 9, wrong: 0, seen: '2026-09-01' } }
    expect(applyAnswers(start, { a: true }, TODAY).a.box).toBe(top)
  })

  it('does not promote a question twice on the same day, but a wrong answer still counts', () => {
    const once = applyAnswers({}, { a: false }, TODAY)
    // Fixed after seeing the marks: stays in box 0.
    expect(applyAnswers(once, { a: true }, TODAY).a).toMatchObject({ box: 0, wrong: 1 })
    const right = applyAnswers({}, { b: true }, TODAY)
    expect(applyAnswers(right, { b: true }, TODAY).b).toMatchObject({ box: 1, right: 1 })
    expect(applyAnswers(right, { b: false }, TODAY).b).toMatchObject({ box: 0, wrong: 1 })
    // A second wrong answer on the same day isn't counted twice.
    expect(applyAnswers(once, { a: false }, TODAY).a.wrong).toBe(1)
  })
})

describe('pickReview', () => {
  it('takes due questions first, lowest box and most missed first, in course order', () => {
    const pool = [
      candidate('q1', { box: 3, due: '2026-11-30' }),
      candidate('q2', { box: 2, due: TODAY }),
      candidate('q3', { box: 0, due: TODAY, wrong: 1 }),
      candidate('q4', { box: 0, due: '2026-10-19', wrong: 3 }),
      candidate('q5', { box: 4, due: '2026-12-01' }),
    ]
    expect(pickReview(pool, TODAY, 2, new Set(), () => 0)).toEqual(['q3', 'q4'])
    expect(pickReview(pool, TODAY, 3, new Set(), () => 0)).toEqual(['q2', 'q3', 'q4'])
  })

  it('tops up with questions that are not due yet when too few are due', () => {
    const pool = [candidate('a', { due: TODAY }), candidate('b', { due: '2026-12-01' }), candidate('c', { due: '2026-12-01' })]
    const picked = pickReview(pool, TODAY, 2, new Set(), () => 0)
    expect(picked).toHaveLength(2)
    expect(picked).toContain('a')
  })

  it('favours questions missed before when topping up', () => {
    const pool = [
      candidate('never', { due: '2026-12-01', wrong: 0 }),
      candidate('missed', { due: '2026-12-01', wrong: 5 }),
    ]
    let missedFirst = 0
    for (let i = 0; i < 200; i += 1) {
      const seed = (i + 0.5) / 200
      if (pickReview(pool, TODAY, 1, new Set(), () => seed)[0] === 'missed') missedFirst += 1
    }
    expect(missedFirst).toBeGreaterThan(150)
  })

  it('leaves out excluded questions and never returns more than there are', () => {
    const pool = [candidate('a'), candidate('b'), candidate('c')]
    expect(pickReview(pool, TODAY, 5, new Set(['b']))).toEqual(['a', 'c'])
  })
})
