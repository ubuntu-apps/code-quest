import { useRef } from 'react'
import { Sheet } from '../../../components/Sheet'
import { ExternalLink, X } from 'lucide-react'

interface ReadMoreModalProps {
  levelTitle: string
  url: string
  source: string
  onClose: () => void
}

/** Full-screen dialog that shows a level's "Read more" article in an iframe. */
export function ReadMoreModal({ levelTitle, url, source, onClose }: ReadMoreModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  return (
    <Sheet className="cq-modal" label={`${levelTitle} read more`} initialFocus={closeRef} onClose={onClose}>
      <div className="cq-modal-header">
        <div className="cq-modal-title">Read more</div>
        <button ref={closeRef} type="button" className="cq-icon-btn" aria-label="Close article" onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      <div className="cq-modal-credit">
        Source: {source}
        {' · '}
        <a href={url} target="_blank" rel="noreferrer">
          Open original <ExternalLink size={14} />
        </a>
      </div>
      <iframe
        className="cq-modal-frame"
        title={`${levelTitle} reference`}
        src={url}
        // The embedded page can run its scripts and open links, but can't take over the app.
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        referrerPolicy="no-referrer"
      />
      <p className="cq-muted cq-modal-note">
        Some sites don't allow being shown inside other apps. If the page stays blank, use Open original.
      </p>
      <div className="cq-modal-actions">
        <button type="button" className="cq-btn" onClick={onClose}>
          Close and return
        </button>
      </div>
    </Sheet>
  )
}
