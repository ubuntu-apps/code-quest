import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const dataDir = resolve(here, 'data')

function balance(text) {
  // pyVar(...))),{starter -> pyVar(...),{starter
  text = text.replace(
    /(pyVar\('[^']*','[^']*','(?:\\'|[^'])*)'\)\),\{starterCode/g,
    "$1'),{starterCode",
  )
  // {starter...})),ch -> {starter...}),ch
  text = text.replace(/\{starterCode:'(?:\\'|[^']*)'\}\)\),ch/g, (m) =>
    m.replace('})),ch', '}),ch'),
  )
  // orphan }),{starter after botched includes replace: )),{starter when no pyVar before
  // pyVar(...')),ch when missing starter - already ok
  return text
}

for (const file of readdirSync(dataDir).filter(
  (x) => x.endsWith('.mjs') && !x.startsWith('_') && !x.includes('fix') && !x.includes('mh-fixes') && !x.includes('expert-fixes'),
)) {
  const path = join(dataDir, file)
  const before = readFileSync(path, 'utf8')
  const after = balance(before)
  if (after !== before) {
    writeFileSync(path, after, 'utf8')
    console.log('balanced', file)
  }
}
