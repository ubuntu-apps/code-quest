/**
 * Expert pyVar challenges: move full setup solutions into starterCode scaffolds
 * so learners must write code that satisfies the assertion.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const here = dirname(fileURLToPath(import.meta.url))
const dataDir = resolve(here, 'data')

function unescapeSetup(raw) {
  return raw.replace(/\\n/g, '\n').replace(/\\'/g, "'")
}

function escapeSetup(code) {
  return code.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')
}

function selfPasses(assertion, setup) {
  const code = `
ns = {}
exec(${JSON.stringify(setup)}, ns, ns)
try:
    ok = bool(eval(${JSON.stringify(assertion)}, ns, ns))
except Exception:
    ok = False
print("PASS" if ok else "FAIL")
`
  const r = spawnSync('python', ['-c', code], { encoding: 'utf8' })
  return r.stdout.trim() === 'PASS'
}

function scaffoldSetup(setup) {
  const lines = setup.split('\n').filter((l) => l.trim())
  if (lines.length <= 1) return { setup, starter: '' }

  // Keep only leading simple declarations (no control flow / def / class)
  const decl = []
  const body = []
  let inDecl = true
  for (const line of lines) {
    const t = line.trim()
    const isDecl =
      inDecl &&
      !t.startsWith('def ') &&
      !t.startsWith('class ') &&
      !t.startsWith('try:') &&
      !t.startsWith('except') &&
      !t.startsWith('finally:') &&
      !t.startsWith('else:') &&
      !t.startsWith('elif ') &&
      !t.startsWith('for ') &&
      !t.startsWith('while ') &&
      !t.startsWith('with ') &&
      !t.startsWith('import ') &&
      !t.startsWith('from ') &&
      (t.includes('=') || t.startsWith('pass'))

    if (isDecl && !t.startsWith('pass')) {
      decl.push(line)
    } else {
      inDecl = false
      body.push(line)
    }
  }

  if (body.length === 0) return { setup, starter: '' }
  return { setup: decl.join('\n') || 'pass', starter: body.join('\n') }
}

let updated = 0
for (const file of readdirSync(dataDir).filter((x) => x.endsWith('.mjs') && !x.startsWith('_'))) {
  let text = readFileSync(join(dataDir, file), 'utf8')
  const re =
    /ch\('(medium|hard|expert)','([^']*)','([^']*)',pyVar\('([^']*)','([^']*)','((?:\\'|[^'])*)'\)(?:,\{starterCode:'(?:\\.|[^'\\])*'\})?\)/g

  text = text.replace(re, (full, difficulty, title, prompt, vname, assertion, setupRaw) => {
    const setup = unescapeSetup(setupRaw)
    if (!selfPasses(assertion, setup)) return full

    const { setup: newSetup, starter } = scaffoldSetup(setup)
    if (starter === '') return full

    const starterEscaped = starter.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/'/g, "\\'")
    const newExtra = `{starterCode:'${starterEscaped}'}`

    updated += 1
    return `ch('${difficulty}','${title}','${prompt}',pyVar('${vname}','${assertion}','${escapeSetup(newSetup)}'),${newExtra})`
  })

  writeFileSync(join(dataDir, file), text, 'utf8')
}

console.log(`Scaffolded ${updated} self-passing medium/hard/expert challenges`)
