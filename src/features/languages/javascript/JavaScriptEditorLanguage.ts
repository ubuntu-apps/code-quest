import { completeFromList, type CompletionContext, type CompletionSource } from '@codemirror/autocomplete'
import { EditorLanguage, type SuggestionContext } from '../EditorLanguage'

export class JavaScriptEditorLanguage extends EditorLanguage {
  /**
   * Names already used in this code, names from the challenge's instructions, then
   * JavaScript's words (with dots, like `console.log` and `Math.round`). Like Python's, from
   * the second letter.
   */
  completionSource({ extraNames }: SuggestionContext): CompletionSource {
    const jsWords = completeFromList(this.words)
    return async (context: CompletionContext) => {
      const word = context.matchBefore(/[\w$.]+/)
      if (!context.explicit && (!word || word.to - word.from < 2)) return null
      const typed = word ? context.state.sliceDoc(word.from, word.to) : ''
      const used = new Set(context.state.doc.toString().match(/[A-Za-z_$][\w$]*/g) ?? [])
      const variables = (names: Iterable<string>) =>
        [...names].filter((name) => name.startsWith(typed) && name !== typed).map((label) => ({ label, type: 'variable' }))
      return this.merge(
        [
          { options: variables(used), boost: 2 },
          { options: variables(extraNames()), boost: 1 },
          { options: (await jsWords(context))?.options?.filter((o) => o.label !== typed), boost: 0 },
        ],
        word ? word.from : context.pos,
        /^[\w$.]{2,}$/,
      )
    }
  }
}
