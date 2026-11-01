import { EditorState, type Extension } from '@codemirror/state'
import { indentUnit } from '@codemirror/language'
import { autocompletion, type Completion, type CompletionResult, type CompletionSource } from '@codemirror/autocomplete'
import type { SqlTable } from '../curriculum/types'
import { Highlighter } from './Highlighter'
import type { LanguageSpec } from './languageSpec'
import { patternHighlighting } from './patternHighlighting'

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
  /** The language's language.json (none for plain text). */
  protected readonly spec: LanguageSpec | undefined

  /** @param spec The language's language.json (none for plain text). */
  constructor(spec?: LanguageSpec) {
    this.spec = spec
    this.indentSize = spec?.editor.indentSize ?? 4
    const list = (names: string[]) => names.flatMap((name) => spec?.words[name] ?? [])
    this.words = spec ? completionWords(list(spec.editor.suggestKeywords), list(spec.editor.suggestFunctions)) : []
  }

  /**
   * The language's syntax in the editor. By default: colours from the language.json's
   * `highlight` patterns, as in lesson text, and its comment markers (Ctrl+/). A language
   * with its own CodeMirror package (Python, for smart indenting) uses that instead.
   */
  syntax(): Extension {
    if (!this.spec) return []
    const commentTokens = this.spec.editor.comments
    return [
      patternHighlighting(new Highlighter(this.spec)),
      commentTokens ? EditorState.languageData.of(() => [{ commentTokens }]) : [],
    ]
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
