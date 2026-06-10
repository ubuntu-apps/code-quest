export type ValidationMode = 'regex' | 'includesAll' | 'equalsNormalized' | 'python_tests'

export interface PythonAssertionTest {
  id: string
  label: string
  assertion: string
}

export interface Validation {
  mode: ValidationMode
  pattern?: string
  needles?: string[]
  expected?: string
  setupCode?: string
  tests?: PythonAssertionTest[]
}

export interface Challenge {
  id: string
  title: string
  promptMarkdown: string
  starterCode?: string
  hints?: string[]
  validation: Validation
}

export type TestQuestion =
  | {
      id: string
      type: 'mcq'
      prompt: string
      choices: { id: string; label: string }[]
      correctChoiceId: string
    }
  | {
      id: string
      type: 'shortText'
      prompt: string
      validation: Validation
    }

export interface LevelTest {
  passingScorePercent?: number
  questions: TestQuestion[]
}

export interface TestGradeResult {
  correct: number
  total: number
  passed: boolean
  byQuestion: Record<string, boolean>
}

export interface Level {
  id: string
  title: string
  intro: {
    title?: string
    bodyMarkdown: string
    /** Default code loaded into the intro sandbox for this topic. */
    sandboxCode?: string
    readMore?: {
      label?: string
      url: string
      source: string
    }
  }
  challenges: Challenge[]
  test: LevelTest
}

export interface SectionFile {
  sectionId: string
  title?: string
  levels: Level[]
}

export interface SectionRef {
  id: string
  title: string
  path: string
}

export interface LanguageIndex {
  id: string
  title: string
  sections: SectionRef[]
}

export interface RootIndex {
  languages: { id: string; title: string; path: string }[]
}

export interface LoadedSection {
  sectionRef: SectionRef
  file: SectionFile
}

export interface LanguageBundle {
  index: LanguageIndex
  sections: LoadedSection[]
}
