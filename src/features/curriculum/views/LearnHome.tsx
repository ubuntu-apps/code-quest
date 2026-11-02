import { useState, type ReactNode } from 'react'
import { BellRing, ChevronRight, Compass, Flame, Lock, Snowflake, Zap } from 'lucide-react'
import type { RootIndex } from '../content/types'
import { HOME_LEAD } from '../appText'
import { CatalogListItem } from '../components/CatalogListItem'
import { FREEZE_EVERY_DAYS, type StreakStatus } from '../progress/streak'
import { ReminderSheet } from '../../reminders/ReminderSheet'

export interface ContinueTarget {
  languageId: string
  languagePath: string
  sectionId: string
  levelId: string
}

interface LearnHomeProps {
  displayRootIndex: RootIndex
  continueTarget: ContinueTarget | null
  /** The learner has earned XP before, so the button continues rather than starts. */
  hasStarted: boolean
  xpLevel: number
  xpCurrentLevel: number
  totalXp: number
  streak: StreakStatus
  /** The daily review, shown under the XP and streak. */
  review?: ReactNode
  /** The badges panel, shown under the XP and streak. */
  badges?: ReactNode
  /** The app's address, for the reminder's link. */
  appUrl: string
  /** Admin mode can open courses marked "coming soon". */
  canOpenComingSoon: boolean
  onContinue: () => void
  onOpenLanguage: (path: string, id: string) => void
  /** The course Home shows progress for (null: none picked yet). */
  activeCourseId?: string | null
  /** Makes another course the one Home shows, without leaving Home. */
  onSelectCourse?: (id: string) => void
}

export function LearnHome({
  displayRootIndex,
  continueTarget,
  hasStarted,
  xpLevel,
  xpCurrentLevel,
  totalXp,
  streak,
  review,
  badges,
  appUrl,
  canOpenComingSoon,
  onContinue,
  onOpenLanguage,
  activeCourseId = null,
  onSelectCourse,
}: LearnHomeProps) {
  const [reminderOpen, setReminderOpen] = useState(false)
  const streakCount = streak.count
  const nextFreezeAt = (Math.floor(streakCount / FREEZE_EVERY_DAYS) + 1) * FREEZE_EVERY_DAYS
  const streakHint =
    streakCount === 0
      ? 'Solve a challenge, clear a gate or do the daily review each day to keep your streak.'
      : streak.atRisk && streak.coveredByFreeze > 0
        ? `A streak freeze covers the day you missed. Do a challenge, gate or review today to keep your streak.`
        : streak.atRisk
          ? 'Do a challenge, gate or review today to keep it going.'
          : 'Done for today. See you tomorrow!'

  // The course Home shows progress for. Picked: a switcher next to the title. Not picked
  // yet (a new learner): the full course cards, first thing on the page.
  const activeCourse = activeCourseId
    ? (displayRootIndex.languages.find((lang) => lang.id === activeCourseId) ?? null)
    : null
  const courseList = (
    <>
      <p className="cq-lead">{HOME_LEAD}</p>
      <ul className="cq-card-list">
        {displayRootIndex.languages.map((lang) => (
          <CatalogListItem
            key={lang.id}
            title={lang.title}
            onClick={() => onOpenLanguage(lang.path, lang.id)}
            meta={lang.comingSoon ? <span className="cq-card-meta">Coming soon</span> : undefined}
            locked={lang.comingSoon === true && !canOpenComingSoon}
            disabled={lang.comingSoon === true && !canOpenComingSoon}
          />
        ))}
      </ul>
    </>
  )

  return (
    <div className="cq-stack">
      <div className="cq-home-head">
        <h1 className="cq-title">Home</h1>
        {activeCourse ? (
          <div className="cq-course-switch" role="group" aria-label="Your course">
            {displayRootIndex.languages.map((lang) => {
              const soon = lang.comingSoon === true && !canOpenComingSoon
              const current = lang.id === activeCourse.id
              return (
                <button
                  key={lang.id}
                  type="button"
                  className={`cq-course-switch-btn${current ? ' cq-course-switch-btn--current' : ''}`}
                  aria-pressed={current}
                  disabled={soon}
                  title={soon ? `${lang.title}: coming soon` : undefined}
                  onClick={() => onSelectCourse?.(lang.id)}
                >
                  {lang.title}
                  {soon ? (
                    <>
                      <Lock size={12} aria-hidden />
                      <span className="cq-sr-only">, coming soon</span>
                    </>
                  ) : null}
                </button>
              )
            })}
          </div>
        ) : null}
      </div>
      {activeCourse ? (
        <button
          type="button"
          className="cq-link-btn cq-course-sections-link"
          onClick={() => onOpenLanguage(activeCourse.path, activeCourse.id)}
        >
          See all {activeCourse.title} quests
          <ChevronRight size={15} aria-hidden />
        </button>
      ) : null}
      {activeCourse ? null : courseList}
      <div className="cq-panel cq-home-panel">
        <button
          type="button"
          className="cq-btn cq-btn--primary cq-continue-btn"
          onClick={onContinue}
          disabled={!continueTarget}
        >
          <Compass size={16} aria-hidden />
          {hasStarted ? 'Continue your Quest' : 'Start your Quest'}
        </button>
        <div className="cq-home-kpis">
          <div className="cq-kpi">
            <div className="cq-kpi-label">
              <Zap size={14} />
              XP
            </div>
            {/* Levels count from 1, so a new learner starts at Level 1. */}
            <div className="cq-kpi-value">Level {xpLevel + 1}</div>
            <div
              className="cq-progress-bar"
              role="progressbar"
              aria-label={`XP towards level ${xpLevel + 2}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={xpCurrentLevel}
            >
              <div className="cq-progress-bar-fill" style={{ width: `${xpCurrentLevel}%` }} />
            </div>
            <div className="cq-kpi-muted">
              {xpCurrentLevel}/100 · {totalXp} total XP
            </div>
          </div>
          <div className="cq-kpi">
            <div className="cq-kpi-label">
              <Flame size={14} />
              Daily streak
            </div>
            <div className="cq-kpi-value">
              {streakCount} day{streakCount === 1 ? '' : 's'}
            </div>
            <div className={`cq-kpi-muted${streak.atRisk ? ' cq-streak-at-risk' : ''}`}>{streakHint}</div>
            {streakCount > 0 ? (
              <div className="cq-kpi-muted cq-streak-freezes">
                <Snowflake size={13} aria-hidden />
                {streak.freezes > 0
                  ? `${streak.freezes} streak freeze${streak.freezes === 1 ? '' : 's'}: covers a missed day`
                  : `Earn a streak freeze at ${nextFreezeAt} days`}
              </div>
            ) : null}
            <button type="button" className="cq-link-btn cq-reminder-btn" onClick={() => setReminderOpen(true)}>
              <BellRing size={14} aria-hidden />
              Set a daily reminder
            </button>
          </div>
        </div>
      </div>
      {review}
      {badges}
      {reminderOpen ? <ReminderSheet appUrl={appUrl} onClose={() => setReminderOpen(false)} /> : null}
    </div>
  )
}
