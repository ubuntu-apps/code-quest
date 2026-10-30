import { useState } from 'react'
import { Award } from 'lucide-react'
import type { LanguageBundle } from '../curriculum/types'
import { isSectionFinished, type CourseCompletion } from './courseCompletion'
import { courseSubject, sectionSubject, type CertificateSubject } from './certificateSubject'
import { CertificateModal } from './CertificateModal'

interface CertificatePanelProps {
  languageId: string
  bundle: LanguageBundle
  completion: CourseCompletion
  baseUrl: string
}

/**
 * Under a course's sections: a certificate for each finished section, and how far the
 * learner is from the course certificate, or, once every section is finished, a button
 * to open it.
 */
export function CertificatePanel({ languageId, bundle, completion, baseUrl }: CertificatePanelProps) {
  const [open, setOpen] = useState<CertificateSubject | null>(null)
  const courseTitle = bundle.index.title

  // In course order, numbered as on the section cards.
  const finishedSections = bundle.index.sections.flatMap((ref, index) => {
    const loaded = bundle.sections.find((s) => s.sectionRef.id === ref.id)
    return loaded && isSectionFinished(languageId, ref.id, loaded.file.levels) ? [{ loaded, number: index + 1 }] : []
  })

  return (
    <>
      {completion.complete ? (
        <section className="cq-panel cq-certificate-panel">
          <h2 className="cq-subtitle">
            <Award size={18} aria-hidden /> Course complete
          </h2>
          <p>You finished every quest of {courseTitle}. Your certificate is ready.</p>
          <button
            type="button"
            className="cq-btn cq-btn--primary"
            onClick={() => setOpen(courseSubject(languageId, courseTitle, completion))}
          >
            View certificate
          </button>
        </section>
      ) : (
        <p className="cq-muted cq-certificate-hint">
          <Award size={16} aria-hidden />
          {completion.sectionsTotal === 1
            ? `Finish the quest to earn your ${courseTitle} certificate.`
            : `Finish all ${completion.sectionsTotal} quests to earn your ${courseTitle} certificate (${completion.sectionsFinished} done so far).`}
        </p>
      )}

      {finishedSections.length > 0 ? (
        <section className="cq-panel cq-section-certificates" aria-labelledby="cq-section-certificates-title">
          <h2 className="cq-subtitle" id="cq-section-certificates-title">
            <Award size={18} aria-hidden /> Quest certificates
          </h2>
          <p className="cq-muted">One for each quest you finish. Open one to print it or save it as an image.</p>
          <ul className="cq-section-certificate-list">
            {finishedSections.map(({ loaded, number }) => (
              <li key={loaded.sectionRef.id}>
                <button
                  type="button"
                  className="cq-btn"
                  onClick={() => setOpen(sectionSubject(languageId, courseTitle, loaded, number))}
                >
                  <span className="cq-section-certificate-num" aria-hidden>
                    {number}
                  </span>
                  {loaded.sectionRef.title}
                  <span className="cq-sr-only"> certificate (quest {number})</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {open ? <CertificateModal subject={open} baseUrl={baseUrl} onClose={() => setOpen(null)} /> : null}
    </>
  )
}
