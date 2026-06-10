/**
 * Tightens medium/hard challenges: replaces trivial ok==True and includes() checks
 * with python_tests (pyVar/includes/pyOut) validations.
 * Run: node scripts/python-curriculum/apply-mh-fixes.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { MH_FIXES } from './mh-fixes.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const dataDir = resolve(here, 'data')

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

let total = 0
for (const [file, fixes] of Object.entries(MH_FIXES)) {
  const path = resolve(dataDir, file)
  let content = readFileSync(path, 'utf8')
  let count = 0
  for (const [key, spec] of Object.entries(fixes)) {
    const [difficulty, title] = key.split('::')
    const validation = typeof spec === 'string' ? spec : spec.validation
    const extra = typeof spec === 'string' ? '' : spec.extra ? `,${spec.extra}` : ''

    const trailingExtra = `(?:,\\{starterCode:'(?:\\\\.|[^'\\\\])*'\\})?`
    const weakRe = new RegExp(
      `ch\\('${difficulty}','${escapeRe(title)}','[^']*',pyVar\\('ok','ok==True','ok=True'\\)${trailingExtra}`,
      'g',
    )
    const incRe = new RegExp(
      `ch\\('${difficulty}','${escapeRe(title)}','[^']*',includes\\([^)]*\\)${trailingExtra}`,
      'g',
    )

    const replacement = `ch('${difficulty}','${title}','',${validation}${extra})`
    const nextWeak = content.replace(weakRe, replacement)
    const next = nextWeak.replace(incRe, replacement)
    if (next !== content) {
      count += 1
      content = next
    }
  }
  writeFileSync(path, content, 'utf8')
  console.log(`${file}: ${count} medium/hard fixes applied`)
  total += count
}
console.log(`Total: ${total}`)
