// Checks that run a challenge again with other data (see ._cq_rerun in src/features/languages/r/rHarness.ts), so an
// answer typed in as fixed values fails. The other data is made from the starter code:
// - numbers inside c(…) or list(…), in set.seed() and in plain assignments (x <- 47.8) move
//   up a little;
// - a c(…) of two or more numbers is also put in reverse order, so the largest, the passes
//   and the rest come out differently;
// - in a c(…) of two or more texts, the last one gets a "2" added, so counts, unique values
//   and lookups change while names stay unique (not for levels, labels or breaks);
// - a text that is a date ("2026-10-01", "30/10/2026") moves on a year, every other one, so
//   gaps between dates and weekdays change;
// - in CSV text ("a,b\n1,2"), the numbers in the data lines move up, except parts of dates
//   and times.
// The checker (check-in-browser.mjs) makes sure the solution still runs on the other data and
// gives a different result; when it can't, a challenge gives its own `alt`.

const LITERAL = /^\s*(?:[A-Za-z.][\w.]*\s*=\s*)?(?:-?\d+(?:\.\d+)?|"[^"\\]*"|NA|TRUE|FALSE)\s*$/
const DATE_TEXT = /^"(\d{4})(-\d\d-\d\d)"$|^"(\d\d?[/.]\d\d?[/.])(\d{2,4})"$|^"(\d\d? [A-Z][a-z]{2} )(\d{4})"$/

/** How a strategy changes each kind of value (see STRATEGIES). */
const DEFAULT = { number: 'move', reverse: true, text: 'suffix', dates: true, csv: true, na: 'keep' }

function changeNumber(tok, k, how) {
  if (how === 'double') return String(Number(tok) * 2 + 1 + (k % 2))
  if (how === 'jump') return String(Number(tok) * 3 + 7)
  return moveNumber(tok, k)
}

function moveNumber(tok, k) {
  const step = 1 + (k % 3)
  const dot = tok.indexOf('.')
  if (dot < 0) return String(Number(tok) + step)
  const d = tok.length - dot - 1
  return (Number(tok) + step * 10 ** -d).toFixed(d)
}

/** Splits the inside of c(…) at its commas (not those inside texts), when every part is a plain value. */
function literalParts(inner) {
  if (!inner.trim()) return null
  const parts = []
  let current = ''
  let quoted = false
  for (const ch of inner) {
    if (ch === '"') quoted = !quoted
    if (ch === ',' && !quoted) {
      parts.push(current)
      current = ''
    } else current += ch
  }
  parts.push(current)
  return parts.every((p) => LITERAL.test(p)) ? parts : null
}

/** "2026-10-01" → "2027-10-01", "30/10/2026" → "30/10/2027", "30.10.26" → "30.10.27". */
function moveDate(text) {
  const m = DATE_TEXT.exec(text)
  if (!m) return null
  if (m[1]) return `"${Number(m[1]) + 1}${m[2]}"`
  if (m[3]) return `"${m[3]}${String(Number(m[4]) + 1).padStart(m[4].length, '0')}"`
  return `"${m[5]}${Number(m[6]) + 1}"`
}

const valueOf = (part) => part.replace(/^\s*[A-Za-z.][\w.]*\s*=\s*/, '').trim()
const withValue = (part, value) => part.replace(valueOf(part), value)

function changeVector(inner, context, how) {
  const parts = literalParts(inner)
  if (!parts || parts.length < 2) return inner
  let values = parts.map(valueOf)
  if (values.every((v) => /^-?\d|^NA$/.test(v))) {
    if (how.na === 'first') values = values.map((v, i) => (i === values.findIndex((x) => x !== 'NA') ? 'NA' : v))
    if (how.na === 'fill') {
      const known = values.find((v) => v !== 'NA')
      values = values.map((v) => (v === 'NA' ? known : v))
    }
    if (how.reverse) values = [...values].reverse()
    return parts.map((p, i) => withValue(p, values[i])).join(',')
  }
  const isText = values.every((v) => v.startsWith('"') && !DATE_TEXT.test(v))
  if (!isText || /(levels|labels|breaks|dimnames|select|by|times|each)\s*=\s*$/.test(context)) return inner
  const last = values.length - 1
  const change = {
    suffix: (v) => `${v.slice(0, -1)}2"`,
    first: () => values[0],
    upper: (v) => v.toUpperCase(),
    space: (v) => `" ${v.slice(1, -1)} "`,
    none: (v) => v,
  }[how.text]
  if (how.text === 'reverse') values = [...values].reverse()
  else values = values.map((v, i) => (i === last ? change(v) : v))
  return parts.map((p, i) => withValue(p, values[i])).join(',')
}

/** Moves the numbers in the data lines of CSV text, keeping their width; dates and times stay. */
function changeCsv(literal, how) {
  if (!how.csv || (!literal.includes('\\n') && !literal.includes('\n'))) return literal
  const nl = literal.includes('\n') ? '\n' : '\\n'
  const lines = literal.split(nl)
  let k = 0
  return lines
    .map((line, i) =>
      i === 0 || !line.includes(',')
        ? line
        : line.replace(/(\d+(?:\.\d+)?)/g, (tok, _m, at) => {
            const before = line[at - 1] ?? ''
            const after = line[at + tok.length] ?? ''
            if ('/-:'.includes(before) && before !== '' && before !== '-') return tok
            if ('/-:'.includes(after) && after !== '') return tok
            if (before === '-' && /\d/.test(line[at - 2] ?? '')) return tok
            const moved = changeNumber(tok, k++, how.number)
            return tok.startsWith('0') && !tok.startsWith('0.') ? moved.padStart(tok.length, '0') : moved
          }),
    )
    .join(nl)
}

