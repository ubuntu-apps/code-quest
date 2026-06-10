import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const dataDir = resolve(here, 'data')

const WEAK = /ch\('(medium|hard)','([^']*)','([^']*)',pyVar\('ok','ok==True','ok=True'\)/g
const INCLUDES = /ch\('(medium|hard)','([^']*)','([^']*)',includes\(/g

for (const file of readdirSync(dataDir).filter((x) => x.endsWith('.mjs') && !x.startsWith('_') && !x.includes('expert-fixes'))) {
  const text = readFileSync(join(dataDir, file), 'utf8')
  const weak = [...text.matchAll(WEAK)]
  const inc = [...text.matchAll(INCLUDES)]
  if (weak.length || inc.length) {
    console.log(`\n${file}: weak=${weak.length} includes=${inc.length}`)
    for (const m of weak) console.log(`  [${m[1]}] ${m[2]}`)
    for (const m of inc) console.log(`  [${m[1]} includes] ${m[2]}`)
  }
}
