import { useState } from 'react'
import { Award } from 'lucide-react'
import type { CourseCompletion } from './courseCompletion'
import { CertificateModal } from './CertificateModal'

interface CertificatePanelProps {
  languageId: string
  courseTitle: string
  completion: CourseCompletion
  baseUrl: string
}

/**
 * Under a course's sections: how far the learner is from the certificate, or, once
 * every section is finished, a button to open it.
 */
export function CertificatePanel({ languageId, courseTitle, completion, baseUrl }: CertificatePanelProps) {
  const [open, setOpen] = useState(false)

  if (!completion.complete) {
    return (
      <p className="cq-muted cq-certificate-hint">
        <Award size={16} aria-hidden />
        Finish all {completion.sectionsTotal} sections to earn your {courseTitle} certificate (
        {completion.sectionsFinished} done so far).
      </p>
    )
  }

  return (
    <section className="cq-panel cq-certificate-panel">
      <h2 className="cq-subtitle">
        <Award size={18} aria-hidden /> Course complete
      </h2>
      <p>You finished every section of {courseTitle}. Your certificate is ready.</p>
      <button type="button" className="cq-btn cq-btn--primary" onClick={() => setOpen(true)}>
        View certificate
      </button>
      {open ? (
        <CertificateModal
          languageId={languageId}
          courseTitle={courseTitle}
          completion={completion}
          baseUrl={baseUrl}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </section>
  )
}
