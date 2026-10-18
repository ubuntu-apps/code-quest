import { useState } from 'react'
import { hasDonationLinks } from './supportConfig'
import { SupportLinks } from './SupportLinks'
import { loadNudgeSeen, saveNudgeSeen, useIsSupporter } from './supporterStorage'

interface SupportNudgeProps {
  languageId: string
  /** Sections of this course the learner has finished. */
  sectionsFinished: number
  /** The section to congratulate them on. */
  finishedTitle: string | null
}

/**
 * A short "if this helped, you can chip in" note on the course page, shown once each
 * time another section is finished. Never shown to supporters or before setup.
 */
export function SupportNudge({ languageId, sectionsFinished, finishedTitle }: SupportNudgeProps) {
  const supporter = useIsSupporter()
  const [seen, setSeen] = useState(() => loadNudgeSeen(languageId))

  if (!hasDonationLinks() || supporter || !finishedTitle || sectionsFinished <= seen) return null

  const dismiss = () => {
    saveNudgeSeen(languageId, sectionsFinished)
    setSeen(sectionsFinished)
  }

  return (
    <section className="cq-panel cq-support-nudge" aria-label="Support CodeQuest">
      <p>
        <strong>You finished {finishedTitle}!</strong> CodeQuest is free and has no ads. If it&apos;s
        helping you, you can chip in to keep it going and pay for new courses.
      </p>
      <div className="cq-row">
        {/* Choosing a link counts as answering, so the note doesn't come back for this section. */}
        <SupportLinks primary onChoose={dismiss} />
        <button type="button" className="cq-btn" onClick={dismiss}>
          Not now
        </button>
      </div>
    </section>
  )
}
