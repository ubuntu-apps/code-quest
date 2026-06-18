/**
 * Adds hint and solution fields to fundamentals.json without changing challenge IDs.
 * Run: node scripts/python-curriculum/patch-fundamentals-help.mjs
 */
import { readFile, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FUNDAMENTALS_HELP } from './data/fundamentals-help.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const jsonPath = resolve(here, '../../public/content/python/fundamentals.json')

const file = JSON.parse(await readFile(jsonPath, 'utf8'))
let patched = 0

for (const level of file.levels) {
  const helpItems = FUNDAMENTALS_HELP[level.id]
  if (!helpItems) {
    console.warn(`No help data for level ${level.id}`)
    continue
  }
  if (helpItems.length !== level.challenges.length) {
    throw new Error(
      `Help count mismatch for ${level.id}: ${helpItems.length} help items vs ${level.challenges.length} challenges`,
    )
  }
  level.challenges.forEach((ch, index) => {
    const { hint, solution } = helpItems[index]
    ch.hint = hint
    ch.solution = solution
    delete ch.hints
    patched += 1
  })
}

await writeFile(jsonPath, `${JSON.stringify(file, null, 2)}\n`, 'utf8')
console.log(`Patched ${patched} challenges in fundamentals.json`)
