/**
 * Repairs corruption from apply-mh-fixes (duplicate starterCode, extra parens).
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const dataDir = resolve(here, 'data')

function repair(text) {
  let n = 0
  // Duplicate starterCode: ),{starter:A}),{starter:B}) -> ),{starter:A})
  const dup = /\),\{starterCode:'((?:\\'|[^'])*)'\}\),\{starterCode:'(?:\\'|[^']*)'\}\)/g
  text = text.replace(dup, (m, starter) => {
    n += 1
    return `),{starterCode:'${starter}'})`
  })

  // pyVar(...)))), -> pyVar(...)),
  const extraParen = /(pyVar\('[^']*','[^']*','(?:\\'|[^'])*)'\)\)+,/g
  text = text.replace(extraParen, (m) => {
    if (m.endsWith('))),')) {
      n += 1
      return m.replace(/\)\)+,/, '),')
    }
    return m
  })

  // Extra paren after starterCode block: {starterCode:'...'}), -> should be }),
  const extraAfterStarter = /(\{starterCode:'(?:\\'|[^']*)'\})\),/g
  text = text.replace(extraAfterStarter, (m, block) => {
    n += 1
    return `${block}),`
  })

  // Orphan tail from greedy regex eating dict inside pyVar setup
  const orphanTail = /\), indent=2\)\)\'\}\)/g
  if (orphanTail.test(text)) {
    text = text.replace(orphanTail, ')')
    n += 1
  }

  // Fix triple closing parens before comma
  const triple = /\)\)\),/g
  if (triple.test(text)) {
    text = text.replace(triple, '),')
    n += 1
  }
  text = text.replace(/\)\)\)\]/g, '))]')
  return { text, n }
}

let total = 0
for (const file of readdirSync(dataDir).filter((x) => x.endsWith('.mjs') && !x.startsWith('_') && !x.includes('expert-fixes') && !x.includes('mh-fixes'))) {
  const path = join(dataDir, file)
  const { text, n } = repair(readFileSync(path, 'utf8'))
  writeFileSync(path, text, 'utf8')
  if (n) console.log(`${file}: ${n} repairs`)
  total += n
}
console.log(`Total repairs: ${total}`)
