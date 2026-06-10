/**
 * Replaces trivial expert validations (pyVar ok==True with ok=True setup).
 * Run: node scripts/python-curriculum/apply-expert-fixes.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { EXPERT_FIXES } from './expert-fixes.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const dataDir = resolve(here, 'data')

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

let total = 0
for (const [file, fixes] of Object.entries(EXPERT_FIXES)) {
  const path = resolve(dataDir, file)
  let content = readFileSync(path, 'utf8')
  let count = 0
  for (const [title, validation] of Object.entries(fixes)) {
    const re = new RegExp(
      `ch\\('expert','${escapeRe(title)}','[^']*',pyVar\\('ok','ok==True','ok=True'\\)`,
      'g',
    )
    const next = content.replace(re, `ch('expert','${title}','',${validation}`)
    if (next !== content) {
      count += 1
      content = next
    }
  }
  writeFileSync(path, content, 'utf8')
  console.log(`${file}: ${count} expert fixes applied`)
  total += count
}
console.log(`Total: ${total}`)
