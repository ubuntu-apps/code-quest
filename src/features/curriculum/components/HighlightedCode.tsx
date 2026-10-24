import { useContext, useMemo } from 'react'
import { highlightPython, highlightSql } from '../codeHighlight'
import { CodeLanguageContext } from '../codeLanguageContext'

/** Code with syntax colours when the course is Python or SQL; plain text otherwise. */
export function HighlightedCode({ code }: { code: string }) {
  const language = useContext(CodeLanguageContext)
  const tokens = useMemo(
    () =>
      language === 'python'
        ? highlightPython(code)
        : language === 'sql'
          ? highlightSql(code)
          : null,
    [code, language],
  )
  if (!tokens) return <code>{code}</code>
  return (
    <code>
      {tokens.map((t, i) => (t.kind === 'plain' ? t.text : <span key={i} className={`cq-hl-${t.kind}`}>{t.text}</span>))}
    </code>
  )
}
