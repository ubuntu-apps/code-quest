/**
 * Reverts fix-starter-close damage that inserted '}), inside starter/setup strings.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const dataDir = resolve(here, 'data')

const replacements = [
  // isinstance / call parens broken by '}), insertion
  [/C\('\}\),P\)/g, 'C(),P)'],
  [/C\('\}\),\(A,B\)\)/g, 'C(),(A,B))'],
  [/Cat\('\}\),Dog\(\)/g, 'Cat(),Dog()'],
  [/isinstance\(d\.get\("name"'\}\),str\)/g, 'isinstance(d.get("name"),str)'],
  [/isinstance\(d\.get\("age"'\}\),int\)/g, 'isinstance(d.get("age"),int)'],
  [/json\.dumps\(\{"a":1\}'\}\),str\)/g, 'json.dumps({"a":1}),str)'],
  // file-handling scaffold corruption
  [
    /pyVar\('s','s=="x"','s="x\\\\'\),\{starterCode:'"\.rstrip\("\\\\\\n"\)'\}\)/g,
    "pyVar('s','s==\"x\"','s=\"x\\\\n\".rstrip(\"\\\\n\")')",
  ],
  [
    /pyVar\('line','"n=1" in "n=1\\\\n"','line=f"n=\{1\}\\\\'\),\{starterCode:'"'\}\)/g,
    "pyVar('line','\"n=1\" in \"n=1\\\\n\"','line=f\"n={1}\\\\n\"')",
  ],
]

let total = 0
for (const file of readdirSync(dataDir).filter((x) => x.endsWith('.mjs') && !x.startsWith('_'))) {
  const path = join(dataDir, file)
  let text = readFileSync(path, 'utf8')
  let changed = false
  for (const [re, rep] of replacements) {
    const next = text.replace(re, rep)
    if (next !== text) {
      const count = (text.match(re) || []).length
      total += count
      text = next
      changed = true
    }
  }
  if (changed) {
    writeFileSync(path, text, 'utf8')
    console.log(file)
  }
}
console.log(`Applied ${total} embedded-paren fixes`)
