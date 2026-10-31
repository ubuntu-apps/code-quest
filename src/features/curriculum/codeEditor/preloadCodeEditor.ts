import { loadEditorLanguage } from '../../languages'
import type { EditorLanguage } from '../../languages/EditorLanguage'

const editorLanguages = new Map<string, Promise<EditorLanguage>>()

/** A language's editor support, loaded once and shared (the same promise every time, as `use()` needs). */
export function editorLanguageFor(language: string): Promise<EditorLanguage> {
  let promise = editorLanguages.get(language)
  if (!promise) {
    promise = loadEditorLanguage(language)
    // A failed load (offline) is tried again next time.
    promise.catch(() => editorLanguages.delete(language))
    editorLanguages.set(language, promise)
  }
  return promise
}

/** Starts downloading the code editor early (e.g. when a lesson opens), so it is ready by the challenges. */
export function preloadCodeEditor(language = 'plain'): void {
  void Promise.all([import('./CodeMirrorEditor'), editorLanguageFor(language)]).catch(() => {
    // Offline and not cached yet: the plain text box is used instead.
  })
}
