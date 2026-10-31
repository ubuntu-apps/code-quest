import { useContext, useMemo } from 'react'
import { CodeLanguageContext } from '../codeLanguageContext'
import { languagePack } from '../../languages'

/** Code with syntax colours in the course's language; plain text for a course without one. */
export function HighlightedCode({ code }: { code: string }) {
  const language = useContext(CodeLanguageContext)
  const tokens = useMemo(() => languagePack(language)?.highlight(code) ?? null, [code, language])
  if (!tokens) return <code>{code}</code>
  return (
    <code>
      {tokens.map((t, i) => (t.kind === 'plain' ? t.text : <span key={i} className={`cq-hl-${t.kind}`}>{t.text}</span>))}
    </code>
  )
}
