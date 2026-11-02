import type { ReactNode } from 'react'

/** Where the learner is with a lesson or section; each has its own colour. */
export type ProgressStatus = 'not-started' | 'in-progress' | 'challenges-done' | 'passed'

/** A coloured label such as "In progress", with optional details after it. */
export function StatusMeta({ status, label, details }: { status: ProgressStatus; label: string; details?: string }) {
  return (
    <span className="cq-card-meta">
      <span className={`cq-status cq-status--${status}`}>{label}</span>
      {details ? <span className="cq-status-details"> · {details}</span> : null}
    </span>
  )
}

interface CatalogListItemProps {
  title: string
  onClick: () => void
  meta?: ReactNode
  progressPercent?: number
  /** Small line above the title, e.g. "Stage 3 of 14". */
  eyebrow?: ReactNode
  /** A picture for where the learner is (a door, a key, a map…), shown in a round badge on the right. */
  icon?: ReactNode
  /** Colours the card's edge to match its status label. */
  status?: ProgressStatus
  locked?: boolean
  disabled?: boolean
}

export function CatalogListItem({
  title,
  onClick,
  meta,
  progressPercent,
  eyebrow,
  icon,
  status,
  locked = false,
  disabled = false,
}: CatalogListItemProps) {
  return (
    <li className="cq-card-list-item">
      <div className="cq-card-row">
        <button
          type="button"
          className={`cq-card-btn${icon ? ' cq-card-btn--with-icon' : ''}${locked ? ' cq-card-btn--locked' : ''}${status && !locked ? ` cq-card-btn--${status}` : ''}`}
          disabled={disabled}
          onClick={onClick}
        >
          <span className="cq-card-body">
          {eyebrow ? <span className="cq-card-eyebrow">{eyebrow}</span> : null}
          <span className="cq-card-title">{title}</span>
          {meta ?? null}
          {progressPercent !== undefined && (
            // Decorative: the card's text already says how many levels are complete, and a
            // progress bar inside a button isn't read out anyway.
            <div className="cq-progress-bar" aria-hidden="true">
              <div className="cq-progress-bar-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          )}
          </span>
          {icon ? (
            <span className="cq-card-icon" aria-hidden="true">
              {icon}
            </span>
          ) : null}
        </button>
      </div>
    </li>
  )
}
