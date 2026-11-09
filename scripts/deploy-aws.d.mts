export const CACHE: { hashed: string; image: string; fresh: string }
export const IMAGES: string[]
export const LAST: string[]
export function parseArgs(argv: string[]): { dryRun: boolean; skipBuild: boolean; prune: boolean; help: boolean }
export function readOutputs(json: unknown): Record<string, string>
export function plan(options: { bucket: string; distributionId: string; dryRun: boolean; prune: boolean; distDir?: string }): string[][]
