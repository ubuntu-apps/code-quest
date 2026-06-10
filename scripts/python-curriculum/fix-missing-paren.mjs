import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const dataDir = resolve(here, 'data')

function fix(text) {
  // pyVar(...'),ch or pyVar(...'),{ -> pyVar(...')),ch
  return text.replace(
    /(pyVar\('[^']*','[^']*','(?:\\'|[^'])*)'\),(?=[ch\{])/g,
    "$1')),",
  )
}

let n = 0
for (const file of readdirSync(dataDir).filter((x) => x.endsWith('.mjs') && !x.startsWith('_') && !x.includes('fix') && !x.includes('mh-fixes') && !x.includes('expert-fixes'))) {
  const path = join(dataDir, file)
  const before = readFileSync(path, 'utf8')
  const after = fix(before)
  if (after !== before) {
    writeFileSync(path, after, 'utf8')
    n += 1
    console.log('fixed', file)
  }
}
console.log('files fixed:', n)
