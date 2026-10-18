import { useMemo } from 'react'
import { diffValues, type DiffSegment } from '../valueDiff'

export interface ValueDiffData {
  expected: string
  actual: string
  /** Both values are strings, shown as plain text; otherwise they are Python reprs. */
  text: boolean
}

/** Marked spaces and line breaks would be invisible, so they get a visible sign. */
function showWhitespace(text: string): string {
  return text.replace(/ /g, '·').replace(/\t/g, '→').replace(/\n/g, '↵\n')
}

function Segments({ segments, kind }: { segments: DiffSegment[]; kind: 'missing' | 'extra' }) {
  if (segments.length === 0) return <span className="cq-diff-empty">(nothing)</span>
  return (
    <>
      {segments.map((seg, i) =>
        seg.changed ? (
          <mark key={i} className={`cq-diff-mark cq-diff-mark--${kind}`}>
            {showWhitespace(seg.text)}
          </mark>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </>
  )
}

/**
 * A failed "expected == actual" check, with the characters that differ highlighted:
 * what is missing from the learner's value on the Expected line, and what shouldn't
 * be there on the Got line.
 */
export function ValueDiff({ diff }: { diff: ValueDiffData }) {
  const result = useMemo(() => diffValues(diff.expected, diff.actual), [diff.expected, diff.actual])
  return (
    <div className="cq-diff">
      <div className="cq-diff-label">Expected</div>
      <pre className="cq-diff-value">
        <Segments segments={result.expected} kind="missing" />
      </pre>
      <div className="cq-diff-label">Got</div>
      <pre className="cq-diff-value">
        <Segments segments={result.actual} kind="extra" />
      </pre>
      {diff.text && diff.expected.trim() === diff.actual.trim() ? (
        <p className="cq-diff-note">Only spaces or line breaks at the start or end are different.</p>
      ) : null}
    </div>
  )
}