function transform(code, how) {
  let out = ''
  let i = 0
  let k = 0
  let dates = 0
  const stack = []
  while (i < code.length) {
    const ch = code[i]
    if (ch === '"' || ch === "'") {
      let j = i + 1
      while (j < code.length && code[j] !== ch) j += code[j] === '\\' ? 2 : 1
      const literal = code.slice(i, j + 1)
      const date = moveDate(literal)
      out += how.dates && date && dates++ % 2 === 0 ? date : changeCsv(literal, how)
      i = j + 1
      continue
    }
    if (ch === '#') {
      let j = code.indexOf('\n', i)
      if (j < 0) j = code.length
      out += code.slice(i, j)
      i = j
      continue
    }
    if (ch === '(') {
      const fn = (out.match(/([A-Za-z.][\w.]*)\s*$/) || [])[1] || ''
      const context = out.slice(0, out.length - fn.length).slice(-20)
      stack.push({ kind: '(', fn, start: out.length + 1, context })
      out += ch
      i += 1
      continue
    }
    if (ch === '[') {
      stack.push({ kind: '[', fn: '' })
      out += ch
      i += 1
      continue
    }
    if (ch === ')' || ch === ']') {
      const top = stack.pop()
      if (ch === ')' && top && top.fn === 'c') out = out.slice(0, top.start) + changeVector(out.slice(top.start), top.context, how)
      out += ch
      i += 1
      continue
    }
    const m = /^\d+(\.\d+)?(?![\w.])/.exec(code.slice(i))
    if (m && !/[\w.$]/.test(code[i - 1] ?? '')) {
      const top = stack[stack.length - 1]
      const before = out.slice(-30)
      const inC = Boolean(top && top.kind === '(' && ['c', 'list', 'set.seed'].includes(top.fn))
      const scalar = !top && /<-\s*-?$/.test(before)
      const range = /:\s*$/.test(before) || /^\s*:/.test(code.slice(i + m[0].length, i + m[0].length + 3))
      if ((inC || scalar) && !range && how.number !== 'keep') {
        out += changeNumber(m[0], k, how.number)
        k += 1
        i += m[0].length
        continue
      }
    }
    out += ch
    i += 1
  }
  return out
}

/** Other data for a starter (see the top of this file). */
export function otherData(starter) {
  return transform(starter, DEFAULT)
}

/**
 * Other ways to change the data, tried in turn by find-variations.mjs for a challenge whose
 * answer the default change doesn't move: bigger number changes, a gap (NA) added or filled
 * in, texts copied, in capitals or with spaces, and so on.
 */
const STRATEGIES = [
  { number: 'double', reverse: true, text: 'first', dates: true, csv: true, na: 'keep' },
  { number: 'jump', reverse: false, text: 'suffix', dates: true, csv: true, na: 'keep' },
  { number: 'keep', reverse: false, text: 'none', dates: false, csv: false, na: 'first' },
  { number: 'move', reverse: true, text: 'none', dates: false, csv: false, na: 'fill' },
  { number: 'keep', reverse: false, text: 'first', dates: false, csv: false, na: 'keep' },
  { number: 'keep', reverse: false, text: 'reverse', dates: false, csv: false, na: 'keep' },
  { number: 'keep', reverse: false, text: 'upper', dates: false, csv: false, na: 'keep' },
  { number: 'keep', reverse: false, text: 'space', dates: false, csv: false, na: 'keep' },
  { number: 'double', reverse: false, text: 'none', dates: true, csv: true, na: 'first' },
]

/** Other starters to try, most likely first, without repeats or the starter itself. */
export function candidateData(starter) {
  const seen = new Set([starter, otherData(starter)])
  const out = []
  for (const how of STRATEGIES) {
    const alt = transform(starter, how)
    if (!seen.has(alt)) {
      seen.add(alt)
      out.push(alt)
    }
  }
  return out
}

/** A short, stable key for a challenge's starter and solution: variations are stored under it. */
export function variationKey(starter, solution) {
  let hash = 0x811c9dc5
  const text = `${starter}\u0000${solution}`
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(36)
}

/** Variables the solution sets at the top level (not functions) that the checks look at. */
export function checkedVars(solution, tests) {
  const names = new Set()
  // Indented lines count too (inside if/else), but not the bodies of functions.
  const outsideFunctions = solution.replace(/<-\s*function\s*\([^)]*\)\s*\{[\s\S]*?\n\}/g, '<- function() {}')
  for (const m of outsideFunctions.matchAll(/^\s*([A-Za-z.][\w.]*)\s*(?:\$[\w.]+|\[[^\n]*?\]|\[\[[^\n]*?\]\])*\s*<-(?!\s*function)/gm)) names.add(m[1])
  for (const m of solution.matchAll(/^(?:names|rownames|colnames|levels)\(([A-Za-z.][\w.]*)\)[^\n]*<-/gm)) names.add(m[1])
  const text = tests.map(([, a]) => a).join('\n')
  return [...names].filter((n) => new RegExp(`(^|[^\\w.$])${n.replace(/\./g, '\\.')}([^\\w.]|$)`).test(text))
}
