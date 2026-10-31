import { useContext, useEffect, useRef, useState, type InputHTMLAttributes } from 'react'
import { CodeLanguageContext } from '../codeLanguageContext'
import { CodeKeyBar } from './CodeKeyBar'
import { hasCoarsePointer } from './pointer'

/**
 * A one-line answer box (quiz short answers). On phones and tablets it shows the
 * symbol keys under it while it has focus, like the code editors do.
 */
export function AnswerInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const ref = useRef<HTMLInputElement>(null)
  const language = useContext(CodeLanguageContext)
  const [touch] = useState(hasCoarsePointer)
  const [focused, setFocused] = useState(false)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (hideTimer.current) clearTimeout(hideTimer.current)
    },
    [],
  )
  return (
    <>
      <input
        {...props}
        ref={ref}
        onFocus={(e) => {
          if (hideTimer.current) clearTimeout(hideTimer.current)
          setFocused(true)
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          // A short delay, so a tap on a key that briefly takes focus still lands.
          if (hideTimer.current) clearTimeout(hideTimer.current)
          hideTimer.current = setTimeout(() => setFocused(false), 250)
          props.onBlur?.(e)
        }}
      />
      {touch && focused ? <CodeKeyBar textareaRef={ref} variant="answer" language={language === 'sql' ? 'sql' : language === 'r' ? 'r' : 'python'} /> : null}
    </>
  )
}
