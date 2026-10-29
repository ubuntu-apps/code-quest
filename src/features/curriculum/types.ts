export type ValidationMode = 'regex' | 'includesAll' | 'equalsNormalized' | 'python_tests' | 'r_tests' | 'sql_tests'

export interface RuntimeAssertionTest {
  id: string
  label: string
  assertion: string
}

/** @deprecated Use RuntimeAssertionTest */
export type PythonAssertionTest = RuntimeAssertionTest

export interface Validation {
  mode: ValidationMode
  pattern?: string
  needles?: string[]
  expected?: string
  setupCode?: string
  /**
   * `python_tests`: Python assertions. `sql_tests`: extra queries run after the learner's SQL
   * and the solution, whose results must match (for statements that change data).
   */
  tests?: RuntimeAssertionTest[]
  /** `sql_tests`: the rows must come in the same order as the solution's (it uses ORDER BY). */
  ordered?: boolean
}

/** A table in a SQL lesson's database, listed for the learner. */
export interface SqlTable {
  name: string
  columns: string[]
}

/**
 * A SQL lesson's database. `setupSql` makes it fresh for every run; `altSetupSql` has the
 * same tables with other rows, so a Check can tell a real query from a typed-in answer.
 */
export interface SqlDatabase {
  setupSql: string
  altSetupSql?: string
  tables: SqlTable[]
}

export interface Challenge {
  id: string
  title: string
  promptMarkdown: string
  starterCode?: string
  /** @deprecated Prefer `hint` for the Hint button */
  hints?: string[]
  hint?: string
  solution?: string
  validation: Validation
  /**
   * Earlier fingerprints of this challenge whose progress still counts (see
   * progressFingerprint.ts). Written by the generators when a challenge marked
   * `keepProgress` has its checks fixed, so learners who solved it keep it.
   */
  acceptedFingerprints?: string[]
}

export type TestQuestion =
  | {
      id: string
      type: 'mcq'
      prompt: string
      choices: { id: string; label: string }[]
      correctChoiceId: string
      /** Why the right answer is right, shown once the question is answered correctly. */
      explanation?: string
    }
  | {
      id: string
      type: 'shortText'
      prompt: string
      validation: Validation
      explanation?: string
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

export type LevelKind = 'topic' | 'project'
export type ProjectDifficulty = 'easy' | 'medium' | 'hard'

export interface SandboxSnippet {
  id: string
  label: string
  code: string
}

export interface Level {
  id: string
  /**
   * Ids this lesson had before it was renamed. Saved progress is keyed by lesson id, so the
   * app moves progress saved under these ids to the current one (see levelRenames.ts).
   */
  formerIds?: string[]
  title: string
  kind?: LevelKind
  projectDifficulty?: ProjectDifficulty
  sandboxSnippets?: SandboxSnippet[]
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
  /** SQL lessons: the database the sandbox and challenges run on. */
  database?: SqlDatabase
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
  /** Sections still being written: listed after the others as "Coming soon", with no lessons yet. */
  upcoming?: { id: string; title: string }[]
}

export interface RootIndex {
  /** `comingSoon` courses are listed but can't be opened yet (except in edit or admin mode). */
  languages: { id: string; title: string; path: string; comingSoon?: boolean }[]
}

export interface LoadedSection {
  sectionRef: SectionRef
  file: SectionFile
}

export interface LanguageBundle {
  index: LanguageIndex
  sections: LoadedSection[]
}
