import { Check, Download, LogIn, LogOut, Pencil, Upload, X } from 'lucide-react'
import { useState } from 'react'
import {
  beginGitHubLogin,
  clearGitHubSession,
  getGitHubUserLogin,
  isGitHubAuthConfigured,
} from './githubAuth'
import { useEditorExport, useEditorGitHub, useEditorMode } from './editorHooks'

interface EditorToolbarProps {
  languageId?: string | null
  sectionId?: string | null
}

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

export function EditorToolbar({ languageId, sectionId }: EditorToolbarProps) {
  const { isEditMode, contentSource } = useEditorMode()
  const { exportRootIndex, exportLanguageIndex, exportSection } = useEditorExport()
  const { saveToGitHub } = useEditorGitHub()
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  if (!isEditMode) return null

  const isGithubPreview = contentSource === 'github'
  const githubConfigured = isGitHubAuthConfigured()
  const userLogin = getGitHubUserLogin()

  const handleSaveToGitHub = async () => {
    setSaving(true)
    setSaveStatus(null)
    try {
      await saveToGitHub((label, index, total) => {
        setSaveStatus(`Saving ${label} (${index}/${total})…`)
      })
      setSaveStatus('Saved to GitHub.')
    } catch (e: unknown) {
      setSaveStatus(e instanceof Error ? e.message : 'Save to GitHub failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="cq-edit-banner" role="status">
      <span className="cq-edit-banner-label">
        Edit mode
        {isGithubPreview ? ' · GitHub preview (read-only)' : ' · Local drafts'}
        {userLogin ? ` · @${userLogin}` : ''}
      </span>
      <div className="cq-edit-banner-actions">
        {githubConfigured && !userLogin && (
          <button type="button" className="cq-btn cq-btn--sm" onClick={() => beginGitHubLogin()}>
            <LogIn size={14} />
            Sign in
          </button>
        )}
        {githubConfigured && userLogin && (
          <button type="button" className="cq-btn cq-btn--sm" onClick={() => clearGitHubSession()}>
            <LogOut size={14} />
            Sign out
          </button>
        )}
        {!isGithubPreview && (
          <>
            <button type="button" className="cq-btn cq-btn--sm" onClick={exportRootIndex}>
              <Download size={14} />
              index.json
            </button>
            {languageId && (
              <button
                type="button"
                className="cq-btn cq-btn--sm"
                onClick={() => exportLanguageIndex(languageId)}
              >
                <Download size={14} />
                {languageId}/index.json
              </button>
            )}
            {languageId && sectionId && (
              <button
                type="button"
                className="cq-btn cq-btn--sm"
                onClick={() => exportSection(languageId, sectionId)}
              >
                <Download size={14} />
                section JSON
              </button>
            )}
            {githubConfigured && userLogin && (
              <button
                type="button"
                className="cq-btn cq-btn--sm cq-btn--primary"
                disabled={saving}
                onClick={() => void handleSaveToGitHub()}
              >
                <Upload size={14} />
                Save to GitHub
              </button>
            )}
          </>
        )}
      </div>
      {saveStatus ? <span className="cq-edit-banner-status">{saveStatus}</span> : null}
    </div>
  )
}
