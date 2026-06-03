import type { Challenge, LanguageBundle, Level, SectionFile, TestQuestion } from '../curriculum/types'

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}`
}

export function createDefaultLevel(): Level {
  const id = newId('level')
  return {
    id,
    title: 'New level',
    intro: { bodyMarkdown: 'Write the intro here.' },
    challenges: [],
    test: { passingScorePercent: 70, questions: [] },
  }
}

export function createDefaultChallenge(): Challenge {
  return {
    id: newId('challenge'),
    title: 'New challenge',
    promptMarkdown: 'Describe the challenge.',
    starterCode: '',
    validation: { mode: 'equalsNormalized', expected: '' },
  }
}

export function createDefaultMcqQuestion(): TestQuestion {
  return {
    id: newId('q'),
    type: 'mcq',
    prompt: 'New question?',
    choices: [
      { id: 'a', label: 'Option A' },
      { id: 'b', label: 'Option B' },
    ],
    correctChoiceId: 'a',
  }
}

export function createDefaultShortTextQuestion(): TestQuestion {
  return {
    id: newId('q'),
    type: 'shortText',
    prompt: 'New short-text question?',
    validation: { mode: 'equalsNormalized', expected: '' },
  }
}

export function createDefaultSection(): { sectionId: string; sectionFile: SectionFile; path: string } {
  const sectionId = newId('section')
  const path = `${sectionId}.json`
  return {
    sectionId,
    path,
    sectionFile: {
      sectionId,
      title: 'New section',
      levels: [],
    },
  }
}

export function createDefaultLanguage(langId: string): {
  rootEntry: { id: string; title: string; path: string }
  bundle: LanguageBundle
} {
  return {
    rootEntry: {
      id: langId,
      title: 'New language',
      path: `${langId}/index.json`,
    },
    bundle: {
      index: { id: langId, title: 'New language', sections: [] },
      sections: [],
    },
  }
}
