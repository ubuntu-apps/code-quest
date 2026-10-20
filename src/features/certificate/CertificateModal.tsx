import { useEffect, useId, useRef, useState } from 'react'
import { Download, Printer, X } from 'lucide-react'
import { CertificateArt } from './CertificateArt'
import { certificateFilename, printCertificate, saveCertificate, siteLabel } from './certificateImage'
import { certificateEarnedOn, loadCertificateName, saveCertificateName } from './certificateStorage'
import { subjectTitle, type CertificateSubject } from './certificateSubject'
import { SUPPORT_CONFIG } from '../support/supportConfig'
import { SupporterCodeForm } from '../support/SupporterCodeForm'
import { useIsSupporter } from '../support/supporterStorage'

interface CertificateModalProps {
  subject: CertificateSubject
  baseUrl: string
  onClose: () => void
}

/** A course or section certificate: type a name, then save it as an image or print it. */
export function CertificateModal({ subject, baseUrl, onClose }: CertificateModalProps) {
  const titleId = useId()
  const nameId = useId()
  const svgRef = useRef<SVGSVGElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(loadCertificateName)
  const [earnedOn] = useState(() => certificateEarnedOn(subject.earnedKey))
  const supporter = useIsSupporter()
  const [edition, setEdition] = useState<'standard' | 'supporter'>('supporter')
  const showSupporterEdition = supporter && edition === 'supporter'
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveNote, setSaveNote] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const nameMissing = name.trim() === ''

  useEffect(() => {
    nameRef.current?.focus()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const save = async () => {
    if (!svgRef.current || saving) return
    setSaveError(null)
    setSaveNote(null)
    setSaving(true)
    try {
      const result = await saveCertificate(svgRef.current, certificateFilename(subject))
      if (result.kind === 'saved') setSaveNote(`Saved as "${result.filename}".`)
      else if (result.kind === 'downloaded') setSaveNote(`Downloaded as "${result.filename}" (usually to your Downloads folder).`)
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'Could not save the certificate.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="cq-modal-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="cq-certificate-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="cq-share-sheet-header">
          <h2 id={titleId} className="cq-share-sheet-title">
            Your {subjectTitle(subject)} certificate
          </h2>
          <button type="button" className="cq-icon-btn" aria-label="Close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <label className="cq-label" htmlFor={nameId}>
          Name on the certificate
        </label>
        <input
          ref={nameRef}
          id={nameId}
          className="cq-text-input"
          value={name}
          maxLength={60}
          autoComplete="name"
          onChange={(e) => {
            setName(e.target.value)
            saveCertificateName(e.target.value)
          }}
        />

        {supporter ? (
          <div className="cq-segmented cq-certificate-edition" role="radiogroup" aria-label="Edition">
            {(['supporter', 'standard'] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={edition === value}
                className={`cq-segmented-btn${edition === value ? ' cq-segmented-btn--active' : ''}`}
                onClick={() => setEdition(value)}
              >
                {value === 'supporter' ? 'Supporter edition' : 'Standard'}
              </button>
            ))}
          </div>
        ) : null}

        <div className="cq-certificate-preview">
          <CertificateArt
            ref={svgRef}
            name={name}
            subject={subject}
            earnedOn={earnedOn}
            siteLabel={siteLabel(baseUrl)}
            supporter={showSupporterEdition}
          />
        </div>

        <div className="cq-row cq-certificate-actions">
          <button
            type="button"
            className="cq-btn cq-btn--primary"
            disabled={nameMissing || saving}
            onClick={() => void save()}
          >
            <Download size={16} aria-hidden />
            {saving ? 'Saving…' : 'Save as PDF'}
          </button>
          <button type="button" className="cq-btn" disabled={nameMissing} onClick={printCertificate}>
            <Printer size={16} aria-hidden />
            Print
          </button>
          {nameMissing ? <span className="cq-muted">Type your name first.</span> : null}
        </div>
        <p className="cq-muted cq-certificate-save-note" role="status">
          {saveNote}
        </p>
        {saveError ? (
          <p className="cq-error" role="alert">
            {saveError}
          </p>
        ) : null}

        {!supporter && SUPPORT_CONFIG.supporterEditionUrl ? (
          <div className="cq-certificate-upsell">
            <p>
              <strong>Supporter edition:</strong> the same certificate with a gold frame and a supporter
              seal. Pay what you want; it helps keep CodeQuest free and ad-free.
            </p>
            <a
              className="cq-btn"
              href={SUPPORT_CONFIG.supporterEditionUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Get the supporter edition
            </a>
            <details className="cq-certificate-code">
              <summary>Already paid? Enter your code</summary>
              <SupporterCodeForm />
            </details>
          </div>
        ) : null}
      </div>
    </div>
  )
}
