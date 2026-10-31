/**
 * The R content checks, shared by check-in-browser.mjs (webR in the dev app) and
 * check-node.mjs (webR in Node, for CI). The runner functions come from whichever is used:
 * `runRCode(code)` → { output, error } and `runRChallengeTests(code, setup, tests)` →
 * { passed, tests, output, error }.
 *
 * For every challenge, the solution must pass, and neither the starter code nor the solution's
 * answer typed in as fixed values may pass (unless the challenge is marked `typedOk`, or has no
 * starter data to work from). Every sandbox sample and lesson "Try it" block must run without
 * an error (unless it says it shows one), and every gate question with a `check` must give
 * the output or error it claims.
 */

/** A sample meant to show an error says so in a comment, such as `# Run it and read the error`. */
const showsError = (code) => /#.*\berror\b/i.test(code)

const DUMP_MARK = '<<cq-values>>'
/** R code that shows every variable (not functions) as R code that makes it: `x <- c(1, 2)`. */
const DUMP = `
cat("${DUMP_MARK}", paste(unlist(lapply(ls(), function(n) {
  v <- get(n)
  if (is.function(v)) NULL else paste0("\\u0060", n, "\\u0060 <- ", paste(deparse(v), collapse = " "))
})), collapse = "\\n"), "${DUMP_MARK}", sep = "")`

/** Mirrors looksLikeR and codeToTry in src/features/curriculum/codeHighlight.ts and tryCode.ts. */
function looksLikeR(code) {
  const lines = code.split('\n').filter((l) => l.trim() !== '' && !l.trim().startsWith('#'))
  return lines.length > 0 && lines.some((l) => /<-|[A-Za-z_.][\w.]*\(|^\s*-?[\d.]+\s*([-+*/^]|%%|%\/%)\s*[\d.(]/.test(l))
}

/** The code each "Try it" button in a lesson loads: earlier runnable blocks, then the block. */
function tryItBlocks(paragraphs) {
  const blocks = []
  const re = /```(?:(\w*)\n)?([\s\S]*?)```/g
  let m
  const text = paragraphs.join('\n\n').trim()
  while ((m = re.exec(text)) !== null) blocks.push({ content: (m[2] ?? '').trimEnd(), lang: m[1] || '' })
  const runnable = (b) => !['text', 'output'].includes(b.lang) && looksLikeR(b.content)
  const out = []
  blocks.forEach((b, i) => {
    if (!runnable(b)) return
    const earlier = blocks.slice(0, i).filter((e) => runnable(e) && !showsError(e.content)).map((e) => e.content)
    out.push({ code: [...earlier, b.content].join('\n\n'), own: b.content })
  })
  return out
}

export function createChecker({ runRCode, runRChallengeTests }) {
  async function valuesAfter(code) {
    const run = await runRCode(code + DUMP)
    const out = run.output ?? ''
    const from = out.indexOf(DUMP_MARK)
    const to = out.lastIndexOf(DUMP_MARK)
    if (run.error || from < 0 || to <= from) return null
    return { printed: out.slice(0, from), values: out.slice(from + DUMP_MARK.length, to).split('\n').filter(Boolean) }
  }

  /**
   * The learner's "answer typed in": the starter code, then what the solution made or changed
   * written out as fixed values, then its output shown as fixed text.
   */
  async function typedInCode(c) {
    const done = await valuesAfter(c.solution)
    const start = await valuesAfter(c.starterCode ?? '')
    if (!done || !start) return null
    const values = done.values.filter((line) => !start.values.includes(line)).join('\n')
    return `${c.starterCode ?? ''}\n${values}${done.printed.trim() ? `\ncat(${JSON.stringify(done.printed)})` : ''}`
  }

  return async function checkCourse(course, sectionId, onProgress = () => {}) {
    const problems = []
    let challenges = 0
    let questions = 0
    const sections = course.filter((s) => s.topics.length > 0 && (!sectionId || s.sectionId === sectionId))
    for (const section of sections) {
      for (const topic of section.topics) {
        const where = `${section.sectionId}/${topic.id}`
        const samples = [['sandbox', topic.sandboxCode], ...(topic.sandboxSnippets ?? []).map((s) => [s.label, s.code])]
        for (const [label, code] of samples) {
          const run = await runRCode(code)
          if (run.error && !showsError(code)) problems.push(`${where} sample "${label}": ${run.error.detail}`)
          else if (!run.error && showsError(code)) problems.push(`${where} sample "${label}" should show an error but runs`)
        }
        for (const [i, block] of tryItBlocks(topic.paragraphs).entries()) {
          const run = await runRCode(block.code)
          if (run.error && !showsError(block.own)) problems.push(`${where} "Try it" block ${i + 1}: ${run.error.detail}`)
          else if (!run.error && showsError(block.own)) problems.push(`${where} "Try it" block ${i + 1} should show an error but runs`)
        }
        for (const c of topic.challenges) {
          challenges += 1
          onProgress(`${where} "${c.title}"`)
          const tests = c.validation.tests
          const good = await runRChallengeTests(c.solution, c.validation.setupCode, tests)
          if (!good.passed) {
            const why = good.error ? good.error.detail : good.tests.filter((t) => !t.passed).map((t) => `${t.label}: ${t.detail}`).join('; ')
            problems.push(`${where} "${c.title}": the solution fails (${why}). Output: ${good.output}`)
          }
          const start = await runRChallengeTests(c.starterCode ?? '', c.validation.setupCode, tests)
          if (start.passed) problems.push(`${where} "${c.title}": the starter code already passes`)
          // With no starter data there is nothing to work from, so the answer is the value itself.
          if (!c.typedOk && c.starterCode) {
            const typed = await typedInCode(c)
            if (typed !== null && (await runRChallengeTests(typed, c.validation.setupCode, tests)).passed) {
              problems.push(`${where} "${c.title}": the answer typed in as fixed values passes`)
            }
          }
        }
        for (const q of topic.questions) {
          if (!q.check) continue
          questions += 1
          const run = await runRCode(q.check.code)
          if (q.check.error !== undefined) {
            const message = run.error?.detail ?? ''
            if (!message.includes(q.check.error)) {
              problems.push(`${where} question "${q.prompt}": expected an error with "${q.check.error}", got ${run.error ? `"${message}"` : `output "${run.output}"`}`)
            }
          } else if (run.error) {
            problems.push(`${where} question "${q.prompt}": error ${run.error.detail}`)
          } else if (run.output.trim() !== q.check.output) {
            problems.push(`${where} question "${q.prompt}": expected "${q.check.output}", got "${run.output.trim()}"`)
          }
        }
      }
    }
    const summary = `${challenges} challenges and ${questions} checked questions: ${problems.length ? `${problems.length} problem(s)` : 'all good'}`
    return { summary, problems }
  }
}
