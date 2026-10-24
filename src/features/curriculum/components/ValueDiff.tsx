import { useMemo } from 'react'
import { diffValues, type DiffSegment } from '../valueDiff'

export interface ValueDiffData {
  expected: string
  actual: string
  /** Both values are strings, shown as plain text; otherwise they are Python reprs. */
  text: boolean
  /** Both values are result tables (SQL): rows that differ are marked, not characters. */
  table?: boolean
}

/**
 * Which lines of `a` and `b` are kept by a longest common run of lines, so rows that are
 * missing, extra or out of place are marked on whole lines.
 */
function lineDiff(a: string[], b: string[]): { a: boolean[]; b: boolean[] } {
  const n = a.length
  const m = b.length
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1])
    }
  }
  const keptA = new Array<boolean>(n).fill(false)
  const keptB = new Array<boolean>(m).fill(false)
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      keptA[i] = true
      keptB[j] = true
      i++
      j++
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) i++
    else j++
  }
  return { a: keptA, b: keptB }
}

function TableLines({ lines, kept, kind }: { lines: string[]; kept: boolean[]; kind: 'missing' | 'extra' }) {
  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          {kept[i] ? line : <mark className={`cq-diff-mark cq-diff-mark--${kind}`}>{line}</mark>}
          {i < lines.length - 1 ? '\n' : ''}
        </span>
      ))}
    </>
  )
}

/** Two result tables, with the rows that differ marked. */
function TableDiff({ diff }: { diff: ValueDiffData }) {
  const expected = useMemo(() => diff.expected.split('\n'), [diff.expected])
  const actual = useMemo(() => diff.actual.split('\n'), [diff.actual])
  const kept = useMemo(() => lineDiff(expected, actual), [expected, actual])
  return (
    <div className="cq-diff">
      <div className="cq-diff-label">Expected</div>
      <pre className="cq-diff-value cq-diff-value--table">
        <TableLines lines={expected} kept={kept.a} kind="missing" />
      </pre>
      <div className="cq-diff-label">Got</div>
      <pre className="cq-diff-value cq-diff-value--table">
        <TableLines lines={actual} kept={kept.b} kind="extra" />
      </pre>
    </div>
  )
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
  if (diff.table) return <TableDiff diff={diff} />
  return <CharacterDiff diff={diff} />
}

function CharacterDiff({ diff }: { diff: ValueDiffData }) {
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
