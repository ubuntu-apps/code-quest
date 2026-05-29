import type { FC } from 'react'
import type { LucideIcon } from 'lucide-react'

export interface BottomNavItem {
  id: string
  label: string
  icon: LucideIcon
}

export interface BottomNavProps {
  items: BottomNavItem[]
  activeId: string
  onSelect: (id: string) => void
}

export const BottomNav: FC<BottomNavProps> = ({ items, activeId, onSelect }) => {
  return (
    <nav className="cq-bottom-nav" aria-label="Main">
      {items.map((item) => {
        const Icon = item.icon
        const active = item.id === activeId
        return (
          <button
            key={item.id}
            type="button"
            className={`cq-nav-btn${active ? ' cq-nav-btn--active' : ''}`}
            onClick={() => onSelect(item.id)}
            aria-current={active ? 'page' : undefined}
          >
            <Icon size={22} strokeWidth={2} aria-hidden />
            <span className="cq-nav-label">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
