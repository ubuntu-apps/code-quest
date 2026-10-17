import { Check, LogIn, Pencil, X } from 'lucide-react'
import { useState } from 'react'
import {
  beginGitHubLogin,
  getGitHubUserLogin,
  isGitHubAuthConfigured,
} from './githubAuth'
import { useEditorMode } from './editorHooks'

export function EditorHeaderButton() {
  const { canEdit, isEditMode, beginEditSession, commitEditSession, discardEditSession } =
    useEditorMode()
  const [commitStatus, setCommitStatus] = useState<string | null>(null)
  const [committing, setCommitting] = useState(false)
  const githubConfigured = isGitHubAuthConfigured()
  const signedIn = Boolean(getGitHubUserLogin())

  const handleCommit = () => {
    setCommitStatus(null)
    setCommitting(true)
    void commitEditSession()
      .then(() => {
        setCommitStatus('Saved to public/content/.')
        window.setTimeout(() => setCommitStatus(null), 3000)
      })
      .catch((e: unknown) => {
        setCommitStatus(e instanceof Error ? e.message : 'Save failed.')
      })
      .finally(() => setCommitting(false))
  }

  if (!canEdit && githubConfigured && !signedIn) {
    return (
      <button
        type="button"
        className="cq-edit-toggle"
        onClick={() => beginGitHubLogin()}
        aria-label="Sign in with GitHub to edit"
      >
        <LogIn size={20} />
      </button>
    )
  }

  if (!canEdit) return <span className="cq-header-spacer" aria-hidden />

  if (isEditMode) {
    return (
      <div className="cq-edit-header-actions" title={commitStatus ?? undefined}>
        <button
          type="button"
          className="cq-edit-toggle cq-edit-toggle--save"
          disabled={committing}
          onClick={handleCommit}
          aria-label="Save edits to public/content and local drafts"
        >
          <Check size={20} />
        </button>
        <button
          type="button"
          className="cq-edit-toggle cq-edit-toggle--discard"
          disabled={committing}
          onClick={() => void discardEditSession()}
          aria-label="Discard edits"
        >
          <X size={20} />
        </button>
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        className="cq-edit-toggle"
        onClick={beginEditSession}
        aria-label="Enter edit mode"
      >
        <Pencil size={20} />
      </button>
      {commitStatus ? (
        <span className="cq-edit-commit-status" role="status">
          {commitStatus}
        </span>
      ) : null}
    </>
  )
}

