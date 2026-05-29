import type { FC, ReactNode } from 'react'

/** Minimal markdown: paragraphs, fenced ``` code blocks, inline `code`, **bold**. */
export const SimpleMarkdown: FC<{ text: string; className?: string }> = ({ text, className }) => {
  const blocks = splitFences(text.trim())
  return (
    <div className={className}>
      {blocks.map((block, i) =>
        block.type === 'code' ? (
          <pre key={i} className="cq-md-pre">
            <code>{block.content}</code>
          </pre>
        ) : (
          <div key={i} className="cq-md-text">
            {renderParagraphs(block.content)}
          </div>
        ),
      )}
    </div>
  )
}

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
