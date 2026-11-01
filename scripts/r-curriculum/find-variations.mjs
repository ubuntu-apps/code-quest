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
import { candidateData, variationKey } from './data/_rerun.mjs'
import { RProtection } from './protection.mjs'
import { RChecker } from '../content-check/RChecker.mjs'
import { FetchContentSource } from '../content-check/ContentSource.mjs'
import { languagePack } from '../../src/features/languages/index.ts'

export async function findVariations(sectionId) {
  const spec = await new FetchContentSource(import.meta.env?.BASE_URL ?? '/code-quest/').languageSpec('r')
  const webR = await languagePack('r').runtime()
  const checker = new RChecker(spec, webR, COURSE)
  const protection = new RProtection()
  const variations = {}
  const unresolved = []
  for (const section of COURSE.filter((s) => !sectionId || s.sectionId === sectionId)) {
    for (const topic of section.topics) {
      for (const c of topic.challenges) {
        if (c.typedOk || !c.starterCode) continue
        const where = `${section.sectionId}/${topic.id} "${c.title}"`
        globalThis.cqVariationProgress = where
        const typed = await checker.typedInCode(c)
        if (typed === null) continue
        // The stage data has the challenge's own tests; the rerun test is added when publishing.
        const own = c.validation.tests
        const withRerun = (alt) => {
          const assertion = protection.rerunAssertion(c.starterCode, alt, c.solution, own.map((t) => [t.label, t.assertion]))
          return assertion ? [...own, { id: `t${own.length + 1}`, label: RProtection.LABEL, assertion }] : own
        }
        const published = protection.protect({ ...c })
        const good = await webR.check(c.solution, '', published.validation.tests)
        const cheat = await webR.check(typed, '', published.validation.tests)
        if (good.passed && !cheat.passed) continue
        let found = null
        for (const alt of candidateData(c.starterCode)) {
          const tests = withRerun(alt)
          if (!(await webR.check(c.solution, '', tests)).passed) continue
          if ((await webR.check(typed, '', tests)).passed) continue
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
