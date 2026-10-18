import { forwardRef } from 'react'

export const CERTIFICATE_WIDTH = 1100
export const CERTIFICATE_HEIGHT = 780

interface CertificateArtProps {
  name: string
  courseTitle: string
  sections: number
  lessons: number
  xp: number
  earnedOn: Date
  /** Where the course was taken, e.g. "ubuntu-apps.github.io/code-quest". */
  siteLabel: string
  supporter: boolean
}

/** Paper colours: the certificate looks the same in light and dark themes, and on paper. */
const PAPER = '#fffdf7'
const INK = '#1e293b'
const MUTED = '#64748b'
const ACCENT = '#0369a1'
const GOLD = '#a16207'
const GOLD_LIGHT = '#e9c46a'

const SERIF = "Georgia, 'Times New Roman', serif"
const SANS = "system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

/**
 * The course certificate as an SVG, used for the preview, the downloaded image and
 * printing. The supporter edition has a gold frame and a supporter seal.
 */
export const CertificateArt = forwardRef<SVGSVGElement, CertificateArtProps>(function CertificateArt(
  { name, courseTitle, sections, lessons, xp, earnedOn, siteLabel, supporter },
  ref,
) {
  const frame = supporter ? GOLD : ACCENT
  const shownName = name.trim() || 'Your name'
  // Long names are squeezed to fit between the margins rather than running off the page.
  const nameFits = shownName.length <= 26
  const date = earnedOn.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
  const cx = CERTIFICATE_WIDTH / 2

  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      className="cq-certificate-art"
      width={CERTIFICATE_WIDTH}
      height={CERTIFICATE_HEIGHT}
      viewBox={`0 0 ${CERTIFICATE_WIDTH} ${CERTIFICATE_HEIGHT}`}
      role="img"
      aria-label={`Certificate: ${shownName} completed the ${courseTitle} course on CodeQuest, ${date}.`}
    >
      <rect width={CERTIFICATE_WIDTH} height={CERTIFICATE_HEIGHT} fill={PAPER} />
      <rect x={24} y={24} width={CERTIFICATE_WIDTH - 48} height={CERTIFICATE_HEIGHT - 48} fill="none" stroke={frame} strokeWidth={supporter ? 6 : 3} />
      <rect x={40} y={40} width={CERTIFICATE_WIDTH - 80} height={CERTIFICATE_HEIGHT - 80} fill="none" stroke={supporter ? GOLD_LIGHT : frame} strokeWidth={supporter ? 2 : 1} />

      <text x={cx} y={112} textAnchor="middle" fill={frame} fontFamily={SANS} fontSize={20} fontWeight={700} letterSpacing={6}>
        CODEQUEST
      </text>
      <text x={cx} y={188} textAnchor="middle" fill={INK} fontFamily={SERIF} fontSize={48}>
        Certificate of Completion
      </text>
      <text x={cx} y={258} textAnchor="middle" fill={MUTED} fontFamily={SANS} fontSize={20}>
        This certifies that
      </text>
      <text
        x={cx}
        y={340}
        textAnchor="middle"
        fill={name.trim() ? INK : '#cbd5e1'}
        fontFamily={SERIF}
        fontStyle="italic"
        fontSize={56}
        {...(nameFits ? {} : { textLength: 720, lengthAdjust: 'spacingAndGlyphs' })}
      >
        {shownName}
      </text>
      <line x1={230} y1={366} x2={CERTIFICATE_WIDTH - 230} y2={366} stroke={MUTED} strokeWidth={1} />
      <text x={cx} y={420} textAnchor="middle" fill={INK} fontFamily={SANS} fontSize={22}>
        has completed the {courseTitle} course on CodeQuest
      </text>
      <text x={cx} y={460} textAnchor="middle" fill={MUTED} fontFamily={SANS} fontSize={18}>
        {sections} sections · {lessons} lessons · {xp} XP
      </text>

      {/* Seal */}
      <g transform={`translate(${cx} 600)`}>
        <circle r={64} fill={supporter ? GOLD_LIGHT : '#e0f2fe'} stroke={frame} strokeWidth={3} />
        <circle r={54} fill="none" stroke={frame} strokeWidth={1} strokeDasharray="3 4" />
        {supporter ? (
          <>
            <path
              d="M0 -30 L8.8 -12.1 L28.5 -9.3 L14.3 4.6 L17.6 24.3 L0 15 L-17.6 24.3 L-14.3 4.6 L-28.5 -9.3 L-8.8 -12.1 Z"
              fill={GOLD}
              transform="translate(0 -6) scale(0.8)"
            />
            <text y={34} textAnchor="middle" fill={GOLD} fontFamily={SANS} fontSize={12} fontWeight={700} letterSpacing={2}>
              SUPPORTER
            </text>
          </>
        ) : (
          <text y={11} textAnchor="middle" fill={ACCENT} fontFamily={SERIF} fontSize={32} fontWeight={700}>
            CQ
          </text>
        )}
      </g>

      <text x={150} y={632} fill={INK} fontFamily={SANS} fontSize={20}>
        {date}
      </text>
      <line x1={150} y1={646} x2={390} y2={646} stroke={MUTED} strokeWidth={1} />
      <text x={150} y={670} fill={MUTED} fontFamily={SANS} fontSize={14}>
        Date
      </text>

      <text x={CERTIFICATE_WIDTH - 150} y={632} textAnchor="end" fill={INK} fontFamily={SANS} fontSize={20}>
        {siteLabel}
      </text>
      <line x1={CERTIFICATE_WIDTH - 390} y1={646} x2={CERTIFICATE_WIDTH - 150} y2={646} stroke={MUTED} strokeWidth={1} />
      <text x={CERTIFICATE_WIDTH - 150} y={670} textAnchor="end" fill={MUTED} fontFamily={SANS} fontSize={14}>
        Website
      </text>

      {supporter ? (
        <text x={cx} y={724} textAnchor="middle" fill={GOLD} fontFamily={SANS} fontSize={14}>
          Supporter edition · thank you for helping keep CodeQuest free
        </text>
      ) : null}
    </svg>
  )
})
