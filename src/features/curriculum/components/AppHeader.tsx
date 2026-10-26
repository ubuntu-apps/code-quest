import { ChevronLeft } from 'lucide-react'
import { EditorHeaderButton } from '../../editor'

/** The "Skip to content" link and the bar at the top: Back, the app name and the editor button. */
export function AppHeader({
  showBack,
  onBack,
  isAdmin,
}: {
  showBack: boolean
  onBack: () => void
  isAdmin: boolean
}) {
  return (
    <>
      <a
        href="#cq-main"
        className="cq-skip-link"
        onClick={(e) => {
          // Move focus without adding #cq-main to the address.
          e.preventDefault()
          document.getElementById('cq-main')?.focus()
        }}
      >
        Skip to content
      </a>
      <header className="cq-header">
        {showBack ? (
          <button type="button" className="cq-back" onClick={onBack} aria-label="Back">
            <ChevronLeft size={22} />
          </button>
        ) : (
          <span className="cq-header-spacer" aria-hidden />
        )}
        <div className="cq-brand">
          CodeQuest
          {isAdmin ? <span className="cq-admin-badge">Admin</span> : null}
        </div>
        <EditorHeaderButton />
      </header>
    </>
  )
}
