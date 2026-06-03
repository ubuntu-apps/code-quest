import { describe, expect, it } from 'vitest'
import { patchBundle } from '../editor/curriculumPatch'
import type { LanguageBundle, Level } from './types'

function makeLevel(id: string, title: string): Level {
  return {
    id,
    title,
    intro: { bodyMarkdown: 'Intro' },
    challenges: [],
    test: { questions: [] },
  }
}

function makeBundle(): LanguageBundle {
  return {
    index: {
      id: 'python',
      title: 'Python',
      sections: [{ id: 'fundamentals', title: 'Fundamentals', path: 'fundamentals.json' }],
    },
    sections: [
      {
        sectionRef: { id: 'fundamentals', title: 'Fundamentals', path: 'fundamentals.json' },
        file: {
          sectionId: 'fundamentals',
          title: 'Fundamentals',
          levels: [makeLevel('l1', 'One'), makeLevel('l2', 'Two')],
        },
      },
    ],
  }
}

describe('patchBundle', () => {
  it('patches only the matching level in the matching section', () => {
    const bundle = makeBundle()
    const next = patchBundle(bundle, 'fundamentals', 'l2', (level) => ({
      ...level,
      title: 'Updated',
    }))

    expect(next.sections[0].file.levels[0].title).toBe('One')
    expect(next.sections[0].file.levels[1].title).toBe('Updated')
    expect(bundle.sections[0].file.levels[1].title).toBe('Two')
    expect(next.index.sections[0].title).toBe('Fundamentals')
  })

  it('leaves bundle unchanged when section or level is missing', () => {
    const bundle = makeBundle()
    const next = patchBundle(bundle, 'missing', 'l1', (level) => ({ ...level, title: 'Nope' }))
    expect(next.sections[0].file.levels[0].title).toBe('One')
  })
})
