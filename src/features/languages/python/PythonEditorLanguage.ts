import type { Extension } from '@codemirror/state'
import { completeFromList, type CompletionContext, type CompletionSource } from '@codemirror/autocomplete'
import { localCompletionSource, python } from '@codemirror/lang-python'
import { EditorLanguage, type SuggestionContext } from '../EditorLanguage'

export class PythonEditorLanguage extends EditorLanguage {
  syntax(): Extension {
    return python()
  }

  /**
   * One list of suggestions for the word being typed: names used in this code first, then
   * names from the challenge's instructions, then Python's words (language.json lists only
   * the built-ins the course uses: the full list is mostly noise for beginners). Suggestions start from the
   * second letter of a word (one letter matches too much), and the list closes when the word is deleted.
   */
  completionSource({ extraNames }: SuggestionContext): CompletionSource {
    const pythonWords = completeFromList(this.words)
    return async (context: CompletionContext) => {
      const word = context.matchBefore(/\w+/)
      if (!context.explicit && (!word || word.to - word.from < 2)) return null
      return this.merge(
        [
          { options: (await localCompletionSource(context))?.options, boost: 2 },
          { options: extraNames().map((label) => ({ label, type: 'variable' })), boost: 1 },
          { options: (await pythonWords(context))?.options, boost: 0 },
        ],
        word ? word.from : context.pos,
        /^\w{2,}$/,
      )
    }
  }
}
