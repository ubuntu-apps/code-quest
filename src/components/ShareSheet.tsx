import type { FC } from 'react'
import { Mail, MessageSquare, X } from 'lucide-react'
import type { ShareVariant } from '../lib/shareApp'

export interface ShareSheetProps {
  onSelect: (variant: ShareVariant) => void
  onClose: () => void
}

export const ShareSheet: FC<ShareSheetProps> = ({ onSelect, onClose }) => {
  return (
    <div
      className="cq-modal-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="cq-share-sheet" role="dialog" aria-modal="true" aria-labelledby="cq-share-sheet-title">
        <div className="cq-share-sheet-header">
          <h2 id="cq-share-sheet-title" className="cq-share-sheet-title">
            Share CodeQuest
          </h2>
          <button type="button" className="cq-icon-btn" aria-label="Close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <p className="cq-muted cq-share-sheet-lead">Choose how you want to share the install link.</p>
        <div className="cq-share-sheet-actions">
          <button type="button" className="cq-share-sheet-btn" onClick={() => onSelect('text')}>
            <MessageSquare size={22} aria-hidden />
            <span>
              <strong>Text message</strong>
              <span className="cq-muted">Short summary with install link</span>
            </span>
          </button>
          <button type="button" className="cq-share-sheet-btn" onClick={() => onSelect('full')}>
            <Mail size={22} aria-hidden />
            <span>
              <strong>Email or other</strong>
              <span className="cq-muted">Full install steps for every platform</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
