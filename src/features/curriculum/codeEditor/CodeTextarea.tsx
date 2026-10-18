import { forwardRef, useCallback, useId, useRef } from 'react'
import { applyEdit } from './applyEdit'
import { computeKeyEdit } from './editing'

export type CodeTextareaProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'autoCapitalize' | 'autoCorrect' | 'autoComplete' | 'spellCheck'
> & {
  spellCheck?: boolean
}

export const CodeTextarea = forwardRef<HTMLTextAreaElement, CodeTextareaProps>(function CodeTextarea(
  { onKeyDown, spellCheck = false, 'aria-describedby': describedBy, ...rest },
  ref,
) {
  const hintId = useId()
  // After Escape, the next Tab moves focus out instead of indenting (WCAG 2.1.2, no keyboard trap).
  const escapePressedRef = useRef(false)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      onKeyDown?.(e)
      if (e.defaultPrevented) return
      // Leave keys alone while an input method (e.g. for Chinese or Japanese) is composing:
      // Enter there confirms the characters rather than starting a new line.
      if (e.nativeEvent.isComposing || e.keyCode === 229) return

      if (e.key === 'Escape') {
        escapePressedRef.current = true
        return
      }
      const releaseFocus = escapePressedRef.current && e.key === 'Tab'
      escapePressedRef.current = false
      if (releaseFocus) return

      const el = e.currentTarget
      const edit = computeKeyEdit(el.value, el.selectionStart ?? 0, el.selectionEnd ?? 0, e)
      // Keep plain Tab / Shift+Tab inside the editor even when there is nothing to change.
      if (e.key === 'Tab' && !e.ctrlKey && !e.metaKey && !e.altKey) e.preventDefault()
      if (!edit) return
      e.preventDefault()
      applyEdit(el, edit)
    },
    [onKeyDown],
  )

  return (
    <>
      <textarea
        ref={ref}
        spellCheck={spellCheck}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        onKeyDown={handleKeyDown}
        aria-describedby={describedBy ? `${describedBy} ${hintId}` : hintId}
        {...rest}
      />
      <span id={hintId} className="cq-sr-only">
        Tab indents. Press Escape, then Tab, to move to the next control.
      </span>
    </>
  )
})
