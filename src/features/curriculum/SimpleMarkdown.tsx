import { useContext, type FC, type ReactNode } from 'react'
import { looksLikePython } from './codeHighlight'
import { CodeLanguageContext } from './codeLanguageContext'
import { HighlightedCode } from './components/HighlightedCode'

/**
 * Minimal markdown: paragraphs, fenced ``` code blocks, inline `code`, **bold**.
 * With `onTryCode`, Python code blocks get a "Try it" button that hands their code over
 * (sample output, folder layouts and shell commands don't get one).
 */
export const SimpleMarkdown: FC<{ text: string; className?: string; onTryCode?: (code: string) => void }> = ({
  text,
  className,
  onTryCode,
}) => {
  const language = useContext(CodeLanguageContext)
  const blocks = splitFences(text.trim())
  return (
    <div className={className}>
      {blocks.map((block, i) =>
        block.type === 'code' ? (
          <div key={i} className="cq-md-code-block">
            <pre className="cq-md-pre">
              <HighlightedCode code={block.content} />
            </pre>
            {onTryCode && language === 'python' && looksLikePython(block.content) ? (
              <button
                type="button"
                className="cq-btn cq-btn--sm cq-md-try"
                onClick={() => onTryCode(block.content)}
                aria-label="Try this code in the sandbox"
              >
                Try it
              </button>
            ) : null}
          </div>
        ) : (
          <div key={i} className="cq-md-text">
            {renderParagraphs(block.content)}
          </div>
        ),
      )}
    </div>
  )
}

/** One line of inline markdown (`code`, **bold**) without paragraph wrappers, e.g. for labels. */
export const InlineMarkdown: FC<{ text: string }> = ({ text }) => <>{renderInline(text)}</>

function splitFences(text: string): { type: 'text' | 'code'; content: string }[] {
  const parts: { type: 'text' | 'code'; content: string }[] = []
  const re = /```(?:\w*\n)?([\s\S]*?)```/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      parts.push({ type: 'text', content: text.slice(last, m.index) })
    }
    parts.push({ type: 'code', content: m[1]?.trimEnd() ?? '' })
    last = m.index + m[0].length
  }
  if (last < text.length) {
    parts.push({ type: 'text', content: text.slice(last) })
  }
  if (parts.length === 0) {
    parts.push({ type: 'text', content: text })
  }
  return parts
}

function renderParagraphs(text: string): ReactNode[] {
  const paras = text.split(/\n\n+/).filter((p) => p.trim())
  return paras.map((p, i) => (
    <p key={i} className="cq-md-p">
      {renderInline(p.trim())}
    </p>
  ))
}

function renderInline(line: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let key = 0

  const pushCodes = (chunk: string) => {
    const re = /`([^`]+)`/g
    let last = 0
    let m: RegExpExecArray | null
    while ((m = re.exec(chunk)) !== null) {
      if (m.index > last) {
        nodes.push(<span key={key++}>{chunk.slice(last, m.index)}</span>)
      }
      nodes.push(
        <code key={key++} className="cq-md-code">
          {m[1]}
        </code>,
      )
      last = m.index + m[0].length
    }
    if (last < chunk.length) {
      nodes.push(<span key={key++}>{chunk.slice(last)}</span>)
    }
  }

  const boldRe = /\*\*([^*]+)\*\*/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = boldRe.exec(line)) !== null) {
    if (m.index > last) {
      pushCodes(line.slice(last, m.index))
    }
    const inner = m[1] ?? ''
    const innerNodes: ReactNode[] = []
    const codeRe = /`([^`]+)`/g
    let ilast = 0
    let cm: RegExpExecArray | null
    while ((cm = codeRe.exec(inner)) !== null) {
      if (cm.index > ilast) {
        innerNodes.push(<span key={key++}>{inner.slice(ilast, cm.index)}</span>)
      }
      innerNodes.push(
        <code key={key++} className="cq-md-code">
          {cm[1]}
        </code>,
      )
      ilast = cm.index + cm[0].length
    }
    if (ilast < inner.length) {
      innerNodes.push(<span key={key++}>{inner.slice(ilast)}</span>)
    }
    nodes.push(<strong key={key++}>{innerNodes}</strong>)
    last = m.index + m[0].length
  }
  if (last < line.length) {
    pushCodes(line.slice(last))
  }
  return nodes.length ? nodes : [<span key={0}>{line}</span>]
}
