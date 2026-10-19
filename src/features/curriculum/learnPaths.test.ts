import { describe, expect, it } from 'vitest'
import {
  learnHomePath,
  learnLanguagePath,
  learnLevelPath,
  learnSectionPath,
  parseAppPath,
  tabPath,
} from './learnPaths'

describe('learnPaths', () => {
  it('parses tab routes', () => {
    expect(parseAppPath('/about').tab).toBe('about')
    expect(parseAppPath('/learn').tab).toBe('learn')
    expect(parseAppPath('/').tab).toBe('learn')
  })

  it('parses nested learn routes', () => {
    expect(parseAppPath('/learn/python')).toMatchObject({
      tab: 'learn',
      langId: 'python',
      sectionId: null,
      levelId: null,
      step: 'intro',
    })
    expect(parseAppPath('/learn/python/fundamentals/l1/challenges')).toMatchObject({
      langId: 'python',
      sectionId: 'fundamentals',
      levelId: 'l1',
      step: 'challenges',
    })
  })

  it('sends old Progress links to Learn', () => {
    expect(parseAppPath('/progress')).toMatchObject({ tab: 'learn', langId: null })
    expect(parseAppPath('/progress/python')).toMatchObject({
      tab: 'learn',
      langId: 'python',
      sectionId: null,
    })
  })

  it('opens the quiz from old "test" links', () => {
    expect(parseAppPath('/learn/python/fundamentals/l1/test')).toMatchObject({ levelId: 'l1', step: 'quiz' })
    expect(parseAppPath('/learn/python/fundamentals/l1/quiz')).toMatchObject({ levelId: 'l1', step: 'quiz' })
  })

  it('builds stable paths', () => {
    expect(learnHomePath()).toBe('/learn')
    expect(learnLanguagePath('python')).toBe('/learn/python')
    expect(learnSectionPath('python', 'fundamentals')).toBe('/learn/python/fundamentals')
    expect(learnLevelPath('python', 'fundamentals', 'l1', 'quiz')).toBe(
      '/learn/python/fundamentals/l1/quiz',
    )
    expect(tabPath('about')).toBe('/about')
    expect(tabPath('learn', 'python')).toBe('/learn/python')
  })
})
