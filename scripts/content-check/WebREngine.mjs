/**
 * Runs R for RChecker in Node, with webR, through the app's own test harness
 * (src/features/curriculum/rHarness.ts). webR isn't one of the app's dependencies (the app loads
 * it from a CDN), so install it first, at the version in src/runtimeVersions.ts:
 *
 *   npm install --no-save webr@0.4.2
 */
import { CLEAR_GLOBALS, challengeWrapper, parseChallengeOutput } from '../../src/features/curriculum/rHarness.ts'

export class WebREngine {
  constructor() {
    this.WebR = null
    this.webR = null
  }

  async available() {
    try {
      ;({ WebR: this.WebR } = await import('webr'))
      return true
    } catch {
      return false
    }
  }

  async start() {
    if (!this.WebR && !(await this.available())) throw new Error('webR is not installed. Run: npm install --no-save webr@0.4.2')
    this.webR = new this.WebR()
    await this.webR.init()
  }

  async stop() {
    this.webR?.close()
    this.webR = null
  }

  async conditionText(data) {
    if (typeof data === 'string') return data
    try {
      return await (await data.get('message')).toString()
    } catch {
      return ''
    }
  }

  /** Runs R code and gives what it printed (with warnings and messages) or its error. */
  async capture(code, options = {}) {
    const shelter = await new this.webR.Shelter()
    try {
      const { output } = await shelter.captureR(code, { captureStreams: true, captureConditions: true, ...options })
      const errors = output.filter((o) => o.type === 'error').map((o) => String(o.data ?? ''))
      if (errors.length) return { output: '', error: { detail: errors.join('\n') } }
      const lines = []
      for (const item of output) {
        if (item.type === 'stdout') lines.push(String(item.data ?? ''))
        else if (item.type === 'warning') lines.push(`Warning: ${(await this.conditionText(item.data)).trim()}`)
        else if (item.type === 'message') lines.push((await this.conditionText(item.data)).replace(/\n$/, ''))
      }
      return { output: lines.join('\n'), error: null }
    } catch (error) {
      return { output: '', error: { detail: error instanceof Error ? error.message : String(error) } }
    } finally {
      shelter.purge()
    }
  }

  runRCode = async (source) => {
    await this.capture(CLEAR_GLOBALS)
    return this.capture(source, { withAutoprint: true })
  }

  runRChallengeTests = async (code, setup, tests) => {
    const result = await this.capture(challengeWrapper(code, setup, tests))
    if (result.error) return { passed: false, tests: [], error: result.error, output: '' }
    return { ...parseChallengeOutput(result.output, tests), error: null }
  }
}
