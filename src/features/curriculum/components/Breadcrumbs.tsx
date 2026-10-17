import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export interface Crumb {
  label: string
  to: string
}

/**
 * The pages above this one, as links: "Home › Python › Fundamentals". The current page
 * isn't repeated here; it's the heading just below.
 */
export function Breadcrumbs({ items, onNavigate }: { items: Crumb[]; onNavigate?: () => void }) {
  if (items.length === 0) return null
  return (
    <nav className="cq-breadcrumbs" aria-label="Breadcrumb">
      <ol className="cq-breadcrumbs-list">
        {items.map((item, i) => (
          <Fragment key={`${i}-${item.label}`}>
            {i > 0 ? (
              <li className="cq-breadcrumbs-sep" aria-hidden>
                <ChevronRight size={14} />
              </li>
            ) : null}
            <li className="cq-breadcrumbs-item">
              <Link className="cq-breadcrumbs-link" to={item.to} onClick={onNavigate}>
                {item.label}
              </Link>
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  )
}
