import { useEffect, useState } from 'react'
import { Award } from 'lucide-react'
import type { LoadedSection } from '../curriculum/types'
import { isSectionFinished } from './courseCompletion'
import { sectionSubject } from './certificateSubject'
import { CertificateModal } from './CertificateModal'
import { countOnce } from '../../lib/analytics'

interface SectionCertificateNoticeProps {
  languageId: string
  courseTitle: string
  section: LoadedSection
  /** The section's place in the course, from 1. */
  sectionNumber: number
  baseUrl: string
}

/**
 * "Quest complete" with a button for its certificate: on the section's page, and under
 * the quiz that finished it. Shows nothing until the section is finished.
 */
export function SectionCertificateNotice({
  languageId,
  courseTitle,
  section,
  sectionNumber,
  baseUrl,
}: SectionCertificateNoticeProps) {
  const [open, setOpen] = useState(false)
  const finished = isSectionFinished(languageId, section.sectionRef.id, section.file.levels)
  useEffect(() => {
    if (finished) {
      countOnce(
        `section-finished/${languageId}/${section.sectionRef.id}`,
        `Section finished: ${sectionNumber}. ${section.sectionRef.title}`,
      )
    }
  }, [finished, languageId, section.sectionRef.id, section.sectionRef.title, sectionNumber])
  if (!finished) return null

  return (
    <section className="cq-panel cq-certificate-panel">
      <h2 className="cq-subtitle">
        <Award size={18} aria-hidden /> Quest complete
      </h2>
      <p>You finished {section.sectionRef.title}. Your quest certificate is ready.</p>
      <button type="button" className="cq-btn cq-btn--primary" onClick={() => setOpen(true)}>
        Get certificate
      </button>
      {open ? (
        <CertificateModal
          subject={sectionSubject(languageId, courseTitle, section, sectionNumber)}
          baseUrl={baseUrl}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </section>
  )
}
