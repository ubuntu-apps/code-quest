import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { completeGitHubOAuth } from './githubAuth'
import { learnHomePath } from '../curriculum/learnPaths'

export function GitHubAuthCallback() {
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const oauthError = params.get('error_description') ?? params.get('error')

    if (oauthError) {
      setError(oauthError)
      return
    }
    if (!code) {
      setError('Missing authorization code from GitHub.')
      return
    }

    void completeGitHubOAuth(code)
      .then(() => setDone(true))
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'GitHub sign-in failed.')
      })
  }, [])

  if (done) return <Navigate to={learnHomePath()} replace />

  if (error) {
    return (
      <div className="cq-panel cq-error" style={{ margin: '2rem auto', maxWidth: 480 }}>
        GitHub sign-in failed: {error}
      </div>
    )
  }

  return <div className="cq-panel cq-muted" style={{ margin: '2rem auto', maxWidth: 480 }}>Signing in…</div>
}
