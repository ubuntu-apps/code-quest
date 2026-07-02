import { forwardRef, useCallback } from 'react'

const TAB_INSERT = '    '

export type CodeTextareaProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'autoCapitalize' | 'autoCorrect' | 'autoComplete' | 'spellCheck'
> & {
  spellCheck?: boolean
}

function insertTab(
  value: string,
  selectionStart: number,
  selectionEnd: number,
): { nextValue: string; nextCursor: number } {
  const nextValue = value.slice(0, selectionStart) + TAB_INSERT + value.slice(selectionEnd)
  return { nextValue, nextCursor: selectionStart + TAB_INSERT.length }
}

export const CodeTextarea = forwardRef<HTMLTextAreaElement, CodeTextareaProps>(function CodeTextarea(
  { onKeyDown, onChange, value, spellCheck = false, ...rest },
  ref,
) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault()
        const el = e.currentTarget
        const start = el.selectionStart ?? 0
        const end = el.selectionEnd ?? 0
        const currentValue = typeof value === 'string' ? value : el.value
        const { nextValue, nextCursor } = insertTab(currentValue, start, end)

        onChange?.({
          ...e,
          target: { ...el, value: nextValue },
          currentTarget: { ...el, value: nextValue },
        } as React.ChangeEvent<HTMLTextAreaElement>)

        requestAnimationFrame(() => {
          el.selectionStart = nextCursor
          el.selectionEnd = nextCursor
        })
        return
      }
      onKeyDown?.(e)
    },
    [onChange, onKeyDown, value],
  )

  return (
    <textarea
      ref={ref}
      value={value}
      spellCheck={spellCheck}
      autoCapitalize="off"
      autoCorrect="off"
      autoComplete="off"
      onChange={onChange}
      onKeyDown={handleKeyDown}
      {...rest}
    />
  )
})
