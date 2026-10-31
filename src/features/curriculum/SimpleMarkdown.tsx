import { useContext, type FC, type ReactNode } from 'react'
import { canTryCode, codeToTry, type FenceBlock } from './tryCode'
import { CodeLanguageContext } from './codeLanguageContext'
import { HighlightedCode } from './components/HighlightedCode'

/**
 * Minimal markdown: paragraphs, fenced ``` code blocks, inline `code`, **bold**, and simple
 * pipe tables (a header row, a `| --- |` row, then the rows).
 * With `onTryCode`, Python, SQL and R code blocks get a "Try it" button that hands their code over
 * (sample output, folder layouts and shell commands don't get one, nor do fences marked
 * ```text). In R lessons the button hands over the lesson's code up to that block (see tryCode.ts).
 */
export const SimpleMarkdown: FC<{ text: string; className?: string; onTryCode?: (code: string) => void }> = ({
  text,
  className,
  onTryCode,
}) => {
  const language = useContext(CodeLanguageContext)
  const blocks = splitFences(text.trim())
  const fences: FenceBlock[] = blocks.filter((b) => b.type === 'code')
  return (
    <div className={className}>
      {blocks.map((block, i) =>
        block.type === 'code' ? (
          <div key={i} className="cq-md-code-block">
            <pre className="cq-md-pre">
              <HighlightedCode code={block.content} />
            </pre>
            {onTryCode && canTryCode(language, block) ? (
              <button
                type="button"
                className="cq-btn cq-btn--sm cq-md-try"
                onClick={() => onTryCode(codeToTry(language, fences, fences.indexOf(block)))}
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

function splitFences(text: string): { type: 'text' | 'code'; content: string; lang?: string }[] {
  const parts: { type: 'text' | 'code'; content: string; lang?: string }[] = []
  const re = /```(?:(\w*)\n)?([\s\S]*?)```/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      parts.push({ type: 'text', content: text.slice(last, m.index) })
    }
    parts.push({ type: 'code', content: m[2]?.trimEnd() ?? '', ...(m[1] ? { lang: m[1] } : {}) })
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
  return paras.map((p, i) => {
    const table = parseTable(p.trim())
    if (table) {
      return (
        <div key={i} className="cq-md-table-wrap">
          <table className="cq-md-table">
            <thead>
              <tr>
                {table.header.map((cell, c) => (
                  <th key={c}>{renderInline(cell)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td key={c}>{renderInline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
    return (
      <p key={i} className="cq-md-p">
        {renderInline(p.trim())}
      </p>
    )
  })
}

/** Cells of one `| a | b |` line. A `|` inside `code` doesn't split a cell. */
function tableCells(line: string): string[] {
  const inner = line.trim().replace(/^\|/, '').replace(/\|$/, '')
  const cells: string[] = []
  let cell = ''
  let inCode = false
  for (const ch of inner) {
    if (ch === '`') inCode = !inCode
    if (ch === '|' && !inCode) {
      cells.push(cell.trim())
      cell = ''
    } else {
      cell += ch
    }
  }
  cells.push(cell.trim())
  return cells
}

/** A paragraph that is a pipe table: every line starts with `|`, and the second is `| --- |`. */
function parseTable(text: string): { header: string[]; rows: string[][] } | null {
  const lines = text.split('\n')
  if (lines.length < 2 || !lines.every((l) => l.trim().startsWith('|'))) return null
  if (!/^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?$/.test(lines[1].trim())) return null
  return { header: tableCells(lines[0]), rows: lines.slice(2).map(tableCells) }
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
