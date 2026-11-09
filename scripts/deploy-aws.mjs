#!/usr/bin/env node
/**
 * Builds CodeQuest and puts it on the site the "CodeQuest" AWS stack created
 * (codequest.appfront.cc):
 *
 *   npm run deploy                      # build, upload, refresh CloudFront
 *   npm run deploy -- --dry-run         # shows what would change, uploads nothing
 *   npm run deploy -- --skip-build      # upload the dist/ that is already there
 *   npm run deploy -- --prune           # also remove files the new build no longer has
 *
 * Needs the AWS CLI signed in to the account (aws login, or AWS_PROFILE).
 *
 * Caching: files under assets/ have a hash in their name, so they're cached for a year;
 * images for a day; everything else (index.html, sw.js, the manifest, lessons in content/,
 * the Python worker) is "no-cache", so every visit checks for a new version. index.html and
 * sw.js go last, so they never point at files that aren't there yet.
 */
import { execFileSync, execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const STACK = 'CodeQuest'

export const CACHE = {
  hashed: 'public, max-age=31536000, immutable',
  image: 'public, max-age=86400',
  fresh: 'no-cache',
}
export const IMAGES = ['*.png', '*.svg', '*.ico', '*.jpg', '*.webp']
/** Uploaded last: the files that switch browsers to the new version. */
export const LAST = ['sw.js', 'index.html']

export function parseArgs(argv) {
  const args = { dryRun: false, skipBuild: false, prune: false, help: false }
  for (const a of argv) {
    if (a === '--dry-run') args.dryRun = true
    else if (a === '--skip-build') args.skipBuild = true
    else if (a === '--prune') args.prune = true
    else if (a === '--help' || a === '-h') args.help = true
    else throw new Error(`Unknown option ${a}. Try --help.`)
  }
  return args
}

/** The stack's outputs as { SiteBucketName: ..., ... }, from `aws cloudformation describe-stacks`. */
export function readOutputs(json) {
  const found = json?.Stacks?.[0]?.Outputs ?? []
  return Object.fromEntries(found.map((o) => [o.OutputKey, o.OutputValue]))
}

/** The AWS CLI calls that upload dist/ to the bucket and refresh CloudFront, in order. */
export function plan({ bucket, distributionId, dryRun, prune, distDir = dist }) {
  const s3 = `s3://${bucket}`
  const dry = dryRun ? ['--dryrun'] : []
  const del = prune ? ['--delete'] : []
  const ex = (patterns) => patterns.flatMap((p) => ['--exclude', p])
  const inc = (patterns) => patterns.flatMap((p) => ['--include', p])
  const steps = [
    // 1. New hashed files first.
    ['s3', 'sync', path.join(distDir, 'assets'), `${s3}/assets`, '--cache-control', CACHE.hashed, ...del, ...dry],
    // 2. Images outside assets/.
    ['s3', 'sync', distDir, s3, '--exclude', '*', ...inc(IMAGES), '--exclude', 'assets/*', '--cache-control', CACHE.image, ...dry],
    // 3. Everything else: lessons, the manifest, the Python worker…
    ['s3', 'sync', distDir, s3, '--exclude', 'assets/*', ...ex(IMAGES), ...ex(LAST), '--cache-control', CACHE.fresh, ...del, ...dry],
    // 4. Last, the files that switch browsers to the new version.
    ...LAST.map((f) => ['s3', 'cp', path.join(distDir, f), `${s3}/${f}`, '--cache-control', CACHE.fresh, ...dry]),
  ]
  if (!dryRun) steps.push(['cloudfront', 'create-invalidation', '--distribution-id', distributionId, '--paths', '/*', '--query', 'Invalidation.Id', '--output', 'text'])
  return steps
}

function aws(args, { capture = false } = {}) {
  try {
    return execFileSync('aws', args, { encoding: 'utf8', stdio: capture ? ['ignore', 'pipe', 'inherit'] : 'inherit' })
  } catch (e) {
    if (e.code === 'ENOENT') throw new Error('The AWS CLI (aws) is not installed or not on the PATH. See https://aws.amazon.com/cli/')
    throw new Error(`aws ${args.slice(0, 2).join(' ')} failed. Are you signed in (aws login)?`)
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('*/')[0].replace(/^#!.*\n\/\*\*?/, '').replace(/^ \* ?/gm, ''))
    return
  }

  const out = readOutputs(
    JSON.parse(aws(['cloudformation', 'describe-stacks', '--stack-name', STACK, '--region', 'us-east-1', '--output', 'json'], { capture: true })),
  )
  for (const key of ['SiteBucketName', 'DistributionId', 'SiteUrl']) {
    if (!out[key]) throw new Error(`The stack's outputs have no ${key}. Deploy the stack first (see infra/README.md).`)
  }

  if (!args.skipBuild) execSync('npm run build', { cwd: root, stdio: 'inherit' })
  for (const f of LAST) {
    if (!fs.existsSync(path.join(dist, f))) throw new Error(`dist/${f} is missing. Build first, or leave out --skip-build.`)
  }

  console.log(`${args.dryRun ? 'Would upload' : 'Uploading'} to ${out.SiteBucketName}…`)
  for (const step of plan({ bucket: out.SiteBucketName, distributionId: out.DistributionId, dryRun: args.dryRun, prune: args.prune })) {
    const result = aws(step, { capture: step[0] === 'cloudfront' })
    if (step[0] === 'cloudfront') console.log(`Refreshing CloudFront (invalidation ${result.trim()}); it takes a minute or two.`)
  }
  console.log(args.dryRun ? 'Dry run: nothing was uploaded.' : `Done: ${out.SiteUrl}`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main()
  } catch (e) {
    console.error(`deploy: ${e instanceof Error ? e.message : e}`)
    process.exit(1)
  }
}
