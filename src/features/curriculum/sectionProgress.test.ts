import { describe, expect, it, beforeEach } from 'vitest'
import type { Level } from './types'
import {
  areRequiredSectionProjectsComplete,
  getSectionProgressStatus,
  isLevelComplete,
  isLevelStarted,
  isSectionUnlocked,
} from './helpers'
import { saveProgress } from './progressStorage'

const levels: Level[] = [
  {
    id: 'l1',
    title: 'One',
    intro: { bodyMarkdown: '' },
    challenges: [{ id: 'c1', title: 'C', promptMarkdown: '', validation: { mode: 'equalsNormalized', expected: 'x' } }],
    test: { questions: [] },
  },
  {
    id: 'l2',
    title: 'Two',
    intro: { bodyMarkdown: '' },
    challenges: [],
    test: { questions: [] },
  },
]

describe('section progress', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('treats a section with no activity as not started', () => {
    expect(getSectionProgressStatus('python', levels)).toBe('not_started')
    expect(isLevelStarted('python', levels[0])).toBe(false)
  })

  it('treats a partially finished section as in progress', () => {
    saveProgress('python', 'l1', { challengesCompleted: ['c1'], testPassed: false })
    expect(getSectionProgressStatus('python', levels)).toBe('in_progress')
    expect(isLevelComplete('python', levels[0])).toBe(false)
  })

  it('treats a fully completed section as complete', () => {
    saveProgress('python', 'l1', { challengesCompleted: ['c1'], testPassed: true })
    saveProgress('python', 'l2', { challengesCompleted: [], testPassed: true })
    expect(getSectionProgressStatus('python', levels)).toBe('complete')
    expect(isLevelComplete('python', levels[1])).toBe(true)
  })
})

describe('section project gates', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  const topic: Level = {
    id: 'topic1',
    title: 'Topic',
    intro: { bodyMarkdown: '' },
    challenges: [],
    test: { questions: [] },
  }

  const project = (id: string, difficulty: 'easy' | 'medium' | 'hard'): Level => ({
    id,
    title: `Project ${difficulty}`,
    kind: 'project',
    projectDifficulty: difficulty,
    intro: { bodyMarkdown: '' },
    challenges: [{ id: 'c1', title: 'C', promptMarkdown: '', validation: { mode: 'equalsNormalized', expected: 'x' } }],
    test: { questions: [] },
  })

  it('requires easy and medium projects before the next section unlocks', () => {
    const sectionA = {
      file: {
        levels: [topic, project('easy', 'easy'), project('med', 'medium'), project('hard', 'hard')],
      },
    }
    const sectionB = { file: { levels: [topic] } }
    const sections = [sectionA, sectionB]

    expect(isSectionUnlocked('python', sections, 1)).toBe(false)

    saveProgress('python', 'easy', { challengesCompleted: ['c1'], testPassed: true })
    expect(isSectionUnlocked('python', sections, 1)).toBe(false)

    saveProgress('python', 'med', { challengesCompleted: ['c1'], testPassed: true })
    expect(areRequiredSectionProjectsComplete('python', sectionA.file.levels)).toBe(true)
    expect(isSectionUnlocked('python', sections, 1)).toBe(true)
  })
})
