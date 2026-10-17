import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export interface Crumb {
  label: string
  /** Where the crumb leads. The last crumb is the current page and has none. */
  to?: string
}

/** "Home › Python › Fundamentals › Variables": every crumb but the last is a link. */
export function Breadcrumbs({ items, onNavigate }: { items: Crumb[]; onNavigate?: () => void }) {
  if (items.length < 2) return null
  return (
    <nav className="cq-breadcrumbs" aria-label="Breadcrumb">
      <ol className="cq-breadcrumbs-list">
        {items.map((item, i) => {
          const last = i === items.length - 1
          return (
            <Fragment key={`${i}-${item.label}`}>
              <li className="cq-breadcrumbs-item">
                {last || !item.to ? (
                  <span className="cq-breadcrumbs-current" aria-current={last ? 'page' : undefined}>
                    {item.label}
                  </span>
                ) : (
                  <Link className="cq-breadcrumbs-link" to={item.to} onClick={onNavigate}>
                    {item.label}
                  </Link>
                )}
              </li>
              {!last ? (
                <li className="cq-breadcrumbs-sep" aria-hidden>
                  <ChevronRight size={14} />
                </li>
              ) : null}
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
