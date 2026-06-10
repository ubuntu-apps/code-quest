/**
 * Flags expert pyVar challenges whose setupCode alone satisfies the assertion.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const here = dirname(fileURLToPath(import.meta.url))
const dataDir = resolve(here, 'data')

const pyCheck = spawnSync('python', ['-c', 'print(1)'], { encoding: 'utf8' })
if (pyCheck.status !== 0) {
  console.log('Python not available — skip audit')
  process.exit(0)
}

const selfPassing = []
for (const file of readdirSync(dataDir).filter((x) => x.endsWith('.mjs') && !x.startsWith('_'))) {
  const text = readFileSync(join(dataDir, file), 'utf8')
  const re = /ch\('expert','([^']*)','[^']*',pyVar\('([^']*)','([^']*)','((?:\\'|[^'])*)'\)/g
  for (const m of text.matchAll(re)) {
    const [, title, , assertion, setupRaw] = m
    const setup = setupRaw.replace(/\\n/g, '\n').replace(/\\'/g, "'")
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
    if (r.stdout.trim() === 'PASS') {
      selfPassing.push({ file, title })
    }
  }
}

console.log(`Self-passing expert challenges (setup alone): ${selfPassing.length}`)
for (const item of selfPassing) {
  console.log(`  ${item.file} :: ${item.title}`)
}
