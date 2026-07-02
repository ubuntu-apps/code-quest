import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const path = resolve(here, 'data/control-flow.mjs')
let src = readFileSync(path, 'utf8')

if (!src.includes('control-flow-help')) {
  src = src.replace(
    "import { makeTopic, ch, qMcq, qShort, pyOut, pyVar, regex, includes } from './_builders.mjs'",
    `import { makeTopic, ch, qMcq, qShort, pyOut, pyVar, regex, includes } from './_builders.mjs'
import { helpFor } from './control-flow-help.mjs'

function chHelp(topicId, index, difficulty, title, prompt, validation, extra = {}) {
  return ch(difficulty, title, prompt, validation, { ...extra, ...helpFor(topicId, index) })
}`,
  )
}

let currentTopic = null
let index = 0
src = src
  .split('\n')
  .map((line) => {
    const topicMatch = line.match(/^\s*id: '([^']+)'/)
    if (topicMatch) {
      currentTopic = topicMatch[1]
      index = 0
    }
    if (currentTopic && /^\s*ch\(/.test(line)) {
      const replaced = line.replace(/^(\s*)ch\(/, `$1chHelp('${currentTopic}', ${index}, `)
      index += 1
      return replaced
    }
    if (line.trim().startsWith('questions:')) currentTopic = null
    return line
  })
  .join('\n')

writeFileSync(path, src)
console.log('Updated control-flow.mjs with chHelp')
