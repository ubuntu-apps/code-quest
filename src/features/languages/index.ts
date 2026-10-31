import type { LanguagePack } from './LanguagePack'
import type { EditorLanguage } from './EditorLanguage'
import { PythonPack } from './python/PythonPack'
import { RPack } from './r/RPack'
import { SqlPack } from './sql/SqlPack'

export type { ChallengeCheckResult, ChallengeRunOptions, ChallengeTestResult, CodeKey, CodeRunResult, FenceBlock, FriendlyCodeError, RunHandlers, RunOptions } from './LanguagePack'
export { LanguagePack } from './LanguagePack'
export type { Token, TokenKind } from './Highlighter'
export type { LanguageSpec } from './languageSpec'

/**
 * Every language a course can be in. A new language is a folder with its language.json, a
 * LanguagePack subclass for running it and an EditorLanguage subclass, and one more pack here.
 */
export const LANGUAGE_PACKS: readonly LanguagePack[] = [new PythonPack(), new SqlPack(), new RPack()]

const BY_ID = new Map(LANGUAGE_PACKS.map((pack) => [pack.id, pack]))
const BY_TEST_MODE = new Map<string, LanguagePack>(LANGUAGE_PACKS.map((pack) => [pack.testMode, pack]))

/** The language of a course, or null for a course without runnable code. */
export function languagePack(id: string | null | undefined): LanguagePack | null {
  return (id && BY_ID.get(id)) || null
}

/** The language whose challenges use this validation mode (`r_tests` → R), if any. */
export function packForTestMode(mode: string | null | undefined): LanguagePack | null {
  return (mode && BY_TEST_MODE.get(mode)) || null
}

/** The code editor's support for a language: its own, or plain text. Loaded with the editor. */
export async function loadEditorLanguage(id: string | null | undefined): Promise<EditorLanguage> {
  const pack = languagePack(id)
  if (pack) return pack.loadEditor()
  const { PlainEditorLanguage } = await import('./EditorLanguage')
  return new PlainEditorLanguage()
}
