import { EditorState, type Extension } from '@codemirror/state'
import { indentUnit } from '@codemirror/language'
import { autocompletion, type Completion, type CompletionResult, type CompletionSource } from '@codemirror/autocomplete'
import type { SqlTable } from '../curriculum/types'
import type { LanguageSpec } from './languageSpec'

/**
 * The code editor's (CodeMirror's) side of a language: its syntax, its suggestions while
 * typing and its indent. Loaded together with the editor, never on its own, so pages without
 * code don't download CodeMirror. Each LanguagePack's `loadEditor()` imports its subclass.
 * The indent and the words to suggest come from the language's language.json.
 */

/** What suggestions can draw on besides the code itself. */
export interface SuggestionContext {
  /** Names from the challenge's instructions, so `day_off` is offered before it is written. */
  extraNames: () => string[]
  /** SQL lessons: the database's tables. */
  sqlTables: () => SqlTable[]
}

export class EditorLanguage {
  /** Spaces per indent. */
  readonly indentSize: number
  /** Keywords and functions to suggest while typing. */
  protected readonly words: Completion[]

  /** @param spec The language's language.json (none for plain text). */
  constructor(spec?: LanguageSpec) {
    this.indentSize = spec?.editor.indentSize ?? 4
    const list = (names: string[]) => names.flatMap((name) => spec?.words[name] ?? [])
    this.words = spec ? completionWords(list(spec.editor.suggestKeywords), list(spec.editor.suggestFunctions)) : []
  }

  /** The language's syntax (colours, brackets, auto-indent), or none. */
  syntax(): Extension {
    return []
  }

  /** Suggestions while typing, or null for none. */
  completionSource(context: SuggestionContext): CompletionSource | null {
    void context
    return null
  }

  /** The editor extensions for this language. */
  extensions(context: SuggestionContext): Extension[] {
    const source = this.completionSource(context)
    return [
      // Only words that start with what was typed. Enter or Tab picks one; Escape closes.
      source ? autocompletion({ override: [source], filterStrict: true, icons: false, maxRenderedOptions: 8 }) : [],
      EditorState.tabSize.of(this.indentSize),
      indentUnit.of(' '.repeat(this.indentSize)),
      this.syntax(),
    ]
  }

  /**
   * Merges suggestion lists into one: each label once (the first list it is in wins), with
   * a boost so earlier lists come first. `key` decides which labels count as the same.
   */
  protected merge(
    groups: { options: readonly Completion[] | undefined; boost: number }[],
    from: number,
    validFor: RegExp,
    key: (label: string) => string = (label) => label,
  ): CompletionResult | null {
    const byLabel = new Map<string, Completion>()
    for (const { options, boost } of groups) {
      for (const option of options ?? []) {
        if (!byLabel.has(key(option.label))) byLabel.set(key(option.label), { ...option, boost })
      }
    }
    return byLabel.size > 0 ? { from, options: [...byLabel.values()], validFor } : null
  }
}

/** Keywords and functions as completions. */
export function completionWords(keywords: readonly string[], functions: readonly string[]): Completion[] {
  return [
    ...keywords.map((label) => ({ label, type: 'keyword' })),
    ...functions.map((label) => ({ label, type: 'function' })),
  ]
}

/** Plain text: no syntax and no suggestions. */
export class PlainEditorLanguage extends EditorLanguage {}
