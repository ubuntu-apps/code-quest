import { Award } from 'lucide-react'

/** Short pop-up notices at the bottom of the screen: XP and badges earned, and sharing results. */
export function Notices({
  xpToast,
  badgeToast,
  shareNotice,
}: {
  xpToast: { text: string; key: number } | null
  badgeToast: { text: string; key: number } | null
  shareNotice: string | null
}) {
  return (
    <>
      {/* Notices appear and go, which screen readers can miss, so a region that is always
          there reads them out. */}
      <p className="cq-sr-only" role="status">
        {[xpToast?.text, badgeToast?.text, shareNotice].filter(Boolean).join(' ')}
      </p>

      {xpToast ? (
        <p key={xpToast.key} className="cq-share-notice cq-xp-toast" aria-hidden="true">
          {xpToast.text}
        </p>
      ) : null}

      {badgeToast ? (
        <p key={badgeToast.key} className="cq-share-notice cq-badge-toast" aria-hidden="true">
          <Award size={16} aria-hidden />
          {badgeToast.text}
        </p>
      ) : null}

      {shareNotice ? (
        <p className="cq-share-notice" aria-hidden="true">
          {shareNotice}
        </p>
      ) : null}
    </>
  )
}
