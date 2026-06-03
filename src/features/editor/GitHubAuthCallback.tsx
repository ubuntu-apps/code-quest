import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { completeGitHubOAuth } from './githubAuth'
import { learnHomePath } from '../curriculum/learnPaths'

function readOAuthCallbackState(): {
  code: string | null
  oauthError: string | null
  missingCode: boolean
} {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  const oauthError = params.get('error_description') ?? params.get('error')
  return {
    code,
    oauthError,
    missingCode: !oauthError && !code,
  }
}

export function GitHubAuthCallback() {
  const [{ code, oauthError, missingCode }] = useState(readOAuthCallbackState)
  const [done, setDone] = useState(false)
  const [asyncError, setAsyncError] = useState<string | null>(null)

  useEffect(() => {
    if (oauthError || !code) return
    void completeGitHubOAuth(code)
      .then(() => setDone(true))
      .catch((e: unknown) => {
        setAsyncError(e instanceof Error ? e.message : 'GitHub sign-in failed.')
      })
  }, [code, oauthError])

  if (done) return <Navigate to={learnHomePath()} replace />

  const error =
    oauthError ?? asyncError ?? (missingCode ? 'Missing authorization code from GitHub.' : null)

  if (error) {
    return (
      <div className="cq-panel cq-error" style={{ margin: '2rem auto', maxWidth: 480 }}>
        GitHub sign-in failed: {error}
      </div>
    )
  }

  return <div className="cq-panel cq-muted" style={{ margin: '2rem auto', maxWidth: 480 }}>Signing in…</div>
}
