import type { Extension } from '@codemirror/state'
import { completeFromList, type CompletionContext, type CompletionSource } from '@codemirror/autocomplete'
import { EditorLanguage, type SuggestionContext } from '../EditorLanguage'
import { rLanguage } from './rSyntax'

export class REditorLanguage extends EditorLanguage {
  syntax(): Extension {
    return rLanguage
  }

  /**
   * Names already used in this code (R names can contain dots, like `is.na`), names from the
   * challenge's instructions, then R's words. Like Python's, from the second letter.
   */
  completionSource({ extraNames }: SuggestionContext): CompletionSource {
    const rWords = completeFromList(this.words)
    return async (context: CompletionContext) => {
      const word = context.matchBefore(/[\w.]+/)
      if (!context.explicit && (!word || word.to - word.from < 2)) return null
      const typed = word ? context.state.sliceDoc(word.from, word.to) : ''
      const used = new Set(context.state.doc.toString().match(/[A-Za-z.][\w.]*/g) ?? [])
      const variables = (names: Iterable<string>) =>
        [...names].filter((name) => name.startsWith(typed) && name !== typed).map((label) => ({ label, type: 'variable' }))
      return this.merge(
        [
          { options: variables(used), boost: 2 },
          { options: variables(extraNames()), boost: 1 },
          { options: (await rWords(context))?.options?.filter((o) => o.label !== typed), boost: 0 },
        ],
        word ? word.from : context.pos,
        /^[\w.]{2,}$/,
      )
    }
  }
}
