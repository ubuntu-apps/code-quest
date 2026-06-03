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
    expect(parseAppPath('/progress').tab).toBe('progress')
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

  it('builds stable paths', () => {
    expect(learnHomePath()).toBe('/learn')
    expect(learnLanguagePath('python')).toBe('/learn/python')
    expect(learnSectionPath('python', 'fundamentals')).toBe('/learn/python/fundamentals')
    expect(learnLevelPath('python', 'fundamentals', 'l1', 'test')).toBe(
      '/learn/python/fundamentals/l1/test',
    )
    expect(tabPath('progress')).toBe('/progress')
  })
})
