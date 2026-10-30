import { Award, Flame, Flag, Layers, Zap, type LucideIcon } from 'lucide-react'
import type { BadgeDef, BadgeKind, EarnedBadge } from './badges'
import { RankIcon } from '../ranks/RankIcon'
import { rankFromBadgeId } from '../ranks/ranks'

const ICONS: Record<Exclude<BadgeKind, 'rank'>, LucideIcon> = {
  start: Flag,
  section: Layers,
  course: Award,
  streak: Flame,
  xp: Zap,
}

function BadgeIcon({ kind, id }: { kind: BadgeKind; id: string }) {
  if (kind === 'rank') {
    const rank = rankFromBadgeId(id)
    return rank ? <RankIcon rank={rank.id} size={20} /> : <Award size={20} />
  }
  const Icon = ICONS[kind]
  return <Icon size={20} />
}

function BadgeTile({
  id,
  kind,
  title,
  detail,
  locked = false,
}: {
  id: string
  kind: BadgeKind
  title: string
  detail: string
  locked?: boolean
}) {
  return (
    <li className={`cq-badge-tile cq-badge-tile--${kind}${locked ? ' cq-badge-tile--locked' : ''}`}>
      <span className="cq-badge-icon" aria-hidden>
        <BadgeIcon kind={kind} id={id} />
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
            <BadgeTile key={badge.id} id={badge.id} kind={badge.kind} title={badge.title} detail={earnedOn(badge.on)} />
          ))}
        </ul>
      ) : (
        <p className="cq-muted cq-badges-empty">
          Clear a gate, finish a quest or learn a few days in a row to earn your first badge.
        </p>
      )}
      {toEarn.length > 0 ? (
        <details className="cq-badges-more">
          <summary>Badges to earn ({toEarn.length})</summary>
          <ul className="cq-badge-grid">
            {toEarn.map((badge) => (
              <BadgeTile key={badge.id} id={badge.id} kind={badge.kind} title={badge.title} detail={badge.description} locked />
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  )
}
