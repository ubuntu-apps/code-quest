/** Short pop-up notices at the bottom of the screen: XP earned, and sharing results. */
export function Notices({
  xpToast,
  shareNotice,
}: {
  xpToast: { text: string; key: number } | null
  shareNotice: string | null
}) {
  return (
    <>
      {/* Notices appear and go, which screen readers can miss, so a region that is always
          there reads them out. */}
      <p className="cq-sr-only" role="status">
        {[xpToast?.text, shareNotice].filter(Boolean).join(' ')}
      </p>

      {xpToast ? (
        <p key={xpToast.key} className="cq-share-notice cq-xp-toast" aria-hidden="true">
          {xpToast.text}
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
