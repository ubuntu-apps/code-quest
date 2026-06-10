import { readFileSync } from 'node:fs'
import { createContext, runInContext } from 'node:vm'

const file = process.argv[2]
const text = readFileSync(file, 'utf8')
const lines = text.split('\n')
for (let i = 0; i < lines.length; i++) {
  const chunk = lines.slice(0, i + 1).join('\n')
  try {
    runInContext(chunk, createContext({}))
  } catch (e) {
    if (e.name === 'SyntaxError') {
      console.log(`First syntax error after line ${i + 1}: ${e.message}`)
      console.log(lines[i])
      break
    }
  }
}
