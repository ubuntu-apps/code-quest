// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { CACHE, LAST, parseArgs, plan, readOutputs } from './deploy-aws.mjs'

describe('deploy to AWS', () => {
  it('reads options', () => {
    expect(parseArgs(['--dry-run'])).toEqual({ dryRun: true, skipBuild: false, prune: false, help: false })
    expect(() => parseArgs(['--nope'])).toThrow('Unknown option --nope')
  })

  it('reads the stack outputs', () => {
    expect(readOutputs({ Stacks: [{ Outputs: [{ OutputKey: 'DistributionId', OutputValue: 'D1' }] }] })).toEqual({ DistributionId: 'D1' })
    expect(readOutputs({})).toEqual({})
  })

  it('caches hashed files for a year and lessons not at all, and sends index.html last', () => {
    const steps = plan({ bucket: 'site', distributionId: 'D1', dryRun: false, prune: false, distDir: '/d' })
    expect(steps[0]).toEqual(['s3', 'sync', '/d/assets', 's3://site/assets', '--cache-control', CACHE.hashed])
    const everythingElse = steps[2]
    expect(everythingElse).toContain(CACHE.fresh)
    expect(everythingElse.join(' ')).toContain('--exclude assets/*')
    const copies = steps.filter((s) => s[1] === 'cp').map((s) => s[3])
    expect(copies).toEqual(LAST.map((f) => `s3://site/${f}`))
    expect(copies.at(-1)).toBe('s3://site/index.html')
    expect(steps.at(-1)?.[0]).toBe('cloudfront')
  })

  it('changes nothing on a dry run', () => {
    const steps = plan({ bucket: 'site', distributionId: 'D1', dryRun: true, prune: true, distDir: '/d' })
    expect(steps.every((s) => s[0] === 's3' && s.includes('--dryrun'))).toBe(true)
  })
})
