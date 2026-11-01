import { RangeSetBuilder, type Extension } from '@codemirror/state'
import { Decoration, ViewPlugin, type DecorationSet, type EditorView, type ViewUpdate } from '@codemirror/view'
import type { Highlighter, TokenKind } from './Highlighter'

const marks = new Map<TokenKind, Decoration>()

/** The mark for a kind of token: the same `cq-hl-<kind>` class lesson text uses. */
function mark(kind: TokenKind): Decoration {
  let decoration = marks.get(kind)
  if (!decoration) {
    decoration = Decoration.mark({ class: `cq-hl-${kind}` })
    marks.set(kind, decoration)
  }
  return decoration
}

function decorate(view: EditorView, highlighter: Highlighter): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>()
  let from = 0
  for (const token of highlighter.highlight(view.state.doc.toString())) {
    const to = from + token.text.length
    if (token.kind !== 'plain') builder.add(from, to, mark(token.kind))
    from = to
  }
  return builder.finish()
}

/**
 * Colours code in the editor with a language's `highlight` patterns from its language.json,
 * the same way lesson text is coloured (Highlighter), so the two always match. The editor's
 * code is short, so it is coloured again as a whole after each change, which also gets
 * comments and text that run over several lines right.
 */
export function patternHighlighting(highlighter: Highlighter): Extension {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet

      constructor(view: EditorView) {
        this.decorations = decorate(view, highlighter)
      }

      update(update: ViewUpdate) {
        if (update.docChanged) this.decorations = decorate(update.view, highlighter)
      }
    },
    { decorations: (plugin) => plugin.decorations },
  )
}
