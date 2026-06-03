import type { ContentSource } from '../../editor/curriculumDraftStorage'
import { isGitHubAuthConfigured } from '../../editor/githubAuth'

interface ContentSourceToggleProps {
  contentSource: ContentSource
  onChange: (source: ContentSource) => void
  onImportFromGitHub?: () => void
}

export function ContentSourceToggle({
  contentSource,
  onChange,
  onImportFromGitHub,
}: ContentSourceToggleProps) {
  const canImport = isGitHubAuthConfigured() || import.meta.env.DEV

  return (
    <div className="cq-content-source">
      <span className="cq-content-source-label">Content source</span>
      <div className="cq-content-source-toggle" role="group" aria-label="Content source">
        <button
          type="button"
          className={`cq-content-source-btn${contentSource === 'local' ? ' cq-content-source-btn--active' : ''}`}
          aria-pressed={contentSource === 'local'}
          onClick={() => onChange('local')}
        >
          Local
        </button>
        <button
          type="button"
          className={`cq-content-source-btn${contentSource === 'github' ? ' cq-content-source-btn--active' : ''}`}
          aria-pressed={contentSource === 'github'}
          onClick={() => onChange('github')}
        >
          GitHub
        </button>
      </div>
      {contentSource === 'github' ? (
        <>
          <p className="cq-content-source-hint">
            Read-only preview of <code>public/content/</code>. Switch to Local to edit drafts.
          </p>
          {onImportFromGitHub && canImport && (
            <button type="button" className="cq-btn cq-btn--sm" onClick={onImportFromGitHub}>
              Copy GitHub → Local
            </button>
          )}
        </>
      ) : (
        <p className="cq-content-source-hint">Editing local drafts stored in this browser.</p>
      )}
    </div>
  )
}
