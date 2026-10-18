/**
 * Shared layout for gutter, phantom rows, and error popover.
 * Keep in sync with `.cq-code-editor-backdrop-inner` and `textarea.cq-code-editor-overlay` in styles/code-editor.css
 * (padding, line-height, popover gap).
 */
export const CODE_EDITOR_LAYOUT = {
  paddingRem: 0.65,
  /** The editor's font size (`.cq-code-editor-backdrop-inner`): 0.88rem, or 16px+ on phones. */
  fontSize: 'var(--cq-code-size)',
  lineHeight: 1.45,
  /** Pixels between the bottom of the error line and the popover top */
  popoverGapPx: 8,
} as const

/**
 * CSS `top` for popover anchored below the given 1-based error line.
 * Uses the editor's font-size variable for the line stack (not `em`), so the position
 * does not depend on the popover's smaller `font-size` (which would pull the tooltip up).
 */
export function codeEditorPopoverTop(errorLine: number): string {
  const { paddingRem, fontSize, lineHeight, popoverGapPx } = CODE_EDITOR_LAYOUT
  return `calc(${paddingRem}rem + ${errorLine * lineHeight} * ${fontSize} + ${popoverGapPx}px)`
}
