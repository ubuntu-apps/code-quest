/** A run of text that is the same on both sides, or only on this side. */
export interface DiffSegment {
  text: string
  changed: boolean
}

export interface ValueDiffResult {
  expected: DiffSegment[]
  actual: DiffSegment[]
}

/** Above this many cells (length × length) only the start and end are matched, to stay fast. */
const MAX_TABLE = 400_000

function pushChar(segments: DiffSegment[], ch: string, changed: boolean): void {
  const last = segments[segments.length - 1]
  if (last && last.changed === changed) last.text += ch
  else segments.push({ text: ch, changed })
}

/** Long values: keep the common start and end, and mark everything between as changed. */
function prefixSuffixDiff(a: string, b: string): ValueDiffResult {
  let start = 0
  while (start < a.length && start < b.length && a[start] === b[start]) start += 1
  let end = 0
  while (end < a.length - start && end < b.length - start && a[a.length - 1 - end] === b[b.length - 1 - end]) end += 1
  const side = (s: string): DiffSegment[] =>
    [
      { text: s.slice(0, start), changed: false },
      { text: s.slice(start, s.length - end), changed: true },
      { text: s.slice(s.length - end), changed: false },
    ].filter((seg) => seg.text !== '')
  return { expected: side(a), actual: side(b) }
}

/**
 * Character-level difference between an expected and an actual value: characters
 * that are not part of the longest common subsequence are marked as changed. So
 * "Hello, world!" against "Hello world" marks only the comma and the "!".
 */
export function diffValues(expected: string, actual: string): ValueDiffResult {
  const a = Array.from(expected)
  const b = Array.from(actual)
  if ((a.length + 1) * (b.length + 1) > MAX_TABLE) return prefixSuffixDiff(expected, actual)

  // lcs[i][j]: length of the longest common subsequence of a[i:] and b[j:].
  const width = b.length + 1
  const lcs = new Uint32Array((a.length + 1) * width)
  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      lcs[i * width + j] =
        a[i] === b[j] ? lcs[(i + 1) * width + j + 1] + 1 : Math.max(lcs[(i + 1) * width + j], lcs[i * width + j + 1])
    }
  }

  const left: DiffSegment[] = []
  const right: DiffSegment[] = []
  let i = 0
  let j = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      pushChar(left, a[i], false)
      pushChar(right, b[j], false)
      i += 1
      j += 1
    } else if (lcs[(i + 1) * width + j] >= lcs[i * width + j + 1]) {
      pushChar(left, a[i], true)
      i += 1
    } else {
      pushChar(right, b[j], true)
      j += 1
    }
  }
  for (; i < a.length; i += 1) pushChar(left, a[i], true)
  for (; j < b.length; j += 1) pushChar(right, b[j], true)
  return { expected: left, actual: right }
}
