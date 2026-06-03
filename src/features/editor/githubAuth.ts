const TOKEN_KEY = 'codequest:github:token'
const USER_KEY = 'codequest:github:user'
const PKCE_VERIFIER_KEY = 'codequest:github:pkce_verifier'
const AUTH_EVENT = 'codequest:github-auth-changed'

export interface GitHubUser {
  login: string
  id: number
  avatar_url: string
}

export interface GitHubAuthSession {
  accessToken: string
  user: GitHubUser
}

function readJson<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown): void {
  sessionStorage.setItem(key, JSON.stringify(value))
}

function notifyAuthChanged(): void {
  window.dispatchEvent(new Event(AUTH_EVENT))
}

export function subscribeGitHubAuth(listener: () => void): () => void {
  window.addEventListener(AUTH_EVENT, listener)
  return () => window.removeEventListener(AUTH_EVENT, listener)
}

export function getGitHubClientId(): string | null {
  const id = import.meta.env.VITE_GITHUB_CLIENT_ID
  return id && id.trim().length > 0 ? id.trim() : null
}

export function getGitHubRepo(): string | null {
  const repo = import.meta.env.VITE_GITHUB_REPO
  return repo && repo.trim().length > 0 ? repo.trim() : null
}

export function getGitHubContentBranch(): string {
  const branch = import.meta.env.VITE_GITHUB_CONTENT_BRANCH
  return branch && branch.trim().length > 0 ? branch.trim() : 'main'
}

export function getOAuthRedirectUri(): string {
  const base = import.meta.env.BASE_URL
  const normalized = base.endsWith('/') ? base : `${base}/`
  return `${window.location.origin}${normalized}auth/callback`
}

export function isGitHubAuthConfigured(): boolean {
  return Boolean(getGitHubClientId() && getGitHubRepo())
}

export function loadGitHubSession(): GitHubAuthSession | null {
  const accessToken = sessionStorage.getItem(TOKEN_KEY)
  const user = readJson<GitHubUser>(USER_KEY)
  if (!accessToken || !user) return null
  return { accessToken, user }
}

export function clearGitHubSession(): void {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USER_KEY)
  sessionStorage.removeItem(PKCE_VERIFIER_KEY)
  notifyAuthChanged()
}

function saveGitHubSession(session: GitHubAuthSession): void {
  sessionStorage.setItem(TOKEN_KEY, session.accessToken)
  writeJson(USER_KEY, session.user)
  notifyAuthChanged()
}

function randomString(length: number): string {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

async function sha256Base64Url(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const hash = await crypto.subtle.digest('SHA-256', data)
  const bytes = new Uint8Array(hash)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function beginGitHubLogin(): void {
  const clientId = getGitHubClientId()
  if (!clientId) throw new Error('GitHub OAuth is not configured (missing VITE_GITHUB_CLIENT_ID).')

  const verifier = randomString(32)
  sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier)

  void sha256Base64Url(verifier).then((challenge) => {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: getOAuthRedirectUri(),
      scope: 'repo',
      code_challenge: challenge,
      code_challenge_method: 'S256',
    })
    window.location.assign(`https://github.com/login/oauth/authorize?${params.toString()}`)
  })
}

async function fetchGitHubUser(accessToken: string): Promise<GitHubUser> {
  const res = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
    },
  })
  if (!res.ok) throw new Error(`GitHub user lookup failed (${res.status})`)
  return res.json() as Promise<GitHubUser>
}

async function verifyRepoWriteAccess(accessToken: string, repo: string): Promise<boolean> {
  const res = await fetch(`https://api.github.com/repos/${repo}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
    },
  })
  if (!res.ok) return false
  const data = (await res.json()) as { permissions?: { push?: boolean; admin?: boolean } }
  return Boolean(data.permissions?.push || data.permissions?.admin)
}

export async function completeGitHubOAuth(code: string): Promise<GitHubAuthSession> {
  const clientId = getGitHubClientId()
  const verifier = sessionStorage.getItem(PKCE_VERIFIER_KEY)
  if (!clientId) throw new Error('GitHub OAuth is not configured.')
  if (!verifier) throw new Error('Missing PKCE verifier — restart sign-in.')

  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      code,
      redirect_uri: getOAuthRedirectUri(),
      code_verifier: verifier,
    }),
  })

  if (!res.ok) throw new Error(`GitHub token exchange failed (${res.status})`)
  const payload = (await res.json()) as { access_token?: string; error?: string; error_description?: string }
  if (!payload.access_token) {
    throw new Error(payload.error_description ?? payload.error ?? 'GitHub did not return an access token.')
  }

  sessionStorage.removeItem(PKCE_VERIFIER_KEY)
  const user = await fetchGitHubUser(payload.access_token)
  const repo = getGitHubRepo()
  if (repo) {
    const canWrite = await verifyRepoWriteAccess(payload.access_token, repo)
    if (!canWrite) {
      throw new Error(`Signed in as @${user.login}, but you do not have write access to ${repo}.`)
    }
  }

  const session = { accessToken: payload.access_token, user }
  saveGitHubSession(session)
  return session
}

export function canEditContent(): boolean {
  if (!isGitHubAuthConfigured()) return import.meta.env.DEV
  return loadGitHubSession() !== null
}

export function getGitHubAccessToken(): string | null {
  return loadGitHubSession()?.accessToken ?? null
}

export function getGitHubUserLogin(): string | null {
  return loadGitHubSession()?.user.login ?? null
}
