/**
 * Fixes extra ')' after ch(..., pyVar(...), {starterCode:'...'})),
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const dataDir = resolve(here, 'data')

let total = 0
for (const file of readdirSync(dataDir).filter((x) => x.endsWith('.mjs') && !x.startsWith('_'))) {
  const path = join(dataDir, file)
  const before = readFileSync(path, 'utf8')
  const after = before.replace(/'\}\)\),/g, () => {
    total += 1
    return `'}),`
  })
  if (after !== before) {
    writeFileSync(path, after, 'utf8')
    console.log(file)
  }
}
console.log(`Fixed ${total} occurrences`)
