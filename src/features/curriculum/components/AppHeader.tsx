import { ChevronLeft } from 'lucide-react'
import { EditorHeaderButton } from '../../editor'
import { RankIcon } from '../../ranks/RankIcon'
import type { RankDef } from '../../ranks/ranks'

/** The course being learned, shown after the app's name: its title, the learner's rank and XP. */
export interface HeaderCourse {
  title: string
  rank: RankDef
  xp: number
}

/**
 * The "Skip to content" link and the bar at the top: Back, the app name (with the course
 * being learned, the rank in it and its XP) and the editor button.
 */
export function AppHeader({
  showBack,
  onBack,
  isAdmin,
  course,
}: {
  showBack: boolean
  onBack: () => void
  isAdmin: boolean
  course?: HeaderCourse | null
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
        <div className={`cq-brand${course ? ' cq-brand--course' : ''}`}>
          <span className="cq-brand-name">CodeQuest</span>
          {course ? (
            <span className="cq-brand-course">
              <span className="cq-brand-sep cq-brand-sep--first" aria-hidden>
                ·
              </span>
              <span className="cq-brand-part">{course.title}</span>
              <span className="cq-brand-sep" aria-hidden>
                ·
              </span>
              <span className="cq-brand-part cq-brand-rank" title={`Your ${course.title} rank`}>
                <RankIcon rank={course.rank.id} size={15} />
                {course.rank.title}
              </span>
              <span className="cq-brand-sep" aria-hidden>
                ·
              </span>
              <span className="cq-brand-part cq-brand-xp">{course.xp.toLocaleString('en-US')} XP</span>
            </span>
          ) : null}
          {isAdmin ? <span className="cq-admin-badge">Admin</span> : null}
        </div>
        <EditorHeaderButton />
      </header>
    </>
  )
}
