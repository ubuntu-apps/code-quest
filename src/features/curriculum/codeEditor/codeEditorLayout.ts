/**
 * Shared layout for gutter, phantom rows, and error popover.
 * Keep in sync with `.cq-code-editor-backdrop-inner` and `textarea.cq-code-editor-overlay` in App.css
 * (padding, line-height, popover gap).
 */
export const CODE_EDITOR_LAYOUT = {
  paddingRem: 0.65,
  /** Must match `.cq-code-editor-backdrop-inner` font-size */
  fontSizeRem: 0.88,
  lineHeight: 1.45,
  /** Pixels between the bottom of the error line and the popover top */
  popoverGapPx: 8,
} as const

/**
 * CSS `top` for popover anchored below the given 1-based error line.
 * Uses `rem` for the line stack (not `em`), so position does not depend on the
 * popover's smaller `font-size` (which would shrink `em` and pull the tooltip up).
 */
export function codeEditorPopoverTop(errorLine: number): string {
  const { paddingRem, fontSizeRem, lineHeight, popoverGapPx } = CODE_EDITOR_LAYOUT
  const lineStepRem = lineHeight * fontSizeRem
  return `calc(${paddingRem}rem + ${errorLine * lineStepRem}rem + ${popoverGapPx}px)`
}
