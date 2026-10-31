/**
 * Finds other data for the R challenges whose "works with other data too" check doesn't do
 * its job: the default change (see data/_rerun.mjs) either breaks the solution or doesn't
 * change the answer, so an answer typed in as fixed values still passes. Like checkR, it runs
 * in the dev app's browser console, because R runs there:
 *
 *   const { findVariations } = await import('/code-quest/scripts/r-curriculum/find-variations.mjs')
 *   const found = await findVariations()        // or findVariations('cleaning')
 *
 * `found.variations` maps a challenge's key to the other starter that works: paste it into
 * data/r-variations.mjs. `found.unresolved` lists the challenges no strategy fixed; give them
 * an `alt` by hand, or `typedOk: true` when the answer is a fixed value by nature.
 */
import { COURSE } from './data/course.mjs'
import { candidateData, checkedVars, variationKey } from './data/_rerun.mjs'
import { runRCode, runRChallengeTests } from '../../src/features/curriculum/rSandbox.ts'

const MARK = '<<cq-values>>'
const DUMP = `
cat("${MARK}", paste(unlist(lapply(ls(), function(n) {
  v <- get(n)
  if (is.function(v)) NULL else paste0("\\u0060", n, "\\u0060 <- ", paste(deparse(v), collapse = " "))
})), collapse = "\\n"), "${MARK}", sep = "")`

async function valuesAfter(code) {
  const run = await runRCode(code + DUMP)
  const out = run.output ?? ''
  const from = out.indexOf(MARK)
  const to = out.lastIndexOf(MARK)
  if (run.error || from < 0 || to <= from) return null
  return { printed: out.slice(0, from), values: out.slice(from + MARK.length, to).split('\n').filter(Boolean) }
}

/** The starter, then what the solution made or changed written out as fixed values (see checkR). */
async function typedIn(c) {
  const done = await valuesAfter(c.solution)
  const start = await valuesAfter(c.starterCode)
  if (!done || !start) return null
  const values = done.values.filter((line) => !start.values.includes(line)).join('\n')
  return `${c.starterCode}\n${values}${done.printed.trim() ? `\ncat(${JSON.stringify(done.printed)})` : ''}`
}

function rerunTest(c, alt) {
  const tests = c.validation.tests.filter((t) => t.label !== 'Works with other data too')
  const pairs = tests.map((t) => [t.label, t.assertion])
  const vars = checkedVars(c.solution, pairs)
  const output = pairs.some(([, a]) => a.includes('._cq_stdout'))
  const assertion = `._cq_rerun(${JSON.stringify(c.starterCode)}, ${JSON.stringify(alt)}, ${JSON.stringify(c.solution)}, c(${vars.map((v) => JSON.stringify(v)).join(', ')}), output = ${output ? 'TRUE' : 'FALSE'})`
  return [...tests, { id: `t${tests.length + 1}`, label: 'Works with other data too', assertion }]
}

export async function findVariations(sectionId) {
  const variations = {}
  const unresolved = []
  for (const section of COURSE.filter((s) => !sectionId || s.sectionId === sectionId)) {
    for (const topic of section.topics) {
      for (const c of topic.challenges) {
        if (c.typedOk || !c.starterCode) continue
        const where = `${section.sectionId}/${topic.id} "${c.title}"`
        globalThis.cqVariationProgress = where
        const typed = await typedIn(c)
        if (typed === null) continue
        const good = await runRChallengeTests(c.solution, '', c.validation.tests)
        const cheat = await runRChallengeTests(typed, '', c.validation.tests)
        if (good.passed && !cheat.passed) continue
        let found = null
        for (const alt of candidateData(c.starterCode)) {
          const tests = rerunTest(c, alt)
          if (!(await runRChallengeTests(c.solution, '', tests)).passed) continue
          if ((await runRChallengeTests(typed, '', tests)).passed) continue
          found = alt
          break
        }
        if (found) variations[variationKey(c.starterCode, c.solution)] = { where, alt: found }
        else unresolved.push(where)
      }
    }
  }
  return { variations, unresolved }
}
