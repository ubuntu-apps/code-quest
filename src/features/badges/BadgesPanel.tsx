import { Award, Flame, Flag, Layers, Zap, type LucideIcon } from 'lucide-react'
import type { BadgeDef, BadgeKind, EarnedBadge } from './badges'

const ICONS: Record<BadgeKind, LucideIcon> = {
  start: Flag,
  section: Layers,
  course: Award,
  streak: Flame,
  xp: Zap,
}

function BadgeTile({
  kind,
  title,
  detail,
  locked = false,
}: {
  kind: BadgeKind
  title: string
  detail: string
  locked?: boolean
}) {
  const Icon = ICONS[kind]
  return (
    <li className={`cq-badge-tile cq-badge-tile--${kind}${locked ? ' cq-badge-tile--locked' : ''}`}>
      <span className="cq-badge-icon" aria-hidden>
        <Icon size={20} />
      </span>
      <span className="cq-badge-text">
        <span className="cq-badge-title">{title}</span>
        <span className="cq-badge-detail">{detail}</span>
      </span>
    </li>
  )
}

function earnedOn(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime())
    ? 'Earned'
    : `Earned ${date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}`
}

/** Home page: badges earned so far, and the ones still to earn (folded away). */
export function BadgesPanel({ earned, toEarn }: { earned: EarnedBadge[]; toEarn: BadgeDef[] }) {
  if (earned.length === 0 && toEarn.length === 0) return null
  const total = earned.length + toEarn.length

  return (
    <section className="cq-panel cq-badges" aria-labelledby="cq-badges-title">
      <h2 className="cq-subtitle" id="cq-badges-title">
        Badges <span className="cq-badges-count">{earned.length} of {total}</span>
      </h2>
      {earned.length > 0 ? (
        <ul className="cq-badge-grid">
          {earned.map((badge) => (
            <BadgeTile key={badge.id} kind={badge.kind} title={badge.title} detail={earnedOn(badge.on)} />
          ))}
        </ul>
      ) : (
        <p className="cq-muted cq-badges-empty">
          Pass a quiz, finish a section or learn a few days in a row to earn your first badge.
        </p>
      )}
      {toEarn.length > 0 ? (
        <details className="cq-badges-more">
          <summary>Badges to earn ({toEarn.length})</summary>
          <ul className="cq-badge-grid">
            {toEarn.map((badge) => (
              <BadgeTile key={badge.id} kind={badge.kind} title={badge.title} detail={badge.description} locked />
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  )
}
