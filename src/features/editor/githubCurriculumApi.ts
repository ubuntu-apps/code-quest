import type { LanguageBundle, RootIndex } from '../curriculum/types'
import {
  getGitHubAccessToken,
  getGitHubContentBranch,
  getGitHubRepo,
} from './githubAuth'

interface GitHubContentFile {
  sha: string
  content: string
}

function repoContentPath(repoPath: string): string {
  return `public/content/${repoPath}`.replace(/\/+/g, '/')
}

async function githubFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getGitHubAccessToken()
  if (!token) throw new Error('Sign in with GitHub to save content.')

  const repo = getGitHubRepo()
  if (!repo) throw new Error('GitHub repo is not configured (missing VITE_GITHUB_REPO).')

  const url = `https://api.github.com/repos/${repo}/contents/${path}?ref=${encodeURIComponent(getGitHubContentBranch())}`
  return fetch(url, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  })
}

async function getFileSha(repoPath: string): Promise<string | null> {
  const res = await githubFetch(repoContentPath(repoPath))
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Failed to read ${repoPath} from GitHub (${res.status})`)
  const data = (await res.json()) as GitHubContentFile
  return data.sha
}

function encodeContent(json: unknown): string {
  const text = JSON.stringify(json, null, 2) + '\n'
  return btoa(unescape(encodeURIComponent(text)))
}

export async function putGitHubJsonFile(
  repoPath: string,
  json: unknown,
  message: string,
): Promise<void> {
  const sha = await getFileSha(repoPath)
  const res = await githubFetch(repoContentPath(repoPath), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      content: encodeContent(json),
      branch: getGitHubContentBranch(),
      ...(sha ? { sha } : {}),
    }),
  })
  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as { message?: string } | null
    throw new Error(err?.message ?? `Failed to save ${repoPath} (${res.status})`)
  }
}

export interface GitHubSavePlan {
  repoPath: string
  json: unknown
  label: string
}

export function buildCurriculumSavePlan(
  rootIndex: RootIndex,
  bundles: Record<string, LanguageBundle>,
): GitHubSavePlan[] {
  const plan: GitHubSavePlan[] = [
    { repoPath: 'index.json', json: rootIndex, label: 'index.json' },
  ]

  for (const [langId, bundle] of Object.entries(bundles)) {
    plan.push({
      repoPath: `${langId}/index.json`,
      json: bundle.index,
      label: `${langId}/index.json`,
    })
    for (const section of bundle.sections) {
      const filename = section.sectionRef.path.split('/').pop() ?? `${section.sectionRef.id}.json`
      plan.push({
        repoPath: `${langId}/${filename}`,
        json: section.file,
        label: `${langId}/${filename}`,
      })
    }
  }

  return plan
}

export async function saveCurriculumToGitHub(
  rootIndex: RootIndex,
  bundles: Record<string, LanguageBundle>,
  onProgress?: (label: string, index: number, total: number) => void,
): Promise<void> {
  const plan = buildCurriculumSavePlan(rootIndex, bundles)
  for (let i = 0; i < plan.length; i += 1) {
    const item = plan[i]
    onProgress?.(item.label, i + 1, plan.length)
    await putGitHubJsonFile(item.repoPath, item.json, `Update ${item.label} via CodeQuest editor`)
  }
}
